/**
 * Thiết bị phòng gym (Quản trị → Giải pháp → Thiết bị phòng gym; trang công khai /thiet-bi-gym/; phòng lab 3D /bao-gia-setup-phong-gym/).
 * Giá do quản trị viên nhập (VNĐ, chỉ chữ số); để trống = "Liên hệ" và không cộng vào tổng.
 * Kích thước (cm) dùng để chiếm ô sàn trong phòng lab 3D. `model` = file .glb (tải lên trong admin); trống = khối hộp màu.
 */
export type EquipmentCategory = 'cardio' | 'strength' | 'free-weight' | 'functional' | 'accessory';
export type Equipment = {
  id: string; name: string; category: EquipmentCategory;
  /** Giá (VNĐ, chỉ chữ số). '' = Liên hệ */
  price: string;
  /** Kích thước thật (cm): rộng × sâu × cao */
  width: number; depth: number; height: number;
  image: string; model: string; color: string; description: string; published: boolean;
};

export const EQUIPMENT_CATEGORIES: Record<EquipmentCategory, string> = {
  cardio: 'Cardio', strength: 'Máy tập sức mạnh', 'free-weight': 'Tạ tự do', functional: 'Functional', accessory: 'Phụ kiện'
};

const e = (id: string, name: string, category: EquipmentCategory, width: number, depth: number, height: number, color: string, description: string): Equipment =>
  ({ id, name, category, price: '', width, depth, height, image: '', model: '', color, description, published: true });

/** Danh mục mẫu: kích thước thông dụng trên thị trường; giá để trống cho quản trị viên nhập. */
export const EQUIPMENT_SEEDS: Equipment[] = [
  e('treadmill', 'Máy chạy bộ', 'cardio', 200, 90, 145, '#2b4294', 'Máy chạy bộ điện cho phòng tập thương mại.'),
  e('bike', 'Xe đạp tập', 'cardio', 120, 60, 130, '#2b4294', 'Xe đạp tập đứng, kháng lực từ.'),
  e('spin-bike', 'Xe đạp spinning', 'cardio', 115, 55, 120, '#3b5bb8', 'Xe đạp lớp spinning, bánh đà nặng.'),
  e('elliptical', 'Máy chạy elip', 'cardio', 200, 70, 165, '#2b4294', 'Máy tập toàn thân, ít tác động khớp gối.'),
  e('rower', 'Máy chèo thuyền', 'cardio', 240, 60, 90, '#3b5bb8', 'Máy chèo thuyền kháng lực gió hoặc từ.'),
  e('multi-gym', 'Giàn tạ đa năng', 'strength', 250, 150, 220, '#f26b1d', 'Nhiều trạm tập trong một khung.'),
  e('smith', 'Giàn Smith', 'strength', 220, 150, 230, '#f26b1d', 'Thanh đòn trượt ray, tập an toàn.'),
  e('power-rack', 'Khung tập Power Rack', 'strength', 140, 140, 230, '#e85f12', 'Khung squat, bench, kéo xà.'),
  e('lat-pulldown', 'Máy kéo xô', 'strength', 180, 120, 220, '#f26b1d', 'Tập lưng xô, kéo cáp.'),
  e('leg-press', 'Máy đạp đùi', 'strength', 220, 140, 150, '#e85f12', 'Máy đạp đùi 45 độ.'),
  e('chest-press', 'Máy ép ngực', 'strength', 150, 130, 200, '#f26b1d', 'Tập ngực, vai, tay sau.'),
  e('bench', 'Ghế tập tạ đa năng', 'free-weight', 130, 60, 50, '#13244f', 'Ghế điều chỉnh độ dốc.'),
  e('dumbbell-rack', 'Kệ tạ đơn', 'free-weight', 200, 60, 80, '#13244f', 'Kệ 2 tầng kèm bộ tạ đơn.'),
  e('plate-tree', 'Giá treo bánh tạ', 'free-weight', 70, 70, 130, '#13244f', 'Giá treo bánh tạ và thanh đòn.'),
  e('mat-zone', 'Khu thảm tập', 'functional', 200, 100, 2, '#19b27b', 'Thảm cao su cho giãn cơ, tập bụng.'),
  e('punching-bag', 'Bao đấm', 'functional', 60, 60, 180, '#c2410c', 'Bao đấm treo hoặc đứng.'),
  e('cable-cross', 'Giàn kéo cáp đôi', 'strength', 380, 100, 230, '#e85f12', 'Kéo cáp chéo, nhiều bài tập.')
];

const IMG = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g|svg)$/;
const GLB = /^\/assets\/[a-zA-Z0-9/_.-]+\.glb$/;
const dim = (v: unknown, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= max;
const s = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;

/** Câu báo lỗi cụ thể (Quản trị → Thiết bị phòng gym) hoặc '' khi hợp lệ. */
export function equipmentError(list: unknown): string {
  if (!Array.isArray(list)) return 'Thiết bị phòng gym: dữ liệu không phải danh sách.';
  if (list.length > 200) return `Thiết bị phòng gym: có ${list.length} máy, tối đa 200.`;
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
  }
  return '';
}

export const publicEquipment = (list: Equipment[] | undefined) => (list ?? EQUIPMENT_SEEDS).filter(x => x.published);
export const priceOf = (x: Pick<Equipment, 'price'>) => (x.price ? Number(x.price) : null);
export const formatVND = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
