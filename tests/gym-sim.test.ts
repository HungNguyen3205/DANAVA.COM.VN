/**
 * Mô phỏng vận hành (lib/gym-sim.ts): số khách khớp tổng lượt, tái lập theo hạt giống, tài nguyên nhất quán
 * (sức chứa, không giữ 2 máy, không ra ngoài tầng), mọi khách rời đi, đổi tầng qua cầu thang, chờ / luân phiên / trò chuyện / bỏ bài.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { EQUIPMENT_SEEDS } from '../lib/equipment-seeds.ts';
import { generateOptions } from '../lib/gym-layout.ts';
import { newProject } from '../lib/gym-project.ts';
import { Sim, calibrate, defaultScenario, makeVisitors, runMany } from '../lib/gym-sim.ts';

const catalog = new Map(EQUIPMENT_SEEDS.map(e => [e.id, e]));
const make = (areas: number[], model: 'gym' | 'pt' = 'gym') => { const p = newProject({ model, areas, budget: 0 }); p.options = generateOptions(p, EQUIPMENT_SEEDS).options; return p; };

test('số khách tạo ra khớp đúng tổng lượt nhập (kể cả nhóm đi cùng)', () => {
  const p = make([150]);
  for (const visitors of [37, 120, 301]) {
    const s = { ...defaultScenario(p), visitors, groupRate: .3 };
    assert.equal(makeVisitors(s).length, visitors);
    const sim = new Sim(p, catalog, s); sim.step(1e9);
    const r = sim.result();
    assert.equal(r.created, visitors);
    assert.equal(r.finished, visitors, 'mọi khách đều rời phòng');
  }
});

test('tái lập: cùng hạt giống → cùng kết quả; khác bố trí vẫn dùng cùng danh sách khách', () => {
  const p = make([160]);
  const s = { ...defaultScenario(p), visitors: 140 };
  const a = new Sim(p, catalog, s); a.step(1e9);
  const b = new Sim(p, catalog, s); b.step(1e9);
  assert.deepEqual(a.result().stations.map(x => x.util), b.result().stations.map(x => x.util));
  assert.equal(a.result().waitMachineAvg, b.result().waitMachineAvg);
  assert.deepEqual(makeVisitors(s).map(v => v.arrive), makeVisitors({ ...s }).map(v => v.arrive));
  const c = new Sim(p, catalog, s, p.options[1]); c.step(1e9);
  assert.equal(c.result().created, a.result().created);
});

test('tài nguyên luôn nhất quán trong suốt ngày (sức chứa, không giữ 2 máy, trong ranh giới tầng)', () => {
  const p = make([120]);
  const sim = new Sim(p, catalog, { ...defaultScenario(p), visitors: 260, groupRate: .25, chatChance: .6 });
  let steps = 0;
  while (!sim.done && steps++ < 2000) { sim.step(60); assert.deepEqual(sim.check(), [], `t=${sim.t}`); }
});

test('đông khách: có chờ máy, tập luân phiên, trò chuyện giữ máy, đổi thứ tự / bỏ bài', () => {
  const p = make([90]);
  const s = { ...defaultScenario(p), visitors: 380, chatChance: .7, patience: [40, 80] as [number, number] };
  const sim = new Sim(p, catalog, s); sim.step(1e9);
  const r = sim.result();
  assert.ok(r.waitMachineAvg > 0, 'có chờ máy');
  assert.ok(r.shares > 0, 'có tập luân phiên');
  assert.ok(r.chats > 0 && r.chatHoldMin > 0, 'trò chuyện kéo dài giữ máy');
  assert.ok(r.skips + r.abandons + r.reorders > 0, 'đổi / bỏ bài khi chờ lâu');
  assert.ok(r.maxPresent > 10);
});

test('chờ quá lâu với chế độ "về sớm": có khách về sớm', () => {
  const p = make([70]);
  const sim = new Sim(p, catalog, { ...defaultScenario(p), visitors: 420, patience: [20, 30], onGiveUp: 'leave' });
  sim.step(1e9);
  assert.ok(sim.result().earlyLeaves > 0);
});

test('nhiều tầng: khách đổi tầng qua cầu thang; không có cầu thang thì không ai lên tầng trên', () => {
  const p = make([150, 120]);
  const sim = new Sim(p, catalog, { ...defaultScenario(p), visitors: 200 }); sim.step(1e9);
  const r = sim.result();
  assert.ok(r.floorChanges > 0);
  const up = p.floors[1].id;
  assert.ok(r.timeline.some(x => x.floors[up].present > 0));
  const q = { ...p, links: [] };
  const sim2 = new Sim(q, catalog, { ...defaultScenario(q), visitors: 120 }); sim2.step(1e9);
  assert.equal(sim2.result().floorChanges, 0);
  assert.ok(sim2.result().timeline.every(x => x.floors[up].present === 0));
});

test('PT: khách PT đi cùng huấn luyện viên; thiếu huấn luyện viên thì phải chờ', () => {
  const p = make([140], 'pt');
  const s = { ...defaultScenario(p), visitors: 80, trainers: 1, mix: { member: .2, guest: 0, pt: .8 } };
  const sim = new Sim(p, catalog, s);
  let sawWait = false, sawCoach = false;
  while (!sim.done) { sim.step(120); for (const a of sim.agents.values()) { if (a.state === 'wait-trainer') sawWait = true; if (a.state === 'coach') sawCoach = true; } }
  assert.ok(sawCoach, 'có huấn luyện viên hướng dẫn'); assert.ok(sawWait, 'có khách chờ huấn luyện viên');
  assert.equal(sim.result().finished, 80);
});

test('hiệu chỉnh bằng dữ liệu check-in tổng hợp; chạy nhiều lượt cho mức dao động', () => {
  const p = make([120]);
  const c = calibrate(defaultScenario(p), '6,20\n7,35\n8,10\n17,30\n18,45\n19,25', 70, '6:30, 18:00, 19h');
  assert.ok(typeof c !== 'string');
  assert.equal(c.visitors, 165); assert.equal(c.open, 6); assert.equal(c.close, 20); assert.equal(c.ptSlots.length, 3); assert.equal(c.source, 'calibrated');
  assert.equal(typeof calibrate(defaultScenario(p), 'abc'), 'string');
  const t0 = Date.now();
  const m = runMany(p, catalog, { ...c, visitors: 165 }, 3);
  assert.equal(m.runs.length, 3);
  assert.ok(m.agg.maxPresent.max >= m.agg.maxPresent.min);
  assert.ok(Date.now() - t0 < 20000, `chạy 3 lượt mất ${Date.now() - t0} ms`);
});

test('lưu rồi mở lại (qua chuẩn hoá máy chủ): cùng phương án + cùng kịch bản → kết quả mô phỏng giống hệt', async () => {
  const { normalizeProject } = await import('../lib/gym-project.ts');
  const p = make([140, 100]);
  const s = { ...defaultScenario(p), visitors: 150, seed: 42, source: 'calibrated' as const };
  p.scenario = s as unknown as Record<string, unknown>;
  const back = normalizeProject(JSON.parse(JSON.stringify(p)), new Set(catalog.keys()));
  assert.ok(typeof back !== 'string');
  const s2 = { ...defaultScenario(back), ...(back.scenario as object) } as typeof s;
  assert.equal(s2.seed, 42); assert.equal(s2.source, 'calibrated');
  const a = new Sim(p, catalog, s); a.step(1e9);
  const b = new Sim(back, catalog, s2); b.step(1e9);
  assert.equal(a.layout, b.layout);
  assert.deepEqual(a.result().stations.map(x => x.util), b.result().stations.map(x => x.util));
  assert.equal(normalizeProject({ ...JSON.parse(JSON.stringify(p)), scenario: { open: 'x' } }, new Set(catalog.keys())) && true, true);
});
