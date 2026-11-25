/**
 * /giai-phap/thiet-ke-website/ — trình bày như portfolio sáng tạo.
 * Hero → dự án nổi bật (Vinhomes Hải Vân Bay) → thư viện có bộ lọc (không lặp dự án nổi bật) →
 * cách DANAVA thiết kế (thẩm mỹ, trải nghiệm, responsive, chuyển động) → tiêu chuẩn kỹ thuật → quy trình → báo giá → FAQ.
 */
import Link from 'next/link';
import { ArrowDown, Phone } from 'lucide-react';
import type { Service, SiteData } from '@/lib/content';
import { postsForService, publishedSubServices, showcaseFor, splitFeatured, sortServices, subServiceHref } from '@/lib/site-queries';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs, CtaBand } from './ui';
import { FaqSection, PricingSection, ProblemsSection, ProcessSection, RelatedPosts, ServiceLinks } from './blocks';
import { BrowserFrame, FeaturedShowcase } from './showcase';
import { PortfolioGallery } from './PortfolioGallery';
import { contactHrefFor } from './ServiceDetailPage';
import { pageCopy } from '@/lib/blocks';
import { rich } from './rich';
import { cmsText, ct } from './cms';

const PRINCIPLES = [
  { n: '01', title: 'Thẩm mỹ riêng cho từng thương hiệu', text: 'Màu sắc, kiểu chữ và hình ảnh xuất phát từ cá tính thương hiệu, không dùng theme dựng sẵn.' },
  { n: '02', title: 'Trải nghiệm dẫn tới liên hệ', text: 'Nội dung sắp theo câu hỏi của khách: đây là gì, có hợp với tôi không, liên hệ thế nào. Form và nút gọi ở đúng chỗ khách cần.' },
  { n: '03', title: 'Ưu tiên điện thoại', text: 'Thiết kế cho ngón tay trước: chữ đủ lớn, nút trong tầm với, nội dung vuốt ngang khi phù hợp.' },
  { n: '04', title: 'Chuyển động có chủ đích', text: 'Hiệu ứng dùng để dẫn mắt và kể chuyện, không che nội dung, và tự tắt khi người dùng bật giảm chuyển động.' }
];

const STANDARDS = ['Ảnh nén WebP, tải nhanh', 'Chứng chỉ SSL (HTTPS)', 'Thẻ meta, Open Graph, dữ liệu cấu trúc và sitemap', 'Trang quản trị tiếng Việt để tự cập nhật', 'Bàn giao tên miền, tài khoản và tài liệu'];

