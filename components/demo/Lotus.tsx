/** Mẫu "Hoa Sen Spa" — spa & chăm sóc sắc đẹp, phong cách sen ngà (app/demo/lotus.css). */
import { DemoFx, DemoForm } from './fx';

function LotusArt({ className }: { className?: string }) {
  // Hoa sen vẽ tay bằng SVG: 7 cánh xoay quanh tâm, viền mảnh đất nung
  const petals = [-66, -44, -22, 0, 22, 44, 66];
  return (
    <svg className={className} viewBox="0 0 400 300" aria-hidden="true">
      <defs><linearGradient id="lt-petal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#e9b99c" /><stop offset="1" stopColor="#fbeee4" /></linearGradient></defs>
      {petals.map((a, i) => (
        <path key={a} className="lt-petal" style={{ ['--i' as string]: i }} transform={`rotate(${a} 200 250)`} d="M200 250 C168 200 170 120 200 70 C230 120 232 200 200 250Z" fill="url(#lt-petal)" stroke="#b5643c" strokeWidth="1.1" opacity={1 - Math.abs(a) / 160} />
      ))}
      <path d="M90 262 C150 240 250 240 310 262" fill="none" stroke="#b5643c" strokeWidth="1.1" />
      <path d="M60 276 C150 256 250 256 340 276" fill="none" stroke="#b5643c" strokeWidth=".8" opacity=".6" />
    </svg>
  );
}

const MENU = [
  { g: 'Trị liệu cơ thể', items: [['Đá nóng núi lửa', '90 phút', '890K'], ['Thảo mộc Huế xông túi', '75 phút', '720K'], ['Massage Thuỵ Điển', '60 phút', '560K']] },
  { g: 'Chăm sóc da mặt', items: [['Sen trắng cấp ẩm', '60 phút', '650K'], ['Vàng 24K trẻ hoá', '75 phút', '1.250K'], ['Làm dịu da sau nắng', '45 phút', '480K']] },
  { g: 'Nghi thức trọn gói', items: [['Nửa ngày an yên', '3 giờ', '1.990K'], ['Cặp đôi dưới trăng', '2 giờ', '2.400K']] }
];
const RITUAL = [
  ['Trà gừng mật ong', 'Đón bạn bằng tách trà ấm và khăn lạnh sả chanh.'],
  ['Ngâm chân thảo mộc', 'Muối hồng, lá bưởi và cánh hoa hồng Đà Lạt.'],
  ['Liệu trình chính', 'Kỹ thuật viên 5 năm kinh nghiệm, dầu ép lạnh hữu cơ.'],
  ['Nghỉ trong vườn', 'Chè hạt sen, tiếng nước chảy và không có điện thoại.']
];

