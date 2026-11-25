/**
 * Thư viện nội thất, lễ tân và phong cách cho công cụ thiết kế phòng tập.
 * Nội thất chưa có bảng giá chính thức: `est` là KHOẢNG GIÁ THAM KHẢO (giả định), hiển thị tách riêng,
 * không cộng vào tổng đã có giá. DANAVA báo giá thật khi khảo sát.
 */
import type { Floor, FurnKind, FurnitureItem, InteriorStyle, Reception } from './gym-project.ts';
import { uid } from './gym-project.ts';

export const INTERIOR_STYLES: Record<InteriorStyle, {
  label: string; hint: string;
  floor: string; grid: string; wall: string; accentWall: string; wood: string; metal: string; turf: string;
  light: string; lightPower: number; ambient: number; plants: number; mirrors: boolean;
}> = {
  industrial: { label: 'Công nghiệp', hint: 'Sàn cao su đen, kim loại, tường bê tông, đèn tuyến tính điểm nhấn', floor: '#2b2e34', grid: '#3a3e46', wall: '#8b8f96', accentWall: '#2f3237', wood: '#6b4a2f', metal: '#1c1f24', turf: '#3f5d3a', light: '#fff1dc', lightPower: 1.15, ambient: .85, plants: 0, mirrors: true },
  warm: { label: 'Ấm áp', hint: 'Màu trung tính, gỗ sồi, ánh sáng vàng ấm', floor: '#4a4440', grid: '#5a534e', wall: '#efe7dc', accentWall: '#b98b5e', wood: '#b07a46', metal: '#3a3631', turf: '#5f7d4a', light: '#ffd9a8', lightPower: 1, ambient: 1, plants: 1, mirrors: true },
  wellness: { label: 'Wellness', hint: 'Sáng, thoáng, gỗ nhạt và cây xanh', floor: '#d9d4cb', grid: '#c8c2b7', wall: '#fbfaf7', accentWall: '#cfe3d4', wood: '#d8b98f', metal: '#9aa3ad', turf: '#7fa36b', light: '#ffffff', lightPower: .9, ambient: 1.15, plants: 2, mirrors: false }
};

/**
 * Nội thất: kích thước mặc định (m), chiều cao, cản đường hay không, khoảng giá tham khảo (VNĐ, giả định).
 * walk = người đi qua được (thảm, khu chức năng); blocksEq = máy không được đặt lên.
 */
