import Link from 'next/link';
import { ShieldCheck, Lock, PlayCircle, Scale, Info, AlertTriangle, Phone, Mail, MapPin } from 'lucide-react';
import { PageHead, IconTile } from './site/ui';

const SUMMARY = [
  { icon: ShieldCheck, title: 'Không bán dữ liệu', text: 'Dữ liệu liên hệ và yêu cầu tư vấn được lưu trữ nội bộ, không chia sẻ cho bên thứ ba vì mục đích thương mại.' },
  { icon: Lock, title: 'Đo lường ẩn danh', text: 'Hệ thống đo lường tự phát triển mã hóa SHA-256 một chiều, không thu thập địa chỉ IP, không theo dõi liên trang.' },
  { icon: PlayCircle, title: 'Nội dung nhúng khi bạn chọn', text: 'Video YouTube hay bài đăng mạng xã hội chỉ kết nối khi bạn chủ động bấm xem, tránh cookie theo dõi ngầm.' },
  { icon: Scale, title: 'Quyền kiểm soát của bạn', text: 'Bạn có thể yêu cầu kiểm tra, trích xuất hoặc xóa vĩnh viễn thông tin liên hệ đã gửi bất kỳ lúc nào.' }
];

export function PrivacyPolicy() {
  return (
    <main id="main">
      <PageHead
        soft
        crumbs={[{ href: '/', label: 'Trang chủ' }, { label: 'Chính sách riêng tư' }]}
        eyebrow="DANAVA SOLUTIONS · Minh bạch & trách nhiệm"
        title="Chính sách quyền riêng tư"
        lead="Cách DANAVA Solutions tiếp nhận dữ liệu qua form liên hệ, đo lường truy cập nội bộ và bảo vệ quyền riêng tư của khách truy cập."
      >
        <span className="s-badge s-badge--neutral">Phiên bản đối chiếu kỹ thuật: Tháng 11/2026</span>
        <span className="s-badge s-badge--neutral">Đang áp dụng trên website DANAVA</span>
      </PageHead>

      <section className="s-section s-section--tight" aria-label="Tóm tắt nguyên tắc quyền riêng tư">
        <div className="s-container">
          <div className="s-grid s-grid--4">
            {SUMMARY.map(item => (
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
            <aside className="s-policy-toc" aria-label="Mục lục chính sách riêng tư">
              <p className="s-policy-toc__title">Mục lục</p>
              <nav>
                <a href="#pham-vi">1. Phạm vi áp dụng</a>
                <a href="#form-lien-he">2. Dữ liệu qua form liên hệ</a>
                <a href="#analytics">3. Đo lường truy cập nội bộ</a>
                <a href="#embeds">4. Nội dung nhúng bên thứ ba</a>
                <a href="#luu-tru-bao-mat">5. Lưu trữ &amp; bảo mật</a>
                <a href="#quyen-khach-hang">6. Quyền của khách hàng</a>
                <a href="#xac-nhan-chu-website" className="is-flag">7. Điều khoản chờ xác nhận</a>
                <a href="#thong-tin-lien-he">8. Đơn vị chịu trách nhiệm</a>
              </nav>
            </aside>

            <article className="s-prose s-policy-body">
              <section id="pham-vi">
                <h2>1. Phạm vi áp dụng &amp; nguyên tắc chung</h2>
                <p>
                  Chính sách này áp dụng cho toàn bộ khách truy cập, đối tác và khách hàng sử dụng website chính thức của <strong>DANAVA Solutions</strong> tại tên miền <code>danava.com.vn</code> (và các chuyển hướng liên quan).
                </p>
                <p>
                  Chúng tôi tôn trọng quyền riêng tư của mọi cá nhân và tổ chức. Các hoạt động thu thập và xử lý dữ liệu được thiết kế bám sát thực tế vận hành kỹ thuật của website, tuân thủ quy định hiện hành của pháp luật Việt Nam (bao gồm Luật An toàn thông tin mạng và Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân).
                </p>
              </section>

              <section id="form-lien-he">
                <h2>2. Dữ liệu tiếp nhận qua form liên hệ</h2>
                <p>
                  Khi bạn chủ động gửi yêu cầu tư vấn qua trang <Link href="/lien-he/">Liên hệ</Link> hoặc các nút nhận tư vấn trên website, hệ thống tiếp nhận các thông tin sau:
                </p>
                <ul>
                  <li><strong>Họ và tên:</strong> để xưng hô trong quá trình trao đổi.</li>
                  <li><strong>Số điện thoại:</strong> kênh liên lạc chính để chuyên viên khảo sát nhu cầu và phản hồi giải pháp.</li>
                  <li><strong>Email</strong> (tùy chọn): để gửi hồ sơ năng lực, tài liệu demo và đề xuất báo giá.</li>
                  <li><strong>Loại hình kinh doanh</strong> (Gym, Yoga, Pilates, Spa, Khách sạn…): giúp chuẩn bị đúng tài liệu nghiệp vụ.</li>
                  <li><strong>Dịch vụ quan tâm:</strong> giải pháp bạn đang tìm hiểu (DANAVA Studio, Website, Marketing, Sự kiện, Media).</li>
                  <li><strong>Nội dung trao đổi:</strong> hiện trạng, quy mô hoặc bài toán bạn cần giải quyết.</li>
                  <li><strong>Trang nguồn (Referrer):</strong> trang bạn đang xem trước khi bấm liên hệ, để hiểu ngữ cảnh yêu cầu.</li>
                </ul>
                <div className="s-policy-note">
                  <Info aria-hidden="true" />
                  <p>
                    <strong>Chống spam &amp; gửi lặp:</strong> Biểu mẫu tích hợp trường bẫy Honeypot để lọc bot tự động và giới hạn tần suất gửi trong 45 giây để ngăn gửi lặp liên tục.
                  </p>
                </div>
              </section>

              <section id="analytics">
                <h2>3. Đo lường truy cập nội bộ</h2>
                <p>
                  Website sử dụng hệ thống đo lường truy cập tự phát triển, lưu trực tiếp trên máy chủ nội bộ với tiêu chí bảo vệ quyền riêng tư cao nhất:
                </p>
                <ul>
                  <li><strong>Mã hóa danh tính một chiều (SHA-256):</strong> mã phiên và mã thiết bị được băm SHA-256 ngay khi tiếp nhận, không thể dịch ngược để truy vết người dùng.</li>
                  <li><strong>Không lưu địa chỉ IP:</strong> hệ thống không lưu địa chỉ IP đầy đủ của bạn trong cơ sở dữ liệu.</li>
                  <li><strong>Rút gọn nguồn truy cập:</strong> URL nguồn được lược bỏ tham số truy vấn, chỉ giữ tên miền (ví dụ <code>google.com</code>, <code>facebook.com</code>).</li>
                  <li><strong>Không dùng cookie bên thứ ba:</strong> website không cài mã theo dõi Google Analytics, Meta Pixel hay mạng quảng cáo liên kết.</li>
                  <li><strong>Tôn trọng Do Not Track:</strong> nếu trình duyệt bật tín hiệu DNT, hệ thống tự động ngừng ghi nhận phiên.</li>
                </ul>
              </section>

              <section id="embeds">
                <h2>4. Nội dung nhúng bên thứ ba</h2>
                <p>
                  Trên trang <Link href="/kien-thuc/">Bản tin DANAVA</Link>, chúng tôi có thể dẫn nguồn hoặc cho phép xem trực tiếp video, bài đăng từ YouTube, Facebook hoặc Zalo OA:
                </p>
                <ul>
                  <li><strong>Tải khi tương tác (click-to-load):</strong> mặc định website không tự tải iframe bên thứ ba, giúp trang nhanh hơn và tránh cookie theo dõi ngầm.</li>
                  <li><strong>Chế độ YouTube No-Cookie:</strong> khi bạn chủ động bấm xem, video được kết nối qua tên miền <code>youtube-nocookie.com</code>.</li>
                  <li><strong>Luôn có liên kết gốc:</strong> mỗi bài đăng mạng xã hội đều kèm đường dẫn chính thức để mở trên nền tảng nguồn.</li>
                </ul>
              </section>

              <section id="luu-tru-bao-mat">
                <h2>5. Thời gian lưu trữ &amp; biện pháp bảo mật</h2>
                <div className="s-policy-table-wrap">
                  <table className="s-policy-table">
                    <thead>
                      <tr>
                        <th scope="col">Loại dữ liệu</th>
                        <th scope="col">Cơ chế lưu trữ</th>
                        <th scope="col">Thời gian lưu trữ</th>
                        <th scope="col">Phân quyền truy cập</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td data-label="Loại dữ liệu"><strong>Dữ liệu liên hệ (Leads)</strong></td>
                        <td data-label="Cơ chế lưu trữ">Cơ sở dữ liệu SQLite trên máy chủ, phân vùng độc lập</td>
                        <td data-label="Thời gian lưu trữ">Theo chu kỳ chăm sóc khách hàng (hoặc xóa theo yêu cầu)</td>
                        <td data-label="Phân quyền truy cập">Chỉ quản trị viên đã đăng nhập phiên xác thực</td>
                      </tr>
                      <tr>
                        <td data-label="Loại dữ liệu"><strong>Nhật ký đo lường (Visits)</strong></td>
                        <td data-label="Cơ chế lưu trữ">Mã băm SHA-256 ẩn danh, không có địa chỉ IP</td>
                        <td data-label="Thời gian lưu trữ"><strong>Tối đa 90 ngày</strong> (tự động dọn dẹp hằng ngày)</td>
                        <td data-label="Phân quyền truy cập">Báo cáo thống kê nội bộ tổng hợp</td>
                      </tr>
                      <tr>
                        <td data-label="Loại dữ liệu"><strong>Phiên quản trị (Sessions)</strong></td>
                        <td data-label="Cơ chế lưu trữ">Session token &amp; bảo vệ CSRF</td>
                        <td data-label="Thời gian lưu trữ">Hết hạn tự động sau mỗi phiên làm việc</td>
                        <td data-label="Phân quyền truy cập">Quản trị viên DANAVA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="quyen-khach-hang">
                <h2>6. Quyền của khách hàng đối với dữ liệu cá nhân</h2>
                <p>Theo quy định pháp luật về bảo vệ dữ liệu cá nhân, bạn có các quyền sau:</p>
                <div className="s-policy-rights">
                  {[
                    ['Quyền được biết', 'Biết rõ mục đích, phạm vi và cách thức dữ liệu của mình được xử lý.'],
                    ['Quyền truy cập & chỉnh sửa', 'Yêu cầu kiểm tra lại hoặc đính chính thông tin liên hệ đã cung cấp.'],
                    ['Quyền yêu cầu xóa', 'Yêu cầu xóa toàn bộ số điện thoại, email và nội dung liên hệ khỏi cơ sở dữ liệu.'],
                    ['Quyền rút lại đồng ý', 'Từ chối nhận các cuộc gọi tư vấn tiếp theo từ DANAVA bất kỳ lúc nào.']
                  ].map(([title, text], i) => (
                    <div key={title} className="s-policy-right">
                      <span className="s-policy-right__num">0{i + 1}</span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="xac-nhan-chu-website" className="s-policy-flag">
                <p className="s-policy-flag__badge"><AlertTriangle aria-hidden="true" /> CẦN CHỦ WEBSITE XÁC NHẬN TRƯỚC KHI XUẤT BẢN CHÍNH THỨC</p>
                <h2>7. Các điều khoản nội bộ chờ chủ doanh nghiệp xác nhận</h2>
                <p>
                  Các điều khoản dưới đây được dự thảo dựa trên hoạt động kỹ thuật thực tế và <strong>cần Ban Giám đốc phê duyệt chính thức</strong>.
                </p>
                <div className="s-policy-flag__item">
                  <span className="s-policy-flag__tag">XÁC NHẬN 01 · Thời hạn lưu trữ leads</span>
                  <h3>Thời gian lưu trữ dữ liệu liên hệ khách hàng</h3>
                  <p>
                    <strong>Đề xuất:</strong> Dữ liệu từ form liên hệ (họ tên, điện thoại, email, bài toán) được lưu tối đa <strong>24 tháng</strong> kể từ lần tương tác cuối cùng để phục vụ chăm sóc và bảo hành, hoặc được xóa ngay khi khách hàng gửi email yêu cầu.
                  </p>
                  <p className="s-policy-flag__status">Trạng thái: đang chờ chủ website duyệt thời hạn</p>
                </div>
                <div className="s-policy-flag__item">
                  <span className="s-policy-flag__tag">XÁC NHẬN 02 · Đầu mối bảo vệ dữ liệu (DPO)</span>
                  <h3>Nhân sự đầu mối tiếp nhận khiếu nại quyền riêng tư</h3>
                  <p>
                    <strong>Đề xuất:</strong> Đại diện tiếp nhận và xử lý yêu cầu quyền riêng tư là <strong>Ông Lê Tấn Thành (Founder &amp; CEO)</strong>. Thời gian phản hồi và hoàn tất xóa dữ liệu cá nhân theo yêu cầu là trong vòng <strong>72 giờ làm việc</strong>.
                  </p>
                  <p className="s-policy-flag__status">Trạng thái: đang chờ chủ website duyệt quy trình tiếp nhận</p>
                </div>
                <div className="s-policy-flag__item">
                  <span className="s-policy-flag__tag">XÁC NHẬN 03 · Mã theo dõi bên thứ ba</span>
                  <h3>Cam kết không tích hợp công cụ theo dõi tiếp thị</h3>
                  <p>
                    <strong>Đề xuất:</strong> Website duy trì mô hình đo lường nội bộ, không cài Google Tag Manager hay Meta Pixel khi chưa có biểu ngữ xin phép cookie đạt chuẩn.
                  </p>
                  <p className="s-policy-flag__status">Trạng thái: đang chờ chủ website xác nhận định hướng truyền thông</p>
                </div>
              </section>

              <section id="thong-tin-lien-he">
                <h2>8. Đơn vị chịu trách nhiệm &amp; cách thức liên hệ</h2>
                <p>
                  Nếu bạn có thắc mắc hoặc muốn yêu cầu xóa, chỉnh sửa thông tin cá nhân, vui lòng liên hệ:
                </p>
                <div className="s-policy-issuer">
                  <h3>CÔNG TY TNHH DANAVA SOLUTIONS</h3>
                  <p>Người đại diện: Ông Lê Tấn Thành — Founder &amp; CEO</p>
                  <ul className="s-policy-issuer__list">
                    <li><MapPin aria-hidden="true" />08 Đặng Vũ Hỷ, Phường An Hải, Quận Sơn Trà, TP. Đà Nẵng</li>
                    <li><Phone aria-hidden="true" /><a href="tel:0935917677">0935 91 76 77</a></li>
                    <li><Mail aria-hidden="true" /><span><a href="mailto:hello@danava.vn">hello@danava.vn</a> (hoặc danavadigital@gmail.com)</span></li>
                  </ul>
                  <div className="s-row">
                    <Link href="/lien-he/" className="s-btn s-btn--primary">Gửi yêu cầu trực tuyến</Link>
                    <Link href="/chinh-sach-dich-vu/" className="s-btn s-btn--secondary">Chính sách dịch vụ</Link>
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

export default PrivacyPolicy;
