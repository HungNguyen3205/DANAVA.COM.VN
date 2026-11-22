'use client';
/**
 * Hội thoại ANNA. Máy tính: bảng nổi bên phải (trang vẫn dùng được). Điện thoại: toàn màn hình, khóa nền.
 * Không có câu trả lời soạn sẵn giả làm AI: chưa kết nối hoặc lỗi thì nói rõ và đưa kênh liên hệ.
 */
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Calculator, MessageCircle, Phone, RotateCcw, Sparkles, Square, X } from 'lucide-react';
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
      {tel && <li><a href={tel}><Phone aria-hidden="true" />Hotline</a></li>}
      <li><Link href="/lien-he/">Gửi yêu cầu</Link></li>
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
};

export function AnnaPanel({ open, modal, tab, setTab, question, onQuestionTaken, onClose }: Props) {
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
        <span className="an-avatar" aria-hidden="true"><Sparkles /></span>
        <div className="an-head__name">
          <h2 id="an-title">ANNA</h2>
          <p>Trợ lý AI của DANAVA</p>
        </div>
        {turns.length > 0 && (
          <button type="button" className="an-icon" onClick={reset} aria-label="Bắt đầu hội thoại mới" title="Hội thoại mới"><RotateCcw aria-hidden="true" /></button>
        )}
        <button type="button" className="an-icon" onClick={onClose} aria-label="Đóng ANNA" data-autofocus={modal ? '' : undefined}><X aria-hidden="true" /></button>
      </header>

      <div className="an-tabs" role="group" aria-label="Chọn cách tư vấn">
        <button type="button" aria-pressed={tab === 'chat'} onClick={() => setTab('chat')}><MessageCircle aria-hidden="true" />Trò chuyện</button>
        <button type="button" aria-pressed={tab === 'quote'} onClick={() => setTab('quote')}><Calculator aria-hidden="true" />Báo giá nhanh</button>
      </div>

      <div className="an-chat" hidden={tab !== 'chat'}>
        <div ref={log} className="an-log" role="log" aria-label="Hội thoại với ANNA" aria-busy={busy} tabIndex={0}
          onScroll={event => { const el = event.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60; }}>
          <div className="an-msg an-msg--bot"><AnswerText text={config.greeting} /></div>

          {readiness === 'off' && (
            <div className="an-notice an-notice--off" role="status">
              <p><b>Trợ lý AI chưa sẵn sàng.</b> {config.unavailable}</p>
              <button type="button" className="an-link" onClick={() => setTab('quote')}><Calculator aria-hidden="true" />Mở báo giá nhanh</button>
              <Channels />
            </div>
          )}

          {ready && turns.length === 0 && !question && (
            <ul className="an-suggest" aria-label="Câu hỏi gợi ý">
              {config.suggestions.filter(s => s.trim()).map((s, i) => (
                <li key={i}><button type="button" onClick={() => { void send(s); }}>{s}</button></li>
              ))}
            </ul>
          )}

          {turns.map((turn, i) => (
            <div key={turn.id} className="an-turn">
              <p className="an-msg an-msg--me"><span className="s-sr">Bạn: </span>{turn.q}</p>
              {turn.a && <div className="an-msg an-msg--bot"><span className="s-sr">ANNA: </span><AnswerText text={turn.a} /></div>}
              {turn.state === 'pending' && <p className="an-typing" role="status"><i /><i /><i />ANNA đang trả lời…</p>}
              {turn.state === 'stopped' && <p className="an-state">Đã dừng trả lời.</p>}
              {turn.state !== 'pending' && turn.state !== 'done' && turn.state !== 'stopped' && (
                <div className="an-notice" role="alert">
                  <p>{ERRORS[turn.state] || ERRORS.failed}</p>
                  {ready && !busy && i === turns.length - 1 && (
                    <button type="button" className="an-link" onClick={() => { void send(turn.q); }}><RotateCcw aria-hidden="true" />Thử lại</button>
                  )}
                  <Channels />
                </div>
              )}
            </div>
          ))}

          {ready && last?.state === 'done' && (
            <div className="an-human">
              <p>Cần người thật tư vấn hoặc xác nhận báo giá?</p>
              <Channels />
            </div>
          )}
        </div>

        <form className="an-form" onSubmit={submit}>
          <label className="s-sr" htmlFor="an-input">Nhu cầu của bạn</label>
          <textarea id="an-input" rows={1} value={text} maxLength={ANNA_LIMITS.message} placeholder={config.placeholder} onChange={e => setText(e.target.value)} onKeyDown={onKeyDown} data-autofocus={modal ? undefined : ''} />
          {busy
            ? <button type="button" className="an-send" onClick={stop} aria-label="Dừng trả lời"><Square aria-hidden="true" /></button>
            : <button type="submit" className="an-send" disabled={!ready || !text.trim()} aria-label="Gửi"><ArrowUp aria-hidden="true" /></button>}
        </form>
        <p className="an-legal">ANNA dùng AI của Anthropic nên có thể sai. Câu hỏi được gửi tới dịch vụ này để trả lời; đừng nhập thông tin nhạy cảm. <Link href="/chinh-sach-rieng-tu/">Quyền riêng tư</Link></p>
      </div>

      <div className="an-quote" hidden={tab !== 'quote'}>
        <QuickQuote />
        <p className="an-quote__help">Kết nối nhân viên DANAVA</p>
        <Channels />
      </div>
    </dialog>
  );
}
