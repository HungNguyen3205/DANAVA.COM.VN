# Báo cáo nghiệm thu — nhánh `feature/danava-seo-upgrade`

Cập nhật: 19/11/2026. Báo cáo này **thay thế** các mô tả “kiểm tra” trong `NANG-CAP-SEO-2026-11.md`, những chỗ đó dùng chữ “production” chưa rõ nghĩa.

## 0. Môi trường — đọc trước

| Thuật ngữ trong báo cáo | Nghĩa |
|---|---|
| **Bản build production (local)** | `npm run build` (chế độ production của Next.js) chạy bằng `node server.js` **trên máy làm việc**, database **SQLite bản sao** trong thư mục tạm, `SITE_URL=https://danava.com.vn`. |
| **Preview `d515c3e`** | Bản build production của đúng commit `d515c3e`, sao chép sang thư mục riêng, chạy tại `http://localhost:3300` với database thử riêng và mật khẩu admin thử riêng (chỉ có trong biến môi trường của tiến trình). Chỉ truy cập được trên máy làm việc. |
| **Production đã triển khai** | `https://danava.com.vn` trên hosting cPanel + MySQL. **Chưa triển khai** bất kỳ thay đổi nào của nhánh này. Chưa merge vào `main`. |

Không bước kiểm thử nào gửi form tới hệ thống thật hay ghi vào MySQL production.

## 1. Đã kiểm chứng (có bằng chứng)

| # | Nội dung | Môi trường | Bằng chứng |
|---|---|---|---|
| 1 | Ảnh **toàn trang** desktop 1440px và mobile 390px: Trang chủ, Digital Marketing, Sự kiện & Truyền thông, Website & Landing Page, Case study Vinhomes | Preview `d515c3e` | `docs/screenshots/preview-d515c3e/` (10 ảnh + `INDEX.txt`) |
| 2 | **Admin E2E qua giao diện thật** (Chrome headless): đăng nhập; sửa đoạn mở đầu DANAVA Studio → lưu → tải lại → hiện ngoài website → hoàn nguyên; đổi thứ tự portfolio → tải lại → thư viện công khai đổi thứ tự; đổi dự án nổi bật sang GLG (trang Website + trang chủ đổi theo) rồi trả lại; xuất bản/gỡ trang con Gym (200/404, vào/ra sitemap). **39/39 PASS** | Preview `d515c3e`, sitemap bật | `docs/screenshots/admin-e2e/ket-qua-admin-e2e.txt`, 3 ảnh |
| 3 | **Gỡ xuất bản Vinhomes**: không còn ở khối nổi bật/danh sách trang chủ, trang Website, `/du-an/`, `/giai-phap/`, `/kien-thuc/` (0 lần trong nội dung hiển thị và 0 lần trong payload dữ liệu); case study công khai **404**; ra khỏi sitemap. Admin đã đăng nhập vẫn xem trước được (nhãn Bản nháp + noindex). Xuất bản lại: 200, trở lại khối nổi bật, có lại trong sitemap | Preview `d515c3e` | như mục 2 |
| 4 | Nghiệm thu giao diện 52 bước: 7 trang × 5 kích thước (360/390/768/1024/1440): 1 H1, không tràn ngang, không ảnh hỏng, không lỗi console; vị trí Vinhomes; bàn phím (Tab + Enter lọc portfolio, viền focus 3px); giảm chuyển động; nút nổi không che CTA. **52/52 PASS** | Bản build production (local) của `d515c3e` **và** của commit mới | `docs/screenshots/identity/ket-qua-nghiem-thu.txt`, `ket-qua-nghiem-thu-commit-moi.txt` |
| 5 | Đối tác đồng hành: đăng nhập admin trên host staging khi `SITE_URL` là production (lỗi cũ trả 403) → bấm “Bổ sung đối tác từ danava.vn” → lưu → trang chủ hiện **15 logo** → tải lại admin vẫn đủ. 1440/390px không tràn, logo không hỏng. **9/9 PASS** | Bản build production (local), commit mới | `docs/screenshots/doi-tac/` |
| 6 | Test tự động `npm test`: **83/83**; `tsc --noEmit` sạch; `npm run build` thành công | Máy làm việc | chạy lại bằng `npm run check && npm test && npm run build` |

