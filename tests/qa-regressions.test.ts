/** Hồi quy từ đợt kiểm thử nghiệm thu 11/2026 (docs/qa/full-project-report.md). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyRedirects } from '../lib/legacy-redirects.ts';
import { DICH_VU } from '../lib/dich-vu.ts';

process.env.SITE_URL ||= 'https://danava.com.vn';
const { seo, BRAND, TITLE_MAX } = await import('../lib/seo.ts');

test('chuyển hướng cũ không đè lên trang Dịch vụ đang hoạt động (QA-07: /dich-vu/truyen-thong/ bị chuyển đi)', () => {
  const live = new Set(['/dich-vu/', ...DICH_VU.map(s => `/dich-vu/${s.slug}/`)]);
  const clash = legacyRedirects.filter(r => live.has(r.source.endsWith('/') ? r.source : r.source + '/'));
  assert.deepEqual(clash.map(r => r.source), []);
});

test('tiêu đề dài bỏ hậu tố thương hiệu, tiêu đề ngắn giữ hậu tố (QA-08)', () => {
  const short = seo('Liên hệ', 'Mô tả trang liên hệ đủ dài để làm mô tả tìm kiếm cho trang.', '/lien-he/');
  assert.equal(short.title, 'Liên hệ');
  assert.equal((short.openGraph as { title: string }).title, `Liên hệ | ${BRAND}`);
  const longTitle = 'Hướng dẫn xem báo cáo trên điện thoại phần mềm DANAVA Studio';
  const long = seo(longTitle, 'Mô tả bài viết đủ dài để làm mô tả tìm kiếm cho trang.', '/blogs/x/');
  assert.ok(`${longTitle} | ${BRAND}`.length > TITLE_MAX);
  assert.deepEqual(long.title, { absolute: longTitle });
  assert.equal((long.openGraph as { title: string }).title, longTitle);
});
