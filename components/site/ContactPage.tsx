'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Phone, Mail, MapPin, CheckCircle2, AlertCircle, ArrowRight, MessageCircle,
  ThumbsUp, PlayCircle, Clock, LifeBuoy
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
    <main id="main" className="c-page">
      {/* Hero: tiêu đề bên trái, lưới kênh liên hệ bên phải */}
      <section className="c-hero">
        <div className="c-gridbg" aria-hidden="true" />
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Liên hệ' }]} />
          <div className="c-hero__grid">
            <div className="c-hero__copy">
              <p className="c-tag"><span className="c-tag__dot" aria-hidden="true" />Contact · DANAVA</p>
              <h1 className="c-hero__title">Liên hệ <span className="c-grad">DANAVA Solutions</span></h1>
              <p className="c-hero__lead">
                DANAVA luôn lắng nghe mọi ý kiến của khách hàng. Hãy liên hệ để nhận tư vấn miễn phí và báo giá chi tiết cho phần mềm quản lý phòng tập, website, truyền thông và sự kiện.
              </p>
              <p className="c-badge">
                <span className="c-badge__mark" aria-hidden="true">D</span>
                <span>Đơn vị chuyển đổi số cho <b>Gym · Yoga · Spa</b><i>Đà Nẵng · Toàn quốc</i></span>
              </p>
            </div>

            <div className="c-tiles">
              <div className="c-tile c-tile--dark">
                <span className="c-tile__icon" aria-hidden="true"><Phone /></span>
                <p className="c-tile__label">Hotline · Zalo</p>
                <div className="c-tile__row">
                  <a href={`tel:${phone}`}>{formatPhone(phone)}</a>
                  <a href={SOCIAL.zalo} target="_blank" rel="noopener noreferrer">Chat Zalo <span aria-hidden="true">→</span></a>
                </div>
              </div>
              <div className="c-tile c-tile--wide">
                <span className="c-tile__icon" aria-hidden="true"><Mail /></span>
                <p className="c-tile__label">Email</p>
                <a href={`mailto:${email}`}>{email}</a>
              </div>
              <div className="c-tile">
                <span className="c-tile__icon c-tile__icon--sky" aria-hidden="true"><ThumbsUp /></span>
                <p className="c-tile__label">Fanpage</p>
                <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">Theo dõi <span aria-hidden="true">→</span></a>
              </div>
              <div className="c-tile">
                <span className="c-tile__icon c-tile__icon--red" aria-hidden="true"><PlayCircle /></span>
                <p className="c-tile__label">YouTube</p>
                <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer">Đăng ký kênh <span aria-hidden="true">→</span></a>
              </div>
              <div className="c-tile">
                <span className="c-tile__icon c-tile__icon--amber" aria-hidden="true"><LifeBuoy /></span>
                <p className="c-tile__label">Hỗ trợ</p>
                <a href={`mailto:${SERVICE_POLICY_METADATA.supportEmail}`}>Kỹ thuật <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 01 / Liên hệ: nền tối, thông tin bên trái, form bên phải */}
      <section className="c-contact" id="dang-ky-tu-van" aria-labelledby="c-contact-heading">
        <div className="c-gridbg c-gridbg--dark" aria-hidden="true" />
        <div className="s-container c-contact__grid">
          <div>
            <p className="c-tag"><b>01</b> / Liên hệ</p>
            <h2 className="c-contact__heading" id="c-contact-heading">
              Bạn đã sẵn sàng số hóa và tăng trưởng doanh thu?
              <span className="c-grad c-grad--light">Hãy để DANAVA tư vấn cho bạn</span>
            </h2>

            <dl className="c-info">
              <div><dt>Liên hệ trực tiếp</dt><dd><a href={`tel:${phone}`}>Hotline · Zalo: {formatPhone(phone)}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${email}`}>{email}</a><br /><a href={`mailto:${SERVICE_POLICY_METADATA.supportEmail}`}>{SERVICE_POLICY_METADATA.supportEmail}</a> (hỗ trợ kỹ thuật)</dd></div>
              <div><dt>Giờ làm việc</dt><dd>{HOURS}</dd></div>
              <div><dt>Pháp nhân</dt><dd>{SERVICE_POLICY_METADATA.companyName} · Đại diện: {SERVICE_POLICY_METADATA.representative}</dd></div>
              <div><dt>Trụ sở</dt><dd>{SERVICE_POLICY_METADATA.address}</dd></div>
            </dl>
          </div>

          <div className="c-form">
            <h3>Đăng ký tư vấn</h3>
            <form className="c-form__grid" onSubmit={submit} noValidate>
              <div className="s-honeypot" aria-hidden="true">
                <label htmlFor="contact-website-trap">Website</label>
                <input id="contact-website-trap" name="website_trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
              </div>

              <div className="c-field">
                <label className="c-sr" htmlFor="contact-name">Họ và tên (bắt buộc)</label>
                <input id="contact-name" name="name" autoComplete="name" maxLength={150} placeholder="Họ và tên *" value={fields.name} onChange={set('name')} {...invalid('name')} />
                {err('name')}
              </div>
              <div className="c-field">
                <label className="c-sr" htmlFor="contact-phone">Số điện thoại (bắt buộc)</label>
                <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} placeholder="Số điện thoại *" value={fields.phone} onChange={set('phone')} {...invalid('phone')} />
                {err('phone')}
              </div>
              <div className="c-field">
                <label className="c-sr" htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={200} placeholder="E-mail" value={fields.email} onChange={set('email')} {...invalid('email')} />
                {err('email')}
              </div>
              <div className="c-field">
                <label className="c-sr" htmlFor="contact-businessType">Loại hình kinh doanh</label>
                <select id="contact-businessType" name="businessType" value={fields.businessType} onChange={set('businessType')}>
                  <option value="">Loại hình kinh doanh</option>
                  {VALID_BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="c-field c-field--full">
                <label className="c-sr" htmlFor="contact-service">Dịch vụ quan tâm</label>
                <select id="contact-service" name="service" value={fields.service} onChange={set('service')}>
                  {VALID_CONTACT_SERVICES.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                </select>
              </div>
              <div className="c-field c-field--full">
                <label className="c-sr" htmlFor="contact-message">Nhu cầu của bạn (bắt buộc)</label>
                <textarea id="contact-message" name="message" rows={5} maxLength={5000} placeholder="Lời nhắn * — ví dụ: phòng tập 300 hội viên, cần quản lý gói tập và check-in QR…" value={fields.message} onChange={set('message')} {...invalid('message')} />
                {err('message')}
              </div>

              {status === 'error' && (
                <div className="s-alert s-alert--err c-field--full" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <span>{feedback}</span>
                </div>
              )}

              <button type="submit" className="c-submit c-field--full" disabled={status === 'sending'}>
                {status === 'sending' ? 'Đang gửi…' : <>Đăng ký tư vấn <ArrowRight aria-hidden="true" /></>}
              </button>
              <p className="c-form__note c-field--full">
                Trường có dấu * là bắt buộc. Bằng việc gửi biểu mẫu, bạn đồng ý với <Link href="/chinh-sach-rieng-tu/">chính sách riêng tư</Link> của DANAVA.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* 02 / Văn phòng: thẻ có bản đồ nằm ngay trong thẻ */}
      <section className="c-offices-sec" aria-labelledby="c-office-heading">
        <div className="s-container">
          <p className="c-tag"><b>02</b> / Văn phòng</p>
          <h2 className="c-offices-sec__heading" id="c-office-heading">Đà Nẵng · <span className="c-grad">Phục vụ toàn quốc</span></h2>

          <div className="c-offices">
            <div className="c-office c-office--main">
              <div className="c-office__body">
                <span className="c-office__city">Đà Nẵng</span>
                <h3><MapPin aria-hidden="true" />Trụ sở chính</h3>
                <p>{SERVICE_POLICY_METADATA.address}</p>
                <a href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer">Chỉ đường trên Google Maps →</a>
              </div>
              <iframe
                title={`Bản đồ văn phòng DANAVA: ${SERVICE_POLICY_METADATA.address}`}
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="c-office">
              <div className="c-office__body">
                <span className="c-office__city">Giờ làm việc</span>
                <h3><Clock aria-hidden="true" />{HOURS}</h3>
                <p>Ngoài giờ, bạn cứ để lại yêu cầu — chúng tôi gọi lại vào ngày làm việc kế tiếp.</p>
                <a href={SOCIAL.zalo} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Nhắn Zalo</a>
              </div>
            </div>
            <div className="c-office">
              <div className="c-office__body">
                <span className="c-office__city">Khách hàng hiện tại</span>
                <h3><LifeBuoy aria-hidden="true" />Hỗ trợ kỹ thuật &amp; bảo hành</h3>
                <p>Đang sử dụng dịch vụ của DANAVA và cần hỗ trợ?</p>
                <Link href="/chinh-sach-dich-vu/#kenh-tiep-nhan">Xem kênh hỗ trợ kỹ thuật →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hộp xác nhận sau khi gửi */}
      {status === 'ok' && (
        <div className="c-modal" role="dialog" aria-modal="true" aria-labelledby="c-modal-title" onClick={e => { if (e.target === e.currentTarget) setStatus('idle'); }}>
          <div className="c-modal__box">
            <span className="c-modal__icon" aria-hidden="true"><CheckCircle2 /></span>
            <h2 id="c-modal-title">Thông báo</h2>
            <p>{feedback} DANAVA sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
            <p className="s-small s-muted">Cần gấp? Gọi <a className="s-textlink" href={`tel:${phone}`}>{formatPhone(phone)}</a></p>
            <button ref={confirmRef} type="button" className="s-btn s-btn--primary s-btn--block" onClick={() => setStatus('idle')}>Xác nhận</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ContactPage;
