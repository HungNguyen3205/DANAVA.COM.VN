import { seo, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { getContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { GoPage } from '@/components/site/ProductPages';
import { GO } from '@/lib/products';

export const metadata = seo(
  'DANAVA GO — Đặt vé xe khách trực tuyến',
  'DANAVA GO: nền tảng đặt vé xe khách trực tuyến cao cấp do DANAVA phát triển. Chọn chuyến, chọn chỗ trực quan, nhận vé điện tử.',
  '/giai-phap/danava-go/',
  '/assets/products/go-hero.webp'
);

export default async function Page() {
  const { data } = await getContent();
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'DANAVA GO',
        applicationCategory: 'TravelApplication',
        operatingSystem: 'Web',
        url: GO.url,
        description: 'DANAVA GO: nền tảng đặt vé xe khách trực tuyến cao cấp do DANAVA phát triển. Chọn chuyến, chọn chỗ trực quan, nhận vé điện tử.',
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: `${siteURL}/giai-phap/danava-go/`
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }, { label: 'DANAVA GO', href: '/giai-phap/danava-go/' }])} />
      <GoPage data={data} />
    </>
  );
}
