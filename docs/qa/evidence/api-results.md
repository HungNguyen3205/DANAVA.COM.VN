| # | Module | Kịch bản | Mong đợi | Thực tế | Trạng thái |
|---|---|---|---|---|---|
| 1 | Hệ thống/Đăng nhập | Đăng nhập chủ website bằng mật khẩu máy chủ | 200 + vai trò owner | 200 owner | PASS |
| 2 | Hệ thống/Đăng nhập | Sai mật khẩu | 401, không cấp cookie | 401 cookie=false | PASS |
| 3 | Hệ thống/Đăng nhập | Đăng nhập từ nguồn khác (Origin lạ) | 403 | 403 | PASS |
| 4 | Phân quyền/Chưa đăng nhập | GET /api/admin/content/ không có phiên | 401 | 401 | PASS |
| 5 | Phân quyền/Chưa đăng nhập | GET /api/admin/leads/ không có phiên | 401 | 401 | PASS |
| 6 | Phân quyền/Chưa đăng nhập | GET /api/admin/media/ không có phiên | 401 | 401 | PASS |
| 7 | Phân quyền/Chưa đăng nhập | GET /api/admin/users/ không có phiên | 401 | 401 | PASS |
| 8 | Phân quyền/Chưa đăng nhập | GET /api/admin/audit/ không có phiên | 401 | 401 | PASS |
| 9 | Phân quyền/Chưa đăng nhập | GET /api/admin/analytics/ không có phiên | 401 | 401 | PASS |
| 10 | Phân quyền/Chưa đăng nhập | GET /api/admin/revisions/ không có phiên | 401 | 401 | PASS |
| 11 | Phân quyền/CSRF | PUT nội dung thiếu mã CSRF | 403 | 403 | PASS |
| 12 | Phân quyền/CSRF | PUT nội dung từ Origin lạ (có CSRF) | 403 | 403 | PASS |
| 13 | Bảo mật/Phản hồi | Phiên đăng nhập không trả mật khẩu / hash / token | Không có trường nhạy cảm | configured,authenticated,csrf,user | PASS |
| 14 | Hệ thống/Tài khoản | Tạo tài khoản vai trò admin (tên có dấu) | 201 | 201 | PASS |
| 15 | Hệ thống/Tài khoản | Tạo tài khoản vai trò editor (tên có dấu) | 201 | 201 | PASS |
| 16 | Hệ thống/Tài khoản | Tạo tài khoản vai trò writer (tên có dấu) | 201 | 201 | PASS |
| 17 | Hệ thống/Tài khoản | Tạo tài khoản vai trò sales (tên có dấu) | 201 | 201 | PASS |
| 18 | Hệ thống/Tài khoản | Tạo trùng tên đăng nhập | 409 | 409 | PASS |
| 19 | Hệ thống/Tài khoản | Mật khẩu quá ngắn | 400 | 400 | PASS |
| 20 | Bảo mật/Phản hồi | Danh sách tài khoản không lộ mật khẩu/hash | Không có trường password/hash | 200 {"users":[{"id":"usr_d490a8ee-11f","username":"qa.admin","name":"QA admin Nguyễn Thị Ánh","role":"admin","active":true," | PASS |
| 21 | Phân quyền/Ma trận | admin GET /api/admin/content/ | 200 | 200 | PASS |
| 22 | Phân quyền/Ma trận | admin GET /api/admin/media/ | 200 | 200 | PASS |
| 23 | Phân quyền/Ma trận | admin GET /api/admin/leads/ | 200 | 200 | PASS |
| 24 | Phân quyền/Ma trận | admin GET /api/admin/users/ | 200 | 200 | PASS |
| 25 | Phân quyền/Ma trận | admin GET /api/admin/audit/ | 200 | 200 | PASS |
| 26 | Phân quyền/Ma trận | admin GET /api/admin/analytics/ | 200 | 200 | PASS |
| 27 | Phân quyền/Ma trận | admin GET /api/admin/revisions/ | 200 | 200 | PASS |
| 28 | Phân quyền/Ma trận | editor GET /api/admin/content/ | 200 | 200 | PASS |
| 29 | Phân quyền/Ma trận | editor GET /api/admin/media/ | 200 | 200 | PASS |
| 30 | Phân quyền/Ma trận | editor GET /api/admin/leads/ | 403 | 403 | PASS |
| 31 | Phân quyền/Ma trận | editor GET /api/admin/users/ | 403 | 403 | PASS |
| 32 | Phân quyền/Ma trận | editor GET /api/admin/audit/ | 403 | 403 | PASS |
| 33 | Phân quyền/Ma trận | editor GET /api/admin/analytics/ | 200 | 200 | PASS |
| 34 | Phân quyền/Ma trận | editor GET /api/admin/revisions/ | 200 | 200 | PASS |
| 35 | Phân quyền/Ma trận | writer GET /api/admin/content/ | 200 | 200 | PASS |
| 36 | Phân quyền/Ma trận | writer GET /api/admin/media/ | 200 | 200 | PASS |
| 37 | Phân quyền/Ma trận | writer GET /api/admin/leads/ | 403 | 403 | PASS |
| 38 | Phân quyền/Ma trận | writer GET /api/admin/users/ | 403 | 403 | PASS |
| 39 | Phân quyền/Ma trận | writer GET /api/admin/audit/ | 403 | 403 | PASS |
| 40 | Phân quyền/Ma trận | writer GET /api/admin/analytics/ | 403 | 403 | PASS |
| 41 | Phân quyền/Ma trận | writer GET /api/admin/revisions/ | 200 | 200 | PASS |
| 42 | Phân quyền/Ma trận | sales GET /api/admin/content/ | 403 | 403 | PASS |
| 43 | Phân quyền/Ma trận | sales GET /api/admin/media/ | 403 | 403 | PASS |
| 44 | Phân quyền/Ma trận | sales GET /api/admin/leads/ | 200 | 200 | PASS |
| 45 | Phân quyền/Ma trận | sales GET /api/admin/users/ | 403 | 403 | PASS |
| 46 | Phân quyền/Ma trận | sales GET /api/admin/audit/ | 403 | 403 | PASS |
| 47 | Phân quyền/Ma trận | sales GET /api/admin/analytics/ | 200 | 200 | PASS |
| 48 | Phân quyền/Ma trận | sales GET /api/admin/revisions/ | 403 | 403 | PASS |
| 49 | Phân quyền/Ma trận | admin lưu nháp nội dung | 200 | 200 | PASS |
| 50 | Phân quyền/Ma trận | admin xuất bản nội dung | 200 | 200 | PASS |
| 51 | Phân quyền/Ma trận | editor lưu nháp nội dung | 200 | 200 | PASS |
| 52 | Phân quyền/Ma trận | editor xuất bản nội dung | 200 | 200 | PASS |
| 53 | Phân quyền/Ma trận | writer lưu nháp nội dung | 200 | 200 | PASS |
| 54 | Phân quyền/Ma trận | writer xuất bản nội dung | 403 | 403 | PASS |
| 55 | Phân quyền/Ma trận | sales lưu nháp nội dung | 403 | 403 | PASS |
| 56 | Phân quyền/Ma trận | sales xuất bản nội dung | 403 | 403 | PASS |
| 57 | Phân quyền/Ma trận | writer tải ảnh (media.write) | 201 | 201 | PASS |
| 58 | Phân quyền/Ma trận | sales tải ảnh (không có media.write) | 403 | 403 | PASS |
| 59 | Phân quyền/Ma trận | editor tạo tài khoản (không có users.manage) | 403 | 403 | PASS |
| 60 | Phân quyền/Ma trận | admin tự nâng vai trò owner cho tài khoản khác | 400/403 (không có vai trò owner gán được) | 400 | PASS |
| 61 | Nội dung/Nháp | Lưu nháp chữ màn mở đầu (có dấu) | 200 | 200 | PASS |
| 62 | Nội dung/Nháp | Đọc lại bản nháp qua API admin | Có chữ nháp | QA_NHAP_Đồng_hành_d188dc | PASS |
| 63 | Bảo mật/Lộ bản nháp | Khách mở / | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 64 | Bảo mật/Lộ bản nháp | Khách mở /?cms=1 | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 65 | Bảo mật/Lộ bản nháp | Khách mở /sitemap.xml | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 66 | Bảo mật/Lộ bản nháp | Khách mở /robots.txt | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 67 | Bảo mật/Lộ bản nháp | Khách mở /blogs/ | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 68 | Bảo mật/Lộ bản nháp | Khách mở /ve-danava/ | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 69 | Bảo mật/Lộ bản nháp | Khách mở /api/anna/ | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 70 | Bảo mật/Lộ bản nháp | Khách mở /lien-he/ | Không chứa chữ nháp | 200 chứa nháp=false | PASS |
| 71 | Bảo mật/Lộ bản nháp | Khách giả header x-danava-cms: 1 | Không chứa chữ nháp | chứa nháp=false | PASS |
| 72 | Bảo mật/Lộ bản nháp | sales (không có content.read) mở /?cms=1 | Không chứa chữ nháp | chứa nháp=false | PASS |
| 73 | Nội dung/Nháp | Admin (content.read) mở /?cms=1 thấy bản nháp | Chứa chữ nháp | chứa nháp=true | PASS |
| 74 | Nội dung/Nháp | Admin mở / (không ?cms=1) vẫn thấy bản công khai | Không chứa chữ nháp | chứa nháp=false | PASS |
| 75 | Nội dung/Xuất bản | Xuất bản bản nháp | 200 | 200 | PASS |
| 76 | Nội dung/Xuất bản | Website công khai cập nhật ngay sau xuất bản (không cache cũ) | Trang chủ chứa chữ mới | chứa=true | PASS |
| 77 | Nội dung/Xung đột | Phiên khác lưu với mã chỉnh sửa cũ | 409, không ghi đè | 409 | PASS |
| 78 | Nội dung/Xung đột | Bấm Xuất bản hai lần cùng mã (double submit) | Lần 2 → 409, không tạo phiên bản trùng | 200/409 | PASS |
| 79 | Nội dung/Toàn vẹn | Sửa một trường không làm mất dữ liệu mục khác | posts/services/staff giữ nguyên | 200 | PASS |
| 80 | Nội dung/Kiểm tra BE | Đường dẫn nút javascript: | 400 | 400 | PASS |
| 81 | Nội dung/Kiểm tra BE | Chữ màn mở đầu quá dài (> 80) | 400 | 400 | PASS |
| 82 | Nội dung/Kiểm tra BE | Khóa lạ trong màn mở đầu | 400 | 400 | PASS |
| 83 | Nội dung/Kiểm tra BE | Email liên hệ sai kiểu (số) | 400 | 400 | PASS |
| 84 | Nội dung/Kiểm tra BE | Ảnh doanh nghiệp trỏ ra ngoài | 400 | 400 | PASS |
| 85 | Nội dung/Kiểm tra BE | Thân yêu cầu không phải JSON | 400 | 400 | PASS |
| 86 | Nội dung/Kiểm tra BE | Dữ liệu quá lớn (> 2 MB) | 413 | 413 | PASS |
| 87 | Bảo mật/XSS | Chữ có <script> lưu được nhưng hiển thị dạng chữ | HTML công khai không có thẻ script chèn vào | 200 escaped=true | PASS |
| 88 | Nội dung/Đường dẫn | Hai bài viết trùng slug | Bị từ chối (400/409) hoặc cảnh báo | 400 {"error":"Đường dẫn /blogs/cam-on-team-tumy-cac-cau-lac-bo-yoga-da-dong-hanh-chuoi-su-kien-cong-nang-luong-05-05-tai-da- | PASS |
| 89 | Nội dung/Tham chiếu | Bài viết + landing page tham chiếu sản phẩm không tồn tại (gửi thẳng API) | Trang bài viết, Blogs và landing vẫn 200, không lỗi máy chủ | lưu 200; bài 200, Blogs 200, Giải pháp 200 | PASS |
| 90 | Hệ thống/Lịch sử | Danh sách phiên bản có các lần xuất bản | ≥ 2 phiên bản | 200 n=7 | PASS |
| 91 | Hệ thống/Lịch sử | Khôi phục phiên bản không tồn tại | 404 | 404 | PASS |
| 92 | Hệ thống/Lịch sử | writer khôi phục phiên bản (không có quyền xuất bản) | 403 | 403 | PASS |
| 93 | Hệ thống/Nhật ký | Nhật ký thao tác ghi đăng nhập/xuất bản/tạo tài khoản | Có các loại thao tác | 200 21 mục | PASS |
| 94 | Khách hàng/Biểu mẫu | Gửi yêu cầu tư vấn hợp lệ (tiếng Việt) | 201 | 201 | PASS |
| 95 | Khách hàng/Biểu mẫu | Gửi lặp ngay (double submit) cùng SĐT | 429, không tạo trùng | 429 | PASS |
| 96 | Khách hàng/Biểu mẫu | Thiếu họ tên | 400 | 400 | PASS |
| 97 | Khách hàng/Biểu mẫu | SĐT sai | 400 | 400 | PASS |
| 98 | Khách hàng/Biểu mẫu | Email sai | 400 | 400 | PASS |
| 99 | Khách hàng/Biểu mẫu | Nội dung > 5.000 ký tự | 400 | 400 | PASS |
| 100 | Khách hàng/Biểu mẫu | JSON hỏng | 400 | 400 | PASS |
| 101 | Khách hàng/Biểu mẫu | Bot điền trường bẫy (honeypot) | 201 giả, không lưu | 201 lưu=false | PASS |
| 102 | Khách hàng/Biểu mẫu | Gửi từ website khác (Origin lạ) | 403 (chặn gửi hộ từ trang ngoài) | 403 | PASS |
| 103 | Khách hàng/Biểu mẫu | Thân yêu cầu rất lớn (3 MB) | 413 hoặc máy chủ đóng kết nối sớm; không lưu | 413, lưu=false | PASS |
| 104 | Khách hàng/Yêu cầu | Yêu cầu hiển thị trong admin đúng dữ liệu, chỉ 1 bản | 1 bản, tên có dấu đúng | 1 bản, Trần Thị Bích Ngọc | PASS |
| 105 | Khách hàng/Yêu cầu | sales phân công + đổi trạng thái | 200, lưu lại được | 200 status=contacted assigned_to=QA Nguyễn Kinh Doanh | PASS |
| 106 | Khách hàng/Yêu cầu | Cập nhật yêu cầu không tồn tại | 404 | 404 | PASS |
| 107 | Khách hàng/Yêu cầu | Trạng thái không hợp lệ | 400 | 400 | PASS |
| 108 | Khách hàng/Yêu cầu | editor xem khách hàng (không có leads.read) | 403 | 403 | PASS |
| 109 | Website/Tuyển dụng | Ứng tuyển từ Origin lạ | 403 | 403 | PASS |
| 110 | Website/Tuyển dụng | Ứng tuyển thiếu dữ liệu | 400 | 400 | PASS |
| 111 | Tài nguyên/Tải ảnh | Tải PNG hợp lệ | 201 + đường dẫn /assets/uploads/*.webp | 201 /assets/uploads/09c15caf-cd7d-4003-95ee-e2a985d3724b.webp | PASS |
| 112 | Tài nguyên/Tải ảnh | Tải JPEG hợp lệ | 201 | 201 | PASS |
| 113 | Tài nguyên/Tải ảnh | File chữ đổi đuôi thành ảnh | 400 | 400 | PASS |
| 114 | Tài nguyên/Tải ảnh | PNG hỏng (đúng chữ ký, dữ liệu rác) | 400 | 400 | PASS |
| 115 | Tài nguyên/Tải ảnh | SVG chứa script | 400 | 400 | PASS |
| 116 | Tài nguyên/Tải ảnh | Ảnh > 6 MB | 413 hoặc máy chủ đóng kết nối sớm; không thêm ảnh | 413, ảnh 3→3 | PASS |
| 117 | Tài nguyên/Phục vụ ảnh | Ảnh tải lên được phục vụ đúng loại, chặn đoán MIME | 200 image/webp + nosniff | 200 image/webp nosniff=nosniff | PASS |
| 118 | Tài nguyên/Phục vụ ảnh | Đường dẫn vượt thư mục ../ | 404/400 | 404 | PASS |
| 119 | Tài nguyên/Thư viện | Ảnh mới có trong danh sách thư viện | Có | 3 ảnh | PASS |
| 120 | Báo cáo/Truy cập | Ghi một lượt xem từ khách | 2xx | 204 | PASS |
| 121 | Báo cáo/Truy cập | Lượt xem của admin đang đăng nhập không được tính | 204, không tăng số liệu | 204 | PASS |
| 122 | Báo cáo/Truy cập | Ghi lượt xem từ Origin lạ | 204 (bỏ qua) | 204 | PASS |
| 123 | Báo cáo/Truy cập | Số lượt xem trong báo cáo tăng đúng 1 | +1 pageview | 0 → 1 | PASS |
| 124 | Tương tác/ANNA | Trạng thái khi chưa có khóa AI | ready=false | 200 {"ready":false} | PASS |
| 125 | Tương tác/ANNA | Hỏi ANNA khi dịch vụ AI chưa sẵn sàng | 503 unavailable (giao diện chuyển sang báo giá nhanh) | 503 {"code":"unavailable"} | PASS |
| 126 | Tương tác/ANNA | Hỏi ANNA từ Origin lạ | 403 | 403 | PASS |
| 127 | SEO/Sitemap | sitemap.xml có trang, không có admin/xem trước/bài lưu trữ | > 20 URL, không /admin, /xem-truoc | 60 URL | PASS |
| 128 | SEO/Robots | robots.txt chặn /admin và /api, khai báo sitemap | Disallow /admin, /api; Sitemap | User-Agent: * Allow: / Disallow: /admin/ Disallow: /api/ Disallow: /blogs/doc/ Disallow: /xem-truoc-landing/ Host: http://localhost:4187 Sitemap: http://localho | PASS |
| 129 | SEO/Tiêu đề | Tiêu đề ≤ 70 ký tự trên 60 URL | 0 tiêu đề quá dài | /: 83 ký tự — "DANAVA Solutions — Giải pháp công nghệ, website và sự kiện cho doanh nghiệp dịch vụ" \| /blogs/cam-on-team-tumy-cac-cau-lac-bo-yoga-da-dong-hanh-chuoi-su-kien-cong-nang-luong-05-05-tai-da-nang/: 101 ký tự — "CẢM ƠN [TEAM TUMY] CÁC CÂU LẠC BỘ YOGA ĐÃ ĐỒNG HÀNH – CHUỖI SỰ KIỆN CỔNG NĂNG LƯỢNG 05/05 TẠI ĐÀ NẴNG" \| /blogs/2-yoga-workshop-yoga-tri-lieu-co-vai-gay-voi-chu-de-cot-song-la-cu | FAIL |
| 130 | SEO/Trang công khai | Mọi URL trong sitemap (60) trả 200, có title, description, canonical đúng, og:image, đúng 1 H1, không CSS admin | Không có vấn đề | OK | PASS |
| 131 | SEO/Trang lỗi | Đường dẫn không tồn tại | 404 + trang lỗi thân thiện, noindex | 404 noindex=true | PASS |
| 132 | SEO/Trang lỗi | Bài viết không tồn tại | 404 | 404 | PASS |
| 133 | SEO/Trang lỗi | Sản phẩm không tồn tại | 404 | 404 | PASS |
| 134 | SEO/Chuyển hướng | Đường dẫn cũ /kien-thuc → /blogs/ | Chuyển hướng vĩnh viễn tới /blogs/, tối đa 2 bước | 308→/kien-thuc/ 308→/blogs/ | PASS |
| 135 | SEO/Noindex | Trang admin có X-Robots-Tag noindex | noindex | noindex, nofollow | PASS |
| 136 | Hệ thống/Phiên | Đăng xuất làm phiên mất hiệu lực | Sau đăng xuất GET nội dung → 401 | 200 → 401 | PASS |
| 137 | Hệ thống/Phiên | Phiên hết hạn (sửa expires trong database thử nghiệm) | 401 | 401 | PASS |
| 138 | Hệ thống/Đăng nhập | Đăng nhập sai liên tục bị giới hạn | Sau 10 lần sai → 429 | 429 | PASS |
