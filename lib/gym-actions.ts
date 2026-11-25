/**
 * Thao tác mà trợ lý thiết kế (ANNA – Gemini) được phép đề xuất. AI KHÔNG sửa dữ liệu trực tiếp:
 *   1. Gemini trả JSON theo lược đồ ACTION_SCHEMA (danh sách thao tác + lời giải thích + câu hỏi còn thiếu).
 *   2. Máy chủ / trình duyệt chuẩn hoá bằng sanitizeActions (bỏ thao tác lạ, kẹp giá trị).
 *   3. applyActions chạy từng thao tác qua lib/gym-edit.ts (cùng hàm với giao diện), giữ phần đã khoá, tạo lại phương án khi cần,
 *      rồi bộ kiểm tra hình học + chi phí đánh giá kết quả. Khách xem trước → áp dụng → hoàn tác được.
 * Có bộ đọc nhu cầu dự phòng không dùng AI (ruleBasedActions) khi chưa cấu hình khoá API / hết lượt / mất mạng.
 */
import type { Equipment, Flooring } from './equipment.ts';
import { BUSINESS_MODELS, FIXTURE_KINDS, FLOOR_USES, LINK_KINDS, STRATEGIES, activeOption, type BusinessModel, type FixtureKind, type Floor, type FloorUse, type InteriorStyle, type LinkKind, type Project, type Reception, type Strategy } from './gym-project.ts';
import { generateOption, generateOptions, selectEquipment } from './gym-layout.ts';
import { validateOption } from './gym-geometry.ts';
import { costOf } from './gym-cost.ts';
import * as E from './gym-edit.ts';

export type Action =
  | { type: 'set_model'; model: BusinessModel }
  | { type: 'set_budget'; million: number }
  | { type: 'reduce_cost'; percent: number }
  | { type: 'set_interior'; style: InteriorStyle }
  | { type: 'set_strategy'; option: 'A' | 'B' | 'C' | 'current'; strategy: Strategy }
  | { type: 'set_floor'; floor: number; w?: number; l?: number; h?: number; use?: FloorUse; users?: number; budget_million?: number; accent?: string }
  | { type: 'add_floor'; area?: number }
  | { type: 'remove_floor'; floor: number }
  | { type: 'add_fixture'; floor: number; kind: FixtureKind; wall?: 'front' | 'back' | 'left' | 'right' }
  | { type: 'add_link'; kind: LinkKind; floors: number[] }
  | { type: 'set_reception'; enabled?: boolean; shape?: Reception['shape']; size?: Reception['size']; color?: string; material?: Reception['material']; logo?: Reception['logo']; seats?: number; consult?: boolean; kiosk?: boolean; display?: boolean; storage?: boolean; wall?: boolean; lights?: boolean; floor?: number }
  | { type: 'set_brand'; logo_text?: string; accent?: string }
  | { type: 'must_have'; query: string }
  | { type: 'exclude_kind'; kind: string; on: boolean }
  | { type: 'add_equipment'; query: string; floor: number; count: number }
  | { type: 'remove_equipment'; query: string; floor?: number }
  | { type: 'move_equipment'; query: string; to_floor: number }
  | { type: 'lock'; floor?: number; on: boolean }
  | { type: 'regenerate' };

export type AssistantReply = { reply: string; questions: string[]; actions: Action[]; brief?: { summary: string } };

const MODELS = Object.keys(BUSINESS_MODELS) as BusinessModel[];
const STYLES: InteriorStyle[] = ['industrial', 'warm', 'wellness'];
const STRATS = Object.keys(STRATEGIES) as Strategy[];
const USES = Object.keys(FLOOR_USES) as FloorUse[];
const FIX = Object.keys(FIXTURE_KINDS) as FixtureKind[];
const KINDS = ['treadmill', 'bike', 'recumbent', 'elliptical', 'rower', 'stack', 'plate', 'multi', 'cable', 'smith', 'rack', 'bench', 'dumbbell-rack', 'plate-tree'];
export const ACTION_TYPES = ['set_model', 'set_budget', 'reduce_cost', 'set_interior', 'set_strategy', 'set_floor', 'add_floor', 'remove_floor', 'add_fixture', 'add_link', 'set_reception', 'set_brand', 'must_have', 'exclude_kind', 'add_equipment', 'remove_equipment', 'move_equipment', 'lock', 'regenerate'] as const;

