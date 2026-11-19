Bạn là QA kiểm thử giao diện (UI/UX) cho website DANAVA Solutions (Next.js 16). Hãy kiểm thử TOÀN BỘ giao diện trên điện thoại, máy tính bảng và máy tính, rồi báo cáo lỗi. Chỉ báo cáo, KHÔNG sửa code.

## Môi trường
- Chạy local: `node scripts/run-local.mjs --no-open` → http://localhost:3123 (bản production: thêm `--prod`, cổng 3100).
- Dùng trình duyệt tự động (Playwright/Puppeteer/Chrome DevTools) có giả lập thiết bị và cảm ứng.
- Kích thước kiểm tra (bắt buộc cả 5):
  - 360×740 (Android nhỏ), 390×844 (iPhone 14), 430×932 (iPhone Pro Max) — mobile, touch
  - 768×1024 (iPad dọc) — touch
  - 1280×800 và 1440×900 — desktop, chuột
- Chạy mỗi trang 2 lần: chuyển động bình thường và `prefers-reduced-motion: reduce`.
- Trước khi chụp toàn trang, cuộn từ trên xuống dưới thật chậm (mỗi bước khoảng 300px, chờ khoảng 200ms) để kích hoạt ảnh lazy-load và hiệu ứng hiện khi cuộn. Một khối trống chỉ được tính là lỗi khi nó vẫn trống sau khi đã cuộn qua.

## Danh sách trang
Website công khai:
- `/` (trang chủ)
- `/giai-phap/` và từng giải pháp: `/giai-phap/danava-studio/`, `/giai-phap/thiet-ke-website/`, `/giai-phap/digital-marketing/`, `/giai-phap/du-lich-su-kien/`, `/giai-phap/cong-dong/`
- `/he-sinh-thai/`
- `/du-an/` và mọi trang chi tiết dự án (lấy link từ trang danh sách)
- `/ve-danava/`
- `/doi-ngu/` và mọi hồ sơ nhân sự (lấy link từ trang danh sách)
- `/kien-thuc/`, ít nhất 3 bài viết, và `/kien-thuc/doc/`
- `/lien-he/`, `/lien-he/?service=studio`
- `/chinh-sach-dich-vu/`, `/chinh-sach-rieng-tu/`
- Trang 404: `/khong-ton-tai/`, `/du-an/khong-co/`, `/giai-phap/khong-co/`, `/kien-thuc/khong-co/`

Quản trị (CMS):
- `/admin/` (trang đăng nhập). Nếu có mật khẩu thì kiểm tra thêm từng mục trong menu quản trị ở 390px và 1280px.

## Kiểm tra trên mỗi trang và mỗi kích thước
1. **Tràn ngang**: `document.documentElement.scrollWidth` phải bằng `innerWidth`. Liệt kê phần tử có `getBoundingClientRect().right > innerWidth`, bỏ qua phần tử nằm trong vùng cuộn ngang có chủ đích (`.s-snap`, `.s-tabs`, gallery, bảng trong `.s-policy-table-wrap`).
2. **Chữ bị cắt hoặc đè**: chữ không bị che, không chồng lên nhau, không bị cắt ở mép. Tiêu đề dài (bài viết viết HOA) vẫn xuống dòng đẹp.
3. **Độ tương phản**: mọi nút và link đọc được. Đặc biệt chú ý nút phụ trên nền xanh hoặc tối (`.s-section--brand`, `.s-cta`): không được trắng trên trắng hoặc navy trên navy. Mức tối thiểu là WCAG AA 4.5:1.
4. **Vùng chạm** (mobile): nút và link chính tối thiểu 44×44px, khoảng cách giữa các vùng chạm ≥ 8px.
5. **Cỡ chữ**: nội dung ≥ 14px trên mobile. Ô nhập liệu (input/select/textarea) ≥ 16px để iOS không tự phóng to.
6. **Ảnh**: không có ảnh hỏng (`naturalWidth === 0`), không méo tỉ lệ, không có ô trắng trống sau khi đã cuộn qua.
7. **Header**: sticky, logo rõ. Nút ☰ mở drawer, Esc hoặc bấm link thì đóng. Khi drawer mở, trang phía sau không cuộn.
8. **Thanh tab dưới đáy** (≤ 860px, gồm Trang chủ, Giải pháp, Tư vấn, Dự án, Bản tin):
   - Luôn hiển thị, không che nội dung cuối trang hoặc footer.
   - Tab của trang hiện tại được tô màu (`aria-current="page"`). `/he-sinh-thai/` tính vào tab Giải pháp.
   - Bấm lại tab đang mở thì trang cuộn lên đầu.
   - Ẩn hoàn toàn ở 1280px.
   - Nút "Tư vấn" nổi ở giữa, không bị cắt.
   - Banner cookie nằm phía trên thanh tab, không bị che.
