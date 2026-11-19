## Vai trò
Bạn đóng vai **một chủ doanh nghiệp đang tìm đối tác công nghệ/marketing**. Bạn đã dùng và đọc kỹ website **https://seodo.vn/**, nên seodo.vn là chuẩn so sánh của bạn. Giờ bạn mở website **DANAVA Solutions** lần đầu, trên cả điện thoại lẫn máy tính.

Bạn đồng thời là **QA giao diện khó tính**. Nhiệm vụ của bạn:
1. Chỉ ra những chỗ DANAVA **chưa đủ "wow"** hoặc **bố cục chưa chắc chắn** khi so với seodo.vn.
2. Tìm và mô tả **mọi lỗi hiển thị**, đặc biệt trên điện thoại.

Chỉ đánh giá và báo cáo, **không sửa code**.

## Môi trường
- DANAVA (bản đang phát triển): `node scripts/run-local.mjs --no-open` → http://localhost:3123
- DANAVA (bản đang chạy thật): https://danava.com.vn
- Đối chứng: https://seodo.vn/
- Dùng trình duyệt tự động (Playwright, Puppeteer hoặc Chrome DevTools) có giả lập thiết bị và cảm ứng.
- Kích thước màn hình:
  - 360×740, 390×844, 430×932 (điện thoại, cảm ứng)
  - 768×1024 (máy tính bảng)
  - 1280×800, 1440×900 (máy tính)
- Trước khi chụp toàn trang, cuộn chậm hết trang (mỗi bước khoảng 300px, chờ khoảng 200ms) để ảnh lazy-load và hiệu ứng hiện khi cuộn chạy hết. Một khối chỉ được coi là "trống" nếu vẫn trống sau khi đã cuộn qua.

## Trang cần xem
**DANAVA:**
- `/`
- `/giai-phap/` và cả 5 trang giải pháp con
- `/he-sinh-thai/`
- `/du-an/` và trang chi tiết dự án
- `/ve-danava/`
- `/doi-ngu/` và một hồ sơ nhân sự
- `/kien-thuc/` và một bài viết
- `/lien-he/`
- `/chinh-sach-dich-vu/`, `/chinh-sach-rieng-tu/`
- 404: `/khong-co/`

**seodo.vn:** trang chủ, một trang giải pháp, một case study, trang liên hệ.

## Phần A — So sánh "độ wow" và độ chắc chắn của bố cục
Với mỗi tiêu chí: chấm điểm DANAVA và seodo.vn (thang 1–10), nêu chỗ cụ thể trên DANAVA (trang, khối, selector CSS nếu có) và đề xuất cải thiện.
1. **Màn hình đầu tiên**: trong 5 giây có hiểu công ty làm gì, vì sao tin được và bấm vào đâu không? Có số liệu hoặc bằng chứng ngay trên màn hình đầu như seodo (khối 1.000+ khách hàng, năm thành lập, nhân sự, văn phòng) không?
2. **Bằng chứng tin cậy**: logo khách hàng, case study có chỉ số kết quả (traffic, %), lời chứng thực, người đứng đầu.
3. **Hệ thống thiết kế**: font, màu, bo góc, khoảng cách, kiểu tiêu đề mục có nhất quán giữa các trang không? Ví dụ: trang chủ dùng serif kiểu tạp chí, các trang trong dùng sans, có bị lệch "hai thương hiệu" không?
4. **Nhịp bố cục**: khoảng trắng, căn lưới, độ dài mục, chỗ trống bất thường, khối bị lỏng hoặc chật.
5. **Kêu gọi hành động**: CTA có rõ và lặp lại hợp lý không? Có nút Zalo/gọi nổi không? Form liên hệ có dễ điền không?
6. **Chuyển động và tương tác**: có tạo cảm giác cao cấp hay gây giật, chậm, rối?
7. **Nội dung**: có câu chữ nội bộ, bản nháp, lỗi chính tả, chữ HOA quá dài, số liệu "chờ xác nhận" lộ ra ngoài không?
8. **Trải nghiệm kiểu app trên điện thoại**: thanh tab dưới đáy, vuốt ngang, vùng chạm, tốc độ.

## Phần B — Lỗi hiển thị (bắt buộc kiểm tra trên mọi trang và mọi kích thước)
- **Trang bị kéo qua kéo lại / tràn ngang:**
  - So `document.documentElement.scrollWidth` với `innerWidth`.
  - Trên điện thoại, kiểm tra `innerWidth` có bằng chiều rộng thiết bị không. Nếu lớn hơn (ví dụ 662 trên máy 390) là trình duyệt đang phải nới trang vì có phần tử quá rộng.
  - Liệt kê phần tử có `right > innerWidth`, trừ những vùng cuộn ngang có chủ đích.
- **Kiểm tra kỹ `/chinh-sach-rieng-tu/` và `/chinh-sach-dich-vu/`:**
  - vuốt ngang bằng tay ảo xem trang có trôi không;
  - bảng dữ liệu phải hiện thành thẻ, không cuộn ngang;
  - dải mục lục chip dính dưới header, bấm chip nhảy đúng mục.
- Chữ bị cắt, đè hoặc tràn; nút trắng trên nền trắng; độ tương phản dưới chuẩn WCAG AA.
- Ảnh hỏng, méo hoặc ô trống; khối có `opacity: 0` vẫn không hiện sau khi cuộn qua.
- Header, thanh tab dưới đáy, banner cookie hoặc nút nổi che nội dung, che nhau, hoặc bị tai thỏ che.
- Vùng chạm nhỏ hơn 44px; ô nhập có chữ nhỏ hơn 16px (iOS sẽ tự phóng to).
- Lỗi console, lỗi hydration, tài nguyên trả 404.
- So sánh bản local với bản thật danava.com.vn: lỗi nào đã được sửa ở local nhưng chưa lên bản thật.

## Báo cáo trả về
1. **Bảng so sánh tổng quan** DANAVA và seodo.vn theo 8 tiêu chí ở Phần A. Mỗi tiêu chí gồm: điểm hai bên, 1 câu nhận xét, mức độ ưu tiên sửa (Cao/Trung bình/Thấp).
2. **Top 10 chỗ "chưa đủ wow" trên DANAVA**, xếp theo tác động. Mỗi mục gồm: vị trí cụ thể, seodo làm thế nào, đề xuất cụ thể cho DANAVA (bố cục, thành phần, nội dung cần có).
3. **Bảng lỗi hiển thị** gồm các cột:

   | # | Mức độ | Trang | Kích thước | Mô tả | Cách tái hiện | Selector | Ảnh chụp | Local/Thật |

4. **Danh sách nội dung thật mà chủ website cần cung cấp**: logo khách hàng, số liệu đã xác nhận, kết quả dự án, lời chứng thực.

Không tự bịa số liệu hay logo khách hàng; chỗ nào thiếu dữ liệu thật thì ghi "cần dữ liệu thật". Không báo lỗi suy đoán; lỗi nào chưa tái hiện được thì ghi "chưa chắc chắn".
