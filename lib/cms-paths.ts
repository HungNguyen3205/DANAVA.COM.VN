/**
 * Khóa dữ liệu của vùng chỉnh trực tiếp trên trang (admin → Website → Trang → Chỉnh trực tiếp).
 * Mỗi vùng trên website mang thuộc tính data-cms… với một khóa ổn định, ánh xạ tới đúng trường trong SiteData:
 *  - hero.<trường>                 chữ/nút màn mở đầu trang chủ (lib/home-hero.ts)
 *  - pages.<mã trang>.<trường>     chữ đầu trang / dải cuối trang (khối `pages`, lib/blocks.ts → pageCopy)
 *  - block.<khối>.<a>.<b>…         trường lồng trong một khối (vd. block.gallery.photos.2.image)
 * Đọc trả về giá trị đang hiển thị (đã điền mặc định); ghi trả về bản SiteData mới (không sửa bản cũ).
 */
import type { SiteData } from './content';
import { block, pageCopy, withBlock, type BlockKey } from './blocks.ts';
import { DEFAULT_HOME_HERO, HOME_HERO_LIMITS, homeHero, type HomeHero } from './home-hero.ts';
import { okLink } from './page-blocks.ts';
import { PHOTO_FOCUS } from './site-extras.ts';

export type CmsKind = 'text' | 'rich' | 'image' | 'href' | 'focus';

const SEG = /^[a-zA-Z0-9_-]{1,60}$/;
const IMAGE = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g)$/;

/** Khóa hợp lệ: chỉ gồm các đoạn chữ/số/gạch, không trỏ vào thuộc tính nguyên mẫu. */
export function validCmsPath(path: string): boolean {
  const parts = path.split('.');
  if (parts.length < 2 || parts.length > 8 || !parts.every(p => SEG.test(p))) return false;
  if (parts.some(p => p === '__proto__' || p === 'prototype' || p === 'constructor')) return false;
  if (parts[0] === 'hero') return parts.length === 2 && parts[1] in DEFAULT_HOME_HERO;
  if (parts[0] === 'site') return parts.length === 2 && (parts[1] === 'email' || parts[1] === 'phone');
  if (parts[0] === 'txt') return parts.length >= 2 && parts.length <= 8 && parts.slice(1).every(p => /^[a-z0-9][a-z0-9-]*$/.test(p)) && path.length <= 104;
  if (parts[0] === 'pages') return parts.length === 3;
  if (parts[0] === 'rec') return parts.length >= 4 && parts.length <= 7 && (REC_KINDS as readonly string[]).includes(parts[1]) && !REC_BLOCKED.has(parts[3]) && parts.slice(4).every(p => /^\d{1,3}$|^[a-zA-Z]{1,40}$/.test(p) && !REC_BLOCKED.has(p));
  return parts[0] === 'block' && parts.length >= 3;
}

/**
 * Bản ghi sửa được ngay trên trang: rec.<loại>.<id>.<trường>[.<vị trí>.<trường con>…] — cùng nguồn với module quản trị
 * (Sản phẩm & Dịch vụ, Bài viết, Dự án, Hồ sơ thương hiệu…). Chỉ ghi vào trường đang là chữ;
 * trường kỹ thuật (mã, đường dẫn, liên kết, quan hệ, trạng thái) không sửa ở đây.
 */
export const REC_KINDS = ['services', 'subServices', 'posts', 'projects', 'topics', 'staff', 'testimonials', 'clients', 'showcase', 'metrics'] as const;
const REC_BLOCKED = new Set(['id', 'slug', 'parentId', 'serviceId', 'serviceIds', 'projectId', 'topicId', 'authorId', 'groupId', 'type', 'href', 'url', 'source', 'date', 'updated', 'published', 'visible', 'featured', 'status', 'order', 'logo', 'icon', 'tone', 'body']);
type RecKind = (typeof REC_KINDS)[number];
type RecItem = { id: string } & Record<string, unknown>;
const recList = (data: SiteData, kind: RecKind) => ((data as unknown as Record<string, RecItem[] | undefined>)[kind] || []);

function getIn(obj: unknown, keys: string[]): unknown {
  let cur = obj;
  for (const k of keys) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

/** Bản sao với một giá trị lồng được thay (mảng giữ nguyên là mảng). Không tạo khóa mới ở mức trung gian. */
function setIn(obj: unknown, keys: string[], value: unknown): unknown {
  const [k, ...rest] = keys;
  if (Array.isArray(obj)) {
    const i = Number(k);
    if (!Number.isInteger(i) || i < 0 || i >= obj.length) throw Error('Vị trí không tồn tại');
    const copy = obj.slice();
    copy[i] = rest.length ? setIn(obj[i], rest, value) : value;
    return copy;
  }
  if (obj === null || typeof obj !== 'object' || !(k in (obj as object))) throw Error('Trường không tồn tại');
  const src = obj as Record<string, unknown>;
  return { ...src, [k]: rest.length ? setIn(src[k], rest, value) : value };
}

/** Giá trị đang hiển thị của một khóa (chuỗi). */
export function readCms(data: SiteData, path: string): string {
  if (!validCmsPath(path)) return '';
  const [kind, a, ...rest] = path.split('.');
  if (kind === 'hero') return homeHero(data)[a as keyof HomeHero];
  // Chữ cố định: chỉ có bản sửa; trống = trang dùng chữ mặc định (data-cms-default trên trang)
  if (kind === 'txt') return data.texts?.[path.slice(4)] ?? '';
  if (kind === 'site') return String((data as unknown as Record<string, unknown>)[a] ?? '');
  if (kind === 'pages') return String((pageCopy(data, a as never) as Record<string, string>)[rest[0]] ?? '');
  if (kind === 'rec') { const v = getIn(recList(data, a as RecKind).find(r => r.id === rest[0]), rest.slice(1)); return typeof v === 'string' ? v : ''; }
  const v = getIn(block(data, a as BlockKey), rest);
  return typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v);
}

