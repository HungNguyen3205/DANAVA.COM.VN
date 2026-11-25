/**
 * Bộ icon minh họa dễ thương cho trang Liên hệ (SVG tự vẽ, nhiều màu, không cần tải thêm).
 * Mỗi icon là hình trang trí: luôn aria-hidden, chữ bên cạnh mới là nội dung.
 */
type P = { className?: string };
const base = (className?: string) => ({ className: `cute${className ? ' ' + className : ''}`, viewBox: '0 0 48 48', 'aria-hidden': true as const, focusable: 'false' as const });

/** Điện thoại có sóng âm và trái tim nhỏ */
export function CutePhone({ className }: P) {
  return (
    <svg {...base(className)}>
      <rect x="2" y="2" width="44" height="44" rx="15" fill="#fff" />
      <path d="M15.6 12.4c1.5-1.5 3.9-1.3 5.1.4l2.1 3.1c.9 1.4.7 3.2-.5 4.3l-1.7 1.6c1.3 2.9 3.6 5.2 6.5 6.5l1.6-1.7c1.1-1.2 2.9-1.4 4.3-.5l3.1 2.1c1.7 1.2 1.9 3.6.4 5.1l-1.7 1.7c-1.7 1.7-4.2 2.3-6.5 1.5C21 33.7 14.3 27 11.4 19.6c-.8-2.3-.2-4.8 1.5-6.5z" fill="#f2850e" />
      <path d="M17.3 15.6c.6-.6 1.4-.8 2-.3" stroke="#ffd9b0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M28.5 11.5a8.5 8.5 0 0 1 8 8" stroke="#f5ae1b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M28.8 6.5a13.5 13.5 0 0 1 12.7 12.7" stroke="#ffd27a" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M38 39.6c-2.6-1.8-4.1-3.2-4.1-4.8 0-1.1.8-1.9 1.9-1.9.7 0 1.4.4 2.2 1.3.8-.9 1.5-1.3 2.2-1.3 1.1 0 1.9.8 1.9 1.9 0 1.6-1.5 3-4.1 4.8z" fill="#ff5b6e" />
    </svg>
  );
}

/** Bong bóng chat xanh Zalo có mặt cười */
export function CuteChat({ className }: P) {
  return (
    <svg {...base(className)}>
      <rect x="2" y="2" width="44" height="44" rx="15" fill="#e8f1ff" />
      <path d="M9.5 22.5c0-6.9 6.5-12.5 14.5-12.5s14.5 5.6 14.5 12.5S32 35 24 35c-1.7 0-3.3-.2-4.8-.7l-6.5 3.2 1.8-5.6c-3.1-2.3-5-5.6-5-9.4z" fill="#0068ff" />
      <circle cx="18.6" cy="21.4" r="2" fill="#fff" />
      <circle cx="29.4" cy="21.4" r="2" fill="#fff" />
      <path d="M19 26.4c2.8 2.4 7.2 2.4 10 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="15.2" cy="25.6" r="1.6" fill="#7fb2ff" />
      <circle cx="32.8" cy="25.6" r="1.6" fill="#7fb2ff" />
    </svg>
  );
}

