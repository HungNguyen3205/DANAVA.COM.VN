/**
 * Trang chủ (server component) — sáng, tối giản theo phong cách trang DANAVA GO:
 * nền kem ấm có quầng cam nhẹ, tiêu đề Playfair Display chữ đứng (navy + nhấn cam), nhãn mục chữ cam nhỏ in hoa.
 * Nội dung theo bộ "Company Profile 2026" (lib/about-danava.ts: PROFILE_2026, ABOUT_DANAVA).
 * Bố cục lấy ý tưởng trang agency (cleverads.vn), không có phiếu nhập thông tin:
 * Bìa → 4 giải pháp → Dự án tiêu biểu (tab lọc) → Toàn bộ khách hàng & đối tác → Vì sao chọn DANAVA + mạng lưới
 * → Ảnh doanh nghiệp → Sản phẩm tự phát triển → Quy trình 7 bước → Cảm nhận → Blogs → Liên hệ. Mỗi mục có icon nét mảnh (components/site/icons.tsx).
 */
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, AtSign, Globe, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { getApprovedSocialPosts, isPlatformSourced } from '@/lib/social-feed';
import { knowledgePosts, publicPartners, publicTestimonials, publishedProjects, projectHref } from '@/lib/site-queries';
import { CONTACT, formatPhone, formatDate } from './catalog';
import { PostTile, Testimonials } from './blocks';
import { HomeCases, type HomeCase } from './HomeCases';
import { IconBox, HrefIcon, WHY_ICONS, PROCESS_ICONS, SERVICE_ICONS, NETWORK_ICONS } from './icons';
import { MARKETING_ENGAGEMENTS } from '@/lib/marketing-portfolio';
import { MILESTONES } from './company-content';
import { Reveal, CountUp } from './HomeClient';
import { OfficeScene } from './OfficeScene';
import { CompanyGallery } from './CompanyGallery';
import { block } from '@/lib/blocks';
import { ABOUT_DANAVA as A, PROFILE_2026 as P } from '@/lib/about-danava';
import { markOf } from '@/lib/partner-marks';
import { contactChannels } from '@/lib/contact-channels';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="hb-eyebrow">{children}</p>;
}

