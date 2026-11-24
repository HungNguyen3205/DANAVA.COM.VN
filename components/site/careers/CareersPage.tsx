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
import { cmsText, ct } from '../cms';
import { ApplyForm, CareersProvider, LiveBadge, NameField, PickPosition } from './CareersClient';

const vars = (values: Record<string, string | number>) => values as CSSProperties;
type Attrs = Record<`data-${string}`, string>;

/** cms = thuộc tính vùng chỉnh trực tiếp cho tiêu đề / câu dẫn (khi câu dẫn là chữ thuần). */
function Heading({ id, no, label, children, lead, cms = {} }: { id: string; no: string; label: ReactNode; children: ReactNode; lead?: ReactNode; cms?: { title?: Attrs; lead?: Attrs } }) {
  return (
    <header className="td-head" data-reveal>
      <p className="td-no"><b>{no}</b>{label}</p>
      <h2 className="td-h2" id={id} {...cms.title}>{children}</h2>
      {lead && <p className="td-text" {...cms.lead}>{lead}</p>}
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
  /** Chữ cố định sửa được trong trình biên tập (khóa careers.*). */
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `careers.${k}`, def, label, opts);
  const T = (k: string, def: string, label: string) => { const x = t(k, def, label); return <span {...x.a}>{x.v}</span>; };
  const G = { scope: 'global' as const };
  const REC = { scope: 'record' as const, scopeLabel: 'Hồ sơ nhân sự' };
  const job = (i: number, f: string) => `block.careers.jobs.${i}.${f}`;
  const team = (id: string, f: 'label' | 'text', def: string) => t(`teams.${id}.${f}`, def, f === 'label' ? 'Tên mảng' : 'Mô tả mảng', f === 'text' ? { multiline: true } : {});
  const hRoles = t('roles.title', 'Đâu là *cánh cửa của bạn?*', 'Tiêu đề mục vị trí', { rich: true });
  const lRoles = t('roles.lead', 'Bấm vào từng vị trí để xem công việc và yêu cầu.', 'Câu dẫn mục vị trí', { multiline: true });
  const hWays = t('ways.title', 'Bạn sẽ hợp, nếu *bạn cũng tin.*', 'Tiêu đề mục con người', { rich: true });
  const lWays = t('ways.lead', 'Những điều người DANAVA mang theo vào mỗi dự án.', 'Câu dẫn mục con người', { multiline: true });
  const hMail = t('mail.title', 'Một lá thư *từ người mở lối.*', 'Tiêu đề mục lời nhắn', { rich: true });
  const hCrew = t('crew.title', 'Vẫn còn *một móc treo trống.*', 'Tiêu đề mục đồng đội', { rich: true });
  const lCrew = t('crew.lead', 'Những người bạn có thể sẽ ngồi cạnh. Bấm vào thẻ để xem hồ sơ.', 'Câu dẫn mục đồng đội', { multiline: true });
  const hLife = t('life.title', 'Những ngày *ở DANAVA.*', 'Tiêu đề mục đời sống', { rich: true });
  const hApply = t('apply.title', 'Viết tên bạn *lên tấm thẻ.*', 'Tiêu đề mục ứng tuyển', { rich: true });

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
                <p className="td-kicker" {...cmsText('block.careers.kicker', 'Nhãn nhỏ')}>{careers.kicker}</p>
                <h1 className="td-title" id="td-title" {...cmsText('block.careers.title', 'Tiêu đề trang', { rich: true })}>{rich(careers.title)}</h1>
                <p className="td-lead" {...cmsText('block.careers.lead', 'Câu dẫn', { multiline: true })}>{careers.lead}</p>
                <NameField />
                <div className="td-hero__links">
                  <a href="#vi-tri">{jobs.length ? `Xem ${jobs.length} vị trí đang tuyển` : T('hero.find', 'Tìm chỗ của bạn', 'Liên kết tới mục vị trí')} <ArrowDown aria-hidden="true" /></a>
                  <span><MapPin aria-hidden="true" /><span {...cmsText('block.company.address', 'Địa chỉ công ty', G)}>{company.address}</span></span>
                </div>
              </div>
              <LiveBadge motto={motto} />
            </div>
          </div>
        </section>

        {/* 01 Vị trí */}
        <section className="td-sec td-roles" id="vi-tri" aria-labelledby="td-roles">
          <div className="s-container">
            <Heading id="td-roles" no="01" label={T('roles.label', 'Vị trí', 'Nhãn mục')} cms={{ title: hRoles.a, lead: jobs.length ? lRoles.a : undefined }}
              lead={jobs.length ? lRoles.v : <><strong {...cmsText('block.careers.emptyTitle', 'Tiêu đề khi chưa có vị trí')}>{careers.emptyTitle}</strong> <span {...cmsText('block.careers.emptyText', 'Lời nhắn khi chưa có vị trí', { multiline: true })}>{careers.emptyText}</span></>}>
              {rich(hRoles.v)}
            </Heading>

            {jobs.length > 0 && (
              <ul className="td-jobs">
                {jobs.map(jb => { const n = careers.jobs.indexOf(jb); return (
                  <li key={jb.id} data-reveal>
                    <details className="td-job">
                      <summary>
                        {(() => { const label = teamLabel(jb.team); if (!label) return <span className="td-job__team">{label}</span>; const x = team(jb.team, 'label', label); return <span className="td-job__team" {...x.a}>{x.v}</span>; })()}
                        <span className="td-job__title" {...cmsText(job(n, 'title'), 'Tên vị trí')}>{jb.title}</span>
                        <span className="td-job__facts">
                          {jb.type && <span><Clock aria-hidden="true" /><span {...cmsText(job(n, 'type'), 'Hình thức')}>{jb.type}</span></span>}
                          {jb.location && <span><MapPin aria-hidden="true" /><span {...cmsText(job(n, 'location'), 'Nơi làm việc')}>{jb.location}</span></span>}
                          {jb.salary && <span><Wallet aria-hidden="true" /><span {...cmsText(job(n, 'salary'), 'Mức lương')}>{jb.salary}</span></span>}
                          {jb.deadline && <span><CalendarDays aria-hidden="true" />{T('job.deadline', 'Hạn', 'Nhãn hạn nộp')} {formatDate(jb.deadline)}</span>}
                        </span>
                        <Plus className="td-job__toggle" aria-hidden="true" />
                      </summary>
                      <div className="td-job__body">
                        {jb.summary && <p {...cmsText(job(n, 'summary'), 'Tóm tắt vị trí', { multiline: true })}>{jb.summary}</p>}
                        <div className="td-job__cols">
                          {([['tasks', 'Công việc', jb.tasks], ['requirements', 'Yêu cầu', jb.requirements], ['benefits', 'Quyền lợi', jb.benefits]] as const).map(([field, title, items]) => {
                            const lines = items.map((x, i) => ({ x, i })).filter(l => l.x.trim());
                            const h = t(`job.cols.${field}`, title, 'Tên cột');
                            return lines.length > 0 && <div key={field}><h3 {...h.a}>{h.v}</h3><ul>{lines.map(l => <li key={l.i} {...cmsText(job(n, `${field}.${l.i}`), `${title} (dòng)`, { multiline: true })}>{l.x}</li>)}</ul></div>;
                          })}
                        </div>
                        <PickPosition value={`job:${jb.id}`} className="td-btn">{T('job.apply', 'Ứng tuyển vị trí này', 'Nút ứng tuyển')}</PickPosition>
                      </div>
                    </details>
                  </li>
                ); })}
              </ul>
            )}

            {jobs.length > 0 && (() => { const x = t('roles.more', 'Chưa thấy vị trí phù hợp? Gõ cửa một mảng và gửi hồ sơ mở.', 'Gợi ý hồ sơ mở', { multiline: true }); return <p className="td-roles__more" {...x.a}>{x.v}</p>; })()}
            <ul className="td-doors">
              {TEAMS.map((tm, i) => {
                const member = people.find(p => p.detail.departmentId === tm.id && p.photo);
                const name = team(tm.id, 'label', tm.label), text = team(tm.id, 'text', tm.text);
                return (
                  <li key={tm.id} style={vars({ '--i': i })} data-reveal>
                    <PickPosition value={`team:${tm.id}`} className={`td-door td-door--${i}`} label={`Gửi hồ sơ mở vào mảng ${name.v}`}>
                      <span className="td-door__frame" aria-hidden="true">
                        <span className="td-door__room">{member && <img src={member.photo} alt="" loading="lazy" decoding="async" />}</span>
                        <span className="td-door__leaf"><span className="td-door__no">{i + 1}</span><span className="td-door__knob" /></span>
                      </span>
                      <span className="td-door__name" {...name.a}>{name.v}</span>
                      <span className="td-door__text" {...text.a}>{text.v}</span>
                      {(() => { const x = t('doors.go', 'Gửi hồ sơ mở', 'Chữ trên cánh cửa'); return <span className="td-door__go" {...x.a}>{x.v}</span>; })()}
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
              <Heading id="td-ways" no="02" label={T('ways.label', 'Con người', 'Nhãn mục')} lead={lWays.v} cms={{ title: hWays.a, lead: lWays.a }}>
                {rich(hWays.v)}
              </Heading>
              <ul className="td-notes">
                {principles.map((p, i) => (
                  <li key={i} className={`td-note td-note--${i % 4}`} data-reveal>
                    <h3 {...cmsText(`block.about.principles.${i}.title`, 'Tên nguyên tắc')}>{p.title}</h3>
                    <p {...cmsText(`block.about.principles.${i}.text`, 'Mô tả nguyên tắc', { multiline: true })}>{p.text}</p>
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
              <Heading id="td-mail" no="03" label={T('mail.label', 'Lời nhắn', 'Nhãn mục')} cms={{ title: hMail.a }}>{rich(hMail.v)}</Heading>
              <div className="td-envelope" data-reveal>
                <div className="td-paper">
                  <img className="td-paper__stamp" src={founder.image} alt={founder.name} loading="lazy" decoding="async" />
                  <blockquote>{careers.letter.split('\n').filter(x => x.trim()).map((x, i) => <p key={i}>{x}</p>)}</blockquote>
                  <p className="td-paper__sign">{(() => { const a = t('mail.sign-name', founder.name, 'Tên người ký'), b = t('mail.sign-title', founder.title, 'Chức danh người ký'); return <><b {...a.a}>{a.v}</b><span {...b.a}>{b.v}</span></>; })()}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 04 Đồng đội */}
        {people.length > 0 && (
          <section className="td-sec td-crew" aria-labelledby="td-crew">
            <div className="s-container">
              <Heading id="td-crew" no="04" label={T('crew.label', 'Đồng đội', 'Nhãn mục')} lead={lCrew.v} cms={{ title: hCrew.a, lead: lCrew.a }}>
                {rich(hCrew.v)}
              </Heading>
              <ul className="td-rack">
                {people.map(({ person, photo }, i) => (
                  <li key={person.id} className="td-hang" style={vars({ '--i': i, '--tilt': `${[-3, 2, -1, 3, -2][i % 5]}deg` })}>
                    <Link className="td-tag" href={`/doi-ngu/${person.id}/`}>
                      <span className="td-tag__photo">{photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : getStaffInitials(person.name)}</span>
                      <b {...cmsText(`rec.staff.${person.id}.name`, 'Tên nhân sự', REC)}>{person.name}</b>
                      <span className="td-tag__role" {...cmsText(`rec.staff.${person.id}.role`, 'Chức danh', REC)}>{person.role}</span>
                    </Link>
                  </li>
                ))}
                <li className="td-hang td-hang--you" style={vars({ '--i': people.length, '--tilt': '2deg' })}>
                  <PickPosition className="td-tag td-tag--you">
                    <span className="td-tag__photo" aria-hidden="true">?</span>
                    {(() => { const a = t('crew.you-name', 'Tên của bạn', 'Thẻ trống: tên'), b = t('crew.you-role', 'Nhận tấm thẻ này', 'Thẻ trống: lời mời'); return <><b {...a.a}>{a.v}</b><span className="td-tag__role" {...b.a}>{b.v}</span></>; })()}
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
              <Heading id="td-life" no="05" label={T('life.label', 'Đời sống', 'Nhãn mục')} lead={gallery.lead} cms={{ title: hLife.a, lead: cmsText('block.gallery.lead', 'Câu dẫn (Hình ảnh DANAVA)', { multiline: true }) }}>{rich(hLife.v)}</Heading>
            </div>
            <ul className="td-line" aria-label="Ảnh hoạt động của DANAVA" tabIndex={0}>
              {photos.map((photo, i) => (
                <li key={`${photo.image}-${i}`} style={vars({ '--tilt': `${[-3, 2, -2, 3, -1][i]}deg`, '--drop': `${[8, 30, 40, 30, 8][i]}px` })}>
                  <figure className="td-polaroid">
                    <img src={photo.image} alt={photo.alt || photo.caption} style={photo.focus ? { objectPosition: photo.focus } : undefined} loading="lazy" decoding="async" />
                    {photo.caption && <figcaption {...cmsText(`block.gallery.photos.${gallery.photos.indexOf(photo)}.caption`, 'Chú thích ảnh')}>{photo.caption}</figcaption>}
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
              <Heading id="td-apply" no="06" label={T('apply.label', 'Ứng tuyển', 'Nhãn mục')} cms={{ title: hApply.a }} lead={<>{T('apply.lead', 'Điền vài dòng là xong. Hoặc gửi CV qua email', 'Câu dẫn mục ứng tuyển')} <a className="td-apply__mail" href={`mailto:${email}?subject=${encodeURIComponent('Ứng tuyển DANAVA')}`}><span {...cmsText('site.email', 'Email liên hệ', G)}>{email}</span></a>.</>}>
                {rich(hApply.v)}
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
