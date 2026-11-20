import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GO, HELLO, WORK } from '../lib/products.ts';

test('3 trang giới thiệu sản phẩm có route, trong sitemap và nút tới trang thật', () => {
  for (const slug of ['danava-go', 'hello-danava', 'danava-work']) {
    assert.ok(fs.existsSync(`app/(site)/giai-phap/${slug}/page.tsx`), slug);
    assert.ok(fs.readFileSync('app/sitemap.ts', 'utf8').includes(`/giai-phap/${slug}/`), slug + ' trong sitemap');
  }
  assert.equal(GO.url, 'https://danavago.com/');
  assert.equal(HELLO.url, 'https://hello.danava.vn/');
  assert.equal(WORK.url, 'https://workspace.danava.com.vn/');
  const page = fs.readFileSync('components/site/ProductPages.tsx', 'utf8');
  for (const k of ['GO.url', 'HELLO.url', 'WORK.url']) assert.ok(page.includes(`href={${k}}`), 'nút tới ' + k);
});

test('nội dung sản phẩm trung thực: GO ghi rõ đang chạy thử; giá Hello đúng bảng giá 12 tháng', () => {
  assert.match(GO.status, /chạy thử/);
  assert.deepEqual(HELLO.plans.map(p => p.price), ['Miễn phí', '5.000.000 ₫', '10.000.000 ₫', '20.000.000 ₫']);
  assert.match(HELLO.termNote, /6 tháng và 24 tháng: liên hệ/);
  assert.equal(HELLO.modules.length, 16);
  assert.ok(HELLO.modules.every(m => m.v.length === 4));
  // Bảng công việc trên trang Work là hình minh họa, không chứa nội dung giả
  assert.ok(fs.readFileSync('components/site/ProductPages.tsx', 'utf8').includes('Hình minh họa luồng công việc, không phải dữ liệu thật'));
});
