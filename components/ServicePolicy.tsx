import Link from 'next/link';
import { ShieldCheck, Wrench, Headphones, PackageCheck, Info, AlertTriangle, Check, X, Phone, Mail, MapPin, Clock } from 'lucide-react';
import type { ServicePolicyGroup, SLAMatrixItem, SupportChannel, DraftClause } from '@/lib/service-policy';
import type { SiteData } from '@/lib/content';
import { CONTACT } from '@/lib/company';
import { block } from '@/lib/blocks';
import { formatPhone } from './site/catalog';
import { PageHead, IconTile } from './site/ui';
import { cmsText, ct } from './site/cms';

type Attrs = Record<`data-${string}`, string>;
type Txt = (k: string, def: string, label: string, opts?: { multiline?: boolean }) => { v: string; a: Attrs };
const B = (path: string, label: string, opts: { multiline?: boolean } = {}) => cmsText(`block.servicePolicy.${path}`, label, opts);
const G = { scope: 'global' as const };

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Uptime ≥ 99.9%', text: 'Hạ tầng đám mây chuyên dụng, sao lưu dữ liệu tự động hằng ngày để phần mềm vận hành liên tục.' },
  { icon: Wrench, title: 'Bảo hành website 12 tháng', text: 'Khắc phục lỗi phát sinh và đảm bảo tương thích đa trình duyệt miễn phí trong tối thiểu 1 năm.' },
  { icon: Headphones, title: 'Phản hồi khẩn cấp ≤ 60 phút', text: 'Hotline 24/7 và nhóm Zalo chuyên trách cho sự cố ảnh hưởng đến check-in và kinh doanh.' },
  { icon: PackageCheck, title: 'Bàn giao quyền sở hữu', text: 'Khách hàng sở hữu dữ liệu hội viên, doanh thu và mã nguồn sau nghiệm thu.' }
];

/** n = vị trí nhóm trong khối servicePolicy.groups (khóa vùng chỉnh); t = chữ cố định sửa được. */
/** Quy trình xử lý yêu cầu (mục 6) và các tình huống miễn trừ (mục 7): [phần in đậm, phần còn lại]. */
const STEPS: [string, string][] = [
  ['Tiếp nhận & phân loại.', 'Khách hàng gửi thông tin qua Hotline/Zalo; kỹ thuật viên xác nhận trong khung giờ SLA tương ứng.'],
  ['Khắc phục & kiểm thử.', 'Đội kỹ thuật cô lập lỗi, sửa trên môi trường Staging trước khi cập nhật Production.'],
  ['Bàn giao & xác nhận.', 'Thông báo kết quả cho khách hàng và ghi nhận hoàn tất vào nhật ký hỗ trợ.']
];
const EXEMPTIONS: [string, string][] = [
  ['Sự kiện bất khả kháng:', 'thiên tai, hỏa hoạn, động đất, sự cố đứt cáp quang biển diện rộng hoặc chỉ thị hành chính từ cơ quan Nhà nước có thẩm quyền.'],
  ['Tự ý sửa đổi mã nguồn:', 'khách hàng hoặc bên thứ ba can thiệp vào code, cơ sở dữ liệu hoặc cấu hình máy chủ mà không phối hợp với DANAVA.'],
  ['Để lộ thông tin xác thực:', 'sự cố do lộ mật khẩu quản trị, mã xác thực 2 bước (2FA) hoặc bị lừa đảo trực tuyến (phishing).'],
  ['Hết hạn dịch vụ bên thứ ba:', 'tên miền, chứng chỉ SSL hoặc hosting do khách hàng tự quản lý bị hết hạn mà không thông báo cho DANAVA.']
];

