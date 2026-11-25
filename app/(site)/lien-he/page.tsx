import { seo, jsonLD, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { CONTACT } from '@/lib/company';
import { ContactPage } from '@/components/site/ContactPage';
import { resolveValidService } from '@/lib/contact-services';
import { getSiteContent } from '@/lib/database';
import { block } from '@/lib/blocks';

export const generateMetadata = seoPage('/lien-he/');

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).service;
  const initialService = resolveValidService(Array.isArray(raw) ? raw[0] : raw);
  // Hotline/email sửa trong CMS (Cài đặt) → dùng cho dữ liệu có cấu trúc, giống nội dung hiển thị
  const { data } = await getSiteContent();
  const co = block(data, 'company');
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
      telephone: data.phone || CONTACT.phone,
      email: data.email || CONTACT.email,
      address: { '@type': 'PostalAddress', streetAddress: co.street, addressLocality: co.city, addressCountry: 'VN' },
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
