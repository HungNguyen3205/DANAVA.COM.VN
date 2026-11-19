import { Be_Vietnam_Pro } from 'next/font/google';

// Font chính của website DANAVA; next/font tải về lúc build và tự phục vụ, trình duyệt không gọi Google.
// Dùng chung cho layout (site) và 404 toàn cục.
export const siteFont = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bvp'
});
