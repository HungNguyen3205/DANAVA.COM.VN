/**
 * Nhóm ảnh trong Thư viện ảnh (admin): theo thư mục trong public/assets, đặt tên tiếng Việt và xếp theo khu vực website.
 * Ảnh tải lên qua admin (/assets/uploads/…) là nhóm riêng "Ảnh tải lên".
 * Thêm thư mục ảnh mới → thêm một dòng ở đây (test tests/media-library.test.ts báo thư mục chưa có nhóm).
 */
export type MediaGroup = { id: string; label: string; section: string; prefix: string; hint: string };

/** Thứ tự = thứ tự hiển thị. Tiền tố dài (thư mục con) đứng trước tiền tố ngắn để khớp đúng. */
export const MEDIA_GROUPS: MediaGroup[] = [
  { id: 'uploads', section: 'Tải lên', label: 'Ảnh tải lên', prefix: '/assets/uploads/', hint: 'Ảnh tải lên từ admin (tự nén WebP, xóa EXIF)' },

  { id: 'brand', section: 'Thương hiệu', label: 'Logo DANAVA', prefix: '/assets/danava-', hint: 'Logo, biểu tượng DANAVA (đầu trang, chân trang, chia sẻ)' },
  { id: 'brand-kit', section: 'Thương hiệu', label: 'Bộ nhận diện', prefix: '/assets/brand/', hint: 'Ảnh nhận diện thương hiệu' },
  { id: 'bct', section: 'Thương hiệu', label: 'Chứng nhận', prefix: '/assets/bct/', hint: 'Logo đã thông báo Bộ Công Thương' },
  { id: 'profile', section: 'Thương hiệu', label: 'Hồ sơ năng lực', prefix: '/assets/profile/', hint: 'Ảnh hồ sơ năng lực 2026: sân khấu, sự kiện, đội ngũ' },
  { id: 'about', section: 'Thương hiệu', label: 'Giới thiệu & văn phòng', prefix: '/assets/about/', hint: 'Trang Về DANAVA, ảnh văn phòng, nhà sáng lập' },

  { id: 'products-work', section: 'Sản phẩm', label: 'DANAVA Work', prefix: '/assets/products/danava-work/', hint: 'Ảnh màn hình DANAVA Work' },
  { id: 'products-go', section: 'Sản phẩm', label: 'DANAVA GO (sản phẩm)', prefix: '/assets/products/go/', hint: 'Ảnh màn hình DANAVA GO' },
  { id: 'products', section: 'Sản phẩm', label: 'Sản phẩm chung', prefix: '/assets/products/', hint: 'Ảnh đại diện các sản phẩm, Hello DANAVA' },
  { id: 'studio-ycv', section: 'Sản phẩm', label: 'Yoga Club Vietnam', prefix: '/assets/studio/ycv/', hint: 'Ảnh Yoga Club Vietnam trong trang Studio' },
  { id: 'studio', section: 'Sản phẩm', label: 'DANAVA Studio', prefix: '/assets/studio', hint: 'Phần mềm quản lý phòng tập: giao diện, tính năng' },
  { id: 'danavago', section: 'Sản phẩm', label: 'DANAVA GO (trang riêng)', prefix: '/assets/danavago/', hint: 'Ảnh trang giới thiệu DANAVA GO' },
  { id: 'ecosystem', section: 'Sản phẩm', label: 'Hệ sinh thái', prefix: '/assets/ecosystem/', hint: 'Trang Hệ sinh thái' },
  { id: 'presentation', section: 'Sản phẩm', label: 'Trình chiếu', prefix: '/assets/presentation/', hint: 'Ảnh dùng trong khối trình chiếu' },

  { id: 'portfolio-vinhomes', section: 'Dự án', label: 'Portfolio: Vinhomes', prefix: '/assets/portfolio/vinhomes/', hint: 'Website / landing page Vinhomes' },
  { id: 'portfolio-hudi', section: 'Dự án', label: 'Portfolio: HUDI Sofa', prefix: '/assets/portfolio/hudi-sofa/', hint: 'Website HUDI Sofa' },
  { id: 'portfolio', section: 'Dự án', label: 'Portfolio website', prefix: '/assets/portfolio/', hint: 'Website, landing page đã làm cho khách hàng' },
  { id: 'marketing-projects', section: 'Dự án', label: 'Dự án marketing', prefix: '/assets/marketing/projects/', hint: 'Logo và ảnh các khách hàng marketing' },
  { id: 'marketing', section: 'Dự án', label: 'Marketing & truyền thông', prefix: '/assets/marketing/', hint: 'Trang dịch vụ Digital Marketing' },

  { id: 'partners-marks', section: 'Đối tác', label: 'Logo đối tác (biểu tượng)', prefix: '/assets/partners/marks/', hint: 'Logo đã cắt gọn cho dải logo trang chủ' },
  { id: 'partners-covers', section: 'Đối tác', label: 'Ảnh bìa đối tác', prefix: '/assets/partners/covers/', hint: 'Ảnh bìa trang Đối tác' },
  { id: 'partners-places', section: 'Đối tác', label: 'Địa điểm danava.vn', prefix: '/assets/partners/places/', hint: 'Logo các địa điểm trên danava.vn/places' },
  { id: 'partners', section: 'Đối tác', label: 'Logo đối tác', prefix: '/assets/partners/', hint: 'Logo 15 đối tác đồng hành' },

  { id: 'blog', section: 'Bài viết', label: 'Ảnh bài viết', prefix: '/assets/blog/', hint: 'Ảnh bìa và ảnh trong bài Blogs' },
  { id: 'verified', section: 'Bài viết', label: 'Ảnh hoạt động đã xác minh', prefix: '/assets/verified/', hint: 'Ảnh workshop, sự kiện lấy từ bài viết gốc' },
  { id: 'legacy', section: 'Khác', label: 'Ảnh website cũ', prefix: '/assets/legacy/', hint: 'Ảnh mang sang từ website WordPress trước đây' },
  { id: 'menu', section: 'Khác', label: 'Menu', prefix: '/assets/menu/', hint: 'Ảnh trong menu' }
];

export const OTHER_GROUP: MediaGroup = { id: 'khac', section: 'Khác', label: 'Chưa phân nhóm', prefix: '', hint: 'Ảnh chưa thuộc nhóm nào' };

export const groupOf = (url: string): MediaGroup => MEDIA_GROUPS.find(g => url.startsWith(g.prefix)) || OTHER_GROUP;

/** Tên dễ đọc từ tên tệp: "hariver-gym-fitness.webp" → "hariver gym fitness" */
export const mediaName = (url: string) => decodeURIComponent(url.split('/').pop() || url).replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
