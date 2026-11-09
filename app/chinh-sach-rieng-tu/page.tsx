import { seo, jsonLD, siteURL } from '@/lib/seo';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';

export const metadata = seo(
  'Chính sách Quyền riêng tư & Đo lường — DANAVA Solutions',
  'Thông tin minh bạch về cơ chế tiếp nhận dữ liệu qua Form liên hệ, hệ thống đo lường nội bộ ẩn danh SHA-256 và chính sách bảo vệ quyền riêng tư tại DANAVA Solutions.',
  '/chinh-sach-rieng-tu/'
);

export default function Page() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Chính sách Quyền riêng tư & Đo lường — DANAVA Solutions',
    description: 'Chính sách bảo vệ quyền riêng tư và đối chiếu kỹ thuật lưu trữ dữ liệu tại website DANAVA Solutions.',
    url: `${siteURL}/chinh-sach-rieng-tu/`,
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
      <PrivacyPolicy />
    </>
  );
}
