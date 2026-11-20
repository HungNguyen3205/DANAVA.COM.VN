import Link from 'next/link';
import { ShieldCheck, Wrench, Headphones, PackageCheck, Info, AlertTriangle, Check, X, Phone, Mail, MapPin, Clock } from 'lucide-react';
import type { ServicePolicyGroup, SLAMatrixItem, SupportChannel, DraftClause } from '@/lib/service-policy';
import type { SiteData } from '@/lib/content';
import { CONTACT } from '@/lib/company';
import { block } from '@/lib/blocks';
import { formatPhone } from './site/catalog';
import { PageHead, IconTile } from './site/ui';

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Uptime ≥ 99.9%', text: 'Hạ tầng đám mây chuyên dụng, sao lưu dữ liệu tự động hằng ngày để phần mềm vận hành liên tục.' },
  { icon: Wrench, title: 'Bảo hành website 12 tháng', text: 'Khắc phục lỗi phát sinh và đảm bảo tương thích đa trình duyệt miễn phí trong tối thiểu 1 năm.' },
  { icon: Headphones, title: 'Phản hồi khẩn cấp ≤ 60 phút', text: 'Hotline 24/7 và nhóm Zalo chuyên trách cho sự cố ảnh hưởng đến check-in và kinh doanh.' },
  { icon: PackageCheck, title: 'Bàn giao quyền sở hữu', text: 'Khách hàng sở hữu dữ liệu hội viên, doanh thu và mã nguồn sau nghiệm thu.' }
];

