'use client';
/**
 * Khung quản trị DANAVA: sidebar navy (256px, thu gọn 72px, drawer trên điện thoại) · topbar (breadcrumb, tìm nhanh Ctrl+K,
 * tạo mới, lưu nháp/xuất bản, thông báo, tài khoản) · vùng nội dung · thanh lưu · thông báo kết quả.
 * Component: components/admin/kit.tsx (Radix + Motion). Giao diện: app/admin/admin-ui.css.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DropdownMenu } from 'radix-ui';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight, Bell, Blocks, Briefcase, Building2, ChartColumn, Check, ChevronRight, ClipboardList, ContactRound, Handshake, MessageSquareQuote, ExternalLink, FileText, FolderOpen,
  Gauge, Globe, History, Image as ImageIcon, Inbox, KeyRound, Layers, LayoutGrid, Link2, LogOut, Menu, Navigation, Package, Palette, PanelLeftClose,
  PanelLeftOpen, PanelsTopLeft, PieChart, Plug, Plus, Rocket, Save, Search, Settings, Tags, Undo2, Users, Wrench, X, CircleAlert, type LucideIcon
} from 'lucide-react';
import { allAdminItems, sectionInfo, timeAgo, csrfToken, visibleNav, type AdminLead } from './adminData';
import { ROLES, can } from '@/lib/permissions';
import { fold, useAdminUser } from './admin/ui';
import { Button, DUR, EASE, Modal, Sheet, Tip, useConfirm } from './admin/kit';
import type { DraftInfo, SaveMode } from './SiteStore';

/** Bản ghi cho ô tìm kiếm toàn admin. */
export type SearchRecord = { label: string; kind: string; href: string };

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
  'tong-quan': LayoutGrid, 'chinh-sua': PanelsTopLeft, trang: PanelsTopLeft, 'landing-page': Rocket, menu: Navigation, 'giao-dien': Palette, 'mau-khoi': Blocks,
  'san-pham': Package, 'nhom-loai': Tags, 'bai-viet': FileText, 'du-an': Briefcase, 'thuong-hieu': Building2,
  'khach-hang': Inbox, 'danh-ba': ContactRound, 'bieu-mau': ClipboardList, 'doi-tac': Handshake, 'nhan-xet': MessageSquareQuote, 'thu-vien': ImageIcon,
  'thong-ke': ChartColumn, 'nguon-khach': PieChart, 'hieu-qua': Gauge,
  'cai-dat': Settings, 'tai-khoan': KeyRound, seo: Link2, 'tich-hop': Plug, 'nhat-ky': History
};
const GROUP_ICONS: Record<string, LucideIcon> = {
  'Tổng quan': LayoutGrid, Website: Globe, 'Chỉnh sửa website': PanelsTopLeft, 'Giải pháp': Layers, 'Nội dung': FileText,
  'Khách hàng': Users, 'Tài nguyên': FolderOpen, 'Báo cáo': ChartColumn, 'Hệ thống': Wrench
};

/** Nhãn ngắn dưới biểu tượng khi thanh bên thu gọn */
const SHORT: Record<string, string> = {
  'Tổng quan': 'Tổng quan', 'Chỉnh sửa website': 'Website', 'Giải pháp': 'Giải pháp', 'Nội dung': 'Nội dung',
  'Khách hàng': 'Khách hàng', 'Tài nguyên': 'Tài nguyên', 'Báo cáo': 'Báo cáo', 'Hệ thống': 'Hệ thống'
};
/** Nhóm bắt đầu một cụm mới trên thanh bên (vạch ngăn phía trên) */
const SECTION_START = new Set(['Giải pháp', 'Báo cáo']);

/** Chờ menu Radix đóng hẳn (trả focus trong setTimeout 0) trước khi mở hộp thoại. */
const settle = () => new Promise(r => setTimeout(r, 40));

const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} }
};

export default function AdminShell(props: Props) {
  return <Shell {...props} />;
}

