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
import { pageCopy } from '@/lib/blocks';
import { cmsText, ct } from './cms';
import { rich } from './rich';

const S = '/assets/studio/';
const all = STUDIO_GALLERY.flatMap(g => g.shots);
/** Màn hình thật của app Yoga Club Vietnam (ycv.danava.vn), chụp 19/11/2026 — public/assets/studio/ycv/sources.json */
const YCV_URL = 'https://ycv.danava.vn';
const YCV = [
  { src: S + 'ycv/ycv-chao-mung.webp', title: 'Màn hình chào', text: 'Hội viên mới chọn đăng ký trải nghiệm, hội viên cũ đăng nhập ngay.' },
  { src: S + 'ycv/ycv-dang-nhap.webp', title: 'Đăng nhập', text: 'Bằng số điện thoại, email hoặc tài khoản Google.' },
  { src: S + 'ycv/ycv-chao-mung-en.webp', title: 'Ba ngôn ngữ', text: 'Tiếng Việt, English và 日本語 cho hội viên quốc tế.' }
];
/** Cùng khóa với StudioTour.shotKey (không nhập được hàm từ module client vào server component) */
const shotKey = (src: string) => `studio.shots.${(src.split('/').pop() || '').replace(/\.[a-z]+$/i, '').toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
const FACTS = ['Chạy trên trình duyệt, không cần cài đặt', 'App hội viên mang tên phòng tập của bạn', 'Hỗ trợ chuyển dữ liệu từ Excel'];
const APP_LIST = ['Mua và gia hạn gói ngay trên app', 'Thanh toán chuyển khoản QR tự xác nhận', 'Hợp đồng điện tử, xem lại bất cứ lúc nào', 'Nhắc lịch, hạn gói qua app, Zalo, email, SMS'];
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
  const copy = pageCopy(data, 'studio');
  const contactHref = contactHrefFor(service);
  const phone = data.phone || CONTACT.phone;
  const projects = projectsForService(data, 'studio');
  // Khách hàng đang dùng DANAVA Studio = khách hàng có case study Studio (không suy ra từ danh sách đối tác).
  const users = publicClients(data).filter(c => projects.some(p => p.id === c.projectId));
  const subs = publishedSubServices(data, 'studio');
  const modules = STUDIO_GALLERY.find(g => g.id === 'quan-tri')!.shots;
  const productUrl = service.productUrl || 'https://hello.danava.vn';
  // Chữ cố định sửa được (lib/site-text.ts) — khóa studio.*
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `studio.${k}`, def, label, opts);
  const rec = (path: string, label: string, scopeLabel: string, multiline = false) => cmsText(`rec.${path}`, label, { scope: 'record', scopeLabel, ...(multiline ? { multiline: true } : {}) });
  const svc = `Hồ sơ ${service.title}`;
  const demo = t('cta.demo', 'Đăng ký demo', 'Nút đăng ký demo');
  const priceBtn = t('cta.price', 'Xem gói & báo giá', 'Nút xem gói & báo giá');
  const kicker = t('hero.kicker', 'Phần mềm quản lý Gym · Yoga · Pilates · Spa · Bể bơi', 'Dòng chữ nhỏ');
  const usersLabel = t('users.label', 'Đang vận hành tại', 'Nhãn khách hàng đang dùng');
  const caseLink = t('users.case', 'Xem case study', 'Chữ liên kết case study');
  const dayK = t('day.kicker', 'Tham quan phần mềm', 'Dòng chữ nhỏ');
  const dayT = t('day.title', 'Một ngày ở phòng tập, *mỗi người một màn hình.*', 'Tiêu đề', { rich: true });
  const dayL = t('day.lead', 'Chọn vai trò để xem họ làm việc trên DANAVA Studio thế nào. Ảnh chụp màn hình thật của phần mềm, dùng dữ liệu mẫu.', 'Câu dẫn', { multiline: true });
  const appK = t('app.kicker', 'App hội viên thương hiệu riêng', 'Dòng chữ nhỏ');
  const appT = t('app.title', 'Phòng tập của bạn, *trong túi hội viên.*', 'Tiêu đề', { rich: true });
  const appL = t('app.lead', 'Hội viên tự mua gói, thanh toán QR, check-in bằng mã hoặc khuôn mặt, tích điểm đổi quà và nhận nhắc lịch. Mỗi cơ sở có app mang tên riêng: Yoga Club Vietnam dùng ycv.danava.vn, HARIVER dùng hariver.danava.vn, Huế Pilates & Yoga dùng hue.danava.vn.', 'Câu dẫn', { multiline: true });
  const appCap = t('app.caption', 'Màn hình thật của app Yoga Club Vietnam', 'Chú thích ảnh app');
  const modK = t('modules.kicker', 'Tính năng', 'Dòng chữ nhỏ');
  const modT = t('modules.title', 'phân hệ, *một hệ thống.*', 'Tiêu đề (sau số phân hệ)', { rich: true });
  const modL = t('modules.lead', 'Chọn một phân hệ để xem màn hình thật của nó. Mọi phân hệ dùng chung một dữ liệu hội viên, gói tập và doanh thu.', 'Câu dẫn', { multiline: true });
  const galA = t('modules.gallery.before', 'Xem toàn bộ', 'Nút xem toàn bộ (trước số)');
  const galB = t('modules.gallery.after', 'màn hình (phần mềm, app, website & khóa học online)', 'Nút xem toàn bộ (sau số)');
  const modelsK = t('models.kicker', 'Theo mô hình', 'Dòng chữ nhỏ');
  const modelsT = t('models.title', 'Cấu hình theo cách cơ sở của bạn vận hành', 'Tiêu đề');
  const more = t('models.more', 'Xem chi tiết', 'Chữ liên kết xem chi tiết');
  const casesK = t('cases.kicker', 'Đang vận hành thật', 'Dòng chữ nhỏ');
  const casesT = t('cases.title', 'Câu chuyện triển khai', 'Tiêu đề');
  const priceK = t('price.kicker', 'Chi phí', 'Dòng chữ nhỏ');
  const priceT = t('price.title', 'Xem gói và báo giá trước, *demo sau.*', 'Tiêu đề', { rich: true });

  return (
    <main id="main" className="st">
      {/* 1 · Hero: phần mềm chạy thật */}
      <section className="st-hero" aria-labelledby="st-title">
        <div className="s-container st-hero__grid">
          <div className="st-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
            <p className="st-hero__kicker" {...kicker.a}>{kicker.v}</p>
            <h1 className="st-hero__title" id="st-title" {...cmsText(`rec.services.${service.id}.title`, 'Tên sản phẩm', { scope: 'record', scopeLabel: `Hồ sơ ${service.title}` })}>{service.title}</h1>
            <p className="st-hero__lead" {...cmsText(`rec.services.${service.id}.${service.heroLead ? 'heroLead' : 'description'}`, 'Câu dẫn sản phẩm', { multiline: true, scope: 'record', scopeLabel: `Hồ sơ ${service.title}` })}>{service.heroLead || service.description}</p>
            <div className="st-hero__cta">
              <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}><span {...demo.a}>{demo.v}</span></Link>
              <a className="s-btn s-btn--lg st-btn-ghost" href={productUrl} target="_blank" rel="noopener"><span {...priceBtn.a}>{priceBtn.v}</span> <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>
            </div>
            <ul className="st-hero__facts" aria-label="Điểm chính">
              {FACTS.map((f, i) => { const x = t(`hero.facts.${i}`, f, 'Điểm chính'); return <li key={i} {...x.a}>{x.v}</li>; })}
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
            <p {...usersLabel.a}>{usersLabel.v}</p>
            <ul>
              {users.map(c => {
                const p = projects.find(x => x.id === c.projectId)!;
                return (
                  <li key={c.id}>
                    <Link href={`/du-an/${p.slug}/`}>
                      {c.logo && <img src={c.logo} alt="" width={72} height={48} loading="lazy" />}
                      <span><strong {...rec(`clients.${c.id}.name`, 'Tên khách hàng', 'Hồ sơ khách hàng')}>{c.name}</strong><small><span {...caseLink.a}>{caseLink.v}</span> <ArrowRight aria-hidden="true" /></small></span>
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
            <p className="st-head__kicker" {...dayK.a}>{dayK.v}</p>
            <h2 className="st-head__title" id="st-day-title" {...dayT.a}>{rich(dayT.v)}</h2>
            <p className="st-head__lead" {...dayL.a}>{dayL.v}</p>
          </div>
          <StudioTour roles={ROLES} />
        </div>
      </section>

      {/* 4 · App hội viên */}
      <section className="st-app" aria-labelledby="st-app-title">
        <div className="s-container st-app__grid">
          <div>
            <p className="st-head__kicker st-head__kicker--light" {...appK.a}>{appK.v}</p>
            <h2 className="st-head__title st-head__title--light" id="st-app-title" {...appT.a}>{rich(appT.v)}</h2>
            <p className="st-app__lead" {...appL.a}>{appL.v}</p>
            <ul className="st-app__list">
              {APP_LIST.map((x, i) => { const y = t(`app.list.${i}`, x, 'Ý trong danh sách'); return <li key={x} {...y.a}>{y.v}</li>; })}
            </ul>
          </div>
          <figure className="st-fan-wrap">
            <ul className="st-fan" aria-label="Màn hình app hội viên Yoga Club Vietnam">
              {YCV.map((a, i) => {
                const y = ct(data, `${shotKey(a.src)}.title`, a.title, 'Tên màn hình');
                return (
                  <li key={a.src} style={{ ['--i' as string]: i - 1 }}>
                    <img src={a.src} alt={`App Yoga Club Vietnam: ${y.v}`} width={430} height={931} loading="lazy" decoding="async" />
                    <span {...y.a}>{y.v}</span>
                  </li>
                );
              })}
            </ul>
            <figcaption><span {...appCap.a}>{appCap.v}</span> · <a href={YCV_URL} target="_blank" rel="noopener">ycv.danava.vn<span className="s-sr"> (mở tab mới)</span></a></figcaption>
          </figure>
        </div>
      </section>

      <ProblemsSection title="Nếu phòng tập của bạn đang thế này" problems={service.problems || []} rec={{ base: `rec.services.${service.id}`, label: `Hồ sơ ${service.title}` }} />

      {/* 5 · Toàn bộ tính năng: bảng điều khiển phân hệ với màn hình thật */}
      <section className="st-modules" aria-labelledby="st-modules-title">
        <span className="st-modules__glow st-modules__glow--a" aria-hidden="true" />
        <span className="st-modules__glow st-modules__glow--b" aria-hidden="true" />
        <div className="s-container">
          <div className="st-head st-head--center">
            <p className="st-head__kicker st-head__kicker--light" {...modK.a}>{modK.v}</p>
            <h2 className="st-head__title st-head__title--light" id="st-modules-title">{modules.length} <span {...modT.a}>{rich(modT.v)}</span></h2>
            <p className="st-head__lead st-head__lead--light" {...modL.a}>{modL.v}</p>
          </div>
          <StudioModules modules={modules.map(m => ({ src: m.src, title: m.title, text: m.text || '' }))} />
          <details className="st-gallery">
            <summary><span {...galA.a}>{galA.v}</span> {STUDIO_GALLERY.reduce((n, g) => n + g.shots.length, 0)} <span {...galB.a}>{galB.v}</span></summary>
            <ProductGallery groups={STUDIO_GALLERY} idPrefix="studio" />
          </details>
        </div>
      </section>

      {/* 6 · Phù hợp mô hình */}
      <section className="s-section s-section--soft" aria-labelledby="st-models-title">
        <div className="s-container">
          <div className="st-head">
            <p className="st-head__kicker" {...modelsK.a}>{modelsK.v}</p>
            <h2 className="st-head__title" id="st-models-title" {...modelsT.a}>{modelsT.v}</h2>
          </div>
          <ul className="st-models">
            {MODELS.map((m, i) => {
              const sub = subs.find(x => x.id === m.sub);
              const mt = t(`models.items.${i}.title`, m.title, 'Tên mô hình'), mx = t(`models.items.${i}.text`, m.text, 'Mô tả mô hình', { multiline: true });
              return (
                <li key={m.title}>
                  <h3>{sub ? <Link href={subServiceHref(data, sub)}><span {...mt.a}>{mt.v}</span></Link> : <span {...mt.a}>{mt.v}</span>}</h3>
                  <p {...mx.a}>{mx.v}</p>
                  {sub && <span className="s-link"><span {...more.a}>{more.v}</span> <ArrowRight aria-hidden="true" /></span>}
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
              <p className="st-head__kicker" {...casesK.a}>{casesK.v}</p>
              <h2 className="st-head__title" id="st-cases-title" {...casesT.a}>{casesT.v}</h2>
            </div>
            <div className="st-cases__grid">
              {projects.map(p => (
                <article key={p.id} className="st-case">
                  <img src={p.image} alt={p.title} width={1200} height={750} loading="lazy" decoding="async" />
                  <div>
                    <p className="st-case__client"><span {...rec(`projects.${p.id}.client`, 'Khách hàng', 'Hồ sơ dự án')}>{p.client}</span>{p.industry ? <> · <span {...rec(`projects.${p.id}.industry`, 'Ngành', 'Hồ sơ dự án')}>{p.industry}</span></> : ''}</p>
                    <h3><Link href={`/du-an/${p.slug}/`}><span {...rec(`projects.${p.id}.title`, 'Tên dự án', 'Hồ sơ dự án')}>{p.title}</span></Link></h3>
                    <p {...rec(`projects.${p.id}.summary`, 'Tóm tắt dự án', 'Hồ sơ dự án', true)}>{p.summary}</p>
                    {!!p.scope?.length && <ul>{p.scope.slice(0, 3).map((x, i) => <li key={x} {...rec(`projects.${p.id}.scope.${i}`, 'Hạng mục dự án', 'Hồ sơ dự án')}>{x}</li>)}</ul>}
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
            <p className="st-head__kicker st-head__kicker--light" {...priceK.a}>{priceK.v}</p>
            <h2 className="st-head__title st-head__title--light" id="st-price-title" {...priceT.a}>{rich(priceT.v)}</h2>
            <p {...(service.pricing ? rec(`services.${service.id}.pricing`, 'Chi phí', svc, true) : {})}>{service.pricing}</p>
          </div>
          <div className="st-price__actions">
            <a className="s-btn s-btn--primary s-btn--lg" href={productUrl} target="_blank" rel="noopener">{service.productLabel ? <span {...rec(`services.${service.id}.productLabel`, 'Chữ nút trang sản phẩm', svc)}>{service.productLabel}</span> : <span {...priceBtn.a}>{priceBtn.v}</span>} <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>
            <Link className="s-btn s-btn--lg st-btn-ghost" href={contactHref}><span {...demo.a}>{demo.v}</span></Link>
            <a className="st-price__phone" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
          </div>
        </div>
      </section>

      <ProcessSection steps={service.process || []} title="Từ buổi khảo sát đến ngày vận hành" rec={{ base: `rec.services.${service.id}`, label: `Hồ sơ ${service.title}` }} />
      <FaqSection faqs={service.faqs || []} contactHref={contactHref} rec={{ base: `rec.services.${service.id}`, label: `Hồ sơ ${service.title}` }} />
      <RelatedPosts posts={postsForService(data, 'studio', 3)} data={data} title="Bài viết về vận hành phòng tập" />
      <ServiceLinks services={sortServices(data.services).filter(s => ['website', 'events'].includes(s.id))} title="Kết hợp cùng DANAVA Studio" />
      <CtaBand cms={{ title: 'pages.studio.ctaTitle', lead: copy.ctaLead ? 'pages.studio.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: contactHref, label: demo.v }} />
    </main>
  );
}
