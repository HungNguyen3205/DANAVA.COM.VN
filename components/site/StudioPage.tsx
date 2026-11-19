/**
 * /giai-phap/danava-studio/ — trang sản phẩm DANAVA Studio.
 * Thứ tự theo điều chủ phòng tập muốn thấy nhất: phần mềm chạy thật → ai đang dùng →
 * một ngày vận hành theo vai trò → app hội viên trên điện thoại → toàn bộ tính năng → case study →
 * chi phí & demo → triển khai → câu hỏi. Ảnh là màn hình thật của phần mềm (dữ liệu mẫu).
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Phone, CalendarDays, QrCode } from 'lucide-react';
import type { Service, SiteData } from '@/lib/content';
import { postsForService, projectsForService, publicClients, publishedSubServices, subServiceHref, sortServices } from '@/lib/site-queries';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs, CtaBand } from './ui';
import { FaqSection, ProblemsSection, ProcessSection, RelatedPosts, ServiceLinks } from './blocks';
import { STUDIO_GALLERY } from './product-showcase';
import { ProductGallery } from './ProductGallery';
import { StudioTour, type TourRole } from './StudioTour';
import { StudioModules } from './StudioModules';
import { contactHrefFor } from './ServiceDetailPage';

const S = '/assets/studio/';
const all = STUDIO_GALLERY.flatMap(g => g.shots);
/** Màn hình thật của app Yoga Club Vietnam (ycv.danava.vn), chụp 19/11/2026 — public/assets/studio/ycv/sources.json */
const YCV_URL = 'https://ycv.danava.vn';
const YCV = [
  { src: S + 'ycv/ycv-chao-mung.webp', title: 'Màn hình chào', text: 'Hội viên mới chọn đăng ký trải nghiệm, hội viên cũ đăng nhập ngay.' },
  { src: S + 'ycv/ycv-dang-nhap.webp', title: 'Đăng nhập', text: 'Bằng số điện thoại, email hoặc tài khoản Google.' },
  { src: S + 'ycv/ycv-chao-mung-en.webp', title: 'Ba ngôn ngữ', text: 'Tiếng Việt, English và 日本語 cho hội viên quốc tế.' }
];
const shot = (file: string) => { const x = all.find(s => s.src === S + file)!; return { src: x.src, title: x.title, text: x.text || '' }; };

const ROLES: TourRole[] = [
  { id: 'chu-co-so', label: 'Chủ cơ sở', device: 'desktop', lead: 'Nắm doanh thu, hội viên và đội ngũ mà không cần đứng ở quầy.', shots: [shot('dashboard.webp'), shot('reports.webp'), shot('commissions.webp'), shot('wallet.webp')] },
  { id: 'le-tan', label: 'Lễ tân', device: 'desktop', lead: 'Check-in, bán gói, bán hàng và cho thuê tủ đồ trên cùng một màn hình.', shots: [shot('checkin.webp'), shot('sell.webp'), shot('pos.webp'), shot('lockers.webp')] },
  { id: 'hlv', label: 'Huấn luyện viên', device: 'desktop', lead: 'Lịch lớp, lịch hẹn PT và danh sách học viên đặt chỗ hôm nay.', shots: [shot('classes.webp'), shot('appointments.webp'), shot('bookings.webp'), shot('members.webp')] },
  { id: 'hoi-vien', label: 'Hội viên', device: 'phone', lead: 'App hội viên mang tên và logo câu lạc bộ. Ví dụ thật: app Yoga Club Vietnam tại ycv.danava.vn.', shots: YCV }
];


const MODELS = [
  { title: 'Phòng Gym & Fitness', text: 'Gói tháng, gói buổi, PT 1-1, check-in QR, tủ đồ và bán nước, phụ kiện tại quầy.', sub: 'studio-gym' },
  { title: 'Yoga & Pilates studio', text: 'Lịch lớp theo sức chứa, đặt chỗ, danh sách chờ và thẻ buổi dùng nhiều lớp.', sub: 'studio-yoga-pilates' },
  { title: 'Spa & Wellness', text: 'Hồ sơ khách, gói liệu trình theo buổi, lịch hẹn và doanh thu theo dịch vụ.', sub: 'studio-spa' },
  { title: 'Bể bơi', text: 'Thẻ bơi theo mùa, vé lượt, lớp học bơi và check-in tại cổng.', sub: 'studio-pool' }
];

