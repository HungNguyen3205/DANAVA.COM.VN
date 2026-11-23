/**
 * So sánh hai phiên bản nội dung theo từng bản ghi (ID ổn định), để biết mỗi lần xuất bản đã đổi gì.
 * Dùng ở Nhật ký & sao lưu → Phiên bản và tab Lịch sử của từng hồ sơ.
 */
import type { SiteData } from './content.ts';

export type Change = { area: string; kind: 'them' | 'xoa' | 'sua'; id?: string; label: string };

type Rec = { id: string } & Record<string, unknown>;
const COLLECTIONS: { key: keyof SiteData; area: string; name: string }[] = [
  { key: 'posts', area: 'Bài viết', name: 'title' },
  { key: 'services', area: 'Sản phẩm & dịch vụ', name: 'title' },
  { key: 'subServices', area: 'Trang dịch vụ con', name: 'title' },
  { key: 'productGroups', area: 'Nhóm sản phẩm', name: 'name' },
  { key: 'projects', area: 'Dự án', name: 'title' },
  { key: 'showcase', area: 'Portfolio', name: 'name' },
  { key: 'landings', area: 'Landing page', name: 'title' },
  { key: 'staff', area: 'Đội ngũ', name: 'name' },
  { key: 'topics', area: 'Danh mục bài viết', name: 'name' },
  { key: 'clients', area: 'Đối tác', name: 'name' },
  { key: 'testimonials', area: 'Nhận xét', name: 'name' },
  { key: 'metrics', area: 'Số liệu', name: 'label' },
  { key: 'redirects', area: 'Chuyển hướng', name: 'from' }
];
const FIELDS: { key: keyof SiteData; label: string }[] = [
  { key: 'heroTitle', label: 'Tiêu đề H1 trang chủ' }, { key: 'headline', label: 'Thông điệp thương hiệu' },
  { key: 'description', label: 'Mô tả trang chủ' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Điện thoại' },
  { key: 'presentation', label: 'Trình chiếu mở đầu' }, { key: 'careers', label: 'Trang Tuyển dụng' }
];
const BLOCK_LABELS: Record<string, string> = {
  company: 'Thông tin công ty', menu: 'Menu điều hướng', pages: 'Chữ trên các trang', about: 'Trang Giới thiệu', ecosystem: 'Trang Hệ sinh thái',
  staff: 'Hồ sơ nhân sự', privacy: 'Chính sách quyền riêng tư', servicePolicy: 'Chính sách dịch vụ',
  contact: 'Kênh liên hệ', gallery: 'Ảnh doanh nghiệp', anna: 'Widget ANNA', pricing: 'Gói & giá DANAVA Studio'
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Thay đổi từ `before` sang `after`. */
export function diffContent(before: SiteData, after: SiteData): Change[] {
  const out: Change[] = [];
  for (const c of COLLECTIONS) {
    const a = ((before[c.key] as Rec[] | undefined) || []), b = ((after[c.key] as Rec[] | undefined) || []);
    const am = new Map(a.map(x => [x.id, x])), bm = new Map(b.map(x => [x.id, x]));
    const name = (x: Rec) => String(x[c.name] || x.id);
    for (const x of b) if (!am.has(x.id)) out.push({ area: c.area, kind: 'them', id: x.id, label: name(x) });
    for (const x of a) if (!bm.has(x.id)) out.push({ area: c.area, kind: 'xoa', id: x.id, label: name(x) });
    for (const x of b) { const old = am.get(x.id); if (old && !same(old, x)) out.push({ area: c.area, kind: 'sua', id: x.id, label: name(x) }); }
    // Chỉ đổi thứ tự
    if (!out.some(o => o.area === c.area) && !same(a.map(x => x.id), b.map(x => x.id))) out.push({ area: c.area, kind: 'sua', label: 'Thứ tự hiển thị' });
  }
  for (const f of FIELDS) if (!same(before[f.key], after[f.key])) out.push({ area: 'Thông tin chung', kind: 'sua', label: f.label });
  const blocks = (d: SiteData) => ({ ...(d.blocks || {}), ...(d.extras || {}) }) as Record<string, unknown>;
  const ba = blocks(before), bb = blocks(after);
  for (const k of new Set([...Object.keys(ba), ...Object.keys(bb)])) if (!same(ba[k], bb[k])) out.push({ area: 'Khối nội dung', kind: 'sua', label: BLOCK_LABELS[k] || k });
  return out;
}

/** Thay đổi của riêng một bản ghi (tab Lịch sử của hồ sơ). */
export function recordChanged(before: SiteData, after: SiteData, key: keyof SiteData, id: string) {
  const find = (d: SiteData) => ((d[key] as Rec[] | undefined) || []).find(x => x.id === id);
  return !same(find(before), find(after));
}
