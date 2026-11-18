'use client';
import Link from 'next/link';
import { MapPin, Clock, Phone, Compass, BarChart3, KeyRound, Infinity as InfinityIcon } from 'lucide-react';
import { useSite } from '../SiteStore';
import { company } from '@/lib/company';
import { CONTACT, formatPhone } from './catalog';
import { SectionHeading, CtaBand, IconTile, ArrowLink } from './ui';
import { StaffAvatar } from './TeamPage';

const MILESTONES = [
  { year: '2021', title: 'Khởi đầu kết nối số & cộng đồng', text: 'Triển khai thiết kế website doanh nghiệp, marketing và đồng hành cùng các câu lạc bộ yoga tại Đà Nẵng và miền Trung.' },
  { year: '2023', title: 'Chuẩn hóa hệ sinh thái', text: 'Quy tụ đội ngũ cốt lõi với năm mảng: công nghệ quản trị, website, marketing & media, du lịch & sự kiện, cộng đồng.' },
  { year: '2024', title: 'Chuỗi sự kiện Cổng Năng Lượng', text: 'Đồng hành tổ chức Soundbath Live Concert ngày 05/05/2024 tại Đà Nẵng cùng Team Tumy và các câu lạc bộ yoga.' },
  { year: '2026', title: 'Nền tảng DANAVA Studio', text: 'Triển khai phần mềm DANAVA Studio và app hội viên mang thương hiệu riêng cho HARIVER Gym và Huế Pilates & Yoga.' }
];

const PRINCIPLES = [
  { icon: Compass, tone: 'blue' as const, title: 'Thấu hiểu thực địa', text: 'Xuống tận cơ sở, quan sát giờ cao điểm và quy trình tại quầy để thiết kế thao tác thuận tiện nhất.' },
  { icon: BarChart3, tone: 'orange' as const, title: 'Minh bạch số liệu', text: 'Không số liệu ảo, không hứa hẹn viển vông. Chi phí và kết quả được báo cáo từ hệ thống chính chủ.' },
  { icon: KeyRound, tone: 'sky' as const, title: 'Tài sản thuộc về khách hàng', text: 'Website, tài khoản quảng cáo và dữ liệu khách hàng thuộc quyền sở hữu của doanh nghiệp.' },
  { icon: InfinityIcon, tone: 'green' as const, title: 'Đồng hành dài hạn', text: 'Bàn giao đi cùng đào tạo, hỗ trợ kỹ thuật và cải tiến theo sự phát triển của cơ sở.' }
];

export default function AboutPage() {
  const { data } = useSite();
  const staff = data.staff.filter(p => p.visible);
  const founder = staff.find(p => p.id === 'thanh');
  const phone = data.phone || CONTACT.phone;

  return (
    <main id="main">
      {/* Hero */}
      <section className="s-about-hero">
        <div className="s-container s-split">
          <div className="s-about-hero__copy">
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
            <p className="s-h4">{company.mission}</p>
          </div>
          <div className="s-about-pillar">
            <p className="s-eyebrow">Triết lý</p>
            <p className="s-h4">Cùng bạn phát triển. Công nghệ tạo khả năng, con người tạo giá trị.</p>
          </div>
          <div className="s-about-pillar">
            <p className="s-eyebrow">Trụ sở</p>
            <p className="s-h4">{CONTACT.address}</p>
          </div>
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
                <span className="s-about-timeline__year">{m.year}</span>
                <h3 className="s-h4">{m.title}</h3>
                <p className="s-text">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Nguyên tắc */}
      <section className="s-section" aria-labelledby="about-principles">
        <div className="s-container">
          <SectionHeading eyebrow="Nguyên tắc làm việc" title={<span id="about-principles">Bốn điều <span className="s-hl">chúng tôi luôn giữ</span></span>} />
          <div className="s-grid s-grid--4 s-tiles">
            {PRINCIPLES.map(p => (
              <div key={p.title} className="s-feature">
                <IconTile icon={p.icon} tone={p.tone} />
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
          <div className="s-about-office__item"><MapPin aria-hidden="true" /><span><strong>Văn phòng</strong><a href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer">{CONTACT.address}</a></span></div>
          <div className="s-about-office__item"><Clock aria-hidden="true" /><span><strong>Giờ làm việc</strong>Thứ Hai – Thứ Bảy, 8:00 – 18:00</span></div>
          <div className="s-about-office__item"><Phone aria-hidden="true" /><span><strong>Hotline</strong><a href={`tel:${phone}`}>{formatPhone(phone)}</a></span></div>
        </div>
      </section>

      <CtaBand title="Sẵn sàng cùng bạn bắt đầu" />
    </main>
  );
}
