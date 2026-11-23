/* Gọi Claude cho ANNA. CHỈ import từ route handler / server component: có khóa API. */
import Anthropic from '@anthropic-ai/sdk';
import type { SiteData } from './content';
import { block } from './blocks';
import { buildKnowledge, buildSystem } from './anna-knowledge';
import { allowedFacts, CheckedStream } from './anna-guard';
import { signTurn, signingKey, trustedHistory, type SignedTurn } from './anna-chat';
import { ANNA_LIMITS, type AnnaErrorCode, type AnnaEvent } from './anna-shared';

const DEFAULT_MODEL = 'claude-opus-5-5';
/** Gồm cả phần suy nghĩ. Chủ động đặt thấp để chặn chi phí: câu trả lời của ANNA ngắn. */
const MAX_TOKENS = 4000;
const TOTAL_TIMEOUT_MS = 60_000;

const BLOCKED = 'Mình chưa xác minh được một thông tin trong câu trả lời (ví dụ mức giá hoặc ưu đãi) nên không hiển thị để tránh sai lệch. Bạn xem mục **Báo giá nhanh** hoặc [gửi yêu cầu](/lien-he/) để nhân viên DANAVA xác nhận giúp bạn nhé.';
const REFUSED = 'Mình không hỗ trợ được yêu cầu này. Nếu bạn cần tư vấn về giải pháp của DANAVA, hãy mô tả nhu cầu hoặc [liên hệ đội ngũ DANAVA](/lien-he/).';
const CUT = '\n\nCâu trả lời đã bị cắt do quá dài. Bạn hãy hỏi hẹp hơn hoặc [liên hệ DANAVA](/lien-he/).';

export const annaApiKey = () => process.env.GEMINI_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim() || '';

let cached: { key: string; client: Anthropic } | undefined;
function clientFor(apiKey: string) {
  if (cached?.key !== apiKey) {
    // authToken: null → không vô tình dùng thông tin đăng nhập khác có trên máy chủ
    cached = { key: apiKey, client: new Anthropic({ apiKey, authToken: null, timeout: 30_000, maxRetries: 1, logLevel: 'off' }) };
  }
  return cached.client;
}

function errorCode(error: unknown): AnnaErrorCode {
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError || error instanceof Anthropic.NotFoundError) return 'unavailable';
  if (error instanceof Anthropic.RateLimitError) return 'busy';
  if (error instanceof Anthropic.APIConnectionError) return 'failed';
  if (error instanceof Anthropic.APIError) return error.status && error.status >= 500 ? 'busy' : 'failed';
  return 'failed';
}

type Input = { data: SiteData; apiKey: string; message: string; history: SignedTurn[]; signal: AbortSignal };


/* ===== Nhánh Gemini (khi có GEMINI_API_KEY): gọi REST bằng fetch, không thêm thư viện ===== */
const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash';

async function* answerGemini({ data, apiKey, message, history, signal }: Input): AsyncGenerator<AnnaEvent> {
  const key = signingKey(apiKey);
  const knowledge = buildKnowledge(data);
  const pricing = block(data, 'pricing');
  const checked = new CheckedStream(allowedFacts(knowledge, pricing.enabled ? pricing : null));
  const timeout = AbortSignal.timeout(TOTAL_TIMEOUT_MS);
  const model = process.env.DANAVA_GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL;

  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const turn of trustedHistory(key, history)) {
    contents.push({ role: 'user', parts: [{ text: turn.q }] }, { role: 'model', parts: [{ text: turn.a }] });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystem(data, knowledge) }] },
        contents,
        generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.4 }
      }),
      signal: AbortSignal.any([signal, timeout])
    });
  } catch (error) {
    if (signal.aborted) return;
    console.error('[anna] gemini request failed', timeout.aborted ? 'timeout' : (error as Error)?.name);
    yield { type: 'error', code: 'failed' };
    return;
  }

  if (!res.ok || !res.body) {
    // Không ghi khóa hay nội dung hội thoại vào log
    console.error('[anna] gemini http', res.status);
    const code: AnnaErrorCode = res.status === 401 || res.status === 403 ? 'unavailable' : res.status === 429 || res.status >= 500 ? 'busy' : 'failed';
    yield { type: 'error', code };
    return;
  }

  let finish: string | undefined;
  let buffer = '';
  const decoder = new TextDecoder();
  try {
    const reader = res.body.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        const chunk = JSON.parse(line.slice(5)) as { candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[] };
        const cand = chunk.candidates?.[0];
        const text = (cand?.content?.parts ?? []).map(p => p.text ?? '').join('');
        if (cand?.finishReason) finish = cand.finishReason;
        if (!text) continue;
        const safe = checked.push(text);
        if (safe === null) {
          await reader.cancel();
          console.warn('[anna] blocked an answer with an unverified number');
          yield { type: 'replace', text: BLOCKED };
          yield { type: 'done' };
          return;
        }
        if (safe) yield { type: 'delta', text: safe };
      }
    }
  } catch (error) {
    if (signal.aborted) return;
    console.error('[anna] gemini stream failed', timeout.aborted ? 'timeout' : (error as Error)?.name);
    yield { type: 'error', code: 'failed' };
    return;
  }

  if (finish === 'SAFETY' || finish === 'BLOCKLIST' || finish === 'PROHIBITED_CONTENT' || finish === 'SPII') {
    yield { type: 'replace', text: REFUSED };
    yield { type: 'done' };
    return;
  }
  const rest = checked.end();
  if (rest === null) {
    yield { type: 'replace', text: BLOCKED };
    yield { type: 'done' };
    return;
  }
  if (!checked.text.trim()) {
    yield { type: 'error', code: 'failed' };
    return;
  }
  if (rest) yield { type: 'delta', text: rest };
  if (finish === 'MAX_TOKENS') {
    yield { type: 'delta', text: CUT };
    yield { type: 'done' };
    return;
  }
  yield { type: 'done', sig: checked.text.length <= ANNA_LIMITS.answer ? signTurn(key, message, checked.text) : undefined };
}