## 2. Chưa kiểm chứng

- **Production đã triển khai**: chưa deploy nên chưa kiểm tra trên `danava.com.vn`, chưa chạy với MySQL thật, chưa thử trên hosting cPanel (Passenger, glibc cũ).
- **Dữ liệu production**: chưa đọc nội dung đang lưu trong MySQL. Kết quả trên production phụ thuộc dữ liệu đã lưu (xem `CHECKLIST-CMS-SAU-TRIEN-KHAI.md`).
- **Thiết bị thật**: mới giả lập trong Chrome. Chưa thử Safari/iOS, Firefox, Android thật. Chưa thử trình đọc màn hình.
- **Hiệu năng**: chưa đo Lighthouse; chưa có Core Web Vitals người dùng thực.
- **Upload ảnh trong admin** (sharp) trên hosting: chưa thử (đã ghi trong `BAN-GIAO.md`).
- **Preview công khai**: chưa có. Môi trường duy nhất là `http://localhost:3300` trên máy làm việc. Repo có thư mục `.vercel`, nhưng chưa xác nhận Vercel còn liên kết với GitHub, và không triển khai lên dịch vụ ngoài khi chưa được đồng ý.

## 3. Lỗi và giới hạn còn tồn tại

| Mức | Mô tả | Trạng thái |
|---|---|---|
| Đã sửa (commit mới) | Đăng nhập admin bị **403** trên mọi preview/staging đặt `SITE_URL=https://danava.com.vn`, vì kiểm tra Origin chỉ chấp nhận đúng tên miền đó. Production không bị. Sửa: chấp nhận tên miền chính **hoặc** chính host đang phục vụ request; trang ngoài vẫn bị chặn (có test). | Preview `d515c3e` vẫn mang lỗi này. Muốn thử admin trên preview này phải mở bằng `http://localhost:3300` và không đặt `SITE_URL`. |
| Đã sửa (commit mới) | Ảnh chia sẻ (Open Graph) trang Liên hệ, Marketing, Du lịch dùng ảnh stock (London Eye, word cloud). Đã thay bằng tư liệu DANAVA. | — |
| Đã sửa (commit mới) | Khối logo 15 mục bị lẻ 1 ô ở hàng cuối. Đã chuyển sang lưới 5/3 cột. | — |
| Giới hạn | Ảnh toàn trang: thanh tab dưới và nút nổi (`position: fixed`) bị in một lần ở vị trí màn hình đầu. Đây là giới hạn của cách chụp toàn trang, không phải lỗi giao diện. Ảnh từng màn hình trong `docs/screenshots/identity/*-fold.jpg` cho thấy vị trí thật. | Không sửa |
| Có từ trước | `npm test` ghi nội dung vào `.data/` local, làm database local lưu sẵn giá trị mặc định (vd. danh sách khách hàng cũ). Không ảnh hưởng production. | Chưa sửa: đổi hành vi test nằm ngoài phạm vi; ghi chú để biết |
| Cần DANAVA | Tên giải pháp trong dữ liệu đã lưu còn cũ (“Marketing & Truyền thông”, “Du lịch & Sự kiện”). Phạm vi 4 chương trình sự kiện chưa rõ. Phạm vi Vinhomes cần xác nhận. Quyền hiển thị logo 15 đối tác cần xác nhận. | Xem checklist |

## 4. Lịch sử commit trên nhánh
- `f0615ba` cấu trúc nội dung, CMS, SEO kỹ thuật.
- `d515c3e` bản sắc từng trang, tách Sự kiện & Truyền thông, Vinhomes nổi bật.
- commit mới (sau `d515c3e`): đối tác đồng hành từ danava.vn, sửa đăng nhập admin trên staging, thay ảnh stock, báo cáo và checklist.

