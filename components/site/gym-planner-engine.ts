/**
 * Bộ máy 3D của phòng lab setup phòng gym (components/site/GymPlanner.tsx).
 * Đơn vị: mét. Sàn W × L chia ô gạch `tile` (m). Máy là khối hộp theo kích thước thật (hoặc mô hình .glb nếu có),
 * (mô hình dựng sẵn theo loại máy, hoặc file .glb), bám ô gạch khi kéo, xoay 90°, tô đỏ khi chồng nhau hoặc ra ngoài phòng.
 */
import type * as T from 'three';
import type { Equipment } from '@/lib/equipment';
import { buildModel } from './gym-planner-models';

export type Placed = { uid: string; eqId: string; x: number; z: number; rot: number; bad: boolean };
type Item = { uid: string; eq: Equipment; group: T.Group; x: number; z: number; rot: number; bad: boolean; mats: T.MeshStandardMaterial[] };
export type Engine = {
  setRoom: (w: number, l: number, tile: number) => void;
  add: (eq: Equipment, at?: { x: number; z: number; rot: number }) => string;
  remove: (uid: string) => void;
  rotate: (uid: string) => void;
  duplicate: (uid: string) => void;
  select: (uid: string | null) => void;
  clear: () => void;
  resetView: () => void;
  dispose: () => void;
};

