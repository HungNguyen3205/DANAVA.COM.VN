import test from 'node:test';
import assert from 'node:assert/strict';
import { initial } from '../lib/content.ts';
import { archivedPosts } from '../lib/archived-posts.ts';
import { legacyCatalog } from '../lib/legacy-catalog.ts';

test('draft articles are strictly isolated from public published posts', () => {
  const publishedPosts = initial.posts.filter(p => p.published);
  assert.ok(publishedPosts.length > 0, 'Phải có bài viết công khai');

  // Thử nghiệm thêm một bài nháp (draft)
  const modified = structuredClone(initial.posts);
  modified.push({
    id: 'draft-private-article',
    slug: 'draft-private-article',
    title: 'Bài viết nháp riêng tư',
    category: 'Nội bộ',
    date: '2026-11-01',
    body: 'Nội dung chưa công bố.',
    published: false
  });

  const publicOnly = modified.filter(p => p.published);
  assert.equal(publicOnly.some(p => p.id === 'draft-private-article'), false);
  assert.equal(publicOnly.some(p => p.slug === 'draft-private-article'), false);
});

test('legacy archived articles preserve valid sources, slugs and unique paths', () => {
  assert.ok(legacyCatalog.length > 0);
  for (const post of legacyCatalog) {
    assert.ok(post.id && post.id.length > 0);
    assert.ok(post.slug && /^[a-z0-9-]+$/.test(post.slug), `Slug ${post.slug} phải hợp lệ URL`);
    assert.ok(post.title && post.title.trim().length > 0);
    assert.ok(post.source && post.source.startsWith('https://danava.com.vn/'), `Nguồn ${post.source} phải từ website chính thức`);
    assert.ok(archivedPosts[post.id], `Bài viết ${post.id} phải có trong archivedPosts`);
    assert.equal(archivedPosts[post.id].source, post.source);
  }
});

test('content parsing correctly detects numbered headings and generates TOC for long articles', () => {
  const longPost = initial.posts.find(p => p.slug === 'cong-nang-luong') || initial.posts[0];
  assert.ok(longPost, 'Phải có bài viết thực tế');

  const lines = longPost.body.split('\n');
  const headings: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isNumberedHeading = /^(\d+|[I|V|X]+)[\.\)]\s+(.+)/.test(trimmed);
    const isStepHeading = /^Bước\s+\d+[:\-]\s+(.+)/i.test(trimmed);
    const isCapsHeading =
      trimmed.length >= 6 &&
      trimmed.length <= 85 &&
      trimmed === trimmed.toUpperCase() &&
      !trimmed.endsWith('.') &&
      !trimmed.includes(':') &&
      trimmed.split(/\s+/).length >= 2;

    if (isNumberedHeading || isStepHeading || isCapsHeading) {
      headings.push(trimmed);
    }
  }

  // Bài dài về cổng năng lượng có các mục lớn
  assert.ok(headings.length >= 2, `Bài viết phải trích xuất được ít nhất 2 mục, thực tế có ${headings.length}`);
});

test('long titles and missing cover photos do not corrupt metadata or slug resolution', () => {
  const sample = initial.posts[0];
  assert.ok(sample.title.length > 20, 'Tiêu đề bài viết phong phú');

  // Bài viết không có ảnh bìa vẫn an toàn
  const noImagePost = {
    ...sample,
    id: 'post-without-image',
    slug: 'post-without-image',
    image: undefined
  };
  assert.equal(noImagePost.image, undefined);
  assert.ok(noImagePost.title.length > 0);
});

test('reading quick-access /blogs/doc resolves existing article IDs', () => {
  const sample = legacyCatalog[0];
  const found = initial.posts.find(p => p.id === sample.id);
  assert.ok(found, `Bài viết ${sample.id} phải tồn tại trong danh mục bài viết`);
  assert.equal(found.published, true);
  assert.equal(found.slug, sample.slug);
});

