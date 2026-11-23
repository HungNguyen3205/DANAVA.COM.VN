'use client';
/**
 * Website → Trang → Chỉnh giao diện: sửa chữ trực tiếp trên trang thật (trang có sẵn, bố cục thiết kế riêng).
 * Trái: các phần chỉnh được · Giữa: trang thật trong iframe (?cms=1) · Phải: ô sửa phần đang chọn.
 * Trang có sẵn chỉ cho sửa chữ (tiêu đề, câu dẫn, dải kêu gọi); bố cục, kích thước, kéo thả dùng cho landing page nội bộ.
 */
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SiteData } from '@/lib/content';
import { block, blockDefaults, withBlock } from '@/lib/blocks';
import { PAGE_NAMES } from '../adminBlockConfig';
import type { SitePage } from './websitePages';
import { ErrorBox, Loading } from './ui';

type Field = { path: string; label: string; group: string; long: boolean };
const LABEL: Record<string, string> = { kicker: 'Dòng chữ nhỏ phía trên', title: 'Tiêu đề trang (H1)', lead: 'Câu dẫn', ctaTitle: 'Dải cuối trang: tiêu đề', ctaLead: 'Dải cuối trang: câu dẫn' };
const DEVICES = [{ id: 'desktop', label: 'Máy tính', width: '100%', Icon: Monitor }, { id: 'tablet', label: 'Máy tính bảng', width: '820px', Icon: Tablet }, { id: 'mobile', label: 'Điện thoại', width: '390px', Icon: Smartphone }] as const;

/** Các trường chữ chỉnh được của một trang. */
export function pageFields(page: SitePage): Field[] {
  const out: Field[] = [];
  for (const t of page.tabs) {
    if (t.kind === 'hero') out.push(
      { path: 'site.heroTitle', label: 'Tiêu đề H1', group: 'Màn mở đầu', long: false },
      { path: 'site.headline', label: 'Thông điệp thương hiệu', group: 'Màn mở đầu', long: false },
      { path: 'site.description', label: 'Mô tả', group: 'Màn mở đầu', long: true });
    if (t.kind === 'text' && t.id !== 'cta-san-pham') {
      const defaults = blockDefaults().pages as Record<string, Record<string, string>>;
      for (const key of t.keys) for (const f of Object.keys(defaults[key] || {})) {
        out.push({ path: `pages.${key}.${f}`, label: LABEL[f] || f, group: PAGE_NAMES[key] || key, long: f === 'lead' || f === 'ctaLead' });
      }
    }
  }
  return out;
}

function read(data: SiteData, path: string): string {
  const [kind, a, b] = path.split('.');
  if (kind === 'site') return String((data as Record<string, unknown>)[a] ?? '');
  return String(((block(data, 'pages') as Record<string, Record<string, string>>)[a] || {})[b] ?? '');
}
function write(data: SiteData, path: string, value: string): SiteData {
  const [kind, a, b] = path.split('.');
  if (kind === 'site') return { ...data, [a]: value };
  const pages = block(data, 'pages') as Record<string, Record<string, string>>;
  return withBlock(data, 'pages', { ...pages, [a]: { ...pages[a], [b]: value } });
}

