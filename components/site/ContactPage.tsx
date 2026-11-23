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
import { contactChannels } from '@/lib/contact-channels';
import { rich } from './rich';
import { useAnna } from './anna/AnnaProvider';
import { MayPerch } from './anna/MayPerch';
import { CuteChat, CuteFacebook, CuteMail, CuteMoon, CutePhone, CuteSun, CuteSupport, CuteYoutube } from './CuteIcons';

type Fields = { name: string; phone: string; email: string; businessType: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/** Tên ngắn cho nút chọn nhanh dịch vụ trên form. */
const CHIP: Record<string, string> = {
  'danava-studio': 'DANAVA Studio', 'thiet-ke-website': 'Website', 'digital-marketing': 'Marketing & Truyền thông',
  'su-kien-truyen-thong': 'Tổ chức sự kiện', 'media-production': 'Video & hình ảnh', 'du-lich-su-kien': 'Du lịch', 'tu-van-chuyen-doi-so': 'Tư vấn chuyển đổi số'
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
  const anna = useAnna();
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;
  const co = block(data, 'company');
  const copy = pageCopy(data, 'lien-he');
  const about = block(data, 'about');
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
  const { zalo } = contactChannels(data);

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
      {/* Đầu trang gọn một màn hình: lời mời | mặt trăng/mặt trời ở chính giữa | danh thiếp; hàng nút liên hệ bên dưới */}
      <section className="c-hero c-hero--hello c-hero--light">
        <div className="c-aurora" aria-hidden="true"><i /><i /><i /><b /></div>
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Liên hệ' }]} />
          <div className="c-hero__grid">
            <div className="c-hero__copy">
              <p className="c-tag"><span className="c-tag__dot" aria-hidden="true" />{copy.kicker}</p>
              <h1 className="c-hero__title c-hero__title--hello">{rich(copy.title, 'c-grad c-brand')}</h1>
              <p className="c-motto">
                {data.headline || 'Cùng bạn phát triển.'}
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="M2 14 C 60 2, 120 20, 180 9 S 270 4, 298 12" /></svg>
              </p>
              <p className="c-hero__lead">{copy.lead}</p>
            </div>

            <div className="c-reach">
              <div className="c-dock">
                <a className="c-dock__btn c-dock__btn--call" href={`tel:${phone}`}><CutePhone /><span><small>Gọi ngay</small>{formatPhone(phone)}</span></a>
                <a className="c-dock__btn c-dock__btn--zalo" href={zalo} target="_blank" rel="noopener noreferrer"><CuteChat /><span><small>Nhắn tin</small>Chat Zalo</span><span className="c-sr"> (mở tab mới)</span></a>
                <a className="c-dock__btn c-dock__btn--mail" href={`mailto:${email}`}><CuteMail /><span><small>Gửi email</small>{email}</span></a>
              </div>
              <p className="c-alt">
                <a href={co.facebook} target="_blank" rel="noopener noreferrer"><CuteFacebook />Fanpage<span className="c-sr"> (mở tab mới)</span></a>
                <a href={co.youtube} target="_blank" rel="noopener noreferrer"><CuteYoutube />YouTube<span className="c-sr"> (mở tab mới)</span></a>
                <a href={`mailto:${co.supportEmail}`}><CuteSupport />Hỗ trợ kỹ thuật</a>
              </p>
            </div>

            {/* Giữ chỗ sẵn: giờ làm việc chỉ tính được trên trình duyệt */}
            <div className="c-sky">
              {isOpen !== null && (
                <p className={`c-status${isOpen ? ' is-open' : ''}`} role="status">
                  {isOpen ? <CuteSun /> : <CuteMoon />}
                  <strong>{isOpen ? 'Đang trong giờ làm việc' : 'Ngoài giờ làm việc'}</strong>
                  {!isOpen && <small>DANAVA gọi lại vào ngày làm việc kế tiếp</small>}
                  <span>{co.hours}</span>
                </p>
              )}
            </div>

            <div className="c-cardzone">
              <span className="c-orbit c-orbit--a" aria-hidden="true"><i /><i /></span>
              <span className="c-orbit c-orbit--b" aria-hidden="true"><i /></span>
              <span className="c-halo" aria-hidden="true" />
              <div className="c-namecard c-namecard--float" ref={cardRef} onPointerMove={tilt} onPointerLeave={untilt}>
                <div className="c-namecard__back" aria-hidden="true"><span>D</span></div>
                <div className="c-namecard__face">
                  <div className="c-namecard__top">
                    <span className="c-namecard__logo"><img src="/assets/danava-logo-light.png" alt="DANAVA Solutions" width={554} height={135} /></span>
                    <span className="c-namecard__chip" aria-hidden="true" />
                  </div>
                  <p className="c-namecard__label">Hotline · Zalo</p>
                  <p className="c-namecard__phone"><a href={`tel:${phone}`}>{formatPhone(phone)}</a></p>
                  <ul className="c-namecard__lines">
                    <li><Mail aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></li>
                    <li><MapPin aria-hidden="true" /><a href={co.mapUrl} target="_blank" rel="noopener noreferrer">{co.address}</a></li>
                    <li><Globe aria-hidden="true" /><span>danava.com.vn</span></li>
                  </ul>
                  <p className="c-namecard__motto">{data.headline || 'Cùng bạn phát triển.'}</p>
                </div>
              </div>
              <div className="c-cardacts">
                <button type="button" className="c-cardacts__btn" onClick={saveContact}><UserPlus aria-hidden="true" />Lưu vào danh bạ</button>
                <button type="button" className="c-cardacts__btn" onClick={copyPhone} aria-live="polite">{copied ? <><Check aria-hidden="true" />Đã sao chép</> : <><Copy aria-hidden="true" />Sao chép số</>}</button>
              </div>
            </div>
          </div>
        </div>
        <svg className="c-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 56 C 240 96, 420 10, 720 40 S 1200 92, 1440 30 L1440 90 L0 90 Z" />
        </svg>
      </section>

      {/* Sau lời chào: quy trình hợp tác (CMS → Về DANAVA → Quy trình hợp tác), nối bằng đường cong như dòng sông */}
      {about.steps.length > 0 && (
        <section className="c-journey" aria-labelledby="c-journey-title">
          <div className="s-container">
            <p className="c-tag"><span className="c-tag__dot" aria-hidden="true" />Sau lời chào</p>
            <h2 className="c-journey__title" id="c-journey-title">Một lời chào, <em>một hành trình cùng phát triển.</em></h2>
            <div className="c-journey__track">
              <svg className="c-journey__river" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 70 C 150 10, 300 110, 450 60 S 750 10, 900 60 S 1100 110, 1200 50" />
              </svg>
              <ol className="c-journey__steps" style={{ ['--n' as string]: about.steps.length }}>
                {about.steps.map((st, i) => (
                  <li key={i} style={{ ['--i' as string]: i }}>
                    <span className="c-journey__node">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{st.title}</h3>
                    <p>{st.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

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
            {anna.enabled && <MayPerch onPick={() => anna.ask()} />}
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
                  <option value="">Dịch vụ quan tâm</option>
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

      {/* Mỗi dự án bắt đầu bằng một lời chào: ảnh hoạt động thật (CMS → Về DANAVA → Ảnh hoạt động) trôi chậm */}
      {about.moments.length > 0 && (
        <section className="c-moments" aria-labelledby="c-moments-title">
          <div className="s-container">
            <h2 className="c-moments__title" id="c-moments-title">Mỗi dự án <em>bắt đầu bằng một lời chào.</em></h2>
          </div>
          <div className="c-moments__rail">
            <ul className="c-moments__track">
              {[...about.moments, ...about.moments].map((m, i) => (
                <li key={i} aria-hidden={i >= about.moments.length ? true : undefined} style={{ ['--t' as string]: `${(i % 5) - 2}deg` }}>
                  <figure><img src={m.src} alt={i >= about.moments.length ? '' : m.title} width={480} height={360} loading="lazy" decoding="async" /><figcaption>{m.title}</figcaption></figure>
                </li>
              ))}
            </ul>
          </div>
          <div className="s-container c-moments__cta">
            <p className="c-start__ask">Câu chuyện tiếp theo có thể là của bạn.</p>
            <div className="c-start">
              <a className="c-start__btn c-start__btn--main" href="#dang-ky-tu-van">
                <CuteChat /><span><small>Bắt đầu ngay</small>Gửi lời chào tới DANAVA</span><ArrowRight className="c-start__arrow" aria-hidden="true" />
              </a>
              <a className="c-start__btn" href={`tel:${phone}`}>
                <CutePhone /><span><small>Hoặc gọi</small>{formatPhone(phone)}</span>
              </a>
            </div>
          </div>
        </section>
      )}

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
