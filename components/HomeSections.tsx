'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSite } from './SiteStore';
import { Team } from './PublicPages';
import { company } from '@/lib/company';
import { servicePhotos, activityPhotos, postPhotos } from '@/lib/media';
import { defaultPresentation } from '@/lib/presentation';
import { getApprovedSocialPosts } from '@/lib/social-feed';
import MobileProjectCarousel from './MobileProjectCarousel';

const isExternal = (href: string) => href.startsWith('https');
const formatDate = (date: string) => date.split('-').reverse().join('.');
/** 0935917677 → 0935 917 677 (giữ nguyên nếu không đủ 10 chữ số) */
const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : phone;
};

/**
 * Đầu mục dùng chung cho mọi chương sau phần mở đầu 5 cảnh,
 * để toàn trang đọc như một mạch kể liên tục: 01 → 07.
 */
function SectionHead({
  index,
  label,
  aside,
  title,
  lead,
  link
}: {
  index: string;
  label: string;
  aside?: string;
  title: ReactNode;
  lead?: ReactNode;
  link?: { href: string; label: string };
}) {
  return (
    <>
      <div className="section-kicker">
        <span><b>{index}</b> / {label}</span>
        {aside && <span>{aside}</span>}
      </div>
      <div className="intro-heading" data-reveal>
        <h2>{title}</h2>
        {(lead || link) && (
          <div className="intro-side">
            {lead && <p>{lead}</p>}
            {link && <Link className="text-link" href={link.href}>{link.label} ↗</Link>}
          </div>
        )}
      </div>
    </>
  );
}

