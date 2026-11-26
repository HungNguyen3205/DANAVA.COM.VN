/**
 * Kho mẫu website / landing page (trang /mau-website/, demo chạy thật ở /demo/<slug>/ — components/demo/*).
 * Mỗi mẫu một phong cách nghệ thuật riêng (màu, cặp chữ, bố cục, chuyển động), nội dung minh hoạ theo ngành.
 * thumb: ảnh chụp toàn trang (public/assets/mau/<slug>.webp — scripts/mau-thumbs.mjs), thẻ tự cuộn khi rê chuột.
 * live: dự án thật đã bàn giao (mở trang của khách, không có demo nội bộ).
 */
export type WebTemplate = {
  slug: string;
  name: string;
  brand: string;
  industry: string;
  industryId: 'gym' | 'spa' | 'bds' | 'event' | 'yoga' | 'tech';
  style: string;
  desc: string;
  sections: string[];
  palette: string[];
  fonts: string;
  fit: string;
  badge?: string;
  live?: string;
  thumb: string;
};

export const WEB_TEMPLATES: WebTemplate[] = [
  {
    slug: 'son-tra-residences', name: 'Mẫu bất động sản nghỉ dưỡng', brand: 'Sơn Trà Residences', industry: 'Bất động sản', industryId: 'bds',
    style: 'Rêu & vàng ánh kim', badge: 'Signature',
    desc: 'Màn mở đầu điện ảnh với tên dự án viết tay, dải số liệu chạy chậm, câu chuyện “một ngày ở Sơn Trà”, mặt bằng ba phân khu, chính sách bán hàng và form giữ chỗ phong thư.',
    sections: ['Màn mở đầu điện ảnh', 'Số liệu dự án', 'Câu chuyện một ngày', 'Ba phân khu', 'Tiện ích', 'Chính sách', 'Form giữ chỗ'],
    palette: ['#0f2a24', '#163d34', '#c9a45c', '#f3ead7'], fonts: 'Playfair Display · Great Vibes',
    fit: 'Dự án nghỉ dưỡng, căn hộ cao cấp, khách sạn boutique', thumb: '/assets/mau/son-tra-residences.webp'
  },
  {
    slug: 'ember-gym', name: 'Mẫu phòng gym & fitness', brand: 'Ember Athletic Club', industry: 'Gym & Fitness', industryId: 'gym',
    style: 'Than hồng', badge: 'Mới',
    desc: 'Nền than tối, chữ khổng lồ đổ bóng cam, dải chữ chạy, lịch lớp theo giờ, ba gói tập dạng vé, huấn luyện viên và form đăng ký tập thử 7 ngày.',
    sections: ['Màn mở đầu chữ khổng lồ', 'Dải chữ chạy', 'Bốn khu tập', 'Lịch lớp hôm nay', 'Gói tập dạng vé', 'Huấn luyện viên', 'Đăng ký tập thử'],
    palette: ['#0e0e10', '#1b1b1f', '#ff5a1f', '#f5f1ea'], fonts: 'Anton · Be Vietnam Pro',
    fit: 'Phòng gym, CrossFit, HYROX, boxing, câu lạc bộ thể thao', thumb: '/assets/mau/ember-gym.webp'
  },
  {
    slug: 'lotus-spa', name: 'Mẫu spa & chăm sóc sắc đẹp', brand: 'Hoa Sen Spa', industry: 'Spa & Làm đẹp', industryId: 'spa',
    style: 'Sen ngà',
    desc: 'Khung vòm mềm, chữ serif nghiêng, cánh sen vẽ tay, liệu trình như thực đơn trà, nghi thức bốn bước, cảm nhận khách và đặt lịch theo khung giờ.',
    sections: ['Màn mở đầu khung vòm', 'Triết lý', 'Thực đơn liệu trình', 'Nghi thức bốn bước', 'Cảm nhận khách', 'Đặt lịch'],
    palette: ['#f6efe6', '#ead9c6', '#b5643c', '#3b2a22'], fonts: 'Cormorant Garamond · Great Vibes',
    fit: 'Spa, thẩm mỹ, nail, wellness, retreat', thumb: '/assets/mau/lotus-spa.webp'
  },
  {
    slug: 'aurora-gala', name: 'Mẫu sự kiện & gala', brand: 'Aurora Gala Night', industry: 'Sự kiện', industryId: 'event',
    style: 'Cực quang',
    desc: 'Nền đen ánh cực quang, đồng hồ đếm ngược, lịch trình đêm gala theo dòng thời gian, khách mời, hình ảnh sự kiện thật do DANAVA dàn dựng và form nhận thư mời.',
    sections: ['Màn mở đầu cực quang', 'Đếm ngược', 'Lịch trình đêm', 'Khách mời', 'Thư viện ảnh', 'Hạng vé', 'Nhận thư mời'],
    palette: ['#07060d', '#1a1033', '#8b5cf6', '#22d3ee'], fonts: 'Bricolage Grotesque · Playfair Display',
    fit: 'Gala, year end party, ra mắt sản phẩm, hội nghị khách hàng', thumb: '/assets/mau/aurora-gala.webp'
  },
  {
    slug: 'may-yoga', name: 'Mẫu yoga & pilates', brand: 'Mây Yoga Studio', industry: 'Yoga & Pilates', industryId: 'yoga',
    style: 'Mây sớm',
    desc: 'Bảng màu cát và lá xô thơm, hình khối hữu cơ “thở” chậm, lớp học theo cấp độ, giáo viên, gói thẻ tập và lời mời buổi học đầu miễn phí.',
    sections: ['Màn mở đầu nhịp thở', 'Ba giá trị', 'Lớp theo cấp độ', 'Giáo viên', 'Thẻ tập', 'Câu hỏi thường gặp', 'Buổi học đầu'],
    palette: ['#efe6d8', '#dfe5d6', '#7d8f74', '#2f3a2c'], fonts: 'Fraunces · Be Vietnam Pro',
    fit: 'Yoga, pilates, thiền, studio vận động nhẹ', thumb: '/assets/mau/may-yoga.webp'
  },
  {
    slug: 'studio-saas', name: 'Mẫu phần mềm SaaS', brand: 'DANAVA Studio', industry: 'Công nghệ', industryId: 'tech',
    style: 'Lưới chàm',
    desc: 'Giao diện sản phẩm thật nghiêng 3D trên lưới chàm, dải logo, tính năng dạng bento, so sánh trước – sau, bảng giá theo tháng/năm và câu hỏi thường gặp.',
    sections: ['Màn mở đầu sản phẩm 3D', 'Số liệu', 'Tính năng bento', 'Trước & sau', 'Bảng giá', 'Câu hỏi', 'Dùng thử'],
    palette: ['#ffffff', '#eef0ff', '#4338ca', '#0f172a'], fonts: 'Bricolage Grotesque · Be Vietnam Pro',
    fit: 'Phần mềm, ứng dụng, startup, dịch vụ số', thumb: '/assets/mau/studio-saas.webp'
  },
  {
    slug: 'vinhomes-hai-van-bay', name: 'Landing page dự án Vinhomes Hải Vân Bay', brand: 'MICC Group & NEXME', industry: 'Bất động sản', industryId: 'bds',
    style: 'Dự án thật đã bàn giao', badge: 'Dự án thật',
    desc: 'Landing page DANAVA thiết kế cho đại lý phân phối dự án Vinhomes Hải Vân Bay: chữ thư pháp, ảnh tràn viền, quỹ căn ba phân khu và popup ưu đãi cuối năm.',
    sections: ['Màn mở đầu thư pháp', 'Vị trí', 'Một ngày ở Hải Vân', 'Quỹ căn', 'Thư viện', 'Đăng ký tư vấn'],
    palette: ['#0d2b26', '#1f4a3f', '#c8a25a', '#f4ecdc'], fonts: 'Playfair Display · chữ viết tay',
    fit: 'Dự án bất động sản, đại lý phân phối', live: 'https://landingpage-micc.vercel.app/', thumb: '/assets/portfolio/vinhomes/desktop-hero.webp'
  }
];

export const TEMPLATE_INDUSTRIES = [
  { id: 'bds', label: 'Bất động sản' }, { id: 'gym', label: 'Gym & Fitness' }, { id: 'spa', label: 'Spa & Làm đẹp' },
  { id: 'event', label: 'Sự kiện' }, { id: 'yoga', label: 'Yoga & Pilates' }, { id: 'tech', label: 'Công nghệ' }
] as const;

/** Dự án thật: trang case study trên website (thẻ "Xem dự án") */
export const CASE_HREF: Record<string, string> = { 'vinhomes-hai-van-bay': '/du-an/vinhomes-hai-van-bay-website/' };

export const templateBySlug = (slug: string) => WEB_TEMPLATES.find(t => t.slug === slug);
/** Mẫu có demo nội bộ (/demo/<slug>/) */
export const demoTemplates = () => WEB_TEMPLATES.filter(t => !t.live);
