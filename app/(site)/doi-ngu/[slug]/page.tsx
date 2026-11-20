import { notFound } from 'next/navigation';
import { getContent } from '@/lib/database';
import { seo, jsonLD, siteURL, breadcrumbLD, ORG_ID } from '@/lib/seo';
import { personPhoto } from '@/lib/media';
import { staffProfileFor } from '@/lib/blocks';
import StaffProfile from '@/components/site/StaffProfile';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await getContent();
  const person = data.staff?.find(p => p.id === slug && p.visible);

  if (!person) {
    return {
      title: 'Không tìm thấy hồ sơ nhân sự',
      robots: { index: false }
    };
  }

  const photo = personPhoto(person) || '/assets/legacy/founder.webp';
  return seo(
    `${person.name} — ${person.role}`,
    `Hồ sơ năng lực, kỹ năng chuyên sâu, các dự án triển khai thực tế và vai trò đảm nhiệm của ${person.name} tại DANAVA Solutions.`,
    `/doi-ngu/${slug}/`,
    photo
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await getContent();
  const person = data.staff?.find(p => p.id === slug && p.visible);

  // Nghiêm ngặt: 404 khi hồ sơ ẩn (visible === false) hoặc slug không tồn tại
  if (!person) {
    notFound();
  }

  const profile = staffProfileFor(data, person);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.role,
    worksFor: { '@id': ORG_ID },
    url: `${siteURL}/doi-ngu/${slug}/`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Đội ngũ', href: '/doi-ngu/' }, { label: person.name, href: `/doi-ngu/${slug}/` }])) }}
      />
      <StaffProfile profile={profile} />
    </>
  );
}

