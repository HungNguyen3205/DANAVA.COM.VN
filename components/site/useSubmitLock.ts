import { useRef } from 'react';

/**
 * Chặn gửi biểu mẫu lặp: bấm 2 lần liên tiếp (trước khi React kịp khóa nút) chỉ gửi 1 yêu cầu.
 * Lần bấm thứ hai khi yêu cầu đầu còn đang gửi bị bỏ qua (vẫn chặn hành vi gửi mặc định của form).
 * Dùng: const lock = useSubmitLock(); <form onSubmit={lock(submit)}>
 */
export function useSubmitLock() {
  const busy = useRef(false);
  return <A extends unknown[]>(fn: (...args: A) => unknown) => async (...args: A) => {
    if (busy.current) {
      (args[0] as { preventDefault?: () => void } | undefined)?.preventDefault?.();
      return;
    }
    busy.current = true;
    try { await fn(...args); } finally { busy.current = false; }
  };
}
