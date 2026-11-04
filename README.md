# DANAVA Solutions — Sổ Tay Kỹ Thuật & Hướng Dẫn Phát Triển (Master Onboarding Guide)

> **Dành cho lập trình viên mới tiếp nhận dự án**: Tài liệu này cung cấp bức tranh toàn cảnh về kiến trúc, triết lý thương hiệu, **hệ thống bản màu (Design Tokens)**, quy tắc kiểm soát chất lượng nội dung và các hướng dẫn mở rộng sáng tạo mà không làm lệch hướng định vị của DANAVA Solutions.

---

## 📑 Mục Lục
1. [Tổng Quan Dự Án & Tầm Nhìn DANAVA](#1-tổng-quan-dự-án--tầm-nhìn-danava)
2. [Bản Màu & Hệ Thống Nhận Diện Thương Hiệu (Design System)](#2-bản-màu--hệ-thống-nhận-diện-thương-hiệu-design-system)
3. [Nguyên Tắc "Không Lạc Đề" (Anti-drift Guardrails)](#3-nguyên-tắc-không-lạc-đề-anti-drift-guardrails)
4. [Không Gian Sáng Tạo Cho Lập Trình Viên (Creative Horizons)](#4-không-gian-sáng-tạo-cho-lập-trình-viên-creative-horizons)
5. [Nguồn Gốc Dữ Liệu & Cách Lấy / Xác Minh Thông Tin](#5-nguồn-gốc-dữ-liệu--cách-lấy--xác-minh-thông-tin)
6. [Kiến Trúc Kỹ Thuật & Cấu Trúc Mã Nguồn](#6-kiến-trúc-kỹ-thuật--cấu-trúc-mã-nguồn)
7. [Hệ Thống CMS Tự Quản Trị & Cơ Sở Dữ Liệu SQLite](#7-hệ-thống-cms-tự-quản-trị--cơ-sở-dữ-liệu-sqlite)
8. [Hướng Dẫn Cài Đặt, Phát Triển & Kiểm Thử](#8-hướng-dẫn-cài-đặt-phát-triển--kiểm-thử)
9. [Hướng Dẫn Triển Khai Production (cPanel / Standalone Node.js)](#9-hướng-dẫn-triển-khai-production-cpanel--standalone-nodejs)
10. [Quy Chuẩn Đóng Góp & Git Workflow](#10-quy-chuẩn-đóng-góp--git-workflow)

---

## 1. Tổng Quan Dự Án & Tầm Nhìn DANAVA

DANAVA Solutions không chỉ là một trang web giới thiệu công ty thông thường, mà là một **nền tảng kết nối số (Digital Hub)** dung hợp giữa **Công nghệ (Technology)**, **Truyền thông (Media)**, **Con người (People)** và **Trải nghiệm chăm sóc sức khỏe & cộng đồng (Wellness & Experience)**.

- **Sứ mệnh thương hiệu**: *“Nâng tầm thương hiệu doanh nghiệp bằng chiến lược truyền thông đột phá và giải pháp công nghệ thực chiến.”*
- **Triết lý sản phẩm**: *“Cùng bạn phát triển — Công nghệ tạo khả năng, Con người tạo giá trị.”*
- **Hệ sinh thái cốt lõi gồm 6 mảng**:
  1. **DANAVA Studio**: Nền tảng phần mềm quản trị chuyên sâu cho Gym, Yoga, Pilates, Bể bơi và Spa (hội viên, gói tập, lịch lớp, QR check-in, báo cáo, app thương hiệu riêng).
  2. **DANAVA DIGITAL**: Dịch vụ tiếp thị tổng thể, thiết kế website/landing page, chiến dịch quảng cáo và quản trị thương hiệu.
  3. **DANAVA E-learning**: Giải pháp đào tạo trực tuyến, số hóa bài giảng và nền tảng học tập số.
  4. **DANAVA PMS**: Hệ thống quản lý cơ sở lưu trú, khách sạn và căn hộ cho thuê.
  5. **DANAVA MEDIA**: Sản xuất nội dung hình ảnh, video, tổ chức sự kiện, workshop và team building.
  6. **DANAVA Go**: Du lịch trải nghiệm, tour retreat yoga và dịch vụ lữ hành số.

---

## 2. Bản Màu & Hệ Thống Nhận Diện Thương Hiệu (Design System)

Bất kỳ coder nào khi tham gia phát triển đều **phải tuân thủ nghiêm ngặt hệ thống thiết kế** này để giữ trọn vẹn "hơi thở" sang trọng, hiện đại và sâu lắng của DANAVA.

### 2.1 Bảng Màu Nhận Diện Chuẩn (Brand Color Palette)

Toàn bộ màu sắc được định nghĩa dưới dạng CSS Variables tại [`app/globals.css`](file:///app/globals.css):

```css
:root {
  --blue: #2b4294;     /* DANAVA Deep Blue — Màu xanh đại dương chủ đạo */
  --amber: #f5ae1b;    /* Sunlit Amber — Màu vàng hổ phách hành động & năng lượng */
  --sky: #53a5db;      /* Sky Cyan — Màu xanh trời công nghệ & tương lai */
  --red: #ee3132;      /* DANAVA Crimson — Màu đỏ điểm xuyết của logo */
  --ink: #152449;      /* Deep Ink — Màu chữ than sẫm sang trọng (thay vì #000) */
  --paper: #f8f9fd;    /* Silk Paper — Màu nền sáng thanh nhã (thay vì trắng tinh) */
  --progress: 0;       /* Biến tiến trình phục vụ animation scroll */
}
```

| Tên biến CSS | Mã màu HEX | Vai trò & Ý nghĩa | Hướng dẫn ứng dụng |
|---|---|---|---|
| `--blue` | `#2B4294` | **Màu chủ đạo (Primary Brand)**: Thể hiện sự uy tín, chiều sâu công nghệ, bền vững và tin cậy. | Dùng cho header, các mảng nền cinematic tối, tiêu đề nhấn mạnh (`em`), icon nổi bật, button phụ. |
| `--amber` | `#F5AE1B` | **Màu nhấn hành động (Accent / Energy)**: Tượng trưng cho bình minh, năng lượng yoga/wellness, sự thấu cảm và phát triển. | Dùng cho các nút Call To Action chính (`.button.amber`), thanh tiến trình, dot chỉ thị trạng thái, gạch chân hover. |
| `--sky` | `#53A5DB` | **Màu bổ trợ công nghệ (Light Tech)**: Đại diện cho tính thông minh, kết nối đám mây, phần mềm SaaS. | Dùng cho biểu đồ, border highlight, thẻ trạng thái giải pháp DANAVA Studio, orb ánh sáng nền. |
| `--red` | `#EE3132` | **Màu linh hồn logo (Logo Accent)**: Điểm nhấn trong biểu tượng khối ngũ giác / chữ D của logo DANAVA. | Chỉ dùng tiết chế trong logo hoặc các tín hiệu cảnh báo/thông báo cực kỳ đặc biệt. Không lạm dụng làm nền trang. |
| `--ink` | `#152449` | **Màu chữ chính (Body & Headers)**: Sắc xanh thẫm ngả đen, mềm mại hơn màu đen thuần túy. | Toàn bộ font text đọc nội dung, tiêu đề trên nền giấy sáng. |
| `--paper` | `#F8F9FD` | **Màu nền trang (Surface Base)**: Sắc trắng giấy lụa ngà dịu mắt. | Nền chính của website ở các section ban ngày, thẻ bài viết, thẻ giải pháp. |

### 2.2 Nghệ Thuật Phông Chữ (Typography Pairing)

Dự án áp dụng phong cách **Editorial Tech** — kết hợp tương phản hài hòa giữa chất công nghệ chuẩn xác và chất tạp chí nghệ thuật:

1. **`Manrope` (Sans-serif - Cục bộ WOFF)**:
   - Dùng cho: Toàn bộ nội dung đọc (`body`), nhãn danh mục, menu điều hướng, nút bấm, bảng số liệu và giao diện CMS `/admin/`.
   - Trọng lượng font (Weights): 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
2. **`Noto Serif` (Serif - Cục bộ WOFF)**:
   - Dùng cho: Các tiêu đề lớn mang tính triết lý (`h1`, `h2`), tiêu đề câu chuyện, các trích dẫn danh ngôn (`blockquote`), chữ ký người đại diện.
   - Phong cách: 500 Normal, 500 Italic, 600 Normal.
3. **Quy tắc phông chữ**:
   - Tất cả font được lưu trữ nội bộ tại `public/fonts/` và được preload trong `app/layout.tsx`.
   - **Tuyệt đối không nhúng link Google Fonts trực tiếp qua CDN bên ngoài** để tránh chặn render, rò rỉ IP người dùng và phụ thuộc đường truyền quốc tế.

### 2.3 Ngôn Ngữ Thị Giác & Chuyển Động (Visual & Motion Language)

- **Cinematic 2.5D Scroll (Hero Stage)**: Sử dụng GSAP kết hợp sticky canvas 5 cảnh để kể câu chuyện từ sứ mệnh $\rightarrow$ giải pháp $\rightarrow$ người đại diện $\rightarrow$ hệ sinh thái $\rightarrow$ kết nối. Không dùng 3D Three.js nặng nề mà dùng kỹ thuật phối cảnh 2.5D (perspective, transform, parallax lớp ảnh và ánh sáng).
- **Glassmorphism Tinh Tế**: Header và các thẻ nổi dùng nền mờ `background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(18px); border: 1px solid #fff9;`.
- **Card Styling**: Bo góc tiêu chuẩn `10px - 16px`, viền mảnh `1px solid #e0e6f1`, đổ bóng đa tầng nhẹ `box-shadow: 0 8px 40px #07173514`. Khi hover trượt nhẹ lên `-4px` đến `-6px`.
- **Hỗ trợ tiếp cận (Accessibility)**: Toàn bộ hiệu ứng tự động tắt khi người dùng bật `prefers-reduced-motion: reduce`. Luôn duy trì phím `Tab` tuần tự và `skip-link` ở đầu trang.

---

## 3. Nguyên Tắc "Không Lạc Đề" (Anti-drift Guardrails)

Để dự án duy trì được độ tin cậy và sự tôn trọng của đối tác doanh nghiệp, lập trình viên mới **phải ghi nhớ 5 điều cấm kỵ**:

1. ❌ **Không tự bịa đặt số liệu doanh nghiệp**:
   - Không tự động chèn các counter ảo (như "1,000+ khách hàng", "50 tỷ doanh thu", v.v.) vào trang web nếu chưa có chứng thực từ ban lãnh đạo.
   - Dữ liệu số liệu kinh doanh trên website được điều khiển bật/tắt trong CMS `/admin/thong-ke/` hoặc `/admin/`.
2. ❌ **Không lấy case study hoặc số liệu của đơn vị khác gán cho DANAVA**:
   - Dự án đã loại trừ hoàn toàn việc mượn số liệu hay khách hàng của các bên khác (ví dụ: SEODO). Chỉ sử dụng những hồ sơ triển khai thực tế có nguồn gốc kiểm chứng từ nền tảng `danava.vn`.
3. ❌ **Không dùng ảnh AI tạo hình khuôn mặt người giả cho nhân sự**:
   - Đội ngũ DANAVA và Founder Lê Tấn Thành phải dùng ảnh thật đã được tối ưu tại `public/assets/legacy/` hoặc `DANAVA_DATA_DIR/media/`. Nếu thiếu ảnh, sử dụng khung đại diện chữ cái (Initials placeholder) đúng phong cách thiết kế, không dùng avatar hoạt hình hoặc chân dung AI ảo.
4. ❌ **Không phá vỡ bản màu thương hiệu**:
   - Tuyệt đối không tự ý thêm các màu chói chang lệch tone (như tím dạ quang, xanh chuối neon, hồng cánh sen). Mọi màu mở rộng phải nằm trong gam màu bổ trợ của Deep Blue, Amber, Sky Cyan và Neutral Paper.
5. ❌ **Không làm gãy luồng Server-Side Rendering (SSR) và SEO**:
   - Các trang bài viết (`/kien-thuc/[slug]`) và dự án (`/du-an/[slug]`) phải render nội dung hoàn chỉnh từ server để Googlebot có thể đọc trọn vẹn văn bản và JSON-LD Schema mà không phụ thuộc vào việc thực thi Client JavaScript.

---

## 4. Không Gian Sáng Tạo Cho Lập Trình Viên (Creative Horizons)

Tuân thủ quy chuẩn không có nghĩa là hạn chế sáng tạo. Ngược lại, lập trình viên có thể thỏa sức bứt phá trong các không gian sau:

### 4.1 Nâng Cấp Tương Tác & Vi Chuyển Động (Micro-interactions)
- **Hiệu ứng cuộn Parallax**: Tinh chỉnh các tham số di chuyển trong `components/HomeMotion.tsx` và `components/Hero.tsx` để tạo cảm giác lớp ảnh trôi êm ái hơn khi cuộn.
- **Magnetic Buttons & Hover Glow**: Thêm hiệu ứng hút nhẹ con trỏ chuột cho các nút bấm lớn (`.button.amber`) hoặc hiệu ứng quầng sáng chạy quanh viền thẻ giải pháp khi di chuột.
- **Biểu diễn dữ liệu tương tác**: Thiết kế các biểu đồ SVG động nhỏ minh họa luồng hoạt động của phòng tập gym/yoga (ví dụ: lượng check-in theo giờ trong ngày).

### 4.2 Phát Triển Tính Năng Cho Hệ Sinh Thái 6 Mảng
Mở rộng các trang đích chi tiết và công cụ trải nghiệm cho từng nhánh sản phẩm:
- **DANAVA Studio Interactive Demo**: Tạo một widget tương tác trên trang cho phép chủ phòng gym nhập thử "Số lượng hội viên hiện tại" $\rightarrow$ hệ thống ước tính thời gian tiết kiệm được và đề xuất các tính năng quản lý phù hợp.
- **App Mockup Switcher**: Cho phép khách xem trước diện mạo ứng dụng hội viên theo màu sắc thương hiệu của riêng họ (ví dụ: đổi logo và màu chủ đạo giả lập trên khung điện thoại).
- **DANAVA PMS & Go**: Xây dựng luồng trải nghiệm tìm kiếm tour yoga retreat hoặc tra cứu phòng nghỉ mẫu với giao diện editorial sang trọng.

### 4.3 Trải Nghiệm Đọc Kiến Thức (Editorial Reader Experience)
- Tự động tạo **Mục lục bài viết (Table of Contents - TOC)** bám theo màn hình khi đọc bài dài.
- Tính toán **Thời gian đọc ước tính (Reading Time)** dựa trên số lượng từ.
- Thanh tiến trình đọc bài (Reading Progress Bar) chạy trên đỉnh màn hình bài viết.

---

## 5. Nguồn Gốc Dữ Liệu & Cách Lấy / Xác Minh Thông Tin

Khi cần thêm nội dung, bài viết, hình ảnh hoặc bổ sung hồ sơ dự án, coder cần đối chiếu theo đúng luồng sau:

### 5.1 Các Kênh Thông Tin Chính Thức (Ground Truth)
- **Website nền tảng vận hành hiện tại**: [`https://danava.vn/`](https://danava.vn/)
  - Tham khảo các khóa học: `https://danava.vn/courses`
  - Thông tin liên hệ chuẩn: Địa chỉ `08 Đặng Vũ Hỷ, An Hải, Đà Nẵng`, Email: `hello@danava.vn`, Hotline: `0935917677`.
- **Website thương hiệu và kho lưu trữ cũ**: [`https://danava.com.vn/`](https://danava.com.vn/)
  - Nguồn của 30 bài viết lịch sử về marketing, yoga, kinh doanh và sự kiện cộng đồng.

### 5.2 Các Hồ Sơ Triển Khai Thực Tế Đã Xác Minh (Verified Case Studies)
Được cấu hình sẵn tại [`lib/verified-projects.ts`](file:///lib/verified-projects.ts):
1. **HARIVER Gym & Fitness Center**:
   - Nguồn: `https://danava.vn/blog/case-hariver-gym-fitness-center`
   - Bản chất: Triển khai phần mềm DANAVA Studio quản lý quầy, hội viên, gói tập và ứng dụng hội viên riêng mang tên thương hiệu HARIVER (`hariver.danava.vn`).
2. **Huế Pilates & Yoga**:
   - Nguồn: `https://danava.vn/blog/case-hue-pilates-yoga`
   - Bản chất: Vận hành lịch lớp có giới hạn chỗ, quản lý gói tập và đặt chỗ trên ứng dụng studio (`hue.danava.vn`).

### 5.3 Bảng Đối Chiếu Tư Liệu & Ảnh Trong Codebase
- [`docs/content-sources.md`](file:///docs/content-sources.md): Bảng đối chiếu nguồn gốc toàn bộ 30 bài viết chuyển đổi từ WordPress cũ.
- [`public/assets/legacy/sources.json`](file:///public/assets/legacy/sources.json): Bảng ánh xạ URL gốc của các ảnh nhân sự và dịch vụ truyền thống sang file WebP nội bộ.
- [`public/assets/verified/sources.json`](file:///public/assets/verified/sources.json): Bảng ánh xạ URL gốc của các ảnh case study và sự kiện yoga đã kiểm chứng.
- [`lib/legacy-redirects.ts`](file:///lib/legacy-redirects.ts): Bảng ánh xạ 40 đường dẫn chuyển hướng 301 vĩnh viễn từ cấu trúc URL cũ sang cấu trúc URL mới của Next.js để không bị rớt thứ hạng SEO.

---

## 6. Kiến Trúc Kỹ Thuật & Cấu Trúc Mã Nguồn

```
DANAVA.COM.VN/
├── app/                              # Next.js 16 App Router
│   ├── layout.tsx                    # Root layout: nạp font, SEO schema Org, SiteStore, Shell
│   ├── page.tsx                      # Trang chủ (kết hợp Hero 2.5D và các HomeSections)
│   ├── globals.css                   # Toàn bộ CSS tokens, utilities, responsive, animations
│   ├── robots.ts & sitemap.ts        # Tự động sinh sitemap động từ Database
│   ├── ve-danava/                    # Trang Giới thiệu & Đội ngũ nhân sự
│   ├── giai-phap/                    # Danh mục và 5 trang chi tiết giải pháp doanh nghiệp
│   ├── du-an/                        # Danh mục và trang chi tiết case study động
│   ├── kien-thuc/                    # Kho bài viết kiến thức và chi tiết bài viết động
│   ├── lien-he/                      # Trang liên hệ, bản đồ và form trao đổi
│   ├── chinh-sach-rieng-tu/          # Chính sách bảo mật & đo lường
│   ├── admin/                        # Giao diện CMS Quản trị viên (Dashboard, Bài viết, Dự án...)
│   └── api/                          # Next.js API Routes (Auth, Content, Media upload, Tracking)
├── components/                       # React 19 Client & Server Components
│   ├── Hero.tsx                      # Hành trình cuộn 5 cảnh (GSAP Timeline)
│   ├── HomeSections.tsx              # Các khối nội dung kể chuyện trang chủ
│   ├── Ecosystem.tsx                 # Khối tương tác 6 mảng hệ sinh thái dạng tab
│   ├── PublicPages.tsx               # Khung hiển thị các trang con công khai
│   ├── Shell.tsx                     # Header chuyển kính mờ & Footer
│   ├── SiteStore.tsx                 # React Context chia sẻ trạng thái dữ liệu công khai
│   ├── Admin.tsx & AdminGate.tsx     # CMS editor, quản lý dữ liệu, revision check
│   ├── Analytics.tsx                 # Module đo lường bảo vệ quyền riêng tư người dùng
│   └── MediaPicker.tsx               # Thư viện chọn & tải ảnh an toàn WebP
├── lib/                              # Thư viện tiện ích, Data Models & Business Logic
│   ├── auth.ts                       # Xác thực mật khẩu PBKDF2/SHA-256, Cookie HttpOnly
│   ├── database.ts                   # Quản lý SQLite (WAL mode, lưu trữ bền vững)
│   ├── content.ts                    # Schemas, Types và bộ xác thực validateContent()
│   ├── company.ts                    # Dữ liệu pháp nhân, sứ mệnh, năng lực doanh nghiệp
│   ├── journey.ts                    # Thuật toán tính toán trọng số khung hình 5 cảnh
│   ├── media.ts & media-storage.ts   # Xử lý và lưu trữ file ảnh an toàn qua Sharp
│   ├── presentation.ts               # Cấu hình mặc định cho trình chiếu hệ sinh thái
│   ├── verified-projects.ts          # Dữ liệu 2 case study gốc đã đối chiếu
│   ├── legacy-catalog.ts             # Dữ liệu 30 bài viết gốc WordPress
│   └── legacy-redirects.ts           # 40 quy tắc 301 Redirects bảo toàn SEO
├── docs/                             # Tài liệu đối chiếu nội dung & ảnh chụp kiểm tra
├── public/                           # Tài nguyên tĩnh công khai (Fonts, Icons, Assets cố định)
├── scripts/                          # Các tiện ích vận hành (Tạo password hash, build standalone...)
├── tests/                            # Bộ kiểm thử tự động (Content validation, Journey frames)
├── next.config.ts                    # Cấu hình Next standalone, redirect, image unoptimized
├── server.cjs                        # File khởi động ứng dụng trên hosting cPanel Node.js
└── package.json                      # Scripts và thông tin phụ thuộc gói
```

---

## 7. Hệ Thống CMS Tự Quản Trị & Cơ Sở Dữ Liệu SQLite

Hệ thống sở hữu trang quản trị hoàn chỉnh tại `/admin/` với cơ chế vận hành độc lập, không phụ thuộc vào dịch vụ bên thứ ba:

### 7.1 Cơ Chế Bảo Mật
- **Không dùng tài khoản mặc định**: Quyền admin chỉ kích hoạt khi máy chủ được cung cấp biến môi trường `DANAVA_ADMIN_PASSWORD_HASH`.
- **Phiên làm việc an toàn**: Cookie quản trị được thiết lập `HttpOnly`, `SameSite=Strict`, `Secure` (trên HTTPS), thời hạn 8 giờ.
- **Bảo vệ chống ghi đè (Optimistic Revision Locking)**: Mỗi lần cập nhật nội dung sẽ so khớp mã `revision`. Nếu có người khác đã lưu bản mới hơn, hệ thống sẽ cảnh báo xung đột thay vì vô tình ghi đè.
- **Upload ảnh bảo mật**:
  - Hỗ trợ PNG, JPG, WebP tối đa 6 MB và 16 triệu pixels.
  - Thư viện Sharp tự động giải mã, loại bỏ toàn bộ EXIF/metadata nhạy cảm, co kích thước cạnh dài tối đa 2400px và nén thành chuẩn WebP tĩnh.
  - Lưu trữ tại thư mục cách ly `DANAVA_DATA_DIR/media/` và phục vụ qua URL an toàn `/assets/uploads/<uuid>.webp`.

### 7.2 Thống Kê Tôn Trọng Quyền Riêng Tư (`/admin/thong-ke/`)
- Không thu thập IP, không đọc vị trí cá nhân, tôn trọng tín hiệu `Do Not Track`.
- Sử dụng mã băm ẩn danh ngẫu nhiên (Session ID & Visitor Hash) được tự động dọn sạch sau 90 ngày.
- Bỏ qua toàn bộ lượt truy cập của Admin đang đăng nhập.

---

## 8. Hướng Dẫn Cài Đặt, Phát Triển & Kiểm Thử

### Yêu cầu môi trường
- **Node.js 24+** (bắt buộc để tương thích với engine kiểm thử `--experimental-strip-types` và SQLite native).
- **npm** phiên bản đi kèm Node 24.

### Các lệnh thực thi cơ bản

```sh
# 1. Cài đặt các gói phụ thuộc sạch theo package-lock
npm ci

# 2. Kiểm tra lỗi kiểu dữ liệu TypeScript (không phát sinh mã)
npm run check

# 3. Chạy toàn bộ 12 ca kiểm thử đơn vị tự động
npm test

# 4. Chạy môi trường phát triển Next.js với Hot Module Replacement
npm run dev:next

# 5. Đóng gói ứng dụng cho môi trường Production & chuẩn bị standalone
npm run build

# 6. Chạy bộ kiểm thử tích hợp (xác thực SSR, đăng nhập, bảo mật dữ liệu)
npm run test:integration

# 7. Khởi động máy chủ chạy thử bản build hoàn thiện
npm start
```

### Tạo mã băm mật khẩu Quản trị viên (Admin Password Hash)
Để đăng nhập vào `/admin/`, chạy lệnh sau trên terminal nội bộ và dán chuỗi hash sinh ra vào file môi trường:

```sh
node scripts/admin-password.mjs
# Nhập mật khẩu quản trị mong muốn (tối thiểu 12 ký tự)
```

---

## 9. Hướng Dẫn Triển Khai Production (cPanel / Standalone Node.js)

Dự án được đóng gói dưới dạng **Node.js Standalone Application** (không phải là bản export HTML tĩnh thuần túy).

### 9.1 Các Biến Môi Trường Cần Thiết
Tạo file `.env` (hoặc cấu hình trực tiếp trong giao diện cPanel "Setup Node.js App"):

```env
# 1. Tên miền chính thức của website (bắt buộc có https:// và không có dấu gạch chéo cuối)
SITE_URL=https://danava.com.vn

# 2. Đường dẫn tuyệt đối tới thư mục lưu trữ dữ liệu bền vững (ngoài thư mục git/build)
DANAVA_DATA_DIR=/home/username/danava_storage

# 3. Mã băm mật khẩu quản trị được tạo từ scripts/admin-password.mjs
DANAVA_ADMIN_PASSWORD_HASH=pbkdf2_sha256$...

# 4. Cổng lắng nghe máy chủ (cPanel tự cấp qua process.env.PORT)
PORT=3000

# 5. Địa chỉ IP lắng nghe (mặc định 0.0.0.0)
DANAVA_HOSTNAME=0.0.0.0
```

### 9.2 Cấu Hình Trên cPanel
1. Vào **Setup Node.js App** trên cPanel, chọn phiên bản **Node.js 24+**.
2. **Application Root**: Trỏ tới thư mục chứa mã nguồn dự án.
3. **Application Startup File**: Điền **`server.cjs`** (tệp nạp Next.js Standalone Server tích hợp sẵn tại gốc repo).
4. **Application Mode**: Đặt là `Production`.
5. Chạy lệnh `npm ci` và `npm run build` trong terminal của cPanel.
6. Đảm bảo thư mục khai báo trong `DANAVA_DATA_DIR` có đầy đủ quyền đọc/ghi (`chmod 750` hoặc `755`).
7. Bấm **Restart** ứng dụng để kích hoạt.

---

## 10. Quy Chuẩn Đóng Góp & Git Workflow

- **Nhánh chính thức**: Mọi tính năng hoàn thiện, bản sửa lỗi và tài liệu đều được hợp nhất và vận hành trên nhánh **`main`**.
- **Tiêu chuẩn kiểm tra trước khi commit**:
  1. Luôn chạy `npm run check` để đảm bảo TypeScript không có cảnh báo nào.
  2. Luôn chạy `npm test` để xác nhận 100% các bài test (12/12) đều màu xanh lá.
  3. Kiểm tra responsive trên các kích thước màn hình Desktop (1440px), Laptop (1024px) và Mobile (375px - 414px).
- **Quy tắc đặt thông điệp commit**:
  - `feat:` Bổ sung tính năng hoặc khối nội dung mới.
  - `fix:` Khắc phục lỗi giao diện, animation hoặc tương thích trình duyệt.
  - `docs:` Cập nhật tài liệu kỹ thuật, hướng dẫn hoặc sổ tay dự án.
  - `style:` Tinh chỉnh bản màu, typography, CSS tokens mà không thay đổi logic.

---

*Tài liệu được cập nhật và bảo trì bởi đội ngũ kỹ thuật DANAVA Solutions. Mọi thắc mắc kỹ thuật vui lòng liên hệ: `hello@danava.vn`.*