## 5. Cập nhật: gỡ 4 dự án, trang DANAVA Studio mới, giao diện app Yoga Club thật

| Nội dung | Môi trường | Bằng chứng |
|---|---|---|
| Gỡ **Bước Chạy Nhịp Sống, Omachi, AURUM, DriveRent** khỏi dữ liệu mặc định và xóa ảnh. Danh sách `REMOVED_SHOWCASE_IDS` lọc 4 mục này cả khi database đã lưu chúng. Trang chủ, trang Website, `/du-an/` không còn 4 dự án | Bản build production (local) | `docs/screenshots/studio/ket-qua-studio.txt`, test `identity.test.ts` |
| Trang **DANAVA Studio** bố cục riêng: hero sản phẩm (dashboard + app), “Đang vận hành tại” (HARIVER, Huế Pilates & Yoga), tham quan theo vai trò (Chủ cơ sở / Lễ tân / HLV / Hội viên), khối app hội viên, 16 phân hệ, thư viện 42 màn hình, mô hình, case study, báo giá, FAQ. 14/14 PASS (360/390/768/1440, bàn phím mũi tên/End, giảm chuyển động) | Bản build production (local) | `docs/screenshots/studio/` |
| **App hội viên dùng giao diện thật của Yoga Club Vietnam** (ycv.danava.vn): màn hình chào (VI/EN) và đăng nhập, chụp từ app đang chạy, chỉ màn hình công khai. Hero, vai trò “Hội viên” và khối app chỉ dùng các ảnh này | ycv.danava.vn (đọc công khai) | `public/assets/studio/ycv/sources.json` |

**Phát hiện trên app Yoga Club đang chạy:** màn hình “Chọn gói tập” công khai đang hiện gói **“TEST GÓI TRẢI NGHIỆM 3 BUỔI” giá 2.000đ**, khiến các nhóm Yoga, Breathwork, Spa ghi “từ 2.000đ”. Tôi không đưa màn hình này lên website. Cần ẩn gói test trong admin của app; sau đó có thể chụp thêm màn hình chọn gói.

**Chưa có:** màn hình bên trong app Yoga Club (trang chủ hội viên, gói của tôi, QR check-in) cần đăng nhập. Chưa chụp vì không có tài khoản thử, và không tạo tài khoản trên hệ thống thật. Nhóm “App hội viên” trong thư viện đầy đủ vẫn là ảnh từ bộ hướng dẫn sử dụng (cơ sở demo), đã ghi chú rõ.

**Giới hạn ảnh toàn trang:** thẻ `.s-card` có hiệu ứng hiện dần theo vị trí cuộn, nên trong ảnh toàn trang một số khối gần cuối trông trống. Khi cuộn thật, thẻ hiện bình thường (đã đo độ mờ = 1).

## 6. Cập nhật: trang Hệ sinh thái

- Làm lại /he-sinh-thai/ (server component): sơ đồ hệ sinh thái của chủ sở hữu, hành trình khách hàng 4 bước (Thu hút → Vận hành → Gắn kết → Trải nghiệm), 4 khối năng lực với ảnh sản phẩm thật, bảng sản phẩm đang chạy, 15 đối tác đồng hành.
- Bổ sung: DANAVA E-learning đang chạy thật tại edu-yoga.danava.vn (Học Yoga online cùng Yoga Club Vietnam), nền tảng danava.vn, DANAVA GO (danavago.com), app hội viên ycv/hariver/hue. 13 tên miền kiểm tra trực tiếp ngày 19/11/2026 (public/assets/ecosystem/sources.json).
- Gỡ các khẳng định chưa có căn cứ trong dữ liệu cũ: “hàng ngàn thành viên”, “toàn quốc”, “tải trang dưới 1 giây”, “cam kết chi phí lead”, “thường niên”, “iOS & Android”, “mở tour định kỳ”. Có test chặn các cụm này quay lại.
- DANAVA PMS chưa có sản phẩm công khai để kiểm chứng nên ghi “Tư vấn theo yêu cầu”, không gắn link sản phẩm.
- Kiểm tra trình duyệt 10/10: 360/390/768/1024/1440px, không tràn, không ảnh hỏng, không lỗi console, liên kết hành trình cuộn đúng, giảm chuyển động. Ảnh: docs/screenshots/he-sinh-thai/.

