/*
 * Dữ liệu mặc định cho bộ sưu tập trưng bày (data.showcase).
 * - Website & Landing Page: danh sách sản phẩm trước đây nằm cứng trong components/site/portfolio.ts.
 *   Đã gỡ theo yêu cầu (19/11/2026): Bước Chạy Nhịp Sống, Omachi, AURUM, DriveRent.
 * - Sự kiện & Truyền thông: các chương trình trong Company Profile 2026 (trước đây ở trang Marketing).
 * Phạm vi (scope) chỉ ghi điều tư liệu có sẵn nêu rõ; chương trình chưa rõ phạm vi để scope rỗng
 * và chỉ hiển thị như hình ảnh hoạt động, không gắn nhãn "DANAVA thực hiện…".
 * Ảnh Vinhomes Hải Vân Bay chụp từ website đang chạy (public/assets/portfolio/vinhomes/sources.json).
 */
import type { ShowcaseItem } from './content.ts';

const UPDATED = '2026-11-19';
const VH = '/assets/portfolio/vinhomes/';
const PF = '/assets/profile/';

type Seed = Partial<ShowcaseItem> & Pick<ShowcaseItem, 'id' | 'slug' | 'serviceId' | 'name' | 'kind' | 'category' | 'description'>;
const item = (x: Seed): ShowcaseItem => ({
  image: '', mobileImage: '', motion: '', motionPoster: '', gallery: [], url: '', place: '', tags: [], scope: [],
  featured: false, published: true, caseStudy: false, intro: '', highlights: [], disclaimer: '', updated: UPDATED,
  ...x
});

export const WEB_CATEGORIES = ['Landing page', 'Website thương hiệu', 'Nền tảng & ứng dụng', 'Bán hàng & đặt chỗ'];

