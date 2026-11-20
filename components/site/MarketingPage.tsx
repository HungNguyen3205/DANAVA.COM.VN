/**
 * /giai-phap/digital-marketing/ — Digital Marketing (không còn trình diễn sự kiện; nội dung đó ở /giai-phap/su-kien-truyen-thong/).
 * Hero với sơ đồ 5 khâu → vấn đề → từng khâu (chiến lược, nội dung, kênh, quảng cáo, đo lường) → tài sản thuộc về bạn →
 * quy trình → báo giá → kiến thức marketing → FAQ → CTA.
 */
import Link from 'next/link';
import { ArrowRight, Compass, Camera, MessagesSquare, Target, BarChart3, KeyRound, Phone } from 'lucide-react';
import type { Service, SiteData } from '@/lib/content';
import { postsForService, projectsForService, publishedSubServices, subServiceHref } from '@/lib/site-queries';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs, CtaBand } from './ui';
import { FaqSection, PricingSection, ProblemsSection, ProcessSection, RelatedPosts, RelatedProjects } from './blocks';
import { contactHrefFor } from './ServiceDetailPage';

const PILLARS = [
  { id: 'chien-luoc', icon: Compass, title: 'Chiến lược', short: 'Mục tiêu & thông điệp', text: 'Phân tích kênh hiện có, đối thủ trong khu vực và khách hàng mục tiêu; thống nhất mục tiêu ưu tiên, thông điệp và ngân sách dự kiến.', items: ['Đánh giá hiện trạng kênh', 'Trục nội dung và thông điệp', 'Kế hoạch theo tháng'] },
  { id: 'noi-dung', icon: Camera, title: 'Sản xuất nội dung', short: 'Ảnh, video, bài viết', text: 'Quay phim, chụp ảnh trực tiếp tại cơ sở, thiết kế ấn phẩm và hình ảnh thương hiệu nhất quán. Bàn giao file gốc.', items: ['Kịch bản quay chụp', 'Ảnh, video ngắn tại cơ sở', 'Ấn phẩm theo nhận diện'] },
  { id: 'kenh', icon: MessagesSquare, title: 'Vận hành kênh', short: 'Fanpage & Zalo OA', text: 'Chăm sóc Fanpage, Zalo OA theo lịch biên tập, phản hồi tin nhắn và giữ nhịp tương tác đều đặn.', items: ['Lịch biên tập & duyệt bài', 'Fanpage tìm khách mới', 'Zalo OA chăm sóc khách đã quan tâm'] },
  { id: 'quang-cao', icon: Target, title: 'Quảng cáo', short: 'Meta & Google', text: 'Chiến dịch Meta/Google cho khu vực của bạn, kết nối với form và hệ thống quản lý để không bỏ sót khách hàng tiềm năng.', items: ['Nhắm đúng khu vực', 'Kết nối form & website', 'Tài khoản đứng tên doanh nghiệp'] },
  { id: 'do-luong', icon: BarChart3, title: 'Đo lường', short: 'Báo cáo & tối ưu', text: 'Báo cáo số liệu lấy từ chính nền tảng quảng cáo và kênh, kèm đề xuất cho chu kỳ tiếp theo. Không báo cáo số liệu ước đoán.', items: ['Số liệu từ nền tảng', 'Đánh giá theo mục tiêu đã thống nhất', 'Đề xuất chu kỳ sau'] }
];

const OWNERSHIP = [
  { title: 'Bạn nắm tài khoản quảng cáo', text: 'Doanh nghiệp đứng tên và thanh toán trực tiếp cho Meta/Google, toàn quyền kiểm soát chi tiêu.' },
  { title: 'Hình ảnh thật', text: 'Nội dung được sản xuất tại chính cơ sở của bạn để khách hàng có cảm nhận chân thực.' },
  { title: 'Tài sản thuộc về bạn', text: 'Fanpage, Zalo OA, kho ảnh/video gốc và tệp khách hàng thuộc quyền sở hữu của doanh nghiệp.' }
];

