/*
 * Giao thức POST /api/anna/: { message, history: [{ q, a, sig }] }.
 * Mỗi câu trả lời được máy chủ ký; lịch sử không có chữ ký hợp lệ bị bỏ
 * để không ai chèn được "lời ANNA đã hứa" giả vào hội thoại.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { ANNA_LIMITS } from './anna-shared.ts';

export type SignedTurn = { q: string; a: string; sig: string };

export function parseChat(value: unknown): { message: string; history: SignedTurn[] } | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as { message?: unknown; history?: unknown };
  if (typeof body.message !== 'string') return null;
  const message = body.message.trim();
  if (!message || message.length > ANNA_LIMITS.message) return null;
  const history = body.history ?? [];
  if (!Array.isArray(history) || history.length > ANNA_LIMITS.turns) return null;
  for (const turn of history) {
    if (!turn || typeof turn.q !== 'string' || typeof turn.a !== 'string' || typeof turn.sig !== 'string') return null;
    if (turn.q.length > ANNA_LIMITS.message || turn.a.length > ANNA_LIMITS.answer || turn.sig.length > 128) return null;
  }
  return { message, history: history.map(({ q, a, sig }) => ({ q, a, sig })) };
}

export const signingKey = (apiKey: string) => createHash('sha256').update(`danava-anna-v1:${apiKey}`).digest();

export const signTurn = (key: Buffer, q: string, a: string) => createHmac('sha256', key).update(JSON.stringify([q, a])).digest('hex');

export function trustedHistory(key: Buffer, history: SignedTurn[]): SignedTurn[] {
  return history.filter(({ q, a, sig }) => {
    const expected = Buffer.from(signTurn(key, q, a));
    const given = Buffer.from(sig);
    return expected.length === given.length && timingSafeEqual(expected, given);
  });
}
