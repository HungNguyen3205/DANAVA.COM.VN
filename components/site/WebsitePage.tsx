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

  return (
    <main id="main" className="wb">
      <section className="wb-hero" aria-labelledby="wb-title">
        <div className="s-container wb-hero__grid">
          <div className="wb-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
            <p className="wb-hero__kicker">Thiết kế website · Portfolio</p>
            <h1 className="wb-hero__title" id="wb-title">{service.title}</h1>
            <p className="wb-hero__lead">{service.heroLead || service.description}</p>
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Nhận báo giá website</Link>
              <a className="s-btn s-btn--secondary s-btn--lg" href="#du-an-web">Xem dự án <ArrowDown aria-hidden="true" /></a>
            </div>
            <p className="wb-hero__count"><strong>{items.length}</strong> website & nền tảng đang trưng bày · <a href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a></p>
          </div>
          <div className="wb-hero__stack" aria-hidden="true">
            {heroShots.map((x, i) => (
              <BrowserFrame key={x.id} src={x.image} alt="" url={x.url} priority={i === 0} className={`wb-hero__shot wb-hero__shot--${i}`} />
            ))}
          </div>
        </div>
      </section>

      {lead && (
        <section className="wb-featured" aria-label="Dự án nổi bật">
          <div className="s-container">
            <FeaturedShowcase item={lead} id="wb-featured-title" />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="s-section wb-gallery" id="du-an-web" aria-labelledby="wb-gallery-title">
          <div className="s-container">
            <div className="wb-head">
              <p className="wb-head__kicker">Thư viện dự án</p>
              <h2 className="wb-head__title" id="wb-gallery-title">Mỗi website, <em>một cá tính riêng.</em></h2>
              <p className="wb-head__lead">Landing page, website thương hiệu và nền tảng DANAVA đã thiết kế, phần lớn đang chạy trên tên miền riêng.</p>
            </div>
            <PortfolioGallery items={others} />
          </div>
        </section>
      )}

      <section className="s-section wb-principles" aria-labelledby="wb-principles-title">
        <div className="s-container wb-principles__grid">
          <div className="wb-head">
            <p className="wb-head__kicker">Cách DANAVA thiết kế</p>
            <h2 className="wb-head__title" id="wb-principles-title">Đẹp để được nhớ, <em>rõ để được liên hệ.</em></h2>
          </div>
          <ol className="wb-principles__list">
            {PRINCIPLES.map(p => (
              <li key={p.n}><span>{p.n}</span><div><h3>{p.title}</h3><p>{p.text}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <ProblemsSection title="Website hiện tại đang gặp vấn đề?" problems={service.problems || []} />

      <section className="s-section s-section--soft" aria-labelledby="wb-scope">
        <div className="s-container wb-scope">
          <div>
            <p className="s-eyebrow">Phạm vi & tiêu chuẩn bàn giao</p>
            <h2 className="s-h3" id="wb-scope">Những gì bạn nhận được</h2>
            <ul className="wb-scope__list">{service.items.map(i => <li key={i}>{i}</li>)}</ul>
          </div>
          <div>
            <p className="s-eyebrow">Kỹ thuật</p>
            <ul className="wb-scope__list wb-scope__list--tech">{STANDARDS.map(i => <li key={i}>{i}</li>)}</ul>
          </div>
        </div>
      </section>

      <ProcessSection steps={service.process || []} />
      <PricingSection pricing={service.pricing || ''} productUrl={service.productUrl} productLabel={service.productLabel} contactHref={contactHref} />
      {subs.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="wb-subs">
          <div className="s-container">
            <h2 className="s-h3" id="wb-subs">Website theo mô hình</h2>
            <ul className="u-linklist">{subs.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}>{s.title}</Link></li>)}</ul>
          </div>
        </section>
      )}
      <FaqSection faqs={service.faqs || []} contactHref={contactHref} />
      <RelatedPosts posts={postsForService(data, service.id, 3)} data={data} title="Kiến thức về website & tên miền" />
      <ServiceLinks services={sortServices(data.services).filter(s => ['studio', 'events', 'travel'].includes(s.id))} title="Kết hợp cùng website" />
      <CtaBand title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: contactHref, label: 'Nhận báo giá website' }} />
    </main>
  );
}
