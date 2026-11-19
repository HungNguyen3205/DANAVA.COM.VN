import { ArrowUpRight, Search, Armchair, QrCode, MapPinned, Smartphone, LayoutDashboard, Target, ShieldCheck, Store, User, Bus, Crown } from 'lucide-react';
import { ProductGallery } from './ProductGallery';
import { DANAVAGO, DANAVAGO_URL } from './product-showcase';

const FEATURE_ICONS = [Search, Armchair, QrCode, MapPinned, Smartphone, LayoutDashboard];
const GOAL_ICONS = [Target, Store, ShieldCheck];
const ROLE_ICONS = [User, Bus, Crown];

/** Giới thiệu nền tảng đặt vé xe DANAVA GO (danavago.com) trên trang Du lịch & Sự kiện. */
export function DanavaGoShowcase() {
  return (
    <>
      <section className="s-section s-go" id="danava-go" aria-labelledby="go-title">
        <div className="s-container">
          <div className="s-go__intro">
            <div>
              <p className="s-eyebrow">Sản phẩm của DANAVA · Đặt vé xe trực tuyến</p>
              <h2 className="s-h2" id="go-title">DANAVA GO: <span className="s-hl">đi một chuyến, mở ngàn trải nghiệm</span></h2>
              <p className="s-lead">
                Nền tảng đặt vé xe khách đa nhà xe: hành khách tìm chuyến, chọn ghế và nhận vé điện tử; nhà xe có website, app thương hiệu riêng và phần mềm quản lý chuyến, tổ lái, đội xe.
              </p>
              <div className="s-row s-go__cta">
                <a className="s-btn s-btn--primary s-btn--lg" href={DANAVAGO_URL} target="_blank" rel="noopener">
                  Truy cập danavago.com <ArrowUpRight aria-hidden="true" />
                </a>
                <a className="s-btn s-btn--secondary s-btn--lg" href="#go-giao-dien">Xem giao diện</a>
              </div>
            </div>
            <a className="s-go__hero" href={DANAVAGO_URL} target="_blank" rel="noopener" aria-label="Mở danavago.com trong tab mới">
              <span className="s-shot__bar" aria-hidden="true"><i /><i /><i /><b>danavago.com</b></span>
              <img src="/assets/danavago/home.webp" alt="Trang chủ danavago.com: tìm chuyến xe Đà Nẵng đi Hội An" loading="lazy" />
            </a>
          </div>

          {/* Mục tiêu */}
          <div className="s-go__block">
            <p className="s-eyebrow">Mục tiêu</p>
            <h3 className="s-h3">Vì sao DANAVA xây dựng DANAVA GO</h3>
            <div className="s-grid s-grid--3 s-go__goals">
              {DANAVAGO.goals.map((g, i) => {
                const Icon = GOAL_ICONS[i];
                return (
                  <div key={g.title} className="s-card s-card--pad s-go__goal">
                    <span className="s-icon" aria-hidden="true"><Icon /></span>
                    <h4 className="s-h4">{g.title}</h4>
                    <p className="s-text">{g.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tính năng */}
          <div className="s-go__block">
            <p className="s-eyebrow">Tính năng</p>
            <h3 className="s-h3">Từ tìm chuyến đến lúc xuống xe</h3>
            <div className="s-grid s-grid--3 s-go__features">
              {DANAVAGO.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <div key={f.title} className="s-go__feature">
                    <span className="s-go__ficon" aria-hidden="true"><Icon /></span>
                    <div>
                      <h4 className="s-h4">{f.title}</h4>
                      <p className="s-text">{f.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <ul className="s-go__roles" aria-label="Một app, ba vai trò">
              {DANAVAGO.roles.map((r, i) => {
                const Icon = ROLE_ICONS[i];
                return (
                  <li key={r.title}>
                    <Icon aria-hidden="true" />
                    <span><strong>{r.title}</strong>{r.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Giao diện */}
      <section className="s-section s-section--soft" id="go-giao-dien" aria-labelledby="go-ui-title">
        <div className="s-container">
          <div className="s-heading">
            <p className="s-eyebrow">Giao diện</p>
            <h2 className="s-h2" id="go-ui-title">Website và app DANAVA GO</h2>
            <p className="s-lead">Bấm vào ảnh để xem lớn. Trải nghiệm trực tiếp tại <a className="s-textlink" href={DANAVAGO_URL} target="_blank" rel="noopener">danavago.com</a>.</p>
          </div>
          <ProductGallery groups={DANAVAGO.gallery} idPrefix="go" />
        </div>
      </section>
    </>
  );
}
