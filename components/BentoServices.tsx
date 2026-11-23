'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Smartphone,
  Cpu,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface BentoItem {
  id: string;
  badge: string;
  badgeColor: 'cyan' | 'warm' | 'amber';
  title: string;
  category: string;
  description: string;
  icon: typeof Smartphone;
  link: string;
  ctaText: string;
  features: string[];
  specs: { label: string; value: string }[];
}

const bentoItems: BentoItem[] = [
  {
    id: 'studio',
    badge: 'SẢN PHẨM TRỌNG TÂM',
    badgeColor: 'cyan',
    title: 'DANAVA Studio',
    category: 'Mobile App & Quản Trị Phòng Tập',
    description:
      'Nền tảng số hóa vận hành Gym, Yoga, Pilates & Spa. Quản lý hội viên, hạn thẻ, đặt chỗ lớp học qua mã QR và tự động hóa doanh thu trong một hệ thống tập trung.',
    icon: Smartphone,
    link: '/giai-phap/danava-studio/',
    ctaText: 'Khám phá DANAVA Studio',
    features: [
      'Check-in QR học viên siêu tốc, chống gian lận thẻ tập',
      'Lịch lớp tự động theo sức chứa phòng & đăng ký online',
      'Tính hoa hồng HLV/PT minh bạch theo từng buổi dạy',
      'Báo cáo doanh thu & công nợ hội viên thời gian thực'
    ],
    specs: [
      { label: 'Ứng dụng', value: 'Gym / Yoga / Pilates / Spa' },
      { label: 'Nền tảng', value: 'Mobile Web & Cloud App' }
    ]
  },
  {
    id: 'website',
    badge: 'KHÔNG GIAN SỐ',
    badgeColor: 'warm',
    title: 'Full-stack Website',
    category: 'Hiện Diện Số & Tối Ưu Chuyển Đổi',
    description:
      'Thiết kế website và landing page chuẩn nhận diện công nghệ sang trọng, tải trang tức thì với kiến trúc Next.js hiện đại, chuẩn SEO 100% và tối ưu chuyển đổi khách hàng 24/7.',
    icon: Code2,
    link: '/giai-phap/thiet-ke-website/',
    ctaText: 'Xem dịch vụ Website',
    features: [
      'Kiến trúc Server Components tải nhanh, đạt điểm Core Web Vitals cao',
      'Chuẩn hóa nhận diện thị giác sang trọng, tinh tế như Apple/Vercel',
      'Form đăng ký thông minh liên kết trực tiếp CRM và email đội ngũ',
      'Bảo mật tuyệt đối, tương thích trọn vẹn từ điện thoại đến màn hình lớn'
    ],
    specs: [
      { label: 'Công nghệ', value: 'Next.js · React 19 · Node.js' },
      { label: 'Tốc độ', value: '< 0.8s First Load' }
    ]
  },
  {
    id: 'automation',
    badge: 'TỰ ĐỘNG HÓA',
    badgeColor: 'cyan',
    title: 'AI & Automation',
    category: 'Chuyển Đổi Số & Tăng Trưởng Đa Kênh',
    description:
      'Tự động hóa luồng tiếp nhận khách hàng từ Fanpage, TikTok và Website về một đầu mối. Phân luồng tư vấn viên tự động và nuôi dưỡng khách hàng tiềm năng qua kịch bản thông minh.',
    icon: Cpu,
    link: '/giai-phap/digital-marketing/',
    ctaText: 'Xem giải pháp Tăng trưởng',
    features: [
      'Hợp nhất dữ liệu khách hàng đa kênh (Social, Web, Hotline)',
      'Tự động phân công chuyên viên chăm sóc ngay khi có lead mới',
      'Kịch bản thông báo nhắc hạn thẻ, sinh nhật qua Zalo / SMS',
      'Đo lường chính xác chi phí trên từng học viên đăng ký thực tế'
    ],
    specs: [
      { label: 'Tích hợp', value: 'Social · Zalo ZNS · Webhook' },
      { label: 'Hiệu quả', value: 'Giảm 60% thời gian thủ công' }
    ]
  },
  {
    id: 'cloud',
    badge: 'HẠ TẦNG VẬN HÀNH',
    badgeColor: 'amber',
    title: 'Cloud & An Toàn',
    category: 'Vận Hành Ổn Định & Cam Kết SLA',
    description:
      'Hạ tầng máy chủ đám mây ổn định, sao lưu dữ liệu định kỳ, bảo mật thông tin hội viên tuyệt đối cùng chính sách hỗ trợ kỹ thuật trực tiếp 24/7 từ đội ngũ kỹ sư DANAVA.',
    icon: ShieldCheck,
    link: '/chinh-sach-dich-vu/',
    ctaText: 'Xem cam kết SLA',
    features: [
      'Máy chủ đám mây tự động co giãn theo lượng truy cập',
      'Sao lưu độc lập hàng ngày, phục hồi tức thì khi có sự cố',
      'Bảo mật thông tin khách hàng tuân thủ Chính sách riêng tư',
      'Hotline kỹ thuật thường trực 0935 91 76 77 hỗ trợ khẩn cấp'
    ],
    specs: [
      { label: 'Uptime', value: 'Cam kết 99.9% Uptime' },
      { label: 'Phản hồi', value: '< 15 phút sự cố nghiêm trọng' }
    ]
  }
];

