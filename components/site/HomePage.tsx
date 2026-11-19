/**
 * Trang chủ (server component). Thứ tự theo hành trình của khách hàng doanh nghiệp:
 *  1 Hero định vị + CTA → 2 Khách hàng tiêu biểu → 3 Giải pháp chính → 4 DANAVA Studio →
 *  5 Dự án/case study → 6 Lý do chọn DANAVA → 7 Quy trình hợp tác → 8 Giới thiệu & đội ngũ →
 *  9 Kiến thức hữu ích → 10 FAQ & liên hệ.
 * Phần kể chuyện đầy đủ (mục tiêu, hành trình, khoảnh khắc) nằm ở /ve-danava/.
 * Khối bằng chứng (khách hàng, nhận xét, số liệu) chỉ hiện khi có dữ liệu được phép công bố trong CMS.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown, Cpu, Megaphone, PartyPopper, Phone, Mail, MapPin, Clock, MessageCircle, Compass, BarChart3, KeyRound, Infinity as InfinityIcon } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { company } from '@/lib/company';
import { getApprovedSocialPosts, isPlatformSourced } from '@/lib/social-feed';
import { defaultPresentation } from '@/lib/presentation';
import { showcaseFor, splitFeatured, knowledgePosts, publicClients, publicTestimonials, publishedProjects, serviceHref, sortServices, visibleMetrics, projectHref } from '@/lib/site-queries';
import { CONTACT, formatPhone, formatDate } from './catalog';
import { CheckList, IconTile } from './ui';
import { StudioShowcase } from './StudioShowcase';
import { FeaturedShowcase, ShowcaseStrip } from './showcase';
import { StaffAvatar } from './TeamPage';
import { ProjectTile, PostTile, Testimonials, JsonLd, faqLD } from './blocks';
import { HeroSlides, SolutionsExplorer, Reveal, type SolutionItem } from './HomeClient';
import { PRINCIPLES, COLLAB_STEPS } from './company-content';

const PF = '/assets/profile/';

const SLIDES = [
  { src: `${PF}set-stage.webp`, caption: 'Đạo cụ phim trường · Nhà hát Trưng Vương' },
  { src: `${PF}lutech-4.webp`, caption: 'LUTECH · Kỷ niệm 4 năm “Tap to TOP”' },
  { src: `${PF}everlastify-1.webp`, caption: 'EVERLASTIFY · Trang trí thương hiệu theo chủ đề' },
  { src: '/assets/legacy/community.webp', caption: 'Cộng đồng yoga · Đà Nẵng' }
];

const PILLARS = [
  { icon: Cpu, title: 'Công nghệ', text: 'Phần mềm DANAVA Studio, website & landing page.', href: '/giai-phap/danava-studio/' },
  { icon: Megaphone, title: 'Marketing', text: 'Chiến lược, nội dung, Fanpage, quảng cáo, đo lường.', href: '/giai-phap/digital-marketing/' },
  { icon: PartyPopper, title: 'Sự kiện', text: 'Sân khấu, không gian thương hiệu, truyền thông sự kiện.', href: '/giai-phap/su-kien-truyen-thong/' }
];

const ECO_IMAGES: Record<string, string> = {
  studio: '/assets/presentation/studio-dashboard.webp',
  website: '/assets/portfolio/vinhomes/desktop-hero.webp',
  marketing: '/assets/legacy/event-session.webp',
  events: `${PF}set-stage.webp`,
  travel: '/assets/legacy/community.webp',
  community: '/assets/legacy/community.webp'
};

const PRINCIPLE_ICONS = { field: Compass, transparent: BarChart3, ownership: KeyRound, longterm: InfinityIcon } as const;
const PRINCIPLE_TONES = { field: 'blue', transparent: 'orange', ownership: 'sky', longterm: 'green' } as const;

export default function HomePage({ data }: { data: SiteData }) {
  const pres = data.presentation || defaultPresentation;
  const services = sortServices(data.services);
  const studio = services.find(s => s.id === 'studio');
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;

  const clients = publicClients(data);
  const metrics = visibleMetrics(data);
  const testimonials = publicTestimonials(data);
  const projects = (() => {
    const list = publishedProjects(data);
    const featured = list.filter(p => p.featured);
    return (featured.length ? featured : list).slice(0, 3);
  })();
  const web = splitFeatured(showcaseFor(data, 'website'));
  const webLead = web.featured[0];
  const webMore = [...web.featured.slice(1), ...web.rest].slice(0, 4);
  const posts = knowledgePosts(data).slice(0, 3);
  const social = getApprovedSocialPosts().filter(isPlatformSourced).slice(0, 3);
  const staff = data.staff.filter(p => p.visible).slice(0, 5);

  const solutions: SolutionItem[] = services.map(s => ({
    id: s.id, href: serviceHref(s), title: s.title, description: s.description, items: s.items,
    image: s.image || ECO_IMAGES[s.id] || '/assets/legacy/event-group.webp'
  }));

  // FAQ trang chủ: tái sử dụng câu hỏi đã có ở từng dịch vụ.
  const pick = (id: string, i: number) => data.services.find(s => s.id === id)?.faqs?.[i];
  const faqs = [pick('studio', 0), pick('website', 1), pick('marketing', 2), pick('travel', 1)].filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <main id="main" className="h-home">
      <Reveal />

      {/* 1 · Hero */}
      <section className="h-hero" aria-labelledby="home-title">
        <HeroSlides slides={SLIDES} />
        <div className="h-hero__shade" aria-hidden="true" />
        <div className="s-container h-hero__inner">
          <p className="h-hero__eyebrow">DANAVA Solutions · Đà Nẵng · Từ 2021</p>
          <h1 className="h-hero__title u-hero-title" id="home-title">{data.heroTitle}</h1>
          <p className="u-hero-brand">{data.headline || 'Cùng bạn phát triển.'}</p>
          <p className="h-hero__lead">Phần mềm quản lý DANAVA Studio cho Gym, Yoga, Pilates, Spa; thiết kế website; marketing và tổ chức sự kiện. Một đầu mối cho công nghệ, truyền thông và trải nghiệm khách hàng.</p>
          <div className="h-hero__cta">
            <Link className="s-btn s-btn--primary s-btn--lg" href="/lien-he/">Nhận tư vấn</Link>
            <a className="s-btn s-btn--lg h-btn-glass" href="#giai-phap">Xem giải pháp <ChevronDown aria-hidden="true" /></a>
          </div>
          <ul className="h-hero__pillars">
            {PILLARS.map(p => (
              <li key={p.title}>
                <Link href={p.href} className="h-pillar">
                  <span className="h-pillar__icon"><p.icon aria-hidden="true" /></span>
                  <span><strong>{p.title}</strong><small>{p.text}</small></span>
                  <ArrowUpRight className="h-pillar__go" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2 · Khách hàng tiêu biểu (chỉ dữ liệu được phép công bố) */}
      {(clients.length > 0 || metrics.length > 0) && (
        <section className="u-proof" aria-labelledby="home-clients">
          <div className="s-container u-proof__inner">
            <h2 className="u-proof__title" id="home-clients">Khách hàng đang vận hành cùng DANAVA</h2>
            {clients.length > 0 && (
              <ul className="u-proof__clients">
                {clients.map(c => {
                  const project = publishedProjects(data).find(p => p.id === c.projectId);
                  const inner = c.logo
                    ? <img src={c.logo} alt={c.name} height={40} width={140} loading="lazy" />
                    : <span className="u-proof__name">{c.name}</span>;
                  return (
                    <li key={c.id}>
                      {project ? <Link href={projectHref(project)} title={`Case study ${c.name}`}>{inner}<small>Xem case study <ArrowRight aria-hidden="true" /></small></Link> : inner}
                    </li>
                  );
                })}
              </ul>
            )}
            {metrics.length > 0 && (
              <dl className="u-proof__metrics">
                {metrics.map(m => <div key={m.id}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}
              </dl>
            )}
          </div>
        </section>
      )}

      {/* 3 · Giải pháp chính */}
      <section className="h-sec h-sec--cream" id="giai-phap" aria-labelledby="home-eco">
        <div className="s-container">
          <div className="h-eco__head u-head-row" data-reveal>
            <div>
              <p className="h-chapter">Giải pháp</p>
              <h2 className="h-title" id="home-eco">Doanh nghiệp bạn cần gì, <em>DANAVA có lối đi riêng.</em></h2>
            </div>
            <Link className="h-link" href="/giai-phap/">Tất cả giải pháp <ArrowRight aria-hidden="true" /></Link>
          </div>
          <SolutionsExplorer items={solutions} />
        </div>
      </section>

      {/* 4 · Sản phẩm chủ lực */}
      <section className="s-section s-section--brand h-flag" aria-labelledby="home-studio">
        <div className="s-container s-split">
          <div className="s-stack-lg" data-reveal>
            <div className="s-heading">
              <p className="h-chapter h-chapter--light">Sản phẩm chủ lực · DANAVA Studio</p>
              <h2 className="h-title h-title--light" id="home-studio">
                {pres.technologyTitle.split('\n').map((l, i, all) => (
                  <span key={i} style={{ display: 'block' }}>{i === all.length - 1 && all.length > 1 ? <em>{l}</em> : l}</span>
                ))}
              </h2>
              <p className="s-lead">{pres.technologyDescription}</p>
            </div>
            {studio && <CheckList items={studio.items} />}
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href="/lien-he/?service=danava-studio">Đăng ký demo</Link>
              <Link className="s-btn s-btn--secondary s-btn--lg" href="/giai-phap/danava-studio/">Tìm hiểu DANAVA Studio</Link>
            </div>
          </div>
          <div data-reveal style={{ ['--d' as string]: '120ms' }}>
            <StudioShowcase image={pres.screenImage || defaultPresentation.screenImage} />
          </div>
        </div>
      </section>

      {/* 5 · Dự án tiêu biểu — dự án website nổi bật đứng đầu, sau đó case study và sản phẩm khác */}
      <section className="s-section s-section--soft h-portfolio" aria-labelledby="home-projects">
        <div className="s-container">
          <div className="u-head-row s-mb">
            <div className="s-heading">
              <p className="s-eyebrow">Dự án tiêu biểu</p>
              <h2 className="s-h2" id="home-projects">Sản phẩm <span className="s-hl">đang chạy thật</span></h2>
            </div>
            <Link className="s-link" href="/du-an/">Tất cả dự án <ArrowRight aria-hidden="true" /></Link>
          </div>
          {webLead && <FeaturedShowcase item={webLead} headingLevel="h3" eyebrow="Dự án thiết kế website nổi bật" id="home-featured-web" />}
          {projects.length > 0 && (
            <div className="u-subblock">
              <div className="u-head-row">
                <h3 className="s-h4">Case study DANAVA Studio</h3>
                <Link className="s-link" href="/giai-phap/danava-studio/">Về DANAVA Studio <ArrowRight aria-hidden="true" /></Link>
              </div>
              <div className={`s-grid s-snap ${projects.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
                {projects.map(p => <ProjectTile key={p.id} p={p} />)}
              </div>
            </div>
          )}
          {webMore.length > 0 && (
            <div className="u-subblock">
              <div className="u-head-row">
                <h3 className="s-h4">Website & nền tảng khác</h3>
                <Link className="s-link" href="/giai-phap/thiet-ke-website/#du-an-web">Xem portfolio website <ArrowRight aria-hidden="true" /></Link>
              </div>
              <ShowcaseStrip items={webMore} />
            </div>
          )}
        </div>
      </section>

      <Testimonials items={testimonials} />

      {/* 6 · Lý do lựa chọn DANAVA */}
      <section className="s-section" aria-labelledby="home-why">
        <div className="s-container">
          <div className="s-heading s-mb">
            <p className="s-eyebrow">Vì sao chọn DANAVA</p>
            <h2 className="s-h2" id="home-why">Bốn điều <span className="s-hl">chúng tôi luôn giữ</span></h2>
          </div>
          <div className="s-grid s-grid--4 s-tiles">
            {PRINCIPLES.map(p => (
              <div key={p.key} className="s-feature" data-reveal>
                <IconTile icon={PRINCIPLE_ICONS[p.key]} tone={PRINCIPLE_TONES[p.key]} />
                <h3 className="s-feature__title">{p.title}</h3>
                <p className="s-feature__text">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Quy trình hợp tác */}
      <section className="s-section s-section--soft" aria-labelledby="home-process">
        <div className="s-container">
          <div className="s-heading s-center s-mb">
            <p className="s-eyebrow">Quy trình hợp tác</p>
            <h2 className="s-h2" id="home-process">Rõ ràng <span className="s-hl">từ buổi trao đổi đầu tiên</span></h2>
          </div>
          <ol className="s-home-steps s-tiles">
            {COLLAB_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="s-home-steps__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="s-h4">{s.title}</h3>
                <p className="s-text">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 8 · Giới thiệu ngắn & đội ngũ */}
      <section className="h-sec h-sec--cream" aria-labelledby="home-about">
        <div className="s-container s-split s-split--top">
          <div className="s-stack-lg" data-reveal>
            <div>
              <p className="h-chapter">Về DANAVA</p>
              <h2 className="h-title" id="home-about">Cùng bạn phát triển. <em>Công nghệ tạo khả năng, con người tạo giá trị.</em></h2>
            </div>
            <p className="h-body">{company.overview}</p>
            <div className="s-row">
              <Link className="h-link" href="/ve-danava/">Câu chuyện DANAVA <ArrowRight aria-hidden="true" /></Link>
              <Link className="h-link" href="/doi-ngu/">Gặp đội ngũ <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          {staff.length > 0 && (
            <ul className="u-team" data-reveal aria-label="Đội ngũ DANAVA">
              {staff.map(p => (
                <li key={p.id}>
                  <Link href={`/doi-ngu/${p.id}/`}>
                    <StaffAvatar person={p} />
                    <span><strong>{p.name}</strong><small>{p.role}</small></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 9 · Kiến thức hữu ích */}
      {posts.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="home-news">
          <div className="s-container">
            <div className="u-head-row s-mb">
              <div className="s-heading">
                <p className="s-eyebrow">Kiến thức</p>
                <h2 className="s-h2" id="home-news">Kiến thức hữu ích <span className="s-hl">từ DANAVA</span></h2>
              </div>
              <Link className="s-link" href="/kien-thuc/">Xem mục Kiến thức <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={`s-grid s-snap ${posts.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
              {posts.map(p => <PostTile key={p.id} post={p} data={data} />)}
            </div>
            {social.length > 1 && (
              <div className="s-home-social u-subblock">
                <p className="s-home-social__title">Từ kênh chính thức</p>
                {social.map(s => (
                  <a key={s.id} href={s.originalUrl} target="_blank" rel="noopener" className="s-home-social__item">
                    <span className="s-badge s-badge--neutral">{s.platformLabel}</span>
                    <span className="s-home-social__text">{s.title} · {formatDate(s.date)}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 10 · FAQ & liên hệ */}
      <section className="s-section" id="lien-he-nhanh" aria-labelledby="home-faq">
        {faqs.length > 0 && <JsonLd value={faqLD(faqs)} />}
        <div className="s-container u-faq-contact">
          <div>
            <p className="s-eyebrow">Câu hỏi thường gặp</p>
            <h2 className="s-h2" id="home-faq">Trước khi bắt đầu</h2>
            <div className="s-faq">
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>{f.q}<ChevronDown aria-hidden="true" /></summary>
                  <div>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
          <aside className="u-contact-card" aria-labelledby="home-contact">
            <h2 className="s-h3" id="home-contact">Trao đổi với DANAVA</h2>
            <p className="s-text">Gửi yêu cầu, chuyên viên DANAVA liên hệ lại để tìm hiểu nhu cầu và đề xuất phạm vi phù hợp.</p>
            <div className="u-contact-card__actions">
              <Link className="s-btn s-btn--primary s-btn--lg s-btn--block" href="/lien-he/">Nhận tư vấn</Link>
              <Link className="s-btn s-btn--secondary s-btn--lg s-btn--block" href="/lien-he/?service=danava-studio">Đăng ký demo DANAVA Studio</Link>
            </div>
            <ul className="u-contact-card__list">
              <li><Phone aria-hidden="true" /><a href={`tel:${phone}`}>{formatPhone(phone)}</a></li>
              <li><MessageCircle aria-hidden="true" /><a href={`https://zalo.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener">Nhắn Zalo</a></li>
              <li><Mail aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></li>
              <li><MapPin aria-hidden="true" /><a href={CONTACT.mapUrl} target="_blank" rel="noopener">{CONTACT.address}</a></li>
              <li><Clock aria-hidden="true" /><span>{CONTACT.hours}</span></li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}

