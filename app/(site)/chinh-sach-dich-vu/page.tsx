import { seo, jsonLD, siteURL, breadcrumbLD } from '@/lib/seo';
import { ServicePolicy } from '@/components/ServicePolicy';
import { getSiteContent } from '@/lib/database';

export const metadata = seo(
  'Chính sách dịch vụ và bảo hành kỹ thuật',
  'Quy chuẩn phạm vi hỗ trợ, cam kết chất lượng SLA 99.9%, chính sách bảo hành phần mềm và website 12 tháng, bàn giao mã nguồn sạch và bảo mật tài nguyên tại DANAVA Solutions.',
  '/chinh-sach-dich-vu/'
);

export default async function Page() {
  const { data } = await getSiteContent();
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Chính sách dịch vụ và bảo hành kỹ thuật',
    description: 'Chính sách cung cấp dịch vụ, bảo hành phần mềm và cam kết SLA tại DANAVA Solutions.',
    url: `${siteURL}/chinh-sach-dich-vu/`,
    inLanguage: 'vi',
    isPartOf: {
      '@type': 'WebSite',
      name: 'DANAVA Solutions',
      url: siteURL
    },
    about: {
      '@type': 'Organization',
      name: 'DANAVA Solutions',
      telephone: '0935917677',
      email: 'support@danava.vn',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách dịch vụ', href: '/chinh-sach-dich-vu/' }])) }} />
      <ServicePolicy data={data} />
    </>
  );
}

