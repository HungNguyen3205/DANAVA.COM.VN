/**
 * /giai-phap/su-kien-truyen-thong/ — phong cách điện ảnh nhưng cuộn tự nhiên (không khóa cuộn, không bắt xem từng cảnh).
 * Hero ảnh chương trình thật → chương trình nổi bật (phạm vi DANAVA thực hiện) → chương trình khác →
 * hạng mục dịch vụ → giới thiệu ngắn → quy trình → báo giá → FAQ → CTA.
 * Thanh mục lục dính giúp tới thẳng dịch vụ và form liên hệ.
 */
import Link from 'next/link';
import { Mic2, Hammer, Speaker, Music4, MapPin, Phone, ArrowRight, Check } from 'lucide-react';
import type { Service, ShowcaseItem, SiteData } from '@/lib/content';
import { postsForService, publishedSubServices, showcaseFor, splitFeatured, subServiceHref } from '@/lib/site-queries';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs } from './ui';
import { FaqSection, RelatedPosts } from './blocks';
import { EventsPlanning } from './EventsPlanning';
import { contactHrefFor } from './ServiceDetailPage';

const SERVICES = [
  {
    icon: Mic2,
    title: 'Kịch bản & điều phối',
    image: { file: 'pnj-2.webp', alt: 'Khán giả theo dõi chương trình kick-off PNJ tại Aeon Mall Huế', width: 1600, height: 1577 },
    items: ['Lên kịch bản và chạy tổng duyệt', 'Điều phối tại hiện trường', 'Lễ ra mắt, họp báo, triển lãm, lễ kỷ niệm và gala']
  },
  {
    icon: Hammer,
    title: 'Sân khấu & thi công',
    image: { file: 'ariyana-build.webp', alt: 'Đội thi công lắp dựng booth tại Ariyana', width: 1600, height: 1198 },
    items: ['Thiết kế và thi công sân khấu', 'Lắp dựng booth, backdrop và đạo cụ', 'Bố trí không gian theo nhận diện']
  },
  {
    icon: Speaker,
    title: 'Thiết bị sự kiện',
    image: { file: 'who-gala.webp', alt: 'Hệ thống ánh sáng và màn hình trên sân khấu gala', width: 736, height: 736 },
    items: ['Âm thanh, ánh sáng và màn hình LED', 'Thiết bị phiên dịch đa ngôn ngữ', 'Nhân sự kỹ thuật tại sự kiện']
  },
  {
    icon: Music4,
    title: 'Nhân sự & biểu diễn',
    image: { file: 'lutech-2.webp', alt: 'Người tham gia chương trình LUTECH trên sân khấu', width: 1600, height: 1576 },
    items: ['MC và đội ngũ đón tiếp', 'DJ, ca sĩ, ban nhạc và vũ đoàn', 'Bố trí tiết mục theo kịch bản']
  }
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
  const steps = service.process || [];
  const pricing = service.pricing?.trim() || '';
  const faqs = service.faqs || [];
  const posts = postsForService(data, service.id, 3);

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
          {steps.length > 0 && <a href="#quy-trinh">Quy trình</a>}
          {pricing && <a href="#bao-gia">Báo giá</a>}
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
                <div className="ev-svc__body">
                  <div className="ev-svc__heading">
                    <span className="ev-svc__icon"><s.icon aria-hidden="true" /></span>
                    <h3>{s.title}</h3>
                  </div>
                  <ul className="ev-svc__items">
                    {s.items.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}
                  </ul>
                </div>
                <div className="ev-svc__media">
                  <img src={`/assets/profile/${s.image.file}`} alt={s.image.alt} width={s.image.width} height={s.image.height} loading="lazy" decoding="async" />
                </div>
              </article>
            ))}
          </div>
          <div className="ev-about">
            <p>DANAVA lập kế hoạch theo địa điểm và số lượng khách mời, thống nhất kịch bản với các đội kỹ thuật và biểu diễn, rồi điều phối tại hiện trường.</p>
            <Link className="s-btn ev-btn-ghost" href="/ve-danava/">Về DANAVA <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <EventsPlanning steps={steps} pricing={pricing} contactHref={contactHref} />

      {subs.length > 0 && (
        <section className="s-section ev-subs" aria-labelledby="ev-subs">
          <div className="s-container">
            <h2 className="s-h3" id="ev-subs">Theo loại chương trình</h2>
            <ul className="u-linklist">{subs.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}>{s.title}</Link></li>)}</ul>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <div className="ev-faq">
          <FaqSection faqs={faqs} contactHref={contactHref} />
        </div>
      )}
      {posts.length > 0 && (
        <div className="ev-reading">
          <RelatedPosts posts={posts} data={data} title="Bài viết về tổ chức sự kiện" soft />
        </div>
      )}

      <section className="ev-final" aria-labelledby="ev-final-title">
        <div className="s-container">
          <div className="ev-final__panel">
            <div className="ev-final__copy">
              <h2 className="ev-head__title" id="ev-final-title">Chương trình tiếp theo <em>có thể là của bạn.</em></h2>
              <p>Cho DANAVA biết thời gian, địa điểm, số khách mời và mục tiêu, chúng tôi gửi đề xuất ý tưởng và báo giá.</p>
              <div className="s-row">
                <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Gửi yêu cầu tổ chức</Link>
                <a className="s-btn s-btn--lg ev-btn-ghost" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
              </div>
            </div>
            <img className="ev-final__photo" src="/assets/profile/lutech-4.webp" alt="" width={1508} height={1600} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>
    </main>
  );
}
