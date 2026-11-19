'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import type { Project } from '@/lib/content';
import { useSite } from '../SiteStore';
import { excerpt } from './catalog';
import { PageHead, CtaBand, Visual } from './ui';

export { getProjectTeam, findProject, projectGallery } from './project-helpers';

/* ---------- Card ---------- */
export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="s-card s-card--link">
      <div className="s-card__media">
        {p.image ? <img src={p.image} alt={p.title} loading="lazy" decoding="async" /> : <Visual icon={Users} label={p.client || p.title} />}
        {p.industry && <span className="s-badge s-badge--dark">{p.industry}</span>}
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
  // Lọc theo ngành được nhập trong CMS (không suy đoán theo từ khóa).
  const industries = useMemo(() => Array.from(new Set(projects.map(p => p.industry || '').filter(Boolean))), [projects]);
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? projects : projects.filter(p => p.industry === filter);

  return (
    <main id="main">
      <PageHead
        center
        crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Dự án' }]}
        eyebrow="Dự án"
        title={<>Câu chuyện <span className="s-hl">triển khai thực tế</span></>}
        lead="Những doanh nghiệp đang vận hành cùng DANAVA. Mỗi case study ghi rõ phạm vi đã thực hiện và nguồn đối chiếu."
      />
      <section className="s-section s-section--flush-top" aria-label="Danh sách dự án">
        <div className="s-container">
          {industries.length > 1 && (
            <div className="s-row s-row--center s-proj-tabs">
              <div className="s-tabs" role="group" aria-label="Lọc theo lĩnh vực">
                <button type="button" className={`s-tab${filter === 'all' ? ' is-active' : ''}`} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Tất cả<span className="s-tab__count">{projects.length}</span></button>
                {industries.map(i => (
                  <button key={i} type="button" className={`s-tab${filter === i ? ' is-active' : ''}`} aria-pressed={filter === i} onClick={() => setFilter(i)}>{i}</button>
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
      <CtaBand title="Dự án tiếp theo có thể là của bạn" lead="Chia sẻ bài toán của doanh nghiệp, DANAVA sẽ đề xuất cách triển khai phù hợp." primary={{ href: '/lien-he/', label: 'Nhận tư vấn' }} />
    </main>
  );
}
