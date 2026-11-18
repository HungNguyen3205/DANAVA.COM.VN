'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock, ChevronDown } from 'lucide-react';
import { useSite } from '../SiteStore';
import { archivedPosts } from '@/lib/archived-posts';
import type { Post } from '@/lib/content';
import { Crumbs, CtaBand } from './ui';
import { formatDate } from './catalog';
import { PostCard, postImage } from './NewsPage';

type TocItem = { id: string; title: string; level: number };
type Img = { src: string; alt: string };
type Block = { type: 'heading' | 'paragraph' | 'list' | 'quote' | 'images'; id?: string; text?: string; items?: string[]; level?: number; images?: Img[] };

const IMAGE_LINE = /^!\[([^\]]*)\]\((\/assets\/[a-zA-Z0-9/_.-]+\.(?:webp|png|jpe?g))\)$/;

/** Chuẩn hóa nội dung CMS (văn bản thuần) thành khối tiêu đề, đoạn, danh sách, trích dẫn. */
export function parseArticleBody(rawBody: string): { blocks: Block[]; toc: TocItem[]; wordCount: number } {
  const lines = rawBody.split('\n');
  const blocks: Block[] = [];
  const toc: TocItem[] = [];
  let list: string[] = [];
  let wordCount = 0;
  let index = 1;
  const flush = () => { if (list.length) { blocks.push({ type: 'list', items: list }); list = []; } };

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
    if (md) {
      flush();
      const id = `section-${index++}`;
      const level = md[1].length;
      toc.push({ id, title: md[2], level });
      blocks.push({ type: 'heading', id, text: md[2], level });
      continue;
    }

    if (/^[-*+]\s+/.test(t)) { list.push(t.replace(/^[-*+]\s+/, '')); continue; }
    if (/^\d+\.\d+\s+/.test(t)) { list.push(t); continue; }

    const numbered = /^(\d+|[IVX]+)[.)]\s+(.+)/.test(t);
    const step = /^Bước\s+\d+[:\-]\s+(.+)/i.test(t);
    const caps = t.length >= 6 && t.length <= 85 && t === t.toUpperCase() && !t.endsWith('.') && !t.includes(':') && words >= 2;
    if (numbered || step || caps) {
      flush();
      const id = `section-${index++}`;
      const level = numbered || step ? 2 : 3;
      toc.push({ id, title: t, level });
      blocks.push({ type: 'heading', id, text: t, level });
      continue;
    }
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

export function ArticleNotAvailable({ title, text }: { title: string; text: string }) {
  return (
    <main id="main" className="s-section">
      <div className="s-container s-container--narrow s-article-missing">
        <p className="s-eyebrow">Bản tin DANAVA</p>
        <h1 className="s-h1">{title}</h1>
        <p className="s-lead">{text}</p>
        <div className="s-row s-row--center">
          <Link className="s-btn s-btn--primary" href="/kien-thuc/"><ArrowLeft aria-hidden="true" />Quay lại Bản tin</Link>
          <Link className="s-btn s-btn--secondary" href="/">Về Trang chủ</Link>
        </div>
      </div>
    </main>
  );
}

export function ArticleView({ slug, post: given }: { slug?: string; post?: Post }) {
  const { data } = useSite();
  const post = given || data.posts.find(p => p.slug === slug && p.published);

  if (!post) {
    return <ArticleNotAvailable title="Bài viết chưa được xuất bản" text="Nội dung này đang được biên tập, đã ẩn hoặc chưa sẵn sàng công khai." />;
  }

  const { blocks, toc, wordCount } = parseArticleBody(post.body || '');
  const minutes = Math.max(2, Math.ceil(wordCount / 220));
  const cover = postImage(post);
  const source = post.source || archivedPosts[post.id]?.source;
  const others = data.posts.filter(p => p.published && p.id !== post.id);
  const related = [...others.filter(p => p.category === post.category), ...others.filter(p => p.category !== post.category)].slice(0, 3);
  const hasToc = toc.length >= 2;

  return (
    <main id="main">
      <article>
        <header className="s-article-head">
          <div className="s-container s-container--narrow">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/kien-thuc/', label: 'Bản tin' }, { label: post.category }]} />
            <p className="s-eyebrow s-article-cat">{post.category}</p>
            <h1 className="s-h1 s-article-title">{post.title}</h1>
            {post.excerpt && <p className="s-lead">{post.excerpt}</p>}
            <div className="s-article-meta">
              <span>DANAVA Solutions</span>
              {post.date && <span><CalendarDays aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>}
              <span><Clock aria-hidden="true" />{minutes} phút đọc</span>
            </div>
          </div>
        </header>

        {cover && (
          <div className="s-container s-article-cover-wrap">
            <figure className="s-frame s-frame--plain s-article-cover">
              <img src={cover} alt={post.title} />
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
              <div className="s-article-toc__desktop">
                <p className="s-article-toc__title">Mục lục nội dung</p>
                <TocList toc={toc} />
              </div>
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

            <footer className="s-article-foot">
              {source && (
                <a className="s-link" href={source} target="_blank" rel="noopener noreferrer">
                  Xem bài gốc trên kênh DANAVA <ArrowUpRight aria-hidden="true" />
                </a>
              )}
              <Link className="s-link" href="/kien-thuc/"><ArrowLeft aria-hidden="true" />Tất cả bài viết</Link>
            </footer>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="s-section s-section--soft" aria-labelledby="s-article-related">
          <div className="s-container">
            <div className="s-mb"><h2 className="s-h2" id="s-article-related">Bài viết liên quan</h2></div>
            <div className="s-grid s-grid--3">{related.map(p => <PostCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      )}

      <CtaBand />
    </main>
  );
}

export default ArticleView;
