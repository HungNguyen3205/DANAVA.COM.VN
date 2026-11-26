/** Mẫu "Mây Yoga Studio" — yoga & pilates, phong cách mây sớm (app/demo/may.css). Mọi chữ: txt.demo.my.* (sửa + dịch). */
import { DemoFx, DemoForm } from './fx';
import { demoText } from './text';

const VALUES = [['Lớp nhỏ', 'Tối đa 12 người để giáo viên nhìn thấy từng tư thế.'], ['Gió biển', 'Phòng tập mở cửa ra hàng dừa, không dùng điều hoà buổi sáng.'], ['Trà sau lớp', 'Trà hoa cúc và một khoảng nghỉ không vội.']];
const LEVELS = [
  { l: 'Nhẹ nhàng', c: 'Hatha nền tảng', t: 'T2 · T4 · T6 — 06:00', d: 'Làm quen hơi thở, căn chỉnh tư thế, không cần dẻo trước.', tone: 'sand' },
  { l: 'Cân bằng', c: 'Vinyasa Flow', t: 'Hằng ngày — 17:30', d: 'Chuỗi động tác nối hơi thở, tăng sức bền và sự tập trung.', tone: 'sage' },
  { l: 'Chuyên sâu', c: 'Pilates Reformer', t: 'T3 · T5 · T7 — 18:45', d: 'Lớp 6 người trên máy Reformer, siết cơ lõi và tư thế.', tone: 'clay' }
];
const TEACHERS = [
  { n: 'Diệu Linh', r: 'Hatha · Yin', y: 'RYT 500 · 8 năm' },
  { n: 'Khánh An', r: 'Vinyasa', y: 'RYT 200 · 5 năm' },
  { n: 'Hoàng Mai', r: 'Pilates Reformer', y: 'BASI Pilates · 6 năm' }
];
const PASSES = [
  { n: 'Thẻ 10 buổi', p: '1.400.000đ', s: 'Dùng trong 2 tháng' },
  { n: 'Không giới hạn', p: '1.200.000đ', s: 'mỗi tháng · mọi lớp nhóm', hot: true },
  { n: 'Reformer 8 buổi', p: '2.200.000đ', s: 'Lớp nhỏ tối đa 6 người' }
];
const FAQ = [
  ['Mình chưa tập bao giờ, có theo kịp không?', 'Hoàn toàn được. Lớp Nhẹ nhàng dành riêng cho người mới, giáo viên chỉnh tư thế cho từng người.'],
  ['Cần mang theo gì?', 'Studio có sẵn thảm, gạch, dây và khăn. Bạn chỉ cần trang phục thoải mái và một chai nước.'],
  ['Có thể tạm dừng thẻ không?', 'Thẻ không giới hạn được tạm dừng tối đa 30 ngày mỗi năm, báo trước 1 ngày qua Zalo.']
];

