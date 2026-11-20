/**
 * Trang giới thiệu 3 sản phẩm số — mỗi trang một phong cách theo đúng tinh thần sản phẩm:
 *  - DANAVA GO: vé lên xe (boarding pass), tông hoàng hôn kem – cam – xanh navy như danavago.com
 *  - Hello DANAVA: bảng giá tương tác sáng màu, cam – xanh của DANAVA Studio
 *  - DANAVA Work: bảng công việc tối, các thẻ công việc dạng khung (minh họa)
 * Nội dung: lib/products.ts (thông tin công khai trên chính trang sản phẩm). Ảnh: chụp màn hình thật.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, Bus, CalendarCheck, CalendarDays, Gauge, LayoutDashboard, Store, UserRound, Wallet, Check, ClipboardList, KeyRound, MapPin, QrCode, Smartphone, Ticket, Users, Armchair, Eye, ListChecks, Route } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { GO, HELLO, WORK, PRODUCTS_CHECKED } from '@/lib/products';
import { Crumbs } from './ui';
import { BrowserFrame } from './showcase';
import { HelloCompare } from './HelloCompare';
import { StudioTour } from './StudioTour';
import { GoFleet } from './GoFleet';

const ext = { target: '_blank', rel: 'noopener' } as const;
const crumbs = (label: string) => <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label }]} />;

/* =====================================================================
 * DANAVA GO
 * ===================================================================== */
