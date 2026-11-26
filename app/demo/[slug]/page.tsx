import { notFound } from 'next/navigation';
import { templateBySlug } from '@/lib/web-templates';
import { DEMOS } from '@/components/demo';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const t = templateBySlug((await params).slug);
  return t ? { title: `${t.brand} — demo ${t.name.toLowerCase()} | DANAVA`, robots: { index: false, follow: false } } : { robots: { index: false } };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const Demo = DEMOS[slug];
  if (!Demo || !templateBySlug(slug)) notFound();
  return <Demo />;
}
