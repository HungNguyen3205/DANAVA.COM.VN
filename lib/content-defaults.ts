/*
 * Giá trị mặc định cho các trường nội dung bổ sung (dịch vụ chi tiết, trang dịch vụ con, danh mục kiến thức,
 * quan hệ bài viết–dịch vụ–dự án, khách hàng tiêu biểu).
 *
 * normalizeContent() điền các trường còn thiếu và cập nhật tên các giải pháp đã đổi.
 * Nguồn: nội dung đã có trên website (components/site/service-content.ts trước đây, trang Về DANAVA),
 * case study trên danava.vn (lib/verified-projects.ts). Không thêm số liệu, giá hay cam kết mới.
 */
import { initial, RETIRED_SERVICES, type Client, type Feature, type Faq, type Project, type Service, type SiteData, type SubService, type Topic } from './content.ts';
import { HUDI_WEBSITE_SHOWCASE, SHOWCASE_SEEDS } from './showcase-seeds.ts';
import { MARKETING_ENGAGEMENTS } from './marketing-portfolio.ts';
import { EQUIPMENT_SEEDS } from './equipment.ts';

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
    audience: ['Doanh nghiệp dịch vụ', 'Trung tâm wellness', 'Cơ sở đào tạo', 'Chương trình & sự kiện'],
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
    heroLead: 'DANAVA xây dựng một kế hoạch chung cho chiến lược truyền thông, sản xuất nội dung và hình ảnh, vận hành kênh, quảng cáo và đo lường hiệu quả.',
    audience: ['Phòng tập & studio', 'Spa & wellness', 'Doanh nghiệp dịch vụ', 'Cơ sở đào tạo'],
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
  events: {
    heroLead: 'DANAVA kết nối ý tưởng, nguồn lực và triển khai để tạo nên những sự kiện mang dấu ấn riêng của doanh nghiệp: từ kịch bản, không gian, sân khấu đến điều phối và biểu diễn.',
    audience: ['Doanh nghiệp', 'Thương hiệu bán lẻ', 'Hiệp hội & câu lạc bộ', 'Chuỗi dịch vụ'],
    problems: [
      'Phải làm việc với nhiều đơn vị riêng lẻ: thi công, âm thanh ánh sáng, nhân sự biểu diễn.',
      'Không gian sự kiện chưa thể hiện được nhận diện thương hiệu.',
      'Sự kiện thiếu kịch bản và người điều phối tại chỗ.'
    ],
    process: [
      { title: 'Ý tưởng & kế hoạch', text: 'Thống nhất mục tiêu, khách mời, chủ đề và kế hoạch tổ chức.' },
      { title: 'Thiết kế không gian', text: 'Phối cảnh booth, backdrop, sân khấu và đạo cụ để duyệt trước khi thi công.' },
      { title: 'Thi công & kỹ thuật', text: 'Dựng không gian, phối hợp thiết bị âm thanh, ánh sáng, LED và nhân sự kỹ thuật.' },
      { title: 'Tổng duyệt & điều phối', text: 'Tổng duyệt kịch bản, kiểm tra thiết bị và điều phối nhân sự tại hiện trường.' }
    ],
    faqs: [
      { q: 'DANAVA có nhận thi công riêng booth, backdrop hoặc đạo cụ không?', a: 'Có. Thiết kế, thi công booth, backdrop, đạo cụ và không gian sự kiện là một hạng mục DANAVA thực hiện, có thể đặt riêng hoặc trong gói tổ chức.' },
      { q: 'Tôi cần chuẩn bị gì để nhận báo giá?', a: 'Chỉ cần cho biết thời gian dự kiến, số lượng khách mời, địa điểm mong muốn và mục tiêu chương trình.' },
      { q: 'DANAVA có tổng duyệt trước chương trình không?', a: 'DANAVA phối hợp với MC, kỹ thuật và nhân sự tại địa điểm để kiểm tra thiết bị, chạy thử kịch bản và thống nhất các phần chuyển tiếp.' }
    ],
    pricing: 'Báo giá theo quy mô, địa điểm và các hạng mục cần triển khai, gồm thiết kế và thi công không gian, thiết bị, nhân sự và điều phối. DANAVA gửi đề xuất chi tiết sau khi nhận thông tin chương trình.'
  },
  travel: {
    heroLead: 'Tour trải nghiệm, retreat yoga và hành trình thiết kế riêng cho từng nhóm: lịch trình, phòng nghỉ, phương tiện và vé tham quan do một đầu mối sắp xếp.',
    audience: ['Doanh nghiệp', 'Câu lạc bộ & cộng đồng', 'Trung tâm yoga', 'Nhóm khách riêng'],
    problems: [
      'Phải làm việc với nhiều đầu mối: xe, phòng, địa điểm và hậu cần.',
      'Lịch trình chung chung, chưa phù hợp mục tiêu gắn kết hay nghỉ dưỡng của nhóm.',
      'Khó tìm nơi vừa có không gian tập luyện vừa có lưu trú phù hợp cho nhóm yoga.'
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
      { q: 'Làm sao để tham gia các hoạt động cộng đồng?', a: 'Theo dõi mục Blogs của DANAVA hoặc liên hệ trực tiếp để nhận thông tin về sự kiện sắp diễn ra.' },
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
    id: 'event-corporate', parentId: 'events', slug: 'to-chuc-su-kien-doanh-nghiep', title: 'Tổ chức sự kiện doanh nghiệp',
    description: 'Hội nghị, kick-off, gala và team building: kịch bản, sân khấu, hậu cần và điều phối.',
    heroLead: 'Một đầu mối lo kịch bản, hậu cần, sân khấu và điều phối để doanh nghiệp tập trung vào khách mời.',
    audience: ['Doanh nghiệp', 'Chuỗi cửa hàng', 'Hiệp hội & câu lạc bộ'],
    problems: SERVICE_SEEDS.events.problems!,
    features: [
      f('Hội nghị & hội thảo', 'Lên kịch bản, sân khấu, hậu cần và điều phối cho sự kiện doanh nghiệp.'),
      f('Team building & gala', 'Chương trình gắn kết đội ngũ, từ hoạt động ngoài trời đến đêm gala.'),
      f('Trang trí & booth', 'Không gian sự kiện và booth theo nhận diện thương hiệu.')
    ],
    process: SERVICE_SEEDS.events.process!, faqs: SERVICE_SEEDS.events.faqs!.slice(1), pricing: SERVICE_SEEDS.events.pricing!, image: '/assets/legacy/event-group.webp', published: false, updated: '2026-11-19',
    editorNote: 'Ảnh hồ sơ năng lực (PNJ, LUTECH, Highlands…) cần DANAVA xác nhận vai trò thực hiện và quyền nêu tên trước khi dùng làm dự án.'
  },
  {
    id: 'event-workshop', parentId: 'events', slug: 'to-chuc-workshop', title: 'Tổ chức workshop',
    description: 'Workshop chuyên đề cho cộng đồng và khách hàng: kịch bản, diễn giả, địa điểm và điều phối.',
    heroLead: 'Những buổi chia sẻ quy mô nhỏ, tập trung vào trải nghiệm và kết nối người tham gia.',
    audience: ['Cộng đồng yoga', 'Doanh nghiệp', 'Trung tâm đào tạo'],
    problems: ['Có chủ đề hay nhưng thiếu người lo địa điểm, kỹ thuật và đón khách.'],
    features: [
      f('Chủ đề & diễn giả', 'Cùng xây dựng nội dung và kết nối diễn giả phù hợp.'),
      f('Địa điểm & hậu cần', 'Chuẩn bị không gian, âm thanh và đón tiếp người tham gia.'),
      f('Điều phối tại chỗ', 'Phối hợp với diễn giả, kỹ thuật viên và nhân sự đón tiếp theo kịch bản.')
    ],
    process: SERVICE_SEEDS.events.process!, faqs: [], pricing: SERVICE_SEEDS.events.pricing!, image: '/assets/legacy/event-workshop.webp', published: false, updated: '2026-11-19',
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
  { id: 'yoga-wellness', slug: 'yoga-wellness', name: 'Yoga & wellness', description: 'Chia sẻ về thực hành yoga và lối sống lành mạnh từ cộng đồng DANAVA.', serviceIds: ['community'], published: true },
  { id: 'du-lich-su-kien', slug: 'du-lich-su-kien', name: 'Du lịch & sự kiện', description: 'Điểm đến, lễ hội và trải nghiệm du lịch.', serviceIds: ['travel'], published: true },
  { id: 'tin-hoat-dong', slug: 'tin-hoat-dong', name: 'Tin hoạt động', description: 'Workshop, sự kiện cộng đồng và hoạt động DANAVA đã tổ chức hoặc đồng hành.', serviceIds: ['travel', 'community'], published: true },
  { id: 'luu-tru', slug: 'luu-tru', name: 'Lưu trữ', description: 'Bài viết cũ từ website trước đây, ngoài các chủ đề dịch vụ hiện tại.', serviceIds: [], published: false }
];

/** Danh mục mặc định của 30 bài chuyển từ WordPress, xếp theo nội dung thực tế (không theo từ khóa). */
export const POST_TOPICS: Record<string, string> = {
  'wp-13591': 'tin-hoat-dong', 'cong-nang-luong': 'tin-hoat-dong', 'thien-tra': 'tin-hoat-dong',
  'wp-13491': 'tin-hoat-dong', 'wp-13468': 'tin-hoat-dong', 'wp-13417': 'tin-hoat-dong',
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

/**
 * Khách hàng (có case study) và đối tác đồng hành công bố trên https://danava.vn/.
 * Logo tải từ danava.vn, nguồn ghi ở public/assets/partners/sources.json.
 */
/** Đợt bổ sung 13 đối tác đồng hành từ danava.vn (20/11/2026) */
export const PARTNER_SEED = 'partners-danava-vn-2026-11';
const PARTNER_PREFIX = 'danava-partner-';
/** Dữ liệu đã lưu chưa từng nhận đợt đối tác này và cũng chưa có đối tác nào loại này */
const needsPartnerSeed = (data: SiteData) => !!data.clients?.length && !(data.seeded || []).includes(PARTNER_SEED) && !data.clients.some(c => c.id.startsWith(PARTNER_PREFIX));

const BASE_CLIENT_SEEDS: Client[] = [
  { id: 'hariver', name: 'HARIVER Gym & Fitness Center', logo: '/assets/partners/hariver-gym-fitness.webp', url: 'https://danava.vn/places/hariver-gym-fitnes-center', projectId: 'hariver-studio', role: 'Gym & Fitness', relation: 'client', verified: true, permission: true, published: true, note: 'Tên khách hàng đã công bố trong case study https://danava.vn/blog/case-hariver-gym-fitness-center. Logo theo khối Đối tác đồng hành trên danava.vn.', fullName: 'HARIVER GYM & FITNESS CENTER', description: 'Phòng tập hỗ trợ sức khoẻ cho cộng đồng thông qua câu lạc bộ Gym tốt nhất khu vực Hoà Khánh.', address: '214 Phạm Như Xương, P. Hoà Khánh, TP. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (5:00 - 20:00)', types: ['Gym'], amenities: ['Trang thiết bị hiện đại', 'Huấn luyện viên chuyên nghiệp', 'Đa dạng khu vực tập luyện', 'Không gian rộng rãi', 'Phòng tắm & tủ khóa tiện nghi', 'Bãi đỗ xe rộng rãi', 'an toàn'], cover: '/assets/partners/covers/hariver-gym-fitness-center.webp' },
  { id: 'hue-pilates', name: 'Huế Pilates & Yoga', logo: '/assets/partners/hue-pilates-yoga.webp', url: 'https://danava.vn/places/hue-pilates-yoga', projectId: 'hue-studio', role: 'Pilates & Yoga', relation: 'client', verified: true, permission: true, published: true, note: 'Tên khách hàng đã công bố trong case study https://danava.vn/blog/case-hue-pilates-yoga. Logo theo khối Đối tác đồng hành trên danava.vn.', fullName: 'Huế Pilates & Yoga', description: 'Huế Pilates & Yoga là không gian luyện tập chuyên nghiệp, nơi kết hợp hài hòa giữa Yoga và Pilates nhằm nâng cao sức khỏe thể chất, cân bằng tinh thần và cải thiện chất lượng cuộc sống. Với đội ngũ huấn luyện viên tận tâm cùng các chương trình tập luyện phù hợp cho mọi độ tuổi, Huế Pilates & Yoga mang đến môi trường tập luyện thân thiện, giúp học viên tăng cường sức mạnh cơ thể, cải thiện vóc dáng, giảm căng thẳng và xây dựng lối sống khỏe mạnh mỗi ngày.', address: '38 Nguyễn Khuyến, Phường Thuận Hoá, Tp. Huế', city: 'Thừa Thiên Huế', hours: 'Thứ 2 - Chủ Nhật (05h00 - 20h00)', types: ['Pilates'], amenities: ['Nước uống miễn phí', 'Khăn tập miễn phí', 'Máy Reformer hiện đại', 'Máy Cadillac chuyên nghiệp', 'Wunda Chair cao cấp', 'Ladder Barrel hỗ trợ tập luyện hiệu quả'], cover: '/assets/partners/covers/hue-pilates-yoga.webp' },
  { id: 'danava-partner-7', name: 'VF Gym', logo: '/assets/partners/vf-gym.webp', url: 'https://danava.vn/places/vf-gym', projectId: '', role: 'Gym & Fitness', relation: 'partner', verified: true, permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'VF GYM', description: 'VF GYM – 1081 Ngô Quyền là phòng tập hiện đại dành cho mọi đối tượng, từ người mới bắt đầu đến người tập lâu năm. Không gian rộng rãi, sạch sẽ, được trang bị hệ thống máy lạnh mát mẻ giúp bạn thoải mái tập luyện bất kể thời tiết. Phòng gym sở hữu đầy đủ máy tập cardio, máy tập sức mạnh và khu vực tập tạ tự do, đáp ứng đa dạng mục tiêu như giảm cân, tăng cơ, nâng cao sức khỏe hay cải thiện vóc dáng. Bên cạnh đó, VF GYM còn có nhiều tiện ích như khu vực thay đồ, gửi xe thuận tiện, huấn luyện viên nhiệt tình hỗ trợ và môi trường tập luyện thân thiện, tạo động lực để bạn duy trì thói quen vận động mỗi ngày. Với không gian chuyên nghiệp cùng trang thiết bị hiện đại, VF GYM là lựa chọn phù hợp cho những ai mong muốn xây dựng một lối sống khỏe mạnh, năng động và bền vững.', address: '1081 Ngô Quyền, P. An Hải, TP. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (05h00 - 20h00)', types: ['Gym'], amenities: ['Phòng tập máy lạnh', 'Máy tập hiện đại', 'HLV hỗ trợ', 'Phòng thay đồ', 'Bãi đỗ xe', 'Không gian chuyên nghiệp'], cover: '/assets/partners/covers/vf-gym.webp' },
  { id: 'danava-partner-14', name: 'SADHANA PILATES', logo: '/assets/partners/sadhana-pilates.webp', url: 'https://danava.vn/places/sadhana-pilates', projectId: '', role: 'Pilates', relation: 'partner', verified: true, permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Sadhana Pilates', description: 'Sadhana Pilates – Không gian tập luyện chuyên sâu giúp cải thiện vóc dáng, tăng sức mạnh, nâng cao độ dẻo dai và cân bằng cơ thể. Chương trình phù hợp nhiều nhu cầu, từ tập luyện, giảm đau đến phục hồi và chăm sóc sức khỏe.', address: '28G Nguyễn Hữu Cảnh, P. 22, Quận Bình Thạnh, TP. HCM', city: 'Hồ Chí Minh', hours: 'T2- CN: 7:00 đến 21:00', types: ['Pilates'], amenities: ['Tăng sức mạnh & độ dẻo', 'Săn chắc vóc dáng', 'Cải thiện tư thế', 'Giảm căng thẳng', 'thư giãn', 'Hỗ trợ phục hồi cơ thể', 'Cá nhân hóa theo mục tiêu'], cover: '/assets/partners/covers/sadhana-pilates.webp' },
  { id: 'danava-partner-15', name: 'BỤNG Healing', logo: '/assets/partners/bung-healing.webp', url: 'https://danava.vn/places/bung-healing', projectId: '', role: 'Breathwork & Hara Voice', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'BỤNG Healing', description: 'Bụng Healing là không gian tập luyện online chuyên sâu về Breathwork & Hara Voice , giúp kết nối với hơi thở, vùng bụng và nội lực bên trong, hướng đến thư giãn sâu, ngủ ngon và làm ấm cơ thể. Chương trình đồng thời đào tạo chuyên môn với 110H Breathwork & Hara Voice dành cho HLV Yoga/Vận động, 220H HLV Breathwork & Hara Voice kết hợp Mindfulness, Kundalini Yoga và Zen Leader, cùng các lớp Tập huấn chuyên môn Liên đoàn Yoga Việt Nam , mang đến nền tảng thực hành và đào tạo bài bản, chuyên nghiệp.', city: 'Hồ Chí Minh', hours: '24/7', types: ['Yoga'], amenities: ['Làm ấm bụng', 'Điều hòa hơi thở', 'Thư giãn sâu', 'Hara Voice', 'Healing vùng bụng', 'Cân bằng Thân'], cover: '/assets/partners/covers/bung-healing.webp' },
  { id: 'danava-partner-16', name: 'Sun Moon Yogashala', logo: '/assets/partners/sun-moon-yogashala.webp', url: 'https://danava.vn/places/sunmon-yoga', projectId: '', role: 'Yoga', relation: 'partner', verified: true, permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Sunmon Yoga', description: 'Sun Moon Yogashala – Nơi bạn chăm sóc sức khỏe và tìm lại sự cân bằng qua từng hơi thở, từng chuyển động Yoga. Với đội ngũ giáo viên Ấn Độ có chuyên môn cao, tận tâm hướng dẫn, mỗi buổi tập giúp bạn tăng cường sự dẻo dai, cải thiện sức mạnh, thư giãn tinh thần và nâng cao khả năng tập trung. Dù mới bắt đầu hay đã có kinh nghiệm, hãy cùng Sun Moon Yogashala nuôi dưỡng thói quen sống khỏe và tận hưởng khoảng thời gian dành riêng cho bản thân.', address: '51–53 Phan Thị Khá, phường Bạc Liêu, tỉnh Cà Mau', city: 'Cà Mau', types: ['Yoga'], amenities: ['Giáo viên Ấn Độ chuyên môn cao', 'Hướng dẫn tận tâm', 'Tăng sức mạnh', 'dẻo dai', 'Thư giãn', 'giảm căng thẳng', 'Tập trung', 'cân bằng thân tâm'], cover: '/assets/partners/covers/sunmon-yoga.webp' },
  { id: 'danava-partner-1', name: 'GLG YOGA SCHOOL', logo: '/assets/partners/glg-yoga-school.webp', url: 'https://danava.vn/places/glg-yoga-school', projectId: '', role: 'Yoga & Đào tạo', relation: 'partner', verified: true, permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'GLG YOGA SCHOOL', description: 'GLG Yoga School là một trường đào tạo giáo viên Yoga quốc tế chuyên nghiệp và năng động, với sứ mệnh mang đến kiến thức toàn diện và trải nghiệm sâu sắc trong lĩnh vực Yoga. Trường nổi bật với các khóa học đạt chuẩn quốc tế, hợp tác cùng, DSVV University, Đại học SGRR Ấn Độ và Yoga Alliance USA. Đào tạo chuyên sâu: GLG Yoga School cung cấp các chương trình đào tạo Huấn luyện viên Yoga đạt chuẩn quốc tế (YTTC 200h – 300h – 500h – 800h – 1.000h – Cao đẳng – Đại học và sau Đại học), kết hợp giữa nền tảng học thuật vững chắc và kỹ năng thực tiễn chuyên sâu, giúp học viên phát triển toàn diện từ tri thức đến nghề nghiệp. Với đội ngũ Giáo sư, Phó Giáo sư, Tiến sĩ và Master Yoga sở hữu chứng chỉ RYT500, E-RYT500 cùng nhiều năm kinh nghiệm giảng dạy trong và ngoài nước, GLG Yoga School cam kết mang đến môi trường học tập chuyên nghiệp – sáng tạo – truyền cảm hứng cho những ai mong muốn trở thành Huấn luyện viên Yoga quốc tế.', address: '1081 Ngô Quyền, P. An Hải, Q. Ngũ Hành Sơn', city: 'Đà Nẵng', hours: 'Thứ 2 - Chủ Nhật (05h00 - 18h00)', types: ['Yoga'], amenities: ['Yoga Cộng Đồng', 'Đào tạo Huấn luyện viên Yoga', 'Cơ sở vật chất hiện đại', 'Phòng thay đồ & Tủ khóa', 'Bãi đỗ xe miễn phí', 'Khu vực thư giãn & Pantry'], cover: '/assets/partners/covers/glg-yoga-school.webp' },
  { id: 'danava-partner-5', name: 'Kiến Gym', logo: '/assets/partners/kien-gym.webp', url: 'https://danava.vn/places/kien-gym-hoa-xuan', projectId: '', role: 'Gym & Fitness', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Kiến Gym Hoà Xuân', description: 'KIẾN GYM HÒA XUÂN – NƠI BẮT ĐẦU HÀNH TRÌNH THAY ĐỔI BẢN THÂN Kiến Gym là Câu lạc bộ Gym với hệ thống máy móc hiện đại, không gian rộng rãi, sạch sẽ và thoáng mát, mang đến môi trường tập luyện thoải mái cho mọi hội viên. Chúng tôi luôn duy trì mức giá công khai, minh bạch và thuộc nhóm cạnh tranh nhất tại khu vực Hòa Xuân, giúp nhiều người dễ dàng tiếp cận việc tập luyện. Với cộng đồng hội viên đông đảo đã gắn bó trong nhiều năm, Kiến Gym không chỉ là nơi rèn luyện sức khỏe mà còn là nơi truyền động lực để mỗi người kiên trì theo đuổi mục tiêu của mình. Dù bạn muốn giảm cân, tăng cơ, cải thiện sức khỏe hay nâng cao thể lực, Kiến Gym luôn sẵn sàng đồng hành cùng bạn trên từng chặng đường. Kiến Gym – Tập luyện hiệu quả, chi phí hợp lý, môi trường thân thiện và đáng tin cậy.', address: '588 Đường 29 Tháng 3 Hòa Xuân', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7: 5h00 -20h30 - Chủ Nhật : 6h00 -10h00 & 14h00 -19h00', types: ['Gym'], amenities: ['Trang thiết bị tập luyện hiện đại', 'Huấn luyện viên cá nhân chuyên nghiệp', 'Khu vực tập luyện rộng rãi', 'đa dạng', 'Phòng thay đồ và tắm sạch sẽ', 'Bãi đỗ xe miễn phí', 'thuận tiện', 'Khung giờ tập luyện linh hoạt'], cover: '/assets/partners/covers/kien-gym-hoa-xuan.webp' },
  { id: 'danava-partner-3', name: 'Liên Minh Yoga Việt Nam', logo: '/assets/partners/lien-minh-yoga-viet-nam.webp', url: 'https://danava.vn/places/lien-minh-yoga-viet-nam', projectId: '', role: 'Yoga', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Liên Minh Yoga Việt Nam', description: 'Trung tâm Yoga chuyên sâu về chăm sóc sức khỏe, tiên phong nghiên cứu và ứng dụng các phương pháp phục hồi tự nhiên. Chúng tôi đào tạo đội ngũ Huấn luyện viên Yoga trị liệu với nền tảng kiến thức chuyên môn vững chắc, góp phần lan tỏa giá trị sống khỏe và bền vững đến cộng đồng.', address: 'Số 1 Ngõ 92. Âu Cơ, Hồng Hà, Hà Nội', city: 'Hà Nội', hours: 'Thứ 2 - Thứ 7 (05h00 - 22h00)', types: ['Yoga'], amenities: ['Đào tạo HLV Yoga', 'Chứng chỉ uy tín', 'Giảng viên chuyên môn cao', 'Kết nối cộng đồng Yoga', 'Yoga trị liệu chuyên sâu', 'Hội thảo & tập huấn thường xuyên'], cover: '/assets/partners/covers/lien-minh-yoga-viet-nam.webp' },
  { id: 'danava-partner-12', name: 'Fuji Swimming Club DaNang', logo: '/assets/partners/fuji-swimming-club-danang.webp', url: 'https://danava.vn/places/fuji-swimming-club-da-nang', projectId: '', role: 'Câu lạc bộ bơi lội', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026). Liên kết trong khối đó (/places/fuji-swimming-club-danang) trả 404; trang đúng là /places/fuji-swimming-club-da-nang.', fullName: 'Fuji Swimming Club Da Nang', description: 'Fuji Swimming Club và Saginuma Swimming Club được thành lập bởi tập đoàn S&F Group Nhật Bản, với mục đích đưa bơi lội đến gần với mọi người và làm giảm những tai nạn đuối nước xảy ra. “健康康心 - Kentaikoushin” Mang ý nghĩa sống khỏe mạnh và an vui.', address: 'Tầng 5, Tòa nhà FHOME, 16 Lý Thường Kiệt, Hải Châu, TP. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 – Thứ 7: 05:30 – 09:30 & 13:30 – 19:15 [Chủ nhật: 05:30 – 09:30 & 13:30 – 18:00]', types: ['Swimming'], amenities: ['Hồ bơi trong nhà hiện đại', 'Huấn luyện viên chuyên nghiệp', 'Phòng tắm & thay đồ tiện nghi', 'Tủ đồ cá nhân an toàn', 'Khu vực chờ cho phụ huynh', 'Đặt lịch & quản lý lớp học tiện lợi'], cover: '/assets/partners/covers/fuji-swimming-club-da-nang.webp' },
  { id: 'danava-partner-6', name: 'TAM TAY GYM', logo: '/assets/partners/tam-tay-gym.webp', url: 'https://danava.vn/places/tamtay-gym', projectId: '', role: 'Gym & Fitness', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'TamTay Gym', description: 'Community Đà Nẵng isn\'t just a gym—it\'s a lifestyle that connects people, inspires healthy living, and empowers a longer, happier life. ⭐', address: '11 An Thượng 3, Ngũ Hành Sơn, Đà Nẵng', city: 'Đà Nẵng', hours: '7:00 AM - 9:00 PM', types: ['Gym'], amenities: ['Thiết bị tập hiện đại', 'Phòng tập máy lạnh', 'Phòng tắm nước nóng', 'Khăn tập miễn phí', 'Smoothie dinh dưỡng', 'Không gian sạch sẽ', 'chuyên nghiệp'], cover: '/assets/partners/covers/tamtay-gym.webp' },
  { id: 'danava-partner-4', name: 'Yoga Club Vietnam', logo: '/assets/partners/yoga-club-vietnam.webp', url: 'https://danava.vn/places/yoga-club-vietnam', projectId: '', role: 'Yoga cộng đồng', relation: 'partner', verified: true, permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Yoga Club Vietnam', description: 'Yoga Club Vietnam ra đời với mục tiêu kết nối cộng đồng yêu Yoga trên toàn quốc. Yoga Club Vietnam là nơi kết nối giao lưu giữa các Câu lạc bộ. Huấn luyện viên và tất cả những người yêu Yoga. Nhằm giúp mọi người dễ dàng tìm kiếm những thông tin về Yoga, kết nối, giao lưu, học hỏi, chia sẻ những kinh nghiệm, kiến thức về Yoga.', address: '1081 Ngô Quyền, P. An Hải, Sơn Trà, Tp. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (08h00 - 17h00)', types: ['Yoga'], amenities: ['Phòng tập rộng thoáng', 'Giáo viên chứng chỉ quốc tế', 'Thảm & dụng cụ miễn phí', 'Phòng thay đồ & tủ khoá', 'Nước uống miễn phí', 'Bãi giữ xe'], cover: '/assets/partners/covers/yoga-club-vietnam.webp' },
  { id: 'danava-partner-2', name: 'DYF', logo: '/assets/partners/dyf.webp', url: 'https://danava.vn/places/lien-doan-yoga-thanh-pho-da-nang', projectId: '', role: 'Yoga & Fitness', relation: 'partner', verified: true, permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Liên Đoàn Yoga Thành Phố Đà Nẵng', description: 'Liên đoàn Yoga thành phố Đà Nẵng được UBND thành phố Đà Nẵng quyết định thành lập nhằm mục đích tập hợp, đoàn kết hội viên, bảo vệ quyền và lợi ích hợp pháp của hội viên, hỗ trợ nhau hoạt động có hiệu quả nhằm thúc đẩy phong trào tập luyện, thi đấu môn thể thao Yoga, rèn luyện ý chí, phẩm chất đạo đức, nâng cao sức khỏe, phát triển tài năng thể thao Yoga; góp phần vào việc phát triển kinh tế - xã hội của thành phố và quốc gia.', address: '330 Tôn Đức Thắng, Hòa Khánh', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (8:30 - 16:30)', types: ['Yoga'], amenities: ['Đào tạo Huấn luyện viên Yoga chuyên nghiệp', 'Đào tạo chuyên đề & nâng cao', 'Kết nối cộng đồng & hội viên', 'Giải đấu & sự kiện Yoga', 'Chứng nhận & phát triển nghề nghiệp', 'Hỗ trợ tư vấn & kết nối hợp tác'], cover: '/assets/partners/covers/lien-doan-yoga-thanh-pho-da-nang.webp' },
  { id: 'danava-partner-13', name: 'Học Viện Quốc Tế Yoga Ngọc Bích', logo: '/assets/partners/hoc-vien-quoc-te-yoga-ngoc-bich.webp', url: 'https://danava.vn/places/hoc-vien-quoc-te-yoga-ngoc-bich', projectId: '', role: 'Yoga', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Học Viện Quốc Tế Yoga Ngọc Bích', description: 'Học viện Quốc tế Yoga Ngọc Bích đồng hành cùng học viên trên hành trình khỏe thân – an tâm – sống cân bằng . Học viện chuyên đào tạo HLV Yoga 200H – 500H, cấp chứng chỉ quốc tế ; tổ chức các lớp Yoga cộng đồng từ cơ bản đến nâng cao , Yoga trị liệu – phục hồi vai gáy, lưng, thần kinh tọa . Bên cạnh đó, Học viện cung cấp PT 1-1, lớp nhóm nhỏ và chương trình Yoga dành cho văn phòng, doanh nghiệp , phù hợp với nhiều nhu cầu và thể trạng. Yoga cho mọi người – từ cơ bản đến chuyên sâu, từ luyện tập đến phục hồi và phát triển nghề nghiệp.', address: 'Số 02 Thanh Hải, Hải Châu, thành phố Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Chủ Nhật (05h00 - 21h00)', types: ['Yoga'], amenities: ['Yoga Cơ Bản', 'Yoga Trị Liệu', 'Đào Tạo HLV 200H–500H', 'PT Yoga 1-1', 'Yoga Văn Phòng', 'Yoga Cộng Đồng'], cover: '/assets/partners/covers/hoc-vien-quoc-te-yoga-ngoc-bich.webp' },
  { id: 'danava-partner-11', name: 'TIGI YOGA', logo: '/assets/partners/tigi-yoga.webp', url: 'https://danava.vn/places/tigi-yoga', projectId: '', role: 'Yoga', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'TIGI YOGA', description: 'TiGi Yoga là không gian dành cho những ai mong muốn rèn luyện sức khỏe, nuôi dưỡng sự bình an và phát triển bản thân. Với đội ngũ giảng viên tận tâm cùng chương trình học đa dạng từ cơ bản đến nâng cao, TiGi Yoga đồng hành cùng học viên trên hành trình xây dựng một cơ thể khỏe mạnh, tinh thần vững vàng và lối sống cân bằng.', address: '53 Thái Sanh Hạnh, Phường Mỹ Phong, Đồng Tháp', city: 'Đồng Tháp', hours: 'Thứ 2 - Thứ 7 (05:00-20:00)', types: ['Yoga'], amenities: ['Lớp học Yoga', 'HLV tận tâm', 'Đặt Lịch online', 'Gói tập linh hoạt', 'Cộng đồng yoga', 'Không gian thư giãn'], cover: '/assets/partners/covers/tigi-yoga.webp' },
  // Địa điểm công khai trên danava.vn/places (32 địa điểm ngoài khối “Đối tác đồng hành”), lấy ngày 19/11/2026
  { id: 'danava-place-origin-yoga', name: 'Origin Yoga', logo: '/assets/partners/places/origin-yoga.webp', url: 'https://danava.vn/places/origin-yoga', projectId: '', role: 'Yoga', relation: 'place', verified: true, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'ORIGIN YOGA là không gian thực hành Yoga cổ điển tại Đà Nẵng, nơi tư thế, hơi thở và thiền được kết hợp trong từng buổi tập. Từ nền tảng Yoga nguyên bản, chúng tôi hướng đến xây dựng một hệ sinh thái thực hành và đào tạo Yoga, thiền, luyện thở, phục hồi vận động cột sống và chăm sóc sức khỏe toàn diện.', address: '198 đường 30/4, P. Hòa Cường, Tp. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (5h00 - 19h00)', types: ['Yoga'], amenities: ['Lớp Yoga Cổ Điển & Cộng Đồng', 'Không gian Thiền & Luyện Thở', 'Yoga Phục Hồi Vận Động Cột Sống', 'Kèm Cá Nhân 1:1 Chuyên Biệt', 'Gói Tập Đa Dạng & Linh Hoạt', 'Hệ Sinh Thái Sức Khỏe Toàn Diện'], cover: '/assets/partners/covers/origin-yoga.webp' },
  { id: 'danava-place-aura-yoga', name: 'AURA YOGA', logo: '/assets/partners/places/aura-yoga.webp', url: 'https://danava.vn/places/aura-yoga', projectId: '', role: 'Yoga', relation: 'place', verified: true, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'AURA YOGA – nơi bạn trở về với chính mình. Chuyển động • Thở sâu • Cảm nhận cơ thể. 🧘‍♀️ Giữa nhịp sống bận rộn, hãy dành một chút thời gian để lắng nghe, chăm sóc và yêu thương bản thân nhiều hơn. Tại AURA YOGA , mỗi buổi tập không chỉ giúp cơ thể khỏe mạnh, dẻo dai mà còn mang đến sự thư thái, cân bằng và nguồn năng lượng tích cực trong cuộc sống. Không cần phải hoàn hảo hay có kinh nghiệm, chỉ cần bạn sẵn sàng bắt đầu. AURA sẽ đồng hành cùng bạn trên hành trình chăm sóc sức khỏe thể chất và tinh thần mỗi ngày. BẮT ĐẦU HÔM NAY CÙNG AURA YOGA! Liên hệ AURA để được tư vấn và lựa chọn lớp học phù hợp. Hành trình sống khỏe và cân bằng bắt đầu từ chính bạn.', address: '134 Lê Cảnh Tuân, Sơn Trà, Đà Nẵng', city: 'Đà Nẵng', hours: '05:00 - 20:00', types: ['Yoga'], amenities: ['Tập Yoga', 'Rèn luyện thể lực', 'Nạp năng lượng', 'Động lực tập luyện', 'Hướng dẫn tận tình', 'Thư giãn tinh thần'], cover: '/assets/partners/covers/aura-yoga.webp' },
  { id: 'danava-place-52-fit', name: '52 FIT', logo: '/assets/partners/places/52-fit.webp', url: 'https://danava.vn/places/52-fit', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', city: 'Cà Mau', types: ['Gym'], cover: '/assets/partners/covers/52-fit.webp' },
  { id: 'danava-place-dc-fitness', name: 'DC Fitness Center', logo: '/assets/partners/places/dc-fitness.webp', url: 'https://danava.vn/places/dc-fitness', projectId: '', role: 'Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Tổ hợp Gym, Boxing, Yoga, Dance, GroupX, Pilates, Swimming tại Đà Nẵng', address: '340 - 342 Điện Biên Phủ, Thanh Khê, Đà Nẵng', city: 'Đà Nẵng', types: ['Fitness'], amenities: ['Phòng tập chuyên biệt', 'Khu Gym hiện đại', 'Tủ đồ cá nhân', 'Phòng tắm & thay đồ', 'Đặt lịch tập trực tuyến', 'Huấn luyện viên cá nhân'], cover: '/assets/partners/covers/dc-fitness.webp' },
  { id: 'danava-place-elite-premium-pilates', name: 'Elite Premium Pilates', logo: '/assets/partners/places/elite-premium-pilates.webp', url: 'https://danava.vn/places/elite-premium-pilates', projectId: '', role: 'Pilates', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'ELITE PREMIUM PILATES – CHĂM SÓC VÓC DÁNG, NÂNG TẦM TRẢI NGHIỆM Elite Premium Pilates mang đến không gian tập luyện hiện đại, tinh tế và riêng tư tại TP.HCM. Với đội ngũ huấn luyện viên được đào tạo bài bản cùng hệ thống máy tập chuyên dụng, Elite chú trọng hướng dẫn kỹ thuật và xây dựng lộ trình phù hợp với thể trạng, mục tiêu của từng học viên. Dịch vụ tập luyện • Private 1:1: Huấn luyện cá nhân, hướng dẫn sát sao theo mục tiêu riêng. • Duo 1:2: Tập luyện theo cặp, kết hợp sự đồng hành và hướng dẫn chuyên môn. • Group 1:5: Lớp nhóm nhỏ, tăng cảm hứng vận động và tối ưu chi phí.', address: '449/23 Sư Vạn Hạnh, Phường 12, Quận 10, TP. Hồ Chị Minh', city: 'Hồ Chí Minh', types: ['Pilates'], amenities: ['Không gian hiện đại', 'riêng tư', 'Hệ thống máy Pilates chuyên dụng', 'Huấn luyện viên hướng dẫn sát sao', 'Giáo án cá nhân hóa', 'Theo dõi tiến trình tập luyện', 'Đăng ký trải nghiệm trực tuyến'], cover: '/assets/partners/covers/elite-premium-pilates.webp' },
  { id: 'danava-place-feeling-yoga', name: 'FEELING YOGA', logo: '/assets/partners/places/feeling-yoga.webp', url: 'https://danava.vn/places/feeling-yoga', projectId: '', role: 'Yoga', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Học viện Feeling Yoga là một trong những trung tâm yoga hàng đầu tại Việt Nam, chuyên cung cấp các khóa học yoga đa dạng và chất lượng cao. Với đội ngũ giảng', address: 'Số 89, Nguyễn Quang Minh, Thị Trấn Thiệu Hoá, Huyện Thiệu Hoá, Thanh Hoá.', city: 'Thanh Hóa', hours: '08:00 - 21:00', types: ['Yoga'], amenities: ['Yoga đa dạng', 'Giảng viên chất lượng', 'Giờ linh hoạt', 'Không gian tĩnh lặng', 'Tăng cường sức khỏe', 'Hỗ trợ nhanh chóng'], cover: '/assets/partners/covers/feeling-yoga.webp' },
  { id: 'danava-place-hoc-vien-dao-tao-hlv-yoga-sy', name: 'Học viên đào tạo HLV Yoga SY', logo: '/assets/partners/places/hoc-vien-dao-tao-hlv-yoga-sy.webp', url: 'https://danava.vn/places/hoc-vien-dao-tao-hlv-yoga-sy', projectId: '', role: 'Yoga', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Học viện Đào tạo HLV Yoga SY chuyên đào tạo giáo viên Yoga theo chuẩn quốc tế từ 200h–500h. Với đội ngũ giảng viên uy tín, bằng cấp giá trị toàn cầu, SY cam kết mang đến kiến thức vững chắc và kỹ năng chuyên sâu, giúp học viên trở thành HLV Yoga chuyên nghiệp.', address: '117/80/Đường Hồ Văn Long, Phường Bình Tân, TP.HCM', city: 'Hồ Chí Minh', hours: 'Thứ 2 - Thứ 7 (05h00 - 18h00)', types: ['Yoga'], amenities: ['Đào tạo Giáo viên Yoga chuyên nghiệp', 'Giáo trình chuẩn', 'bài bản', 'Giảng viên giàu kinh nghiệm', 'Thực hành chuyên sâu', 'Chứng nhận sau tốt nghiệp', 'Hỗ trợ phát triển nghề nghiệp'], cover: '/assets/partners/covers/hoc-vien-dao-tao-hlv-yoga-sy.webp' },
  { id: 'danava-place-huong-sen-yoga-academy', name: 'Hương Sen Yoga Academy', logo: '/assets/partners/places/huong-sen-yoga-academy.webp', url: 'https://danava.vn/places/huong-sen-yoga-academy', projectId: '', role: 'Yoga', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Hương Sen Yoga-tìm về chính mình ở một “bản thể” an lành và phúc lạc…Namaste!', address: 'Thái Lai, Bà Nà, Đà Nẵng', city: 'Đà Nẵng', hours: '5h-20h00', types: ['Yoga'], amenities: ['Lớp cộng đồng 5h00-6h00', 'Lớp cộng đồng 19h00-20h00', 'Lớp kèm nhóm 6h15-7h15', 'Lớp kèm nhóm 7h30-8h30', 'Lớp kèm nhóm 17h45-18h45'], cover: '/assets/partners/covers/huong-sen-yoga-academy.webp' },
  { id: 'danava-place-kien-gym-au-co', name: 'Kiến Gym Âu Cơ', logo: '/assets/partners/places/kien-gym-au-co.webp', url: 'https://danava.vn/places/kien-gym-au-co', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Kiến Gym Âu Cơ là một trong những phòng tập thể hình uy tín tại Đà Nẵng, được đông đảo học viên tin tưởng lựa chọn nhờ không gian tập luyện rộng rãi, hệ thống trang thiết bị hiện đại và môi trường chuyên nghiệp, thân thiện. Phòng tập phù hợp với mọi đối tượng, từ người mới bắt đầu đến những người đã có kinh nghiệm, mang đến điều kiện lý tưởng để rèn luyện sức khỏe, cải thiện vóc dáng và nâng cao thể lực một cách hiệu quả.', address: '151 Âu Cơ, Liên Chiểu', city: 'Đà Nẵng', hours: 'T2-T7: 5h-20h30, CN: 6h-10h30, 14h-19h', types: ['Gym'], amenities: ['Thiết bị hiện đại', 'PT chuyên nghiệp', 'Không gian rộng rãi', 'Phòng tắm tiện nghi', 'Gửi xe miễn phí', 'Giờ tập linh hoạt'], cover: '/assets/partners/covers/kien-gym-au-co.webp' },
  { id: 'danava-place-kien-gym-le-van-hien', name: 'Kiến Gym Lê Văn Hiến', logo: '/assets/partners/places/kien-gym-le-van-hien.webp', url: 'https://danava.vn/places/kien-gym-le-van-hien', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Kiến Gym là phòng tập hiện đại với không gian rộng rãi, trang thiết bị chất lượng và môi trường tập luyện năng động, thân thiện. Không chỉ được nhiều khách hàng trong nước tin tưởng lựa chọn, Kiến Gym còn là điểm đến của nhiều khách hàng nước ngoài đang sinh sống và làm việc tại khu vực. Với đội ngũ huấn luyện viên tận tâm, luôn sẵn sàng hỗ trợ bằng cả tiếng Việt và tiếng Anh cơ bản, chúng tôi mong muốn mang đến trải nghiệm tập luyện thoải mái, chuyên nghiệp và hiệu quả cho mọi học viên. Dù mục tiêu của bạn là giảm mỡ, tăng cơ hay nâng cao sức khỏe, Kiến Gym luôn đồng hành để giúp bạn chinh phục phiên bản tốt nhất của chính mình. Kiến Gym – Build Your Best.', address: 'Lô 22-23 Lê Văn Hiến, phường Ngũ Hành Sơn, Thành phố Đà Nẵng', city: 'Đà Nẵng', hours: 'T2-T7: 5h-20h30, CN: 6h-10h30, 14h-19h', types: ['Gym'], amenities: ['Thiết bị hiện đại', 'PT chuyên nghiệp', 'Không gian rộng rãi', 'Phòng tắm tiện nghi', 'Gửi xe miễn phí', 'Giờ tập linh hoạt'], cover: '/assets/partners/covers/kien-gym-le-van-hien.webp' },
  { id: 'danava-place-king-kong-gym', name: 'King Kong Gym', logo: '/assets/partners/places/king-kong-gym.webp', url: 'https://danava.vn/places/king-kong-gym', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Hệ thống phòng Gym 9 cơ sở : https://kingkonglagym.vn/phong-tap/', address: '236/12/9 Điện Biên Phủ, P.17, Q.Bình Thạnh, TP.HCM, Binh Thanh, Vietnam', city: 'Hồ Chí Minh', hours: '08:00 - 21:00', types: ['Gym'], amenities: ['Tập Gym hiện đại', 'Lớp Yoga chuyên sâu', 'Huấn luyện viên 1:1', 'Phòng tắm nóng lạnh', 'Giữ xe miễn phí', 'Nước uống miễn phí'], cover: '/assets/partners/covers/king-kong-gym.webp' },
  { id: 'danava-place-la-pilates', name: 'LA PILATES', logo: '/assets/partners/places/la-pilates.webp', url: 'https://danava.vn/places/la-pilates', projectId: '', role: 'Pilates', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'La pilates Vietnam là studio Pilates đến từ Nhật Bản. Trong buổi tập 1:1, huấn luyện viên kết hợp kỹ thuật trị liệu màng xương (骨膜整体®) với bài tập Pilates trên máy, điều chỉnh theo tư thế và mục tiêu của từng khách. Studio có 4 máy tập.', address: '3rd Floor, AN VUI Building, 111C Lý Chính Thắng Street, Xuân Hòa Ward', city: 'Hồ Chí Minh', hours: '9:00 – 18:00', types: ['Pilates'], amenities: ['Tập luyện 1:1 chuyên biệt (Private Training)', 'Trị liệu màng xương độc quyền Nhật Bản (骨膜整体®)', 'Hệ thống máy tập Pilates cao cấp', 'Gói dịch vụ đa dạng & Linh hoạt', 'Chính sách bảo lưu tối đa 180 ngày', 'Đội ngũ đa ngôn ngữ & Đặt lịch chủ động'], cover: '/assets/partners/covers/la-pilates.webp' },
  { id: 'danava-place-luna-spa-phuoc-buu-xuyen-moc', name: 'LUNA SPA (Phước Bữu, Xuyên Mộc)', logo: '/assets/partners/places/luna-spa-phuoc-buu-xuyen-moc.webp', url: 'https://danava.vn/places/luna-spa-phuoc-buu-xuyen-moc', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Chăm sóc da khoa học.Dược mỹ phẩm Châu Âu 0372.139.539', address: '22 Lê Lợi, Phước Hoà, TT.Phước Bữu, Huyện Xuyên Mộc, Tỉnh Bà Rịa - Vũng Tàu, Ba Ria, Vietnam', city: 'Hồ Chí Minh', hours: '08:00-21:00', types: ['Spa'], amenities: ['Chăm sóc da', 'Dược mỹ phẩm', 'Soi da khoa học', 'Massage thư giãn', 'Trị liệu chuyên sâu', 'Cấp ẩm chuyên sâu'], cover: '/assets/partners/covers/luna-spa-phuoc-buu-xuyen-moc.webp' },
  { id: 'danava-place-masa-one-hyrox-club', name: 'MASA ONE HYROX CLUB', logo: '/assets/partners/places/masa-one-hyrox-club.webp', url: 'https://danava.vn/places/masa-one-hyrox-club', projectId: '', role: 'Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'MASA ONE HYROX CLUB là trung tâm thể hình và chăm sóc sức khỏe theo phong cách Nhật Bản tại Hà Nội. Trung tâm mang đến các chương trình tập luyện cá nhân hóa, giúp khách hàng nâng cao thể lực, cải thiện vóc dáng, tăng cường sức khỏe và thư giãn cơ thể.', address: 'Toà L10 445 Đội Cấn, Ngọc Hà, Ba Đình, Hà Nội', city: 'Hà Nội', hours: '06h00 - 20h00', types: ['Fitness'], amenities: ['Personal Training (PT 1:1): Huấn luyện cá nhân theo mục tiêu'], cover: '/assets/partners/covers/masa-one-hyrox-club.webp' },
  { id: 'danava-place-mermaid-wellness-xm', name: 'MERMAID WELLNESS XM', logo: '/assets/partners/places/mermaid-wellness-xm.webp', url: 'https://danava.vn/places/mermaid-wellness-xm', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Hành trình nghĩ dưỡng mang lại sự thanh khiết trong tâm hồn, hành trình tìm lại sự bình an và cảm hứng trong cuộc sống giữa thiên nhiên tuyệt đẹp của Bà Rịa - Vũng Tàu.', address: 'Khu rừng sinh thái, ấp Nhơn Hoà, Xuyên Mộc, Bà Rịa - Vũng Tàu, Xuyen Mộc, Bà Rịa–Vũng Tàu Province, Vietnam', city: 'Hồ Chí Minh', hours: '24/7', types: ['Spa'], amenities: ['Yoga thanh lọc', 'Nghỉ dưỡng thiên nhiên', 'Thiền định sâu', 'Tập thử miễn phí', 'Không gian biển', 'Chăm sóc sức khỏe'], cover: '/assets/partners/covers/mermaid-wellness-xm.webp' },
  { id: 'danava-place-muberry-whale', name: 'Muberry Whale', logo: '/assets/partners/places/muberry-whale.webp', url: 'https://danava.vn/places/muberry-whale', projectId: '', role: 'Pilates', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Nhà sáng lập Joy (Yến Thị Trần) là chuyên gia trong lĩnh vực sức khỏe và vận động với hơn 8 năm kinh nghiệm, đồng thời là nhà sáng lập Mer Studio Hanoi – một hệ thống Pilates và Yoga tập trung vào cải thiện tư thế, phục hồi chấn thương và sức khỏe vận động lâu dài. Hiện là nhà sáng lập MULBERRY WHALE – PTM Recovery Movement System. Được đào tạo và sở hữu nhiều chứng chỉ chuyên môn trong các lĩnh vực Therapeutic Pilates, Yoga, Giải phẫu học, Khoa học vận động, Sơ cấp cứu và Corrective Exercise; trong đó có chứng chỉ Corrective Exercise Specialist (NASM-CES)do Học viện Y học Thể thao Quốc gia Hoa Kỳ (National Academy of Sports Medicine – NASM) cấp. Đồng thời hoàn thành chương trình thực tập lâm sàng 3 tuần về Vật lý trị liệu dưới sự hướng dẫn của André Rubendunst, góp phần củng cố cách tiếp cận dựa trên bằng chứng trong đánh giá vận động, phục hồi chức năng và xây dựng chương trình can thiệp. Có kinh nghiệm trong chăm sóc cá nhân hóa, giáo dục khách hàng và phân tích cơ sinh học vận động, với định hướng chuyên môn gắn liền cùng các nguyên lý của Vật lý trị liệu. Hiện đang tiếp tục theo đuổi con đường Vật lý trị liệu nhằm đào sâu kiến thức lâm sàng và mở rộng năng lực chuyên môn. Trong hơn 8 năm qua, đã đồng hành cùng nhiều khách hàng cải thiện tư thế và hỗ trợ giải quyết nhiều vấn đề cơ xương khớp như đau lưng, giảm đau và căng thẳng, chuẩn bị trước và phục hồi sau sinh, viêm khớp và các bệnh lý khớp khác, cũng như phục hồi và phòng ngừa chấn thương. https://mulberrywhale.com', address: 'Tầng 5. 507 Đường Âu Cơ, Tây Hồ, Hà Nội', city: 'Hà Nội', hours: '9:00 AM-6:00 PM Các ngày trong tuần', types: ['Pilates'], amenities: ['Therapeutic Pilates', 'Đánh giá tư thế & vận động', 'Corrective Exercise', 'Phục hồi cơ xương khớp', 'Huấn luyện cá nhân 1:1', 'Yoga trị liệu & phục hồi'], cover: '/assets/partners/covers/muberry-whale.webp' },
  { id: 'danava-place-ngoc-hue-wellness', name: 'Ngoc Hue Wellness', logo: '/assets/partners/places/ngoc-hue-wellness.webp', url: 'https://danava.vn/places/ngoc-hue-wellness', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Khách hàng hài lòng là thành công của chúng tôi Với đội ngũ kỹ thuật viên có chuyên môn cao, được đào tạo chuyên nghiệp, cơ sở vật chất đáp ứng tiêu chuẩn 5 sao. Ngoc Hue Wellness sở hữu các phòng VIP và phòng lưu trú cho các khách hàng ở xa, khu trưng bày cổ vật vô cùng tiện nghi và thoải mái. Nếu bạn yêu thích không khí thiên nhiên thì Ngoc Hue Wellness có khu nghỉ dưỡng và trị liệu sức khỏe cao cấp tại TP.Bảo Lộc, tỉnh Lâm Đồng cùng nhiều tiện ích khác, giúp bạn hưởng một bầu không khí trong lành của núi rừng Tây Nguyên, sử dụng các sản phẩm hữu cơ, âm nhạc của tự nhiên… giúp bạn tái tạo năng lượng và sảng khoái tinh thần. Chúng tôi mong muốn trở thành nhà cung cấp dịch vụ chăm sóc sức khoẻ – sắc đẹp toàn diện, hướng đến trở thành một mô hình chuẩn mực và tiên phong trong lĩnh vực dịch vụ làm đẹp thị trường Việt Nam.', address: '27 Cô Bắc, Cầu Ông Lãnh, Hồ Chí Minh', city: 'Hồ Chí Minh', hours: '08:00–21:00', types: ['Spa'], amenities: ['Quét sức khỏe AI', 'Thông kinh lạc', 'Trị liệu cổ vai gáy', 'Giảm cân Đông y', 'Thải độc đầu', 'Tắm thuốc Dao đỏ'], cover: '/assets/partners/covers/ngoc-hue-wellness.webp' },
  { id: 'danava-place-no-limits-fitness-yoga-center-ngu-hanh-son', name: 'No Limits Fitness & Yoga Center - Ngũ Hành Sơn', logo: '/assets/partners/places/no-limits-fitness-yoga-center-ngu-hanh-son.webp', url: 'https://danava.vn/places/no-limits-fitness-yoga-center-ngu-hanh-son', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'No Limits Fitness & Yoga Hệ thống phòng tập tại Đà Nẵng dành cho khách hàng muốn thay đổi vóc dáng, nâng cấp sức khỏe và xây dựng phong cách sống kỷ luật hơn. 𝐍𝐎 𝐋𝐈𝐌𝐈𝐓𝐒 𝐅𝐈𝐓𝐍𝐄𝐒𝐒 & 𝐘𝐎𝐆𝐀 𝐂𝐄𝐍𝐓𝐄𝐑 Địa chỉ cơ sở 1: 162 Huỳnh Ngọc Huệ - Thanh Khê - Đà Nẵng Địa chỉ cơ sở 2: 233 Nguyễn Công Trứ - Sơn Trà - Đà Nẵng Địa chỉ cơ sở 3: 23 Nam Kỳ Khởi Nghĩa - Ngũ Hành Sơn - Đà Nẵng Địa chỉ cơ sở 4: 256 Võ Nguyên Giáp - Sơn Trà - Đà Nẵng Hotline: 0902.698.896 - 0983.434.562', address: '23 Nam Kỳ Khởi Nghĩa, Ngũ Hành Sơn, Đà Nẵng', city: 'Đà Nẵng', hours: '05:00–20:30', types: ['Gym'], amenities: ['Phòng Gym hiện đại', 'Lớp Yoga đa dạng', 'Huấn luyện viên cá nhân', 'Lớp tập nhóm sôi động', 'Đặt lịch tập dễ dàng', 'Theo dõi tiến độ'], cover: '/assets/partners/covers/no-limits-fitness-yoga-center-ngu-hanh-son.webp' },
  { id: 'danava-place-nui-do', name: 'Núi Đỏ Wellness', logo: '/assets/partners/places/nui-do.webp', url: 'https://danava.vn/places/nui-do', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Núi Đỏ Wellness & Recovery hướng đến không gian chăm sóc sức khỏe, thư giãn và phục hồi, giúp bạn tái tạo năng lượng, tìm lại sự cân bằng giữa cơ thể và tinh thần sau những ngày bận rộn.', address: 'Số 2, Vùng Trung 2, Phú Mỹ An, Ngũ Hành Sơn, Đà Nẵng', city: 'Đà Nẵng', types: ['Spa'], amenities: ['Không gian thư giãn', 'Massage thư giãn cơ thể', 'Xông hơi phục hồi', 'Ngâm lạnh phục hồi sau vận động', 'Chăm sóc sức khỏe cá nhân', 'Phòng tắm và khu thay đồ'], cover: '/assets/partners/covers/nui-do.webp' },
  { id: 'danava-place-oneness-retreats', name: 'Oneness Retreat', logo: '/assets/partners/places/oneness-retreats.webp', url: 'https://danava.vn/places/oneness-retreats', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Oneness Retreat Da Nang is at Oneness Retreat Da Nang.', address: '30 Chính Hữu, An Hải, Da Nang, Vietnam, 550000', city: 'Đà Nẵng', hours: '08:00 - 21:00', types: ['Spa'], amenities: ['Yoga trị liệu', 'Fitness hiện đại', 'Không gian retreat', 'Đốt cháy mỡ thừa', 'Giảm căng thẳng', 'Thiền định sâu'], cover: '/assets/partners/covers/oneness-retreats.webp' },
  { id: 'danava-place-pour-vous-pilates-viet-nam-villa', name: 'Pour Vous - Pilates Việt Nam ( Villa )', logo: '/assets/partners/places/pour-vous-pilates-viet-nam-villa.webp', url: 'https://danava.vn/places/pour-vous-pilates-viet-nam-villa', projectId: '', role: 'Pilates', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Pilates với phương pháp độc quyền giáo trình PMP@ Certificate Pilates bảo hộ bởi Pilates Vietnam Co., LTD.', address: '180C Hai Bà Trưng - P. Tân Định, Ho Chi Minh City, Vietnam', city: 'Hồ Chí Minh', hours: '08:00 - 21:00', types: ['Pilates'], amenities: ['Phương pháp PMP@', 'Cải thiện vóc dáng', 'Tập luyện chuyên sâu', 'Giảm đau lưng', 'Tăng độ dẻo dai', 'Thư giãn tinh thần'], cover: '/assets/partners/covers/pour-vous-pilates-viet-nam-villa.webp' },
  { id: 'danava-place-raja-yoga', name: 'Raja Yoga', logo: '/assets/partners/places/raja-yoga.webp', url: 'https://danava.vn/places/raja-yoga', projectId: '', role: 'Yoga', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'TRUNG TÂM RAJA Yoga & Therapy Đà Nẵng là nơi kết nối những người yêu Yoga, cùng rèn luyện sức khỏe, nuôi dưỡng sự bình yên và hướng đến cuộc sống cân bằng. Tọa lạc tại 02 Tiên Sơn 11, Hòa Cường Nam, Hải Châu, Đà Nẵng, trung tâm thường xuyên chiêu sinh học viên mới, chào đón bạn đến trải nghiệm và xây dựng thói quen tập luyện mỗi ngày. Liên hệ 0335 731 566 hoặc Fanpage RAJA Yoga & Therapy Đà Nẵng để được tư vấn lớp tập phù hợp.', address: '02 Tiên Sơn 11, Hòa Cường Nam, Đà Nẵng', city: 'Đà Nẵng', types: ['Yoga'], amenities: ['Lớp Yoga đa dạng cấp độ', 'Hướng dẫn cho người mới', 'Khung giờ tập linh hoạt', 'Không gian tập thư giãn', 'Dụng cụ tập luyện sẵn có', 'Tư vấn chọn lớp phù hợp'], cover: '/assets/partners/covers/raja-yoga.webp' },
  { id: 'danava-place-square-fitness', name: 'Square Fitness', logo: '/assets/partners/places/square-fitness.webp', url: 'https://danava.vn/places/square-fitness', projectId: '', role: 'Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'SQUARE FITNESS mang đến trải nghiệm tập luyện đa dạng với Gym, Yoga, Pilates, Dance, KickFit, GroupX/Functional và Personal Training . Chúng tôi đồng hành cùng bạn nâng cao thể lực, cải thiện vóc dáng và xây dựng lối sống khỏe mạnh, từng bước trở thành phiên bản tốt hơn của chính mình. SQUARE FITNESS – Trải nghiệm xứng tầm dịch vụ 5 sao', address: 'Số 3 đường 351, Quán Toan, Hồng Bàng, Hải Phòng', city: 'Hải Phòng', hours: 'T2-T7 (5:00-21:00) & CN từ (15:00 - 20:00)', types: ['Fitness'], amenities: ['Khu Gym hiện đại', 'Phòng tập chuyên biệt', 'Huấn luyện viên cá nhân', 'Tủ đồ cá nhân', 'Phòng tắm & thay đồ', 'Đặt lịch tập trực tuyến'], cover: '/assets/partners/covers/square-fitness.webp' },
  { id: 'danava-place-super-gym-tam-ky', name: 'Super Gym Tam Ky', logo: '/assets/partners/places/super-gym-tam-ky.webp', url: 'https://danava.vn/places/super-gym-tam-ky', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'SUPER GYM – Nâng tầm sức khỏe của bạn 💪 SUPER GYM mang đến không gian Fitness & Yoga hiện đại, năng động và chuyên nghiệp , đáp ứng đa dạng nhu cầu tập luyện từ cải thiện vóc dáng, tăng cường thể lực đến nâng cao sức khỏe mỗi ngày. Với trang thiết bị hiện đại cùng đội ngũ huấn luyện viên tận tâm, SUPER GYM luôn đồng hành để mỗi hội viên xây dựng thói quen tập luyện khoa học và đạt mục tiêu hiệu quả. 📍 CN1: 196 Huỳnh Thúc Kháng, Tam Kỳ, Quảng Nam 📍 CN2: 568 Cộng Hòa, P.13, TP.HCM SUPER GYM – Khỏe hơn • Đẹp hơn • Tự tin hơn mỗi ngày.', address: '196 Huỳnh Thúc Kháng, Tam Kỳ, Đà Nẵng', city: 'Đà Nẵng', hours: '08:00 - 21:00', types: ['Gym'], amenities: ['Tập Gym hiện đại', 'Lớp Yoga chuẩn', 'Đốt mỡ toàn thân', 'Tăng cơ tăng sức', 'Huấn luyện viên', 'Đăng ký tập thử'], cover: '/assets/partners/covers/super-gym-tam-ky.webp' },
  { id: 'danava-place-the-pool-gym', name: 'The Pool Gym', logo: '/assets/partners/places/the-pool-gym.webp', url: 'https://danava.vn/places/the-pool-gym', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Bài kiểm tra InBody test - Thước đo chỉ số cơ thể', address: 'Số 07 đường Trần Văn Trà, thị trấn Phước Bửu, huyện Xuyên Mộc, tỉnh Bà Rịa-Vũng Tàu, Xuyen Moc, Vietnam', city: 'Hồ Chí Minh', hours: '08:00 - 21:00', types: ['Gym'], amenities: ['Tập Gym hiện đại', 'Yoga cân bằng', 'Đốt mỡ thừa', 'Tăng sức mạnh', 'Cải thiện tim mạch', 'Hướng dẫn 1-1'], cover: '/assets/partners/covers/the-pool-gym.webp' },
  { id: 'danava-place-the-strong-gym', name: 'THE STRONG GYM', logo: '/assets/partners/places/the-strong-gym.webp', url: 'https://danava.vn/places/the-strong-gym', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'crossfit, aerobic, yoga, dance and strength exercise', address: 'Ấp 5, giá rai, Bạc Liêu', city: 'Cà Mau', hours: '08:00 - 21:00', types: ['Gym'], amenities: ['Tập Gym', 'Yoga', 'Cardio', 'Thể hình', 'Boxing', 'Thư giãn'], cover: '/assets/partners/covers/the-strong-gym.webp' },
  { id: 'danava-place-thuan-moc-spa-tri-lieu', name: 'Thuần Mộc SPA Trị Liệu', logo: '/assets/partners/places/thuan-moc-spa-tri-lieu.webp', url: 'https://danava.vn/places/thuan-moc-spa-tri-lieu', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Thuần Mộc Spa thư giãn trị liệu- Tinh hoa y học phương Đông-Chăm sóc sức khỏe', address: 'Phan Chu Trinh, Vũng Tàu, Hồ Chí Minh, Việt Nam', city: 'Hồ Chí Minh', hours: '08:00–21:00', types: ['Spa'], amenities: ['Trị liệu cổ vai gáy', 'Massage thư giãn', 'Chăm sóc sức khỏe', 'Ấn huyệt Đông y', 'Xông hơi thảo dược', 'Dưỡng sinh toàn thân'], cover: '/assets/partners/covers/thuan-moc-spa-tri-lieu.webp' },
  { id: 'danava-place-tigi-yoga-cai-lay', name: 'TIGI Yoga Cai Lậy', logo: '/assets/partners/places/tigi-yoga-cai-lay.webp', url: 'https://danava.vn/places/tigi-yoga-cai-lay', projectId: '', role: 'Yoga', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'TiGi Yoga là không gian dành cho những ai mong muốn rèn luyện sức khỏe, nuôi dưỡng sự bình an và phát triển bản thân. Với đội ngũ giảng viên tận tâm cùng chương trình học đa dạng từ cơ bản đến nâng cao, TiGi Yoga đồng hành cùng học viên trên hành trình xây dựng một cơ thể khỏe mạnh, tinh thần vững vàng và lối sống cân bằng.', address: '213 Cao Đăng Chiếm, phường Mỹ Phước Tây, Đồng Tháp', city: 'Đồng Tháp', hours: 'Thứ 2 - Thứ 7 (05:00-20:00)', types: ['Yoga'], amenities: ['Lớp học Yoga', 'HLV tận tâm', 'Đặt Lịch online', 'Gói tập linh hoạt', 'Yoga cộng đồng', 'Không gian thư giãn'], cover: '/assets/partners/covers/tigi-yoga-cai-lay.webp' },
  { id: 'danava-place-tri-gym-fitness-center', name: 'Trí Gym Fitness Center', logo: '/assets/partners/places/tri-gym-fitness-center.webp', url: 'https://danava.vn/places/tri-gym-fitness-center', projectId: '', role: 'Gym & Fitness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: '🏋️ TRÍ GYM YOGA – KHÔNG GIAN LUYỆN TẬP HIỆN ĐẠI & CHUYÊN NGHIỆP Trí Gym Yoga mang đến không gian luyện tập rộng rãi, hệ thống máy móc hiện đại cùng đội ngũ huấn luyện viên chuyên nghiệp, tận tâm đồng hành với từng hội viên. ✅ Đa dạng bộ môn: Gym • Yoga • Zumba • Boxing • Stretching ✅ Máy móc, trang thiết bị hiện đại ✅ Huấn luyện viên chuyên nghiệp, tận tâm ✅ Phòng xông hơi & phòng tắm riêng ✅ Tủ locker và khu vực thư giãn tiện nghi Trí Gym Yoga – Tập luyện khoa học, nâng tầm sức khỏe và chất lượng sống mỗi ngày.', address: '249 Lý Thường Kiệt, Tam Kỳ, Đà Nẵng', city: 'Đà Nẵng', hours: '08:00 - 21:00', types: ['Gym'], amenities: ['Tập Gym chuyên nghiệp', 'Yoga cân bằng', 'Giảm cân đốt mỡ', 'Cardio bền bỉ', 'Huấn luyện viên 1:1', 'Kickfit năng động'], cover: '/assets/partners/covers/tri-gym-fitness-center.webp' },
  { id: 'danava-place-verdederm-spa-beaute', name: 'VerdeDerm Spa & Beauté', logo: '/assets/partners/places/verdederm-spa-beaute.webp', url: 'https://danava.vn/places/verdederm-spa-beaute', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: '𝐕𝐞𝐫𝐝𝐞𝐃𝐞𝐫𝐦 𝐒𝐩𝐚 & 𝐁𝐞𝐚𝐮𝐭𝐞́', address: 'T56 Tổ 5 Ấp Tân Phước Xã Long Hải, Ho Chi Minh City, Vietnam', city: 'Hồ Chí Minh', hours: '08:00 - 21:00', types: ['Spa'], amenities: ['Chăm sóc da', 'Massage thư giãn', 'Yoga cân bằng', 'Trị liệu chuyên sâu', 'Xông hơi thải độc', 'Làm đẹp toàn diện'], cover: '/assets/partners/covers/verdederm-spa-beaute.webp' },
  { id: 'danava-place-yoga-an-nhien', name: 'Yoga An Nhiên', logo: '/assets/partners/places/yoga-an-nhien.webp', url: 'https://danava.vn/places/yoga-an-nhien', projectId: '', role: 'Yoga', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Yoga An Nhiên là không gian kết nối những người yêu Yoga, nơi cùng nhau nuôi dưỡng niềm đam mê, lan tỏa năng lượng tích cực và gieo những duyên lành cho sức khỏe. Với môi trường học tập thân thiện cùng đội ngũ hướng dẫn tận tâm, Yoga An Nhiên đồng hành cùng bạn trên hành trình nâng cao thể chất, cân bằng tinh thần và xây dựng lối sống an nhiên, khỏe mạnh mỗi ngày.', address: 'Phú Sơn Tây 4, Hoà Tiến, TP. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 6 (5:00-20:30)', types: ['Yoga'], amenities: ['Lớp Yoga cộng đồng', 'Không gian thư thái', 'Kết nối người yêu Yoga', 'Lan tỏa lối sống khỏe', 'Phù hợp mọi lứa tuổi', 'Rèn luyện mỗi ngày'], cover: '/assets/partners/covers/yoga-an-nhien.webp' },
  { id: 'danava-place-yoga-song-khoe', name: 'Yoga Sống Khỏe', logo: '/assets/partners/places/yoga-song-khoe.webp', url: 'https://danava.vn/places/yoga-song-khoe', projectId: '', role: 'Spa & Wellness', relation: 'place', verified: false, permission: true, published: true, note: 'Địa điểm công khai trên https://danava.vn/places (lấy ngày 19/11/2026).', description: 'Học Viện Yoga Sống Khỏe với 30 chi nhánh trên toàn quốc, là thành viên của Liên Đoàn Yoga Việt Nam và thành Viên Liên Minh Yoga Quốc Tế. Chúng tôi đã đào tạo hơn 10.000 Huấn Luyện Viên cấp chứng chỉ quốc tế, là đơn vị chuyên tổ chức những cuộc thi về Yoga trên toàn quốc', address: 'HA 02-77&79, Hải Âu 2, Vinhomes Ocean Park, Gia Lâm, Hà Nội', city: 'Hà Nội', hours: '08:00 - 21:00', types: ['Spa'], amenities: ['Đào tạo HLV Yoga', 'Tổ chức thi đấu', 'Hệ thống 30 chi nhánh', 'Thành viên Liên đoàn', 'Linh hoạt thời gian', 'Hỗ trợ nhanh chóng'], cover: '/assets/partners/covers/yoga-song-khoe.webp' },
];

/** Đợt đưa 9 khách hàng marketing (lib/marketing-portfolio.ts) vào danh sách quản trị (25/11/2026) */
export const MARKETING_SEED = 'marketing-clients-2026-11';
/** Khách hàng marketing đã hợp tác → bản ghi khách hàng, đã xác minh, hiện ở khối logo trang chủ */
export const MARKETING_CLIENT_SEEDS: Client[] = MARKETING_ENGAGEMENTS.map(m => ({
  id: 'mkt-' + m.id, name: m.client, logo: m.logo || '', url: m.website || m.fanpage || '', projectId: '',
  role: m.throughPartner ? 'Truyền thông qua đối tác' : 'Marketing & truyền thông', relation: 'client' as const, onHome: true,
  permission: true, published: true, note: 'Khách hàng dự án marketing (lib/marketing-portfolio.ts).'
}));
export const CLIENT_SEEDS: Client[] = [...BASE_CLIENT_SEEDS, ...MARKETING_CLIENT_SEEDS];
/** Dữ liệu đã lưu chưa nhận đợt khách hàng marketing → bổ sung một lần những mục chưa có (theo id hoặc tên) */
const marketingToAdd = (data: SiteData) => !data.clients?.length || (data.seeded || []).includes(MARKETING_SEED) ? []
  : MARKETING_CLIENT_SEEDS.filter(x => !data.clients!.some(c => c.id === x.id || c.name.trim().toLowerCase() === x.name.toLowerCase())).map(x => structuredClone(x));

/**
 * Mục trưng bày đã được chủ sở hữu yêu cầu gỡ khỏi website (19/11/2026).
 * Lọc ra cả khi database đã lưu chúng từ trước, để không còn hiện ở bất kỳ đâu.
 */
/** Bài thuộc mảng digital marketing — DANAVA không cung cấp mảng này (19/11/2026): gỡ khỏi website, URL cũ chuyển về /blogs/. */
export const REMOVED_POST_IDS = ['marketing', 'wp-13086', 'wp-12101', 'wp-11869', 'wp-11219'];
export const REMOVED_SHOWCASE_IDS = ['web-buoc-chay', 'web-omachi', 'web-aurum', 'web-driverent'];

export const DEFAULT_HERO_TITLE = 'Giải pháp công nghệ, website và sự kiện cho doanh nghiệp dịch vụ';
/** Tiêu đề mặc định cũ (có “marketing”) — thay bằng mặc định mới nếu chưa được quản trị viên sửa. */
const OLD_HERO_TITLES = ['Giải pháp công nghệ và marketing cho doanh nghiệp dịch vụ'];
const RETIRED_IDS = RETIRED_SERVICES.map(x => x.id);
const RETIRED_TOPICS = ['marketing'];

/* ------------------------------------------------------------- Chuẩn hóa */
const fill = <T,>(value: T | undefined, fallback: T): T => (value === undefined ? fallback : value);

/**
 * Điền các trường còn thiếu, đồng bộ tên giải pháp và cập nhật nội dung mẫu cũ.
 */
export function normalizeContent(data: SiteData): SiteData {
  const topics = fill(data.topics, TOPIC_SEEDS.map(t => ({ ...t, serviceIds: [...t.serviceIds] })))
    .filter(t => !RETIRED_TOPICS.includes(t.id))
    .map(t => ({ ...t, serviceIds: t.serviceIds.filter(id => !RETIRED_IDS.includes(id)) }));
  const topicServices = new Map(topics.map(t => [t.id, t.serviceIds]));
  // Giải pháp mới thêm sau (vd. Tổ chức sự kiện) được bổ sung vào dữ liệu cũ, giữ thứ tự gốc.
  const services = [...data.services, ...initial.services.filter(x => !data.services.some(s => s.id === x.id)).map(x => structuredClone(x))]
    .filter(s => !RETIRED_IDS.includes(s.id));
  const showcase = (data.showcase ?? structuredClone(SHOWCASE_SEEDS))
    .filter(x => !REMOVED_SHOWCASE_IDS.includes(x.id) && !RETIRED_IDS.includes(x.serviceId));
  // Bổ sung HUDI vào thư viện đã lưu, giữ nguyên mục do quản trị viên quản lý.
  if (!showcase.some(item => item.id === HUDI_WEBSITE_SHOWCASE.id || item.slug === HUDI_WEBSITE_SHOWCASE.slug)
    && !data.projects?.some(project => project.slug === HUDI_WEBSITE_SHOWCASE.slug)) {
    showcase.unshift(structuredClone(HUDI_WEBSITE_SHOWCASE));
  }
  return {
    ...data,
    // Giờ làm việc mặc định cũ (18:00, chưa/có nghỉ trưa) → giờ mới 08:00 – 17:30, nghỉ trưa 11:30 – 14:00; giờ do quản trị viên tự sửa thì giữ nguyên
    ...(data.blocks?.company && ['Thứ Hai – Thứ Bảy, 08:00 – 18:00', 'Thứ Hai – Thứ Bảy, 08:00 – 18:00 (nghỉ trưa 11:30 – 14:00)'].includes((data.blocks.company as { hours?: string }).hours || '')
      ? { blocks: { ...data.blocks, company: { ...data.blocks.company, hours: 'Thứ Hai – Thứ Bảy, 08:00 – 17:30 (nghỉ trưa 11:30 – 14:00)' } } } : {}),
    // Khối DANAVA DIGITAL (marketing) đã ngừng — gỡ khỏi dữ liệu trình chiếu đã lưu
    ...(data.presentation ? { presentation: { ...data.presentation, ecosystem: data.presentation.ecosystem.filter(x => x.id !== 'digital') } } : {}),
    heroTitle: data.heroTitle === undefined || OLD_HERO_TITLES.includes(data.heroTitle) ? DEFAULT_HERO_TITLE : data.heroTitle,
    showcase,
    services: services.map(s => {
      const seed = SERVICE_SEEDS[s.id] || {};
      const updatedService = ['website', 'marketing', 'events'].includes(s.id)
        ? initial.services.find(item => item.id === s.id)
        : undefined;
      const isMarketing = s.id === 'marketing';
      const isEvent = s.id === 'events';
      const marketingSeoTitle = s.seoTitle?.replace(/Digital Marketing/gi, updatedService?.title || s.title);
      const heroLead = isMarketing && s.heroLead === 'Chiến lược, nội dung, quay chụp và quảng cáo được kết nối thành một kế hoạch. Thương hiệu của bạn đến gần khách hàng hơn, với số liệu minh bạch.'
        ? seed.heroLead
        : s.heroLead;
      return {
        ...s,
        ...(updatedService ? { title: updatedService.title } : {}),
        ...(isMarketing && updatedService ? {
          seoTitle: marketingSeoTitle?.includes(updatedService.title) ? marketingSeoTitle : updatedService.title,
          description: updatedService.description,
          items: [...updatedService.items]
        } : {}),
        ...(isEvent && updatedService ? {
          seoTitle: s.seoTitle?.replace(/Sự kiện & Truyền thông/gi, updatedService.title),
          items: s.items.map(item => item === 'Roadshow, activation, sampling và truyền thông sự kiện' ? updatedService.items[4] : item)
        } : {}),
        heroLead: fill(heroLead, seed.heroLead || ''),
        audience: fill(s.audience, seed.audience ? [...seed.audience] : []).map(x => x === 'Chiến dịch marketing' ? 'Chương trình & sự kiện' : x),
        problems: fill(s.problems, seed.problems ? [...seed.problems] : []),
        process: fill(s.process, seed.process ? seed.process.map(x => ({ ...x })) : []).map(step =>
          isEvent && step.title === 'Điều phối & ghi hình' ? { ...SERVICE_SEEDS.events.process![3] } : step),
        faqs: fill(s.faqs, seed.faqs ? seed.faqs.map(x => ({ ...x })) : []).map(faq =>
          isEvent && faq.q === 'Hình ảnh, video sau sự kiện có dùng được cho truyền thông không?' ? { ...SERVICE_SEEDS.events.faqs![2] } : faq),
        pricing: fill(isEvent && s.pricing === 'Báo giá theo quy mô chương trình, địa điểm và các hạng mục: thiết kế – thi công không gian, thiết bị kỹ thuật, nhân sự biểu diễn, điều phối và ghi hình. DANAVA gửi đề xuất chi tiết sau khi nhận thông tin chương trình.' ? undefined : s.pricing, seed.pricing || ''),
        productUrl: fill(s.productUrl, seed.productUrl || ''),
        productLabel: fill(s.productLabel, seed.productLabel || '')
      };
    }),
    subServices: fill(data.subServices, structuredClone(SUB_SERVICE_SEEDS)).filter(x => !RETIRED_IDS.includes(x.parentId)),
    topics,
    clients: [...fill(data.clients, structuredClone(CLIENT_SEEDS)), // Dữ liệu cũ chưa có mục “địa điểm” nào → bổ sung một lần; danh sách rỗng là lựa chọn của quản trị viên nên giữ nguyên
      ...(data.clients?.length && !data.clients.some(c => c.relation === 'place') ? structuredClone(CLIENT_SEEDS.filter(x => x.relation === 'place')) : []),
      // Dữ liệu lưu trước khi có 13 “đối tác đồng hành” lấy từ danava.vn → bổ sung đúng một lần (đánh dấu trong `seeded`)
      ...(needsPartnerSeed(data) ? structuredClone(CLIENT_SEEDS.filter(x => x.id.startsWith(PARTNER_PREFIX))) : []),
      ...marketingToAdd(data)].map(c => {
      const seed = CLIENT_SEEDS.find(x => x.id === c.id);
      if (!seed) return c;
      const out = { ...c };
      if (c.id === 'danava-partner-12' && !c.url) out.url = seed.url;
      if (!out.logo && seed.logo) out.logo = seed.logo;
      for (const k of ['fullName', 'description', 'address', 'city', 'hours', 'types', 'amenities', 'cover', 'verified'] as const) {
        if (out[k] === undefined && seed[k] !== undefined) (out as Record<string, unknown>)[k] = structuredClone(seed[k]);
      }
      return out;
    }),
    // Thiết bị phòng gym: dữ liệu cũ chưa có → danh mục mẫu (giá trống); danh sách quản trị viên đã sửa giữ nguyên
    equipment: data.equipment ?? structuredClone(EQUIPMENT_SEEDS),
    seeded: Array.from(new Set([...(data.seeded || []), PARTNER_SEED, MARKETING_SEED])),
    testimonials: fill(data.testimonials, []),
    posts: data.posts.filter(p => !REMOVED_POST_IDS.includes(p.id)).map(p => {
      const saved = fill(p.topicId, POST_TOPICS[p.id] || '');
      const topicId = RETIRED_TOPICS.includes(saved) ? ARCHIVE_TOPIC : saved;
      return { ...p, topicId, serviceIds: fill(p.serviceIds, [...(topicServices.get(topicId) || [])]).filter(id => !RETIRED_IDS.includes(id)) };
    }),
    projects: (data.projects || []).map(p => {
      const d = PROJECT_DEFAULTS[p.id] || {};
      return {
        ...p,
        industry: fill(p.industry, d.industry || ''),
        serviceIds: fill(p.serviceIds, d.serviceIds ? [...d.serviceIds] : []).filter(id => !RETIRED_IDS.includes(id)),
        scope: fill(p.scope, d.scope ? [...d.scope] : []),
        gallery: fill(p.gallery, []),
        ...(p.updated === undefined && d.updated ? { updated: d.updated } : {})
      };
    })
  };
}
