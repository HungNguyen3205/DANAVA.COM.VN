/**
 * Lá cờ của ngôn ngữ (SVG vẽ tay, không dùng emoji vì Windows không hiển thị cờ emoji):
 * Tiếng Việt → Việt Nam, English → Vương quốc Anh, 日本語 → Nhật Bản. Tỉ lệ 3:2, bo góc nhẹ (app/(site)/site-header.css → .s-flag).
 */
import { useId } from 'react';
import type { Locale } from '@/lib/i18n';

export function Flag({ loc, className = 's-flag' }: { loc: Locale; className?: string }) {
  const id = useId().replace(/:/g, '');
  if (loc === 'vi') {
    return (
      <svg className={className} viewBox="0 0 30 20" aria-hidden="true" focusable="false">
        <rect width="30" height="20" fill="#da251d" />
        <path fill="#ffcd00" d="M15 4.2l1.36 4.19h4.4l-3.56 2.59 1.36 4.18L15 12.57l-3.56 2.59 1.36-4.18-3.56-2.59h4.4z" />
      </svg>
    );
  }
  if (loc === 'ja') {
    return (
      <svg className={className} viewBox="0 0 30 20" aria-hidden="true" focusable="false">
        <rect width="30" height="20" fill="#fff" />
        <circle cx="15" cy="10" r="6" fill="#bc002d" />
      </svg>
    );
  }
  // Union Jack (rút gọn theo tỉ lệ 3:2)
  return (
    <svg className={className} viewBox="0 0 60 40" aria-hidden="true" focusable="false">
      <clipPath id={`${id}a`}><rect width="60" height="40" /></clipPath>
      <clipPath id={`${id}b`}><path d="M30 20h30v20zM30 20v20H0zM30 20H0V0zM30 20V0h30z" /></clipPath>
      <g clipPath={`url(#${id}a)`}>
        <rect width="60" height="40" fill="#012169" />
        <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
        <path d="M0 0l60 40M60 0L0 40" stroke="#c8102e" strokeWidth="4" clipPath={`url(#${id}b)`} />
        <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
        <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="7" />
      </g>
    </svg>
  );
}
