'use client';
/**
 * Phòng lab thiết kế phòng tập (/bao-gia-setup-phong-gym/):
 *   Nhập nhu cầu (4 nhóm) → nhận 3 phương án → xem / so sánh → chỉnh (mặt bằng nhiều tầng, máy, lễ tân, phong cách)
 *   → xem chi phí từng tầng → lưu / chia sẻ mã → gửi đúng phương án cho DANAVA.
 * Trạng thái: một Project (lib/gym-project.ts), mọi thay đổi qua lib/gym-edit.ts, có hoàn tác / làm lại.
 * Hình học luôn kiểm tra lại bằng lib/gym-geometry.ts sau mỗi thao tác. Không có WebGL → mặt bằng 2D (SVG).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Box, Building2, ChevronDown, Columns3, Copy, Eye, Lock, MoreHorizontal, RotateCcw, Save, Users, Map as MapIcon, MessageCircle, Move3d, Palette, Redo2, RotateCw, Ruler, Send, Share2, Shuffle, SlidersHorizontal, Sparkles, Trash2, TriangleAlert, Undo2, Unlock, View, X } from 'lucide-react';
import type { Equipment, Flooring } from '@/lib/equipment';
import { formatVND } from '@/lib/equipment';
import { FIXTURE_KINDS, LINK_KINDS, STRATEGIES, activeOption, fmtArea, layoutHash, normalizeProject, optionCode, type FurnKind, type Project, type Strategy } from '@/lib/gym-project';
import { FURNITURE, buildReception } from '@/lib/gym-decor';
import { generateOption, generateOptions, groupOf, selectEquipment } from '@/lib/gym-layout';
import { validateOption } from '@/lib/gym-geometry';
import { costOf, shortVND } from '@/lib/gym-cost';
import * as E from '@/lib/gym-edit';
import { createStudio, type PersonView, type Studio, type ViewMode } from './studio-engine';
import { Plan2D } from './Plan2D';
import { BriefPanel, CostTable, EquipmentPanel, FloorsPanel, Num, ReceptionPanel, STRATEGY_LIST, Seg, StartWizard, StylePanel } from './StudioPanels';

const KEY = 'danava-gym-studio-v2';
const TOKENS = 'danava-gym-tokens';
type Tab = 'plan' | 'eqrec' | 'style' | 'assistant' | 'sim';
const VIEWS: [ViewMode, string, ReactNode][] = [
  ['plan', 'Mặt bằng 2D', <MapIcon key="p" aria-hidden="true" />], ['orbit', '3D', <Box key="o" aria-hidden="true" />], ['entrance', 'Từ cửa vào', <Eye key="e" aria-hidden="true" />],
  ['eye', 'Ngang tầm người', <View key="v" aria-hidden="true" />], ['stack', 'Cả công trình', <Building2 key="s" aria-hidden="true" />], ['exploded', 'Tách tầng', <Columns3 key="x" aria-hidden="true" />]
];

export type StudioExtras = {
  /** bảng trợ lý ANNA (giai đoạn 3) */
  assistant?: (ctx: { project: Project; commit: (p: Project, label: string) => void; floorId: string }) => ReactNode;
  /** trợ lý nằm trong chatbot ANNA của website: render luôn (portal), icon ANNA trong Tùy chỉnh gọi openAssistant */
  assistantPortal?: (ctx: { project: Project; commit: (p: Project, label: string) => void; floorId: string }) => ReactNode;
  openAssistant?: () => void;
  /** bảng mô phỏng vận hành (giai đoạn 4) */
  sim?: (ctx: { project: Project; catalog: Map<string, Equipment>; floorId: string; setFloorId: (id: string) => void; saveSim: (patch: Pick<Project, 'scenario' | 'simRun'>) => void; setPeople: (p: PersonView[]) => void; setHeat: (h: NonNullable<Parameters<Studio['update']>[0]['heat']> | null) => void; onPick: (fn: (id: string) => void) => void }) => ReactNode;
};