export async function createEngine(el: HTMLElement, cb: { change: (items: Placed[]) => void; select: (uid: string | null) => void }): Promise<Engine> {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

  let W = 10, L = 10, tile = 0.4;
  const items: Item[] = [];
  let selected: string | null = null;
  let seq = 0;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 3;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d3ee, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  // Sàn: một viên gạch vẽ trên canvas, lặp theo kích thước ô
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = tileCanvas.height = 128;
  const g = tileCanvas.getContext('2d')!;
  g.fillStyle = '#eef1f6'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#c3cbdb'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 125, 125);
  const tex = new THREE.CanvasTexture(tileCanvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const walls = new THREE.Group();
  scene.add(walls);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf7f8fb, roughness: .95 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x13244f, roughness: .6 });

  function buildRoom() {
    floor.scale.set(W, L, 1);
    tex.repeat.set(W / tile, L / tile);
    tex.needsUpdate = true;
    walls.clear();
    const H = 2.8, T2 = 0.12;
    const back = new THREE.Mesh(new THREE.BoxGeometry(W + T2 * 2, H, T2), wallMat); back.position.set(0, H / 2, -L / 2 - T2 / 2);
    const left = new THREE.Mesh(new THREE.BoxGeometry(T2, H, L), wallMat); left.position.set(-W / 2 - T2 / 2, H / 2, 0);
    back.receiveShadow = left.receiveShadow = true;
    const trimF = new THREE.Mesh(new THREE.BoxGeometry(W + T2 * 2, 0.1, T2), trimMat); trimF.position.set(0, 0.05, L / 2 + T2 / 2);
    const trimR = new THREE.Mesh(new THREE.BoxGeometry(T2, 0.1, L + T2 * 2), trimMat); trimR.position.set(W / 2 + T2 / 2, 0.05, 0);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(W + T2 * 2, 0.18, T2 + .01), new THREE.MeshStandardMaterial({ color: 0xf26b1d })); stripe.position.set(0, 1.1, -L / 2 - T2 / 2);
    walls.add(back, left, trimF, trimR, stripe);
    const span = Math.max(W, L);
    sun.position.set(span * .6, span * 1.2, span * .8);
    const c = sun.shadow.camera as T.OrthographicCamera;
    c.left = c.bottom = -span; c.right = c.top = span; c.far = span * 4; c.updateProjectionMatrix();
    items.forEach(it => place(it, it.x, it.z));
    check();
  }
  function resetView() {
    const span = Math.max(W, L);
    camera.position.set(span * .75, span * .95, span * 1.05);
    controls.target.set(0, 0, 0);
    controls.maxDistance = span * 3;
    controls.update();
  }

  /** Kích thước chiếm sàn (m) theo hướng xoay */
  const foot = (it: Item) => (it.rot % 2 ? [it.eq.depth / 100, it.eq.width / 100] : [it.eq.width / 100, it.eq.depth / 100]);
  function place(it: Item, x: number, z: number) {
    const [fw, fd] = foot(it);
    // mép trái / trên bám lưới ô gạch, giữ trong phòng
    let minX = Math.round((x - fw / 2 + W / 2) / tile) * tile - W / 2;
    let minZ = Math.round((z - fd / 2 + L / 2) / tile) * tile - L / 2;
    minX = Math.min(Math.max(minX, -W / 2), W / 2 - fw);
    minZ = Math.min(Math.max(minZ, -L / 2), L / 2 - fd);
    it.x = minX + fw / 2; it.z = minZ + fd / 2;
    it.group.position.set(it.x, 0, it.z);
    it.group.rotation.y = (it.rot * Math.PI) / 2;
  }
  function check() {
    for (const a of items) {
      const [aw, ad] = foot(a);
      const out = aw > W + 1e-6 || ad > L + 1e-6;
      const hit = items.some(b => {
        if (b === a) return false;
        const [bw, bd] = foot(b);
        return Math.abs(a.x - b.x) < (aw + bw) / 2 - 1e-3 && Math.abs(a.z - b.z) < (ad + bd) / 2 - 1e-3;
      });
      a.bad = out || hit;
      for (const m of a.mats) m.emissive.setHex(a.bad ? 0xb42318 : a.uid === selected ? 0xf26b1d : 0x000000);
      for (const m of a.mats) m.emissiveIntensity = a.bad ? .55 : a.uid === selected ? .35 : 0;
    }
    cb.change(items.map(({ uid, eq, x, z, rot, bad }) => ({ uid, eqId: eq.id, x, z, rot, bad })));
  }

  const loader = new GLTFLoader();
  function makeItem(eq: Equipment): Item {
    // Mô hình dựng sẵn theo loại máy (gym-planner-models.ts); có file .glb thì thay bằng file đó khi tải xong
    const w = eq.width / 100, d = eq.depth / 100, h = Math.max(eq.height / 100, 0.02);
    const built = buildModel(THREE, eq);
    const group = new THREE.Group();
    const box = built.group;
    group.add(box);
    const it: Item = { uid: 'i' + ++seq, eq, group, x: 0, z: 0, rot: 0, bad: false, mats: built.mats };
    group.userData.uid = it.uid;
    if (eq.model) {
      loader.load(eq.model, gltf => {
        const m = gltf.scene;
        const bb = new THREE.Box3().setFromObject(m), size = bb.getSize(new THREE.Vector3());
        if (!size.x || !size.y || !size.z) return;
        m.scale.set(w / size.x, h / size.y, d / size.z);
        const bb2 = new THREE.Box3().setFromObject(m), c = bb2.getCenter(new THREE.Vector3());
        m.position.set(-c.x, -bb2.min.y, -c.z);
        const mats: T.MeshStandardMaterial[] = [];
        m.traverse(o => { const mesh = o as T.Mesh; if (mesh.isMesh) { mesh.castShadow = mesh.receiveShadow = true; const mm = mesh.material as T.MeshStandardMaterial; if (mm && 'emissive' in mm) { mesh.material = mm.clone(); mats.push(mesh.material as T.MeshStandardMaterial); } } });
        group.remove(box);
        group.add(m);
        it.mats = mats.length ? mats : it.mats;
        check();
      }, undefined, () => { /* lỗi tải mô hình → giữ khối hộp */ });
    }
    return it;
  }
  /** Chỗ trống đầu tiên quét theo ô gạch từ góc phòng */
  function freeSpot(it: Item): [number, number] {
    const [fw, fd] = foot(it);
    for (let zz = -L / 2; zz + fd <= L / 2 + 1e-6; zz += tile) for (let xx = -W / 2; xx + fw <= W / 2 + 1e-6; xx += tile) {
      const cx = xx + fw / 2, cz = zz + fd / 2;
      if (!items.some(b => { const [bw, bd] = foot(b); return Math.abs(cx - b.x) < (fw + bw) / 2 - 1e-3 && Math.abs(cz - b.z) < (fd + bd) / 2 - 1e-3; })) return [cx, cz];
    }
    return [0, 0];
  }

  function add(eq: Equipment, at?: { x: number; z: number; rot: number }) {
    const it = makeItem(eq);
    it.rot = at?.rot ?? 0;
    scene.add(it.group);
    const [x, z] = at ? [at.x, at.z] : freeSpot(it);
    place(it, x, z);
    items.push(it);
    if (!at) select(it.uid); else check();
    return it.uid;
  }
  function remove(uid: string) {
    const i = items.findIndex(x => x.uid === uid);
    if (i < 0) return;
    scene.remove(items[i].group);
    items.splice(i, 1);
    if (selected === uid) select(null); else check();
  }
  function rotate(uid: string) {
    const it = items.find(x => x.uid === uid);
    if (!it) return;
    it.rot = (it.rot + 1) % 4;
    place(it, it.x, it.z);
    check();
  }
  function duplicate(uid: string) { const it = items.find(x => x.uid === uid); if (it) add(it.eq); }
  function select(uid: string | null) { selected = uid; check(); cb.select(uid); }
  function clear() { for (const it of items) scene.remove(it.group); items.length = 0; select(null); }

  // Chọn & kéo máy trên sàn
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
  let drag: { it: Item; dx: number; dz: number } | null = null;
  const setRay = (e: PointerEvent) => { const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); };
  const onDown = (e: PointerEvent) => {
    setRay(e);
    const hits = ray.intersectObjects(items.map(i => i.group), true);
    if (!hits.length) { select(null); return; }
    let o: T.Object3D | null = hits[0].object;
    while (o && !o.userData.uid) o = o.parent;
    const it = items.find(i => i.uid === o?.userData.uid);
    if (!it) return;
    select(it.uid);
    if (ray.ray.intersectPlane(plane, hitP)) { drag = { it, dx: hitP.x - it.x, dz: hitP.z - it.z }; controls.enabled = false; renderer.domElement.setPointerCapture(e.pointerId); }
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    setRay(e);
    if (ray.ray.intersectPlane(plane, hitP)) { place(drag.it, hitP.x - drag.dx, hitP.z - drag.dz); check(); }
  };
  const onUp = () => { if (drag) { drag = null; controls.enabled = true; check(); } };
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointercancel', onUp);

  const resize = () => { const w = el.clientWidth || 600, h = el.clientHeight || 400; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize);
  ro.observe(el);
  resize();
  let frame = 0;
  const loop = () => { frame = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); };
  loop();

  buildRoom(); resetView();
  return {
    setRoom(w, l, t) { const first = W === 10 && L === 10 && !items.length; W = w; L = l; tile = t; buildRoom(); if (first) resetView(); },
    add, remove, rotate, duplicate, select, clear, resetView,
    dispose() {
      cancelAnimationFrame(frame); ro.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      renderer.dispose(); renderer.domElement.remove();
    }
  };
}
