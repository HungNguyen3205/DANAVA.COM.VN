import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Database tạm riêng cho file test này — không đụng .data/ hay MySQL production.
process.env.DANAVA_DATA_DIR = mkdtempSync(join(tmpdir(), 'danava-test-'));
delete process.env.DANAVA_DB_HOST;

const { initial, validateContent } = await import('../lib/content.ts');
const { normalizeContent, SUB_SERVICE_SEEDS, POST_TOPICS } = await import('../lib/content-defaults.ts');
const q = await import('../lib/site-queries.ts');
const { getContent, writeContent, closeDb } = await import('../lib/database.ts');
const { legacyRedirects } = await import('../lib/legacy-redirects.ts');
const { getPublicSocialPosts, initialSocialPosts } = await import('../lib/social-feed.ts');
after(() => closeDb());

const norm = () => normalizeContent(structuredClone(initial));

test('dữ liệu cũ (chưa có trường mới) vẫn hợp lệ và được chuẩn hóa hợp lệ', () => {
  const legacy = structuredClone(initial); // giống bản đang lưu trên production
  assert.equal(validateContent(legacy), true);
  const n = normalizeContent(legacy);
  assert.equal(validateContent(n), true);
  assert.equal(n.heroTitle, 'Giải pháp công nghệ và marketing cho doanh nghiệp dịch vụ');
  assert.equal(n.subServices!.length, SUB_SERVICE_SEEDS.length);
  assert.ok(n.services.every(s => Array.isArray(s.faqs)));
  // 30 bài cũ đều có danh mục
  assert.ok(n.posts.every(p => p.topicId && POST_TOPICS[p.id] === p.topicId));
});

test('chuẩn hóa không ghi đè lựa chọn của quản trị viên', () => {
  const d = structuredClone(initial);
  d.heroTitle = 'Tiêu đề riêng';
  d.services[0].faqs = [];
  d.posts[0].topicId = 'marketing';
  d.projects![0].serviceIds = [];
  d.clients = [];
  const n = normalizeContent(d);
  assert.equal(n.heroTitle, 'Tiêu đề riêng');
  assert.deepEqual(n.services[0].faqs, []);
  assert.equal(n.posts[0].topicId, 'marketing');
  assert.deepEqual(n.projects![0].serviceIds, []);
  assert.deepEqual(n.clients, []);
  assert.deepEqual(normalizeContent(n), n, 'chuẩn hóa lặp lại không đổi dữ liệu');
});

test('trang dịch vụ con mặc định đều là bản nháp; không xuất bản trang rỗng', () => {
  const n = norm();
  assert.equal(q.publishedSubServices(n).length, 0);
  const bad = structuredClone(n);
  bad.subServices![0] = { ...bad.subServices![0], published: true, features: [] };
  assert.equal(validateContent(bad), false);
  const good = structuredClone(n);
  good.subServices![0].published = true;
  assert.equal(validateContent(good), true);
  assert.equal(q.subServiceHref(good, good.subServices![0]), '/giai-phap/danava-studio/phan-mem-quan-ly-phong-gym/');
});

test('quan hệ dịch vụ ↔ dự án ↔ bài viết đi theo ID, không theo từ khóa', () => {
  const n = norm();
  assert.deepEqual(q.projectsForService(n, 'studio').map(p => p.id).sort(), ['hariver-studio', 'hue-studio']);
  assert.equal(q.projectsForService(n, 'website').length, 0);
  // Đổi tiêu đề có chữ "Studio" nhưng bỏ serviceIds → không còn liên quan
  const d = structuredClone(n);
  d.projects![0].serviceIds = [];
  assert.equal(q.projectsForService(d, 'studio').length, 1);
  assert.ok(q.postsForService(n, 'marketing').length > 0);
  const archived = n.posts.find(p => p.topicId === 'luu-tru')!;
  assert.ok(!q.knowledgePosts(n).includes(archived), 'bài lưu trữ không vào gợi ý kiến thức');
  const post = n.posts.find(p => p.id === 'wp-13086')!;
  assert.ok(q.relatedPosts(n, post).every(p => p.topicId !== 'luu-tru' && p.id !== post.id));
});

