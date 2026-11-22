/*
 * Tìm kiếm bài viết cho trang Blogs (chạy trên máy chủ, tìm cả toàn văn và bài lưu trữ).
 * - Gõ không dấu: khớp không phân biệt dấu ("su kien" → "sự kiện").
 * - Gõ có dấu: khớp đúng dấu ("dữ liệu" không lẫn "du lịch").
 * - Khớp theo nguyên tiếng ("tra" không khớp "trang"). Một bài khớp khi: có nguyên cụm đã gõ,
 *   hoặc đủ các từ trong tiêu đề/tóm tắt, hoặc đủ các từ trong bài và có ít nhất một từ ở tiêu đề.
 */
import type { Post, SiteData, Topic } from './content.ts';
import { ARCHIVE_TOPIC } from './content-defaults.ts';
import { publishedPosts, topicOf } from './site-queries.ts';

export const QUERY_MAX = 80;

export type BlogFilter = { q: string; topic: string };

type Param = string | string[] | undefined;
const single = (v: Param) => (Array.isArray(v) ? v[0] : v) ?? '';

export function readBlogFilter(params: Record<string, Param>): BlogFilter {
  return {
    q: single(params.q).replace(/\s+/g, ' ').trim().slice(0, QUERY_MAX),
    topic: single(params['chu-de']).trim().slice(0, 100)
  };
}

export const isFiltering = (f: BlogFilter) => !!(f.q || f.topic);

/** Chủ đề có thể lọc: đang hiển thị và có bài; cộng mục Lưu trữ nếu còn bài cũ. */
export function searchTopics(data: SiteData): (Topic & { count: number })[] {
  const posts = publishedPosts(data);
  return (data.topics || [])
    .filter(t => t.published || t.id === ARCHIVE_TOPIC)
    .map(t => ({ ...t, count: posts.filter(p => p.topicId === t.id).length }))
    .filter(t => t.count > 0);
}

const stripMarks = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');

/** Chữ thường, mỗi tiếng cách nhau một dấu cách, có dấu cách ở hai đầu để so khớp nguyên tiếng. */
function words(text: string, keepMarks: boolean) {
  const lower = text.normalize('NFC').toLowerCase();
  return ` ${(keepMarks ? lower : stripMarks(lower)).replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
}

/** Bỏ đường dẫn ảnh/liên kết và thẻ HTML để không khớp nhầm vào URL. */
const readable = (body: string) => body
  .replace(/(!?\[[^\]]*\])\([^)]*\)/g, '$1')
  .replace(/https?:\/\/\S+/g, ' ')
  .replace(/<[^>]+>/g, ' ');

export function searchPosts(data: SiteData, { q, topic }: BlogFilter): Post[] {
  let posts = publishedPosts(data);
  if (topic) {
    const selected = searchTopics(data).find(t => t.slug === topic);
    if (!selected) return [];
    posts = posts.filter(p => p.topicId === selected.id);
  }
  if (!q) return posts;

  const lower = q.normalize('NFC').toLowerCase();
  const keepMarks = stripMarks(lower) !== lower;
  const query = words(q, keepMarks).trim();
  if (!query) return [];
  const terms = query.split(' ').map(t => ` ${t} `);
  const phrase = ` ${query} `;

  return posts
    .map(post => {
      const title = words(post.title, keepMarks);
      const summary = words(`${post.excerpt || ''} ${post.category} ${topicOf(data, post)?.name || ''}`, keepMarks);
      const body = words(readable(post.body || ''), keepMarks);
      const inTitle = terms.filter(t => title.includes(t)).length;
      const everywhere = terms.every(t => title.includes(t) || summary.includes(t) || body.includes(t));
      const matched = title.includes(phrase) || summary.includes(phrase) || body.includes(phrase)
        || terms.every(t => title.includes(t) || summary.includes(t))
        || (inTitle > 0 && everywhere);
      let score = title.includes(phrase) ? 10 : summary.includes(phrase) || body.includes(phrase) ? 3 : 0;
      for (const t of terms) score += title.includes(t) ? 5 : summary.includes(t) ? 2 : 1;
      return { post, score, matched };
    })
    .filter(x => x.matched)
    .sort((a, b) => b.score - a.score) // sort ổn định: cùng điểm thì bài mới đứng trước
    .map(x => x.post);
}
