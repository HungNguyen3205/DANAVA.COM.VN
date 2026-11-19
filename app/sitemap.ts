import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/database';
import { siteURL, indexable } from '@/lib/seo';
import { showcaseCaseStudies, publishedProjects, publishedSubServices, subServiceHref, topicHasPage, topicHref, postsForTopic } from '@/lib/site-queries';

export const dynamic = 'force-dynamic';

const latest = (...dates: (string | undefined)[]) => dates.filter((d): d is string => !!d).sort().pop();

/**
 * Sitemap chỉ gồm URL canonical công khai, đã xuất bản và cho phép lập chỉ mục.
 * lastModified lấy từ dữ liệu (ngày đăng/cập nhật); trang không có ngày thì bỏ trống, không tự đặt ngày hiện tại.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexable) return [];
  const { data } = await getContent();
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: siteURL + path,
    ...(lastModified ? { lastModified } : {})
  });
  const posts = data.posts.filter(p => p.published && !p.noindex);
  const projects = publishedProjects(data);
  const topics = (data.topics || []).filter(t => topicHasPage(data, t));

  return [
    entry('/'),
    entry('/giai-phap/', latest(...data.services.map(s => s.updated))),
    ...data.services.map(s => entry(`/giai-phap/${s.slug}/`, s.updated)),
    ...publishedSubServices(data).map(s => entry(subServiceHref(data, s), s.updated)).filter(e => e.url !== siteURL),
    entry('/he-sinh-thai/'),
    entry('/doi-tac/'),
    entry('/du-an/', latest(...projects.map(p => p.updated))),
    ...projects.map(p => entry(`/du-an/${p.slug}/`, p.updated)),
    ...showcaseCaseStudies(data).map(x => entry(`/du-an/${x.slug}/`, x.updated)),
    entry('/ve-danava/'),
    entry('/doi-ngu/'),
    ...data.staff.filter(p => p.visible).map(p => entry(`/doi-ngu/${p.id}/`)),
    entry('/kien-thuc/', latest(...posts.map(p => p.updated || p.date))),
    ...topics.map(t => entry(topicHref(t), latest(...postsForTopic(data, t.id).map(p => p.updated || p.date)))),
    ...posts.map(p => entry(`/kien-thuc/${p.slug}/`, p.updated || p.date || undefined)),
    entry('/lien-he/'),
    entry('/chinh-sach-rieng-tu/'),
    entry('/chinh-sach-dich-vu/')
  ];
}
