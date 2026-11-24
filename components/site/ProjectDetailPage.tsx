/**
 * /du-an/[slug]/ — case study (server component).
 * Tên dự án, khách hàng, ngành → bối cảnh & nhu cầu → phạm vi DANAVA thực hiện → giải pháp → hình ảnh thực tế →
 * kết quả (chỉ điều đã bàn giao/đã xác nhận) → nhận xét được phép công bố → dịch vụ liên quan → CTA.
 */
import Link from 'next/link';
import { cmsText, ct } from './cms';
import { rich } from './rich';
import { ArrowUpRight, Target, Lightbulb, PackageCheck, ListChecks } from 'lucide-react';
import type { Project, SiteData } from '@/lib/content';
import { publicTestimonials, publishedProjects, servicesForProject } from '@/lib/site-queries';
import { Crumbs, CtaBand, SectionHeading, CheckList } from './ui';
import { RelatedProjects, ServiceLinks, Testimonials } from './blocks';
import { getProjectTeam, projectGallery } from './project-helpers';
import { StaffAvatar } from './TeamPage';
import { contactHrefFor } from './ServiceDetailPage';
import { DraftBanner } from './SubServicePage';
import { formatDate } from './catalog';

export function ProjectDetailPage({ project: p, data, preview }: { project: Project; data: SiteData; preview?: boolean }) {
  const services = servicesForProject(data, p);
  const team = getProjectTeam(p.id, data.staff);
  const gallery = projectGallery(p);
  const testimonials = publicTestimonials(data, p.id);
  const others = publishedProjects(data).filter(x => x.id !== p.id).slice(0, 3);
  const contactHref = services[0] ? contactHrefFor(services[0]) : '/lien-he/';
  const cta = services[0]?.id === 'studio' ? 'Đăng ký demo' : 'Nhận tư vấn';

  const story = [
    { id: 'boi-canh', icon: Target, label: 'Bối cảnh & nhu cầu', text: p.challenge },
    { id: 'giai-phap', icon: Lightbulb, label: 'Giải pháp triển khai', text: p.solution },
    { id: 'ket-qua', icon: PackageCheck, label: 'Kết quả bàn giao', text: p.result }
  ].filter(s => s.text?.trim());
  const storyField = { 'boi-canh': 'challenge', 'giai-phap': 'solution', 'ket-qua': 'result' } as const;

  // Chữ dùng chung cho mọi trang dự án (txt.project.*) và trường của hồ sơ dự án (rec.projects.<id>.*)
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `project.${k}`, def, label, opts);
  const R = (f: string, label: string, opts: { multiline?: boolean } = {}) => cmsText(`rec.projects.${p.id}.${f}`, label, { ...opts, scope: 'record', scopeLabel: 'Hồ sơ dự án' });
  const T = {
    fClient: t('facts.client', 'Khách hàng', 'Nhãn'), fIndustry: t('facts.industry', 'Ngành', 'Nhãn'), fServices: t('facts.services', 'Giải pháp', 'Nhãn'), fUpdated: t('facts.updated', 'Cập nhật', 'Nhãn'),
    scopeEyebrow: t('scope.eyebrow', 'Phạm vi DANAVA thực hiện', 'Dòng chữ nhỏ'), scopeTitle: t('scope.title', 'Những hạng mục đã triển khai cho', 'Tiêu đề khối'), scopeNone: t('scope.client', 'khách hàng', 'Chữ thay tên khách hàng'),
    gEyebrow: t('gallery.eyebrow', 'Hình ảnh', 'Dòng chữ nhỏ'), gTitle: t('gallery.title', 'Triển khai thực tế', 'Tiêu đề khối'),
    tEyebrow: t('team.eyebrow', 'Đội ngũ', 'Dòng chữ nhỏ'), tTitle: t('team.title', 'Những người thực hiện', 'Tiêu đề khối'),
    src: t('source.text', 'Thông tin dự án được đối chiếu từ nguồn công khai của DANAVA.', 'Ghi chú nguồn', { multiline: true }), srcLink: t('source.link', 'Xem nguồn', 'Chữ liên kết'),
    ctaTitle: t('cta.title', 'Muốn triển khai tương tự cho doanh nghiệp của bạn?', 'Dải cuối trang: tiêu đề', { rich: true }),
    ctaLead: t('cta.lead', 'Chia sẻ mô hình và nhu cầu hiện tại, DANAVA đề xuất phạm vi phù hợp.', 'Dải cuối trang: câu dẫn', { multiline: true })
  };
  const story_ = (id: string, label: string) => t(`story.${id}.label`, label, 'Tiêu đề mục');
  /** Chú thích ảnh: ảnh đại diện dùng tên khách hàng/dự án; ảnh thư viện theo vị trí gốc; ảnh minh hoạ Studio là chữ cố định. */
  const captionAttrs = (g: { src: string; caption: string }, i: number) => {
    const at = (p.gallery || []).findIndex(x => x.src === g.src);
    if (i === 0 && p.image && g.src === p.image) return p.client ? R('client', 'Khách hàng') : R('title', 'Tên dự án');
    if (at >= 0) return R(`gallery.${at}.caption`, 'Chú thích ảnh');
    return null;
  };

  return (
    <main id="main">
      {preview && <DraftBanner />}
      <header className="s-proj-hero">
        <div className="s-container">
          <div className="s-proj-hero__head">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/du-an/', label: 'Dự án' }, { label: p.client || p.title }]} />
            <div className="s-row">
              {p.category && <span className="s-badge" {...R('category', 'Loại dự án')}>{p.category}</span>}
              {p.industry && <span className="s-badge s-badge--neutral" {...R('industry', 'Ngành')}>{p.industry}</span>}
            </div>
            <h1 className="s-h1" {...cmsText(`rec.projects.${p.id}.title`, 'Tên dự án', { scope: 'record', scopeLabel: 'Hồ sơ dự án' })}>{p.title}</h1>
            {p.summary && <p className="s-lead" {...cmsText(`rec.projects.${p.id}.summary`, 'Tóm tắt dự án', { multiline: true, scope: 'record', scopeLabel: 'Hồ sơ dự án' })}>{p.summary}</p>}
            <dl className="s-proj-facts">
              {p.client && <div><dt {...T.fClient.a}>{T.fClient.v}</dt><dd {...R('client', 'Khách hàng')}>{p.client}</dd></div>}
              {p.industry && <div><dt {...T.fIndustry.a}>{T.fIndustry.v}</dt><dd {...R('industry', 'Ngành')}>{p.industry}</dd></div>}
              {services.length > 0 && <div><dt {...T.fServices.a}>{T.fServices.v}</dt><dd>{services.map((s, i) => <span key={s.id}>{i > 0 && ', '}<Link href={`/giai-phap/${s.slug}/`}><span {...cmsText(`rec.services.${s.id}.title`, 'Tên giải pháp', { scope: 'record', scopeLabel: 'Hồ sơ giải pháp' })}>{s.title}</span></Link></span>)}</dd></div>}
              {p.updated && <div><dt {...T.fUpdated.a}>{T.fUpdated.v}</dt><dd><time dateTime={p.updated}>{formatDate(p.updated)}</time></dd></div>}
            </dl>
          </div>
          {p.image && (
            <div className="s-frame s-proj-hero__img">
              <img src={p.image} alt={p.title} fetchPriority="high" width={1200} height={750} />
            </div>
          )}
        </div>
      </header>

      {!!p.scope?.length && (
        <section className="s-section s-section--brand" aria-labelledby="proj-scope">
          <div className="s-container">
            <div className="s-svc-includes">
              <div>
                <p className="s-eyebrow"><ListChecks aria-hidden="true" style={{ width: 16, height: 16, verticalAlign: '-3px', marginRight: 6 }} /><span {...T.scopeEyebrow.a}>{T.scopeEyebrow.v}</span></p>
                <h2 className="s-h3" id="proj-scope"><span {...T.scopeTitle.a}>{T.scopeTitle.v}</span> {p.client ? <span {...R('client', 'Khách hàng')}>{p.client}</span> : <span {...T.scopeNone.a}>{T.scopeNone.v}</span>}</h2>
              </div>
              <CheckList items={p.scope.map((it, i) => <span key={i} {...R(`scope.${i}`, 'Hạng mục')}>{it}</span>)} />
            </div>
          </div>
        </section>
      )}

      {story.length > 0 && (
        <section className="s-section" aria-label="Câu chuyện dự án">
          <div className="s-container s-container--narrow s-proj-story">
            {story.map(s => (
              <div key={s.id} id={s.id} className="s-proj-story__row">
                <div className="s-proj-story__label"><span className="s-icon"><s.icon aria-hidden="true" /></span>{(() => { const x = story_(s.id, s.label); return <h2 className="s-h3" {...x.a}>{x.v}</h2>; })()}</div>
                <div className="s-prose" {...R(storyField[s.id as keyof typeof storyField], s.label, { multiline: true })}>{s.text.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 1 && (
        <section className="s-section s-section--soft" aria-labelledby="proj-gallery">
          <div className="s-container">
            <SectionHeading eyebrow={<span {...T.gEyebrow.a}>{T.gEyebrow.v}</span>} title={<span id="proj-gallery" {...T.gTitle.a}>{T.gTitle.v}</span>} />
            <div className="s-grid s-grid--2 s-snap">
              {gallery.map((g, i) => {
                const attrs = captionAttrs(g, i);
                const fixed = attrs ? null : t(`gallery.studio.${p.id}`, g.caption, 'Chú thích ảnh');
                return (
                  <figure key={g.src} className="s-proj-figure">
                    <div className="s-frame s-frame--plain s-frame--16x10"><img src={g.src} alt={fixed ? fixed.v : g.caption} loading="lazy" decoding="async" /></div>
                    <figcaption className="s-small s-muted" {...(attrs || fixed!.a)}>{fixed ? fixed.v : g.caption}</figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Testimonials items={testimonials} />

      {team.length > 0 && (
        <section className="s-section" aria-labelledby="proj-team">
          <div className="s-container">
            <SectionHeading eyebrow={<span {...T.tEyebrow.a}>{T.tEyebrow.v}</span>} title={<span id="proj-team" {...T.tTitle.a}>{T.tTitle.v}</span>} />
            <div className="s-grid s-grid--4 s-snap s-snap--sm">
              {team.map(m => (
                <Link key={m.id} href={`/doi-ngu/${m.id}/`} className="s-card s-card--pad s-card--link s-proj-member">
                  <StaffAvatar person={m} />
                  <strong className="s-h4" {...cmsText(`rec.staff.${m.id}.name`, 'Tên nhân sự', { scope: 'record', scopeLabel: 'Hồ sơ nhân sự' })}>{m.name}</strong>
                  {(() => { const x = t(`team.${p.id}.${m.id}`, m.projectRole, 'Vai trò trong dự án'); return <span className="s-small s-muted" {...x.a}>{x.v}</span>; })()}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {p.source && (
        <section className="s-section s-section--tight s-section--line" aria-label="Nguồn">
          <div className="s-container s-row s-row--between">
            <p className="s-text" {...T.src.a}>{T.src.v}</p>
            <a className="s-link" href={p.source} target="_blank" rel="noopener"><span {...T.srcLink.a}>{T.srcLink.v}</span> <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </section>
      )}

      <ServiceLinks services={services} title="Dịch vụ đã sử dụng trong dự án" />
      <RelatedProjects projects={others} title="Xem thêm câu chuyện" id="proj-others" />

      <CtaBand
        cms={{ title: 'txt.project.cta.title', lead: 'txt.project.cta.lead', titleDefault: T.ctaTitle.a['data-cms-default'], leadDefault: T.ctaLead.a['data-cms-default'] }}
        title={rich(T.ctaTitle.v)}
        lead={T.ctaLead.v}
        primary={{ href: contactHref, label: cta }}
      />
    </main>
  );
}
