'use client';
/**
 * Sa bàn 3D văn phòng DANAVA (Three.js, dựng bằng code) theo ảnh thật phòng họp tại Đà Nẵng.
 * Phòng chữ nhật dài: bàn họp chạy dọc về TV trên vách cuối; vách lam gỗ sẫm xen tấm vân sáng; viền trần giật cấp
 * có đèn hắt và đèn âm trần; ghế đen chân quỳ khung inox, tay vịn cong; cửa gỗ + khung chứng nhận bên trái;
 * ghế tiếp khách khung gỗ đệm caro đỏ phía trước trái; bàn làm việc gỗ tối có cờ Việt Nam phía trước phải;
 * cửa kính khung tối + cây môn lá lớn bên phải; tủ thờ gỗ góc sau phải.
 * Góc nhìn 3/4 phía trước-trái, hơi cao; vách nằm giữa người xem và nội thất tự mờ khi xoay.
 * Màn mở đầu ~3,6 s: đế → vách → nội thất → đèn + TV → camera dừng ở góc đẹp. Sau đó chỉ còn cây khẽ lay.
 * Kéo xoay có giới hạn, tự về góc ban đầu (hoặc bấm nút). Giảm chuyển động: khung tĩnh. Không có WebGL: ảnh thật.
 */
import { useEffect, useRef, useState } from 'react';
import type * as T from 'three';

type Ctl = { reset: () => void; dispose: () => void };

export function OfficeScene({ fallback }: { fallback: string }) {
  const host = useRef<HTMLDivElement>(null);
  const ctl = useRef<Ctl | null>(null);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    (async () => {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
      const [THREE, rb, env] = await Promise.all([
        import('three'),
        import('three/examples/jsm/geometries/RoundedBoxGeometry.js'),
        import('three/examples/jsm/environments/RoomEnvironment.js')
      ]);
      if (dead) return;
      ctl.current = build(THREE, rb.RoundedBoxGeometry, env.RoomEnvironment, el, {
        ready: () => setReady(true),
        moved: (m: boolean) => setMoved(m)
      });
    })();
    return () => { dead = true; ctl.current?.dispose(); ctl.current = null; };
  }, []);

  return (
    <div className={`hb-office${ready ? ' is-ready' : ''}`}>
      <div className="hb-office__stage" ref={host} role="img" aria-label="Mô hình 3D văn phòng DANAVA tại Đà Nẵng: phòng họp dài với bàn họp, ghế chân quỳ, TV trên vách lam gỗ, ghế tiếp khách, bàn làm việc có cờ Việt Nam và cửa kính nhìn ra cây xanh">
        <img className="hb-office__fallback" src={fallback} alt="" width={1100} height={825} />
      </div>
      <p className="hb-office__hint" aria-hidden={!ready}>
        {moved
          ? <button type="button" onClick={() => ctl.current?.reset()}>↺ Về góc nhìn ban đầu</button>
          : <span>Kéo để xoay mô hình</span>}
      </p>
    </div>
  );
}

type RBCtor = new (w?: number, h?: number, d?: number, seg?: number, r?: number) => T.BufferGeometry;
type EnvCtor = new () => T.Scene;

