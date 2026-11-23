'use client';
/*
 * Phiếu thiết kế landing page dạng hội thoại (chatbot): bot hỏi từng câu, khách chọn nút hoặc gõ.
 * Bảng bên phải cập nhật tiến độ và báo giá tham khảo. Gửi qua /api/lead kèm bản tóm tắt phiếu.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Check, Send } from 'lucide-react';
import { ADVICE, SCALE_TO_TIER, SECTIONS, STEPS, buildBrief, type Answers, type Step } from '@/lib/landing-brief';
import { ADDONS, estimate, rangeText } from '@/lib/web-quote';
import { isValidPhoneNumber } from '@/lib/contact-services';

type Msg = { from: 'bot' | 'user'; text: string };

const TYPING_MS = 450;

export function QuoteChat() {
  const [messages, setMessages] = useState<Msg[]>([{ from: 'bot', text: STEPS[0].bot }]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const thread = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const finished = index >= STEPS.length;
  const step: Step | undefined = STEPS[index];

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  /** Trả lời câu hiện tại, rồi hỏi câu tiếp theo sau một nhịp ngắn */
  const answer = (value: string | string[], shown: string) => {
    if (!step || typing) return;
    const next = { ...answers, [step.id]: value };
    setAnswers(next);
    setError('');
    setDraft('');
    setPicked([]);
    setMessages(m => [...m, { from: 'user', text: shown }]);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setTyping(true);
    setTimeout(() => {
      if (nextIndex < STEPS.length) setMessages(m => [...m, { from: 'bot', text: STEPS[nextIndex].bot }]);
      setTyping(false);
    }, TYPING_MS);
  };

  /** Kiểm tra và gửi câu trả lời dạng chữ */
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

  const addonIds = (Array.isArray(answers.addons) ? answers.addons : []).map(label => ADDONS.find(a => a.label === label)?.id).filter((x): x is string => !!x);
  const tierId = SCALE_TO_TIER[typeof answers.scale === 'string' ? answers.scale : ''] ?? 'l-standard';
  // Chỉ báo giá khi khách đã chọn quy mô nội dung
  const price = answers.scale ? estimate('landing', tierId, addonIds, 'normal') : null;

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
          businessType: String(answers.industry ?? '').trim(),
          service: 'Landing page',
          message: buildBrief(answers) + (price ? `\n\nBáo giá tham khảo: ${rangeText(price)}` : ''),
          source: 'phieu-landing'
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

  const currentSection = step ? step.section : SECTIONS.length - 1;

  if (status === 'done') {
    return (
      <div className="qc-done" role="status">
        <span className="qc-done__ico" aria-hidden="true"><Check /></span>
        <h2>Cảm ơn bạn! Phiếu đã được gửi.</h2>
        <p>Chuyên viên DANAVA sẽ đọc phiếu và liên hệ để xác nhận phạm vi, bố cục và báo giá chính thức.</p>
      </div>
    );
  }

  return (
    <div className="qc">
      <section className="qc__chat" aria-label="Trò chuyện về landing page">
        <div className="qc__head">
          <span className="qc__avatar" aria-hidden="true"><Bot /></span>
          <div>
            <strong>Trợ lý DANAVA</strong>
            <span>Phiếu thiết kế landing page · khoảng 5 phút</span>
          </div>
        </div>

        <div className="qc__thread" ref={thread} aria-live="polite">
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
            <p>Mình đã có đủ thông tin. Bạn kiểm tra lại rồi gửi phiếu cho DANAVA nhé.</p>
            <pre className="qc__brief">{buildBrief(answers)}</pre>
            {error && <p className="qc__error" role="alert">{error}</p>}
            <button type="button" className="qc__btn" onClick={submit} disabled={status === 'sending'}>
              {status === 'sending' ? 'Đang gửi…' : <>Xác nhận và gửi báo giá <Send aria-hidden="true" /></>}
            </button>
          </div>
        )}
      </section>

      <aside className="qc__side" aria-label="Tiến độ và báo giá">
        <p className="qc__side-label">Báo giá tham khảo</p>
        <p className="qc__range">{price ? rangeText(price) : 'Trả lời mục quy mô để xem giá'}</p>
        <p className="qc__note">Khoảng giá tham khảo theo lựa chọn hiện tại. Báo giá chính thức sau khi chuyên viên xác nhận phạm vi.</p>

        <ol className="qc__progress" aria-label="Tiến độ">
          {SECTIONS.map((name, i) => (
            <li key={name} className={i < currentSection || finished ? 'is-done' : i === currentSection ? 'is-on' : undefined}>
              <span>{i < currentSection || finished ? <Check aria-hidden="true" /> : i + 1}</span>{name}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
