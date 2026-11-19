/**
 * /doi-tac/ — Đối tác đồng hành (server component).
 * Thông tin lấy từ trang công khai của từng đối tác trên danava.vn (19/11/2026; public/assets/partners/sources.json).
 * Nhóm theo tỉnh/thành; mỗi thẻ: ảnh bìa, logo, lĩnh vực, địa chỉ, giờ mở cửa, tiện ích, giới thiệu, liên kết.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock, MapPin, ChevronDown } from 'lucide-react';
import type { Client, SiteData } from '@/lib/content';
import { publicClients, publishedProjects } from '@/lib/site-queries';
import { Crumbs, CtaBand } from './ui';

const cityOf = (c: Client) => (c.city || 'Khác').replace(/^Thừa Thiên /, '').replace(/^Hồ Chí Minh$/, 'TP. Hồ Chí Minh');
const anchor = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function PartnersPage({ data }: { data: SiteData }) {
  const partners = publicClients(data);
  const projects = publishedProjects(data);
  const cities = Array.from(new Set(partners.map(cityOf))).sort((a, b) =>
    (a === 'Đà Nẵng' ? -1 : b === 'Đà Nẵng' ? 1 : partners.filter(p => cityOf(p) === b).length - partners.filter(p => cityOf(p) === a).length));

  return (
    <main id="main" className="pt">
      <section className="pt-hero" aria-labelledby="pt-title">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/he-sinh-thai/', label: 'Hệ sinh thái' }, { label: 'Đối tác đồng hành' }]} />
          <div className="pt-hero__grid">
            <div>
              <p className="pt-hero__kicker">Đối tác đồng hành</p>
              <h1 className="pt-hero__title" id="pt-title">Những cơ sở <em>cùng phát triển</em> trong hệ sinh thái DANAVA</h1>
              <p className="pt-hero__lead">Phòng tập, studio, trung tâm đào tạo và cộng đồng wellness đang có mặt trên nền tảng danava.vn.</p>
            </div>
            <dl className="pt-hero__facts">
              <div><dt>Đối tác</dt><dd>{partners.length}</dd></div>
              <div><dt>Tỉnh/thành</dt><dd>{cities.length}</dd></div>
              <div><dt>Có case study</dt><dd>{partners.filter(p => projects.some(x => x.id === p.projectId)).length}</dd></div>
            </dl>
          </div>
          <ul className="pt-logos" aria-label="Logo đối tác">
            {partners.map(c => <li key={c.id}><a href={`#${c.id}`} title={c.name}>{c.logo ? <img src={c.logo} alt={c.name} width={360} height={240} loading="lazy" /> : <span>{c.name}</span>}</a></li>)}
          </ul>
          <nav className="pt-cities" aria-label="Theo tỉnh/thành">
            {cities.map(city => <a key={city} href={`#tp-${anchor(city)}`}>{city} <span>{partners.filter(p => cityOf(p) === city).length}</span></a>)}
          </nav>
          <p className="pt-source">Thông tin lấy từ trang của từng đối tác trên danava.vn, ngày 19/11/2026.</p>
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
                      {project && <span className="pt-card__badge">Case study</span>}
                    </div>
                    <div className="pt-card__body">
                      <p className="pt-card__role">{c.role || (c.types || []).join(' · ')}</p>
                      <h3 className="pt-card__name">{c.name}</h3>
                      {c.fullName && c.fullName.toLowerCase() !== c.name.toLowerCase() && <p className="pt-card__full">{c.fullName}</p>}
                      <ul className="pt-card__meta">
                        {c.address && <li><MapPin aria-hidden="true" /><span>{c.address}</span></li>}
                        {c.hours && <li><Clock aria-hidden="true" /><span>{c.hours}</span></li>}
                      </ul>
                      {amen.length > 0 && (
                        <ul className="pt-card__amen" aria-label="Dịch vụ & tiện ích">
                          {amen.slice(0, 5).map(a => <li key={a}>{a}</li>)}
                          {amen.length > 5 && <li className="is-more">+{amen.length - 5}</li>}
                        </ul>
                      )}
                      {c.description && (
                        <details className="pt-card__about">
                          <summary>Giới thiệu <ChevronDown aria-hidden="true" /></summary>
                          <p>{c.description}</p>
                          {amen.length > 5 && <p className="pt-card__all"><strong>Dịch vụ & tiện ích:</strong> {amen.join(', ')}.</p>}
                          <p className="pt-card__src">Nội dung theo trang của đối tác trên danava.vn.</p>
                        </details>
                      )}
                      <div className="pt-card__links">
                        {project && <Link href={`/du-an/${project.slug}/`}>Xem case study <ArrowRight aria-hidden="true" /></Link>}
                        {c.url && <a href={c.url} target="_blank" rel="noopener">Xem trên danava.vn <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}

      <CtaBand title="Trở thành đối tác trong hệ sinh thái DANAVA" lead="Cơ sở của bạn vận hành bằng DANAVA Studio và có mặt trên nền tảng danava.vn. Trao đổi với DANAVA để bắt đầu." primary={{ href: '/lien-he/?service=danava-studio', label: 'Đăng ký demo' }} secondary={{ href: '/he-sinh-thai/', label: 'Xem hệ sinh thái' }} />
    </main>
  );
}
