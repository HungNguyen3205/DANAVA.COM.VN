/**
 * Trang chủ (server component) — trình bày như hồ sơ công ty tương tác, theo cấu trúc trang danava.vn/about
 * (cùng doanh nghiệp DANAVA; nội dung & số liệu ở lib/about-danava.ts, có ghi nguồn và ngày lấy).
 * Hero + số liệu → thanh mục lục bám → 01 Nhà sáng lập → 02 Sứ mệnh → 03 Hệ sinh thái & giải pháp (dữ liệu thật) →
 * 04 Bài toán → 05 Sản phẩm & dự án (DANAVA Studio, case study thật) → 06 Công nghệ, R&D & ngành → 07 Quy trình →
 * 08 Hiệu quả trước/sau → 09 Giá trị → 10 ESG → 11 Câu chuyện → 12 Đối tác (đối tác thật) → 13 Đội ngũ → 14 Blogs → 15 Liên hệ.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Clock, Compass, Eye, Mail, MapPin, MessageCircle, Phone, X, Cpu, Cloud, BarChart3, ShieldCheck, Leaf, Users, GraduationCap, HeartPulse, Sparkles, Sprout } from 'lucide-react';
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
import { SolutionsExplorer, Reveal, CountUp, ChapterNav, type SolutionItem } from './HomeClient';
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
const TECH_ICONS = [Cpu, Cloud, BarChart3, ShieldCheck];
const ESG_ICONS = [Leaf, Users, GraduationCap, HeartPulse, Sparkles, Sprout];

const CHAPTERS = [
  { id: 'nha-sang-lap', no: '01', label: 'Nhà sáng lập' },
  { id: 'su-menh', no: '02', label: 'Sứ mệnh' },
  { id: 'giai-phap', no: '03', label: 'Hệ sinh thái' },
  { id: 'bai-toan', no: '04', label: 'Bài toán' },
  { id: 'san-pham', no: '05', label: 'Sản phẩm & dự án' },
  { id: 'cong-nghe', no: '06', label: 'Công nghệ & AI' },
  { id: 'quy-trinh', no: '07', label: 'Quy trình' },
  { id: 'hieu-qua', no: '08', label: 'Hiệu quả' },
  { id: 'gia-tri', no: '09', label: 'Giá trị' },
  { id: 'esg', no: '10', label: 'ESG' },
  { id: 'cau-chuyen', no: '11', label: 'Câu chuyện' },
  { id: 'doi-tac', no: '12', label: 'Đối tác' },
  { id: 'doi-ngu', no: '13', label: 'Đội ngũ' },
  { id: 'lien-he-nhanh', no: '14', label: 'Liên hệ' }
];

function Head({ no, kicker, title, lead, light, center, id }: { no: string; kicker: string; title: React.ReactNode; lead?: string; light?: boolean; center?: boolean; id: string }) {
  return (
    <div className={`hp-head${light ? ' hp-head--light' : ''}${center ? ' hp-head--center' : ''}`} data-reveal>
      <span className="hp-head__no" aria-hidden="true">{no}</span>
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

      {/* Hero — hồ sơ công ty */}
      <section className="hp-hero" aria-labelledby="home-title">
        <div className="hp-hero__sky" aria-hidden="true" />
        <div className="s-container hp-hero__grid">
          <div className="hp-hero__copy">
            <p className="ha-kicker">DANAVA Solutions — Company Profile 2026</p>
            <h1 className="hp-hero__title" id="home-title">DANAVA Solutions <em>Growing Your Business Together.</em></h1>
            {data.heroTitle && <p className="hp-hero__sub">{data.heroTitle}</p>}
            <p className="hp-hero__lead">{A.tagline}. Phần mềm quản lý DANAVA Studio, website, sự kiện, du lịch trải nghiệm và cộng đồng — một đầu mối cho công nghệ và trải nghiệm khách hàng.</p>
            <div className="hp-hero__cta">
              <Link className="hp-btn hp-btn--sun" href="/lien-he/">Nhận tư vấn <ArrowRight aria-hidden="true" /></Link>
              <Link className="hp-btn hp-btn--ghost" href="/he-sinh-thai/">Khám phá hệ sinh thái</Link>
            </div>
          </div>
          <figure className="hp-hero__art" aria-hidden="true">
            <span className="hp-hero__halo" />
            <img src="/assets/about/ecosystem.webp" alt="" width={1100} height={824} fetchPriority="high" />
            <span className="hp-hero__badge hp-hero__badge--a"><b>Từ 2018</b>đồng hành cùng Wellness</span>
            <span className="hp-hero__badge hp-hero__badge--b"><b>1.000+</b>huấn luyện viên kết nối</span>
          </figure>
        </div>
        <div className="s-container">
          <dl className="ha-stats hp-stats">
            {A.stats.map(st => <div key={st.label}><dd><CountUp value={st.value} /></dd><dt>{st.label}</dt></div>)}
          </dl>
          <p className="ha-src">Số liệu trên nền tảng danava.vn, cập nhật {A.checked}.</p>
        </div>
        <div className="hp-marquee" aria-hidden="true">
          {[0, 1].map(k => <ul key={k}>{[...A.fields, ...A.fields].map((f, i) => <li key={i}>{f}<i>•</i></li>)}</ul>)}
        </div>
        <p className="s-sr">Lĩnh vực: {A.fields.join(', ')}.</p>
      </section>

      <ChapterNav chapters={CHAPTERS} />

      {/* 01 · Nhà sáng lập */}
      <section className="hp-ch" id="nha-sang-lap" aria-labelledby="t-founder">
        <div className="s-container ha-founder">
          <figure className="ha-founder__photo" data-reveal>
            <img src={A.founder.image} alt={`${A.founder.name}, ${A.founder.title}`} width={1200} height={885} loading="lazy" decoding="async" />
            <figcaption><strong>{A.founder.name}</strong><small>{A.founder.title}</small></figcaption>
          </figure>
          <div className="ha-founder__body" data-reveal>
            <p className="ha-kicker ha-kicker--dark"><span className="hp-mini-no">01</span> Thông điệp nhà sáng lập</p>
            <h2 className="s-sr" id="t-founder">Thông điệp nhà sáng lập</h2>
            <blockquote className="ha-quote"><p>{A.founder.quote}</p></blockquote>
            <p className="hp-sign">— {A.founder.name}</p>
          </div>
        </div>
      </section>

      {/* 02 · Sứ mệnh & tầm nhìn */}
      <section className="hp-ch hp-mv" id="su-menh" aria-labelledby="t-mv">
        <div className="s-container">
          <Head no="02" kicker="Sứ mệnh & tầm nhìn" id="t-mv" title={<>Vì một cộng đồng <em>sống khỏe, bền vững.</em></>} />
          <div className="hp-mv__grid">
            <article data-reveal><span className="ha-mv__ico" aria-hidden="true"><Compass /></span><h3>Sứ mệnh</h3><p>{A.mission}</p></article>
            <article data-reveal><span className="ha-mv__ico" aria-hidden="true"><Eye /></span><h3>Tầm nhìn</h3><p>{A.vision}</p></article>
          </div>
        </div>
      </section>

      {/* 03 · Hệ sinh thái & giải pháp (dữ liệu thật của website) */}
      <section className="hp-ch hp-alt" id="giai-phap" aria-labelledby="t-eco">
        <div className="s-container">
          <div className="hp-row">
            <Head no="03" kicker="Hệ sinh thái" id="t-eco" title={<>Doanh nghiệp bạn cần gì, <em>DANAVA có lối đi riêng.</em></>} />
            <Link className="h-link" href="/he-sinh-thai/">Toàn bộ hệ sinh thái <ArrowRight aria-hidden="true" /></Link>
          </div>
          <SolutionsExplorer items={solutions} />
        </div>
      </section>

      {/* 04 · Bài toán & giải pháp */}
      <section className="hp-ch" id="bai-toan" aria-labelledby="t-problems">
        <div className="s-container">
          <Head no="04" kicker="Bài toán & giải pháp" id="t-problems" title={<>Những bài toán <em>doanh nghiệp thường gặp.</em></>} />
          <ul className="hp-problems">
            {A.problems.map((p, i) => (
              <li key={p.problem} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
                <p className="hp-problems__q"><X aria-hidden="true" />{p.problem}</p>
                <span className="hp-problems__arrow" aria-hidden="true"><ArrowRight /></span>
                <Link className="hp-problems__a" href={p.href}><Check aria-hidden="true" /><span>{p.solution}</span><ArrowUpRight aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 · Sản phẩm chủ lực & dự án thật */}
      <section className="hp-ch hp-dark" id="san-pham" aria-labelledby="t-studio">
        <div className="s-container s-split">
          <div className="s-stack-lg" data-reveal>
            <p className="ha-kicker"><span className="hp-mini-no">05</span> Sản phẩm chủ lực · DANAVA Studio</p>
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

      {/* 06 · Công nghệ & AI, R&D, ngành */}
      <section className="hp-ch hp-tech" id="cong-nghe" aria-labelledby="t-tech">
        <div className="s-container">
          <Head no="06" light kicker="Công nghệ & AI" id="t-tech" title={<>Công nghệ làm nền, <em>con người làm nên giá trị.</em></>} />
          <ul className="hp-tech__grid">
            {A.tech.map((t, i) => { const Icon = TECH_ICONS[i % 4]; return <li key={t} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}><span aria-hidden="true"><Icon /></span>{t}</li>; })}
          </ul>
          <div className="hp-tech__cols">
            <div><h3>Trung tâm nghiên cứu & đổi mới</h3><ul className="hp-tags">{A.rnd.map(x => <li key={x}>{x}</li>)}</ul></div>
            <div><h3>Giải pháp theo ngành</h3><ul className="hp-tags">{A.industries.map(x => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </div>
      </section>

      {/* 07 · Quy trình triển khai & hành trình khách hàng */}
      <section className="hp-ch" id="quy-trinh" aria-labelledby="t-process">
        <div className="s-container">
          <Head no="07" center kicker="Phương pháp triển khai" id="t-process" title={<>Bảy bước, <em>rõ ràng từ đầu đến cuối.</em></>} />
          <ol className="hp-process">
            {A.process.map((p, i) => (
              <li key={p.name} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}>
                <span className="hp-process__dot">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.name}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
          <div className="hp-journey" data-reveal>
            <p className="hp-journey__label">Hành trình cùng khách hàng</p>
            <ol>{A.journey.map((j, i) => <li key={j}><span>{String(i + 1).padStart(2, '0')}</span>{j}</li>)}</ol>
          </div>
        </div>
      </section>

      {/* 08 · Trước / sau */}
      <section className="hp-ch hp-alt" id="hieu-qua" aria-labelledby="t-ba">
        <div className="s-container">
          <Head no="08" kicker="Hiệu quả" id="t-ba" title={<>Trước & sau <em>khi triển khai.</em></>} />
          <div className="ha-ba hp-ba" data-reveal>
            <div className="ha-ba__col ha-ba__col--before"><h3>Trước</h3><ul>{A.before.map(x => <li key={x}><X aria-hidden="true" />{x}</li>)}</ul></div>
            <span className="ha-ba__arrow" aria-hidden="true"><ArrowRight /></span>
            <div className="ha-ba__col ha-ba__col--after"><h3>Sau khi triển khai cùng DANAVA</h3><ul>{A.after.map(x => <li key={x}><Check aria-hidden="true" />{x}</li>)}</ul></div>
          </div>
        </div>
      </section>

      {/* 09 · Giá trị cốt lõi */}
      <section className="hp-ch" id="gia-tri" aria-labelledby="t-values">
        <div className="s-container">
          <Head no="09" kicker="Vì sao chọn DANAVA" id="t-values" title={<>Sáu giá trị <em>cốt lõi.</em></>} />
          <ol className="ha-values__grid">
            {A.values.map((v, i) => (
              <li key={v.title} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}>
                <span className="ha-values__no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="hp-h4">{v.title}</h3>
                <p>{v.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 10 · ESG */}
      <section className="hp-ch hp-esg" id="esg" aria-labelledby="t-esg">
        <div className="s-container">
          <Head no="10" kicker="Phát triển bền vững" id="t-esg" title={<>ESG — <em>phát triển bền vững.</em></>} />
          <ul className="hp-esg__grid">
            {A.esg.map((e, i) => { const Icon = ESG_ICONS[i % 6]; return (
              <li key={e.title} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}>
                <span className="hp-esg__ico" aria-hidden="true"><Icon /></span>
                <h3>{e.title}</h3><p>{e.text}</p>
              </li>
            ); })}
          </ul>
        </div>
      </section>

      {/* 11 · Câu chuyện */}
      <section className="hp-ch ha-story" id="cau-chuyen" aria-labelledby="t-story">
        <div className="s-container ha-story__grid">
          <div>
            <p className="ha-kicker ha-kicker--dark"><span className="hp-mini-no">11</span> Câu chuyện DANAVA</p>
            <h2 className="ha-h3" id="t-story">Từ trải nghiệm thực tế <em>đến giải pháp công nghệ.</em></h2>
            <ol className="ha-time">
              {A.story.map(st => (
                <li key={st.year} data-reveal>
                  <span className="ha-time__year">{st.year}</span>
                  <div><h3 className="hp-h4">{st.title}</h3><p>{st.text}</p></div>
                </li>
              ))}
            </ol>
            <p className="ha-story__close">{A.storyClose}</p>
          </div>
          <figure className="hp-story__photos" data-reveal aria-hidden="true">
            <img src="/assets/legacy/community.webp" alt="" loading="lazy" decoding="async" />
            <img src="/assets/profile/set-stage.webp" alt="" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>

      {/* 12 · Đối tác */}
      <section className="hp-ch hp-partners" id="doi-tac" aria-labelledby="t-partners">
        <div className="s-container">
          <div className="hp-row">
            <Head no="12" kicker="Mạng lưới đối tác" id="t-partners" title={<>{partners.length} cơ sở <em>đang đồng hành.</em></>} />
            <Link className="h-link" href="/doi-tac/">Xem tất cả đối tác <ArrowRight aria-hidden="true" /></Link>
          </div>
          {partners.length > 0 && (
            <ul className="hp-logos">
              {partners.map(c => {
                const project = publishedProjects(data).find(p => p.id === c.projectId);
                const mk = c.logo ? markOf(c.logo) : null;
                return (
                  <li key={c.id} data-reveal>
                    <Link href={project ? projectHref(project) : `/doi-tac/#${c.id}`} aria-label={`${c.name}${project ? ' — xem case study' : ' — thông tin đối tác'}`}>
                      <span className={`hp-logos__img${mk?.fill ? ' is-mark' : ''}`}>{mk ? <img src={mk.src} alt="" loading="lazy" decoding="async" width={96} height={96} /> : <b>{c.name.charAt(0)}</b>}</span>
                      <span className="hp-logos__name">{c.name}</span>
                      {c.role && <small>{c.role}</small>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <ul className="hp-network">
            {A.network.map(n => <li key={n.name}><b>{n.name}</b><small>{n.text}</small></li>)}
          </ul>
        </div>
      </section>

      {/* 13 · Đội ngũ */}
      <section className="hp-ch hp-alt" id="doi-ngu" aria-labelledby="t-team">
        <div className="s-container ha-team">
          <div className="ha-team__head">
            <Head no="13" kicker="Ban lãnh đạo & đội ngũ" id="t-team" title={<>Cùng bạn phát triển. <em>Con người tạo giá trị.</em></>} />
            <div className="ha-team__links">
              <Link className="h-link" href="/ve-danava/">Câu chuyện DANAVA <ArrowRight aria-hidden="true" /></Link>
              <Link className="h-link" href="/doi-ngu/">Gặp đội ngũ <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          {staff.length > 0 && (
            <ul className="u-team ha-team__list" aria-label="Đội ngũ DANAVA">
              {staff.map(p => (
                <li key={p.id}><Link href={`/doi-ngu/${p.id}/`}><StaffAvatar person={p} /><span><strong>{p.name}</strong><small>{p.role}</small></span></Link></li>
              ))}
            </ul>
          )}
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

      {/* 14 · Liên hệ & hợp tác */}
      <section className="hp-ch hp-contact" id="lien-he-nhanh" aria-labelledby="home-faq">
        {faqs.length > 0 && <JsonLd value={faqLD(faqs)} />}
        <div className="s-container u-faq-contact">
          <div>
            <p className="ha-kicker ha-kicker--dark"><span className="hp-mini-no">14</span> Liên hệ & hợp tác</p>
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
