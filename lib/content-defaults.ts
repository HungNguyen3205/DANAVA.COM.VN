/*
 * Giá trị mặc định cho các trường nội dung bổ sung (dịch vụ chi tiết, trang dịch vụ con, danh mục kiến thức,
 * quan hệ bài viết–dịch vụ–dự án, khách hàng tiêu biểu).
 *
 * normalizeContent() chỉ ĐIỀN chỗ còn thiếu, không bao giờ ghi đè giá trị quản trị viên đã lưu.
 * Nguồn: nội dung đã có trên website (components/site/service-content.ts trước đây, trang Về DANAVA),
 * case study trên danava.vn (lib/verified-projects.ts). Không thêm số liệu, giá hay cam kết mới.
 */
import type { Client, Feature, Faq, Project, Service, SiteData, SubService, Topic } from './content.ts';

/* ------------------------------------------------------------------ Dịch vụ */
type ServiceSeed = Pick<Service, 'heroLead' | 'audience' | 'problems' | 'process' | 'faqs' | 'pricing' | 'productUrl' | 'productLabel'>;

export const SERVICE_SEEDS: Record<string, ServiceSeed> = {
  studio: {
    heroLead: 'Quản lý hội viên, gói tập, lịch lớp, check-in QR và báo cáo doanh thu trên một nền tảng. Đội ngũ của bạn bớt việc giấy tờ để dành thời gian cho khách hàng.',
    audience: ['Phòng Gym & Fitness', 'Yoga & Pilates studio', 'Bể bơi', 'Spa & Wellness'],
    problems: [
      'Thẻ tập, số buổi còn lại và hạn gói được theo dõi bằng Excel hoặc sổ tay, khó tra cứu và dễ sai sót.',
      'Sĩ số lớp nắm qua nhóm chat, hội viên đến trùng lịch hoặc lớp bị quá tải.',
      'Không có lời nhắc khi gói sắp hết hạn nên dễ bỏ lỡ thời điểm tư vấn gia hạn.',
      'Chủ cơ sở khó nắm nhanh doanh thu và tình hình hoạt động khi không có mặt tại quầy.'
    ],
    process: [
      { title: 'Khảo sát', text: 'Tìm hiểu mô hình gói tập, lịch lớp và quy trình quầy lễ tân hiện tại.' },
      { title: 'Cấu hình & nhập dữ liệu', text: 'Thiết lập gói dịch vụ, phân quyền và chuyển dữ liệu hội viên cũ từ Excel hoặc sổ sách.' },
      { title: 'Đào tạo', text: 'Hướng dẫn lễ tân, HLV và quản lý thao tác trực tiếp trên hệ thống.' },
      { title: 'Vận hành & hỗ trợ', text: 'Đồng hành trong giai đoạn đầu và hỗ trợ kỹ thuật theo chính sách dịch vụ.' }
    ],
    faqs: [
      { q: 'Dữ liệu hội viên cũ từ Excel hoặc sổ sách có chuyển sang được không?', a: 'Có. Đội ngũ DANAVA hỗ trợ chuẩn hóa và nhập danh sách hội viên, hạn thẻ, số buổi còn lại vào hệ thống để phòng tập không bị gián đoạn.' },
      { q: 'Có cần máy tính cấu hình cao hay thiết bị đắt tiền không?', a: 'Không. DANAVA Studio chạy trên trình duyệt web, dùng được với máy tính, laptop, máy tính bảng hoặc điện thoại sẵn có. Check-in QR có thể dùng camera thiết bị hoặc máy quét mã vạch phổ thông.' },
      { q: 'Triển khai và đào tạo nhân viên mất bao lâu?', a: 'Thời gian phụ thuộc vào quy mô cơ sở và lượng dữ liệu cần chuyển. Giao diện tiếng Việt, quy trình trực quan nên lễ tân có thể làm quen các thao tác chính ngay trong buổi hướng dẫn.' },
      { q: 'Dữ liệu và doanh thu của tôi được bảo mật thế nào?', a: 'Kết nối được mã hóa SSL/TLS. Phân quyền chi tiết theo vai trò giúp bạn kiểm soát nhân viên được xem và thao tác những gì.' },
      { q: 'Mất internet tạm thời thì có check-in được không?', a: 'Hệ thống hỗ trợ lưu tạm để tiếp nhận hội viên vào tập bình thường, dữ liệu tự đồng bộ khi có kết nối trở lại.' }
    ],
    pricing: 'Chi phí phụ thuộc mô hình kinh doanh và nhóm tính năng cơ sở cần dùng. Bạn có thể tự chọn mô hình và so sánh các gói trên trang báo giá DANAVA Studio, hoặc nhận tư vấn sau buổi demo.',
    productUrl: 'https://hello.danava.vn',
    productLabel: 'Xem gói và báo giá DANAVA Studio'
  },
  website: {
    heroLead: 'Website và landing page thiết kế riêng theo thương hiệu, tải nhanh trên điện thoại, chuẩn SEO và có biểu mẫu thu khách hàng tiềm năng.',
    audience: ['Doanh nghiệp dịch vụ', 'Trung tâm wellness', 'Cơ sở đào tạo', 'Chiến dịch marketing'],
    problems: [
      'Website hiển thị chậm hoặc vỡ bố cục trên điện thoại.',
      'Muốn sửa nội dung, bảng giá phải nhờ người khác vì không có trang quản trị dễ dùng.',
      'Khách xem xong không biết liên hệ ở đâu, không có biểu mẫu thu thông tin.',
      'Tên miền và tài khoản quản trị không đứng tên doanh nghiệp, khó chủ động tài sản số.'
    ],
    process: [
      { title: 'Nhận brief & tư vấn cấu trúc', text: 'Lắng nghe mục tiêu, khảo sát đối thủ và thống nhất sơ đồ trang, tính năng cần có.' },
      { title: 'Thiết kế giao diện', text: 'Bản thiết kế desktop và mobile để bạn duyệt màu sắc, bố cục trước khi lập trình.' },
      { title: 'Lập trình & nghiệm thu', text: 'Dựng website, tối ưu tốc độ và cùng bạn kiểm tra form, nội dung trên bản chạy thử.' },
      { title: 'Bàn giao & vận hành', text: 'Trỏ tên miền, cấu hình SSL, bàn giao tài khoản quản trị và hướng dẫn cập nhật.' }
    ],
    faqs: [
      { q: 'Làm một website mất bao lâu?', a: 'Tùy số lượng trang, tính năng đặc thù và thời gian chuẩn bị nội dung, hình ảnh. DANAVA sẽ thống nhất tiến độ cụ thể trong đề xuất trước khi bắt đầu.' },
      { q: 'Sau khi bàn giao tôi có tự sửa nội dung được không?', a: 'Được. Website có trang quản trị tiếng Việt để bạn và nhân viên tự đăng bài, đổi hình ảnh, cập nhật bảng giá.' },
      { q: 'Chi phí duy trì hằng năm gồm những gì?', a: 'Chủ yếu là phí tên miền và máy chủ lưu trữ theo giá nhà cung cấp. Các khoản khác (nếu có) được ghi rõ trong báo giá.' },
      { q: 'Website có hiển thị tốt trên điện thoại không?', a: 'Có. Mọi website đều được thiết kế ưu tiên di động và tối ưu tốc độ tải trang.' },
      { q: 'Chế độ bảo hành và hỗ trợ thế nào?', a: 'Phạm vi bảo hành và hỗ trợ kỹ thuật được quy định trong Chính sách dịch vụ của DANAVA và hợp đồng của từng dự án.' }
    ],
    pricing: 'Báo giá dựa trên số lượng trang, tính năng đặc thù (đặt lịch, bán gói, nhiều ngôn ngữ…) và mức độ chuẩn bị nội dung, hình ảnh. Chi phí duy trì chủ yếu là tên miền và máy chủ theo giá nhà cung cấp. DANAVA gửi đề xuất phạm vi và tiến độ trước khi bắt đầu.'
  },
  marketing: {
    heroLead: 'Chiến lược, nội dung, quay chụp và quảng cáo được kết nối thành một kế hoạch. Thương hiệu của bạn đến gần khách hàng hơn, với số liệu minh bạch.',
    audience: ['Phòng tập & studio', 'Spa & wellness', 'Doanh nghiệp dịch vụ', 'Sự kiện & cộng đồng'],
    problems: [
      'Đăng bài không đều, hình ảnh mỗi kênh một kiểu nên thương hiệu thiếu nhất quán.',
      'Chạy quảng cáo nhưng không rõ khách đến từ đâu, tin nhắn và đăng ký dễ bị bỏ sót.',
      'Thiếu hình ảnh, video thật về cơ sở và đội ngũ để khách hàng tin tưởng.',
      'Fanpage hoặc tài khoản quảng cáo do người khác giữ, doanh nghiệp khó kiểm soát chi tiêu.'
    ],
    process: [
      { title: 'Đánh giá hiện trạng', text: 'Phân tích kênh, đối thủ trong khu vực và thống nhất mục tiêu ưu tiên.' },
      { title: 'Lập kế hoạch', text: 'Trục nội dung, lịch biên tập, kịch bản quay chụp và ngân sách dự kiến.' },
      { title: 'Sản xuất & kích hoạt', text: 'Quay chụp tại cơ sở, hoàn thiện bài đăng và chạy chiến dịch.' },
      { title: 'Báo cáo & tối ưu', text: 'Báo cáo số liệu từ nền tảng, bàn giao file gốc và đề xuất cho chu kỳ tiếp theo.' }
    ],
    faqs: [
      { q: 'Doanh nghiệp có cần tự chuẩn bị hình ảnh, video không?', a: 'Không bắt buộc. Đội ngũ DANAVA có thể đến cơ sở để quay chụp không gian, đội ngũ và không khí dịch vụ thực tế.' },
      { q: 'Ngân sách quảng cáo được quản lý thế nào?', a: 'Doanh nghiệp đứng tên tài khoản và thanh toán trực tiếp cho nền tảng quảng cáo theo hóa đơn thực tế. DANAVA thu phí dịch vụ theo thỏa thuận.' },
      { q: 'Kết thúc hợp đồng, các kênh truyền thông thuộc về ai?', a: 'Toàn bộ Fanpage, Zalo OA, tài khoản quảng cáo, tệp khách hàng và file ảnh/video gốc thuộc về doanh nghiệp. DANAVA bàn giao đầy đủ quyền quản trị.' },
      { q: 'Vì sao nên kết hợp Fanpage và Zalo OA?', a: 'Fanpage giúp tiếp cận khách hàng mới qua nội dung và quảng cáo. Zalo OA phù hợp để chăm sóc và giữ liên lạc với khách hàng đã quan tâm.' }
    ],
    pricing: 'Phí dịch vụ được thỏa thuận theo phạm vi công việc: số kênh, tần suất nội dung, số buổi quay chụp. Ngân sách quảng cáo do doanh nghiệp thanh toán trực tiếp cho nền tảng theo hóa đơn thực tế.'
  },
  travel: {
    heroLead: 'Tour trải nghiệm, retreat yoga, hội thảo, workshop và team building, được thiết kế để mỗi chuyến đi, mỗi cuộc gặp gỡ đều có ý nghĩa.',
    audience: ['Doanh nghiệp', 'Câu lạc bộ & cộng đồng', 'Trung tâm yoga', 'Nhóm khách riêng'],
    problems: [
      'Phải làm việc với nhiều đầu mối: xe, phòng, địa điểm và hậu cần.',
      'Lịch trình chung chung, chưa phù hợp mục tiêu gắn kết hay nghỉ dưỡng của nhóm.',
      'Sự kiện thiếu kịch bản và người điều phối tại chỗ.'
    ],
    process: [],
    faqs: [
      { q: 'DANAVA có nhận tổ chức theo yêu cầu riêng không?', a: 'Có. Mỗi chương trình được thiết kế theo số lượng khách, mục tiêu và ngân sách của bạn.' },
      { q: 'Tôi cần chuẩn bị gì để nhận báo giá?', a: 'Chỉ cần cho biết thời gian dự kiến, số lượng người tham gia, địa điểm mong muốn và mục tiêu chương trình.' }
    ],
    pricing: 'Báo giá theo thời gian, số lượng người tham gia, địa điểm và các hạng mục dịch vụ (di chuyển, lưu trú, hậu cần, ghi hình). Gửi các thông tin này để nhận đề xuất chương trình.'
  },
  community: {
    heroLead: 'Kết nối cộng đồng yoga, tổ chức hoạt động giao lưu và đồng hành cùng doanh nghiệp trong những bước phát triển đầu tiên.',
    audience: ['Cộng đồng yoga', 'Huấn luyện viên', 'Doanh nghiệp mới', 'Đối tác'],
    problems: [],
    process: [],
    faqs: [
      { q: 'Làm sao để tham gia các hoạt động cộng đồng?', a: 'Theo dõi mục Kiến thức của DANAVA hoặc liên hệ trực tiếp để nhận thông tin về sự kiện sắp diễn ra.' },
      { q: 'Chương trình đồng hành doanh nghiệp áp dụng thế nào?', a: 'Phạm vi hỗ trợ được thống nhất theo thỏa thuận cụ thể với từng doanh nghiệp.' }
    ],
    pricing: ''
  }
};

