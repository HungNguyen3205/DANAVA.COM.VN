# Báo cáo kiểm thử nghiệm thu toàn dự án — danava.com.vn

Ngày kiểm thử: 24/11/2026 · Người thực hiện: Claude (Claude Code) · Bằng chứng: [`docs/qa/evidence/`](evidence/)

## 1. Môi trường, nhánh, phiên bản

| Mục | Giá trị |
|---|---|
| Repository / nhánh | `HungNguyen3205/DANAVA.COM.VN`, nhánh `main` |
| Mã nguồn kiểm thử | Bắt đầu từ `4ef5c68`; kết quả cuối trên commit chứa báo cáo này (gồm các bản sửa ở mục 4) |
| Stack | Next.js 16.4.6 (App Router, Turbopack, output standalone), React 19, Node.js v24.13.0, Windows 11 |
| Chạy | **Bản build production** (`npm run build` → `node server.cjs`), không phải chế độ dev |
| Database | **SQLite** (node:sqlite) trong thư mục tạm riêng cho từng lần chạy. **MySQL/MariaDB chưa kiểm tra thực tế** (xem mục 6) |
| Dữ liệu | Dữ liệu thử nghiệm riêng (thư mục tạm, xóa sau khi chạy); tài khoản thử nghiệm tạo trong lúc chạy. Không đụng `.data/` hay database production |
| Khóa AI | Đặt rỗng cho server test → ANNA ở chế độ “chưa sẵn sàng” (không gọi dịch vụ AI thật) |
| Trình duyệt | Microsoft Edge 158.0.4370.33 headless (Chromium) qua DevTools Protocol. Điện thoại = **mô phỏng** (Emulation 360/390 px, sự kiện con trỏ loại touch) — **không** phải WebKit/Safari hay điện thoại thật |
| `.env` | Không đọc giá trị. Chỉ kiểm tra tên biến để chắc server test không dùng database thật (file có `DANAVA_DATA_DIR`, `DANAVA_ADMIN_PASSWORD_HASH`, `GEMINI_API_KEY`; không có cấu hình MySQL) |

## 2. Phạm vi thực tế của dự án

- **Website công khai** (27 route, 60 URL trong sitemap): Trang chủ (3D văn phòng + mã QR Zalo, hành trình, ảnh doanh nghiệp, ANNA), Giải pháp + trang sản phẩm + trang con, Dịch vụ, Hệ sinh thái, Dự án/case study, Blogs/chủ đề, Về DANAVA, Đội ngũ, Đối tác, Tuyển dụng, Liên hệ, Báo giá web, landing page `/lp/*`, chính sách, 404.
- **Admin** (8 nhóm, 23 màn): Tổng quan · Website (Trang + Chỉnh trực tiếp, Landing page, Menu, Giao diện chung, Mẫu & khối) · Sản phẩm & Dịch vụ · Nội dung (Bài viết, Dự án & Portfolio, Hồ sơ thương hiệu) · Khách hàng (Yêu cầu, Danh bạ, Biểu mẫu) · Tài nguyên · Báo cáo (Truy cập, Nguồn khách, Hiệu quả nội dung) · Hệ thống (Cài đặt, Tài khoản & quyền, SEO & chuyển hướng, Tích hợp, Nhật ký & sao lưu).
- **API**: công khai `/api/lead`, `/api/recruit`, `/api/analytics`, `/api/anna`; admin `/api/admin/{session,content,revisions,users,leads,media,analytics,audit}`.
- **Quyền**: 5 vai trò (owner, admin, editor, writer, sales) — `lib/permissions.ts`.
- **Chưa có trong dự án** (NOT IMPLEMENTED theo yêu cầu kiểm thử): kéo di chuyển / đổi kích thước khối trong Chỉnh trực tiếp; trình chiếu (dữ liệu `presentation` còn nhưng không gắn route); kết nối dịch vụ ngoài khác ngoài ANNA (không có email/SMS/CRM).

## 3. Kết quả tổng hợp

