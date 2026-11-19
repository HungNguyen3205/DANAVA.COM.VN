/**
 * /giai-phap/su-kien-truyen-thong/ — phong cách điện ảnh nhưng cuộn tự nhiên (không khóa cuộn, không bắt xem từng cảnh).
 * Hero ảnh chương trình thật → chương trình nổi bật (phạm vi DANAVA thực hiện) → chương trình khác →
 * hạng mục dịch vụ → giới thiệu ngắn → quy trình → báo giá → FAQ → CTA.
 * Thanh mục lục dính giúp tới thẳng dịch vụ và form liên hệ.
 */
import Link from 'next/link';
import { Mic2, Megaphone, Speaker, Music4, MapPin, Phone, ArrowRight, Check } from 'lucide-react';
import type { Service, ShowcaseItem, SiteData } from '@/lib/content';
import { postsForService, publishedSubServices, showcaseFor, splitFeatured, subServiceHref } from '@/lib/site-queries';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs } from './ui';
import { FaqSection, PricingSection, ProcessSection, RelatedPosts } from './blocks';
import { contactHrefFor } from './ServiceDetailPage';

const SERVICES = [
  { icon: Mic2, title: 'Tổ chức sự kiện', text: 'Lễ ra mắt sản phẩm, họp báo, sự kiện triển lãm, tổ chức trưng bày sản phẩm, lễ kỷ niệm, gala dinner…' },
  { icon: Megaphone, title: 'Truyền thông', text: 'Roadshow, activation, sampling, tư vấn chiến lược truyền thông, truyền thông thương hiệu, truyền thông đa phương tiện…' },
  { icon: Speaker, title: 'Thiết bị sự kiện', text: 'Âm thanh ánh sáng, màn hình LED, thiết bị dịch đa ngôn ngữ, ấn phẩm như backdrop, standee…' },
  { icon: Music4, title: 'Giải trí', text: 'MC, DJ, ca sĩ, band nhạc, PG-PB, vũ đoàn…' }
];

