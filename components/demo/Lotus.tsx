/** Mẫu "Hoa Sen Spa" — spa & chăm sóc sắc đẹp, phong cách sen ngà (app/demo/lotus.css). Mọi chữ: txt.demo.lt.* (sửa + dịch). */
import { DemoFx, DemoForm } from './fx';
import { demoText } from './text';

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
  ['Một', 'Trà gừng mật ong', 'Đón bạn bằng tách trà ấm và khăn lạnh sả chanh.'],
  ['Hai', 'Ngâm chân thảo mộc', 'Muối hồng, lá bưởi và cánh hoa hồng Đà Lạt.'],
  ['Ba', 'Liệu trình chính', 'Kỹ thuật viên 5 năm kinh nghiệm, dầu ép lạnh hữu cơ.'],
  ['Bốn', 'Nghỉ trong vườn', 'Chè hạt sen, tiếng nước chảy và không có điện thoại.']
];
const VOICES = [
  ['Lần đầu tiên tôi ngủ quên trên giường spa. Mùi sả và tiếng nước làm mình nhẹ cả người.', 'Chị Minh Thư · Đà Nẵng'],
  ['Liệu trình đá nóng rất đáng tiền, kỹ thuật viên hỏi kỹ chỗ đau trước khi làm.', 'Anh Quốc Bảo · TP.HCM'],
  ['Không gian như một khu vườn cũ của bà ngoại. Sẽ quay lại cùng mẹ.', 'Chị Hà Linh · Hà Nội']
];
const PHILO = [['12', 'năm gìn giữ công thức'], ['36', 'loại thảo mộc tự trồng'], ['100', '% dầu ép lạnh hữu cơ']];
const SLOTS = ['09:30', '11:00', '14:00', '15:30', '17:00', '19:00'];

