/** Thiết bị phòng gym (lib/equipment.ts): danh mục mẫu, kiểm tra dữ liệu, báo lỗi cụ thể. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEGACY_SEED_IDS, equipmentError } from '../lib/equipment.ts';
import { EQUIPMENT_SEEDS, FLOORING, publicEquipment } from '../lib/equipment-seeds.ts';
import { contentError, initial, validateContent } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';

test('danh mục đối tác thietbigym.vn hợp lệ: giá theo nguồn, có ảnh cục bộ, có link gốc, có loại máy', async () => {
  const fs = await import('node:fs');
  assert.equal(equipmentError(EQUIPMENT_SEEDS), '');
  assert.ok(EQUIPMENT_SEEDS.length > 200);
  assert.equal(new Set(EQUIPMENT_SEEDS.map(x => x.id)).size, EQUIPMENT_SEEDS.length);
  for (const x of EQUIPMENT_SEEDS) {
    assert.ok(/^\d*$/.test(x.price), x.name);
    assert.ok(x.source?.startsWith('https://thietbigym.vn/'), x.name);
    assert.ok(x.kind, x.name);
    if (x.image) assert.ok(fs.existsSync('public' + x.image), x.image);
  }
  assert.ok(EQUIPMENT_SEEDS.filter(x => x.price).length > 150, 'phần lớn có giá');
  assert.ok(!EQUIPMENT_SEEDS.some(x => /^setup /i.test(x.name)), 'không gồm gói dịch vụ');
  assert.equal(FLOORING?.sizeCm, 50);
});

test('dữ liệu cũ chưa có thiết bị → nhận danh mục mẫu; danh sách đã sửa giữ nguyên', () => {
  const n = normalizeContent(structuredClone(initial));
  assert.equal(n.equipment?.length, EQUIPMENT_SEEDS.length);
  assert.equal(validateContent(n), true);
  // danh mục mẫu cũ (chưa có giá) → chuyển sang danh mục đối tác
  const legacy = normalizeContent({ ...n, equipment: LEGACY_SEED_IDS.slice(0, 3).map(id => ({ ...EQUIPMENT_SEEDS[0], id, price: '', image: '', model: '' })) });
  assert.equal(legacy.equipment?.length, EQUIPMENT_SEEDS.length);
  const own = normalizeContent({ ...n, equipment: [{ ...EQUIPMENT_SEEDS[0], price: '35000000' }] });
  assert.equal(own.equipment?.length, 1);
  assert.equal(own.equipment?.[0].price, '35000000');
});

test('báo lỗi chỉ rõ máy và ô sai', () => {
  const base = normalizeContent(structuredClone(initial));
  const bad = (patch: object) => contentError({ ...base, equipment: [{ ...EQUIPMENT_SEEDS[0], ...patch }] });
  assert.match(bad({ price: '35 triệu' })!, new RegExp(EQUIPMENT_SEEDS[0].name + '.*giá "35 triệu" chỉ gồm chữ số'));
  assert.match(bad({ width: 0 })!, /kích thước rộng × sâu/);
  assert.match(bad({ image: 'https://evil.test/a.png' })!, /ảnh phải là ảnh trong Thư viện ảnh/);
  assert.match(bad({ model: '/assets/uploads/x.exe' })!, /mô hình 3D phải là file \.glb/);
  assert.match(bad({ name: '' })!, /chưa có tên/);
});

test('trang công khai chỉ hiện máy đang bật hiển thị', () => {
  const list = [{ ...EQUIPMENT_SEEDS[0] }, { ...EQUIPMENT_SEEDS[1], published: false }];
  assert.deepEqual(publicEquipment(list).map(x => x.id), [EQUIPMENT_SEEDS[0].id]);
});
