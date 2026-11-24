'use client';
/**
 * Chỉnh sửa website: trang thật (đúng component công khai, hiển thị BẢN NHÁP) gần như toàn màn hình.
 * Trình chỉnh trong trang: components/site/cms-editor.ts (nhấn giữ để chọn, sửa chữ tại chỗ, đổi ảnh, sửa nút, chọn khối).
 * Màn này giữ dữ liệu: nhận thay đổi theo khóa (lib/cms-paths.ts) → cập nhật bản nháp đang soạn của admin,
 * hoàn tác / làm lại trong phiên, Lưu nháp / Xuất bản qua đúng luồng lưu hiện có (API kiểm tra quyền + chống ghi đè).
 * Bộ chọn trang (tìm kiếm + lọc loại), đi theo liên kết nội bộ trong chế độ Xem, ngăn thiết lập trang / website / menu / landing page.
 */
import { ArrowLeft, Blocks, Check, ChevronDown, Eye, FileCog, ImagePlus, Loader2, Monitor, PenLine, Redo2, Rocket, Save, Search, Settings2, Smartphone, Tablet, Undo2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { SiteData } from '@/lib/content';
import { cmsLimit, readCms, writeCms, writeTextStyle } from '@/lib/cms-paths';
import type { TextStyle } from '@/lib/text-styles';
import { Button, Modal, Tip } from './kit';

type Mode = 'view' | 'edit';
type SaveMode = 'draft' | 'publish';
export type EditorPage = { path: string; label: string; type: string; note?: string };
export type EditorPanel = { title: string; scope?: 'global' | 'page' | 'record'; scopeLabel?: string; body: ReactNode };
const DEVICES = [
  { id: 'desktop', label: 'Máy tính', width: '100%', Icon: Monitor },
  { id: 'tablet', label: 'Máy tính bảng', width: '820px', Icon: Tablet },
  { id: 'mobile', label: 'Điện thoại', width: '390px', Icon: Smartphone }
] as const;
const HISTORY = 100;
const SHOW = 40;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

export function LiveEditor({ path, onPathChange, pages, panel, onPanel, renderPanel, draft, setDraft, onSave, saving, dirty, hasDraft, error, canEdit, canPublish, onExit }: {
  path: string;
  onPathChange: (path: string) => void;
  pages: EditorPage[];
  panel: string;
  onPanel: (panel: string) => void;
  renderPanel: (panel: string, path: string) => EditorPanel | null;
  draft: SiteData;
  setDraft: Dispatch<SetStateAction<SiteData>>;
  onSave: (mode: SaveMode) => Promise<void>;
  saving: boolean; dirty: boolean; hasDraft: boolean; error: string;
  canEdit: boolean; canPublish: boolean;
  onExit: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [mode, setModeState] = useState<Mode>('view');
  const [device, setDevice] = useState<(typeof DEVICES)[number]['id']>('desktop');
  const [paths, setPaths] = useState<string[]>([]);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [picker, setPicker] = useState<{ base: string; label: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [pending, setPending] = useState<{ kind: 'page'; path: string } | { kind: 'exit' } | null>(null);
  const [src, setSrc] = useState(`${path}?cms=1`);
  const framePath = useRef(path);
  const [, force] = useState(0);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const undo = useRef<SiteData[]>([]);
  const redo = useRef<SiteData[]>([]);
  const before = useRef<SiteData | null>(null);
  const styleBefore = useRef<SiteData | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const current = pages.find(p => p.path === path);
  const title = current?.label || 'Trang';

  /* Đổi trang từ bộ chọn / URL → nạp lại khung; trang tự điều hướng (chế độ Xem) đã cập nhật framePath trước */
  useEffect(() => {
    if (path === framePath.current) return;
    framePath.current = path;
    setLoaded(false);
    setSrc(`${path}?cms=1`);
  }, [path]);

  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    frame.current?.contentWindow?.postMessage({ type: `danava-cms:${type}`, ...payload }, location.origin);
  }, []);
  const valuesOf = useCallback((d: SiteData, list: string[]) => Object.fromEntries(list.map(p => [p, readCms(d, p)])), []);
  const pathsRef = useRef<string[]>([]);
  /** Đặt bản nháp + đồng bộ NGAY xuống trang (hoàn tác, làm lại, đổi ảnh, hủy): không chờ vòng render. */
  const replaceDraft = useCallback((d: SiteData) => {
    draftRef.current = d;
    setDraft(d);
    if (pathsRef.current.length) send('values', { values: valuesOf(d, pathsRef.current) });
    send('styles', { styles: d.textStyles || {} });
  }, [send, setDraft, valuesOf]);

  /* Đổi khung xem (máy tính / máy tính bảng / điện thoại) → báo trang cập nhật bảng kiểu chữ theo thiết bị */
  useEffect(() => { const id = setTimeout(() => send('device-changed'), 80); return () => clearTimeout(id); }, [device, send]);

  const setMode = (m: Mode) => { if (m === 'edit' && !canEdit) return; setModeState(m); send('mode', { mode: m }); };

  /* Đồng bộ giá trị xuống trang mỗi khi bản nháp đổi; trang bỏ qua phần đang gõ */
  useEffect(() => {
    if (!paths.length) return;
    const t = setTimeout(() => { send('values', { values: valuesOf(draft, paths) }); send('styles', { styles: draft.textStyles || {} }); }, 40);
    return () => clearTimeout(t);
  }, [draft, paths, send, valuesOf]);

  /** Ghi một giá trị theo khóa; lỗi → báo ngay trên thanh công cụ trong trang, không ghi. */
  const apply = useCallback((p: string, value: string) => {
    try {
      const next = writeCms(draftRef.current, p, value);
      draftRef.current = next;
      setDraft(next);
      send('clear-error');
      return true;
    } catch (e) {
      send('error', { message: e instanceof Error ? e.message : 'Giá trị không hợp lệ' });
      return false;
    }
  }, [send, setDraft]);

  /** Màu / cỡ chữ của một phần chữ (bảng Kiểu chữ trong trang); lỗi → báo trên trang, không ghi. */
  const applyStyle = useCallback((p: string, style: TextStyle | null) => {
    try {
      const next = writeTextStyle(draftRef.current, p, style);
      draftRef.current = next;
      setDraft(next);
      send('clear-error');
    } catch (e) {
      send('error', { message: e instanceof Error ? e.message : 'Kiểu chữ không hợp lệ' });
      send('styles', { styles: draftRef.current.textStyles || {} });
    }
  }, [send, setDraft]);

  const pushHistory = (snapshot: SiteData) => {
    if (JSON.stringify(snapshot) === JSON.stringify(draftRef.current)) return;
    undo.current = [...undo.current.slice(-(HISTORY - 1)), snapshot];
    redo.current = [];
    force(n => n + 1);
  };
  const doUndo = useCallback(() => {
    const prev = undo.current.pop();
    if (!prev) return;
    redo.current.push(draftRef.current);
    replaceDraft(prev);
    force(n => n + 1);
  }, [replaceDraft]);
  const doRedo = useCallback(() => {
    const next = redo.current.pop();
    if (!next) return;
    undo.current.push(draftRef.current);
    replaceDraft(next);
    force(n => n + 1);
  }, [replaceDraft]);
  const save = useCallback((m: SaveMode) => { send('deselect'); return onSave(m); }, [onSave, send]);

  /** Đổi trang: có thay đổi chưa lưu → hỏi (lưu nháp rồi chuyển / chuyển và giữ thay đổi trong phiên / ở lại). */
  const goTo = (p: string) => {
    setChoosing(false);
    if (p === path) return;
    if (dirty && canEdit) { setPending({ kind: 'page', path: p }); return; }
    onPathChange(p);
  };
  const exit = () => { if (dirty && canEdit) setPending({ kind: 'exit' }); else onExit(); };

  /* Tin nhắn từ trang (chỉ cùng nguồn, chỉ từ đúng khung) */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      const d = e.data || {};
      switch (d.type) {
        case 'danava-cms:ready': {
          const list: string[] = Array.isArray(d.paths) ? d.paths.map(String) : [];
          setPaths(list);
          pathsRef.current = list;
          setPageImages(Array.isArray(d.images) ? d.images.map(String) : []);
          setSelected('');
          setLoaded(true);
          // Trang tự chuyển (người dùng bấm menu / liên kết trong chế độ Xem) → nhận diện trang mới, giữ trình biên tập
          const at = typeof d.path === 'string' ? d.path : '';
          if (at && at !== framePath.current) { framePath.current = at; onPathChange(at); }
          send('init', { mode: modeRef.current, canEdit, limits: Object.fromEntries(list.map(p => [p, cmsLimit(p)])), values: valuesOf(draftRef.current, list), styles: draftRef.current.textStyles || {} });
          if (dirty) send('toast', { message: 'Các thay đổi chưa lưu vẫn được giữ trong phiên này.' });
          break;
        }
        case 'danava-cms:mode': setModeState(d.mode === 'edit' ? 'edit' : 'view'); break;
        case 'danava-cms:select': setSelected(String(d.label || '')); break;
        case 'danava-cms:begin': before.current = draftRef.current; break;
        case 'danava-cms:change': if (canEdit) apply(String(d.path), String(d.value ?? '')); break;
        case 'danava-cms:commit': if (before.current) pushHistory(before.current); before.current = null; break;
        case 'danava-cms:cancel': if (before.current) replaceDraft(before.current); before.current = null; break;
        case 'danava-cms:style-begin': styleBefore.current = draftRef.current; break;
        case 'danava-cms:style': if (canEdit && typeof d.path === 'string') applyStyle(d.path, d.style && typeof d.style === 'object' ? d.style as TextStyle : null); break;
        case 'danava-cms:style-commit': if (styleBefore.current) pushHistory(styleBefore.current); styleBefore.current = null; break;
        case 'danava-cms:device': if (d.device === 'mobile' || d.device === 'desktop') setDevice(d.device); break;
        case 'danava-cms:pick-image': if (canEdit) setPicker({ base: String(d.base), label: String(d.label || 'Ảnh') }); break;
        case 'danava-cms:open-panel': onPanel(String(d.panel || '')); break;
        case 'danava-cms:key':
          if (d.key === 'undo') doUndo();
          if (d.key === 'redo') doRedo();
          if (d.key === 'save' && canEdit) void save('draft');
          break;
      }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  });

  /* Phím tắt khi đang ở khung admin (ngoài trang) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || (e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable]')) return;
      const k = e.key.toLowerCase();
      if (k === 'z') { e.preventDefault(); e.stopPropagation(); if (e.shiftKey) doRedo(); else doUndo(); }
      if (k === 'y') { e.preventDefault(); e.stopPropagation(); doRedo(); }
      if (k === 'k' && e.shiftKey) { e.preventDefault(); setChoosing(true); }
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  }, [doUndo, doRedo]);

  /** Xem trước bản nháp đã lưu ở tab mới (máy chủ hiển thị bản nháp cho người đã đăng nhập). Có thay đổi → lưu nháp trước. */
  async function preview() {
    const w = window.open('about:blank', '_blank');
    if (dirty && canEdit) await onSave('draft');
    if (w) w.location.href = `${path}?cms=1`;
  }

  const status = error ? { cls: 'is-error', text: `Chưa lưu được: ${/fetch|network|mạng/i.test(error) ? 'mất kết nối, thử lại' : error}` }
    : saving ? { cls: 'is-saving', text: 'Đang lưu…' }
      : dirty ? { cls: 'is-dirty', text: 'Chưa lưu' }
        : hasDraft ? { cls: 'is-draft', text: 'Đã lưu nháp' } : { cls: 'is-live', text: 'Đã xuất bản' };
  const landing = /^\/lp\/[^/]+\/$/.test(path);
  const drawer = panel ? renderPanel(panel, path) : null;

  return (
    <div className="lv ax-scope" role="region" aria-label={`Chỉnh sửa website: ${title}`}>
      <header className="lv-bar">
        <div className="lv-bar__left">
          <Tip side="bottom" label="Thoát trình biên tập"><button type="button" className="ax-icon-btn" onClick={exit} aria-label="Thoát trình biên tập"><ArrowLeft size={18} /></button></Tip>
          <button type="button" className="lv-page" onClick={() => setChoosing(true)} aria-haspopup="dialog" aria-label={`Trang đang chỉnh: ${title} (${path}). Bấm để chọn trang khác`}>
            <span className="lv-page__text"><b>{title}</b><small>{selected ? `Đang chọn: ${selected}` : path}</small></span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="lv-bar__mid">
          <span className={`lv-status lv-status--sm ${status.cls}`} aria-hidden="true">{status.text}</span>
          <div className="lv-seg" role="radiogroup" aria-label="Chế độ">
            <button type="button" role="radio" aria-checked={mode === 'view'} className={mode === 'view' ? 'is-on' : ''} onClick={() => setMode('view')}><Eye size={15} /><span>Xem</span></button>
            {canEdit && <button type="button" role="radio" aria-checked={mode === 'edit'} className={mode === 'edit' ? 'is-on' : ''} onClick={() => setMode('edit')}><PenLine size={15} /><span>Chỉnh sửa</span></button>}
          </div>
          <div className="lv-seg lv-seg--icons" role="radiogroup" aria-label="Thiết bị">
            {DEVICES.map(d => (
              <Tip key={d.id} side="bottom" label={d.label}><button type="button" role="radio" aria-checked={device === d.id} aria-label={d.label} className={device === d.id ? 'is-on' : ''} onClick={() => setDevice(d.id)}><d.Icon size={15} /></button></Tip>
            ))}
          </div>
        </div>
        <div className="lv-bar__right">
          <span className={`lv-status ${status.cls}`} role="status" aria-live="polite">{saving && <Loader2 size={13} className="lv-spin" />}{status.text}</span>
          {canEdit && <>
            <Tip side="bottom" label="Hoàn tác (Ctrl+Z)"><button type="button" className="ax-icon-btn" onClick={doUndo} disabled={!undo.current.length} aria-label="Hoàn tác"><Undo2 size={17} /></button></Tip>
            <Tip side="bottom" label="Làm lại (Ctrl+Shift+Z)"><button type="button" className="ax-icon-btn lv-hide-xs" onClick={doRedo} disabled={!redo.current.length} aria-label="Làm lại"><Redo2 size={17} /></button></Tip>
          </>}
          {landing && canEdit && <Tip side="bottom" label="Thêm khối / sửa bố cục landing page"><button type="button" className="ax-icon-btn" onClick={() => onPanel('landing-edit')} aria-label="Thêm khối"><Blocks size={17} /></button></Tip>}
          <Tip side="bottom" label="Thiết lập trang (nội dung khác, SEO)"><button type="button" className="ax-icon-btn" onClick={() => onPanel('page')} aria-label="Thiết lập trang"><FileCog size={17} /></button></Tip>
          <Tip side="bottom" label="Thiết lập website (menu, chân trang, liên hệ, widget)"><button type="button" className="ax-icon-btn" onClick={() => onPanel('site')} aria-label="Thiết lập website"><Settings2 size={17} /></button></Tip>
          <Tip side="bottom" label="Xem trước bản nháp ở tab mới"><button type="button" className="ax-icon-btn lv-hide-xs" onClick={preview} aria-label="Xem trước bản nháp"><Eye size={17} /></button></Tip>
          {canEdit && <Button variant="secondary" size="sm" onClick={() => void save('draft')} disabled={!dirty || saving}><Save size={15} /><span className="lv-hide-sm">Lưu nháp</span></Button>}
          {canPublish && <Button variant="primary" size="sm" onClick={() => void save('publish')} disabled={(!dirty && !hasDraft) || saving}>{dirty || hasDraft ? <Rocket size={15} /> : <Check size={15} />}<span className="lv-hide-sm">Xuất bản</span></Button>}
        </div>
      </header>

      <div className={`lv-body${drawer ? ' has-drawer' : ''}`}>
        <div className={`lv-stage is-${device}`}>
          {!loaded && <div className="lv-loading"><Loader2 size={18} className="lv-spin" /> Đang mở trang…</div>}
          <iframe ref={frame} title={`Trang ${title} (trình biên tập)`} src={src} style={{ width: DEVICES.find(d => d.id === device)!.width }}
            onLoad={() => setLoaded(true)} />
        </div>
        {drawer && (
          <aside className="lv-drawer" role="dialog" aria-modal="false" aria-label={drawer.title} onKeyDown={e => { if (e.key === 'Escape' && !(e.target as HTMLElement).closest('input, textarea, select')) onPanel(''); }}>
            <div className="lv-drawer__head">
              <div>
                <b>{drawer.title}</b>
                {drawer.scope === 'global' && <span className="lv-scope is-global">Áp dụng toàn website</span>}
                {drawer.scope === 'page' && <span className="lv-scope">Chỉ trang {title}</span>}
                {drawer.scope === 'record' && <span className="lv-scope">{drawer.scopeLabel || 'Hồ sơ dùng chung'}</span>}
              </div>
              <button type="button" className="ax-icon-btn" onClick={() => onPanel('')} aria-label="Đóng ngăn thiết lập" autoFocus><X size={18} /></button>
            </div>
            <div className="lv-drawer__body">{drawer.body}</div>
          </aside>
        )}
      </div>

      {choosing && <PagePicker pages={pages} current={path} onPick={goTo} onClose={() => setChoosing(false)}
        actions={canEdit ? [
          { label: 'Quản lý landing page & liên kết ngoài', onClick: () => { setChoosing(false); onPanel('landings'); } },
          { label: 'Mẫu & khối', onClick: () => { setChoosing(false); onPanel('blocks'); } }
        ] : []} />}

      {pending && (
        <Modal open onOpenChange={o => { if (!o) setPending(null); }} size="sm"
          title={pending.kind === 'exit' ? 'Thoát trình biên tập?' : 'Chuyển sang trang khác?'}
          description="Bạn có thay đổi chưa lưu. Lưu nháp để giữ lại sau khi tải lại trang; website công khai chỉ đổi khi Xuất bản."
          footer={<>
            <Button variant="ghost" onClick={() => setPending(null)}>Ở lại</Button>
            {pending.kind === 'page'
              ? <Button variant="secondary" onClick={() => { const p = pending; setPending(null); onPathChange(p.path); }}>Chuyển, giữ thay đổi</Button>
              : <Button variant="secondary" onClick={() => { setPending(null); onExit(); }}>Thoát</Button>}
            <Button variant="primary" loading={saving} onClick={async () => { const p = pending; await save('draft'); setPending(null); if (p.kind === 'page') onPathChange(p.path); else onExit(); }}><Save size={15} /> Lưu nháp rồi {pending.kind === 'exit' ? 'thoát' : 'chuyển'}</Button>
          </>} />
      )}

      {picker && <ImagePicker label={picker.label} current={readCms(draft, `${picker.base}.image`)} pageImages={pageImages}
        onClose={() => setPicker(null)}
        onPick={url => {
          const snapshot = draftRef.current;
          if (apply(`${picker.base}.image`, url)) { pushHistory(snapshot); replaceDraft(draftRef.current); send('toast', { message: 'Đã đổi ảnh. Nhớ Lưu nháp.' }); }
          setPicker(null);
        }} />}
    </div>
  );
}

