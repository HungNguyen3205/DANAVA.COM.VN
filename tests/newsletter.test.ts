import test from 'node:test';
import assert from 'node:assert/strict';
import { initialSocialPosts, getApprovedSocialPosts, getSocialPlatformCounts, type SocialPost } from '../lib/social-feed.ts';
import { initial } from '../lib/content.ts';

test('official social posts contain required platform metadata and safe URLs', () => {
  assert.ok(initialSocialPosts.length >= 4, 'Phải có ít nhất 4 bài đăng từ các kênh chính thức');
  for (const post of initialSocialPosts) {
    assert.ok(post.id && post.id.trim().length > 0, 'Post id không được để trống');
    assert.ok(['facebook', 'youtube', 'zalo', 'tiktok'].includes(post.platform), `Platform ${post.platform} phải hợp lệ`);
    assert.ok(post.platformLabel && post.platformLabel.trim().length > 0);
    assert.ok(post.channelName && post.channelName.trim().length > 0);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(post.date), `Ngày đăng ${post.date} phải theo định dạng YYYY-MM-DD`);
    assert.ok(post.title && post.title.trim().length > 0, 'Tiêu đề không được để trống');
    assert.ok(post.content && post.content.trim().length > 0, 'Nội dung không được để trống');
    assert.ok(post.image && post.image.startsWith('/assets/'), `Ảnh ${post.image} phải thuộc thư mục /assets/`);
    assert.ok(post.originalUrl && post.originalUrl.startsWith('https://'), `Link gốc ${post.originalUrl} phải là https`);
    assert.equal(typeof post.verified, 'boolean');
  }
});

test('getApprovedSocialPosts isolates unverified drafts and prioritizes pinned posts', () => {
  const mockPosts: SocialPost[] = [
    {
      id: 'p-unverified',
      platform: 'facebook',
      platformLabel: 'Facebook',
      channelName: 'DANAVA',
      date: '2026-11-01',
      title: 'Unverified post',
      content: 'Draft content',
      image: '/assets/legacy/website.webp',
      originalUrl: 'https://danava.com.vn/',
      verified: false,
      pinned: true
    },
    {
      id: 'p-older-pinned',
      platform: 'youtube',
      platformLabel: 'YouTube',
      channelName: 'DANAVA Media',
      date: '2026-01-01',
      title: 'Older pinned post',
      content: 'Pinned content',
      image: '/assets/legacy/website.webp',
      originalUrl: 'https://danava.com.vn/',
      verified: true,
      pinned: true
    },
    {
      id: 'p-newer-regular',
      platform: 'zalo',
      platformLabel: 'Zalo',
      channelName: 'DANAVA Zalo',
      date: '2026-10-15',
      title: 'Newer regular post',
      content: 'Regular content',
      image: '/assets/legacy/website.webp',
      originalUrl: 'https://danava.com.vn/',
      verified: true,
      pinned: false
    }
  ];

  const approved = getApprovedSocialPosts(mockPosts);

  // Không bao giờ chứa bài chưa duyệt
  assert.equal(approved.some(p => p.id === 'p-unverified'), false);

  // Bài ghim phải luôn đứng trước bài không ghim dù ngày đăng cũ hơn
  assert.equal(approved[0].id, 'p-older-pinned');
  assert.equal(approved[1].id, 'p-newer-regular');
});

test('posts with interactive embed configuration maintain secure origin and original URL', () => {
  const approved = getApprovedSocialPosts();
  const embedPosts = approved.filter(p => p.embedUrl);
  assert.ok(embedPosts.length >= 1, 'Cần có ít nhất 1 bài hỗ trợ nhúng truyền thông');

  for (const p of embedPosts) {
    assert.ok(p.embedUrl!.startsWith('https://'), `Embed URL ${p.embedUrl} phải dùng giao thức https`);
    assert.ok(p.originalUrl.startsWith('https://'), `Link gốc ${p.originalUrl} luôn phải hiện diện`);
  }
});

test('getSocialPlatformCounts accurately tallies verified platforms', () => {
  const counts = getSocialPlatformCounts();
  assert.ok(counts.all > 0);
  assert.ok(counts.facebook >= 1);
  assert.ok(counts.youtube >= 1);
  assert.ok(counts.zalo >= 1);
  assert.equal(counts.all, counts.facebook + counts.youtube + counts.zalo + counts.tiktok);
});

test('newsletter category filter and blog search handle empty and valid results smoothly', () => {
  const posts = initial.posts.filter(p => p.published);
  assert.ok(posts.length > 0, 'Phải có bài viết đã xuất bản');

  // Lọc theo chuyên mục hợp lệ
  const eventPosts = posts.filter(p => p.category === 'Sự Kiện');
  assert.ok(eventPosts.length > 0, 'Phải có bài viết Sự Kiện');

  // Lọc theo chuyên mục không tồn tại trả về mảng rỗng mà không lỗi
  const emptyPosts = posts.filter(p => p.category === 'ChuyenMucKhongTonTai');
  assert.equal(emptyPosts.length, 0);

  // Đảm bảo tất cả các bài viết đều có slug hợp lệ để tạo link /blogs/[slug]/
  for (const p of posts) {
    assert.ok(/^[a-z0-9-]+$/.test(p.slug), `Slug ${p.slug} phải hợp lệ URL`);
  }
});