| Phần | Kiểm tra | Trạng thái | Bằng chứng |
|---|---|---|---|
| Build / typecheck | `npm run check`, `npm run build` | **PASS** | `01-typecheck.log`, `03-build.log` |
| Unit test | 165 test (gồm 2 test hồi quy mới của đợt này) | **PASS** 165/165 | `02-unit-tests.log` |
| Integration có sẵn | đăng nhập, CSRF, xung đột, nháp, SEO, sitemap, analytics, tài khoản, lịch sử, sản phẩm, landing | **PASS** | `04-integration.log`, `05-integration-cms.log` |
| API/BE/DB (mới) | 138 trường hợp: quyền, nháp, xuất bản, xung đột, hợp lệ, XSS, biểu mẫu, ảnh, báo cáo, ANNA, SEO, phiên | **PASS 137 / FAIL 1** (P3 nội dung) | `06-qa-api.log`, `api-results.md` |
| Trình duyệt (mới) | 61 URL × 2 khổ, 50 ảnh responsive, bàn phím, 3D, biểu mẫu mạng chậm/mất mạng, cảnh báo chưa lưu | **PASS** 13/13 | `07-qa-browser.log`, `browser-results.json`, `screens/` |
| Bố cục admin | mọi màn + mọi tab ở 360 / 1024 / 1440 (đợt trước: 390 / 768 / 1280) | **PASS** sau sửa (còn 2 báo nhầm đã xác minh) | `08-admin-layout-audit.log` |
| Chỉnh trực tiếp | luồng bắt buộc 1–8 cho chữ, ảnh, liên kết; dữ liệu dùng chung; vai trò; điện thoại | **PASS** | `09/10/11-live-*.log`, `live/`, `luong-chinh-sua-truc-tiep.mp4` |

### 3.1 Ma trận theo module

| Module | Kịch bản chính | Trạng thái |
|---|---|---|
| Website công khai | 61 URL ở 390 & 1440 px: 0 lỗi JS/console, 0 request lỗi, 0 ảnh hỏng, 0 tràn ngang; 404 đúng; không tải trình chỉnh / CSS admin | PASS |
| Tổng quan admin | Số liệu từ dữ liệu thật, việc cần xử lý, lối tắt; bố cục 5 khổ | PASS |
| Website (Trang, Landing, Menu, Giao diện, Mẫu) | Lưu nháp/xuất bản, landing + form (integration), bố cục | PASS |
| Sản phẩm & Dịch vụ | Tạo/xuất bản sản phẩm mới, gói, nhóm, trùng đường dẫn (integration-cms); tham chiếu treo không làm sập trang | PASS |
| Nội dung | Bài viết trùng slug bị chặn; dự án/portfolio; hồ sơ thương hiệu; sửa một mục không mất mục khác | PASS |
| Khách hàng | Biểu mẫu hợp lệ/sai/dài/HTML/bot/lặp/khác nguồn/quá lớn; phân công + trạng thái; mạng chậm; mất mạng | PASS (sau sửa QA-01, QA-02, QA-05) |
| Tài nguyên | PNG/JPEG hợp lệ; file chữ, PNG hỏng, SVG có script, > 6 MB bị từ chối; phục vụ đúng MIME + nosniff; chặn `../` | PASS |
| Báo cáo | Ghi lượt xem đúng +1; lượt của admin và nguồn lạ không tính | PASS |
| Hệ thống | Đăng nhập (đúng/sai/khác nguồn/giới hạn 10 lần), đăng xuất, phiên hết hạn, ma trận quyền 4 vai trò × 7 API + ghi/xuất bản, tài khoản, lịch sử/khôi phục, nhật ký | PASS |
| Chỉnh sửa trực tiếp | Xem mục 3.2 | PASS |
| Tương tác đặc biệt | 3D dựng + mã QR; giảm chuyển động; ANNA khi AI không sẵn sàng; trình chiếu | PASS · trình chiếu NOT IMPLEMENTED (không có route) |
| SEO | sitemap, robots, canonical, description, og:image, 1 H1, noindex admin, chuyển hướng cũ, 404 | PASS · **tiêu đề dài: FAIL P3** (4 trang) |

### 3.2 Chỉnh sửa trực tiếp — luồng bắt buộc (desktop 1440 px)

