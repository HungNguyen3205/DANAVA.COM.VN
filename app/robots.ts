import type { MetadataRoute } from 'next';
import { siteURL, indexable } from '@/lib/seo';

// Đọc biến môi trường lúc chạy (DANAVA_NOINDEX, VERCEL_ENV), không cố định lúc build.
export const dynamic = 'force-dynamic';

/**
 * robots.txt chỉ hướng dẫn trình thu thập; quyền truy cập admin/API/bản nháp do máy chủ kiểm soát
 * (đăng nhập + 404 cho nội dung chưa xuất bản), không dựa vào file này.
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/blogs/doc/', '/xem-truoc-landing/'] },
    sitemap: siteURL + '/sitemap.xml',
    host: siteURL
  };
}
