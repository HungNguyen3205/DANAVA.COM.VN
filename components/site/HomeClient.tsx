'use client';
/**
 * Các phần tương tác nhỏ của trang chủ. Nội dung chữ vẫn render từ máy chủ;
 * JS chỉ đổi ảnh nền, ảnh minh họa giải pháp và hiệu ứng hiện dần.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
    el.classList.add('is-motion');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    const watch = (scope: ParentNode) => scope.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach(x => {
      // Khối đã nằm trong màn hình (hoặc phía trên) thì hiện ngay, không đợi cuộn
      if (x.getBoundingClientRect().top < window.innerHeight) x.classList.add('is-in'); else io.observe(x);
    });
    watch(el);
    // Theo dõi cả khối mới xuất hiện sau khi trang đã tải (cập nhật nội dung, hot reload khi chạy dev)
    const mo = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (!(n instanceof HTMLElement)) return;
      if (n.matches('[data-reveal]') && !n.classList.contains('is-in')) io.observe(n);
      watch(n);
    })));
    mo.observe(el, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [root]);
  return null;
}

/** Số đếm dần khi cuộn tới. HTML ban đầu đã có số cuối (đọc được khi tắt JS / bot); tôn trọng giảm chuyển động. */
export function CountUp({ value, suffix = '+' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref}>{n.toLocaleString('vi-VN')}{suffix}</span>;
}

/** Thanh mục lục các chương trang chủ: bám dưới header, tô sáng chương đang đọc, tự cuộn chip đang chọn vào giữa. */
export function ChapterNav({ chapters }: { chapters: { id: string; no: string; label: string }[] }) {
  const [active, setActive] = useState(chapters[0]?.id || '');
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(es => {
      es.forEach(e => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = '', score = 0;
      chapters.forEach(c => { const v = seen.get(c.id) || 0; if (v > score) { score = v; best = c.id; } });
      if (best) setActive(best);
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .05, .2, .5] });
    chapters.forEach(c => { const el = document.getElementById(c.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [chapters]);
  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-ch="${active}"]`);
    const box = bar.current;
    if (el && box) box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [active]);
  return (
    <nav className="hp-nav" aria-label="Các chương trên trang chủ">
      <div className="s-container hp-nav__inner" ref={bar}>
        {chapters.map(c => (
          <a key={c.id} data-ch={c.id} href={`#${c.id}`} className={active === c.id ? 'is-on' : undefined} aria-current={active === c.id ? 'true' : undefined}>
            <span>{c.no}</span>{c.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
