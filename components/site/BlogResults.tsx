import Link from 'next/link';
import { SearchX, X } from 'lucide-react';
import type { Post, SiteData } from '@/lib/content';
import { searchPosts, searchTopics, type BlogFilter } from '@/lib/blog-search';
import { BlogCardItem, type BlogCard } from './BlogCardItem';
import { cmsText, ct } from './cms';
import { rich } from './rich';

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
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `blog.results.${k}`, def, label, opts);
  const T = {
    found: t('found', 'bài viết *phù hợp.*', 'Tiêu đề khi có kết quả', { rich: true }),
    none: t('none', 'Không tìm thấy *bài viết.*', 'Tiêu đề khi không có kết quả', { rich: true }),
    clear: t('clear', 'Xóa bộ lọc', 'Chữ liên kết'),
    hint: t('empty.hint', 'Thử từ khóa ngắn hơn, gõ không dấu hoặc chọn “Mọi chủ đề”.', 'Gợi ý khi không có kết quả', { multiline: true }),
    all: t('empty.all', 'Xem tất cả bài viết', 'Chữ nút')
  };

  return (
    <section className="bl-sec bl-results" id="ket-qua" aria-labelledby="bl-results-title">
      <div className="s-container">
        <div className="bl-results__head">
          <h2 className="bl-head__title" id="bl-results-title" aria-live="polite">
            {found.length ? <>{found.length} <span {...T.found.a}>{rich(T.found.v)}</span></> : <span {...T.none.a}>{rich(T.none.v)}</span>}
          </h2>
          <div className="bl-results__filters">
            {filter.q && <Link href={without('q')} aria-label={`Bỏ từ khóa ${filter.q}`}>“{filter.q}” <X aria-hidden="true" /></Link>}
            {filter.topic && <Link href={without('topic')} aria-label={`Bỏ chủ đề ${active?.name || filter.topic}`}>{active ? <span {...cmsText(`rec.topics.${active.id}.name`, 'Tên chủ đề', { scope: 'record', scopeLabel: 'Hồ sơ chủ đề' })}>{active.name}</span> : filter.topic} <X aria-hidden="true" /></Link>}
            <Link className="bl-results__clear" href="/blogs/"><span {...T.clear.a}>{T.clear.v}</span></Link>
          </div>
        </div>
        {found.length > 0 ? (
          <ul className="bl-grid">
            {found.map(post => {
              const index = topics.findIndex(t => t.id === post.topicId);
              return <BlogCardItem key={post.id} data={data} card={toCard(post)} topicName={topics[index]?.name || ''} tone={Math.max(0, index) % 6} />;
            })}
          </ul>
        ) : (
          <div className="bl-empty">
            <SearchX aria-hidden="true" />
            <p {...T.hint.a}>{T.hint.v}</p>
            <Link className="bl-search__go" href="/blogs/"><span {...T.all.a}>{T.all.v}</span></Link>
          </div>
        )}
      </div>
    </section>
  );
}
