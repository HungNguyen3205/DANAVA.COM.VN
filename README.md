# DANAVA Solutions

Website giới thiệu công ty được phát triển bằng **Next.js App Router, TypeScript, React và GSAP ScrollTrigger**. Nhận diện giữ logo gốc, xanh #2B4294, vàng cam #F5AE1B, xanh sáng #53A5DB, đỏ #EE3132.

## Giao diện công khai

| Đường dẫn | Nội dung |
|---|---|
| `/` | Trang chủ và hành trình cuộn 5 cảnh |
| `/giai-phap/` | Danh mục giải pháp |
| `/giai-phap/[slug]/` | 5 trang chi tiết giải pháp |
| `/du-an/` | Bộ lọc năng lực, vị trí chờ case study xác nhận |
| `/ve-danava/` | Người đại diện, sứ mệnh và đội ngũ |
| `/kien-thuc/` | Tìm kiếm và lọc bài viết |
| `/kien-thuc/[slug]/` | 3 bài lưu trữ có đường dẫn cố định |
| `/kien-thuc/doc/?id=...` | Đọc bài mới tạo trong bản thử |
| `/lien-he/` | Liên hệ bằng điện thoại và email |
| `/admin/` | Tổng quan giao diện quản trị |

## Animation trang chủ

Timeline GSAP được liên kết với cuộn qua ScrollTrigger, giữ sân khấu toàn màn hình, có scrub và chuyển động đảo khi cuộn ngược. Cận logo và camera thu từ nền kiến trúc → màn hình sản phẩm → người đại diện → hệ sinh thái → khám phá giải pháp. Có nút bỏ qua và chế độ giảm chuyển động theo thiết bị.

Đây là **cảnh 2.5D với các lớp hình ảnh và CSS perspective**, chưa phải một chuỗi render camera 3D như video tham khảo. Để khớp hoàn toàn video cần dựng và duyệt chuỗi khung hình hoặc mô hình 3D, cùng ảnh gốc người đại diện. Không tuyên bố bản này đã tái tạo chính xác video mẫu.

## Giao diện quản trị

Các màn: Tổng quan, Trang chủ, Số liệu, Bài viết, Nhân sự, Giải pháp, Cài đặt & Dữ liệu.

- Sửa tiêu đề, mô tả màn mở đầu, thông tin liên hệ, tên/mô tả/phạm vi giải pháp.
- Sửa số liệu, bật/tắt hiển thị; mặc định không hiển thị chỉ số chưa được xác nhận.
- Thêm/sửa/xóa hồ sơ nhân sự, đổi thứ tự, bật/tắt hiển thị.
- Thêm/sửa/xóa bài viết, tìm tiêu đề, chỉnh trạng thái hiển thị trong bản thử.
- Lưu bằng localStorage trên trình duyệt, xem thay đổi trên giao diện chính cùng origin.
- Xuất/nhập JSON có kiểm tra cấu trúc và giới hạn dung lượng, khôi phục mặc định.

**Đây là frontend quản trị thử nghiệm, chưa có xác thực, phân quyền, database, API, upload ảnh hoặc xuất bản lên server.** Không dùng cho nội dung mật. Dữ liệu không đồng bộ giữa người dùng/thiết bị. Không thay đổi đường dẫn các giải pháp qua import vì bản hiện tại xuất tĩnh; thêm route thật cần build lại. Bài mới sử dụng trang đọc chung theo ID.

## Chạy dự án

Yêu cầu **Node.js 22.18+** (khuyến nghị Node 24 LTS), npm.

```sh
npm ci
npm run dev:next
```

Mở địa chỉ Next.js in ra để phát triển với hot reload.

```sh
npm run check
npm test
npm run build
npm run dev
```

`npm run dev` phục vụ bản production trong `out/`, cần build trước. Có thể chỉ định `--port` cho cả hai script. Không cần cài Node.js trên hosting nếu chỉ upload bản xuất tĩnh.

## cPanel và backend tương lai

Build tạo thư mục `out/`. Sao lưu website/database hiện tại, sau đó upload **nội dung bên trong** thư mục này vào Document Root tên miền thử nghiệm. Giữ nguyên thư mục `_next`, `assets` và các thư mục trang con. Server phải phục vụ `index.html` trong thư mục và trả 404 cho URL không tồn tại.

Bản xuất tĩnh có thể chạy trên hosting phục vụ HTML/CSS/JS. Không xóa bài viết/WordPress/database cũ khi chưa có kế hoạch di chuyển và chuyển hướng 301.

Để vận hành CMS thật cần chốt hosting hỗ trợ Node.js, database, lưu trữ ảnh, xác thực và phân quyền. Hướng dự kiến Next.js + Payload CMS + PostgreSQL; chưa cài Payload vào bản giao diện này. Không đưa mật khẩu hoặc kết nối database vào frontend.

## Cấu trúc

```text
app/                  Routes công khai, admin và stylesheet
components/           Hero GSAP, layout, trang công khai và màn admin
lib/content.ts        Kiểu dữ liệu, nội dung mặc định, kiểm tra dữ liệu
public/assets/        Logo gốc và ảnh nền tối ưu WebP
scripts/              Preview production và chạy Next dev
tests/               Kiểm tra nội dung và import/export
```

## Nội dung cần xác nhận

Ảnh chân dung anh Lê Tấn Thành, ảnh nhân viên và chức danh; toàn văn bài viết, ngày đăng còn thiếu; ảnh dự án thực tế và số liệu. Danh sách nhân sự theo website đã đọc, không tự thay bằng nhân sự từ nguồn khác. Bài viết hiện là bản rút gọn giữ tiêu đề, ngày đăng và thông báo chờ nhập toàn văn — chưa di chuyển trọn kho nội dung. Ảnh không gian là ảnh minh họa, không khẳng định là văn phòng thật. Font Playfair Display và Be Vietnam Pro có fallback hệ thống; cần font UTM Eremitage và quyền sử dụng để áp dụng đúng font nhận diện.

## Kiểm tra

TypeScript, unit test xác thực dữ liệu và build export. Bản production đã được kiểm tra cấu trúc route/tài nguyên. Trình duyệt kiểm thử tại thời điểm phát triển chặn tài nguyên JavaScript `_next` bằng `ERR_BLOCKED_BY_CLIENT`, vì vậy kiểm thử tương tác GSAP và lưu localStorage trong môi trường đó chưa được xác nhận. Cần thử lại trên trình duyệt thông thường khi chạy localhost hoặc hosting thử nghiệm trước khi đưa vào production.
