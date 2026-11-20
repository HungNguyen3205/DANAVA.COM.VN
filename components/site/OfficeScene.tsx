'use client';
/**
 * Mô hình 3D văn phòng DANAVA (Three.js, dựng bằng code — không dùng file mô hình) theo ảnh thật phòng họp:
 * tường ốp lam gỗ sẫm xen tấm vân sáng, trần giật cấp có đèn âm trần, bàn họp dài mặt xám chân đen,
 * 8 ghế lưới đen chân inox, TV lớn trên tường, cửa gỗ + giấy khen bên trái, sofa gỗ đệm caro đỏ,
 * bàn giám đốc có cờ Việt Nam, cửa kính lùa nhìn ra cây xanh bên phải.
 * Kiểu sa bàn cắt mặt trước, nằm tự do trên nền trang (không bỏ vào thẻ). Kéo để xoay; tự lắc nhẹ;
 * chỉ vẽ khi đang hiện trên màn hình; giảm chuyển động thì đứng yên. Không có WebGL → hiện ảnh thật.
 */
import { useEffect, useRef, useState } from 'react';

type Three = typeof import('three');

export function OfficeScene({ fallback }: { fallback: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
      const THREE: Three = await import('three');
      if (disposed) return;
      cleanup = build(THREE, el, () => setReady(true));
    })();
    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <div className={`hb-office${ready ? ' is-ready' : ''}`} ref={host} role="img" aria-label="Mô hình 3D văn phòng DANAVA tại Đà Nẵng: phòng họp với bàn dài, ghế, TV và cây xanh bên cửa kính">
      <img className="hb-office__fallback" src={fallback} alt="" width={1100} height={825} />
      <span className="hb-office__hint" aria-hidden="true">Kéo để xoay</span>
    </div>
  );
}

