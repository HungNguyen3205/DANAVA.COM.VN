'use client';
import Link from 'next/link';
import { MapPin, Clock, Phone, Compass, BarChart3, KeyRound, Infinity as InfinityIcon } from 'lucide-react';
import { useSite } from '../SiteStore';
import { CONTACT, formatPhone } from './catalog';
import { SectionHeading, CtaBand, IconTile, ArrowLink, Crumbs } from './ui';
import { StaffAvatar } from './TeamPage';
import { GOALS, MILESTONES, MOMENTS, PRINCIPLES } from './company-content';
import { block } from '@/lib/blocks';

const PRINCIPLE_ICONS = { field: Compass, transparent: BarChart3, ownership: KeyRound, longterm: InfinityIcon } as const;
const PRINCIPLE_TONES = { field: 'blue', transparent: 'orange', ownership: 'sky', longterm: 'green' } as const;

export default function AboutPage() {
  const { data } = useSite();
  const staff = data.staff.filter(p => p.visible);
  const founder = staff.find(p => p.id === 'thanh');
  const phone = data.phone || CONTACT.phone;
  const co = block(data, 'company');

  return (
    <main id="main">
      {/* Hero */}
      <section className="s-about-hero">
        <div className="s-container s-split">
          <div className="s-about-hero__copy">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Về DANAVA' }]} />
            <p className="s-eyebrow">Về DANAVA</p>
            <h1 className="s-h1">Đồng hành bằng công nghệ. <span className="s-hl">Gắn kết bằng giá trị thực.</span></h1>
            <p className="s-lead">DANAVA Solutions là đơn vị công nghệ, truyền thông và trải nghiệm tại Đà Nẵng. Chúng tôi giải quyết bài toán vận hành thực tế cho phòng tập, studio wellness và doanh nghiệp dịch vụ, biến quy trình thủ công thành nền tảng số gọn nhẹ.</p>
            <div className="s-row s-stack-m">
              <a className="s-btn s-btn--primary s-btn--lg" href="#cau-chuyen">Câu chuyện của chúng tôi</a>
              <Link className="s-btn s-btn--secondary s-btn--lg" href="/doi-ngu/">Gặp đội ngũ</Link>
            </div>
          </div>
          <div className="s-frame s-frame--4x3">
            <img src="/assets/legacy/event-group.webp" alt="Đội ngũ DANAVA cùng cộng đồng trong một workshop tại Đà Nẵng" fetchPriority="high" />
          </div>
        </div>
      </section>

      {/* Sứ mệnh */}
      <section className="s-section s-section--tight" aria-label="Sứ mệnh và triết lý">
        <div className="s-container s-grid s-grid--3 s-tiles">
          <div className="s-about-pillar">
            <p className="s-eyebrow">Sứ mệnh</p>
            <p className="s-h4">{co.mission}</p>
          </div>
          <div className="s-about-pillar">
            <p className="s-eyebrow">Triết lý</p>
            <p className="s-h4">Cùng bạn phát triển. Công nghệ tạo khả năng, con người tạo giá trị.</p>
          </div>
          <div className="s-about-pillar">
            <p className="s-eyebrow">Trụ sở</p>
            <p className="s-h4">{co.address}</p>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi · Sứ mệnh · Tầm nhìn */}
      <section className="s-section s-section--soft" aria-labelledby="about-goals">
        <div className="s-container">
          <SectionHeading eyebrow="Định hướng" title={<span id="about-goals">“Công nghệ tạo khả năng, <span className="s-hl">con người tạo giá trị.</span>”</span>} />
          <ol className="s-grid s-grid--3 s-tiles u-goals">
            {GOALS.map(g => (
              <li key={g.n} className="s-card s-card--pad">
                <span className="u-goals__n" aria-hidden="true">{g.n}</span>
                <h3 className="s-h4">{g.title}</h3>
                <p className="s-text">{g.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Câu chuyện */}
      <section className="s-section" id="cau-chuyen" aria-labelledby="about-story">
        <div className="s-container s-split s-split--top">
          <figure className="s-about-founder">
            <div className="s-frame s-frame--4x3">
              <img src="/assets/legacy/founder.webp" alt="Lê Tấn Thành, Founder & CEO DANAVA Solutions" loading="lazy" />
            </div>
            <figcaption>
              <strong>{founder?.name || 'Lê Tấn Thành'}</strong>
              <span>{founder?.role || 'Founder & CEO'}, DANAVA Solutions</span>
            </figcaption>
          </figure>
          <div className="s-stack-lg">
            <div className="s-heading">
              <p className="s-eyebrow">Câu chuyện khởi tạo</p>
              <h2 className="s-h2" id="about-story">Bắt đầu từ những trăn trở tại quầy lễ tân</h2>
            </div>
            <div className="s-prose">
              <p>Trong nhiều năm đồng hành cùng các phòng tập, studio yoga, pilates và doanh nghiệp dịch vụ tại miền Trung, chúng tôi thấy chủ cơ sở rất đam mê chuyên môn nhưng lại bị cuốn vào vận hành thủ công: theo dõi thẻ tập trên Excel, rà sĩ số trong nhóm chat, khách hàng phàn nàn vì trùng lịch hay quên hẹn.</p>
              <p>Nhiều phần mềm trên thị trường lại cồng kềnh, chi phí cao và chưa phù hợp với cách làm việc của đội ngũ tại Việt Nam. DANAVA ra đời với một lời hứa giản dị: tạo ra công cụ và giải pháp truyền thông tinh gọn, để chủ cơ sở, huấn luyện viên và khách hàng đều dùng dễ dàng trên điện thoại.</p>
              <blockquote>“Công nghệ chỉ thực sự có ý nghĩa khi giải phóng con người khỏi những thao tác vụn vặt, để người làm nghề có trọn vẹn thời gian chăm sóc khách hàng của mình.”</blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Cột mốc */}
      <section className="s-section s-section--brand" aria-labelledby="about-milestones">
        <div className="s-container">
          <SectionHeading eyebrow="Hành trình" title={<span id="about-milestones">Những cột mốc đáng nhớ</span>} />
          <ol className="s-about-timeline">
            {MILESTONES.map(m => (
              <li key={m.year}>
                <img className="u-timeline-img" src={m.image} alt="" loading="lazy" decoding="async" width={640} height={400} />
                <span className="s-about-timeline__year">{m.year}</span>
                <h3 className="s-h4">{m.title}</h3>
                <p className="s-text">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Khoảnh khắc */}
      <section className="s-section" aria-labelledby="about-moments">
        <div className="s-container">
          <SectionHeading eyebrow="Dấu ấn" title={<span id="about-moments">Những chương trình <span className="s-hl">DANAVA đã cùng thực hiện</span></span>} lead="Hình ảnh từ hồ sơ năng lực của DANAVA." action={<ArrowLink href="/giai-phap/su-kien-truyen-thong/">Xem các chương trình sự kiện</ArrowLink>} />
          <div className="u-moments">
            {MOMENTS.map(m => (
              <figure key={m.src}>
                <img src={m.src} alt={m.title} loading="lazy" decoding="async" width={800} height={600} />
                <figcaption>{m.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Nguyên tắc */}
      <section className="s-section" aria-labelledby="about-principles">
        <div className="s-container">
          <SectionHeading eyebrow="Nguyên tắc làm việc" title={<span id="about-principles">Bốn điều <span className="s-hl">chúng tôi luôn giữ</span></span>} />
          <div className="s-grid s-grid--4 s-tiles">
            {PRINCIPLES.map(p => (
              <div key={p.key} className="s-feature">
                <IconTile icon={PRINCIPLE_ICONS[p.key]} tone={PRINCIPLE_TONES[p.key]} />
                <h3 className="s-feature__title">{p.title}</h3>
                <p className="s-feature__text">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Đội ngũ */}
      {staff.length > 0 && (
        <section className="s-section s-section--soft" aria-labelledby="about-team">
          <div className="s-container">
            <SectionHeading
              eyebrow="Đội ngũ"
              title={<span id="about-team">Những người cùng bạn phát triển</span>}
              action={<ArrowLink href="/doi-ngu/">Xem toàn bộ đội ngũ</ArrowLink>}
            />
            <div className="s-about-team s-snap s-snap--sm">
              {staff.slice(0, 6).map(p => (
                <Link key={p.id} href={`/doi-ngu/${p.id}/`} className="s-about-team__item">
                  <StaffAvatar person={p} />
                  <strong>{p.name}</strong>
                  <span>{p.role}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Văn phòng */}
      <section className="s-section s-section--tight" aria-label="Văn phòng">
        <div className="s-container s-about-office">
          <div className="s-about-office__item"><MapPin aria-hidden="true" /><span><strong>Văn phòng</strong><a href={co.mapUrl} target="_blank" rel="noopener noreferrer">{co.address}</a></span></div>
          <div className="s-about-office__item"><Clock aria-hidden="true" /><span><strong>Giờ làm việc</strong>{co.hours}</span></div>
          <div className="s-about-office__item"><Phone aria-hidden="true" /><span><strong>Hotline</strong><a href={`tel:${phone}`}>{formatPhone(phone)}</a></span></div>
        </div>
      </section>

      <CtaBand title="Sẵn sàng cùng bạn bắt đầu" primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}