function Shell({
  section, dirty, ready, saving, onSave, onDiscard, onDiscardDraft, draft, notice, error, onDismissNotice, leads, records = [], counts, tabs, heading, actions, children
}: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const user = useAdminUser();
  const info = sectionInfo(section);
  const groups = useMemo(() => visibleNav(user.role), [user.role]);
  const canDraft = can(user.role, 'content.draft');
  const canPublish = can(user.role, 'content.publish');
  // Khung chỉ hiện sau khi đăng nhập (không render phía máy chủ) → đọc ngay, không chớp khi chuyển trang
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && store.get('danava-admin-collapsed') === '1');
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const newLeads = leads.filter(l => (l.status || 'new') === 'new');

  const toggleCollapsed = () => setCollapsed(v => { store.set('danava-admin-collapsed', v ? '0' : '1'); return !v; });

  /** Rời màn hình: hỏi khi có thay đổi chưa lưu (theo cơ chế hiện có), rồi điều hướng. */
  const go = useCallback(async (href: string) => {
    // Gọi từ menu: đợi menu đóng và trả focus xong rồi mới mở hộp xác nhận
    if (dirty) await settle();
    if (dirty && !(await confirm({ title: 'Rời màn hình này?', body: 'Bạn có thay đổi chưa lưu. Rời đi thì thay đổi chưa lưu sẽ mất.', confirmLabel: 'Rời đi', tone: 'danger' }))) return;
    setDrawer(false);
    setSearchOpen(false);
    router.push(href);
  }, [dirty, confirm, router]);

  // Phím tắt: Ctrl/⌘ + K tìm nhanh · Ctrl/⌘ + S lưu nháp
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && dirty && canDraft) { e.preventDefault(); onSave('draft'); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [dirty, onSave, canDraft]);

  // Thông báo thành công tự ẩn sau 5 giây (lỗi giữ tới khi đóng)
  useEffect(() => {
    if (!notice || error) return;
    const t = setTimeout(onDismissNotice, 5000);
    return () => clearTimeout(t);
  }, [notice, error, onDismissNotice]);

  async function logout() {
    await settle();
    if (dirty && !(await confirm({ title: 'Đăng xuất?', body: 'Bạn có thay đổi chưa lưu. Đăng xuất thì thay đổi chưa lưu sẽ mất.', confirmLabel: 'Đăng xuất', tone: 'danger' }))) return;
    try {
      const res = await fetch('/api/admin/session/', { method: 'DELETE', headers: { 'x-csrf-token': await csrfToken() } });
      if (res.ok || res.status === 403) return location.reload();
    } catch {}
    await confirm({ title: 'Chưa đăng xuất được', body: 'Phiên vẫn còn hiệu lực. Kiểm tra kết nối rồi thử lại.', confirmLabel: 'Đã hiểu' });
  }

  const creatable = [
    { label: 'Bài viết', href: '/admin/bai-viet/?new=1', icon: FileText },
    { label: 'Sản phẩm / dịch vụ', href: '/admin/san-pham/?new=1', icon: Package },
    { label: 'Landing page', href: '/admin/chinh-sua/?panel=landings&new=1', icon: Rocket }
  ].filter(() => canDraft);

  const sidebar = (mini: boolean, inDrawer = false) => (
    <Sidebar groups={groups} active={info.slug} mini={mini} counts={counts} onNavigate={go} onToggle={toggleCollapsed} inDrawer={inDrawer} />
  );

  return (
    <div className={`adm ds-root ax ax-scope${collapsed ? ' is-collapsed' : ''}`} data-theme="light">
      {sidebar(collapsed)}
      <Sheet open={drawer} onOpenChange={setDrawer} title="Menu quản trị">{sidebar(false, true)}</Sheet>

      <div className="ax-main">
        <header className="ax-top">
          <button type="button" className="ax-icon-btn ax-menu-btn" aria-label="Mở menu" onClick={() => setDrawer(true)}><Menu size={20} /></button>
          <div className="ax-top__title">
            <ol className="ax-crumbs" aria-label="Vị trí">
              <li><Link href="/admin/tong-quan/" onClick={e => { e.preventDefault(); go('/admin/tong-quan/'); }}>DANAVA</Link></li>
              {info.group !== info.label && <li>{info.group}</li>}
            </ol>
            <h1>{info.label}</h1>
          </div>
          <div className="ax-top__right">
            <button type="button" className="ax-searchbtn" onClick={() => setSearchOpen(true)} aria-label="Tìm nhanh (Ctrl + K)">
              <Search size={16} /><span>Tìm nhanh…</span><kbd>Ctrl K</kbd>
            </button>

            {creatable.length > 0 && (
              <DropdownMenu.Root>
                <Tip label="Tạo mới" side="bottom">
                  <DropdownMenu.Trigger asChild><button type="button" className="ax-icon-btn ax-top__create" aria-label="Tạo mới"><Plus size={19} /></button></DropdownMenu.Trigger>
                </Tip>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="ax-menu" align="end" sideOffset={8} collisionPadding={12}>
                    <div className="ax-menu__label">Tạo mới</div>
                    {creatable.map(c => <DropdownMenu.Item key={c.href} className="ax-menu__item" onSelect={() => go(c.href)}><c.icon size={16} /><span className="ax-menu__text">{c.label}</span></DropdownMenu.Item>)}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}

            {can(user.role, 'leads.read') && (
              <DropdownMenu.Root>
                <Tip label={`Thông báo: ${newLeads.length} khách hàng mới`} side="bottom">
                  <DropdownMenu.Trigger asChild>
                    <button type="button" className="ax-icon-btn ax-bell" aria-label={`Thông báo: ${newLeads.length} khách hàng mới`}><Bell size={19} />{newLeads.length > 0 && <span className="ax-bell__dot" />}</button>
                  </DropdownMenu.Trigger>
                </Tip>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="ax-menu ax-menu--wide" align="end" sideOffset={8} collisionPadding={12}>
                    <div className="ax-menu__label">Khách hàng mới <span className="ax-menu__count">{newLeads.length}</span></div>
                    {!newLeads.length && <p className="ax-menu__empty">Không có yêu cầu mới.</p>}
                    {newLeads.slice(0, 5).map(l => (
                      <DropdownMenu.Item key={l.id} className="ax-menu__item ax-menu__item--rich" onSelect={() => go('/admin/khach-hang/')}>
                        <span className="ax-menu__avatar">{initials(l.name)}</span>
                        <span className="ax-menu__text"><b>{l.name}</b><small>{l.service || 'Tư vấn chung'} · {timeAgo(l.created_at)}</small></span>
                      </DropdownMenu.Item>
                    ))}
                    <div className="ax-menu__sep" />
                    <DropdownMenu.Item className="ax-menu__item" onSelect={() => go('/admin/khach-hang/')}><ArrowUpRight size={16} /><span className="ax-menu__text">Xem tất cả yêu cầu</span></DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}

            {canDraft && (
              <div className="ax-top__save">
                <span className={`ax-save-state is-${saving ? 'saving' : dirty ? 'dirty' : draft.hasDraft ? 'draft' : 'live'}`} role="status">
                  {saving ? 'Đang lưu…' : dirty ? 'Chưa lưu' : draft.hasDraft ? 'Đã lưu nháp' : 'Đã xuất bản'}
                </span>
                <Tip label="Lưu trên máy chủ, website chưa đổi (Ctrl + S)" side="bottom">
                  <Button variant="secondary" onClick={() => onSave('draft')} disabled={!ready || !dirty || saving} aria-label="Lưu nháp"><Save size={16} /><span className="ax-top__save-label">Lưu nháp</span></Button>
                </Tip>
                {canPublish && (
                  <Button variant="primary" onClick={() => onSave('publish')} disabled={!ready || (!dirty && !draft.hasDraft) || saving} loading={saving} aria-label="Xuất bản">
                    {!saving && (dirty || draft.hasDraft ? <Rocket size={16} /> : <Check size={16} />)}<span className="ax-top__save-label">Xuất bản</span>
                  </Button>
                )}
              </div>
            )}

            <AccountMenu onLogout={logout} onSettings={can(user.role, 'system.manage') ? () => go('/admin/cai-dat/') : undefined} />
          </div>
        </header>

        <main id="main" className="ax-content" key={section}>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.base, ease: EASE }}>
            {(heading || actions || info.desc) && (
              <div className="ax-intro">
                <div>{heading || <p>{info.desc}</p>}</div>
                {actions && <div className="ax-intro__actions">{actions}</div>}
              </div>
            )}
            {tabs && <div className="ax-screen-tabs">{tabs}</div>}
            {children}
          </motion.div>
        </main>
      </div>

      {/* Thanh lưu: thay đổi chưa lưu / bản nháp chưa xuất bản */}
      <AnimatePresence>
        {canDraft && (dirty || draft.hasDraft) && (
          <motion.div key={dirty ? 'dirty' : 'draft'} className={`ax-savebar${dirty ? '' : ' is-draft'}`} role="region" aria-label="Trạng thái lưu"
            initial={{ opacity: 0, y: 16, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 16, x: '-50%' }} transition={{ duration: DUR.base, ease: EASE }}>
            <span className="ax-savebar__dot" aria-hidden="true" />
            <span>{dirty ? 'Bạn có thay đổi chưa lưu' : `Bản nháp chưa xuất bản${draft.updatedAt ? ` · lưu ${timeAgo(draft.updatedAt)}` : ''}${draft.author ? ` bởi ${draft.author}` : ''}`}</span>
            {dirty
              ? <Button variant="ghost" size="sm" onClick={onDiscard}><Undo2 size={15} /> Hoàn tác</Button>
              : canPublish && <Button variant="ghost" size="sm" onClick={onDiscardDraft} disabled={saving}><Undo2 size={15} /> Bỏ nháp</Button>}
            {dirty && <Button variant="secondary" size="sm" onClick={() => onSave('draft')} disabled={saving}><Save size={15} /> Lưu nháp</Button>}
            {canPublish && <Button variant="primary" size="sm" onClick={() => onSave('publish')} loading={saving}>{!saving && <Rocket size={15} />} Xuất bản</Button>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thông báo kết quả thao tác */}
      <div className="ax-toasts" aria-live="polite">
        <AnimatePresence>
          {(notice || error) && (
            <motion.div key={error || notice} className={`ax-toast${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}
              initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: DUR.base, ease: EASE }}>
              <span className="ax-toast__icon">{error ? <CircleAlert size={18} /> : <Check size={18} />}</span>
              <p>{error || notice}</p>
              <button type="button" className="ax-icon-btn" style={{ width: 28, height: 28 }} aria-label="Đóng thông báo" onClick={onDismissNotice}><X size={15} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} groups={groups} records={records} onGo={go} />
    </div>
  );
}

/* ================================================================ Sidebar */
type NavGroup = ReturnType<typeof visibleNav>[number];

function Sidebar({ groups, active, mini, counts, onNavigate, onToggle, inDrawer }: {
  groups: NavGroup[]; active: string; mini: boolean; counts: Record<string, number | undefined>; onNavigate: (href: string) => void; onToggle: () => void; inDrawer: boolean;
}) {
  const activeGroup = groups.find(g => g.items.some(i => i.slug === active))?.group;
  // Chỉ mở nhóm đang dùng; người dùng mở thêm nhóm khác khi cần
  const [open, setOpen] = useState<Set<string>>(() => new Set(activeGroup ? [activeGroup] : []));
  useEffect(() => { if (activeGroup) setOpen(s => (s.has(activeGroup) ? s : new Set([...s, activeGroup]))); }, [activeGroup]);
  const link = (slug: string) => `/admin/${slug}/`;
  const click = (slug: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate(link(slug)); };

  return (
    <aside className="ax-side" aria-label="Menu quản trị">
      <div className="ax-side__brand">
        <Link href="/admin/tong-quan/" onClick={click('tong-quan')} title="DANAVA · Quản trị website">
          <img src="/assets/danava-mark.png" alt="" width={32} height={32} />
          <span className="ax-side__brand-text"><b>DANAVA</b><small>Quản trị website</small></span>
        </Link>
      </div>
      <nav className="ax-side__nav" aria-label="Quản trị DANAVA">
        {groups.map(g => {
          const Icon = GROUP_ICONS[g.group] || LayoutGrid;
          const has = g.items.some(i => i.slug === active);
          const count = g.items.reduce((n, i) => n + (counts[i.slug] || 0), 0);
          // Nhóm một mục: đi thẳng
          if (g.items.length === 1) {
            const item = g.items[0];
            return (
              <div key={g.group} className={`ax-side__group${SECTION_START.has(g.group) ? ' is-section' : ''}`}>
                <Tip label={item.label} disabled={!mini}>
                  <a href={link(item.slug)} onClick={click(item.slug)} className={`ax-side__group-btn ax-side__single${has ? ' is-active has-active' : ''}`} aria-current={has ? 'page' : undefined} style={{ position: 'relative' }}>
                    <span className="ax-side__ico"><Icon size={18} />{mini && count > 0 && <span className="ax-side__badge">{count > 99 ? '99+' : count}</span>}</span><span className="ax-side__label">{g.group}</span>
                    {mini && <span className="ax-side__short">{SHORT[g.group] || g.group}</span>}
                  </a>
                </Tip>
              </div>
            );
          }
          // Thu gọn: icon nhóm + menu bay ra bên phải
          if (mini) {
            return (
              <div key={g.group} className={`ax-side__group${SECTION_START.has(g.group) ? ' is-section' : ''}`}>
                <DropdownMenu.Root>
                  <Tip label={g.group}>
                    <DropdownMenu.Trigger asChild>
                      <button type="button" className={`ax-side__group-btn${has ? ' has-active' : ''}`} aria-label={g.group} style={{ position: 'relative' }}>
                        <span className="ax-side__ico"><Icon size={18} />{count > 0 && <span className="ax-side__badge">{count > 99 ? '99+' : count}</span>}</span>
                        <span className="ax-side__short">{SHORT[g.group] || g.group}</span>
                      </button>
                    </DropdownMenu.Trigger>
                  </Tip>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="ax-menu ax-menu--fly" side="right" align="start" sideOffset={12} collisionPadding={12}>
                      <div className="ax-menu__head"><span className="ax-menu__tile"><Icon size={17} /></span><span className="ax-menu__text"><b>{g.group}</b><small>{g.items.length} mục</small></span></div>
                      {g.items.map(it => {
                        const ItemIcon = ICONS[it.slug] || FileText;
                        const on = it.slug === active;
                        return <DropdownMenu.Item key={it.slug} className={`ax-menu__item${on ? ' is-active' : ''}`} aria-current={on ? 'page' : undefined} onSelect={() => onNavigate(link(it.slug))}><ItemIcon size={16} /><span className="ax-menu__text">{it.label}</span>{!!counts[it.slug] && <span className="ax-menu__count">{counts[it.slug]}</span>}</DropdownMenu.Item>;
                      })}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            );
          }
          const isOpen = open.has(g.group);
          return (
            <div key={g.group} className={`ax-side__group${SECTION_START.has(g.group) ? ' is-section' : ''}`}>
              <button type="button" className={`ax-side__group-btn${has ? ' has-active' : ''}`} aria-expanded={isOpen}
                onClick={() => setOpen(s => { const n = new Set(s); if (n.has(g.group)) n.delete(g.group); else n.add(g.group); return n; })}>
                <span className="ax-side__ico"><Icon size={18} /></span><span className="ax-side__label">{g.group}</span>
                {!isOpen && count > 0 && <span className="ax-side__count">{count}</span>}
                <ChevronRight size={15} className="ax-side__chev" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div className="ax-side__items" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE }}>
                    <ul>
                      {g.items.map(it => (
                        <li key={it.slug}>
                          <a href={link(it.slug)} onClick={click(it.slug)} className={`ax-side__link${it.slug === active ? ' is-active' : ''}`} aria-current={it.slug === active ? 'page' : undefined}>
                            <span className="ax-side__label">{it.label}</span>
                            {!!counts[it.slug] && <span className="ax-side__count">{counts[it.slug]}</span>}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
      <div className="ax-side__foot">
        <Tip label="Xem website" disabled={!mini}>
          <a href="/" target="_blank" rel="noopener noreferrer"><span className="ax-side__ico"><Globe size={18} /></span><span className="ax-side__label">Xem website</span>{mini && <span className="ax-side__short">Xem web</span>}</a>
        </Tip>
        {!inDrawer && (
          <Tip label={mini ? 'Mở rộng menu' : 'Thu gọn menu'} disabled={!mini}>
            <button type="button" onClick={onToggle} aria-label={mini ? 'Mở rộng menu' : 'Thu gọn menu'} aria-expanded={!mini}>
              <span className="ax-side__ico">{mini ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</span><span className="ax-side__label">Thu gọn menu</span>{mini && <span className="ax-side__short">Mở rộng</span>}
            </button>
          </Tip>
        )}
      </div>
    </aside>
  );
}

/* ================================================================ Tìm nhanh (Ctrl + K) */
function CommandSearch({ open, onOpenChange, groups, records, onGo }: { open: boolean; onOpenChange: (o: boolean) => void; groups: NavGroup[]; records: SearchRecord[]; onGo: (href: string) => void }) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => { if (open) { setQ(''); setIndex(0); } }, [open]);
  const words = fold(q).split(/\s+/).filter(Boolean);
  const has = (t: string) => { const h = fold(t); return words.every(w => h.includes(w)); };
  const visible = new Set(groups.flatMap(g => g.items.map(i => i.slug)));
  const menu = allAdminItems.filter(i => visible.has(i.slug) && (!words.length || has(`${i.label} ${i.group} ${i.desc}`)))
    .map(i => ({ key: 'm' + i.slug, label: i.label, sub: i.group, href: `/admin/${i.slug}/`, kind: 'Chức năng' }));
  const recs = words.length ? records.filter(r => has(`${r.label} ${r.kind}`)).slice(0, 30).map((r, n) => ({ key: `r${n}${r.href}`, label: r.label, sub: r.kind, href: r.href, kind: 'Nội dung' })) : [];
  const hits = [...menu.slice(0, words.length ? 8 : 24), ...recs];
  useEffect(() => { setIndex(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector('.is-on')?.scrollIntoView({ block: 'nearest' }); }, [index]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Tìm nhanh" size="lg">
      <div className="ax-cmd" onKeyDown={e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(hits.length - 1, i + 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(0, i - 1)); }
        if (e.key === 'Enter' && hits[index]) { e.preventDefault(); onGo(hits[index].href); }
      }}>
        <div className="ax-cmd__input">
          <Search size={18} color="#6b7690" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm chức năng, bài viết, sản phẩm, landing page, khách hàng…" aria-label="Tìm nhanh" aria-controls="ax-cmd-list" aria-activedescendant={hits[index] ? `cmd-${index}` : undefined} />
        </div>
        <ul className="ax-cmd__list" id="ax-cmd-list" role="listbox" ref={listRef}>
          {!hits.length && <li className="ax-cmd__empty">Không tìm thấy kết quả cho “{q}”.</li>}
          {hits.map((h, i) => (
            <li key={h.key} role="presentation">
              {(i === 0 || hits[i - 1].kind !== h.kind) && <div className="ax-cmd__group">{h.kind}</div>}
              <button type="button" id={`cmd-${i}`} role="option" aria-selected={i === index} className={`ax-cmd__item${i === index ? ' is-on' : ''}`} onMouseEnter={() => setIndex(i)} onClick={() => onGo(h.href)}>
                <span>{h.label}</span><small>{h.sub}</small>
              </button>
            </li>
          ))}
        </ul>
        <div className="ax-cmd__hint"><span>↑↓ di chuyển</span><span>Enter mở</span><span>Esc đóng</span></div>
      </div>
    </Modal>
  );
}

/* ================================================================ Tài khoản */
function AccountMenu({ onLogout, onSettings }: { onLogout: () => void; onSettings?: () => void }) {
  const user = useAdminUser();
  const role = ROLES[user.role]?.label || user.role;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="ax-account" aria-label={`Tài khoản: ${user.name}`}>
          <span className="ax-avatar">{initials(user.name)}</span>
          <span className="ax-account__meta"><b>{user.name}</b><small>{role}</small></span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="ax-menu ax-menu--account" align="end" sideOffset={8} collisionPadding={12}>
          <div className="ax-menu__user">
            <span className="ax-menu__avatar ax-menu__avatar--lg">{initials(user.name)}</span>
            <span className="ax-menu__text"><b>{user.name}</b><small><i />Đang đăng nhập</small></span>
            <span className="ax-menu__role">{role}</span>
          </div>
          <DropdownMenu.Item className="ax-menu__item" onSelect={() => window.open('/', '_blank', 'noopener')}><ExternalLink size={16} /><span className="ax-menu__text">Xem website</span><span className="ax-menu__hint">Tab mới</span></DropdownMenu.Item>
          {onSettings && <DropdownMenu.Item className="ax-menu__item" onSelect={onSettings}><Settings size={16} /><span className="ax-menu__text">Cài đặt</span></DropdownMenu.Item>}
          <div className="ax-menu__sep" />
          <DropdownMenu.Item className="ax-menu__item is-danger" onSelect={onLogout}><LogOut size={16} /><span className="ax-menu__text">Đăng xuất</span></DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}
