'use client';
/**
 * Hệ thống → SEO & chuyển hướng → "SEO từng trang": tiêu đề, mô tả, ảnh chia sẻ (OG) và ẩn khỏi Google cho từng trang cố định.
 * Lưu ở SiteData.pageSeo (khóa = đường dẫn). Ô trống = dùng mặc định trong lib/seo-pages.ts. Áp dụng khi bấm Xuất bản.
 * Bài viết, dự án, dịch vụ, chủ đề: SEO điền trong hồ sơ của từng bản ghi.
 */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { PageSeo, SiteData } from '@/lib/content';
import { STATIC_SEO, type StaticSeo } from '@/lib/seo-pages';
import { LibraryButton, uploadMedia } from '../MediaPicker';
import { matches } from './ui';

const BRAND = 'DANAVA Solutions';
const TITLE_MAX = 65;
const DESC_MAX = 160;

/** Bộ đếm có màu: xanh khi vừa, cam khi gần quá, đỏ khi quá giới hạn Google hiển thị */
function Count({ n, ok, max }: { n: number; ok: number; max: number }) {
  const cls = n === 0 ? '' : n > max ? ' is-over' : n >= ok ? ' is-good' : ' is-short';
  return <small className={`ps-count${cls}`}>{n}/{max}</small>;
}

