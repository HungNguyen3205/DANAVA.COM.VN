'use client';
/** Các lối vào ANNA: khối trang chủ và nút nổi bên phải (bé Mây). */
import { useRef, useState, type FormEvent } from 'react';
import { ArrowUp, Calculator, Sparkles } from 'lucide-react';
import { useSite } from '../../SiteStore';
import { block } from '@/lib/blocks';
import { ANNA_LIMITS } from '@/lib/anna-shared';
import { rich } from '../rich';
import { cmsBlock, cmsText, ct } from '../cms';
import { useAnna } from './AnnaProvider';
import { txt } from '@/lib/site-text';
import { MayFigure } from './MayFigure';
import { MayPerch } from './MayPerch';
import { useMay } from './useMay';

export function AnnaLauncher() {
  const { enabled, open, ask } = useAnna();
  const { data } = useSite();
  const tip = ct(data, 'anna.ui.launcher.tip', 'Trợ lý AI tư vấn', 'Chú thích nút ANNA', { scope: 'global' });
  const button = useRef<HTMLButtonElement>(null);
  useMay(button, enabled);
  if (!enabled) return null;
  return (
    <button ref={button} type="button" className={`an-launch${open ? ' is-hidden' : ''}`} onClick={() => ask()} aria-label={txt(data, 'anna.ui.launcher.aria', 'Hỏi ANNA, trợ lý AI của DANAVA')} aria-haspopup="dialog" aria-expanded={open} aria-controls="s-anna">
      <span className="an-launch__pose" aria-hidden="true"><MayFigure /></span>
      <b>ANNA</b>
      <span className="an-launch__tip" aria-hidden="true" {...tip.a}>{tip.v}</span>
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
    <section className="an-home" id="hoi-anna" aria-labelledby="t-anna" {...cmsBlock('Khối ANNA (chữ gợi ý trong ô nhập, bật/tắt)', 'anna', { panel: 'site', scope: 'global' })}>
      <span className="an-home__clouds" aria-hidden="true"><i /><i /><i /><i /></span>
      <div className="s-container">
        <div className="an-home__inner">
          <MayPerch onPick={() => ask()} />
          {(() => { const e = ct(data, 'anna.eyebrow', 'ANNA · Trợ lý AI DANAVA', 'Nhãn nhỏ', { scope: 'global' }); return <p className="hb-eyebrow an-home__eyebrow"><Sparkles aria-hidden="true" /><span {...e.a}>{e.v}</span></p>; })()}
          <h2 className="hb-h2" id="t-anna" {...cmsText('block.anna.title', 'Tiêu đề khối ANNA', { rich: true, scope: 'global' })}>{rich(config.title)}</h2>
          <p className="hb-text" {...cmsText('block.anna.lead', 'Câu dẫn khối ANNA', { multiline: true, scope: 'global' })}>{config.lead}</p>
          <form className="an-ask" onSubmit={submit}>
            <label className="s-sr" htmlFor="an-home-input">{txt(data, 'anna.ui.home.input-label', 'Mô tả nhu cầu của bạn')}</label>
            <input id="an-home-input" value={text} maxLength={ANNA_LIMITS.message} placeholder={config.placeholder} autoComplete="off" enterKeyHint="send" onChange={e => setText(e.target.value)} />
            <button type="submit" aria-label={txt(data, 'anna.ui.home.submit-aria', 'Bắt đầu hội thoại với ANNA')}>{(() => { const x = ct(data, 'anna.ask', 'Hỏi ANNA', 'Chữ nút gửi', { scope: 'global' }); return <span {...x.a}>{x.v}</span>; })()}<ArrowUp aria-hidden="true" /></button>
          </form>
          <ul className="an-home__chips" aria-label={txt(data, 'anna.ui.suggest-aria', 'Câu hỏi gợi ý')}>
            {config.suggestions.map((s, at) => ({ s, at })).filter(x => x.s.trim()).map(({ s, at }) => <li key={at}><button type="button" onClick={() => ask(s)}><span {...cmsText(`block.anna.suggestions.${at}`, `Câu hỏi gợi ý ${at + 1}`, { scope: 'global' })}>{s}</span></button></li>)}
            <li><button type="button" className="is-quote" onClick={quote}><Calculator aria-hidden="true" />{(() => { const x = ct(data, 'anna.quote', 'Báo giá nhanh', 'Chữ nút báo giá', { scope: 'global' }); return <span {...x.a}>{x.v}</span>; })()}</button></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
