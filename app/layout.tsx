import type { Metadata, Viewport } from 'next';
import { SiteStore } from '@/components/SiteStore';
import { getContent } from '@/lib/database';
import { publicContent } from '@/lib/site-queries';
import Analytics from '@/components/Analytics';
import { siteURL, jsonLD, indexable, ORG_ID, BRAND } from '@/lib/seo';
import { CONTACT, SOCIAL } from '@/lib/company';

/**
 * Root layout dùng chung cho website công khai và CMS.
 * Không import CSS ở đây: website dùng app/(site)/site.css, CMS dùng app/globals.css
 * (nạp trong app/admin/layout.tsx) để hai giao diện không bao giờ đè style lên nhau.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: {
    default: 'DANAVA Solutions — Giải pháp công nghệ và marketing cho doanh nghiệp dịch vụ',
    template: `%s | ${BRAND}`
  },
  description: 'Phần mềm quản lý DANAVA Studio, thiết kế website, marketing và tổ chức sự kiện cho doanh nghiệp dịch vụ.',
  applicationName: 'DANAVA',
  // Bản preview/staging: chặn lập chỉ mục toàn site (production: cho phép).
  ...(indexable ? {} : { robots: { index: false, follow: false } }),
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
  // Thông tin doanh nghiệp đã xác minh (lib/company.ts); email/điện thoại lấy từ CMS.
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: BRAND,
    alternateName: 'DANAVA',
    url: siteURL + '/',
    logo: siteURL + '/assets/danava-logo.png',
    slogan: data.headline.replace(/\.$/, ''),
    email: data.email || CONTACT.email,
    telephone: data.phone || CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.street,
      addressLocality: CONTACT.city,
      addressCountry: 'VN'
    },
    sameAs: [SOCIAL.facebook, SOCIAL.youtube]
  };
  return (
    <html lang="vi">
      <head>
        <link rel="preload" href="/fonts/manrope-400-normal.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-700-normal.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body>
        <SiteStore initialData={publicContent(data)}>
          <Analytics />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(organization) }} />
          {children}
        </SiteStore>
      </body>
    </html>
  );
}
