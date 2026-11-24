/**
 * /blogs/ — trang Blogs (server component; mọi liên kết có trong HTML).
 * Bìa tạp chí có ô tìm kiếm (đang tìm thì chỉ hiện kết quả) → bài tiêu điểm + "Mới cập nhật" → lưới bài có bộ lọc chủ đề (BlogExplorer) →
 * cập nhật từ Fanpage & YouTube → lưu trữ từ website cũ chia theo năm.
 * Chủ đề đủ bài có trang riêng /blogs/chu-de/[slug]/.
 */
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import type { Post, SiteData } from '@/lib/content';
import { ARCHIVE_TOPIC } from '@/lib/content-defaults';
import { getPublicSocialPosts } from '@/lib/social-feed';
import { knowledgePosts, postHref, postsForTopic, publishedPosts, topicHasPage, topicHref, topicOf } from '@/lib/site-queries';
import { Crumbs, CtaBand } from './ui';
import { formatDate, excerpt } from './catalog';
import { postCover } from './blocks';
import { pageCopy } from '@/lib/blocks';
import { cmsText } from './cms';
import { rich } from './rich';
import { sentenceCase } from '@/lib/sentence-case';
import { BlogExplorer, type BlogTopic } from './BlogExplorer';
import type { BlogCard } from './BlogCardItem';
import { BlogSearch } from './BlogSearch';
import { BlogResults } from './BlogResults';
import { isFiltering, type BlogFilter } from '@/lib/blog-search';

