/**
 * Nội dung "Về DANAVA" lấy nguyên văn từ trang hồ sơ công ty https://danava.vn/about
 * (cùng doanh nghiệp DANAVA; chủ sở hữu đồng ý dùng lại số liệu và câu chữ — 20/11/2026).
 * Số liệu là con số hiển thị trên danava.vn sau khi bộ đếm chạy xong.
 */
export const ABOUT_DANAVA = {
  source: 'https://danava.vn/about',
  checked: '20/11/2026',
  tagline: 'DANAVA – Nền tảng hệ sinh thái số dành riêng cho ngành Wellness',
  stats: [
    { value: 4066, label: 'Địa điểm' },
    { value: 2055, label: 'Hội viên' },
    { value: 13, label: 'Khóa học' },
    { value: 9, label: 'Tours' }
  ],
  fields: ['Công nghệ', 'AI', 'Marketing', 'Du lịch', 'Sức khỏe', 'Giáo dục', 'Cộng đồng'],
  founder: {
    name: 'Lê Tấn Thành',
    title: 'Founder & CEO, DANAVA Solutions',
    quote: 'Tại DANAVA, chúng tôi tin rằng chuyển đổi số không chỉ là công nghệ — đó là hành trình kiến tạo giá trị bền vững cho doanh nghiệp và cộng đồng.',
    image: '/assets/about/founder.webp'
  },
  mission: 'Đồng hành cùng doanh nghiệp Wellness trên hành trình chuyển đổi số, nâng cao trải nghiệm khách hàng và kiến tạo giá trị bền vững cho cộng đồng sống khỏe.',
  vision: 'Trở thành nền tảng hệ sinh thái số hàng đầu Việt Nam dành cho ngành Wellness, kết nối doanh nghiệp, đối tác và khách hàng trong một cộng đồng phát triển bền vững.',
  story: [
    { year: '2018', title: 'Khởi đầu từ trải nghiệm', text: 'DANAVA bắt đầu với dịch vụ & du lịch chữa lành, sau đó mở rộng sang Yoga & Wellness, kết nối cộng đồng và đồng hành cùng hàng trăm Câu lạc bộ và hơn 1.000 Huấn luyện viên trên toàn quốc.' },
    { year: '2023', title: 'Đưa Wellness lên nền tảng số', text: 'DANAVA đẩy mạnh nền tảng số, đưa Wellness lên môi trường công nghệ.' },
    { year: '2025–2026', title: 'DANAVA Solutions ra đời', text: 'Tập trung vào Công nghệ, AI, Marketing & Chuyển đổi số cho doanh nghiệp Wellness.' }
  ],
  storyClose: 'Từ trải nghiệm thực tế đến giải pháp công nghệ – DANAVA đồng hành cùng doanh nghiệp Wellness phát triển hiệu quả, nâng cao trải nghiệm khách hàng và kiến tạo giá trị bền vững.',
  before: ['Quy trình thủ công, nhiều sai sót', 'Dữ liệu phân mảnh, khó báo cáo', 'Khách hàng chờ đợi lâu', 'Chi phí vận hành cao'],
  after: ['Tự động hóa toàn diện, giảm lỗi', 'Báo cáo thời gian thực, ra quyết định nhanh', 'Trải nghiệm khách hàng vượt trội', 'Tiết kiệm 30-50% chi phí vận hành'],
  values: [
    { title: 'Công nghệ tiên phong', text: 'Luôn cập nhật và ứng dụng công nghệ, AI mới nhất' },
    { title: 'Minh bạch & Tin cậy', text: 'Cam kết rõ ràng, báo cáo minh bạch trong từng dự án' },
    { title: 'Tận tâm', text: 'Đặt thành công của khách hàng làm trung tâm' },
    { title: 'Đổi mới sáng tạo', text: 'Không ngừng cải tiến giải pháp và quy trình' },
    { title: 'Đồng hành lâu dài', text: 'Hỗ trợ khách hàng xuyên suốt hành trình chuyển đổi số' },
    { title: 'Kết quả đo lường được', text: 'Mọi giải pháp đều gắn với KPI và hiệu quả thực tế' }
  ],
  /** Bài toán → giải pháp (danava.vn/about); liên kết tới trang giải pháp tương ứng trên website này */
  problems: [
    { problem: 'Không có khách hàng', solution: 'Marketing AI — tiếp cận đúng đối tượng', href: '/giai-phap/digital-marketing/' },
    { problem: 'Quản lý thủ công, kém hiệu quả', solution: 'DANAVA Studio — quản lý phòng tập hiệu quả', href: '/giai-phap/danava-studio/' },
    { problem: 'Website lỗi thời', solution: 'Website Platform — thiết kế hiện đại, chuẩn SEO', href: '/giai-phap/thiet-ke-website/' },
    { problem: 'Thiếu nhận diện thương hiệu', solution: 'Branding — xây dựng hình ảnh chuyên nghiệp', href: '/giai-phap/su-kien-truyen-thong/' }
  ],
  tech: ['AI Ứng dụng', 'Nền tảng Cloud', 'Phân tích dữ liệu', 'Bảo mật & Tuân thủ'],
  rnd: ['Innovation Lab', 'AI Lab', 'Media Lab', 'Automation Lab', 'Open Innovation'],
  industries: ['Marketing', 'Travel', 'Education', 'Healthcare', 'Fitness', 'Yoga', 'Spa', 'Retail', 'SME'],
  process: [
    { name: 'Discover', text: 'Khảo sát & phân tích hiện trạng' },
    { name: 'Analyze', text: 'Xác định yêu cầu & rủi ro' },
    { name: 'Design', text: 'Thiết kế giải pháp tối ưu' },
    { name: 'Develop', text: 'Phát triển & tích hợp hệ thống' },
    { name: 'Deploy', text: 'Triển khai & kiểm thử' },
    { name: 'Training', text: 'Đào tạo người dùng' },
    { name: 'Optimize', text: 'Tối ưu, cải tiến liên tục & hỗ trợ kỹ thuật 24/7' }
  ],
  journey: ['Khách hàng', 'Tư vấn', 'Giải pháp', 'Triển khai', 'Đào tạo', 'Đồng hành'],
  esg: [
    { title: 'Green Technology', text: 'Công nghệ xanh, thân thiện môi trường' },
    { title: 'Community', text: 'Xây dựng cộng đồng bền vững' },
    { title: 'Education', text: 'Nâng cao tri thức và kỹ năng' },
    { title: 'Wellness', text: 'Chăm sóc sức khỏe toàn diện' },
    { title: 'Social Impact', text: 'Tác động xã hội tích cực' },
    { title: 'Sustainable', text: 'Phát triển bền vững dài hạn' }
  ],
  network: [
    { name: 'Landing Page', text: 'Giải pháp nền tảng số' },
    { name: 'Zalo Partner', text: 'Marketing & kết nối khách hàng' },
    { name: 'Sông Hàn Incubator', text: 'Hỗ trợ khởi nghiệp & kết nối hệ sinh thái' },
    { name: 'AI Technology', text: 'Công nghệ & tự động hóa' },
    { name: 'Wellness Network', text: 'Kết nối cộng đồng' },
    { name: 'Wellness Travel Network', text: 'Hệ sinh thái du lịch & dịch vụ' }
  ],
  company: 'Công ty Cổ phần Giải pháp DANAVA · MST 0401883105 · Sở KH&ĐT TP. Đà Nẵng cấp lần đầu 08/03/2018 · Trụ sở: 08 Đặng Vũ Hỷ, P. An Hải, TP. Đà Nẵng'
};