export function GymStudio({ equipment, flooring, addId, code, extras }: { equipment: Equipment[]; flooring: Flooring | null; addId?: string; code?: string; extras?: StudioExtras }) {
  const catalog = useMemo(() => new Map(equipment.map(e => [e.id, e])), [equipment]);
  const known = useMemo(() => new Set(equipment.map(e => e.id)), [equipment]);
  const [project, setProject] = useState<Project | null>(null);
  const hist = useRef<{ past: Project[]; future: Project[] }>({ past: [], future: [] });
  const [, force] = useState(0);
  const [floorId, setFloorId] = useState('');
  const [mode, setMode] = useState<ViewMode>('orbit');
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('plan');
  // Giao diện tinh gọn: chỉnh sửa gom vào "Tùy chỉnh"; mỗi lần mở một mục
  const [custom, setCustom] = useState(false);
  const [planSub, setPlanSub] = useState<'floors' | 'brief'>('floors');
  const [eqSub, setEqSub] = useState<'eq' | 'reception'>('eq');
  const [moreViews, setMoreViews] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [moreMenu, setMoreMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => { fetch('/api/admin/session/').then(r => r.json()).then(v => setIsAdmin(!!v?.authenticated)).catch(() => {}); }, []);
  const [compare, setCompare] = useState(false);
  const [notice, setNotice] = useState('');
  const [gl, setGl] = useState<'loading' | 'ok' | 'fail'>('loading');
  const [loaded, setLoaded] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [people, setPeople] = useState<PersonView[]>([]);
  const [heat, setHeat] = useState<Parameters<Studio['update']>[0]['heat']>(null);
  const pickRef = useRef<(id: string) => void>(() => {});
  const host = useRef<HTMLDivElement>(null);
  const studio = useRef<Studio | null>(null);

  /* ---------- Trạng thái + hoàn tác ---------- */
  const commit = useCallback((next: Project, label = '') => {
    setProject(prev => {
      if (prev && prev !== next) { hist.current.past.push(prev); if (hist.current.past.length > 60) hist.current.past.shift(); hist.current.future = []; }
      return next;
    });
    if (label) setNotice(label);
  }, []);
  const set = useCallback((fn: (p: Project) => Project, label = '') => { setProject(prev => { if (!prev) return prev; const next = fn(prev); if (next !== prev) { hist.current.past.push(prev); hist.current.future = []; } return next; }); if (label) setNotice(label); }, []);
  const undo = useCallback(() => { setProject(cur => { const prev = hist.current.past.pop(); if (!prev || !cur) return cur; hist.current.future.push(cur); return prev; }); force(x => x + 1); setNotice('Đã hoàn tác'); }, []);
  /** Nút reset: xoá phương án trên máy, quay về bước bắt đầu (bản đã lưu bằng đường dẫn vẫn còn) */
  const resetAll = useCallback(() => {
    if (!confirm('Bắt đầu lại từ đầu? Phương án hiện tại trên máy sẽ bị xoá (bản đã lưu bằng đường dẫn vẫn còn).')) return;
    setProject(null); setCustom(false); setMoreMenu(false); hist.current = { past: [], future: [] };
    try { localStorage.removeItem(KEY); } catch {}
    setNotice('Đã bắt đầu lại');
  }, []);
  const redo = useCallback(() => { setProject(cur => { const nx = hist.current.future.pop(); if (!nx || !cur) return cur; hist.current.past.push(cur); return nx; }); force(x => x + 1); setNotice('Đã làm lại'); }, []);

  // Tải: mã chia sẻ (?ma=) → localStorage → (phiên bản cũ) phòng lab 1 tầng
  useEffect(() => {
    let off = false;
    (async () => {
      if (code) {
        try {
          const r = await fetch(`/api/gym-designs/${encodeURIComponent(code)}/`);
          if (r.ok) { const v = await r.json(); const p = normalizeProject(v.project, known); if (typeof p !== 'string' && !off) { setProject(p); setNotice(`Đã mở phương án ${p.code} (phiên bản ${p.version})`); setLoaded(true); return; } }
          else setNotice('Không tìm thấy mã phương án này — đang mở bản trên máy của bạn.');
        } catch { setNotice('Không tải được phương án đã chia sẻ (mất kết nối).'); }
      }
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) { const p = normalizeProject(JSON.parse(raw), known); if (typeof p !== 'string' && !off) setProject(p); }
      } catch {}
      if (!off) setLoaded(true);
    })();
    return () => { off = true; };
  }, [code, known]);
  useEffect(() => { if (project) { try { localStorage.setItem(KEY, JSON.stringify(project)); } catch {} } }, [project]);
  useEffect(() => { if (project && !project.floors.some(f => f.id === floorId)) setFloorId([...project.floors].sort((a, b) => a.level - b.level)[0].id); }, [project, floorId]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4200); return () => clearTimeout(t); }, [notice]);

  // Phím tắt hoàn tác / làm lại
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea,select')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { set(p => E.removeItem(p, sel)); setSel(null); }
      else if (e.key.toLowerCase() === 'r' && sel) set(p => E.rotateItem(p, sel));
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [undo, redo, sel, set]);

  /* ---------- Bộ dựng 3D ---------- */
  const onMove = useRef<(id: string, x: number, z: number) => void>(() => {});
  const customRef = useRef(false); customRef.current = custom;
  // Chưa mở "Tùy chỉnh" thì không cho kéo lệch thiết bị (tránh khách vô tình làm sai phương án)
  onMove.current = (id, x, z) => set(p => E.moveItem(p, id, x, z));
  useEffect(() => {
    if (!project || studio.current || gl === 'fail' || !host.current) return;
    let off = false;
    const detail = (() => { try { const v = localStorage.getItem('danava-gym-detail'); if (v) return v === '1'; } catch {} const n = navigator as Navigator & { deviceMemory?: number }; return !((n.deviceMemory && n.deviceMemory <= 4) || (n.hardwareConcurrency && n.hardwareConcurrency <= 4)); })();
    createStudio(host.current, { select: id => setSel(id), move: (id, x, z) => onMove.current(id, x, z), pickPerson: id => pickRef.current(id) }, { detail })
      .then(s => { if (off) { s.dispose(); return; } studio.current = s; setGl('ok'); })
      .catch(() => { if (!off) { setGl('fail'); setMode('plan'); } });
    return () => { off = true; };
  }, [project, gl]);
  useEffect(() => () => { studio.current?.dispose(); studio.current = null; }, []);

  const option = project ? activeOption(project) ?? null : null;
  const validation = useMemo(() => (project && option ? validateOption(project, option, catalog) : null), [project, option, catalog]);
  const issues = useMemo(() => validation?.level ?? new Map<string, 'error' | 'warn'>(), [validation]);
  const flows = useMemo(() => {
    if (!project?.reception.enabled) return [];
    const f = project.floors.find(x => x.id === project.reception.floorId);
    const door = f?.fixtures.find(x => x.kind === 'door' && x.main) ?? f?.fixtures.find(x => x.kind === 'door');
    // Luồng đi khách hàng không còn vẽ trong 3D (giao diện tinh gọn); logic tách luồng vẫn dùng khi xếp quầy
    void buildReception; void f; void door;
    return [] as { floorId: string; kind: 'member' | 'guest'; pts: [number, number][] }[];
  }, [project, tab, custom, eqSub]);
  useEffect(() => {
    if (!project || !studio.current || !floorId) return;
    studio.current.update({ project, option, catalog, floorId, mode, selected: sel, issues, flows, showClear: showClear || (mode === 'plan' && custom), heat });
  }, [project, option, catalog, floorId, mode, sel, issues, flows, showClear, heat, gl, custom]);
  useEffect(() => { studio.current?.setPeople(people); }, [people]);
  // Mô phỏng đẩy nhân vật thẳng vào bộ dựng 3D mỗi khung hình (không qua React); 2D dự phòng thì qua state
  const saveSim = useCallback((patch: Pick<Project, 'scenario' | 'simRun'>) => setProject(p => (p ? { ...p, ...patch } : p)), []);
  const pushPeople = useCallback((list: PersonView[]) => { if (studio.current) studio.current.setPeople(list); else setPeople(list); }, []);

  // Thêm máy từ trang thiết bị (?add=)
  const added = useRef(false);
  useEffect(() => {
    if (!project || !floorId || !addId || added.current || !project.options.length) return;
    const eq = catalog.get(addId);
    added.current = true;
    if (eq) { const r = E.addEquipment(project, floorId, eq, catalog); commit(r.project, `Đã thêm ${eq.name}`); setSel(r.id); setCustom(true); setTab('eqrec'); }
  }, [project, floorId, addId, catalog, commit]);

  /* ---------- Tạo phương án ---------- */
  function regenerate(base: Project, label = 'Đã tạo 3 phương án mới (giữ phần đã khoá)') {
    const { options, selection } = generateOptions(base, equipment, { keep: activeOption(base), flooring });
    const next: Project = { ...base, options, active: 0, version: base.version + 1, updatedAt: Date.now() };
    commit(next, label);
    if (selection.notes.length) setTimeout(() => setNotice(selection.notes[0]), 1800);
  }
  function changeStrategy(i: number, s: Strategy) {
    if (!project) return;
    const keep = project.options[i];
    const sel2 = selectEquipment(project, equipment, keep.placements.filter(x => x.locked), flooring);
    const o = generateOption(project, equipment, s, sel2, keep.letter, keep);
    o.version = keep.version + 1;
    commit({ ...project, options: project.options.map((x, j) => (j === i ? o : x)), active: i, version: project.version + 1 }, `Phương án ${keep.letter}: đổi sang ${STRATEGIES[s].label}`);
  }

  /* ---------- Lưu / chia sẻ / gửi ---------- */
  const [share, setShare] = useState<{ busy: boolean; url: string; error: string; hidden?: boolean }>({ busy: false, url: '', error: '' });
  async function save(preview = true): Promise<Project | null> {
    if (!project) return null;
    setShare(s => ({ ...s, busy: true, error: '' }));
    try {
      const tokens = (() => { try { return JSON.parse(localStorage.getItem(TOKENS) || '{}') as Record<string, string>; } catch { return {}; } })();
      const img = preview && studio.current ? studio.current.snapshot(1200) : '';
      const body = JSON.stringify({ project, preview: img.length < 900_000 ? img : '' });
      const own = project.code && tokens[project.code];
      const r = await fetch(own ? `/api/gym-designs/${project.code}/` : '/api/gym-designs/', { method: own ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...(own ? { 'x-design-token': own } : {}) }, body });
      const v = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(v.error || 'Chưa lưu được phương án.');
      if (v.token) { tokens[v.code] = v.token; try { localStorage.setItem(TOKENS, JSON.stringify(tokens)); } catch {} }
      const next = { ...project, code: v.code, version: v.version };
      setProject(next);
      const url = `${location.origin}/bao-gia-setup-phong-gym/?ma=${v.code}`;
      setShare({ busy: false, url, error: '' });
      return next;
    } catch (x) { setShare({ busy: false, url: '', error: x instanceof Error ? x.message : 'Chưa lưu được.' }); return null; }
  }
  const [form, setForm] = useState({ open: false, name: '', phone: '', note: '', studio: false, marketing: false, sending: false, done: '', error: '' });
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!project || !option) return;
    setForm(f => ({ ...f, sending: true, error: '' }));
    const saved = await save(true);
    const p = saved ?? project;
    const cost = costOf(p, option, catalog, flooring);
    const link = saved ? `${location.origin}/bao-gia-setup-phong-gym/?ma=${saved.code}` : '(chưa lưu được lên hệ thống — xem danh sách bên dưới)';
    const lines = [
      `Phương án ${optionCode(p, option)} · ${STRATEGIES[option.strategy].label} · phiên bản ${option.version} · mã bố trí ${layoutHash(p, option)}`,
      `Mở lại đúng phương án: ${link}`,
      saved ? `Ảnh tổng thể: ${location.origin}/api/gym-designs/${saved.code}/preview/` : '',
      `Mô hình: ${p.brief.model} · ${p.floors.length} tầng · ngân sách ${p.brief.budget ? formatVND(p.brief.budget) : 'chưa đặt'}`,
      ...p.floors.map(f => {
        const fc = cost.floors.find(x => x.floorId === f.id)!;
        return `${f.name} ${f.w}×${f.l} m, trần ${f.h} m: ${fc.lines.map(l => `${l.eq.name}${l.eq.sku ? ` [${l.eq.sku}]` : ''} ×${l.qty}`).join('; ') || 'chưa có máy'}`;
      }),
      `Thiết bị + sàn đã có giá: ${formatVND(cost.priced)}${cost.unpricedCount ? ` (+${cost.unpricedCount} máy chưa có giá)` : ''}; nội thất (giả định) ${shortVND(cost.furnEst[0])}–${shortVND(cost.furnEst[1])}.`,
      `Lễ tân: ${p.reception.enabled ? `${p.reception.shape}, ${p.reception.size}` : 'không'} · phong cách ${p.brief.interior}.`,
      p.simRun ? `Mô phỏng phương án ${p.simRun.option} (${p.simRun.source === 'calibrated' ? 'đã hiệu chỉnh' : 'giả định mẫu'}${p.simRun.layout !== layoutHash(p, option) ? ', CŨ — mặt bằng đã đổi sau lần chạy' : ''}): ${p.simRun.visitors} lượt/ngày, đông nhất ${p.simRun.peak} người, chờ máy TB ${p.simRun.waitMachineSec} giây, bỏ bài ${p.simRun.abandons}.` : '',
      validation?.verify.length ? `Cần xác minh: ${validation.verify.length} mục (tải trọng, điện, kích thước…).` : '',
      `Dịch vụ thêm: ${[form.studio && 'DANAVA Studio', form.marketing && 'Marketing'].filter(Boolean).join(', ') || 'không'}`,
      form.note.trim() ? `Ghi chú: ${form.note.trim()}` : ''
    ].filter(Boolean).join('\n');
    try {
      const r = await fetch('/api/lead/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone, businessType: 'Phòng tập', service: 'Setup phòng tập', message: lines.slice(0, 5000), source: saved ? `${location.origin}/bao-gia-setup-phong-gym/?ma=${saved.code}` : location.href }) });
      const v = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(v.error || 'Chưa gửi được, vui lòng thử lại.');
      setForm(f => ({ ...f, sending: false, done: `Đã gửi phương án ${optionCode(p, option)} cho DANAVA. Chuyên viên sẽ mở đúng bản này và liên hệ bạn sớm.` }));
    } catch (x) { setForm(f => ({ ...f, sending: false, error: x instanceof Error ? x.message : 'Chưa gửi được.' })); }
  }

  /* ---------- Chưa có dự án: 4 câu hỏi ---------- */
  if (!loaded) return <div className="gs gs--loading"><p>Đang mở phòng lab…</p></div>;
  if (!project) return (
    <div className="gs gs--start">
      <StartWizard onCreate={p => { regenerate(p, 'Đã tạo 3 phương án — chọn A, B hoặc C để xem'); setFloorId(p.floors[0].id); }} />
    </div>
  );

  const floor = project.floors.find(f => f.id === floorId) ?? project.floors[0];
  const cost = costOf(project, option ?? undefined, catalog, flooring);
  const errors = validation?.issues.filter(i => i.level === 'error') ?? [];
  const selPl = option?.placements.find(x => x.id === sel), selFu = option?.furniture.find(x => x.id === sel);
  const selFx = project.floors.flatMap(f => f.fixtures).find(x => x.id === sel), selLn = project.links.find(x => x.id === sel);
  const selEq = selPl ? catalog.get(selPl.eqId) : undefined;
  const selIssues = validation?.issues.filter(i => i.id === sel) ?? [];
  const sorted = [...project.floors].sort((a, b) => a.level - b.level);
  const goIssue = (id: string, fid: string) => { setFloorId(fid); setSel(id); };

  const totalArea = project.floors.reduce((s, f) => s + f.w * f.l, 0);
  const nextOption = () => { if (project.options.length < 2) return; const i = (project.active + 1) % project.options.length; commit({ ...project, active: i }); setSel(null); setNotice(`Phương án ${project.options[i].letter}: ${STRATEGIES[project.options[i].strategy].label}`); };
  const openSend = () => setForm(f => ({ ...f, open: true }));
  const points = option ? keyPoints(project, option, catalog) : [];
  // Sản phẩm trong phương án: gom theo máy, máy có giá trước
  const products = option ? [...option.placements.reduce((m, pl) => { const eq = catalog.get(pl.eqId); if (!eq) return m; const x = m.get(eq.id) ?? { eq, qty: 0, first: pl }; x.qty++; m.set(eq.id, x); return m; }, new Map<string, { eq: Equipment; qty: number; first: (typeof option.placements)[number] }>()).values()].sort((a, b) => (b.eq.price ? 1 : 0) - (a.eq.price ? 1 : 0)) : [];
  const notes = option ? attention(project, option, catalog, cost, validation) : [];
  const fixFirst = () => { const i = errors[0]; if (!i) return; setCustom(true); setFloorId(i.floorId); setSel(i.id); };
  const SIDE_TABS: [Tab, string, ReactNode][] = [['plan', 'Mặt bằng', <Ruler key="f" />], ['eqrec', 'Lễ tân', <Users key="e" />], ['style', 'Màu sắc', <Palette key="s" />],
    ...(extras?.assistant || extras?.openAssistant ? [['assistant', 'ANNA', <MessageCircle key="a" />] as [Tab, string, ReactNode]] : []), ...(extras?.sim && isAdmin ? [['sim', 'Vận hành', <Move3d key="m" />] as [Tab, string, ReactNode]] : [])];

  return (
    <div className={`gs${custom ? ' is-custom' : ''}`}>
      {extras?.assistantPortal?.({ project, commit, floorId: floor.id })}
      {compare && <Compare project={project} catalog={catalog} flooring={flooring} onPick={i => { commit({ ...project, active: i }); setCompare(false); }} onStrategy={changeStrategy} onClose={() => setCompare(false)} />}

      <div className="gs-main">
        {/* ----- Sân khấu 3D / 2D ----- */}
        <div className="gs-stagewrap">
          <div className="gs-stage">
            <div className="gs-stage__wait" aria-hidden="true"><i /><span>Đang dựng mô hình 3D…</span></div>
            {gl !== 'fail' && <div ref={host} className="gs-canvas" />}
            <div className="gs-float gs-float--tl">
              <div className="gs-chiprow">
                <button type="button" className={`gs-chipbtn${custom ? ' is-on' : ''}`} onClick={() => setCustom(c => !c)} aria-expanded={custom}><SlidersHorizontal aria-hidden="true" /> {custom ? 'Danh mục máy' : 'Tùy chỉnh'}</button>
              </div>
              {sorted.length > 1 && <div className="gs-floortabs" role="radiogroup" aria-label="Tầng đang xem">
                {sorted.map(f => <button key={f.id} type="button" role="radio" aria-checked={f.id === floor.id} className={f.id === floor.id ? 'is-on' : ''} onClick={() => { setFloorId(f.id); setSel(null); }}>{f.name}</button>)}
              </div>}
            </div>
            <div className="gs-float gs-float--tr">
              <div className="gs-views" role="radiogroup" aria-label="Góc xem">
                {gl !== 'fail' && <button type="button" role="radio" aria-checked={mode === 'orbit'} className={mode === 'orbit' ? 'is-on' : ''} onClick={() => { setMode('orbit'); setMoreViews(false); setTimeout(() => studio.current?.resetView(), 0); }}><span>3D</span></button>}
                <button type="button" role="radio" aria-checked={mode === 'plan'} className={mode === 'plan' ? 'is-on' : ''} onClick={() => { setMode('plan'); setMoreViews(false); setTimeout(() => studio.current?.resetView(), 0); }}><span>2D</span></button>
                {gl !== 'fail' && <button type="button" className={`gs-more${!['orbit', 'plan'].includes(mode) || moreViews ? ' is-on' : ''}`} aria-expanded={moreViews} aria-label="Góc nhìn khác" title="Góc nhìn khác" onClick={() => setMoreViews(v => !v)}><Eye aria-hidden="true" /><ChevronDown aria-hidden="true" className="gs-caret" /></button>}
              </div>
              {moreViews && gl !== 'fail' && (
                <div className="gs-dropdown" role="menu">
                  {VIEWS.filter(([k]) => k !== 'orbit' && k !== 'plan').filter(([k]) => project.floors.length > 1 || (k !== 'stack' && k !== 'exploded')).map(([k, l, ic]) => <button key={k} type="button" role="menuitemradio" aria-checked={mode === k} className={mode === k ? 'is-on' : ''} onClick={() => { setMode(k); setMoreViews(false); setTimeout(() => studio.current?.resetView(), 0); }}>{ic}{l}</button>)}
                  <label className="gs-toggle"><input type="checkbox" checked={showClear} onChange={e => setShowClear(e.target.checked)} /><span>Khoảng trống quanh máy</span></label>
                </div>
              )}
            </div>
            {option && !sel && (
              <div className="gs-dock">
                <button type="button" className="gs-dock__cost" onClick={() => setDetailOpen(true)} title="Xem chi phí chi tiết"><small>{option.placements.length} máy · chi phí dự kiến</small><b>{shortVND(cost.range[0])} – {shortVND(cost.range[1])}</b></button>
                <button type="button" className="s-btn s-btn--primary gs-cta" onClick={openSend}><Send aria-hidden="true" /> Nhận tư vấn</button>
              </div>
            )}
            {errors.length > 0 && !sel && <button type="button" className="gs-float gs-float--bl gs-warnchip" onClick={fixFirst}><TriangleAlert aria-hidden="true" /> {errors.length} chỗ cần chỉnh</button>}
            {gl === 'loading' && <p className="gp-loading">Đang dựng phòng 3D…</p>}
            {gl === 'fail' && (
              <div className="gs-fallback">
                <p className="gs-note"><TriangleAlert aria-hidden="true" /> Thiết bị này không hiển thị được 3D — đang xem mặt bằng 2D. Mọi chức năng vẫn dùng được.</p>
                <Plan2D project={project} option={option} floor={floor} catalog={catalog} selected={sel} issues={issues} onSelect={setSel} onMove={(id, x, z) => onMove.current(id, x, z)} people={people} showClear={custom} flows={flows} className="gs-plan" />
              </div>
            )}
            {sel && (selPl || selFu || selFx || selLn) && (
              <div className={`gs-toolbar${selIssues.some(i => i.level === 'error') ? ' is-bad' : ''}`} role="toolbar" aria-label="Vật đang chọn">
                <b>{selEq?.name ?? (selFu ? (selFu.label === 'logo' ? 'Vách nhận diện' : selFu.label || FURNITURE[selFu.kind].label) : selFx ? (selFx.label || FIXTURE_KINDS[selFx.kind].label) : selLn ? LINK_KINDS[selLn.kind].label : '')}
                  {selEq && <small>{selEq.price ? formatVND(Number(selEq.price)) : 'Chưa có giá'} · {selEq.width}×{selEq.depth} cm{selEq.dimsEstimated ? ' (ước tính)' : ''}</small>}
                  {selIssues.slice(0, 2).map((i, k) => <small key={k} className="is-err">{i.msg}</small>)}
                </b>
                {(selFx || selLn) && <>
                  <Num label="Rộng" unit="m" value={(selFx ?? selLn)!.w} min={.1} max={40} onChange={v => set(p => selFx ? E.updateFixture(p, selFx.id, { w: v }) : E.updateLink(p, selLn!.id, { w: v }))} />
                  <Num label="Sâu" unit="m" value={(selFx ?? selLn)!.d} min={.05} max={40} onChange={v => set(p => selFx ? E.updateFixture(p, selFx.id, { d: v }) : E.updateLink(p, selLn!.id, { d: v }))} />
                </>}
                {selFx?.kind === 'door' && <label className="gs-toggle"><input type="checkbox" checked={!!selFx.main} onChange={e => set(p => E.updateFixture(p, selFx.id, { main: e.target.checked }))} /><span>Cửa chính</span></label>}
                <button type="button" onClick={() => set(p => E.rotateItem(p, sel))} disabled={!!(selPl?.locked || selFu?.locked)}><RotateCw aria-hidden="true" /> Xoay</button>
                {(selPl || selFu) && <button type="button" onClick={() => set(p => E.duplicateItem(p, sel, catalog))}><Copy aria-hidden="true" /> Nhân bản</button>}
                {(selPl || selFu) && <button type="button" onClick={() => set(p => E.toggleLock(p, sel), (selPl ?? selFu)!.locked ? 'Đã mở khoá' : 'Đã khoá — tạo lại phương án sẽ giữ nguyên vị trí này')}>{(selPl ?? selFu)!.locked ? <><Unlock aria-hidden="true" /> Mở khoá</> : <><Lock aria-hidden="true" /> Khoá</>}</button>}
                {selPl && project.floors.length > 1 && <label className="gs-movefloor"><span>Chuyển tầng</span><select value={selPl.floorId} disabled={!!selPl.locked} onChange={e => { const r = E.moveToFloor(project, selPl.id, e.target.value, catalog); commit(r.project, r.placed ? 'Đã chuyển máy sang tầng khác' : 'Tầng đích hết chỗ — máy đặt giữa sàn (tô đỏ)'); setFloorId(e.target.value); }}>{sorted.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>}
                <button type="button" className="is-danger" disabled={!!(selPl?.locked || selFu?.locked)} onClick={() => { set(p => E.removeItem(p, sel)); setSel(null); }}><Trash2 aria-hidden="true" /> Xoá</button>
              </div>
            )}
            {notice && <p className="gs-notice" role="status">{notice}</p>}

          </div>
        </div>

        {/* ----- Cột trái: danh mục máy tập (mặc định) ----- */}
        {!custom && (
          <aside className="gs-side gs-cat" aria-label="Danh mục máy tập">
            <EquipmentPanel simple equipment={equipment} p={project} floor={floor} onMust={id => set(p => ({ ...p, brief: { ...p.brief, mustHave: p.brief.mustHave.includes(id) ? p.brief.mustHave.filter(x => x !== id) : [...p.brief.mustHave, id] } }))}
              onAdd={eq => { if (!option) return; const r = E.addEquipment(project, floor.id, eq, catalog); commit(r.project, r.placed ? `Đã thêm ${eq.name}` : `Hết chỗ cho ${eq.name} — đã đặt giữa sàn (tô đỏ), hãy dời máy khác`); setSel(r.id); }} />
          </aside>
        )}
        {/* ----- Tùy chỉnh: thay chỗ danh mục khi khách bấm, mỗi lần một mục ----- */}
        {custom && (
          <aside className="gs-side" aria-label="Tùy chỉnh phương án">
            <div className="gs-side__head">
              <b>Tùy chỉnh</b>
              <span className="gs-side__tools">
                <button type="button" className="gs-icon" onClick={undo} disabled={!hist.current.past.length} title="Hoàn tác (Ctrl+Z)" aria-label="Hoàn tác"><Undo2 /></button>
                <button type="button" className="gs-icon" onClick={redo} disabled={!hist.current.future.length} title="Làm lại (Ctrl+Y)" aria-label="Làm lại"><Redo2 /></button>
                <button type="button" className="gs-icon gs-icon--reset" onClick={resetAll} title="Bắt đầu lại từ đầu" aria-label="Bắt đầu lại từ đầu"><RotateCcw /></button>
                <span className="gs-menuwrap">
                  <button type="button" className={`gs-icon${moreMenu ? ' is-on' : ''}`} aria-label="Thêm" title="Thêm" aria-expanded={moreMenu} onClick={() => setMoreMenu(v => !v)}><MoreHorizontal /></button>
                  {moreMenu && (
                    <span className="gs-dropdown gs-dropdown--right" role="menu" onClick={() => setMoreMenu(false)}>
                      {project.options.length > 1 && <button type="button" role="menuitem" onClick={nextOption}><Shuffle aria-hidden="true" /> Phương án khác</button>}
                      {project.options.length > 1 && <button type="button" role="menuitem" onClick={() => setCompare(c => !c)}><Columns3 aria-hidden="true" /> So sánh {project.options.length} phương án</button>}
                      <button type="button" role="menuitem" onClick={() => void save()} disabled={share.busy}><Save aria-hidden="true" /> {share.busy ? 'Đang lưu…' : 'Lưu & lấy đường dẫn'}</button>
                    </span>
                  )}
                </span>
                <button type="button" className="gs-icon" onClick={() => setCustom(false)} aria-label="Về danh mục máy" title="Về danh mục máy"><X /></button>
              </span>
            </div>
            <div className="gs-menu" role="tablist">
              {SIDE_TABS.map(([k, l, ic]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => (k === 'assistant' && extras?.openAssistant ? extras.openAssistant() : setTab(k))} title={({ plan: 'Mặt bằng: tầng, cửa, cầu thang, nhu cầu', eqrec: 'Lễ tân & đón tiếp', style: 'Màu sắc, trang trí', assistant: 'Nhờ ANNA chỉnh giúp', sim: 'Xem phòng hoạt động' } as Record<Tab, string>)[k]}>{ic}<span>{l}</span></button>)}
            </div>
            {tab === 'plan' && <>
              <Seg label="Mặt bằng" value={planSub} options={[['floors', 'Tầng, cửa, cầu thang'], ['brief', 'Nhu cầu & ngân sách']]} onChange={setPlanSub} />
              {planSub === 'floors' ? <FloorsPanel p={project} floor={floor} setFloorId={setFloorId} selectItem={setSel} act={{
                updateFloor: (id, patch) => set(p => E.updateFloor(p, id, patch)),
                addFloor: () => set(p => E.addFloor(p), 'Đã thêm tầng — bấm "Tạo lại phương án" trong mục Nhu cầu để xếp máy'),
                duplicateFloor: id => set(p => E.duplicateFloor(p, id), 'Đã sao chép tầng'),
                removeFloor: id => set(p => E.removeFloor(p, id), 'Đã xoá tầng'),
                addFixture: kind => { const r = E.addFixture(project, floor.id, kind); commit(r.project, `Đã thêm ${FIXTURE_KINDS[kind].label.toLowerCase()} — kéo để đặt đúng chỗ`); setSel(r.id); },
                addLink: (kind, fl) => { const r = E.addLink(project, kind, fl); commit(r.project, `Đã thêm ${LINK_KINDS[kind].label.toLowerCase()}`); setSel(r.id); },
                lockFloor: locked => set(p => E.lockFloor(p, floor.id, locked), locked ? 'Đã khoá toàn bộ tầng' : 'Đã mở khoá tầng'),
                regenerate: () => regenerate(project, 'Đã xếp lại máy theo công năng / ngân sách mới (giữ phần đã khoá)')
              }} /> : <BriefPanel p={project} set={fn => set(fn)} equipment={equipment} onRegenerate={() => regenerate(project)} />}
            </>}
            {tab === 'eqrec' && <>
              <ReceptionPanel p={project} set={patch => set(p => E.setReception(p, patch))} />
            </>}
            {tab === 'style' && <StylePanel p={project} floor={floor} set={fn => set(fn)} addDecor={(k: FurnKind) => { const F = FURNITURE[k]; set(p => E.addFurniture(p, floor.id, { kind: k, x: 0, z: 0, rot: 0, w: F.w, d: F.d, group: 'decor' }), `Đã thêm ${F.label.toLowerCase()} — kéo để đặt`); }} />}
            {tab === 'assistant' && extras?.assistant?.({ project, commit, floorId: floor.id })}
            {tab === 'sim' && extras?.sim?.({ project, catalog, floorId: floor.id, setFloorId, saveSim, setPeople: pushPeople, setHeat, onPick: fn => { pickRef.current = fn; } })}
          </aside>
        )}
      </div>
      {(share.url || share.error) && !share.hidden && (
        <p className={`gs-share${share.error ? ' is-error' : ''}`} role="status">
          {share.error || <><Share2 aria-hidden="true" /> Đã lưu. Mở lại phương án bằng đường dẫn: <a href={share.url}>{share.url}</a> <button type="button" onClick={() => { void navigator.clipboard?.writeText(share.url); setNotice('Đã chép đường dẫn'); }}><Copy aria-hidden="true" /> Chép</button></>}
          <button type="button" className="gs-share__x" aria-label="Đóng" title="Đóng" onClick={() => setShare(s => ({ ...s, error: '', hidden: true }))}><X aria-hidden="true" /></button>
        </p>
      )}

      {/* ----- Phân tích & chi phí chi tiết: ẩn, bấm mới hiện ----- */}
      {option && detailOpen && (
        <div className="gs-modal" role="dialog" aria-modal="true" aria-label="Chi phí và phân tích" onClick={e => { if (e.target === e.currentTarget) setDetailOpen(false); }}>
        <div className="gs-modal__box gs-modal__box--wide">
          <button type="button" className="gs-icon gs-modal__x" aria-label="Đóng" onClick={() => setDetailOpen(false)}><X /></button>
          <h2>Chi phí dự kiến {shortVND(cost.range[0])} – {shortVND(cost.range[1])}</h2>
          <div className="gs-below">
            <div className="gs-col">
              <ul className="gs-points">{points.map((p, i) => <li key={i}>{p}</li>)}</ul>
              {notes.length > 0 && <ul className="gs-notes">{notes.map((n, i) => <li key={i}>{n.text}{n.fix && <button type="button" className="gs-link" onClick={fixFirst}>Xem chỗ cần chỉnh</button>}</li>)}</ul>}
              {isAdmin && (
                <details className="gs-admin">
                  <summary>Chi tiết kỹ thuật (chỉ quản trị viên thấy)</summary>
                  <p>Mã {optionCode(project, option)} · phiên bản {option.version} · mã bố trí {layoutHash(project, option)}</p>
                  <ul className="gs-reasons">{option.reasons.map((r, i) => <li key={i}>{r}</li>)}{option.changes.map((r, i) => <li key={'c' + i} className="is-change">{r}</li>)}</ul>
                  {option.dropped.length > 0 && <><b>Máy chưa đặt được</b><ul>{option.dropped.map((d, i) => <li key={i}>{catalog.get(d.eqId)?.name ?? d.eqId} — {project.floors.find(f => f.id === d.floorId)?.name}: {d.reason}</li>)}</ul></>}
                  {errors.length > 0 && <><b>Lỗi kiểm tra hình học</b><ul className="gs-issues">{errors.map((i, k) => <li key={k}><button type="button" onClick={() => { setCustom(true); goIssue(i.id, i.floorId); }}>{i.msg}</button></li>)}</ul></>}
                  {!!validation?.verify.length && <><b>Cần xác minh (đầy đủ)</b><ul>{validation.verify.map((v, i) => <li key={i}>{v}</li>)}</ul></>}
                </details>
              )}
            </div>
            <div className="gs-col">
              <ul className="gs-costbrief">
                <li><span>Thiết bị + thảm sàn đã có giá</span><b>{formatVND(cost.priced)}</b></li>
                <li><span>Nội thất, lễ tân, trang trí (tham khảo)</span><b>{shortVND(cost.furnEst[0])} – {shortVND(cost.furnEst[1])}</b></li>
                {cost.unpricedCount > 0 && <li className="is-warn"><span>{cost.unpricedCount} máy chưa có giá</span><b>DANAVA báo sau</b></li>}
                {cost.budget > 0 && <li className={cost.overBudget ? 'is-bad' : 'is-ok'}><span>So với ngân sách {shortVND(cost.budget)}</span><b>{cost.overBudget ? `vượt ${shortVND(cost.priced - cost.budget)}` : `còn ${shortVND(cost.budget - cost.priced)}`}</b></li>}
              </ul>
              <CostTable cost={cost} />
              <p className="gp-note">Giá thiết bị theo bảng giá đối tác thietbigym.vn; nội thất là khoảng tham khảo. Chưa gồm vận chuyển, lắp đặt, thi công, điện.</p>
            </div>
          </div>
        </div>
        </div>
      )}
      {option && form.open && (
        <div className="gs-modal" role="dialog" aria-modal="true" aria-label="Nhận tư vấn phương án" onClick={e => { if (e.target === e.currentTarget) setForm(f => ({ ...f, open: false })); }}>
          <div className="gs-modal__box" id="gs-send">
            <button type="button" className="gs-icon gs-modal__x" aria-label="Đóng" onClick={() => setForm(f => ({ ...f, open: false }))}><X /></button>
            {form.done ? <p className="gp-done" role="status">{form.done}</p> : (
              <form className="gp-form" onSubmit={send}>
                <h2 className="gp-form__wide">Nhận tư vấn phương án này</h2>
                <p className="gp-form__wide gs-formlead">{STRATEGIES[option.strategy].label} · {option.placements.length} máy · {shortVND(cost.range[0])} – {shortVND(cost.range[1])}. DANAVA nhận kèm đúng thiết kế và chi phí bạn đang xem.</p>
                <label>Họ và tên<input required minLength={2} maxLength={150} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" autoFocus /></label>
                <label>Số điện thoại<input required type="tel" maxLength={25} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} autoComplete="tel" /></label>
                <label className="gp-form__wide">Ghi chú (tuỳ chọn)<textarea rows={2} maxLength={1000} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></label>
                <details className="gp-form__wide gs-formmore"><summary>Quan tâm thêm dịch vụ khác?</summary><div className="gs-toggles"><label className="gs-toggle"><input type="checkbox" checked={form.studio} onChange={e => setForm(f => ({ ...f, studio: e.target.checked }))} /><span>Phần mềm DANAVA Studio</span></label><label className="gs-toggle"><input type="checkbox" checked={form.marketing} onChange={e => setForm(f => ({ ...f, marketing: e.target.checked }))} /><span>Marketing khai trương</span></label></div></details>
                {form.error && <p className="gp-error" role="alert">{form.error}</p>}
                <button type="submit" className="s-btn s-btn--primary s-btn--lg gp-form__wide" disabled={form.sending}>{form.sending ? 'Đang gửi…' : 'Gửi yêu cầu tư vấn'}</button>
              </form>
            )}
          </div>
        </div>
      )}
      {option && !form.done && !form.open && <button type="button" className="gs-sticky" onClick={openSend}><Send aria-hidden="true" /> Nhận tư vấn phương án này</button>}
    </div>
  );
}

