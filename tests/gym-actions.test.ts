/** Trợ lý thiết kế: chuẩn hoá thao tác từ AI (dữ liệu sai bị loại), áp dụng giữ phần khoá, chế độ mẫu không AI. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { EQUIPMENT_SEEDS } from '../lib/equipment-seeds.ts';
import { generateOptions } from '../lib/gym-layout.ts';
import { newProject } from '../lib/gym-project.ts';
import { applyActions, redact, ruleBasedActions, sanitizeActions, sanitizeReply, summarizeForAI } from '../lib/gym-actions.ts';

const make = () => { const p = newProject({ model: 'gym', areas: [160, 120], budget: 0 }); p.options = generateOptions(p, EQUIPMENT_SEEDS).options; return p; };

test('AI trả dữ liệu sai: thao tác lạ / thiếu tham số / giá trị vượt giới hạn bị loại hoặc kẹp lại', () => {
  const a = sanitizeActions([
    { type: 'drop_database' }, { type: 'set_model', model: 'casino' }, { type: 'set_floor' }, { type: 'set_floor', floor: 9, w: 999 },
    { type: 'set_interior', style: 'warm' }, { type: 'set_budget', million: -5 }, { type: 'add_link', kind: 'stairs', floors: [1] }, 'rác', null
  ]);
  assert.deepEqual(a.map(x => x.type), ['set_floor', 'set_interior', 'set_budget']);
  assert.equal((a[0] as { floor: number }).floor, 5);
  assert.equal((a[0] as { w: number }).w, 80);
  assert.equal((a[2] as { million: number }).million, 0);
  const r = sanitizeReply({ reply: 42, questions: ['a', 'b', 'c'], actions: 'x' });
  assert.equal(r.questions.length, 2); assert.deepEqual(r.actions, []); assert.ok(r.reply.length > 0);
});

test('áp dụng: đổi phong cách + lễ tân + công năng tầng, giữ máy đã khoá khi tạo lại', () => {
  const p = make();
  for (const l of p.options[0].placements.slice(0, 2)) l.locked = true;
  const locked = p.options[0].placements.slice(0, 2).map(x => ({ ...x }));
  const r = applyActions(p, [{ type: 'set_interior', style: 'warm' }, { type: 'set_reception', shape: 'compact', size: 's' }, { type: 'set_floor', floor: 2, use: 'pt' }], EQUIPMENT_SEEDS);
  assert.equal(r.project.brief.interior, 'warm');
  assert.equal(r.project.reception.shape, 'compact');
  assert.equal(r.project.floors.find(f => f.level === 1)!.use, 'pt');
  for (const l of locked) assert.ok(r.project.options[0].placements.some(x => x.id === l.id && x.x === l.x && x.z === l.z), 'giữ máy khoá');
  assert.ok(r.log.every(x => x.ok), JSON.stringify(r.log));
  assert.equal(p.brief.interior, 'industrial', 'không sửa dự án gốc');
});

test('giảm chi phí 20%: ngân sách mới thấp hơn và tổng có giá không vượt', () => {
  const p = make();
  const r = applyActions(p, [{ type: 'reduce_cost', percent: 20 }], EQUIPMENT_SEEDS);
  assert.ok(r.budget > 0 && r.cost <= r.budget, `${r.cost} / ${r.budget}`);
});

test('thao tác không làm được thì ghi lý do, không làm hỏng dự án', () => {
  const p = make();
  const r = applyActions(p, [{ type: 'remove_floor', floor: 5 }, { type: 'must_have', query: 'máy bay phản lực' }], EQUIPMENT_SEEDS);
  assert.equal(r.log.filter(x => !x.ok).length, 2);
  assert.equal(r.project.floors.length, 2);
});

test('chế độ mẫu (không AI) hiểu câu ví dụ trong yêu cầu', () => {
  const p = make();
  const r = ruleBasedActions('Tôi có hai tầng, thích đen kết hợp gỗ, lễ tân nhỏ, tầng trên dành cho PT và giữ trung tâm thoáng.', p);
  const types = r.actions.map(a => a.type);
  assert.ok(types.includes('set_interior') && types.includes('set_reception') && types.includes('set_floor') && types.includes('set_strategy'), types.join(','));
  assert.match(r.reply, /Chế độ mẫu/);
});

test('không gửi thông tin cá nhân: che số điện thoại / email; tóm tắt gọn', () => {
  assert.equal(redact('gọi 0912 345 678 hoặc a.b@x.vn'), 'gọi [số điện thoại] hoặc [email]');
  const s = JSON.stringify(summarizeForAI(make(), new Map(EQUIPMENT_SEEDS.map(e => [e.id, e]))));
  assert.ok(!/phone|email/i.test(s));
  assert.ok(s.length < 14000, String(s.length));
});