## 7. Cập nhật: gỡ toàn bộ Digital Marketing

DANAVA không cung cấp Digital Marketing (yêu cầu của chủ sở hữu, 19/11/2026). Đã gỡ:
- Giải pháp “Digital Marketing” cùng các dịch vụ con mkt-*, chủ đề kiến thức `marketing`, khối “DANAVA DIGITAL” trên trang Hệ sinh thái và Trình chiếu, lựa chọn “Digital Marketing” trên form liên hệ.
- 5 bài viết thuộc mảng này (`marketing`, `wp-13086`, `wp-12101`, `wp-11869`, `wp-11219`) bị gỡ khỏi website, sitemap và dữ liệu gửi xuống trình duyệt.
- Dữ liệu đã lưu trên production được lọc khi đọc (`normalizeContent`): giải pháp, chủ đề, bài viết, khối DIGITAL và cụm “Chiến dịch marketing” cũ không còn hiển thị, kể cả khi chưa sửa trong CMS.
- URL cũ chuyển hướng 308: `/giai-phap/digital-marketing/*` → `/giai-phap/`; `/kien-thuc/chu-de/digital-marketing/`, 5 bài viết và URL WordPress cũ của chúng → `/kien-thuc/`.
- Kiểm chứng: quét 50 URL trong sitemap trên bản build cục bộ, không trang nào còn “Digital Marketing”, “DANAVA DIGITAL” hay “Chiến dịch marketing” (trừ 1 câu trong bài cũ về tên miền, mục 3 bên dưới). Có test chặn nội dung này quay lại.
- Còn lại cần chủ sở hữu quyết định: chức danh “Marketing Director” của anh Trần Văn Nam (giữ nguyên vì là chức danh thật); câu “chiến dịch marketing online” trong bài “Tầm quan trọng của việc đăng ký tên miền”.

## 8. Cập nhật: trang Đối tác đồng hành `/doi-tac/`

- Thông tin của 15 đối tác lấy từ trang công khai của từng đối tác trên danava.vn ngày 19/11/2026 (JSON-LD và mục hỏi đáp): tên đầy đủ, địa chỉ, tỉnh/thành, giờ mở cửa, loại hình, dịch vụ và tiện ích, giới thiệu, ảnh bìa. Dữ liệu gốc lưu tại `public/assets/partners/sources.json`, ảnh bìa tại `public/assets/partners/covers/`.
- Trang mới nhóm đối tác theo tỉnh/thành và có JSON-LD ItemList + BreadcrumbList; trang đã được thêm vào sitemap. Logo đối tác ở Trang chủ và Hệ sinh thái giờ dẫn tới thẻ đối tác tương ứng; chân trang có thêm liên kết “Đối tác đồng hành”.
- CMS (Bằng chứng → Đối tác) có thêm các trường chi tiết. Nút “Bổ sung đối tác” điền những trường còn trống mà không ghi đè dữ liệu đã sửa.
- Không hiển thị số điện thoại của đối tác.
- Fuji Swimming Club DaNang: trang trên danava.vn trả 404 nên không có liên kết và địa chỉ; đối tác được xếp vào Đà Nẵng theo tên.
- Kiểm tra trình duyệt 11/11 (360/390/768/1024/1440px): không tràn, không ảnh hỏng, không lỗi console; bấm logo cuộn tới đúng thẻ; mở được “Giới thiệu” bằng bàn phím; tôn trọng chế độ giảm chuyển động. Ảnh chụp: `docs/screenshots/doi-tac/`.
- Kiểm thử tự động: 89/89 đạt.

