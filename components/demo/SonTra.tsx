/**
 * Mẫu "Sơn Trà Residences" — bất động sản nghỉ dưỡng, phong cách rêu & vàng ánh kim (app/demo/son-tra.css).
 * Phong cảnh màn mở đầu vẽ bằng SVG nhiều lớp (trời hoàng hôn, núi, biển, sương) — không cần ảnh chụp.
 */
import { DemoFx, DemoForm } from './fx';

const ZONES = [
  { no: 'I', name: 'Đồi Thông', kind: 'Biệt thự đồi', area: '320 – 480 m²', from: '18,6 tỷ', text: 'Lưng tựa rừng thông, mặt nhìn vịnh. Mỗi căn một khu vườn riêng và hồ bơi tràn bờ.' },
  { no: 'II', name: 'Bãi Bụt', kind: 'Villa mặt biển', area: '260 – 360 m²', from: '24,2 tỷ', text: 'Bước chân ra cát trắng. Hiên gỗ tếch, phòng ngủ mở về hướng bình minh.' },
  { no: 'III', name: 'Bán Đảo', kind: 'Căn hộ trên mây', area: '86 – 168 m²', from: '6,9 tỷ', text: 'Tầng cao nhìn trọn ba mặt nước, sảnh đón kiểu khách sạn năm sao.' }
];
const DAY = [
  { t: '05:40', h: 'Bình minh trên vịnh', p: 'Cà phê trên hiên, mặt trời lên từ đường chân trời Biển Đông.' },
  { t: '09:00', h: 'Đường mòn rừng', p: '1,8 km đường đi bộ dưới tán rừng nguyên sinh, có voọc chà vá chân nâu.' },
  { t: '16:30', h: 'Câu lạc bộ bãi biển', p: 'Chèo SUP, lặn ngắm san hô, bữa tối hải sản ngay mép sóng.' },
  { t: '20:00', h: 'Đêm trên đồi', p: 'Ánh đèn Đà Nẵng phía xa, bầu trời đủ tối để thấy dải Ngân Hà.' }
];
const AMEN = ['Bến du thuyền riêng', 'Spa trị liệu thảo mộc', 'Sân golf 9 lỗ', 'Trường mầm non song ngữ', 'Hồ bơi vô cực 120 m', 'Nhà hàng trên vách đá'];

function Landscape() {
  return (
    <svg className="st-land" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1f1b" /><stop offset=".45" stopColor="#3d4a3a" /><stop offset=".72" stopColor="#c99a5b" /><stop offset="1" stopColor="#f1d3a0" /></linearGradient>
        <radialGradient id="st-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff3d6" /><stop offset=".35" stopColor="#ffd58f" stopOpacity=".9" /><stop offset="1" stopColor="#ffb860" stopOpacity="0" /></radialGradient>
        <linearGradient id="st-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9b27a" /><stop offset=".25" stopColor="#4f6a5c" /><stop offset="1" stopColor="#0d241f" /></linearGradient>
        <linearGradient id="st-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3ead7" stopOpacity="0" /><stop offset="1" stopColor="#f3ead7" stopOpacity=".35" /></linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#st-sky)" />
      <circle className="st-sunglow" cx="980" cy="560" r="260" fill="url(#st-sun)" />
      <circle cx="980" cy="560" r="58" fill="#fff1cf" opacity=".95" />
      <path d="M0 520 C160 470 260 430 380 450 C520 474 600 400 720 410 C850 420 900 480 1040 470 C1180 460 1280 420 1440 440 L1440 900 L0 900Z" fill="#5c6a52" opacity=".55" />
      <path d="M0 580 C120 540 230 470 360 500 C470 525 540 590 660 570 C760 552 820 500 920 520 C1020 540 1080 600 1200 590 C1300 582 1380 560 1440 570 L1440 900 L0 900Z" fill="#2e4237" opacity=".85" />
      <rect y="600" width="1440" height="300" fill="url(#st-sea)" />
      <g className="st-glints" fill="#ffe2a8">
        {Array.from({ length: 26 }).map((_, i) => <rect key={i} x={860 + ((i * 37) % 240)} y={612 + i * 9} width={40 + ((i * 13) % 70)} height="1.6" rx=".8" opacity={0.75 - i * 0.025} />)}
      </g>
      <path d="M0 640 C140 600 220 560 330 590 C420 614 470 700 560 720 C620 734 640 900 640 900 L0 900Z" fill="#0f2a24" />
      <path d="M1440 610 C1330 590 1250 640 1190 700 C1140 750 1120 900 1120 900 L1440 900Z" fill="#0c221d" />
      <rect y="560" width="1440" height="200" fill="url(#st-mist)" className="st-mistband" />
    </svg>
  );
}

