/**
 * Bảng gói & giá của một sản phẩm (Service.packages). Một nguồn dữ liệu: hồ sơ sản phẩm trong admin.
 * Dùng ở trang sản phẩm và khối "Bảng giá" của landing page.
 */
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { ProductPackage } from '@/lib/content';
import { packagePrice } from '@/lib/product-types';

export function PackageGrid({ packages, contactHref }: { packages: ProductPackage[]; contactHref: string }) {
  if (!packages.length) return null;
  return (
    <div className={`pk-grid pk-grid--${Math.min(packages.length, 4)}`}>
      {packages.map(p => (
        <article key={p.id} className={`pk-card${p.highlight ? ' is-highlight' : ''}`}>
          {p.highlight && <span className="pk-card__badge">Được chọn nhiều</span>}
          <h3 className="pk-card__name">{p.name}</h3>
          <p className="pk-card__price"><b>{packagePrice(p.price)}</b>{p.price && p.price !== '0' && p.unit && <span>{p.unit}</span>}</p>
          {p.perks.length > 0 && (
            <ul className="pk-card__perks">
              {p.perks.map(x => <li key={x}><Check aria-hidden="true" />{x}</li>)}
            </ul>
          )}
          {p.note && <p className="pk-card__note">{p.note}</p>}
          <Link className={`s-btn ${p.highlight ? 's-btn--primary' : 's-btn--secondary'}`} href={contactHref}>{p.price ? 'Đăng ký gói này' : 'Nhận báo giá'}</Link>
        </article>
      ))}
    </div>
  );
}

export function PackagesSection({ title, packages, contactHref }: { title: string; packages: ProductPackage[]; contactHref: string }) {
  if (!packages.length) return null;
  return (
    <section className="s-section s-section--soft" id="bang-gia" aria-labelledby="pk-title">
      <div className="s-container">
        <h2 className="s-h2 pk-title" id="pk-title">{title}</h2>
        <PackageGrid packages={packages} contactHref={contactHref} />
      </div>
    </section>
  );
}
