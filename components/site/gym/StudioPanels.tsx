'use client';
/** Các bảng điều khiển của phòng lab thiết kế phòng tập (components/site/gym/GymStudio.tsx). */
import { useState, type FormEvent, type ReactNode } from 'react';
import { Archive, ArrowDownUp, ArrowUpDown, Ban, Lightbulb, MessagesSquare, Minus, PanelsTopLeft, QrCode, ShoppingBag, Dumbbell, Flame, Leaf, UserRound, Weight, Building2, ChevronDown, Copy, DoorOpen, ExternalLink, Footprints, Layers, Lock, LogOut, Package, PanelTop, Plug, Plus, Search, Shapes, Shirt, Sparkles, Square, Star, Toilet, Trash2, Unlock, type LucideIcon } from 'lucide-react';
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
      <h2>Phòng tập của bạn rộng bao nhiêu?</h2>
      <div className="gs-start__areas">
        {Array.from({ length: n }, (_, i) => <Num key={i} label={n > 1 ? (i === 0 ? 'Tầng trệt' : `Tầng ${i + 1}`) : 'Diện tích'} value={areas[i]} min={20} max={2000} step={5} unit="m²" onChange={v => setAreas(a => a.map((x, j) => (j === i ? v : x)))} />)}
      </div>
      <button type="submit" className="s-btn s-btn--primary s-btn--lg gs-start__go"><Sparkles aria-hidden="true" /> Xem phòng tập gợi ý</button>
      <details className="gs-start__opts"><summary>Thêm lựa chọn: loại phòng, số tầng, ngân sách</summary>
      <fieldset><legend>Loại phòng tập</legend>
        <div className="gs-cards gs-cards--start">
          {(Object.keys(BUSINESS_MODELS) as BusinessModel[]).map(k => (
            <button key={k} type="button" role="radio" aria-checked={model === k} className={model === k ? 'is-on' : ''} onClick={() => setModel(k)}><b>{BUSINESS_MODELS[k].label}</b></button>
          ))}
        </div>
      </fieldset>
      <fieldset><legend>Số tầng <small>(tính cả tầng trệt)</small></legend>
        <Seg label="Số tầng" value={String(n)} options={[1, 2, 3, 4, 5].map(i => [String(i), `${i}`] as [string, string])} onChange={v => setN(Number(v))} />
      </fieldset>
      <fieldset><legend>Ngân sách dự kiến</legend>
        <div className="gs-budgetrow">
          <button type="button" role="radio" aria-checked={noBudget} className={`gs-chip${noBudget ? ' is-on' : ''}`} onClick={() => setNoBudget(true)}>Chưa xác định</button>
          <label className={`gs-budget${noBudget ? ' is-dim' : ''}`}><input inputMode="decimal" value={budget} placeholder="vd 800" onFocus={() => setNoBudget(false)} onChange={e => { setBudget(e.target.value.replace(/[^\d.,]/g, '').slice(0, 8)); setNoBudget(false); }} aria-label="Ngân sách (triệu đồng)" /> triệu đồng</label>
        </div>
      </fieldset>
      </details>
      {aiNote}
    </form>
  );
}

