import type { ReactNode } from 'react';
/**
 * Khối nội dung dùng chung cho trang dịch vụ, dịch vụ con, dự án và bài viết.
 * Server component: nội dung có sẵn trong HTML phản hồi; FAQ dùng <details> nên mở/đóng được bằng bàn phím, không cần JS.
 */
import Link from 'next/link';
import { cmsText, ct } from './cms';

/** Chữ cố định của khối dùng chung (khóa shared.*), đọc bản sửa từ kho chữ của yêu cầu (lib/request-texts.ts). */
/** Nguồn bản ghi của danh sách trong khối dùng chung (vd. rec.services.<id>) → mỗi mục sửa thẳng vào hồ sơ. */
export type RecSrc = { base: string; label: string };
const R = (rec: RecSrc | undefined, sub: string, what: string, multiline = false) =>
  rec ? cmsText(`${rec.base}.${sub}`, what, { multiline, scope: 'record', scopeLabel: rec.label }) : {};

/** Tiêu đề khối dùng chung truyền vào dạng chữ → sửa được (khóa shared.<khối>.k<mã chữ>, mỗi câu chữ một khóa). */
function TT({ v, k }: { v: ReactNode; k: string }) {
  if (typeof v !== 'string') return <>{v}</>;
  let h = 0; for (const ch of v) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const x = ct(null, `shared.${k}.k${h.toString(36)}`, v, 'Tiêu đề khối', { scope: 'global' });
  return <span {...x.a}>{x.v}</span>;
}

function S({ k, def, label }: { k: string; def: string; label: string }) {
  const x = ct(null, `shared.${k}`, def, label, { scope: 'global' });
  return <span {...x.a}>{x.v}</span>;
}
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

