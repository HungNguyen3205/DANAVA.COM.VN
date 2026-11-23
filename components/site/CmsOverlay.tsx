'use client';
/**
 * Lớp chỉnh sửa trên trang thật, chỉ bật khi trang mở trong iframe của admin với ?cms=1.
 * Nhận danh sách trường (giá trị đang công khai + giá trị đang soạn) từ cửa sổ cha CÙNG NGUỒN,
 * tìm đoạn chữ khớp giá trị công khai, cho bấm chọn và thay chữ ngay khi soạn.
 * Không gửi gì ra ngoài, không đọc dữ liệu từ máy chủ; mở trang bình thường thì không làm gì.
 */
import { useEffect } from 'react';

type Field = { path: string; label: string; published: string; value: string };
const plain = (s: string) => s.replace(/\*/g, '').replace(/\s+/g, ' ').trim();

export function CmsOverlay() {
  useEffect(() => {
    if (window.parent === window || !new URLSearchParams(location.search).has('cms')) return;
    document.documentElement.dataset.cmsEdit = '1';
    const found = new Map<string, HTMLElement>();

    /** Phần tử nhỏ nhất có chữ trùng khớp (bỏ dấu * nhấn mạnh, gộp khoảng trắng). */
    function locate(text: string): HTMLElement | null {
      const want = plain(text);
      if (want.length < 3) return null;
      let best: HTMLElement | null = null;
      for (const el of document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main span, main a, main li, main b, main strong, main em, main div')) {
        if (el.closest('[data-cms-skip]')) continue;
        if (plain(el.textContent || '') !== want) continue;
        if (!best || best.contains(el)) best = el;
      }
      return best;
    }

    function apply(fields: Field[], selected: string) {
      for (const f of fields) {
        let el = found.get(f.path);
        if (!el || !el.isConnected) {
          el = locate(f.published) || undefined;
          if (el) { el.dataset.cmsPath = f.path; el.dataset.cmsLabel = f.label; found.set(f.path, el); }
        }
        if (el && plain(el.textContent || '') !== plain(f.value)) el.textContent = plain(f.value);
        el?.classList.toggle('is-cms-selected', f.path === selected);
      }
      window.parent.postMessage({ type: 'danava-cms:found', paths: [...found.keys()] }, location.origin);
    }

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== window.parent) return;
      if (e.data?.type === 'danava-cms:fields') apply(e.data.fields as Field[], String(e.data.selected || ''));
      if (e.data?.type === 'danava-cms:scroll') found.get(String(e.data.path))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cms-path]');
      // Không rời trang khi đang chỉnh; bấm vào chữ chỉnh được → chọn trường
      if ((e.target as HTMLElement).closest('a, button, form')) e.preventDefault();
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ type: 'danava-cms:select', path: el.dataset.cmsPath }, location.origin);
    };
    addEventListener('message', onMessage);
    document.addEventListener('click', onClick, true);
    window.parent.postMessage({ type: 'danava-cms:ready' }, location.origin);
    return () => { removeEventListener('message', onMessage); document.removeEventListener('click', onClick, true); };
  }, []);
  return null;
}
