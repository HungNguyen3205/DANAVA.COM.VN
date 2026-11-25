/**
 * Tiêu đề / mô tả SEO tiếng Việt đang hiển thị của một đường dẫn (khóa bản dịch "meta:<đường dẫn>:title|desc").
 * Dùng khi XUẤT BẢN (lib/i18n-auto.ts): câu SEO vừa đổi → dịch lại ngay để /en/, /ja/ không hiện tạm tiếng Việt.
 *
 * Phải tính ĐÚNG như lúc dựng trang (lib/seo.ts → seo(): mô tả gộp khoảng trắng, cắt 300 ký tự), vì bản dịch chỉ được dùng
 * khi mã băm câu gốc khớp câu đang hiển thị. Đường dẫn chưa hỗ trợ → null (giữ cách cũ: chờ dịch tay).
 */
import type { SiteData } from './content.ts';
import { staticSeo } from './seo-pages.ts';
import { plainExcerpt } from './seo.ts';

const normDesc = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, 300);

export function metaSource(d: SiteData, path: string, field: 'title' | 'desc'): string | null {
  // Trang cố định (SEO từng trang: SiteData.pageSeo ghi đè mặc định lib/seo-pages.ts) — giống lib/seo-page.ts → seoPage()
  const def = staticSeo(path);
  if (def) {
    const o = d.pageSeo?.[path] || {};
    return field === 'title' ? (o.title?.trim() || def.title) : normDesc(o.description?.trim() || def.description);
  }
  // Bài viết — giống app/(site)/blogs/[slug]/page.tsx → generateMetadata()
  const m = /^\/blogs\/([^/]+)\/$/.exec(path);
  if (m && m[1] !== 'chu-de') {
    const p = d.posts.find(x => x.slug === m[1]);
    if (!p) return null;
    return field === 'title' ? (p.seoTitle || p.title) : normDesc(p.seoDescription || p.excerpt || plainExcerpt(p.body, 160));
  }
  return null;
}

/** Các đường dẫn có câu SEO tự sửa được trong admin (để dịch cả trang chưa từng có bản dịch SEO). */
export function editableMetaPaths(d: SiteData): string[] {
  return [...Object.keys(d.pageSeo || {}), ...d.posts.filter(p => p.published && !p.archived && (p.seoTitle || p.seoDescription)).map(p => `/blogs/${p.slug}/`)];
}
