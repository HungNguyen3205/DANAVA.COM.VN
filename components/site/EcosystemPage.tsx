/**
 * /he-sinh-thai/ — Hệ sinh thái DANAVA (server component).
 * Chòm sao hệ sinh thái (logo ở tâm, đơn vị trên 2 quỹ đạo, màu theo khối) → số liệu thật →
 * hành trình khách hàng 4 trạm → mỗi khối năng lực là một lưới bento (đơn vị chính có ảnh lớn) →
 * bảng "đang chạy thật" → dải logo đối tác → liên hệ.
 * Dữ liệu từ khối CMS "ecosystem" (lib/blocks.ts → ecosystemFor), không thêm số liệu ngoài dữ liệu đó.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, Hotel, Handshake, LayoutDashboard, GraduationCap, Globe, Plane, Users, Sparkles, Ticket, type LucideIcon } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import type { EcosystemCategory, EcosystemUnit } from '@/lib/ecosystem';
import { ecosystemFor } from '@/lib/blocks';
import { publicPartners, publishedProjects } from '@/lib/site-queries';
import { Crumbs, CtaBand } from './ui';
import { BrowserFrame } from './showcase';
import { pageCopy } from '@/lib/blocks';
import { markOf } from '@/lib/partner-marks';
import { rich } from './rich';

const ICONS: Record<string, LucideIcon> = {
  studio: LayoutDashboard, platform: Globe, elearning: GraduationCap, website: Globe, pms: Hotel,
  media: Sparkles, go: Ticket, events: Plane, 'yoga-club': Users, 'dong-hanh': Handshake
};
const TONE: Record<EcosystemCategory, string> = { 'san-pham-so': 'blue', 'du-lich-su-kien': 'orange', 'cong-dong': 'green', 'truyen-thong': 'violet' };
const NO: Record<EcosystemCategory, string> = { 'san-pham-so': '01', 'du-lich-su-kien': '02', 'cong-dong': '03', 'truyen-thong': '04' };
const short = (u: EcosystemUnit) => u.name.replace(' · Sự kiện & Truyền thông', '');

/** Vị trí đơn vị trên chòm sao: sản phẩm số ở vòng trong, còn lại ở vòng ngoài (đơn vị %). */
function orbit(units: EcosystemUnit[]) {
  const inner = units.filter(u => u.category === 'san-pham-so');
  const outer = units.filter(u => u.category !== 'san-pham-so');
  const place = (list: EcosystemUnit[], r: number, start: number) => list.map((u, i) => {
    const a = (start + (360 / Math.max(list.length, 1)) * i) * Math.PI / 180;
    return { u, x: +(50 + r * Math.cos(a)).toFixed(2), y: +(50 + r * Math.sin(a)).toFixed(2) };
  });
  return [...place(inner, 27, -90), ...place(outer, 43, -90 + 180 / Math.max(outer.length, 1))];
}

/** Độ rộng (trên lưới 6 cột) cho từng thẻ: thẻ đầu chiếm trọn hàng khi có từ 3 đơn vị, phần còn lại lấp kín hàng. */
function spans(n: number) {
  if (n === 1) return [6];
  if (n === 2) return [3, 3];
  const rest = n - 1, out = [6];
  const r = rest % 3;
  for (let i = 0; i < rest; i++) out.push((r === 1 && i < 4) || (r === 2 && i < 2) ? 3 : 2);
  return out;
}