/* ---------- Nhu cầu ---------- */
const MODEL_TILE: Record<BusinessModel, [LucideIcon, string]> = { gym: [Dumbbell, 'Tổng hợp'], pt: [UserRound, 'PT'], strength: [Weight, 'Sức mạnh'], boutique: [Flame, 'Boutique'], wellness: [Leaf, 'Wellness'] };
export function BriefPanel({ p, set, onRegenerate, equipment }: { p: Project; set: (fn: (p: Project) => Project) => void; onRegenerate: () => void; equipment: Equipment[] }) {
  const kinds = [...new Set(equipment.map(e => e.kind).filter(Boolean))] as EquipmentKind[];
  const must = p.brief.mustHave.map(id => equipment.find(e => e.id === id)).filter((e): e is Equipment => !!e);
  const noBudget = !p.brief.budget;
  return (
    <div className="gs-panel gs-brief">
      <h3>Mô hình</h3>
      <div className="gs-tiles gs-tiles--model" role="radiogroup" aria-label="Mô hình kinh doanh">
        {(Object.keys(BUSINESS_MODELS) as BusinessModel[]).map(k => { const [Ic, short] = MODEL_TILE[k]; return <button key={k} type="button" role="radio" aria-checked={p.brief.model === k} className={p.brief.model === k ? 'is-on' : ''} title={`${BUSINESS_MODELS[k].label}: ${BUSINESS_MODELS[k].hint}`} onClick={() => set(q => ({ ...q, brief: { ...q.brief, model: k } }))}><Ic aria-hidden="true" /><span>{short}</span></button>; })}
      </div>
      <h3>Ngân sách</h3>
      <div className="gs-budgetrow">
        <button type="button" role="radio" aria-checked={noBudget} className={`gs-chip${noBudget ? ' is-on' : ''}`} onClick={() => set(q => ({ ...q, brief: { ...q.brief, budget: 0 } }))}>Không giới hạn</button>
        <span className="gs-num__box gs-budgetbox"><input inputMode="numeric" value={p.brief.budget ? Math.round(p.brief.budget / 1e6) : ''} placeholder="vd 800" aria-label="Ngân sách (triệu đồng)" onChange={e => { const v = Number(e.target.value.replace(/D/g, '')) * 1e6; set(q => ({ ...q, brief: { ...q.brief, budget: v } })); }} /><i>triệu</i></span>
      </div>
      {must.length > 0 && <>
        <h3>Máy bắt buộc</h3>
        <ul className="gs-chips">{must.map(e => <li key={e.id}>{e.name}<button type="button" aria-label={`Bỏ bắt buộc ${e.name}`} onClick={() => set(q => ({ ...q, brief: { ...q.brief, mustHave: q.brief.mustHave.filter(x => x !== e.id) } }))}>×</button></li>)}</ul>
      </>}
      <details className="gs-fold">
        <summary>Loại trừ nhóm máy{p.brief.exclude.length ? <b>{p.brief.exclude.length}</b> : null}</summary>
        <div className="gs-chipsel">
          {kinds.filter(k => k !== 'accessory').map(k => { const on = p.brief.exclude.includes(k); return <button key={k} type="button" role="checkbox" aria-checked={on} className={on ? 'is-off' : ''} onClick={() => set(q => ({ ...q, brief: { ...q.brief, exclude: on ? q.brief.exclude.filter(x => x !== k) : [...q.brief.exclude, k] } }))}>{on ? '✕ ' : ''}{KIND_LABEL[k]}</button>; })}
        </div>
      </details>
      <details className="gs-fold">
        <summary>Ghi chú{p.brief.notes.trim() ? <b>✓</b> : null}</summary>
        <textarea className="gs-textarea" rows={3} maxLength={2000} value={p.brief.notes} placeholder="Nhóm khách, giờ cao điểm, thiết bị muốn giữ…" onChange={e => { const v = e.target.value; set(q => ({ ...q, brief: { ...q.brief, notes: v } })); }} />
      </details>
      <button type="button" className="s-btn s-btn--primary gs-wide gs-regen" onClick={onRegenerate} title="Giữ nguyên máy và nội thất đã khoá"><Sparkles aria-hidden="true" /> Tạo lại phương án</button>
    </div>
  );
}

