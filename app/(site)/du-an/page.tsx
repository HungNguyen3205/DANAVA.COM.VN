import { seo, breadcrumbLD } from '@/lib/seo';
import { seoPage } from '@/lib/seo-page';
import { JsonLd } from '@/components/site/blocks';
import { ProjectsIndex } from '@/components/site/ProjectsPages';

export const generateMetadata = seoPage('/du-an/');

export default function Page() {
  return (
    <>
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Dự án', href: '/du-an/' }])} />
      <ProjectsIndex />
    </>
  );
}
