/** Đổi tên giải pháp (Website / Marketing / Sự kiện) trong admin phải được giữ lại — bước chuyển đổi tên cũ chỉ chạy một lần. */
import test from 'node:test';
import assert from 'node:assert/strict';

const { initial } = await import('../lib/content.ts');
const { normalizeContent } = await import('../lib/content-defaults.ts');
const { writeCms, readCms } = await import('../lib/cms-paths.ts');

test('tên giải pháp do quản trị viên sửa không bị đè khi đọc lại', () => {
  const base = normalizeContent(structuredClone(initial));
  for (const [id, name] of [['marketing', 'Digital Marketing'], ['website', 'Thiết kế Website'], ['events', 'Sự kiện']]) {
    const d = writeCms(base, `rec.services.${id}.title`, name);
    assert.equal(readCms(normalizeContent(structuredClone(d)), `rec.services.${id}.title`), name);
  }
});

test('dữ liệu cũ chưa qua đợt đổi tên vẫn được cập nhật đúng một lần', () => {
  const old = structuredClone(initial);
  old.seeded = [];
  old.services = old.services.map(s => (s.id === 'marketing' ? { ...s, title: 'Digital Marketing' } : s));
  const n = normalizeContent(old);
  assert.equal(readCms(n, 'rec.services.marketing.title'), initial.services.find(s => s.id === 'marketing')!.title);
});
