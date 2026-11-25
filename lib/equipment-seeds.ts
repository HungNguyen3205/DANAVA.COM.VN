/**
 * Danh mục thiết bị mặc định từ đối tác thietbigym.vn (lib/equipment-catalog.json, đồng bộ bằng scripts/sync-thietbigym.mjs).
 * Chỉ dùng phía máy chủ / admin (dữ liệu lớn): trang công khai truyền danh sách đã lọc xuống trình duyệt qua props.
 */
import CATALOG from './equipment-catalog.json' with { type: 'json' };
import type { Equipment, Flooring } from './equipment.ts';

type Catalog = { syncedAt: string; source: string; flooring: Flooring | null; items: Equipment[] };
const C = CATALOG as Catalog;

/** Danh mục mặc định: tên, giá, ảnh, kích thước theo thietbigym.vn */
export const EQUIPMENT_SEEDS: Equipment[] = C.items;
/** Thảm gạch cao su lát sàn của đối tác */
export const FLOORING: Flooring | null = C.flooring;
export const CATALOG_SOURCE = { site: 'thietbigym.vn', url: C.source, syncedAt: C.syncedAt };
export const publicEquipment = (list: Equipment[] | undefined) => (list ?? EQUIPMENT_SEEDS).filter(x => x.published);
