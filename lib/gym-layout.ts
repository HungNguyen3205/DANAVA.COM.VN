/**
 * Tự động bố trí phòng tập nhiều tầng → 3 phương án khác biệt cho cùng nhu cầu.
 *
 * Trình tự mỗi tầng:
 *   1. Ranh giới + vật cố định (cửa, cột, WC, thay đồ, vùng không dùng) + lõi giao thông (cầu thang / thang máy + chiếu nghỉ).
 *   2. Giao thông: sảnh lễ tân cạnh cửa chính được dành chỗ TRƯỚC khi xếp máy; kiểu "Trục" dành thêm trục lối đi 2,2 m.
 *   3. Phân khu theo kiểu tổ chức (STRATEGIES): Mở trung tâm / Cụm trải nghiệm / Vòng tập / Trục trung tâm.
 *   4. Chọn thiết bị (selectEquipment): theo mô hình kinh doanh, công năng tầng, diện tích dùng được, chiều cao trần,
 *      ngân sách (chỉ máy có giá; máy thiếu giá liệt kê riêng), máy bắt buộc / loại trừ / đã khoá.
 *   5. Đặt máy theo hàng với khoảng trống vận hành (lib/gym-geometry.ts → checkEquipment, cùng bộ kiểm tra với giao diện).
 *   6. Kiểm tra tiếp cận: máy không có lối đi từ cửa / chiếu nghỉ bị loại khỏi phương án kèm lý do.
 *   7. Thẩm mỹ: dàn đều hàng máy, khu chức năng ở khoảng mở, gương, đèn tuyến tính, cây xanh theo phong cách.
 *
 * Ba phương án dùng CÙNG danh sách thiết bị và ngân sách; chỉ khác cách tổ chức. Máy nào một phương án không đặt được
 * thì ghi rõ trong `changes` / `dropped`. Phần đã khoá (máy, nội thất) được giữ nguyên khi tạo lại.
 * Thuần hàm, không phụ thuộc trình duyệt (test: tests/gym-layout.test.ts).
 */
import type { Equipment, EquipmentKind, Flooring } from './equipment.ts';
import { BUSINESS_MODELS, FIXTURE_KINDS, FLOOR_USES, STRATEGIES, entranceFloor, footOf, uid, type DesignOption, type Floor, type FurnitureItem, type Placement, type Project, type Strategy } from './gym-project.ts';
import { FURNITURE, INTERIOR_STYLES, buildReception, wallOf } from './gym-decor.ts';
import { NavGrid, accessCells, checkEquipment, eqRects, entryPoints, fixtureRects, flooringM2, floorObstacles, furnRect, grow, inside, kindOf, overlaps, rotFor, usableArea, type Obstacle, type Rect } from './gym-geometry.ts';

/* ---------- Nhóm máy ---------- */

const CARDIO: EquipmentKind[] = ['treadmill', 'bike', 'elliptical', 'rower', 'recumbent'];
const FREE: EquipmentKind[] = ['rack', 'smith', 'bench', 'dumbbell-rack', 'plate-tree'];
const MACHINE: EquipmentKind[] = ['stack', 'plate', 'multi', 'cable'];
export type Group = 'cardio' | 'machine' | 'free';
export const groupOf = (e: Equipment): Group | null => { const k = kindOf(e); return CARDIO.includes(k) ? 'cardio' : FREE.includes(k) ? 'free' : MACHINE.includes(k) ? 'machine' : null; };

/** Nhóm cơ (máy sức mạnh), đoán theo tên máy */
export const MUSCLES = {
  legs: { label: 'Chân · mông', re: /leg|squat|hack|glute|hip|calf|abduct|adduct|lunge|pendulum|kick|nordic|đùi|mông|chân|bắp/i },
  chest: { label: 'Ngực', re: /chest|fly|pec|bench press|dip|ngực/i },
  back: { label: 'Lưng · xô', re: /\blat\b|pulldown|pull down|row|pull|back|hyper|chèo|lưng|xô/i },
  shoulder: { label: 'Vai', re: /shoulder|lateral|delt|raise|vertical press|vai/i },
  arms: { label: 'Tay', re: /bicep|tricep|\barm|curl|tay/i },
  core: { label: 'Bụng', re: /abdom|\bab\b|crunch|torso|rotary|core|sit-?up|bụng/i },
  rig: { label: 'Giàn · khung đa năng', re: /rack|smith|multi|station|cage|functional|trainer|cable|jammer/i },
  other: { label: 'Khác', re: /$^/ }
} as const;
export type Muscle = keyof typeof MUSCLES;
export function muscleOf(e: Equipment): Muscle | '' {
  if (e.category !== 'strength') return '';
  if (e.kind === 'rack' || e.kind === 'smith' || e.kind === 'multi' || e.kind === 'cable') return 'rig';
  return (Object.keys(MUSCLES) as Muscle[]).find(m => MUSCLES[m].re.test(e.name)) || 'other';
}
/** Bài tập (để không chọn 2 máy cùng bài trên một tầng) */
const EXERCISES: [string, RegExp][] = [
  ['chest', /chest press|đẩy ngực|vertical press|incline chest|pectoral|tập ngực/i], ['lat', /pulldown|pull down|kéo xô|lat /i], ['row', /row|chèo/i],
  ['legpress', /leg press|đạp đùi/i], ['legext', /leg extensi|đá đùi/i], ['legcurl', /leg curl|móc đùi|đùi sau/i],
  ['shoulder', /shoulder press|tập vai|vai/i], ['fly', /pec fly|fly|rear delt/i], ['abd', /abductor|adductor|hip|mông|glute/i],
  ['abs', /abdominal|bụng|torso|rotary/i], ['back', /back extension|lưng/i], ['arm', /curl|tricep|bicep|arm/i], ['calf', /calf|bắp chân/i]
];
export const exerciseOf = (name: string) => EXERCISES.find(([, re]) => re.test(name))?.[0] ?? name.toLowerCase();
const PRIORITY = ['chest', 'lat', 'legpress', 'shoulder', 'row', 'legext', 'legcurl', 'fly', 'abs', 'abd', 'back', 'arm', 'calf'];
const isUpper = (e: Equipment) => ['chest', 'back', 'shoulder', 'arms'].includes(muscleOf(e));

/* ---------- 4. Chọn thiết bị ---------- */

export type Selection = {
  floors: { floorId: string; eqs: Equipment[]; mix: { cardio: number; machine: number; free: number }; stations: number; budget: number; notes: string[] }[];
  /** máy thiếu giá được chọn (bắt buộc / không có máy cùng loại có giá) — không tính vào ngân sách */
  unpriced: Equipment[];
  spent: number;
  flooringReserve: number;
  notes: string[];
};
const price = (e: Equipment) => (e.price ? Number(e.price) : 0);