/** Lược đồ JSON cho structured output của Gemini (phẳng: mọi tham số là thuộc tính tuỳ chọn của một action) */
export const ACTION_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'Trả lời ngắn bằng tiếng Việt: đã hiểu nhu cầu gì, sẽ đổi gì, vì sao' },
    questions: { type: 'array', items: { type: 'string' }, description: 'Tối đa 2 câu hỏi NGẮN cho thông tin thật sự còn thiếu; rỗng nếu đủ' },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: [...ACTION_TYPES] },
          model: { type: 'string', enum: MODELS }, million: { type: 'number' }, percent: { type: 'number' },
          style: { type: 'string', enum: STYLES }, option: { type: 'string', enum: ['A', 'B', 'C', 'current'] }, strategy: { type: 'string', enum: STRATS },
          floor: { type: 'integer', description: 'Số tầng: 1 = tầng trệt, 2 = tầng 2…' }, w: { type: 'number' }, l: { type: 'number' }, h: { type: 'number' },
          use: { type: 'string', enum: USES }, users: { type: 'integer' }, budget_million: { type: 'number' }, accent: { type: 'string', description: 'mã màu #RRGGBB' }, area: { type: 'number' },
          kind: { type: 'string' }, wall: { type: 'string', enum: ['front', 'back', 'left', 'right'] }, floors: { type: 'array', items: { type: 'integer' } },
          enabled: { type: 'boolean' }, shape: { type: 'string', enum: ['straight', 'l', 'compact'] }, size: { type: 'string', enum: ['s', 'm', 'l'] }, color: { type: 'string' },
          material: { type: 'string', enum: ['wood', 'stone', 'white', 'metal'] }, logo: { type: 'string', enum: ['desk', 'wall', 'none'] }, seats: { type: 'integer' },
          consult: { type: 'boolean' }, kiosk: { type: 'boolean' }, display: { type: 'boolean' }, storage: { type: 'boolean' }, lights: { type: 'boolean' },
          logo_text: { type: 'string' }, query: { type: 'string' }, count: { type: 'integer' }, to_floor: { type: 'integer' }, on: { type: 'boolean' }
        },
        required: ['type']
      }
    }
  },
  required: ['reply', 'questions', 'actions']
};

const n = (v: unknown, min: number, max: number) => { const x = Number(v); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : undefined; };
const int = (v: unknown, min: number, max: number) => { const x = n(v, min, max); return x === undefined ? undefined : Math.round(x); };
const pick = <T extends string>(v: unknown, list: readonly T[]) => (list.includes(v as T) ? (v as T) : undefined);
const hex = (v: unknown) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : undefined);
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '');
const strip = <T extends Record<string, unknown>>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

