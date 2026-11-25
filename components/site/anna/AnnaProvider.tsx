'use client';
/** Một trải nghiệm ANNA duy nhất cho cả website: khối trang chủ, nút nổi, menu và bảng "Tư vấn" đều gọi vào đây. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSite } from '../../SiteStore';
import { block } from '@/lib/blocks';
import { AnnaPanel } from './AnnaPanel';

export type AnnaTab = 'chat' | 'quote' | 'design';

type AnnaApi = {
  enabled: boolean;
  open: boolean;
  /** Mở hội thoại; có câu hỏi thì gửi luôn. */
  ask: (question?: string) => void;
  quote: () => void;
  /** Trang thiết kế phòng tập đăng ký thẻ "Chỉnh phòng tập" (nội dung render qua portal vào `slot`) */
  setDesign: (on: boolean) => void;
  design: boolean;
  slot: HTMLElement | null;
  openDesign: () => void;
};

const Context = createContext<AnnaApi>({ enabled: false, open: false, ask: () => {}, quote: () => {}, setDesign: () => {}, design: false, slot: null, openDesign: () => {} });
export const useAnna = () => useContext(Context);

export function AnnaProvider({ children }: { children: ReactNode }) {
  const { data } = useSite();
  const enabled = block(data, 'anna').enabled;
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<AnnaTab>('chat');
  const [question, setQuestion] = useState<{ text: string; id: number } | null>(null);
  const [design, setDesign] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  const show = useCallback((next: AnnaTab) => {
    setModal(window.matchMedia('(max-width: 860px)').matches);
    setTab(next);
    setOpen(true);
  }, []);
  const ask = useCallback((text?: string) => {
    // Trên trang thiết kế phòng tập: mở thẳng thẻ "Chỉnh phòng tập" (trừ khi gửi kèm câu hỏi chung)
    show(design && !text?.trim() ? 'design' : 'chat');
    const q = text?.trim();
    if (q) setQuestion({ text: q, id: Date.now() });
  }, [show, design]);
  const openDesign = useCallback(() => show('design'), [show]);
  const quote = useCallback(() => show('quote'), [show]);
  const close = useCallback(() => setOpen(false), []);
  const taken = useCallback(() => setQuestion(null), []);
  useEffect(() => { if (!design && tab === 'design') setTab('chat'); }, [design, tab]);
  const api = useMemo(() => ({ enabled, open, ask, quote, setDesign, design, slot, openDesign }), [enabled, open, ask, quote, design, slot, openDesign]);

  return (
    <Context.Provider value={api}>
      {children}
      {enabled && <AnnaPanel open={open} modal={modal} tab={tab} setTab={setTab} question={question} onQuestionTaken={taken} onClose={close} design={design} setSlot={setSlot} />}
    </Context.Provider>
  );
}
