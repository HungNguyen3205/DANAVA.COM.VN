// Gộp bản dịch (.i18n/out/*.json: { id: { en, ja } }) với danh sách câu gốc (.i18n/sources.json) → lib/i18n-seed/{en,ja}.json
//   node --experimental-strip-types scripts/i18n-merge.ts
// Mỗi khóa: { t: bản dịch, h: dấu câu tiếng Việt } (lib/i18n.ts). Bỏ bản dịch rỗng, sai số đoạn *nhấn mạnh*, hoặc còn nguyên tiếng Việt.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

type Src = { sources: Record<string, { vi: string; h: string }>; unique: Record<string, string> };
const src = JSON.parse(readFileSync('.i18n/sources.json', 'utf8')) as Src;
const chunks = readdirSync('.i18n/chunks').filter(f => f.endsWith('.json'));
const meta = new Map<string, { vi: string; rich: boolean; ml: boolean }>();
for (const f of chunks) for (const u of JSON.parse(readFileSync(`.i18n/chunks/${f}`, 'utf8'))) meta.set(u.id, u);
const out: Record<string, { en?: string; ja?: string }> = {};
for (const f of readdirSync('.i18n/out').filter(f => f.endsWith('.json'))) Object.assign(out, JSON.parse(readFileSync(`.i18n/out/${f}`, 'utf8')));

const stars = (s: string) => (s.match(/\*[^*]+\*/g) || []).length;
const VI_ONLY = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const seed = { en: {} as Record<string, { t: string; h: string }>, ja: {} as Record<string, { t: string; h: string }> };
const problems: string[] = [];
let missing = 0;

// Câu gốc → mã câu (gom trùng): khóa trong unique là "câu\0cờ"
const idOf = new Map<string, string>();
for (const [k, id] of Object.entries(src.unique)) idOf.set(k, id);
const idFor = (vi: string) => { for (const fl of ['', 'r', 'm', 'rm']) { const id = idOf.get(vi + '\u0000' + fl); if (id) return id; } return undefined; };

for (const [key, { vi, h }] of Object.entries(src.sources)) {
  const id = idFor(vi);
  const tr = id ? out[id] : undefined;
  if (!tr) { missing++; continue; }
  const m = meta.get(id!);
  for (const loc of ['en', 'ja'] as const) {
    // Dấu cách đầu câu (vd. ' (mở tab mới)') được thêm lại lúc hiển thị (lib/site-text.ts)
    const t = (tr[loc] || '').trim();
    if (!t) { problems.push(`${key} [${loc}] rỗng`); continue; }
    if (m?.rich && stars(t) !== stars(vi)) { problems.push(`${key} [${loc}] sai số đoạn *nhấn mạnh*`); continue; }
    // Tên riêng tiếng Việt (người, địa danh, thương hiệu) được giữ; câu mà phần lớn từ còn dấu tiếng Việt = chưa dịch
    const words = t.split(/\s+/).filter(Boolean), viWords = words.filter(w => VI_ONLY.test(w)).length;
    if (t !== vi && !/[぀-ヿ一-鿿]/.test(t) && words.length >= 4 && viWords / words.length > 0.5) { problems.push(`${key} [${loc}] còn tiếng Việt: ${t.slice(0, 50)}`); continue; }
    seed[loc][key] = { t, h };
  }
}
const sorted = (o: Record<string, unknown>) => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
writeFileSync('lib/i18n-seed/en.json', JSON.stringify(sorted(seed.en), null, 0).replace(/},"/g, '},\n"') + '\n');
writeFileSync('lib/i18n-seed/ja.json', JSON.stringify(sorted(seed.ja), null, 0).replace(/},"/g, '},\n"') + '\n');
console.log(`EN ${Object.keys(seed.en).length} · JA ${Object.keys(seed.ja).length} · thiếu bản dịch ${missing} · bỏ ${problems.length}`);
for (const p of problems.slice(0, 30)) console.log('  -', p);

// Bộ nhớ dịch cho lần sau (scripts/i18n-sources.ts): câu gốc → { en, ja }
let memory: Record<string, { en?: string; ja?: string }> = {};
try { memory = JSON.parse(readFileSync('.i18n/memory.json', 'utf8')); } catch {}
for (const [id, m] of meta) { const tr = out[id]; if (tr?.en && tr?.ja) memory[m.vi] = { en: tr.en, ja: tr.ja }; }
writeFileSync('.i18n/memory.json', JSON.stringify(memory));