export function LotusDemo() {
  return (
    <main className="lt">
      <DemoFx />
      <header className="lt-nav">
        <a className="lt-logo" href="#top">Hoa Sen<small>spa & retreat</small></a>
        <nav aria-label="Mục lục"><a href="#triet-ly">Triết lý</a><a href="#lieu-trinh">Liệu trình</a><a href="#nghi-thuc">Nghi thức</a><a href="#dat-lich">Đặt lịch</a></nav>
      </header>

      <section className="lt-hero" id="top">
        <div className="lt-hero__text">
          <p className="lt-kicker">Spa thảo mộc · Hội An</p>
          <h1>Chậm lại,<br /><em>để được chăm</em><br />như một đoá sen</h1>
          <p className="lt-lead">Liệu trình từ thảo mộc vườn nhà, nước giếng cổ và đôi tay của những người thợ Hội An.</p>
          <a className="lt-btn" href="#dat-lich">Đặt lịch hẹn</a>
        </div>
        <div className="lt-hero__art">
          <div className="lt-arch"><div className="lt-arch__sun" /><LotusArt className="lt-lotus" /><div className="lt-arch__water" /></div>
          <span className="lt-sign">Hoa Sen</span>
          <div className="lt-badge"><b>4.9</b><span>★★★★★<br />1.240 đánh giá</span></div>
        </div>
      </section>

      <section className="lt-philo" id="triet-ly">
        <div className="lt-wrap" data-rv>
          <p className="lt-quote">“Sắc đẹp không vội. Nó nở ra khi cơ thể được nghỉ ngơi đủ lâu.”</p>
          <div className="lt-philo__row">
            <div><b data-count="12">0</b><span>năm gìn giữ công thức</span></div>
            <div><b data-count="36">0</b><span>loại thảo mộc tự trồng</span></div>
            <div><b data-count="100">0</b><span>% dầu ép lạnh hữu cơ</span></div>
          </div>
        </div>
      </section>

      <section className="lt-menu" id="lieu-trinh">
        <div className="lt-wrap lt-menu__grid">
          <div className="lt-menu__head" data-rv><p className="lt-kicker">Thực đơn liệu trình</p><h2>Chọn như <em>chọn trà</em></h2><p>Giá đã gồm trà đón, khăn nóng và nghỉ trong vườn sau liệu trình.</p></div>
          <div className="lt-menu__card">
            {MENU.map((m, i) => (
              <div key={m.g} className="lt-menu__group" data-rv style={{ ['--d' as string]: `${i * 100}ms` }}>
                <h3>{m.g}</h3>
                <ul>{m.items.map(([n, t, p]) => <li key={n}><span className="lt-menu__n">{n}<small>{t}</small></span><span className="lt-menu__dots" aria-hidden="true" /><b>{p}</b></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lt-ritual" id="nghi-thuc">
        <div className="lt-wrap">
          <h2 className="lt-center" data-rv>Nghi thức <em>bốn bước</em></h2>
          <ol className="lt-ritual__list">
            {RITUAL.map(([h, p], i) => (
              <li key={h} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}><span className="lt-ritual__no">{['Một', 'Hai', 'Ba', 'Bốn'][i]}</span><h3>{h}</h3><p>{p}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lt-voice">
        <div className="lt-wrap lt-voice__grid">
          {[['Lần đầu tiên tôi ngủ quên trên giường spa. Mùi sả và tiếng nước làm mình nhẹ cả người.', 'Chị Minh Thư · Đà Nẵng'], ['Liệu trình đá nóng rất đáng tiền, kỹ thuật viên hỏi kỹ chỗ đau trước khi làm.', 'Anh Quốc Bảo · TP.HCM'], ['Không gian như một khu vườn cũ của bà ngoại. Sẽ quay lại cùng mẹ.', 'Chị Hà Linh · Hà Nội']].map(([q, n], i) => (
            <figure key={n} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}><blockquote>{q}</blockquote><figcaption>{n}</figcaption></figure>
          ))}
        </div>
      </section>

      <section className="lt-book" id="dat-lich">
        <div className="lt-wrap lt-book__grid">
          <div data-rv><span className="lt-script">Hẹn bạn</span><h2>Giữ một khoảng lặng <em>cho mình</em></h2><p>Mở cửa 9:00 – 21:00 mỗi ngày. Spa sẽ gọi xác nhận trong 10 phút.</p></div>
          <DemoForm className="lt-form" done="Hoa Sen đã nhận lịch hẹn minh hoạ của bạn. Trên website thật, lễ tân sẽ gọi xác nhận ngay.">
            <label>Liệu trình<select name="svc" defaultValue="Đá nóng núi lửa">{MENU.flatMap(m => m.items.map(i => <option key={i[0]}>{i[0]}</option>))}</select></label>
            <fieldset><legend>Khung giờ</legend>
              <div className="lt-slots">{['09:30', '11:00', '14:00', '15:30', '17:00', '19:00'].map((s, i) => <label key={s}><input type="radio" name="slot" value={s} defaultChecked={i === 2} /><span>{s}</span></label>)}</div>
            </fieldset>
            <div className="lt-form__row"><label>Tên của bạn<input name="name" required /></label><label>Điện thoại<input name="phone" required inputMode="tel" /></label></div>
            <button className="lt-btn" type="submit">Xác nhận lịch hẹn</button>
          </DemoForm>
        </div>
      </section>
      <footer className="lt-foot"><span className="lt-logo">Hoa Sen<small>spa & retreat</small></span><p>Thương hiệu minh hoạ — mẫu giao diện do DANAVA thiết kế.</p></footer>
    </main>
  );
}
