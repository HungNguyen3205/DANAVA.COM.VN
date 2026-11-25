/**
 * Dữ liệu thống nhất của công cụ thiết kế phòng tập (phòng lab 3D /bao-gia-setup-phong-gym/).
 *
 * Quy ước:
 *  - Đơn vị nội bộ: mét (toạ độ, kích thước), VNĐ số nguyên (tiền). Giao diện tự đổi sang m, cm, m², "1.200.000 ₫".
 *  - Toạ độ một tầng: gốc ở tâm sàn, x ∈ [-w/2, w/2] (chiều dài), z ∈ [-l/2, l/2] (chiều rộng); tường trước là z = +l/2.
 *  - rot = số lần xoay 90° quanh trục đứng (0–3), cùng quy ước với three.js (rotation.y = rot·π/2).
 *  - Tầng: level 0 = tầng trệt. "Tổng số tầng" luôn tính cả tầng trệt.
 *  - Mỗi đối tượng có id ổn định (không đổi khi sửa); phương án có mã (ví dụ GYM-7K3PQ2-B) và phiên bản tăng sau mỗi lần sửa,
 *    để kết quả mô phỏng / báo giá biết thuộc bố trí nào (`layoutHash`).
 *
 * Thuần TypeScript, dùng chung cho trình duyệt, máy chủ (API lưu phương án, trợ lý AI) và test.
 */
import type { Equipment } from './equipment.ts';

export const GYM_SCHEMA = 1;

/* ---------- Lựa chọn thiết kế: 3 nhóm độc lập ---------- */

/** 1. Mô hình kinh doanh: quyết định tỉ lệ nhóm máy và mật độ */
export type BusinessModel = 'gym' | 'pt' | 'strength' | 'boutique' | 'wellness';
export const BUSINESS_MODELS: Record<BusinessModel, { label: string; hint: string; mix: { cardio: number; machine: number; free: number }; m2PerStation: number; functional: number }> = {
  gym: { label: 'Gym tổng hợp', hint: 'Cân bằng cardio, máy tạ và tạ tự do cho số đông hội viên', mix: { cardio: .32, machine: .43, free: .25 }, m2PerStation: 7, functional: .08 },
  pt: { label: 'PT studio', hint: 'Ít máy, nhiều khoảng tập cùng huấn luyện viên', mix: { cardio: .18, machine: .34, free: .48 }, m2PerStation: 10, functional: .22 },
  strength: { label: 'Thiên sức mạnh', hint: 'Khung tạ, máy treo bánh và tạ tự do là trọng tâm', mix: { cardio: .14, machine: .4, free: .46 }, m2PerStation: 8.5, functional: .1 },
  boutique: { label: 'Boutique fitness', hint: 'Lớp nhóm nhỏ, khu chức năng lớn, ít máy chọn lọc', mix: { cardio: .35, machine: .25, free: .4 }, m2PerStation: 11, functional: .32 },
  wellness: { label: 'Wellness kết hợp', hint: 'Cardio nhẹ, máy an toàn, nhiều không gian thư giãn', mix: { cardio: .45, machine: .4, free: .15 }, m2PerStation: 9.5, functional: .18 }
};

