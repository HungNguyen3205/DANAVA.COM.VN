import { legacyRedirects } from './lib/legacy-redirects';
import type { NextConfig } from 'next';

const isVercel = !!process.env.VERCEL;
const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

const config: NextConfig = {
  ...(isVercel ? {} : { output: 'standalone' }),
  trailingSlash: true,
  // Hosting cPanel không bảo đảm chạy được sharp (glibc cũ) nên không dùng tối ưu ảnh động của Next.js.
  // Ảnh trong public/ đã được nén WebP sẵn; khung ảnh khai báo kích thước/tỉ lệ để tránh dịch chuyển bố cục.
  images: { unoptimized: true },
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/admin/:path*', headers: noindex },
      { source: '/api/:path*', headers: noindex },
      { source: '/kien-thuc/doc/:path*', headers: noindex }
    ];
  },
  async redirects() {
    // Trình duyệt luôn hỏi /favicon.ico; icon thật nằm ở app/icon.png.
    return [
      ...legacyRedirects,
      { source: '/favicon.ico', destination: '/icon.png', permanent: true },
      // DANAVA không cung cấp Digital Marketing: URL cũ của giải pháp chuyển về trang tổng hợp giải pháp
      { source: '/giai-phap/digital-marketing/:path*', destination: '/giai-phap/', permanent: true },
      { source: '/kien-thuc/chu-de/digital-marketing/', destination: '/kien-thuc/', permanent: true },
      // Bài digital marketing đã gỡ (lib/content-defaults.ts REMOVED_POST_IDS)
      ...['digital-marketing', 'tat-tan-tat-kien-thuc-chuyen-mon-ve-marketing-thoi-dai-moi', 'doi-tac-do-luong-di-dong-chon-appsflyer-adjust-kochava-hay-branch',
        'top-10-website-tai-anh-chat-luong-cao-mien-phi', 'digital-marketing-la-gi-tim-hieu-tat-ca-cac-hinh-thuc'].map(slug => ({ source: `/kien-thuc/${slug}/`, destination: '/kien-thuc/', permanent: true }))
    ];
  }
};

export default config;
