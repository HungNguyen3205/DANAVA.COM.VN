# Nâng cấp hệ quản trị DANAVA (11/2026)

Tài liệu cho người phát triển và người quản trị website. Ghi rõ cấu trúc, dữ liệu, cách triển khai, cách khôi phục và phần còn thiếu.

## 1. Menu quản trị (8 nhóm)

| Nhóm | Mục | Ghi chú |
|---|---|---|
| Tổng quan | Tổng quan | Việc cần xử lý, lối tắt, số liệu |
| Website | Trang · Landing page · Menu điều hướng · Giao diện chung · Mẫu & khối | Trang → chọn trang → tab biểu mẫu + **Chỉnh trực tiếp** (mục 9) |
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
6. Website → Trang → Trang chủ → Chỉnh trực tiếp: nhấn giữ tiêu đề, gõ chữ mới ngay trên trang, Lưu nháp, Xuất bản (mục 9).
7. Tạo tài khoản Cộng tác viên → đăng nhập → nút Xuất bản không có; API từ chối xuất bản (403).

## 7. Phần hoàn chỉnh và phần mới chuẩn bị cấu trúc

Hoàn chỉnh (đã chạy thật, có test):
- Menu 8 nhóm, tab, tìm kiếm toàn admin, Tạo mới, chuyển hướng đường dẫn admin cũ.
- Tài khoản & vai trò, kiểm tra quyền tại API, nhật ký thao tác.
- Bản nháp phía máy chủ, xuất bản, lịch sử, so sánh, khôi phục, bỏ nháp, chống ghi đè.
- Hồ sơ sản phẩm theo loại/nhóm, gói & giá, lịch sử theo bản ghi; thêm sản phẩm không cần sửa code.
- Bài viết: thẻ, lưu trữ, lọc, phân trang, lịch sử.
- Landing page nội bộ (khối, trình chỉnh sửa trực quan: chọn để sửa chữ/ảnh/liên kết/nút, cỡ chữ/căn lề/màu/độ rộng/chiều cao/khoảng cách, kéo thả/ẩn/nhân bản/thêm từ thư viện, xem trước 3 thiết bị) và liên kết ngoài.
- Chỉnh trực tiếp trang có sẵn: chữ, ảnh, nút ngay trên trang thật (mục 9).
- Chuyển hướng 301 tự động và thêm tay; kiểm tra đường dẫn trùng; báo cáo Danh bạ, Biểu mẫu, Nguồn khách, Hiệu quả nội dung.

Giới hạn hiện tại:
- **Lưu trữ theo bản ghi**: API kiểm tra và ghi nhận thay đổi theo bản ghi (lịch sử, so sánh, tìm kiếm theo ID), nhưng mỗi lần lưu vẫn ghi lại toàn bộ tài liệu JSON vào một dòng. Tách thành bảng riêng cho từng loại (bài viết, sản phẩm, landing) là bước tiếp theo; các module đã dùng ID ổn định nên có thể chuyển dần.
- **Trang có sẵn** (trang chủ, giới thiệu…) chỉ chỉnh trực quan phần chữ đầu trang/dải kêu gọi; ảnh, danh sách và bố cục của các trang thiết kế riêng vẫn sửa bằng biểu mẫu. Kéo thả và kích thước chỉ áp dụng cho landing page dựng bằng khối.
- **Thư viện**: chưa có thư mục, chưa quản lý video/tài liệu (chỉ ảnh). Không hiện trong menu cho tới khi làm.
- **Biểu mẫu**: là báo cáo các form có sẵn trên website; chưa có trình tạo form mới.
- Gói & giá chỉ hiện trên trang sản phẩm chuẩn và landing page; 4 trang sản phẩm thiết kế riêng (Studio, Website, Marketing, Sự kiện) giữ giao diện cũ.
- Nghiệp vụ mới (đặt phòng, thanh toán, kho hàng) cần module riêng — xem điểm mở rộng ở đầu `lib/product-types.ts`.

## 8. Giao diện admin (đợt làm đẹp 11/2026)

