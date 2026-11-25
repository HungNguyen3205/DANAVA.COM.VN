/**
 * Hình học & kiểm tra phương án phòng tập — DÙNG CHUNG cho thuật toán bố trí (lib/gym-layout.ts), kiểm tra sau khi khách
 * kéo / xoay / bám lưới (giao diện) và mô phỏng (lib/gym-sim.ts), nên hai bên luôn cho cùng một kết luận.
 *
 *  - Thân máy (body) = hình chữ nhật chiếm sàn theo góc xoay 0/90/180/270°.
 *  - Khoảng trống vận hành (clear) = thân + phần chừa theo từng phía của loại máy (lên xuống máy, thay tạ, tay đòn,
 *    vị trí huấn luyện viên; máy chạy bộ chừa 2 m phía sau). Khoảng trống của hai máy được chồng lên nhau (lối đi chung),
 *    nhưng thân máy này không được lấn vào khoảng trống của máy kia.
 *  - Lưới đi lại (NavGrid) ô 20 cm, trừ bán kính người → kiểm tra có đường từ cửa / chiếu nghỉ cầu thang tới từng máy.
 */
import type { Equipment, EquipmentKind } from './equipment.ts';
import { FIXTURE_KINDS, LINK_KINDS, entranceFloor, footOf, type DesignOption, type Fixture, type Floor, type FurnitureItem, type Link, type Placement, type Project } from './gym-project.ts';
import { FURNITURE, wallOf } from './gym-decor.ts';

