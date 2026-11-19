import { seo, breadcrumbLD } from '@/lib/seo';
import { JsonLd } from '@/components/site/blocks';
import { ServicesIndex } from '@/components/site/ServicesPages';

export const metadata = seo(
  'Giải pháp: phần mềm quản lý, website, sự kiện và du lịch',
  'Phần mềm quản lý phòng tập DANAVA Studio, thiết kế website, sự kiện & truyền thông, du lịch và cộng đồng: chọn đúng giải pháp cho bài toán của doanh nghiệp.',
  '/giai-phap/'
);

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Giải pháp', href: '/giai-phap/' }])} />
      <ServicesIndex />
    </>
  );
}