function Media({ u }: { u: EcosystemUnit }) {
  const Icon = ICONS[u.id] || Sparkles;
  if (!u.screenshot) {
    // Chưa có ảnh thật: khung minh hoạ bằng biểu tượng + các điểm chính của đơn vị (không dùng ảnh không liên quan)
    return (
      <div className="hx-card__icon" aria-hidden="true">
        <span className="hx-card__icon-rings"><i /><i /><i /></span>
        <span className="hx-card__icon-badge"><Icon /></span>
        <strong>{u.shortName}</strong>
        <small>{u.categoryKicker}</small>
        {u.features.slice(0, 2).map((f, i) => <em key={f} className={`hx-card__icon-chip hx-card__icon-chip--${i}`}>{f}</em>)}
      </div>
    );
  }
  if (u.screenshot.includes('/profile/') || u.screenshot.includes('/legacy/')) {
    return <figure className="hx-card__photo"><img src={u.screenshot} alt={u.name} loading="lazy" decoding="async" width={1200} height={750} /></figure>;
  }
  return <BrowserFrame src={u.screenshot} alt={`Giao diện ${u.name}`} url={u.live?.[0]?.href} />;
}

function Card({ u, span, lead }: { u: EcosystemUnit; span: number; lead: boolean }) {
  const Icon = ICONS[u.id] || Sparkles;
  const ext = u.officialLink.isExternal;
  return (
    <article id={u.id} className={`hx-card${lead ? ' is-lead' : ''}`} style={{ gridColumn: `span ${span}` }} aria-labelledby={`hx-${u.id}`}>
      <div className="hx-card__media"><Media u={u} /></div>
      <div className="hx-card__body">
        <p className="hx-card__kicker"><span className="hx-card__ico"><Icon aria-hidden="true" /></span>{u.categoryKicker}
          {u.statusText && <span className={`hx-status${u.live?.length ? ' is-live' : ''}`}><i aria-hidden="true" />{u.statusText}</span>}
        </p>
        <h3 className="hx-card__name" id={`hx-${u.id}`}>{u.name}</h3>
        <p className="hx-card__desc">{u.description}</p>
        <p className="hx-card__for"><b>Dành cho</b>{u.targetAudience}</p>
        <ul className="hx-card__chips">{u.features.map(f => <li key={f}>{f}</li>)}</ul>
        <div className="hx-card__links">
          {ext
            ? <a className="hx-btn" href={u.officialLink.href} target="_blank" rel="noopener">{u.officialLink.label} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
            : <Link className="hx-btn" href={u.officialLink.href}>{u.officialLink.label} <ArrowRight aria-hidden="true" /></Link>}
        </div>
        {(() => {
          const extra = u.live?.filter(l => l.href !== u.officialLink.href.replace(/\/$/, '')) || [];
          return extra.length > 0 && (
            <ul className="hx-card__live" aria-label={`Sản phẩm đang chạy của ${u.shortName}`}>
              {extra.map(l => (
                <li key={l.href}><a href={l.href} target="_blank" rel="noopener"><i aria-hidden="true" />{l.label}<ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a></li>
              ))}
            </ul>
          );
        })()}
      </div>
    </article>
  );
}

