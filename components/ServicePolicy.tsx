import Link from 'next/link';
import {
  SERVICE_POLICY_METADATA,
  APPROVED_SERVICE_POLICIES,
  SLA_MATRIX,
  SUPPORT_CHANNELS,
  DRAFT_POLICY_CLAUSES
} from '@/lib/service-policy';

export function ServicePolicy() {
  return (
    <main id="main" className="service-policy-wrapper">
      {/* 1. HERO PHẦN CHÍNH SÁCH */}
      <section className="policy-hero-section">
        <div className="policy-hero-container">
          <nav aria-label="Breadcrumb" className="policy-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="sep" aria-hidden="true">/</span>
            <span className="current" aria-current="page">Chính sách dịch vụ</span>
          </nav>
          <span className="policy-kicker">DANAVA SOLUTIONS · CAM KẾT ĐỒNG HÀNH &amp; CHẤT LƯỢNG DỊCH VỤ</span>
          <h1 className="policy-title">Chính sách Dịch vụ &amp; Bảo hành Kỹ thuật</h1>
          <p className="policy-subtitle">
            Khung quy chuẩn về phạm vi cung cấp, cam kết chất lượng (SLA), thời hạn bảo hành phần mềm, bàn giao mã nguồn website và quy tắc bảo mật dữ liệu khách hàng tại DANAVA Solutions.
          </p>
          <div className="policy-meta-bar">
            <span className="meta-pill version">
              Phiên bản: <strong>{SERVICE_POLICY_METADATA.version}</strong>
            </span>
            <span className="meta-pill date">
              Ngày cập nhật: <strong>{SERVICE_POLICY_METADATA.lastUpdated}</strong>
            </span>
            <span className="meta-pill hot-line">
              Hotline hỗ trợ 24/7: <a href={`tel:${SERVICE_POLICY_METADATA.hotline}`}>{SERVICE_POLICY_METADATA.hotline}</a>
            </span>
            <span className="meta-pill org">
              Đơn vị ban hành: <strong>{SERVICE_POLICY_METADATA.companyName}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* 2. KHUNG CAM KẾT CỐT LÕI (4 HIGHLIGHT CARDS) */}
      <section className="section policy-highlights-section" aria-label="Tóm tắt cam kết chất lượng dịch vụ">
        <div className="policy-highlights-grid">
          <div className="highlight-card">
            <span className="highlight-icon" aria-hidden="true">🛡️</span>
            <h3>SLA Uptime $\ge$ 99.9%</h3>
            <p>Hạ tầng đám mây chuyên dụng, sao lưu dữ liệu tự động hàng ngày, bảo đảm phần mềm vận hành liên tục không gián đoạn.</p>
          </div>
          <div className="highlight-card">
            <span className="highlight-icon" aria-hidden="true">⚡</span>
            <h3>Bảo hành Website 12 tháng</h3>
            <p>Cam kết bảo hành mã nguồn tối thiểu 1 năm, khắc phục lỗi phát sinh và tương thích đa trình duyệt hoàn toàn miễn phí.</p>
          </div>
          <div className="highlight-card">
            <span className="highlight-icon" aria-hidden="true">📞</span>
            <h3>Phản hồi khẩn cấp $\le$ 60 phút</h3>
            <p>Đường dây nóng 24/7 và nhóm Zalo chuyên trách xử lý tức thời các sự cố ảnh hưởng đến check-in và kinh doanh.</p>
          </div>
          <div className="highlight-card">
            <span className="highlight-icon" aria-hidden="true">📦</span>
            <h3>Bàn giao 100% Quyền sở hữu</h3>
            <p>Khách hàng sở hữu toàn bộ dữ liệu hội viên, doanh thu và toàn quyền mã nguồn (Source Code) sau nghiệm thu.</p>
          </div>
        </div>
      </section>

      {/* 3. BỐ CỤC CHÍNH HAI CỘT: MỤC LỤC & NỘI DUNG CHI TIẾT */}
      <section className="policy-content-section">
        <div className="policy-layout-container">
          {/* MỤC LỤC ĐIỀU HƯỚNG CỐ ĐỊNH (STICKY TOC) */}
          <aside className="policy-toc-sidebar" aria-label="Mục lục chính sách dịch vụ">
            <div className="policy-toc-box">
              <span className="policy-toc-heading">MỤC LỤC CHÍNH SÁCH</span>
              <nav className="policy-toc-nav">
                <a href="#nguyen-tac-chung" className="toc-item-link">1. Nguyên tắc chung &amp; Phạm vi áp dụng</a>
                <a href="#phan-mem" className="toc-item-link">2. Phần mềm Quản trị DANAVA Studio</a>
                <a href="#thiet-ke-website" className="toc-item-link">3. Thiết kế Website &amp; Web App</a>
                <a href="#truyen-thong-media" className="toc-item-link">4. Dịch vụ Truyền thông &amp; Media</a>
                <a href="#ma-tran-sla" className="toc-item-link">5. Ma trận Sự cố &amp; Cam kết SLA</a>
                <a href="#kenh-tiep-nhan" className="toc-item-link">6. Kênh Tiếp nhận &amp; Quy trình Hỗ trợ</a>
                <a href="#mien-tru-trach-nhiem" className="toc-item-link">7. Điều khoản Miễn trừ Trách nhiệm</a>
                <a href="#dieu-khoan-du-thao" className="toc-item-link highlight-draft">8. Phụ lục Dự thảo (Chờ Phê duyệt)</a>
                <a href="#thong-tin-ban-hanh" className="toc-item-link">9. Thông tin Đơn vị Ban hành</a>
              </nav>
            </div>
          </aside>

          {/* CỘT NỘI DUNG CHI TIẾT */}
          <article className="policy-body-column">
            {/* MỤC 1: NGUYÊN TẮC CHUNG */}
            <div id="nguyen-tac-chung" className="policy-block">
              <h2>1. Nguyên tắc chung &amp; Phạm vi áp dụng</h2>
              <p>
                Chính sách này quy định rõ các tiêu chuẩn chất lượng dịch vụ, thời gian phản hồi (SLA), điều kiện bảo hành kỹ thuật và trách nhiệm bảo mật giữa <strong>CÔNG TY TNHH DANAVA SOLUTIONS</strong> và khách hàng sử dụng dịch vụ.
              </p>
              <p>
                Với phương châm <em>"Đi cùng nhau · Tạo nên giá trị"</em>, DANAVA Solutions cam kết mang đến những giải pháp công nghệ ổn định và chiến dịch truyền thông hiệu quả, đồng hành dài hạn cùng sự phát triển của doanh nghiệp.
              </p>
              <div className="policy-info-note">
                <span className="note-icon" aria-hidden="true">💡</span>
                <p>
                  Chính sách này là một phần không thể tách rời của Hợp đồng dịch vụ hoặc Đơn đặt hàng đã được ký kết giữa DANAVA Solutions và Quý khách hàng.
                </p>
              </div>
            </div>

            {/* MỤC 2: PHẦN MỀM DANAVA STUDIO */}
            <div id="phan-mem" className="policy-block">
              <div className="block-badge-category software">KHỐI DỊCH VỤ PHẦN MỀM &amp; SAAS</div>
              <h2>2. Chính sách Phần mềm Quản trị DANAVA Studio</h2>
              <p className="block-lead">
                Áp dụng cho các cơ sở Gym, Trung tâm Yoga, Pilates Studio, Bể bơi và Spa sử dụng nền tảng quản trị đám mây DANAVA Studio.
              </p>

              <div className="sub-policy-card">
                <h3>Phạm vi hỗ trợ &amp; Hạ tầng vận hành</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[0].scopeOfSupport.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card">
                <h3>Chế độ bảo hành &amp; Cập nhật tính năng</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[0].warrantyTerms.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card">
                <h3>Quyền sở hữu dữ liệu &amp; Tính độc lập</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[0].ownershipAndHandover.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card warning-card">
                <h3>Trường hợp loại trừ hỗ trợ</h3>
                <ul className="policy-cross-list">
                  {APPROVED_SERVICE_POLICIES[0].exclusions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="policy-quick-link-box">
                <span>Tìm hiểu thêm về nền tảng phần mềm:</span>
                <Link href="/giai-phap/danava-studio/" className="text-cta-link">
                  Khám phá giải pháp DANAVA Studio ↗
                </Link>
              </div>
            </div>

            {/* MỤC 3: THIẾT KẾ WEBSITE & WEB APP */}
            <div id="thiet-ke-website" className="policy-block">
              <div className="block-badge-category website">KHỐI THIẾT KẾ WEBSITE &amp; WEB APP</div>
              <h2>3. Chính sách Thiết kế Website &amp; Ứng dụng Web</h2>
              <p className="block-lead">
                Áp dụng cho dịch vụ thiết kế website doanh nghiệp, landing page chuyển đổi cao và các nền tảng ứng dụng trực tuyến theo yêu cầu.
              </p>

              <div className="sub-policy-card">
                <h3>Quy chuẩn kỹ thuật &amp; Nghiệm thu</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[1].scopeOfSupport.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card">
                <h3>Thời hạn bảo hành 12 tháng</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[1].warrantyTerms.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card">
                <h3>Bàn giao 100% Clean Source Code &amp; Quản trị</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[1].ownershipAndHandover.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card warning-card">
                <h3>Trường hợp loại trừ bảo hành website</h3>
                <ul className="policy-cross-list">
                  {APPROVED_SERVICE_POLICIES[1].exclusions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="policy-quick-link-box">
                <span>Xem các dự án website đã bàn giao thực tế:</span>
                <Link href="/du-an/" className="text-cta-link">
                  Hồ sơ dự án tiêu biểu của DANAVA ↗
                </Link>
              </div>
            </div>

            {/* MỤC 4: TRUYỀN THÔNG & MEDIA */}
            <div id="truyen-thong-media" className="policy-block">
              <div className="block-badge-category media">KHỐI TRUYỀN THÔNG &amp; SẢN XUẤT MEDIA</div>
              <h2>4. Chính sách Dịch vụ Truyền thông &amp; Sản xuất Media</h2>
              <p className="block-lead">
                Áp dụng cho các chiến dịch Digital Marketing tổng thể, chăm sóc kênh Fanpage/Zalo OA, quay dựng video ngắn và hình ảnh thương hiệu.
              </p>

              <div className="sub-policy-card">
                <h3>Kế hoạch thực thi &amp; Phê duyệt trước</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[2].scopeOfSupport.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card">
                <h3>Quy chuẩn duyệt &amp; 02 vòng chỉnh sửa (Revisions)</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[2].warrantyTerms.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card">
                <h3>Bàn giao file thiết kế gốc &amp; Bảo mật tư liệu</h3>
                <ul className="policy-check-list">
                  {APPROVED_SERVICE_POLICIES[2].ownershipAndHandover.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="sub-policy-card warning-card">
                <h3>Trường hợp phát sinh chi phí ngoài phạm vi</h3>
                <ul className="policy-cross-list">
                  {APPROVED_SERVICE_POLICIES[2].exclusions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="policy-quick-link-box">
                <span>Xem các ấn phẩm và bản tin truyền thông:</span>
                <Link href="/kien-thuc/" className="text-cta-link">
                  Bản tin &amp; Hoạt động DANAVA ↗
                </Link>
              </div>
            </div>

            {/* MỤC 5: MA TRẬN SLA THỜI GIAN PHẢN HỒI */}
            <div id="ma-tran-sla" className="policy-block">
              <h2>5. Ma trận Phân loại Sự cố &amp; Cam kết SLA</h2>
              <p>
                Để đảm bảo tính kịp thời và tập trung tối đa nguồn lực kỹ thuật, DANAVA Solutions áp dụng ma trận phân loại mức độ sự cố và thời gian xử lý cam kết như sau:
              </p>

              <div className="sla-table-wrapper">
                <table className="sla-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Mức độ sự cố</th>
                      <th style={{ width: '38%' }}>Tình huống mô tả</th>
                      <th style={{ width: '20%' }}>Thời gian phản hồi</th>
                      <th style={{ width: '20%' }}>Kênh tiếp nhận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SLA_MATRIX.map((sla, idx) => (
                      <tr key={idx} className={`sla-row-${sla.level}`}>
                        <td className="sla-level-cell">
                          <span className={`sla-badge ${sla.level}`}>{sla.priorityText}</span>
                          <strong>{sla.levelLabel}</strong>
                        </td>
                        <td>
                          <p className="sla-scenario-text">{sla.scenario}</p>
                          <span className="sla-res-time">Cam kết xử lý: <strong>{sla.resolutionTime}</strong></span>
                        </td>
                        <td className="sla-time-cell">
                          <span className="sla-time-val">{sla.firstResponseTime}</span>
                        </td>
                        <td className="sla-channel-cell">
                          <span>{sla.contactChannel}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MỤC 6: KÊNH TIẾP NHẬN & QUY TRÌNH */}
            <div id="kenh-tiep-nhan" className="policy-block">
              <h2>6. Kênh Tiếp nhận &amp; Quy trình Hỗ trợ Kỹ thuật</h2>
              <p>
                Quý khách hàng có thể liên hệ với đội ngũ DANAVA Solutions qua các kênh chính thức sau:
              </p>

              <div className="channels-grid">
                {SUPPORT_CHANNELS.map((ch) => (
                  <div key={ch.id} className="channel-item-card">
                    <span className="channel-badge">{ch.badge}</span>
                    <h3>{ch.title}</h3>
                    <a href={ch.href} className="channel-value-link">{ch.value}</a>
                    <p className="channel-desc">{ch.description}</p>
                    <span className="channel-hours">🕒 {ch.workingHours}</span>
                  </div>
                ))}
              </div>

              <div className="support-steps-box">
                <h3>Quy trình 3 bước xử lý yêu cầu kỹ thuật</h3>
                <div className="steps-flow">
                  <div className="step-flow-item">
                    <span className="step-index">BƯỚC 1</span>
                    <h4>Tiếp nhận &amp; Phân loại</h4>
                    <p>Khách hàng gửi thông tin qua Hotline/Zalo; Kỹ thuật viên xác nhận trong khung giờ SLA tương ứng.</p>
                  </div>
                  <div className="step-flow-item">
                    <span className="step-index">BƯỚC 2</span>
                    <h4>Khắc phục &amp; Kiểm thử</h4>
                    <p>Đội ngũ kỹ thuật cô lập lỗi, tiến hành sửa chữa trên môi trường Staging trước khi cập nhật Production.</p>
                  </div>
                  <div className="step-flow-item">
                    <span className="step-index">BƯỚC 3</span>
                    <h4>Bàn giao &amp; Xác nhận</h4>
                    <p>Thông báo kết quả khắc phục cho khách hàng và ghi nhận hoàn tất vào nhật ký hỗ trợ kỹ thuật.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MỤC 7: ĐIỀU KHOẢN MIỄN TRỪ TRÁCH NHIỆM */}
            <div id="mien-tru-trach-nhiem" className="policy-block">
              <h2>7. Điều khoản Miễn trừ &amp; Giới hạn Trách nhiệm</h2>
              <p>
                DANAVA Solutions được miễn trừ trách nhiệm bảo hành hoặc bồi thường trong các tình huống sau:
              </p>
              <ul className="policy-bullet-list">
                <li><strong>Sự kiện bất khả kháng:</strong> Thiên tai, hỏa hoạn, động đất, sự cố đứt cáp quang biển quốc tế diện rộng, hoặc các chỉ thị hành chính bất khả kháng từ cơ quan Nhà nước có thẩm quyền.</li>
                <li><strong>Tự ý sửa đổi mã nguồn:</strong> Khách hàng hoặc bên thứ ba tự ý can thiệp vào cấu trúc code, cơ sở dữ liệu hoặc cấu hình máy chủ hosting mà không có sự đồng ý hoặc phối hợp kỹ thuật với DANAVA.</li>
                <li><strong>Để lộ thông tin xác thực:</strong> Sự cố bắt nguồn từ việc người dùng để lộ mật khẩu quản trị, lộ mã xác thực 2 bước (2FA) hoặc bị lừa đảo trực tuyến (phishing) từ bên ngoài.</li>
                <li><strong>Hết hạn dịch vụ bên thứ ba:</strong> Tên miền (Domain), chứng chỉ SSL bên ngoài, hoặc máy chủ lưu trữ (Hosting) của khách hàng tự gia hạn bị hết hạn mà không thông báo gia hạn cho DANAVA.</li>
              </ul>
            </div>

            {/* MỤC 8: PHỤ LỤC DỰ THẢO - CHỜ BAN GIÁM ĐỐC DUYỆT */}
            <div id="dieu-khoan-du-thao" className="policy-block draft-flagged-block">
              <div className="draft-banner-header">
                <span className="draft-badge-pill">⚠️ BẢN DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT CHÍNH THỨC</span>
                <h2>8. Các điều khoản đang dự thảo (Trạng thái nháp)</h2>
              </div>
              <p className="draft-lead-text">
                Theo quy định bảo đảm tính pháp lý của DANAVA Solutions, các điều khoản dưới đây <strong>đang trong quá trình nghiên cứu và chuẩn bị lấy ý kiến phê duyệt</strong>, chưa có hiệu lực áp dụng chính thức cho đến khi được ban hành văn bản chính thức:
              </p>

              <div className="draft-clauses-stack">
                {DRAFT_POLICY_CLAUSES.map((clause) => (
                  <div key={clause.id} className="draft-clause-card">
                    <span className="clause-code">{clause.code}</span>
                    <span className="clause-target">Áp dụng cho: <strong>{clause.targetService}</strong></span>
                    <h3>{clause.title}</h3>
                    <p className="clause-content"><strong>Nội dung đề xuất:</strong> {clause.proposedContent}</p>
                    <div className="clause-analysis-box">
                      <span className="analysis-tag">Đánh giá tác động &amp; Hiện trạng:</span>
                      <p>{clause.impactAnalysis}</p>
                    </div>
                    <div className="clause-status-tag">
                      <span>Trạng thái: <em>{clause.status}</em></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MỤC 9: THÔNG TIN ĐƠN VỊ BAN HÀNH & LIÊN HỆ */}
            <div id="thong-tin-ban-hanh" className="policy-block">
              <h2>9. Thông tin Đơn vị Ban hành &amp; Đầu mối Kỹ thuật</h2>
              <p>
                Mọi thắc mắc về chính sách dịch vụ hoặc yêu cầu hỗ trợ kỹ thuật khẩn cấp, Quý khách vui lòng liên hệ:
              </p>

              <div className="policy-issuer-card">
                <h3>{SERVICE_POLICY_METADATA.companyName}</h3>
                <div className="issuer-meta-list">
                  <p><strong>Người đại diện:</strong> {SERVICE_POLICY_METADATA.representative}</p>
                  <p><strong>Địa chỉ:</strong> {SERVICE_POLICY_METADATA.address}</p>
                  <p><strong>Hotline kỹ thuật:</strong> <a href={`tel:${SERVICE_POLICY_METADATA.hotline}`}>{SERVICE_POLICY_METADATA.hotline}</a></p>
                  <p><strong>Email kỹ thuật:</strong> <a href={`mailto:${SERVICE_POLICY_METADATA.supportEmail}`}>{SERVICE_POLICY_METADATA.supportEmail}</a></p>
                  <p><strong>Email đối tác:</strong> <a href={`mailto:${SERVICE_POLICY_METADATA.generalEmail}`}>{SERVICE_POLICY_METADATA.generalEmail}</a></p>
                </div>
                <div className="issuer-actions">
                  <Link href="/lien-he/" className="button amber">
                    Gửi yêu cầu hỗ trợ trực tuyến ↗
                  </Link>
                  <Link href="/chinh-sach-rieng-tu/" className="button secondary">
                    Xem Chính sách Riêng tư ↗
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default ServicePolicy;

