'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail, Phone, Link2 } from 'lucide-react';
import type { StaffFullProfile } from '@/lib/staff';
import { block, pageCopy, staffBlockFor, staffProfileFor } from '@/lib/blocks';
import { useSite } from '../SiteStore';
import { Crumbs, CheckList, CtaBand } from './ui';
import { StaffAvatar } from './TeamPage';
import { cmsText, ct } from './cms';

const linkIcon = { email: Mail, phone: Phone, external: ArrowUpRight, internal: Link2 } as const;
const STAFF = { scope: 'record', scopeLabel: 'Hồ sơ nhân sự' } as const;
const PROJECT = { scope: 'record', scopeLabel: 'Hồ sơ dự án' } as const;

export default function StaffProfile({ profile: initial }: { profile: StaffFullProfile }) {
  const { data } = useSite();
  const staffPerson = data.staff.find(p => p.id === initial.id);
  const person = staffPerson || { id: initial.id, name: initial.name, role: initial.role, visible: true };
  // Hồ sơ tính lại từ dữ liệu trên trình duyệt → bản sửa / bản dịch trong trình biên tập hiện ngay
  const profile = useMemo(() => (staffPerson ? staffProfileFor(data, staffPerson) : initial), [data, staffPerson, initial]);

  // Vị trí hồ sơ trong khối CMS "staff" (block.staff.<vị trí>.<trường>, lib/cms-paths.ts); không có = không sửa tại đây
  const bi = staffPerson ? block(data, 'staff').findIndex(x => x.id === staffPerson.id) : -1;
  const edit = staffPerson ? staffBlockFor(data, staffPerson) : null;
  const S = (path: string, label: string, opts: { multiline?: boolean } = {}) => (bi >= 0 ? cmsText(`block.staff.${bi}.${path}`, label, opts) : {});
  const R = (field: string, label: string) => (staffPerson ? cmsText(`rec.staff.${staffPerson.id}.${field}`, label, STAFF) : {});
  const P = (projectId: string, field: string, label: string) => (data.projects?.some(p => p.id === projectId) ? cmsText(`rec.projects.${projectId}.${field}`, label, PROJECT) : {});
  const roleAt = (projectId: string) => (edit ? edit.projectRoles.findIndex(r => r.projectId === projectId) : -1);
  const deptPath = edit?.profileDepartmentName ? 'profileDepartmentName' : 'departmentName';

  const t = (k: string, def: string, label: string) => ct(data, `team.profile.${k}`, def, label);
  const skillsTitle = t('skills.title', 'Chuyên môn', 'Tiêu đề khối');
  const projectsTitle = t('projects.title', 'Dự án đã tham gia', 'Tiêu đề khối');
  const roleLabel = t('projects.role-label', 'VAI TRÒ TRONG DỰ ÁN', 'Nhãn vai trò');
  const projectLink = t('projects.link', 'Xem dự án', 'Chữ liên kết');
  const projectsEmpty = t('projects.empty', 'Hồ sơ dự án đang được cập nhật.', 'Thông báo trống');
  const productsTitle = t('products.title', 'Sản phẩm & đóng góp', 'Tiêu đề khối');
  const back = t('back', 'Quay lại danh sách Đội ngũ', 'Liên kết quay lại');
  const ctaBefore = t('cta.before-name', 'Trao đổi cùng', 'Dải cuối trang: tiêu đề (trước tên)');
  const ctaAfter = t('cta.after-name', 'và đội ngũ', 'Dải cuối trang: tiêu đề (sau tên)');
  const ctaLead = pageCopy(data, 'mac-dinh').ctaLead;

  return (
    <main id="main">
      <header className="s-pagehead s-pagehead--soft">
        <div className="s-container">
          <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/doi-ngu/', label: 'Đội ngũ' }, { label: profile.name }]} />
          <div className="s-team-hero">
            <StaffAvatar person={person} size="xl" />
            <div className="s-team-hero__text">
              <p className="s-eyebrow" {...S(deptPath, 'Phòng ban')}>{profile.departmentName}</p>
              <h1 className="s-h1" {...R('name', 'Họ tên')}>{profile.name}</h1>
              <p className="s-team-hero__role"><span {...R('role', 'Chức vụ')}>{profile.role}</span>{profile.experienceYears ? <> · <span {...S('experienceYears', 'Số năm kinh nghiệm')}>{profile.experienceYears}</span></> : ''}</p>
              <p className="s-lead" {...S('intro', 'Giới thiệu', { multiline: true })}>{profile.intro}</p>
              {profile.verifiedLinks.length > 0 && (
                <div className="s-row s-team-links">
                  {profile.verifiedLinks.map((l, i) => {
                    const Icon = linkIcon[l.type];
                    const external = l.type === 'external';
                    return (
                      <a key={l.url} className="s-btn s-btn--secondary s-btn--sm" href={l.url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        <Icon aria-hidden="true" /><span {...S(`verifiedLinks.${i}.label`, 'Chữ liên kết')}>{l.label}</span>
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
            <h2 className="s-h3 s-team-section-title" id="s-team-skills" {...skillsTitle.a}>{skillsTitle.v}</h2>
            <div className="s-grid s-grid--2">
              {profile.skillGroups.map((g, gi) => (
                <div key={g.category + gi} className="s-card s-card--soft s-card--pad">
                  <h3 className="s-h4" {...S(`skillGroups.${gi}.category`, 'Nhóm chuyên môn')}>{g.category}</h3>
                  <ul className="s-team-chips">
                    {g.skills.map((s, si) => <li key={s + si} className="s-badge s-badge--neutral" {...S(`skillGroups.${gi}.skills.${si}`, 'Kỹ năng')}>{s}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="s-section s-section--tight s-section--line" aria-labelledby="s-team-projects-h">
        <div className="s-container">
          <h2 className="s-h3 s-team-section-title" id="s-team-projects-h" {...projectsTitle.a}>{projectsTitle.v}</h2>
          {profile.projects.length ? (
            <div className="s-team-projects">
              {profile.projects.map(p => {
                const ri = roleAt(p.projectId);
                const RP = (path: string, label: string) => (ri >= 0 ? S(`projectRoles.${ri}.${path}`, label) : {});
                return (
                  <article key={p.projectId} className="s-card s-team-project">
                    <div className="s-team-project__media">{p.image && <img src={p.image} alt={p.projectTitle} loading="lazy" />}</div>
                    <div className="s-team-project__body">
                      <p className="s-card__tag"><span {...P(p.projectId, 'category', 'Lĩnh vực dự án')}>{p.category}</span> · <span {...P(p.projectId, 'client', 'Khách hàng')}>{p.client}</span></p>
                      <h3 className="s-card__title" {...P(p.projectId, 'title', 'Tên dự án')}>{p.projectTitle}</h3>
                      <div className="s-team-role">
                        <span className="s-team-role__label" {...roleLabel.a}>{roleLabel.v}</span>
                        <span className="s-team-role__value" {...RP('role', 'Vai trò trong dự án')}>{p.roleInProject}</span>
                      </div>
                      {p.contributions.length > 0 && <CheckList items={p.contributions.map((c, ci) => <span key={ci} {...RP(`contributions.${ci}`, 'Đóng góp')}>{c}</span>)} />}
                      {p.resultHighlight && <p className="s-alert s-alert--ok" {...RP('resultHighlight', 'Kết quả nổi bật')}>{p.resultHighlight}</p>}
                      <Link className="s-link" href={`/du-an/${p.projectSlug}/`}><span {...projectLink.a}>{projectLink.v}</span> <ArrowRight aria-hidden="true" /></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="s-empty" {...projectsEmpty.a}>{projectsEmpty.v}</p>
          )}
        </div>
      </section>

      {profile.personalProducts.length > 0 && (
        <section className="s-section s-section--tight s-section--soft" aria-labelledby="s-team-products">
          <div className="s-container">
            <h2 className="s-h3 s-team-section-title" id="s-team-products" {...productsTitle.a}>{productsTitle.v}</h2>
            <div className="s-grid s-grid--3">
              {profile.personalProducts.map((item, i) => (
                <article key={item.title + i} className={`s-card s-card--pad${item.link ? ' s-card--link' : ''}`}>
                  <span className="s-badge" {...S(`personalProducts.${i}.badge`, 'Nhãn')}>{item.badge}</span>
                  <h3 className="s-card__title s-team-product__title">
                    {item.link
                      ? <Link className="s-card__cover" href={item.link}><span {...S(`personalProducts.${i}.title`, 'Tên sản phẩm')}>{item.title}</span></Link>
                      : <span {...S(`personalProducts.${i}.title`, 'Tên sản phẩm')}>{item.title}</span>}
                  </h3>
                  <p className="s-card__text" {...S(`personalProducts.${i}.description`, 'Mô tả', { multiline: true })}>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="s-container s-team-back">
        <Link className="s-link" href="/doi-ngu/"><ArrowLeft aria-hidden="true" /><span {...back.a}>{back.v}</span></Link>
      </div>

      <CtaBand
        data={data}
        cms={{ lead: 'pages.mac-dinh.ctaLead' }}
        title={<><span {...ctaBefore.a}>{ctaBefore.v}</span> {profile.name.split(' ').slice(-1)[0]} <span {...ctaAfter.a}>{ctaAfter.v}</span></>}
        lead={ctaLead}
      />
    </main>
  );
}
