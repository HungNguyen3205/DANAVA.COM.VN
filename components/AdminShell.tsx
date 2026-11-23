'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight, Bell, Briefcase, Check, ChevronDown, ChevronRight, ExternalLink, FileText, Globe, Image as ImageIcon,
  Inbox, Layers, LayoutGrid, LogOut, Menu, PanelLeftClose, PanelLeftOpen, PanelsTopLeft, Plus, Save,
  Search, Settings, Undo2, Users, X, ChartColumn, FolderOpen, Wrench, Building2, type LucideIcon,
  Rocket, Navigation, Palette, Blocks, Tags, ContactRound, ClipboardList, PieChart, Gauge, KeyRound, Link2, Plug, History, Package,
} from 'lucide-react';
import { AdminNavRail, type RailSection } from './AdminNavRail';
import { allAdminItems, sectionInfo, timeAgo, csrfToken, visibleNav, type AdminLead } from './adminData';
import { ROLES, can } from '@/lib/permissions';
import { fold, useAdminUser } from './admin/ui';
import type { DraftInfo, SaveMode } from './SiteStore';

/** Bản ghi cho ô tìm kiếm toàn admin. */
export type SearchRecord = { label: string; kind: string; href: string };

/* Khung quản trị theo hệ thống DriveAdmin (DatVeXeONL): thanh bên navy bo góc với nhóm menu gập được,
   thu gọn thành dải icon có danh sách nổi; topbar gồm tiêu đề trang + breadcrumb, ô "Đi tới trang…",
   chuông thông báo và menu tài khoản; vùng nội dung nền sáng, khối trắng bo góc. */

