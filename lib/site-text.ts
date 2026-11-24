/**
 * Chữ cố định trên website nhưng sửa được trong trình biên tập (admin → Chỉnh sửa website).
 * Chữ mặc định nằm ngay trong component; bản sửa lưu ở SiteData.texts[khóa] (kiểm tra ở lib/content.ts → validTexts).
 * Khóa đặt theo trang/khối/phần tử, vd. home.why.title, home.why.items.0.text, shell.footer.intro.
 */
import type { SiteData } from './content';
import { requestTexts } from './request-texts.ts';

/** Chữ đang hiển thị: bản sửa (nếu có, không trống) hoặc chữ mặc định. */
export function txt(data: Pick<SiteData, 'texts'> | null | undefined, key: string, fallback: string): string {
  // Không có data (khối dùng chung phía máy chủ) → kho chữ của yêu cầu hiện tại
  let texts = data?.texts;
  if (!data) { try { texts = requestTexts().texts; } catch { texts = undefined; } }
  const v = texts?.[key];
  return typeof v === 'string' && v.trim() ? v : fallback;
}
