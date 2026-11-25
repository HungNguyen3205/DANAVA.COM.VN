/**
 * Mô hình 3D dựng sẵn cho vật cố định, cầu thang / thang máy, nội thất, lễ tân và nhân vật mô phỏng
 * (phòng lab thiết kế phòng tập). Toạ độ cục bộ: tâm đáy ở gốc, x = w, z = d, y = cao (m).
 * Đây là mô hình minh hoạ nhận diện được, không phải bản vẽ kỹ thuật.
 */
import type * as T from 'three';
import type { Fixture, FurnitureItem, Link, Reception } from '@/lib/gym-project';
import { FIXTURE_KINDS, LINK_KINDS } from '@/lib/gym-project';
import { FURNITURE, INTERIOR_STYLES } from '@/lib/gym-decor';

type Three = typeof import('three');
export type StyleColors = (typeof INTERIOR_STYLES)[keyof typeof INTERIOR_STYLES];

export function kit(THREE: Three) {
  const mats = new Map<string, T.MeshStandardMaterial>();
  const mat = (color: string | number, rough = .6, metal = .1, extra: Partial<T.MeshStandardMaterialParameters> = {}) => {
    const key = `${color}|${rough}|${metal}|${JSON.stringify(extra)}`;
    let m = mats.get(key);
    if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }); mats.set(key, m); }
    return m;
  };
  const box = (g: T.Object3D, w: number, h: number, d: number, m: T.Material, x = 0, y = 0, z = 0, shadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, .005), Math.max(h, .005), Math.max(d, .005)), m);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = shadow; mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };
  const cyl = (g: T.Object3D, r: number, h: number, m: T.Material, x = 0, y = 0, z = 0, seg = 20) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    mesh.position.set(x, y + h / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh;
  };
  /** Nhãn chữ nổi (sprite) */
  const label = (text: string, color = '#13244f', scale = 1.6) => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = color; x.beginPath(); x.roundRect(6, 14, 500, 100, 50); x.fill();
    x.fillStyle = '#fff'; x.font = 'bold 50px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text.length > 18 ? text.slice(0, 17) + '…' : text, 256, 66);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
    s.scale.set(scale, scale / 4, 1); s.renderOrder = 20;
    return s;
  };
  /** Tấm phẳng có chữ (logo trên vách / quầy) */
  const textPanel = (text: string, w: number, h: number, bg: string, fg: string) => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = Math.max(64, Math.round(1024 * h / w));
    const x = c.getContext('2d')!;
    x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = fg; x.font = `900 ${Math.round(c.height * .42)}px system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, c.width / 2, c.height / 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: .5 });
  };
  /** Sọc chéo (vùng không dùng) */
  const hatch = (fg: string, bg: string, w: number, d: number) => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d')!;
    x.fillStyle = bg; x.fillRect(0, 0, 64, 64); x.strokeStyle = fg; x.lineWidth = 9;
    for (let i = -64; i < 128; i += 22) { x.beginPath(); x.moveTo(i, 64); x.lineTo(i + 64, 0); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / .45, d / .45); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: .9 });
  };
  return { THREE, mat, box, cyl, label, textPanel, hatch };
}
export type Kit = ReturnType<typeof kit>;

/** Vật cố định (cửa, cửa sổ, cột, WC, thay đồ, kho, vùng không dùng, ổ điện) — đặt ở (0,0) cục bộ, chưa xoay */
export function fixtureMesh(K: Kit, fx: Fixture, h: number, st: StyleColors) {
  const { THREE, box, mat, label, hatch } = K;
  const g = new THREE.Group();
  const k = FIXTURE_KINDS[fx.kind];
  const W = fx.w, D = fx.d;
  switch (fx.kind) {
    case 'door': case 'exit': {
      const c = fx.kind === 'exit' ? '#15803d' : '#13244f';
      box(g, W, .02, D + .6, mat(fx.kind === 'exit' ? '#dcfce7' : '#e0e7ff', .9), 0, 0, 0, false);
      for (const s of [-1, 1]) box(g, .08, 2.2, .14, mat(c, .4, .3), s * (W / 2), 0, 0);
      box(g, W + .16, .1, .14, mat(c, .4, .3), 0, 2.2, 0);
      const l = label(fx.main ? 'Cửa chính' : k.label, c, 1.3); l.position.y = 2.6; g.add(l);
      break;
    }
    case 'window': {
      box(g, W, 1.3, .06, mat('#9bd4f5', .1, .2, { transparent: true, opacity: .55 }), 0, 1, 0, false);
      box(g, W + .08, .06, .1, mat('#e5e7eb', .4), 0, .96, 0);
      break;
    }
    case 'column': box(g, W, h, D, mat(st.accentWall, .8)); break;
    case 'outlet': box(g, .14, .1, .05, mat('#ca8a04', .4), 0, .35, 0); break;
    case 'void': {
      box(g, W, .03, D, hatch('rgba(180,35,24,.5)', '#fff5f5', W, D), 0, 0, 0, false);
      const l = label(fx.label || k.label, '#b42318', 1.4); l.position.y = .6; g.add(l);
      break;
    }
    default: {
      // phòng kín (WC, thay đồ, kho, khu khác): tường thấp mờ + nhãn
      const wallH = Math.min(2.4, h - .2), t = .1;
      const m = mat(k.color, .7, 0, { transparent: true, opacity: .35 });
      box(g, W, .02, D, mat(k.color, .9, 0, { transparent: true, opacity: .18 }), 0, 0, 0, false);
      box(g, W, wallH, t, m, 0, 0, -D / 2 + t / 2, false); box(g, W, wallH, t, m, 0, 0, D / 2 - t / 2, false);
      box(g, t, wallH, D, m, -W / 2 + t / 2, 0, 0, false); box(g, t, wallH, D, m, W / 2 - t / 2, 0, 0, false);
      const l = label(fx.label || k.label, k.color, 1.5); l.position.y = wallH + .4; g.add(l);
    }
  }
  return g;
}

/** Cầu thang (bậc đi lên theo hướng -z, chiếu nghỉ phía +z) / thang máy (hộp kính) */
export function linkMesh(K: Kit, ln: Link, h: number, top: boolean) {
  const { THREE, box, mat, label } = K;
  const g = new THREE.Group();
  const W = ln.w, D = ln.d;
  if (ln.kind === 'stairs') {
    const steps = Math.max(8, Math.round(h / .17)), run = D / steps;
    const m = mat('#9ca3af', .7), edge = mat('#f26b1d', .5);
    for (let i = 0; i < steps; i++) {
      const y = (i + 1) * (h / steps);
      box(g, W, top ? .04 : y, run, m, 0, top ? y - .04 : 0, D / 2 - run * (i + .5));
      box(g, W, .02, .04, edge, 0, top ? y : y, D / 2 - run * i - .02, false);
    }
    for (const s of [-1, 1]) box(g, .05, 1, D, mat('#475569', .4, .6), s * W / 2, top ? 0 : h * .4, 0, false);
  } else {
    const glass = mat('#7dd3fc', .1, .3, { transparent: true, opacity: .35 });
    box(g, W, h - .05, D, glass, 0, 0, 0, false);
    box(g, W * .8, 2.1, .05, mat('#64748b', .3, .7), 0, 0, D / 2 + .03);
  }
  const l = label(LINK_KINDS[ln.kind].label, LINK_KINDS[ln.kind].color, 1.4); l.position.y = Math.min(h, 2.6) + .3; g.add(l);
  return g;
}

const MATERIAL_COLOR: Record<Reception['material'], string> = { wood: '#a0703f', stone: '#d6d3cd', white: '#f4f4f2', metal: '#30343b' };

/** Nội thất (gồm lễ tân). rc = cấu hình lễ tân để lấy màu / vật liệu / logo */
export function furnitureMesh(K: Kit, it: FurnitureItem, st: StyleColors, rc: Reception, brand: { accent: string; logoText: string }, ceiling: number) {
  const { THREE, box, cyl, mat, label, textPanel } = K;
  const g = new THREE.Group();
  const W = it.w, D = it.d;
  const body = mat(MATERIAL_COLOR[rc.material], rc.material === 'metal' ? .35 : .6, rc.material === 'metal' ? .6 : .05);
  const front = mat(rc.color, .55, .1);
  switch (it.kind) {
    case 'desk-straight': case 'desk-compact': {
      box(g, W, 1.05, D, front); box(g, W + .06, .04, D + .08, body, 0, 1.05, 0);
      box(g, W * .9, .03, D * .5, mat('#fff7ed', .3), 0, .74, -D * .2);
      if (rc.lights) box(g, W * .96, .03, .02, mat(st.light, .3, 0, { emissive: st.light, emissiveIntensity: 1.2 }), 0, .1, D / 2 + .01, false);
      if (rc.logo === 'desk') { const p = new THREE.Mesh(new THREE.PlaneGeometry(W * .6, .32), textPanel(brand.logoText, W * .6, .32, rc.color, '#ffffff')); p.position.set(0, .62, D / 2 + .012); g.add(p); }
      box(g, .5, .32, .04, mat('#111827', .3), -W * .25, 1.09, -D * .15);
      break;
    }
    case 'desk-l': {
      box(g, W, 1.05, .8, front, 0, 0, D / 2 - .4); box(g, .8, 1.05, D - .8, front, W / 2 - .4, 0, -.4);
      box(g, W + .06, .04, .88, body, 0, 1.05, D / 2 - .4); box(g, .88, .04, D - .8, body, W / 2 - .4, 1.05, -.4);
      if (rc.lights) box(g, W * .96, .03, .02, mat(st.light, .3, 0, { emissive: st.light, emissiveIntensity: 1.2 }), 0, .1, D / 2 + .01, false);
      if (rc.logo === 'desk') { const p = new THREE.Mesh(new THREE.PlaneGeometry(W * .5, .32), textPanel(brand.logoText, W * .5, .32, rc.color, '#ffffff')); p.position.set(-W * .15, .62, D / 2 + .012); g.add(p); }
      break;
    }
    case 'back-storage': box(g, W, 2.05, D, body); for (let i = 1; i < 4; i++) box(g, .02, 2, .01, mat('#1f2937', .4), -W / 2 + W * i / 4, 0, D / 2 + .005, false); break;
    case 'brand-wall': {
      box(g, W, 2.6, D, mat(rc.color, .6));
      if (rc.logo === 'wall') { const p = new THREE.Mesh(new THREE.PlaneGeometry(W * .8, .6), textPanel(brand.logoText, W * .8, .6, rc.color, brand.accent)); p.position.set(0, 1.75, D / 2 + .01); g.add(p); }
      if (rc.lights) box(g, W * .9, .03, .03, mat(st.light, .3, 0, { emissive: st.light, emissiveIntensity: 1.5 }), 0, 2.5, D / 2 + .02, false);
      break;
    }
    case 'kiosk': box(g, .1, 1.05, .1, mat('#374151', .4, .5), 0, 0, 0); box(g, .42, .3, .05, mat('#0d1a3d', .3, 0, { emissive: '#2b4294', emissiveIntensity: .6 }), 0, 1.05, .02); { const l = label('Check-in QR', '#2b4294', .9); l.position.y = 1.65; g.add(l); } break;
    case 'sofa': box(g, W, .42, D, mat(st.wood, .8)); box(g, W, .45, .18, mat(st.wood, .8), 0, .42, -D / 2 + .09); box(g, W - .1, .1, D - .2, mat('#e7e5e4', .9), 0, .42, .05); break;
    case 'chair': box(g, W * .9, .45, D * .9, mat(st.metal, .5, .4)); box(g, W * .9, .45, .06, mat(st.metal, .5, .4), 0, .45, -D * .42); break;
    case 'consult-table': cyl(g, .05, .72, mat(st.metal, .4, .6)); cyl(g, W / 2, .04, mat(st.wood, .5), 0, .72, 0, 32); break;
    case 'display': box(g, W, 1.8, D, mat(st.wood, .6)); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) box(g, .18, .22, .16, mat(['#f26b1d', '#2b4294', '#15803d'][j], .5), -W / 2 + .3 + i * (W - .5) / 3, .25 + j * .55, .05); break;
    case 'plant': cyl(g, .22, .45, mat('#e7e5e4', .7)); { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 1), mat('#3f7d3a', .9)); s.position.y = 1.05; s.castShadow = true; g.add(s); const s2 = new THREE.Mesh(new THREE.IcosahedronGeometry(.3, 1), mat('#4f9a48', .9)); s2.position.set(.15, 1.4, .05); g.add(s2); } break;
    case 'mirror': box(g, W, 2, .03, mat('#dbeafe', .05, .9), 0, .35, 0, false); break;
    case 'linear-light': {
      const y = Math.max(2.4, ceiling - .25);
      box(g, W, .05, .08, mat('#111827', .4), 0, y, 0, false);
      box(g, W * .98, .02, .05, mat(st.light, .3, 0, { emissive: st.light, emissiveIntensity: 2.2 }), 0, y - .02, 0, false);
      break;
    }
    case 'turf': {
      box(g, W, .02, D, mat(st.turf, .95), 0, 0, 0, false);
      for (let x = -W / 2 + .5; x < W / 2; x += 1) box(g, .05, .022, D * .96, mat('#f8fafc', .9), x, 0, 0, false);
      const l = label(it.label || 'Khu tập chức năng', '#15803d', 1.6); l.position.y = .5; g.add(l);
      break;
    }
    case 'mat-zone': { box(g, W, .02, D, mat('#94a3b8', .95), 0, 0, 0, false); const l = label(it.label || 'Khu giãn cơ', '#475569', 1.5); l.position.y = .5; g.add(l); break; }
    case 'station': {
      cyl(g, .22, .012, mat('#f26b1d', .5), 0, .005, 0, 24);
      const l = label(it.label || '', '#f26b1d', .7); l.position.y = .35; g.add(l);
      break;
    }
    case 'water': box(g, .4, 1.1, .4, mat('#e5e7eb', .4)); cyl(g, .15, .4, mat('#7dd3fc', .1, 0, { transparent: true, opacity: .7 }), 0, 1.1, 0); break;
    case 'rest-bench': box(g, W, .42, D, mat(st.wood, .6)); break;
  }
  void FURNITURE;
  return g;
}

/** Nhân vật mô phỏng: thân + đầu, màu theo loại khách. Trả về nhóm có các bộ phận để đổi tư thế */
export function personMesh(K: Kit, color: string) {
  const { THREE, mat } = K;
  const g = new THREE.Group();
  const bodyM = mat(color, .7), skin = mat('#f1c7a5', .8), legM = mat('#1f2937', .8);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.17, .42, 4, 10), bodyM); torso.position.y = 1.1; torso.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.12, 14, 10), skin); head.position.y = 1.55; head.castShadow = true;
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .55, 3, 6), legM); legL.position.set(-.08, .45, 0);
  const legR = legL.clone(); legR.position.x = .08;
  g.add(torso, head, legL, legR);
  g.userData.parts = { torso, head, legL, legR };
  return g;
}
