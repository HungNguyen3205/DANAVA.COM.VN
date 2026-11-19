/**
 * /giai-phap/[dịch vụ cha]/[slug]/ — trang dịch vụ con (server component).
 * Chỉ công khai khi published; bản nháp chỉ quản trị viên đã đăng nhập xem trước (noindex).
 */
import Link from 'next/link';
import { Phone } from 'lucide-react';
import type { Service, SiteData, SubService } from '@/lib/content';
import { postsForService, projectsForService, publishedSubServices, subServiceHref } from '@/lib/site-queries';
import { CONTACT, formatPhone, serviceMeta } from './catalog';
import { Crumbs, CtaBand } from './ui';
import { FaqSection, FeatureGrid, PricingSection, ProblemsSection, ProcessSection, RelatedPosts, RelatedProjects, ServiceLinks } from './blocks';
import { contactHrefFor } from './ServiceDetailPage';

export function DraftBanner({ label = 'Bản nháp' }: { label?: string }) {
  return (
    <div className="u-draft" role="status">
      <strong>{label}</strong> — chỉ quản trị viên đang đăng nhập nhìn thấy trang này. Trang chưa công khai, không vào sitemap và không được lập chỉ mục.
    </div>
  );
}

export function SubServicePage({ parent, sub, data, preview }: { parent: Service; sub: SubService; data: SiteData; preview?: boolean }) {
  const m = serviceMeta(parent);
  const phone = data.phone || CONTACT.phone;
  const contactHref = contactHrefFor(parent);
  const cta = parent.id === 'studio' ? 'Đăng ký demo' : 'Nhận tư vấn';
  const siblings = publishedSubServices(data, parent.id).filter(s => s.id !== sub.id);
  const projects = projectsForService(data, parent.id).slice(0, 3);
  const posts = postsForService(data, parent.id, 3);

  return (
    <main id="main">
      {preview && <DraftBanner />}
      <section className="s-svc-hero">
        <div className="s-container s-split">
          <div className="s-svc-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { href: `/giai-phap/${parent.slug}/`, label: parent.title }, { label: sub.title }]} />
            <p className="s-eyebrow">{m.kicker} · {parent.title}</p>
            <h1 className="s-h1">{sub.title}</h1>
            <p className="s-lead">{sub.heroLead || sub.description}</p>
            {sub.audience.length > 0 && (
              <ul className="s-svc-audience" aria-label="Phù hợp với">
                {sub.audience.map(a => <li key={a} className="s-badge s-badge--neutral">{a}</li>)}
              </ul>
            )}
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>{cta}</Link>
              <a className="s-btn s-btn--secondary s-btn--lg" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
            </div>
          </div>
          {sub.image ? (
            <div className="s-frame s-frame--4x3">
              <img src={sub.image} alt={sub.title} fetchPriority="high" width={1200} height={900} />
            </div>
          ) : <div aria-hidden="true" />}
        </div>
      </section>

      <ProblemsSection title="Vấn đề thường gặp" problems={sub.problems} />
      <FeatureGrid id="tinh-nang" eyebrow="Giải pháp DANAVA" title={`${sub.title}: phạm vi chính`} features={sub.features} soft />
      <ProcessSection steps={sub.process} />
      <PricingSection pricing={sub.pricing || parent.pricing || ''} productUrl={parent.productUrl} productLabel={parent.productLabel} contactHref={contactHref} />
      <RelatedProjects projects={projects} />
      <FaqSection faqs={sub.faqs} contactHref={contactHref} />
      <RelatedPosts posts={posts} data={data} />
      {siblings.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="sub-siblings">
          <div className="s-container">
            <h2 className="s-h3" id="sub-siblings">Xem thêm trong {parent.title}</h2>
            <ul className="u-linklist">
              <li><Link href={`/giai-phap/${parent.slug}/`}>Tổng quan {parent.title}</Link></li>
              {siblings.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}>{s.title}</Link></li>)}
            </ul>
          </div>
        </section>
      )}
      <ServiceLinks services={[parent]} title="Giải pháp tổng thể" />
      <CtaBand title={`Trao đổi về ${sub.title.toLowerCase()}`} primary={{ href: contactHref, label: cta }} />
    </main>
  );
}
