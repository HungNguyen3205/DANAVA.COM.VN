/*
 * Giá trị mặc định cho các trường nội dung bổ sung (dịch vụ chi tiết, trang dịch vụ con, danh mục kiến thức,
 * quan hệ bài viết–dịch vụ–dự án, khách hàng tiêu biểu).
 *
 * normalizeContent() chỉ ĐIỀN chỗ còn thiếu, không bao giờ ghi đè giá trị quản trị viên đã lưu.
 * Nguồn: nội dung đã có trên website (components/site/service-content.ts trước đây, trang Về DANAVA),
 * case study trên danava.vn (lib/verified-projects.ts). Không thêm số liệu, giá hay cam kết mới.
 */
import { initial, RETIRED_SERVICES, type Client, type Feature, type Faq, type Project, type Service, type SiteData, type SubService, type Topic } from './content.ts';
import { SHOWCASE_SEEDS } from './showcase-seeds.ts';

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
      { title: 'Điều phối & ghi hình', text: 'Điều phối tại chỗ, nhân sự biểu diễn, ghi hình và tổng kết sau chương trình.' }
    ],
    faqs: [
      { q: 'DANAVA có nhận thi công riêng booth, backdrop hoặc đạo cụ không?', a: 'Có. Thiết kế, thi công booth, backdrop, đạo cụ và không gian sự kiện là một hạng mục DANAVA thực hiện, có thể đặt riêng hoặc trong gói tổ chức.' },
      { q: 'Tôi cần chuẩn bị gì để nhận báo giá?', a: 'Chỉ cần cho biết thời gian dự kiến, số lượng khách mời, địa điểm mong muốn và mục tiêu chương trình.' },
      { q: 'Hình ảnh, video sau sự kiện có dùng được cho truyền thông không?', a: 'Có. Hình ảnh, video ghi lại tại chương trình được bàn giao để doanh nghiệp dùng cho website, Fanpage và quảng cáo.' }
    ],
    pricing: 'Báo giá theo quy mô chương trình, địa điểm và các hạng mục: thiết kế – thi công không gian, thiết bị kỹ thuật, nhân sự biểu diễn, điều phối và ghi hình. DANAVA gửi đề xuất chi tiết sau khi nhận thông tin chương trình.'
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
    description: 'Hội nghị, kick-off, gala và team building: kịch bản, hậu cần, truyền thông và ghi hình.',
    heroLead: 'Một đầu mối lo kịch bản, hậu cần, sân khấu và ghi hình để doanh nghiệp tập trung vào khách mời.',
    audience: ['Doanh nghiệp', 'Chuỗi cửa hàng', 'Hiệp hội & câu lạc bộ'],
    problems: SERVICE_SEEDS.events.problems!,
    features: [
      f('Hội nghị & hội thảo', 'Lên kịch bản, hậu cần, truyền thông và ghi hình cho sự kiện doanh nghiệp.'),
      f('Team building & gala', 'Chương trình gắn kết đội ngũ, từ hoạt động ngoài trời đến đêm gala.'),
      f('Trang trí & booth', 'Không gian sự kiện và booth theo nhận diện thương hiệu.')
    ],
    process: SERVICE_SEEDS.events.process!, faqs: SERVICE_SEEDS.events.faqs!.slice(1), pricing: SERVICE_SEEDS.events.pricing!, image: '/assets/legacy/event-group.webp', published: false, updated: '2026-11-19',
    editorNote: 'Ảnh hồ sơ năng lực (PNJ, LUTECH, Highlands…) cần DANAVA xác nhận vai trò thực hiện và quyền nêu tên trước khi dùng làm dự án.'
  },
  {
    id: 'event-workshop', parentId: 'events', slug: 'to-chuc-workshop', title: 'Tổ chức workshop',
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
export const CLIENT_SEEDS: Client[] = [
  { id: 'hariver', name: 'HARIVER Gym & Fitness Center', logo: '/assets/partners/hariver-gym-fitness.webp', url: 'https://danava.vn/places/hariver-gym-fitnes-center', projectId: 'hariver-studio', role: 'Gym & Fitness', relation: 'client', permission: true, published: true, note: 'Tên khách hàng đã công bố trong case study https://danava.vn/blog/case-hariver-gym-fitness-center. Logo theo khối Đối tác đồng hành trên danava.vn.', fullName: 'HARIVER GYM & FITNESS CENTER', description: 'Phòng tập hỗ trợ sức khoẻ cho cộng đồng thông qua câu lạc bộ Gym tốt nhất khu vực Hoà Khánh.', address: '214 Phạm Như Xương, P. Hoà Khánh, TP. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (5:00 - 20:00)', types: ['Gym'], amenities: ['Trang thiết bị hiện đại', 'Huấn luyện viên chuyên nghiệp', 'Đa dạng khu vực tập luyện', 'Không gian rộng rãi', 'Phòng tắm & tủ khóa tiện nghi', 'Bãi đỗ xe rộng rãi', 'an toàn'], cover: '/assets/partners/covers/hariver-gym-fitness-center.webp' },
  { id: 'hue-pilates', name: 'Huế Pilates & Yoga', logo: '/assets/partners/hue-pilates-yoga.webp', url: 'https://danava.vn/places/hue-pilates-yoga', projectId: 'hue-studio', role: 'Pilates & Yoga', relation: 'client', permission: true, published: true, note: 'Tên khách hàng đã công bố trong case study https://danava.vn/blog/case-hue-pilates-yoga. Logo theo khối Đối tác đồng hành trên danava.vn.', fullName: 'Huế Pilates & Yoga', description: 'Huế Pilates & Yoga là không gian luyện tập chuyên nghiệp, nơi kết hợp hài hòa giữa Yoga và Pilates nhằm nâng cao sức khỏe thể chất, cân bằng tinh thần và cải thiện chất lượng cuộc sống. Với đội ngũ huấn luyện viên tận tâm cùng các chương trình tập luyện phù hợp cho mọi độ tuổi, Huế Pilates & Yoga mang đến môi trường tập luyện thân thiện, giúp học viên tăng cường sức mạnh cơ thể, cải thiện vóc dáng, giảm căng thẳng và xây dựng lối sống khỏe mạnh mỗi ngày.', address: '38 Nguyễn Khuyến, Phường Thuận Hoá, Tp. Huế', city: 'Thừa Thiên Huế', hours: 'Thứ 2 - Chủ Nhật (05h00 - 20h00)', types: ['Pilates'], amenities: ['Nước uống miễn phí', 'Khăn tập miễn phí', 'Máy Reformer hiện đại', 'Máy Cadillac chuyên nghiệp', 'Wunda Chair cao cấp', 'Ladder Barrel hỗ trợ tập luyện hiệu quả'], cover: '/assets/partners/covers/hue-pilates-yoga.webp' },
  { id: 'danava-partner-7', name: 'VF Gym', logo: '/assets/partners/vf-gym.webp', url: 'https://danava.vn/places/vf-gym', projectId: '', role: 'Gym & Fitness', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'VF GYM', description: 'VF GYM – 1081 Ngô Quyền là phòng tập hiện đại dành cho mọi đối tượng, từ người mới bắt đầu đến người tập lâu năm. Không gian rộng rãi, sạch sẽ, được trang bị hệ thống máy lạnh mát mẻ giúp bạn thoải mái tập luyện bất kể thời tiết. Phòng gym sở hữu đầy đủ máy tập cardio, máy tập sức mạnh và khu vực tập tạ tự do, đáp ứng đa dạng mục tiêu như giảm cân, tăng cơ, nâng cao sức khỏe hay cải thiện vóc dáng. Bên cạnh đó, VF GYM còn có nhiều tiện ích như khu vực thay đồ, gửi xe thuận tiện, huấn luyện viên nhiệt tình hỗ trợ và môi trường tập luyện thân thiện, tạo động lực để bạn duy trì thói quen vận động mỗi ngày. Với không gian chuyên nghiệp cùng trang thiết bị hiện đại, VF GYM là lựa chọn phù hợp cho những ai mong muốn xây dựng một lối sống khỏe mạnh, năng động và bền vững.', address: '1081 Ngô Quyền, P. An Hải, TP. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (05h00 - 20h00)', types: ['Gym'], amenities: ['Phòng tập máy lạnh', 'Máy tập hiện đại', 'HLV hỗ trợ', 'Phòng thay đồ', 'Bãi đỗ xe', 'Không gian chuyên nghiệp'], cover: '/assets/partners/covers/vf-gym.webp' },
  { id: 'danava-partner-14', name: 'SADHANA PILATES', logo: '/assets/partners/sadhana-pilates.webp', url: 'https://danava.vn/places/sadhana-pilates', projectId: '', role: 'Pilates', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Sadhana Pilates', description: 'Sadhana Pilates – Không gian tập luyện chuyên sâu giúp cải thiện vóc dáng, tăng sức mạnh, nâng cao độ dẻo dai và cân bằng cơ thể. Chương trình phù hợp nhiều nhu cầu, từ tập luyện, giảm đau đến phục hồi và chăm sóc sức khỏe.', address: '28G Nguyễn Hữu Cảnh, P. 22, Quận Bình Thạnh, TP. HCM', city: 'Hồ Chí Minh', hours: 'T2- CN: 7:00 đến 21:00', types: ['Pilates'], amenities: ['Tăng sức mạnh & độ dẻo', 'Săn chắc vóc dáng', 'Cải thiện tư thế', 'Giảm căng thẳng', 'thư giãn', 'Hỗ trợ phục hồi cơ thể', 'Cá nhân hóa theo mục tiêu'], cover: '/assets/partners/covers/sadhana-pilates.webp' },
  { id: 'danava-partner-15', name: 'BỤNG Healing', logo: '/assets/partners/bung-healing.webp', url: 'https://danava.vn/places/bung-healing', projectId: '', role: 'Breathwork & Hara Voice', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'BỤNG Healing', description: 'Bụng Healing là không gian tập luyện online chuyên sâu về Breathwork & Hara Voice , giúp kết nối với hơi thở, vùng bụng và nội lực bên trong, hướng đến thư giãn sâu, ngủ ngon và làm ấm cơ thể. Chương trình đồng thời đào tạo chuyên môn với 110H Breathwork & Hara Voice dành cho HLV Yoga/Vận động, 220H HLV Breathwork & Hara Voice kết hợp Mindfulness, Kundalini Yoga và Zen Leader, cùng các lớp Tập huấn chuyên môn Liên đoàn Yoga Việt Nam , mang đến nền tảng thực hành và đào tạo bài bản, chuyên nghiệp.', city: 'Hồ Chí Minh', hours: '24/7', types: ['Yoga'], amenities: ['Làm ấm bụng', 'Điều hòa hơi thở', 'Thư giãn sâu', 'Hara Voice', 'Healing vùng bụng', 'Cân bằng Thân'], cover: '/assets/partners/covers/bung-healing.webp' },
  { id: 'danava-partner-16', name: 'Sun Moon Yogashala', logo: '/assets/partners/sun-moon-yogashala.webp', url: 'https://danava.vn/places/sunmon-yoga', projectId: '', role: 'Yoga', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Sunmon Yoga', description: 'Sun Moon Yogashala – Nơi bạn chăm sóc sức khỏe và tìm lại sự cân bằng qua từng hơi thở, từng chuyển động Yoga. Với đội ngũ giáo viên Ấn Độ có chuyên môn cao, tận tâm hướng dẫn, mỗi buổi tập giúp bạn tăng cường sự dẻo dai, cải thiện sức mạnh, thư giãn tinh thần và nâng cao khả năng tập trung. Dù mới bắt đầu hay đã có kinh nghiệm, hãy cùng Sun Moon Yogashala nuôi dưỡng thói quen sống khỏe và tận hưởng khoảng thời gian dành riêng cho bản thân.', address: '51–53 Phan Thị Khá, phường Bạc Liêu, tỉnh Cà Mau', city: 'Cà Mau', types: ['Yoga'], amenities: ['Giáo viên Ấn Độ chuyên môn cao', 'Hướng dẫn tận tâm', 'Tăng sức mạnh', 'dẻo dai', 'Thư giãn', 'giảm căng thẳng', 'Tập trung', 'cân bằng thân tâm'], cover: '/assets/partners/covers/sunmon-yoga.webp' },
  { id: 'danava-partner-1', name: 'GLG YOGA SCHOOL', logo: '/assets/partners/glg-yoga-school.webp', url: 'https://danava.vn/places/glg-yoga-school', projectId: '', role: 'Yoga & Đào tạo', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'GLG YOGA SCHOOL', description: 'GLG Yoga School là một trường đào tạo giáo viên Yoga quốc tế chuyên nghiệp và năng động, với sứ mệnh mang đến kiến thức toàn diện và trải nghiệm sâu sắc trong lĩnh vực Yoga. Trường nổi bật với các khóa học đạt chuẩn quốc tế, hợp tác cùng, DSVV University, Đại học SGRR Ấn Độ và Yoga Alliance USA. Đào tạo chuyên sâu: GLG Yoga School cung cấp các chương trình đào tạo Huấn luyện viên Yoga đạt chuẩn quốc tế (YTTC 200h – 300h – 500h – 800h – 1.000h – Cao đẳng – Đại học và sau Đại học), kết hợp giữa nền tảng học thuật vững chắc và kỹ năng thực tiễn chuyên sâu, giúp học viên phát triển toàn diện từ tri thức đến nghề nghiệp. Với đội ngũ Giáo sư, Phó Giáo sư, Tiến sĩ và Master Yoga sở hữu chứng chỉ RYT500, E-RYT500 cùng nhiều năm kinh nghiệm giảng dạy trong và ngoài nước, GLG Yoga School cam kết mang đến môi trường học tập chuyên nghiệp – sáng tạo – truyền cảm hứng cho những ai mong muốn trở thành Huấn luyện viên Yoga quốc tế.', address: '1081 Ngô Quyền, P. An Hải, Q. Ngũ Hành Sơn', city: 'Đà Nẵng', hours: 'Thứ 2 - Chủ Nhật (05h00 - 18h00)', types: ['Yoga'], amenities: ['Yoga Cộng Đồng', 'Đào tạo Huấn luyện viên Yoga', 'Cơ sở vật chất hiện đại', 'Phòng thay đồ & Tủ khóa', 'Bãi đỗ xe miễn phí', 'Khu vực thư giãn & Pantry'], cover: '/assets/partners/covers/glg-yoga-school.webp' },
  { id: 'danava-partner-5', name: 'Kiến Gym', logo: '/assets/partners/kien-gym.webp', url: 'https://danava.vn/places/kien-gym-hoa-xuan', projectId: '', role: 'Gym & Fitness', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Kiến Gym Hoà Xuân', description: 'KIẾN GYM HÒA XUÂN – NƠI BẮT ĐẦU HÀNH TRÌNH THAY ĐỔI BẢN THÂN Kiến Gym là Câu lạc bộ Gym với hệ thống máy móc hiện đại, không gian rộng rãi, sạch sẽ và thoáng mát, mang đến môi trường tập luyện thoải mái cho mọi hội viên. Chúng tôi luôn duy trì mức giá công khai, minh bạch và thuộc nhóm cạnh tranh nhất tại khu vực Hòa Xuân, giúp nhiều người dễ dàng tiếp cận việc tập luyện. Với cộng đồng hội viên đông đảo đã gắn bó trong nhiều năm, Kiến Gym không chỉ là nơi rèn luyện sức khỏe mà còn là nơi truyền động lực để mỗi người kiên trì theo đuổi mục tiêu của mình. Dù bạn muốn giảm cân, tăng cơ, cải thiện sức khỏe hay nâng cao thể lực, Kiến Gym luôn sẵn sàng đồng hành cùng bạn trên từng chặng đường. Kiến Gym – Tập luyện hiệu quả, chi phí hợp lý, môi trường thân thiện và đáng tin cậy.', address: '588 Đường 29 Tháng 3 Hòa Xuân', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7: 5h00 -20h30 - Chủ Nhật : 6h00 -10h00 & 14h00 -19h00', types: ['Gym'], amenities: ['Trang thiết bị tập luyện hiện đại', 'Huấn luyện viên cá nhân chuyên nghiệp', 'Khu vực tập luyện rộng rãi', 'đa dạng', 'Phòng thay đồ và tắm sạch sẽ', 'Bãi đỗ xe miễn phí', 'thuận tiện', 'Khung giờ tập luyện linh hoạt'], cover: '/assets/partners/covers/kien-gym-hoa-xuan.webp' },
  { id: 'danava-partner-3', name: 'Liên Minh Yoga Việt Nam', logo: '/assets/partners/lien-minh-yoga-viet-nam.webp', url: 'https://danava.vn/places/lien-minh-yoga-viet-nam', projectId: '', role: 'Yoga', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Liên Minh Yoga Việt Nam', description: 'Trung tâm Yoga chuyên sâu về chăm sóc sức khỏe, tiên phong nghiên cứu và ứng dụng các phương pháp phục hồi tự nhiên. Chúng tôi đào tạo đội ngũ Huấn luyện viên Yoga trị liệu với nền tảng kiến thức chuyên môn vững chắc, góp phần lan tỏa giá trị sống khỏe và bền vững đến cộng đồng.', address: 'Số 1 Ngõ 92. Âu Cơ, Hồng Hà, Hà Nội', city: 'Hà Nội', hours: 'Thứ 2 - Thứ 7 (05h00 - 22h00)', types: ['Yoga'], amenities: ['Đào tạo HLV Yoga', 'Chứng chỉ uy tín', 'Giảng viên chuyên môn cao', 'Kết nối cộng đồng Yoga', 'Yoga trị liệu chuyên sâu', 'Hội thảo & tập huấn thường xuyên'], cover: '/assets/partners/covers/lien-minh-yoga-viet-nam.webp' },
  { id: 'danava-partner-12', name: 'Fuji Swimming Club DaNang', logo: '/assets/partners/fuji-swimming-club-danang.webp', url: '', projectId: '', role: 'Câu lạc bộ bơi lội', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026). Trang chi tiết trên danava.vn trả 404 ngày 19/11/2026 nên chưa gắn liên kết.', fullName: 'Fuji Swimming Club DaNang', city: 'Đà Nẵng' },
  { id: 'danava-partner-6', name: 'TAM TAY GYM', logo: '/assets/partners/tam-tay-gym.webp', url: 'https://danava.vn/places/tamtay-gym', projectId: '', role: 'Gym & Fitness', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'TamTay Gym', description: 'Community Đà Nẵng isn\'t just a gym—it\'s a lifestyle that connects people, inspires healthy living, and empowers a longer, happier life. ⭐', address: '11 An Thượng 3, Ngũ Hành Sơn, Đà Nẵng', city: 'Đà Nẵng', hours: '7:00 AM - 9:00 PM', types: ['Gym'], amenities: ['Thiết bị tập hiện đại', 'Phòng tập máy lạnh', 'Phòng tắm nước nóng', 'Khăn tập miễn phí', 'Smoothie dinh dưỡng', 'Không gian sạch sẽ', 'chuyên nghiệp'], cover: '/assets/partners/covers/tamtay-gym.webp' },
  { id: 'danava-partner-4', name: 'Yoga Club Vietnam', logo: '/assets/partners/yoga-club-vietnam.webp', url: 'https://danava.vn/places/yoga-club-vietnam', projectId: '', role: 'Yoga cộng đồng', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Yoga Club Vietnam', description: 'Yoga Club Vietnam ra đời với mục tiêu kết nối cộng đồng yêu Yoga trên toàn quốc. Yoga Club Vietnam là nơi kết nối giao lưu giữa các Câu lạc bộ. Huấn luyện viên và tất cả những người yêu Yoga. Nhằm giúp mọi người dễ dàng tìm kiếm những thông tin về Yoga, kết nối, giao lưu, học hỏi, chia sẻ những kinh nghiệm, kiến thức về Yoga.', address: '1081 Ngô Quyền, P. An Hải, Sơn Trà, Tp. Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (08h00 - 17h00)', types: ['Yoga'], amenities: ['Phòng tập rộng thoáng', 'Giáo viên chứng chỉ quốc tế', 'Thảm & dụng cụ miễn phí', 'Phòng thay đồ & tủ khoá', 'Nước uống miễn phí', 'Bãi giữ xe'], cover: '/assets/partners/covers/yoga-club-vietnam.webp' },
  { id: 'danava-partner-2', name: 'DYF', logo: '/assets/partners/dyf.webp', url: 'https://danava.vn/places/lien-doan-yoga-thanh-pho-da-nang', projectId: '', role: 'Yoga & Fitness', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Liên Đoàn Yoga Thành Phố Đà Nẵng', description: 'Liên đoàn Yoga thành phố Đà Nẵng được UBND thành phố Đà Nẵng quyết định thành lập nhằm mục đích tập hợp, đoàn kết hội viên, bảo vệ quyền và lợi ích hợp pháp của hội viên, hỗ trợ nhau hoạt động có hiệu quả nhằm thúc đẩy phong trào tập luyện, thi đấu môn thể thao Yoga, rèn luyện ý chí, phẩm chất đạo đức, nâng cao sức khỏe, phát triển tài năng thể thao Yoga; góp phần vào việc phát triển kinh tế - xã hội của thành phố và quốc gia.', address: '330 Tôn Đức Thắng, Hòa Khánh', city: 'Đà Nẵng', hours: 'Thứ 2 - Thứ 7 (8:30 - 16:30)', types: ['Yoga'], amenities: ['Đào tạo Huấn luyện viên Yoga chuyên nghiệp', 'Đào tạo chuyên đề & nâng cao', 'Kết nối cộng đồng & hội viên', 'Giải đấu & sự kiện Yoga', 'Chứng nhận & phát triển nghề nghiệp', 'Hỗ trợ tư vấn & kết nối hợp tác'], cover: '/assets/partners/covers/lien-doan-yoga-thanh-pho-da-nang.webp' },
  { id: 'danava-partner-13', name: 'Học Viện Quốc Tế Yoga Ngọc Bích', logo: '/assets/partners/hoc-vien-quoc-te-yoga-ngoc-bich.webp', url: 'https://danava.vn/places/hoc-vien-quoc-te-yoga-ngoc-bich', projectId: '', role: 'Yoga', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'Học Viện Quốc Tế Yoga Ngọc Bích', description: 'Học viện Quốc tế Yoga Ngọc Bích đồng hành cùng học viên trên hành trình khỏe thân – an tâm – sống cân bằng . Học viện chuyên đào tạo HLV Yoga 200H – 500H, cấp chứng chỉ quốc tế ; tổ chức các lớp Yoga cộng đồng từ cơ bản đến nâng cao , Yoga trị liệu – phục hồi vai gáy, lưng, thần kinh tọa . Bên cạnh đó, Học viện cung cấp PT 1-1, lớp nhóm nhỏ và chương trình Yoga dành cho văn phòng, doanh nghiệp , phù hợp với nhiều nhu cầu và thể trạng. Yoga cho mọi người – từ cơ bản đến chuyên sâu, từ luyện tập đến phục hồi và phát triển nghề nghiệp.', address: 'Số 02 Thanh Hải, Hải Châu, thành phố Đà Nẵng', city: 'Đà Nẵng', hours: 'Thứ 2 - Chủ Nhật (05h00 - 21h00)', types: ['Yoga'], amenities: ['Yoga Cơ Bản', 'Yoga Trị Liệu', 'Đào Tạo HLV 200H–500H', 'PT Yoga 1-1', 'Yoga Văn Phòng', 'Yoga Cộng Đồng'], cover: '/assets/partners/covers/hoc-vien-quoc-te-yoga-ngoc-bich.webp' },
  { id: 'danava-partner-11', name: 'TIGI YOGA', logo: '/assets/partners/tigi-yoga.webp', url: 'https://danava.vn/places/tigi-yoga', projectId: '', role: 'Yoga', relation: 'partner', permission: true, published: true, note: 'Đối tác đồng hành công bố trên https://danava.vn/ (khối “Đối tác đồng hành”, lấy ngày 19/11/2026).', fullName: 'TIGI YOGA', description: 'TiGi Yoga là không gian dành cho những ai mong muốn rèn luyện sức khỏe, nuôi dưỡng sự bình an và phát triển bản thân. Với đội ngũ giảng viên tận tâm cùng chương trình học đa dạng từ cơ bản đến nâng cao, TiGi Yoga đồng hành cùng học viên trên hành trình xây dựng một cơ thể khỏe mạnh, tinh thần vững vàng và lối sống cân bằng.', address: '53 Thái Sanh Hạnh, Phường Mỹ Phong, Đồng Tháp', city: 'Đồng Tháp', hours: 'Thứ 2 - Thứ 7 (05:00-20:00)', types: ['Yoga'], amenities: ['Lớp học Yoga', 'HLV tận tâm', 'Đặt Lịch online', 'Gói tập linh hoạt', 'Cộng đồng yoga', 'Không gian thư giãn'], cover: '/assets/partners/covers/tigi-yoga.webp' },
];

/**
 * Mục trưng bày đã được chủ sở hữu yêu cầu gỡ khỏi website (19/11/2026).
 * Lọc ra cả khi database đã lưu chúng từ trước, để không còn hiện ở bất kỳ đâu.
 */
/** Bài thuộc mảng digital marketing — DANAVA không cung cấp mảng này (19/11/2026): gỡ khỏi website, URL cũ chuyển về /kien-thuc/. */
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
 * Điền các trường còn thiếu bằng giá trị mặc định. Không ghi đè dữ liệu đã có
 * (kể cả mảng rỗng hay chuỗi rỗng — đó là lựa chọn của quản trị viên).
 */
export function normalizeContent(data: SiteData): SiteData {
  const topics = fill(data.topics, TOPIC_SEEDS.map(t => ({ ...t, serviceIds: [...t.serviceIds] })))
    .filter(t => !RETIRED_TOPICS.includes(t.id))
    .map(t => ({ ...t, serviceIds: t.serviceIds.filter(id => !RETIRED_IDS.includes(id)) }));
  const topicServices = new Map(topics.map(t => [t.id, t.serviceIds]));
  // Giải pháp mới thêm sau (vd. Sự kiện & Truyền thông) được bổ sung vào dữ liệu cũ, giữ thứ tự gốc.
  const services = [...data.services, ...initial.services.filter(x => !data.services.some(s => s.id === x.id)).map(x => structuredClone(x))]
    .filter(s => !RETIRED_IDS.includes(s.id));
  return {
    ...data,
    // Khối DANAVA DIGITAL (marketing) đã ngừng — gỡ khỏi dữ liệu trình chiếu đã lưu
    ...(data.presentation ? { presentation: { ...data.presentation, ecosystem: data.presentation.ecosystem.filter(x => x.id !== 'digital') } } : {}),
    heroTitle: data.heroTitle === undefined || OLD_HERO_TITLES.includes(data.heroTitle) ? DEFAULT_HERO_TITLE : data.heroTitle,
    showcase: fill(data.showcase, structuredClone(SHOWCASE_SEEDS)).filter(x => !REMOVED_SHOWCASE_IDS.includes(x.id) && !RETIRED_IDS.includes(x.serviceId)),
    services: services.map(s => {
      const seed = SERVICE_SEEDS[s.id] || {};
      return {
        ...s,
        heroLead: fill(s.heroLead, seed.heroLead || ''),
        audience: fill(s.audience, seed.audience ? [...seed.audience] : []).map(x => x === 'Chiến dịch marketing' ? 'Chương trình & sự kiện' : x),
        problems: fill(s.problems, seed.problems ? [...seed.problems] : []),
        process: fill(s.process, seed.process ? seed.process.map(x => ({ ...x })) : []),
        faqs: fill(s.faqs, seed.faqs ? seed.faqs.map(x => ({ ...x })) : []),
        pricing: fill(s.pricing, seed.pricing || ''),
        productUrl: fill(s.productUrl, seed.productUrl || ''),
        productLabel: fill(s.productLabel, seed.productLabel || '')
      };
    }),
    subServices: fill(data.subServices, structuredClone(SUB_SERVICE_SEEDS)).filter(x => !RETIRED_IDS.includes(x.parentId)),
    topics,
    clients: fill(data.clients, structuredClone(CLIENT_SEEDS)).map(c => {
      const seed = CLIENT_SEEDS.find(x => x.id === c.id);
      if (!seed) return c;
      const out = { ...c };
      for (const k of ['fullName', 'description', 'address', 'city', 'hours', 'types', 'amenities', 'cover'] as const) {
        if (out[k] === undefined && seed[k] !== undefined) (out as Record<string, unknown>)[k] = structuredClone(seed[k]);
      }
      return out;
    }),
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
