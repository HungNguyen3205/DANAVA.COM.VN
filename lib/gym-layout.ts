/**
 * Tự động bố trí phòng gym (phòng lab 3D): chọn máy từ danh mục theo diện tích, kiểu phòng, ngân sách → đặt sẵn theo khu.
 *   - Cardio: một hàng sát tường sau (máy chạy, xe đạp, elip), đặt dọc, cách nhau 50 cm.
 *   - Tạ tự do: góc phải (khung tạ / Smith, ghế, kệ tạ).
 *   - Máy tạ: các hàng ở giữa, mỗi máy chừa lối đi ~80 cm.
 * Thuần hàm (không phụ thuộc trình duyệt) để test được. Khách chỉnh lại trong phòng lab sau khi bố trí.
 */
import type { Equipment, EquipmentKind } from './equipment.ts';

export type LayoutStyle = 'balanced' | 'cardio' | 'strength' | 'pt';
/** Khu không đặt máy (cửa, cầu thang, nhà vệ sinh…): hình chữ nhật trên sàn, toạ độ tâm (m) như máy */
export type ZoneKind = 'door' | 'stairs' | 'wc' | 'column' | 'reception' | 'other';
export type Zone = { kind: ZoneKind; x: number; z: number; w: number; d: number; rot: number };
export const ZONE_KINDS: Record<ZoneKind, { label: string; w: number; d: number; color: string; pad: number }> = {
  door: { label: 'Cửa ra vào', w: 1.2, d: 1, color: '#2b4294', pad: 1 },
  stairs: { label: 'Cầu thang', w: 1.2, d: 3, color: '#5b6478', pad: .5 },
  wc: { label: 'Nhà vệ sinh', w: 2, d: 2, color: '#0e7490', pad: .5 },
  column: { label: 'Cột', w: .4, d: .4, color: '#475569', pad: .3 },
  reception: { label: 'Quầy lễ tân', w: 2.4, d: 1, color: '#7c3aed', pad: .6 },
  other: { label: 'Khu khác', w: 1.5, d: 1.5, color: '#b42318', pad: .5 }
};
/** Kích thước chiếm sàn của khu theo hướng xoay */
export const zoneFoot = (z: Pick<Zone, 'w' | 'd' | 'rot'>) => (z.rot % 2 ? [z.d, z.w] : [z.w, z.d]);
export type LayoutInput = { w: number; l: number; style: LayoutStyle; budget?: number; zones?: Zone[] };
export type LayoutItem = { eqId: string; x: number; z: number; rot: number };
export type LayoutResult = { items: LayoutItem[]; total: number; zones: { cardio: number; strength: number; free: number } };

export const LAYOUT_STYLES: Record<LayoutStyle, { label: string; hint: string; share: [number, number, number] }> = {
  balanced: { label: 'Gym tổng hợp', hint: 'Cân bằng cardio, máy tạ và tạ tự do', share: [.3, .45, .25] },
  cardio: { label: 'Thiên cardio', hint: 'Nhiều máy chạy, xe đạp cho giảm cân', share: [.5, .32, .18] },
  strength: { label: 'Thiên sức mạnh', hint: 'Nhiều máy tạ và khu tạ tự do', share: [.2, .5, .3] },
  pt: { label: 'PT studio', hint: 'Phòng nhỏ, khung tạ đa năng và ít cardio', share: [.18, .32, .5] }
};

const kindOf = (e: Equipment): EquipmentKind | undefined => e.kind;
const CARDIO: EquipmentKind[] = ['treadmill', 'bike', 'elliptical', 'rower', 'recumbent'];
/** Nhóm bài tập của máy tạ (để chọn đa dạng, không trùng 2 máy cùng bài) */
const EXERCISES: [string, RegExp][] = [
  ['chest', /chest press|đẩy ngực|vertical press|incline chest|pectoral|tập ngực/i], ['lat', /pulldown|pull down|kéo xô|lat /i], ['row', /row|chèo/i],
  ['legpress', /leg press|đạp đùi/i], ['legext', /leg extensi|đá đùi/i], ['legcurl', /leg curl|móc đùi|đùi sau/i],
  ['shoulder', /shoulder press|tập vai|vai/i], ['fly', /pec fly|fly|rear delt/i], ['abd', /abductor|adductor|hip|mông|glute/i],
  ['abs', /abdominal|bụng|torso|rotary/i], ['back', /back extension|lưng/i], ['arm', /curl|tricep|bicep|arm/i], ['calf', /calf|bắp chân/i]
];
const exerciseOf = (name: string) => EXERCISES.find(([, re]) => re.test(name))?.[0] ?? name.toLowerCase();

