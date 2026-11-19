/**
 * Sản phẩm số & website DANAVA đã thực hiện.
 * - Trang chủ, chương "07 · Sản phẩm số": hiện HOME_LIMIT mục đầu tiên.
 * - Trang /giai-phap/thiet-ke-website/ (Website & Landing Page): hiện toàn bộ danh sách.
 *
 * THÊM DỰ ÁN MỚI: chép một khối { ... } bên dưới, sửa nội dung, rồi:
 *   - đặt ảnh chụp màn hình (tỉ lệ 16:10, ví dụ 1200×750) vào public/assets/portfolio/<ten>.webp
 *     (chưa có ảnh thì để image: '' — thẻ sẽ hiện khung chờ có tên dự án)
 *   - `url` để trống ('') nếu dự án chưa có tên miền công khai
 *   - thứ tự trong mảng = thứ tự hiển thị
 */
export type PortfolioItem = {
  /** Tên sản phẩm */
  name: string;
  /** Loại sản phẩm, hiện thành nhãn nhỏ */
  kind: string;
  /** Mô tả ngắn 1–2 câu */
  description: string;
  /** Ảnh chụp màn hình trong public/ ('' nếu chưa có) */
  image: string;
  /** Địa chỉ website ('' nếu chưa công khai) */
  url: string;
  /** Công nghệ / điểm nổi bật, 2–4 mục */
  tags: string[];
};

/** Số dự án hiện trên trang chủ (phần còn lại xem ở trang Website & Landing Page). */
export const HOME_LIMIT = 6;

