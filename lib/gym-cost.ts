/**
 * Chi phí một phương án theo từng tầng và toàn công trình.
 *  - Thiết bị có giá (danh mục đối tác) → cộng vào tổng đã có giá.
 *  - Thiết bị thiếu giá → liệt kê riêng "Liên hệ", KHÔNG coi là 0 đồng và không tính vào ngân sách.
 *  - Thảm sàn cao su (đối tác, có giá) theo diện tích sàn tập của tầng.
 *  - Nội thất / lễ tân: chỉ có khoảng giá tham khảo (giả định) → hiện phạm vi chi phí riêng.
 */
import type { Equipment, Flooring } from './equipment.ts';
import { footOf, type DesignOption, type FurnKind, type Project } from './gym-project.ts';
import { FURNITURE, furnEstimate } from './gym-decor.ts';
import { flooringM2 } from './gym-geometry.ts';

export type CostLine = { eq: Equipment; qty: number; unit: number | null; total: number | null };
export type FloorCost = {
  floorId: string; name: string;
  lines: CostLine[]; priced: number; unpriced: CostLine[];
  flooring: { tiles: number; unit: number | null; total: number | null; m2: number } | null;
  furniture: { kind: FurnKind; label: string; qty: number; est: [number, number] | null }[];
  furnEst: [number, number];
};
export type ProjectCost = { floors: FloorCost[]; priced: number; unpricedCount: number; furnEst: [number, number]; range: [number, number]; budget: number; overBudget: boolean };

export function costOf(project: Project, option: DesignOption | undefined, catalog: Map<string, Equipment>, flooring?: Flooring | null, floorOn = true): ProjectCost {
  const floors: FloorCost[] = project.floors.map(f => {
    const m = new Map<string, CostLine>();
    for (const p of option?.placements ?? []) if (p.floorId === f.id) {
      const eq = catalog.get(p.eqId);
      if (!eq) continue;
      const l = m.get(eq.id) || { eq, qty: 0, unit: eq.price ? Number(eq.price) : null, total: null };
      l.qty++;
      l.total = l.unit === null ? null : l.unit * l.qty;
      m.set(eq.id, l);
    }
    const lines = [...m.values()];
    const priced = lines.reduce((s, l) => s + (l.total ?? 0), 0);
    const m2 = flooringM2(project, f);
    const tiles = flooring && floorOn ? Math.ceil(m2 / ((flooring.sizeCm / 100) ** 2)) : 0;
    const unit = flooring?.price ? Number(flooring.price) : null;
    const fm = new Map<FurnKind, { kind: FurnKind; label: string; qty: number; est: [number, number] | null }>();
    for (const it of option?.furniture ?? []) if (it.floorId === f.id) {
      const e = furnEstimate(it);
      const cur = fm.get(it.kind) || { kind: it.kind, label: FURNITURE[it.kind].label, qty: 0, est: e ? [0, 0] as [number, number] : null };
      cur.qty += ['turf', 'mat-zone'].includes(it.kind) ? 0 : 1;
      if (['turf', 'mat-zone'].includes(it.kind)) { const [w, d] = footOf(it.w, it.d, 0); cur.label = `${FURNITURE[it.kind].label} (${Math.round(w * d)} m²)`; cur.qty = 1; }
      if (cur.est && e) cur.est = [cur.est[0] + e[0], cur.est[1] + e[1]];
      fm.set(it.kind, cur);
    }
    const furniture = [...fm.values()].filter(x => x.est);
    const furnEst = furniture.reduce<[number, number]>((s, x) => [s[0] + (x.est?.[0] ?? 0), s[1] + (x.est?.[1] ?? 0)], [0, 0]);
    return {
      floorId: f.id, name: f.name, lines, priced: priced + (unit && tiles ? unit * tiles : 0), unpriced: lines.filter(l => l.unit === null),
      flooring: flooring && floorOn ? { tiles, unit, total: unit ? unit * tiles : null, m2 } : null, furniture, furnEst
    };
  });
  const priced = floors.reduce((s, f) => s + f.priced, 0);
  const furnEst = floors.reduce<[number, number]>((s, f) => [s[0] + f.furnEst[0], s[1] + f.furnEst[1]], [0, 0]);
  const unpricedCount = floors.reduce((s, f) => s + f.unpriced.reduce((a, l) => a + l.qty, 0), 0);
  const budget = project.brief.budget;
  return { floors, priced, unpricedCount, furnEst, range: [priced + furnEst[0], priced + furnEst[1]], budget, overBudget: !!budget && priced > budget };
}

/** Đổi VNĐ → "1,2 tỷ" / "350 triệu" cho chỗ hẹp */
export function shortVND(n: number) {
  if (n >= 1e9) return `${(Math.round(n / 1e8) / 10).toLocaleString('vi-VN')} tỷ`;
  if (n >= 1e6) return `${Math.round(n / 1e6).toLocaleString('vi-VN')} triệu`;
  return `${Math.round(n).toLocaleString('vi-VN')} ₫`;
}
