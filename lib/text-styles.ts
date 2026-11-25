/**
 * Kiểu chữ tùy chỉnh theo từng phần trên trang (admin → Chỉnh sửa website → chọn chữ → "Kiểu chữ").
 * Lưu ở SiteData.textStyles[khóa vùng], khóa = đúng khóa data-cms của phần chữ (lib/cms-paths.ts),
 * tách khỏi nội dung: màu (#rrggbb), cỡ chữ px cho máy tính (≥ 768px) / điện thoại (< 768px),
 * in đậm / in nghiêng (true = bật, false = tắt kiểu sẵn có), căn lề, và liên kết URL (bấm vào phần chữ để mở; components/site/CmsLinks.tsx).
 * Không có giá trị = kế thừa kiểu chữ responsive hiện tại của giao diện.
 * Dùng chung cho máy chủ (kiểm tra khi lưu, xuất CSS cho website) và trình biên tập trong trang.
 */

export type TextAlign = 'left' | 'center' | 'right';
export type TextStyle = { color?: string; size?: number; sizeMobile?: number; bold?: boolean; italic?: boolean; align?: TextAlign; href?: string };
const FIELDS = ['color', 'size', 'sizeMobile', 'bold', 'italic', 'align', 'href'] as const;
const ALIGNS: string[] = ['left', 'center', 'right'];
/** Liên kết cho phép: đường dẫn trong website (/…), http(s)://…, mailto:, tel: — không khoảng trắng / dấu nháy / <> */
export const validTextHref = (h: unknown): h is string => typeof h === 'string' && h.length <= 300 && (/^\/(?!\/)[^\s"'<>\\]*$/.test(h) || /^https?:\/\/[^\s"'<>\\]+$/.test(h) || /^mailto:[^\s"'<>\\]+$/.test(h) || /^tel:\+?[0-9]{3,20}$/.test(h));
/** Chuẩn hóa liên kết người dùng nhập: tên miền trơn → https://, đường dẫn thiếu / → thêm /, số điện thoại → tel:; không hợp lệ → null. */
export function normalizeHref(input: string): string | null {
  let v = input.trim();
  if (!v) return null;
  if (/^\+?[0-9 .()-]{6,20}$/.test(v)) v = `tel:${v.replace(/[ .()-]/g, '')}`;
  else if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(v) && !v.startsWith('/')) v = `https://${v}`;
  else if (/^[a-z0-9-]+(\/[a-z0-9-]*)*\/?$/i.test(v)) v = `/${v}`;
  return validTextHref(v) ? v : null;
}
export type TextStyles = Record<string, TextStyle>;
export type StyleDevice = 'desktop' | 'mobile';

/** Mốc chia thiết bị: dưới mốc này là điện thoại. */
export const MOBILE_MAX = 767;
/** Giới hạn tuyệt đối máy chủ chấp nhận (trình biên tập giới hạn hẹp hơn theo loại nội dung). */
export const SIZE_LIMITS: Record<StyleDevice, [number, number]> = { desktop: [10, 120], mobile: [10, 80] };
export const MAX_STYLES = 600;

const KEY = /^(hero|site|txt|pages|rec|block)(\.[a-zA-Z0-9_-]{1,60}){1,7}$/;
const HEX = /^#[0-9a-f]{6}$/;

/** Màu nhận diện DANAVA (lấy từ token giao diện app/(site)/site.css). */
export const BRAND_COLORS: { name: string; hex: string }[] = [
  { name: 'Xanh navy', hex: '#0b132b' },
  { name: 'Xanh DANAVA', hex: '#2b4294' },
  { name: 'Cam DANAVA', hex: '#f08a1c' },
  { name: 'Xanh trời', hex: '#53a5db' },
  { name: 'Xám đậm', hex: '#334155' },
  { name: 'Xám nhạt', hex: '#64748b' },
  { name: 'Trắng', hex: '#ffffff' }
];

