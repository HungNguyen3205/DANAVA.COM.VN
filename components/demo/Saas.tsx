/**
 * Mẫu "phần mềm SaaS" — sản phẩm thật DANAVA Studio (ảnh giao diện public/assets/studio).
 * Bảng giá đọc từ Quản trị → Bảng giá & báo giá (block pricing, cùng nguồn trang Hello DANAVA) — sửa giá ở đó là demo đổi theo.
 * Mọi chữ khác: txt.demo.sa.* (sửa + dịch). Phong cách lưới chàm (app/demo/saas.css).
 */
import { HELLO } from '@/lib/products';
import { block } from '@/lib/blocks';
import { getSiteContent } from '@/lib/database';
import { perMonth, priceText } from '@/lib/quote';
import { cmsText } from '../site/cms';
import { DemoFx, DemoForm } from './fx';
import { demoText } from './text';

const BENTO = [
  { k: 'wide', t: 'Check-in bằng QR & khuôn mặt', d: 'Hội viên quét mã ở quầy hoặc cửa xoay, lễ tân thấy ngay gói còn bao nhiêu buổi.', img: '/assets/studio/checkin.webp' },
  { k: 'tall', t: 'Ứng dụng cho hội viên', d: 'Gia hạn, đặt lớp, nhận thông báo ngay trên điện thoại.', img: '/assets/studio/app-01-trang-chu.webp' },
  { k: 'sq', t: 'Bán hàng tại quầy', d: 'POS, kho và phiếu nhập trong một màn hình.', img: '/assets/studio/pos.webp' },
  { k: 'sq', t: 'Lịch lớp & PT', d: 'Xếp lịch, giới hạn chỗ, danh sách chờ.', img: '/assets/studio/classes.webp' },
  { k: 'wide', t: 'Báo cáo doanh thu theo thời gian thực', d: 'Doanh thu, gia hạn, hội viên sắp hết hạn: mở máy là thấy.', img: '/assets/studio/reports.webp' }
];
const BEFORE = ['Sổ tay + Excel, cuối tháng mới biết doanh thu', 'Hội viên hết hạn mà không ai nhắc', 'Lễ tân hỏi “anh/chị còn mấy buổi?”', 'Mỗi chi nhánh một file riêng'];
const AFTER = ['Doanh thu cập nhật từng giao dịch', 'Zalo tự nhắc trước 7 ngày', 'Quét QR là biết gói và số buổi còn lại', 'Một bảng điều khiển cho cả chuỗi'];
const FAQ = [
  ['Có cần cài đặt máy chủ không?', 'Không. DANAVA Studio chạy trên trình duyệt và ứng dụng điện thoại, dữ liệu sao lưu hằng ngày.'],
  ['Chuyển dữ liệu từ Excel sang có mất công không?', 'Đội ngũ DANAVA nhập hộ danh sách hội viên và gói tập trong buổi triển khai đầu tiên.'],
  ['Có dùng thử được không?', 'Gói Khởi đầu miễn phí cho phòng tập dưới 50 hội viên, nâng cấp bất cứ lúc nào.']
];
const STATS = [['5', 'mô hình: Gym, Yoga, Pilates, bể bơi, Spa'], ['40', 'module nghiệp vụ'], ['15', 'phút để lễ tân dùng thạo'], ['24', 'giờ hỗ trợ qua Zalo']];

