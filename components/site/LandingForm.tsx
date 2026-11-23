'use client';
/** Biểu mẫu đăng ký trên landing page: gửi về mục Khách hàng với nguồn "lp:{slug}". */
import { useState, type FormEvent } from 'react';

export function LandingForm({ slug, service, buttonLabel }: { slug: string; service: string; buttonLabel: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') || '').trim(), phone = String(f.get('phone') || '').trim();
    const need = String(f.get('message') || '').trim();
    if (name.length < 2) return setError('Vui lòng nhập họ tên.');
    if (phone.replace(/\D/g, '').length < 9) return setError('Vui lòng nhập số điện thoại hợp lệ.');
    setState('busy'); setError('');
    try {
      const r = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email: String(f.get('email') || ''), service: service || 'Đăng ký từ landing page', message: need || `Đăng ký nhận tư vấn từ landing page /lp/${slug}/`, source: `lp:${slug}`, website_trap: String(f.get('website') || '') })
      });
      const v = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(v.error || 'Chưa gửi được. Bạn thử lại nhé.');
      setState('done');
    } catch (err) {
      setError((err as Error).message);
      setState('idle');
    }
  }

  if (state === 'done') return <div className="lpb-form lpb-form--done" role="status"><b>Cảm ơn bạn!</b><p>DANAVA đã nhận thông tin và sẽ liên hệ lại trong ngày làm việc.</p></div>;
  return (
    <form className="lpb-form" onSubmit={submit} noValidate>
      <label>Họ và tên<input name="name" autoComplete="name" maxLength={150} required /></label>
      <label>Số điện thoại<input name="phone" type="tel" autoComplete="tel" maxLength={25} required /></label>
      <label>Email (tùy chọn)<input name="email" type="email" autoComplete="email" maxLength={200} /></label>
      <label>Nhu cầu của bạn (tùy chọn)<textarea name="message" rows={3} maxLength={2000} /></label>
      <div className="lpb-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p className="lpb-form__error" role="alert">{error}</p>}
      <button className="s-btn s-btn--primary s-btn--lg" disabled={state === 'busy'}>{state === 'busy' ? 'Đang gửi…' : buttonLabel}</button>
    </form>
  );
}
