import { seo, breadcrumbLD } from '@/lib/seo';
import { JsonLd } from '@/components/site/blocks';
import AboutPage from '@/components/site/AboutPage';

export const metadata = seo(
  'Về DANAVA: câu chuyện, sứ mệnh và đội ngũ',
  'Câu chuyện, sứ mệnh, nguyên tắc làm việc và đội ngũ DANAVA Solutions: đồng hành cùng doanh nghiệp dịch vụ bằng công nghệ, truyền thông và trải nghiệm.',
  '/ve-danava/',
  '/assets/legacy/event-group.webp'
);

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Về DANAVA', href: '/ve-danava/' }])} />
      <AboutPage />
    </>
  );
}
