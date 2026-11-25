/**
 * Mô phỏng một ngày vận hành phòng tập trên phương án đã thiết kế (thuần hàm, tái lập được bằng hạt giống).
 *
 *  - Kịch bản (Scenario): giờ mở / đóng, TỔNG lượt khách / ngày (số khách tạo ra luôn khớp đúng), phân bố theo giờ,
 *    tỷ lệ hội viên / khách mới / khách PT / nhóm đi cùng, chương trình tập, thời gian tập / nghỉ / trò chuyện,
 *    mức kiên nhẫn, số nhân viên lễ tân và huấn luyện viên. Mọi thông số mẫu là GIẢ ĐỊNH, có thể hiệu chỉnh bằng dữ liệu thật.
 *  - Danh sách khách sinh từ luồng ngẫu nhiên riêng (seed) → so sánh các bố trí dùng CÙNG khách.
 *  - Mỗi máy là một trạm có sức chứa (máy đa năng / giàn cáp 2 người, còn lại 1); tối đa 1 người chờ / trạm
 *    (không xếp hàng nối đuôi) — đông thì đổi bài, đổi máy cùng nhóm hoặc ra khu nước / giãn cơ rồi quay lại.
 *  - Tập luân phiên: máy tạ cho phép người chờ vào tập xen kẽ khi người đang dùng nghỉ giữa hiệp.
 *  - Trò chuyện: giữa người đi cùng / người quen / huấn luyện viên khi cùng nghỉ gần nhau; nếu đang giữ máy thì thời gian
 *    giữ máy kéo dài và người khác phải chờ — được thống kê riêng.
 *  - Đi lại trên lưới đi lại của từng tầng (lib/gym-geometry.ts NavGrid), đổi tầng qua cầu thang / thang máy đã khai báo.
 */
import type { Equipment, EquipmentKind } from './equipment.ts';
import { FURNITURE } from './gym-decor.ts';
import { activeOption, entranceFloor, hashString, layoutHash, type DesignOption, type Floor, type Project } from './gym-project.ts';
import { NavGrid, eqRects, entryPoints, fixtureRects, floorObstacles, furnRect, kindOf, linkRects, usePoint } from './gym-geometry.ts';
import { groupOf, muscleOf, type Group, type Muscle } from './gym-layout.ts';
import { LINK_KINDS } from './gym-project.ts';

/* ---------- Kịch bản ---------- */
export type Scenario = {
  open: number; close: number;
  /** tổng lượt khách trong ngày (không tính nhân viên, huấn luyện viên) */
  visitors: number;
  /** trọng số lượt đến theo từng giờ, từ giờ mở cửa (độ dài = close - open) */
  profile: number[];
  mix: { member: number; guest: number; pt: number };
  /** tỷ lệ khách đến theo nhóm 2–3 người */
  groupRate: number;
  programs: Record<ProgramKind, number>;
  stay: [number, number];
  setTime: [number, number];
  rest: [number, number];
  chatChance: number;
  chatTime: [number, number];
  patience: [number, number];
  staff: number; trainers: number;
  /** giờ hẹn PT cố định (vd 6.5 = 6:30); trống = phân bố theo lượt đến */
  ptSlots: number[];
  allowShare: boolean;
  /** chờ quá lâu: 'skip' = bỏ bài, 'leave' = về sớm sau 2 lần bỏ bài */
  onGiveUp: 'skip' | 'leave';
  seed: number;
  /** nguồn số liệu: 'assumed' = giả định mẫu, 'calibrated' = đã hiệu chỉnh bằng dữ liệu tổng hợp của khách */
  source: 'assumed' | 'calibrated';
};
export type ProgramKind = 'cardio' | 'upper' | 'lower' | 'full' | 'functional';
export const PROGRAM_LABEL: Record<ProgramKind, string> = { cardio: 'Cardio', upper: 'Thân trên', lower: 'Thân dưới', full: 'Toàn thân', functional: 'Chức năng / lớp nhóm' };

/** Phân bố lượt đến mẫu: hai đỉnh sáng 6–8h và tối 17–20h (giả định) */
export function defaultProfile(open: number, close: number) {
  const out: number[] = [];
  for (let h = Math.floor(open); h < Math.ceil(close); h++) {
    const morning = Math.exp(-((h + .5 - 6.8) ** 2) / 1.6), evening = Math.exp(-((h + .5 - 18.4) ** 2) / 2.2), noon = .35 * Math.exp(-((h + .5 - 12) ** 2) / 3);
    out.push(+(.08 + morning * .9 + evening * 1.2 + noon).toFixed(3));
  }
  return out;
}
export function defaultScenario(p: Project): Scenario {
  const area = p.floors.reduce((s, f) => s + f.w * f.l, 0);
  return {
    open: 5.5, close: 22, visitors: Math.max(30, Math.round(area * 1.4 / 10) * 10), profile: defaultProfile(5.5, 22),
    mix: p.brief.model === 'pt' ? { member: .45, guest: .1, pt: .45 } : { member: .78, guest: .07, pt: .15 },
    groupRate: .12, programs: p.brief.model === 'boutique' ? { cardio: .2, upper: .15, lower: .15, full: .2, functional: .3 } : { cardio: .25, upper: .22, lower: .2, full: .23, functional: .1 },
    stay: [45, 85], setTime: [35, 60], rest: [60, 120], chatChance: .3, chatTime: [40, 180], patience: [90, 240],
    staff: 2, trainers: p.brief.model === 'pt' ? 4 : 2, ptSlots: [], allowShare: true, onGiveUp: 'skip', seed: 1, source: 'assumed'
  };
}
export const scenarioHash = (s: Scenario) => hashString(JSON.stringify(s));

/** Hiệu chỉnh bằng dữ liệu tổng hợp: "giờ,lượt" mỗi dòng (vd "6,25"); check-in chỉ cho giờ đến, không cho thời gian lưu lại */
export function calibrate(s: Scenario, csv: string, avgStay?: number, ptTimes?: string): Scenario | string {
  const rows = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => l.split(/[,;\t ]+/).map(Number));
  if (rows.length && rows.some(r => r.length < 2 || !Number.isFinite(r[0]) || !Number.isFinite(r[1]) || r[0] < 0 || r[0] > 23 || r[1] < 0)) return 'Mỗi dòng cần "giờ,lượt", ví dụ 6,25 (giờ 0–23).';
  const next = { ...s, source: 'calibrated' as const };
  if (rows.length) {
    const open = Math.min(...rows.map(r => r[0])), close = Math.max(...rows.map(r => r[0])) + 1;
    const prof = Array.from({ length: close - open }, (_, i) => rows.filter(r => r[0] === open + i).reduce((a, r) => a + r[1], 0));
    const total = prof.reduce((a, b) => a + b, 0);
    if (!total) return 'Tổng lượt đến bằng 0.';
    Object.assign(next, { open, close, profile: prof, visitors: Math.round(total) });
  }
  if (avgStay && avgStay > 10 && avgStay < 300) next.stay = [Math.round(avgStay * .75), Math.round(avgStay * 1.25)];
  if (ptTimes) next.ptSlots = ptTimes.split(/[,;\s]+/).map(t => { const m = t.match(/^(\d{1,2})(?:[:h.](\d{1,2})?)?$/i); return m ? Number(m[1]) + Number(m[2] || 0) / 60 : NaN; }).filter(x => x >= next.open && x < next.close).slice(0, 200);
  return next;
}