export type Rect = { x0: number; x1: number; z0: number; z1: number };
export const rectAt = (x: number, z: number, w: number, d: number): Rect => ({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
export const grow = (r: Rect, p: number): Rect => ({ x0: r.x0 - p, x1: r.x1 + p, z0: r.z0 - p, z1: r.z1 + p });
const EPS = 1e-3;
export const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 - EPS && a.x1 > b.x0 + EPS && a.z0 < b.z1 - EPS && a.z1 > b.z0 + EPS;
export const inside = (r: Rect, f: Pick<Floor, 'w' | 'l'>) => r.x0 >= -f.w / 2 - EPS && r.x1 <= f.w / 2 + EPS && r.z0 >= -f.l / 2 - EPS && r.z1 <= f.l / 2 + EPS;
export const area = (r: Rect) => Math.max(0, r.x1 - r.x0) * Math.max(0, r.z1 - r.z0);

/** Hướng thế giới của trục +x và +z cục bộ sau khi xoay rot (three.js: rotation.y = rot·π/2) */
export const AXIS_X: [number, number][] = [[1, 0], [0, -1], [-1, 0], [0, 1]];
export const AXIS_Z: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
/** rot sao cho trục cục bộ (x hoặc z) chỉ theo hướng (dx, dz) — dx/dz là ±1 theo một trục */
export function rotFor(axis: 'x' | 'z', dx: number, dz: number) {
  const t = axis === 'x' ? AXIS_X : AXIS_Z;
  let best = 0, bv = -Infinity;
  for (let r = 0; r < 4; r++) { const v = t[r][0] * dx + t[r][1] * dz; if (v > bv) { bv = v; best = r; } }
  return best;
}

/**
 * Khoảng trống vận hành theo loại máy, theo trục cục bộ (m): px/nx = phía +x/-x, pz/nz = phía +z/-z.
 * Quy ước mô hình (components/site/gym-planner-models.ts): máy cardio dài theo x, bảng điều khiển ở +x, người lên ở -x;
 * máy tạ / khung tạ / ghế: mặt sử dụng phía +z, lưng -z (đặt sát tường được).
 * Tham khảo khuyến nghị phổ biến (ASTM F2115 / ACSM): máy chạy 2 m phía sau × 0,5 m hai bên; máy tạ 0,6 m; khu tạ tự do 0,9 m.
 */
export const CLEARANCE: Record<EquipmentKind, { px: number; nx: number; pz: number; nz: number; why: string }> = {
  treadmill: { px: .2, nx: 2, pz: .5, nz: .5, why: '2 m phía sau để an toàn khi trượt chân, 0,5 m hai bên' },
  bike: { px: .2, nx: .6, pz: .45, nz: .45, why: '0,6 m phía lên xuống xe, 0,45 m hai bên' },
  recumbent: { px: .2, nx: .7, pz: .5, nz: .5, why: 'lên xuống ghế ngả phía sau, 0,5 m hai bên' },
  elliptical: { px: .2, nx: .8, pz: .5, nz: .5, why: '0,8 m phía bước lên, 0,5 m hai bên' },
  rower: { px: .3, nx: .9, pz: .6, nz: .6, why: 'yên trượt ra sau 0,9 m, 0,6 m hai bên' },
  stack: { px: .6, nx: .6, pz: .9, nz: .2, why: '0,9 m phía ngồi / thay chốt tạ, 0,6 m hai bên cho tay đòn, lưng sát tường được' },
  plate: { px: .8, nx: .8, pz: .9, nz: .2, why: '0,8 m hai bên để thay bánh tạ, 0,9 m phía sử dụng' },
  multi: { px: .9, nx: .9, pz: 1, nz: .3, why: 'nhiều trạm cáp, 0,9–1 m quanh máy' },
  cable: { px: 1, nx: 1, pz: 1.2, nz: .3, why: 'tay cáp kéo ra 1–1,2 m' },
  smith: { px: .9, nx: .9, pz: 1, nz: .4, why: 'thay bánh tạ hai đầu đòn 0,9 m, 1 m phía đứng tập' },
  rack: { px: .9, nx: .9, pz: 1.2, nz: .4, why: 'thay bánh tạ hai đầu đòn 0,9 m, 1,2 m phía squat / vị trí huấn luyện viên' },
  bench: { px: .6, nx: .6, pz: .9, nz: .9, why: '0,9 m hai bên để cầm tạ đơn và huấn luyện viên hỗ trợ' },
  'dumbbell-rack': { px: .3, nx: .3, pz: 1.2, nz: .1, why: '1,2 m phía trước để lấy tạ và tập ngay trước kệ' },
  'plate-tree': { px: .5, nx: .5, pz: .5, nz: .5, why: '0,5 m quanh giá để lấy bánh tạ' },
  accessory: { px: .3, nx: .3, pz: .3, nz: .3, why: '0,3 m quanh dụng cụ' }
};
export const kindOf = (e: Pick<Equipment, 'kind' | 'category'>): EquipmentKind => e.kind ?? (e.category === 'cardio' ? 'treadmill' : 'stack');

/** Thân + khoảng trống vận hành (toạ độ thế giới) của một máy tại (x, z, rot) */
export function eqRects(eq: Equipment, x: number, z: number, rot: number) {
  const [fw, fd] = footOf(eq.width / 100, eq.depth / 100, rot);
  const body = rectAt(x, z, fw, fd);
  const c = CLEARANCE[kindOf(eq)];
  const clear = { ...body };
  const apply = (dir: [number, number], v: number) => {
    if (dir[0] > 0) clear.x1 += v; else if (dir[0] < 0) clear.x0 -= v;
    if (dir[1] > 0) clear.z1 += v; else if (dir[1] < 0) clear.z0 -= v;
  };
  const ax = AXIS_X[rot & 3], az = AXIS_Z[rot & 3];
  apply(ax, c.px); apply([-ax[0], -ax[1]], c.nx); apply(az, c.pz); apply([-az[0], -az[1]], c.nz);
  return { body, clear };
}
/** Điểm người dùng đứng / ngồi để dùng máy (thế giới) và hướng mặt (để mô phỏng đặt nhân vật) */
export function usePoint(eq: Equipment, x: number, z: number, rot: number) {
  const k = kindOf(eq), ax = AXIS_X[rot & 3], az = AXIS_Z[rot & 3];
  const W = eq.width / 100, D = eq.depth / 100;
  // Cardio: người ở trên máy, lệch về phía sau; máy khác: ngay trước mặt sử dụng (+z)
  if (['treadmill', 'bike', 'recumbent', 'elliptical', 'rower'].includes(k)) return { x: x - ax[0] * W * .12, z: z - ax[1] * W * .12, face: [ax[0], ax[1]] as [number, number], on: true };
  if (k === 'bench') return { x, z, face: [ax[0], ax[1]] as [number, number], on: true };
  return { x: x + az[0] * (D / 2 + .35), z: z + az[1] * (D / 2 + .35), face: [-az[0], -az[1]] as [number, number], on: false };
}

/** Vật cố định: thân + vùng phải chừa (cửa, lối thoát chừa vào trong phòng) */
export function fixtureRects(fx: Fixture, f: Pick<Floor, 'w' | 'l'>) {
  const [fw, fd] = footOf(fx.w, fx.d, fx.rot);
  const body = rectAt(fx.x, fx.z, fw, fd);
  const k = FIXTURE_KINDS[fx.kind];
  if (fx.kind === 'door' || fx.kind === 'exit') {
    // vùng đệm trước cửa hướng vào phòng
    const { n } = wallOf(f, fx.x, fx.z);
    const pad: Rect = { ...body };
    if (n[0] > 0) pad.x1 += k.pad; if (n[0] < 0) pad.x0 -= k.pad; if (n[1] > 0) pad.z1 += k.pad; if (n[1] < 0) pad.z0 -= k.pad;
    const half = Math.max(0, (k.pad - fw) / 2), halfz = Math.max(0, (k.pad - fd) / 2);
    if (n[1] !== 0) { pad.x0 -= half * .5; pad.x1 += half * .5; } else { pad.z0 -= halfz * .5; pad.z1 += halfz * .5; }
    return { body, pad };
  }
  return { body, pad: grow(body, k.pad) };
}
/** Cầu thang / thang máy: thân + chiếu nghỉ phía +z cục bộ (lối lên xuống) */
export function linkRects(ln: Link) {
  const [fw, fd] = footOf(ln.w, ln.d, ln.rot);
  const body = rectAt(ln.x, ln.z, fw, fd);
  const az = AXIS_Z[ln.rot & 3], L = LINK_KINDS[ln.kind].landing;
  const landing: Rect = az[0] > 0 ? { x0: body.x1, x1: body.x1 + L, z0: body.z0, z1: body.z1 }
    : az[0] < 0 ? { x0: body.x0 - L, x1: body.x0, z0: body.z0, z1: body.z1 }
    : az[1] > 0 ? { x0: body.x0, x1: body.x1, z0: body.z1, z1: body.z1 + L }
    : { x0: body.x0, x1: body.x1, z0: body.z0 - L, z1: body.z0 };
  const entry = { x: (landing.x0 + landing.x1) / 2, z: (landing.z0 + landing.z1) / 2 };
  return { body, landing, entry };
}
export const furnRect = (it: FurnitureItem) => { const [fw, fd] = footOf(it.w, it.d, it.rot); return rectAt(it.x, it.z, fw, fd); };

/* ---------- Vật cản của một tầng ---------- */

export type Obstacle = { id: string; type: 'eq' | 'fixture' | 'link' | 'furn'; label: string; body: Rect; /** vùng máy khác không được lấn */ keep: Rect; blocksWalk: boolean };

export function floorObstacles(project: Pick<Project, 'links'>, floor: Floor, option: Pick<DesignOption, 'placements' | 'furniture'> | null, catalog: Map<string, Equipment>, skip?: string): Obstacle[] {
  const out: Obstacle[] = [];
  for (const fx of floor.fixtures) {
    const k = FIXTURE_KINDS[fx.kind];
    if (fx.kind === 'outlet' || fx.kind === 'window') continue;
    const { body, pad } = fixtureRects(fx, floor);
    out.push({ id: fx.id, type: 'fixture', label: fx.label || k.label, body, keep: pad, blocksWalk: k.blocks });
  }
  for (const ln of project.links) if (ln.floors.includes(floor.id)) {
    const { body, landing } = linkRects(ln);
    const keep = { x0: Math.min(body.x0, landing.x0), x1: Math.max(body.x1, landing.x1), z0: Math.min(body.z0, landing.z0), z1: Math.max(body.z1, landing.z1) };
    out.push({ id: ln.id, type: 'link', label: LINK_KINDS[ln.kind].label, body, keep, blocksWalk: true });
  }
  if (option) {
    for (const it of option.furniture) if (it.floorId === floor.id && it.id !== skip) {
      const k = FURNITURE[it.kind];
      if (!k.blocksEq) continue;
      const body = furnRect(it);
      out.push({ id: it.id, type: 'furn', label: it.label === 'logo' ? 'Vách nhận diện' : k.label, body, keep: body, blocksWalk: !k.walk });
    }
    for (const p of option.placements) if (p.floorId === floor.id && p.id !== skip) {
      const eq = catalog.get(p.eqId);
      if (!eq) continue;
      const { body, clear } = eqRects(eq, p.x, p.z, p.rot);
      out.push({ id: p.id, type: 'eq', label: eq.name, body, keep: clear, blocksWalk: true });
    }
  }
  return out;
}

export type Conflict = { code: 'outside' | 'clearance-outside' | 'overlap' | 'clearance' | 'blocks' | 'zone'; with?: string; msg: string };

/**
 * Kiểm tra một máy tại vị trí (x, z, rot) với các vật cản của tầng. Trả về xung đột đầu tiên (hoặc null).
 * `zones` = vùng dành riêng (sảnh lễ tân, khu chức năng, trục lối đi) — máy không được đặt vào.
 */
export function checkEquipment(eq: Equipment, x: number, z: number, rot: number, floor: Floor, obstacles: Obstacle[], zones: { rect: Rect; label: string }[] = []): Conflict | null {
  const { body, clear } = eqRects(eq, x, z, rot);
  if (!inside(body, floor)) return { code: 'outside', msg: 'nằm ngoài ranh giới tầng' };
  if (!inside(clear, floor)) return { code: 'clearance-outside', msg: `thiếu khoảng trống vận hành sát tường (${CLEARANCE[kindOf(eq)].why})` };
  for (const o of obstacles) {
    if (overlaps(body, o.body)) return { code: 'overlap', with: o.id, msg: `chồng lên ${o.label}` };
    if (o.type === 'eq' && overlaps(clear, o.body)) return { code: 'clearance', with: o.id, msg: `khoảng vận hành chạm vào ${o.label}` };
    if (overlaps(body, o.keep)) return { code: o.type === 'eq' ? 'clearance' : 'blocks', with: o.id, msg: o.type === 'eq' ? `lấn khoảng vận hành của ${o.label}` : `chắn lối / vùng chừa trống của ${o.label}` };
    if (o.type !== 'eq' && o.blocksWalk && overlaps(clear, o.body)) return { code: 'clearance', with: o.id, msg: `khoảng vận hành bị ${o.label} chắn` };
  }
  for (const zn of zones) if (overlaps(body, zn.rect)) return { code: 'zone', msg: `lấn vào ${zn.label}` };
  return null;
}

/* ---------- Lưới đi lại ---------- */

export const CELL = .2;
/** Lưới đi lại của một tầng: ô bị chặn nếu cách vật cản / tường gần hơn bán kính người */
export class NavGrid {
  nx: number; nz: number; free: Uint8Array; floor: Floor;
  constructor(floor: Floor, obstacles: Rect[], radius = .3) {
    this.floor = floor;
    this.nx = Math.max(1, Math.round(floor.w / CELL));
    this.nz = Math.max(1, Math.round(floor.l / CELL));
    this.free = new Uint8Array(this.nx * this.nz).fill(1);
    const r = radius;
    for (let j = 0; j < this.nz; j++) for (let i = 0; i < this.nx; i++) {
      const [x, z] = this.center(i, j);
      if (x < -floor.w / 2 + r || x > floor.w / 2 - r || z < -floor.l / 2 + r || z > floor.l / 2 - r) this.free[j * this.nx + i] = 0;
    }
    for (const o of obstacles) {
      const g = grow(o, r);
      const [i0, j0] = this.cell(g.x0, g.z0), [i1, j1] = this.cell(g.x1, g.z1);
      for (let j = Math.max(0, j0); j <= Math.min(this.nz - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(this.nx - 1, i1); i++) {
        const [x, z] = this.center(i, j);
        if (x > g.x0 && x < g.x1 && z > g.z0 && z < g.z1) this.free[j * this.nx + i] = 0;
      }
    }
  }
  center(i: number, j: number): [number, number] { return [-this.floor.w / 2 + (i + .5) * CELL, -this.floor.l / 2 + (j + .5) * CELL]; }
  cell(x: number, z: number): [number, number] { return [Math.floor((x + this.floor.w / 2) / CELL), Math.floor((z + this.floor.l / 2) / CELL)]; }
  ok(i: number, j: number) { return i >= 0 && j >= 0 && i < this.nx && j < this.nz && this.free[j * this.nx + i] === 1; }
  /** Ô đi được gần điểm nhất (trong bán kính tìm kiếm) */
  nearest(x: number, z: number, maxR = 2.5): [number, number] | null {
    const [ci, cj] = this.cell(x, z);
    const R = Math.ceil(maxR / CELL);
    let best: [number, number] | null = null, bd = Infinity;
    for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
      const i = ci + di, j = cj + dj;
      if (!this.ok(i, j)) continue;
      const d = di * di + dj * dj;
      if (d < bd) { bd = d; best = [i, j]; }
    }
    return best;
  }
  /** BFS từ các ô xuất phát → khoảng cách (số ô, -1 = không tới được) */
  bfs(starts: [number, number][]) {
    const dist = new Int32Array(this.nx * this.nz).fill(-1);
    const q = new Int32Array(this.nx * this.nz);
    let h = 0, t = 0;
    for (const [i, j] of starts) if (this.ok(i, j) && dist[j * this.nx + i] < 0) { dist[j * this.nx + i] = 0; q[t++] = j * this.nx + i; }
    while (h < t) {
      const c = q[h++], i = c % this.nx, j = (c / this.nx) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = i + di, b = j + dj;
        if (!this.ok(a, b)) continue;
        const k = b * this.nx + a;
        if (dist[k] >= 0) continue;
        dist[k] = dist[c] + 1; q[t++] = k;
      }
    }
    return dist;
  }
  /** Đường đi A* (8 hướng) rồi rút gọn theo tầm nhìn thẳng; trả về các điểm (m) hoặc null */
  path(ax: number, az: number, bx: number, bz: number): [number, number][] | null {
    const s = this.nearest(ax, az), g = this.nearest(bx, bz);
    if (!s || !g) return null;
    const N = this.nx * this.nz, si = s[1] * this.nx + s[0], gi = g[1] * this.nx + g[0];
    const gs = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap: [number, number][] = [];
    const push = (k: number, f: number) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop()!; if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const hx = (k: number) => { const i = k % this.nx, j = (k / this.nx) | 0; const dx = Math.abs(i - g[0]), dz = Math.abs(j - g[1]); return Math.max(dx, dz) + .414 * Math.min(dx, dz); };
    gs[si] = 0; push(si, hx(si));
    let found = false;
    while (heap.length) {
      const [, c] = pop();
      if (closed[c]) continue;
      if (c === gi) { found = true; break; }
      closed[c] = 1;
      const i = c % this.nx, j = (c / this.nx) | 0;
      for (const [di, dj, cost] of NB) {
        const a = i + di, b = j + dj;
        if (!this.ok(a, b) || (di && dj && (!this.ok(i + di, j) || !this.ok(i, j + dj)))) continue;
        const k = b * this.nx + a, ng = gs[c] + cost;
        if (ng < gs[k]) { gs[k] = ng; from[k] = c; push(k, ng + hx(k)); }
      }
    }
    if (!found) return null;
    const cells: number[] = [];
    for (let k = gi; k >= 0; k = from[k]) { cells.push(k); if (k === si) break; }
    cells.reverse();
    // rút gọn: giữ điểm khi không còn nhìn thẳng được
    const pts: [number, number][] = [];
    let anchor = 0;
    pts.push(this.center(cells[0] % this.nx, (cells[0] / this.nx) | 0));
    for (let k = 2; k < cells.length; k++) {
      if (!this.los(cells[anchor], cells[k])) { anchor = k - 1; pts.push(this.center(cells[anchor] % this.nx, (cells[anchor] / this.nx) | 0)); }
    }
    pts.push(this.center(gi % this.nx, (gi / this.nx) | 0));
    return pts;
  }
  /** Nhìn thẳng giữa hai ô (không xuyên ô bị chặn) */
  los(a: number, b: number) {
    let i0 = a % this.nx, j0 = (a / this.nx) | 0;
    const i1 = b % this.nx, j1 = (b / this.nx) | 0;
    const di = Math.abs(i1 - i0), dj = Math.abs(j1 - j0), si = i0 < i1 ? 1 : -1, sj = j0 < j1 ? 1 : -1;
    let err = di - dj;
    for (;;) {
      if (!this.ok(i0, j0)) return false;
      if (i0 === i1 && j0 === j1) return true;
      const e2 = 2 * err;
      if (e2 > -dj) { err -= dj; i0 += si; }
      if (e2 < di) { err += di; j0 += sj; }
    }
  }
}
const NB: [number, number, number][] = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];