export function MarketingPage({ service, data }: { service: Service; data: SiteData }) {
  const contactHref = contactHrefFor(service);
  const phone = data.phone || CONTACT.phone;
  const posts = postsForService(data, service.id, 3);
  const projects = projectsForService(data, service.id);
  const subs = publishedSubServices(data, service.id);

  return (
    <main id="main" className="mk">
      <section className="mk-hero" aria-labelledby="mk-title">
        <div className="s-container mk-hero__grid">
          <div>
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: 'Digital Marketing' }]} />
            <p className="mk-hero__kicker">Digital Marketing</p>
            {/* H1 cố định theo đúng dịch vụ; tên trong menu lấy từ CMS */}
            <h1 className="mk-hero__title" id="mk-title">Digital Marketing cho doanh nghiệp dịch vụ</h1>
            <p className="mk-hero__lead">{service.heroLead || service.description}</p>
            {!!service.audience?.length && (
              <ul className="s-svc-audience" aria-label="Phù hợp với">{service.audience.map(a => <li key={a} className="s-badge s-badge--neutral">{a}</li>)}</ul>
            )}
            <div className="s-row s-stack-m">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Nhận tư vấn marketing</Link>
              <a className="s-btn s-btn--secondary s-btn--lg" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
            </div>
          </div>
          <ol className="mk-loop" aria-label="Năm khâu của một kế hoạch digital marketing">
            {PILLARS.map((p, i) => (
              <li key={p.id} style={{ ['--i' as string]: i }}>
                <a href={`#${p.id}`}>
                  <span className="mk-loop__icon"><p.icon aria-hidden="true" /></span>
                  <span className="mk-loop__n">{String(i + 1).padStart(2, '0')}</span>
                  <strong>{p.title}</strong>
                  <small>{p.short}</small>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ProblemsSection title="Marketing đang tốn công mà chưa rõ hiệu quả?" problems={service.problems || []} />

      <section className="mk-pillars" aria-labelledby="mk-pillars-title">
        <div className="s-container">
          <div className="mk-head">
            <p className="s-eyebrow">Phạm vi dịch vụ</p>
            <h2 className="s-h2" id="mk-pillars-title">Năm khâu, <span className="s-hl">một kế hoạch</span></h2>
            <p className="s-lead">Có thể làm trọn gói hoặc chọn từng khâu phù hợp với đội ngũ hiện có của bạn.</p>
          </div>
          <ol className="mk-pillars__list">
            {PILLARS.map((p, i) => (
              <li key={p.id} id={p.id} className="mk-pillar">
                <div className="mk-pillar__label">
                  <span className="mk-pillar__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mk-pillar__icon"><p.icon aria-hidden="true" /></span>
                </div>
                <div className="mk-pillar__body">
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
                <ul className="mk-pillar__items">{p.items.map(x => <li key={x}>{x}</li>)}</ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mk-content" aria-labelledby="mk-content-title">
        <div className="s-container mk-content__grid">
          <figure className="mk-content__img">
            <img src="/assets/legacy/event-session.webp" alt="Ảnh tổng kết workshop có khung nhận diện DANAVA" loading="lazy" decoding="async" width={1200} height={800} />
            <figcaption>Ảnh tổng kết có khung nhận diện cho chuỗi workshop do DANAVA tổ chức.</figcaption>
          </figure>
          <div>
            <p className="s-eyebrow">Nội dung thật</p>
            <h2 className="s-h3" id="mk-content-title">Hình ảnh từ chính hoạt động của bạn</h2>
            <p className="s-text">Khách hàng tin những gì họ nhận ra: không gian, con người và hoạt động thật của doanh nghiệp. DANAVA sản xuất nội dung tại cơ sở hoặc tại sự kiện của bạn, thống nhất khung nhận diện để mọi kênh cùng một giọng.</p>
            <Link className="s-link" href="/giai-phap/su-kien-truyen-thong/">Cần tổ chức sự kiện để có nội dung? Xem Sự kiện & Truyền thông <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="s-section s-section--brand" aria-labelledby="mk-own">
        <div className="s-container">
          <div className="mk-head">
            <p className="s-eyebrow"><KeyRound aria-hidden="true" style={{ width: 16, height: 16, verticalAlign: '-3px', marginRight: 6 }} />Cam kết</p>
            <h2 className="s-h2" id="mk-own">Kênh và dữ liệu luôn thuộc về bạn</h2>
          </div>
          <div className="s-grid s-grid--3">
            {OWNERSHIP.map(o => (
              <div key={o.title} className="s-feature s-card s-card--pad"><h3 className="s-feature__title">{o.title}</h3><p className="s-feature__text">{o.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection steps={service.process || []} title="Một chu kỳ marketing" />
      <PricingSection pricing={service.pricing || ''} contactHref={contactHref} />
      <RelatedProjects projects={projects} title="Dự án Digital Marketing" />
      {subs.length > 0 && (
        <section className="s-section s-section--line" aria-labelledby="mk-subs">
          <div className="s-container">
            <h2 className="s-h3" id="mk-subs">Dịch vụ theo kênh</h2>
            <ul className="u-linklist">{subs.map(s => <li key={s.id}><Link href={subServiceHref(data, s)}>{s.title}</Link></li>)}</ul>
          </div>
        </section>
      )}
      <RelatedPosts posts={posts} data={data} title="Bài viết về Digital Marketing" soft />
      <FaqSection faqs={service.faqs || []} contactHref={contactHref} />
      <CtaBand title="Lập kế hoạch marketing cho quý tới" lead="Gửi hiện trạng kênh và mục tiêu, DANAVA đề xuất phạm vi phù hợp với đội ngũ và ngân sách." primary={{ href: contactHref, label: 'Nhận tư vấn marketing' }} />
    </main>
  );
}
