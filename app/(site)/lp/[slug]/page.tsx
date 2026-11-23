import { notFound, permanentRedirect } from 'next/navigation';
import { LandingBlocks } from '@/components/site/LandingBlocks';
import { getSiteContent, getWorkingContent } from '@/lib/database';
import { canPreview } from '@/lib/auth';
import { siteView } from '@/lib/content';
import { seo, notFoundMeta } from '@/lib/seo';
import { redirectFor } from '@/lib/redirects';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ 'ban-nhap'?: string }> };

/**
 * Landing page nội bộ. Khách chỉ thấy trang đã xuất bản (status = published).
 * Người có quyền xem nội dung: xem trước trang chưa công khai; ?ban-nhap=1 = xem bản nháp phía máy chủ chưa xuất bản.
 */
async function load(slug: string, draft: boolean) {
  const preview = await canPreview();
  const data = draft && preview ? siteView((await getWorkingContent()).data) : (await getSiteContent()).data;
  const landing = (data.landings || []).find(l => l.kind === 'internal' && l.slug === slug);
  if (!landing) return { data, landing: null, preview: false };
  if (landing.status === 'published' && !draft) return { data, landing, preview: false };
  return preview ? { data, landing, preview: true } : { data, landing: null, preview: false };
}

export async function generateMetadata({ params, searchParams }: Params) {
  const { slug } = await params;
  const r = await load(slug, (await searchParams)['ban-nhap'] === '1');
  if (!r.landing) return notFoundMeta;
  const l = r.landing;
  return seo(l.seoTitle || l.title, l.seoDescription || l.purpose || l.title, `/lp/${l.slug}/`, l.image || undefined, { noindex: r.preview || !!l.noindex });
}

export default async function Page({ params, searchParams }: Params) {
  const { slug } = await params;
  const r = await load(slug, (await searchParams)['ban-nhap'] === '1');
  if (!r.landing) {
    const to = redirectFor(r.data, `/lp/${slug}/`);
    if (to) permanentRedirect(to);
    notFound();
  }
  const l = r.landing;
  return (
    <main id="main" className="lp-page">
      {r.preview && (
        <div className="u-draft" role="status">
          Bản xem trước ({l.status === 'published' ? 'bản nháp chưa xuất bản' : l.status === 'archived' ? 'đã lưu trữ' : 'chưa công khai'}). Khách truy cập chưa thấy nội dung này.
        </div>
      )}
      <LandingBlocks blocks={l.blocks} data={r.data} slug={l.slug} />
    </main>
  );
}
