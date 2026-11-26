'use client';
/**
 * Menu điện thoại kiểu ứng dụng: bảng phủ toàn màn hình, nhóm đánh số, danh sách thoáng có icon.
 * Yêu cầu khách hàng: KHÔNG chia thành ô/thẻ, không viền quanh mục.
 * Nhóm và mục lấy từ CMS (Menu Giải pháp); các trang chính không có trong nhóm được liệt kê ở "Khám phá".
 */
import Link from 'next/link';
import { useEffect } from 'react';
import { AppWindow, ArrowRight, ArrowUpRight, Box, BriefcaseBusiness, Calculator, ChevronRight, Dumbbell, FolderKanban, Globe, Home, Info, LayoutGrid, LayoutTemplate, MessageCircle, Network, Newspaper, PartyPopper, Phone, Plane, Ticket, Users, Warehouse, X, type LucideIcon } from 'lucide-react';
import { MayFigure } from './anna/MayFigure';
import { useSite } from '../SiteStore';
import { block, safeHref } from '@/lib/blocks';
import { contactChannels } from '@/lib/contact-channels';
import { CONTACT, formatPhone } from './catalog';
import { SERVICE_MENU, type ServiceMenuItem } from '@/lib/services-menu';

const SVC_ICON: Record<NonNullable<ServiceMenuItem['icon']>, LucideIcon> = { quote: Calculator, web: Globe, portfolio: LayoutTemplate, event: Ticket, party: PartyPopper, travel: Plane, cube: Box, gym: Warehouse, dumbbell: Dumbbell, app: AppWindow };
const GROUP_ICON = { landing: Globe, event: PartyPopper, gym: Dumbbell } as const;

import { iconFor } from './icons';
import { useDialog } from './useDialog';
import { useAnna } from './anna/AnnaProvider';
import { cmsText, ct } from './cms';
import { txt } from '@/lib/site-text';

const PAGES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/giai-phap/', label: 'Tất cả giải pháp', icon: LayoutGrid },
  { href: '/he-sinh-thai/', label: 'Hệ sinh thái', icon: Network },
  { href: '/doi-ngu/', label: 'Đội ngũ', icon: Users },
  { href: '/lien-he/', label: 'Liên hệ', icon: MessageCircle }
];

/** Nhóm "Về chúng tôi" (gom Dự án, Blogs, Tuyển dụng như menu máy tính) */
const ABOUT_PAGES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/ve-danava/', label: 'Về DANAVA', icon: Info },
  { href: '/du-an/', label: 'Dự án', icon: FolderKanban },
  { href: '/blogs/', label: 'Blogs', icon: Newspaper },
  { href: '/tuyen-dung/', label: 'Tuyển dụng', icon: BriefcaseBusiness }
];

/** Khách yêu cầu "01. VẬN HÀNH"; menu máy tính vẫn giữ "Vận hành DANAVA". */
const groupTitle = (title: string) => (title === 'Vận hành DANAVA' ? 'Vận hành' : title);