/* ------------------------------------------------------- Trang dịch vụ con */
const f = (title: string, text: string): Feature => ({ title, text });
const q = (question: string, a: string): Faq => ({ q: question, a });
const PROCESS_STUDIO = SERVICE_SEEDS.studio.process!;
const PROCESS_WEB = SERVICE_SEEDS.website.process!;
const PROCESS_MKT = SERVICE_SEEDS.marketing.process!;
const PROCESS_EVENT: Feature[] = [
  f('Nhận yêu cầu', 'Thời gian, số người tham gia, địa điểm mong muốn và mục tiêu chương trình.'),
  f('Đề xuất chương trình', 'Kịch bản, lịch trình, hạng mục hậu cần và báo giá để bạn duyệt.'),
  f('Chuẩn bị & điều phối', 'Một đầu mối làm việc với địa điểm, phương tiện và các bên cung cấp.'),
  f('Tổ chức & ghi hình', 'Điều phối tại chỗ, ghi nhận hình ảnh và tổng kết sau chương trình.')
];

/**
 * Bản nháp trang dịch vụ con. Tất cả để published:false — DANAVA rà soát, bổ sung ảnh/dự án thực tế
 * rồi bật xuất bản trong admin (Giải pháp → Trang dịch vụ con). Bản nháp không vào sitemap và trả 404 công khai.
 */
