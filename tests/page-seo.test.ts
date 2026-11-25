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

test('Mã theo dõi: chỉ nhận đúng định dạng GA4 / GTM / Meta Pixel', async () => {
  const { initial: base, validateContent: valid } = await import('../lib/content.ts');
  const d = normalizeContent(structuredClone(base));
  assert.equal(valid({ ...d, tracking: { ga4: 'G-SFJQ2SGV07', gtm: 'GTM-AB12CD3', metaPixel: '123456789012345' } }), true);
  for (const bad of [{ ga4: "G-1');alert(1);//" }, { gtm: 'GTM-<script>' }, { metaPixel: '12ab' }, { ga4: 'UA-12345-1' }])
    assert.equal(valid({ ...d, tracking: bad }), false, JSON.stringify(bad));
});