## 9. Cập nhật: toàn bộ địa điểm trên danava.vn/places

- Kiểm tra lại danava.vn ngày 19/11/2026: khối “Đối tác đồng hành” có đúng 15 mục (đã có). Danh bạ công khai danava.vn/places có 47 địa điểm (khớp sitemap của danava.vn), trong đó 10 địa điểm có huy hiệu DANAVA Verified. Con số “+4.065 địa điểm” trên trang chủ danava.vn không có danh sách công khai tương ứng nên không thể lấy thêm.
- Bổ sung 32 địa điểm còn lại vào /doi-tac/, mục “Địa điểm wellness trên danava.vn”: logo, ảnh bìa, loại hình, tỉnh/thành, địa chỉ, giờ mở cửa, tiện ích, giới thiệu, huy hiệu Verified, liên kết tới trang trên danava.vn. Có bộ lọc theo loại hình và tỉnh/thành. Không ghi các địa điểm này là “đối tác đồng hành” vì danava.vn chỉ liệt kê họ trong danh bạ.
- Fuji Swimming Club Da Nang: khối đối tác trên danava.vn liên kết sai (/places/fuji-swimming-club-danang → 404); trang đúng là /places/fuji-swimming-club-da-nang. Đã gắn liên kết đúng và bổ sung địa chỉ, giờ mở cửa, tiện ích.
- CMS: loại quan hệ mới “Địa điểm trên danava.vn/places” và nút “Có huy hiệu DANAVA Verified”. Dữ liệu đã lưu trên production được bổ sung 32 địa điểm một lần khi đọc. Muốn ẩn địa điểm nào thì tắt “Xuất bản”; danh sách rỗng do quản trị viên chọn được giữ nguyên.
- Khối logo ở Trang chủ và Hệ sinh thái vẫn chỉ hiện khách hàng và 15 đối tác đồng hành. Danh bạ 32 địa điểm không gửi xuống trình duyệt ở các trang khác.
- Lưu ý dữ liệu nguồn: 10 địa điểm ghi giờ mở cửa “08:00 - 21:00”, có thể là giá trị mặc định của danava.vn; trang hiển thị đúng như nguồn công bố.
- Kiểm tra trình duyệt 12/12, kiểm thử tự động 90/90.

## 10. Cập nhật: đồng nhất phông chữ toàn dự án

- Trước khi sửa, các trang dùng lẫn 5 bộ phông: Manrope, Be Vietnam Pro, Playfair Display, Noto Serif và UTM Eremitage (không có file phông). Tiêu đề trang cũ dùng Be Vietnam Pro ExtraBold, trang mới dùng Playfair Display. Trang Liên hệ và Chính sách có chữ Consolas.
- Nay toàn dự án (website, trang 404, CMS) chỉ dùng 2 phông, khai báo một nơi duy nhất (`lib/site-font.ts` + `app/fonts.css`):
  - **Be Vietnam Pro** (`--font-sans`): chữ nội dung, nút, biểu mẫu, nhãn.
  - **Playfair Display** (`--font-display`): tiêu đề trang (h1) và tiêu đề mục (h2), độ đậm 500.
- Hai phông đều được next/font tự phục vụ khi build (đủ bộ ký tự tiếng Việt) và preload; trình duyệt không gọi Google Fonts. Đã xoá 15 file phông cũ trong `public/fonts/`.
- Sửa kèm: khối app hội viên trên trang DANAVA Studio bị cắt chữ trên điện thoại (cột lưới rộng 458px trong màn 390px).
- Kiểm tra: 16 trang × 3 khổ (1440/390/360px) đạt 48/48. Không trang nào tràn ngang, mọi h1 dùng Playfair, nội dung dùng Be Vietnam Pro. Kết quả: `docs/screenshots/phong-chu/`.

