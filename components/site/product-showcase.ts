/**
 * Ảnh giao diện thật của DANAVA Studio, dùng ở /giai-phap/danava-studio/.
 * Ảnh lấy từ bộ hướng dẫn sử dụng (dự án danava).
 * Dữ liệu trong ảnh là dữ liệu mẫu (demo).
 */
import type { ShotGroup } from './ProductGallery';

const S = '/assets/studio';

export const STUDIO_GALLERY: ShotGroup[] = [
  {
    id: 'quan-tri',
    label: 'Phần mềm quản lý',
    device: 'desktop',
    lead: 'Màn hình dành cho chủ cơ sở, lễ tân và huấn luyện viên. Chạy trên trình duyệt, không cần cài đặt.',
    shots: [
      { src: `${S}/dashboard.webp`, title: 'Tổng quan', text: 'Doanh thu, hội viên mới, lịch tập và việc cần làm trong ngày.' },
      { src: `${S}/members.webp`, title: 'Hội viên', text: 'Danh sách, trạng thái gói, hạn thẻ, lọc và xuất CSV.' },
      { src: `${S}/packages.webp`, title: 'Gói tập', text: 'Gói theo thời hạn hoặc theo buổi, đặt giá và bật/tắt bán.' },
      { src: `${S}/class-passes.webp`, title: 'Thẻ tập theo buổi', text: 'Combo buổi lẻ, ClassPass dùng được ở nhiều câu lạc bộ.' },
      { src: `${S}/classes.webp`, title: 'Lịch lớp', text: 'Lịch tuần theo phòng tập và huấn luyện viên.' },
      { src: `${S}/bookings.webp`, title: 'Đặt chỗ hôm nay', text: 'Danh sách đặt chỗ, check-in, đánh dấu vắng hoặc hủy.' },
      { src: `${S}/appointments.webp`, title: 'Lịch hẹn PT', text: 'Buổi tập 1-1 với huấn luyện viên, trạng thái và học phí.' },
      { src: `${S}/checkin.webp`, title: 'Check-in', text: 'Quét mã QR trên app hội viên hoặc nhập mã, số điện thoại.' },
      { src: `${S}/lockers.webp`, title: 'Tủ đồ', text: 'Sơ đồ tủ nam/nữ, cho thuê và theo dõi trạng thái.' },
      { src: `${S}/pos.webp`, title: 'Bán hàng (POS)', text: 'Bán nước, phụ kiện tại quầy, thu tiền mặt hoặc chuyển khoản.' },
      { src: `${S}/sell.webp`, title: 'Bán gói cho hội viên', text: 'Chọn hội viên, gói, người bán và ngày bắt đầu.' },
      { src: `${S}/inventory.webp`, title: 'Kho hàng', text: 'Tồn kho, giá vốn và giá bán từng sản phẩm.' },
      { src: `${S}/staff.webp`, title: 'Nhân sự & HLV', text: 'Phân quyền, chấm công, lương và quyền theo vai trò.' },
      { src: `${S}/commissions.webp`, title: 'Hoa hồng nhân viên', text: 'Hoa hồng bán gói, bán hàng, dạy PT theo từng nhân viên.' },
      { src: `${S}/reports.webp`, title: 'Báo cáo', text: 'Doanh thu theo ngày, hội viên, lớp học và tỷ lệ đặt chỗ.' },
      { src: `${S}/wallet.webp`, title: 'Ví câu lạc bộ', text: 'Số dư, dòng tiền vào/ra và lịch sử giao dịch.' }
    ]
  },
  {
    id: 'app-hoi-vien',
    label: 'App hội viên',
    device: 'phone',
    lead: 'Hội viên tự đăng ký, gia hạn, thanh toán và check-in trên điện thoại. Ảnh từ bộ hướng dẫn sử dụng, chụp trên cơ sở demo với dữ liệu mẫu.',
    shots: [
      { src: `${S}/app-01-trang-chu.webp`, title: 'Trang chủ', text: 'Gói đang dùng, check-in nhanh, ví và điểm thưởng.' },
      { src: `${S}/app-05-chon-phong-tap.webp`, title: 'Chọn phòng tập', text: 'Tìm phòng tập theo tên hoặc khu vực.' },
      { src: `${S}/app-06-chon-goi.webp`, title: 'Chọn gói', text: 'Xem quyền lợi và giá từng gói trước khi mua.' },
      { src: `${S}/app-07-gia-nuoc-ngoai.webp`, title: 'Giá cho khách nước ngoài', text: 'Bảng giá riêng cho khách Việt Nam và Foreigner.' },
      { src: `${S}/app-08-nhap-cccd.webp`, title: 'Thông tin hợp đồng', text: 'Nhập CCCD/hộ chiếu để lập hợp đồng điện tử.' },
      { src: `${S}/app-09-qr-thanh-toan.webp`, title: 'Thanh toán QR', text: 'Quét mã chuyển khoản, hệ thống tự xác nhận.' },
      { src: `${S}/app-02-goi-cua-toi.webp`, title: 'Gói tập của tôi', text: 'Hạn dùng, số ngày còn lại và lịch sử check-in.' },
      { src: `${S}/app-03-gia-han.webp`, title: 'Gia hạn', text: 'Gia hạn hoặc nâng cấp gói ngay trên app.' },
      { src: `${S}/app-04-face-id.webp`, title: 'Check-in bằng khuôn mặt', text: 'Đăng ký khuôn mặt để vào cửa không cần thẻ.' },
      { src: `${S}/app-10-checkin.webp`, title: 'Mã QR check-in', text: 'Đưa mã cho lễ tân hoặc quét tại quầy.' },
      { src: `${S}/app-11-thong-bao.webp`, title: 'Cài đặt thông báo', text: 'Chọn nhận nhắc lịch, hạn gói qua app, Zalo, email, SMS.' },
      { src: `${S}/app-12-doi-qua.webp`, title: 'Điểm thưởng', text: 'Tích điểm và đổi buổi tập, voucher giảm giá.' },
      { src: `${S}/app-13-nhieu-phong-tap.webp`, title: 'Nhiều phòng tập', text: 'Một tài khoản dùng cho nhiều phòng tập khác nhau.' },
      { src: `${S}/app-14-hop-dong.webp`, title: 'Hợp đồng điện tử', text: 'Xem lại hợp đồng và điều khoản đã ký.' }
    ]
  },
  {
    id: 'website',
    label: 'Website & Khóa học online',
    device: 'desktop',
    lead: 'Mỗi cơ sở có website riêng để bán gói, khóa học online, tour và sản phẩm, đồng bộ dữ liệu với phần mềm.',
    shots: [
      { src: `${S}/web-home.webp`, title: 'Trang chủ nền tảng', text: 'Tìm phòng tập, khóa học, tour wellness và sản phẩm.' },
      { src: `${S}/web-courses.webp`, title: 'Khóa học', text: 'Danh sách khóa học online của các câu lạc bộ.' },
      { src: `${S}/web-course-detail.webp`, title: 'Chi tiết khóa học', text: 'Giới thiệu, giáo trình, giá và nút đăng ký.' },
      { src: `${S}/web-tours.webp`, title: 'Tour wellness', text: 'Tour yoga, retreat và hành trình nghỉ dưỡng.' },
      { src: `${S}/web-tour-detail.webp`, title: 'Chi tiết tour', text: 'Lịch trình, dịch vụ bao gồm và đặt chỗ.' },
      { src: `${S}/web-events.webp`, title: 'Sự kiện', text: 'Workshop, lớp cộng đồng và sự kiện sắp diễn ra.' },
      { src: `${S}/web-shop.webp`, title: 'Cửa hàng', text: 'Sản phẩm của phòng tập bán online.' },
      { src: `${S}/web-product-detail.webp`, title: 'Chi tiết sản phẩm', text: 'Hình ảnh, giá, mô tả và đặt mua.' },
      { src: `${S}/web-blog.webp`, title: 'Blog', text: 'Bài viết kiến thức và tin tức của cơ sở.' },
      { src: `${S}/learn-course-edit.webp`, title: 'Soạn khóa học', text: 'Tạo khóa học online, video bài giảng và giá bán.' },
      { src: `${S}/learn-payment-gateways.webp`, title: 'Cổng thanh toán', text: 'Kết nối chuyển khoản QR và cổng thanh toán online.' },
      { src: `${S}/learn-certificate.webp`, title: 'Chứng chỉ hoàn thành', text: 'Cấp chứng chỉ có mã QR xác thực cho học viên.' }
    ]
  }
];
