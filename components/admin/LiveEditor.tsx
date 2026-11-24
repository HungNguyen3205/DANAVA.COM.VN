'use client';
/**
 * Website → Trang → Chỉnh trực tiếp: trang thật (đúng component công khai, hiển thị BẢN NHÁP) gần như toàn màn hình.
 * Trình chỉnh trong trang: components/site/cms-editor.ts (nhấn giữ để chọn, sửa chữ tại chỗ, đổi ảnh, sửa nút).
 * Màn này giữ dữ liệu: nhận thay đổi theo khóa (lib/cms-paths.ts) → cập nhật bản nháp đang soạn của admin,
 * hoàn tác / làm lại trong phiên, Lưu nháp / Xuất bản qua đúng luồng lưu hiện có (API kiểm tra quyền + chống ghi đè).
 */
import { ArrowLeft, Check, Eye, ImagePlus, Loader2, Monitor, PenLine, Redo2, Rocket, Save, Smartphone, Tablet, Undo2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { SiteData } from '@/lib/content';
import { cmsLimit, readCms, writeCms } from '@/lib/cms-paths';
import { Button, Modal, Tip } from './kit';
import type { SitePage } from './websitePages';

type Mode = 'view' | 'edit';
type SaveMode = 'draft' | 'publish';
const DEVICES = [
  { id: 'desktop', label: 'Máy tính', width: '100%', Icon: Monitor },
  { id: 'tablet', label: 'Máy tính bảng', width: '820px', Icon: Tablet },
  { id: 'mobile', label: 'Điện thoại', width: '390px', Icon: Smartphone }
] as const;
const HISTORY = 100;

export function LiveEditor({ page, draft, setDraft, onSave, saving, dirty, hasDraft, error, canEdit, canPublish, onExit }: {
  page: SitePage;
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
  const [, force] = useState(0);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const undo = useRef<SiteData[]>([]);
  const redo = useRef<SiteData[]>([]);
  const before = useRef<SiteData | null>(null);

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
  }, [send, setDraft, valuesOf]);

  const setMode = (m: Mode) => { if (m === 'edit' && !canEdit) return; setModeState(m); send('mode', { mode: m }); };

  /* Đồng bộ giá trị xuống trang mỗi khi bản nháp đổi (hoàn tác, đổi ảnh, hủy…); trang bỏ qua phần đang gõ */
  useEffect(() => {
    if (!paths.length) return;
    const t = setTimeout(() => send('values', { values: valuesOf(draft, paths) }), 40);
    return () => clearTimeout(t);
  }, [draft, paths, send, valuesOf]);

  /** Ghi một giá trị theo khóa; lỗi → báo ngay trên thanh công cụ trong trang, không ghi. */
  const apply = useCallback((path: string, value: string) => {
    try {
      const next = writeCms(draftRef.current, path, value);
      draftRef.current = next;
      setDraft(next);
      send('clear-error');
      return true;
    } catch (e) {
      send('error', { message: e instanceof Error ? e.message : 'Giá trị không hợp lệ' });
      return false;
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
  const save = useCallback((m: SaveMode) => { send('deselect'); void onSave(m); }, [onSave, send]);

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
          setLoaded(true);
          send('init', { mode, canEdit, limits: Object.fromEntries(list.map(p => [p, cmsLimit(p)])), values: valuesOf(draftRef.current, list) });
          break;
        }
        case 'danava-cms:mode': setModeState(d.mode === 'edit' ? 'edit' : 'view'); break;
        case 'danava-cms:select': setSelected(String(d.label || '')); break;
        case 'danava-cms:begin': before.current = draftRef.current; break;
        case 'danava-cms:change': if (canEdit) apply(String(d.path), String(d.value ?? '')); break;
        case 'danava-cms:commit': if (before.current) pushHistory(before.current); before.current = null; break;
        case 'danava-cms:cancel': if (before.current) replaceDraft(before.current); before.current = null; break;
        case 'danava-cms:pick-image': if (canEdit) setPicker({ base: String(d.base), label: String(d.label || 'Ảnh') }); break;
        case 'danava-cms:key':
          if (d.key === 'undo') doUndo();
          if (d.key === 'redo') doRedo();
          if (d.key === 'save' && canEdit) save('draft');
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
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  }, [doUndo, doRedo]);

  /** Xem trước bản nháp đã lưu ở tab mới (máy chủ hiển thị bản nháp cho người đã đăng nhập). Có thay đổi → lưu nháp trước. */
  async function preview() {
    const w = window.open('about:blank', '_blank');
    if (dirty && canEdit) await onSave('draft');
    if (w) w.location.href = `${page.path}?cms=1`;
  }

  const status = error ? { cls: 'is-error', text: `Chưa lưu được: ${/fetch|network|mạng/i.test(error) ? 'mất kết nối, thử lại' : error}` }
    : saving ? { cls: 'is-saving', text: 'Đang lưu…' }
      : dirty ? { cls: 'is-dirty', text: 'Chưa lưu' }
        : hasDraft ? { cls: 'is-draft', text: 'Đã lưu nháp' } : { cls: 'is-live', text: 'Đã xuất bản' };

  return (
    <div className="lv ax-scope" role="region" aria-label={`Chỉnh trực tiếp: ${page.label}`}>
      <header className="lv-bar">
        <div className="lv-bar__left">
          <Tip side="bottom" label="Thoát chỉnh trực tiếp"><button type="button" className="ax-icon-btn" onClick={onExit} aria-label="Thoát chỉnh trực tiếp"><ArrowLeft size={18} /></button></Tip>
          <div className="lv-title"><b>{page.label}</b><small>{selected ? `Đang chọn: ${selected}` : mode === 'edit' ? 'Chạm vào chữ, ảnh hoặc nút để sửa' : 'Nhấn giữ phần cần sửa'}</small></div>
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
            <Tip side="bottom" label="Làm lại (Ctrl+Shift+Z)"><button type="button" className="ax-icon-btn" onClick={doRedo} disabled={!redo.current.length} aria-label="Làm lại"><Redo2 size={17} /></button></Tip>
          </>}
          <Tip side="bottom" label="Xem trước bản nháp ở tab mới"><button type="button" className="ax-icon-btn" onClick={preview} aria-label="Xem trước bản nháp"><Eye size={17} /></button></Tip>
          {canEdit && <Button variant="secondary" size="sm" onClick={() => save('draft')} disabled={!dirty || saving}><Save size={15} /><span className="lv-hide-sm">Lưu nháp</span></Button>}
          {canPublish && <Button variant="primary" size="sm" onClick={() => save('publish')} disabled={(!dirty && !hasDraft) || saving}>{dirty || hasDraft ? <Rocket size={15} /> : <Check size={15} />}<span className="lv-hide-sm">Xuất bản</span></Button>}
        </div>
      </header>

      <div className={`lv-stage is-${device}`}>
        {!loaded && <div className="lv-loading"><Loader2 size={18} className="lv-spin" /> Đang mở trang…</div>}
        <iframe ref={frame} title={`Trang ${page.label} (chỉnh trực tiếp)`} src={`${page.path}?cms=1`} style={{ width: DEVICES.find(d => d.id === device)!.width }}
          onLoad={() => setLoaded(true)} />
      </div>

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
