'use client';
/**
 * Liên hệ nhanh.
 * - Máy tính (> 860px): ba nút nổi bên trái — Zalo, Messenger, Hotline.
 * - Điện thoại: không có nút nổi (tránh che nội dung, CTA); nút "Tư vấn" ở thanh dưới mở ContactSheet.
 */
import Link from 'next/link';
import { useEffect } from 'react';
import { ChevronRight, Phone, PencilLine, X } from 'lucide-react';
import { useSite } from '../SiteStore';
import { contactChannels } from '@/lib/contact-channels';
import { formatPhone } from './catalog';
import { BrandIcon } from './BrandIcons';
import { useDialog } from './useDialog';

export function ContactDock() {
  const { data } = useSite();
  const { zalo, messenger, tel, phone } = contactChannels(data);
  return (
    <aside className="cd" aria-label="Liên hệ nhanh">
      {zalo && (
        <a className="cd__btn cd__btn--zalo" href={zalo} target="_blank" rel="noopener noreferrer" aria-label="Nhắn Zalo cho DANAVA (mở tab mới)">
          <BrandIcon name="zalo" /><span className="cd__tip" aria-hidden="true">Nhắn Zalo</span>
        </a>
      )}
      {messenger && (
        <a className="cd__btn cd__btn--messenger" href={messenger} target="_blank" rel="noopener noreferrer" aria-label="Nhắn Messenger cho DANAVA (mở tab mới)">
          <BrandIcon name="messenger" /><span className="cd__tip" aria-hidden="true">Nhắn Messenger</span>
        </a>
      )}
      {tel && (
        <a className="cd__btn cd__btn--call" href={tel} aria-label={`Gọi hotline ${formatPhone(phone)}`}>
          <Phone aria-hidden="true" /><span className="cd__tip" aria-hidden="true">Hotline {formatPhone(phone)}</span>
        </a>
      )}
    </aside>
  );
}

export function ContactSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useSite();
  const ref = useDialog(open, onClose);
  const { zalo, messenger, tel, phone } = contactChannels(data);

  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia('(min-width: 861px)');
    const close = () => { if (wide.matches) onClose(); };
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, [open, onClose]);

  return (
    <dialog ref={ref} id="s-contact-sheet" className="cs" aria-labelledby="cs-title" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cs__panel">
        <div className="cs__head">
          <h2 id="cs-title">DANAVA <em>tư vấn cho bạn</em></h2>
          <button type="button" className="cs__close" onClick={onClose} aria-label="Đóng" data-autofocus><X aria-hidden="true" /></button>
        </div>
        <ul>
          {zalo && (
            <li>
              <a className="cs__row" href={zalo} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                <span className="cs__icon cs__icon--zalo"><BrandIcon name="zalo" /></span>
                <span><b>Zalo</b><small>Nhắn tin cho DANAVA</small></span><ChevronRight aria-hidden="true" />
              </a>
            </li>
          )}
          {messenger && (
            <li>
              <a className="cs__row" href={messenger} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                <span className="cs__icon cs__icon--messenger"><BrandIcon name="messenger" /></span>
                <span><b>Messenger</b><small>Nhắn qua Fanpage</small></span><ChevronRight aria-hidden="true" />
              </a>
            </li>
          )}
          {tel && (
            <li>
              <a className="cs__row" href={tel} onClick={onClose}>
                <span className="cs__icon cs__icon--call"><Phone aria-hidden="true" /></span>
                <span><b>Hotline</b><small>{formatPhone(phone)}</small></span><ChevronRight aria-hidden="true" />
              </a>
            </li>
          )}
          <li>
            <Link className="cs__row" href="/lien-he/" onClick={onClose}>
              <span className="cs__icon"><PencilLine aria-hidden="true" /></span>
              <span><b>Gửi yêu cầu tư vấn</b><small>DANAVA sẽ liên hệ lại</small></span><ChevronRight aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </dialog>
  );
}
