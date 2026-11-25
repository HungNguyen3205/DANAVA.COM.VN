'use client';
/** Các bảng điều khiển của phòng lab thiết kế phòng tập (components/site/gym/GymStudio.tsx). */
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownUp, Building2, ChevronDown, Copy, ExternalLink, Layers, Lock, Plus, Search, Sparkles, Star, Trash2, Unlock } from 'lucide-react';
import { EQUIPMENT_CATEGORIES, KIND_LABEL, formatVND, type Equipment, type EquipmentCategory, type EquipmentKind } from '@/lib/equipment';
import { BUSINESS_MODELS, FIXTURE_KINDS, FLOOR_USES, LINK_KINDS, STRATEGIES, fmtArea, newProject, type BusinessModel, type FixtureKind, type Floor, type FurnKind, type InteriorStyle, type LinkKind, type Project, type Reception, type Strategy } from '@/lib/gym-project';
import { FURNITURE, INTERIOR_STYLES, RECEPTION_SIZES } from '@/lib/gym-decor';
import { MUSCLES, muscleOf, type Muscle } from '@/lib/gym-layout';
import { usableArea } from '@/lib/gym-geometry';
import type { ProjectCost } from '@/lib/gym-cost';
import { shortVND } from '@/lib/gym-cost';

/* ---------- Ô nhập nhỏ ---------- */
export function Num({ label, value, onChange, min, max, step = .1, unit, wide }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; wide?: boolean }) {
  return (
    <label className={`gs-num${wide ? ' is-wide' : ''}`}><span>{label}</span>
      <span className="gs-num__box"><input type="number" inputMode="decimal" min={min} max={max} step={step} value={Number.isFinite(value) ? value : ''} onChange={e => { const v = Number(e.target.value); if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v))); }} />{unit && <i>{unit}</i>}</span>
    </label>
  );
}
export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, ReactNode][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="gs-seg" role="radiogroup" aria-label={label}>
      {options.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={value === k} className={value === k ? 'is-on' : ''} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  );
}
const Toggle = ({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode }) => (
  <label className="gs-toggle"><input type="checkbox" checked={on} onChange={e => onChange(e.target.checked)} /><span>{children}</span></label>
);

/* ---------- Bước 1: 4 nhóm thông tin ban đầu ---------- */
export function StartWizard({ onCreate, aiNote }: { onCreate: (p: Project) => void; aiNote?: ReactNode }) {
  const [model, setModel] = useState<BusinessModel>('gym');
  const [n, setN] = useState(1);
  const [areas, setAreas] = useState<number[]>([150, 120, 100, 100, 100]);
  const [budget, setBudget] = useState('');
  const [noBudget, setNoBudget] = useState(true);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const b = noBudget ? 0 : Number(budget.replace(/[^\d.,]/g, '').replace(',', '.')) * 1e6 || 0;
    onCreate(newProject({ model, areas: areas.slice(0, n), budget: b, interior: 'industrial' }));
  };
  return (
    <form className="gs-start" onSubmit={submit}>
      <h2>Phòng tập của bạn thế nào?</h2>
      <p className="gs-start__lead">Trả lời 4 câu, xem ngay phòng tập 3D gợi ý và chi phí dự kiến.</p>
      <fieldset><legend><b>1</b> Loại phòng tập</legend>
        <div className="gs-cards gs-cards--start">
          {(Object.keys(BUSINESS_MODELS) as BusinessModel[]).map(k => (
            <button key={k} type="button" role="radio" aria-checked={model === k} className={model === k ? 'is-on' : ''} onClick={() => setModel(k)}><b>{BUSINESS_MODELS[k].label}</b></button>
          ))}
        </div>
      </fieldset>
      <fieldset><legend><b>2</b> Số tầng <small>(tính cả tầng trệt)</small></legend>
        <Seg label="Số tầng" value={String(n)} options={[1, 2, 3, 4, 5].map(i => [String(i), `${i}`] as [string, string])} onChange={v => setN(Number(v))} />
      </fieldset>
      <fieldset><legend><b>3</b> Diện tích {n > 1 ? 'từng tầng' : 'sàn'}</legend>
        <div className="gs-start__areas">
          {Array.from({ length: n }, (_, i) => <Num key={i} label={n > 1 ? (i === 0 ? 'Tầng trệt' : `Tầng ${i + 1}`) : 'Diện tích'} value={areas[i]} min={20} max={2000} step={5} unit="m²" onChange={v => setAreas(a => a.map((x, j) => (j === i ? v : x)))} />)}
        </div>
      </fieldset>
      <fieldset><legend><b>4</b> Ngân sách dự kiến</legend>
        <div className="gs-budgetrow">
          <button type="button" role="radio" aria-checked={noBudget} className={`gs-chip${noBudget ? ' is-on' : ''}`} onClick={() => setNoBudget(true)}>Chưa xác định</button>
          <label className={`gs-budget${noBudget ? ' is-dim' : ''}`}><input inputMode="decimal" value={budget} placeholder="vd 800" onFocus={() => setNoBudget(false)} onChange={e => { setBudget(e.target.value.replace(/[^\d.,]/g, '').slice(0, 8)); setNoBudget(false); }} aria-label="Ngân sách (triệu đồng)" /> triệu đồng</label>
        </div>
      </fieldset>
      <button type="submit" className="s-btn s-btn--primary s-btn--lg gs-start__go"><Sparkles aria-hidden="true" /> Xem phòng tập gợi ý</button>
      <p className="gs-start__after">Cột, cửa, cầu thang, thiết bị, màu sắc… chỉnh sau trong phần <b>Tùy chỉnh</b>.</p>
      {aiNote}
    </form>
  );
}