/** Tối đa 3 ý chính cho khách (ngôn ngữ đơn giản) */
function keyPoints(p: Project, o: NonNullable<ReturnType<typeof activeOption>>, catalog: Map<string, Equipment>) {
  const out: string[] = [STRATEGIES[o.strategy].hint + '.'];
  const g = { cardio: 0, machine: 0, free: 0 };
  for (const pl of o.placements) { const e = catalog.get(pl.eqId); const k = e ? groupOf(e) : null; if (k) g[k]++; }
  const zone = o.furniture.find(f => f.kind === 'turf' || f.kind === 'mat-zone');
  if (p.reception.enabled) out.push('Lễ tân ngay cửa vào: hội viên quét QR rồi đi thẳng vào khu tập, khách mới có góc ngồi chờ và tư vấn riêng.');
  else if (zone) out.push(`Khu tập chức năng khoảng ${Math.round(zone.w * zone.d)} m² ở giữa phòng cho kéo sled, lunge, lớp nhóm nhỏ.`);
  out.push(`${o.placements.length} thiết bị: ${g.cardio} cardio · ${g.machine} máy tạ · ${g.free} khung tạ & tạ tự do${p.floors.length > 1 ? `, chia trên ${p.floors.length} tầng` : ''}.`);
  return out.slice(0, 3);
}
/** Lưu ý ngắn, dễ hiểu (chi tiết kỹ thuật chỉ quản trị viên thấy) */
function attention(p: Project, o: NonNullable<ReturnType<typeof activeOption>>, catalog: Map<string, Equipment>, cost: ReturnType<typeof costOf>, v: ReturnType<typeof validateOption> | null) {
  const out: { text: string; fix?: boolean }[] = [];
  const errs = v?.issues.filter(i => i.level === 'error').length ?? 0;
  if (errs) out.push({ text: `${errs} vị trí thiết bị đang chồng lên nhau hoặc chắn lối đi.`, fix: true });
  if (cost.overBudget) out.push({ text: `Vượt ngân sách khoảng ${shortVND(cost.priced - cost.budget)} — có thể nhờ ANNA giảm chi phí.` });
  if (cost.unpricedCount) out.push({ text: `${cost.unpricedCount} máy chưa có giá niêm yết — DANAVA sẽ báo giá khi tư vấn.` });
  if (o.dropped.length) out.push({ text: `${o.dropped.length} máy chưa đủ chỗ đặt nên chưa đưa vào phương án.` });
  for (const t of v?.verify ?? []) {
    if (/tải trọng/.test(t)) out.push({ text: 'Tầng trên có thiết bị nặng: cần kỹ sư kiểm tra sàn trước khi lắp.' });
    else if (/ổ cắm|220 V/.test(t)) out.push({ text: 'Máy chạy bộ cần ổ điện riêng gần máy.' });
    else if (/ước tính/.test(t)) out.push({ text: 'Một số kích thước máy đang là ước tính, sẽ đo chính xác khi khảo sát.' });
    else if (/đưa máy lên|thang máy/.test(t)) out.push({ text: 'Máy lớn ở tầng trên: cần kiểm tra lối đưa máy lên (cầu thang / thang máy).' });
  }
  return out.filter((x, i, a) => a.findIndex(y => y.text === x.text) === i);
}

