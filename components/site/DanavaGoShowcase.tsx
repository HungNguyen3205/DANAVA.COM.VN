import { ArrowUpRight, Search, Armchair, QrCode, MapPinned, Smartphone, LayoutDashboard, Target, ShieldCheck, Store, User, Bus, Crown } from 'lucide-react';
import { ProductGallery } from './ProductGallery';
import { DANAVAGO, DANAVAGO_URL } from './product-showcase';
import type { SiteData } from '@/lib/content';
import { ct } from './cms';
import { rich } from './rich';

const FEATURE_ICONS = [Search, Armchair, QrCode, MapPinned, Smartphone, LayoutDashboard];
const GOAL_ICONS = [Target, Store, ShieldCheck];
const ROLE_ICONS = [User, Bus, Crown];

/**
 * Giới thiệu nền tảng đặt vé xe DANAVA GO (danavago.com) trên trang Du lịch & Sự kiện.
 * Chữ sửa trực tiếp được (khóa goshow.*). Không truyền data → chữ của yêu cầu hiện tại (lib/request-texts.ts).
 */
export function DanavaGoShowcase({ data = null }: { data?: SiteData | null } = {}) {
  const P = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => {
    const x = ct(data, `goshow.${k}`, def, label, opts);
    return { ...x.a, children: opts.rich ? rich(x.v, 's-hl') : x.v };
  };
  return (
    <>
      <section className="s-section s-go" id="danava-go" aria-labelledby="go-title">
        <div className="s-container">
          <div className="s-go__intro">
            <div>
              <p className="s-eyebrow" {...P('eyebrow', 'Sản phẩm của DANAVA · Đặt vé xe trực tuyến', 'Dòng chữ nhỏ')} />
              <h2 className="s-h2" id="go-title" {...P('title', 'DANAVA GO: *đi một chuyến, mở ngàn trải nghiệm*', 'Tiêu đề', { rich: true })} />
              <p className="s-lead" {...P('lead', 'Nền tảng đặt vé xe khách đa nhà xe: hành khách tìm chuyến, chọn ghế và nhận vé điện tử; nhà xe có website, app thương hiệu riêng và phần mềm quản lý chuyến, tổ lái, đội xe.', 'Mô tả', { multiline: true })} />
              <div className="s-row s-go__cta">
                <a className="s-btn s-btn--primary s-btn--lg" href={DANAVAGO_URL} target="_blank" rel="noopener">
                  <span {...P('visit', 'Truy cập danavago.com', 'Nút truy cập')} /> <ArrowUpRight aria-hidden="true" />
                </a>
                <a className="s-btn s-btn--secondary s-btn--lg" href="#go-giao-dien"><span {...P('ui-button', 'Xem giao diện', 'Nút xem giao diện')} /></a>
              </div>
            </div>
            <a className="s-go__hero" href={DANAVAGO_URL} target="_blank" rel="noopener" aria-label="Mở danavago.com trong tab mới">
              <span className="s-shot__bar" aria-hidden="true"><i /><i /><i /><b>danavago.com</b></span>
              <img src="/assets/danavago/home.webp" alt="Trang chủ danavago.com: tìm chuyến xe Đà Nẵng đi Hội An" loading="lazy" />
            </a>
          </div>

          {/* Mục tiêu */}
          <div className="s-go__block">
            <p className="s-eyebrow" {...P('goals.eyebrow', 'Mục tiêu', 'Dòng chữ nhỏ')} />
            <h3 className="s-h3" {...P('goals.title', 'Vì sao DANAVA xây dựng DANAVA GO', 'Tiêu đề')} />
            <div className="s-grid s-grid--3 s-go__goals">
              {DANAVAGO.goals.map((g, i) => {
                const Icon = GOAL_ICONS[i];
                return (
                  <div key={g.title} className="s-card s-card--pad s-go__goal">
                    <span className="s-icon" aria-hidden="true"><Icon /></span>
                    <h4 className="s-h4" {...P(`goals.${i}.title`, g.title, 'Tên mục tiêu')} />
                    <p className="s-text" {...P(`goals.${i}.text`, g.text, 'Mô tả mục tiêu', { multiline: true })} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tính năng */}
          <div className="s-go__block">
            <p className="s-eyebrow" {...P('features.eyebrow', 'Tính năng', 'Dòng chữ nhỏ')} />
            <h3 className="s-h3" {...P('features.title', 'Từ tìm chuyến đến lúc xuống xe', 'Tiêu đề')} />
            <div className="s-grid s-grid--3 s-go__features">
              {DANAVAGO.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <div key={f.title} className="s-go__feature">
                    <span className="s-go__ficon" aria-hidden="true"><Icon /></span>
                    <div>
                      <h4 className="s-h4" {...P(`features.${i}.title`, f.title, 'Tên tính năng')} />
                      <p className="s-text" {...P(`features.${i}.text`, f.text, 'Mô tả tính năng', { multiline: true })} />
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
                    <span><strong {...P(`roles.${i}.title`, r.title, 'Tên vai trò')} /><span {...P(`roles.${i}.text`, r.text, 'Mô tả vai trò', { multiline: true })} /></span>
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
            <p className="s-eyebrow" {...P('ui.eyebrow', 'Giao diện', 'Dòng chữ nhỏ')} />
            <h2 className="s-h2" id="go-ui-title" {...P('ui.title', 'Website và app DANAVA GO', 'Tiêu đề')} />
            <p className="s-lead"><span {...P('ui.lead', 'Bấm vào ảnh để xem lớn. Trải nghiệm trực tiếp tại', 'Mô tả')} /> <a className="s-textlink" href={DANAVAGO_URL} target="_blank" rel="noopener">danavago.com</a>.</p>
          </div>
          <ProductGallery groups={DANAVAGO.gallery} idPrefix="go" />
        </div>
      </section>
    </>
  );
}