/* ---------- Nhu cầu ---------- */
export function BriefPanel({ p, set, onRegenerate, equipment }: { p: Project; set: (fn: (p: Project) => Project) => void; onRegenerate: () => void; equipment: Equipment[] }) {
  const kinds = [...new Set(equipment.map(e => e.kind).filter(Boolean))] as EquipmentKind[];
  const must = p.brief.mustHave.map(id => equipment.find(e => e.id === id)).filter((e): e is Equipment => !!e);
  return (
    <div className="gs-panel">
      <h3>Mô hình kinh doanh</h3>
      <div className="gs-cards gs-cards--sm">
        {(Object.keys(BUSINESS_MODELS) as BusinessModel[]).map(k => <button key={k} type="button" role="radio" aria-checked={p.brief.model === k} className={p.brief.model === k ? 'is-on' : ''} onClick={() => set(q => ({ ...q, brief: { ...q.brief, model: k } }))}><b>{BUSINESS_MODELS[k].label}</b></button>)}
      </div>
      <h3>Ngân sách toàn dự án</h3>
      <label className="gs-budget"><input inputMode="numeric" value={p.brief.budget ? Math.round(p.brief.budget / 1e6) : ''} placeholder="không giới hạn" onChange={e => { const v = Number(e.target.value.replace(/\D/g, '')) * 1e6; set(q => ({ ...q, brief: { ...q.brief, budget: v } })); }} /> triệu đồng</label>
      <h3>Máy bắt buộc <small>{must.length ? `${must.length} máy` : 'đánh dấu ★ ở mục Thiết bị'}</small></h3>
      {must.length > 0 && <ul className="gs-chips">{must.map(e => <li key={e.id}>{e.name}<button type="button" aria-label={`Bỏ bắt buộc ${e.name}`} onClick={() => set(q => ({ ...q, brief: { ...q.brief, mustHave: q.brief.mustHave.filter(x => x !== e.id) } }))}>×</button></li>)}</ul>}
      <h3>Loại trừ nhóm máy</h3>
      <div className="gs-chipsel">
        {kinds.filter(k => k !== 'accessory').map(k => { const on = p.brief.exclude.includes(k); return <button key={k} type="button" role="checkbox" aria-checked={on} className={on ? 'is-off' : ''} onClick={() => set(q => ({ ...q, brief: { ...q.brief, exclude: on ? q.brief.exclude.filter(x => x !== k) : [...q.brief.exclude, k] } }))}>{on ? '✕ ' : ''}{KIND_LABEL[k]}</button>; })}
      </div>
      <h3>Ghi chú nhu cầu</h3>
      <textarea className="gs-textarea" rows={3} maxLength={2000} value={p.brief.notes} placeholder="Nhóm khách, giờ cao điểm, thiết bị muốn giữ…" onChange={e => { const v = e.target.value; set(q => ({ ...q, brief: { ...q.brief, notes: v } })); }} />
      <button type="button" className="s-btn s-btn--primary gs-wide" onClick={onRegenerate}><Sparkles aria-hidden="true" /> Tạo lại phương án <small>(giữ phần đã khoá)</small></button>
    </div>
  );
}

