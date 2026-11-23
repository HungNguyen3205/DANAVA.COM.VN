'use client';
/**
 * Menu điện thoại kiểu ứng dụng: bảng phủ toàn màn hình, nhóm đánh số, danh sách thoáng có icon.
 * Yêu cầu khách hàng: KHÔNG chia thành ô/thẻ, không viền quanh mục.
 * Nhóm và mục lấy từ CMS (Menu Giải pháp); các trang chính không có trong nhóm được liệt kê ở "Khám phá".
 */
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, FolderKanban, Home, Info, LayoutGrid, MessageCircle, Network, Newspaper, Phone, Users, X, type LucideIcon } from 'lucide-react';
import { MayFigure } from './anna/MayFigure';
import { useSite } from '../SiteStore';
import { block, safeHref } from '@/lib/blocks';
import { contactChannels } from '@/lib/contact-channels';
import { CONTACT, formatPhone } from './catalog';
import { DICH_VU } from '@/lib/dich-vu';
import { CalendarDays, Megaphone, MonitorSmartphone, Plane } from 'lucide-react';

/** Icon cho từng dịch vụ (theo thứ tự trong DICH_VU) */
const DV_ICON: LucideIcon[] = [Megaphone, MonitorSmartphone, CalendarDays, Plane];
import { iconFor } from './icons';
import { useDialog } from './useDialog';
import { useAnna } from './anna/AnnaProvider';

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
        <button type="button" className="s-burger s-burger--close" onClick={onClose} aria-label="Đóng menu" data-autofocus>
          <X aria-hidden="true" /><span>ĐÓNG</span>
        </button>
      </div>

      <div className="sm__scroll" data-scroll-top>
        <nav aria-label="Menu chính">
          <Link className="sm__row sm__row--home" href="/" onClick={onClose} aria-current={current('/')}>
            <Home className="sm__icon" aria-hidden="true" /><span className="sm__label">Trang chủ</span>
          </Link>

          {menu.columns.map((column, index) => (
            <section key={index} className="sm__group" style={{ ['--i' as string]: index }} aria-labelledby={`sm-group-${index}`}>
              <h2 className="sm__title" id={`sm-group-${index}`}>
                <span className="sm__no">{String(index + 1).padStart(2, '0')}.</span>{groupTitle(column.title)}
              </h2>
              <ul>
                {column.items.map((item, i) => {
                  const [Icon, tone] = iconFor(item.href);
                  const external = item.href.startsWith('https://');
                  const content = (
                    <>
                      <Icon className={`sm__icon sm__icon--${tone}`} aria-hidden="true" strokeWidth={1.8} />
                      <span className="sm__label">{item.label}</span>
                      {item.badge && <span className="sm__badge">{item.badge}</span>}
                      {external && <><ArrowUpRight className="sm__out" aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></>}
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

          <section className="sm__group sm__group--more" style={{ ['--i' as string]: menu.columns.length }} aria-labelledby="sm-group-services">
            <h2 className="sm__subtitle" id="sm-group-services">Dịch vụ</h2>
            <ul>
              {DICH_VU.map((s, i) => {
                const Icon = DV_ICON[i % DV_ICON.length];
                return (
                  <li key={s.id}>
                    <Link className="sm__row sm__row--page" href={`/dich-vu/${s.slug}/`} onClick={onClose} aria-current={current(`/dich-vu/${s.slug}/`)}>
                      <Icon className="sm__icon" aria-hidden="true" strokeWidth={1.8} /><span className="sm__label">{s.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="sm__group sm__group--more" style={{ ['--i' as string]: menu.columns.length }} aria-labelledby="sm-group-about">
            <h2 className="sm__subtitle" id="sm-group-about">Về chúng tôi</h2>
            <ul>
              {ABOUT_PAGES.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link className="sm__row sm__row--page" href={href} onClick={onClose} aria-current={current(href)}>
                    <Icon className="sm__icon" aria-hidden="true" strokeWidth={1.8} /><span className="sm__label">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="sm__group sm__group--more" style={{ ['--i' as string]: menu.columns.length }} aria-labelledby="sm-group-more">
            <h2 className="sm__subtitle" id="sm-group-more">Khám phá</h2>
            <ul>
              {PAGES.filter(p => !inGroups.has(p.href)).map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link className="sm__row sm__row--page" href={href} onClick={onClose} aria-current={current(href)}>
                    <Icon className="sm__icon" aria-hidden="true" strokeWidth={1.8} /><span className="sm__label">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </nav>

        <div className="sm__end">
          {anna.enabled && (
            <button type="button" className="sm__row sm__anna" onClick={() => { onClose(); anna.ask(); }}>
              <MayFigure className="sm__icon sm__may" /><span className="sm__label">Hỏi trợ lý AI ANNA</span>
            </button>
          )}
          <Link className="sm__cta" href="/lien-he/#dang-ky-tu-van" onClick={onClose}>Nhận tư vấn <ArrowRight aria-hidden="true" /></Link>
          {channels.tel && <a className="sm__call" href={channels.tel} onClick={onClose}><Phone aria-hidden="true" />Gọi {formatPhone(channels.phone)}</a>}
          <p>{data.email || CONTACT.email}<br />{company.address}</p>
        </div>
      </div>
    </dialog>
  );
}