/** Bộ chọn trang: tìm theo tên/đường dẫn (không dấu cũng được), lọc theo loại; hiển thị tối đa 40 kết quả. */
function PagePicker({ pages, current, onPick, onClose, actions }: { pages: EditorPage[]; current: string; onPick: (path: string) => void; onClose: () => void; actions: { label: string; onClick: () => void }[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const types = useMemo(() => [...new Set(pages.map(p => p.type))], [pages]);
  const found = useMemo(() => {
    const n = norm(q.trim());
    return pages.filter(p => (!type || p.type === type) && (!n || norm(`${p.label} ${p.path}`).includes(n)));
  }, [pages, q, type]);
  return (
    <Modal open onOpenChange={o => { if (!o) onClose(); }} title="Chọn trang để chỉnh" size="lg">
      <div className="lv-picker">
        <label className="lv-picker__search"><Search size={16} aria-hidden="true" />
          <input autoFocus placeholder="Tìm trang, sản phẩm, bài viết, dự án, landing page…" value={q} onChange={e => setQ(e.target.value)} aria-label="Tìm trang"
            onKeyDown={e => { if (e.key === 'Enter' && found[0]) onPick(found[0].path); }} />
        </label>
        <div className="lv-picker__types" role="radiogroup" aria-label="Lọc theo loại">
          {['', ...types].map(t => (
            <button key={t || 'all'} type="button" role="radio" aria-checked={type === t} className={type === t ? 'is-on' : ''} onClick={() => setType(t)}>
              {t || 'Tất cả'} <small>{t ? pages.filter(p => p.type === t).length : pages.length}</small>
            </button>
          ))}
        </div>
        <ul className="lv-picker__list">
          {found.slice(0, SHOW).map(p => (
            <li key={p.path}>
              <button type="button" className={p.path === current ? 'is-on' : ''} aria-current={p.path === current ? 'page' : undefined} onClick={() => onPick(p.path)}>
                <span><b>{p.label}</b><small>{p.path}{p.note ? ` · ${p.note}` : ''}</small></span>
                <em>{p.type}</em>
              </button>
            </li>
          ))}
          {!found.length && <li className="field-note">Không tìm thấy trang phù hợp.</li>}
        </ul>
        {found.length > SHOW && <p className="field-note">Còn {found.length - SHOW} kết quả — gõ thêm để lọc.</p>}
        {actions.length > 0 && <div className="lv-picker__actions">{actions.map(a => <Button key={a.label} variant="ghost" size="sm" onClick={a.onClick}>{a.label}</Button>)}</div>}
      </div>
    </Modal>
  );
}

/** Thư viện ảnh: ảnh đã tải lên + ảnh đang dùng trên trang; tải ảnh mới (máy chủ xóa EXIF, nén WebP). */
function ImagePicker({ label, current, pageImages, onPick, onClose }: { label: string; current: string; pageImages: string[]; onPick: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetch('/api/admin/media/', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(Error('Không tải được thư viện ảnh.'))))
      .then(v => setItems((v.items as { url: string }[]).map(i => i.url)))
      .catch(e => { setItems([]); setMsg(e.message); });
  }, []);
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { setMsg('Ảnh tối đa 6 MB.'); return; }
    setBusy(true); setMsg('');
    try {
      const { csrf } = await fetch('/api/admin/session/').then(r => r.json());
      const r = await fetch('/api/admin/media/', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrf }, body: file });
      const v = await r.json();
      if (!r.ok) throw Error(v.error || 'Không tải được ảnh.');
      onPick(v.url);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Không tải được ảnh.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  const all = [...new Set([...(items || []), ...pageImages])].filter(u => /^\/assets\//.test(u));
  return (
    <Modal open onOpenChange={o => { if (!o) onClose(); }} title={`Đổi ảnh · ${label}`} size="lg"
      description="Chọn ảnh trong thư viện hoặc tải ảnh mới. Ảnh mới được xóa thông tin EXIF và nén sang WebP."
      footer={<>
        <input ref={input} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e => upload(e.target.files?.[0])} />
        <Button variant="secondary" onClick={() => input.current?.click()} loading={busy}><Upload size={15} /> Tải ảnh mới</Button>
        <Button variant="ghost" onClick={onClose}>Đóng</Button>
      </>}>
      {msg && <p className="adm-inline-msg" role="alert">{msg}</p>}
      {items === null ? <p className="field-note"><Loader2 size={14} className="lv-spin" /> Đang tải thư viện…</p> : (
        <ul className="lv-media" aria-label="Ảnh có thể dùng">
          {all.map(u => (
            <li key={u}>
              <button type="button" className={u === current ? 'is-on' : ''} aria-pressed={u === current} onClick={() => onPick(u)} title={u}>
                <img src={u} alt="" loading="lazy" />
                {u === current && <span className="lv-media__cur"><Check size={12} /> Đang dùng</span>}
              </button>
            </li>
          ))}
          {!all.length && <li className="field-note"><ImagePlus size={15} /> Chưa có ảnh trong thư viện. Bấm “Tải ảnh mới”.</li>}
        </ul>
      )}
    </Modal>
  );
}