export async function SaasDemo() {
  const { data } = await getSiteContent();
  const pricing = block(data, 'pricing');
  const { t, s, n } = demoText('sa', 'DANAVA Studio');
  /** Trường bảng giá (sửa tại chỗ = sửa bảng giá chung) */
  const B = (path: string, label: string, value: string, multiline = false) => <span {...cmsText(`block.pricing.${path}`, label, { scope: 'global', multiline })}>{value}</span>;
  const logo = <><span className="sa-logo__mark" aria-hidden="true" />{t('logo', 'DANAVA Studio')}</>;
  return (
    <main className="sa">
      <DemoFx />
      <header className="sa-nav">
        <a className="sa-logo" href="#top">{logo}</a>
        <nav aria-label={s('nav.aria', 'Mục lục')}><a href="#tinh-nang">{t('nav.0', 'Tính năng')}</a><a href="#truoc-sau">{t('nav.1', 'Trước & sau')}</a><a href="#bang-gia">{t('nav.2', 'Bảng giá')}</a><a href="#hoi-dap">{t('nav.3', 'Hỏi đáp')}</a></nav>
        <a className="sa-btn sa-btn--sm" href="#dung-thu">{t('nav.cta', 'Dùng thử miễn phí')}</a>
      </header>

      <section className="sa-hero" id="top">
        <div className="sa-hero__text">
          <p className="sa-pill"><b>{t('hero.pill-tag', 'Mới')}</b> {t('hero.pill', 'Check-in khuôn mặt cho mọi gói Pro trở lên →')}</p>
          <h1>{t('hero.title1', 'Vận hành phòng tập')}<br /><span className="sa-grad">{t('hero.title2', 'không cần sổ tay.')}</span></h1>
          <p className="sa-lead">{t('hero.lead', 'Phần mềm quản lý Gym, Yoga, Pilates, bể bơi và Spa: hội viên, gói tập, lịch lớp, bán hàng và báo cáo trong một nơi.', { multiline: true })}</p>
          <div className="sa-row"><a className="sa-btn" href="#dung-thu">{t('hero.cta', 'Bắt đầu miễn phí')}</a><a className="sa-btn sa-btn--ghost" href="#tinh-nang">{t('hero.more', 'Xem tính năng')}</a></div>
        </div>
        <div className="sa-stage" aria-hidden="true">
          <img className="sa-stage__main" src="/assets/studio/dashboard.webp" alt="" width={1280} height={800} />
          <img className="sa-stage__phone" src="/assets/studio/app-10-checkin.webp" alt="" width={430} height={925} />
          <div className="sa-chip sa-chip--1"><b>{t('hero.chip1-n', '+18%')}</b><span>{t('hero.chip1', 'tỉ lệ gia hạn')}</span></div>
          <div className="sa-chip sa-chip--2"><i />{t('hero.chip2', 'Hội viên vừa check-in')}</div>
        </div>
      </section>

      <section className="sa-stats">
        <div className="sa-wrap sa-stats__row">
          {STATS.map(([v, l], i) => <div key={i} data-rv><b>{n(`stats.${i}.n`, v)}</b><span>{t(`stats.${i}.label`, l)}</span></div>)}
        </div>
      </section>

      <section className="sa-sec" id="tinh-nang">
        <div className="sa-wrap">
          <div className="sa-head" data-rv><p className="sa-kicker">{t('feat.kicker', 'Tính năng')}</p><h2>{t('feat.title1', 'Mọi việc ở quầy lễ tân,')}<br /><span className="sa-grad">{t('feat.title2', 'gói trong một màn hình.')}</span></h2></div>
          <div className="sa-bento">
            {BENTO.map((b, i) => (
              <article key={i} className={`sa-tile sa-tile--${b.k}`} data-rv style={{ ['--d' as string]: `${i * 80}ms` }}>
                <div><h3>{t(`feat.${i}.title`, b.t)}</h3><p>{t(`feat.${i}.text`, b.d, { multiline: true })}</p></div>
                <div className="sa-tile__shot"><img src={b.img} alt={s(`feat.${i}.title`, b.t)} loading="lazy" decoding="async" /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sa-sec sa-sec--ink" id="truoc-sau">
        <div className="sa-wrap">
          <div className="sa-head" data-rv><p className="sa-kicker">{t('vs.kicker', 'Trước & sau')}</p><h2>{t('vs.title1', 'Cùng một phòng tập,')}<br /><span className="sa-grad">{t('vs.title2', 'hai cách làm việc.')}</span></h2></div>
          <div className="sa-vs">
            <div className="sa-vs__col sa-vs__col--before" data-rv><h3>{t('vs.before', 'Trước')}</h3><ul>{BEFORE.map((x, i) => <li key={i}>{t(`vs.before.${i}`, x)}</li>)}</ul></div>
            <div className="sa-vs__col sa-vs__col--after" data-rv style={{ ['--d' as string]: '120ms' }}><h3>{t('vs.after', 'Với DANAVA Studio')}</h3><ul>{AFTER.map((x, i) => <li key={i}>{t(`vs.after.${i}`, x)}</li>)}</ul></div>
          </div>
        </div>
      </section>

      <section className="sa-sec" id="bang-gia">
        <div className="sa-wrap">
          <div className="sa-head sa-head--c" data-rv><p className="sa-kicker">{t('plans.kicker', 'Bảng giá')}</p><h2>{t('plans.title1', 'Trả theo năm,')}<br /><span className="sa-grad">{t('plans.title2', 'lớn lên cùng phòng tập.')}</span></h2></div>
          <div className="sa-plans">
            {pricing.plans.map((p, i) => (
              <article key={p.id || i} className={p.highlight ? 'is-hot' : ''} data-rv style={{ ['--d' as string]: `${i * 80}ms` }}>
                {p.highlight && <span className="sa-plan__flag">{t('plans.flag', 'Phổ biến')}</span>}
                <h3>{B(`plans.${i}.name`, 'Tên gói', p.name)}</h3><p className="sa-plan__d">{B(`plans.${i}.desc`, 'Mô tả gói', p.desc, true)}</p>
                <b>{priceText(p.price)}</b><small>{perMonth(p.price, pricing.termMonths) || s('plans.free', 'Không giới hạn thời gian')}</small>
                <ul>
                  <li>{B(`plans.${i}.members`, 'Số hội viên', p.members)} {t('plans.members', 'hội viên')}</li>
                  <li>{B(`plans.${i}.staff`, 'Số nhân sự', p.staff)} {t('plans.staff', 'nhân viên')}</li>
                  <li>{B(`plans.${i}.branches`, 'Số chi nhánh', p.branches)} {t('plans.branches', 'chi nhánh')}</li>
                  {p.perks.slice(0, 3).map((x, j) => <li key={j}>{B(`plans.${i}.perks.${j}`, 'Tính năng nổi bật của gói', x)}</li>)}
                </ul>
                <a className={`sa-btn${p.highlight ? '' : ' sa-btn--ghost'}`} href="#dung-thu">{t('plans.cta', 'Chọn gói này')}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sa-sec sa-sec--soft" id="hoi-dap">
        <div className="sa-wrap sa-faq">
          <div data-rv><p className="sa-kicker">{t('faq.kicker', 'Hỏi đáp')}</p><h2>{t('faq.title1', 'Câu hỏi')} <span className="sa-grad">{t('faq.title2', 'hay gặp')}</span></h2></div>
          <div>{FAQ.map(([q, a], i) => <details key={i} open={i === 0} data-rv><summary>{t(`faq.${i}.q`, q)}</summary><p>{t(`faq.${i}.a`, a, { multiline: true })}</p></details>)}</div>
        </div>
      </section>

      <section className="sa-cta" id="dung-thu">
        <div className="sa-wrap sa-cta__card" data-rv>
          <div><h2>{t('cta.title1', 'Mở tài khoản')}<br /><span className="sa-grad">{t('cta.title2', 'trong 2 phút.')}</span></h2><p>{t('cta.lead', 'Miễn phí cho phòng tập dưới 50 hội viên. Không cần thẻ ngân hàng.', { multiline: true })}</p></div>
          <DemoForm className="sa-form" done={s('form.done', 'Cảm ơn bạn! Đây là form minh hoạ — trên website thật, yêu cầu sẽ về thẳng Zalo và email của bạn.')}>
            <input name="gym" required placeholder={s('form.gym', 'Tên phòng tập')} aria-label={s('form.gym', 'Tên phòng tập')} />
            <input name="phone" required inputMode="tel" placeholder={s('form.phone', 'Số điện thoại')} aria-label={s('form.phone', 'Số điện thoại')} />
            <select name="model" aria-label={s('form.model', 'Mô hình')}>{HELLO.models.map((m, i) => <option key={i}>{s(`form.models.${i}`, m)}</option>)}</select>
            <button className="sa-btn" type="submit">{t('form.submit', 'Tạo tài khoản miễn phí')}</button>
          </DemoForm>
        </div>
      </section>
      <footer className="sa-foot"><span className="sa-logo">{logo}</span><p>{t('foot', 'Mẫu landing page SaaS — giao diện và bảng giá thật của DANAVA Studio.')}</p></footer>
    </main>
  );
}
