/** Kiểu chữ theo từng phần (lib/text-styles.ts): kiểm tra giá trị ở máy chủ, CSS chỉ tác động đúng phần, lưu tách khỏi nội dung. */
import test from 'node:test';
import assert from 'node:assert/strict';

const { initial, validateContent } = await import('../lib/content.ts');
const { normalizeContent } = await import('../lib/content-defaults.ts');
const { writeTextStyle, readCms } = await import('../lib/cms-paths.ts');
const { normalizeHex, validTextStyles, textStylesCss, withTextStyle } = await import('../lib/text-styles.ts');

const base = normalizeContent(structuredClone(initial));

test('mã màu: chuẩn hóa #abc / ABCDEF, từ chối giá trị sai', () => {
  assert.equal(normalizeHex('#F08A1C'), '#f08a1c');
  assert.equal(normalizeHex('abc'), '#aabbcc');
  assert.equal(normalizeHex('#12345'), null);
  assert.equal(normalizeHex('red'), null);
  assert.equal(normalizeHex('#ggg000'), null);
});

test('máy chủ chỉ nhận trường và giới hạn cho phép', () => {
  assert.ok(validTextStyles({ 'txt.home.why.title': { color: '#2b4294', size: 48, sizeMobile: 30 } }));
  assert.ok(!validTextStyles({ 'txt.home.why.title': { color: 'red' } }), 'màu tên');
  assert.ok(!validTextStyles({ 'txt.home.why.title': { color: '#2B4294;}body{display:none' } }), 'chèn CSS');
  assert.ok(!validTextStyles({ 'txt.home.why.title': { size: 4 } }), 'quá nhỏ');
  assert.ok(!validTextStyles({ 'txt.home.why.title': { size: 200 } }), 'quá lớn');
  assert.ok(!validTextStyles({ 'txt.home.why.title': { sizeMobile: 90 } }), 'điện thoại quá lớn');
  assert.ok(!validTextStyles({ 'txt.home.why.title': { size: 20.5 } }), 'số lẻ');
  assert.ok(!validTextStyles({ 'txt.home.why.title': { fontFamily: 'Comic Sans' } }), 'trường lạ');
  assert.ok(!validTextStyles({ 'txt.home.why.title': {} }), 'rỗng');
  assert.ok(!validTextStyles({ 'x"]{color:red}': { size: 20 } }), 'khóa lạ');
  assert.ok(!validTextStyles({ 'rec.__proto__.x.title': { size: 20 } }), 'khóa nguyên mẫu');
});

test('validateContent từ chối kiểu chữ sai, nhận kiểu chữ đúng; dữ liệu cũ không có kiểu chữ vẫn hợp lệ', () => {
  assert.ok(validateContent(base));
  assert.ok(validateContent({ ...base, textStyles: { 'hero.line1': { size: 56 } } }));
  assert.ok(!validateContent({ ...base, textStyles: { 'hero.line1': { color: '#12' } } }));
});

test('CSS chỉ chọn đúng khóa của phần đó, tách máy tính / điện thoại', () => {
  const css = textStylesCss({ 'txt.home.why.title': { color: '#f08a1c', size: 48, sizeMobile: 30 }, 'txt.home.why.lead': { size: 18 } });
  assert.match(css, /\[data-cms="txt\.home\.why\.title"\]\{color:#f08a1c!important/);
  assert.match(css, /@media \(min-width:768px\)\{[^@]*txt\.home\.why\.title"\]\{font-size:48px!important\}/);
  assert.match(css, /@media \(max-width:767\.98px\)\{[^@]*txt\.home\.why\.title"\]\{font-size:30px!important\}/);
  assert.ok(!/txt\.home\.why\.lead"\]\{font-size:\d+px!important\}\}?$/.test(css.split('@media (max-width')[1] || ''), 'phần chỉ đặt máy tính không có cỡ điện thoại');
  // Mục không hợp lệ (vd. dữ liệu sửa tay) bị bỏ qua, không lọt vào CSS
  assert.equal(textStylesCss({ 'x"]{}*{': { size: 20 } } as never), '');
  assert.equal(textStylesCss({ 'txt.a.b': { color: 'red;}*{color:red' } } as never), '');
});

test('ghi kiểu chữ không đổi nội dung; khôi phục từng thuộc tính; về mặc định thì xóa mục', () => {
  const before = readCms(base, 'hero.line1');
  let d = writeTextStyle(base, 'hero.line1', { color: '#2b4294', size: 64, sizeMobile: 36 });
  assert.equal(readCms(d, 'hero.line1'), before);
  assert.deepEqual(d.textStyles, { 'hero.line1': { color: '#2b4294', size: 64, sizeMobile: 36 } });
  d = writeTextStyle(d, 'hero.line1', { size: 64, sizeMobile: 36 }); // khôi phục màu
  assert.deepEqual(d.textStyles, { 'hero.line1': { size: 64, sizeMobile: 36 } });
  d = writeTextStyle(d, 'hero.line2', { size: 40 }); // phần khác độc lập
  d = writeTextStyle(d, 'hero.line1', null);
  assert.deepEqual(d.textStyles, { 'hero.line2': { size: 40 } });
  assert.equal(writeTextStyle(d, 'hero.line2', null).textStyles, undefined);
  assert.throws(() => writeTextStyle(base, 'hero.line1', { size: 500 }), /Cỡ chữ máy tính/);
  assert.throws(() => writeTextStyle(base, 'khong.hop.le', { size: 20 }));
  assert.throws(() => withTextStyle({}, 'txt.a', { color: 'blue' }), /Mã màu/);
});
