# Bàn giao vận hành — danava.com.vn

Tài liệu dành cho chủ website và người tiếp quản kỹ thuật. Mô tả trạng thái đang chạy tại thời điểm bàn giao (18/11/2026), cách cập nhật, sao lưu và xử lý sự cố.

> Tài liệu **không** chứa mật khẩu. Mật khẩu admin và MySQL được giao riêng; giá trị thật chỉ nằm trong biến môi trường của cPanel.

---

## 1. Hệ thống đang chạy

| Thành phần | Hiện trạng |
|---|---|
| Website | Next.js 16.4.6, chạy dạng Node.js app (Passenger) trên cPanel |
| Tên miền | `https://danava.com.vn` → thư mục `~/danava.com.vn` |
| Node.js | 22 (môi trường `~/nodevenv/danava.com.vn/22`) |
| Database | MySQL/MariaDB `khoaluan_danava`, user `khoaluan_danava` |
| Ảnh upload từ admin | `/home/khoaluan/danava-data/media` |
| Mã nguồn | GitHub `HungNguyen3205/DANAVA.COM.VN`, nhánh `main` |
| Bản build chạy trên server | Nhánh `deploy` (do GitHub Actions tự tạo) |
| Trang quản trị | `https://danava.com.vn/admin/` (chỉ cần mật khẩu) |

WordPress cũ đã gỡ hoàn toàn. Website mới không đọc/ghi bất kỳ dữ liệu WordPress nào. Bản sao lưu WordPress cuối cùng là file `khoaluan_danava.sql` (lưu ngoài server).

### Nội dung đã chuyển từ web cũ
- 30 bài blog (mục **Bản tin** `/kien-thuc/`), giữ nguyên đường dẫn bài, ngày đăng, chuyên mục, tiêu đề mục và danh sách.
- 133 ảnh bài viết, tự lưu trong `public/assets/blog/` (WebP). Một ảnh trong bài *“Giá đất nền ở đâu tăng mạnh nhất?”* không còn trên nguồn gốc nên không khôi phục được.
- Các URL cũ của WordPress tự chuyển hướng (301/308) sang URL mới — xem `lib/legacy-redirects.ts`.

---

## 2. Vì sao không build trên server

Server cPanel dùng thư viện hệ thống cũ (glibc < 2.29) nên **không chạy được trình biên dịch của Next.js**. Vì vậy:

```
Đẩy code lên main ──► GitHub Actions: test + build trên Linux ──► nhánh deploy ──► server kéo về và chạy
```

Workflow: `.github/workflows/deploy.yml`. Nếu test lỗi, bản build **không** được đẩy lên — website đang chạy không bị ảnh hưởng.

---

## 3. Cập nhật website

1. Sửa code, chạy kiểm tra trên máy: `npm run check && npm test`.
2. Commit và `git push origin main`.
3. Chờ GitHub Actions xong (3–5 phút): tab **Actions** trên GitHub phải có dấu ✔ xanh.
4. Trên terminal cPanel:

```bash
cd ~/danava.com.vn && git fetch origin deploy && git reset --hard origin/deploy && mkdir -p ~/danava-data tmp && touch tmp/restart.txt && cat BUILD.txt && echo "=== XONG ==="
```

`BUILD.txt` in ra mã commit vừa được triển khai.

**Quay lại bản trước** nếu bản mới lỗi: nhánh `deploy` bị ghi đè mỗi lần build nên GitHub chỉ giữ bản mới nhất, nhưng server vẫn nhớ các bản đã từng triển khai:

```bash
cd ~/danava.com.vn && git reflog -10
# chọn mã của bản cũ (ví dụ f8a77a8) rồi:
git reset --hard f8a77a8 && touch tmp/restart.txt
```

---

## 4. Quản lý nội dung (không cần code)

Đăng nhập `https://danava.com.vn/admin/`:
- **Bài viết / Bản tin**: thêm, sửa, ẩn bài. Nội dung bài hỗ trợ:
  - `## Tiêu đề mục` và `### Tiêu đề phụ` (tự tạo mục lục),
  - dòng bắt đầu bằng `- ` thành danh sách,
  - `![mô tả ảnh](/assets/uploads/ten-anh.webp)` để chèn ảnh (các ảnh liền nhau tự xếp thành lưới).
- **Ảnh**: upload trong admin, lưu ở `danava-data/media`, dùng qua đường dẫn `/assets/uploads/...`.
- **Khách hàng liên hệ**: danh sách form liên hệ, phân công và ghi chú.
- **Thống kê**: lượt xem, nguồn truy cập (không lưu IP).

Nội dung chỉnh trong admin được lưu vào MySQL (bảng `content`) và **không** bị ghi đè khi cập nhật code.

---

## 5. Biến môi trường (cPanel → Setup Node.js App)

