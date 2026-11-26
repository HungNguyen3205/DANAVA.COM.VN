/** Mẫu "Aurora Gala Night" — sự kiện & gala, phong cách cực quang (app/demo/aurora.css). Ảnh: sự kiện thật do DANAVA dàn dựng. */
import { Countdown, DemoFx, DemoForm } from './fx';

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
  return (
    <main className="au">
      <DemoFx />
      <div className="au-sky" aria-hidden="true"><i /><i /><i /></div>
      <header className="au-nav">
        <a className="au-logo" href="#top">AURORA<span>/26</span></a>
        <nav aria-label="Mục lục"><a href="#lich-trinh">Lịch trình</a><a href="#khoanh-khac">Khoảnh khắc</a><a href="#hang-ve">Hạng vé</a></nav>
        <a className="au-btn au-btn--sm" href="#thu-moi">Nhận thư mời</a>
      </header>

      <section className="au-hero" id="top">
        <p className="au-date">31 · 12 · 2026 — Ariyana Convention Centre, Đà Nẵng</p>
        <h1><span className="au-h1a">Aurora</span><span className="au-h1b">Gala Night</span></h1>
        <p className="au-lead">Một đêm ánh sáng khép lại năm 2026: 800 khách mời, sân khấu 270° và những câu chuyện đáng nhớ.</p>
        <Countdown to="2026-12-31T18:00:00+07:00" className="au-count" />
        <div className="au-row"><a className="au-btn" href="#thu-moi">Đăng ký tham dự</a><a className="au-btn au-btn--ghost" href="#lich-trinh">Xem lịch trình</a></div>
      </section>

      <section className="au-sec" id="lich-trinh">
        <div className="au-wrap au-split">
          <div data-rv><p className="au-kicker">Lịch trình đêm gala</p><h2>Năm chương<br />của <em>một đêm</em></h2></div>
          <ol className="au-run">
            {RUN.map(([t, h, p], i) => <li key={t} data-rv style={{ ['--d' as string]: `${i * 90}ms` }}><time>{t}</time><div><h3>{h}</h3><p>{p}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="au-sec au-sec--photos" id="khoanh-khac">
        <div className="au-wrap">
          <div className="au-center" data-rv><p className="au-kicker">Khoảnh khắc</p><h2>Những đêm <em>đã thắp sáng</em></h2></div>
          <div className="au-mosaic">
            {PHOTOS.map(([src, cap], i) => (
              <figure key={src} className={`au-ph au-ph--${i + 1}`} data-rv style={{ ['--d' as string]: `${i * 90}ms` }}>
                <img src={src} alt={cap} loading="lazy" decoding="async" /><figcaption>{cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="au-sec" id="hang-ve">
        <div className="au-wrap">
          <div className="au-center" data-rv><p className="au-kicker">Hạng vé</p><h2>Chọn <em>chỗ ngồi</em> của bạn</h2></div>
          <div className="au-tiers">
            {TIERS.map((t, i) => (
              <article key={t.n} className={`au-tier${t.hot ? ' is-hot' : ''}`} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                <p className="au-tier__n">{t.n}</p><b>{t.p}</b>
                <ul>{t.f.map(f => <li key={f}>{f}</li>)}</ul>
                <a className={`au-btn${t.hot ? '' : ' au-btn--ghost'}`} href="#thu-moi">Chọn {t.n}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="au-sec au-invite" id="thu-moi">
        <div className="au-wrap">
          <div className="au-card" data-rv>
            <div><p className="au-kicker">Thư mời điện tử</p><h2>Giữ chỗ <em>trước 15/12</em></h2><p className="au-muted">Thư mời kèm mã QR check-in sẽ gửi qua Zalo và email trong 24 giờ.</p></div>
            <DemoForm className="au-form">
              <input name="name" required placeholder="Họ và tên" aria-label="Họ và tên" />
              <input name="company" placeholder="Công ty" aria-label="Công ty" />
              <input name="phone" required inputMode="tel" placeholder="Số điện thoại" aria-label="Số điện thoại" />
              <select name="tier" aria-label="Hạng vé" defaultValue="Gold">{TIERS.map(t => <option key={t.n}>{t.n}</option>)}</select>
              <button className="au-btn" type="submit">Nhận thư mời</button>
            </DemoForm>
          </div>
        </div>
      </section>
      <footer className="au-foot"><span className="au-logo">AURORA<span>/26</span></span><p>Sự kiện minh hoạ — hình ảnh từ các chương trình DANAVA đã tổ chức.</p></footer>
    </main>
  );
}