/* ---------- Mặt bằng nhiều tầng ---------- */
export function FloorsPanel({ p, floor, setFloorId, act, selectItem }: {
  p: Project; floor: Floor; setFloorId: (id: string) => void;
  act: { updateFloor: (id: string, patch: Partial<Floor>) => void; addFloor: () => void; duplicateFloor: (id: string) => void; removeFloor: (id: string) => void; addFixture: (kind: FixtureKind) => void; addLink: (kind: LinkKind, floors: string[]) => void; lockFloor: (locked: boolean) => void; regenerate: () => void };
  selectItem: (id: string) => void;
}) {
  const sorted = [...p.floors].sort((a, b) => a.level - b.level);
  const total = floor.w * floor.l, usable = usableArea(p, floor);
  const [linkFloors, setLinkFloors] = useState<string[]>(sorted.map(f => f.id));
  // Đổi công năng / số người / ngân sách tầng chỉ có tác dụng khi xếp lại máy → hiện nút ngay khi khách đổi
  const [dirty, setDirty] = useState(false);
  const upd = (patch: Partial<Floor>) => { act.updateFloor(floor.id, patch); setDirty(true); };
  const opt = p.options[p.active];
  const lockedAll = !!opt && [...opt.placements, ...opt.furniture].filter(x => x.floorId === floor.id).every(x => x.locked) && [...opt.placements].some(x => x.floorId === floor.id);
  return (
    <div className="gs-panel gs-floorp">
      <div className="gs-floorbar">
        <div className="gs-floorseg" role="radiogroup" aria-label="Tầng">
          {sorted.map(f => <button key={f.id} type="button" role="radio" aria-checked={f.id === floor.id} className={f.id === floor.id ? 'is-on' : ''} onClick={() => setFloorId(f.id)} title={`${f.name} · ${fmtArea(f.w * f.l)}`}>{f.level === 0 ? 'Trệt' : `T${f.level + 1}`}</button>)}
        </div>
        <button type="button" className="gs-icon" onClick={act.addFloor} disabled={p.floors.length >= 5} title="Thêm tầng" aria-label="Thêm tầng"><Plus /></button>
        <button type="button" className="gs-icon" onClick={() => act.duplicateFloor(floor.id)} disabled={p.floors.length >= 5} title={`Sao chép ${floor.name.toLowerCase()}`} aria-label="Sao chép tầng"><Copy /></button>
        <button type="button" className="gs-icon is-danger" onClick={() => { if (confirm(`Xoá ${floor.name} và toàn bộ máy trên tầng này?`)) act.removeFloor(floor.id); }} disabled={p.floors.length <= 1} title={`Xoá ${floor.name.toLowerCase()}`} aria-label="Xoá tầng"><Trash2 /></button>
      </div>
      <div className="gs-grid3 gs-dims">
        <Num label="Ngang" unit="m" value={floor.w} min={3} max={80} onChange={v => act.updateFloor(floor.id, { w: v })} />
        <Num label="Sâu" unit="m" value={floor.l} min={3} max={80} onChange={v => act.updateFloor(floor.id, { l: v })} />
        <Num label="Cao" unit="m" value={floor.h} min={2.2} max={8} onChange={v => act.updateFloor(floor.id, { h: v })} />
      </div>
      <p className="gs-area"><b>{fmtArea(total)}</b> · còn {fmtArea(usable)} để đặt máy</p>
      <details className="gs-fold">
        <summary>Công năng & ngân sách tầng</summary>
        <p className="gs-note">Dùng khi xếp máy cho tầng: loại máy, số máy, mức giá.</p>
        <label className="gs-text"><span>Tên tầng</span><input value={floor.name} maxLength={40} onChange={e => act.updateFloor(floor.id, { name: e.target.value })} /></label>
        <div className="gs-grid2">
          <label className="gs-text"><span>Công năng</span><select value={floor.use} onChange={e => upd({ use: e.target.value as Floor['use'] })}>{Object.entries(FLOOR_USES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
          <Num label="Người tập cùng lúc (0 = tự tính)" value={floor.users} min={0} max={500} step={1} onChange={v => upd({ users: Math.round(v) })} />
        </div>
        <label className="gs-text"><span>Ngân sách riêng (triệu)</span><span className="gs-num__box"><input inputMode="numeric" value={floor.budget ? Math.round(floor.budget / 1e6) : ''} placeholder="chia từ ngân sách dự án" onChange={e => upd({ budget: Number(e.target.value.replace(/D/g, '')) * 1e6 })} /><i>triệu</i></span></label>
        {dirty && <button type="button" className="s-btn s-btn--primary gs-wide" onClick={() => { act.regenerate(); setDirty(false); }}><Sparkles aria-hidden="true" /> Xếp lại máy theo thông tin này</button>}
      </details>
      <h3>Vật cố định <small>bấm để thêm, kéo để đặt</small></h3>
      <div className="gs-tiles">
        {(Object.keys(FIXTURE_KINDS) as FixtureKind[]).map(k => { const [Ic, short] = FIX_TILE[k]; return <button key={k} type="button" onClick={() => act.addFixture(k)} title={`Thêm ${FIXTURE_KINDS[k].label.toLowerCase()}`} style={{ ['--c' as string]: FIXTURE_KINDS[k].color }}><Ic aria-hidden="true" /><span>{short}</span></button>; })}
      </div>
      {floor.fixtures.length > 0 && <div className="gs-placed">{floor.fixtures.map(fx => { const [Ic] = FIX_TILE[fx.kind]; return <button key={fx.id} type="button" onClick={() => selectItem(fx.id)} title={`${fx.label || FIXTURE_KINDS[fx.kind].label}${fx.main ? ' (cửa chính)' : ''} · ${fx.w}×${fx.d} m`} style={{ ['--c' as string]: FIXTURE_KINDS[fx.kind].color }}><Ic aria-hidden="true" />{fx.main ? <b>chính</b> : null}</button>; })}</div>}
      {p.floors.length > 1 && <>
        <h3>Cầu thang / thang máy <small>nối các tầng đã chọn</small></h3>
        <div className="gs-linkrow">
          <div className="gs-chipsel">{sorted.map(f => { const on = linkFloors.includes(f.id); return <button key={f.id} type="button" role="checkbox" aria-checked={on} className={on ? 'is-on' : ''} onClick={() => setLinkFloors(l => on ? l.filter(x => x !== f.id) : [...l, f.id])}>{f.level === 0 ? 'Trệt' : `T${f.level + 1}`}</button>; })}</div>
          {(Object.keys(LINK_KINDS) as LinkKind[]).map(k => { const Ic = k === 'stairs' ? Footprints : ArrowUpDown; return <button key={k} type="button" className="gs-tilebtn" disabled={linkFloors.length < 2} onClick={() => act.addLink(k, linkFloors)} title={`Thêm ${LINK_KINDS[k].label.toLowerCase()}`}><Ic aria-hidden="true" /><span>{k === 'stairs' ? 'Thang bộ' : 'Thang máy'}</span></button>; })}
        </div>
        {p.links.length > 0 && <div className="gs-placed">{p.links.map(l => { const Ic = l.kind === 'stairs' ? Footprints : ArrowUpDown; return <button key={l.id} type="button" onClick={() => selectItem(l.id)} title={`${LINK_KINDS[l.kind].label}: ${l.floors.map(id => p.floors.find(f => f.id === id)?.name).join(' ↔ ')}`} style={{ ['--c' as string]: LINK_KINDS[l.kind].color }}><Ic aria-hidden="true" /></button>; })}</div>}
      </>}
      {opt && <button type="button" className="gs-lock" onClick={() => act.lockFloor(!lockedAll)}>{lockedAll ? <Unlock aria-hidden="true" /> : <Lock aria-hidden="true" />} {lockedAll ? 'Mở khoá' : 'Khoá'} cả tầng</button>}
    </div>
  );
}

/** Icon + tên ngắn cho ô vật cố định */
const FIX_TILE: Record<FixtureKind, [LucideIcon, string]> = { door: [DoorOpen, 'Cửa'], exit: [LogOut, 'Thoát hiểm'], window: [PanelTop, 'Cửa sổ'], column: [Square, 'Cột'], wc: [Toilet, 'WC'], locker: [Shirt, 'Thay đồ'], storage: [Package, 'Kho'], void: [Ban, 'Không dùng'], outlet: [Plug, 'Ổ điện'], other: [Shapes, 'Khác'] };

/* ---------- Thiết bị ---------- */
const PAGE = 30;
const PRICE_BANDS: { label: string; ok: (p: number) => boolean }[] = [
  { label: 'Mọi mức giá', ok: () => true }, { label: 'Dưới 20 triệu', ok: p => p > 0 && p < 20e6 }, { label: '20 – 50 triệu', ok: p => p >= 20e6 && p < 50e6 },
  { label: '50 – 100 triệu', ok: p => p >= 50e6 && p < 100e6 }, { label: 'Trên 100 triệu', ok: p => p >= 100e6 }, { label: 'Đã có giá', ok: p => p > 0 }
];
export function EquipmentPanel({ equipment, p, floor, onAdd, onMust, simple }: { equipment: Equipment[]; p: Project; floor: Floor; onAdd: (e: Equipment) => void; onMust: (id: string) => void; simple?: boolean }) {
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
      {!simple && <div className="gp-filterbar">
        <label className="gp-select" aria-label="Mức giá"><select value={band} onChange={e => { setBand(Number(e.target.value)); setLimit(PAGE); }}>{PRICE_BANDS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}</select><ChevronDown aria-hidden="true" /></label>
        <button type="button" className={`gp-sort${sort ? ' is-on' : ''}`} onClick={() => setSort(sort === '' ? 'asc' : sort === 'asc' ? 'desc' : '')}><ArrowDownUp aria-hidden="true" />{sort === 'asc' ? 'Giá thấp' : sort === 'desc' ? 'Giá cao' : 'Sắp xếp'}</button>
      </div>}
      {!simple && <p className="gp-count"><b>{shown.length}</b> máy · bấm + để thêm vào <b>{floor.name.toLowerCase()}</b>{filtered && <button type="button" onClick={() => { setCat(''); setMuscle(''); setBand(0); setQ(''); }}>Xoá lọc</button>}</p>}
      <ul className="gp-eq">
        {shown.slice(0, limit).map(e => {
          const n = qty(e.id), must = p.brief.mustHave.includes(e.id);
          return (
            <li key={e.id} className={open === e.id ? 'is-open' : ''}>
              <button type="button" className="gp-eq__row" onClick={() => setOpen(open === e.id ? '' : e.id)} aria-expanded={open === e.id}>
                <span className="gp-eq__sw" style={{ background: e.color }}>{e.image ? <img src={e.image} alt="" loading="lazy" /> : null}</span>
                <span className="gp-eq__txt"><b title={e.name}>{e.name}</b><span><em className={e.price ? '' : 'is-contact'}>{e.price ? formatVND(Number(e.price)) : 'Chưa có giá'}</em>{n ? <i>Trong phòng ×{n}</i> : null}{e.dimsEstimated && !simple ? <i className="is-est">KT ước tính</i> : null}</span></span>
              </button>
              <span className="gs-eqbtns">
                {!simple && <button type="button" className={`gs-star${must ? ' is-on' : ''}`} onClick={() => onMust(e.id)} aria-label={must ? `Bỏ bắt buộc ${e.name}` : `Đánh dấu bắt buộc ${e.name}`} title="Máy bắt buộc khi tạo phương án"><Star aria-hidden="true" /></button>}
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
      {!simple && <p className="gp-src">Danh mục, giá và hình ảnh: đối tác <a href="https://thietbigym.vn/" target="_blank" rel="noopener">thietbigym.vn</a></p>}
    </div>
  );
}

/* ---------- Lễ tân & đón tiếp ---------- */
const REC_COLORS = ['#13244f', '#1f2937', '#ffffff', '#b07a46', '#f26b1d', '#2f6f5e'];
const REC_FEATURES: [keyof Pick<Reception, 'wall' | 'lights' | 'storage' | 'kiosk' | 'consult' | 'display'>, LucideIcon, string, string][] = [
  ['wall', PanelsTopLeft, 'Vách', 'Vách nhận diện'], ['lights', Lightbulb, 'Đèn', 'Đèn hắt quầy / vách'], ['storage', Archive, 'Tủ', 'Tủ lưu trữ sau quầy'],
  ['kiosk', QrCode, 'Check-in', 'Điểm check-in QR / DANAVA Studio'], ['consult', MessagesSquare, 'Tư vấn', 'Bàn tư vấn (góc riêng)'], ['display', ShoppingBag, 'Trưng bày', 'Kệ trưng bày sản phẩm']
];
export function ReceptionPanel({ p, set }: { p: Project; set: (patch: Partial<Reception>) => void }) {
  const r = p.reception;
  return (
    <div className="gs-panel gs-rec">
      <label className="gs-switch"><span>Lễ tân & đón tiếp</span><input type="checkbox" role="switch" checked={r.enabled} onChange={e => set({ enabled: e.target.checked })} /><i aria-hidden="true" /></label>
      {r.enabled && <>
        <div className="gs-recrow"><span>Quầy</span><Seg label="Kiểu quầy" value={r.shape} options={[['straight', 'Thẳng'], ['l', 'Chữ L'], ['compact', 'Nhỏ gọn']]} onChange={v => set({ shape: v })} /></div>
        <div className="gs-recrow"><span>Sảnh</span><Seg label="Quy mô sảnh" value={r.size} options={(Object.keys(RECEPTION_SIZES) as ('s' | 'm' | 'l')[]).map(k => [k, <span key={k} title={`${RECEPTION_SIZES[k].width} × ${RECEPTION_SIZES[k].depth} m`}>{RECEPTION_SIZES[k].label}</span>])} onChange={v => set({ size: v })} /></div>
        <div className="gs-recrow"><span>Logo</span><Seg label="Vị trí logo" value={r.logo} options={[['wall', 'Vách'], ['desk', 'Quầy'], ['none', 'Không']]} onChange={v => set({ logo: v })} /></div>
        <div className="gs-recrow"><span>Màu</span>
          <div className="gs-swatches" role="radiogroup" aria-label="Màu quầy / vách">
            {REC_COLORS.map(c => <button key={c} type="button" role="radio" aria-checked={r.color === c} className={r.color === c ? 'is-on' : ''} style={{ background: c }} onClick={() => set({ color: c })} aria-label={c} />)}
            <label className="gs-swatch-more" title="Màu khác"><input type="color" value={r.color} onChange={e => set({ color: e.target.value })} />+</label>
          </div>
          <select className="gs-minisel" value={r.material} onChange={e => set({ material: e.target.value as Reception['material'] })} aria-label="Vật liệu mặt quầy"><option value="wood">Gỗ</option><option value="stone">Đá</option><option value="white">Trắng</option><option value="metal">Kim loại</option></select>
        </div>
        <div className="gs-tiles gs-tiles--rec">
          {REC_FEATURES.map(([k, Ic, short, full]) => <button key={k} type="button" role="checkbox" aria-checked={r[k]} className={r[k] ? 'is-on' : ''} title={full} onClick={() => set({ [k]: !r[k] } as Partial<Reception>)}><Ic aria-hidden="true" /><span>{short}</span></button>)}
        </div>
        <div className="gs-recrow"><span>Ghế chờ</span>
          <div className="gs-stepper">
            <button type="button" aria-label="Bớt ghế" disabled={r.seats <= 0} onClick={() => set({ seats: r.seats - 1 })}><Minus /></button>
            <b>{r.seats}</b>
            <button type="button" aria-label="Thêm ghế" disabled={r.seats >= 12} onClick={() => set({ seats: r.seats + 1 })}><Plus /></button>
          </div>
        </div>
        {p.floors.length > 1 && (
          <details className="gs-fold">
            <summary>Nâng cao: tầng đặt quầy, quầy phụ</summary>
            <label className="gs-text"><span>Tầng đặt quầy chính</span><select value={r.floorId} onChange={e => set({ floorId: e.target.value })}>{p.floors.map(f => <option key={f.id} value={f.id}>{f.name}{f.fixtures.some(x => x.kind === 'door' && x.main) ? ' (cửa chính)' : ''}</option>)}</select></label>
            <label className="gs-text"><span>Quầy phụ</span><select value={r.secondaryFloorId ?? ''} onChange={e => set({ secondaryFloorId: e.target.value || undefined })}><option value="">Không cần</option>{p.floors.filter(f => f.id !== r.floorId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
          </details>
        )}
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
