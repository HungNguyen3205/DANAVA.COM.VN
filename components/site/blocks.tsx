/**
 * Khối nội dung dùng chung cho trang dịch vụ, dịch vụ con, dự án và bài viết.
 * Server component: nội dung có sẵn trong HTML phản hồi; FAQ dùng <details> nên mở/đóng được bằng bàn phím, không cần JS.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown, AlertCircle, Receipt, Quote } from 'lucide-react';
import type { Faq, Feature, Post, Project, Service, SiteData, Testimonial } from '@/lib/content';
import { jsonLD } from '@/lib/seo';
import { postHref, projectHref, serviceHref, topicOf } from '@/lib/site-queries';
import { postPhotos } from '@/lib/media';
import { SectionHeading, CheckList } from './ui';
import { excerpt, formatDate, SERVICE_META } from './catalog';
import { IconTile } from './ui';
import { sentenceCase } from '@/lib/sentence-case';

export function JsonLd({ value }: { value: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(value) }} />;
}

export function faqLD(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };
}

export function ProblemsSection({ title, problems, lead }: { title: string; problems: string[]; lead?: string }) {
  if (!problems.length) return null;
  return (
    <section className="s-section" aria-labelledby="svc-problems">
      <div className="s-container s-split s-split--top">
        <div className="s-heading">
          <p className="s-eyebrow">Vấn đề thường gặp</p>
          <h2 className="s-h2" id="svc-problems">{title}</h2>
          {lead && <p className="s-lead">{lead}</p>}
        </div>
        <ul className="u-problems">
          {problems.map(p => (
            <li key={p}><AlertCircle aria-hidden="true" /><span>{p}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ScopeSection({ eyebrow = 'Giải pháp DANAVA', title, items }: { eyebrow?: string; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="s-section s-section--brand" aria-labelledby="svc-includes">
      <div className="s-container">
        <div className="s-svc-includes">
          <div>
            <p className="s-eyebrow">{eyebrow}</p>
            <h2 className="s-h3" id="svc-includes">{title}</h2>
          </div>
          <CheckList items={items} />
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({ id, eyebrow, title, lead, features, soft }: { id: string; eyebrow: string; title: string; lead?: string; features: Feature[]; soft?: boolean }) {
  if (!features.length) return null;
  return (
    <section id={id} className={`s-section${soft ? ' s-section--soft' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="s-container">
        <SectionHeading eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} lead={lead} />
        <div className={`s-grid s-tiles ${features.length % 3 === 0 ? 's-grid--3' : 's-grid--2'}`}>
          {features.map((f, i) => (
            <div key={f.title} className="s-card s-card--pad s-svc-feature">
              <span className="s-svc-feature__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="s-h4">{f.title}</h3>
              <p className="s-text">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection({ steps, title = 'Rõ ràng ở mỗi bước' }: { steps: Feature[]; title?: string }) {
  if (!steps.length) return null;
  return (
    <section className="s-section" aria-labelledby="svc-process">
      <div className="s-container">
        <SectionHeading eyebrow="Quy trình triển khai" title={<span id="svc-process">{title}</span>} center />
        <ol className="s-home-steps s-tiles">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="s-home-steps__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="s-h4">{s.title}</h3>
              <p className="s-text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PricingSection({ pricing, productUrl, productLabel, contactHref }: { pricing: string; productUrl?: string; productLabel?: string; contactHref: string }) {
  if (!pricing.trim()) return null;
  return (
    <section className="s-section s-section--tight" aria-labelledby="svc-pricing">
      <div className="s-container">
        <div className="u-pricing">
          <span className="s-icon s-icon--orange" aria-hidden="true"><Receipt /></span>
          <div>
            <p className="s-eyebrow">Chi phí</p>
            <h2 className="s-h3" id="svc-pricing">Cách xác định báo giá</h2>
            <p className="s-text">{pricing}</p>
          </div>
          <div className="u-pricing__actions">
            {productUrl && (
              <a className="s-btn s-btn--secondary" href={productUrl} target="_blank" rel="noopener">
                {productLabel || 'Trang sản phẩm'} <ArrowUpRight aria-hidden="true" />
              </a>
            )}
            <Link className="s-btn s-btn--primary" href={contactHref}>Nhận báo giá</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ faqs, contactHref, withSchema = true }: { faqs: Faq[]; contactHref: string; withSchema?: boolean }) {
  if (!faqs.length) return null;
  return (
    <section className="s-section" aria-labelledby="svc-faq">
      {withSchema && <JsonLd value={faqLD(faqs)} />}
      <div className="s-container s-split s-split--top">
        <div className="s-heading">
          <p className="s-eyebrow">Câu hỏi thường gặp</p>
          <h2 className="s-h2" id="svc-faq">Bạn hỏi, DANAVA trả lời</h2>
          <p className="s-lead">Chưa thấy câu hỏi của bạn? <Link className="s-textlink" href={contactHref}>Gửi câu hỏi cho chúng tôi</Link>.</p>
        </div>
        <div className="s-faq">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}<ChevronDown aria-hidden="true" /></summary>
              <div>{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectTile({ p }: { p: Project }) {
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {p.image ? <img src={p.image} alt={p.title} loading="lazy" decoding="async" width={1200} height={750} /> : null}
        {p.industry && <span className="s-badge s-badge--dark">{p.industry}</span>}
      </div>
      <div className="s-card__body">
        <p className="s-card__tag">{p.client}</p>
        <h3 className="s-card__title"><Link className="s-card__cover" href={projectHref(p)}>{p.title}</Link></h3>
        <p className="s-card__text">{excerpt(p.summary, 160)}</p>
        <div className="s-card__foot">
          <span className="s-link">Xem case study</span>
          <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}

export function RelatedProjects({ projects, title = 'Dự án liên quan', id = 'rel-projects' }: { projects: Project[]; title?: string; id?: string }) {
  if (!projects.length) return null;
  return (
    <section className="s-section s-section--soft" aria-labelledby={id}>
      <div className="s-container">
        <SectionHeading eyebrow="Dự án thực tế" title={<span id={id}>{title}</span>} action={<Link className="s-link" href="/du-an/">Tất cả dự án <ArrowRight aria-hidden="true" /></Link>} />
        <div className={`s-grid s-snap ${projects.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
          {projects.map(p => <ProjectTile key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}

export const postCover = (p: Post) => p.image || postPhotos[p.id] || '';

export function PostTile({ post, data }: { post: Post; data: SiteData }) {
  const topic = topicOf(data, post);
  const cover = postCover(post);
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {cover ? <img src={cover} alt="" loading="lazy" decoding="async" /> : null}
      </div>
      <div className="s-card__body">
        <div className="s-card__meta">
          <span className="s-news-cat">{topic?.name || post.category}</span>
          {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        </div>
        <h3 className="s-card__title post-tile__title"><Link className="s-card__cover" href={postHref(post)}>{sentenceCase(post.title)}</Link></h3>
        <p className="s-card__text">{excerpt(post.excerpt || post.body, 150)}</p>
      </div>
    </article>
  );
}

export function RelatedPosts({ posts, data, title = 'Bài viết liên quan', id = 'rel-posts', soft }: { posts: Post[]; data: SiteData; title?: string; id?: string; soft?: boolean }) {
  if (!posts.length) return null;
  return (
    <section className={`s-section${soft ? ' s-section--soft' : ' s-section--line'}`} aria-labelledby={id}>
      <div className="s-container">
        <SectionHeading eyebrow="Blogs" title={<span id={id}>{title}</span>} action={<Link className="s-link" href="/blogs/">Xem tất cả Blogs <ArrowRight aria-hidden="true" /></Link>} />
        <div className={`s-grid s-snap ${posts.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
          {posts.map(p => <PostTile key={p.id} post={p} data={data} />)}
        </div>
      </div>
    </section>
  );
}

export function ServiceLinks({ services, title = 'Giải pháp liên quan', id = 'rel-services' }: { services: Service[]; title?: string; id?: string }) {
  if (!services.length) return null;
  return (
    <section className="s-section s-section--line" aria-labelledby={id}>
      <div className="s-container">
        <SectionHeading eyebrow="Giải pháp" title={<span id={id}>{title}</span>} />
        <div className="s-grid s-grid--3 s-tiles s-snap s-snap--sm">
          {services.map(s => {
            const m = SERVICE_META[s.id];
            return (
              <article key={s.id} className="s-card s-card--pad s-card--link s-svc-mini">
                {m && <IconTile icon={m.icon} tone={m.tone} />}
                <h3 className="s-h4"><Link className="s-card__cover" href={serviceHref(s)}>{s.title}</Link></h3>
                <p className="s-text s-small">{s.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="s-section s-section--soft" aria-labelledby="testimonials">
      <div className="s-container">
        <SectionHeading eyebrow="Khách hàng nói gì" title={<span id="testimonials">Nhận xét từ khách hàng</span>} />
        <div className={`s-grid ${items.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
          {items.map(t => (
            <figure key={t.id} className="s-card s-card--pad u-quote">
              <Quote aria-hidden="true" />
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                {t.image && <img src={t.image} alt="" width={48} height={48} loading="lazy" />}
                <span><strong>{t.name}</strong>{[t.role, t.company].filter(Boolean).join(' · ')}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
