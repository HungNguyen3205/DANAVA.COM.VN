'use client';
/**
 * Liên kết gắn cho một phần chữ (admin → Chỉnh sửa website → Kiểu chữ → Liên kết; lưu ở textStyles[khóa].href).
 * Không đổi cấu trúc DOM do React quản lý: chỉ gắn role/tabindex và bắt sự kiện bấm / Enter chung cho cả trang.
 * Bỏ qua khi đang mở trình biên tập (bấm để chọn chữ) và khi phần chữ đã nằm trong một liên kết / nút có sẵn.
 */
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function CmsLinks({ links }: { links: Record<string, string> }) {
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    const keys = Object.keys(links);
    if (!keys.length) return;
    const editing = () => new URLSearchParams(location.search).get('cms') === '1' || !!document.querySelector('[data-cms-ui]');
    const target = (t: EventTarget | null) => {
      const el = t instanceof Element ? t.closest<HTMLElement>('[data-cms]') : null;
      const href = el ? links[el.dataset.cms || ''] : undefined;
      return el && href && !el.parentElement?.closest('a,button') ? { el, href } : null;
    };
    const go = (href: string, e: MouseEvent | KeyboardEvent) => {
      if (/^(mailto|tel):/.test(href)) { location.href = href; return; }
      const external = /^https?:/.test(href) && !href.startsWith(location.origin);
      if (external || e.ctrlKey || e.metaKey) window.open(href, '_blank', 'noopener');
      else router.push(href);
    };
    const mark = () => {
      if (editing()) return;
      for (const k of keys) document.querySelectorAll<HTMLElement>(`[data-cms="${CSS.escape(k)}"]`).forEach(el => {
        if (el.parentElement?.closest('a,button') || el.hasAttribute('data-cms-href')) return;
        el.setAttribute('data-cms-href', ''); el.setAttribute('role', 'link'); el.tabIndex = 0;
      });
    };
    const onClick = (e: MouseEvent) => { if (editing()) return; const t = target(e.target); if (t) { e.preventDefault(); go(t.href, e); } };
    const onKey = (e: KeyboardEvent) => { if (e.key !== 'Enter' || editing()) return; const t = target(e.target); if (t && t.el === e.target) { e.preventDefault(); go(t.href, e); } };
    mark();
    const timer = window.setTimeout(mark, 600);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(timer); document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, [links, path, router]);
  return null;
}
