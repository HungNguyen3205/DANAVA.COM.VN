'use client';
/**
 * Trang chủ — phong cách "tạp chí" (editorial): ảnh tràn màn hình, tiêu đề serif,
 * các chương đánh số kể về DANAVA: tổng quan → mục tiêu → hành trình → hệ sinh thái → dấu ấn.
 * Nội dung lấy từ lib/company.ts, trang Về DANAVA và Company Profile 2026.
 */
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ArrowDown, Users, Cpu, Megaphone, PartyPopper, Dumbbell, Flower2, Sparkles, Waves, Hotel, GraduationCap, Store, type LucideIcon } from 'lucide-react';
import { useSite } from '../SiteStore';
import { postPhotos } from '@/lib/media';
import { company } from '@/lib/company';
import { getApprovedSocialPosts } from '@/lib/social-feed';
import { defaultPresentation } from '@/lib/presentation';
import { sortServices, formatDate, excerpt, type Tone } from './catalog';
import { SectionHeading, CheckList, CtaBand, Visual, ArrowLink, IconTile } from './ui';
import { StudioShowcase } from './StudioShowcase';

const PF = '/assets/profile/';

/* ---------- Dữ liệu trình bày ---------- */
const SLIDES = [
  { src: `${PF}set-stage.webp`, caption: 'Đạo cụ phim trường · Nhà hát Trưng Vương' },
  { src: `${PF}lutech-4.webp`, caption: 'LUTECH · Kỷ niệm 4 năm “Tap to TOP”' },
  { src: `${PF}everlastify-1.webp`, caption: 'EVERLASTIFY · Trang trí thương hiệu theo chủ đề' },
  { src: '/assets/legacy/community.webp', caption: 'Cộng đồng yoga · Đà Nẵng' }
];

const PILLARS = [
  { icon: Cpu, title: 'Công nghệ', text: 'Phần mềm DANAVA Studio, website & landing page.', href: '/giai-phap/danava-studio/' },
  { icon: Megaphone, title: 'Truyền thông', text: 'Digital marketing, nội dung, quay phim, chụp ảnh.', href: '/giai-phap/digital-marketing/' },
  { icon: PartyPopper, title: 'Trải nghiệm', text: 'Sự kiện, du lịch trải nghiệm và cộng đồng.', href: '/giai-phap/du-lich-su-kien/' }
];

const GOALS = [
  { n: 'I', title: 'Giá trị cốt lõi', text: 'Con người là nền tảng. Sáng tạo và cải tiến định hướng cách làm. DANAVA đề cao sự tận tâm, tinh thần hợp tác và trách nhiệm trong từng chương trình.' },
  { n: 'II', title: 'Sứ mệnh', text: 'Kết nối ý tưởng với nguồn lực thực hiện, đồng hành cùng doanh nghiệp tạo nên những sản phẩm, sự kiện chỉn chu, giàu trải nghiệm và mang giá trị cho khách hàng, đối tác, cộng đồng.' },
  { n: 'III', title: 'Tầm nhìn', text: 'Phát triển thành đối tác công nghệ, sự kiện và truyền thông đáng tin cậy; không ngừng ứng dụng công nghệ, nâng cao năng lực sáng tạo và chất lượng triển khai.' }
];

const JOURNEY = [
  { year: '2021', title: 'Khởi đầu kết nối số & cộng đồng', text: 'Triển khai thiết kế website doanh nghiệp, marketing và đồng hành cùng các câu lạc bộ yoga tại Đà Nẵng và miền Trung.', image: '/assets/legacy/community.webp' },
  { year: '2023', title: 'Chuẩn hóa hệ sinh thái', text: 'Quy tụ đội ngũ cốt lõi với năm mảng: công nghệ quản trị, website, marketing & media, du lịch & sự kiện, cộng đồng.', image: '/assets/legacy/event-group.webp' },
  { year: '2024', title: 'Chuỗi sự kiện Cổng Năng Lượng', text: 'Đồng hành tổ chức Soundbath Live Concert ngày 05/05/2024 tại Đà Nẵng cùng Team Tumy và các câu lạc bộ yoga.', image: '/assets/legacy/post-energy.webp' },
  { year: '2026', title: 'Nền tảng DANAVA Studio', text: 'Triển khai phần mềm DANAVA Studio và app hội viên mang thương hiệu riêng cho HARIVER Gym và Huế Pilates & Yoga.', image: '/assets/presentation/studio-dashboard.webp' }
];