export const FURNITURE: Record<FurnKind, { label: string; w: number; d: number; h: number; walk: boolean; blocksEq: boolean; est?: [number, number] }> = {
  'desk-straight': { label: 'Quầy lễ tân thẳng', w: 2.4, d: .8, h: 1.1, walk: false, blocksEq: true, est: [18e6, 45e6] },
  'desk-l': { label: 'Quầy lễ tân chữ L', w: 2.8, d: 1.8, h: 1.1, walk: false, blocksEq: true, est: [28e6, 65e6] },
  'desk-compact': { label: 'Quầy lễ tân nhỏ gọn', w: 1.4, d: .7, h: 1.05, walk: false, blocksEq: true, est: [9e6, 22e6] },
  'back-storage': { label: 'Tủ lưu trữ sau quầy', w: 2.2, d: .45, h: 2.1, walk: false, blocksEq: true, est: [8e6, 20e6] },
  'brand-wall': { label: 'Vách nhận diện + logo', w: 3, d: .15, h: 2.6, walk: false, blocksEq: true, est: [12e6, 35e6] },
  kiosk: { label: 'Điểm check-in QR / DANAVA Studio', w: .5, d: .45, h: 1.3, walk: false, blocksEq: true, est: [4e6, 9e6] },
  sofa: { label: 'Ghế chờ', w: 1.8, d: .8, h: .8, walk: false, blocksEq: true, est: [6e6, 18e6] },
  chair: { label: 'Ghế', w: .55, d: .55, h: .85, walk: false, blocksEq: true, est: [.8e6, 2.5e6] },
  'consult-table': { label: 'Bàn tư vấn', w: 1, d: 1, h: .75, walk: false, blocksEq: true, est: [3e6, 9e6] },
  display: { label: 'Kệ trưng bày sản phẩm', w: 1.6, d: .45, h: 1.8, walk: false, blocksEq: true, est: [5e6, 14e6] },
  plant: { label: 'Cây xanh', w: .6, d: .6, h: 1.6, walk: false, blocksEq: true, est: [.8e6, 3e6] },
  mirror: { label: 'Gương tường', w: 3, d: .05, h: 2, walk: true, blocksEq: false, est: [2.5e6, 6e6] },
  'linear-light': { label: 'Đèn tuyến tính', w: 4, d: .08, h: .06, walk: true, blocksEq: false, est: [1.5e6, 4e6] },
  turf: { label: 'Khu tập chức năng (cỏ nhân tạo)', w: 4, d: 2, h: .02, walk: true, blocksEq: true, est: [.35e6, .7e6] },
  'mat-zone': { label: 'Khu thảm giãn cơ', w: 3, d: 2, h: .02, walk: true, blocksEq: true, est: [.3e6, .6e6] },
  station: { label: 'Mốc trạm', w: .45, d: .45, h: .01, walk: true, blocksEq: false },
  water: { label: 'Cây nước', w: .45, d: .45, h: 1.2, walk: false, blocksEq: true, est: [3e6, 8e6] },
  'rest-bench': { label: 'Ghế nghỉ', w: 1.4, d: .45, h: .45, walk: false, blocksEq: true, est: [2e6, 5e6] }
};
/** Thảm / cỏ tính theo m² (est là giá / m²) */
export const PER_M2: FurnKind[] = ['turf', 'mat-zone'];
export const furnEstimate = (f: Pick<FurnitureItem, 'kind' | 'w' | 'd'>): [number, number] | null => {
  const e = FURNITURE[f.kind].est;
  if (!e) return null;
  return PER_M2.includes(f.kind) ? [e[0] * f.w * f.d, e[1] * f.w * f.d] : e;
};

export const RECEPTION_SIZES = { s: { label: 'Nhỏ', depth: 3, width: 4.2 }, m: { label: 'Vừa', depth: 3.6, width: 5.6 }, l: { label: 'Lớn', depth: 4.4, width: 7.4 } } as const;

/** Tường chứa một điểm sát mép (để biết cửa nằm ở tường nào) và vector pháp tuyến hướng vào trong phòng */
export function wallOf(f: Pick<Floor, 'w' | 'l'>, x: number, z: number) {
  const d = [
    { wall: 'left' as const, dist: x + f.w / 2, n: [1, 0] as [number, number] },
    { wall: 'right' as const, dist: f.w / 2 - x, n: [-1, 0] as [number, number] },
    { wall: 'back' as const, dist: z + f.l / 2, n: [0, 1] as [number, number] },
    { wall: 'front' as const, dist: f.l / 2 - z, n: [0, -1] as [number, number] }
  ].sort((a, b) => a.dist - b.dist);
  return d[0];
}
/** rot để trục +z của vật quay theo vector (nx, nz) (quy ước three.js: rot 0 → +z, 1 → +x, 2 → -z, 3 → -x) */
export const rotFacing = (nx: number, nz: number) => (Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 1 : 3) : nz > 0 ? 0 : 2);

/**
 * Mô-đun "Lễ tân & đón tiếp" dựng sẵn cạnh cửa chính:
 *  - Sảnh đón chiếm dải sát tường có cửa (chiều sâu theo quy mô), được trừ khỏi diện tích xếp máy TRƯỚC khi bố trí.
 *  - Luồng hội viên đi thẳng từ cửa vào giữa sảnh (kiosk check-in bên cạnh luồng) → khu thay đồ / khu tập.
 *  - Quầy đặt lệch một bên luồng, quay mặt về cửa; sau quầy chừa 1 m làm việc + tủ lưu trữ.
 *  - Ghế chờ + bàn tư vấn ở bên kia luồng, góc trong cùng (riêng tư, không giao cắt người check-in).
 * Trả về nội thất (group 'reception'), vùng sảnh dành riêng và 2 luồng đi để vẽ.
 */
