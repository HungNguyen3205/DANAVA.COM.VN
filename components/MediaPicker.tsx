'use client';
/**
 * Ô chọn ảnh dùng chung trong admin: đường dẫn ảnh + xem trước + "Chọn từ thư viện" (mọi ảnh của website, chia nhóm) + "Tải ảnh mới".
 * MediaLibrary: màn Tài nguyên → Thư viện (components/admin/MediaBrowser.tsx).
 */
import { useEffect, useRef, useState } from 'react';
import { MediaBrowser } from './admin/MediaBrowser';
import { uploadMedia } from './upload-media';
import type { SiteData } from '@/lib/content';
export { uploadMedia } from './upload-media';

/** Nút "Chọn từ thư viện" + hộp thoại thư viện ảnh (mọi ảnh của website, chia nhóm). Bấm ảnh = chọn. */
export function LibraryButton({ value, onPick, className = 'admin-secondary', children }: { value?: string; onPick: (url: string) => void; className?: string; children?: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{children ?? '▦ Chọn từ thư viện'}</button>
      <dialog ref={dialog} className="mb-dialog ax-scope" aria-label="Chọn ảnh từ thư viện" onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
        <div className="mb-dialog__head">
          <b>Chọn ảnh từ thư viện</b>
          <button type="button" onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
        </div>
        {open && <MediaBrowser mode="pick" value={value} onPick={url => { onPick(url); setOpen(false); }} />}
      </dialog>
    </>
  );
}

export default function MediaPicker({ value, onChange, label = 'Ảnh' }: { value: string; onChange: (url: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState('');

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setNotice('');
    try { onChange(await uploadMedia(file)); setNotice('Đã tải ảnh. Bấm Lưu thay đổi để áp dụng vào nội dung.'); }
    catch (e) { setNotice(e instanceof Error ? e.message : 'Lỗi tải ảnh'); }
    setBusy(false);
    if (input.current) input.current.value = '';
  }

  return (
    <div className="media-picker">
      <label>
        {label}
        <input value={value} placeholder="/assets/..." onChange={(e) => onChange(e.target.value)} />
      </label>
      {value && <img className="media-picker-preview" src={value} alt="Xem trước ảnh đã chọn" />}
      <div className="media-picker-actions">
        <LibraryButton value={value} onPick={onChange} />
        <button type="button" className="admin-secondary" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Đang xử lý…' : '↑ Tải ảnh mới'}</button>
        {value && <button type="button" className="admin-secondary" onClick={() => onChange('')}>Gỡ ảnh</button>}
      </div>
      <input ref={input} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => upload(e.target.files?.[0])} />
      {notice && <p className="field-note" role="status">{notice}</p>}
    </div>
  );
}

/** Tài nguyên → Thư viện: mọi ảnh của website (có sẵn + tải lên), chia nhóm, xem ảnh đang được nội dung nào dùng. */
export function MediaLibrary({ data }: { data?: SiteData }) {
  return (
    <section className="admin-panel mb-page">
      <h2>Thư viện ảnh</h2>
      <p className="field-note">
        Toàn bộ ảnh trên website: ảnh có sẵn (chia theo khu vực: Thương hiệu, Sản phẩm, Dự án, Đối tác, Bài viết…) và ảnh tải lên từ admin.
        Bấm một ảnh để xem chi tiết, chép đường dẫn và biết nội dung nào đang dùng. Ảnh tải lên tự nén WebP và xóa thông tin EXIF.
      </p>
      <MediaBrowser mode="manage" data={data} />
    </section>
  );
}
