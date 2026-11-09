import { seo, jsonLD, siteURL } from '@/lib/seo';
import { ServicePolicy } from '@/components/ServicePolicy';

export const metadata = seo(
  'Chính sách Dịch vụ & Bảo hành Kỹ thuật — DANAVA Solutions',
  'Quy chuẩn phạm vi hỗ trợ, cam kết chất lượng SLA 99.9%, chính sách bảo hành phần mềm và website 12 tháng, bàn giao mã nguồn sạch và bảo mật tài nguyên tại DANAVA Solutions.',
  '/chinh-sach-dich-vu/'
);

export default function Page() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Chính sách Dịch vụ & Bảo hành Kỹ thuật — DANAVA Solutions',
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
      <ServicePolicy />
    </>
  );
}

