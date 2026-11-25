import { seo, siteURL, ORG_ID, jsonLD, BRAND } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { getSiteContent } from '@/lib/database';
import HomePage from '@/components/site/HomePage';

export const generateMetadata = seoPage('/');

export default async function Page() {
  const { data } = await getSiteContent();
  const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: siteURL + '/', inLanguage: 'vi', publisher: { '@id': ORG_ID } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(website) }} />
      <HomePage data={data} />
    </>
  );
}