/** Công năng thực tế của tầng khi để "Tự đề xuất" */
function floorMix(project: Project, floor: Floor) {
  const u = FLOOR_USES[floor.use];
  if (u.mix) return { mix: u.mix, why: `Công năng tầng: ${u.label}` };
  const model = BUSINESS_MODELS[project.brief.model];
  if (project.floors.length === 1) return { mix: model.mix, why: `Theo mô hình ${model.label}` };
  const sorted = [...project.floors].sort((a, b) => a.level - b.level);
  const isGround = floor.id === sorted[0].id, isTop = floor.id === sorted[sorted.length - 1].id;
  if (isGround) return { mix: { cardio: model.mix.cardio * .5, machine: model.mix.machine, free: model.mix.free + model.mix.cardio * .5 }, why: 'Ưu tiên máy tạ và tạ tự do (thiết bị nặng, ồn khi thả tạ đặt ở tầng thấp nhất)' };
  if (project.brief.model === 'pt') return { mix: FLOOR_USES.pt.mix!, why: 'Khu PT 1-1 yên tĩnh, tách khỏi luồng hội viên' };
  if (isTop) return { mix: { cardio: Math.min(.7, model.mix.cardio * 1.8), machine: model.mix.machine * .7, free: .08 }, why: 'Ưu tiên cardio và máy nhẹ, hạn chế tạ rơi (cần xác minh tải trọng)' };
  return { mix: model.mix, why: 'Tổng hợp' };
}

/**
 * Chọn thiết bị cho từng tầng. `keep` = các máy đã khoá (giữ nguyên vị trí, được tính vào số lượng và ngân sách).
 * Ngân sách: ngân sách tầng (nếu khai báo) hoặc chia ngân sách dự án theo diện tích dùng được, sau khi trừ chi phí thảm sàn.
 */
export function selectEquipment(project: Project, catalog: Equipment[], keep: Placement[] = [], flooring?: Flooring | null): Selection {
  const byId = new Map(catalog.map(e => [e.id, e]));
  const excluded = new Set(project.brief.exclude);
  const usable = catalog.filter(e => e.published && e.category !== 'accessory' && !excluded.has(kindOf(e)) && groupOf(e));
  const notes: string[] = [];
  const unpriced: Equipment[] = [];
  const reception = project.reception;
  const reserved = new Map<string, Rect[]>();
  if (reception.enabled) {
    const f = project.floors.find(x => x.id === reception.floorId);
    const door = f?.fixtures.find(x => x.kind === 'door' && x.main) || f?.fixtures.find(x => x.kind === 'door');
    if (f && door) { const z = buildReception(reception, f, door).zone; if (z) reserved.set(f.id, [z]); }
  }
  const floorInfo = project.floors.map(f => ({ f, usable: usableArea(project, f, reserved.get(f.id)) }));
  const totalUsable = floorInfo.reduce((s, x) => s + x.usable, 0) || 1;
  // Chi phí thảm sàn (có giá) trừ trước khỏi ngân sách
  let flooringReserve = 0;
  if (flooring?.price) for (const { f } of floorInfo) flooringReserve += Math.ceil(flooringM2(project, f) / ((flooring.sizeCm / 100) ** 2)) * Number(flooring.price);
  const budget = project.brief.budget;
  const explicit = project.floors.reduce((s, f) => s + f.budget, 0);
  const shared = budget ? Math.max(0, budget - flooringReserve - explicit) : 0;
  const sharedArea = floorInfo.filter(x => !x.f.budget).reduce((s, x) => s + x.usable, 0) || 1;
  if (budget && flooringReserve) notes.push(`Đã dành ${Math.round(flooringReserve / 1e6).toLocaleString('vi-VN')} triệu cho thảm sàn cao su trước khi chọn máy.`);
  if (budget && budget <= flooringReserve) notes.push('Ngân sách chưa đủ cho thảm sàn — cần tăng ngân sách hoặc chọn sàn khác.');

  let spent = 0;
  const seenTotal = new Set<string>();
  const result: Selection['floors'] = [];
  const mustHave = project.brief.mustHave.map(id => byId.get(id)).filter((e): e is Equipment => !!e);
  const placedMust = new Set<string>();
  const sortedFloors = [...floorInfo].sort((a, b) => (a.f.id === entranceFloor(project).id ? -1 : 0) - (b.f.id === entranceFloor(project).id ? -1 : 0) || a.f.level - b.f.level);

  for (const { f, usable: ua } of sortedFloors) {
    const fNotes: string[] = [];
    const { mix, why } = floorMix(project, f);
    fNotes.push(why);
    const model = BUSINESS_MODELS[project.brief.model];
    const capacity = Math.max(1, Math.floor((ua * (1 - model.functional)) / model.m2PerStation));
    const stations = f.users ? Math.min(capacity, Math.max(1, Math.ceil(f.users * .85))) : capacity;
    if (f.users && f.users * .85 > capacity) fNotes.push(`${f.users} người cùng lúc vượt sức chứa ~${capacity} trạm của diện tích dùng được — sẽ đông, cân nhắc giảm số người hoặc tăng diện tích.`);
    const fBudget = budget ? (f.budget || shared * ((ua) / (f.budget ? 1 : sharedArea))) : 0;
    let fSpent = 0;
    const lockedHere = keep.filter(p => p.floorId === f.id).map(p => byId.get(p.eqId)).filter((e): e is Equipment => !!e);
    for (const e of lockedHere) { fSpent += price(e); }
    const tooTall = (e: Equipment) => e.height / 100 > f.h - .25 || (kindOf(e) === 'treadmill' && f.h < 2.6);
    const heavyUpper = (e: Equipment) => f.level > 0 && ['rack', 'smith', 'plate', 'dumbbell-rack', 'plate-tree'].includes(kindOf(e));
    const pool = usable.filter(e => !tooTall(e));
    if (usable.length !== pool.length) fNotes.push(`Bỏ qua ${usable.length - pool.length} máy cao hơn trần ${f.h} m (trừ chừa đầu người tập).`);
    const want = { cardio: Math.round(stations * mix.cardio), machine: Math.round(stations * mix.machine), free: Math.max(0, stations - Math.round(stations * mix.cardio) - Math.round(stations * mix.machine)) };
    for (const e of lockedHere) { const g = groupOf(e); if (g && want[g] > 0) want[g]--; }
    const picks: Equipment[] = [];
    const afford = (e: Equipment) => !fBudget || !e.price || fSpent + price(e) <= fBudget;
    const take = (e: Equipment) => { picks.push(e); fSpent += price(e); if (!e.price && !unpriced.includes(e)) unpriced.push(e); };
    // Máy bắt buộc: đặt ở tầng đầu tiên phù hợp (tầng có lối vào trước)
    for (const e of mustHave) if (!placedMust.has(e.id) && !tooTall(e)) { take(e); placedMust.add(e.id); const g = groupOf(e); if (g && want[g] > 0) want[g]--; fNotes.push(`Máy bắt buộc: ${e.name}.`); }
    // Hạng giá: ngân sách / trạm thấp → máy rẻ trước; không giới hạn → máy tầm trung (~30 triệu)
    const perStation = fBudget && stations ? fBudget / stations : 0;
    const tier = (a: Equipment, b: Equipment) => {
      if (!!a.price !== !!b.price) return a.price ? -1 : 1;
      if (!perStation) return Math.abs(price(a) - 30e6) - Math.abs(price(b) - 30e6);
      return Math.abs(price(a) - perStation * .9) - Math.abs(price(b) - perStation * .9);
    };
    // Cardio: xen kẽ máy chạy / xe đạp / elip / chèo
    const cardioPool = pool.filter(e => groupOf(e) === 'cardio').sort(tier);
    const byKind = (k: EquipmentKind) => cardioPool.filter(e => e.kind === k);
    const cardioSeq: EquipmentKind[] = ['treadmill', 'treadmill', 'bike', 'treadmill', 'elliptical', 'bike', 'treadmill', 'rower', 'recumbent'];
    for (let i = 0, n = 0; n < want.cardio && i < want.cardio * 4; i++) {
      const k = cardioSeq[i % cardioSeq.length];
      const list = byKind(k).length ? byKind(k) : cardioPool;
      const e = list.find(x => afford(x) && x.price) ?? (list.find(x => !x.price) && !list.some(x => x.price) ? list[0] : undefined);
      if (!e) continue;
      take(e); n++;
    }
    // Tạ tự do: khung, ghế, kệ tạ đơn, giá bánh tạ (tầng trên: hạn chế đồ nặng nếu tầng không phải sức mạnh)
    const freePool = pool.filter(e => groupOf(e) === 'free').sort(tier);
    const freeSeq: EquipmentKind[] = ['dumbbell-rack', 'bench', 'rack', 'bench', 'smith', 'plate-tree', 'bench', 'rack', 'bench'];
    for (let i = 0, n = 0; n < want.free && i < want.free * 4; i++) {
      const k = freeSeq[i % freeSeq.length];
      const e = freePool.find(x => x.kind === k && afford(x) && (x.price || !freePool.some(y => y.kind === k && y.price)) && !(heavyUpper(x) && f.use === 'auto' && k !== 'bench' && k !== 'dumbbell-rack') && (k === 'bench' || !picks.includes(x)));
      if (!e) continue;
      take(e); n++;
    }
    // Máy tạ: mỗi bài một máy, bài chính trước, cùng dòng máy với máy đầu tiên (đồng bộ thẩm mỹ)
    const machPool = pool.filter(e => groupOf(e) === 'machine').sort(tier);
    const series = (n: string) => n.split(/[\s-]/)[0].replace(/\d+/g, '').toUpperCase();
    const lead = machPool[0] ? series(machPool[0].name) : '';
    const rank = (e: Equipment) => { const i = PRIORITY.indexOf(exerciseOf(e.name)); return i < 0 ? PRIORITY.length : i; };
    const ordered = [...machPool.filter(e => series(e.name) === lead), ...machPool.filter(e => series(e.name) !== lead)].map((e, i) => ({ e, i })).sort((a, b) => rank(a.e) - rank(b.e) || a.i - b.i).map(x => x.e);
    const seen = new Set<string>(lockedHere.map(e => exerciseOf(e.name)));
    for (const e of ordered) {
      if (picks.filter(p => groupOf(p) === 'machine').length >= want.machine + mustHave.filter(m => groupOf(m) === 'machine' && picks.includes(m)).length) break;
      const ex = exerciseOf(e.name);
      if (seen.has(ex) || !afford(e) || !e.price) continue;
      seen.add(ex); take(e);
    }
    if (fBudget && fSpent > fBudget) fNotes.push('Máy đã khoá / bắt buộc vượt ngân sách tầng.');
    const got = { cardio: picks.filter(e => groupOf(e) === 'cardio').length, machine: picks.filter(e => groupOf(e) === 'machine').length, free: picks.filter(e => groupOf(e) === 'free').length };
    if (fBudget && got.cardio + got.machine + got.free < want.cardio + want.machine + want.free) fNotes.push(`Ngân sách tầng ~${Math.round(fBudget / 1e6).toLocaleString('vi-VN')} triệu chỉ đủ ${picks.length}/${stations} trạm dự kiến.`);
    spent += fSpent;
    for (const e of picks) seenTotal.add(e.id);
    result.push({ floorId: f.id, eqs: picks, mix, stations, budget: fBudget, notes: fNotes });
  }
  for (const e of mustHave) if (!placedMust.has(e.id)) notes.push(`Không đưa được máy bắt buộc ${e.name} vào tầng nào (trần thấp hoặc hết chỗ).`);
  if (unpriced.length) notes.push(`${unpriced.length} máy chưa có giá được chọn (liệt kê riêng, chưa tính vào ngân sách).`);
  result.sort((a, b) => project.floors.findIndex(f => f.id === a.floorId) - project.floors.findIndex(f => f.id === b.floorId));
  return { floors: result, unpriced, spent, flooringReserve, notes };
}

