'use client';
/**
 * Phòng lab thiết kế phòng tập (/bao-gia-setup-phong-gym/):
 *   Nhập nhu cầu (4 nhóm) → nhận 3 phương án → xem / so sánh → chỉnh (mặt bằng nhiều tầng, máy, lễ tân, phong cách)
 *   → xem chi phí từng tầng → lưu / chia sẻ mã → gửi đúng phương án cho DANAVA.
 * Trạng thái: một Project (lib/gym-project.ts), mọi thay đổi qua lib/gym-edit.ts, có hoàn tác / làm lại.
 * Hình học luôn kiểm tra lại bằng lib/gym-geometry.ts sau mỗi thao tác. Không có WebGL → mặt bằng 2D (SVG).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Box, Building2, Check, ClipboardList, Columns3, Copy, Eye, Lock, Map as MapIcon, MessageCircle, Move3d, Palette, Redo2, RotateCw, Ruler, Save, Send, Share2, Sparkles, Trash2, TriangleAlert, Undo2, Unlock, Users, View } from 'lucide-react';
import type { Equipment, Flooring } from '@/lib/equipment';
import { formatVND } from '@/lib/equipment';
import { FIXTURE_KINDS, LINK_KINDS, STRATEGIES, activeOption, fmtArea, layoutHash, normalizeProject, optionCode, type FurnKind, type Project, type Strategy } from '@/lib/gym-project';
import { FURNITURE, buildReception } from '@/lib/gym-decor';
import { generateOption, generateOptions, selectEquipment } from '@/lib/gym-layout';
import { validateOption } from '@/lib/gym-geometry';
import { costOf, shortVND } from '@/lib/gym-cost';
import * as E from '@/lib/gym-edit';
import { createStudio, type PersonView, type Studio, type ViewMode } from './studio-engine';
import { Plan2D } from './Plan2D';
import { BriefPanel, CostTable, EquipmentPanel, FloorsPanel, Num, ReceptionPanel, STRATEGY_LIST, StartWizard, StylePanel } from './StudioPanels';

const KEY = 'danava-gym-studio-v2';
const TOKENS = 'danava-gym-tokens';
type Tab = 'brief' | 'floors' | 'eq' | 'reception' | 'style' | 'assistant' | 'sim';
const VIEWS: [ViewMode, string, ReactNode][] = [
  ['plan', 'Mặt bằng 2D', <MapIcon key="p" aria-hidden="true" />], ['orbit', '3D', <Box key="o" aria-hidden="true" />], ['entrance', 'Từ cửa vào', <Eye key="e" aria-hidden="true" />],
  ['eye', 'Ngang tầm người', <View key="v" aria-hidden="true" />], ['stack', 'Cả công trình', <Building2 key="s" aria-hidden="true" />], ['exploded', 'Tách tầng', <Columns3 key="x" aria-hidden="true" />]
];

export type StudioExtras = {
  /** bảng trợ lý ANNA (giai đoạn 3) */
  assistant?: (ctx: { project: Project; commit: (p: Project, label: string) => void; floorId: string }) => ReactNode;
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
  const [tab, setTab] = useState<Tab>('eq');
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
    return f && door && tab === 'reception' ? buildReception(project.reception, f, door).flows.map(fl => ({ ...fl, floorId: f.id })) : [];
  }, [project, tab]);
  useEffect(() => {
    if (!project || !studio.current || !floorId) return;
    studio.current.update({ project, option, catalog, floorId, mode, selected: sel, issues, flows, showClear: showClear || mode === 'plan', heat });
  }, [project, option, catalog, floorId, mode, sel, issues, flows, showClear, heat, gl]);
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
    if (eq) { const r = E.addEquipment(project, floorId, eq, catalog); commit(r.project, `Đã thêm ${eq.name}`); setSel(r.id); }
  }, [project, floorId, addId, catalog, commit]);

  /* ---------- Tạo phương án ---------- */
  function regenerate(base: Project, label = 'Đã tạo 3 phương án mới (giữ phần đã khoá)') {
    const { options, selection } = generateOptions(base, equipment, { keep: activeOption(base), flooring });
    const next: Project = { ...base, options, active: 0, version: base.version + 1, updatedAt: Date.now() };
    commit(next, label);
    if (selection.notes.length) setTimeout(() => setNotice(selection.notes[0]), 1800);
    setTab('eq');
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
  const [share, setShare] = useState<{ busy: boolean; url: string; error: string }>({ busy: false, url: '', error: '' });
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

  return (
    <div className="gs">
      {/* ----- Phương án ----- */}
      <div className="gs-top">
        <div className="gs-opts" role="radiogroup" aria-label="Phương án bố trí">
          {project.options.map((o, i) => {
            const c = costOf(project, o, catalog, flooring), v = validateOption(project, o, catalog);
            const nErr = v.issues.filter(x => x.level === 'error').length;
            return (
              <button key={o.id} type="button" role="radio" aria-checked={project.active === i} className={project.active === i ? 'is-on' : ''} onClick={() => { commit({ ...project, active: i }); setSel(null); }}>
                <b>{o.letter}</b>
                <span><strong>{STRATEGIES[o.strategy].label}</strong><small>{o.placements.length} máy · {shortVND(c.priced)}{nErr ? ` · ${nErr} lỗi` : ''}</small></span>
              </button>
            );
          })}
        </div>
        <div className="gs-tools">
          <button type="button" className="gs-icon" onClick={undo} disabled={!hist.current.past.length} title="Hoàn tác (Ctrl+Z)" aria-label="Hoàn tác"><Undo2 /></button>
          <button type="button" className="gs-icon" onClick={redo} disabled={!hist.current.future.length} title="Làm lại (Ctrl+Y)" aria-label="Làm lại"><Redo2 /></button>
          <button type="button" className="gs-btn" onClick={() => setCompare(c => !c)}><Columns3 aria-hidden="true" /> So sánh</button>
          <button type="button" className="gs-btn" onClick={() => void save()} disabled={share.busy}><Save aria-hidden="true" /> {share.busy ? 'Đang lưu…' : project.code ? `Lưu ${project.code}` : 'Lưu & lấy mã'}</button>
        </div>
      </div>
      {(share.url || share.error) && (
        <p className={`gs-share${share.error ? ' is-error' : ''}`} role="status">
          {share.error || <><Share2 aria-hidden="true" /> Mã phương án <b>{project.code}</b> (phiên bản {project.version}) — mở lại bằng đường dẫn: <a href={share.url}>{share.url}</a> <button type="button" onClick={() => { void navigator.clipboard?.writeText(share.url); setNotice('Đã chép đường dẫn'); }}><Copy aria-hidden="true" /> Chép</button></>}
        </p>
      )}

      {compare && <Compare project={project} catalog={catalog} flooring={flooring} onPick={i => { commit({ ...project, active: i }); setCompare(false); }} onStrategy={changeStrategy} onClose={() => setCompare(false)} />}

      <div className="gs-main">
        {/* ----- Bảng điều khiển ----- */}
        <aside className="gs-side" aria-label="Bảng điều khiển thiết kế">
          <div className="gs-tabs" role="tablist">
            {([['brief', 'Nhu cầu', <ClipboardList key="b" />], ['floors', 'Mặt bằng', <Ruler key="f" />], ['eq', 'Thiết bị', <Box key="e" />], ['reception', 'Lễ tân', <Users key="r" />], ['style', 'Phong cách', <Palette key="s" />],
              ...(extras?.assistant ? [['assistant', 'ANNA', <MessageCircle key="a" />]] : []), ...(extras?.sim ? [['sim', 'Vận hành', <Move3d key="m" />]] : [])] as [Tab, string, ReactNode][]).map(([k, l, ic]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{ic}{l}</button>
            ))}
          </div>
          {tab === 'brief' && <BriefPanel p={project} set={fn => set(fn)} equipment={equipment} onRegenerate={() => regenerate(project)} />}
          {tab === 'floors' && <FloorsPanel p={project} floor={floor} setFloorId={setFloorId} selectItem={setSel} act={{
            updateFloor: (id, patch) => set(p => E.updateFloor(p, id, patch)),
            addFloor: () => set(p => E.addFloor(p), 'Đã thêm tầng — bấm "Tạo lại 3 phương án" để xếp máy cho tầng mới'),
            duplicateFloor: id => set(p => E.duplicateFloor(p, id), 'Đã sao chép tầng'),
            removeFloor: id => set(p => E.removeFloor(p, id), 'Đã xoá tầng'),
            addFixture: kind => { const r = E.addFixture(project, floor.id, kind); commit(r.project, `Đã thêm ${FIXTURE_KINDS[kind].label.toLowerCase()} — kéo để đặt đúng chỗ`); setSel(r.id); },
            addLink: (kind, fl) => { const r = E.addLink(project, kind, fl); commit(r.project, `Đã thêm ${LINK_KINDS[kind].label.toLowerCase()}`); setSel(r.id); },
            lockFloor: locked => set(p => E.lockFloor(p, floor.id, locked), locked ? 'Đã khoá toàn bộ tầng — tạo lại phương án sẽ giữ nguyên' : 'Đã mở khoá tầng')
          }} />}
          {tab === 'eq' && <EquipmentPanel equipment={equipment} p={project} floor={floor} onMust={id => set(p => ({ ...p, brief: { ...p.brief, mustHave: p.brief.mustHave.includes(id) ? p.brief.mustHave.filter(x => x !== id) : [...p.brief.mustHave, id] } }))}
            onAdd={eq => { if (!option) return; const r = E.addEquipment(project, floor.id, eq, catalog); commit(r.project, r.placed ? `Đã thêm ${eq.name} vào ${floor.name.toLowerCase()}` : `Hết chỗ hợp lệ cho ${eq.name} — đã đặt giữa sàn (tô đỏ), hãy dời máy khác`); setSel(r.id); }} />}
          {tab === 'reception' && <ReceptionPanel p={project} set={patch => set(p => E.setReception(p, patch))} />}
          {tab === 'style' && <StylePanel p={project} floor={floor} set={fn => set(fn)} addDecor={(k: FurnKind) => { const F = FURNITURE[k]; set(p => E.addFurniture(p, floor.id, { kind: k, x: 0, z: 0, rot: 0, w: F.w, d: F.d, group: 'decor' }), `Đã thêm ${F.label.toLowerCase()} — kéo để đặt`); }} />}
          {tab === 'assistant' && extras?.assistant?.({ project, commit, floorId: floor.id })}
          {tab === 'sim' && extras?.sim?.({ project, catalog, floorId: floor.id, setFloorId, saveSim, setPeople: pushPeople, setHeat, onPick: fn => { pickRef.current = fn; } })}
        </aside>

        {/* ----- Sân khấu 3D / 2D ----- */}
        <div className="gs-stagewrap">
          <div className="gs-bar">
            <div className="gs-floortabs" role="radiogroup" aria-label="Tầng đang xem">
              {sorted.map(f => <button key={f.id} type="button" role="radio" aria-checked={f.id === floor.id} className={f.id === floor.id ? 'is-on' : ''} onClick={() => { setFloorId(f.id); setSel(null); }}>{f.name}</button>)}
            </div>
            <div className="gs-views" role="radiogroup" aria-label="Góc xem">
              {VIEWS.filter(([k]) => gl !== 'fail' || k === 'plan').filter(([k]) => project.floors.length > 1 || (k !== 'stack' && k !== 'exploded')).map(([k, l, ic]) => <button key={k} type="button" role="radio" aria-checked={mode === k} className={mode === k ? 'is-on' : ''} onClick={() => { setMode(k); setTimeout(() => studio.current?.resetView(), 0); }} title={l}>{ic}<span>{l}</span></button>)}
            </div>
          </div>
          <div className="gs-stage">
            {gl !== 'fail' && <div ref={host} className="gs-canvas" />}
            {gl === 'loading' && <p className="gp-loading">Đang dựng không gian 3D…</p>}
            {gl === 'fail' && (
              <div className="gs-fallback">
                <p className="gs-note"><TriangleAlert aria-hidden="true" /> Trình duyệt / thiết bị này không chạy được 3D (WebGL). Bạn vẫn thiết kế đầy đủ trên mặt bằng 2D: kéo thả, xoay, khoá, chi phí và gửi phương án.</p>
                <Plan2D project={project} option={option} floor={floor} catalog={catalog} selected={sel} issues={issues} onSelect={setSel} onMove={(id, x, z) => set(p => E.moveItem(p, id, x, z))} people={people} showClear flows={flows} className="gs-plan" />
              </div>
            )}
            {gl === 'ok' && <label className="gs-clearbtn"><input type="checkbox" checked={showClear} onChange={e => setShowClear(e.target.checked)} /> Khoảng trống vận hành</label>}
            {sel && (selPl || selFu || selFx || selLn) && (
              <div className={`gs-toolbar${selIssues.some(i => i.level === 'error') ? ' is-bad' : ''}`} role="toolbar" aria-label="Vật đang chọn">
                <b>{selEq?.name ?? (selFu ? (selFu.label === 'logo' ? 'Vách nhận diện' : selFu.label || FURNITURE[selFu.kind].label) : selFx ? (selFx.label || FIXTURE_KINDS[selFx.kind].label) : selLn ? LINK_KINDS[selLn.kind].label : '')}
                  {selEq && <small>{selEq.price ? formatVND(Number(selEq.price)) : 'Chưa có giá'} · {selEq.width}×{selEq.depth} cm{selEq.dimsEstimated ? ' (ước tính)' : ''}</small>}
                  {selIssues.map((i, k) => <small key={k} className="is-err">{i.msg}</small>)}
                </b>
                {(selFx || selLn) && <>
                  <Num label="Rộng" unit="m" value={(selFx ?? selLn)!.w} min={.1} max={40} onChange={v => set(p => selFx ? E.updateFixture(p, selFx.id, { w: v }) : E.updateLink(p, selLn!.id, { w: v }))} />
                  <Num label="Sâu" unit="m" value={(selFx ?? selLn)!.d} min={.05} max={40} onChange={v => set(p => selFx ? E.updateFixture(p, selFx.id, { d: v }) : E.updateLink(p, selLn!.id, { d: v }))} />
                </>}
                {selFx?.kind === 'door' && <label className="gs-toggle"><input type="checkbox" checked={!!selFx.main} onChange={e => set(p => E.updateFixture(p, selFx.id, { main: e.target.checked }))} /><span>Cửa chính</span></label>}
                <button type="button" onClick={() => set(p => E.rotateItem(p, sel))} disabled={!!(selPl?.locked || selFu?.locked)}><RotateCw aria-hidden="true" /> Xoay</button>
                {(selPl || selFu) && <button type="button" onClick={() => set(p => E.duplicateItem(p, sel, catalog))}><Copy aria-hidden="true" /> Nhân bản</button>}
                {(selPl || selFu) && <button type="button" onClick={() => set(p => E.toggleLock(p, sel), (selPl ?? selFu)!.locked ? 'Đã mở khoá' : 'Đã khoá — tạo lại phương án sẽ giữ nguyên vị trí này')}>{(selPl ?? selFu)!.locked ? <><Unlock aria-hidden="true" /> Mở khoá</> : <><Lock aria-hidden="true" /> Khoá</>}</button>}
                {selPl && project.floors.length > 1 && <label className="gs-movefloor"><span>Chuyển tầng</span><select value={selPl.floorId} disabled={!!selPl.locked} onChange={e => { const r = E.moveToFloor(project, selPl.id, e.target.value, catalog); commit(r.project, r.placed ? 'Đã chuyển máy sang tầng khác' : 'Tầng đích hết chỗ hợp lệ — máy đặt giữa sàn (tô đỏ)'); setFloorId(e.target.value); }}>{sorted.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>}
                <button type="button" className="is-danger" disabled={!!(selPl?.locked || selFu?.locked)} onClick={() => { set(p => E.removeItem(p, sel)); setSel(null); }}><Trash2 aria-hidden="true" /> Xoá</button>
              </div>
            )}
            {notice && <p className="gs-notice" role="status">{notice}</p>}
            {gl === 'ok' && !sel && <p className="gp-hint">Kéo để di chuyển · R xoay · Ctrl+Z hoàn tác · kéo nền để xoay góc nhìn</p>}
          </div>
        </div>
      </div>

      {/* ----- Phương án đang chọn: lý do, kiểm tra, chi phí, gửi ----- */}
      {option && (
        <section className="gs-below">
          <div className="gs-col">
            <h2>Phương án {optionCode(project, option)} · {STRATEGIES[option.strategy].label} <small>phiên bản {option.version}</small></h2>
            <label className="gs-text gs-inline"><span>Đổi kiểu bố trí</span><select value={option.strategy} onChange={e => changeStrategy(project.active, e.target.value as Strategy)}>{STRATEGY_LIST.map(s => <option key={s} value={s}>{STRATEGIES[s].label}</option>)}</select></label>
            <ul className="gs-reasons">{option.reasons.map((r, i) => <li key={i}>{r}</li>)}{option.changes.map((r, i) => <li key={'c' + i} className="is-change">{r}</li>)}</ul>
            {option.dropped.length > 0 && <details className="gs-dropped"><summary>{option.dropped.length} máy chưa đặt được</summary><ul>{option.dropped.map((d, i) => <li key={i}>{catalog.get(d.eqId)?.name ?? d.eqId} — {project.floors.find(f => f.id === d.floorId)?.name}: {d.reason}</li>)}</ul><p className="gs-note">Đề xuất: đổi kiểu bố trí, thu nhỏ sảnh lễ tân, bỏ bớt vùng không dùng, hoặc chọn máy nhỏ hơn.</p></details>}
            <h3><TriangleAlert aria-hidden="true" /> Kiểm tra bố trí {errors.length ? <em className="is-bad">{errors.length} lỗi</em> : <em className="is-ok"><Check aria-hidden="true" /> đạt</em>}</h3>
            {errors.length > 0 && <ul className="gs-issues">{errors.slice(0, 30).map((i, k) => <li key={k}><button type="button" onClick={() => goIssue(i.id, i.floorId)}>{project.floors.length > 1 ? `${project.floors.find(f => f.id === i.floorId)?.name}: ` : ''}{i.msg}</button></li>)}</ul>}
            {!!validation?.verify.length && <><h3>Cần xác minh trước khi triển khai</h3><ul className="gs-verify">{validation.verify.map((v, i) => <li key={i}>{v}</li>)}</ul></>}
          </div>
          <div className="gs-col">
            <h2>Chi phí {project.floors.length > 1 ? 'từng tầng & toàn công trình' : `phòng ${fmtArea(floor.w * floor.l)}`}</h2>
            <CostTable cost={cost} />
            <p className="gp-note">Giá thiết bị theo bảng giá đối tác thietbigym.vn; nội thất là khoảng giá tham khảo (giả định). Chưa gồm vận chuyển, lắp đặt, thi công, điện. DANAVA xác nhận báo giá chính thức sau khảo sát.</p>
            <div className="gs-send" id="gs-send">
              {form.done ? <p className="gp-done" role="status">{form.done}</p> : <>
                <button type="button" className="s-btn s-btn--primary s-btn--lg" onClick={() => setForm(f => ({ ...f, open: !f.open }))}><Send aria-hidden="true" /> Nhận tư vấn phương án này</button>
                {form.open && (
                  <form className="gp-form" onSubmit={send}>
                    <label>Họ và tên<input required minLength={2} maxLength={150} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" /></label>
                    <label>Số điện thoại<input required type="tel" maxLength={25} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} autoComplete="tel" /></label>
                    <label className="gp-form__wide">Ghi chú (tuỳ chọn)<textarea rows={2} maxLength={1000} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></label>
                    <div className="gp-form__wide gs-toggles"><label className="gs-toggle"><input type="checkbox" checked={form.studio} onChange={e => setForm(f => ({ ...f, studio: e.target.checked }))} /><span>Quan tâm thêm DANAVA Studio (quản lý hội viên, check-in)</span></label><label className="gs-toggle"><input type="checkbox" checked={form.marketing} onChange={e => setForm(f => ({ ...f, marketing: e.target.checked }))} /><span>Quan tâm thêm marketing khai trương</span></label></div>
                    {form.error && <p className="gp-error" role="alert">{form.error}</p>}
                    <button type="submit" className="s-btn s-btn--primary" disabled={form.sending}>{form.sending ? 'Đang lưu & gửi…' : `Gửi phương án ${option.letter}`}</button>
                    <small className="gp-form__wide gs-note">Hệ thống lưu phương án kèm ảnh tổng thể và mã {project.code || '(cấp khi gửi)'} để DANAVA mở lại đúng bản bạn chọn.</small>
                  </form>
                )}
              </>}
            </div>
          </div>
        </section>
      )}
      {option && !form.done && <a className="gs-sticky" href="#gs-send" onClick={() => setForm(f => ({ ...f, open: true }))}><Send aria-hidden="true" /> Nhận tư vấn phương án {option.letter}</a>}
      <p className="gs-foot">
        <button type="button" className="gs-link" onClick={() => { if (confirm('Bắt đầu lại từ đầu? Phương án hiện tại trên máy sẽ bị xoá (bản đã lưu bằng mã vẫn còn).')) { setProject(null); hist.current = { past: [], future: [] }; try { localStorage.removeItem(KEY); } catch {} } }}>Bắt đầu thiết kế mới</button>
        <span>· Dữ liệu phương án lưu trên trình duyệt của bạn; chỉ gửi lên DANAVA khi bạn bấm Lưu hoặc Gửi.</span>
      </p>
    </div>
  );
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
