/**
 * Trang giới thiệu 3 sản phẩm số — mỗi trang một phong cách theo đúng tinh thần sản phẩm:
 *  - DANAVA GO: vé lên xe (boarding pass), tông hoàng hôn kem – cam – xanh navy như danavago.com
 *  - Hello DANAVA: bảng giá tương tác sáng màu, cam – xanh của DANAVA Studio
 *  - DANAVA Work: bảng công việc tối, các thẻ công việc dạng khung (minh họa)
 * Nội dung: lib/products.ts (thông tin công khai trên chính trang sản phẩm). Ảnh: chụp màn hình thật.
 * Chữ sửa trực tiếp được (khóa go.*, hello.*, work.*; bảng giá: block.pricing.*), chữ mặc định giữ nguyên như lib/products.ts.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, Bus, CalendarCheck, CalendarDays, Gauge, LayoutDashboard, Store, UserRound, Wallet, Check, ClipboardList, KeyRound, MapPin, QrCode, Smartphone, Ticket, Users, Armchair, Eye, ListChecks, Route } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { GO, HELLO, WORK, PRODUCTS_CHECKED } from '@/lib/products';
import { block } from '@/lib/blocks';
import { perMonth, priceText } from '@/lib/quote';
import { cmsText, ct } from './cms';
import { rich } from './rich';
import { Crumbs } from './ui';
import { BrowserFrame } from './showcase';
import { HelloCompare } from './HelloCompare';
import { StudioTour } from './StudioTour';
import { GoFleet } from './GoFleet';

const ext = { target: '_blank', rel: 'noopener' } as const;
const crumbs = (data: SiteData, label: string) => <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label }]} />;

type Opts = { rich?: boolean; multiline?: boolean };
/**
 * Chữ sửa được theo không gian khóa của trang (vd. go.hero.title):
 *  - P(…) → thuộc tính vùng chỉnh + nội dung, rải thẳng lên phần tử chỉ chứa chữ đó: <h3 {...P(…)} />
 *  - T(…) → <span> bọc chữ, đặt trong phần tử có thêm biểu tượng / chữ khác
 */
function texts(data: SiteData, ns: string) {
  const P = (k: string, def: string, label: string, opts: Opts = {}) => {
    const x = ct(data, `${ns}.${k}`, def, label, opts);
    return { ...x.a, children: (opts.rich ? rich(x.v) : x.v) as ReactNode };
  };
  const T = (k: string, def: string, label: string, opts: Opts = {}) => <span {...P(k, def, label, opts)} />;
  return { P, T };
}

/* =====================================================================
 * DANAVA GO
 * ===================================================================== */