export const SUB_SERVICE_SEEDS: SubService[] = [
  {
    id: 'studio-gym', parentId: 'studio', slug: 'phan-mem-quan-ly-phong-gym', title: 'Phần mềm quản lý phòng Gym',
    description: 'DANAVA Studio cho phòng Gym & Fitness: hội viên, gói tập, PT 1:1, check-in QR và app hội viên mang thương hiệu riêng.',
    heroLead: 'Quầy lễ tân xử lý gói tập, check-in và gia hạn trên một màn hình; chủ phòng tập theo dõi doanh thu và hội viên từ điện thoại.',
    audience: ['Phòng Gym độc lập', 'Fitness center', 'Phòng tập có PT 1:1'],
    problems: [
      'Hội viên mượn thẻ, quầy khó kiểm soát lượt vào giờ cao điểm.',
      'Gói theo tháng, theo buổi và gói kèm PT được ghi ở nhiều nơi khác nhau.',
      'Không biết hội viên nào sắp hết hạn để chủ động tư vấn gia hạn.'
    ],
    features: [
      f('Check-in bằng mã QR', 'Hội viên quét mã trên điện thoại tại quầy, hạn chế mượn thẻ và giảm thời gian chờ.'),
      f('Gói tập & PT 1:1', 'Thẻ theo tháng, theo số buổi hoặc gói kèm huấn luyện viên cá nhân trong cùng hồ sơ hội viên.'),
      f('Nhắc gia hạn', 'Danh sách hội viên sắp hết hạn để lễ tân và nhân viên kinh doanh liên hệ đúng lúc.'),
      f('App hội viên thương hiệu riêng', 'Ứng dụng mang tên phòng tập để hội viên theo dõi gói và lịch tập, như app HARIVER tại hariver.danava.vn.')
    ],
    process: PROCESS_STUDIO,
    faqs: [
      q('Phòng tập đang dùng Excel có chuyển dữ liệu sang được không?', 'Có. DANAVA hỗ trợ chuẩn hóa và nhập danh sách hội viên, hạn thẻ, số buổi còn lại.'),
      q('Có thể xem một phòng tập đang vận hành thực tế không?', 'Bạn có thể đọc case study HARIVER Gym trong mục Dự án và đăng ký demo để xem trực tiếp phần mềm.')
    ],
    pricing: '', image: '/assets/verified/hariver.webp', published: false, updated: '2026-11-19',
    editorNote: 'Cần DANAVA xác nhận: ảnh màn hình nghiệp vụ Gym (PT, check-in), có thêm khách hàng Gym nào được phép nêu tên không.'
  },
  {
    id: 'studio-yoga-pilates', parentId: 'studio', slug: 'phan-mem-quan-ly-yoga-pilates', title: 'Phần mềm quản lý Yoga & Pilates studio',
    description: 'DANAVA Studio cho studio Yoga & Pilates: lịch lớp có giới hạn chỗ, danh sách chờ, gói buổi và đặt chỗ qua app hội viên.',
    heroLead: 'Mỗi lớp có sức chứa riêng theo số thảm hoặc máy; hội viên tự đặt chỗ trên app, studio nắm sĩ số trước giờ học.',
    audience: ['Yoga studio', 'Pilates studio (máy & thảm)', 'Trung tâm có nhiều huấn luyện viên'],
    problems: [
      'Sĩ số lớp quản lý qua nhóm chat, lớp đông vượt số máy hoặc thảm.',
      'Hội viên hủy sát giờ, chỗ trống không được chuyển cho người đang chờ.',
      'Gói theo buổi khó đối chiếu với số lớp hội viên đã tham gia.'
    ],
    features: [
      f('Lịch lớp theo sức chứa', 'Xếp lịch theo số chỗ thực tế của phòng, thảm hoặc máy; lớp tự khóa khi đủ học viên.'),
      f('Danh sách chờ', 'Hội viên đăng ký chờ khi lớp đầy và được xếp vào khi có chỗ trống.'),
      f('Gói buổi gắn với lịch học', 'Số buổi còn lại tự cập nhật theo lượt tham gia lớp.'),
      f('App đặt chỗ thương hiệu riêng', 'Hội viên xem lịch, đặt chỗ và theo dõi gói tập trên app của studio, như hue.danava.vn của Huế Pilates & Yoga.')
    ],
    process: PROCESS_STUDIO,
    faqs: [
      q('Studio có cả lớp máy Pilates và lớp thảm thì cấu hình thế nào?', 'Mỗi loại lớp được đặt sức chứa riêng theo số máy hoặc số thảm thực tế.'),
      q('Có ví dụ studio đang dùng không?', 'Xem case study Huế Pilates & Yoga trong mục Dự án.')
    ],
    pricing: '', image: '/assets/verified/hue-pilates.webp', published: false, updated: '2026-11-19',
    editorNote: 'Cần DANAVA xác nhận: ảnh giao diện lịch lớp/danh sách chờ, chính sách hủy lớp có cấu hình được không.'
  },
  {
    id: 'studio-spa', parentId: 'studio', slug: 'phan-mem-quan-ly-spa', title: 'Phần mềm quản lý Spa & Wellness',
    description: 'DANAVA Studio cho spa và trung tâm wellness: khách hàng, gói liệu trình, lịch hẹn và báo cáo doanh thu.',
    heroLead: 'Theo dõi liệu trình và số buổi còn lại của từng khách, sắp xếp lịch hẹn và xem doanh thu trên một hệ thống.',
    audience: ['Spa', 'Trung tâm trị liệu', 'Wellness center'],
    problems: [
      'Số buổi liệu trình còn lại của khách ghi trên giấy hoặc nhiều file khác nhau.',
      'Lịch hẹn trùng giờ kỹ thuật viên.',
      'Khó tổng hợp doanh thu theo dịch vụ và theo nhân viên.'
    ],
    features: [
      f('Hồ sơ khách hàng & liệu trình', 'Gói liệu trình, số buổi còn lại và ghi chú của từng khách hàng.'),
      f('Lịch hẹn', 'Sắp xếp lịch theo nhân viên và phòng dịch vụ.'),
      f('Báo cáo doanh thu', 'Doanh thu theo ngày, tháng và theo dịch vụ.')
    ],
    process: PROCESS_STUDIO, faqs: [], pricing: '', image: '', published: false, updated: '2026-11-19',
    editorNote: 'Chưa đủ dữ liệu để xuất bản: cần xác nhận tính năng dành riêng cho Spa, ảnh giao diện thực tế và khách hàng Spa đã triển khai.'
  },
  {
    id: 'studio-pool', parentId: 'studio', slug: 'phan-mem-quan-ly-be-boi', title: 'Phần mềm quản lý bể bơi',
    description: 'DANAVA Studio cho bể bơi: vé lượt, thẻ bơi theo mùa, lớp học bơi và check-in tại cổng.',
    heroLead: 'Bán vé lượt, thẻ bơi theo mùa và quản lý lớp học bơi trên cùng một hệ thống.',
    audience: ['Bể bơi công cộng', 'Bể bơi trong khu thể thao', 'Trung tâm dạy bơi'],
    problems: ['Thẻ bơi theo mùa và vé lượt quản lý thủ công.', 'Lớp học bơi khó theo dõi sĩ số và số buổi còn lại.'],
    features: [
      f('Thẻ bơi theo mùa', 'Thẻ theo tháng, theo mùa hoặc theo số lượt trong hồ sơ hội viên.'),
      f('Lớp học bơi', 'Lịch lớp, sĩ số và số buổi còn lại của học viên.'),
      f('Check-in', 'Quét mã khi vào cổng để ghi nhận lượt bơi.')
    ],
    process: PROCESS_STUDIO, faqs: [], pricing: '', image: '', published: false, updated: '2026-11-19',
    editorNote: 'Chưa đủ dữ liệu để xuất bản: cần xác nhận nghiệp vụ bể bơi đang hỗ trợ, ảnh giao diện và khách hàng thực tế.'
  },
  {
    id: 'web-business', parentId: 'website', slug: 'website-doanh-nghiep', title: 'Thiết kế website doanh nghiệp',
    description: 'Website giới thiệu doanh nghiệp, dịch vụ và đội ngũ, có trang quản trị tiếng Việt và biểu mẫu nhận yêu cầu tư vấn.',
    heroLead: 'Một website trình bày rõ doanh nghiệp làm gì, cho ai và cách liên hệ; nhân viên tự cập nhật nội dung sau bàn giao.',
    audience: ['Doanh nghiệp dịch vụ', 'Công ty mới thành lập', 'Doanh nghiệp cần làm mới website'],
    problems: SERVICE_SEEDS.website.problems!.slice(0, 3),
    features: [
      f('Cấu trúc theo dịch vụ', 'Mỗi dịch vụ có trang riêng, dễ tìm từ menu và từ Google.'),
      f('Trang quản trị tiếng Việt', 'Tự đăng bài, đổi hình ảnh, cập nhật bảng giá mà không cần biết code.'),
      f('Biểu mẫu & liên hệ', 'Form tư vấn, nút gọi, Zalo và bản đồ ở những vị trí khách cần.'),
      f('Nền tảng SEO kỹ thuật', 'Thẻ meta, OpenGraph, dữ liệu cấu trúc và sitemap.')
    ],
    process: PROCESS_WEB, faqs: SERVICE_SEEDS.website.faqs!.slice(0, 3), pricing: SERVICE_SEEDS.website.pricing!, image: '', published: false, updated: '2026-11-19',
    editorNote: 'Cần DANAVA chọn 2–3 website doanh nghiệp đã làm (có quyền giới thiệu) để gắn vào trang trước khi xuất bản.'
  },
  {
    id: 'web-gym-yoga', parentId: 'website', slug: 'website-phong-tap-gym-yoga', title: 'Website cho phòng tập Gym & Yoga',
    description: 'Website cho phòng tập và studio: thời khóa biểu, huấn luyện viên, gói tập và đăng ký trực tuyến, kết nối với DANAVA Studio khi cần.',
    heroLead: 'Khách mới xem lịch lớp, huấn luyện viên và gói tập ngay trên điện thoại rồi đăng ký tập thử.',
    audience: ['Phòng Gym', 'Yoga & Pilates studio', 'Trung tâm wellness'],
    problems: ['Lịch lớp đăng bằng ảnh trên Fanpage, khó tra cứu và nhanh lỗi thời.', 'Khách hỏi giá qua tin nhắn vì website không có thông tin gói tập.'],
    features: [
      f('Thời khóa biểu & đặt lớp', 'Hiển thị lịch lớp, huấn luyện viên và cho phép khách đăng ký trực tuyến.'),
      f('Gói tập & ưu đãi', 'Trình bày gói thành viên với luồng liên hệ, đăng ký rõ ràng.'),
      f('Đội ngũ huấn luyện viên', 'Hồ sơ HLV giúp khách mới yên tâm trước buổi tập đầu tiên.')
    ],
    process: PROCESS_WEB, faqs: [], pricing: SERVICE_SEEDS.website.pricing!, image: '', published: false, updated: '2026-11-19',
    editorNote: 'Cần dự án website phòng tập đã triển khai (ảnh giao diện, tên miền) trước khi xuất bản.'
  },
  {
    id: 'web-hotel', parentId: 'website', slug: 'website-khach-san', title: 'Website khách sạn',
    description: 'Website giới thiệu phòng, tiện ích và nhận yêu cầu đặt phòng cho khách sạn, homestay và căn hộ dịch vụ.',
    heroLead: 'Giới thiệu hạng phòng, tiện ích và vị trí; khách gửi yêu cầu đặt phòng trực tiếp trên website.',
    audience: ['Khách sạn', 'Homestay', 'Căn hộ dịch vụ'],
    problems: ['Phụ thuộc hoàn toàn vào kênh đặt phòng trung gian.', 'Thông tin phòng và hình ảnh không cập nhật.'],
    features: [
      f('Hạng phòng & tiện ích', 'Trang phòng với hình ảnh, tiện nghi và chính sách.'),
      f('Yêu cầu đặt phòng', 'Form chọn ngày nhận/trả phòng và số khách.'),
      f('Khu vực quản trị', 'Lễ tân cập nhật thông tin và xem yêu cầu đặt phòng.')
    ],
    process: PROCESS_WEB, faqs: [], pricing: SERVICE_SEEDS.website.pricing!, image: '', published: false, updated: '2026-11-19',
    editorNote: 'Dự án GLG Hotel chưa có ảnh/tên miền công khai. Cần ảnh giao diện và xác nhận phạm vi trước khi xuất bản.'
  },
  {
    id: 'mkt-fanpage', parentId: 'marketing', slug: 'cham-soc-fanpage', title: 'Chăm sóc Fanpage',
    description: 'Lịch biên tập, sản xuất nội dung và phản hồi tin nhắn để Fanpage hoạt động đều đặn và nhất quán với thương hiệu.',
    heroLead: 'Fanpage có lịch đăng đều, hình ảnh nhất quán và tin nhắn được phản hồi; tài khoản vẫn thuộc về doanh nghiệp.',
    audience: ['Phòng tập & studio', 'Spa & wellness', 'Doanh nghiệp dịch vụ'],
    problems: SERVICE_SEEDS.marketing.problems!.slice(0, 2),
    features: [
      f('Lịch biên tập', 'Trục nội dung và lịch đăng bài theo tháng, duyệt trước khi đăng.'),
      f('Thiết kế & nội dung', 'Bài viết, ấn phẩm và hình ảnh theo nhận diện thương hiệu.'),
      f('Phản hồi & tương tác', 'Giữ nhịp tương tác và chuyển khách quan tâm về đúng người phụ trách.')
    ],
    process: PROCESS_MKT, faqs: SERVICE_SEEDS.marketing.faqs!.slice(2, 4), pricing: SERVICE_SEEDS.marketing.pricing!, image: '', published: false, updated: '2026-11-19',
    editorNote: 'Cần ví dụ Fanpage đã chăm sóc (được phép nêu tên) và ảnh minh họa trước khi xuất bản.'
  },
  {
    id: 'mkt-zalo', parentId: 'marketing', slug: 'zalo-oa', title: 'Triển khai & vận hành Zalo OA',
    description: 'Thiết lập Zalo Official Account, nội dung chăm sóc và kết nối với khách hàng đã quan tâm.',
    heroLead: 'Zalo OA giữ liên lạc với khách hàng đã quan tâm: thông báo lịch, ưu đãi và chăm sóc sau dịch vụ.',
    audience: ['Phòng tập & studio', 'Spa', 'Doanh nghiệp dịch vụ địa phương'],
    problems: ['Khách hàng cũ chỉ liên lạc qua điện thoại cá nhân của nhân viên.', 'Thông báo lịch, ưu đãi gửi thủ công từng người.'],
    features: [
      f('Thiết lập OA', 'Hồ sơ, menu và thông tin doanh nghiệp trên Zalo OA.'),
      f('Nội dung chăm sóc', 'Lịch gửi thông báo và bài viết theo nhóm khách hàng.'),
      f('Kết nối Fanpage', 'Fanpage tìm khách mới, Zalo OA chăm sóc khách đã quan tâm.')
    ],
    process: PROCESS_MKT, faqs: [SERVICE_SEEDS.marketing.faqs![3]], pricing: SERVICE_SEEDS.marketing.pricing!, image: '', published: false, updated: '2026-11-19',
    editorNote: 'Cần xác nhận phạm vi dịch vụ Zalo OA DANAVA đang cung cấp (thiết lập, ZNS, chi phí nền tảng) trước khi xuất bản.'
  },
  {
    id: 'mkt-photo', parentId: 'marketing', slug: 'quay-chup-doanh-nghiep', title: 'Quay phim, chụp ảnh doanh nghiệp',
    description: 'Quay chụp không gian, đội ngũ và hoạt động thực tế tại cơ sở để dùng cho website, Fanpage và quảng cáo.',
    heroLead: 'Hình ảnh và video quay tại chính cơ sở của bạn, bàn giao file gốc để dùng lâu dài trên mọi kênh.',
    audience: ['Phòng tập & studio', 'Spa & wellness', 'Sự kiện doanh nghiệp'],
    problems: ['Dùng ảnh mạng hoặc ảnh chụp điện thoại, thiếu nhất quán.', 'Không có video ngắn về không gian và dịch vụ thực tế.'],
    features: [
      f('Kịch bản quay chụp', 'Thống nhất danh sách cảnh, thời điểm và người tham gia trước buổi quay.'),
      f('Quay chụp tại cơ sở', 'Không gian, đội ngũ và không khí dịch vụ thực tế.'),
      f('Bàn giao file gốc', 'Ảnh, video đã hoàn thiện và file gốc thuộc quyền sở hữu của doanh nghiệp.')
    ],
    process: PROCESS_MKT, faqs: [SERVICE_SEEDS.marketing.faqs![0]], pricing: SERVICE_SEEDS.marketing.pricing!, image: '/assets/legacy/marketing.webp', published: false, updated: '2026-11-19',
    editorNote: 'Cần bộ ảnh/video thực tế đã thực hiện cho khách hàng (có quyền sử dụng) trước khi xuất bản.'
  },
  {
    id: 'event-corporate', parentId: 'travel', slug: 'to-chuc-su-kien-doanh-nghiep', title: 'Tổ chức sự kiện doanh nghiệp',
    description: 'Hội nghị, kick-off, gala và team building: kịch bản, hậu cần, truyền thông và ghi hình.',
    heroLead: 'Một đầu mối lo kịch bản, hậu cần, sân khấu và ghi hình để doanh nghiệp tập trung vào khách mời.',
    audience: ['Doanh nghiệp', 'Chuỗi cửa hàng', 'Hiệp hội & câu lạc bộ'],
    problems: SERVICE_SEEDS.travel.problems!,
    features: [
      f('Hội nghị & hội thảo', 'Lên kịch bản, hậu cần, truyền thông và ghi hình cho sự kiện doanh nghiệp.'),
      f('Team building & gala', 'Chương trình gắn kết đội ngũ, từ hoạt động ngoài trời đến đêm gala.'),
      f('Trang trí & booth', 'Không gian sự kiện và booth theo nhận diện thương hiệu.')
    ],
    process: PROCESS_EVENT, faqs: SERVICE_SEEDS.travel.faqs!, pricing: SERVICE_SEEDS.travel.pricing!, image: '/assets/legacy/event-group.webp', published: false, updated: '2026-11-19',
    editorNote: 'Ảnh hồ sơ năng lực (PNJ, LUTECH, Highlands…) cần DANAVA xác nhận vai trò thực hiện và quyền nêu tên trước khi dùng làm dự án.'
  },
  {
    id: 'event-workshop', parentId: 'travel', slug: 'to-chuc-workshop', title: 'Tổ chức workshop',
    description: 'Workshop chuyên đề cho cộng đồng và khách hàng: nội dung, diễn giả, địa điểm và truyền thông.',
    heroLead: 'Những buổi chia sẻ quy mô nhỏ, tập trung vào trải nghiệm và kết nối người tham gia.',
    audience: ['Cộng đồng yoga', 'Doanh nghiệp', 'Trung tâm đào tạo'],
    problems: ['Có chủ đề hay nhưng thiếu người lo địa điểm, truyền thông và đón khách.'],
    features: [
      f('Chủ đề & diễn giả', 'Cùng xây dựng nội dung và kết nối diễn giả phù hợp.'),
      f('Địa điểm & hậu cần', 'Chuẩn bị không gian, âm thanh và đón tiếp người tham gia.'),
      f('Truyền thông & ghi hình', 'Bài đăng trước sự kiện và hình ảnh tổng kết.')
    ],
    process: PROCESS_EVENT, faqs: [], pricing: SERVICE_SEEDS.travel.pricing!, image: '/assets/legacy/event-workshop.webp', published: false, updated: '2026-11-19',
    editorNote: 'Có thể gắn các bài Tin hoạt động về chuỗi Yoga Workshop và Thiền Trà. Cần DANAVA xác nhận trước khi xuất bản.'
  },
  {
    id: 'event-retreat', parentId: 'travel', slug: 'retreat-yoga', title: 'Retreat yoga',
    description: 'Hành trình kết hợp tập luyện, nghỉ dưỡng và khám phá điểm đến cho nhóm yoga và cộng đồng wellness.',
    heroLead: 'Lịch trình kết hợp tập luyện, nghỉ dưỡng và khám phá, điều chỉnh theo nhóm và ngân sách.',
    audience: ['Trung tâm yoga', 'Câu lạc bộ & cộng đồng', 'Nhóm khách riêng'],
    problems: ['Khó tìm địa điểm vừa có không gian tập vừa có lưu trú phù hợp.'],
    features: [
      f('Tour yoga & retreat', 'Lịch trình kết hợp tập luyện, nghỉ dưỡng và khám phá điểm đến.'),
      f('Thiết kế theo yêu cầu', 'Điều chỉnh lịch trình, phòng nghỉ, phương tiện theo nhu cầu và ngân sách của nhóm.'),
      f('Đặt dịch vụ trọn gói', 'Tour, phòng, xe và vé tham quan được sắp xếp bởi một đầu mối.')
    ],
    process: PROCESS_EVENT, faqs: [], pricing: SERVICE_SEEDS.travel.pricing!, image: '/assets/legacy/community.webp', published: false, updated: '2026-11-19',
    editorNote: 'Cần ít nhất một chương trình retreat đã tổ chức (ảnh, thời gian, địa điểm) trước khi xuất bản.'
  }
];

