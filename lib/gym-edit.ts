/**
 * Thao tác chỉnh sửa dự án phòng tập — hàm thuần (trả về bản mới, không sửa bản cũ).
 * Giao diện và trợ lý AI (lib/gym-actions.ts) dùng CHUNG bộ hàm này, nên AI chỉ làm được những gì giao diện làm được.
 * Mỗi thao tác đổi bố trí → tăng phiên bản phương án (để mô phỏng / báo giá cũ bị đánh dấu cần chạy lại).
 */
import type { Equipment } from './equipment.ts';
import { DEFAULT_RECEPTION, FIXTURE_KINDS, LINK_KINDS, footOf, levelName, uid, type DesignOption, type Fixture, type FixtureKind, type Floor, type FurnitureItem, type LinkKind, type Placement, type Project, type Reception } from './gym-project.ts';
import { buildReception, wallOf } from './gym-decor.ts';
import { checkEquipment, eqRects, floorObstacles, furnRect, inside } from './gym-geometry.ts';

const clone = <T>(x: T): T => structuredClone(x);
const r2 = (n: number) => Math.round(n * 100) / 100;
const touch = (p: Project) => { p.updatedAt = Date.now(); p.version++; return p; };
const bump = (o: DesignOption) => { o.version++; };

/* ---------- Tầng ---------- */

export function updateFloor(p0: Project, id: string, patch: Partial<Pick<Floor, 'name' | 'w' | 'l' | 'h' | 'use' | 'users' | 'budget' | 'accent'>>) {
  const p = clone(p0);
  const f = p.floors.find(x => x.id === id);
  if (!f) return p0;
  if (patch.w !== undefined) patch.w = Math.min(80, Math.max(3, r2(patch.w)));
  if (patch.l !== undefined) patch.l = Math.min(80, Math.max(3, r2(patch.l)));
  if (patch.h !== undefined) patch.h = Math.min(8, Math.max(2.2, r2(patch.h)));
  // Vật trên tường giữ đúng bức tường cũ; mọi vật cố định co giãn vị trí theo tỉ lệ (góc sau vẫn là góc sau)
  const old = { w: f.w, l: f.l };
  const walls = f.fixtures.map(fx => (WALL_KINDS.includes(fx.kind) ? wallOf(old, fx.x, fx.z).wall : undefined));
  Object.assign(f, patch);
  f.fixtures.forEach((fx, i) => { fx.x = fx.x * f.w / old.w; fx.z = fx.z * f.l / old.l; clampFixture(f, fx, walls[i]); });
  for (const o of p.options) if (o.placements.some(x => x.floorId === id) || o.furniture.some(x => x.floorId === id)) bump(o);
  return touch(p);
}
/** Thêm tầng mới trên cùng (cùng kích thước tầng trên cùng); cầu thang / thang máy kéo dài lên tầng mới */
export function addFloor(p0: Project) {
  const p = clone(p0);
  if (p.floors.length >= 5) return p0;
  const top = [...p.floors].sort((a, b) => b.level - a.level)[0];
  const f: Floor = { id: uid('fl'), name: levelName(top.level + 1), level: top.level + 1, w: top.w, l: top.l, h: top.h, fixtures: [], use: 'auto', users: 0, budget: 0 };
  p.floors.push(f);
  if (!p.links.length) {
    const s = LINK_KINDS.stairs, g = p.floors[0];
    p.links.push({ id: uid('ln'), kind: 'stairs', floors: p.floors.map(x => x.id), x: -Math.min(g.w, f.w) / 2 + s.w / 2 + .1, z: -Math.min(g.l, f.l) / 2 + s.d / 2 + .1, w: s.w, d: s.d, rot: 0 });
  } else for (const ln of p.links) if (ln.floors.includes(top.id)) ln.floors.push(f.id);
  p.brief.floors = p.floors.length;
  return touch(p);
}
/** Sao chép tầng: mặt bằng + máy / nội thất của tầng trong mọi phương án (id mới) */
export function duplicateFloor(p0: Project, id: string) {
  const src = p0.floors.find(x => x.id === id);
  if (!src || p0.floors.length >= 5) return p0;
  let p = addFloor(p0);
  const nf = p.floors[p.floors.length - 1];
  p = clone(p);
  const f = p.floors.find(x => x.id === nf.id)!;
  Object.assign(f, { w: src.w, l: src.l, h: src.h, use: src.use, users: src.users, budget: src.budget, accent: src.accent, name: `${levelName(f.level)} (bản sao ${src.name.toLowerCase()})` });
  f.fixtures = src.fixtures.filter(x => !(x.kind === 'door' && x.main)).map(x => ({ ...x, id: uid('fx') }));
  for (const o of p.options) {
    o.placements.push(...o.placements.filter(x => x.floorId === id).map(x => ({ ...x, id: uid('pl'), floorId: f.id, locked: false })));
    o.furniture.push(...o.furniture.filter(x => x.floorId === id && x.group !== 'reception').map(x => ({ ...x, id: uid('fu'), floorId: f.id, locked: false })));
    bump(o);
  }
  return touch(p);
}
/** Xoá tầng (không xoá được tầng cuối cùng); số tầng phía trên dồn xuống */
export function removeFloor(p0: Project, id: string) {
  if (p0.floors.length <= 1) return p0;
  const p = clone(p0);
  const gone = p.floors.find(x => x.id === id)!;
  p.floors = p.floors.filter(x => x.id !== id);
  for (const f of p.floors) if (f.level > gone.level) { f.level--; if (/^Tầng/.test(f.name)) f.name = levelName(f.level); }
  for (const ln of p.links) ln.floors = ln.floors.filter(x => x !== id);
  p.links = p.links.filter(l => l.floors.length >= 2);
  for (const o of p.options) { o.placements = o.placements.filter(x => x.floorId !== id); o.furniture = o.furniture.filter(x => x.floorId !== id); bump(o); }
  if (p.reception.floorId === id) p.reception = { ...p.reception, floorId: p.floors[0].id };
  if (p.reception.secondaryFloorId === id) delete p.reception.secondaryFloorId;
  p.brief.floors = p.floors.length;
  return touch(p);
}

