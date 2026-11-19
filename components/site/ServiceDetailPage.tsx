/**
 * /giai-phap/[slug]/ — trang dịch vụ chuẩn hóa (server component).
 * Thứ tự: dịch vụ là gì & dành cho ai → vấn đề → giải pháp/phạm vi → tính năng & giao diện thực tế →
 * quy trình → cam kết → chi phí → dự án liên quan → trang dịch vụ con → FAQ → kiến thức → giải pháp khác → CTA.
 * Nội dung lấy từ CMS (data.services) + khối trình bày trong service-content.ts.
 */
import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import type { Service, SiteData } from '@/lib/content';
import { postsForService, projectsForService, publishedSubServices, sortServices, subServiceHref } from '@/lib/site-queries';
import { serviceMeta, CONTACT, formatPhone, excerpt } from './catalog';
import { SERVICE_DETAILS } from './service-content';
import { Crumbs, CtaBand, SectionHeading, Visual } from './ui';
import { WebsitePage } from './WebsitePage';
import { MarketingPage } from './MarketingPage';
import { EventsPage } from './EventsPage';
import { StudioShowcase } from './StudioShowcase';
import { ProductGallery } from './ProductGallery';
import { DanavaGoShowcase } from './DanavaGoShowcase';
import { STUDIO_GALLERY } from './product-showcase';
import { FaqSection, FeatureGrid, PricingSection, ProblemsSection, ProcessSection, RelatedPosts, RelatedProjects, ScopeSection, ServiceLinks } from './blocks';

export function contactHrefFor(service: Service) {
  return `/lien-he/?service=${SERVICE_DETAILS[service.id]?.contactService || service.slug}`;
}

/** Mỗi giải pháp chính có bố cục riêng; các giải pháp còn lại dùng bố cục chuẩn bên dưới. */
export function ServiceDetailPage({ service, data }: { service: Service; data: SiteData }) {
  if (service.id === 'website') return <WebsitePage service={service} data={data} />;
  if (service.id === 'marketing') return <MarketingPage service={service} data={data} />;
  if (service.id === 'events') return <EventsPage service={service} data={data} />;
  return <StandardServicePage service={service} data={data} />;
}

