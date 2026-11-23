'use client';
/*
 * Khối "Bạn đang cần gì? Hỏi nhanh" trên trang Dịch vụ (kiểu khối hỏi ANNA ở trang chủ).
 * Bấm một gợi ý: nếu là báo giá landing page thì chatbot mở ngay bên dưới và hỏi từng câu;
 * các gợi ý khác dẫn tới trang dịch vụ tương ứng.
 */
import Link from 'next/link';
import { useState } from 'react';
import { Calculator, Sparkles } from 'lucide-react';
import { QuoteChat } from '@/components/site/QuoteChat';

const CHIPS = [
  { key: 'quote', label: 'Báo giá landing page', icon: true },
  { key: 'media', label: 'Truyền thông & nội dung', href: '/dich-vu/truyen-thong/' },
  { key: 'events', label: 'Tổ chức sự kiện', href: '/dich-vu/to-chuc-su-kien/' },
  { key: 'travel', label: 'Du lịch trải nghiệm', href: '/dich-vu/du-lich-trai-nghiem/' }
] as const;

export function DichVuAsk() {
  const [open, setOpen] = useState(false);
  return (
    <section className="ask" aria-labelledby="ask-title">
      <div className="s-container">
        <p className="ask-kicker"><Sparkles aria-hidden="true" />Hỏi nhanh về dịch vụ</p>
        <h2 className="ask-title" id="ask-title">Bạn đang cần <span>gì?</span></h2>
        <p className="ask-lead">Chọn một gợi ý bên dưới. Với báo giá landing page, trợ lý sẽ hỏi từng câu ngay tại đây.</p>

        <div className="ask-chips">
          {CHIPS.map(chip => chip.key === 'quote' ? (
            <button
              key={chip.key}
              type="button"
              className={`ask-chip${open ? ' is-on' : ''}`}
              aria-expanded={open}
              aria-controls="ask-quote"
              onClick={() => setOpen(v => !v)}
            >
              <Calculator aria-hidden="true" />{chip.label}
            </button>
          ) : (
            <Link key={chip.key} className="ask-chip" href={chip.href}>{chip.label}</Link>
          ))}
        </div>

        {open && (
          <div className="ask-panel" id="ask-quote">
            <QuoteChat />
          </div>
        )}
      </div>
    </section>
  );
}
