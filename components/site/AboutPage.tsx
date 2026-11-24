'use client';
import Link from 'next/link';
import { MapPin, Clock, Phone, Compass, BarChart3, KeyRound, Infinity as InfinityIcon } from 'lucide-react';
import { useSite } from '../SiteStore';
import { CONTACT, formatPhone } from './catalog';
import { SectionHeading, CtaBand, IconTile, ArrowLink, Crumbs } from './ui';
import { StaffAvatar } from './TeamPage';
import { block } from '@/lib/blocks';
import { pageCopy } from '@/lib/blocks';
import { cmsText, ct } from './cms';
import { rich } from './rich';

const PRINCIPLE_ICONS = { field: Compass, transparent: BarChart3, ownership: KeyRound, longterm: InfinityIcon } as const;
const PRINCIPLE_TONES = { field: 'blue', transparent: 'orange', ownership: 'sky', longterm: 'green' } as const;

const CO = { scope: 'global', scopeLabel: 'Thông tin công ty' } as const;
const STAFF = { scope: 'record', scopeLabel: 'Hồ sơ nhân sự' } as const;

export default function AboutPage() {
  const { data } = useSite();
  const staff = data.staff.filter(p => p.visible);
  const founder = staff.find(p => p.id === 'thanh');
  const phone = data.phone || CONTACT.phone;
  const co = block(data, 'company');
  const copy = pageCopy(data, 've-danava');
  const ab = block(data, 'about');
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `about.${k}`, def, label, opts);

  const heroBtn1 = t('hero.story-button', 'Câu chuyện của chúng tôi', 'Nút chính');
  const heroBtn2 = t('hero.team-button', 'Gặp đội ngũ', 'Nút phụ');
  const pMission = t('pillars.mission.eyebrow', 'Sứ mệnh', 'Nhãn cột');
  const pPhil = t('pillars.philosophy.eyebrow', 'Triết lý', 'Nhãn cột');
  const pPhilText = t('pillars.philosophy.text', 'Cùng bạn phát triển. Công nghệ tạo khả năng, con người tạo giá trị.', 'Triết lý', { multiline: true });
  const pHq = t('pillars.hq.eyebrow', 'Trụ sở', 'Nhãn cột');
  const goalsEyebrow = t('goals.eyebrow', 'Định hướng', 'Dòng chữ nhỏ');
  const goalsTitle = t('goals.title', '“Công nghệ tạo khả năng, *con người tạo giá trị.*”', 'Tiêu đề', { rich: true });
  const founderCompany = t('story.founder-company', 'DANAVA Solutions', 'Tên công ty (chú thích ảnh)');
  const storyEyebrow = t('story.eyebrow', 'Câu chuyện khởi tạo', 'Dòng chữ nhỏ');
  const storyTitle = t('story.title', 'Bắt đầu từ những trăn trở tại quầy lễ tân', 'Tiêu đề');
  const storyP1 = t('story.paragraphs.0', 'Trong nhiều năm đồng hành cùng các phòng tập, studio yoga, pilates và doanh nghiệp dịch vụ tại miền Trung, chúng tôi thấy chủ cơ sở rất đam mê chuyên môn nhưng lại bị cuốn vào vận hành thủ công: theo dõi thẻ tập trên Excel, rà sĩ số trong nhóm chat, khách hàng phàn nàn vì trùng lịch hay quên hẹn.', 'Đoạn văn', { multiline: true });
  const storyP2 = t('story.paragraphs.1', 'Nhiều phần mềm trên thị trường lại cồng kềnh, chi phí cao và chưa phù hợp với cách làm việc của đội ngũ tại Việt Nam. DANAVA ra đời với một lời hứa giản dị: tạo ra công cụ và giải pháp truyền thông tinh gọn, để chủ cơ sở, huấn luyện viên và khách hàng đều dùng dễ dàng trên điện thoại.', 'Đoạn văn', { multiline: true });
  const storyQuote = t('story.quote', '“Công nghệ chỉ thực sự có ý nghĩa khi giải phóng con người khỏi những thao tác vụn vặt, để người làm nghề có trọn vẹn thời gian chăm sóc khách hàng của mình.”', 'Trích dẫn', { multiline: true });
  const msEyebrow = t('milestones.eyebrow', 'Hành trình', 'Dòng chữ nhỏ');
  const msTitle = t('milestones.title', 'Những cột mốc đáng nhớ', 'Tiêu đề');
  const moEyebrow = t('moments.eyebrow', 'Dấu ấn', 'Dòng chữ nhỏ');
  const moTitle = t('moments.title', 'Những chương trình *DANAVA đã cùng thực hiện*', 'Tiêu đề', { rich: true });
  const moLead = t('moments.lead', 'Hình ảnh từ hồ sơ năng lực của DANAVA.', 'Câu dẫn', { multiline: true });
  const moLink = t('moments.link', 'Xem các chương trình sự kiện', 'Liên kết');
  const prEyebrow = t('principles.eyebrow', 'Nguyên tắc làm việc', 'Dòng chữ nhỏ');
  const prTitle = t('principles.title', 'Bốn điều *chúng tôi luôn giữ*', 'Tiêu đề', { rich: true });
  const tmEyebrow = t('team.eyebrow', 'Đội ngũ', 'Dòng chữ nhỏ');
  const tmTitle = t('team.title', 'Những người cùng bạn phát triển', 'Tiêu đề');
  const tmLink = t('team.link', 'Xem toàn bộ đội ngũ', 'Liên kết');
  const ofOffice = t('office.address-label', 'Văn phòng', 'Nhãn');
  const ofHours = t('office.hours-label', 'Giờ làm việc', 'Nhãn');
  const ofHotline = t('office.hotline-label', 'Hotline', 'Nhãn');

  return (
    <main id="main">
      {/* Hero */}
      <section className="s-about-hero">
        <div className="s-container s-split">
          <div className="s-about-hero__copy">
            <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { label: 'Giới thiệu' }]} />
            <p className="s-eyebrow" {...cmsText('pages.ve-danava.kicker', 'Dòng chữ nhỏ')}>{copy.kicker}</p>
            <h1 className="s-h1" {...cmsText('pages.ve-danava.title', 'Tiêu đề trang', { rich: true })}>{rich(copy.title, 's-hl')}</h1>
            <p className="s-lead" {...cmsText('pages.ve-danava.lead', 'Câu dẫn', { multiline: true })}>{copy.lead}</p>
            <div className="s-row s-stack-m">
              <a className="s-btn s-btn--primary s-btn--lg" href="#cau-chuyen"><span {...heroBtn1.a}>{heroBtn1.v}</span></a>
              <Link className="s-btn s-btn--secondary s-btn--lg" href="/doi-ngu/"><span {...heroBtn2.a}>{heroBtn2.v}</span></Link>
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
            <p className="s-eyebrow" {...pMission.a}>{pMission.v}</p>
            <p className="s-h4" {...cmsText('block.company.mission', 'Sứ mệnh công ty', { ...CO, multiline: true })}>{co.mission}</p>
          </div>
          <div className="s-about-pillar">
            <p className="s-eyebrow" {...pPhil.a}>{pPhil.v}</p>
            <p className="s-h4" {...pPhilText.a}>{pPhilText.v}</p>
          </div>
          <div className="s-about-pillar">
            <p className="s-eyebrow" {...pHq.a}>{pHq.v}</p>
            <p className="s-h4" {...cmsText('block.company.address', 'Địa chỉ công ty', CO)}>{co.address}</p>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi · Sứ mệnh · Tầm nhìn */}
      <section className="s-section s-section--soft" aria-labelledby="about-goals">
        <div className="s-container">
          <SectionHeading eyebrow={<span {...goalsEyebrow.a}>{goalsEyebrow.v}</span>} title={<span id="about-goals" {...goalsTitle.a}>{rich(goalsTitle.v, 's-hl')}</span>} />
          <ol className="s-grid s-grid--3 s-tiles u-goals">
            {ab.goals.map((g, i) => (
              <li key={g.n} className="s-card s-card--pad">
                <span className="u-goals__n" aria-hidden="true">{g.n}</span>
                <h3 className="s-h4" {...cmsText(`block.about.goals.${i}.title`, 'Tiêu đề')}>{g.title}</h3>
                <p className="s-text" {...cmsText(`block.about.goals.${i}.text`, 'Nội dung', { multiline: true })}>{g.text}</p>
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
              <strong {...(founder?.name ? cmsText(`rec.staff.${founder.id}.name`, 'Họ tên', STAFF) : {})}>{founder?.name || 'Lê Tấn Thành'}</strong>
              <span><span {...(founder?.role ? cmsText(`rec.staff.${founder.id}.role`, 'Chức vụ', STAFF) : {})}>{founder?.role || 'Founder & CEO'}</span>, <span {...founderCompany.a}>{founderCompany.v}</span></span>
            </figcaption>
          </figure>
          <div className="s-stack-lg">
            <div className="s-heading">
              <p className="s-eyebrow" {...storyEyebrow.a}>{storyEyebrow.v}</p>
              <h2 className="s-h2" id="about-story" {...storyTitle.a}>{storyTitle.v}</h2>
            </div>
            <div className="s-prose">
              <p {...storyP1.a}>{storyP1.v}</p>
              <p {...storyP2.a}>{storyP2.v}</p>
              <blockquote {...storyQuote.a}>{storyQuote.v}</blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Cột mốc */}
      <section className="s-section s-section--brand" aria-labelledby="about-milestones">
        <div className="s-container">
          <SectionHeading eyebrow={<span {...msEyebrow.a}>{msEyebrow.v}</span>} title={<span id="about-milestones" {...msTitle.a}>{msTitle.v}</span>} />
          <ol className="s-about-timeline">
            {ab.milestones.map((m, i) => (
              <li key={m.year}>
                <img className="u-timeline-img" src={m.image} alt="" loading="lazy" decoding="async" width={640} height={400} />
                <span className="s-about-timeline__year">{m.year}</span>
                <h3 className="s-h4" {...cmsText(`block.about.milestones.${i}.title`, 'Tiêu đề cột mốc')}>{m.title}</h3>
                <p className="s-text" {...cmsText(`block.about.milestones.${i}.text`, 'Nội dung cột mốc', { multiline: true })}>{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Khoảnh khắc */}
      <section className="s-section" aria-labelledby="about-moments">
        <div className="s-container">
          <SectionHeading
            eyebrow={<span {...moEyebrow.a}>{moEyebrow.v}</span>}
            title={<span id="about-moments" {...moTitle.a}>{rich(moTitle.v, 's-hl')}</span>}
            lead={<span {...moLead.a}>{moLead.v}</span>}
            action={<ArrowLink href="/giai-phap/su-kien-truyen-thong/"><span {...moLink.a}>{moLink.v}</span></ArrowLink>}
          />
          <div className="u-moments">
            {ab.moments.map((m, i) => (
              <figure key={m.src}>
                <img src={m.src} alt={m.title} loading="lazy" decoding="async" width={800} height={600} />
                <figcaption {...cmsText(`block.about.moments.${i}.title`, 'Chú thích ảnh')}>{m.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Nguyên tắc */}
      <section className="s-section" aria-labelledby="about-principles">
        <div className="s-container">
          <SectionHeading eyebrow={<span {...prEyebrow.a}>{prEyebrow.v}</span>} title={<span id="about-principles" {...prTitle.a}>{rich(prTitle.v, 's-hl')}</span>} />
          <div className="s-grid s-grid--4 s-tiles">
            {ab.principles.map((p, i) => (
              <div key={p.key} className="s-feature">
                <IconTile icon={PRINCIPLE_ICONS[p.key as keyof typeof PRINCIPLE_ICONS] ?? Object.values(PRINCIPLE_ICONS)[i % 4]} tone={PRINCIPLE_TONES[p.key as keyof typeof PRINCIPLE_TONES] ?? Object.values(PRINCIPLE_TONES)[i % 4]} />
                <h3 className="s-feature__title" {...cmsText(`block.about.principles.${i}.title`, 'Tên nguyên tắc')}>{p.title}</h3>
                <p className="s-feature__text" {...cmsText(`block.about.principles.${i}.text`, 'Mô tả nguyên tắc', { multiline: true })}>{p.text}</p>
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
              eyebrow={<span {...tmEyebrow.a}>{tmEyebrow.v}</span>}
              title={<span id="about-team" {...tmTitle.a}>{tmTitle.v}</span>}
              action={<ArrowLink href="/doi-ngu/"><span {...tmLink.a}>{tmLink.v}</span></ArrowLink>}
            />
            <div className="s-about-team s-snap s-snap--sm">
              {staff.slice(0, 6).map(p => (
                <Link key={p.id} href={`/doi-ngu/${p.id}/`} className="s-about-team__item">
                  <StaffAvatar person={p} />
                  <strong {...cmsText(`rec.staff.${p.id}.name`, 'Họ tên', STAFF)}>{p.name}</strong>
                  <span {...cmsText(`rec.staff.${p.id}.role`, 'Chức vụ', STAFF)}>{p.role}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Văn phòng */}
      <section className="s-section s-section--tight" aria-label="Văn phòng">
        <div className="s-container s-about-office">
          <div className="s-about-office__item"><MapPin aria-hidden="true" /><span><strong {...ofOffice.a}>{ofOffice.v}</strong><a href={co.mapUrl} target="_blank" rel="noopener noreferrer"><span {...cmsText('block.company.address', 'Địa chỉ công ty', CO)}>{co.address}</span></a></span></div>
          <div className="s-about-office__item"><Clock aria-hidden="true" /><span><strong {...ofHours.a}>{ofHours.v}</strong><span {...cmsText('block.company.hours', 'Giờ làm việc', CO)}>{co.hours}</span></span></div>
          <div className="s-about-office__item"><Phone aria-hidden="true" /><span><strong {...ofHotline.a}>{ofHotline.v}</strong><a href={`tel:${phone}`}>{formatPhone(phone)}</a></span></div>
        </div>
      </section>

      <CtaBand data={data} cms={{ title: 'pages.ve-danava.ctaTitle', lead: copy.ctaLead ? 'pages.ve-danava.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}