/** 2. Cách tổ chức mặt bằng: mỗi kiểu có quy tắc bố trí riêng (lib/gym-layout.ts) */
export type Strategy = 'perimeter' | 'clusters' | 'circuit' | 'axis';
export const STRATEGIES: Record<Strategy, { label: string; hint: string; rules: string[] }> = {
  perimeter: { label: 'Mở trung tâm', hint: 'Máy xếp quanh tường, giữa phòng là khoảng mở cho tập chức năng', rules: ['Thiết bị bám theo tường, quay vào giữa phòng', 'Cardio dọc tường có cửa sổ (hoặc tường đối diện cửa vào)', 'Khung tạ và tạ tự do dọc tường gương', 'Giữ khoảng mở trung tâm cho tập chức năng, không lấn vào để thêm máy'] },
  clusters: { label: 'Cụm trải nghiệm', hint: 'Gom máy thành cụm theo nhóm cơ, mỗi cụm có khoảng PT riêng', rules: ['Chia sàn thành các cụm, giữa các cụm lối đi 1,2 m', 'Mỗi cụm một nhóm bài: chân – mông, thân trên, tạ tự do', 'Máy trong cụm quay vào nhau, giữa cụm là chỗ huấn luyện viên đứng', 'Cardio tách thành dải riêng sát tường'] },
  circuit: { label: 'Vòng tập', hint: 'Các trạm xếp theo vòng, đánh số theo thứ tự bài tập', rules: ['Một vòng lối đi khép kín chạy quanh phòng', 'Trạm ngoài quay vào vòng, cụm trạm giữa quay ra vòng', 'Trạm đánh số xen kẽ thân trên – thân dưới – cardio', 'Ai cũng tiếp cận trạm kế tiếp mà không cắt ngang người khác'] },
  axis: { label: 'Trục trung tâm', hint: 'Một trục lối đi từ cửa vào chạy sâu vào phòng, các khu hai bên', rules: ['Trục lối đi rộng 2,2 m từ cửa vào tới cuối phòng', 'Máy hai bên trục quay về phía trục', 'Cardio cuối trục, nhìn từ cửa vào thấy chiều sâu', 'Đèn tuyến tính chạy dọc trục để định hướng'] }
};
/** 3. Phong cách nội thất: xem lib/gym-decor.ts (INTERIOR_STYLES) */
export type InteriorStyle = 'industrial' | 'warm' | 'wellness';

/* ---------- Mặt bằng ---------- */

export type FixtureKind = 'door' | 'exit' | 'window' | 'column' | 'wc' | 'locker' | 'storage' | 'void' | 'outlet' | 'other';
/** Vật cố định trên một tầng. pad = khoảng phải chừa trống quanh vật (m); walk = người đi qua được (cửa) */
export const FIXTURE_KINDS: Record<FixtureKind, { label: string; w: number; d: number; color: string; pad: number; walk: boolean; blocks: boolean }> = {
  door: { label: 'Cửa ra vào', w: 1.4, d: .2, color: '#2b4294', pad: 1.2, walk: true, blocks: false },
  exit: { label: 'Lối thoát hiểm', w: 1.2, d: .2, color: '#15803d', pad: 1.2, walk: true, blocks: false },
  window: { label: 'Cửa sổ', w: 2.4, d: .15, color: '#38bdf8', pad: 0, walk: false, blocks: false },
  column: { label: 'Cột', w: .4, d: .4, color: '#475569', pad: .3, walk: false, blocks: true },
  wc: { label: 'Nhà vệ sinh', w: 2.4, d: 2, color: '#0e7490', pad: .6, walk: false, blocks: true },
  locker: { label: 'Phòng thay đồ', w: 3, d: 2.5, color: '#7c3aed', pad: .6, walk: false, blocks: true },
  storage: { label: 'Kho', w: 2, d: 1.5, color: '#92400e', pad: .4, walk: false, blocks: true },
  void: { label: 'Vùng không sử dụng', w: 2, d: 2, color: '#b42318', pad: 0, walk: false, blocks: true },
  outlet: { label: 'Ổ điện', w: .2, d: .1, color: '#ca8a04', pad: 0, walk: true, blocks: false },
  other: { label: 'Khu khác', w: 1.5, d: 1.5, color: '#64748b', pad: .5, walk: false, blocks: true }
};
export type Fixture = { id: string; kind: FixtureKind; x: number; z: number; w: number; d: number; rot: number; /** cửa chính của công trình */ main?: boolean; label?: string };

/** Lõi giao thông nối các tầng: cùng vị trí trên mọi tầng nó đi qua */
export type LinkKind = 'stairs' | 'elevator';
export const LINK_KINDS: Record<LinkKind, { label: string; w: number; d: number; color: string; /** chiều sâu sảnh chờ trước lối lên xuống */ landing: number; speed: number }> = {
  stairs: { label: 'Cầu thang', w: 1.3, d: 3.2, color: '#5b6478', landing: 1.2, speed: .45 },
  elevator: { label: 'Thang máy', w: 1.8, d: 1.8, color: '#0f766e', landing: 1.5, speed: 1 }
};
export type Link = { id: string; kind: LinkKind; floors: string[]; x: number; z: number; w: number; d: number; rot: number };

