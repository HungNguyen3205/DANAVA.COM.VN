import { seo, breadcrumbLD } from '@/lib/seo';
import { JsonLd } from '@/components/site/blocks';
import { ProjectsIndex } from '@/components/site/ProjectsPages';

export const metadata = seo(
  'Dự án và case study',
  'Câu chuyện triển khai thực tế của DANAVA Solutions cùng HARIVER Gym, Huế Pilates & Yoga và các doanh nghiệp dịch vụ.',
  '/du-an/'
);

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Dự án', href: '/du-an/' }])} />
      <ProjectsIndex />
    </>
  );
}
