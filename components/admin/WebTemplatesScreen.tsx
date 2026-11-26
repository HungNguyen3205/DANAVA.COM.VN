'use client';
/**
 * Giải pháp → Kho mẫu website (SiteData.webTemplates, lib/web-templates.ts) — trang /mau-website/.
 *  - Mẫu demo (có sẵn trong mã): sửa tên, mô tả, ngành, phong cách, nhãn, các khối, bảng màu, ảnh thẻ, thứ tự; ẩn/hiện.
 *    Chữ BÊN TRONG trang demo sửa trong "Chỉnh sửa website" (mở trang /demo/<mã>/), cùng dịch EN/JA như mọi trang.
 *  - Dự án thật: thêm / xoá; link trang của khách và trang dự án trên website.
 */
import { ArrowDown, ArrowUp, ExternalLink, LayoutTemplate, Plus } from 'lucide-react';
import { useState } from 'react';
import type { SiteData } from '@/lib/content';
import { TEMPLATE_INDUSTRIES, TEMPLATE_SEEDS, webTemplatesOf, type TemplateIndustry, type WebTemplate } from '@/lib/web-templates';
import { LibraryButton, uploadMedia } from '../MediaPicker';
import { PF, Switch } from '../AdminContentEditors';
import { matches } from './ui';

function TemplateCard({ x, set, remove, move, first, last }: { x: WebTemplate; set: (p: Partial<WebTemplate>) => void; remove: () => void; move: (d: -1 | 1) => void; first: boolean; last: boolean }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const demo = x.kind === 'demo';
  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true); setErr('');
    try { set({ thumb: await uploadMedia(file) }); } catch (e) { setErr(e instanceof Error ? e.message : 'Lỗi tải ảnh'); }
    setBusy(false);
  };
  const seed = TEMPLATE_SEEDS.find(s => s.id === x.id);
  return (
    <details className="adm-card adm-entity">
      <summary>
        <span className="adm-entity__logo" style={{ background: x.thumb ? undefined : x.palette[0], color: '#fff' }}>{x.thumb ? <img src={x.thumb} alt="" width={40} height={40} loading="lazy" style={{ objectFit: 'cover', objectPosition: 'top' }} /> : <LayoutTemplate size={18} />}</span>
        <span className="adm-entity__main">
          <b>{x.name || 'Chưa đặt tên'}</b>
          <small>{demo ? 'Mẫu demo' : 'Dự án thật'} · {TEMPLATE_INDUSTRIES.find(i => i.id === x.industryId)?.label}{x.brand ? ` · ${x.brand}` : ''}</small>
        </span>
        {x.badge && <span className="adm-pill adm-pill--blue">{x.badge}</span>}
        <span className={`adm-pill ${x.published ? 'adm-pill--green' : 'adm-pill--muted'}`}>{x.published ? 'Đang hiện' : 'Ẩn'}</span>
      </summary>
      <div className="pf">
        <div className="pf-grid">
          <PF label="Tên mẫu" value={x.name} max={120} placeholder="vd. Mẫu phòng gym & fitness" onChange={name => set({ name })} />
          <PF label={demo ? 'Thương hiệu minh hoạ' : 'Khách hàng'} value={x.brand} max={80} onChange={brand => set({ brand })} />
          <label className="pf-field">
            <span>Ngành (bộ lọc)</span>
            <select value={x.industryId} onChange={e => set({ industryId: e.target.value as TemplateIndustry })}>
              {TEMPLATE_INDUSTRIES.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
          </label>
          <PF label="Phong cách" value={x.style} max={60} placeholder="vd. Rêu & vàng ánh kim" onChange={style => set({ style })} />
          <PF label="Nhãn góc ảnh (trống = không có)" value={x.badge} max={24} placeholder="vd. Mới" onChange={badge => set({ badge })} />
          <PF label="Cặp chữ" value={x.fonts} max={80} placeholder="vd. Playfair Display · Great Vibes" onChange={fonts => set({ fonts })} />
          <PF label="Mô tả trên thẻ" value={x.desc} max={600} area wide onChange={desc => set({ desc })} />
          <PF label="Phù hợp với" value={x.fit} max={200} wide onChange={fit => set({ fit })} />
          <label className="pf-field pf-field--wide">
            <span>Các khối trong mẫu (mỗi dòng một khối, tối đa 16)</span>
            <textarea rows={4} value={x.sections.join('\n')} onChange={e => set({ sections: e.target.value.split('\n').map(v => v.slice(0, 80)).slice(0, 16) })} onBlur={e => set({ sections: e.target.value.split('\n').map(v => v.trim()).filter(Boolean).slice(0, 16) })} />
          </label>
          <div className="pf-field pf-field--wide">
            <span>Bảng màu (2–6 màu)</span>
            <span className="eq-color" style={{ flexWrap: 'wrap', gap: 10 }}>
              {x.palette.map((c, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <input type="color" value={c} aria-label={`Màu ${i + 1}`} onChange={e => set({ palette: x.palette.map((p, j) => (j === i ? e.target.value : p)) })} />
                  <code>{c}</code>
                  {x.palette.length > 2 && <button type="button" className="pf-delete" onClick={() => set({ palette: x.palette.filter((_, j) => j !== i) })} aria-label={`Bỏ màu ${i + 1}`}>×</button>}
                </span>
              ))}
              {x.palette.length < 6 && <button type="button" className="ps-libbtn" onClick={() => set({ palette: [...x.palette, '#cccccc'] })}>+ Màu</button>}
            </span>
          </div>
          <div className="pf-field pf-field--wide eq-files">
            <div className="eq-file">
              <span>Ảnh thẻ (ảnh chụp toàn trang, tự cuộn khi rê chuột)</span>
              {x.thumb && <img src={x.thumb} alt="" style={{ maxHeight: 160, objectFit: 'cover', objectPosition: 'top' }} />}
              <div className="eq-file__btns">
                <LibraryButton className="ps-libbtn" value={x.thumb} onPick={thumb => set({ thumb })}>▦ Chọn từ thư viện</LibraryButton>
                <label className="ps-libbtn">{busy ? 'Đang tải…' : '↑ Tải ảnh'}<input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} /></label>
                {seed && seed.thumb !== x.thumb && <button type="button" className="ps-libbtn" onClick={() => set({ thumb: seed.thumb })}>↺ Ảnh mặc định</button>}
                {x.thumb && <button type="button" className="pf-delete" onClick={() => set({ thumb: '' })}>Gỡ</button>}
              </div>
              {demo && <small className="eq-hint">Sau khi sửa giao diện demo trong mã, chụp lại ảnh bằng <code>node scripts/mau-thumbs.mjs</code>.</small>}
            </div>
          </div>
          {!demo && <PF label="Link trang thật của khách (https://…)" value={x.live} max={300} placeholder="https://…" onChange={live => set({ live: live.trim() })} />}
          {!demo && <PF label="Trang dự án trên website (trống = mở trang thật)" value={x.caseHref} max={200} placeholder="/du-an/ten-du-an/" onChange={caseHref => set({ caseHref: caseHref.trim() })} />}
        </div>
        {err && <p className="mb-err" role="alert">{err}</p>}
        <div className="pf-switches">
          <Switch on={x.published} title="Hiện trên website" sub={demo ? 'Thẻ ở /mau-website/, trang xem trước và demo' : 'Thẻ ở /mau-website/'} onChange={published => set({ published })} />
        </div>
        <div className="pf-foot" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="ps-libbtn" disabled={first} onClick={() => move(-1)}><ArrowUp size={14} /> Lên</button>
          <button type="button" className="ps-libbtn" disabled={last} onClick={() => move(1)}><ArrowDown size={14} /> Xuống</button>
          {demo && <a className="ps-libbtn" href={`/demo/${x.id}/`} target="_blank" rel="noopener"><ExternalLink size={14} /> Xem demo</a>}
          {demo && <a className="ps-libbtn" href={`/admin/chinh-sua/?path=${encodeURIComponent(`/demo/${x.id}/`)}`}>✎ Sửa chữ trong demo</a>}
          {!demo && <button type="button" className="pf-delete" onClick={remove}>Xóa dự án này</button>}
        </div>
      </div>
    </details>
  );
}

