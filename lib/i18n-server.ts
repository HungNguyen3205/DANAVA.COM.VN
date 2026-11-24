/**
 * Hiển thị website theo ngôn ngữ (máy chủ): áp bản dịch lên bản dữ liệu dùng để render (không bao giờ lưu).
 * Nguồn: bản dịch máy ban đầu trong mã (lib/i18n-seed/*.json, tạo bằng scripts/i18n-*.{mjs,ts}) + SiteData.i18n (admin, ưu tiên).
 * Mỗi bản dịch chỉ dùng khi dấu câu tiếng Việt còn khớp (lib/i18n.ts → fresh) → câu tiếng Việt đổi thì hiện lại tiếng Việt.
 *  - Vùng gắn dữ liệu (rec.*, block.*, pages.*, hero.*, site.*): ghi thẳng bản dịch vào bản hiển thị.
 *  - Chữ cố định (txt.*) và SEO (meta:…): đưa vào localeView, component / seo() đối chiếu với chữ gốc lúc render.
 */
import type { SiteData } from './content.ts';
import { applyCms, readCms } from './cms-paths.ts';
import { fresh, type ForeignLocale, type TranslationMap } from './i18n.ts';
import EN from './i18n-seed/en.json' with { type: 'json' };
import JA from './i18n-seed/ja.json' with { type: 'json' };

const SEED: Record<ForeignLocale, TranslationMap> = { en: EN as TranslationMap, ja: JA as TranslationMap };

/** Bản dịch đang có cho một ngôn ngữ: bản dịch máy + bản sửa trong admin (ghi đè). */
export function translationsFor(data: SiteData, loc: ForeignLocale): TranslationMap {
  const own = data.i18n?.[loc];
  return own ? { ...SEED[loc], ...own } : SEED[loc];
}

// Bản hiển thị theo ngôn ngữ được giữ lại cho cùng một đối tượng dữ liệu (mỗi lần đọc database là đối tượng mới)
const cache = new WeakMap<SiteData, Partial<Record<ForeignLocale, SiteData>>>();

/** Bản dữ liệu hiển thị bằng ngôn ngữ `loc` (giữ nguyên bản gốc). */
export function localizeSite(data: SiteData, loc: ForeignLocale): SiteData {
  const hit = cache.get(data)?.[loc];
  if (hit) return hit;
  const map = translationsFor(data, loc);
  let out = data;
  const view: TranslationMap = {};
  for (const [key, tr] of Object.entries(map)) {
    if (key.startsWith('txt.') || key.startsWith('meta:')) { view[key] = tr; continue; }
    // Menu: tên mục dịch vụ được dựng lại từ mã mỗi lần đọc (lib/blocks.ts → block('menu')) → cần bản dịch lúc đọc
    if (key.startsWith('block.menu.')) view[key] = tr;
    let vi: string;
    try { vi = readCms(data, key); } catch { continue; }
    if (!fresh(tr, vi)) continue;
    try { out = applyCms(out, key, tr.t); } catch { /* khóa không còn trỏ đúng trường: bỏ qua */ }
  }
  out = { ...out, localeView: { loc, tr: view } };
  cache.set(data, { ...(cache.get(data) || {}), [loc]: out });
  return out;
}

/** Số khóa có bản dịch còn đúng / tổng số khóa đã từng dịch (để báo trong admin). */
export function translationStats(data: SiteData, loc: ForeignLocale) {
  const map = translationsFor(data, loc);
  let ok = 0, stale = 0;
  for (const [key, tr] of Object.entries(map)) {
    if (key.startsWith('txt.') || key.startsWith('meta:')) continue;
    let vi = '';
    try { vi = readCms(data, key); } catch {}
    if (fresh(tr, vi)) ok++; else stale++;
  }
  return { ok, stale };
}
