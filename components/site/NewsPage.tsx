/**
 * /kien-thuc/ — mục Kiến thức (server component; mọi liên kết có trong HTML).
 * Bài được nhóm theo danh mục thực tế (data.topics). Danh mục đủ bài có trang riêng /kien-thuc/chu-de/[slug]/.
 * Bài lưu trữ từ website cũ (ngoài chủ đề dịch vụ) vẫn giữ URL, gom ở cuối trang.
 */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Post, SiteData, Topic } from '@/lib/content';
import { ARCHIVE_TOPIC } from '@/lib/content-defaults';
import { getPublicSocialPosts } from '@/lib/social-feed';
import { knowledgePosts, postHref, postsForTopic, publishedPosts, topicHasPage, topicHref } from '@/lib/site-queries';
import { PageHead, SectionHeading, CtaBand } from './ui';
import { formatDate, excerpt } from './catalog';
import { postCover, PostTile } from './blocks';

const PER_TOPIC = 6;

export function TopicNav({ data, current }: { data: SiteData; current?: string }) {
  const topics = (data.topics || []).filter(t => t.published && postsForTopic(data, t.id).length > 0);
  if (!topics.length) return null;
  return (
    <nav className="u-topics" aria-label="Danh mục kiến thức">
      <Link className={`s-tab${!current ? ' is-active' : ''}`} href="/kien-thuc/" aria-current={!current ? 'page' : undefined}>Tất cả</Link>
      {topics.map(t => {
        const n = postsForTopic(data, t.id).length;
        const href = topicHasPage(data, t) ? topicHref(t) : `/kien-thuc/#chu-de-${t.slug}`;
        return (
          <Link key={t.id} className={`s-tab${current === t.id ? ' is-active' : ''}`} href={href} aria-current={current === t.id ? 'page' : undefined}>
            {t.name}<span className="s-tab__count">{n}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function TopicSection({ data, topic, posts }: { data: SiteData; topic: Topic; posts: Post[] }) {
  const page = topicHasPage(data, topic);
  return (
    <section className="s-section u-topic-sec" id={`chu-de-${topic.slug}`} aria-labelledby={`t-${topic.slug}`}>
      <div className="s-container">
        <SectionHeading
          title={<span id={`t-${topic.slug}`}>{topic.name}</span>}
          lead={topic.description}
          action={page ? <Link className="s-link" href={topicHref(topic)}>Xem tất cả {posts.length} bài <ArrowRight aria-hidden="true" /></Link> : undefined}
        />
        <div className={`s-grid ${posts.length >= 3 ? 's-grid--3' : 's-grid--2'} s-list-m`}>
          {posts.slice(0, PER_TOPIC).map(p => <PostTile key={p.id} post={p} data={data} />)}
        </div>
      </div>
    </section>
  );
}

export default function NewsPage({ data }: { data: SiteData }) {
  const posts = knowledgePosts(data);
  const featured = posts.find(p => postCover(p)) || posts[0];
  const topics = (data.topics || []).filter(t => t.published && t.id !== ARCHIVE_TOPIC);
  const untopiced = posts.filter(p => p !== featured && !topics.some(t => t.id === p.topicId));
  const archive = publishedPosts(data).filter(p => p.topicId === ARCHIVE_TOPIC);
  const social = getPublicSocialPosts();

  return (
    <main id="main">
      <PageHead
        eyebrow="Kiến thức"
        title="Kiến thức & tin hoạt động từ DANAVA"
        lead="Bài viết về vận hành phòng tập, website, yoga, du lịch và những hoạt động cộng đồng DANAVA đồng hành."
        crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Kiến thức' }]}
      />

      <div className="s-container"><TopicNav data={data} /></div>

      {featured && (
        <section className="s-section--flush-top s-news-featured-wrap" aria-label="Bài viết tiêu điểm">
          <div className="s-container">
            <article className="s-card s-card--link s-news-featured">
              <div className="s-news-featured__media">
                {postCover(featured) && <img src={postCover(featured)} alt="" fetchPriority="high" />}
              </div>
              <div className="s-news-featured__body">
                <div className="s-row">
                  <span className="s-badge s-badge--orange">Mới nhất</span>
                  <span className="s-muted s-small">{featured.date ? formatDate(featured.date) : ''}</span>
                </div>
                <h2 className="s-h2 s-news-featured__title">
                  <Link className="s-card__cover" href={postHref(featured)}>{featured.title}</Link>
                </h2>
                <p className="s-lead s-news-featured__lead">{excerpt(featured.excerpt || featured.body, 220)}</p>
                <span className="s-link">Đọc bài viết <ArrowRight aria-hidden="true" /></span>
              </div>
            </article>
          </div>
        </section>
      )}

      {topics.map(t => {
        const list = postsForTopic(data, t.id).filter(p => p !== featured);
        return list.length ? <TopicSection key={t.id} data={data} topic={t} posts={list} /> : null;
      })}

      {untopiced.length > 0 && (
        <section className="s-section" aria-labelledby="t-khac">
          <div className="s-container">
            <SectionHeading title={<span id="t-khac">Bài viết khác</span>} />
            <div className="s-grid s-grid--3 s-list-m">{untopiced.map(p => <PostTile key={p.id} post={p} data={data} />)}</div>
          </div>
        </section>
      )}

      {social.length > 1 && (
        <section className="s-section s-section--soft" aria-labelledby="s-news-social">
          <div className="s-container">
            <SectionHeading id="s-news-social" eyebrow="Từ kênh chính thức" title="Cập nhật từ Fanpage & YouTube" />
            <div className="s-grid s-grid--3 s-snap">
              {social.slice(0, 6).map(s => (
                <article key={s.id} className="s-card s-card--link">
                  <div className="s-card__media"><img src={s.image} alt="" loading="lazy" /><span className="s-badge s-badge--dark">{s.platformLabel}</span></div>
                  <div className="s-card__body">
                    <div className="s-card__meta"><span>{s.channelName}</span><time dateTime={s.date}>{formatDate(s.date)}</time></div>
                    <h3 className="s-card__title"><a className="s-card__cover" href={s.originalUrl} target="_blank" rel="noopener">{s.title}</a></h3>
                    <p className="s-card__text">{excerpt(s.content, 140)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {archive.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="t-archive">
          <div className="s-container s-container--narrow">
            <h2 className="s-h3" id="t-archive">Lưu trữ từ website cũ</h2>
            <p className="s-text s-muted">Các bài viết trước đây của DANAVA, ngoài nhóm chủ đề dịch vụ hiện tại. Giữ nguyên đường dẫn để bạn đọc cũ vẫn truy cập được.</p>
            <ul className="u-linklist u-linklist--dates">
              {archive.map(p => (
                <li key={p.id}>
                  <Link href={postHref(p)}>{p.title}</Link>
                  {p.date && <time dateTime={p.date}>{formatDate(p.date)}</time>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand title="Cần trao đổi cho trường hợp cụ thể?" lead="Kể cho DANAVA về doanh nghiệp của bạn, chuyên viên sẽ liên hệ lại để tư vấn." primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}

