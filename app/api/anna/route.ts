import { sameOrigin } from '@/lib/origin';
import { getContent } from '@/lib/database';
import { block } from '@/lib/blocks';
import { parseChat, signingKey } from '@/lib/anna-chat';
import { allowQuestion } from '@/lib/anna-limit';
import { annaApiKey, answer } from '@/lib/anna-server';
import type { AnnaErrorCode } from '@/lib/anna-shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 250_000;
const fail = (status: number, code: AnnaErrorCode) => Response.json({ code }, { status, headers: { 'Cache-Control': 'no-store' } });

/** Trạng thái cho giao diện và trang quản trị — không lộ khóa. */
export async function GET() {
  const ready = !!annaApiKey() && block((await getContent()).data, 'anna').enabled;
  return Response.json({ ready }, { headers: { 'Cache-Control': 'no-store' } });
}

async function readBody(req: Request) {
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return null;
  const reader = req.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BODY) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  try { return parseChat(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { return null; }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, 'failed');
  const apiKey = annaApiKey();
  if (!apiKey) return fail(503, 'unavailable');
  const chat = await readBody(req);
  if (!chat) return fail(400, 'failed');

  try {
    const { data } = await getContent();
    if (!block(data, 'anna').enabled) return fail(503, 'unavailable');
    if (!(await allowQuestion(req, signingKey(apiKey)))) return fail(429, 'limit');

    const aborter = new AbortController();
    const events = answer({ data, apiKey, ...chat, signal: AbortSignal.any([req.signal, aborter.signal]) });
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await events.next();
        if (aborter.signal.aborted) return;
        if (done) controller.close();
        else controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
      },
      cancel() { aborter.abort(); }
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        // no-transform + X-Accel-Buffering: proxy không nén/giữ lại, chữ hiện dần
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('[anna] route failed', (error as Error)?.name);
    return fail(500, 'failed');
  }
}
