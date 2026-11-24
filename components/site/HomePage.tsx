/**
 * Trang chủ (server component) — sáng, tối giản theo phong cách trang DANAVA GO:
 * nền kem ấm có quầng cam nhẹ, tiêu đề Playfair Display chữ đứng (navy + nhấn cam), nhãn mục chữ cam nhỏ in hoa.
 * Nội dung theo bộ "Company Profile 2026" (lib/about-danava.ts: PROFILE_2026, ABOUT_DANAVA).
 * Bố cục lấy ý tưởng trang agency (cleverads.vn), không có phiếu nhập thông tin:
 * Bìa → 4 giải pháp → Hỏi ANNA → Dự án tiêu biểu (tab lọc) → Toàn bộ khách hàng & đối tác → Vì sao chọn DANAVA + mạng lưới
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
import { AnnaHome } from './anna/AnnaEntry';
import { block } from '@/lib/blocks';
import { ABOUT_DANAVA as A, PROFILE_2026 as P } from '@/lib/about-danava';
import { homeHero } from '@/lib/home-hero';
import { markOf } from '@/lib/partner-marks';
import { contactChannels } from '@/lib/contact-channels';
import { cmsBlock, cmsLink, cmsLinkText, cmsSkip, cmsText, ct } from './cms';
import { rich } from './rich';

type TextFn = ReturnType<typeof textFn>;
/** Chữ cố định của trang chủ sửa được trong trình biên tập (khóa home.*, lib/site-text.ts). */
function textFn(data: SiteData) {
  return (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `home.${k}`, def, label, opts);
}
function Eyebrow({ t, k, def }: { t: TextFn; k: string; def: string }) {
  const x = t(k, def, 'Nhãn nhỏ');
  return <p className="hb-eyebrow" {...x.a}>{x.v}</p>;
}
function Title({ t, k, def, id }: { t: TextFn; k: string; def: string; id: string }) {
  const x = t(k, def, 'Tiêu đề khối', { rich: true });
  return <h2 className="hb-h2" id={id} {...x.a}>{rich(x.v)}</h2>;
}
function More({ t, k, def, href }: { t: TextFn; k: string; def: string; href: string }) {
  const x = t(k, def, 'Chữ liên kết');
  return <Link className="hb-more" href={href}><span {...x.a}>{x.v}</span> <ArrowRight aria-hidden="true" /></Link>;
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
      href: projectHref(p), tag: p.industry || p.category || 'Dự án',
      cms: { ...(p.industry || p.category ? { tag: cmsText(`rec.projects.${p.id}.${p.industry ? 'industry' : 'category'}`, p.industry ? 'Ngành (hồ sơ dự án)' : 'Danh mục (hồ sơ dự án)', { scope: 'record', scopeLabel: 'Hồ sơ dự án' }) } : {}), client: cmsText(`rec.projects.${p.id}.client`, 'Khách hàng (hồ sơ dự án)', { scope: 'record', scopeLabel: 'Hồ sơ dự án' }), title: cmsText(`rec.projects.${p.id}.title`, 'Tên dự án', { scope: 'record', scopeLabel: 'Hồ sơ dự án' }), text: cmsText(`rec.projects.${p.id}.summary`, 'Tóm tắt dự án', { multiline: true, scope: 'record', scopeLabel: 'Hồ sơ dự án' }) }
    })),
    ...MARKETING_ENGAGEMENTS.filter(m => m.image).map(m => {
      const c = ct(data, `home.mkt.${m.id}.client`, m.client, 'Khách hàng'), ti = ct(data, `home.mkt.${m.id}.title`, m.title, 'Tên hoạt động'), tx = ct(data, `home.mkt.${m.id}.text`, m.scope.join(' · '), 'Mô tả', { multiline: true }), tg = ct(data, `home.mkt.${m.id}.tag`, m.throughPartner ? 'Qua đối tác' : 'Marketing', 'Nhãn');
      return {
        id: 'm-' + m.id, group: 'marketing' as const, client: c.v, title: ti.v, text: tx.v, image: m.image!.src, logo: m.logo,
        href: '/giai-phap/digital-marketing/#du-an-marketing', tag: tg.v, cms: { client: c.a, title: ti.a, text: tx.a, tag: tg.a }
      };
    })
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
  // Giữ vị trí gốc trong menu để sửa đúng mục (block.menu.columns.0.items.<i>)
  const products = (block(data, 'menu').columns[0]?.items ?? []).map((it, at) => ({ ...it, at })).filter(it => it.href);
  // Đường hành trình 2016 → 2026: 2016 theo chủ sở hữu (21/11/2026), 2016 theo đăng ký doanh nghiệp, 2021–2026 theo MILESTONES (trang Về chúng tôi)
  const journey = (() => {
    const steps = [
      { year: 2016, title: 'Khởi đầu hành trình' },
      { year: 2016, title: 'Thành lập Công ty Cổ phần Giải pháp DANAVA' },
      ...MILESTONES.map(m => ({ year: Number(m.year), title: m.title }))
    ].filter(x => x.year >= 2016).sort((x, y) => x.year - y.year);
    const W = 300, X0 = 16, X1 = 284, YB = 84, YT = 22, GAP = 37;
    // mỗi năm một chấm: nhiều việc cùng năm gộp vào chung nhãn
    const years = [...new Set(steps.map(x => x.year))].map(year => ({ year, title: steps.filter(x => x.year === year).map(x => x.title).join(' · ') }));
    const xs = years.map(x => X0 + ((x.year - 2016) / 10) * (X1 - X0));
    // hai năm sát nhau: tách đều về hai phía cho nhãn dễ đọc, mốc đầu và cuối đứng yên
    for (let i = 1; i < xs.length; i++) {
      const push = (GAP - (xs[i] - xs[i - 1])) / 2;
      if (push <= 0) continue;
      if (i > 1) xs[i - 1] -= push;
      if (i < xs.length - 1) xs[i] += push;
    }
    const pts = years.map((st, i) => ({ ...st, x: xs[i], y: YB - (i / Math.max(1, years.length - 1)) * (YB - YT) }));
    const line = pts.map((p, i) => i === 0 ? `M${p.x.toFixed(1)} ${p.y.toFixed(1)}` : (() => { const q = pts[i - 1], mx = ((q.x + p.x) / 2).toFixed(1); return `C${mx} ${q.y.toFixed(1)} ${mx} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`; })()).join(' ');
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)} ${YB + 10} L${pts[0].x.toFixed(1)} ${YB + 10} Z`;
    return { W, pts, line, area, last: pts[pts.length - 1] };
  })();
  const posts = knowledgePosts(data).slice(0, 3);
  const hero = homeHero(data);
  const t = textFn(data);
  const j = t('journey.title', 'Hành trình DANAVA', 'Tiêu đề hành trình'), js = t('journey.range', '2016 – nay', 'Khoảng thời gian');
  const social = getApprovedSocialPosts().filter(isPlatformSourced).slice(0, 3);

  return (
    <main id="main" className="h-home hb">
      <Reveal />

      {/* Bìa */}
      <section className="hb-cover" aria-labelledby="home-title">
        {/* Vùng ghim: cuộn trong vùng này để dựng mô hình (sàn → vách → bàn họp → nội thất → hoàn thiện) */}
        <div className="hb-pin">
        <div className="s-container hb-cover__grid">
          <div className="hb-cover__copy" {...cmsBlock('Màn mở đầu', 'home-hero', { panel: 'page:mo-dau' })}>
            {/* Chữ màn mở đầu: admin → Website → Trang → Trang chủ → Màn mở đầu (lib/home-hero.ts) */}
            <p className="hb-pill"><Sparkles aria-hidden="true" /><span {...cmsText('hero.kicker', 'Nhãn nhỏ')}>{hero.kicker}</span> </p>
            <h1 className="hb-title" id="home-title">
              <span className="hb-line" style={{ ['--l' as string]: 0 }} {...cmsText('hero.line1', 'Tiêu đề dòng 1')}>{hero.line1}</span>
              <em className="hb-line" style={{ ['--l' as string]: 1 }} {...cmsText('hero.line2', 'Tiêu đề dòng 2')}>{hero.line2}</em>
            </h1>
            <p className="hb-lead" {...cmsText('hero.lead', 'Câu dẫn', { multiline: true })}>{hero.lead}</p>
            <div className="hb-cta">
              <Link className="hb-btn hb-btn--primary" href={hero.primaryHref} {...cmsLink('hero.primaryLabel', 'hero.primaryHref', 'Nút chính')}><span {...cmsLinkText}>{hero.primaryLabel}</span> <ArrowRight aria-hidden="true" /></Link>
              {hero.secondaryLabel && <Link className="hb-btn hb-btn--ghost" href={hero.secondaryHref} {...cmsLink('hero.secondaryLabel', 'hero.secondaryHref', 'Nút phụ')}><span {...cmsLinkText}>{hero.secondaryLabel}</span></Link>}
            </div>
            {/* Đường hành trình DANAVA 2016 → nay (mốc năm thật, không có trục số) */}
            <figure className="hb-journey">
              <figcaption><span {...j.a}>{j.v}</span> <small {...js.a}>{js.v}</small></figcaption>
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
              {(() => { const x = t('journey.now', journey.last.title, 'Cột mốc hiện tại'); return <p className="hb-journey__now"><i />{journey.last.year} · <span {...x.a}>{x.v}</span></p>; })()}
            </figure>
          </div>
          <div className="hb-cover__3d" {...cmsSkip}>
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
                    {(() => { const a = t(`sol.${i}.title`, sv.title, 'Tên giải pháp'), b = t(`sol.${i}.text`, sv.text, 'Mô tả giải pháp'); return <span><strong {...a.a}>{a.v}</strong><small {...b.a}>{b.v}</small></span>; })()}
                    <ArrowUpRight className="hb-sol__go" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Số liệu DANAVA — nằm dưới phần giải pháp; các con số đếm lên khi cuộn tới (CountUp) */}
      <section className="hb-numbers" aria-labelledby="t-num">
        <div className="s-container">
          <h2 className="s-sr" id="t-num">Số liệu của DANAVA</h2>
          <dl className="hb-stats">
            {A.stats.map((st, i) => { const x = t(`stats.${i}.label`, st.label, 'Nhãn số liệu'); return <div key={st.label}><dd><CountUp value={st.value} /></dd><dt {...x.a}>{x.v}</dt></div>; })}
          </dl>
          {(() => { const x = t('stats.source', `Số liệu trên nền tảng danava.vn · ${A.checked}`, 'Nguồn số liệu'); return <p className="hb-src" {...x.a}>{x.v}</p>; })()}
        </div>
      </section>

      <AnnaHome />

      {/* Dự án tiêu biểu — có tab lọc */}
      {cases.length > 0 && (
        <section className="hb-sec" id="du-an" aria-labelledby="t-cases">
          <div className="s-container">
            <div className="hb-row">
              <div><Eyebrow t={t} k="cases.eyebrow" def="Dự án tiêu biểu" /><Title t={t} k="cases.title" def="Những dự án *DANAVA đã thực hiện.*" id="t-cases" /></div>
              <More t={t} k="cases.more" def="Xem tất cả dự án" href="/du-an/" />
            </div>
            <HomeCases items={cases} ui={{ all: t('cases.tab.all', 'Tất cả', 'Nhãn tab'), product: t('cases.tab.product', 'Phần mềm & Website', 'Nhãn tab'), marketing: t('cases.tab.marketing', 'Marketing & Truyền thông', 'Nhãn tab'), more: t('cases.card.more', 'Xem thêm', 'Chữ liên kết') }} />
          </div>
        </section>
      )}

      {/* Khách hàng & đối tác — hiện toàn bộ logo */}
      {logos.length > 0 && (
        <section className="hb-sec hb-cream hb-clients" id="doi-tac" aria-labelledby="t-clients">
          <div className="s-container">
            <div className="hb-clients__head">
              <Eyebrow t={t} k="clients.eyebrow" def="Khách hàng & đối tác" />
              {(() => { const u = t('clients.unit', 'thương hiệu', 'Đơn vị'), h = t('clients.title', 'đã đồng hành cùng DANAVA.', 'Tiêu đề khối'), p = t('clients.text', 'Từ phòng tập, studio wellness trên nền tảng danava.vn đến các thương hiệu bất động sản, nội thất và ẩm thực tin chọn DANAVA cho phần mềm, website và truyền thông.', 'Đoạn giới thiệu', { multiline: true }); return <><h2 className="hb-h2" id="t-clients"><em><CountUp value={logos.length} suffix="" /> <span {...u.a}>{u.v}</span></em> <span {...h.a}>{h.v}</span></h2><p className="hb-text" {...p.a}>{p.v}</p></>; })()}
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
            <More t={t} k="clients.more" def="Xem chi tiết đối tác" href="/doi-tac/" />
          </div>
        </section>
      )}

      {/* Vì sao chọn DANAVA + mạng lưới đồng hành */}
      <section className="hb-sec hb-why" id="ve-danava" aria-labelledby="t-why">
        <div className="s-container">
          <div className="hb-why__intro">
            <div data-reveal>
              <Eyebrow t={t} k="why.eyebrow" def="Vì sao chọn DANAVA" />
              <Title t={t} k="why.title" def="Chuyển đổi số không chỉ là công nghệ, *đó là hành trình kiến tạo giá trị.*" id="t-why" />
              {(() => { const x = t('why.text', P.about[0], 'Đoạn giới thiệu', { multiline: true }); return <p className="hb-text" {...x.a}>{x.v}</p>; })()}
              <More t={t} k="why.more" def="Câu chuyện & đội ngũ DANAVA" href="/ve-danava/" />
            </div>
            <figure className="hb-why__photo" data-reveal>
              <img src={A.founder.image} alt={`${A.founder.name}, ${A.founder.title} DANAVA`} loading="lazy" decoding="async" width={1200} height={885} />
              {(() => { const a = t('why.founder.name', A.founder.name, 'Tên người sáng lập'), b = t('why.founder.role', A.founder.title, 'Chức danh'); return <figcaption><b {...a.a}>{a.v}</b><span {...b.a}>{b.v}</span></figcaption>; })()}
            </figure>
          </div>
          <ol className="hb-why__grid">
            {P.why.map((w, i) => (
              <li key={w.title} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                <IconBox icon={WHY_ICONS[i % WHY_ICONS.length]} tone={i % 2 ? 'orange' : 'blue'} />
                {(() => { const a = t(`why.items.${i}.title`, w.title, 'Tiêu đề lý do'), b = t(`why.items.${i}.text`, w.text, 'Mô tả lý do', { multiline: true }); return <><h3 {...a.a}>{a.v}</h3><p {...b.a}>{b.v}</p></>; })()}
              </li>
            ))}
          </ol>
          <div className="hb-network" data-reveal>
            {(() => { const x = t('network.title', 'Mạng lưới đồng hành', 'Tiêu đề'); return <p className="hb-network__title" {...x.a}>{x.v}</p>; })()}
            <ul>
              {A.network.map((n, i) => (
                <li key={n.name}><IconBox icon={NETWORK_ICONS[i % NETWORK_ICONS.length]} tone={i % 2 ? 'orange' : 'blue'} />{(() => { const a = t(`network.${i}.name`, n.name, 'Tên'), b = t(`network.${i}.text`, n.text, 'Mô tả'); return <span><strong {...a.a}>{a.v}</strong><small {...b.a}>{b.v}</small></span>; })()}</li>
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
            <div><Eyebrow t={t} k="products.eyebrow" def="Sản phẩm của DANAVA" /><Title t={t} k="products.title" def="Nền tảng do DANAVA *tự phát triển.*" id="t-products" /></div>
            <More t={t} k="products.more" def="Hệ sinh thái DANAVA" href="/he-sinh-thai/" />
          </div>
          <ul className="hb-products">
            {products.map((it, i) => (
              <li key={it.href} data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
                <Link href={it.href}>
                  <HrefIcon href={it.href} />
                  <h3><span {...cmsText(`block.menu.columns.0.items.${it.at}.label`, 'Tên sản phẩm (menu)', { scope: 'global' })}>{it.label}</span>{it.badge && <span className="hb-products__badge">{it.badge}</span>}</h3>
                  <p {...cmsText(`block.menu.columns.0.items.${it.at}.desc`, 'Mô tả sản phẩm (menu)', { scope: 'global' })}>{it.desc}</p>
                  {(() => { const x = t('products.go', 'Tìm hiểu', 'Chữ liên kết'); return <span className="hb-services__go"><span {...x.a}>{x.v}</span> <ArrowUpRight aria-hidden="true" /></span>; })()}
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
            <div><Eyebrow t={t} k="process.eyebrow" def="Quy trình làm việc" /><Title t={t} k="process.title" def="Bảy bước *đồng hành cùng bạn.*" id="t-process" /></div>
          </div>
          <ol className="hb-steps">
            {A.process.map((st, i) => (
              <li key={st.name} data-reveal style={{ ['--d' as string]: `${i * 60}ms` }}>
                <IconBox icon={PROCESS_ICONS[i % PROCESS_ICONS.length]} tone={i % 2 ? 'orange' : 'blue'} />
                <span className="hb-steps__no">{String(i + 1).padStart(2, '0')}</span>
                {(() => { const a = t(`process.${i}.name`, st.name, 'Tên bước'), b = t(`process.${i}.text`, st.text, 'Mô tả bước', { multiline: true }); return <><strong {...a.a}>{a.v}</strong><small {...b.a}>{b.v}</small></>; })()}
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
              <div><Eyebrow t={t} k="news.eyebrow" def="Blogs" /><Title t={t} k="news.title" def="Tin mới *từ DANAVA.*" id="home-news" /></div>
              <More t={t} k="news.more" def="Xem tất cả" href="/blogs/" />
            </div>
            <div className={`s-grid s-snap ${posts.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>{posts.map(p => <PostTile key={p.id} post={p} data={data} />)}</div>
            {social.length > 1 && (
              <div className="s-home-social u-subblock">
                {(() => { const x = t('news.social', 'Từ kênh chính thức', 'Tiêu đề'); return <p className="s-home-social__title" {...x.a}>{x.v}</p>; })()}
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
          {(() => { const a = t('final.title', 'Sẵn sàng phát triển *cùng DANAVA?*', 'Tiêu đề', { rich: true }), b = t('final.lead', `${P.tagline}.`, 'Câu dẫn', { multiline: true }); return <><h2 className="hb-final__title" id="t-contact" {...a.a}>{rich(a.v)}</h2><p className="hb-lead hb-final__lead" {...b.a}>{b.v}</p></>; })()}
          <div className="hb-cta hb-final__cta">
            {(() => { const a = t('final.primary', 'Nhận tư vấn', 'Chữ nút chính'), b = t('final.secondary', 'Đăng ký demo DANAVA Studio', 'Chữ nút phụ'); return <><Link className="hb-btn hb-btn--primary" href="/lien-he/"><span {...a.a}>{a.v}</span> <ArrowRight aria-hidden="true" /></Link><Link className="hb-btn hb-btn--ghost" href="/lien-he/?service=danava-studio"><span {...b.a}>{b.v}</span></Link></>; })()}
          </div>
          <ul className="hb-final__info">
            <li><Phone aria-hidden="true" /><a href={`tel:${phone}`}>{formatPhone(phone)}</a></li>
            <li><Mail aria-hidden="true" /><a href={`mailto:${email}`}><span {...cmsText('site.email', 'Email liên hệ', { scope: 'global' })}>{email}</span></a></li>
            {(() => { const a = t('final.social', P.social, 'Tên kênh mạng xã hội'), b = t('final.website', P.website, 'Tên website'); return <><li><AtSign aria-hidden="true" /><a href={co.facebook} target="_blank" rel="noopener"><span {...a.a}>{a.v}</span><span className="s-sr"> (mở tab mới)</span></a></li><li><Globe aria-hidden="true" /><a href="https://danava.vn" target="_blank" rel="noopener"><span {...b.a}>{b.v}</span><span className="s-sr"> (mở tab mới)</span></a></li></>; })()}
            <li><MapPin aria-hidden="true" /><a href={co.mapUrl} target="_blank" rel="noopener"><span {...cmsText('block.company.address', 'Địa chỉ công ty', { scope: 'global' })}>{co.address}</span></a></li>
          </ul>
          {(() => { const x = t('final.legal', A.company, 'Tên pháp nhân'); return <p className="hb-final__legal" {...x.a}>{x.v}</p>; })()}
        </div>
      </section>
    </main>
  );
}
