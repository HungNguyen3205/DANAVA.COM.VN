import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, type Post } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { publishedPosts } from '../lib/site-queries.ts';
import { readBlogFilter, searchPosts, searchTopics } from '../lib/blog-search.ts';

const post = (id: string, title: string, body = '', extra: Partial<Post> = {}): Post =>
  ({ id, slug: id, title, category: '', date: '2026-01-01', body, published: true, ...extra });
const site = (...posts: Post[]) => ({ ...structuredClone(initial), posts, topics: [] });
const ids = (data: typeof initial, q: string) => searchPosts(data, { q, topic: '' }).map(p => p.id);

test('tìm Blog: gõ không dấu khớp bài có dấu, kể cả chữ đ', () => {
  const d = site(post('a', 'Sự kiện tại Đà Nẵng'));
  assert.deepEqual(ids(d, 'su kien da nang'), ['a']);
});

test('tìm Blog: gõ có dấu thì khớp đúng dấu', () => {
  const d = site(post('a', 'Dữ liệu hội viên'), post('b', 'Du lịch yoga'));
  assert.deepEqual(ids(d, 'dữ'), ['a']);
  assert.deepEqual(ids(d, 'DU').sort(), ['a', 'b']);
});

test('tìm Blog: mọi từ phải có, khớp nguyên tiếng, không khớp vào URL', () => {
  const d = site(post('a', 'Quản lý phòng gym', 'Xem [ảnh](/assets/blog/bimat.webp)'));
  assert.deepEqual(ids(d, 'quan gym'), ['a']);
  assert.deepEqual(ids(d, 'quan spa'), []);
  assert.deepEqual(ids(d, 'ym'), []);
  assert.deepEqual(ids(d, 'bimat'), []);
  assert.deepEqual(ids(d, '!!!'), []);
});

test('tìm Blog: từ rải rác trong thân bài không bị coi là kết quả', () => {
  const d = site(post('car', 'Chăm sóc ô tô', 'Thiên nhiên đẹp. Bạn nên kiểm tra phanh và tránh mưa.'), post('tea', 'Workshop Thiền Trà'));
  assert.deepEqual(ids(d, 'thien tra'), ['tea']);
});

test('tìm Blog: tìm cả toàn văn, ưu tiên tiêu đề, không lộ bản nháp', () => {
  const d = site(post('body', 'Bài một', 'Nói về workshop'), post('title', 'Workshop'), post('draft', 'Workshop', '', { published: false }));
  assert.deepEqual(ids(d, 'workshop'), ['title', 'body']);
});

test('tìm Blog: lọc theo chủ đề trên dữ liệu thật', () => {
  const d = normalizeContent(structuredClone(initial));
  const topics = searchTopics(d);
  assert.ok(topics.length > 0);
  for (const t of topics) {
    const found = searchPosts(d, { q: '', topic: t.slug });
    assert.equal(found.length, t.count);
    assert.ok(found.every(p => p.topicId === t.id));
  }
  assert.deepEqual(searchPosts(d, { q: '', topic: 'khong-co' }), []);
  assert.equal(searchPosts(d, { q: '', topic: '' }).length, publishedPosts(d).length);
});

test('tìm Blog: tham số lặp và quá dài được chuẩn hóa', () => {
  assert.deepEqual(readBlogFilter({ q: ['  thiền   trà ', 'x'] }), { q: 'thiền trà', topic: '' });
  assert.equal(readBlogFilter({ q: 'a'.repeat(500) }).q.length, 80);
});