function build(THREE: typeof import('three'), RoundedBox: RBCtor, RoomEnv: EnvCtor, el: HTMLElement, cb: { ready: () => void; moved: (m: boolean) => void }): Ctl {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const canvas = renderer.domElement;
  canvas.className = 'hb-office__canvas';
  el.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnv(), .04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = .55;
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 120);

  /* ================= kết cấu vẽ bằng canvas ================= */
  const disposables: { dispose: () => void }[] = [];
  const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d')!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
    disposables.push(t);
    return t;
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  /** Vân gỗ: nền + nhiều sợi vân mảnh lượn nhẹ, biến thiên sắc độ */
  const grain = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, base: string, dark: string, vertical = true, lines = 40) => {
    c.fillStyle = base; c.fillRect(x, y, w, h);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    for (let i = 0; i < lines; i++) {
      c.strokeStyle = dark; c.globalAlpha = .06 + rnd() * .14; c.lineWidth = .6 + rnd() * 1.6;
      c.beginPath();
      const o = (vertical ? x : y) + rnd() * (vertical ? w : h), amp = 1 + rnd() * 3, f = .01 + rnd() * .03;
      for (let k = 0; k <= (vertical ? h : w); k += 6) {
        const d = o + Math.sin(k * f + i) * amp;
        if (vertical) c.lineTo(d, y + k); else c.lineTo(x + k, d);
      }
      c.stroke();
    }
    c.restore(); c.globalAlpha = 1;
  };
  // Sàn: gạch giả gỗ chữ nhật so le, tông mật ong ấm (giảm cam)
  const floorTex = canvasTex(1024, 1024, c => {
    const tones = ['#b78b60', '#c39a6e', '#a97f57', '#bd9266', '#c8a074', '#b08660'];
    const tw = 128, th = 512;
    c.fillStyle = tones[0]; c.fillRect(0, 0, 1024, 1024);
    for (let col = 0; col < 1024 / tw; col++) {
      const off = Math.floor(rnd() * th);
      for (let y = -off; y < 1024; y += th) {
        grain(c, col * tw, y, tw, th, tones[Math.floor(rnd() * tones.length)], '#5a3a22', true, 22);
        c.fillStyle = 'rgba(70,45,25,.28)'; c.fillRect(col * tw, y, tw, 2);
      }
      c.fillStyle = 'rgba(70,45,25,.22)'; c.fillRect(col * tw, 0, 2, 1024);
    }
  }, [1.3, 2.1]);
  const slatTex = canvasTex(64, 512, c => grain(c, 0, 0, 64, 512, '#4a3022', '#1f130c', true, 30));
  const panelTex = canvasTex(256, 512, c => grain(c, 0, 0, 256, 512, '#d8d1c6', '#8f877b', true, 70), [1, 1]);
  const tableTex = canvasTex(512, 512, c => { grain(c, 0, 0, 512, 512, '#5b5751', '#2c2a27', false, 60); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 254, 512, 4); });
  const deskTex = canvasTex(512, 256, c => grain(c, 0, 0, 512, 256, '#4a2f22', '#1d110a', false, 50));
  const doorTex = canvasTex(256, 512, c => grain(c, 0, 0, 256, 512, '#94512a', '#4a230f', true, 40));
  const lightWood = canvasTex(256, 256, c => grain(c, 0, 0, 256, 256, '#a8683a', '#5a2f14', true, 30));
  const sofaTex = canvasTex(256, 256, c => {
    c.fillStyle = '#f4eee6'; c.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      if ((x + y * 3) % 3 === 0) { c.fillStyle = '#b11f2a'; c.fillRect(x * 32 + 3, y * 32 + 3, 26, 14); }
      if ((x * 2 + y) % 4 === 1) { c.fillStyle = '#c8303b'; c.fillRect(x * 32 + 6, y * 32 + 18, 12, 12); }
    }
  });
  const certTex = canvasTex(96, 128, c => {
    c.fillStyle = '#7a5a2a'; c.fillRect(0, 0, 96, 128);
    c.fillStyle = '#fbf6e8'; c.fillRect(8, 8, 80, 112);
    c.fillStyle = '#b8323b'; c.fillRect(18, 20, 60, 6);
    c.fillStyle = '#c9a85a'; for (let i = 0; i < 6; i++) c.fillRect(18, 36 + i * 10, 60 - (i % 3) * 12, 3);
    c.beginPath(); c.fillStyle = '#d9b34a'; c.arc(70, 102, 9, 0, 7); c.fill();
  });
  const flagTex = canvasTex(180, 120, c => {
    c.fillStyle = '#da251d'; c.fillRect(0, 0, 180, 120);
    c.fillStyle = '#ffde00'; c.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 14 : 36, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(90 + r * Math.cos(a), 60 + r * Math.sin(a)); }
    c.fill();
  });
  const leafTex = canvasTex(256, 256, c => {
    const g = c.createLinearGradient(0, 256, 0, 0); g.addColorStop(0, '#2f7d3f'); g.addColorStop(1, '#5fb565');
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    c.strokeStyle = 'rgba(220,255,210,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(128, 230); c.lineTo(128, 10); c.stroke();
    c.lineWidth = 1.6; c.strokeStyle = 'rgba(210,250,200,.38)';
    for (let i = 0; i < 9; i++) { const y = 210 - i * 22; c.beginPath(); c.moveTo(128, y); c.quadraticCurveTo(80, y - 18, 20, y - 30); c.moveTo(128, y); c.quadraticCurveTo(176, y - 18, 236, y - 30); c.stroke(); }
  });
  const shadowTex = canvasTex(128, 128, c => {
    const g = c.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  });
  // Màn hình TV: nhận diện DANAVA (logo thật nạp xong thì vẽ đè)
  const tvCanvas = document.createElement('canvas'); tvCanvas.width = 1024; tvCanvas.height = 576;
  const drawTV = (logo?: HTMLImageElement) => {
    const c = tvCanvas.getContext('2d')!;
    const g = c.createLinearGradient(0, 0, 1024, 576); g.addColorStop(0, '#16275e'); g.addColorStop(1, '#2b4294');
    c.fillStyle = g; c.fillRect(0, 0, 1024, 576);
    c.fillStyle = '#f26b1d'; c.beginPath(); c.moveTo(690, 0); c.lineTo(760, 0); c.lineTo(560, 576); c.lineTo(490, 576); c.fill();
    c.fillStyle = 'rgba(255,179,71,.35)'; c.beginPath(); c.moveTo(790, 0); c.lineTo(812, 0); c.lineTo(612, 576); c.lineTo(590, 576); c.fill();
    if (logo) c.drawImage(logo, 70, 190, 554 * .78, 135 * .78);
    c.fillStyle = '#ffd27a'; c.font = '600 30px sans-serif'; c.fillText('Growing Your Business Together', 76, 350);
  };
  drawTV();
  const tvTex = new THREE.CanvasTexture(tvCanvas); tvTex.colorSpace = THREE.SRGBColorSpace; tvTex.anisotropy = 8; disposables.push(tvTex);
  const logoImg = new Image(); logoImg.onload = () => { drawTV(logoImg); tvTex.needsUpdate = true; wake(); }; logoImg.src = '/assets/danava-logo-light.png';

  /* ================= vật liệu ================= */
  const std = (o: T.MeshStandardMaterialParameters) => { const m = new THREE.MeshStandardMaterial(o); disposables.push(m); return m; };
  const phys = (o: T.MeshPhysicalMaterialParameters) => { const m = new THREE.MeshPhysicalMaterial(o); disposables.push(m); return m; };
  const M = {
    floor: std({ map: floorTex, roughness: .38, metalness: 0 }),
    slat: std({ map: slatTex, roughness: .55 }),
    slatBack: std({ color: 0x1e140e, roughness: .8 }),
    panel: () => std({ map: panelTex, roughness: .8, transparent: true }),
    rim: std({ map: slatTex, roughness: .5 }),
    ceilingEdge: std({ color: 0xf1ece4, roughness: .9 }),
    cove: std({ color: 0xfff1d6, emissive: 0xffe2b0, emissiveIntensity: 0 }),
    downlight: std({ color: 0xfff7e6, emissive: 0xfff0cc, emissiveIntensity: 0 }),
    table: std({ map: tableTex, roughness: .42 }),
    frameBlack: std({ color: 0x15161a, roughness: .35, metalness: .55 }),
    fabric: std({ color: 0x17181c, roughness: .92 }),
    mesh: std({ color: 0x1b1c21, roughness: .8, metalness: .1 }),
    chrome: std({ color: 0xe8ebee, roughness: .16, metalness: 1 }),
    desk: std({ map: deskTex, roughness: .28 }),
    door: std({ map: doorTex, roughness: .22 }),
    doorGlass: phys({ color: 0xdfe8ec, roughness: .35, transmission: .6, transparent: true, opacity: .7 }),
    lightWood: std({ map: lightWood, roughness: .35 }),
    sofa: std({ map: sofaTex, roughness: .9 }),
    winFrame: std({ color: 0x2b2e34, roughness: .35, metalness: .6 }),
    glass: phys({ color: 0xeaf6fb, roughness: .04, metalness: 0, transmission: .92, thickness: .02, ior: 1.45, transparent: true, opacity: .32 }),
    blind: std({ color: 0x8e9196, roughness: .5, metalness: .4 }),
    tvBody: std({ color: 0x0c0d10, roughness: .3, metalness: .3 }),
    tvScreen: std({ map: tvTex, emissive: 0xffffff, emissiveMap: tvTex, emissiveIntensity: 0, color: 0x050608, roughness: .25 }),
    gold: std({ color: 0xd7b45a, roughness: .25, metalness: 1 }),
    granite: std({ color: 0x23272e, roughness: .18, metalness: .2 }),
    red: std({ color: 0x7a1a1a, roughness: .35 }),
    white: std({ color: 0xf6f3ec, roughness: .6 }),
    clearGlass: phys({ color: 0xffffff, roughness: .05, transmission: .95, transparent: true, opacity: .4 }),
    leaf: std({ map: leafTex, roughness: .55, side: THREE.DoubleSide }),
    stem: std({ color: 0x5f8a45, roughness: .6 }),
    pot: std({ color: 0x6b6e75, roughness: .85 }),
    soil: std({ color: 0x3a2c22, roughness: 1 }),
    base: std({ color: 0xfbf6ee, roughness: .75 }),
    baseNavy: std({ color: 0x13244f, roughness: .45 }),
    baseOrange: std({ color: 0xf26b1d, roughness: .4, emissive: 0xf26b1d, emissiveIntensity: .15 }),
    shadow: (() => { const m = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .8 }); disposables.push(m); return m; })(),
    flag: std({ map: flagTex, side: THREE.DoubleSide, roughness: .8 }),
    cert: std({ map: certTex, roughness: .5 }),
    altar: std({ map: lightWood, roughness: .3, color: 0xc08050 })
  };

  /* ================= tiện ích hình khối ================= */
  const geos: T.BufferGeometry[] = [];
  const g = <G extends T.BufferGeometry>(x: G) => { geos.push(x); return x; };
  const add = (parent: T.Object3D, geo: T.BufferGeometry, mat: T.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, cast = true) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  const rbox = (w: number, h: number, d: number, r = .015) => g(new RoundedBox(w, h, d, 3, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001)));
  const bx = (w: number, h: number, d: number) => g(new THREE.BoxGeometry(w, h, d));
  const tube = (pts: [number, number, number][], r = .012) => g(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 48, r, 10, false));
  const contact = (parent: T.Object3D, w: number, d: number, x: number, z: number, o = .8) => {
    const m = new THREE.Mesh(g(new THREE.PlaneGeometry(w, d)), M.shadow); m.rotation.x = -Math.PI / 2; m.position.set(x, .004, z); m.renderOrder = 1;
    (m.material as T.MeshBasicMaterial).opacity = o; parent.add(m); return m;
  };

  /* ================= kích thước phòng ================= */
  const W = 4.2, D = 6.6, H = 2.55, TH = .08;
  const L = -W / 2, R = W / 2, BK = -D / 2, FR = D / 2;
  const model = new THREE.Group(); scene.add(model);

  // Trình tự xuất hiện
  type Stage = { obj: T.Object3D; kind: 'base' | 'rise' | 'drop'; at: number; dur: number; y0: number };
  const stages: Stage[] = [];
  const stage = (obj: T.Object3D, kind: Stage['kind'], at: number, dur = .6) => { stages.push({ obj, kind, at, dur, y0: obj.position.y }); return obj; };

  /* ---------- đế mô hình: mỏng, sạch, vạch navy + cam ---------- */
  const base = new THREE.Group(); model.add(base);
  add(base, rbox(W + .5, .1, D + .5, .04), M.base, 0, -.09, 0);
  add(base, rbox(W + .54, .025, D + .54, .01), M.baseOrange, 0, -.15, 0);
  add(base, rbox(W + .58, .08, D + .58, .03), M.baseNavy, 0, -.2, 0);
  add(base, bx(W, .04, D), M.floor, 0, -.02, 0, 0, 0, 0, false);
  stage(base, 'base', 0, .7);

  /* ---------- vách (gốc ở chân để "dựng lên") ---------- */
  type Wall = { group: T.Group; normal: T.Vector3; center: T.Vector3; mats: T.Material[]; extras: T.Object3D[]; shown: boolean };
  const walls: Wall[] = [];
  const wall = (center: [number, number, number], normal: [number, number, number]) => {
    const grp = new THREE.Group(); grp.position.set(center[0], 0, center[2]); model.add(grp);
    const w: Wall = { group: grp, normal: new THREE.Vector3(...normal), center: new THREE.Vector3(center[0], H / 2, center[2]), mats: [], extras: [], shown: true };
    walls.push(w); return w;
  };
  const fadeable = (w: Wall, m: T.Material) => { const c = m.clone(); c.transparent = true; disposables.push(c); w.mats.push(c); return c; };
  const slatRun = (parent: T.Object3D, len: number, along: 'x' | 'z', h: number, y0: number, depthDir: number, slatMat: T.Material = M.slat, backMat: T.Material = M.slatBack) => {
    const n = Math.round(len / .07);
    const geo = g(new THREE.BoxGeometry(along === 'x' ? .045 : .03, h, along === 'x' ? .03 : .045));
    const inst = new THREE.InstancedMesh(geo, slatMat, n); inst.castShadow = true; inst.receiveShadow = true;
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const p = -len / 2 + .035 + i * .07;
      mtx.makeTranslation(along === 'x' ? p : .018 * depthDir, y0 + h / 2, along === 'x' ? .018 * depthDir : p);
      inst.setMatrixAt(i, mtx);
    }
    parent.add(inst);
    add(parent, bx(along === 'x' ? len : .01, h, along === 'x' ? .01 : len), backMat, 0, y0 + h / 2, 0, 0, 0, 0, false);
    return inst;
  };

  // Vách cuối (TV): lam sẫm | tấm sáng | lam sẫm giữa (TV) | tấm sáng | lam sẫm
  const back = wall([0, 0, BK - TH / 2], [0, 0, 1]);
  add(back.group, bx(W, H, TH), fadeable(back, M.panel()), 0, H / 2, 0);
  const sec = [[-1.72, .76, 'slat'], [-.95, .78, 'panel'], [0, 1.12, 'slat'], [.95, .78, 'panel'], [1.72, .76, 'slat']] as const;
  sec.forEach(([cx, wd, kind]) => {
    const grp = new THREE.Group(); grp.position.set(cx, 0, TH / 2 + .02); back.group.add(grp);
    if (kind === 'slat') slatRun(grp, wd, 'x', H - .42, 0, 1);
  });
  // Vách trái: tấm vân sáng, cửa gỗ, khung chứng nhận, công tắc
  const left = wall([L - TH / 2, 0, 0], [1, 0, 0]);
  add(left.group, bx(TH, H, D), fadeable(left, M.panel()), 0, H / 2, 0);
  const door = new THREE.Group(); door.position.set(TH / 2 + .01, 0, 1.55); left.group.add(door);
  add(door, rbox(.06, 2.02, .96, .01), fadeable(left, M.door), .03, 1.01, 0);
  add(door, rbox(.07, 2.08, 1.04, .01), fadeable(left, M.lightWood), 0, 1.04, 0);
  add(door, bx(.02, 1.4, .2), fadeable(left, M.doorGlass), .065, 1.05, -.26);
  add(door, g(new THREE.CylinderGeometry(.012, .012, .14, 12)), fadeable(left, M.chrome), .09, 1.0, .36, 0, 0, Math.PI / 2);
  [[.55, 1.62, .3, .4], [.92, 1.55, .22, .3], [.62, 1.12, .26, .34]].forEach(([z, y, w, h]) => {
    const f = add(left.group, g(new THREE.PlaneGeometry(w, h)), fadeable(left, M.cert), TH / 2 + .012, y, z, 0, Math.PI / 2, 0, false);
    f.receiveShadow = false;
  });
  add(left.group, rbox(.02, .12, .08, .005), fadeable(left, M.white), TH / 2 + .01, 1.15, 2.25);
  // Vách phải: hai bộ cửa kính khung tối + hộp rèm cuốn, giữa là tấm vân sáng
  const right = wall([R + TH / 2, 0, 0], [-1, 0, 0]);
  add(right.group, bx(TH, .3, D), fadeable(right, M.panel()), 0, H - .15, 0);
  add(right.group, bx(TH, H - .3, .9), fadeable(right, M.panel()), 0, (H - .3) / 2, -2.85);
  add(right.group, bx(TH, H - .3, .7), fadeable(right, M.panel()), 0, (H - .3) / 2, .25);
  add(right.group, bx(TH, H - .3, .45), fadeable(right, M.panel()), 0, (H - .3) / 2, 3.08);
  const glassUnit = (z: number, len: number) => {
    const u = new THREE.Group(); u.position.set(0, 0, z); right.group.add(u);
    const fh = H - .42;
    [-len / 2, 0, len / 2].forEach(p => add(u, bx(.06, fh, .05), fadeable(right, M.winFrame), 0, fh / 2, p));
    add(u, bx(.06, .05, len), fadeable(right, M.winFrame), 0, fh, 0);
    add(u, bx(.06, .05, len), fadeable(right, M.winFrame), 0, .025, 0);
    add(u, bx(.012, fh - .08, len - .06), M.glass, 0, fh / 2, 0, 0, 0, 0, false);
    add(u, rbox(.12, .1, len + .1, .02), fadeable(right, M.blind), -.07, fh + .1, 0);
    [-len / 4, len / 4].forEach(p => add(u, bx(.02, .16, .02), fadeable(right, M.chrome), -.04, 1.0, p + (p < 0 ? .2 : -.2)));
  };
  glassUnit(-1.47, 1.86);
  glassUnit(1.79, 2.12);

  // Viền trần giật cấp: lam gỗ quanh 3 vách + mép trần sáng + đèn hắt + đèn âm trần
  const rim = new THREE.Group(); model.add(rim);
  const rimDepth = .42;
  const rimBack = new THREE.Group(); rimBack.position.set(0, H - .4, BK + .02); rim.add(rimBack); slatRun(rimBack, W, 'x', .4, 0, 1);
  add(rim, bx(W, .05, rimDepth), M.ceilingEdge, 0, H + .02, BK + rimDepth / 2);
  add(rim, bx(W - rimDepth * 2, .025, .03), M.cove, 0, H + .055, BK + rimDepth);
  // viền trần hai bên thuộc vách tương ứng → cùng dựng lên và cùng mờ khi vách che nội thất
  ([[left, 1], [right, -1]] as const).forEach(([w, dir]) => {
    const inner = dir * (TH / 2);
    const run = new THREE.Group(); run.position.set(inner + dir * .02, H - .4, 0); w.group.add(run);
    slatRun(run, D, 'z', .4, 0, dir, fadeable(w, M.slat), fadeable(w, M.slatBack));
    add(w.group, bx(rimDepth, .05, D), fadeable(w, M.ceilingEdge), inner + dir * rimDepth / 2, H + .02, 0);
    w.extras.push(add(w.group, bx(.03, .025, D), M.cove, inner + dir * rimDepth, H + .055, 0));
  });
  const dl = g(new THREE.CylinderGeometry(.05, .05, .015, 20));
  [[-1.2, BK + .2], [0, BK + .2], [1.2, BK + .2]].forEach(([x, z]) => add(rim, dl, M.downlight, x, H - .005, z, 0, 0, 0, false));
  stage(rim, 'drop', 1.15, .7);

  /* ---------- TV + kệ ---------- */
  const tv = new THREE.Group(); tv.position.set(0, 0, BK + .02); model.add(tv);
  add(tv, rbox(1.62, .93, .05, .012), M.tvBody, 0, 1.32, .06);
  const screen = add(tv, g(new THREE.PlaneGeometry(1.56, .87)), M.tvScreen, 0, 1.32, .087, 0, 0, 0, false);
  add(tv, rbox(1.3, .36, .34, .02), M.lightWood, 0, .18, .2);
  contact(tv, 1.5, .5, 0, .2, .6);
  stage(tv, 'drop', 1.55, .55);
  // Tủ thờ gỗ góc sau phải
  const altar = new THREE.Group(); altar.position.set(R - .42, 0, BK + .35); model.add(altar);
  add(altar, rbox(.55, .9, .42, .02), M.altar, 0, .45, 0);
  add(altar, rbox(.6, .05, .46, .01), M.altar, 0, .92, 0);
  add(altar, g(new THREE.SphereGeometry(.12, 20, 14)), M.altar, 0, 1.06, 0);
  add(altar, rbox(.4, .14, .2, .02), M.altar, 0, 1.02, 0);
  contact(altar, .8, .7, 0, 0);
  stage(altar, 'drop', 1.6, .55);

  /* ---------- bàn họp dài ---------- */
  const TL = 2.5, TW = .95, TZ = -1.05;
  const table = new THREE.Group(); table.position.set(0, 0, TZ); model.add(table);
  add(table, rbox(TW, .045, TL / 2 - .005, .012), M.table, 0, .745, -TL / 4);
  add(table, rbox(TW, .045, TL / 2 - .005, .012), M.table, 0, .745, TL / 4);
  [-TL / 2 + .08, TL / 2 - .08].forEach(z => {
    add(table, bx(.05, .7, .05), M.frameBlack, -TW / 2 + .06, .36, z);
    add(table, bx(.05, .7, .05), M.frameBlack, TW / 2 - .06, .36, z);
    add(table, bx(TW - .1, .05, .05), M.frameBlack, 0, .025, z);
    add(table, bx(TW - .1, .05, .05), M.frameBlack, 0, .7, z);
  });
  add(table, bx(.05, .05, TL - .2), M.frameBlack, 0, .7, 0);
  add(table, rbox(.5, .5, .55, .02), M.tvBody, 0, .25, .25);
  // vật dụng trên bàn: laptop, cốc thuỷ tinh, máy tính bảng, rổ nhỏ, kệ mica
  add(table, rbox(.32, .012, .22, .004), M.chrome, -.2, .774, .55);
  add(table, g(new THREE.CylinderGeometry(.04, .035, .1, 18)), M.clearGlass, -.32, .82, .85);
  add(table, rbox(.24, .01, .17, .004), M.tvBody, .22, .773, -.2);
  add(table, rbox(.2, .09, .14, .01), M.white, 0, .813, -.75);
  add(table, rbox(.16, .2, .02, .004), M.white, -.05, .87, -1.05);
  contact(table, TW + .5, TL + .4, 0, 0, .85);
  stage(table, 'drop', 1.45, .6);

  /* ---------- ghế chân quỳ ---------- */
  const chair = (x: number, z: number, face: number, at: number) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = face; model.add(c);
    // đệm ngồi + lưng lưới mảnh, hơi ngả
    add(c, rbox(.46, .07, .44, .025), M.fabric, 0, .47, 0);
    const bk = new THREE.Group(); bk.position.set(0, .5, -.21); bk.rotation.x = -.14; c.add(bk);
    add(bk, rbox(.42, .7, .03, .012), M.mesh, 0, .36, 0);
    add(bk, tube([[-.215, .02, 0], [-.215, .72, 0]], .009), M.chrome);
    add(bk, tube([[.215, .02, 0], [.215, .72, 0]], .009), M.chrome);
    // khung quỳ inox hai bên + tay vịn cong
    [-.24, .24].forEach(s => {
      add(c, tube([[s, .44, .17], [s, .3, .24], [s, .06, .26], [s, .015, .2], [s, .015, -.16], [s, .03, -.22]], .011), M.chrome);
      add(c, tube([[s, .5, -.2], [s, .64, -.12], [s, .66, .06], [s, .58, .17], [s, .47, .18]], .009), M.chrome);
      add(c, rbox(.04, .025, .2, .01), M.fabric, s, .665, -.02);
    });
    add(c, tube([[-.24, .015, -.18], [0, .01, -.2], [.24, .015, -.18]], .009), M.chrome);
    contact(c, .7, .7, 0, 0, .55);
    stage(c, 'drop', at, .5);
  };
  [-1.95, -1.38, -.81, -.24].forEach((z, i) => {
    chair(-.78, TZ + z + .96, Math.PI / 2, 1.6 + i * .07);
    chair(.78, TZ + z + .96, -Math.PI / 2, 1.64 + i * .07);
  });

  /* ---------- ghế tiếp khách khung gỗ (trước trái) ---------- */
  const sofa = new THREE.Group(); sofa.position.set(L + .62, 0, FR - .95); sofa.rotation.y = Math.PI / 2 - .15; model.add(sofa);
  add(sofa, rbox(1.2, .06, .62, .015), M.lightWood, 0, .3, 0);
  add(sofa, rbox(1.12, .14, .56, .04), M.sofa, 0, .4, .02);
  add(sofa, rbox(1.12, .44, .1, .035), M.sofa, 0, .68, -.25);
  [-.6, .6].forEach(s => {
    add(sofa, rbox(.07, .06, .68, .02), M.lightWood, s, .62, 0);
    [-.28, .28].forEach(zz => add(sofa, rbox(.06, .6, .06, .01), M.lightWood, s, .3, zz));
    for (let k = 0; k < 4; k++) add(sofa, bx(.03, .26, .02), M.lightWood, s, .45, -.18 + k * .12);
  });
  contact(sofa, 1.5, .9, 0, 0);
  stage(sofa, 'drop', 1.75, .55);
  // bàn trà kính
  const coffee = new THREE.Group(); coffee.position.set(L + .62, 0, FR - .22); model.add(coffee);
  add(coffee, rbox(.6, .025, .5, .008), M.clearGlass, 0, .45, 0);
  add(coffee, rbox(.6, .04, .5, .01), M.lightWood, 0, .42, 0);
  [[-.26, -.21], [.26, -.21], [-.26, .21], [.26, .21]].forEach(([x, z]) => add(coffee, bx(.04, .42, .04), M.lightWood, x, .21, z));
  contact(coffee, .8, .7, 0, 0);
  stage(coffee, 'drop', 1.8, .5);

  /* ---------- bàn làm việc gỗ tối (trước phải) ---------- */
  const desk = new THREE.Group(); desk.position.set(R - .7, 0, FR - .95); desk.rotation.y = .12; model.add(desk);
  add(desk, rbox(.82, .055, 1.7, .02), M.desk, 0, .78, 0);
  add(desk, rbox(.76, .72, 1.6, .02), M.desk, 0, .38, .02);
  [-.4, 0, .4].forEach(zz => add(desk, bx(.005, .2, .5), M.slatBack, -.385, .55, zz));
  // cờ Việt Nam trên đế mạ vàng
  add(desk, g(new THREE.CylinderGeometry(.06, .07, .03, 24)), M.gold, -.2, .82, .45);
  add(desk, g(new THREE.CylinderGeometry(.006, .006, .48, 10)), M.gold, -.2, 1.05, .45);
  add(desk, g(new THREE.SphereGeometry(.014, 12, 8)), M.gold, -.2, 1.3, .45);
  const flagGeo = g(new THREE.PlaneGeometry(.28, .19, 12, 4));
  const fp = flagGeo.attributes.position as T.BufferAttribute;
  for (let i = 0; i < fp.count; i++) fp.setZ(i, Math.sin((fp.getX(i) + .14) * 14) * .012 * (fp.getX(i) + .14) * 4);
  flagGeo.computeVertexNormals();
  add(desk, flagGeo, M.flag, -.2, 1.17, .3, 0, Math.PI / 2, 0);
  // kỷ niệm chương đứng, quả cầu đá trên đế đỏ, cốc bút, bảng giấy khen nằm
  add(desk, rbox(.04, .34, .26, .008), M.white, .2, .98, -.55, 0, 0, -.12);
  add(desk, rbox(.03, .14, .12, .004), M.gold, .18, 1.0, -.55, 0, 0, -.12);
  add(desk, rbox(.1, .04, .32, .008), M.tvBody, .2, .825, -.55);
  add(desk, g(new THREE.CylinderGeometry(.08, .1, .1, 24)), M.red, .1, .86, .7);
  add(desk, g(new THREE.SphereGeometry(.15, 32, 20)), M.granite, .1, 1.05, .7);
  add(desk, g(new THREE.CylinderGeometry(.035, .035, .12, 16)), M.clearGlass, -.18, .87, .05);
  add(desk, g(new THREE.PlaneGeometry(.36, .26)), M.cert, .1, .812, .1, -Math.PI / 2, 0, .25, false);
  contact(desk, 1.2, 2.1, 0, 0, .9);
  stage(desk, 'drop', 1.85, .55);

  /* ---------- cây môn lá lớn ngoài cửa kính ---------- */
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 1);
  leafShape.bezierCurveTo(.42, .72, .62, .3, .46, -.05);
  leafShape.bezierCurveTo(.36, -.24, .16, -.3, 0, -.12);
  leafShape.bezierCurveTo(-.16, -.3, -.36, -.24, -.46, -.05);
  leafShape.bezierCurveTo(-.62, .3, -.42, .72, 0, 1);
  const leafGeo = g(new THREE.ShapeGeometry(leafShape, 18));
  const lp = leafGeo.attributes.position as T.BufferAttribute, uv = leafGeo.attributes.uv as T.BufferAttribute;
  for (let i = 0; i < lp.count; i++) {
    const x = lp.getX(i), y = lp.getY(i);
    lp.setZ(i, -.22 * x * x - .12 * (y - .3) * (y - .3) + .05);
    uv.setXY(i, (x + .62) / 1.24, (y + .3) / 1.3);
  }
  leafGeo.computeVertexNormals();
  const plants: { leaf: T.Object3D; phase: number; base: number }[] = [];
  const plant = (z: number, scale: number, seedOff: number) => {
    const p = new THREE.Group(); p.position.set(R + .55, 0, z); model.add(p);
    add(p, g(new THREE.CylinderGeometry(.22, .18, .34, 24)), M.pot, 0, .17, 0);
    add(p, g(new THREE.CylinderGeometry(.2, .2, .02, 24)), M.soil, 0, .34, 0);
    for (let k = 0; k < 6; k++) {
      const a = k * 1.05 + seedOff, hgt = (1.05 + (k % 3) * .32) * scale, lean = .22 + (k % 2) * .12;
      const tip: [number, number, number] = [Math.cos(a) * lean, hgt, Math.sin(a) * lean];
      add(p, tube([[0, .34, 0], [tip[0] * .4, hgt * .6, tip[2] * .4], tip], .014), M.stem);
      const holder = new THREE.Group(); holder.position.set(...tip); p.add(holder);
      const leaf = new THREE.Mesh(leafGeo, M.leaf); leaf.castShadow = true;
      const s = (.42 + (k % 3) * .1) * scale; leaf.scale.set(s, s * 1.15, s);
      leaf.rotation.set(-1.0 - (k % 2) * .25, 0, 0);
      holder.rotation.y = -a + Math.PI / 2;
      holder.add(leaf);
      plants.push({ leaf: holder, phase: k + seedOff, base: holder.rotation.y });
    }
    stage(p, 'drop', 2.0, .6);
  };
  plant(-1.75, 1.05, .3);
  plant(-.75, .9, 1.7);
  plant(1.35, 1.1, 2.6);
  plant(2.4, .85, .9);

  /* ---------- vách dựng lên theo thứ tự ---------- */
  stage(back.group, 'rise', .45, .7);
  stage(left.group, 'rise', .6, .7);
  stage(right.group, 'rise', .75, .7);

  /* ================= ánh sáng ================= */
  const hemi = new THREE.HemisphereLight(0xfff7ea, 0x5a4a3c, .55); scene.add(hemi);
  // ánh sáng ban ngày qua cửa kính (bên phải)
  const sun = new THREE.DirectionalLight(0xfff4e2, 2.1);
  sun.position.set(7, 7.5, 2.5); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdfe8ff, .45); fill.position.set(-6, 4, 6); scene.add(fill);
  // đèn nội thất ấm (sáng dần trong màn mở đầu)
  const warm1 = new THREE.PointLight(0xffd7a0, 0, 5.5, 2); warm1.position.set(0, H - .3, -1.2); scene.add(warm1);
  const warm2 = new THREE.PointLight(0xffd7a0, 0, 5, 2); warm2.position.set(-.6, H - .3, 1.6); scene.add(warm2);
  const tvGlow = new THREE.PointLight(0x5b7bd8, 0, 3, 2); tvGlow.position.set(0, 1.3, BK + .7); scene.add(tvGlow);

  /* ================= camera & tương tác ================= */
  const AZ = .16, EL = .7;             // góc đẹp: phía trước hơi lệch trái, nhìn cao xuống (vách hai bên thấy từ bên trong)
  let az = still ? AZ : AZ + .55, elv = still ? EL : EL + .1, distK = still ? 1 : 1.12;
  let yaw = 0, vel = 0, drag = false, lastX = 0, lastMove = 0, userMoved = false;
  const target = new THREE.Vector3(0, .55, -.15);
  let fitDist = 20;
  const fit = () => {
    const w = el.clientWidth || el.parentElement!.clientWidth, h = el.clientHeight || 400;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const r = 4.6, vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect);
    fitDist = Math.max(r / Math.sin(vf), r / Math.sin(hf)) * .87;
    camera.updateProjectionMatrix();
    wake();
  };
  const placeCamera = () => {
    const d = fitDist * distK;
    camera.position.set(target.x - Math.sin(az) * Math.cos(elv) * d, target.y + Math.sin(elv) * d, target.z + Math.cos(az) * Math.cos(elv) * d);
    camera.lookAt(target);
  };
  canvas.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); el.classList.add('is-drag'); wake(); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    vel = (e.clientX - lastX) * .005; yaw = THREE.MathUtils.clamp(yaw + vel, -.75, .75); lastX = e.clientX; lastMove = performance.now();
    if (!userMoved && Math.abs(yaw) > .05) { userMoved = true; cb.moved(true); }
    wake();
  });
  const up = () => { drag = false; el.classList.remove('is-drag'); lastMove = performance.now(); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('dblclick', () => reset());
  let resetting = false;
  const reset = () => { resetting = true; vel = 0; wake(); };
  const ro = new ResizeObserver(fit); ro.observe(el);

  /* ================= vòng lặp ================= */
  const ease = (k: number) => 1 - Math.pow(1 - k, 3);
  const inOut = (k: number) => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const INTRO = 3.6;
  let started = false, tStart = 0, frame = 0, visible = true, first = true, readySent = false;
  const tmp = new THREE.Vector3();

  const applyIntro = (t: number) => {
    stages.forEach(s => {
      const k = THREE.MathUtils.clamp((t - s.at) / s.dur, 0, 1), e = ease(k);
      s.obj.visible = k > 0;
      if (s.kind === 'base') { s.obj.scale.set(.92 + .08 * e, Math.max(.001, e), .92 + .08 * e); }
      else if (s.kind === 'rise') { s.obj.scale.y = Math.max(.001, e); }
      else { s.obj.position.y = s.y0 + (1 - e) * .45; const sc = .94 + .06 * e; s.obj.scale.setScalar(sc); }
    });
    const lk = ease(THREE.MathUtils.clamp((t - 2.25) / .9, 0, 1));
    M.cove.emissiveIntensity = 2.4 * lk; M.downlight.emissiveIntensity = 3 * lk;
    warm1.intensity = 7 * lk; warm2.intensity = 5 * lk;
    const tk = ease(THREE.MathUtils.clamp((t - 2.7) / .6, 0, 1));
    M.tvScreen.emissiveIntensity = .95 * tk; M.tvScreen.color.setScalar(.02 + .1 * tk); tvGlow.intensity = 1.6 * tk;
    const ck = inOut(THREE.MathUtils.clamp(t / INTRO, 0, 1));
    az = AZ + .55 * (1 - ck); elv = EL + .1 * (1 - ck); distK = 1 + .12 * (1 - ck);
  };

  const fadeWalls = () => {
    walls.forEach(w => {
      tmp.copy(w.normal).applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y);
      const c = w.center.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y);
      const toCam = camera.position.clone().sub(c).normalize();
      const facingAway = tmp.dot(toCam) < -.12;      // người xem đứng phía sau vách → vách che nội thất
      const target2 = facingAway ? .12 : 1;
      w.mats.forEach(m => { m.opacity += (target2 - m.opacity) * .15; m.depthWrite = m.opacity > .9; });
      const shown = !facingAway;
      if (shown !== w.shown) {
        w.shown = shown;
        w.extras.forEach(o => { o.visible = shown; });
        w.group.traverse(o => { if ((o as T.Mesh).isMesh) o.castShadow = shown; });
      }
    });
  };

  const tick = (now: number) => {
    frame = 0;
    if (!started) { started = true; tStart = now; }
    const t = still ? 99 : (now - tStart) / 1000;
    applyIntro(t);
    if (!drag) {
      vel *= .9; yaw = THREE.MathUtils.clamp(yaw + vel, -.75, .75);
      if (resetting || (lastMove && now - lastMove > 3200)) {
        yaw += (0 - yaw) * .06;
        if (Math.abs(yaw) < .002) { yaw = 0; resetting = false; lastMove = 0; if (userMoved) { userMoved = false; cb.moved(false); } }
      }
    }
    model.rotation.y = yaw;
    if (!still && t > INTRO) plants.forEach(p => { p.leaf.rotation.y = p.base + Math.sin(now * .0009 + p.phase) * .05; });
    placeCamera();
    fadeWalls();
    renderer.render(scene, camera);
    if (first) { first = false; }
    if (!readySent) { readySent = true; cb.ready(); }
    const settling = drag || resetting || Math.abs(yaw) > .001 || Math.abs(vel) > .0005 || walls.some(w => w.mats.some(m => Math.abs(m.opacity - (m.opacity > .5 ? 1 : .12)) > .01));
    const animating = !still || settling;
    if (animating && visible && !document.hidden) frame = requestAnimationFrame(tick);
  };
  function wake() { if (!frame && visible) frame = requestAnimationFrame(tick); }
  // chỉ bắt đầu màn mở đầu khi mô hình hiện trên màn hình
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); }, { threshold: .15 });
  io.observe(el);
  const onVis = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', onVis);
  fit();

  return {
    reset,
    dispose: () => {
      cancelAnimationFrame(frame);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      geos.forEach(x => x.dispose());
      disposables.forEach(x => x.dispose());
      envTex.dispose(); pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    }
  };
}
