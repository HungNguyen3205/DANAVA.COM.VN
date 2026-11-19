import type { Metadata, Viewport } from 'next';
import { SiteStore } from '@/components/SiteStore';
import { getContent, publicContent } from '@/lib/database';
import Analytics from '@/components/Analytics';
import { siteURL, jsonLD } from '@/lib/seo';

/**
 * Root layout dùng chung cho website công khai và CMS.
 * Không import CSS ở đây: website dùng app/(site)/site.css, CMS dùng app/globals.css
 * (nạp trong app/admin/layout.tsx) để hai giao diện không bao giờ đè style lên nhau.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: {
    default: 'DANAVA Solutions — Cùng bạn phát triển',
    template: '%s | DANAVA Solutions'
  },
  description: 'Kết nối công nghệ, truyền thông, trải nghiệm và cộng đồng cùng DANAVA Solutions.',
  applicationName: 'DANAVA',
  // Mở từ màn hình chính iOS: toàn màn hình, thanh trạng thái hòa vào header trắng
  appleWebApp: { capable: true, title: 'DANAVA', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png' },
  formatDetection: { telephone: false }
};

// viewport-fit=cover để dùng env(safe-area-inset-*) cho thanh tab dưới đáy trên máy có tai thỏ / home bar
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff'
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { data } = await getContent();
  return (
    <html lang="vi">
      <head>
        <link rel="preload" href="/fonts/manrope-400-normal.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-700-normal.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body>
        <SiteStore initialData={publicContent(data)}>
          <Analytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLD({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'DANAVA Solutions',
                url: siteURL,
                logo: siteURL + '/assets/danava-logo.png',
                email: data.email,
                telephone: data.phone
              })
            }}
          />
          {children}
        </SiteStore>
      </body>
    </html>
  );
}