export function WebTemplatesScreen({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const list = webTemplatesOf(draft);
  const [q, setQ] = useState('');
  const setList = (next: WebTemplate[]) => setDraft({ ...draft, webTemplates: next });
  const shown = list.filter(x => matches(q, x.name, x.brand, x.desc));
  const add = () => setList([...list, {
    id: 'du-an-' + Math.random().toString(36).slice(2, 8), kind: 'live', name: '', brand: '', industryId: 'other', style: 'Dự án thật đã bàn giao', badge: 'Dự án thật',
    desc: '', sections: [], palette: ['#13244f', '#f26b1d'], fonts: '', fit: '', thumb: '', live: '', caseHref: '', published: false
  }]);
  return (
    <div className="pf-page">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>Kho mẫu website</h2>
          <button type="button" className="admin-secondary" onClick={add}><Plus size={15} /> Thêm dự án thật</button>
        </div>
        <p className="adm-home-count" role="status"><b>{list.filter(x => x.published).length}</b>/{list.length} mẫu đang hiện</p>
        <p className="field-note">Thẻ mẫu ở trang <a href="/mau-website/" target="_blank" rel="noopener">/mau-website/</a>: tên, mô tả, ngành, nhãn, bảng màu, ảnh và thứ tự. <b>Mẫu demo</b> có sẵn trong mã (chỉ ẩn, không xoá); <b>dự án thật</b> thêm/xoá tự do. Bấm <b>Xuất bản</b> để áp dụng.</p>
        <p className="field-note">Chữ bên trong từng trang demo (tiêu đề, giá, lịch, form…) sửa ở <b>Chỉnh sửa website</b> → chọn trang demo (nút “Sửa chữ trong demo”). Bản dịch EN/JA sửa ngay trong trình biên tập (đổi ngôn ngữ trên thanh công cụ), như các trang khác.</p>
        <div className="adm-listbar">
          <input type="search" className="adm-listbar__search" placeholder="Tìm mẫu…" value={q} onChange={e => setQ(e.target.value)} aria-label="Tìm mẫu" />
        </div>
        {shown.map(x => {
          const i = list.indexOf(x);
          return (
            <TemplateCard key={x.id} x={x} first={i === 0} last={i === list.length - 1}
              set={p => setList(list.map(y => (y.id === x.id ? { ...y, ...p } : y)))}
              remove={() => setList(list.filter(y => y.id !== x.id))}
              move={d => { const next = [...list]; const j = i + d; [next[i], next[j]] = [next[j], next[i]]; setList(next); }} />
          );
        })}
        {shown.length === 0 && <p className="adm-empty">Không có mẫu nào khớp.</p>}
      </section>
    </div>
  );
}
