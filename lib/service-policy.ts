/**
 * Dữ liệu Chính sách Dịch vụ, Cam kết Kỹ thuật (SLA) & Quy trình Hỗ trợ — DANAVA Solutions
 * Phân nhóm rõ ràng theo 3 trụ cột dịch vụ:
 * 1. Phần mềm quản trị (DANAVA Studio)
 * 2. Thiết kế Website & Web App
 * 3. Dịch vụ Truyền thông & Media
 * Bao gồm các điều khoản chính thức đã duyệt và các điều khoản dự thảo (chờ phê duyệt).
 */

export interface ServicePolicyGroup {
  id: string;
  category: 'software' | 'website' | 'media';
  title: string;
  tagline: string;
  scopeOfSupport: string[];
  warrantyTerms: string[];
  ownershipAndHandover: string[];
  exclusions: string[];
}

export interface SLAMatrixItem {
  level: 'critical' | 'major' | 'minor' | 'request';
  levelLabel: string;
  priorityText: string;
  scenario: string;
  firstResponseTime: string;
  resolutionTime: string;
  contactChannel: string;
}

export interface SupportChannel {
  id: string;
  title: string;
  value: string;
  href: string;
  description: string;
  workingHours: string;
  badge: string;
}

export interface DraftClause {
  id: string;
  code: string;
  title: string;
  targetService: string;
  proposedContent: string;
  status: 'DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT';
  impactAnalysis: string;
}

export const SERVICE_POLICY_METADATA = {
  version: '2.0 (Chính thức)',
  lastUpdated: '08/11/2026',
  effectiveDate: 'Áp dụng cho mọi hợp đồng dịch vụ đang hiệu lực của DANAVA Solutions',
  companyName: 'CÔNG TY TNHH DANAVA SOLUTIONS',
  representative: 'Ông Lê Tấn Thành — Founder & CEO',
  address: '08 Đặng Vũ Hỷ, Phường An Hải, Quận Sơn Trà, TP. Đà Nẵng',
  hotline: '0935 91 76 77',
  supportEmail: 'support@danava.vn',
  generalEmail: 'hello@danava.vn'
};

/**
 * 3 Trụ cột chính sách dịch vụ đã được phê duyệt
 */
