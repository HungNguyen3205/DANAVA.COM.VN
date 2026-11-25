'use client';
/**
 * ANNA – Trợ lý thiết kế phòng tập (bảng chat trong phòng lab). Gemini đề xuất thao tác → xem trước (so sánh trước / sau,
 * chi phí, số lỗi kiểm tra) → Áp dụng → hoàn tác bằng nút ↶ của phòng lab. Không có AI → chế độ mẫu (đọc từ khoá), ghi rõ.
 */
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Bot, Check, Eye, Send, Sparkles, TriangleAlert, X } from 'lucide-react';
import type { Equipment, Flooring } from '@/lib/equipment';
import { formatVND } from '@/lib/equipment';
import { STRATEGIES, type Project } from '@/lib/gym-project';
import { applyActions, describeAction, ruleBasedActions, summarizeForAI, type AssistantReply } from '@/lib/gym-actions';

type Msg = { role: 'user' | 'model'; text: string; reply?: AssistantReply; mode?: 'ai' | 'sample'; note?: string; preview?: ReturnType<typeof applyActions>; applied?: boolean; dismissed?: boolean };
const EXAMPLES = [
  'Tôi có hai tầng, thích đen kết hợp gỗ, lễ tân nhỏ, tầng trên dành cho PT và giữ trung tâm thoáng.',
  'Giảm chi phí thiết bị khoảng 20%, giữ các máy đã khoá.',
  'Giữ nguyên máy, chỉ đổi phong cách sang wellness sáng và nhiều cây xanh.',
  'Đổi màu tầng hai sang xanh rêu, thay quầy lễ tân chữ L.'
];

