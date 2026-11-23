/**
 * Thư viện khối cho landing page nội bộ (/lp/{slug}/).
 * Một bảng định nghĩa dùng chung cho: kiểm tra hợp lệ (máy chủ), bảng thuộc tính (trình chỉnh sửa),
 * tạo khối mới và hiển thị (components/site/LandingBlocks.tsx).
 * Mỗi khối: { id ổn định, type, hidden?, data, style? }. Dữ liệu lạ hoặc sai kiểu bị từ chối khi lưu.
 */

export type FieldKind = 'text' | 'textarea' | 'image' | 'link' | 'select' | 'product' | 'boolean' | 'list';
export type Field = {
  key: string;
  label: string;
  kind: FieldKind;
  max?: number;
  options?: { value: string; label: string }[];
  /** list: các trường của mỗi mục */
  fields?: Field[];
  maxItems?: number;
  hint?: string;
};

export type BlockType = 'hero' | 'text' | 'features' | 'imageText' | 'image' | 'gallery' | 'product' | 'pricing' | 'faq' | 'cta' | 'form';

export type BlockDef = {
  type: BlockType;
  label: string;
  desc: string;
  fields: Field[];
  defaults: Record<string, unknown>;
};

const text = (key: string, label: string, max = 200, hint?: string): Field => ({ key, label, kind: 'text', max, hint });
const area = (key: string, label: string, max = 3000, hint?: string): Field => ({ key, label, kind: 'textarea', max, hint });
const image = (key = 'image', label = 'Ảnh'): Field => ({ key, label, kind: 'image' });
const link = (key: string, label: string): Field => ({ key, label, kind: 'link', max: 300, hint: 'Trang trong website (/lien-he/) hoặc https://…' });

