import { notFound } from 'next/navigation';
import { templateById } from '@/lib/web-templates';
import { getSiteContent } from '@/lib/database';
import { DEMOS } from '@/components/demo';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const t = templateById((await getSiteContent()).data, (await params).slug);
  return t ? { title: `${t.brand} — demo ${t.name.toLowerCase()} | DANAVA`, robots: { index: false, follow: false } } : { robots: { index: false } };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const Demo = DEMOS[slug];
  // Mẫu ẩn trong admin → không mở demo
  const t = templateById((await getSiteContent()).data, slug);
  if (!Demo || !t || t.kind !== 'demo' || !t.published) notFound();
  return <Demo />;
}
