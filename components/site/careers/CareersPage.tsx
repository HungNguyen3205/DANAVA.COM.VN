/**
 * /tuyen-dung/ — ý tưởng xuyên suốt: "tấm thẻ nhân viên tiếp theo mang tên bạn".
 * Bìa (thẻ đeo đổi theo tên bạn gõ) → 01 Vị trí + bốn cánh cửa theo mảng → 02 Cách làm việc (giấy nhớ)
 * → 03 Thư nhà sáng lập → 04 Đồng đội (dây treo thẻ) → 05 Đời sống (dây phơi ảnh) → 06 Gửi hồ sơ.
 * Chỉ dùng nội dung thật: nhân sự, nguyên tắc, ảnh, lời nhà sáng lập đã có trên website. Không có lời chứng thực tự viết.
 */
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowDown, CalendarDays, Clock, MapPin, Plus, Wallet } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { block, staffDetailFor } from '@/lib/blocks';
import { personPhoto } from '@/lib/media';
import { getStaffInitials } from '@/lib/staff';
import { ABOUT_DANAVA } from '@/lib/about-danava';
import { TEAMS, openJobs, positionsFor, teamLabel } from '@/lib/careers';
import { Crumbs } from '../ui';
import { rich } from '../rich';
import { CONTACT, formatDate } from '../catalog';
import { Reveal } from '../HomeClient';
import { ApplyForm, CareersProvider, LiveBadge, NameField, PickPosition } from './CareersClient';

const vars = (values: Record<string, string | number>) => values as CSSProperties;

function Heading({ id, no, label, children, lead }: { id: string; no: string; label: string; children: ReactNode; lead?: ReactNode }) {
  return (
    <header className="td-head" data-reveal>
      <p className="td-no"><b>{no}</b>{label}</p>
      <h2 className="td-h2" id={id}>{children}</h2>
      {lead && <p className="td-text">{lead}</p>}
    </header>
  );
}