type Box = { eq: Equipment; fw: number; fd: number; rot: number };
const footprint = (eq: Equipment, rot: number): Box => {
  const w = eq.width / 100, d = eq.depth / 100;
  return { eq, rot, fw: rot % 2 ? d : w, fd: rot % 2 ? w : d };
};

type Rect = { x0: number; x1: number; z0: number; z1: number };
/** Xếp lần lượt theo hàng trong một vùng chữ nhật (mét, toạ độ tâm phòng), né các vùng cấm; trả về máy đặt được */
function pack(boxes: Box[], x0: number, x1: number, z0: number, z1: number, gapX: number, gapZ: number, blocked: Rect[] = []): LayoutItem[] {
  const out: LayoutItem[] = [];
  let x = x0, z = z0, rowD = 0;
  const hit = (ax0: number, az0: number, w: number, d: number) => blocked.find(r => ax0 < r.x1 && ax0 + w > r.x0 && az0 < r.z1 && az0 + d > r.z0);
  for (const b of boxes) {
    if (b.fw > x1 - x0 + 1e-6) continue;
    for (let guard = 0; guard < 200; guard++) {
      if (x + b.fw > x1 + 1e-6) { x = x0; z += Math.max(rowD, .4) + gapZ; rowD = 0; }
      if (z + b.fd > z1 + 1e-6) break;
      const r = hit(x, z, b.fw, b.fd);
      if (!r) {
        out.push({ eqId: b.eq.id, x: x + b.fw / 2, z: z + b.fd / 2, rot: b.rot });
        blocked.push({ x0: x, x1: x + b.fw, z0: z, z1: z + b.fd });
        x += b.fw + gapX;
        rowD = Math.max(rowD, b.fd);
        break;
      }
      x = r.x1 + .05; // bước qua vùng cấm rồi thử tiếp
    }
  }
  return out;
}

