'use client';
/** Thành phần dùng chung của trang quản trị: phiên đăng nhập (vai trò), tham số URL, thanh tab. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { can, type Permission, type Role } from '@/lib/permissions';
import type { AdminTab } from '../adminNav';

export type AdminUser = { id: string; name: string; role: Role };

const SessionContext = createContext<AdminUser>({ id: 'owner', name: 'Chủ website', role: 'owner' });

export function AdminSessionProvider({ user, children }: { user: AdminUser; children: ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export const useAdminUser = () => useContext(SessionContext);

/** true nếu người đang đăng nhập có quyền. Chỉ để ẩn nút; API luôn kiểm tra lại. */
export function useCan(perm: Permission) {
  return can(useAdminUser().role, perm);
}

/** Đọc/ghi một tham số trên URL (?tab=, ?id=…) mà không tải lại trang, giữ được nút Back. */
export function useQueryParam(name: string, fallback = ''): [string, (value: string, push?: boolean) => void] {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const read = () => setValue(new URLSearchParams(location.search).get(name) || fallback);
    read();
    addEventListener('popstate', read);
    return () => removeEventListener('popstate', read);
  }, [name, fallback]);
  const update = useCallback((next: string, push = false) => {
    const url = new URL(location.href);
    if (next) url.searchParams.set(name, next); else url.searchParams.delete(name);
    history[push ? 'pushState' : 'replaceState'](history.state, '', url);
    setValue(next || fallback);
  }, [name, fallback]);
  return [value, update];
}

/** Thanh tab trong một màn hình. Trả về tab đang chọn (mặc định tab đầu). */
export function useTabs(tabs: AdminTab[]) {
  const first = tabs[0]?.id || '';
  const [tab, setTab] = useQueryParam('tab', first);
  const current = tabs.some(t => t.id === tab) ? tab : first;
  const bar = tabs.length > 1 ? (
    <div className="adm-tabs adm-screen-tabs" role="tablist" aria-label="Các phần trong màn hình">
      {tabs.map(t => (
        <button key={t.id} type="button" role="tab" aria-selected={current === t.id} className={current === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  ) : null;
  return { tab: current, setTab, bar };
}

/* Gõ không dấu cũng tìm được */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
export const matches = (query: string, ...fields: (string | undefined)[]) => {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = fold(fields.filter(Boolean).join(' '));
  return words.every(w => hay.includes(w));
};

/** Danh sách có tìm kiếm + phân trang thống nhất cho mọi màn hình. */
export function usePaged<T>(items: T[], size = 25) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, pages);
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const slice = items.slice((current - 1) * size, current * size);
  const pager = pages > 1 ? (
    <nav className="adm-pager" aria-label="Phân trang">
      <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>← Trước</button>
      <span>Trang {current}/{pages} · {items.length} mục</span>
      <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>Sau →</button>
    </nav>
  ) : items.length > 0 ? <p className="adm-pager adm-pager--single">{items.length} mục</p> : null;
  return { slice, pager, reset: () => setPage(1) };
}

export function SearchBar({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children?: ReactNode }) {
  return (
    <div className="adm-listbar">
      <input type="search" className="adm-listbar__search" placeholder={placeholder} aria-label={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      {children}
    </div>
  );
}

/** Trạng thái rỗng / lỗi / đang tải thống nhất. */
export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="adm-empty adm-state">{children}{action && <div className="adm-state__action">{action}</div>}</div>;
}
export function Loading({ label = 'Đang tải…' }: { label?: string }) {
  return <div className="adm-state adm-state--loading" role="status">{label}</div>;
}
export function ErrorBox({ children, retry }: { children: ReactNode; retry?: () => void }) {
  return (
    <div className="adm-state adm-state--error" role="alert">
      {children}
      {retry && <button type="button" className="admin-secondary" onClick={retry}>Thử lại</button>}
    </div>
  );
}
