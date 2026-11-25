/**
 * /giai-phap/[slug]/ — trang dịch vụ chuẩn hóa (server component).
 * Thứ tự: dịch vụ là gì & dành cho ai → vấn đề → giải pháp/phạm vi → tính năng & giao diện thực tế →
 * quy trình → cam kết → chi phí → dự án liên quan → trang dịch vụ con → FAQ → kiến thức → giải pháp khác → CTA.
 * Nội dung lấy từ CMS (data.services) + khối trình bày trong service-content.ts.
 */
import Link from 'next/link';
import { txt } from '@/lib/site-text';
import { Phone, ArrowRight } from 'lucide-react';
import type { Service, SiteData } from '@/lib/content';
import { postsForService, projectsForService, publishedSubServices, sortServices, subServiceHref } from '@/lib/site-queries';
import { serviceMeta, CONTACT, formatPhone, excerpt } from './catalog';
import { SERVICE_DETAILS } from './service-content';
import { Crumbs, CtaBand, SectionHeading, Visual } from './ui';
import { WebsitePage } from './WebsitePage';
import { MarketingPage } from './MarketingPage';
import { EventsPage } from './EventsPage';
import { StudioPage } from './StudioPage';
import { cmsText, ct } from './cms';
import { StudioShowcase } from './StudioShowcase';
import { ProductGallery } from './ProductGallery';
import { DanavaGoShowcase } from './DanavaGoShowcase';
import { STUDIO_GALLERY } from './product-showcase';
import { PackagesSection } from './ProductPackages';
import { FaqSection, FeatureGrid, PricingSection, ProblemsSection, ProcessSection, RelatedPosts, RelatedProjects, ScopeSection, ServiceLinks } from './blocks';

export function contactHrefFor(service: Service) {
  return `/lien-he/?service=${SERVICE_DETAILS[service.id]?.contactService || service.slug}`;
}

/** Mỗi giải pháp chính có bố cục riêng; các giải pháp còn lại dùng bố cục chuẩn bên dưới. */
/** Nhóm trang chứa dịch vụ: mặc định là Giải pháp; trang Dịch vụ truyền vào nhóm của mình */
export type ServiceSection = { base: string; label: string; siblings: Service[]; siblingsTitle: string };

export function ServiceDetailPage({ service, data, section }: { service: Service; data: SiteData; section?: ServiceSection }) {
  if (service.id === 'website') return <WebsitePage service={service} data={data} />;
  if (service.id === 'marketing') return <MarketingPage service={service} data={data} />;
  if (service.id === 'events') return <EventsPage service={service} data={data} />;
  if (service.id === 'studio') return <StudioPage service={service} data={data} />;
  return <StandardServicePage service={service} data={data} section={section} />;
}

/**
 * Dịch vụ khai báo trong mã (lib/dich-vu.ts, mã dv-*) không có hồ sơ trong data.services → vùng chữ lưu vào kho chữ
 * txt.product.<mã>.<trường> (ghi được, dịch được) thay vì rec.services.* (không có bản ghi → không lưu được).
 * Chữ hiển thị đọc lại từ kho chữ (bản sửa / bản dịch), mặc định là chữ trong mã.
 */
const OVERLAY_FIELDS = ['title', 'heroLead', 'description', 'items', 'features', 'process', 'faqs', 'problems', 'audience'] as const;
function overlayCodeService(data: SiteData, service: Service): Service {
  const walk = (v: unknown, key: string): unknown => {
    if (typeof v === 'string') return txt(data, key, v);
    if (Array.isArray(v)) return v.map((x, i) => walk(x, `${key}.${i}`));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' || Array.isArray(x) || (x && typeof x === 'object') ? walk(x, `${key}.${k}`) : x]));
    return v;
  };
  const out = { ...service } as Record<string, unknown>;
  for (const f of OVERLAY_FIELDS) if (out[f] !== undefined) out[f] = walk(out[f], `product.${service.id}.${f}`);
  return out as unknown as Service;
}

