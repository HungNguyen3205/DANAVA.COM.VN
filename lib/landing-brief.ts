/*
 * Phiếu cung cấp thông tin thiết kế landing page, dạng hội thoại.
 * Các câu hỏi bám theo phiếu 12 mục của DANAVA, được rút gọn để phù hợp với khung chat.
 * Mục bắt buộc (required) tương ứng dấu (*) trên phiếu. Không hỏi mật khẩu hay mã truy cập.
 */

export const SECTIONS = [
  'Doanh nghiệp',
  'Mục tiêu',
  'Khách hàng',
  'Sản phẩm',
  'Nội dung',
  'Phong cách',
  'Chức năng',
  'Ngân sách & liên hệ'
] as const;

export type StepKind = 'text' | 'long' | 'single' | 'multi' | 'phone' | 'email';

export type Step = {
  id: string;
  section: number;
  bot: string;
  kind: StepKind;
  options?: string[];
  required?: boolean;
  /** Ghi chú ngắn dưới câu hỏi */
  hint?: string;
  /** Gợi ý cho nút "Nhờ DANAVA tư vấn" khi khách chưa biết */
  allowAdvice?: boolean;
};

export const ADVICE = 'Nhờ DANAVA tư vấn';

export const STEPS: Step[] = [
  { id: 'brand', section: 0, bot: 'Xin chào! Mình sẽ hỏi vài câu để DANAVA hiểu thương hiệu của bạn. Tên thương hiệu hoặc doanh nghiệp là gì?', kind: 'text', required: true },
  { id: 'industry', section: 0, bot: 'Lĩnh vực hoạt động của bạn là gì?', kind: 'text', required: true, hint: 'Ví dụ: phòng tập yoga, bất động sản, nhà hàng' },
  { id: 'approver', section: 0, bot: 'Ai là người duyệt thiết kế?', kind: 'text', required: true },
  { id: 'existing', section: 0, bot: 'Bạn đã có website, fanpage hoặc địa chỉ kinh doanh nào chưa?', kind: 'text', allowAdvice: true },

  { id: 'goal', section: 1, bot: 'Mục tiêu chính của trang là gì? Hãy chọn một ưu tiên nhất.', kind: 'single', required: true, options: [
    'Thu thập thông tin khách hàng', 'Khách gọi điện hoặc nhắn Zalo', 'Đăng ký tư vấn hoặc trải nghiệm',
    'Đăng ký sự kiện hoặc khóa học', 'Đặt lịch sử dụng dịch vụ', 'Đặt hàng hoặc thanh toán', 'Giới thiệu thương hiệu hoặc dự án'
  ] },
  { id: 'cta', section: 1, bot: 'Bạn muốn khách làm gì nhất khi vào trang?', kind: 'text', required: true, hint: 'Ví dụ: bấm gọi ngay, để lại số điện thoại' },
  { id: 'channels', section: 1, bot: 'Trang sẽ được quảng bá qua đâu? Chọn nhiều mục nếu cần.', kind: 'multi', options: ['Facebook', 'Google', 'TikTok', 'Zalo', 'Mã QR', 'Khách truy cập trực tiếp'], allowAdvice: true },

  { id: 'audience', section: 2, bot: 'Ai sẽ xem và sử dụng trang này? Mô tả độ tuổi, khu vực hoặc đặc điểm nổi bật.', kind: 'text', required: true },
  { id: 'pain', section: 2, bot: 'Khách hàng đang gặp vấn đề hoặc có nhu cầu gì?', kind: 'long', required: true },
  { id: 'hesitate', section: 2, bot: 'Điều gì thường khiến khách chần chừ trước khi đăng ký hoặc mua?', kind: 'long', allowAdvice: true },
  { id: 'why', section: 2, bot: 'Vì sao khách nên chọn bạn thay vì đơn vị khác?', kind: 'long', required: true },

  { id: 'product', section: 3, bot: 'Tên sản phẩm hoặc dịch vụ chính cần giới thiệu là gì?', kind: 'text', required: true },
  { id: 'description', section: 3, bot: 'Mô tả ngắn, dễ hiểu về sản phẩm hoặc dịch vụ đó.', kind: 'long', required: true },
  { id: 'benefits', section: 3, bot: 'Ba lợi ích nổi bật nhất dành cho khách hàng? Mỗi lợi ích một dòng.', kind: 'long', required: true },
  { id: 'packages', section: 3, bot: 'Các gói dịch vụ, giá và thời hạn sử dụng (nếu có).', kind: 'long', allowAdvice: true },
  { id: 'promo', section: 3, bot: 'Có ưu đãi nào đang áp dụng không? Ghi rõ điều kiện nếu có.', kind: 'text', allowAdvice: true },
  { id: 'pricing', section: 3, bot: 'Giá trên trang muốn hiển thị theo cách nào?', kind: 'single', options: ['Hiển thị giá cụ thể', 'Hiển thị "Giá từ…"', 'Hiển thị "Liên hệ"', 'Chưa xác định'] },
  { id: 'policy', section: 3, bot: 'Chính sách cần công bố như bảo hành, đổi trả, hủy lịch hoặc hoàn tiền?', kind: 'long', allowAdvice: true },

  { id: 'assets', section: 4, bot: 'Bạn đã có những tài liệu nào? Chọn tất cả những mục phù hợp.', kind: 'multi', options: [
    'Logo chất lượng cao', 'Bộ nhận diện thương hiệu', 'Hình ảnh sản phẩm, dịch vụ hoặc không gian', 'Video giới thiệu',
    'Bảng giá hoặc catalogue', 'Hồ sơ doanh nghiệp', 'Đánh giá khách hàng được phép sử dụng', 'Chứng nhận hoặc giải thưởng', 'Chưa có, cần DANAVA hỗ trợ'
  ] },
  { id: 'must', section: 4, bot: 'Những nội dung hoặc hình ảnh nào bắt buộc phải có trên trang?', kind: 'long', allowAdvice: true },
  { id: 'avoid', section: 4, bot: 'Có nội dung hoặc hình ảnh nào không được sử dụng không?', kind: 'long', allowAdvice: true },
  { id: 'content_owner', section: 4, bot: 'Ai sẽ phụ trách nội dung?', kind: 'single', options: [
    'Khách hàng cung cấp đầy đủ', 'DANAVA biên tập từ tài liệu khách gửi', 'DANAVA đề xuất để khách duyệt'
  ] },

  { id: 'style', section: 5, bot: 'Chọn tối đa hai phong cách bạn mong muốn.', kind: 'multi', options: [
    'Sang trọng, cao cấp', 'Hiện đại, công nghệ', 'Tối giản, rõ ràng', 'Trẻ trung, năng động',
    'Thiên nhiên, thư giãn', 'Chuyên nghiệp, tạo sự tin cậy', 'Sáng tạo, có điểm nhấn', ADVICE
  ] },
  { id: 'colors', section: 5, bot: 'Màu chủ đạo bạn muốn là gì? Màu nào nên tránh?', kind: 'text', allowAdvice: true },
  { id: 'feel', section: 5, bot: 'Bạn muốn khách cảm nhận điều gì trong 5 giây đầu tiên?', kind: 'long', allowAdvice: true },
  { id: 'reference', section: 5, bot: 'Bạn có website nào làm bạn thích không? Gửi link và cho biết điểm thích cụ thể.', kind: 'long', allowAdvice: true },
  { id: 'motion', section: 5, bot: 'Bạn muốn chuyển động trên trang ở mức nào?', kind: 'single', options: [
    'Nhẹ nhàng: nội dung hiện khi cuộn', 'Có điểm nhấn: hiệu ứng sản phẩm, chuyển cảnh', 'Nổi bật: hoạt cảnh riêng theo thương hiệu', ADVICE
  ] },
  { id: 'devices', section: 5, bot: 'Khách của bạn chủ yếu dùng thiết bị nào?', kind: 'single', options: ['Chủ yếu điện thoại', 'Chủ yếu máy tính', 'Cả hai'] },

  { id: 'scale', section: 6, bot: 'Quy mô nội dung của trang ở mức nào?', kind: 'single', required: true, options: [
    'Ngắn gọn (tối đa 5 mục)', 'Vừa (tối đa 8 mục)', 'Đầy đủ, nhiều chức năng'
  ] },
  { id: 'functions', section: 6, bot: 'Trang cần có những chức năng nào? Chọn tất cả những mục cần thiết.', kind: 'multi', options: [
    'Gọi điện nhanh', 'Nhắn Zalo hoặc Messenger', 'Form đăng ký', 'Đặt lịch', 'Chọn gói dịch vụ', 'Thanh toán trực tuyến',
    'Bản đồ và chỉ đường', 'Nhiều ngôn ngữ', 'Blog hoặc tin tức', 'Danh sách dự án có thể cập nhật',
    'Trang quản trị để tự sửa nội dung', 'Đo lượt truy cập và lượt đăng ký', 'Kết nối CRM hoặc hệ thống có sẵn'
  ], allowAdvice: true },
  { id: 'form_fields', section: 6, bot: 'Nếu có form đăng ký, khách cần điền những trường nào?', kind: 'multi', options: [
    'Họ tên', 'Số điện thoại', 'Email', 'Dịch vụ quan tâm', 'Thời gian mong muốn'
  ], allowAdvice: true },
  { id: 'form_destination', section: 6, bot: 'Thông tin đăng ký sẽ được chuyển về đâu?', kind: 'single', options: ['Email', 'Google Sheets', 'Trang quản trị', 'CRM', ADVICE] },
  { id: 'self_update', section: 6, bot: 'Bạn muốn tự cập nhật những nội dung nào?', kind: 'multi', options: [
    'Giá và ưu đãi', 'Hình ảnh hoặc video', 'Bài viết', 'Dự án hoặc sản phẩm', 'Đánh giá khách hàng', 'Thông tin liên hệ', 'Không cần tự cập nhật'
  ] },
  { id: 'domain', section: 6, bot: 'Tên miền bạn muốn dùng là gì? Đã có tên miền hoặc hosting chưa?', kind: 'text', allowAdvice: true },

  { id: 'addons', section: 7, bot: 'Bạn có cần thêm dịch vụ nào không? Chọn nhiều mục nếu cần.', kind: 'multi', options: [
    'Tên miền và hosting (1 năm)', 'Viết nội dung', 'Chụp ảnh hoặc quay video', 'Đa ngôn ngữ',
    'Thanh toán trực tuyến', 'Kết nối CRM hoặc Zalo OA', 'Cài đặt quảng cáo và đo lường'
  ], allowAdvice: true },
  { id: 'budget', section: 7, bot: 'Khoảng ngân sách dự kiến của bạn?', kind: 'single', required: true, options: [
    'Dưới 5 triệu', 'Từ 5 đến 10 triệu', 'Từ 10 đến 20 triệu', 'Trên 20 triệu', ADVICE
  ] },
  { id: 'deadline', section: 7, bot: 'Ngày mong muốn đưa trang vào sử dụng là khi nào? Có gắn với sự kiện hoặc chiến dịch nào không?', kind: 'text', allowAdvice: true },
  { id: 'approver_final', section: 7, bot: 'Ai là người quyết định duyệt cuối cùng?', kind: 'text', required: true },
  { id: 'name', section: 7, bot: 'Cảm ơn bạn! Để DANAVA liên hệ, hãy cho mình họ và tên.', kind: 'text', required: true },
  { id: 'phone', section: 7, bot: 'Số điện thoại hoặc Zalo của bạn?', kind: 'phone', required: true },
  { id: 'email', section: 7, bot: 'Email của bạn (nếu có)?', kind: 'email', allowAdvice: true, hint: 'Có thể bỏ qua' },
  { id: 'note', section: 7, bot: 'Ghi chú thêm (nếu có).', kind: 'long', allowAdvice: true }
];