const ECO_IMAGES: Record<string, string> = {
  studio: '/assets/presentation/studio-dashboard.webp',
  website: '/assets/legacy/website.webp',
  marketing: `${PF}waterrun-3.webp`,
  travel: '/assets/legacy/travel.webp',
  community: '/assets/legacy/community.webp'
};

const MOMENTS = [
  { src: `${PF}who-gala.webp`, title: 'Gala & sân khấu' },
  { src: `${PF}pnj-2.webp`, title: 'Kick-off PNJ · Aeon Mall Huế' },
  { src: `${PF}highlands-1.webp`, title: 'Đêm Trăng Rằm · Highlands' },
  { src: `${PF}waterrun-1.webp`, title: 'Water Run · Revive' },
  { src: `${PF}ariyana-booth.webp`, title: 'Booth sự kiện · Ariyana' },
  { src: `${PF}lutech-1.webp`, title: 'LUTECH · Tap to TOP' },
  { src: `${PF}everlastify-2.webp`, title: 'EVERLASTIFY · Hello Summer' }
];

/* ---------- Trang ---------- */
export default function HomePage() {
  const { data } = useSite();
  const pres = data.presentation || defaultPresentation;
  const studio = data.services.find(s => s.id === 'studio');
  useReveal();

  return (
    <main id="main" className="h-home">
      <Hero description={data.description} />
      <Industries />
      <Overview />
      <Goals />
      <Journey />
      <Ecosystem />

      {/* Sản phẩm chủ lực */}
      <section className="s-section s-section--brand h-flag" aria-labelledby="home-studio">
        <div className="s-container s-split">
          <div className="s-stack-lg" data-reveal>
            <div className="s-heading">
              <p className="h-chapter h-chapter--light"><span>05</span>Sản phẩm chủ lực</p>
              <h2 className="h-title h-title--light" id="home-studio">
                {pres.technologyTitle.split('\n').map((l, i, all) => (
                  <span key={i} style={{ display: 'block' }}>{i === all.length - 1 && all.length > 1 ? <em>{l}</em> : l}</span>
                ))}
              </h2>
              <p className="s-lead">{pres.technologyDescription}</p>
            </div>
            {studio && <CheckList items={studio.items} />}
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href="/giai-phap/danava-studio/">Tìm hiểu DANAVA Studio</Link>
              <Link className="s-btn s-btn--secondary s-btn--lg" href="/lien-he/?service=danava-studio">Đăng ký demo</Link>
            </div>
          </div>
          <div data-reveal style={{ ['--d' as string]: '120ms' }}>
            <StudioShowcase image={pres.screenImage || defaultPresentation.screenImage} />
          </div>
        </div>
      </section>

      <Moments />
      <Metrics />
      <Projects />
      <News />
      <CtaBand
        title="Viết tiếp chương mới cùng DANAVA"
        lead="Kể cho chúng tôi về doanh nghiệp và mục tiêu của bạn. DANAVA sẽ đề xuất lộ trình phù hợp, minh bạch chi phí và thời gian."
        secondary={{ href: '/giai-phap/', label: 'Xem các giải pháp' }}
      />
    </main>
  );
}

