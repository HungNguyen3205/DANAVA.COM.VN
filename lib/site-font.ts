import { Be_Vietnam_Pro } from 'next/font/google';

/*
 * Hệ chữ duy nhất của toàn dự án (website, trang 404 và CMS): Be Vietnam Pro.
 * Các độ đậm 400–800, subset Latin và Vietnamese; next/font tải lúc build và tự phục vụ,
 * trình duyệt không gọi Google. Token dùng trong CSS nằm ở app/fonts.css.
 */
export const siteFont = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bvp'
});

export const fontVariables = siteFont.variable;
