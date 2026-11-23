'use client';
/*
 * Trang "Thiết kế landing page" (/dich-vu/landing-page/): giới thiệu ngắn + form nhập yêu cầu ngay trên trang.
 * Gửi qua /api/lead (cùng kênh tư vấn), nguồn `dich-vu-landing-page`.
 */
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Send } from 'lucide-react';
import { isValidPhoneNumber } from '@/lib/contact-services';
import { CONTACT } from '@/components/site/catalog';
import type { Service } from '@/lib/content';

const NEEDS = ['Chiến dịch quảng cáo cần trang đích', 'Sản phẩm hoặc dịch vụ mới cần ra mắt', 'Dự án bất động sản, sự kiện, khóa học', 'Khác / chưa rõ'];

export function LandingLeadPage({ service }: { service: Service }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', business: '', need: NEEDS[0], note: '', trap: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [key]: e.target.value }));

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
        <div className="s-container lp-grid">
          <div className="lp-copy">
            <p className="lp-kicker">Thiết kế landing page</p>
            <h1 className="lp-title">Một trang đích <span>chốt khách</span> trong vài giây đầu</h1>
            <p className="lp-lead">{service.heroLead || service.description}</p>
            <ul className="lp-points">
              {service.items.slice(0, 4).map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}
            </ul>
            <p className="lp-alt">Muốn báo giá chi tiết theo nhu cầu? <Link href="/bao-gia-web/">Trò chuyện để nhận báo giá tham khảo <ArrowRight aria-hidden="true" /></Link></p>
          </div>

          <div className="lp-card" id="nhan-tu-van">
            {status === 'done' ? (
              <div className="lp-done" role="status">
                <span className="lp-done__ico" aria-hidden="true"><Check /></span>
                <h2>Cảm ơn bạn! Đã nhận yêu cầu.</h2>
                <p>Chuyên viên DANAVA sẽ liên hệ để tư vấn và báo giá. Cần gấp? Gọi <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>.</p>
              </div>
            ) : (
              <form className="lp-form" onSubmit={submit} noValidate>
                <h2>Nhận tư vấn landing page</h2>
                <p className="lp-form__sub">Để lại thông tin, chúng tôi sẽ liên hệ trong thời gian sớm nhất.</p>
                <div className="s-honeypot" aria-hidden="true">
                  <label htmlFor="lp-trap">Website</label>
                  <input id="lp-trap" name="website_trap" tabIndex={-1} autoComplete="off" value={form.trap} onChange={set('trap')} />
                </div>
                <label className="lp-field"><span>Họ và tên *</span><input autoComplete="name" value={form.name} onChange={set('name')} maxLength={150} /></label>
                <label className="lp-field"><span>Số điện thoại / Zalo *</span><input type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} maxLength={25} /></label>
                <label className="lp-field"><span>Email</span><input type="email" autoComplete="email" value={form.email} onChange={set('email')} maxLength={200} /></label>
                <label className="lp-field"><span>Lĩnh vực hoạt động</span><input value={form.business} onChange={set('business')} maxLength={150} placeholder="Ví dụ: phòng tập yoga" /></label>
                <label className="lp-field"><span>Nhu cầu của bạn</span>
                  <select value={form.need} onChange={set('need')}>{NEEDS.map(n => <option key={n}>{n}</option>)}</select>
                </label>
                <label className="lp-field"><span>Ghi chú</span><textarea rows={3} value={form.note} onChange={set('note')} maxLength={2000} /></label>
                {error && <p className="lp-error" role="alert">{error}</p>}
                <button type="submit" className="lp-btn" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Đang gửi…' : <>Gửi yêu cầu <Send aria-hidden="true" /></>}
                </button>
                <p className="lp-note">Thông tin chỉ dùng để liên hệ tư vấn. Gọi trực tiếp: {CONTACT.phoneDisplay}</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
