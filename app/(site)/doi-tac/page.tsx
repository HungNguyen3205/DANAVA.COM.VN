import { seo, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { getSiteContent } from '@/lib/database';
import { publicPartners, publicPlaces } from '@/lib/site-queries';
import { PartnersPage } from '@/components/site/PartnersPage';
import { JsonLd } from '@/components/site/blocks';

export const metadata = seo(
  'Đối tác đồng hành',
  'Đối tác đồng hành và các địa điểm yoga, pilates, gym, spa trên nền tảng danava.vn: địa chỉ, giờ mở cửa, dịch vụ và tiện ích.',
  '/doi-tac/',
  '/assets/partners/covers/yoga-club-vietnam.webp'
);

export default async function Page() {
  const { data } = await getSiteContent();
  const partners = [...publicPartners(data), ...publicPlaces(data)];
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Đối tác đồng hành và địa điểm trên nền tảng danava.vn',
        url: `${siteURL}/doi-tac/`,
        publisher: { '@id': ORG_ID },
        itemListElement: partners.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Organization',
            name: c.fullName || c.name,
            ...(c.url ? { url: c.url } : {}),
            ...(c.address ? { address: { '@type': 'PostalAddress', streetAddress: c.address, ...(c.city ? { addressLocality: c.city } : {}), addressCountry: 'VN' } } : {})
          }
        }))
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Hệ sinh thái', href: '/he-sinh-thai/' }, { label: 'Đối tác đồng hành', href: '/doi-tac/' }])} />
      <PartnersPage data={data} />
    </>
  );
}