/* ---------- 5. Đặt máy theo hàng ---------- */

type Row = {
  /** điểm đầu của đường hàng, hướng dọc hàng, hướng máy toả ra từ đường hàng */
  x: number; z: number; dx: number; dz: number; ex: number; ez: number; len: number;
  /** hướng mặt sử dụng của máy */ fx: number; fz: number;
  /** 'clear': mép khoảng trống chạm đường (dọc tường); 'body': mép thân máy chạm đường (khoảng trống được tràn sang lối đi) */
  align: 'clear' | 'body';
  /** thân máy phải nằm trong vùng này */ within?: Rect;
  gap?: number;
};

class Placer {
  placements: Placement[] = [];
  dropped: { eqId: string; floorId: string; reason: string }[] = [];
  floor: Floor; obstacles: Obstacle[]; zones: { rect: Rect; label: string }[]; byId: Map<string, Equipment>;
  constructor(floor: Floor, obstacles: Obstacle[], zones: { rect: Rect; label: string }[], byId: Map<string, Equipment>) {
    this.floor = floor; this.obstacles = obstacles; this.zones = zones; this.byId = byId;
  }
  private obs(): Obstacle[] {
    return [...this.obstacles, ...this.placements.map(p => { const eq = this.byId.get(p.eqId)!; const r = eqRects(eq, p.x, p.z, p.rot); return { id: p.id, type: 'eq' as const, label: eq.name, body: r.body, keep: r.clear, blocksWalk: true }; })];
  }
  ok(eq: Equipment, x: number, z: number, rot: number, within?: Rect) {
    if (within) { const { body } = eqRects(eq, x, z, rot); if (!(body.x0 >= within.x0 - 1e-3 && body.x1 <= within.x1 + 1e-3 && body.z0 >= within.z0 - 1e-3 && body.z1 <= within.z1 + 1e-3)) return false; }
    return !checkEquipment(eq, x, z, rot, this.floor, this.obs(), this.zones);
  }
  put(eq: Equipment, x: number, z: number, rot: number) { const p: Placement = { id: uid('pl'), eqId: eq.id, floorId: this.floor.id, x, z, rot }; this.placements.push(p); return p; }
  /** Hướng xoay theo vai trò máy: cardio quay bảng điều khiển về đường hàng (tường), máy khác quay mặt sử dụng theo hướng mặt */
  rotOf(eq: Equipment, r: Row) {
    if (groupOf(eq) === 'cardio') return r.align === 'clear' ? rotFor('x', -r.ex, -r.ez) : rotFor('x', -r.fx, -r.fz);
    return rotFor('z', r.fx, r.fz);
  }
  /** Xếp lần lượt dọc hàng; trả về máy chưa đặt được */
  row(r: Row, eqs: Equipment[]): Equipment[] {
    const left: Equipment[] = [];
    const placedHere: Placement[] = [];
    let t = 0;
    for (const eq of eqs) {
      const rot = this.rotOf(eq, r);
      const { body, clear } = eqRects(eq, 0, 0, rot);
      // phần thân / khoảng trống theo hướng dọc hàng (d) và hướng toả (e)
      const proj = (rc: Rect, ux: number, uz: number) => { const a = ux ? (ux > 0 ? [rc.x0, rc.x1] : [-rc.x1, -rc.x0]) : (uz > 0 ? [rc.z0, rc.z1] : [-rc.z1, -rc.z0]); return a; };
      const [, bd1] = proj(body, r.dx, r.dz), [cd0] = proj(clear, r.dx, r.dz);
      const [be0] = proj(body, r.ex, r.ez), [ce0] = proj(clear, r.ex, r.ez);
      const eOff = r.align === 'clear' ? -ce0 : -be0; // khoảng từ đường hàng tới tâm theo hướng e
      let done = false;
      // s = vị trí mép khoảng trống phía đầu hàng; tâm máy = s - cd0; thân máy phải kết thúc trước cuối hàng
      for (let s = Math.max(t, 0); s - cd0 + bd1 <= r.len + 1e-6; s += .1) {
        const c = s - cd0;
        const x = r.x + r.dx * c + r.ex * eOff, z = r.z + r.dz * c + r.ez * eOff;
        if (this.ok(eq, x, z, rot, r.within)) { placedHere.push(this.put(eq, x, z, rot)); t = c + bd1 + (r.gap ?? 0); done = true; break; }
      }
      if (!done) left.push(eq);
    }
    this.justify(r, placedHere);
    return left;
  }
  /** Dàn đều các máy trong một hàng theo phần dư (giữ nếu vẫn hợp lệ) */
  private justify(r: Row, ps: Placement[]) {
    if (ps.length < 2) return;
    const coord = (p: Placement) => (p.x - r.x) * r.dx + (p.z - r.z) * r.dz;
    ps.sort((a, b) => coord(a) - coord(b));
    const last = ps[ps.length - 1], eq = this.byId.get(last.eqId)!;
    const { clear } = eqRects(eq, last.x, last.z, last.rot);
    const end = r.dx > 0 ? clear.x1 - r.x : r.dx < 0 ? r.x - clear.x0 : r.dz > 0 ? clear.z1 - r.z : r.z - clear.z0;
    const slack = Math.min(r.len - end, ps.length * .6);
    if (slack < .3) return;
    const step = slack / ps.length;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i], q = this.byId.get(p.eqId)!;
      const shift = step * (i + .5);
      const nx = Math.round((p.x + r.dx * shift) * 100) / 100, nz = Math.round((p.z + r.dz * shift) * 100) / 100;
      this.placements = this.placements.filter(x => x !== p);
      if (this.ok(q, nx, nz, p.rot, r.within)) { p.x = nx; p.z = nz; }
      this.placements.push(p);
    }
  }
}

