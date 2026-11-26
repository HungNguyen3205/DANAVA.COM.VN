'use client';
/*
 * Phiếu báo giá dạng hội thoại. ANNA (bé Mây, chatbot duy nhất của website) hỏi từng câu trong khung chat của mình
 * (thẻ "Phiếu báo giá", render qua portal vào ANNA); trên trang chỉ còn thẻ mở ANNA + các câu đã trả lời.
 * ANNA bị tắt trên toàn website → hội thoại hiện ngay trên trang như cũ.
 * Bảng bên cạnh cập nhật tiến độ và báo giá tham khảo. Khách xác nhận rồi mới gửi vào admin
 * qua /api/lead (nguồn theo từng loại phiếu). Hai loại: landing page / website và tổ chức sự kiện.
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useAnna } from './anna/AnnaProvider';
import { useSubmitLock } from './useSubmitLock';
import { useRouter } from 'next/navigation';
import { ArrowUp, Bot, Check, MessageCircle, Send } from 'lucide-react';
import { ADVICE, QUICK_SECTIONS, QUICK_STEPS, SCALE_TO_TIER, buildBrief, type Answers, type Step } from '@/lib/landing-brief';
import { EVENT_QUICK_SECTIONS, EVENT_QUICK_STEPS, eventEstimate } from '@/lib/event-brief';
import { templateById, type WebTemplate } from '@/lib/web-templates';
import { useSite } from '../SiteStore';
import { ADDONS, estimate, rangeText } from '@/lib/web-quote';
import { isValidPhoneNumber } from '@/lib/contact-services';

export type FlowId = 'landing' | 'events';

type Msg = { from: 'bot' | 'user'; text: string };

const TYPING_MS = 450;

const FLOWS = {
  landing: {
    steps: QUICK_STEPS,
    sections: QUICK_SECTIONS,
    title: '[Phiếu thiết kế landing page]',
    service: 'Landing page',
    source: 'phieu-landing',
    panel: 'Phiếu thiết kế landing page',
    estimate: (a: Answers) => {
      const addonIds = (Array.isArray(a.addons) ? a.addons : []).map(label => ADDONS.find(x => x.label === label)?.id).filter((x): x is string => !!x);
      const tierId = SCALE_TO_TIER[typeof a.scale === 'string' ? a.scale : ''] ?? 'l-standard';
      return a.scale ? estimate('landing', tierId, addonIds, 'normal') : null;
    }
  },
  events: {
    steps: EVENT_QUICK_STEPS,
    sections: EVENT_QUICK_SECTIONS,
    title: '[Phiếu báo giá tổ chức sự kiện]',
    service: 'Tổ chức sự kiện',
    source: 'phieu-su-kien',
    panel: 'Phiếu báo giá tổ chức sự kiện',
    estimate: (a: Answers) => eventEstimate(typeof a.guests === 'string' ? a.guests : undefined, Array.isArray(a.agenda) ? a.agenda : undefined)
  }
} as const;

export function QuoteChat({ flow = 'landing' }: { flow?: FlowId }) {
  const cfg = FLOWS[flow];
  const steps: Step[] = cfg.steps;
  const [messages, setMessages] = useState<Msg[]>([{ from: 'bot', text: steps[0].bot }]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const thread = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // Khách bấm "Dùng mẫu này" ở kho mẫu (/mau-website/) → /bao-gia-web/?mau=<slug>: ghi tên mẫu vào phiếu và nhắc trong khung chat
  const [tpl, setTpl] = useState<WebTemplate | null>(null);
  const siteData = useSite().data;
  useEffect(() => {
    if (flow !== 'landing') return;
    const t = templateById(siteData, new URLSearchParams(window.location.search).get('mau') || '');
    if (!t) return;
    setTpl(t);
    setMessages(m => [{ from: 'bot', text: `Bạn đã chọn ${t.name.toLowerCase()} (${t.brand}, phong cách ${t.style}). DANAVA sẽ may đo mẫu này theo thương hiệu của bạn.` }, ...m]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ đọc một lần khi mở trang
  }, [flow]);
  const anna = useAnna();
  const inAnna = anna.enabled;
  const { setPage, openDesign } = anna;
  // Đăng ký thẻ "Phiếu báo giá" trong ANNA; máy tính: mở sẵn khung chat
  useEffect(() => {
    if (!inAnna) return;
    setPage({ label: 'Phiếu báo giá', icon: 'form' });
    const t = window.matchMedia('(min-width: 1024px)').matches ? window.setTimeout(openDesign, 500) : 0;
    return () => { clearTimeout(t); setPage(null); };
  }, [inAnna, setPage, openDesign]);

  const finished = index >= steps.length;
  const step: Step | undefined = steps[index];

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  /** Trả lời câu hiện tại, rồi hỏi câu tiếp theo sau một nhịp ngắn */
  const answer = (value: string | string[], shown: string) => {
    if (!step || typing) return;
    setAnswers({ ...answers, [step.id]: value });
    setError('');
    setDraft('');
    setPicked([]);
    setMessages(m => [...m, { from: 'user', text: shown }]);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setTyping(true);
    setTimeout(() => {
      if (nextIndex < steps.length) setMessages(m => [...m, { from: 'bot', text: steps[nextIndex].bot }]);
      setTyping(false);
    }, TYPING_MS);
  };

  const sendText = (event: FormEvent) => {
    event.preventDefault();
    if (!step) return;
    const text = draft.trim();
    if (!text) return step.required ? setError('Bạn vui lòng trả lời câu này nhé.') : answer('', 'Bỏ qua');
    if (step.kind === 'phone' && !isValidPhoneNumber(text)) return setError('Số điện thoại chưa đúng, bạn kiểm tra lại giúp mình.');
    if (step.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return setError('Email chưa đúng định dạng.');
    if (text.length > 2000) return setError('Nội dung quá dài, bạn rút gọn giúp mình nhé.');
    answer(text, text);
  };

  const choose = (option: string) => {
    if (!step) return;
    if (option === ADVICE) return answer(ADVICE, ADVICE);
    if (step.kind === 'multi') {
      const set = picked.includes(option) ? picked.filter(x => x !== option) : [...picked, option];
      if (step.id === 'style' && set.length > 2) return setError('Bạn chọn tối đa hai phong cách nhé.');
      setError('');
      return setPicked(set);
    }
    answer(option, option);
  };

  const confirmMulti = () => {
    if (!step) return;
    if (!picked.length && step.required) return setError('Bạn chọn ít nhất một mục nhé.');
    answer(picked, picked.length ? picked.join(', ') : 'Không có');
  };

  const price = cfg.estimate(answers);
  const brief = (tpl ? `Mẫu đã chọn: ${tpl.name} — ${tpl.brand} (/mau-website/${tpl.id}/)
` : '') + buildBrief(answers, steps, cfg.sections, cfg.title);

  /** Khách xác nhận: gửi vào admin rồi sang trang cảm ơn */
  const lock = useSubmitLock();
  const submit = async () => {
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(answers.name ?? '').trim(),
          phone: String(answers.phone ?? '').trim(),
          email: String(answers.email ?? '').trim(),
          businessType: String(answers.industry ?? answers.brand ?? '').trim(),
          service: cfg.service,
          message: brief + (price ? `\n\nBáo giá tham khảo: ${rangeText(price)}` : ''),
          source: cfg.source
        })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Chưa gửi được phiếu, bạn thử lại giúp mình.');
      router.push('/bao-gia-web/cam-on/');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Chưa gửi được phiếu, bạn thử lại giúp mình.');
    }
  };


  const currentSection = step ? step.section : cfg.sections.length - 1;

  /* ---------- Hội thoại trong khung chat ANNA ---------- */
  const textInput = step && step.kind !== 'single' && step.kind !== 'multi';
  const annaChat: ReactNode = (
    <div className="an-chat qc-anna">
      <div className="an-log" ref={thread} role="log" aria-live="polite" aria-label={cfg.panel}>
        <p className="qc-anna__tag">{cfg.panel} · {steps.length} câu, khoảng 2 phút</p>
        {messages.map((m, i) => m.from === 'user'
          ? <p key={i} className="an-msg an-msg--me">{m.text}</p>
          : <div key={i} className="an-msg an-msg--bot"><p>{m.text}</p></div>)}
        {typing && <p className="an-typing" role="status"><i /><i /><i />ANNA đang soạn…</p>}
        {!finished && step && !typing && (
          <>
            {step.hint && <p className="qc-anna__hint">{step.hint}</p>}
            {(step.kind === 'single' || step.kind === 'multi') && (
              <ul className="an-suggest qc-anna__chips" aria-label="Chọn câu trả lời">
                {(step.options ?? []).map(opt => (
                  <li key={opt}><button type="button" className={step.kind === 'multi' && picked.includes(opt) ? 'is-on' : opt === ADVICE ? 'is-advice' : undefined} onClick={() => choose(opt)} aria-pressed={step.kind === 'multi' ? picked.includes(opt) : undefined}>{step.kind === 'multi' && picked.includes(opt) && <Check aria-hidden="true" />}{opt}</button></li>
                ))}
                {step.kind === 'multi' && <li><button type="button" className="is-go" onClick={confirmMulti}>Xong <Check aria-hidden="true" /></button></li>}
              </ul>
            )}
            {(step.allowAdvice && textInput) || (!step.required && textInput) ? (
              <ul className="an-suggest qc-anna__chips">
                {step.allowAdvice && textInput && <li><button type="button" className="is-advice" onClick={() => answer(ADVICE, ADVICE)}>{ADVICE}</button></li>}
                {!step.required && textInput && <li><button type="button" onClick={() => answer('', 'Bỏ qua')}>Bỏ qua</button></li>}
              </ul>
            ) : null}
          </>
        )}
        {finished && (
          <div className="an-msg an-msg--bot qc-anna__finish">
            <p>Mình đã có đủ thông tin. Bạn kiểm tra lại rồi xác nhận để DANAVA nhận phiếu nhé.</p>
            <pre className="qc__brief">{brief}</pre>
            {price && <p className="qc-anna__price">Báo giá tham khảo: <b>{rangeText(price)}</b></p>}
            <button type="button" className="qc__btn" onClick={lock(submit)} disabled={status === 'sending'}>
              {status === 'sending' ? 'Đang gửi…' : <>Xác nhận và gửi báo giá <Send aria-hidden="true" /></>}
            </button>
          </div>
        )}
        {error && <p className="qc__error" role="alert">{error}</p>}
      </div>
      {!finished && textInput && !typing && (
        <form className="an-form" onSubmit={sendText}>
          {step.kind === 'long'
            ? <textarea rows={1} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Bạn trả lời ở đây…" maxLength={2000} aria-label={step.bot} />
            : <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Bạn trả lời ở đây…" maxLength={step.kind === 'phone' ? 25 : 200} type={step.kind === 'phone' ? 'tel' : step.kind === 'email' ? 'email' : 'text'} inputMode={step.kind === 'phone' ? 'tel' : undefined} autoComplete={step.kind === 'phone' ? 'tel' : step.kind === 'email' ? 'email' : undefined} aria-label={step.bot} />}
          <button type="submit" className="an-send" aria-label="Gửi câu trả lời"><ArrowUp aria-hidden="true" /></button>
        </form>
      )}
      <p className="an-legal">Thông tin chỉ dùng để DANAVA liên hệ báo giá cho bạn.</p>
    </div>
  );
  const answered = messages.filter(m => m.from === 'user').length;
  const progress = finished ? 'Đã đủ thông tin — xác nhận trong khung ANNA để gửi phiếu.' : answered ? `Đã trả lời ${answered}/${steps.length} câu.` : `${steps.length} câu ngắn, khoảng 2 phút.`;

  return (
    <div className={`qc${inAnna ? ' qc--anna' : ''}`}>
      {inAnna && anna.slot && createPortal(annaChat, anna.slot)}
      {!inAnna && (
      <section className="qc__chat" aria-label={cfg.panel}>
        <div className="qc__head">
          <span className="qc__avatar" aria-hidden="true"><Bot /></span>
          <div>
            <strong>Trợ lý DANAVA</strong>
            <span>{cfg.panel} · {steps.length} câu, khoảng 2 phút</span>
          </div>
        </div>

        <div className="qc__thread" ref={inAnna ? undefined : thread} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`qc__msg qc__msg--${m.from}`}>
              {m.from === 'bot' && <span className="qc__bot" aria-hidden="true"><Bot /></span>}
              <p>{m.text}</p>
            </div>
          ))}
          {typing && <div className="qc__msg qc__msg--bot"><span className="qc__bot" aria-hidden="true"><Bot /></span><p className="qc__typing"><i /><i /><i /></p></div>}
        </div>

        {!finished && step && !typing && (
          <div className="qc__input">
            {step.hint && <p className="qc__hint">{step.hint}</p>}

            {(step.kind === 'single' || step.kind === 'multi') && (
              <div className="qc__chips">
                {(step.options ?? []).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`qc__chip${step.kind === 'multi' && picked.includes(opt) ? ' is-on' : ''}${opt === ADVICE ? ' qc__chip--advice' : ''}`}
                    onClick={() => choose(opt)}
                    aria-pressed={step.kind === 'multi' ? picked.includes(opt) : undefined}
                  >
                    {opt}
                  </button>
                ))}
                {step.kind === 'multi' && (
                  <button type="button" className="qc__chip qc__chip--go" onClick={confirmMulti}>Xong <Check aria-hidden="true" /></button>
                )}
              </div>
            )}

            {(step.kind !== 'single' && step.kind !== 'multi') && (
              <form className="qc__row" onSubmit={sendText}>
                {step.kind === 'long' ? (
                  <textarea rows={2} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Bạn trả lời ở đây…" maxLength={2000} aria-label={step.bot} />
                ) : (
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Bạn trả lời ở đây…"
                    maxLength={step.kind === 'phone' ? 25 : 200}
                    type={step.kind === 'phone' ? 'tel' : step.kind === 'email' ? 'email' : 'text'}
                    inputMode={step.kind === 'phone' ? 'tel' : undefined}
                    autoComplete={step.kind === 'phone' ? 'tel' : step.kind === 'email' ? 'email' : undefined}
                    aria-label={step.bot}
                  />
                )}
                <button type="submit" className="qc__send" aria-label="Gửi câu trả lời"><Send aria-hidden="true" /></button>
              </form>
            )}

            <div className="qc__extra">
              {step.allowAdvice && step.kind !== 'single' && step.kind !== 'multi' && (
                <button type="button" className="qc__chip qc__chip--advice" onClick={() => answer(ADVICE, ADVICE)}>{ADVICE}</button>
              )}
              {!step.required && (step.kind === 'text' || step.kind === 'long' || step.kind === 'email' || step.kind === 'phone') && (
                <button type="button" className="qc__chip" onClick={() => answer('', 'Bỏ qua')}>Bỏ qua</button>
              )}
            </div>

            {error && <p className="qc__error" role="alert">{error}</p>}
          </div>
        )}

        {finished && (
          <div className="qc__finish">
            <p>Mình đã có đủ thông tin. Bạn kiểm tra lại rồi xác nhận để DANAVA nhận phiếu nhé.</p>
            <pre className="qc__brief">{brief}</pre>
            {error && <p className="qc__error" role="alert">{error}</p>}
            <button type="button" className="qc__btn" onClick={lock(submit)} disabled={status === 'sending'}>
              {status === 'sending' ? 'Đang gửi…' : <>Xác nhận và gửi báo giá <Send aria-hidden="true" /></>}
            </button>
          </div>
        )}
      </section>
      )}

      <aside className="qc__side" aria-label="Tiến độ và báo giá">
        <p className="qc__side-label">Báo giá tham khảo</p>
        <p className="qc__range">{price ? rangeText(price) : 'Trả lời để xem khoảng giá'}</p>
        <p className="qc__note">Khoảng giá tham khảo theo lựa chọn hiện tại. Báo giá chính thức sau khi chuyên viên xác nhận phạm vi.</p>

        <ol className="qc__progress" aria-label="Tiến độ">
          {cfg.sections.map((name, i) => (
            <li key={name} className={i < currentSection || finished ? 'is-done' : i === currentSection ? 'is-on' : undefined}>
              <span>{i < currentSection || finished ? <Check aria-hidden="true" /> : i + 1}</span>{name}
            </li>
          ))}
        </ol>
        {inAnna && (
          <>
            <p className="qc__progress-note">{progress}</p>
            <button type="button" className="qc__btn qc__open" onClick={openDesign}><MessageCircle aria-hidden="true" />{finished ? 'Xác nhận trong ANNA' : answered ? 'Tiếp tục với ANNA' : 'Trả lời cùng ANNA'}</button>
          </>
        )}
      </aside>
    </div>
  );
}
