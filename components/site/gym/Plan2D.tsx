'use client';
/**
 * Mặt bằng 2D (SVG) của một tầng: dùng khi trình duyệt không chạy được WebGL (kéo thả vẫn hoạt động),
 * làm ảnh thu nhỏ khi so sánh 3 phương án, và vẽ khách mô phỏng.
 */
import { useRef, useState, type PointerEvent as RPE } from 'react';
import type { Equipment } from '@/lib/equipment';
import { FIXTURE_KINDS, LINK_KINDS, footOf, type DesignOption, type Floor, type Project } from '@/lib/gym-project';
import { eqRects, linkRects } from '@/lib/gym-geometry';
import { groupOf } from '@/lib/gym-layout';
import type { PersonView } from './studio-engine';

const GROUP_COLOR = { cardio: '#2b4294', machine: '#f26b1d', free: '#13244f' } as const;

export function Plan2D({ project, option, floor, catalog, selected, issues, onSelect, onMove, people, interactive = true, showClear = false, flows, className }: {
  project: Project; option: DesignOption | null; floor: Floor; catalog: Map<string, Equipment>;
  selected?: string | null; issues?: Map<string, 'error' | 'warn'>;
  onSelect?: (id: string | null) => void; onMove?: (id: string, x: number, z: number) => void;
  people?: PersonView[]; interactive?: boolean; showClear?: boolean;
  flows?: { floorId: string; kind: 'member' | 'guest'; pts: [number, number][] }[];
  className?: string;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dz: number; x: number; z: number } | null>(null);
  const pad = .6;
  const vb = `${-floor.w / 2 - pad} ${-floor.l / 2 - pad} ${floor.w + pad * 2} ${floor.l + pad * 2}`;
  const toLocal = (e: RPE) => {
    const s = svg.current!; const pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(s.getScreenCTM()!.inverse()); return { x: p.x, z: p.y };
  };
  const down = (id: string, x: number, z: number, locked?: boolean) => (e: RPE) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelect?.(id);
    if (locked || !onMove) return;
    const p = toLocal(e);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ id, dx: p.x - x, dz: p.z - z, x, z });
  };
  const move = (e: RPE) => { if (!drag) return; const p = toLocal(e); setDrag({ ...drag, x: Math.round((p.x - drag.dx) / .05) * .05, z: Math.round((p.z - drag.dz) / .05) * .05 }); };
  const up = () => { if (drag) { onMove?.(drag.id, Math.round(drag.x * 100) / 100, Math.round(drag.z * 100) / 100); setDrag(null); } };
  const pos = (id: string, x: number, z: number) => (drag?.id === id ? [drag.x, drag.z] : [x, z]);
  const rect = (x: number, z: number, w: number, d: number) => ({ x: x - w / 2, y: z - d / 2, width: w, height: d });
  const lw = Math.max(floor.w, floor.l) / 300;

  return (
    <svg ref={svg} className={className} viewBox={vb} role="img" aria-label={`Mặt bằng ${floor.name} ${floor.w} × ${floor.l} m`}
      onPointerMove={move} onPointerUp={up} onPointerDown={() => interactive && onSelect?.(null)} style={{ touchAction: interactive ? 'none' : undefined }}>
      <rect x={-floor.w / 2} y={-floor.l / 2} width={floor.w} height={floor.l} fill="#f8fafc" stroke="#13244f" strokeWidth={lw * 3} />
      {/* lưới 1 m */}
      {Array.from({ length: Math.floor(floor.w) }, (_, i) => <line key={'x' + i} x1={-floor.w / 2 + i + 1} x2={-floor.w / 2 + i + 1} y1={-floor.l / 2} y2={floor.l / 2} stroke="#e2e8f0" strokeWidth={lw} />)}
      {Array.from({ length: Math.floor(floor.l) }, (_, i) => <line key={'z' + i} y1={-floor.l / 2 + i + 1} y2={-floor.l / 2 + i + 1} x1={-floor.w / 2} x2={floor.w / 2} stroke="#e2e8f0" strokeWidth={lw} />)}
      {option?.furniture.filter(f => f.floorId === floor.id && (f.kind === 'turf' || f.kind === 'mat-zone')).map(f => { const [w, d] = footOf(f.w, f.d, f.rot); return <rect key={f.id} {...rect(f.x, f.z, w, d)} fill={f.kind === 'turf' ? '#bbf7d0' : '#e2e8f0'} opacity={.8} />; })}
      {showClear && option?.placements.filter(p => p.floorId === floor.id).map(p => { const eq = catalog.get(p.eqId); if (!eq) return null; const [x, z] = pos(p.id, p.x, p.z); const { clear } = eqRects(eq, x, z, p.rot); return <rect key={'c' + p.id} x={clear.x0} y={clear.z0} width={clear.x1 - clear.x0} height={clear.z1 - clear.z0} fill="#60a5fa" opacity={.12} />; })}
      {floor.fixtures.map(fx => {
        const k = FIXTURE_KINDS[fx.kind]; const [x, z] = pos(fx.id, fx.x, fx.z); const [w, d] = footOf(fx.w, fx.d, fx.rot);
        return <g key={fx.id} onPointerDown={down(fx.id, fx.x, fx.z)} style={{ cursor: interactive ? 'grab' : undefined }}>
          <rect {...rect(x, z, Math.max(w, .15), Math.max(d, .15))} fill={k.color} opacity={k.blocks ? .35 : .85} stroke={selected === fx.id ? '#f26b1d' : issues?.get(fx.id) ? '#ef4444' : k.color} strokeWidth={lw * 2} />
          {k.blocks && <text x={x} y={z} fontSize={.36} textAnchor="middle" dominantBaseline="middle" fill="#0f172a">{fx.label || k.label}</text>}
        </g>;
      })}
      {project.links.filter(l => l.floors.includes(floor.id)).map(ln => {
        const [x, z] = pos(ln.id, ln.x, ln.z); const [w, d] = footOf(ln.w, ln.d, ln.rot); const { landing } = linkRects({ ...ln, x, z });
        return <g key={ln.id} onPointerDown={down(ln.id, ln.x, ln.z)} style={{ cursor: interactive ? 'grab' : undefined }}>
          <rect x={landing.x0} y={landing.z0} width={landing.x1 - landing.x0} height={landing.z1 - landing.z0} fill="none" stroke={LINK_KINDS[ln.kind].color} strokeDasharray=".15 .1" strokeWidth={lw * 1.5} />
          <rect {...rect(x, z, w, d)} fill={LINK_KINDS[ln.kind].color} opacity={.55} stroke={selected === ln.id ? '#f26b1d' : issues?.get(ln.id) ? '#ef4444' : 'none'} strokeWidth={lw * 3} />
          <text x={x} y={z} fontSize={.36} textAnchor="middle" dominantBaseline="middle" fill="#fff">{LINK_KINDS[ln.kind].label}</text>
        </g>;
      })}
      {option?.furniture.filter(f => f.floorId === floor.id && f.kind !== 'turf' && f.kind !== 'mat-zone' && f.kind !== 'linear-light').map(f => {
        const [x, z] = pos(f.id, f.x, f.z); const [w, d] = footOf(f.w, f.d, f.rot);
        return <g key={f.id} onPointerDown={down(f.id, f.x, f.z, f.locked)} style={{ cursor: interactive ? (f.locked ? 'pointer' : 'grab') : undefined }}>
          <rect {...rect(x, z, Math.max(w, .1), Math.max(d, .1))} rx={.05} fill={f.group === 'reception' ? '#a78bfa' : f.kind === 'plant' ? '#4ade80' : f.kind === 'station' ? '#fdba74' : '#cbd5e1'} stroke={selected === f.id ? '#f26b1d' : issues?.get(f.id) ? '#ef4444' : '#64748b'} strokeWidth={lw * (selected === f.id ? 3 : 1)} />
          {f.kind === 'station' && <text x={x} y={z} fontSize={.3} textAnchor="middle" dominantBaseline="middle" fill="#7c2d12">{f.label}</text>}
        </g>;
      })}
      {option?.placements.filter(p => p.floorId === floor.id).map(p => {
        const eq = catalog.get(p.eqId); if (!eq) return null;
        const [x, z] = pos(p.id, p.x, p.z); const { body } = eqRects(eq, x, z, p.rot);
        const g = groupOf(eq), bad = issues?.get(p.id) === 'error';
        return <g key={p.id} onPointerDown={down(p.id, p.x, p.z, p.locked)} style={{ cursor: interactive ? (p.locked ? 'pointer' : 'grab') : undefined }}>
          <rect x={body.x0} y={body.z0} width={body.x1 - body.x0} height={body.z1 - body.z0} rx={.06} fill={bad ? '#fecaca' : g ? GROUP_COLOR[g] : '#64748b'} opacity={bad ? 1 : .88} stroke={selected === p.id ? '#f26b1d' : bad ? '#b42318' : 'none'} strokeWidth={lw * 4} />
          {p.locked && <text x={body.x1 - .12} y={body.z0 + .2} fontSize={.24} fill="#fff">🔒</text>}
          {p.station && <text x={x} y={z} fontSize={.32} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontWeight={800}>{p.station}</text>}
        </g>;
      })}
      {flows?.filter(f => f.floorId === floor.id).map((f, i) => <polyline key={i} points={f.pts.map(p => p.join(',')).join(' ')} fill="none" stroke={f.kind === 'member' ? '#16a34a' : '#2563eb'} strokeWidth={lw * 3} strokeDasharray=".3 .18" markerEnd="" />)}
      {people?.filter(p => p.floorId === floor.id).map(p => <circle key={p.id} cx={p.x} cy={p.z} r={.22} fill={p.color} stroke={p.selected ? '#f26b1d' : '#fff'} strokeWidth={lw * 3} />)}
      {option?.furniture.filter(f => f.floorId === floor.id && f.kind === 'mirror').map(f => { const [w, d] = footOf(f.w, f.d, f.rot); return <rect key={f.id} {...rect(f.x, f.z, Math.max(w, .08), Math.max(d, .08))} fill="#93c5fd" />; })}
    </svg>
  );
}
