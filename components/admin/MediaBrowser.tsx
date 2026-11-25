'use client';
/**
 * Thư viện ảnh: MỌI ảnh của website = ảnh có sẵn (public/assets, danh mục lib/asset-catalog.json) + ảnh tải lên từ admin.
 * Chia nhóm theo khu vực website (lib/media-groups.ts), tìm theo tên / thư mục, xem chi tiết, chép đường dẫn,
 * biết ảnh đang được nội dung nào dùng. mode="pick": bấm ảnh để chọn (nút "Chọn từ thư viện" ở các ô ảnh).
 */
import { Check, Copy, ExternalLink, Search, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import catalog from '@/lib/asset-catalog.json';
import { MEDIA_GROUPS, OTHER_GROUP, groupOf, mediaName } from '@/lib/media-groups';
import type { SiteData } from '@/lib/content';
import { uploadMedia } from '../upload-media';
import { matches } from './ui';

type Item = { url: string; bytes: number; w?: number; h?: number; created?: string; uploaded?: boolean };
const PAGE = 60;
const fmtBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/* ---- Ảnh nào đang được nội dung nào dùng (quét toàn bộ dữ liệu website một lần) ---- */
const AREA: Record<string, string> = {
  posts: 'Bài viết', projects: 'Dự án', services: 'Giải pháp', subServices: 'Giải pháp con', clients: 'Đối tác', staff: 'Đội ngũ',
  showcase: 'Portfolio', testimonials: 'Nhận xét', topics: 'Danh mục bài viết', landings: 'Landing page', pageSeo: 'SEO từng trang',
  blocks: 'Khối nội dung', extras: 'Cấu hình trang', texts: 'Chữ trên trang', homeHero: 'Màn mở đầu trang chủ', careers: 'Tuyển dụng'
};
function usageIndex(data: SiteData | undefined) {
  const map = new Map<string, Set<string>>();
  if (!data) return map;
  const add = (url: string, where: string) => { const s = map.get(url) || new Set(); s.add(where); map.set(url, s); };
  const walk = (v: unknown, where: string) => {
    if (typeof v === 'string') { for (const m of v.matchAll(/\/assets\/[a-zA-Z0-9/_.-]+\.(?:webp|png|jpe?g|svg)/g)) add(m[0], where); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, where); return; }
    if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x, where);
  };
  for (const [key, value] of Object.entries(data)) {
    const area = AREA[key] || 'Nội dung khác';
    if (Array.isArray(value)) for (const item of value) {
      const o = item as { title?: string; name?: string; id?: string };
      walk(item, `${area}: ${o?.title || o?.name || o?.id || ''}`.replace(/: $/, ''));
    }
    else walk(value, area);
  }
  return map;
}