/** Chuẩn hoá thao tác từ AI (không tin cậy): bỏ thao tác lạ / thiếu tham số bắt buộc, kẹp giá trị. Tối đa 12 thao tác. */
export function sanitizeActions(raw: unknown): Action[] {
  if (!Array.isArray(raw)) return [];
  const out: Action[] = [];
  for (const r of raw.slice(0, 12)) {
    const a = (r || {}) as Record<string, unknown>;
    switch (a.type) {
      case 'set_model': { const model = pick(a.model, MODELS); if (model) out.push({ type: 'set_model', model }); break; }
      case 'set_budget': { const million = n(a.million, 0, 100_000); if (million !== undefined) out.push({ type: 'set_budget', million }); break; }
      case 'reduce_cost': { const percent = n(a.percent, 5, 60); out.push({ type: 'reduce_cost', percent: percent ?? 15 }); break; }
      case 'set_interior': { const style = pick(a.style, STYLES); if (style) out.push({ type: 'set_interior', style }); break; }
      case 'set_strategy': { const strategy = pick(a.strategy, STRATS); if (strategy) out.push({ type: 'set_strategy', option: pick(a.option, ['A', 'B', 'C', 'current'] as const) ?? 'current', strategy }); break; }
      case 'set_floor': { const floor = int(a.floor, 1, 5); if (floor) out.push(strip({ type: 'set_floor' as const, floor, w: n(a.w, 3, 80), l: n(a.l, 3, 80), h: n(a.h, 2.2, 8), use: pick(a.use, USES), users: int(a.users, 0, 500), budget_million: n(a.budget_million, 0, 100_000), accent: hex(a.accent) })); break; }
      case 'add_floor': out.push(strip({ type: 'add_floor' as const, area: n(a.area, 20, 2000) })); break;
      case 'remove_floor': { const floor = int(a.floor, 1, 5); if (floor) out.push({ type: 'remove_floor', floor }); break; }
      case 'add_fixture': { const floor = int(a.floor, 1, 5), kind = pick(a.kind, FIX); if (floor && kind) out.push(strip({ type: 'add_fixture' as const, floor, kind, wall: pick(a.wall, ['front', 'back', 'left', 'right'] as const) })); break; }
      case 'add_link': { const kind = pick(a.kind, Object.keys(LINK_KINDS) as LinkKind[]); const floors = Array.isArray(a.floors) ? a.floors.map(x => int(x, 1, 5)).filter((x): x is number => !!x) : []; if (kind && floors.length >= 2) out.push({ type: 'add_link', kind, floors: [...new Set(floors)] }); break; }
      case 'set_reception': out.push(strip({ type: 'set_reception' as const, enabled: typeof a.enabled === 'boolean' ? a.enabled : undefined, shape: pick(a.shape, ['straight', 'l', 'compact'] as const), size: pick(a.size, ['s', 'm', 'l'] as const), color: hex(a.color), material: pick(a.material, ['wood', 'stone', 'white', 'metal'] as const), logo: pick(a.logo, ['desk', 'wall', 'none'] as const), seats: int(a.seats, 0, 12), consult: typeof a.consult === 'boolean' ? a.consult : undefined, kiosk: typeof a.kiosk === 'boolean' ? a.kiosk : undefined, display: typeof a.display === 'boolean' ? a.display : undefined, storage: typeof a.storage === 'boolean' ? a.storage : undefined, wall: typeof a.wall === 'boolean' ? a.wall : undefined, lights: typeof a.lights === 'boolean' ? a.lights : undefined, floor: int(a.floor, 1, 5) })); break;
      case 'set_brand': { const logo_text = text(a.logo_text, 24) || undefined, accent = hex(a.accent); if (logo_text || accent) out.push(strip({ type: 'set_brand' as const, logo_text, accent })); break; }
      case 'must_have': { const query = text(a.query, 80); if (query) out.push({ type: 'must_have', query }); break; }
      case 'exclude_kind': { const kind = pick(a.kind, KINDS); if (kind) out.push({ type: 'exclude_kind', kind, on: a.on !== false }); break; }
      case 'add_equipment': { const query = text(a.query, 80), floor = int(a.floor, 1, 5) ?? 1; if (query) out.push({ type: 'add_equipment', query, floor, count: int(a.count, 1, 10) ?? 1 }); break; }
      case 'remove_equipment': { const query = text(a.query, 80); if (query) out.push(strip({ type: 'remove_equipment' as const, query, floor: int(a.floor, 1, 5) })); break; }
      case 'move_equipment': { const query = text(a.query, 80), to_floor = int(a.to_floor, 1, 5); if (query && to_floor) out.push({ type: 'move_equipment', query, to_floor }); break; }
      case 'lock': out.push(strip({ type: 'lock' as const, floor: int(a.floor, 1, 5), on: a.on !== false })); break;
      case 'regenerate': out.push({ type: 'regenerate' }); break;
    }
  }
  return out;
}
export function sanitizeReply(raw: unknown): AssistantReply {
  const r = (raw || {}) as Record<string, unknown>;
  return {
    reply: text(r.reply, 1500) || 'Mình đã đọc yêu cầu của bạn.',
    questions: (Array.isArray(r.questions) ? r.questions : []).map(q => text(q, 200)).filter(Boolean).slice(0, 2),
    actions: sanitizeActions(r.actions)
  };
}

