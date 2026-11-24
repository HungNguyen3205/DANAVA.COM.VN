import Link from 'next/link';
import { ArrowDown, ArrowUpRight, BarChart3, CalendarDays, Camera, Check, Film, KeyRound, Megaphone, Wallet } from 'lucide-react';
import type { Feature, Project, Service, SiteData } from '@/lib/content';
import { SERVICE_SEEDS } from '@/lib/content-defaults';
import { MARKETING_ENGAGEMENTS } from '@/lib/marketing-portfolio';
import { postsForService, projectHref, projectsForService, publishedSubServices, subServiceHref } from '@/lib/site-queries';
import { excerpt } from './catalog';
import { Crumbs } from './ui';
import { FaqSection, PricingSection, RelatedPosts } from './blocks';
import { contactHrefFor } from './ServiceDetailPage';
import { MarketingFieldPreview } from './MarketingFieldPreview';
import { MarketingProblemArt } from './MarketingProblemArt';
import { MarketingScope } from './MarketingScope';
import { MARKETING_STAGES } from './marketing-scope';

const OWNERSHIP = [
  { icon: Wallet, title: 'Bạn nắm tài khoản quảng cáo', text: 'Doanh nghiệp đứng tên và thanh toán trực tiếp cho Meta/Google, toàn quyền kiểm soát chi tiêu.' },
  { icon: Camera, title: 'Hình ảnh thật', text: 'Nội dung được sản xuất tại chính cơ sở của bạn để khách hàng có cảm nhận chân thực.' },
  { icon: KeyRound, title: 'Tài sản thuộc về bạn', text: 'Fanpage, Zalo OA, kho ảnh/video gốc và tệp khách hàng thuộc quyền sở hữu của doanh nghiệp.' }
];

const FIELD_WORK = [
  { icon: Camera, label: 'Ảnh và video tại cơ sở' },
  { icon: Megaphone, label: 'Nội dung quảng bá trước sự kiện' },
  { icon: Film, label: 'Ảnh và video recap sau chương trình' }
];

