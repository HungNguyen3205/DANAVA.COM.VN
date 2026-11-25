'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSubmitLock } from './useSubmitLock';
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
import { cmsText, ct } from './cms';
import { txt } from '@/lib/site-text';
import { contactChannels } from '@/lib/contact-channels';
import { rich } from './rich';
import { useAnna } from './anna/AnnaProvider';
import { MayPerch } from './anna/MayPerch';
import { parseHours, workState, type WorkState } from '@/lib/work-hours';
import { CuteChat, CuteFacebook, CuteMail, CuteMoon, CutePhone, CuteSun, CuteSunNap, CuteSupport, CuteYoutube } from './CuteIcons';

type Fields = { name: string; phone: string; email: string; businessType: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/** Tên ngắn cho nút chọn nhanh dịch vụ trên form. */
const CHIP: Record<string, string> = {
  'danava-studio': 'DANAVA Studio', 'thiet-ke-website': 'Website', 'digital-marketing': 'Marketing & Truyền thông',
  'su-kien-truyen-thong': 'Tổ chức sự kiện', 'media-production': 'Video & hình ảnh', 'du-lich-su-kien': 'Du lịch', 'tu-van-chuyen-doi-so': 'Tư vấn chuyển đổi số'
};

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
  const [state, setState] = useState<WorkState | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { zalo } = contactChannels(data);
  /** Chữ cố định sửa được trong trình biên tập (khóa contact.*). */
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `contact.${k}`, def, label, opts);
  /** Ghi chữ cố định ngay trong <span> (giữ nguyên markup xung quanh). */
  const T = (k: string, def: string, label: string) => <span {...P(k, def, label)} />;
  /** Thuộc tính vùng chỉnh + chữ (children) cho phần tử chỉ chứa chữ: <h3 {...P(…)} />. */
  /** Chữ thuần (option, nhãn ẩn, placeholder): dịch được, giá trị gửi đi giữ nguyên */
  const L = (k: string, def: string) => txt(data, `contact.${k}`, def);
  const P = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => { const x = t(k, def, label, opts); return { ...x.a, children: x.v }; };
  const G = { scope: 'global' as const };
  const mail = <span {...cmsText('site.email', 'Email liên hệ', G)}>{email}</span>;

  // Trạng thái giờ làm việc tính trên trình duyệt (tránh lệch khi render máy chủ)
  const hours = parseHours(co.hours);
  // Cập nhật mỗi phút (khách để trang mở qua giờ nghỉ trưa / hết giờ)
  useEffect(() => {
    const h = parseHours(co.hours);
    if (!h) { setState(null); return; }
    const tick = () => setState(workState(h));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [co.hours]);

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

  const lock = useSubmitLock();
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
          <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { label: 'Liên hệ' }]} />
          <div className="c-hero__grid">
            <div className="c-hero__copy">
              <p className="c-tag"><span className="c-tag__dot" aria-hidden="true" /><span {...cmsText('pages.lien-he.kicker', 'Dòng chữ nhỏ')}>{copy.kicker}</span></p>
              <h1 className="c-hero__title c-hero__title--hello" {...cmsText('pages.lien-he.title', 'Tiêu đề trang', { rich: true })}>{rich(copy.title, 'c-grad c-brand')}</h1>
              <p className="c-motto">
                <span {...cmsText('site.headline', 'Khẩu hiệu', { scope: 'global' })}>{data.headline || 'Cùng bạn phát triển.'}</span>
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="M2 14 C 60 2, 120 20, 180 9 S 270 4, 298 12" /></svg>
              </p>
              <p className="c-hero__lead" {...cmsText('pages.lien-he.lead', 'Câu dẫn', { multiline: true })}>{copy.lead}</p>
            </div>

            <div className="c-reach">
              <div className="c-dock">
                <a className="c-dock__btn c-dock__btn--call" href={`tel:${phone}`}><CutePhone /><span><small {...P('dock.call', 'Gọi ngay', 'Nhãn nút gọi')} />{formatPhone(phone)}</span></a>
                <a className="c-dock__btn c-dock__btn--zalo" href={zalo} target="_blank" rel="noopener noreferrer"><CuteChat /><span><small {...P('dock.zalo-kicker', 'Nhắn tin', 'Nhãn nút Zalo')} />{T('dock.zalo-label', 'Chat Zalo', 'Chữ nút Zalo')}</span><span className="c-sr">{L('new-tab', ' (mở tab mới)')}</span></a>
                <a className="c-dock__btn c-dock__btn--mail" href={`mailto:${email}`}><CuteMail /><span><small {...P('dock.mail', 'Gửi email', 'Nhãn nút email')} />{mail}</span></a>
              </div>
              <p className="c-alt">
                <a href={co.facebook} target="_blank" rel="noopener noreferrer"><CuteFacebook />{T('alt.facebook', 'Fanpage', 'Liên kết Fanpage')}<span className="c-sr">{L('new-tab', ' (mở tab mới)')}</span></a>
                <a href={co.youtube} target="_blank" rel="noopener noreferrer"><CuteYoutube />{T('alt.youtube', 'YouTube', 'Liên kết YouTube')}<span className="c-sr">{L('new-tab', ' (mở tab mới)')}</span></a>
                <a href={`mailto:${co.supportEmail}`}><CuteSupport />{T('alt.support', 'Hỗ trợ kỹ thuật', 'Liên kết hỗ trợ kỹ thuật')}</a>
              </p>
            </div>

            {/* Giữ chỗ sẵn: giờ làm việc chỉ tính được trên trình duyệt */}
            <div className="c-sky">
              {state !== null && hours && (
                <div className={`c-status c-status--${state}`} role="status">
                  {state === 'open' ? <CuteSun /> : state === 'lunch' ? <CuteSunNap /> : <CuteMoon />}
                  <strong {...(state === 'open' ? P('status.open', 'Đang làm việc', 'Trạng thái: trong giờ')
                    : state === 'lunch' ? P('status.lunch', 'Đang nghỉ trưa', 'Trạng thái: nghỉ trưa')
                    : P('status.closed', 'Ngoài giờ làm việc', 'Trạng thái: ngoài giờ'))} />
                  {state === 'lunch' && hours.lunch && <small className="c-status__note"><span {...P('status.lunch-note', 'Làm việc lại lúc', 'Ghi chú nghỉ trưa')} /> <b>{hours.lunchText!.split(' – ')[1]}</b></small>}
                  {state === 'closed' && <small className="c-status__note" {...P('status.closed-note', 'DANAVA gọi lại vào ngày làm việc kế tiếp', 'Ghi chú ngoài giờ')} />}
                  {/* Thẻ giờ: dòng giờ làm việc + dòng nghỉ trưa, ngăn bằng vạch mảnh */}
                  <ul className="c-hours" aria-label={co.hours}>
                    <li><b>{hours.days}:</b> {hours.time}</li>
                    {hours.lunchText && <li className={`c-hours__lunch${state === 'lunch' ? ' is-now' : ''}`}><span {...P('status.lunch-label', 'Nghỉ trưa', 'Nhãn giờ nghỉ trưa')} />: {hours.lunchText}</li>}
                  </ul>
                  {/* Chuỗi gốc: chỉ hiện trong trình chỉnh sửa để sửa giờ làm việc */}
                  <span className="c-hours-raw" {...cmsText('block.company.hours', 'Giờ làm việc', G)}>{co.hours}</span>
                </div>
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
                  <p className="c-namecard__label" {...P('card.label', 'Hotline · Zalo', 'Nhãn danh thiếp')} />
                  <p className="c-namecard__phone"><a href={`tel:${phone}`}>{formatPhone(phone)}</a></p>
                  <ul className="c-namecard__lines">
                    <li><Mail aria-hidden="true" /><a href={`mailto:${email}`}>{mail}</a></li>
                    <li><MapPin aria-hidden="true" /><a href={co.mapUrl} target="_blank" rel="noopener noreferrer" {...cmsText('block.company.address', 'Địa chỉ công ty', G)}>{co.address}</a></li>
                    <li><Globe aria-hidden="true" /><span {...P('card.web', 'danava.com.vn', 'Website trên danh thiếp')} /></li>
                  </ul>
                  <p className="c-namecard__motto" {...cmsText('site.headline', 'Khẩu hiệu', { scope: 'global' })}>{data.headline || 'Cùng bạn phát triển.'}</p>
                </div>
              </div>
              <div className="c-cardacts">
                <button type="button" className="c-cardacts__btn" onClick={saveContact}><UserPlus aria-hidden="true" />{T('card.save', 'Lưu vào danh bạ', 'Nút lưu danh bạ')}</button>
                <button type="button" className="c-cardacts__btn" onClick={copyPhone} aria-live="polite">{copied ? <><Check aria-hidden="true" />{T('card.copied', 'Đã sao chép', 'Nút sao chép (đã chép)')}</> : <><Copy aria-hidden="true" />{T('card.copy', 'Sao chép số', 'Nút sao chép số')}</>}</button>
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
            <p className="c-tag"><span className="c-tag__dot" aria-hidden="true" />{T('journey.kicker', 'Sau lời chào', 'Nhãn nhỏ')}</p>
            {(() => { const x = t('journey.title', 'Một lời chào, *một hành trình cùng phát triển.*', 'Tiêu đề quy trình', { rich: true }); return <h2 className="c-journey__title" id="c-journey-title" {...x.a}>{rich(x.v)}</h2>; })()}
            <div className="c-journey__track">
              <svg className="c-journey__river" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 70 C 150 10, 300 110, 450 60 S 750 10, 900 60 S 1100 110, 1200 50" />
              </svg>
              <ol className="c-journey__steps" style={{ ['--n' as string]: about.steps.length }}>
                {about.steps.map((st, i) => (
                  <li key={i} style={{ ['--i' as string]: i }}>
                    <span className="c-journey__node">{String(i + 1).padStart(2, '0')}</span>
                    <h3 {...cmsText(`block.about.steps.${i}.title`, 'Tên bước (Quy trình hợp tác)')}>{st.title}</h3>
                    <p {...cmsText(`block.about.steps.${i}.text`, 'Mô tả bước', { multiline: true })}>{st.text}</p>
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
            <p className="c-tag"><b>01</b> / {T('form-sec.kicker', 'Liên hệ', 'Nhãn mục')}</p>
            {(() => { const x = t('form-sec.title', 'Kể cho chúng tôi nghe về doanh nghiệp của bạn. *DANAVA sẽ gọi lại để tư vấn.*', 'Tiêu đề mục liên hệ', { rich: true }); return <h2 className="c-contact__heading" id="c-contact-heading" {...x.a}>{rich(x.v, 'c-grad c-grad--light')}</h2>; })()}

            <dl className="c-info">
              <div><dt {...P('info.direct', 'Liên hệ trực tiếp', 'Nhãn liên hệ trực tiếp')} /><dd><a href={`tel:${phone}`}>{T('info.hotline', 'Hotline · Zalo:', 'Nhãn hotline')} {formatPhone(phone)}</a></dd></div>
              <div><dt {...P('info.email', 'Email', 'Nhãn email')} /><dd><a href={`mailto:${email}`}>{mail}</a><br /><a href={`mailto:${co.supportEmail}`} {...cmsText('block.company.supportEmail', 'Email hỗ trợ kỹ thuật', G)}>{co.supportEmail}</a> {T('info.support-note', '(hỗ trợ kỹ thuật)', 'Ghi chú email hỗ trợ')}</dd></div>
              <div><dt {...P('info.hours', 'Giờ làm việc', 'Nhãn giờ làm việc')} /><dd {...cmsText('block.company.hours', 'Giờ làm việc', G)}>{co.hours}</dd></div>
              <div><dt {...P('info.legal', 'Pháp nhân', 'Nhãn pháp nhân')} /><dd><span {...cmsText('block.company.companyName', 'Tên pháp nhân', G)}>{co.companyName}</span> · {T('info.rep', 'Đại diện:', 'Nhãn người đại diện')} <span {...cmsText('block.company.representative', 'Người đại diện', G)}>{co.representative}</span></dd></div>
              <div><dt {...P('info.hq', 'Trụ sở', 'Nhãn trụ sở')} /><dd {...cmsText('block.company.legalAddress', 'Địa chỉ trụ sở', G)}>{co.legalAddress}</dd></div>
            </dl>
          </div>

          <div className="c-form">
            {anna.enabled && <MayPerch onPick={() => anna.ask()} />}
            <h3 {...P('form.title', 'Đăng ký tư vấn', 'Tiêu đề biểu mẫu')} />
            <form className="c-form__grid" onSubmit={lock(submit)} noValidate>
              <div className="s-honeypot" aria-hidden="true">
                <label htmlFor="contact-website-trap">Website</label>
                <input id="contact-website-trap" name="website_trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
              </div>

              <div className="c-field">
                <label className="c-sr" htmlFor="contact-name">{L('form.labels.name', 'Họ và tên (bắt buộc)')}</label>
                <input id="contact-name" name="name" autoComplete="name" maxLength={150} placeholder={L('form.placeholders.name', 'Họ và tên *')} value={fields.name} onChange={set('name')} {...invalid('name')} />
                {err('name')}
              </div>
              <div className="c-field">
                <label className="c-sr" htmlFor="contact-phone">{L('form.labels.phone', 'Số điện thoại (bắt buộc)')}</label>
                <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} placeholder={L('form.placeholders.phone', 'Số điện thoại *')} value={fields.phone} onChange={set('phone')} {...invalid('phone')} />
                {err('phone')}
              </div>
              <div className="c-field">
                <label className="c-sr" htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={200} placeholder="E-mail" value={fields.email} onChange={set('email')} {...invalid('email')} />
                {err('email')}
              </div>
              <div className="c-field">
                <label className="c-sr" htmlFor="contact-businessType">{L('form.labels.business-type', 'Loại hình kinh doanh')}</label>
                <select id="contact-businessType" name="businessType" value={fields.businessType} onChange={set('businessType')}>
                  <option value="">{L('form.options.business-type.empty', 'Loại hình kinh doanh')}</option>
                  {VALID_BUSINESS_TYPES.map((b, i) => <option key={b} value={b}>{L(`form.options.business-type.${i}`, b)}</option>)}
                </select>
              </div>
              <div className="c-field c-field--full">
                <p className="c-chips__label" id="c-chips-label" {...P('form.chips-label', 'Bạn quan tâm đến', 'Nhãn chọn nhanh dịch vụ')} />
                <div className="c-chips" role="group" aria-labelledby="c-chips-label">
                  {VALID_CONTACT_SERVICES.filter(x => CHIP[x.id]).map(x => (
                    <button key={x.id} type="button" className={fields.service === x.label ? 'is-on' : ''} aria-pressed={fields.service === x.label}
                      onClick={() => setFields(prev => ({ ...prev, service: prev.service === x.label ? '' : x.label }))}>{T(`form.chips.${x.id}`, CHIP[x.id], 'Nút chọn nhanh dịch vụ')}</button>
                  ))}
                </div>
              </div>
              <div className="c-field c-field--full">
                <label className="c-sr" htmlFor="contact-service">{L('form.labels.service', 'Dịch vụ quan tâm')}</label>
                <select id="contact-service" name="service" value={fields.service} onChange={set('service')}>
                  <option value="">{L('form.options.service.empty', 'Dịch vụ quan tâm')}</option>
                  {VALID_CONTACT_SERVICES.map(s => <option key={s.id} value={s.label}>{L(`form.options.service.${s.id}`, s.label)}</option>)}
                </select>
              </div>
              <div className="c-field c-field--full">
                <label className="c-sr" htmlFor="contact-message">{L('form.labels.message', 'Nhu cầu của bạn (bắt buộc)')}</label>
                <textarea id="contact-message" name="message" rows={5} maxLength={5000} placeholder={L('form.placeholders.message', 'Lời nhắn * — ví dụ: phòng tập 300 hội viên, cần quản lý gói tập và check-in QR…')} value={fields.message} onChange={set('message')} {...invalid('message')} />
                {err('message')}
              </div>

              {status === 'error' && (
                <div className="s-alert s-alert--err c-field--full" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <span>{feedback}</span>
                </div>
              )}

              <button type="submit" className="c-submit c-field--full" disabled={status === 'sending'}>
                {status === 'sending' ? 'Đang gửi…' : <>{T('form.submit', 'Đăng ký tư vấn', 'Nút gửi biểu mẫu')} <ArrowRight aria-hidden="true" /></>}
              </button>
              <p className="c-form__note c-field--full">
                {T('form.note', 'Trường có dấu * là bắt buộc. Bằng việc gửi biểu mẫu, bạn đồng ý với', 'Ghi chú biểu mẫu')} <Link href="/chinh-sach-rieng-tu/">{T('form.note-link', 'chính sách riêng tư', 'Liên kết chính sách riêng tư')}</Link> {T('form.note-end', 'của DANAVA.', 'Ghi chú biểu mẫu (cuối)')}
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* 02 / Văn phòng: thẻ có bản đồ nằm ngay trong thẻ */}
      <section className="c-offices-sec" aria-labelledby="c-office-heading">
        <div className="s-container">
          <p className="c-tag"><b>02</b> / {T('office.kicker', 'Văn phòng', 'Nhãn mục')}</p>
          {(() => { const x = t('office.title', 'Đà Nẵng · *Phục vụ toàn quốc*', 'Tiêu đề mục văn phòng', { rich: true }); return <h2 className="c-offices-sec__heading" id="c-office-heading" {...x.a}>{rich(x.v, 'c-grad')}</h2>; })()}

          <div className="c-offices">
            <div className="c-office c-office--main">
              <div className="c-office__body">
                <span className="c-office__city" {...P('office.main.city', 'Đà Nẵng', 'Thành phố')} />
                <h3><MapPin aria-hidden="true" />{T('office.main.title', 'Trụ sở chính', 'Tên thẻ')}</h3>
                <p {...cmsText('block.company.legalAddress', 'Địa chỉ trụ sở', G)}>{co.legalAddress}</p>
                <a href={co.mapUrl} target="_blank" rel="noopener noreferrer">{T('office.main.link', 'Chỉ đường trên Google Maps →', 'Liên kết chỉ đường')}</a>
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
                <span className="c-office__city" {...P('office.hours.city', 'Giờ làm việc', 'Nhãn thẻ')} />
                <h3><Clock aria-hidden="true" /><span {...cmsText('block.company.hours', 'Giờ làm việc', G)}>{co.hours}</span></h3>
                <p {...P('office.hours.text', 'Ngoài giờ, bạn cứ để lại yêu cầu — chúng tôi gọi lại vào ngày làm việc kế tiếp.', 'Mô tả', { multiline: true })} />
                <a href={zalo} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />{T('office.hours.link', 'Nhắn Zalo', 'Liên kết Zalo')}</a>
              </div>
            </div>
            <div className="c-office">
              <div className="c-office__body">
                <span className="c-office__city" {...P('office.support.city', 'Khách hàng hiện tại', 'Nhãn thẻ')} />
                <h3><LifeBuoy aria-hidden="true" />{T('office.support.title', 'Hỗ trợ kỹ thuật & bảo hành', 'Tên thẻ')}</h3>
                <p {...P('office.support.text', 'Đang sử dụng dịch vụ của DANAVA và cần hỗ trợ?', 'Mô tả', { multiline: true })} />
                <Link href="/chinh-sach-dich-vu/#kenh-tiep-nhan">{T('office.support.link', 'Xem kênh hỗ trợ kỹ thuật →', 'Liên kết hỗ trợ')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mỗi dự án bắt đầu bằng một lời chào: ảnh hoạt động thật (CMS → Về DANAVA → Ảnh hoạt động) trôi chậm */}
      {about.moments.length > 0 && (
        <section className="c-moments" aria-labelledby="c-moments-title">
          <div className="s-container">
            {(() => { const x = t('moments.title', 'Mỗi dự án *bắt đầu bằng một lời chào.*', 'Tiêu đề ảnh hoạt động', { rich: true }); return <h2 className="c-moments__title" id="c-moments-title" {...x.a}>{rich(x.v)}</h2>; })()}
          </div>
          <div className="c-moments__rail">
            <ul className="c-moments__track">
              {[...about.moments, ...about.moments].map((m, i) => (
                <li key={i} aria-hidden={i >= about.moments.length ? true : undefined} style={{ ['--t' as string]: `${(i % 5) - 2}deg` }}>
                  <figure><img src={m.src} alt={i >= about.moments.length ? '' : m.title} width={480} height={360} loading="lazy" decoding="async" /><figcaption {...(i < about.moments.length ? cmsText(`block.about.moments.${i}.title`, 'Chú thích ảnh hoạt động') : {})}>{m.title}</figcaption></figure>
                </li>
              ))}
            </ul>
          </div>
          <div className="s-container c-moments__cta">
            <p className="c-start__ask" {...P('moments.ask', 'Câu chuyện tiếp theo có thể là của bạn.', 'Câu mời')} />
            <div className="c-start">
              <a className="c-start__btn c-start__btn--main" href="#dang-ky-tu-van">
                <CuteChat /><span><small {...P('moments.cta.kicker', 'Bắt đầu ngay', 'Nhãn nút')} />{T('moments.cta.label', 'Gửi lời chào tới DANAVA', 'Chữ nút')}</span><ArrowRight className="c-start__arrow" aria-hidden="true" />
              </a>
              <a className="c-start__btn" href={`tel:${phone}`}>
                <CutePhone /><span><small {...P('moments.call', 'Hoặc gọi', 'Nhãn nút gọi')} />{formatPhone(phone)}</span>
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
            <h2 id="c-modal-title" {...P('modal.title', 'Thông báo', 'Tiêu đề hộp xác nhận')} />
            <p>{feedback} {T('modal.text', 'DANAVA sẽ liên hệ lại với bạn trong thời gian sớm nhất.', 'Lời nhắn sau khi gửi')}</p>
            <p className="s-small s-muted">{T('modal.urgent', 'Cần gấp? Gọi', 'Gợi ý gọi gấp')} <a className="s-textlink" href={`tel:${phone}`}>{formatPhone(phone)}</a></p>
            <button ref={confirmRef} type="button" className="s-btn s-btn--primary s-btn--block" onClick={() => setStatus('idle')} {...P('modal.ok', 'Xác nhận', 'Nút xác nhận')} />
          </div>
        </div>
      )}
    </main>
  );
}

export default ContactPage;