/** Giới hạn độ dài theo khóa (máy chủ kiểm tra lại toàn bộ nội dung khi lưu). */
export function cmsLimit(path: string): number {
  const [kind, a] = path.split('.');
  if (kind === 'hero') return HOME_HERO_LIMITS[a as keyof HomeHero] ?? 200;
  if (kind === 'txt') return /(title|label|name|kicker|eyebrow|button)$/.test(path) ? 300 : 2000;
  if (kind === 'rec') {
    const field = path.split('.').pop() || '';
    if (/^(title|name|label|role|client|company|category|industry|kicker)$/.test(field)) return a === 'posts' ? 250 : 200;
    if (field === 'image') return 300;
    return a === 'projects' || a === 'subServices' ? 2000 : 1000; // máy chủ kiểm tra lại đúng giới hạn khi lưu (validateContent)
  }
  if (/(href|url|link)$/i.test(path)) return 300;
  if (/(lead|text|desc|body|caption)$/i.test(path)) return 600;
  return 200;
}

/** Lỗi của một giá trị trước khi ghi (rỗng = hợp lệ). */
export function cmsValueError(path: string, value: string): string {
  if (!validCmsPath(path)) return 'Vùng này không chỉnh được.';
  if (value.length > cmsLimit(path)) return `Tối đa ${cmsLimit(path)} ký tự.`;
  const last = path.split('.').pop() || '';
  if (/href$/i.test(last) && !okLink(value)) return 'Đường dẫn dạng /trang/, #muc hoặc https://…';
  if (last === 'image' && value && (!IMAGE.test(value) || value.includes('..'))) return 'Ảnh phải là đường dẫn /assets/… (ảnh đã tải lên).';
  if (last === 'focus' && !PHOTO_FOCUS.includes(value)) return 'Vị trí cắt không hợp lệ.';
  if (path === 'site.email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'Email không đúng định dạng.';
  if (path === 'site.phone' && !/^[+\d][\d .()-]{7,20}$/.test(value.trim())) return 'Số điện thoại không hợp lệ.';
  return '';
}

/** Bản SiteData mới với giá trị của khóa được thay. Ném lỗi khi khóa hoặc giá trị không hợp lệ. */
export function writeCms(data: SiteData, path: string, value: string): SiteData {
  const err = cmsValueError(path, value);
  if (err) throw Error(err);
  const [kind, a, ...rest] = path.split('.');
  if (kind === 'site') return { ...data, [a]: value.trim() };
  if (kind === 'txt') {
    const key = path.slice(4);
    const texts = { ...(data.texts || {}) };
    if (value.trim()) texts[key] = value; else delete texts[key];
    return { ...data, texts: Object.keys(texts).length ? texts : undefined };
  }
  if (kind === 'hero') {
    const key = a as keyof HomeHero;
    const next: Partial<HomeHero> = { ...(data.homeHero || {}), [key]: value };
    // Trống hoặc trùng chữ mặc định → không lưu riêng (website tự dùng mặc định)
    if (!value.trim() || value === DEFAULT_HOME_HERO[key]) delete next[key];
    return { ...data, homeHero: Object.keys(next).length ? next : undefined };
  }
  if (kind === 'rec') {
    const list = recList(data, a as RecKind);
    const [id, ...keys] = rest;
    const rec = list.find(r => r.id === id);
    if (!rec) throw Error('Bản ghi không tồn tại');
    if (typeof getIn(rec, keys) !== 'string' && !(keys.length === 1 && getIn(rec, keys) === undefined && ['excerpt', 'heroLead', 'image', 'summary'].includes(keys[0]))) throw Error('Trường không sửa được ở đây.');
    if (/^(title|name)$/.test(keys[keys.length - 1]) && !value.trim()) throw Error('Tên không được để trống.');
    const next = keys.length === 1 ? { ...rec, [keys[0]]: value } : setIn(rec, keys, value);
    return { ...data, [a]: list.map(r => (r.id === id ? next : r)) } as SiteData;
  }
  if (kind === 'pages') {
    const pages = block(data, 'pages') as Record<string, Record<string, string>>;
    if (!pages[a] || !(rest[0] in pages[a])) throw Error('Trường không tồn tại');
    return withBlock(data, 'pages', { ...pages, [a]: { ...pages[a], [rest[0]]: value } });
  }
  const key = a as BlockKey;
  return withBlock(data, key, setIn(block(data, key), rest, value));
}
