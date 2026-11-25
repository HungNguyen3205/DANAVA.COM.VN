/**
 * ANNA – Trợ lý thiết kế phòng tập (Google Gemini, gọi REST từ máy chủ; khoá API không bao giờ xuống trình duyệt).
 *  - Biến môi trường: GEMINI_API_KEY (bắt buộc để bật), GEMINI_MODEL (mặc định gemini-3.5-flash-lite),
 *    DANAVA_GYM_AI_DAILY (giới hạn lượt / ngày toàn trang, mặc định 300).
 *  - mode 'design' (mặc định): đề xuất thao tác thiết kế theo ACTION_SCHEMA (lib/gym-actions.ts).
 *    mode 'sim-scenario': đọc mô tả vận hành → thông số kịch bản mô phỏng. mode 'sim-explain': giải thích kết quả mô phỏng.
 *    Bộ mô phỏng (lib/gym-sim.ts) mới là nơi quản lý trạng thái, thời gian, tài nguyên và hàng chờ — AI chỉ gợi ý / giải thích.
 *  - Chỉ gửi tóm tắt đã lọc và lời nhắn đã che số điện thoại / email. Gói miễn phí của Gemini có thể dùng nội dung để
 *    cải thiện sản phẩm → không gửi thông tin cá nhân / bản vẽ bí mật.
 *  - Lỗi 429 / 5xx: thử lại có giãn cách; quá 25 giây hoặc hết lượt → mã lỗi để giao diện chuyển thủ công / chế độ mẫu.
 */
import { NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/origin';
import { allowAction } from '@/lib/rate-limit';
import { ACTION_SCHEMA, redact, sanitizeReply } from '@/lib/gym-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DESIGN = `Bạn là ANNA, trợ lý thiết kế phòng tập của DANAVA. Khách mô tả nhu cầu bằng tiếng Việt; bạn đề xuất THAO TÁC để công cụ thiết kế tự thực hiện.
Quy tắc:
- Chỉ dùng các thao tác trong lược đồ (field "type"). Không bịa thao tác khác. Tầng đánh số 1 = tầng trệt, 2 = tầng 2…
- Trích nhu cầu thành thao tác cụ thể: mô hình (gym/pt/strength/boutique/wellness), số tầng (add_floor/remove_floor), kích thước tầng (set_floor w/l/h), công năng tầng (use: mixed/cardio/strength/pt/functional), ngân sách (set_budget, đơn vị triệu đồng), phong cách (industrial = tối, kim loại; warm = gỗ, ấm; wellness = sáng, cây xanh), kiểu bố trí (perimeter = mở trung tâm, thiết bị quanh biên; clusters = cụm theo nhóm cơ; circuit = vòng tập; axis = trục trung tâm), lễ tân (set_reception), màu tầng (set_floor accent #RRGGBB), máy bắt buộc / loại trừ, thêm / bỏ / chuyển máy (query = tên máy hoặc loại máy).
- "Giảm chi phí" → reduce_cost (percent). "Giữ máy, chỉ đổi trang trí" → lock on:true rồi chỉ đổi phong cách / màu / lễ tân, KHÔNG regenerate.
- Phần khách đã khoá luôn được giữ nguyên; không cần thao tác để giữ.
- Chỉ hỏi (questions) khi thật sự thiếu thông tin để làm đúng, tối đa 2 câu ngắn. Nếu đủ, questions = [].
- reply: 1–4 câu, nói đã hiểu gì, sẽ đổi gì và vì sao (lý do thiết kế: luồng đi, khoảng mở, ánh sáng, chi phí).
- Không kết luận về kết cấu sàn / tải trọng; nếu khách hỏi, nói cần kỹ sư xác minh.
- Không yêu cầu hay nhắc lại thông tin cá nhân.`;
const SCENARIO = `Bạn chuyển mô tả vận hành phòng tập (tiếng Việt) thành thông số kịch bản mô phỏng một ngày. Chỉ điền trường có căn cứ trong mô tả; trường không nói tới thì bỏ trống.
open/close: giờ mở / đóng (số thực, 5.5 = 5:30). visitors: tổng lượt khách / ngày. member/guest/pt: tỷ lệ hội viên / khách mới / khách PT (0–1). groupRate: tỷ lệ đi nhóm. stayMin/stayMax: phút ở lại. patienceMin/patienceMax: giây sẵn sàng chờ máy. staff: số lễ tân. trainers: số huấn luyện viên. chatChance: xác suất trò chuyện khi nghỉ (0–1). reply: 1–2 câu tóm tắt đã hiểu gì và nhắc rằng đây là giả định.`;
const EXPLAIN = `Bạn giải thích kết quả MÔ PHỎNG một ngày vận hành phòng tập cho chủ phòng tập (tiếng Việt, 4–7 câu, gạch đầu dòng được).
Nêu: giờ cao điểm, điểm nghẽn (máy hay chờ, khu đông), máy ít dùng, tác động của trò chuyện giữ máy, gợi ý điều chỉnh bố trí / số máy / nhân sự cụ thể.
Luôn nhắc kết quả phụ thuộc giả định đầu vào (nguồn số liệu được ghi trong dữ liệu) và nên hiệu chỉnh bằng dữ liệu check-in / quan sát thực tế. Không bịa số liệu ngoài dữ liệu được đưa.`;
const SCENARIO_SCHEMA = { type: 'object', properties: { reply: { type: 'string' }, open: { type: 'number' }, close: { type: 'number' }, visitors: { type: 'integer' }, member: { type: 'number' }, guest: { type: 'number' }, pt: { type: 'number' }, groupRate: { type: 'number' }, stayMin: { type: 'number' }, stayMax: { type: 'number' }, patienceMin: { type: 'number' }, patienceMax: { type: 'number' }, staff: { type: 'integer' }, trainers: { type: 'integer' }, chatChance: { type: 'number' } }, required: ['reply'] };
const EXPLAIN_SCHEMA = { type: 'object', properties: { reply: { type: 'string' } }, required: ['reply'] };

type Turn = { role: 'user' | 'model'; text: string };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: 'not-configured' }, { status: 503 });
  if (Number(req.headers.get('content-length') || 0) > 40_000) return NextResponse.json({ error: 'Nội dung quá dài.' }, { status: 413 });
  let body: { message?: unknown; history?: unknown; context?: unknown; mode?: unknown };
  try { body = JSON.parse((await req.text()).slice(0, 40_000)); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  const mode = body.mode === 'sim-scenario' || body.mode === 'sim-explain' ? body.mode : 'design';
  const message = typeof body.message === 'string' ? redact(body.message.trim()).slice(0, 1200) : '';
  if (mode !== 'sim-explain' && message.length < 2) return NextResponse.json({ error: 'Bạn chưa nhập yêu cầu.' }, { status: 400 });
  const history: Turn[] = mode !== 'design' ? [] : (Array.isArray(body.history) ? body.history : []).slice(-6).flatMap(t => {
    const x = (t || {}) as Record<string, unknown>;
    return (x.role === 'user' || x.role === 'model') && typeof x.text === 'string' ? [{ role: x.role, text: redact(x.text).slice(0, 700) } as Turn] : [];
  });
  const context = JSON.stringify(body.context ?? {}).slice(0, 14_000);
  const limit = Number(process.env.DANAVA_GYM_AI_DAILY) > 0 ? Number(process.env.DANAVA_GYM_AI_DAILY) : 300;
  if (!(await allowAction(req, 'gym-ai', { minute: 6, day: 40, siteDay: limit }))) return NextResponse.json({ error: 'quota', message: 'Trợ lý đã dùng hết lượt cho hôm nay. Bạn vẫn chỉnh thiết kế thủ công được.' }, { status: 429 });

  const model = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').replace(/[^a-z0-9.\-]/gi, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const system = mode === 'design' ? DESIGN : mode === 'sim-scenario' ? SCENARIO : EXPLAIN;
  const schema = mode === 'design' ? ACTION_SCHEMA : mode === 'sim-scenario' ? SCENARIO_SCHEMA : EXPLAIN_SCHEMA;
  const userText = mode === 'design' ? `Hiện trạng thiết kế (JSON, không có thông tin cá nhân):\n${context}\n\nYêu cầu của khách:\n${message}`
    : mode === 'sim-scenario' ? `Thông tin phòng tập (JSON):\n${context}\n\nMô tả vận hành của khách:\n${message}`
    : `Kết quả mô phỏng (JSON, gồm nguồn số liệu: assumed = giả định mẫu, calibrated = đã hiệu chỉnh):\n${context}${message ? `\n\nCâu hỏi thêm: ${message}` : ''}`;
  const contents = [...history.map(t => ({ role: t.role, parts: [{ text: t.text }] })), { role: 'user', parts: [{ text: userText }] }];
  const payload = (withSchema: boolean) => JSON.stringify({
    systemInstruction: { parts: [{ text: system + (withSchema ? '' : '\nTrả về DUY NHẤT một JSON object đúng các trường đã nêu, có trường "reply".') }] },
    contents,
    generationConfig: { responseMimeType: 'application/json', ...(withSchema ? { responseJsonSchema: schema } : {}), maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: 'MINIMAL' } }
  });

  const deadline = Date.now() + 25_000;
  let useSchema = true, lastStatus = 0;
  for (let attempt = 0; attempt < 4 && Date.now() < deadline; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), Math.max(1000, deadline - Date.now()));
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: payload(useSchema), signal: ac.signal });
      lastStatus = r.status;
      if (r.status === 400 && useSchema) { useSchema = false; continue; }
      if (r.status === 429 || r.status >= 500) { await sleep(Math.min(8000, 1000 * 2 ** attempt + Math.random() * 400)); continue; }
      if (!r.ok) break;
      const v = await r.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const txt = v.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
      const json = txt.match(/\{[\s\S]*\}/)?.[0];
      if (!json) { lastStatus = 502; continue; }
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(json); } catch { lastStatus = 502; continue; }
      if (mode === 'design') return NextResponse.json({ ...sanitizeReply(parsed), model });
      const reply = typeof parsed.reply === 'string' ? parsed.reply.slice(0, 2500) : '';
      if (mode === 'sim-explain') return NextResponse.json({ reply, model });
      // kịch bản: chỉ trả số hữu hạn; giao diện kẹp lại theo giới hạn của bộ mô phỏng
      const nums = Object.fromEntries(Object.entries(parsed).filter(([k, x]) => k !== 'reply' && typeof x === 'number' && Number.isFinite(x)));
      return NextResponse.json({ reply, scenario: nums, model });
    } catch { lastStatus = 504; } finally { clearTimeout(timer); }
  }
  if (lastStatus === 429) return NextResponse.json({ error: 'quota', message: 'Gemini đang hết hạn mức miễn phí. Thử lại sau ít phút hoặc chỉnh thủ công.' }, { status: 429 });
  return NextResponse.json({ error: 'upstream', message: 'Trợ lý tạm thời không phản hồi. Bạn vẫn chỉnh thủ công được.' }, { status: 502 });
}