/* ---------- Mô tả thao tác cho khách đọc ---------- */
const floorName = (i: number) => (i === 1 ? 'tầng trệt' : `tầng ${i}`);
export function describeAction(a: Action): string {
  switch (a.type) {
    case 'set_model': return `Mô hình: ${BUSINESS_MODELS[a.model].label}`;
    case 'set_budget': return `Ngân sách dự án: ${a.million.toLocaleString('vi-VN')} triệu`;
    case 'reduce_cost': return `Giảm chi phí thiết bị khoảng ${a.percent}% (chọn lại máy, giữ máy đã khoá)`;
    case 'set_interior': return `Phong cách: ${a.style === 'industrial' ? 'Công nghiệp' : a.style === 'warm' ? 'Ấm áp' : 'Wellness'}`;
    case 'set_strategy': return `Phương án ${a.option === 'current' ? 'đang xem' : a.option}: kiểu ${STRATEGIES[a.strategy].label}`;
    case 'set_floor': return `${floorName(a.floor)}: ${[a.w && `dài ${a.w} m`, a.l && `rộng ${a.l} m`, a.h && `cao ${a.h} m`, a.use && `công năng ${FLOOR_USES[a.use].label}`, a.users !== undefined && `${a.users} người cùng lúc`, a.budget_million !== undefined && `ngân sách ${a.budget_million} triệu`, a.accent && `màu nhấn ${a.accent}`].filter(Boolean).join(', ')}`;
    case 'add_floor': return `Thêm tầng${a.area ? ` ~${a.area} m²` : ''}`;
    case 'remove_floor': return `Xoá ${floorName(a.floor)}`;
    case 'add_fixture': return `${floorName(a.floor)}: thêm ${FIXTURE_KINDS[a.kind].label.toLowerCase()}${a.wall ? ` (tường ${{ front: 'trước', back: 'sau', left: 'trái', right: 'phải' }[a.wall]})` : ''}`;
    case 'add_link': return `Thêm ${LINK_KINDS[a.kind].label.toLowerCase()} nối ${a.floors.map(floorName).join(' – ')}`;
    case 'set_reception': return `Lễ tân: ${[a.enabled === false && 'tắt', a.enabled && 'bật', a.shape && `quầy ${{ straight: 'thẳng', l: 'chữ L', compact: 'nhỏ gọn' }[a.shape]}`, a.size && `quy mô ${{ s: 'nhỏ', m: 'vừa', l: 'lớn' }[a.size]}`, a.color && `màu ${a.color}`, a.material && `mặt ${a.material}`, a.logo && `logo ${a.logo}`, a.seats !== undefined && `${a.seats} ghế chờ`, a.consult !== undefined && (a.consult ? 'có bàn tư vấn' : 'bỏ bàn tư vấn'), a.kiosk !== undefined && (a.kiosk ? 'có kiosk QR' : 'bỏ kiosk'), a.display !== undefined && (a.display ? 'có kệ trưng bày' : 'bỏ kệ trưng bày'), a.floor && `đặt ở ${floorName(a.floor)}`].filter(Boolean).join(', ')}`;
    case 'set_brand': return `Thương hiệu: ${[a.logo_text && `logo "${a.logo_text}"`, a.accent && `màu ${a.accent}`].filter(Boolean).join(', ')}`;
    case 'must_have': return `Máy bắt buộc: ${a.query}`;
    case 'exclude_kind': return `${a.on ? 'Loại trừ' : 'Bỏ loại trừ'} nhóm máy ${a.kind}`;
    case 'add_equipment': return `Thêm ${a.count} × "${a.query}" vào ${floorName(a.floor)}`;
    case 'remove_equipment': return `Bỏ "${a.query}"${a.floor ? ` ở ${floorName(a.floor)}` : ''}`;
    case 'move_equipment': return `Chuyển "${a.query}" lên ${floorName(a.to_floor)}`;
    case 'lock': return `${a.on ? 'Khoá' : 'Mở khoá'} ${a.floor ? floorName(a.floor) : 'toàn bộ máy & nội thất'}`;
    case 'regenerate': return 'Tạo lại 3 phương án (giữ phần đã khoá)';
  }
}

