'use client';
/**
 * Kho mẫu website (/mau-website/): lọc theo ngành, thẻ có ảnh chụp toàn trang tự cuộn khi rê chuột / chạm,
 * bảng màu + cặp chữ, nút "Xem demo" (trang xem trước) và "Dùng mẫu này" (báo giá, ghi sẵn tên mẫu).
 * Dữ liệu: lib/web-templates.ts. Chữ dịch / sửa được qua khóa mau.* (trình biên tập + i18n).
 */
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Eye } from 'lucide-react';
import { CASE_HREF, TEMPLATE_INDUSTRIES, WEB_TEMPLATES, type WebTemplate } from '@/lib/web-templates';
import { useSite } from '../SiteStore';
import { ct } from './cms';

export function TemplateCard({ t }: { t: WebTemplate }) {
  const { data } = useSite();
  const T = (k: string, def: string, label: string) => { const x = ct(data, `mau.${k}`, def, label, { scope: 'global' }); return <span {...x.a}>{x.v}</span>; };
  const R = (f: 'name' | 'desc' | 'style' | 'badge', def: string, label: string) => { const x = ct(data, `mau.items.${t.slug}.${f}`, def, label); return <span {...x.a}>{x.v}</span>; };
  const ind = TEMPLATE_INDUSTRIES.find(i => i.id === t.industryId);
  const demo = t.live ? CASE_HREF[t.slug] || t.live : `/mau-website/${t.slug}/`;
  return (
    <article className={`mau-card${t.live ? ' is-live' : ''}`}>
      <Link className="mau-card__shot" href={demo} aria-label={`Xem ${t.name}`} tabIndex={-1}>
        <span className="mau-card__bar" aria-hidden="true"><i /><i /><i /><em>{t.live ? new URL(t.live).host : `danava.com.vn/demo/${t.slug}`}</em></span>
        <span className="mau-card__img" style={{ backgroundImage: `url(${t.thumb})` }} role="img" aria-label={`Ảnh toàn trang ${t.brand}`} />
        {t.badge && <span className="mau-card__badge">{R('badge', t.badge, 'Nhãn mẫu')}</span>}
        <span className="mau-card__hover" aria-hidden="true"><Eye />{t.live ? T('card.case', 'Xem dự án', 'Thẻ mẫu: chữ khi rê chuột (dự án thật)') : T('card.peek', 'Xem demo trực tiếp', 'Thẻ mẫu: chữ khi rê chuột')}</span>
      </Link>
      <div className="mau-card__body">
        <p className="mau-card__meta">{ind && T(`industries.${ind.id}`, ind.label, 'Tên ngành')} <span aria-hidden="true">·</span> {R('style', t.style, 'Phong cách mẫu')}</p>
        <h3><Link href={demo}>{R('name', t.name, 'Tên mẫu')}</Link></h3>
        <p className="mau-card__brand">{t.brand}</p>
        <p className="mau-card__desc">{R('desc', t.desc, 'Mô tả mẫu')}</p>
        <div className="mau-card__spec">
          <span className="mau-card__pal" aria-label="Bảng màu">{t.palette.map(c => <i key={c} style={{ background: c }} title={c} />)}</span>
          <span className="mau-card__font">{t.fonts}</span>
        </div>
        <div className="mau-card__act">
          <Link className="mau-card__demo" href={demo}>{t.live ? T('card.case-cta', 'Xem dự án', 'Thẻ mẫu: nút xem dự án thật') : T('card.demo', 'Xem demo', 'Thẻ mẫu: nút xem demo')} <ArrowRight aria-hidden="true" /></Link>
          {t.live
            ? <a className="mau-card__use" href={t.live} target="_blank" rel="noopener">{T('card.live', 'Trang thật', 'Thẻ mẫu: mở trang thật')} <ArrowUpRight aria-hidden="true" /></a>
            : <Link className="mau-card__use" href={`/bao-gia-web/?mau=${t.slug}`}>{T('card.use', 'Dùng mẫu này', 'Thẻ mẫu: nút dùng mẫu')}</Link>}
        </div>
      </div>
    </article>
  );
}

export function TemplateGallery() {
  const { data } = useSite();
  const [ind, setInd] = useState<string>('');
  const shown = ind ? WEB_TEMPLATES.filter(t => t.industryId === ind) : WEB_TEMPLATES;
  const all = ct(data, 'mau.filter.all', 'Tất cả', 'Bộ lọc mẫu: tất cả', { scope: 'global' });
  return (
    <div className="mau-gal">
      <div className="mau-filter" role="group" aria-label="Lọc mẫu theo ngành">
        <button type="button" aria-pressed={!ind} onClick={() => setInd('')}><span {...all.a}>{all.v}</span> <small>{WEB_TEMPLATES.length}</small></button>
        {TEMPLATE_INDUSTRIES.map(i => {
          const n = WEB_TEMPLATES.filter(t => t.industryId === i.id).length;
          const x = ct(data, `mau.industries.${i.id}`, i.label, 'Tên ngành', { scope: 'global' });
          return n ? <button key={i.id} type="button" aria-pressed={ind === i.id} onClick={() => setInd(i.id)}><span {...x.a}>{x.v}</span> <small>{n}</small></button> : null;
        })}
      </div>
      <div className="mau-grid" aria-live="polite">
        {shown.map(t => <TemplateCard key={t.slug} t={t} />)}
      </div>
    </div>
  );
}