export function LotusDemo() {
  const { t, s, n } = demoText('lt', 'Hoa Sen Spa');
  const logo = <>{t('logo.name', 'Hoa Sen')}<small>{t('logo.sub', 'spa & retreat')}</small></>;
  return (
    <main className="lt">
      <DemoFx />
      <header className="lt-nav">
        <a className="lt-logo" href="#top">{logo}</a>
        <nav aria-label={s('nav.aria', 'Mục lục')}><a href="#triet-ly">{t('nav.0', 'Triết lý')}</a><a href="#lieu-trinh">{t('nav.1', 'Liệu trình')}</a><a href="#nghi-thuc">{t('nav.2', 'Nghi thức')}</a><a href="#dat-lich">{t('nav.3', 'Đặt lịch')}</a></nav>
      </header>

      <section className="lt-hero" id="top">
        <div className="lt-hero__text">
          <p className="lt-kicker">{t('hero.kicker', 'Spa thảo mộc · Hội An')}</p>
          <h1>{t('hero.title1', 'Chậm lại,')}<br /><em>{t('hero.title2', 'để được chăm')}</em><br />{t('hero.title3', 'như một đoá sen')}</h1>
          <p className="lt-lead">{t('hero.lead', 'Liệu trình từ thảo mộc vườn nhà, nước giếng cổ và đôi tay của những người thợ Hội An.', { multiline: true })}</p>
          <a className="lt-btn" href="#dat-lich">{t('hero.cta', 'Đặt lịch hẹn')}</a>
        </div>
        <div className="lt-hero__art">
          <div className="lt-arch"><div className="lt-arch__sun" /><LotusArt className="lt-lotus" /><div className="lt-arch__water" /></div>
          <span className="lt-sign">{t('hero.sign', 'Hoa Sen')}</span>
          <div className="lt-badge"><b>{t('hero.rating', '4.9')}</b><span className="lt-badge__txt"><i>★★★★★</i><br />{t('hero.reviews', '1.240 đánh giá')}</span></div>
        </div>
      </section>

      <section className="lt-philo" id="triet-ly">
        <div className="lt-wrap" data-rv>
          <p className="lt-quote">{t('philo.quote', '“Sắc đẹp không vội. Nó nở ra khi cơ thể được nghỉ ngơi đủ lâu.”', { multiline: true })}</p>
          <div className="lt-philo__row">
            {PHILO.map(([v, l], i) => <div key={i}><b>{n(`philo.${i}.n`, v)}</b><span>{t(`philo.${i}.label`, l)}</span></div>)}
          </div>
        </div>
      </section>

      <section className="lt-menu" id="lieu-trinh">
        <div className="lt-wrap lt-menu__grid">
          <div className="lt-menu__head" data-rv><p className="lt-kicker">{t('menu.kicker', 'Thực đơn liệu trình')}</p><h2>{t('menu.title1', 'Chọn như')} <em>{t('menu.title2', 'chọn trà')}</em></h2><p>{t('menu.lead', 'Giá đã gồm trà đón, khăn nóng và nghỉ trong vườn sau liệu trình.', { multiline: true })}</p></div>
          <div className="lt-menu__card">
            {MENU.map((m, i) => (
              <div key={i} className="lt-menu__group" data-rv style={{ ['--d' as string]: `${i * 100}ms` }}>
                <h3>{t(`menu.${i}.group`, m.g)}</h3>
                <ul>{m.items.map(([nm, tm, p], j) => <li key={j}><span className="lt-menu__n">{t(`menu.${i}.${j}.name`, nm)}<small>{t(`menu.${i}.${j}.time`, tm)}</small></span><span className="lt-menu__dots" aria-hidden="true" /><b>{t(`menu.${i}.${j}.price`, p)}</b></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lt-ritual" id="nghi-thuc">
        <div className="lt-wrap">
          <h2 className="lt-center" data-rv>{t('ritual.title1', 'Nghi thức')} <em>{t('ritual.title2', 'bốn bước')}</em></h2>
          <ol className="lt-ritual__list">
            {RITUAL.map(([no, h, p], i) => (
              <li key={i} data-rv style={{ ['--d' as string]: `${i * 110}ms` }}><span className="lt-ritual__no">{t(`ritual.${i}.no`, no)}</span><h3>{t(`ritual.${i}.title`, h)}</h3><p>{t(`ritual.${i}.text`, p, { multiline: true })}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lt-voice">
        <div className="lt-wrap lt-voice__grid">
          {VOICES.map(([q, nm], i) => (
            <figure key={i} data-rv style={{ ['--d' as string]: `${i * 100}ms` }}><blockquote>{t(`voice.${i}.quote`, q, { multiline: true })}</blockquote><figcaption>{t(`voice.${i}.name`, nm)}</figcaption></figure>
          ))}
        </div>
      </section>

      <section className="lt-book" id="dat-lich">
        <div className="lt-wrap lt-book__grid">
          <div data-rv><span className="lt-script">{t('book.script', 'Hẹn bạn')}</span><h2>{t('book.title1', 'Giữ một khoảng lặng')} <em>{t('book.title2', 'cho mình')}</em></h2><p>{t('book.lead', 'Mở cửa 9:00 – 21:00 mỗi ngày. Spa sẽ gọi xác nhận trong 10 phút.', { multiline: true })}</p></div>
          <DemoForm className="lt-form" done={s('form.done', 'Hoa Sen đã nhận lịch hẹn minh hoạ của bạn. Trên website thật, lễ tân sẽ gọi xác nhận ngay.')}>
            <label>{t('form.svc', 'Liệu trình')}<select name="svc">{MENU.flatMap((m, i) => m.items.map((it, j) => <option key={`${i}-${j}`}>{s(`menu.${i}.${j}.name`, it[0])}</option>))}</select></label>
            <fieldset><legend>{t('form.slot', 'Khung giờ')}</legend>
              <div className="lt-slots">{SLOTS.map((v, i) => <label key={v}><input type="radio" name="slot" value={v} defaultChecked={i === 2} /><span>{v}</span></label>)}</div>
            </fieldset>
            <div className="lt-form__row"><label>{t('form.name', 'Tên của bạn')}<input name="name" required /></label><label>{t('form.phone', 'Điện thoại')}<input name="phone" required inputMode="tel" /></label></div>
            <button className="lt-btn" type="submit">{t('form.submit', 'Xác nhận lịch hẹn')}</button>
          </DemoForm>
        </div>
      </section>
      <footer className="lt-foot"><span className="lt-logo">{logo}</span><p>{t('foot', 'Thương hiệu minh hoạ — mẫu giao diện do DANAVA thiết kế.')}</p></footer>
    </main>
  );
}
