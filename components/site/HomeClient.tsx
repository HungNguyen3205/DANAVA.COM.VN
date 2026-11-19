'use client';
/**
 * Các phần tương tác nhỏ của trang chủ. Nội dung chữ vẫn render từ máy chủ;
 * JS chỉ đổi ảnh nền, ảnh minh họa giải pháp và hiệu ứng hiện dần.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type Slide = { src: string; caption: string };

/** Ảnh nền hero tự chuyển (dừng khi người dùng bật giảm chuyển động). */
export function HeroSlides({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI(v => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <>
      <div className="h-hero__slides" aria-hidden="true">
        {slides.map((s, k) => (
          <div key={s.src} className={`h-hero__slide${k === i ? ' is-on' : ''}`}>
            <img src={s.src} alt="" width={1600} height={900} decoding="async" {...(k === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
          </div>
        ))}
      </div>
      <div className="h-hero__caption">
        <span className="h-hero__count" aria-hidden="true">{String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
        <span className="h-hero__cap">{slides[i].caption}</span>
        <span className="h-hero__dots">
          {slides.map((s, k) => (
            <button key={s.src} type="button" className={k === i ? 'is-on' : ''} onClick={() => { setI(k); setPaused(true); }} aria-label={`Ảnh ${k + 1}: ${s.caption}`} aria-pressed={k === i} />
          ))}
        </span>
      </div>
    </>
  );
}

export type SolutionItem = { id: string; href: string; title: string; description: string; items: string[]; image: string };

/** Danh sách giải pháp: rê chuột/focus để đổi ảnh minh họa. Liên kết là thẻ <a> thật. */
export function SolutionsExplorer({ items }: { items: SolutionItem[] }) {
  const [cur, setCur] = useState(0);
  const s = items[cur];
  return (
    <div className="h-eco">
      <ol className="h-eco__list" data-reveal>
        {items.map((x, k) => (
          <li key={x.id}>
            <Link href={x.href} className={k === cur ? 'is-on' : ''} onMouseEnter={() => setCur(k)} onFocus={() => setCur(k)}>
              <span className="h-eco__n">{String(k + 1).padStart(2, '0')}</span>
              <span className="h-eco__t"><strong>{x.title}</strong><small>{x.description}</small></span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
      <div className="h-eco__stage" data-reveal style={{ ['--d' as string]: '120ms' }} aria-hidden="true">
        {items.map((x, k) => (
          <img key={x.id} src={x.image} alt="" className={k === cur ? 'is-on' : ''} style={x.id === 'studio' ? { objectPosition: 'left top' } : undefined} loading="lazy" decoding="async" />
        ))}
        {s && (
          <div className="h-eco__card">
            <p>{s.title}</p>
            <ul>{s.items.slice(0, 3).map(it => <li key={it}>{it}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** Hiện dần khi cuộn tới — chỉ ẩn phần tử khi JS đã sẵn sàng và người dùng không bật giảm chuyển động. */
export function Reveal({ root = 'main.h-home' }: { root?: string }) {
  useEffect(() => {
    const el = document.querySelector(root);
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const els = el.querySelectorAll<HTMLElement>('[data-reveal]');
    el.classList.add('is-motion');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(x => io.observe(x));
    return () => io.disconnect();
  }, [root]);
  return null;
}
