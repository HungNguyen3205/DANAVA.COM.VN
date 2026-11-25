/**
 * Cấu hình menu quản trị (không phải component) — dùng được ở cả server (generateStaticParams) và trình duyệt.
 */
import { can, type Permission, type Role } from '@/lib/permissions';

export type AdminTab = { id: string; label: string; perm?: Permission };
export type AdminItem = { slug: string; label: string; desc: string; perm?: Permission; tabs?: AdminTab[] };

/**
 * Menu quản trị: 8 nhóm, tối đa hai tầng (nhóm → mục). Chi tiết sâu hơn là tab trong màn hình.
 * Chỉ đưa vào đây chức năng đã chạy thật. `perm` = quyền cần có để thấy mục (API vẫn kiểm tra lại).
 */
export const adminNav: { group: string; items: AdminItem[] }[] = [
  {
    group: 'Tổng quan',
    items: [{ slug: 'tong-quan', label: 'Tổng quan', desc: 'Tình hình website, việc cần xử lý và lối tắt.' }],
  },
  {
    group: 'Chỉnh sửa website',
    items: [
      { slug: 'chinh-sua', label: 'Chỉnh sửa website', perm: 'content.read', desc: 'Mở website trong trình biên tập: chọn trang, nhấn giữ nội dung để sửa ngay tại chỗ, lưu nháp và xuất bản.' },
    ],
  },
  {
    group: 'Giải pháp',
    items: [
      { slug: 'san-pham', label: 'Danh sách', perm: 'content.read', desc: 'Mỗi sản phẩm, dịch vụ có một hồ sơ. Trang chủ, hệ sinh thái, landing page và ANNA dùng lại dữ liệu đã xuất bản từ hồ sơ này.' },
      { slug: 'nhom-loai', label: 'Nhóm & loại', perm: 'content.read', desc: 'Loại quyết định các trường cần nhập; nhóm dùng để phân loại và lọc.' },
    ],
  },
  {
    group: 'Nội dung website',
    items: [
      { slug: 'bai-viet', label: 'Bài viết', perm: 'content.read', desc: 'Bài viết mục Blogs: nội dung, ảnh, danh mục, thẻ, tác giả, sản phẩm liên quan, SEO và trạng thái.',
        tabs: [{ id: 'bai-viet', label: 'Bài viết' }, { id: 'danh-muc', label: 'Danh mục' }] },
      { slug: 'du-an', label: 'Dự án & Portfolio', perm: 'content.read', desc: 'Hồ sơ dự án đã triển khai, website và landing page đã làm cho khách hàng.',
        tabs: [{ id: 'du-an', label: 'Dự án' }, { id: 'portfolio', label: 'Portfolio' }] },
      { slug: 'thuong-hieu', label: 'Hồ sơ thương hiệu', perm: 'content.read', desc: 'Đội ngũ, hồ sơ nhân sự và số liệu công bố. Thông tin công ty và kênh liên hệ ở Hệ thống → Cài đặt website.',
        tabs: [
          { id: 'doi-ngu', label: 'Đội ngũ' },
          { id: 'ho-so-nhan-su', label: 'Hồ sơ nhân sự' }, { id: 'so-lieu', label: 'Số liệu công bố' },
        ] },
    ],
  },
  {
    group: 'Khách hàng',
    items: [
      { slug: 'khach-hang', label: 'Yêu cầu tư vấn', perm: 'leads.read', desc: 'Yêu cầu gửi từ website: phân công người phụ trách và theo dõi tiến độ.' },
      { slug: 'danh-ba', label: 'Danh bạ', perm: 'leads.read', desc: 'Mỗi khách hàng một dòng, gộp các lần gửi yêu cầu theo số điện thoại hoặc email.' },
      { slug: 'bieu-mau', label: 'Biểu mẫu', perm: 'leads.read', desc: 'Các biểu mẫu trên website và số yêu cầu mỗi biểu mẫu nhận được.' },
      { slug: 'doi-tac', label: 'Đối tác', perm: 'content.read', desc: 'Khách hàng & đối tác đã hợp tác. Mục đã xác minh hiện ở khối logo trang chủ và được cộng vào con số “thương hiệu đã đồng hành”.' },
      { slug: 'nhan-xet', label: 'Nhận xét khách hàng', perm: 'content.read', desc: 'Lời nhận xét thật của khách hàng đã đồng ý công bố. Hiện trên trang chủ và trang dự án liên quan.' },
    ],
  },
  {
    group: 'Tài nguyên',
    items: [{ slug: 'thu-vien', label: 'Thư viện ảnh', perm: 'media.read', desc: 'Mọi ảnh trên website, chia nhóm theo khu vực. Ảnh tải lên tự xóa EXIF, thu nhỏ và nén WebP.' }],
  },
  {
    group: 'Báo cáo',
    items: [
      { slug: 'thong-ke', label: 'Truy cập', perm: 'reports.read', desc: 'Lượt truy cập thực tế từ trình duyệt đồng ý đo lường. Không thu thập IP, không tính lượt của quản trị viên.' },
      { slug: 'nguon-khach', label: 'Nguồn khách', perm: 'leads.read', desc: 'Khách hàng đến từ biểu mẫu, trang và dịch vụ nào.' },
      { slug: 'hieu-qua', label: 'Hiệu quả nội dung', perm: 'reports.read', desc: 'Lượt xem và thời gian đọc của bài viết, trang sản phẩm và landing page.' },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { slug: 'cai-dat', label: 'Cài đặt website', perm: 'content.read', desc: 'Thông tin công ty, liên hệ, mạng xã hội, mã theo dõi và SEO: áp dụng cho toàn bộ website.',
        tabs: [
          { id: 'nhan-dien', label: 'Nhận diện' }, { id: 'lien-he', label: 'Liên hệ', perm: 'system.manage' }, { id: 'mang-xa-hoi', label: 'Mạng xã hội' },
          { id: 'theo-doi', label: 'Theo dõi', perm: 'system.manage' }, { id: 'seo', label: 'SEO từng trang' }, { id: 'chuyen-huong', label: 'Chuyển hướng' },
          { id: 'kiem-tra', label: 'Kiểm tra SEO' }, { id: 'tich-hop', label: 'Tích hợp', perm: 'integrations.read' },
        ] },
      { slug: 'tai-khoan', label: 'Tài khoản & quyền', perm: 'users.manage', desc: 'Tài khoản đăng nhập admin và vai trò. Tách biệt với hồ sơ nhân sự hiển thị trên website.' },
      { slug: 'nhat-ky', label: 'Nhật ký & sao lưu', perm: 'content.read', desc: 'Lịch sử xuất bản, khôi phục phiên bản, nhật ký thao tác và sao lưu dữ liệu.',
        tabs: [{ id: 'phien-ban', label: 'Phiên bản' }, { id: 'nhat-ky', label: 'Nhật ký thao tác', perm: 'system.manage' }, { id: 'sao-luu', label: 'Sao lưu & nhập', perm: 'system.manage' }] },
    ],
  },
];

