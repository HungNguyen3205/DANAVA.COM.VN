import { seo, siteURL, ORG_ID, breadcrumbLD } from '@/lib/seo';
import { getContent } from '@/lib/database';
import { getEcosystemUnits } from '@/lib/ecosystem';
import { EcosystemPage } from '@/components/site/EcosystemPage';
import { JsonLd } from '@/components/site/blocks';

export const metadata = seo(
  'Hệ sinh thái DANAVA',
  'Hệ sinh thái DANAVA: phần mềm DANAVA Studio, nền tảng danava.vn, học yoga online, website, digital marketing, sự kiện, đặt vé DANAVA GO và cộng đồng Yoga Club Vietnam.',
  '/he-sinh-thai/',
  '/assets/presentation/danava-ecosystem.webp'
);

export default async function Page() {
  const { data } = await getContent();
  const units = getEcosystemUnits();
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Hệ sinh thái DANAVA Solutions',
        url: `${siteURL}/he-sinh-thai/`,
        itemListElement: units.map((u, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: u.name,
          url: u.officialLink.isExternal ? u.officialLink.href : `${siteURL}${u.officialLink.href.split('?')[0]}`
        })),
        publisher: { '@id': ORG_ID }
      }} />
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Hệ sinh thái', href: '/he-sinh-thai/' }])} />
      <EcosystemPage data={data} />
    </>
  );
}
