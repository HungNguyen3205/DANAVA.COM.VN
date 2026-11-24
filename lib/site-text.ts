/**
 * Chữ cố định trên website nhưng sửa được trong trình biên tập (admin → Chỉnh sửa website).
 * Chữ mặc định nằm ngay trong component; bản sửa lưu ở SiteData.texts[khóa] (kiểm tra ở lib/content.ts → validTexts).
 * Khóa đặt theo trang/khối/phần tử, vd. home.why.title, home.why.items.0.text, shell.footer.intro.
 * Khi xem /en/ hoặc /ja/: bản dịch của câu tiếng Việt đang hiển thị (lib/i18n-server.ts → localeView), còn khớp dấu thì dùng.
 */
import type { SiteData } from './content';
import { fresh } from './i18n.ts';
import { requestTexts } from './request-texts.ts';

/** Chữ đang hiển thị: bản sửa (nếu có, không trống) hoặc chữ mặc định; đang xem ngôn ngữ khác → bản dịch nếu có. */
export function txt(data: Pick<SiteData, 'texts' | 'localeView'> | null | undefined, key: string, fallback: string): string {
  // Không có data (khối dùng chung phía máy chủ) → kho của yêu cầu hiện tại
  let texts = data?.texts, view = data?.localeView;
  if (!data) { try { const s = requestTexts(); texts = s.texts; view = s.view; } catch { texts = undefined; view = undefined; } }
  // Script lập danh mục dịch (scripts/i18n-catalog.mjs) bật window.__danavaTxt để ghi lại cả chữ không gắn data-cms (aria, lựa chọn, gợi ý)
  if (typeof window !== 'undefined') { const w = window as { __danavaTxt?: Record<string, string> }; if (w.__danavaTxt) w.__danavaTxt[key] = fallback; }
  const v = texts?.[key];
  const vi = typeof v === 'string' && v.trim() ? v : fallback;
  // Câu gốc bắt đầu bằng dấu cách (ghép sau chữ khác, vd. ' (mở tab mới)') → bản dịch giữ dấu cách đó
  if (view) { const tr = view.tr[`txt.${key}`]; if (fresh(tr, vi)) return /^\s/.test(vi) && !/^\s/.test(tr.t) ? ` ${tr.t}` : tr.t; }
  return vi;
}