/* ---------- Áp dụng ---------- */
const LAYOUT_CHANGING = new Set<Action['type']>(['set_model', 'set_budget', 'reduce_cost', 'set_floor', 'add_floor', 'remove_floor', 'add_fixture', 'add_link', 'must_have', 'exclude_kind', 'regenerate']);
const fold = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
export function findEquipment(catalog: Equipment[], q: string) {
  const f = fold(q).trim();
  if (!f) return undefined;
  const words = f.split(/\s+/);
  const scored = catalog.map(e => { const t = fold(`${e.name} ${e.sku || ''} ${e.kind || ''}`); return { e, s: words.filter(w => t.includes(w)).length + (t.includes(f) ? 3 : 0) + (e.price ? .5 : 0) }; }).filter(x => x.s >= Math.max(1, words.length * .6)).sort((a, b) => b.s - a.s);
  return scored[0]?.e;
}

/**
 * Áp dụng thao tác lên một BẢN SAO dự án. Thao tác ảnh hưởng mặt bằng / danh sách máy → tạo lại 3 phương án (giữ phần khoá).
 * Trả về dự án mới + nhật ký từng bước (thao tác nào không làm được thì ghi lý do) + tóm tắt kiểm tra.
 */
export function applyActions(p0: Project, actions: Action[], equipment: Equipment[], flooring?: Flooring | null) {
  const catalog = new Map(equipment.map(e => [e.id, e]));
  let p = structuredClone(p0);
  const log: { ok: boolean; text: string }[] = [];
  const floorByNum = (i: number): Floor | undefined => [...p.floors].sort((a, b) => a.level - b.level)[i - 1];
  let regen = false;
  for (const a of actions) {
    const d = describeAction(a);
    try {
      switch (a.type) {
        case 'set_model': p.brief.model = a.model; break;
        case 'set_budget': p.brief.budget = Math.round(a.million * 1e6); break;
        case 'reduce_cost': {
          const c = costOf(p, activeOption(p), catalog, flooring);
          p.brief.budget = Math.max(0, Math.round(c.priced * (1 - a.percent / 100)));
          break;
        }
        case 'set_interior': p = E.setInterior(p, a.style); break;
        case 'set_strategy': {
          const i = a.option === 'current' ? p.active : 'ABC'.indexOf(a.option);
          const keep = p.options[i];
          if (!keep) { log.push({ ok: false, text: `${d}: chưa có phương án ${a.option}` }); continue; }
          const sel = selectEquipment(p, equipment, keep.placements.filter(x => x.locked), flooring);
          const o = generateOption(p, equipment, a.strategy, sel, keep.letter, keep);
          o.version = keep.version + 1;
          p = { ...p, options: p.options.map((x, j) => (j === i ? o : x)), active: i };
          break;
        }
        case 'set_floor': {
          const f = floorByNum(a.floor);
          if (!f) { log.push({ ok: false, text: `${d}: không có tầng này` }); continue; }
          p = E.updateFloor(p, f.id, { ...(a.w ? { w: a.w } : {}), ...(a.l ? { l: a.l } : {}), ...(a.h ? { h: a.h } : {}), ...(a.use ? { use: a.use } : {}), ...(a.users !== undefined ? { users: a.users } : {}), ...(a.budget_million !== undefined ? { budget: Math.round(a.budget_million * 1e6) } : {}), ...(a.accent ? { accent: a.accent } : {}) });
          if (a.accent && Object.keys(a).length === 3) { log.push({ ok: true, text: d }); continue; }
          break;
        }
        case 'add_floor': {
          if (p.floors.length >= 5) { log.push({ ok: false, text: `${d}: tối đa 5 tầng` }); continue; }
          p = E.addFloor(p);
          if (a.area) { const f = [...p.floors].sort((x, y) => y.level - x.level)[0]; const l = Math.sqrt(a.area / 1.4); p = E.updateFloor(p, f.id, { w: Math.round(l * 14) / 10, l: Math.round((a.area / (l * 1.4)) * 10) / 10 }); }
          break;
        }
        case 'remove_floor': { const f = floorByNum(a.floor); if (!f || p.floors.length <= 1) { log.push({ ok: false, text: `${d}: không xoá được` }); continue; } p = E.removeFloor(p, f.id); break; }
        case 'add_fixture': {
          const f = floorByNum(a.floor);
          if (!f) { log.push({ ok: false, text: `${d}: không có tầng này` }); continue; }
          const r = E.addFixture(p, f.id, a.kind);
          p = r.project;
          if (a.wall && r.id) { const pos = { front: { x: 0, z: f.l / 2 }, back: { x: 0, z: -f.l / 2 }, left: { x: -f.w / 2, z: 0 }, right: { x: f.w / 2, z: 0 } }[a.wall]; p = E.updateFixture(p, r.id, pos); }
          break;
        }
        case 'add_link': {
          const ids = a.floors.map(floorByNum).filter((x): x is Floor => !!x).map(f => f.id);
          const r = E.addLink(p, a.kind, ids);
          if (!r.id) { log.push({ ok: false, text: `${d}: cần ít nhất 2 tầng có thật` }); continue; }
          p = r.project; break;
        }
        case 'set_reception': {
          const patch: Partial<Reception> = {};
          for (const k of ['enabled', 'shape', 'size', 'color', 'material', 'logo', 'seats', 'consult', 'kiosk', 'display', 'storage', 'wall', 'lights'] as const) if (a[k] !== undefined) (patch as Record<string, unknown>)[k] = a[k];
          if (a.floor) { const f = floorByNum(a.floor); if (f) patch.floorId = f.id; }
          p = E.setReception(p, patch); break;
        }
        case 'set_brand': p = E.setBrand(p, { ...(a.logo_text ? { logoText: a.logo_text } : {}), ...(a.accent ? { accent: a.accent } : {}) }); break;
        case 'must_have': {
          const e = findEquipment(equipment, a.query);
          if (!e) { log.push({ ok: false, text: `${d}: không tìm thấy máy khớp trong danh mục` }); continue; }
          if (!p.brief.mustHave.includes(e.id)) p.brief.mustHave = [...p.brief.mustHave, e.id];
          log.push({ ok: true, text: `Máy bắt buộc: ${e.name}` }); regen = true; continue;
        }
        case 'exclude_kind': p.brief.exclude = a.on ? [...new Set([...p.brief.exclude, a.kind])] : p.brief.exclude.filter(x => x !== a.kind); break;
        case 'add_equipment': {
          const e = findEquipment(equipment, a.query), f = floorByNum(a.floor);
          if (!e || !f || !p.options.length) { log.push({ ok: false, text: `${d}: ${!e ? 'không tìm thấy máy khớp trong danh mục' : 'chưa có phương án / tầng'}` }); continue; }
          let placed = 0;
          for (let i = 0; i < a.count; i++) { const r = E.addEquipment(p, f.id, e, catalog); p = r.project; if (r.placed) placed++; }
          log.push({ ok: placed === a.count, text: `Thêm ${a.count} × ${e.name} vào ${f.name.toLowerCase()}${placed < a.count ? ` (${a.count - placed} máy hết chỗ hợp lệ, đang tô đỏ)` : ''}` }); continue;
        }
        case 'remove_equipment': case 'move_equipment': {
          const o = activeOption(p);
          const e = findEquipment(equipment.filter(x => o?.placements.some(pl => pl.eqId === x.id)), a.query);
          if (!o || !e) { log.push({ ok: false, text: `${d}: không có máy khớp trong phương án` }); continue; }
          const target = a.type === 'remove_equipment' && a.floor ? floorByNum(a.floor)?.id : undefined;
          const pls = o.placements.filter(pl => pl.eqId === e.id && !pl.locked && (!target || pl.floorId === target));
          if (!pls.length) { log.push({ ok: false, text: `${d}: máy đã khoá hoặc không ở tầng đó` }); continue; }
          if (a.type === 'remove_equipment') for (const pl of pls) p = E.removeItem(p, pl.id);
          else { const f = floorByNum(a.to_floor); if (!f) { log.push({ ok: false, text: `${d}: không có tầng đích` }); continue; } for (const pl of pls) p = E.moveToFloor(p, pl.id, f.id, catalog).project; }
          log.push({ ok: true, text: `${a.type === 'remove_equipment' ? 'Bỏ' : 'Chuyển'} ${pls.length} × ${e.name}` }); continue;
        }
        case 'lock': {
          if (a.floor) { const f = floorByNum(a.floor); if (f) p = E.lockFloor(p, f.id, a.on); }
          else for (const f of p.floors) p = E.lockFloor(p, f.id, a.on);
          break;
        }
        case 'regenerate': break;
      }
      if (LAYOUT_CHANGING.has(a.type)) regen = true;
      log.push({ ok: true, text: d });
    } catch { log.push({ ok: false, text: `${d}: lỗi khi áp dụng` }); }
  }
  if (regen && p.floors.length) {
    const { options } = generateOptions(p, equipment, { keep: activeOption(p), flooring });
    p = { ...p, options, active: Math.min(p.active, options.length - 1), version: p.version + 1, updatedAt: Date.now() };
    log.push({ ok: true, text: 'Đã tạo lại 3 phương án theo thay đổi (giữ phần đã khoá)' });
  }
  const o = activeOption(p);
  const v = o ? validateOption(p, o, catalog) : null;
  const c = costOf(p, o, catalog, flooring);
  return { project: p, log, errors: v?.issues.filter(i => i.level === 'error').length ?? 0, cost: c.priced, budget: p.brief.budget };
}

