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

const SUMMARY_ICONS = [ShieldCheck, Lock, PlayCircle, Scale];

export function PrivacyPolicy({ data }: { data: SiteData }) {
  const pv = block(data, 'privacy');
  const co = block(data, 'company');
  const phone = data.phone || CONTACT.phone;
  const email = data.email || CONTACT.email;
  return (
    <main id="main">
      <PageHead soft crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Chính sách riêng tư' }]} eyebrow={pv.eyebrow} title={pv.title} lead={pv.lead}>
        {pv.badges.map(b => <span key={b} className="s-badge s-badge--neutral">{b}</span>)}
      </PageHead>

      <section className="s-section s-section--tight" aria-label="Tóm tắt nguyên tắc quyền riêng tư">
        <div className="s-container">
          <div className="s-grid s-grid--4">
            {pv.summary.map((item, i) => (
              <div key={i} className="s-card s-card--pad s-card--soft s-feature">
                <IconTile icon={SUMMARY_ICONS[i % SUMMARY_ICONS.length]} />
                <h2 className="s-feature__title">{item.title}</h2>
                <p className="s-feature__text s-small">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-section s-section--flush-top">
        <div className="s-container">
          <div className="s-policy-layout">
            <aside className="s-policy-toc" aria-label="Mục lục chính sách riêng tư">
              <p className="s-policy-toc__title">Mục lục</p>
              <nav>
                {pv.sections.map((sec, i) => (
                  <a key={sec.id} href={`#${sec.id}`} className={sec.id === 'xac-nhan-chu-website' ? 'is-flag' : undefined}>{`${i + 1}. ${sec.toc || sec.title}`}</a>
                ))}
              </nav>
            </aside>

            <article className="s-prose s-policy-body">
              {pv.sections.map((sec, i) => {
                const flag = sec.id === 'xac-nhan-chu-website';
                return (
                  <section key={sec.id} id={sec.id} className={flag ? 's-policy-flag' : undefined}>
                    {flag && <p className="s-policy-flag__badge"><AlertTriangle aria-hidden="true" /> {pv.pendingBadge}</p>}
                    <h2>{`${i + 1}. ${sec.title}`}</h2>
                    <Prose text={sec.body} />
                    {sec.id === 'luu-tru-bao-mat' && (
                      <div className="s-policy-table-wrap">
                        <table className="s-policy-table">
                          <thead>
                            <tr><th scope="col">Loại dữ liệu</th><th scope="col">Cơ chế lưu trữ</th><th scope="col">Thời gian lưu trữ</th><th scope="col">Phân quyền truy cập</th></tr>
                          </thead>
                          <tbody>
                            {pv.storage.map((r, j) => (
                              <tr key={j}>
                                <td data-label="Loại dữ liệu"><strong>{r.type}</strong></td>
                                <td data-label="Cơ chế lưu trữ">{inline(r.mechanism)}</td>
                                <td data-label="Thời gian lưu trữ">{inline(r.retention)}</td>
                                <td data-label="Phân quyền truy cập">{inline(r.access)}</td>
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
                            <h3>{r.title}</h3>
                            <p>{r.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {flag && pv.pending.map((c, j) => (
                      <div key={j} className="s-policy-flag__item">
                        <span className="s-policy-flag__tag">{c.tag}</span>
                        <h3>{c.title}</h3>
                        <p>{inline(c.text)}</p>
                        <p className="s-policy-flag__status">{c.status}</p>
                      </div>
                    ))}
                    {sec.id === 'thong-tin-lien-he' && (
                      <div className="s-policy-issuer">
                        <h3>{co.companyName}</h3>
                        <p>Người đại diện: {co.representative}</p>
                        <ul className="s-policy-issuer__list">
                          <li><MapPin aria-hidden="true" />{pv.issuerAddress || co.legalAddress}</li>
                          <li><Phone aria-hidden="true" /><a href={`tel:${phone.replace(/\D/g, '')}`}>{formatPhone(phone)}</a></li>
                          <li><Mail aria-hidden="true" /><span><a href={`mailto:${email}`}>{email}</a>{pv.issuerEmailNote ? ` ${pv.issuerEmailNote}` : ''}</span></li>
                        </ul>
                        <div className="s-row">
                          <Link href="/lien-he/" className="s-btn s-btn--primary">Gửi yêu cầu trực tuyến</Link>
                          <Link href="/chinh-sach-dich-vu/" className="s-btn s-btn--secondary">Chính sách dịch vụ</Link>
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
