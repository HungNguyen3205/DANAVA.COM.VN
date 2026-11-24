/**
 * Metadata cho trang có tiêu đề / mô tả cố định: tạo theo TỪNG yêu cầu (không lúc nạp file) để đúng ngôn ngữ đang xem
 * (/en/, /ja/ — lib/i18n.ts). Dùng: export const generateMetadata = seoLater('Tiêu đề', 'Mô tả', '/duong-dan/');
 */
import type { Metadata } from 'next';
import { getSiteContent } from './database';
import { seo } from './seo';

export function seoLater(...args: Parameters<typeof seo>): () => Promise<Metadata> {
  return async () => {
    await getSiteContent(); // ghi ngôn ngữ + bản dịch vào kho của yêu cầu cho seo()
    return seo(...args);
  };
}