## 11. Cập nhật: giao diện điện thoại và phạm vi chỉnh sửa trong CMS

### Điện thoại (50 URL sitemap + 404 + trang đăng nhập CMS, khổ 360 và 390px)
- Không trang nào tràn ngang, không chữ ra ngoài màn hình, không ảnh hỏng, không chữ nhỏ hơn 11px.
- Đã sửa:
  - mục lục bài viết có đường link dài bị tràn (tự xuống dòng);
  - chữ 10px ở tâm sơ đồ Hệ sinh thái (nâng lên 11.5px);
  - vùng bấm cho link chân trang, breadcrumb, các link "Xem…", link trên trang Liên hệ, Chính sách, Dự án (cao tối thiểu 44px trên điện thoại), và chấm chuyển ảnh ở hero;
  - khối app hội viên trên trang Studio bị cắt chữ (mục 10).
- Lỗi console duy nhất là ở trang 404: đó là thông báo mã 404 của chính trang, đúng như thiết kế.

### CMS: đã sửa
- Thanh bên: 3 mục trước đây dùng chung một biểu tượng nay có biểu tượng riêng; rút gọn tên "Portfolio" và "Đối tác & nhận xét" (trước bị cắt chữ); có dấu hiệu còn mục bên dưới khi menu dài hơn màn hình.
- Danh sách 47 khách hàng, đối tác và địa điểm có thêm ô tìm kiếm, bộ lọc (Khách hàng / Đối tác / Địa điểm / Đang ẩn), logo, loại, tỉnh/thành, huy hiệu Verified và trạng thái hiển thị.
- Ô nhập nhiều dòng tự giãn theo nội dung, không còn thanh cuộn nhỏ bên trong.
- Hotline sửa trong Cài đặt nay áp dụng cả cho nút Zalo và dữ liệu có cấu trúc của trang Liên hệ (trước đây hai chỗ này dùng số cố định trong mã nguồn).
- Kiểm tra E2E: sửa tiêu đề H1, mô tả giải pháp, giờ mở cửa đối tác, chức danh nhân sự và hotline trong CMS → lưu → cả 5 nội dung hiện đúng trên website.

### Phạm vi chỉnh sửa
| Nội dung trên website | Sửa trong CMS? |
|---|---|
| Trang chủ: tiêu đề H1, thông điệp, mô tả, số liệu | Có (Trang chủ, Số liệu) |
| Giải pháp: tên, mô tả, đối tượng, vấn đề, phạm vi, quy trình, FAQ, chi phí, SEO; trang dịch vụ con | Có (Giải pháp) |
| Bài viết, danh mục kiến thức | Có |
| Dự án, portfolio website, chương trình sự kiện, case study, mục nổi bật, thứ tự | Có (Dự án, Portfolio) |
| Khách hàng, đối tác, địa điểm danava.vn, nhận xét | Có (Đối tác & nhận xét) |
| Nhân sự: họ tên, chức danh, ảnh, ẩn/hiện, thứ tự | Có (Nhân sự) |
| Email, hotline | Có (Cài đặt) |
| Trình chiếu mở đầu, sơ đồ hệ sinh thái trong trình chiếu | Có (Trình chiếu) |
| Hồ sơ chi tiết nhân sự (giới thiệu, kinh nghiệm, kỹ năng) | Có (Hồ sơ nhân sự), từ mục 12 |
| Địa chỉ văn phòng, giờ làm việc, link Facebook/YouTube | Có (Thông tin công ty), từ mục 12 |
| Trang Hệ sinh thái (đơn vị, hành trình, sản phẩm đang chạy) | Có (Hệ sinh thái), từ mục 12 |
| Trang Về DANAVA (lịch sử, giá trị, văn phòng) | Có (Về DANAVA), từ mục 12 |
| Màn hình app và 16 module trên trang Studio; khối nhận diện riêng của trang Website, Sự kiện | **Chưa**: trong mã nguồn |
| Chữ đầu trang và dải kêu gọi cuối trang | Có (Chữ trên các trang), từ mục 12 |
| Chính sách bảo mật, điều khoản dịch vụ | Có (Chính sách), từ mục 12 |
| Menu, chân trang | **Chưa**: trong mã nguồn |


