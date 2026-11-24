'use client';
/** Phần tương tác của trang Tuyển dụng: tên + vị trí dùng chung cho thẻ đeo, các cánh cửa và biểu mẫu. */
import Link from 'next/link';
import { createContext, useContext, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { APPLY_LIMITS, parseApplication, type Position } from '@/lib/careers';
import { useLanyard } from './useLanyard';
import { useSite } from '../../SiteStore';
import { ct } from '../cms';

/** Chữ cố định sửa được trong trình biên tập (khóa careers.*), bọc trong <span>. */
function useText() {
  const { data } = useSite();
  return (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = ct(data, `careers.${k}`, def, label, opts); return <span {...x.a}>{x.v}</span>; };
}

type State = {
  positions: Position[];
  name: string; setName: (v: string) => void;
  position: string; setPosition: (v: string) => void;
  sent: boolean; setSent: (v: boolean) => void;
  goToForm: (position?: string) => void;
};
const Context = createContext<State | null>(null);

function useCareers() {
  const value = useContext(Context);
  if (!value) throw Error('CareersProvider is missing');
  return value;
}

export function CareersProvider({ positions, children }: { positions: Position[]; children: ReactNode }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [sent, setSent] = useState(false);

  const goToForm = (next?: string) => {
    if (next) setPosition(next);
    setSent(false);
    // Đợi biểu mẫu vẽ lại (có thể đang hiện lời cảm ơn) rồi mới cuộn và đưa con trỏ vào
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('td-form')?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
      document.getElementById(name.trim() ? 'td-phone' : 'td-name')?.focus({ preventScroll: true });
    }));
  };

  return <Context.Provider value={{ positions, name, setName, position, setPosition, sent, setSent, goToForm }}>{children}</Context.Provider>;
}

export function NameField() {
  const { name, setName, goToForm } = useCareers();
  const T = useText();
  return (
    <form className="td-sign" onSubmit={event => { event.preventDefault(); goToForm(); }}>
      <label className="s-sr" htmlFor="td-hero-name">Tên của bạn</label>
      <input id="td-hero-name" value={name} maxLength={APPLY_LIMITS.name} placeholder="Viết tên bạn vào đây…" autoComplete="name" enterKeyHint="next" onChange={e => setName(e.target.value)} />
      <button type="submit">{T('sign.button', 'Nhận thẻ', 'Nút nhận thẻ')}<ArrowRight aria-hidden="true" /></button>
    </form>
  );
}

export function PickPosition({ value, className, label, children }: { value?: string; className: string; label?: string; children: ReactNode }) {
  const { goToForm } = useCareers();
  return <button type="button" className={className} aria-label={label} onClick={() => goToForm(value)}>{children}</button>;
}

const initials = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(-2).map(word => Array.from(word)[0]).join('').toUpperCase();