| # | Kịch bản | Mong đợi | Thực tế | Trạng thái |
|---|---|---|---|---|
| 1 | Đăng nhập bằng form admin (chủ website) | Phiên owner | `true owner` | PASS |
| — | Mở Website → Trang chủ → nút “Chỉnh trực tiếp” | Trang thật, cùng H1 với website | H1 trùng trang công khai | PASS |
| — | Nút “Chỉnh sửa” + Tab + Enter (không nhấn giữ) | Chọn được phần chữ | `hero.kicker` đang sửa | PASS |
| — | Kéo chuột trên chữ / nhấn giữ trên 3D | Không vào chỉnh sửa | Vẫn “Xem” | PASS |
| 2 | Nhấn giữ “Cùng bạn phát triển.”, gõ tiếng Việt qua bộ gõ (đồng bộ giữa chừng 700 ms) | Không mất dấu, con trỏ không nhảy | “Đồng hành bền vững.” | PASS |
| — | Esc khi đang sửa | Khôi phục chữ, không đổi trạng thái lưu | “DANAVA Solutions”, “Đã xuất bản” | PASS |
| — | Dán HTML + nhiều dòng vào ô một dòng | Chỉ chữ thuần, gộp dòng | Không có thẻ/onclick | PASS |
| — | Enter ở ô nhiều dòng | Xuống dòng | Lưu “…\nDòng thứ hai QA” | PASS |
| — | Sửa nút: URL `javascript:` → bị chặn; URL đúng → áp dụng; trang không điều hướng | Chặn + áp dụng | “Đặt lịch tư vấn QA → /lien-he/?service=danava-studio” | PASS |
| — | Đổi ảnh từ thư viện + mô tả + vị trí cắt | Ảnh, alt, cắt đổi tại chỗ | office.webp, alt QA, `top` | PASS |
| — | Hoàn tác / làm lại | Quay lại / áp lại | Đúng thứ tự | PASS |
| — | Popover / thanh công cụ trong màn hình (1440 & 390) | Không vượt mép | `inside: true` | PASS |
| 3 | Lưu nháp | “Đã lưu nháp” | Đúng | PASS |
| — | Lưu khi mất mạng (chặn API lưu), rồi lưu lại | Báo lỗi, giữ nội dung; lưu lại thành công | “Chưa lưu được: mất kết nối, thử lại”, chữ còn; sau đó “Đã lưu nháp” | PASS (`12-live-save-error.log`) |
| 4 | Tải lại trình chỉnh | Chữ, nút, ảnh, alt còn | Còn đủ | PASS |
| 5 | Khách chưa đăng nhập (`/`, `/?cms=1`, header giả) | Bản công khai cũ | Không thấy nháp | PASS |
| 6 | Xuất bản | “Đã xuất bản” | Đúng | PASS |
| 7 | Website công khai, kể cả tải lại | Chữ, nút, ảnh, alt, dòng mới | Đủ cả 5 | PASS |
| 8 | Dữ liệu dùng chung: sửa câu dẫn dải cuối trang mặc định ở trang Giới thiệu | Giới thiệu + bài viết Blogs cập nhật | Giới thiệu + 3 bài viết đều có chữ mới | PASS |
| — | Cộng tác viên | Có Lưu nháp, không có Xuất bản; API xuất bản 403; công khai không đổi | Đúng | PASS |
| — | Kinh doanh | Không vào trình chỉnh; `?cms=1` không thấy nháp | Đúng | PASS |
| — | Điện thoại 390 px: chạm giữ sát mép trên; chạm nút | Chọn đúng, thanh/popover trong màn hình, không điều hướng | Đúng | PASS (mô phỏng) |
| — | Kéo di chuyển / đổi kích thước khối | — | Chưa có trong dự án | NOT IMPLEMENTED |

## 4. Lỗi tìm thấy và đã sửa

