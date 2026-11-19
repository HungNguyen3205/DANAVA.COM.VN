import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, LayoutGrid, Headphones, ArrowRight } from 'lucide-react';
import { SiteFrame } from '@/components/site/SiteFrame';
import { siteFont } from '@/lib/site-font';
// Cùng thứ tự stylesheet với app/(site)/layout.tsx để 404 toàn cục trông giống hệt các trang khác
import './(site)/site.css';
import './(site)/site-a.css';
import './(site)/site-b.css';
import './(site)/site-c.css';
import './(site)/site-v2.css';
import './(site)/site-v3.css';
import './(site)/site-home.css';
import './(site)/site-theme.css';
import './(site)/site-app.css';
import './(site)/site-upgrade.css';
import './(site)/site-identity.css';
import './(site)/site-studio.css';

/**
 * 404 toàn cục (URL không khớp route nào): nằm ngoài nhóm (site) nên tự nạp stylesheet và khung website.
 * notFound() gọi từ trang trong (site) dùng app/(site)/not-found.tsx — chỉ render NotFoundContent,
 * vì layout (site) đã có header/footer (tránh lặp 2 header + 2 footer).
 */
export const metadata: Metadata = {
  title: '404 — Không tìm thấy trang',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ mới trên website DANAVA Solutions.',
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <div className={siteFont.variable} style={{ display: 'contents' }}>
      <SiteFrame>
        <NotFoundContent />
      </SiteFrame>
    </div>
  );
}

export function NotFoundContent() {
  return (
    <main id="main" className="not-found-page-wrapper">
      <div className="s-container">
        <div className="not-found-card">
          <svg
            className="not-found-geometric-art"
            viewBox="0 0 240 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <ellipse cx="120" cy="70" rx="104" ry="40" stroke="#d6e0fa" strokeWidth="1.5" />
            <ellipse cx="120" cy="70" rx="70" ry="26" stroke="#e5e8ef" strokeWidth="1.5" strokeDasharray="4 6" />
            <polygon points="98,38 146,38 166,70 146,102 98,102 112,70" fill="#2b4294" opacity="0.92" />
            <polygon points="112,70 98,102 128,102" fill="#f08a1c" />
            <circle cx="216" cy="62" r="6" fill="#f08a1c" />
            <circle cx="24" cy="80" r="4" fill="#53a5db" />
          </svg>

          <p className="not-found-code">MÃ LỖI 404 · DANAVA SOLUTIONS</p>
          <h1 className="s-h1 not-found-title">Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển dời.</h1>
          <p className="s-lead not-found-desc">
            Đường dẫn có thể đã thay đổi sau đợt làm mới website, hoặc địa chỉ được nhập chưa chính xác. Hãy chọn một trong các lối đi dưới đây.
          </p>

          <div className="s-row s-row--center not-found-actions">
            <Link href="/" className="s-btn s-btn--primary s-btn--lg">Về Trang chủ</Link>
            <Link href="/giai-phap/" className="s-btn s-btn--secondary s-btn--lg">Khám phá Giải pháp</Link>
          </div>
        </div>

        <div className="not-found-exits-grid">
          <Link href="/" className="exit-card">
            <span className="s-icon" aria-hidden="true"><Home /></span>
            <span className="exit-card__title">Trang chủ DANAVA</span>
            <span className="exit-card__text">Tổng quan giải pháp, dự án và hệ sinh thái DANAVA.</span>
            <span className="s-link">Về trang chủ <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link href="/giai-phap/" className="exit-card">
            <span className="s-icon" aria-hidden="true"><LayoutGrid /></span>
            <span className="exit-card__title">Các Giải pháp Số</span>
            <span className="exit-card__text">Phần mềm DANAVA Studio, website, marketing và sự kiện.</span>
            <span className="s-link">Xem giải pháp <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link href="/lien-he/" className="exit-card">
            <span className="s-icon" aria-hidden="true"><Headphones /></span>
            <span className="exit-card__title">Liên hệ Hỗ trợ</span>
            <span className="exit-card__text">Trao đổi trực tiếp với chuyên viên DANAVA.</span>
            <span className="s-link">Nhận hỗ trợ <ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>

        <p className="not-found-note">
          Cần hỗ trợ? Hotline <a href="tel:0935917677">0935 91 76 77</a> (Thứ Hai – Thứ Bảy, 08:00 – 18:00) · Email <a href="mailto:support@danava.vn">support@danava.vn</a>
        </p>
      </div>
    </main>
  );
}
