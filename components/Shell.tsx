'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X, Phone, Mail, MapPin, ArrowRight, Home, LayoutGrid, MessageCircle, Briefcase, Newspaper } from 'lucide-react';
import { useSite } from './SiteStore';
import { SERVICE_META, sortServices, CONTACT, formatPhone } from './site/catalog';
import { IconTile } from './site/ui';
import { publishedSubServices, subServiceHref } from '@/lib/site-queries';
import { block } from '@/lib/blocks';

const NAV = [
  { href: '/he-sinh-thai/', label: 'Hệ sinh thái' },
  { href: '/du-an/', label: 'Dự án' },
  { href: '/ve-danava/', label: 'Về chúng tôi' },
  { href: '/kien-thuc/', label: 'Kiến thức' }
];

export function Header() {
  const path = usePathname() || '/';
  const { data } = useSite();
  const co = block(data, 'company');
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaRef = useRef<HTMLLIElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const services = sortServices(data.services);
  const subs = publishedSubServices(data);
  const phone = data.phone || CONTACT.phone;

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [path]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const app = document.querySelector('.s-app');
    app?.classList.toggle('is-locked', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); app?.classList.remove('is-locked'); };
  }, [open]);

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMega(false); };
    const onClick = (e: MouseEvent) => { if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [mega]);

  const enter = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMega(true); };
  const leave = () => { closeTimer.current = setTimeout(() => setMega(false), 120); };
  const active = (href: string) => path.startsWith(href);

  return (
    <>
      <header className={`s-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="s-container s-header__bar">
          <Link className="s-logo" href="/" aria-label="DANAVA Solutions — Trang chủ">
            <img src="/assets/danava-logo-trim.png" alt="DANAVA Solutions" width={554} height={135} />
          </Link>

          <nav className="s-nav" aria-label="Điều hướng chính">
            <ul className="s-nav__list">
              <li className="s-nav__item">
                <Link className="s-nav__link" href="/" aria-current={path === '/' ? 'page' : undefined}>Trang chủ</Link>
              </li>
              <li ref={megaRef} className={`s-nav__item${mega ? ' is-open' : ''}`} onMouseEnter={enter} onMouseLeave={leave}>
                <button
                  type="button"
                  className="s-nav__link"
                  aria-expanded={mega}
                  aria-controls="s-mega-solutions"
                  aria-current={active('/giai-phap/') ? 'page' : undefined}
                  onClick={() => setMega(v => !v)}
                >
                  Giải pháp <ChevronDown aria-hidden="true" />
                </button>
                <div className="s-mega" id="s-mega-solutions">
                  {services.map(s => {
                    const m = SERVICE_META[s.id];
                    return (
                      <Link key={s.id} href={`/giai-phap/${s.slug}/`} className="s-mega__item" onClick={() => setMega(false)}>
                        {m && <IconTile icon={m.icon} tone={m.tone} />}
                        <span>
                          <span className="s-mega__title">{s.title}</span>
                          <span className="s-mega__desc" style={{ display: 'block' }}>{s.description}</span>
                        </span>
                      </Link>
                    );
                  })}
                  {subs.length > 0 && (
                    <div className="s-mega__subs">
                      <span>Theo mô hình:</span>
                      {subs.map(x => <Link key={x.id} href={subServiceHref(data, x)} onClick={() => setMega(false)}>{x.title}</Link>)}
                    </div>
                  )}
                  <div className="s-mega__foot">
                    <span>Chưa chắc giải pháp nào phù hợp?</span>
                    <Link className="s-link" href="/giai-phap/" onClick={() => setMega(false)}>Xem tất cả giải pháp <ArrowRight aria-hidden="true" /></Link>
                  </div>
                </div>
              </li>
              {NAV.map(item => (
                <li key={item.href} className="s-nav__item">
                  <Link className="s-nav__link" href={item.href} aria-current={active(item.href) ? 'page' : undefined}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="s-header__actions">
            <a className="s-header__phone" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
            <Link className="s-btn s-btn--primary s-btn--sm" href="/lien-he/">Nhận tư vấn</Link>
            <button
              type="button"
              className="s-burger"
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={open}
              aria-controls="s-drawer"
              onClick={() => setOpen(v => !v)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div id="s-drawer" className={`s-drawer${open ? ' is-open' : ''}`} hidden={!open}>
        <div className="s-drawer__group">
          <Link className="s-drawer__link" href="/" aria-current={path === '/' ? 'page' : undefined}>
            Trang chủ<ChevronRight aria-hidden="true" />
          </Link>
        </div>
        <div className="s-drawer__group">
          <p className="s-drawer__label">Giải pháp</p>
          <div className="s-drawer__sub">
            {services.map(s => {
              const m = SERVICE_META[s.id];
              return (
                <Link key={s.id} href={`/giai-phap/${s.slug}/`}>
                  {m && <IconTile icon={m.icon} tone={m.tone} />}{s.title}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="s-drawer__group">
          {NAV.map(item => (
            <Link key={item.href} className="s-drawer__link" href={item.href} aria-current={active(item.href) ? 'page' : undefined}>
              {item.label}<ChevronRight aria-hidden="true" />
            </Link>
          ))}
          <Link className="s-drawer__link" href="/doi-ngu/" aria-current={active('/doi-ngu/') ? 'page' : undefined}>
            Đội ngũ<ChevronRight aria-hidden="true" />
          </Link>
        </div>
        <div className="s-drawer__cta">
          <Link className="s-btn s-btn--primary s-btn--lg s-btn--block" href="/lien-he/">Nhận tư vấn</Link>
          <a className="s-btn s-btn--secondary s-btn--lg s-btn--block" href={`tel:${phone}`}><Phone aria-hidden="true" />Gọi {formatPhone(phone)}</a>
        </div>
        <div className="s-drawer__contact">
          <span>{data.email || CONTACT.email}</span>
          <span>{co.address}</span>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  const { data } = useSite();
  const co = block(data, 'company');
  const services = sortServices(data.services);
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;

  return (
    <footer className="s-footer">
      <div className="s-container">
        <div className="s-footer__top">
          <div className="s-footer__brand">
            <Link className="s-logo" href="/" aria-label="DANAVA Solutions — Trang chủ">
              <img src="/assets/danava-logo-trim.png" alt="DANAVA Solutions" width={554} height={135} />
            </Link>
            <p>Công nghệ tạo khả năng, con người tạo giá trị. DANAVA đồng hành cùng doanh nghiệp bằng phần mềm quản lý, truyền thông và trải nghiệm.</p>
            <div className="s-footer__contact">
              <a href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
              <a href={`mailto:${email}`}><Mail aria-hidden="true" />{email}</a>
              <a href={co.mapUrl} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" />{co.address}</a>
            </div>
          </div>

          <div>
            <p className="s-footer__title">Giải pháp</p>
            <ul className="s-footer__list">
              {services.map(s => <li key={s.id}><Link href={`/giai-phap/${s.slug}/`}>{s.title}</Link></li>)}
            </ul>
          </div>

          <div>
            <p className="s-footer__title">Công ty</p>
            <ul className="s-footer__list">
              <li><Link href="/ve-danava/">Về DANAVA</Link></li>
              <li><Link href="/doi-ngu/">Đội ngũ</Link></li>
              <li><Link href="/he-sinh-thai/">Hệ sinh thái</Link></li>
              <li><Link href="/doi-tac/">Đối tác đồng hành</Link></li>
              <li><Link href="/du-an/">Dự án</Link></li>
              <li><Link href="/kien-thuc/">Kiến thức</Link></li>
            </ul>
          </div>

          <div>
            <p className="s-footer__title">Hỗ trợ</p>
            <ul className="s-footer__list">
              <li><Link href="/lien-he/">Liên hệ tư vấn</Link></li>
              <li><Link href="/chinh-sach-dich-vu/">Chính sách dịch vụ</Link></li>
              <li><Link href="/chinh-sach-rieng-tu/">Chính sách riêng tư</Link></li>
              <li><a href="https://danava.vn/" target="_blank" rel="noopener">Nền tảng danava.vn</a></li>
            </ul>
          </div>
        </div>

        <div className="s-footer__bottom">
          <span>© {new Date().getFullYear()} DANAVA Solutions. Bảo lưu mọi quyền.</span>
          <div className="s-footer__legal">
            <Link href="/chinh-sach-dich-vu/">Điều khoản dịch vụ</Link>
            <Link href="/chinh-sach-rieng-tu/">Quyền riêng tư</Link>
            {/* Link thường (không phải <Link>) để CMS tải lại toàn trang với stylesheet riêng */}
            <a href="/admin/" rel="nofollow">Quản trị</a>
          </div>
          {/* Logo xác nhận của Bộ Công Thương, trỏ về hồ sơ của danava.com.vn trên online.gov.vn */}
          <a
            className="s-footer__bct"
            href="https://online.gov.vn/nen-tang/1d279d1c-3013-421c-8f27-ef99e3af27f0"
            target="_blank"
            rel="noopener noreferrer"
            title="Đã thông báo Bộ Công Thương"
          >
            <img src="/assets/bct/da-thong-bao-bct.png" alt="Đã thông báo Bộ Công Thương" width={115} height={43} loading="lazy" />
          </a>
        </div>
      </div>
      <span className="s-footer__giant" aria-hidden="true">DANAVA</span>
    </footer>
  );
}

const TABS = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (p: string) => p === '/' },
  { href: '/giai-phap/', label: 'Giải pháp', icon: LayoutGrid, match: (p: string) => p.startsWith('/giai-phap') || p.startsWith('/he-sinh-thai') },
  { href: '/lien-he/', label: 'Tư vấn', icon: MessageCircle, match: (p: string) => p.startsWith('/lien-he'), primary: true },
  { href: '/du-an/', label: 'Dự án', icon: Briefcase, match: (p: string) => p.startsWith('/du-an') },
  { href: '/kien-thuc/', label: 'Kiến thức', icon: Newspaper, match: (p: string) => p.startsWith('/kien-thuc') }
];

/**
 * Thanh tab cố định dưới đáy màn hình (điện thoại, máy tính bảng dọc) — điều hướng kiểu ứng dụng:
 * luôn hiện, vùng bấm lớn trong tầm ngón cái, nút "Tư vấn" nổi ở giữa. Bấm lại tab đang mở để cuộn lên đầu.
 */
export function MobileBar() {
  const path = usePathname() || '/';
  return (
    <nav className="s-tabbar" aria-label="Điều hướng nhanh">
      {TABS.map(t => {
        const on = t.match(path);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`s-tabbar__item${t.primary ? ' s-tabbar__item--primary' : ''}`}
            aria-current={on ? 'page' : undefined}
            onClick={e => {
              if (on && path === t.href) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            }}
          >
            <span className="s-tabbar__icon"><Icon aria-hidden="true" /></span>
            <span className="s-tabbar__label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Nút liên hệ nổi góc phải: Zalo + gọi hotline (điện thoại: nằm ngay trên thanh tab). */
export function QuickContact() {
  const path = usePathname() || '/';
  const { data } = useSite();
  const phone = (data.phone || CONTACT.phone).replace(/\D/g, '');
  const ref = useRef<HTMLDivElement | null>(null);
  const [dodge, setDodge] = useState(false);

  // Tự né: khi cụm nút nổi đang chồng lên nút bấm, liên kết CTA hoặc ô nhập liệu thì trượt ra mép màn hình.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const pad = 6;
      const hit = [...document.querySelectorAll<HTMLElement>('main .s-btn, main input, main select, main textarea, main button, .s-footer a')].some(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.bottom > box.top - pad && r.top < box.bottom + pad && r.right > box.left - pad && r.left < box.right + pad;
      });
      setDodge(hit);
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    const t = setTimeout(check, 600);
    return () => { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [path]);

  if (path.startsWith('/lien-he')) return null;
  return (
    <div ref={ref} className={`s-quick${dodge ? ' is-dodged' : ''}`} aria-label="Liên hệ nhanh">
      <a className="s-quick__btn s-quick__btn--zalo" href={`https://zalo.me/${phone}`} target="_blank" rel="noopener noreferrer" aria-label="Nhắn Zalo cho DANAVA">
        Zalo
        <span className="s-quick__tip">Nhắn Zalo</span>
      </a>
      <a className="s-quick__btn s-quick__btn--call" href={`tel:${phone}`} aria-label={`Gọi ${formatPhone(phone)}`}>
        <Phone aria-hidden="true" />
        <span className="s-quick__tip">Gọi {formatPhone(phone)}</span>
      </a>
    </div>
  );
}
