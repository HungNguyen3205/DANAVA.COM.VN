import '../site-careers.css';
import { seo, breadcrumbLD } from '@/lib/seo';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { CareersPage } from '@/components/site/careers/CareersPage';

export const metadata = seo(
  'Tuyển dụng',
  'Cơ hội làm việc tại DANAVA Solutions ở Đà Nẵng: công nghệ, truyền thông, kinh doanh và vận hành. Xem vị trí đang tuyển hoặc gửi hồ sơ mở.',
  '/tuyen-dung/',
  '/assets/about/office.webp'
);

export default async function Page() {
  const { data } = await getSiteContent();
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Tuyển dụng', href: '/tuyen-dung/' }])} />
      <CareersPage data={data} />
    </>
  );
}
