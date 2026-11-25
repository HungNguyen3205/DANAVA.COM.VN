// Bổ sung bản dịch còn thiếu / đã cũ vào lib/i18n-seed/{en,ja}.json từ danh sách câu gốc (.i18n/sources.json).
//   node --env-file=.env --experimental-strip-types scripts/i18n-fill.ts
// Trước đó: node scripts/i18n-catalog.mjs <url> && node --experimental-strip-types scripts/i18n-sources.ts
// 1) Câu tiếng Việt trùng nguyên văn với câu đã dịch ở khóa khác → dùng lại bản dịch đó.
// 2) Còn lại → dịch máy (lib/i18n-translate.ts, Gemini, cần GEMINI_API_KEY), gom câu trùng; bỏ bản dịch còn tiếng Việt.
import { readFileSync, writeFileSync } from 'node:fs';
import { translateTexts } from '../lib/i18n-translate.ts';
import type { ForeignLocale, TranslationMap } from '../lib/i18n.ts';

const src = (JSON.parse(readFileSync('.i18n/sources.json', 'utf8')) as { sources: Record<string, { vi: string; h: string }> }).sources;
const LOT = 30;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
// Model đã chạy được với khóa hiện tại (có thể đổi bằng DANAVA_GEMINI_MODEL)
process.env.DANAVA_GEMINI_MODEL ||= 'gemini-3.5-flash-lite';
const VI_ONLY =/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

for (const loc of ['en', 'ja'] as ForeignLocale[]) {
  const file = `lib/i18n-seed/${loc}.json`;
  const seed = JSON.parse(readFileSync(file, 'utf8')) as TranslationMap;
  const byHash = new Map<string, string>();
  for (const v of Object.values(seed)) if (!byHash.has(v.h)) byHash.set(v.h, v.t);
  let reused = 0;
  const todo = new Map<string, string[]>(); // câu gốc → các khóa cần
  for (const [key, { vi, h }] of Object.entries(src)) {
    if (seed[key]?.h === h) continue;
    const t = byHash.get(h);
    if (t) { seed[key] = { t, h }; reused++; continue; }
    todo.set(vi, [...(todo.get(vi) || []), key]);
  }
  const texts = [...todo.keys()];
  const items = Object.fromEntries(texts.map((vi, i) => [`s${i}`, vi]));
  console.log(`${loc}: dùng lại ${reused}, cần dịch ${texts.length} câu (${[...todo.values()].flat().length} khóa)…`);
  // Gói miễn phí giới hạn số lần gọi mỗi phút → lô nhỏ, giãn cách, lô hỏng thì chờ rồi thử lại
  const out: Record<string, string> = {};
  const ids = Object.keys(items);
  for (let i = 0; i < ids.length; i += LOT) {
    const lot = Object.fromEntries(ids.slice(i, i + LOT).map(k => [k, items[k]]));
    for (let attempt = 0; attempt < 5; attempt++) {
      const got = await translateTexts(loc, lot);
      Object.assign(out, got);
      if (Object.keys(got).length >= Object.keys(lot).length * 0.6) break;
      console.log(`  lô ${i / LOT + 1}: mới được ${Object.keys(got).length}/${Object.keys(lot).length}, chờ 40 giây rồi thử lại…`);
      await sleep(40_000);
    }
    console.log(`  ${loc} ${Math.min(i + LOT, ids.length)}/${ids.length}`);
    await sleep(5_000);
  }
  let added = 0, dropped = 0;
  texts.forEach((vi, i) => {
    const t = out[`s${i}`];
    if (!t || (loc === 'en' && VI_ONLY.test(t)) || t === vi) { dropped++; return; }
    for (const key of todo.get(vi)!) { seed[key] = { t, h: src[key].h }; added++; }
  });
  // cùng định dạng tệp gốc: mỗi khóa một dòng
  writeFileSync(file, '{' + Object.entries(seed).map(([k, v]) => JSON.stringify(k) + ':' + JSON.stringify(v)).join(',\n') + '}\n');
  console.log(`${loc}: thêm ${added} khóa, bỏ ${dropped} câu (lỗi / còn tiếng Việt) → ${file}`);
}
