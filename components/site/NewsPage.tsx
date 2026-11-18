'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Newspaper, PlayCircle } from 'lucide-react';
import { useSite } from '../SiteStore';
import { postPhotos } from '@/lib/media';
import { getApprovedSocialPosts } from '@/lib/social-feed';
import type { Post } from '@/lib/content';
import { PageHead, SectionHeading, CtaBand, Visual } from './ui';
import { formatDate, excerpt, type Tone } from './catalog';

const PAGE = 9;
const ALL = 'Tất cả';
const TONES: Tone[] = ['blue', 'orange', 'sky', 'green', 'navy'];

export const postImage = (p: Post) => p.image || postPhotos[p.id] || '';
export const postSummary = (p: Post, max = 150) => excerpt(p.excerpt || p.body, max);

function toneFor(category: string): Tone {
  let h = 0;
  for (const ch of category) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function PostMedia({ post }: { post: Post }) {
  const src = postImage(post);
  if (src) return <img src={src} alt="" loading="lazy" />;
  return <Visual icon={Newspaper} tone={toneFor(post.category)} label={post.category} />;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media"><PostMedia post={post} /></div>
      <div className="s-card__body">
        <div className="s-card__meta">
          <span className="s-news-cat">{post.category}</span>
          {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        </div>
        <h3 className="s-card__title">
          <Link className="s-card__cover" href={`/kien-thuc/${post.slug}/`}>{post.title}</Link>
        </h3>
        <p className="s-card__text">{postSummary(post)}</p>
        <div className="s-card__foot">
          <span className="s-link">Đọc bài</span>
          <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const { data } = useSite();
  const [category, setCategory] = useState(ALL);
  const [limit, setLimit] = useState(PAGE);

  const posts = useMemo(
    () => data.posts.filter(p => p.published).sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data.posts]
  );
  const featured = posts.find(p => postImage(p)) || posts[0];
  const rest = posts.filter(p => p !== featured);
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    rest.forEach(p => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rest]);
  const visible = category === ALL ? rest : rest.filter(p => p.category === category);
  const social = getApprovedSocialPosts();

  return (
    <main id="main">
      <PageHead
        eyebrow="Bản tin DANAVA"
        title="Góc nhìn, kiến thức và hoạt động"
        lead="Bài viết về vận hành phòng tập, truyền thông, du lịch wellness và những sự kiện cộng đồng DANAVA đồng hành."
        crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Bản tin' }]}
      />

      {featured && (
        <section className="s-section--flush-top s-news-featured-wrap" aria-label="Bài viết tiêu điểm">
          <div className="s-container">
            <article className="s-card s-card--link s-news-featured">
              <div className="s-news-featured__media"><PostMedia post={featured} /></div>
              <div className="s-news-featured__body">
                <div className="s-row">
                  <span className="s-badge s-badge--orange">TIÊU ĐIỂM</span>
                  <span className="s-muted s-small">{featured.category}{featured.date ? ` · ${formatDate(featured.date)}` : ''}</span>
                </div>
                <h2 className="s-h2 s-news-featured__title">
                  <Link className="s-card__cover" href={`/kien-thuc/${featured.slug}/`}>{featured.title}</Link>
                </h2>
                <p className="s-lead s-news-featured__lead">{postSummary(featured, 220)}</p>
                <span className="s-link">Đọc bài viết <ArrowRight aria-hidden="true" /></span>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="s-section" aria-labelledby="s-news-all">
        <div className="s-container">
          <SectionHeading id="s-news-all" title="Tất cả bài viết" lead="Lọc theo chủ đề bạn quan tâm." />
          {categories.length > 1 && (
            <div className="s-tabs s-news-tabs" role="tablist" aria-label="Chủ đề bài viết">
              {[[ALL, rest.length] as [string, number], ...categories].map(([c, n]) => (
                <button key={c} type="button" role="tab" className="s-tab" aria-selected={category === c} onClick={() => { setCategory(c); setLimit(PAGE); }}>
                  {c}<span className="s-tab__count">{n}</span>
                </button>
              ))}
            </div>
          )}
          {visible.length ? (
            <div className="s-grid s-grid--3 s-list-m">
              {visible.slice(0, limit).map(p => <PostCard key={p.id} post={p} />)}
            </div>
          ) : null}
          {visible.length > limit ? (
            <div className="s-row s-row--center s-news-more">
              <button type="button" className="s-btn s-btn--secondary s-btn--lg" onClick={() => setLimit(l => l + PAGE)}>
                Xem thêm bài viết ({visible.length - limit})
              </button>
            </div>
          ) : null}
          {visible.length ? null : (
            <p className="s-empty">Chưa có bài viết trong chủ đề này.</p>
          )}
        </div>
      </section>

      {social.length > 0 && (
        <section className="s-section s-section--soft" aria-labelledby="s-news-social">
          <div className="s-container">
            <SectionHeading
              id="s-news-social"
              eyebrow="Từ kênh chính thức"
              title="Cập nhật từ Fanpage & YouTube"
              lead="Những bài đăng đã được DANAVA kiểm duyệt trên các kênh truyền thông chính thức."
            />
            <div className="s-grid s-grid--3 s-snap">
              {social.slice(0, 6).map(s => (
                <article key={s.id} className="s-card s-card--link">
                  <div className="s-card__media">
                    <img src={s.image} alt="" loading="lazy" />
                    <span className="s-badge s-badge--dark">{s.platformLabel}</span>
                    {s.platform === 'youtube' && <span className="s-news-play" aria-hidden="true"><PlayCircle /></span>}
                  </div>
                  <div className="s-card__body">
                    <div className="s-card__meta">
                      <span>{s.channelName}</span>
                      <time dateTime={s.date}>{formatDate(s.date)}</time>
                    </div>
                    <h3 className="s-card__title s-news-social-title">
                      <a className="s-card__cover" href={s.originalUrl} target="_blank" rel="noopener noreferrer">{s.title}</a>
                    </h3>
                    <p className="s-card__text">{excerpt(s.content, 140)}</p>
                    <div className="s-card__foot">
                      <span className="s-link">Xem bài gốc</span>
                      <span className="s-card__arrow" aria-hidden="true"><ArrowUpRight /></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand title="Muốn DANAVA viết về dự án của bạn?" lead="Chia sẻ câu chuyện hoặc bài toán của doanh nghiệp, chúng tôi sẽ cùng bạn kể nó thật rõ ràng." />
    </main>
  );
}
