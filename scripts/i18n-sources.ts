// Từ danh mục (scripts/i18n-catalog.mjs) → danh sách câu tiếng Việt cần dịch, gom câu trùng, chia gói cho người / máy dịch.
//   node --experimental-strip-types scripts/i18n-sources.ts [.i18n/catalog.json] [số câu mỗi gói=220]
// Ra: .i18n/sources.json (khóa → câu gốc + dấu) và .i18n/chunks/NN.json ([{ id, vi, rich, ml, hint }]).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { initial } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { readCms } from '../lib/cms-paths.ts';
import { metaKey, textHash } from '../lib/i18n.ts';

type Entry = { text: string; def: string | null; rich: boolean; multiline: boolean; label: string; pages: string[] };
const catalog = JSON.parse(readFileSync(process.argv[2] || '.i18n/catalog.json', 'utf8')) as { keys: Record<string, Entry>; meta: Record<string, { title: string; desc: string }> };
const size = Number(process.argv[3] || 220);
const data = normalizeContent(structuredClone(initial));
const BRAND_SUFFIX = / \| DANAVA Solutions$/;

const sources: Record<string, { vi: string; h: string }> = {};
const unique = new Map<string, { id: string; vi: string; rich: boolean; ml: boolean; hint: string }>();
const add = (key: string, vi: string, rich: boolean, ml: boolean, hint: string) => {
  vi = vi.trim();
  if (!vi || !/[a-zA-ZÀ-ỹ]/.test(vi)) return; // bỏ số / ký hiệu thuần
  sources[key] = { vi, h: textHash(vi) };
  const u = `${rich ? 'r' : ''}${ml ? 'm' : ''}|${vi}`;
  if (!unique.has(u)) unique.set(u, { id: `s${unique.size + 1}`, vi, rich, ml, hint });
};

for (const [k, e] of Object.entries(catalog.keys)) {
  // Chữ cố định: câu gốc là chữ mặc định trong mã; vùng gắn dữ liệu: câu gốc là giá trị trong nội dung (đúng như website đọc)
  const vi = k.startsWith('txt.') ? (e.def ?? e.text) : (readCms(data, k) || e.text);
  add(k, vi, e.rich, e.multiline, e.label);
}
for (const [p, m] of Object.entries(catalog.meta)) {
  add(metaKey(p, 'title'), m.title.replace(BRAND_SUFFIX, ''), false, false, 'Tiêu đề SEO (≤ 60 ký tự nếu được)');
  add(metaKey(p, 'desc'), m.desc, false, false, 'Mô tả SEO (≤ 160 ký tự)');
}

mkdirSync('.i18n', { recursive: true });
writeFileSync('.i18n/sources.json', JSON.stringify({ sources, unique: Object.fromEntries([...unique.values()].map(u => [u.vi + '\u0000' + (u.rich ? 'r' : '') + (u.ml ? 'm' : ''), u.id])) }, null, 1));
rmSync('.i18n/chunks', { recursive: true, force: true });
mkdirSync('.i18n/chunks', { recursive: true });
// Bộ nhớ dịch (.i18n/memory.json: câu gốc → { en, ja }): câu đã dịch dùng lại, chỉ câu mới đưa vào gói cần dịch
let memory: Record<string, { en: string; ja: string }> = {};
try { memory = JSON.parse(readFileSync('.i18n/memory.json', 'utf8')); } catch {}
rmSync('.i18n/out', { recursive: true, force: true });
mkdirSync('.i18n/out', { recursive: true });
const known: Record<string, { en: string; ja: string }> = {};
const list = [...unique.values()].filter(u => { const m = memory[u.vi]; if (m) { known[u.id] = m; return false; } return true; });
writeFileSync('.i18n/out/mem.json', JSON.stringify(known));
writeFileSync('.i18n/chunks/mem.json', JSON.stringify([...unique.values()].filter(u => known[u.id])));
for (let i = 0; i < list.length; i += size) writeFileSync(`.i18n/chunks/${String(i / size + 1).padStart(2, '0')}.json`, JSON.stringify(list.slice(i, i + size), null, 1));
console.log(`${Object.keys(sources).length} khóa · ${unique.size} câu khác nhau (đã có ${Object.keys(known).length}, cần dịch ${list.length}) · ${Math.ceil(list.length / size)} gói · ${list.reduce((n, u) => n + u.vi.length, 0)} ký tự`);
