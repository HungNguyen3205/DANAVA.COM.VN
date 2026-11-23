# Nâng cấp hệ quản trị DANAVA (11/2026)

Tài liệu cho người phát triển và người quản trị website. Ghi rõ cấu trúc, dữ liệu, cách triển khai, cách khôi phục và phần còn thiếu.

## 1. Menu quản trị (8 nhóm)

| Nhóm | Mục | Ghi chú |
|---|---|---|
| Tổng quan | Tổng quan | Việc cần xử lý, lối tắt, số liệu |
| Website | Trang · Landing page · Menu điều hướng · Giao diện chung · Mẫu & khối | Trang → chọn trang → tab biểu mẫu + **Chỉnh giao diện** |
| Sản phẩm & Dịch vụ | Danh sách · Nhóm & loại | Hồ sơ: Thông tin chung, Nội dung, Gói & giá, Hiển thị, SEO, Lịch sử |
| Nội dung | Bài viết · Dự án & Portfolio · Hồ sơ thương hiệu | Hồ sơ thương hiệu: Công ty, Kênh liên hệ, Đội ngũ, Hồ sơ nhân sự, Đối tác & nhận xét, Số liệu |
| Khách hàng | Yêu cầu tư vấn · Danh bạ · Biểu mẫu | |
| Tài nguyên | Thư viện | Thư mục ảnh chưa có (xem mục 7) |
| Báo cáo | Truy cập · Nguồn khách · Hiệu quả nội dung | |
| Hệ thống | Cài đặt · Tài khoản & quyền · SEO & chuyển hướng · Tích hợp · Nhật ký & sao lưu | |

- Sidebar tối đa hai tầng; chỉ mở sẵn nhóm đang dùng; mục hiện theo quyền.
- Tìm kiếm toàn admin (Ctrl + K): mục menu + bài viết, sản phẩm, dự án, portfolio, landing page, nhân sự, khách hàng.
- Nút **Tạo mới**: bài viết, sản phẩm/dịch vụ, landing page.
- Đường dẫn admin cũ (`/admin/trang-chu/`, `/admin/giai-phap/`, `/admin/bang-gia/`…) tự chuyển sang vị trí mới (`components/adminNav.ts` → `LEGACY_SECTIONS`).
- Cấu hình menu: `components/adminNav.ts`. Mục chưa chạy thật đặt trong `PENDING` để ẩn (hiện đang trống).

## 2. Phân quyền

Định nghĩa ở `lib/permissions.ts`, kiểm tra tại API bằng `requirePermission()` (`lib/auth.ts`). Giao diện chỉ ẩn nút cho gọn.

| Vai trò | Quyền |
|---|---|
| Chủ website | Đăng nhập bằng mật khẩu máy chủ (`DANAVA_ADMIN_PASSWORD_HASH`). Toàn quyền, không khóa được. |
| Quản trị | Toàn quyền nội dung, khách hàng, báo cáo, tài khoản, hệ thống |
| Biên tập | Soạn, xuất bản nội dung, thư viện, báo cáo truy cập. Không xem khách hàng, không quản lý tài khoản |
| Cộng tác viên | Soạn, lưu nháp, tải ảnh. Không xuất bản |
| Kinh doanh | Yêu cầu tư vấn, danh bạ, báo cáo. Không đọc nội dung hay bản nháp |

- Tài khoản admin (bảng `users`) tách biệt với hồ sơ nhân sự hiển thị trên website (`SiteData.staff`).
- Đổi vai trò/khóa tài khoản có hiệu lực ở request tiếp theo; khóa hoặc đặt lại mật khẩu đăng xuất mọi phiên của người đó.
- Xem trước bản ghi chưa công khai trên website: chỉ người có quyền xem nội dung.

## 3. Bản nháp, xuất bản, lịch sử

