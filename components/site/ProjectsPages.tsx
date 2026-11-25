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
import { cmsText, ct } from './cms';
import { rich } from './rich';
import { HomeCases, type HomeCase } from './HomeCases';
import { MARKETING_ENGAGEMENTS } from '@/lib/marketing-portfolio';
import { homePartners, projectHref } from '@/lib/site-queries';

export { getProjectTeam, findProject, projectGallery } from './project-helpers';

/* ---------- Card ---------- */
const recP = (id: string, f: string, label: string, opts: { multiline?: boolean } = {}) => cmsText(`rec.projects.${id}.${f}`, label, { ...opts, scope: 'record', scopeLabel: 'Hồ sơ dự án' });

export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {p.image ? <img src={p.image} alt={p.title} loading="lazy" decoding="async" /> : <Visual icon={Users} label={p.client || p.title} />}
        {p.industry && <span className="s-badge s-badge--dark" {...recP(p.id, 'industry', 'Ngành')}>{p.industry}</span>}
      </div>
      <div className="s-card__body">
        <p className="s-card__tag" {...recP(p.id, 'category', 'Loại dự án')}>{p.category}</p>
        <h3 className="s-card__title"><Link className="s-card__cover" href={`/du-an/${p.slug}/`}><span {...recP(p.id, 'title', 'Tên dự án')}>{p.title}</span></Link></h3>
        <p className="s-card__text">{excerpt(p.summary, 160)}</p>
        <div className="s-card__foot">
          <span className="s-muted s-small" {...recP(p.id, 'client', 'Khách hàng')}>{p.client}</span>
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
    ...projects.map(p => {
      // Nhãn thẻ: ngành → loại dự án → chữ mặc định "Dự án" (sửa được ở chữ cố định)
      const dflt = ct(data, 'projects.card.tag', 'Dự án', 'Nhãn thẻ mặc định');
      const tag = p.industry ? { v: p.industry, a: recP(p.id, 'industry', 'Ngành') } : p.category ? { v: p.category, a: recP(p.id, 'category', 'Loại dự án') } : dflt;
      return {
        id: 'p-' + p.id, group: 'product' as const, client: p.client, title: p.title, text: p.summary, image: p.image || undefined, href: projectHref(p), tag: tag.v,
        cms: { client: recP(p.id, 'client', 'Khách hàng'), title: recP(p.id, 'title', 'Tên dự án'), text: recP(p.id, 'summary', 'Tóm tắt dự án', { multiline: true }), tag: tag.a }
      };
    }),
    ...MARKETING_ENGAGEMENTS.map(m => {
      const c = ct(data, `projects.mkt.${m.id}.client`, m.client, 'Khách hàng'), ti = ct(data, `projects.mkt.${m.id}.title`, m.title, 'Tên hoạt động'), tx = ct(data, `projects.mkt.${m.id}.text`, m.scope.join(' · '), 'Mô tả', { multiline: true }), tg = ct(data, `projects.mkt.${m.id}.tag`, m.throughPartner ? 'Qua đối tác' : 'Marketing', 'Nhãn');
      return { id: 'm-' + m.id, group: 'marketing' as const, client: c.v, title: ti.v, text: tx.v, image: m.image?.src, logo: m.logo, href: '/giai-phap/digital-marketing/#du-an-marketing', tag: tg.v, cms: { client: c.a, title: ti.a, text: tx.a, tag: tg.a } };
    })
  ], [projects, data]);
  // Cùng con số với trang chủ: khách hàng & đối tác đã xác minh hợp tác
  const brands = useMemo(() => homePartners(data).length, [data]);
  const mosaic = cases.filter(c => c.image).slice(0, 3);
  const web = (data.showcase || []).filter(x => x.published && x.serviceId === 'website');
  const webCase = web.filter(x => x.caseStudy);
  const webLead = webCase.find(x => x.featured) || webCase[0];
  const webMore = web.filter(x => x !== webLead).slice(0, 4);
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `projects.${k}`, def, label, opts);
  const T = {
    home: t('crumbs.home', 'Trang chủ', 'Đường dẫn'), here: t('crumbs.here', 'Dự án', 'Đường dẫn'),
    s1: t('stats.cases', 'dự án đã thực hiện', 'Nhãn số liệu'), s2: t('stats.studies', 'case study chi tiết', 'Nhãn số liệu'), s3: t('stats.brands', 'thương hiệu đồng hành', 'Nhãn số liệu'),
    lEyebrow: t('list.eyebrow', 'Tất cả dự án', 'Dòng chữ nhỏ'), lTitle: t('list.title', 'Lọc theo *mảng triển khai.*', 'Tiêu đề khối', { rich: true }),
    empty: t('list.empty', 'Chưa có dự án được công bố.', 'Thông báo trống'),
    wEyebrow: t('web.eyebrow', 'Thiết kế website', 'Dòng chữ nhỏ'), wTitle: t('web.title', 'Case study *website.*', 'Tiêu đề khối', { rich: true })
  };
  const ui = { all: t('tab.all', 'Tất cả', 'Nhãn tab'), product: t('tab.product', 'Phần mềm & Website', 'Nhãn tab'), marketing: t('tab.marketing', 'Marketing & Truyền thông', 'Nhãn tab'), more: t('card.more', 'Xem thêm', 'Chữ liên kết') };

  return (
    <main id="main" className="hb pj-page">
      {/* Phần đầu gọn theo giao diện trang chủ: chữ + số liệu thật bên trái, ảnh dự án thật bên phải */}
      <section className="hb-cover pj-head" aria-labelledby="proj-title">
        <div className="s-container pj-head__grid">
          <div>
            <nav className="pj-crumbs" aria-label="Breadcrumb"><Link href="/"><span {...T.home.a}>{T.home.v}</span></Link><span aria-hidden="true">/</span><span aria-current="page" {...T.here.a}>{T.here.v}</span></nav>
            <p className="hb-eyebrow" {...cmsText('pages.du-an.kicker', 'Dòng chữ nhỏ')}>{copy.kicker}</p>
            <h1 className="hb-title pj-head__title" id="proj-title" {...cmsText('pages.du-an.title', 'Tiêu đề trang', { rich: true })}>{rich(copy.title)}</h1>
            <p className="hb-lead" {...cmsText('pages.du-an.lead', 'Câu dẫn', { multiline: true })}>{copy.lead}</p>
            <dl className="pj-head__stats">
              <div><dd>{cases.length}</dd><dt {...T.s1.a}>{T.s1.v}</dt></div>
              <div><dd>{projects.length}</dd><dt {...T.s2.a}>{T.s2.v}</dt></div>
              <div><dd>{brands}</dd><dt {...T.s3.a}>{T.s3.v}</dt></div>
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
            <div><p className="hb-eyebrow" {...T.lEyebrow.a}>{T.lEyebrow.v}</p><h2 className="hb-h2" id="proj-list" {...T.lTitle.a}>{rich(T.lTitle.v)}</h2></div>
          </div>
          {cases.length ? <HomeCases items={cases} limit={99} ui={ui} /> : <p className="s-empty" {...T.empty.a}>{T.empty.v}</p>}
        </div>
      </section>

      {webLead && (
        <section className="hb-sec hb-cream" aria-labelledby="proj-web">
          <div className="s-container">
            <div className="hb-row">
              <div><p className="hb-eyebrow" {...T.wEyebrow.a}>{T.wEyebrow.v}</p><h2 className="hb-h2" id="proj-web" {...T.wTitle.a}>{rich(T.wTitle.v)}</h2></div>
            </div>
            <FeaturedShowcase data={data} item={webLead} headingLevel="h3" eyebrow="Dự án thiết kế website nổi bật" id="proj-web-featured" />
            {webMore.length > 0 && <div className="u-subblock"><ShowcaseStrip items={webMore} /></div>}
          </div>
        </section>
      )}
      <CtaBand data={data} cms={{ title: 'pages.du-an.ctaTitle', lead: copy.ctaLead ? 'pages.du-an.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}
