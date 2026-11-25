'use client';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { contentError, initial, validateContent, type SiteData } from '@/lib/content';
import { extraError } from '@/lib/site-extras';
import { careersError } from '@/lib/careers';
import { contentProblem } from '@/lib/content-check';

export type SaveMode = 'draft' | 'publish';
/** Trạng thái bản đang soạn trên máy chủ. */
export type DraftInfo = { hasDraft: boolean; updatedAt: number | null; author: string | null };
/** Kết quả tự dịch khi xuất bản (app/api/admin/content → lib/i18n-auto.ts). */
export type AutoTranslateInfo = { done: number; failed: number; noKey: boolean; locales: string[] };

type Store = {
  data: SiteData;
  /** Lưu lên máy chủ: 'draft' = bản nháp (website không đổi), 'publish' = xuất bản (mặc định). */
  save: (next: SiteData, mode?: SaveMode, note?: string) => Promise<boolean>;
  /** Bỏ bản nháp phía máy chủ, quay về bản đang công khai. */
  discardDraft: () => Promise<boolean>;
  refresh: () => Promise<void>;
  ready: boolean;
  error: string;
  draft: DraftInfo;
  revision: number;
  /** Lấy (và xóa) kết quả tự dịch của lần xuất bản gần nhất. */
  takeAutoInfo: () => AutoTranslateInfo | null;
};
const NO_DRAFT: DraftInfo = { hasDraft: false, updatedAt: null, author: null };
const Context = createContext<Store>({ data: initial, save: async () => false, discardDraft: async () => false, refresh: async () => {}, ready: false, error: '', draft: NO_DRAFT, revision: 0, takeAutoInfo: () => null });

async function csrf() {
  const auth = await fetch('/api/admin/session/', { cache: 'no-store' }).then(r => r.json());
  return String(auth.csrf || '');
}

/**
 * Kho nội dung phía trình duyệt.
 * - Website công khai nhận bản đã cắt gọn (không bản nháp, không toàn văn bài viết).
 * - Admin gọi refresh() để tải BẢN ĐANG SOẠN từ /api/admin/content/ (bản nháp phía máy chủ nếu có).
 *   Chỉ được lưu sau khi đã tải bản đầy đủ, tránh ghi bản cắt gọn đè lên dữ liệu thật.
 * - Mỗi lần lưu gửi kèm mã chỉnh sửa; người khác vừa lưu trước → máy chủ trả 409 (không ghi đè).
 */
export function SiteStore({ children, initialData = initial }: { children: ReactNode; initialData?: SiteData }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [full, setFull] = useState(false);
  const [draft, setDraft] = useState<DraftInfo>(NO_DRAFT);

  async function refresh() {
    const r = await fetch('/api/admin/content/', { cache: 'no-store' });
    if (r.status === 403) { setError(''); setFull(false); return; } // vai trò không xem nội dung (vd. Kinh doanh)
    if (!r.ok) { setError('Không tải được nội dung đầy đủ từ máy chủ. Tải lại trang trước khi chỉnh sửa.'); return; }
    const v = await r.json();
    if (!validateContent(v.data)) { setError(`Nội dung trên máy chủ không đúng cấu trúc: ${contentError(v.data) || 'không rõ vị trí'}`); return; }
    setData(v.data);
    setRevision(v.revision);
    setDraft({ hasDraft: !!v.hasDraft, updatedAt: v.draftUpdatedAt ?? null, author: v.draftAuthor ?? null });
    setFull(true);
    setError('');
  }

  async function save(next: SiteData, mode: SaveMode = 'publish', note = '') {
    if (!full) { setError('Chưa tải nội dung đầy đủ từ máy chủ nên không thể lưu. Hãy tải lại trang.'); return false; }
    let reason: string | null = null;
    try { reason = contentProblem(next); } catch {}
    const invalid = extraError(next.extras) || careersError(next.careers) || reason;
    if (invalid || !validateContent(next)) { setError(invalid || contentError(next) || 'Nội dung không đúng cấu trúc.'); return false; }
    try {
      const r = await fetch('/api/admin/content/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await csrf() },
        body: JSON.stringify({ data: next, revision, mode, note })
      });
      const result = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(result.error || (r.status === 401 ? 'Phiên đăng nhập hết hạn. Đăng nhập lại để lưu.' : 'Không lưu được nội dung.'));
      // Xuất bản có tự dịch: máy chủ trả bộ bản dịch mới → cập nhật ngay để lần lưu sau không làm mất
      setData(result.i18n !== undefined ? { ...next, i18n: result.i18n || undefined } : next);
      autoInfo.current = result.auto || null;
      setRevision(result.revision);
      setDraft(mode === 'draft' ? { hasDraft: true, updatedAt: Date.now(), author: null } : NO_DRAFT);
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không kết nối được máy chủ.');
      return false;
    }
  }

  const autoInfo = useRef<AutoTranslateInfo | null>(null);
  const takeAutoInfo = () => { const v = autoInfo.current; autoInfo.current = null; return v; };

  async function discardDraft() {
    try {
      const r = await fetch(`/api/admin/content/?revision=${revision}`, { method: 'DELETE', headers: { 'x-csrf-token': await csrf() } });
      const result = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(result.error || 'Không bỏ được bản nháp.');
      await refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không kết nối được máy chủ.');
      return false;
    }
  }

  return <Context.Provider value={{ data, save, discardDraft, refresh, ready: true, error, draft, revision, takeAutoInfo }}>{children}</Context.Provider>;
}

export const useSite = () => useContext(Context);
