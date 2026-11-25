/**
 * SEO mặc định của các trang cố định (không phải bản ghi như bài viết, dự án, dịch vụ).
 * Quản trị → SEO & chuyển hướng → "SEO từng trang" ghi đè từng ô (SiteData.pageSeo); ô để trống = dùng mặc định ở đây.
 * Mỗi trang gọi: export const generateMetadata = seoPage('/duong-dan/')  (lib/seo-page.ts)
 */
export type StaticSeo = {
  path: string;
  /** Tên trang hiển thị trong quản trị */
  name: string;
  title: string;
  description: string;
  /** Ảnh chia sẻ mặc định (OG 1200×630); trống = logo */
  image?: string;
  /** Tiêu đề đã có tên thương hiệu → không thêm " | DANAVA Solutions" */
  absoluteTitle?: boolean;
};

export const STATIC_SEO: StaticSeo[] = [
  {
    path: '/', name: 'Trang chủ', absoluteTitle: true, image: '/assets/profile/set-stage.webp',
    title: 'DANAVA Solutions — Giải pháp công nghệ, website và sự kiện cho doanh nghiệp dịch vụ',
    description: 'Phần mềm quản lý Gym, Yoga, Pilates & Spa DANAVA Studio, thiết kế website, tổ chức sự kiện và du lịch trải nghiệm cho doanh nghiệp dịch vụ. Cùng bạn phát triển.'
  },
  {
    path: '/ve-danava/', name: 'Về DANAVA', image: '/assets/legacy/event-group.webp',
    title: 'Về DANAVA: câu chuyện, sứ mệnh và đội ngũ',
    description: 'Câu chuyện, sứ mệnh, nguyên tắc làm việc và đội ngũ DANAVA Solutions: đồng hành cùng doanh nghiệp dịch vụ bằng công nghệ, truyền thông và trải nghiệm.'
  },
  {
    path: '/giai-phap/', name: 'Giải pháp',
    title: 'Giải pháp: phần mềm quản lý, website, sự kiện và du lịch',
    description: 'Phần mềm quản lý phòng tập DANAVA Studio, thiết kế website, sự kiện & truyền thông, du lịch và cộng đồng: chọn đúng giải pháp cho bài toán của doanh nghiệp.'
  },
  {
    path: '/giai-phap/hello-danava/', name: 'Hello DANAVA (bảng giá)', image: '/assets/products/hello-pricing.webp',
    title: 'Hello DANAVA — Bảng giá và báo giá DANAVA Studio',
    description: 'Hello DANAVA: bảng giá 4 gói DANAVA Studio, so sánh tính năng từng module và nhận báo giá cho phòng tập Gym, Yoga, Pilates, bể bơi, Spa.'
  },
  {
    path: '/giai-phap/danava-go/', name: 'DANAVA GO', image: '/assets/products/go-hero.webp',
    title: 'DANAVA GO — Đặt vé xe khách trực tuyến',
    description: 'DANAVA GO: nền tảng đặt vé xe khách trực tuyến cao cấp do DANAVA phát triển. Chọn chuyến, chọn chỗ trực quan, nhận vé điện tử.'
  },
  {
    path: '/giai-phap/danava-work/', name: 'DANAVA Work', image: '/assets/products/work-login.webp',
    title: 'DANAVA Work — Bảng công việc của đội ngũ DANAVA',
    description: 'DANAVA Work: nền tảng quản trị công việc, nơi đội ngũ DANAVA phân bổ và theo dõi công việc của nhóm.'
  },
  {
    path: '/giai-phap/setup-van-hanh-phong-gym/', name: 'Setup & vận hành phòng gym', absoluteTitle: true,
    title: 'Setup và vận hành phòng gym trọn gói | DANAVA Solutions',
    description: 'DANAVA Solutions tư vấn setup phòng gym, triển khai phần mềm quản lý hội viên và truyền thông khai trương. Gọi 0935 91 7677 để trao đổi về phòng tập của bạn.'
  },
  {
    path: '/thiet-bi-gym/', name: 'Thiết bị phòng gym',
    title: 'Thiết bị phòng gym: máy chạy bộ, giàn tạ, ghế tạ',
    description: 'Danh mục thiết bị phòng gym kèm kích thước thật và giá. Đặt máy vào phòng lab 3D của DANAVA để xem bố cục và tổng chi phí cho phòng tập của bạn.'
  },
  {
    path: '/bao-gia-setup-phong-gym/', name: 'Phòng lab 3D setup phòng gym',
    title: 'Tự thiết kế phòng gym 3D và tính chi phí thiết bị',
    description: 'Nhập diện tích, chọn ô gạch sàn, kéo thả máy chạy bộ, giàn tạ, ghế tạ vào phòng 3D và xem tổng chi phí thiết bị. Gửi bản thiết kế cho DANAVA để nhận báo giá.'
  },
  {
    path: '/dich-vu/', name: 'Dịch vụ',
    title: 'Dịch vụ: truyền thông, landing page, sự kiện và du lịch',
    description: 'Dịch vụ của DANAVA ngoài phần mềm: truyền thông nội dung, thiết kế landing page, tổ chức sự kiện và du lịch trải nghiệm.'
  },
  {
    path: '/du-an/', name: 'Dự án',
    title: 'Dự án và case study',
    description: 'Câu chuyện triển khai thực tế của DANAVA Solutions cùng HARIVER Gym, Huế Pilates & Yoga và các doanh nghiệp dịch vụ.'
  },
  {
    path: '/he-sinh-thai/', name: 'Hệ sinh thái', image: '/assets/presentation/studio-dashboard.webp',
    title: 'Hệ sinh thái DANAVA',
    description: 'Hệ sinh thái DANAVA: phần mềm DANAVA Studio, nền tảng danava.vn, học yoga online, website, sự kiện, đặt vé DANAVA GO và cộng đồng Yoga Club Vietnam.'
  },
  {
    path: '/doi-tac/', name: 'Đối tác', image: '/assets/partners/covers/yoga-club-vietnam.webp',
    title: 'Đối tác đồng hành',
    description: 'Đối tác đồng hành và các địa điểm yoga, pilates, gym, spa trên nền tảng danava.vn: địa chỉ, giờ mở cửa, dịch vụ và tiện ích.'
  },
  {
    path: '/doi-ngu/', name: 'Đội ngũ',
    title: 'Đội ngũ DANAVA',
    description: 'Gặp gỡ đội ngũ chuyên gia công nghệ, truyền thông, kinh doanh và vận hành tại DANAVA Solutions. Minh bạch chuyên môn, liên kết portfolio thực tế và đồng hành trực tiếp.'
  },
  {
    path: '/tuyen-dung/', name: 'Tuyển dụng', image: '/assets/about/office.webp',
    title: 'Tuyển dụng',
    description: 'Cơ hội làm việc tại DANAVA Solutions ở Đà Nẵng: công nghệ, truyền thông, kinh doanh và vận hành. Xem vị trí đang tuyển hoặc gửi hồ sơ mở.'
  },
  {
    path: '/lien-he/', name: 'Liên hệ', image: '/assets/legacy/event-group.webp',
    title: 'Liên hệ tư vấn và báo giá',
    description: 'Trao đổi trực tiếp với DANAVA Solutions qua hotline 0935 91 76 77, email hello@danava.vn hoặc gửi yêu cầu tư vấn số hóa phòng tập và truyền thông trực tuyến.'
  },
  {
    path: '/bao-gia-web/', name: 'Báo giá website',
    title: 'Báo giá thiết kế landing page và website',
    description: 'Điền yêu cầu để nhận báo giá tham khảo thiết kế landing page hoặc website doanh nghiệp tại DANAVA.'
  },
  {
    path: '/bao-gia-su-kien/', name: 'Báo giá tổ chức sự kiện',
    title: 'Báo giá tổ chức sự kiện trọn gói',
    description: 'Kể về sự kiện của bạn: loại sự kiện, quy mô, hạng mục và ngân sách. Nhận khoảng chi phí tham khảo ngay, chuyên viên DANAVA xác nhận báo giá chính thức.'
  },
  {
    path: '/chinh-sach-dich-vu/', name: 'Chính sách dịch vụ',
    title: 'Chính sách dịch vụ và bảo hành kỹ thuật',
    description: 'Quy chuẩn phạm vi hỗ trợ, cam kết chất lượng SLA 99.9%, chính sách bảo hành phần mềm và website 12 tháng, bàn giao mã nguồn sạch và bảo mật tài nguyên tại DANAVA Solutions.'
  },
  {
    path: '/chinh-sach-rieng-tu/', name: 'Chính sách riêng tư',
    title: 'Chính sách quyền riêng tư và đo lường',
    description: 'Thông tin minh bạch về cơ chế tiếp nhận dữ liệu qua Form liên hệ, hệ thống đo lường nội bộ ẩn danh SHA-256 và chính sách bảo vệ quyền riêng tư tại DANAVA Solutions.'
  }
];

export const staticSeo = (path: string) => STATIC_SEO.find(p => p.path === path);
