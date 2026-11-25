'use client';
/**
 * Bảng "Vận hành": mô phỏng một ngày trên phương án đang xem (lib/gym-sim.ts).
 * Chạy / tạm dừng / chạy lại / tăng tốc; bấm một khách để xem đang làm gì, vì sao, bước tiếp theo.
 * Kết quả: số người theo giờ & tầng, chờ lễ tân / máy, mức dùng máy, khu đông (ô nhiệt), đổi / bỏ bài, quãng đường, đổi tầng.
 * Nhiều lượt (hạt giống khác) → mức dao động; so sánh 3 phương án cùng kịch bản. Mọi thông số mẫu ghi rõ là giả định.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, FastForward, Pause, Play, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react';
import type { Equipment } from '@/lib/equipment';
import { STRATEGIES, layoutHash, type Project } from '@/lib/gym-project';
import { ROLE_COLOR, ROLE_LABEL, Sim, calibrate, defaultScenario, runMany, type Scenario, type SimStats } from '@/lib/gym-sim';
import type { PersonView, StudioSpec } from './studio-engine';
import { Num } from './StudioPanels';

type Ctx = { project: Project; catalog: Map<string, Equipment>; floorId: string; setFloorId: (id: string) => void; saveSim: (patch: Pick<Project, 'scenario' | 'simRun'>) => void; setPeople: (p: PersonView[]) => void; setHeat: (h: NonNullable<StudioSpec['heat']> | null) => void; onPick: (fn: (id: string) => void) => void; aiEnabled: boolean };
const SPEEDS = [60, 300, 1200];
const clock = (t: number) => `${String(Math.floor(t / 3600) % 24).padStart(2, '0')}:${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}`;
const sec = (s: number) => (s >= 90 ? `${(s / 60).toFixed(1).replace('.', ',')} phút` : `${Math.round(s)} giây`);

export function SimPanel({ project, catalog, floorId, setFloorId, saveSim, setPeople, setHeat, onPick, aiEnabled }: Ctx) {
  // kịch bản đã lưu cùng phương án (nếu có), không thì giả định mẫu theo mô hình kinh doanh
  const [sc, setSc] = useState<Scenario>(() => (project.scenario ? { ...defaultScenario(project), ...(project.scenario as Partial<Scenario>) } : defaultScenario(project)));
  useEffect(() => { saveSim({ scenario: sc as unknown as Record<string, unknown> }); }, [sc, saveSim]);
  const sim = useRef<Sim | null>(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [, tick] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [res, setRes] = useState<SimStats | null>(null);
  const [many, setMany] = useState<ReturnType<typeof runMany> | null>(null);
  const [cmp, setCmp] = useState<{ letter: string; strategy: string; agg: ReturnType<typeof runMany>['agg'] }[] | null>(null);
  const [heatOn, setHeatOn] = useState(false);
  const [cal, setCal] = useState({ csv: '', stay: '', pt: '', err: '' });
  const [ai, setAi] = useState({ busy: false, text: '', desc: '' });
  const hash = useMemo(() => { const o = project.options[project.active]; return o ? layoutHash(project, o) : ''; }, [project]);
  const stale = !!sim.current && sim.current.layout !== hash;
  const pickRef = useRef(pick); pickRef.current = pick;
  const recordRef = useRef<(r: SimStats) => void>(() => {});
  recordRef.current = (r: SimStats) => { const o = project.options[project.active]; if (o) saveSim({ simRun: { option: o.letter, layout: hash, at: Date.now(), source: sc.source, visitors: r.created, peak: r.maxPresent, waitMachineSec: Math.round(r.waitMachineAvg), deskWaitSec: Math.round(r.deskWaitAvg), abandons: r.abandons } }); };

  useEffect(() => { onPick(id => setPick(id)); }, [onPick]);
  // Mặt bằng đổi → mô phỏng cũ không còn đúng: dừng lại, cần chạy lại
  useEffect(() => { if (stale) setRunning(false); }, [stale]);
  useEffect(() => () => setPeople([]), [setPeople]);

  // Vòng chạy theo khung hình
  useEffect(() => {
    if (!running) return;
    let raf = 0, last = performance.now(), lastUi = 0;
    const loop = (now: number) => {
      const s = sim.current;
      if (!s) return;
      const dt = Math.min(.25, (now - last) / 1000); last = now;
      s.step(dt * speed);
      setPeople(s.views().map(v => ({ ...v, selected: v.id === pickRef.current })));
      if (now - lastUi > 250) { lastUi = now; tick(x => x + 1); }
      if (s.done) { setRunning(false); const r = s.result(); setRes(r); recordRef.current(r); tick(x => x + 1); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, setPeople]);

  useEffect(() => {
    if (heatOn && res) setHeat({ floorId, ...(res.heat[floorId] ?? { size: 1, cells: [] }) });
    else setHeat(null);
  }, [heatOn, res, floorId, setHeat]);
  useEffect(() => () => setHeat(null), [setHeat]);

  function start(reset = false) {
    if (!project.options.length) return;
    if (reset || !sim.current || sim.current.done || stale) { sim.current = new Sim(project, catalog, sc); setRes(null); setPick(null); }
    setRunning(true);
  }
  const s = sim.current;
  const live = useMemo(() => {
    if (!s) return null;
    const by: Record<string, { present: number; ex: number; wait: number }> = {};
    for (const f of project.floors) by[f.id] = { present: 0, ex: 0, wait: 0 };
    for (const a of s.agents.values()) { if (!a.v) continue; const x = by[a.floorId]; if (!x) continue; x.present++; if (a.state === 'exercise' || a.state === 'rest') x.ex++; if (a.state.startsWith('wait')) x.wait++; }
    return by;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, s?.t, project.floors]);
  const info = pick && s ? s.info(pick) : null;
  const optLabel = project.options[project.active] ? `${project.options[project.active].letter} · ${STRATEGIES[project.options[project.active].strategy].label}` : '';

  async function askAI(mode: 'sim-scenario' | 'sim-explain') {
    setAi(a => ({ ...a, busy: true, text: '' }));
    try {
      const context = mode === 'sim-explain' && res ? { source: sc.source, scenario: { open: sc.open, close: sc.close, visitors: sc.visitors, mix: sc.mix, staff: sc.staff, trainers: sc.trainers }, peak: res.maxPresent, peakAt: clock(res.peakTime), waitMachineAvgSec: Math.round(res.waitMachineAvg), deskWaitAvgSec: Math.round(res.deskWaitAvg), skips: res.skips, abandons: res.abandons, shares: res.shares, chats: res.chats, chatHoldMin: Math.round(res.chatHoldMin), busiest: [...res.stations].sort((a, b) => b.util - a.util).slice(0, 5).map(x => ({ name: x.label, util: Math.round(x.util * 100), waits: x.waitN })), idle: [...res.stations].sort((a, b) => a.util - b.util).slice(0, 4).map(x => ({ name: x.label, util: Math.round(x.util * 100) })), floorChanges: res.floorChanges, distanceAvgM: Math.round(res.distanceAvg), option: optLabel }
        : { model: project.brief.model, floors: project.floors.length, areaM2: Math.round(project.floors.reduce((t, f) => t + f.w * f.l, 0)) };
      const r = await fetch('/api/gym-assistant/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, message: mode === 'sim-scenario' ? ai.desc : '', context }) });
      const v = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(v.message || 'Trợ lý AI không phản hồi.');
      if (mode === 'sim-scenario' && v.scenario) {
        const x = v.scenario as Record<string, number>;
        const c = (k: string, lo: number, hi: number) => (typeof x[k] === 'number' ? Math.min(hi, Math.max(lo, x[k])) : undefined);
        setSc(old => {
          const open = c('open', 0, 23) ?? old.open, close = Math.max(open + 1, c('close', 1, 24) ?? old.close);
          const mix = { member: c('member', 0, 1) ?? old.mix.member, guest: c('guest', 0, 1) ?? old.mix.guest, pt: c('pt', 0, 1) ?? old.mix.pt };
          return { ...old, open, close, profile: open !== old.open || close !== old.close ? defaultProfile2(open, close) : old.profile, visitors: Math.round(c('visitors', 5, 3000) ?? old.visitors), mix, groupRate: c('groupRate', 0, .8) ?? old.groupRate, stay: [c('stayMin', 15, 240) ?? old.stay[0], c('stayMax', 20, 300) ?? old.stay[1]], patience: [c('patienceMin', 10, 900) ?? old.patience[0], c('patienceMax', 15, 1200) ?? old.patience[1]], staff: Math.round(c('staff', 0, 6) ?? old.staff), trainers: Math.round(c('trainers', 0, 20) ?? old.trainers), chatChance: c('chatChance', 0, 1) ?? old.chatChance, source: 'assumed' };
        });
      }
      setAi(a => ({ ...a, busy: false, text: v.reply || '' }));
    } catch (x) { setAi(a => ({ ...a, busy: false, text: x instanceof Error ? `⚠ ${x.message}` : '⚠ Lỗi' })); }
  }

  return (
    <div className="gs-panel gs-sim">
      <p className="gs-note"><TriangleAlert aria-hidden="true" /> Mô phỏng trên phương án <b>{optLabel}</b>. {sc.source === 'assumed' ? 'Thông số đang là GIẢ ĐỊNH MẪU — kết quả chỉ để so sánh bố trí, không phải dự báo.' : 'Đã hiệu chỉnh bằng dữ liệu tổng hợp bạn nhập; thời gian lưu lại và cách dùng máy vẫn là giả định.'}</p>
      {stale && <p className="gs-warnbox">Mặt bằng đã thay đổi sau lần chạy trước — kết quả cũ không còn đúng, bấm Chạy lại.</p>}

      <div className="gs-simctl">
        <button type="button" className="s-btn s-btn--primary" onClick={() => (running ? setRunning(false) : start())} disabled={!project.options.length}>{running ? <><Pause aria-hidden="true" /> Tạm dừng</> : <><Play aria-hidden="true" /> {s && !s.done && !stale ? 'Chạy tiếp' : 'Chạy'}</>}</button>
        <button type="button" className="gs-btn" onClick={() => start(true)}><RotateCcw aria-hidden="true" /> Chạy lại</button>
        <button type="button" className="gs-btn" title="Tính nhanh phần còn lại của ngày, không vẽ" onClick={() => { if (!sim.current || sim.current.done || stale) sim.current = new Sim(project, catalog, sc); setRunning(false); sim.current.step(1e9); const rr = sim.current.result(); setRes(rr); recordRef.current(rr); setPeople([]); tick(x => x + 1); }}><FastForward aria-hidden="true" /> Đến cuối ngày</button>
        <div className="gs-seg" role="radiogroup" aria-label="Tốc độ">{SPEEDS.map(x => <button key={x} type="button" role="radio" aria-checked={speed === x} className={speed === x ? 'is-on' : ''} onClick={() => setSpeed(x)}>{x}×</button>)}</div>
        <b className="gs-clock">{s ? clock(s.t) : clock(sc.open * 3600)}</b>
      </div>

      {live && <div className="gs-live">{project.floors.map(f => <button key={f.id} type="button" className={f.id === floorId ? 'is-on' : ''} onClick={() => setFloorId(f.id)}><b>{f.name}</b><span>{live[f.id]?.present ?? 0} người · {live[f.id]?.ex ?? 0} đang tập · {live[f.id]?.wait ?? 0} đang chờ</span></button>)}</div>}
      <p className="gs-legend">{(['member', 'guest', 'pt', 'trainer', 'staff'] as const).map(r => <span key={r}><i style={{ background: ROLE_COLOR[r] }} />{ROLE_LABEL[r]}</span>)}</p>

      {info && (
        <div className="gs-agent">
          <b>{ROLE_LABEL[info.role]} {info.id}{info.group ? ' (đi nhóm)' : ''} · {info.floor}</b>
          <p><em>{info.state}</em> — {info.reason}</p>
          <p>Bước tiếp theo: <b>{info.next}</b></p>
          {info.program && <p>Chương trình: {info.program} · còn {info.tasksLeft.length} bài: {info.tasksLeft.slice(0, 4).join(' → ')}</p>}
          <p>Đã ở {info.minutes} phút · đã chờ {info.waited} phút</p>
          <button type="button" className="gs-link" onClick={() => setPick(null)}>Bỏ chọn</button>
        </div>
      )}
      {!info && s && <p className="gs-note">Bấm vào một người trong không gian 3D để xem họ đang làm gì và vì sao.</p>}

      {res && (
        <div className="gs-res">
          <h3>Kết quả ngày mô phỏng</h3>
          <Timeline res={res} project={project} />
          <dl className="gs-kpis">
            <div><dt>Tổng lượt khách</dt><dd>{res.created}/{res.visitors}</dd></div>
            <div><dt>Đông nhất cùng lúc</dt><dd>{res.maxPresent} người · {clock(res.peakTime)}</dd></div>
            <div><dt>Chờ lễ tân TB</dt><dd>{sec(res.deskWaitAvg)}</dd></div>
            <div><dt>Chờ máy TB / lâu nhất</dt><dd>{sec(res.waitMachineAvg)} / {sec(res.waitMachineMax)}</dd></div>
            <div><dt>Đổi thứ tự / bỏ bài vì chờ</dt><dd>{res.reorders} / {res.abandons}</dd></div>
            <div><dt>Tập luân phiên</dt><dd>{res.shares} lần</dd></div>
            <div><dt>Trò chuyện (giữ máy thêm)</dt><dd>{res.chats} lần · {Math.round(res.chatHoldMin)} phút</dd></div>
            <div><dt>Người phải chờ vì người khác trò chuyện</dt><dd>{res.blockedByChat} lượt</dd></div>
            <div><dt>Quãng đường TB / khách</dt><dd>{Math.round(res.distanceAvg)} m</dd></div>
            <div><dt>Lượt đổi tầng</dt><dd>{res.floorChanges}</dd></div>
          </dl>
          <label className="gs-toggle"><input type="checkbox" checked={heatOn} onChange={e => setHeatOn(e.target.checked)} /><span>Hiện ô nhiệt khu đông người trên tầng đang xem</span></label>
          <h3>Máy hay có người chờ / ít dùng</h3>
          <ul className="gs-util">{[...res.stations].sort((a, b) => b.util - a.util).map(x => <li key={x.id} className={x.util < .12 ? 'is-low' : x.waitN > 3 ? 'is-hot' : ''}><span>{x.label}</span><i style={{ width: `${Math.round(x.util * 100)}%` }} /><b>{Math.round(x.util * 100)}%{x.waitN ? ` · ${x.waitN} lượt chờ` : ''}</b></li>)}</ul>
          {res.hot.length > 0 && <p className="gs-note">Điểm đông / nghẽn lối đi: {res.hot.slice(0, 4).map(h => `${project.floors.find(f => f.id === h.floorId)?.name} (${h.x.toFixed(0)}; ${h.z.toFixed(0)} m)`).join(', ')}.</p>}
          {aiEnabled && <button type="button" className="gs-btn" disabled={ai.busy} onClick={() => void askAI('sim-explain')}><Bot aria-hidden="true" /> {ai.busy ? 'ANNA đang đọc kết quả…' : 'Nhờ ANNA giải thích kết quả'}</button>}
        </div>
      )}
      {ai.text && <div className="gs-aibox"><b><Bot aria-hidden="true" /> ANNA</b><p>{ai.text}</p></div>}

      <div className="gs-row">
        <button type="button" className="gs-btn" onClick={() => setMany(runMany(project, catalog, sc, 5))}><Sparkles aria-hidden="true" /> Chạy 5 lượt (mức dao động)</button>
        {project.options.length > 1 && <button type="button" className="gs-btn" onClick={() => setCmp(project.options.map(o => ({ letter: o.letter, strategy: STRATEGIES[o.strategy].label, agg: runMany(project, catalog, sc, 3, o).agg })))}>So sánh 3 phương án</button>}
      </div>
      {many && <AggTable rows={[{ name: `5 lượt · ${optLabel}`, agg: many.agg }]} />}
      {cmp && <><AggTable rows={cmp.map(c => ({ name: `${c.letter} · ${c.strategy}`, agg: c.agg }))} /><p className="gs-note">Cùng kịch bản khách và cùng hạt giống ngẫu nhiên cho cả 3 phương án; mỗi phương án 3 lượt.</p></>}

      <details className="gs-scn">
        <summary>Kịch bản vận hành {sc.source === 'assumed' ? '(giả định mẫu)' : '(đã hiệu chỉnh)'}</summary>
        <div className="gs-grid2">
          <Num label="Mở cửa (giờ)" value={sc.open} min={0} max={23} step={.5} onChange={v => setSc(x => ({ ...x, open: v, close: Math.max(v + 1, x.close), profile: defaultProfile2(v, Math.max(v + 1, x.close)) }))} />
          <Num label="Đóng cửa (giờ)" value={sc.close} min={1} max={24} step={.5} onChange={v => setSc(x => ({ ...x, close: Math.max(x.open + 1, v), profile: defaultProfile2(x.open, Math.max(x.open + 1, v)) }))} />
          <Num label="Tổng lượt khách / ngày" value={sc.visitors} min={5} max={3000} step={5} onChange={v => setSc(x => ({ ...x, visitors: Math.round(v) }))} />
          <Num label="Tỷ lệ đi nhóm (%)" value={Math.round(sc.groupRate * 100)} min={0} max={80} step={1} onChange={v => setSc(x => ({ ...x, groupRate: v / 100 }))} />
          <Num label="Hội viên (%)" value={Math.round(sc.mix.member * 100)} min={0} max={100} step={1} onChange={v => setSc(x => ({ ...x, mix: { ...x.mix, member: v / 100 } }))} />
          <Num label="Khách mới (%)" value={Math.round(sc.mix.guest * 100)} min={0} max={100} step={1} onChange={v => setSc(x => ({ ...x, mix: { ...x.mix, guest: v / 100 } }))} />
          <Num label="Khách PT (%)" value={Math.round(sc.mix.pt * 100)} min={0} max={100} step={1} onChange={v => setSc(x => ({ ...x, mix: { ...x.mix, pt: v / 100 } }))} />
          <Num label="Ở lại (phút, TB)" value={Math.round((sc.stay[0] + sc.stay[1]) / 2)} min={20} max={240} step={5} onChange={v => setSc(x => ({ ...x, stay: [Math.round(v * .8), Math.round(v * 1.2)] }))} />
          <Num label="Kiên nhẫn chờ máy (giây)" value={Math.round((sc.patience[0] + sc.patience[1]) / 2)} min={15} max={900} step={15} onChange={v => setSc(x => ({ ...x, patience: [Math.round(v * .6), Math.round(v * 1.4)] }))} />
          <Num label="Nghỉ giữa hiệp (giây)" value={Math.round((sc.rest[0] + sc.rest[1]) / 2)} min={20} max={300} step={10} onChange={v => setSc(x => ({ ...x, rest: [Math.round(v * .7), Math.round(v * 1.3)] }))} />
          <Num label="Xác suất trò chuyện (%)" value={Math.round(sc.chatChance * 100)} min={0} max={100} step={5} onChange={v => setSc(x => ({ ...x, chatChance: v / 100 }))} />
          <Num label="Lễ tân" value={sc.staff} min={0} max={6} step={1} onChange={v => setSc(x => ({ ...x, staff: Math.round(v) }))} />
          <Num label="Huấn luyện viên" value={sc.trainers} min={0} max={20} step={1} onChange={v => setSc(x => ({ ...x, trainers: Math.round(v) }))} />
          <Num label="Hạt giống ngẫu nhiên" value={sc.seed} min={1} max={9999} step={1} onChange={v => setSc(x => ({ ...x, seed: Math.round(v) }))} />
        </div>
        <label className="gs-toggle"><input type="checkbox" checked={sc.allowShare} onChange={e => setSc(x => ({ ...x, allowShare: e.target.checked }))} /><span>Cho phép tập luân phiên trên máy tạ</span></label>
        <label className="gs-toggle"><input type="checkbox" checked={sc.onGiveUp === 'leave'} onChange={e => setSc(x => ({ ...x, onGiveUp: e.target.checked ? 'leave' : 'skip' }))} /><span>Chờ quá lâu 2 lần thì về sớm (thay vì chỉ bỏ bài)</span></label>
        {aiEnabled && <div className="gs-aiscn"><textarea rows={2} maxLength={800} value={ai.desc} placeholder="Mô tả vận hành, vd: mở 5h30–22h, khoảng 300 lượt, tối đông, 3 PT, 2 lễ tân" onChange={e => setAi(a => ({ ...a, desc: e.target.value }))} /><button type="button" className="gs-btn" disabled={ai.busy || ai.desc.trim().length < 5} onClick={() => void askAI('sim-scenario')}><Bot aria-hidden="true" /> ANNA tạo kịch bản</button></div>}
        <h3>Hiệu chỉnh bằng dữ liệu thật</h3>
        <p className="gs-note">Dán lượt check-in tổng hợp theo giờ ("giờ,lượt" mỗi dòng). Check-in chỉ cho biết giờ đến — thời gian ở lại và cách dùng máy cần thêm dữ liệu check-out / quan sát.</p>
        <textarea className="gs-textarea" rows={4} value={cal.csv} placeholder={'6,25\n7,40\n17,35\n18,52'} onChange={e => setCal(c => ({ ...c, csv: e.target.value }))} />
        <div className="gs-grid2">
          <label className="gs-text"><span>Ở lại TB (phút, từ check-out)</span><input inputMode="numeric" value={cal.stay} onChange={e => setCal(c => ({ ...c, stay: e.target.value.replace(/\D/g, '') }))} /></label>
          <label className="gs-text"><span>Lịch PT (vd 6:30, 18:00)</span><input value={cal.pt} onChange={e => setCal(c => ({ ...c, pt: e.target.value }))} /></label>
        </div>
        {cal.err && <p className="gp-error">{cal.err}</p>}
        <button type="button" className="gs-btn" onClick={() => { const r = calibrate(sc, cal.csv, Number(cal.stay) || undefined, cal.pt); if (typeof r === 'string') setCal(c => ({ ...c, err: r })); else { setSc(r); setCal(c => ({ ...c, err: '' })); } }}>Áp dụng dữ liệu</button>
        <button type="button" className="gs-link" onClick={() => setSc(defaultScenario(project))}>Về giả định mẫu</button>
      </details>
    </div>
  );
}

function defaultProfile2(open: number, close: number) {
  const out: number[] = [];
  for (let h = Math.floor(open); h < Math.ceil(close); h++) out.push(+(.08 + .9 * Math.exp(-((h + .5 - 6.8) ** 2) / 1.6) + 1.2 * Math.exp(-((h + .5 - 18.4) ** 2) / 2.2) + .35 * Math.exp(-((h + .5 - 12) ** 2) / 3)).toFixed(3));
  return out;
}

/** Biểu đồ số người có mặt theo thời gian, từng tầng (SVG nhỏ) */
function Timeline({ res, project }: { res: SimStats; project: Project }) {
  const W = 300, H = 90;
  const t0 = res.timeline[0]?.t ?? 0, t1 = res.timeline[res.timeline.length - 1]?.t ?? 1;
  const max = Math.max(1, ...res.timeline.map(x => Object.values(x.floors).reduce((s, f) => s + f.present, 0)));
  const colors = ['#2b4294', '#f26b1d', '#16a34a', '#7c3aed', '#0e7490'];
  const sorted = [...project.floors].sort((a, b) => a.level - b.level);
  const line = (fid: string | null) => res.timeline.map((x, i) => `${i ? 'L' : 'M'}${((x.t - t0) / Math.max(1, t1 - t0) * W).toFixed(1)},${(H - (fid ? x.floors[fid]?.present ?? 0 : Object.values(x.floors).reduce((s, f) => s + f.present, 0)) / max * (H - 8)).toFixed(1)}`).join('');
  return (
    <figure className="gs-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Số người có mặt theo giờ">
        <path d={line(null)} fill="none" stroke="#13244f" strokeWidth={2} />
        {sorted.length > 1 && sorted.map((f, i) => <path key={f.id} d={line(f.id)} fill="none" stroke={colors[i % 5]} strokeWidth={1.2} strokeDasharray="3 2" />)}
      </svg>
      <figcaption>Số người có mặt {clock(t0)}–{clock(t1)} · cao nhất {res.maxPresent}{sorted.length > 1 ? ` · nét đứt: ${sorted.map((f, i) => `${f.name} (${['xanh', 'cam', 'lá', 'tím', 'lam'][i % 5]})`).join(', ')}` : ''}</figcaption>
    </figure>
  );
}
function AggTable({ rows }: { rows: { name: string; agg: ReturnType<typeof runMany>['agg'] }[] }) {
  const f = (x: { mean: number; min: number; max: number }, d = 0, unit = '') => `${x.mean.toFixed(d)}${unit} (${x.min.toFixed(d)}–${x.max.toFixed(d)})`;
  return (
    <div className="gs-aggwrap"><table className="gp-table gs-agg">
      <thead><tr><th></th><th>Đông nhất</th><th>Chờ máy TB (giây)</th><th>Bỏ bài</th><th>Luân phiên</th><th>Quãng đường (m)</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.name}><th>{r.name}</th><td>{f(r.agg.maxPresent)}</td><td>{f(r.agg.waitMachineAvg)}</td><td>{f(r.agg.abandons)}</td><td>{f(r.agg.shares)}</td><td>{f(r.agg.distanceAvg)}</td></tr>)}</tbody>
    </table></div>
  );
}
