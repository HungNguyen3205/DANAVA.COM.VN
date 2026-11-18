'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Target, Lightbulb, Trophy, Users } from 'lucide-react';
import type { Person, Project } from '@/lib/content';
import { useSite } from '../SiteStore';
import { excerpt } from './catalog';
import { PageHead, SectionHeading, CtaBand, Crumbs, Visual } from './ui';
import { StaffAvatar } from './TeamPage';

/* ---------- Helpers ---------- */
export function getProjectIndustry(p: { client?: string; title?: string; summary?: string; category?: string }): string {
  const text = `${p.client || ''} ${p.title || ''} ${p.summary || ''} ${p.category || ''}`.toLowerCase();
  if (text.includes('pilates') || text.includes('yoga')) return 'Pilates & Yoga';
  if (text.includes('gym') || text.includes('fitness') || text.includes('thể hình')) return 'Gym & Fitness';
  if (text.includes('spa') || text.includes('trị liệu') || text.includes('soundbath') || text.includes('massage')) return 'Wellness & Trị liệu';
  if (text.includes('tour') || text.includes('du lịch') || text.includes('sự kiện') || text.includes('workshop')) return 'Du lịch & Sự kiện';
  return 'Dịch vụ & Doanh nghiệp';
}

const PROJECT_ROLES: Record<string, Record<string, string>> = {
  'hariver-studio': {
    thanh: 'Chỉ đạo giải pháp & kiến trúc hệ thống',
    trang: 'Triển khai vận hành quầy & đào tạo lễ tân',
    avinash: 'Thiết kế nhận diện số & giao diện app hội viên',
    thong: 'Quản lý triển khai kỹ thuật & thiết bị check-in'
  },
  'hue-studio': {
    thanh: 'Chỉ đạo giải pháp & luồng đặt lịch',
    trang: 'Đào tạo nhân sự & hướng dẫn hội viên',
    avinash: 'Thiết kế thời khóa biểu & trải nghiệm đặt chỗ',
    thong: 'Quản lý triển khai & kiểm thử sĩ số lớp'
  }
};

/** Đội ngũ tham gia dự án: chỉ hiển thị khi đã có phân công được xác nhận. */
export function getProjectTeam(projectId: string, staff: Person[]) {
  const roles = PROJECT_ROLES[projectId];
  if (!roles) return [];
  return staff.filter(s => s.visible && roles[s.id]).map(s => ({ ...s, projectRole: roles[s.id] }));
}

/** Tìm dự án theo id hoặc slug chuẩn hóa (hỗ trợ đường dẫn cũ). */
export function findProject(list: Project[], slug: string) {
  return list.find(p => p.slug === slug) || list.find(p => p.id === slug);
}

/** Ảnh bổ sung cho từng dự án đã kiểm chứng. */
export function projectGallery(p: Project) {
  const items: { src: string; caption: string }[] = [];
  if (p.image) items.push({ src: p.image, caption: p.client || p.title });
  if (p.id === 'hariver-studio' || p.slug === 'hariver-gym-danava-studio') {
    items.push({ src: '/assets/presentation/studio-dashboard.webp', caption: 'Bảng điều khiển DANAVA Studio: hội viên, check-in và gói tập' });
  } else if (p.id === 'hue-studio' || p.slug === 'hue-pilates-yoga-danava-studio') {
    items.push({ src: '/assets/presentation/studio-dashboard.webp', caption: 'Quản lý lịch lớp, sĩ số và danh sách chờ trên DANAVA Studio' });
  }
  return items.filter((v, i, a) => a.findIndex(x => x.src === v.src) === i);
}

/* ---------- Card ---------- */
export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <Visual icon={Users} label={p.client || p.title} />}
        <span className="s-badge s-badge--dark">{getProjectIndustry(p)}</span>
      </div>
      <div className="s-card__body">
        <p className="s-card__tag">{p.category}</p>
        <h3 className="s-card__title"><Link className="s-card__cover" href={`/du-an/${p.slug}/`}>{p.title}</Link></h3>
        <p className="s-card__text">{excerpt(p.summary, 160)}</p>
        <div className="s-card__foot">
          <span className="s-muted s-small">{p.client}</span>
          <span className="s-card__arrow" aria-hidden="true"><ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================================
   /du-an/
   ========================================================================== */