- **Lưu nháp** (`PUT /api/admin/content` với `mode: 'draft'`): lưu phía máy chủ vào `content.draft_json`, tải lại trang vẫn còn. Website không đổi.
- **Xuất bản** (`mode: 'publish'`, mặc định để tương thích bản cũ): ghi `content.json`, xóa bản nháp, lưu một phiên bản vào `content_revisions` (giữ 40 lần gần nhất + bản gốc khi nâng cấp).
- **Xung đột**: mỗi lần ghi (nháp hoặc xuất bản) tăng mã chỉnh sửa; ai đang giữ mã cũ sẽ nhận 409 thay vì ghi đè.
- **Khôi phục** (Nhật ký & sao lưu → Phiên bản): đưa phiên bản cũ vào bản nháp (mặc định) hoặc khôi phục & xuất bản ngay; có “Xem thay đổi” theo từng bản ghi.
- **Bỏ nháp**: quay về bản đang công khai.
- Website công khai chỉ đọc `getSiteContent()` (bản đã xuất bản, ẩn sản phẩm chưa xuất bản và bài lưu trữ). Mọi trang dùng SSR `force-dynamic` nên xuất bản xong hiển thị ngay; API còn gọi `revalidatePath` và xóa bộ nhớ đệm chuyển hướng.
- Nhật ký thao tác (`audit_log`): đăng nhập/xuất, lưu nháp, xuất bản, khôi phục, tải ảnh, tài khoản, cập nhật khách hàng.

## 4. Dữ liệu

Nội dung vẫn là một tài liệu JSON (`SiteData`) trong bảng `content`; các bộ sưu tập liên kết bằng ID ổn định.

Mới thêm (đều tùy chọn — dữ liệu cũ hợp lệ, không cần chuyển đổi):

- `services[]`: `type` (loại: Phần mềm / Dịch vụ / Sự kiện & trải nghiệm — quyết định trường cần nhập), `groupId`, `published`, `featured`, `features`, `packages` (gói & giá), `template`, `cover`, `demoUrl`, `signupUrl`, `ogImage`. Sản phẩm thêm trong admin có mã và đường dẫn riêng; 6 sản phẩm gốc giữ đường dẫn (SEO).
- `productGroups[]`: nhóm sản phẩm (phân loại, lọc).
- `landings[]`: landing page `internal` (khối, `/lp/{slug}/`) hoặc `external` (chỉ lưu URL); trạng thái `draft/published/archived`.
- `redirects[]`: chuyển hướng 301 (tự tạo khi đổi đường dẫn bản ghi đang công khai, hoặc thêm tay).
- `posts[]`: `tags`, `archived`.

Kiểm tra: `validateContent()` (`lib/content.ts`, cấu trúc), `contentProblem()` (`lib/content-check.ts`, lời giải thích cụ thể: đường dẫn trùng, thiếu trường bắt buộc theo loại sản phẩm…), `validPageBlock()` (`lib/page-blocks.ts`, dữ liệu và cấu hình hiển thị của từng khối).

Một nguồn dữ liệu: trang sản phẩm, khối “Thẻ sản phẩm”/“Bảng giá” của landing page và ANNA đọc cùng hồ sơ sản phẩm đã xuất bản. Bảng giá DANAVA Studio (dùng cho Hello DANAVA, Báo giá nhanh, ANNA) vẫn ở khối `pricing`, sửa trong hồ sơ DANAVA Studio → Gói & giá.

## 5. Migration và khôi phục

- `lib/database.ts` → `MIGRATIONS`, bảng `schema_migrations`. Chạy tự động khi máy chủ mở kết nối database.
- Migration #1 chỉ **thêm**: bảng `content_revisions`, `users`, `audit_log`; cột `sessions.user_id/role/name`, `content.draft_updated_at/draft_author`. Chạy lại an toàn (bỏ qua bảng/cột đã có). Dữ liệu đang công khai được ghi thành phiên bản `baseline`.
- Không đổi ID, URL, ảnh, quan hệ dữ liệu hay trạng thái công khai cũ.

Trước khi triển khai production:
1. Admin cũ → Cài đặt → **Xuất dữ liệu JSON**; sao lưu thư mục ảnh tải lên.
2. Sao lưu database (cPanel → phpMyAdmin → Export, hoặc `mysqldump`).

Khôi phục nếu cần:
- Quay về bản build cũ: chạy được trên database đã nâng cấp (bỏ qua bảng/cột mới). Không cần đổi database.
- Nội dung sai sau khi xuất bản: Nhật ký & sao lưu → Phiên bản → Khôi phục.
- Mất dữ liệu nghiêm trọng: nhập lại file JSON đã xuất hoặc phục hồi bản sao lưu database.

## 6. Kiểm tra

```bash
npm run check                # TypeScript
npm test                     # unit test (158 test)
npm run build
npm run test:integration     # integration test có sẵn (đăng nhập, CSRF, SSR/SEO, nháp, sitemap, thống kê)
node scripts/integration-cms.mjs   # hệ quản trị: tài khoản & quyền, nháp/xuất bản, xung đột, lịch sử/khôi phục,
                                   # đường dẫn trùng, sản phẩm mới, landing page, chuyển hướng, bài lưu trữ
```

