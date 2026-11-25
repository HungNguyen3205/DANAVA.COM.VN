/**
 * Bộ dựng 3D của phòng lab thiết kế phòng tập (components/site/gym/GymStudio.tsx).
 * Vẽ theo dữ liệu: React giữ trạng thái (Project), bộ dựng chỉ hiển thị + báo thao tác (chọn, kéo thả).
 * Không tự sửa dữ liệu; sau mỗi lần thả, giao diện chạy lại bộ kiểm tra hình học (lib/gym-geometry.ts).
 *
 * Góc xem: plan (mặt bằng 2D), orbit (tổng thể 3D tầng đang xem), entrance (từ cửa vào), eye (ngang tầm người),
 * stack (toàn công trình xếp chồng), exploded (tách tầng).
 */
import type * as T from 'three';
import type { Equipment } from '@/lib/equipment';
import { buildModel } from '../gym-planner-models';
import { entranceFloor, footOf, type DesignOption, type Floor, type Project } from '@/lib/gym-project';
import { INTERIOR_STYLES, wallOf } from '@/lib/gym-decor';
import { eqRects, entryPoints, linkRects, type Rect } from '@/lib/gym-geometry';
import { fixtureMesh, furnitureMesh, kit, linkMesh, personMesh, type Kit } from './studio-meshes';

export type ViewMode = 'plan' | 'orbit' | 'entrance' | 'eye' | 'stack' | 'exploded';
export type StudioSpec = {
  project: Project; option: DesignOption | null; catalog: Map<string, Equipment>;
  floorId: string; mode: ViewMode; selected: string | null;
  issues: Map<string, 'error' | 'warn'>;
  flows: { floorId: string; kind: 'member' | 'guest'; pts: [number, number][] }[];
  showClear: boolean;
  /** khu đang bị đông (mô phỏng): ô nhiệt */
  heat?: { floorId: string; cells: { x: number; z: number; v: number }[]; size: number } | null;
};
export type PersonView = { id: string; floorId: string; x: number; z: number; fx: number; fz: number; pose: 'walk' | 'stand' | 'sit' | 'lie' | 'run' | 'cycle' | 'chat' | 'wait' | 'lift'; color: string; selected?: boolean; y?: number };
export type Studio = {
  update: (s: StudioSpec) => void;
  setPeople: (p: PersonView[]) => void;
  resetView: () => void;
  setDetail: (on: boolean) => void;
  snapshot: (w?: number) => string;
  dispose: () => void;
};
type Cb = { select: (id: string | null) => void; move: (id: string, x: number, z: number) => void; pickPerson?: (id: string) => void };

type Obj = { obj: T.Object3D; sig: string; mats: T.MeshStandardMaterial[]; floorId: string; kind: 'eq' | 'fu' | 'fx' | 'ln'; locked: boolean; built?: T.Object3D; glb?: T.Object3D; eq?: Equipment };

