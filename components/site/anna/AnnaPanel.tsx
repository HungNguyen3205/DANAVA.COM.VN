'use client';
/**
 * Hội thoại ANNA. Máy tính: bảng nổi bên phải (trang vẫn dùng được). Điện thoại: toàn màn hình, khóa nền.
 * Không có câu trả lời soạn sẵn giả làm AI: chưa kết nối hoặc lỗi thì nói rõ và đưa kênh liên hệ.
 */
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Calculator, Dumbbell, MessageCircle, Phone, RotateCcw, Send, Square, X } from 'lucide-react';
import { MayFigure } from './MayFigure';
import { useSite } from '../../SiteStore';
import { block } from '@/lib/blocks';
import { contactChannels } from '@/lib/contact-channels';
import { ANNA_LIMITS, type AnnaErrorCode } from '@/lib/anna-shared';
import { BrandIcon } from '../BrandIcons';
import { useDialog } from '../useDialog';
import { AnswerText } from './AnswerText';
import { QuickQuote } from './QuickQuote';
import { useAnnaChat } from './useAnnaChat';
import type { AnnaTab } from './AnnaProvider';
import { cmsText, ct } from '../cms';
import { txt } from '@/lib/site-text';
import type { SiteData } from '@/lib/content';

/** Chữ cố định của bảng ANNA (khóa anna.ui.*, dùng chung toàn website) → <span> sửa / dịch được. */
function U({ data, k, def, label, inline }: { data: SiteData; k: string; def: string; label: string; inline?: boolean }) {
  const x = ct(data, `anna.ui.${k}`, def, label, { scope: 'global' });
  return <span style={inline ? { display: 'inline' } : undefined} {...x.a}>{x.v}</span>;
}

const ERRORS: Record<AnnaErrorCode, string> = {
  unavailable: 'Trợ lý AI chưa sẵn sàng.',
  busy: 'ANNA đang quá tải. Bạn thử lại sau ít phút hoặc nhắn trực tiếp cho DANAVA.',
  limit: 'Đã đạt giới hạn lượt hỏi. Bạn thử lại sau hoặc nhắn trực tiếp cho DANAVA.',
  failed: 'Kết nối với ANNA bị gián đoạn nên chưa có câu trả lời đầy đủ. Bạn thử lại hoặc nhắn trực tiếp cho DANAVA.'
};

function Channels() {
  const { data } = useSite();
  const { zalo, messenger, tel } = contactChannels(data);
  return (
    <ul className="an-channels">
      {zalo && <li><a href={zalo} target="_blank" rel="noopener noreferrer"><BrandIcon name="zalo" />Zalo</a></li>}
      {messenger && <li><a href={messenger} target="_blank" rel="noopener noreferrer"><BrandIcon name="messenger" />Messenger</a></li>}
      {tel && <li><a href={tel}><Phone aria-hidden="true" /><U data={data} k="channels.hotline" def="Hotline" label="Kênh liên hệ (ANNA)" inline /></a></li>}
      <li><Link href="/lien-he/"><Send aria-hidden="true" /><U data={data} k="channels.form" def="Gửi yêu cầu" label="Kênh liên hệ (ANNA)" inline /></Link></li>
    </ul>
  );
}

type Props = {
  open: boolean;
  modal: boolean;
  tab: AnnaTab;
  setTab: (tab: AnnaTab) => void;
  question: { text: string; id: number } | null;
  onQuestionTaken: () => void;
  onClose: () => void;
  /** có thẻ "Chỉnh phòng tập" (chỉ trên trang thiết kế phòng tập) */
  design?: boolean;
  setSlot?: (el: HTMLElement | null) => void;
};