function PolicyGroup({ group, n, t, labels, link }: {
  group: ServicePolicyGroup;
  n: number;
  t: Txt;
  labels: [string, string, string, string];
  link: { href: string; label: string };
}) {
  const lists: [string, string, string[]][] = [
    ['scopeOfSupport', labels[0], group.scopeOfSupport],
    ['warrantyTerms', labels[1], group.warrantyTerms],
    ['ownershipAndHandover', labels[2], group.ownershipAndHandover]
  ];
  const head = (k: string, def: string) => { const x = t(`groups.${n}.${k}`, def, 'Tiêu đề thẻ'); return <h3 {...x.a}>{x.v}</h3>; };
  const more = t(`groups.${n}.link`, link.label, 'Chữ liên kết');
  return (
    <>
      <p className="s-policy-lead" {...B(`groups.${n}.tagline`, 'Câu dẫn nhóm', { multiline: true })}>{group.tagline}</p>
      <div className="s-policy-cards">
        {lists.map(([field, title, items]) => (
          <div key={field} className="s-policy-card">
            {head(field.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), title)}
            <ul className="s-policy-list">
              {items.map((item, i) => <li key={i}><Check aria-hidden="true" /><span {...B(`groups.${n}.${field}.${i}`, 'Dòng cam kết', { multiline: true })}>{item}</span></li>)}
            </ul>
          </div>
        ))}
        <div className="s-policy-card s-policy-card--muted">
          {head('exclusions', labels[3])}
          <ul className="s-policy-list s-policy-list--x">
            {group.exclusions.map((item, i) => <li key={i}><X aria-hidden="true" /><span {...B(`groups.${n}.exclusions.${i}`, 'Trường hợp loại trừ', { multiline: true })}>{item}</span></li>)}
          </ul>
        </div>
      </div>
      <p className="s-policy-more">
        <Link href={link.href}><span {...more.a}>{more.v}</span> →</Link>
      </p>
    </>
  );
}

