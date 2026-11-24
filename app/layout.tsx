import type { Metadata, Viewport } from 'next';
import { SiteStore } from '@/components/SiteStore';
import { getSiteContent, requestLocale } from '@/lib/database';
import { LOCALE_INFO } from '@/lib/i18n';
import { publicContent } from '@/lib/site-queries';
import Analytics from '@/components/Analytics';
import { siteURL, jsonLD, indexable, ORG_ID, BRAND } from '@/lib/seo';
import { CONTACT } from '@/lib/company';
import { fontVariables } from '@/lib/site-font';
import { block } from '@/lib/blocks';

/**
 * Root layout dùng chung cho website công khai và CMS.
 * Không import CSS ở đây: website dùng app/(site)/site.css, CMS dùng app/globals.css
 * (nạp trong app/admin/layout.tsx) để hai giao diện không bao giờ đè style lên nhau.
 */
export const dynamic = 'force-dynamic';
/** Tiêu đề / mô tả mặc định theo ngôn ngữ (trang không tự đặt) */
const DEFAULTS = {
  vi: { title: 'DANAVA Solutions — Giải pháp công nghệ, website và sự kiện cho doanh nghiệp dịch vụ', desc: 'Phần mềm quản lý DANAVA Studio, thiết kế website, tổ chức sự kiện và du lịch trải nghiệm cho doanh nghiệp dịch vụ.' },
  en: { title: 'DANAVA Solutions — Technology, websites and events for service businesses', desc: 'DANAVA Studio management software, website design, event organization and experiential travel for service businesses.' },
  ja: { title: 'DANAVA Solutions — サービス業向けのテクノロジー・Webサイト・イベント', desc: 'DANAVA Studio 管理ソフト、Webサイト制作、イベント運営、体験型旅行をサービス業の企業に提供します。' }
};

export async function generateMetadata(): Promise<Metadata> {
  const d = DEFAULTS[await requestLocale()];
  return { ...base, title: { default: d.title, template: `%s | ${BRAND}` }, description: d.desc };
}

const base: Metadata = {
  metadataBase: new URL(siteURL),
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
  const { data } = await getSiteContent();
  const co = block(data, 'company');
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
      streetAddress: co.street,
      addressLocality: co.city,
      addressCountry: 'VN'
    },
    sameAs: [co.facebook, co.youtube].filter(Boolean)
  };
  return (
    <html lang={LOCALE_INFO[await requestLocale()].html} className={fontVariables}>
      <head>
      </head>
      <body>
        <SiteStore initialData={publicContent(data)}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(organization) }} />
          {children}
          {/* Sau nội dung: phím Tab đầu tiên tới liên kết "Đến nội dung chính" thay vì thanh đồng ý đo lường */}
          <Analytics />
        </SiteStore>
      </body>
    </html>
  );
}
