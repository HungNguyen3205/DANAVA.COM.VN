'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ANNA_LIMITS, type AnnaErrorCode, type AnnaEvent } from '@/lib/anna-shared';

// 'pending' chứ không phải 'busy': 'busy' là mã lỗi quá tải của máy chủ
export type Turn = { id: string; q: string; a: string; state: 'pending' | 'done' | 'stopped' | AnnaErrorCode; sig?: string };
export type Readiness = 'checking' | 'ready' | 'off';

const STORE = 'danava-anna-chat';
const KEEP = 20;

export function useAnnaChat(open: boolean) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [readiness, setReadiness] = useState<Readiness>('checking');
  const [loaded, setLoaded] = useState(false);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const running = useRef<AbortController | null>(null);

  // Hội thoại chỉ giữ trong tab hiện tại của khách
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(STORE) || '[]');
      if (Array.isArray(saved)) {
        setTurns((saved as Turn[])
          .filter(t => t && typeof t.q === 'string' && typeof t.a === 'string')
          .slice(-KEEP)
          .map(t => (t.state === 'pending' ? { ...t, state: 'stopped' } : t)));
      }
    } catch {}
    setLoaded(true);
    return () => running.current?.abort();
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { sessionStorage.setItem(STORE, JSON.stringify(turns.slice(-KEEP))); } catch {}
  }, [turns, loaded]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetch('/api/anna/', { cache: 'no-store' })
      .then(r => r.json())
      .then(v => { if (alive) setReadiness(v.ready ? 'ready' : 'off'); })
      .catch(() => { if (alive) setReadiness('off'); });
    return () => { alive = false; };
  }, [open]);

  const send = useCallback(async (text: string) => {
    const q = text.trim().slice(0, ANNA_LIMITS.message);
    if (!q || running.current) return;
    const controller = new AbortController();
    running.current = controller;
    const id = `${Date.now()}`;
    const history = turnsRef.current
      .filter(t => t.state === 'done' && t.sig)
      .slice(-ANNA_LIMITS.turns)
      .map(t => ({ q: t.q, a: t.a, sig: t.sig }));
    const update = (change: (t: Turn) => Turn) => setTurns(list => list.map(t => (t.id === id ? change(t) : t)));
    setTurns(list => [...list, { id, q, a: '', state: 'pending' }]);

    let finished = false;
    try {
      const res = await fetch('/api/anna/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history }), signal: controller.signal
      });
      if (!res.ok || !res.body) {
        const code: AnnaErrorCode = (await res.json().catch(() => ({}))).code || 'failed';
        if (code === 'unavailable') setReadiness('off');
        update(t => ({ ...t, state: code }));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line) continue;
          const event: AnnaEvent = JSON.parse(line);
          if (event.type === 'delta') update(t => ({ ...t, a: t.a + event.text }));
          else if (event.type === 'replace') update(t => ({ ...t, a: event.text }));
          else if (event.type === 'done') { finished = true; update(t => ({ ...t, state: 'done', sig: event.sig })); }
          else { finished = true; update(t => ({ ...t, state: event.code })); }
        }
      }
      if (!finished) update(t => ({ ...t, state: 'failed' }));
    } catch {
      if (!finished) update(t => ({ ...t, state: controller.signal.aborted ? 'stopped' : 'failed' }));
    } finally {
      if (running.current === controller) running.current = null;
    }
  }, []);

  const stop = useCallback(() => running.current?.abort(), []);
  const reset = useCallback(() => {
    running.current?.abort();
    running.current = null;
    setTurns([]);
  }, []);

  return { turns, readiness, loaded, busy: turns.some(t => t.state === 'pending'), send, stop, reset };
}
