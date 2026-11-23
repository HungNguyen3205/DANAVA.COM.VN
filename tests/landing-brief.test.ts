import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVICE, SCALE_TO_TIER, SECTIONS, STEPS, buildBrief } from '../lib/landing-brief.ts';
import { ADDONS } from '../lib/web-quote.ts';

test('phiếu: có đủ câu hỏi bắt buộc và id không trùng', () => {
  const ids = STEPS.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(STEPS.every(s => s.section >= 0 && s.section < SECTIONS.length));
  for (const required of ['brand', 'industry', 'goal', 'pain', 'why', 'product', 'benefits', 'scale', 'budget', 'name', 'phone']) {
    assert.ok(ids.includes(required), `thiếu câu hỏi ${required}`);
  }
});

test('phiếu: mục nhiều lựa chọn có ít nhất một tùy chọn', () => {
  for (const s of STEPS) {
    if (s.kind === 'single' || s.kind === 'multi') assert.ok(s.options && s.options.length > 0, s.id);
  }
});

test('phiếu: mỗi quy mô nội dung gắn với một gói landing page', () => {
  const options = STEPS.find(s => s.id === 'scale')!.options!;
  for (const o of options) assert.ok(SCALE_TO_TIER[o], `chưa gắn gói cho: ${o}`);
});

test('phiếu: tùy chọn bổ sung khớp với bảng giá', () => {
  const options = STEPS.find(s => s.id === 'addons')!.options!.filter(o => o !== ADVICE);
  for (const o of options) assert.ok(ADDONS.some(a => a.label === o), `không có trong bảng giá: ${o}`);
});

test('phiếu: bản tóm tắt có thương hiệu và ghi nhờ tư vấn cho mục chưa trả lời', () => {
  const text = buildBrief({ brand: 'Yoga Lan Anh', industry: 'Yoga', goal: 'Đăng ký tư vấn hoặc trải nghiệm' });
  assert.match(text, /Yoga Lan Anh/);
  assert.match(text, /Đăng ký tư vấn/);
  assert.match(text, /nhờ DANAVA tư vấn/);
});

test('phiếu: không hỏi mật khẩu hay mã truy cập', () => {
  const all = STEPS.map(s => s.bot.toLowerCase()).join(' ');
  assert.equal(/mật khẩu|mã truy cập|password/.test(all), false);
});
