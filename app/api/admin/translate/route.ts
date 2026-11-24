/**
 * Dịch tự động các phần chữ trên một trang sang English / 日本語 (admin → Chỉnh sửa website → EN/JA → "Dịch tự động").
 * Vào: { loc: 'en' | 'ja', items: [{ path, vi }] } — khóa vùng chữ (lib/cms-paths.ts) + câu tiếng Việt đang hiển thị.
 * Ra: { translations: { path: chữ đã dịch }, kept: số câu đã có bản dịch còn đúng (bỏ qua), failed }.
 * Chỉ dịch câu CHƯA có bản dịch còn khớp (bản dịch máy có sẵn hoặc bản sửa trong admin). Kết quả chưa lưu: admin ghi vào bản nháp.
 * Cần GEMINI_API_KEY trên máy chủ (cùng khóa với ANNA). Quyền: soạn nội dung.
 */
import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { getWorkingContent } from '@/lib/database';
import { validCmsPath } from '@/lib/cms-paths';
import { fresh, isForeign } from '@/lib/i18n';
import { translationsFor } from '@/lib/i18n-server';
import { translateTexts, translationKey } from '@/lib/i18n-translate';

export const dynamic = 'force-dynamic';
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const user = await requirePermission(req, 'content.draft', true);
  if (user instanceof Response) return user;
  let v: { loc?: unknown; items?: unknown };
  try { v = await req.json(); } catch { return bad('Không đọc được dữ liệu gửi lên.'); }
  if (!isForeign(v.loc)) return bad('Ngôn ngữ không hợp lệ.');
  if (!Array.isArray(v.items) || v.items.length > 600) return bad('Danh sách cần dịch không hợp lệ.');
  const loc = v.loc;
  const items = (v.items as { path?: unknown; vi?: unknown }[]).filter((i): i is { path: string; vi: string } =>
    typeof i?.path === 'string' && typeof i.vi === 'string' && validCmsPath(i.path) && i.vi.trim() !== '' && i.vi.length <= 6000);
  // Bỏ câu đã có bản dịch còn đúng (bản dịch máy có sẵn + bản sửa trong admin)
  const { data } = await getWorkingContent();
  const have = translationsFor(data, loc);
  const todo = items.filter(i => !fresh(have[i.path], i.vi) && /[a-zA-ZÀ-ỹ]/.test(i.vi));
  const kept = items.length - todo.length;
  if (!todo.length) return NextResponse.json({ translations: {}, kept, failed: 0 });
  if (!translationKey()) return bad('Máy chủ chưa cấu hình dịch tự động (GEMINI_API_KEY). Bạn vẫn có thể gõ bản dịch trực tiếp trên trang.', 503);
  const translations = await translateTexts(loc, Object.fromEntries(todo.map(t => [t.path, t.vi])));
  const failed = todo.length - Object.keys(translations).length;
  return NextResponse.json({ translations, kept, failed }, { headers: { 'Cache-Control': 'no-store' } });
}
