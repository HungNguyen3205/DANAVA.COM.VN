import { seo, jsonLD, siteURL } from '@/lib/seo';
import { EcosystemPage } from '@/components/site/EcosystemPage';

export const metadata = seo(
  "Hệ sinh thái DANAVA",
  "Khám phá hệ sinh thái toàn diện của DANAVA Solutions: Sản phẩm số, Marketing & Media, Du lịch & Sự kiện, và Cộng đồng Yoga Club Vietnam.",
  "/he-sinh-thai/",
  "/assets/presentation/danava-ecosystem.webp"
);

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Hệ sinh thái DANAVA Solutions',
    description: 'Các đơn vị thành viên và giải pháp trong hệ sinh thái DANAVA Solutions.',
    url: `${siteURL}/he-sinh-thai/`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'DANAVA Studio',
        url: `${siteURL}/giai-phap/danava-studio/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'DANAVA Digital Marketing',
        url: `${siteURL}/giai-phap/digital-marketing/`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'DANAVA Go & Du lịch Trải nghiệm',
        url: `${siteURL}/giai-phap/du-lich-su-kien/`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Yoga Club Vietnam',
        url: `${siteURL}/giai-phap/cong-dong/`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(schema) }}
      />
      <EcosystemPage />
    </>
  );
}

