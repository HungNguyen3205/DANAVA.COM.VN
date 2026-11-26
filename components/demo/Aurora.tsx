/** Mẫu "Aurora Gala Night" — sự kiện & gala, phong cách cực quang (app/demo/aurora.css). Ảnh: sự kiện thật do DANAVA dàn dựng. Mọi chữ: txt.demo.au.* (sửa + dịch). */
import { Countdown, DemoFx, DemoForm } from './fx';
import { demoText } from './text';

const RUN = [
  ['18:00', 'Thảm đỏ & tiệc nhẹ', 'Photo wall ánh sáng, quầy mocktail và nhạc jazz sống.'],
  ['19:00', 'Khai mạc', 'Màn trình diễn mapping 270° kể câu chuyện 10 năm.'],
  ['19:40', 'Vinh danh', 'Trao giải Đối tác của năm và Nhân sự truyền cảm hứng.'],
  ['20:30', 'Gala dinner', 'Thực đơn 6 món, nhạc thính phòng và bốc thăm trúng thưởng.'],
  ['22:00', 'After party', 'DJ set, sân khấu mở cho mọi người.']
];
const PHOTOS = [
  ['/assets/profile/who-gala.webp', 'Gala tri ân khách hàng'],
  ['/assets/profile/set-stage.webp', 'Sân khấu khai mạc'],
  ['/assets/profile/lutech-4.webp', 'Year End Party 600 khách'],
  ['/assets/profile/set-rocket.webp', 'Thiết kế mô hình sân khấu'],
  ['/assets/profile/lutech-2.webp', 'Khoảnh khắc vinh danh']
];
const TIERS = [
  { n: 'Silver', p: '1.500.000đ', f: ['Ghế khu C', 'Gala dinner 6 món', 'After party'] },
  { n: 'Gold', p: '2.900.000đ', hot: true, f: ['Ghế khu B gần sân khấu', 'Quầy đồ uống riêng', 'Ảnh chân dung thảm đỏ'] },
  { n: 'Diamond', p: '6.500.000đ', f: ['Bàn VIP hàng đầu', 'Đón tiễn bằng xe riêng', 'Gặp gỡ khách mời sau chương trình'] }
];