export const PORTFOLIO: PortfolioItem[] = [
  {
    name: 'DANAVA GO',
    kind: 'Nền tảng đặt vé xe khách',
    description: 'Đặt vé xe khách đa nhà xe: tìm chuyến, chọn ghế cabin/limousine, vé điện tử và cổng quản trị điều phối cho từng nhà xe.',
    image: '/assets/portfolio/danava-go.webp',
    url: 'https://danavago.com',
    tags: ['React 19', 'Laravel', 'Đa nhà xe'],
  },
  {
    name: 'danava.vn',
    kind: 'Nền tảng wellness',
    description: 'Kết nối phòng gym, yoga, pilates, khóa học, tour wellness và mua sắm; cơ sở vận hành bằng DANAVA Studio.',
    image: '/assets/portfolio/danava-vn.webp',
    url: 'https://danava.vn',
    tags: ['Marketplace', 'Hội viên', 'Đặt lịch'],
  },
  {
    name: 'Vinhomes Hải Vân Bay',
    kind: 'Landing page bất động sản',
    description: 'Landing page dự án thành phố nghỉ dưỡng bên vịnh Hải Vân, Đà Nẵng: trải nghiệm, quỹ căn, tiện ích, vị trí và đăng ký tư vấn.',
    image: '/assets/portfolio/vinhomes-hai-van-bay.webp',
    url: 'https://vinhomeshaivanbaydanang.vn',
    tags: ['React', 'Vite', 'Bất động sản'],
  },
  {
    name: 'DANAVA WORK',
    kind: 'Quản trị công việc nội bộ',
    description: 'Bảng công việc Kanban, danh sách, lịch; phân quyền theo phòng ban, theo dõi hiệu suất và thông báo qua Telegram.',
    image: '/assets/portfolio/danava-work.webp',
    url: 'https://workspace.danava.com.vn',
    tags: ['Laravel 12', 'React 19', 'PWA'],
  },
  {
    name: 'GLG · The Collection',
    kind: 'Website chuỗi dịch vụ',
    description: 'Năm không gian trong một thương hiệu: khách sạn, cà phê, mầm non, yoga và spa, chuyển cảnh liền mạch giữa các trang.',
    image: '/assets/portfolio/glg.webp',
    url: 'https://glg.danava.com.vn',
    tags: ['HTML/CSS/JS', 'View Transition', 'Đa thương hiệu'],
  },
  {
    name: 'Bước Chạy Nhịp Sống',
    kind: 'Landing page sự kiện',
    description: 'Trang đăng ký giải chạy marathon Đà Nẵng: thông tin cự ly, lịch trình và đăng ký tham gia ngay trên điện thoại.',
    image: '/assets/portfolio/buoc-chay-nhip-song.webp',
    url: 'https://buoc-nhay-nhip-song.vercel.app',
    tags: ['Landing page', 'Sự kiện thể thao', 'Đăng ký'],
  },
  {
    name: 'Hello DANAVA',
    kind: 'Báo giá DANAVA Studio',
    description: 'Chọn mô hình kinh doanh, so sánh gói tính năng và nhận báo giá ngay; kèm cổng quản trị bán hàng nội bộ.',
    image: '/assets/portfolio/hello-danava.webp',
    url: 'https://hello.danava.vn',
    tags: ['Báo giá tự động', 'Node.js', 'Dashboard'],
  },
  {
    name: 'letanthanh.com',
    kind: 'Thương hiệu cá nhân Founder',
    description: 'Website cá nhân của Founder & CEO Lê Tấn Thành: blog, dịch vụ tư vấn chuyển đổi số và hệ sinh thái DANAVA.',
    image: '/assets/portfolio/letanthanh.webp',
    url: 'https://letanthanh.com',
    tags: ['Next.js 16', 'Blog', 'Personal brand'],
  },
  {
    name: 'Wellosophy',
    kind: 'Landing page sản phẩm',
    description: 'Landing page giới thiệu Bộ 3 Cân Bằng Trục Não Da Ruột Wellosophy by Oriflame, tối ưu cho bán hàng trên điện thoại.',
    image: '/assets/portfolio/wellosophy.webp',
    url: 'https://wellosophy.danava.com.vn',
    tags: ['Landing page', 'Video', 'Bán hàng'],
  },
  {
    name: 'Omachi',
    kind: 'Website sản phẩm & bán hàng',
    description: 'Trang sản phẩm mì khoai tây Omachi: chọn hương vị, quy cách gói/combo/thùng, giỏ hàng và công thức món ngon.',
    image: '/assets/portfolio/omachi.webp',
    url: '',
    tags: ['React', 'Vite', 'E-commerce'],
  },
  {
    name: 'TERRA Bất Động Sản',
    kind: 'Nền tảng bất động sản',
    description: 'Nền tảng quản trị và giao dịch địa ốc Đà Nẵng với sa bàn 3D tương tác, bản đồ quy hoạch và phân quyền giao dịch minh bạch.',
    image: '/assets/portfolio/terra.webp',
    url: '',
    tags: ['Next.js 15', 'Sa bàn 3D', 'Bản đồ'],
  },
  {
    name: 'DriveRent',
    kind: 'Website cho thuê xe',
    description: 'Thuê xe tự lái và có tài xế: tìm xe theo thành phố, thời gian nhận/trả, đội xe SUV, sedan, xe điện và hỗ trợ 24/7.',
    image: '/assets/portfolio/driverent.webp',
    url: '',
    tags: ['React', 'Laravel', 'FastAPI'],
  },
  {
    name: 'AURUM',
    kind: 'Dashboard giá vàng',
    description: 'Theo dõi giá vàng, bạc, kim cương và tỷ giá theo thời gian thực, biểu đồ biến động và chỉ số tâm lý thị trường.',
    image: '/assets/portfolio/aurum.webp',
    url: '',
    tags: ['Next.js', 'Three.js', 'Realtime'],
  },
  {
    name: 'GLG Hotel',
    kind: 'Website đặt phòng khách sạn',
    description: 'Đặt phòng khách sạn tiếng Việt với khu vực vận hành riêng cho lễ tân và quản lý tại /admin.',
    image: '',
    url: '',
    tags: ['Next.js', 'Đặt phòng', 'Admin'],
  },
  {
    name: 'DANAVA Page',
    kind: 'Công cụ nội dung bằng AI',
    description: 'Công cụ nội bộ tạo nội dung bằng AI và đăng bài tự động lên Facebook Page, có xem trước bài viết trước khi đăng.',
    image: '',
    url: '',
    tags: ['React', 'AI', 'Facebook API'],
  },
];
