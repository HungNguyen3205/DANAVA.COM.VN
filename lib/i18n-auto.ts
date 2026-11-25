/**
 * Tự dịch khi XUẤT BẢN (app/api/admin/content → PUT mode publish).
 * So bản sắp xuất bản với bản đang công khai: câu tiếng Việt nào ĐÃ có bản dịch (máy có sẵn / sửa trong admin) mà vừa đổi
 * → dịch lại sang mọi ngôn ngữ (lib/i18n.ts → FOREIGN) và lưu vào SiteData.i18n cùng lần xuất bản.
 *
 * An toàn:
 *  - Dịch lỗi / thiếu GEMINI_API_KEY / quá thời gian → vẫn xuất bản; câu chưa dịch tạm hiện tiếng Việt (không bao giờ hiện bản dịch cũ sai nghĩa).
 *  - Giữ lại bản dịch trong admin đang công khai mà bản gửi lên thiếu (vd. admin mở từ trước khi lần xuất bản trước tự dịch).
 *  - Chữ cố định bỏ bản sửa tiếng Việt (về chữ mặc định) → bỏ bản dịch của bản sửa để bản dịch có sẵn của chữ mặc định được dùng lại.
 */
import type { SiteData } from './content.ts';
import { readCms } from './cms-paths.ts';
import { FOREIGN, MAX_TRANSLATIONS, fresh, metaKey, textHash, type ForeignLocale, type Translations } from './i18n.ts';
import { editableMetaPaths, metaSource } from './i18n-meta.ts';
import { translationsFor } from './i18n-server.ts';
import { translateTexts, translationKey } from './i18n-translate.ts';

export type AutoResult = { data: SiteData; done: number; failed: number; noKey: boolean; locales: ForeignLocale[] };

const TIME_BUDGET_MS = 45_000;

const read = (d: SiteData, key: string) => { try { return readCms(d, key); } catch { return ''; } };
const override = (d: SiteData, key: string) => { const v = d.texts?.[key]; return typeof v === 'string' && v.trim() ? v : null; };

/** Câu cần dịch lại cho một ngôn ngữ: { khóa: câu tiếng Việt mới }. Ghi chú các bản dịch cần bỏ vào `drop`. */
function staleFor(prev: SiteData, next: SiteData, loc: ForeignLocale, drop: Set<string>): Record<string, string> {
  const todo: Record<string, string> = {};
  const existing = translationsFor(next, loc);
  // Tiêu đề / mô tả SEO (meta:<đường dẫn>:title|desc): câu đang hiển thị vừa đổi → dịch lại ngay khi xuất bản.
  // Gồm cả trang đã có bản dịch SEO và trang/bài vừa được tự nhập SEO trong admin (chưa từng có bản dịch).
  const metaKeys = new Set(Object.keys(existing).filter(k => k.startsWith('meta:')));
  for (const path of editableMetaPaths(next)) { metaKeys.add(metaKey(path, 'title')); metaKeys.add(metaKey(path, 'desc')); }
  for (const key of metaKeys) {
    const cut = key.lastIndexOf(':'), path = key.slice(5, cut), field = key.slice(cut + 1);
    if (field !== 'title' && field !== 'desc') continue;
    const before = metaSource(prev, path, field), after = metaSource(next, path, field);
    if (after && after.trim() && after !== before && !fresh(existing[key], after) && /[a-zA-ZÀ-ỹ]/.test(after)) todo[key] = after;
  }
  for (const [key, tr] of Object.entries(existing)) {
    if (key.startsWith('meta:')) continue;
    if (key.startsWith('txt.')) {
      const k = key.slice(4);
      const before = override(prev, k), after = override(next, k);
      if (after && after !== before && !fresh(tr, after)) todo[key] = after;
      else if (!after && before && next.i18n?.[loc]?.[key]) drop.add(key); // về chữ mặc định → dùng bản dịch có sẵn
      continue;
    }
    const before = read(prev, key), after = read(next, key);
    if (after.trim() && after !== before && !fresh(tr, after) && /[a-zA-ZÀ-ỹ]/.test(after)) todo[key] = after;
  }
  return todo;
}

export async function autoTranslateOnPublish(prev: SiteData, next: SiteData): Promise<AutoResult> {
  // 1. Giữ bản dịch đang công khai mà bản gửi lên thiếu (bản gửi lên ưu tiên khi trùng khóa)
  const i18n: Translations = {};
  for (const loc of FOREIGN) {
    const merged = { ...(prev.i18n?.[loc] || {}), ...(next.i18n?.[loc] || {}) };
    if (Object.keys(merged).length) i18n[loc] = merged;
  }
  let data: SiteData = { ...next, i18n: Object.keys(i18n).length ? i18n : undefined };

  // 2. Câu vừa đổi cần dịch lại
  const work: { loc: ForeignLocale; items: Record<string, string> }[] = [];
  for (const loc of FOREIGN) {
    const drop = new Set<string>();
    const items = staleFor(prev, data, loc, drop);
    if (drop.size && data.i18n?.[loc]) {
      const map = { ...data.i18n[loc] };
      for (const k of drop) delete map[k];
      data = { ...data, i18n: { ...data.i18n, [loc]: map } };
    }
    if (Object.keys(items).length) work.push({ loc, items });
  }
  const pending = work.reduce((n, w) => n + Object.keys(w.items).length, 0);
  if (!pending) return { data, done: 0, failed: 0, noKey: false, locales: [] };
  if (!translationKey()) return { data, done: 0, failed: pending, noKey: true, locales: work.map(w => w.loc) };

  // 3. Dịch (giới hạn thời gian: xuất bản không bị treo khi dịch máy chậm)
  const signal = AbortSignal.timeout(TIME_BUDGET_MS);
  let done = 0;
  const results = await Promise.all(work.map(async w => ({ loc: w.loc, items: w.items, out: await translateTexts(w.loc, w.items, signal).catch(() => ({} as Record<string, string>)) })));
  const nextI18n: Translations = { ...(data.i18n || {}) };
  for (const { loc, items, out } of results) {
    const map = { ...(nextI18n[loc] || {}) };
    for (const [key, t] of Object.entries(out)) {
      if (Object.keys(map).length >= MAX_TRANSLATIONS && !map[key]) break;
      map[key] = { t, h: textHash(items[key]) };
      done++;
    }
    nextI18n[loc] = map;
  }
  data = { ...data, i18n: nextI18n };
  return { data, done, failed: pending - done, noKey: false, locales: work.map(w => w.loc) };
}
