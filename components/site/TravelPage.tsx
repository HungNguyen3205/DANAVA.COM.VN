/**
 * /giai-phap/du-lich-su-kien/ — trang "hành trình": nền kem sáng, tiêu đề Be Vietnam Pro đậm navy + cam.
 * Hero ảnh polaroid → kiểu chuyến đi → hành trình mẫu (bản đồ miền Trung) → một đầu mối lo trọn →
 * khoảnh khắc thật → bắt đầu thế nào (quy trình + báo giá) → FAQ → CTA.
 * Chữ cố định sửa/dịch được qua khóa txt.travel.*; tên, câu dẫn, đối tượng, phạm vi, vấn đề, FAQ lấy từ hồ sơ CMS.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bus, BedDouble, Camera, Check, MapPin, Phone, Sparkles, Tent, Users, Mic2, Compass } from 'lucide-react';
import type { Service, SiteData } from '@/lib/content';
import { CONTACT, formatPhone } from './catalog';
import { Crumbs } from './ui';
import { FaqSection } from './blocks';
import { contactHrefFor } from './ServiceDetailPage';
import { cmsText, ct } from './cms';
import { rich } from './rich';

type Opts = { rich?: boolean; multiline?: boolean };
const tt = (data: SiteData, k: string, def: string, label: string, opts: Opts = {}) => ct(data, `travel.${k}`, def, label, opts);

/** Ảnh thật của DANAVA cho từng kiểu chuyến đi (theo thứ tự "phạm vi" trong hồ sơ) */
const KIND_PHOTOS = [
  { src: '/assets/legacy/community.webp', w: 767, h: 511, icon: Tent },
  { src: '/assets/legacy/event-workshop.webp', w: 1200, h: 799, icon: Mic2 },
  { src: '/assets/blog/post-13591-1.webp', w: 1600, h: 1065, icon: Users },
  { src: '/assets/legacy/event-session.webp', w: 1200, h: 799, icon: Compass }
];

const DAYS = [
  { place: 'Đà Nẵng', title: 'Gặp nhau bên biển', items: ['Xe đón đoàn tại sân bay, ga hoặc văn phòng', 'Nhận phòng, nghỉ ngơi', 'Yoga đón hoàng hôn trên bãi biển', 'Tiệc tối làm quen, gắn kết'] },
  { place: 'Sơn Trà · Hội An', title: 'Một ngày cho cả nhóm', items: ['Thiền và yoga lúc bình minh', 'Workshop hoặc team building theo mục tiêu nhóm', 'Chiều tối dạo phố cổ Hội An'] },
  { place: 'Trở về', title: 'Mang năng lượng về nhà', items: ['Buổi chia sẻ, thiền trà', 'Tổng kết và chụp ảnh kỷ niệm', 'Xe đưa đoàn về điểm hẹn'] }
];

const SOLVES = [
  'Một điều phối viên lo xe, phòng, địa điểm và hậu cần. Bạn chỉ làm việc với một người.',
  'Lịch trình viết riêng cho mục tiêu của nhóm: gắn kết, nghỉ dưỡng hay học hỏi.',
  'Có kịch bản chương trình và người điều phối đi cùng đoàn từ lúc đón đến lúc về.'
];

const INCLUDED = [
  { icon: Bus, title: 'Di chuyển', text: 'Xe limousine, xe đoàn' },
  { icon: BedDouble, title: 'Lưu trú', text: 'Resort, homestay, khách sạn' },
  { icon: MapPin, title: 'Địa điểm & hậu cần', text: 'Không gian tập, hội trường, tiệc' },
  { icon: Camera, title: 'Ghi hình', text: 'Ảnh, video kỷ niệm chuyến đi' }
];

