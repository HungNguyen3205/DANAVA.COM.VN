/*
 * Báo giá tham khảo tính từ bảng giá trong CMS (extras.pricing), không dùng AI.
 * Quy tắc theo Hello DANAVA: giá gói cho cả kỳ hạn + tùy chọn bổ sung
 * (tùy chọn theo tháng nhân số tháng của kỳ, tùy chọn theo lần nhân số lượng).
 */
import type { PRICING } from './site-extras.ts';

export type PriceTable = typeof PRICING;
export type Plan = PriceTable['plans'][number];
export type Addon = PriceTable['addons'][number];

const PRICE = /^(\d{1,12}|\d{1,3}([.,]\d{3}){1,3})$/;
export const validPrice = (value: string) => value === '' || PRICE.test(value);

/** Số tiền, hoặc null khi để trống = cần nhân viên báo giá. "0" = miễn phí. */
export const parsePrice = (value: string) => (PRICE.test(value) ? Number(value.replace(/\D/g, '')) : null);

export const money = (amount: number) => `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`;

export function priceText(value: string) {
  const amount = parsePrice(value);
  return amount === null ? 'Liên hệ báo giá' : amount === 0 ? 'Miễn phí' : money(amount);
}

export function perMonth(value: string, months: number) {
  const amount = parsePrice(value);
  return amount && months > 1 ? `≈ ${money(amount / months)}/tháng` : '';
}

/** Giới hạn của gói: "1.000" → 1000, "Không giới hạn" → Infinity, chữ khác → null (không suy đoán). */
export function planLimit(value: string) {
  const text = value.trim().normalize('NFC');
  if (/^không giới hạn$/i.test(text)) return Infinity;
  return PRICE.test(text) ? Number(text.replace(/\D/g, '')) : null;
}

export type Need = { members: number; staff: number; branches: number };

/**
 * Gói rẻ nhất có đủ hạn mức. Chỉ xét hội viên, nhân sự, chi nhánh — không xét tính năng.
 * null = vượt mọi gói hoặc bảng giá không đủ dữ liệu → cần nhân viên.
 */
export function recommendPlan(table: PriceTable, need: Need): Plan | null {
  const fits = table.plans.filter(plan => {
    if (parsePrice(plan.price) === null) return false;
    return (['members', 'staff', 'branches'] as const).every(key => {
      if (!need[key]) return true;
      const limit = planLimit(plan[key]);
      return limit !== null && need[key] <= limit;
    });
  });
  return fits.sort((a, b) => parsePrice(a.price)! - parsePrice(b.price)!)[0] ?? null;
}

export type Estimate = {
  lines: { label: string; amount: number | null }[];
  /** null = có hạng mục chưa có giá */
  total: number | null;
};

export function estimate(table: PriceTable, planId: string, quantities: Record<string, number>): Estimate | null {
  const plan = table.plans.find(p => p.id === planId);
  if (!plan) return null;
  const lines: Estimate['lines'] = [{ label: `Gói ${plan.name}, ${table.termMonths} tháng`, amount: parsePrice(plan.price) }];
  for (const addon of table.addons) {
    const qty = Math.min(99, Math.max(0, Math.floor(quantities[addon.id] || 0)));
    if (!qty) continue;
    const price = parsePrice(addon.price);
    const times = addon.monthly ? table.termMonths : qty;
    lines.push({ label: `${addon.name} × ${times}${addon.monthly ? ' tháng' : ''}`, amount: price === null ? null : price * times });
  }
  return { lines, total: lines.some(l => l.amount === null) ? null : lines.reduce((sum, l) => sum + l.amount!, 0) };
}
