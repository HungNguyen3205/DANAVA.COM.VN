/**
 * DANAVA Solutions — Danh mục Dịch vụ & Loại hình Kinh doanh Hợp lệ cho Form Liên hệ
 */

export interface ValidContactService {
  id: string;
  label: string;
  slug: string;
  category: string;
}

export const VALID_CONTACT_SERVICES: ValidContactService[] = [
  {
    id: 'danava-studio',
    label: 'DANAVA Studio — Phần mềm quản lý Gym, Yoga, Pilates & Spa',
    slug: 'danava-studio',
    category: 'Sản phẩm số'
  },
  {
    id: 'thiet-ke-website',
    label: 'Thiết kế Website & Landing Page chuyển đổi cao',
    slug: 'thiet-ke-website',
    category: 'Không gian số'
  },
  {
    id: 'su-kien-truyen-thong',
    label: 'Tổ chức sự kiện, thi công không gian & truyền thông sự kiện',
    slug: 'su-kien-truyen-thong',
    category: 'Sự kiện & Truyền thông'
  },
  {
    id: 'media-production',
    label: 'Sản xuất Video ngắn, TVC & Hình ảnh thương hiệu',
    slug: 'media',
    category: 'Truyền thông'
  },
  {
    id: 'du-lich-su-kien',
    label: 'Tổ chức Du lịch trải nghiệm, Retreat & Sự kiện Wellness',
    slug: 'du-lich-su-kien',
    category: 'Du lịch & Sự kiện'
  },
  {
    id: 'tu-van-chuyen-doi-so',
    label: 'Tư vấn chiến lược & Chuyển đổi số toàn diện',
    slug: 'tu-van',
    category: 'Tư vấn'
  }
];

export const VALID_BUSINESS_TYPES: string[] = [
  'Phòng tập Gym & Fitness Center',
  'Trung tâm Yoga & Studio Pilates',
  'Wellness Spa & Thẩm mỹ trị liệu',
  'Khách sạn, Resort & Căn hộ dịch vụ',
  'Doanh nghiệp Thương mại & Dịch vụ',
  'Cá nhân / Đơn vị khởi nghiệp khác'
];

/**
 * Nhận diện và ánh xạ tham số URL sang dịch vụ hợp lệ trong danh sách
 * Hỗ trợ các biến thể query params: studio, danava-studio, website, marketing, travel, media...
 */
const byId = (id: string) => VALID_CONTACT_SERVICES.find(s => s.id === id)?.label || '';

export function resolveValidService(queryParam?: string | null): string {
  // Không có tham số → để khách tự chọn (không gán sẵn DANAVA Studio làm sai thống kê nhu cầu).
  if (!queryParam || !queryParam.trim()) {
    return '';
  }

  const needle = queryParam.trim().toLowerCase();

  // Khớp chính xác id hoặc slug
  const matched = VALID_CONTACT_SERVICES.find(
    s =>
      s.id.toLowerCase() === needle ||
      s.slug.toLowerCase() === needle ||
      needle.includes(s.id.toLowerCase()) ||
      needle.includes(s.slug.toLowerCase())
  );

  if (matched) {
    return matched.label;
  }

  // Khớp từ khóa phổ thông
  if (needle.includes('studio') || needle.includes('gym') || needle.includes('yoga') || needle.includes('phong-tap')) {
    return byId('danava-studio');
  }
  if (needle.includes('web') || needle.includes('landing')) {
    return byId('thiet-ke-website');
  }
  if (needle.includes('media') || needle.includes('video') || needle.includes('tvc') || needle.includes('anh')) {
    return byId('media-production');
  }
  if (needle.includes('event') || needle.includes('booth') || needle.includes('truyen-thong')) {
    return byId('su-kien-truyen-thong');
  }
  if (needle.includes('travel') || needle.includes('du-lich') || needle.includes('retreat') || needle.includes('su-kien')) {
    return byId('du-lich-su-kien');
  }
  if (needle.includes('tu-van') || needle.includes('chuyen-doi-so')) {
    return byId('tu-van-chuyen-doi-so');
  }

  // Giá trị lạ → để khách tự chọn
  return '';
}

/**
 * Kiểm tra định dạng số điện thoại liên hệ Việt Nam (9 - 12 chữ số)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^(0|\+84)[1-9][0-9]{7,9}$/.test(cleaned);
}

