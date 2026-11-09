import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Không tìm thấy trang | DANAVA Solutions',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển dời sang địa chỉ mới trên website DANAVA Solutions.',
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <main id="main" className="not-found-page-wrapper">
      <div className="not-found-container">
        {/* KHỐI CARD NAVY TRUNG TÂM */}
        <div className="not-found-card">
          {/* MINH HỌA HÌNH HỌC NHẸ (LIGHTWEIGHT GEOMETRIC ART) */}
          <div className="not-found-illustration-wrap">
            <svg
              className="not-found-geometric-art"
              viewBox="0 0 280 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
            >
              {/* Lưới tọa độ không gian số */}
              <g opacity="0.3" stroke="#3A506B" strokeWidth="1">
                <line x1="20" y1="30" x2="260" y2="30" strokeDasharray="4 4" />
                <line x1="20" y1="90" x2="260" y2="90" strokeDasharray="4 4" />
                <line x1="20" y1="150" x2="260" y2="150" strokeDasharray="4 4" />
                <line x1="70" y1="10" x2="70" y2="170" strokeDasharray="4 4" />
                <line x1="140" y1="10" x2="140" y2="170" strokeDasharray="4 4" />
                <line x1="210" y1="10" x2="210" y2="170" strokeDasharray="4 4" />
              </g>

              {/* Vòng elip quỹ đạo hình học */}
              <ellipse cx="140" cy="90" rx="100" ry="46" stroke="#3A506B" strokeWidth="1.5" />
              <ellipse cx="140" cy="90" rx="100" ry="46" stroke="#5BC0DE" strokeWidth="1.5" strokeDasharray="25 100" />
              <ellipse cx="140" cy="90" rx="60" ry="26" stroke="rgba(244, 214, 176, 0.45)" strokeWidth="1" />

              {/* Khối hình thoi đa giác tâm điểm */}
              <polygon points="140,45 175,90 140,135 105,90" stroke="#5BC0DE" strokeWidth="1.5" fill="rgba(91, 192, 222, 0.08)" />
              <polygon points="140,62 160,90 140,118 120,90" stroke="#F4D6B0" strokeWidth="1" fill="rgba(244, 214, 176, 0.1)" />

              {/* Số 404 hình học ẩn chìm */}
              <text x="140" y="100" textAnchor="middle" fill="#FFFFFF" fillOpacity="0.08" fontSize="76" fontWeight="900" fontFamily="sans-serif" letterSpacing="6">
                404
              </text>

              {/* Các điểm nút tọa độ phát sáng */}
              <circle cx="140" cy="90" r="4.5" fill="#F4D6B0" />
              <circle cx="140" cy="45" r="3.5" fill="#5BC0DE" />
              <circle cx="140" cy="135" r="3.5" fill="#5BC0DE" />
              <circle cx="105" cy="90" r="3.5" fill="#D97706" />
              <circle cx="175" cy="90" r="3.5" fill="#D97706" />
            </svg>
            <span className="not-found-code-badge">MÃ LỖI 404 · TRANG KHÔNG TỒN TẠI</span>
          </div>

          {/* THÔNG BÁO TIẾNG VIỆT */}
          <div className="not-found-header">
            <span className="not-found-kicker">DANAVA SOLUTIONS · ĐIỀU HƯỚNG HỆ THỐNG</span>
            <h1 className="not-found-title">Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển dời.</h1>
            <p className="not-found-desc">
              Địa chỉ liên kết có thể đã thay đổi cấu trúc sau đợt chuẩn hóa website, hoặc đường dẫn được nhập chưa chính xác. Quý khách vui lòng chọn một trong ba lối ra dưới đây để tiếp tục trải nghiệm:
            </p>
          </div>

          {/* BA LỐI RA CHÍNH (THREE EXITS) - NÚT BẤM HÀNH ĐỘNG */}
          <div className="not-found-main-actions" role="group" aria-label="Ba lối ra điều hướng chính">
            <Link href="/" className="button amber not-found-btn">
              1. Về Trang chủ ↗
            </Link>
            <Link href="/giai-phap/" className="button secondary not-found-btn">
              2. Khám phá Giải pháp ↗
            </Link>
            <Link href="/lien-he/" className="button secondary not-found-btn highlight-contact">
              3. Liên hệ Hỗ trợ ↗
            </Link>
          </div>

          {/* BA THẺ LỐI RA MINH HỌA CHI TIẾT */}
          <div className="not-found-exits-grid">
            <Link href="/" className="exit-card">
              <span className="exit-icon" aria-hidden="true">🏛️</span>
              <div className="exit-info">
                <h3>1. Trang chủ DANAVA</h3>
                <p>Khám phá hệ sinh thái giải pháp số, tinh thần thương hiệu và các mốc phát triển tiêu biểu.</p>
                <span className="exit-link-text">Về trang chủ →</span>
              </div>
            </Link>

            <Link href="/giai-phap/" className="exit-card">
              <span className="exit-icon" aria-hidden="true">⚡</span>
              <div className="exit-info">
                <h3>2. Các Giải pháp Số</h3>
                <p>Tìm hiểu phần mềm quản trị phòng tập DANAVA Studio, thiết kế Website và truyền thông đa kênh.</p>
                <span className="exit-link-text">Xem giải pháp →</span>
              </div>
            </Link>

            <Link href="/lien-he/" className="exit-card">
              <span className="exit-icon" aria-hidden="true">💬</span>
              <div className="exit-info">
                <h3>3. Trung tâm Hỗ trợ</h3>
                <p>Trao đổi trực tiếp chuyên viên qua Hotline 0935 91 76 77 hoặc gửi yêu cầu trợ giúp kỹ thuật.</p>
                <span className="exit-link-text">Nhận hỗ trợ ngay →</span>
              </div>
            </Link>
          </div>

          {/* DÒNG LIÊN HỆ BỔ SUNG */}
          <div className="not-found-footer-note">
            <span>
              Cần hỗ trợ vận hành hoặc khắc phục lỗi? Hotline 24/7:{' '}
              <a href="tel:0935917677">0935 91 76 77</a> · Email chuyên trách:{' '}
              <a href="mailto:support@danava.vn">support@danava.vn</a>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
