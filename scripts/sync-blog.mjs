// Đồng bộ 30 bài blog (đã kèm ảnh) từ lib/legacy-catalog.ts vào database đang chạy.
// Chạy: node --env-file-if-exists=.env scripts/sync-blog.mjs
// - Tự sao lưu database trước khi ghi.
// - Chỉ thay nội dung bài chưa bị sửa tay qua CMS (so với dấu vân tay bản cũ); chạy lại nhiều lần vẫn an toàn.
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const load = p => import(pathToFileURL(resolve(p)).href);
const { legacyCatalog } = await load('lib/legacy-catalog.ts');
const { db, getContent, writeContent } = await load('lib/database.ts');

// Dấu vân tay nội dung + chuyên mục của bản catalog trước khi nhập ảnh (commit 569abbd).
const previous = {"wp-13591":{"h":"20da61455035ecfa1d348b8c","c":"Sự Kiện"},"cong-nang-luong":{"h":"bc4ca49feea29a881d39aa3a","c":"Yoga"},"thien-tra":{"h":"e3dbb563fad358251a7cbea2","c":"Tổng Hợp"},"wp-13491":{"h":"73cf8fc4ccc9bc9f26507437","c":"Yoga"},"wp-13468":{"h":"d551d8c54f717ed17ce661f6","c":"Sự Kiện"},"wp-13417":{"h":"ef1b00e6a86bc9fab2827412","c":"Tổng Hợp"},"marketing":{"h":"958cd10d138abb38dfd533ef","c":"Tổng Hợp"},"wp-13136":{"h":"71c3f96f35b174552304abc0","c":"Tổng Hợp"},"wp-13086":{"h":"5f7e6a752ca32814cc835159","c":"Tổng Hợp"},"wp-12723":{"h":"9faecb7c1c6507a89c2d17ef","c":"Tổng Hợp"},"wp-12369":{"h":"b13a1a2031b8eaf2d1ea3937","c":"Tổng Hợp"},"wp-12136":{"h":"51d3ffe716bb5aa34609b763","c":"Tổng Hợp"},"wp-12114":{"h":"dc05d726c1e20457cbf78c0b","c":"Tổng Hợp"},"wp-12101":{"h":"f393262c398d5459bc2cc064","c":"Tổng Hợp"},"wp-11951":{"h":"177d5641be91007777170ddf","c":"Tổng Hợp"},"wp-11946":{"h":"98fd48d2b06fb56e022501d3","c":"Ô Tô"},"wp-11941":{"h":"cde61abf3169e7dce67edb80","c":"Tổng Hợp"},"wp-11934":{"h":"b081ac3997372d264ccbdd06","c":"Ô Tô"},"wp-11928":{"h":"156c0e426105e0ff0416df3b","c":"Ô Tô"},"wp-11916":{"h":"5152a21fa3cfc9a48a75c795","c":"Tổng Hợp"},"wp-11869":{"h":"e26bf1c79d4f6cf6ed962b8b","c":"Tổng Hợp"},"wp-11789":{"h":"fb802db74467cb769f28520b","c":"Ô Tô"},"wp-11766":{"h":"d6858958e7615a2b8be5a5d2","c":"Ô Tô"},"wp-11314":{"h":"cac248820af26dde46614ac4","c":"Tổng Hợp"},"wp-11303":{"h":"2403ded0c4c9a88fcea2d046","c":"Tổng Hợp"},"wp-11219":{"h":"1e5beaa8cb91792334f575ac","c":"Tổng Hợp"},"wp-11212":{"h":"c750066284d7c92388719bda","c":"Yoga"},"wp-11198":{"h":"442fb1a1a52bb9f39b15b79d","c":"Yoga"},"wp-11193":{"h":"9319511e1b7dd679ab226ddd","c":"Tổng Hợp"},"wp-11165":{"h":"84dd3bee2ab5665b2fa12662","c":"Ô Tô"}};
const norm = s => (s || '').normalize('NFC').replace(/\s+/g, ' ').trim();
const hash = s => createHash('sha256').update(norm(s)).digest('hex').slice(0, 24);

const cur = getContent();
if (cur.revision === 0) { console.log('Database chưa có nội dung lưu: web dùng thẳng catalog mới, không cần đồng bộ.'); process.exit(0); }

let updated = 0, added = 0; const kept = [];
const posts = cur.data.posts.map(p => {
  const n = legacyCatalog.find(x => x.id === p.id);
  if (!n) return p;
  const out = { ...p };
  const old = previous[p.id];
  if (norm(p.body) !== norm(n.body)) { if (old && hash(p.body) === old.h) out.body = n.body; else kept.push(p.id); }
  if (!p.image && n.image) out.image = n.image;
  if (old && p.category === old.c) out.category = n.category;
  if (JSON.stringify(out) !== JSON.stringify(p)) updated++;
  return out;
});
for (const n of legacyCatalog) if (!posts.some(p => p.id === n.id || p.slug === n.slug)) { posts.push({ ...n }); added++; }

if (!updated && !added) { console.log('Blog đã cập nhật sẵn, không có gì thay đổi.'); process.exit(0); }
const backup = resolve(process.env.DANAVA_DATA_DIR || '.data', `danava.backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
db().exec(`VACUUM INTO '${backup.replace(/'/g, "''")}'`);
const rev = writeContent({ ...cur.data, posts }, cur.revision);
if (rev === null) { console.error('Nội dung vừa bị thay đổi trong lúc đồng bộ, hãy chạy lại.'); process.exit(1); }
console.log(`Đã cập nhật ${updated} bài, thêm ${added} bài (revision ${cur.revision} -> ${rev}). Sao lưu: ${backup}`);
if (kept.length) console.log('Giữ nguyên nội dung đã sửa trong CMS:', kept.join(', '));