export const APPROVED_SERVICE_POLICIES: ServicePolicyGroup[] = [
  {
    id: 'phan-mem',
    category: 'software',
    title: 'Phần mềm Quản trị DANAVA Studio (SaaS)',
    tagline: 'Dành riêng cho hệ thống Gym, Yoga Club, Pilates Studio, Bể bơi và Trung tâm Wellness',
    scopeOfSupport: [
      'Cung cấp hạ tầng máy chủ đám mây chuyên dụng, đảm bảo thời gian hoạt động (uptime) đạt tối thiểu 99.9%.',
      'Sao lưu cơ sở dữ liệu hội viên và doanh thu tự động định kỳ hàng ngày (Daily Automated Backups) trên trung tâm dữ liệu độc lập.',
      'Cập nhật tự động các phiên bản phần mềm mới, cải tiến giao diện và vá lỗi an ninh mạng hoàn toàn miễn phí trong suốt chu kỳ sử dụng dịch vụ.',
      'Đào tạo chuyển giao nghiệp vụ trực tiếp hoặc trực tuyến 1:1 cho Ban quản trị và nhân viên lễ tân; kèm bộ cẩm nang & video hướng dẫn thao tác chuẩn.'
    ],
    warrantyTerms: [
      'Bảo hành vận hành không giới hạn thời gian đối với toàn bộ các tính năng tiêu chuẩn trong gói thuê bao đã kích hoạt.',
      'Cam kết khắc phục triệt để các lỗi logic nghiệp vụ (tính sai hạn gói, trùng lịch phòng, lỗi check-in) trong vòng 2 - 4 giờ làm việc kể từ khi ghi nhận.'
    ],
    ownershipAndHandover: [
      'Khách hàng nắm giữ 100% quyền sở hữu đối với danh sách học viên, lịch sử giao dịch và số liệu doanh thu trên hệ thống.',
      'Hỗ trợ xuất dữ liệu ra định dạng Excel/CSV tiêu chuẩn bất cứ lúc nào khách hàng có nhu cầu kiểm toán nội bộ hoặc lưu trữ riêng.',
      'Cam kết bảo mật tuyệt đối, không chia sẻ hay khai thác thương mại thông tin hội viên của phòng tập dưới mọi hình thức.'
    ],
    exclusions: [
      'Sự cố gián đoạn mạng Internet nội bộ tại cơ sở khách hàng hoặc thiết bị phần cứng cá nhân (máy tính, máy quét thẻ, đầu đọc vân tay) của khách hàng bị hỏng.',
      'Mất dữ liệu do người dùng của khách hàng chia sẻ tài khoản quản trị cho bên không có thẩm quyền hoặc tự ý xóa dữ liệu trong phạm vi quyền được cấp.'
    ]
  },
  {
    id: 'thiet-ke-website',
    category: 'website',
    title: 'Thiết kế Website & Ứng dụng Web Chuyển đổi',
    tagline: 'Website doanh nghiệp, Landing page bán hàng và nền tảng số hóa theo nhận diện thương hiệu',
    scopeOfSupport: [
      'Thiết kế giao diện độc bản chuẩn UI/UX, tối ưu hóa tốc độ tải trang đạt chuẩn Google Core Web Vitals (Điểm số di động >= 90).',
      'Tích hợp đầy đủ các luồng tiếp nhận lead, nút gọi trực tiếp, liên kết Zalo/Messenger, bản đồ số và chứng chỉ bảo mật SSL (HTTPS).',
      'Cấu hình nền tảng SEO Onpage chuẩn cấu trúc dữ liệu JSON-LD Schema (Organization, WebSite, Breadcrumb, Article).'
    ],
    warrantyTerms: [
      'Thời hạn bảo hành kỹ thuật tiêu chuẩn: Tối thiểu 12 tháng kể từ ngày ký biên bản nghiệm thu và bàn giao chính thức.',
      'Phạm vi bảo hành bao gồm: Sửa lỗi mã nguồn (bug fixing), tương thích hiển thị trên các bản cập nhật trình duyệt hiện đại (Chrome, Safari, Edge, Firefox), xử lý lỗi gửi form liên hệ.'
    ],
    ownershipAndHandover: [
      'Bàn giao toàn bộ mã nguồn sạch (Clean Source Code) không mã hóa ngầm, không khóa bản quyền (No Vendor Lock-in).',
      'Cung cấp tài khoản Quản trị nội dung (CMS) cấp cao nhất (Super Admin), tài khoản quản lý DNS tên miền và quyền truy cập máy chủ/hosting.',
      'Bàn giao bộ tài liệu hướng dẫn vận hành website và hướng dẫn tự sao lưu dự phòng định kỳ.'
    ],
    exclusions: [
      'Các hư hại hoặc lỗi phát sinh do khách hàng tự ý thay đổi mã nguồn gốc hoặc thuê bên thứ ba can thiệp vào máy chủ khi chưa có sự thống nhất kỹ thuật với DANAVA.',
      'Các sự cố do máy chủ hosting bên thứ ba (do khách hàng tự thuê) bị hết hạn, nghẽn băng thông hoặc không đạt thông số cấu hình tối thiểu được khuyến nghị.'
    ]
  },
  {
    id: 'truyen-thong-media',
    category: 'media',
    title: 'Dịch vụ Truyền thông & Sản xuất Media Đa kênh',
    tagline: 'Vận hành Fanpage/Zalo OA, sản xuất Video ngắn triệu view, hình ảnh thương hiệu và chiến dịch số',
    scopeOfSupport: [
      'Lập kế hoạch nội dung (Content Plan) chi tiết theo tuần/tháng, gửi khách hàng phê duyệt trước khi lên bài tối thiểu 03 ngày làm việc.',
      'Sản xuất hình ảnh, bài viết chuẩn SEO/Social, thiết kế banner sự kiện và quay dựng video ngắn (TikTok, Reels, Shorts) theo đúng kịch bản đã duyệt.',
      'Vận hành tương tác, thiết lập tin nhắn tự động và hỗ trợ xử lý khủng hoảng truyền thông sơ cấp trên các kênh chính thức.'
    ],
    warrantyTerms: [
      'Cam kết chất lượng: Mỗi ấn phẩm thiết kế hoặc video sau bản dựng đầu tiên (Draft 1) được hỗ trợ tối đa 02 vòng chỉnh sửa (Revisions) dựa trên brief ban đầu.',
      'Tiến độ thực thi: Đảm bảo số lượng bài đăng và video theo đúng lịch biểu đã cam kết trong phụ lục hợp đồng.'
    ],
    ownershipAndHandover: [
      'Bàn giao toàn bộ file thiết kế gốc (Photoshop, Illustrator, Premiere) hoặc link lưu trữ Cloud chất lượng cao sau khi nghiệm thu từng giai đoạn.',
      'DANAVA cam kết chỉ sử dụng hình ảnh chiến dịch để làm hồ sơ năng lực (Portfolio) và không chia sẻ tư liệu độc quyền của khách hàng cho bất kỳ đối thủ cạnh tranh nào.'
    ],
    exclusions: [
      'Các thay đổi yêu cầu làm mới toàn bộ kịch bản/concept sau khi đã tiến hành quay bấm máy thực tế theo đúng kịch bản đã được khách hàng ký duyệt trước đó.',
      'Các yếu tố thay đổi thuật toán phân phối đột ngột từ các nền tảng mạng xã hội quốc tế (Meta, TikTok) nằm ngoài tầm kiểm soát trực tiếp của đội ngũ kỹ thuật.'
    ]
  }
];