/** Đường hàng dọc một bức tường (máy toả vào trong phòng, quay mặt vào phòng) */
function wallRow(f: Floor, wall: 'back' | 'front' | 'left' | 'right', gap = .15): Row {
  const W = f.w, L = f.l;
  switch (wall) {
    case 'back': return { x: -W / 2, z: -L / 2, dx: 1, dz: 0, ex: 0, ez: 1, fx: 0, fz: 1, len: W, align: 'clear', gap };
    case 'front': return { x: -W / 2, z: L / 2, dx: 1, dz: 0, ex: 0, ez: -1, fx: 0, fz: -1, len: W, align: 'clear', gap };
    case 'left': return { x: -W / 2, z: -L / 2, dx: 0, dz: 1, ex: 1, ez: 0, fx: 1, fz: 0, len: L, align: 'clear', gap };
    case 'right': return { x: W / 2, z: -L / 2, dx: 0, dz: 1, ex: -1, ez: 0, fx: -1, fz: 0, len: L, align: 'clear', gap };
  }
}
const OPP = { back: 'front', front: 'back', left: 'right', right: 'left' } as const;
type Wall = keyof typeof OPP;

/** Tường có cửa vào của tầng (cửa chính, hoặc tường gần chiếu nghỉ cầu thang ở tầng trên) */
function entryWall(project: Project, f: Floor): Wall {
  const e = entryPoints(project, f)[0];
  if (!e) return 'front';
  return wallOf(f, e.x, e.z).wall;
}
/** Tường nhiều cửa sổ nhất (cardio nhìn ra ngoài); không có thì tường đối diện cửa vào */
function viewWall(project: Project, f: Floor): Wall {
  const counts = new Map<Wall, number>();
  for (const x of f.fixtures) if (x.kind === 'window') { const w = wallOf(f, x.x, x.z).wall; counts.set(w, (counts.get(w) || 0) + x.w); }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : OPP[entryWall(project, f)];
}

/** Hình chữ nhật trống lớn nhất mọc ra từ một điểm (để đặt khu chức năng ở khoảng mở) */
export function growFree(cx: number, cz: number, f: Floor, blockers: Rect[]): Rect | null {
  const r: Rect = { x0: cx - .3, x1: cx + .3, z0: cz - .3, z1: cz + .3 };
  if (blockers.some(b => overlaps(r, b))) return null;
  let moved = true;
  while (moved) {
    moved = false;
    for (const side of ['x0', 'x1', 'z0', 'z1'] as const) {
      const t = { ...r, [side]: r[side] + (side.endsWith('0') ? -.1 : .1) };
      if (inside(t, f) && !blockers.some(b => overlaps(t, b))) { r[side] = t[side]; moved = true; }
    }
  }
  return r;
}

/* ---------- Bố trí một tầng theo kiểu ---------- */

type FloorPlan = { placements: Placement[]; furniture: FurnitureItem[]; dropped: { eqId: string; floorId: string; reason: string }[]; reasons: string[] };