export function autoLayout(equipment: Equipment[], input: LayoutInput): LayoutResult {
  const { w: W, l: L, style } = input;
  // Khu không đặt máy + lối đi xung quanh (cửa ra vào chừa rộng hơn); dùng chung cho mọi khu
  const blocked: Rect[] = (input.zones || []).map(z => {
    const [fw, fd] = zoneFoot(z), p = ZONE_KINDS[z.kind]?.pad ?? .5;
    return { x0: z.x - fw / 2 - p, x1: z.x + fw / 2 + p, z0: z.z - fd / 2 - p, z1: z.z + fd / 2 + p };
  });
  const [cShare, sShare, fShare] = LAYOUT_STYLES[style].share;
  const area = W * L;
  const usable = equipment.filter(e => e.published && e.category !== 'accessory' && e.kind);
  // Ưu tiên máy có giá; ngân sách thấp → máy rẻ trước, không giới hạn → máy tầm trung
  const budget = input.budget && input.budget > 0 ? input.budget : 0;
  const priceOf = (e: Equipment) => (e.price ? Number(e.price) : Infinity);
  const tierSort = (a: Equipment, b: Equipment) => {
    if (!!a.price !== !!b.price) return a.price ? -1 : 1;
    if (!budget) return Math.abs(priceOf(a) - 30e6) - Math.abs(priceOf(b) - 30e6);
    return budget / Math.max(area, 1) < 400_000 ? priceOf(a) - priceOf(b) : priceOf(b) - priceOf(a);
  };
  let spent = 0;
  const afford = (e: Equipment) => !budget || !e.price || spent + Number(e.price) <= budget;
  const take = (e: Equipment) => { if (e.price) spent += Number(e.price); return e; };

  // Số máy mỗi khu theo diện tích (m² / máy)
  const nCardio = Math.max(1, Math.round((area * cShare) / 4.5));
  const nStrength = Math.max(1, Math.round((area * sShare) / 7));
  const nFree = Math.max(1, Math.round((area * fShare) / 6));

  // --- Cardio: hàng sát tường sau, đặt dọc (rot 1), xen kẽ máy chạy / xe đạp / elip
  const cardioPool = usable.filter(e => CARDIO.includes(kindOf(e)!)).sort(tierSort);
  const treadmills = cardioPool.filter(e => e.kind === 'treadmill'), others = cardioPool.filter(e => e.kind !== 'treadmill');
  const cardioPick: Equipment[] = [];
  for (let i = 0; cardioPick.length < nCardio && (treadmills.length || others.length) && i < nCardio * 3; i++) {
    const src = i % 3 === 2 && others.length ? others : treadmills.length ? treadmills : others;
    const e = src[i % Math.max(1, Math.min(src.length, 2))];
    if (e && afford(e)) cardioPick.push(take(e)); else if (!e) break;
  }
  const cardioDepth = Math.min(2.6, L * .35);
  const cardioItems = pack(cardioPick.map(e => footprint(e, 1)), -W / 2 + .3, W / 2 - .3, -L / 2 + .2, -L / 2 + .2 + cardioDepth, .5, .6, blocked);

  // --- Tạ tự do: góc phải trước (khung tạ / Smith, ghế, kệ tạ)
  const freeW = Math.min(W * .45, Math.max(3, W * fShare * 1.4));
  const freeZ0 = -L / 2 + cardioDepth + 1.2;
  const freePool = usable.filter(e => ['rack', 'smith', 'bench', 'dumbbell-rack', 'plate-tree'].includes(kindOf(e)!)).sort(tierSort);
  const freePick: Equipment[] = [];
  for (const kind of ['rack', 'smith', 'dumbbell-rack', 'bench', 'bench', 'plate-tree', 'bench', 'rack'] as EquipmentKind[]) {
    if (freePick.length >= nFree) break;
    const e = freePool.find(x => x.kind === kind && !freePick.includes(x) && afford(x));
    if (e) freePick.push(take(e));
  }
  const freeItems = pack(freePick.map(e => footprint(e, 0)), W / 2 - freeW, W / 2 - .3, freeZ0, L / 2 - .3, .9, 1, blocked);

  // --- Máy tạ: phần giữa còn lại, mỗi bài một máy (đa dạng), cùng dòng máy nếu được
  const stackPool = usable.filter(e => ['stack', 'plate', 'multi', 'cable'].includes(kindOf(e)!)).sort(tierSort);
  const series = (n: string) => n.split(/[\s-]/)[0].replace(/\d+/g, '').toUpperCase();
  const lead = stackPool[0] ? series(stackPool[0].name) : '';
  // Bài chính trước (ngực, xô, đạp đùi, vai, chèo, đá / móc đùi), bài phụ sau; cùng dòng máy với máy đầu tiên
  const PRIORITY = ['chest', 'lat', 'legpress', 'shoulder', 'row', 'legext', 'legcurl', 'fly', 'abs', 'abd', 'back', 'arm', 'calf'];
  const rank = (e: Equipment) => { const i = PRIORITY.indexOf(exerciseOf(e.name)); return i < 0 ? PRIORITY.length : i; };
  const ordered = [...stackPool.filter(e => series(e.name) === lead), ...stackPool.filter(e => series(e.name) !== lead)]
    .map((e, i) => ({ e, i })).sort((a, b) => rank(a.e) - rank(b.e) || a.i - b.i).map(x => x.e);
  const seen = new Set<string>(), strengthPick: Equipment[] = [];
  for (const e of ordered) {
    if (strengthPick.length >= nStrength) break;
    const ex = exerciseOf(e.name);
    if (seen.has(ex) || !afford(e)) continue;
    seen.add(ex); strengthPick.push(take(e));
  }
  const strengthItems = pack(strengthPick.map(e => footprint(e, 0)), -W / 2 + .4, W / 2 - freeW - .8, freeZ0, L / 2 - .3, .8, 1, blocked);

  const items = [...cardioItems, ...strengthItems, ...freeItems];
  const byId = new Map(equipment.map(e => [e.id, e]));
  const total = items.reduce((s, it) => s + Number(byId.get(it.eqId)?.price || 0), 0);
  return { items, total, zones: { cardio: cardioItems.length, strength: strengthItems.length, free: freeItems.length } };
}
