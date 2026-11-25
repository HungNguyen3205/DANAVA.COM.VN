/** Menu chân trang chỉnh trong admin (SiteData.footer): mặc định hợp lệ, chặn đường dẫn lạ, sửa tại chỗ được. */
import test from 'node:test';
import assert from 'node:assert/strict';

const { initial, validateContent } = await import('../lib/content.ts');
const { normalizeContent } = await import('../lib/content-defaults.ts');
const { block, withBlock } = await import('../lib/blocks.ts');
const { writeCms, readCms } = await import('../lib/cms-paths.ts');

const base = normalizeContent(structuredClone(initial));

test('mặc định: 3 cột như chân trang cũ, cột đầu tự liệt kê giải pháp', () => {
  const f = block(base, 'footer');
  assert.deepEqual(f.columns.map(c => c.title), ['Giải pháp', 'Công ty', 'Hỗ trợ']);
  assert.equal(f.columns[0].auto, 'services');
  assert.ok(validateContent(withBlock(base, 'footer', structuredClone(f))));
});

test('thêm / bớt mục và cột hợp lệ; chặn đường dẫn javascript: và quá nhiều cột', () => {
  const f = structuredClone(block(base, 'footer'));
  f.columns[1].items.push({ label: 'Tuyển CTV', href: 'https://danava.vn/ctv', key: '', visible: true });
  f.columns[2].items.splice(0, 1);
  assert.ok(validateContent(withBlock(base, 'footer', f)));
  const bad = structuredClone(f); bad.columns[1].items[0].href = 'javascript:alert(1)';
  assert.ok(!validateContent(withBlock(base, 'footer', bad)));
  const many = structuredClone(f); many.columns = Array.from({ length: 7 }, () => ({ title: 'x', titleKey: '', auto: '' as const, items: [] }));
  assert.ok(!validateContent(withBlock(base, 'footer', many)));
});

test('sửa tại chỗ tên mục thêm tay (block.footer…)', () => {
  const f = structuredClone(block(base, 'footer'));
  f.columns[1].items.push({ label: 'Mới', href: '/x/', key: '', visible: true });
  const d = writeCms(withBlock(base, 'footer', f), `block.footer.columns.1.items.${f.columns[1].items.length - 1}.label`, 'Đã sửa');
  assert.equal(readCms(d, `block.footer.columns.1.items.${f.columns[1].items.length - 1}.label`), 'Đã sửa');
  assert.ok(validateContent(d));
});
