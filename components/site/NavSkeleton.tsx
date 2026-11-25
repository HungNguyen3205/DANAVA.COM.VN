'use client';
/**
 * Khung chờ (skeleton) khi chuyển trang trong website.
 * Bấm một liên kết nội bộ → sau 120 ms (tránh nháy với trang mở nhanh) phủ vùng nội dung bằng khung xám nhấp nháy,
 * đến khi đường dẫn mới hiện ra. Chỉ chạy ở trình duyệt: HTML máy chủ trả về vẫn đầy đủ (không ảnh hưởng SEO / mã 404),
 * nên không dùng loading.tsx cho cả site (loading.tsx làm trang stream mã 200 kể cả khi không tồn tại).
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavSkeleton() {
  const path = usePathname();
  const [on, setOn] = useState(false);
  const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach(t => clearTimeout(t)); timers.current = []; };

  // Đường dẫn đổi = trang mới đã hiện → tắt khung chờ
  useEffect(() => { clear(); setOn(false); }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.closest('[data-cms-ui]')) return;
      if (document.documentElement.hasAttribute('data-cms-edit')) return; // đang mở trình chỉnh sửa
      let url: URL;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname || url.pathname.startsWith('/admin') || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return;
      clear();
      timers.current.push(window.setTimeout(() => setOn(true), 120));
      timers.current.push(window.setTimeout(() => setOn(false), 10_000)); // mạng lỗi / bị chặn: không treo khung chờ
    };
    const off = () => { clear(); setOn(false); };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', off);
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('popstate', off); clear(); };
  }, []);

  if (!on) return null;
  return (
    <div className="s-navsk" role="status" aria-live="polite" aria-label="Đang mở trang">
      <div className="s-navsk__in">
        <i className="s-sk s-sk--crumb" />
        <i className="s-sk s-sk--kicker" />
        <i className="s-sk s-sk--h1" />
        <i className="s-sk s-sk--h1 s-sk--short" />
        <i className="s-sk s-sk--line" />
        <i className="s-sk s-sk--line s-sk--short" />
        <div className="s-navsk__cards">{[0, 1, 2].map(i => <div key={i} className="s-navsk__card"><i className="s-sk s-sk--img" /><i className="s-sk s-sk--line" /><i className="s-sk s-sk--line s-sk--short" /></div>)}</div>
      </div>
    </div>
  );
}
