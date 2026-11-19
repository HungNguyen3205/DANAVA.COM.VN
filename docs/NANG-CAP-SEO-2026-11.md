# Nâng cấp cấu trúc nội dung, CMS và SEO kỹ thuật — 11/2026

Nhánh: `feature/danava-seo-upgrade`. Chưa triển khai production, chưa hợp nhất vào `main`.

## 1. Những gì đã thay đổi

| Yêu cầu | Triển khai | File chính |
|---|---|---|
| Trang chủ 10 khối theo thứ tự yêu cầu, H1 định vị, “Cùng bạn phát triển” là thông điệp thương hiệu, CTA “Nhận tư vấn” / “Đăng ký demo” | Trang chủ viết lại thành server component; chỉ còn 3 phần tử client nhỏ (slideshow, bảng giải pháp, hiện dần). Bỏ khối hành trình cuộn ngang ghim (JS nặng), mosaic ảnh và các khối dự án lặp | `components/site/HomePage.tsx`, `HomeClient.tsx`, `company-content.ts` |
| Kể chuyện đầy đủ chuyển sang /ve-danava/ | Thêm Giá trị–Sứ mệnh–Tầm nhìn, hành trình có ảnh, khoảnh khắc chương trình | `components/site/AboutPage.tsx` |
| Chỉ hiển thị bằng chứng có nguồn/quyền | Khối khách hàng chỉ hiện mục `published && permission`; nhận xét ẩn khi trống; số liệu theo CMS (đang tắt). Khối “Từ kênh chính thức” chỉ nhận bài có link gốc đúng nền tảng → hiện tự ẩn | `lib/site-queries.ts`, `lib/social-feed.ts` |
| Menu “Kiến thức”, tìm dịch vụ nhanh | Đổi nhãn Bản tin → Kiến thức (header, tab bar, footer, breadcrumb); mega menu liệt kê trang dịch vụ con đã xuất bản | `components/Shell.tsx` |
| Chuẩn hóa trang dịch vụ | Dịch vụ là gì/cho ai → vấn đề thường gặp → phạm vi → giao diện thực tế → quy trình → cam kết → cách báo giá → dự án liên quan → trang con → FAQ (+FAQPage) → kiến thức liên quan → CTA đúng dịch vụ | `components/site/ServiceDetailPage.tsx`, `blocks.tsx` |
| Trang dịch vụ con | Route `/giai-phap/[dịch vụ]/[trang]/`; 13 bản nháp (Gym, Yoga & Pilates, Spa, bể bơi, website doanh nghiệp/phòng tập/khách sạn, Fanpage, Zalo OA, quay chụp, sự kiện, workshop, retreat). **Tất cả đang là nháp** → 404 công khai, không vào sitemap; admin đăng nhập xem trước (noindex) | `app/(site)/giai-phap/[slug]/[sub]/page.tsx`, `lib/content-defaults.ts` |
| Quan hệ bằng ID | `project.serviceIds`, `post.serviceIds`, `post.topicId`, `client.projectId`, `testimonial.projectId`. Bỏ suy đoán theo từ khóa tiêu đề (dịch vụ ↔ dự án, ngành dự án) | `lib/site-queries.ts` |
| Case study | Ngành, khách hàng, phạm vi DANAVA thực hiện, bối cảnh, giải pháp, ảnh thực tế (thư viện ảnh trong CMS), “Kết quả bàn giao”, nhận xét (nếu có quyền), dịch vụ liên quan, CTA | `components/site/ProjectDetailPage.tsx` |
| Kiến thức | Danh mục thực tế (`data.topics`); trang `/kien-thuc/chu-de/[slug]/` chỉ có khi ≥ 3 bài; mục lục tự động với id neo theo nội dung; tác giả là nhân sự thật hoặc “DANAVA Solutions”; ngày đăng + ngày cập nhật; bài/dịch vụ liên quan theo quan hệ dữ liệu. 12 bài ngoài chủ đề (ô tô, bất động sản…) gom vào “Lưu trữ”, giữ nguyên URL | `components/site/NewsPage.tsx`, `ArticleView.tsx`, `app/(site)/kien-thuc/**` |
| SEO kỹ thuật | Canonical luôn theo `SITE_URL` (không dùng domain preview); preview Vercel / `DANAVA_NOINDEX=1` → noindex toàn site + robots `Disallow: /`; sửa tiêu đề bị lặp “— DANAVA Solutions \| DANAVA Solutions”; Organization (@id, địa chỉ, sameAs), LocalBusiness ở /lien-he/, Service, Article (dateModified, author), BreadcrumbList khớp breadcrumb hiển thị; sitemap chỉ URL công khai + lastmod từ dữ liệu; `X-Robots-Tag: noindex` cho /admin, /api; /kien-thuc/doc/?id= chuyển 308 về URL chính hoặc 404 thật | `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `next.config.ts` |
| Hiệu năng | Dữ liệu chung gửi xuống mọi trang giảm ~156k → ~34k ký tự (không còn mang toàn văn 30 bài); ảnh khai báo kích thước; ảnh đầu trang `fetchPriority=high`, phía dưới lazy; marketing: snap trên điện thoại đổi `mandatory` → `proximity` để không cản đọc | `lib/site-queries.ts#publicContent`, `site-upgrade.css`, `site-mkt.css` |
| CMS | Giải pháp: đoạn mở đầu, đối tượng, vấn đề, phạm vi, quy trình, chi phí, link sản phẩm, FAQ, ảnh chia sẻ, SEO, ngày cập nhật + quản lý trang dịch vụ con (nháp/xuất bản, ghi chú biên tập). Mục mới: **Danh mục kiến thức**, **Khách hàng & nhận xét** (bắt buộc quyền công bố). Bài viết: danh mục, tác giả, giải pháp liên quan, tóm tắt, tiêu đề SEO, ngày cập nhật, noindex. Dự án: ngành, dịch vụ, phạm vi, thư viện ảnh, SEO, ngày cập nhật | `components/AdminContentEditors.tsx`, `Admin.tsx`, `ProjectManager.tsx` |
| Form tư vấn | Không còn tự chọn sẵn DANAVA Studio khi không có tham số `?service=`; mỗi trang dịch vụ/dự án/bài viết dẫn tới đúng `?service=` | `lib/contact-services.ts`, `components/site/ContactPage.tsx` |

