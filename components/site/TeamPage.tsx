'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSite } from '../SiteStore';
import { personPhoto } from '@/lib/media';
import { STAFF_DEPARTMENTS, getStaffDetail, getStaffInitials, type StaffDeptId } from '@/lib/staff';
import { verifiedProjects } from '@/lib/verified-projects';
import type { Person, Project } from '@/lib/content';
import { PageHead, SectionHeading, CtaBand } from './ui';

export function StaffAvatar({ person, size = 'lg' }: { person: Pick<Person, 'id' | 'name' | 'image' | 'role' | 'visible'>; size?: 'lg' | 'xl' }) {
  const photo = personPhoto(person as Person);
  return (
    <span className={`s-avatar s-team-avatar s-team-avatar--${size}`}>
      {photo ? <img src={photo} alt={`Ảnh ${person.name}`} loading="lazy" /> : <span aria-hidden="true">{getStaffInitials(person.name)}</span>}
    </span>
  );
}

export default function TeamPage() {
  const { data } = useSite();
  const [dept, setDept] = useState<StaffDeptId>('all');
  const staff = useMemo(() => data.staff.filter(p => p.visible), [data.staff]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: staff.length };
    staff.forEach(p => { const d = getStaffDetail(p).departmentId; map[d] = (map[d] || 0) + 1; });
    return map;
  }, [staff]);

  const shown = dept === 'all' ? staff : staff.filter(p => getStaffDetail(p).departmentId === dept);
  const tabs = STAFF_DEPARTMENTS.filter(d => d.id === 'all' || counts[d.id]);

  const projects: Project[] = useMemo(() => {
    const list = (data.projects && data.projects.length ? data.projects : verifiedProjects).filter(p => p.published);
    return [...list.filter(p => p.featured), ...list.filter(p => !p.featured)].slice(0, 3);
  }, [data.projects]);

  return (
    <main id="main">
      <PageHead
        eyebrow="Con người DANAVA"
        title="Đội ngũ chuyên môn"
        lead="Những người trực tiếp tư vấn, xây dựng và vận hành giải pháp cho khách hàng. Mỗi hồ sơ gắn với dự án thật mà họ đã tham gia."
        crumbs={[{ href: '/', label: 'Trang chủ' }, { href: '/ve-danava/', label: 'Về DANAVA' }, { label: 'Đội ngũ' }]}
      />

      <section className="s-section s-section--flush-top" aria-label="Danh sách nhân sự">
        <div className="s-container">
          {tabs.length > 2 && (
            <div className="s-tabs s-team-tabs" role="tablist" aria-label="Lọc theo phòng ban">
              {tabs.map(d => (
                <button key={d.id} type="button" role="tab" className="s-tab" aria-selected={dept === d.id} onClick={() => setDept(d.id)}>
                  {d.id === 'all' ? 'Tất cả' : d.label}<span className="s-tab__count">{counts[d.id] || 0}</span>
                </button>
              ))}
            </div>
          )}

          {shown.length ? (
            <div className="s-grid s-grid--3">
              {shown.map(p => {
                const detail = getStaffDetail(p);
                return (
                  <article key={p.id} className="s-card s-card--link s-card--pad s-team-card">
                    <StaffAvatar person={p} />
                    <div className="s-team-card__body">
                      <p className="s-card__tag">{detail.departmentName}</p>
                      <h2 className="s-card__title">
                        <Link className="s-card__cover" href={`/doi-ngu/${p.id}/`}>{p.name}</Link>
                      </h2>
                      <p className="s-team-card__role">{p.role}</p>
                      <p className="s-card__text">{detail.expertise.slice(0, 3).join(' · ')}</p>
                    </div>
                    <div className="s-card__foot">
                      <span className="s-link">Xem hồ sơ</span>
                      <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="s-empty">Chưa có hồ sơ công khai trong phòng ban này.</p>
          )}
        </div>
      </section>

      {projects.length > 0 && (
        <section className="s-section s-section--soft" aria-labelledby="s-team-projects">
          <div className="s-container">
            <SectionHeading
              id="s-team-projects"
              eyebrow="Dự án tiêu biểu"
              title="Đội ngũ đã cùng làm"
              lead="Các dự án triển khai thực tế, có thể đối chiếu trên trang Dự án."
              action={<Link className="s-btn s-btn--secondary" href="/du-an/">Tất cả dự án</Link>}
            />
            <div className="s-grid s-grid--3 s-snap">
              {projects.map(p => (
                <article key={p.id} className="s-card s-card--link">
                  <div className="s-card__media">{p.image && <img src={p.image} alt="" loading="lazy" />}</div>
                  <div className="s-card__body">
                    <p className="s-card__tag">{p.category}</p>
                    <h3 className="s-card__title"><Link className="s-card__cover" href={`/du-an/${p.slug}/`}>{p.title}</Link></h3>
                    <p className="s-card__text">{p.client}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand title="Làm việc cùng đội ngũ DANAVA" lead="Gặp trực tiếp người phụ trách giải pháp phù hợp với bài toán của bạn." />
    </main>
  );
}