export function ServicePolicy({ data }: { data: SiteData }) {
  // Nội dung sửa trong CMS (khối "servicePolicy"); pháp nhân, địa chỉ, email hỗ trợ từ "Thông tin công ty"; hotline từ Cài đặt
  const sp = block(data, 'servicePolicy');
  const co = block(data, 'company');
  const hotline = formatPhone(data.phone || CONTACT.phone);
  const generalEmail = data.email || CONTACT.email;
  const SERVICE_POLICY_METADATA = { version: sp.version, lastUpdated: sp.lastUpdated, effectiveDate: sp.effectiveDate, companyName: co.companyName, representative: co.representative, address: co.legalAddress, hotline, supportEmail: co.supportEmail, generalEmail };
  const SLA_MATRIX = sp.sla as SLAMatrixItem[];
  const SUPPORT_CHANNELS = sp.channels as SupportChannel[];
  const DRAFT_POLICY_CLAUSES = sp.drafts as DraftClause[];
  const [software, website, media] = sp.groups as ServicePolicyGroup[];
  /** Chữ cố định sửa được (khóa policy.*). */
  const t: Txt = (k, def, label, opts = {}) => ct(data, `policy.${k}`, def, label, opts);
  const T = (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = t(k, def, label, opts); return <span {...x.a}>{x.v}</span>; };
  /** Thuộc tính + chữ cho phần tử chỉ chứa chữ: <p {...P(…)} />. */
  const P = (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = t(k, def, label, opts); return { ...x.a, children: x.v }; };
  const company = <span {...cmsText('block.company.companyName', 'Tên pháp nhân', G)}>{SERVICE_POLICY_METADATA.companyName}</span>;
  return (
    <main id="main">
      <PageHead
        soft
        crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Chính sách dịch vụ' }]}
        eyebrow={T('head.eyebrow', 'DANAVA SOLUTIONS · Cam kết chất lượng', 'Nhãn nhỏ')}
        title={T('head.title', 'Chính sách dịch vụ & bảo hành', 'Tiêu đề trang')}
        lead={T('head.lead', 'Phạm vi cung cấp, cam kết chất lượng (SLA), thời hạn bảo hành, bàn giao mã nguồn và bảo mật dữ liệu khách hàng tại DANAVA Solutions.', 'Câu dẫn', { multiline: true })}
      >
        <span className="s-badge s-badge--neutral">{T('head.version', 'Phiên bản', 'Nhãn phiên bản')} <span {...B('version', 'Phiên bản')}>{SERVICE_POLICY_METADATA.version}</span></span>
        <span className="s-badge s-badge--neutral">{T('head.updated', 'Cập nhật', 'Nhãn ngày cập nhật')} {SERVICE_POLICY_METADATA.lastUpdated}</span>
        <a className="s-badge" href={`tel:${SERVICE_POLICY_METADATA.hotline.replace(/\s/g, '')}`}>{T('head.hotline', 'Hotline 24/7:', 'Nhãn hotline')} {SERVICE_POLICY_METADATA.hotline}</a>
      </PageHead>

      <section className="s-section s-section--tight" aria-label="Tóm tắt cam kết chất lượng dịch vụ">
        <div className="s-container">
          <div className="s-grid s-grid--4">
            {HIGHLIGHTS.map((item, i) => (
              <div key={item.title} className="s-card s-card--pad s-card--soft s-feature">
                <IconTile icon={item.icon} />
                <h2 className="s-feature__title" {...P(`highlights.${i}.title`, item.title, 'Tiêu đề cam kết')} />
                <p className="s-feature__text s-small" {...P(`highlights.${i}.text`, item.text, 'Mô tả cam kết', { multiline: true })} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-section s-section--flush-top">
        <div className="s-container">
          <div className="s-policy-layout">
            <aside className="s-policy-toc" aria-label="Mục lục chính sách dịch vụ">
              <p className="s-policy-toc__title" {...P('toc.title', 'Mục lục', 'Tiêu đề mục lục')} />
              <nav>
                <a href="#nguyen-tac-chung">{T('toc.1', '1. Nguyên tắc chung', 'Mục lục')}</a>
                <a href="#phan-mem">{T('toc.2', '2. Phần mềm DANAVA Studio', 'Mục lục')}</a>
                <a href="#thiet-ke-website">{T('toc.3', '3. Website & Web App', 'Mục lục')}</a>
                <a href="#truyen-thong-media">{T('toc.4', '4. Truyền thông & Media', 'Mục lục')}</a>
                <a href="#ma-tran-sla">{T('toc.5', '5. Ma trận sự cố & SLA', 'Mục lục')}</a>
                <a href="#kenh-tiep-nhan">{T('toc.6', '6. Kênh tiếp nhận hỗ trợ', 'Mục lục')}</a>
                <a href="#mien-tru-trach-nhiem">{T('toc.7', '7. Miễn trừ trách nhiệm', 'Mục lục')}</a>
                <a href="#dieu-khoan-du-thao" className="is-flag">{T('toc.8', '8. Phụ lục dự thảo', 'Mục lục')}</a>
                <a href="#thong-tin-ban-hanh">{T('toc.9', '9. Đơn vị ban hành', 'Mục lục')}</a>
              </nav>
            </aside>

            <article className="s-prose s-policy-body">
              <section id="nguyen-tac-chung">
                <h2 {...P('s1.title', '1. Nguyên tắc chung & phạm vi áp dụng', 'Tiêu đề mục')} />
                <p>
                  {T('s1.p1', 'Chính sách này quy định tiêu chuẩn chất lượng dịch vụ, thời gian phản hồi (SLA), điều kiện bảo hành kỹ thuật và trách nhiệm bảo mật giữa', 'Đoạn văn (trước tên công ty)', { multiline: true })} <strong>{company}</strong> {T('s1.p1-end', 'và khách hàng sử dụng dịch vụ.', 'Đoạn văn (sau tên công ty)')}
                </p>
                <p>
                  {T('s1.p2-lead', 'Với phương châm', 'Đoạn văn (mở đầu)')} <em>{T('s1.motto', '“Đi cùng nhau · Tạo nên giá trị”', 'Phương châm')}</em>{T('s1.p2', ', DANAVA Solutions cam kết mang đến giải pháp công nghệ ổn định và chiến dịch truyền thông hiệu quả, đồng hành dài hạn cùng doanh nghiệp.', 'Đoạn văn (sau phương châm)', { multiline: true })}
                </p>
                <div className="s-policy-note">
                  <Info aria-hidden="true" />
                  <p {...P('s1.note', 'Chính sách này là một phần không thể tách rời của Hợp đồng dịch vụ hoặc Đơn đặt hàng đã ký giữa DANAVA Solutions và Quý khách hàng.', 'Ghi chú', { multiline: true })} />
                </div>
              </section>

              <section id="phan-mem">
                <span className="s-badge" {...P('s2.badge', 'Phần mềm & SaaS', 'Nhãn mục')} />
                <h2>2. <span {...B('groups.0.title', 'Tên nhóm dịch vụ')}>{software.title}</span></h2>
                <PolicyGroup
                  group={software} n={0} t={t}
                  labels={['Phạm vi hỗ trợ & hạ tầng', 'Bảo hành & cập nhật tính năng', 'Quyền sở hữu dữ liệu', 'Trường hợp loại trừ hỗ trợ']}
                  link={{ href: '/giai-phap/danava-studio/', label: 'Tìm hiểu giải pháp DANAVA Studio' }}
                />
              </section>

              <section id="thiet-ke-website">
                <span className="s-badge" {...P('s3.badge', 'Website & Web App', 'Nhãn mục')} />
                <h2>3. <span {...B('groups.1.title', 'Tên nhóm dịch vụ')}>{website.title}</span></h2>
                <PolicyGroup
                  group={website} n={1} t={t}
                  labels={['Quy chuẩn kỹ thuật & nghiệm thu', 'Thời hạn bảo hành 12 tháng', 'Bàn giao mã nguồn & quản trị', 'Trường hợp loại trừ bảo hành']}
                  link={{ href: '/du-an/', label: 'Xem các dự án đã bàn giao' }}
                />
              </section>

              <section id="truyen-thong-media">
                <span className="s-badge" {...P('s4.badge', 'Truyền thông & Media', 'Nhãn mục')} />
                <h2>4. <span {...B('groups.2.title', 'Tên nhóm dịch vụ')}>{media.title}</span></h2>
                <PolicyGroup
                  group={media} n={2} t={t}
                  labels={['Kế hoạch thực thi & phê duyệt', 'Quy chuẩn duyệt & 02 vòng chỉnh sửa', 'Bàn giao file gốc & bảo mật tư liệu', 'Chi phí phát sinh ngoài phạm vi']}
                  link={{ href: '/blogs/', label: 'Xem bản tin & hoạt động' }}
                />
              </section>

              <section id="ma-tran-sla">
                <h2 {...P('s5.title', '5. Ma trận phân loại sự cố & cam kết SLA', 'Tiêu đề mục')} />
                <p {...P('s5.lead', 'DANAVA Solutions áp dụng ma trận phân loại mức độ sự cố và thời gian xử lý như sau:', 'Câu dẫn', { multiline: true })} />
                <div className="s-policy-table-wrap">
                  <table className="s-policy-table">
                    <thead>
                      <tr>
                        <th scope="col" {...P('sla.col.level', 'Mức độ', 'Tiêu đề cột')} />
                        <th scope="col" {...P('sla.col.scenario', 'Tình huống', 'Tiêu đề cột')} />
                        <th scope="col" {...P('sla.col.response', 'Phản hồi đầu tiên', 'Tiêu đề cột')} />
                        <th scope="col" {...P('sla.col.channel', 'Kênh tiếp nhận', 'Tiêu đề cột')} />
                      </tr>
                    </thead>
                    <tbody>
                      {SLA_MATRIX.map((sla, i) => (
                        <tr key={sla.level}>
                          <td data-label="Mức độ">
                            <span className={`s-policy-sla s-policy-sla--${sla.level}`} {...B(`sla.${i}.priorityText`, 'Mức ưu tiên')}>{sla.priorityText}</span>
                            <strong {...B(`sla.${i}.levelLabel`, 'Tên mức độ')}>{sla.levelLabel}</strong>
                          </td>
                          <td data-label="Tình huống">
                            <span {...B(`sla.${i}.scenario`, 'Tình huống', { multiline: true })}>{sla.scenario}</span>
                            <span className="s-policy-table__sub">{T('sla.resolution', 'Cam kết xử lý:', 'Nhãn cam kết xử lý')} <strong {...B(`sla.${i}.resolutionTime`, 'Thời gian xử lý')}>{sla.resolutionTime}</strong></span>
                          </td>
                          <td data-label="Phản hồi đầu tiên"><strong {...B(`sla.${i}.firstResponseTime`, 'Phản hồi đầu tiên')}>{sla.firstResponseTime}</strong></td>
                          <td data-label="Kênh tiếp nhận" {...B(`sla.${i}.contactChannel`, 'Kênh tiếp nhận')}>{sla.contactChannel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="kenh-tiep-nhan">
                <h2 {...P('s6.title', '6. Kênh tiếp nhận & quy trình hỗ trợ', 'Tiêu đề mục')} />
                <p {...P('s6.lead', 'Quý khách có thể liên hệ đội ngũ DANAVA Solutions qua các kênh chính thức:', 'Câu dẫn', { multiline: true })} />
                <div className="s-policy-channels">
                  {SUPPORT_CHANNELS.map((ch, i) => (
                    <div key={ch.id} className="s-policy-card">
                      <span className="s-badge s-badge--neutral" {...B(`channels.${i}.badge`, 'Nhãn kênh')}>{ch.badge}</span>
                      <h3 {...B(`channels.${i}.title`, 'Tên kênh')}>{ch.title}</h3>
                      <a className="s-policy-channel__value" href={ch.href}><span {...B(`channels.${i}.value`, 'Thông tin kênh')}>{ch.value}</span></a>
                      <p {...B(`channels.${i}.description`, 'Mô tả kênh', { multiline: true })}>{ch.description}</p>
                      <p className="s-policy-channel__hours"><Clock aria-hidden="true" /><span {...B(`channels.${i}.workingHours`, 'Giờ tiếp nhận')}>{ch.workingHours}</span></p>
                    </div>
                  ))}
                </div>
                <h3 {...P('steps.title', 'Quy trình 3 bước xử lý yêu cầu kỹ thuật', 'Tiêu đề quy trình')} />
                <ol className="s-policy-steps">
                  {STEPS.map(([title, text], i) => <li key={i}><strong {...P(`steps.${i}.title`, title, 'Tên bước')} /> {T(`steps.${i}.text`, text, 'Mô tả bước', { multiline: true })}</li>)}
                </ol>
              </section>

              <section id="mien-tru-trach-nhiem">
                <h2 {...P('s7.title', '7. Miễn trừ & giới hạn trách nhiệm', 'Tiêu đề mục')} />
                <p {...P('s7.lead', 'DANAVA Solutions được miễn trừ trách nhiệm bảo hành hoặc bồi thường trong các tình huống sau:', 'Câu dẫn', { multiline: true })} />
                <ul>
                  {EXEMPTIONS.map(([title, text], i) => <li key={i}><strong {...P(`exempt.${i}.title`, title, 'Tình huống')} /> {T(`exempt.${i}.text`, text, 'Mô tả tình huống', { multiline: true })}</li>)}
                </ul>
              </section>

              <section id="dieu-khoan-du-thao" className="s-policy-flag">
                <p className="s-policy-flag__badge"><AlertTriangle aria-hidden="true" /> {T('s8.badge', 'BẢN DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT CHÍNH THỨC', 'Nhãn dự thảo')}</p>
                <h2 {...P('s8.title', '8. Các điều khoản đang dự thảo', 'Tiêu đề mục')} />
                <p>
                  {T('s8.p1', 'Các điều khoản dưới đây', 'Đoạn văn (mở đầu)')} <strong>{T('s8.p1-strong', 'đang trong quá trình nghiên cứu và lấy ý kiến phê duyệt', 'Đoạn văn (nhấn mạnh)')}</strong>{T('s8.p1-end', ', chưa có hiệu lực cho đến khi được ban hành bằng văn bản chính thức.', 'Đoạn văn (cuối)', { multiline: true })}
                </p>
                {DRAFT_POLICY_CLAUSES.map((clause, i) => (
                  <div key={clause.id} className="s-policy-flag__item">
                    <span className="s-policy-flag__tag"><span {...B(`drafts.${i}.code`, 'Mã điều khoản')}>{clause.code}</span> · <span {...B(`drafts.${i}.targetService`, 'Dịch vụ áp dụng')}>{clause.targetService}</span></span>
                    <h3 {...B(`drafts.${i}.title`, 'Tên điều khoản')}>{clause.title}</h3>
                    <p><strong>{T('draft.proposed', 'Nội dung đề xuất:', 'Nhãn nội dung đề xuất')}</strong> <span {...B(`drafts.${i}.proposedContent`, 'Nội dung đề xuất', { multiline: true })}>{clause.proposedContent}</span></p>
                    <p className="s-policy-flag__analysis"><strong>{T('draft.impact', 'Đánh giá tác động:', 'Nhãn đánh giá tác động')}</strong> <span {...B(`drafts.${i}.impactAnalysis`, 'Đánh giá tác động', { multiline: true })}>{clause.impactAnalysis}</span></p>
                    <p className="s-policy-flag__status">{T('draft.status', 'Trạng thái:', 'Nhãn trạng thái')} <span {...B(`drafts.${i}.status`, 'Trạng thái điều khoản')}>{clause.status}</span></p>
                  </div>
                ))}
              </section>

              <section id="thong-tin-ban-hanh">
                <h2 {...P('s9.title', '9. Đơn vị ban hành & đầu mối kỹ thuật', 'Tiêu đề mục')} />
                <p {...P('s9.lead', 'Mọi thắc mắc về chính sách hoặc yêu cầu hỗ trợ kỹ thuật khẩn cấp, vui lòng liên hệ:', 'Câu dẫn', { multiline: true })} />
                <div className="s-policy-issuer">
                  <h3 {...cmsText('block.company.companyName', 'Tên pháp nhân', G)}>{SERVICE_POLICY_METADATA.companyName}</h3>
                  <p>{T('issuer.rep', 'Người đại diện:', 'Nhãn người đại diện')} <span {...cmsText('block.company.representative', 'Người đại diện', G)}>{SERVICE_POLICY_METADATA.representative}</span></p>
                  <ul className="s-policy-issuer__list">
                    <li><MapPin aria-hidden="true" /><span {...cmsText('block.company.legalAddress', 'Địa chỉ trụ sở', G)}>{SERVICE_POLICY_METADATA.address}</span></li>
                    <li><Phone aria-hidden="true" /><a href={`tel:${SERVICE_POLICY_METADATA.hotline.replace(/\s/g, '')}`}>{SERVICE_POLICY_METADATA.hotline}</a></li>
                    <li><Mail aria-hidden="true" /><span>{T('issuer.tech', 'Kỹ thuật:', 'Nhãn email kỹ thuật')} <a href={`mailto:${SERVICE_POLICY_METADATA.supportEmail}`}><span {...cmsText('block.company.supportEmail', 'Email hỗ trợ kỹ thuật', G)}>{SERVICE_POLICY_METADATA.supportEmail}</span></a> · {T('issuer.partner', 'Đối tác:', 'Nhãn email đối tác')} <a href={`mailto:${SERVICE_POLICY_METADATA.generalEmail}`}><span {...cmsText('site.email', 'Email liên hệ', G)}>{SERVICE_POLICY_METADATA.generalEmail}</span></a></span></li>
                  </ul>
                  <div className="s-row">
                    <Link href="/lien-he/" className="s-btn s-btn--primary">{T('issuer.contact', 'Gửi yêu cầu hỗ trợ', 'Nút liên hệ')}</Link>
                    <Link href="/chinh-sach-rieng-tu/" className="s-btn s-btn--secondary">{T('issuer.privacy', 'Chính sách riêng tư', 'Nút chính sách riêng tư')}</Link>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServicePolicy;