export type FloorUse = 'auto' | 'mixed' | 'cardio' | 'strength' | 'pt' | 'functional';
export const FLOOR_USES: Record<FloorUse, { label: string; mix?: { cardio: number; machine: number; free: number } }> = {
  auto: { label: 'Tự đề xuất' },
  mixed: { label: 'Tổng hợp', mix: { cardio: .3, machine: .45, free: .25 } },
  cardio: { label: 'Cardio', mix: { cardio: .75, machine: .2, free: .05 } },
  strength: { label: 'Sức mạnh', mix: { cardio: .05, machine: .5, free: .45 } },
  pt: { label: 'PT 1-1', mix: { cardio: .15, machine: .35, free: .5 } },
  functional: { label: 'Tập chức năng / lớp nhóm', mix: { cardio: .3, machine: .1, free: .6 } }
};
export type Floor = {
  id: string; name: string; level: number;
  /** dài (x), rộng (z), cao thông thủy (m) */
  w: number; l: number; h: number;
  fixtures: Fixture[];
  use: FloorUse;
  /** số người tập cùng lúc dự kiến (0 = tự tính theo diện tích) */
  users: number;
  /** ngân sách thiết bị riêng của tầng (VNĐ, 0 = chia từ ngân sách dự án theo diện tích) */
  budget: number;
  /** màu nhấn riêng của tầng (trống = theo phong cách chung) */
  accent?: string;
};

/* ---------- Thiết bị, nội thất, lễ tân ---------- */

export type Placement = { id: string; eqId: string; floorId: string; x: number; z: number; rot: number; locked?: boolean; /** số thứ tự trạm (kiểu Vòng tập) */ station?: number };
export type FurnKind =
  | 'desk-straight' | 'desk-l' | 'desk-compact' | 'back-storage' | 'brand-wall' | 'kiosk' | 'sofa' | 'chair' | 'consult-table' | 'display'
  | 'plant' | 'mirror' | 'linear-light' | 'turf' | 'mat-zone' | 'station' | 'water' | 'rest-bench';
export type FurnitureItem = { id: string; kind: FurnKind; floorId: string; x: number; z: number; rot: number; w: number; d: number; locked?: boolean; label?: string; /** thuộc mô-đun lễ tân (tạo lại khi đổi cấu hình lễ tân) */ group?: 'reception' | 'decor' };

export type ReceptionShape = 'straight' | 'l' | 'compact';
export type Reception = {
  enabled: boolean; floorId: string;
  shape: ReceptionShape; size: 's' | 'm' | 'l';
  color: string; material: 'wood' | 'stone' | 'white' | 'metal';
  logo: 'desk' | 'wall' | 'none';
  wall: boolean; lights: boolean; storage: boolean; kiosk: boolean;
  /** số ghế chờ */ seats: number;
  consult: boolean; display: boolean;
  /** quầy phụ ở tầng khác (khi có lý do vận hành: tầng PT riêng, cửa phụ…) */
  secondaryFloorId?: string;
};

/* ---------- Nhu cầu khách ---------- */

export type Brief = {
  model: BusinessModel;
  /** tổng số tầng, gồm tầng trệt */
  floors: number;
  /** ngân sách toàn dự án cho thiết bị + sàn đã có giá (VNĐ, 0 = không giới hạn) */
  budget: number;
  interior: InteriorStyle;
  /** máy bắt buộc có */ mustHave: string[];
  /** loại máy loại trừ (EquipmentKind) */ exclude: string[];
  notes: string;
};

export type DesignOption = {
  id: string;
  /** A / B / C */ letter: string;
  strategy: Strategy;
  version: number;
  placements: Placement[];
  furniture: FurnitureItem[];
  /** lý do bố trí (hiện cho khách) */ reasons: string[];
  /** khác biệt so với phương án khác / thay đổi danh sách máy */ changes: string[];
  warnings: string[];
  /** máy đã chọn nhưng không đặt được và lý do */
  dropped: { eqId: string; floorId: string; reason: string }[];
};