function build(THREE: Three, el: HTMLElement, onReady: () => void) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = 'hb-office__canvas';
  el.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);

  /* ---------- vật liệu & tiện ích ---------- */
  const mats = new Map<string, InstanceType<Three['MeshStandardMaterial']>>();
  const mat = (color: number, o: Record<string, unknown> = {}) => {
    const k = color + JSON.stringify(o);
    if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: .6, ...o }));
    return mats.get(k)!;
  };
  const box = (w: number, h: number, d: number, m: InstanceType<Three['Material']>, x = 0, y = 0, z = 0, parent: InstanceType<Three['Object3D']> = room) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const cyl = (r: number, h: number, m: InstanceType<Three['Material']>, x = 0, y = 0, z = 0, parent: InstanceType<Three['Object3D']> = room, seg = 24) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const tex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d')!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  const C = { navy: 0x13244f, orange: 0xf26b1d, sun: 0xffb347, darkWood: 0x4a2f22, slat: 0x3b261b, light: 0xe9e4dc, steel: 0xc7ccd3, black: 0x1b1d22, table: 0x4b4d52, cream: 0xfbf6ee };

  // Sàn gỗ ô vuông lệch (giống sàn trong ảnh)
  const floorTex = tex(512, 512, c => {
    const cols = ['#c98a4b', '#d39553', '#bf7f42', '#cf9150', '#c48446'];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
      c.fillStyle = cols[(x * 3 + y * 7) % cols.length];
      const off = (y % 2) * 32;
      c.fillRect(x * 64 + off - 64, y * 32, 64, 32);
      c.fillRect(x * 64 + off, y * 32, 64, 32);
      c.strokeStyle = 'rgba(80,40,10,.25)'; c.lineWidth = 2; c.strokeRect(x * 64 + off, y * 32, 64, 32);
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(2, 1.6);
  // Màn hình TV: giao diện DANAVA
  const tvTex = tex(640, 360, c => {
    const g = c.createLinearGradient(0, 0, 640, 360); g.addColorStop(0, '#1f3176'); g.addColorStop(1, '#2b4294');
    c.fillStyle = g; c.fillRect(0, 0, 640, 360);
    c.fillStyle = '#f26b1d'; c.beginPath(); c.moveTo(380, 0); c.lineTo(460, 0); c.lineTo(330, 360); c.lineTo(250, 360); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 64px sans-serif'; c.fillText('DANAVA', 40, 150);
    c.font = '600 26px sans-serif'; c.fillStyle = '#ffd27a'; c.fillText('Growing Your Business Together', 40, 200);
    c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(40, 250, 180, 14); c.fillRect(40, 280, 120, 14);
  });
  // Cờ Việt Nam
  const flagTex = tex(150, 100, c => {
    c.fillStyle = '#da251d'; c.fillRect(0, 0, 150, 100);
    c.fillStyle = '#ffde00'; c.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(75 + r * Math.cos(a), 50 + r * Math.sin(a)); }
    c.fill();
  });
  // Đệm sofa caro đỏ trắng
  const sofaTex = tex(128, 128, c => {
    c.fillStyle = '#f5efe6'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = '#b3202a';
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x * 5 + y * 3) % 4 === 0) c.fillRect(x * 16 + 2, y * 16 + 2, 12, 12);
  });
  // Giấy khen
  const certTex = tex(64, 80, c => { c.fillStyle = '#fbf3df'; c.fillRect(0, 0, 64, 80); c.strokeStyle = '#c9a14a'; c.lineWidth = 4; c.strokeRect(4, 4, 56, 72); c.fillStyle = '#c0392b'; c.fillRect(24, 54, 16, 12); });

  /* ---------- phòng ---------- */
  const W = 6, D = 4.4, H = 2.3, T = .1;
  const room = new THREE.Group();
  scene.add(room);

  // Bục đế: kem + vạch cam + navy (theo bộ nhận diện)
  box(W + .5, .12, D + .5, mat(C.cream, { roughness: .8 }), 0, -.16, 0);
  box(W + .56, .05, D + .56, mat(C.orange, { roughness: .45 }), 0, -.245, 0);
  box(W + .62, .16, D + .62, mat(C.navy, { roughness: .5 }), 0, -.35, 0);
  // Sàn
  const floor = box(W, .1, D, new THREE.MeshStandardMaterial({ map: floorTex, roughness: .45, metalness: .05 }), 0, -.05, 0);
  floor.castShadow = false;

  // Tường sau: tấm vân sáng + mảng lam gỗ sẫm ở giữa
  const back = -D / 2 - T / 2;
  box(W, H, T, mat(C.light, { roughness: .85 }), 0, H / 2, back);
  const slatPanel = (x0: number, width: number, z: number, along: 'x' | 'z') => {
    const n = Math.round(width / .1);
    for (let i = 0; i < n; i++) {
      const p = x0 - width / 2 + .05 + i * .1;
      if (along === 'x') box(.06, H - .55, .05, mat(C.slat, { roughness: .7 }), p, (H - .55) / 2, z);
      else box(.05, H - .55, .06, mat(C.slat, { roughness: .7 }), z, (H - .55) / 2, p);
    }
    if (along === 'x') box(width, H - .55, .02, mat(0x2a1a12), x0, (H - .55) / 2, z - .03);
  };
  slatPanel(0, 2.2, back + .08, 'x');
  // Dải lam gỗ chạy quanh phía trên (trần giật cấp)
  box(W, .34, .3, mat(C.darkWood, { roughness: .6 }), 0, H - .17, back + .2);
  box(.3, .34, D, mat(C.darkWood, { roughness: .6 }), -W / 2 + .2, H - .17, 0);
  for (let i = 0; i < 40; i++) box(.04, .3, .04, mat(C.slat), -W / 2 + .15 + i * .145, H - .17, back + .37);

  // Tường trái: cửa gỗ + giấy khen
  const left = -W / 2 - T / 2;
  box(T, H, D, mat(C.light, { roughness: .85 }), left, H / 2, 0);
  box(.06, 1.85, .9, mat(0x8a4a22, { roughness: .35 }), left + .07, .925, .9);
  box(.07, 1.4, .14, mat(0xcfd6dc, { roughness: .2, metalness: .1 }), left + .1, .95, .64);
  [[-.2, 1.45], [.1, 1.45], [-.05, 1.12]].forEach(([z, y]) => {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(.22, .28), new THREE.MeshStandardMaterial({ map: certTex, roughness: .7 }));
    f.position.set(left + .06, y, z); f.rotation.y = Math.PI / 2; room.add(f);
  });

  // Tường phải: cửa kính lùa + cây xanh phía ngoài
  const right = W / 2;
  const frameM = mat(0x2d3036, { roughness: .4, metalness: .5 });
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xbfe0f0, transparent: true, opacity: .22, roughness: .05, metalness: 0, transmission: .6 });
  for (let i = 0; i <= 4; i++) box(.06, H, .06, frameM, right, H / 2, -D / 2 + i * (D / 4));
  box(.06, .06, D, frameM, right, H, 0); box(.06, .06, D, frameM, right, .03, 0);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(.02, H - .1, D), glassM); glass.position.set(right, H / 2, 0); room.add(glass);
  const leafM = mat(0x2f8f4e, { roughness: .7 }), leafM2 = mat(0x4fb06a, { roughness: .7 });
  // Cây môn lá to ngoài cửa kính: thân mảnh, nhiều lá thuôn xoè ra
  const leafGeo = new THREE.SphereGeometry(.2, 18, 10);
  [[-1.5, 1.25], [-.4, 1.6], [.8, 1.2], [1.75, 1.45]].forEach(([z, s], i) => {
    cyl(.16, .26, mat(0x6b6e75, { roughness: .8 }), right + .42, .13, z);
    for (let k = 0; k < 7; k++) {
      const a = k * (Math.PI * 2 / 7) + i;
      const hgt = s * (.55 + (k % 3) * .17);
      const stem = cyl(.012, hgt, mat(0x4d7f3f), right + .42 + Math.cos(a) * .08, hgt / 2 + .2, z + Math.sin(a) * .08);
      stem.rotation.set(Math.sin(a) * .35, 0, -Math.cos(a) * .35);
      const leaf = new THREE.Mesh(leafGeo, k % 2 ? leafM : leafM2);
      leaf.scale.set(1.25, .12, .7);
      leaf.position.set(right + .42 + Math.cos(a) * .3, hgt + .2, z + Math.sin(a) * .3);
      leaf.rotation.set(Math.sin(a) * .5, -a, -Math.cos(a) * .5);
      leaf.castShadow = true; room.add(leaf);
    }
  });

  // TV + kệ
  box(1.5, .86, .05, mat(C.black, { roughness: .3 }), 0, 1.25, back + .14);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.42, .8), new THREE.MeshStandardMaterial({ map: tvTex, emissive: 0xffffff, emissiveMap: tvTex, emissiveIntensity: .55, roughness: .3 }));
  screen.position.set(0, 1.25, back + .17); room.add(screen);
  box(1.6, .32, .32, mat(C.darkWood, { roughness: .5 }), 0, .16, back + .26);

  // Bàn họp dài
  const tbl = new THREE.Group(); room.add(tbl);
  box(.95, .05, 2.7, mat(C.table, { roughness: .45 }), 0, .74, 0, tbl);
  [[-1.25], [1.25]].forEach(([z]) => {
    box(.05, .72, .05, mat(C.black, { metalness: .4, roughness: .4 }), -.4, .36, z, tbl);
    box(.05, .72, .05, mat(C.black, { metalness: .4, roughness: .4 }), .4, .36, z, tbl);
    box(.85, .05, .05, mat(C.black, { metalness: .4, roughness: .4 }), 0, .02, z, tbl);
  });
  box(.6, .5, .4, mat(0x2a2b30, { roughness: .5 }), 0, .45, .2, tbl);
  // Đồ trên bàn: laptop, cốc
  box(.32, .015, .22, mat(0xb9bec6, { metalness: .6, roughness: .3 }), -.18, .775, -.55, tbl);
  cyl(.04, .09, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: .05 }), .2, .81, -.7, tbl);
  box(.22, .015, .3, mat(0x2b2d33, { roughness: .3 }), .15, .775, .4, tbl);

  // Ghế lưới đen chân inox
  const chair = (x: number, z: number, face: number) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = face; room.add(g);
    const blk = mat(C.black, { roughness: .8 }), chrome = mat(C.steel, { metalness: .9, roughness: .2 });
    box(.44, .06, .42, blk, 0, .47, 0, g);
    const backrest = box(.42, .62, .04, blk, 0, .84, -.2, g); backrest.rotation.x = -.12;
    [-.22, .22].forEach(s => { box(.03, .03, .34, chrome, s, .62, -.02, g); box(.025, .17, .025, chrome, s, .54, .14, g); });
    [-.2, .2].forEach(s => {
      box(.025, .025, .5, chrome, s, .02, .02, g);
      box(.025, .45, .025, chrome, s, .24, .26, g);
      box(.025, .025, .26, chrome, s, .46, .14, g);
    });
  };
  [-.95, -.32, .32, .95].forEach(z => { chair(-.78, z, Math.PI / 2); chair(.78, z, -Math.PI / 2); });

  // Sofa gỗ đệm caro đỏ (góc trái trước)
  const sofa = new THREE.Group(); sofa.position.set(-2.35, 0, 1.45); sofa.rotation.y = Math.PI / 2; room.add(sofa);
  const wood = mat(0x9a5b2c, { roughness: .4 });
  const cushion = new THREE.MeshStandardMaterial({ map: sofaTex, roughness: .9 });
  box(1.1, .08, .55, wood, 0, .34, 0, sofa); box(1.0, .14, .5, cushion, 0, .45, .02, sofa);
  box(1.0, .4, .1, cushion, 0, .72, -.22, sofa);
  [-.55, .55].forEach(s => { box(.06, .62, .6, wood, s, .38, 0, sofa); });
  // Bàn trà kính
  box(.55, .03, .5, new THREE.MeshPhysicalMaterial({ color: 0x9fb8c0, transparent: true, opacity: .5, roughness: .05 }), -1.75, .42, 1.55);
  box(.5, .4, .45, wood, -1.75, .2, 1.55);

  // Bàn giám đốc + cờ + quả cầu (góc phải trước)
  const desk = new THREE.Group(); desk.position.set(1.95, 0, 1.4); desk.rotation.y = -.15; room.add(desk);
  box(1.5, .06, .7, mat(0x3a2418, { roughness: .35 }), 0, .78, 0, desk);
  box(1.46, .72, .64, mat(0x4a2f22, { roughness: .5 }), 0, .39, 0, desk);
  cyl(.008, .55, mat(C.sun, { metalness: .8, roughness: .3 }), -.45, 1.08, -.1, desk);
  cyl(.07, .03, mat(C.sun, { metalness: .8, roughness: .3 }), -.45, .82, -.1, desk);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(.3, .2), new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: .8 }));
  flag.position.set(-.3, 1.25, -.1, ); desk.add(flag);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), mat(0x1d2a4a, { roughness: .2, metalness: .3 })); globe.position.set(.5, .95, .05); globe.castShadow = true; desk.add(globe);
  cyl(.09, .06, mat(0x7a1c1c), .5, .83, .05, desk);
  box(.26, .34, .04, mat(0xf3eee2), .1, .97, -.25, desk);

  // Đèn âm trần (trên dải gỗ) + ánh sáng ấm
  const glow = mat(0xfff3d6, { emissive: 0xffe4b0, emissiveIntensity: 2.2 });
  for (let i = 0; i < 4; i++) cyl(.06, .02, glow, -2.2 + i * 1.45, H - .35, back + .25);
  for (let i = 0; i < 3; i++) cyl(.06, .02, glow, -W / 2 + .25, H - .35, -1.4 + i * 1.4);

  /* ---------- ánh sáng ---------- */
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x6b5a4a, 1.05));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
  sun.position.set(5, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  sun.shadow.bias = -.0006;
  scene.add(sun);
  const warm = new THREE.PointLight(0xffd9a0, 6, 6, 2); warm.position.set(0, 2, 0); scene.add(warm);
  const cool = new THREE.DirectionalLight(0xc9dcff, .5); cool.position.set(-5, 3, -3); scene.add(cool);

  /* ---------- tương tác ---------- */
  const base = -.62;
  let yaw = base, vel = 0, drag = false, lastX = 0, mx = 0, my = 0;
  canvas.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); el.classList.add('is-drag'); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; vel = (e.clientX - lastX) * .006; yaw += vel; lastX = e.clientX; wake(); });
  const up = () => { drag = false; el.classList.remove('is-drag'); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  const onMove = (e: PointerEvent) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
  addEventListener('pointermove', onMove);

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = w / h < 1 ? 19 : 15;
    camera.position.set(0, dist * .62, dist);
    camera.lookAt(0, .45, 0);
    camera.updateProjectionMatrix();
    wake();
  };
  const ro = new ResizeObserver(resize); ro.observe(el);

  let frame = 0, visible = true, t0 = performance.now(), first = true;
  const tick = (now: number) => {
    frame = 0;
    const t = (now - t0) / 1000;
    if (!still) {
      if (!drag) {
        vel *= .92;
        const target = base + Math.sin(t * .35) * .42;
        yaw += vel + (target - yaw) * .015;
      }
      room.position.y = Math.sin(t * 1.1) * .05;
      camera.position.x += (mx * 1.4 - camera.position.x) * .04;
      camera.lookAt(0, .45 + my * -.3, 0);
    }
    room.rotation.y = yaw;
    renderer.render(scene, camera);
    if (first) { first = false; onReady(); }
    if (!still && visible && !document.hidden) frame = requestAnimationFrame(tick);
  };
  const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); });
  io.observe(el);
  const onVis = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', onVis);
  resize();

  return () => {
    cancelAnimationFrame(frame);
    io.disconnect(); ro.disconnect();
    removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', onVis);
    scene.traverse(o => {
      const m = o as InstanceType<Three['Mesh']>;
      if (m.geometry) m.geometry.dispose();
      const mm = m.material as InstanceType<Three['Material']> | InstanceType<Three['Material']>[] | undefined;
      (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach(x => { const mx2 = x as InstanceType<Three['MeshStandardMaterial']>; mx2.map?.dispose(); x.dispose(); });
    });
    renderer.dispose();
    canvas.remove();
  };
}