/* ---------- Ngẫu nhiên tái lập ---------- */
export function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const between = (r: () => number, [a, b]: [number, number]) => a + (b - a) * r();
const pickW = <T extends string>(r: () => number, w: Record<T, number>): T => { const e = Object.entries(w) as [T, number][]; const tot = e.reduce((s, [, v]) => s + v, 0); let x = r() * tot; for (const [k, v] of e) { x -= v; if (x <= 0) return k; } return e[0][0]; };

/* ---------- Khách ảo ---------- */
export type VisitorKind = 'member' | 'guest' | 'pt';
export type Task = { label: string; group?: Group; kinds?: EquipmentKind[]; muscle?: Muscle[]; zone?: 'functional' | 'stretch'; sets: number; minutes?: number };
export type Visitor = { id: string; kind: VisitorKind; arrive: number; stay: number; program: ProgramKind; tasks: Task[]; patience: number; group?: string; acquaintance: boolean };

function programTasks(r: () => number, k: ProgramKind, pt: boolean): Task[] {
  const warm: Task = { label: 'Khởi động cardio', group: 'cardio', sets: 1, minutes: 5 + Math.round(r() * 4) };
  const m = (label: string, muscle: Muscle[]): Task => ({ label, group: 'machine', muscle, sets: 3 });
  const free = (label: string, kinds: EquipmentKind[]): Task => ({ label, group: 'free', kinds, sets: pt ? 4 : 3 });
  const shuffle = (a: Task[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let main: Task[];
  switch (k) {
    case 'cardio': main = [{ label: 'Cardio', group: 'cardio', sets: 1, minutes: 18 + Math.round(r() * 15) }, ...(r() < .5 ? [{ label: 'Cardio đổi máy', group: 'cardio' as Group, sets: 1, minutes: 10 + Math.round(r() * 8) }] : []), m('Bụng', ['core'])]; break;
    case 'upper': main = shuffle([m('Ngực', ['chest']), m('Lưng xô', ['back']), m('Vai', ['shoulder']), m('Tay', ['arms']), free('Tạ đơn / ghế', ['bench', 'dumbbell-rack'])]).slice(0, 3 + Math.round(r() * 2)); main.unshift(warm); break;
    case 'lower': main = shuffle([m('Đùi trước', ['legs']), m('Đùi sau / mông', ['legs']), free('Squat / khung tạ', ['rack', 'smith']), m('Bụng', ['core'])]).slice(0, 3 + Math.round(r())); main.unshift(warm); break;
    case 'full': main = shuffle([m('Ngực', ['chest']), m('Lưng xô', ['back']), m('Chân', ['legs']), free('Khung tạ', ['rack', 'smith']), m('Bụng', ['core'])]).slice(0, 4); main.unshift(warm); break;
    case 'functional': main = [{ label: 'Tập chức năng', zone: 'functional', sets: 1, minutes: 20 + Math.round(r() * 15) }, free('Tạ đơn', ['dumbbell-rack', 'bench']), ...(r() < .5 ? [{ label: 'Cardio', group: 'cardio' as Group, sets: 1, minutes: 10 }] : [])]; break;
  }
  main.push({ label: 'Giãn cơ', zone: 'stretch', sets: 1, minutes: 3 + Math.round(r() * 4) });
  return main;
}

/** Sinh danh sách khách — số khách tạo ra luôn đúng bằng `visitors` (nhóm được tính từng người) */
export function makeVisitors(s: Scenario): Visitor[] {
  const r = rng(s.seed * 7919 + 17);
  const hours = s.profile.length, tot = s.profile.reduce((a, b) => a + b, 0) || 1;
  // phân lượt theo giờ, làm tròn sao cho tổng đúng bằng visitors
  const raw = s.profile.map(w => (w / tot) * s.visitors);
  const counts = raw.map(Math.floor);
  let rest = s.visitors - counts.reduce((a, b) => a + b, 0);
  raw.map((v, i) => ({ i, f: v - Math.floor(v) })).sort((a, b) => b.f - a.f).forEach(({ i }) => { if (rest > 0) { counts[i]++; rest--; } });
  const out: Visitor[] = [];
  const ptSlots = [...s.ptSlots];
  let gid = 0;
  for (let h = 0; h < hours; h++) {
    let left = counts[h];
    while (left > 0) {
      const size = r() < s.groupRate && left >= 2 ? Math.min(left, r() < .7 ? 2 : 3) : 1;
      const kind: VisitorKind = size > 1 ? 'member' : pickW(r, s.mix);
      const arrive = (s.open + h + r()) * 3600;
      const program = kind === 'pt' ? (pickW(r, { upper: 1, lower: 1, full: 2 }) as ProgramKind) : pickW(r, s.programs);
      const g = size > 1 ? `g${++gid}` : undefined;
      const tasks = programTasks(r, program, kind === 'pt');
      for (let k = 0; k < size; k++) {
        let at = arrive + k * 20;
        if (kind === 'pt' && ptSlots.length) at = ptSlots.shift()! * 3600 - 120;
        out.push({ id: `v${out.length + 1}`, kind, arrive: Math.max(s.open * 3600, at), stay: between(r, kind === 'guest' ? [25, 45] : kind === 'pt' ? [60, 70] : s.stay) * 60, program, tasks: k ? structuredClone(tasks) : tasks, patience: between(r, s.patience), group: g, acquaintance: r() < .2 });
      }
      left -= size;
    }
  }
  return out.sort((a, b) => a.arrive - b.arrive);
}

/* ---------- Trạm & tài nguyên ---------- */
type Pt = { x: number; z: number };
type Station = {
  id: string; label: string; floorId: string; eq?: Equipment; group?: Group; kind?: EquipmentKind; muscle?: Muscle | '';
  zone?: 'functional' | 'stretch' | 'checkin' | 'desk' | 'consult' | 'locker' | 'water' | 'seat';
  cap: number; users: string[]; waiting: string[]; use: Pt; wait: Pt; face: [number, number]; shareable: boolean;
  busy: number; waitSum: number; waitN: number; maxWait: number; turnedAway: number; chatHold: number;
};
export type AgentState = 'arrive' | 'walk' | 'checkin' | 'wait-desk' | 'wait-consult' | 'consult' | 'tour' | 'change' | 'wait-trainer' | 'wait-machine' | 'exercise' | 'rest' | 'chat' | 'water' | 'stretch' | 'climb' | 'leave' | 'gone' | 'coach' | 'staff';
export const STATE_LABEL: Record<AgentState, string> = {
  arrive: 'Đến cửa', walk: 'Di chuyển', checkin: 'Check-in', 'wait-desk': 'Chờ lễ tân', 'wait-consult': 'Chờ tư vấn', consult: 'Đang tư vấn', tour: 'Tham quan',
  change: 'Thay đồ', 'wait-trainer': 'Chờ huấn luyện viên', 'wait-machine': 'Chờ máy', exercise: 'Đang tập', rest: 'Nghỉ giữa hiệp', chat: 'Trò chuyện', water: 'Uống nước',
  stretch: 'Giãn cơ', climb: 'Đổi tầng', leave: 'Rời phòng', gone: 'Đã về', coach: 'Hướng dẫn', staff: 'Trực quầy'
};
export type Agent = {
  id: string; role: VisitorKind | 'trainer' | 'staff'; v?: Visitor; floorId: string; x: number; z: number; fx: number; fz: number;
  state: AgentState; until: number; reason: string; next: string;
  path: Pt[]; pathFloor: string; after?: () => void;
  task: number; setsLeft: number; station?: string; waitSince?: number; skips: Set<number>; gaveUp: number;
  partner?: string; trainer?: string; client?: string; chatWith?: string; leaveAt: number;
  dist: number; floorChanges: number; waited: number; started: number;
};

export type SimStats = {
  visitors: number; created: number; finished: number; maxPresent: number; peakTime: number;
  timeline: { t: number; floors: Record<string, { present: number; exercising: number; waiting: number }> }[];
  waitMachineAvg: number; waitMachineMax: number; deskWaitAvg: number; deskWaitMax: number; consultWaitAvg: number;
  skips: number; abandons: number; earlyLeaves: number; reorders: number; shares: number; chats: number; chatHoldMin: number; blockedByChat: number;
  distanceAvg: number; floorChanges: number;
  stations: { id: string; label: string; floorId: string; util: number; waitN: number; waitAvg: number; turnedAway: number; chatHold: number }[];
  heat: Record<string, { size: number; cells: { x: number; z: number; v: number }[] }>;
  hot: { floorId: string; x: number; z: number; v: number }[];
};

/* ---------- Bộ mô phỏng ---------- */
export class Sim {
  t: number; end: number; dt = 2;
  s: Scenario; p: Project; o: DesignOption; catalog: Map<string, Equipment>;
  agents = new Map<string, Agent>();
  stations: Station[] = [];
  grids = new Map<string, NavGrid>();
  paths = new Map<string, Pt[] | null>();
  queue: Visitor[]; r: () => number;
  stats = { created: 0, finished: 0, maxPresent: 0, peakTime: 0, skips: 0, abandons: 0, earlyLeaves: 0, reorders: 0, shares: 0, chats: 0, chatHold: 0, blockedByChat: 0, deskW: [] as number[], consultW: [] as number[], machineW: [] as number[], dist: [] as number[], floorChanges: 0 };
  timeline: SimStats['timeline'] = [];
  heat = new Map<string, Float32Array>();
  entry: { floorId: string; door: Pt };
  layout: string; scenario: string;
  private seq = 0;

  constructor(p: Project, catalog: Map<string, Equipment>, s: Scenario, opt?: DesignOption) {
    this.p = p; this.o = opt ?? activeOption(p)!; this.catalog = catalog; this.s = s;
    this.t = s.open * 3600; this.end = s.close * 3600 + 1800;
    this.queue = makeVisitors(s);
    this.r = rng(s.seed * 104729 + 3);
    this.layout = layoutHash(p, this.o); this.scenario = scenarioHash(s);
    const ef = entranceFloor(p);
    const door = entryPoints(p, ef).find(e => e.kind === 'door') ?? { x: 0, z: ef.l / 2 - 1 };
    this.entry = { floorId: ef.id, door: { x: door.x, z: door.z } };
    for (const f of p.floors) {
      const obs = floorObstacles(p, f, this.o, catalog).filter(x => x.blocksWalk).map(x => x.body);
      this.grids.set(f.id, new NavGrid(f, obs, .28, .3));
      this.heat.set(f.id, new Float32Array(Math.ceil(f.w) * Math.ceil(f.l)));
    }
    this.buildStations();
    // nhân viên trực quầy + huấn luyện viên
    const desk = this.stations.find(x => x.zone === 'desk');
    for (let i = 0; i < (desk ? s.staff : 0); i++) {
      const px = -desk!.face[1], pz = desk!.face[0];
      const a = this.spawn('staff', desk!.floorId, desk!.use.x + desk!.face[0] * 1.5 + px * (i - (s.staff - 1) / 2) * .8, desk!.use.z + desk!.face[1] * 1.5 + pz * (i - (s.staff - 1) / 2) * .8);
      a.fx = -desk!.face[0]; a.fz = -desk!.face[1];
      a.state = 'staff'; a.reason = 'Trực quầy lễ tân'; a.until = Infinity;
    }
    for (let i = 0; i < s.trainers; i++) {
      const a = this.spawn('trainer', this.entry.floorId, this.entry.door.x + 1.5 + i * .6, this.entry.door.z - 2);
      a.state = 'stretch'; a.reason = 'Chờ khách PT'; a.until = Infinity;
      this.snap(a);
    }
  }

  /* --- dựng trạm từ phương án --- */
  private buildStations() {
    const { p, o } = this;
    for (const pl of o.placements) {
      const eq = this.catalog.get(pl.eqId);
      if (!eq) continue;
      const k = kindOf(eq), g = groupOf(eq);
      const u = usePoint(eq, pl.x, pl.z, pl.rot);
      const { clear } = eqRects(eq, pl.x, pl.z, pl.rot);
      const out = { x: u.on ? u.x - u.face[0] * 1.4 : u.x - u.face[0] * .9, z: u.on ? u.z - u.face[1] * 1.4 : u.z - u.face[1] * .9 };
      const wait = { x: Math.min(Math.max(out.x, clear.x0 - .4), clear.x1 + .4), z: Math.min(Math.max(out.z, clear.z0 - .4), clear.z1 + .4) };
      this.stations.push({ id: pl.id, label: eq.name, floorId: pl.floorId, eq, group: g ?? undefined, kind: k, muscle: muscleOf(eq), cap: k === 'multi' || k === 'cable' ? 2 : 1, users: [], waiting: [], use: { x: u.x, z: u.z }, wait, face: u.face, shareable: g !== 'cardio', busy: 0, waitSum: 0, waitN: 0, maxWait: 0, turnedAway: 0, chatHold: 0 });
    }
    const zone = (f: { id: string; kind: string; floorId: string; x: number; z: number; rot: number; w: number; d: number; label?: string }, z: Station['zone'], cap: number, label: string) => {
      const r = furnRect(f as never);
      this.stations.push({ id: f.id, label, floorId: f.floorId, zone: z, cap, users: [], waiting: [], use: { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 }, wait: { x: (r.x0 + r.x1) / 2, z: r.z1 + .6 }, face: [0, -1], shareable: false, busy: 0, waitSum: 0, waitN: 0, maxWait: 0, turnedAway: 0, chatHold: 0 });
    };
    for (const f of o.furniture) {
      const front = (d: number) => { const a = f.rot & 3; const dir = [[0, 1], [1, 0], [0, -1], [-1, 0]][a]; return { x: f.x + dir[0] * d, z: f.z + dir[1] * d, dir }; };
      if (f.kind === 'turf' || f.kind === 'mat-zone') { zone(f, 'functional', Math.max(2, Math.floor(f.w * f.d / 4)), FURNITURE[f.kind].label); zone({ ...f, id: f.id + ':s' }, 'stretch', Math.max(2, Math.floor(f.w * f.d / 3)), 'Khu giãn cơ'); }
      else if (f.kind === 'kiosk') { const fr = front(.7); this.stations.push({ id: f.id, label: 'Kiosk check-in', floorId: f.floorId, zone: 'checkin', cap: 1, users: [], waiting: [], use: fr, wait: front(1.5), face: [-fr.dir[0], -fr.dir[1]], shareable: false, busy: 0, waitSum: 0, waitN: 0, maxWait: 0, turnedAway: 0, chatHold: 0 }); }
      else if (f.kind.startsWith('desk')) { const fr = front(f.d / 2 + .55); this.stations.push({ id: f.id, label: 'Quầy lễ tân', floorId: f.floorId, zone: 'desk', cap: Math.max(1, this.s.staff), users: [], waiting: [], use: fr, wait: front(f.d / 2 + 1.6), face: [-fr.dir[0], -fr.dir[1]], shareable: false, busy: 0, waitSum: 0, waitN: 0, maxWait: 0, turnedAway: 0, chatHold: 0 }); }
      else if (f.kind === 'consult-table') this.stations.push({ id: f.id, label: 'Bàn tư vấn', floorId: f.floorId, zone: 'consult', cap: 1, users: [], waiting: [], use: { x: f.x + .55, z: f.z }, wait: { x: f.x, z: f.z + 1.2 }, face: [-1, 0], shareable: false, busy: 0, waitSum: 0, waitN: 0, maxWait: 0, turnedAway: 0, chatHold: 0 });
      else if (f.kind === 'sofa') zone(f, 'seat', Math.max(1, Math.round(f.w / .6)), 'Ghế chờ');
      else if (f.kind === 'water') { const fr = front(.6); this.stations.push({ id: f.id, label: 'Cây nước', floorId: f.floorId, zone: 'water', cap: 2, users: [], waiting: [], use: fr, wait: front(1.2), face: [-fr.dir[0], -fr.dir[1]], shareable: false, busy: 0, waitSum: 0, waitN: 0, maxWait: 0, turnedAway: 0, chatHold: 0 }); }
    }
    for (const f of p.floors) for (const fx of f.fixtures) if (fx.kind === 'locker') {
      const r = fixtureRects(fx, f).body;
      this.stations.push({ id: fx.id, label: 'Phòng thay đồ', floorId: f.id, zone: 'locker', cap: 30, users: [], waiting: [], use: { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 }, wait: { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 }, face: [0, 1], shareable: false, busy: 0, waitSum: 0, waitN: 0, maxWait: 0, turnedAway: 0, chatHold: 0 });
    }
  }

  private spawn(role: Agent['role'], floorId: string, x: number, z: number, v?: Visitor): Agent {
    const a: Agent = { id: v?.id ?? `${role}${++this.seq}`, role, v, floorId, x, z, fx: 0, fz: -1, state: 'arrive', until: this.t, reason: '', next: '', path: [], pathFloor: floorId, task: 0, setsLeft: 0, skips: new Set(), gaveUp: 0, leaveAt: v ? v.arrive + v.stay : Infinity, dist: 0, floorChanges: 0, waited: 0, started: this.t };
    this.agents.set(a.id, a);
    return a;
  }
  private snap(a: Agent) { const g = this.grids.get(a.floorId)!; const c = g.nearest(a.x, a.z, 3); if (c) { const [x, z] = g.center(c[0], c[1]); a.x = x; a.z = z; } }
  private floor(id: string) { return this.p.floors.find(f => f.id === id)!; }

  /* --- đi lại (cả đổi tầng qua cầu thang / thang máy) --- */
  private go(a: Agent, floorId: string, to: Pt, why: string, then: () => void) {
    a.reason = why;
    if (floorId !== a.floorId) {
      const ln = this.p.links.filter(l => l.floors.includes(a.floorId) && l.floors.includes(floorId)).sort((x, y) => (x.kind === 'elevator' ? 1 : 0) - (y.kind === 'elevator' ? 1 : 0))[0];
      if (!ln) { a.reason = `${why} — không có lối lên ${this.floor(floorId).name.toLowerCase()}`; then(); return; }
      const { entry } = linkRects(ln);
      this.walk(a, entry, () => {
        a.state = 'climb'; a.reason = `Đi ${LINK_KINDS[ln.kind].label.toLowerCase()} lên ${this.floor(floorId).name.toLowerCase()}`;
        const levels = Math.abs(this.floor(floorId).level - this.floor(a.floorId).level);
        a.until = this.t + (ln.kind === 'elevator' ? 20 + this.r() * 25 : 14 * levels);
        a.after = () => { a.floorId = floorId; a.x = entry.x; a.z = entry.z; a.floorChanges++; this.stats.floorChanges++; this.go(a, floorId, to, why, then); };
      });
      return;
    }
    this.walk(a, to, then);
  }
  private walk(a: Agent, to: Pt, then: () => void) {
    const g = this.grids.get(a.floorId)!;
    const key = `${a.floorId}|${Math.round(a.x * 2)}|${Math.round(a.z * 2)}|${Math.round(to.x * 2)}|${Math.round(to.z * 2)}`;
    let path = this.paths.get(key);
    if (path === undefined) { const pp = g.path(a.x, a.z, to.x, to.z); path = pp ? pp.map(([x, z]) => ({ x, z })) : null; if (this.paths.size < 20000) this.paths.set(key, path); }
    a.path = path ? [...path.slice(1), to] : [to];
    a.pathFloor = a.floorId;
    a.state = 'walk';
    a.after = then;
    a.until = Infinity;
  }

  /* --- vòng đời khách --- */
  private arrive(v: Visitor) {
    const a = this.spawn(v.kind, this.entry.floorId, this.entry.door.x, this.entry.door.z, v);
    this.snap(a);
    this.stats.created++;
    a.state = 'arrive'; a.reason = v.group ? 'Đến cùng nhóm' : 'Đến cửa';
    const kiosk = this.stations.find(x => x.zone === 'checkin'), desk = this.stations.find(x => x.zone === 'desk');
    if (v.kind === 'guest') {
      const seat = this.stations.find(x => x.zone === 'seat') ?? desk;
      if (seat) this.go(a, seat.floorId, seat.use, 'Khách mới vào sảnh, ngồi chờ tư vấn', () => this.waitConsult(a)); else this.startTraining(a);
      return;
    }
    const target = kiosk ?? desk;
    if (!target) { this.toLocker(a); return; }
    this.go(a, target.floorId, target.wait, kiosk ? 'Hội viên tới kiosk check-in QR' : 'Tới quầy lễ tân check-in', () => this.useStation(a, target, 'checkin', kiosk ? 8 + this.r() * 10 : 20 + this.r() * 30, () => this.toLocker(a)));
  }
  private waitConsult(a: Agent) {
    a.state = 'wait-consult'; a.reason = 'Ngồi ghế chờ, chờ nhân viên tư vấn'; a.waitSince = this.t; a.until = this.t + 30;
    a.after = () => {
      const c = this.stations.find(x => x.zone === 'consult') ?? this.stations.find(x => x.zone === 'desk');
      const staffFree = c && c.users.length < c.cap;
      if (c && staffFree) { const w = this.t - (a.waitSince ?? this.t); this.stats.consultW.push(w); a.waited += w; this.go(a, c.floorId, c.use, 'Có nhân viên rảnh — vào bàn tư vấn', () => this.useStation(a, c, 'consult', (6 + this.r() * 8) * 60, () => this.tour(a))); }
      else this.waitConsult(a);
    };
  }
  private tour(a: Agent) {
    // tham quan vài khu rồi tập thử ngắn hoặc ra về
    const pts = this.stations.filter(s => s.eq).sort(() => this.r() - .5).slice(0, 3);
    let i = 0;
    const step = () => {
      if (i >= pts.length) { if (this.r() < .55) { a.v!.tasks = a.v!.tasks.slice(0, 2); a.reason = 'Tham quan xong — tập thử'; this.toLocker(a); } else this.leave(a, 'Tham quan xong, hẹn quay lại'); return; }
      const s = pts[i++];
      this.go(a, s.floorId, s.wait, `Tham quan khu ${s.label}`, () => { a.state = 'tour'; a.reason = `Xem ${s.label}`; a.until = this.t + 20; a.after = step; });
    };
    step();
  }
  private toLocker(a: Agent) {
    const locker = this.stations.find(x => x.zone === 'locker');
    if (!locker) { this.startTraining(a); return; }
    this.go(a, locker.floorId, locker.use, 'Đi thay đồ', () => { a.state = 'change'; a.reason = 'Thay đồ, cất đồ'; a.until = this.t + (3 + this.r() * 3) * 60; a.after = () => this.startTraining(a); });
  }
  private startTraining(a: Agent) {
    if (a.role === 'pt' && !a.trainer) {
      const tr = [...this.agents.values()].find(x => x.role === 'trainer' && !x.client);
      if (!tr && this.t > a.leaveAt - 10 * 60) { this.stats.abandons++; this.leave(a, 'Chờ huấn luyện viên quá lâu — về'); return; }
      if (!tr) { a.state = 'wait-trainer'; a.reason = 'Mọi huấn luyện viên đang bận — chờ'; a.waitSince = this.t; a.until = this.t + 30; a.after = () => this.startTraining(a); return; }
      tr.client = a.id; a.trainer = tr.id; tr.state = 'coach'; tr.reason = `Hướng dẫn khách ${a.id}`;
      if (a.waitSince) a.waited += this.t - a.waitSince;
    }
    a.task = 0; this.nextTask(a);
  }
  /** Chọn bài tiếp theo: ưu tiên bài có máy trống trên tầng đang đứng, rồi tầng khác; giữ thứ tự khi có thể */
  private nextTask(a: Agent) {
    const v = a.v!;
    const closing = this.t >= this.s.close * 3600 - 600;
    if (closing || this.t >= a.leaveAt - 4 * 60 || a.task >= v.tasks.length) {
      const st = v.tasks.findIndex((t, i) => t.zone === 'stretch' && i >= a.task);
      if (!closing && st >= 0 && a.task < v.tasks.length && this.t < a.leaveAt) a.task = st;
      else { this.leave(a, closing ? 'Sắp đóng cửa' : a.task >= v.tasks.length ? 'Hoàn thành chương trình tập' : 'Hết thời gian dự kiến — chuẩn bị về'); return; }
    }
    let chosen = -1, best: Station | undefined, fallback: Station | undefined;
    for (let i = a.task; i < v.tasks.length; i++) {
      const cands = this.matching(v.tasks[i], a);
      if (!cands.length) {
        if (i === a.task) { a.reason = `Không có thiết bị / khu cho bài "${v.tasks[i].label}" — bỏ qua`; this.stats.skips++; a.task++; this.nextTask(a); return; }
        continue;
      }
      const free = cands.filter(s => s.users.length < s.cap || (this.s.allowShare && s.shareable && s.users.length === 1 && s.waiting.length === 0 && this.canShare(s))).sort((x, y) => this.cost(a, x) - this.cost(a, y));
      if (free.length) { chosen = i; best = free[0]; break; }
      if (i === a.task) fallback = cands.filter(s => s.waiting.length === 0).sort((x, y) => this.cost(a, x) - this.cost(a, y))[0];
      if (v.tasks[i].zone === 'stretch') break; // không vượt qua giãn cơ cuối buổi
    }
    if (!best && fallback) { chosen = a.task; best = fallback; }
    if (chosen < 0 || !best) { this.breather(a, `Máy cho "${v.tasks[a.task].label}" đều có người dùng và người chờ — nghỉ uống nước rồi quay lại`); return; }
    if (chosen !== a.task) { this.stats.reorders++; const [t] = v.tasks.splice(chosen, 1); v.tasks.splice(a.task, 0, t); a.reason = `Đổi thứ tự: làm "${t.label}" trước vì máy đang trống`; }
    const t = v.tasks[a.task];
    const s = best;
    a.next = `${t.label} tại ${s.label}`;
    const busy = s.users.length >= s.cap && !(this.s.allowShare && s.shareable && this.canShare(s));
    this.go(a, s.floorId, busy ? s.wait : s.use, `Đi tới ${s.label} cho bài "${t.label}"`, () => this.claim(a, s));
  }
  private matching(t: Task, a: Agent) {
    return this.stations.filter(s => {
      if (t.zone) return s.zone === (t.zone === 'stretch' ? 'stretch' : 'functional');
      if (!s.eq || s.group !== t.group) return false;
      if (t.kinds && !t.kinds.includes(s.kind!)) return false;
      if (t.muscle && !(t.muscle as string[]).includes(s.muscle as string)) return false;
      return true;
    }).filter(s => s.floorId === a.floorId || this.p.links.some(l => l.floors.includes(a.floorId) && l.floors.includes(s.floorId)));
  }
  private cost(a: Agent, s: Station) { return Math.hypot(s.use.x - a.x, s.use.z - a.z) + (s.floorId !== a.floorId ? 25 : 0) + s.users.length * 6; }
  private canShare(s: Station) { const u = this.agents.get(s.users[0]); return !!u && (u.state === 'rest' || u.state === 'chat'); }

  private claim(a: Agent, s: Station) {
    const t = a.v!.tasks[a.task];
    const sharing = s.users.length === 1 && s.cap === 1 && this.s.allowShare && s.shareable && this.canShare(s);
    if (s.users.length < s.cap || sharing) {
      if (sharing) this.stats.shares++;
      if (a.waitSince !== undefined) { const w = this.t - a.waitSince; s.waitSum += w; s.waitN++; s.maxWait = Math.max(s.maxWait, w); this.stats.machineW.push(w); a.waited += w; a.waitSince = undefined; s.waiting = s.waiting.filter(x => x !== a.id); }
      s.users.push(a.id); a.station = s.id; a.x = s.use.x; a.z = s.use.z; a.fx = s.face[0]; a.fz = s.face[1];
      a.setsLeft = t.sets;
      this.doSet(a, s, sharing ? 'Tập luân phiên: vào tập khi người kia nghỉ giữa hiệp' : `Máy trống → bắt đầu "${t.label}"`);
      return;
    }
    // máy bận: chờ (tối đa 1 người chờ), hoặc đổi
    if (s.waiting.length >= 1 && !s.waiting.includes(a.id)) { s.turnedAway++; this.stats.reorders++; a.reason = `${s.label} đã có người chờ — đổi bài / máy khác`; this.nextTaskAfterSkip(a, false); return; }
    if (!s.waiting.includes(a.id)) s.waiting.push(a.id);
    a.state = 'wait-machine'; a.reason = `${s.label} đang bận — đứng chờ cạnh máy`; a.x = s.wait.x; a.z = s.wait.z; a.waitSince ??= this.t; a.until = this.t + 10;
    a.after = () => {
      if (this.t - (a.waitSince ?? this.t) > a.v!.patience) {
        s.waiting = s.waiting.filter(x => x !== a.id);
        const w = this.t - (a.waitSince ?? this.t); s.waitSum += w; s.waitN++; s.maxWait = Math.max(s.maxWait, w); this.stats.machineW.push(w); a.waited += w; a.waitSince = undefined;
        this.nextTaskAfterSkip(a, true);
        return;
      }
      const alt = this.matching(a.v!.tasks[a.task], a).find(x => x !== s && x.users.length < x.cap && x.floorId === a.floorId);
      if (alt) { s.waiting = s.waiting.filter(x => x !== a.id); a.reason = `Thấy ${alt.label} trống — chuyển sang`; this.go(a, alt.floorId, alt.use, a.reason, () => this.claim(a, alt)); return; }
      // người đang dùng mải trò chuyện → ghi nhận cản trở
      if (s.users.some(u => this.agents.get(u)?.state === 'chat')) { this.stats.blockedByChat++; a.reason = `${s.label} đang có người giữ máy để trò chuyện — vẫn chờ`; }
      this.claim(a, s);
    };
  }
  /** Chờ quá mức kiên nhẫn → bỏ bài (hoặc về sớm), hoặc đổi thứ tự bài */
  private nextTaskAfterSkip(a: Agent, patienceOut: boolean) {
    const v = a.v!;
    if (patienceOut) {
      if (a.skips.has(a.task) || v.tasks.length - a.task <= 1) {
        this.stats.abandons++; a.gaveUp++;
        a.reason = `Chờ quá ${Math.round(v.patience / 60)} phút — bỏ bài "${v.tasks[a.task].label}"`;
        a.task++;
        if (this.s.onGiveUp === 'leave' && a.gaveUp >= 2) { this.stats.earlyLeaves++; this.leave(a, 'Bỏ 2 bài vì chờ lâu — về sớm'); return; }
      } else {
        this.stats.skips++; a.skips.add(a.task);
        const [t] = v.tasks.splice(a.task, 1); v.tasks.splice(Math.min(v.tasks.length - 1, a.task + 1), 0, t);
        a.reason = `Chờ quá lâu — để bài "${t.label}" lại sau`;
      }
    }
    this.nextTask(a);
  }
  private doSet(a: Agent, s: Station, why: string) {
    const t = a.v!.tasks[a.task];
    a.state = 'exercise'; a.reason = why;
    const dur = t.minutes ? t.minutes * 60 : between(this.r, this.s.setTime) * (a.role === 'pt' ? 1.1 : 1);
    a.until = this.t + dur;
    if (a.trainer) { const tr = this.agents.get(a.trainer); if (tr) { tr.floorId = a.floorId; tr.x = s.wait.x; tr.z = s.wait.z; tr.state = 'coach'; tr.reason = `Hướng dẫn ${t.label}`; tr.fx = a.x - tr.x; tr.fz = a.z - tr.z; } }
    a.after = () => {
      a.setsLeft--;
      if (a.setsLeft <= 0) { this.release(a, s); a.task++; a.reason = `Xong "${t.label}"`; if (this.r() < .25 && !a.trainer) this.breather(a, 'Uống nước giữa bài'); else this.nextTask(a); return; }
      // nghỉ giữa hiệp, vẫn giữ máy; luân phiên thì nghỉ ít nhất bằng một hiệp của người kia
      const partner = s.users.find(u => u !== a.id);
      let rest = between(this.r, this.s.rest) * (a.trainer ? 1.2 : 1);
      if (partner) rest = Math.max(rest, between(this.r, this.s.setTime));
      a.state = 'rest'; a.reason = partner ? 'Nghỉ — nhường người tập luân phiên' : 'Nghỉ giữa hiệp, vẫn giữ máy';
      a.until = this.t + rest;
      a.after = () => this.doSet(a, s, `Hiệp tiếp theo (còn ${a.setsLeft})`);
      this.maybeChat(a, s);
    };
  }
  /** Trò chuyện khi nghỉ: với người đi cùng, người quen hoặc huấn luyện viên ở gần */
  private maybeChat(a: Agent, s: Station) {
    if (this.r() > this.s.chatChance) return;
    const near = [...this.agents.values()].find(b => b !== a && b.floorId === a.floorId && (b.state === 'rest' || b.state === 'stretch' || b.state === 'water') && !b.chatWith && Math.hypot(b.x - a.x, b.z - a.z) < 4 && ((a.v?.group && b.v?.group === a.v.group) || (a.v?.acquaintance && b.v?.acquaintance)));
    const tr = a.trainer ? this.agents.get(a.trainer) : undefined;
    const who = near ?? tr;
    if (!who) return;
    const dur = between(this.r, this.s.chatTime);
    const end = Math.max(a.until, this.t + dur);
    const extra = end - a.until;
    a.state = 'chat'; a.chatWith = who.id; a.reason = `Trò chuyện với ${who === tr ? 'huấn luyện viên' : who.v?.group === a.v?.group ? 'người đi cùng' : 'người quen'} khi nghỉ${extra > 5 ? ` (giữ máy thêm ~${Math.round(extra)} giây)` : ''}`;
    a.fx = who.x - a.x; a.fz = who.z - a.z;
    a.until = end; this.stats.chats++;
    if (extra > 0) { this.stats.chatHold += extra; s.chatHold += extra; }
    if (who !== tr && who.state !== 'chat') { who.state = 'chat'; who.chatWith = a.id; who.fx = a.x - who.x; who.fz = a.z - who.z; who.reason = `Trò chuyện với ${a.v?.group && who.v?.group === a.v.group ? 'người đi cùng' : 'người quen'}`; who.until = Math.max(who.until, end); }
    const after = a.after;
    a.after = () => { a.chatWith = undefined; if (who.chatWith === a.id) who.chatWith = undefined; after?.(); };
  }
  private breather(a: Agent, why: string) {
    const water = this.stations.filter(x => x.zone === 'water' && (x.floorId === a.floorId || x.floorId === this.entry.floorId)).sort((x, y) => (x.floorId === a.floorId ? 0 : 1) - (y.floorId === a.floorId ? 0 : 1))[0];
    const back = () => this.nextTask(a);
    if (!water) { a.state = 'water'; a.reason = why; a.until = this.t + 45 + this.r() * 45; a.after = back; return; }
    this.go(a, water.floorId, water.use, why, () => { a.state = 'water'; a.reason = why; a.until = this.t + 30 + this.r() * 40; a.after = back; });
  }
  private useStation(a: Agent, s: Station, kind: 'checkin' | 'consult', dur: number, then: () => void) {
    if (s.users.length >= s.cap) {
      if (!s.waiting.includes(a.id)) s.waiting.push(a.id);
      a.state = s.zone === 'consult' ? 'wait-consult' : 'wait-desk'; a.reason = `${s.label} đang bận — chờ`; a.waitSince ??= this.t; a.until = this.t + 5;
      a.after = () => this.useStation(a, s, kind, dur, then);
      return;
    }
    if (a.waitSince !== undefined) { const w = this.t - a.waitSince; if (s.zone !== 'consult') this.stats.deskW.push(w); a.waited += w; a.waitSince = undefined; s.waitSum += w; s.waitN++; }
    else if (s.zone !== 'consult') this.stats.deskW.push(0);
    s.waiting = s.waiting.filter(x => x !== a.id);
    s.users.push(a.id); a.station = s.id; a.x = s.use.x; a.z = s.use.z; a.fx = s.face[0]; a.fz = s.face[1];
    a.state = kind === 'consult' ? 'consult' : 'checkin'; a.reason = kind === 'consult' ? 'Đang tư vấn gói tập' : 'Check-in';
    a.until = this.t + dur;
    a.after = () => { this.release(a, s); then(); };
  }
  private release(a: Agent, s: Station) { s.users = s.users.filter(x => x !== a.id); if (a.station === s.id) a.station = undefined; }
  private leave(a: Agent, why: string) {
    if (a.station) { const s = this.stations.find(x => x.id === a.station); if (s) this.release(a, s); }
    for (const s of this.stations) s.waiting = s.waiting.filter(x => x !== a.id);
    if (a.trainer) { const tr = this.agents.get(a.trainer); if (tr) { tr.client = undefined; tr.state = 'stretch'; tr.reason = 'Chờ khách PT'; } }
    a.next = 'Ra về';
    const st = this.stations.find(x => x.zone === 'stretch' && x.floorId === a.floorId && x.users.length < x.cap);
    const exit = () => this.go(a, this.entry.floorId, this.entry.door, `${why} — ra cửa`, () => { a.state = 'gone'; a.reason = 'Đã về'; this.stats.finished++; this.stats.dist.push(a.dist); this.agents.delete(a.id); });
    if (st && a.role !== 'guest' && a.v && !a.v.tasks.some((t, i) => t.zone === 'stretch' && i < a.task)) {
      this.go(a, st.floorId, { x: st.use.x + (this.r() - .5) * 2, z: st.use.z + (this.r() - .5) * 1.5 }, `${why} — giãn cơ trước khi về`, () => { a.state = 'stretch'; a.reason = 'Giãn cơ'; a.until = this.t + (2 + this.r() * 3) * 60; a.after = exit; });
      a.state = 'walk';
    } else { a.state = 'leave'; exit(); }
  }

  /* --- bước thời gian --- */
  step(seconds: number) {
    const end = Math.min(this.end, this.t + seconds);
    while (this.t < end) {
      this.t += this.dt;
      while (this.queue.length && this.queue[0].arrive <= this.t) this.arrive(this.queue.shift()!);
      for (const a of [...this.agents.values()]) this.tick(a);
      for (const st of this.stations) if (st.eq && st.users.length) st.busy += this.dt * Math.min(1, st.users.length / st.cap);
      if (Math.floor(this.t) % 300 < this.dt) this.sample();
    }
  }
  get done() { return this.t >= this.end || (this.queue.length === 0 && ![...this.agents.values()].some(a => a.v)); }
  private tick(a: Agent) {
    if (a.state === 'walk') {
      const speed = 1.25 * this.dt;
      let left = speed;
      while (left > 0 && a.path.length) {
        const p = a.path[0], dx = p.x - a.x, dz = p.z - a.z, d = Math.hypot(dx, dz);
        if (d <= left) { a.x = p.x; a.z = p.z; a.path.shift(); left -= d; a.dist += d; }
        else { a.x += (dx / d) * left; a.z += (dz / d) * left; a.dist += left; a.fx = dx; a.fz = dz; left = 0; }
      }
      const f = this.floor(a.floorId);
      const h = this.heat.get(a.floorId)!, ci = Math.min(Math.ceil(f.w) - 1, Math.max(0, Math.floor(a.x + f.w / 2))), cj = Math.min(Math.ceil(f.l) - 1, Math.max(0, Math.floor(a.z + f.l / 2)));
      h[cj * Math.ceil(f.w) + ci] += this.dt;
      if (!a.path.length) { const fn = a.after; a.after = undefined; a.state = 'arrive'; fn?.(); }
      return;
    }
    if (a.v && this.t > this.end - 600 && a.state !== 'leave' && a.state !== 'climb' && !a.next.startsWith('Ra về')) { this.leave(a, 'Sắp đóng cửa'); return; }
    if (this.t >= a.until) { const fn = a.after; a.after = undefined; a.until = Infinity; fn?.(); }
    // khách đứng yên / tập cũng tính vào ô nhiệt
    if (a.v && a.state !== 'gone') { const f = this.floor(a.floorId); const h = this.heat.get(a.floorId)!; const ci = Math.min(Math.ceil(f.w) - 1, Math.max(0, Math.floor(a.x + f.w / 2))), cj = Math.min(Math.ceil(f.l) - 1, Math.max(0, Math.floor(a.z + f.l / 2))); h[cj * Math.ceil(f.w) + ci] += this.dt * .3; }
  }
  private sample() {
    const floors: Record<string, { present: number; exercising: number; waiting: number }> = {};
    for (const f of this.p.floors) floors[f.id] = { present: 0, exercising: 0, waiting: 0 };
    let present = 0;
    for (const a of this.agents.values()) {
      if (!a.v) continue;
      present++;
      const x = floors[a.floorId];
      x.present++;
      if (a.state === 'exercise' || a.state === 'rest' || (a.state === 'chat' && a.station)) x.exercising++;
      if (a.state.startsWith('wait')) x.waiting++;
    }
    if (present > this.stats.maxPresent) { this.stats.maxPresent = present; this.stats.peakTime = this.t; }
    this.timeline.push({ t: this.t, floors });
  }

  /** Nhân vật để vẽ (tư thế khớp hoạt động và loại máy) */
  views(): { id: string; floorId: string; x: number; z: number; fx: number; fz: number; pose: 'walk' | 'stand' | 'sit' | 'lie' | 'run' | 'cycle' | 'chat' | 'wait' | 'lift'; color: string; role: Agent['role'] }[] {
    const out = [];
    for (const a of this.agents.values()) {
      const s = a.station ? this.stations.find(x => x.id === a.station) : undefined;
      let pose: 'walk' | 'stand' | 'sit' | 'lie' | 'run' | 'cycle' | 'chat' | 'wait' | 'lift' = 'stand';
      if (a.state === 'walk' || a.state === 'tour') pose = 'walk';
      else if (a.state === 'exercise' && s?.kind) pose = s.kind === 'treadmill' ? 'run' : s.kind === 'bike' || s.kind === 'recumbent' ? 'cycle' : s.kind === 'elliptical' || s.kind === 'rower' ? 'walk' : s.kind === 'bench' ? 'lie' : s.kind === 'stack' || s.kind === 'plate' ? 'sit' : 'lift';
      else if (a.state === 'exercise' && s?.zone === 'functional') pose = 'lift';
      else if (a.state === 'rest' && s?.kind && ['stack', 'plate', 'bench', 'bike', 'recumbent'].includes(s.kind)) pose = 'sit';
      else if (a.state === 'chat') pose = 'chat';
      else if (a.state.startsWith('wait')) pose = a.state === 'wait-consult' ? 'sit' : 'wait';
      else if (a.state === 'consult') pose = 'sit';
      out.push({ id: a.id, floorId: a.floorId, x: a.x, z: a.z, fx: a.fx || 0, fz: a.fz || -1, pose, color: COLOR[a.role], role: a.role });
    }
    return out;
  }
  info(id: string) {
    const a = this.agents.get(id);
    if (!a) return null;
    const t = a.v?.tasks[a.task];
    return {
      id, role: a.role, state: STATE_LABEL[a.state], reason: a.reason,
      next: a.v ? (a.next || (t ? `${t.label}` : 'Ra về')) : a.role === 'trainer' ? (a.client ? `Đi cùng khách ${a.client}` : 'Chờ lịch PT') : 'Trực quầy',
      program: a.v ? PROGRAM_LABEL[a.v.program] : '', tasksLeft: a.v ? a.v.tasks.slice(a.task).map(x => x.label) : [],
      minutes: Math.round((this.t - a.started) / 60), waited: Math.round(a.waited / 60 * 10) / 10, floor: this.floor(a.floorId).name, group: a.v?.group
    };
  }

  result(): SimStats {
    const avg = (x: number[]) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : 0);
    const open = (this.s.close - this.s.open) * 3600;
    const heat: SimStats['heat'] = {};
    const hot: SimStats['hot'] = [];
    for (const f of this.p.floors) {
      const h = this.heat.get(f.id)!, W = Math.ceil(f.w), L = Math.ceil(f.l);
      const max = Math.max(1, ...h);
      const cells: { x: number; z: number; v: number }[] = [];
      for (let j = 0; j < L; j++) for (let i = 0; i < W; i++) { const v = h[j * W + i] / max; if (v > .04) cells.push({ x: -f.w / 2 + i + .5, z: -f.l / 2 + j + .5, v }); }
      heat[f.id] = { size: 1, cells };
      for (const c of cells) if (c.v > .6) hot.push({ floorId: f.id, ...c });
    }
    return {
      visitors: this.s.visitors, created: this.stats.created, finished: this.stats.finished, maxPresent: this.stats.maxPresent, peakTime: this.stats.peakTime,
      timeline: this.timeline,
      waitMachineAvg: avg(this.stats.machineW), waitMachineMax: Math.max(0, ...this.stats.machineW), deskWaitAvg: avg(this.stats.deskW), deskWaitMax: Math.max(0, ...this.stats.deskW), consultWaitAvg: avg(this.stats.consultW),
      skips: this.stats.skips, abandons: this.stats.abandons, earlyLeaves: this.stats.earlyLeaves, reorders: this.stats.reorders, shares: this.stats.shares, chats: this.stats.chats, chatHoldMin: this.stats.chatHold / 60, blockedByChat: this.stats.blockedByChat,
      distanceAvg: avg(this.stats.dist), floorChanges: this.stats.floorChanges,
      stations: this.stations.filter(s => s.eq).map(s => ({ id: s.id, label: s.label, floorId: s.floorId, util: s.busy / open, waitN: s.waitN, waitAvg: s.waitN ? s.waitSum / s.waitN : 0, turnedAway: s.turnedAway, chatHold: s.chatHold })),
      heat, hot: hot.sort((a, b) => b.v - a.v).slice(0, 8)
    };
  }

  /** Kiểm tra nhất quán (dùng trong test): sức chứa, không giữ 2 máy, vị trí trong tầng */
  check(): string[] {
    const errs: string[] = [];
    for (const s of this.stations) {
      if (s.users.length > s.cap + (s.shareable && this.s.allowShare ? 1 : 0)) errs.push(`${s.label}: ${s.users.length} người > sức chứa`);
      if (new Set(s.users).size !== s.users.length) errs.push(`${s.label}: trùng người`);
      for (const u of s.users) if (!this.agents.has(u)) errs.push(`${s.label}: giữ máy bởi người đã về`);
    }
    const holding = new Map<string, number>();
    for (const s of this.stations) for (const u of s.users) holding.set(u, (holding.get(u) || 0) + 1);
    for (const [u, k] of holding) if (k > 1) errs.push(`${u} giữ ${k} trạm`);
    for (const a of this.agents.values()) { const f = this.floor(a.floorId); if (Math.abs(a.x) > f.w / 2 + .01 || Math.abs(a.z) > f.l / 2 + .01) errs.push(`${a.id} ra ngoài ${f.name}`); }
    return errs;
  }
}
const COLOR: Record<Agent['role'], string> = { member: '#2563eb', guest: '#16a34a', pt: '#f26b1d', trainer: '#111827', staff: '#7c3aed' };
export const ROLE_LABEL: Record<Agent['role'], string> = { member: 'Hội viên', guest: 'Khách mới', pt: 'Khách PT', trainer: 'Huấn luyện viên', staff: 'Lễ tân' };
export const ROLE_COLOR = COLOR;

/** Chạy nhiều lượt (hạt giống khác nhau) không vẽ → trung bình và dao động */
export function runMany(p: Project, catalog: Map<string, Equipment>, s: Scenario, runs: number, opt?: DesignOption) {
  const out: SimStats[] = [];
  for (let i = 0; i < runs; i++) { const sim = new Sim(p, catalog, { ...s, seed: s.seed + i }, opt); sim.step(1e9); out.push(sim.result()); }
  const keys = ['maxPresent', 'waitMachineAvg', 'waitMachineMax', 'deskWaitAvg', 'skips', 'abandons', 'shares', 'chats', 'chatHoldMin', 'distanceAvg', 'floorChanges'] as const;
  const agg = Object.fromEntries(keys.map(k => { const v = out.map(r => r[k]); return [k, { mean: v.reduce((a, b) => a + b, 0) / v.length, min: Math.min(...v), max: Math.max(...v) }]; })) as Record<(typeof keys)[number], { mean: number; min: number; max: number }>;
  return { runs: out, agg };
}
export type { Floor };