export type Project = {
  schema: number;
  /** mã thiết kế công khai (GYM-XXXXXX), có khi đã lưu lên hệ thống */
  code?: string;
  version: number;
  title: string;
  brief: Brief;
  floors: Floor[];
  links: Link[];
  reception: Reception;
  /** màu nhấn chung / logo trên vách */ brand: { accent: string; logoText: string };
  options: DesignOption[];
  active: number;
  updatedAt: number;
  /** kịch bản mô phỏng vận hành (lib/gym-sim.ts Scenario) — lưu cùng phương án */
  scenario?: Record<string, unknown>;
  /** tóm tắt lần mô phỏng gần nhất; layout = layoutHash lúc chạy (khác hiện tại → cần chạy lại) */
  simRun?: { option: string; layout: string; at: number; source: string; visitors: number; peak: number; waitMachineSec: number; deskWaitSec: number; abandons: number };
};

/* ---------- Tiện ích ---------- */

export const uid = (p: string) => p + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const fmtM = (m: number) => `${round2(m).toLocaleString('vi-VN')} m`;
export const fmtCm = (m: number) => `${Math.round(m * 100).toLocaleString('vi-VN')} cm`;
export const fmtArea = (m2: number) => `${Math.round(m2 * 10) / 10 > 99 ? Math.round(m2).toLocaleString('vi-VN') : (Math.round(m2 * 10) / 10).toLocaleString('vi-VN')} m²`;
export const levelName = (level: number) => (level === 0 ? 'Tầng trệt' : `Tầng ${level + 1}`);
export const activeOption = (p: Project): DesignOption | undefined => p.options[p.active] ?? p.options[0];
export const floorOf = (p: Project, id: string) => p.floors.find(f => f.id === id);
/** Tầng có cửa chính (lối vào công trình); không khai báo thì là tầng thấp nhất */
export function entranceFloor(p: Pick<Project, 'floors'>): Floor {
  const sorted = [...p.floors].sort((a, b) => a.level - b.level);
  return sorted.find(f => f.fixtures.some(x => x.kind === 'door' && x.main)) || sorted[0];
}
/** Kích thước chiếm sàn theo hướng xoay */
export const footOf = (w: number, d: number, rot: number): [number, number] => (rot % 2 ? [d, w] : [w, d]);
/** Diện tích (m²) */
export const floorArea = (f: Floor) => f.w * f.l;

/** Mã công khai 6 ký tự dễ đọc (không 0/O/1/I) */
export function makeCode(rand: () => number = Math.random) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += A[Math.floor(rand() * A.length)];
  return 'GYM-' + s;
}
/** Mã của một phương án: GYM-XXXXXX-B (chưa lưu: NHAP-B) */
export const optionCode = (p: Pick<Project, 'code'>, o: Pick<DesignOption, 'letter'>) => `${p.code || 'NHAP'}-${o.letter}`;

