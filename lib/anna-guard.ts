/*
 * Lớp chặn cuối cho câu trả lời của ANNA, chạy trên máy chủ TRƯỚC khi chữ được gửi tới khách:
 * - số tiền phải có trong bảng giá / dữ liệu, hoặc là tổng tính được từ bảng giá;
 * - phần trăm ưu đãi phải có trong dữ liệu;
 * - số điện thoại phải có trong dữ liệu.
 * Giới hạn: chỉ kiểm tra CON SỐ có tồn tại, không kiểm tra con số có gắn đúng gói hay không.
 */
import { parsePrice, type PriceTable } from './quote.ts';

const UNIT: Record<string, number> = { tỷ: 1e9, tỉ: 1e9, triệu: 1e6, tr: 1e6, nghìn: 1e3, ngàn: 1e3, k: 1e3, đồng: 1, vnđ: 1, vnd: 1, đ: 1, '₫': 1 };
const WITH_UNIT = /(?<![\p{L}\d.,])(\d{1,3}(?:[.,  ]\d{3})+|\d+(?:[.,]\d+)?)\s*(tỷ|tỉ|triệu|tr|nghìn|ngàn|k|đồng|vnđ|vnd|đ|₫)(?![\p{L}\d])/giu;
const BARE = /(?<![\p{L}\d.,/])([1-9]\d{0,2}(?:[.,]\d{3})+|[1-9]\d{5,})(?!\d)/gu;
/** Cách viết không kiểm chứng được: 5tr5, 5 triệu rưỡi, 5–10 triệu, viết bằng chữ, ngoại tệ. */
const AMBIGUOUS = [
  /\d\s*(?:tr|triệu|k)\s*(?:\d|rưỡi|mấy)/iu,
  /\d\s*(?:-|–|—|~|đến|tới)\s*\d[\d.,]*\s*(?:tỷ|tỉ|triệu|tr|nghìn|ngàn|k)(?![\p{L}\d])/iu,
  /(?<!\p{L})(?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|mươi|vài|trăm)\s+(?:triệu|tỷ|tỉ|nghìn|ngàn)(?!\p{L})/iu,
  /[$€£]\s*\d|(?<![\p{L}\d])\d[\d.,]*\s*(?:usd|đô la|euro|[$€£])/iu
];
const DISCOUNT = /(?:giảm|ưu đãi|chiết khấu|khuyến mãi|khuyến mại)[^.\n]{0,40}?(\d+(?:[.,]\d+)?)\s*(?:%|phần trăm)|(\d+(?:[.,]\d+)?)\s*(?:%|phần trăm)\s*(?:giảm|ưu đãi|chiết khấu|khuyến mãi|khuyến mại)/giu;
const PHONE = /(?<![\d.,])(?:\+84|0)(?:[ .-]?\d){9,10}(?!\d)/g;

const phoneKey = (value: string) => value.replace(/\D/g, '').replace(/^84/, '0');

export function amountsIn(text: string): number[] {
  const out: number[] = [];
  const spans: [number, number][] = [];
  for (const m of text.matchAll(WITH_UNIT)) {
    const unit = UNIT[m[2].toLowerCase()] ?? 1;
    const raw = m[1].replace(/[  ]/g, '');
    // "5,5 triệu" là số thập phân; "5.000.000 đ" là phân cách hàng nghìn
    const decimal = unit > 1 && (unit >= 1e6 ? /^\d+[.,]\d+$/ : /^\d+[.,]\d{1,2}$/).test(raw);
    out.push(Math.round((decimal ? Number(raw.replace(',', '.')) : Number(raw.replace(/\D/g, ''))) * unit));
    spans.push([m.index!, m.index! + m[0].length]);
  }
  for (const m of text.matchAll(BARE)) {
    if (spans.some(([a, b]) => m.index! >= a && m.index! < b)) continue;
    const value = Number(m[1].replace(/\D/g, ''));
    if (value >= 100_000) out.push(value);
  }
  return out;
}

export type Facts = { amounts: Set<number>; percents: Set<string>; phones: Set<string> };

export function allowedFacts(knowledge: string, table: PriceTable | null): Facts {
  const amounts = new Set(amountsIn(knowledge));
  amounts.add(0);
  if (table) {
    const months = table.termMonths;
    const plans = table.plans.map(p => parsePrice(p.price)).filter((p): p is number => p !== null);
    for (const a of plans) {
      amounts.add(a);
      amounts.add(Math.round(a / months));
      for (const b of plans) if (a > b) amounts.add(a - b);
    }
    // Mọi tổng hợp lệ: gói (hoặc không) + tùy chọn theo tháng 0/1 lần + tùy chọn theo lần 0–5
    let totals = new Set([0, ...plans]);
    for (const addon of table.addons) {
      const price = parsePrice(addon.price);
      if (!price) continue;
      amounts.add(price);
      const steps = addon.monthly ? [0, price * months] : [0, 1, 2, 3, 4, 5].map(n => n * price);
      const next = new Set<number>();
      for (const total of totals) for (const step of steps) if (next.size < 5000) next.add(total + step);
      totals = next;
    }
    for (const total of totals) amounts.add(total);
  }
  return {
    amounts,
    percents: new Set([...knowledge.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map(m => m[1])),
    phones: new Set([...knowledge.matchAll(PHONE)].map(m => phoneKey(m[0])))
  };
}

export function unverified(text: string, facts: Facts): '' | 'price' | 'discount' | 'phone' {
  const s = text.normalize('NFC');
  for (const m of s.matchAll(PHONE)) if (!facts.phones.has(phoneKey(m[0]))) return 'phone';
  // Bỏ số điện thoại đã xác minh để không bị hiểu thành số tiền
  const rest = s.replace(PHONE, ' ');
  if (AMBIGUOUS.some(rx => rx.test(rest))) return 'price';
  if (amountsIn(rest).some(a => !facts.amounts.has(a))) return 'price';
  for (const m of rest.matchAll(DISCOUNT)) if (!facts.percents.has(m[1] || m[2])) return 'discount';
  return '';
}

/** Giữ chữ lại tới hết câu/dòng rồi mới cho đi, để con số sai không kịp hiện trên màn hình khách. */
export class CheckedStream {
  text = '';
  private sent = 0;
  private facts: Facts;

  constructor(facts: Facts) {
    this.facts = facts;
  }

  /** Trả phần an toàn để gửi, hoặc null khi phải hủy câu trả lời. */
  push(delta: string): string | null {
    this.text += delta;
    const pending = this.text.slice(this.sent);
    let cut = -1;
    for (const m of pending.matchAll(/\n|[.!?…](?=\s)/g)) cut = m.index! + m[0].length;
    return cut < 0 ? '' : this.release(this.sent + cut);
  }

  end(): string | null {
    return this.release(this.text.length);
  }

  private release(until: number): string | null {
    if (unverified(this.text.slice(0, until), this.facts)) return null;
    const out = this.text.slice(this.sent, until);
    this.sent = until;
    return out;
  }
}
