/**
 * Trang chủ (server component) — sáng, tối giản theo phong cách trang DANAVA GO:
 * nền kem ấm có quầng cam nhẹ, tiêu đề Playfair Display chữ đứng (navy + nhấn cam), nhãn mục chữ cam nhỏ in hoa.
 * Nội dung theo bộ "Company Profile 2026" (lib/about-danava.ts: PROFILE_2026, ABOUT_DANAVA).
 * Bìa → Đã đồng hành cùng → Về DANAVA → Giá trị (dải chữ) → What we do → Dự án → Why choose us → Tin mới → Liên hệ.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, AtSign, Globe, Mail, MapPin, Phone, Check, X, Sparkles } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { getApprovedSocialPosts, isPlatformSourced } from '@/lib/social-feed';
import { knowledgePosts, publicPartners, publicTestimonials, publishedProjects, projectHref } from '@/lib/site-queries';
import { CONTACT, formatPhone, formatDate } from './catalog';
import { ProjectTile, PostTile, Testimonials } from './blocks';
import { Reveal, CountUp } from './HomeClient';
import { OfficeScene } from './OfficeScene';
import { block } from '@/lib/blocks';
import { ABOUT_DANAVA as A, PROFILE_2026 as P } from '@/lib/about-danava';
import { markOf } from '@/lib/partner-marks';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="hb-eyebrow">{children}</p>;
}

export default function HomePage({ data }: { data: SiteData }) {
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
  const posts = knowledgePosts(data).slice(0, 3);
  const social = getApprovedSocialPosts().filter(isPlatformSourced).slice(0, 3);

  return (
    <main id="main" className="h-home hb">
      <Reveal />

      {/* Bìa */}
      <section className="hb-cover" aria-labelledby="home-title">
        <div className="s-container hb-cover__grid">
          <div className="hb-cover__copy">
            <p className="hb-pill"><Sparkles aria-hidden="true" />DANAVA Solutions · Growing Your Business Together</p>
            <h1 className="hb-title" id="home-title">
              <span className="hb-line" style={{ ['--l' as string]: 0 }}>Cùng bạn phát triển.</span>
              <em className="hb-line" style={{ ['--l' as string]: 1 }}>Kiến tạo hệ sinh thái Wellness.</em>
            </h1>
            <p className="hb-lead">{P.tagline}: phần mềm quản lý DANAVA Studio, website, truyền thông và sự kiện — một đầu mối cho doanh nghiệp của bạn.</p>
            <div className="hb-cta">
              <Link className="hb-btn hb-btn--primary" href="/lien-he/">Nhận tư vấn <ArrowRight aria-hidden="true" /></Link>
              <Link className="hb-btn hb-btn--ghost" href="/giai-phap/">Xem giải pháp</Link>
            </div>
          </div>
          <div className="hb-cover__3d">
            <OfficeScene fallback="/assets/about/office-sm.webp" />
            <span className="hb-float hb-float--a" aria-hidden="true"><b>{P.years}</b>Văn phòng DANAVA · Đà Nẵng</span>
            <span className="hb-float hb-float--b" aria-hidden="true"><i />{partners.length} đối tác đang đồng hành</span>
          </div>
        </div>
        <div className="s-container">
          <dl className="hb-stats">
            {A.stats.map(st => <div key={st.label}><dd><CountUp value={st.value} /></dd><dt>{st.label}</dt></div>)}
          </dl>
          <p className="hb-src">Số liệu trên nền tảng danava.vn · {A.checked}</p>
        </div>
      </section>

      {/* Đã đồng hành cùng */}
      <section className="hb-trust" id="doi-tac" aria-labelledby="t-trust">
        <div className="s-container hb-row">
          <div>
            <Eyebrow>Đối tác</Eyebrow>
            <h2 className="hb-h2" id="t-trust"><em><CountUp value={partners.length} suffix="" /> cơ sở</em> đã đồng hành cùng DANAVA.</h2>
          </div>
          <Link className="hb-more" href="/doi-tac/">Xem tất cả đối tác <ArrowRight aria-hidden="true" /></Link>
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

      {/* Về DANAVA */}
      <section className="hb-sec hb-about" id="ve-danava" aria-labelledby="t-about">
        <div className="s-container hb-about__grid">
          <div className="hb-about__media" data-reveal aria-hidden="true">
            <figure><img src={A.founder.image} alt="" loading="lazy" decoding="async" width={1200} height={885} /></figure>
            <span className="hb-float hb-float--c"><b>{A.founder.name}</b>{A.founder.title}</span>
          </div>
          <div data-reveal>
            <Eyebrow>Về DANAVA</Eyebrow>
            <h2 className="hb-h2" id="t-about">Chuyển đổi số không chỉ là công nghệ, <em>đó là hành trình kiến tạo giá trị.</em></h2>
            <p className="hb-text">{P.about[0]}</p>
            <ul className="hb-mv">
              <li><span>Sứ mệnh</span><p>{A.mission}</p></li>
              <li><span>Tầm nhìn</span><p>{A.vision}</p></li>
            </ul>
            <Link className="hb-more" href="/ve-danava/">Câu chuyện & đội ngũ DANAVA <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi — dải chữ chạy */}
      <div className="hb-kinetic" aria-hidden="true">
        {[0, 1].map(k => (
          <ul key={k}>{[...P.values, ...P.values].map((v, i) => <li key={i} className={i % 2 ? 'is-accent' : undefined}>{v}<i>✦</i></li>)}</ul>
        ))}
      </div>
      <p className="s-sr">Giá trị cốt lõi: {P.values.join(', ')}.</p>

      {/* What we do */}
      <section className="hb-sec hb-what" id="giai-phap" aria-labelledby="t-what">
        <div className="s-container">
          <div className="hb-row">
            <div>
              <Eyebrow>What we do</Eyebrow>
              <h2 className="hb-h2" id="t-what">Những bài toán doanh nghiệp, <em>một lời giải trọn vẹn.</em></h2>
            </div>
            <Link className="hb-more" href="/giai-phap/">Tất cả giải pháp <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="hb-problems" data-reveal>
            <ul className="hb-problems__q">{A.problems.map(p => <li key={p.problem}><X aria-hidden="true" />{p.problem}</li>)}</ul>
            <span className="hb-problems__arrow" aria-hidden="true"><ArrowRight /></span>
            <ul className="hb-problems__a">{A.problems.map(p => <li key={p.solution}><Check aria-hidden="true" />{p.solution}</li>)}</ul>
          </div>
          <ul className="hb-services">
            {P.services.map((sv, i) => (
              <li key={sv.title} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                <Link href={sv.href}>
                  <span className="hb-services__no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{sv.title}</h3>
                  <p className="hb-text">{sv.text}</p>
                  <span className="hb-services__go">Tìm hiểu <ArrowUpRight aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="hb-quote" data-reveal>“{P.quote}”</p>
        </div>
      </section>

      {/* Dự án */}
      {projects.length > 0 && (
        <section className="hb-sec hb-cream" aria-labelledby="t-projects">
          <div className="s-container">
            <div className="hb-row">
              <div><Eyebrow>Dự án tiêu biểu</Eyebrow><h2 className="hb-h2" id="t-projects">Sản phẩm <em>đang chạy thật.</em></h2></div>
              <Link className="hb-more" href="/du-an/">Tất cả dự án <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={`s-grid s-snap ${projects.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>{projects.map(p => <ProjectTile key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      <Testimonials items={testimonials} />

      {/* Why choose us */}
      <section className="hb-sec hb-why" aria-labelledby="t-why">
        <div className="s-container">
          <div className="hb-row">
            <div><Eyebrow>Why choose us</Eyebrow><h2 className="hb-h2" id="t-why">Vì sao doanh nghiệp <em>chọn DANAVA.</em></h2></div>
          </div>
          <ol className="hb-why__grid">
            {P.why.map((w, i) => (
              <li key={w.title} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                <span className="hb-why__no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tin mới */}
      {posts.length > 0 && (
        <section className="hb-sec hb-cream" aria-labelledby="home-news">
          <div className="s-container">
            <div className="hb-row">
              <div><Eyebrow>Blogs</Eyebrow><h2 className="hb-h2" id="home-news">Tin mới <em>từ DANAVA.</em></h2></div>
              <Link className="hb-more" href="/kien-thuc/">Xem tất cả <ArrowRight aria-hidden="true" /></Link>
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

      {/* Liên hệ */}
      <section className="hb-final" id="lien-he-nhanh" aria-labelledby="t-contact">
        <div className="s-container">
          <img className="hb-final__logo" src="/assets/danava-logo.png" alt="DANAVA Solutions" width={709} height={352} loading="lazy" />
          <h2 className="hb-final__title" id="t-contact">Sẵn sàng phát triển <em>cùng DANAVA?</em></h2>
          <p className="hb-lead hb-final__lead">{P.tagline}.</p>
          <div className="hb-cta hb-final__cta">
            <Link className="hb-btn hb-btn--primary" href="/lien-he/">Nhận tư vấn <ArrowRight aria-hidden="true" /></Link>
            <Link className="hb-btn hb-btn--ghost" href="/lien-he/?service=danava-studio">Đăng ký demo DANAVA Studio</Link>
          </div>
          <ul className="hb-final__info">
            <li><Phone aria-hidden="true" /><a href={`tel:${phone}`}>{formatPhone(phone)}</a></li>
            <li><Mail aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></li>
            <li><AtSign aria-hidden="true" /><a href={co.facebook} target="_blank" rel="noopener">{P.social}<span className="s-sr"> (mở tab mới)</span></a></li>
            <li><Globe aria-hidden="true" /><a href="https://danava.vn" target="_blank" rel="noopener">{P.website}<span className="s-sr"> (mở tab mới)</span></a></li>
            <li><MapPin aria-hidden="true" /><a href={co.mapUrl} target="_blank" rel="noopener">{co.address}</a></li>
          </ul>
          <p className="hb-final__legal">{A.company}</p>
        </div>
      </section>
    </main>
  );
}