/* ---------- Tóm tắt gửi AI (không dữ liệu cá nhân, gọn token) ---------- */
export function summarizeForAI(p: Project, catalog: Map<string, Equipment>) {
  const o = activeOption(p);
  const sorted = [...p.floors].sort((a, b) => a.level - b.level);
  const c = costOf(p, o, catalog);
  return {
    model: p.brief.model, budget_million: Math.round(p.brief.budget / 1e6), interior: p.brief.interior, brand: { logo: p.brand.logoText, accent: p.brand.accent },
    floors: sorted.map((f, i) => ({ floor: i + 1, name: f.name, w: f.w, l: f.l, h: f.h, use: f.use, users: f.users, budget_million: Math.round(f.budget / 1e6), accent: f.accent,
      fixtures: f.fixtures.map(x => x.kind + (x.main ? '(main)' : '')).join(','),
      equipment: o ? Object.entries(o.placements.filter(x => x.floorId === f.id).reduce<Record<string, number>>((m, x) => { const n = catalog.get(x.eqId)?.name ?? '?'; m[n] = (m[n] || 0) + 1; return m; }, {})).map(([k, v]) => `${k} x${v}`).slice(0, 30) : [],
      locked: o ? o.placements.filter(x => x.floorId === f.id && x.locked).length : 0 })),
    links: p.links.map(l => ({ kind: l.kind, floors: l.floors.map(id => sorted.findIndex(f => f.id === id) + 1) })),
    reception: { enabled: p.reception.enabled, shape: p.reception.shape, size: p.reception.size, floor: sorted.findIndex(f => f.id === p.reception.floorId) + 1, color: p.reception.color, material: p.reception.material, seats: p.reception.seats, consult: p.reception.consult, kiosk: p.reception.kiosk },
    options: p.options.map((x, i) => ({ letter: x.letter, strategy: x.strategy, machines: x.placements.length, active: i === p.active })),
    cost_priced_million: Math.round(c.priced / 1e6), unpriced_machines: c.unpricedCount,
    must_have: p.brief.mustHave.map(id => catalog.get(id)?.name).filter(Boolean), exclude: p.brief.exclude
  };
}