/* ---------- Vật cố định & lõi giao thông ---------- */

const WALL_KINDS: FixtureKind[] = ['door', 'exit', 'window', 'outlet'];
/** Giữ vật trong tầng; cửa / cửa sổ / ổ điện bám vào tường gần nhất */
function clampFixture(f: Floor, fx: Fixture, keepWall?: 'front' | 'back' | 'left' | 'right') {
  const [w, d] = footOf(fx.w, fx.d, fx.rot);
  if (WALL_KINDS.includes(fx.kind)) {
    const wall = keepWall ?? wallOf(f, fx.x, fx.z).wall;
    const t = fx.d / 2;
    if (wall === 'front' || wall === 'back') { fx.rot = 0; fx.z = wall === 'front' ? f.l / 2 - t : -f.l / 2 + t; fx.x = Math.min(Math.max(fx.x, -f.w / 2 + fx.w / 2), f.w / 2 - fx.w / 2); }
    else { fx.rot = 1; fx.x = wall === 'right' ? f.w / 2 - t : -f.w / 2 + t; fx.z = Math.min(Math.max(fx.z, -f.l / 2 + fx.w / 2), f.l / 2 - fx.w / 2); }
  } else {
    fx.x = Math.min(Math.max(fx.x, -f.w / 2 + w / 2), f.w / 2 - w / 2);
    fx.z = Math.min(Math.max(fx.z, -f.l / 2 + d / 2), f.l / 2 - d / 2);
  }
  fx.x = r2(fx.x); fx.z = r2(fx.z);
}
export function addFixture(p0: Project, floorId: string, kind: FixtureKind) {
  const p = clone(p0);
  const f = p.floors.find(x => x.id === floorId);
  if (!f || f.fixtures.length >= 60) return { project: p0, id: '' };
  const k = FIXTURE_KINDS[kind];
  const fx: Fixture = { id: uid('fx'), kind, x: 0, z: 0, w: k.w, d: k.d, rot: 0 };
  // vị trí mặc định: cửa / cửa sổ trên tường sau, vật khác ở góc trống
  if (WALL_KINDS.includes(kind)) { fx.z = kind === 'door' && !f.fixtures.some(x => x.kind === 'door') ? f.l / 2 : -f.l / 2; fx.x = (f.fixtures.filter(x => x.kind === kind).length % 3 - 1) * f.w / 4; }
  else { fx.x = -f.w / 2 + k.w / 2 + .2 + (f.fixtures.length % 4) * .6; fx.z = f.l / 2 - k.d / 2 - .2; }
  if (kind === 'door' && !p.floors.some(x => x.fixtures.some(y => y.kind === 'door' && y.main))) fx.main = true;
  clampFixture(f, fx);
  f.fixtures.push(fx);
  for (const o of p.options) bump(o);
  return { project: touch(p), id: fx.id };
}
export function updateFixture(p0: Project, id: string, patch: Partial<Pick<Fixture, 'x' | 'z' | 'w' | 'd' | 'rot' | 'label' | 'main'>>) {
  const p = clone(p0);
  for (const f of p.floors) {
    const fx = f.fixtures.find(x => x.id === id);
    if (!fx) continue;
    if (patch.main) for (const g of p.floors) for (const x of g.fixtures) if (x.kind === 'door') x.main = false;
    Object.assign(fx, patch);
    if (patch.w !== undefined) fx.w = Math.min(Math.max(.1, r2(patch.w)), Math.max(f.w, f.l));
    if (patch.d !== undefined) fx.d = Math.min(Math.max(.05, r2(patch.d)), Math.max(f.w, f.l));
    clampFixture(f, fx);
    for (const o of p.options) bump(o);
    return touch(p);
  }
  return p0;
}
export function removeFixture(p0: Project, id: string) {
  const p = clone(p0);
  for (const f of p.floors) f.fixtures = f.fixtures.filter(x => x.id !== id);
  for (const o of p.options) bump(o);
  return touch(p);
}
export function addLink(p0: Project, kind: LinkKind, floorIds: string[]) {
  const p = clone(p0);
  const ids = p.floors.filter(f => floorIds.includes(f.id)).sort((a, b) => a.level - b.level).map(f => f.id);
  if (ids.length < 2 || p.links.length >= 6) return { project: p0, id: '' };
  const k = LINK_KINDS[kind];
  const minW = Math.min(...p.floors.filter(f => ids.includes(f.id)).map(f => f.w)), minL = Math.min(...p.floors.filter(f => ids.includes(f.id)).map(f => f.l));
  const ln = { id: uid('ln'), kind, floors: ids, x: r2(minW / 2 - k.w / 2 - .1 - p.links.length * .2), z: r2(-minL / 2 + k.d / 2 + .1), w: k.w, d: k.d, rot: 0 };
  p.links.push(ln);
  for (const o of p.options) bump(o);
  return { project: touch(p), id: ln.id };
}
/** Sửa lõi giao thông: cùng một vị trí trên mọi tầng nó đi qua (không lệch giữa các tầng) */
export function updateLink(p0: Project, id: string, patch: Partial<{ x: number; z: number; w: number; d: number; rot: number; floors: string[] }>) {
  const p = clone(p0);
  const ln = p.links.find(x => x.id === id);
  if (!ln) return p0;
  Object.assign(ln, patch);
  ln.floors = p.floors.filter(f => ln.floors.includes(f.id)).sort((a, b) => a.level - b.level).map(f => f.id);
  const fl = p.floors.filter(f => ln.floors.includes(f.id));
  const [w, d] = footOf(ln.w, ln.d, ln.rot);
  const halfW = Math.min(...fl.map(f => f.w)) / 2, halfL = Math.min(...fl.map(f => f.l)) / 2;
  ln.x = r2(Math.min(Math.max(ln.x, -halfW + w / 2), halfW - w / 2));
  ln.z = r2(Math.min(Math.max(ln.z, -halfL + d / 2), halfL - d / 2));
  for (const o of p.options) bump(o);
  return touch(p);
}
export function removeLink(p0: Project, id: string) {
  const p = clone(p0);
  p.links = p.links.filter(x => x.id !== id);
  for (const o of p.options) bump(o);
  return touch(p);
}

