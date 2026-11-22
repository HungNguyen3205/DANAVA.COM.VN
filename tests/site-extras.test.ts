import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, validateContent } from '../lib/content.ts';
import { contactChannels } from '../lib/contact-channels.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { block, blockDefaults, savedBlock, validBlocks, withBlock, EXTRA_KEYS } from '../lib/blocks.ts';

test('cấu hình bổ sung: lưu toàn bộ mặc định vẫn hợp lệ', () => {
  let d = structuredClone(initial);
  for (const key of EXTRA_KEYS) d = withBlock(d, key, structuredClone(blockDefaults()[key]));
  assert.equal(validateContent(d), true);
  assert.equal(validateContent(normalizeContent(d)), true);
});

test('cấu hình bổ sung: không ghi vào blocks (bản build cũ từ chối khóa lạ → lỗi 500 khi quay lại bản trước)', () => {
  let d = structuredClone(initial);
  for (const key of EXTRA_KEYS) {
    d = withBlock(d, key, structuredClone(blockDefaults()[key]));
    assert.ok(!(key in (d.blocks || {})), key);
    assert.ok(savedBlock(d, key), key);
    assert.equal(validBlocks({ [key]: blockDefaults()[key] }), false, `${key} không được nằm trong blocks`);
  }
});

test('ảnh doanh nghiệp: đổi thứ tự và ẩn được, khôi phục về mặc định được', () => {
  const g = structuredClone(blockDefaults().gallery);
  g.photos.reverse();
  g.photos[1].visible = false;
  let d = withBlock(structuredClone(initial), 'gallery', g);
  assert.equal(validateContent(d), true);
  assert.deepEqual(block(d, 'gallery'), g);
  d = withBlock(d, 'gallery', undefined);
  assert.deepEqual(block(d, 'gallery'), blockDefaults().gallery);
});

test('ảnh doanh nghiệp: chặn ảnh ngoài, vị trí cắt lạ, quá số lượng', () => {
  const bad = (change: (g: ReturnType<typeof blockDefaults>['gallery']) => void) => {
    const g = structuredClone(blockDefaults().gallery);
    change(g);
    return validateContent(withBlock(structuredClone(initial), 'gallery', g));
  };
  assert.equal(bad(g => { g.photos[0].image = 'https://example.com/a.jpg'; }), false);
  assert.equal(bad(g => { g.photos[0].image = '/assets/../a.webp'; }), false);
  assert.equal(bad(g => { g.photos[0].focus = 'center; background: red'; }), false);
  assert.equal(bad(g => { g.photos = Array(13).fill(g.photos[0]); }), false);
});

test('kênh liên hệ: mặc định chỉ dùng tài khoản DANAVA đã có, kênh chưa có thì không hiện', () => {
  const c = contactChannels(structuredClone(initial));
  assert.equal(c.tel, 'tel:0935917677');
  assert.equal(c.zalo, 'https://zalo.me/0935917677');
  assert.equal(c.messenger, 'https://m.me/danava.com.vn');
  assert.deepEqual(c.socials.map(s => s.key), ['facebook', 'tiktok', 'youtube', 'zalo']);
});

test('kênh liên hệ: link trong CMS được ưu tiên, kênh để trống thì ẩn', () => {
  let d = withBlock(structuredClone(initial), 'contact', { zalo: 'https://zalo.me/g/abc', messenger: '', linkedin: 'https://www.linkedin.com/company/vi-du', x: '' });
  d = withBlock(d, 'company', { ...blockDefaults().company, facebook: 'https://www.facebook.com/profile.php?id=1', youtube: '' });
  assert.equal(validateContent(d), true);
  const c = contactChannels(d);
  assert.equal(c.zalo, 'https://zalo.me/g/abc');
  assert.equal(c.messenger, '', 'không suy đoán được thì ẩn nút');
  assert.deepEqual(c.socials.map(s => s.key), ['facebook', 'tiktok', 'zalo', 'linkedin']);
});

test('kênh liên hệ: chặn link sai kênh và link không an toàn', () => {
  for (const patch of [{ zalo: 'javascript:alert(1)' }, { messenger: 'https://example.com/a' }, { x: 'https://x.com.evil.test/a' }, { linkedin: 'http://linkedin.com/in/a' }]) {
    assert.equal(validateContent(withBlock(structuredClone(initial), 'contact', { ...blockDefaults().contact, ...patch })), false, JSON.stringify(patch));
  }
});