/** Băm nhanh (djb2) — nhận diện bố trí cho mô phỏng / báo giá */
export function hashString(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
/** Dấu vân tay của bố trí: đổi mặt bằng, máy, nội thất → đổi hash → mô phỏng cũ cần chạy lại */
export function layoutHash(p: Pick<Project, 'floors' | 'links' | 'reception'>, o: Pick<DesignOption, 'placements' | 'furniture'>) {
  const r = (n: number) => Math.round(n * 100);
  return hashString(JSON.stringify([
    p.floors.map(f => [f.id, r(f.w), r(f.l), r(f.h), f.fixtures.map(x => [x.kind, r(x.x), r(x.z), r(x.w), r(x.d), x.rot, x.main ? 1 : 0])]),
    p.links.map(l => [l.kind, l.floors, r(l.x), r(l.z), r(l.w), r(l.d), l.rot]),
    o.placements.map(x => [x.eqId, x.floorId, r(x.x), r(x.z), x.rot]).sort(),
    o.furniture.map(x => [x.kind, x.floorId, r(x.x), r(x.z), x.rot]).sort()
  ]));
}

/* ---------- Tạo dự án mới ---------- */

export const DEFAULT_RECEPTION = (floorId: string): Reception => ({
  enabled: true, floorId, shape: 'straight', size: 'm', color: '#13244f', material: 'wood', logo: 'wall',
  wall: true, lights: true, storage: true, kiosk: true, seats: 3, consult: true, display: false
});

/** Diện tích → kích thước chữ nhật tỉ lệ ~1,4 : 1 */
export function dimsOf(area: number) {
  const l = Math.sqrt(area / 1.4);
  const w = Math.round(l * 1.4 * 10) / 10;
  return { w, l: Math.round((area / w) * 10) / 10 };
}

/**
 * Dự án mới từ 4 nhóm thông tin ban đầu: mô hình, số tầng, diện tích từng tầng, ngân sách.
 * Tầng trệt có cửa chính giữa tường trước, nhà vệ sinh và thay đồ ở góc; nhiều tầng thì có cầu thang ở góc sau trái.
 */
export function newProject(input: { model: BusinessModel; areas: number[]; budget: number; interior?: InteriorStyle; height?: number }): Project {
  const areas = input.areas.slice(0, 5).map(a => Math.min(2000, Math.max(20, Math.round(a))));
  if (!areas.length) areas.push(100);
  const floors: Floor[] = areas.map((a, level) => {
    const { w, l } = dimsOf(a);
    return { id: uid('fl'), name: levelName(level), level, w, l, h: input.height ?? 3.2, fixtures: [], use: 'auto', users: 0, budget: 0 };
  });
  const g = floors[0];
  g.fixtures.push({ id: uid('fx'), kind: 'door', main: true, x: 0, z: g.l / 2 - .1, w: 1.6, d: .2, rot: 0 });
  g.fixtures.push({ id: uid('fx'), kind: 'wc', x: g.w / 2 - 1.3, z: g.l / 2 - 1.1, w: 2.4, d: 2, rot: 0 });
  if (areas[0] >= 80) g.fixtures.push({ id: uid('fx'), kind: 'locker', x: g.w / 2 - 1.6, z: g.l / 2 - 3.45, w: 3, d: 2.5, rot: 0 });
  const links: Link[] = [];
  if (floors.length > 1) {
    const s = LINK_KINDS.stairs;
    const minW = Math.min(...floors.map(f => f.w)), minL = Math.min(...floors.map(f => f.l));
    links.push({ id: uid('ln'), kind: 'stairs', floors: floors.map(f => f.id), x: -minW / 2 + s.w / 2 + .1, z: -minL / 2 + s.d / 2 + .1, w: s.w, d: s.d, rot: 0 });
  }
  return {
    schema: GYM_SCHEMA, version: 1, title: 'Phòng tập của tôi',
    brief: { model: input.model, floors: floors.length, budget: Math.max(0, Math.round(input.budget)), interior: input.interior || 'industrial', mustHave: [], exclude: [], notes: '' },
    floors, links, reception: DEFAULT_RECEPTION(g.id), brand: { accent: '#f26b1d', logoText: 'YOUR GYM' },
    options: [], active: 0, updatedAt: Date.now()
  };
}

/* ---------- Kiểm tra / chuẩn hoá dữ liệu nhận từ ngoài (API lưu, trợ lý AI, localStorage) ---------- */

const LIMITS = { floors: 5, fixtures: 60, links: 6, placements: 500, furniture: 400, options: 3, text: 2000 };
const num = (v: unknown, min: number, max: number, def: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
const str = (v: unknown, max: number, def = '') => (typeof v === 'string' ? v.slice(0, max) : def);
const idOk = (v: unknown) => typeof v === 'string' && /^[a-z]{2,4}_[a-z0-9]{3,24}$/i.test(v);
const color = (v: unknown, def: string) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : def);
const oneOf = <T extends string>(v: unknown, keys: readonly T[] | Record<T, unknown>, def: T): T => {
  const list = (Array.isArray(keys) ? keys : Object.keys(keys)) as T[];
  return list.includes(v as T) ? (v as T) : def;
};
const FURN_KINDS: FurnKind[] = ['desk-straight', 'desk-l', 'desk-compact', 'back-storage', 'brand-wall', 'kiosk', 'sofa', 'chair', 'consult-table', 'display', 'plant', 'mirror', 'linear-light', 'turf', 'mat-zone', 'station', 'water', 'rest-bench'];

/**
 * Chuẩn hoá một dự án từ JSON không tin cậy. Trả về dự án hợp lệ hoặc chuỗi lỗi (tiếng Việt, nói rõ chỗ sai).
 * `known` = mã thiết bị hợp lệ trong danh mục (bỏ máy lạ).
 */
export function normalizeProject(raw: unknown, known?: Set<string>): Project | string {
  if (!raw || typeof raw !== 'object') return 'Dữ liệu phương án không hợp lệ.';
  const r = raw as Record<string, unknown>;
  const floorsIn = Array.isArray(r.floors) ? r.floors.slice(0, LIMITS.floors) : [];
  if (!floorsIn.length) return 'Phương án phải có ít nhất một tầng.';
  const floors: Floor[] = [];
  for (const [i, fr] of floorsIn.entries()) {
    const f = (fr || {}) as Record<string, unknown>;
    const w = num(f.w, 3, 80, 10), l = num(f.l, 3, 80, 8);
    if (!idOk(f.id)) return `Tầng ${i + 1}: thiếu mã tầng.`;
    const fixtures: Fixture[] = (Array.isArray(f.fixtures) ? f.fixtures.slice(0, LIMITS.fixtures) : []).flatMap(xr => {
      const x = (xr || {}) as Record<string, unknown>;
      if (!idOk(x.id) || !((x.kind as string) in FIXTURE_KINDS)) return [];
      const kind = x.kind as FixtureKind;
      return [{ id: x.id as string, kind, x: num(x.x, -w / 2, w / 2, 0), z: num(x.z, -l / 2, l / 2, 0), w: num(x.w, .1, w, FIXTURE_KINDS[kind].w), d: num(x.d, .05, l, FIXTURE_KINDS[kind].d), rot: Math.round(num(x.rot, 0, 3, 0)), ...(x.main ? { main: true } : {}), ...(x.label ? { label: str(x.label, 60) } : {}) }];
    });
    floors.push({ id: f.id as string, name: str(f.name, 40, levelName(i)) || levelName(i), level: Math.round(num(f.level, 0, 9, i)), w, l, h: num(f.h, 2.2, 8, 3.2), fixtures, use: oneOf(f.use, FLOOR_USES, 'auto'), users: Math.round(num(f.users, 0, 500, 0)), budget: Math.round(num(f.budget, 0, 1e11, 0)), ...(f.accent ? { accent: color(f.accent, '#f26b1d') } : {}) });
  }
  if (new Set(floors.map(f => f.level)).size !== floors.length) return 'Hai tầng đang trùng số tầng.';
  const fid = new Set(floors.map(f => f.id));
  const links: Link[] = (Array.isArray(r.links) ? r.links.slice(0, LIMITS.links) : []).flatMap(lr => {
    const l = (lr || {}) as Record<string, unknown>;
    if (!idOk(l.id) || !((l.kind as string) in LINK_KINDS)) return [];
    const fl = (Array.isArray(l.floors) ? l.floors : []).filter((x): x is string => typeof x === 'string' && fid.has(x));
    if (fl.length < 2) return [];
    const kind = l.kind as LinkKind;
    return [{ id: l.id as string, kind, floors: [...new Set(fl)], x: num(l.x, -40, 40, 0), z: num(l.z, -40, 40, 0), w: num(l.w, .8, 6, LINK_KINDS[kind].w), d: num(l.d, .8, 8, LINK_KINDS[kind].d), rot: Math.round(num(l.rot, 0, 3, 0)) }];
  });
  const b = (r.brief || {}) as Record<string, unknown>;
  const brief: Brief = {
    model: oneOf(b.model, BUSINESS_MODELS, 'gym'), floors: floors.length, budget: Math.round(num(b.budget, 0, 1e11, 0)),
    interior: oneOf(b.interior, ['industrial', 'warm', 'wellness'] as const, 'industrial'),
    mustHave: (Array.isArray(b.mustHave) ? b.mustHave : []).filter((x): x is string => typeof x === 'string' && (!known || known.has(x))).slice(0, 40),
    exclude: (Array.isArray(b.exclude) ? b.exclude : []).filter((x): x is string => typeof x === 'string').slice(0, 20).map(x => x.slice(0, 30)),
    notes: str(b.notes, LIMITS.text)
  };
  const rc = (r.reception || {}) as Record<string, unknown>;
  const recFloor = typeof rc.floorId === 'string' && fid.has(rc.floorId) ? rc.floorId : entranceFloor({ floors }).id;
  const reception: Reception = {
    ...DEFAULT_RECEPTION(recFloor), enabled: rc.enabled !== false,
    shape: oneOf(rc.shape, ['straight', 'l', 'compact'] as const, 'straight'), size: oneOf(rc.size, ['s', 'm', 'l'] as const, 'm'),
    color: color(rc.color, '#13244f'), material: oneOf(rc.material, ['wood', 'stone', 'white', 'metal'] as const, 'wood'), logo: oneOf(rc.logo, ['desk', 'wall', 'none'] as const, 'wall'),
    wall: rc.wall !== false, lights: rc.lights !== false, storage: rc.storage !== false, kiosk: rc.kiosk !== false,
    seats: Math.round(num(rc.seats, 0, 12, 3)), consult: rc.consult !== false, display: !!rc.display,
    ...(typeof rc.secondaryFloorId === 'string' && fid.has(rc.secondaryFloorId) && rc.secondaryFloorId !== recFloor ? { secondaryFloorId: rc.secondaryFloorId } : {})
  };
  const options: DesignOption[] = (Array.isArray(r.options) ? r.options.slice(0, LIMITS.options) : []).map((orr, i) => {
    const o = (orr || {}) as Record<string, unknown>;
    const placements: Placement[] = (Array.isArray(o.placements) ? o.placements.slice(0, LIMITS.placements) : []).flatMap(pr => {
      const p = (pr || {}) as Record<string, unknown>;
      if (!idOk(p.id) || typeof p.eqId !== 'string' || (known && !known.has(p.eqId)) || typeof p.floorId !== 'string' || !fid.has(p.floorId)) return [];
      return [{ id: p.id as string, eqId: p.eqId, floorId: p.floorId, x: num(p.x, -40, 40, 0), z: num(p.z, -40, 40, 0), rot: Math.round(num(p.rot, 0, 3, 0)), ...(p.locked ? { locked: true } : {}), ...(p.station ? { station: Math.round(num(p.station, 1, 99, 1)) } : {}) }];
    });
    const furniture: FurnitureItem[] = (Array.isArray(o.furniture) ? o.furniture.slice(0, LIMITS.furniture) : []).flatMap(fr => {
      const x = (fr || {}) as Record<string, unknown>;
      if (!idOk(x.id) || !FURN_KINDS.includes(x.kind as FurnKind) || typeof x.floorId !== 'string' || !fid.has(x.floorId)) return [];
      return [{ id: x.id as string, kind: x.kind as FurnKind, floorId: x.floorId, x: num(x.x, -40, 40, 0), z: num(x.z, -40, 40, 0), rot: Math.round(num(x.rot, 0, 3, 0)), w: num(x.w, .05, 40, 1), d: num(x.d, .05, 40, 1), ...(x.locked ? { locked: true } : {}), ...(x.label ? { label: str(x.label, 40) } : {}), ...(x.group === 'reception' || x.group === 'decor' ? { group: x.group } : {}) }];
    });
    const strs = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, 30).map(s => s.slice(0, 400)) : []);
    return {
      id: idOk(o.id) ? (o.id as string) : uid('op'), letter: 'ABC'[i], strategy: oneOf(o.strategy, STRATEGIES, 'perimeter'), version: Math.round(num(o.version, 1, 1e6, 1)),
      placements, furniture, reasons: strs(o.reasons), changes: strs(o.changes), warnings: strs(o.warnings),
      dropped: (Array.isArray(o.dropped) ? o.dropped.slice(0, 100) : []).flatMap(dr => { const d = (dr || {}) as Record<string, unknown>; return typeof d.eqId === 'string' && typeof d.floorId === 'string' ? [{ eqId: d.eqId, floorId: d.floorId, reason: str(d.reason, 300) }] : []; })
    };
  });
  const br = (r.brand || {}) as Record<string, unknown>;
  return {
    schema: GYM_SCHEMA, ...(typeof r.code === 'string' && /^GYM-[A-Z0-9]{6}$/.test(r.code) ? { code: r.code } : {}),
    version: Math.round(num(r.version, 1, 1e6, 1)), title: str(r.title, 120, 'Phòng tập của tôi') || 'Phòng tập của tôi',
    brief, floors: floors.sort((a, b2) => a.level - b2.level), links, reception,
    brand: { accent: color(br.accent, '#f26b1d'), logoText: str(br.logoText, 24, 'YOUR GYM') },
    options, active: Math.round(num(r.active, 0, Math.max(0, options.length - 1), 0)), updatedAt: Math.round(num(r.updatedAt, 0, 1e14, Date.now())),
    ...(normalizeScenario(r.scenario) ? { scenario: normalizeScenario(r.scenario)! } : {}),
    ...(r.simRun && typeof r.simRun === 'object' ? { simRun: simRunOf(r.simRun as Record<string, unknown>) } : {})
  };
}

