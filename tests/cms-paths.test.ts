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
  for (const p of ['hero', 'hero.khong', 'block.__proto__.x', 'block.gallery.constructor', 'site.password', 'pages.a', 'block.gallery.photos.0.image.x.y.z.w']) assert.equal(validCmsPath(p), false, p);
  assert.throws(() => writeCms(base, 'block.__proto__.polluted', 'x'));
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.match(cmsValueError('hero.kicker', 'x'.repeat(500)), /Tối đa/);
});

test('bản ghi: sửa trên trang chi tiết cập nhật đúng hồ sơ trong module (rec.<loại>.<id>.<trường>)', () => {
  const svc = base.services.find(s => s.id === 'studio')!;
  const next = writeCms(base, 'rec.services.studio.heroLead', 'Phần mềm quản lý phòng tập — thử nghiệm');
  assert.equal(next.services.find(s => s.id === 'studio')!.heroLead, 'Phần mềm quản lý phòng tập — thử nghiệm');
  assert.deepEqual(next.services.filter(s => s.id !== 'studio'), base.services.filter(s => s.id !== 'studio'), 'hồ sơ khác giữ nguyên');
  assert.equal(svc.heroLead, base.services.find(s => s.id === 'studio')!.heroLead, 'không sửa bản cũ');
  assert.equal(validateContent(next), true);
  const post = base.posts[0];
  const p2 = writeCms(base, `rec.posts.${post.id}.excerpt`, 'Tóm tắt mới');
  assert.equal(p2.posts[0].excerpt, 'Tóm tắt mới');
  assert.equal(readCms(p2, `rec.posts.${post.id}.excerpt`), 'Tóm tắt mới');
  assert.throws(() => writeCms(base, 'rec.services.khong-co.title', 'x'), /không tồn tại/);
  assert.throws(() => writeCms(base, 'rec.services.studio.title', '  '), /trống/);
  assert.throws(() => writeCms(base, `rec.posts.${post.id}.image`, 'https://evil.example/a.png'));
  for (const p of ['rec.services.studio.body', 'rec.users.x.name', 'rec.posts.x.published', 'rec.services.studio']) assert.equal(validCmsPath(p), false, p);
});

test('chữ cố định (txt.*): lưu bản sửa vào texts, trống = về chữ mặc định, khóa sai bị từ chối', async () => {
  const { txt } = await import('../lib/site-text.ts');
  const next = writeCms(base, 'txt.home.why.title', 'Vì sao *DANAVA*');
  assert.equal(next.texts?.['home.why.title'], 'Vì sao *DANAVA*');
  assert.equal(readCms(next, 'txt.home.why.title'), 'Vì sao *DANAVA*');
  assert.equal(txt(next, 'home.why.title', 'Mặc định'), 'Vì sao *DANAVA*');
  assert.equal(txt(base, 'home.why.title', 'Mặc định'), 'Mặc định');
  assert.equal(validateContent(next), true);
  const back = writeCms(next, 'txt.home.why.title', '   ');
  assert.equal(back.texts, undefined);
  for (const p of ['txt', 'txt.Home', 'txt.a_b', 'txt.__proto__', 'txt.a..b']) assert.equal(validCmsPath(p), false, p);
  assert.equal(validateContent({ ...base, texts: { 'Khoa Sai': 'x' } }), false);
  assert.equal(validateContent({ ...base, texts: { 'a.b': 'x'.repeat(2001) } }), false);
});

test('email/hotline (site.*) và bản ghi lồng (rec.<loại>.<id>.<trường>.<vị trí>)', () => {
  assert.equal(readCms(writeCms(base, 'site.email', 'lienhe@danava.vn'), 'site.email'), 'lienhe@danava.vn');
  assert.throws(() => writeCms(base, 'site.email', 'khong-phai-email'), /Email/);
  const s = base.services.find(x => x.items.length)!;
  const next = writeCms(base, `rec.services.${s.id}.items.0`, 'Hạng mục mới');
  assert.equal(next.services.find(x => x.id === s.id)!.items[0], 'Hạng mục mới');
  assert.equal(validateContent(next), true);
  assert.throws(() => writeCms(base, `rec.services.${s.id}.items.99`, 'x'), /không/);
  const person = base.staff[0];
  assert.equal(readCms(writeCms(base, `rec.staff.${person.id}.role`, 'Giám đốc'), `rec.staff.${person.id}.role`), 'Giám đốc');
  for (const p of [`rec.services.${s.id}.slug`, `rec.services.${s.id}.published`, `rec.posts.x.body`, 'rec.users.x.name']) assert.equal(validCmsPath(p), false, p);
});
