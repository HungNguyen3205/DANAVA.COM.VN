/** Mẫu "Ember Athletic Club" — phòng gym, phong cách than hồng (app/demo/ember.css). */
import { DemoFx, DemoForm } from './fx';

const ZONES = [
  { k: '01', t: 'Sức mạnh', d: '12 giàn tạ Olympic, sàn cao su 4 cm, tạ đòn tới 220 kg.' },
  { k: '02', t: 'Cardio', d: '24 máy chạy, xe đạp gió và máy leo thang, màn hình theo nhịp tim.' },
  { k: '03', t: 'Functional', d: 'Khu HYROX 40 m: kéo xe trượt, ném bóng tường, chèo thuyền.' },
  { k: '04', t: 'Hồi phục', d: 'Xông hơi đá, bồn nước lạnh 8°C và phòng giãn cơ.' }
];
const CLASSES = [
  { at: '05:30', n: 'Đốt mỡ buổi sáng', c: 'Coach Vy', lv: 'Cường độ cao', left: 4 },
  { at: '07:00', n: 'Powerlifting căn bản', c: 'Coach Long', lv: 'Mọi trình độ', left: 9 },
  { at: '12:15', n: 'HIIT 30 phút trưa', c: 'Coach Minh', lv: 'Cường độ cao', left: 2 },
  { at: '17:45', n: 'HYROX Race Prep', c: 'Coach Vy', lv: 'Nâng cao', left: 6 },
  { at: '19:30', n: 'Boxing Conditioning', c: 'Coach Tài', lv: 'Mọi trình độ', left: 11 }
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

export function EmberDemo() {
  return (
    <main className="em">
      <DemoFx />
      <header className="em-nav">
        <a className="em-logo" href="#top"><span aria-hidden="true">▲</span>EMBER</a>
        <nav aria-label="Mục lục"><a href="#khu-tap">Khu tập</a><a href="#lich">Lịch lớp</a><a href="#goi">Gói tập</a><a href="#hlv">Huấn luyện viên</a></nav>
        <a className="em-btn em-btn--sm" href="#tap-thu">Tập thử 7 ngày</a>
      </header>

      <section className="em-hero" id="top">
        <div className="em-embers" aria-hidden="true">{Array.from({ length: 22 }).map((_, i) => <i key={i} style={{ ['--x' as string]: `${(i * 47) % 100}%`, ['--t' as string]: `${6 + (i % 5)}s`, ['--dl' as string]: `${(i * 0.7) % 6}s` }} />)}</div>
        <p className="em-ghost" aria-hidden="true">EMBER</p>
        <div className="em-hero__in">
          <p className="em-tag"><span /> Mở cửa 5:00 – 23:00 · Hải Châu, Đà Nẵng</p>
          <h1>ĐỐT<br /><span>GIỚI HẠN</span><br />CỦA BẠN</h1>
          <p className="em-lead">Câu lạc bộ sức mạnh và HYROX đầu tiên tại Đà Nẵng. 1.800 m² thiết bị chuẩn thi đấu, huấn luyện viên có chứng chỉ quốc tế.</p>
          <div className="em-row"><a className="em-btn" href="#tap-thu">Nhận 7 ngày tập thử</a><a className="em-btn em-btn--line" href="#goi">Xem gói tập</a></div>
        </div>
        <ul className="em-hero__nums">
          <li><b data-count="1800">0</b><span>m² khu tập</span></li>
          <li><b data-count="42">0</b><span>lớp mỗi tuần</span></li>
          <li><b data-count="2600">0</b><span>hội viên</span></li>
        </ul>
      </section>

      <div className="em-marquee" aria-hidden="true"><div>{Array.from({ length: 2 }).map((_, k) => <span key={k}>SỨC MẠNH ✦ KỶ LUẬT ✦ HYROX ✦ BOXING ✦ CARDIO ✦ HỒI PHỤC ✦ </span>)}</div></div>

      <section className="em-sec" id="khu-tap">
        <div className="em-wrap">
          <h2 data-rv>Bốn khu tập.<br /><span>Một mục tiêu.</span></h2>
          <div className="em-zones">
            {ZONES.map((z, i) => (
              <article key={z.k} data-rv style={{ ['--d' as string]: `${i * 90}ms` }}>
                <span className="em-zones__k">{z.k}</span><h3>{z.t}</h3><p>{z.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="em-sec em-sec--alt" id="lich">
        <div className="em-wrap em-split">
          <div data-rv><p className="em-kicker">Lịch lớp hôm nay</p><h2>Vào lớp.<br /><span>Ra mồ hôi.</span></h2><p className="em-muted">Đặt chỗ trên ứng dụng, check-in bằng QR. Lớp đầy sẽ tự mở danh sách chờ.</p></div>
          <ol className="em-sched">
            {CLASSES.map((c, i) => (
              <li key={c.at} data-rv style={{ ['--d' as string]: `${i * 70}ms` }}>
                <time>{c.at}</time>
                <div><b>{c.n}</b><span>{c.c} · {c.lv}</span></div>
                <em className={c.left <= 4 ? 'is-hot' : ''}>{c.left <= 4 ? `Còn ${c.left} chỗ` : `${c.left} chỗ trống`}</em>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="em-sec" id="goi">
        <div className="em-wrap">
          <h2 className="em-center" data-rv>Chọn vé <span>vào sân</span></h2>
          <div className="em-plans">
            {PLANS.map((p, i) => (
              <article key={p.n} className={`em-ticket${p.hot ? ' is-hot' : ''}`} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}>
                {p.hot && <span className="em-ticket__flag">Chọn nhiều nhất</span>}
                <div className="em-ticket__top"><p>{p.n}</p><b>{p.p}<small>{p.u}</small></b></div>
                <ul>{p.f.map(f => <li key={f}>{f}</li>)}</ul>
                <a className={`em-btn${p.hot ? '' : ' em-btn--line'}`} href="#tap-thu">Giữ vé này</a>
                <span className="em-ticket__code" aria-hidden="true">EMB-{2026 + i}-{String(4071 + i * 313)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="em-sec em-sec--alt" id="hlv">
        <div className="em-wrap">
          <h2 data-rv>Người <span>dẫn nhịp</span></h2>
          <div className="em-coaches">
            {COACHES.map((c, i) => (
              <article key={c.n} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}>
                <div className="em-coach__art" aria-hidden="true"><span>{c.n.split(' ').pop()![0]}</span></div>
                <h3>{c.n}</h3><p className="em-coach__r">{c.r}</p><p className="em-muted">{c.s}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="em-cta" id="tap-thu">
        <div className="em-wrap em-split">
          <div data-rv><h2>7 ngày.<br /><span>0 đồng.</span></h2><p className="em-muted">Tập mọi khu, vào mọi lớp, một buổi PT đánh giá thể lực. Không cần thẻ ngân hàng.</p></div>
          <DemoForm className="em-form">
            <input name="name" required placeholder="Họ và tên" aria-label="Họ và tên" />
            <input name="phone" required inputMode="tel" placeholder="Số điện thoại" aria-label="Số điện thoại" />
            <select name="goal" aria-label="Mục tiêu" defaultValue=""><option value="" disabled>Mục tiêu của bạn</option><option>Giảm mỡ</option><option>Tăng cơ</option><option>Thi HYROX</option><option>Khoẻ hơn mỗi ngày</option></select>
            <button className="em-btn" type="submit">Kích hoạt 7 ngày tập thử</button>
          </DemoForm>
        </div>
      </section>
      <footer className="em-foot"><span className="em-logo"><span aria-hidden="true">▲</span>EMBER</span><p>Thương hiệu minh hoạ — mẫu giao diện do DANAVA thiết kế.</p></footer>
    </main>
  );
}
