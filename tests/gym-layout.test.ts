/**
 * Bố trí phòng tập nhiều tầng (lib/gym-layout.ts) + kiểm tra hình học (lib/gym-geometry.ts):
 * trong ranh giới, không chồng lấn, đủ khoảng trống vận hành, có lối đi từ cửa, không chắn cửa / cầu thang,
 * ngân sách, máy thiếu giá, khoá máy, 4 kiểu bố trí khác nhau thật sự.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { EQUIPMENT_SEEDS } from '../lib/equipment-seeds.ts';
import { generateOptions, selectEquipment, STRATEGY_ORDER } from '../lib/gym-layout.ts';
import { validateOption, eqRects, checkEquipment, floorObstacles, rotFor, AXIS_X, AXIS_Z } from '../lib/gym-geometry.ts';
import { newProject, normalizeProject, layoutHash, uid, type Project, type Strategy } from '../lib/gym-project.ts';

const byId = new Map(EQUIPMENT_SEEDS.map(e => [e.id, e]));
const errors = (p: Project, i = 0) => validateOption(p, p.options[i], byId).issues.filter(x => x.level === 'error');

test('rotFor khớp quy ước xoay của three.js cho cả 4 góc', () => {
  for (let r = 0; r < 4; r++) {
    assert.equal(rotFor('x', AXIS_X[r][0], AXIS_X[r][1]), r);
    assert.equal(rotFor('z', AXIS_Z[r][0], AXIS_Z[r][1]), r);
  }
});

test('khoảng trống máy chạy bộ: 2 m phía sau theo đúng hướng xoay', () => {
  const tm = EQUIPMENT_SEEDS.find(e => e.kind === 'treadmill')!;
  for (let rot = 0; rot < 4; rot++) {
    const { body, clear } = eqRects(tm, 0, 0, rot);
    const back = [-AXIS_X[rot][0], -AXIS_X[rot][1]];
    const ext = back[0] > 0 ? clear.x1 - body.x1 : back[0] < 0 ? body.x0 - clear.x0 : back[1] > 0 ? clear.z1 - body.z1 : body.z0 - clear.z0;
    assert.ok(Math.abs(ext - 2) < 1e-6, `rot ${rot}: ${ext}`);
  }
});

for (const [areas, model] of [[[120], 'gym'], [[60], 'pt'], [[220, 160], 'strength'], [[150, 120, 90], 'boutique'], [[400], 'wellness']] as const) {
  test(`${areas.length} tầng ${areas.join('/')} m² (${model}): 3 phương án hợp lệ, có lối đi, khác nhau`, () => {
    const p = newProject({ model, areas: [...areas], budget: 0 });
    const { options, selection } = generateOptions(p, EQUIPMENT_SEEDS);
    p.options = options;
    assert.equal(options.length, 3);
    assert.equal(new Set(options.map(o => o.strategy)).size, 3);
    const total = selection.floors.reduce((s, f) => s + f.eqs.length, 0);
    assert.ok(total >= areas.length * 3, `chọn ${total} máy`);
    for (let i = 0; i < 3; i++) {
      const e = errors(p, i);
      assert.deepEqual(e.map(x => x.msg), [], `phương án ${options[i].letter} (${options[i].strategy})`);
      assert.ok(options[i].placements.length >= Math.min(total, 2), `${options[i].strategy}: ${options[i].placements.length}/${total}`);
      for (const pl of options[i].placements) assert.ok(p.floors.some(f => f.id === pl.floorId));
    }
    // Các phương án đặt máy ở vị trí khác nhau thật sự
    const sig = (i: number) => options[i].placements.map(x => `${Math.round(x.x)}:${Math.round(x.z)}`).sort().join('|');
    assert.notEqual(sig(0), sig(1)); assert.notEqual(sig(1), sig(2));
  });
}

test('4 kiểu bố trí đều tạo được phương án hợp lệ trên cùng mặt bằng', () => {
  const p = newProject({ model: 'gym', areas: [180], budget: 0 });
  const all: Strategy[] = ['perimeter', 'clusters', 'circuit', 'axis'];
  for (const s of all) {
    const { options } = generateOptions(p, EQUIPMENT_SEEDS, { strategies: [s] });
    const q = { ...p, options };
    assert.deepEqual(errors(q).map(x => x.msg), [], s);
    assert.ok(options[0].placements.length >= 8, `${s}: ${options[0].placements.length}`);
  }
  // Vòng tập có số trạm; Mở trung tâm có khoảng mở; Trục có đèn dọc trục
  const circuit = generateOptions(p, EQUIPMENT_SEEDS, { strategies: ['circuit'] }).options[0];
  assert.ok(circuit.placements.every(x => x.station));
  const peri = generateOptions(p, EQUIPMENT_SEEDS, { strategies: ['perimeter'] }).options[0];
  assert.ok(peri.furniture.some(f => f.kind === 'turf' || f.kind === 'mat-zone'));
  const axis = generateOptions(p, EQUIPMENT_SEEDS, { strategies: ['axis'] }).options[0];
  assert.ok(axis.furniture.filter(f => f.kind === 'linear-light').length >= 2);
});

test('mặt bằng nhiều vật cố định: không chắn cửa, cột, WC, lối thoát; mọi máy tiếp cận được', () => {
  const p = newProject({ model: 'gym', areas: [160], budget: 0 });
  const f = p.floors[0];
  for (const [x, z] of [[-3, -1], [3, -1], [0, -3]]) f.fixtures.push({ id: uid('fx'), kind: 'column', x, z, w: .5, d: .5, rot: 0 });
  f.fixtures.push({ id: uid('fx'), kind: 'exit', x: -f.w / 2 + .1, z: 1, w: 1.2, d: .2, rot: 1 });
  f.fixtures.push({ id: uid('fx'), kind: 'void', x: -f.w / 2 + 1.5, z: -f.l / 2 + 1.5, w: 3, d: 3, rot: 0 });
  const { options } = generateOptions(p, EQUIPMENT_SEEDS);
  p.options = options;
  for (let i = 0; i < 3; i++) assert.deepEqual(errors(p, i).map(x => x.msg), [], options[i].strategy);
});

test('ngân sách thấp: tổng máy có giá không vượt ngân sách; máy thiếu giá liệt kê riêng', () => {
  const p = newProject({ model: 'gym', areas: [150], budget: 250_000_000 });
  const sel = selectEquipment(p, EQUIPMENT_SEEDS);
  const spent = sel.floors.flatMap(f => f.eqs).reduce((s, e) => s + Number(e.price || 0), 0);
  assert.ok(spent + sel.flooringReserve <= 250_000_000, String(spent));
  for (const e of sel.unpriced) assert.equal(e.price, '');
  assert.ok(sel.floors[0].eqs.length >= 3);
});

test('khoá máy: tạo lại phương án giữ nguyên máy đã khoá', () => {
  const p = newProject({ model: 'gym', areas: [140], budget: 0 });
  p.options = generateOptions(p, EQUIPMENT_SEEDS).options;
  const keep = structuredClone(p.options[0]);
  const locked = keep.placements.slice(0, 3);
  for (const l of locked) l.locked = true;
  const again = generateOptions(p, EQUIPMENT_SEEDS, { keep, strategies: ['axis', 'clusters', 'circuit'] }).options;
  for (const o of again) for (const l of locked) assert.ok(o.placements.some(x => x.id === l.id && x.x === l.x && x.z === l.z && x.rot === l.rot), `${o.strategy} giữ ${l.eqId}`);
});

test('kéo máy vào lối cửa / chồng máy khác → bộ kiểm tra báo lỗi; khớp mọi góc xoay', () => {
  const p = newProject({ model: 'gym', areas: [120], budget: 0 });
  p.options = generateOptions(p, EQUIPMENT_SEEDS).options;
  const o = p.options[0], f = p.floors[0];
  const door = f.fixtures.find(x => x.kind === 'door')!;
  const pl = o.placements[0], eq = byId.get(pl.eqId)!;
  for (let rot = 0; rot < 4; rot++) {
    const obs = floorObstacles(p, f, o, byId).filter(x => x.id !== pl.id);
    assert.ok(checkEquipment(eq, door.x, door.z - 1, rot, f, obs), `rot ${rot} trước cửa`);
    const other = o.placements[1];
    assert.ok(checkEquipment(eq, other.x, other.z, rot, f, obs), `rot ${rot} chồng máy khác`);
  }
});

test('nhiều tầng: tầng trên có lối từ cầu thang; thiếu kết nối tầng bị báo lỗi', () => {
  const p = newProject({ model: 'gym', areas: [150, 120], budget: 0 });
  p.options = generateOptions(p, EQUIPMENT_SEEDS).options;
  assert.deepEqual(errors(p).map(x => x.msg), []);
  assert.ok(p.options[0].placements.some(x => x.floorId === p.floors[1].id));
  const v = validateOption(p, p.options[0], byId);
  assert.ok(v.verify.length >= 1, 'có điều kiện cần xác minh');
  const q = { ...p, links: [] };
  assert.ok(validateOption(q, q.options[0], byId).issues.some(x => /chưa khai báo cầu thang/.test(x.msg)));
});

test('lưu rồi mở lại: chuẩn hoá giữ nguyên phương án và mã bố trí', () => {
  const p = newProject({ model: 'pt', areas: [90, 70], budget: 400_000_000 });
  p.options = generateOptions(p, EQUIPMENT_SEEDS).options;
  const back = normalizeProject(JSON.parse(JSON.stringify(p)), new Set(byId.keys()));
  assert.ok(typeof back !== 'string');
  assert.equal(layoutHash(back, back.options[1]), layoutHash(p, p.options[1]));
  assert.equal(typeof normalizeProject({ floors: [] }), 'string');
  assert.equal(typeof normalizeProject({ floors: [{ id: 'x' }] }), 'string');
});

test('thứ tự kiểu theo mô hình: mỗi mô hình 3 kiểu khác nhau', () => {
  for (const list of Object.values(STRATEGY_ORDER)) assert.equal(new Set(list).size, 3);
});

test('chi phí từng phương án (thiết bị + thảm sàn có giá) không vượt ngân sách dự án', async () => {
  const { costOf } = await import('../lib/gym-cost.ts');
  const { FLOORING } = await import('../lib/equipment-seeds.ts');
  for (const [areas, budget] of [[[180, 140], 900e6], [[120], 300e6], [[200, 150, 100], 1.5e9]] as const) {
    const p = newProject({ model: 'gym', areas: [...areas], budget });
    p.options = generateOptions(p, EQUIPMENT_SEEDS, { flooring: FLOORING }).options;
    for (const o of p.options) {
      const c = costOf(p, o, byId, FLOORING);
      assert.ok(c.priced <= budget, `${areas.join('/')} ${o.strategy}: ${c.priced} > ${budget}`);
    }
  }
});

test('tinh thần video tham chiếu: Mở trung tâm có làn chức năng dọc trục dài, khung tạ đầu làn, đèn tuyến tính liền dải; cardio sát mặt tiền kính', () => {
  const p = newProject({ model: 'strength', areas: [260], budget: 0 });
  const f = p.floors[0];
  f.w = 24; f.l = 11;
  for (const fx of f.fixtures) { if (fx.kind === 'door') fx.z = f.l / 2 - .1; if (fx.kind === 'window' || fx.kind === 'wc' || fx.kind === 'locker') fx.z = Math.sign(fx.z) * (f.l / 2) - Math.sign(fx.z) * (fx.kind === 'window' ? .075 : fx.d / 2 + .1); }
  const o = generateOptions(p, EQUIPMENT_SEEDS, { strategies: ['perimeter'] }).options[0];
  const q = { ...p, options: [o] };
  assert.deepEqual(errors(q).map(x => x.msg), []);
  const lane = o.furniture.find(x => x.label === 'Làn tập chức năng');
  assert.ok(lane, 'có làn tập chức năng');
  assert.ok(lane!.w > lane!.d * 1.8, `làn chạy dọc trục dài (${lane!.w} × ${lane!.d})`);
  const rack = o.placements.map(x => ({ x, e: byId.get(x.eqId)! })).find(({ x, e }) => (e.kind === 'rack' || e.kind === 'smith') && Math.abs(x.z - lane!.z) < 1.5 && Math.abs(x.x - lane!.x) > lane!.w / 2 - .5);
  assert.ok(rack, 'khung tạ đứng ở đầu làn');
  const lights = o.furniture.filter(x => x.kind === 'linear-light');
  assert.ok(lights.length >= 2 && lights.every(l => l.w >= f.w - 1.5), 'đèn liền dải theo chiều dài phòng');
  assert.ok(f.fixtures.filter(x => x.kind === 'window').length === 2, 'mặt tiền kính hai bên cửa');
  const cardio = o.placements.filter(x => ['treadmill', 'bike', 'elliptical', 'rower', 'recumbent'].includes(byId.get(x.eqId)!.kind!));
  assert.ok(cardio.length && cardio.every(x => x.z > 0), 'cardio dọc mặt tiền kính');
});

test('đổi kích thước tầng: cửa / cửa sổ giữ đúng bức tường, WC vẫn ở góc sau', async () => {
  const { updateFloor } = await import('../lib/gym-edit.ts');
  let p = newProject({ model: 'gym', areas: [240], budget: 0 });
  p = updateFloor(p, p.floors[0].id, { w: 10, l: 24 });
  const f = p.floors[0];
  for (const fx of f.fixtures.filter(x => x.kind === 'door' || x.kind === 'window')) assert.ok(Math.abs(fx.z - (f.l / 2 - fx.d / 2)) < .01, `${fx.kind} vẫn ở mặt tiền (z=${fx.z})`);
  const wc = f.fixtures.find(x => x.kind === 'wc')!;
  assert.ok(wc.z < -f.l / 2 + 2 && wc.x > 0, `WC góc sau phải (${wc.x}, ${wc.z})`);
});