/* ---------- Máy & nội thất trong phương án đang chọn ---------- */

function activeOpt(p: Project) { return p.options[p.active]; }

/** Chỗ trống hợp lệ gần một điểm cho máy trên tầng (quét lưới 20 cm, thử 4 hướng); null nếu hết chỗ */
export function freeSpot(p: Project, opt: DesignOption, floor: Floor, eq: Equipment, catalog: Map<string, Equipment>, near: { x: number; z: number } = { x: 0, z: 0 }, skip?: string) {
  const obs = floorObstacles(p, floor, opt, catalog, skip);
  const zones = opt.furniture.filter(f => f.floorId === floor.id && (f.kind === 'turf' || f.kind === 'mat-zone')).map(f => ({ rect: furnRect(f), label: 'khu chức năng' }));
  const cands: { x: number; z: number; d: number }[] = [];
  for (let z = -floor.l / 2 + .2; z <= floor.l / 2 - .2; z += .2) for (let x = -floor.w / 2 + .2; x <= floor.w / 2 - .2; x += .2) cands.push({ x: r2(x), z: r2(z), d: (x - near.x) ** 2 + (z - near.z) ** 2 });
  cands.sort((a, b) => a.d - b.d);
  for (const c of cands) for (const rot of [0, 1, 2, 3]) if (!checkEquipment(eq, c.x, c.z, rot, floor, obs, zones)) return { x: c.x, z: c.z, rot };
  return null;
}
export function addEquipment(p0: Project, floorId: string, eq: Equipment, catalog: Map<string, Equipment>) {
  const p = clone(p0);
  const o = activeOpt(p), f = p.floors.find(x => x.id === floorId);
  if (!o || !f) return { project: p0, id: '', placed: false };
  const spot = freeSpot(p, o, f, eq, catalog);
  const pl: Placement = { id: uid('pl'), eqId: eq.id, floorId, x: spot?.x ?? 0, z: spot?.z ?? 0, rot: spot?.rot ?? 0 };
  o.placements.push(pl); bump(o);
  return { project: touch(p), id: pl.id, placed: !!spot };
}
/** Di chuyển máy / nội thất / vật cố định / lõi giao thông theo id */
export function moveItem(p0: Project, id: string, x: number, z: number) {
  const o = activeOpt(p0);
  if (o?.placements.some(q => q.id === id) || o?.furniture.some(q => q.id === id)) {
    const p = clone(p0), oo = activeOpt(p);
    const it = oo.placements.find(q => q.id === id) ?? oo.furniture.find(q => q.id === id)!;
    if (it.locked) return p0;
    it.x = r2(x); it.z = r2(z); bump(oo);
    return touch(p);
  }
  if (p0.links.some(l => l.id === id)) return updateLink(p0, id, { x, z });
  return updateFixture(p0, id, { x, z });
}
export function rotateItem(p0: Project, id: string) {
  const p = clone(p0), o = activeOpt(p);
  const it = o?.placements.find(q => q.id === id) ?? o?.furniture.find(q => q.id === id);
  if (it) { if (it.locked) return p0; it.rot = (it.rot + 1) % 4; bump(o); return touch(p); }
  const ln = p.links.find(l => l.id === id);
  if (ln) return updateLink(p0, id, { rot: (ln.rot + 1) % 4 });
  for (const f of p.floors) { const fx = f.fixtures.find(x => x.id === id); if (fx && !WALL_KINDS.includes(fx.kind)) return updateFixture(p0, id, { rot: (fx.rot + 1) % 4 }); }
  return p0;
}
export function removeItem(p0: Project, id: string) {
  const p = clone(p0), o = activeOpt(p);
  if (o && (o.placements.some(q => q.id === id) || o.furniture.some(q => q.id === id))) {
    o.placements = o.placements.filter(q => q.id !== id || q.locked);
    o.furniture = o.furniture.filter(q => q.id !== id || q.locked);
    bump(o); return touch(p);
  }
  if (p.links.some(l => l.id === id)) return removeLink(p0, id);
  return removeFixture(p0, id);
}
export function toggleLock(p0: Project, id: string) {
  const p = clone(p0), o = activeOpt(p);
  const it = o?.placements.find(q => q.id === id) ?? o?.furniture.find(q => q.id === id);
  if (!it) return p0;
  it.locked = !it.locked;
  return touch(p);
}
/** Khoá / mở khoá cả một khu: mọi máy và nội thất của một tầng */
export function lockFloor(p0: Project, floorId: string, locked: boolean) {
  const p = clone(p0), o = activeOpt(p);
  if (!o) return p0;
  for (const it of [...o.placements, ...o.furniture]) if (it.floorId === floorId) it.locked = locked;
  return touch(p);
}
export function duplicateItem(p0: Project, id: string, catalog: Map<string, Equipment>) {
  const o = activeOpt(p0);
  const pl = o?.placements.find(q => q.id === id);
  if (pl) { const eq = catalog.get(pl.eqId); if (eq) return addEquipment(p0, pl.floorId, eq, catalog).project; }
  const fu = o?.furniture.find(q => q.id === id);
  if (fu) { const p = clone(p0), oo = activeOpt(p); oo.furniture.push({ ...fu, id: uid('fu'), x: r2(fu.x + .6), z: r2(fu.z + .6), locked: false }); bump(oo); return touch(p); }
  return p0;
}
/** Chuyển máy sang tầng khác (tìm chỗ trống hợp lệ; hết chỗ thì đặt giữa sàn và bộ kiểm tra sẽ báo) */
export function moveToFloor(p0: Project, id: string, floorId: string, catalog: Map<string, Equipment>) {
  const p = clone(p0), o = activeOpt(p);
  const pl = o?.placements.find(q => q.id === id), f = p.floors.find(x => x.id === floorId);
  if (!pl || !f || pl.floorId === floorId || pl.locked) return { project: p0, placed: false };
  const eq = catalog.get(pl.eqId);
  if (!eq) return { project: p0, placed: false };
  pl.floorId = floorId;
  const spot = freeSpot(p, o, f, eq, catalog, { x: 0, z: 0 }, pl.id);
  pl.x = spot?.x ?? 0; pl.z = spot?.z ?? 0; pl.rot = spot?.rot ?? 0;
  bump(o);
  return { project: touch(p), placed: !!spot };
}
/** Thêm nội thất / trang trí vào tầng */
export function addFurniture(p0: Project, floorId: string, item: Omit<FurnitureItem, 'id' | 'floorId'>) {
  const p = clone(p0), o = activeOpt(p), f = p.floors.find(x => x.id === floorId);
  if (!o || !f) return p0;
  const it: FurnitureItem = { ...item, id: uid('fu'), floorId };
  const [w, d] = footOf(it.w, it.d, it.rot);
  it.x = r2(Math.min(Math.max(it.x, -f.w / 2 + w / 2), f.w / 2 - w / 2)); it.z = r2(Math.min(Math.max(it.z, -f.l / 2 + d / 2), f.l / 2 - d / 2));
  o.furniture.push(it); bump(o);
  return touch(p);
}