/** Phong bì vàng có con dấu trái tim */
export function CuteMail({ className }: P) {
  return (
    <svg {...base(className)}>
      <rect x="2" y="2" width="44" height="44" rx="15" fill="#fff1d6" />
      <rect x="9" y="13" width="30" height="22" rx="6" fill="#f5ae1b" />
      <path d="M10.5 16.5 24 26.5l13.5-10" stroke="#fff6e2" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M24 33.2c-3.4-2.3-5.3-4.1-5.3-6.1 0-1.4 1-2.5 2.4-2.5.9 0 1.8.5 2.9 1.6 1.1-1.1 2-1.6 2.9-1.6 1.4 0 2.4 1.1 2.4 2.5 0 2-1.9 3.8-5.3 6.1z" fill="#ff5b6e" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

/** Mặt trời (đang trong giờ làm việc) */
export function CuteSun({ className }: P) {
  return (
    <svg {...base(className)}>
      <g stroke="#f5ae1b" strokeWidth="3.2" strokeLinecap="round">
        <path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.9 9.9l3.5 3.5M34.6 34.6l3.5 3.5M9.9 38.1l3.5-3.5M34.6 13.4l3.5-3.5" />
      </g>
      <circle cx="24" cy="24" r="10.5" fill="#ffc65a" />
      <circle cx="20.4" cy="23" r="1.4" fill="#7a4a00" />
      <circle cx="27.6" cy="23" r="1.4" fill="#7a4a00" />
      <path d="M21 27c1.7 1.4 4.3 1.4 6 0" stroke="#7a4a00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Mặt trời ngủ trưa (đang nghỉ trưa): mắt nhắm, má hồng, chữ z bay lên */
export function CuteSunNap({ className }: P) {
  return (
    <svg {...base(className)}>
      <g stroke="#f7c25c" strokeWidth="3" strokeLinecap="round" opacity=".75">
        <path d="M24 5v4M24 39v4M5 24h4M39 24h4M10.6 10.6l2.8 2.8M34.6 34.6l2.8 2.8M10.6 37.4l2.8-2.8" />
      </g>
      <circle cx="24" cy="24" r="10.5" fill="#ffd27a" />
      <path d="M18.6 23.2c1 .9 2.6.9 3.6 0M25.8 23.2c1 .9 2.6.9 3.6 0" stroke="#7a4a00" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <circle cx="18.2" cy="26.6" r="1.5" fill="#ffab91" opacity=".8" />
      <circle cx="29.8" cy="26.6" r="1.5" fill="#ffab91" opacity=".8" />
      <path d="M22.6 28.4h2.8" stroke="#7a4a00" strokeWidth="1.6" strokeLinecap="round" />
      <path className="cute-z cute-z--1" d="M34 6.5h4l-4 4.5h4" stroke="#4a5a99" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="cute-z cute-z--2" d="M40 1.5h3l-3 3.4h3" stroke="#4a5a99" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Mặt trăng ngủ (ngoài giờ làm việc) */
export function CuteMoon({ className }: P) {
  return (
    <svg {...base(className)}>
      <path d="M31.5 8.5A16 16 0 1 0 39.5 33 13 13 0 0 1 31.5 8.5z" fill="#c9d6ff" />
      <path d="M17 25c1.2 1 2.8 1 4 0M25 27c1.2 1 2.8 1 4 0" stroke="#4a5a99" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M36 10l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" fill="#ffd27a" />
    </svg>
  );
}

/** Fanpage */
export function CuteFacebook({ className }: P) {
  return (
    <svg {...base(className)}>
      <circle cx="24" cy="24" r="21" fill="#1877f2" />
      <path d="M26.6 39V26.4h4.2l.6-4.9h-4.8v-3.1c0-1.4.4-2.4 2.4-2.4h2.6v-4.4a35 35 0 0 0-3.8-.2c-3.7 0-6.3 2.3-6.3 6.5v3.6h-4.2v4.9h4.2V39z" fill="#fff" />
    </svg>
  );
}

/** YouTube */
export function CuteYoutube({ className }: P) {
  return (
    <svg {...base(className)}>
      <rect x="4" y="10" width="40" height="28" rx="10" fill="#ff1f3d" />
      <path d="M20.5 17.5v13l11-6.5z" fill="#fff" />
    </svg>
  );
}

/** Tai nghe hỗ trợ có mặt cười */
export function CuteSupport({ className }: P) {
  return (
    <svg {...base(className)}>
      <circle cx="24" cy="24" r="21" fill="#e6f6ee" />
      <path d="M13 27v-4a11 11 0 0 1 22 0v4" stroke="#11804d" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="9.5" y="23.5" width="7" height="10" rx="3.5" fill="#34c38f" />
      <rect x="31.5" y="23.5" width="7" height="10" rx="3.5" fill="#34c38f" />
      <path d="M35 33.5c0 3-2.8 5-6.5 5H26" stroke="#11804d" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="20.6" cy="24.5" r="1.6" fill="#11804d" />
      <circle cx="27.4" cy="24.5" r="1.6" fill="#11804d" />
      <path d="M21 28.6c1.7 1.4 4.3 1.4 6 0" stroke="#11804d" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}