function PageCard({ def, value, onChange }: { def: StaticSeo; value: PageSeo; onChange: (v: PageSeo) => void }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const title = value.title?.trim() || def.title;
  const desc = value.description?.trim() || def.description;
  const image = value.image || def.image || '/assets/danava-logo.png';
  // Giống lib/seo.ts: tiêu đề dài thì bỏ hậu tố thương hiệu
  const shownTitle = (!value.title?.trim() && def.absoluteTitle) || `${title} | ${BRAND}`.length > TITLE_MAX ? title : `${title} | ${BRAND}`;
  const custom = !!(value.title?.trim() || value.description?.trim() || value.image || value.noindex);
  const set = (patch: PageSeo) => onChange({ ...value, ...patch });

  return (
    <article className="ps-card">
      <header className="ps-card__head">
        <b>{def.name}</b>
        <code>{def.path}</code>
        {custom ? <span className="adm-pill adm-pill--blue">Đã tùy chỉnh</span> : <span className="adm-pill adm-pill--muted">Mặc định</span>}
        {value.noindex && <span className="adm-pill adm-pill--muted">Ẩn khỏi Google</span>}
        <a className="ps-card__open" href={def.path} target="_blank" rel="noopener noreferrer">Xem trang ↗</a>
      </header>

      {/* Xem trước kết quả Google */}
      <div className="ps-serp" aria-label="Xem trước trên Google">
        <span className="ps-serp__url">danava.com.vn{def.path === '/' ? '' : def.path.replace(/\/$/, '').replace(/\//g, ' › ').replace(/^ › /, ' › ')}</span>
        <span className="ps-serp__title">{shownTitle}</span>
        <span className="ps-serp__desc">{desc.length > DESC_MAX ? desc.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, '') + ' …' : desc}</span>
      </div>

      <div className="ps-body">
        {/* Ảnh chia sẻ Facebook / Zalo */}
        <div className="ps-og">
          <span className="ps-label">Ảnh chia sẻ (1200×630)</span>
          <label className={`ps-og__img${busy ? ' is-busy' : ''}`} title="Bấm để tải ảnh mới (PNG, JPG, WebP, tối đa 6 MB)">
            <img src={image} alt="" />
            <span className="ps-og__cta">{busy ? 'Đang tải…' : 'Đổi ảnh'}</span>
            <input type="file" hidden accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async e => {
              const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
              setBusy(true); setErr('');
              try { set({ image: await uploadMedia(file) }); } catch (x) { setErr(x instanceof Error ? x.message : 'Lỗi tải ảnh'); }
              setBusy(false);
            }} />
          </label>
          <div className="ps-og__actions">
            <LibraryButton className="ps-libbtn" value={value.image} onPick={url => set({ image: url })}>▦ Chọn từ thư viện</LibraryButton>
            {value.image ? <button type="button" className="ps-link" onClick={() => set({ image: undefined })}>Dùng ảnh mặc định</button>
              : <small className="ps-hint">Đang dùng ảnh mặc định</small>}
          </div>
          {err && <small className="ps-err" role="alert">{err}</small>}
        </div>

        <div className="ps-fields">
          <label className="pf-field">
            <span className="ps-label">Tiêu đề SEO <Count n={(value.title || '').trim().length} ok={30} max={60} /></span>
            <input maxLength={200} value={value.title || ''} placeholder={def.title} onChange={e => set({ title: e.target.value })} />
          </label>
          <label className="pf-field">
            <span className="ps-label">Mô tả SEO <Count n={(value.description || '').trim().length} ok={110} max={DESC_MAX} /></span>
            <textarea rows={3} maxLength={300} value={value.description || ''} placeholder={def.description} onChange={e => set({ description: e.target.value })} />
          </label>
          <div className="ps-row">
            {/* Bật = cảnh báo (cam): trang sẽ biến mất khỏi kết quả tìm kiếm */}
            <label className={`ps-noindex${value.noindex ? ' is-on' : ''}`}>
              <span className="ps-noindex__icon" aria-hidden="true">{value.noindex ? <EyeOff /> : <Eye />}</span>
              <span className="ps-noindex__text">
                <b>{value.noindex ? 'Đang ẩn khỏi Google' : 'Hiện trên Google'}</b>
                <small>{value.noindex ? 'Trang vẫn mở được nhưng không lên kết quả tìm kiếm' : 'Bật công tắc để ẩn trang khỏi kết quả tìm kiếm (noindex)'}</small>
              </span>
              <input type="checkbox" role="switch" aria-label="Ẩn khỏi Google" checked={!!value.noindex} onChange={e => set({ noindex: e.target.checked || undefined })} />
              <span className="ps-noindex__track" aria-hidden="true"><i /></span>
            </label>
            {custom && <button type="button" className="pf-delete" onClick={() => onChange({})}>Khôi phục mặc định</button>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PageSeoEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const [q, setQ] = useState('');
  const all = draft.pageSeo || {};
  const shown = STATIC_SEO.filter(p => matches(q, p.name, p.path, all[p.path]?.title || p.title));
  const customCount = STATIC_SEO.filter(p => { const v = all[p.path]; return v && (v.title?.trim() || v.description?.trim() || v.image || v.noindex); }).length;

  function update(path: string, v: PageSeo) {
    const clean: PageSeo = {};
    if (v.title?.trim()) clean.title = v.title;
    if (v.description?.trim()) clean.description = v.description;
    if (v.image) clean.image = v.image;
    if (v.noindex) clean.noindex = true;
    const next = { ...all };
    if (Object.keys(clean).length) next[path] = clean; else delete next[path];
    setDraft({ ...draft, pageSeo: Object.keys(next).length ? next : undefined });
  }

  return (
    <section className="admin-panel ps-page">
      <div className="panel-heading">
        <h2>SEO từng trang</h2>
        <span className="adm-pill adm-pill--muted">{customCount}/{STATIC_SEO.length} trang đã tùy chỉnh</span>
      </div>
      <p className="field-note">
        Tiêu đề, mô tả và ảnh khi chia sẻ Facebook/Zalo cho từng trang. <b>Để trống = dùng nội dung mặc định</b> (chữ mờ trong ô).
        Bấm <b>Xuất bản</b> để áp dụng. Bài viết, dự án, dịch vụ và chủ đề có ô SEO riêng trong hồ sơ của từng mục.
      </p>
      <p className="field-note">Chuẩn gợi ý: tiêu đề 30–60 ký tự, mô tả 110–160 ký tự, có từ khóa chính; mỗi trang một tiêu đề khác nhau.</p>
      <input type="search" className="adm-listbar__search ps-search" placeholder="Tìm trang…" value={q} onChange={e => setQ(e.target.value)} aria-label="Tìm trang" />
      <div className="ps-list">
        {shown.map(def => <PageCard key={def.path} def={def} value={all[def.path] || {}} onChange={v => update(def.path, v)} />)}
        {shown.length === 0 && <p className="adm-empty">Không có trang nào khớp.</p>}
      </div>
    </section>
  );
}