/** Điểm người bước vào tầng: ngay trong cửa chính (tầng có lối vào) + chiếu nghỉ của mọi cầu thang / thang máy */
export function entryPoints(project: Pick<Project, 'floors' | 'links'>, floor: Floor): { x: number; z: number; kind: 'door' | 'link'; id: string }[] {
  const pts: { x: number; z: number; kind: 'door' | 'link'; id: string }[] = [];
  const isEntrance = entranceFloor(project).id === floor.id;
  for (const fx of floor.fixtures) if (fx.kind === 'door' && (fx.main || isEntrance)) {
    const { n } = wallOf(floor, fx.x, fx.z);
    pts.push({ x: fx.x + n[0] * .8, z: fx.z + n[1] * .8, kind: 'door', id: fx.id });
  }
  for (const ln of project.links) if (ln.floors.includes(floor.id)) { const { entry } = linkRects(ln); pts.push({ ...entry, kind: 'link', id: ln.id }); }
  return pts;
}

/* ---------- Kiểm tra toàn phương án ---------- */

export type Issue = { id: string; floorId: string; level: 'error' | 'warn'; msg: string };
export type Validation = { issues: Issue[]; level: Map<string, 'error' | 'warn'>; verify: string[]; unreachable: Set<string> };

const HEAVY: EquipmentKind[] = ['rack', 'smith', 'plate', 'dumbbell-rack', 'plate-tree', 'multi'];
const POWERED: EquipmentKind[] = ['treadmill', 'elliptical'];

