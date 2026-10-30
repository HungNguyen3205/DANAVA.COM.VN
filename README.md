# DANAVA Solutions

Trang chủ giới thiệu DANAVA với phần mở đầu điện ảnh điều khiển bằng cuộn chuột, nhận diện xanh #2B4294, vàng cam #F5AE1B, xanh sáng #53A5DB và đỏ #EE3132.

## Trải nghiệm

Màn hình được giữ cố định trong hành trình cuộn: logo → công nghệ → người đại diện Lê Tấn Thành → hệ sinh thái → khám phá giải pháp. Cuộn ngược đảo chuyển động. Có bỏ qua intro, menu mobile, hỗ trợ bàn phím và phiên bản giảm chuyển động theo thiết bị. Các nội dung bên dưới gồm giải pháp, DANAVA Studio, người đại diện, đội ngũ và liên hệ.

## Chạy và kiểm tra

Yêu cầu Node.js 20+. Không cần cài thư viện.

```sh
npm run check
npm test
npm run build
```

Mở qua HTTP bằng web server cục bộ hoặc thư mục `dist` trên hosting. Không dùng `file://` vì trình duyệt chặn JavaScript module và fetch JSON.

## Đưa lên cPanel

Sao lưu website và database đang chạy. Upload **nội dung bên trong** `dist/` vào Document Root của tên miền thử nghiệm trước. Sau khi kiểm tra, chuyển sang Document Root chính. Bản này là trang tĩnh, không yêu cầu Node.js trên hosting. Giữ lại đường dẫn cũ hoặc thiết lập redirect 301 theo kế hoạch di chuyển; không xóa bài viết/database WordPress để thay riêng trang chủ.

## Nội dung cần bổ sung

- Ảnh chân dung gốc anh Lê Tấn Thành và ảnh nhân viên. Các ô tên viết tắt là khung giữ chỗ, không phải ảnh nhân sự.
- Xác nhận chức danh và nhân sự trên website hiện tại; danh sách lưu tại `content/site.json`.
- Ảnh dự án và số liệu đã xác nhận trước khi thêm portfolio/chỉ số thực tế.
- Font UTM Eremitage có giấy phép phù hợp nếu cần dùng đúng font nhận diện. Hiện dùng Playfair Display cho tiêu đề và Be Vietnam Pro cho nội dung (Google Fonts, có font hệ thống dự phòng).

Ảnh không gian là hình minh họa ý tưởng, không khẳng định là văn phòng thật của DANAVA. Giao diện phần mềm/lịch lớp là minh họa chức năng, không phải dữ liệu kinh doanh.

## Phạm vi phiên bản

Phiên bản này triển khai **trang chủ** trước để duyệt thiết kế và animation. Chưa có backend, đăng nhập hay trang admin. Không giả lập các nút lưu/xuất bản. Phần admin quản lý bài viết, nhân viên, số liệu, hình ảnh và nội dung là giai đoạn tiếp theo, cần thống nhất hosting/database và tài khoản quản trị. `content/site.json` chuẩn bị dữ liệu nhân sự cho việc tích hợp đó; các khối nội dung khác hiện trong `index.html`.
