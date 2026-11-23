/**
 * /blogs/[slug]/ — trang bài viết (server component: toàn văn, mục lục và JSON-LD có trong HTML phản hồi).
 * Mục lục tự sinh từ tiêu đề; mỗi tiêu đề có id ổn định theo nội dung để liên kết neo hoạt động.
 */
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, ChevronDown, RefreshCw, UserRound } from 'lucide-react';
import type { Post, SiteData } from '@/lib/content';
import { authorOf, relatedPosts, servicesForPost, topicHasPage, topicHref, topicOf } from '@/lib/site-queries';
import { Crumbs, CtaBand } from './ui';
import { formatDate } from './catalog';
import { postCover, RelatedPosts, ServiceLinks } from './blocks';
import { contactHrefFor } from './ServiceDetailPage';
import { DraftBanner } from './SubServicePage';
import { pageCopy } from '@/lib/blocks';
import { rich } from './rich';

type TocItem = { id: string; title: string; level: number };
type Img = { src: string; alt: string };
type Block = { type: 'heading' | 'paragraph' | 'list' | 'quote' | 'images'; id?: string; text?: string; items?: string[]; level?: number; images?: Img[] };

const IMAGE_LINE = /^!\[([^\]]*)\]\((\/assets\/[a-zA-Z0-9/_.-]+\.(?:webp|png|jpe?g))\)$/;

/** "Tiêu đề Mục 1" → "tieu-de-muc-1" */
export function anchorSlug(text: string) {
  return text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'muc';
}

/** Chuẩn hóa nội dung CMS (văn bản thuần) thành khối tiêu đề, đoạn, danh sách, trích dẫn. */
export function parseArticleBody(rawBody: string): { blocks: Block[]; toc: TocItem[]; wordCount: number } {
  const lines = rawBody.split('\n');
  const blocks: Block[] = [];
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  let list: string[] = [];
  let wordCount = 0;
  const flush = () => { if (list.length) { blocks.push({ type: 'list', items: list }); list = []; } };
  const idFor = (title: string) => {
    const base = anchorSlug(title);
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  const heading = (title: string, level: number) => {
    flush();
    const id = idFor(title);
    toc.push({ id, title, level });
    blocks.push({ type: 'heading', id, text: title, level });
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) { flush(); continue; }

    // Ảnh: `![mô tả](/assets/...)`; các ảnh liền nhau được gom thành một lưới.
    const img = t.match(IMAGE_LINE);
    if (img) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.type === 'images') last.images!.push({ alt: img[1], src: img[2] });
      else blocks.push({ type: 'images', images: [{ alt: img[1], src: img[2] }] });
      continue;
    }

    const words = t.split(/\s+/).filter(Boolean).length;
    wordCount += words;

    // Tiêu đề tường minh kiểu Markdown: `## Tiêu đề`, `### Tiêu đề phụ`.
    const md = t.match(/^(#{2,3})\s+(.+)/);
    if (md) { heading(md[2], md[1].length); continue; }

    if (/^[-*+]\s+/.test(t)) { list.push(t.replace(/^[-*+]\s+/, '')); continue; }
    if (/^\d+\.\d+\s+/.test(t)) { list.push(t); continue; }

    const numbered = /^(\d+|[IVX]+)[.)]\s+(.+)/.test(t);
    const step = /^Bước\s+\d+[:\-]\s+(.+)/i.test(t);
    const caps = t.length >= 6 && t.length <= 85 && t === t.toUpperCase() && !t.endsWith('.') && !t.includes(':') && words >= 2;
    if (numbered || step || caps) { heading(t, numbered || step ? 2 : 3); continue; }
    if (t.startsWith('>') || (t.startsWith('“') && t.endsWith('”'))) {
      flush();
      blocks.push({ type: 'quote', text: t.replace(/^>\s*/, '') });
      continue;
    }
    flush();
    blocks.push({ type: 'paragraph', text: t });
  }
  flush();
  return { blocks, toc, wordCount };
}

function TocList({ toc }: { toc: TocItem[] }) {
  return (
    <ol className="s-article-toc__list">
      {toc.map(item => (
        <li key={item.id} className={item.level === 3 ? 's-article-toc__sub' : undefined}>
          <a href={`#${item.id}`}>{item.title}</a>
        </li>
      ))}
    </ol>
  );
}

