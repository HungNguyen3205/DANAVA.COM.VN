import type { Metadata } from 'next';
import { LOCALES, LOCALE_INFO, fresh, localePath, metaKey, type Locale } from './i18n.ts';
import { requestTexts } from './request-texts.ts';

/** Ngôn ngữ + bản dịch SEO của yêu cầu hiện tại (getSiteContent() ghi; ngoài máy chủ → không có). */
function currentView() { try { return requestTexts().view; } catch { return undefined; } }

/**
 * Tên miền chính dùng cho canonical, sitemap, Open Graph và JSON-LD.
 * Luôn là tên miền production (SITE_URL), KHÔNG lấy domain preview của Vercel để canonical
 * của bản xem thử không trỏ về chính nó.
 */
export const siteURL = (process.env.SITE_URL || 'https://danava.com.vn').replace(/\/$/, '');

/**
 * Chỉ cho phép lập chỉ mục khi chạy production thật.
 * - Vercel preview/development (VERCEL_ENV !== 'production') → noindex toàn site.
 * - DANAVA_NOINDEX=1 → noindex (dùng cho môi trường kiểm thử/staging trên hosting).
 */
export const indexable = process.env.DANAVA_NOINDEX !== '1'
  && !(process.env.VERCEL && process.env.VERCEL_ENV !== 'production');

export const BRAND = 'DANAVA Solutions';
/** Tiêu đề tìm kiếm tối đa (kèm hậu tố thương hiệu) trước khi bỏ hậu tố. */
export const TITLE_MAX = 65;
export const ORG_ID = `${siteURL}/#organization`;

/** Ghép đường dẫn tương đối với tên miền chính; giữ nguyên URL tuyệt đối. */
export function absoluteURL(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return siteURL + (path.startsWith('/') ? path : '/' + path);
}

type SeoOptions = {
  /** Không thêm hậu tố thương hiệu (trang chủ đã có tên thương hiệu trong tiêu đề). */
  absoluteTitle?: boolean;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
};

/**
 * Metadata chuẩn cho một trang công khai.
 * `title` KHÔNG chứa tên thương hiệu: layout gốc tự thêm " | DANAVA Solutions".
 */
export function seo(viTitle: string, description: string, path: string, image = '/assets/danava-logo.png', options: SeoOptions = {}): Metadata {
  // Ngôn ngữ đang xem (getSiteContent() đã ghi vào kho của yêu cầu): dịch tiêu đề / mô tả nếu còn khớp câu tiếng Việt
  const view = currentView();
  const loc: Locale = view?.loc ?? 'vi';
  const viDesc = description.replace(/\s+/g, ' ').trim().slice(0, 300);
  const pick = (key: string, vi: string) => { const tr = view?.tr[key]; return fresh(tr, vi) ? tr.t : vi; };
  const title = view ? pick(metaKey(path, 'title'), viTitle) : viTitle;
  const desc = view ? pick(metaKey(path, 'desc'), viDesc).slice(0, 300) : viDesc;
  // Tiêu đề dài: bỏ hậu tố thương hiệu để Google không cắt mất phần chính (giữ ≤ ~65 ký tự khi có thể)
  const absolute = options.absoluteTitle || `${title} | ${BRAND}`.length > TITLE_MAX;
  const fullTitle = absolute ? title : `${title} | ${BRAND}`;
  const url = absoluteURL(localePath(path, loc));
  const img = absoluteURL(image || '/assets/danava-logo.png');
  return {
    title: absolute ? { absolute: title } : title,
    description: desc,
    // Mỗi ngôn ngữ một đường dẫn: Google hiển thị đúng bản cho người tìm (hreflang)
    alternates: {
      canonical: url,
      languages: { vi: absoluteURL(path), en: absoluteURL(localePath(path, 'en')), ja: absoluteURL(localePath(path, 'ja')), 'x-default': absoluteURL(path) }
    },
    ...(options.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: options.type || 'website',
      locale: LOCALE_INFO[loc].og,
      alternateLocale: LOCALES.filter(l => l !== loc).map(l => LOCALE_INFO[l].og),
      siteName: BRAND,
      title: fullTitle,
      description: desc,
      url,
      images: [{ url: img, alt: title }],
      ...(options.type === 'article' && options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      ...(options.type === 'article' && options.modifiedTime ? { modifiedTime: options.modifiedTime } : {})
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: desc, images: [img] }
  };
}

/** Metadata cho trang không tồn tại / bản nháp. */
export const notFoundMeta: Metadata = { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };

export function jsonLD(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export type Crumb = { label: string; href?: string };

/** BreadcrumbList khớp với breadcrumb hiển thị trên trang. */
export function breadcrumbLD(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteURL(c.href) } : {})
    }))
  };
}

/** Rút gọn văn bản thuần cho thẻ mô tả. */
export function plainExcerpt(text: string, max = 160) {
  const clean = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > max ? clean.slice(0, max).replace(/\s+\S*$/, '') + '…' : clean;
}