const MOMENTS = [
  { src: '/assets/blog/post-13591-5.webp', w: 1600, h: 1065, caption: 'Soundbath Live Concert · Đà Nẵng' },
  { src: '/assets/legacy/community.webp', w: 767, h: 511, caption: 'Yoga ngoài trời cùng cộng đồng' },
  { src: '/assets/legacy/event-group.webp', w: 1200, h: 799, caption: 'Cổng năng lượng 05/05 · Đà Nẵng' },
  { src: '/assets/legacy/post-tea.webp', w: 720, h: 390, caption: 'Workshop Thiền trà' },
  { src: '/assets/blog/post-13591-10.webp', w: 1600, h: 1065, caption: 'Chia sẻ cùng các câu lạc bộ yoga' }
];

const STEPS = [
  { title: 'Kể cho DANAVA nghe', text: 'Thời gian, số người, điểm đến mong muốn và mục tiêu chuyến đi.' },
  { title: 'Nhận lịch trình & báo giá', text: 'Đề xuất chương trình chi tiết, chia rõ từng hạng mục chi phí.' },
  { title: 'Chốt và chuẩn bị', text: 'Đặt xe, phòng, địa điểm; thống nhất kịch bản và danh sách đoàn.' },
  { title: 'Lên đường', text: 'Điều phối viên đi cùng đoàn, gửi ảnh và tổng kết sau chuyến đi.' }
];