export type Answers = Record<string, string | string[]>;

const val = (answers: Answers, id: string) => {
  const v = answers[id];
  if (Array.isArray(v)) return v.length ? v.join(', ') : '';
  return (v ?? '').trim();
};

/** Bản tóm tắt phiếu theo từng mục để gửi cho đội ngũ DANAVA */
export function buildBrief(answers: Answers): string {
  const lines: string[] = ['[Phiếu thiết kế landing page]'];
  let section = -1;
  for (const step of STEPS) {
    if (step.section !== section) {
      section = step.section;
      lines.push('', `— ${SECTIONS[section]} —`);
    }
    const v = val(answers, step.id);
    if (step.id === 'name' || step.id === 'phone' || step.id === 'email') {
      lines.push(`${label(step)}: ${v || 'chưa ghi'}`);
    } else {
      lines.push(`${label(step)}: ${v || 'nhờ DANAVA tư vấn'}`);
    }
  }
  return lines.join('\n');
}

/** Nhãn ngắn cho từng câu hỏi trong bản tóm tắt */
function label(step: Step) {
  return step.bot.replace(/\?$/, '').replace(/^Cảm ơn bạn! /, '');
}

/** Gói landing page gợi ý theo số mục nội dung khách chọn */
export const SCALE_TO_TIER: Record<string, string> = {
  'Ngắn gọn (tối đa 5 mục)': 'l-basic',
  'Vừa (tối đa 8 mục)': 'l-standard',
  'Đầy đủ, nhiều chức năng': 'l-premium'
};
