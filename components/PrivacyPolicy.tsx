/**
 * /chinh-sach-rieng-tu/ — nội dung lấy từ CMS (lib/blocks.ts → khối "privacy"; pháp nhân từ khối "company").
 * Bố cục giữ nguyên: tóm tắt 4 thẻ, mục lục, các mục; mục lưu trữ có bảng, mục quyền có thẻ,
 * mục chờ xác nhận có thẻ điều khoản, mục cuối có thông tin đơn vị chịu trách nhiệm.
 */
import Link from 'next/link';
import { ShieldCheck, Lock, PlayCircle, Scale, AlertTriangle, Phone, Mail, MapPin } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { CONTACT } from '@/lib/company';
import { block } from '@/lib/blocks';
import { formatPhone } from './site/catalog';
import { PageHead, IconTile } from './site/ui';
import { Prose, inline } from './site/rich';
import { cmsText, ct } from './site/cms';

/** Chữ hiển thị nguyên văn qua inline() khi không có **đậm**, `mã`, [liên kết](…) → sửa trực tiếp được. */
const plain = (s: string) => !/\*\*|`|\[[^\]]*\]\(/.test(s);

const SUMMARY_ICONS = [ShieldCheck, Lock, PlayCircle, Scale];

export function PrivacyPolicy({ data }: { data: SiteData }) {
  const pv = block(data, 'privacy');
  const co = block(data, 'company');
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;
  /** Chữ cố định sửa được (khóa privacy.*), bọc trong <span>. */
  const T = (k: string, def: string, label: string) => { const x = ct(data, `privacy.${k}`, def, label); return <span {...x.a}>{x.v}</span>; };
  const B = (path: string, label: string, opts: { multiline?: boolean } = {}) => cmsText(`block.privacy.${path}`, label, opts);
  const G = { scope: 'global' as const };
  /** Trường hiển thị qua inline(): chỉ gắn vùng chỉnh khi chữ không có định dạng. */
  const BI = (path: string, value: string, label: string) => (plain(value) ? B(path, label, { multiline: true }) : {});
  return (
    <main id="main">
      <PageHead soft crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Chính sách riêng tư' }]} eyebrow={pv.eyebrow && <span {...B('eyebrow', 'Nhãn nhỏ')}>{pv.eyebrow}</span>} title={<span {...B('title', 'Tiêu đề trang')}>{pv.title}</span>} lead={pv.lead && <span {...B('lead', 'Câu dẫn', { multiline: true })}>{pv.lead}</span>}>
        {pv.badges.map((b, i) => <span key={b} className="s-badge s-badge--neutral" {...B(`badges.${i}`, 'Nhãn')}>{b}</span>)}
      </PageHead>

      <section className="s-section s-section--tight" aria-label="Tóm tắt nguyên tắc quyền riêng tư">
        <div className="s-container">
          <div className="s-grid s-grid--4">
            {pv.summary.map((item, i) => (
              <div key={i} className="s-card s-card--pad s-card--soft s-feature">
                <IconTile icon={SUMMARY_ICONS[i % SUMMARY_ICONS.length]} />
                <h2 className="s-feature__title" {...B(`summary.${i}.title`, 'Tiêu đề thẻ tóm tắt')}>{item.title}</h2>
                <p className="s-feature__text s-small" {...B(`summary.${i}.text`, 'Nội dung thẻ tóm tắt', { multiline: true })}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-section s-section--flush-top">
        <div className="s-container">
          <div className="s-policy-layout">
            <aside className="s-policy-toc" aria-label="Mục lục chính sách riêng tư">
              <p className="s-policy-toc__title">{T('toc.title', 'Mục lục', 'Tiêu đề mục lục')}</p>
              <nav>
                {pv.sections.map((sec, i) => (
                  <a key={sec.id} href={`#${sec.id}`} className={sec.id === 'xac-nhan-chu-website' ? 'is-flag' : undefined}>{`${i + 1}. `}<span {...B(`sections.${i}.${sec.toc ? 'toc' : 'title'}`, sec.toc ? 'Tên mục (mục lục)' : 'Tên mục')}>{sec.toc || sec.title}</span></a>
                ))}
              </nav>
            </aside>

            <article className="s-prose s-policy-body">
              {pv.sections.map((sec, i) => {
                const flag = sec.id === 'xac-nhan-chu-website';
                return (
                  <section key={sec.id} id={sec.id} className={flag ? 's-policy-flag' : undefined}>
                    {flag && <p className="s-policy-flag__badge"><AlertTriangle aria-hidden="true" /> <span {...B('pendingBadge', 'Nhãn mục chờ xác nhận')}>{pv.pendingBadge}</span></p>}
                    <h2>{`${i + 1}. `}<span {...B(`sections.${i}.title`, 'Tên mục')}>{sec.title}</span></h2>
                    <Prose text={sec.body} />
                    {sec.id === 'luu-tru-bao-mat' && (
                      <div className="s-policy-table-wrap">
                        <table className="s-policy-table">
                          <thead>
                            <tr><th scope="col">{T('table.type', 'Loại dữ liệu', 'Tiêu đề cột')}</th><th scope="col">{T('table.mechanism', 'Cơ chế lưu trữ', 'Tiêu đề cột')}</th><th scope="col">{T('table.retention', 'Thời gian lưu trữ', 'Tiêu đề cột')}</th><th scope="col">{T('table.access', 'Phân quyền truy cập', 'Tiêu đề cột')}</th></tr>
                          </thead>
                          <tbody>
                            {pv.storage.map((r, j) => (
                              <tr key={j}>
                                <td data-label="Loại dữ liệu"><strong {...B(`storage.${j}.type`, 'Loại dữ liệu')}>{r.type}</strong></td>
                                <td data-label="Cơ chế lưu trữ" {...BI(`storage.${j}.mechanism`, r.mechanism, 'Cơ chế lưu trữ')}>{inline(r.mechanism)}</td>
                                <td data-label="Thời gian lưu trữ" {...BI(`storage.${j}.retention`, r.retention, 'Thời gian lưu trữ')}>{inline(r.retention)}</td>
                                <td data-label="Phân quyền truy cập" {...BI(`storage.${j}.access`, r.access, 'Phân quyền truy cập')}>{inline(r.access)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {sec.id === 'quyen-khach-hang' && (
                      <div className="s-policy-rights">
                        {pv.rights.map((r, j) => (
                          <div key={j} className="s-policy-right">
                            <span className="s-policy-right__num">{String(j + 1).padStart(2, '0')}</span>
                            <h3 {...B(`rights.${j}.title`, 'Tên quyền')}>{r.title}</h3>
                            <p {...B(`rights.${j}.text`, 'Mô tả quyền', { multiline: true })}>{r.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {flag && pv.pending.map((c, j) => (
                      <div key={j} className="s-policy-flag__item">
                        <span className="s-policy-flag__tag" {...B(`pending.${j}.tag`, 'Nhãn điều khoản')}>{c.tag}</span>
                        <h3 {...B(`pending.${j}.title`, 'Tên điều khoản')}>{c.title}</h3>
                        <p {...BI(`pending.${j}.text`, c.text, 'Nội dung điều khoản')}>{inline(c.text)}</p>
                        <p className="s-policy-flag__status" {...B(`pending.${j}.status`, 'Trạng thái điều khoản')}>{c.status}</p>
                      </div>
                    ))}
                    {sec.id === 'thong-tin-lien-he' && (
                      <div className="s-policy-issuer">
                        <h3 {...cmsText('block.company.companyName', 'Tên pháp nhân', G)}>{co.companyName}</h3>
                        <p>{T('issuer.rep', 'Người đại diện:', 'Nhãn người đại diện')} <span {...cmsText('block.company.representative', 'Người đại diện', G)}>{co.representative}</span></p>
                        <ul className="s-policy-issuer__list">
                          <li><MapPin aria-hidden="true" /><span {...(pv.issuerAddress ? B('issuerAddress', 'Địa chỉ đơn vị chịu trách nhiệm') : cmsText('block.company.legalAddress', 'Địa chỉ trụ sở', G))}>{pv.issuerAddress || co.legalAddress}</span></li>
                          <li><Phone aria-hidden="true" /><a href={`tel:${phone.replace(/\D/g, '')}`}>{formatPhone(phone)}</a></li>
                          <li><Mail aria-hidden="true" /><span><a href={`mailto:${email}`}><span {...cmsText('site.email', 'Email liên hệ', G)}>{email}</span></a>{pv.issuerEmailNote ? <>{' '}<span {...B('issuerEmailNote', 'Ghi chú email')}>{pv.issuerEmailNote}</span></> : ''}</span></li>
                        </ul>
                        <div className="s-row">
                          <Link href="/lien-he/" className="s-btn s-btn--primary">{T('issuer.contact', 'Gửi yêu cầu trực tuyến', 'Nút liên hệ')}</Link>
                          <Link href="/chinh-sach-dich-vu/" className="s-btn s-btn--secondary">{T('issuer.policy', 'Chính sách dịch vụ', 'Nút chính sách dịch vụ')}</Link>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