export const BLOCKS: BlockDef[] = [
  {
    type: 'hero', label: 'Mở đầu', desc: 'Tiêu đề lớn, câu dẫn, ảnh và nút kêu gọi.',
    fields: [text('kicker', 'Dòng chữ nhỏ', 80), text('title', 'Tiêu đề (H1)', 150), area('lead', 'Câu dẫn', 500), image(),
      text('primaryLabel', 'Nút chính: chữ', 40), link('primaryHref', 'Nút chính: đường dẫn'), text('secondaryLabel', 'Nút phụ: chữ', 40), link('secondaryHref', 'Nút phụ: đường dẫn')],
    defaults: { kicker: 'DANAVA', title: 'Tiêu đề landing page', lead: 'Một câu nói rõ lợi ích chính cho khách hàng.', image: '', primaryLabel: 'Nhận tư vấn', primaryHref: '#dang-ky', secondaryLabel: '', secondaryHref: '' }
  },
  {
    type: 'text', label: 'Đoạn văn', desc: 'Tiêu đề và nội dung chữ. Dòng trống tách đoạn.',
    fields: [text('title', 'Tiêu đề', 150), area('body', 'Nội dung', 6000)],
    defaults: { title: 'Tiêu đề đoạn', body: 'Nội dung đoạn văn.' }
  },
  {
    type: 'features', label: 'Tính năng / lợi ích', desc: 'Lưới các ý chính, mỗi ý có tiêu đề và mô tả.',
    fields: [text('title', 'Tiêu đề', 150), area('lead', 'Câu dẫn', 500),
      { key: 'items', label: 'Các ý', kind: 'list', maxItems: 12, fields: [text('title', 'Tiêu đề', 120), area('text', 'Mô tả', 500)] }],
    defaults: { title: 'Vì sao chọn DANAVA', lead: '', items: [{ title: 'Lợi ích 1', text: 'Mô tả ngắn.' }, { title: 'Lợi ích 2', text: 'Mô tả ngắn.' }, { title: 'Lợi ích 3', text: 'Mô tả ngắn.' }] }
  },
  {
    type: 'imageText', label: 'Ảnh + chữ', desc: 'Ảnh một bên, chữ và nút một bên.',
    fields: [text('title', 'Tiêu đề', 150), area('body', 'Nội dung', 3000), image(),
      { key: 'imageSide', label: 'Ảnh nằm bên', kind: 'select', options: [{ value: 'left', label: 'Trái' }, { value: 'right', label: 'Phải' }] },
      text('buttonLabel', 'Nút: chữ', 40), link('buttonHref', 'Nút: đường dẫn')],
    defaults: { title: 'Tiêu đề', body: 'Nội dung.', image: '', imageSide: 'right', buttonLabel: '', buttonHref: '' }
  },
  {
    type: 'image', label: 'Ảnh', desc: 'Một ảnh lớn kèm chú thích.',
    fields: [image(), text('alt', 'Mô tả ảnh (cho Google, người khiếm thị)', 200), text('caption', 'Chú thích', 200)],
    defaults: { image: '', alt: '', caption: '' }
  },
  {
    type: 'gallery', label: 'Bộ ảnh', desc: 'Lưới nhiều ảnh.',
    fields: [text('title', 'Tiêu đề', 150), { key: 'images', label: 'Ảnh', kind: 'list', maxItems: 12, fields: [image('src', 'Ảnh'), text('caption', 'Chú thích', 150)] }],
    defaults: { title: '', images: [] }
  },
  {
    type: 'product', label: 'Thẻ sản phẩm', desc: 'Tên, mô tả và tính năng lấy từ hồ sơ sản phẩm đã xuất bản. Sửa ở hồ sơ là cập nhật mọi nơi.',
    fields: [{ key: 'productId', label: 'Sản phẩm', kind: 'product' }, { key: 'showFeatures', label: 'Hiện danh sách tính năng', kind: 'boolean' }, text('buttonLabel', 'Nút: chữ', 40)],
    defaults: { productId: '', showFeatures: true, buttonLabel: 'Xem chi tiết' }
  },
  {
    type: 'pricing', label: 'Bảng giá', desc: 'Các gói & giá lấy từ hồ sơ sản phẩm đã xuất bản.',
    fields: [text('title', 'Tiêu đề', 150), { key: 'productId', label: 'Sản phẩm', kind: 'product' }],
    defaults: { title: 'Bảng giá', productId: '' }
  },
  {
    type: 'faq', label: 'Câu hỏi thường gặp', desc: 'Danh sách câu hỏi – trả lời.',
    fields: [text('title', 'Tiêu đề', 150), { key: 'items', label: 'Câu hỏi', kind: 'list', maxItems: 20, fields: [text('q', 'Câu hỏi', 300), area('a', 'Trả lời', 2000)] }],
    defaults: { title: 'Câu hỏi thường gặp', items: [{ q: 'Câu hỏi?', a: 'Trả lời.' }] }
  },
  {
    type: 'cta', label: 'Kêu gọi hành động', desc: 'Dải màu với tiêu đề và nút.',
    fields: [text('title', 'Tiêu đề', 150), area('lead', 'Câu dẫn', 500), text('buttonLabel', 'Nút: chữ', 40), link('buttonHref', 'Nút: đường dẫn')],
    defaults: { title: 'Sẵn sàng bắt đầu?', lead: 'Để lại thông tin, DANAVA liên hệ trong ngày làm việc.', buttonLabel: 'Liên hệ ngay', buttonHref: '#dang-ky' }
  },
  {
    type: 'form', label: 'Biểu mẫu đăng ký', desc: 'Khách để lại họ tên, số điện thoại, nhu cầu. Yêu cầu về mục Khách hàng, nguồn là landing page này.',
    fields: [text('title', 'Tiêu đề', 150), area('lead', 'Câu dẫn', 500), text('service', 'Dịch vụ quan tâm (ghi vào yêu cầu)', 120), text('buttonLabel', 'Nút gửi: chữ', 40)],
    defaults: { title: 'Đăng ký nhận tư vấn', lead: 'DANAVA liên hệ lại trong ngày làm việc.', service: '', buttonLabel: 'Gửi đăng ký' }
  }
];

export const blockDef = (type: string) => BLOCKS.find(b => b.type === type);

/* ------------------------------------------------------------ Cấu hình hiển thị (bám lưới, có giới hạn) */
export type BlockStyle = {
  align?: 'left' | 'center' | 'right';
  /** Cỡ chữ: % so với mặc định */
  size?: number;
  color?: 'default' | 'navy' | 'orange' | 'white' | 'muted';
  bg?: 'none' | 'white' | 'soft' | 'navy' | 'orange';
  width?: 'narrow' | 'normal' | 'wide' | 'full';
  /** Chiều cao tối thiểu (px) */
  minHeight?: number;
  padTop?: number;
  padBottom?: number;
};

