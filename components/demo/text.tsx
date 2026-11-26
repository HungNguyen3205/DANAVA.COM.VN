/**
 * Chữ của các trang demo (/demo/*): mỗi câu có khóa ổn định txt.demo.<mẫu>.<vị trí> →
 *  - sửa tại chỗ trong Quản trị → Chỉnh sửa website (chọn trang "Demo: …"), lưu ở SiteData.texts;
 *  - dịch EN/JA như mọi chữ cố định (lib/i18n-seed, scripts/i18n-*.ts), xem ở /en/demo/…, /ja/demo/….
 * Dùng phía máy chủ: đọc kho của yêu cầu (getSiteContent() đã gọi ở app/demo/[slug]/page.tsx).
 */
import { ct } from '../site/cms';
import { txt } from '@/lib/site-text';

export function demoText(id: string, name: string) {
  const key = (k: string) => `demo.${id}.${k}`;
  /** Chữ hiển thị có thể sửa (bọc trong span mang khóa) */
  const t = (k: string, def: string, opts: { multiline?: boolean } = {}) => {
    const x = ct(null, key(k), def, `Demo ${name}`, opts);
    return <span {...x.a}>{x.v}</span>;
  };
  /** Chữ thuần (placeholder, aria-label, giá trị lựa chọn…) — vẫn theo bản sửa / bản dịch */
  const s = (k: string, def: string) => txt(null, key(k), def);
  /** Số chạy từ 0 khi cuộn tới (components/demo/fx.tsx đọc số trong chính span này) — sửa được như chữ */
  const n = (k: string, def: string) => {
    const x = ct(null, key(k), def, `Demo ${name}: số liệu`);
    return <span {...x.a} data-count="">{x.v}</span>;
  };
  return { t, s, n };
}
