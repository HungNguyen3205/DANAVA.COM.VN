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
import { useSite } from '../SiteStore';
import { ct } from './cms';
import { rich } from './rich';

const CHIPS = [
  { key: 'quote', label: 'Báo giá landing page', icon: true },
  { key: 'media', label: 'Truyền thông & nội dung', href: '/dich-vu/truyen-thong/' },
  { key: 'events', label: 'Tổ chức sự kiện', href: '/dich-vu/to-chuc-su-kien/' },
  { key: 'travel', label: 'Du lịch trải nghiệm', href: '/dich-vu/du-lich-trai-nghiem/' }
] as const;

export function DichVuAsk() {
  const { data } = useSite();
  const [open, setOpen] = useState(false);
  const kicker = ct(data, 'services.ask.kicker', 'Hỏi nhanh về dịch vụ', 'Dòng chữ nhỏ');
  // *…* = phần tô cam (.ask-title span)
  const title = ct(data, 'services.ask.title', 'Bạn đang cần *gì?*', 'Tiêu đề khối', { rich: true });
  const lead = ct(data, 'services.ask.lead', 'Chọn một gợi ý bên dưới. Với báo giá landing page, trợ lý sẽ hỏi từng câu ngay tại đây.', 'Câu dẫn', { multiline: true });
  const chipText = (chip: (typeof CHIPS)[number]) => ct(data, `services.ask.chips.${chip.key}`, chip.label, 'Chữ gợi ý');
  return (
    <section className="ask" aria-labelledby="ask-title">
      <div className="s-container">
        <p className="ask-kicker"><Sparkles aria-hidden="true" /><span {...kicker.a}>{kicker.v}</span></p>
        <h2 className="ask-title" id="ask-title" {...title.a}>{rich(title.v, 'ask-title__hl')}</h2>
        <p className="ask-lead" {...lead.a}>{lead.v}</p>

        <div className="ask-chips">
          {CHIPS.map(chip => {
            const x = chipText(chip);
            return chip.key === 'quote' ? (
              <button
                key={chip.key}
                type="button"
                className={`ask-chip${open ? ' is-on' : ''}`}
                aria-expanded={open}
                aria-controls="ask-quote"
                onClick={() => setOpen(v => !v)}
              >
                <Calculator aria-hidden="true" /><span {...x.a}>{x.v}</span>
              </button>
            ) : (
              <Link key={chip.key} className="ask-chip" href={chip.href}><span {...x.a}>{x.v}</span></Link>
            );
          })}
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