/** Ô đi được sát thân máy (dùng để kiểm tra tiếp cận) */
export function accessCells(grid: NavGrid, body: Rect) {
  const out: [number, number][] = [];
  const g = grow(body, .55);
  const [i0, j0] = grid.cell(g.x0, g.z0), [i1, j1] = grid.cell(g.x1, g.z1);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (grid.ok(i, j)) out.push([i, j]);
  return out;
}

/**
 * Kiểm tra toàn bộ một phương án: trong ranh giới, không chồng lấn, khoảng trống vận hành, không chắn cửa / cầu thang /
 * lối thoát, có đường từ cửa (hoặc chiếu nghỉ) tới từng máy, chiều cao trần; kèm danh sách điều cần xác minh
 * (tải trọng sàn, điện, thông số ước tính, đưa máy lên tầng). Không tự kết luận về kết cấu.
 */
export function validateOption(project: Project, option: DesignOption, catalog: Map<string, Equipment>): Validation {
  const issues: Issue[] = [];
  const verify = new Set<string>();
  const unreachable = new Set<string>();
  const entrance = entranceFloor(project);
  const estimated = new Set<string>();
  const big = new Map<string, Set<string>>();
  for (const floor of project.floors) {
    const items = option.placements.filter(p => p.floorId === floor.id);
    const allObs = floorObstacles(project, floor, option, catalog);
    const zones = option.furniture.filter(f => f.floorId === floor.id && (f.kind === 'turf' || f.kind === 'mat-zone')).map(f => ({ rect: furnRect(f), label: FURNITURE[f.kind].label.toLowerCase() }));
    for (const p of items) {
      const eq = catalog.get(p.eqId);
      if (!eq) { issues.push({ id: p.id, floorId: floor.id, level: 'error', msg: 'Máy không còn trong danh mục' }); continue; }
      const c = checkEquipment(eq, p.x, p.z, p.rot, floor, allObs.filter(o => o.id !== p.id), zones);
      if (c) issues.push({ id: p.id, floorId: floor.id, level: 'error', msg: `${eq.name}: ${c.msg}` });
      if (eq.height / 100 > floor.h - .25 || (kindOf(eq) === 'treadmill' && floor.h < 2.6)) issues.push({ id: p.id, floorId: floor.id, level: 'error', msg: `${eq.name}: trần ${floor.h} m thấp so với máy cao ${eq.height} cm (cần chừa đầu người tập)` });
      if (eq.dimsEstimated) estimated.add(eq.name);
      if (floor.level > 0 && HEAVY.includes(kindOf(eq))) verify.add(`${floor.name}: có thiết bị nặng (khung tạ, máy treo bánh, kệ tạ…). Cần kỹ sư kết cấu xác nhận tải trọng sàn, tải tập trung, rung và va đập khi thả tạ — công cụ không tự kết luận sàn chịu được.`);
      if (floor.level > 0 && eq.width >= 180) { const s = big.get(floor.name) ?? new Set<string>(); s.add(`${eq.name} ${eq.width}×${eq.depth} cm`); big.set(floor.name, s); }
    }
    for (const f of option.furniture.filter(x => x.floorId === floor.id)) {
      const r = furnRect(f);
      if (!inside(r, floor)) issues.push({ id: f.id, floorId: floor.id, level: 'error', msg: `${FURNITURE[f.kind].label}: nằm ngoài ranh giới tầng` });
    }
    const powered = items.filter(p => POWERED.includes(kindOf(catalog.get(p.eqId) ?? { category: 'strength' }))).length;
    if (powered) {
      const outlets = floor.fixtures.filter(x => x.kind === 'outlet').length;
      verify.add(`${floor.name}: ${powered} máy chạy điện (máy chạy bộ / elip) — cần ổ cắm riêng gần máy (thường 220 V, 16 A mỗi máy chạy bộ thương mại)${outlets ? `; đã khai báo ${outlets} ổ điện, cần kiểm tra công suất` : '; chưa khai báo vị trí ổ điện'}.`);
    }
    // Tiếp cận: từ cửa / chiếu nghỉ tới từng máy
    const grid = new NavGrid(floor, allObs.filter(o => o.blocksWalk).map(o => o.body));
    const starts = entryPoints(project, floor).map(e => grid.nearest(e.x, e.z)).filter((x): x is [number, number] => !!x);
    if (!starts.length) {
      if (floor.id !== entrance.id || project.floors.length > 1) issues.push({ id: floor.id, floorId: floor.id, level: 'error', msg: `${floor.name}: chưa có lối vào (cửa chính hoặc cầu thang / thang máy nối tầng)` });
      continue;
    }
    const dist = grid.bfs(starts);
    for (const p of items) {
      const eq = catalog.get(p.eqId);
      if (!eq) continue;
      const { body } = eqRects(eq, p.x, p.z, p.rot);
      if (!accessCells(grid, body).some(([i, j]) => dist[j * grid.nx + i] >= 0)) {
        unreachable.add(p.id);
        issues.push({ id: p.id, floorId: floor.id, level: 'error', msg: `${eq.name}: không có lối đi từ cửa / cầu thang tới máy` });
      }
    }
    for (const fx of floor.fixtures.filter(x => x.kind === 'exit' || x.kind === 'wc' || x.kind === 'locker')) {
      const { body } = fixtureRects(fx, floor);
      if (!accessCells(grid, body).some(([i, j]) => dist[j * grid.nx + i] >= 0)) issues.push({ id: fx.id, floorId: floor.id, level: 'error', msg: `${FIXTURE_KINDS[fx.kind].label}: bị chặn, không có lối đi tới` });
    }
    for (const ln of project.links.filter(x => x.floors.includes(floor.id))) {
      const { entry } = linkRects(ln);
      const c = grid.nearest(entry.x, entry.z, .8);
      if (!c || dist[c[1] * grid.nx + c[0]] < 0) issues.push({ id: ln.id, floorId: floor.id, level: 'error', msg: `${floor.name}: ${LINK_KINDS[ln.kind].label.toLowerCase()} bị chắn, không nối được với cửa vào` });
    }
  }
  for (const [name, s] of big) verify.add(`${name}: ${s.size} máy lớn (vd. ${[...s].slice(0, 2).join('; ')}) — cần xác minh kích thước cửa thang máy / chiếu nghỉ cầu thang để đưa máy lên, hoặc phương án tháo rời lắp tại chỗ.`);
  if (estimated.size) verify.add(`${estimated.size} mẫu máy đang dùng kích thước ước tính theo loại máy (vd. ${[...estimated].slice(0, 3).join(', ')}) — cần số đo thật của nhà cung cấp trước khi chốt mặt bằng.`);
  if (project.floors.length > 1 && !project.links.length) issues.push({ id: 'links', floorId: project.floors[0].id, level: 'error', msg: 'Công trình nhiều tầng nhưng chưa khai báo cầu thang / thang máy nối các tầng' });
  for (const f of project.floors) if (project.floors.length > 1 && !project.links.some(l => l.floors.includes(f.id))) issues.push({ id: f.id, floorId: f.id, level: 'error', msg: `${f.name}: chưa nối với tầng khác bằng cầu thang / thang máy` });
  const level = new Map<string, 'error' | 'warn'>();
  for (const i of issues) if (level.get(i.id) !== 'error') level.set(i.id, i.level);
  return { issues, level, verify: [...verify], unreachable };
}

