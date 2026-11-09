import Link from 'next/link';

export function PrivacyPolicy() {
  return (
    <main id="main" className="privacy-page-wrapper">
      {/* 1. HERO BẢN CHÍNH SÁCH */}
      <section className="privacy-hero-section">
        <div className="privacy-hero-container">
          <nav aria-label="Breadcrumb" className="privacy-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="sep" aria-hidden="true">/</span>
            <span className="current" aria-current="page">Chính sách riêng tư</span>
          </nav>
          <span className="privacy-kicker">DANAVA SOLUTIONS · MINH BẠCH &amp; TRÁCH NHIỆM</span>
          <h1 className="privacy-title">Chính sách Quyền riêng tư &amp; Đo lường Dữ liệu</h1>
          <p className="privacy-subtitle">
            Cam kết minh bạch về cách thức DANAVA Solutions tiếp nhận dữ liệu qua Form liên hệ, hệ thống đo lường truy cập nội bộ và cơ chế bảo vệ quyền riêng tư của khách truy cập.
          </p>
          <div className="privacy-version-tag">
            <span>Phiên bản đối chiếu kỹ thuật: <strong>Tháng 11/2026</strong></span>
            <span className="bullet">·</span>
            <span>Hiệu lực: Hoạt động thực tế trên nền tảng website DANAVA</span>
          </div>
        </div>
      </section>

      {/* 2. KHUNG TÓM TẮT CỐT LÕI (EXECUTIVE SUMMARY) */}
      <section className="section privacy-summary-section" aria-label="Tóm tắt nguyên tắc quyền riêng tư">
        <div className="privacy-summary-grid">
          <div className="summary-card">
            <span className="summary-icon" aria-hidden="true">🛡️</span>
            <h3>Không bán dữ liệu</h3>
            <p>100% dữ liệu liên hệ và yêu cầu tư vấn được lưu trữ nội bộ, tuyệt đối không chia sẻ cho bên thứ ba vì mục đích thương mại.</p>
          </div>
          <div className="summary-card">
            <span className="summary-icon" aria-hidden="true">🔒</span>
            <h3>Ẩn danh đo lường</h3>
            <p>Hệ thống analytics tự phát triển mã hóa SHA-256 một chiều, không thu thập địa chỉ IP, không theo dõi liên trang (cross-site).</p>
          </div>
          <div className="summary-card">
            <span className="summary-icon" aria-hidden="true">⚡</span>
            <h3>Tải nhúng tương tác</h3>
            <p>Nội dung video YouTube hay mạng xã hội chỉ kết nối khi bạn chủ động click xem, ngăn chặn cookies bên thứ ba theo dõi ngầm.</p>
          </div>
          <div className="summary-card">
            <span className="summary-icon" aria-hidden="true">⚖️</span>
            <h3>Quyền kiểm soát của bạn</h3>
            <p>Bạn có toàn quyền yêu cầu kiểm tra, trích xuất hoặc xóa vĩnh viễn thông tin liên hệ đã gửi bất kỳ lúc nào.</p>
          </div>
        </div>
      </section>

      {/* 3. BỐ CỤC CHÍNH: MỤC LỤC & NỘI DUNG CHI TIẾT */}
      <section className="privacy-content-section">
        <div className="privacy-layout-container">
          {/* MỤC LỤC TRUY CẬP NHANH */}
          <aside className="privacy-toc-sidebar" aria-label="Mục lục chính sách riêng tư">
            <div className="toc-sticky-box">
              <span className="toc-sidebar-heading">MỤC LỤC NỘI DUNG</span>
              <nav className="toc-nav-list">
                <a href="#pham-vi" className="toc-nav-link">1. Phạm vi áp dụng &amp; Nguyên tắc chung</a>
                <a href="#form-lien-he" className="toc-nav-link">2. Dữ liệu tiếp nhận qua Form liên hệ</a>
                <a href="#analytics" className="toc-nav-link">3. Đo lường truy cập nội bộ (Analytics)</a>
                <a href="#embeds" className="toc-nav-link">4. Nội dung nhúng bên thứ ba (Embeds)</a>
                <a href="#luu-tru-bao-mat" className="toc-nav-link">5. Thời gian lưu trữ &amp; Biện pháp bảo mật</a>
                <a href="#quyen-khach-hang" className="toc-nav-link">6. Quyền của khách hàng đối với dữ liệu</a>
                <a href="#xac-nhan-chu-website" className="toc-nav-link highlight-toc">7. Điều khoản cần xác nhận trước khi xuất bản</a>
                <a href="#thong-tin-lien-he" className="toc-nav-link">8. Thông tin đơn vị chịu trách nhiệm</a>
              </nav>
            </div>
          </aside>

          {/* CỘT NỘI DUNG BÀI VIẾT */}
          <article className="privacy-body-column">
            {/* MỤC 1 */}
            <div id="pham-vi" className="privacy-block">
              <h2>1. Phạm vi áp dụng &amp; Nguyên tắc chung</h2>
              <p>
                Chính sách này áp dụng cho toàn bộ khách truy cập, đối tác và khách hàng sử dụng website chính thức của <strong>DANAVA Solutions</strong> tại tên miền <code>danava.com.vn</code> (và các chuyển hướng liên quan).
              </p>
              <p>
                Chúng tôi tôn trọng quyền riêng tư của mọi cá nhân và tổ chức. Các hoạt động thu thập và xử lý dữ liệu được thiết kế bám sát thực tế vận hành kỹ thuật của website, tuân thủ các quy định hiện hành của pháp luật Việt Nam (bao gồm Luật An toàn thông tin mạng và Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân).
              </p>
            </div>

            {/* MỤC 2 */}
            <div id="form-lien-he" className="privacy-block">
              <h2>2. Dữ liệu tiếp nhận qua Form liên hệ &amp; Tiếp nhận Lead</h2>
              <p>
                Khi bạn chủ động gửi yêu cầu tư vấn thông qua trang <Link href="/lien-he/">Liên hệ</Link> hoặc các nút nhận tư vấn giải pháp trên website, hệ thống sẽ tiếp nhận các trường thông tin sau:
              </p>
              <ul className="privacy-bullet-list">
                <li><strong>Họ và tên:</strong> Nhận diện người đại diện để tiện xưng hô trong quá trình trao đổi.</li>
                <li><strong>Số điện thoại liên hệ:</strong> Kênh liên lạc chính để chuyên viên tư vấn gọi điện khảo sát nhu cầu và phản hồi giải pháp.</li>
                <li><strong>Địa chỉ Email:</strong> (Tùy chọn) Dùng để gửi hồ sơ năng lực, tài liệu demo và đề xuất báo giá chi tiết.</li>
                <li><strong>Loại hình kinh doanh:</strong> (Gym, Yoga, Pilates, Spa, Khách sạn, v.v.) Giúp chuyên viên chuẩn bị đúng tài liệu nghiệp vụ phù hợp.</li>
                <li><strong>Dịch vụ quan tâm:</strong> Ghi nhận giải pháp bạn đang tìm hiểu (DANAVA Studio, Website, Marketing, Sự kiện, Media).</li>
                <li><strong>Nội dung trao đổi:</strong> Mô tả hiện trạng, quy mô hoặc bài toán bạn đang cần giải quyết.</li>
                <li><strong>Trang nguồn tiếp nhận (Referrer):</strong> Ghi nhận trang web bạn đang xem trước khi bấm liên hệ nhằm hiểu rõ ngữ cảnh của yêu cầu.</li>
              </ul>
              <div className="privacy-note-callout">
                <span className="callout-icon" aria-hidden="true">ℹ️</span>
                <p>
                  <strong>Chống spam &amp; Chống gửi lặp:</strong> Biểu mẫu được tích hợp trường bẫy Honeypot tự động lọc bot crawler và cơ chế giới hạn tần suất gửi trong 45 giây để ngăn chặn tấn công từ chối dịch vụ.
                </p>
              </div>
            </div>

            {/* MỤC 3 */}
            <div id="analytics" className="privacy-block">
              <h2>3. Đo lường truy cập nội bộ (Privacy-First Analytics)</h2>
              <p>
                Website DANAVA Solutions sử dụng hệ sinh thái đo lường truy cập tự phát triển, lưu trữ trực tiếp trên máy chủ nội bộ với tiêu chí bảo vệ quyền riêng tư ở mức cao nhất:
              </p>
              <ul className="privacy-bullet-list">
                <li><strong>Mã hóa danh tính một chiều (SHA-256):</strong> Mã phiên (`session`) và mã thiết bị (`visitor`) được băm bằng thuật toán SHA-256 ngay khi tiếp nhận, hoàn toàn không thể dịch ngược để truy vết người dùng thực tế.</li>
                <li><strong>Không lưu địa chỉ IP:</strong> Hệ thống không lưu trữ địa chỉ IP đầy đủ của bạn trong cơ sở dữ liệu.</li>
                <li><strong>Rút gọn nguồn truy cập:</strong> URL nguồn được lược bỏ toàn bộ tham số truy vấn (query parameters) cá nhân, chỉ lưu lại tên miền cấp cao nhất (ví dụ: <code>google.com</code>, <code>facebook.com</code>).</li>
                <li><strong>Không sử dụng Cookies bên thứ ba:</strong> Website không cài đặt mã theo dõi của Google Analytics, Meta Pixel hay các mạng lưới quảng cáo liên kết.</li>
                <li><strong>Tôn trọng Do Not Track (DNT):</strong> Nếu trình duyệt của bạn kích hoạt tín hiệu DNT, hệ thống sẽ tự động vô hiệu hóa việc ghi nhận phiên tương tác.</li>
              </ul>
            </div>

            {/* MỤC 4 */}
            <div id="embeds" className="privacy-block">
              <h2>4. Cơ chế Xử lý Nội dung Nhúng Bên thứ ba (Embeds)</h2>
              <p>
                Trên trang <Link href="/kien-thuc/">Bản tin DANAVA</Link>, chúng tôi có thể dẫn nguồn hoặc cung cấp tính năng xem trực tiếp video sự kiện và bài đăng từ YouTube, Facebook hoặc Zalo OA:
              </p>
              <ul className="privacy-bullet-list">
                <li><strong>Nguyên tắc Click-to-Load (Tải khi tương tác):</strong> Mặc định, website KHÔNG tự động tải các đoạn mã iframe bên thứ ba khi tải trang. Việc này giúp trang web tải siêu nhanh và ngăn chặn các nền tảng bên ngoài đặt cookies theo dõi ngầm.</li>
                <li><strong>Chế độ YouTube No-Cookie:</strong> Khi bạn chủ động nhấn <em>"Xem bản nhúng tương tác"</em>, video sẽ được kết nối qua tên miền bảo mật <code>youtube-nocookie.com</code>.</li>
                <li><strong>Luôn có liên kết gốc:</strong> Mỗi bài đăng mạng xã hội luôn đi kèm đường link chính thức để bạn có thể mở xem trực tiếp trên nền tảng nguồn.</li>
              </ul>
            </div>

            {/* MỤC 5 */}
            <div id="luu-tru-bao-mat" className="privacy-block">
              <h2>5. Thời gian lưu trữ &amp; Biện pháp bảo mật dữ liệu</h2>
              <p>
                Bảng đối chiếu kỹ thuật về lưu trữ dữ liệu tại hệ thống DANAVA Solutions:
              </p>

              <div className="privacy-table-wrap">
                <table className="privacy-data-table">
                  <thead>
                    <tr>
                      <th>Loại dữ liệu</th>
                      <th>Cơ chế lưu trữ</th>
                      <th>Thời gian lưu trữ</th>
                      <th>Phân quyền truy cập</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Dữ liệu liên hệ (Leads)</strong></td>
                      <td>Cơ sở dữ liệu SQLite máy chủ, phân vùng độc lập</td>
                      <td>Lưu trữ theo chu kỳ chăm sóc khách hàng (hoặc xóa theo yêu cầu)</td>
                      <td>Chỉ Quản trị viên đã đăng nhập phiên xác thực bảo mật</td>
                    </tr>
                    <tr>
                      <td><strong>Nhật ký đo lường (Visits)</strong></td>
                      <td>Mã băm SHA-256 ẩn danh, không có địa chỉ IP</td>
                      <td><strong>Tối đa 90 ngày</strong> (Hệ thống tự động dọn dẹp hàng ngày)</td>
                      <td>Báo cáo thống kê nội bộ tổng hợp</td>
                    </tr>
                    <tr>
                      <td><strong>Phiên quản trị (Sessions)</strong></td>
                      <td>Session token &amp; CSRF protection</td>
                      <td>Hết hạn tự động sau mỗi phiên làm việc</td>
                      <td>Quản trị viên DANAVA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* MỤC 6 */}
            <div id="quyen-khach-hang" className="privacy-block">
              <h2>6. Quyền của khách hàng đối với dữ liệu cá nhân</h2>
              <p>
                Căn cứ theo quy định pháp luật về bảo vệ dữ liệu cá nhân, bạn có toàn quyền thực thi các quyền sau:
              </p>
              <div className="rights-grid">
                <div className="right-item">
                  <span className="right-num">01</span>
                  <h4>Quyền được biết</h4>
                  <p>Biết rõ mục đích, phạm vi và cách thức dữ liệu của mình được xử lý.</p>
                </div>
                <div className="right-item">
                  <span className="right-num">02</span>
                  <h4>Quyền truy cập &amp; Chỉnh sửa</h4>
                  <p>Yêu cầu kiểm tra lại hoặc đính chính thông tin liên hệ đã cung cấp.</p>
                </div>
                <div className="right-item">
                  <span className="right-num">03</span>
                  <h4>Quyền yêu cầu xóa bỏ</h4>
                  <p>Yêu cầu xóa toàn bộ thông tin số điện thoại, email và nội dung liên hệ khỏi cơ sở dữ liệu.</p>
                </div>
                <div className="right-item">
                  <span className="right-num">04</span>
                  <h4>Quyền rút lại sự đồng ý</h4>
                  <p>Từ chối nhận các cuộc gọi tư vấn tiếp theo từ đội ngũ DANAVA bất kỳ lúc nào.</p>
                </div>
              </div>
            </div>

            {/* MỤC 7: ĐÁNH DẤU PHẦN CẦN CHỦ WEBSITE XÁC NHẬN */}
            <div id="xac-nhan-chu-website" className="privacy-block review-flagged-block">
              <div className="review-banner-header">
                <span className="review-badge-flag">⚠️ CẦN CHỦ WEBSITE XÁC NHẬN TRƯỚC KHI XUẤT BẢN CHÍNH THỨC</span>
                <h2>7. Các điều khoản nội bộ chờ chủ doanh nghiệp xác nhận</h2>
              </div>
              <p className="review-lead-text">
                Để đảm bảo tính chuẩn xác tuyệt đối về mặt pháp lý và cam kết dịch vụ của DANAVA Solutions, các điều khoản dưới đây đã được dự thảo dựa trên hoạt động kỹ thuật thực tế và <strong>cần được Ban Giám đốc phê duyệt chính thức:</strong>
              </p>

              <div className="review-item-card">
                <span className="review-tag">XÁC NHẬN 01 · THỜI HẠN LƯU TRỮ LEADS</span>
                <h4>Thời gian lưu trữ dữ liệu liên hệ khách hàng trong cơ sở dữ liệu</h4>
                <p>
                  <strong>Nội dung đề xuất:</strong> Dữ liệu từ form liên hệ (họ tên, điện thoại, email, bài toán) được lưu trữ tối đa <strong>24 tháng</strong> kể từ lần tương tác cuối cùng để phục vụ việc chăm sóc và bảo hành giải pháp, hoặc sẽ được xóa ngay khi khách hàng gửi email yêu cầu hủy lưu trữ.
                </p>
                <div className="review-status-indicator">
                  <span>Trạng thái: <em>Đang chờ chủ website ký duyệt thời hạn</em></span>
                </div>
              </div>

              <div className="review-item-card">
                <span className="review-tag">XÁC NHẬN 02 · ĐẦU MỐI BẢO VỆ DỮ LIỆU (DPO)</span>
                <h4>Chỉ định nhân sự đầu mối tiếp nhận khiếu nại quyền riêng tư</h4>
                <p>
                  <strong>Nội dung đề xuất:</strong> Đại diện pháp lý tiếp nhận và xử lý yêu cầu quyền riêng tư là <strong>Ông Lê Tấn Thành (Founder &amp; CEO)</strong>. Thời gian phản hồi và hoàn tất việc xóa dữ liệu cá nhân theo yêu cầu là trong vòng <strong>72 giờ làm việc</strong>.
                </p>
                <div className="review-status-indicator">
                  <span>Trạng thái: <em>Đang chờ chủ website phê duyệt quy trình tiếp nhận</em></span>
                </div>
              </div>

              <div className="review-item-card">
                <span className="review-tag">XÁC NHẬN 03 · CHÍNH SÁCH MÃ THEO DÕI BÊN THỨ BA</span>
                <h4>Cam kết không tích hợp công cụ theo dõi tiếp thị liên kết</h4>
                <p>
                  <strong>Nội dung đề xuất:</strong> Website cam kết duy trì mô hình đo lường nội bộ tự phát triển, không cài đặt Google Tag Manager hay Meta Pixel theo dõi người dùng nếu chưa có Consent Banner (biểu ngữ xin phép cookie) đạt chuẩn.
                </p>
                <div className="review-status-indicator">
                  <span>Trạng thái: <em>Đang chờ chủ website xác nhận định hướng truyền thông</em></span>
                </div>
              </div>
            </div>

            {/* MỤC 8 */}
            <div id="thong-tin-lien-he" className="privacy-block">
              <h2>8. Thông tin đơn vị chịu trách nhiệm &amp; Cách thức liên hệ</h2>
              <p>
                Nếu bạn có bất kỳ thắc mắc, phản ánh hoặc muốn thực hiện quyền yêu cầu xóa bỏ/chỉnh sửa thông tin cá nhân, vui lòng liên hệ trực tiếp với chúng tôi:
              </p>

              <div className="privacy-contact-card">
                <h3>CÔNG TY TNHH DANAVA SOLUTIONS</h3>
                <div className="contact-meta-lines">
                  <p><strong>Người đại diện:</strong> Ông Lê Tấn Thành — Founder &amp; CEO</p>
                  <p><strong>Địa chỉ:</strong> 08 Đặng Vũ Hỷ, Phường An Hải, Quận Sơn Trà, TP. Đà Nẵng</p>
                  <p><strong>Hotline:</strong> <a href="tel:0935917677">0935 91 76 77</a></p>
                  <p><strong>Email chuyên trách:</strong> <a href="mailto:hello@danava.vn">hello@danava.vn</a> (hoặc <code>danavadigital@gmail.com</code>)</p>
                </div>
                <div className="privacy-action-links">
                  <Link href="/lien-he/" className="button amber">
                    Gửi yêu cầu trực tuyến tới DANAVA ↗
                  </Link>
                  <Link href="/" className="button secondary">
                    Quay về Trang chủ ↗
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

export default PrivacyPolicy;
