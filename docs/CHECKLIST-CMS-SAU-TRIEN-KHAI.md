# Checklist CMS sau khi triển khai nhánh `feature/danava-seo-upgrade`

Người thực hiện: quản trị viên DANAVA, trong `https://danava.com.vn/admin/`.

Code **không tự ghi đè** dữ liệu đã lưu trong MySQL production. Những mục dưới đây chỉ thay đổi khi quản trị viên bấm **Lưu thay đổi**. Trước khi bắt đầu, vào **Cài đặt → Xuất dữ liệu JSON** để có bản sao lưu.

## A. Đổi tên và phạm vi giải pháp (mục **Giải pháp**)

Giá trị “hiện tại” lấy theo dữ liệu đã lưu trước đây. Hãy đối chiếu trên admin trước khi đổi, vì production có thể khác.

| # | Giải pháp (đường dẫn, không đổi) | Trường | Hiện tại (có thể) | Đề xuất | Đã làm |
|---|---|---|---|---|---|
| 1 | `/giai-phap/digital-marketing/` | Tên giải pháp | “Marketing” hoặc “Marketing & Truyền thông” | **Digital Marketing** — tên này hiện trong menu, footer và thẻ giải pháp. H1 trên trang đã cố định là “Digital Marketing cho doanh nghiệp dịch vụ”. | ☐ |
| 2 | `/giai-phap/digital-marketing/` | Phạm vi (mỗi dòng một mục) | Có thể còn “Sản xuất nội dung, quay phim và chụp hình” | Giữ các mục về chiến lược, nội dung, Fanpage/Zalo OA, quảng cáo, đo lường. Sự kiện, booth, sân khấu chuyển sang mục 4. | ☐ |
| 3 | `/giai-phap/du-lich-su-kien/` | Tên giải pháp | “Du lịch & Sự kiện” | **Du lịch trải nghiệm**. Sự kiện doanh nghiệp đã có trang riêng; đường dẫn giữ nguyên để không mất SEO. | ☐ |
| 4 | `/giai-phap/du-lich-su-kien/` | Phạm vi | “Hội nghị, hội thảo và workshop”, “Team building và gala dinner” | Bỏ 2 dòng này. Đề xuất: “Retreat kết hợp tập luyện và nghỉ dưỡng”, “Workshop và team building cho nhóm”, “Đặt tour, phòng, xe và vé tham quan”. | ☐ |
| 5 | `/giai-phap/su-kien-truyen-thong/` (mới) | Tên, mô tả, phạm vi, FAQ, chi phí | Tự bổ sung từ mặc định khi đọc dữ liệu | Rà nội dung rồi bấm **Lưu** để ghi xuống database. | ☐ |
| 6 | Mọi giải pháp | Tiêu đề SEO / Mô tả SEO / Ngày cập nhật | Trống | Điền khi có nội dung chính thức. Ngày cập nhật dùng cho sitemap. | ☐ |

## B. Portfolio & chương trình (mục **Portfolio & chương trình**)

| # | Việc | Đã làm |
|---|---|---|
| 7 | Website → **Vinhomes Hải Vân Bay**: xác nhận “Phạm vi DANAVA thực hiện” (thiết kế + lập trình React/Vite) đúng với hợp đồng; sửa nếu khác. | ☐ |
| 8 | Website → kiểm tra thứ tự hiển thị (↑↓) và mục **Nổi bật** (nên chỉ một mục). | ☐ |
| 9 | Sự kiện & Truyền thông → **PNJ, Water Run – Revive, LUTECH, CBD**: nhập phạm vi DANAVA thực hiện nếu xác nhận được. Khi có phạm vi, các chương trình này chuyển từ “Khoảnh khắc” lên thành chương trình có nhãn “DANAVA thực hiện”. | ☐ |
| 10 | GLG Hotel, DANAVA Page đang ẩn vì chưa có ảnh: tải ảnh giao diện rồi bật **Hiển thị công khai**. | ☐ |

## C. Khách hàng & đối tác đồng hành (mục **Khách hàng & nhận xét**)

| # | Việc | Đã làm |
|---|---|---|
| 11 | Nếu trang chủ chưa đủ 15 logo: bấm **“Bổ sung đối tác từ danava.vn”**. Nút chỉ thêm mục còn thiếu và điền logo/lĩnh vực đang trống, không sửa mục đã có. Sau đó bấm **Lưu**. | ☐ |
| 12 | Xác nhận DANAVA được phép hiển thị tên và logo 15 đối tác trên danava.com.vn (danh sách lấy từ khối “Đối tác đồng hành” của danava.vn). Nếu đối tác nào chưa đồng ý: tắt **Xuất bản** cho mục đó. | ☐ |
| 13 | Nhập nhận xét khách hàng (nếu có), chỉ khi khách đã đồng ý công bố. | ☐ |

## D. Trang dịch vụ con và kiến thức

| # | Việc | Đã làm |
|---|---|---|
| 14 | Giải pháp → từng giải pháp → **Trang dịch vụ con**: đọc “Ghi chú biên tập”, bổ sung phần còn thiếu, rồi mới bật **Xuất bản**. | ☐ |
| 15 | Danh mục kiến thức: quyết định với 12 bài “Lưu trữ” (giữ / bật noindex trong từng bài / gỡ). | ☐ |
| 16 | Bài viết: chọn tác giả cá nhân chỉ khi đúng người viết; bỏ trống thì tác giả là DANAVA Solutions. | ☐ |

## E. Sau khi lưu
- Mở các trang: `/`, `/giai-phap/`, `/giai-phap/digital-marketing/`, `/giai-phap/su-kien-truyen-thong/`, `/giai-phap/thiet-ke-website/`, `/du-an/vinhomes-hai-van-bay-website/`. Kiểm tra tên, menu và khối logo.
- Mở `/sitemap.xml`: có trang Sự kiện & Truyền thông và case study Vinhomes; không có bản nháp.
- Xuất lại JSON để lưu bản sao sau thay đổi.
