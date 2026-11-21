/*
 * Hệ sinh thái DANAVA — dữ liệu cho /he-sinh-thai/.
 * Chỉ ghi điều có căn cứ: nội dung giải pháp đã có trên website, sơ đồ hệ sinh thái do chủ sở hữu cung cấp,
 * và các sản phẩm đang chạy đã được kiểm tra trực tiếp ngày 19/11/2026 (public/assets/ecosystem/sources.json).
 * Không ghi số liệu thành viên, cam kết hiệu quả hay tốc độ chưa đo.
 * DANAVA không cung cấp Digital Marketing (19/11/2026) nên không có đơn vị/khối truyền thông số.
 */
export type EcosystemCategory = 'san-pham-so' | 'truyen-thong' | 'du-lich-su-kien' | 'cong-dong';

/** Vị trí trên hành trình khách hàng của doanh nghiệp dịch vụ. */
export type JourneyStage = 'thu-hut' | 'van-hanh' | 'gan-ket' | 'trai-nghiem';

export interface EcosystemUnit {
  id: string;
  name: string;
  shortName: string;
  category: EcosystemCategory;
  categoryName: string;
  categoryKicker: string;
  targetAudience: string;
  description: string;
  features: string[];
  officialLink: { label: string; href: string; isExternal?: boolean };
  badge: string;
  /** Ảnh đại diện (đường dẫn nội bộ) */
  image: string;
  visible: boolean;
  statusText?: string;
  /** Sản phẩm đang chạy (đã kiểm tra) */
  live?: { label: string; href: string }[];
  /** Ảnh chụp màn hình thật của sản phẩm (nếu có) */
  screenshot?: string;
  stage?: JourneyStage;
}

export const ECOSYSTEM_CATEGORIES: { id: 'all' | EcosystemCategory; label: string; shortDesc: string }[] = [
  { id: 'all', label: 'Tất cả hệ sinh thái', shortDesc: 'Ba khối năng lực: Sản phẩm số, Sự kiện & Du lịch và Cộng đồng.' },
  { id: 'san-pham-so', label: 'Sản phẩm số', shortDesc: 'Phần mềm và nền tảng do DANAVA xây dựng, vận hành.' },
  { id: 'du-lich-su-kien', label: 'Sự kiện & Du lịch', shortDesc: 'Sự kiện doanh nghiệp, đặt vé trực tuyến, tour trải nghiệm và retreat yoga.' },
  { id: 'cong-dong', label: 'Cộng đồng', shortDesc: 'Cộng đồng yoga và đồng hành cùng doanh nghiệp mới.' }
];

export const JOURNEY_STAGES: { id: JourneyStage; label: string; text: string }[] = [
  { id: 'thu-hut', label: 'Thu hút', text: 'Khách hàng biết đến và liên hệ' },
  { id: 'van-hanh', label: 'Vận hành', text: 'Phục vụ khách gọn, đúng, nhanh' },
  { id: 'gan-ket', label: 'Gắn kết', text: 'Hội viên quay lại và học tiếp' },
  { id: 'trai-nghiem', label: 'Trải nghiệm', text: 'Hành trình, sự kiện, cộng đồng' }
];