export function buildReception(rc: Reception, floor: Floor, door: { x: number; z: number } | undefined) {
  const items: FurnitureItem[] = [];
  if (!rc.enabled || !door) return { items, zone: null as null | { x0: number; x1: number; z0: number; z1: number }, flows: [] as { kind: 'member' | 'guest'; pts: [number, number][] }[] };
  const sz = RECEPTION_SIZES[rc.size];
  const { n, wall } = wallOf(floor, door.x, door.z);
  // Hệ trục sảnh: u dọc tường (sang phải khi đứng ở cửa nhìn vào), v vuông góc vào trong phòng
  const [nx, nz] = n;
  const ux = -nz, uz = nx;
  const along = wall === 'left' || wall === 'right' ? floor.l : floor.w;
  const halfW = Math.min(sz.width, along - .4) / 2;
  const doorU = door.x * ux + door.z * uz;
  const cu = Math.min(Math.max(doorU, -along / 2 + halfW + .1), along / 2 - halfW - .1);
  const wallV = wall === 'left' ? -floor.w / 2 : wall === 'right' ? -floor.w / 2 : -floor.l / 2; // toạ độ v của tường (v tính theo n)
  const depth = Math.min(sz.depth, (wall === 'left' || wall === 'right' ? floor.w : floor.l) * .45);
  const P = (u: number, v: number): [number, number] => [u * ux + (wallV + v) * nx, u * uz + (wallV + v) * nz];
  const face = rotFacing(-nx, -nz); // quay mặt về phía cửa (về tường)
  const side = doorU - cu >= 0 ? -1 : 1; // quầy đặt ở phía rộng hơn so với cửa
  const add = (kind: FurnKind, u: number, v: number, rot: number, w?: number, d?: number, label?: string) => {
    const k = FURNITURE[kind];
    const [x, z] = P(u, v);
    items.push({ id: uid('fu'), kind, floorId: floor.id, x, z, rot, w: w ?? k.w, d: d ?? k.d, group: 'reception', ...(label ? { label } : {}) });
  };
  const deskKind: FurnKind = rc.shape === 'l' ? 'desk-l' : rc.shape === 'compact' ? 'desk-compact' : 'desk-straight';
  const dk = FURNITURE[deskKind];
  const deskW = rc.shape === 'compact' ? dk.w : Math.min(dk.w * (rc.size === 'l' ? 1.15 : rc.size === 's' ? .85 : 1), halfW * .95);
  const deskU = cu + side * (halfW - deskW / 2 - .2);
  const deskV = depth - (rc.storage ? 1.75 : 1.2);
  add(deskKind, deskU, deskV + dk.d / 2, face, deskW, dk.d);
  if (rc.storage) add('back-storage', deskU, depth - .3, face, Math.min(deskW, 2.2));
  if (rc.wall && rc.logo !== 'none') add('brand-wall', deskU, depth - .08, face, Math.min(deskW + .6, halfW * 1.1), .15, 'logo');
  if (rc.kiosk) add('kiosk', doorU + side * .95, 1.6, face);
  // Ghế chờ + tư vấn: phía đối diện quầy, góc trong
  const guestU = cu - side * (halfW - 1.1);
  if (rc.seats > 0) add('sofa', guestU, .9, rotFacing(nx, nz), Math.min(.6 * rc.seats, 2.4), .8);
  if (rc.consult) { add('consult-table', guestU, depth - .9, face); add('chair', guestU - .7, depth - .9, rotFacing(ux, uz)); add('chair', guestU + .7, depth - .9, rotFacing(-ux, -uz)); }
  if (rc.display) add('display', cu - side * (halfW - .3), depth - .3, rotFacing(ux * side, uz * side), 1.6, .45);
  add('plant', cu - side * (halfW - .35), .45, 0);
  const [zx0, zz0] = P(cu - halfW, 0), [zx1, zz1] = P(cu + halfW, depth);
  const zone = { x0: Math.min(zx0, zx1), x1: Math.max(zx0, zx1), z0: Math.min(zz0, zz1), z1: Math.max(zz0, zz1) };
  const flows = [
    { kind: 'member' as const, pts: [P(doorU, .2), P(doorU, depth + 1.4)] },
    { kind: 'guest' as const, pts: [P(doorU, .2), P(doorU, 1.2), P(guestU, 1.6), P(guestU, depth - 1.7)] }
  ];
  return { items, zone, flows };
}