function layoutFloor(project: Project, f: Floor, eqsIn: Equipment[], strategy: Strategy, keepPl: Placement[], keepFu: FurnitureItem[], receptionFu: FurnitureItem[], lobby: Rect | null, byId: Map<string, Equipment>): FloorPlan {
  const reasons: string[] = [];
  const furniture: FurnitureItem[] = [...keepFu, ...receptionFu];
  const baseOpt = { placements: keepPl, furniture };
  const obstacles = floorObstacles(project, f, baseOpt, byId);
  const zones: { rect: Rect; label: string }[] = [];
  if (lobby) zones.push({ rect: lobby, label: 'sảnh lễ tân & đón tiếp' });
  const style = INTERIOR_STYLES[project.brief.interior];
  const P = new Placer(f, obstacles, zones, byId);
  // Máy đã khoá giữ nguyên (đã nằm trong obstacles); Placer chỉ xếp máy mới
  const eqs = [...eqsIn];
  const cardio = eqs.filter(e => groupOf(e) === 'cardio');
  const free = eqs.filter(e => groupOf(e) === 'free').sort((a, b) => FREE.indexOf(kindOf(a)) - FREE.indexOf(kindOf(b)));
  const mach = eqs.filter(e => groupOf(e) === 'machine');
  const ew = entryWall(project, f), vw = viewWall(project, f);
  const sides = (['left', 'right', 'back', 'front'] as Wall[]).filter(w => w !== vw && w !== ew);
  const mirrorWall: Wall = sides[0] ?? OPP[vw];
  let left: Equipment[] = [];
  const decor: FurnitureItem[] = [];
  const addDecor = (kind: FurnitureItem['kind'], x: number, z: number, rot: number, w?: number, d?: number, label?: string) => decor.push({ id: uid('fu'), kind, floorId: f.id, x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100, rot, w: w ?? FURNITURE[kind].w, d: d ?? FURNITURE[kind].d, group: 'decor', ...(label ? { label } : {}) });

  // Kiểu Mở trung tâm: giữ một khung tạ để đặt ở đầu làn tập chức năng giữa phòng (tinh thần video tham chiếu)
  const headRack = strategy === 'perimeter' ? free.find(e => kindOf(e) === 'rack' || kindOf(e) === 'smith') : undefined;
  if (headRack) free.splice(free.indexOf(headRack), 1);
  if (strategy === 'perimeter') {
    left = P.row(wallRow(f, vw), cardio);
    left = [...left, ...P.row(wallRow(f, mirrorWall, .3), free)];
    const rest = [...mach, ...left]; left = [];
    for (const w of [OPP[mirrorWall], ew, mirrorWall, vw] as Wall[]) if (rest.length) { const l = P.row(wallRow(f, w), rest.splice(0)); rest.push(...l); }
    left = rest;
    reasons.push(`Cardio dọc tường ${wallName(vw)}${f.fixtures.some(x => x.kind === 'window') ? ' có cửa sổ' : ''}, tạ tự do dọc tường ${wallName(mirrorWall)} (gương), máy tạ quanh các tường còn lại.`);
    if (left.length) reasons.push(`Giữ trung tâm thoáng: ${left.length} máy không còn chỗ dọc tường nên không đưa vào giữa phòng.`);
  } else if (strategy === 'axis') {
    // Trục lối đi từ cửa vào tới tường đối diện
    const e0 = entryPoints(project, f)[0] ?? { x: 0, z: f.l / 2 };
    const { n } = wallOf(f, e0.x, e0.z);
    const horiz = n[0] !== 0; // trục chạy theo x
    const cu = horiz ? Math.min(Math.max(e0.z, -f.l / 2 + 2.4), f.l / 2 - 2.4) : Math.min(Math.max(e0.x, -f.w / 2 + 2.4), f.w / 2 - 2.4);
    const halfA = 1.1;
    const span = horiz ? f.w : f.l;
    const cardioBand = cardio.length ? 4.4 : 0;
    const startV = -span / 2, endV = span / 2 - cardioBand; // theo trục, tính từ tường cửa (dùng hệ v dọc n)
    const axisRect: Rect = horiz
      ? (n[0] > 0 ? { x0: -f.w / 2, x1: -f.w / 2 + (endV - startV), z0: cu - halfA, z1: cu + halfA } : { x0: f.w / 2 - (endV - startV), x1: f.w / 2, z0: cu - halfA, z1: cu + halfA })
      : (n[1] > 0 ? { x0: cu - halfA, x1: cu + halfA, z0: -f.l / 2, z1: -f.l / 2 + (endV - startV) } : { x0: cu - halfA, x1: cu + halfA, z0: f.l / 2 - (endV - startV), z1: f.l / 2 });
    P.zones.push({ rect: axisRect, label: 'trục lối đi trung tâm' });
    left = P.row(wallRow(f, OPP[ew]), cardio);
    // Hai hàng sát trục, quay mặt vào trục; hai hàng dọc tường bên
    const sideRows: Row[] = horiz ? [
      { x: -f.w / 2, z: cu - halfA, dx: 1, dz: 0, ex: 0, ez: -1, fx: 0, fz: 1, len: f.w, align: 'body', gap: .2 },
      { x: -f.w / 2, z: cu + halfA, dx: 1, dz: 0, ex: 0, ez: 1, fx: 0, fz: -1, len: f.w, align: 'body', gap: .2 }
    ] : [
      { x: cu - halfA, z: -f.l / 2, dx: 0, dz: 1, ex: -1, ez: 0, fx: 1, fz: 0, len: f.l, align: 'body', gap: .2 },
      { x: cu + halfA, z: -f.l / 2, dx: 0, dz: 1, ex: 1, ez: 0, fx: -1, fz: 0, len: f.l, align: 'body', gap: .2 }
    ];
    const wallsPar: Wall[] = horiz ? ['back', 'front'] : ['left', 'right'];
    left = [...left, ...P.row(wallRow(f, wallsPar[0], .3), free)];
    const rest = [...mach.filter((_, i) => i % 2 === 0), ...left]; left = [];
    const rest2 = mach.filter((_, i) => i % 2 === 1);
    const r1 = P.row(sideRows[0], rest), r2 = P.row(sideRows[1], [...rest2, ...r1]);
    left = P.row(wallRow(f, wallsPar[1]), r2);
    if (left.length) left = P.row(wallRow(f, wallsPar[0]), left);
    // Đèn tuyến tính dọc trục
    const ax = (axisRect.x0 + axisRect.x1) / 2, az = (axisRect.z0 + axisRect.z1) / 2, alen = horiz ? axisRect.x1 - axisRect.x0 : axisRect.z1 - axisRect.z0;
    for (const off of [-.9, .9]) addDecor('linear-light', horiz ? ax : ax + off, horiz ? az + off : az, horiz ? 0 : 1, Math.round((alen - 1) * 100) / 100, .08);
    reasons.push(`Trục lối đi 2,2 m từ cửa vào chạy sâu ${alen.toFixed(1).replace('.', ',')} m; máy hai bên quay về trục, cardio ở cuối trục tạo chiều sâu khi nhìn từ cửa.`);
  } else if (strategy === 'clusters') {
    left = P.row(wallRow(f, vw), cardio);
    // Vùng cụm: phần sàn còn lại sau dải cardio và sảnh / cửa
    const R: Rect = { x0: -f.w / 2 + .2, x1: f.w / 2 - .2, z0: -f.l / 2 + .2, z1: f.l / 2 - .2 };
    const cut = (w: Wall, dpt: number) => { if (w === 'back') R.z0 = Math.max(R.z0, -f.l / 2 + dpt); if (w === 'front') R.z1 = Math.min(R.z1, f.l / 2 - dpt); if (w === 'left') R.x0 = Math.max(R.x0, -f.w / 2 + dpt); if (w === 'right') R.x1 = Math.min(R.x1, f.w / 2 - dpt); };
    if (cardio.length) cut(vw, 4.5);
    cut(ew, lobby ? 0 : 1.6);
    if (lobby) { if (ew === 'front') R.z1 = Math.min(R.z1, lobby.z0 - .6); if (ew === 'back') R.z0 = Math.max(R.z0, lobby.z1 + .6); if (ew === 'left') R.x0 = Math.max(R.x0, lobby.x1 + .6); if (ew === 'right') R.x1 = Math.min(R.x1, lobby.x0 - .6); }
    const RW = R.x1 - R.x0, RD = R.z1 - R.z0;
    const cols = RW >= 11 ? 3 : RW >= 5.5 ? 2 : 1, rows = RD >= 8 ? 2 : 1, aisle = 1.2;
    const iw = (RW - aisle * (cols - 1)) / cols, id = (RD - aisle * (rows - 1)) / rows;
    const islands: Rect[] = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) islands.push({ x0: R.x0 + i * (iw + aisle), x1: R.x0 + i * (iw + aisle) + iw, z0: R.z0 + j * (id + aisle), z1: R.z0 + j * (id + aisle) + id });
    const groups: Equipment[][] = [free, mach.filter(e => muscleOf(e) === 'legs' || muscleOf(e) === 'core'), mach.filter(e => isUpper(e)), mach.filter(e => !['legs', 'core'].includes(muscleOf(e)) && !isUpper(e))].filter(g => g.length);
    const pending: Equipment[] = [];
    islands.forEach((isl, i) => {
      const g = [...(groups[i] || []), ...pending.splice(0)];
      if (i === islands.length - 1) for (let k = islands.length; k < groups.length; k++) g.push(...groups[k]);
      if (!g.length) return;
      const wide = isl.x1 - isl.x0 >= isl.z1 - isl.z0;
      const rowsI: Row[] = wide ? [
        { x: isl.x0, z: isl.z0, dx: 1, dz: 0, ex: 0, ez: 1, fx: 0, fz: 1, len: isl.x1 - isl.x0, align: 'body', within: isl, gap: .2 },
        { x: isl.x0, z: isl.z1, dx: 1, dz: 0, ex: 0, ez: -1, fx: 0, fz: -1, len: isl.x1 - isl.x0, align: 'body', within: isl, gap: .2 }
      ] : [
        { x: isl.x0, z: isl.z0, dx: 0, dz: 1, ex: 1, ez: 0, fx: 1, fz: 0, len: isl.z1 - isl.z0, align: 'body', within: isl, gap: .2 },
        { x: isl.x1, z: isl.z0, dx: 0, dz: 1, ex: -1, ez: 0, fx: -1, fz: 0, len: isl.z1 - isl.z0, align: 'body', within: isl, gap: .2 }
      ];
      let g2 = P.row(rowsI[0], g.filter((_, k) => k % 2 === 0));
      g2 = P.row(rowsI[1], [...g.filter((_, k) => k % 2 === 1), ...g2]);
      pending.push(...g2);
    });
    left = [...left, ...pending];
    // Máy còn lại thử dọc tường
    for (const w of [mirrorWall, OPP[mirrorWall]] as Wall[]) if (left.length) left = P.row(wallRow(f, w), left);
    reasons.push(`${islands.length} cụm máy theo nhóm bài (tạ tự do · chân – bụng · thân trên), lối đi 1,2 m giữa các cụm; máy trong cụm quay vào nhau để huấn luyện viên đứng giữa theo dõi.`);
  } else {
    // Vòng tập: trạm ngoài dọc tường quay vào, cụm trạm giữa quay ra; một vòng lối đi khép kín
    const order = interleave(cardio, mach, free);
    const outer = order.filter((_, i) => i % 3 !== 2), inner = order.filter((_, i) => i % 3 === 2);
    let rest = outer;
    for (const w of [vw, mirrorWall, OPP[mirrorWall], ew] as Wall[]) if (rest.length) rest = P.row(wallRow(f, w, .25), rest);
    const ring = 1.6;
    const depth = Math.max(2.4, ...P.placements.map(p => { const e = byId.get(p.eqId)!; const r = eqRects(e, p.x, p.z, p.rot).clear; return Math.min(r.x1 - r.x0, r.z1 - r.z0); }));
    const isl: Rect = { x0: -f.w / 2 + depth + ring, x1: f.w / 2 - depth - ring, z0: -f.l / 2 + depth + ring, z1: f.l / 2 - depth - ring };
    if (lobby) { if (ew === 'front') isl.z1 = Math.min(isl.z1, lobby.z0 - ring); if (ew === 'back') isl.z0 = Math.max(isl.z0, lobby.z1 + ring); }
    if (isl.x1 - isl.x0 > 1.2 && isl.z1 - isl.z0 > 1.2) {
      const wide = isl.x1 - isl.x0 >= isl.z1 - isl.z0;
      const cx = (isl.x0 + isl.x1) / 2, cz = (isl.z0 + isl.z1) / 2;
      const rowsI: Row[] = wide ? [
        { x: isl.x0, z: cz - .05, dx: 1, dz: 0, ex: 0, ez: -1, fx: 0, fz: -1, len: isl.x1 - isl.x0, align: 'body', within: isl, gap: .3 },
        { x: isl.x0, z: cz + .05, dx: 1, dz: 0, ex: 0, ez: 1, fx: 0, fz: 1, len: isl.x1 - isl.x0, align: 'body', within: isl, gap: .3 }
      ] : [
        { x: cx - .05, z: isl.z0, dx: 0, dz: 1, ex: -1, ez: 0, fx: -1, fz: 0, len: isl.z1 - isl.z0, align: 'body', within: isl, gap: .3 },
        { x: cx + .05, z: isl.z0, dx: 0, dz: 1, ex: 1, ez: 0, fx: 1, fz: 0, len: isl.z1 - isl.z0, align: 'body', within: isl, gap: .3 }
      ];
      const nonCardio = [...inner.filter(e => groupOf(e) !== 'cardio'), ...rest.filter(e => groupOf(e) !== 'cardio')];
      const cardioRest = [...inner, ...rest].filter(e => groupOf(e) === 'cardio');
      let r = P.row(rowsI[0], nonCardio.filter((_, i) => i % 2 === 0));
      r = P.row(rowsI[1], [...nonCardio.filter((_, i) => i % 2 === 1), ...r]);
      rest = [...r, ...cardioRest];
    } else rest = [...rest, ...inner];
    for (const w of [vw, mirrorWall, OPP[mirrorWall]] as Wall[]) if (rest.length) rest = P.row(wallRow(f, w, .1), rest);
    left = rest;
    // Đánh số trạm theo chiều vòng (góc quanh tâm phòng)
    const sorted = [...P.placements].sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));
    sorted.forEach((p, i) => { p.station = i + 1; });
    reasons.push(`Vòng lối đi ${ring.toString().replace('.', ',')} m khép kín; ${P.placements.length} trạm đánh số theo chiều vòng, xen kẽ thân trên – thân dưới – cardio.`);
  }

  // Khoảng mở / khu chức năng: hình chữ nhật trống lớn nhất quanh tâm vùng còn lại
  const blockers = [
    ...P.obstacles.map(o => o.keep), ...P.zones.filter(z => !z.label.startsWith('trục')).map(z => z.rect),
    ...P.placements.map(p => eqRects(byId.get(p.eqId)!, p.x, p.z, p.rot).clear)
  ];
  if (strategy !== 'axis') {
    const c = growFree(0, 0, f, blockers) ?? growFree(f.w * .2, 0, f, blockers) ?? growFree(-f.w * .2, 0, f, blockers);
    const kind = project.brief.interior === 'wellness' || project.brief.model === 'wellness' ? 'mat-zone' : 'turf';
    if (c && strategy === 'perimeter') {
      // Làn tập chức năng chạy dọc chiều dài khoảng mở; khung tạ đứng ở đầu làn phía xa cửa, quay mặt về làn
      const g = grow(c, -.3);
      const alongX = g.x1 - g.x0 >= g.z1 - g.z0;
      const len = alongX ? g.x1 - g.x0 : g.z1 - g.z0, wid = alongX ? g.z1 - g.z0 : g.x1 - g.x0;
      const e0 = entryPoints(project, f)[0] ?? { x: 0, z: f.l / 2 };
      const cx = (g.x0 + g.x1) / 2, cz = (g.z0 + g.z1) / 2;
      const farSign = alongX ? (e0.x <= cx ? 1 : -1) : (e0.z <= cz ? 1 : -1);
      let lane: Rect | null = null;
      if (len >= 3 && wid >= 1.6) {
        const lw = Math.min(2.6, wid);
        lane = alongX ? { x0: g.x0, x1: g.x1, z0: cz - lw / 2, z1: cz + lw / 2 } : { x0: cx - lw / 2, x1: cx + lw / 2, z0: g.z0, z1: g.z1 };
      }
      if (headRack && lane) {
        const rot = alongX ? rotFor('z', -farSign, 0) : rotFor('z', 0, -farSign);
        const { clear } = eqRects(headRack, 0, 0, rot);
        const depthClear = alongX ? clear.x1 - clear.x0 : clear.z1 - clear.z0;
        let placed = false;
        for (let s = len / 2 - depthClear / 2; s > -len / 2 + depthClear / 2 + 2 && !placed; s -= .1) {
          const x = alongX ? cx + farSign * s : cx, z = alongX ? cz : cz + farSign * s;
          if (P.ok(headRack, Math.round(x * 100) / 100, Math.round(z * 100) / 100, rot)) {
            P.put(headRack, Math.round(x * 100) / 100, Math.round(z * 100) / 100, rot);
            const r = eqRects(headRack, Math.round(x * 100) / 100, Math.round(z * 100) / 100, rot).clear;
            // làn kết thúc trước khoảng trống vận hành của khung tạ
            if (alongX) { if (farSign > 0) lane.x1 = r.x0 - .05; else lane.x0 = r.x1 + .05; } else { if (farSign > 0) lane.z1 = r.z0 - .05; else lane.z0 = r.z1 + .05; }
            placed = true;
            reasons.push(`Khung tạ ${headRack.name} đứng ở đầu làn, nhìn thẳng từ cửa vào — tạo điểm nhấn và chiều sâu.`);
          }
        }
        if (!placed) { const rest = P.row(wallRow(f, mirrorWall, .3), [headRack]); left.push(...rest); }
      } else if (headRack) { const rest = P.row(wallRow(f, mirrorWall, .3), [headRack]); left.push(...rest); }
      if (lane) {
        const w = lane.x1 - lane.x0, d = lane.z1 - lane.z0;
        if (w * d >= 4) {
          addDecor(kind, (lane.x0 + lane.x1) / 2, (lane.z0 + lane.z1) / 2, 0, Math.round(w * 100) / 100, Math.round(d * 100) / 100, 'Làn tập chức năng');
          reasons.push(`Làn tập chức năng ${Math.max(w, d).toFixed(1).replace('.', ',')} × ${Math.min(w, d).toFixed(1).replace('.', ',')} m chạy dọc giữa phòng (kéo sled, bước lunge, tập nhóm nhỏ), thiết bị bám quanh biên.`);
        }
      }
    } else if (c) {
      const g = grow(c, -.3);
      const w = g.x1 - g.x0, d = g.z1 - g.z0;
      if (w >= 1.8 && d >= 1.8 && w * d >= 5) {
        addDecor(kind, (g.x0 + g.x1) / 2, (g.z0 + g.z1) / 2, 0, w, d, 'Khu tập chức năng');
        reasons.push(`Khu tập chức năng ${w.toFixed(1).replace('.', ',')} × ${d.toFixed(1).replace('.', ',')} m (thảm${kind === 'turf' ? ' cỏ' : ''}), nằm ngoài khoảng trống vận hành của máy.`);
      }
    }
  }
  // Gương dọc tường tạ tự do, cây xanh ở góc, cây nước gần lối vào (đặt nếu không chạm gì)
  if (style.mirrors && P.placements.some(p => groupOf(byId.get(p.eqId)!) === 'free')) {
    const r = wallRow(f, mirrorWall);
    const len = Math.min(r.len - 1, 8);
    const mx = r.x + r.dx * (r.len / 2) + r.ex * .03, mz = r.z + r.dz * (r.len / 2) + r.ez * .03;
    addDecor('mirror', mx, mz, r.dx ? 0 : 1, len, .05);
  }
  const occupied = () => [...blockers, ...decor.filter(d => FURNITURE[d.kind].blocksEq).map(furnRect), ...P.placements.map(p => eqRects(byId.get(p.eqId)!, p.x, p.z, p.rot).body)];
  const tryDecor = (kind: FurnitureItem['kind'], x: number, z: number) => {
    const k = FURNITURE[kind];
    const r = { x0: x - k.w / 2, x1: x + k.w / 2, z0: z - k.d / 2, z1: z + k.d / 2 };
    if (inside(r, f) && !occupied().some(b => overlaps(grow(r, .3), b))) { addDecor(kind, x, z, 0); return true; }
    return false;
  };
  const corners: [number, number][] = [[-f.w / 2 + .45, -f.l / 2 + .45], [f.w / 2 - .45, -f.l / 2 + .45], [-f.w / 2 + .45, f.l / 2 - .45], [f.w / 2 - .45, f.l / 2 - .45]];
  let plants = style.plants * 2;
  for (const [x, z] of corners) if (plants > 0 && tryDecor('plant', x, z)) plants--;
  const e0 = entryPoints(project, f)[0];
  if (e0) for (const [dx, dz] of [[1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6], [2.4, .8], [-2.4, .8]]) if (tryDecor('water', e0.x + dx, e0.z + dz)) break;
  if (strategy !== 'axis') {
    const long = Math.max(f.w, f.l), short = Math.min(f.w, f.l), n = Math.min(5, Math.max(2, Math.round(short / 3.2)));
    for (let i = 0; i < n; i++) { const o = -short / 2 + short * (i + .5) / n; addDecor('linear-light', f.w >= f.l ? 0 : o, f.w >= f.l ? o : 0, f.w >= f.l ? 0 : 1, Math.round((long - 1.2) * 100) / 100, .08); }
  }

  // 6a. Lối vào WC / thay đồ / kho / lối thoát: nếu bị vây, bỏ dần máy mới xếp gần nhất (không đụng máy đã khoá)
  const needAccess = f.fixtures.filter(x => x.kind === 'wc' || x.kind === 'locker' || x.kind === 'storage' || x.kind === 'exit');
  for (let guard = 0; guard < 8 && needAccess.length; guard++) {
    const obs = floorObstacles(project, f, { placements: [...keepPl, ...P.placements], furniture: [...furniture, ...decor] }, byId);
    const g2 = new NavGrid(f, obs.filter(o => o.blocksWalk).map(o => o.body));
    const st2 = entryPoints(project, f).map(e => g2.nearest(e.x, e.z)).filter((x): x is [number, number] => !!x);
    if (!st2.length) break;
    const d2 = g2.bfs(st2);
    const blocked = needAccess.find(fx => !accessCells(g2, fixtureRects(fx, f).body).some(([i, j]) => d2[j * g2.nx + i] >= 0));
    if (!blocked) break;
    // chỉ bỏ máy thật sự nằm sát lối vào (≤ 2,5 m tính từ mép vật cố định)
    const fr = fixtureRects(blocked, f).body;
    const gap = (p2: Placement) => { const b = eqRects(byId.get(p2.eqId)!, p2.x, p2.z, p2.rot).body; return Math.hypot(Math.max(0, fr.x0 - b.x1, b.x0 - fr.x1), Math.max(0, fr.z0 - b.z1, b.z0 - fr.z1)); };
    const near = [...P.placements].filter(p2 => gap(p2) <= 2.5).sort((a, b) => gap(a) - gap(b))[0];
    if (!near) break;
    P.placements = P.placements.filter(x => x !== near);
    P.dropped.push({ eqId: near.eqId, floorId: f.id, reason: `bỏ để chừa lối vào ${FIXTURE_KINDS[blocked.kind].label.toLowerCase()}` });
  }
  // 6. Tiếp cận: bỏ máy không có lối đi từ cửa / chiếu nghỉ
  const allObs = floorObstacles(project, f, { placements: [...keepPl, ...P.placements], furniture: [...furniture, ...decor] }, byId);
  const grid = new NavGrid(f, allObs.filter(o => o.blocksWalk).map(o => o.body));
  const starts = entryPoints(project, f).map(e => grid.nearest(e.x, e.z)).filter((x): x is [number, number] => !!x);
  const dist = grid.bfs(starts);
  const dropped = [...P.dropped];
  const ok = P.placements.filter(p => {
    if (!starts.length) return true;
    const { body } = eqRects(byId.get(p.eqId)!, p.x, p.z, p.rot);
    const reach = accessCells(grid, body).some(([i, j]) => dist[j * grid.nx + i] >= 0);
    if (!reach) dropped.push({ eqId: p.eqId, floorId: f.id, reason: 'không có lối đi tiếp cận sau khi xếp (bị máy khác vây kín)' });
    return reach;
  });
  for (const e of left) dropped.push({ eqId: e.id, floorId: f.id, reason: strategy === 'perimeter' ? 'hết chỗ dọc tường, giữ trung tâm thoáng' : 'không đủ chỗ với khoảng trống vận hành theo kiểu bố trí này' });
  return { placements: [...keepPl, ...ok], furniture: [...furniture, ...decor], dropped, reasons };
}

