import { seo, breadcrumbLD } from '@/lib/seo';
import { seoLater } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import TeamPage from '@/components/site/TeamPage';

export const generateMetadata = seoLater(
  "Đội ngũ DANAVA",
  "Gặp gỡ đội ngũ chuyên gia công nghệ, truyền thông, kinh doanh và vận hành tại DANAVA Solutions. Minh bạch chuyên môn, liên kết portfolio thực tế và đồng hành trực tiếp.",
  "/doi-ngu/"
);

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Về DANAVA', href: '/ve-danava/' }, { label: 'Đội ngũ', href: '/doi-ngu/' }])} />
      <TeamPage />
    </>
  );
}

