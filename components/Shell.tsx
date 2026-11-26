'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown, Menu, Phone, Mail, MapPin, ArrowRight, ArrowUpRight, Home, LayoutGrid, MessageCircle, Briefcase, Newspaper, Info, FolderKanban, BriefcaseBusiness, Users, type LucideIcon } from 'lucide-react';
import { useSite } from './SiteStore';
import { sortServices, CONTACT, formatPhone } from './site/catalog';
import { block, safeHref } from '@/lib/blocks';
import { HrefIcon, IconBox, type Tone } from './site/icons';
import { SERVICE_MENU } from '@/lib/services-menu';
import { LayoutTemplate, PartyPopper, Dumbbell } from 'lucide-react';
import { cmsBlock, cmsText, ct } from './site/cms';
import type { SiteData } from '@/lib/content';

/** Chữ cố định của đầu trang / chân trang (khóa shell.*, dùng chung toàn website). */
function S({ data, k, def, label }: { data: SiteData; k: string; def: string; label: string }) {
  const x = ct(data, `shell.${k}`, def, label, { scope: 'global' });
  return <span {...x.a}>{x.v}</span>;
}

import { contactChannels } from '@/lib/contact-channels';
import { BrandIcon } from './site/BrandIcons';
import { MobileMenu } from './site/MobileMenu';
import { LangSwitch } from './site/LangSwitch';
import { splitLocale } from '@/lib/i18n';
import { ContactSheet } from './site/ContactDock';

/** Dòng phụ dưới tên cột mega menu (theo thứ tự cột) */
const COL_SUB = ['Công nghệ & phần mềm', 'Truyền thông & tăng trưởng', 'Kết nối & phát triển'];

/** icon/tone tùy chọn: không có thì lấy theo đường dẫn (HrefIcon) */
type MenuItemData = { label: string; desc: string; href: string; badge: string; image: string; icon?: LucideIcon; tone?: Tone };
/** Một mục menu Giải pháp: trang trong website → Link; https → tab mới; không có đường dẫn → chỉ hiển thị. */
function MenuItem({ it, onPick, cms }: { it: MenuItemData; onPick?: () => void; cms?: { label?: Record<string, string>; desc?: Record<string, string> } }) {
  const external = it.href.startsWith('https://');
  // Không dùng ảnh (yêu cầu 20/11/2026); mỗi mục có icon nét mảnh theo đường dẫn (yêu cầu 21/11/2026)
  const body = (
    <>
      {it.icon ? <IconBox icon={it.icon} tone={it.tone} className="s-mega__ico" /> : <HrefIcon href={it.href} className="s-mega__ico" />}
      <span className="s-mega__txt">
        <span className="s-mega__label">
          <span {...cms?.label}>{it.label}</span>
          {it.badge && <span className="s-mega__badge">{it.badge}</span>}
          {external && <ArrowUpRight aria-hidden="true" />}
        </span>
        {it.desc && <span className="s-mega__sub" {...cms?.desc}>{it.desc}</span>}
      </span>
    </>
  );
  const cls = 's-mega__link';
  if (!it.href || !safeHref(it.href)) return <div className={`${cls} is-static`}>{body}</div>;
  if (external) return <a className={cls} href={it.href} target="_blank" rel="noopener" onClick={onPick}>{body}<span className="s-sr"> (mở tab mới)</span></a>;
  return <Link className={cls} href={it.href} onClick={onPick}>{body}</Link>;
}

/** Mega menu "Về chúng tôi": cùng cấu trúc như menu Giải pháp (cột đánh số, mục có icon, thanh chân) */
const ABOUT_COLS: { title: string; sub: string; items: MenuItemData[] }[] = [
  {
    title: 'Giới thiệu', sub: 'Câu chuyện & con người',
    items: [
      { label: 'Giới thiệu', desc: 'Câu chuyện, tầm nhìn và cột mốc phát triển', href: '/ve-danava/', badge: '', image: '', icon: Info, tone: 'blue' },
      { label: 'Đội ngũ', desc: 'Những người trực tiếp tư vấn và triển khai', href: '/doi-ngu/', badge: '', image: '', icon: Users, tone: 'orange' }
    ]
  },
  {
    title: 'Hoạt động', sub: 'Dự án, kiến thức & cơ hội',
    items: [
      { label: 'Dự án', desc: 'Câu chuyện triển khai thực tế cùng khách hàng', href: '/du-an/', badge: '', image: '', icon: FolderKanban, tone: 'orange' },
      { label: 'Blogs', desc: 'Kiến thức, hướng dẫn và tin tức', href: '/blogs/', badge: '', image: '', icon: Newspaper, tone: 'blue' },
      { label: 'Tuyển dụng', desc: 'Cơ hội nghề nghiệp tại DANAVA', href: '/tuyen-dung/', badge: '', image: '', icon: BriefcaseBusiness, tone: 'orange' }
    ]
  }
];

