/** Phiếu báo giá rút gọn trong ANNA: đúng 8 câu, có câu tính giá và liên hệ, phần tăng dần. */
import test from 'node:test';
import assert from 'node:assert/strict';

const { QUICK_STEPS, QUICK_SECTIONS } = await import('../lib/landing-brief.ts');
const { EVENT_QUICK_STEPS, EVENT_QUICK_SECTIONS } = await import('../lib/event-brief.ts');

for (const [name, steps, sections, priced] of [['landing', QUICK_STEPS, QUICK_SECTIONS, ['scale', 'addons']], ['events', EVENT_QUICK_STEPS, EVENT_QUICK_SECTIONS, ['guests', 'agenda']]] as const) {
  test(`phiếu ${name}: 8 câu, đủ câu tính giá + liên hệ`, () => {
    assert.equal(steps.length, 8);
    for (const id of [...priced, 'name', 'phone']) assert.ok(steps.some(s => s.id === id), id);
    steps.forEach((s, i) => { assert.ok(s.section < sections.length); if (i) assert.ok(s.section >= steps[i - 1].section); });
  });
}
