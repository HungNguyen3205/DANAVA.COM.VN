/** Mẫu "Ember Athletic Club" — phòng gym, phong cách than hồng (app/demo/ember.css). Mọi chữ: txt.demo.em.* (sửa + dịch). */
import { DemoFx, DemoForm } from './fx';
import { demoText } from './text';

const ZONES = [
  { t: 'Sức mạnh', d: '12 giàn tạ Olympic, sàn cao su 4 cm, tạ đòn tới 220 kg.' },
  { t: 'Cardio', d: '24 máy chạy, xe đạp gió và máy leo thang, màn hình theo nhịp tim.' },
  { t: 'Functional', d: 'Khu HYROX 40 m: kéo xe trượt, ném bóng tường, chèo thuyền.' },
  { t: 'Hồi phục', d: 'Xông hơi đá, bồn nước lạnh 8°C và phòng giãn cơ.' }
];
const CLASSES = [
  { at: '05:30', n: 'Đốt mỡ buổi sáng', c: 'Coach Vy · Cường độ cao', left: 'Còn 4 chỗ', hot: true },
  { at: '07:00', n: 'Powerlifting căn bản', c: 'Coach Long · Mọi trình độ', left: '9 chỗ trống' },
  { at: '12:15', n: 'HIIT 30 phút trưa', c: 'Coach Minh · Cường độ cao', left: 'Còn 2 chỗ', hot: true },
  { at: '17:45', n: 'HYROX Race Prep', c: 'Coach Vy · Nâng cao', left: '6 chỗ trống' },
  { at: '19:30', n: 'Boxing Conditioning', c: 'Coach Tài · Mọi trình độ', left: '11 chỗ trống' }
];
const PLANS = [
  { n: 'Ember Start', p: '690K', u: '/tháng', f: ['Toàn bộ khu tập 5:00 – 23:00', '1 buổi đo InBody', 'Tủ đồ theo ngày'] },
  { n: 'Ember Pro', p: '1.290K', u: '/tháng', hot: true, f: ['Không giới hạn lớp nhóm', '4 buổi PT mỗi tháng', 'Xông hơi & bồn lạnh', 'Khăn và nước miễn phí'] },
  { n: 'Ember Year', p: '11.900K', u: '/năm', f: ['Mọi quyền lợi gói Pro', 'Tạm dừng thẻ 60 ngày', 'Mang theo 1 người bạn mỗi tuần'] }
];
const COACHES = [
  { n: 'Trần Vy', r: 'HYROX Master Coach', s: '9 năm · Vô địch HYROX Đông Nam Á' },
  { n: 'Lê Long', r: 'Powerlifting', s: 'Kỷ lục deadlift 260 kg hạng 83' },
  { n: 'Phạm Tài', r: 'Boxing & Conditioning', s: 'Cựu tuyển thủ quốc gia' }
];
const NUMS = [['1.800', 'm² khu tập'], ['42', 'lớp mỗi tuần'], ['2.600', 'hội viên']];
const GOALS = ['Giảm mỡ', 'Tăng cơ', 'Thi HYROX', 'Khoẻ hơn mỗi ngày'];

