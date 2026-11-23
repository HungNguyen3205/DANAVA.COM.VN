/**
 * Loại sản phẩm: quyết định các phần cần nhập trong hồ sơ và cách trang hiển thị.
 * Nhóm sản phẩm (SiteData.productGroups) chỉ để phân loại/lọc, không đổi trường nhập.
 *
 * ĐIỂM MỞ RỘNG — nghiệp vụ mới (đặt phòng, thanh toán, kho hàng…):
 *  1. Không nhét vào hồ sơ sản phẩm. Tạo module riêng: model + validation (lib/<module>.ts),
 *     bảng database qua MIGRATIONS (lib/database.ts), API có requirePermission (app/api/admin/<module>/),
 *     quyền mới trong lib/permissions.ts và mục menu trong components/adminNav.ts.
 *  2. Hồ sơ sản phẩm chỉ THAM CHIẾU tới module đó bằng ID ổn định (vd. thêm trường `bookingId`).
 *  3. Nếu cần một loại sản phẩm mới, thêm vào PRODUCT_TYPES (và ProductType trong lib/content.ts).
 */
import type { ProductType, Service } from './content.ts';

export type ProductSection = 'features' | 'audience' | 'problems' | 'items' | 'process' | 'faqs' | 'packages' | 'pricingText' | 'demo';

export const PRODUCT_TYPES: Record<ProductType, { label: string; desc: string; sections: ProductSection[]; required: { key: keyof Service; label: string }[] }> = {
  'phan-mem': {
    label: 'Phần mềm',
    desc: 'Sản phẩm dùng thử/đăng ký được: tính năng, đối tượng, gói & giá, liên kết demo.',
    sections: ['features', 'audience', 'problems', 'process', 'faqs', 'packages', 'pricingText', 'demo'],
    required: [{ key: 'title', label: 'Tên' }, { key: 'description', label: 'Mô tả ngắn' }, { key: 'heroLead', label: 'Giới thiệu' }, { key: 'features', label: 'Ít nhất một tính năng' }]
  },
  'dich-vu': {
    label: 'Dịch vụ',
    desc: 'Dịch vụ theo dự án: phạm vi công việc, quy trình, cách báo giá.',
    sections: ['items', 'audience', 'problems', 'process', 'faqs', 'packages', 'pricingText'],
    required: [{ key: 'title', label: 'Tên' }, { key: 'description', label: 'Mô tả ngắn' }, { key: 'heroLead', label: 'Giới thiệu' }, { key: 'items', label: 'Ít nhất một mục phạm vi công việc' }]
  },
  'trai-nghiem': {
    label: 'Sự kiện & trải nghiệm',
    desc: 'Sự kiện, tour, cộng đồng: hạng mục, quy trình tổ chức, cách báo giá.',
    sections: ['items', 'audience', 'process', 'faqs', 'packages', 'pricingText'],
    required: [{ key: 'title', label: 'Tên' }, { key: 'description', label: 'Mô tả ngắn' }, { key: 'heroLead', label: 'Giới thiệu' }]
  }
};

/** Loại của 6 sản phẩm gốc khi dữ liệu chưa ghi loại. */
const CORE_TYPES: Record<string, ProductType> = { studio: 'phan-mem', website: 'dich-vu', marketing: 'dich-vu', events: 'trai-nghiem', travel: 'trai-nghiem', community: 'trai-nghiem' };
export const typeOf = (s: Pick<Service, 'id' | 'type'>): ProductType => s.type || CORE_TYPES[s.id] || 'dich-vu';
export const isCoreProduct = (id: string) => id in CORE_TYPES;

/** Thiếu gì trước khi xuất bản (theo loại). */
export function missingForPublish(s: Service): string[] {
  const def = PRODUCT_TYPES[typeOf(s)];
  return def.required.filter(r => {
    const v = s[r.key];
    return Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim();
  }).map(r => r.label);
}

/** Giá hiển thị của một gói. */
export function packagePrice(price: string) {
  if (!price) return 'Liên hệ báo giá';
  if (price === '0') return 'Miễn phí';
  return Number(price).toLocaleString('vi-VN') + 'đ';
}