export function MayDemo() {
  const { t, s } = demoText('my', 'Mây Yoga Studio');
  const logo = <><span className="my-logo__dot" aria-hidden="true" />{t('logo', 'mây')}</>;
  return (
    <main className="my">
      <DemoFx />
      <header className="my-nav">
        <a className="my-logo" href="#top">{logo}</a>
        <nav aria-label={s('nav.aria', 'Mục lục')}><a href="#lop">{t('nav.0', 'Lớp học')}</a><a href="#giao-vien">{t('nav.1', 'Giáo viên')}</a><a href="#the-tap">{t('nav.2', 'Thẻ tập')}</a><a href="#hoi-dap">{t('nav.3', 'Hỏi đáp')}</a></nav>
        <a className="my-btn my-btn--sm" href="#buoi-dau">{t('nav.cta', 'Buổi đầu miễn phí')}</a>
      </header>

      <section className="my-hero" id="top">
        <div className="my-blobs" aria-hidden="true"><i /><i /><i /></div>
        <div className="my-hero__in">
          <p className="my-kicker">{t('hero.kicker', 'Yoga & Pilates · Sơn Trà, Đà Nẵng')}</p>
          <h1>{t('hero.title1', 'Hít vào')}<br /><em>{t('hero.title2', 'thật chậm.')}</em></h1>
          <p className="my-lead">{t('hero.lead', 'Một studio nhỏ cạnh biển, nơi mỗi buổi sáng bắt đầu bằng hơi thở và kết thúc bằng một tách trà.', { multiline: true })}</p>
          <div className="my-row"><a className="my-btn" href="#buoi-dau">{t('hero.cta', 'Đặt buổi học đầu')}</a><span className="my-breath" aria-hidden="true"><span className="my-breath__c" /><span className="my-breath__t">{t('hero.breath', 'thở cùng mây')}</span></span></div>
        </div>
      </section>

      <section className="my-values">
        <div className="my-wrap my-values__grid">
          {VALUES.map(([h, p], i) => (
            <div key={i} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}><span className="my-num">0{i + 1}</span><h3>{t(`values.${i}.title`, h)}</h3><p>{t(`values.${i}.text`, p, { multiline: true })}</p></div>
          ))}
        </div>
      </section>

      <section className="my-sec" id="lop">
        <div className="my-wrap">
          <h2 data-rv>{t('levels.title1', 'Ba nhịp')} <em>{t('levels.title2', 'cho mọi cơ thể')}</em></h2>
          <div className="my-levels">
            {LEVELS.map((c, i) => (
              <article key={i} className={`my-level my-level--${c.tone}`} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                <span className="my-level__l">{t(`levels.${i}.level`, c.l)}</span><h3>{t(`levels.${i}.name`, c.c)}</h3><p>{t(`levels.${i}.text`, c.d, { multiline: true })}</p><time>{t(`levels.${i}.time`, c.t)}</time>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="my-sec my-sec--sage" id="giao-vien">
        <div className="my-wrap">
          <h2 data-rv>{t('teachers.title1', 'Những người')} <em>{t('teachers.title2', 'giữ nhịp')}</em></h2>
          <div className="my-teachers">
            {TEACHERS.map((x, i) => (
              <article key={i} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                <div className={`my-portrait my-portrait--${i + 1}`} aria-hidden="true"><span>{s(`teachers.${i}.name`, x.n).split(' ').pop()![0]}</span></div>
                <h3>{t(`teachers.${i}.name`, x.n)}</h3><p>{t(`teachers.${i}.role`, x.r)}</p><small>{t(`teachers.${i}.note`, x.y)}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="my-sec" id="the-tap">
        <div className="my-wrap">
          <h2 className="my-center" data-rv>{t('passes.title1', 'Thẻ tập')} <em>{t('passes.title2', 'nhẹ ví')}</em></h2>
          <div className="my-passes">
            {PASSES.map((p, i) => (
              <article key={i} className={p.hot ? 'is-hot' : ''} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}>
                {p.hot && <span className="my-pass__flag">{t('passes.flag', 'Được chọn nhiều')}</span>}
                <h3>{t(`passes.${i}.name`, p.n)}</h3><b>{t(`passes.${i}.price`, p.p)}</b><p>{t(`passes.${i}.note`, p.s)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="my-sec my-sec--sand" id="hoi-dap">
        <div className="my-wrap my-faq">
          <h2 data-rv>{t('faq.title1', 'Bạn đang')} <em>{t('faq.title2', 'băn khoăn?')}</em></h2>
          <div>{FAQ.map(([q, a], i) => <details key={i} data-rv open={i === 0} style={{ ['--d' as string]: `${i * 90}ms` }}><summary>{t(`faq.${i}.q`, q)}</summary><p>{t(`faq.${i}.a`, a, { multiline: true })}</p></details>)}</div>
        </div>
      </section>

      <section className="my-cta" id="buoi-dau">
        <div className="my-wrap my-cta__card" data-rv>
          <div><h2>{t('cta.title1', 'Buổi đầu')} <em>{t('cta.title2', 'là quà')}</em></h2><p>{t('cta.lead', 'Chọn một lớp bất kỳ trong tuần, studio giữ thảm và trà cho bạn.', { multiline: true })}</p></div>
          <DemoForm className="my-form" done={s('form.done', 'Mây đã giữ chỗ minh hoạ cho bạn. Trên website thật, studio nhắn Zalo xác nhận ngay.')}>
            <input name="name" required placeholder={s('form.name', 'Tên của bạn')} aria-label={s('form.name', 'Tên của bạn')} />
            <input name="phone" required inputMode="tel" placeholder={s('form.phone', 'Số điện thoại')} aria-label={s('form.phone', 'Số điện thoại')} />
            <select name="class" aria-label={s('form.class', 'Lớp muốn thử')}>{LEVELS.map((l, i) => <option key={i}>{s(`levels.${i}.name`, l.c)}</option>)}</select>
            <button className="my-btn" type="submit">{t('form.submit', 'Giữ chỗ buổi đầu')}</button>
          </DemoForm>
        </div>
      </section>
      <footer className="my-foot"><span className="my-logo">{logo}</span><p>{t('foot', 'Thương hiệu minh hoạ — mẫu giao diện do DANAVA thiết kế.')}</p></footer>
    </main>
  );
}