/* ------------------------------------------------------- Danh mục kiến thức */
export const TOPIC_SEEDS: Topic[] = [
  { id: 'van-hanh-phong-tap', slug: 'van-hanh-phong-tap', name: 'Vận hành phòng tập', description: 'Hướng dẫn và kinh nghiệm quản lý phòng Gym, Yoga, Pilates bằng phần mềm.', serviceIds: ['studio'], published: true },
  { id: 'website', slug: 'website-ten-mien', name: 'Website & tên miền', description: 'Kiến thức về tên miền, website và nền tảng số cho doanh nghiệp.', serviceIds: ['website'], published: true },
  { id: 'marketing', slug: 'digital-marketing', name: 'Digital Marketing', description: 'Kiến thức nền tảng về digital marketing, nội dung và đo lường cho doanh nghiệp.', serviceIds: ['marketing'], published: true },
  { id: 'yoga-wellness', slug: 'yoga-wellness', name: 'Yoga & wellness', description: 'Chia sẻ về thực hành yoga và lối sống lành mạnh từ cộng đồng DANAVA.', serviceIds: ['community'], published: true },
  { id: 'du-lich-su-kien', slug: 'du-lich-su-kien', name: 'Du lịch & sự kiện', description: 'Điểm đến, lễ hội và trải nghiệm du lịch.', serviceIds: ['travel'], published: true },
  { id: 'tin-hoat-dong', slug: 'tin-hoat-dong', name: 'Tin hoạt động', description: 'Workshop, sự kiện cộng đồng và hoạt động DANAVA đã tổ chức hoặc đồng hành.', serviceIds: ['travel', 'community'], published: true },
  { id: 'luu-tru', slug: 'luu-tru', name: 'Lưu trữ', description: 'Bài viết cũ từ website trước đây, ngoài các chủ đề dịch vụ hiện tại.', serviceIds: [], published: false }
];

