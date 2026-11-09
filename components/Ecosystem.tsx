'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSite } from './SiteStore';
import { defaultPresentation } from '@/lib/presentation';
import {
  initialEcosystemUnits,
  ECOSYSTEM_CATEGORIES,
  type EcosystemCategory,
  type EcosystemUnit
} from '@/lib/ecosystem';

/* ==========================================================================
   DANAVA ECOSYSTEM PAGE — TRANG HỆ SINH THÁI TOÀN DIỆN (/he-sinh-thai)
   Yêu cầu:
   - Bố trí 4 nhóm: Sản phẩm số, Truyền thông, Du lịch & Sự kiện, Cộng đồng
   - Mỗi card có tên, đối tượng phục vụ, mô tả và link chính thức
   - Studio có lối đến trang sản phẩm (/giai-phap/danava-studio/)
   - Yoga Club Vietnam có lối đến kênh đã duyệt (/giai-phap/cong-dong/)
   - Kiểm tra URL, trạng thái hiển thị (visible: true) và dữ liệu rỗng (Empty state)
   - Tối ưu mobile, touch target >= 44px, semantic color tokens
   ========================================================================== */

export function EcosystemPage() {
  const { data } = useSite();
  const [activeCategory, setActiveCategory] = useState<'all' | EcosystemCategory>('all');

  // 1. Chỉ lấy các đơn vị có trạng thái hiển thị công khai (visible: true)
  const publicUnits = useMemo(() => {
    return initialEcosystemUnits.filter(unit => unit.visible);
  }, []);

  // 2. Thống kê số lượng theo từng nhóm danh mục
  const counts = useMemo(() => {
    const map: Record<'all' | EcosystemCategory, number> = {
      'all': publicUnits.length,
      'san-pham-so': 0,
      'truyen-thong': 0,
      'du-lich-su-kien': 0,
      'cong-dong': 0
    };
    publicUnits.forEach(unit => {
      if (map[unit.category] !== undefined) {
        map[unit.category] += 1;
      }
    });
    return map;
  }, [publicUnits]);

  // 3. Danh sách đơn vị lọc theo danh mục
  const filteredUnits = useMemo(() => {
    if (activeCategory === 'all') return publicUnits;
    return publicUnits.filter(unit => unit.category === activeCategory);
  }, [publicUnits, activeCategory]);

  const activeCategoryInfo = useMemo(() => {
    return ECOSYSTEM_CATEGORIES.find(c => c.id === activeCategory);
  }, [activeCategory]);

  return (
    <main className="ecosystem-page" id="main-content">
      {/* 1. HERO SECTION: BỐ CỤC EDITORIAL HIỆN ĐẠI */}
      <section className="section ecosystem-hero-section" aria-label="Giới thiệu hệ sinh thái DANAVA Solutions">
        <div className="ecosystem-hero-container">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <span className="breadcrumb-current" aria-current="page">Hệ sinh thái</span>
          </nav>

          <p className="eyebrow">
            <span className="status-dot" /> DANAVA SOLUTIONS · MỘT ĐIỂM CHẠM TOÀN DIỆN
          </p>

          <h1 className="ecosystem-hero-title">
            Hệ sinh thái mở.<br />
            <em>Cùng bạn phát triển bền vững.</em>
          </h1>

          <p className="ecosystem-hero-lead">
            Tại DANAVA Solutions, chúng tôi kết nối phần mềm quản lý chuyên sâu, thiết kế không gian số, chiến lược truyền thông theo KPI cùng các hành trình du lịch trải nghiệm và mạng lưới cộng đồng gắn kết. Tất cả tạo nên một hệ sinh thái khép kín, tương trợ lẫn nhau để đưa mô hình của bạn tiến xa.
          </p>

          <div className="ecosystem-stats-bar">
            <div className="eco-stat-item">
              <span className="eco-stat-num">04</span>
              <span className="eco-stat-desc">Khối năng lực chuyên trách khép kín</span>
            </div>
            <div className="eco-stat-item">
              <span className="eco-stat-num">100%</span>
              <span className="eco-stat-desc">Đơn vị thành viên đang vận hành thực tế</span>
            </div>
            <div className="eco-stat-item">
              <span className="eco-stat-num">10+</span>
              <span className="eco-stat-desc">Năm kinh nghiệm tích lũy trong ngành</span>
            </div>
            <div className="eco-stat-item">
              <span className="eco-stat-num">01</span>
              <span className="eco-stat-desc">Điểm tựa duy nhất: Thành công của khách hàng</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BỘ LỌC DANH MỤC & LƯỚI ĐƠN VỊ THÀNH VIÊN */}
      <section className="section ecosystem-directory-section" aria-label="Danh sách các đơn vị trong hệ sinh thái">
        <div className="ecosystem-directory-container">
          {/* Header bộ lọc */}
          <div className="ecosystem-filter-header">
            <div>
              <p className="filter-kicker">DANH MỤC HOẠT ĐỘNG</p>
              <h2>Chọn khối dịch vụ bạn quan tâm</h2>
            </div>
            <div className="ecosystem-filter-summary">
              <span>Đang hiển thị: <strong>{filteredUnits.length}</strong> / {publicUnits.length} đơn vị đã duyệt</span>
            </div>
          </div>

          {/* Thanh Filter Tabs (cuộn ngang trên mobile, touch target >= 44px) */}
          <div className="ecosystem-filter-toolbar" role="tablist" aria-label="Bộ lọc phân hệ hệ sinh thái">
            {ECOSYSTEM_CATEGORIES.map(cat => {
              const count = counts[cat.id] || 0;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`ecosystem-filter-tab ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="tab-label">{cat.label}</span>
                  <span className="tab-counter" aria-label={`${count} đơn vị`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Thông tin mô tả nhóm đang chọn */}
          <div className="ecosystem-category-hint" aria-live="polite">
            <span className="hint-icon">ℹ</span>
            <span>{activeCategoryInfo?.shortDesc}</span>
          </div>

          {/* LƯỚI CARD ĐƠN VỊ THÀNH VIÊN HOẶC TRẠNG THÁI RỖNG */}
          {filteredUnits.length === 0 ? (
            <div className="ecosystem-empty-card" role="status" aria-live="polite">
              <div className="empty-symbol-wrap" aria-hidden="true">
                <span>🌐</span>
              </div>
              <h3>Chưa có đơn vị công khai trong nhóm này</h3>
              <p>
                Các phân hệ thuộc nhóm này hiện đang trong lộ trình phát triển hoặc đang cập nhật thông tin chính thức. Bạn có thể xem toàn bộ hệ sinh thái hoặc liên hệ trực tiếp để được tư vấn.
              </p>
              <div className="empty-btn-group">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setActiveCategory('all')}
                >
                  Xem tất cả hệ sinh thái ({publicUnits.length})
                </button>
                <Link href="/lien-he/" className="button amber">
                  Gửi câu hỏi liên kết đối tác ↗
                </Link>
              </div>
            </div>
          ) : (
            <div className="ecosystem-cards-grid">
              {filteredUnits.map((unit) => (
                <article key={unit.id} className="ecosystem-unit-card" data-category={unit.category}>
                  {/* Ảnh bìa đơn vị & Badges */}
                  <div className="unit-card-media-wrap">
                    <img
                      src={unit.image}
                      alt={`Minh họa ${unit.name}`}
                      className="unit-card-image"
                      loading="lazy"
                    />
                    <div className="unit-overlay-badges">
                      <span className="unit-cat-pill">{unit.categoryName}</span>
                      <span className="unit-badge-pill">{unit.badge}</span>
                    </div>
                  </div>

                  {/* Phần nội dung chi tiết */}
                  <div className="unit-card-body">
                    <div className="unit-heading-block">
                      <span className="unit-kicker">{unit.categoryKicker}</span>
                      <h3 className="unit-title">{unit.name}</h3>
                    </div>

                    {/* Khối Đối tượng phục vụ nổi bật */}
                    <div className="unit-target-audience-box">
                      <span className="target-label">ĐỐI TƯỢNG PHỤC VỤ:</span>
                      <p className="target-text">{unit.targetAudience}</p>
                    </div>

                    {/* Mô tả chi tiết */}
                    <p className="unit-description-text">{unit.description}</p>

                    {/* Danh sách năng lực / tính năng cốt lõi */}
                    <div className="unit-features-group">
                      <span className="features-label">NĂNG LỰC &amp; ĐIỂM NỔI BẬT:</span>
                      <ul className="unit-features-ul">
                        {unit.features.map((feat, fIdx) => (
                          <li key={fIdx}>
                            <span className="feat-check" aria-hidden="true">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Chân card: Link chính thức và trạng thái */}
                    <div className="unit-card-footer">
                      <Link
                        href={unit.officialLink.href}
                        className={`unit-action-link ${unit.id === 'studio' ? 'is-studio-primary' : ''}`}
                        {...(unit.officialLink.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        <span>{unit.officialLink.label}</span>
                        <span className="arrow-sym" aria-hidden="true">↗</span>
                      </Link>

                      {unit.statusText && (
                        <span className="unit-status-indicator">
                          <span className="mini-dot" /> {unit.statusText}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. GIÁ TRỊ CỘNG HƯỞNG CỦA HỆ SINH THÁI KHÉP KÍN */}
      <section className="section ecosystem-synergy-section" aria-label="Giá trị cộng hưởng của hệ sinh thái DANAVA">
        <div className="ecosystem-synergy-container">
          <div className="synergy-header">
            <p className="eyebrow">GIÁ TRỊ KẾT NỐI</p>
            <h2>Tại sao một hệ sinh thái đồng bộ lại quan trọng?</h2>
            <p>
              Khi các phân hệ phần mềm, truyền thông và cộng đồng hoạt động riêng lẻ, bạn mất rất nhiều thời gian làm cầu nối. Khi cùng vận hành trên một hệ sinh thái, sức mạnh tăng trưởng được nhân đôi.
            </p>
          </div>

          <div className="synergy-cards-grid">
            <div className="synergy-card">
              <span className="synergy-num">01</span>
              <h3>Một đầu mối liên hệ duy nhất</h3>
              <p>
                Không còn cảnh đổ lỗi giữa bên làm web, bên chạy quảng cáo và bên cung cấp phần mềm. DANAVA chịu trách nhiệm toàn diện từ kiến trúc dữ liệu đến hình ảnh xuất hiện trước khách hàng.
              </p>
            </div>

            <div className="synergy-card">
              <span className="synergy-num">02</span>
              <h3>Dữ liệu liền mạch, không thất thoát</h3>
              <p>
                Học viên đăng ký từ chiến dịch truyền thông hoặc quét mã QR tại sự kiện Yoga Club được đồng bộ tức thì vào phần mềm DANAVA Studio, giúp đội ngũ lễ tân chăm sóc ngay lập tức.
              </p>
            </div>

            <div className="synergy-card">
              <span className="synergy-num">03</span>
              <h3>Đồng hành từ ý tưởng đến quy mô chuỗi</h3>
              <p>
                Dù bạn bắt đầu từ một phòng tập nhỏ 50 học viên hay phát triển chuỗi cơ sở hàng ngàn hội viên, các module giải pháp luôn sẵn sàng mở rộng mà không cần đập đi xây lại.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LỐI SANG CÁC TRANG LIÊN QUAN (GATEWAY) */}
      <section className="section ecosystem-gateways-section" aria-label="Khám phá thêm về DANAVA">
        <div className="ecosystem-gateways-container">
          <div className="gateways-grid">
            <Link href="/du-an/" className="gateway-card">
              <span className="gateway-badge">HỒ SƠ THỰC TẾ</span>
              <h3>Các dự án đã triển khai</h3>
              <p>Xem cách DANAVA Studio và các giải pháp số vận hành tại HARIVER Gym, Huế Pilates và các đối tác.</p>
              <span className="gateway-arrow">Xem portfolio dự án ↗</span>
            </Link>

            <Link href="/doi-ngu/" className="gateway-card">
              <span className="gateway-badge">CON NGƯỜI DANAVA</span>
              <h3>Đội ngũ chuyên sự</h3>
              <p>Gặp gỡ những chuyên gia công nghệ, truyền thông, kinh doanh và vận hành chịu trách nhiệm trực tiếp.</p>
              <span className="gateway-arrow">Xem hồ sơ đội ngũ ↗</span>
            </Link>

            <Link href="/ve-danava/" className="gateway-card">
              <span className="gateway-badge">TẦM NHÌN &amp; HÀNH TRÌNH</span>
              <h3>Về DANAVA Solutions</h3>
              <p>Hành trình hình thành từ 2021, triết lý kinh doanh tử tế và cam kết đồng hành lâu dài cùng khách hàng.</p>
              <span className="gateway-arrow">Khám phá hành trình ↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CTA KẾT NỐI CUỐI TRANG */}
      <section className="section ecosystem-cta-section" aria-label="Liên hệ hợp tác cùng hệ sinh thái DANAVA">
        <div className="ecosystem-cta-container">
          <p className="eyebrow"><span className="status-dot" /> SẴN SÀNG ĐỒNG HÀNH</p>
          <h2>Khởi đầu hành trình phát triển cùng hệ sinh thái DANAVA</h2>
          <p className="cta-lead">
            Dù bạn đang quan tâm đến giải pháp quản trị Studio, xây dựng website thương hiệu hay muốn kết nối cộng đồng, hãy để lại thông tin để chúng tôi liên hệ tư vấn lộ trình tối ưu nhất.
          </p>

          <div className="cta-actions">
            <Link href="/lien-he/" className="button amber">
              Đặt lịch trao đổi trực tiếp ↗
            </Link>
            <a href={`tel:${data.phone || '0935917677'}`} className="button secondary">
              📞 Hotline: {data.phone || '0935 917 677'}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// Widget tab explorer cũ giữ lại để tương thích tối đa
const productMedia: Record<string, { image: string; href: string; label: string; caption: string }> = {
  studio: {
    image: '/assets/presentation/studio-dashboard.webp',
    href: '/giai-phap/danava-studio/',
    label: 'Khám phá DANAVA Studio',
    caption: 'Giao diện DANAVA Studio · Dữ liệu demo'
  },
  digital: {
    image: '/assets/legacy/website.webp',
    href: '/giai-phap/digital-marketing/',
    label: 'Khám phá giải pháp truyền thông',
    caption: 'Ảnh minh họa từ kho DANAVA'
  },
  elearning: {
    image: '/assets/legacy/event-session.webp',
    href: 'https://danava.vn/',
    label: 'Khám phá khóa học trên DANAVA',
    caption: 'Hoạt động học hỏi và chia sẻ từ kho DANAVA'
  },
  pms: {
    image: '/assets/legacy/travel.webp',
    href: '/lien-he/?service=DANAVA+PMS',
    label: 'Trao đổi giải pháp quản lý',
    caption: 'Ảnh minh họa lĩnh vực lưu trú'
  },
  media: {
    image: '/assets/legacy/event-workshop.webp',
    href: '/giai-phap/digital-marketing/#dich-vu-media',
    label: 'Khám phá sự kiện và truyền thông',
    caption: 'Hoạt động từ kho hình ảnh DANAVA'
  },
  go: {
    image: '/assets/legacy/travel.webp',
    href: '/giai-phap/du-lich-su-kien/',
    label: 'Khám phá du lịch và sự kiện',
    caption: 'Đà Nẵng · Ảnh từ kho DANAVA'
  }
};

export default function Ecosystem() {
  const { data } = useSite();
  const items = (data.presentation || defaultPresentation).ecosystem.filter(x => x.visible);
  const [selected, setSelected] = useState('studio');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const item = items.find(x => x.id === selected) || items[0];
  if (!item) return null;

  const index = items.indexOf(item);
  const media = productMedia[item.id] || productMedia.studio;

  function choose(i: number) {
    const next = (i + items.length) % items.length;
    setSelected(items[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <section className="section ecosystem-explorer" id="ecosystem" data-chapter="Hệ sinh thái">
      <div className="section-kicker">
        <span><b>02</b> / HỆ SINH THÁI</span>
        <span>CÔNG NGHỆ × CON NGƯỜI × TRẢI NGHIỆM</span>
      </div>
      <div className="intro-heading" data-reveal>
        <h2>Nhiều khả năng.<br /><em>Một điểm kết nối.</em></h2>
        <div className="intro-side">
          <p>Từ vận hành doanh nghiệp đến kết nối cộng đồng. Chọn một lĩnh vực để khám phá giải pháp trong hệ sinh thái DANAVA.</p>
          <Link className="text-link" href="/he-sinh-thai/">Xem toàn bộ hệ sinh thái ↗</Link>
        </div>
      </div>

      <div role="tablist" aria-label="Khám phá hệ sinh thái DANAVA" className="ecosystem-tabs">
        {items.map((x, i) => (
          <button
            ref={el => { tabs.current[i] = el; }}
            role="tab"
            id={`eco-tab-${x.id}`}
            aria-controls="ecosystem-panel"
            aria-selected={x.id === item.id}
            tabIndex={x.id === item.id ? 0 : -1}
            key={x.id}
            onClick={() => setSelected(x.id)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                choose(index + (e.key === 'ArrowRight' ? 1 : -1));
              }
              if (e.key === 'Home') {
                e.preventDefault();
                choose(0);
              }
              if (e.key === 'End') {
                e.preventDefault();
                choose(items.length - 1);
              }
            }}
          >
            <span>0{i + 1}</span>{x.name.replace('DANAVA ', '')}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="ecosystem-panel"
        aria-labelledby={`eco-tab-${item.id}`}
        className="ecosystem-feature"
        data-product={item.id}
      >
        <div className="ecosystem-feature-copy" key={item.id}>
          <span className="feature-serial">0{index + 1}<small> / {String(items.length).padStart(2, '0')}</small></span>
          <p className="eyebrow">DANAVA SOLUTIONS</p>
          <h3>{item.name}</h3>
          <p className="ecosystem-feature-description">{item.description}</p>
          <ul>
            {item.features.split('\n').filter(Boolean).map((x, i) => (
              <li key={i}><span>↗</span>{x}</li>
            ))}
          </ul>
          <Link
            className="button amber"
            href={media.href}
            target={media.href.startsWith('https') ? '_blank' : undefined}
            rel={media.href.startsWith('https') ? 'noopener noreferrer' : undefined}
          >
            {media.label} ↗
          </Link>
        </div>

        <figure className="ecosystem-feature-media" key={item.id + '-media'}>
          <div className="feature-orbit" />
          <img
            src={item.id === 'studio' ? (data.presentation || defaultPresentation).screenImage : media.image}
            alt={item.name}
            loading="lazy"
          />
          <figcaption>{media.caption}</figcaption>
        </figure>
      </div>

      <div className="ecosystem-mini-index">
        {items.map(x => (
          <span key={x.id}>{x.name}</span>
        ))}
      </div>
    </section>
  );
}