/* ---------- Lễ tân, phong cách ---------- */

/** Đổi cấu hình lễ tân → dựng lại nội thất lễ tân ở mọi phương án (trừ khi khách đã khoá món của quầy) */
export function setReception(p0: Project, patch: Partial<Reception>) {
  const p = clone(p0);
  p.reception = { ...DEFAULT_RECEPTION(p.reception.floorId), ...p.reception, ...patch };
  const f = p.floors.find(x => x.id === p.reception.floorId) ?? p.floors[0];
  const door = f.fixtures.find(x => x.kind === 'door' && x.main) ?? f.fixtures.find(x => x.kind === 'door');
  for (const o of p.options) {
    if (o.furniture.some(x => x.group === 'reception' && x.locked)) continue;
    o.furniture = o.furniture.filter(x => x.group !== 'reception');
    const r = buildReception(p.reception, f, door);
    o.furniture.push(...r.items.filter(it => inside(furnRect(it), f)));
    bump(o);
  }
  return touch(p);
}
export function setInterior(p0: Project, style: Project['brief']['interior']) { const p = clone(p0); p.brief.interior = style; return touch(p); }
export function setBrand(p0: Project, patch: Partial<Project['brand']>) { const p = clone(p0); p.brand = { ...p.brand, ...patch }; return touch(p); }

/** Máy của phương án đang chọn có chồng / lấn gì không (dùng nhanh sau khi kéo) */
export function quickConflict(p: Project, id: string, catalog: Map<string, Equipment>) {
  const o = activeOpt(p), pl = o?.placements.find(q => q.id === id);
  const f = pl && p.floors.find(x => x.id === pl.floorId), eq = pl && catalog.get(pl.eqId);
  if (!pl || !f || !eq) return null;
  return checkEquipment(eq, pl.x, pl.z, pl.rot, f, floorObstacles(p, f, o, catalog, pl.id));
}
export { eqRects };
