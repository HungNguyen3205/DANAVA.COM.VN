/** Chỉnh trực tiếp: khóa dữ liệu của vùng trên trang (lib/cms-paths.ts) đọc/ghi đúng trường, chặn giá trị và khóa sai. */
import test from 'node:test';
import assert from 'node:assert/strict';

const { initial, validateContent } = await import('../lib/content.ts');
const { normalizeContent } = await import('../lib/content-defaults.ts');
const { readCms, writeCms, validCmsPath, cmsValueError } = await import('../lib/cms-paths.ts');
const { DEFAULT_HOME_HERO } = await import('../lib/home-hero.ts');
const { block } = await import('../lib/blocks.ts');

const base = normalizeContent(structuredClone(initial));

test('màn mở đầu: đọc chữ mặc định, ghi chữ mới, trùng mặc định thì không lưu riêng', () => {
  assert.equal(readCms(base, 'hero.line1'), DEFAULT_HOME_HERO.line1);
  const next = writeCms(base, 'hero.line1', 'Cùng bạn bứt phá.');
  assert.equal(readCms(next, 'hero.line1'), 'Cùng bạn bứt phá.');
  assert.equal(next.homeHero?.line1, 'Cùng bạn bứt phá.');
  assert.equal(base.homeHero, undefined, 'không sửa bản cũ');
  const back = writeCms(next, 'hero.line1', DEFAULT_HOME_HERO.line1);
  assert.equal(back.homeHero, undefined);
  assert.equal(validateContent(next), true);
});

test('nút: đường dẫn phải hợp lệ', () => {
  assert.throws(() => writeCms(base, 'hero.primaryHref', 'javascript:alert(1)'));
  assert.throws(() => writeCms(base, 'hero.primaryHref', '//evil.example'));
  assert.equal(readCms(writeCms(base, 'hero.primaryHref', '/lien-he/?service=danava-studio'), 'hero.primaryHref'), '/lien-he/?service=danava-studio');
});

test('chữ trang: pages.<trang>.<trường> ghi vào khối pages, lưu được', () => {
  const next = writeCms(base, 'pages.du-an.title', 'Dự án *thật*');
  assert.equal(readCms(next, 'pages.du-an.title'), 'Dự án *thật*');
  assert.equal(validateContent(next), true);
  assert.throws(() => writeCms(base, 'pages.du-an.khong-co', 'x'));
});

test('ảnh trong khối: đổi ảnh, mô tả, vị trí cắt; chặn ảnh ngoài /assets và vị trí lạ', () => {
  const next = writeCms(base, 'block.gallery.photos.1.image', '/assets/uploads/anh-moi.webp');
  assert.equal((block(next, 'gallery') as { photos: { image: string }[] }).photos[1].image, '/assets/uploads/anh-moi.webp');
  assert.equal(readCms(next, 'block.gallery.photos.0.image'), readCms(base, 'block.gallery.photos.0.image'), 'ảnh khác giữ nguyên');
  assert.equal(validateContent(next), true);
  assert.throws(() => writeCms(base, 'block.gallery.photos.1.image', 'https://evil.example/a.png'));
  assert.throws(() => writeCms(base, 'block.gallery.photos.1.focus', 'center; color:red'));
  assert.throws(() => writeCms(base, 'block.gallery.photos.99.image', '/assets/a.webp'), 'không tạo ảnh mới ngoài danh sách');
  assert.equal(readCms(writeCms(base, 'block.gallery.photos.0.focus', 'top'), 'block.gallery.photos.0.focus'), 'top');
});

test('khóa sai bị từ chối (kể cả thuộc tính nguyên mẫu)', () => {
  for (const p of ['hero', 'hero.khong', 'block.__proto__.x', 'block.gallery.constructor', 'site.email', 'pages.a', 'block.gallery.photos.0.image.x.y.z.w']) assert.equal(validCmsPath(p), false, p);
  assert.throws(() => writeCms(base, 'block.__proto__.polluted', 'x'));
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.match(cmsValueError('hero.kicker', 'x'.repeat(500)), /Tối đa/);
});