/** Thiết bị theo id (dùng nhiều nơi) */
export const catalogMap = (eqs: Equipment[]) => new Map(eqs.map(e => [e.id, e]));

const simRunOf = (x: Record<string, unknown>) => ({ option: str(x.option, 4), layout: str(x.layout, 20), at: Math.round(num(x.at, 0, 1e14, 0)), source: str(x.source, 12), visitors: Math.round(num(x.visitors, 0, 1e5, 0)), peak: Math.round(num(x.peak, 0, 1e5, 0)), waitMachineSec: Math.round(num(x.waitMachineSec, 0, 1e5, 0)), deskWaitSec: Math.round(num(x.deskWaitSec, 0, 1e5, 0)), abandons: Math.round(num(x.abandons, 0, 1e5, 0)) });

/** Chuẩn hoá kịch bản mô phỏng (chỉ các trường biết trước, số hữu hạn, mảng ngắn) */
export function normalizeScenario(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== 'object') return null;
  const x = v as Record<string, unknown>;
  const n = (k: string, lo: number, hi: number) => (typeof x[k] === 'number' && Number.isFinite(x[k]) ? Math.min(hi, Math.max(lo, x[k] as number)) : undefined);
  const pair = (k: string, lo: number, hi: number) => { const a = x[k]; return Array.isArray(a) && a.length === 2 && a.every(y => typeof y === 'number' && Number.isFinite(y)) ? [Math.min(hi, Math.max(lo, a[0])), Math.min(hi, Math.max(lo, a[1]))] : undefined; };
  const rec = (k: string, keys: string[]) => { const o = x[k]; if (!o || typeof o !== 'object') return undefined; const out: Record<string, number> = {}; for (const kk of keys) { const val = (o as Record<string, unknown>)[kk]; if (typeof val === 'number' && Number.isFinite(val)) out[kk] = Math.min(1, Math.max(0, val)); } return Object.keys(out).length === keys.length ? out : undefined; };
  const open = n('open', 0, 23), close = n('close', 1, 24), visitors = n('visitors', 1, 5000);
  if (open === undefined || close === undefined || visitors === undefined || close <= open) return null;
  const profile = Array.isArray(x.profile) ? x.profile.slice(0, 24).map(y => (typeof y === 'number' && Number.isFinite(y) ? Math.max(0, y) : 0)) : [];
  const out: Record<string, unknown> = {
    open, close, visitors: Math.round(visitors), profile, mix: rec('mix', ['member', 'guest', 'pt']), groupRate: n('groupRate', 0, .9),
    programs: rec('programs', ['cardio', 'upper', 'lower', 'full', 'functional']), stay: pair('stay', 5, 400), setTime: pair('setTime', 10, 600), rest: pair('rest', 5, 900),
    chatChance: n('chatChance', 0, 1), chatTime: pair('chatTime', 5, 1800), patience: pair('patience', 5, 3600), staff: n('staff', 0, 10), trainers: n('trainers', 0, 30),
    ptSlots: Array.isArray(x.ptSlots) ? x.ptSlots.filter(y => typeof y === 'number' && Number.isFinite(y)).slice(0, 200) : [],
    allowShare: x.allowShare !== false, onGiveUp: x.onGiveUp === 'leave' ? 'leave' : 'skip', seed: Math.round(n('seed', 1, 1e6) ?? 1), source: x.source === 'calibrated' ? 'calibrated' : 'assumed'
  };
  return Object.values(out).some(v2 => v2 === undefined) ? null : out;
}