Xem trước trên máy: `npm run build`, rồi chạy `node server.cjs` với `DANAVA_DATA_DIR` trỏ tới thư mục tạm và `DANAVA_ADMIN_PASSWORD_HASH` của mật khẩu thử (tạo bằng `npm run admin:password`), mở `http://localhost:3000/admin/`.

Thử nhanh theo yêu cầu nghiệm thu:
1. Sản phẩm & Dịch vụ → Tạo mới → điền Nội dung, Gói & giá → bật Hiển thị → Xuất bản → mở `/giai-phap/{đường-dẫn}/`.
2. Bài viết → Viết bài mới → Lưu nháp → tải lại trang (bản nháp còn) → bài chưa công khai trả 404 → Xuất bản.
3. Landing page → Tạo từ mẫu → tab Thiết kế: bấm chữ trên bản xem trước để sửa, đổi cỡ chữ/nền/khoảng cách, kéo đổi thứ tự khối, xem chế độ Điện thoại → Xuất bản → `/lp/{đường-dẫn}/`.
4. Sửa giá trong hồ sơ sản phẩm → khối Bảng giá trên landing page đổi theo.
5. Đổi đường dẫn landing đã công khai → Xuất bản → đường dẫn cũ chuyển 301.
6. Website → Trang → Liên hệ → Chỉnh giao diện: bấm tiêu đề trên trang, sửa, xem cập nhật ngay.
7. Tạo tài khoản Cộng tác viên → đăng nhập → nút Xuất bản không có; API từ chối xuất bản (403).

## 7. Phần hoàn chỉnh và phần mới chuẩn bị cấu trúc

Hoàn chỉnh (đã chạy thật, có test):
- Menu 8 nhóm, tab, tìm kiếm toàn admin, Tạo mới, chuyển hướng đường dẫn admin cũ.
- Tài khoản & vai trò, kiểm tra quyền tại API, nhật ký thao tác.
- Bản nháp phía máy chủ, xuất bản, lịch sử, so sánh, khôi phục, bỏ nháp, chống ghi đè.
- Hồ sơ sản phẩm theo loại/nhóm, gói & giá, lịch sử theo bản ghi; thêm sản phẩm không cần sửa code.
- Bài viết: thẻ, lưu trữ, lọc, phân trang, lịch sử.
- Landing page nội bộ (khối, trình chỉnh sửa trực quan: chọn để sửa chữ/ảnh/liên kết/nút, cỡ chữ/căn lề/màu/độ rộng/chiều cao/khoảng cách, kéo thả/ẩn/nhân bản/thêm từ thư viện, xem trước 3 thiết bị) và liên kết ngoài.
- Chỉnh giao diện trang có sẵn: sửa chữ đầu trang/dải kêu gọi trực tiếp trên trang thật.
- Chuyển hướng 301 tự động và thêm tay; kiểm tra đường dẫn trùng; báo cáo Danh bạ, Biểu mẫu, Nguồn khách, Hiệu quả nội dung.

Giới hạn hiện tại:
- **Lưu trữ theo bản ghi**: API kiểm tra và ghi nhận thay đổi theo bản ghi (lịch sử, so sánh, tìm kiếm theo ID), nhưng mỗi lần lưu vẫn ghi lại toàn bộ tài liệu JSON vào một dòng. Tách thành bảng riêng cho từng loại (bài viết, sản phẩm, landing) là bước tiếp theo; các module đã dùng ID ổn định nên có thể chuyển dần.
- **Trang có sẵn** (trang chủ, giới thiệu…) chỉ chỉnh trực quan phần chữ đầu trang/dải kêu gọi; ảnh, danh sách và bố cục của các trang thiết kế riêng vẫn sửa bằng biểu mẫu. Kéo thả và kích thước chỉ áp dụng cho landing page dựng bằng khối.
- **Thư viện**: chưa có thư mục, chưa quản lý video/tài liệu (chỉ ảnh). Không hiện trong menu cho tới khi làm.
- **Biểu mẫu**: là báo cáo các form có sẵn trên website; chưa có trình tạo form mới.
- Gói & giá chỉ hiện trên trang sản phẩm chuẩn và landing page; 4 trang sản phẩm thiết kế riêng (Studio, Website, Marketing, Sự kiện) giữ giao diện cũ.
- Nghiệp vụ mới (đặt phòng, thanh toán, kho hàng) cần module riêng — xem điểm mở rộng ở đầu `lib/product-types.ts`.
