/**
 * /du-an/[slug]/ cho mục trưng bày có case study (vd. Vinhomes Hải Vân Bay).
 * Bố cục riêng: hero ảnh thật desktop + điện thoại → phạm vi DANAVA thực hiện → điểm nhấn thiết kế →
 * chuyển động thật trên điện thoại → thư viện ảnh → website đang chạy → dự án khác → CTA.
 * Không nêu giải thưởng, số liệu hiệu quả hay quan hệ với chủ đầu tư.
 */
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import type { ShowcaseItem, SiteData } from '@/lib/content';
import { showcaseFor, sortServices } from '@/lib/site-queries';
import { Crumbs, CtaBand } from './ui';
import { ServiceLinks } from './blocks';
import { BrowserFrame, PhoneFrame, MotionImage, ShowcaseStrip, hostOf } from './showcase';
import { formatDate } from './catalog';
import { DraftBanner } from './SubServicePage';
import { pageCopy } from '@/lib/blocks';
import { rich } from './rich';

export function ShowcaseCaseStudy({ item, data, preview }: { item: ShowcaseItem; data: SiteData; preview?: boolean }) {
  const copy = pageCopy(data, 'case-study');
  const service = data.services.find(s => s.id === item.serviceId);
  const others = showcaseFor(data, item.serviceId).filter(x => x.id !== item.id).slice(0, 4);
  const desktopShots = item.gallery.filter(g => !g.src.includes('/mobile-'));
  const mobileShots = item.gallery.filter(g => g.src.includes('/mobile-'));
  const contactHref = '/lien-he/?service=thiet-ke-website';

  return (
    <main id="main" className="cs">
      {preview && <DraftBanner />}
      <header className="cs-hero">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/du-an/', label: 'Dự án' }, { label: item.name }]} />
          <div className="cs-hero__head">
            <div>
              <p className="cs-hero__kicker">Case study · {item.kind}</p>
              <h1 className="cs-hero__title">{item.name}</h1>
            </div>
            <p className="cs-hero__lead">{item.intro || item.description}</p>
          </div>
          <dl className="cs-facts">
            {service && <div><dt>Dịch vụ</dt><dd><Link href={`/giai-phap/${service.slug}/`}>{service.title}</Link></dd></div>}
            <div><dt>Loại sản phẩm</dt><dd>{item.kind}</dd></div>
            {item.url && <div><dt>Website</dt><dd><a href={item.url} target="_blank" rel="noopener">{hostOf(item.url)}<ArrowUpRight aria-hidden="true" /></a></dd></div>}
            <div><dt>Cập nhật</dt><dd><time dateTime={item.updated}>{formatDate(item.updated)}</time></dd></div>
          </dl>
          <div className="cs-stage">
            <BrowserFrame src={item.image} alt={`Màn hình đầu trang ${item.name} trên máy tính`} url={item.url} priority className="cs-stage__desktop" />
            <PhoneFrame item={{ ...item, motion: '' }} className="cs-stage__phone" />
          </div>
        </div>
      </header>

      {item.scope.length > 0 && (
        <section className="s-section" aria-labelledby="cs-scope">
          <div className="s-container cs-scope">
            <div>
              <p className="s-eyebrow">Phạm vi</p>
              <h2 className="s-h2" id="cs-scope">DANAVA đã thực hiện</h2>
            </div>
            <ul>{item.scope.map(s => <li key={s}><Check aria-hidden="true" />{s}</li>)}</ul>
          </div>
        </section>
      )}

      {item.highlights.length > 0 && (
        <section className="cs-highlights" aria-labelledby="cs-hl">
          <div className="s-container">
            <p className="cs-label">Điểm nhấn thiết kế</p>
            <h2 className="cs-highlights__title" id="cs-hl">Thiết kế cho cảm giác, <em>bố cục cho quyết định.</em></h2>
            <ol className="cs-highlights__list">
              {item.highlights.map((h, i) => (
                <li key={h.title} style={desktopShots[i] ? undefined : { gridColumn: 'span 1' }}>
                  <span className="cs-highlights__n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                  {desktopShots[i] && (
                    <figure>
                      <img src={desktopShots[i].src} alt={desktopShots[i].caption} loading="lazy" decoding="async" width={1200} height={750} />
                      <figcaption>{desktopShots[i].caption}</figcaption>
                    </figure>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {(item.motion || mobileShots.length > 0) && (
        <section className="s-section cs-mobile" aria-labelledby="cs-mobile">
          <div className="s-container cs-mobile__grid">
            <div>
              <p className="s-eyebrow">Trên điện thoại</p>
              <h2 className="s-h2" id="cs-mobile">Thiết kế cho ngón tay</h2>
              <p className="s-lead">Đoạn ghi màn hình cuộn trang trên khung điện thoại 390px, lấy trực tiếp từ website đang chạy.</p>
            </div>
            <div className="cs-mobile__phones">
              {item.motion && (
                <figure className="sc-phone">
                  <span className="sc-phone__notch" aria-hidden="true" />
                  <MotionImage motion={item.motion} poster={item.motionPoster || item.mobileImage} alt={`Cuộn trang ${item.name} trên điện thoại`} width={360} height={780} />
                </figure>
              )}
              {mobileShots.map(m => (
                <figure key={m.src} className="sc-phone">
                  <span className="sc-phone__notch" aria-hidden="true" />
                  <img src={m.src} alt={m.caption} loading="lazy" decoding="async" width={600} height={1298} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {desktopShots.length > item.highlights.length && (
        <section className="s-section s-section--soft" aria-labelledby="cs-more">
          <div className="s-container">
            <h2 className="s-h3" id="cs-more">Thêm màn hình</h2>
            <div className="s-grid s-grid--2">
              {desktopShots.slice(item.highlights.length).map(g => (
                <BrowserFrame key={g.src} src={g.src} alt={g.caption} url={item.url} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="s-section s-section--tight" aria-label="Website đang chạy">
        <div className="s-container cs-live">
          <div>
            <h2 className="s-h3">Xem website đang chạy</h2>
            {item.disclaimer && <p className="s-text s-muted">{item.disclaimer}</p>}
          </div>
          {item.url && <a className="s-btn s-btn--primary s-btn--lg" href={item.url} target="_blank" rel="noopener">Mở {hostOf(item.url)} <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>}
        </div>
      </section>

      {others.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="cs-others">
          <div className="s-container">
            <div className="u-head-row s-mb">
              <h2 className="s-h3" id="cs-others">Sản phẩm khác</h2>
              {service && <Link className="s-link" href={`/giai-phap/${service.slug}/#du-an-web`}>Toàn bộ portfolio</Link>}
            </div>
            <ShowcaseStrip items={others} />
          </div>
        </section>
      )}
      <ServiceLinks services={sortServices(data.services.filter(s => s.id === item.serviceId))} title="Dịch vụ liên quan" />
      <CtaBand title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: contactHref, label: 'Nhận báo giá website' }} />
    </main>
  );
}
