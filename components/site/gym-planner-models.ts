/**
 * Mô hình 3D dựng sẵn cho từng loại máy (phòng lab setup phòng gym). Dựng từ khối cơ bản theo kích thước thật (m):
 * trục x = chiều dài (width), z = chiều sâu (depth), y = chiều cao; tâm ở giữa đáy.
 * Khi máy có file .glb (Quản trị → Thiết bị phòng gym) thì phòng lab dùng file đó thay cho mô hình này.
 */
import type * as T from 'three';
import type { Equipment, EquipmentKind } from '@/lib/equipment';

type Three = typeof import('three');
export type Built = { group: T.Group; mats: T.MeshStandardMaterial[] };

/** Đoán loại máy theo tên khi dữ liệu chưa có `kind` (danh mục cũ / máy tự thêm) */
export function guessKind(eq: Equipment): EquipmentKind {
  if (eq.kind) return eq.kind;
  const n = eq.name.toLowerCase();
  if (/chạy bộ|treadmill/.test(n)) return 'treadmill';
  if (/elip|elliptical/.test(n)) return 'elliptical';
  if (/chèo|rower|ski/.test(n)) return 'rower';
  if (/xe đạp|bike|cycle/.test(n)) return 'bike';
  if (/đa năng|multi|functional/.test(n)) return 'multi';
  if (/cáp|cable|pulley/.test(n)) return 'cable';
  if (/smith/.test(n)) return 'smith';
  if (/rack|khung/.test(n)) return /dumbbell|tạ đơn/.test(n) ? 'dumbbell-rack' : 'rack';
  if (/kệ tạ/.test(n)) return 'dumbbell-rack';
  if (/bánh tạ|plate/.test(n)) return 'plate-tree';
  if (/ghế|bench/.test(n)) return 'bench';
  if (eq.category === 'accessory' || eq.category === 'functional') return 'accessory';
  return eq.category === 'cardio' ? 'treadmill' : 'stack';
}