function interleave(a: Equipment[], b: Equipment[], c: Equipment[]) {
  const up = b.filter(isUpper), low = b.filter(e => !isUpper(e));
  const out: Equipment[] = [];
  const qs = [up, low, a, c];
  while (qs.some(q => q.length)) for (const q of qs) { const e = q.shift(); if (e) out.push(e); }
  return out;
}
const wallName = (w: Wall) => ({ back: 'phía sau', front: 'phía trước', left: 'bên trái', right: 'bên phải' })[w];

/* ---------- Phương án ---------- */

/** Thứ tự kiểu bố trí ưu tiên theo mô hình kinh doanh (3 phương án đầu) */
export const STRATEGY_ORDER: Record<Project['brief']['model'], Strategy[]> = {
  gym: ['perimeter', 'axis', 'clusters'], pt: ['clusters', 'perimeter', 'circuit'], strength: ['axis', 'clusters', 'perimeter'],
  boutique: ['circuit', 'perimeter', 'axis'], wellness: ['perimeter', 'clusters', 'axis']
};

/** Nội thất lễ tân theo cấu hình (giữ nguyên nếu khách đã khoá một món của quầy) */
function receptionFor(project: Project, keep?: DesignOption) {
  const rc = project.reception;
  const f = project.floors.find(x => x.id === rc.floorId) ?? entranceFloor(project);
  const door = f.fixtures.find(x => x.kind === 'door' && x.main) || f.fixtures.find(x => x.kind === 'door');
  const kept = keep?.furniture.filter(x => x.group === 'reception') ?? [];
  if (kept.some(x => x.locked)) {
    const zone = kept.length ? kept.map(furnRect).reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), z0: Math.min(a.z0, b.z0), z1: Math.max(a.z1, b.z1) })) : null;
    return { floorId: f.id, items: kept, zone };
  }
  const r = buildReception(rc, f, door);
  const items = [...r.items];
  // Quầy phụ ở tầng khác: quầy nhỏ gọn cạnh chiếu nghỉ
  if (rc.enabled && rc.secondaryFloorId) {
    const f2 = project.floors.find(x => x.id === rc.secondaryFloorId);
    const ep = f2 && entryPoints(project, f2)[0];
    if (f2 && ep) items.push({ id: uid('fu'), kind: 'desk-compact', floorId: f2.id, x: Math.min(Math.max(ep.x + 1.6, -f2.w / 2 + 1), f2.w / 2 - 1), z: Math.min(Math.max(ep.z, -f2.l / 2 + 1), f2.l / 2 - 1), rot: 0, w: 1.4, d: .7, group: 'reception', label: 'Quầy phụ' });
  }
  return { floorId: f.id, items, zone: r.zone };
}