/**
 * Ma trận phân loại sự cố và cam kết thời gian phản hồi (SLA)
 */
export const SLA_MATRIX: SLAMatrixItem[] = [
  {
    level: 'critical',
    levelLabel: 'Cấp độ 1 — Khẩn cấp (Critical)',
    priorityText: 'ƯU TIÊN CAO NHẤT',
    scenario: 'Hệ thống phần mềm sập hoàn toàn (Downtime), website không thể truy cập, cơ sở không thể check-in học viên hoặc gián đoạn hoạt động kinh doanh trực tiếp.',
    firstResponseTime: 'Trong vòng 30 – 60 phút (24/7)',
    resolutionTime: 'Xử lý liên tục không gián đoạn trong vòng 2 – 4 giờ',
    contactChannel: 'Hotline khẩn cấp 0935 91 76 77 & Nhóm Zalo dự án'
  },
  {
    level: 'major',
    levelLabel: 'Cấp độ 2 — Nghiêm trọng (Major)',
    priorityText: 'ƯU TIÊN TRUNG BÌNH',
    scenario: 'Một tính năng quan trọng bị lỗi nhưng hệ thống chính vẫn hoạt động (ví dụ: không xuất được file Excel báo cáo doanh thu, form đăng ký liên hệ gặp trục trặc tạm thời).',
    firstResponseTime: 'Trong vòng 2 giờ làm việc',
    resolutionTime: 'Khắc phục hoàn tất trong vòng 12 – 24 giờ làm việc',
    contactChannel: 'Nhóm Zalo hỗ trợ kỹ thuật / Email support@danava.vn'
  },
  {
    level: 'minor',
    levelLabel: 'Cấp độ 3 — Tiêu chuẩn (Minor)',
    priorityText: 'HỖ TRỢ THƯỜNG QUY',
    scenario: 'Lỗi hiển thị giao diện nhỏ trên dòng máy hiếm gặp, yêu cầu chỉnh sửa thông tin câu chữ, thay đổi banner trang chủ, hướng dẫn sử dụng tính năng.',
    firstResponseTime: 'Trong vòng 4 – 8 giờ làm việc',
    resolutionTime: 'Xử lý trong vòng 24 – 48 giờ làm việc',
    contactChannel: 'Ticket qua Email / Nhóm chat hỗ trợ'
  },
  {
    level: 'request',
    levelLabel: 'Cấp độ 4 — Yêu cầu nâng cấp (Feature Request)',
    priorityText: 'ĐỀ XUẤT PHÁT TRIỂN',
    scenario: 'Khách hàng có nhu cầu mở rộng quy mô phòng tập, tích hợp thêm cổng thanh toán mới, đặt hàng module tính năng chuyên biệt ngoài hợp đồng.',
    firstResponseTime: 'Trong vòng 1 ngày làm việc',
    resolutionTime: 'Khảo sát và phản hồi phương án kỹ thuật trong 2 – 3 ngày',
    contactChannel: 'Email hello@danava.vn / Trao đổi trực tiếp cùng CEO'
  }
];

/**
 * Danh sách các kênh tiếp nhận hỗ trợ chính thức
 */