export function StudioPage({ service, data }: { service: Service; data: SiteData }) {
  const contactHref = contactHrefFor(service);
  const phone = data.phone || CONTACT.phone;
  const projects = projectsForService(data, 'studio');
  // Khách hàng đang dùng DANAVA Studio = khách hàng có case study Studio (không suy ra từ danh sách đối tác).
  const users = publicClients(data).filter(c => projects.some(p => p.id === c.projectId));
  const subs = publishedSubServices(data, 'studio');
  const modules = STUDIO_GALLERY.find(g => g.id === 'quan-tri')!.shots;
  const productUrl = service.productUrl || 'https://hello.danava.vn';

  return (
    <main id="main" className="st">
      {/* 1 · Hero: phần mềm chạy thật */}
      <section className="st-hero" aria-labelledby="st-title">
        <div className="s-container st-hero__grid">
          <div className="st-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
            <p className="st-hero__kicker">Phần mềm quản lý Gym · Yoga · Pilates · Spa · Bể bơi</p>
            <h1 className="st-hero__title" id="st-title">{service.title}</h1>
            <p className="st-hero__lead">{service.heroLead || service.description}</p>
            <div className="st-hero__cta">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>Đăng ký demo</Link>
              <a className="s-btn s-btn--lg st-btn-ghost" href={productUrl} target="_blank" rel="noopener">Xem gói & báo giá <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>
            </div>
            <ul className="st-hero__facts" aria-label="Điểm chính">
              <li>Chạy trên trình duyệt, không cần cài đặt</li>
              <li>App hội viên mang tên phòng tập của bạn</li>
              <li>Hỗ trợ chuyển dữ liệu từ Excel</li>
            </ul>
          </div>
          <div className="st-hero__stage" aria-hidden="true">
            <figure className="st-hero__laptop"><img src={S + 'dashboard.webp'} alt="" width={1280} height={800} fetchPriority="high" /></figure>
            <figure className="st-hero__phone"><img src={YCV[0].src} alt="" width={430} height={931} /></figure>
            <span className="st-chip st-chip--a"><QrCode />Check-in QR</span>
            <span className="st-chip st-chip--b"><CalendarDays />Lịch lớp & đặt chỗ</span>
          </div>
        </div>

        {/* 2 · Ai đang dùng */}
        {users.length > 0 && (
          <div className="s-container st-users">
            <p>Đang vận hành tại</p>
            <ul>
              {users.map(c => {
                const p = projects.find(x => x.id === c.projectId)!;
                return (
                  <li key={c.id}>
                    <Link href={`/du-an/${p.slug}/`}>
                      {c.logo && <img src={c.logo} alt="" width={72} height={48} loading="lazy" />}
                      <span><strong>{c.name}</strong><small>Xem case study <ArrowRight aria-hidden="true" /></small></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* 3 · Một ngày vận hành theo vai trò */}
      <section className="s-section st-day" aria-labelledby="st-day-title">
        <div className="s-container">
          <div className="st-head">
            <p className="st-head__kicker">Tham quan phần mềm</p>
            <h2 className="st-head__title" id="st-day-title">Một ngày ở phòng tập, <em>mỗi người một màn hình.</em></h2>
            <p className="st-head__lead">Chọn vai trò để xem họ làm việc trên DANAVA Studio thế nào. Ảnh chụp màn hình thật của phần mềm, dùng dữ liệu mẫu.</p>
          </div>
          <StudioTour roles={ROLES} />
        </div>
      </section>

      {/* 4 · App hội viên */}
      <section className="st-app" aria-labelledby="st-app-title">
        <div className="s-container st-app__grid">
          <div>
            <p className="st-head__kicker st-head__kicker--light">App hội viên thương hiệu riêng</p>
            <h2 className="st-head__title st-head__title--light" id="st-app-title">Phòng tập của bạn, <em>trong túi hội viên.</em></h2>
            <p className="st-app__lead">Hội viên tự mua gói, thanh toán QR, check-in bằng mã hoặc khuôn mặt, tích điểm đổi quà và nhận nhắc lịch. Mỗi cơ sở có app mang tên riêng: Yoga Club Vietnam dùng ycv.danava.vn, HARIVER dùng hariver.danava.vn, Huế Pilates & Yoga dùng hue.danava.vn.</p>
            <ul className="st-app__list">
              {['Mua và gia hạn gói ngay trên app', 'Thanh toán chuyển khoản QR tự xác nhận', 'Hợp đồng điện tử, xem lại bất cứ lúc nào', 'Nhắc lịch, hạn gói qua app, Zalo, email, SMS'].map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <figure className="st-fan-wrap">
            <ul className="st-fan" aria-label="Màn hình app hội viên Yoga Club Vietnam">
              {YCV.map((a, i) => (
                <li key={a.src} style={{ ['--i' as string]: i - 1 }}>
                  <img src={a.src} alt={`App Yoga Club Vietnam: ${a.title}`} width={430} height={931} loading="lazy" decoding="async" />
                  <span>{a.title}</span>
                </li>
              ))}
            </ul>
            <figcaption>Màn hình thật của app Yoga Club Vietnam · <a href={YCV_URL} target="_blank" rel="noopener">ycv.danava.vn<span className="s-sr"> (mở tab mới)</span></a></figcaption>
          </figure>
        </div>
      </section>

      <ProblemsSection title="Nếu phòng tập của bạn đang thế này" problems={service.problems || []} />

      {/* 5 · Toàn bộ tính năng: bảng điều khiển phân hệ với màn hình thật */}
      <section className="st-modules" aria-labelledby="st-modules-title">
        <span className="st-modules__glow st-modules__glow--a" aria-hidden="true" />
        <span className="st-modules__glow st-modules__glow--b" aria-hidden="true" />
        <div className="s-container">
          <div className="st-head st-head--center">
            <p className="st-head__kicker st-head__kicker--light">Tính năng</p>
            <h2 className="st-head__title st-head__title--light" id="st-modules-title">{modules.length} phân hệ, <em>một hệ thống.</em></h2>
            <p className="st-head__lead st-head__lead--light">Chọn một phân hệ để xem màn hình thật của nó. Mọi phân hệ dùng chung một dữ liệu hội viên, gói tập và doanh thu.</p>
          </div>
          <StudioModules modules={modules.map(m => ({ src: m.src, title: m.title, text: m.text || '' }))} />
          <details className="st-gallery">
            <summary>Xem toàn bộ {STUDIO_GALLERY.reduce((n, g) => n + g.shots.length, 0)} màn hình (phần mềm, app, website & khóa học online)</summary>
            <ProductGallery groups={STUDIO_GALLERY} idPrefix="studio" />
          </details>
        </div>
      </section>

      {/* 6 · Phù hợp mô hình */}
      <section className="s-section s-section--soft" aria-labelledby="st-models-title">
        <div className="s-container">
          <div className="st-head">
            <p className="st-head__kicker">Theo mô hình</p>
            <h2 className="st-head__title" id="st-models-title">Cấu hình theo cách cơ sở của bạn vận hành</h2>
          </div>
          <ul className="st-models">
            {MODELS.map(m => {
              const sub = subs.find(x => x.id === m.sub);
              return (
                <li key={m.title}>
                  <h3>{sub ? <Link href={subServiceHref(data, sub)}>{m.title}</Link> : m.title}</h3>
                  <p>{m.text}</p>
                  {sub && <span className="s-link">Xem chi tiết <ArrowRight aria-hidden="true" /></span>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 7 · Case study */}
      {projects.length > 0 && (
        <section className="s-section st-cases" aria-labelledby="st-cases-title">
          <div className="s-container">
            <div className="st-head">
              <p className="st-head__kicker">Đang vận hành thật</p>
              <h2 className="st-head__title" id="st-cases-title">Câu chuyện triển khai</h2>
            </div>
            <div className="st-cases__grid">
              {projects.map(p => (
                <article key={p.id} className="st-case">
                  <img src={p.image} alt={p.title} width={1200} height={750} loading="lazy" decoding="async" />
                  <div>
                    <p className="st-case__client">{p.client}{p.industry ? ` · ${p.industry}` : ''}</p>
                    <h3><Link href={`/du-an/${p.slug}/`}>{p.title}</Link></h3>
                    <p>{p.summary}</p>
                    {!!p.scope?.length && <ul>{p.scope.slice(0, 3).map(x => <li key={x}>{x}</li>)}</ul>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8 · Chi phí & demo */}
      <section className="st-price" aria-labelledby="st-price-title">
        <div className="s-container st-price__inner">
          <div>
            <p className="st-head__kicker st-head__kicker--light">Chi phí</p>
            <h2 className="st-head__title st-head__title--light" id="st-price-title">Xem gói và báo giá trước, <em>demo sau.</em></h2>
            <p>{service.pricing}</p>
          </div>
          <div className="st-price__actions">
            <a className="s-btn s-btn--primary s-btn--lg" href={productUrl} target="_blank" rel="noopener">{service.productLabel || 'Xem gói & báo giá'} <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>
            <Link className="s-btn s-btn--lg st-btn-ghost" href={contactHref}>Đăng ký demo</Link>
            <a className="st-price__phone" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
          </div>
        </div>
      </section>

      <ProcessSection steps={service.process || []} title="Từ buổi khảo sát đến ngày vận hành" />
      <FaqSection faqs={service.faqs || []} contactHref={contactHref} />
      <RelatedPosts posts={postsForService(data, 'studio', 3)} data={data} title="Kiến thức vận hành phòng tập" />
      <ServiceLinks services={sortServices(data.services).filter(s => ['website', 'marketing'].includes(s.id))} title="Kết hợp cùng DANAVA Studio" />
      <CtaBand title="Xem DANAVA Studio chạy với dữ liệu của bạn" lead="Đăng ký demo, chuyên viên DANAVA liên hệ để tìm hiểu mô hình và hướng dẫn trực tiếp trên phần mềm." primary={{ href: contactHref, label: 'Đăng ký demo' }} />
    </main>
  );
}