function PolicyGroup({ group, labels, link }: {
  group: ServicePolicyGroup;
  labels: [string, string, string, string];
  link: { href: string; label: string };
}) {
  const lists: [string, string[]][] = [
    [labels[0], group.scopeOfSupport],
    [labels[1], group.warrantyTerms],
    [labels[2], group.ownershipAndHandover]
  ];
  return (
    <>
      <p className="s-policy-lead">{group.tagline}</p>
      <div className="s-policy-cards">
        {lists.map(([title, items]) => (
          <div key={title} className="s-policy-card">
            <h3>{title}</h3>
            <ul className="s-policy-list">
              {items.map((item, i) => <li key={i}><Check aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </div>
        ))}
        <div className="s-policy-card s-policy-card--muted">
          <h3>{labels[3]}</h3>
          <ul className="s-policy-list s-policy-list--x">
            {group.exclusions.map((item, i) => <li key={i}><X aria-hidden="true" /><span>{item}</span></li>)}
          </ul>
        </div>
      </div>
      <p className="s-policy-more">
        <Link href={link.href}>{link.label} →</Link>
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
  return (
    <main id="main">
      <PageHead
        soft
        crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Chính sách dịch vụ' }]}
        eyebrow="DANAVA SOLUTIONS · Cam kết chất lượng"
        title="Chính sách dịch vụ & bảo hành"
        lead="Phạm vi cung cấp, cam kết chất lượng (SLA), thời hạn bảo hành, bàn giao mã nguồn và bảo mật dữ liệu khách hàng tại DANAVA Solutions."
      >
        <span className="s-badge s-badge--neutral">Phiên bản {SERVICE_POLICY_METADATA.version}</span>
        <span className="s-badge s-badge--neutral">Cập nhật {SERVICE_POLICY_METADATA.lastUpdated}</span>
        <a className="s-badge" href={`tel:${SERVICE_POLICY_METADATA.hotline.replace(/\s/g, '')}`}>Hotline 24/7: {SERVICE_POLICY_METADATA.hotline}</a>
      </PageHead>

      <section className="s-section s-section--tight" aria-label="Tóm tắt cam kết chất lượng dịch vụ">
        <div className="s-container">
          <div className="s-grid s-grid--4">
            {HIGHLIGHTS.map(item => (
              <div key={item.title} className="s-card s-card--pad s-card--soft s-feature">
                <IconTile icon={item.icon} />
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
            <aside className="s-policy-toc" aria-label="Mục lục chính sách dịch vụ">
              <p className="s-policy-toc__title">Mục lục</p>
              <nav>
                <a href="#nguyen-tac-chung">1. Nguyên tắc chung</a>
                <a href="#phan-mem">2. Phần mềm DANAVA Studio</a>
                <a href="#thiet-ke-website">3. Website &amp; Web App</a>
                <a href="#truyen-thong-media">4. Truyền thông &amp; Media</a>
                <a href="#ma-tran-sla">5. Ma trận sự cố &amp; SLA</a>
                <a href="#kenh-tiep-nhan">6. Kênh tiếp nhận hỗ trợ</a>
                <a href="#mien-tru-trach-nhiem">7. Miễn trừ trách nhiệm</a>
                <a href="#dieu-khoan-du-thao" className="is-flag">8. Phụ lục dự thảo</a>
                <a href="#thong-tin-ban-hanh">9. Đơn vị ban hành</a>
              </nav>
            </aside>

            <article className="s-prose s-policy-body">
              <section id="nguyen-tac-chung">
                <h2>1. Nguyên tắc chung &amp; phạm vi áp dụng</h2>
                <p>
                  Chính sách này quy định tiêu chuẩn chất lượng dịch vụ, thời gian phản hồi (SLA), điều kiện bảo hành kỹ thuật và trách nhiệm bảo mật giữa <strong>{SERVICE_POLICY_METADATA.companyName}</strong> và khách hàng sử dụng dịch vụ.
                </p>
                <p>
                  Với phương châm <em>“Đi cùng nhau · Tạo nên giá trị”</em>, DANAVA Solutions cam kết mang đến giải pháp công nghệ ổn định và chiến dịch truyền thông hiệu quả, đồng hành dài hạn cùng doanh nghiệp.
                </p>
                <div className="s-policy-note">
                  <Info aria-hidden="true" />
                  <p>Chính sách này là một phần không thể tách rời của Hợp đồng dịch vụ hoặc Đơn đặt hàng đã ký giữa DANAVA Solutions và Quý khách hàng.</p>
                </div>
              </section>

              <section id="phan-mem">
                <span className="s-badge">Phần mềm &amp; SaaS</span>
                <h2>2. {software.title}</h2>
                <PolicyGroup
                  group={software}
                  labels={['Phạm vi hỗ trợ & hạ tầng', 'Bảo hành & cập nhật tính năng', 'Quyền sở hữu dữ liệu', 'Trường hợp loại trừ hỗ trợ']}
                  link={{ href: '/giai-phap/danava-studio/', label: 'Tìm hiểu giải pháp DANAVA Studio' }}
                />
              </section>

              <section id="thiet-ke-website">
                <span className="s-badge">Website &amp; Web App</span>
                <h2>3. {website.title}</h2>
                <PolicyGroup
                  group={website}
                  labels={['Quy chuẩn kỹ thuật & nghiệm thu', 'Thời hạn bảo hành 12 tháng', 'Bàn giao mã nguồn & quản trị', 'Trường hợp loại trừ bảo hành']}
                  link={{ href: '/du-an/', label: 'Xem các dự án đã bàn giao' }}
                />
              </section>

              <section id="truyen-thong-media">
                <span className="s-badge">Truyền thông &amp; Media</span>
                <h2>4. {media.title}</h2>
                <PolicyGroup
                  group={media}
                  labels={['Kế hoạch thực thi & phê duyệt', 'Quy chuẩn duyệt & 02 vòng chỉnh sửa', 'Bàn giao file gốc & bảo mật tư liệu', 'Chi phí phát sinh ngoài phạm vi']}
                  link={{ href: '/kien-thuc/', label: 'Xem bản tin & hoạt động' }}
                />
              </section>

              <section id="ma-tran-sla">
                <h2>5. Ma trận phân loại sự cố &amp; cam kết SLA</h2>
                <p>DANAVA Solutions áp dụng ma trận phân loại mức độ sự cố và thời gian xử lý như sau:</p>
                <div className="s-policy-table-wrap">
                  <table className="s-policy-table">
                    <thead>
                      <tr>
                        <th scope="col">Mức độ</th>
                        <th scope="col">Tình huống</th>
                        <th scope="col">Phản hồi đầu tiên</th>
                        <th scope="col">Kênh tiếp nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SLA_MATRIX.map(sla => (
                        <tr key={sla.level}>
                          <td data-label="Mức độ">
                            <span className={`s-policy-sla s-policy-sla--${sla.level}`}>{sla.priorityText}</span>
                            <strong>{sla.levelLabel}</strong>
                          </td>
                          <td data-label="Tình huống">
                            {sla.scenario}
                            <span className="s-policy-table__sub">Cam kết xử lý: <strong>{sla.resolutionTime}</strong></span>
                          </td>
                          <td data-label="Phản hồi đầu tiên"><strong>{sla.firstResponseTime}</strong></td>
                          <td data-label="Kênh tiếp nhận">{sla.contactChannel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="kenh-tiep-nhan">
                <h2>6. Kênh tiếp nhận &amp; quy trình hỗ trợ</h2>
                <p>Quý khách có thể liên hệ đội ngũ DANAVA Solutions qua các kênh chính thức:</p>
                <div className="s-policy-channels">
                  {SUPPORT_CHANNELS.map(ch => (
                    <div key={ch.id} className="s-policy-card">
                      <span className="s-badge s-badge--neutral">{ch.badge}</span>
                      <h3>{ch.title}</h3>
                      <a className="s-policy-channel__value" href={ch.href}>{ch.value}</a>
                      <p>{ch.description}</p>
                      <p className="s-policy-channel__hours"><Clock aria-hidden="true" />{ch.workingHours}</p>
                    </div>
                  ))}
                </div>
                <h3>Quy trình 3 bước xử lý yêu cầu kỹ thuật</h3>
                <ol className="s-policy-steps">
                  <li><strong>Tiếp nhận &amp; phân loại.</strong> Khách hàng gửi thông tin qua Hotline/Zalo; kỹ thuật viên xác nhận trong khung giờ SLA tương ứng.</li>
                  <li><strong>Khắc phục &amp; kiểm thử.</strong> Đội kỹ thuật cô lập lỗi, sửa trên môi trường Staging trước khi cập nhật Production.</li>
                  <li><strong>Bàn giao &amp; xác nhận.</strong> Thông báo kết quả cho khách hàng và ghi nhận hoàn tất vào nhật ký hỗ trợ.</li>
                </ol>
              </section>

              <section id="mien-tru-trach-nhiem">
                <h2>7. Miễn trừ &amp; giới hạn trách nhiệm</h2>
                <p>DANAVA Solutions được miễn trừ trách nhiệm bảo hành hoặc bồi thường trong các tình huống sau:</p>
                <ul>
                  <li><strong>Sự kiện bất khả kháng:</strong> thiên tai, hỏa hoạn, động đất, sự cố đứt cáp quang biển diện rộng hoặc chỉ thị hành chính từ cơ quan Nhà nước có thẩm quyền.</li>
                  <li><strong>Tự ý sửa đổi mã nguồn:</strong> khách hàng hoặc bên thứ ba can thiệp vào code, cơ sở dữ liệu hoặc cấu hình máy chủ mà không phối hợp với DANAVA.</li>
                  <li><strong>Để lộ thông tin xác thực:</strong> sự cố do lộ mật khẩu quản trị, mã xác thực 2 bước (2FA) hoặc bị lừa đảo trực tuyến (phishing).</li>
                  <li><strong>Hết hạn dịch vụ bên thứ ba:</strong> tên miền, chứng chỉ SSL hoặc hosting do khách hàng tự quản lý bị hết hạn mà không thông báo cho DANAVA.</li>
                </ul>
              </section>

              <section id="dieu-khoan-du-thao" className="s-policy-flag">
                <p className="s-policy-flag__badge"><AlertTriangle aria-hidden="true" /> BẢN DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT CHÍNH THỨC</p>
                <h2>8. Các điều khoản đang dự thảo</h2>
                <p>
                  Các điều khoản dưới đây <strong>đang trong quá trình nghiên cứu và lấy ý kiến phê duyệt</strong>, chưa có hiệu lực cho đến khi được ban hành bằng văn bản chính thức.
                </p>
                {DRAFT_POLICY_CLAUSES.map(clause => (
                  <div key={clause.id} className="s-policy-flag__item">
                    <span className="s-policy-flag__tag">{clause.code} · {clause.targetService}</span>
                    <h3>{clause.title}</h3>
                    <p><strong>Nội dung đề xuất:</strong> {clause.proposedContent}</p>
                    <p className="s-policy-flag__analysis"><strong>Đánh giá tác động:</strong> {clause.impactAnalysis}</p>
                    <p className="s-policy-flag__status">Trạng thái: {clause.status}</p>
                  </div>
                ))}
              </section>

              <section id="thong-tin-ban-hanh">
                <h2>9. Đơn vị ban hành &amp; đầu mối kỹ thuật</h2>
                <p>Mọi thắc mắc về chính sách hoặc yêu cầu hỗ trợ kỹ thuật khẩn cấp, vui lòng liên hệ:</p>
                <div className="s-policy-issuer">
                  <h3>{SERVICE_POLICY_METADATA.companyName}</h3>
                  <p>Người đại diện: {SERVICE_POLICY_METADATA.representative}</p>
                  <ul className="s-policy-issuer__list">
                    <li><MapPin aria-hidden="true" />{SERVICE_POLICY_METADATA.address}</li>
                    <li><Phone aria-hidden="true" /><a href={`tel:${SERVICE_POLICY_METADATA.hotline.replace(/\s/g, '')}`}>{SERVICE_POLICY_METADATA.hotline}</a></li>
                    <li><Mail aria-hidden="true" /><span>Kỹ thuật: <a href={`mailto:${SERVICE_POLICY_METADATA.supportEmail}`}>{SERVICE_POLICY_METADATA.supportEmail}</a> · Đối tác: <a href={`mailto:${SERVICE_POLICY_METADATA.generalEmail}`}>{SERVICE_POLICY_METADATA.generalEmail}</a></span></li>
                  </ul>
                  <div className="s-row">
                    <Link href="/lien-he/" className="s-btn s-btn--primary">Gửi yêu cầu hỗ trợ</Link>
                    <Link href="/chinh-sach-rieng-tu/" className="s-btn s-btn--secondary">Chính sách riêng tư</Link>
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
