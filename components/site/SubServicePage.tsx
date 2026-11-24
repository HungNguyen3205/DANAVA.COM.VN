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
import { cmsText, ct } from './cms';

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
  // Chữ cố định sửa được (lib/site-text.ts): subservice.*; nhãn nhóm dùng chung khóa với trang sản phẩm (product.<mã>.kicker)
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `subservice.${k}`, def, label, opts);
  const ctaT = parent.id === 'studio' ? t('cta.studio', 'Đăng ký demo', 'Nút liên hệ chính') : t('cta.default', 'Nhận tư vấn', 'Nút liên hệ chính');
  const cta = ctaT.v;
  const kicker = /^[a-z0-9][a-z0-9-]{0,60}$/.test(parent.id) ? ct(data, `product.${parent.id}.kicker`, m.kicker, 'Nhãn nhóm sản phẩm') : { v: m.kicker, a: {} };
  const subRec = (field: string, label: string, multiline = false) => cmsText(`rec.subServices.${sub.id}.${field}`, label, { scope: 'record', scopeLabel: `Hồ sơ ${sub.title}`, ...(multiline ? { multiline: true } : {}) });
  const parentTitle = cmsText(`rec.services.${parent.id}.title`, 'Tên sản phẩm', { scope: 'record', scopeLabel: `Hồ sơ ${parent.title}` });
  const moreIn = t('siblings.title', 'Xem thêm trong', 'Tiêu đề xem thêm (trước tên sản phẩm)');
  const overview = t('siblings.overview', 'Tổng quan', 'Liên kết tổng quan (trước tên sản phẩm)');
  const ctaTitle = t('cta.title', 'Trao đổi về', 'Dải cuối trang: tiêu đề (trước tên dịch vụ)');
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
            <p className="s-eyebrow"><span {...kicker.a}>{kicker.v}</span> · <span {...parentTitle}>{parent.title}</span></p>
            <h1 className="s-h1" {...subRec('title', 'Tên dịch vụ')}>{sub.title}</h1>
            <p className="s-lead" {...subRec(sub.heroLead ? 'heroLead' : 'description', 'Câu dẫn dịch vụ', true)}>{sub.heroLead || sub.description}</p>
            {sub.audience.length > 0 && (
              <ul className="s-svc-audience" aria-label="Phù hợp với">
                {sub.audience.map((a, i) => <li key={a} className="s-badge s-badge--neutral" {...subRec(`audience.${i}`, 'Đối tượng phù hợp')}>{a}</li>)}
              </ul>
            )}
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}><span {...ctaT.a}>{cta}</span></Link>
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

      <ProblemsSection title="Vấn đề thường gặp" problems={sub.problems} rec={{ base: `rec.subServices.${sub.id}`, label: `Hồ sơ ${sub.title}` }} />
      <FeatureGrid id="tinh-nang" eyebrow="Giải pháp DANAVA" title={`${sub.title}: phạm vi chính`} features={sub.features} soft rec={{ base: `rec.subServices.${sub.id}`, label: `Hồ sơ ${sub.title}` }} />
      <ProcessSection steps={sub.process} rec={{ base: `rec.subServices.${sub.id}`, label: `Hồ sơ ${sub.title}` }} />
      <PricingSection pricing={sub.pricing || parent.pricing || ''} productUrl={parent.productUrl} productLabel={parent.productLabel} contactHref={contactHref} />
      <RelatedProjects projects={projects} />
      <FaqSection faqs={sub.faqs} contactHref={contactHref} rec={{ base: `rec.subServices.${sub.id}`, label: `Hồ sơ ${sub.title}` }} />
      <RelatedPosts posts={posts} data={data} />
      {siblings.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="sub-siblings">
          <div className="s-container">
            <h2 className="s-h3" id="sub-siblings"><span {...moreIn.a}>{moreIn.v}</span> <span {...parentTitle}>{parent.title}</span></h2>
            <ul className="u-linklist">
              <li><Link href={`/giai-phap/${parent.slug}/`}><span {...overview.a}>{overview.v}</span> <span {...parentTitle}>{parent.title}</span></Link></li>
              {siblings.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}><span {...cmsText(`rec.subServices.${s.id}.title`, 'Tên dịch vụ con', { scope: 'record', scopeLabel: `Hồ sơ ${s.title}` })}>{s.title}</span></Link></li>)}
            </ul>
          </div>
        </section>
      )}
      <ServiceLinks services={[parent]} title="Giải pháp tổng thể" />
      <CtaBand title={<><span {...ctaTitle.a}>{ctaTitle.v}</span> {sub.title.toLowerCase()}</>} primary={{ href: contactHref, label: cta }} />
    </main>
  );
}