export function GoPage(_: { data: SiteData }) {
  return (
    <main id="main" className="pgo">
      <section className="pgo-hero" aria-labelledby="pgo-title">
        <div className="s-container">
          {crumbs('DANAVA GO')}
          <div className="pgo-hero__grid">
            <div className="pgo-hero__copy">
              <p className="pgo-kicker"><Bus aria-hidden="true" /> DANAVA GO · Đặt vé xe khách trực tuyến</p>
              <h1 className="pgo-title" id="pgo-title">Đi một chuyến.<br /><em>Mở ngàn trải nghiệm.</em></h1>
              <p className="pgo-lead">{GO.lead}</p>
              <div className="pgo-actions">
                <a className="pgo-btn pgo-btn--primary" href={GO.url} {...ext}>Đặt vé trên DANAVA GO <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
                <a className="pgo-btn pgo-btn--ghost" href={GO.appUrl} {...ext}><Smartphone aria-hidden="true" /> Mở app DANAVA GO<span className="s-sr"> (mở tab mới)</span></a>
              </div>
            </div>
            {/* Vé lên xe — tuyến hiển thị mặc định trên danavago.com */}
            <div className="pgo-ticket" aria-label="Ví dụ vé: Đà Nẵng đến Hội An">
              <div className="pgo-ticket__main">
                <p className="pgo-ticket__brand">DANAVA GO <span>Boarding pass</span></p>
                <div className="pgo-ticket__route">
                  <div><small>Điểm đi</small><b>Đà Nẵng</b><span>Cầu Rồng · Sông Hàn</span></div>
                  <div className="pgo-ticket__path" aria-hidden="true"><i /><Bus /></div>
                  <div className="is-right"><small>Điểm đến</small><b>Hội An</b><span>Phố cổ · Sông Hoài</span></div>
                </div>
                <ul className="pgo-ticket__perks">{GO.ticketPerks.map(p => <li key={p}>{p}</li>)}</ul>
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
          <p className="pgo-eyebrow">Hệ thống DANAVA GO</p>
          <h2 className="pgo-h2" id="pgo-roles-title">Một nền tảng, <em>ba góc nhìn.</em></h2>
          <ul className="pgo-roles__grid">
            <li><span className="pgo-roles__no">01</span><UserRound aria-hidden="true" /><h3>Hành khách</h3><p>Đặt vé trên danavago.com hoặc app DANAVA GO: tìm chuyến, chọn chỗ, nhận vé điện tử, tra cứu lại bất cứ lúc nào.</p><span className="pgo-roles__host">danavago.com · app.danavago.com</span></li>
            <li><span className="pgo-roles__no">02</span><Store aria-hidden="true" /><h3>Nhà xe</h3><p>Trang nhà xe và app đặt vé mang tên, logo của chính nhà xe; tuyến, giờ chạy, giá do nhà xe cập nhật.</p><span className="pgo-roles__host">tên-nhà-xe.danavago.com</span></li>
            <li><span className="pgo-roles__no">03</span><LayoutDashboard aria-hidden="true" /><h3>Điều phối</h3><p>DANAVA GO Studio: {GO.studio.tagline.charAt(0).toLowerCase() + GO.studio.tagline.slice(1)}</p><span className="pgo-roles__host">studio.danavago.com</span></li>
          </ul>
        </div>
      </section>

      {/* Bên trong DANAVA GO: màn hình thật theo vai trò */}
      <section className="pgo-sec pgo-tour" aria-labelledby="pgo-tour-title">
        <div className="s-container">
          <p className="pgo-eyebrow">Bên trong DANAVA GO</p>
          <h2 className="pgo-h2" id="pgo-tour-title">Từng màn hình, <em>đúng như đang chạy.</em></h2>
          <p className="pgo-sub">Chọn vai trò, bấm từng bước để xem giao diện thật của app và trang quản trị.</p>
          <StudioTour roles={GO.tour} />
        </div>
      </section>

      {/* App riêng cho từng nhà xe — ví dụ thật */}
      <section className="pgo-sec pgo-brand" aria-labelledby="pgo-brand-title">
        <div className="s-container pgo-brand__grid">
          <figure className="pgo-brand__phone"><img src="/assets/products/go/app-trips.webp" alt={`App đặt vé riêng của ${GO.operator.name}: chuyến ${GO.operator.trip.from} → ${GO.operator.trip.to}`} width={390} height={812} loading="lazy" /></figure>
          <div>
            <p className="pgo-eyebrow">Mỗi nhà xe một thương hiệu</p>
            <h2 className="pgo-h2" id="pgo-brand-title">App đặt vé <em>mang tên nhà xe.</em></h2>
            <p className="pgo-lead">Nhà xe có app đặt vé riêng trên tên miền của mình, với logo và màu sắc riêng, cùng trang giới thiệu trên danavago.com. Ví dụ thật: <b>{GO.operator.name}</b> · {GO.operator.kinds} · {GO.operator.places}.</p>
            <dl className="pgo-brand__stats">{GO.operator.stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <div className="pgo-stub" aria-label="Một chuyến thật trên app nhà xe">
              <div><small>{GO.operator.trip.kind}</small><b>{GO.operator.trip.depart}</b><span>{GO.operator.trip.from}</span></div>
              <div className="pgo-stub__line" aria-hidden="true"><i /><span>{GO.operator.trip.duration}</span></div>
              <div className="is-right"><small>{GO.operator.trip.plusDay ? '+1 ngày' : ''}</small><b>{GO.operator.trip.arrive}</b><span>{GO.operator.trip.to}</span></div>
              <p className="pgo-stub__price">{GO.operator.trip.price}<small>/ người</small></p>
            </div>
            <div className="pgo-actions">
              <a className="pgo-btn pgo-btn--primary" href={GO.operator.app} {...ext}>Xem app {GO.operator.name} <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
              <a className="pgo-btn pgo-btn--ghost" href={GO.operator.page} {...ext}>Trang nhà xe <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
            </div>
            <p className="pgo-brand__note"><BadgeCheck aria-hidden="true" />{GO.status} Số liệu theo trang nhà xe ngày {PRODUCTS_CHECKED}.</p>
          </div>
        </div>
      </section>

      {/* DANAVA GO Studio — trang quản trị */}
      <section className="pgo-studio" aria-labelledby="pgo-studio-title">
        <div className="s-container">
          <div className="pgo-studio__head">
            <p className="pgo-eyebrow pgo-eyebrow--light">DANAVA GO Studio · Quản trị nhà xe</p>
            <h2 className="pgo-h2 pgo-h2--light" id="pgo-studio-title">Điều phối mọi chuyến xe <em>từ một bảng điều khiển.</em></h2>
            <p className="pgo-studio__lead">{GO.studio.tagline}</p>
          </div>
          <ol className="pgo-studio__route">
            {GO.studio.modules.map((m, i) => {
              const Icon = [Bus, CalendarDays, Ticket, Wallet][i % 4];
              return <li key={m}><span className="pgo-studio__stop"><Icon aria-hidden="true" /></span><b>{m}</b></li>;
            })}
          </ol>
          <div className="pgo-studio__grid">
            <BrowserFrame src="/assets/products/go/studio-overview.webp" alt="Bảng Tổng quan của DANAVA GO Studio: doanh thu, vé, chuyến hôm nay, tỉ lệ lấp đầy ghế và đội xe" url={GO.studioUrl} />
            <div className="pgo-studio__side">
              <h3><Gauge aria-hidden="true" />Ai dùng Studio?</h3>
              <p>Nhà xe đăng nhập bằng số điện thoại hoặc email. Trên app DANAVA GO, nhân viên nhà xe cũng có lối đăng nhập riêng:</p>
              <ul>{GO.studio.staff.map(x => <li key={x}>{x}</li>)}</ul>
              <a className="pgo-btn pgo-btn--primary" href={GO.studioUrl} {...ext}>Mở DANAVA GO Studio <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
              <small>Đăng nhập bằng tài khoản nhà xe do DANAVA cấp. Ảnh chụp bản demo, dữ liệu mẫu.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="pgo-sec pgo-seat" aria-labelledby="pgo-seat-title">
        <div className="s-container">
          <div className="pgo-fleet__head">
            <p className="pgo-eyebrow">Chọn cách bạn tận hưởng</p>
            <h2 className="pgo-h2" id="pgo-seat-title">Chuyến đi đẹp, <em>bắt đầu từ chỗ ngồi.</em></h2>
          </div>
          <GoFleet fleet={GO.fleet} note={GO.fleetNote} />
        </div>
      </section>

      <section className="pgo-sec pgo-routes" aria-labelledby="pgo-routes-title">
        <div className="s-container">
          <p className="pgo-eyebrow">Những miền đất đang chờ</p>
          <h2 className="pgo-h2" id="pgo-routes-title">Mỗi cung đường, <em>một câu chuyện mới.</em></h2>
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
          <p className="pgo-eyebrow">Đơn giản từ lúc bắt đầu</p>
          <h2 className="pgo-h2" id="pgo-steps-title">Ba bước. <em>Một hành trình.</em></h2>
          <ol className="pgo-road">
            {GO.steps.map((st, i) => (
              <li key={st.title}><span className="pgo-road__stop">{String(i + 1).padStart(2, '0')}</span><h3>{st.title}</h3><p>{st.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pgo-sec pgo-feat" aria-labelledby="pgo-feat-title">
        <div className="s-container">
          <p className="pgo-eyebrow">An tâm chọn chuyến</p>
          <h2 className="pgo-h2" id="pgo-feat-title">Để bạn chỉ cần <em>mong đến ngày đi.</em></h2>
          <ul className="pgo-feat__grid">
            {GO.features.map((f, i) => {
              const Icon = [Armchair, MapPin, Ticket, Route][i % 4];
              return <li key={f.title}><Icon aria-hidden="true" /><h3>{f.title}</h3><p>{f.text}</p></li>;
            })}
          </ul>
        </div>
      </section>

      <section className="pgo-final" aria-labelledby="pgo-final-title">
        <div className="s-container">
          <h2 className="pgo-final__title" id="pgo-final-title">Chuyến đi tiếp theo <em>bắt đầu từ đâu?</em></h2>
          <a className="pgo-btn pgo-btn--primary pgo-btn--lg" href={GO.url} {...ext}>Tìm chuyến trên DANAVA GO <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
        </div>
      </section>
    </main>
  );
}

/* =====================================================================
 * Hello DANAVA
 * ===================================================================== */
export function HelloPage(_: { data: SiteData }) {
  return (
    <main id="main" className="phl">
      <section className="phl-hero" aria-labelledby="phl-title">
        <div className="s-container">
          {crumbs('Hello DANAVA')}
          <div className="phl-hero__grid">
            <div>
              <p className="phl-kicker">Hello DANAVA · Bảng giá DANAVA Studio</p>
              <h1 className="phl-title" id="phl-title">Chọn gói phù hợp <em>với phòng tập của bạn.</em></h1>
              <p className="phl-lead">So sánh tính năng, chọn thời hạn và nhận báo giá theo nhu cầu vận hành, ngay trên một trang.</p>
              <ul className="phl-models" aria-label="Mô hình phù hợp">{HELLO.models.map(m => <li key={m}>{m}</li>)}</ul>
              <div className="phl-actions">
                <a className="phl-btn phl-btn--primary" href={HELLO.url} {...ext}>Mở Hello DANAVA <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
                <a className="phl-btn phl-btn--line" href={HELLO.registerUrl} {...ext}>Đăng ký trải nghiệm Studio<span className="s-sr"> (mở tab mới)</span></a>
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
          <p className="phl-eyebrow">Bảng giá</p>
          <h2 className="phl-h2" id="phl-plans-title">Bốn gói, <em>một phần mềm.</em></h2>
          <ul className="phl-plans">
            {HELLO.plans.map(p => (
              <li key={p.name} className={`phl-plan${p.highlight ? ' is-hl' : ''}`}>
                {p.highlight && <span className="phl-plan__flag">Gói nổi bật</span>}
                <h3>{p.name}</h3>
                <p className="phl-plan__desc">{p.desc}</p>
                <p className="phl-plan__price">{p.price}</p>
                <p className="phl-plan__per">{p.perMonth ? <>/12 tháng · {p.perMonth}</> : <>&nbsp;</>}</p>
                <dl className="phl-plan__lim">
                  <div><dt>Hội viên</dt><dd>{p.members}</dd></div>
                  <div><dt>Nhân sự</dt><dd>{p.staff}</dd></div>
                  <div><dt>Chi nhánh</dt><dd>{p.branches}</dd></div>
                </dl>
                <ul>{p.perks.map(x => <li key={x}><Check aria-hidden="true" />{x}</li>)}</ul>
              </li>
            ))}
          </ul>
          <p className="phl-note">{HELLO.termNote} Giá theo Hello DANAVA ngày {PRODUCTS_CHECKED}.</p>
        </div>
      </section>

      <section className="phl-sec phl-sec--soft" aria-labelledby="phl-cmp-title">
        <div className="s-container">
          <p className="phl-eyebrow">Chi tiết</p>
          <h2 className="phl-h2" id="phl-cmp-title">So sánh <em>từng module.</em></h2>
          <HelloCompare plans={HELLO.plans.map(p => p.name)} modules={HELLO.modules} />
          <ul className="phl-addons">
            {HELLO.addons.map(a => <li key={a.name}><ListChecks aria-hidden="true" /><span><b>{a.name}</b>{a.price}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="phl-sec" aria-labelledby="phl-quote-title">
        <div className="s-container phl-quote">
          <div>
            <p className="phl-eyebrow">Tùy chỉnh gói</p>
            <h2 className="phl-h2" id="phl-quote-title">Nhận báo giá <em>trong ba bước.</em></h2>
            <ol className="phl-steps">{HELLO.quoteSteps.map((st, i) => <li key={st.title}><span>{i + 1}</span><b>{st.title}</b><p>{st.text}</p></li>)}</ol>
            <a className="phl-btn phl-btn--primary" href={HELLO.url} {...ext}>Nhận báo giá trên Hello DANAVA <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
          </div>
          <div className="phl-quote__shots">
            <BrowserFrame src="/assets/products/hello-quote.webp" alt="Form nhận báo giá trên Hello DANAVA: chọn gói, tùy chọn bổ sung, thông tin liên hệ và dự toán" url={HELLO.url} />
          </div>
        </div>
      </section>

      <section className="phl-final" aria-labelledby="phl-final-title">
        <div className="s-container phl-final__box">
          <h2 id="phl-final-title">Sẵn sàng chọn gói cho phòng tập?</h2>
          <p>Hello DANAVA tổng hợp bảng giá, so sánh tính năng và form nhận báo giá của DANAVA Studio.</p>
          <div className="phl-actions">
            <a className="phl-btn phl-btn--primary" href={HELLO.url} {...ext}>Mở Hello DANAVA <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
            <Link className="phl-btn phl-btn--line-light" href="/giai-phap/danava-studio/">Tìm hiểu DANAVA Studio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =====================================================================
 * DANAVA Work
 * ===================================================================== */
export function WorkPage(_: { data: SiteData }) {
  return (
    <main id="main" className="pwk">
      <section className="pwk-hero" aria-labelledby="pwk-title">
        <div className="s-container">
          {crumbs('DANAVA Work')}
          <div className="pwk-hero__grid">
            <div>
              <p className="pwk-kicker"><ClipboardList aria-hidden="true" /> DANAVA Work · Bảng công việc</p>
              <h1 className="pwk-title" id="pwk-title">Quản trị công việc. <em>Mọi thứ ở một nơi.</em></h1>
              <p className="pwk-lead">“{WORK.tagline}” Không gian làm việc nơi đội ngũ DANAVA phân bổ và theo dõi công việc của nhóm.</p>
              <div className="pwk-actions">
                <a className="pwk-btn pwk-btn--primary" href={WORK.url} {...ext}>Mở DANAVA Work <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
                <span className="pwk-hint"><KeyRound aria-hidden="true" />{WORK.access}</span>
              </div>
            </div>
            <BrowserFrame src="/assets/products/danava-work/kanban-picnic.webp" alt="Bảng Kanban trên DANAVA Work với các cột Ý tưởng, Đang làm, Chờ cả nhà xem, Xong rồi (dữ liệu minh họa)" url={WORK.url} priority className="pwk-shot" />
          </div>
        </div>
      </section>

      <section className="pwk-sec pwk-tour" aria-labelledby="pwk-tour-title">
        <div className="s-container">
          <p className="pwk-eyebrow">Bên trong DANAVA Work</p>
          <h2 className="pwk-h2 pwk-h2--dark" id="pwk-tour-title">Phân bổ, theo dõi, <em>hoàn thành.</em></h2>
          <p className="pwk-sub">Bấm từng tab để xem giao diện thật. Ảnh chụp bản chạy thử với dữ liệu minh họa vui: dã ngoại, góc bếp, khu vườn.</p>
          <StudioTour roles={WORK.tour} />
        </div>
      </section>

      <section className="pwk-sec" aria-labelledby="pwk-facts-title">
        <div className="s-container">
          <p className="pwk-eyebrow">Có gì trong DANAVA Work</p>
          <h2 className="pwk-h2" id="pwk-facts-title">Đủ cho cả nhóm, <em>gọn cho từng người.</em></h2>
          <ul className="pwk-notes">
            {WORK.features.map((f, i) => (
              <li key={f.title} className={`pwk-note pwk-note--${i}`}>
                <span className="pwk-note__pin" aria-hidden="true" />
                <h3>{f.title}</h3>
                <ul>{f.items.map(x => <li key={x}><Check aria-hidden="true" />{x}</li>)}</ul>
              </li>
            ))}
          </ul>
          <p className="pwk-status"><CalendarCheck aria-hidden="true" />{WORK.status} Doanh nghiệp muốn dùng công cụ tương tự có thể trao đổi với DANAVA. Kiểm tra ngày {PRODUCTS_CHECKED}.</p>
        </div>
      </section>

      <section className="pwk-final" aria-labelledby="pwk-final-title">
        <div className="s-container pwk-final__box">
          <h2 id="pwk-final-title">Vào bảng công việc của nhóm</h2>
          <div className="pwk-actions">
            <a className="pwk-btn pwk-btn--primary" href={WORK.url} {...ext}>Mở DANAVA Work <ArrowUpRight aria-hidden="true" /><span className="s-sr"> (mở tab mới)</span></a>
            <Link className="pwk-btn pwk-btn--ghost" href="/lien-he/?ref=danava-work">Trao đổi với DANAVA</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
