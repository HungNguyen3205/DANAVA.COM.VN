/**
 * Trang chủ (server component) — theo ngôn ngữ thiết kế bộ "Company Profile 2026" của DANAVA:
 * nền xanh hoàng gia với các mảng cắt chéo, điểm nhấn cam, tiêu đề in hoa đậm (Be Vietnam Pro — font chung của dự án),
 * nhãn mục dạng thanh màu, ảnh cắt chéo. Nguyên văn nội dung ở lib/about-danava.ts (PROFILE_2026, ABOUT_DANAVA).
 * Bìa (ảnh văn phòng) → Đã đồng hành cùng → Về DANAVA → What We Do → Dự án tiêu biểu → Why Choose Us → Tin mới → Liên hệ.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, AtSign, Globe, Mail, MapPin, Phone, Check, X } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { getApprovedSocialPosts, isPlatformSourced } from '@/lib/social-feed';
import { knowledgePosts, publicPartners, publicTestimonials, publishedProjects, projectHref } from '@/lib/site-queries';
import { CONTACT, formatPhone, formatDate } from './catalog';
import { ProjectTile, PostTile, Testimonials } from './blocks';
import { Reveal, CountUp } from './HomeClient';
import { block } from '@/lib/blocks';
import { ABOUT_DANAVA as A, PROFILE_2026 as P } from '@/lib/about-danava';
import { markOf } from '@/lib/partner-marks';

/** Nhãn mục dạng thanh màu như trong profile */
function Tag({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'orange' }) {
  return <span className={`hb-tag hb-tag--${tone}`}>{children}</span>;
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

      {/* Bìa — như trang 1 & 3 của profile: mảng xanh cắt chéo, ảnh văn phòng */}
      <section className="hb-cover" aria-labelledby="home-title">
        <div className="hb-cover__photo" aria-hidden="true">
          <img src="/assets/about/office.webp" srcSet="/assets/about/office-sm.webp 1100w, /assets/about/office.webp 2200w" sizes="(max-width: 900px) 100vw, 60vw" alt="" width={2200} height={1650} fetchPriority="high" />
        </div>
        <span className="hb-shard hb-shard--1" aria-hidden="true" />
        <span className="hb-shard hb-shard--2" aria-hidden="true" />
        <span className="hb-shard hb-shard--3" aria-hidden="true" />
        <div className="s-container hb-cover__inner">
          <p className="hb-cover__date">Company Profile · {P.years}</p>
          <h1 className="hb-cover__title" id="home-title">Growing your business <span>together</span></h1>
          <p className="hb-cover__slogan">DANAVA Solutions</p>
          <p className="hb-cover__lead">{P.tagline}.</p>
          <div className="hb-cover__cta">
            <Link className="hb-btn hb-btn--orange" href="/lien-he/">Nhận tư vấn <ArrowRight aria-hidden="true" /></Link>
            <Link className="hb-btn hb-btn--line" href="/giai-phap/">Xem giải pháp</Link>
          </div>
        </div>
        <div className="s-container hb-cover__stats">
          <dl>
            {A.stats.map(st => <div key={st.label}><dd><CountUp value={st.value} /></dd><dt>{st.label}</dt></div>)}
          </dl>
          <p>Số liệu trên nền tảng danava.vn · {A.checked}</p>
        </div>
      </section>

      {/* Đã đồng hành cùng */}
      <section className="hb-trust" id="doi-tac" aria-labelledby="t-trust">
        <div className="s-container hb-row">
          <div>
            <Tag>Đối tác</Tag>
            <h2 className="hb-h2" id="t-trust"><b><CountUp value={partners.length} suffix="" /></b> cơ sở đã đồng hành cùng DANAVA</h2>
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

      {/* Về DANAVA — trang 2 của profile */}
      <section className="hb-about" id="ve-danava" aria-labelledby="t-about">
        <span className="hb-about__shard" aria-hidden="true" />
        <div className="s-container hb-about__grid">
          <div className="hb-about__copy" data-reveal>
            <h2 className="hb-h1" id="t-about">Về DANAVA</h2>
            {P.about.map(t => <p key={t} className="hb-text">{t.split('DANAVA').map((x, i, all) => <span key={i}>{x}{i < all.length - 1 && <b>DANAVA</b>}</span>)}</p>)}
            <p className="hb-text hb-text--em">{P.aboutClose}</p>
            <div className="hb-about__mv">
              <div><Tag>Sứ mệnh</Tag><p className="hb-text">{A.mission}</p></div>
              <div><Tag>Tầm nhìn</Tag><p className="hb-text">{A.vision}</p></div>
              <div><Tag tone="orange">Giá trị cốt lõi</Tag><p className="hb-values">{P.values.map((v, i) => <span key={v}>{v}{i < P.values.length - 1 && <i aria-hidden="true"> - </i>}</span>)}</p></div>
            </div>
            <Link className="hb-more" href="/ve-danava/">Câu chuyện & đội ngũ DANAVA <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="hb-about__media" data-reveal aria-hidden="true">
            <figure className="hb-about__ph hb-about__ph--a"><img src={A.founder.image} alt="" loading="lazy" decoding="async" width={1200} height={885} /></figure>
            <figure className="hb-about__ph hb-about__ph--b"><img src="/assets/about/office-sm.webp" alt="" loading="lazy" decoding="async" width={1100} height={825} /></figure>
            <span className="hb-about__badge"><b>{P.years}</b>Công ty Cổ phần Giải pháp DANAVA</span>
          </div>
        </div>
      </section>

      {/* What We Do — trang 3 của profile */}
      <section className="hb-what" id="giai-phap" aria-labelledby="t-what">
        <div className="hb-what__band">
          <div className="hb-what__photo" aria-hidden="true"><img src="/assets/profile/set-stage.webp" alt="" loading="lazy" decoding="async" /></div>
          <div className="s-container"><h2 className="hb-mega" id="t-what">What<br />we do</h2></div>
        </div>
        <div className="s-container">
          <h3 className="hb-h2 hb-center" data-reveal>Những bài toán doanh nghiệp</h3>
          <div className="hb-problems" data-reveal>
            <ul className="hb-problems__q">{A.problems.map(p => <li key={p.problem}><X aria-hidden="true" />{p.problem}</li>)}</ul>
            <span className="hb-problems__arrow" aria-hidden="true"><ArrowRight /></span>
            <ul className="hb-problems__a">{A.problems.map(p => <li key={p.solution}><Check aria-hidden="true" />{p.solution}</li>)}</ul>
          </div>
          <ul className="hb-services">
            {P.services.map((sv, i) => (
              <li key={sv.title} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                <Link href={sv.href}>
                  <span className={`hb-tag hb-tag--block hb-tag--${i === 1 ? 'orange' : 'blue'}`}>{sv.title}</span>
                  <p className="hb-text">{sv.text}</p>
                  <span className="hb-services__go">Tìm hiểu <ArrowUpRight aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="hb-quote" data-reveal>“{P.quote}”</p>
        </div>
      </section>

      {/* Dự án tiêu biểu — bằng chứng thật */}
      {projects.length > 0 && (
        <section className="hb-sec hb-projects" aria-labelledby="t-projects">
          <div className="s-container">
            <div className="hb-row">
              <div><Tag>Dự án</Tag><h2 className="hb-h2" id="t-projects">Sản phẩm đang chạy thật</h2></div>
              <Link className="hb-more" href="/du-an/">Tất cả dự án <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={`s-grid s-snap ${projects.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>{projects.map(p => <ProjectTile key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      <Testimonials items={testimonials} />

      {/* Why Choose Us — trang 4 của profile */}
      <section className="hb-why" aria-labelledby="t-why">
        <span className="hb-why__light" aria-hidden="true" />
        <div className="s-container hb-why__grid">
          <div className="hb-why__head">
            <img src="/assets/danava-mark.png" alt="" width={96} height={96} loading="lazy" />
            <h2 className="hb-mega hb-mega--blue" id="t-why">Why<br />choose<br />us</h2>
          </div>
          <ol className="hb-why__list">
            {P.why.map((w, i) => (
              <li key={w.title} data-reveal style={{ ['--d' as string]: `${i * 90}ms`, ['--i' as string]: i }}>
                <h3 className="hb-why__bar">{String(i + 1).padStart(2, '0')}. {w.title}</h3>
                <p>{w.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tin mới */}
      {posts.length > 0 && (
        <section className="hb-sec" aria-labelledby="home-news">
          <div className="s-container">
            <div className="hb-row">
              <div><Tag>Blogs</Tag><h2 className="hb-h2" id="home-news">Tin mới từ DANAVA</h2></div>
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

      {/* Liên hệ — trang 5 của profile */}
      <section className="hb-contact" id="lien-he-nhanh" aria-labelledby="t-contact">
        <span className="hb-shard hb-shard--1" aria-hidden="true" />
        <span className="hb-shard hb-shard--3" aria-hidden="true" />
        <div className="s-container hb-contact__grid">
          <div>
            <img className="hb-contact__logo" src="/assets/danava-logo-light.png" alt="DANAVA Solutions" width={554} height={135} loading="lazy" />
            <h2 className="hb-contact__title" id="t-contact">Sẵn sàng phát triển cùng DANAVA?</h2>
            <p className="hb-cover__slogan">{P.slogan}</p>
            <p className="hb-cover__lead">{P.tagline}.</p>
            <div className="hb-cover__cta">
              <Link className="hb-btn hb-btn--orange" href="/lien-he/">Nhận tư vấn <ArrowRight aria-hidden="true" /></Link>
              <Link className="hb-btn hb-btn--line" href="/lien-he/?service=danava-studio">Đăng ký demo DANAVA Studio</Link>
            </div>
          </div>
          <div className="hb-contact__info">
            <h3>Thông tin liên hệ</h3>
            <ul>
              <li><span><Phone aria-hidden="true" /></span><a href={`tel:${phone}`}>{formatPhone(phone)}</a></li>
              <li><span><Mail aria-hidden="true" /></span><a href={`mailto:${email}`}>{email}</a></li>
              <li><span><AtSign aria-hidden="true" /></span><a href={co.facebook} target="_blank" rel="noopener">{P.social}<span className="s-sr"> (mở tab mới)</span></a></li>
              <li><span><Globe aria-hidden="true" /></span><a href="https://danava.vn" target="_blank" rel="noopener">{P.website}<span className="s-sr"> (mở tab mới)</span></a></li>
              <li><span><MapPin aria-hidden="true" /></span><a href={co.mapUrl} target="_blank" rel="noopener">{co.address}</a></li>
            </ul>
            <p className="hb-contact__legal">{A.company}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
