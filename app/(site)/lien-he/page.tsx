import { seo, jsonLD, siteURL } from '@/lib/seo';
import { ContactPage } from '@/components/site/ContactPage';
import { resolveValidService } from '@/lib/contact-services';

export const metadata = seo(
  'Liên hệ DANAVA Solutions — Tư vấn Giải pháp & Báo giá',
  'Trao đổi trực tiếp với DANAVA Solutions qua hotline 0935 91 76 77, email hello@danava.vn hoặc gửi yêu cầu tư vấn số hóa phòng tập và truyền thông trực tuyến.',
  '/lien-he/',
  '/assets/legacy/travel.webp'
);

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).service;
  const initialService = resolveValidService(Array.isArray(raw) ? raw[0] : raw);
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Liên hệ DANAVA Solutions',
    description: 'Trang tiếp nhận yêu cầu tư vấn phần mềm quản lý phòng tập, thiết kế website và truyền thông đa kênh.',
    url: `${siteURL}/lien-he/`,
    mainEntity: {
      '@type': 'Organization',
      name: 'DANAVA Solutions',
      telephone: '0935917677',
      email: 'hello@danava.vn',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '08 Đặng Vũ Hỷ, An Hải',
        addressLocality: 'Đà Nẵng',
        addressCountry: 'VN'
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(schemaData) }}
      />
      <ContactPage initialService={initialService} />
    </>
  );
}
