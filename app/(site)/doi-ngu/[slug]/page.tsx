import { notFound } from 'next/navigation';
import { getContent } from '@/lib/database';
import { seo, jsonLD, siteURL } from '@/lib/seo';
import { personPhoto } from '@/lib/media';
import { getStaffProfile } from '@/lib/staff';
import StaffProfile from '@/components/site/StaffProfile';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = getContent();
  const person = data.staff?.find(p => p.id === slug && p.visible);

  if (!person) {
    return {
      title: 'Không tìm thấy hồ sơ nhân sự — DANAVA Solutions',
      robots: { index: false }
    };
  }

  const photo = personPhoto(person) || '/assets/legacy/founder.webp';
  return seo(
    `${person.name} — ${person.role} | DANAVA Solutions`,
    `Hồ sơ năng lực, kỹ năng chuyên sâu, các dự án triển khai thực tế và vai trò đảm nhiệm của ${person.name} tại DANAVA Solutions.`,
    `/doi-ngu/${slug}/`,
    photo
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = getContent();
  const person = data.staff?.find(p => p.id === slug && p.visible);

  // Nghiêm ngặt: 404 khi hồ sơ ẩn (visible === false) hoặc slug không tồn tại
  if (!person) {
    notFound();
  }

  const profile = getStaffProfile(person, data.projects || []);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.role,
    worksFor: {
      '@type': 'Organization',
      name: 'DANAVA Solutions',
      url: siteURL
    },
    url: `${siteURL}/doi-ngu/${slug}/`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(schema) }}
      />
      <StaffProfile profile={profile} />
    </>
  );
}

