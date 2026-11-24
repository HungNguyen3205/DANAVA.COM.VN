import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, MapPin, Target, Users } from 'lucide-react';
import type { Feature } from '@/lib/content';
import { ct , cmsText } from './cms';
import { rich } from './rich';
import { txt } from '@/lib/site-text';

/** Chữ cố định của phần quy trình / báo giá / tổng duyệt (khóa events.planning.*). Máy chủ: ct(null) đọc kho của yêu cầu. */
const pt = (k: string, def: string, label: string, isRich = false) => ct(null, `events.planning.${k}`, def, label, { rich: isRich });
const ps = (k: string, def: string, label: string, inline = false) => { const x = pt(k, def, label); return <span style={inline ? { display: 'inline' } : undefined} {...x.a}>{x.v}</span>; };

const REQUEST_DETAILS = [
  { id: 'time', icon: CalendarDays, label: 'Thời gian dự kiến' },
  { id: 'venue', icon: MapPin, label: 'Địa điểm mong muốn' },
  { id: 'guests', icon: Users, label: 'Số lượng khách mời' },
  { id: 'goal', icon: Target, label: 'Mục tiêu chương trình' }
];

const REHEARSAL_CHECKS = [
  'Kiểm tra sân khấu, âm thanh và ánh sáng',
  'Chạy thử kịch bản và các phần chuyển tiếp',
  'Phối hợp MC, kỹ thuật viên và đội đón khách'
];

export function EventsPlanning({ steps, pricing, contactHref, rec }: { steps: Feature[]; pricing: string; contactHref: string; rec?: { base: string; label: string } }) {
  // Bước quy trình + câu báo giá lấy từ hồ sơ sản phẩm → sửa / dịch thẳng vào hồ sơ
  const R = (sub: string, what: string, multiline = false) => (rec ? cmsText(`${rec.base}.${sub}`, what, { multiline, scope: 'record', scopeLabel: rec.label }) : {});
  const processT = pt('process.title', 'Từ ý tưởng *đến ngày diễn ra.*', 'Tiêu đề', true);
  const pricingT = pt('pricing.title', 'Chi phí theo *quy mô sự kiện.*', 'Tiêu đề', true);
  const rehearsalT = pt('rehearsal.title', 'Tổng duyệt *tại địa điểm tổ chức.*', 'Tiêu đề', true);
  return (
    <>
      {steps.length > 0 && (
        <section className="ev-process" id="quy-trinh" aria-labelledby="svc-process">
          <div className="s-container ev-process__grid">
            <div className="ev-process__heading">
              <p className="ev-head__kicker">{ps('process.kicker', 'Quy trình triển khai', 'Dòng chữ nhỏ')}</p>
              <h2 className="ev-head__title" id="svc-process" {...processT.a}>{rich(processT.v)}</h2>
            </div>
            <ol className="ev-timeline">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <span className="ev-timeline__step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 {...R(`process.${i}.title`, 'Tên bước')}>{step.title}</h3>
                    <p {...R(`process.${i}.text`, 'Mô tả bước', true)}>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <img className="ev-process__photo" src="/assets/profile/ariyana-booth.webp" alt={txt(null, 'events.planning.process.photo-alt', 'Booth trưng bày đã hoàn thiện tại Ariyana')} width={1600} height={968} loading="lazy" decoding="async" />
          </div>
        </section>
      )}

      {pricing && (
        <section className="ev-estimate" id="bao-gia" aria-labelledby="svc-pricing">
          <div className="s-container">
            <div className="ev-estimate__panel">
              <div>
                <p className="ev-head__kicker">{ps('pricing.kicker', 'Báo giá', 'Dòng chữ nhỏ')}</p>
                <h2 className="ev-head__title" id="svc-pricing" {...pricingT.a}>{rich(pricingT.v)}</h2>
                <p className="ev-estimate__lead" {...R('pricing', 'Cách báo giá', true)}>{pricing}</p>
                <Link className="s-btn s-btn--primary" href={contactHref}>{ps('pricing.button', 'Nhận báo giá', 'Nút nhận báo giá', true)} <ArrowRight aria-hidden="true" /></Link>
              </div>
              <div className="ev-estimate__brief">
                <h3>{ps('pricing.brief', 'Thông tin cần chuẩn bị', 'Tiêu đề danh sách')}</h3>
                <ul>
                  {REQUEST_DETAILS.map(item => <li key={item.id}><item.icon aria-hidden="true" />{ps(`pricing.details.${item.id}`, item.label, 'Thông tin cần chuẩn bị', true)}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="ev-rehearsal" aria-labelledby="ev-after">
        <div className="s-container ev-rehearsal__grid">
          <img className="ev-rehearsal__photo" src="/assets/profile/pnj-1.webp" alt={txt(null, 'events.planning.rehearsal.photo-alt', 'Không gian sự kiện được chuẩn bị tại Aeon Mall Huế')} width={1600} height={1576} loading="lazy" decoding="async" />
          <div>
            <p className="ev-head__kicker">{ps('rehearsal.kicker', 'Trước giờ đón khách', 'Dòng chữ nhỏ')}</p>
            <h2 className="ev-head__title" id="ev-after" {...rehearsalT.a}>{rich(rehearsalT.v)}</h2>
            <ul className="ev-rehearsal__checks">
              {REHEARSAL_CHECKS.map((item, i) => <li key={item}><Check aria-hidden="true" />{ps(`rehearsal.checks.${i}`, item, 'Việc kiểm tra trước giờ đón khách', true)}</li>)}
            </ul>
            <Link className="s-link" href={contactHref}>{ps('rehearsal.button', 'Gửi yêu cầu', 'Nút gửi yêu cầu', true)} <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
