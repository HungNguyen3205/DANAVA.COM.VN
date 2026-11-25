/**
 * Menu chính → "Dịch vụ" (mega menu kiểu danh mục bên trái + mục bên phải, components/Shell.tsx; điện thoại: MobileMenu.tsx).
 * Mỗi nhóm = một loại báo giá; mỗi mục: tên, nhãn nổi bật (badge), mô tả ngắn, đường dẫn.
 * Chữ hiển thị sửa được trong trình biên tập (khóa nav.svc.<nhóm>.<mục>.label|desc).
 */
export type ServiceMenuItem = { id: string; label: string; badge?: string; desc: string; href: string };
export type ServiceMenuGroup = { id: string; label: string; icon: 'landing' | 'event' | 'gym'; items: ServiceMenuItem[] };

export const SERVICE_MENU: ServiceMenuGroup[] = [
  {
    id: 'landing', label: 'Báo giá landing page', icon: 'landing',
    items: [
      { id: 'quote', label: 'Báo giá landing page', badge: 'Chat 3 phút', desc: 'Trả lời vài câu hỏi, nhận khoảng giá tham khảo ngay', href: '/bao-gia-web/' },
      { id: 'website', label: 'Thiết kế website & landing page', desc: 'Website, trang đích theo thương hiệu và mục tiêu bán hàng', href: '/giai-phap/thiet-ke-website/' },
      { id: 'portfolio', label: 'Mẫu website đã làm', desc: 'Website, landing page DANAVA đã triển khai cho khách hàng', href: '/du-an/' }
    ]
  },
  {
    id: 'event', label: 'Báo giá tổ chức sự kiện', icon: 'event',
    items: [
      { id: 'quote', label: 'Báo giá tổ chức sự kiện', badge: 'HOT', desc: 'Kể về sự kiện của bạn, nhận khoảng chi phí tham khảo', href: '/bao-gia-su-kien/' },
      { id: 'events', label: 'Tổ chức sự kiện', desc: 'Kịch bản, sân khấu, thiết bị, nhân sự và điều phối trọn gói', href: '/giai-phap/su-kien-truyen-thong/' },
      { id: 'travel', label: 'Du lịch trải nghiệm', desc: 'Team building, retreat và chuyến đi gắn kết đội ngũ', href: '/giai-phap/du-lich-su-kien/' }
    ]
  },
  {
    id: 'gym', label: 'Báo giá setup phòng gym', icon: 'gym',
    items: [
      { id: 'lab', label: 'Tự thiết kế phòng tập 3D', badge: '3D', desc: 'Nhập diện tích, kéo thả máy móc, xem tổng chi phí ngay', href: '/bao-gia-setup-phong-gym/' },
      { id: 'setup', label: 'Setup & vận hành phòng gym', badge: 'Mới', desc: 'Trọn gói từ mặt bằng, thiết bị đến hội viên đầu tiên', href: '/giai-phap/setup-van-hanh-phong-gym/' },
      { id: 'equipment', label: 'Thiết bị phòng gym', desc: 'Máy chạy bộ, giàn tạ, ghế tạ… kèm giá và kích thước', href: '/thiet-bi-gym/' },
      { id: 'studio', label: 'Phần mềm DANAVA Studio', desc: 'Quản lý hội viên, gói tập, lịch PT và check-in QR', href: '/giai-phap/danava-studio/' }
    ]
  }
];
