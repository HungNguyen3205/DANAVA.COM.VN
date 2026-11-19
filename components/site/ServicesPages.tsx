'use client';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Phone, Settings2, TrendingUp, PartyPopper } from 'lucide-react';
import type { Service } from '@/lib/content';
import { useSite } from '../SiteStore';
import { serviceMeta, sortServices, SERVICE_META, CONTACT, formatPhone, excerpt } from './catalog';
import { SERVICE_DETAILS } from './service-content';
import { PageHead, SectionHeading, CheckList, CtaBand, Visual, IconTile, Crumbs, SwipeHint } from './ui';
import { MarketingFilm } from './MarketingStage';
import { StudioShowcase } from './StudioShowcase';
import { ProductGallery } from './ProductGallery';
import { DanavaGoShowcase } from './DanavaGoShowcase';
import { PortfolioGrid } from './PortfolioGrid';
import { PORTFOLIO } from './portfolio';
import { STUDIO_GALLERY } from './product-showcase';

/* ==========================================================================
   /giai-phap/
   ========================================================================== */
export function ServicesIndex() {
  const { data } = useSite();
  const services = sortServices(data.services);
  const [featured, ...rest] = services;

  const needs = [
    { icon: Settings2, tone: 'blue' as const, need: 'Tôi muốn vận hành cơ sở gọn hơn', answer: 'Quản lý hội viên, lịch lớp, check-in và doanh thu tự động.', id: 'studio' },
    { icon: TrendingUp, tone: 'orange' as const, need: 'Tôi muốn có thêm khách hàng', answer: 'Website chuẩn SEO kết hợp nội dung và quảng cáo đúng khu vực.', id: 'marketing' },
    { icon: PartyPopper, tone: 'green' as const, need: 'Tôi muốn tổ chức tour hoặc sự kiện', answer: 'Retreat, hội thảo, workshop và team building trọn gói.', id: 'travel' }
  ];

  return (
    <main id="main">
      <PageHead
        center
        eyebrow="Giải pháp"
        title={<>Đúng giải pháp cho <span className="s-hl">từng bài toán</span></>}
        lead="Từ phần mềm vận hành đến truyền thông và trải nghiệm khách hàng, chọn thứ doanh nghiệp bạn cần ngay hôm nay và mở rộng khi sẵn sàng."
      />

      <section className="s-section s-section--flush-top" aria-label="Danh sách giải pháp">
        <div className="s-container s-stack-lg">
          {featured && <FeaturedService service={featured} />}
          <SwipeHint />
          <div className="s-grid s-grid--2 s-snap">
            {rest.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      <section className="s-section s-section--soft" aria-labelledby="svc-needs">
        <div className="s-container">
          <SectionHeading eyebrow="Chưa biết bắt đầu từ đâu?" title={<span id="svc-needs">Bắt đầu từ <span className="s-hl">điều bạn cần</span></span>} center />
          <div className="s-grid s-grid--3 s-tiles">
            {needs.map(n => {
              const s = services.find(x => x.id === n.id);
              if (!s) return null;
              return (
                <article key={n.id} className="s-card s-card--pad s-card--link s-svc-need">
                  <IconTile icon={n.icon} tone={n.tone} />
                  <h3 className="s-h4"><Link className="s-card__cover" href={`/giai-phap/${s.slug}/`}>{n.need}</Link></h3>
                  <p className="s-text">{n.answer}</p>
                  <p className="s-svc-need__goto">{s.title} <ArrowRight aria-hidden="true" /></p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand title="Cần tư vấn trực tiếp?" lead="Chuyên viên DANAVA sẽ lắng nghe và đề xuất giải pháp phù hợp với quy mô, ngân sách của bạn." />
    </main>
  );
}

function FeaturedService({ service }: { service: Service }) {
  const m = serviceMeta(service);
  return (
    <article className="s-card s-card--link s-svc-featured">
      <div className="s-svc-featured__body">
        <span className="s-badge">Sản phẩm chủ lực</span>
        <h2 className="s-h2"><Link className="s-card__cover" href={`/giai-phap/${service.slug}/`}>{service.title}</Link></h2>
        <p className="s-lead">{service.description}</p>
        <CheckList items={service.items.slice(0, 4)} />
        <span className="s-link">Tìm hiểu thêm <ArrowRight aria-hidden="true" /></span>
      </div>
      <div className="s-svc-featured__media">
        {m.image ? <img src={m.image} alt={m.imageAlt || service.title} /> : <Visual icon={m.icon} tone={m.tone} label={service.title} chips={service.items} />}
      </div>
    </article>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const m = serviceMeta(service);
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {m.image ? <img src={m.image} alt={m.imageAlt || service.title} loading="lazy" /> : <Visual icon={m.icon} tone={m.tone} label={service.title} chips={service.items.map(i => excerpt(i, 26))} />}
      </div>
      <div className="s-card__body">
        <p className="s-card__tag">{m.kicker}</p>
        <h3 className="s-card__title"><Link className="s-card__cover" href={`/giai-phap/${service.slug}/`}>{service.title}</Link></h3>
        <p className="s-card__text">{service.description}</p>
        <div className="s-card__foot">
          <span className="s-muted s-small">{service.items.length} hạng mục</span>
          <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================================
   /giai-phap/[slug]/
   ========================================================================== */
export function ServiceDetail({ service }: { service: Service }) {
  const { data } = useSite();
  const m = serviceMeta(service);
  const d = SERVICE_DETAILS[service.id];
  const phone = data.phone || CONTACT.phone;
  const contactHref = `/lien-he/?service=${d?.contactService || service.slug}`;
  const projects = (data.projects || []).filter(p => {
    const hay = `${p.category} ${p.title}`.toLowerCase();
    return service.id === 'studio' ? hay.includes('studio') : hay.includes(service.title.toLowerCase().split(' ')[0]);
  }).slice(0, 2);
  const others = sortServices(data.services).filter(s => s.id !== service.id).slice(0, 3);
  const isMkt = service.id === 'marketing';

  return (
    <main id="main" className={isMkt ? 's-mkt' : undefined}>
      {isMkt ? (
        <>
          <MarketingFilm
            title={service.title}
            contactHref={contactHref}
            cta={d?.primaryCta || 'Nhận tư vấn'}
            phone={phone}
            phoneLabel={formatPhone(phone)}
            email={data.email || 'hello@danava.vn'}
          />
        </>
      ) : (
      <section className="s-svc-hero">
        <div className="s-container s-split">
          <div className="s-svc-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
            <p className="s-eyebrow">{m.kicker}</p>
            <h1 className="s-h1">{service.title}</h1>
            <p className="s-lead">{d?.heroLead || service.description}</p>
            {d?.audience && (
              <ul className="s-svc-audience" aria-label="Phù hợp với">
                {d.audience.map(a => <li key={a} className="s-badge s-badge--neutral">{a}</li>)}
              </ul>
            )}
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>{d?.primaryCta || 'Nhận tư vấn'}</Link>
              <a className="s-btn s-btn--secondary s-btn--lg" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
            </div>
          </div>
          {service.id === 'studio' ? (
            <StudioShowcase image={m.image} priority />
          ) : (
          <div className={`s-frame ${m.image ? 's-frame--4x3' : 's-frame--4x3 s-frame--plain'}`}>
            {m.image
              ? <img src={m.image} alt={m.imageAlt || service.title} fetchPriority="high" />
              : <Visual icon={m.icon} tone={m.tone} label={service.title} chips={service.items.map(i => excerpt(i, 26))} />}
          </div>
          )}
        </div>
      </section>
      )}

      {/* Hạng mục từ CMS */}
      {!isMkt && <section className="s-section s-section--brand" aria-labelledby="svc-includes">
        <div className="s-container">
          <div className="s-svc-includes">
            <div>
              <p className="s-eyebrow">Dịch vụ bao gồm</p>
              <h2 className="s-h3" id="svc-includes">{service.description}</h2>
            </div>
            <CheckList items={service.items} />
          </div>
        </div>
      </section>}

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

      {/* Website & Landing Page: các website, landing page và nền tảng đã làm (components/site/portfolio.ts) */}
      {service.id === 'website' && PORTFOLIO.length > 0 && (
        <section className="s-section h-works" id="du-an-web" aria-labelledby="web-works-title">
          <div className="s-container">
            <div className="h-works__head">
              <div>
                <p className="h-chapter"><span>{String(PORTFOLIO.length).padStart(2, '0')}</span>Dự án đã thực hiện</p>
                <h2 className="h-title" id="web-works-title">Website & landing page <em>DANAVA đã xây dựng.</em></h2>
              </div>
              <p className="h-works__lead">Nền tảng đặt vé, website thương hiệu, landing page sự kiện, bất động sản và bán hàng. Bấm vào thẻ để mở website đang chạy.</p>
            </div>
            <PortfolioGrid items={PORTFOLIO} />
          </div>
        </section>
      )}

      {/* Du lịch & Sự kiện: nền tảng đặt vé DANAVA GO */}
      {service.id === 'travel' && <DanavaGoShowcase />}

      {/* Khối nội dung chi tiết */}
      {!isMkt && d?.blocks.map((b, bi) => (
        <section key={b.id} id={b.id} className={`s-section${bi % 2 ? ' s-section--soft' : ''}`} aria-labelledby={`${b.id}-title`}>
          <div className="s-container">
            <SectionHeading eyebrow={b.eyebrow} title={<span id={`${b.id}-title`}>{b.title}</span>} lead={b.lead} />
            <SwipeHint />
            <div className={`s-grid s-tiles s-snap ${b.features.length % 3 === 0 ? 's-grid--3' : 's-grid--2'}`}>
              {b.features.map((f, i) => (
                <div key={f.title} className="s-card s-card--pad s-svc-feature">
                  <span className="s-svc-feature__num">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="s-h4">{f.title}</h3>
                  <p className="s-text">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Quy trình */}
      {!isMkt && d?.process && (
        <section className="s-section" aria-labelledby="svc-process">
          <div className="s-container">
            <SectionHeading eyebrow="Quy trình" title={<span id="svc-process">Rõ ràng <span className="s-hl">ở mỗi bước</span></span>} center />
            <ol className="s-home-steps s-tiles s-snap s-snap--sm">
              {d.process.map((s, i) => (
                <li key={s.title}>
                  <span className="s-home-steps__num">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="s-h4">{s.title}</h3>
                  <p className="s-text">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Cam kết */}
      {!isMkt && d?.promises && (
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

      {/* Dự án liên quan */}
      {!isMkt && projects.length > 0 && (
        <section className="s-section s-section--soft" aria-labelledby="svc-projects">
          <div className="s-container">
            <SectionHeading eyebrow="Dự án thực tế" title={<span id="svc-projects">Đang vận hành cùng khách hàng</span>} />
            <div className="s-grid s-grid--2 s-snap">
              {projects.map(p => (
                <article key={p.id} className="s-card s-card--link">
                  <div className="s-card__media"><img src={p.image} alt={p.title} loading="lazy" /></div>
                  <div className="s-card__body">
                    <p className="s-card__tag">{p.client}</p>
                    <h3 className="s-card__title"><Link className="s-card__cover" href={`/du-an/${p.slug}/`}>{p.title}</Link></h3>
                    <p className="s-card__text">{excerpt(p.summary, 150)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {d?.faqs.length ? (
        <section className="s-section" aria-labelledby="svc-faq">
          <div className="s-container s-split s-split--top">
            <div className="s-heading">
              <p className="s-eyebrow">Câu hỏi thường gặp</p>
              <h2 className="s-h2" id="svc-faq">Bạn hỏi, DANAVA trả lời</h2>
              <p className="s-lead">Chưa thấy câu hỏi của bạn? <Link className="s-textlink" href={contactHref}>Gửi câu hỏi cho chúng tôi</Link>.</p>
            </div>
            <div className="s-faq">
              {d.faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>{f.q}<ChevronDown aria-hidden="true" /></summary>
                  <div>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Giải pháp khác */}
      <section className="s-section s-section--line" aria-labelledby="svc-others">
        <div className="s-container">
          <SectionHeading eyebrow="Khám phá thêm" title={<span id="svc-others">Giải pháp khác của DANAVA</span>} />
          <div className="s-grid s-grid--3 s-tiles s-snap s-snap--sm">
            {others.map(s => {
              const om = SERVICE_META[s.id];
              return (
                <article key={s.id} className="s-card s-card--pad s-card--link s-svc-mini">
                  {om && <IconTile icon={om.icon} tone={om.tone} />}
                  <h3 className="s-h4"><Link className="s-card__cover" href={`/giai-phap/${s.slug}/`}>{s.title}</Link></h3>
                  <p className="s-text s-small">{s.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand primary={{ href: contactHref, label: d?.primaryCta || 'Nhận tư vấn miễn phí' }} />
    </main>
  );
}
