/**
 * /blogs/[slug]/ — trang bài viết (server component: toàn văn, mục lục và JSON-LD có trong HTML phản hồi).
 * Mục lục tự sinh từ tiêu đề; mỗi tiêu đề có id ổn định theo nội dung để liên kết neo hoạt động.
 */
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, ChevronDown, RefreshCw, UserRound } from 'lucide-react';
import type { Post, SiteData } from '@/lib/content';
import { authorOf, postHref, relatedPosts, servicesForPost, topicHasPage, topicHref, topicOf } from '@/lib/site-queries';
import { Crumbs, CtaBand } from './ui';
import { formatDate } from './catalog';
import { postCover, RelatedPosts, ServiceLinks } from './blocks';
import { contactHrefFor } from './ServiceDetailPage';
import { DraftBanner } from './SubServicePage';
import { pageCopy } from '@/lib/blocks';
import { cmsImage, cmsText, ct } from './cms';
/** Giữ số + đơn vị là một mục trong hàng meta (inline-flex có khoảng cách) như chữ thuần trước đây. */
const INLINE = { display: 'inline' } as const;
import { sentenceCase } from '@/lib/sentence-case';
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
  const side = relatedPosts(data, post, 4);
  const topicCrumb = topic && topicHasPage(data, topic) ? { href: topicHref(topic), label: topic.name } : { label: topic?.name || post.category };
  // Chữ dùng chung cho mọi bài viết (txt.article.*) và trường của hồ sơ (chủ đề, nhân sự, bài viết, giải pháp)
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `article.${k}`, def, label, opts);
  const rec = (kind: string, id: string, f: string, label: string, scopeLabel: string) => cmsText(`rec.${kind}.${id}.${f}`, label, { scope: 'record', scopeLabel });
  const topicName = (tp: { id: string }) => rec('topics', tp.id, 'name', 'Tên chủ đề', 'Hồ sơ chủ đề');
  const svcTitle = (id: string) => rec('services', id, 'title', 'Tên giải pháp', 'Hồ sơ giải pháp');
  const T = {
    author: t('meta.author', 'DANAVA Solutions', 'Tác giả mặc định'), updated: t('meta.updated', 'Cập nhật', 'Nhãn ngày cập nhật'), minutes: t('meta.minutes', 'phút đọc', 'Đơn vị thời gian đọc'),
    toc: t('toc.title', 'Mục lục nội dung', 'Tiêu đề mục lục'), side: t('side.title', 'Bài nổi bật', 'Tiêu đề khối'),
    svcEyebrow: t('services.eyebrow', 'Giải pháp liên quan', 'Dòng chữ nhỏ'), svcLead: t('services.lead', 'Bài viết thuộc chủ đề', 'Câu dẫn (trước tên giải pháp)'),
    svcAsk: t('services.ask', 'Bạn cần trao đổi cho trường hợp của doanh nghiệp mình?', 'Câu hỏi'),
    demo: t('services.demo', 'Đăng ký demo', 'Chữ nút'), consult: t('services.consult', 'Nhận tư vấn', 'Chữ nút'), learn: t('services.learn', 'Tìm hiểu', 'Chữ nút (trước tên giải pháp)'),
    moreIn: t('foot.more-in', 'Bài khác trong', 'Chữ liên kết (trước tên chủ đề)'), all: t('foot.all', 'Tất cả bài viết', 'Chữ liên kết')
  };

  return (
    <main id="main">
      {preview && <DraftBanner />}
      <article>
        <header className="s-article-head">
          <div className="s-container s-container--narrow">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/blogs/', label: 'Blogs' }, topicCrumb]} />
            <p className="s-eyebrow s-article-cat" {...(topic?.name ? topicName(topic) : rec('posts', post.id, 'category', 'Chuyên mục', 'Bài viết này'))}>{topic?.name || post.category}</p>
            <h1 className="s-h1 s-article-title">{sentenceCase(post.title)}</h1>
            {post.excerpt && <p className="s-lead" {...cmsText(`rec.posts.${post.id}.excerpt`, 'Tóm tắt bài viết', { multiline: true, scope: 'record', scopeLabel: 'Bài viết này' })}>{post.excerpt}</p>}
            <div className="s-article-meta">
              <span>
                <UserRound aria-hidden="true" />
                {author ? <Link href={`/doi-ngu/${author.id}/`}><span {...rec('staff', author.id, 'name', 'Tên tác giả', 'Hồ sơ nhân sự')}>{author.name}</span></Link> : <span {...T.author.a}>{T.author.v}</span>}
              </span>
              {post.date && <span><CalendarDays aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>}
              {post.updated && post.updated !== post.date && (
                <span><RefreshCw aria-hidden="true" /><span {...T.updated.a}>{T.updated.v}</span> <time dateTime={post.updated}>{formatDate(post.updated)}</time></span>
              )}
              <span><Clock aria-hidden="true" /><span style={INLINE}>{minutes} <span style={INLINE} {...T.minutes.a}>{T.minutes.v}</span></span></span>
            </div>
          </div>
        </header>

        {cover && (
          <div className="s-container s-article-cover-wrap">
            <figure className="s-frame s-frame--plain s-article-cover">
              <img {...cmsImage(`rec.posts.${post.id}`, 'Ảnh bìa bài viết', { scope: 'record', scopeLabel: 'Bài viết này' })} src={cover} alt={post.title} fetchPriority="high" />
            </figure>
          </div>
        )}

        <div className={`s-container s-article-layout${hasToc ? '' : ' s-article-layout--single'}`}>
          {(hasToc || side.length > 0) && (
            <aside className="s-article-toc" aria-label="Mục lục và bài nổi bật">
              {hasToc && (
                <details className="s-article-toc__mobile">
                  <summary><span {...T.toc.a}>{T.toc.v}</span> <ChevronDown aria-hidden="true" /></summary>
                  <TocList toc={toc} />
                </details>
              )}
              {hasToc && (
                <nav className="s-article-toc__desktop" aria-label="Mục lục">
                  <p className="s-article-toc__title" {...T.toc.a}>{T.toc.v}</p>
                  <TocList toc={toc} />
                </nav>
              )}
              {side.length > 0 && (
                <section className="s-article-side" aria-label="Bài nổi bật">
                  <p className="s-article-side__title" {...T.side.a}>{T.side.v}</p>
                  <ul>
                    {side.map(p => {
                      const img = postCover(p);
                      return (
                        <li key={p.id}>
                          <Link href={postHref(p)}>
                            {img && <img src={img} alt="" loading="lazy" decoding="async" width={72} height={54} />}
                            <span>
                              <strong {...rec('posts', p.id, 'title', 'Tiêu đề bài viết', 'Hồ sơ bài viết')}>{p.title}</strong>
                              {p.date && <small>{formatDate(p.date)}</small>}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
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
                <p className="s-eyebrow" {...T.svcEyebrow.a}>{T.svcEyebrow.v}</p>
                <p className="s-text"><span {...T.svcLead.a}>{T.svcLead.v}</span> {services.map((s, i) => <span key={s.id}>{i > 0 && ', '}<span {...svcTitle(s.id)}>{s.title}</span></span>)}. <span {...T.svcAsk.a}>{T.svcAsk.v}</span></p>
                <div className="s-row">
                  {(() => { const x = services[0].id === 'studio' ? T.demo : T.consult; return <Link className="s-btn s-btn--primary" href={contactHrefFor(services[0])}><span {...x.a}>{x.v}</span></Link>; })()}
                  <Link className="s-btn s-btn--secondary" href={`/giai-phap/${services[0].slug}/`}><span><span {...T.learn.a}>{T.learn.v}</span> <span {...svcTitle(services[0].id)}>{services[0].title}</span></span></Link>
                </div>
              </aside>
            )}

            <footer className="s-article-foot">
              <Link className="s-link" href={topic && topicHasPage(data, topic) ? topicHref(topic) : '/blogs/'}>
                <ArrowLeft aria-hidden="true" />{topic && topicHasPage(data, topic) ? <span><span {...T.moreIn.a}>{T.moreIn.v}</span> <span {...topicName(topic)}>{topic.name}</span></span> : <span {...T.all.a}>{T.all.v}</span>}
              </Link>
            </footer>
          </div>
        </div>
      </article>

      <RelatedPosts posts={related} data={data} title="Bài viết liên quan" id="s-article-related" soft />
      <ServiceLinks services={services.slice(0, 3)} />
      <CtaBand cms={{ title: 'pages.mac-dinh.ctaTitle', lead: 'pages.mac-dinh.ctaLead' }} title={rich(pageCopy(data, 'mac-dinh').ctaTitle)} lead={pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: services[0] ? contactHrefFor(services[0]) : '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}

export default ArticleView;