export function MediaBrowser({ mode = 'manage', data, onPick, value }: { mode?: 'manage' | 'pick'; data?: SiteData; onPick?: (url: string) => void; value?: string }) {
  const [uploads, setUploads] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [group, setGroup] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [sel, setSel] = useState('');
  const [copied, setCopied] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const load = () => fetch('/api/admin/media/', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw Error('Không tải được ảnh tải lên.'); return r.json(); })
    .then(v => setUploads((v.items as { url: string; bytes: number; created: string }[]).map(x => ({ ...x, uploaded: true }))))
    .catch(e => setError(e.message));
  useEffect(() => { void load(); }, []);

  const all: Item[] = useMemo(() => [...uploads, ...(catalog as Item[])], [uploads]);
  const usage = useMemo(() => usageIndex(data), [data]);
  const counts = useMemo(() => { const c = new Map<string, number>(); for (const it of all) { const g = groupOf(it.url).id; c.set(g, (c.get(g) || 0) + 1); } return c; }, [all]);
  const groups = [...MEDIA_GROUPS, OTHER_GROUP].filter(g => counts.get(g.id));
  const sections = [...new Set(groups.map(g => g.section))];

  const shown = all.filter(it => (!group || groupOf(it.url).id === group) && matches(q, mediaName(it.url), it.url, groupOf(it.url).label));
  const current = all.find(it => it.url === sel);

  async function upload(f?: File) {
    if (!f) return;
    setBusy(true); setError('');
    try {
      const url = await uploadMedia(f);
      await load();
      setGroup('uploads'); setQ(''); setSel(url);
      if (mode === 'pick') onPick?.(url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi tải ảnh'); }
    setBusy(false);
  }
  const copy = (url: string) => { void navigator.clipboard?.writeText(url).then(() => { setCopied(url); setTimeout(() => setCopied(''), 1500); }); };

  return (
    <div className={`mb mb--${mode}`}>
      <aside className="mb-side" aria-label="Nhóm ảnh">
        <button type="button" className={!group ? 'is-on' : ''} onClick={() => { setGroup(''); setLimit(PAGE); }}>Tất cả ảnh <span>{all.length}</span></button>
        {sections.map(sec => (
          <div key={sec} className="mb-side__sec">
            <b>{sec}</b>
            {groups.filter(g => g.section === sec).map(g => (
              <button key={g.id} type="button" title={g.hint} className={group === g.id ? 'is-on' : ''} onClick={() => { setGroup(g.id); setLimit(PAGE); }}>{g.label} <span>{counts.get(g.id)}</span></button>
            ))}
          </div>
        ))}
      </aside>

      <div className="mb-main">
        <div className="mb-bar">
          <div className="mb-search"><Search size={16} aria-hidden="true" /><input type="search" value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Tìm theo tên ảnh, thư mục…" aria-label="Tìm ảnh" /></div>
          <button type="button" className="mb-upload" disabled={busy} onClick={() => file.current?.click()}><Upload size={16} /> {busy ? 'Đang tải…' : 'Tải ảnh mới'}</button>
          <input ref={file} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; void upload(f); }} />
        </div>
        <p className="mb-meta">
          {group ? <><b>{groups.find(g => g.id === group)?.label}</b> · {groups.find(g => g.id === group)?.hint} · </> : null}
          {shown.length} ảnh{mode === 'pick' ? ' · bấm vào ảnh để chọn' : ''}
        </p>
        {error && <p className="mb-err" role="alert">{error}</p>}

        <ul className="mb-grid">
          {shown.slice(0, limit).map(it => {
            const used = usage.get(it.url)?.size || 0;
            const picked = mode === 'pick' ? value === it.url : sel === it.url;
            return (
              <li key={it.url}>
                <button type="button" className={`mb-card${picked ? ' is-on' : ''}`} onClick={() => (mode === 'pick' ? onPick?.(it.url) : setSel(it.url))} title={it.url}>
                  <span className="mb-card__img"><img src={it.url} alt="" loading="lazy" decoding="async" /></span>
                  <span className="mb-card__name">{mediaName(it.url)}</span>
                  <span className="mb-card__info">{it.w ? `${it.w}×${it.h} · ` : ''}{fmtBytes(it.bytes)}{used ? <i className="mb-used" title="Đang dùng trong nội dung">● {used}</i> : null}</span>
                  {picked && <span className="mb-card__tick" aria-hidden="true"><Check size={14} /></span>}
                </button>
              </li>
            );
          })}
        </ul>
        {shown.length === 0 && <p className="mb-empty">Không có ảnh nào khớp.</p>}
        {shown.length > limit && <div className="mb-more"><button type="button" onClick={() => setLimit(limit + PAGE)}>Xem thêm {Math.min(PAGE, shown.length - limit)} ảnh</button></div>}
      </div>

      {mode === 'manage' && current && (
        <aside className="mb-detail" aria-label="Chi tiết ảnh">
          <button type="button" className="mb-detail__x" onClick={() => setSel('')} aria-label="Đóng"><X size={16} /></button>
          <a href={current.url} target="_blank" rel="noopener noreferrer" className="mb-detail__img"><img src={current.url} alt="" /></a>
          <b className="mb-detail__name">{mediaName(current.url)}</b>
          <dl>
            <dt>Nhóm</dt><dd>{groupOf(current.url).label}</dd>
            {current.w ? <><dt>Kích thước</dt><dd>{current.w} × {current.h} px</dd></> : null}
            <dt>Dung lượng</dt><dd>{fmtBytes(current.bytes)}</dd>
            {current.created && <><dt>Tải lên</dt><dd>{new Date(current.created).toLocaleString('vi-VN')}</dd></>}
          </dl>
          <div className="mb-path"><code>{current.url}</code><button type="button" onClick={() => copy(current.url)}>{copied === current.url ? <><Check size={14} /> Đã chép</> : <><Copy size={14} /> Chép</>}</button></div>
          <a className="mb-open" href={current.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Mở ảnh gốc</a>
          <div className="mb-usage">
            <b>Đang dùng trong nội dung</b>
            {usage.get(current.url)?.size
              ? <ul>{[...usage.get(current.url)!].slice(0, 12).map(u => <li key={u}>{u}</li>)}</ul>
              : <small>{current.uploaded ? 'Chưa nội dung nào dùng ảnh này.' : 'Không thấy trong nội dung sửa được; có thể đang dùng trong giao diện cố định của website.'}</small>}
          </div>
        </aside>
      )}
    </div>
  );
}