/** Danh mục mặc định của 30 bài chuyển từ WordPress, xếp theo nội dung thực tế (không theo từ khóa). */
export const POST_TOPICS: Record<string, string> = {
  'wp-13591': 'tin-hoat-dong', 'cong-nang-luong': 'tin-hoat-dong', 'thien-tra': 'tin-hoat-dong',
  'wp-13491': 'tin-hoat-dong', 'wp-13468': 'tin-hoat-dong', 'wp-13417': 'tin-hoat-dong',
  marketing: 'marketing', 'wp-13086': 'marketing', 'wp-12101': 'marketing', 'wp-11869': 'marketing', 'wp-11219': 'marketing',
  'wp-12723': 'van-hanh-phong-tap',
  'wp-11951': 'website', 'wp-11916': 'website',
  'wp-13136': 'du-lich-su-kien', 'wp-11303': 'du-lich-su-kien',
  'wp-11212': 'yoga-wellness', 'wp-11198': 'yoga-wellness',
  'wp-12369': 'luu-tru', 'wp-12136': 'luu-tru', 'wp-12114': 'luu-tru', 'wp-11946': 'luu-tru', 'wp-11941': 'luu-tru',
  'wp-11934': 'luu-tru', 'wp-11928': 'luu-tru', 'wp-11789': 'luu-tru', 'wp-11766': 'luu-tru', 'wp-11314': 'luu-tru',
  'wp-11193': 'luu-tru', 'wp-11165': 'luu-tru'
};

