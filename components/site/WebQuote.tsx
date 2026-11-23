'use client';
/*
 * Thu thập yêu cầu landing page / website và hiện báo giá tham khảo.
 * Bốn bước hỏi (loại → mục tiêu → quy mô → thời gian), bước 5 là thông tin liên hệ.
 * Gửi qua /api/lead (cùng kênh với form tư vấn) kèm bản tóm tắt yêu cầu.
 */
import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import { ADDONS, GOALS, KINDS, TIERS, TIMELINES, briefText, estimate, rangeText, type Brief, type Kind } from '@/lib/web-quote';
import { isValidPhoneNumber } from '@/lib/contact-services';

const STEPS = ['Loại', 'Mục tiêu', 'Quy mô', 'Thời gian', 'Liên hệ'];

const initial: Brief & { name: string; phone: string; email: string } = {
  kind: 'landing', goal: GOALS[0], industry: '', hasBrand: true, tierId: 'l-standard', addonIds: [],
  timelineId: 'normal', contentReady: false, note: '', name: '', phone: '', email: ''
};

export function WebQuote() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(f => ({ ...f, [key]: value }));
  const toggleAddon = (id: string) => set('addonIds', form.addonIds.includes(id) ? form.addonIds.filter(x => x !== id) : [...form.addonIds, id]);
  const setKind = (kind: Kind) => setForm(f => ({ ...f, kind, tierId: TIERS[kind][1].id }));

  const price = useMemo(() => estimate(form.kind, form.tierId, form.addonIds, form.timelineId), [form.kind, form.tierId, form.addonIds, form.timelineId]);
  const tiers = TIERS[form.kind];

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Vui lòng nhập họ và tên.');
    if (!form.phone.trim() || !isValidPhoneNumber(form.phone.trim())) return setError('Vui lòng nhập số điện thoại hợp lệ.');
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          businessType: form.industry.trim(),
          service: KINDS.find(k => k.id === form.kind)?.label ?? form.kind,
          message: briefText(form) + (price ? `\nBáo giá tham khảo: ${rangeText(price)}` : ''),
          source: 'bao-gia-web'
        })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Không gửi được yêu cầu, vui lòng thử lại.');
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Không gửi được yêu cầu, vui lòng thử lại.');
    }
  };

  if (status === 'done') {
    return (
      <div className="wq-done" role="status">
        <span className="wq-done__ico" aria-hidden="true"><Check /></span>
        <h2>Đã nhận yêu cầu của bạn</h2>
        <p>Chuyên viên DANAVA sẽ liên hệ trong thời gian sớm nhất để xác nhận phạm vi và báo giá chính thức.</p>
      </div>
    );
  }

  return (
    <div className="wq">
      <div className="wq__main">
        <ol className="wq__steps" aria-label="Tiến trình">
          {STEPS.map((label, i) => (
            <li key={label} className={i === step ? 'is-on' : i < step ? 'is-done' : undefined} aria-current={i === step ? 'step' : undefined}>
              <span>{i + 1}</span>{label}
            </li>
          ))}
        </ol>

        <form className="wq__form" onSubmit={step === STEPS.length - 1 ? submit : (e) => { e.preventDefault(); next(); }} noValidate>
          {step === 0 && (
            <fieldset className="wq__group">
              <legend>Bạn cần làm gì?</legend>
              <div className="wq__cards">
                {KINDS.map(k => (
                  <label key={k.id} className={`wq__card${form.kind === k.id ? ' is-on' : ''}`}>
                    <input type="radio" name="kind" value={k.id} checked={form.kind === k.id} onChange={() => setKind(k.id)} />
                    <strong>{k.label}</strong>
                    <span>{k.desc}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <>
              <fieldset className="wq__group">
                <legend>Mục tiêu chính</legend>
                <div className="wq__chips">
                  {GOALS.map(g => (
                    <label key={g} className={`wq__chip${form.goal === g ? ' is-on' : ''}`}>
                      <input type="radio" name="goal" value={g} checked={form.goal === g} onChange={() => set('goal', g)} />{g}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="wq__field">
                <span>Ngành hoặc lĩnh vực</span>
                <input value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Ví dụ: phòng tập yoga, bất động sản, nhà hàng" maxLength={150} />
              </label>
              <fieldset className="wq__group">
                <legend>Đã có logo hoặc nhận diện thương hiệu chưa?</legend>
                <div className="wq__chips">
                  <label className={`wq__chip${form.hasBrand ? ' is-on' : ''}`}><input type="radio" name="brand" checked={form.hasBrand} onChange={() => set('hasBrand', true)} />Đã có</label>
                  <label className={`wq__chip${!form.hasBrand ? ' is-on' : ''}`}><input type="radio" name="brand" checked={!form.hasBrand} onChange={() => set('hasBrand', false)} />Chưa có</label>
                </div>
              </fieldset>
            </>
          )}

          {step === 2 && (
            <>
              <fieldset className="wq__group">
                <legend>Quy mô {form.kind === 'landing' ? 'landing page' : 'website'}</legend>
                <div className="wq__cards">
                  {tiers.map(t => (
                    <label key={t.id} className={`wq__card${form.tierId === t.id ? ' is-on' : ''}`}>
                      <input type="radio" name="tier" value={t.id} checked={form.tierId === t.id} onChange={() => set('tierId', t.id)} />
                      <strong>{t.label}</strong>
                      <span>{t.desc}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="wq__group">
                <legend>Bổ sung (không bắt buộc)</legend>
                <div className="wq__chips">
                  {ADDONS.map(a => (
                    <label key={a.id} className={`wq__chip${form.addonIds.includes(a.id) ? ' is-on' : ''}`}>
                      <input type="checkbox" checked={form.addonIds.includes(a.id)} onChange={() => toggleAddon(a.id)} />{a.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {step === 3 && (
            <>
              <fieldset className="wq__group">
                <legend>Thời gian mong muốn</legend>
                <div className="wq__chips">
                  {TIMELINES.map(t => (
                    <label key={t.id} className={`wq__chip${form.timelineId === t.id ? ' is-on' : ''}`}>
                      <input type="radio" name="timeline" value={t.id} checked={form.timelineId === t.id} onChange={() => set('timelineId', t.id)} />{t.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="wq__group">
                <legend>Nội dung (chữ, ảnh) đã sẵn sàng chưa?</legend>
                <div className="wq__chips">
                  <label className={`wq__chip${form.contentReady ? ' is-on' : ''}`}><input type="radio" name="content" checked={form.contentReady} onChange={() => set('contentReady', true)} />Đã sẵn sàng</label>
                  <label className={`wq__chip${!form.contentReady ? ' is-on' : ''}`}><input type="radio" name="content" checked={!form.contentReady} onChange={() => set('contentReady', false)} />Cần DANAVA hỗ trợ</label>
                </div>
              </fieldset>
            </>
          )}

          {step === 4 && (
            <>
              <label className="wq__field">
                <span>Họ và tên *</span>
                <input autoComplete="name" value={form.name} onChange={e => set('name', e.target.value)} maxLength={150} required />
              </label>
              <label className="wq__field">
                <span>Số điện thoại *</span>
                <input type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={25} required />
              </label>
              <label className="wq__field">
                <span>Email</span>
                <input type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} maxLength={200} />
              </label>
              <label className="wq__field">
                <span>Ghi chú thêm</span>
                <textarea rows={4} value={form.note} onChange={e => set('note', e.target.value)} maxLength={2000} placeholder="Ví dụ: thời gian chạy quảng cáo, các trang đối thủ bạn thích…" />
              </label>
              {error && <p className="wq__error" role="alert">{error}</p>}
            </>
          )}

          <div className="wq__nav">
            {step > 0 && <button type="button" className="wq__btn wq__btn--ghost" onClick={back}><ArrowLeft aria-hidden="true" />Quay lại</button>}
            {step < STEPS.length - 1 ? (
              <button type="submit" className="wq__btn wq__btn--primary">Tiếp tục <ArrowRight aria-hidden="true" /></button>
            ) : (
              <button type="submit" className="wq__btn wq__btn--primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Đang gửi…' : <>Gửi yêu cầu báo giá <Send aria-hidden="true" /></>}
              </button>
            )}
          </div>
        </form>
      </div>

      <aside className="wq__aside" aria-label="Báo giá tham khảo">
        <p className="wq__aside-label">Báo giá tham khảo</p>
        <p className="wq__range">{price ? rangeText(price) : 'Chọn gói để xem giá'}</p>
        <p className="wq__note">Khoảng giá tham khảo theo lựa chọn hiện tại. Báo giá chính thức sau khi chuyên viên xác nhận phạm vi.</p>
        <dl className="wq__summary">
          <div><dt>Loại</dt><dd>{KINDS.find(k => k.id === form.kind)?.label}</dd></div>
          <div><dt>Gói</dt><dd>{tiers.find(t => t.id === form.tierId)?.label ?? '—'}</dd></div>
          <div><dt>Bổ sung</dt><dd>{form.addonIds.length || 'Không'}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
