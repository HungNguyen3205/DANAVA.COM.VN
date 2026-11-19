import { seo, jsonLD, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { CONTACT } from '@/lib/company';
import { ContactPage } from '@/components/site/ContactPage';
import { resolveValidService } from '@/lib/contact-services';

export const metadata = seo(
  'Liên hệ tư vấn và báo giá',
  'Trao đổi trực tiếp với DANAVA Solutions qua hotline 0935 91 76 77, email hello@danava.vn hoặc gửi yêu cầu tư vấn số hóa phòng tập và truyền thông trực tuyến.',
  '/lien-he/',
  '/assets/legacy/event-group.webp'
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
    // Địa điểm văn phòng (thông tin đã xác minh, khớp nội dung hiển thị trên trang).
    mainEntity: {
      '@type': 'LocalBusiness',
      '@id': `${siteURL}/lien-he/#office`,
      name: 'DANAVA Solutions',
      parentOrganization: { '@id': ORG_ID },
      url: `${siteURL}/`,
      image: `${siteURL}/assets/danava-logo.png`,
      telephone: CONTACT.phone,
      email: CONTACT.email,
      address: { '@type': 'PostalAddress', streetAddress: CONTACT.street, addressLocality: CONTACT.city, addressCountry: 'VN' },
      openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '08:00', closes: '18:00' }]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(schemaData) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ', href: '/lien-he/' }])) }} />
      <ContactPage initialService={initialService} />
    </>
  );
}