/** Ước lượng thời gian đọc (~220 từ/phút) */
const minutesOf = (p: Post) => Math.max(1, Math.round((p.body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 220));

export function TopicNav({ data, current }: { data: SiteData; current?: string }) {
  const topics = (data.topics || []).filter(t => t.published && postsForTopic(data, t.id).length > 0);
  if (!topics.length) return null;
  return (
    <nav className="u-topics" aria-label="Chủ đề blog">
      <Link className={`s-tab${!current ? ' is-active' : ''}`} href="/blogs/" aria-current={!current ? 'page' : undefined}>Tất cả</Link>
      {topics.map(t => {
        const n = postsForTopic(data, t.id).length;
        const href = topicHasPage(data, t) ? topicHref(t) : `/blogs/#chu-de-${t.slug}`;
        return (
          <Link key={t.id} className={`s-tab${current === t.id ? ' is-active' : ''}`} href={href} aria-current={current === t.id ? 'page' : undefined}>
            {t.name}<span className="s-tab__count">{n}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function NewsPage({ data, filter }: { data: SiteData; filter: BlogFilter }) {
  const filtering = isFiltering(filter);
  const copy = pageCopy(data, 'kien-thuc');
  const posts = knowledgePosts(data);
  const featured = posts.find(p => postCover(p)) || posts[0];
  const fresh = posts.filter(p => p !== featured).slice(0, 4);
  const topicList = (data.topics || []).filter(t => t.published && t.id !== ARCHIVE_TOPIC && posts.some(p => p.topicId === t.id));
  const topics: BlogTopic[] = topicList.map((t, i) => ({
    id: t.id, name: t.name, slug: t.slug, tone: i % 6,
    count: posts.filter(p => p.topicId === t.id).length,
    page: topicHasPage(data, t) ? topicHref(t) : undefined
  }));
  const toCard = (p: Post): BlogCard => ({
    id: p.id, href: postHref(p), title: p.title, excerpt: excerpt(p.excerpt || p.body, 150), cover: postCover(p),
    date: p.date || '', dateLabel: p.date ? formatDate(p.date) : '', minutes: minutesOf(p), topic: p.topicId || ''
  });
  const cards = posts.map(toCard);
  const archive = publishedPosts(data).filter(p => p.topicId === ARCHIVE_TOPIC);
  const years = Array.from(new Set(archive.map(p => (p.date || '').slice(0, 4) || 'Khác'))).sort((a, b) => b.localeCompare(a));
  const social = getPublicSocialPosts();
  const latest = posts.map(p => p.date || '').sort().pop();
  const collage = posts.filter(p => postCover(p)).slice(0, 3);

  return (
    <main id="main" className="bl">
      <section className={`bl-hero${filtering ? ' bl-hero--compact' : ''}`} aria-labelledby="bl-title">
        <div className="s-container bl-hero__grid">
          <div className="bl-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Blogs' }]} />
            <p className="bl-hero__kicker" {...cmsText('pages.kien-thuc.kicker', 'Dòng chữ nhỏ')}>{copy.kicker || 'DANAVA Blogs'}</p>
            <h1 className="bl-hero__title" id="bl-title" {...cmsText('pages.kien-thuc.title', 'Tiêu đề trang', { rich: true })}>{rich(copy.title)}</h1>
            <p className="bl-hero__lead" {...cmsText('pages.kien-thuc.lead', 'Câu dẫn', { multiline: true })}>{copy.lead}</p>
            <BlogSearch data={data} filter={filter} />
            {!filtering && <dl className="bl-hero__stats">
              <div><dt>Bài viết</dt><dd>{posts.length}</dd></div>
              <div><dt>Chủ đề</dt><dd>{topics.length}</dd></div>
              {latest && <div><dt>Mới nhất</dt><dd>{formatDate(latest)}</dd></div>}
            </dl>}
          </div>
          {!filtering && <div className="bl-hero__collage" aria-hidden="true">
            {collage.map((p, i) => (
              <figure key={p.id} className={`bl-polaroid bl-polaroid--${i}`}>
                <img src={postCover(p)} alt="" {...(i === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
                <figcaption>{topicOf(data, p)?.name || 'DANAVA'}</figcaption>
              </figure>
            ))}
            <span className="bl-hero__stamp">Blogs<br /><small>DANAVA</small></span>
          </div>}
        </div>
      </section>

      {filtering ? <BlogResults data={data} filter={filter} toCard={toCard} /> : <>
      {featured && (
        <section className="bl-feature" aria-labelledby="bl-feature-title">
          <div className="s-container bl-feature__grid">
            <article className="bl-cover">
              {postCover(featured) && <img src={postCover(featured)} alt="" decoding="async" />}
              <div className="bl-cover__body">
                <p className="bl-card__meta"><span className="bl-pill bl-pill--light">Tiêu điểm · {topicOf(data, featured)?.name || 'Bài viết'}</span>{featured.date && <time dateTime={featured.date}>{formatDate(featured.date)}</time>}</p>
                <h2 className="bl-cover__title" id="bl-feature-title"><Link className="bl-card__link" href={postHref(featured)}>{sentenceCase(featured.title)}</Link></h2>
                <p className="bl-cover__text">{excerpt(featured.excerpt || featured.body, 180)}</p>
                <p className="bl-card__foot"><span><Clock aria-hidden="true" />{minutesOf(featured)} phút đọc</span><span className="bl-card__go">Đọc bài <ArrowRight aria-hidden="true" /></span></p>
              </div>
            </article>
            {fresh.length > 0 && (
              <aside className="bl-fresh" aria-labelledby="bl-fresh-title">
                <h2 className="bl-fresh__title" id="bl-fresh-title">Mới cập nhật</h2>
                <ol>
                  {fresh.map((p, i) => (
                    <li key={p.id}>
                      <span className="bl-fresh__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="bl-fresh__meta">{topicOf(data, p)?.name || 'Bài viết'}{p.date ? ` · ${formatDate(p.date)}` : ''}</p>
                        <Link className="bl-fresh__link" href={postHref(p)}>{sentenceCase(p.title)}</Link>
                      </div>
                      {postCover(p) && <img src={postCover(p)} alt="" loading="lazy" decoding="async" />}
                    </li>
                  ))}
                </ol>
              </aside>
            )}
          </div>
        </section>
      )}

      <section className="bl-sec" aria-labelledby="bl-all-title">
        <div className="s-container">
          <div className="bl-head">
            <p className="bl-head__kicker">Đọc theo chủ đề</p>
            <h2 className="bl-head__title" id="bl-all-title">Mỗi bài, <em>một góc nhìn.</em></h2>
          </div>
          <BlogExplorer cards={cards} topics={topics} featuredId={featured?.id} />
        </div>
      </section>

      {social.length > 1 && (
        <section className="bl-sec bl-sec--soft" aria-labelledby="bl-social-title">
          <div className="s-container">
            <div className="bl-head">
              <p className="bl-head__kicker">Từ kênh chính thức</p>
              <h2 className="bl-head__title" id="bl-social-title">Cập nhật từ <em>Fanpage & YouTube.</em></h2>
            </div>
            <ul className="bl-social">
              {social.slice(0, 6).map(s => (
                <li key={s.id}>
                  <div className="bl-social__media"><img src={s.image} alt="" loading="lazy" /><span>{s.platformLabel}</span></div>
                  <p className="bl-fresh__meta">{s.channelName} · <time dateTime={s.date}>{formatDate(s.date)}</time></p>
                  <a className="bl-fresh__link" href={s.originalUrl} target="_blank" rel="noopener">{s.title}<span className="s-sr"> (mở tab mới)</span></a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {archive.length > 0 && (
        <section className="bl-sec bl-archive" aria-labelledby="bl-archive-title">
          <div className="s-container">
            <div className="bl-head">
              <p className="bl-head__kicker">Lưu trữ</p>
              <h2 className="bl-head__title" id="bl-archive-title">Từ website cũ <em>của DANAVA.</em></h2>
              <p className="bl-head__lead">Các bài viết trước đây, giữ nguyên đường dẫn để bạn đọc cũ vẫn truy cập được.</p>
            </div>
            <div className="bl-archive__years">
              {years.map(y => (
                <div key={y} className="bl-year">
                  <p className="bl-year__n" aria-hidden="true">{y}</p>
                  <h3 className="s-sr">Năm {y}</h3>
                  <ul>
                    {archive.filter(p => ((p.date || '').slice(0, 4) || 'Khác') === y).map(p => (
                      <li key={p.id}>
                        <Link href={postHref(p)}>{sentenceCase(p.title)}</Link>
                        {p.date && <time dateTime={p.date}>{formatDate(p.date).slice(0, 5)}</time>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      </>}

      <CtaBand cms={{ title: 'pages.kien-thuc.ctaTitle', lead: copy.ctaLead ? 'pages.kien-thuc.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}