### Thư viện
- `radix-ui` — primitives mà shadcn/ui dựng lên (Dialog, DropdownMenu, Tooltip). Component viết theo cấu trúc shadcn trong `components/admin/kit.tsx`, tô bằng token DANAVA.
- `motion` — chuyển động phối hợp trạng thái: mở/đóng nhóm menu, tab có chỉ báo trượt, thanh lưu, thông báo, phần thu gọn.
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — kéo sắp xếp (chuột, cảm ứng giữ 180ms, bàn phím: Space nhấc, mũi tên di chuyển, Space thả, Esc hủy), có thông báo cho trình đọc màn hình.
- **Không thêm Tailwind**: shadcn/ui là mã chép vào dự án dựa trên Tailwind + CSS reset; website công khai dùng chung `globals.css`, thêm reset có rủi ro làm lệch giao diện công khai. Thay vào đó các component shadcn được viết lại bằng CSS có phạm vi (`app/admin/admin-ui.css`, lớp `.ax-scope`), chỉ nạp trong `app/admin/layout.tsx`. Đã kiểm tra: trang công khai không nạp CSS admin, bundle trang chủ không có radix/motion/dnd-kit.
- GSAP chỉ dùng ở website công khai (Hero, HomeMotion); admin không dùng GSAP → không có phần tử nào bị hai thư viện cùng điều khiển.

### Hệ thống thiết kế (`app/admin/admin-ui.css`)
- Token: sidebar navy sâu `#0c1838`, nền nội dung `#f4f6fa`, màu nhấn cam DANAVA `#f26b1d` dùng tiết chế (nút chính, mục đang chọn, focus), trạng thái success/warning/info/danger.
- Khoảng cách 4/8/12/16/24/32px; card bo 12px, viền mảnh, bóng nhẹ; một hệ chữ Be Vietnam Pro (dự án chưa có Manrope); icon Lucide.
- Trạng thái hover, focus (vòng cam 3px), active, disabled, loading (nút có spinner, skeleton), error (viền đỏ cho ô `aria-invalid`).
- Các lớp cũ trong nội dung (`admin-panel`, input, bảng, nút) được chuẩn hóa theo token → màn hình chưa viết lại vẫn thống nhất.

### Khung & component
- `AdminShell`: sidebar 256px / thu gọn 72px (lưu theo trình duyệt), nhóm hiện menu bay ra + tooltip khi thu gọn; drawer trên điện thoại (đóng khi chọn trang); topbar có breadcrumb, Tìm nhanh (Ctrl + K, điều khiển bằng phím), Tạo mới, Lưu nháp / Xuất bản theo ngữ cảnh, thông báo, tài khoản.
- `kit.tsx`: Button, Tip, ActionMenu, Modal, Sheet, ConfirmDialog (`useConfirm`, `ask`) thay mọi `window.confirm/alert`, TabBar, PageHeader, Card, FormSection (phần nâng cao thu gọn), StatusBadge, EmptyState / LoadingState / ErrorState, FilterBar, DataTable (thành thẻ trên màn < 720px), SortableList, useListIds.
- Màn chuẩn hóa: Tổng quan (chỉ số thật), Bài viết, Sản phẩm, Landing page, hồ sơ sản phẩm/landing/trang; Menu điều hướng, Ảnh doanh nghiệp, Đội ngũ, cây khối landing có kéo thả.
- Hộp thoại xóa: focus mặc định vào **Hủy**; Esc luôn đóng; focus quay về nút đã mở.
- Giảm chuyển động: Motion tự tắt (`MotionConfig reducedMotion="user"`), hiệu ứng CSS của Dialog/Menu/Tooltip **tắt hẳn** (hiệu ứng quá ngắn làm Radix kẹt phần tử khi đóng).

### Thứ tự lưu qua BE
- Kéo sắp xếp thay đổi bản đang soạn; lưu bằng Lưu nháp / Xuất bản như mọi nội dung (có kiểm tra xung đột). Lưu lỗi: thông báo lỗi, thay đổi vẫn giữ để thử lại hoặc Hoàn tác.
- Sản phẩm: trường `order` (website hiển thị theo thứ tự đã kéo; chưa kéo thì giữ thứ tự cũ).
- Menu, ảnh: thứ tự mảng trong khối; ID ổn định giữ phía giao diện (`useListIds`) để không thêm khóa lạ vào dữ liệu khối — bản build cũ vẫn đọc được.