export function AnnaPanel({ open, modal, tab, setTab, question, onQuestionTaken, onClose, design, setSlot }: Props) {
  const { data } = useSite();
  const config = block(data, 'anna');
  const ref = useDialog(open, onClose, modal);
  const { turns, readiness, loaded, busy, send, stop, reset } = useAnnaChat(open);
  const [text, setText] = useState('');
  const log = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const ready = readiness === 'ready';

  // Câu hỏi từ khối trang chủ / gợi ý: gửi khi đã sẵn sàng; không thì giữ lại trong ô nhập, không giả vờ trả lời
  useEffect(() => {
    if (!question || !loaded || readiness === 'checking') return;
    if (ready && !busy) {
      stick.current = true;
      void send(question.text);
    } else {
      setText(question.text);
    }
    onQuestionTaken();
  }, [question, loaded, readiness, ready, busy, send, onQuestionTaken]);

  useEffect(() => {
    const el = log.current;
    if (open && el && stick.current) el.scrollTop = el.scrollHeight;
  }, [turns, open, tab]);

  // Bàn phím ảo iOS không thu nhỏ viewport → bám theo visualViewport để ô nhập không bị che
  useEffect(() => {
    const dialog = ref.current;
    const view = window.visualViewport;
    if (!open || !modal || !dialog || !view) return;
    const fit = () => {
      dialog.style.setProperty('--an-h', `${view.height}px`);
      dialog.style.setProperty('--an-top', `${view.offsetTop}px`);
    };
    fit();
    view.addEventListener('resize', fit);
    view.addEventListener('scroll', fit);
    return () => {
      view.removeEventListener('resize', fit);
      view.removeEventListener('scroll', fit);
      dialog.style.removeProperty('--an-h');
      dialog.style.removeProperty('--an-top');
    };
  }, [open, modal, ref]);

  // Đổi qua lại giữa bố cục điện thoại và máy tính → đóng (kiểu modal khác nhau)
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia('(max-width: 860px)');
    query.addEventListener('change', onClose);
    return () => query.removeEventListener('change', onClose);
  }, [open, onClose]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!ready || busy || !text.trim()) return;
    stick.current = true;
    void send(text);
    setText('');
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: đang gõ dở tiếng Việt bằng bộ gõ
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  };
  const last = turns[turns.length - 1];

  return (
    <dialog ref={ref} id="s-anna" className={`an${modal ? ' an--modal' : ''}`} aria-labelledby="an-title"
      onClick={event => { if (modal && (event.target as HTMLElement).closest('a')) onClose(); }}>
      <header className="an-head">
        <span className="an-avatar" aria-hidden="true"><MayFigure /></span>
        <div className="an-head__name">
          <h2 id="an-title">ANNA</h2>
          <p><U data={data} k="head.sub" def="Trợ lý AI của DANAVA" label="Dòng phụ tiêu đề ANNA" /></p>
        </div>
        {turns.length > 0 && (
          <button type="button" className="an-icon" onClick={reset} aria-label={txt(data, 'anna.ui.head.reset-aria', 'Bắt đầu hội thoại mới')} title={txt(data, 'anna.ui.head.reset', 'Hội thoại mới')}><RotateCcw aria-hidden="true" /></button>
        )}
        <button type="button" className="an-icon" onClick={onClose} aria-label={txt(data, 'anna.ui.head.close-aria', 'Đóng ANNA')} data-autofocus={modal ? '' : undefined}><X aria-hidden="true" /></button>
      </header>

      <div className={`an-tabs${design ? ' an-tabs--3' : ''}`} role="group" aria-label={txt(data, 'anna.ui.tabs.aria', 'Chọn cách tư vấn')}>
        {design && <button type="button" aria-pressed={tab === 'design'} onClick={() => setTab('design')}><Dumbbell aria-hidden="true" />Chỉnh phòng</button>}
        <button type="button" aria-pressed={tab === 'chat'} onClick={() => setTab('chat')}><MessageCircle aria-hidden="true" /><U data={data} k="tabs.chat" def="Trò chuyện" label="Thẻ ANNA" inline /></button>
        <button type="button" aria-pressed={tab === 'quote'} onClick={() => setTab('quote')}><Calculator aria-hidden="true" /><U data={data} k="tabs.quote" def="Báo giá nhanh" label="Thẻ ANNA" inline /></button>
      </div>

      <div className="an-chat" hidden={tab !== 'chat'}>
        <div ref={log} className="an-log" role="log" aria-label={txt(data, 'anna.ui.log-aria', 'Hội thoại với ANNA')} aria-busy={busy} tabIndex={0}
          onScroll={event => { const el = event.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60; }}>
          <div className="an-msg an-msg--bot" {...cmsText('block.anna.greeting', 'Lời chào của ANNA', { multiline: true, scope: 'global' })}><AnswerText text={config.greeting} /></div>

          {readiness === 'off' && (
            <div className="an-notice an-notice--off" role="status">
              <p><b><U data={data} k="off.title" def="Trợ lý AI chưa sẵn sàng." label="Thông báo ANNA chưa sẵn sàng" inline /></b> <span {...cmsText('block.anna.unavailable', 'Câu báo khi ANNA chưa sẵn sàng', { multiline: true, scope: 'global' })}>{config.unavailable}</span></p>
              <button type="button" className="an-link" onClick={() => setTab('quote')}><Calculator aria-hidden="true" /><U data={data} k="off.quote" def="Mở báo giá nhanh" label="Nút mở báo giá (ANNA)" inline /></button>
              <Channels />
            </div>
          )}

          {ready && turns.length === 0 && !question && (
            <ul className="an-suggest" aria-label={txt(data, 'anna.ui.suggest-aria', 'Câu hỏi gợi ý')}>
              {config.suggestions.map((s, at) => ({ s, at })).filter(x => x.s.trim()).map(({ s, at }) => (
                <li key={at}><button type="button" onClick={() => { void send(s); }}><span {...cmsText(`block.anna.suggestions.${at}`, `Câu hỏi gợi ý ${at + 1}`, { scope: 'global' })}>{s}</span></button></li>
              ))}
            </ul>
          )}

          {turns.map((turn, i) => (
            <div key={turn.id} className="an-turn">
              <p className="an-msg an-msg--me"><span className="s-sr">{txt(data, 'anna.ui.you', 'Bạn:')} </span>{turn.q}</p>
              {turn.a && <div className="an-msg an-msg--bot"><span className="s-sr">ANNA: </span><AnswerText text={turn.a} /></div>}
              {turn.state === 'pending' && <p className="an-typing" role="status"><i /><i /><i /><U data={data} k="typing" def="ANNA đang trả lời…" label="Trạng thái ANNA đang trả lời" inline /></p>}
              {turn.state === 'stopped' && <p className="an-state"><U data={data} k="stopped" def="Đã dừng trả lời." label="Trạng thái ANNA đã dừng" /></p>}
              {turn.state !== 'pending' && turn.state !== 'done' && turn.state !== 'stopped' && (
                <div className="an-notice" role="alert">
                  <p>{(() => { const code = ERRORS[turn.state] ? turn.state : 'failed'; return <U data={data} k={`errors.${code}`} def={ERRORS[code]} label="Thông báo lỗi ANNA" />; })()}</p>
                  {ready && !busy && i === turns.length - 1 && (
                    <button type="button" className="an-link" onClick={() => { void send(turn.q); }}><RotateCcw aria-hidden="true" /><U data={data} k="retry" def="Thử lại" label="Nút thử lại (ANNA)" inline /></button>
                  )}
                  <Channels />
                </div>
              )}
            </div>
          ))}

          {ready && last?.state === 'done' && (
            <div className="an-human">
              <p><U data={data} k="human" def="Cần người thật tư vấn hoặc xác nhận báo giá?" label="Câu mời gặp nhân viên (ANNA)" /></p>
              <Channels />
            </div>
          )}
        </div>

        <form className="an-form" onSubmit={submit}>
          <label className="s-sr" htmlFor="an-input">{txt(data, 'anna.ui.input-label', 'Nhu cầu của bạn')}</label>
          <textarea id="an-input" rows={1} value={text} maxLength={ANNA_LIMITS.message} placeholder={config.placeholder} onChange={e => setText(e.target.value)} onKeyDown={onKeyDown} data-autofocus={modal ? undefined : ''} />
          {busy
            ? <button type="button" className="an-send" onClick={stop} aria-label={txt(data, 'anna.ui.stop-aria', 'Dừng trả lời')}><Square aria-hidden="true" /></button>
            : <button type="submit" className="an-send" disabled={!ready || !text.trim()} aria-label={txt(data, 'anna.ui.send-aria', 'Gửi')}><ArrowUp aria-hidden="true" /></button>}
        </form>
        <p className="an-legal"><U data={data} k="legal" def="ANNA dùng AI của Anthropic nên có thể sai. Câu hỏi được gửi tới dịch vụ này để trả lời; đừng nhập thông tin nhạy cảm." label="Lưu ý dùng AI (ANNA)" inline /> <Link href="/chinh-sach-rieng-tu/"><U data={data} k="privacy" def="Quyền riêng tư" label="Liên kết quyền riêng tư (ANNA)" inline /></Link></p>
      </div>

      {design && <div className="an-design" hidden={tab !== 'design'} ref={setSlot} />}

      <div className="an-quote" hidden={tab !== 'quote'}>
        <QuickQuote />
        <p className="an-quote__help"><U data={data} k="quote.help" def="Kết nối nhân viên DANAVA" label="Câu mời gặp nhân viên (báo giá)" /></p>
        <Channels />
      </div>
    </dialog>
  );
}
