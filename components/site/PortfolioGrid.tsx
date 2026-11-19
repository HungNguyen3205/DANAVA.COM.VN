import { ArrowUpRight } from 'lucide-react';
import type { PortfolioItem } from './portfolio';

/** Lưới thẻ dự án (khung trình duyệt + ảnh chụp + mô tả). Dùng ở trang chủ và trang Website & Landing Page. */
export function PortfolioGrid({ items, reveal = false }: { items: PortfolioItem[]; reveal?: boolean }) {
  return (
    <ul className="h-works__grid s-snap">
      {items.map((w, k) => {
        const host = w.url ? w.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
        return (
          <li
            key={w.name}
            className="h-work"
            data-reveal={reveal ? '' : undefined}
            style={reveal ? { ['--d' as string]: `${(k % 3) * 90}ms` } : undefined}
          >
            <div className="h-work__shot">
              <span className="h-work__bar" aria-hidden="true">
                <i /><i /><i />
                <b>{host || 'Bản trình diễn'}</b>
              </span>
              {w.image ? (
                <img src={w.image} alt={`Giao diện ${w.name}`} loading="lazy" decoding="async" width={1200} height={750} />
              ) : (
                <span className="h-work__placeholder" aria-hidden="true">
                  <strong>{w.name}</strong>
                  <small>Ảnh giao diện đang cập nhật</small>
                </span>
              )}
            </div>
            <div className="h-work__body">
              <p className="h-work__kind">{w.kind}</p>
              <h3 className="h-work__name">
                {w.url ? (
                  <a className="h-work__cover" href={w.url} target="_blank" rel="noopener noreferrer">{w.name}</a>
                ) : (
                  w.name
                )}
              </h3>
              <p className="h-work__desc">{w.description}</p>
              <ul className="h-work__tags">{w.tags.map(t => <li key={t}>{t}</li>)}</ul>
              {w.url ? (
                <span className="h-work__go">Xem website <ArrowUpRight aria-hidden="true" /></span>
              ) : (
                <span className="h-work__go is-muted">Chưa công khai tên miền</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