### Đánh giá Puck và React Grid Layout
- **Puck** (trình dựng trang kéo thả): mô hình dữ liệu của Puck (`{ content: [{ type, props }] }`) gần với khối landing hiện có, nhưng trình chỉnh sửa hiện tại đã đủ chọn-để-sửa, thuộc tính, kéo thả, ẩn/nhân bản, xem trước 3 thiết bị, và dùng chung renderer với trang công khai. Chuyển sang Puck đáng cân nhắc khi cần: khối lồng nhau (cột trong cột), kéo thả trực tiếp trên khung xem trước, hoặc nhiều loại trang dựng bằng khối. Cách tích hợp đề xuất: map `BLOCKS` → `config.components` của Puck, giữ `validPageBlock()` làm bước kiểm tra ở máy chủ. **Chưa cài** trong đợt này.
- **React Grid Layout** (dashboard kéo/giãn ô): Tổng quan hiện có 4 chỉ số + 2 khối, chưa có nhu cầu tùy biến bố cục theo người dùng. Cài khi có yêu cầu thực tế (lưu bố cục theo tài khoản: thêm cột `dashboard_layout` cho bảng `users` qua migration mới). **Chưa cài**.

## 9. Chỉnh trực tiếp trên trang (11/2026)

Thay cho kiểu "biểu mẫu + khung xem trước" cũ (`PageVisualEditor`, đã gỡ). Đường đi: **Website → Trang → chọn trang → Chỉnh trực tiếp**.

**Cách dùng**
- Màn hình gần như toàn bộ là trang thật, hiển thị bằng đúng component công khai, dữ liệu là **bản nháp**.
- Hai chế độ: **Xem** (cuộn, xem bình thường) và **Chỉnh sửa** (hiện viền các phần sửa được).
- **Nhấn giữ ~550 ms** vào chữ, ảnh hoặc nút sẽ chuyển sang Chỉnh sửa và chọn đúng phần đó. Có rung nhẹ trên điện thoại.
  - Ở chế độ Chỉnh sửa, chỉ cần chạm hoặc bấm để chọn.
  - Người dùng bàn phím: bấm nút "Chỉnh sửa", dùng Tab để đi giữa các phần, Enter để chọn.
- **Chữ:** sửa ngay tại chỗ, giữ nguyên font, màu và bố cục.
  - Enter để xong (trường nhiều dòng thì Enter xuống dòng). Esc để hủy lần sửa đó.
  - Dán chỉ nhận chữ thuần. Tiêu đề cho phép nút **Nhấn mạnh**, lưu dạng `*chữ*`.
  - Hỗ trợ bộ gõ tiếng Việt: không ghi đè phần đang gõ.
- **Ảnh:** "Đổi ảnh" mở thư viện (ảnh đã tải lên và ảnh đang dùng trên trang), có thể tải ảnh mới. Có thêm "Mô tả & cắt" để sửa mô tả ảnh và vị trí giữ khi cắt.
- **Nút:** popover sửa chữ và đường dẫn, kiểm tra đường dẫn trước khi áp dụng. Khi đang chỉnh, bấm nút không điều hướng khỏi trang.
- **Khối:** có viền và tên khối. Thuộc tính `data-cms-block-id` là điểm mở rộng để thêm kéo/đổi kích thước sau này.
- Thanh trên có: Hoàn tác/Làm lại (Ctrl+Z, Ctrl+Shift+Z), Xem trước bản nháp (tab mới), Lưu nháp, Xuất bản, và trạng thái lưu (đang lưu, đã lưu nháp, chưa lưu, lỗi).

**Kỹ thuật**
- **Khóa dữ liệu ổn định.** Các thuộc tính `data-cms*` được tạo bởi `components/site/cms.ts` và ánh xạ sang dữ liệu qua `lib/cms-paths.ts`:
  - `hero.<trường>`
  - `pages.<trang>.<trường>`
  - `block.<khối>.<…>` (ví dụ `block.gallery.photos.2.image`).

  `writeCms` kiểm tra khóa (chặn cả `__proto__`), độ dài, đường dẫn (`okLink`), ảnh (`/assets/…`) và vị trí cắt.
- **Trình chỉnh trong trang** (`components/site/cms-editor.ts`):
  - Chỉ được tải bằng import động khi trang nằm trong admin cùng nguồn và có `?cms=1` (`CmsOverlay`). Khách truy cập không tải file này.
  - Giao diện nổi đặt trong shadow DOM.
  - Nhấn giữ bị hủy khi: di chuyển quá 8px, `pointercancel` hoặc thả tay, lăn chuột, hoặc phần đang nhấn bị cuộn đi.
  - Nếu máy bận (đang dựng 3D), trình chỉnh đợi tới khung hình kế tiếp rồi mới mở chế độ chỉnh. Vùng `data-cms-skip` (mô hình 3D) không nhận nhấn giữ.
