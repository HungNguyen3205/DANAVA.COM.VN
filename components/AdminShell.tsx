'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight, Bell, Briefcase, Check, ChevronDown, ChevronRight, ExternalLink, FileText, Globe, Image as ImageIcon,
  Inbox, Layers, LayoutGrid, LogOut, Menu, PanelLeftClose, PanelLeftOpen, PanelsTopLeft, Presentation, Save,
  Search, Settings, TrendingUp, Undo2, Users, X, ChartColumn, FolderOpen, Wrench, GalleryHorizontalEnd, FolderTree, Handshake, Building2, Type, Info, Network, IdCard, ScrollText, type LucideIcon,
} from 'lucide-react';
import { AdminNavRail, type RailSection } from './AdminNavRail';
import { adminNav, adminSettings, allAdminItems, sectionInfo, timeAgo, csrfToken, type AdminLead } from './adminData';

/* Khung quản trị theo hệ thống DriveAdmin (DatVeXeONL): thanh bên navy bo góc với nhóm menu gập được,
   thu gọn thành dải icon có danh sách nổi; topbar gồm tiêu đề trang + breadcrumb, ô "Đi tới trang…",
   chuông thông báo và menu tài khoản; vùng nội dung nền sáng, khối trắng bo góc. */

type Props = {
  section: string;
  dirty: boolean;
  ready: boolean;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
  notice: string;
  error: string;
  onDismissNotice: () => void;
  leads: AdminLead[];
  counts: Record<string, number | undefined>;
  heading?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

const ICONS: Record<string, LucideIcon> = {
  'tong-quan': LayoutGrid,
  'khach-hang': Inbox,
  'thong-ke': ChartColumn,
  'trang-chu': PanelsTopLeft,
  'trinh-chieu': Presentation,
  'bai-viet': FileText,
  'du-an': Briefcase,
  'trung-bay': GalleryHorizontalEnd,
  'chu-de': FolderTree,
  'bang-chung': Handshake,
  'cong-ty': Building2,
  'menu-giai-phap': PanelsTopLeft,
  'chu-tren-trang': Type,
  've-danava': Info,
  'he-sinh-thai': Network,
  'ho-so-nhan-su': IdCard,
  'chinh-sach': ScrollText,
  'giai-phap': Layers,
  'so-lieu': TrendingUp,
  'thu-vien': ImageIcon,
  'nhan-su': Users,
  'cai-dat': Settings,
};
const GROUP_ICONS: Record<string, LucideIcon> = { 'Tổng quan': LayoutGrid, 'Nội dung': FileText, 'Trang & thông tin': Building2, 'Tư liệu': FolderOpen, 'Hệ thống': Wrench };

/** Menu: các nhóm của adminNav + nhóm "Hệ thống" chứa Cài đặt (để dải icon thu gọn cũng có). */
const SECTIONS = [...adminNav, { group: 'Hệ thống', items: [adminSettings] }];

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

/* Gõ không dấu cũng tìm được */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

export default function AdminShell({
  section,
  dirty,
  ready,
  saving,
  onSave,
  onDiscard,
  notice,
  error,
  onDismissNotice,
  leads,
  counts,
  heading,
  actions,
  children,
}: Props) {
  const router = useRouter();
  const info = sectionInfo(section);
  const [collapsed, setCollapsed] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (read('danava-admin-collapsed') === '1') setCollapsed(true);
  }, []);

  // Phím tắt: Ctrl/⌘ + K tới ô "Đi tới trang…", Ctrl/⌘ + S lưu, Esc đóng menu/thông báo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && dirty) {
        e.preventDefault();
        onSave();
      }
      if (e.key === 'Escape') {
        setBellOpen(false);
        setSideOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, onSave]);

  // Bấm ra ngoài thì đóng thông báo
  useEffect(() => {
    if (!bellOpen) return;
    const down = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [bellOpen]);

  // Ngăn kéo điện thoại mở thì khóa cuộn trang phía sau
  useEffect(() => {
    if (!sideOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sideOpen]);

  // Thông báo tự ẩn sau 6 giây
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(onDismissNotice, 6000);
    return () => clearTimeout(t);
  }, [notice, onDismissNotice]);

  const newLeads = leads.filter(l => (l.status || 'new') === 'new');

  function leave() {
    if (dirty && !confirm('Bạn có thay đổi chưa lưu. Rời màn hình này?')) return false;
    setSideOpen(false);
    setBellOpen(false);
    setQuery('');
    return true;
  }
  function navigate(slug: string) {
    if (leave()) router.push(`/admin/${slug}/`);
  }

  async function logout() {
    if (dirty && !confirm('Bạn có thay đổi chưa lưu. Vẫn đăng xuất?')) return;
    await fetch('/api/admin/session/', { method: 'DELETE', headers: { 'x-csrf-token': await csrfToken() } });
    location.reload();
  }

  const toggleCollapsed = () =>
    setCollapsed(v => {
      write('danava-admin-collapsed', v ? '0' : '1');
      return !v;
    });

  const railSections: RailSection[] = SECTIONS.map(g => ({
    group: g.group,
    icon: GROUP_ICONS[g.group] || LayoutGrid,
    items: g.items.map(i => ({
      slug: i.slug,
      label: i.label,
      icon: ICONS[i.slug] || FileText,
      count: i.slug === 'khach-hang' ? counts[i.slug] : undefined,
    })),
  }));

  const words = fold(query).split(/\s+/).filter(Boolean);
  const hits = words.length
    ? allAdminItems.filter(i => {
        const hay = fold(`${i.label} ${i.group} ${i.desc}`);
        return words.every(w => hay.includes(w));
      }).slice(0, 8)
    : [];

  return (
    <div className="adm ds-root" data-theme="light">
      {sideOpen && <div className="ds-sidebar-backdrop" onClick={() => setSideOpen(false)} aria-hidden="true" />}

      {/* ---------- Thanh bên ---------- */}
      <aside className={'ds-sidebar' + (sideOpen ? ' open' : '') + (collapsed ? ' collapsed' : '')} aria-label="Menu quản trị">
        <div className="ds-sidebar-header-row">
          <Link
            className="ds-wordmark"
            href="/admin/tong-quan/"
            title="DANAVA · Quản trị website"
            onClick={e => {
              if (!leave()) e.preventDefault();
            }}
          >
            <img src="/assets/danava-mark.png" alt="" className="ds-brand-mark" width={158} height={158} />
            <span className="ds-brand-text">
              <strong>DANAVA</strong>
              <small>Quản trị website</small>
            </span>
          </Link>
          <button
            type="button"
            className="ds-rail-toggle"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button type="button" className="ds-sidebar-close-btn" onClick={() => setSideOpen(false)} aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>

        <div className="ds-workspace">
          <div className="ws-trigger ws-trigger--static">
            <span className="ws-avatar">D</span>
            <span className="ws-trigger-text">
              <small>Đang quản lý</small>
              <strong>danava.com.vn</strong>
            </span>
          </div>
        </div>

        <AdminNavRail sections={railSections} active={section} onNavigate={navigate} />

        <nav className="ds-nav-full" aria-label="Quản trị DANAVA">
          {SECTIONS.map(g => (
            <details key={g.group} className="ds-nav-group" open>
              <summary>
                <span>{g.group}</span>
                <ChevronRight size={13} />
              </summary>
              <div className="ds-nav-group-items">
                {g.items.map(item => {
                  const Icon = ICONS[item.slug] || FileText;
                  const on = section === item.slug;
                  const count = counts[item.slug];
                  return (
                    <Link
                      key={item.slug}
                      href={`/admin/${item.slug}/`}
                      className={on ? 'active' : undefined}
                      aria-current={on ? 'page' : undefined}
                      title={item.label}
                      onClick={e => {
                        if (!leave()) e.preventDefault();
                      }}
                    >
                      <span className="ds-nav-icon-badge">
                        <Icon size={16} />
                      </span>
                      <span className="ds-nav-label">{item.label}</span>
                      {count !== undefined && count > 0 && (
                        <span className={'ds-count' + (item.slug === 'khach-hang' ? ' is-hot' : '')}>{count}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </details>
          ))}
        </nav>

        <div className="ds-footer-nav">
          <a className="ds-footer-btn" href="/" target="_blank" rel="noopener noreferrer" title="Xem website">
            <Globe size={16} />
            <span>Xem website</span>
            <ExternalLink size={13} className="ds-footer-trail" />
          </a>
        </div>
      </aside>

      {/* ---------- Vùng chính ---------- */}
      <div className={'ds-main' + (collapsed ? ' collapsed' : '')}>
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <div className="ds-topbar-title-row">
              <button type="button" className="ds-mobile-menu" aria-label="Mở menu" aria-expanded={sideOpen} onClick={() => setSideOpen(true)}>
                <Menu size={18} />
              </button>
              {heading ? (
                <p key={section} className="ds-topbar-page-title">{info.label}</p>
              ) : (
                <h1 key={section} className="ds-topbar-page-title">{info.label}</h1>
              )}
            </div>
            <div className="ds-topbar-breadcrumb-wrap" role="navigation" aria-label="Vị trí">
              <span>DANAVA</span>
              <span aria-hidden="true">&gt;</span>
              {info.group !== info.label && (
                <>
                  <span>{info.group}</span>
                  <span aria-hidden="true">&gt;</span>
                </>
              )}
              <span className="current">{info.label}</span>
            </div>
          </div>

          <div className="ds-topbar-right">
            <div className="ds-topbar-search-pill">
              <Search size={15} />
              <input
                ref={searchRef}
                aria-label="Đi tới trang (Ctrl + K)"
                placeholder="Đi tới trang…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setQuery('');
                  if (e.key === 'Enter' && hits[0]) navigate(hits[0].slug);
                }}
              />
              {query.trim() && (
                <div className="ds-search-popover-results">
                  {hits.length ? (
                    hits.map(n => (
                      <button key={n.slug} type="button" onClick={() => navigate(n.slug)}>
                        <span className="ds-search-hit">
                          <b>{n.label}</b>
                          <small>{n.group}</small>
                        </span>
                        <ArrowUpRight size={13} />
                      </button>
                    ))
                  ) : (
                    <p className="ds-search-empty">
                      Không tìm thấy trang nào cho “{query.trim()}”. Thử gõ: bài viết, khách hàng, dự án, ảnh…
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="ds-bell" ref={bellRef}>
              <button
                type="button"
                className="ds-topbar-bell-btn"
                aria-label={`Thông báo: ${newLeads.length} khách hàng mới`}
                aria-expanded={bellOpen}
                onClick={() => setBellOpen(v => !v)}
              >
                <Bell size={18} />
                {newLeads.length > 0 && <span className="ds-bell-dot-indicator" />}
              </button>
              {bellOpen && (
                <div className="ds-bell-pop" role="dialog" aria-label="Khách hàng mới">
                  <h4>
                    Khách hàng mới <span>{newLeads.length}</span>
                  </h4>
                  {newLeads.length === 0 && <p className="ds-bell-empty">Không có yêu cầu mới. Mọi khách hàng đã được xử lý.</p>}
                  {newLeads.slice(0, 5).map(l => (
                    <Link
                      key={l.id}
                      href="/admin/khach-hang/"
                      className="ds-bell-item"
                      onClick={e => {
                        if (!leave()) e.preventDefault();
                      }}
                    >
                      <span className="ds-bell-avatar">{initials(l.name)}</span>
                      <span>
                        <b>{l.name}</b>
                        <small>
                          {l.service || 'Tư vấn chung'} · {timeAgo(l.created_at)}
                        </small>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/admin/khach-hang/"
                    className="ds-bell-foot"
                    onClick={e => {
                      if (!leave()) e.preventDefault();
                    }}
                  >
                    Xem tất cả khách hàng <ArrowUpRight size={13} />
                  </Link>
                </div>
              )}
            </div>

            <button type="button" className="ds-save-btn" onClick={onSave} disabled={!ready || !dirty || saving}>
              {dirty ? <Save size={16} /> : <Check size={16} />}
              <span>{saving ? 'Đang lưu…' : dirty ? 'Lưu thay đổi' : 'Đã lưu'}</span>
            </button>

            <AccountMenu onLogout={logout} onSettings={() => navigate('cai-dat')} />
          </div>
        </header>

        <main id="main" className="ds-content" key={section}>
          {(heading || actions || info.desc) && (
            <div className="ds-page-head">
              <div className="ds-page-head-text">{heading || <p>{info.desc}</p>}</div>
              {actions && <div className="ds-page-head-actions">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* ---------- Thanh thay đổi chưa lưu ---------- */}
      <div className={`adm-savebar ${dirty ? 'is-visible' : ''}`} role="region" aria-label="Thay đổi chưa lưu" aria-hidden={!dirty}>
        <span className="adm-savebar-dot" aria-hidden="true" />
        <span>Bạn có thay đổi chưa lưu</span>
        <button className="adm-btn adm-btn-ghost" onClick={onDiscard} tabIndex={dirty ? 0 : -1}>
          <Undo2 size={16} /> Hoàn tác
        </button>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={saving} tabIndex={dirty ? 0 : -1}>
          <Save size={16} /> {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* ---------- Thông báo ---------- */}
      {(notice || error) && (
        <div className={`adm-toast ${error ? 'is-error' : ''}`} role="status">
          {error ? <X size={18} /> : <Check size={18} />}
          <span>{error || notice}</span>
          <button className="adm-icon-btn" aria-label="Đóng thông báo" onClick={onDismissNotice}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/** Nút tài khoản góc phải: ai đang đăng nhập, lối tắt và Đăng xuất. */
function AccountMenu({ onLogout, onSettings }: { onLogout: () => void; onSettings: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  return (
    <div className="am" ref={ref}>
      <button type="button" className="ds-topbar-user-profile am-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="ds-topbar-user-avatar">QT</span>
        <span className="ds-topbar-user-meta">
          <span className="ds-topbar-user-name">Quản trị viên</span>
          <span className="ds-topbar-user-role">Quản trị website</span>
        </span>
        <ChevronDown size={14} className="ds-topbar-user-chevron" />
      </button>
      {open && (
        <div className="am-pop" role="menu" aria-label="Tài khoản">
          <div className="am-card">
            <div className="am-avatar">QT</div>
            <div>
              <strong>Quản trị viên</strong>
              <span>Quản trị website</span>
              <small>Phiên bảo mật · 8 giờ</small>
            </div>
          </div>
          <p className="am-where">
            <Globe size={15} /> Đang quản lý <b>danava.com.vn</b>
          </p>
          <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <ExternalLink size={17} /> Xem website
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSettings();
            }}
          >
            <Settings size={17} /> Cài đặt
          </button>
          <div className="am-sep" />
          <button
            type="button"
            role="menuitem"
            className="am-logout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut size={17} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}
