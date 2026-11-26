'use client';
/**
 * Kho mẫu website (/mau-website/): lọc theo ngành, thẻ có ảnh chụp toàn trang tự cuộn khi rê chuột / chạm,
 * bảng màu + cặp chữ, nút "Xem demo" (trang xem trước) và "Dùng mẫu này" (báo giá, ghi sẵn tên mẫu).
 * Dữ liệu: SiteData.webTemplates (Quản trị → Giải pháp → Kho mẫu website; lib/web-templates.ts).
 * Chữ của từng mẫu: khóa rec.webTemplates.<id>.<trường> (sửa tại chỗ, dịch EN/JA); chữ giao diện: mau.*.
 */
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Eye } from 'lucide-react';
import { TEMPLATE_INDUSTRIES, publishedTemplates, templateHref, type WebTemplate } from '@/lib/web-templates';
import { useSite } from '../SiteStore';
import { cmsText, ct } from './cms';

/** Liên kết nội bộ (Link) hoặc trang ngoài (tab mới) */
function Go({ href, className, children, tabIndex }: { href: string; className?: string; children: ReactNode; tabIndex?: number }) {
  return href.startsWith('https://')
    ? <a className={className} href={href} target="_blank" rel="noopener" tabIndex={tabIndex}>{children}</a>
    : <Link className={className} href={href} tabIndex={tabIndex}>{children}</Link>;
}

export function TemplateCard({ t }: { t: WebTemplate }) {
  const { data } = useSite();
  const T = (k: string, def: string, label: string) => { const x = ct(data, `mau.${k}`, def, label, { scope: 'global' }); return <span {...x.a}>{x.v}</span>; };
  const R = (f: 'name' | 'desc' | 'style' | 'badge', label: string) => <span {...cmsText(`rec.webTemplates.${t.id}.${f}`, label, { scope: 'record', scopeLabel: `Mẫu ${t.brand || t.name}` })}>{t[f]}</span>;
  const ind = TEMPLATE_INDUSTRIES.find(i => i.id === t.industryId);
  const live = t.kind === 'live';
  const href = templateHref(t);
  const host = live && t.live ? new URL(t.live).host : `danava.com.vn/demo/${t.id}`;
  return (
    <article className={`mau-card${live ? ' is-live' : ''}`}>
      <Go href={href} className="mau-card__shot" tabIndex={-1}>
        <span className="mau-card__bar" aria-hidden="true"><i /><i /><i /><em>{host}</em></span>
        <span className="mau-card__img" style={t.thumb ? { backgroundImage: `url(${t.thumb})` } : { backgroundImage: `linear-gradient(135deg, ${t.palette.join(', ')})` }} role="img" aria-label={`Ảnh toàn trang ${t.brand || t.name}`} />
        {t.badge && <span className="mau-card__badge">{R('badge', 'Nhãn mẫu')}</span>}
        <span className="mau-card__hover" aria-hidden="true"><Eye />{live ? T('card.case', 'Xem dự án', 'Thẻ mẫu: chữ khi rê chuột (dự án thật)') : T('card.peek', 'Xem demo trực tiếp', 'Thẻ mẫu: chữ khi rê chuột')}</span>
      </Go>
      <div className="mau-card__body">
        <p className="mau-card__meta">{ind && T(`industries.${ind.id}`, ind.label, 'Tên ngành')}{t.style && <> <span aria-hidden="true">·</span> {R('style', 'Phong cách mẫu')}</>}</p>
        <h3><Go href={href}>{R('name', 'Tên mẫu')}</Go></h3>
        {t.brand && <p className="mau-card__brand">{t.brand}</p>}
        <p className="mau-card__desc">{R('desc', 'Mô tả mẫu')}</p>
        <div className="mau-card__spec">
          <span className="mau-card__pal" aria-label="Bảng màu">{t.palette.map(c => <i key={c} style={{ background: c }} title={c} />)}</span>
          <span className="mau-card__font">{t.fonts}</span>
        </div>
        <div className="mau-card__act">
          <Go href={href} className="mau-card__demo">{live ? T('card.case-cta', 'Xem dự án', 'Thẻ mẫu: nút xem dự án thật') : T('card.demo', 'Xem demo', 'Thẻ mẫu: nút xem demo')} <ArrowRight aria-hidden="true" /></Go>
          {live
            ? t.live && t.caseHref && <a className="mau-card__use" href={t.live} target="_blank" rel="noopener">{T('card.live', 'Trang thật', 'Thẻ mẫu: mở trang thật')} <ArrowUpRight aria-hidden="true" /></a>
            : <Link className="mau-card__use" href={`/bao-gia-web/?mau=${t.id}`}>{T('card.use', 'Dùng mẫu này', 'Thẻ mẫu: nút dùng mẫu')}</Link>}
        </div>
      </div>
    </article>
  );
}

export function TemplateGallery() {
  const { data } = useSite();
  const list = publishedTemplates(data);
  const [ind, setInd] = useState<string>('');
  const shown = ind ? list.filter(t => t.industryId === ind) : list;
  const all = ct(data, 'mau.filter.all', 'Tất cả', 'Bộ lọc mẫu: tất cả', { scope: 'global' });
  return (
    <div className="mau-gal">
      <div className="mau-filter" role="group" aria-label="Lọc mẫu theo ngành">
        <button type="button" aria-pressed={!ind} onClick={() => setInd('')}><span {...all.a}>{all.v}</span> <small>{list.length}</small></button>
        {TEMPLATE_INDUSTRIES.map(i => {
          const n = list.filter(t => t.industryId === i.id).length;
          const x = ct(data, `mau.industries.${i.id}`, i.label, 'Tên ngành', { scope: 'global' });
          return n ? <button key={i.id} type="button" aria-pressed={ind === i.id} onClick={() => setInd(i.id)}><span {...x.a}>{x.v}</span> <small>{n}</small></button> : null;
        })}
      </div>
      <div className="mau-grid" aria-live="polite">
        {shown.map(t => <TemplateCard key={t.id} t={t} />)}
      </div>
    </div>
  );
}