/* ---------- Mặt bằng nhiều tầng ---------- */
export function FloorsPanel({ p, floor, setFloorId, act, selectItem }: {
  p: Project; floor: Floor; setFloorId: (id: string) => void;
  act: { updateFloor: (id: string, patch: Partial<Floor>) => void; addFloor: () => void; duplicateFloor: (id: string) => void; removeFloor: (id: string) => void; addFixture: (kind: FixtureKind) => void; addLink: (kind: LinkKind, floors: string[]) => void; lockFloor: (locked: boolean) => void };
  selectItem: (id: string) => void;
}) {
  const sorted = [...p.floors].sort((a, b) => a.level - b.level);
  const total = floor.w * floor.l, usable = usableArea(p, floor);
  const [linkFloors, setLinkFloors] = useState<string[]>(sorted.map(f => f.id));
  const opt = p.options[p.active];
  const lockedAll = !!opt && [...opt.placements, ...opt.furniture].filter(x => x.floorId === floor.id).every(x => x.locked) && [...opt.placements].some(x => x.floorId === floor.id);
  return (
    <div className="gs-panel">
      <div className="gs-floors">
        {sorted.map(f => <button key={f.id} type="button" role="radio" aria-checked={f.id === floor.id} className={f.id === floor.id ? 'is-on' : ''} onClick={() => setFloorId(f.id)}><Layers aria-hidden="true" />{f.name}<small>{fmtArea(f.w * f.l)}</small></button>)}
      </div>
      <p className="gs-note">Tổng {p.floors.length} tầng, gồm tầng trệt. Đổi tầng không làm mất dữ liệu.</p>
      <div className="gs-row">
        <button type="button" className="gs-btn" onClick={act.addFloor} disabled={p.floors.length >= 5}><Plus aria-hidden="true" /> Thêm tầng</button>
        <button type="button" className="gs-btn" onClick={() => act.duplicateFloor(floor.id)} disabled={p.floors.length >= 5}><Copy aria-hidden="true" /> Sao chép</button>
        <button type="button" className="gs-btn is-danger" onClick={() => { if (confirm(`Xoá ${floor.name} và toàn bộ máy trên tầng này?`)) act.removeFloor(floor.id); }} disabled={p.floors.length <= 1}><Trash2 aria-hidden="true" /> Xoá</button>
      </div>
      <h3>{floor.name}</h3>
      <label className="gs-text"><span>Tên tầng</span><input value={floor.name} maxLength={40} onChange={e => act.updateFloor(floor.id, { name: e.target.value })} /></label>
      <div className="gs-grid3">
        <Num label="Ngang (mặt tiền)" unit="m" value={floor.w} min={3} max={80} onChange={v => act.updateFloor(floor.id, { w: v })} />
        <Num label="Sâu" unit="m" value={floor.l} min={3} max={80} onChange={v => act.updateFloor(floor.id, { l: v })} />
        <Num label="Cao trần" unit="m" value={floor.h} min={2.2} max={8} onChange={v => act.updateFloor(floor.id, { h: v })} />
      </div>
      <p className="gs-area"><b>{fmtArea(total)}</b> tổng · <b>{fmtArea(usable)}</b> còn lại để bố trí <small>(trừ vật cố định, cầu thang + chiếu nghỉ)</small></p>
      <div className="gs-grid2">
        <label className="gs-text"><span>Công năng</span><select value={floor.use} onChange={e => act.updateFloor(floor.id, { use: e.target.value as Floor['use'] })}>{Object.entries(FLOOR_USES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
        <Num label="Người tập cùng lúc" value={floor.users} min={0} max={500} step={1} onChange={v => act.updateFloor(floor.id, { users: Math.round(v) })} />
      </div>
      <label className="gs-text"><span>Ngân sách riêng của tầng</span><span className="gs-num__box"><input inputMode="numeric" value={floor.budget ? Math.round(floor.budget / 1e6) : ''} placeholder="chia từ ngân sách dự án" onChange={e => act.updateFloor(floor.id, { budget: Number(e.target.value.replace(/\D/g, '')) * 1e6 })} /><i>triệu</i></span></label>
      <h3>Vật cố định <small>bấm để thêm, kéo trên sàn để đặt</small></h3>
      <div className="gs-addgrid">
        {(Object.keys(FIXTURE_KINDS) as FixtureKind[]).map(k => <button key={k} type="button" onClick={() => act.addFixture(k)} style={{ ['--c' as string]: FIXTURE_KINDS[k].color }}><Plus aria-hidden="true" />{FIXTURE_KINDS[k].label}</button>)}
      </div>
      {floor.fixtures.length > 0 && <ul className="gs-list">{floor.fixtures.map(fx => <li key={fx.id}><button type="button" onClick={() => selectItem(fx.id)}><i style={{ background: FIXTURE_KINDS[fx.kind].color }} />{fx.label || FIXTURE_KINDS[fx.kind].label}{fx.main ? ' (cửa chính)' : ''}<small>{fx.w}×{fx.d} m</small></button></li>)}</ul>}
      <h3>Cầu thang / thang máy</h3>
      {p.floors.length < 2 ? <p className="gs-note">Thêm tầng để khai báo lõi giao thông.</p> : <>
        <div className="gs-chipsel">{sorted.map(f => { const on = linkFloors.includes(f.id); return <button key={f.id} type="button" role="checkbox" aria-checked={on} className={on ? 'is-on' : ''} onClick={() => setLinkFloors(l => on ? l.filter(x => x !== f.id) : [...l, f.id])}>{f.name}</button>; })}</div>
        <div className="gs-row">{(Object.keys(LINK_KINDS) as LinkKind[]).map(k => <button key={k} type="button" className="gs-btn" disabled={linkFloors.length < 2} onClick={() => act.addLink(k, linkFloors)}><Building2 aria-hidden="true" /> {LINK_KINDS[k].label}</button>)}</div>
        <ul className="gs-list">{p.links.map(l => <li key={l.id}><button type="button" onClick={() => selectItem(l.id)}><i style={{ background: LINK_KINDS[l.kind].color }} />{LINK_KINDS[l.kind].label}<small>{l.floors.map(id => p.floors.find(f => f.id === id)?.name).join(' ↔ ')}</small></button></li>)}</ul>
      </>}
      {opt && <button type="button" className="gs-btn gs-wide" onClick={() => act.lockFloor(!lockedAll)}>{lockedAll ? <Unlock aria-hidden="true" /> : <Lock aria-hidden="true" />} {lockedAll ? 'Mở khoá' : 'Khoá'} toàn bộ máy & nội thất {floor.name.toLowerCase()}</button>}
    </div>
  );
}

/* ---------- Thiết bị ---------- */
const PAGE = 30;
const PRICE_BANDS: { label: string; ok: (p: number) => boolean }[] = [
  { label: 'Mọi mức giá', ok: () => true }, { label: 'Dưới 20 triệu', ok: p => p > 0 && p < 20e6 }, { label: '20 – 50 triệu', ok: p => p >= 20e6 && p < 50e6 },
  { label: '50 – 100 triệu', ok: p => p >= 50e6 && p < 100e6 }, { label: 'Trên 100 triệu', ok: p => p >= 100e6 }, { label: 'Đã có giá', ok: p => p > 0 }
];
export function EquipmentPanel({ equipment, p, floor, onAdd, onMust }: { equipment: Equipment[]; p: Project; floor: Floor; onAdd: (e: Equipment) => void; onMust: (id: string) => void }) {
  const [cat, setCat] = useState<EquipmentCategory | ''>('');
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<Muscle | ''>('');
  const [band, setBand] = useState(0);
  const [sort, setSort] = useState<'' | 'asc' | 'desc'>('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState('');
  const fold = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
  const inCat = equipment.filter(e => !cat || e.category === cat);
  const shown = inCat.filter(e => (!muscle || muscleOf(e) === muscle) && PRICE_BANDS[band].ok(Number(e.price) || 0) && (!q.trim() || fold(`${e.name} ${e.sku || ''}`).includes(fold(q.trim()))));
  if (sort) shown.sort((a, b) => ((Number(a.price) || (sort === 'asc' ? Infinity : -1)) - (Number(b.price) || (sort === 'asc' ? Infinity : -1))) * (sort === 'asc' ? 1 : -1));
  const opt = p.options[p.active];
  const qty = (id: string) => opt?.placements.filter(x => x.eqId === id).length ?? 0;
  const filtered = !!(cat || muscle || band || q.trim());
  return (
    <div className="gs-panel gs-panel--list">
      <div className="gp-search"><Search aria-hidden="true" /><input type="search" value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE); }} placeholder={`Tìm trong ${equipment.length} máy (tên, mã)…`} aria-label="Tìm máy" /></div>
      <div className="gp-cats" role="radiogroup" aria-label="Nhóm máy">
        <button type="button" role="radio" aria-checked={!cat} className={!cat ? 'is-on' : ''} onClick={() => { setCat(''); setMuscle(''); setLimit(PAGE); }}>Tất cả</button>
        {(Object.keys(EQUIPMENT_CATEGORIES) as EquipmentCategory[]).filter(c => equipment.some(e => e.category === c)).map(c => <button key={c} type="button" role="radio" aria-checked={cat === c} className={cat === c ? 'is-on' : ''} onClick={() => { setCat(c); setMuscle(''); setLimit(PAGE); }}>{c === 'strength' ? 'Máy sức mạnh' : EQUIPMENT_CATEGORIES[c]}<small>{equipment.filter(e => e.category === c).length}</small></button>)}
      </div>
      {cat === 'strength' && <div className="gp-muscles">{(Object.keys(MUSCLES) as Muscle[]).map(m => { const n = inCat.filter(e => muscleOf(e) === m).length; return n ? <button key={m} type="button" role="radio" aria-checked={muscle === m} className={muscle === m ? 'is-on' : ''} onClick={() => { setMuscle(muscle === m ? '' : m); setLimit(PAGE); }}>{MUSCLES[m].label} <small>{n}</small></button> : null; })}</div>}
      <div className="gp-filterbar">
        <label className="gp-select" aria-label="Mức giá"><select value={band} onChange={e => { setBand(Number(e.target.value)); setLimit(PAGE); }}>{PRICE_BANDS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}</select><ChevronDown aria-hidden="true" /></label>
        <button type="button" className={`gp-sort${sort ? ' is-on' : ''}`} onClick={() => setSort(sort === '' ? 'asc' : sort === 'asc' ? 'desc' : '')}><ArrowDownUp aria-hidden="true" />{sort === 'asc' ? 'Giá thấp' : sort === 'desc' ? 'Giá cao' : 'Sắp xếp'}</button>
      </div>
      <p className="gp-count"><b>{shown.length}</b> máy · bấm + để thêm vào <b>{floor.name.toLowerCase()}</b>{filtered && <button type="button" onClick={() => { setCat(''); setMuscle(''); setBand(0); setQ(''); }}>Xoá lọc</button>}</p>
      <ul className="gp-eq">
        {shown.slice(0, limit).map(e => {
          const n = qty(e.id), must = p.brief.mustHave.includes(e.id);
          return (
            <li key={e.id} className={open === e.id ? 'is-open' : ''}>
              <button type="button" className="gp-eq__row" onClick={() => setOpen(open === e.id ? '' : e.id)} aria-expanded={open === e.id}>
                <span className="gp-eq__sw" style={{ background: e.color }}>{e.image ? <img src={e.image} alt="" loading="lazy" /> : null}</span>
                <span className="gp-eq__txt"><b title={e.name}>{e.name}</b><span><em className={e.price ? '' : 'is-contact'}>{e.price ? formatVND(Number(e.price)) : 'Chưa có giá'}</em>{n ? <i>Trong phương án ×{n}</i> : null}{e.dimsEstimated ? <i className="is-est">KT ước tính</i> : null}</span></span>
              </button>
              <span className="gs-eqbtns">
                <button type="button" className={`gs-star${must ? ' is-on' : ''}`} onClick={() => onMust(e.id)} aria-label={must ? `Bỏ bắt buộc ${e.name}` : `Đánh dấu bắt buộc ${e.name}`} title="Máy bắt buộc khi tạo phương án"><Star aria-hidden="true" /></button>
                <button type="button" className="gp-eq__add" onClick={() => onAdd(e)} aria-label={`Thêm ${e.name} vào ${floor.name}`}><Plus aria-hidden="true" /></button>
              </span>
              {open === e.id && (
                <div className="gp-eq__more">
                  {e.image && <img src={e.image} alt={e.name} loading="lazy" />}
                  <dl>{e.sku && <><dt>Mã</dt><dd>{e.sku}</dd></>}{e.kind && <><dt>Loại</dt><dd>{KIND_LABEL[e.kind]}</dd></>}<dt>Kích thước</dt><dd>{e.width} × {e.depth} × {e.height} cm{e.dimsEstimated ? ' (ước tính, cần xác minh)' : ''}</dd></dl>
                  {e.source && <a href={e.source} target="_blank" rel="noopener">Xem chi tiết <ExternalLink aria-hidden="true" /></a>}
                </div>
              )}
            </li>
          );
        })}
        {shown.length > limit && <li className="gp-eq__moreBtn"><button type="button" onClick={() => setLimit(l => l + PAGE)}>Xem thêm {Math.min(PAGE, shown.length - limit)} máy</button></li>}
        {shown.length === 0 && <li className="gp-eq__none">Không có máy nào khớp.</li>}
      </ul>
      <p className="gp-src">Danh mục, giá và hình ảnh: đối tác <a href="https://thietbigym.vn/" target="_blank" rel="noopener">thietbigym.vn</a></p>
    </div>
  );
}

