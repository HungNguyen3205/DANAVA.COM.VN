/** Thiết bị phòng gym (lib/equipment.ts): danh mục mẫu, kiểm tra dữ liệu, báo lỗi cụ thể. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { EQUIPMENT_SEEDS, equipmentError, publicEquipment } from '../lib/equipment.ts';
import { contentError, initial, validateContent } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';

test('danh mục mẫu hợp lệ, giá để trống cho quản trị viên nhập (không bịa giá)', () => {
  assert.equal(equipmentError(EQUIPMENT_SEEDS), '');
  assert.ok(EQUIPMENT_SEEDS.length >= 10);
  assert.ok(EQUIPMENT_SEEDS.every(x => x.price === ''), 'giá mẫu phải để trống');
  assert.equal(new Set(EQUIPMENT_SEEDS.map(x => x.id)).size, EQUIPMENT_SEEDS.length);
});

test('dữ liệu cũ chưa có thiết bị → nhận danh mục mẫu; danh sách đã sửa giữ nguyên', () => {
  const n = normalizeContent(structuredClone(initial));
  assert.equal(n.equipment?.length, EQUIPMENT_SEEDS.length);
  assert.equal(validateContent(n), true);
  const own = normalizeContent({ ...n, equipment: [{ ...EQUIPMENT_SEEDS[0], price: '35000000' }] });
  assert.equal(own.equipment?.length, 1);
  assert.equal(own.equipment?.[0].price, '35000000');
});

test('báo lỗi chỉ rõ máy và ô sai', () => {
  const base = normalizeContent(structuredClone(initial));
  const bad = (patch: object) => contentError({ ...base, equipment: [{ ...EQUIPMENT_SEEDS[0], ...patch }] });
  assert.match(bad({ price: '35 triệu' })!, /Máy chạy bộ.*giá "35 triệu" chỉ gồm chữ số/);
  assert.match(bad({ width: 0 })!, /kích thước rộng × sâu/);
  assert.match(bad({ image: 'https://evil.test/a.png' })!, /ảnh phải là ảnh trong Thư viện ảnh/);
  assert.match(bad({ model: '/assets/uploads/x.exe' })!, /mô hình 3D phải là file \.glb/);
  assert.match(bad({ name: '' })!, /chưa có tên/);
});

test('trang công khai chỉ hiện máy đang bật hiển thị', () => {
  const list = [{ ...EQUIPMENT_SEEDS[0] }, { ...EQUIPMENT_SEEDS[1], published: false }];
  assert.deepEqual(publicEquipment(list).map(x => x.id), [EQUIPMENT_SEEDS[0].id]);
});
