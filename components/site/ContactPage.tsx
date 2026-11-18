'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useSite } from '../SiteStore';
import { VALID_BUSINESS_TYPES, VALID_CONTACT_SERVICES, isValidPhoneNumber } from '@/lib/contact-services';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs } from './ui';

type Fields = { name: string; phone: string; email: string; businessType: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: Fields): Errors {
  const e: Errors = {};
  const name = f.name.trim();
  if (name.length < 2 || name.length > 150) e.name = 'Vui lòng nhập họ và tên (2–150 ký tự).';
  if (!isValidPhoneNumber(f.phone.trim())) e.phone = 'Số điện thoại chưa đúng định dạng (ví dụ 0935 91 76 77).';
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = 'Email chưa đúng định dạng.';
  const msg = f.message.trim();
  if (msg.length < 3) e.message = 'Hãy mô tả ngắn gọn nhu cầu của bạn.';
  else if (msg.length > 5000) e.message = 'Nội dung tối đa 5.000 ký tự.';
  return e;
}

export function ContactPage({ initialService }: { initialService: string }) {
  const { data } = useSite();
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;

  const [fields, setFields] = useState<Fields>({
    name: '', phone: '', email: '', businessType: '', service: initialService, message: ''
  });
  const [trap, setTrap] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const set = (key: keyof Fields) => (ev: { target: { value: string } }) => {
    setFields(prev => ({ ...prev, [key]: ev.target.value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setStatus('sending');
    setFeedback('');
    try {
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, source: 'lien-he', website_trap: trap })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('ok');
        setFeedback(body.message || 'Cảm ơn bạn! Yêu cầu đã được gửi thành công.');
        setFields(prev => ({ ...prev, name: '', phone: '', email: '', message: '' }));
      } else {
        setStatus('error');
        setFeedback(body.error || 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại.');
      }
    } catch {
      setStatus('error');
      setFeedback('Không có kết nối mạng. Vui lòng thử lại hoặc gọi hotline.');
    }
  }

  const invalid = (k: keyof Fields) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `contact-${k}-err` } : {});
  const err = (k: keyof Fields) => errors[k] && <span id={`contact-${k}-err`} className="s-error">{errors[k]}</span>;

  return (
    <main id="main">
      <section className="s-section s-contact">
        <div className="s-container">
          <div className="s-contact-grid">
            <div className="s-contact-intro">
              <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Liên hệ' }]} />
              <p className="s-eyebrow">Liên hệ tư vấn</p>
              <h1 className="s-h1">Bắt đầu một cuộc trò chuyện cùng DANAVA</h1>
              <p className="s-lead">
                Chia sẻ bài toán của bạn, từ quản lý phòng tập, website đến truyền thông và sự kiện. Chuyên viên DANAVA sẽ liên hệ lại để tư vấn giải pháp phù hợp, không ràng buộc.
              </p>

              <ul className="s-contact-methods">
                <li>
                  <span className="s-icon" aria-hidden="true"><Phone /></span>
                  <div>
                    <p className="s-contact-methods__label">Hotline</p>
                    <a className="s-contact-methods__value" href={`tel:${phone}`}>{formatPhone(phone)}</a>
                  </div>
                </li>
                <li>
                  <span className="s-icon" aria-hidden="true"><Mail /></span>
                  <div>
                    <p className="s-contact-methods__label">Email</p>
                    <a className="s-contact-methods__value" href={`mailto:${email}`}>{email}</a>
                  </div>
                </li>
                <li>
                  <span className="s-icon" aria-hidden="true"><MapPin /></span>
                  <div>
                    <p className="s-contact-methods__label">Văn phòng</p>
                    <a className="s-contact-methods__value" href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer">
                      {CONTACT.address} <ArrowUpRight aria-hidden="true" className="s-contact-ext" />
                    </a>
                  </div>
                </li>
                <li>
                  <span className="s-icon" aria-hidden="true"><Clock /></span>
                  <div>
                    <p className="s-contact-methods__label">Giờ làm việc</p>
                    <p className="s-contact-methods__value">Thứ Hai – Thứ Bảy, 08:00 – 18:00</p>
                  </div>
                </li>
              </ul>

              <p className="s-small s-muted">
                Cần hỗ trợ kỹ thuật cho dịch vụ đang sử dụng? Xem <Link className="s-textlink" href="/chinh-sach-dich-vu/#kenh-tiep-nhan">kênh hỗ trợ kỹ thuật</Link>.
              </p>
            </div>

            <div className="s-card s-contact-card">
              <h2 className="s-h3">Gửi yêu cầu tư vấn</h2>
              <p className="s-small s-muted s-contact-card__sub">Các trường có dấu <span className="s-req">*</span> là bắt buộc.</p>

              {status === 'ok' ? (
                <div className="s-contact-done">
                  <div className="s-alert s-alert--ok" role="status">
                    <CheckCircle2 aria-hidden="true" />
                    <span>{feedback}</span>
                  </div>
                  <button type="button" className="s-btn s-btn--secondary" onClick={() => { setStatus('idle'); setFeedback(''); }}>
                    Gửi thêm yêu cầu khác
                  </button>
                </div>
              ) : (
                <form className="s-form" onSubmit={submit} noValidate>
                  <div className="s-honeypot" aria-hidden="true">
                    <label htmlFor="contact-website-trap">Website</label>
                    <input id="contact-website-trap" name="website_trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
                  </div>

                  <div className="s-form-grid">
                    <div className="s-field">
                      <label htmlFor="contact-name">Họ và tên <span className="s-req">*</span></label>
                      <input id="contact-name" className="s-input" name="name" autoComplete="name" maxLength={150} value={fields.name} onChange={set('name')} {...invalid('name')} />
                      {err('name')}
                    </div>
                    <div className="s-field">
                      <label htmlFor="contact-phone">Số điện thoại <span className="s-req">*</span></label>
                      <input id="contact-phone" className="s-input" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} value={fields.phone} onChange={set('phone')} {...invalid('phone')} />
                      {err('phone')}
                    </div>
                  </div>

                  <div className="s-field">
                    <label htmlFor="contact-email">Email</label>
                    <input id="contact-email" className="s-input" name="email" type="email" autoComplete="email" maxLength={200} value={fields.email} onChange={set('email')} {...invalid('email')} />
                    {err('email')}
                  </div>

                  <div className="s-form-grid">
                    <div className="s-field">
                      <label htmlFor="contact-businessType">Loại hình kinh doanh</label>
                      <select id="contact-businessType" className="s-select" name="businessType" value={fields.businessType} onChange={set('businessType')}>
                        <option value="">Chọn loại hình</option>
                        {VALID_BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="s-field">
                      <label htmlFor="contact-service">Dịch vụ quan tâm</label>
                      <select id="contact-service" className="s-select" name="service" value={fields.service} onChange={set('service')}>
                        {VALID_CONTACT_SERVICES.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="s-field">
                    <label htmlFor="contact-message">Nhu cầu của bạn <span className="s-req">*</span></label>
                    <textarea id="contact-message" className="s-textarea" name="message" maxLength={5000} placeholder="Ví dụ: Phòng tập 300 hội viên, cần quản lý gói tập và check-in QR…" value={fields.message} onChange={set('message')} {...invalid('message')} />
                    {err('message')}
                  </div>

                  {status === 'error' && (
                    <div className="s-alert s-alert--err" role="alert">
                      <AlertCircle aria-hidden="true" />
                      <span>{feedback}</span>
                    </div>
                  )}

                  <button type="submit" className="s-btn s-btn--primary s-btn--lg s-btn--block" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Đang gửi…' : 'Gửi yêu cầu'}
                  </button>
                  <p className="s-xs s-muted">
                    Bằng việc gửi biểu mẫu, bạn đồng ý với <Link className="s-textlink" href="/chinh-sach-rieng-tu/">chính sách riêng tư</Link> của DANAVA.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