export function PageVisualEditor({ page, draft, setDraft }: { page: SitePage; draft: SiteData; setDraft: (d: SiteData) => void }) {
  const fields = useMemo(() => pageFields(page), [page]);
  const [published, setPublished] = useState<SiteData | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(fields[0]?.path || '');
  const [found, setFound] = useState<string[] | null>(null);
  const [device, setDevice] = useState<(typeof DEVICES)[number]['id']>('desktop');
  const frame = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/admin/content/?published=1', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(Error('Không tải được nội dung đang công khai.'))))
      .then(v => setPublished(v.data)).catch(e => setError(e.message));
  }, []);

  const send = useCallback(() => {
    if (!published) return;
    frame.current?.contentWindow?.postMessage({
      type: 'danava-cms:fields', selected,
      fields: fields.map(f => ({ path: f.path, label: f.label, published: read(published, f.path), value: read(draft, f.path) }))
    }, location.origin);
  }, [fields, published, draft, selected]);
  useEffect(send, [send]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === 'danava-cms:ready') send();
      if (e.data?.type === 'danava-cms:found') setFound(e.data.paths as string[]);
      if (e.data?.type === 'danava-cms:select') { setSelected(String(e.data.path)); setTimeout(() => inputRef.current?.focus(), 50); }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, [send]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!published) return <Loading label="Đang mở trang…" />;
  const current = fields.find(f => f.path === selected);
  const groups = [...new Set(fields.map(f => f.group))];
  const visible = (path: string) => !found || found.includes(path);

  return (
    <div className="lpe lpe--page">
      <aside className="lpe-tree" aria-label="Phần chỉnh được">
        <div className="lpe-tree__head"><b>Phần chỉnh được</b></div>
        {groups.map(g => (
          <div key={g} className="lpe-group">
            <small className="lpe-group__title">{g}</small>
            <ol className="lpe-list">
              {fields.filter(f => f.group === g).map(f => (
                <li key={f.path} className={`${f.path === selected ? 'is-on' : ''}${visible(f.path) ? '' : ' is-hidden'}`}>
                  <button type="button" className="lpe-pick" onClick={() => { setSelected(f.path); frame.current?.contentWindow?.postMessage({ type: 'danava-cms:scroll', path: f.path }, location.origin); }}>
                    <b>{f.label}</b>
                    <small>{visible(f.path) ? (read(draft, f.path).replace(/\*/g, '') || '(trống)') : 'Không hiển thị trên trang này'}</small>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ))}
        <p className="field-note">Ảnh, danh sách và các khối khác của trang sửa ở các tab biểu mẫu bên cạnh.</p>
      </aside>

      <div className="lpe-stage">
        <div className="lpe-devices" role="radiogroup" aria-label="Xem trước theo thiết bị">
          {DEVICES.map(d => (
            <button key={d.id} type="button" role="radio" aria-checked={device === d.id} className={device === d.id ? 'is-on' : ''} onClick={() => setDevice(d.id)}><d.Icon size={15} /> <span>{d.label}</span></button>
          ))}
          <small className="field-note">Bấm vào chữ có viền cam trên trang để sửa.</small>
        </div>
        <div className="lpe-canvas">
          <iframe ref={frame} title={`Chỉnh giao diện ${page.label}`} src={`${page.path}?cms=1`} style={{ width: DEVICES.find(d => d.id === device)!.width }} onLoad={() => { setFound(null); send(); }} />
        </div>
      </div>

      <aside className="lpe-props" aria-label="Sửa nội dung">
        {!current ? <p className="field-note">Chọn một phần để sửa.</p> : (
          <div className="lpe-fields">
            <div className="lpe-props__head"><b>{current.label}</b></div>
            <small className="field-note">{current.group}</small>
            <label>Nội dung
              <textarea ref={inputRef} rows={current.long ? 6 : 3} maxLength={current.path.startsWith('site.') ? (current.path === 'site.description' ? 1000 : 150) : 600}
                value={read(draft, current.path)} onChange={e => setDraft(write(draft, current.path, e.target.value))} />
            </label>
            <small className="field-note">Đặt *dấu sao* quanh phần muốn nhấn mạnh (vd. Câu chuyện *triển khai thực tế*). Để trống để dùng chữ mặc định. Thay đổi hiện ngay trên khung xem trước; bấm Lưu nháp hoặc Xuất bản để lưu.</small>
            {!visible(current.path) && <p className="adm-inline-msg">Phần này không hiển thị trên trang {page.label} (có thể dùng ở trang khác hoặc đang để trống).</p>}
          </div>
        )}
      </aside>
    </div>
  );
}
