'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useSite } from './SiteStore';

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Close menu and update scroll status on path change
  useEffect(() => {
    setOpen(false);
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [path]);

  // Keyboard accessibility and body scroll lock for mobile menu
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && navRef.current) {
        const focusable = [
          menuBtnRef.current,
          ...Array.from(navRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        ].filter(Boolean) as HTMLElement[];

        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (path.startsWith('/admin')) return null;

  const navItems = [
    { href: '/giai-phap/', label: 'Giải pháp' },
    { href: '/he-sinh-thai/', label: 'Hệ sinh thái' },
    { href: '/du-an/', label: 'Dự án' },
    { href: '/ve-danava/', label: 'Về DANAVA' },
    { href: '/kien-thuc/', label: 'Bản tin' }
  ];

  return (
    <>
      <header
        className={`header integrated-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'menu-open' : ''}`}
        role="banner"
      >
        <Link className="brand" href="/" aria-label="Trang chủ DANAVA Solutions">
          <img src="/assets/danava-logo.png" alt="DANAVA Solutions" />
        </Link>

        {/* Desktop & Mobile Navigation Menu */}
        <nav
          ref={navRef}
          id="main-nav"
          className={`main-navigation ${open ? 'open' : ''}`}
          aria-label="Điều hướng chính"
        >
          <div className="nav-items-wrapper">
            {navItems.map(({ href, label }) => {
              const isActive = path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Secondary links inside mobile menu */}
          <div className="mobile-menu-supplement">
            <Link
              href="/lien-he/"
              className="mobile-cta-link"
              onClick={() => setOpen(false)}
            >
              Liên hệ tư vấn ↗
            </Link>
            <div className="mobile-contact-info">
              <a href="tel:0935917677">Hotline: 0935 917 677</a>
              <a href="mailto:hello@danava.vn">Email: hello@danava.vn</a>
              <span>08 Đặng Vũ Hỷ, An Hải, Đà Nẵng</span>
            </div>
          </div>
        </nav>

        {/* Desktop Header CTA */}
        <Link className="header-cta" href="/lien-he/">
          Kết nối với DANAVA ↗
        </Link>

        {/* Accessible Mobile Menu Toggle */}
        <button
          ref={menuBtnRef}
          type="button"
          className={`menu-button ${open ? 'is-active' : ''}`}
          aria-label={open ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {open && (
        <div
          className="menu-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function Footer() {
  const { data } = useSite();
  const path = usePathname();
  if (path.startsWith('/admin')) return null;

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-main">
        {/* Brand / Positioning Column */}
        <div className="footer-col footer-col-brand">
          <Link href="/" className="footer-brand" aria-label="DANAVA Solutions — Trang chủ">
            <img src="/assets/danava-logo.png" alt="DANAVA Solutions" />
          </Link>
          <p className="footer-slogan">
            Công nghệ tạo khả năng. Con người tạo giá trị. Kết nối giải pháp quản trị số, truyền thông thương hiệu và trải nghiệm cộng đồng ý nghĩa.
          </p>
          <div className="footer-contact-block">
            <p><strong>Trụ sở:</strong> 08 Đặng Vũ Hỷ, An Hải, Đà Nẵng</p>
            <p><strong>Hotline:</strong> <a href={`tel:${data.phone || '0935917677'}`}>{data.phone || '0935 917 677'}</a></p>
            <p><strong>Email:</strong> <a href={`mailto:${data.email || 'hello@danava.vn'}`}>{data.email || 'hello@danava.vn'}</a></p>
          </div>
        </div>

        {/* Solutions Column */}
        <div className="footer-col">
          <p className="footer-col-title">GIẢI PHÁP</p>
          <ul className="footer-nav-list">
            <li><Link href="/giai-phap/thiet-ke-website/">Website & Landing Page</Link></li>
            <li><Link href="/giai-phap/danava-studio/">DANAVA Studio (Phòng tập)</Link></li>
            <li><Link href="/giai-phap/digital-marketing/">Marketing & Truyền thông</Link></li>
            <li><Link href="/giai-phap/du-lich-su-kien/">Du lịch & Sự kiện</Link></li>
            <li><Link href="/giai-phap/cong-dong/">Cộng đồng & Đồng hành</Link></li>
          </ul>
        </div>

        {/* Explore / Knowledge Column */}
        <div className="footer-col">
          <p className="footer-col-title">KHÁM PHÁ</p>
          <ul className="footer-nav-list">
            <li><Link href="/ve-danava/">Về con người DANAVA</Link></li>
            <li><Link href="/doi-ngu/">Đội ngũ chuyên trách</Link></li>
            <li><Link href="/he-sinh-thai/">Hệ sinh thái mở</Link></li>
            <li><Link href="/du-an/">Hồ sơ triển khai thật</Link></li>
            <li><Link href="/kien-thuc/">Bản tin & Góc nhìn</Link></li>
            <li><a href="https://danava.vn/" target="_blank" rel="noopener noreferrer">Nền tảng danava.vn ↗</a></li>
          </ul>
        </div>

        {/* Consultation Call To Action Column */}
        <div className="footer-col footer-col-cta">
          <p className="footer-col-title">KẾT NỐI HỢP TÁC</p>
          <p className="footer-cta-text">
            Bạn đang ấp ủ một ý tưởng phát triển hay bài toán quản trị vận hành? Hãy cùng DANAVA bắt đầu hành trình.
          </p>
          <Link href="/lien-he/" className="button amber footer-cta-btn">
            Bắt đầu cuộc trò chuyện ↗
          </Link>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <span className="copyright-text">
            © {new Date().getFullYear()} DANAVA Solutions. Bảo lưu mọi quyền.
          </span>
          <div className="footer-bottom-links">
            <Link href="/chinh-sach-dich-vu/">Chính sách dịch vụ</Link>
            <span className="dot-divider" aria-hidden="true">·</span>
            <Link href="/chinh-sach-rieng-tu/">Chính sách riêng tư</Link>
            <span className="dot-divider" aria-hidden="true">·</span>
            <Link href="/admin/">Quản trị CMS ↗</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