function Program({ p, index, total }: { p: ShowcaseItem; index: number; total: number }) {
  return (
    <article className={`ev-prog ev-prog--${index % 2 ? 'r' : 'l'}`} aria-labelledby={`ev-${p.id}`}>
      <figure className="ev-prog__hero">
        <img src={p.image} alt={p.description || p.name} loading={index === 0 ? undefined : 'lazy'} decoding="async" width={1600} height={1000} />
      </figure>
      <div className="ev-prog__copy">
        <p className="ev-prog__no">Chương trình {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {p.kind}</p>
        <h3 className="ev-prog__title" id={`ev-${p.id}`}>{p.name}</h3>
        {p.place && <p className="ev-prog__place"><MapPin aria-hidden="true" />{p.place}</p>}
        <div className="ev-prog__scope">
          <p>DANAVA thực hiện</p>
          <ul>{p.scope.map(s => <li key={s}><Check aria-hidden="true" />{s}</li>)}</ul>
        </div>
        {p.gallery.length > 0 && (
          <div className="ev-prog__shots">
            {p.gallery.slice(0, 3).map(g => <img key={g.src} src={g.src} alt={g.caption || p.name} loading="lazy" decoding="async" width={600} height={400} />)}
          </div>
        )}
      </div>
    </article>
  );
}

export function EventsPage({ service, data }: { service: Service; data: SiteData }) {
  const items = showcaseFor(data, 'events');
  const withScope = items.filter(i => i.scope.length > 0);
  const { featured, rest } = splitFeatured(withScope);
  const programs = [...featured, ...rest];
  const moments = items.filter(i => i.scope.length === 0);
  const hero = programs[0] || items[0];
  const contactHref = contactHrefFor(service);
  const phone = data.phone || CONTACT.phone;
  const subs = publishedSubServices(data, service.id);

  return (
    <main id="main" className="ev">
      <section className="ev-hero" aria-labelledby="ev-title">
        {hero && (
          <div className="ev-hero__bg" aria-hidden="true">
            <img src={hero.image} alt="" fetchPriority="high" width={1600} height={1000} />
          </div>
        )}
        <div className="ev-hero__shade" aria-hidden="true" />
        <div className="s-container ev-hero__inner">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
          <p className="ev-hero__kicker">Sự kiện · Sân khấu · Không gian thương hiệu</p>
          <h1 className="ev-hero__title" id="ev-title">{service.title}</h1>
          <p className="ev-hero__lead">{service.heroLead || service.description}</p>
          <div className="s-row s-stack-m">
            <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Gửi yêu cầu tổ chức</Link>
            <a className="s-btn s-btn--lg ev-btn-ghost" href="#chuong-trinh">Xem chương trình thực tế</a>
          </div>
          {hero && <p className="ev-hero__caption">Ảnh: {hero.name}{hero.place ? ` · ${hero.place}` : ''}</p>}
        </div>
      </section>

      <nav className="ev-nav" aria-label="Mục lục trang">
        <div className="s-container ev-nav__inner">
          <a href="#chuong-trinh">Chương trình</a>
          <a href="#hang-muc">Hạng mục</a>
          <a href="#quy-trinh">Quy trình</a>
          <a href="#bao-gia">Báo giá</a>
          <Link className="ev-nav__cta" href={contactHref}>Gửi yêu cầu</Link>
        </div>
      </nav>

      {programs.length > 0 && (
        <section className="ev-programs" id="chuong-trinh" aria-labelledby="ev-programs-title">
          <div className="s-container">
            <div className="ev-head">
              <p className="ev-head__kicker">Chương trình thực tế</p>
              <h2 className="ev-head__title" id="ev-programs-title">Từ ý tưởng đến <em>khoảnh khắc trên sân khấu.</em></h2>
            </div>
            {programs.map((p, i) => <Program key={p.id} p={p} index={i} total={programs.length} />)}
          </div>
        </section>
      )}

      {moments.length > 0 && (
        <section className="ev-moments" aria-labelledby="ev-moments-title">
          <div className="s-container">
            <h2 className="ev-head__title ev-head__title--sm" id="ev-moments-title">Khoảnh khắc từ các chương trình khác</h2>
            <ul className="ev-moments__grid">
              {moments.map(m => (
                <li key={m.id}>
                  <img src={m.image} alt={m.description || m.name} loading="lazy" decoding="async" width={800} height={600} />
                  <span><strong>{m.name}</strong>{m.place && <small>{m.place}</small>}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="ev-services" id="hang-muc" aria-labelledby="ev-services-title">
        <div className="s-container">
          <div className="ev-head">
            <p className="ev-head__kicker">Hạng mục dịch vụ</p>
            <h2 className="ev-head__title" id="ev-services-title">Một đầu mối cho <em>toàn bộ chương trình.</em></h2>
          </div>
          <div className="ev-services__grid">
            {SERVICES.map(s => (
              <article key={s.title} className="ev-svc">
                <span className="ev-svc__icon"><s.icon aria-hidden="true" /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <div className="ev-about">
            <p>DANAVA kết nối <em>ý tưởng</em>, <em>nguồn lực</em> và <em>triển khai</em>: lên ý tưởng và kế hoạch; thiết kế, thi công booth, backdrop, đạo cụ và không gian; phối hợp thiết bị, nhân sự kỹ thuật và biểu diễn; kết nối truyền thông với trải nghiệm thương hiệu.</p>
            <Link className="ev-about__link" href="/ve-danava/">Về DANAVA <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <div id="quy-trinh"><ProcessSection steps={service.process || []} title="Bốn bước tới ngày diễn ra" /></div>
      <div id="bao-gia"><PricingSection pricing={service.pricing || ''} contactHref={contactHref} /></div>

      <section className="s-section s-section--soft" aria-labelledby="ev-after">
        <div className="s-container ev-after">
          <div>
            <p className="s-eyebrow">Sau sự kiện</p>
            <h2 className="s-h3" id="ev-after">Hình ảnh và video được bàn giao đầy đủ</h2>
            <p className="s-text">Hình ảnh, video ghi tại chương trình được bàn giao để doanh nghiệp dùng cho website và các kênh của mình.</p>
          </div>
          <Link className="s-btn s-btn--secondary s-btn--lg" href="/lien-he/?service=su-kien-truyen-thong">Gửi yêu cầu <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      {subs.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="ev-subs">
          <div className="s-container">
            <h2 className="s-h3" id="ev-subs">Theo loại chương trình</h2>
            <ul className="u-linklist">{subs.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}>{s.title}</Link></li>)}</ul>
          </div>
        </section>
      )}

      <FaqSection faqs={service.faqs || []} contactHref={contactHref} />
      <RelatedPosts posts={postsForService(data, 'travel', 3)} data={data} title="Tin hoạt động" />

      <section className="ev-final" aria-labelledby="ev-final-title">
        <div className="s-container ev-final__inner">
          <h2 className="ev-head__title" id="ev-final-title">Chương trình tiếp theo <em>có thể là của bạn.</em></h2>
          <p>Cho DANAVA biết thời gian, địa điểm, số khách mời và mục tiêu, chúng tôi gửi đề xuất ý tưởng và báo giá.</p>
          <div className="s-row s-row--center">
            <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Gửi yêu cầu tổ chức</Link>
            <a className="s-btn s-btn--lg ev-btn-ghost" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