export const initialEcosystemUnits: EcosystemUnit[] = [
  /* ---------------- Sản phẩm số ---------------- */
  {
    id: 'studio', name: 'DANAVA Studio', shortName: 'Studio', category: 'san-pham-so', categoryName: 'Sản phẩm số',
    categoryKicker: 'Phần mềm quản lý', stage: 'van-hanh',
    targetAudience: 'Phòng Gym, Yoga, Pilates, bể bơi, Spa và trung tâm wellness',
    description: 'Phần mềm quản lý hội viên, gói tập, lịch lớp, check-in, bán hàng và báo cáo trên một hệ thống; mỗi cơ sở có app hội viên mang tên riêng.',
    features: ['Hội viên, gói tập và nhắc gia hạn', 'Lịch lớp, đặt chỗ, lịch hẹn PT', 'Check-in QR, bán hàng tại quầy, tủ đồ', 'App hội viên theo thương hiệu cơ sở'],
    officialLink: { label: 'Xem DANAVA Studio', href: '/giai-phap/danava-studio/' },
    badge: 'Sản phẩm chủ lực', image: '/assets/presentation/studio-dashboard.webp', screenshot: '/assets/presentation/studio-dashboard.webp',
    visible: true, statusText: 'Đang vận hành',
    live: [{ label: 'studio.danava.vn', href: 'https://studio.danava.vn' }, { label: 'Báo giá · hello.danava.vn', href: 'https://hello.danava.vn' }]
  },
  {
    id: 'platform', name: 'Nền tảng danava.vn', shortName: 'danava.vn', category: 'san-pham-so', categoryName: 'Sản phẩm số',
    categoryKicker: 'Nền tảng wellness', stage: 'gan-ket',
    targetAudience: 'Người tập tìm phòng tập, khóa học, tour; cơ sở wellness muốn có thêm khách',
    description: 'Nền tảng wellness kết nối người dùng với phòng tập, khóa học, tour và sản phẩm. Các cơ sở trên nền tảng vận hành bằng DANAVA Studio.',
    features: ['Tìm phòng tập, khóa học, tour wellness', 'Trang riêng cho từng cơ sở đối tác', 'Đồng bộ với DANAVA Studio'],
    officialLink: { label: 'Mở danava.vn', href: 'https://danava.vn/', isExternal: true },
    badge: 'Nền tảng', image: '/assets/portfolio/danava-vn.webp', screenshot: '/assets/portfolio/danava-vn.webp',
    visible: true, statusText: 'Đang vận hành',
    live: [{ label: 'danava.vn', href: 'https://danava.vn' }]
  },
  {
    id: 'elearning', name: 'DANAVA E-learning', shortName: 'E-learning', category: 'san-pham-so', categoryName: 'Sản phẩm số',
    categoryKicker: 'Đào tạo trực tuyến', stage: 'gan-ket',
    targetAudience: 'Trung tâm đào tạo, câu lạc bộ yoga, huấn luyện viên muốn bán khóa học online',
    description: 'Nền tảng khóa học online: video bài giảng, combo lộ trình, bán khóa học và cấp chứng chỉ. Đang chạy thực tế với Yoga Club Vietnam tại edu-yoga.danava.vn.',
    features: ['Soạn khóa học, video bài giảng', 'Bán khóa học, combo lộ trình', 'Chứng chỉ hoàn thành có mã QR'],
    officialLink: { label: 'Xem edu-yoga.danava.vn', href: 'https://edu-yoga.danava.vn/', isExternal: true },
    badge: 'Đào tạo', image: '/assets/ecosystem/edu-yoga-khoa-hoc.webp', screenshot: '/assets/ecosystem/edu-yoga-khoa-hoc.webp',
    visible: true, statusText: 'Đang vận hành',
    live: [{ label: 'edu-yoga.danava.vn', href: 'https://edu-yoga.danava.vn' }]
  },
  {
    id: 'website', name: 'Website & Landing Page', shortName: 'Website', category: 'san-pham-so', categoryName: 'Sản phẩm số',
    categoryKicker: 'Thiết kế website', stage: 'thu-hut',
    targetAudience: 'Doanh nghiệp dịch vụ, dự án, chiến dịch cần website thể hiện đúng bản sắc',
    description: 'Website và landing page thiết kế riêng theo thương hiệu, ưu tiên điện thoại, có trang quản trị và biểu mẫu nhận yêu cầu tư vấn.',
    features: ['Thiết kế riêng, không dùng theme dựng sẵn', 'Ưu tiên điện thoại', 'Nền tảng SEO kỹ thuật, tự quản trị nội dung'],
    officialLink: { label: 'Xem portfolio website', href: '/giai-phap/thiet-ke-website/' },
    badge: 'Giải pháp số', image: '/assets/portfolio/vinhomes/desktop-hero.webp', screenshot: '/assets/portfolio/vinhomes/desktop-hero.webp',
    visible: true, statusText: 'Nhận dự án'
  },
  {
    id: 'pms', name: 'DANAVA PMS', shortName: 'PMS', category: 'san-pham-so', categoryName: 'Sản phẩm số',
    categoryKicker: 'Quản lý lưu trú', stage: 'van-hanh',
    targetAudience: 'Khách sạn, homestay, căn hộ dịch vụ',
    description: 'Quản lý khách sạn và bất động sản cho thuê: phòng, đặt và nhận/trả phòng, khách hàng, thu chi, báo cáo.',
    features: ['Quản lý phòng', 'Đặt & nhận/trả phòng', 'Khách hàng, thu chi, báo cáo'],
    officialLink: { label: 'Trao đổi về DANAVA PMS', href: '/lien-he/?service=tu-van-chuyen-doi-so' },
    badge: 'Phần mềm quản lý', image: '/assets/danava-mark.png',
    visible: true, statusText: 'Tư vấn theo yêu cầu'
  },

  {
    id: 'media', name: 'DANAVA Media · Tổ chức sự kiện', shortName: 'Sự kiện', category: 'du-lich-su-kien', categoryName: 'Sự kiện & Du lịch',
    categoryKicker: 'Sự kiện & sản xuất', stage: 'thu-hut',
    targetAudience: 'Doanh nghiệp, thương hiệu bán lẻ cần sự kiện và không gian thương hiệu',
    description: 'Ý tưởng, thiết kế thi công booth, backdrop, đạo cụ, sân khấu; thiết bị, nhân sự biểu diễn và điều phối sự kiện.',
    features: ['Thi công booth & không gian', 'Âm thanh, ánh sáng, LED', 'MC, biểu diễn và điều phối'],
    officialLink: { label: 'Xem Tổ chức sự kiện', href: '/giai-phap/su-kien-truyen-thong/' },
    badge: 'Sự kiện', image: '/assets/profile/set-stage.webp', screenshot: '/assets/profile/set-stage.webp',
    visible: true, statusText: 'Nhận dự án'
  },

  /* ---------------- Du lịch & Sự kiện ---------------- */
  {
    id: 'go', name: 'DANAVA GO', shortName: 'GO', category: 'du-lich-su-kien', categoryName: 'Sự kiện & Du lịch',
    categoryKicker: 'Đặt vé trực tuyến', stage: 'trai-nghiem',
    targetAudience: 'Hành khách đi xe khách; nhà xe muốn bán vé trực tuyến',
    description: 'Nền tảng đặt vé xe khách đa nhà xe: tìm chuyến, chọn ghế trên sơ đồ, vé điện tử và cổng quản trị cho từng nhà xe.',
    features: ['Tìm chuyến, chọn ghế cabin/limousine', 'Vé điện tử', 'Cổng quản trị cho nhà xe'],
    officialLink: { label: 'Mở danavago.com', href: 'https://danavago.com/', isExternal: true },
    badge: 'Nền tảng đặt vé', image: '/assets/portfolio/danava-go.webp', screenshot: '/assets/portfolio/danava-go.webp',
    visible: true, statusText: 'Đang vận hành',
    live: [{ label: 'danavago.com', href: 'https://danavago.com' }]
  },
  {
    id: 'events', name: 'Du lịch trải nghiệm & Retreat', shortName: 'Du lịch', category: 'du-lich-su-kien', categoryName: 'Sự kiện & Du lịch',
    categoryKicker: 'Tour & retreat', stage: 'trai-nghiem',
    targetAudience: 'Trung tâm yoga, câu lạc bộ, nhóm khách riêng',
    description: 'Tour yoga, retreat kết hợp tập luyện và nghỉ dưỡng; lịch trình, phòng, xe, vé tham quan do một đầu mối sắp xếp.',
    features: ['Tour yoga & retreat', 'Thiết kế theo nhóm', 'Đặt dịch vụ trọn gói'],
    officialLink: { label: 'Xem Du lịch trải nghiệm', href: '/giai-phap/du-lich-su-kien/' },
    badge: 'Trải nghiệm', image: '/assets/legacy/community.webp', screenshot: '/assets/legacy/community.webp',
    visible: true, statusText: 'Nhận yêu cầu'
  },

  /* ---------------- Cộng đồng ---------------- */
  {
    id: 'yoga-club', name: 'Yoga Club Vietnam', shortName: 'Yoga Club', category: 'cong-dong', categoryName: 'Cộng đồng',
    categoryKicker: 'Cộng đồng yoga', stage: 'trai-nghiem',
    targetAudience: 'Người tập yoga, huấn luyện viên, câu lạc bộ yoga',
    description: 'Cộng đồng yoga tại Đà Nẵng. Đồng hành tổ chức chuỗi sự kiện Cổng Năng Lượng (05/05/2024) và chuỗi Yoga Workshop; có app hội viên và nền tảng học yoga online riêng.',
    features: ['App hội viên ycv.danava.vn', 'Học yoga online edu-yoga.danava.vn', 'Workshop và sự kiện cộng đồng'],
    officialLink: { label: 'Xem Cộng đồng & Yoga Club', href: '/giai-phap/cong-dong/' },
    badge: 'Kênh đã duyệt · Cộng đồng', image: '/assets/legacy/community.webp', screenshot: '/assets/legacy/event-group.webp',
    visible: true, statusText: 'Hoạt động',
    live: [{ label: 'App hội viên · ycv.danava.vn', href: 'https://ycv.danava.vn' }, { label: 'edu-yoga.danava.vn', href: 'https://edu-yoga.danava.vn' }]
  },
  {
    id: 'dong-hanh', name: 'Đồng hành doanh nghiệp', shortName: 'Đồng hành', category: 'cong-dong', categoryName: 'Cộng đồng',
    categoryKicker: 'Hỗ trợ khởi đầu', stage: 'trai-nghiem',
    targetAudience: 'Doanh nghiệp, cơ sở wellness mới thành lập',
    description: 'Tư vấn thành lập doanh nghiệp theo thỏa thuận và kết nối nguồn lực trong hệ sinh thái DANAVA phù hợp với nhu cầu.',
    features: ['Tư vấn thành lập theo thỏa thuận', 'Kết nối nguồn lực trong hệ sinh thái'],
    officialLink: { label: 'Tìm hiểu chương trình', href: '/giai-phap/cong-dong/#dong-hanh' },
    badge: 'Đồng hành', image: '/assets/legacy/event-session.webp',
    visible: true, statusText: 'Theo thỏa thuận'
  }
];

