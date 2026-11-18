'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail, Phone, Link2 } from 'lucide-react';
import type { StaffFullProfile } from '@/lib/staff';
import { useSite } from '../SiteStore';
import { Crumbs, CheckList, CtaBand } from './ui';
import { StaffAvatar } from './TeamPage';

const linkIcon = { email: Mail, phone: Phone, external: ArrowUpRight, internal: Link2 } as const;

export default function StaffProfile({ profile }: { profile: StaffFullProfile }) {
  const { data } = useSite();
  const person = data.staff.find(p => p.id === profile.id) || { id: profile.id, name: profile.name, role: profile.role, visible: true };

  return (
    <main id="main">
      <header className="s-pagehead s-pagehead--soft">
        <div className="s-container">
          <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/doi-ngu/', label: 'Đội ngũ' }, { label: profile.name }]} />
          <div className="s-team-hero">
            <StaffAvatar person={person} size="xl" />
            <div className="s-team-hero__text">
              <p className="s-eyebrow">{profile.departmentName}</p>
              <h1 className="s-h1">{profile.name}</h1>
              <p className="s-team-hero__role">{profile.role}{profile.experienceYears ? ` · ${profile.experienceYears}` : ''}</p>
              <p className="s-lead">{profile.intro}</p>
              {profile.verifiedLinks.length > 0 && (
                <div className="s-row s-team-links">
                  {profile.verifiedLinks.map(l => {
                    const Icon = linkIcon[l.type];
                    const external = l.type === 'external';
                    return (
                      <a key={l.url} className="s-btn s-btn--secondary s-btn--sm" href={l.url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        <Icon aria-hidden="true" />{l.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {profile.skillGroups.length > 0 && (
        <section className="s-section s-section--tight" aria-labelledby="s-team-skills">
          <div className="s-container">
            <h2 className="s-h3 s-team-section-title" id="s-team-skills">Chuyên môn</h2>
            <div className="s-grid s-grid--2">
              {profile.skillGroups.map(g => (
                <div key={g.category} className="s-card s-card--soft s-card--pad">
                  <h3 className="s-h4">{g.category}</h3>
                  <ul className="s-team-chips">
                    {g.skills.map(s => <li key={s} className="s-badge s-badge--neutral">{s}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="s-section s-section--tight s-section--line" aria-labelledby="s-team-projects-h">
        <div className="s-container">
          <h2 className="s-h3 s-team-section-title" id="s-team-projects-h">Dự án đã tham gia</h2>
          {profile.projects.length ? (
            <div className="s-team-projects">
              {profile.projects.map(p => (
                <article key={p.projectId} className="s-card s-team-project">
                  <div className="s-team-project__media">{p.image && <img src={p.image} alt={p.projectTitle} loading="lazy" />}</div>
                  <div className="s-team-project__body">
                    <p className="s-card__tag">{p.category} · {p.client}</p>
                    <h3 className="s-card__title">{p.projectTitle}</h3>
                    <div className="s-team-role">
                      <span className="s-team-role__label">VAI TRÒ TRONG DỰ ÁN</span>
                      <span className="s-team-role__value">{p.roleInProject}</span>
                    </div>
                    {p.contributions.length > 0 && <CheckList items={p.contributions} />}
                    {p.resultHighlight && <p className="s-alert s-alert--ok">{p.resultHighlight}</p>}
                    <Link className="s-link" href={`/du-an/${p.projectSlug}/`}>Xem dự án <ArrowRight aria-hidden="true" /></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="s-empty">Hồ sơ dự án đang được cập nhật.</p>
          )}
        </div>
      </section>

      {profile.personalProducts.length > 0 && (
        <section className="s-section s-section--tight s-section--soft" aria-labelledby="s-team-products">
          <div className="s-container">
            <h2 className="s-h3 s-team-section-title" id="s-team-products">Sản phẩm & đóng góp</h2>
            <div className="s-grid s-grid--3">
              {profile.personalProducts.map(item => (
                <article key={item.title} className={`s-card s-card--pad${item.link ? ' s-card--link' : ''}`}>
                  <span className="s-badge">{item.badge}</span>
                  <h3 className="s-card__title s-team-product__title">
                    {item.link ? <Link className="s-card__cover" href={item.link}>{item.title}</Link> : item.title}
                  </h3>
                  <p className="s-card__text">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="s-container s-team-back">
        <Link className="s-link" href="/doi-ngu/"><ArrowLeft aria-hidden="true" />Quay lại danh sách Đội ngũ</Link>
      </div>

      <CtaBand title={`Trao đổi cùng ${profile.name.split(' ').slice(-1)[0]} và đội ngũ`} />
    </main>
  );
}
