import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { initial, validateContent } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { STATIC_SEO } from '../lib/seo-pages.ts';

test('SEO từng trang: mỗi trang cố định khai báo đúng một lần và trang đó gọi seoPage()', () => {
  const paths = STATIC_SEO.map(p => p.path);
  assert.equal(new Set(paths).size, paths.length, 'không trùng đường dẫn');
  for (const p of STATIC_SEO) {
    const file = 'app/(site)' + (p.path === '/' ? '' : p.path.replace(/\/$/, '')) + '/page.tsx';
    assert.ok(fs.existsSync(file), file);
    assert.ok(fs.readFileSync(file, 'utf8').includes(`seoPage('${p.path}')`), `${file} phải gọi seoPage('${p.path}')`);
    assert.ok(p.title.trim() && p.description.trim(), p.path);
    if (p.image) assert.ok(fs.existsSync('public' + p.image), p.image);
  }
  // Không còn trang nào trong STATIC_SEO dùng chữ cố định (seoLater) song song
  const left = execSync('grep -rl "generateMetadata = seoLater(" "app/(site)" || true').toString().trim();
  assert.equal(left, '', 'trang cố định chuyển hết sang seoPage');
});

test('SEO từng trang: dữ liệu hợp lệ được lưu, dữ liệu sai bị chặn', () => {
  const d = normalizeContent(structuredClone(initial));
  assert.equal(validateContent({ ...d, pageSeo: { '/du-an/': { title: 'Dự án tiêu biểu', description: 'Mô tả', image: '/assets/about/office.webp', noindex: true } } }), true);
  assert.equal(validateContent({ ...d, pageSeo: {} }), true);
  for (const bad of [
    { 'du-an': { title: 'x' } },                                 // đường dẫn sai dạng
    { '/du-an/': { title: 'x'.repeat(201) } },                   // tiêu đề quá dài
    { '/du-an/': { description: 'x'.repeat(301) } },             // mô tả quá dài
    { '/du-an/': { image: 'https://evil.test/a.png' } },         // ảnh ngoài website
    { '/du-an/': { noindex: 'yes' } }
  ]) assert.equal(validateContent({ ...d, pageSeo: bad }), false, JSON.stringify(bad));
  // Lưu qua chuẩn hoá vẫn giữ nguyên
  const kept = normalizeContent({ ...d, pageSeo: { '/': { title: 'Trang chủ mới' } } });
  assert.equal(kept.pageSeo?.['/']?.title, 'Trang chủ mới');
});
