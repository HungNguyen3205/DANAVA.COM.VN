'use client';
/*
 * Trang "Thiết kế landing page" (/dich-vu/landing-page/): bé Mây dẫn dắt khách.
 * Mây chào trong bong bóng, nghiêng về phía form khi khách đang nhập, và báo lại khi đã gửi.
 * Gửi qua /api/lead (cùng kênh tư vấn), nguồn `dich-vu-landing-page`.
 */
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useSubmitLock } from './useSubmitLock';
import { ArrowRight, Check, MessageCircle, Send } from 'lucide-react';
import { isValidPhoneNumber } from '@/lib/contact-services';
import { CONTACT } from '@/components/site/catalog';
import { MayFigure } from '@/components/site/anna/MayFigure';
import type { Service } from '@/lib/content';
import { useSite } from '../SiteStore';
import { ct } from './cms';
import { rich } from './rich';

const NEEDS = ['Chiến dịch quảng cáo cần trang đích', 'Sản phẩm hoặc dịch vụ mới cần ra mắt', 'Dự án bất động sản, sự kiện, khóa học', 'Khác / chưa rõ'];

const STEPS = [
  // k = khóa chữ sửa được landing.steps.<k>.*
  { no: '01', title: 'Bạn kể nhu cầu', text: 'Để lại vài thông tin ngắn ở form bên cạnh.' },
  { no: '02', title: 'Mây ghi lại', text: 'Mây chuyển yêu cầu đến đội ngũ DANAVA.' },
  { no: '03', title: 'DANAVA báo giá', text: 'Chuyên viên liên hệ và đề xuất phạm vi, giá tham khảo.' }
];

type Mood = 'hello' | 'listening' | 'sent';
const LINES: Record<Mood, string> = {
  hello: 'Chào bạn! Mình là Mây. Điền vài thông tin, mình sẽ chuyển cho DANAVA lo phần còn lại.',
  listening: 'Mình đang lắng nghe bạn. Cứ điền thoải mái nhé!',
  sent: 'Cảm ơn bạn! Mây đã chuyển yêu cầu, DANAVA sẽ liên hệ sớm.'
};

