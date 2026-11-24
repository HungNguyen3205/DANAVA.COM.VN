'use client';
/**
 * Thư viện portfolio có bộ lọc. Bố cục so le (thẻ lớn/nhỏ xen kẽ) thay vì lưới thẻ đều nhau.
 * Bộ lọc là nút thật (aria-pressed), dùng được bằng bàn phím; nội dung tất cả thẻ đã có trong HTML máy chủ.
 */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ShowcaseItem } from '@/lib/content';
import { useSite } from '../SiteStore';
import { cmsText, ct } from './cms';

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export function PortfolioGallery({ items, label = 'Lọc sản phẩm theo loại' }: { items: ShowcaseItem[]; label?: string }) {
  const { data } = useSite();
  const t = (k: string, def: string, label: string) => ct(data, `portfolio.${k}`, def, label, { scope: 'global' });
  const all = t('all', 'Tất cả', 'Bộ lọc: tất cả'), caseL = t('case', 'Xem case study', 'Chữ liên kết'), internal = t('internal', 'Sản phẩm nội bộ / chưa công khai tên miền', 'Ghi chú');
  const rec = (w: ShowcaseItem, field: string, label: string, multiline = false) => cmsText(`rec.showcase.${w.id}.${field}`, label, { multiline, scope: 'record', scopeLabel: `Hồ sơ ${w.name}` });
  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean))), [items]);
  const [cat, setCat] = useState('');
  const shown = cat ? items.filter(i => i.category === cat) : items;

  return (
    <div className="pf">
      {categories.length > 1 && (
        <div className="pf__filters" role="group" aria-label={label}>
          <button type="button" aria-pressed={!cat} onClick={() => setCat('')}><b style={{ fontWeight: 'inherit' }} {...all.a}>{all.v}</b> <span>{items.length}</span></button>
          {categories.map(c => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c} <span>{items.filter(i => i.category === c).length}</span>
            </button>
          ))}
        </div>
      )}
      <p className="s-sr" aria-live="polite">{shown.length} sản phẩm{cat ? ` thuộc nhóm ${cat}` : ''}</p>
      <ul className="pf__grid">
        {shown.map((w, k) => {
          // Nhịp bố cục: thẻ lớn ở vị trí 0, 5, 10…; thẻ cao ở vị trí 3, 8…
          const size = k % 5 === 0 ? 'pf__item--wide' : k % 5 === 3 ? 'pf__item--tall' : '';
          const href = w.caseStudy ? `/du-an/${w.slug}/` : w.url;
          return (
            <li key={w.id} id={w.slug} tabIndex={-1} className={`pf__item ${size}`}>
              <div className="pf__shot">
                <img src={w.image} alt={`Giao diện ${w.name}`} loading="lazy" decoding="async" width={1200} height={750} />
              </div>
              <div className="pf__body">
                <p className="pf__kind" {...rec(w, 'kind', 'Loại sản phẩm')}>{w.kind}</p>
                <h3 className="pf__name">
                  {href
                    ? (w.caseStudy
                      ? <Link className="pf__cover" href={href}><span {...rec(w, 'name', 'Tên sản phẩm')}>{w.name}</span></Link>
                      : <a className="pf__cover" href={href} target="_blank" rel="noopener"><span {...rec(w, 'name', 'Tên sản phẩm')}>{w.name}</span><span className="s-sr"> (mở website trong tab mới)</span></a>)
                    : <span {...rec(w, 'name', 'Tên sản phẩm')}>{w.name}</span>}
                </h3>
                <p className="pf__desc" {...rec(w, 'description', 'Mô tả', true)}>{w.description}</p>
                <p className="pf__foot">
                  {w.url ? <span className="pf__go">{w.caseStudy ? <><span {...caseL.a}>{caseL.v}</span> <ArrowRight aria-hidden="true" /></> : <>{host(w.url)} <ArrowUpRight aria-hidden="true" /></>}</span> : <span className="pf__go is-muted" {...internal.a}>{internal.v}</span>}
                  {w.tags.length > 0 && <span className="pf__tags">{w.tags.slice(0, 3).map((tg, i) => <span key={i}>{i > 0 && ' · '}<span {...rec(w, `tags.${i}`, 'Thẻ')}>{tg}</span></span>)}</span>}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
