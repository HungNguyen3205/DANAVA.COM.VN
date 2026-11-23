import test from 'node:test';
import assert from 'node:assert/strict';
import { ADDONS, TIERS, estimate, briefText } from '../lib/web-quote.ts';

test('báo giá: landing page và website dùng bảng gói riêng', () => {
  assert.equal(TIERS.landing.every(t => t.id.startsWith('l-')), true);
  assert.equal(TIERS.website.every(t => t.id.startsWith('w-')), true);
});

test('báo giá: gói cao hơn thì khoảng giá cao hơn', () => {
  const basic = estimate('landing', 'l-basic', [], 'normal');
  const premium = estimate('landing', 'l-premium', [], 'normal');
  assert.ok(basic && premium);
  assert.ok(premium.low > basic.low);
});

test('báo giá: thêm tùy chọn bổ sung làm tăng giá', () => {
  const plain = estimate('website', 'w-corp', [], 'normal');
  const withAddons = estimate('website', 'w-corp', ['domain', 'copy'], 'normal');
  assert.ok(plain && withAddons);
  assert.equal(withAddons.addons, ADDONS.find(a => a.id === 'domain')!.price + ADDONS.find(a => a.id === 'copy')!.price);
  assert.ok(withAddons.base > plain.base);
});

test('báo giá: khoảng thấp luôn nhỏ hơn khoảng cao', () => {
  const e = estimate('website', 'w-growth', ['multilang'], 'fast');
  assert.ok(e);
  assert.ok(e.low < e.high);
});

test('báo giá: gói không tồn tại trả về null, không đoán', () => {
  assert.equal(estimate('landing', 'w-corp', [], 'normal'), null);
  assert.equal(estimate('landing', 'khong-co', [], 'normal'), null);
});

test('báo giá: bản tóm tắt yêu cầu có đủ thông tin chính', () => {
  const text = briefText({
    kind: 'landing', goal: 'Nhận khách hàng tiềm năng', industry: 'Yoga', hasBrand: true,
    tierId: 'l-standard', addonIds: ['ads'], timelineId: 'normal', contentReady: false, note: ''
  });
  assert.match(text, /Landing page — gói Chuẩn/);
  assert.match(text, /Yoga/);
  assert.match(text, /Cài đặt quảng cáo/);
});
