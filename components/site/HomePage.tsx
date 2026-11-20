/**
 * Trang chủ (server component) — gọn theo câu hỏi của khách: làm cùng ai → làm được gì → làm thật chưa →
 * làm thế nào → công ty là ai → liên hệ. Hồ sơ chi tiết (giá trị, ESG, câu chuyện, đội ngũ) ở /ve-danava/ và /doi-ngu/;
 * nội dung lấy từ danava.vn/about vẫn giữ ở lib/about-danava.ts.
 * Hero ảnh văn phòng → Đã đồng hành cùng → 01 Làm được gì → 02 Sản phẩm & dự án → 03 Quy trình → 04 Về DANAVA →
 * (Nhận xét) → Blogs → 05 Liên hệ.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { getApprovedSocialPosts, isPlatformSourced } from '@/lib/social-feed';
import { defaultPresentation } from '@/lib/presentation';
import { showcaseFor, splitFeatured, knowledgePosts, publicPartners, publicTestimonials, publishedProjects, serviceHref, sortServices, projectHref } from '@/lib/site-queries';
import { CONTACT, formatPhone, formatDate } from './catalog';
import { CheckList } from './ui';
import { StudioShowcase } from './StudioShowcase';
import { FeaturedShowcase } from './showcase';
import { StaffAvatar } from './TeamPage';
import { ProjectTile, PostTile, Testimonials, JsonLd, faqLD } from './blocks';
import { SolutionsExplorer, Reveal, CountUp, type SolutionItem } from './HomeClient';
import { block } from '@/lib/blocks';
import { ABOUT_DANAVA as A } from '@/lib/about-danava';
import { markOf } from '@/lib/partner-marks';

const ECO_IMAGES: Record<string, string> = {
  studio: '/assets/presentation/studio-dashboard.webp',
  website: '/assets/portfolio/vinhomes/desktop-hero.webp',
  events: '/assets/profile/set-stage.webp',
  travel: '/assets/legacy/community.webp',
  community: '/assets/legacy/community.webp'
};


function Head({ no, kicker, title, lead, light, center, id }: { no: string; kicker: string; title: React.ReactNode; lead?: string; light?: boolean; center?: boolean; id: string }) {
  return (
    <div className={`hp-head${light ? ' hp-head--light' : ''}${center ? ' hp-head--center' : ''}`} data-reveal>
      {no && <span className="hp-head__no" aria-hidden="true">{no}</span>}
      <div>
        <p className="ha-kicker ha-kicker--dark">{kicker}</p>
        <h2 className="ha-h3" id={id}>{title}</h2>
        {lead && <p className="hp-head__lead">{lead}</p>}
      </div>
    </div>
  );
}

export default function HomePage({ data }: { data: SiteData }) {
  const pres = data.presentation || defaultPresentation;
  const services = sortServices(data.services);
  const studio = services.find(s => s.id === 'studio');
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;
  const co = block(data, 'company');
  const partners = publicPartners(data);
  const testimonials = publicTestimonials(data);
  const projects = (() => {
    const list = publishedProjects(data);
    const featured = list.filter(p => p.featured);
    return (featured.length ? featured : list).slice(0, 3);
  })();
  const webLead = splitFeatured(showcaseFor(data, 'website')).featured[0];
  const posts = knowledgePosts(data).slice(0, 3);
  const social = getApprovedSocialPosts().filter(isPlatformSourced).slice(0, 3);
  const staff = data.staff.filter(p => p.visible).slice(0, 5);
  const solutions: SolutionItem[] = services.map(s => ({
    id: s.id, href: serviceHref(s), title: s.title, description: s.description, items: s.items,
    image: s.image || ECO_IMAGES[s.id] || '/assets/legacy/event-group.webp'
  }));
  const pick = (id: string, i: number) => data.services.find(s => s.id === id)?.faqs?.[i];
  const faqs = [pick('studio', 0), pick('website', 1), pick('events', 0), pick('travel', 1)].filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <main id="main" className="h-home ha hp">
      <Reveal />

      {/* Hero — ảnh văn phòng DANAVA, chữ đè lên ảnh */}
      <section className="hp-hero" aria-labelledby="home-title">
        <div className="hp-hero__bg" aria-hidden="true">
          <img src="/assets/about/office.webp" srcSet="/assets/about/office-sm.webp 1100w, /assets/about/office.webp 2200w" sizes="100vw" alt="" width={2200} height={1650} fetchPriority="high" />
        </div>
        <div className="hp-hero__veil" aria-hidden="true" />
        <span className="hp-orb hp-orb--a" aria-hidden="true" /><span className="hp-orb hp-orb--b" aria-hidden="true" /><span className="hp-orb hp-orb--c" aria-hidden="true" />
        <div className="s-container hp-hero__grid">
          <div className="hp-hero__copy">
            <p className="ha-kicker">DANAVA Solutions · Company Profile 2026</p>
            <h1 className="hp-hero__title" id="home-title">
              <span className="hp-hero__line">DANAVA Solutions</span>
              <em>Growing Your Business Together.</em>
            </h1>
            {data.heroTitle && <p className="hp-hero__sub">{data.heroTitle}</p>}
            <p className="hp-hero__lead">{A.tagline} — phần mềm, website, sự kiện và cộng đồng trong một đầu mối.</p>
            <div className="hp-hero__cta">
              <Link className="hp-btn hp-btn--sun" href="/lien-he/">Nhận tư vấn <ArrowRight aria-hidden="true" /></Link>
              <Link className="hp-btn hp-btn--ghost" href="/he-sinh-thai/">Khám phá hệ sinh thái</Link>
            </div>
          </div>
          <div className="hp-hero__float" aria-hidden="true">
            <span className="hp-glass hp-glass--a"><b>Từ 2018</b>đồng hành cùng ngành Wellness</span>
            <span className="hp-glass hp-glass--b"><b>1.000+</b>huấn luyện viên kết nối</span>
          </div>
        </div>
        <div className="s-container hp-hero__bottom">
          <dl className="hp-hero__stats">
            {A.stats.map(st => <div key={st.label}><dd><CountUp value={st.value} /></dd><dt>{st.label}</dt></div>)}
          </dl>
          <p className="hp-hero__src">Số liệu trên nền tảng danava.vn, cập nhật {A.checked}.</p>
        </div>
        <div className="hp-marquee" aria-hidden="true">
          {[0, 1].map(k => <ul key={k}>{[...A.fields, ...A.fields].map((f, i) => <li key={i}>{f}<i>✦</i></li>)}</ul>)}
        </div>
        <p className="s-sr">Lĩnh vực: {A.fields.join(', ')}.</p>
      </section>

      {/* Đã đồng hành cùng — điều khách muốn thấy đầu tiên */}
      <section className="hp-trust" id="doi-tac" aria-labelledby="t-trust">
        <div className="s-container hp-trust__head">
          <div>
            <p className="ha-kicker ha-kicker--dark">Đã đồng hành cùng</p>
            <h2 className="ha-h3" id="t-trust"><span className="hp-trust__count"><CountUp value={partners.length} suffix="" /></span> cơ sở & thương hiệu <em>tin chọn DANAVA.</em></h2>
          </div>
          <Link className="h-link" href="/doi-tac/">Xem tất cả đối tác <ArrowRight aria-hidden="true" /></Link>
        </div>
        {partners.length > 0 && (
          <div className="hp-trust__rows">
            {[partners.filter((_, i) => i % 2 === 0), partners.filter((_, i) => i % 2 === 1)].map((row, r) => row.length > 0 && (
              <div key={r} className={`hp-trust__row${r ? ' is-rev' : ''}`}>
                {[0, 1].map(k => (
                  <ul key={k} aria-hidden={k === 1 ? true : undefined}>
                    {row.map(c => {
                      const project = publishedProjects(data).find(p => p.id === c.projectId);
                      const mk = c.logo ? markOf(c.logo) : null;
                      return (
                        <li key={c.id}>
                          <Link href={project ? projectHref(project) : `/doi-tac/#${c.id}`} tabIndex={k === 1 ? -1 : undefined} aria-label={`${c.name}${project ? ' — xem case study' : ' — thông tin đối tác'}`}>
                            <span className={`hp-trust__logo${mk?.fill ? ' is-mark' : ''}`}>{mk ? <img src={mk.src} alt="" loading="lazy" decoding="async" width={96} height={96} /> : <b>{c.name.charAt(0)}</b>}</span>
                            <span className="hp-trust__name"><strong>{c.name}</strong><small>{project ? 'Case study' : c.role}</small></span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 01 · Làm được gì — giải pháp thật của website */}
      <section className="hp-ch hp-alt" id="giai-phap" aria-labelledby="t-eco">
        <div className="s-container">
          <div className="hp-row">
            <Head no="01" kicker="DANAVA làm được gì cho bạn" id="t-eco" title={<>Doanh nghiệp bạn cần gì, <em>DANAVA có lối đi riêng.</em></>} />
            <Link className="h-link" href="/he-sinh-thai/">Xem toàn bộ hệ sinh thái <ArrowRight aria-hidden="true" /></Link>
          </div>
          <SolutionsExplorer items={solutions} />
        </div>
      </section>

      {/* 02 · Sản phẩm chủ lực & dự án thật */}
      <section className="hp-ch hp-dark" id="san-pham" aria-labelledby="t-studio">
        <div className="s-container s-split">
          <div className="s-stack-lg" data-reveal>
            <p className="ha-kicker"><span className="hp-mini-no">02</span> Sản phẩm chủ lực · DANAVA Studio</p>
            <h2 className="ha-title" id="t-studio">
              {pres.technologyTitle.split('\n').map((l, i, all) => <span key={i} style={{ display: 'block' }}>{i === all.length - 1 && all.length > 1 ? <em>{l}</em> : l}</span>)}
            </h2>
            <p className="hp-dark__lead">{pres.technologyDescription}</p>
            {studio && <CheckList items={studio.items} />}
            <div className="hp-hero__cta">
              <Link className="hp-btn hp-btn--sun" href="/lien-he/?service=danava-studio">Đăng ký demo</Link>
              <Link className="hp-btn hp-btn--ghost" href="/giai-phap/danava-studio/">Tìm hiểu DANAVA Studio</Link>
            </div>
          </div>
          <div data-reveal style={{ ['--d' as string]: '120ms' }}><StudioShowcase image={pres.screenImage || defaultPresentation.screenImage} /></div>
        </div>
      </section>
      <section className="hp-ch hp-projects" aria-labelledby="t-projects">
        <div className="s-container">
          <div className="hp-row">
            <div data-reveal><p className="ha-kicker ha-kicker--dark">Dự án tiêu biểu</p><h2 className="ha-h3" id="t-projects">Sản phẩm <em>đang chạy thật.</em></h2></div>
            <Link className="h-link" href="/du-an/">Tất cả dự án <ArrowRight aria-hidden="true" /></Link>
          </div>
          {webLead && <FeaturedShowcase item={webLead} headingLevel="h3" eyebrow="Dự án thiết kế website nổi bật" id="home-featured-web" />}
          {projects.length > 0 && (
            <div className={`s-grid s-snap u-subblock ${projects.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
              {projects.map(p => <ProjectTile key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      <Testimonials items={testimonials} />

      {/* 03 · Quy trình triển khai */}
      <section className="hp-ch" id="quy-trinh" aria-labelledby="t-process">
        <div className="s-container">
          <Head no="03" center kicker="Cách DANAVA triển khai" id="t-process" title={<>Bảy bước, <em>rõ ràng từ đầu đến cuối.</em></>} />
          <ol className="hp-process">
            {A.process.map((p, i) => (
              <li key={p.name} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}>
                <span className="hp-process__dot">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.name}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 · Về DANAVA (rút gọn) — chi tiết ở /ve-danava/ và /doi-ngu/ */}
      <section className="hp-ch hp-alt" id="ve-danava" aria-labelledby="t-about">
        <div className="s-container ha-founder">
          <figure className="ha-founder__photo" data-reveal>
            <img src={A.founder.image} alt={`${A.founder.name}, ${A.founder.title}`} width={1200} height={885} loading="lazy" decoding="async" />
            <figcaption><strong>{A.founder.name}</strong><small>{A.founder.title}</small></figcaption>
          </figure>
          <div className="ha-founder__body" data-reveal>
            <p className="ha-kicker ha-kicker--dark"><span className="hp-mini-no">04</span> Về DANAVA</p>
            <h2 className="s-sr" id="t-about">Về DANAVA</h2>
            <blockquote className="ha-quote"><p>{A.founder.quote}</p></blockquote>
            <p className="hp-about__mission"><b>Sứ mệnh.</b> {A.mission}</p>
            <ul className="hp-about__facts">
              <li><b>Từ 2018</b>đồng hành cùng ngành Wellness</li>
              <li><b>{staff.length}+</b>người trong đội ngũ</li>
              <li><b>{partners.length}</b>đối tác đồng hành</li>
            </ul>
            <div className="hp-about__links">
              <Link className="h-link" href="/ve-danava/">Câu chuyện & hồ sơ công ty <ArrowRight aria-hidden="true" /></Link>
              <Link className="h-link" href="/doi-ngu/">Gặp đội ngũ <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs */}
      {posts.length > 0 && (
        <section className="hp-ch" aria-labelledby="home-news">
          <div className="s-container">
            <div className="hp-row">
              <div data-reveal><p className="ha-kicker ha-kicker--dark">Blogs</p><h2 className="ha-h3" id="home-news">Bài viết mới <em>từ DANAVA.</em></h2></div>
              <Link className="h-link" href="/kien-thuc/">Xem tất cả Blogs <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={`s-grid s-snap ${posts.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>{posts.map(p => <PostTile key={p.id} post={p} data={data} />)}</div>
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

      {/* 05 · Liên hệ & hợp tác */}
      <section className="hp-ch hp-contact" id="lien-he-nhanh" aria-labelledby="home-faq">
        {faqs.length > 0 && <JsonLd value={faqLD(faqs)} />}
        <div className="s-container u-faq-contact">
          <div>
            <p className="ha-kicker ha-kicker--dark"><span className="hp-mini-no">05</span> Liên hệ & hợp tác</p>
            <h2 className="ha-h3" id="home-faq">Trước khi <em>bắt đầu.</em></h2>
            <div className="s-faq">
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>{f.q}<ChevronDown aria-hidden="true" /></summary>
                  <div>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
          <aside className="u-contact-card hp-contact__card" aria-labelledby="home-contact">
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
              <li><MapPin aria-hidden="true" /><a href={co.mapUrl} target="_blank" rel="noopener">{co.address}</a></li>
              <li><Clock aria-hidden="true" /><span>{co.hours}</span></li>
            </ul>
          </aside>
        </div>
        <div className="s-container"><p className="ha-company">{A.company}</p></div>
      </section>
    </main>
  );
}
