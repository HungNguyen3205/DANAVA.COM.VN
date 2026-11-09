export type EcosystemCategory = 'san-pham-so' | 'truyen-thong' | 'du-lich-su-kien' | 'cong-dong';

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
  officialLink: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  badge: string;
  image: string;
  visible: boolean;
  statusText?: string;
}

export const ECOSYSTEM_CATEGORIES: { id: 'all' | EcosystemCategory; label: string; shortDesc: string }[] = [
  { id: 'all', label: 'Tất cả hệ sinh thái', shortDesc: 'Toàn bộ 4 khối năng lực: Sản phẩm số, Truyền thông, Du lịch & Sự kiện, và Cộng đồng' },
  { id: 'san-pham-so', label: 'Sản phẩm số', shortDesc: 'Phần mềm quản lý chuyên sâu Studio, PMS, E-learning và nền tảng website' },
  { id: 'truyen-thong', label: 'Truyền thông', shortDesc: 'Tiếp thị số theo KPI, sản xuất video, ấn phẩm và quản trị Fanpage/Zalo OA' },
  { id: 'du-lich-su-kien', label: 'Du lịch & Sự kiện', shortDesc: 'Tour trải nghiệm yoga retreat, hội thảo doanh nghiệp và team building' },
  { id: 'cong-dong', label: 'Cộng đồng', shortDesc: 'Mạng lưới Yoga Club Vietnam, chuỗi sự kiện Cổng Năng Lượng và hỗ trợ doanh nghiệp' }
];

