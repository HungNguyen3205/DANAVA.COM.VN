'use client';
import Link from 'next/link';
import { ArrowRight, Settings2, TrendingUp, PartyPopper } from 'lucide-react';
import type { Service } from '@/lib/content';
import { useSite } from '../SiteStore';
import { serviceMeta, sortServices, excerpt } from './catalog';
import { PageHead, SectionHeading, CheckList, CtaBand, Visual, IconTile, SwipeHint } from './ui';

/* ==========================================================================
   /giai-phap/
   ========================================================================== */
export function ServicesIndex() {
  const { data } = useSite();
  const services = sortServices(data.services);
  const [featured, ...rest] = services;

  const needs = [
    { icon: Settings2, tone: 'blue' as const, need: 'Tôi muốn vận hành cơ sở gọn hơn', answer: 'Quản lý hội viên, lịch lớp, check-in và doanh thu tự động.', id: 'studio' },
    { icon: TrendingUp, tone: 'orange' as const, need: 'Tôi muốn có thêm khách hàng', answer: 'Website chuẩn SEO kết hợp nội dung và quảng cáo đúng khu vực.', id: 'marketing' },
    { icon: PartyPopper, tone: 'green' as const, need: 'Tôi muốn tổ chức tour hoặc sự kiện', answer: 'Retreat, hội thảo, workshop và team building trọn gói.', id: 'travel' }
  ];

  return (
    <main id="main">
      <PageHead
        center
        eyebrow="Giải pháp"
        crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Giải pháp' }]}
        title={<>Đúng giải pháp cho <span className="s-hl">từng bài toán</span></>}
        lead="Từ phần mềm vận hành đến truyền thông và trải nghiệm khách hàng, chọn thứ doanh nghiệp bạn cần ngay hôm nay và mở rộng khi sẵn sàng."
      />

      <section className="s-section s-section--flush-top" aria-label="Danh sách giải pháp">
        <div className="s-container s-stack-lg">
          {featured && <FeaturedService service={featured} />}
          <SwipeHint />
          <div className="s-grid s-grid--2 s-snap">
            {rest.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      <section className="s-section s-section--soft" aria-labelledby="svc-needs">
        <div className="s-container">
          <SectionHeading eyebrow="Chưa biết bắt đầu từ đâu?" title={<span id="svc-needs">Bắt đầu từ <span className="s-hl">điều bạn cần</span></span>} center />
          <div className="s-grid s-grid--3 s-tiles">
            {needs.map(n => {
              const s = services.find(x => x.id === n.id);
              if (!s) return null;
              return (
                <article key={n.id} className="s-card s-card--pad s-card--link s-svc-need">
                  <IconTile icon={n.icon} tone={n.tone} />
                  <h3 className="s-h4"><Link className="s-card__cover" href={`/giai-phap/${s.slug}/`}>{n.need}</Link></h3>
                  <p className="s-text">{n.answer}</p>
                  <p className="s-svc-need__goto">{s.title} <ArrowRight aria-hidden="true" /></p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand title="Cần tư vấn trực tiếp?" lead="Chuyên viên DANAVA sẽ lắng nghe và đề xuất giải pháp phù hợp với quy mô, ngân sách của bạn." primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}

function FeaturedService({ service }: { service: Service }) {
  const m = serviceMeta(service);
  return (
    <article className="s-card s-card--link s-svc-featured">
      <div className="s-svc-featured__body">
        <span className="s-badge">Sản phẩm chủ lực</span>
        <h2 className="s-h2"><Link className="s-card__cover" href={`/giai-phap/${service.slug}/`}>{service.title}</Link></h2>
        <p className="s-lead">{service.description}</p>
        <CheckList items={service.items.slice(0, 4)} />
        <span className="s-link">Tìm hiểu thêm <ArrowRight aria-hidden="true" /></span>
      </div>
      <div className="s-svc-featured__media">
        {(service.image || m.image) ? <img src={service.image || m.image} alt={m.imageAlt || service.title} width={1200} height={900} /> : <Visual icon={m.icon} tone={m.tone} label={service.title} chips={service.items} />}
      </div>
    </article>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const m = serviceMeta(service);
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {(service.image || m.image) ? <img src={service.image || m.image} alt={m.imageAlt || service.title} loading="lazy" width={1200} height={900} /> : <Visual icon={m.icon} tone={m.tone} label={service.title} chips={service.items.map(i => excerpt(i, 26))} />}
      </div>
      <div className="s-card__body">
        <p className="s-card__tag">{m.kicker}</p>
        <h3 className="s-card__title"><Link className="s-card__cover" href={`/giai-phap/${service.slug}/`}>{service.title}</Link></h3>
        <p className="s-card__text">{service.description}</p>
        <div className="s-card__foot">
          <span className="s-muted s-small">{service.items.length} hạng mục</span>
          <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}
