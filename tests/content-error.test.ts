/** Báo lỗi cụ thể khi lưu nội dung (lib/content.ts → contentError): chỉ rõ mục, bản ghi, ô và lý do. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { contentError, initial, validateContent } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';

const base = normalizeContent(structuredClone(initial));

test('lỗi thật đã gặp: SEO Trang chủ (đường dẫn "/") lưu được', () => {
  const d = { ...base, pageSeo: { '/': { title: 'DANAVA Solutions - Công nghệ, Marketing & AI Hotline: 0935 917 677', description: 'DANAVA Solutions – Hệ sinh thái giải pháp số toàn diện cho ngành Wellness.', image: '/assets/uploads/0b0c1d2e-3f40-4152-8a6b-7c8d9e0f1a2b.webp' } } };
  assert.equal(validateContent(d), true);
  assert.equal(contentError(d), null);
});

test('nội dung hợp lệ → không có lỗi', () => assert.equal(contentError(base), null));

test('mỗi lỗi chỉ rõ mục trong admin, bản ghi và ô bị sai', () => {
  const post = base.posts[0];
  const cases: [unknown, RegExp][] = [
    [{ ...base, pageSeo: { '/du-an/': { title: 'x'.repeat(201) } } }, /SEO từng trang → trang \/du-an\/: tiêu đề SEO dài 201 ký tự/],
    [{ ...base, pageSeo: { '/du-an/': { image: 'https://evil.test/a.png' } } }, /trang \/du-an\/: ảnh chia sẻ .*Thư viện ảnh/],
    [{ ...base, tracking: { ga4: 'UA-123' } }, /Theo dõi: mã Google Analytics 4 .*"UA-123" sai định dạng/],
    [{ ...base, posts: base.posts.map((p, i) => (i === 0 ? { ...p, image: 'http://x.com/a.png' } : p)) }, new RegExp(`Bài viết → «${post.title.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*ảnh "http://x.com/a.png" không hợp lệ`)],
    [{ ...base, posts: base.posts.map((p, i) => (i === 0 ? { ...p, slug: 'Bài Viết' } : p)) }, /Bài viết → .*đường dẫn "Bài Viết" không hợp lệ: chỉ dùng chữ thường/],
    [{ ...base, posts: base.posts.map((p, i) => (i === 1 ? { ...p, slug: base.posts[0].slug } : p)) }, /Bài viết: đường dẫn ".*" bị trùng giữa/],
    [{ ...base, clients: [{ id: 'k1', name: 'Khách A', logo: '', url: 'http://khach-a.vn', projectId: '', permission: true, published: true, note: '' }, ...base.clients!] }, /Khách hàng → Đối tác → «Khách A»: liên kết "http:\/\/khach-a.vn" .*https:\/\//],
    [{ ...base, testimonials: [{ id: 't1', quote: '', name: 'Chị Lan', role: '', company: '', projectId: '', image: '', source: '', permission: true, published: true }] }, /Nhận xét khách hàng → «Chị Lan»: .*(Xuất bản|nội dung nhận xét)/],
    [{ ...base, redirects: [{ id: 'r1', from: 'cu', to: '/moi/', created: '2026-11-25' }] }, /Chuyển hướng → .*đường dẫn cũ "cu" không hợp lệ/],
    [{ ...base, email: 'x'.repeat(201) }, /Liên hệ: email/]
  ];
  for (const [d, re] of cases) {
    const msg = contentError(d);
    assert.ok(msg, 'phải có lỗi: ' + re);
    assert.match(msg!, re);
  }
});
