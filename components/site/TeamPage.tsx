'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSite } from '../SiteStore';
import { personPhoto } from '@/lib/media';
import { STAFF_DEPARTMENTS, getStaffInitials, type StaffDeptId } from '@/lib/staff';
import { block, staffDetailFor } from '@/lib/blocks';
import { verifiedProjects } from '@/lib/verified-projects';
import type { Person, Project } from '@/lib/content';
import { PageHead, SectionHeading, CtaBand } from './ui';
import { pageCopy } from '@/lib/blocks';
import { rich } from './rich';
import { cmsText, ct } from './cms';

const STAFF = { scope: 'record', scopeLabel: 'Hồ sơ nhân sự' } as const;
const PROJECT = { scope: 'record', scopeLabel: 'Hồ sơ dự án' } as const;

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
  const copy = pageCopy(data, 'doi-ngu');
  const [dept, setDept] = useState<StaffDeptId>('all');
  const staff = useMemo(() => data.staff.filter(p => p.visible), [data.staff]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: staff.length };
    staff.forEach(p => { const d = staffDetailFor(data, p).departmentId; map[d] = (map[d] || 0) + 1; });
    return map;
  }, [staff]);

  const shown = dept === 'all' ? staff : staff.filter(p => staffDetailFor(data, p).departmentId === dept);
  const tabs = STAFF_DEPARTMENTS.filter(d => d.id === 'all' || counts[d.id]);

  const projects: Project[] = useMemo(() => {
    const list = (data.projects && data.projects.length ? data.projects : verifiedProjects).filter(p => p.published);
    return [...list.filter(p => p.featured), ...list.filter(p => !p.featured)].slice(0, 3);
  }, [data.projects]);
  // Dự án lấy từ dữ liệu (không phải danh sách mặc định) mới sửa được trên trang
  const projectsEditable = !!(data.projects && data.projects.length);
  const staffBlocks = block(data, 'staff');

  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `team.${k}`, def, label, opts);
  const cardCta = t('card.cta', 'Xem hồ sơ', 'Chữ liên kết thẻ');
  const empty = t('empty', 'Chưa có hồ sơ công khai trong phòng ban này.', 'Thông báo trống');
  const pjEyebrow = t('projects.eyebrow', 'Dự án tiêu biểu', 'Dòng chữ nhỏ');
  const pjTitle = t('projects.title', 'Đội ngũ đã cùng làm', 'Tiêu đề');
  const pjLead = t('projects.lead', 'Các dự án triển khai thực tế, có thể đối chiếu trên trang Dự án.', 'Câu dẫn', { multiline: true });
  const pjButton = t('projects.button', 'Tất cả dự án', 'Nút');

  return (
    <main id="main">
      <PageHead
        eyebrow={<span {...cmsText('pages.doi-ngu.kicker', 'Dòng chữ nhỏ')}>{copy.kicker}</span>}
        title={<span {...cmsText('pages.doi-ngu.title', 'Tiêu đề trang', { rich: true })}>{rich(copy.title)}</span>}
        lead={copy.lead ? <span {...cmsText('pages.doi-ngu.lead', 'Câu dẫn', { multiline: true })}>{copy.lead}</span> : undefined}
        crumbs={[{ href: '/', label: 'Trang chủ' }, { href: '/ve-danava/', label: 'Về DANAVA' }, { label: 'Đội ngũ' }]}
      />

      <section className="s-section s-section--flush-top" aria-label="Danh sách nhân sự">
        <div className="s-container">
          {tabs.length > 2 && (
            <div className="s-tabs s-team-tabs" role="tablist" aria-label="Lọc theo phòng ban">
              {tabs.map(d => {
                const tab = t(`tabs.${d.id}`, d.id === 'all' ? 'Tất cả' : d.label, 'Tên phòng ban (bộ lọc)');
                return (
                <button key={d.id} type="button" role="tab" className="s-tab" aria-selected={dept === d.id} onClick={() => setDept(d.id)}>
                  <span {...tab.a}>{tab.v}</span><span className="s-tab__count">{counts[d.id] || 0}</span>
                </button>
                );
              })}
            </div>
          )}

          {shown.length ? (
            <div className="s-grid s-grid--3">
              {shown.map(p => {
                const detail = staffDetailFor(data, p);
                const bi = staffBlocks.findIndex(x => x.id === p.id);
                return (
                  <article key={p.id} className="s-card s-card--link s-card--pad s-team-card">
                    <StaffAvatar person={p} />
                    <div className="s-team-card__body">
                      <p className="s-card__tag" {...(bi >= 0 ? cmsText(`block.staff.${bi}.departmentName`, 'Phòng ban') : {})}>{detail.departmentName}</p>
                      <h2 className="s-card__title">
                        <Link className="s-card__cover" href={`/doi-ngu/${p.id}/`}><span {...cmsText(`rec.staff.${p.id}.name`, 'Họ tên', STAFF)}>{p.name}</span></Link>
                      </h2>
                      <p className="s-team-card__role" {...cmsText(`rec.staff.${p.id}.role`, 'Chức vụ', STAFF)}>{p.role}</p>
                      <p className="s-card__text">{detail.expertise.slice(0, 3).join(' · ')}</p>
                    </div>
                    <div className="s-card__foot">
                      <span className="s-link" {...cardCta.a}>{cardCta.v}</span>
                      <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="s-empty" {...empty.a}>{empty.v}</p>
          )}
        </div>
      </section>

      {projects.length > 0 && (
        <section className="s-section s-section--soft" aria-labelledby="s-team-projects">
          <div className="s-container">
            <SectionHeading
              id="s-team-projects"
              eyebrow={<span {...pjEyebrow.a}>{pjEyebrow.v}</span>}
              title={<span {...pjTitle.a}>{pjTitle.v}</span>}
              lead={<span {...pjLead.a}>{pjLead.v}</span>}
              action={<Link className="s-btn s-btn--secondary" href="/du-an/"><span {...pjButton.a}>{pjButton.v}</span></Link>}
            />
            <div className="s-grid s-grid--3 s-snap">
              {projects.map(p => (
                <article key={p.id} className="s-card s-card--link">
                  <div className="s-card__media">{p.image && <img src={p.image} alt="" loading="lazy" />}</div>
                  <div className="s-card__body">
                    <p className="s-card__tag" {...(projectsEditable ? cmsText(`rec.projects.${p.id}.category`, 'Lĩnh vực dự án', PROJECT) : {})}>{p.category}</p>
                    <h3 className="s-card__title"><Link className="s-card__cover" href={`/du-an/${p.slug}/`}><span {...(projectsEditable ? cmsText(`rec.projects.${p.id}.title`, 'Tên dự án', PROJECT) : {})}>{p.title}</span></Link></h3>
                    <p className="s-card__text" {...(projectsEditable ? cmsText(`rec.projects.${p.id}.client`, 'Khách hàng', PROJECT) : {})}>{p.client}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand data={data} cms={{ title: 'pages.doi-ngu.ctaTitle', lead: copy.ctaLead ? 'pages.doi-ngu.ctaLead' : 'pages.mac-dinh.ctaLead' }} title={rich(copy.ctaTitle)} lead={copy.ctaLead || pageCopy(data, 'mac-dinh').ctaLead} />
    </main>
  );
}
