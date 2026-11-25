/** Giờ làm việc (trang Liên hệ): đọc chuỗi giờ trong CMS, trạng thái đang làm việc / nghỉ trưa / ngoài giờ theo giờ Việt Nam. */
/**
 * Giờ làm việc đọc từ chuỗi trong CMS, vd. "Thứ Hai – Thứ Bảy, 08:00 – 18:00 (nghỉ trưa 11:30 – 14:00)".
 * Chỉ trả kết quả khi đọc được chắc chắn; ngược lại null (không hiện trạng thái / giờ rút gọn sai).
 */
export type WorkState = 'open' | 'lunch' | 'closed';
export type Hours = { from: number; to: number; open: number; close: number; lunch?: [number, number]; days: string; time: string; lunchText?: string };
const DAY: Record<string, number> = { 'chủ nhật': 0, 'thứ hai': 1, 'thứ ba': 2, 'thứ tư': 3, 'thứ năm': 4, 'thứ sáu': 5, 'thứ bảy': 6 };
const SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const RANGE = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/;
const hm = (h: string, m: string) => Number(h) * 60 + Number(m);
const clock = (h: string, m: string) => `${Number(h)}:${m}`;
export function parseHours(text: string): Hours | null {
  const lunchM = text.match(new RegExp('nghỉ trưa[^\\d]*' + RANGE.source, 'i'));
  const t = text.replace(/\(?\s*nghỉ trưa[^)]*\)?/i, '').match(RANGE);
  const d = text.toLowerCase().match(/(thứ hai|thứ ba|thứ tư|thứ năm|thứ sáu|thứ bảy|chủ nhật)\s*[–-]\s*(thứ hai|thứ ba|thứ tư|thứ năm|thứ sáu|thứ bảy|chủ nhật)/);
  if (!t || !d) return null;
  const from = DAY[d[1]] || 7, to = DAY[d[2]] || 7;
  return {
    from, to, open: hm(t[1], t[2]), close: hm(t[3], t[4]),
    lunch: lunchM ? [hm(lunchM[1], lunchM[2]), hm(lunchM[3], lunchM[4])] : undefined,
    days: `${SHORT[DAY[d[1]]]} – ${SHORT[DAY[d[2]]]}`, time: `${clock(t[1], t[2])} – ${clock(t[3], t[4])}`,
    lunchText: lunchM ? `${clock(lunchM[1], lunchM[2])} – ${clock(lunchM[3], lunchM[4])}` : undefined
  };
}
export function workState(h: Hours, now = new Date()): WorkState {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.find(x => x.type === 'weekday')!.value);
  const day = wd === 0 ? 7 : wd;
  const mins = Number(parts.find(x => x.type === 'hour')!.value) * 60 + Number(parts.find(x => x.type === 'minute')!.value);
  if (day < h.from || day > h.to || mins < h.open || mins >= h.close) return 'closed';
  if (h.lunch && mins >= h.lunch[0] && mins < h.lunch[1]) return 'lunch';
  return 'open';
}