export function CareersPage({ data }: { data: SiteData }) {
  const careers = block(data, 'careers');
  const company = block(data, 'company');
  const principles = block(data, 'about').principles;
  const gallery = block(data, 'gallery');
  const photos = gallery.photos.filter(p => p.visible && p.image).slice(0, 5);
  const jobs = openJobs(careers);
  const email = data.email || CONTACT.email;
  const motto = data.headline || 'Cùng bạn phát triển.';
  const people = data.staff.filter(p => p.visible).map(person => ({ person, photo: personPhoto(person), detail: staffDetailFor(data, person) }));
  const founder = ABOUT_DANAVA.founder;

  return (
    <main id="main" className="td">
      <Reveal root="main.td" />
      <CareersProvider positions={positionsFor(jobs)}>

        {/* Bìa */}
        <section className="td-hero" aria-labelledby="td-title">
          <div className="s-container">
            <Crumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Tuyển dụng' }]} />
            <div className="td-hero__grid">
              <div className="td-hero__copy">
                <p className="td-kicker">{careers.kicker}</p>
                <h1 className="td-title" id="td-title">{rich(careers.title)}</h1>
                <p className="td-lead">{careers.lead}</p>
                <NameField />
                <div className="td-hero__links">
                  <a href="#vi-tri">{jobs.length ? `Xem ${jobs.length} vị trí đang tuyển` : 'Tìm chỗ của bạn'} <ArrowDown aria-hidden="true" /></a>
                  <span><MapPin aria-hidden="true" />{company.address}</span>
                </div>
              </div>
              <LiveBadge motto={motto} />
            </div>
          </div>
        </section>

        {/* 01 Vị trí */}
        <section className="td-sec td-roles" id="vi-tri" aria-labelledby="td-roles">
          <div className="s-container">
            <Heading id="td-roles" no="01" label="Vị trí" lead={jobs.length ? 'Bấm vào từng vị trí để xem công việc và yêu cầu.' : <><strong>{careers.emptyTitle}</strong> {careers.emptyText}</>}>
              Đâu là <em>cánh cửa của bạn?</em>
            </Heading>

            {jobs.length > 0 && (
              <ul className="td-jobs">
                {jobs.map(job => (
                  <li key={job.id} data-reveal>
                    <details className="td-job">
                      <summary>
                        <span className="td-job__team">{teamLabel(job.team)}</span>
                        <span className="td-job__title">{job.title}</span>
                        <span className="td-job__facts">
                          {job.type && <span><Clock aria-hidden="true" />{job.type}</span>}
                          {job.location && <span><MapPin aria-hidden="true" />{job.location}</span>}
                          {job.salary && <span><Wallet aria-hidden="true" />{job.salary}</span>}
                          {job.deadline && <span><CalendarDays aria-hidden="true" />Hạn {formatDate(job.deadline)}</span>}
                        </span>
                        <Plus className="td-job__toggle" aria-hidden="true" />
                      </summary>
                      <div className="td-job__body">
                        {job.summary && <p>{job.summary}</p>}
                        <div className="td-job__cols">
                          {([['Công việc', job.tasks], ['Yêu cầu', job.requirements], ['Quyền lợi', job.benefits]] as const).map(([title, items]) => {
                            const lines = items.filter(x => x.trim());
                            return lines.length > 0 && <div key={title}><h3>{title}</h3><ul>{lines.map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
                          })}
                        </div>
                        <PickPosition value={`job:${job.id}`} className="td-btn">Ứng tuyển vị trí này</PickPosition>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}

            {jobs.length > 0 && <p className="td-roles__more">Chưa thấy vị trí phù hợp? Gõ cửa một mảng và gửi hồ sơ mở.</p>}
            <ul className="td-doors">
              {TEAMS.map((team, i) => {
                const member = people.find(p => p.detail.departmentId === team.id && p.photo);
                return (
                  <li key={team.id} style={vars({ '--i': i })} data-reveal>
                    <PickPosition value={`team:${team.id}`} className={`td-door td-door--${i}`} label={`Gửi hồ sơ mở vào mảng ${team.label}`}>
                      <span className="td-door__frame" aria-hidden="true">
                        <span className="td-door__room">{member && <img src={member.photo} alt="" loading="lazy" decoding="async" />}</span>
                        <span className="td-door__leaf"><span className="td-door__no">{i + 1}</span><span className="td-door__knob" /></span>
                      </span>
                      <span className="td-door__name">{team.label}</span>
                      <span className="td-door__text">{team.text}</span>
                      <span className="td-door__go">Gửi hồ sơ mở</span>
                    </PickPosition>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* 02 Cách làm việc */}
        {principles.length > 0 && (
          <section className="td-sec td-ways" aria-labelledby="td-ways">
            <div className="s-container">
              <Heading id="td-ways" no="02" label="Con người" lead="Những điều người DANAVA mang theo vào mỗi dự án.">
                Bạn sẽ hợp, nếu <em>bạn cũng tin.</em>
              </Heading>
              <ul className="td-notes">
                {principles.map((p, i) => (
                  <li key={i} className={`td-note td-note--${i % 4}`} data-reveal>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 03 Thư */}
        {careers.letter.trim() && (
          <section className="td-sec td-mail" aria-labelledby="td-mail">
            <div className="s-container td-mail__grid">
              <Heading id="td-mail" no="03" label="Lời nhắn">Một lá thư <em>từ người mở lối.</em></Heading>
              <div className="td-envelope" data-reveal>
                <div className="td-paper">
                  <img className="td-paper__stamp" src={founder.image} alt={founder.name} loading="lazy" decoding="async" />
                  <blockquote>{careers.letter.split('\n').filter(x => x.trim()).map((x, i) => <p key={i}>{x}</p>)}</blockquote>
                  <p className="td-paper__sign"><b>{founder.name}</b><span>{founder.title}</span></p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 04 Đồng đội */}
        {people.length > 0 && (
          <section className="td-sec td-crew" aria-labelledby="td-crew">
            <div className="s-container">
              <Heading id="td-crew" no="04" label="Đồng đội" lead="Những người bạn có thể sẽ ngồi cạnh. Bấm vào thẻ để xem hồ sơ.">
                Vẫn còn <em>một móc treo trống.</em>
              </Heading>
              <ul className="td-rack">
                {people.map(({ person, photo }, i) => (
                  <li key={person.id} className="td-hang" style={vars({ '--i': i, '--tilt': `${[-3, 2, -1, 3, -2][i % 5]}deg` })}>
                    <Link className="td-tag" href={`/doi-ngu/${person.id}/`}>
                      <span className="td-tag__photo">{photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : getStaffInitials(person.name)}</span>
                      <b>{person.name}</b>
                      <span className="td-tag__role">{person.role}</span>
                    </Link>
                  </li>
                ))}
                <li className="td-hang td-hang--you" style={vars({ '--i': people.length, '--tilt': '2deg' })}>
                  <PickPosition className="td-tag td-tag--you">
                    <span className="td-tag__photo" aria-hidden="true">?</span>
                    <b>Tên của bạn</b>
                    <span className="td-tag__role">Nhận tấm thẻ này</span>
                  </PickPosition>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* 05 Đời sống */}
        {gallery.visible && photos.length > 0 && (
          <section className="td-sec td-life" aria-labelledby="td-life">
            <div className="s-container">
              <Heading id="td-life" no="05" label="Đời sống" lead={gallery.lead}>Những ngày <em>ở DANAVA.</em></Heading>
            </div>
            <ul className="td-line" aria-label="Ảnh hoạt động của DANAVA" tabIndex={0}>
              {photos.map((photo, i) => (
                <li key={`${photo.image}-${i}`} style={vars({ '--tilt': `${[-3, 2, -2, 3, -1][i]}deg`, '--drop': `${[8, 30, 40, 30, 8][i]}px` })}>
                  <figure className="td-polaroid">
                    <img src={photo.image} alt={photo.alt || photo.caption} style={photo.focus ? { objectPosition: photo.focus } : undefined} loading="lazy" decoding="async" />
                    {photo.caption && <figcaption>{photo.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 06 Gửi hồ sơ */}
        <section className="td-sec td-apply" id="ung-tuyen" aria-labelledby="td-apply">
          <div className="s-container td-apply__grid">
            <div className="td-apply__aside">
              <Heading id="td-apply" no="06" label="Ứng tuyển" lead={<>Điền vài dòng là xong. Hoặc gửi CV qua email <a className="td-apply__mail" href={`mailto:${email}?subject=${encodeURIComponent('Ứng tuyển DANAVA')}`}>{email}</a>.</>}>
                Viết tên bạn <em>lên tấm thẻ.</em>
              </Heading>
              <LiveBadge motto={motto} compact />
            </div>
            <ApplyForm />
          </div>
        </section>

      </CareersProvider>
    </main>
  );
}