export function GoPage({ data }: { data: SiteData }) {
  const { P, T } = texts(data, 'go');
  const roles = [
    { icon: UserRound, title: 'Hành khách', text: 'Đặt vé trên danavago.com hoặc app DANAVA GO: tìm chuyến, chọn chỗ, nhận vé điện tử, tra cứu lại bất cứ lúc nào.', host: 'danavago.com · app.danavago.com' },
    { icon: Store, title: 'Nhà xe', text: 'Trang nhà xe và app đặt vé mang tên, logo của chính nhà xe; tuyến, giờ chạy, giá do nhà xe cập nhật.', host: 'tên-nhà-xe.danavago.com' },
    { icon: LayoutDashboard, title: 'Điều phối', text: `DANAVA GO Studio: ${GO.studio.tagline.charAt(0).toLowerCase() + GO.studio.tagline.slice(1)}`, host: 'studio.danavago.com' }
  ];
  const op = GO.operator;
  return (
    <main id="main" className="pgo">
      <section className="pgo-hero" aria-labelledby="pgo-title">
        <div className="s-container">
          {crumbs(data, 'DANAVA GO')}
          <div className="pgo-hero__grid">
            <div className="pgo-hero__copy">
              <p className="pgo-kicker"><Bus aria-hidden="true" /> {T('hero.kicker', 'DANAVA GO · Đặt vé xe khách trực tuyến', 'Dòng chữ nhỏ')}</p>
              <h1 className="pgo-title" id="pgo-title" {...P('hero.title', 'Đi một chuyến.\n*Mở ngàn trải nghiệm.*', 'Tiêu đề chính', { rich: true })} />
              <p className="pgo-lead" {...P('hero.lead', GO.lead, 'Mô tả', { multiline: true })} />
              <div className="pgo-actions">
                <a className="pgo-btn pgo-btn--primary" href={GO.url} {...ext}>{T('hero.book', 'Đặt vé trên DANAVA GO', 'Nút đặt vé')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
                <a className="pgo-btn pgo-btn--ghost" href={GO.appUrl} {...ext}><Smartphone aria-hidden="true" /> {T('hero.app', 'Mở app DANAVA GO', 'Nút mở app')}<span className="s-sr"> (mở tab mới)</span></a>
              </div>
            </div>
            {/* Vé lên xe — tuyến hiển thị mặc định trên danavago.com */}
            <div className="pgo-ticket" aria-label="Ví dụ vé: Đà Nẵng đến Hội An">
              <div className="pgo-ticket__main">
                <p className="pgo-ticket__brand">DANAVA GO <span>Boarding pass</span></p>
                <div className="pgo-ticket__route">
                  <div><small {...P('ticket.from-label', 'Điểm đi', 'Vé: nhãn điểm đi')} /><b {...P('ticket.from', 'Đà Nẵng', 'Vé: điểm đi')} /><span {...P('ticket.from-note', 'Cầu Rồng · Sông Hàn', 'Vé: ghi chú điểm đi')} /></div>
                  <div className="pgo-ticket__path" aria-hidden="true"><i /><Bus /></div>
                  <div className="is-right"><small {...P('ticket.to-label', 'Điểm đến', 'Vé: nhãn điểm đến')} /><b {...P('ticket.to', 'Hội An', 'Vé: điểm đến')} /><span {...P('ticket.to-note', 'Phố cổ · Sông Hoài', 'Vé: ghi chú điểm đến')} /></div>
                </div>
                <ul className="pgo-ticket__perks">{GO.ticketPerks.map((p, i) => <li key={p} {...P(`ticket.perks.${i}`, p, 'Vé: tiện ích')} />)}</ul>
              </div>
              <div className="pgo-ticket__stub" aria-hidden="true">
                <QrCode />
                <span>{GO.vehicles.join(' · ')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pgo-devices" aria-label="Giao diện DANAVA GO">
        <div className="s-container pgo-devices__stage">
          <BrowserFrame src="/assets/products/go-hero.webp" alt="Trang chủ DANAVA GO trên máy tính: tìm chuyến Đà Nẵng – Hội An" url={GO.url} priority />
          <figure className="pgo-phone"><img src="/assets/products/go-mobile.webp" alt="DANAVA GO trên điện thoại" width={390} height={844} loading="lazy" /></figure>
        </div>
      </section>

      {/* Một nền tảng, ba góc nhìn */}
      <section className="pgo-sec pgo-roles" aria-labelledby="pgo-roles-title">
        <div className="s-container">
          <p className="pgo-eyebrow" {...P('roles.eyebrow', 'Hệ thống DANAVA GO', 'Dòng chữ nhỏ')} />
          <h2 className="pgo-h2" id="pgo-roles-title" {...P('roles.title', 'Một nền tảng, *ba góc nhìn.*', 'Tiêu đề', { rich: true })} />
          <ul className="pgo-roles__grid">
            {roles.map((r, i) => (
              <li key={i}><span className="pgo-roles__no">{String(i + 1).padStart(2, '0')}</span><r.icon aria-hidden="true" /><h3 {...P(`roles.${i}.title`, r.title, 'Tên vai trò')} /><p {...P(`roles.${i}.text`, r.text, 'Mô tả vai trò', { multiline: true })} /><span className="pgo-roles__host" {...P(`roles.${i}.host`, r.host, 'Địa chỉ truy cập')} /></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bên trong DANAVA GO: màn hình thật theo vai trò */}
      <section className="pgo-sec pgo-tour" aria-labelledby="pgo-tour-title">
        <div className="s-container">
          <p className="pgo-eyebrow" {...P('tour.eyebrow', 'Bên trong DANAVA GO', 'Dòng chữ nhỏ')} />
          <h2 className="pgo-h2" id="pgo-tour-title" {...P('tour.title', 'Từng màn hình, *đúng như đang chạy.*', 'Tiêu đề', { rich: true })} />
          <p className="pgo-sub" {...P('tour.lead', 'Chọn vai trò, bấm từng bước để xem giao diện thật của app và trang quản trị.', 'Mô tả', { multiline: true })} />
          <StudioTour roles={GO.tour} ns="go" />
        </div>
      </section>

      {/* App riêng cho từng nhà xe — ví dụ thật */}
      <section className="pgo-sec pgo-brand" aria-labelledby="pgo-brand-title">
        <div className="s-container pgo-brand__grid">
          <figure className="pgo-brand__phone"><img src="/assets/products/go/app-trips.webp" alt={`App đặt vé riêng của ${op.name}: chuyến ${op.trip.from} → ${op.trip.to}`} width={390} height={812} loading="lazy" /></figure>
          <div>
            <p className="pgo-eyebrow" {...P('brand.eyebrow', 'Mỗi nhà xe một thương hiệu', 'Dòng chữ nhỏ')} />
            <h2 className="pgo-h2" id="pgo-brand-title" {...P('brand.title', 'App đặt vé *mang tên nhà xe.*', 'Tiêu đề', { rich: true })} />
            <p className="pgo-lead">{T('brand.lead', 'Nhà xe có app đặt vé riêng trên tên miền của mình, với logo và màu sắc riêng, cùng trang giới thiệu trên danavago.com. Ví dụ thật:', 'Mô tả', { multiline: true })} <b>{op.name}</b> · {T('brand.kinds', op.kinds, 'Loại xe của nhà xe')} · {T('brand.places', op.places, 'Nơi nhà xe chạy')}.</p>
            <dl className="pgo-brand__stats">{op.stats.map(([k, v], i) => <div key={k}><dt {...P(`brand.stats.${i}`, k, 'Tên số liệu')} /><dd>{v}</dd></div>)}</dl>
            <div className="pgo-stub" aria-label="Một chuyến thật trên app nhà xe">
              <div><small {...P('brand.trip.kind', op.trip.kind, 'Chuyến mẫu: loại xe')} /><b>{op.trip.depart}</b><span {...P('brand.trip.from', op.trip.from, 'Chuyến mẫu: điểm đi')} /></div>
              <div className="pgo-stub__line" aria-hidden="true"><i /><span>{op.trip.duration}</span></div>
              <div className="is-right">{op.trip.plusDay ? <small {...P('brand.trip.plus-day', '+1 ngày', 'Chuyến mẫu: đến ngày hôm sau')} /> : <small />}<b>{op.trip.arrive}</b><span {...P('brand.trip.to', op.trip.to, 'Chuyến mẫu: điểm đến')} /></div>
              <p className="pgo-stub__price">{op.trip.price}<small {...P('brand.trip.per', '/ người', 'Chuyến mẫu: đơn vị giá')} /></p>
            </div>
            <div className="pgo-actions">
              <a className="pgo-btn pgo-btn--primary" href={op.app} {...ext}>{T('brand.app-button', `Xem app ${op.name}`, 'Nút xem app nhà xe')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
              <a className="pgo-btn pgo-btn--ghost" href={op.page} {...ext}>{T('brand.page-button', 'Trang nhà xe', 'Nút trang nhà xe')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
            </div>
            <p className="pgo-brand__note"><BadgeCheck aria-hidden="true" /><span>{T('brand.status', GO.status, 'Ghi chú tình trạng', { multiline: true })} {T('brand.checked', 'Số liệu theo trang nhà xe ngày', 'Chữ trước ngày kiểm tra')} {PRODUCTS_CHECKED}.</span></p>
          </div>
        </div>
      </section>

      {/* DANAVA GO Studio — trang quản trị */}
      <section className="pgo-studio" aria-labelledby="pgo-studio-title">
        <div className="s-container">
          <div className="pgo-studio__head">
            <p className="pgo-eyebrow pgo-eyebrow--light" {...P('studio.eyebrow', 'DANAVA GO Studio · Quản trị nhà xe', 'Dòng chữ nhỏ')} />
            <h2 className="pgo-h2 pgo-h2--light" id="pgo-studio-title" {...P('studio.title', 'Điều phối mọi chuyến xe *từ một bảng điều khiển.*', 'Tiêu đề', { rich: true })} />
            <p className="pgo-studio__lead" {...P('studio.lead', GO.studio.tagline, 'Mô tả', { multiline: true })} />
          </div>
          <ol className="pgo-studio__route">
            {GO.studio.modules.map((m, i) => {
              const Icon = [Bus, CalendarDays, Ticket, Wallet][i % 4];
              return <li key={m}><span className="pgo-studio__stop"><Icon aria-hidden="true" /></span><b>{T(`studio.modules.${i}`, m, 'Tên phân hệ')}</b></li>;
            })}
          </ol>
          <div className="pgo-studio__grid">
            <BrowserFrame src="/assets/products/go/studio-overview.webp" alt="Bảng Tổng quan của DANAVA GO Studio: doanh thu, vé, chuyến hôm nay, tỉ lệ lấp đầy ghế và đội xe" url={GO.studioUrl} />
            <div className="pgo-studio__side">
              <h3><Gauge aria-hidden="true" />{T('studio.side.title', 'Ai dùng Studio?', 'Tiêu đề khung')}</h3>
              <p {...P('studio.side.text', 'Nhà xe đăng nhập bằng số điện thoại hoặc email. Trên app DANAVA GO, nhân viên nhà xe cũng có lối đăng nhập riêng:', 'Nội dung khung', { multiline: true })} />
              <ul>{GO.studio.staff.map((x, i) => <li key={x} {...P(`studio.staff.${i}`, x, 'Vai trò nhân viên')} />)}</ul>
              <a className="pgo-btn pgo-btn--primary" href={GO.studioUrl} {...ext}>{T('studio.button', 'Mở DANAVA GO Studio', 'Nút mở Studio')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
              <small {...P('studio.side.note', 'Đăng nhập bằng tài khoản nhà xe do DANAVA cấp. Ảnh chụp bản demo, dữ liệu mẫu.', 'Ghi chú khung')} />
            </div>
          </div>
        </div>
      </section>

      <section className="pgo-sec pgo-seat" aria-labelledby="pgo-seat-title">
        <div className="s-container">
          <div className="pgo-fleet__head">
            <p className="pgo-eyebrow" {...P('seat.eyebrow', 'Chọn cách bạn tận hưởng', 'Dòng chữ nhỏ')} />
            <h2 className="pgo-h2" id="pgo-seat-title" {...P('seat.title', 'Chuyến đi đẹp, *bắt đầu từ chỗ ngồi.*', 'Tiêu đề', { rich: true })} />
          </div>
          <GoFleet fleet={GO.fleet} note={GO.fleetNote} />
        </div>
      </section>

      <section className="pgo-sec pgo-routes" aria-labelledby="pgo-routes-title">
        <div className="s-container">
          <p className="pgo-eyebrow" {...P('routes.eyebrow', 'Những miền đất đang chờ', 'Dòng chữ nhỏ')} />
          <h2 className="pgo-h2" id="pgo-routes-title" {...P('routes.title', 'Mỗi cung đường, *một câu chuyện mới.*', 'Tiêu đề', { rich: true })} />
          <ul className="pgo-cards">
            {GO.routes.map((r, i) => (
              <li key={r.to} className={`pgo-card${i === 0 ? ' is-big' : ''}`}>
                {/* Ảnh chụp thẻ tuyến trên danavago.com (đã có sẵn tên tuyến) — bấm để mở DANAVA GO */}
                <a href={GO.url} {...ext} aria-label={`${r.kicker}: ${r.from} đến ${r.to} — tìm chuyến trên DANAVA GO (mở tab mới)`}>
                  <img src={r.image} alt="" width={687} height={490} loading="lazy" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pgo-sec pgo-steps" aria-labelledby="pgo-steps-title">
        <div className="s-container">
          <p className="pgo-eyebrow" {...P('steps.eyebrow', 'Đơn giản từ lúc bắt đầu', 'Dòng chữ nhỏ')} />
          <h2 className="pgo-h2" id="pgo-steps-title" {...P('steps.title', 'Ba bước. *Một hành trình.*', 'Tiêu đề', { rich: true })} />
          <ol className="pgo-road">
            {GO.steps.map((st, i) => (
              <li key={st.title}><span className="pgo-road__stop">{String(i + 1).padStart(2, '0')}</span><h3 {...P(`steps.${i}.title`, st.title, 'Tên bước')} /><p {...P(`steps.${i}.text`, st.text, 'Mô tả bước', { multiline: true })} /></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pgo-sec pgo-feat" aria-labelledby="pgo-feat-title">
        <div className="s-container">
          <p className="pgo-eyebrow" {...P('feat.eyebrow', 'An tâm chọn chuyến', 'Dòng chữ nhỏ')} />
          <h2 className="pgo-h2" id="pgo-feat-title" {...P('feat.title', 'Để bạn chỉ cần *mong đến ngày đi.*', 'Tiêu đề', { rich: true })} />
          <ul className="pgo-feat__grid">
            {GO.features.map((f, i) => {
              const Icon = [Armchair, MapPin, Ticket, Route][i % 4];
              return <li key={f.title}><Icon aria-hidden="true" /><h3 {...P(`feat.${i}.title`, f.title, 'Tên tính năng')} /><p {...P(`feat.${i}.text`, f.text, 'Mô tả tính năng', { multiline: true })} /></li>;
            })}
          </ul>
        </div>
      </section>

      <section className="pgo-final" aria-labelledby="pgo-final-title">
        <div className="s-container">
          <h2 className="pgo-final__title" id="pgo-final-title" {...P('final.title', 'Chuyến đi tiếp theo *bắt đầu từ đâu?*', 'Tiêu đề', { rich: true })} />
          <a className="pgo-btn pgo-btn--primary pgo-btn--lg" href={GO.url} {...ext}>{T('final.button', 'Tìm chuyến trên DANAVA GO', 'Nút tìm chuyến')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
        </div>
      </section>
    </main>
  );
}

/* =====================================================================
 * Hello DANAVA
 * ===================================================================== */
export function HelloPage({ data }: { data: SiteData }) {
  const { P, T } = texts(data, 'hello');
  /** Trường của bảng giá (Quản trị → Bảng giá & báo giá) — dùng chung với ANNA / Báo giá nhanh */
  const B = (path: string, label: string, value: ReactNode, opts: Opts = {}) => ({ ...cmsText(`block.pricing.${path}`, label, { scope: 'global', ...opts }), children: value });
  const pricing = block(data, 'pricing');
  // Bảng so sánh chỉ có dữ liệu cho các gói gốc; gói thêm mới trong CMS không được suy đoán tính năng
  const compared = pricing.plans.filter(p => HELLO.planIds.includes(p.id));
  const modules = HELLO.modules.map(m => ({ ...m, v: compared.map(p => m.v[HELLO.planIds.indexOf(p.id)]) }));
  return (
    <main id="main" className="phl">
      <section className="phl-hero" aria-labelledby="phl-title">
        <div className="s-container">
          {crumbs(data, 'Hello DANAVA')}
          <div className="phl-hero__grid">
            <div>
              <p className="phl-kicker" {...P('hero.kicker', 'Hello DANAVA · Bảng giá DANAVA Studio', 'Dòng chữ nhỏ')} />
              <h1 className="phl-title" id="phl-title" {...P('hero.title', 'Chọn gói phù hợp *với phòng tập của bạn.*', 'Tiêu đề chính', { rich: true })} />
              <p className="phl-lead" {...P('hero.lead', 'So sánh tính năng, chọn thời hạn và nhận báo giá theo nhu cầu vận hành, ngay trên một trang.', 'Mô tả', { multiline: true })} />
              <ul className="phl-models" aria-label="Mô hình phù hợp">{HELLO.models.map((m, i) => <li key={m} {...P(`hero.models.${i}`, m, 'Mô hình phù hợp')} />)}</ul>
              <div className="phl-actions">
                <a className="phl-btn phl-btn--primary" href={HELLO.url} {...ext}>{T('hero.open', 'Mở Hello DANAVA', 'Nút mở Hello DANAVA')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
                <a className="phl-btn phl-btn--line" href={HELLO.registerUrl} {...ext}>{T('hero.register', 'Đăng ký trải nghiệm Studio', 'Nút đăng ký')}<span className="s-sr"> (mở tab mới)</span></a>
              </div>
            </div>
            <div className="phl-stack" aria-hidden="false">
              <figure className="phl-stack__a"><img src="/assets/products/hello-hero.webp" alt="Trang đầu Hello DANAVA: chọn mô hình phòng tập" width={1280} height={800} /></figure>
              <figure className="phl-stack__b"><img src="/assets/products/hello-pricing.webp" alt="Bảng giá 4 gói DANAVA Studio trên Hello DANAVA" width={1240} height={590} loading="lazy" /></figure>
            </div>
          </div>
        </div>
      </section>

      <section className="phl-sec" aria-labelledby="phl-plans-title">
        <div className="s-container">
          <p className="phl-eyebrow" {...P('plans.eyebrow', 'Bảng giá', 'Dòng chữ nhỏ')} />
          {pricing.plans.length === 4
            ? <h2 className="phl-h2" id="phl-plans-title" {...P('plans.title-four', 'Bốn gói, *một phần mềm.*', 'Tiêu đề (khi có 4 gói)', { rich: true })} />
            : <h2 className="phl-h2" id="phl-plans-title" {...P('plans.title', 'Các gói, *một phần mềm.*', 'Tiêu đề', { rich: true })} />}
          <ul className="phl-plans">
            {pricing.plans.map((p, pi) => (
              <li key={p.id} className={`phl-plan${p.highlight ? ' is-hl' : ''}`}>
                {p.highlight && <span className="phl-plan__flag" {...P('plans.flag', 'Gói nổi bật', 'Nhãn gói nổi bật')} />}
                <h3 {...B(`plans.${pi}.name`, 'Tên gói', p.name)} />
                <p className="phl-plan__desc" {...B(`plans.${pi}.desc`, 'Mô tả gói', p.desc, { multiline: true })} />
                <p className="phl-plan__price">{priceText(p.price)}</p>
                <p className="phl-plan__per">{perMonth(p.price, pricing.termMonths) ? <>/{pricing.termMonths} {T('plans.months', 'tháng', 'Đơn vị kỳ hạn')} · {perMonth(p.price, pricing.termMonths)}</> : <>&nbsp;</>}</p>
                <dl className="phl-plan__lim">
                  <div><dt {...P('plans.members', 'Hội viên', 'Nhãn số hội viên')} /><dd {...B(`plans.${pi}.members`, 'Số hội viên', p.members)} /></div>
                  <div><dt {...P('plans.staff', 'Nhân sự', 'Nhãn số nhân sự')} /><dd {...B(`plans.${pi}.staff`, 'Số nhân sự', p.staff)} /></div>
                  <div><dt {...P('plans.branches', 'Chi nhánh', 'Nhãn số chi nhánh')} /><dd {...B(`plans.${pi}.branches`, 'Số chi nhánh', p.branches)} /></div>
                </dl>
                <ul>{p.perks.map((x, xi) => <li key={x}><Check aria-hidden="true" /><span {...B(`plans.${pi}.perks.${xi}`, 'Tính năng nổi bật của gói', x)} /></li>)}</ul>
              </li>
            ))}
          </ul>
          <p className="phl-note"><span {...B('note', 'Ghi chú bảng giá', pricing.note, { multiline: true })} /> {T('plans.checked', 'Giá theo Hello DANAVA ngày', 'Chữ trước ngày cập nhật giá')} {pricing.checked}.</p>
        </div>
      </section>

      <section className="phl-sec phl-sec--soft" aria-labelledby="phl-cmp-title">
        <div className="s-container">
          <p className="phl-eyebrow" {...P('cmp.eyebrow', 'Chi tiết', 'Dòng chữ nhỏ')} />
          <h2 className="phl-h2" id="phl-cmp-title" {...P('cmp.title', 'So sánh *từng module.*', 'Tiêu đề', { rich: true })} />
          <HelloCompare plans={compared.map(p => ({ name: p.name, index: pricing.plans.indexOf(p) }))} modules={modules} highlight={compared.findIndex(p => p.highlight)} />
          <ul className="phl-addons">
            {pricing.addons.map((a, ai) => <li key={a.id}><ListChecks aria-hidden="true" /><span><b {...B(`addons.${ai}.name`, 'Tên tùy chọn mua thêm', a.name)} />{priceText(a.price)} / {a.monthly ? T('addons.month', 'tháng', 'Đơn vị theo tháng') : T('addons.once', 'lần', 'Đơn vị theo lần')}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="phl-sec" aria-labelledby="phl-quote-title">
        <div className="s-container phl-quote">
          <div>
            <p className="phl-eyebrow" {...P('quote.eyebrow', 'Tùy chỉnh gói', 'Dòng chữ nhỏ')} />
            <h2 className="phl-h2" id="phl-quote-title" {...P('quote.title', 'Nhận báo giá *trong ba bước.*', 'Tiêu đề', { rich: true })} />
            <ol className="phl-steps">{HELLO.quoteSteps.map((st, i) => <li key={st.title}><span>{i + 1}</span><b {...P(`quote.steps.${i}.title`, st.title, 'Tên bước')} /><p {...P(`quote.steps.${i}.text`, st.text, 'Mô tả bước', { multiline: true })} /></li>)}</ol>
            <a className="phl-btn phl-btn--primary" href={HELLO.url} {...ext}>{T('quote.button', 'Nhận báo giá trên Hello DANAVA', 'Nút nhận báo giá')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
          </div>
          <div className="phl-quote__shots">
            <BrowserFrame src="/assets/products/hello-quote.webp" alt="Form nhận báo giá trên Hello DANAVA: chọn gói, tùy chọn bổ sung, thông tin liên hệ và dự toán" url={HELLO.url} />
          </div>
        </div>
      </section>

      <section className="phl-final" aria-labelledby="phl-final-title">
        <div className="s-container phl-final__box">
          <h2 id="phl-final-title" {...P('final.title', 'Sẵn sàng chọn gói cho phòng tập?', 'Tiêu đề')} />
          <p {...P('final.text', 'Hello DANAVA tổng hợp bảng giá, so sánh tính năng và form nhận báo giá của DANAVA Studio.', 'Mô tả', { multiline: true })} />
          <div className="phl-actions">
            <a className="phl-btn phl-btn--primary" href={HELLO.url} {...ext}>{T('final.open', 'Mở Hello DANAVA', 'Nút mở Hello DANAVA')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
            <Link className="phl-btn phl-btn--line-light" href="/giai-phap/danava-studio/">{T('final.studio', 'Tìm hiểu DANAVA Studio', 'Nút tìm hiểu Studio')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =====================================================================
 * DANAVA Work
 * ===================================================================== */
export function WorkPage({ data }: { data: SiteData }) {
  const { P, T } = texts(data, 'work');
  return (
    <main id="main" className="pwk">
      <section className="pwk-hero" aria-labelledby="pwk-title">
        <div className="s-container">
          {crumbs(data, 'DANAVA Work')}
          <div className="pwk-hero__grid">
            <div>
              <p className="pwk-kicker"><ClipboardList aria-hidden="true" /> {T('hero.kicker', 'DANAVA Work · Bảng công việc', 'Dòng chữ nhỏ')}</p>
              <h1 className="pwk-title" id="pwk-title" {...P('hero.title', 'Quản trị công việc. *Mọi thứ ở một nơi.*', 'Tiêu đề chính', { rich: true })} />
              <p className="pwk-lead">“{T('hero.tagline', WORK.tagline, 'Khẩu hiệu')}” {T('hero.lead', 'Không gian làm việc nơi đội ngũ DANAVA phân bổ và theo dõi công việc của nhóm.', 'Mô tả', { multiline: true })}</p>
              <div className="pwk-actions">
                <a className="pwk-btn pwk-btn--primary" href={WORK.url} {...ext}>{T('hero.open', 'Mở DANAVA Work', 'Nút mở DANAVA Work')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
                <span className="pwk-hint"><KeyRound aria-hidden="true" />{T('hero.access', WORK.access, 'Ghi chú đăng nhập')}</span>
              </div>
            </div>
            <BrowserFrame src="/assets/products/danava-work/kanban-picnic.webp" alt="Bảng Kanban trên DANAVA Work với các cột Ý tưởng, Đang làm, Chờ cả nhà xem, Xong rồi (dữ liệu minh họa)" url={WORK.url} priority className="pwk-shot" />
          </div>
        </div>
      </section>

      <section className="pwk-sec pwk-tour" aria-labelledby="pwk-tour-title">
        <div className="s-container">
          <p className="pwk-eyebrow" {...P('tour.eyebrow', 'Bên trong DANAVA Work', 'Dòng chữ nhỏ')} />
          <h2 className="pwk-h2 pwk-h2--dark" id="pwk-tour-title" {...P('tour.title', 'Phân bổ, theo dõi, *hoàn thành.*', 'Tiêu đề', { rich: true })} />
          <p className="pwk-sub" {...P('tour.lead', 'Bấm từng tab để xem giao diện thật. Ảnh chụp bản chạy thử với dữ liệu minh họa vui: dã ngoại, góc bếp, khu vườn.', 'Mô tả', { multiline: true })} />
          <StudioTour roles={WORK.tour} ns="work" />
        </div>
      </section>

      <section className="pwk-sec" aria-labelledby="pwk-facts-title">
        <div className="s-container">
          <p className="pwk-eyebrow" {...P('facts.eyebrow', 'Có gì trong DANAVA Work', 'Dòng chữ nhỏ')} />
          <h2 className="pwk-h2" id="pwk-facts-title" {...P('facts.title', 'Đủ cho cả nhóm, *gọn cho từng người.*', 'Tiêu đề', { rich: true })} />
          <ul className="pwk-notes">
            {WORK.features.map((f, i) => (
              <li key={f.title} className={`pwk-note pwk-note--${i}`}>
                <span className="pwk-note__pin" aria-hidden="true" />
                <h3 {...P(`facts.${i}.title`, f.title, 'Tên nhóm tính năng')} />
                <ul>{f.items.map((x, j) => <li key={x}><Check aria-hidden="true" /><span {...P(`facts.${i}.items.${j}`, x, 'Tính năng')} /></li>)}</ul>
              </li>
            ))}
          </ul>
          <p className="pwk-status"><CalendarCheck aria-hidden="true" /><span>{T('facts.status', WORK.status, 'Ghi chú tình trạng')} {T('facts.contact', 'Doanh nghiệp muốn dùng công cụ tương tự có thể trao đổi với DANAVA. Kiểm tra ngày', 'Lời mời trao đổi (trước ngày kiểm tra)', { multiline: true })} {PRODUCTS_CHECKED}.</span></p>
        </div>
      </section>

      <section className="pwk-final" aria-labelledby="pwk-final-title">
        <div className="s-container pwk-final__box">
          <h2 id="pwk-final-title" {...P('final.title', 'Vào bảng công việc của nhóm', 'Tiêu đề')} />
          <div className="pwk-actions">
            <a className="pwk-btn pwk-btn--primary" href={WORK.url} {...ext}>{T('final.open', 'Mở DANAVA Work', 'Nút mở DANAVA Work')} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
            <Link className="pwk-btn pwk-btn--ghost" href="/lien-he/?ref=danava-work">{T('final.contact', 'Trao đổi với DANAVA', 'Nút trao đổi')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