/* 01 — Về DANAVA: nối tiếp nền tối của 5 cảnh mở đầu */
export function CompanyStory() {
  const { data } = useSite();
  const metrics = data.metrics.filter(m => m.visible && m.value);

  return (
    <section className="section company-manifesto" id="company" data-chapter="Về DANAVA">
      <div className="section-kicker">
        <span><b>01</b> / VỀ DANAVA</span>
        <span>CÙNG BẠN PHÁT TRIỂN</span>
      </div>
      <div className="manifesto-layout">
        <h2 data-reveal>
          Công nghệ tạo <em>khả năng.</em><br />
          Con người tạo <em>giá trị.</em>
        </h2>
        <div className="manifesto-detail" data-reveal>
          <p className="manifesto-lead">{company.overview}</p>
          <div className="mission-callout">
            <span>SỨ MỆNH DANAVA</span>
            <p>“{company.mission}”</p>
          </div>
          <Link className="text-link" href="/ve-danava/">Tìm hiểu câu chuyện DANAVA ↗</Link>
        </div>
      </div>
      {metrics.length > 0 && (
        <div className="manifesto-metrics" data-reveal>
          {metrics.map(m => (
            <div key={m.id}>
              <strong>{m.value}</strong>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="brand-ribbon" aria-hidden="true">
        <div className="brand-ribbon-track">
          TECHNOLOGY <b>✳</b> PEOPLE <b>✳</b> WELLNESS <b>✳</b> EXPERIENCE <b>✳</b> COMMUNITY <b>✳</b> DANAVA
        </div>
      </div>
    </section>
  );
}

/* 03 — Giải pháp cho doanh nghiệp */
export function Capabilities() {
  const { data } = useSite();
  const [selected, setSelected] = useState('website');
  const service = data.services.find(s => s.id === selected) || data.services[0];
  if (!service) return null;
  const isStudio = service.id === 'studio';

  return (
    <section className="section capability-stage" id="solutions" data-chapter="Giải pháp">
      <SectionHead
        index="03"
        label="GIẢI PHÁP"
        aside="TỪ NHU CẦU ĐẾN TRIỂN KHAI"
        title={<>Chọn đúng hướng.<br /><em>Kết nối đúng giải pháp.</em></>}
        lead="Mỗi doanh nghiệp có một bài toán riêng. Chọn lĩnh vực để xem phạm vi DANAVA đồng hành."
      />

      <div className="capability-layout">
        <div className="capability-visual" data-reveal>
          <img
            key={service.id}
            src={isStudio ? (data.presentation || defaultPresentation).screenImage : servicePhotos[service.id]}
            alt={service.title}
            loading="lazy"
          />
          <div>
            <span>GIẢI PHÁP DANAVA</span>
            <strong>{service.title}</strong>
            <small>{isStudio ? 'Giao diện sản phẩm · Dữ liệu demo' : 'Ảnh từ kho DANAVA · Minh họa lĩnh vực'}</small>
          </div>
        </div>

        <div className="capability-list">
          {data.services.map((s, i) => {
            const open = s.id === service.id;
            return (
              <article key={s.id} className={open ? 'is-open' : ''}>
                <h3>
                  <button
                    aria-expanded={open}
                    aria-controls={`scope-${s.id}`}
                    id={`scope-button-${s.id}`}
                    onClick={() => setSelected(s.id)}
                  >
                    <span>0{i + 1}</span>
                    {s.title}
                    <b>{open ? '−' : '+'}</b>
                  </button>
                </h3>
                <div id={`scope-${s.id}`} role="region" aria-labelledby={`scope-button-${s.id}`} hidden={!open}>
                  <p>{s.description}</p>
                  <ul>{s.items.map(x => <li key={x}>{x}</li>)}</ul>
                  <Link href={`/giai-phap/${s.slug}/`}>Xem chi tiết giải pháp ↗</Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="capability-supplement" data-reveal>
        <p className="eyebrow">THÊM NHỮNG CÁCH DANAVA ĐỒNG HÀNH</p>
        <div>
          <Link href="/lien-he/">Thành lập doanh nghiệp &amp; kế toán ↗</Link>
          <Link href="/giai-phap/digital-marketing/">Chăm sóc fanpage · Quay phim · Chụp ảnh ↗</Link>
          <Link href="/giai-phap/cong-dong/">Yoga Club Vietnam &amp; Review ↗</Link>
        </div>
      </div>
    </section>
  );
}

/* 04 — Dự án đã triển khai */
export function RealProjects() {
  const { data } = useSite();
  const projects = (data.projects || []).filter(p => p.published && p.featured);
  if (!projects.length) return null;

  return (
    <section className="section home-cases" id="projects" data-chapter="Dự án">
      <SectionHead
        index="04"
        label="DỰ ÁN"
        aside="HỒ SƠ TRIỂN KHAI"
        title={<>Giải pháp thật.<br /><em>Câu chuyện thật.</em></>}
        lead="Mô hình triển khai và các hạng mục thực tế tại từng đối tác."
        link={{ href: '/du-an/', label: 'Xem tất cả dự án' }}
      />
      {/* Desktop Grid (hiển thị trên màn hình lớn) */}
      <div className="home-case-grid desktop-case-grid">
        {projects.slice(0, 4).map((p, i) => (
          <Link className="editorial-case" href={`/du-an/${p.slug}/`} key={p.id} data-reveal>
            <div className="editorial-case-image">
              <img src={p.image} alt={p.client || p.title} loading="lazy" data-parallax />
              <span>{p.category}</span>
              <b>↗</b>
            </div>
            <div className="editorial-case-meta">
              <span>0{i + 1} / {p.client}</span>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Swipeable Carousel (lướt ngang mượt mà trên điện thoại) */}
      <MobileProjectCarousel />
    </section>
  );
}

/* 05 — Con người DANAVA */
export function PeopleSection() {
  return (
    <section className="section home-team-section" id="people" data-chapter="Con người">
      <SectionHead
        index="05"
        label="CON NGƯỜI"
        aside="ĐỘI NGŨ DANAVA"
        title={<>Những người<br /><em>cùng đồng hành.</em></>}
        lead="Đằng sau mỗi giải pháp là những con người lắng nghe, sáng tạo và đi cùng doanh nghiệp đến cuối hành trình."
        link={{ href: '/doi-ngu/', label: 'Gặp gỡ đội ngũ' }}
      />
      <div data-reveal>
        <Team />
      </div>
    </section>
  );
}

/* 06 — Cộng đồng */
export function CommunityStory() {
  return (
    <section className="section community-editorial" id="community" data-chapter="Cộng đồng">
      <SectionHead
        index="06"
        label="CỘNG ĐỒNG"
        aside="WORKSHOP · SỰ KIỆN · YOGA"
        title={<>Kết nối ngoài<br /><em>màn hình.</em></>}
        lead="Workshop, sự kiện và cộng đồng Yoga là nơi DANAVA cùng mọi người gặp gỡ, chia sẻ và tạo nên trải nghiệm."
      />
      <div className="community-collage">
        <Link className="community-main" href="/kien-thuc/" data-reveal>
          <img src={activityPhotos[0].src} alt={activityPhotos[0].alt} loading="lazy" data-parallax />
          <div>
            <span>DẤU ẤN / KHO HOẠT ĐỘNG DANAVA</span>
            <h3>Những cuộc gặp gỡ.<br />Những giá trị ở lại.</h3>
            <b>Khám phá câu chuyện ↗</b>
          </div>
        </Link>
        <div className="community-side">
          <figure data-reveal>
            <img src={activityPhotos[1].src} alt={activityPhotos[1].alt} loading="lazy" />
            <figcaption>HỌC HỎI · CHIA SẺ · ĐỒNG HÀNH</figcaption>
          </figure>
          <div className="community-note" data-reveal>
            <span>YOGA CLUB VIETNAM</span>
            <h3>Cùng nhau<br />kết nối cộng đồng.</h3>
            <p>DANAVA đồng hành cùng không gian giao lưu, học hỏi và chia sẻ dành cho những người yêu Yoga.</p>
            <Link href="/giai-phap/cong-dong/">Khám phá cộng đồng ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 07 — Góc nhìn & kênh chính thức (chỉ hiện bài đăng mạng xã hội đã duyệt) */
export function KnowledgeFeed() {
  const { data } = useSite();
  const posts = data.posts
    .filter(p => p.published)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);
  const social = getApprovedSocialPosts().slice(0, 3);
  if (!posts.length && !social.length) return null;

  return (
    <section className="section home-journal" id="journal" data-chapter="Góc nhìn">
      <SectionHead
        index="07"
        label="GÓC NHÌN"
        aside="KHO NỘI DUNG DANAVA"
        title={<>Chia sẻ kiến thức.<br /><em>Lan tỏa kết nối.</em></>}
        link={{ href: '/kien-thuc/', label: 'Khám phá kho bài viết' }}
      />

      {posts.length > 0 && (
        <div className="home-journal-grid">
          {posts.map((p, i) => {
            const image = p.image || postPhotos[p.id];
            return (
              <Link key={p.id} href={`/kien-thuc/${p.slug}/`} className="journal-card" data-reveal>
                <div className="journal-image">
                  {image ? <img src={image} alt={p.title} loading="lazy" /> : <span>{p.category}</span>}
                  <b>0{i + 1}</b>
                </div>
                <p className="journal-meta">
                  {p.category}
                  {p.date && ` / ${formatDate(p.date)}`}
                </p>
                <h3>{p.title}</h3>
                <span className="card-link">Đọc câu chuyện ↗</span>
              </Link>
            );
          })}
        </div>
      )}

      {social.length > 0 && (
        <div className="home-social" data-reveal>
          <p className="eyebrow">TỪ KÊNH CHÍNH THỨC DANAVA</p>
          <div className="home-social-list">
            {social.map(post => (
              <a key={post.id} href={post.originalUrl} target="_blank" rel="noopener noreferrer" className="home-social-item">
                <span className="home-social-meta">
                  {post.platformLabel}
                  {post.date && ` · ${formatDate(post.date)}`}
                </span>
                <strong>{post.title}</strong>
                <b aria-hidden="true">↗</b>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* Kết trang — lặp lại không khí cảnh 5, nối liền chân trang tối */
const platforms = [
  { name: 'danava.vn', href: 'https://danava.vn/' },
  { name: 'DANAVA Studio', href: '/giai-phap/danava-studio/' },
  { name: 'DANAVA Portal', href: 'https://portal.danava.vn/' },
  { name: 'DANAVA App', href: 'https://app.danava.vn/' }
];

export function HomeClosing() {
  const { data } = useSite();
  return (
    <section className="home-closing" id="lien-he-nhanh">
      <div className="home-closing-photo" aria-hidden="true" />
      <div className="home-closing-inner" data-reveal>
        <p className="eyebrow">BẮT ĐẦU BẰNG MỘT CUỘC TRÒ CHUYỆN</p>
        <h2>Ý tưởng của bạn.<br /><em>Hành trình của chúng ta.</em></h2>
        <div className="home-closing-actions">
          <Link className="button amber" href="/lien-he/">Trao đổi với DANAVA ↗</Link>
          <a className="home-closing-phone" href={`tel:${data.phone}`}>
            <span>HOTLINE</span>
            {formatPhone(data.phone)}
          </a>
        </div>
        <ul className="home-closing-platforms" aria-label="Nền tảng DANAVA">
          {platforms.map(x => (
            <li key={x.name}>
              <Link
                href={x.href}
                target={isExternal(x.href) ? '_blank' : undefined}
                rel={isExternal(x.href) ? 'noopener noreferrer' : undefined}
              >
                {x.name} ↗
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
