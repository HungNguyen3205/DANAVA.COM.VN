import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, MapPin, Target, Users } from 'lucide-react';
import type { Feature } from '@/lib/content';

const REQUEST_DETAILS = [
  { icon: CalendarDays, label: 'Thời gian dự kiến' },
  { icon: MapPin, label: 'Địa điểm mong muốn' },
  { icon: Users, label: 'Số lượng khách mời' },
  { icon: Target, label: 'Mục tiêu chương trình' }
];

const REHEARSAL_CHECKS = [
  'Kiểm tra sân khấu, âm thanh và ánh sáng',
  'Chạy thử kịch bản và các phần chuyển tiếp',
  'Phối hợp MC, kỹ thuật viên và đội đón khách'
];

export function EventsPlanning({ steps, pricing, contactHref }: { steps: Feature[]; pricing: string; contactHref: string }) {
  return (
    <>
      {steps.length > 0 && (
        <section className="ev-process" id="quy-trinh" aria-labelledby="svc-process">
          <div className="s-container ev-process__grid">
            <div className="ev-process__heading">
              <p className="ev-head__kicker">Quy trình triển khai</p>
              <h2 className="ev-head__title" id="svc-process">Từ ý tưởng <em>đến ngày diễn ra.</em></h2>
            </div>
            <ol className="ev-timeline">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <span className="ev-timeline__step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <img className="ev-process__photo" src="/assets/profile/ariyana-booth.webp" alt="Booth trưng bày đã hoàn thiện tại Ariyana" width={1600} height={968} loading="lazy" decoding="async" />
          </div>
        </section>
      )}

      {pricing && (
        <section className="ev-estimate" id="bao-gia" aria-labelledby="svc-pricing">
          <div className="s-container">
            <div className="ev-estimate__panel">
              <div>
                <p className="ev-head__kicker">Báo giá</p>
                <h2 className="ev-head__title" id="svc-pricing">Chi phí theo <em>quy mô sự kiện.</em></h2>
                <p className="ev-estimate__lead">{pricing}</p>
                <Link className="s-btn s-btn--primary" href={contactHref}>Nhận báo giá <ArrowRight aria-hidden="true" /></Link>
              </div>
              <div className="ev-estimate__brief">
                <h3>Thông tin cần chuẩn bị</h3>
                <ul>
                  {REQUEST_DETAILS.map(item => <li key={item.label}><item.icon aria-hidden="true" />{item.label}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="ev-rehearsal" aria-labelledby="ev-after">
        <div className="s-container ev-rehearsal__grid">
          <img className="ev-rehearsal__photo" src="/assets/profile/pnj-1.webp" alt="Không gian sự kiện được chuẩn bị tại Aeon Mall Huế" width={1600} height={1576} loading="lazy" decoding="async" />
          <div>
            <p className="ev-head__kicker">Trước giờ đón khách</p>
            <h2 className="ev-head__title" id="ev-after">Tổng duyệt <em>tại địa điểm tổ chức.</em></h2>
            <ul className="ev-rehearsal__checks">
              {REHEARSAL_CHECKS.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}
            </ul>
            <Link className="s-link" href={contactHref}>Gửi yêu cầu <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
