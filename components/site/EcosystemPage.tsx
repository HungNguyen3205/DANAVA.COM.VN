'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Globe, Hotel, GraduationCap, Megaphone, Plane, Handshake, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { ECOSYSTEM_CATEGORIES, getEcosystemUnits, getEcosystemCategoryCounts, type EcosystemCategory, type EcosystemUnit } from '@/lib/ecosystem';
import { PageHead, CtaBand, Visual } from './ui';
import type { Tone } from './catalog';

/** Ảnh thật chỉ dùng khi khớp nội dung; còn lại dùng minh họa CSS. */
const UNIT_VISUAL: Record<string, { image?: string; icon: LucideIcon; tone: Tone }> = {
  studio: { image: '/assets/presentation/studio-dashboard.webp', icon: LayoutDashboard, tone: 'blue' },
  website: { icon: Globe, tone: 'sky' },
  pms: { icon: Hotel, tone: 'sky' },
  elearning: { icon: GraduationCap, tone: 'navy' },
  digital: { icon: Megaphone, tone: 'orange' },
  media: { image: '/assets/legacy/event-workshop.webp', icon: Megaphone, tone: 'navy' },
  go: { icon: Plane, tone: 'green' },
  events: { image: '/assets/legacy/event-group.webp', icon: Handshake, tone: 'orange' },
  'yoga-club': { image: '/assets/legacy/community.webp', icon: Handshake, tone: 'green' },
  'dong-hanh': { icon: Handshake, tone: 'blue' }
};

export function EcosystemPage() {
  const [cat, setCat] = useState<'all' | EcosystemCategory>('all');
  const counts = getEcosystemCategoryCounts();
  const units = getEcosystemUnits(cat);

  return (
    <main id="main">
      <PageHead
        center
        eyebrow="Hệ sinh thái DANAVA"
        title={<>Hệ sinh thái mở, <span className="s-hl">giá trị kết nối</span></>}
        lead="Bốn khối năng lực bổ trợ cho nhau: sản phẩm số, truyền thông, du lịch & sự kiện và cộng đồng. Phát triển và vận hành bởi DANAVA Solutions."
      />

      <section className="s-section s-section--flush-top" aria-label="Các đơn vị trong hệ sinh thái">
        <div className="s-container">
          <div className="s-row s-row--center s-eco-tabs">
            <div className="s-tabs" role="tablist" aria-label="Lọc theo khối năng lực">
              {ECOSYSTEM_CATEGORIES.map(c => (
                <button key={c.id} type="button" role="tab" className="s-tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}>
                  {c.id === 'all' ? 'Tất cả' : c.label}<span className="s-tab__count">{counts[c.id]}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="s-center s-muted s-eco-desc" aria-live="polite">{ECOSYSTEM_CATEGORIES.find(c => c.id === cat)?.shortDesc}</p>

          <div className="s-grid s-grid--2">
            {units.map(u => <UnitCard key={u.id} unit={u} />)}
          </div>
        </div>
      </section>

      <section className="s-section s-section--brand" aria-labelledby="eco-map">
        <div className="s-container s-split">
          <div className="s-heading">
            <p className="s-eyebrow">Toàn cảnh</p>
            <h2 className="s-h2" id="eco-map">Mỗi mảnh ghép hỗ trợ mảnh ghép còn lại</h2>
            <p className="s-lead">Phần mềm giúp vận hành, truyền thông mang khách hàng đến, sự kiện và cộng đồng giữ họ ở lại. Doanh nghiệp có thể bắt đầu từ một giải pháp và mở rộng khi cần.</p>
            <div className="s-row s-stack-m" style={{ marginTop: 28 }}>
              <Link className="s-btn s-btn--primary" href="/lien-he/">Trao đổi với DANAVA</Link>
              <Link className="s-btn s-btn--secondary" href="/giai-phap/">Xem giải pháp</Link>
            </div>
          </div>
          <div className="s-frame s-frame--16x10 s-eco-map">
            <img src="/assets/presentation/danava-ecosystem.webp" alt="Sơ đồ hệ sinh thái DANAVA: Studio, Digital, E-learning, PMS, Media và Go" loading="lazy" />
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}

function UnitCard({ unit }: { unit: EcosystemUnit }) {
  const v = UNIT_VISUAL[unit.id] || { icon: Handshake, tone: 'blue' as Tone };
  const link = unit.officialLink;
  return (
    <article id={unit.id} className="s-card s-card--link s-eco-card">
      <div className="s-card__media">
        {v.image
          ? <img src={v.image} alt={unit.name} loading="lazy" />
          : <Visual icon={v.icon} tone={v.tone} label={unit.shortName} chips={unit.features.map(f => f.split(/[,(]/)[0].trim()).filter(f => f.length < 34)} />}
        <span className="s-badge s-badge--dark">{unit.categoryName}</span>
      </div>
      <div className="s-card__body">
        <div className="s-row s-eco-card__meta">
          <span className="s-card__tag">{unit.badge}</span>
          {unit.statusText && <span className="s-badge s-badge--green">{unit.statusText}</span>}
        </div>
        <h3 className="s-card__title">
          {link.isExternal
            ? <a className="s-card__cover" href={link.href} target="_blank" rel="noopener noreferrer">{unit.name}</a>
            : <Link className="s-card__cover" href={link.href}>{unit.name}</Link>}
        </h3>
        <p className="s-card__text">{unit.description}</p>
        <p className="s-small s-muted"><strong>Dành cho:</strong> {unit.targetAudience}</p>
        <ul className="s-eco-card__features">
          {unit.features.slice(0, 3).map(f => <li key={f}>{f}</li>)}
        </ul>
        <div className="s-card__foot">
          <span className="s-link">{link.label}</span>
          <span className="s-card__arrow" aria-hidden="true">{link.isExternal ? <ArrowUpRight /> : <ArrowRight />}</span>
        </div>
      </div>
    </article>
  );
}

export default EcosystemPage;
