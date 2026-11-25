'use client';
/**
 * Liên hệ nhanh.
 * - Ba nút nổi Zalo, Messenger, Hotline xếp thành cột dọc sát mép phải:
 *   máy tính ở góc dưới (trên bé Mây), điện thoại ở góc trên (dưới header).
 * - Điện thoại: nút "Tư vấn" ở thanh dưới vẫn mở ContactSheet.
 */
import Link from 'next/link';
import { useEffect } from 'react';
import { ChevronRight, Phone, PencilLine, X } from 'lucide-react';
import { MayFigure } from './anna/MayFigure';
import { useSite } from '../SiteStore';
import { contactChannels } from '@/lib/contact-channels';
import { formatPhone } from './catalog';
import { BrandIcon } from './BrandIcons';
import { useDialog } from './useDialog';
import { useAnna } from './anna/AnnaProvider';
import { ct } from './cms';
import { rich } from './rich';
import { txt } from '@/lib/site-text';
import type { SiteData } from '@/lib/content';

/** Chữ cố định của nút / bảng liên hệ nhanh (khóa contactdock.*, dùng chung toàn website). */
const cd = (data: SiteData, k: string, def: string, label: string, rich = false) => ct(data, `contactdock.${k}`, def, label, { scope: 'global', rich });

export function ContactDock() {
  const { data } = useSite();
  const { zalo, messenger, tel, phone } = contactChannels(data);
  return (
    <aside className="cd" aria-label={txt(data, 'contactdock.aria', 'Liên hệ nhanh')}>
      {zalo && (
        <a className="cd__btn cd__btn--zalo" href={zalo} target="_blank" rel="noopener noreferrer" aria-label={txt(data, 'contactdock.zalo-aria', 'Nhắn Zalo cho DANAVA (mở tab mới)')}>
          <BrandIcon name="zalo" word />{(() => { const x = cd(data, 'dock.zalo', 'Nhắn Zalo', 'Chú thích nút Zalo'); return <span className="cd__tip" aria-hidden="true" {...x.a}>{x.v}</span>; })()}
        </a>
      )}
      {messenger && (
        <a className="cd__btn cd__btn--messenger" href={messenger} target="_blank" rel="noopener noreferrer" aria-label={txt(data, 'contactdock.messenger-aria', 'Nhắn Messenger cho DANAVA (mở tab mới)')}>
          <BrandIcon name="messenger" />{(() => { const x = cd(data, 'dock.messenger', 'Nhắn Messenger', 'Chú thích nút Messenger'); return <span className="cd__tip" aria-hidden="true" {...x.a}>{x.v}</span>; })()}
        </a>
      )}
      {tel && (
        <a className="cd__btn cd__btn--call" href={tel} aria-label={`${txt(data, 'contactdock.call-aria', 'Gọi hotline')} ${formatPhone(phone)}`}>
          <Phone aria-hidden="true" /><span className="cd__tip" aria-hidden="true">{(() => { const x = cd(data, 'dock.hotline', 'Hotline', 'Chú thích nút gọi'); return <span style={{ display: 'inline' }} {...x.a}>{x.v}</span>; })()} {formatPhone(phone)}</span>
        </a>
      )}
    </aside>
  );
}

export function ContactSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useSite();
  const ref = useDialog(open, onClose);
  const anna = useAnna();
  const { zalo, messenger, tel, phone } = contactChannels(data);
  const title = cd(data, 'sheet.title', 'DANAVA *tư vấn cho bạn*', 'Tiêu đề bảng liên hệ', true);
  /** Tên + dòng phụ của một hàng trong bảng liên hệ */
  const row = (id: string, name: string, sub?: string) => {
    const n = cd(data, `sheet.${id}.name`, name, 'Tên kênh liên hệ');
    const s = sub === undefined ? null : cd(data, `sheet.${id}.sub`, sub, 'Dòng phụ kênh liên hệ');
    return <span><b {...n.a}>{n.v}</b>{s ? <small {...s.a}>{s.v}</small> : <small>{formatPhone(phone)}</small>}</span>;
  };

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
          <h2 id="cs-title" {...title.a}>{rich(title.v)}</h2>
          <button type="button" className="cs__close" onClick={onClose} aria-label={txt(data, 'contactdock.sheet.close', 'Đóng')} data-autofocus><X aria-hidden="true" /></button>
        </div>
        <ul>
          {anna.enabled && (
            <li>
              <button type="button" className="cs__row cs__row--anna" onClick={() => { onClose(); anna.ask(); }}>
                <span className="cs__icon cs__icon--anna"><MayFigure /></span>
                {row('anna', 'Hỏi ANNA', 'Trợ lý AI, báo giá nhanh')}<ChevronRight aria-hidden="true" />
              </button>
            </li>
          )}
          {zalo && (
            <li>
              <a className="cs__row" href={zalo} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                <span className="cs__icon cs__icon--zalo"><BrandIcon name="zalo" /></span>
                {row('zalo', 'Zalo', 'Nhắn tin cho DANAVA')}<ChevronRight aria-hidden="true" />
              </a>
            </li>
          )}
          {messenger && (
            <li>
              <a className="cs__row" href={messenger} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                <span className="cs__icon cs__icon--messenger"><BrandIcon name="messenger" /></span>
                {row('messenger', 'Messenger', 'Nhắn qua Fanpage')}<ChevronRight aria-hidden="true" />
              </a>
            </li>
          )}
          {tel && (
            <li>
              <a className="cs__row" href={tel} onClick={onClose}>
                <span className="cs__icon cs__icon--call"><Phone aria-hidden="true" /></span>
                {row('hotline', 'Hotline')}<ChevronRight aria-hidden="true" />
              </a>
            </li>
          )}
          <li>
            <Link className="cs__row" href="/lien-he/" onClick={onClose}>
              <span className="cs__icon"><PencilLine aria-hidden="true" /></span>
              {row('form', 'Gửi yêu cầu tư vấn', 'DANAVA sẽ liên hệ lại')}<ChevronRight aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </dialog>
  );
}