export function LandingLeadPage({ service }: { service: Service }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', business: '', need: NEEDS[0], note: '', trap: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const { data } = useSite();
  /** Chữ cố định sửa được trong trình biên tập (khóa landing.*). */
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `landing.${k}`, def, label, opts);
  const T = (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = t(k, def, label, opts); return <span {...x.a}>{x.v}</span>; };
  const kicker = t('kicker', 'Thiết kế landing page', 'Dòng chữ nhỏ');
  const title = t('title', 'Một trang đích *chốt khách* trong vài giây đầu', 'Tiêu đề chính', { rich: true });
  const lead = t('lead', service.heroLead || service.description, 'Câu dẫn', { multiline: true });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [key]: e.target.value }));

  const mood: Mood = status === 'done' ? 'sent' : typing ? 'listening' : 'hello';
  const line = t(`may.${mood}`, LINES[mood], 'Lời Mây nói', { multiline: true });

  const lock = useSubmitLock();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Vui lòng nhập họ và tên.');
    if (!isValidPhoneNumber(form.phone.trim())) return setError('Số điện thoại chưa đúng, bạn kiểm tra lại giúp mình.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Email chưa đúng định dạng.');
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          businessType: form.business.trim(),
          service: 'Landing page',
          message: `Nhu cầu: ${form.need}\n${form.note.trim() || 'Không có ghi chú.'}`,
          source: 'dich-vu-landing-page',
          website_trap: form.trap
        })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Chưa gửi được, bạn thử lại giúp mình.');
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Chưa gửi được, bạn thử lại giúp mình.');
    }
  };

  return (
    <main id="main" className="lp">
      <section className="lp-hero">
        <div className={`s-container lp-grid${typing ? " is-typing" : ""}`}>
          <div className="lp-copy">
            <p className="lp-kicker" {...kicker.a}>{kicker.v}</p>
            <h1 className="lp-title" {...title.a}>{rich(title.v, 'lp-em')}</h1>
            <p className="lp-lead" {...lead.a}>{lead.v}</p>

            <div className="lp-mayspeak" aria-live="polite">
              <span className="lp-may" aria-hidden="true"><MayFigure /></span>
              <p className="lp-bubble" {...line.a}>{line.v}</p>
            </div>

            <ol className="lp-steps" aria-label="Quy trình">
              {STEPS.map((s, i) => {
                const st = t(`steps.${i}.title`, s.title, 'Tên bước'), sx = t(`steps.${i}.text`, s.text, 'Mô tả bước', { multiline: true });
                return (
                  <li key={s.no}>
                    <span className="lp-steps__no">{s.no}</span>
                    <strong {...st.a}>{st.v}</strong>
                    <small {...sx.a}>{sx.v}</small>
                  </li>
                );
              })}
            </ol>

            <ul className="lp-points">
              {service.items.slice(0, 4).map((item, i) => <li key={item}><Check aria-hidden="true" />{T(`points.${i}`, item, 'Hạng mục')}</li>)}
            </ul>
            <p className="lp-alt"><MessageCircle aria-hidden="true" /> {T('alt.text', 'Muốn báo giá chi tiết theo nhu cầu?', 'Câu gợi ý báo giá')} <Link href="/bao-gia-web/">{T('alt.link', 'Trò chuyện với Mây để nhận báo giá tham khảo', 'Chữ liên kết báo giá')} <ArrowRight aria-hidden="true" /></Link></p>
          </div>

          <div className={`lp-card${typing ? ' is-typing' : ''}`} id="nhan-tu-van">
            {status === 'done' ? (
              <div className="lp-done" role="status">
                <span className="lp-done__ico" aria-hidden="true"><Check /></span>
                <h2>{T('done.title', 'Cảm ơn bạn! Đã nhận yêu cầu.', 'Đã gửi: tiêu đề')}</h2>
                <p>{T('done.text', 'Chuyên viên DANAVA sẽ liên hệ để tư vấn và báo giá. Cần gấp? Gọi', 'Đã gửi: lời nhắn (trước số điện thoại)')} <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>.</p>
              </div>
            ) : (
              <form
                className="lp-form"
                onSubmit={lock(submit)}
                onFocus={() => setTyping(true)}
                onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setTyping(false); }}
                noValidate
              >
                {(() => { const h = t('form.title', 'Nhận tư vấn landing page', 'Tiêu đề form'), sub = t('form.sub', 'Để lại thông tin, chúng tôi sẽ liên hệ trong thời gian sớm nhất.', 'Câu dẫn form', { multiline: true }); return <><h2 {...h.a}>{h.v}</h2><p className="lp-form__sub" {...sub.a}>{sub.v}</p></>; })()}
                <div className="s-honeypot" aria-hidden="true">
                  <label htmlFor="lp-trap">Website</label>
                  <input id="lp-trap" name="website_trap" tabIndex={-1} autoComplete="off" value={form.trap} onChange={set('trap')} />
                </div>
                <label className="lp-field">{T('form.name', 'Họ và tên *', 'Nhãn ô nhập')}<input autoComplete="name" value={form.name} onChange={set('name')} maxLength={150} /></label>
                <label className="lp-field">{T('form.phone', 'Số điện thoại / Zalo *', 'Nhãn ô nhập')}<input type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} maxLength={25} /></label>
                <label className="lp-field">{T('form.email', 'Email', 'Nhãn ô nhập')}<input type="email" autoComplete="email" value={form.email} onChange={set('email')} maxLength={200} /></label>
                <label className="lp-field">{T('form.business', 'Lĩnh vực hoạt động', 'Nhãn ô nhập')}<input value={form.business} onChange={set('business')} maxLength={150} placeholder="Ví dụ: phòng tập yoga" /></label>
                <label className="lp-field">{T('form.need', 'Nhu cầu của bạn', 'Nhãn ô nhập')}
                  <select value={form.need} onChange={set('need')}>{NEEDS.map(n => <option key={n}>{n}</option>)}</select>
                </label>
                <label className="lp-field">{T('form.note', 'Ghi chú', 'Nhãn ô nhập')}<textarea rows={3} value={form.note} onChange={set('note')} maxLength={2000} /></label>
                {error && <p className="lp-error" role="alert">{error}</p>}
                <button type="submit" className="lp-btn" disabled={status === 'sending'}>
                  {status === 'sending' ? T('form.sending', 'Đang gửi…', 'Nút gửi: đang gửi') : <>{T('form.submit', 'Gửi cho Mây', 'Nút gửi')} <Send aria-hidden="true" /></>}
                </button>
                <p className="lp-note">{T('form.note', 'Thông tin chỉ dùng để liên hệ tư vấn. Gọi trực tiếp:', 'Ghi chú cuối form (trước số điện thoại)')} {CONTACT.phoneDisplay}</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