export function EmberDemo() {
  const { t, s, n } = demoText('em', 'Ember Athletic Club');
  const logo = <><span aria-hidden="true">▲</span>{t('logo', 'EMBER')}</>;
  const marquee = () => t('marquee', 'SỨC MẠNH ✦ KỶ LUẬT ✦ HYROX ✦ BOXING ✦ CARDIO ✦ HỒI PHỤC ✦');
  return (
    <main className="em">
      <DemoFx />
      <header className="em-nav">
        <a className="em-logo" href="#top">{logo}</a>
        <nav aria-label={s('nav.aria', 'Mục lục')}><a href="#khu-tap">{t('nav.0', 'Khu tập')}</a><a href="#lich">{t('nav.1', 'Lịch lớp')}</a><a href="#goi">{t('nav.2', 'Gói tập')}</a><a href="#hlv">{t('nav.3', 'Huấn luyện viên')}</a></nav>
        <a className="em-btn em-btn--sm" href="#tap-thu">{t('nav.cta', 'Tập thử 7 ngày')}</a>
      </header>

      <section className="em-hero" id="top">
        <div className="em-embers" aria-hidden="true">{Array.from({ length: 22 }).map((_, i) => <i key={i} style={{ ['--x' as string]: `${(i * 47) % 100}%`, ['--t' as string]: `${6 + (i % 5)}s`, ['--dl' as string]: `${(i * 0.7) % 6}s` }} />)}</div>
        <p className="em-ghost" aria-hidden="true">EMBER</p>
        <div className="em-hero__in">
          <p className="em-tag"><span /> {t('hero.tag', 'Mở cửa 5:00 – 23:00 · Hải Châu, Đà Nẵng')}</p>
          <h1>{t('hero.title1', 'ĐỐT')}<br /><span>{t('hero.title2', 'GIỚI HẠN')}</span><br />{t('hero.title3', 'CỦA BẠN')}</h1>
          <p className="em-lead">{t('hero.lead', 'Câu lạc bộ sức mạnh và HYROX đầu tiên tại Đà Nẵng. 1.800 m² thiết bị chuẩn thi đấu, huấn luyện viên có chứng chỉ quốc tế.', { multiline: true })}</p>
          <div className="em-row"><a className="em-btn" href="#tap-thu">{t('hero.cta', 'Nhận 7 ngày tập thử')}</a><a className="em-btn em-btn--line" href="#goi">{t('hero.more', 'Xem gói tập')}</a></div>
        </div>
        <ul className="em-hero__nums">
          {NUMS.map(([v, l], i) => <li key={i}><b>{n(`nums.${i}.n`, v)}</b><span>{t(`nums.${i}.label`, l)}</span></li>)}
        </ul>
      </section>

      <div className="em-marquee" aria-hidden="true"><div><span>{marquee()}</span><span>{marquee()}</span></div></div>

      <section className="em-sec" id="khu-tap">
        <div className="em-wrap">
          <h2 data-rv>{t('zones.title1', 'Bốn khu tập.')}<br /><span>{t('zones.title2', 'Một mục tiêu.')}</span></h2>
          <div className="em-zones">
            {ZONES.map((z, i) => (
              <article key={i} data-rv style={{ ['--d' as string]: `${i * 90}ms` }}>
                <span className="em-zones__k">0{i + 1}</span><h3>{t(`zones.${i}.title`, z.t)}</h3><p>{t(`zones.${i}.text`, z.d, { multiline: true })}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="em-sec em-sec--alt" id="lich">
        <div className="em-wrap em-split">
          <div data-rv><p className="em-kicker">{t('sched.kicker', 'Lịch lớp hôm nay')}</p><h2>{t('sched.title1', 'Vào lớp.')}<br /><span>{t('sched.title2', 'Ra mồ hôi.')}</span></h2><p className="em-muted">{t('sched.lead', 'Đặt chỗ trên ứng dụng, check-in bằng QR. Lớp đầy sẽ tự mở danh sách chờ.', { multiline: true })}</p></div>
          <ol className="em-sched">
            {CLASSES.map((c, i) => (
              <li key={i} data-rv style={{ ['--d' as string]: `${i * 70}ms` }}>
                <time>{t(`sched.${i}.time`, c.at)}</time>
                <div><b>{t(`sched.${i}.name`, c.n)}</b><span>{t(`sched.${i}.coach`, c.c)}</span></div>
                <em className={c.hot ? 'is-hot' : ''}>{t(`sched.${i}.left`, c.left)}</em>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="em-sec" id="goi">
        <div className="em-wrap">
          <h2 className="em-center" data-rv>{t('plans.title1', 'Chọn vé')} <span>{t('plans.title2', 'vào sân')}</span></h2>
          <div className="em-plans">
            {PLANS.map((p, i) => (
              <article key={i} className={`em-ticket${p.hot ? ' is-hot' : ''}`} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                {p.hot && <span className="em-ticket__flag">{t('plans.flag', 'Chọn nhiều nhất')}</span>}
                <div className="em-ticket__top"><p>{t(`plans.${i}.name`, p.n)}</p><b>{t(`plans.${i}.price`, p.p)}<small>{t(`plans.${i}.unit`, p.u)}</small></b></div>
                <ul>{p.f.map((f, j) => <li key={j}>{t(`plans.${i}.f.${j}`, f)}</li>)}</ul>
                <a className={`em-btn${p.hot ? '' : ' em-btn--line'}`} href="#tap-thu">{t('plans.cta', 'Giữ vé này')}</a>
                <span className="em-ticket__code" aria-hidden="true">EMB-{2026 + i}-{String(4071 + i * 313)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="em-sec em-sec--alt" id="hlv">
        <div className="em-wrap">
          <h2 data-rv>{t('coach.title1', 'Người')} <span>{t('coach.title2', 'dẫn nhịp')}</span></h2>
          <div className="em-coaches">
            {COACHES.map((c, i) => (
              <article key={i} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}>
                <div className="em-coach__art" aria-hidden="true"><span>{s(`coach.${i}.name`, c.n).split(' ').pop()![0]}</span></div>
                <h3>{t(`coach.${i}.name`, c.n)}</h3><p className="em-coach__r">{t(`coach.${i}.role`, c.r)}</p><p className="em-muted">{t(`coach.${i}.note`, c.s)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="em-cta" id="tap-thu">
        <div className="em-wrap em-split">
          <div data-rv><h2>{t('cta.title1', '7 ngày.')}<br /><span>{t('cta.title2', '0 đồng.')}</span></h2><p className="em-muted">{t('cta.lead', 'Tập mọi khu, vào mọi lớp, một buổi PT đánh giá thể lực. Không cần thẻ ngân hàng.', { multiline: true })}</p></div>
          <DemoForm className="em-form" done={s('form.done', 'Cảm ơn bạn! Đây là form minh hoạ — trên website thật, yêu cầu sẽ về thẳng Zalo và email của bạn.')}>
            <input name="name" required placeholder={s('form.name', 'Họ và tên')} aria-label={s('form.name', 'Họ và tên')} />
            <input name="phone" required inputMode="tel" placeholder={s('form.phone', 'Số điện thoại')} aria-label={s('form.phone', 'Số điện thoại')} />
            <select name="goal" aria-label={s('form.goal', 'Mục tiêu của bạn')} defaultValue=""><option value="" disabled>{s('form.goal', 'Mục tiêu của bạn')}</option>{GOALS.map((g, i) => <option key={i}>{s(`form.goals.${i}`, g)}</option>)}</select>
            <button className="em-btn" type="submit">{t('form.submit', 'Kích hoạt 7 ngày tập thử')}</button>
          </DemoForm>
        </div>
      </section>
      <footer className="em-foot"><span className="em-logo">{logo}</span><p>{t('foot', 'Thương hiệu minh hoạ — mẫu giao diện do DANAVA thiết kế.')}</p></footer>
    </main>
  );
}
