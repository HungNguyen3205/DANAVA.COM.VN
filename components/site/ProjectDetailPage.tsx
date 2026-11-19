/**
 * /du-an/[slug]/ — case study (server component).
 * Tên dự án, khách hàng, ngành → bối cảnh & nhu cầu → phạm vi DANAVA thực hiện → giải pháp → hình ảnh thực tế →
 * kết quả (chỉ điều đã bàn giao/đã xác nhận) → nhận xét được phép công bố → dịch vụ liên quan → CTA.
 */
import Link from 'next/link';
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

  return (
    <main id="main">
      {preview && <DraftBanner />}
      <header className="s-proj-hero">
        <div className="s-container">
          <div className="s-proj-hero__head">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/du-an/', label: 'Dự án' }, { label: p.client || p.title }]} />
            <div className="s-row">
              {p.category && <span className="s-badge">{p.category}</span>}
              {p.industry && <span className="s-badge s-badge--neutral">{p.industry}</span>}
            </div>
            <h1 className="s-h1">{p.title}</h1>
            {p.summary && <p className="s-lead">{p.summary}</p>}
            <dl className="s-proj-facts">
              {p.client && <div><dt>Khách hàng</dt><dd>{p.client}</dd></div>}
              {p.industry && <div><dt>Ngành</dt><dd>{p.industry}</dd></div>}
              {services.length > 0 && <div><dt>Giải pháp</dt><dd>{services.map((s, i) => <span key={s.id}>{i > 0 && ', '}<Link href={`/giai-phap/${s.slug}/`}>{s.title}</Link></span>)}</dd></div>}
              {p.updated && <div><dt>Cập nhật</dt><dd><time dateTime={p.updated}>{formatDate(p.updated)}</time></dd></div>}
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
                <p className="s-eyebrow"><ListChecks aria-hidden="true" style={{ width: 16, height: 16, verticalAlign: '-3px', marginRight: 6 }} />Phạm vi DANAVA thực hiện</p>
                <h2 className="s-h3" id="proj-scope">Những hạng mục đã triển khai cho {p.client || 'khách hàng'}</h2>
              </div>
              <CheckList items={p.scope} />
            </div>
          </div>
        </section>
      )}

      {story.length > 0 && (
        <section className="s-section" aria-label="Câu chuyện dự án">
          <div className="s-container s-container--narrow s-proj-story">
            {story.map(s => (
              <div key={s.id} id={s.id} className="s-proj-story__row">
                <div className="s-proj-story__label"><span className="s-icon"><s.icon aria-hidden="true" /></span><h2 className="s-h3">{s.label}</h2></div>
                <div className="s-prose">{s.text.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 1 && (
        <section className="s-section s-section--soft" aria-labelledby="proj-gallery">
          <div className="s-container">
            <SectionHeading eyebrow="Hình ảnh" title={<span id="proj-gallery">Triển khai thực tế</span>} />
            <div className="s-grid s-grid--2 s-snap">
              {gallery.map(g => (
                <figure key={g.src} className="s-proj-figure">
                  <div className="s-frame s-frame--plain s-frame--16x10"><img src={g.src} alt={g.caption} loading="lazy" decoding="async" /></div>
                  <figcaption className="s-small s-muted">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials items={testimonials} />

      {team.length > 0 && (
        <section className="s-section" aria-labelledby="proj-team">
          <div className="s-container">
            <SectionHeading eyebrow="Đội ngũ" title={<span id="proj-team">Những người thực hiện</span>} />
            <div className="s-grid s-grid--4 s-snap s-snap--sm">
              {team.map(m => (
                <Link key={m.id} href={`/doi-ngu/${m.id}/`} className="s-card s-card--pad s-card--link s-proj-member">
                  <StaffAvatar person={m} />
                  <strong className="s-h4">{m.name}</strong>
                  <span className="s-small s-muted">{m.projectRole}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {p.source && (
        <section className="s-section s-section--tight s-section--line" aria-label="Nguồn">
          <div className="s-container s-row s-row--between">
            <p className="s-text">Thông tin dự án được đối chiếu từ nguồn công khai của DANAVA.</p>
            <a className="s-link" href={p.source} target="_blank" rel="noopener">Xem nguồn <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </section>
      )}

      <ServiceLinks services={services} title="Dịch vụ đã sử dụng trong dự án" />
      <RelatedProjects projects={others} title="Xem thêm câu chuyện" id="proj-others" />

      <CtaBand
        title="Muốn triển khai tương tự cho doanh nghiệp của bạn?"
        lead="Chia sẻ mô hình và nhu cầu hiện tại, DANAVA đề xuất phạm vi phù hợp."
        primary={{ href: contactHref, label: cta }}
      />
    </main>
  );
}
