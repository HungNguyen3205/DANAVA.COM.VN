'use client';
/** Các lối vào ANNA: khối trang chủ và nút nổi bên phải. */
import { useState, type FormEvent } from 'react';
import { ArrowUp, Calculator, Sparkles } from 'lucide-react';
import { useSite } from '../../SiteStore';
import { block } from '@/lib/blocks';
import { ANNA_LIMITS } from '@/lib/anna-shared';
import { rich } from '../rich';
import { useAnna } from './AnnaProvider';

export function AnnaLauncher() {
  const { enabled, open, ask } = useAnna();
  if (!enabled) return null;
  return (
    <button type="button" className={`an-launch${open ? ' is-hidden' : ''}`} onClick={() => ask()} aria-label="Hỏi ANNA, trợ lý AI của DANAVA" aria-haspopup="dialog" aria-expanded={open} aria-controls="s-anna">
      <Sparkles aria-hidden="true" />
      <b>ANNA</b>
      <span className="an-launch__tip" aria-hidden="true">Trợ lý AI tư vấn</span>
    </button>
  );
}

export function AnnaHome() {
  const { data } = useSite();
  const { enabled, ask, quote } = useAnna();
  const config = block(data, 'anna');
  const [text, setText] = useState('');
  if (!enabled) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(text);
    setText('');
  };

  return (
    <section className="an-home" id="hoi-anna" aria-labelledby="t-anna">
      <div className="s-container">
        <div className="an-home__inner">
          <p className="hb-eyebrow an-home__eyebrow"><Sparkles aria-hidden="true" />ANNA · Trợ lý AI DANAVA</p>
          <h2 className="hb-h2" id="t-anna">{rich(config.title)}</h2>
          <p className="hb-text">{config.lead}</p>
          <form className="an-ask" onSubmit={submit}>
            <label className="s-sr" htmlFor="an-home-input">Mô tả nhu cầu của bạn</label>
            <input id="an-home-input" value={text} maxLength={ANNA_LIMITS.message} placeholder={config.placeholder} autoComplete="off" enterKeyHint="send" onChange={e => setText(e.target.value)} />
            <button type="submit" aria-label="Bắt đầu hội thoại với ANNA"><span>Hỏi ANNA</span><ArrowUp aria-hidden="true" /></button>
          </form>
          <ul className="an-home__chips" aria-label="Câu hỏi gợi ý">
            {config.suggestions.filter(s => s.trim()).map((s, i) => <li key={i}><button type="button" onClick={() => ask(s)}>{s}</button></li>)}
            <li><button type="button" className="is-quote" onClick={quote}><Calculator aria-hidden="true" />Báo giá nhanh</button></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