type Props = {
  section: string;
  dirty: boolean;
  ready: boolean;
  saving?: boolean;
  /** 'draft' = lưu nháp phía máy chủ; 'publish' = xuất bản lên website */
  onSave: (mode: SaveMode) => void;
  /** Hoàn tác thay đổi chưa lưu trong trình duyệt */
  onDiscard: () => void;
  /** Bỏ bản nháp đã lưu trên máy chủ */
  onDiscardDraft: () => void;
  draft: DraftInfo;
  notice: string;
  error: string;
  onDismissNotice: () => void;
  leads: AdminLead[];
  records?: SearchRecord[];
  counts: Record<string, number | undefined>;
  /** Thanh tab của màn hình (nếu có) */
  tabs?: ReactNode;
  heading?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

const ICONS: Record<string, LucideIcon> = {
  'tong-quan': LayoutGrid,
  trang: PanelsTopLeft,
  'landing-page': Rocket,
  menu: Navigation,
  'giao-dien': Palette,
  'mau-khoi': Blocks,
  'san-pham': Package,
  'nhom-loai': Tags,
  'bai-viet': FileText,
  'du-an': Briefcase,
  'thuong-hieu': Building2,
  'khach-hang': Inbox,
  'danh-ba': ContactRound,
  'bieu-mau': ClipboardList,
  'thu-vien': ImageIcon,
  'thong-ke': ChartColumn,
  'nguon-khach': PieChart,
  'hieu-qua': Gauge,
  'cai-dat': Settings,
  'tai-khoan': KeyRound,
  seo: Link2,
  'tich-hop': Plug,
  'nhat-ky': History,
};
const GROUP_ICONS: Record<string, LucideIcon> = {
  'Tổng quan': LayoutGrid, Website: Globe, 'Sản phẩm & Dịch vụ': Layers, 'Nội dung': FileText,
  'Khách hàng': Users, 'Tài nguyên': FolderOpen, 'Báo cáo': ChartColumn, 'Hệ thống': Wrench,
};

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

export default function AdminShell({
  section,
  dirty,
  ready,
  saving,
  onSave,
  onDiscard,
  onDiscardDraft,
  draft,
  notice,
  error,
  onDismissNotice,
  leads,
  records = [],
  counts,
  tabs,
  heading,
  actions,
  children,
}: Props) {
  const router = useRouter();
  const user = useAdminUser();
  const info = sectionInfo(section);
  const SECTIONS = visibleNav(user.role);
  const canDraft = can(user.role, 'content.draft');
  const canPublish = can(user.role, 'content.publish');
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);
  // Chỉ các loại đã tạo được thật trong admin
  const creatable = [
    { label: 'Bài viết', href: '/admin/bai-viet/?new=1', show: can(user.role, 'content.draft') },
  ].filter(x => x.show);
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
      // Ctrl/⌘ + S = lưu nháp (an toàn: website chưa đổi). Xuất bản luôn bấm nút.
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && dirty) {
        e.preventDefault();
        onSave('draft');
      }
      if (e.key === 'Escape') {
        setBellOpen(false);
        setSideOpen(false);
        setCreateOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, onSave]);

  // Bấm ra ngoài thì đóng thông báo / menu Tạo mới
  useEffect(() => {
    if (!bellOpen && !createOpen) return;
    const down = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setBellOpen(false);
      if (!createRef.current?.contains(e.target as Node)) setCreateOpen(false);
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [bellOpen, createOpen]);

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
  function go(href: string) {
    if (leave()) router.push(href);
  }

  async function logout() {
    if (dirty && !confirm('Bạn có thay đổi chưa lưu. Vẫn đăng xuất?')) return;
    // 403 = phiên đã hết sẵn → tải lại sẽ về màn đăng nhập. Lỗi khác: phiên vẫn còn, phải báo cho người dùng.
    try {
      const res = await fetch('/api/admin/session/', { method: 'DELETE', headers: { 'x-csrf-token': await csrfToken() } });
      if (res.ok || res.status === 403) return location.reload();
    } catch {}
    alert('CHƯA đăng xuất được, phiên vẫn còn hiệu lực. Kiểm tra kết nối rồi thử lại.');
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
  const visible = new Set(SECTIONS.flatMap(g => g.items.map(i => i.slug)));
  const has = (text: string) => { const hay = fold(text); return words.every(w => hay.includes(w)); };
  const hits: { key: string; label: string; sub: string; href: string }[] = words.length
    ? [
        ...allAdminItems.filter(i => visible.has(i.slug) && has(`${i.label} ${i.group} ${i.desc}`))
          .map(i => ({ key: 'm-' + i.slug, label: i.label, sub: i.group, href: `/admin/${i.slug}/` })),
        ...records.filter(r => has(`${r.label} ${r.kind}`)).map((r, n) => ({ key: `r-${n}-${r.href}`, label: r.label, sub: r.kind, href: r.href })),
      ].slice(0, 10)
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

        <AdminNavRail sections={railSections} active={info.slug} onNavigate={navigate} />

        <nav className="ds-nav-full" aria-label="Quản trị DANAVA">
          {SECTIONS.map(g => (
            // Chỉ mở sẵn nhóm đang dùng; nhóm khác bấm để mở
            <details key={g.group} className="ds-nav-group" open={g.items.some(i => i.slug === info.slug) || undefined}>
              <summary>
                <span>{g.group}</span>
                <ChevronRight size={13} />
              </summary>
              <div className="ds-nav-group-items">
                {g.items.map(item => {
                  const Icon = ICONS[item.slug] || FileText;
                  const on = info.slug === item.slug;
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
                aria-label="Tìm trong admin (Ctrl + K)"
                placeholder="Tìm mục, bài viết, sản phẩm…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setQuery('');
                  if (e.key === 'Enter' && hits[0]) go(hits[0].href);
                }}
              />
              {query.trim() && (
                <div className="ds-search-popover-results">
                  {hits.length ? (
                    hits.map(n => (
                      <button key={n.key} type="button" onClick={() => go(n.href)}>
                        <span className="ds-search-hit">
                          <b>{n.label}</b>
                          <small>{n.sub}</small>
                        </span>
                        <ArrowUpRight size={13} />
                      </button>
                    ))
                  ) : (
                    <p className="ds-search-empty">
                      Không tìm thấy kết quả cho “{query.trim()}”. Thử gõ tên bài viết, sản phẩm, dự án hoặc tên mục.
                    </p>
                  )}
                </div>
              )}
            </div>

            {creatable.length > 0 && (
              <div className="ds-create" ref={createRef}>
                <button type="button" className="adm-btn adm-btn-ghost ds-create-btn" aria-haspopup="menu" aria-expanded={createOpen} onClick={() => setCreateOpen(v => !v)}>
                  <Plus size={16} /> <span>Tạo mới</span>
                </button>
                {createOpen && (
                  <div className="ds-create-pop" role="menu" aria-label="Tạo mới">
                    {creatable.map(c => (
                      <button key={c.href} type="button" role="menuitem" onClick={() => { setCreateOpen(false); go(c.href); }}>{c.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {can(user.role, 'leads.read') && <div className="ds-bell" ref={bellRef}>
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
            </div>}

            {canDraft && (
              <>
                <span className={`ds-save-state is-${saving ? 'saving' : dirty ? 'dirty' : draft.hasDraft ? 'draft' : 'live'}`} role="status">
                  {saving ? 'Đang lưu…' : dirty ? 'Chưa lưu' : draft.hasDraft ? 'Đã lưu nháp' : 'Đã xuất bản'}
                </span>
                <button type="button" className="adm-btn adm-btn-ghost ds-draft-btn" onClick={() => onSave('draft')} disabled={!ready || !dirty || saving} title="Lưu trên máy chủ, website chưa thay đổi (Ctrl + S)">
                  <Save size={16} /> <span>Lưu nháp</span>
                </button>
                {canPublish && (
                  <button type="button" className="ds-save-btn" onClick={() => onSave('publish')} disabled={!ready || (!dirty && !draft.hasDraft) || saving} title="Cập nhật lên website">
                    {dirty || draft.hasDraft ? <Rocket size={16} /> : <Check size={16} />}
                    <span>Xuất bản</span>
                  </button>
                )}
              </>
            )}

            <AccountMenu onLogout={logout} onSettings={can(user.role, 'system.manage') ? () => navigate('cai-dat') : undefined} />
          </div>
        </header>

        <main id="main" className="ds-content" key={section}>
          {(heading || actions || info.desc) && (
            <div className="ds-page-head">
              <div className="ds-page-head-text">{heading || <p>{info.desc}</p>}</div>
              {actions && <div className="ds-page-head-actions">{actions}</div>}
            </div>
          )}
          {tabs}
          {children}
        </main>
      </div>

      {/* ---------- Thanh thay đổi chưa lưu / bản nháp chưa xuất bản ---------- */}
      <div className={`adm-savebar ${dirty || (canDraft && draft.hasDraft) ? 'is-visible' : ''}${!dirty && draft.hasDraft ? ' is-draft' : ''}`} role="region" aria-label="Trạng thái lưu" aria-hidden={!dirty && !draft.hasDraft}>
        <span className="adm-savebar-dot" aria-hidden="true" />
        {dirty ? (
          <span>Bạn có thay đổi chưa lưu</span>
        ) : (
          <span>
            Bản nháp chưa xuất bản{draft.updatedAt ? ` · lưu ${timeAgo(draft.updatedAt)}` : ''}{draft.author ? ` bởi ${draft.author}` : ''}. Website vẫn hiển thị bản cũ.
          </span>
        )}
        {dirty ? (
          <button className="adm-btn adm-btn-ghost" onClick={onDiscard} tabIndex={0}>
            <Undo2 size={16} /> Hoàn tác
          </button>
        ) : canPublish && (
          <button className="adm-btn adm-btn-ghost" onClick={onDiscardDraft} disabled={saving}>
            <Undo2 size={16} /> Bỏ nháp
          </button>
        )}
        {dirty && (
          <button className="adm-btn adm-btn-ghost" onClick={() => onSave('draft')} disabled={saving}>
            <Save size={16} /> Lưu nháp
          </button>
        )}
        {canPublish && (
          <button className="adm-btn adm-btn-primary" onClick={() => onSave('publish')} disabled={saving}>
            <Rocket size={16} /> {saving ? 'Đang lưu…' : 'Xuất bản'}
          </button>
        )}
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
function AccountMenu({ onLogout, onSettings }: { onLogout: () => void; onSettings?: () => void }) {
  const user = useAdminUser();
  const role = ROLES[user.role]?.label || user.role;
  const short = initials(user.name);
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
        <span className="ds-topbar-user-avatar">{short}</span>
        <span className="ds-topbar-user-meta">
          <span className="ds-topbar-user-name">{user.name}</span>
          <span className="ds-topbar-user-role">{role}</span>
        </span>
        <ChevronDown size={14} className="ds-topbar-user-chevron" />
      </button>
      {open && (
        <div className="am-pop" role="menu" aria-label="Tài khoản">
          <div className="am-card">
            <div className="am-avatar">{short}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{role}</span>
              <small>Phiên bảo mật · 8 giờ</small>
            </div>
          </div>
          <p className="am-where">
            <Globe size={15} /> Đang quản lý <b>danava.com.vn</b>
          </p>
          <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <ExternalLink size={17} /> Xem website
          </a>
          {onSettings && (
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
          )}
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
