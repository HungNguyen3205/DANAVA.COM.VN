/** Thư viện ảnh: mọi ảnh của website có trong danh mục (lib/asset-catalog.json) và đều thuộc một nhóm (lib/media-groups.ts). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MEDIA_GROUPS, OTHER_GROUP, groupOf } from '../lib/media-groups.ts';
import { initial } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';

const catalog = JSON.parse(fs.readFileSync('lib/asset-catalog.json', 'utf8')) as { url: string; bytes: number; w: number; h: number }[];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'uploads' ? [] : walk(full);
    return /\.(webp|png|jpe?g|svg)$/i.test(e.name) ? ['/' + path.relative('public', full).split(path.sep).join('/')] : [];
  });
}

test('danh mục ảnh khớp đúng thư mục public/assets (thêm/xóa ảnh → chạy npm run assets:catalog)', () => {
  const files = walk('public/assets').sort();
  assert.deepEqual(catalog.map(x => x.url), files);
  for (const x of catalog) assert.ok(x.bytes > 0, x.url);
});

test('mọi ảnh có sẵn đều thuộc một nhóm rõ ràng (không rơi vào "Chưa phân nhóm")', () => {
  const lost = catalog.filter(x => groupOf(x.url) === OTHER_GROUP).map(x => x.url);
  assert.deepEqual(lost, [], 'thêm nhóm cho thư mục mới trong lib/media-groups.ts');
  assert.equal(groupOf('/assets/uploads/abc.webp').id, 'uploads');
  // Thư mục con được khớp trước thư mục cha
  assert.equal(groupOf('/assets/partners/covers/x.webp').id, 'partners-covers');
  assert.equal(groupOf('/assets/partners/x.webp').id, 'partners');
  assert.equal(new Set(MEDIA_GROUPS.map(g => g.id)).size, MEDIA_GROUPS.length);
});

test('mọi ảnh nội dung mặc định đang dùng đều có trong thư viện (không có ảnh hỏng)', () => {
  const data = normalizeContent(structuredClone(initial));
  const used = new Set([...JSON.stringify(data).matchAll(/\/assets\/[a-zA-Z0-9/_.-]+\.(?:webp|png|jpe?g|svg)/g)].map(m => m[0]).filter(u => !u.startsWith('/assets/uploads/')));
  const have = new Set(catalog.map(x => x.url));
  assert.deepEqual([...used].filter(u => !have.has(u)), []);
});
