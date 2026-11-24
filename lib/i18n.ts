/**
 * Website đa ngôn ngữ: Tiếng Việt (gốc, không tiền tố) · English (/en/…) · 日本語 (/ja/…).
 *
 * - Đường dẫn: proxy.ts nhận /en/… /ja/…, chuyển nội bộ về đúng trang tiếng Việt kèm cờ ngôn ngữ (header x-danava-locale).
 * - Bản dịch gắn theo đúng khóa vùng chữ (data-cms, lib/cms-paths.ts) kèm "dấu" của câu tiếng Việt lúc dịch (h):
 *   câu tiếng Việt đổi → dấu không khớp → website hiện lại tiếng Việt cho câu đó đến khi dịch lại (không hiện bản dịch cũ sai nghĩa).
 * - Nguồn bản dịch: bản dịch máy ban đầu trong mã (lib/i18n-seed/*.json) + bản sửa / dịch tự động trong admin (SiteData.i18n, ưu tiên).
 * - Câu chưa có bản dịch: hiện tiếng Việt.
 */

export const LOCALES = ['vi', 'en', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export type ForeignLocale = Exclude<Locale, 'vi'>;
export const FOREIGN: ForeignLocale[] = ['en', 'ja'];
export const LOCALE_HEADER = 'x-danava-locale';

export const LOCALE_INFO: Record<Locale, { label: string; short: string; html: string; og: string }> = {
  vi: { label: 'Tiếng Việt', short: 'VI', html: 'vi', og: 'vi_VN' },
  en: { label: 'English', short: 'EN', html: 'en', og: 'en_US' },
  ja: { label: '日本語', short: 'JA', html: 'ja', og: 'ja_JP' }
};

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
export const isForeign = (v: unknown): v is ForeignLocale => v === 'en' || v === 'ja';

/** Một bản dịch: chữ đã dịch + dấu câu tiếng Việt gốc lúc dịch. */
export type Translation = { t: string; h: string };
export type TranslationMap = Record<string, Translation>;
/** Lưu trong SiteData.i18n (bản sửa / dịch tự động trong admin). */
export type Translations = Partial<Record<ForeignLocale, TranslationMap>>;

/** Dấu của một câu (FNV-1a 32-bit, base36). Bỏ khoảng trắng thừa để chỉnh khoảng cách không làm mất bản dịch. */
export function textHash(s: string): string {
  const v = s.replace(/\s+/g, ' ').trim();
  let h = 0x811c9dc5;
  for (let i = 0; i < v.length; i++) { h ^= v.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

/** Bản dịch còn đúng cho câu tiếng Việt hiện tại? */
export const fresh = (tr: Translation | undefined, vi: string): tr is Translation => !!tr && !!tr.t.trim() && tr.h === textHash(vi);

/* ---------------- Đường dẫn ---------------- */
const LOCALE_RE = /^\/(en|ja)(?=\/|$)/;

/** /en/giai-phap/ → { locale: 'en', path: '/giai-phap/' }; /giai-phap/ → { locale: 'vi', … } */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(LOCALE_RE);
  if (!m) return { locale: 'vi', path: pathname || '/' };
  return { locale: m[1] as Locale, path: pathname.slice(m[0].length) || '/' };
}

/** Đường dẫn trang theo ngôn ngữ (chỉ đường dẫn nội bộ của website; admin, API, tệp giữ nguyên). */
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const [pathname, rest = ''] = splitOnce(path);
  const plain = splitLocale(pathname).path;
  if (locale === 'vi' || !localizable(plain)) return plain + rest;
  return `/${locale}${plain === '/' ? '/' : plain}${rest}`;
}
function splitOnce(p: string): [string, string] {
  const i = p.search(/[?#]/);
  return i < 0 ? [p, ''] : [p.slice(0, i), p.slice(i)];
}
/** Trang công khai có bản dịch (không phải admin, API, tài nguyên, tệp). */
export function localizable(pathname: string): boolean {
  return !/^\/(admin|api|_next|assets|icons)(\/|$)/.test(pathname) && !/\.[a-z0-9]{2,5}$/i.test(pathname);
}

/* ---------------- Kiểm tra dữ liệu (máy chủ, khi lưu) ---------------- */
const KEY = /^(hero|site|txt|pages|rec|block|meta)(\.[a-zA-Z0-9_-]{1,60}){1,7}$|^meta:\/[a-z0-9\-/]{0,200}:(title|desc)$/;
export const MAX_TRANSLATIONS = 6000;
export function validTranslationKey(k: string): boolean {
  return k.length <= 220 && KEY.test(k) && !k.split('.').some(p => p === '__proto__' || p === 'prototype' || p === 'constructor');
}
export function validTranslations(v: unknown): v is Translations {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  for (const [loc, map] of Object.entries(v as Record<string, unknown>)) {
    if (!isForeign(loc) || !map || typeof map !== 'object' || Array.isArray(map)) return false;
    const entries = Object.entries(map as Record<string, unknown>);
    if (entries.length > MAX_TRANSLATIONS) return false;
    for (const [k, tr] of entries) {
      if (!validTranslationKey(k) || !tr || typeof tr !== 'object') return false;
      const o = tr as Record<string, unknown>;
      if (typeof o.t !== 'string' || o.t.length > 12000 || typeof o.h !== 'string' || !/^[0-9a-z]{1,8}$/.test(o.h) || Object.keys(o).length !== 2) return false;
    }
  }
  return true;
}

/** Khóa bản dịch tiêu đề / mô tả SEO của một trang. */
export const metaKey = (path: string, field: 'title' | 'desc') => `meta:${path}:${field}`;
