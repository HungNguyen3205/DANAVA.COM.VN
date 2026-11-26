/** Mẫu "Mây Yoga Studio" — yoga & pilates, phong cách mây sớm (app/demo/may.css). */
import { DemoFx, DemoForm } from './fx';

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
  return (
    <main className="my">
      <DemoFx />
      <header className="my-nav">
        <a className="my-logo" href="#top"><span className="my-logo__dot" aria-hidden="true" />mây</a>
        <nav aria-label="Mục lục"><a href="#lop">Lớp học</a><a href="#giao-vien">Giáo viên</a><a href="#the-tap">Thẻ tập</a><a href="#hoi-dap">Hỏi đáp</a></nav>
        <a className="my-btn my-btn--sm" href="#buoi-dau">Buổi đầu miễn phí</a>
      </header>

      <section className="my-hero" id="top">
        <div className="my-blobs" aria-hidden="true"><i /><i /><i /></div>
        <div className="my-hero__in">
          <p className="my-kicker">Yoga & Pilates · Sơn Trà, Đà Nẵng</p>
          <h1>Hít vào<br /><em>thật chậm.</em></h1>
          <p className="my-lead">Một studio nhỏ cạnh biển, nơi mỗi buổi sáng bắt đầu bằng hơi thở và kết thúc bằng một tách trà.</p>
          <div className="my-row"><a className="my-btn" href="#buoi-dau">Đặt buổi học đầu</a><span className="my-breath" aria-hidden="true"><span className="my-breath__c" /><span className="my-breath__t">thở cùng mây</span></span></div>
        </div>
      </section>

      <section className="my-values">
        <div className="my-wrap my-values__grid">
          {[['Lớp nhỏ', 'Tối đa 12 người để giáo viên nhìn thấy từng tư thế.'], ['Gió biển', 'Phòng tập mở cửa ra hàng dừa, không dùng điều hoà buổi sáng.'], ['Trà sau lớp', 'Trà hoa cúc và một khoảng nghỉ không vội.']].map(([h, p], i) => (
            <div key={h} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}><span className="my-num">0{i + 1}</span><h3>{h}</h3><p>{p}</p></div>
          ))}
        </div>
      </section>

      <section className="my-sec" id="lop">
        <div className="my-wrap">
          <h2 data-rv>Ba nhịp <em>cho mọi cơ thể</em></h2>
          <div className="my-levels">
            {LEVELS.map((c, i) => (
              <article key={c.c} className={`my-level my-level--${c.tone}`} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                <span className="my-level__l">{c.l}</span><h3>{c.c}</h3><p>{c.d}</p><time>{c.t}</time>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="my-sec my-sec--sage" id="giao-vien">
        <div className="my-wrap">
          <h2 data-rv>Những người <em>giữ nhịp</em></h2>
          <div className="my-teachers">
            {TEACHERS.map((t, i) => (
              <article key={t.n} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                <div className={`my-portrait my-portrait--${i + 1}`} aria-hidden="true"><span>{t.n.split(' ').pop()![0]}</span></div>
                <h3>{t.n}</h3><p>{t.r}</p><small>{t.y}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="my-sec" id="the-tap">
        <div className="my-wrap">
          <h2 className="my-center" data-rv>Thẻ tập <em>nhẹ ví</em></h2>
          <div className="my-passes">
            {PASSES.map((p, i) => (
              <article key={p.n} className={p.hot ? 'is-hot' : ''} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}>
                {p.hot && <span className="my-pass__flag">Được chọn nhiều</span>}
                <h3>{p.n}</h3><b>{p.p}</b><p>{p.s}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="my-sec my-sec--sand" id="hoi-dap">
        <div className="my-wrap my-faq">
          <h2 data-rv>Bạn đang <em>băn khoăn?</em></h2>
          <div>{FAQ.map(([q, a], i) => <details key={q} data-rv open={i === 0} style={{ ['--d' as string]: `${i * 90}ms` }}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>

      <section className="my-cta" id="buoi-dau">
        <div className="my-wrap my-cta__card" data-rv>
          <div><h2>Buổi đầu <em>là quà</em></h2><p>Chọn một lớp bất kỳ trong tuần, studio giữ thảm và trà cho bạn.</p></div>
          <DemoForm className="my-form" done="Mây đã giữ chỗ minh hoạ cho bạn. Trên website thật, studio nhắn Zalo xác nhận ngay.">
            <input name="name" required placeholder="Tên của bạn" aria-label="Tên của bạn" />
            <input name="phone" required inputMode="tel" placeholder="Số điện thoại" aria-label="Số điện thoại" />
            <select name="class" aria-label="Lớp muốn thử" defaultValue="Hatha nền tảng">{LEVELS.map(l => <option key={l.c}>{l.c}</option>)}</select>
            <button className="my-btn" type="submit">Giữ chỗ buổi đầu</button>
          </DemoForm>
        </div>
      </section>
      <footer className="my-foot"><span className="my-logo"><span className="my-logo__dot" aria-hidden="true" />mây</span><p>Thương hiệu minh hoạ — mẫu giao diện do DANAVA thiết kế.</p></footer>
    </main>
  );
}
