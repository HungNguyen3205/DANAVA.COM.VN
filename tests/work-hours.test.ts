/** Giờ làm việc trang Liên hệ: đang làm việc / nghỉ trưa / ngoài giờ (giờ Việt Nam) + giờ rút gọn. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT } from '../lib/company.ts';
import { initial } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { parseHours, workState } from '../lib/work-hours.ts';
// Giờ Việt Nam = UTC+7
const vn = (iso: string) => new Date(iso + '+07:00');

test('giờ mặc định có giờ nghỉ trưa 11:30 – 14:00', () => {
  assert.equal(CONTACT.hours, 'Thứ Hai – Thứ Bảy, 08:00 – 18:00 (nghỉ trưa 11:30 – 14:00)');
});

test('dữ liệu đã lưu còn giờ cũ → tự chuyển sang giờ có nghỉ trưa; giờ tự sửa thì giữ nguyên', () => {
  const base = normalizeContent(structuredClone(initial));
  const old = { ...base, blocks: { ...base.blocks, company: { ...(base.blocks?.company || {}), hours: 'Thứ Hai – Thứ Bảy, 08:00 – 18:00' } } } as typeof base;
  assert.equal((normalizeContent(old).blocks?.company as { hours: string }).hours, CONTACT.hours);
  const own = { ...base, blocks: { ...base.blocks, company: { ...(base.blocks?.company || {}), hours: 'Thứ Hai – Thứ Sáu, 09:00 – 17:00' } } } as typeof base;
  assert.equal((normalizeContent(own).blocks?.company as { hours: string }).hours, 'Thứ Hai – Thứ Sáu, 09:00 – 17:00');
});

test('trạng thái theo giờ Việt Nam: làm việc, nghỉ trưa, ngoài giờ, Chủ nhật', () => {
  const h = parseHours(CONTACT.hours)!;
  assert.deepEqual({ days: h.days, time: h.time, lunch: h.lunchText }, { days: 'T2 – T7', time: '8:00 – 18:00', lunch: '11:30 – 14:00' });
  assert.equal(workState(h, vn('2026-11-25T09:15:00')), 'open');     // Thứ Tư
  assert.equal(workState(h, vn('2026-11-25T11:30:00')), 'lunch');
  assert.equal(workState(h, vn('2026-11-25T13:59:00')), 'lunch');
  assert.equal(workState(h, vn('2026-11-25T14:00:00')), 'open');
  assert.equal(workState(h, vn('2026-11-25T18:00:00')), 'closed');
  assert.equal(workState(h, vn('2026-11-29T10:00:00')), 'closed');   // Chủ nhật
  // Không có giờ nghỉ trưa → giữa trưa vẫn làm việc
  assert.equal(workState(parseHours('Thứ Hai – Thứ Bảy, 08:00 – 18:00')!, vn('2026-11-25T12:00:00')), 'open');
});