/** Hiện dần khi cuộn tới — chỉ ẩn phần tử khi JS đã sẵn sàng. */
function useReveal() {
  useEffect(() => {
    const root = document.querySelector('main.h-home');
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    root.classList.add('is-motion');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- 00 Hero ---------- */
function Hero({ description }: { description: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI(v => (v + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="h-hero" aria-labelledby="home-title">
      <div className="h-hero__slides" aria-hidden="true">
        {SLIDES.map((s, k) => (
          <div key={s.src} className={`h-hero__slide${k === i ? ' is-on' : ''}`}>
            <img src={s.src} alt="" {...(k === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
          </div>
        ))}
      </div>
      <div className="h-hero__shade" aria-hidden="true" />

      <div className="s-container h-hero__inner">
        <p className="h-hero__eyebrow">DANAVA Solutions · Đà Nẵng · Từ 2021</p>
        <h1 className="h-hero__title" id="home-title">
          <span className="h-hero__l1">Cùng bạn</span>
          <span className="h-hero__l2">phát triển.</span>
        </h1>
        <p className="h-hero__lead">{description} Một đối tác cho công nghệ, truyền thông và trải nghiệm của doanh nghiệp.</p>
        <div className="h-hero__cta">
          <a className="s-btn s-btn--primary s-btn--lg" href="#hanh-trinh">Khám phá hành trình <ArrowDown aria-hidden="true" /></a>
          <Link className="s-btn s-btn--lg h-btn-glass" href="/lien-he/">Nhận tư vấn</Link>
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

      <div className="h-hero__caption" aria-live="polite">
        <span className="h-hero__count">{String(i + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}</span>
        <span className="h-hero__cap">{SLIDES[i].caption}</span>
        <span className="h-hero__dots">
          {SLIDES.map((s, k) => (
            <button key={s.src} type="button" className={k === i ? 'is-on' : ''} onClick={() => setI(k)} aria-label={`Ảnh ${k + 1}: ${s.caption}`} />
          ))}
        </span>
      </div>
    </section>
  );
}

/* ---------- 01 Tổng quan ---------- */
function Overview() {
  return (
    <section className="h-sec h-sec--cream" aria-labelledby="home-overview">
      <div className="s-container h-overview">
        <div className="h-collage" data-reveal>
          <figure className="h-collage__a"><img src={`${PF}who-stage.webp`} alt="Sân khấu sự kiện do DANAVA tổ chức" loading="lazy" /></figure>
          <figure className="h-collage__b"><img src="/assets/legacy/event-group.webp" alt="Đội ngũ DANAVA cùng cộng đồng tại một workshop" loading="lazy" /></figure>
          <div className="h-seal" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="h-seal-path" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" /></defs>
              <text><textPath href="#h-seal-path">CÙNG BẠN PHÁT TRIỂN · DANAVA · ĐÀ NẴNG ·</textPath></text>
            </svg>
            <span>D</span>
          </div>
        </div>
        <div className="h-overview__copy" data-reveal style={{ ['--d' as string]: '120ms' }}>
          <p className="h-chapter"><span>01</span>Tổng quan</p>
          <h2 className="h-title" id="home-overview">Một đối tác, <em>ba năng lực</em>: công nghệ, truyền thông và trải nghiệm.</h2>
          <p className="h-body">{company.overview}</p>
          <dl className="h-facts">
            <div><dt>2021</dt><dd>Năm khởi đầu</dd></div>
            <div><dt>5</dt><dd>Mảng hoạt động</dd></div>
            <div><dt>Đà Nẵng</dt><dd>{company.address}</dd></div>
          </dl>
          <Link className="h-link" href="/ve-danava/">Câu chuyện DANAVA <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- 02 Mục tiêu ---------- */
function Goals() {
  return (
    <section className="h-sec h-sec--ink h-goals" aria-labelledby="home-goals">
      <svg className="h-goals__ribbon" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-50 480 C 250 380, 420 120, 700 160 S 1080 380, 1260 120" />
      </svg>
      <div className="s-container">
        <div className="h-goals__head" data-reveal>
          <p className="h-chapter h-chapter--light"><span>02</span>Mục tiêu</p>
          <h2 className="h-quote" id="home-goals">“Công nghệ tạo khả năng, <em>con người tạo giá trị.</em>”</h2>
          <p className="h-goals__mission"><b>Sứ mệnh truyền thông:</b> {company.mission}</p>
        </div>
        <ol className="h-goals__list">
          {GOALS.map((g, k) => (
            <li key={g.n} data-reveal style={{ ['--d' as string]: `${k * 120}ms` }}>
              <span className="h-goals__n">{g.n}</span>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- 03 Hành trình (cuộn ngang khi ghim) ---------- */
function Journey() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [pin, setPin] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    const set = () => setPin(mq.matches);
    set(); mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  useEffect(() => {
    const w = wrap.current, t = track.current;
    if (!w || !t) return;
    if (!pin) { w.style.removeProperty('--jh'); t.style.transform = ''; return; }
    let raf = 0;
    const measure = () => { const dist = Math.max(0, t.scrollWidth - t.clientWidth); w.style.setProperty('--jh', `${dist}px`); return dist; };
    let dist = measure();
    const frame = () => {
      raf = 0;
      // offsetTop của khối sticky = quãng đã cuộn trong lúc ghim
      const sticky = w.firstElementChild as HTMLElement;
      const total = w.offsetHeight - sticky.offsetHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, sticky.offsetTop / total)) : 0;
      t.style.transform = `translate3d(${-p * dist}px,0,0)`;
      w.style.setProperty('--jp', p.toFixed(4));
      setActive(Math.min(JOURNEY.length, Math.round(p * JOURNEY.length)));
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { dist = measure(); req(); };
    frame();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', req); window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); };
  }, [pin]);

  return (
    <section ref={wrap} id="hanh-trinh" className={`h-journey${pin ? ' is-pinned' : ''}`} aria-labelledby="home-journey">
      <div className="h-journey__sticky">
        <div className="s-container h-journey__head">
          <div>
            <p className="h-chapter"><span>03</span>Hành trình</p>
            <h2 className="h-title" id="home-journey">Từ những kết nối đầu tiên <em>đến một hệ sinh thái.</em></h2>
          </div>
          <div className="h-journey__years" aria-hidden="true">
            {JOURNEY.map((j, k) => <span key={j.year} className={k < active || (k === 0) ? 'is-past' : ''}>{j.year}</span>)}
            <i />
          </div>
        </div>
        <ol ref={track} className="h-journey__track">
          {JOURNEY.map((j, k) => (
            <li key={j.year} className="h-step">
              <span className="h-step__year" aria-hidden="true">{j.year}</span>
              <figure className="h-step__img"><img src={j.image} alt="" loading="lazy" /></figure>
              <div className="h-step__body">
                <p className="h-step__no">Chương {String(k + 1).padStart(2, '0')} · {j.year}</p>
                <h3>{j.title}</h3>
                <p>{j.text}</p>
              </div>
            </li>
          ))}
          <li className="h-step h-step--next">
            <p className="h-step__no">Chương tiếp theo</p>
            <h3>Cùng bạn viết <em>phần tiếp theo.</em></h3>
            <Link className="s-btn s-btn--primary s-btn--lg" href="/lien-he/">Bắt đầu trò chuyện <ArrowRight aria-hidden="true" /></Link>
          </li>
        </ol>
        <div className="h-journey__bar" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}

/* ---------- 04 Hệ sinh thái ---------- */
function Ecosystem() {
  const { data } = useSite();
  const services = sortServices(data.services);
  const [cur, setCur] = useState(0);
  const s = services[cur];
  return (
    <section className="h-sec h-sec--cream" aria-labelledby="home-eco">
      <div className="s-container">
        <div className="h-eco__head" data-reveal>
          <p className="h-chapter"><span>04</span>Hệ sinh thái giải pháp</p>
          <h2 className="h-title" id="home-eco">Mỗi nhu cầu, <em>một lối đi riêng.</em></h2>
        </div>
        <div className="h-eco">
          <ol className="h-eco__list" data-reveal>
            {services.map((x, k) => (
              <li key={x.id}>
                <Link
                  href={`/giai-phap/${x.slug}/`}
                  className={k === cur ? 'is-on' : ''}
                  onMouseEnter={() => setCur(k)}
                  onFocus={() => setCur(k)}
                >
                  <span className="h-eco__n">{String(k + 1).padStart(2, '0')}</span>
                  <span className="h-eco__t"><strong>{x.title}</strong><small>{x.description}</small></span>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
          <div className="h-eco__stage" data-reveal style={{ ['--d' as string]: '120ms' }}>
            {services.map((x, k) => (
              <img key={x.id} src={ECO_IMAGES[x.id] || '/assets/legacy/event-group.webp'} alt="" className={k === cur ? 'is-on' : ''} style={x.id === 'studio' ? { objectPosition: 'left top' } : undefined} loading="lazy" />
            ))}
            {s && (
              <div className="h-eco__card">
                <p>{s.title}</p>
                <ul>{s.items.slice(0, 3).map(it => <li key={it}>{it}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 06 Dấu ấn ---------- */
function Moments() {
  return (
    <section className="h-sec h-moments" aria-labelledby="home-moments">
      <div className="s-container">
        <div className="h-moments__head" data-reveal>
          <div>
            <p className="h-chapter"><span>06</span>Dấu ấn</p>
            <h2 className="h-title" id="home-moments">Những khoảnh khắc <em>chúng tôi đã cùng tạo nên.</em></h2>
          </div>
          <Link className="h-link" href="/giai-phap/digital-marketing/">Xem hồ sơ chương trình <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="h-mosaic">
          {MOMENTS.map((m, k) => (
            <figure key={m.src} className={`h-mosaic__i h-mosaic__i--${k}`} data-reveal style={{ ['--d' as string]: `${(k % 4) * 90}ms` }}>
              <img src={m.src} alt={m.title} loading="lazy" />
              <figcaption>{m.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Giữ nguyên từ phiên bản trước ---------- */
const INDUSTRIES: { label: string; icon: LucideIcon; tone: Tone }[] = [
  { label: 'Phòng Gym & Fitness', icon: Dumbbell, tone: 'blue' },
  { label: 'Yoga & Pilates', icon: Flower2, tone: 'green' },
  { label: 'Spa & Wellness', icon: Sparkles, tone: 'orange' },
  { label: 'Bể bơi', icon: Waves, tone: 'sky' },
  { label: 'Khách sạn & Căn hộ', icon: Hotel, tone: 'navy' },
  { label: 'Trung tâm đào tạo', icon: GraduationCap, tone: 'blue' },
  { label: 'Doanh nghiệp dịch vụ', icon: Store, tone: 'orange' },
  { label: 'Sự kiện & Cộng đồng', icon: PartyPopper, tone: 'green' }
];

function Industries() {
  const row = INDUSTRIES.map(i => (
    <span key={i.label} className="s-marquee__item"><IconTile icon={i.icon} tone={i.tone} />{i.label}</span>
  ));
  return (
    <div className="s-marquee" aria-label="Lĩnh vực DANAVA phục vụ">
      <div className="s-marquee__track">
        {row}
        <span style={{ display: 'contents' }} aria-hidden="true">{INDUSTRIES.map(i => (
          <span key={i.label + '-2'} className="s-marquee__item"><IconTile icon={i.icon} tone={i.tone} />{i.label}</span>
        ))}</span>
      </div>
    </div>
  );
}

function Metrics() {
  const { data } = useSite();
  const metrics = data.metrics.filter(m => m.visible && m.value.trim());
  if (!metrics.length) return null;
  return (
    <section className="s-section s-section--tight s-section--line" aria-label="Số liệu DANAVA">
      <div className="s-container s-stats">
        {metrics.map(m => (
          <div key={m.id}>
            <p className="s-stat__value">{m.value}</p>
            <p className="s-stat__label">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  const { data } = useSite();
  const projects = useMemo(() => {
    const list = data.projects || [];
    const featured = list.filter(p => p.featured);
    return (featured.length ? featured : list).slice(0, 3);
  }, [data.projects]);
  if (!projects.length) return null;

  return (
    <section className="s-section s-section--soft" aria-labelledby="home-projects">
      <div className="s-container">
        <SectionHeading
          eyebrow="Dự án thực tế"
          title={<span id="home-projects">Khách hàng đang <span className="s-hl">vận hành cùng DANAVA</span></span>}
          action={<ArrowLink href="/du-an/">Xem tất cả dự án</ArrowLink>}
        />
        <div className={`s-grid s-snap ${projects.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
          {projects.map(p => (
            <article key={p.id} className="s-card s-card--link">
              <div className="s-card__media">
                {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <Visual icon={Users} label={p.client} />}
                {p.category && <span className="s-badge s-badge--dark">{p.category}</span>}
              </div>
              <div className="s-card__body">
                <p className="s-card__tag">{p.client}</p>
                <h3 className="s-card__title"><Link className="s-card__cover" href={`/du-an/${p.slug}/`}>{p.title}</Link></h3>
                <p className="s-card__text">{excerpt(p.summary, 150)}</p>
                <div className="s-card__foot">
                  <span className="s-link">Xem câu chuyện</span>
                  <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function News() {
  const { data } = useSite();
  const posts = useMemo(
    () => [...data.posts].filter(p => p.published).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3),
    [data.posts]
  );
  const social = getApprovedSocialPosts().slice(0, 3);
  if (!posts.length && !social.length) return null;
  const [lead, ...rest] = posts;

  return (
    <section className="s-section s-section--line" aria-labelledby="home-news">
      <div className="s-container">
        <SectionHeading
          eyebrow="Bản tin"
          title={<span id="home-news">Câu chuyện và góc nhìn <span className="s-hl">từ DANAVA</span></span>}
          action={<ArrowLink href="/kien-thuc/">Xem tất cả bài viết</ArrowLink>}
        />
        <div className="s-home-news">
          {lead && (
            <article className="s-card s-card--link s-home-news__lead">
              <div className="s-card__media">
                <img src={lead.image || postPhotos[lead.id] || '/assets/legacy/event-session.webp'} alt="" loading="lazy" />
              </div>
              <div className="s-card__body">
                <p className="s-card__meta"><span>{lead.category}</span>{lead.date && <span>{formatDate(lead.date)}</span>}</p>
                <h3 className="s-card__title"><Link className="s-card__cover" href={`/kien-thuc/${lead.slug}/`}>{lead.title}</Link></h3>
                <p className="s-card__text">{excerpt(lead.excerpt || lead.body, 180)}</p>
              </div>
            </article>
          )}
          <div className="s-home-news__list">
            {rest.map(p => (
              <Link key={p.id} href={`/kien-thuc/${p.slug}/`} className="s-home-news__item">
                <img src={p.image || postPhotos[p.id] || '/assets/legacy/event-group.webp'} alt="" loading="lazy" />
                <span>
                  <span className="s-card__meta"><span>{p.category}</span>{p.date && <span>{formatDate(p.date)}</span>}</span>
                  <strong>{p.title}</strong>
                </span>
              </Link>
            ))}
            {social.length > 0 && (
              <div className="s-home-social">
                <p className="s-home-social__title">Từ kênh chính thức</p>
                {social.map(s => (
                  <a key={s.id} href={s.originalUrl} target="_blank" rel="noopener noreferrer" className="s-home-social__item">
                    <span className="s-badge s-badge--neutral">{s.platformLabel}</span>
                    <span className="s-home-social__text">{s.title}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