/** Danh mục được coi là "kiến thức hữu ích" (hiện trên trang chủ, gợi ý liên quan). */
export const ARCHIVE_TOPIC = 'luu-tru';

/* ------------------------------------------------------- Dự án & khách hàng */
const PROJECT_DEFAULTS: Record<string, Pick<Project, 'industry' | 'serviceIds' | 'scope' | 'updated'>> = {
  'hariver-studio': {
    industry: 'Gym & Fitness', serviceIds: ['studio'], updated: '2026-10-30',
    scope: [
      'Cấu hình DANAVA Studio cho hồ sơ hội viên, gói tập và bán gói tại quầy',
      'Thiết lập check-in hội viên',
      'App hội viên mang thương hiệu HARIVER tại hariver.danava.vn'
    ]
  },
  'hue-studio': {
    industry: 'Pilates & Yoga', serviceIds: ['studio'], updated: '2026-10-30',
    scope: [
      'Thiết lập lịch lớp, sĩ số và danh sách chờ',
      'Quản lý gói tập và check-in',
      'App hội viên theo thương hiệu studio tại hue.danava.vn'
    ]
  }
};

/** Khách hàng đã được DANAVA công bố trong case study trên danava.vn. Chưa có file logo. */
export const CLIENT_SEEDS: Client[] = [
  { id: 'hariver', name: 'HARIVER Gym & Fitness Center', logo: '', url: '', projectId: 'hariver-studio', permission: true, published: true, note: 'Tên khách hàng đã công bố trong case study https://danava.vn/blog/case-hariver-gym-fitness-center. Chưa có file logo được phép sử dụng.' },
  { id: 'hue-pilates', name: 'Huế Pilates & Yoga', logo: '', url: '', projectId: 'hue-studio', permission: true, published: true, note: 'Tên khách hàng đã công bố trong case study https://danava.vn/blog/case-hue-pilates-yoga. Chưa có file logo được phép sử dụng.' }
];

