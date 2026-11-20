/**
 * /he-sinh-thai/ — Hệ sinh thái DANAVA (server component).
 * Sơ đồ hệ sinh thái → hành trình khách hàng (đơn vị nào giúp ở bước nào) → 4 khối năng lực với ảnh sản phẩm thật
 * → sản phẩm đang chạy (đã kiểm tra) → đối tác đồng hành → liên hệ.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Hotel, Handshake, LayoutDashboard, GraduationCap, Globe, Plane, Users, Sparkles, type LucideIcon } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import type { EcosystemCategory, EcosystemUnit } from '@/lib/ecosystem';
import { ecosystemFor } from '@/lib/blocks';
import { publicPartners, publishedProjects } from '@/lib/site-queries';
import { Crumbs, CtaBand } from './ui';
import { BrowserFrame } from './showcase';
import { pageCopy } from '@/lib/blocks';
import { rich } from './rich';

const ICONS: Record<string, LucideIcon> = {
  studio: LayoutDashboard, platform: Globe, elearning: GraduationCap, website: Globe, pms: Hotel,
  media: Sparkles, go: Plane, events: Plane, 'yoga-club': Users, 'dong-hanh': Handshake
};
/** Đơn vị hiện trên sơ đồ quanh logo DANAVA. */
const ORBIT = ['studio', 'website', 'elearning', 'pms', 'media', 'go'];
const CAT_NO: Record<EcosystemCategory, string> = { 'san-pham-so': '01', 'du-lich-su-kien': '02', 'cong-dong': '03', 'truyen-thong': '' };

function Unit({ u, flip }: { u: EcosystemUnit; flip: boolean }) {
  const Icon = ICONS[u.id] || Sparkles;
  const ext = u.officialLink.isExternal;
  return (
    <article id={u.id} className={`eco-unit${flip ? ' eco-unit--flip' : ''}`} aria-labelledby={`eco-${u.id}`}>
      <div className="eco-unit__media">
        {u.screenshot
          ? (u.screenshot.includes('/profile/') || u.screenshot.includes('/legacy/')
            ? <figure className="eco-unit__photo"><img src={u.screenshot} alt={u.name} loading="lazy" decoding="async" width={1200} height={750} /></figure>
            : <BrowserFrame src={u.screenshot} alt={`Giao diện ${u.name}`} url={u.live?.[0]?.href} />)
          : <div className="eco-unit__icon-panel" aria-hidden="true"><Icon /><span>{u.shortName}</span></div>}
      </div>
      <div className="eco-unit__body">
        <p className="eco-unit__kicker"><span className="eco-unit__ico"><Icon aria-hidden="true" /></span>{u.categoryKicker}</p>
        <h3 className="eco-unit__name" id={`eco-${u.id}`}>{u.name}</h3>
        {u.statusText && <p className={`eco-status${u.live?.length ? ' is-live' : ''}`}><i aria-hidden="true" />{u.statusText}</p>}
        <p className="eco-unit__desc">{u.description}</p>
        <p className="eco-unit__for"><strong>Dành cho:</strong> {u.targetAudience}</p>
        <ul className="eco-unit__features">{u.features.map(f => <li key={f}>{f}</li>)}</ul>
        <div className="eco-unit__links">
          {ext
            ? <a className="s-btn s-btn--primary" href={u.officialLink.href} target="_blank" rel="noopener">{u.officialLink.label} <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>
            : <Link className="s-btn s-btn--primary" href={u.officialLink.href}>{u.officialLink.label} <ArrowRight aria-hidden="true" /></Link>}
          {u.live?.filter(l => l.href !== u.officialLink.href.replace(/\/$/, '')).map(l => (
            <a key={l.href} className="eco-live-link" href={l.href} target="_blank" rel="noopener">{l.label} <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>
          ))}
        </div>
      </div>
    </article>
  );
}

