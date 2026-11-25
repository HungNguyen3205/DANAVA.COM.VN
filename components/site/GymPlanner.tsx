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
import { ArrowDownUp, Ban, Boxes, ChevronDown, Copy, ExternalLink, Grid3x3, Maximize2, Plus, RotateCw, Ruler, Search, Send, Sparkles, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { EQUIPMENT_CATEGORIES, KIND_LABEL, formatVND, type Equipment, type EquipmentCategory, type Flooring } from '@/lib/equipment';
import { createEngine, type Engine, type Placed, type PlacedZone } from './gym-planner-engine';
import { LAYOUT_STYLES, ZONE_KINDS, autoLayout, type LayoutStyle, type ZoneKind } from '@/lib/gym-layout';

const KEY = 'danava-gym-planner';
type Saved = { area: number; w: number; l: number; tile: number; items: { eqId: string; x: number; z: number; rot: number }[]; zones?: { kind: ZoneKind; x: number; z: number; w: number; d: number; rot: number }[] };
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
  const [zones, setZones] = useState<PlacedZone[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [cat, setCat] = useState<EquipmentCategory | ''>('');
  const [q, setQ] = useState('');
  // Bộ lọc danh sách máy: nhóm cơ (máy sức mạnh), mức giá, sắp xếp; hiện dần từng trang
  const [muscle, setMuscle] = useState<Muscle | ''>('');
  const [priceBand, setPriceBand] = useState(0);
  const [sort, setSort] = useState<'' | 'asc' | 'desc'>('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState('');
  const [tab, setTab] = useState<'eq' | 'room' | 'zones'>('room');
  const [floorOn, setFloorOn] = useState(true);
  // Tự động bố trí: kiểu phòng + ngân sách (triệu đồng, trống = không giới hạn)
  const [auto, setAuto] = useState({ on: true, style: 'balanced' as LayoutStyle, budget: '', open: false, note: '' });
  const [form, setForm] = useState({ open: false, name: '', phone: '', note: '', sending: false, done: '', error: '' });
  const byId = useMemo(() => new Map(equipment.map(e => [e.id, e])), [equipment]);
  const restored = useRef<Saved | null>(null);

  // Dựng bộ máy 3D một lần
  useEffect(() => {
    let off = false;
    try { const raw = localStorage.getItem(KEY); if (raw) restored.current = JSON.parse(raw) as Saved; } catch {}
    void createEngine(host.current!, { change: setPlaced, zones: setZones, select: setSel }).then(e => {
      if (off) { e.dispose(); return; }
      engine.current = e;
      const s = restored.current;
      if (s && s.w && s.l) {
        setRoom({ area: s.area, w: s.w, l: s.l, tile: s.tile });
        e.setRoom(s.w, s.l, s.tile);
        for (const z of s.zones || []) if (z.kind in ZONE_KINDS) e.addZone(z.kind, z);
        for (const it of s.items || []) { const eq = byId.get(it.eqId); if (eq) e.add(eq, it); }
        setStarted(true);
        setTab('eq');
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
    try { localStorage.setItem(KEY, JSON.stringify({ ...room, items: placed.map(({ eqId, x, z, rot }) => ({ eqId, x, z, rot })), zones: zones.map(({ kind, x, z, w, d, rot }) => ({ kind, x, z, w, d, rot })) } satisfies Saved)); } catch {}
  }, [room, placed, zones, started]);

  function applyRoom(next: { area?: number; w?: number; l?: number; tile?: number }) {
    const r = { ...room, ...next };
    if (next.w !== undefined || next.l !== undefined) r.area = Math.round(r.w * r.l);
    setRoom(r);
    engine.current?.setRoom(r.w, r.l, r.tile);
  }
  // Khu không đặt máy mới nhất (engine báo về đồng bộ, dùng ngay trong cùng lượt bấm)
  const zonesRef = useRef<PlacedZone[]>([]);
  zonesRef.current = zones;
  /** Xếp sẵn máy theo kiểu phòng / ngân sách (lib/gym-layout.ts), né khu không đặt máy; thay toàn bộ máy đang có */
  function runAuto(w: number, l: number) {
    const e = engine.current;
    if (!e) return;
    const budget = Number(auto.budget.replace(/[^\d.,]/g, '').replace(',', '.')) * 1e6 || undefined;
    const r = autoLayout(equipment, { w, l, style: auto.style, budget, zones: zonesRef.current });
    e.clear(true);
    for (const it of r.items) { const eq = byId.get(it.eqId); if (eq) e.add(eq, it); }
    e.select(null);
    setAuto(a => ({ ...a, open: false, note: `Đã bố trí ${r.items.length} máy: ${r.zones.cardio} cardio · ${r.zones.strength} máy tạ · ${r.zones.free} tạ tự do. Kéo để chỉnh, bấm + để thêm.` }));
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
    setTab('eq');
    // Cửa ra vào mặc định ở giữa tường trước (kéo / xoay / xóa được), để bố trí chừa lối vào
    if (!zonesRef.current.some(z => z.kind === 'door')) engine.current?.addZone('door', { x: 0, z: l / 2 - ZONE_KINDS.door.d / 2, rot: 0 });
    if (auto.on) runAuto(w, l);
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
  const selZone = sel ? zones.find(z => z.uid === sel) : undefined;
  const fold = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
  const inCat = equipment.filter(e => !cat || e.category === cat);
  const band = PRICE_BANDS[priceBand];
  const shown = inCat.filter(e => (!muscle || muscleOf(e) === muscle) && band.ok(Number(e.price) || 0) && (!q.trim() || fold(`${e.name} ${e.sku || ''}`).includes(fold(q.trim()))));
  if (sort) shown.sort((a, b) => ((Number(a.price) || (sort === 'asc' ? Infinity : -1)) - (Number(b.price) || (sort === 'asc' ? Infinity : -1))) * (sort === 'asc' ? 1 : -1));
  const muscleCount = (m: Muscle) => inCat.filter(e => muscleOf(e) === m).length;
  const qtyIn = (id: string) => placed.filter(p => p.eqId === id).length;
  const filtered = !!(cat || muscle || priceBand || q.trim());
  const resetFilters = () => { setCat(''); setMuscle(''); setPriceBand(0); setQ(''); setLimit(PAGE); };

  async function send(e: FormEvent) {
    e.preventDefault();
    setForm(f => ({ ...f, sending: true, error: '' }));
    const summary = [
      `Phòng tập ${room.area} m² (${room.w} × ${room.l} m), ô gạch ${Math.round(room.tile * 100)} cm (~${tiles} viên).`,
      zones.length ? `Khu không đặt máy: ${zones.map(z => `${ZONE_KINDS[z.kind].label} ${z.w}×${z.d} m`).join(', ')}.` : '',
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
          <div className="gp-tabs" role="tablist" aria-label="Bảng điều khiển">
            <button type="button" role="tab" aria-selected={tab === 'eq'} className={tab === 'eq' ? 'is-on' : ''} onClick={() => setTab('eq')}><Boxes aria-hidden="true" /> Thiết bị{placed.length ? <i>{placed.length}</i> : null}</button>
            <button type="button" role="tab" aria-selected={tab === 'room'} className={tab === 'room' ? 'is-on' : ''} onClick={() => setTab('room')}><Ruler aria-hidden="true" /> Phòng</button>
            <button type="button" role="tab" aria-selected={tab === 'zones'} className={tab === 'zones' ? 'is-on' : ''} onClick={() => setTab('zones')}><Ban aria-hidden="true" /> Khu cấm{zones.length ? <i>{zones.length}</i> : null}</button>
          </div>
          {tab === 'room' && <section className="gp-box">
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
          </section>}

          {tab === 'zones' && <section className="gp-box gp-zones">
            <h2><Ban aria-hidden="true" /> Khu không đặt máy <small>{zones.length ? `${zones.length} khu` : 'cửa, cầu thang…'}</small></h2>
            <div className="gp-zones__btns">
              {(Object.keys(ZONE_KINDS) as ZoneKind[]).map(k => (
                <button key={k} type="button" disabled={!started} onClick={() => engine.current?.addZone(k)} style={{ ['--zc' as string]: ZONE_KINDS[k].color }}><Plus aria-hidden="true" />{ZONE_KINDS[k].label}</button>
              ))}
            </div>
            <p className="gp-zones__hint">Đánh dấu chỗ không được đặt máy. Máy đặt vào sẽ bị tô đỏ; “Tự động bố trí” tự né và chừa lối đi.</p>
          </section>}

          {tab === 'eq' && <section className="gp-box gp-box--list">
            <div className="gp-search"><Search aria-hidden="true" /><input type="search" value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE); }} placeholder={`Tìm trong ${equipment.length} máy (tên, mã)…`} aria-label="Tìm máy" /></div>
            <div className="gp-cats" role="tablist" aria-label="Nhóm máy">
              <button type="button" role="tab" aria-selected={!cat} className={!cat ? 'is-on' : ''} onClick={() => { setCat(''); setMuscle(''); setLimit(PAGE); }}>Tất cả</button>
              {(Object.keys(EQUIPMENT_CATEGORIES) as EquipmentCategory[]).filter(c => equipment.some(e => e.category === c)).map(c => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'is-on' : ''} onClick={() => { setCat(c); setMuscle(''); setLimit(PAGE); }}>{SHORT_CAT[c] || EQUIPMENT_CATEGORIES[c]}<small>{equipment.filter(e => e.category === c).length}</small></button>
              ))}
            </div>
            {cat === 'strength' && (
              <div className="gp-muscles" aria-label="Nhóm cơ">
                {(Object.keys(MUSCLES) as Muscle[]).filter(m => muscleCount(m)).map(m => (
                  <button key={m} type="button" aria-pressed={muscle === m} className={muscle === m ? 'is-on' : ''} onClick={() => { setMuscle(muscle === m ? '' : m); setLimit(PAGE); }}>{MUSCLES[m].label} <small>{muscleCount(m)}</small></button>
                ))}
              </div>
            )}
            <div className="gp-filterbar">
              <label className="gp-select" aria-label="Mức giá"><span hidden>Mức giá</span>
                <select value={priceBand} onChange={e => { setPriceBand(Number(e.target.value)); setLimit(PAGE); }}>{PRICE_BANDS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}</select><ChevronDown aria-hidden="true" />
              </label>
              <button type="button" className={`gp-sort${sort ? ' is-on' : ''}`} onClick={() => setSort(sort === '' ? 'asc' : sort === 'asc' ? 'desc' : '')} title="Sắp xếp theo giá"><ArrowDownUp aria-hidden="true" />{sort === 'asc' ? 'Giá thấp' : sort === 'desc' ? 'Giá cao' : 'Sắp xếp'}</button>
            </div>
            <p className="gp-count"><b>{shown.length}</b> máy{filtered && <button type="button" onClick={resetFilters}>Xóa lọc</button>}{!started && <span>· dựng phòng để thêm máy</span>}</p>
            <ul className="gp-eq">
              {shown.slice(0, limit).map(e => {
                const n = qtyIn(e.id);
                return (
                  <li key={e.id} className={open === e.id ? 'is-open' : ''}>
                    <button type="button" className="gp-eq__row" onClick={() => setOpen(open === e.id ? '' : e.id)} aria-expanded={open === e.id}>
                      <span className="gp-eq__sw" style={{ background: e.color }}>{e.image ? <img src={e.image} alt="" loading="lazy" /> : null}</span>
                      <span className="gp-eq__txt">
                        <b title={e.name}>{e.name}</b>
                        <span><em className={e.price ? '' : 'is-contact'}>{e.price ? formatVND(Number(e.price)) : 'Liên hệ'}</em>{n ? <i>Trong phòng ×{n}</i> : null}</span>
                      </span>
                    </button>
                    <button type="button" className="gp-eq__add" disabled={!started} onClick={() => engine.current?.add(e)} aria-label={`Thêm ${e.name} vào phòng`} title={started ? 'Thêm vào phòng' : 'Dựng phòng trước'}><Plus aria-hidden="true" /></button>
                    {open === e.id && (
                      <div className="gp-eq__more">
                        {e.image && <img src={e.image} alt={e.name} loading="lazy" />}
                        <dl>
                          {e.sku && <><dt>Mã</dt><dd>{e.sku}</dd></>}
                          {e.kind && <><dt>Loại</dt><dd>{KIND_LABEL[e.kind]}</dd></>}
                          <dt>Kích thước</dt><dd>{e.width} × {e.depth} × {e.height} cm{e.dimsEstimated ? ' (ước tính)' : ''}</dd>
                        </dl>
                        {e.source && <a href={e.source} target="_blank" rel="noopener">Xem chi tiết <ExternalLink aria-hidden="true" /></a>}
                      </div>
                    )}
                  </li>
                );
              })}
              {shown.length > limit && <li className="gp-eq__moreBtn"><button type="button" onClick={() => setLimit(l => l + PAGE)}>Xem thêm {Math.min(PAGE, shown.length - limit)} máy</button></li>}
              {shown.length === 0 && <li className="gp-eq__none">Không có máy nào khớp. {filtered && <button type="button" onClick={resetFilters}>Xóa bộ lọc</button>}</li>}
            </ul>
            <p className="gp-src">Danh mục, giá và hình ảnh: đối tác <a href="https://thietbigym.vn/" target="_blank" rel="noopener">thietbigym.vn</a></p>
          </section>}
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
              <label className="gp-start__auto"><input type="checkbox" checked={auto.on} onChange={e => setAuto(a => ({ ...a, on: e.target.checked }))} /><Sparkles aria-hidden="true" /> Để DANAVA bố trí sẵn máy, tôi chỉ việc chỉnh</label>
              {auto.on && <AutoOptions auto={auto} setAuto={setAuto} />}
              <button type="submit" className="s-btn s-btn--primary s-btn--lg">{auto.on ? 'Dựng phòng và bố trí sẵn' : 'Dựng phòng 3D'}</button>
            </form>
          )}
          {started && sel && selZone && (
            <div className="gp-toolbar gp-toolbar--zone" role="toolbar" aria-label={`Khu đang chọn: ${ZONE_KINDS[selZone.kind].label}`}>
              <b>{ZONE_KINDS[selZone.kind].label}</b>
              <label>Rộng<input type="number" min={.2} max={room.w} step={.1} value={selZone.w} onChange={e => engine.current?.resizeZone(sel, Number(e.target.value) || .2, selZone.d)} />m</label>
              <label>Sâu<input type="number" min={.2} max={room.l} step={.1} value={selZone.d} onChange={e => engine.current?.resizeZone(sel, selZone.w, Number(e.target.value) || .2)} />m</label>
              <button type="button" onClick={() => engine.current?.rotate(sel)}><RotateCw aria-hidden="true" /> Xoay</button>
              <button type="button" className="is-danger" onClick={() => engine.current?.remove(sel)}><Trash2 aria-hidden="true" /> Xóa</button>
            </div>
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
          {started && bad > 0 && <p className="gp-warn"><TriangleAlert aria-hidden="true" /> {bad} máy đang chồng lên nhau, ra ngoài phòng hoặc nằm trong khu không đặt máy (tô đỏ)</p>}
        </div>
      </div>

      {/* ----- Bảng chi phí ngay dưới phòng ----- */}
      {started && (
        <section className="gp-cost" aria-labelledby="gp-cost-title">
          <div className="gp-cost__head">
            <h2 id="gp-cost-title">Chi phí thiết bị cho phòng {room.area} m²</h2>
            <div className="gp-cost__tools">
              <button type="button" className="gp-auto-btn" onClick={() => setAuto(a => ({ ...a, open: !a.open }))}><Sparkles aria-hidden="true" /> Tự động bố trí lại</button>
              <button type="button" onClick={() => engine.current?.resetView()}>Góc nhìn ban đầu</button>
              <button type="button" onClick={() => { engine.current?.clear(false); setStarted(false); try { localStorage.removeItem(KEY); } catch {} }}>Làm lại phòng</button>
            </div>
          </div>
          {auto.open && (
            <div className="gp-auto">
              <AutoOptions auto={auto} setAuto={setAuto} />
              <button type="button" className="s-btn s-btn--primary" onClick={() => runAuto(room.w, room.l)}><Sparkles aria-hidden="true" /> Bố trí (thay máy đang có)</button>
            </div>
          )}
          {auto.note && <p className="gp-auto-note" role="status">{auto.note}</p>}
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

type AutoState = { on: boolean; style: LayoutStyle; budget: string; open: boolean; note: string };
/** Chọn kiểu phòng và ngân sách cho tự động bố trí */
function AutoOptions({ auto, setAuto }: { auto: AutoState; setAuto: (f: (a: AutoState) => AutoState) => void }) {
  return (
    <div className="gp-auto__opts">
      <div className="gp-auto__styles" role="radiogroup" aria-label="Kiểu phòng tập">
        {(Object.keys(LAYOUT_STYLES) as LayoutStyle[]).map(k => (
          <button key={k} type="button" role="radio" aria-checked={auto.style === k} className={auto.style === k ? 'is-on' : ''} onClick={() => setAuto(a => ({ ...a, style: k }))}>
            <b>{LAYOUT_STYLES[k].label}</b><small>{LAYOUT_STYLES[k].hint}</small>
          </button>
        ))}
      </div>
      <label className="gp-auto__budget">Ngân sách thiết bị<span><input inputMode="decimal" value={auto.budget} placeholder="không giới hạn" onChange={e => setAuto(a => ({ ...a, budget: e.target.value.replace(/[^\d.,]/g, '').slice(0, 7) }))} /> triệu đồng</span></label>
    </div>
  );
}

const PAGE = 30;
const SHORT_CAT: Partial<Record<EquipmentCategory, string>> = { strength: 'Máy sức mạnh' };
/** Mức giá (VNĐ); máy "Liên hệ" (giá 0) chỉ hiện ở "Mọi mức giá" */
const PRICE_BANDS: { label: string; ok: (p: number) => boolean }[] = [
  { label: 'Mọi mức giá', ok: () => true },
  { label: 'Dưới 20 triệu', ok: p => p > 0 && p < 20e6 },
  { label: '20 – 50 triệu', ok: p => p >= 20e6 && p < 50e6 },
  { label: '50 – 100 triệu', ok: p => p >= 50e6 && p < 100e6 },
  { label: 'Trên 100 triệu', ok: p => p >= 100e6 },
  { label: 'Đã có giá', ok: p => p > 0 }
];
/** Nhóm cơ cho máy sức mạnh, đoán theo tên máy (thứ tự = ưu tiên) */
const MUSCLES = {
  legs: { label: 'Chân · mông', re: /leg|squat|hack|glute|hip|calf|abduct|adduct|lunge|pendulum|kick|nordic|đùi|mông|chân|bắp/i },
  chest: { label: 'Ngực', re: /chest|fly|pec|bench press|dip|ngực/i },
  back: { label: 'Lưng · xô', re: /\blat\b|pulldown|pull down|row|pull|back|hyper|chèo|lưng|xô/i },
  shoulder: { label: 'Vai', re: /shoulder|lateral|delt|raise|vertical press|vai/i },
  arms: { label: 'Tay', re: /bicep|tricep|\barm|curl|tay/i },
  core: { label: 'Bụng', re: /abdom|\bab\b|crunch|torso|rotary|core|sit-?up|bụng/i },
  rig: { label: 'Giàn · khung đa năng', re: /rack|smith|multi|station|cage|functional|trainer|cable|jammer/i },
  other: { label: 'Khác', re: /$^/ }
} as const;
type Muscle = keyof typeof MUSCLES;
function muscleOf(e: Equipment): Muscle | '' {
  if (e.category !== 'strength') return '';
  if (e.kind === 'rack' || e.kind === 'smith' || e.kind === 'multi' || e.kind === 'cable') return 'rig';
  return (Object.keys(MUSCLES) as Muscle[]).find(m => MUSCLES[m].re.test(e.name)) || 'other';
}
