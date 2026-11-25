/**
 * Thiết bị phòng gym (Quản trị → Giải pháp → Thiết bị phòng gym; trang công khai /thiet-bi-gym/; phòng lab 3D /bao-gia-setup-phong-gym/).
 * Giá do quản trị viên nhập (VNĐ, chỉ chữ số); để trống = "Liên hệ" và không cộng vào tổng.
 * Kích thước (cm) dùng để chiếm ô sàn trong phòng lab 3D. `model` = file .glb (tải lên trong admin); trống = mô hình dựng sẵn theo loại máy.
 * Danh mục mặc định: đối tác thietbigym.vn (lib/equipment-catalog.json, đồng bộ bằng scripts/sync-thietbigym.mjs).
 */
// Danh mục đối tác (dữ liệu lớn) nằm ở lib/equipment-seeds.ts để trang trình duyệt không phải tải.
export type EquipmentCategory = 'cardio' | 'strength' | 'free-weight' | 'functional' | 'accessory';
export type Equipment = {
  id: string; name: string; category: EquipmentCategory;
  /** Giá (VNĐ, chỉ chữ số). '' = Liên hệ */
  price: string;
  /** Kích thước thật (cm): rộng × sâu × cao */
  width: number; depth: number; height: number;
  image: string; model: string; color: string; description: string; published: boolean;
  /** Loại máy → mô hình 3D dựng sẵn (components/site/gym-planner-models.ts) */
  kind?: EquipmentKind;
  sku?: string;
  /** Trang sản phẩm gốc của đối tác */
  source?: string;
  /** Kích thước ước tính theo loại máy (nguồn không ghi) */
  dimsEstimated?: boolean;
};
export const EQUIPMENT_KINDS = ['treadmill', 'bike', 'recumbent', 'elliptical', 'rower', 'stack', 'plate', 'multi', 'cable', 'smith', 'rack', 'bench', 'dumbbell-rack', 'plate-tree', 'accessory'] as const;
export type EquipmentKind = typeof EQUIPMENT_KINDS[number];
export const KIND_LABEL: Record<EquipmentKind, string> = {
  treadmill: 'Máy chạy bộ', bike: 'Xe đạp tập', recumbent: 'Xe đạp nằm', elliptical: 'Máy elip', rower: 'Máy chèo / ski', stack: 'Máy tạ có cục tạ', plate: 'Máy tạ treo bánh',
  multi: 'Giàn đa năng', cable: 'Giàn kéo cáp', smith: 'Giàn Smith', rack: 'Khung tạ (rack)', bench: 'Ghế tập', 'dumbbell-rack': 'Kệ tạ đơn', 'plate-tree': 'Giá bánh tạ', accessory: 'Phụ kiện'
};
/** Thảm gạch lát sàn (đối tác): tính chi phí sàn trong phòng lab */
export type Flooring = { name: string; price: string; sizeCm: number; source: string };

export const EQUIPMENT_CATEGORIES: Record<EquipmentCategory, string> = {
  cardio: 'Cardio', strength: 'Máy tập sức mạnh', 'free-weight': 'Tạ tự do', functional: 'Functional', accessory: 'Phụ kiện'
};

/** Mã danh mục mẫu cũ (17 máy, chưa có giá) — dữ liệu đã lưu chỉ gồm các mã này thì chuyển sang danh mục đối tác */
export const LEGACY_SEED_IDS = ['treadmill', 'bike', 'spin-bike', 'elliptical', 'rower', 'multi-gym', 'smith', 'power-rack', 'lat-pulldown', 'leg-press', 'chest-press', 'bench', 'dumbbell-rack', 'plate-tree', 'mat-zone', 'punching-bag', 'cable-cross'];


const IMG = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g|svg)$/;
const GLB = /^\/assets\/[a-zA-Z0-9/_.-]+\.glb$/;
const dim = (v: unknown, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= max;
const s = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;

/** Câu báo lỗi cụ thể (Quản trị → Thiết bị phòng gym) hoặc '' khi hợp lệ. */
export function equipmentError(list: unknown): string {
  if (!Array.isArray(list)) return 'Thiết bị phòng gym: dữ liệu không phải danh sách.';
  if (list.length > 400) return `Thiết bị phòng gym: có ${list.length} máy, tối đa 400.`;
  const ids = new Set<string>();
  for (let i = 0; i < list.length; i++) {
    const x = list[i] as Record<string, unknown>;
    const where = `Giải pháp → Thiết bị phòng gym → «${typeof x?.name === 'string' && x.name ? x.name : `mục thứ ${i + 1}`}»`;
    if (!x || typeof x !== 'object') return `${where}: dữ liệu không hợp lệ.`;
    if (!s(x.id, 60) || !/^[a-z0-9-]+$/.test(x.id as string)) return `${where}: mã không hợp lệ.`;
    if (ids.has(x.id as string)) return `${where}: mã "${x.id}" bị trùng.`;
    ids.add(x.id as string);
    if (!s(x.name, 120) || !(x.name as string).trim()) return `${where}: chưa có tên (tối đa 120 ký tự).`;
    if (!(x.category as string in EQUIPMENT_CATEGORIES)) return `${where}: nhóm máy không hợp lệ.`;
    if (!s(x.price, 12) || !/^\d*$/.test(x.price as string)) return `${where}: giá "${x.price}" chỉ gồm chữ số (VNĐ), để trống = Liên hệ.`;
    if (!dim(x.width, 2000) || !dim(x.depth, 2000)) return `${where}: kích thước rộng × sâu phải là số nguyên 1–2000 cm.`;
    if (!dim(x.height, 500)) return `${where}: chiều cao phải là số nguyên 1–500 cm.`;
    if (!s(x.image, 250) || (x.image !== '' && !IMG.test(x.image as string))) return `${where}: ảnh phải là ảnh trong Thư viện ảnh (/assets/…).`;
    if (!s(x.model, 250) || (x.model !== '' && !GLB.test(x.model as string))) return `${where}: mô hình 3D phải là file .glb đã tải lên.`;
    if (!s(x.color, 9) || !/^#[0-9a-f]{6}$/i.test(x.color as string)) return `${where}: màu khối phải dạng #rrggbb.`;
    if (!s(x.description, 500)) return `${where}: mô tả tối đa 500 ký tự.`;
    if (typeof x.published !== 'boolean') return `${where}: trạng thái hiển thị không hợp lệ.`;
    if (x.kind !== undefined && !(EQUIPMENT_KINDS as readonly string[]).includes(x.kind as string)) return `${where}: loại máy không hợp lệ.`;
    if (x.sku !== undefined && !s(x.sku, 60)) return `${where}: mã SKU tối đa 60 ký tự.`;
    if (x.source !== undefined && (!s(x.source, 300) || !/^https:\/\/[^\s"'<>]+$/.test(x.source as string))) return `${where}: link sản phẩm gốc phải là https://…`;
    if (x.dimsEstimated !== undefined && typeof x.dimsEstimated !== 'boolean') return `${where}: đánh dấu kích thước ước tính không hợp lệ.`;
  }
  return '';
}

export const priceOf = (x: Pick<Equipment, 'price'>) => (x.price ? Number(x.price) : null);
export const formatVND = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
