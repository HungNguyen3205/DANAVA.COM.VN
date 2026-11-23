import Link from 'next/link';
import { SearchX, X } from 'lucide-react';
import type { Post, SiteData } from '@/lib/content';
import { searchPosts, searchTopics, type BlogFilter } from '@/lib/blog-search';
import { BlogCardItem, type BlogCard } from './BlogCardItem';

export function BlogResults({ data, filter, toCard }: { data: SiteData; filter: BlogFilter; toCard: (post: Post) => BlogCard }) {
  const topics = searchTopics(data);
  const found = searchPosts(data, filter);
  const active = topics.find(t => t.slug === filter.topic);
  const without = (key: keyof BlogFilter) => {
    const next = { ...filter, [key]: '' };
    const query = new URLSearchParams();
    if (next.q) query.set('q', next.q);
    if (next.topic) query.set('chu-de', next.topic);
    return `/blogs/${query.size ? `?${query}` : ''}`;
  };

  return (
    <section className="bl-sec bl-results" id="ket-qua" aria-labelledby="bl-results-title">
      <div className="s-container">
        <div className="bl-results__head">
          <h2 className="bl-head__title" id="bl-results-title" aria-live="polite">
            {found.length ? <>{found.length} bài viết <em>phù hợp.</em></> : <>Không tìm thấy <em>bài viết.</em></>}
          </h2>
          <div className="bl-results__filters">
            {filter.q && <Link href={without('q')} aria-label={`Bỏ từ khóa ${filter.q}`}>“{filter.q}” <X aria-hidden="true" /></Link>}
            {filter.topic && <Link href={without('topic')} aria-label={`Bỏ chủ đề ${active?.name || filter.topic}`}>{active?.name || filter.topic} <X aria-hidden="true" /></Link>}
            <Link className="bl-results__clear" href="/blogs/">Xóa bộ lọc</Link>
          </div>
        </div>
        {found.length > 0 ? (
          <ul className="bl-grid">
            {found.map(post => {
              const index = topics.findIndex(t => t.id === post.topicId);
              return <BlogCardItem key={post.id} card={toCard(post)} topicName={topics[index]?.name || 'Bài viết'} tone={Math.max(0, index) % 6} />;
            })}
          </ul>
        ) : (
          <div className="bl-empty">
            <SearchX aria-hidden="true" />
            <p>Thử từ khóa ngắn hơn, gõ không dấu hoặc chọn “Mọi chủ đề”.</p>
            <Link className="bl-search__go" href="/blogs/">Xem tất cả bài viết</Link>
          </div>
        )}
      </div>
    </section>
  );
}
