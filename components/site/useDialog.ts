'use client';
import { useEffect, useRef } from 'react';

const CLOSE_MS = 200;
let modals = 0;

/** Khóa cuộn trang nền; đếm để hai bảng chồng nhau (bảng liên hệ → ANNA) không mở khóa sớm. */
function lock() {
  modals += 1;
  document.documentElement.classList.add('has-modal');
  return () => {
    modals -= 1;
    if (modals === 0) document.documentElement.classList.remove('has-modal');
  };
}

/**
 * Điều khiển <dialog> gốc của trình duyệt.
 * modal = true: showModal() → nằm trên mọi lớp (thanh tab, nút nổi, banner), nền không bấm/cuộn được, Tab không lọt ra ngoài.
 * Đóng có hiệu ứng: data-state="closing" rồi mới close(). Trình duyệt tự trả focus về nút đã mở.
 */
export function useDialog(open: boolean, onClose: () => void, modal = true) {
  const ref = useRef<HTMLDialogElement>(null);
  const latest = useRef({ open, onClose });
  latest.current = { open, onClose };

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!open) {
      if (!dialog.open) return;
      dialog.dataset.state = 'closing';
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timer = setTimeout(() => dialog.close(), reduced ? 0 : CLOSE_MS);
      return () => clearTimeout(timer);
    }
    if (!dialog.open) {
      if (modal) dialog.showModal(); else dialog.show();
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
      dialog.querySelector<HTMLElement>('[data-scroll-top]')?.scrollTo({ top: 0, behavior: 'instant' });
    }
    dialog.dataset.state = 'open';
    return modal ? lock() : undefined;
  }, [open, modal]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const cancel = (event: Event) => { event.preventDefault(); latest.current.onClose(); };
    // Trình duyệt có thể tự đóng (bấm Esc hai lần, nút Back của Android) mà không cho chặn
    const closed = () => { if (!dialog.open && latest.current.open) latest.current.onClose(); };
    // show() không có sự kiện cancel
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !dialog.matches(':modal')) { event.stopPropagation(); latest.current.onClose(); }
    };
    dialog.addEventListener('cancel', cancel);
    dialog.addEventListener('close', closed);
    dialog.addEventListener('keydown', key);
    return () => {
      dialog.removeEventListener('cancel', cancel);
      dialog.removeEventListener('close', closed);
      dialog.removeEventListener('keydown', key);
    };
  }, []);

  return ref;
}