/* ---------- Lễ tân & đón tiếp ---------- */
export function ReceptionPanel({ p, set }: { p: Project; set: (patch: Partial<Reception>) => void }) {
  const r = p.reception;
  return (
    <div className="gs-panel">
      <Toggle on={r.enabled} onChange={v => set({ enabled: v })}><b>Bật mô-đun Lễ tân & đón tiếp</b></Toggle>
      {r.enabled && <>
        <label className="gs-text"><span>Tầng đặt quầy chính</span><select value={r.floorId} onChange={e => set({ floorId: e.target.value })}>{p.floors.map(f => <option key={f.id} value={f.id}>{f.name}{f.fixtures.some(x => x.kind === 'door' && x.main) ? ' (có cửa chính)' : ''}</option>)}</select></label>
        <h3>Kiểu quầy</h3>
        <Seg label="Kiểu quầy" value={r.shape} options={[['straight', 'Thẳng'], ['l', 'Chữ L'], ['compact', 'Nhỏ gọn']]} onChange={v => set({ shape: v })} />
        <h3>Quy mô sảnh</h3>
        <Seg label="Quy mô" value={r.size} options={(Object.keys(RECEPTION_SIZES) as ('s' | 'm' | 'l')[]).map(k => [k, `${RECEPTION_SIZES[k].label} · ${RECEPTION_SIZES[k].width}×${RECEPTION_SIZES[k].depth} m`])} onChange={v => set({ size: v })} />
        <div className="gs-grid2">
          <label className="gs-text"><span>Màu quầy / vách</span><input type="color" value={r.color} onChange={e => set({ color: e.target.value })} /></label>
          <label className="gs-text"><span>Vật liệu mặt quầy</span><select value={r.material} onChange={e => set({ material: e.target.value as Reception['material'] })}><option value="wood">Gỗ</option><option value="stone">Đá</option><option value="white">Trắng mờ</option><option value="metal">Kim loại</option></select></label>
        </div>
        <h3>Logo</h3>
        <Seg label="Vị trí logo" value={r.logo} options={[['wall', 'Trên vách'], ['desk', 'Mặt quầy'], ['none', 'Không']]} onChange={v => set({ logo: v })} />
        <div className="gs-toggles">
          <Toggle on={r.wall} onChange={v => set({ wall: v })}>Vách nhận diện</Toggle>
          <Toggle on={r.lights} onChange={v => set({ lights: v })}>Đèn hắt quầy / vách</Toggle>
          <Toggle on={r.storage} onChange={v => set({ storage: v })}>Tủ lưu trữ sau quầy</Toggle>
          <Toggle on={r.kiosk} onChange={v => set({ kiosk: v })}>Điểm check-in QR / DANAVA Studio</Toggle>
          <Toggle on={r.consult} onChange={v => set({ consult: v })}>Bàn tư vấn (góc riêng)</Toggle>
          <Toggle on={r.display} onChange={v => set({ display: v })}>Kệ trưng bày sản phẩm</Toggle>
        </div>
        <Num label="Ghế chờ" value={r.seats} min={0} max={12} step={1} onChange={v => set({ seats: Math.round(v) })} />
        <label className="gs-text"><span>Quầy phụ (khi có lý do vận hành: tầng PT riêng, cửa phụ…)</span><select value={r.secondaryFloorId ?? ''} onChange={e => set({ secondaryFloorId: e.target.value || undefined })}><option value="">Không cần</option>{p.floors.filter(f => f.id !== r.floorId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
        <div className="gs-flows">
          <p><i className="is-member" /> <b>Hội viên:</b> cửa → check-in nhanh (kiosk) → thay đồ / khu tập</p>
          <p><i className="is-guest" /> <b>Khách mới:</b> cửa → ghế chờ / bàn tư vấn → tham quan, tập thử</p>
          <small>Hai luồng tách hai bên sảnh để người chờ tư vấn không đứng chắn người check-in. Sảnh được dành chỗ trước khi xếp máy.</small>
        </div>
      </>}
    </div>
  );
}

/* ---------- Phong cách & trang trí ---------- */
const DECOR: FurnKind[] = ['plant', 'mirror', 'linear-light', 'mat-zone', 'turf', 'rest-bench', 'water', 'display'];
export function StylePanel({ p, floor, set, addDecor }: { p: Project; floor: Floor; set: (fn: (p: Project) => Project) => void; addDecor: (k: FurnKind) => void }) {
  return (
    <div className="gs-panel">
      <h3>Phong cách nội thất <small>dùng chung toàn công trình</small></h3>
      <div className="gs-cards gs-cards--style">
        {(Object.keys(INTERIOR_STYLES) as InteriorStyle[]).map(k => { const s = INTERIOR_STYLES[k]; return (
          <button key={k} type="button" role="radio" aria-checked={p.brief.interior === k} className={p.brief.interior === k ? 'is-on' : ''} onClick={() => set(q => ({ ...q, brief: { ...q.brief, interior: k } }))}>
            <span className="gs-swatch">{[s.floor, s.wall, s.accentWall, s.wood, s.turf].map(c => <i key={c} style={{ background: c }} />)}</span>
            <b>{s.label}</b><small>{s.hint}</small>
          </button>); })}
      </div>
      <h3>Thương hiệu</h3>
      <div className="gs-grid2">
        <label className="gs-text"><span>Chữ logo</span><input maxLength={24} value={p.brand.logoText} onChange={e => { const v = e.target.value; set(q => ({ ...q, brand: { ...q.brand, logoText: v } })); }} /></label>
        <label className="gs-text"><span>Màu nhấn</span><input type="color" value={p.brand.accent} onChange={e => { const v = e.target.value; set(q => ({ ...q, brand: { ...q.brand, accent: v } })); }} /></label>
      </div>
      <h3>Điểm nhấn riêng {floor.name.toLowerCase()}</h3>
      <div className="gs-row">
        <label className="gs-text"><span>Màu tường nhấn</span><input type="color" value={floor.accent || INTERIOR_STYLES[p.brief.interior].accentWall} onChange={e => { const v = e.target.value; set(q => ({ ...q, floors: q.floors.map(f => (f.id === floor.id ? { ...f, accent: v } : f)) })); }} /></label>
        {floor.accent && <button type="button" className="gs-btn" onClick={() => set(q => ({ ...q, floors: q.floors.map(f => (f.id === floor.id ? { ...f, accent: undefined } : f)) }))}>Theo phong cách chung</button>}
      </div>
      <h3>Thêm trang trí vào {floor.name.toLowerCase()}</h3>
      <div className="gs-addgrid">{DECOR.map(k => <button key={k} type="button" onClick={() => addDecor(k)}><Plus aria-hidden="true" />{FURNITURE[k].label}</button>)}</div>
      <p className="gs-note">Phong cách tối vẫn giữ máy, biển chỉ dẫn và lối đi đủ sáng (đèn tuyến tính, sàn có vạch).</p>
    </div>
  );
}

/* ---------- Chi phí theo tầng ---------- */
export function CostTable({ cost }: { cost: ProjectCost }) {
  return (
    <div className="gs-cost">
      {cost.floors.map(f => (
        <details key={f.floorId} open={cost.floors.length === 1}>
          <summary><b>{f.name}</b><span>{formatVND(f.priced)}{f.unpriced.length ? ` · ${f.unpriced.reduce((s, l) => s + l.qty, 0)} máy chưa có giá` : ''}</span></summary>
          <table className="gp-table">
            <thead><tr><th>Hạng mục</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
            <tbody>
              {f.lines.map(l => <tr key={l.eq.id}><td>{l.eq.name}{l.eq.dimsEstimated ? <small className="gs-est"> · KT ước tính</small> : null}</td><td>{l.qty}</td><td>{l.unit === null ? <span className="gp-contact">Chưa có giá</span> : formatVND(l.unit)}</td><td>{l.total === null ? <span className="gp-contact">Liên hệ</span> : formatVND(l.total)}</td></tr>)}
              {f.flooring && <tr><td>Thảm sàn cao su ({fmtArea(f.flooring.m2)})</td><td>{f.flooring.tiles}</td><td>{f.flooring.unit ? formatVND(f.flooring.unit) : 'Chưa có giá'}</td><td>{f.flooring.total ? formatVND(f.flooring.total) : 'Liên hệ'}</td></tr>}
              {f.furniture.map(x => <tr key={x.kind} className="is-est"><td>{x.label} <small>(giả định)</small></td><td>{x.qty || ''}</td><td colSpan={2}>{x.est ? `${shortVND(x.est[0])} – ${shortVND(x.est[1])}` : 'Liên hệ'}</td></tr>)}
            </tbody>
          </table>
        </details>
      ))}
      <dl className="gs-totals">
        <div><dt>Thiết bị + thảm sàn đã có giá</dt><dd>{formatVND(cost.priced)}</dd></div>
        {cost.unpricedCount > 0 && <div className="is-warn"><dt>Thiết bị chưa có giá (chưa tính)</dt><dd>{cost.unpricedCount} máy</dd></div>}
        <div><dt>Nội thất, lễ tân, trang trí <small>khoảng tham khảo, giả định</small></dt><dd>{shortVND(cost.furnEst[0])} – {shortVND(cost.furnEst[1])}</dd></div>
        <div className="is-total"><dt>Phạm vi chi phí dự kiến</dt><dd>{shortVND(cost.range[0])} – {shortVND(cost.range[1])}{cost.unpricedCount ? ' + máy chưa có giá' : ''}</dd></div>
        {cost.budget > 0 && <div className={cost.overBudget ? 'is-bad' : 'is-ok'}><dt>Ngân sách dự án</dt><dd>{formatVND(cost.budget)} · {cost.overBudget ? `vượt ${formatVND(cost.priced - cost.budget)}` : `còn ${formatVND(cost.budget - cost.priced)}`}</dd></div>}
      </dl>
    </div>
  );
}

export const STRATEGY_LIST = Object.keys(STRATEGIES) as Strategy[];
