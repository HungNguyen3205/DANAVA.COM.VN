'use client';
/** Một trải nghiệm ANNA duy nhất cho cả website: khối trang chủ, nút nổi, menu và bảng "Tư vấn" đều gọi vào đây. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useSite } from '../../SiteStore';
import { block } from '@/lib/blocks';
import { AnnaPanel } from './AnnaPanel';

export type AnnaTab = 'chat' | 'quote';

type AnnaApi = {
  enabled: boolean;
  open: boolean;
  /** Mở hội thoại; có câu hỏi thì gửi luôn. */
  ask: (question?: string) => void;
  quote: () => void;
};

const Context = createContext<AnnaApi>({ enabled: false, open: false, ask: () => {}, quote: () => {} });
export const useAnna = () => useContext(Context);

export function AnnaProvider({ children }: { children: ReactNode }) {
  const { data } = useSite();
  const enabled = block(data, 'anna').enabled;
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<AnnaTab>('chat');
  const [question, setQuestion] = useState<{ text: string; id: number } | null>(null);

  const show = useCallback((next: AnnaTab) => {
    setModal(window.matchMedia('(max-width: 860px)').matches);
    setTab(next);
    setOpen(true);
  }, []);
  const ask = useCallback((text?: string) => {
    show('chat');
    const q = text?.trim();
    if (q) setQuestion({ text: q, id: Date.now() });
  }, [show]);
  const quote = useCallback(() => show('quote'), [show]);
  const close = useCallback(() => setOpen(false), []);
  const taken = useCallback(() => setQuestion(null), []);
  const api = useMemo(() => ({ enabled, open, ask, quote }), [enabled, open, ask, quote]);

  return (
    <Context.Provider value={api}>
      {children}
      {enabled && <AnnaPanel open={open} modal={modal} tab={tab} setTab={setTab} question={question} onQuestionTaken={taken} onClose={close} />}
    </Context.Provider>
  );
}
