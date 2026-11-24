/**
 * Dịch máy (máy chủ) các câu tiếng Việt của website sang ngôn ngữ khác bằng Gemini (cùng GEMINI_API_KEY với ANNA).
 * Dùng cho: nút "Dịch tự động" (app/api/admin/translate) và tự dịch khi xuất bản (lib/i18n-auto.ts).
 * Câu dịch hỏng (mất phần *nhấn mạnh*, rỗng, quá dài) bị bỏ → website giữ tiếng Việt cho câu đó, không hiện bản dịch sai.
 */
import { LOCALE_INFO, type ForeignLocale } from './i18n.ts';

const MODELS = () => [process.env.DANAVA_GEMINI_MODEL?.trim() || 'gemini-flash-latest', 'gemini-flash-lite-latest'];
const BATCH = 60;
const stars = (s: string) => (s.match(/\*[^*]+\*/g) || []).length;

const STYLE: Record<ForeignLocale, string> = {
  en: 'US English, natural professional marketing tone for business customers.',
  ja: 'Japanese, polite です/ます business style, natural (not literal).'
};

export const translationKey = () => process.env.GEMINI_API_KEY?.trim() || '';

async function batchTranslate(apiKey: string, loc: ForeignLocale, batch: Record<string, string>, signal?: AbortSignal): Promise<Record<string, string>> {
  const prompt = [
    `Translate the Vietnamese website texts in the JSON object below into ${LOCALE_INFO[loc].label}.`,
    `Style: ${STYLE[loc]}`,
    'Context: DANAVA Solutions (Da Nang, Vietnam) — studio management software (DANAVA Studio), website design, digital marketing, events & travel (DANAVA GO), AI assistant ANNA.',
    'Rules: keep the same keys; keep *emphasis* segments (same number of *…* pairs); keep line breaks and placeholders like {plan}; keep brand/product names, people/company names, URLs, emails, numbers and prices unchanged;',
    'Vietnamese place names: English without diacritics (Da Nang, Ho Chi Minh City), Japanese in katakana; short UI labels stay short; never leave Vietnamese text.',
    'Return ONLY a JSON object with the same keys and translated string values.',
    JSON.stringify(batch)
  ].join('\n');
  let res: Response | undefined;
  for (const model of MODELS()) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000)
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

/** Dịch { khóa: câu tiếng Việt } → { khóa: bản dịch }; câu / lô lỗi bị bỏ qua (không ném lỗi trừ khi thiếu khóa API). */
export async function translateTexts(loc: ForeignLocale, items: Record<string, string>, signal?: AbortSignal): Promise<Record<string, string>> {
  const apiKey = translationKey();
  if (!apiKey) throw Error('Máy chủ chưa cấu hình dịch tự động (GEMINI_API_KEY).');
  const keys = Object.keys(items);
  const out: Record<string, string> = {};
  for (let i = 0; i < keys.length; i += BATCH) {
    if (signal?.aborted) break;
    const batch = Object.fromEntries(keys.slice(i, i + BATCH).map(k => [k, items[k]]));
    try { Object.assign(out, await batchTranslate(apiKey, loc, batch, signal)); } catch { /* lô lỗi: các câu này giữ tiếng Việt */ }
  }
  return out;
}