export function Header() {
  // /en/…, /ja/… → đường dẫn gốc (mục menu đang mở, so khớp liên kết)
  const path = splitLocale(usePathname() || '/').path;
  const { data } = useSite();
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);
  const [mega, setMega] = useState(false);
  const [about, setAbout] = useState(false);
  const aboutRef = useRef<HTMLLIElement | null>(null);
  const [svc, setSvc] = useState(false);
  const [svcGroup, setSvcGroup] = useState(SERVICE_MENU[0].id);
  const svcRef = useRef<HTMLLIElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const megaRef = useRef<HTMLLIElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menu = block(data, 'menu');

  useEffect(() => {
    setOpen(false);
    setMega(false);
    setAbout(false);
    setSvc(false);
  }, [path]);

  useEffect(() => {
    if (!about) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbout(false); };
    const onClick = (e: MouseEvent) => { if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) setAbout(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [about]);

  useEffect(() => {
    if (!svc) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSvc(false); };
    const onClick = (e: MouseEvent) => { if (svcRef.current && !svcRef.current.contains(e.target as Node)) setSvc(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [svc]);

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
  // Mở menu thả xuống khi rê chuột — chỉ với chuột thật. Màn cảm ứng (máy tính bảng, điện thoại xoay ngang) cũng phát sự kiện "rê vào"
  // ngay trước cú bấm: menu vừa mở đã bị nút bấm đảo lại thành đóng → bấm "Giải pháp / Dịch vụ / Về chúng tôi" không mở được.
  const hover = (fn: () => void) => (e: ReactPointerEvent) => { if (e.pointerType === 'mouse') fn(); };

  return (
    <>
      <header className={`s-header${scrolled ? ' is-scrolled' : ''}`} {...cmsBlock('Đầu trang & menu', 'site-header', { panel: 'menu', scope: 'global' })}>
        <div className="s-container s-header__bar">
          <Link className="s-logo" href="/" aria-label="DANAVA Solutions — Trang chủ">
            <img src="/assets/danava-logo-trim.png" alt="DANAVA Solutions" width={554} height={135} />
          </Link>

          <nav className="s-nav" aria-label="Điều hướng chính">
            <ul className="s-nav__list">
              <li className="s-nav__item">
                <Link className="s-nav__link" href="/" aria-current={path === '/' ? 'page' : undefined}><S data={data} k="nav.home" def="Trang chủ" label="Menu: Trang chủ" /></Link>
              </li>
              <li ref={megaRef} className={`s-nav__item s-nav__item--mega${mega ? ' is-open' : ''}`} onPointerEnter={hover(enter)} onPointerLeave={hover(leave)}>
                <button
                  type="button"
                  className="s-nav__link"
                  aria-expanded={mega}
                  aria-controls="s-mega-solutions"
                  aria-current={active('/giai-phap/') ? 'page' : undefined}
                  onClick={() => setMega(v => !v)}
                >
                  <S data={data} k="nav.solutions" def="Giải pháp" label="Menu: Giải pháp" /> <ChevronDown aria-hidden="true" />
                </button>
                <div className="s-mega s-mega--cols" id="s-mega-solutions">
                  <div className="s-mega__cols" style={menu.columns.length === 3 ? undefined : { gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, 1fr))` }}>
                    {menu.columns.map((col, ci) => (
                      <div key={ci} className="s-mega__col">
                        <p className="s-mega__head"><span className="s-mega__no">{String(ci + 1).padStart(2, '0')}</span><span><span {...cmsText(`block.menu.columns.${ci}.title`, 'Tên cột menu', { scope: 'global' })}>{col.title}</span>{COL_SUB[ci] && (() => { const x = ct(data, `shell.mega.sub.${ci}`, COL_SUB[ci], 'Dòng phụ cột menu', { scope: 'global' }); return <small {...x.a}>{x.v}</small>; })()}</span></p>
                        <ul>
                          {col.items.map((it, ii) => <li key={ii}><MenuItem it={it} onPick={() => setMega(false)} cms={{ label: cmsText(`block.menu.columns.${ci}.items.${ii}.label`, 'Tên mục menu', { scope: 'global' }), desc: cmsText(`block.menu.columns.${ci}.items.${ii}.desc`, 'Mô tả mục menu', { scope: 'global' }) }} /></li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {menu.footLabel && (
                    <div className="s-mega__foot">
                      <span className="s-mega__slogan" {...cmsText('block.menu.footText', 'Câu chân menu', { scope: 'global' })}>{menu.footText}</span>
                      <Link className="s-mega__cta" href={safeHref(menu.footHref) && menu.footHref ? menu.footHref : '/giai-phap/'} onClick={() => setMega(false)}><span {...cmsText('block.menu.footLabel', 'Nút chân menu', { scope: 'global' })}>{menu.footLabel}</span> <ArrowRight aria-hidden="true" /></Link>
                    </div>
                  )}
                </div>
              </li>
              {/* Dịch vụ: danh mục báo giá bên trái, mục của danh mục đang chọn bên phải (lib/services-menu.ts) */}
              <li ref={svcRef} className={`s-nav__item s-nav__item--mega${svc ? ' is-open' : ''}`} onPointerEnter={hover(() => setSvc(true))} onPointerLeave={hover(() => setSvc(false))}>
                <button
                  type="button"
                  className="s-nav__link"
                  aria-expanded={svc}
                  aria-controls="s-mega-services"
                  aria-current={['/bao-gia', '/thiet-bi-gym'].some(p => path.startsWith(p)) ? 'page' : undefined}
                  onClick={() => setSvc(v => !v)}
                >
                  <S data={data} k="nav.services" def="Dịch vụ" label="Menu: Dịch vụ" /> <ChevronDown aria-hidden="true" />
                </button>
                <div className="s-mega s-svc" id="s-mega-services">
                  <ul className="s-svc__groups" role="tablist" aria-label="Nhóm dịch vụ">
                    {SERVICE_MENU.map(g => {
                      const Icon = g.icon === 'landing' ? LayoutTemplate : g.icon === 'event' ? PartyPopper : Dumbbell;
                      const x = ct(data, `nav.svc.${g.id}.label`, g.label, 'Menu Dịch vụ: tên nhóm', { scope: 'global' });
                      return (
                        <li key={g.id} role="presentation">
                          <button type="button" role="tab" aria-selected={svcGroup === g.id} className={`s-svc__group${svcGroup === g.id ? ' is-on' : ''}`}
                            onMouseEnter={() => setSvcGroup(g.id)} onFocus={() => setSvcGroup(g.id)} onClick={() => setSvcGroup(g.id)}>
                            <Icon aria-hidden="true" /><span {...x.a}>{x.v}</span><ChevronDown className="s-svc__chev" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="s-svc__items" role="tabpanel">
                    {SERVICE_MENU.filter(g => g.id === svcGroup).map(g => g.items.map(it => {
                      const l = ct(data, `nav.svc.${g.id}.${it.id}.label`, it.label, 'Menu Dịch vụ: tên mục', { scope: 'global' });
                      const d = ct(data, `nav.svc.${g.id}.${it.id}.desc`, it.desc, 'Menu Dịch vụ: mô tả mục', { scope: 'global' });
                      return (
                        <Link key={g.id + it.id} className="s-svc__item" href={it.href} onClick={() => setSvc(false)}>
                          <span className="s-svc__arrow" aria-hidden="true"><ArrowRight /></span>
                          <span className="s-svc__txt">
                            <span className="s-svc__label"><span {...l.a}>{l.v}</span>{it.badge && (() => { const b = ct(data, `nav.svc.${g.id}.${it.id}.badge`, it.badge, 'Menu Dịch vụ: nhãn nổi bật', { scope: 'global' }); return <span className="s-svc__badge" {...b.a}>{b.v}</span>; })()}</span>
                            <span className="s-svc__desc" {...d.a}>{d.v}</span>
                          </span>
                        </Link>
                      );
                    }))}
                  </div>
                </div>
              </li>
              <li className="s-nav__item">
                <Link className="s-nav__link" href="/he-sinh-thai/" aria-current={active('/he-sinh-thai/') ? 'page' : undefined}><S data={data} k="nav.ecosystem" def="Hệ sinh thái" label="Menu: Hệ sinh thái" /></Link>
              </li>
              <li ref={aboutRef} className={`s-nav__item s-nav__item--mega${about ? ' is-open' : ''}`} onPointerEnter={hover(() => setAbout(true))} onPointerLeave={hover(() => setAbout(false))}>
                <button
                  type="button"
                  className="s-nav__link"
                  aria-expanded={about}
                  aria-controls="s-mega-about"
                  aria-current={ABOUT_COLS.some(c => c.items.some(x => active(x.href))) ? 'page' : undefined}
                  onClick={() => setAbout(v => !v)}
                >
                  <S data={data} k="nav.about" def="Về chúng tôi" label="Menu: Về chúng tôi" /> <ChevronDown aria-hidden="true" />
                </button>
                <div className="s-mega s-mega--cols s-mega--about" id="s-mega-about">
                  <div className="s-mega__cols">
                    {ABOUT_COLS.map((col, ci) => (
                      <div key={col.title} className="s-mega__col">
                        <p className="s-mega__head"><span className="s-mega__no">{String(ci + 1).padStart(2, '0')}</span>{(() => { const t = ct(data, `shell.about.cols.${ci}.title`, col.title, 'Tên cột menu', { scope: 'global' }), u = ct(data, `shell.about.cols.${ci}.sub`, col.sub, 'Dòng phụ cột menu', { scope: 'global' }); return <span><span {...t.a}>{t.v}</span><small {...u.a}>{u.v}</small></span>; })()}</p>
                        <ul>
                          {col.items.map(it => { const k = it.href.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home'; const l = ct(data, `shell.about.items.${k}.label`, it.label, 'Tên mục menu', { scope: 'global' }), d = ct(data, `shell.about.items.${k}.desc`, it.desc, 'Mô tả mục menu', { scope: 'global' }); return <li key={it.href}><MenuItem it={{ ...it, label: l.v, desc: d.v }} onPick={() => setAbout(false)} cms={{ label: l.a, desc: d.a }} /></li>; })}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="s-mega__foot">
                    <span className="s-mega__slogan"><S data={data} k="about.foot" def="Cùng bạn phát triển." label="Câu chân menu" /></span>
                    <Link className="s-mega__cta" href="/ve-danava/" onClick={() => setAbout(false)}><S data={data} k="about.cta" def="Tìm hiểu về DANAVA" label="Nút chân menu" /> <ArrowRight aria-hidden="true" /></Link>
                  </div>
                </div>
              </li>
              <li className="s-nav__item">
                <Link className="s-nav__link" href="/lien-he/" aria-current={active('/lien-he/') ? 'page' : undefined}><S data={data} k="nav.contact" def="Liên hệ" label="Menu: Liên hệ" /></Link>
              </li>
            </ul>
          </nav>

          <div className="s-header__actions">
            <LangSwitch />
            <LangSwitch variant="flags" />
            <Link className="s-btn s-btn--primary s-btn--sm" href="/lien-he/#dang-ky-tu-van"><S data={data} k="nav.cta" def="Nhận tư vấn" label="Nút đầu trang" /></Link>
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
  const footerCols = block(data, 'footer').columns;
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;
  const { socials, instagram } = contactChannels(data);

  return (
    <footer className="s-footer" {...cmsBlock('Chân trang', 'site-footer', { panel: 'site', scope: 'global' })}>
      <div className="s-container">
        <div className="s-footer__top">
          <div className="s-footer__brand">
            <Link className="s-logo" href="/" aria-label="DANAVA Solutions — Trang chủ">
              <img src="/assets/danava-logo-light.png" alt="DANAVA Solutions" width={554} height={135} />
            </Link>
            <p><S data={data} k="footer.intro" def="Công nghệ tạo khả năng, con người tạo giá trị. DANAVA đồng hành cùng doanh nghiệp bằng phần mềm quản lý, truyền thông và trải nghiệm." label="Giới thiệu chân trang" /></p>
            <div className="s-footer__contact">
              <a href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
              <a href={`mailto:${email}`}><Mail aria-hidden="true" /><span {...cmsText('site.email', 'Email liên hệ', { scope: 'global' })}>{email}</span></a>
              <a href={co.mapUrl} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" /><span {...cmsText('block.company.address', 'Địa chỉ (chân trang, trang Liên hệ)', { scope: 'global' })}>{co.address}</span></a>
            </div>
            {/* Zalo, Messenger, Hotline nằm ở cột nút nổi mép phải (ContactDock), không lặp lại ở đây */}
            {(instagram || socials.some(s => s.key !== 'zalo')) && (
              <ul className="s-footer__social" aria-label="Mạng xã hội của DANAVA">
                {socials.filter(s => s.key !== 'zalo').map(s => (
                  <li key={s.key}>
                    <a className={`soc soc--${s.key}`} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name} aria-label={`${s.name} của DANAVA (mở tab mới)`}><BrandIcon name={s.key} /></a>
                  </li>
                ))}
                {instagram && (
                  <li>
                    <a className="soc soc--instagram" href={instagram} target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram của DANAVA (mở tab mới)"><BrandIcon name="instagram" /></a>
                  </li>
                )}
              </ul>
            )}
          </div>

          {footerCols.map((col, ci) => (
            <div key={ci}>
              <p className="s-footer__title">{col.titleKey ? <S data={data} k={col.titleKey} def={col.title} label="Tiêu đề cột" /> : <span {...cmsText(`block.footer.columns.${ci}.title`, 'Tiêu đề cột', { scope: 'global' })}>{col.title}</span>}</p>
              <ul className="s-footer__list">
                {col.auto === 'services' && services.map(s => <li key={s.id}><Link href={`/giai-phap/${s.slug}/`}><span {...cmsText(`rec.services.${s.id}.title`, 'Tên sản phẩm', { scope: 'record', scopeLabel: `Hồ sơ ${s.title}` })}>{s.title}</span></Link></li>)}
                {col.items.map((it, ii) => {
                  if (!it.visible) return null;
                  const label = it.key ? <S data={data} k={it.key} def={it.label} label="Liên kết chân trang" /> : <span {...cmsText(`block.footer.columns.${ci}.items.${ii}.label`, 'Liên kết chân trang', { scope: 'global' })}>{it.label}</span>;
                  return <li key={ii}>{/^(https?:|mailto:|tel:)/.test(it.href) ? <a href={it.href} {...(/^https?:/.test(it.href) ? { target: '_blank', rel: 'noopener' } : {})}>{label}</a> : <Link href={it.href}>{label}</Link>}</li>;
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="s-footer__bottom">
          <span>© {new Date().getFullYear()} <S data={data} k="footer.copyright" def="DANAVA Solutions. Bảo lưu mọi quyền." label="Bản quyền" /></span>
          <div className="s-footer__legal">
            <Link href="/chinh-sach-dich-vu/"><S data={data} k="footer.terms" def="Điều khoản dịch vụ" label="Liên kết chân trang" /></Link>
            <Link href="/chinh-sach-rieng-tu/"><S data={data} k="footer.privacy" def="Quyền riêng tư" label="Liên kết chân trang" /></Link>
            {/* Link thường (không phải <Link>) để CMS tải lại toàn trang với stylesheet riêng */}
            <a href="/admin/" rel="nofollow"><S data={data} k="footer.admin" def="Quản trị" label="Liên kết chân trang" /></a>
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
  { href: '/blogs/', label: 'Blogs', icon: Newspaper, match: (p: string) => p.startsWith('/blogs') }
];

/**
 * Thanh tab cố định dưới đáy màn hình (điện thoại, máy tính bảng dọc) — điều hướng kiểu ứng dụng:
 * luôn hiện, vùng bấm lớn trong tầm ngón cái, nút "Tư vấn" nổi ở giữa mở bảng kênh liên hệ. Bấm lại tab đang mở để cuộn lên đầu.
 */
export function MobileBar() {
  const path = usePathname() || '/';
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);
  const { data } = useSite();
  useEffect(() => { setSheet(false); }, [path]);
  return (
    <>
      <nav className="s-tabbar" aria-label="Điều hướng nhanh">
        {TABS.map(t => {
          const on = t.match(path);
          const Icon = t.icon;
          // Khóa ổn định theo đường dẫn: home, giai-phap, lien-he, du-an, blogs
          const id = t.href === '/' ? 'home' : t.href.split('/')[1] || 'tab';
          const x = ct(data, `shell.tabbar.${id}`, t.label, 'Nhãn thanh tab điện thoại', { scope: 'global' });
          const body = (
            <>
              <span className="s-tabbar__icon"><Icon aria-hidden="true" /></span>
              <span className="s-tabbar__label" {...x.a}>{x.v}</span>
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