export const SHOWCASE_SEEDS: ShowcaseItem[] = [
  /* -------------------------------------------- Website & Landing Page */
  item({
    id: 'web-vinhomes-hai-van-bay', slug: 'vinhomes-hai-van-bay-website', serviceId: 'website',
    name: 'Vinhomes Hải Vân Bay', kind: 'Landing page bất động sản nghỉ dưỡng', category: 'Landing page',
    description: 'Landing page dự án thành phố nghỉ dưỡng bên vịnh Hải Vân, Đà Nẵng: trải nghiệm, quỹ căn, tiện ích, vị trí và đăng ký tư vấn.',
    image: VH + 'desktop-hero.webp', mobileImage: VH + 'mobile-hero.webp',
    motion: VH + 'mobile-scroll.webp', motionPoster: VH + 'mobile-scroll-poster.webp',
    url: 'https://vinhomeshaivanbaydanang.vn', tags: ['Thiết kế riêng', 'Ưu tiên điện thoại', 'React', 'Vite'],
    featured: true, caseStudy: true,
    scope: [
      'Thiết kế giao diện landing page cho máy tính và điện thoại',
      'Lập trình giao diện (React, Vite)',
      'Tổ chức các khu nội dung: trải nghiệm, quỹ căn, tiện ích, vị trí, thư viện ảnh, hỏi đáp và đăng ký tư vấn'
    ],
    intro: 'Một landing page bất động sản được kể như tạp chí nghỉ dưỡng: người xem đi qua một ngày ở Làng Vân, từ bình minh trên vịnh đến lễ hội đêm, trước khi tra cứu quỹ căn và để lại thông tin. DANAVA thiết kế và lập trình website; ảnh dưới đây chụp trực tiếp từ website đang chạy.',
    highlights: [
      { title: 'Ngôn ngữ nghỉ dưỡng', text: 'Nền xanh rừng kết hợp vàng đồng, tiêu đề serif và dòng chữ viết tay “Làng Vân — Sống như một kỳ nghỉ” tạo cảm giác kỳ nghỉ thay vì một bảng tin bất động sản.' },
      { title: 'Kể chuyện theo một ngày', text: 'Tiện ích được giới thiệu qua dòng thời gian trong ngày: cáp treo buổi sớm, phiêu lưu giữa rừng, bữa tối ven hồ, lễ hội đêm.' },
      { title: 'Quỹ căn tra cứu ngay trên trang', text: 'Chọn phân khu, lọc theo loại hình và mở thông tin từng căn mà không phải rời trang.' },
      { title: 'Thiết kế cho ngón tay', text: 'Trên điện thoại, thẻ nội dung vuốt ngang và thanh Gọi – Zalo – Nhận bảng giá luôn nằm trong tầm ngón cái.' }
    ],
    gallery: [
      { src: VH + 'desktop-mot-ngay.webp', caption: 'Một ngày ở Làng Vân: tiện ích kể theo dòng thời gian' },
      { src: VH + 'desktop-quy-can.webp', caption: 'Quỹ căn theo phân khu, có bộ lọc' },
      { src: VH + 'desktop-cau-chuyen.webp', caption: 'Câu chuyện dự án và các điểm nhấn' },
      { src: VH + 'desktop-thu-vien.webp', caption: 'Thư viện “Không gian kể câu chuyện”' },
      { src: VH + 'desktop-dang-ky.webp', caption: 'Hỏi đáp và đăng ký nhận tư vấn' },
      { src: VH + 'mobile-quy-can.webp', caption: 'Quỹ căn trên điện thoại' },
      { src: VH + 'mobile-cau-chuyen.webp', caption: 'Câu chuyện dự án trên điện thoại' }
    ],
    disclaimer: 'DANAVA thiết kế và lập trình website. DANAVA không phải chủ đầu tư hay đơn vị phân phối dự án; thông tin bất động sản trên website thuộc đơn vị vận hành website.',
    seoTitle: 'Case study thiết kế website Vinhomes Hải Vân Bay',
    seoDescription: 'Cách DANAVA thiết kế landing page Vinhomes Hải Vân Bay: ngôn ngữ nghỉ dưỡng, kể chuyện theo một ngày, quỹ căn tra cứu ngay trên trang và trải nghiệm ưu tiên điện thoại.'
  }),
  item({ id: 'web-danava-go', slug: 'danava-go', serviceId: 'website', name: 'DANAVA GO', kind: 'Nền tảng đặt vé xe khách', category: 'Nền tảng & ứng dụng', description: 'Đặt vé xe khách đa nhà xe: tìm chuyến, chọn ghế cabin/limousine, vé điện tử và cổng quản trị điều phối cho từng nhà xe.', image: '/assets/portfolio/danava-go.webp', url: 'https://danavago.com', tags: ['React 19', 'Laravel', 'Đa nhà xe'] }),
  item({ id: 'web-danava-vn', slug: 'danava-vn', serviceId: 'website', name: 'danava.vn', kind: 'Nền tảng wellness', category: 'Nền tảng & ứng dụng', description: 'Kết nối phòng gym, yoga, pilates, khóa học, tour wellness và mua sắm; cơ sở vận hành bằng DANAVA Studio.', image: '/assets/portfolio/danava-vn.webp', url: 'https://danava.vn', tags: ['Marketplace', 'Hội viên', 'Đặt lịch'] }),
  item({ id: 'web-glg', slug: 'glg-the-collection', serviceId: 'website', name: 'GLG · The Collection', kind: 'Website chuỗi dịch vụ', category: 'Website thương hiệu', description: 'Năm không gian trong một thương hiệu: khách sạn, cà phê, mầm non, yoga và spa, chuyển cảnh liền mạch giữa các trang.', image: '/assets/portfolio/glg.webp', url: 'https://glg.danava.com.vn', tags: ['View Transition', 'Đa thương hiệu'] }),
  item({ id: 'web-wellosophy', slug: 'wellosophy', serviceId: 'website', name: 'Wellosophy', kind: 'Landing page sản phẩm', category: 'Landing page', description: 'Landing page giới thiệu Bộ 3 Cân Bằng Trục Não Da Ruột Wellosophy by Oriflame, tối ưu cho bán hàng trên điện thoại.', image: '/assets/portfolio/wellosophy.webp', url: 'https://wellosophy.danava.com.vn', tags: ['Video', 'Bán hàng'] }),
  item({ id: 'web-letanthanh', slug: 'letanthanh', serviceId: 'website', name: 'letanthanh.com', kind: 'Thương hiệu cá nhân Founder', category: 'Website thương hiệu', description: 'Website cá nhân của Founder & CEO Lê Tấn Thành: blog, dịch vụ tư vấn chuyển đổi số và hệ sinh thái DANAVA.', image: '/assets/portfolio/letanthanh.webp', url: 'https://letanthanh.com', tags: ['Blog', 'Personal brand'] }),
  item({ id: 'web-danava-work', slug: 'danava-work', serviceId: 'website', name: 'DANAVA WORK', kind: 'Quản trị công việc nội bộ', category: 'Nền tảng & ứng dụng', description: 'Bảng công việc Kanban, danh sách, lịch; phân quyền theo phòng ban, theo dõi hiệu suất và thông báo qua Telegram.', image: '/assets/portfolio/danava-work.webp', url: 'https://workspace.danava.com.vn', tags: ['Laravel 12', 'PWA'] }),
  item({ id: 'web-hello-danava', slug: 'hello-danava', serviceId: 'website', name: 'Hello DANAVA', kind: 'Báo giá DANAVA Studio', category: 'Nền tảng & ứng dụng', description: 'Chọn mô hình kinh doanh, so sánh gói tính năng và nhận báo giá ngay; kèm cổng quản trị bán hàng nội bộ.', image: '/assets/portfolio/hello-danava.webp', url: 'https://hello.danava.vn', tags: ['Báo giá tự động', 'Dashboard'] }),
  item({ id: 'web-terra', slug: 'terra-bat-dong-san', serviceId: 'website', name: 'TERRA Bất Động Sản', kind: 'Nền tảng bất động sản', category: 'Nền tảng & ứng dụng', description: 'Nền tảng quản trị và giao dịch địa ốc Đà Nẵng với sa bàn 3D tương tác, bản đồ quy hoạch và phân quyền giao dịch.', image: '/assets/portfolio/terra.webp', tags: ['Sa bàn 3D', 'Bản đồ'] }),
  // Chưa có ảnh giao diện → không công khai (tránh khung giữ chỗ)
  item({ id: 'web-glg-hotel', slug: 'glg-hotel', serviceId: 'website', name: 'GLG Hotel', kind: 'Website đặt phòng khách sạn', category: 'Bán hàng & đặt chỗ', description: 'Đặt phòng khách sạn tiếng Việt với khu vực vận hành riêng cho lễ tân và quản lý.', published: false }),
  item({ id: 'web-danava-page', slug: 'danava-page', serviceId: 'website', name: 'DANAVA Page', kind: 'Công cụ nội dung bằng AI', category: 'Nền tảng & ứng dụng', description: 'Công cụ nội bộ tạo nội dung bằng AI và đăng bài lên Facebook Page, có xem trước bài viết trước khi đăng.', published: false }),

  /* -------------------------------------------- Sự kiện & Truyền thông */
  item({ id: 'ev-phim-truong', slug: 'dao-cu-phim-truong-trung-vuong', serviceId: 'events', name: 'Đạo cụ phim trường', kind: 'Sân khấu & đạo cụ', category: 'Sân khấu & đạo cụ', place: 'Nhà hát Trưng Vương', description: 'Sân khấu và đạo cụ phim trường tại Nhà hát Trưng Vương.', image: PF + 'set-stage.webp', gallery: [{ src: PF + 'set-train.webp', caption: 'Đạo cụ phim trường' }, { src: PF + 'set-rocket.webp', caption: 'Đạo cụ phim trường' }], scope: ['Đạo cụ phim trường'], featured: true }),
  item({ id: 'ev-ariyana', slug: 'booth-su-kien-ariyana', serviceId: 'events', name: 'Booth sự kiện tại Ariyana', kind: 'Booth & không gian trưng bày', category: 'Booth & trưng bày', place: 'Ariyana', description: 'Hệ vách, nội dung sản phẩm và ánh sáng được kết hợp trong cùng không gian giới thiệu.', image: PF + 'ariyana-booth.webp', gallery: [{ src: PF + 'ariyana-build.webp', caption: 'Thi công booth' }], scope: ['Thi công booth & không gian trưng bày', 'Kết hợp hệ vách, nội dung sản phẩm và ánh sáng'], featured: true }),
  item({ id: 'ev-highlands', slug: 'dem-trang-ram-highlands', serviceId: 'events', name: 'Đêm Trăng Rằm Highlands', kind: 'Trang trí sự kiện', category: 'Trang trí & không gian', place: 'Highlands đường Bạch Đằng', description: 'Trang trí Đêm Trăng Rằm tại Highlands Bạch Đằng.', image: PF + 'highlands-1.webp', gallery: [{ src: PF + 'highlands-3.webp', caption: 'Đêm Trăng Rằm' }, { src: PF + 'highlands-2.webp', caption: 'Đêm Trăng Rằm' }, { src: PF + 'highlands-4.webp', caption: 'Đêm Trăng Rằm' }], scope: ['Trang trí không gian sự kiện Đêm Trăng Rằm'] }),
  item({ id: 'ev-everlastify', slug: 'everlastify-hello-summer', serviceId: 'events', name: 'EVERLASTIFY', kind: 'Trang trí thương hiệu', category: 'Trang trí & không gian', description: 'Trang trí thương hiệu và không gian theo chủ đề.', image: PF + 'everlastify-1.webp', gallery: [{ src: PF + 'everlastify-2.webp', caption: 'EVERLASTIFY · Hello Summer' }, { src: PF + 'everlastify-8.webp', caption: 'EVERLASTIFY' }, { src: PF + 'everlastify-6.webp', caption: 'EVERLASTIFY' }], scope: ['Trang trí thương hiệu và không gian theo chủ đề'] }),
  // Chương trình trong hồ sơ năng lực chưa ghi rõ phạm vi → chỉ hiện ảnh hoạt động, chờ DANAVA bổ sung phạm vi.
  item({ id: 'ev-pnj', slug: 'kick-off-pnj-aeon-hue', serviceId: 'events', name: 'Kick-off PNJ', kind: 'Sự kiện doanh nghiệp', category: 'Sự kiện doanh nghiệp', place: 'Aeon Mall Huế', description: 'Sự kiện kick-off PNJ tại Aeon Mall Huế.', image: PF + 'pnj-2.webp', gallery: [{ src: PF + 'pnj-1.webp', caption: 'Kick-off PNJ' }, { src: PF + 'pnj-3.webp', caption: 'Kick-off PNJ' }] }),
  item({ id: 'ev-water-run', slug: 'water-run-revive', serviceId: 'events', name: 'Hội thi Water Run – Revive', kind: 'Sự kiện ngoài trời', category: 'Sự kiện doanh nghiệp', place: 'Công viên Biển Đông', description: 'Hội thi Water Run của Revive tại Công viên Biển Đông.', image: PF + 'waterrun-3.webp', gallery: [{ src: PF + 'waterrun-1.webp', caption: 'Water Run' }, { src: PF + 'waterrun-4.webp', caption: 'Water Run' }] }),
  item({ id: 'ev-lutech', slug: 'lutech-tap-to-top', serviceId: 'events', name: 'LUTECH · Tap to TOP', kind: 'Lễ kỷ niệm', category: 'Sự kiện doanh nghiệp', description: 'Kỷ niệm 4 năm LUTECH với chủ đề “Tap to TOP”.', image: PF + 'lutech-4.webp', gallery: [{ src: PF + 'lutech-1.webp', caption: 'LUTECH' }, { src: PF + 'lutech-2.webp', caption: 'LUTECH' }] }),
  item({ id: 'ev-cbd', slug: 'cbd-team-building', serviceId: 'events', name: 'CBD – Team Building', kind: 'Team building', category: 'Sự kiện doanh nghiệp', description: 'Chương trình team building của CBD.', image: PF + 'cbd-2.webp', gallery: [{ src: PF + 'cbd-1.webp', caption: 'CBD Team Building' }] })
];