export function AssistantPanel({ project, commit, equipment, flooring, aiEnabled }: { project: Project; commit: (p: Project, label: string) => void; equipment: Equipment[]; flooring: Flooring | null; aiEnabled: boolean }) {
  const catalog = useMemo(() => new Map(equipment.map(e => [e.id, e])), [equipment]);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'model', text: aiEnabled ? 'Chào bạn, mình là ANNA. Bạn mô tả phòng tập mong muốn (tầng, phong cách, lễ tân, ngân sách…), mình đề xuất thay đổi để bạn xem trước rồi áp dụng.' : 'Trợ lý AI chưa được bật trên website, mình đang chạy ở CHẾ ĐỘ MẪU: chỉ nhận ra các ý phổ biến bằng từ khoá. Mọi chức năng thiết kế thủ công vẫn hoạt động đầy đủ.', mode: aiEnabled ? 'ai' : 'sample' }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const scroll = () => setTimeout(() => list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' }), 30);

  async function ask(e?: FormEvent, preset?: string) {
    e?.preventDefault();
    const m = (preset ?? text).trim();
    if (!m || busy) return;
    setText('');
    const history = msgs.filter(x => x.role === 'user' || x.reply).slice(-6).map(x => ({ role: x.role, text: x.role === 'user' ? x.text : JSON.stringify({ reply: x.reply?.reply, actions: x.reply?.actions.map(describeAction) }) }));
    setMsgs(s => [...s, { role: 'user', text: m }]); scroll();
    setBusy(true);
    let reply: AssistantReply | null = null, mode: 'ai' | 'sample' = 'ai', note = '';
    if (aiEnabled) {
      try {
        const r = await fetch('/api/gym-assistant/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: m, history, context: summarizeForAI(project, catalog) }) });
        const v = await r.json().catch(() => ({}));
        if (r.ok) reply = v as AssistantReply;
        else note = v.message || (v.error === 'not-configured' ? 'Trợ lý AI chưa được cấu hình.' : 'Trợ lý AI tạm thời không phản hồi.');
      } catch { note = 'Mất kết nối tới trợ lý AI.'; }
    }
    if (!reply) { reply = ruleBasedActions(m, project); mode = 'sample'; }
    const preview = reply.actions.length ? applyActions(project, reply.actions, equipment, flooring) : undefined;
    setMsgs(s => [...s, { role: 'model', text: reply!.reply, reply: reply!, mode, note, preview }]);
    setBusy(false); scroll();
  }
  function apply(i: number) {
    const m = msgs[i];
    if (!m.preview) return;
    // Áp dụng lại trên trạng thái HIỆN TẠI (khách có thể đã chỉnh tay sau khi xem trước)
    const fresh = applyActions(project, m.reply!.actions, equipment, flooring);
    commit(fresh.project, `ANNA đã áp dụng ${m.reply!.actions.length} thay đổi — bấm ↶ để hoàn tác`);
    setMsgs(s => s.map((x, j) => (j === i ? { ...x, applied: true, preview: fresh } : x)));
  }

  return (
    <div className="gs-panel gs-ai">
      <div className="gs-ai__list" ref={list}>
        {msgs.map((m, i) => (
          <div key={i} className={`gs-ai__msg is-${m.role}`}>
            {m.role === 'model' && <span className="gs-ai__who"><Bot aria-hidden="true" /> ANNA{m.mode === 'sample' && <em>chế độ mẫu · không dùng AI</em>}</span>}
            <p>{m.text}</p>
            {m.note && <p className="gs-ai__note"><TriangleAlert aria-hidden="true" /> {m.note} Đang dùng chế độ mẫu.</p>}
            {m.reply?.questions.map((q, k) => <p key={k} className="gs-ai__q">❓ {q}</p>)}
            {m.reply && m.reply.actions.length > 0 && !m.dismissed && (
              <div className="gs-ai__plan">
                <b><Sparkles aria-hidden="true" /> Đề xuất thay đổi</b>
                <ul>{m.reply.actions.map((a, k) => <li key={k}>{describeAction(a)}</li>)}</ul>
                {m.preview && <Diff before={project} after={m.preview} />}
                {m.preview?.log.some(l => !l.ok) && <ul className="gs-ai__fail">{m.preview.log.filter(l => !l.ok).map((l, k) => <li key={k}>✕ {l.text}</li>)}</ul>}
                {m.applied ? <p className="gs-ai__done"><Check aria-hidden="true" /> Đã áp dụng. Bấm ↶ ở thanh trên để hoàn tác.</p> : (
                  <div className="gs-row">
                    <button type="button" className="s-btn s-btn--primary" onClick={() => apply(i)}><Check aria-hidden="true" /> Áp dụng</button>
                    <button type="button" className="gs-btn" onClick={() => setMsgs(s => s.map((x, j) => (j === i ? { ...x, dismissed: true } : x)))}><X aria-hidden="true" /> Bỏ qua</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {busy && <p className="gs-ai__busy">ANNA đang nghĩ…</p>}
      </div>
      {msgs.length < 3 && <div className="gs-ai__ex">{EXAMPLES.map(x => <button key={x} type="button" onClick={() => void ask(undefined, x)}>{x}</button>)}</div>}
      <form className="gs-ai__form" onSubmit={ask}>
        <textarea rows={2} maxLength={1200} value={text} onChange={e => setText(e.target.value)} placeholder="Mô tả thay đổi bạn muốn…" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(); } }} />
        <button type="submit" className="gs-icon" disabled={busy || text.trim().length < 2} aria-label="Gửi"><Send /></button>
      </form>
      <p className="gs-note"><Eye aria-hidden="true" /> {aiEnabled ? 'Yêu cầu và tóm tắt mặt bằng (không có thông tin cá nhân) được gửi tới Google Gemini — gói miễn phí có thể được Google dùng để cải thiện sản phẩm. Đừng nhập họ tên, số điện thoại, địa chỉ.' : 'Chế độ mẫu chạy hoàn toàn trên trình duyệt của bạn.'} AI chỉ đề xuất; công cụ kiểm tra hình học và ngân sách trước khi áp dụng.</p>
    </div>
  );
}

function Diff({ before, after }: { before: Project; after: ReturnType<typeof applyActions> }) {
  const a = after.project, ob = before.options[before.active], oa = a.options[a.active];
  const rows: [string, string, string][] = [];
  const add = (k: string, x: unknown, y: unknown) => { const sx = String(x), sy = String(y); if (sx !== sy) rows.push([k, sx, sy]); };
  add('Mô hình', before.brief.model, a.brief.model);
  add('Số tầng', before.floors.length, a.floors.length);
  add('Phong cách', before.brief.interior, a.brief.interior);
  add('Ngân sách', before.brief.budget ? formatVND(before.brief.budget) : 'không giới hạn', a.brief.budget ? formatVND(a.brief.budget) : 'không giới hạn');
  add('Lễ tân', before.reception.enabled ? `${before.reception.shape}/${before.reception.size}` : 'tắt', a.reception.enabled ? `${a.reception.shape}/${a.reception.size}` : 'tắt');
  add('Kiểu bố trí', ob ? STRATEGIES[ob.strategy].label : '—', oa ? STRATEGIES[oa.strategy].label : '—');
  add('Số máy', ob?.placements.length ?? 0, oa?.placements.length ?? 0);
  for (const f of a.floors) { const g = before.floors.find(x => x.id === f.id); if (g) { add(`${f.name}: kích thước`, `${g.w}×${g.l}×${g.h} m`, `${f.w}×${f.l}×${f.h} m`); add(`${f.name}: công năng`, g.use, f.use); add(`${f.name}: màu nhấn`, g.accent ?? 'theo phong cách', f.accent ?? 'theo phong cách'); } }
  return (
    <div className="gs-ai__diff">
      {rows.length > 0 && <table><tbody>{rows.map(([k, x, y]) => <tr key={k}><th>{k}</th><td>{x}</td><td>→ <b>{y}</b></td></tr>)}</tbody></table>}
      <p>Chi phí đã có giá sau thay đổi: <b>{formatVND(after.cost)}</b>{after.budget ? ` / ngân sách ${formatVND(after.budget)}` : ''} · kiểm tra hình học: {after.errors ? <em className="is-bad">{after.errors} lỗi</em> : <em className="is-ok">đạt</em>}</p>
    </div>
  );
}