export function ProjectsIndex() {
  const { data } = useSite();
  const projects = useMemo(() => {
    const list = (data.projects || []).filter(p => p.published);
    return [...list.filter(p => p.featured), ...list.filter(p => !p.featured)];
  }, [data.projects]);
  const industries = useMemo(() => Array.from(new Set(projects.map(getProjectIndustry))), [projects]);
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? projects : projects.filter(p => getProjectIndustry(p) === filter);

  return (
    <main id="main">
      <PageHead
        center
        eyebrow="Dự án"
        title={<>Câu chuyện <span className="s-hl">triển khai thực tế</span></>}
        lead="Những doanh nghiệp đang vận hành và phát triển cùng DANAVA. Mỗi dự án đều có nguồn kiểm chứng."
      />
      <section className="s-section s-section--flush-top" aria-label="Danh sách dự án">
        <div className="s-container">
          {industries.length > 1 && (
            <div className="s-row s-row--center s-proj-tabs">
              <div className="s-tabs" role="tablist" aria-label="Lọc theo lĩnh vực">
                <button type="button" role="tab" className="s-tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>Tất cả<span className="s-tab__count">{projects.length}</span></button>
                {industries.map(i => (
                  <button key={i} type="button" role="tab" className="s-tab" aria-selected={filter === i} onClick={() => setFilter(i)}>{i}</button>
                ))}
              </div>
            </div>
          )}
          {shown.length ? (
            <div className={`s-grid ${shown.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
              {shown.map(p => <ProjectCard key={p.id} p={p} />)}
            </div>
          ) : (
            <p className="s-empty">Chưa có dự án được công bố trong nhóm này.</p>
          )}
        </div>
      </section>
      <CtaBand title="Dự án tiếp theo có thể là của bạn" lead="Chia sẻ bài toán của doanh nghiệp, DANAVA sẽ đề xuất cách triển khai phù hợp." />
    </main>
  );
}

/* ==========================================================================
   /du-an/[slug]/
   ========================================================================== */
export function ProjectDetail({ slug }: { slug: string }) {
  const { data } = useSite();
  const all = (data.projects || []).filter(p => p.published);
  const p = findProject(all, slug);
  if (!p) return null;

  const team = getProjectTeam(p.id, data.staff);
  const gallery = projectGallery(p);
  const others = all.filter(x => x.id !== p.id).slice(0, 3);
  const story = [
    { icon: Target, label: 'Thách thức', text: p.challenge },
    { icon: Lightbulb, label: 'Giải pháp', text: p.solution },
    { icon: Trophy, label: 'Kết quả', text: p.result }
  ].filter(s => s.text?.trim());

  return (
    <main id="main">
      <header className="s-proj-hero">
        <div className="s-container">
          <div className="s-proj-hero__head">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { href: '/du-an/', label: 'Dự án' }, { label: p.client || p.title }]} />
            <div className="s-row">
              {p.category && <span className="s-badge">{p.category}</span>}
              <span className="s-badge s-badge--neutral">{getProjectIndustry(p)}</span>
            </div>
            <h1 className="s-h1">{p.title}</h1>
            {p.summary && <p className="s-lead">{p.summary}</p>}
            <dl className="s-proj-facts">
              {p.client && <div><dt>Khách hàng</dt><dd>{p.client}</dd></div>}
              {p.category && <div><dt>Giải pháp</dt><dd>{p.category}</dd></div>}
              <div><dt>Lĩnh vực</dt><dd>{getProjectIndustry(p)}</dd></div>
            </dl>
          </div>
          {p.image && (
            <div className="s-frame s-proj-hero__img">
              <img src={p.image} alt={p.title} fetchPriority="high" />
            </div>
          )}
        </div>
      </header>

      {story.length > 0 && (
        <section className="s-section" aria-label="Câu chuyện dự án">
          <div className="s-container s-container--narrow s-proj-story">
            {story.map(s => (
              <div key={s.label} className="s-proj-story__row">
                <div className="s-proj-story__label"><span className="s-icon"><s.icon aria-hidden="true" /></span><h2 className="s-h3">{s.label}</h2></div>
                <div className="s-prose">{s.text.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 1 && (
        <section className="s-section s-section--soft" aria-labelledby="proj-gallery">
          <div className="s-container">
            <SectionHeading eyebrow="Hình ảnh" title={<span id="proj-gallery">Triển khai thực tế</span>} />
            <div className="s-grid s-grid--2 s-snap">
              {gallery.map(g => (
                <figure key={g.src} className="s-proj-figure">
                  <div className="s-frame s-frame--plain s-frame--16x10"><img src={g.src} alt={g.caption} loading="lazy" /></div>
                  <figcaption className="s-small s-muted">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="s-section" aria-labelledby="proj-team">
          <div className="s-container">
            <SectionHeading eyebrow="Đội ngũ" title={<span id="proj-team">Những người thực hiện</span>} />
            <div className="s-grid s-grid--4 s-snap s-snap--sm">
              {team.map(m => (
                <Link key={m.id} href={`/doi-ngu/${m.id}/`} className="s-card s-card--pad s-card--link s-proj-member">
                  <StaffAvatar person={m} />
                  <strong className="s-h4">{m.name}</strong>
                  <span className="s-small s-muted">{m.projectRole}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {p.source && (
        <section className="s-section s-section--tight s-section--line" aria-label="Nguồn">
          <div className="s-container s-row s-row--between">
            <p className="s-text">Thông tin dự án được đối chiếu từ nguồn công khai của DANAVA.</p>
            <a className="s-link" href={p.source} target="_blank" rel="noopener noreferrer">Xem nguồn <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="s-section s-section--soft" aria-labelledby="proj-others">
          <div className="s-container">
            <SectionHeading eyebrow="Dự án khác" title={<span id="proj-others">Xem thêm câu chuyện</span>} />
            <div className={`s-grid s-snap ${others.length >= 3 ? 's-grid--3' : 's-grid--2'}`}>
              {others.map(o => <ProjectCard key={o.id} p={o} />)}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </main>
  );
}