export async function* answer(input: Input): AsyncGenerator<AnnaEvent> {
  // Có GEMINI_API_KEY thì ANNA dùng Gemini; không thì dùng Anthropic như cũ
  if (process.env.GEMINI_API_KEY?.trim()) { yield* answerGemini(input); return; }
  const { data, apiKey, message, history, signal } = input;
  const key = signingKey(apiKey);
  const knowledge = buildKnowledge(data);
  const pricing = block(data, 'pricing');
  const checked = new CheckedStream(allowedFacts(knowledge, pricing.enabled ? pricing : null));
  const timeout = AbortSignal.timeout(TOTAL_TIMEOUT_MS);

  const messages: Anthropic.Beta.BetaMessageParam[] = [];
  for (const turn of trustedHistory(key, history)) messages.push({ role: 'user', content: turn.q }, { role: 'assistant', content: turn.a });
  messages.push({ role: 'user', content: message });

  try {
    const stream = clientFor(apiKey).beta.messages.stream({
      model: process.env.DANAVA_AI_MODEL?.trim() || DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: 'low' },
      // Bộ phân loại an toàn từ chối nhầm → API tự thử lại bằng model dự phòng do Anthropic chọn
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: buildSystem(data, knowledge), cache_control: { type: 'ephemeral' } }],
      messages
    }, { signal: AbortSignal.any([signal, timeout]) });

    for await (const event of stream) {
      if (event.type !== 'content_block_delta' || event.delta.type !== 'text_delta') continue;
      const safe = checked.push(event.delta.text);
      if (safe === null) {
        stream.abort();
        console.warn('[anna] blocked an answer with an unverified number');
        yield { type: 'replace', text: BLOCKED };
        yield { type: 'done' };
        return;
      }
      if (safe) yield { type: 'delta', text: safe };
    }

    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      yield { type: 'replace', text: REFUSED };
      yield { type: 'done' };
      return;
    }
    const rest = checked.end();
    if (rest === null) {
      console.warn('[anna] blocked an answer with an unverified number');
      yield { type: 'replace', text: BLOCKED };
      yield { type: 'done' };
      return;
    }
    if (!checked.text.trim()) {
      yield { type: 'error', code: 'failed' };
      return;
    }
    if (rest) yield { type: 'delta', text: rest };
    if (final.stop_reason !== 'end_turn' && final.stop_reason !== 'stop_sequence') {
      yield { type: 'delta', text: CUT };
      yield { type: 'done' };
      return;
    }
    yield { type: 'done', sig: checked.text.length <= ANNA_LIMITS.answer ? signTurn(key, message, checked.text) : undefined };
  } catch (error) {
    if (signal.aborted) return; // khách bấm dừng / đóng tab
    const api = error instanceof Anthropic.APIError ? error : null;
    // Không ghi khóa hay nội dung hội thoại vào log
    console.error('[anna] request failed', timeout.aborted ? 'timeout' : (api?.status ?? (error as Error)?.name), api?.requestID ?? '');
    yield { type: 'error', code: errorCode(error) };
  }
}