export function EcosystemPage({ data }: { data: SiteData }) {
  const copy = pageCopy(data, 'he-sinh-thai');
  const eco = ecosystemFor(data);
  const { counts, units } = eco;
  const cats = eco.categories.filter(c => units.some(u => u.category === c.id));
  const partners = publicPartners(data);
  const projects = publishedProjects(data);
  const liveCount = eco.live.reduce((n, g) => n + g.items.length, 0);
  const stars = orbit(units);

  return (
    <main id="main" className="hx">
      {/* Hero + chòm sao */}
      <section className="hx-hero" aria-labelledby="hx-title">
        <div className="hx-hero__sky" aria-hidden="true" />
        <div className="s-container hx-hero__grid">
          <div className="hx-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Hệ sinh thái' }]} />
            <p className="hx-kicker">{copy.kicker}</p>
            <h1 className="hx-hero__title" id="hx-title">{rich(copy.title)}</h1>
            <p className="hx-hero__lead">{copy.lead}</p>
            <div className="hx-hero__actions">
              <Link className="hx-btn hx-btn--sun" href="/lien-he/">Trao đổi với DANAVA <ArrowRight aria-hidden="true" /></Link>
              <a className="hx-btn hx-btn--ghost" href="#dang-chay">Sản phẩm đang chạy</a>
            </div>
            <ul className="hx-legend" aria-label="Chú thích màu">
              {cats.map(c => <li key={c.id} className={`hx-tone-${TONE[c.id]}`}><i aria-hidden="true" />{c.label}</li>)}
            </ul>
          </div>

          <figure className="hx-sky" aria-labelledby="hx-sky-cap">
            <svg className="hx-sky__lines" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
              <circle cx="50" cy="50" r="27" />
              <circle cx="50" cy="50" r="43" />
            </svg>
            {/* Hai quỹ đạo quay ngược chiều nhau; mỗi điểm quay ngược lại để chữ luôn đứng thẳng */}
            {(['in', 'out'] as const).map(ring => {
              const list = stars.filter(s => (s.u.category === 'san-pham-so') === (ring === 'in'));
              return (
                <div key={ring} className={`hx-ring hx-ring--${ring}`}>
                  <svg className="hx-sky__lines" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
                    {list.map(s => <line key={s.u.id} x1="50" y1="50" x2={s.x} y2={s.y} className={`hx-tone-${TONE[s.u.category]}`} />)}
                  </svg>
                  <ul className="hx-sky__stars">
                    {list.map((s, i) => {
                      const Icon = ICONS[s.u.id] || Sparkles;
                      return (
                        <li key={s.u.id} className={`hx-star hx-tone-${TONE[s.u.category]}`} style={{ left: `${s.x}%`, top: `${s.y}%`, ['--d' as string]: `${i * 0.5}s` }}>
                          <a href={`#${s.u.id}`}><span className="hx-star__dot"><Icon aria-hidden="true" /></span><span className="hx-star__name">{s.u.shortName}</span></a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            <div className="hx-sky__core">
              <img src="/assets/danava-mark.png" alt="" width={64} height={64} />
              <strong>DANAVA</strong><small>Solutions</small>
            </div>
            <figcaption id="hx-sky-cap" className="s-sr">Sơ đồ hệ sinh thái DANAVA: {units.map(short).join(', ')}.</figcaption>
          </figure>
        </div>

        <div className="s-container">
          <dl className="hx-stats">
            <div><dt>Đơn vị trong hệ sinh thái</dt><dd>{counts.all}</dd></div>
            <div><dt>Khối năng lực</dt><dd>{cats.length}</dd></div>
            <div><dt>Sản phẩm đang chạy</dt><dd>{liveCount}</dd></div>
            <div className="hx-stats__note"><dt>Phát triển & vận hành</dt><dd>DANAVA Solutions</dd></div>
          </dl>
        </div>
      </section>

      {/* Hành trình khách hàng */}
      <section className="hx-sec hx-journey" aria-labelledby="hx-journey-title">
        <div className="s-container">
          <div className="hx-head hx-head--center">
            <p className="hx-kicker hx-kicker--dark">Cách các mảnh ghép làm việc cùng nhau</p>
            <h2 className="hx-h2" id="hx-journey-title">Một hành trình khách hàng, <em>một đối tác đồng hành.</em></h2>
          </div>
          <ol className="hx-route">
            {eco.journey.map((st, i) => (
              <li key={st.id} className="hx-stop">
                <span className="hx-stop__no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{st.label}</h3>
                <p>{st.text}</p>
                <ul>
                  {units.filter(u => u.stage === st.id).map(u => (
                    <li key={u.id}><a className={`hx-tone-${TONE[u.category]}`} href={`#${u.id}`}><i aria-hidden="true" />{u.shortName}</a></li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Các khối năng lực */}
      {cats.map(c => {
        const list = units.filter(u => u.category === c.id);
        const sp = spans(list.length);
        return (
          <section key={c.id} id={`khoi-${c.id}`} className={`hx-sec hx-block hx-tone-${TONE[c.id]}`} aria-labelledby={`khoi-${c.id}-title`}>
            <div className="s-container">
              <div className="hx-block__head">
                <span className="hx-block__no" aria-hidden="true">{NO[c.id]}</span>
                <div>
                  <p className="hx-kicker hx-kicker--dark">{counts[c.id]} đơn vị</p>
                  <h2 className="hx-h2" id={`khoi-${c.id}-title`}>{c.label}</h2>
                  <p className="hx-block__desc">{c.shortDesc}</p>
                </div>
              </div>
              <div className="hx-bento">
                {list.map((u, i) => <Card key={u.id} u={u} span={sp[i]} lead={i === 0 && sp[0] === 6} />)}
              </div>
            </div>
          </section>
        );
      })}

      {/* Đang chạy thật */}
      <section className="hx-live" id="dang-chay" aria-labelledby="hx-live-title">
        <div className="s-container">
          <div className="hx-head hx-head--center">
            <p className="hx-kicker">Đang chạy thật</p>
            <h2 className="hx-h2 hx-h2--light" id="hx-live-title">Sản phẩm trong hệ sinh thái, <em>mở được ngay.</em></h2>
            <p className="hx-head__lead">Đã kiểm tra trực tiếp ngày 19/11/2026.</p>
          </div>
          <div className="hx-board">
            {eco.live.map(g => (
              <div key={g.group} className="hx-board__group">
                <h3>{g.group}</h3>
                <ul>
                  {g.items.map(it => (
                    <li key={it.host}>
                      <a href={`https://${it.host}`} target="_blank" rel="noopener">
                        <span className="hx-board__pulse" aria-hidden="true" />
                        <span className="hx-board__name">{it.name}<small>{it.note}</small></span>
                        <span className="hx-board__host">{it.host}</span>
                        <ArrowUpRight aria-hidden="true" />
                        <span className="s-sr"> (mở tab mới)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Đối tác đồng hành — lưới thẻ như khối “Đối tác đồng hành” trên danava.vn */}
      {partners.length > 0 && (
        <section className="hx-sec hx-partners" aria-labelledby="hx-partners-title">
          <div className="s-container">
            <div className="hx-partners__head">
              <div className="hx-head">
                <p className="hx-kicker hx-kicker--dark">Đối tác đồng hành</p>
                <h2 className="hx-h2" id="hx-partners-title">Những cơ sở đang cùng <em>phát triển trong hệ sinh thái.</em></h2>
                <p className="hx-head__lead hx-head__lead--dark">{partners.length} cơ sở gym, yoga, pilates, bơi lội và wellness theo khối “Đối tác đồng hành” trên danava.vn.</p>
              </div>
              <Link className="hx-btn" href="/doi-tac/">Xem tất cả đối tác <ArrowRight aria-hidden="true" /></Link>
            </div>
            <ul className="hx-pgrid">
              {partners.map(c => {
                const project = projects.find(p => p.id === c.projectId);
                const href = project ? `/du-an/${project.slug}/` : `/doi-tac/#${c.id}`;
                const photo = c.cover || c.logo;
                return (
                  <li key={c.id} className="hx-pcard">
                    <div className={`hx-pcard__media${c.cover ? '' : ' is-logo'}`}>
                      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" width={640} height={420} /> : <span className="hx-pcard__ph" aria-hidden="true">{c.name.charAt(0)}</span>}
                      {c.cover && c.logo && <span className={`hx-pcard__logo${markOf(c.logo).fill ? ' is-mark' : ''}`}><img src={markOf(c.logo).src} alt="" loading="lazy" decoding="async" width={96} height={96} /></span>}
                      {project && <span className="hx-pcard__tag">Case study</span>}
                    </div>
                    <div className="hx-pcard__body">
                      <h3><Link className="hx-pcard__link" href={href}>{c.name}</Link></h3>
                      <p className="hx-pcard__meta">
                        {c.role && <span className="hx-pcard__role">{c.role}</span>}
                        {c.city && <span>{c.city.replace(/^Thừa Thiên /, '')}</span>}
                      </p>
                      {c.verified && <p className="hx-pcard__ok"><BadgeCheck aria-hidden="true" />Đã xác minh<span className="s-sr"> trên danava.vn</span></p>}
                    </div>
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
