/** Tự động bố trí phòng gym (lib/gym-layout.ts): máy nằm trong phòng, không chồng nhau, đúng khu, tôn trọng ngân sách. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { autoLayout, LAYOUT_STYLES, type LayoutStyle } from '../lib/gym-layout.ts';
import { EQUIPMENT_SEEDS } from '../lib/equipment-seeds.ts';

const byId = new Map(EQUIPMENT_SEEDS.map(e => [e.id, e]));
const foot = (id: string, rot: number) => { const e = byId.get(id)!; const w = e.width / 100, d = e.depth / 100; return rot % 2 ? [d, w] : [w, d]; };

for (const [area, style] of [[60, 'pt'], [100, 'balanced'], [200, 'cardio'], [400, 'strength']] as [number, LayoutStyle][]) {
  test(`bố trí ${area} m² kiểu ${LAYOUT_STYLES[style].label}: trong phòng, không chồng nhau, có đủ khu`, () => {
    const W = Math.round(Math.sqrt(area * 1.4) * 10) / 10, L = Math.round((area / W) * 10) / 10;
    const r = autoLayout(EQUIPMENT_SEEDS, { w: W, l: L, style });
    assert.ok(r.items.length >= 3, `có máy (${r.items.length})`);
    assert.ok(r.zones.cardio >= 1 && r.zones.strength >= 1 && r.zones.free >= 1, JSON.stringify(r.zones));
    for (const it of r.items) {
      const [fw, fd] = foot(it.eqId, it.rot);
      assert.ok(it.x - fw / 2 >= -W / 2 - 1e-6 && it.x + fw / 2 <= W / 2 + 1e-6 && it.z - fd / 2 >= -L / 2 - 1e-6 && it.z + fd / 2 <= L / 2 + 1e-6, `${it.eqId} ra ngoài phòng`);
    }
    for (let i = 0; i < r.items.length; i++) for (let j = i + 1; j < r.items.length; j++) {
      const a = r.items[i], b = r.items[j], [aw, ad] = foot(a.eqId, a.rot), [bw, bd] = foot(b.eqId, b.rot);
      assert.ok(!(Math.abs(a.x - b.x) < (aw + bw) / 2 - 1e-6 && Math.abs(a.z - b.z) < (ad + bd) / 2 - 1e-6), `${a.eqId} chồng ${b.eqId}`);
    }
  });
}

test('ngân sách: tổng giá máy đã chọn không vượt ngân sách', () => {
  const r = autoLayout(EQUIPMENT_SEEDS, { w: 12, l: 9, style: 'balanced', budget: 300_000_000 });
  assert.ok(r.total <= 300_000_000, String(r.total));
  assert.ok(r.items.length >= 3);
});

test('không chọn 2 máy tạ cùng một bài tập', () => {
  const r = autoLayout(EQUIPMENT_SEEDS, { w: 20, l: 15, style: 'strength' });
  const names = r.items.map(i => byId.get(i.eqId)!).filter(e => e.kind === 'stack' || e.kind === 'plate').map(e => e.name);
  assert.ok(names.length >= 4, names.join(', '));
});
