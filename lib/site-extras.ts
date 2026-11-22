/*
 * Cấu hình bổ sung chỉnh trong CMS, lưu ở SiteData.extras (đọc bằng block(data, key) như các khối khác).
 *
 * Vì sao không nằm trong SiteData.blocks: bản build cũ từ chối khóa lạ trong `blocks`, nên khi quay lại
 * bản trước (docs/BAN-GIAO.md mục 3) cả website sẽ lỗi 500. Trường cấp cao nhất thì bản cũ bỏ qua và giữ nguyên.
 * Các bản build 755cd6b..4700737 lại từ chối khóa lạ trong `extras`; từ bản có trang Tuyển dụng thì khóa lạ được bỏ qua.
 * Còn có thể quay lại các bản đó thì khối mới phải dùng trường cấp cao nhất riêng (xem SiteData.careers).
 */
import { HELLO, PRODUCTS_CHECKED } from './products.ts';
import { validPrice } from './quote.ts';

/* ------------------------------------------------------------ Kênh liên hệ */
export const CHANNELS = {
  /** Trống = zalo.me theo số Hotline */
  zalo: '',
  /** Trống = m.me theo tên người dùng của Fanpage */
  messenger: '',
  /** Chưa có tài khoản được xác nhận → trống → không hiện */
  linkedin: '',
  x: ''
};
const CHANNEL_RULES: [keyof typeof CHANNELS, string, RegExp][] = [
  ['zalo', 'Zalo', /^https:\/\/([a-z0-9-]+\.)?(zalo\.me|zaloapp\.com)\/[^\s"'<>]+$/i],
  ['messenger', 'Messenger', /^https:\/\/(m\.me|(www\.)?messenger\.com)\/[^\s"'<>]+$/i],
  ['linkedin', 'LinkedIn', /^https:\/\/([a-z0-9-]+\.)?linkedin\.com\/[^\s"'<>]+$/i],
  ['x', 'X', /^https:\/\/(www\.)?(x|twitter)\.com\/[^\s"'<>]+$/i]
];

/* ------------------------------------------------------------ Ảnh doanh nghiệp */
export const GALLERY = {
  visible: true,
  kicker: 'Hình ảnh DANAVA',
  title: 'Người thật, *việc thật.*',
  lead: 'Không gian làm việc và những buổi workshop, hoạt động cộng đồng DANAVA đã đồng hành.',
  /** Ảnh đầu tiên (đang hiển thị) là ảnh lớn. Nguồn: ảnh văn phòng và ảnh bìa các bài hoạt động trên danava.com.vn. */
  photos: [
    { image: '/assets/about/office.webp', caption: 'Văn phòng DANAVA tại Đà Nẵng', alt: 'Phòng họp tại văn phòng DANAVA Đà Nẵng', focus: '', visible: true },
    { image: '/assets/verified/post-13591.webp', caption: 'Soundbath Live Concert 2024', alt: 'Người tham gia chụp ảnh chung tại Soundbath Live Concert 2024', focus: '', visible: true },
    { image: '/assets/verified/post-13491.webp', caption: 'Yoga Workshop', alt: 'Người tham gia Yoga Workshop chụp ảnh chung', focus: '', visible: true },
    { image: '/assets/verified/post-13468.webp', caption: 'Workshop “Cột sống là cuộc sống”', alt: 'Người tham gia workshop Cột sống là cuộc sống chụp ảnh chung', focus: '', visible: true },
    { image: '/assets/verified/post-13493.webp', caption: 'Workshop “Thiền Trà”', alt: 'Không gian workshop Thiền Trà của DANAVA', focus: '', visible: true }
  ]
};

/** Vị trí cần giữ khi cắt ảnh (giá trị object-position). */
export const PHOTO_FOCUS = ['', 'top', 'bottom', 'left', 'right'];
export const PHOTO_MAX = 12;

/* ------------------------------------------------------------ Trợ lý ANNA */
export const ANNA = {
  enabled: true,
  title: 'Bạn đang cần gì? *Hỏi ANNA.*',
  lead: 'Mô tả mô hình và nhu cầu của bạn. ANNA tư vấn theo thông tin trên website và kết nối bạn với đội ngũ DANAVA khi cần xác nhận.',
  placeholder: 'Nhập nhu cầu của bạn…',
  greeting: 'Xin chào, mình là ANNA, trợ lý AI của DANAVA. Bạn đang cần giải pháp gì và cho mô hình kinh doanh nào?',
  unavailable: 'Bạn vẫn có thể xem báo giá nhanh hoặc nhắn trực tiếp cho đội ngũ DANAVA.',
  suggestions: [
    'Gói DANAVA Studio nào hợp với phòng tập của tôi?',
    'Làm website cần chuẩn bị những gì?',
    'Tôi cần tư vấn tổ chức sự kiện'
  ],
  /** Nhóm nội dung website ANNA được dùng (thông tin liên hệ luôn có) */
  sources: { services: true, products: true, projects: true, posts: true },
  /** Thông tin bổ sung, mỗi dòng một ý. Không gửi xuống trình duyệt nhưng ANNA có thể nói lại cho khách. */
  knowledge: [] as string[],
  instructions: ''
};

/* ------------------------------------------------------------ Bảng giá */
const ADDON_IDS = ['app', 'branch'];
export const PRICING = {
  /** Cho ANNA và Báo giá nhanh dùng bảng giá; trang Hello DANAVA luôn hiển thị bảng này */
  enabled: true,
  checked: PRODUCTS_CHECKED,
  termMonths: 12,
  note: HELLO.termNote,
  plans: HELLO.plans.map((plan, i) => ({
    id: HELLO.planIds[i], name: plan.name, desc: plan.desc,
    /** Chỉ chữ số; '0' = miễn phí; trống = cần nhân viên báo giá */
    price: plan.price.replace(/\D/g, '') || '0',
    members: plan.members, staff: plan.staff, branches: plan.branches, highlight: plan.highlight, perks: [...plan.perks]
  })),
  addons: HELLO.addons.map((addon, i) => ({ id: ADDON_IDS[i], name: addon.name, price: addon.price.replace(/\D/g, ''), monthly: addon.price.includes('tháng') }))
};

/* ------------------------------------------------------------ Kiểm tra giá trị */
export type ExtraValues = { contact: typeof CHANNELS; gallery: typeof GALLERY; anna: typeof ANNA; pricing: typeof PRICING };

const IMAGE = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g)$/;

/**
 * Kiểm tra giá trị (cấu trúc đã được kiểm tra ở lib/blocks.ts).
 * Trả về câu báo lỗi cho quản trị viên, '' khi hợp lệ.
 */
export function extraError(values: Partial<ExtraValues> | undefined): string {
  const channels = values?.contact;
  if (channels) {
    for (const [key, name, rule] of CHANNEL_RULES) {
      if (channels[key] && !rule.test(channels[key])) return `Kênh liên hệ: link ${name} không đúng. Dán link https của đúng kênh hoặc để trống.`;
    }
  }
  const anna = values?.anna;
  if (anna) {
    if (!Array.isArray(anna.suggestions) || !Array.isArray(anna.knowledge)) return 'ANNA: cấu trúc không hợp lệ.';
    if (anna.suggestions.length > 8 || anna.suggestions.some(s => s.length > 200)) return 'ANNA: tối đa 8 câu gợi ý, mỗi câu không quá 200 ký tự.';
    if (anna.knowledge.join('\n').length > 20_000) return 'ANNA: thông tin bổ sung tối đa 20.000 ký tự.';
    if (String(anna.instructions).length > 4000) return 'ANNA: hướng dẫn thêm tối đa 4.000 ký tự.';
  }
  const pricing = values?.pricing;
  if (pricing) {
    const { plans, addons, termMonths } = pricing;
    if (!Array.isArray(plans) || !Array.isArray(addons)) return 'Bảng giá: cấu trúc không hợp lệ.';
    if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 60) return 'Bảng giá: kỳ hạn phải từ 1 đến 60 tháng.';
    if (!plans.length || plans.length > 8 || addons.length > 8) return 'Bảng giá: cần 1–8 gói và tối đa 8 tùy chọn mua thêm.';
    for (const item of [...plans, ...addons]) {
      if (!item.name?.trim() || !item.id) return 'Bảng giá: mỗi gói và tùy chọn cần có tên.';
      if (!validPrice(item.price)) return `Bảng giá, "${item.name}": giá chỉ gồm chữ số (vd. 5000000 hoặc 5.000.000). Để trống = cần nhân viên báo giá, 0 = miễn phí.`;
    }
    if (new Set(plans.map(p => p.id)).size !== plans.length || new Set(addons.map(a => a.id)).size !== addons.length) return 'Bảng giá: mã gói hoặc tùy chọn bị trùng.';
  }
  const gallery = values?.gallery;
  if (gallery) {
    if (!Array.isArray(gallery.photos)) return 'Ảnh doanh nghiệp: danh sách ảnh không hợp lệ.';
    if (gallery.photos.length > PHOTO_MAX) return `Ảnh doanh nghiệp: tối đa ${PHOTO_MAX} ảnh.`;
    for (const [i, photo] of gallery.photos.entries()) {
      if (photo.image && (!IMAGE.test(photo.image) || photo.image.includes('..'))) return `Ảnh doanh nghiệp, ảnh ${i + 1}: hãy tải ảnh lên hoặc dùng đường dẫn /assets/….`;
      if (!PHOTO_FOCUS.includes(photo.focus)) return `Ảnh doanh nghiệp, ảnh ${i + 1}: vị trí giữ khi cắt không hợp lệ.`;
    }
  }
  return '';
}
