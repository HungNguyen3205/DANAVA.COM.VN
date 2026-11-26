'use client';
/**
 * Hiệu ứng dùng chung của các mẫu demo:
 *  - <DemoFx />: phần tử có [data-rv] hiện dần khi cuộn tới (thêm .is-in); [data-count] đếm số từ 0.
 *  - <Countdown to="2026-12-31T19:00:00+07:00" />: đếm ngược ngày / giờ / phút / giây.
 * Người dùng bật "giảm chuyển động": hiện ngay, không đếm.
 */
import { useEffect, useState } from 'react';

export function DemoFx() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll<HTMLElement>('[data-rv], [data-count]');
    const count = (el: HTMLElement) => {
      const end = Number(el.dataset.count), dec = (el.dataset.count || '').split('.')[1]?.length || 0;
      if (reduced || !Number.isFinite(end)) { el.textContent = end.toLocaleString('vi-VN', { minimumFractionDigits: dec }); return; }
      const t0 = performance.now(), dur = 1600;
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toLocaleString('vi-VN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(el => { el.classList.add('is-in'); if (el.dataset.count) count(el); }); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      el.classList.add('is-in');
      if (el.dataset.count) count(el);
      io.unobserve(el);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

export function Countdown({ to, labels = ['Ngày', 'Giờ', 'Phút', 'Giây'], className }: { to: string; labels?: string[]; className?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(to).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);
  const s = Math.floor((left ?? 0) / 1000);
  const parts = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
  return (
    <div className={className} role="timer" aria-label="Thời gian còn lại">
      {parts.map((v, i) => (
        <div key={i}><b suppressHydrationWarning>{left === null ? '--' : String(v).padStart(2, '0')}</b><span>{labels[i]}</span></div>
      ))}
    </div>
  );
}

/** Form demo: không gửi dữ liệu đi đâu, chỉ cảm ơn (tránh khách tưởng là form thật). */
export function DemoForm({ className, children, done = 'Cảm ơn bạn! Đây là form minh hoạ — trên website thật, yêu cầu sẽ về thẳng Zalo và email của bạn.' }: { className?: string; children: React.ReactNode; done?: string }) {
  const [sent, setSent] = useState(false);
  if (sent) return <div className={className} role="status"><p className="dm-sent">{done}</p></div>;
  return <form className={className} onSubmit={e => { e.preventDefault(); setSent(true); }}>{children}</form>;
}