export function ProblemsSection({ title, problems, lead, rec }: { title: ReactNode; problems: string[]; lead?: string; rec?: RecSrc }) {
  if (!problems.length) return null;
  return (
    <section className="s-section" aria-labelledby="svc-problems">
      <div className="s-container s-split s-split--top">
        <div className="s-heading">
          <p className="s-eyebrow"><S k="problems.eyebrow" def="Vấn đề thường gặp" label="Nhãn nhỏ" /></p>
          <h2 className="s-h2" id="svc-problems"><TT v={title} k="problems.title" /></h2>
          {lead && <p className="s-lead">{lead}</p>}
        </div>
        <ul className="u-problems">
          {problems.map((p, i) => (
            <li key={p}><AlertCircle aria-hidden="true" /><span {...R(rec, `problems.${i}`, 'Vấn đề thường gặp', true)}>{p}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ScopeSection({ eyebrow = 'Giải pháp DANAVA', title, items, rec }: { eyebrow?: ReactNode; title: ReactNode; items: string[]; rec?: RecSrc }) {
  if (!items.length) return null;
  return (
    <section className="s-section s-section--brand" aria-labelledby="svc-includes">
      <div className="s-container">
        <div className="s-svc-includes">
          <div>
            <p className="s-eyebrow">{eyebrow}</p>
            <h2 className="s-h3" id="svc-includes"><TT v={title} k="scope.title" /></h2>
          </div>
          <CheckList items={rec ? items.map((it, i) => <span key={i} {...R(rec, `items.${i}`, 'Hạng mục')}>{it}</span>) : items} />
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({ id, eyebrow, title, lead, features, soft, rec }: { id: string; eyebrow: ReactNode; title: ReactNode; lead?: ReactNode; features: Feature[]; soft?: boolean; rec?: RecSrc }) {
  if (!features.length) return null;
  return (
    <section id={id} className={`s-section${soft ? ' s-section--soft' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="s-container">
        <SectionHeading eyebrow={eyebrow} title={<span id={`${id}-title`}><TT v={title} k="features.title" /></span>} lead={lead} />
        <div className={`s-grid s-tiles ${features.length % 3 === 0 ? 's-grid--3' : 's-grid--2'}`}>
          {features.map((f, i) => (
            <div key={f.title} className="s-card s-card--pad s-svc-feature">
              <span className="s-svc-feature__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="s-h4" {...R(rec, `features.${i}.title`, 'Tên tính năng')}>{f.title}</h3>
              <p className="s-text" {...R(rec, `features.${i}.text`, 'Mô tả tính năng', true)}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection({ steps, title = 'Rõ ràng ở mỗi bước', rec }: { steps: Feature[]; title?: ReactNode; rec?: RecSrc }) {
  if (!steps.length) return null;
  return (
    <section className="s-section" aria-labelledby="svc-process">
      <div className="s-container">
        <SectionHeading eyebrow={<S k="process.eyebrow" def="Quy trình triển khai" label="Nhãn nhỏ" />} title={<span id="svc-process"><TT v={title} k="process.title" /></span>} center />
        <ol className="s-home-steps s-tiles">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="s-home-steps__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="s-h4" {...R(rec, `process.${i}.title`, 'Tên bước')}>{s.title}</h3>
              <p className="s-text" {...R(rec, `process.${i}.text`, 'Mô tả bước', true)}>{s.text}</p>
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
            <p className="s-eyebrow"><S k="pricing.eyebrow" def="Chi phí" label="Nhãn nhỏ" /></p>
            <h2 className="s-h3" id="svc-pricing"><S k="pricing.title" def="Cách xác định báo giá" label="Tiêu đề" /></h2>
            <p className="s-text">{pricing}</p>
          </div>
          <div className="u-pricing__actions">
            {productUrl && (
              <a className="s-btn s-btn--secondary" href={productUrl} target="_blank" rel="noopener">
                {productLabel || <S k="pricing.product" def="Trang sản phẩm" label="Chữ nút" />} <ArrowUpRight aria-hidden="true" />
              </a>
            )}
            <Link className="s-btn s-btn--primary" href={contactHref}><S k="pricing.cta" def="Nhận báo giá" label="Chữ nút" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ faqs, contactHref, withSchema = true, rec }: { faqs: Faq[]; contactHref: string; withSchema?: boolean; rec?: RecSrc }) {
  if (!faqs.length) return null;
  return (
    <section className="s-section" aria-labelledby="svc-faq">
      {withSchema && <JsonLd value={faqLD(faqs)} />}
      <div className="s-container s-split s-split--top">
        <div className="s-heading">
          <p className="s-eyebrow"><S k="faq.eyebrow" def="Câu hỏi thường gặp" label="Nhãn nhỏ" /></p>
          <h2 className="s-h2" id="svc-faq"><S k="faq.title" def="Bạn hỏi, DANAVA trả lời" label="Tiêu đề" /></h2>
          <p className="s-lead"><S k="faq.lead" def="Chưa thấy câu hỏi của bạn?" label="Câu dẫn" /> <Link className="s-textlink" href={contactHref}><S k="faq.link" def="Gửi câu hỏi cho chúng tôi" label="Chữ liên kết" /></Link>.</p>
        </div>
        <div className="s-faq">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary><span {...R(rec, `faqs.${i}.q`, 'Câu hỏi')}>{f.q}</span><ChevronDown aria-hidden="true" /></summary>
              <div {...R(rec, `faqs.${i}.a`, 'Câu trả lời', true)}>{f.a}</div>
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
        {p.industry && <span className="s-badge s-badge--dark" {...cmsText(`rec.projects.${p.id}.industry`, 'Ngành (hồ sơ dự án)', { scope: 'record', scopeLabel: 'Hồ sơ dự án' })}>{p.industry}</span>}
      </div>
      <div className="s-card__body">
        <p className="s-card__tag" {...cmsText(`rec.projects.${p.id}.client`, 'Khách hàng (hồ sơ dự án)', { scope: 'record', scopeLabel: 'Hồ sơ dự án' })}>{p.client}</p>
        <h3 className="s-card__title"><Link className="s-card__cover" href={projectHref(p)}><span {...cmsText(`rec.projects.${p.id}.title`, 'Tên dự án', { scope: 'record', scopeLabel: 'Hồ sơ dự án' })}>{p.title}</span></Link></h3>
        <p className="s-card__text">{excerpt(p.summary, 160)}</p>
        <div className="s-card__foot">
          <span className="s-link"><S k="project.more" def="Xem case study" label="Chữ liên kết" /></span>
          <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}

export function RelatedProjects({ projects, title = 'Dự án liên quan', id = 'rel-projects' }: { projects: Project[]; title?: ReactNode; id?: string }) {
  if (!projects.length) return null;
  return (
    <section className="s-section s-section--soft" aria-labelledby={id}>
      <div className="s-container">
        <SectionHeading eyebrow={<S k="related-projects.eyebrow" def="Dự án thực tế" label="Nhãn nhỏ" />} title={<span id={id}><TT v={title} k="related-projects.title" /></span>} action={<Link className="s-link" href="/du-an/"><S k="related-projects.more" def="Tất cả dự án" label="Chữ liên kết" /> <ArrowRight aria-hidden="true" /></Link>} />
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
          <span className="s-news-cat" {...(topic ? cmsText(`rec.topics.${topic.id}.name`, 'Tên danh mục', { scope: 'record', scopeLabel: 'Danh mục bài viết' }) : {})}>{topic?.name || post.category}</span>
          {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        </div>
        <h3 className="s-card__title post-tile__title"><Link className="s-card__cover" href={postHref(post)}><span {...cmsText(`rec.posts.${post.id}.title`, 'Tiêu đề bài viết', { scope: 'record', scopeLabel: 'Bài viết này' })}>{sentenceCase(post.title)}</span></Link></h3>
        <p className="s-card__text" {...(post.excerpt && post.excerpt.length <= 150 ? cmsText(`rec.posts.${post.id}.excerpt`, 'Tóm tắt bài viết', { multiline: true, scope: 'record', scopeLabel: 'Bài viết này' }) : {})}>{excerpt(post.excerpt || post.body, 150)}</p>
      </div>
    </article>
  );
}

export function RelatedPosts({ posts, data, title = 'Bài viết liên quan', id = 'rel-posts', soft }: { posts: Post[]; data: SiteData; title?: ReactNode; id?: string; soft?: boolean }) {
  if (!posts.length) return null;
  return (
    <section className={`s-section${soft ? ' s-section--soft' : ' s-section--line'}`} aria-labelledby={id}>
      <div className="s-container">
        <SectionHeading eyebrow={<S k="related-posts.eyebrow" def="Blogs" label="Nhãn nhỏ" />} title={<span id={id}><TT v={title} k="related-posts.title" /></span>} action={<Link className="s-link" href="/blogs/"><S k="related-posts.more" def="Xem tất cả Blogs" label="Chữ liên kết" /> <ArrowRight aria-hidden="true" /></Link>} />
        <div className={`s-grid s-snap ${posts.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
          {posts.map(p => <PostTile key={p.id} post={p} data={data} />)}
        </div>
      </div>
    </section>
  );
}

export function ServiceLinks({ services, title = 'Giải pháp liên quan', id = 'rel-services', hrefOf = serviceHref }: { services: Service[]; title?: ReactNode; id?: string; hrefOf?: (s: Service) => string }) {
  if (!services.length) return null;
  return (
    <section className="s-section s-section--line" aria-labelledby={id}>
      <div className="s-container">
        <SectionHeading eyebrow={<S k="related-services.eyebrow" def="Giải pháp" label="Nhãn nhỏ" />} title={<span id={id}><TT v={title} k="related-services.title" /></span>} />
        <div className="s-grid s-grid--3 s-tiles s-snap s-snap--sm">
          {services.map(s => {
            const m = SERVICE_META[s.id];
            return (
              <article key={s.id} className="s-card s-card--pad s-card--link s-svc-mini">
                {m && <IconTile icon={m.icon} tone={m.tone} />}
                <h3 className="s-h4"><Link className="s-card__cover" href={hrefOf(s)}><span {...cmsText(`rec.services.${s.id}.title`, 'Tên sản phẩm', { scope: 'record', scopeLabel: `Hồ sơ ${s.title}` })}>{s.title}</span></Link></h3>
                <p className="s-text s-small" {...cmsText(`rec.services.${s.id}.description`, 'Mô tả ngắn sản phẩm', { multiline: true, scope: 'record', scopeLabel: `Hồ sơ ${s.title}` })}>{s.description}</p>
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
        <SectionHeading eyebrow={<S k="testimonials.eyebrow" def="Khách hàng nói gì" label="Nhãn nhỏ" />} title={<span id="testimonials"><S k="testimonials.title" def="Nhận xét từ khách hàng" label="Tiêu đề" /></span>} />
        <div className={`s-grid ${items.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
          {items.map(t => (
            <figure key={t.id} className="s-card s-card--pad u-quote">
              <Quote aria-hidden="true" />
              <blockquote {...cmsText(`rec.testimonials.${t.id}.quote`, 'Nội dung nhận xét', { multiline: true, scope: 'record', scopeLabel: 'Hồ sơ nhận xét' })}>{t.quote}</blockquote>
              <figcaption>
                {t.image && <img src={t.image} alt="" width={48} height={48} loading="lazy" />}
                <span><strong {...cmsText(`rec.testimonials.${t.id}.name`, 'Tên người nhận xét', { scope: 'record', scopeLabel: 'Hồ sơ nhận xét' })}>{t.name}</strong>{t.role && <span {...cmsText(`rec.testimonials.${t.id}.role`, 'Chức danh', { scope: 'record', scopeLabel: 'Hồ sơ nhận xét' })}>{t.role}</span>}{t.role && t.company && ' · '}{t.company && <span {...cmsText(`rec.testimonials.${t.id}.company`, 'Đơn vị', { scope: 'record', scopeLabel: 'Hồ sơ nhận xét' })}>{t.company}</span>}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
