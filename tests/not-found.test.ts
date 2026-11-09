import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { legacyRedirects } from '../lib/legacy-redirects.ts';

test('app/not-found.tsx source code contains deep navy card, geometric art and Vietnamese messaging', () => {
  const notFoundPath = path.join(process.cwd(), 'app', 'not-found.tsx');
  assert.ok(fs.existsSync(notFoundPath), 'File app/not-found.tsx phải tồn tại');

  const content = fs.readFileSync(notFoundPath, 'utf8');

  // Khung navy
  assert.ok(content.includes('not-found-page-wrapper'), 'Phải có wrapper navy not-found-page-wrapper');
  assert.ok(content.includes('not-found-card'), 'Phải có card trung tâm not-found-card');

  // Minh họa hình học nhẹ
  assert.ok(content.includes('<svg'), 'Phải có thẻ SVG hình học');
  assert.ok(content.includes('not-found-geometric-art'), 'SVG phải có class not-found-geometric-art');
  assert.ok(content.includes('ellipse'), 'SVG phải có vòng elip quỹ đạo');
  assert.ok(content.includes('polygon'), 'SVG phải có khối đa giác');

  // Thông báo tiếng Việt rõ ràng
  assert.ok(content.includes('MÃ LỖI 404'), 'Phải có badge mã lỗi 404');
  assert.ok(
    content.includes('Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển dời.'),
    'Tiêu đề phải là thông báo tiếng Việt lịch thiệp'
  );
  assert.ok(content.includes('DANAVA SOLUTIONS'), 'Phải có định danh thương hiệu DANAVA SOLUTIONS');
});

test('app/not-found.tsx provides three explicit exits: Trang chủ, Giải pháp, and Liên hệ', () => {
  const notFoundPath = path.join(process.cwd(), 'app', 'not-found.tsx');
  const content = fs.readFileSync(notFoundPath, 'utf8');

  // 1. Lối ra Trang chủ
  assert.ok(content.includes('href="/"'), 'Phải có lối ra Trang chủ (href="/")');
  assert.ok(content.includes('Về Trang chủ'), 'Phải có nút Về Trang chủ');

  // 2. Lối ra Giải pháp
  assert.ok(content.includes('href="/giai-phap/"'), 'Phải có lối ra Giải pháp (href="/giai-phap/")');
  assert.ok(content.includes('Khám phá Giải pháp') || content.includes('Các Giải pháp Số'), 'Phải có text Giải pháp');

  // 3. Lối ra Liên hệ
  assert.ok(content.includes('href="/lien-he/"'), 'Phải có lối ra Liên hệ (href="/lien-he/")');
  assert.ok(content.includes('Liên hệ Hỗ trợ') || content.includes('Trung tâm Hỗ trợ'), 'Phải có text Liên hệ');

  // Ba thẻ lối ra minh họa (exit cards)
  assert.ok(content.includes('not-found-exits-grid'), 'Phải có lưới 3 thẻ lối ra');
  assert.ok(content.includes('exit-card'), 'Phải có các thẻ exit-card');

  // Thông tin hỗ trợ khẩn cấp
  assert.ok(content.includes('0935 91 76 77'), 'Phải có hotline hỗ trợ kỹ thuật');
  assert.ok(content.includes('support@danava.vn'), 'Phải có email hỗ trợ');
});

test('app/not-found.tsx exports metadata with noindex robots protection', () => {
  const notFoundPath = path.join(process.cwd(), 'app', 'not-found.tsx');
  const content = fs.readFileSync(notFoundPath, 'utf8');

  assert.ok(content.includes('metadata'), 'File phải export metadata');
  assert.ok(content.includes('index: false'), 'Phải có robots index: false');
  assert.ok(content.includes('follow: false'), 'Phải có robots follow: false');
});

test('legacy mapped URLs in legacyRedirects continue to redirect and never route to 404', () => {
  assert.ok(legacyRedirects.length >= 60, 'Phải có danh sách redirects kế thừa đầy đủ');

  const sampleCheckSources = [
    '/privacy/',
    '/terms/',
    '/chinh-sach/',
    '/team/',
    '/ecosystem/',
    '/dich-vu/danava-studio/',
    '/dich-vu/thiet-ke-website/'
  ];

  for (const src of sampleCheckSources) {
    const matched = legacyRedirects.find((r) => r.source === src);
    assert.ok(matched, `URL cũ ${src} phải có trong legacyRedirects`);
    assert.ok(
      matched.destination.startsWith('/') && matched.destination !== '/404/',
      `Trang đích của ${src} phải hợp lệ (${matched.destination})`
    );
    assert.equal(matched.permanent, true);
  }
});

