/**
 * Nội dung giới thiệu doanh nghiệp dùng chung cho trang chủ (bản rút gọn) và /ve-danava/ (bản đầy đủ).
 * Nguồn: trang Về DANAVA, Company Profile 2026 đã có trên website. Không thêm số liệu.
 */
const PF = '/assets/profile/';

/** Lý do lựa chọn DANAVA — nguyên tắc làm việc (không phải số liệu). */
export const PRINCIPLES = [
  { key: 'field', title: 'Thấu hiểu thực địa', text: 'Xuống tận cơ sở, quan sát giờ cao điểm và quy trình tại quầy để thiết kế thao tác thuận tiện nhất.' },
  { key: 'transparent', title: 'Minh bạch số liệu', text: 'Không số liệu ảo, không hứa hẹn viển vông. Chi phí và kết quả được báo cáo từ hệ thống chính chủ.' },
  { key: 'ownership', title: 'Tài sản thuộc về khách hàng', text: 'Website, tài khoản quảng cáo và dữ liệu khách hàng thuộc quyền sở hữu của doanh nghiệp.' },
  { key: 'longterm', title: 'Đồng hành dài hạn', text: 'Bàn giao đi cùng đào tạo, hỗ trợ kỹ thuật và cải tiến theo sự phát triển của cơ sở.' }
] as const;

/** Quy trình hợp tác chung (tổng hợp từ quy trình từng dịch vụ). */
export const COLLAB_STEPS = [
  { title: 'Trao đổi nhu cầu', text: 'Bạn gửi yêu cầu hoặc gọi hotline. Chuyên viên tìm hiểu mô hình, mục tiêu và hiện trạng.' },
  { title: 'Đề xuất & báo giá', text: 'DANAVA gửi phạm vi công việc, tiến độ và chi phí để bạn xem xét trước khi bắt đầu.' },
  { title: 'Triển khai & nghiệm thu', text: 'Thực hiện theo từng giai đoạn, cùng bạn kiểm tra trên bản chạy thử trước khi bàn giao.' },
  { title: 'Bàn giao & đồng hành', text: 'Bàn giao tài khoản, tài liệu hướng dẫn và hỗ trợ theo chính sách dịch vụ.' }
];

export const GOALS = [
  { n: 'I', title: 'Giá trị cốt lõi', text: 'Con người là nền tảng. Sáng tạo và cải tiến định hướng cách làm. DANAVA đề cao sự tận tâm, tinh thần hợp tác và trách nhiệm trong từng chương trình.' },
  { n: 'II', title: 'Sứ mệnh', text: 'Kết nối ý tưởng với nguồn lực thực hiện, đồng hành cùng doanh nghiệp tạo nên những sản phẩm, sự kiện chỉn chu, giàu trải nghiệm và mang giá trị cho khách hàng, đối tác, cộng đồng.' },
  { n: 'III', title: 'Tầm nhìn', text: 'Phát triển thành đối tác công nghệ, sự kiện và truyền thông đáng tin cậy; không ngừng ứng dụng công nghệ, nâng cao năng lực sáng tạo và chất lượng triển khai.' }
];

export const MILESTONES = [
  { year: '2021', title: 'Khởi đầu kết nối số & cộng đồng', text: 'Triển khai thiết kế website doanh nghiệp và đồng hành cùng các câu lạc bộ yoga tại Đà Nẵng và miền Trung.', image: '/assets/legacy/community.webp' },
  { year: '2023', title: 'Chuẩn hóa hệ sinh thái', text: 'Quy tụ đội ngũ cốt lõi cho các mảng công nghệ quản trị, website, sự kiện & truyền thông, du lịch và cộng đồng.', image: '/assets/legacy/event-group.webp' },
  { year: '2024', title: 'Chuỗi sự kiện Cổng Năng Lượng', text: 'Đồng hành tổ chức Soundbath Live Concert ngày 05/05/2024 tại Đà Nẵng cùng Team Tumy và các câu lạc bộ yoga.', image: '/assets/legacy/post-energy.webp' },
  { year: '2026', title: 'Nền tảng DANAVA Studio', text: 'Triển khai phần mềm DANAVA Studio và app hội viên mang thương hiệu riêng cho HARIVER Gym và Huế Pilates & Yoga.', image: '/assets/presentation/studio-dashboard.webp' }
];

/** Ảnh hoạt động từ Company Profile 2026 (đã có trên website). */
export const MOMENTS = [
  { src: `${PF}who-gala.webp`, title: 'Gala & sân khấu' },
  { src: `${PF}pnj-2.webp`, title: 'Kick-off PNJ · Aeon Mall Huế' },
  { src: `${PF}highlands-1.webp`, title: 'Đêm Trăng Rằm · Highlands' },
  { src: `${PF}waterrun-1.webp`, title: 'Water Run · Revive' },
  { src: `${PF}ariyana-booth.webp`, title: 'Booth sự kiện · Ariyana' },
  { src: `${PF}lutech-1.webp`, title: 'LUTECH · Tap to TOP' },
  { src: `${PF}everlastify-2.webp`, title: 'EVERLASTIFY · Hello Summer' }
];
