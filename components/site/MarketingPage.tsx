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
import { cmsText, ct } from './cms';
import { rich } from './rich';

type Opts = { rich?: boolean; multiline?: boolean };
/** Chữ cố định sửa được (lib/site-text.ts) — khóa marketing.* */
const mt = (data: SiteData, k: string, def: string, label: string, opts: Opts = {}) => ct(data, `marketing.${k}`, def, label, opts);
const recAttr = (path: string, label: string, scopeLabel: string, multiline = false) => cmsText(`rec.${path}`, label, { scope: 'record', scopeLabel, ...(multiline ? { multiline: true } : {}) });

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

function MarketingProjects({ projects, data }: { projects: Project[]; data: SiteData }) {
  const [lead, ...rest] = [...projects.filter(p => p.featured), ...projects.filter(p => !p.featured)];
  const title = mt(data, 'work.title', 'Dự án *đã thực hiện*', 'Tiêu đề', { rich: true });
  const all = mt(data, 'work.all', 'Tất cả dự án', 'Chữ liên kết tất cả dự án');
  const partner = mt(data, 'work.partner', 'Hỗ trợ qua đối tác', 'Nhãn hỗ trợ qua đối tác');
  const fanpage = mt(data, 'work.fanpage', 'Xem Fanpage', 'Chữ liên kết Fanpage');
  const maps = mt(data, 'work.maps', 'Xem địa điểm trên Google Maps', 'Chữ liên kết Google Maps');
  const cases = mt(data, 'work.cases.title', 'Hồ sơ dự án chi tiết', 'Tiêu đề hồ sơ dự án');

  return (
    <section className="mk-work" id="du-an-marketing" aria-labelledby="mk-work-title">
      <div className="s-container">
        <div className="mk-work__heading">
          <h2 className="mk-section-title" id="mk-work-title" tabIndex={-1} {...title.a}>{rich(title.v)}</h2>
          <Link className="s-link" href="/du-an/"><span {...all.a}>{all.v}</span> <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <div className="mk-engagements">
          {MARKETING_ENGAGEMENTS.map(item => {
            const k = (f: string) => `work.items.${item.id}.${f}`;
            const client = mt(data, k('client'), item.client, 'Tên khách hàng');
            const etitle = mt(data, k('title'), item.title, 'Tên hạng mục');
            const web = item.websiteWork ? mt(data, k('website-work'), item.websiteWork, 'Chữ liên kết website') : null;
            return (
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
                      <a className="mk-engagement__logo" href={item.website || item.fanpage} aria-label={`Trang của ${client.v}`}>
                        <img src={item.logo} alt="" loading="lazy" decoding="async" />
                      </a>
                    ) : <span className="mk-engagement__logo"><img src={item.logo} alt="" loading="lazy" decoding="async" /></span>
                  )}
                  <div>
                    <h3 id={`mk-engagement-${item.id}`} {...client.a}>{client.v}</h3>
                    {item.throughPartner && <p className="mk-engagement__relation" {...partner.a}>{partner.v}</p>}
                  </div>
                </div>
                <p className="mk-engagement__title" {...etitle.a}>{etitle.v}</p>
                <ul aria-label="Phạm vi Marketing & Truyền thông">
                  {item.scope.map((detail, i) => { const d = mt(data, k(`scope.${i}`), detail, 'Hạng mục thực hiện'); return <li key={detail}><Check aria-hidden="true" /><span {...d.a}>{d.v}</span></li>; })}
                </ul>
                {(item.websiteWork || item.fanpage || item.maps) && (
                  <div className="mk-engagement__links">
                    {web && <Link className="mk-engagement__website" href={item.websiteProjectHref || '/giai-phap/thiet-ke-website/'}><span {...web.a}>{web.v}</span> <ArrowUpRight aria-hidden="true" /></Link>}
                    {item.fanpage && <a className="mk-engagement__website" href={item.fanpage} aria-label={`${fanpage.v} ${client.v}`}><span {...fanpage.a}>{fanpage.v}</span> <ArrowUpRight aria-hidden="true" /></a>}
                    {item.maps && <a className="mk-engagement__website" href={item.maps}><span {...maps.a}>{maps.v}</span> <ArrowUpRight aria-hidden="true" /></a>}
                  </div>
                )}
              </div>
            </article>
            );
          })}
        </div>
        {lead && (
          <section className="mk-work__published" aria-labelledby="mk-case-studies-title">
            <h3 id="mk-case-studies-title" {...cases.a}>{cases.v}</h3>
            <div className="mk-work__grid">
              <MarketingProjectCard project={lead} data={data} featured />
              {rest.map(project => <MarketingProjectCard key={project.id} project={project} data={data} />)}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function MarketingProjectCard({ project, data, featured = false }: { project: Project; data: SiteData; featured?: boolean }) {
  const cover = project.image || project.gallery?.find(image => image.src)?.src;
  // Giữ vị trí gốc trong hồ sơ dự án để khóa chỉnh trỏ đúng mục
  const scope = (project.scope || []).map((item, i) => ({ item, i })).filter(x => x.item.trim()).slice(0, 3);
  const r = (f: string, label: string) => recAttr(`projects.${project.id}.${f}`, label, 'Hồ sơ dự án');
  const view = mt(data, 'work.view', 'Xem dự án', 'Chữ liên kết xem dự án');

  return (
    <article className={`mk-project${featured ? ' mk-project--featured' : ''}${cover ? ' mk-project--has-image' : ''}`}>
      {cover && <img className="mk-project__cover" src={cover} alt="" loading="lazy" decoding="async" />}
      <div className="mk-project__body">
        {project.client && <p className="mk-project__client" {...r('client', 'Khách hàng')}>{project.client}</p>}
        <h3 {...r('title', 'Tên dự án')}>{project.title}</h3>
        {project.summary && <p className="mk-project__summary">{excerpt(project.summary, 200)}</p>}
        {scope.length > 0 && <ul className="mk-project__scope" aria-label="Phạm vi thực hiện">{scope.map(({ item, i }) => <li key={i} {...r(`scope.${i}`, 'Hạng mục dự án')}>{item}</li>)}</ul>}
        <Link className="mk-project__link" href={projectHref(project)} aria-label={`${view.v} ${project.title}`}><span {...view.a}>{view.v}</span> <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </article>
  );
}

function MarketingProcess({ steps, data, service }: { steps: Feature[]; data: SiteData; service: Service }) {
  if (!steps.length) return null;
  const eyebrow = mt(data, 'process.eyebrow', 'Quy trình triển khai', 'Dòng chữ nhỏ');
  const title = mt(data, 'process.title', 'Một chu kỳ *marketing*', 'Tiêu đề', { rich: true });
  const r = (f: string, label: string, multiline = false) => recAttr(`services.${service.id}.process.${f}`, label, `Hồ sơ ${service.title}`, multiline);

  return (
    <section className="mk-process" aria-labelledby="svc-process">
      <div className="s-container mk-process__grid">
        <div className="mk-process__heading">
          <p className="s-eyebrow" {...eyebrow.a}>{eyebrow.v}</p>
          <h2 className="mk-section-title" id="svc-process" {...title.a}>{rich(title.v)}</h2>
        </div>
        <ol className="mk-process__steps">
          {steps.map((step, index) => (
            <li key={index}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3 {...r(`${index}.title`, 'Tên bước')}>{step.title}</h3><p {...r(`${index}.text`, 'Mô tả bước', true)}>{step.text}</p></div>
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

function MarketingProblems({ problems, data, service }: { problems: string[]; data: SiteData; service: Service }) {
  if (!problems.length) return null;
  const defaults = SERVICE_SEEDS.marketing.problems ?? [];
  const title = mt(data, 'problems.title', 'Marketing đang tốn công *mà chưa rõ hiệu quả?*', 'Tiêu đề', { rich: true });

  return (
    <section className="mk-problems" id="svc-problems" aria-labelledby="mk-problems-title">
      <div className="s-container">
        <div className="mk-problems__heading">
          <h2 id="mk-problems-title" {...title.a}>{rich(title.v)}</h2>
        </div>
        <ul className="mk-problems__grid">
          {problems.map((problem, index) => {
            // Khớp theo chữ gốc; chữ đã sửa hoặc đang xem bản dịch → theo thứ tự (thẻ không biến mất)
            const found = defaults.indexOf(problem);
            const ci = found >= 0 ? found : index;
            const card = PROBLEM_CARDS[ci];
            const ctitle = mt(data, `problems.cards.${ci}.title`, card?.title || '', 'Tiêu đề thẻ');
            const clink = mt(data, `problems.cards.${ci}.link`, card?.link || '', 'Chữ liên kết thẻ');
            return (
              <li key={index} className="mk-problem">
                <div className="mk-problem__copy">
                  {card && (
                    <>
                      <card.icon className="mk-problem__icon" aria-hidden="true" />
                      <h3 {...ctitle.a}>{ctitle.v}</h3>
                    </>
                  )}
                  <p {...recAttr(`services.${service.id}.problems.${index}`, 'Vấn đề', `Hồ sơ ${service.title}`, true)}>{problem}</p>
                  {card && <a href={`#${card.target}`}><span {...clink.a}>{clink.v}</span><ArrowUpRight aria-hidden="true" /></a>}
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
  const svc = `Hồ sơ ${service.title}`;
  const heroTitle = mt(data, 'hero.title', 'Marketing *& Truyền thông*', 'Tiêu đề', { rich: true });
  const consult = mt(data, 'cta.consult', 'Nhận tư vấn marketing', 'Nút nhận tư vấn');
  const heroProjects = mt(data, 'hero.projects', 'Xem dự án', 'Chữ liên kết xem dự án');
  const fieldK = mt(data, 'field.eyebrow', 'Sản xuất tại hiện trường', 'Dòng chữ nhỏ');
  const fieldT = mt(data, 'field.title', 'Hình ảnh từ chính *hoạt động của bạn*', 'Tiêu đề', { rich: true });
  const fieldL = mt(data, 'field.lead', 'DANAVA ghi lại không gian, con người và hoạt động của doanh nghiệp, rồi biên tập thành nội dung nhất quán với nhận diện thương hiệu.', 'Câu dẫn', { multiline: true });
  const fieldJump = mt(data, 'field.jump', 'Xem dự án thực tế', 'Chữ liên kết dự án thực tế');
  const ownK = mt(data, 'ownership.eyebrow', 'Cam kết', 'Dòng chữ nhỏ');
  const ownT = mt(data, 'ownership.title', 'Kênh và dữ liệu *luôn thuộc về bạn*', 'Tiêu đề', { rich: true });
  const subsT = mt(data, 'subs.title', 'Dịch vụ theo kênh', 'Tiêu đề dịch vụ theo kênh');
  const finT = mt(data, 'finale.title', 'Lập kế hoạch marketing *cho quý tới*', 'Tiêu đề', { rich: true });
  const finL = mt(data, 'finale.lead', 'Chia sẻ mục tiêu và các kênh bạn đang dùng. DANAVA sẽ đề xuất phạm vi phù hợp với đội ngũ và ngân sách.', 'Câu dẫn', { multiline: true });

  return (
    <main id="main" className="mk">
      <section className="mk-hero" aria-labelledby="mk-title">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
          <div className="mk-hero__grid">
            <div className="mk-hero__copy">
              <h1 className="mk-hero__title" id="mk-title" {...heroTitle.a}>{rich(heroTitle.v)}</h1>
              <p className="mk-hero__lead" {...recAttr(`services.${service.id}.${service.heroLead ? 'heroLead' : 'description'}`, 'Câu dẫn sản phẩm', svc, true)}>{service.heroLead || service.description}</p>
              <div className="s-row mk-hero__actions">
                <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}><span {...consult.a}>{consult.v}</span><ArrowUpRight aria-hidden="true" /></Link>
                <a className="mk-hero__projects" href="#mk-work-title"><span {...heroProjects.a}>{heroProjects.v}</span> <ArrowDown aria-hidden="true" /></a>
              </div>
              {!!service.audience?.length && (
                <ul className="mk-hero__audience" aria-label="Phù hợp với">
                  {service.audience.map((a, i) => <li key={a} {...recAttr(`services.${service.id}.audience.${i}`, 'Đối tượng phù hợp', svc)}>{a}</li>)}
                </ul>
              )}
            </div>
            <MarketingHeroGallery />
          </div>
          <nav className="mk-nav" aria-label="Các hạng mục Marketing & Truyền thông">
            <ul>
              {MARKETING_STAGES.map(p => { const st = mt(data, `stages.${p.id}.title`, p.title, 'Tên hạng mục'); return (
                <li key={p.id}>
                  <a href={`#${p.id}`}>
                    <p.icon aria-hidden="true" />
                    <span {...st.a}>{st.v}</span>
                    <ArrowDown aria-hidden="true" />
                  </a>
                </li>
              ); })}
            </ul>
          </nav>
        </div>
      </section>

      <MarketingProblems problems={service.problems || []} data={data} service={service} />

      <MarketingScope />

      <section className="mk-content" id="san-xuat-tai-hien-truong" aria-labelledby="mk-content-title">
        <div className="s-container mk-content__grid">
          <div className="mk-content__copy">
            <p className="s-eyebrow" {...fieldK.a}>{fieldK.v}</p>
            <h2 className="mk-section-title" id="mk-content-title" {...fieldT.a}>{rich(fieldT.v)}</h2>
            <p className="s-text" {...fieldL.a}>{fieldL.v}</p>
            <ul className="mk-content__formats">
              {FIELD_WORK.map((item, i) => { const x = mt(data, `field.formats.${i}`, item.label, 'Loại nội dung'); return <li key={item.label}><item.icon aria-hidden="true" /><span {...x.a}>{x.v}</span></li>; })}
            </ul>
            <a className="mk-content__jump" href="#mk-work-title"><span {...fieldJump.a}>{fieldJump.v}</span> <ArrowDown aria-hidden="true" /></a>
          </div>
          <div className="mk-content__visual">
            <MarketingFieldPreview />
            <img className="mk-content__detail" src="/assets/marketing/field-behind-the-scenes.webp" alt="Hậu trường buổi ghi hình tại Núi Đỏ" width={630} height={840} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <MarketingProjects projects={projects} data={data} />

      <section className="mk-ownership" aria-labelledby="mk-own">
        <div className="s-container">
          <div className="mk-head">
            <p className="s-eyebrow"><KeyRound aria-hidden="true" /><span {...ownK.a}>{ownK.v}</span></p>
            <h2 className="mk-section-title" id="mk-own" {...ownT.a}>{rich(ownT.v)}</h2>
          </div>
          <div className="mk-ownership__grid">
            {OWNERSHIP.map((o, i) => {
              const ot = mt(data, `ownership.items.${i}.title`, o.title, 'Tiêu đề cam kết');
              const ox = mt(data, `ownership.items.${i}.text`, o.text, 'Mô tả cam kết', { multiline: true });
              return (
                <div key={o.title}>
                  <o.icon aria-hidden="true" /><h3 {...ot.a}>{ot.v}</h3><p {...ox.a}>{ox.v}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <MarketingProcess steps={service.process || []} data={data} service={service} />
      {subs.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="mk-subs">
          <div className="s-container">
            <h2 className="s-h3" id="mk-subs" {...subsT.a}>{subsT.v}</h2>
            <ul className="u-linklist">{subs.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}><span {...recAttr(`subServices.${s.id}.title`, 'Tên dịch vụ con', `Hồ sơ ${s.title}`)}>{s.title}</span></Link></li>)}</ul>
          </div>
        </section>
      )}
      <RelatedPosts posts={posts} data={data} title="Bài viết về Marketing & Truyền thông" soft />
      {(service.pricing?.trim() || !!service.faqs?.length) && (
        <div className="mk-help">
          <PricingSection pricing={service.pricing || ''} contactHref={contactHref} />
          <FaqSection faqs={service.faqs || []} contactHref={contactHref} rec={{ base: `rec.services.${service.id}`, label: svc }} />
        </div>
      )}
      <section className="mk-finale" aria-labelledby="mk-finale-title">
        <div className="s-container">
          <div className="mk-finale__panel">
            <h2 className="mk-section-title" id="mk-finale-title" {...finT.a}>{rich(finT.v)}</h2>
            <p {...finL.a}>{finL.v}</p>
            <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}><span {...consult.a}>{consult.v}</span> <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