export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: 'hotline',
    title: 'Hotline Kỹ thuật Khẩn cấp',
    value: '0935 91 76 77',
    href: 'tel:0935917677',
    description: 'Ưu tiên tiếp nhận xử lý các sự cố Cấp độ 1 làm ngưng trệ vận hành phần mềm hoặc sập website.',
    workingHours: 'Trực 24/7/365 kể cả ngày lễ và cuối tuần',
    badge: 'Phản hồi trong 30 phút'
  },
  {
    id: 'zalo-group',
    title: 'Nhóm Zalo Hỗ trợ Chuyên trách',
    value: 'Kênh Chat riêng theo từng Hợp đồng',
    href: 'https://zalo.me/0935917677',
    description: 'Kênh trao đổi hàng ngày giữa Ban quản lý phòng tập/doanh nghiệp và đội ngũ kỹ sư, CSKH của DANAVA.',
    workingHours: 'Thứ Hai – Thứ Bảy (08:00 – 18:00)',
    badge: 'Tương tác trực tiếp'
  },
  {
    id: 'email-support',
    title: 'Email Tiếp nhận Kỹ thuật & Nghiệp thu',
    value: 'support@danava.vn',
    href: 'mailto:support@danava.vn',
    description: 'Tiếp nhận báo lỗi bằng hình ảnh/video, hồ sơ nghiệm thu kỹ thuật và tài liệu chuyển giao số liệu.',
    workingHours: 'Tiếp nhận liên tục — Phản hồi trong 4h làm việc',
    badge: 'Lưu trữ hồ sơ'
  },
  {
    id: 'office',
    title: 'Văn phòng Hỗ trợ Trực tiếp',
    value: '08 Đặng Vũ Hỷ, An Hải, Sơn Trà, Đà Nẵng',
    href: '/lien-he/',
    description: 'Hỗ trợ đào tạo nghiệp vụ trực tiếp cho đội ngũ vận hành phòng tập và tiếp đón đối tác.',
    workingHours: 'Thứ Hai – Thứ Bảy (08:00 – 18:00)',
    badge: 'Trực tiếp tại văn phòng'
  }
];

/**
 * Các điều khoản dự thảo đang chờ Ban Giám đốc duyệt chính thức
 * Đảm bảo đáp ứng yêu cầu: "Nếu thiếu nội dung được duyệt, chuẩn bị trang ở trạng thái nháp"
 */
export const DRAFT_POLICY_CLAUSES: DraftClause[] = [
  {
    id: 'draft-refund-downtime',
    code: 'DỰ THẢO 01 · BỒI THƯỜNG DOWNTIME',
    title: 'Chính sách hoàn phí và bồi thường gián đoạn dịch vụ đám mây',
    targetService: 'Phần mềm DANAVA Studio',
    proposedContent: 'Trường hợp hệ thống máy chủ DANAVA Studio gặp sự cố gián đoạn dịch vụ với thời gian downtime vượt quá 0.5% tổng thời gian trong một tháng (tương đương hơn 3.6 giờ), khách hàng sẽ được hoàn trừ 10% phí thuê bao của tháng đó vào kỳ thanh toán tiếp theo.',
    status: 'DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT',
    impactAnalysis: 'Cần phòng Tài chính và Kỹ thuật hạ tầng đối soát khả năng tự động đo lường downtime từ hệ thống monitor nội bộ trước khi áp dụng vào hợp đồng.'
  },
  {
    id: 'draft-package-pause',
    code: 'DỰ THẢO 02 · BẢO LƯU GÓI THUÊ BAO',
    title: 'Chính sách tạm ngưng/bảo lưu gói phần mềm khi sửa chữa cơ sở',
    targetService: 'Phần mềm DANAVA Studio',
    proposedContent: 'Khách hàng có cơ sở phòng tập/spa tiến hành cải tạo nâng cấp mặt bằng hoặc di dời địa điểm được quyền yêu cầu bảo lưu thời hạn sử dụng phần mềm tối đa 60 ngày mà không tính phí duy trì, áp dụng tối đa 01 lần trong mỗi năm hợp đồng.',
    status: 'DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT',
    impactAnalysis: 'Đang chờ Ban Giám đốc phê duyệt quy trình tiếp nhận đơn xin bảo lưu và thẩm định tiến độ cải tạo thực tế của cơ sở.'
  },
  {
    id: 'draft-custom-manday',
    code: 'DỰ THẢO 03 · ĐƠN GIÁ NÂNG CẤP NGOÀI PHẠM VI',
    title: 'Biểu phí công nhật (Man-day) cho các module đặt hàng riêng',
    targetService: 'Thiết kế Website & Phần mềm tùy biến',
    proposedContent: 'Các yêu cầu phát sinh ngoài phạm vi hợp đồng đã ký sẽ được tính theo đơn giá công nhật ưu đãi: 1.500.000 VNĐ / Man-day lập trình viên hoặc báo giá trọn gói module theo dự toán được hai bên thỏa thuận trước khi triển khai.',
    status: 'DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT',
    impactAnalysis: 'Đang hoàn thiện khung thẩm định khối lượng công việc và phê duyệt bảng khung giá cố định cho từng loại module.'
  }
];