| Biến | Giá trị / ý nghĩa |
|---|---|
| `SITE_URL` | `https://danava.com.vn` |
| `DANAVA_DATA_DIR` | `/home/khoaluan/danava-data` — nơi lưu ảnh upload |
| `DANAVA_DB_HOST` | `localhost` |
| `DANAVA_DB_NAME` | `khoaluan_danava` |
| `DANAVA_DB_USER` | `khoaluan_danava` |
| `DANAVA_DB_PASSWORD` | mật khẩu MySQL (giao riêng) |
| `DANAVA_ADMIN_PASSWORD_HASH` | mã băm mật khẩu admin (không phải mật khẩu) |

Sau khi sửa biến: bấm **SAVE** rồi **RESTART**.

**Đổi mật khẩu admin**: trên máy có mã nguồn, chạy `npm run admin:password`, gõ mật khẩu mới (≥ 12 ký tự), bấm Enter rồi bấm `Ctrl+D` (Windows: `Ctrl+Z` rồi Enter). Chép chuỗi in ra vào `DANAVA_ADMIN_PASSWORD_HASH`, rồi RESTART.

**Đổi mật khẩu MySQL**: cPanel → *MySQL Databases* → *Current Users* → `khoaluan_danava` → *Change Password*; sau đó cập nhật `DANAVA_DB_PASSWORD` và RESTART.

---

## 6. Database

Website tự tạo 5 bảng khi chạy lần đầu, và tự nhập nội dung mặc định nếu bảng `content` trống:

| Bảng | Nội dung |
|---|---|
| `content` | Toàn bộ nội dung web (bài viết, dự án, dịch vụ, đội ngũ…) dạng JSON, có số revision |
| `leads` | Form liên hệ của khách hàng |
| `sessions`, `attempts` | Phiên đăng nhập admin, giới hạn số lần đăng nhập sai |
| `visits` | Thống kê truy cập (tự xóa sau 90 ngày) |

Chạy trên máy cá nhân không cần MySQL: bỏ trống `DANAVA_DB_HOST` thì web dùng SQLite trong thư mục `.data/`.

---

## 7. Sao lưu

Cần sao lưu định kỳ **hai** thứ:
1. **Database `khoaluan_danava`** — cPanel → *Backup* → *Download a MySQL Database Backup*, hoặc phpMyAdmin → *Export*.
2. **Thư mục `/home/khoaluan/danava-data`** — ảnh upload từ admin (cPanel → *File Manager* → nén và tải về).

Mã nguồn đã nằm trên GitHub nên không cần sao lưu riêng.

---

## 8. Xử lý sự cố

Xem log lỗi của website:

```bash
tail -50 ~/danava.com.vn/stderr.log
```

| Triệu chứng / lỗi trong log | Nguyên nhân | Cách xử lý |
|---|---|---|
| Trang báo lỗi 500, log có `ER_DBACCESS_DENIED_ERROR` (1044) | User MySQL chưa được gán quyền vào database, hoặc database đã bị xóa | cPanel → *MySQL Databases* → *Add User To Database* → ALL PRIVILEGES; rồi RESTART |
| Log có `ER_ACCESS_DENIED_ERROR` (1045) | Sai mật khẩu MySQL | Sửa `DANAVA_DB_PASSWORD`, RESTART |
| Không đăng nhập được admin, báo *chưa cấu hình* | Thiếu `DANAVA_ADMIN_PASSWORD_HASH` | Thêm biến (mục 5), RESTART |
| Đăng nhập sai quá 10 lần | Bị khóa 15 phút | Chờ 15 phút |
| Web không đổi sau khi cập nhật | Chưa khởi động lại | `touch ~/danava.com.vn/tmp/restart.txt` hoặc bấm RESTART |
| GitHub Actions báo ✖ | Test hoặc build lỗi; bản cũ vẫn chạy | Mở tab Actions xem bước lỗi, sửa rồi push lại |
| `git fetch origin deploy` báo *couldn't find remote ref* | Chưa có bản build thành công nào | Kiểm tra GitHub Actions |

### Điểm cần lưu ý
- **Upload ảnh trong admin chưa được kiểm thử trên server.** Thư viện xử lý ảnh (`sharp`) có thể không chạy trên hệ điều hành cũ của hosting. Nếu upload báo *Không thể xử lý ảnh*, kiểm tra `stderr.log`; toàn bộ phần còn lại của web không bị ảnh hưởng.
- Không chạy `npm install` / `npm run build` trên server — sẽ lỗi do glibc (xem mục 2).
- Không xóa phần `# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION` trong `~/danava.com.vn/.htaccess`.

---

## 9. Phát triển trên máy cá nhân

```bash
npm install
npm run dev        # http://localhost:3000, dữ liệu SQLite trong .data/
npm run check      # kiểm tra kiểu TypeScript
npm test           # 62 bài test
```

Các file chính:
- `lib/database.ts` — lớp lưu trữ MySQL/SQLite.
- `lib/legacy-catalog.ts` — 30 bài blog nhập từ WordPress.
- `components/site/ArticleView.tsx` — hiển thị bài viết.
- `scripts/sync-blog.mjs` — đồng bộ lại bài blog từ code vào database (chỉ cập nhật bài chưa bị sửa trong admin).