### Tương thích dữ liệu
- Mọi trường mới là tùy chọn. Bản JSON đang lưu trong MySQL production vẫn hợp lệ; giá trị thiếu được điền bằng `normalizeContent()` khi đọc (không ghi đè lựa chọn đã lưu) và chỉ ghi xuống khi quản trị viên bấm Lưu.
- Không đổi URL nào. Thêm 1 chuyển hướng: `/favicon.ico` → `/icon.png`.
- Kho trình duyệt (SiteStore) chặn lưu nếu admin chưa tải bản đầy đủ từ máy chủ — tránh ghi bản đã cắt gọn đè lên dữ liệu thật.

## 2. Kiểm tra đã chạy
- `npm run check` (tsc): sạch. `npm test`: 73/73 pass (thêm `tests/seo-upgrade.test.ts`: tương thích dữ liệu cũ, quan hệ ID, nháp không lộ, quyền công bố, vòng/chuỗi chuyển hướng, lưu qua lớp database với database tạm).
- `npm run build` + chạy bản standalone (database SQLite bản sao trong thư mục tạm):
  - 200: tất cả trang chính; 404 thật: slug sai, dịch vụ con nháp, danh mục < 3 bài, `/kien-thuc/doc/` sai mã; 308: URL WordPress cũ, `/kien-thuc/doc/?id=`.
  - Mỗi trang đúng 1 `<h1>`, canonical tuyệt đối `https://danava.com.vn/...`, JSON-LD có trong HTML máy chủ trả về.
  - Sitemap 54 URL (36 có lastmod từ dữ liệu), không chứa bản nháp/danh mục chưa đủ bài.
- Chrome headless ở 360/390/768/1024/1440px trên 9 trang: không có cuộn ngang (`scrollWidth = innerWidth`), không ảnh hỏng, không khối `opacity:0` sau khi cuộn, không lỗi console (sau khi sửa favicon). Ảnh: `docs/screenshots/seo-upgrade/`.

## 3. Dữ liệu DANAVA cần cung cấp
1. Logo khách hàng (HARIVER, Huế Pilates & Yoga…) và xác nhận quyền dùng; thêm khách hàng khác nếu được phép nêu tên.
2. Nhận xét khách hàng có đồng ý công bố (kèm người, chức danh).
3. Số liệu kinh doanh đã xác nhận (nếu muốn bật khối số liệu).
4. Rà soát và bật xuất bản 13 trang dịch vụ con — mỗi trang có “Ghi chú biên tập” liệt kê phần còn thiếu (ảnh giao diện nghiệp vụ, dự án thực tế, phạm vi Zalo OA…).
5. Vai trò thực tế của DANAVA trong các chương trình ở hồ sơ năng lực (PNJ, LUTECH, Highlands, Revive, Ariyana, EVERLASTIFY) để chuyển thành case study.
6. Tác giả cá nhân cho các bài viết (nếu có), và quyết định với 12 bài “Lưu trữ” (giữ / noindex / gỡ).
7. Xác nhận nội dung Chính sách dịch vụ: “SLA 99.9%”, “bảo hành 12 tháng” đang có từ trước, chưa có nguồn đối chiếu.
8. Bảng giá DANAVA Studio công khai (đang dẫn tới hello.danava.vn); giá các dịch vụ khác nếu muốn công bố.

## 4. Giới hạn chưa xác minh
- **Đăng nhập admin qua giao diện chưa kiểm thử end-to-end**: không có mật khẩu kiểm thử hợp lệ trong môi trường làm việc. Luồng lưu đã kiểm bằng test tự động gọi đúng các hàm `writeContent`/`getContent` mà API admin dùng; giao diện các trình chỉnh sửa mới đã qua typecheck nhưng chưa thao tác bằng tay. Cần thử trên máy có mật khẩu admin trước khi merge.
- Xem trước bản nháp cho admin (cookie phiên) chưa kiểm thử thực tế vì lý do trên.
- Chưa đo Lighthouse (chưa cài trong môi trường). Không có dữ liệu Core Web Vitals người dùng thực. Mục tiêu LCP ≤ 2,5s, INP < 200ms, CLS < 0,1 cần đo sau khi lên staging/production.
- `images.unoptimized` giữ nguyên vì hosting cPanel không bảo đảm chạy sharp; ảnh đã là WebP nhưng chưa có bản nhiều kích thước (srcset).
- Chưa thử trên MySQL thật (chỉ SQLite); cấu trúc bảng không đổi, chỉ đổi nội dung JSON.
- Không đảm bảo thứ hạng Google hay hiển thị rich result.