/** Tạo một phương án theo kiểu bố trí, dùng danh sách máy đã chọn */
export function generateOption(project: Project, catalog: Equipment[], strategy: Strategy, sel: Selection, letter: string, keep?: DesignOption): DesignOption {
  const byId = new Map(catalog.map(e => [e.id, e]));
  const rec = receptionFor(project, keep);
  const placements: Placement[] = [], furniture: FurnitureItem[] = [], dropped: DesignOption['dropped'] = [], reasons: string[] = [], warnings: string[] = [];
  reasons.push(`Kiểu ${STRATEGIES[strategy].label}: ${STRATEGIES[strategy].hint.toLowerCase()}.`);
  if (project.reception.enabled && rec.zone) reasons.push('Sảnh lễ tân được dành chỗ trước khi xếp máy: hội viên check-in đi thẳng vào khu tập, khách mới rẽ sang ghế chờ / bàn tư vấn (không cắt ngang nhau).');
  for (const f of project.floors) {
    const s = sel.floors.find(x => x.floorId === f.id);
    const keepPl = (keep?.placements ?? []).filter(p => p.floorId === f.id && p.locked && byId.has(p.eqId));
    const keepFu = (keep?.furniture ?? []).filter(x => x.floorId === f.id && x.locked && x.group !== 'reception');
    const recHere = rec.items.filter(x => x.floorId === f.id);
    const plan = layoutFloor(project, f, s?.eqs ?? [], strategy, keepPl, keepFu, recHere, rec.floorId === f.id ? rec.zone : null, byId);
    placements.push(...plan.placements); furniture.push(...plan.furniture); dropped.push(...plan.dropped);
    if (project.floors.length > 1) reasons.push(`${f.name}: ${[...(s?.notes ?? []).slice(0, 1), ...plan.reasons.slice(0, 2)].join(' ')}`); else reasons.push(...(s?.notes ?? []).slice(0, 1), ...plan.reasons);
    const wanted = s?.eqs.length ?? 0;
    if (wanted && plan.placements.length - keepPl.length === 0) warnings.push(`${f.name}: không đặt được máy nào — diện tích dùng được sau khi trừ vật cố định, lõi giao thông, sảnh quá nhỏ. Đề xuất: bỏ bớt vùng không dùng, thu nhỏ lễ tân, hoặc chọn kiểu "Mở trung tâm".`);
  }
  if (dropped.length) warnings.push(`${dropped.length} máy trong danh sách chung không đặt được với kiểu này (xem chi tiết) — tổng chi phí phương án thấp hơn danh sách chung.`);
  return { id: uid('op'), letter, strategy, version: 1, placements, furniture, reasons, changes: [], warnings, dropped };
}