/** Che số điện thoại / email trước khi gửi ra dịch vụ AI miễn phí */
export const redact = (s: string) => s.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]').replace(/(\+?84|0)(\s?\d){8,10}/g, '[số điện thoại]');

/**
 * Đọc nhu cầu không dùng AI (chế độ dự phòng, kết quả mẫu): nhận ra các ý phổ biến bằng từ khoá.
 * Dùng khi chưa có khoá Gemini, hết lượt hoặc mất kết nối.
 */
export function ruleBasedActions(msg: string, p: Project): AssistantReply {
  const t = fold(msg);
  const a: Action[] = [];
  const said: string[] = [];
  const floors = t.match(/(\d)\s*tang/);
  if (floors) { const k = Number(floors[1]); if (k > p.floors.length && k <= 5) for (let i = p.floors.length; i < k; i++) a.push({ type: 'add_floor' }); }
  if (/\bden\b|toi mau|cong nghiep|industrial/.test(t)) { a.push({ type: 'set_interior', style: /\bgo\b/.test(t) ? 'warm' : 'industrial' }); said.push('phong cách tối / gỗ'); }
  else if (/am ap|\bgo\b|vang am/.test(t)) a.push({ type: 'set_interior', style: 'warm' });
  else if (/wellness|sang|thien nhien|cay xanh/.test(t)) a.push({ type: 'set_interior', style: 'wellness' });
  if (/le tan nho|quay nho|nho gon/.test(t)) a.push({ type: 'set_reception', shape: 'compact', size: 's' });
  if (/chu l/.test(t)) a.push({ type: 'set_reception', shape: 'l' });
  const pt = t.match(/tang (tren|2|hai|3|ba)[^.]*\bpt\b/);
  if (pt) a.push({ type: 'set_floor', floor: /3|ba/.test(pt[1]) ? 3 : Math.max(2, p.floors.length), use: 'pt' });
  if (/trung tam thoang|giu (khoang )?giua|mo trung tam/.test(t)) a.push({ type: 'set_strategy', option: 'current', strategy: 'perimeter' });
  if (/truc|chieu sau/.test(t)) a.push({ type: 'set_strategy', option: 'current', strategy: 'axis' });
  if (/vong tap|circuit/.test(t)) a.push({ type: 'set_strategy', option: 'current', strategy: 'circuit' });
  const cut = t.match(/giam (chi phi|ngan sach|tien)[^\d]*(\d+)?\s*%?/);
  if (cut) a.push({ type: 'reduce_cost', percent: cut[2] ? Number(cut[2]) : 15 });
  const bud = t.match(/(\d+[.,]?\d*)\s*(ty|trieu)/);
  if (bud && !cut) a.push({ type: 'set_budget', million: Number(bud[1].replace(',', '.')) * (bud[2] === 'ty' ? 1000 : 1) });
  const col = t.match(/doi mau tang (\d|hai|ba)/);
  if (col) a.push({ type: 'set_floor', floor: /3|ba/.test(col[1]) ? 3 : 2, accent: /xanh/.test(t) ? '#2f6f5e' : /do/.test(t) ? '#9f2b2b' : /go|nau/.test(t) ? '#8a5a35' : '#3a4a6b' });
  if (/chi doi trang tri|giu may/.test(t)) a.push({ type: 'lock', on: true });
  return {
    reply: a.length ? `Chế độ mẫu (không dùng AI): mình nhận ra ${a.length} ý trong yêu cầu. Xem trước các thay đổi bên dưới rồi bấm Áp dụng.` : 'Chế độ mẫu (không dùng AI): mình chưa nhận ra yêu cầu này. Bạn có thể chỉnh trực tiếp ở các mục Mặt bằng, Thiết bị, Lễ tân, Phong cách.',
    questions: [], actions: a
  };
}