/**
 * BentoServices: Bố cục Bento Grid 2x2 hiện đại, tối ưu cho cả desktop và mobile
 * - Soft rounded cards (rounded-2xl)
 * - Glowing gradient borders
 * - Accordion tương tác thu gọn/mở rộng trên điện thoại
 * - Tông màu semantic chuẩn DANAVA (#0B132B / #1C2541 / #3A506B / #5BC0DE / #F4D6B0)
 */
export default function BentoServices() {
  // Quản lý trạng thái mở rộng Accordion trên mobile
  const [expandedId, setExpandedId] = useState<string | null>('studio');

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <section className="section bento-services-section" id="bento-tech" aria-label="Hệ thống giải pháp công nghệ DANAVA">
      <div className="section-kicker">
        <span><b>02</b> / NỀN TẢNG CÔNG NGHỆ</span>
        <span>BENTO ARCHITECTURE · MOBILE-FIRST</span>
      </div>

      <div className="bento-header">
        <div className="bento-header-copy">
          <p className="eyebrow">
            <Sparkles className="eyebrow-sparkle" size={13} />
            HỆ SINH THÁI GIẢI PHÁP SỐ TOÀN DIỆN
          </p>
          <h2>
            Công nghệ tinh gọn.<br />
            <em>Hiệu quả vượt trội.</em>
          </h2>
        </div>
        <p className="bento-header-desc">
          Bốn trụ cột công nghệ được may đo đồng bộ giúp doanh nghiệp Wellness và cơ sở thể thao số hóa toàn diện từ thu hút khách hàng đến vận hành tự động.
        </p>
      </div>

      {/* 2x2 BENTO GRID */}
      <div className="bento-grid">
        {bentoItems.map((item, idx) => {
          const IconComp = item.icon;
          const isExpanded = expandedId === item.id;
          const isFeatured = idx === 0;

          return (
            <article
              key={item.id}
              className={`bento-card bento-card-${item.badgeColor} ${isFeatured ? 'bento-card-featured' : ''}`}
            >
              <div className="bento-card-glow" aria-hidden="true" />

              <div className="bento-card-top">
                <div className="bento-icon-box">
                  <IconComp className="bento-icon" size={24} />
                </div>
                <span className={`bento-badge badge-${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <div className="bento-card-title-wrap">
                <span className="bento-category">{item.category}</span>
                <h3 className="bento-title">{item.title}</h3>
              </div>

              <p className="bento-desc">{item.description}</p>

              {/* Mobile Accordion Toggle */}
              <div className="bento-accordion-toggle">
                <button
                  type="button"
                  className="accordion-btn"
                  onClick={() => toggleAccordion(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`bento-features-${item.id}`}
                >
                  <span>{isExpanded ? 'Thu gọn tính năng' : 'Xem tính năng nổi bật'}</span>
                  <ChevronDown
                    size={16}
                    className={`accordion-chevron ${isExpanded ? 'is-rotated' : ''}`}
                  />
                </button>
              </div>

              {/* Feature List (Accordion on mobile, always visible on desktop) */}
              <div
                id={`bento-features-${item.id}`}
                className={`bento-feature-wrap ${isExpanded ? 'is-open' : ''}`}
              >
                <ul className="bento-feature-list">
                  {item.features.map((feat, fIdx) => (
                    <li key={fIdx} className="bento-feature-item">
                      <CheckCircle2 size={15} className="feat-check-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="bento-specs-row">
                  {item.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="bento-spec-item">
                      <small>{spec.label}</small>
                      <strong>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bento-card-footer">
                <Link href={item.link} className="bento-cta-link">
                  <span>{item.ctaText}</span>
                  <ArrowRight size={16} className="bento-arrow" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

