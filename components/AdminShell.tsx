'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from './AdminIcons';
import { adminNav, adminSettings, allAdminItems, sectionInfo, timeAgo, csrfToken, type AdminLead } from './adminData';

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    if (read('danava-admin-theme') === 'light') setTheme('light');
    if (read('danava-admin-collapsed') === '1') setCollapsed(true);
  }, []);

  // Phím tắt: Ctrl/⌘ + K mở tìm nhanh, Ctrl/⌘ + S lưu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && dirty) {
        e.preventDefault();
        onSave();
      }
      if (e.key === 'Escape') {
        setBellOpen(false);
        setUserOpen(false);
        setMobileNav(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, onSave]);

  // Thông báo tự ẩn sau 6 giây
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(onDismissNotice, 6000);
    return () => clearTimeout(t);
  }, [notice, onDismissNotice]);

  const newLeads = leads.filter(l => (l.status || 'new') === 'new');

  function go(slug: string, e?: { preventDefault(): void }) {
    if (dirty && !confirm('Bạn có thay đổi chưa lưu. Rời màn hình này?')) {
      e?.preventDefault();
      return false;
    }
    setMobileNav(false);
    setPaletteOpen(false);
    setBellOpen(false);
    return true;
  }

  async function logout() {
    if (dirty && !confirm('Bạn có thay đổi chưa lưu. Vẫn đăng xuất?')) return;
    await fetch('/api/admin/session/', { method: 'DELETE', headers: { 'x-csrf-token': await csrfToken() } });
    location.reload();
  }

  const navLink = (item: { slug: string; icon: string; label: string }) => {
    const count = counts[item.slug];
    return (
      <Link
        key={item.slug}
        href={`/admin/${item.slug}/`}
        className="adm-nav-link"
        aria-current={section === item.slug ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
        onClick={e => go(item.slug, e)}
      >
        <Icon name={item.icon} />
        <span className="adm-nav-label">{item.label}</span>
        {count !== undefined && count > 0 && (
          <span className={`adm-count ${item.slug === 'khach-hang' ? 'is-hot' : ''}`}>{count}</span>
        )}
      </Link>
    );
  };

  return (
    <div className={`adm ${collapsed ? 'is-collapsed' : ''} ${mobileNav ? 'nav-open' : ''}`} data-theme={theme}>
      <div className="adm-backdrop" aria-hidden="true" />
      <button className="adm-scrim" aria-label="Đóng menu" tabIndex={-1} onClick={() => setMobileNav(false)} />

      {/* ---------- Thanh bên ---------- */}
      <aside className="adm-sidebar" aria-label="Menu quản trị">
        <div className="adm-brand">
          <Link href="/admin/tong-quan/" className="adm-logo" onClick={e => go('tong-quan', e)} aria-label="Tổng quan quản trị">
            D
          </Link>
          <div className="adm-brand-text">
            <strong>DANAVA</strong>
            <small>Quản trị website</small>
          </div>
          <button
            className="adm-icon-btn adm-collapse"
            aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            onClick={() => {
              setCollapsed(!collapsed);
              write('danava-admin-collapsed', collapsed ? '0' : '1');
            }}
          >
            <Icon name="panel" />
          </button>
        </div>

        <nav className="adm-nav">
          {adminNav.map(g => (
            <div className="adm-nav-group" key={g.group}>
              <p className="adm-nav-title">{g.group}</p>
              {g.items.map(navLink)}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          {navLink(adminSettings)}
          <Link href="/" target="_blank" className="adm-nav-link" title={collapsed ? 'Xem website' : undefined}>
            <Icon name="globe" />
            <span className="adm-nav-label">Xem website</span>
            <Icon name="external" size={14} className="adm-nav-trail" />
          </Link>
          <div className="adm-user">
            <span className="adm-avatar">
              QT
              <i aria-hidden="true" />
            </span>
            <div className="adm-user-text">
              <strong>Quản trị viên</strong>
              <small>Phiên bảo mật · 8 giờ</small>
            </div>
            <button className="adm-icon-btn" aria-label="Tùy chọn tài khoản" aria-expanded={userOpen} onClick={() => setUserOpen(!userOpen)}>
              <Icon name="more" />
            </button>
            {userOpen && (
              <div className="adm-popover adm-user-menu" role="menu">
                <button role="menuitem" onClick={logout}>
                  <Icon name="logout" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ---------- Vùng chính ---------- */}
      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-icon-btn adm-menu-btn" aria-label="Mở menu" aria-expanded={mobileNav} onClick={() => setMobileNav(true)}>
            <Icon name="menu" />
          </button>
          <nav className="adm-crumbs" aria-label="Vị trí">
            <span>DANAVA</span>
            <Icon name="chevron" size={14} />
            <span>{info.group}</span>
            {info.group !== info.label && (
              <>
                <Icon name="chevron" size={14} />
                <b>{info.label}</b>
              </>
            )}
          </nav>
          <div className="adm-top-actions">
            <button className="adm-search" onClick={() => setPaletteOpen(true)} aria-label="Tìm nhanh (Ctrl + K)">
              <Icon name="search" />
              <span>Tìm nhanh…</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button
              className="adm-icon-btn"
              aria-label={theme === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
              title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                setTheme(next);
                write('danava-admin-theme', next);
              }}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <div className="adm-bell">
              <button
                className="adm-icon-btn"
                aria-label={`Thông báo: ${newLeads.length} khách hàng mới`}
                aria-expanded={bellOpen}
                onClick={() => setBellOpen(!bellOpen)}
              >
                <Icon name="bell" />
                {newLeads.length > 0 && <span className="adm-dot">{newLeads.length > 9 ? '9+' : newLeads.length}</span>}
              </button>
              {bellOpen && (
                <div className="adm-popover adm-bell-menu">
                  <p className="adm-popover-title">
                    Khách hàng mới <span>{newLeads.length}</span>
                  </p>
                  {newLeads.length === 0 && <p className="adm-empty-mini">Không có yêu cầu mới. Mọi khách hàng đã được xử lý.</p>}
                  {newLeads.slice(0, 5).map(l => (
                    <Link key={l.id} href="/admin/khach-hang/" className="adm-bell-item" onClick={e => go('khach-hang', e)}>
                      <span className="adm-avatar sm">{initials(l.name)}</span>
                      <span>
                        <b>{l.name}</b>
                        <small>
                          {l.service || 'Tư vấn chung'} · {timeAgo(l.created_at)}
                        </small>
                      </span>
                    </Link>
                  ))}
                  <Link href="/admin/khach-hang/" className="adm-popover-foot" onClick={e => go('khach-hang', e)}>
                    Xem tất cả khách hàng <Icon name="arrow" size={14} />
                  </Link>
                </div>
              )}
            </div>
            <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={!ready || !dirty || saving}>
              <Icon name={dirty ? 'save' : 'check'} />
              <span>{saving ? 'Đang lưu…' : dirty ? 'Lưu thay đổi' : 'Đã lưu'}</span>
            </button>
          </div>
        </header>

        <main id="main" className="adm-content">
          <div className="adm-heading">
            <div>{heading || <><h1>{info.label}</h1><p>{info.desc}</p></>}</div>
            {actions && <div className="adm-heading-actions">{actions}</div>}
          </div>
          {children}
        </main>
      </div>

      {/* ---------- Thanh thay đổi chưa lưu ---------- */}
      <div className={`adm-savebar ${dirty ? 'is-visible' : ''}`} role="region" aria-label="Thay đổi chưa lưu" aria-hidden={!dirty}>
        <span className="adm-savebar-dot" aria-hidden="true" />
        <span>Bạn có thay đổi chưa lưu</span>
        <button className="adm-btn adm-btn-ghost" onClick={onDiscard} tabIndex={dirty ? 0 : -1}>
          <Icon name="undo" /> Hoàn tác
        </button>
        <button className="adm-btn adm-btn-primary" onClick={onSave} disabled={saving} tabIndex={dirty ? 0 : -1}>
          <Icon name="save" /> {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* ---------- Thông báo ---------- */}
      {(notice || error) && (
        <div className={`adm-toast ${error ? 'is-error' : ''}`} role="status">
          <Icon name={error ? 'x' : 'check'} />
          <span>{error || notice}</span>
          <button className="adm-icon-btn" aria-label="Đóng thông báo" onClick={onDismissNotice}>
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onPick={slug => {
            if (go(slug)) router.push(`/admin/${slug}/`);
          }}
        />
      )}
    </div>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

/* Tìm nhanh màn hình quản trị — gõ không dấu cũng tìm được */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

function CommandPalette({ onClose, onPick }: { onClose: () => void; onPick: (slug: string) => void }) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(
    () => allAdminItems.filter(i => fold(`${i.label} ${i.group} ${i.desc}`).includes(fold(q.trim()))),
    [q],
  );
  useEffect(() => input.current?.focus(), []);
  useEffect(() => setIndex(0), [q]);

  return (
    <div className="adm-palette-wrap" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-palette" role="dialog" aria-modal="true" aria-label="Tìm nhanh">
        <div className="adm-palette-input">
          <Icon name="search" />
          <input
            ref={input}
            value={q}
            placeholder="Đi tới… (ví dụ: bai viet, khach hang)"
            aria-label="Tìm màn hình quản trị"
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex(i => Math.min(results.length - 1, i + 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex(i => Math.max(0, i - 1));
              }
              if (e.key === 'Enter' && results[index]) onPick(results[index].slug);
              if (e.key === 'Escape') onClose();
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul>
          {results.map((r, i) => (
            <li key={r.slug}>
              <button className={i === index ? 'is-active' : ''} onMouseEnter={() => setIndex(i)} onClick={() => onPick(r.slug)}>
                <Icon name={r.icon} />
                <span>
                  <b>{r.label}</b>
                  <small>{r.desc}</small>
                </span>
                <em>{r.group}</em>
              </button>
            </li>
          ))}
          {!results.length && <li className="adm-empty-mini">Không tìm thấy màn hình phù hợp.</li>}
        </ul>
      </div>
    </div>
  );
}