export function TravelPage({ service, data }: { service: Service; data: SiteData }) {
  const contactHref = contactHrefFor(service);
  const phone = data.phone || CONTACT.phone;
  const svc = `Hồ sơ ${service.title}`;
  const rec = (field: string, label: string, multiline = false) => cmsText(`rec.services.${service.id}.${field}`, label, { scope: 'record', scopeLabel: svc, ...(multiline ? { multiline: true } : {}) });
  const T = (k: string, def: string, label: string, opts: Opts = {}) => { const x = tt(data, k, def, label, opts); return { ...x.a, children: opts.rich ? rich(x.v) : x.v }; };
  const kinds = service.items || [];
  const problems = service.problems || [];
  const steps = service.process?.length ? service.process : null;
  const pricing = service.pricing?.trim() || '';
  const faqs = service.faqs || [];

  return (
    <main id="main" className="tv">
      {/* ------------------------------------------------------------ Hero */}
      <section className="tv-hero" aria-labelledby="tv-title">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: service.title }]} />
          <div className="tv-hero__grid">
            <div className="tv-hero__copy">
              <p className="tv-kicker"><Sparkles aria-hidden="true" /><span {...rec('title', 'Tên sản phẩm')}>{service.title}</span></p>
              <h1 className="tv-title" id="tv-title" {...T('hero.title', 'Đi cùng nhau, *về gần nhau hơn.*', 'Tiêu đề lớn', { rich: true })} />
              <p className="tv-lead" {...rec(service.heroLead ? 'heroLead' : 'description', 'Câu dẫn sản phẩm', true)}>{service.heroLead || service.description}</p>
              {!!service.audience?.length && (
                <ul className="tv-audience" aria-label="Phù hợp với">
                  {service.audience.map((a, i) => <li key={a} {...rec(`audience.${i}`, 'Đối tượng phù hợp')}>{a}</li>)}
                </ul>
              )}
              <div className="tv-actions">
                <Link className="tv-btn tv-btn--primary" href={contactHref}><span {...T('cta.request', 'Gửi yêu cầu tổ chức', 'Nút gửi yêu cầu')} /> <ArrowRight aria-hidden="true" /></Link>
                <a className="tv-btn tv-btn--ghost" href="#hanh-trinh"><span {...T('hero.sample', 'Xem hành trình mẫu', 'Nút xem hành trình mẫu')} /></a>
              </div>
            </div>
            <div className="tv-hero__art" aria-hidden="true">
              <svg className="tv-hero__path" viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M20 260 C 120 200, 80 80, 220 90 S 360 40, 390 20" /></svg>
              <figure className="tv-polaroid tv-polaroid--a">
                <img src="/assets/legacy/community.webp" alt="" width={767} height={511} fetchPriority="high" />
                <figcaption>Yoga ngoài trời</figcaption>
              </figure>
              <figure className="tv-polaroid tv-polaroid--b">
                <img src="/assets/blog/post-13591-1.webp" alt="" width={1600} height={1065} />
                <figcaption>Soundbath · Đà Nẵng</figcaption>
              </figure>
              <span className="tv-stamp"><b>DANAVA</b><i>Đà Nẵng</i><small>Retreat · Team</small></span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Kiểu chuyến đi */}
      {kinds.length > 0 && (
        <section className="tv-sec" aria-labelledby="tv-kinds">
          <div className="s-container">
            <div className="tv-head">
              <p className="tv-eyebrow" {...T('kinds.eyebrow', 'Chọn kiểu chuyến đi', 'Dòng chữ nhỏ')} />
              <h2 className="tv-h2" id="tv-kinds" {...T('kinds.title', 'Mỗi nhóm một *lý do để lên đường.*', 'Tiêu đề', { rich: true })} />
            </div>
            <ul className="tv-kinds">
              {kinds.map((k, i) => {
                const ph = KIND_PHOTOS[i % KIND_PHOTOS.length];
                return (
                  <li key={k} className="tv-kind">
                    <img src={ph.src} alt="" width={ph.w} height={ph.h} loading="lazy" decoding="async" />
                    <span className="tv-kind__no">{String(i + 1).padStart(2, '0')}</span>
                    <div className="tv-kind__body">
                      <span className="tv-kind__icon"><ph.icon aria-hidden="true" /></span>
                      <h3 {...rec(`items.${i}`, 'Kiểu chuyến đi')}>{k}</h3>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ Hành trình mẫu */}
      <section className="tv-sec tv-trip" id="hanh-trinh" aria-labelledby="tv-trip">
        <div className="s-container tv-trip__grid">
          <div className="tv-trip__intro">
            <p className="tv-eyebrow" {...T('trip.eyebrow', 'Hành trình mẫu', 'Dòng chữ nhỏ')} />
            <h2 className="tv-h2" id="tv-trip" {...T('trip.title', '3 ngày 2 đêm *Đà Nẵng – Hội An*', 'Tiêu đề', { rich: true })} />
            <p className="tv-text" {...T('trip.lead', 'Một gợi ý cho retreat hoặc team building. DANAVA điều chỉnh điểm đến, nhịp độ và hoạt động theo nhóm và ngân sách của bạn.', 'Câu dẫn', { multiline: true })} />
            <svg className="tv-map" viewBox="0 0 320 360" role="img" aria-label="Bản đồ hành trình Đà Nẵng, Sơn Trà, Hội An">
              <path className="tv-map__land" d="M0 0 H150 C 160 40, 150 70, 175 95 C 200 118, 222 112, 228 132 C 232 150, 205 160, 210 185 C 215 215, 240 240, 250 275 C 258 305, 280 330, 300 360 H0 Z" />
              <path className="tv-map__coast" d="M150 0 C 160 40, 150 70, 175 95 C 200 118, 222 112, 228 132 C 232 150, 205 160, 210 185 C 215 215, 240 240, 250 275 C 258 305, 280 330, 300 360" />
              <path className="tv-map__route" d="M150 165 C 180 150, 215 140, 222 128 M 222 128 C 230 170, 230 230, 236 268" />
              <g className="tv-map__pin"><circle cx="150" cy="165" r="9" /><text x="138" y="170" textAnchor="end">Đà Nẵng</text></g>
              <g className="tv-map__pin"><circle cx="222" cy="128" r="9" /><text x="236" y="110">Sơn Trà</text></g>
              <g className="tv-map__pin"><circle cx="236" cy="268" r="9" /><text x="222" y="273" textAnchor="end">Hội An</text></g>
              <text className="tv-map__sea" x="280" y="200">Biển Đông</text>
            </svg>
          </div>
          <ol className="tv-days">
            {DAYS.map((d, i) => (
              <li key={d.title} className="tv-day">
                <span className="tv-day__no"><small {...T('trip.day', 'Ngày', 'Nhãn ngày')} />{i + 1}</span>
                <div>
                  <p className="tv-day__place"><MapPin aria-hidden="true" /><span {...T(`trip.days.${i}.place`, d.place, 'Địa điểm trong ngày')} /></p>
                  <h3 {...T(`trip.days.${i}.title`, d.title, 'Tên ngày')} />
                  <ul>{d.items.map((x, j) => <li key={x} {...T(`trip.days.${i}.items.${j}`, x, 'Hoạt động')} />)}</ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ Một đầu mối */}
      <section className="tv-sec tv-one" aria-labelledby="tv-one">
        <div className="s-container">
          <div className="tv-one__grid">
            <div className="tv-head tv-head--left">
              <p className="tv-eyebrow" {...T('one.eyebrow', 'Vì sao chọn DANAVA', 'Dòng chữ nhỏ')} />
              <h2 className="tv-h2" id="tv-one" {...T('one.title', 'Bạn lo cho đoàn. *DANAVA lo cho chuyến đi.*', 'Tiêu đề', { rich: true })} />
            </div>
            {problems.length > 0 && (
              <ul className="tv-swap">
                {problems.map((p, i) => (
                  <li key={p}>
                    <p className="tv-swap__before" {...rec(`problems.${i}`, 'Vấn đề thường gặp')}>{p}</p>
                    {SOLVES[i] && <p className="tv-swap__after"><Check aria-hidden="true" /><span {...T(`one.solves.${i}`, SOLVES[i], 'Cách DANAVA giải quyết', { multiline: true })} /></p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul className="tv-included" aria-label="Hạng mục DANAVA sắp xếp">
            {INCLUDED.map((x, i) => (
              <li key={x.title}>
                <span className="tv-included__icon"><x.icon aria-hidden="true" /></span>
                <b {...T(`one.included.${i}.title`, x.title, 'Hạng mục')} />
                <small {...T(`one.included.${i}.text`, x.text, 'Mô tả hạng mục')} />
              </li>
            ))}
          </ul>
          <div className="tv-go">
            <img src="/assets/danavago/home.webp" alt="Trang chủ danavago.com với xe DANAVA GO trên cầu Rồng" width={1280} height={800} loading="lazy" decoding="async" />
            <div>
              <p className="tv-eyebrow" {...T('go.eyebrow', 'Di chuyển cùng DANAVA GO', 'Dòng chữ nhỏ')} />
              <p className="tv-go__text" {...T('go.text', 'Xe đoàn và limousine đặt qua nền tảng DANAVA GO của chính DANAVA: chọn ghế, vé điện tử, theo dõi xe trên bản đồ.', 'Mô tả', { multiline: true })} />
              <Link className="tv-link" href="/giai-phap/danava-go/"><span {...T('go.link', 'Tìm hiểu DANAVA GO', 'Liên kết')} /> <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Khoảnh khắc */}
      <section className="tv-sec tv-moments" aria-labelledby="tv-moments">
        <div className="s-container">
          <div className="tv-head">
            <p className="tv-eyebrow" {...T('moments.eyebrow', 'Khoảnh khắc thật', 'Dòng chữ nhỏ')} />
            <h2 className="tv-h2" id="tv-moments" {...T('moments.title', 'Những buổi gặp gỡ *DANAVA đã cùng tổ chức*', 'Tiêu đề', { rich: true })} />
          </div>
          <ul className="tv-mosaic">
            {MOMENTS.map((m, i) => (
              <li key={m.src + i}>
                <img src={m.src} alt={m.caption} width={m.w} height={m.h} loading="lazy" decoding="async" />
                <span {...T(`moments.items.${i}`, m.caption, 'Chú thích ảnh')} />
              </li>
            ))}
          </ul>
          <p className="tv-moments__more"><Link className="tv-link" href="/blogs/"><span {...T('moments.more', 'Đọc tin hoạt động', 'Liên kết tin hoạt động')} /> <ArrowRight aria-hidden="true" /></Link></p>
        </div>
      </section>

      {/* ------------------------------------------------------------ Bắt đầu thế nào */}
      <section className="tv-sec tv-start" aria-labelledby="tv-start">
        <div className="s-container tv-start__grid">
          <div>
            <p className="tv-eyebrow" {...T('start.eyebrow', 'Bắt đầu thế nào', 'Dòng chữ nhỏ')} />
            <h2 className="tv-h2" id="tv-start" {...T('start.title', 'Bốn bước *từ ý tưởng đến lên xe.*', 'Tiêu đề', { rich: true })} />
            <ol className="tv-steps">
              {steps
                ? steps.map((s, i) => (
                  <li key={s.title}><b {...rec(`process.${i}.title`, 'Tên bước')}>{s.title}</b><span {...rec(`process.${i}.text`, 'Mô tả bước', true)}>{s.text}</span></li>
                ))
                : STEPS.map((s, i) => (
                  <li key={s.title}><b {...T(`start.steps.${i}.title`, s.title, 'Tên bước')} /><span {...T(`start.steps.${i}.text`, s.text, 'Mô tả bước', { multiline: true })} /></li>
                ))}
            </ol>
          </div>
          <aside className="tv-ticket" aria-labelledby="tv-price">
            <div className="tv-ticket__main">
              <p className="tv-ticket__label" id="tv-price" {...T('price.label', 'Báo giá', 'Nhãn báo giá')} />
              {pricing && <p className="tv-ticket__text" {...rec('pricing', 'Cách xác định báo giá', true)}>{pricing}</p>}
              <Link className="tv-btn tv-btn--primary" href={contactHref}><span {...T('price.button', 'Nhận lịch trình & báo giá', 'Nút nhận báo giá')} /> <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="tv-ticket__stub">
              <span {...T('price.stub', 'Miễn phí tư vấn', 'Chữ trên cuống vé')} />
              <a href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
            </div>
          </aside>
        </div>
      </section>

      {faqs.length > 0 && (
        <div className="tv-faq">
          <FaqSection faqs={faqs} contactHref={contactHref} rec={{ base: `rec.services.${service.id}`, label: svc }} />
        </div>
      )}

      {/* ------------------------------------------------------------ CTA */}
      <section className="tv-final" aria-labelledby="tv-final">
        <div className="s-container">
          <div className="tv-final__card">
            <div className="tv-final__copy">
              <h2 className="tv-h2" id="tv-final" {...T('final.title', 'Chuyến đi tiếp theo *của nhóm bạn* bắt đầu từ đây.', 'Tiêu đề', { rich: true })} />
              <p className="tv-text" {...T('final.lead', 'Gửi thời gian, số người và điểm đến mong muốn. DANAVA phản hồi kèm lịch trình gợi ý và báo giá.', 'Câu dẫn', { multiline: true })} />
              <div className="tv-actions">
                <Link className="tv-btn tv-btn--primary" href={contactHref}><span {...T('cta.request', 'Gửi yêu cầu tổ chức', 'Nút gửi yêu cầu')} /> <ArrowRight aria-hidden="true" /></Link>
                <a className="tv-btn tv-btn--ghost" href={`tel:${phone}`}><Phone aria-hidden="true" />{formatPhone(phone)}</a>
              </div>
              <p className="tv-final__cross"><span {...T('final.cross', 'Cần hội nghị, gala hay booth trưng bày?', 'Câu liên kết sự kiện')} /> <Link className="tv-link" href="/giai-phap/su-kien-truyen-thong/"><span {...T('final.crossLink', 'Xem Tổ chức sự kiện', 'Liên kết sự kiện')} /> <ArrowRight aria-hidden="true" /></Link></p>
            </div>
            <figure className="tv-final__photo" aria-hidden="true">
              <img src="/assets/legacy/event-group.webp" alt="" width={1200} height={799} loading="lazy" decoding="async" />
            </figure>
          </div>
        </div>
      </section>
    </main>
  );
}
