/**
 * Metadata cho trang có tiêu đề / mô tả cố định: tạo theo TỪNG yêu cầu (không lúc nạp file) để đúng ngôn ngữ đang xem
 * (/en/, /ja/ — lib/i18n.ts).
 *
 * - seoPage('/duong-dan/'): trang cố định có trong lib/seo-pages.ts; quản trị viên ghi đè được từng ô
 *   (Quản trị → SEO & chuyển hướng → SEO từng trang, lưu ở SiteData.pageSeo).
 * - seoLater('Tiêu đề', 'Mô tả', '/duong-dan/'): trang khác, chữ cố định trong mã nguồn.
 */
import type { Metadata } from 'next';
import { getSiteContent } from './database';
import { seo } from './seo';
import { staticSeo } from './seo-pages';

export function seoLater(...args: Parameters<typeof seo>): () => Promise<Metadata> {
  return async () => {
    await getSiteContent(); // ghi ngôn ngữ + bản dịch vào kho của yêu cầu cho seo()
    return seo(...args);
  };
}

export function seoPage(path: string): () => Promise<Metadata> {
  const def = staticSeo(path);
  if (!def) throw new Error(`seoPage: chưa khai báo ${path} trong lib/seo-pages.ts`);
  return async () => {
    const { data } = await getSiteContent();
    const o = data.pageSeo?.[path] || {};
    const title = o.title?.trim() || def.title;
    return seo(title, o.description?.trim() || def.description, path, o.image || def.image, {
      // Tiêu đề mặc định trang chủ đã có tên thương hiệu; tiêu đề tự nhập thì để seo() tự quyết hậu tố
      absoluteTitle: !o.title?.trim() && def.absoluteTitle,
      noindex: o.noindex
    });
  };
}
