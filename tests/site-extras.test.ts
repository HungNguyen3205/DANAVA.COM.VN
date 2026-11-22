import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, validateContent } from '../lib/content.ts';
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