- **Bản nháp trên trang thật.** `proxy.ts` gắn header `x-danava-cms` khi có `?cms=1` và xóa giá trị giả mạo gửi từ bên ngoài. `getSiteContent()` chỉ trả bản nháp khi có header này **và** phiên admin có quyền `content.read`. Các trường hợp còn lại luôn dùng bản đã xuất bản.
- **Lưu.** Màn admin (`components/admin/LiveEditor.tsx`) cập nhật bản nháp đang soạn rồi lưu qua đúng API cũ: kiểm tra quyền, kiểm tra hợp lệ toàn bộ nội dung, chống ghi đè (409), lịch sử phiên bản. Xuất bản sẽ `revalidatePath` như trước.
- **Vùng đã gắn khóa:**
  - Trang chủ: màn mở đầu (chữ và hai nút), khối Ảnh doanh nghiệp (chữ, từng ảnh, chú thích).
  - Đầu trang và dải cuối trang của các trang: Về DANAVA, Liên hệ, Hệ sinh thái, Blogs, Đối tác, Dự án, Giải pháp.
  - Các phần khác của trang vẫn sửa ở các tab biểu mẫu bên cạnh.
- **Test:** `tests/cms-paths.test.ts`.

## 10. Chỉnh sửa website — một lối vào (11/2026)

Nhóm Website trong menu còn **một mục: “Chỉnh sửa website”** (`/admin/chinh-sua/`). Bấm vào là mở thẳng trình biên tập: lần đầu Trang chủ, những lần sau mở trang chỉnh gần nhất (nếu còn tồn tại).

| Trước | Bây giờ |
|---|---|
| Website → Trang → chọn trang → Chỉnh trực tiếp | Bộ chọn trang trên thanh công cụ (tìm không dấu, lọc: Trang / Sản phẩm / Dịch vụ / Bài viết / Dự án / Landing page) |
| Các tab biểu mẫu của trang | Nút **Thiết lập trang** (ngăn bên phải; trang chi tiết → hồ sơ đầy đủ trong module) |
| Website → Menu điều hướng | Chọn đầu trang → **Sửa menu** (nhãn “Áp dụng toàn website”) |
| Website → Giao diện chung | Nút **Thiết lập website** (menu, liên hệ, widget ANNA, liên kết thông tin công ty) |
| Website → Landing page (cả liên kết ngoài) | Bộ chọn trang → “Quản lý landing page & liên kết ngoài”; trên trang /lp/… nút **Thêm khối** |
| Website → Mẫu & khối | Bộ chọn trang → “Mẫu & khối” |

- **Chế độ Xem**: bấm menu / liên kết nội bộ của website → trang mới mở trong trình biên tập, thanh công cụ nhận đúng trang (liên kết ngoài, admin, API không mở).
- **Nguồn dữ liệu**: tiêu đề/câu dẫn trang sản phẩm → hồ sơ sản phẩm (`rec.services.<id>.*`); tóm tắt + ảnh bìa bài viết → bài viết (`rec.posts.<id>.*`); tiêu đề/tóm tắt dự án → hồ sơ dự án; địa chỉ chân trang → thông tin công ty. Nhãn trên thanh công cụ: “Áp dụng toàn website” / “Hồ sơ …”.
- **Chưa lưu**: đổi trang hoặc thoát → hỏi *Lưu nháp rồi chuyển / Chuyển, giữ thay đổi / Ở lại*. Đi theo liên kết trong trang vẫn giữ thay đổi trong phiên.
- **Đường dẫn cũ** (`/admin/trang/?page=…&tab=…`, `/admin/landing-page/…`, `/admin/menu/`, `/admin/giao-dien/`, `/admin/mau-khoi/`, các mục cũ hơn như `/admin/trang-chu/`, `/admin/anna/`) chuyển tới đúng trang / ngăn trong trình biên tập.
- **Chưa có**: chỉnh font, màu, chiều rộng chung (cố định theo bộ nhận diện trong mã nguồn); sửa thân bài viết và tiêu đề bài viết ngay trên trang (sửa trong hồ sơ bài viết); kéo/đổi kích thước khối trên trang có sẵn (landing page nội bộ đã có trình dựng khối riêng).
