import { seo, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { getContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { HelloPage } from '@/components/site/ProductPages';
import { HELLO } from '@/lib/products';
import { block } from '@/lib/blocks';
import { parsePrice } from '@/lib/quote';

export const metadata = seo(
  'Hello DANAVA — Bảng giá và báo giá DANAVA Studio',
  'Hello DANAVA: bảng giá 4 gói DANAVA Studio, so sánh tính năng từng module và nhận báo giá cho phòng tập Gym, Yoga, Pilates, bể bơi, Spa.',
  '/giai-phap/hello-danava/',
  '/assets/products/hello-pricing.webp'
);

export default async function Page() {
  const { data } = await getContent();
  const pricing = block(data, 'pricing');
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Hello DANAVA',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: HELLO.url,
        description: 'Hello DANAVA: bảng giá 4 gói DANAVA Studio, so sánh tính năng từng module và nhận báo giá cho phòng tập Gym, Yoga, Pilates, bể bơi, Spa.',
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: `${siteURL}/giai-phap/hello-danava/`,
        offers: pricing.plans.filter(p => parsePrice(p.price)).map(p => ({ '@type': 'Offer', name: `DANAVA Studio ${p.name} (${pricing.termMonths} tháng)`, price: String(parsePrice(p.price)), priceCurrency: 'VND' }))
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }, { label: 'Hello DANAVA', href: '/giai-phap/hello-danava/' }])} />
      <HelloPage data={data} />
    </>
  );
}