export function ArticleView({ post, data, preview }: { post: Post; data: SiteData; preview?: boolean }) {
  const { blocks, toc, wordCount } = parseArticleBody(post.body || '');
  const minutes = Math.max(2, Math.ceil(wordCount / 220));
  const cover = postCover(post);
  const topic = topicOf(data, post);
  const author = authorOf(data, post);
  const related = relatedPosts(data, post, 3);
  const services = servicesForPost(data, post);
  const hasToc = toc.length >= 2;
  const topicCrumb = topic && topicHasPage(data, topic) ? { href: topicHref(topic), label: topic.name } : { label: topic?.name || post.category };

  return (
    <main id="main">
      {preview && <DraftBanner />}
      <article>
        <header className="s-article-head">
          <div className="s-container s-container--narrow">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/blogs/', label: 'Blogs' }, topicCrumb]} />
            <p className="s-eyebrow s-article-cat">{topic?.name || post.category}</p>
            <h1 className="s-h1 s-article-title">{post.title}</h1>
            {post.excerpt && <p className="s-lead">{post.excerpt}</p>}
            <div className="s-article-meta">
              <span>
                <UserRound aria-hidden="true" />
                {author ? <Link href={`/doi-ngu/${author.id}/`}>{author.name}</Link> : 'DANAVA Solutions'}
              </span>
              {post.date && <span><CalendarDays aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>}
              {post.updated && post.updated !== post.date && (
                <span><RefreshCw aria-hidden="true" />Cập nhật <time dateTime={post.updated}>{formatDate(post.updated)}</time></span>
              )}
              <span><Clock aria-hidden="true" />{minutes} phút đọc</span>
            </div>
          </div>
        </header>

        {cover && (
          <div className="s-container s-article-cover-wrap">
            <figure className="s-frame s-frame--plain s-article-cover">
              <img src={cover} alt={post.title} fetchPriority="high" />
            </figure>
          </div>
        )}

        <div className={`s-container s-article-layout${hasToc ? '' : ' s-article-layout--single'}`}>
          {hasToc && (
            <aside className="s-article-toc" aria-label="Mục lục nội dung">
              <details className="s-article-toc__mobile">
                <summary>Mục lục nội dung <ChevronDown aria-hidden="true" /></summary>
                <TocList toc={toc} />
              </details>
              <nav className="s-article-toc__desktop" aria-label="Mục lục">
                <p className="s-article-toc__title">Mục lục nội dung</p>
                <TocList toc={toc} />
              </nav>
            </aside>
          )}

          <div className="s-article-body">
            <div className="s-prose">
              {blocks.map((b, i) => {
                if (b.type === 'heading') return b.level === 3
                  ? <h3 key={i} id={b.id}>{b.text}</h3>
                  : <h2 key={i} id={b.id}>{b.text}</h2>;
                if (b.type === 'list') return <ul key={i}>{b.items!.map((it, j) => <li key={j}>{it}</li>)}</ul>;
                if (b.type === 'quote') return <blockquote key={i}>{b.text}</blockquote>;
                if (b.type === 'images') return (
                  <div key={i} className={`s-article-gallery${b.images!.length > 1 ? ' s-article-gallery--grid' : ''}`}>
                    {b.images!.map((im, j) => (
                      <figure key={j}>
                        <img src={im.src} alt={im.alt || post.title} loading="lazy" decoding="async" />
                        {im.alt && <figcaption>{im.alt}</figcaption>}
                      </figure>
                    ))}
                  </div>
                );
                return <p key={i}>{b.text}</p>;
              })}
            </div>

            {services.length > 0 && (
              <aside className="u-article-cta" aria-label="Giải pháp liên quan">
                <p className="s-eyebrow">Giải pháp liên quan</p>
                <p className="s-text">Bài viết thuộc chủ đề {services.map(s => s.title).join(', ')}. Bạn cần trao đổi cho trường hợp của doanh nghiệp mình?</p>
                <div className="s-row">
                  <Link className="s-btn s-btn--primary" href={contactHrefFor(services[0])}>{services[0].id === 'studio' ? 'Đăng ký demo' : 'Nhận tư vấn'}</Link>
                  <Link className="s-btn s-btn--secondary" href={`/giai-phap/${services[0].slug}/`}>Tìm hiểu {services[0].title}</Link>
                </div>
              </aside>
            )}

            <footer className="s-article-foot">
              <Link className="s-link" href={topic && topicHasPage(data, topic) ? topicHref(topic) : '/blogs/'}>
                <ArrowLeft aria-hidden="true" />{topic && topicHasPage(data, topic) ? `Bài khác trong ${topic.name}` : 'Tất cả bài viết'}
              </Link>
            </footer>
          </div>
        </div>
      </article>

      <RelatedPosts posts={related} data={data} title="Bài viết liên quan" id="s-article-related" soft />
      <ServiceLinks services={services.slice(0, 3)} />
      <CtaBand title={rich(pageCopy(data, 'mac-dinh').ctaTitle)} lead={pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: services[0] ? contactHrefFor(services[0]) : '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}

export default ArticleView;