export const initialEcosystemUnits: EcosystemUnit[] = [
  // 1. NHÓM SẢN PHẨM SỐ
  {
    id: 'studio',
    name: 'DANAVA Studio',
    shortName: 'Studio Management',
    category: 'san-pham-so',
    categoryName: 'Sản phẩm số',
    categoryKicker: 'NỀN TẢNG QUẢN TRỊ THỂ THAO & WELLNESS',
    targetAudience: 'Chủ cơ sở, ban quản trị chuỗi phòng Gym, Yoga, Pilates, Bể bơi, Spa & Fitness Center',
    description: 'Nền tảng phần mềm quản lý khép kín tại cơ sở: kiểm soát hội viên, gói tập, lịch ca học, tự động hóa check-in bằng mã QR và tích hợp ứng dụng hội viên di động mang thương hiệu riêng.',
    features: [
      'Quản lý hội viên, hợp đồng và tự động cảnh báo hạn thẻ',
      'Xếp lịch lớp, quản lý sĩ số và danh sách chờ (Waitlist) thông minh',
      'QR Check-in cửa từ không chạm, vận hành ổn định ngoại tuyến',
      'App hội viên iOS & Android mang tên và thương hiệu riêng của cơ sở'
    ],
    officialLink: {
      label: 'Khám phá sản phẩm DANAVA Studio',
      href: '/giai-phap/danava-studio/'
    },
    badge: 'Sản phẩm cốt lõi',
    image: '/assets/presentation/studio-dashboard.webp',
    visible: true,
    statusText: 'Đang vận hành thực tế'
  },
  {
    id: 'website',
    name: 'Website & Landing Page DANAVA',
    shortName: 'Web & Landing Page',
    category: 'san-pham-so',
    categoryName: 'Sản phẩm số',
    categoryKicker: 'NHẬN DIỆN THƯƠNG HIỆU SỐ CHUẨN SEO',
    targetAudience: 'Doanh nghiệp dịch vụ, chuỗi phòng tập, cơ sở đào tạo cần nâng tầm hình ảnh trực tuyến',
    description: 'Thiết kế website doanh nghiệp và landing page chiến dịch tối ưu tốc độ tải trang, trải nghiệm mobile-first, giao diện độc bản và tích hợp luồng thu thập khách hàng tiềm năng.',
    features: [
      'Giao diện thích ứng điện thoại, thời gian tải trang dưới 1 giây',
      'Cấu trúc nội dung chuẩn SEO, tối ưu khả năng xuất hiện trên Google',
      'Biểu mẫu nhận tư vấn thông minh, bảo vệ dữ liệu chống spam',
      'Đồng bộ dữ liệu khách hàng trực tiếp với hệ thống quản trị'
    ],
    officialLink: {
      label: 'Xem giải pháp Thiết kế Website',
      href: '/giai-phap/thiet-ke-website/'
    },
    badge: 'Giải pháp số',
    image: '/assets/legacy/website.webp',
    visible: true,
    statusText: 'Sẵn sàng triển khai'
  },
  {
    id: 'pms',
    name: 'DANAVA PMS',
    shortName: 'PMS Quản lý lưu trú',
    category: 'san-pham-so',
    categoryName: 'Sản phẩm số',
    categoryKicker: 'QUẢN LÝ KHÁCH SẠN & CHO THUÊ',
    targetAudience: 'Chủ khách sạn boutique, chuỗi homestay, căn hộ dịch vụ và biệt thự nghỉ dưỡng',
    description: 'Phần mềm quản lý buồng phòng tinh gọn: theo dõi sơ đồ phòng trực quan, điều phối đặt/trả phòng nhanh, quản lý thu chi hóa đơn và báo cáo công suất phòng minh bạch.',
    features: [
      'Sơ đồ phòng cập nhật trạng thái dọn phòng thời gian thực',
      'Quy trình check-in / check-out nhanh chóng cho khách lưu trú',
      'Báo cáo doanh thu, công suất phòng và dòng tiền hàng ngày',
      'Phân quyền nhân viên lễ tân, buồng phòng và quản lý rõ ràng'
    ],
    officialLink: {
      label: 'Trao đổi giải pháp DANAVA PMS',
      href: '/lien-he/?service=DANAVA+PMS'
    },
    badge: 'Phần mềm quản trị',
    image: '/assets/legacy/travel.webp',
    visible: true,
    statusText: 'Đang triển khai theo yêu cầu'
  },
  {
    id: 'elearning',
    name: 'DANAVA E-Learning',
    shortName: 'Đào tạo trực tuyến',
    category: 'san-pham-so',
    categoryName: 'Sản phẩm số',
    categoryKicker: 'NỀN TẢNG HỌC TẬP & KHOÁ HỌC SỐ',
    targetAudience: 'Giảng viên, huấn luyện viên yoga, trung tâm đào tạo và học viên học từ xa',
    description: 'Nền tảng đào tạo kỹ năng trực tuyến với kho bài giảng video chất lượng cao, bài kiểm tra tương tác, theo dõi tiến độ rèn luyện và cấp chứng nhận hoàn thành.',
    features: [
      'Kho bài giảng video phân cấp từ cơ bản đến nâng cao',
      'Hệ thống trắc nghiệm kiểm tra và ghi nhận tiến độ học tập',
      'Tương tác hỏi đáp trực tiếp với chuyên gia và huấn luyện viên',
      'Truy cập thuận tiện trên mọi thiết bị máy tính và điện thoại'
    ],
    officialLink: {
      label: 'Khám phá nền tảng danava.vn',
      href: 'https://danava.vn/',
      isExternal: true
    },
    badge: 'Nền tảng đào tạo',
    image: '/assets/legacy/event-session.webp',
    visible: true,
    statusText: 'Đang hoạt động trên danava.vn'
  },

  // 2. NHÓM TRUYỀN THÔNG
  {
    id: 'digital',
    name: 'DANAVA Digital Marketing',
    shortName: 'Digital Marketing',
    category: 'truyen-thong',
    categoryName: 'Truyền thông',
    categoryKicker: 'TIẾP THỊ SỐ THEO KPI THỰC TẾ',
    targetAudience: 'Doanh nghiệp SME, phòng tập thể thao, thương hiệu dịch vụ cần khách hàng tiềm năng thực',
    description: 'Dịch vụ marketing tổng thể từ hoạch định chiến lược, phân tích chân dung khách hàng đến triển khai quảng cáo Meta/Google theo KPI đo lường, chuyển đổi người lạ thành học viên trung thành.',
    features: [
      'Quảng cáo Meta & Google Ads có cam kết chi phí lead minh bạch',
      'Xây dựng phễu chuyển đổi qua Landing page và Zalo Official Account',
      'Đo lường hiệu quả từng kênh và tối ưu ngân sách theo tuần',
      'Báo cáo số liệu thực tế, không dùng số liệu ảo hay tương tác rỗng'
    ],
    officialLink: {
      label: 'Xem giải pháp Digital Marketing',
      href: '/giai-phap/digital-marketing/'
    },
    badge: 'Dịch vụ tăng trưởng',
    image: '/assets/legacy/marketing.webp',
    visible: true,
    statusText: 'Đang nhận dự án'
  },
  {
    id: 'media',
    name: 'DANAVA Media',
    shortName: 'Sản xuất nội dung',
    category: 'truyen-thong',
    categoryName: 'Truyền thông',
    categoryKicker: 'SẢN XUẤT MEDIA & VẬN HÀNH KÊNH',
    targetAudience: 'Thương hiệu cần nâng tầm visual, chụp ảnh cơ sở, quay phim ngắn và chăm sóc Fanpage',
    description: 'Đội ngũ sáng tạo sản xuất hình ảnh, video ngắn chuẩn format TikTok/Reels, viết nội dung bài đăng định kỳ và vận hành Fanpage/Zalo OA chuyên nghiệp, giữ vững nhịp tương tác mỗi ngày.',
    features: [
      'Chụp ảnh không gian phòng tập, thiết bị và chân dung đội ngũ HLV',
      'Sản xuất video ngắn giới thiệu bài tập, trải nghiệm và feedback học viên',
      'Lên lịch biên tập nội dung định kỳ, thiết kế banner đồng bộ nhận diện',
      'Chăm sóc tương tác khách hàng, kịch bản trả lời tin nhắn tự động'
    ],
    officialLink: {
      label: 'Tìm hiểu dịch vụ Media & Fanpage',
      href: '/giai-phap/digital-marketing/#dich-vu-media'
    },
    badge: 'Sản xuất nội dung',
    image: '/assets/legacy/event-workshop.webp',
    visible: true,
    statusText: 'Sẵn sàng phục vụ'
  },

  // 3. NHÓM DU LỊCH & SỰ KIỆN
  {
    id: 'go',
    name: 'DANAVA Go & Du lịch Trải nghiệm',
    shortName: 'Du lịch trải nghiệm',
    category: 'du-lich-su-kien',
    categoryName: 'Du lịch & Sự kiện',
    categoryKicker: 'HÀNH TRÌNH TÁI TẠO NĂNG LƯỢNG',
    targetAudience: 'Cá nhân, gia đình, câu lạc bộ yêu thích du lịch trải nghiệm, tour yoga và retreat nghỉ dưỡng',
    description: 'Thiết kế các hành trình du lịch kết hợp tập luyện yoga, thiền định và trải nghiệm văn hóa bản địa tại Đà Nẵng, Hội An, Huế và các miền thiên nhiên thanh bình, giúp tái tạo năng lượng trọn vẹn.',
    features: [
      'Lịch trình thong thả, không hối hả, hòa mình vào thiên nhiên',
      'Các buổi tập Yoga đón bình minh cùng huấn luyện viên giàu kinh nghiệm',
      'Ẩm thực thực dưỡng, tươi ngon từ nông sản địa phương',
      'Dịch vụ đưa đón chu đáo, lưu trú an lành và riêng tư'
    ],
    officialLink: {
      label: 'Khám phá Du lịch & Sự kiện',
      href: '/giai-phap/du-lich-su-kien/'
    },
    badge: 'Tour trải nghiệm',
    image: '/assets/legacy/travel.webp',
    visible: true,
    statusText: 'Đang mở tour định kỳ'
  },
  {
    id: 'events',
    name: 'DANAVA Events & Workshop',
    shortName: 'Sự kiện & Workshop',
    category: 'du-lich-su-kien',
    categoryName: 'Du lịch & Sự kiện',
    categoryKicker: 'TỔ CHỨC HỘI THẢO & GALA TEAM BUILDING',
    targetAudience: 'Doanh nghiệp, hiệp hội nghề nghiệp, tổ chức xã hội cần tổ chức sự kiện chuyên nghiệp',
    description: 'Tổ chức sự kiện trọn gói từ khâu lên ý tưởng chủ đề, thiết kế visual sân khấu, điều phối âm thanh ánh sáng, quản lý khách mời đến ghi lại phóng sự ảnh và video sự kiện.',
    features: [
      'Ý tưởng kịch bản độc đáo, thể hiện đúng thông điệp của tổ chức',
      'Ekip điều phối chuyên nghiệp, quản lý rủi ro kỹ thuật chặt chẽ',
      'Chương trình Team building gắn kết năng lượng đồng đội',
      'Sản xuất tư liệu truyền thông phóng sự ngay sau sự kiện'
    ],
    officialLink: {
      label: 'Xem dịch vụ Tổ chức Sự kiện',
      href: '/giai-phap/du-lich-su-kien/#hoi-nghi'
    },
    badge: 'Sự kiện doanh nghiệp',
    image: '/assets/legacy/event-group.webp',
    visible: true,
    statusText: 'Tiếp nhận yêu cầu'
  },

  // 4. NHÓM CỘNG ĐỒNG
  {
    id: 'yoga-club',
    name: 'Yoga Club Vietnam',
    shortName: 'Yoga Club VN',
    category: 'cong-dong',
    categoryName: 'Cộng đồng',
    categoryKicker: 'MẠNG LƯỚI KẾT NỐI YOGA TOÀN QUỐC',
    targetAudience: 'Cộng đồng người tập yoga, huấn luyện viên, các câu lạc bộ và những người yêu lối sống khỏe',
    description: 'Không gian kết nối và chia sẻ tình yêu yoga lành mạnh. Đơn vị tổ chức chuỗi sự kiện Cổng Năng Lượng thường niên, các workshop chuyên đề yoga trị liệu cột sống và giao lưu gắn kết cộng đồng.',
    features: [
      'Mạng lưới hàng ngàn thành viên sinh hoạt và học hỏi tích cực',
      'Chuỗi sự kiện Cổng Năng Lượng quy mô lớn lan tỏa năng lượng tích cực',
      'Các buổi workshop chuyên môn trị liệu cổ vai gáy và cột sống cùng chuyên gia',
      'Chia sẻ tài liệu, review trải nghiệm và phong cách sống cân bằng'
    ],
    officialLink: {
      label: 'Đến trang Cộng đồng & Yoga Club',
      href: '/giai-phap/cong-dong/'
    },
    badge: 'Kênh đã duyệt · Cộng đồng',
    image: '/assets/legacy/community.webp',
    visible: true,
    statusText: 'Hoạt động thường xuyên'
  },
  {
    id: 'dong-hanh',
    name: 'DANAVA Đồng hành Doanh nghiệp',
    shortName: 'Đồng hành đối tác',
    category: 'cong-dong',
    categoryName: 'Cộng đồng',
    categoryKicker: 'TƯ VẤN KHỞI NGHIỆP & PHÁP LÝ THỂ THAO',
    targetAudience: 'Các huấn luyện viên chuẩn bị mở phòng tập mới, startup thể thao & chăm sóc sức khỏe',
    description: 'Đồng hành cùng đối tác từ ý tưởng sơ khởi: khảo sát thị trường, đánh giá mô hình kinh doanh, kết nối chuỗi cung ứng trang thiết bị phòng tập và tư vấn thủ tục pháp lý kinh doanh dịch vụ thể thao.',
    features: [
      'Khảo sát hiện trạng và tư vấn bài toán doanh thu - chi phí thực tế',
      'Hỗ trợ kết nối nhà cung cấp máy tập, thảm yoga và phụ kiện uy tín',
      'Tư vấn thành lập doanh nghiệp và các quy chuẩn ngành theo thỏa thuận',
      'Hỗ trợ công nghệ và truyền thông ưu đãi trong giai đoạn đầu thành lập'
    ],
    officialLink: {
      label: 'Tìm hiểu chương trình Đồng hành',
      href: '/giai-phap/cong-dong/#dong-hanh'
    },
    badge: 'Chương trình đồng hành',
    image: '/assets/legacy/event-session.webp',
    visible: true,
    statusText: 'Đồng hành đối tác'
  }
];

/**
 * Lấy danh sách các đơn vị trong hệ sinh thái theo bộ lọc
 * Chỉ lấy các đơn vị có visible: true
 */
export function getEcosystemUnits(category: 'all' | EcosystemCategory = 'all'): EcosystemUnit[] {
  const publicUnits = initialEcosystemUnits.filter(unit => unit.visible);
  if (category === 'all') return publicUnits;
  return publicUnits.filter(unit => unit.category === category);
}

/**
 * Thống kê số lượng đơn vị theo từng nhóm danh mục
 */
export function getEcosystemCategoryCounts(): Record<'all' | EcosystemCategory, number> {
  const publicUnits = initialEcosystemUnits.filter(unit => unit.visible);
  const counts: Record<'all' | EcosystemCategory, number> = {
    'all': publicUnits.length,
    'san-pham-so': 0,
    'truyen-thong': 0,
    'du-lich-su-kien': 0,
    'cong-dong': 0
  };

  publicUnits.forEach(unit => {
    if (counts[unit.category] !== undefined) {
      counts[unit.category] += 1;
    }
  });

  return counts;
}

