import { seo, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import TeamPage from '@/components/site/TeamPage';

export const generateMetadata = seoPage('/doi-ngu/');

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Về DANAVA', href: '/ve-danava/' }, { label: 'Đội ngũ', href: '/doi-ngu/' }])} />
      <TeamPage />
    </>
  );
}