/** Thẻ đeo: đổi theo tên và vị trí; kéo dây để giãn (chữ lặp thêm theo độ dài), thả ra búng về. */
export function LiveBadge({ motto, compact = false }: { motto: string; compact?: boolean }) {
  const { positions, name, position, sent } = useCareers();
  const rig = useRef<HTMLDivElement>(null);
  useLanyard(rig);
  const role = positions.find(p => p.value === position)?.badge || 'Đồng đội tương lai';
  const shown = name.trim();

  return (
    <div className={`td-live${compact ? ' td-live--compact' : ''}`} aria-hidden="true">
      <div ref={rig} className="td-live__rig">
        <div className="td-live__idle">
          <span className="td-live__strap" />
          <span className="td-live__reel"><i /></span>
          <div className="td-live__hanger">
            <span className="td-live__clip" />
            <div className="td-live__card">
              <img className="td-live__logo" src="/assets/danava-logo-trim.png" alt="" width={554} height={135} draggable={false} />
              <span className="td-live__photo">{shown ? initials(shown) : '?'}</span>
              <span className={`td-live__name${shown.length > 22 ? ' is-long' : ''}`}>{shown || 'Tên của bạn'}</span>
              <span className="td-live__role">{role}</span>
              <span className="td-live__wave" />
              <span className="td-live__motto">{motto}</span>
              {sent && <span className="td-live__stamp">Đã gửi hồ sơ</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY = { phone: '', email: '', link: '', intro: '', consent: false, website_trap: '' };

export function ApplyForm() {
  const { positions, name, setName, position, setPosition, sent, setSent } = useCareers();
  const [fields, setFields] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<{ text: string; field?: string } | null>(null);
  const T = useText();

  const set = (key: keyof typeof EMPTY, value: string | boolean) => {
    setFields(current => ({ ...current, [key]: value }));
    if (problem?.field === key) setProblem(null);
  };
  const fail = (text: string, field?: string) => {
    setProblem({ text, field });
    if (field) document.getElementById(`td-${field}`)?.focus();
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const body = { ...fields, name, position };
    const checked = parseApplication(body, positions);
    if (!checked.application) return fail(checked.error!, checked.field);
    setBusy(true);
    setProblem(null);
    try {
      const res = await fetch('/api/recruit/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return fail(result.error || 'Chưa gửi được hồ sơ. Bạn thử lại nhé.', result.field);
      setSent(true);
      setFields(EMPTY);
    } catch {
      fail('Không có kết nối mạng. Bạn thử lại hoặc gửi CV qua email nhé.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="td-form td-form--done" id="td-form" role="status" tabIndex={-1} ref={el => el?.focus({ preventScroll: true })}>
        <span className="td-form__check"><Check aria-hidden="true" /></span>
        <h3>Cảm ơn {name.trim()}!</h3>
        <p>{T('form.done-text', 'DANAVA đã nhận được hồ sơ của bạn.', 'Lời nhắn sau khi gửi', { multiline: true })}</p>
        <button type="button" className="td-btn td-btn--ghost" onClick={() => setSent(false)}>{T('form.again', 'Gửi hồ sơ khác', 'Nút gửi hồ sơ khác')}</button>
      </div>
    );
  }

  const invalid = (field: string) => (problem?.field === field ? { 'aria-invalid': true as const, 'aria-describedby': 'td-problem' } : {});

  return (
    <form className="td-form" id="td-form" onSubmit={submit} noValidate>
      <div className="td-field">
        <label htmlFor="td-name">{T('form.name', 'Họ và tên', 'Nhãn họ tên')}</label>
        <input id="td-name" value={name} maxLength={APPLY_LIMITS.name} autoComplete="name" onChange={e => { setName(e.target.value); if (problem?.field === 'name') setProblem(null); }} {...invalid('name')} />
      </div>
      <div className="td-field">
        <label htmlFor="td-phone">{T('form.phone', 'Số điện thoại', 'Nhãn số điện thoại')}</label>
        <input id="td-phone" type="tel" value={fields.phone} maxLength={APPLY_LIMITS.phone} autoComplete="tel" onChange={e => set('phone', e.target.value)} {...invalid('phone')} />
      </div>
      <div className="td-field">
        <label htmlFor="td-email">{T('form.email', 'Email', 'Nhãn email')}</label>
        <input id="td-email" type="email" value={fields.email} maxLength={APPLY_LIMITS.email} autoComplete="email" onChange={e => set('email', e.target.value)} {...invalid('email')} />
      </div>
      <div className="td-field">
        <label htmlFor="td-position">{T('form.position', 'Vị trí hoặc mảng', 'Nhãn vị trí')}</label>
        <select id="td-position" value={position} onChange={e => { setPosition(e.target.value); if (problem?.field === 'position') setProblem(null); }} {...invalid('position')}>
          <option value="">Chọn một cánh cửa</option>
          {positions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <div className="td-field td-field--wide">
        <label htmlFor="td-link">{T('form.link', 'Link CV hoặc portfolio', 'Nhãn link CV')} <small>{T('form.link-hint', 'nhớ mở quyền xem', 'Gợi ý link CV')}</small></label>
        <input id="td-link" type="url" value={fields.link} maxLength={APPLY_LIMITS.link} placeholder="https://" onChange={e => set('link', e.target.value)} {...invalid('link')} />
      </div>
      <div className="td-field td-field--wide">
        <label htmlFor="td-intro">{T('form.intro', 'Đôi dòng về bạn', 'Nhãn giới thiệu')} <small>{T('form.intro-hint', 'bắt buộc nếu không có CV', 'Gợi ý giới thiệu')}</small></label>
        <textarea id="td-intro" rows={4} value={fields.intro} maxLength={APPLY_LIMITS.intro} onChange={e => set('intro', e.target.value)} {...invalid('intro')} />
      </div>
      <div className="td-trap" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={fields.website_trap} onChange={e => set('website_trap', e.target.value)} /></label>
      </div>
      <label className="td-consent">
        <input id="td-consent" type="checkbox" checked={fields.consent} onChange={e => set('consent', e.target.checked)} {...invalid('consent')} />
        <span>{T('form.consent', 'Tôi đồng ý để DANAVA sử dụng thông tin này để xét tuyển và liên hệ với tôi.', 'Câu đồng ý', { multiline: true })} <Link href="/chinh-sach-rieng-tu/">{T('form.consent-link', 'Chính sách riêng tư', 'Liên kết chính sách riêng tư')}</Link></span>
      </label>
      {problem && <p className="td-problem" id="td-problem" role="alert">{problem.text}</p>}
      <button className="td-btn td-btn--send" type="submit" disabled={busy}>{busy ? 'Đang gửi…' : T('form.submit', 'Gửi hồ sơ', 'Nút gửi hồ sơ')}<ArrowRight aria-hidden="true" /></button>
    </form>
  );
}