test('danh mục chỉ có trang riêng khi đủ bài', () => {
  const n = norm();
  const pages = (n.topics || []).filter(t => q.topicHasPage(n, t)).map(t => t.id).sort();
  assert.deepEqual(pages, ['marketing', 'tin-hoat-dong']);
});

test('dữ liệu gửi xuống trình duyệt không chứa bản nháp, ghi chú nội bộ hay toàn văn bài', () => {
  const n = norm();
  n.posts.push({ id: 'draft-x', slug: 'draft-x', title: 'Nháp', category: 'X', date: '', body: 'bí mật', published: false });
  n.testimonials = [{ id: 't1', quote: 'Q', name: 'N', role: '', company: '', projectId: '', image: '', source: 'nội bộ', permission: false, published: false }];
  const pub = q.publicContent(n);
  assert.ok(!pub.posts.some(p => p.id === 'draft-x'));
  assert.ok(pub.posts.every(p => p.body.length <= 400));
  assert.equal(pub.subServices!.length, 0);
  assert.equal(pub.testimonials!.length, 0);
  assert.ok(pub.clients!.every(c => c.note === ''));
});

test('khách hàng/nhận xét chỉ xuất bản được khi có quyền công bố', () => {
  const n = norm();
  const d = structuredClone(n);
  d.clients![0] = { ...d.clients![0], permission: false, published: true };
  assert.equal(validateContent(d), false);
  const t = structuredClone(n);
  t.testimonials = [{ id: 't1', quote: 'Tốt', name: 'A', role: '', company: '', projectId: '', image: '', source: '', permission: false, published: true }];
  assert.equal(validateContent(t), false);
});

test('đường dẫn bài viết không được trùng trang hệ thống; link sản phẩm chỉ https', () => {
  const n = norm();
  const d = structuredClone(n);
  d.posts[0].slug = 'chu-de';
  assert.equal(validateContent(d), false);
  const s = structuredClone(n);
  s.services[0].productUrl = 'javascript:alert(1)';
  assert.equal(validateContent(s), false);
});

test('chuyển hướng cũ không có vòng lặp hay chuỗi chuyển hướng', () => {
  const sources = new Set(legacyRedirects.map(r => r.source));
  for (const r of legacyRedirects) {
    assert.notEqual(r.source, r.destination);
    assert.ok(!sources.has(r.destination), `Chuỗi chuyển hướng: ${r.source} → ${r.destination}`);
  }
});

test('khối mạng xã hội chỉ nhận bài có link gốc đúng nền tảng', () => {
  const list = getPublicSocialPosts();
  assert.ok(list.every(p => !p.originalUrl.includes('danava.com.vn')));
  assert.ok(getPublicSocialPosts([{ ...initialSocialPosts[0], platform: 'youtube', originalUrl: 'https://www.youtube.com/watch?v=abc' }]).length === 1);
});

test('lưu qua lớp database giữ nguyên dữ liệu và trường mới', async () => {
  const env = await getContent();
  const data = structuredClone(env.data);
  data.subServices!.find(s => s.id === 'studio-gym')!.published = true;
  data.posts[0].authorId = 'thanh';
  data.posts[0].updated = '2026-11-19';
  const rev = await writeContent(data, env.revision);
  assert.ok(rev !== null);
  assert.equal(await writeContent(data, env.revision), null, 'revision cũ bị từ chối');
  const back = await getContent();
  assert.equal(back.data.posts[0].authorId, 'thanh');
  assert.equal(q.publishedSubServices(back.data).length, 1);
  // writeContent chuẩn hóa Unicode NFC khi lưu (hành vi có sẵn) — so sánh nội dung sau NFC
  assert.deepEqual(back.data.posts.map(p => p.body), env.data.posts.map(p => p.body.normalize('NFC')));
});