/** Chuẩn hóa mã màu người dùng nhập (#abc, abc, #AABBCC) → #aabbcc; không hợp lệ → null. */
export function normalizeHex(input: string): string | null {
  let v = input.trim().toLowerCase();
  if (!v.startsWith('#')) v = `#${v}`;
  if (/^#[0-9a-f]{3}$/.test(v)) v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return HEX.test(v) ? v : null;
}

const okSize = (v: unknown, d: StyleDevice) => typeof v === 'number' && Number.isInteger(v) && v >= SIZE_LIMITS[d][0] && v <= SIZE_LIMITS[d][1];

/** Một kiểu chữ hợp lệ: chỉ các trường cho phép, ít nhất một trường, giá trị trong giới hạn. */
export function validTextStyle(s: unknown): s is TextStyle {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
  const o = s as Record<string, unknown>;
  const keys = Object.keys(o);
  if (!keys.length || keys.some(k => !(FIELDS as readonly string[]).includes(k))) return false;
  if (o.bold !== undefined && typeof o.bold !== 'boolean') return false;
  if (o.italic !== undefined && typeof o.italic !== 'boolean') return false;
  if (o.align !== undefined && !ALIGNS.includes(o.align as string)) return false;
  if (o.href !== undefined && !validTextHref(o.href)) return false;
  if (o.color !== undefined && !(typeof o.color === 'string' && HEX.test(o.color))) return false;
  if (o.size !== undefined && !okSize(o.size, 'desktop')) return false;
  if (o.sizeMobile !== undefined && !okSize(o.sizeMobile, 'mobile')) return false;
  return true;
}

export function validTextStyleKey(k: string): boolean {
  return k.length <= 120 && KEY.test(k) && !k.split('.').some(p => p === '__proto__' || p === 'prototype' || p === 'constructor');
}

/** Toàn bộ bảng kiểu chữ (máy chủ kiểm tra khi lưu nháp / xuất bản). */
export function validTextStyles(v: unknown): v is TextStyles {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const entries = Object.entries(v as Record<string, unknown>);
  return entries.length <= MAX_STYLES && entries.every(([k, s]) => validTextStyleKey(k) && validTextStyle(s));
}

/** Bảng mới với kiểu chữ của một khóa được thay (null / rỗng = về mặc định). Không sửa bảng cũ. */
export function withTextStyle(styles: TextStyles | undefined, key: string, style: TextStyle | null): TextStyles | undefined {
  if (!validTextStyleKey(key)) throw Error('Phần này không đổi kiểu chữ được.');
  const clean: TextStyle = {};
  for (const f of FIELDS) if (style?.[f] !== undefined) (clean as Record<string, unknown>)[f] = style[f];
  const next = { ...(styles || {}) };
  if (!Object.keys(clean).length) delete next[key];
  else {
    if (!validTextStyle(clean)) throw Error(styleError(clean) || 'Kiểu chữ không hợp lệ.');
    next[key] = clean;
  }
  if (Object.keys(next).length > MAX_STYLES) throw Error(`Tối đa ${MAX_STYLES} phần có kiểu chữ riêng.`);
  return Object.keys(next).length ? next : undefined;
}

/** Lỗi dễ hiểu cho một kiểu chữ (rỗng = hợp lệ). */
export function styleError(s: TextStyle): string {
  if (s.color !== undefined && !(typeof s.color === 'string' && HEX.test(s.color))) return 'Mã màu phải dạng #RRGGBB.';
  for (const d of ['desktop', 'mobile'] as const) {
    const v = d === 'desktop' ? s.size : s.sizeMobile;
    if (v !== undefined && !okSize(v, d)) return `Cỡ chữ ${d === 'desktop' ? 'máy tính' : 'điện thoại'} từ ${SIZE_LIMITS[d][0]} đến ${SIZE_LIMITS[d][1]}px.`;
  }
  if (s.href !== undefined && !validTextHref(s.href)) return 'Liên kết phải là đường dẫn trong website (/…) hoặc https://…, mailto:, tel:.';
  if (s.align !== undefined && !ALIGNS.includes(s.align)) return 'Căn lề không hợp lệ.';
  return '';
}

/**
 * CSS áp kiểu chữ cho website. Bộ chọn theo đúng khóa vùng ([data-cms="…"]) → chỉ phần đó đổi.
 * !important để thắng CSS responsive sẵn có; khi đổi cỡ chữ cho phép xuống dòng để không tràn khối.
 * Chỉ xuất mục hợp lệ (khóa chỉ gồm chữ/số/._-, màu hex, số nguyên) → không chèn được CSS lạ.
 */
export function textStylesCss(styles: TextStyles | undefined | null): string {
  if (!styles || typeof styles !== 'object') return '';
  const base: string[] = [], desk: string[] = [], mob: string[] = [];
  for (const [k, s] of Object.entries(styles)) {
    if (!validTextStyleKey(k) || !validTextStyle(s)) continue;
    const sel = `html body [data-cms="${k}"]`;
    if (s.color) base.push(`${sel}{color:${s.color}!important;-webkit-text-fill-color:currentColor}`);
    if (s.size || s.sizeMobile) base.push(`${sel}{overflow-wrap:anywhere;max-width:100%}`);
    if (s.bold !== undefined) base.push(`${sel}{font-weight:${s.bold ? 700 : 400}!important}`);
    if (s.italic !== undefined) base.push(`${sel}{font-style:${s.italic ? 'italic' : 'normal'}!important}`);
    // căn lề: phần chữ thường là thẻ inline (span) → cho chiếm cả dòng để căn được
    if (s.align) base.push(`${sel}{display:block;text-align:${s.align}!important}`);
    if (s.href) base.push(`${sel}{cursor:pointer;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}${sel}:hover{opacity:.8}`);
    if (s.size) desk.push(`${sel}{font-size:${s.size}px!important}`);
    if (s.sizeMobile) mob.push(`${sel}{font-size:${s.sizeMobile}px!important}`);
  }
  return [
    base.join(''),
    desk.length ? `@media (min-width:${MOBILE_MAX + 1}px){${desk.join('')}}` : '',
    mob.length ? `@media (max-width:${MOBILE_MAX}.98px){${mob.join('')}}` : ''
  ].join('');
}

/** Giới hạn cỡ chữ trong trình biên tập theo loại nội dung (máy chủ chỉ kiểm tra giới hạn tuyệt đối). */
export const SIZE_BY_KIND: Record<'heading' | 'text' | 'label', Record<StyleDevice, [number, number]>> = {
  heading: { desktop: [18, 120], mobile: [16, 80] },
  text: { desktop: [12, 40], mobile: [12, 32] },
  label: { desktop: [10, 36], mobile: [10, 28] }
};