/* ---------- So sánh 3 phương án (cùng danh sách máy & ngân sách) ---------- */
function Compare({ project, catalog, flooring, onPick, onStrategy, onClose }: { project: Project; catalog: Map<string, Equipment>; flooring: Flooring | null; onPick: (i: number) => void; onStrategy: (i: number, s: Strategy) => void; onClose: () => void }) {
  const [fid, setFid] = useState(project.floors[0].id);
  const floor = project.floors.find(f => f.id === fid) ?? project.floors[0];
  return (
    <section className="gs-compare" aria-label="So sánh phương án">
      <header><h2>So sánh 3 phương án</h2>
        {project.floors.length > 1 && <div className="gs-floortabs">{[...project.floors].sort((a, b) => a.level - b.level).map(f => <button key={f.id} type="button" role="radio" aria-checked={f.id === fid} className={f.id === fid ? 'is-on' : ''} onClick={() => setFid(f.id)}>{f.name}</button>)}</div>}
        <button type="button" className="gs-btn" onClick={onClose}>Đóng</button>
      </header>
      <div className="gs-compare__grid">
        {project.options.map((o, i) => {
          const c = costOf(project, o, catalog, flooring), v = validateOption(project, o, catalog);
          const turf = o.furniture.filter(x => x.kind === 'turf' || x.kind === 'mat-zone').reduce((s, x) => s + x.w * x.d, 0);
          return (
            <article key={o.id} className={project.active === i ? 'is-on' : ''}>
              <h3><b>{o.letter}</b> {STRATEGIES[o.strategy].label}</h3>
              <Plan2D project={project} option={o} floor={floor} catalog={catalog} interactive={false} className="gs-thumb" />
              <dl>
                <div><dt>Máy đặt được</dt><dd>{o.placements.length}{o.dropped.length ? ` (thiếu ${o.dropped.length})` : ''}</dd></div>
                <div><dt>Đã có giá</dt><dd>{shortVND(c.priced)}</dd></div>
                <div><dt>Khoảng mở / chức năng</dt><dd>{turf ? fmtArea(turf) : '—'}</dd></div>
                <div><dt>Kiểm tra</dt><dd>{v.issues.filter(x => x.level === 'error').length ? `${v.issues.filter(x => x.level === 'error').length} lỗi` : 'Đạt'}</dd></div>
              </dl>
              <ul>{STRATEGIES[o.strategy].rules.slice(0, 3).map(r => <li key={r}>{r}</li>)}</ul>
              <label className="gs-text"><span>Kiểu bố trí</span><select value={o.strategy} onChange={e => onStrategy(i, e.target.value as Strategy)}>{STRATEGY_LIST.map(s => <option key={s} value={s}>{STRATEGIES[s].label}</option>)}</select></label>
              <button type="button" className="s-btn s-btn--primary" onClick={() => onPick(i)}><Sparkles aria-hidden="true" /> Chọn phương án {o.letter}</button>
            </article>
          );
        })}
      </div>
      <p className="gs-note">Ba phương án dùng cùng danh sách thiết bị và ngân sách; chỉ khác cách tổ chức mặt bằng. Phương án nào thiếu máy được ghi rõ.</p>
    </section>
  );
}