| ID | Mức | Module | Lỗi | Nguyên nhân | Sửa | Kiểm lại |
|---|---|---|---|---|---|---|
| QA-01 | P2 | Khách hàng / API | `/api/lead` nhận yêu cầu gửi từ **website khác** (Origin lạ) → có thể bị gửi rác hộ | Thiếu kiểm tra cùng nguồn (API tuyển dụng đã có) | Thêm `sameOrigin` (`app/api/lead/route.ts`) | qa-full: Origin lạ → 403 |
| QA-02 | P2 | Khách hàng / API | `/api/lead` đọc toàn bộ thân yêu cầu không giới hạn (3 MB vẫn 201); JSON hỏng → **500** | `req.json()` không giới hạn, lỗi parse rơi vào nhánh 500 | Giới hạn 32 KB trước khi đọc, JSON hỏng → 400 | qa-full: 413/đóng kết nối, 400 |
| QA-03 | P2 | Khách hàng / Admin API | `PATCH /api/admin/leads` nhận **mọi** trạng thái (vd. `hacked`), người phụ trách/ghi chú không giới hạn | Không kiểm tra giá trị ở BE | Chỉ nhận `new/assigned/contacted/completed`, chuỗi ≤ 150 / 2.000 | qa-full: trạng thái lạ → 400 |
| QA-04 | P2 | Website / SEO | Trang Dịch vụ **“Truyền thông” `/dich-vu/truyen-thong/` không mở được** (luôn chuyển sang `/giai-phap/su-kien-truyen-thong/`), sitemap vẫn khai báo URL này | Chuyển hướng cũ trong `lib/legacy-redirects.ts` trùng trang mới (23/11) | Bỏ chuyển hướng trùng + test hồi quy | qa-full: 60 URL sitemap đều 200; `tests/qa-regressions.test.ts` |
| QA-05 | P3 | Biểu mẫu công khai | Bấm gửi 2 lần thật nhanh gửi **2 yêu cầu**; máy chủ chặn bản trùng (429) nhưng khách thấy “vui lòng không gửi lặp” thay vì “Cảm ơn” | Nút chỉ khóa sau khi React render lại | Khóa đồng bộ `useSubmitLock` cho Liên hệ, landing, trang đăng ký landing, báo giá nhanh | qa-browser: mạng chậm + 2 lần bấm → 1 bản ghi, “Cảm ơn bạn!” |
| QA-06 | P3 | Truy cập (bàn phím) | Phím Tab đầu tiên vào thanh đồng ý đo lường, không phải “Đến nội dung chính” | Thanh đồng ý nằm trước nội dung trong DOM | Đặt sau nội dung (vẫn `position: fixed`, giao diện không đổi) | qa-browser: Tab đầu → `#main` |
| QA-07 | P3 | SEO | 18 trang có tiêu đề > 70 ký tự (Google cắt) | Hậu tố “ \| DANAVA Solutions” cộng tiêu đề dài | Bỏ hậu tố khi tổng > 65 ký tự (`lib/seo.ts`) + test | Còn 4 trang (xem QA-R1) |
| QA-08 | P3 | Admin / Portfolio 360 px | Tên liền dài (vd. `letanthanh.com`) đẩy nút “↓” ra ngoài khung | Chữ không ngắt được | Cho phép ngắt dòng tên | audit 360 px: 0 vấn đề |

Ngoài ra (đã sửa trong cùng đợt, trước báo cáo này): bố cục toàn admin (f48ca8f, 591f776) và độ ổn định nhấn giữ khi máy bận (4ef5c68).

## 5. Lỗi / việc còn lại

| ID | Mức | Nội dung | Đề xuất |
|---|---|---|---|
| QA-R1 | P3 | 4 tiêu đề > 70 ký tự: trang chủ (83, tiêu đề đặt cố định), 3 bài viết có tên rất dài (77–104) — `evidence/seo-issues.txt` | Rút gọn tiêu đề trang chủ (vd. “DANAVA Solutions — Công nghệ, website & sự kiện cho doanh nghiệp”) và tiêu đề SEO 3 bài viết trong admin |
| QA-N1 | — | `/api/lead` không có giới hạn tần suất theo IP (chỉ chặn trùng SĐT trong thời gian ngắn) | Cân nhắc giới hạn theo IP nếu gặp spam (không phải lỗi hiện tại) |
| QA-N2 | — | Máy chủ không chặn dữ liệu tham chiếu “treo” khi gửi thẳng API (giao diện đã tự gỡ liên kết khi xóa); website vẫn hiển thị bình thường (đã kiểm) | Có thể thêm kiểm tra ở `contentProblem` nếu cần chặt hơn |

Không còn lỗi P0/P1/P2 đã biết.

## 6. Chưa kiểm tra / bị chặn

