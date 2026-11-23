'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, Phone, Mail, MapPin, ArrowRight, ArrowUpRight, Home, LayoutGrid, MessageCircle, Briefcase, Newspaper } from 'lucide-react';
import { useSite } from './SiteStore';
import { sortServices, CONTACT, formatPhone } from './site/catalog';
import { block, safeHref } from '@/lib/blocks';
import { HrefIcon } from './site/icons';
import { contactChannels } from '@/lib/contact-channels';
import { BrandIcon } from './site/BrandIcons';
import { MobileMenu } from './site/MobileMenu';
import { ContactSheet } from './site/ContactDock';

/** Dòng phụ dưới tên cột mega menu (theo thứ tự cột) */
const COL_SUB = ['Công nghệ & phần mềm', 'Truyền thông & tăng trưởng', 'Kết nối & phát triển'];

type MenuItemData = { label: string; desc: string; href: string; badge: string; image: string };
/** Một mục menu Giải pháp: trang trong website → Link; https → tab mới; không có đường dẫn → chỉ hiển thị. */
function MenuItem({ it, onPick }: { it: MenuItemData; onPick?: () => void }) {
  const external = it.href.startsWith('https://');
  // Không dùng ảnh (yêu cầu 20/11/2026); mỗi mục có icon nét mảnh theo đường dẫn (yêu cầu 21/11/2026)
  const body = (
    <>
      <HrefIcon href={it.href} className="s-mega__ico" />
      <span className="s-mega__txt">
        <span className="s-mega__label">
          {it.label}
          {it.badge && <span className="s-mega__badge">{it.badge}</span>}
          {external && <ArrowUpRight aria-hidden="true" />}
        </span>
        {it.desc && <span className="s-mega__sub">{it.desc}</span>}
      </span>
    </>
  );
  const cls = 's-mega__link';
  if (!it.href || !safeHref(it.href)) return <div className={`${cls} is-static`}>{body}</div>;
  if (external) return <a className={cls} href={it.href} target="_blank" rel="noopener" onClick={onPick}>{body}<span className="s-sr"> (mở tab mới)</span></a>;
  return <Link className={cls} href={it.href} onClick={onPick}>{body}</Link>;
}

const NAV = [
  { href: '/du-an/', label: 'Dự án' },
  { href: '/he-sinh-thai/', label: 'Hệ sinh thái' },
  { href: '/kien-thuc/', label: 'Blogs' },
  { href: '/ve-danava/', label: 'Về chúng tôi' },
  { href: '/tuyen-dung/', label: 'Tuyển dụng' },
  { href: '/lien-he/', label: 'Liên hệ' }
];

export function Header() {
  const path = usePathname() || '/';
  const { data } = useSite();
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaRef = useRef<HTMLLIElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menu = block(data, 'menu');

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
              <li ref={megaRef} className={`s-nav__item s-nav__item--mega${mega ? ' is-open' : ''}`} onMouseEnter={enter} onMouseLeave={leave}>
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
                <div className="s-mega s-mega--cols" id="s-mega-solutions">
                  <div className="s-mega__cols" style={menu.columns.length === 3 ? undefined : { gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, 1fr))` }}>
                    {menu.columns.map((col, ci) => (
                      <div key={ci} className="s-mega__col">
                        <p className="s-mega__head"><span className="s-mega__no">{String(ci + 1).padStart(2, '0')}</span><span>{col.title}{COL_SUB[ci] && <small>{COL_SUB[ci]}</small>}</span></p>
                        <ul>
                          {col.items.map((it, ii) => <li key={ii}><MenuItem it={it} onPick={() => setMega(false)} /></li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {menu.footLabel && (
                    <div className="s-mega__foot">
                      <span className="s-mega__slogan">{menu.footText}</span>
                      <Link className="s-mega__cta" href={safeHref(menu.footHref) && menu.footHref ? menu.footHref : '/giai-phap/'} onClick={() => setMega(false)}>{menu.footLabel} <ArrowRight aria-hidden="true" /></Link>
                    </div>
                  )}
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
            <Link className="s-btn s-btn--primary s-btn--sm" href="/lien-he/#dang-ky-tu-van">Nhận tư vấn</Link>
            <button
              type="button"
              className="s-burger"
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="s-menu"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" /><span>MENU</span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={closeMenu} path={path} />
    </>
  );
}

export function Footer() {
  const { data } = useSite();
  const co = block(data, 'company');
  const services = sortServices(data.services);
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;
  const { socials } = contactChannels(data);

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
            {socials.length > 0 && (
              <ul className="s-footer__social" aria-label="DANAVA trên mạng xã hội">
                {socials.map(s => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" title={s.name} aria-label={`${s.name} của DANAVA (mở tab mới)`}><BrandIcon name={s.key} /></a>
                  </li>
                ))}
              </ul>
            )}
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
              <li><Link href="/tuyen-dung/">Tuyển dụng</Link></li>
              <li><Link href="/he-sinh-thai/">Hệ sinh thái</Link></li>
              <li><Link href="/doi-tac/">Đối tác đồng hành</Link></li>
              <li><Link href="/du-an/">Dự án</Link></li>
              <li><Link href="/kien-thuc/">Blogs</Link></li>
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
    </footer>
  );
}

const TABS = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (p: string) => p === '/' },
  { href: '/giai-phap/', label: 'Giải pháp', icon: LayoutGrid, match: (p: string) => p.startsWith('/giai-phap') || p.startsWith('/he-sinh-thai') },
  { href: '/lien-he/#dang-ky-tu-van', label: 'Tư vấn', icon: MessageCircle, match: (p: string) => p.startsWith('/lien-he'), primary: true },
  { href: '/du-an/', label: 'Dự án', icon: Briefcase, match: (p: string) => p.startsWith('/du-an') },
  { href: '/kien-thuc/', label: 'Blogs', icon: Newspaper, match: (p: string) => p.startsWith('/kien-thuc') }
];

/**
 * Thanh tab cố định dưới đáy màn hình (điện thoại, máy tính bảng dọc) — điều hướng kiểu ứng dụng:
 * luôn hiện, vùng bấm lớn trong tầm ngón cái, nút "Tư vấn" nổi ở giữa mở bảng kênh liên hệ. Bấm lại tab đang mở để cuộn lên đầu.
 */
export function MobileBar() {
  const path = usePathname() || '/';
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);
  useEffect(() => { setSheet(false); }, [path]);
  return (
    <>
      <nav className="s-tabbar" aria-label="Điều hướng nhanh">
        {TABS.map(t => {
          const on = t.match(path);
          const Icon = t.icon;
          const body = (
            <>
              <span className="s-tabbar__icon"><Icon aria-hidden="true" /></span>
              <span className="s-tabbar__label">{t.label}</span>
            </>
          );
          if (t.primary) {
            return (
              <button key={t.href} type="button" className="s-tabbar__item s-tabbar__item--primary" aria-haspopup="dialog" aria-expanded={sheet} aria-controls="s-contact-sheet" aria-current={on ? 'page' : undefined} onClick={() => setSheet(true)}>
                {body}
              </button>
            );
          }
          return (
            <Link
              key={t.href}
              href={t.href}
              className="s-tabbar__item"
              aria-current={on ? 'page' : undefined}
              onClick={e => {
                if (on && path === t.href) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }}
            >
              {body}
            </Link>
          );
        })}
      </nav>
      <ContactSheet open={sheet} onClose={closeSheet} />
    </>
  );
}
