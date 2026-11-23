/*
 * Phiếu báo giá tổ chức sự kiện, dạng hội thoại (cùng khung với phiếu landing page).
 * Lưu ý: mức giá trong EVENT_TIERS là SỐ MINH HỌA, anh thay bằng bảng giá thật trước khi công bố.
 */
import type { Step } from './landing-brief.ts';

export const EVENT_SECTIONS = ['Sự kiện', 'Quy mô', 'Nội dung', 'Ngân sách & liên hệ'] as const;

const ADVICE = 'Nhờ DANAVA tư vấn';

export const EVENT_STEPS: Step[] = [
  { id: 'brand', section: 0, bot: 'Xin chào! Mình sẽ hỏi vài câu để báo giá tổ chức sự kiện. Tên doanh nghiệp hoặc thương hiệu của bạn là gì?', kind: 'text', required: true },
  { id: 'eventType', section: 0, bot: 'Bạn muốn tổ chức loại sự kiện nào?', kind: 'single', required: true, options: [
    'Hội nghị, họp báo', 'Ra mắt sản phẩm', 'Workshop, đào tạo', 'Team building', 'Lễ kỷ niệm, gala', 'Khác'
  ] },
  { id: 'date', section: 0, bot: 'Dự kiến tổ chức vào khoảng thời gian nào?', kind: 'text', allowAdvice: true, hint: 'Ví dụ: tháng 3 năm 2027' },
  { id: 'venue', section: 0, bot: 'Địa điểm dự kiến ở đâu? Nếu chưa chọn, bạn có thể bỏ qua.', kind: 'text', allowAdvice: true },

  { id: 'guests', section: 1, bot: 'Số lượng khách dự kiến khoảng bao nhiêu?', kind: 'single', required: true, options: [
    'Dưới 100 khách', 'Từ 100 đến 300 khách', 'Trên 300 khách'
  ] },
  { id: 'agenda', section: 1, bot: 'Chương trình gồm những phần nào? Chọn tất cả những mục cần.', kind: 'multi', options: [
    'Kịch bản và dẫn chương trình', 'Sân khấu và thi công', 'Âm thanh, ánh sáng', 'Ghi hình và chụp ảnh', 'Nhân sự điều phối', 'Trưng bày sản phẩm'
  ], allowAdvice: true },

  { id: 'content', section: 2, bot: 'Bạn đã có nội dung và kịch bản chưa?', kind: 'single', options: [
    'Đã có đầy đủ', 'Có một phần', 'Cần DANAVA đề xuất', ADVICE
  ] },
  { id: 'goal', section: 2, bot: 'Mục tiêu chính của sự kiện là gì?', kind: 'text', allowAdvice: true, hint: 'Ví dụ: giới thiệu sản phẩm mới cho khách hàng hiện tại' },

  { id: 'budget', section: 3, bot: 'Khoảng ngân sách dự kiến của bạn?', kind: 'single', required: true, options: [
    'Dưới 30 triệu', 'Từ 30 đến 80 triệu', 'Trên 80 triệu', ADVICE
  ] },
  { id: 'approver', section: 3, bot: 'Ai là người duyệt chương trình?', kind: 'text', required: true },
  { id: 'name', section: 3, bot: 'Cảm ơn bạn! Để DANAVA liên hệ, hãy cho mình họ và tên.', kind: 'text', required: true },
  { id: 'phone', section: 3, bot: 'Số điện thoại hoặc Zalo của bạn?', kind: 'phone', required: true },
  { id: 'email', section: 3, bot: 'Email của bạn (nếu có)?', kind: 'email', allowAdvice: true, hint: 'Có thể bỏ qua' },
  { id: 'note', section: 3, bot: 'Ghi chú thêm (nếu có).', kind: 'long', allowAdvice: true }
];

/** Bảng giá tham khảo theo quy mô khách: SỐ MINH HỌA */
export const EVENT_TIERS = {
  small: { label: 'Dưới 100 khách', low: 15_000_000, high: 25_000_000 },
  medium: { label: 'Từ 100 đến 300 khách', low: 35_000_000, high: 55_000_000 },
  large: { label: 'Trên 300 khách', low: 70_000_000, high: 110_000_000 }
} as const;

export const GUESTS_TO_TIER: Record<string, keyof typeof EVENT_TIERS> = {
  'Dưới 100 khách': 'small',
  'Từ 100 đến 300 khách': 'medium',
  'Trên 300 khách': 'large'
};

/** Khoảng giá tham khảo; thêm mỗi hạng mục bổ sung khoảng 5% */
export function eventEstimate(guests: string | undefined, agenda: string[] | undefined) {
  const tier = guests ? EVENT_TIERS[GUESTS_TO_TIER[guests] ?? 'medium'] : null;
  if (!tier) return null;
  const extra = 1 + 0.05 * (agenda?.length ?? 0);
  const round = (n: number) => Math.round(n / 100_000) * 100_000;
  return { low: round(tier.low * extra), high: round(tier.high * extra) };
}