export async function createStudio(el: HTMLElement, cb: Cb, opts: { detail?: boolean } = {}): Promise<Studio> {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
  const K: Kit = kit(THREE);
  let detail = opts.detail ?? true;

  // Không có WebGL → ném lỗi để giao diện chuyển sang mặt bằng 2D (SVG)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';

  const scene = new THREE.Scene();
  const persp = new THREE.PerspectiveCamera(42, 1, .05, 600);
  const ortho = new THREE.OrthographicCamera(-10, 10, 10, -10, .1, 600);
  let camera: T.Camera = persp;
  const orbit = new OrbitControls(persp, renderer.domElement);
  orbit.enableDamping = true; orbit.maxPolarAngle = Math.PI / 2.05; orbit.minDistance = .5;
  const planCtl = new OrbitControls(ortho, renderer.domElement);
  planCtl.enableRotate = false; planCtl.screenSpacePanning = true; planCtl.enabled = false;
  planCtl.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  planCtl.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };

  const hemi = new THREE.HemisphereLight(0xffffff, 0xc9d3ee, 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0005;
  scene.add(sun, sun.target);

  const root = new THREE.Group(); scene.add(root);
  const floorGroups = new Map<string, { g: T.Group; staticSig: string; stat: T.Group; walls: T.Object3D[]; overlay: T.Group }>();
  const objs = new Map<string, Obj>();
  let spec: StudioSpec | null = null;
  const peopleGroup = new THREE.Group(); root.add(peopleGroup);
  const people = new Map<string, { g: T.Group; floorId: string; pose: PersonView['pose']; view: PersonView }>();

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const glbCache = new Map<string, Promise<T.Object3D | null>>();
  const loadGlb = (url: string) => { if (!glbCache.has(url)) glbCache.set(url, loader.loadAsync(url).then(g => g.scene, () => null)); return glbCache.get(url)!; };

  /* ---------- Tầng: sàn + tường (đổi khi kích thước / phong cách đổi) ---------- */
  function styleOf(p: Project, f: Floor) { const st = INTERIOR_STYLES[p.brief.interior]; return f.accent ? { ...st, accentWall: f.accent } : st; }
  function buildStatic(p: Project, f: Floor) {
    const st = styleOf(p, f);
    const g = new THREE.Group();
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = st.floor; x.fillRect(0, 0, 128, 128);
    // sàn cao su: hạt lấm tấm (phong cách tối), lưới ô mờ
    if (p.brief.interior !== 'wellness') { let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,255,255,${.05 + rnd() * .12})`; x.fillRect(rnd() * 128, rnd() * 128, 1.5, 1.5); } }
    x.strokeStyle = st.grid; x.lineWidth = p.brief.interior === 'industrial' ? 1.5 : 3; x.globalAlpha = p.brief.interior === 'industrial' ? .5 : 1; x.strokeRect(1.5, 1.5, 125, 125); x.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(f.w / .5, f.l / .5); tex.anisotropy = 8; tex.colorSpace = THREE.SRGBColorSpace;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(f.w, .12, f.l), [K.mat('#9ca3af', .9), K.mat('#9ca3af', .9), new THREE.MeshStandardMaterial({ map: tex, roughness: .92 }), K.mat('#6b7280', .9), K.mat('#9ca3af', .9), K.mat('#9ca3af', .9)]);
    slab.position.y = -.06; slab.receiveShadow = true; slab.userData.floorSlab = f.id; g.add(slab);
    const H = f.h, T2 = .14;
    const wallM = K.mat(st.wall, .95), accM = K.mat(st.accentWall, .9);
    const walls: T.Object3D[] = [];
    const back = K.box(g, f.w + T2 * 2, H, T2, wallM, 0, 0, -f.l / 2 - T2 / 2); walls.push(back);
    const left = K.box(g, T2, H, f.l, accM, -f.w / 2 - T2 / 2, 0, 0); walls.push(left);
    const stripe = K.box(g, f.w, .14, .02, K.mat(p.brand.accent, .5), 0, 1.1, -f.l / 2 + .005, false); walls.push(stripe);
    if (p.brief.interior === 'industrial') {
      // trụ tường chia ô + hốc đèn ấm ở tường cuối (tinh thần video tham chiếu)
      const pil = K.mat('#3a3e45', .85);
      for (let x0 = -f.w / 2 + 1.3; x0 < f.w / 2 - .5; x0 += 2.6) walls.push(K.box(g, .32, H, .1, pil, x0, 0, -f.l / 2 + .05));
      for (let z0 = -f.l / 2 + 1.3; z0 < f.l / 2 - .5; z0 += 2.6) walls.push(K.box(g, .1, H, .32, pil, -f.w / 2 + .05, 0, z0));
      const warm = K.mat('#2a2522', .6, 0, { emissive: '#ffcf8a', emissiveIntensity: .3 });
      for (let x0 = -f.w / 2 + 2.6; x0 < f.w / 2 - 1.2; x0 += 2.6) walls.push(K.box(g, 1.2, .45, .04, warm, x0, Math.min(H - .7, 2.45), -f.l / 2 + .03, false));
    }
    K.box(g, f.w + T2 * 2, .12, T2, K.mat('#13244f', .6), 0, 0, f.l / 2 + T2 / 2);
    K.box(g, T2, .12, f.l + T2 * 2, K.mat('#13244f', .6), f.w / 2 + T2 / 2, 0, 0);
    // logo thương hiệu trên tường sau
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(f.w * .3, 4), .5), K.textPanel(p.brand.logoText, Math.min(f.w * .3, 4), .5, st.wall, p.brand.accent));
    logo.position.set(f.w * .2, Math.min(H - .5, 2.3), -f.l / 2 + .01); g.add(logo); walls.push(logo);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(f.w + .3, f.l + .3), K.mat(p.brief.interior === 'wellness' ? '#f4f2ee' : p.brief.interior === 'warm' ? '#3b3632' : '#15171b', .95, 0, { side: THREE.DoubleSide }));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = H; ceil.userData.ceilingPlane = true; ceil.visible = false; g.add(ceil);
    const overlay = new THREE.Group(); g.add(overlay);
    return { g, walls, overlay };
  }
  const floorSig = (p: Project, f: Floor) => JSON.stringify([f.w, f.l, f.h, f.accent, p.brief.interior, p.brand]);

  /* ---------- Vật trên sàn ---------- */
  const tint = (o: Obj, hex: number, k: number) => { for (const m of o.mats) { if (!('emissive' in m)) continue; m.emissive.setHex(hex); m.emissiveIntensity = k; } };
  function collectMats(obj: T.Object3D, clone = true) {
    const out: T.MeshStandardMaterial[] = [];
    obj.traverse(o => { const m = o as T.Mesh; if (m.isMesh && !(m.material as T.Material).transparent) { const mm = m.material as T.MeshStandardMaterial; if (mm && 'emissive' in mm) { if (clone) m.material = mm.clone(); out.push(m.material as T.MeshStandardMaterial); } } });
    return out;
  }
  async function showGlb(o: Obj) {
    const eq = o.eq;
    if (!eq?.model || o.glb) return;
    const src = await loadGlb(eq.model);
    if (!src || !detail || o.glb || !objs.has(o.obj.userData.id)) return;
    const w = eq.width / 100, d = eq.depth / 100, h = Math.max(eq.height / 100, .02);
    const m = src.clone(true);
    const bb = new THREE.Box3().setFromObject(m), size = bb.getSize(new THREE.Vector3());
    if (!size.x || !size.y || !size.z) return;
    // Co giãn ĐỀU (không méo mô hình): vừa khít khối kích thước thật
    const s = Math.min(w / size.x, d / size.z, h / size.y);
    m.scale.setScalar(s);
    const bb2 = new THREE.Box3().setFromObject(m), c = bb2.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -bb2.min.y, -c.z);
    m.traverse(x => { const mesh = x as T.Mesh; if (mesh.isMesh) mesh.castShadow = mesh.receiveShadow = true; });
    if (o.built) o.obj.remove(o.built);
    o.obj.add(m); o.glb = m; o.mats = collectMats(m);
    paint();
  }
  function hideGlb(o: Obj) { if (!o.glb || !o.built) return; o.obj.remove(o.glb); o.glb = undefined; o.obj.add(o.built); o.mats = collectMats(o.built, false); }

  function syncItems(p: Project, opt: DesignOption | null) {
    const seen = new Set<string>();
    const put = (id: string, floorId: string, kind: Obj['kind'], sig: string, make: () => { obj: T.Object3D; mats: T.MeshStandardMaterial[]; eq?: Equipment }, x: number, z: number, rot: number, locked: boolean, yOff = 0) => {
      seen.add(id);
      let o = objs.get(id);
      if (!o || o.sig !== sig || o.floorId !== floorId) {
        if (o) o.obj.parent?.remove(o.obj);
        const m = make();
        const holder = new THREE.Group(); holder.add(m.obj); holder.userData.id = id;
        if (sig.includes('"linear-light"')) holder.userData.ceiling = true;
        o = { obj: holder, sig, mats: m.mats, floorId, kind, locked, built: m.obj, eq: m.eq };
        objs.set(id, o);
        if (m.eq?.model && detail) void showGlb(o);
      }
      o.locked = locked;
      const fg = floorGroups.get(floorId);
      if (fg && o.obj.parent !== fg.g) fg.g.add(o.obj);
      if (!(drag && drag.id === id)) { o.obj.position.set(x, yOff, z); o.obj.rotation.y = (rot * Math.PI) / 2; }
    };
    for (const f of p.floors) {
      const st = styleOf(p, f);
      for (const fx of f.fixtures) put(fx.id, f.id, 'fx', JSON.stringify([fx.kind, fx.w, fx.d, f.h, fx.main, fx.label, p.brief.interior]), () => { const g = fixtureMesh(K, fx, f.h, st); return { obj: g, mats: collectMats(g) }; }, fx.x, fx.z, fx.rot, false);
      for (const ln of p.links) if (ln.floors.includes(f.id)) {
        const top = ln.floors[ln.floors.length - 1] === f.id && ln.floors.length > 1;
        put(`${ln.id}@${f.id}`, f.id, 'ln', JSON.stringify([ln.kind, ln.w, ln.d, f.h, top]), () => { const g = linkMesh(K, ln, f.h, top); return { obj: g, mats: collectMats(g) }; }, ln.x, ln.z, ln.rot, false);
      }
    }
    if (opt) {
      for (const pl of opt.placements) {
        const eq = spec!.catalog.get(pl.eqId);
        if (!eq) continue;
        put(pl.id, pl.floorId, 'eq', eq.id + '|' + eq.width + 'x' + eq.depth, () => { const b = buildModel(THREE, eq); return { obj: b.group, mats: b.mats, eq }; }, pl.x, pl.z, pl.rot, !!pl.locked);
      }
      for (const it of opt.furniture) {
        const f = p.floors.find(x => x.id === it.floorId);
        if (!f) continue;
        put(it.id, it.floorId, 'fu', JSON.stringify([it.kind, it.w, it.d, it.label, p.brief.interior, it.kind.startsWith('desk') || it.kind === 'brand-wall' || it.kind === 'kiosk' ? p.reception : 0, p.brand, f.h]), () => { const g = furnitureMesh(K, it, styleOf(p, f), p.reception, p.brand, f.h); return { obj: g, mats: collectMats(g) }; }, it.x, it.z, it.rot, !!it.locked);
      }
    }
    for (const [id, o] of objs) if (!seen.has(id)) { o.obj.parent?.remove(o.obj); objs.delete(id); }
  }

  /* ---------- Lớp phủ: khoảng trống vận hành, luồng đi, ô nhiệt, viền chọn ---------- */
  const rectMesh = (r: Rect, color: string, opacity: number, y = .015) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set((r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2); m.renderOrder = 2; return m;
  };
  const outline = (r: Rect, color: string, y = .03) => {
    const pts = [[r.x0, r.z0], [r.x1, r.z0], [r.x1, r.z1], [r.x0, r.z1], [r.x0, r.z0]].map(([x, z]) => new THREE.Vector3(x, y, z));
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color }));
  };
  function syncOverlay() {
    if (!spec) return;
    const { project: p, option: opt } = spec;
    for (const f of p.floors) {
      const fg = floorGroups.get(f.id);
      if (!fg) continue;
      fg.overlay.clear();
      if (opt) for (const pl of opt.placements) if (pl.floorId === f.id) {
        const eq = spec.catalog.get(pl.eqId);
        if (!eq) continue;
        const sel = spec.selected === pl.id;
        if (!(spec.showClear || sel)) continue;
        const pos = drag && drag.id === pl.id ? objs.get(pl.id)!.obj.position : { x: pl.x, z: pl.z };
        const { clear, body } = eqRects(eq, pos.x, pos.z, pl.rot);
        const bad = spec.issues.get(pl.id) === 'error';
        fg.overlay.add(rectMesh(clear, bad ? '#ef4444' : sel ? '#f26b1d' : '#60a5fa', sel ? .22 : .1));
        if (sel) fg.overlay.add(outline(body, bad ? '#b42318' : '#f26b1d'));
      }
      // viền đỏ cho vật có lỗi / đang chọn (nội thất, vật cố định)
      for (const [id, o] of objs) {
        if (o.floorId !== f.id || o.kind === 'eq') continue;
        const lvl = spec.issues.get(id.split('@')[0]), sel = spec.selected === id.split('@')[0];
        if (!lvl && !sel) continue;
        const bb = new THREE.Box3().setFromObject(o.obj);
        fg.overlay.add(outline({ x0: bb.min.x - fg.g.position.x, x1: bb.max.x - fg.g.position.x, z0: bb.min.z, z1: bb.max.z }, lvl === 'error' ? '#ef4444' : '#f26b1d', .05));
      }
      for (const fl of spec.flows) if (fl.floorId === f.id) {
        const pts = fl.pts.map(([x, z]) => new THREE.Vector3(x, .04, z));
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: fl.kind === 'member' ? '#16a34a' : '#2563eb', dashSize: .3, gapSize: .18 }));
        line.computeLineDistances(); fg.overlay.add(line);
        const end = pts[pts.length - 1], cone = new THREE.Mesh(new THREE.ConeGeometry(.14, .32, 12), new THREE.MeshBasicMaterial({ color: fl.kind === 'member' ? '#16a34a' : '#2563eb' }));
        const prev = pts[pts.length - 2]; cone.position.copy(end); cone.position.y = .06;
        cone.rotation.x = Math.PI / 2; cone.rotation.z = -Math.atan2(end.x - prev.x, end.z - prev.z) + Math.PI; fg.overlay.add(cone);
      }
      if (spec.heat && spec.heat.floorId === f.id) for (const c of spec.heat.cells) if (c.v > .05) {
        const s = spec.heat.size;
        fg.overlay.add(rectMesh({ x0: c.x - s / 2, x1: c.x + s / 2, z0: c.z - s / 2, z1: c.z + s / 2 }, c.v > .66 ? '#dc2626' : c.v > .33 ? '#f97316' : '#facc15', .18 + c.v * .4, .02));
      }
    }
  }

  /* ---------- Bố cục tầng theo góc xem ---------- */
  function layoutFloors() {
    if (!spec) return;
    const { project: p, mode, floorId } = spec;
    const sorted = [...p.floors].sort((a, b) => a.level - b.level);
    const active = p.floors.find(f => f.id === floorId) ?? sorted[0];
    const maxH = Math.max(...p.floors.map(f => f.h));
    let y = 0;
    for (const f of sorted) {
      const fg = floorGroups.get(f.id)!;
      const multi = mode === 'stack' || mode === 'exploded';
      fg.g.visible = multi ? (mode === 'exploded' || f.level <= active.level) : f.id === active.id;
      fg.g.position.y = multi ? (mode === 'exploded' ? f.level * (maxH + 3.5) : y) : 0;
      for (const w of fg.walls) w.visible = mode !== 'plan' && !(mode === 'stack' && f.id !== active.id) && mode !== 'exploded';
      y += f.h + .25;
    }
    for (const pg of people.values()) { const fg = floorGroups.get(pg.floorId); pg.g.visible = !!fg?.g.visible; }
    const close = mode === 'entrance' || mode === 'eye';
    for (const fg of floorGroups.values()) fg.g.traverse(o => { if (o.userData.ceilingPlane) o.visible = close; if ((o as T.Sprite).isSprite) o.visible = !close; if (o.userData.ceiling) o.visible = mode !== 'plan' && mode !== 'stack' && mode !== 'exploded'; });
  }

  let lastViewKey = '';
  function applyCamera(force = false) {
    if (!spec) return;
    const { project: p, mode, floorId } = spec;
    const f = p.floors.find(x => x.id === floorId) ?? p.floors[0];
    const key = `${mode}|${floorId}|${f.w}|${f.l}`;
    if (!force && key === lastViewKey) return;
    lastViewKey = key;
    const span = Math.max(f.w, f.l);
    orbit.enabled = mode !== 'plan'; planCtl.enabled = mode === 'plan';
    sun.position.set(span * .6, span * 1.4 + 10, span * .8); sun.target.position.set(0, 0, 0);
    const sc = sun.shadow.camera as T.OrthographicCamera; sc.left = sc.bottom = -span; sc.right = sc.top = span; sc.far = span * 6 + 60; sc.updateProjectionMatrix();
    const fy = floorGroups.get(f.id)?.g.position.y ?? 0;
    if (mode === 'plan') {
      camera = ortho;
      ortho.position.set(0, 60, 0); ortho.up.set(0, 0, -1); ortho.lookAt(0, 0, 0);
      planCtl.target.set(0, 0, 0); ortho.zoom = 1; fitOrtho(f); planCtl.update();
      return;
    }
    camera = persp;
    persp.fov = mode === 'entrance' || mode === 'eye' ? 62 : 42; persp.updateProjectionMatrix();
    orbit.minPolarAngle = 0; orbit.maxPolarAngle = Math.PI / 2.05; orbit.minDistance = .5; orbit.maxDistance = span * 4;
    if (mode === 'entrance' || mode === 'eye') {
      const ent = entryPoints(p, f)[0];
      const e = mode === 'entrance' ? ent ?? { x: 0, z: f.l / 2 - .5 } : { x: -f.w * .32, z: f.l * .3 };
      const n = mode === 'entrance' && ent ? wallOf(f, ent.x, ent.z).n : null;
      const dir = n ? new THREE.Vector3(n[0], 0, n[1]) : new THREE.Vector3(-e.x, 0, -e.z).normalize();
      if (n) { e.x -= n[0] * .6; e.z -= n[1] * .6; }
      if (!isFinite(dir.x)) dir.set(0, 0, -1);
      persp.position.set(e.x, fy + 1.6, e.z);
      orbit.target.set(e.x + dir.x * .6, fy + 1.5, e.z + dir.z * .6);
      orbit.minDistance = .3; orbit.maxDistance = 1.2; orbit.minPolarAngle = Math.PI / 2.6; orbit.maxPolarAngle = Math.PI / 1.85;
    } else if (mode === 'stack' || mode === 'exploded') {
      const total = mode === 'exploded' ? p.floors.length * (Math.max(...p.floors.map(x => x.h)) + 3.5) : p.floors.reduce((s, x) => s + x.h, 0);
      persp.position.set(span * 1.15, total * .6 + span * .75, span * 1.25);
      orbit.target.set(0, total * .35, 0);
    } else {
      persp.position.set(span * .72, fy + span * .9, span * 1.0);
      orbit.target.set(0, fy, 0);
    }
    orbit.update();
  }
  function fitOrtho(f: Floor) {
    const w = el.clientWidth || 600, h = el.clientHeight || 400, a = w / h;
    const needW = f.w + 2, needL = f.l + 2;
    const halfH = Math.max(needL / 2, needW / 2 / a);
    ortho.left = -halfH * a; ortho.right = halfH * a; ortho.top = halfH; ortho.bottom = -halfH; ortho.updateProjectionMatrix();
  }

  function paint() {
    if (!spec) return;
    for (const [id, o] of objs) {
      const lvl = spec.issues.get(id);
      const sel = spec.selected === id;
      tint(o, lvl === 'error' ? 0xb42318 : sel ? 0xf26b1d : 0, lvl === 'error' ? .55 : sel ? .3 : 0);
    }
  }

  function update(s: StudioSpec) {
    spec = s;
    const p = s.project;
    for (const f of p.floors) {
      const sig = floorSig(p, f);
      let fg = floorGroups.get(f.id);
      if (!fg || fg.staticSig !== sig) {
        if (fg) fg.g.remove(fg.stat);
        const b = buildStatic(p, f);
        if (!fg) { const g = new THREE.Group(); root.add(g); fg = { g, staticSig: sig, stat: b.g, walls: b.walls, overlay: b.overlay }; floorGroups.set(f.id, fg); }
        fg.g.add(b.g); fg.stat = b.g; fg.walls = b.walls; fg.overlay = b.overlay; fg.staticSig = sig;
      }
    }
    for (const [id, fg] of floorGroups) if (!p.floors.some(f => f.id === id)) { root.remove(fg.g); floorGroups.delete(id); }
    syncItems(p, s.option);
    layoutFloors();
    applyCamera();
    // ánh sáng theo phong cách
    const st = INTERIOR_STYLES[p.brief.interior];
    hemi.intensity = 1.05 * st.ambient; sun.intensity = 1.4 * st.lightPower; sun.color.set(st.light);
    syncOverlay();
    paint();
  }

  /* ---------- Chọn & kéo ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  let drag: { id: string; dx: number; dz: number; moved: boolean; pid: number } | null = null;
  const setRay = (e: PointerEvent) => { const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); };
  const activeFloorGroup = () => (spec ? floorGroups.get(spec.floorId) : undefined);
  const onDown = (e: PointerEvent) => {
    if (!spec || e.button > 0) return;
    setRay(e);
    // người (mô phỏng)
    const ph = ray.intersectObjects([...people.values()].filter(x => x.g.visible).map(x => x.g), true)[0];
    if (ph && cb.pickPerson) { let o: T.Object3D | null = ph.object; while (o && !o.userData.person) o = o.parent; if (o) { cb.pickPerson(o.userData.person); return; } }
    const fg = activeFloorGroup();
    const cands = [...objs.values()].filter(o => o.floorId === spec!.floorId && o.obj.visible).map(o => o.obj);
    const hits = ray.intersectObjects(cands, true);
    if (!hits.length) { cb.select(null); return; }
    let o: T.Object3D | null = hits[0].object;
    while (o && !o.userData.id) o = o.parent;
    if (!o) return;
    const id = String(o.userData.id).split('@')[0];
    cb.select(id);
    const rec = objs.get(o.userData.id);
    if (!rec || rec.locked || !fg) return;
    plane.constant = -fg.g.position.y;
    if (ray.ray.intersectPlane(plane, hit)) {
      drag = { id: o.userData.id, dx: hit.x - o.position.x, dz: hit.z - o.position.z, moved: false, pid: e.pointerId };
      orbit.enabled = false; planCtl.enabled = false;
      renderer.domElement.setPointerCapture(e.pointerId);
    }
  };
  const onMove = (e: PointerEvent) => {
    if (!drag || !spec) return;
    setRay(e);
    if (!ray.ray.intersectPlane(plane, hit)) return;
    const o = objs.get(drag.id)!;
    const snap = (v: number) => Math.round(v / .05) * .05;
    o.obj.position.x = snap(hit.x - drag.dx); o.obj.position.z = snap(hit.z - drag.dz);
    drag.moved = true;
    syncOverlay();
  };
  const onUp = () => {
    if (!drag) return;
    const o = objs.get(drag.id);
    const d = drag; drag = null;
    if (spec) { orbit.enabled = spec.mode !== 'plan'; planCtl.enabled = spec.mode === 'plan'; }
    if (o && d.moved) cb.move(d.id.split('@')[0], Math.round(o.obj.position.x * 100) / 100, Math.round(o.obj.position.z * 100) / 100);
  };
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointercancel', onUp);

  /* ---------- Nhân vật mô phỏng ---------- */
  function setPeople(list: PersonView[]) {
    const seen = new Set<string>();
    for (const v of list) {
      seen.add(v.id);
      let pg = people.get(v.id);
      if (!pg) { const g = personMesh(K, v.color); g.userData.person = v.id; peopleGroup.add(g); pg = { g, floorId: v.floorId, pose: v.pose, view: v }; people.set(v.id, pg); }
      pg.view = v; pg.floorId = v.floorId; pg.pose = v.pose;
      const fg = floorGroups.get(v.floorId);
      pg.g.visible = !!fg?.g.visible;
      pg.g.position.set(v.x, (fg?.g.position.y ?? 0) + (v.y ?? 0), v.z);
      pg.g.rotation.y = Math.atan2(v.fx, v.fz);
      const head = pg.g.userData.parts.head as T.Mesh;
      (head.material as T.MeshStandardMaterial).emissive?.setHex(v.selected ? 0xf26b1d : 0);
    }
    for (const [id, pg] of people) if (!seen.has(id)) { peopleGroup.remove(pg.g); people.delete(id); }
  }
  function animatePeople(t: number) {
    for (const pg of people.values()) {
      const { torso, head, legL, legR } = pg.g.userData.parts as Record<string, T.Mesh>;
      const ph = (pg.g.id % 7) * .7;
      torso.rotation.set(0, 0, 0); torso.position.set(0, 1.1, 0); head.position.set(0, 1.55, 0); legL.rotation.set(0, 0, 0); legR.rotation.set(0, 0, 0); legL.position.set(-.08, .45, 0); legR.position.set(.08, .45, 0);
      pg.g.children.forEach(c => (c.rotation.x = c === torso ? 0 : c.rotation.x));
      switch (pg.pose) {
        case 'walk': case 'run': { const sp = pg.pose === 'run' ? 11 : 6, a = Math.sin(t * sp + ph) * (pg.pose === 'run' ? .7 : .45); legL.rotation.x = a; legR.rotation.x = -a; torso.position.y += Math.abs(Math.sin(t * sp + ph)) * .03; if (pg.pose === 'run') { torso.position.y += .25; head.position.y += .25; legL.position.y += .25; legR.position.y += .25; } break; }
        case 'cycle': { torso.position.y = .95; head.position.y = 1.4; const a = Math.sin(t * 7 + ph) * .6; legL.rotation.x = -1.1 + a; legR.rotation.x = -1.1 - a; legL.position.y = legR.position.y = .62; break; }
        case 'sit': torso.position.y = .85; head.position.y = 1.3; legL.rotation.x = legR.rotation.x = -1.4; legL.position.set(-.08, .5, .2); legR.position.set(.08, .5, .2); if (Math.sin(t * 2 + ph) > .3) torso.rotation.x = -.15; break;
        case 'lie': pg.g.children.forEach(c => { c.rotation.x = -Math.PI / 2; }); torso.position.set(0, .6, -.1); head.position.set(0, .62, -.52); legL.position.set(-.08, .55, .45); legR.position.set(.08, .55, .45); break;
        case 'lift': { const a = (Math.sin(t * 3 + ph) + 1) / 2; torso.position.y = 1.1 - a * .25; head.position.y = 1.55 - a * .25; legL.rotation.x = a * .5; legR.rotation.x = a * .5; break; }
        case 'chat': head.rotation.y = Math.sin(t * 1.5 + ph) * .3; break;
        case 'wait': torso.rotation.z = Math.sin(t + ph) * .04; break;
      }
    }
  }

  /* ---------- Vòng vẽ ---------- */
  const resize = () => { const w = el.clientWidth || 600, h = el.clientHeight || 400; renderer.setSize(w, h, false); persp.aspect = w / h; persp.updateProjectionMatrix(); if (spec) { const f = spec.project.floors.find(x => x.id === spec!.floorId); if (f && spec.mode === 'plan') fitOrtho(f); } };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let frame = 0;
  const clock = new THREE.Clock();
  const loop = () => { frame = requestAnimationFrame(loop); const t = clock.getElapsedTime(); if (orbit.enabled) orbit.update(); if (planCtl.enabled) planCtl.update(); if (people.size) animatePeople(t); renderer.render(scene, camera); };
  loop();

  return {
    update,
    setPeople,
    resetView: () => applyCamera(true),
    setDetail(on) { detail = on; for (const o of objs.values()) if (o.eq?.model) { if (on) void showGlb(o); else hideGlb(o); } paint(); },
    snapshot(w = 1280) {
      const cw = renderer.domElement.width, chh = renderer.domElement.height;
      renderer.render(scene, camera);
      const src = renderer.domElement;
      const c = document.createElement('canvas'); c.width = Math.min(w, cw); c.height = Math.round(c.width * chh / cw);
      const x = c.getContext('2d')!; x.fillStyle = '#eef2f9'; x.fillRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', .78);
    },
    dispose() {
      cancelAnimationFrame(frame); ro.disconnect(); orbit.dispose(); planCtl.dispose();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      renderer.dispose(); renderer.domElement.remove();
    }
  };
}

/** Cửa chính của tầng có lối vào (để giao diện đặt điểm nhìn "từ cửa vào") */
export const mainDoor = (p: Project) => { const f = entranceFloor(p); return f.fixtures.find(x => x.kind === 'door' && x.main) ?? f.fixtures.find(x => x.kind === 'door'); };
export { wallOf, linkRects, footOf };
