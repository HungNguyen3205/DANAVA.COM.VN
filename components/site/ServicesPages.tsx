'use client';
import Link from 'next/link';
import { ArrowRight, Layers, BadgeCheck } from 'lucide-react';
import type { Service } from '@/lib/content';
import { useSite } from '../SiteStore';
import { serviceMeta, sortServices, excerpt, GROUPS, type Tone } from './catalog';
import { CtaBand, Crumbs, IconTile, Visual } from './ui';
import { pageCopy } from '@/lib/blocks';
import { cmsText, ct } from './cms';
import { rich } from './rich';
import type { LucideIcon } from 'lucide-react';

/* ==========================================================================
   /giai-phap/
   Tinh thần trang DANAVA GO: nền kem ấm, tiêu đề Playfair chữ đứng (nhấn cam),
   thẻ trắng nhẹ, ít chữ. Nội dung lấy từ CMS (data.services) — không hard-code.
   Kiểu dáng: .svn-* trong app/(site)/site-solutions.css
   ========================================================================== */
export function ServicesIndex() {
  const { data } = useSite();
  const copy = pageCopy(data, 'giai-phap');
  const services = sortServices(data.services);
  const featured = services[0];
  const featuredMeta = featured ? serviceMeta(featured) : undefined;

  // at = vị trí trong GROUPS gốc (khóa chữ sửa được solutions.groups.<at>.*)
  const groups = GROUPS
    .map((g, at) => ({ ...g, at, items: services.filter(s => serviceMeta(s).group === g.id) }))
    .filter(g => g.items.length > 0);

  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `solutions.${k}`, def, label, opts);
  const featuredLabel = t('hero.featured', 'Sản phẩm chủ lực', 'Nhãn sản phẩm chủ lực');
  const groupEyebrow = t('groups.eyebrow', 'Nhóm giải pháp', 'Dòng chữ nhỏ nhóm giải pháp');
  const needEyebrow = t('needs.eyebrow', 'Chưa biết bắt đầu từ đâu?', 'Dòng chữ nhỏ');
  const needTitle = t('needs.title', 'Chọn theo *điều bạn cần*', 'Tiêu đề', { rich: true });

  const needs: { icon: LucideIcon; tone: Tone; need: string; answer: string; id: string }[] = [
    { icon: Layers, tone: 'blue', need: 'Tôi muốn vận hành cơ sở gọn hơn', answer: 'Quản lý hội viên, lịch lớp, check-in và doanh thu tự động.', id: 'studio' },
    { icon: Layers, tone: 'orange', need: 'Tôi muốn có website bán hàng tốt hơn', answer: 'Website thiết kế riêng, ưu tiên điện thoại, có biểu mẫu nhận yêu cầu tư vấn.', id: 'website' },
    { icon: Layers, tone: 'green', need: 'Tôi muốn tổ chức sự kiện', answer: 'Kịch bản, sân khấu, thi công, thiết bị, nhân sự và điều phối chương trình.', id: 'events' }
  ];

  return (
    <main id="main" className="svn">
      <section className="svn-hero" aria-labelledby="svn-title">
        <div className="s-container">
          <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { label: 'Giải pháp' }]} />
          <div className="svn-hero__grid">
            <div className="svn-hero__copy">
              <p className="svn-kicker"><Layers aria-hidden="true" /> <span {...cmsText('pages.giai-phap.kicker', 'Dòng chữ nhỏ')}>{copy.kicker}</span></p>
              <h1 className="svn-title" id="svn-title" {...cmsText('pages.giai-phap.title', 'Tiêu đề trang', { rich: true })}>{rich(copy.title, 'svn-em')}</h1>
              <p className="svn-lead" {...cmsText('pages.giai-phap.lead', 'Câu dẫn', { multiline: true })}>{copy.lead}</p>
              <nav className="svn-jump" aria-label="Các nhóm giải pháp">
                {groups.map(g => {
                  const sh = t(`groups.${g.at}.short`, g.short, 'Tên ngắn nhóm giải pháp');
                  return <a key={g.id} href={`#nhom-${g.id}`}><span {...sh.a}>{sh.v}</span> <span>{g.items.length}</span></a>;
                })}
              </nav>
            </div>
            {featured && (
              <figure className="svn-hero__media">
                {(featured.image || featuredMeta?.image)
                  ? <img src={featured.image || featuredMeta?.image} alt={featuredMeta?.imageAlt || featured.title} width={1200} height={900} />
                  : <Visual icon={featuredMeta?.icon ?? Layers} tone={featuredMeta?.tone} label={featured.title} chips={featured.items} />}
                <figcaption className="svn-hero__chip"><BadgeCheck aria-hidden="true" /> <span {...featuredLabel.a}>{featuredLabel.v}</span> · <span {...recText(featured, 'title', 'Tên sản phẩm')}>{featured.title}</span></figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>

      {groups.map((g, gi) => { const gl = t(`groups.${g.at}.label`, g.label, 'Tên nhóm giải pháp'); return (
        <section key={g.id} id={`nhom-${g.id}`} className="svn-sec" aria-labelledby={`svn-g-${g.id}`}>
          <div className="s-container">
            <header className="svn-sec__head">
              <span className="svn-no" aria-hidden="true">{String(gi + 1).padStart(2, '0')}</span>
              <div>
                <p className="svn-eyebrow" {...groupEyebrow.a}>{groupEyebrow.v}</p>
                <h2 className="svn-h2" id={`svn-g-${g.id}`} {...gl.a}>{gl.v}</h2>
              </div>
            </header>
            <div className="svn-grid">
              {g.items.map(s => <ServiceCard key={s.id} service={s} solo={g.items.length === 1} />)}
            </div>
          </div>
        </section>
      ); })}

      <section className="s-container svn-need-wrap" aria-labelledby="svn-needs">
        <div className="svn-need">
          <div className="svn-need__head">
            <p className="svn-eyebrow" {...needEyebrow.a}>{needEyebrow.v}</p>
            <h2 className="svn-h2" id="svn-needs" {...needTitle.a}>{rich(needTitle.v, 'svn-em')}</h2>
          </div>
          <div className="svn-need__grid">
            {needs.map((n, i) => {
              const s = services.find(x => x.id === n.id);
              if (!s) return null;
              const nn = t(`needs.${i}.need`, n.need, 'Nhu cầu'), na = t(`needs.${i}.answer`, n.answer, 'Cách DANAVA giải quyết', { multiline: true });
              return (
                <article key={n.id} className="svn-need__item">
                  <IconTile icon={n.icon} tone={n.tone} />
                  <h3 className="svn-need__title"><Link className="s-card__cover" href={`/giai-phap/${s.slug}/`}><span {...nn.a}>{nn.v}</span></Link></h3>
                  <p className="svn-need__text" {...na.a}>{na.v}</p>
                  <span className="svn-need__go"><span {...recText(s, 'title', 'Tên sản phẩm')}>{s.title}</span> <ArrowRight aria-hidden="true" /></span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand data={data} cms={{ title: 'pages.giai-phap.ctaTitle', lead: copy.ctaLead ? 'pages.giai-phap.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}

/** Vùng chỉnh của một trường trong hồ sơ sản phẩm (rec.services.<id>.<trường>). */
function recText(service: Service, field: string, label: string, multiline = false) {
  return cmsText(`rec.services.${service.id}.${field}`, label, { scope: 'record', scopeLabel: `Hồ sơ ${service.title}`, ...(multiline ? { multiline: true } : {}) });
}

/** Nhãn nhóm của sản phẩm (SERVICE_META.kicker) — dùng chung khóa với trang sản phẩm (ServiceDetailPage). */
function kickerText(data: Parameters<typeof ct>[0], service: Service, kicker: string) {
  return /^[a-z0-9][a-z0-9-]{0,60}$/.test(service.id) ? ct(data, `product.${service.id}.kicker`, kicker, 'Nhãn nhóm sản phẩm') : { v: kicker, a: {} };
}

function ServiceCard({ service, solo = false }: { service: Service; solo?: boolean }) {
  const { data } = useSite();
  const m = serviceMeta(service);
  const kicker = kickerText(data, service, m.kicker);
  const more = ct(data, 'solutions.cards.more', 'Tìm hiểu thêm', 'Chữ liên kết tìm hiểu thêm');
  const desc = excerpt(service.description, 140);
  return (
    <article className={solo ? 'svn-card svn-card--solo' : 'svn-card'}>
      <div className="svn-card__top">
        <IconTile icon={m.icon} tone={m.tone} />
        <span className="svn-card__tag" {...kicker.a}>{kicker.v}</span>
      </div>
      <h3 className="svn-card__title"><Link className="s-card__cover" href={`/giai-phap/${service.slug}/`}><span {...recText(service, 'title', 'Tên sản phẩm')}>{service.title}</span></Link></h3>
      <p className="svn-card__text" {...(desc === service.description ? recText(service, 'description', 'Mô tả sản phẩm', true) : {})}>{desc}</p>
      {service.items.length > 0 && (
        <ul className="svn-card__items">
          {service.items.slice(0, 3).map((i, k) => <li key={i} {...(excerpt(i, 44) === i ? recText(service, `items.${k}`, 'Hạng mục sản phẩm') : {})}>{excerpt(i, 44)}</li>)}
        </ul>
      )}
      <span className="svn-card__go"><span {...more.a}>{more.v}</span> <ArrowRight aria-hidden="true" /></span>
    </article>
  );
}