/** Đường dẫn admin cũ → vị trí mới (giữ bookmark và liên kết cũ). */
export const LEGACY_SECTIONS: Record<string, string> = {
  'trang-chu': 'trang/?page=trang-chu',
  'trinh-chieu': 'trang/?page=trang-chu&tab=trinh-chieu',
  'anh-doanh-nghiep': 'trang/?page=trang-chu&tab=anh',
  'chu-tren-trang': 'trang/',
  've-danava': 'trang/?page=gioi-thieu&tab=noi-dung',
  'he-sinh-thai': 'trang/?page=he-sinh-thai&tab=noi-dung',
  'tuyen-dung': 'trang/?page=tuyen-dung',
  'chinh-sach': 'trang/?page=chinh-sach-rieng-tu',
  'menu-giai-phap': 'menu/',
  'anna': 'giao-dien/?tab=anna',
  'giai-phap': 'san-pham/',
  'bang-gia': 'san-pham/?id=studio&tab=goi-gia',
  'chu-de': 'bai-viet/?tab=danh-muc',
  'trung-bay': 'du-an/?tab=portfolio',
  'bang-chung': 'doi-tac/',
  'nhan-su': 'thuong-hieu/?tab=doi-ngu',
  'ho-so-nhan-su': 'thuong-hieu/?tab=ho-so-nhan-su',
  'cong-ty': 'cai-dat/?tab=nhan-dien',
  'kenh-lien-he': 'cai-dat/?tab=mang-xa-hoi',
  'seo': 'cai-dat/?tab=seo',
  'tich-hop': 'cai-dat/?tab=tich-hop',
  'so-lieu': 'thuong-hieu/?tab=so-lieu',
};

export const allAdminItems = adminNav.flatMap(g => g.items.map(i => ({ ...i, group: g.group })));

export function sectionInfo(slug: string) {
  const target = LEGACY_SECTIONS[slug]?.split('/')[0] || slug;
  return allAdminItems.find(i => i.slug === target) || allAdminItems[0];
}

/**
 * Mục/tab đang xây dựng: ẩn khỏi menu cho tới khi chạy thật (không hiện nút giả).
 * Tab ghi dạng "mục:tab".
 */
const PENDING = new Set<string>([]);

export const isPending = (slug: string, tab?: string) => PENDING.has(tab ? `${slug}:${tab}` : slug);

/** Tab người dùng được thấy trong một mục. */
export function visibleTabs(item: AdminItem, role: Role | null) {
  return (item.tabs || []).filter(t => !isPending(item.slug, t.id) && (!t.perm || can(role, t.perm)));
}

/** Mục người dùng được thấy theo quyền. */
export function visibleNav(role: Role | null) {
  return adminNav
    .map(g => ({ ...g, items: g.items.filter(i => !isPending(i.slug) && (!i.perm || can(role, i.perm))) }))
    .filter(g => g.items.length > 0);
}

