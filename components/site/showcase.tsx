/**
 * Khối trưng bày sản phẩm thật (server component): khung trình duyệt, khung điện thoại,
 * ảnh động ghi từ sản phẩm (có ảnh tĩnh thay thế khi người dùng bật giảm chuyển động),
 * và khối dự án nổi bật cỡ lớn dùng ở trang chủ và trang Website & Landing Page.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ShowcaseItem } from '@/lib/content';
import { showcaseHref } from '@/lib/site-queries';

export const hostOf = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export function BrowserFrame({ src, alt, url, priority, className = '' }: { src: string; alt: string; url?: string; priority?: boolean; className?: string }) {
  return (
    <figure className={`sc-browser ${className}`}>
      <span className="sc-browser__bar" aria-hidden="true"><i /><i /><i /><b>{url ? hostOf(url) : ''}</b></span>
      <img src={src} alt={alt} width={1440} height={900} decoding="async" {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
    </figure>
  );
}

/** Ảnh động thật (WebP động). Người dùng bật giảm chuyển động nhận ảnh tĩnh. */
export function MotionImage({ motion, poster, alt, width, height }: { motion: string; poster: string; alt: string; width: number; height: number }) {
  return (
    <picture>
      <source srcSet={poster} media="(prefers-reduced-motion: reduce)" />
      <img src={motion} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
    </picture>
  );
}

export function PhoneFrame({ item, className = '' }: { item: ShowcaseItem; className?: string }) {
  if (!item.mobileImage && !item.motion) return null;
  return (
    <figure className={`sc-phone ${className}`}>
      <span className="sc-phone__notch" aria-hidden="true" />
      {item.motion
        ? <MotionImage motion={item.motion} poster={item.motionPoster || item.mobileImage} alt={`Cuộn trang ${item.name} trên điện thoại (ghi từ website đang chạy)`} width={360} height={780} />
        : <img src={item.mobileImage} alt={`Giao diện ${item.name} trên điện thoại`} width={600} height={1298} loading="lazy" decoding="async" />}
    </figure>
  );
}

/** Khối dự án nổi bật: ảnh desktop lớn + điện thoại chồng lên, nội dung và 2 CTA. */
export function FeaturedShowcase({ item, headingLevel = 'h2', eyebrow = 'Dự án website nổi bật', id }: { item: ShowcaseItem; headingLevel?: 'h2' | 'h3'; eyebrow?: string; id?: string }) {
  const H = headingLevel;
  return (
    <article className="sc-featured" aria-labelledby={id || `sc-${item.id}`}>
      <div className="sc-featured__media">
        <BrowserFrame src={item.image} alt={`Giao diện ${item.name} trên máy tính`} url={item.url} className="sc-featured__desktop" />
        <PhoneFrame item={item} className="sc-featured__phone" />
      </div>
      <div className="sc-featured__body">
        <p className="sc-featured__eyebrow">{eyebrow}</p>
        <H className="sc-featured__title" id={id || `sc-${item.id}`}>{item.name}</H>
        <p className="sc-featured__kind">{item.kind}</p>
        <p className="sc-featured__lead">{item.description}</p>
        {item.highlights.length > 0 && (
          <ul className="sc-featured__points">
            {item.highlights.slice(0, 3).map(h => <li key={h.title}><strong>{h.title}.</strong> {h.text}</li>)}
          </ul>
        )}
        <div className="sc-featured__cta">
          {item.caseStudy && <Link className="s-btn s-btn--primary s-btn--lg" href={showcaseHref(item)}>Khám phá thiết kế <ArrowRight aria-hidden="true" /></Link>}
          {item.url && <a className="s-btn s-btn--secondary s-btn--lg" href={item.url} target="_blank" rel="noopener">Mở website <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>}
        </div>
        {item.disclaimer && <p className="sc-featured__note">{item.disclaimer}</p>}
      </div>
    </article>
  );
}

/** Dải sản phẩm nhỏ (trang chủ): ảnh + tên, liên kết tới case study hoặc website đang chạy. */
export function ShowcaseStrip({ items }: { items: ShowcaseItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="sc-strip">
      {items.map(w => {
        const internal = w.caseStudy;
        const href = internal ? showcaseHref(w) : w.url;
        const inner = (
          <>
            <span className="sc-strip__shot"><img src={w.image} alt="" loading="lazy" decoding="async" width={1200} height={750} /></span>
            <span className="sc-strip__body"><strong>{w.name}</strong><small>{w.kind}</small></span>
          </>
        );
        return (
          <li key={w.id}>
            {href
              ? (internal ? <Link href={href}>{inner}</Link> : <a href={href} target="_blank" rel="noopener">{inner}<span className="s-sr"> (mở website trong tab mới)</span></a>)
              : <div>{inner}</div>}
          </li>
        );
      })}
    </ul>
  );
}