function StandardServicePage({ service: raw, data, section }: { service: Service; data: SiteData; section?: ServiceSection }) {
  const inData = data.services.some(s => s.id === raw.id);
  const service = inData ? raw : overlayCodeService(data, raw);
  /** Gốc khóa vùng chữ của hồ sơ: bản ghi CMS hoặc kho chữ (dịch vụ trong mã) */
  const recBase = inData ? `rec.services.${service.id}` : `txt.product.${service.id}`;
  const m = serviceMeta(service);
  const d = SERVICE_DETAILS[service.id];
  const phone = data.phone || CONTACT.phone;
  const contactHref = contactHrefFor(service);
  // Chữ cố định sửa được (lib/site-text.ts): product.* dùng chung mọi trang sản phẩm, product.<mã sản phẩm>.* riêng từng sản phẩm
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `product.${k}`, def, label, opts);
  const own = /^[a-z0-9][a-z0-9-]{0,60}$/.test(service.id);
  const tOwn = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => (own ? t(`${service.id}.${k}`, def, label, opts) : { v: def, a: {} });
  const scopeLabel = `Hồ sơ ${service.title}`;
  const rec = (field: string, label: string, multiline = false) => cmsText(`${recBase}.${field}`, label, { scope: inData ? 'record' : 'global', scopeLabel, ...(multiline ? { multiline: true } : {}) });
  const ctaT = tOwn('cta', service.id === 'studio' ? 'Đăng ký demo' : d?.primaryCta || 'Nhận tư vấn', 'Nút liên hệ chính');
  const cta = ctaT.v;
  const kicker = tOwn('kicker', m.kicker, 'Nhãn nhóm sản phẩm');
  const demoBtn = t('hero.demo', 'Xem demo', 'Nút xem demo');
  const signupBtn = t('hero.signup', 'Đăng ký', 'Nút đăng ký');
  const tvT = t('travel-events.title', 'Tổ chức hội nghị, kick-off, gala hay booth trưng bày?', 'Liên kết sự kiện: câu hỏi');
  const tvX = t('travel-events.text', 'Xem các chương trình thực tế và hạng mục tại trang Tổ chức sự kiện.', 'Liên kết sự kiện: mô tả');
  const tvB = t('travel-events.button', 'Tổ chức sự kiện', 'Liên kết sự kiện: nút');
  const prE = t('promises.eyebrow', 'Cam kết', 'Dòng chữ nhỏ cam kết');
  const prT = t('promises.title', 'Minh bạch và tôn trọng tài sản của bạn', 'Tiêu đề cam kết');
  const subE = t('subs.eyebrow', 'Theo nhu cầu', 'Dòng chữ nhỏ dịch vụ con');
  const subT = t('subs.title', 'cho từng mô hình', 'Tiêu đề dịch vụ con (sau tên sản phẩm)');
  const subMore = t('subs.more', 'Xem chi tiết', 'Chữ liên kết xem chi tiết');
  const ctaTitle = t('cta.title', 'Trao đổi về', 'Dải cuối trang: tiêu đề (trước tên sản phẩm)');
  const ctaLead = t('cta.lead', 'Để lại thông tin, chuyên viên DANAVA liên hệ lại để tìm hiểu nhu cầu và đề xuất phạm vi phù hợp.', 'Dải cuối trang: câu dẫn', { multiline: true });
  // Câu báo giá: hồ sơ trong CMS (data.services) → rec.services.<id>.pricing; dịch vụ khai báo trong mã (lib/dich-vu.ts) → khóa product.<id>.pricing
  const pricing = inData ? { v: service.pricing || '', a: rec('pricing', 'Cách xác định báo giá', true) } : tOwn('pricing', service.pricing || '', 'Cách xác định báo giá', { multiline: true });
  const image = service.cover || service.image || m.image;
  const projects = projectsForService(data, service.id).slice(0, 3);
  const posts = postsForService(data, service.id, 3);
  const subs = publishedSubServices(data, service.id);
  const others = (section ? section.siblings : sortServices(data.services)).filter(s => s.id !== service.id).slice(0, 3);

  return (
    <main id="main">
        <section className="s-svc-hero">
          <div className="s-container s-split">
            <div className="s-svc-hero__copy">
              <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: section?.base ?? '/giai-phap/', label: section?.label ?? 'Giải pháp' }, { label: service.title }]} />
              <p className="s-eyebrow" {...kicker.a}>{kicker.v}</p>
              <h1 className="s-h1" {...rec('title', 'Tên sản phẩm')}>{service.title}</h1>
              <p className="s-lead" {...rec(service.heroLead ? 'heroLead' : 'description', 'Câu dẫn sản phẩm', true)}>{service.heroLead || service.description}</p>
              {!!service.audience?.length && (
                <ul className="s-svc-audience" aria-label="Phù hợp với">
                  {service.audience.map((a, i) => <li key={a} className="s-badge s-badge--neutral" {...rec(`audience.${i}`, 'Đối tượng phù hợp')}>{a}</li>)}
                </ul>
              )}
              <div className="s-row s-stack-m">
                <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}><span {...ctaT.a}>{cta}</span></Link>
                {service.demoUrl
                  ? <a className="s-btn s-btn--secondary s-btn--lg" href={service.demoUrl} {...(service.demoUrl.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}><span {...demoBtn.a}>{demoBtn.v}</span></a>
                  : <a className="s-btn s-btn--secondary s-btn--lg" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>}
                {service.signupUrl && <a className="s-btn s-btn--secondary s-btn--lg" href={service.signupUrl} {...(service.signupUrl.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}><span {...signupBtn.a}>{signupBtn.v}</span></a>}
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
        rec={{ base: recBase, label: `Hồ sơ ${service.title}` }}
      />

      <ScopeSection title={service.description} items={service.items} rec={{ base: recBase, label: `Hồ sơ ${service.title}` }} />

      {/* Tính năng nhập trong hồ sơ sản phẩm (admin → Giải pháp → Nội dung) */}
      <FeatureGrid id="tinh-nang" eyebrow="Tính năng" title={`Tính năng của ${service.title}`} features={service.features || []} soft rec={{ base: recBase, label: `Hồ sơ ${service.title}` }} />

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
            <p><strong {...tvT.a}>{tvT.v}</strong> <span {...tvX.a}>{tvX.v}</span></p>
            <Link className="s-btn s-btn--secondary" href="/giai-phap/su-kien-truyen-thong/"><span {...tvB.a}>{tvB.v}</span></Link>
          </div>
        </section>
      )}

      {d?.blocks.map((b, bi) => {
        // Khối trình bày trong mã (service-content.ts) → khóa product.<mã sản phẩm>.blocks.<khối>.*
        const bk = (k: string, def: string, label: string, multiline = false) => tOwn(`blocks.${b.id}.${k}`, def, label, { multiline });
        const be = bk('eyebrow', b.eyebrow, 'Dòng chữ nhỏ khối'), bt = bk('title', b.title, 'Tiêu đề khối'), bl = b.lead ? bk('lead', b.lead, 'Câu dẫn khối', true) : undefined;
        return (
          <FeatureGrid key={b.id} id={b.id} eyebrow={<span {...be.a}>{be.v}</span>} title={<span {...bt.a}>{bt.v}</span>} lead={bl && <span {...bl.a}>{bl.v}</span>} features={b.features} soft={bi % 2 === 0}
            feat={(i, field, def) => bk(`features.${i}.${field}`, def, field === 'title' ? 'Tên tính năng' : 'Mô tả tính năng', field === 'text')} />
        );
      })}

      <ProcessSection steps={service.process || []} rec={{ base: recBase, label: `Hồ sơ ${service.title}` }} />

      {d?.promises && (
        <section className="s-section s-section--brand" aria-labelledby="svc-promises">
          <div className="s-container">
            <SectionHeading eyebrow={<span {...prE.a}>{prE.v}</span>} title={<span id="svc-promises" {...prT.a}>{prT.v}</span>} />
            <div className="s-grid s-grid--3">
              {d.promises.map((p, i) => {
                const pt = tOwn(`promises.${i}.title`, p.title, 'Tên cam kết'), px = tOwn(`promises.${i}.text`, p.text, 'Mô tả cam kết', { multiline: true });
                return (
                  <div key={p.title} className="s-feature s-card s-card--pad">
                    <h3 className="s-feature__title" {...pt.a}>{pt.v}</h3>
                    <p className="s-feature__text" {...px.a}>{px.v}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <PackagesSection title={`Bảng giá ${service.title}`} packages={service.packages || []} contactHref={contactHref} />

      <PricingSection pricing={pricing.v} productUrl={service.productUrl} productLabel={service.productLabel} contactHref={contactHref} cms={pricing.a} />

      <RelatedProjects projects={projects} title={`Dự án ${service.title} đã triển khai`} />

      {subs.length > 0 && (
        <section className="s-section" aria-labelledby="svc-subs">
          <div className="s-container">
            <SectionHeading eyebrow={<span {...subE.a}>{subE.v}</span>} title={<span id="svc-subs"><span {...rec('title', 'Tên sản phẩm')}>{service.title}</span> <span {...subT.a}>{subT.v}</span></span>} />
            <div className="s-grid s-grid--3 s-tiles">
              {subs.map(s => (
                <article key={s.id} className="s-card s-card--pad s-card--link s-svc-mini">
                  <h3 className="s-h4"><Link className="s-card__cover" href={subServiceHref(data, s)}><span {...cmsText(`rec.subServices.${s.id}.title`, 'Tên dịch vụ con', { scope: 'record', scopeLabel: 'Hồ sơ dịch vụ con' })}>{s.title}</span></Link></h3>
                  <p className="s-text s-small" {...cmsText(`rec.subServices.${s.id}.description`, 'Mô tả dịch vụ con', { multiline: true, scope: 'record', scopeLabel: 'Hồ sơ dịch vụ con' })}>{s.description}</p>
                  <span className="s-link"><span {...subMore.a}>{subMore.v}</span> <ArrowRight aria-hidden="true" /></span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection faqs={service.faqs || []} contactHref={contactHref} rec={{ base: recBase, label: `Hồ sơ ${service.title}` }} />

      <RelatedPosts posts={posts} data={data} title={`Bài viết về ${service.title}`} />

      <ServiceLinks services={others} title={section?.siblingsTitle ?? 'Giải pháp khác của DANAVA'} hrefOf={section ? s => `${section.base}${s.slug}/` : undefined} />

      <CtaBand
        title={service.id === 'studio' ? 'Xem DANAVA Studio chạy với dữ liệu của bạn' : <><span {...ctaTitle.a}>{ctaTitle.v}</span> <span {...rec('title', 'Tên sản phẩm')}>{service.title}</span></>}
        lead={<span {...ctaLead.a}>{ctaLead.v}</span>}
        primary={{ href: contactHref, label: cta }}
      />
    </main>
  );
}