export function EcosystemPage({ data }: { data: SiteData }) {
  const copy = pageCopy(data, 'he-sinh-thai');
  const eco = ecosystemFor(data);
  const { counts, units } = eco;
  const cats = eco.categories;
  const partners = publicPartners(data);
  const projects = publishedProjects(data);

  return (
    <main id="main" className="eco">
      {/* Hero + sơ đồ hệ sinh thái */}
      <section className="eco-hero" aria-labelledby="eco-title">
        <span className="eco-hero__glow eco-hero__glow--a" aria-hidden="true" />
        <span className="eco-hero__glow eco-hero__glow--b" aria-hidden="true" />
        <div className="s-container eco-hero__grid">
          <div>
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Hệ sinh thái' }]} />
            <p className="eco-hero__kicker">{copy.kicker}</p>
            <h1 className="eco-hero__title" id="eco-title">{rich(copy.title)}</h1>
            <p className="eco-hero__lead">{copy.lead}</p>
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href="/lien-he/">Trao đổi với DANAVA</Link>
              <a className="s-btn s-btn--lg eco-btn-ghost" href="#dang-chay">Sản phẩm đang chạy</a>
            </div>
          </div>
          <figure className="eco-orbit" aria-label="Sơ đồ hệ sinh thái DANAVA">
            <div className="eco-orbit__core"><img src="/assets/danava-mark.png" alt="" width={72} height={72} /><strong>DANAVA</strong><small>Solutions</small></div>
            <ul>
              {units.filter(u => ORBIT.includes(u.id)).sort((a, b) => ORBIT.indexOf(a.id) - ORBIT.indexOf(b.id)).map((u, i) => {
                const Icon = ICONS[u.id] || Sparkles;
                return (
                  <li key={u.id} style={{ ['--i' as string]: i }}>
                    <a href={`#${u.id}`}><span className="eco-orbit__ico"><Icon aria-hidden="true" /></span><span><strong>{u.name.replace(' · Sự kiện & Truyền thông', '')}</strong><small>{u.categoryKicker}</small></span></a>
                  </li>
                );
              })}
            </ul>
            <figcaption>Phát triển và vận hành bởi DANAVA Solutions</figcaption>
          </figure>
        </div>
        <nav className="s-container eco-cats" aria-label="Bốn khối năng lực">
          {cats.map(c => (
            <a key={c.id} href={`#khoi-${c.id}`}>
              <span className="eco-cats__no">{CAT_NO[c.id]}</span>
              <strong>{c.label}</strong>
              <small>{counts[c.id]} đơn vị · {c.shortDesc}</small>
            </a>
          ))}
        </nav>
      </section>

      {/* Hành trình khách hàng */}
      <section className="s-section eco-journey" aria-labelledby="eco-journey-title">
        <div className="s-container">
          <div className="eco-head eco-head--center">
            <p className="eco-head__kicker">Cách các mảnh ghép làm việc cùng nhau</p>
            <h2 className="eco-head__title" id="eco-journey-title">Một hành trình khách hàng, <em>một đối tác đồng hành.</em></h2>
          </div>
          <ol className="eco-journey__rail">
            {eco.journey.map((st, i) => (
              <li key={st.id}>
                <span className="eco-journey__dot" aria-hidden="true">{i + 1}</span>
                <h3>{st.label}</h3>
                <p>{st.text}</p>
                <ul>
                  {units.filter(u => u.stage === st.id).map(u => (
                    <li key={u.id}><a href={`#${u.id}`}>{u.shortName}</a></li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 khối năng lực */}
      {cats.map(c => {
        const list = units.filter(u => u.category === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id} id={`khoi-${c.id}`} className={`eco-block eco-block--${c.id}`} aria-labelledby={`khoi-${c.id}-title`}>
            <div className="s-container">
              <div className="eco-block__head">
                <span className="eco-block__no" aria-hidden="true">{CAT_NO[c.id]}</span>
                <div>
                  <h2 className="eco-head__title" id={`khoi-${c.id}-title`}>{c.label}</h2>
                  <p className="eco-block__desc">{c.shortDesc}</p>
                </div>
              </div>
              <div className="eco-block__list">
                {list.map((u, i) => <Unit key={u.id} u={u} flip={i % 2 === 1} />)}
              </div>
            </div>
          </section>
        );
      })}

      {/* Sản phẩm đang chạy */}
      <section className="eco-live" id="dang-chay" aria-labelledby="eco-live-title">
        <div className="s-container">
          <div className="eco-head eco-head--center">
            <p className="eco-head__kicker eco-head__kicker--light">Đang chạy thật</p>
            <h2 className="eco-head__title eco-head__title--light" id="eco-live-title">Sản phẩm trong hệ sinh thái, <em>mở được ngay.</em></h2>
            <p className="eco-head__lead">Đã kiểm tra trực tiếp ngày 19/11/2026.</p>
          </div>
          {eco.live.map(g => (
            <div key={g.group} className="eco-live__group">
              <h3>{g.group}</h3>
              <ul>
                {g.items.map(it => (
                  <li key={it.host}>
                    <a href={`https://${it.host}`} target="_blank" rel="noopener">
                      <span className="eco-live__dot" aria-hidden="true" />
                      <span className="eco-live__name">{it.name}</span>
                      <span className="eco-live__host">{it.host}</span>
                      <span className="eco-live__note">{it.note}</span>
                      <ArrowUpRight aria-hidden="true" />
                      <span className="s-sr">(mở tab mới)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Đối tác đồng hành */}
      {partners.length > 0 && (
        <section className="s-section" aria-labelledby="eco-partners-title">
          <div className="s-container">
            <div className="eco-head">
              <p className="eco-head__kicker">Đối tác đồng hành</p>
              <h2 className="eco-head__title" id="eco-partners-title">Những cơ sở đang cùng phát triển trong hệ sinh thái</h2>
              <p className="eco-head__lead eco-head__lead--dark">Danh sách theo khối “Đối tác đồng hành” trên danava.vn. <Link href="/doi-tac/">Xem địa chỉ, giờ mở cửa và dịch vụ của từng đối tác</Link>.</p>
            </div>
            <ul className="u-logos">
              {partners.map(c => {
                const project = projects.find(p => p.id === c.projectId);
                const inner = (
                  <>
                    <span className="u-logos__img">{c.logo ? <img src={c.logo} alt="" width={360} height={240} loading="lazy" decoding="async" /> : <span className="u-proof__name">{c.name}</span>}</span>
                    <span className="u-logos__name">{c.name}</span>
                    {(project || c.role) && <span className="u-logos__role">{project ? 'Case study' : c.role}</span>}
                  </>
                );
                return (
                  <li key={c.id} className={project ? 'is-case' : undefined}>
                    {project
                      ? <Link href={`/du-an/${project.slug}/`} aria-label={`${c.name} — xem case study`}>{inner}</Link>
                      : <Link href={`/doi-tac/#${c.id}`} aria-label={`${c.name} — thông tin đối tác`}>{inner}</Link>}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <CtaBand title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} secondary={{ href: '/giai-phap/', label: 'Xem giải pháp' }} />
    </main>
  );
}

export default EcosystemPage;
