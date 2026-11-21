'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import type { Project } from '@/lib/content';
import { useSite } from '../SiteStore';
import { excerpt } from './catalog';
import { PageHead, CtaBand, Visual } from './ui';
import { FeaturedShowcase, ShowcaseStrip } from './showcase';
import { pageCopy } from '@/lib/blocks';
import { rich } from './rich';
import { HomeCases, type HomeCase } from './HomeCases';
import { MARKETING_ENGAGEMENTS } from '@/lib/marketing-portfolio';
import { projectHref, publicPartners } from '@/lib/site-queries';

export { getProjectTeam, findProject, projectGallery } from './project-helpers';

/* ---------- Card ---------- */
export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {p.image ? <img src={p.image} alt={p.title} loading="lazy" decoding="async" /> : <Visual icon={Users} label={p.client || p.title} />}
        {p.industry && <span className="s-badge s-badge--dark">{p.industry}</span>}
      </div>
      <div className="s-card__body">
        <p className="s-card__tag">{p.category}</p>
        <h3 className="s-card__title"><Link className="s-card__cover" href={`/du-an/${p.slug}/`}>{p.title}</Link></h3>
        <p className="s-card__text">{excerpt(p.summary, 160)}</p>
        <div className="s-card__foot">
          <span className="s-muted s-small">{p.client}</span>
          <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================================
   /du-an/
   ========================================================================== */
export function ProjectsIndex() {
  const { data } = useSite();
  const copy = pageCopy(data, 'du-an');
  const projects = useMemo(() => {
    const list = (data.projects || []).filter(p => p.published);
    return [...list.filter(p => p.featured), ...list.filter(p => !p.featured)];
  }, [data.projects]);
  // Cùng nguồn với trang chủ: case study đã xuất bản + dự án marketing đã thực hiện (lib/marketing-portfolio.ts)
  const cases: HomeCase[] = useMemo(() => [
    ...projects.map(p => ({ id: 'p-' + p.id, group: 'product' as const, client: p.client, title: p.title, text: p.summary, image: p.image || undefined, href: projectHref(p), tag: p.industry || p.category || 'Dự án' })),
    ...MARKETING_ENGAGEMENTS.map(m => ({ id: 'm-' + m.id, group: 'marketing' as const, client: m.client, title: m.title, text: m.scope.join(' · '), image: m.image?.src, logo: m.logo, href: '/giai-phap/digital-marketing/#du-an-marketing', tag: m.throughPartner ? 'Qua đối tác' : 'Marketing' }))
  ], [projects]);
  const brands = useMemo(() => {
    const names = new Set<string>();
    publicPartners(data).forEach(c => names.add(c.name.trim().toLowerCase()));
    MARKETING_ENGAGEMENTS.forEach(m => names.add(m.client.trim().toLowerCase()));
    return names.size;
  }, [data]);
  const mosaic = cases.filter(c => c.image).slice(0, 3);
  const web = (data.showcase || []).filter(x => x.published && x.serviceId === 'website');
  const webCase = web.filter(x => x.caseStudy);
  const webLead = webCase.find(x => x.featured) || webCase[0];
  const webMore = web.filter(x => x !== webLead).slice(0, 4);

  return (
    <main id="main" className="hb pj-page">
      {/* Phần đầu gọn theo giao diện trang chủ: chữ + số liệu thật bên trái, ảnh dự án thật bên phải */}
      <section className="hb-cover pj-head" aria-labelledby="proj-title">
        <div className="s-container pj-head__grid">
          <div>
            <nav className="pj-crumbs" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Dự án</span></nav>
            <p className="hb-eyebrow">{copy.kicker}</p>
            <h1 className="hb-title pj-head__title" id="proj-title">{rich(copy.title)}</h1>
            <p className="hb-lead">{copy.lead}</p>
            <dl className="pj-head__stats">
              <div><dd>{cases.length}</dd><dt>dự án đã thực hiện</dt></div>
              <div><dd>{projects.length}</dd><dt>case study chi tiết</dt></div>
              <div><dd>{brands}</dd><dt>thương hiệu đồng hành</dt></div>
            </dl>
          </div>
          {mosaic.length > 0 && (
            <div className={`pj-mosaic pj-mosaic--${mosaic.length}`} aria-hidden="true">
              {mosaic.map(m => <figure key={m.id}><img src={m.image} alt="" loading="eager" decoding="async" /><figcaption>{m.client}</figcaption></figure>)}
            </div>
          )}
        </div>
      </section>

      <section className="hb-sec pj-list" aria-labelledby="proj-list">
        <div className="s-container">
          <div className="hb-row">
            <div><p className="hb-eyebrow">Tất cả dự án</p><h2 className="hb-h2" id="proj-list">Lọc theo <em>mảng triển khai.</em></h2></div>
          </div>
          {cases.length ? <HomeCases items={cases} limit={99} /> : <p className="s-empty">Chưa có dự án được công bố.</p>}
        </div>
      </section>

      {webLead && (
        <section className="hb-sec hb-cream" aria-labelledby="proj-web">
          <div className="s-container">
            <div className="hb-row">
              <div><p className="hb-eyebrow">Thiết kế website</p><h2 className="hb-h2" id="proj-web">Case study <em>website.</em></h2></div>
            </div>
            <FeaturedShowcase item={webLead} headingLevel="h3" eyebrow="Dự án thiết kế website nổi bật" id="proj-web-featured" />
            {webMore.length > 0 && <div className="u-subblock"><ShowcaseStrip items={webMore} /></div>}
          </div>
        </section>
      )}
      <CtaBand title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}