export const DEFAULT_HERO_TITLE = 'Giải pháp công nghệ và marketing cho doanh nghiệp dịch vụ';

/* ------------------------------------------------------------- Chuẩn hóa */
const fill = <T,>(value: T | undefined, fallback: T): T => (value === undefined ? fallback : value);

/**
 * Điền các trường còn thiếu bằng giá trị mặc định. Không ghi đè dữ liệu đã có
 * (kể cả mảng rỗng hay chuỗi rỗng — đó là lựa chọn của quản trị viên).
 */
export function normalizeContent(data: SiteData): SiteData {
  const topics = fill(data.topics, TOPIC_SEEDS.map(t => ({ ...t, serviceIds: [...t.serviceIds] })));
  const topicServices = new Map(topics.map(t => [t.id, t.serviceIds]));
  return {
    ...data,
    heroTitle: fill(data.heroTitle, DEFAULT_HERO_TITLE),
    services: data.services.map(s => {
      const seed = SERVICE_SEEDS[s.id] || {};
      return {
        ...s,
        heroLead: fill(s.heroLead, seed.heroLead || ''),
        audience: fill(s.audience, seed.audience ? [...seed.audience] : []),
        problems: fill(s.problems, seed.problems ? [...seed.problems] : []),
        process: fill(s.process, seed.process ? seed.process.map(x => ({ ...x })) : []),
        faqs: fill(s.faqs, seed.faqs ? seed.faqs.map(x => ({ ...x })) : []),
        pricing: fill(s.pricing, seed.pricing || ''),
        productUrl: fill(s.productUrl, seed.productUrl || ''),
        productLabel: fill(s.productLabel, seed.productLabel || '')
      };
    }),
    subServices: fill(data.subServices, structuredClone(SUB_SERVICE_SEEDS)),
    topics,
    clients: fill(data.clients, structuredClone(CLIENT_SEEDS)),
    testimonials: fill(data.testimonials, []),
    posts: data.posts.map(p => {
      const topicId = fill(p.topicId, POST_TOPICS[p.id] || '');
      return { ...p, topicId, serviceIds: fill(p.serviceIds, [...(topicServices.get(topicId) || [])]) };
    }),
    projects: (data.projects || []).map(p => {
      const d = PROJECT_DEFAULTS[p.id] || {};
      return {
        ...p,
        industry: fill(p.industry, d.industry || ''),
        serviceIds: fill(p.serviceIds, d.serviceIds ? [...d.serviceIds] : []),
        scope: fill(p.scope, d.scope ? [...d.scope] : []),
        gallery: fill(p.gallery, []),
        ...(p.updated === undefined && d.updated ? { updated: d.updated } : {})
      };
    })
  };
}