| Phần | Trạng thái | Lý do / điều kiện |
|---|---|---|
| MySQL/MariaDB (production) | **BLOCKED** | Không có MySQL thử nghiệm; mọi kiểm thử chạy SQLite. Cần một database MySQL rỗng để chạy lại `scripts/qa-full.mjs` với biến `DANAVA_DB_*` |
| Safari / WebKit, điện thoại thật | **BLOCKED** | Chỉ có Edge (Chromium) headless. Cần thử tay trên iPhone (Safari) và Android: nhấn giữ, bộ gõ tiếng Việt (Telex/VNI, bàn phím điện thoại), cuộn |
| Vuốt cuộn cảm ứng thật trong khung Chỉnh trực tiếp | **BLOCKED** | Edge headless treo khi phát sự kiện chạm vào iframe (kể cả khi tắt trình chỉnh). Đã kiểm logic bằng sự kiện con trỏ touch: kéo 36 px / `pointercancel` → không vào chỉnh sửa |
| Bộ gõ thật (Unikey/EVKey) | **NOT RUN** | Đã mô phỏng composition qua DevTools; cần thử tay |
| ANNA với AI thật | **NOT RUN** (có chủ đích) | Không gọi dịch vụ AI trả phí trong kiểm thử; đã kiểm trạng thái chưa sẵn sàng, Origin lạ, giới hạn |
| Hết thời gian chờ API (timeout) khi lưu | **NOT RUN** riêng | Đã kiểm mất mạng (fetch lỗi) → giao diện báo lỗi, giữ nội dung; chưa mô phỏng treo 60 s |
| Tải trên 500 ảnh, ảnh bên ngoài không tải được | **NOT RUN** | — |
| Kéo / đổi kích thước khối, trình chiếu | **NOT IMPLEMENTED** | Chưa có trong dự án |

## 7. Lệnh đã chạy (kết quả cuối)

```
npm run check                     → exit 0
npm test                          → 165/165 pass
npm run build                     → exit 0 (production standalone)
npm run test:integration          → PASS
node scripts/integration-cms.mjs  → PASS
node scripts/qa-full.mjs          → 138 trường hợp: 137 PASS, 1 FAIL (QA-R1, P3)
node scripts/qa-browser.mjs       → 13/13 PASS (61 URL × 2 khổ, 50 ảnh responsive)
audit bố cục admin (CDP)          → 360/1024/1440: 0 lỗi thật sau sửa
luồng Chỉnh trực tiếp (CDP)       → owner / writer / sales / mobile: PASS
```

`scripts/qa-full.mjs` và `scripts/qa-browser.mjs` được đưa vào repo để chạy lại (cần `npm run build` trước; script tự tạo server + database tạm, khóa AI rỗng, không đụng dữ liệu thật).

## 8. Bằng chứng

- `evidence/01…12-*.log` — log từng lệnh / từng luồng.
- `evidence/api-results.md` / `.json` — 138 trường hợp API (Module → Kịch bản → Mong đợi → Thực tế → Trạng thái).
- `evidence/browser-results.json`, `browser-public-390.txt`, `browser-public-1440.txt`, `seo-issues.txt`.
- `evidence/screens/` — 50 ảnh trang đại diện (360/390/768/1024/1440), bàn phím, 3D + QR, biểu mẫu mạng chậm / mất mạng, cảnh báo chưa lưu trong admin.
- `evidence/live/` — ảnh luồng Chỉnh trực tiếp (chủ website, cộng tác viên, kinh doanh, điện thoại).
- `evidence/luong-chinh-sua-truc-tiep.mp4` — video ngắn: mở từ admin → nhấn giữ → gõ → sửa nút → đổi ảnh → lưu nháp → tải lại → xuất bản.

## 9. Điều kiện còn thiếu để nghiệm thu

1. Chạy lại `scripts/qa-full.mjs` trên **MySQL** thử nghiệm (môi trường hosting).
2. Thử tay trên **iPhone (Safari) và Android**: nhấn giữ, gõ tiếng Việt, cuộn trong Chỉnh trực tiếp; biểu mẫu Liên hệ.
3. Chỉnh 4 tiêu đề SEO (QA-R1) hoặc chấp nhận.
4. Sau khi deploy production: kiểm tra nhanh trang chủ, `/dich-vu/truyen-thong/` (QA-04), gửi một yêu cầu tư vấn thật, và (nếu dùng Cloudflare/cache hosting) xác nhận xuất bản hiển thị ngay.

Kết luận: trong phạm vi đã có bằng chứng (SQLite, Chromium, mô phỏng điện thoại), các luồng chính của website, admin và Chỉnh trực tiếp **đạt**; không còn lỗi P0/P1/P2 đã biết. Phần MySQL, Safari/điện thoại thật chưa được xác nhận.