export function buildModel(THREE: Three, eq: Equipment): Built {
  const W = eq.width / 100, D = eq.depth / 100, H = Math.max(eq.height / 100, 0.05);
  const g = new THREE.Group();
  const mk = (color: number | string, rough = .55, metal = .2) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const frame = mk(0x4a5263, .4, .6), pad = mk(0x1b1e24, .85, 0), accent = mk(eq.color, .5, .15), chrome = mk(0xc7ccd6, .3, .8), plate = mk(0x15171c, .6, .1), screen = mk(0x0d1a3d, .3, .1);
  const mats = [frame, pad, accent, chrome, plate, screen];
  const add = (m: T.Mesh) => { m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  const box = (w: number, h: number, d: number, mat: T.Material, x: number, y: number, z: number, rz = 0, rx = 0) => {
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, .01), Math.max(h, .01), Math.max(d, .01)), mat));
    m.position.set(x, y, z); m.rotation.set(rx, 0, rz); return m;
  };
  /** Trụ đứng (trục y) */
  const post = (r: number, h: number, mat: T.Material, x: number, y0: number, z: number) => { const m = add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 14), mat)); m.position.set(x, y0 + h / 2, z); return m; };
  /** Đĩa / bánh xe (trục z) */
  const disc = (r: number, t: number, mat: T.Material, x: number, y: number, z: number, axis: 'x' | 'z' = 'z') => {
    const m = add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 24), mat));
    m.position.set(x, y, z); if (axis === 'z') m.rotation.x = Math.PI / 2; else m.rotation.z = Math.PI / 2; return m;
  };
  /** Thanh ngang (trục x hoặc z) */
  const bar = (len: number, r: number, mat: T.Material, x: number, y: number, z: number, axis: 'x' | 'z' = 'x') => disc(r, len, mat, x, y, z, axis === 'x' ? 'x' : 'z');
  const stack = (x: number, z: number, h: number, sw = .32, sd = .22) => {
    box(sw + .14, .06, sd + .14, frame, x, .03, z);
    for (const sz of [-1, 1]) box(.06, h, .06, frame, x, h / 2, z + sz * (sd / 2 + .06));
    post(.012, h * .9, chrome, x - .05, 0, z); post(.012, h * .9, chrome, x + .05, 0, z);
    for (let i = 0; i < 9; i++) box(sw, .045, sd, plate, x, .1 + i * .05, z);
    box(sw * .2, .05, sd * .9, chrome, x, .1 + 9 * .05, z);
    box(sw + .06, h * .42, .02, accent, x, h * .55, z - sd / 2 - .02);
    box(sw + .14, .07, sd + .14, frame, x, h, z);
  };
  /** Hai thanh chân đế mảnh (thay tấm đế phủ kín) */
  const rails = (len: number, z1: number, z2: number, x = 0) => { box(len, .06, .08, frame, x, .03, z1); box(len, .06, .08, frame, x, .03, z2); };
  /** Ghế + tựa (cao ngồi ~0.5 m) */
  const seat = (x: number, z: number, back: number, recline = .08) => {
    box(.08, .45, .08, frame, x, .23, z); box(.44, .09, .38, pad, x, .5, z);
    if (back) box(.09, back, .36, pad, x - .24, .5 + back / 2, z, -recline);
  };

  switch (guessKind(eq)) {
    case 'treadmill': {
      box(W, .16, D * .8, frame, 0, .08, 0);
      box(W * .8, .02, D * .58, pad, -W * .04, .17, 0);
      box(.34, .26, D * .82, accent, W / 2 - .2, .2, 0);
      for (const s of [-1, 1]) { const p = box(.07, H * .7, .07, frame, W / 2 - .28, H * .36, s * D * .38, .18); p.castShadow = true; box(W * .3, .04, .05, chrome, W / 2 - .45, H * .6, s * D * .4); }
      box(.12, .32, D * .78, screen, W / 2 - .36, H * .78, 0, .5);
      break;
    }
    case 'bike': case 'recumbent': {
      box(W * .95, .06, D * .55, frame, 0, .03, 0);
      disc(Math.min(H * .2, .26), .07, accent, W * .3, H * .24, 0);
      if (guessKind(eq) === 'recumbent') {
        box(W * .38, .1, D * .5, pad, -W * .15, H * .36, 0); box(.1, H * .45, D * .5, pad, -W * .36, H * .56, 0, .35);
        box(W * .5, .08, .08, frame, W * .05, H * .3, 0);
      } else {
        box(.08, H * .55, .08, frame, -W * .12, H * .3, 0, -.25);
        box(.26, .07, .18, pad, -W * .2, H * .62, 0);
        box(.08, H * .7, .08, frame, W * .28, H * .38, 0, .2);
        bar(D * .7, .02, chrome, W * .33, H * .82, 0, 'z');
      }
      box(.08, .2, .26, screen, W * .34, H * .92, 0, .4);
      break;
    }
    case 'elliptical': {
      box(W, .1, D * .45, frame, 0, .05, 0);
      disc(H * .16, .12, accent, -W * .38, H * .18, 0);
      for (const s of [-1, 1]) { box(W * .45, .05, .14, chrome, W * .02, .22, s * D * .22); box(.05, H * .72, .05, frame, W * .22, H * .45, s * D * .3, -.2); }
      box(.1, H * .8, .1, frame, W * .36, H * .4, 0); box(.1, .22, .3, screen, W * .36, H * .82, 0, .4);
      break;
    }
    case 'rower': {
      box(W, .08, .14, chrome, 0, .25, 0); box(.1, .25, .1, frame, -W * .45, .12, 0); box(.1, .25, .1, frame, W * .45, .12, 0);
      box(.32, .08, D * .55, pad, -W * .1, .33, 0);
      disc(.24, .18, accent, W * .4, .4, 0); box(.1, .25, .25, screen, W * .38, .78, 0, .5);
      break;
    }
    case 'stack': {
      // Máy tạ có cục tạ: tháp cục tạ phía sau, dáng ghế / tay đòn theo bài tập (đọc từ tên máy)
      const n = eq.name.toLowerCase();
      const tx = -W / 2 + .3;
      rails(W, -D / 2 + .1, D / 2 - .1);
      stack(tx, 0, H * .96);
      const cx = tx + .55;
      box(.08, H * .55, .08, frame, cx - .15, H * .28, 0);
      if (/pulldown|pull down|kéo xô|lat |high pull|long pull|row|chèo|chin|dip|assist/.test(n)) {
        // Kéo xô / chèo: xà cao vươn ra trước, thanh kéo, ghế, đệm giữ đùi
        box(.08, H * .95, .08, frame, cx, H * .48, 0);
        box(W * .55, .08, .08, frame, cx + W * .25, H * .95, 0);
        bar(D * .9, .016, chrome, cx + W * .45, H * .72, 0, 'z');
        post(.006, H * .2, chrome, cx + W * .45, H * .74, 0);
        seat(cx + W * .3, 0, 0);
        bar(D * .5, .06, pad, cx + W * .3, .78, 0, 'z');
      } else if (/leg press|đạp đùi/.test(n)) {
        // Đạp đùi: ghế ngả, bàn đạp đứng phía trước
        box(.55, .09, .42, pad, cx + .1, .45, 0, .2);
        box(.1, .6, .42, pad, cx - .25, .7, 0, -.9);
        box(.08, .7, .5, accent, Math.min(W / 2 - .15, cx + .85), .6, 0, .25);
        box(W * .5, .1, .1, frame, cx + .4, .3, 0);
      } else if (/leg extension|leg extensi|đá đùi|leg curl|móc đùi|đùi sau/.test(n)) {
        // Đá / móc đùi: ghế + con lăn đệm chân phía trước
        seat(cx + .15, 0, .55);
        box(.06, .35, .06, accent, cx + .5, .4, 0, .3);
        bar(.4, .06, pad, cx + .55, .25, 0, 'z');
        bar(.4, .06, pad, cx + .42, .62, 0, 'z');
      } else if (/fly|rear delt|pec/.test(n)) {
        // Ép ngực: hai tay đòn mở rộng hai bên
        seat(cx + .2, 0, .7, 0);
        for (const sz of [-1, 1]) { box(.06, .06, D * .42, accent, cx + .1, H * .62, sz * D * .26); box(.05, .35, .05, chrome, cx + .1, H * .52, sz * D * .46); }
      } else if (/abdominal|bụng|torso|rotary|back extension|lưng/.test(n)) {
        // Bụng / lưng / xoay hông: đệm cong
        seat(cx + .2, 0, .55, .25);
        box(.3, .1, .4, pad, cx + .45, .95, 0, .9);
        box(.06, .4, .06, accent, cx + .4, .75, 0);
      } else if (/abductor|adductor|hip|mông|glute|kick/.test(n)) {
        // Dạng / khép chân, mông: ghế + hai đệm chân
        seat(cx + .2, 0, .6, .3);
        for (const sz of [-1, 1]) box(.42, .2, .06, accent, cx + .5, .55, sz * .22);
      } else if (/calf|bắp chân/.test(n)) {
        // Bắp chân: đệm vai đứng
        box(.4, .06, .4, accent, cx + .25, .1, 0);
        box(.08, H * .7, .08, frame, cx + .1, H * .35, 0);
        for (const sz of [-1, 1]) box(.3, .1, .12, pad, cx + .25, H * .62, sz * .14);
      } else {
        // Đẩy ngực / vai, tay trước / sau (mặc định): ghế đứng, hai tay đẩy
        seat(cx + .2, 0, .7, .05);
        for (const sz of [-1, 1]) { box(.45, .06, .06, accent, cx + .45, H * .58, sz * .3); box(.06, .14, .06, chrome, cx + .66, H * .52, sz * .3); }
        box(.08, .1, D * .66, frame, cx + .22, H * .62, 0);
      }
      break;
    }
    case 'plate': {
      // Máy tạ treo bánh: khung, ghế, tay đòn chéo, bánh tạ hai bên
      rails(W, -D / 2 + .1, D / 2 - .1);
      box(.1, .1, D - .2, frame, -W / 2 + .1, .05, 0); box(.1, .1, D - .2, frame, W / 2 - .1, .05, 0);
      const n = eq.name.toLowerCase();
      if (/squat|hack|leg press|belt/.test(n)) { box(.6, .09, .45, pad, -W * .1, .55, 0, .5); box(.08, .5, .5, accent, W * .3, .45, 0, .2); }
      else seat(-W * .15, 0, .65, .2);
      const arm = box(W * .7, .1, .1, accent, W * .08, H * .58, 0, -.25); arm.castShadow = true;
      for (const sz of [-1, 1]) { box(.08, H * .62, .08, frame, -W * .38, H * .31, sz * D * .3); bar(.32, .025, chrome, W * .38, H * .5, sz * D * .36, 'z'); disc(.22, .05, plate, W * .38, H * .5, sz * D * .44); disc(.17, .04, plate, W * .38, H * .5, sz * D * .49); }
      break;
    }
    case 'multi': {
      rails(W, -D / 2 + .1, D / 2 - .1);
      const n = W > 3.6 ? 4 : W > 2.6 ? 3 : 2;
      for (let i = 0; i < n; i++) stack(-W / 2 + .3 + i * ((W - .6) / Math.max(n - 1, 1)), -D / 2 + .3, H * .95);
      box(W, .1, .12, frame, 0, H, -D / 2 + .3);
      for (const x of [-W / 2 + .08, W / 2 - .08]) box(.1, H, .1, frame, x, H / 2, D / 2 - .1);
      box(W, .1, .1, accent, 0, H, D / 2 - .1);
      box(.42, .1, .36, pad, 0, .48, D * .1);
      break;
    }
    case 'cable': {
      rails(W, -D * .25, D * .25);
      const towers = W > 2 ? [-W / 2 + .3, W / 2 - .3] : [0];
      for (const x of towers) { stack(x, 0, H * .96); box(.14, H, .14, frame, x + .25 * Math.sign(x || 1), H / 2, 0); }
      if (towers.length > 1) box(W - .3, .1, .1, accent, 0, H * .96, 0);
      break;
    }
    case 'smith': case 'rack': {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(.08, H, .08, frame, sx * (W / 2 - .06), H / 2, sz * (D / 2 - .06));
      for (const sz of [-1, 1]) box(W, .08, .08, frame, 0, H - .04, sz * (D / 2 - .06));
      for (const sx of [-1, 1]) box(.08, .08, D, frame, sx * (W / 2 - .06), H - .04, 0);
      if (guessKind(eq) === 'smith') for (const sx of [-1, 1]) box(.03, H * .9, .03, chrome, sx * (W / 2 - .22), H * .47, 0);
      bar(W + .2, .018, chrome, 0, H * .55, 0);
      for (const sx of [-1, 1]) { disc(.22, .05, plate, sx * (W / 2 + .02), H * .55, 0, 'x'); disc(.17, .04, plate, sx * (W / 2 + .08), H * .55, 0, 'x'); }
      box(W * .9, .03, D * .9, plate, 0, .015, 0);
      box(W * .3, .035, D * .9, accent, 0, .018, 0);
      break;
    }
    case 'bench': {
      const incline = eq.width >= 150;
      for (const sx of [-1, 1]) box(.08, .38, D * .8, frame, sx * W * .35, .19, 0);
      box(W * .5, .1, Math.min(D, .32), pad, -W * .15, .44, 0);
      if (incline) box(W * .45, .1, Math.min(D, .32), pad, W * .2, .62, 0, .5); else box(W * .4, .1, Math.min(D, .32), pad, W * .25, .44, 0);
      if (eq.height > 100) for (const sz of [-1, 1]) { box(.07, H, .07, frame, W * .38, H / 2, sz * D * .35); }
      box(W * .7, .05, .06, accent, 0, .1, 0);
      break;
    }
    case 'dumbbell-rack': {
      for (const sx of [-1, 0, 1]) box(.06, H, D * .8, frame, sx * (W / 2 - .05), H / 2, 0);
      for (const [y, z] of [[H * .45, -D * .12], [H * .9, D * .12]] as const) {
        box(W, .04, D * .35, frame, 0, y, z, 0, .25);
        const n = Math.max(3, Math.floor(W / .2));
        for (let i = 0; i < n; i++) { const x = -W / 2 + .12 + i * ((W - .24) / (n - 1)); bar(.24, .03, chrome, x, y + .06, z, 'z'); disc(.05, .05, plate, x, y + .06, z - .1); disc(.05, .05, plate, x, y + .06, z + .1); }
      }
      break;
    }
    case 'plate-tree': {
      box(W, .06, D, frame, 0, .03, 0); box(.1, H, .1, frame, 0, H / 2, 0);
      for (const [y, a] of [[H * .3, 0], [H * .55, Math.PI / 2], [H * .8, Math.PI]] as const) for (const s of [-1, 1]) {
        const x = Math.cos(a) * .18 * s, z = Math.sin(a) * .18 * s;
        disc(.2, .04, plate, x * 1.3, y, z * 1.3, Math.abs(Math.cos(a)) > .5 ? 'x' : 'z');
      }
      break;
    }
    default: {
      box(W, H, D, accent, 0, H / 2, 0);
    }
  }
  return { group: g, mats };
}