export const STYLE_LIMITS = { size: [80, 160], minHeight: [0, 900], padTop: [0, 200], padBottom: [0, 200] } as const;
export const STYLE_STEP = { size: 5, minHeight: 20, padTop: 8, padBottom: 8 } as const;
export const STYLE_OPTIONS = {
  align: [{ value: 'left', label: 'Trái' }, { value: 'center', label: 'Giữa' }, { value: 'right', label: 'Phải' }],
  color: [{ value: 'default', label: 'Mặc định' }, { value: 'navy', label: 'Xanh navy' }, { value: 'orange', label: 'Cam' }, { value: 'white', label: 'Trắng' }, { value: 'muted', label: 'Xám nhạt' }],
  bg: [{ value: 'none', label: 'Trong suốt' }, { value: 'white', label: 'Trắng' }, { value: 'soft', label: 'Kem nhạt' }, { value: 'navy', label: 'Navy' }, { value: 'orange', label: 'Cam' }],
  width: [{ value: 'narrow', label: 'Hẹp (720px)' }, { value: 'normal', label: 'Vừa (1040px)' }, { value: 'wide', label: 'Rộng (1240px)' }, { value: 'full', label: 'Tràn màn hình' }]
} as const;

export type PageBlock = { id: string; type: BlockType; hidden?: boolean; data: Record<string, unknown>; style?: BlockStyle };

/* ------------------------------------------------------------ Kiểm tra hợp lệ */
const IMAGE_PATH = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g|svg)$/;
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const okImage = (v: unknown) => typeof v === 'string' && (v === '' || (IMAGE_PATH.test(v) && !v.includes('..')));
/** Đường dẫn nút: trống, neo trong trang (#…), trang trong website (/…) hoặc https://… */
export const okLink = (v: unknown) => typeof v === 'string' && v.length <= 300
  && (v === '' || /^#[a-z0-9-]{1,60}$/.test(v) || (/^\/[a-z0-9\-/#?=&._%]*$/i.test(v) && !v.startsWith('//')) || /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i.test(v));

function okField(f: Field, v: unknown): boolean {
  switch (f.kind) {
    case 'text': case 'textarea': return typeof v === 'string' && v.length <= (f.max || 3000);
    case 'image': return okImage(v);
    case 'link': return okLink(v);
    case 'select': return typeof v === 'string' && !!f.options?.some(o => o.value === v);
    case 'product': return typeof v === 'string' && v.length <= 100;
    case 'boolean': return typeof v === 'boolean';
    case 'list': return Array.isArray(v) && v.length <= (f.maxItems || 20) && v.every(item => obj(item) && (f.fields || []).every(sf => okField(sf, item[sf.key])) && Object.keys(item).every(k => f.fields!.some(sf => sf.key === k)));
  }
}

const inRange = (v: unknown, [lo, hi]: readonly [number, number]) => v === undefined || (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi);
const inOptions = (v: unknown, opts: readonly { value: string }[]) => v === undefined || opts.some(o => o.value === v);

export function validStyle(s: unknown): boolean {
  if (s === undefined) return true;
  if (!obj(s)) return false;
  const known = ['align', 'size', 'color', 'bg', 'width', 'minHeight', 'padTop', 'padBottom'];
  return Object.keys(s).every(k => known.includes(k))
    && inOptions(s.align, STYLE_OPTIONS.align) && inOptions(s.color, STYLE_OPTIONS.color) && inOptions(s.bg, STYLE_OPTIONS.bg) && inOptions(s.width, STYLE_OPTIONS.width)
    && inRange(s.size, STYLE_LIMITS.size) && inRange(s.minHeight, STYLE_LIMITS.minHeight) && inRange(s.padTop, STYLE_LIMITS.padTop) && inRange(s.padBottom, STYLE_LIMITS.padBottom);
}

export function validPageBlock(b: unknown): b is PageBlock {
  if (!obj(b) || typeof b.id !== 'string' || !/^[a-z0-9_-]{4,40}$/i.test(b.id) || typeof b.type !== 'string') return false;
  const def = blockDef(b.type);
  if (!def || !obj(b.data) || (b.hidden !== undefined && typeof b.hidden !== 'boolean') || !validStyle(b.style)) return false;
  const data = b.data;
  return def.fields.every(f => okField(f, data[f.key])) && Object.keys(data).every(k => def.fields.some(f => f.key === k));
}

/** Khối mới với dữ liệu mặc định và ID ổn định. */
export function newBlock(type: BlockType): PageBlock {
  const def = blockDef(type)!;
  return { id: 'b' + globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 11), type, data: structuredClone(def.defaults) };
}

/** Nhân bản khối: dữ liệu giống hệt, ID mới. */
export const cloneBlock = (b: PageBlock): PageBlock => ({ ...structuredClone(b), id: newBlock(b.type).id });