/** Diện tích còn lại để bố trí của một tầng (trừ vật cố định chặn, lõi giao thông + chiếu nghỉ, sảnh lễ tân) */
export function usableArea(project: Pick<Project, 'links'>, floor: Floor, reserved: Rect[] = []) {
  let a = floor.w * floor.l;
  for (const fx of floor.fixtures) if (FIXTURE_KINDS[fx.kind].blocks) a -= area(fixtureRects(fx, floor).body);
  for (const ln of project.links) if (ln.floors.includes(floor.id)) { const r = linkRects(ln); a -= area(r.body) + area(r.landing); }
  for (const r of reserved) a -= area(r);
  return Math.max(0, a);
}
export type { Placement };

/** Diện tích lát thảm sàn của tầng (m²): sàn trừ vật cố định chặn và thân cầu thang / thang máy — dùng chung cho chọn máy theo ngân sách và bảng chi phí */
export function flooringM2(project: Pick<Project, 'links'>, floor: Floor) {
  let m2 = floor.w * floor.l;
  for (const fx of floor.fixtures) if (FIXTURE_KINDS[fx.kind].blocks) m2 -= area(fixtureRects(fx, floor).body);
  for (const ln of project.links) if (ln.floors.includes(floor.id)) m2 -= area(linkRects(ln).body);
  return Math.max(0, m2);
}