export function AuroraDemo() {
  const { t, s } = demoText('au', 'Aurora Gala Night');
  const logo = <>{t('logo', 'AURORA')}<span className="au-logo__yr">/26</span></>;
  return (
    <main className="au">
      <DemoFx />
      <div className="au-sky" aria-hidden="true"><i /><i /><i /></div>
      <header className="au-nav">
        <a className="au-logo" href="#top">{logo}</a>
        <nav aria-label={s('nav.aria', 'Mục lục')}><a href="#lich-trinh">{t('nav.0', 'Lịch trình')}</a><a href="#khoanh-khac">{t('nav.1', 'Khoảnh khắc')}</a><a href="#hang-ve">{t('nav.2', 'Hạng vé')}</a></nav>
        <a className="au-btn au-btn--sm" href="#thu-moi">{t('nav.cta', 'Nhận thư mời')}</a>
      </header>

      <section className="au-hero" id="top">
        <p className="au-date">{t('hero.date', '31 · 12 · 2026 — Ariyana Convention Centre, Đà Nẵng')}</p>
        <h1><span className="au-h1a">{t('hero.title1', 'Aurora')}</span><span className="au-h1b">{t('hero.title2', 'Gala Night')}</span></h1>
        <p className="au-lead">{t('hero.lead', 'Một đêm ánh sáng khép lại năm 2026: 800 khách mời, sân khấu 270° và những câu chuyện đáng nhớ.', { multiline: true })}</p>
        <Countdown to="2026-12-31T18:00:00+07:00" className="au-count" labels={[s('count.d', 'Ngày'), s('count.h', 'Giờ'), s('count.m', 'Phút'), s('count.s', 'Giây')]} />
        <div className="au-row"><a className="au-btn" href="#thu-moi">{t('hero.cta', 'Đăng ký tham dự')}</a><a className="au-btn au-btn--ghost" href="#lich-trinh">{t('hero.more', 'Xem lịch trình')}</a></div>
      </section>

      <section className="au-sec" id="lich-trinh">
        <div className="au-wrap au-split">
          <div data-rv><p className="au-kicker">{t('run.kicker', 'Lịch trình đêm gala')}</p><h2>{t('run.title1', 'Năm chương')}<br />{t('run.title2', 'của')} <em>{t('run.title3', 'một đêm')}</em></h2></div>
          <ol className="au-run">
            {RUN.map(([tm, h, p], i) => <li key={i} data-rv style={{ ['--d' as string]: `${i * 90}ms` }}><time>{t(`run.${i}.time`, tm)}</time><div><h3>{t(`run.${i}.title`, h)}</h3><p>{t(`run.${i}.text`, p, { multiline: true })}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="au-sec au-sec--photos" id="khoanh-khac">
        <div className="au-wrap">
          <div className="au-center" data-rv><p className="au-kicker">{t('photos.kicker', 'Khoảnh khắc')}</p><h2>{t('photos.title1', 'Những đêm')} <em>{t('photos.title2', 'đã thắp sáng')}</em></h2></div>
          <div className="au-mosaic">
            {PHOTOS.map(([src, cap], i) => (
              <figure key={src} className={`au-ph au-ph--${i + 1}`} data-rv style={{ ['--d' as string]: `${i * 90}ms` }}>
                <img src={src} alt={s(`photos.${i}`, cap)} loading="lazy" decoding="async" /><figcaption>{t(`photos.${i}`, cap)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="au-sec" id="hang-ve">
        <div className="au-wrap">
          <div className="au-center" data-rv><p className="au-kicker">{t('tiers.kicker', 'Hạng vé')}</p><h2>{t('tiers.title1', 'Chọn')} <em>{t('tiers.title2', 'chỗ ngồi')}</em> {t('tiers.title3', 'của bạn')}</h2></div>
          <div className="au-tiers">
            {TIERS.map((tier, i) => (
              <article key={i} className={`au-tier${tier.hot ? ' is-hot' : ''}`} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                <p className="au-tier__n">{t(`tiers.${i}.name`, tier.n)}</p><b>{t(`tiers.${i}.price`, tier.p)}</b>
                <ul>{tier.f.map((f, j) => <li key={j}>{t(`tiers.${i}.f.${j}`, f)}</li>)}</ul>
                <a className={`au-btn${tier.hot ? '' : ' au-btn--ghost'}`} href="#thu-moi">{t(`tiers.${i}.cta`, `Chọn ${tier.n}`)}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="au-sec au-invite" id="thu-moi">
        <div className="au-wrap">
          <div className="au-card" data-rv>
            <div><p className="au-kicker">{t('invite.kicker', 'Thư mời điện tử')}</p><h2>{t('invite.title1', 'Giữ chỗ')} <em>{t('invite.title2', 'trước 15/12')}</em></h2><p className="au-muted">{t('invite.lead', 'Thư mời kèm mã QR check-in sẽ gửi qua Zalo và email trong 24 giờ.', { multiline: true })}</p></div>
            <DemoForm className="au-form" done={s('form.done', 'Cảm ơn bạn! Đây là form minh hoạ — trên website thật, yêu cầu sẽ về thẳng Zalo và email của bạn.')}>
              <input name="name" required placeholder={s('form.name', 'Họ và tên')} aria-label={s('form.name', 'Họ và tên')} />
              <input name="company" placeholder={s('form.company', 'Công ty')} aria-label={s('form.company', 'Công ty')} />
              <input name="phone" required inputMode="tel" placeholder={s('form.phone', 'Số điện thoại')} aria-label={s('form.phone', 'Số điện thoại')} />
              <select name="tier" aria-label={s('form.tier', 'Hạng vé')} defaultValue={s('tiers.1.name', 'Gold')}>{TIERS.map((tier, i) => <option key={i}>{s(`tiers.${i}.name`, tier.n)}</option>)}</select>
              <button className="au-btn" type="submit">{t('form.submit', 'Nhận thư mời')}</button>
            </DemoForm>
          </div>
        </div>
      </section>
      <footer className="au-foot"><span className="au-logo">{logo}</span><p>{t('foot', 'Sự kiện minh hoạ — hình ảnh từ các chương trình DANAVA đã tổ chức.')}</p></footer>
    </main>
  );
}
