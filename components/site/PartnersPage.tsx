/**
 * /doi-tac/ — Đối tác đồng hành (server component).
 * Thông tin lấy từ trang công khai của từng đối tác trên danava.vn (19/11/2026; public/assets/partners/sources.json).
 * Nhóm theo tỉnh/thành; mỗi thẻ: ảnh bìa, logo, lĩnh vực, địa chỉ, giờ mở cửa, tiện ích, giới thiệu, liên kết.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, Clock, MapPin, ChevronDown } from 'lucide-react';
import type { Client, SiteData } from '@/lib/content';
import { publicPartners, publicPlaces, publishedProjects } from '@/lib/site-queries';
import { PlacesDirectory, type PlaceCard } from './PlacesDirectory';
import { Crumbs, CtaBand } from './ui';
import { pageCopy } from '@/lib/blocks';
import { cmsText, ct } from './cms';
import { rich } from './rich';

const cityOf = (c: Client) => (c.city || 'Khác').replace(/^Thừa Thiên /, '').replace(/^Hồ Chí Minh$/, 'TP. Hồ Chí Minh');
const REC = { scope: 'record', scopeLabel: 'Hồ sơ đối tác' } as const;
const rec = (c: Client, field: string, label: string, opts: { multiline?: boolean } = {}) => cmsText(`rec.clients.${c.id}.${field}`, label, { ...REC, ...opts });
const anchor = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function PartnersPage({ data }: { data: SiteData }) {
  const copy = pageCopy(data, 'doi-tac');
  const partners = publicPartners(data);
  const places = publicPlaces(data);
  const onDanava = [...partners, ...places].filter(c => c.url.startsWith('https://danava.vn/places/')).length;
  const allCities = new Set([...partners, ...places].map(cityOf).filter(c => c !== 'Khác'));
  const short = (t = '') => (t.length > 170 ? t.slice(0, t.lastIndexOf(' ', 165)) + '…' : t);
  const cards: PlaceCard[] = places.map(c => ({
    id: c.id, name: c.name, role: c.role || 'Wellness', city: cityOf(c) === 'Khác' ? '' : cityOf(c), address: c.address || '', hours: c.hours || '',
    logo: c.logo, cover: c.cover || '', url: c.url, verified: !!c.verified, about: short(c.description), amenities: (c.amenities || []).slice(0, 3), hasRole: !!c.role
  }));
  const projects = publishedProjects(data);
  const cities = Array.from(new Set(partners.map(cityOf))).sort((a, b) =>
    (a === 'Đà Nẵng' ? -1 : b === 'Đà Nẵng' ? 1 : partners.filter(p => cityOf(p) === b).length - partners.filter(p => cityOf(p) === a).length));

  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `partners.${k}`, def, label, opts);
  const fPartners = t('facts.partners', 'Đối tác đồng hành', 'Nhãn số liệu');
  const fPlaces = t('facts.places', 'Địa điểm trên danava.vn', 'Nhãn số liệu');
  const fCities = t('facts.cities', 'Tỉnh/thành', 'Nhãn số liệu');
  const heroSource = t('hero.source', 'Thông tin lấy từ trang của từng đối tác trên danava.vn, ngày 19/11/2026.', 'Ghi chú nguồn', { multiline: true });
  const badgeCase = t('card.badge-case', 'Case study', 'Nhãn thẻ');
  const badgeVerified = t('card.badge-verified', 'Verified', 'Nhãn thẻ');
  const aboutSummary = t('card.about-summary', 'Giới thiệu', 'Nút mở giới thiệu');
  const amenLabel = t('card.amenities-label', 'Dịch vụ & tiện ích:', 'Nhãn');
  const cardSource = t('card.source', 'Nội dung theo trang của đối tác trên danava.vn.', 'Ghi chú nguồn');
  const linkCase = t('card.link-case', 'Xem case study', 'Liên kết');
  const linkDanava = t('card.link-danava', 'Xem trên danava.vn', 'Liên kết');
  const pdKicker = t('places.kicker', 'Nền tảng danava.vn', 'Dòng chữ nhỏ');
  const pdTitle = t('places.title', 'Địa điểm wellness trên danava.vn', 'Tiêu đề');
  const pdSource = t('places.source', 'Theo danh sách công khai tại danava.vn/places, ngày 19/11/2026.', 'Ghi chú nguồn', { multiline: true });
  const navPlaces = t('places.nav', 'Địa điểm khác trên danava.vn', 'Liên kết tới danh sách địa điểm');
  // Câu dẫn xen số đếm và huy hiệu → tách thành các đoạn chữ sửa riêng
  const pdLead1 = t('places.lead.before-partners', 'Ngoài', 'Câu dẫn (trước số đối tác)');
  const pdLead2 = t('places.lead.before-places', 'đối tác đồng hành, danava.vn còn', 'Câu dẫn (trước số địa điểm)');
  const pdLead3 = t('places.lead.before-badge', 'địa điểm yoga, pilates, gym và spa đang có trang công khai. Địa điểm có', 'Câu dẫn (trước huy hiệu)');
  const pdLead4 = t('places.lead.after-badge', 'là địa điểm đã được DANAVA xác minh.', 'Câu dẫn (sau huy hiệu)');

  return (
    <main id="main" className="pt">
      <section className="pt-hero" aria-labelledby="pt-title">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/he-sinh-thai/', label: 'Hệ sinh thái' }, { label: 'Đối tác đồng hành' }]} />
          <div className="pt-hero__grid">
            <div>
              <p className="pt-hero__kicker" {...cmsText('pages.doi-tac.kicker', 'Dòng chữ nhỏ')}>{copy.kicker}</p>
              <h1 className="pt-hero__title" id="pt-title" {...cmsText('pages.doi-tac.title', 'Tiêu đề trang', { rich: true })}>{rich(copy.title)}</h1>
              <p className="pt-hero__lead" {...cmsText('pages.doi-tac.lead', 'Câu dẫn', { multiline: true })}>{copy.lead}</p>
            </div>
            <dl className="pt-hero__facts">
              <div><dt {...fPartners.a}>{fPartners.v}</dt><dd>{partners.length}</dd></div>
              <div><dt {...fPlaces.a}>{fPlaces.v}</dt><dd>{onDanava}</dd></div>
              <div><dt {...fCities.a}>{fCities.v}</dt><dd>{allCities.size}</dd></div>
            </dl>
          </div>
          <ul className="pt-logos" aria-label="Logo đối tác">
            {partners.map(c => <li key={c.id}><a href={`#${c.id}`} title={c.name}>{c.logo ? <img src={c.logo} alt={c.name} width={360} height={240} loading="lazy" /> : <span {...rec(c, 'name', 'Tên đối tác')}>{c.name}</span>}</a></li>)}
          </ul>
          <nav className="pt-cities" aria-label="Theo tỉnh/thành">
            {cities.map(city => <a key={city} href={`#tp-${anchor(city)}`}>{city} <span>{partners.filter(p => cityOf(p) === city).length}</span></a>)}
            {/* .pt-cities a span là ô đếm số → chữ dùng <b> giữ nguyên độ đậm */}
            {places.length > 0 && <a href="#dia-diem" className="is-alt"><b style={{ fontWeight: 'inherit' }} {...navPlaces.a}>{navPlaces.v}</b> <span>{places.length}</span></a>}
          </nav>
          <p className="pt-source" {...heroSource.a}>{heroSource.v}</p>
        </div>
      </section>

      {cities.map(city => (
        <section key={city} id={`tp-${anchor(city)}`} className="pt-city" aria-labelledby={`tp-${anchor(city)}-title`}>
          <div className="s-container">
            <h2 className="pt-city__title" id={`tp-${anchor(city)}-title`}><MapPin aria-hidden="true" />{city}</h2>
            <ul className="pt-grid">
              {partners.filter(p => cityOf(p) === city).map(c => {
                const project = projects.find(p => p.id === c.projectId);
                const amen = c.amenities || [];
                return (
                  <li key={c.id} id={c.id} className="pt-card">
                    <div className="pt-card__cover">
                      {c.cover ? <img src={c.cover} alt={`Ảnh ${c.fullName || c.name}`} width={800} height={500} loading="lazy" decoding="async" /> : <span className="pt-card__nocover" aria-hidden="true" />}
                      {c.logo && <img className="pt-card__logo" src={c.logo} alt="" width={72} height={72} loading="lazy" />}
                      {project && <span className="pt-card__badge" {...badgeCase.a}>{badgeCase.v}</span>}
                      {!project && c.verified && <span className="pt-card__badge pt-card__badge--v"><BadgeCheck aria-hidden="true" /> <span {...badgeVerified.a}>{badgeVerified.v}</span></span>}
                    </div>
                    <div className="pt-card__body">
                      <p className="pt-card__role" {...(c.role ? rec(c, 'role', 'Lĩnh vực') : {})}>{c.role || (c.types || []).join(' · ')}</p>
                      <h3 className="pt-card__name" {...rec(c, 'name', 'Tên đối tác')}>{c.name}</h3>
                      {c.fullName && c.fullName.toLowerCase() !== c.name.toLowerCase() && <p className="pt-card__full" {...rec(c, 'fullName', 'Tên đầy đủ')}>{c.fullName}</p>}
                      <ul className="pt-card__meta">
                        {c.address && <li><MapPin aria-hidden="true" /><span {...rec(c, 'address', 'Địa chỉ')}>{c.address}</span></li>}
                        {c.hours && <li><Clock aria-hidden="true" /><span {...rec(c, 'hours', 'Giờ mở cửa')}>{c.hours}</span></li>}
                      </ul>
                      {amen.length > 0 && (
                        <ul className="pt-card__amen" aria-label="Dịch vụ & tiện ích">
                          {amen.slice(0, 5).map((a, i) => <li key={a} {...rec(c, `amenities.${i}`, 'Dịch vụ / tiện ích')}>{a}</li>)}
                          {amen.length > 5 && <li className="is-more">+{amen.length - 5}</li>}
                        </ul>
                      )}
                      {c.description && (
                        <details className="pt-card__about">
                          <summary><span {...aboutSummary.a}>{aboutSummary.v}</span> <ChevronDown aria-hidden="true" /></summary>
                          <p {...rec(c, 'description', 'Giới thiệu đối tác', { multiline: true })}>{c.description}</p>
                          {amen.length > 5 && <p className="pt-card__all"><strong {...amenLabel.a}>{amenLabel.v}</strong> {amen.join(', ')}.</p>}
                          <p className="pt-card__src" {...cardSource.a}>{cardSource.v}</p>
                        </details>
                      )}
                      <div className="pt-card__links">
                        {project && <Link href={`/du-an/${project.slug}/`}><span {...linkCase.a}>{linkCase.v}</span> <ArrowRight aria-hidden="true" /></Link>}
                        {c.url && <a href={c.url} target="_blank" rel="noopener"><span {...linkDanava.a}>{linkDanava.v}</span> <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}

      {places.length > 0 && (
        <section id="dia-diem" className="pd" aria-labelledby="pd-title">
          <div className="s-container">
            <p className="pt-hero__kicker" {...pdKicker.a}>{pdKicker.v}</p>
            <h2 className="pd__title" id="pd-title" {...pdTitle.a}>{pdTitle.v}</h2>
            <p className="pd__lead"><span {...pdLead1.a}>{pdLead1.v}</span> {partners.length} <span {...pdLead2.a}>{pdLead2.v}</span> {places.length} <span {...pdLead3.a}>{pdLead3.v}</span> <BadgeCheck aria-label="huy hiệu xác minh" className="pd__badge" /> <span {...pdLead4.a}>{pdLead4.v}</span></p>
            <PlacesDirectory places={cards} />
            <p className="pt-source" {...pdSource.a}>{pdSource.v}</p>
          </div>
        </section>
      )}

      <CtaBand cms={{ title: 'pages.doi-tac.ctaTitle', lead: copy.ctaLead ? 'pages.doi-tac.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/?service=danava-studio', label: 'Đăng ký demo' }} secondary={{ href: '/he-sinh-thai/', label: 'Xem hệ sinh thái' }} />
    </main>
  );
}