/**
 * Tạo 3 phương án khác biệt (cùng danh sách máy & ngân sách). `keep` = phương án hiện tại (giữ máy / nội thất đã khoá).
 * `strategies` để khách chọn kiểu cho từng phương án.
 */
export function generateOptions(project: Project, catalog: Equipment[], opts: { strategies?: Strategy[]; keep?: DesignOption; flooring?: Flooring | null } = {}) {
  const keepPl = (opts.keep?.placements ?? []).filter(p => p.locked);
  const sel = selectEquipment(project, catalog, keepPl, opts.flooring);
  const strategies = (opts.strategies?.length ? opts.strategies : STRATEGY_ORDER[project.brief.model]).slice(0, 3);
  const options = strategies.map((s, i) => generateOption(project, catalog, s, sel, 'ABC'[i], opts.keep));
  // So sánh với danh sách chung: phương án nào thiếu máy thì ghi rõ
  const total = sel.floors.reduce((s, f) => s + f.eqs.length, 0);
  for (const o of options) {
    const placedNew = o.placements.filter(p => !p.locked).length;
    if (placedNew < total) o.changes.push(`Đặt được ${placedNew}/${total} máy của danh sách chung.`);
    else o.changes.push(`Đủ ${total} máy của danh sách chung.`);
  }
  return { options, selection: sel };
}

/** Kích thước chiếm sàn (tiện cho giao diện) */
export const eqFoot = (e: Equipment, rot: number) => footOf(e.width / 100, e.depth / 100, rot);
