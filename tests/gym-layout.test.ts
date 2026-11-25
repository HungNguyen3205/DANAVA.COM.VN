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

test('khu không đặt máy (cửa, cầu thang, nhà vệ sinh): máy không nằm trong khu, kể cả lối đi chừa quanh khu', async () => {
  const { ZONE_KINDS, zoneFoot } = await import('../lib/gym-layout.ts');
  const W = 12, L = 9;
  const zones = [
    { kind: 'door' as const, x: 0, z: L / 2 - .5, w: 1.2, d: 1, rot: 0 },
    { kind: 'stairs' as const, x: -W / 2 + .6, z: 0, w: 1.2, d: 3, rot: 0 },
    { kind: 'wc' as const, x: W / 2 - 1, z: -L / 2 + 1, w: 2, d: 2, rot: 0 }
  ];
  const r = autoLayout(EQUIPMENT_SEEDS, { w: W, l: L, style: 'balanced', zones });
  assert.ok(r.items.length >= 5, String(r.items.length));
  for (const it of r.items) {
    const [fw, fd] = foot(it.eqId, it.rot);
    for (const z of zones) {
      const [zw, zd] = zoneFoot(z), p = ZONE_KINDS[z.kind].pad;
      const overlap = Math.abs(it.x - z.x) < (fw + zw) / 2 + p - 1e-6 && Math.abs(it.z - z.z) < (fd + zd) / 2 + p - 1e-6;
      assert.ok(!overlap, `${byId.get(it.eqId)!.name} nằm trong ${ZONE_KINDS[z.kind].label}`);
    }
  }
});
