import { notFound, permanentRedirect } from 'next/navigation';
import { getSiteContent } from '@/lib/database';

/**
 * Đường dẫn đọc nhanh cũ /blogs/doc/?id=<mã bài> → chuyển hướng 308 về URL chính thức của bài.
 * Mã không tồn tại hoặc bài chưa xuất bản → 404 thật.
 */
export const metadata = { title: 'Đọc bài viết', robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) notFound();
  const post = (await getSiteContent()).data.posts.find(p => p.id === id && p.published);
  if (!post) notFound();
  permanentRedirect(`/blogs/${post.slug}/`);
}
