'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Phone, Mail, MapPin, Clock, CheckCircle2, AlertCircle, ArrowRight, MessageCircle,
  ThumbsUp, PlayCircle, Building2, LifeBuoy
} from 'lucide-react';
import { useSite } from '../SiteStore';
import { VALID_BUSINESS_TYPES, VALID_CONTACT_SERVICES, isValidPhoneNumber } from '@/lib/contact-services';
import { SERVICE_POLICY_METADATA } from '@/lib/service-policy';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs } from './ui';

type Fields = { name: string; phone: string; email: string; businessType: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kênh chính thức của DANAVA (lấy từ trang Liên hệ trên website cũ). */
const SOCIAL = {
  zalo: `https://zalo.me/${CONTACT.phone}`,
  facebook: 'https://www.facebook.com/danava.com.vn',
  youtube: 'https://www.youtube.com/@danavasolutions'
};
const HOURS = 'Thứ Hai – Thứ Bảy, 08:00 – 18:00';
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(SERVICE_POLICY_METADATA.address)}&output=embed`;

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

/** Nhãn ngắn cho nút chọn dịch vụ: phần trước dấu "—" hoặc cả nhãn. */
const shortLabel = (label: string) => label.split(' — ')[0].split(' & ')[0];

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
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Hộp xác nhận: đưa focus vào nút, đóng bằng Esc.
  useEffect(() => {
    if (status !== 'ok') return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setStatus('idle'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status]);

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
      {/* Hero */}
      <section className="c-hero">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Liên hệ' }]} />
          <p className="c-hero__eyebrow">Liên hệ</p>
          <h1 className="c-hero__title">Liên hệ DANAVA Solutions — <em>tư vấn miễn phí</em>, không ràng buộc</h1>
          <p className="c-hero__lead">
            Chia sẻ bài toán của bạn, từ quản lý phòng tập, website đến truyền thông và sự kiện. Chuyên viên DANAVA sẽ gọi lại để tư vấn giải pháp và báo giá phù hợp.
          </p>
          <div className="c-hero__actions">
            <a className="s-btn s-btn--primary s-btn--lg" href={`tel:${phone}`}><Phone aria-hidden="true" />Gọi ngay {formatPhone(phone)}</a>
            <a className="s-btn s-btn--outline-light s-btn--lg" href="#dang-ky-tu-van">Gửi yêu cầu tư vấn <ArrowRight aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      {/* 4 kênh liên hệ */}
      <div className="s-container">
        <div className="c-channels">
          <a className="c-channel c-channel--amber" href={`tel:${phone}`}>
            <span className="c-channel__icon" aria-hidden="true"><Phone /></span>
            <span><span className="c-channel__label">Hotline</span><br /><span className="c-channel__value">{formatPhone(phone)}</span></span>
            <span className="c-channel__more">Gọi ngay <ArrowRight aria-hidden="true" /></span>
          </a>
          <a className="c-channel" href={`mailto:${email}`}>
            <span className="c-channel__icon" aria-hidden="true"><Mail /></span>
            <span><span className="c-channel__label">Email</span><br /><span className="c-channel__value">{email}</span></span>
            <span className="c-channel__more">Gửi email <ArrowRight aria-hidden="true" /></span>
          </a>
          <a className="c-channel c-channel--sky" href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">
            <span className="c-channel__icon" aria-hidden="true"><ThumbsUp /></span>
            <span><span className="c-channel__label">Fanpage</span><br /><span className="c-channel__value">DANAVA Solutions</span></span>
            <span className="c-channel__more">Theo dõi <ArrowRight aria-hidden="true" /></span>
          </a>
          <a className="c-channel c-channel--red" href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer">
            <span className="c-channel__icon" aria-hidden="true"><PlayCircle /></span>
            <span><span className="c-channel__label">YouTube</span><br /><span className="c-channel__value">@danavasolutions</span></span>
            <span className="c-channel__more">Đăng ký kênh <ArrowRight aria-hidden="true" /></span>
          </a>
        </div>
      </div>

      {/* 01 / Liên hệ */}
      <section className="c-section" id="dang-ky-tu-van" aria-labelledby="c-form-heading">
        <div className="s-container">
          <p className="c-label"><b>01</b> / Liên hệ</p>
          <h2 className="c-heading">Kể cho chúng tôi về dự án của bạn — DANAVA phản hồi trong giờ làm việc</h2>

          <div className="c-grid">
            <aside className="c-direct" aria-label="Thông tin liên hệ trực tiếp">
              <h3>Liên hệ trực tiếp</h3>
              <div className="c-direct__list">
                <div className="c-direct__item">
                  <Phone aria-hidden="true" />
                  <div><p>Hotline · Zalo</p><a href={`tel:${phone}`}>{formatPhone(phone)}</a></div>
                </div>
                <div className="c-direct__item">
                  <Mail aria-hidden="true" />
                  <div><p>Email tư vấn</p><a href={`mailto:${email}`}>{email}</a></div>
                </div>
                <div className="c-direct__item">
                  <LifeBuoy aria-hidden="true" />
                  <div><p>Hỗ trợ kỹ thuật</p><a href={`mailto:${SERVICE_POLICY_METADATA.supportEmail}`}>{SERVICE_POLICY_METADATA.supportEmail}</a></div>
                </div>
                <div className="c-direct__item">
                  <Clock aria-hidden="true" />
                  <div><p>Giờ làm việc</p><span>{HOURS}</span></div>
                </div>
              </div>

              <div className="c-direct__chat">
                <a className="s-btn s-btn--primary" href={SOCIAL.zalo} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Chat Zalo</a>
                <a className="s-btn s-btn--outline-light" href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">Nhắn Fanpage</a>
              </div>

              <div className="c-direct__legal">
                <strong>{SERVICE_POLICY_METADATA.companyName}</strong>
                Đại diện: {SERVICE_POLICY_METADATA.representative}<br />
                Trụ sở: {SERVICE_POLICY_METADATA.address}
              </div>
            </aside>

            <div className="c-form">
              <h3 id="c-form-heading">Đăng ký tư vấn</h3>
              <p className="c-form__sub">Các trường có dấu <span className="s-req">*</span> là bắt buộc. Thông tin chỉ dùng để liên hệ tư vấn.</p>

              <form className="s-form" onSubmit={submit} noValidate>
                <div className="s-honeypot" aria-hidden="true">
                  <label htmlFor="contact-website-trap">Website</label>
                  <input id="contact-website-trap" name="website_trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
                </div>

                <fieldset className="c-chips">
                  <legend>Bạn quan tâm dịch vụ nào?</legend>
                  {VALID_CONTACT_SERVICES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className="c-chip"
                      aria-pressed={fields.service === s.label}
                      title={s.label}
                      onClick={() => setFields(prev => ({ ...prev, service: s.label }))}
                    >
                      {shortLabel(s.label)}
                    </button>
                  ))}
                </fieldset>

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

                <div className="s-form-grid">
                  <div className="s-field">
                    <label htmlFor="contact-email">Email</label>
                    <input id="contact-email" className="s-input" name="email" type="email" autoComplete="email" maxLength={200} value={fields.email} onChange={set('email')} {...invalid('email')} />
                    {err('email')}
                  </div>
                  <div className="s-field">
                    <label htmlFor="contact-businessType">Loại hình kinh doanh</label>
                    <select id="contact-businessType" className="s-select" name="businessType" value={fields.businessType} onChange={set('businessType')}>
                      <option value="">Chọn loại hình</option>
                      {VALID_BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
                  {status === 'sending' ? 'Đang gửi…' : 'Đăng ký tư vấn'}
                </button>
                <p className="s-xs s-muted">
                  Bằng việc gửi biểu mẫu, bạn đồng ý với <Link className="s-textlink" href="/chinh-sach-rieng-tu/">chính sách riêng tư</Link> của DANAVA.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 02 / Văn phòng */}
      <section className="c-section" aria-labelledby="c-office-heading">
        <div className="s-container">
          <p className="c-label"><b>02</b> / Văn phòng</p>
          <h2 className="c-heading" id="c-office-heading">Gặp DANAVA tại Đà Nẵng</h2>

          <div className="c-offices">
            <div className="c-office">
              <span className="c-office__icon" aria-hidden="true"><Building2 /></span>
              <h3>Trụ sở Đà Nẵng</h3>
              <p>{SERVICE_POLICY_METADATA.address}</p>
              <a href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer">Chỉ đường trên Google Maps →</a>
            </div>
            <div className="c-office">
              <span className="c-office__icon" aria-hidden="true"><Clock /></span>
              <h3>Giờ làm việc</h3>
              <p>{HOURS}</p>
              <p className="s-small s-muted">Ngoài giờ, bạn cứ để lại yêu cầu — chúng tôi gọi lại vào ngày làm việc kế tiếp.</p>
            </div>
            <div className="c-office">
              <span className="c-office__icon" aria-hidden="true"><LifeBuoy /></span>
              <h3>Khách hàng đang sử dụng dịch vụ</h3>
              <p>Cần hỗ trợ kỹ thuật hoặc bảo hành?</p>
              <Link href="/chinh-sach-dich-vu/#kenh-tiep-nhan">Xem kênh hỗ trợ kỹ thuật →</Link>
            </div>
          </div>

          <div className="c-map">
            <iframe
              title={`Bản đồ văn phòng DANAVA: ${SERVICE_POLICY_METADATA.address}`}
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Hộp xác nhận sau khi gửi */}
      {status === 'ok' && (
        <div className="c-modal" role="dialog" aria-modal="true" aria-labelledby="c-modal-title" onClick={e => { if (e.target === e.currentTarget) setStatus('idle'); }}>
          <div className="c-modal__box">
            <span className="c-modal__icon" aria-hidden="true"><CheckCircle2 /></span>
            <h2 id="c-modal-title">Đã gửi thông tin thành công!</h2>
            <p>{feedback}</p>
            <p className="s-small s-muted">Cần gấp? Gọi <a className="s-textlink" href={`tel:${phone}`}>{formatPhone(phone)}</a></p>
            <button ref={confirmRef} type="button" className="s-btn s-btn--primary s-btn--block" onClick={() => setStatus('idle')}>Xác nhận</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ContactPage;