export function WebsitePage({ service, data }: { service: Service; data: SiteData }) {
  const copy = pageCopy(data, 'website');
  const items = showcaseFor(data, 'website');
  const { featured, rest } = splitFeatured(items);
  const lead = featured[0];
  const others = [...featured.slice(1), ...rest];
  const phone = data.phone || CONTACT.phone;
  const contactHref = contactHrefFor(service);
  const heroShots = [lead, ...rest].filter(Boolean).slice(0, 3);
  const subs = publishedSubServices(data, service.id);
  // Chữ cố định sửa được (lib/site-text.ts) — khóa website.*
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `website.${k}`, def, label, opts);
  const svc = `Hồ sơ ${service.title}`;
  const rec = (f: string, label: string, multiline = false) => cmsText(`rec.services.${service.id}.${f}`, label, { scope: 'record', scopeLabel: svc, ...(multiline ? { multiline: true } : {}) });
  const kicker = t('hero.kicker', 'Thiết kế theo thương hiệu · Portfolio', 'Dòng chữ nhỏ');
  const cta = t('hero.cta', 'Nhận tư vấn Website & Landing Page', 'Nút nhận tư vấn');
  const seeProjects = t('hero.projects', 'Xem dự án', 'Nút xem dự án');
  const count = t('hero.count', 'website & nền tảng đang trưng bày', 'Chữ sau số dự án');
  const galK = t('gallery.kicker', 'Thư viện dự án', 'Dòng chữ nhỏ');
  const galT = t('gallery.title', 'Mỗi website, *một cá tính riêng.*', 'Tiêu đề', { rich: true });
  const galL = t('gallery.lead', 'Landing page, website thương hiệu và nền tảng DANAVA đã thiết kế, phần lớn đang chạy trên tên miền riêng.', 'Câu dẫn', { multiline: true });
  const priK = t('principles.kicker', 'Cách DANAVA thiết kế', 'Dòng chữ nhỏ');
  const priT = t('principles.title', 'Đẹp để được nhớ, *rõ để được liên hệ.*', 'Tiêu đề', { rich: true });
  const probT = t('problems.title', 'Website hiện tại đang gặp vấn đề?', 'Tiêu đề phần vấn đề');
  const scopeK = t('scope.kicker', 'Phạm vi & tiêu chuẩn bàn giao', 'Dòng chữ nhỏ');
  const scopeT = t('scope.title', 'Những gì bạn nhận được', 'Tiêu đề');
  const techK = t('scope.tech', 'Kỹ thuật', 'Dòng chữ nhỏ (kỹ thuật)');
  const subsT = t('subs.title', 'Website theo mô hình', 'Tiêu đề');

  return (
    <main id="main" className="wb">
      <section className="wb-hero" aria-labelledby="wb-title">
        <div className="s-container wb-hero__grid">
          <div className="wb-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
            <p className="wb-hero__kicker" {...kicker.a}>{kicker.v}</p>
            <h1 className="wb-hero__title" id="wb-title" {...rec('title', 'Tên sản phẩm')}>{service.title}</h1>
            <p className="wb-hero__lead" {...rec(service.heroLead ? 'heroLead' : 'description', 'Câu dẫn sản phẩm', true)}>{service.heroLead || service.description}</p>
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}><span {...cta.a}>{cta.v}</span></Link>
              <a className="s-btn s-btn--secondary s-btn--lg" href="#du-an-web"><span {...seeProjects.a}>{seeProjects.v}</span> <ArrowDown aria-hidden="true" /></a>
            </div>
            <p className="wb-hero__count"><strong>{items.length}</strong> <span {...count.a}>{count.v}</span> · <a href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a></p>
          </div>
          <div className="wb-hero__stack" aria-hidden="true">
            {heroShots.map((x, i) => (
              <BrowserFrame key={x.id} src={x.image} alt="" url={x.url} priority={i === 0} className={`wb-hero__shot wb-hero__shot--${i}`} />
            ))}
          </div>
        </div>
      </section>

      {lead && (
        <section className="wb-featured" id={lead.slug} tabIndex={-1} aria-label="Dự án nổi bật">
          <div className="s-container">
            <FeaturedShowcase item={lead} id="wb-featured-title" data={data} />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="s-section wb-gallery" id="du-an-web" aria-labelledby="wb-gallery-title">
          <div className="s-container">
            <div className="wb-head">
              <p className="wb-head__kicker" {...galK.a}>{galK.v}</p>
              <h2 className="wb-head__title" id="wb-gallery-title" {...galT.a}>{rich(galT.v)}</h2>
              <p className="wb-head__lead" {...galL.a}>{galL.v}</p>
            </div>
            <PortfolioGallery items={others} />
          </div>
        </section>
      )}

      <section className="s-section wb-principles" aria-labelledby="wb-principles-title">
        <div className="s-container wb-principles__grid">
          <div className="wb-head">
            <p className="wb-head__kicker" {...priK.a}>{priK.v}</p>
            <h2 className="wb-head__title" id="wb-principles-title" {...priT.a}>{rich(priT.v)}</h2>
          </div>
          <ol className="wb-principles__list">
            {PRINCIPLES.map((p, i) => {
              const pt = t(`principles.items.${i}.title`, p.title, 'Tên nguyên tắc'), px = t(`principles.items.${i}.text`, p.text, 'Mô tả nguyên tắc', { multiline: true });
              return <li key={p.n}><span>{p.n}</span><div><h3 {...pt.a}>{pt.v}</h3><p {...px.a}>{px.v}</p></div></li>;
            })}
          </ol>
        </div>
      </section>

      <ProblemsSection title={<span {...probT.a}>{probT.v}</span>} problems={service.problems || []} rec={{ base: `rec.services.${service.id}`, label: `Hồ sơ ${service.title}` }} />

      <section className="s-section s-section--soft" aria-labelledby="wb-scope">
        <div className="s-container wb-scope">
          <div>
            <p className="s-eyebrow" {...scopeK.a}>{scopeK.v}</p>
            <h2 className="s-h3" id="wb-scope" {...scopeT.a}>{scopeT.v}</h2>
            <ul className="wb-scope__list">{service.items.map((x, i) => <li key={x} {...rec(`items.${i}`, 'Hạng mục bàn giao')}>{x}</li>)}</ul>
          </div>
          <div>
            <p className="s-eyebrow" {...techK.a}>{techK.v}</p>
            <ul className="wb-scope__list wb-scope__list--tech">{STANDARDS.map((x, i) => { const y = t(`scope.standards.${i}`, x, 'Tiêu chuẩn kỹ thuật'); return <li key={x} {...y.a}>{y.v}</li>; })}</ul>
          </div>
        </div>
      </section>

      <ProcessSection steps={service.process || []} rec={{ base: `rec.services.${service.id}`, label: `Hồ sơ ${service.title}` }} />
      <PricingSection pricing={service.pricing || ''} productUrl={service.productUrl} productLabel={service.productLabel} contactHref={contactHref} cms={rec('pricing', 'Cách xác định báo giá', true)} />
      {subs.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="wb-subs">
          <div className="s-container">
            <h2 className="s-h3" id="wb-subs" {...subsT.a}>{subsT.v}</h2>
            <ul className="u-linklist">{subs.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}><span {...cmsText(`rec.subServices.${s.id}.title`, 'Tên mô hình', { scope: 'record', scopeLabel: `Hồ sơ ${s.title}` })}>{s.title}</span></Link></li>)}</ul>
          </div>
        </section>
      )}
      <FaqSection faqs={service.faqs || []} contactHref={contactHref} rec={{ base: `rec.services.${service.id}`, label: `Hồ sơ ${service.title}` }} />
      <RelatedPosts posts={postsForService(data, service.id, 3)} data={data} title="Bài viết về website & tên miền" />
      <ServiceLinks services={sortServices(data.services).filter(s => ['studio', 'events', 'travel'].includes(s.id))} title="Kết hợp cùng website" />
      <CtaBand cms={{ title: 'pages.website.ctaTitle', lead: copy.ctaLead ? 'pages.website.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: contactHref, label: cta.v }} />
    </main>
  );
}
