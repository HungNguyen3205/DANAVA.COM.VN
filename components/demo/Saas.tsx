/**
 * Mẫu "phần mềm SaaS" — dùng sản phẩm thật DANAVA Studio (ảnh giao diện public/assets/studio, bảng giá lib/products.ts → HELLO.plans).
 * Phong cách lưới chàm (app/demo/saas.css).
 */
import { HELLO } from '@/lib/products';
import { DemoFx, DemoForm } from './fx';

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

export function SaasDemo() {
  return (
    <main className="sa">
      <DemoFx />
      <header className="sa-nav">
        <a className="sa-logo" href="#top"><span aria-hidden="true" />DANAVA Studio</a>
        <nav aria-label="Mục lục"><a href="#tinh-nang">Tính năng</a><a href="#truoc-sau">Trước & sau</a><a href="#bang-gia">Bảng giá</a><a href="#hoi-dap">Hỏi đáp</a></nav>
        <a className="sa-btn sa-btn--sm" href="#dung-thu">Dùng thử miễn phí</a>
      </header>

      <section className="sa-hero" id="top">
        <div className="sa-hero__text">
          <p className="sa-pill"><b>Mới</b> Check-in khuôn mặt cho mọi gói Pro trở lên →</p>
          <h1>Vận hành phòng tập<br /><span>không cần sổ tay.</span></h1>
          <p className="sa-lead">Phần mềm quản lý Gym, Yoga, Pilates, bể bơi và Spa: hội viên, gói tập, lịch lớp, bán hàng và báo cáo trong một nơi.</p>
          <div className="sa-row"><a className="sa-btn" href="#dung-thu">Bắt đầu miễn phí</a><a className="sa-btn sa-btn--ghost" href="#tinh-nang">Xem tính năng</a></div>
        </div>
        <div className="sa-stage" aria-hidden="true">
          <img className="sa-stage__main" src="/assets/studio/dashboard.webp" alt="" width={1280} height={800} />
          <img className="sa-stage__phone" src="/assets/studio/app-10-checkin.webp" alt="" width={430} height={925} />
          <div className="sa-chip sa-chip--1"><b>+18%</b><span>tỉ lệ gia hạn</span></div>
          <div className="sa-chip sa-chip--2"><i />Hội viên vừa check-in</div>
        </div>
      </section>

      <section className="sa-stats">
        <div className="sa-wrap sa-stats__row">
          {[['5', 'mô hình: Gym, Yoga, Pilates, bể bơi, Spa'], ['40', 'module nghiệp vụ'], ['15', 'phút để lễ tân dùng thạo'], ['24', 'giờ hỗ trợ qua Zalo']].map(([n, t]) => (
            <div key={t} data-rv><b data-count={n}>0</b><span>{t}</span></div>
          ))}
        </div>
      </section>

      <section className="sa-sec" id="tinh-nang">
        <div className="sa-wrap">
          <div className="sa-head" data-rv><p className="sa-kicker">Tính năng</p><h2>Mọi việc ở quầy lễ tân,<br /><span>gói trong một màn hình.</span></h2></div>
          <div className="sa-bento">
            {BENTO.map((b, i) => (
              <article key={b.t} className={`sa-tile sa-tile--${b.k}`} data-rv style={{ ['--d' as string]: `${i * 80}ms` }}>
                <div><h3>{b.t}</h3><p>{b.d}</p></div>
                <div className="sa-tile__shot"><img src={b.img} alt={b.t} loading="lazy" decoding="async" /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sa-sec sa-sec--ink" id="truoc-sau">
        <div className="sa-wrap">
          <div className="sa-head" data-rv><p className="sa-kicker">Trước & sau</p><h2>Cùng một phòng tập,<br /><span>hai cách làm việc.</span></h2></div>
          <div className="sa-vs">
            <div className="sa-vs__col sa-vs__col--before" data-rv><h3>Trước</h3><ul>{BEFORE.map(x => <li key={x}>{x}</li>)}</ul></div>
            <div className="sa-vs__col sa-vs__col--after" data-rv style={{ ['--d' as string]: '120ms' }}><h3>Với DANAVA Studio</h3><ul>{AFTER.map(x => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </div>
      </section>

      <section className="sa-sec" id="bang-gia">
        <div className="sa-wrap">
          <div className="sa-head sa-head--c" data-rv><p className="sa-kicker">Bảng giá</p><h2>Trả theo năm,<br /><span>lớn lên cùng phòng tập.</span></h2></div>
          <div className="sa-plans">
            {HELLO.plans.map((p, i) => (
              <article key={p.name} className={p.highlight ? 'is-hot' : ''} data-rv style={{ ['--d' as string]: `${i * 80}ms` }}>
                {p.highlight && <span className="sa-plan__flag">Phổ biến</span>}
                <h3>{p.name}</h3><p className="sa-plan__d">{p.desc}</p>
                <b>{p.price}</b><small>{p.perMonth || 'Trọn đời'}</small>
                <ul><li>{p.members} hội viên</li><li>{p.staff} nhân viên</li><li>{p.branches} chi nhánh</li>{p.perks.slice(0, 3).map(x => <li key={x}>{x}</li>)}</ul>
                <a className={`sa-btn${p.highlight ? '' : ' sa-btn--ghost'}`} href="#dung-thu">Chọn {p.name}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sa-sec sa-sec--soft" id="hoi-dap">
        <div className="sa-wrap sa-faq">
          <div data-rv><p className="sa-kicker">Hỏi đáp</p><h2>Câu hỏi <span>hay gặp</span></h2></div>
          <div>{FAQ.map(([q, a], i) => <details key={q} open={i === 0} data-rv><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>

      <section className="sa-cta" id="dung-thu">
        <div className="sa-wrap sa-cta__card" data-rv>
          <div><h2>Mở tài khoản<br /><span>trong 2 phút.</span></h2><p>Miễn phí cho phòng tập dưới 50 hội viên. Không cần thẻ ngân hàng.</p></div>
          <DemoForm className="sa-form">
            <input name="gym" required placeholder="Tên phòng tập" aria-label="Tên phòng tập" />
            <input name="phone" required inputMode="tel" placeholder="Số điện thoại" aria-label="Số điện thoại" />
            <select name="model" aria-label="Mô hình" defaultValue="Gym">{HELLO.models.map(m => <option key={m}>{m}</option>)}</select>
            <button className="sa-btn" type="submit">Tạo tài khoản miễn phí</button>
          </DemoForm>
        </div>
      </section>
      <footer className="sa-foot"><span className="sa-logo"><span aria-hidden="true" />DANAVA Studio</span><p>Mẫu landing page SaaS — giao diện và bảng giá thật của DANAVA Studio.</p></footer>
    </main>
  );
}