export function SonTraDemo() {
  return (
    <main className="st">
      <DemoFx />
      <header className="st-nav">
        <a className="st-logo" href="#top"><span>Sơn Trà</span><small>Residences</small></a>
        <nav aria-label="Mục lục"><a href="#cau-chuyen">Câu chuyện</a><a href="#phan-khu">Phân khu</a><a href="#tien-ich">Tiện ích</a><a href="#chinh-sach">Chính sách</a></nav>
        <a className="st-btn st-btn--ghost" href="#giu-cho">Giữ chỗ</a>
      </header>

      <section className="st-hero" id="top">
        <Landscape />
        <div className="st-hero__in">
          <p className="st-kicker">Bán đảo Sơn Trà · Đà Nẵng</p>
          <h1><span className="st-script">Nơi mây</span><span className="st-display">chạm biển</span></h1>
          <p className="st-lead">168 dinh thự giữa rừng nguyên sinh và vịnh biển riêng. Chỉ một con đường dẫn vào, và một lý do để ở lại.</p>
          <div className="st-row"><a className="st-btn" href="#giu-cho">Nhận bảng giá riêng</a><a className="st-link" href="#cau-chuyen">Khám phá dự án ↓</a></div>
        </div>
        <div className="st-hero__stats">
          <div><b data-count="68">0</b><span>ha rừng & biển</span></div>
          <div><b data-count="1.2">0</b><span>km bãi cát riêng</span></div>
          <div><b data-count="168">0</b><span>dinh thự giới hạn</span></div>
          <div><b data-count="15">0</b><span>phút tới sân bay</span></div>
        </div>
      </section>

      <section className="st-story" id="cau-chuyen">
        <div className="st-wrap st-story__grid">
          <div data-rv className="st-story__head">
            <p className="st-kicker">Một ngày ở Sơn Trà</p>
            <h2>Thời gian ở đây <em>chậm lại</em> một nhịp.</h2>
            <p>Không phải để trốn đi đâu, mà để quay về với nhịp sống đúng nghĩa: thức dậy cùng mặt trời, đi ngủ khi nghe tiếng sóng.</p>
          </div>
          <ol className="st-day">
            {DAY.map((d, i) => (
              <li key={d.t} data-rv style={{ ['--d' as string]: `${i * 90}ms` }}>
                <time>{d.t}</time><div><h3>{d.h}</h3><p>{d.p}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="st-zones" id="phan-khu">
        <div className="st-wrap">
          <div className="st-center" data-rv><p className="st-kicker">Ba phân khu</p><h2>Chọn khung cảnh <em>của riêng bạn</em></h2></div>
          <div className="st-zones__grid">
            {ZONES.map((z, i) => (
              <article key={z.no} className={`st-zone st-zone--${i + 1}`} data-rv style={{ ['--d' as string]: `${i * 120}ms` }}>
                <div className="st-zone__art" aria-hidden="true"><span className="st-zone__no">{z.no}</span></div>
                <div className="st-zone__body">
                  <p className="st-zone__kind">{z.kind}</p>
                  <h3>{z.name}</h3>
                  <p>{z.text}</p>
                  <dl><div><dt>Diện tích</dt><dd>{z.area}</dd></div><div><dt>Giá từ</dt><dd>{z.from}</dd></div></dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="st-amen" id="tien-ich">
        <div className="st-wrap st-amen__grid">
          <h2 data-rv>Mọi tiện ích <span className="st-script">trong tầm tay</span></h2>
          <ul>{AMEN.map((a, i) => <li key={a} data-rv style={{ ['--d' as string]: `${i * 70}ms` }}><span>0{i + 1}</span>{a}</li>)}</ul>
        </div>
      </section>

      <section className="st-policy" id="chinh-sach">
        <div className="st-wrap">
          <div className="st-policy__card" data-rv>
            <p className="st-kicker">Chính sách tháng 12</p>
            <h2>Thanh toán <em>30%</em> nhận nhà, ân hạn gốc 36 tháng</h2>
            <div className="st-policy__row">
              <div><b>8%</b><span>chiết khấu thanh toán sớm</span></div>
              <div><b>0%</b><span>lãi suất 24 tháng đầu</span></div>
              <div><b>2 năm</b><span>miễn phí quản lý</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="st-book" id="giu-cho">
        <div className="st-wrap st-book__grid">
          <div data-rv>
            <span className="st-script st-book__script">Thư mời</span>
            <h2>Tham quan nhà mẫu cùng chuyên viên</h2>
            <p>Đón tận nơi tại Đà Nẵng, trải nghiệm một đêm nghỉ dưỡng và nhận bảng giá từng căn theo hướng view.</p>
          </div>
          <DemoForm className="st-letter">
            <span className="st-letter__seal" aria-hidden="true">ST</span>
            <label>Họ và tên<input name="name" required placeholder="Nguyễn Minh Anh" /></label>
            <label>Số điện thoại<input name="phone" required inputMode="tel" placeholder="09xx xxx xxx" /></label>
            <label>Phân khu quan tâm<select name="zone" defaultValue="Đồi Thông">{ZONES.map(z => <option key={z.name}>{z.name}</option>)}</select></label>
            <button className="st-btn" type="submit">Giữ lịch tham quan</button>
          </DemoForm>
        </div>
      </section>
      <footer className="st-foot"><span className="st-logo"><span>Sơn Trà</span><small>Residences</small></span><p>Dự án minh hoạ — mẫu giao diện do DANAVA thiết kế.</p></footer>
    </main>
  );
}
