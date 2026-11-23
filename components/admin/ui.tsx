'use client';
/** Thành phần dùng chung của trang quản trị: phiên đăng nhập (vai trò), tham số URL, thanh tab. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { can, type Permission, type Role } from '@/lib/permissions';
import type { AdminTab } from '../adminNav';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, EmptyState, ErrorState, FilterBar, LoadingState, TabBar } from './kit';

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

/** Thanh tab trong một màn hình (TabBar có chỉ báo trượt). Trả về tab đang chọn (mặc định tab đầu). */
export function useTabs(tabs: AdminTab[]) {
  const first = tabs[0]?.id || '';
  const [tab, setTab] = useQueryParam('tab', first);
  const current = tabs.some(t => t.id === tab) ? tab : first;
  const bar = tabs.length > 1 ? <TabBar tabs={tabs} value={current} onChange={id => setTab(id)} label="Các phần trong màn hình" /> : null;
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
  const from = (current - 1) * size + 1, to = Math.min(items.length, current * size);
  const pager = items.length > 0 ? (
    <nav className="ax-pager" aria-label="Phân trang">
      <span>{pages > 1 ? `${from}–${to} trên ${items.length} mục` : `${items.length} mục`}</span>
      {pages > 1 && (
        <span className="ax-pager__btns">
          <Button size="sm" variant="secondary" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Trang trước"><ChevronLeft size={15} /></Button>
          <span aria-live="polite">Trang {current}/{pages}</span>
          <Button size="sm" variant="secondary" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Trang sau"><ChevronRight size={15} /></Button>
        </span>
      )}
    </nav>
  ) : null;
  return { slice, pager, reset: () => setPage(1) };
}

/** Ô tìm kiếm + bộ lọc (FilterBar). */
export function SearchBar({ value, onChange, placeholder, children, actions }: { value: string; onChange: (v: string) => void; placeholder: string; children?: ReactNode; actions?: ReactNode }) {
  return <FilterBar search={value} onSearch={onChange} placeholder={placeholder} actions={actions}>{children}</FilterBar>;
}

/** Trạng thái rỗng / lỗi / đang tải thống nhất (EmptyState, ErrorState, LoadingState). */
export function Empty({ children, action, title }: { children: ReactNode; action?: ReactNode; title?: string }) {
  return <EmptyState title={title || 'Không có dữ liệu'} action={action}>{children}</EmptyState>;
}
export function Loading({ label = 'Đang tải…' }: { label?: string }) {
  return <LoadingState label={label} />;
}
export function ErrorBox({ children, retry }: { children: ReactNode; retry?: () => void }) {
  return <ErrorState retry={retry}>{children}</ErrorState>;
}