function StandardServicePage({ service, data }: { service: Service; data: SiteData }) {
  const m = serviceMeta(service);
  const d = SERVICE_DETAILS[service.id];
  const phone = data.phone || CONTACT.phone;
  const contactHref = contactHrefFor(service);
  const cta = service.id === 'studio' ? 'Đăng ký demo' : d?.primaryCta || 'Nhận tư vấn';
  const image = service.image || m.image;
  const projects = projectsForService(data, service.id).slice(0, 3);
  const posts = postsForService(data, service.id, 3);
  const subs = publishedSubServices(data, service.id);
  const others = sortServices(data.services).filter(s => s.id !== service.id).slice(0, 3);

  return (
    <main id="main">
        <section className="s-svc-hero">
          <div className="s-container s-split">
            <div className="s-svc-hero__copy">
              <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
              <p className="s-eyebrow">{m.kicker}</p>
              <h1 className="s-h1">{service.title}</h1>
              <p className="s-lead">{service.heroLead || service.description}</p>
              {!!service.audience?.length && (
                <ul className="s-svc-audience" aria-label="Phù hợp với">
                  {service.audience.map(a => <li key={a} className="s-badge s-badge--neutral">{a}</li>)}
                </ul>
              )}
              <div className="s-row s-stack-m">
                <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>{cta}</Link>
                <a className="s-btn s-btn--secondary s-btn--lg" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
              </div>
            </div>
            {service.id === 'studio' ? (
              <StudioShowcase image={image} priority />
            ) : (
              <div className={`s-frame s-frame--4x3${image ? '' : ' s-frame--plain'}`}>
                {image
                  ? <img src={image} alt={m.imageAlt || service.title} fetchPriority="high" width={1200} height={900} />
                  : <Visual icon={m.icon} tone={m.tone} label={service.title} chips={service.items.map(i => excerpt(i, 26))} />}
              </div>
            )}
          </div>
        </section>

      <ProblemsSection
        title={`Khi nào nên dùng ${service.title}?`}
        problems={service.problems || []}
      />

      <ScopeSection title={service.description} items={service.items} />

      {/* DANAVA Studio: ảnh giao diện thật */}
      {service.id === 'studio' && (
        <section className="s-section" id="giao-dien" aria-labelledby="studio-ui-title">
          <div className="s-container">
            <SectionHeading
              eyebrow="Giao diện thực tế"
              title={<span id="studio-ui-title">Xem DANAVA Studio <span className="s-hl">hoạt động thế nào</span></span>}
              lead="Ảnh chụp màn hình thật của phần mềm quản lý, app hội viên và website. Bấm vào ảnh để xem lớn."
            />
            <ProductGallery groups={STUDIO_GALLERY} idPrefix="studio" />
          </div>
        </section>
      )}

      {service.id === 'travel' && <DanavaGoShowcase />}

      {service.id === 'travel' && (
        <section className="s-section s-section--tight" aria-label="Sự kiện doanh nghiệp">
          <div className="s-container u-crosslink">
            <p><strong>Tổ chức hội nghị, kick-off, gala hay booth trưng bày?</strong> Xem các chương trình thực tế và hạng mục tại trang Sự kiện & Truyền thông.</p>
            <Link className="s-btn s-btn--secondary" href="/giai-phap/su-kien-truyen-thong/">Sự kiện & Truyền thông</Link>
          </div>
        </section>
      )}

      {d?.blocks.map((b, bi) => (
        <FeatureGrid key={b.id} id={b.id} eyebrow={b.eyebrow} title={b.title} lead={b.lead} features={b.features} soft={bi % 2 === 0} />
      ))}

      <ProcessSection steps={service.process || []} />

      {d?.promises && (
        <section className="s-section s-section--brand" aria-labelledby="svc-promises">
          <div className="s-container">
            <SectionHeading eyebrow="Cam kết" title={<span id="svc-promises">Minh bạch và tôn trọng tài sản của bạn</span>} />
            <div className="s-grid s-grid--3">
              {d.promises.map(p => (
                <div key={p.title} className="s-feature s-card s-card--pad">
                  <h3 className="s-feature__title">{p.title}</h3>
                  <p className="s-feature__text">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <PricingSection pricing={service.pricing || ''} productUrl={service.productUrl} productLabel={service.productLabel} contactHref={contactHref} />

      <RelatedProjects projects={projects} title={`Dự án ${service.title} đã triển khai`} />

      {subs.length > 0 && (
        <section className="s-section" aria-labelledby="svc-subs">
          <div className="s-container">
            <SectionHeading eyebrow="Theo nhu cầu" title={<span id="svc-subs">{service.title} cho từng mô hình</span>} />
            <div className="s-grid s-grid--3 s-tiles">
              {subs.map(s => (
                <article key={s.id} className="s-card s-card--pad s-card--link s-svc-mini">
                  <h3 className="s-h4"><Link className="s-card__cover" href={subServiceHref(data, s)}>{s.title}</Link></h3>
                  <p className="s-text s-small">{s.description}</p>
                  <span className="s-link">Xem chi tiết <ArrowRight aria-hidden="true" /></span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection faqs={service.faqs || []} contactHref={contactHref} />

      <RelatedPosts posts={posts} data={data} title={`Kiến thức về ${service.title}`} />

      <ServiceLinks services={others} title="Giải pháp khác của DANAVA" />

      <CtaBand
        title={service.id === 'studio' ? 'Xem DANAVA Studio chạy với dữ liệu của bạn' : `Trao đổi về ${service.title}`}
        lead="Để lại thông tin, chuyên viên DANAVA liên hệ lại để tìm hiểu nhu cầu và đề xuất phạm vi phù hợp."
        primary={{ href: contactHref, label: cta }}
      />
    </main>
  );
}
