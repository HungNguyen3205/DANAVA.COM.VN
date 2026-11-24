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
import { fresh, isForeign, LOCALE_INFO } from '@/lib/i18n';
import { translationsFor } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const MODELS = [process.env.DANAVA_GEMINI_MODEL?.trim() || 'gemini-flash-latest', 'gemini-flash-lite-latest'];
const BATCH = 60;
const stars = (s: string) => (s.match(/\*[^*]+\*/g) || []).length;

const RULES: Record<'en' | 'ja', string> = {
  en: 'US English, natural professional marketing tone for business customers.',
  ja: 'Japanese, polite です/ます business style, natural (not literal).'
};

async function translateBatch(apiKey: string, loc: 'en' | 'ja', batch: Record<string, string>): Promise<Record<string, string>> {
  const prompt = [
    `Translate the Vietnamese website texts in the JSON object below into ${LOCALE_INFO[loc].label}.`,
    `Style: ${RULES[loc]}`,
    'Context: DANAVA Solutions (Da Nang, Vietnam) — studio management software (DANAVA Studio), website design, digital marketing, events & travel (DANAVA GO), AI assistant ANNA.',
    'Rules: keep the same keys; keep *emphasis* segments (same number of *…* pairs); keep line breaks; keep brand/product names, people/company names, URLs, emails, numbers and prices unchanged;',
    'Vietnamese place names: English without diacritics (Da Nang, Ho Chi Minh City), Japanese in katakana; short UI labels stay short; never leave Vietnamese text.',
    'Return ONLY a JSON object with the same keys and translated string values.',
    JSON.stringify(batch)
  ].join('\n');
  let res: Response | undefined;
  for (const model of MODELS) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
      signal: AbortSignal.timeout(60_000)
    });
    if (res.status !== 503 && res.status !== 429) break;
  }
  if (!res?.ok) throw Error(`Dịch máy lỗi (${res?.status ?? 'mạng'}).`);
  const body = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = body.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (!(k in batch) || typeof v !== 'string' || !v.trim() || v.length > 12000) continue;
    if (stars(batch[k]) !== stars(v)) continue; // mất / thừa phần nhấn mạnh → bỏ, giữ tiếng Việt
    out[k] = v.trim();
  }
  return out;
}

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
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return bad('Máy chủ chưa cấu hình dịch tự động (GEMINI_API_KEY). Bạn vẫn có thể gõ bản dịch trực tiếp trên trang.', 503);
  const translations: Record<string, string> = {};
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = Object.fromEntries(todo.slice(i, i + BATCH).map(t => [t.path, t.vi]));
    try { Object.assign(translations, await translateBatch(apiKey, loc, batch)); }
    catch { /* lô lỗi: các câu này giữ tiếng Việt */ }
  }
  const failed = todo.length - Object.keys(translations).length;
  return NextResponse.json({ translations, kept, failed }, { headers: { 'Cache-Control': 'no-store' } });
}
