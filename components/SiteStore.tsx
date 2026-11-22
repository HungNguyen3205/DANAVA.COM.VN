'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { initial, validateContent, type SiteData } from '@/lib/content';
import { extraError } from '@/lib/site-extras';
import { careersError } from '@/lib/careers';

type Store = { data: SiteData; save: (next: SiteData) => Promise<boolean>; refresh: () => Promise<void>; ready: boolean; error: string };
const Context = createContext<Store>({ data: initial, save: async () => false, refresh: async () => {}, ready: false, error: '' });

/**
 * Kho nội dung phía trình duyệt.
 * - Website công khai nhận bản đã cắt gọn (không bản nháp, không toàn văn bài viết).
 * - Admin gọi refresh() để tải bản đầy đủ từ /api/admin/content/. Chỉ được LƯU sau khi đã tải bản đầy đủ,
 *   tránh ghi bản cắt gọn đè lên dữ liệu thật.
 */
export function SiteStore({ children, initialData = initial }: { children: ReactNode; initialData?: SiteData }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [full, setFull] = useState(false);

  async function refresh() {
    const r = await fetch('/api/admin/content/', { cache: 'no-store' });
    if (!r.ok) { setError('Không tải được nội dung đầy đủ từ máy chủ. Tải lại trang trước khi chỉnh sửa.'); return; }
    const v = await r.json();
    if (!validateContent(v.data)) { setError('Nội dung trên máy chủ không đúng cấu trúc.'); return; }
    setData(v.data);
    setRevision(v.revision);
    setFull(true);
    setError('');
  }

  async function save(next: SiteData) {
    if (!full) { setError('Chưa tải nội dung đầy đủ từ máy chủ nên không thể lưu. Hãy tải lại trang.'); return false; }
    const invalid = extraError(next.extras) || careersError(next.careers);
    if (invalid || !validateContent(next)) { setError(invalid || 'Nội dung không đúng cấu trúc.'); return false; }
    try {
      const auth = await fetch('/api/admin/session/', { cache: 'no-store' }).then(r => r.json());
      const r = await fetch('/api/admin/content/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': auth.csrf },
        body: JSON.stringify({ data: next, revision })
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error || 'Phiên đăng nhập hết hạn.');
      setData(next);
      setRevision(result.revision);
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không kết nối được máy chủ.');
      return false;
    }
  }

  return <Context.Provider value={{ data, save, refresh, ready: true, error }}>{children}</Context.Provider>;
}

export const useSite = () => useContext(Context);