export function MobileMenu({ open, onClose, path }: { open: boolean; onClose: () => void; path: string }) {
  const { data } = useSite();
  const ref = useDialog(open, onClose);
  const menu = block(data, 'menu');
  const company = block(data, 'company');
  const channels = contactChannels(data);
  const anna = useAnna();
  // Chữ cố định của menu điện thoại (khóa shell.mobile.*, dùng chung toàn website)
  const m = (k: string, def: string, label: string) => ct(data, `shell.mobile.${k}`, def, label, { scope: 'global' });
  const slug = (href: string) => href.split('/').filter(Boolean)[0] || 'home';
  const newTab = txt(data, 'shell.mobile.new-tab', ' (mở tab mới)');
  const close = m('close', 'ĐÓNG', 'Nút đóng menu điện thoại');
  const home = m('home', 'Trang chủ', 'Mục Trang chủ (menu điện thoại)');
  const tServices = m('groups.services', 'Dịch vụ', 'Tên nhóm (menu điện thoại)');
  const tAbout = m('groups.about', 'Về chúng tôi', 'Tên nhóm (menu điện thoại)');
  const tMore = m('groups.more', 'Khám phá', 'Tên nhóm (menu điện thoại)');
  const tAnna = m('anna', 'Hỏi trợ lý AI ANNA', 'Nút hỏi ANNA (menu điện thoại)');
  const tCta = m('cta', 'Nhận tư vấn', 'Nút tư vấn (menu điện thoại)');
  const tCall = m('call', 'Gọi', 'Chữ trước số điện thoại (menu điện thoại)');
  const inGroups = new Set(menu.columns.flatMap(c => c.items.map(i => i.href)));
  const current = (href: string) => {
    const here = href === '/giai-phap/' || href === '/' ? path === href : href.startsWith('/') && path.startsWith(href);
    return here ? ('page' as const) : undefined;
  };

  // Xoay ngang / mở rộng cửa sổ sang giao diện máy tính → đóng
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia('(min-width: 1081px)');
    const close = () => { if (wide.matches) onClose(); };
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, [open, onClose]);

  return (
    <dialog ref={ref} id="s-menu" className="sm" aria-label="Menu">
      <div className="sm__bar">
        <Link className="sm__logo" href="/" onClick={onClose} aria-label="DANAVA Solutions — Trang chủ">
          <img src="/assets/danava-logo-trim.png" alt="DANAVA Solutions" width={554} height={135} />
        </Link>
        <button type="button" className="s-burger s-burger--close" onClick={onClose} aria-label={txt(data, 'shell.mobile.close-aria', 'Đóng menu')} data-autofocus>
          <X aria-hidden="true" /><span {...close.a}>{close.v}</span>
        </button>
      </div>

      <div className="sm__scroll" data-scroll-top>
        <nav aria-label="Menu chính">
          <Link className="sm__row sm__row--home" href="/" onClick={onClose} aria-current={current('/')}>
            <Home className="sm__icon" aria-hidden="true" /><span className="sm__label" {...home.a}>{home.v}</span>
          </Link>

          {menu.columns.map((column, index) => (
            <section key={index} className="sm__group" style={{ ['--i' as string]: index }} aria-labelledby={`sm-group-${index}`}>
              <h2 className="sm__title" id={`sm-group-${index}`}>
                <span className="sm__no">{String(index + 1).padStart(2, '0')}.</span><span style={{ display: 'inline' }} {...cmsText(`block.menu.columns.${index}.title`, 'Tên cột menu', { scope: 'global' })}>{groupTitle(column.title)}</span>
              </h2>
              <ul>
                {column.items.map((item, i) => {
                  const [Icon, tone] = iconFor(item.href);
                  const external = item.href.startsWith('https://');
                  const content = (
                    <>
                      <Icon className={`sm__icon sm__icon--${tone}`} aria-hidden="true" strokeWidth={1.8} />
                      <span className="sm__label" {...cmsText(`block.menu.columns.${index}.items.${i}.label`, 'Tên mục menu', { scope: 'global' })}>{item.label}</span>
                      {item.badge && <span className="sm__badge" {...cmsText(`block.menu.columns.${index}.items.${i}.badge`, 'Nhãn mục menu', { scope: 'global' })}>{item.badge}</span>}
                      {external && <><ArrowUpRight className="sm__out" aria-hidden="true" /><span className="s-sr">{newTab}</span></>}
                    </>
                  );
                  return (
                    <li key={i}>
                      {!item.href || !safeHref(item.href) ? <span className="sm__row">{content}</span>
                        : external ? <a className="sm__row" href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClose}>{content}</a>
                          : <Link className="sm__row" href={item.href} onClick={onClose} aria-current={current(item.href)}>{content}</Link>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {/* Dịch vụ: mỗi nhóm báo giá một nhóm nhỏ (lib/services-menu.ts) */}
          {/* Chữ dùng chung khóa với menu Dịch vụ trên máy tính (nav.svc.*) → có bản dịch EN/JA; tên ngắn: nav.svc.<nhóm>.<mục>.short */}
          {SERVICE_MENU.map(g => { const GI = GROUP_ICON[g.icon]; const gl = ct(data, `nav.svc.${g.id}.label`, g.label, 'Menu Dịch vụ: tên nhóm', { scope: 'global' }); return (
            <section key={g.id} className="sm__group sm__group--more sm__svcgroup" style={{ ['--i' as string]: menu.columns.length }} aria-labelledby={`sm-svc-${g.id}`}>
              <h2 className="sm__subtitle sm__svchead" id={`sm-svc-${g.id}`}><GI aria-hidden="true" strokeWidth={2} /><span {...gl.a}>{gl.v}</span></h2>
              <ul className="sm__svc">
                {g.items.map(it => { const Icon = it.icon ? SVC_ICON[it.icon] : ChevronRight; const full = txt(data, `nav.svc.${g.id}.${it.id}.label`, it.label); const s = it.short ? ct(data, `nav.svc.${g.id}.${it.id}.short`, it.short, 'Menu Dịch vụ: tên ngắn (điện thoại)', { scope: 'global' }) : ct(data, `nav.svc.${g.id}.${it.id}.label`, it.label, 'Menu Dịch vụ: tên mục', { scope: 'global' }); return (
                  <li key={it.id}>
                    <Link className="sm__tile" href={it.href} onClick={onClose} aria-current={current(it.href)} title={full}>
                      <span className="sm__tileicon"><Icon aria-hidden="true" strokeWidth={1.9} /></span>
                      <span className="sm__tilelabel" {...s.a}>{s.v}</span>
                      {it.badge ? (() => { const b = ct(data, `nav.svc.${g.id}.${it.id}.badge`, it.badge, 'Menu Dịch vụ: nhãn nổi bật', { scope: 'global' }); return <small className="sm__tilebadge" {...b.a}>{b.v}</small>; })() : null}
                    </Link>
                  </li>
                ); })}
              </ul>
            </section>
          ); })}

          <section className="sm__group sm__group--more" style={{ ['--i' as string]: menu.columns.length }} aria-labelledby="sm-group-about">
            <h2 className="sm__subtitle" id="sm-group-about" {...tAbout.a}>{tAbout.v}</h2>
            <ul>
              {ABOUT_PAGES.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link className="sm__row sm__row--page" href={href} onClick={onClose} aria-current={current(href)}>
                    <Icon className="sm__icon" aria-hidden="true" strokeWidth={1.8} />{(() => { const x = m(`about.${slug(href)}`, label, 'Mục menu điện thoại'); return <span className="sm__label" {...x.a}>{x.v}</span>; })()}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="sm__group sm__group--more" style={{ ['--i' as string]: menu.columns.length }} aria-labelledby="sm-group-more">
            <h2 className="sm__subtitle" id="sm-group-more" {...tMore.a}>{tMore.v}</h2>
            <ul>
              {PAGES.filter(p => !inGroups.has(p.href)).map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link className="sm__row sm__row--page" href={href} onClick={onClose} aria-current={current(href)}>
                    <Icon className="sm__icon" aria-hidden="true" strokeWidth={1.8} />{(() => { const x = m(`pages.${slug(href)}`, label, 'Mục menu điện thoại'); return <span className="sm__label" {...x.a}>{x.v}</span>; })()}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </nav>

        <div className="sm__end">
          {anna.enabled && (
            <button type="button" className="sm__row sm__anna" onClick={() => { onClose(); anna.ask(); }}>
              <MayFigure className="sm__icon sm__may" /><span className="sm__label" {...tAnna.a}>{tAnna.v}</span>
            </button>
          )}
          <Link className="sm__cta" href="/lien-he/#dang-ky-tu-van" onClick={onClose}><span style={{ display: 'inline' }} {...tCta.a}>{tCta.v}</span> <ArrowRight aria-hidden="true" /></Link>
          {channels.tel && <a className="sm__call" href={channels.tel} onClick={onClose}><Phone aria-hidden="true" /><span style={{ display: 'inline' }} {...tCall.a}>{tCall.v}</span> {formatPhone(channels.phone)}</a>}
          <p>{data.email || CONTACT.email}<br /><span {...cmsText('block.company.address', 'Địa chỉ (chân trang, trang Liên hệ)', { scope: 'global' })}>{company.address}</span></p>
        </div>
      </div>
    </dialog>
  );
}