function MarketingProjects({ projects }: { projects: Project[] }) {
  const [lead, ...rest] = [...projects.filter(p => p.featured), ...projects.filter(p => !p.featured)];

  return (
    <section className="mk-work" id="du-an-marketing" aria-labelledby="mk-work-title">
      <div className="s-container">
        <div className="mk-work__heading">
          <h2 className="mk-section-title" id="mk-work-title" tabIndex={-1}>Dự án <em>đã thực hiện</em></h2>
          <Link className="s-link" href="/du-an/">Tất cả dự án <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <div className="mk-engagements">
          {MARKETING_ENGAGEMENTS.map(item => (
            <article className="mk-engagement" key={item.id} aria-labelledby={`mk-engagement-${item.id}`}>
              {item.image && (
                <div className="mk-engagement__media">
                  <img className="mk-engagement__image" src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" />
                </div>
              )}
              <div className="mk-engagement__body">
                <div className="mk-engagement__brand">
                  {item.logo && (
                    item.website || item.fanpage ? (
                      <a className="mk-engagement__logo" href={item.website || item.fanpage} aria-label={`Trang của ${item.client}`}>
                        <img src={item.logo} alt="" loading="lazy" decoding="async" />
                      </a>
                    ) : <span className="mk-engagement__logo"><img src={item.logo} alt="" loading="lazy" decoding="async" /></span>
                  )}
                  <div>
                    <h3 id={`mk-engagement-${item.id}`}>{item.client}</h3>
                    {item.throughPartner && <p className="mk-engagement__relation">Hỗ trợ qua đối tác</p>}
                  </div>
                </div>
                <p className="mk-engagement__title">{item.title}</p>
                <ul aria-label="Phạm vi Marketing & Truyền thông">
                  {item.scope.map(detail => <li key={detail}><Check aria-hidden="true" />{detail}</li>)}
                </ul>
                {(item.websiteWork || item.fanpage || item.maps) && (
                  <div className="mk-engagement__links">
                    {item.websiteWork && <Link className="mk-engagement__website" href={item.websiteProjectHref || '/giai-phap/thiet-ke-website/'}>{item.websiteWork} <ArrowUpRight aria-hidden="true" /></Link>}
                    {item.fanpage && <a className="mk-engagement__website" href={item.fanpage} aria-label={`Xem Fanpage ${item.client}`}>Xem Fanpage <ArrowUpRight aria-hidden="true" /></a>}
                    {item.maps && <a className="mk-engagement__website" href={item.maps}>Xem địa điểm trên Google Maps <ArrowUpRight aria-hidden="true" /></a>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        {lead && (
          <section className="mk-work__published" aria-labelledby="mk-case-studies-title">
            <h3 id="mk-case-studies-title">Hồ sơ dự án chi tiết</h3>
            <div className="mk-work__grid">
              <MarketingProjectCard project={lead} featured />
              {rest.map(project => <MarketingProjectCard key={project.id} project={project} />)}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function MarketingProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const cover = project.image || project.gallery?.find(image => image.src)?.src;
  const scope = (project.scope || []).filter(item => item.trim()).slice(0, 3);

  return (
    <article className={`mk-project${featured ? ' mk-project--featured' : ''}${cover ? ' mk-project--has-image' : ''}`}>
      {cover && <img className="mk-project__cover" src={cover} alt="" loading="lazy" decoding="async" />}
      <div className="mk-project__body">
        {project.client && <p className="mk-project__client">{project.client}</p>}
        <h3>{project.title}</h3>
        {project.summary && <p className="mk-project__summary">{excerpt(project.summary, 200)}</p>}
        {scope.length > 0 && <ul className="mk-project__scope" aria-label="Phạm vi thực hiện">{scope.map((item, i) => <li key={i}>{item}</li>)}</ul>}
        <Link className="mk-project__link" href={projectHref(project)} aria-label={`Xem dự án ${project.title}`}>Xem dự án <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </article>
  );
}

function MarketingProcess({ steps }: { steps: Feature[] }) {
  if (!steps.length) return null;

  return (
    <section className="mk-process" aria-labelledby="svc-process">
      <div className="s-container mk-process__grid">
        <div className="mk-process__heading">
          <p className="s-eyebrow">Quy trình triển khai</p>
          <h2 className="mk-section-title" id="svc-process">Một chu kỳ <em>marketing</em></h2>
        </div>
        <ol className="mk-process__steps">
          {steps.map((step, index) => (
            <li key={index}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const PROBLEM_CARDS = [
  { icon: CalendarDays, title: 'Nội dung thiếu nhất quán', image: '/assets/marketing/content-calendar.webp', target: 'chien-luoc', link: 'Lập kế hoạch nội dung' },
  { icon: BarChart3, title: 'Chưa rõ khách đến từ đâu', image: '/assets/marketing/attribution.webp', target: 'do-luong', link: 'Xem cách đo lường' },
  { icon: Camera, title: 'Thiếu ảnh và video thật', image: '/assets/marketing/photo-video.webp', target: 'noi-dung', link: 'Xem cách sản xuất nội dung' },
  { icon: KeyRound, title: 'Tài khoản khó kiểm soát', image: '/assets/marketing/account-access.webp', target: 'mk-own', link: 'Xem cam kết bàn giao' }
];

function MarketingProblems({ problems }: { problems: string[] }) {
  if (!problems.length) return null;
  const defaults = SERVICE_SEEDS.marketing.problems ?? [];

  return (
    <section className="mk-problems" id="svc-problems" aria-labelledby="mk-problems-title">
      <div className="s-container">
        <div className="mk-problems__heading">
          <h2 id="mk-problems-title">Marketing đang tốn công <em>mà chưa rõ hiệu quả?</em></h2>
        </div>
        <ul className="mk-problems__grid">
          {problems.map((problem, index) => {
            const card = PROBLEM_CARDS[defaults.indexOf(problem)];
            return (
              <li key={index} className="mk-problem">
                <div className="mk-problem__copy">
                  {card && (
                    <>
                      <card.icon className="mk-problem__icon" aria-hidden="true" />
                      <h3>{card.title}</h3>
                    </>
                  )}
                  <p>{problem}</p>
                  {card && <a href={`#${card.target}`}>{card.link}<ArrowUpRight aria-hidden="true" /></a>}
                </div>
                {card && <MarketingProblemArt image={card.image} />}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function MarketingHeroGallery() {
  return (
    <figure className="mk-gallery">
      <div className="mk-gallery__frame mk-gallery__frame--left" aria-hidden="true">
        <img src="/assets/marketing/hero-on-location.webp" alt="" width={600} height={750} decoding="async" />
      </div>
      <div className="mk-gallery__frame mk-gallery__frame--right" aria-hidden="true">
        <img src="/assets/marketing/hero-interview.webp" alt="" width={600} height={750} decoding="async" />
      </div>
      <div className="mk-gallery__frame mk-gallery__frame--main">
        <img src="/assets/marketing/hero-team-session.webp" alt="Buổi làm việc của đội ngũ với thiết bị ghi hình tại phòng họp" width={1280} height={800} fetchPriority="high" />
      </div>
    </figure>
  );
}

export function MarketingPage({ service, data }: { service: Service; data: SiteData }) {
  const contactHref = contactHrefFor(service);
  const posts = postsForService(data, service.id, 3);
  const projects = projectsForService(data, service.id);
  const subs = publishedSubServices(data, service.id);

  return (
    <main id="main" className="mk">
      <section className="mk-hero" aria-labelledby="mk-title">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
          <div className="mk-hero__grid">
            <div className="mk-hero__copy">
              <h1 className="mk-hero__title" id="mk-title">Marketing <em>&amp; Truyền thông</em></h1>
              <p className="mk-hero__lead">{service.heroLead || service.description}</p>
              <div className="s-row mk-hero__actions">
                <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Nhận tư vấn marketing<ArrowUpRight aria-hidden="true" /></Link>
                <a className="mk-hero__projects" href="#mk-work-title">Xem dự án <ArrowDown aria-hidden="true" /></a>
              </div>
              {!!service.audience?.length && (
                <ul className="mk-hero__audience" aria-label="Phù hợp với">
                  {service.audience.map(a => <li key={a}>{a}</li>)}
                </ul>
              )}
            </div>
            <MarketingHeroGallery />
          </div>
          <nav className="mk-nav" aria-label="Các hạng mục Marketing & Truyền thông">
            <ul>
              {MARKETING_STAGES.map(p => (
                <li key={p.id}>
                  <a href={`#${p.id}`}>
                    <p.icon aria-hidden="true" />
                    <span>{p.title}</span>
                    <ArrowDown aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <MarketingProblems problems={service.problems || []} />

      <MarketingScope />

      <section className="mk-content" id="san-xuat-tai-hien-truong" aria-labelledby="mk-content-title">
        <div className="s-container mk-content__grid">
          <div className="mk-content__copy">
            <p className="s-eyebrow">Sản xuất tại hiện trường</p>
            <h2 className="mk-section-title" id="mk-content-title">Hình ảnh từ chính <em>hoạt động của bạn</em></h2>
            <p className="s-text">DANAVA ghi lại không gian, con người và hoạt động của doanh nghiệp, rồi biên tập thành nội dung nhất quán với nhận diện thương hiệu.</p>
            <ul className="mk-content__formats">
              {FIELD_WORK.map(item => <li key={item.label}><item.icon aria-hidden="true" />{item.label}</li>)}
            </ul>
            <a className="mk-content__jump" href="#mk-work-title">Xem dự án thực tế <ArrowDown aria-hidden="true" /></a>
          </div>
          <div className="mk-content__visual">
            <MarketingFieldPreview />
            <img className="mk-content__detail" src="/assets/marketing/field-behind-the-scenes.webp" alt="Hậu trường buổi ghi hình tại Núi Đỏ" width={630} height={840} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <MarketingProjects projects={projects} />

      <section className="mk-ownership" aria-labelledby="mk-own">
        <div className="s-container">
          <div className="mk-head">
            <p className="s-eyebrow"><KeyRound aria-hidden="true" />Cam kết</p>
            <h2 className="mk-section-title" id="mk-own">Kênh và dữ liệu <em>luôn thuộc về bạn</em></h2>
          </div>
          <div className="mk-ownership__grid">
            {OWNERSHIP.map(o => (
              <div key={o.title}>
                <o.icon aria-hidden="true" /><h3>{o.title}</h3><p>{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingProcess steps={service.process || []} />
      {subs.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="mk-subs">
          <div className="s-container">
            <h2 className="s-h3" id="mk-subs">Dịch vụ theo kênh</h2>
            <ul className="u-linklist">{subs.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}>{s.title}</Link></li>)}</ul>
          </div>
        </section>
      )}
      <RelatedPosts posts={posts} data={data} title="Bài viết về Marketing & Truyền thông" soft />
      {(service.pricing?.trim() || !!service.faqs?.length) && (
        <div className="mk-help">
          <PricingSection pricing={service.pricing || ''} contactHref={contactHref} />
          <FaqSection faqs={service.faqs || []} contactHref={contactHref} rec={{ base: `rec.services.${service.id}`, label: `Hồ sơ ${service.title}` }} />
        </div>
      )}
      <section className="mk-finale" aria-labelledby="mk-finale-title">
        <div className="s-container">
          <div className="mk-finale__panel">
            <h2 className="mk-section-title" id="mk-finale-title">Lập kế hoạch marketing <em>cho quý tới</em></h2>
            <p>Chia sẻ mục tiêu và các kênh bạn đang dùng. DANAVA sẽ đề xuất phạm vi phù hợp với đội ngũ và ngân sách.</p>
            <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Nhận tư vấn marketing <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
