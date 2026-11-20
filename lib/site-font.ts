import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google';

/*
 * Hệ chữ duy nhất của toàn dự án (website, trang 404 và CMS):
 *  - Be Vietnam Pro: chữ nội dung và giao diện (--font-sans)
 *  - Playfair Display: tiêu đề trang và tiêu đề mục (--font-display)
 * next/font tải về lúc build và tự phục vụ; trình duyệt không gọi Google.
 * Token dùng trong CSS nằm ở app/fonts.css.
 */
export const siteFont = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bvp'
});

export const displayFont = Playfair_Display({
  subsets: ['vietnamese', 'latin', 'latin-ext'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair'
});

export const fontVariables = `${siteFont.variable} ${displayFont.variable}`;
