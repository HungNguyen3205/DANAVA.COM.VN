/**
 * Trang chủ (server component) — sáng, tối giản theo phong cách trang DANAVA GO:
 * nền kem ấm có quầng cam nhẹ, tiêu đề Playfair Display chữ đứng (navy + nhấn cam), nhãn mục chữ cam nhỏ in hoa.
 * Nội dung theo bộ "Company Profile 2026" (lib/about-danava.ts: PROFILE_2026, ABOUT_DANAVA).
 * Bố cục lấy ý tưởng trang agency (cleverads.vn), không có phiếu nhập thông tin:
 * Bìa → 4 giải pháp → Dự án tiêu biểu (tab lọc) → Toàn bộ khách hàng & đối tác → Vì sao chọn DANAVA + mạng lưới
 * → Sản phẩm tự phát triển → Quy trình 7 bước → Cảm nhận → Blogs → Liên hệ. Mỗi mục có icon nét mảnh (components/site/icons.tsx).
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, AtSign, Globe, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { getApprovedSocialPosts, isPlatformSourced } from '@/lib/social-feed';
import { knowledgePosts, publicPartners, publicTestimonials, publishedProjects, projectHref } from '@/lib/site-queries';
import { CONTACT, formatPhone, formatDate } from './catalog';
import { PostTile, Testimonials } from './blocks';
import { HomeCases, type HomeCase } from './HomeCases';
import { IconBox, HrefIcon, WHY_ICONS, PROCESS_ICONS, SERVICE_ICONS, NETWORK_ICONS } from './icons';
import { MARKETING_ENGAGEMENTS } from '@/lib/marketing-portfolio';
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
            <span className="hb-float hb-float--a" aria-hidden="true"><MapPin aria-hidden="true" />Văn phòng DANAVA · Đà Nẵng · {P.years.replace(' - ', ' – ')}</span>
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
            <div className="hb-row">
              <div>
                <Eyebrow>Khách hàng & đối tác</Eyebrow>
                <h2 className="hb-h2" id="t-clients"><em><CountUp value={logos.length} suffix="" /> thương hiệu</em> đã đồng hành cùng DANAVA.</h2>
              </div>
              <Link className="hb-more" href="/doi-tac/">Xem chi tiết đối tác <ArrowRight aria-hidden="true" /></Link>
            </div>
            <ul className="hb-logos">
              {logos.map((c, i) => (
                <li key={c.key} data-reveal style={{ ['--d' as string]: `${(i % 6) * 50}ms` }}>
                  <Link href={c.href} aria-label={`${c.name} — ${c.role}`}>
                    <span className={`hb-logos__mark${c.fill ? ' is-mark' : ''}`}>{c.logo ? <img src={c.logo} alt="" loading="lazy" decoding="async" width={96} height={96} /> : <b>{c.name.charAt(0)}</b>}</span>
                    <span className="hb-logos__name"><strong>{c.name}</strong><small>{c.role}</small></span>
                  </Link>
                </li>
              ))}
            </ul>
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
