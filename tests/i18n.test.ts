/** Website đa ngôn ngữ (lib/i18n.ts, lib/i18n-server.ts): đường dẫn, dấu câu, áp bản dịch, bản dịch cũ không hiện sai nghĩa. */
import test from 'node:test';
import assert from 'node:assert/strict';

const { initial, validateContent } = await import('../lib/content.ts');
const { normalizeContent } = await import('../lib/content-defaults.ts');
const { readCms, writeCms, writeTranslation } = await import('../lib/cms-paths.ts');
const { splitLocale, localePath, textHash, fresh, validTranslations, metaKey } = await import('../lib/i18n.ts');
const { localizeSite, translationsFor } = await import('../lib/i18n-server.ts');
const { txt } = await import('../lib/site-text.ts');

const base = normalizeContent(structuredClone(initial));

test('đường dẫn theo ngôn ngữ', () => {
  assert.deepEqual(splitLocale('/en/giai-phap/'), { locale: 'en', path: '/giai-phap/' });
  assert.deepEqual(splitLocale('/ja/'), { locale: 'ja', path: '/' });
  assert.deepEqual(splitLocale('/giai-phap/'), { locale: 'vi', path: '/giai-phap/' });
  assert.deepEqual(splitLocale('/english-page/'), { locale: 'vi', path: '/english-page/' }, 'không nhầm tiền tố');
  assert.equal(localePath('/lien-he/#form', 'en'), '/en/lien-he/#form');
  assert.equal(localePath('/', 'ja'), '/ja/');
  assert.equal(localePath('/en/du-an/', 'vi'), '/du-an/');
  assert.equal(localePath('/en/du-an/', 'ja'), '/ja/du-an/');
  assert.equal(localePath('/admin/', 'en'), '/admin/', 'admin không có bản dịch');
  assert.equal(localePath('/assets/a.webp', 'en'), '/assets/a.webp');
  assert.equal(localePath('https://danava.vn/', 'en'), 'https://danava.vn/');
});

test('dấu câu bỏ qua khoảng trắng thừa, đổi chữ thì đổi dấu', () => {
  assert.equal(textHash('Xin  chào '), textHash('Xin chào'));
  assert.notEqual(textHash('Xin chào'), textHash('Xin chào!'));
  assert.ok(fresh({ t: 'Hello', h: textHash('Xin chào') }, 'Xin chào'));
  assert.ok(!fresh({ t: 'Hello', h: textHash('Xin chào') }, 'Chào bạn'));
  assert.ok(!fresh({ t: '  ', h: textHash('Xin chào') }, 'Xin chào'));
});

test('bản dịch máy có sẵn được áp lên dữ liệu hiển thị; câu tiếng Việt đổi → hiện lại tiếng Việt', () => {
  const key = 'rec.services.studio.title';
  const seeded = translationsFor(base, 'en')[key];
  assert.ok(seeded, 'có bản dịch máy cho tên sản phẩm');
  const en = localizeSite(base, 'en');
  assert.equal(readCms(en, key), seeded.t);
  assert.equal(en.localeView?.loc, 'en');
  assert.equal(readCms(base, key), readCms(base, key), 'dữ liệu gốc không đổi');
  // Sửa tên tiếng Việt → bản dịch cũ không còn khớp → hiển thị tiếng Việt mới
  const changed = writeCms(base, 'rec.services.studio.heroLead', 'Câu dẫn mới hoàn toàn khác.');
  assert.equal(readCms(localizeSite(changed, 'en'), 'rec.services.studio.heroLead'), 'Câu dẫn mới hoàn toàn khác.');
});

test('bản sửa trong admin ưu tiên hơn bản dịch máy và lưu kèm dấu câu gốc', () => {
  const key = 'rec.services.studio.title';
  const vi = readCms(base, key);
  const d = writeTranslation(base, 'ja', key, 'スタジオ管理', vi);
  assert.deepEqual(d.i18n?.ja?.[key], { t: 'スタジオ管理', h: textHash(vi) });
  assert.equal(readCms(localizeSite(d, 'ja'), key), 'スタジオ管理');
  assert.ok(validateContent(d));
  const cleared = writeTranslation(d, 'ja', key, '', vi);
  assert.equal(cleared.i18n, undefined, 'xóa trắng = bỏ bản sửa');
});

test('chữ cố định (txt.*) dịch khi khớp chữ gốc; chữ gốc đã sửa → không dùng bản dịch cũ', () => {
  const view = { loc: 'en' as const, tr: { 'txt.home.x': { t: 'Hello', h: textHash('Xin chào') } } };
  assert.equal(txt({ localeView: view }, 'home.x', 'Xin chào'), 'Hello');
  assert.equal(txt({ texts: { 'home.x': 'Chào bạn' }, localeView: view }, 'home.x', 'Xin chào'), 'Chào bạn');
  assert.equal(txt({}, 'home.x', 'Xin chào'), 'Xin chào');
});

test('máy chủ chỉ nhận bản dịch đúng cấu trúc; dữ liệu hiển thị không bao giờ được lưu', () => {
  assert.ok(validTranslations({ en: { 'txt.home.x': { t: 'Hi', h: 'abc12' } }, ja: { [metaKey('/lien-he/', 'title')]: { t: 'お問い合わせ', h: '1x' } } }));
  assert.ok(!validTranslations({ fr: {} }), 'ngôn ngữ lạ');
  assert.ok(!validTranslations({ en: { 'x"]{}': { t: 'a', h: 'b' } } }), 'khóa lạ');
  assert.ok(!validTranslations({ en: { 'txt.a.b': { t: 'a', h: 'b', extra: 1 } } }), 'trường lạ');
  assert.ok(!validTranslations({ en: { 'txt.a.b': { t: 1, h: 'b' } } }));
  assert.ok(!validateContent({ ...base, localeView: { loc: 'en', tr: {} } }));
});
