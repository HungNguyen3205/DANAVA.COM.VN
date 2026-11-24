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
import { cmsText, ct } from './cms';

export function ShowcaseCaseStudy({ item, data, preview }: { item: ShowcaseItem; data: SiteData; preview?: boolean }) {
  const copy = pageCopy(data, 'case-study');
  const service = data.services.find(s => s.id === item.serviceId);
  const others = showcaseFor(data, item.serviceId).filter(x => x.id !== item.id).slice(0, 4);
  const desktopShots = item.gallery.filter(g => !g.src.includes('/mobile-'));
  const mobileShots = item.gallery.filter(g => g.src.includes('/mobile-'));
  const contactHref = '/lien-he/?service=thiet-ke-website';
  // Chữ dùng chung cho mọi trang case study (txt.casestudy.*) và trường của hồ sơ trưng bày (rec.showcase.<id>.*)
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `casestudy.${k}`, def, label, opts);
  const R = (f: string, label: string, opts: { multiline?: boolean } = {}) => cmsText(`rec.showcase.${item.id}.${f}`, label, { ...opts, scope: 'record', scopeLabel: 'Hồ sơ sản phẩm trưng bày' });
  const cap = (g: { src: string }) => R(`gallery.${item.gallery.findIndex(x => x.src === g.src)}.caption`, 'Chú thích ảnh');
  const T = {
    kicker: t('hero.kicker', 'Case study', 'Dòng chữ nhỏ'),
    fService: t('facts.service', 'Dịch vụ', 'Nhãn'), fKind: t('facts.kind', 'Loại sản phẩm', 'Nhãn'), fWeb: t('facts.website', 'Website', 'Nhãn'), fUpdated: t('facts.updated', 'Cập nhật', 'Nhãn'),
    sEyebrow: t('scope.eyebrow', 'Phạm vi', 'Dòng chữ nhỏ'), sTitle: t('scope.title', 'DANAVA đã thực hiện', 'Tiêu đề khối'),
    hLabel: t('highlights.eyebrow', 'Điểm nhấn thiết kế', 'Dòng chữ nhỏ'), hTitle: t('highlights.title', 'Thiết kế cho cảm giác, *bố cục cho quyết định.*', 'Tiêu đề khối', { rich: true }),
    mEyebrow: t('mobile.eyebrow', 'Trên điện thoại', 'Dòng chữ nhỏ'), mTitle: t('mobile.title', 'Thiết kế cho ngón tay', 'Tiêu đề khối'),
    mLead: t('mobile.lead', 'Đoạn ghi màn hình cuộn trang trên khung điện thoại 390px, lấy trực tiếp từ website đang chạy.', 'Câu dẫn', { multiline: true }),
    more: t('more.title', 'Thêm màn hình', 'Tiêu đề khối'),
    live: t('live.title', 'Xem website đang chạy', 'Tiêu đề khối'), open: t('live.open', 'Mở', 'Chữ nút'),
    others: t('others.title', 'Sản phẩm khác', 'Tiêu đề khối'), all: t('others.all', 'Toàn bộ portfolio', 'Chữ liên kết')
  };

  return (
    <main id="main" className="cs">
      {preview && <DraftBanner />}
      <header className="cs-hero">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/du-an/', label: 'Dự án' }, { label: item.name }]} />
          <div className="cs-hero__head">
            <div>
              <p className="cs-hero__kicker"><span {...T.kicker.a}>{T.kicker.v}</span> · <span {...R('kind', 'Loại sản phẩm')}>{item.kind}</span></p>
              <h1 className="cs-hero__title" {...R('name', 'Tên sản phẩm')}>{item.name}</h1>
            </div>
            <p className="cs-hero__lead" {...(item.intro ? R('intro', 'Giới thiệu case study', { multiline: true }) : R('description', 'Mô tả', { multiline: true }))}>{item.intro || item.description}</p>
          </div>
          <dl className="cs-facts">
            {service && <div><dt {...T.fService.a}>{T.fService.v}</dt><dd><Link href={`/giai-phap/${service.slug}/`}><span {...cmsText(`rec.services.${service.id}.title`, 'Tên giải pháp', { scope: 'record', scopeLabel: 'Hồ sơ giải pháp' })}>{service.title}</span></Link></dd></div>}
            <div><dt {...T.fKind.a}>{T.fKind.v}</dt><dd {...R('kind', 'Loại sản phẩm')}>{item.kind}</dd></div>
            {item.url && <div><dt {...T.fWeb.a}>{T.fWeb.v}</dt><dd><a href={item.url} target="_blank" rel="noopener">{hostOf(item.url)}<ArrowUpRight aria-hidden="true" /></a></dd></div>}
            <div><dt {...T.fUpdated.a}>{T.fUpdated.v}</dt><dd><time dateTime={item.updated}>{formatDate(item.updated)}</time></dd></div>
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
              <p className="s-eyebrow" {...T.sEyebrow.a}>{T.sEyebrow.v}</p>
              <h2 className="s-h2" id="cs-scope" {...T.sTitle.a}>{T.sTitle.v}</h2>
            </div>
            <ul>{item.scope.map((s, i) => <li key={s}><Check aria-hidden="true" /><span {...R(`scope.${i}`, 'Hạng mục')}>{s}</span></li>)}</ul>
          </div>
        </section>
      )}

      {item.highlights.length > 0 && (
        <section className="cs-highlights" aria-labelledby="cs-hl">
          <div className="s-container">
            <p className="cs-label" {...T.hLabel.a}>{T.hLabel.v}</p>
            <h2 className="cs-highlights__title" id="cs-hl" {...T.hTitle.a}>{rich(T.hTitle.v)}</h2>
            <ol className="cs-highlights__list">
              {item.highlights.map((h, i) => (
                <li key={h.title} style={desktopShots[i] ? undefined : { gridColumn: 'span 1' }}>
                  <span className="cs-highlights__n">{String(i + 1).padStart(2, '0')}</span>
                  <h3 {...R(`highlights.${i}.title`, 'Tiêu đề điểm nhấn')}>{h.title}</h3>
                  <p {...R(`highlights.${i}.text`, 'Mô tả điểm nhấn', { multiline: true })}>{h.text}</p>
                  {desktopShots[i] && (
                    <figure>
                      <img src={desktopShots[i].src} alt={desktopShots[i].caption} loading="lazy" decoding="async" width={1200} height={750} />
                      <figcaption {...cap(desktopShots[i])}>{desktopShots[i].caption}</figcaption>
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
              <p className="s-eyebrow" {...T.mEyebrow.a}>{T.mEyebrow.v}</p>
              <h2 className="s-h2" id="cs-mobile" {...T.mTitle.a}>{T.mTitle.v}</h2>
              <p className="s-lead" {...T.mLead.a}>{T.mLead.v}</p>
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
            <h2 className="s-h3" id="cs-more" {...T.more.a}>{T.more.v}</h2>
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
            <h2 className="s-h3" {...T.live.a}>{T.live.v}</h2>
            {item.disclaimer && <p className="s-text s-muted" {...R('disclaimer', 'Ghi chú vai trò', { multiline: true })}>{item.disclaimer}</p>}
          </div>
          {item.url && <a className="s-btn s-btn--primary s-btn--lg" href={item.url} target="_blank" rel="noopener"><span><span {...T.open.a}>{T.open.v}</span> {hostOf(item.url)}</span> <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>}
        </div>
      </section>

      {others.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="cs-others">
          <div className="s-container">
            <div className="u-head-row s-mb">
              <h2 className="s-h3" id="cs-others" {...T.others.a}>{T.others.v}</h2>
              {service && <Link className="s-link" href={`/giai-phap/${service.slug}/#du-an-web`}><span {...T.all.a}>{T.all.v}</span></Link>}
            </div>
            <ShowcaseStrip items={others} />
          </div>
        </section>
      )}
      <ServiceLinks services={sortServices(data.services.filter(s => s.id === item.serviceId))} title="Dịch vụ liên quan" />
      <CtaBand cms={{ title: 'pages.case-study.ctaTitle', lead: copy.ctaLead ? 'pages.case-study.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: contactHref, label: 'Nhận báo giá website' }} />
    </main>
  );
}
