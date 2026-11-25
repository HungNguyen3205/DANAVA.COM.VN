'use client';
/**
 * Phòng lab 3D setup phòng gym (/bao-gia-setup-phong-gym/):
 *  1. Hỏi diện tích (m²) → dựng phòng chữ nhật (chỉnh dài × rộng được), sàn chia ô gạch 40 cm (chỉnh 30–100 cm).
 *  2. Thêm máy từ danh mục (Quản trị → Thiết bị phòng gym), kéo thả trên sàn, xoay, nhân bản, xóa.
 *  3. Bảng chi phí ngay dưới phòng: số lượng × đơn giá; máy chưa có giá = "Liên hệ" (không cộng vào tổng).
 *  4. Gửi bản thiết kế cho DANAVA (/api/lead) hoặc đặt lịch tư vấn.
 * Thiết kế lưu trên trình duyệt của khách (localStorage) để tải lại trang không mất.
 */
import Link from 'next/link';
import { Boxes, Copy, Grid3x3, Maximize2, Plus, RotateCw, Ruler, Search, Send, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { EQUIPMENT_CATEGORIES, formatVND, type Equipment, type EquipmentCategory, type Flooring } from '@/lib/equipment';
import { createEngine, type Engine, type Placed } from './gym-planner-engine';

const KEY = 'danava-gym-planner';
type Saved = { area: number; w: number; l: number; tile: number; items: { eqId: string; x: number; z: number; rot: number }[] };
const round1 = (n: number) => Math.round(n * 10) / 10;
/** Diện tích → phòng chữ nhật tỉ lệ ~1.4 : 1 */
const dimsOf = (area: number) => { const l = Math.sqrt(area / 1.4); return { w: round1(l * 1.4), l: round1(area / round1(l * 1.4)) }; };

export function GymPlanner({ equipment, addId, flooring }: { equipment: Equipment[]; addId?: string; flooring?: Flooring | null }) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [areaInput, setAreaInput] = useState('100');
  const [room, setRoom] = useState({ area: 100, w: 11.8, l: 8.5, tile: 0.4 });
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [cat, setCat] = useState<EquipmentCategory | ''>('');
  const [q, setQ] = useState('');
  const [floorOn, setFloorOn] = useState(true);
  const [form, setForm] = useState({ open: false, name: '', phone: '', note: '', sending: false, done: '', error: '' });
  const byId = useMemo(() => new Map(equipment.map(e => [e.id, e])), [equipment]);
  const restored = useRef<Saved | null>(null);

  // Dựng bộ máy 3D một lần
  useEffect(() => {
    let off = false;
    try { const raw = localStorage.getItem(KEY); if (raw) restored.current = JSON.parse(raw) as Saved; } catch {}
    void createEngine(host.current!, { change: setPlaced, select: setSel }).then(e => {
      if (off) { e.dispose(); return; }
      engine.current = e;
      const s = restored.current;
      if (s && s.w && s.l) {
        setRoom({ area: s.area, w: s.w, l: s.l, tile: s.tile });
        e.setRoom(s.w, s.l, s.tile);
        for (const it of s.items || []) { const eq = byId.get(it.eqId); if (eq) e.add(eq, it); }
        setStarted(true);
      }
      setReady(true);
    });
    return () => { off = true; engine.current?.dispose(); engine.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mở từ trang thiết bị (?add=…): thêm máy đó sau khi phòng đã dựng
  const addedFromUrl = useRef(false);
  useEffect(() => {
    if (!ready || !started || !addId || addedFromUrl.current) return;
    const eq = byId.get(addId);
    if (eq) engine.current?.add(eq);
    addedFromUrl.current = true;
  }, [ready, started, addId, byId]);

  // Lưu thiết kế trên trình duyệt
  useEffect(() => {
    if (!started) return;
    try { localStorage.setItem(KEY, JSON.stringify({ ...room, items: placed.map(({ eqId, x, z, rot }) => ({ eqId, x, z, rot })) } satisfies Saved)); } catch {}
  }, [room, placed, started]);

  function applyRoom(next: { area?: number; w?: number; l?: number; tile?: number }) {
    const r = { ...room, ...next };
    if (next.w !== undefined || next.l !== undefined) r.area = Math.round(r.w * r.l);
    setRoom(r);
    engine.current?.setRoom(r.w, r.l, r.tile);
  }
  function start(e: FormEvent) {
    e.preventDefault();
    const area = Math.min(2000, Math.max(10, Math.round(Number(areaInput.replace(',', '.')) || 0)));
    const { w, l } = dimsOf(area);
    applyRoom({ area, w, l });
    setRoom(r => ({ ...r, area, w, l }));
    engine.current?.setRoom(w, l, room.tile);
    engine.current?.resetView();
    setStarted(true);
  }

  // Bảng chi phí: gom theo máy
  const lines = useMemo(() => {
    const m = new Map<string, { eq: Equipment; qty: number }>();
    for (const p of placed) { const eq = byId.get(p.eqId); if (!eq) continue; const l = m.get(eq.id) || { eq, qty: 0 }; l.qty++; m.set(eq.id, l); }
    return [...m.values()];
  }, [placed, byId]);
  // Thảm gạch cao su lát toàn sàn (đối tác): số viên theo kích thước viên thảm, không theo ô lưới hiển thị
  const floorTiles = flooring ? Math.ceil((room.w * 100) / flooring.sizeCm) * Math.ceil((room.l * 100) / flooring.sizeCm) : 0;
  const floorCost = flooring && floorOn && flooring.price ? floorTiles * Number(flooring.price) : 0;
  const total = lines.reduce((s, l) => s + (l.eq.price ? Number(l.eq.price) * l.qty : 0), 0) + floorCost;
  const contact = lines.filter(l => !l.eq.price).length;
  const bad = placed.filter(p => p.bad).length;
  const tiles = Math.ceil(room.w / room.tile) * Math.ceil(room.l / room.tile);
  const selEq = sel ? byId.get(placed.find(p => p.uid === sel)?.eqId || '') : undefined;
  const fold = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
  const shown = equipment.filter(e => (!cat || e.category === cat) && (!q.trim() || fold(`${e.name} ${e.sku || ''}`).includes(fold(q.trim()))));

  async function send(e: FormEvent) {
    e.preventDefault();
    setForm(f => ({ ...f, sending: true, error: '' }));
    const summary = [
      `Phòng tập ${room.area} m² (${room.w} × ${room.l} m), ô gạch ${Math.round(room.tile * 100)} cm (~${tiles} viên).`,
      'Thiết bị:',
      ...lines.map(l => `- ${l.eq.name}${l.eq.sku ? ` [${l.eq.sku}]` : ''} × ${l.qty}: ${l.eq.price ? formatVND(Number(l.eq.price) * l.qty) : 'Liên hệ'}`),
      flooring && floorOn ? `- ${flooring.name} × ${floorTiles} viên: ${flooring.price ? formatVND(floorCost) : 'Liên hệ'}` : '',
      `Tổng thiết bị + sàn đã có giá: ${formatVND(total)}${contact ? ` (+${contact} loại máy cần báo giá)` : ''}.`,
      form.note.trim() ? `Ghi chú: ${form.note.trim()}` : ''
    ].filter(Boolean).join('\n');
    try {
      const r = await fetch('/api/lead/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone, businessType: 'Phòng gym', service: 'Setup phòng gym (phòng lab 3D)', message: summary.slice(0, 5000), source: location.href }) });
      const v = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(v.error || 'Chưa gửi được, vui lòng thử lại.');
      setForm(f => ({ ...f, sending: false, done: v.message || 'Đã gửi bản thiết kế. DANAVA sẽ liên hệ lại sớm.' }));
    } catch (x) { setForm(f => ({ ...f, sending: false, error: x instanceof Error ? x.message : 'Chưa gửi được.' })); }
  }

  return (
    <div className="gp">
      <div className="gp-layout">
        {/* ----- Bảng điều khiển ----- */}
        <aside className="gp-side" aria-label="Thiết lập phòng và thiết bị">
          <section className="gp-box">
            <h2><Ruler aria-hidden="true" /> Phòng tập</h2>
            <div className="gp-room">
              <label>Dài (m)<input type="number" min={2} max={80} step={0.1} value={room.w} onChange={e => applyRoom({ w: Math.min(80, Math.max(2, Number(e.target.value) || 2)) })} /></label>
              <label>Rộng (m)<input type="number" min={2} max={80} step={0.1} value={room.l} onChange={e => applyRoom({ l: Math.min(80, Math.max(2, Number(e.target.value) || 2)) })} /></label>
            </div>
            <p className="gp-area"><b>{room.area} m²</b> · {Math.ceil(room.w / room.tile)} × {Math.ceil(room.l / room.tile)} ô ≈ {tiles.toLocaleString('vi-VN')} viên gạch</p>
            <label className="gp-tile">
              <span><Grid3x3 aria-hidden="true" /> Ô gạch <b>{Math.round(room.tile * 100)} × {Math.round(room.tile * 100)} cm</b></span>
              <input type="range" min={30} max={100} step={5} value={Math.round(room.tile * 100)} onChange={e => applyRoom({ tile: Number(e.target.value) / 100 })} />
            </label>
          </section>

          <section className="gp-box gp-box--list">
            <h2><Boxes aria-hidden="true" /> Thiết bị <small>bấm + để thêm vào phòng</small></h2>
            <div className="gp-search"><Search aria-hidden="true" /><input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={`Tìm trong ${equipment.length} máy (tên, mã)…`} aria-label="Tìm máy" /></div>
            <div className="gp-cats" role="tablist" aria-label="Nhóm máy">
              <button type="button" role="tab" aria-selected={!cat} className={!cat ? 'is-on' : ''} onClick={() => setCat('')}>Tất cả</button>
              {(Object.keys(EQUIPMENT_CATEGORIES) as EquipmentCategory[]).filter(c => equipment.some(e => e.category === c)).map(c => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'is-on' : ''} onClick={() => setCat(c)}>{EQUIPMENT_CATEGORIES[c]}</button>
              ))}
            </div>
            <ul className="gp-eq">
              {shown.map(e => (
                <li key={e.id}>
                  <span className="gp-eq__sw" style={{ background: e.color }}>{e.image ? <img src={e.image} alt="" loading="lazy" /> : null}</span>
                  <span className="gp-eq__txt"><b title={e.name}>{e.name}</b><small>{e.width}×{e.depth} cm{e.dimsEstimated ? ' (ước tính)' : ''} · {e.price ? formatVND(Number(e.price)) : 'Liên hệ'}</small></span>
                  <button type="button" className="gp-eq__add" disabled={!started} onClick={() => engine.current?.add(e)} aria-label={`Thêm ${e.name} vào phòng`}><Plus aria-hidden="true" /></button>
                </li>
              ))}
              {shown.length === 0 && <li className="gp-eq__none">Không có máy nào khớp.</li>}
            </ul>
            <p className="gp-src">Danh mục, giá và hình ảnh: đối tác <a href="https://thietbigym.vn/" target="_blank" rel="noopener">thietbigym.vn</a></p>
          </section>
        </aside>

        {/* ----- Phòng 3D ----- */}
        <div className="gp-stage">
          <div ref={host} className="gp-canvas" />
          {!ready && <p className="gp-loading">Đang dựng phòng 3D…</p>}
          {ready && !started && (
            <form className="gp-start" onSubmit={start}>
              <span className="gp-start__icon"><Maximize2 aria-hidden="true" /></span>
              <h2>Phòng tập của bạn rộng bao nhiêu?</h2>
              <p>Nhập diện tích sàn, DANAVA dựng phòng 3D chia ô gạch 40 × 40 cm để bạn bắt đầu bố trí máy.</p>
              <label className="gp-start__input"><input type="number" min={10} max={2000} inputMode="numeric" value={areaInput} onChange={e => setAreaInput(e.target.value)} aria-label="Diện tích (m²)" autoFocus /><span>m²</span></label>
              <div className="gp-start__quick">{[60, 100, 200, 400].map(a => <button key={a} type="button" onClick={() => setAreaInput(String(a))}>{a} m²</button>)}</div>
              <button type="submit" className="s-btn s-btn--primary s-btn--lg">Dựng phòng 3D</button>
            </form>
          )}
          {started && sel && selEq && (
            <div className="gp-toolbar" role="toolbar" aria-label={`Máy đang chọn: ${selEq.name}`}>
              <b>{selEq.name}</b>
              <button type="button" onClick={() => engine.current?.rotate(sel)}><RotateCw aria-hidden="true" /> Xoay</button>
              <button type="button" onClick={() => engine.current?.duplicate(sel)}><Copy aria-hidden="true" /> Nhân bản</button>
              <button type="button" className="is-danger" onClick={() => engine.current?.remove(sel)}><Trash2 aria-hidden="true" /> Xóa</button>
            </div>
          )}
          {started && <p className="gp-hint">Kéo máy để di chuyển · kéo nền để xoay góc nhìn · cuộn / chụm 2 ngón để phóng to</p>}
          {started && bad > 0 && <p className="gp-warn"><TriangleAlert aria-hidden="true" /> {bad} máy đang chồng lên nhau hoặc ra ngoài phòng (tô đỏ)</p>}
        </div>
      </div>

      {/* ----- Bảng chi phí ngay dưới phòng ----- */}
      {started && (
        <section className="gp-cost" aria-labelledby="gp-cost-title">
          <div className="gp-cost__head">
            <h2 id="gp-cost-title">Chi phí thiết bị cho phòng {room.area} m²</h2>
            <div className="gp-cost__tools">
              <button type="button" onClick={() => engine.current?.resetView()}>Góc nhìn ban đầu</button>
              <button type="button" onClick={() => { engine.current?.clear(); setStarted(false); try { localStorage.removeItem(KEY); } catch {} }}>Làm lại phòng</button>
            </div>
          </div>
          {flooring && (
            <label className="gp-floor">
              <input type="checkbox" checked={floorOn} onChange={e => setFloorOn(e.target.checked)} />
              <span>Lát thảm gạch cao su {flooring.sizeCm}×{flooring.sizeCm} cm toàn sàn: <b>{floorTiles.toLocaleString('vi-VN')} viên</b> × {flooring.price ? formatVND(Number(flooring.price)) : 'Liên hệ'}{floorOn && floorCost ? <> = <b>{formatVND(floorCost)}</b></> : null}</span>
            </label>
          )}
          {lines.length === 0 ? <p className="gp-cost__empty">Chưa có máy nào. Bấm <b>+</b> ở danh mục bên trái để thêm máy vào phòng.</p> : (
            <table className="gp-table">
              <thead><tr><th>Thiết bị</th><th>Kích thước</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
              <tbody>
                {lines.map(l => (
                  <tr key={l.eq.id}>
                    <td><span className="gp-dot" style={{ background: l.eq.color }} />{l.eq.name}</td>
                    <td>{l.eq.width}×{l.eq.depth} cm</td>
                    <td>{l.qty}</td>
                    <td>{l.eq.price ? formatVND(Number(l.eq.price)) : <span className="gp-contact">Liên hệ</span>}</td>
                    <td>{l.eq.price ? formatVND(Number(l.eq.price) * l.qty) : <span className="gp-contact">Liên hệ</span>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={4}>Tổng chi phí thiết bị{floorCost ? ' + thảm sàn' : ''}{contact ? ` (chưa gồm ${contact} loại máy “Liên hệ”)` : ''}</td><td>{formatVND(total)}</td></tr></tfoot>
            </table>
          )}
          <p className="gp-note">Giá tham khảo theo bảng giá đối tác thietbigym.vn, chưa gồm vận chuyển, lắp đặt và thi công. Chuyên viên DANAVA sẽ xác nhận báo giá chính thức.</p>

          <div className="gp-actions">
            <button type="button" className="s-btn s-btn--primary s-btn--lg" onClick={() => setForm(f => ({ ...f, open: !f.open }))}><Send aria-hidden="true" /> Gửi bản thiết kế cho DANAVA</button>
            <Link className="s-btn s-btn--outline s-btn--lg" href="/lien-he/?service=danava-studio">Đặt lịch tư vấn setup phòng gym</Link>
          </div>
          {form.open && (form.done ? <p className="gp-done" role="status">{form.done}</p> : (
            <form className="gp-form" onSubmit={send}>
              <label>Họ và tên<input required minLength={2} maxLength={150} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" /></label>
              <label>Số điện thoại<input required type="tel" maxLength={25} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} autoComplete="tel" /></label>
              <label className="gp-form__wide">Ghi chú (vị trí, ngân sách, thời gian khai trương…)<textarea rows={3} maxLength={1000} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></label>
              {form.error && <p className="gp-error" role="alert">{form.error}</p>}
              <button type="submit" className="s-btn s-btn--primary" disabled={form.sending}>{form.sending ? 'Đang gửi…' : 'Gửi bản thiết kế'}</button>
            </form>
          ))}
        </section>
      )}
    </div>
  );
}