/** Sản phẩm đang chạy trên hạ tầng DANAVA (đã kiểm tra trực tiếp ngày 19/11/2026). */
export const LIVE_PRODUCTS: { group: string; items: { name: string; host: string; note: string }[] }[] = [
  { group: 'Nền tảng & phần mềm', items: [
    { name: 'danava.vn', host: 'danava.vn', note: 'Nền tảng wellness' },
    { name: 'DANAVA Studio', host: 'studio.danava.vn', note: 'Phần mềm quản lý' },
    { name: 'Hello DANAVA', host: 'hello.danava.vn', note: 'Báo giá DANAVA Studio' },
    { name: 'Yoga Club Online', host: 'edu-yoga.danava.vn', note: 'Học yoga online' },
    { name: 'DANAVA GO', host: 'danavago.com', note: 'Đặt vé xe khách' }
  ] },
  { group: 'App hội viên mang tên cơ sở', items: [
    { name: 'Yoga Club Vietnam', host: 'ycv.danava.vn', note: 'App hội viên' },
    { name: 'HARIVER GYM', host: 'hariver.danava.vn', note: 'App hội viên' },
    { name: 'Huế Pilates & Yoga', host: 'hue.danava.vn', note: 'App hội viên' }
  ] }
];

/** Lấy các đơn vị đang hiển thị, lọc theo khối năng lực. */
export function getEcosystemUnits(category: 'all' | EcosystemCategory = 'all'): EcosystemUnit[] {
  const publicUnits = initialEcosystemUnits.filter(unit => unit.visible);
  if (category === 'all') return publicUnits;
  return publicUnits.filter(unit => unit.category === category);
}

/** Thống kê số đơn vị theo khối năng lực. */
export function getEcosystemCategoryCounts(): Record<'all' | EcosystemCategory, number> {
  const publicUnits = initialEcosystemUnits.filter(unit => unit.visible);
  const counts: Record<'all' | EcosystemCategory, number> = { all: publicUnits.length, 'san-pham-so': 0, 'truyen-thong': 0, 'du-lich-su-kien': 0, 'cong-dong': 0 };
  publicUnits.forEach(unit => { if (counts[unit.category] !== undefined) counts[unit.category] += 1; });
  return counts;
}
