'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Phone, Mail, MapPin, CheckCircle2, AlertCircle, ArrowRight, MessageCircle,
  ThumbsUp, PlayCircle, Clock, LifeBuoy, Globe, Copy, Check, UserPlus
} from 'lucide-react';
import { useSite } from '../SiteStore';
import { VALID_BUSINESS_TYPES, VALID_CONTACT_SERVICES, isValidPhoneNumber } from '@/lib/contact-services';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs } from './ui';
import { block } from '@/lib/blocks';
import { pageCopy } from '@/lib/blocks';
import { rich } from './rich';

type Fields = { name: string; phone: string; email: string; businessType: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/** Tên ngắn cho nút chọn nhanh dịch vụ trên form. */
const CHIP: Record<string, string> = {
  'danava-studio': 'DANAVA Studio', 'thiet-ke-website': 'Website', 'digital-marketing': 'Marketing',
  'su-kien-truyen-thong': 'Sự kiện', 'media-production': 'Video & hình ảnh', 'du-lich-su-kien': 'Du lịch', 'tu-van-chuyen-doi-so': 'Tư vấn chuyển đổi số'
};

/**
 * Đang trong giờ làm việc? Đọc chuỗi giờ làm việc trong CMS (vd. "Thứ Hai – Thứ Bảy, 08:00 – 18:00").
 * Chỉ trả lời khi đọc được chắc chắn; ngược lại trả null để không hiển thị trạng thái sai.
 */
function openNow(hours: string): boolean | null {
  const t = hours.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!t) return null;
  const DAY: Record<string, number> = { 'chủ nhật': 0, 'thứ hai': 1, 'thứ ba': 2, 'thứ tư': 3, 'thứ năm': 4, 'thứ sáu': 5, 'thứ bảy': 6 };
  const d = hours.toLowerCase().match(/(thứ hai|thứ ba|thứ tư|thứ năm|thứ sáu|thứ bảy|chủ nhật)\s*[–-]\s*(thứ hai|thứ ba|thứ tư|thứ năm|thứ sáu|thứ bảy|chủ nhật)/);
  if (!d) return null;
  const from = DAY[d[1]], to = DAY[d[2]] === 0 ? 7 : DAY[d[2]];
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.find(x => x.type === 'weekday')!.value);
  const day = wd === 0 ? 7 : wd;
  const mins = Number(parts.find(x => x.type === 'hour')!.value) * 60 + Number(parts.find(x => x.type === 'minute')!.value);
  const open = Number(t[1]) * 60 + Number(t[2]), close = Number(t[3]) * 60 + Number(t[4]);
  return day >= (from === 0 ? 7 : from) && day <= to && mins >= open && mins < close;
}

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
  const co = block(data, 'company');
  const copy = pageCopy(data, 'lien-he');
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(co.legalAddress)}&output=embed`;

  const [fields, setFields] = useState<Fields>({
    name: '', phone: '', email: '', businessType: '', service: initialService, message: ''
  });
  const [trap, setTrap] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const zalo = `https://zalo.me/${phone.replace(/\D/g, '')}`;

  // Trạng thái giờ làm việc tính trên trình duyệt (tránh lệch khi render máy chủ)
  useEffect(() => { setIsOpen(openNow(co.hours)); }, [co.hours]);

  /** Danh thiếp nghiêng theo con trỏ (tắt khi người dùng bật giảm chuyển động — xem CSS). */
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - .5) * -10}deg`);
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 14}deg`);
  };
  const untilt = () => { cardRef.current?.style.setProperty('--rx', '0deg'); cardRef.current?.style.setProperty('--ry', '0deg'); };

  /** Lưu danh bạ: tạo tệp vCard từ thông tin công ty trong CMS. */
  const saveContact = () => {
    const tel = phone.replace(/\D/g, '').replace(/^0/, '+84');
    const vcf = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:DANAVA Solutions', `ORG:${co.companyName}`, `TEL;TYPE=WORK,VOICE:${tel}`, `EMAIL;TYPE=WORK:${email}`,
      `ADR;TYPE=WORK:;;${co.street};${co.city};;;Việt Nam`, 'URL:https://danava.com.vn', 'END:VCARD'].join('\r\n');
    const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'DANAVA-Solutions.vcf'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copyPhone = async () => {
    try { await navigator.clipboard.writeText(formatPhone(phone)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* trình duyệt chặn: bỏ qua */ }
  };

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
      {/* Hero "Hãy nói xin chào": lời mời + nút liên hệ nhanh bên trái, danh thiếp DANAVA Solutions bên phải */}
      <section className="c-hero c-hero--hello">
        <div className="c-gridbg" aria-hidden="true" />
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Liên hệ' }]} />
          <div className="c-hero__grid">
            <div className="c-hero__copy">
              <p className="c-tag"><span className="c-tag__dot" aria-hidden="true" />{copy.kicker}</p>
              <h1 className="c-hero__title c-hero__title--hello">{rich(copy.title, 'c-grad c-brand')}</h1>
              <p className="c-hero__lead">{copy.lead}</p>
              {isOpen !== null && (
                <p className={`c-status${isOpen ? ' is-open' : ''}`} role="status">
                  <b><i aria-hidden="true" />{isOpen ? 'Đang trong giờ làm việc · gọi là có người nghe máy' : 'Ngoài giờ làm việc · để lại lời nhắn, DANAVA gọi lại vào ngày làm việc kế tiếp'}</b>
                  <span>{co.hours}</span>
                </p>
              )}
              <div className="c-dock">
                <a className="c-dock__btn c-dock__btn--call" href={`tel:${phone}`}><Phone aria-hidden="true" /><span><small>Gọi ngay</small>{formatPhone(phone)}</span></a>
                <a className="c-dock__btn c-dock__btn--zalo" href={zalo} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" /><span><small>Nhắn tin</small>Chat Zalo</span><span className="c-sr"> (mở tab mới)</span></a>
                <a className="c-dock__btn c-dock__btn--mail" href={`mailto:${email}`}><Mail aria-hidden="true" /><span><small>Gửi email</small>{email}</span></a>
              </div>
              <ul className="c-socials" aria-label="Kênh khác">
                <li><a href={co.facebook} target="_blank" rel="noopener noreferrer"><ThumbsUp aria-hidden="true" />Fanpage<span className="c-sr"> (mở tab mới)</span></a></li>
                <li><a href={co.youtube} target="_blank" rel="noopener noreferrer"><PlayCircle aria-hidden="true" />YouTube<span className="c-sr"> (mở tab mới)</span></a></li>
                <li><a href={`mailto:${co.supportEmail}`}><LifeBuoy aria-hidden="true" />Hỗ trợ kỹ thuật</a></li>
                <li><a href="#dang-ky-tu-van"><ArrowRight aria-hidden="true" />Gửi yêu cầu tư vấn</a></li>
              </ul>
            </div>

            <div className="c-cardzone">
              <span className="c-orbit c-orbit--a" aria-hidden="true" />
              <span className="c-orbit c-orbit--b" aria-hidden="true" />
              <div className="c-namecard" ref={cardRef} onPointerMove={tilt} onPointerLeave={untilt}>
                <div className="c-namecard__face">
                  <div className="c-namecard__top">
                    <img src="/assets/danava-logo-trim.png" alt="" width={554} height={135} />
                    <span className="c-namecard__chip" aria-hidden="true" />
                  </div>
                  <p className="c-namecard__brand">DANAVA&nbsp;Solutions</p>
                  <p className="c-namecard__motto">{data.headline || 'Cùng bạn phát triển.'}</p>
                  <ul className="c-namecard__lines">
                    <li><Phone aria-hidden="true" /><a href={`tel:${phone}`}>{formatPhone(phone)}</a></li>
                    <li><Mail aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></li>
                    <li><MapPin aria-hidden="true" /><a href={co.mapUrl} target="_blank" rel="noopener noreferrer">{co.address}</a></li>
                    <li><Globe aria-hidden="true" /><span>danava.com.vn</span></li>
                  </ul>
                </div>
              </div>
              <div className="c-cardacts">
                <button type="button" className="c-cardacts__btn" onClick={saveContact}><UserPlus aria-hidden="true" />Lưu vào danh bạ</button>
                <button type="button" className="c-cardacts__btn" onClick={copyPhone} aria-live="polite">{copied ? <><Check aria-hidden="true" />Đã sao chép</> : <><Copy aria-hidden="true" />Sao chép số</>}</button>
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
              Kể cho chúng tôi nghe về doanh nghiệp của bạn.
              <span className="c-grad c-grad--light">DANAVA sẽ gọi lại để tư vấn.</span>
            </h2>

            <dl className="c-info">
              <div><dt>Liên hệ trực tiếp</dt><dd><a href={`tel:${phone}`}>Hotline · Zalo: {formatPhone(phone)}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${email}`}>{email}</a><br /><a href={`mailto:${co.supportEmail}`}>{co.supportEmail}</a> (hỗ trợ kỹ thuật)</dd></div>
              <div><dt>Giờ làm việc</dt><dd>{co.hours}</dd></div>
              <div><dt>Pháp nhân</dt><dd>{co.companyName} · Đại diện: {co.representative}</dd></div>
              <div><dt>Trụ sở</dt><dd>{co.legalAddress}</dd></div>
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
                <p className="c-chips__label" id="c-chips-label">Bạn quan tâm đến</p>
                <div className="c-chips" role="group" aria-labelledby="c-chips-label">
                  {VALID_CONTACT_SERVICES.filter(x => CHIP[x.id]).map(x => (
                    <button key={x.id} type="button" className={fields.service === x.label ? 'is-on' : ''} aria-pressed={fields.service === x.label}
                      onClick={() => setFields(prev => ({ ...prev, service: prev.service === x.label ? '' : x.label }))}>{CHIP[x.id]}</button>
                  ))}
                </div>
              </div>
              <div className="c-field c-field--full">
                <label className="c-sr" htmlFor="contact-service">Dịch vụ quan tâm</label>
                <select id="contact-service" name="service" value={fields.service} onChange={set('service')}>
                  <option value="">Dịch vụ quan tâm (chưa chọn)</option>
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
                <p>{co.legalAddress}</p>
                <a href={co.mapUrl} target="_blank" rel="noopener noreferrer">Chỉ đường trên Google Maps →</a>
              </div>
              <iframe
                title={`Bản đồ văn phòng DANAVA: ${co.legalAddress}`}
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="c-office">
              <div className="c-office__body">
                <span className="c-office__city">Giờ làm việc</span>
                <h3><Clock aria-hidden="true" />{co.hours}</h3>
                <p>Ngoài giờ, bạn cứ để lại yêu cầu — chúng tôi gọi lại vào ngày làm việc kế tiếp.</p>
                <a href={zalo} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Nhắn Zalo</a>
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