9. **Vùng an toàn**: giả lập iPhone có tai thỏ (safe-area). Header và thanh tab không bị tai thỏ hoặc home bar che.
10. **Cuộn ngang kiểu app**: các băng thẻ `.s-snap`, tab lọc, gallery ảnh vuốt được, snap đúng từng thẻ, không kéo theo cả trang.
11. **Lightbox gallery** (`/giai-phap/danava-studio/`, `/giai-phap/du-lich-su-kien/`):
    - Bấm ảnh để mở, vuốt trái/phải để đổi ảnh. Nút ‹ › và nút đóng nằm trong tầm ngón cái.
    - Esc để đóng, phím mũi tên để đổi ảnh (desktop).
    - Trang phía sau không cuộn khi lightbox đang mở.
12. **Trang chính sách**: mục lục trên mobile là thanh chip vuốt ngang, dính dưới header. Bấm chip thì nhảy đúng mục, tiêu đề mục không bị header che. Bảng SLA cuộn ngang được bên trong khung, không làm cả trang rộng ra.
13. **Form liên hệ** (`/lien-he/`):
    - Gửi form trống phải hiện lỗi rõ ràng bên cạnh từng ô.
    - Bàn phím ảo không che ô đang nhập. Ô số điện thoại mở bàn phím số.
    - Nút gửi có trạng thái đang gửi.
    - KHÔNG gửi dữ liệu thật: chặn request `POST /api/lead` hoặc chỉ kiểm tra phần kiểm lỗi phía client.
14. **404**: chỉ có đúng 1 header và 1 footer (đếm `header.s-header` và `footer.s-footer`), có 3 lối ra (Trang chủ, Giải pháp, Liên hệ), style giống các trang khác.
15. **Hiệu ứng**:
    - Trang chủ (hero slide, hành trình) và `/giai-phap/digital-marketing/` (phim cuộn) chạy mượt, không giật khi cuộn bằng cảm ứng, không kẹt cuộn.
    - Với reduced-motion: mọi nội dung hiện ngay, không còn khối nào ở trạng thái `opacity: 0`.
16. **PWA**:
    - `/manifest.webmanifest` trả 200 với `display: standalone` và icon 192/512 tải được.
    - Có `<meta name="theme-color">` và viewport chứa `viewport-fit=cover`.
    - Chrome DevTools → Application → Manifest không báo lỗi.
17. **Console**: không có lỗi JS, hydration mismatch hoặc 404 tài nguyên (bỏ qua cảnh báo chỉ có ở chế độ dev).
18. **Hiệu năng** (390px, Lighthouse mobile, chạy trên bản `--prod`): ghi điểm Performance, Accessibility, Best Practices, SEO và các chỉ số CLS, LCP cho `/`, `/giai-phap/danava-studio/`, `/lien-he/`.

## Báo cáo
Trả về bảng Markdown, mỗi lỗi một dòng với các cột:

| # | Mức độ (Nghiêm trọng/Cao/Trung bình/Thấp) | Trang | Kích thước | Mô tả lỗi | Cách tái hiện | Phần tử (selector) | Ảnh chụp |

Quy tắc:
- Xếp lỗi theo mức độ, nặng nhất lên đầu.
- Mỗi lỗi kèm ảnh chụp đúng vùng bị lỗi.
- Cuối báo cáo có:
  - danh sách các trang đã qua kiểm tra mà không có lỗi;
  - điểm Lighthouse;
  - những gì chưa kiểm tra được và lý do (ví dụ: chưa có mật khẩu CMS).
- Không báo lỗi suy đoán. Lỗi nào không tái hiện được thì ghi "chưa chắc chắn".