/**
 * Nguyên văn bộ "Company Profile 2026" của DANAVA (bản PDF/ảnh chủ sở hữu gửi ngày 20/11/2026, đề ngày 08/06/2026).
 * Trang chủ trình bày theo đúng ngôn ngữ thiết kế của bộ profile này.
 */
export const PROFILE_2026 = {
  date: '08/06/2026',
  years: '2018 - 2026',
  slogan: 'DANAVA Solutions — Growing Your Business Together',
  tagline: 'DANAVA – Nền tảng hệ sinh thái số dành riêng cho ngành Wellness tại Việt Nam',
  about: [
    'DANAVA cung cấp giải pháp Phần mềm quản lý phòng tập Gym, Yoga, Pilates, Spa & Beauty, Dance Studio,... Chuyển đổi số và Truyền thông số, giúp doanh nghiệp tối ưu vận hành và phát triển bền vững.',
    'Tại DANAVA, chúng tôi tin rằng chuyển đổi số không chỉ là công nghệ — đó là hành trình kiến tạo giá trị bền vững cho doanh nghiệp và cộng đồng.'
  ],
  aboutClose: 'DANAVA phát triển “Nền tảng hệ sinh thái số dành riêng cho ngành Wellness” tại Việt Nam.',
  values: ['Kết nối', 'Đồng hành', 'Đổi mới', 'Hiệu quả', 'Bền vững'],
  services: [
    { title: 'Marketing AI', text: 'Tiếp cận đúng khách hàng mục tiêu bằng AI, tối ưu quảng cáo, tự động hóa marketing và gia tăng hiệu quả chuyển đổi.', href: '/giai-phap/digital-marketing/' },
    { title: 'DANAVA Studio', text: 'Nền tảng quản lý vận hành toàn diện, giúp quản lý hội viên, lịch hẹn, thanh toán, nhân sự và báo cáo một cách hiệu quả.', href: '/giai-phap/danava-studio/' },
    { title: 'Website Platform', text: 'Thiết kế website hiện đại, chuẩn SEO, tối ưu tốc độ, thân thiện trên mọi thiết bị và hỗ trợ phát triển thương hiệu trực tuyến.', href: '/giai-phap/thiet-ke-website/' },
    { title: 'DANAVA Branding', text: 'Xây dựng hệ thống nhận diện thương hiệu chuyên nghiệp, đồng bộ từ logo, màu sắc, hình ảnh đến thông điệp, tạo dấu ấn bền vững.', href: '/giai-phap/su-kien-truyen-thong/' }
  ],
  quote: 'Danava – Kết nối công nghệ, kiến tạo hệ sinh thái Wellness.',
  why: [
    { title: 'Năng lực công nghệ', text: 'Ứng dụng AI, điện toán đám mây và các công nghệ hiện đại để phát triển giải pháp phần mềm an toàn, linh hoạt và dễ mở rộng theo nhu cầu doanh nghiệp.' },
    { title: 'Giải pháp toàn diện', text: 'Cung cấp hệ sinh thái từ tư vấn, chuyển đổi số, phát triển phần mềm, website, ứng dụng di động đến truyền thông số, giúp doanh nghiệp vận hành hiệu quả trên một nền tảng thống nhất.' },
    { title: 'Đồng hành phát triển', text: 'Không chỉ triển khai dự án, DANAVA đồng hành lâu dài với khách hàng thông qua tư vấn, đào tạo, bảo trì và tối ưu giải pháp theo từng giai đoạn phát triển.' },
    { title: 'Hiệu quả & giá trị bền vững', text: 'Cam kết mang đến giải pháp chất lượng, tối ưu chi phí đầu tư, nâng cao năng suất vận hành và tạo lợi thế cạnh tranh bền vững cho doanh nghiệp.' }
  ],
  social: '@danavasolutions',
  website: 'www.danava.vn'
};