export default function HomePage({ data }: { data: SiteData }) {
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;
  const co = block(data, 'company');
  const partners = publicPartners(data);
  const testimonials = publicTestimonials(data);
  const allProjects = publishedProjects(data);
  // Dự án tiêu biểu: case study đã xuất bản (nổi bật trước) + dự án marketing có ảnh thật
  const cases: HomeCase[] = [
    ...[...allProjects].sort((x, y) => Number(y.featured) - Number(x.featured)).map(p => ({
      id: 'p-' + p.id, group: 'product' as const, client: p.client, title: p.title, text: p.summary, image: p.image || undefined,
      href: projectHref(p), tag: p.industry || p.category || 'Dự án'
    })),
    ...MARKETING_ENGAGEMENTS.filter(m => m.image).map(m => ({
      id: 'm-' + m.id, group: 'marketing' as const, client: m.client, title: m.title, text: m.scope.join(' · '), image: m.image!.src, logo: m.logo,
      href: '/giai-phap/digital-marketing/#du-an-marketing', tag: m.throughPartner ? 'Qua đối tác' : 'Marketing'
    }))
  ];
  // Toàn bộ khách hàng & đối tác: đối tác trên nền tảng + khách hàng marketing (bỏ trùng theo tên)
  const logos = (() => {
    const out: { key: string; name: string; role: string; logo?: string; fill?: boolean; href: string }[] = [];
    const seen = new Set<string>();
    for (const c of partners) {
      const k = c.name.trim().toLowerCase(); if (seen.has(k)) continue; seen.add(k);
      const project = allProjects.find(p => p.id === c.projectId);
      const mk = c.logo ? markOf(c.logo) : null;
      out.push({ key: 'c-' + c.id, name: c.name, role: project ? 'Case study' : (c.role || 'Đối tác'), logo: mk?.src, fill: mk?.fill, href: project ? projectHref(project) : `/doi-tac/#${c.id}` });
    }
    for (const m of MARKETING_ENGAGEMENTS) {
      const k = m.client.trim().toLowerCase(); if (seen.has(k)) continue; seen.add(k);
      out.push({ key: 'm-' + m.id, name: m.client, role: m.throughPartner ? 'Truyền thông qua đối tác' : 'Marketing & truyền thông', logo: m.logo, href: '/giai-phap/digital-marketing/#du-an-marketing' });
    }
    return out;
  })();
  const products = block(data, 'menu').columns[0]?.items.filter(it => it.href) ?? [];
  // Đường hành trình 2016 → 2026: 2016 theo chủ sở hữu (21/11/2026), 2018 theo đăng ký doanh nghiệp, 2021–2026 theo MILESTONES (trang Về chúng tôi)
  const journey = (() => {
    const steps = [
      { year: 2016, title: 'Khởi đầu hành trình' },
      { year: 2018, title: 'Thành lập Công ty Cổ phần Giải pháp DANAVA' },
      ...MILESTONES.map(m => ({ year: Number(m.year), title: m.title }))
    ].filter(x => x.year >= 2016).sort((x, y) => x.year - y.year);
    const W = 300, X0 = 16, X1 = 284, YB = 84, YT = 22;
    const pts = steps.map((st, i) => ({ ...st, x: X0 + ((st.year - 2016) / 10) * (X1 - X0), y: YB - (i / Math.max(1, steps.length - 1)) * (YB - YT) }));
    const line = pts.map((p, i) => i === 0 ? `M${p.x.toFixed(1)} ${p.y.toFixed(1)}` : (() => { const q = pts[i - 1], mx = ((q.x + p.x) / 2).toFixed(1); return `C${mx} ${q.y.toFixed(1)} ${mx} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`; })()).join(' ');
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)} ${YB + 10} L${pts[0].x.toFixed(1)} ${YB + 10} Z`;
    return { W, pts, line, area, last: pts[pts.length - 1] };
  })();
  const posts = knowledgePosts(data).slice(0, 3);
  const social = getApprovedSocialPosts().filter(isPlatformSourced).slice(0, 3);

  return (
    <main id="main" className="h-home hb">
      <Reveal />

      {/* Bìa */}
      <section className="hb-cover" aria-labelledby="home-title">
        {/* Vùng ghim: cuộn trong vùng này để dựng mô hình (sàn → vách → bàn họp → nội thất → hoàn thiện) */}
        <div className="hb-pin">
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
            {/* Đường hành trình DANAVA 2016 → nay (mốc năm thật, không có trục số) */}
            <figure className="hb-journey">
              <figcaption>Hành trình DANAVA <small>2016 – nay</small></figcaption>
              <svg viewBox={`0 0 ${journey.W} 108`} role="img" aria-label={`Hành trình DANAVA: ${journey.pts.map(p => `${p.year} ${p.title}`).join('; ')}`}>
                <defs>
                  <linearGradient id="hb-journey-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e0611a" stopOpacity=".28" /><stop offset="1" stopColor="#e0611a" stopOpacity="0" /></linearGradient>
                </defs>
                <line x1="16" x2="284" y1="94" y2="94" className="hb-journey__base" />
                <path d={journey.area} fill="url(#hb-journey-fill)" className="hb-journey__area" />
                <path d={journey.line} pathLength={1} className="hb-journey__line" />
                {journey.pts.map((p, i) => (
                  <g key={p.year} className={`hb-journey__pt${p === journey.last ? ' is-last' : ''}`} style={{ ['--i' as string]: i }}>
                    <title>{`${p.year}: ${p.title}`}</title>
                    <circle cx={p.x} cy={p.y} r="10" className="hb-journey__hit" />
                    <circle cx={p.x} cy={p.y} r={p === journey.last ? 5 : 4} className="hb-journey__dot" />
                    <text x={p.x} y="105" className="hb-journey__year">{p.year}</text>
                  </g>
                ))}
              </svg>
              <p className="hb-journey__now"><i />{journey.last.year} · {journey.last.title}</p>
            </figure>
          </div>
          <div className="hb-cover__3d">
            <OfficeScene fallback="/assets/about/office-sm.webp" qrUrl={contactChannels(data).zalo} />
            <span className="hb-float hb-float--a" aria-hidden="true"><MapPin />Văn phòng DANAVA · Đà Nẵng · {P.years.replace(' - ', ' – ')}</span>
            <span className="hb-float hb-float--b" aria-hidden="true"><i />{logos.length} thương hiệu đã đồng hành</span>
            <div className="hb-build" aria-hidden="true">
              <p><ArrowDown />Lướt xuống để dựng văn phòng</p>
              <ol>{['Sàn', 'Vách', 'Bàn họp', 'Nội thất', 'Hoàn thiện'].map((t, i) => <li key={t} data-build-step={i} className={i === 0 ? 'is-on' : undefined}><b>{i + 1}</b>{t}</li>)}</ol>
              <span className="hb-build__bar"><i /></span>
            </div>
          </div>
        </div>
        </div>
        <div className="s-container">
          <dl className="hb-stats">
            {A.stats.map(st => <div key={st.label}><dd><CountUp value={st.value} /></dd><dt>{st.label}</dt></div>)}
          </dl>
          <p className="hb-src">Số liệu trên nền tảng danava.vn · {A.checked}</p>
        </div>
      </section>

      {/* Giải pháp — 4 ô nhanh ngay dưới bìa */}
      <section className="hb-solutions" id="giai-phap" aria-labelledby="t-sol">
        <div className="s-container">
          <h2 className="s-sr" id="t-sol">Giải pháp của DANAVA</h2>
          <ul className="hb-sol">
            {P.services.map((sv, i) => {
              const Ico = SERVICE_ICONS[sv.title];
              return (
                <li key={sv.title} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
                  <Link href={sv.href}>
                    {Ico ? <IconBox icon={Ico} tone={i % 2 ? 'blue' : 'orange'} /> : <HrefIcon href={sv.href} />}
                    <span><strong>{sv.title}</strong><small>{sv.text}</small></span>
                    <ArrowUpRight className="hb-sol__go" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Dự án tiêu biểu — có tab lọc */}
      {cases.length > 0 && (
        <section className="hb-sec" id="du-an" aria-labelledby="t-cases">
          <div className="s-container">
            <div className="hb-row">
              <div><Eyebrow>Dự án tiêu biểu</Eyebrow><h2 className="hb-h2" id="t-cases">Những dự án <em>DANAVA đã thực hiện.</em></h2></div>
              <Link className="hb-more" href="/du-an/">Xem tất cả dự án <ArrowRight aria-hidden="true" /></Link>
            </div>
            <HomeCases items={cases} />
          </div>
        </section>
      )}

      {/* Khách hàng & đối tác — hiện toàn bộ logo */}
      {logos.length > 0 && (
        <section className="hb-sec hb-cream hb-clients" id="doi-tac" aria-labelledby="t-clients">
          <div className="s-container">
            <div className="hb-clients__head">
              <Eyebrow>Khách hàng & đối tác</Eyebrow>
              <h2 className="hb-h2" id="t-clients"><em><CountUp value={logos.length} suffix="" /> thương hiệu</em> đã đồng hành cùng DANAVA.</h2>
              <p className="hb-text">Từ phòng tập, studio wellness trên nền tảng danava.vn đến các thương hiệu bất động sản, nội thất và ẩm thực tin chọn DANAVA cho phần mềm, website và truyền thông.</p>
            </div>
          </div>
          {/* Dải logo trôi ngang (ý tưởng cleverads.vn): chỉ logo, rê chuột dừng lại và hiện tên */}
          <div className="hb-marquee">
            {[0, 1, 2].map(r => {
              const row = logos.filter((_, i) => i % 3 === r);
              return row.length > 0 && (
                <div key={r} className={`hb-marquee__row${r === 1 ? ' is-rev' : ''}`} style={{ ['--dur' as string]: `${row.length * 5}s` }}>
                  {[0, 1, 2].map(k => (
                    <ul key={k} aria-hidden={k > 0 ? true : undefined}>
                      {row.map(c => (
                        <li key={c.key}>
                          <Link href={c.href} tabIndex={k > 0 ? -1 : undefined} aria-label={`${c.name} — ${c.role}`} title={c.name}>
                            {c.logo ? <img src={c.logo} alt="" loading="lazy" decoding="async" width={96} height={96} /> : <b>{c.name}</b>}
                            <span className="hb-marquee__name">{c.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="s-container hb-clients__more">
            <Link className="hb-more" href="/doi-tac/">Xem chi tiết đối tác <ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>
      )}

      {/* Vì sao chọn DANAVA + mạng lưới đồng hành */}
      <section className="hb-sec hb-why" id="ve-danava" aria-labelledby="t-why">
        <div className="s-container">
          <div className="hb-why__intro">
            <div data-reveal>
              <Eyebrow>Vì sao chọn DANAVA</Eyebrow>
              <h2 className="hb-h2" id="t-why">Chuyển đổi số không chỉ là công nghệ, <em>đó là hành trình kiến tạo giá trị.</em></h2>
              <p className="hb-text">{P.about[0]}</p>
              <Link className="hb-more" href="/ve-danava/">Câu chuyện & đội ngũ DANAVA <ArrowRight aria-hidden="true" /></Link>
            </div>
            <figure className="hb-why__photo" data-reveal>
              <img src={A.founder.image} alt={`${A.founder.name}, ${A.founder.title} DANAVA`} loading="lazy" decoding="async" width={1200} height={885} />
              <figcaption><b>{A.founder.name}</b>{A.founder.title}</figcaption>
            </figure>
          </div>
          <ol className="hb-why__grid">
            {P.why.map((w, i) => (
              <li key={w.title} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                <IconBox icon={WHY_ICONS[i % WHY_ICONS.length]} tone={i % 2 ? 'orange' : 'blue'} />
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </li>
            ))}
          </ol>
          <div className="hb-network" data-reveal>
            <p className="hb-network__title">Mạng lưới đồng hành</p>
            <ul>
              {A.network.map((n, i) => (
                <li key={n.name}><IconBox icon={NETWORK_ICONS[i % NETWORK_ICONS.length]} tone={i % 2 ? 'orange' : 'blue'} /><span><strong>{n.name}</strong><small>{n.text}</small></span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CompanyGallery data={data} />

      {/* Hệ sinh thái sản phẩm */}
      <section className="hb-sec hb-cream" aria-labelledby="t-products">
        <div className="s-container">
          <div className="hb-row">
            <div><Eyebrow>Sản phẩm của DANAVA</Eyebrow><h2 className="hb-h2" id="t-products">Nền tảng do DANAVA <em>tự phát triển.</em></h2></div>
            <Link className="hb-more" href="/he-sinh-thai/">Hệ sinh thái DANAVA <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ul className="hb-products">
            {products.map((it, i) => (
              <li key={it.href} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
                <Link href={it.href}>
                  <HrefIcon href={it.href} />
                  <h3>{it.label}{it.badge && <span className="hb-products__badge">{it.badge}</span>}</h3>
                  <p>{it.desc}</p>
                  <span className="hb-services__go">Tìm hiểu <ArrowUpRight aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quy trình */}
      <section className="hb-sec hb-process" aria-labelledby="t-process">
        <div className="s-container">
          <div className="hb-row">
            <div><Eyebrow>Quy trình làm việc</Eyebrow><h2 className="hb-h2" id="t-process">Bảy bước <em>đồng hành cùng bạn.</em></h2></div>
          </div>
          <ol className="hb-steps">
            {A.process.map((st, i) => (
              <li key={st.name} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}>
                <IconBox icon={PROCESS_ICONS[i % PROCESS_ICONS.length]} tone={i % 2 ? 'orange' : 'blue'} />
                <span className="hb-steps__no">{String(i + 1).padStart(2, '0')}</span>
                <strong>{st.name}</strong>
                <small>{st.text}</small>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials items={testimonials} />

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
