/*
 * Báo giá tham khảo: landing page và website.
 * Lưu ý: các mức giá dưới đây là SỐ MINH HỌA. Anh thay bằng bảng giá thật của DANAVA trước khi công bố.
 * Cách tính: giá gói + tùy chọn bổ sung, nhân hệ số thời gian; hiển thị một khoảng (thấp – cao).
 */
import { money } from './quote.ts';

export type Kind = 'landing' | 'website';

export type Tier = { id: string; label: string; price: number; desc: string };
export type Addon = { id: string; label: string; price: number };
export type Timeline = { id: string; label: string; factor: number };

export const KINDS: { id: Kind; label: string; desc: string }[] = [
  { id: 'landing', label: 'Landing page', desc: 'Một trang duy nhất, tập trung một mục tiêu: nhận khách hàng, bán hàng hoặc ra mắt chiến dịch.' },
  { id: 'website', label: 'Website', desc: 'Nhiều trang: giới thiệu, dịch vụ, tin tức, liên hệ; có thể mở rộng quản trị nội dung.' }
];

export const TIERS: Record<Kind, Tier[]> = {
  landing: [
    { id: 'l-basic', label: 'Cơ bản', price: 3_000_000, desc: '1 trang, tối đa 5 mục nội dung, form liên hệ.' },
    { id: 'l-standard', label: 'Chuẩn', price: 6_000_000, desc: '1 trang, tối đa 8 mục, form, SEO cơ bản, gắn đo lường.' },
    { id: 'l-premium', label: 'Nâng cao', price: 10_000_000, desc: '1 trang, hiệu ứng riêng, tích hợp CRM hoặc thanh toán.' }
  ],
  website: [
    { id: 'w-corp', label: 'Doanh nghiệp', price: 15_000_000, desc: 'Tối đa 5 trang, giao diện theo thương hiệu, SEO cơ bản.' },
    { id: 'w-growth', label: 'Mở rộng', price: 30_000_000, desc: 'Tối đa 10 trang, tin tức hoặc blog, tự quản lý nội dung.' },
    { id: 'w-custom', label: 'Tùy biến', price: 60_000_000, desc: 'Trên 10 trang, bán hàng trực tuyến, tích hợp hệ thống.' }
  ]
};

export const ADDONS: Addon[] = [
  { id: 'domain', label: 'Tên miền và hosting (1 năm)', price: 1_500_000 },
  { id: 'copy', label: 'Viết nội dung', price: 2_000_000 },
  { id: 'photo', label: 'Chụp ảnh hoặc quay video', price: 5_000_000 },
  { id: 'multilang', label: 'Đa ngôn ngữ', price: 4_000_000 },
  { id: 'payment', label: 'Thanh toán trực tuyến', price: 3_000_000 },
  { id: 'crm', label: 'Kết nối CRM hoặc Zalo OA', price: 3_000_000 },
  { id: 'ads', label: 'Cài đặt quảng cáo và đo lường', price: 3_000_000 }
];

export const TIMELINES: Timeline[] = [
  { id: 'fast', label: 'Gấp, dưới 2 tuần', factor: 1.2 },
  { id: 'normal', label: 'Bình thường, 2 đến 4 tuần', factor: 1 },
  { id: 'flex', label: 'Linh hoạt, trên 4 tuần', factor: 0.95 }
];

export const GOALS = ['Nhận khách hàng tiềm năng', 'Bán hàng trực tuyến', 'Giới thiệu thương hiệu', 'Ra mắt sản phẩm hoặc sự kiện'];

export type Estimate = { low: number; high: number; base: number; addons: number };

/** Làm tròn đến 100.000 đồng để khoảng giá dễ đọc */
const round = (n: number) => Math.round(n / 100_000) * 100_000;

export function estimate(kind: Kind, tierId: string, addonIds: string[], timelineId: string): Estimate | null {
  const tier = TIERS[kind].find(t => t.id === tierId);
  if (!tier) return null;
  const timeline = TIMELINES.find(t => t.id === timelineId) ?? TIMELINES[1];
  const addons = ADDONS.filter(a => addonIds.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  const base = round((tier.price + addons) * timeline.factor);
  // khoảng: có thể thấp hơn ~10% tùy phạm vi cụ thể, cao hơn ~20% khi phát sinh yêu cầu
  return { low: round(base * 0.9), high: round(base * 1.2), base, addons };
}

export const rangeText = (e: { low: number; high: number }) => `${money(e.low)} – ${money(e.high)}`;

export type Brief = {
  kind: Kind;
  goal: string;
  industry: string;
  hasBrand: boolean;
  tierId: string;
  addonIds: string[];
  timelineId: string;
  contentReady: boolean;
  note: string;
};

/** Tóm tắt yêu cầu thành văn bản gửi cho đội ngũ DANAVA */
export function briefText(b: Brief) {
  const kind = KINDS.find(k => k.id === b.kind)?.label ?? b.kind;
  const tier = TIERS[b.kind].find(t => t.id === b.tierId)?.label ?? b.tierId;
  const addons = ADDONS.filter(a => b.addonIds.includes(a.id)).map(a => a.label);
  const timeline = TIMELINES.find(t => t.id === b.timelineId)?.label ?? b.timelineId;
  return [
    `[Yêu cầu báo giá web] ${kind} — gói ${tier}`,
    `Mục tiêu: ${b.goal}`,
    `Ngành/lĩnh vực: ${b.industry || 'chưa ghi'}`,
    `Đã có logo/nhận diện: ${b.hasBrand ? 'có' : 'chưa'}`,
    `Thời gian: ${timeline}`,
    `Nội dung đã sẵn sàng: ${b.contentReady ? 'có' : 'chưa'}`,
    `Bổ sung: ${addons.length ? addons.join(', ') : 'không'}`,
    b.note ? `Ghi chú: ${b.note}` : ''
  ].filter(Boolean).join('\n');
}
