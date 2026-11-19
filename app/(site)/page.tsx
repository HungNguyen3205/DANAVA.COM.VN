import { seo, siteURL, ORG_ID, jsonLD, BRAND } from '@/lib/seo';
import { getContent } from '@/lib/database';
import HomePage from '@/components/site/HomePage';

export const metadata = seo(
  'DANAVA Solutions — Giải pháp công nghệ và marketing cho doanh nghiệp dịch vụ',
  'Phần mềm quản lý Gym, Yoga, Pilates & Spa DANAVA Studio, thiết kế website, marketing và tổ chức sự kiện cho doanh nghiệp dịch vụ. Cùng bạn phát triển.',
  '/',
  '/assets/profile/set-stage.webp',
  { absoluteTitle: true }
);

export default async function Page() {
  const { data } = await getContent();
  const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: siteURL + '/', inLanguage: 'vi', publisher: { '@id': ORG_ID } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(website) }} />
      <HomePage data={data} />
    </>
  );
}