## 12. Cập nhật: CMS chỉnh được thêm 5 nhóm nội dung

Nhóm menu mới **"Trang & thông tin"** trong CMS gồm 6 mục. Nội dung mặc định lấy đúng chữ đang hiển thị, nên website không đổi cho tới khi quản trị viên sửa và bấm Lưu. Mỗi mục có nút "Khôi phục mặc định".

| Mục trong CMS | Áp dụng cho |
|---|---|
| Thông tin công ty | Chân trang, menu điện thoại, Liên hệ (giờ làm việc, bản đồ, Facebook, YouTube, pháp nhân, email hỗ trợ), Về DANAVA, Trang chủ, dữ liệu Organization/LocalBusiness cho Google, chính sách |
| Chữ trên các trang | Dòng chữ nhỏ, tiêu đề H1, câu dẫn và dải kêu gọi cuối trang của 8 trang, dải cuối trang Studio, Website, case study, dải mặc định (bài viết, chủ đề). Đặt `*dấu sao*` quanh phần muốn nhấn mạnh |
| Về DANAVA | Giá trị · sứ mệnh · tầm nhìn, cột mốc, ảnh hoạt động, nguyên tắc làm việc (cũng hiện ở Trang chủ), quy trình hợp tác (Trang chủ) |
| Hệ sinh thái | Khối năng lực, hành trình khách hàng, đơn vị (chọn khối và giai đoạn bằng ô chọn, bật/tắt hiển thị), sản phẩm đang chạy |
| Hồ sơ nhân sự | Thẻ trên trang Đội ngũ và trang hồ sơ: phòng ban, chuyên môn, giới thiệu, kỹ năng, đóng góp, liên kết, vai trò trong từng dự án (chọn dự án từ danh sách) |
| Chính sách | Chính sách quyền riêng tư (8 mục, bảng lưu trữ, quyền, điều khoản chờ xác nhận) và chính sách dịch vụ (3 nhóm, SLA, kênh hỗ trợ, điều khoản dự thảo) |

- **Biểu mẫu:** sinh tự động theo cấu trúc dữ liệu. Chữ ngắn dùng ô một dòng, chữ dài dùng ô nhiều dòng, ảnh chọn từ Thư viện, danh sách có thêm / xóa / đổi thứ tự, trường cố định dùng ô chọn.
- **An toàn khi lưu:** máy chủ kiểm tra dữ liệu đúng cấu trúc mặc định (không thêm khóa lạ, đúng kiểu, giới hạn độ dài, tối đa 600 KB). Chữ trong chính sách được hiển thị không qua HTML thô.
- **Hồ sơ nhân sự:** danh sách tự khớp với mục Nhân sự. Người mới có hồ sơ mặc định; người đã xóa không còn hồ sơ.
- **Kiểm tra:**
  - Kiểm thử tự động 97/97. Có test chứng minh hồ sơ nhân sự dựng từ dữ liệu mới giống hệt bản cũ.
  - So sánh chữ hiển thị của 18 trang trước và sau thay đổi: không khác.
  - E2E trên giao diện quản trị 18/18: sửa ở cả 6 mục → lưu → hiện đúng trên website; "Khôi phục mặc định" đưa nội dung về như cũ.
- **Còn trong mã nguồn (ít khi cần sửa):** màn hình app và 16 module trên trang Studio, khối nhận diện riêng trang Website/Sự kiện, menu chính và chân trang (cấu trúc liên kết), trang 404.
