'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useSite } from './SiteStore';
import { personPhoto, servicePhotos, postPhotos, activityPhotos } from '@/lib/media';
import { archivedPosts } from '@/lib/archived-posts';
import { type Service, type Project, type Person } from '@/lib/content';
import { NewsletterPage } from './Newsletter';
import { ArticleTemplate } from './ArticleTemplate';
import { ContactTwoColumnPage } from './ContactPage';
import { getStaffDetail, getStaffInitials, STAFF_DEPARTMENTS, type StaffDeptId, type StaffFullProfile } from '@/lib/staff';

export function PageHero({
  kicker,
  title,
  description,
  image = '/assets/legacy/travel.webp'
}: {
  kicker: string;
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-image" style={{ backgroundImage: `url("${image}")` }} />
      <nav aria-label="Breadcrumb" className="page-breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className="breadcrumb-separator" aria-hidden="true"> / </span>
        <span className="breadcrumb-current" aria-current="page">{kicker}</span>
      </nav>
      <p className="eyebrow">DANAVA SOLUTIONS / {kicker}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <a className="page-index" href="#page-content">
        KHÁM PHÁ NỘI DUNG <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}

export function PageAnchor() {
  return <div id="page-content" />;
}

export function Principles() {
  return (
    <section className="section principles">
      <p className="eyebrow">TINH THẦN DANAVA</p>
      <h2>Đi cùng nhau.<br /><em>Tạo nên giá trị.</em></h2>
      <div>
        {[
          { title: 'Lắng nghe trước tiên', text: 'Bắt đầu từ nhu cầu và bối cảnh riêng của mỗi doanh nghiệp.' },
          { title: 'Kết nối các giải pháp', text: 'Đặt công nghệ, truyền thông và trải nghiệm trong cùng một hành trình.' },
          { title: 'Con người là trọng tâm', text: 'Xây dựng mối quan hệ qua sự chia sẻ, kết nối và đồng hành bền vững.' }
        ].map((x, i) => (
          <article key={x.title}>
            <span>0{i + 1}</span>
            <h3>{x.title}</h3>
            <p>{x.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ServiceFAQ() {
  return (
    <section className="section faq-section">
      <div>
        <p className="eyebrow">TRƯỚC KHI BẮT ĐẦU</p>
        <h2>Điều bạn<br /><em>muốn biết.</em></h2>
      </div>
      <div>
        {[
          {
            q: 'Tôi nên bắt đầu từ giải pháp nào?',
            a: 'Hãy chia sẻ mục tiêu, hiện trạng và nhu cầu của bạn với DANAVA. Hai bên sẽ trao đổi để xác định phạm vi phù hợp trước khi triển khai.'
          },
          {
            q: 'Tôi cần chuẩn bị những thông tin gì?',
            a: 'Bạn có thể chuẩn bị thông tin doanh nghiệp, nhận diện thương hiệu, nội dung hiện có, thời gian dự kiến và ngân sách mong muốn.'
          },
          {
            q: 'Chi phí và tiến độ được xác định như thế nào?',
            a: 'Chi phí và tiến độ phụ thuộc vào phạm vi công việc. Các hạng mục cần được trao đổi và thống nhất trong đề xuất riêng.'
          }
        ].map(x => (
          <details key={x.q}>
            <summary>{x.q}<span aria-hidden="true">+</span></summary>
            <p>{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ServiceCards() {
  const { data } = useSite();
  return (
    <div className="solution-grid">
      {data.services.map((s, i) => (
        <Link href={`/giai-phap/${s.slug}/`} key={s.id} className="solution-card">
          <span className="card-number">0{i + 1} ↗</span>
          <div className={`service-art art-${i}`}>
            <img src={servicePhotos[s.id]} alt={s.title} loading="lazy" />
          </div>
          <h3>{s.title}</h3>
          <p>{s.description}</p>
          <span className="card-link">Khám phá giải pháp ↗</span>
        </Link>
      ))}
    </div>
  );
}

export function Team() {
  const { data } = useSite();
  return (
    <div className="team-list">
      {data.staff.filter(p => p.visible).map(p => (
        <article className="team-person" key={p.id}>
          <div className={`team-initials ${personPhoto(p) ? 'with-photo' : ''}`} aria-label={`Ảnh ${p.name}`}>
            {personPhoto(p) ? (
              <img src={personPhoto(p)} alt={p.name} loading="lazy" />
            ) : (
              p.name.split(' ').slice(-2).map(x => x[0]).join('')
            )}
          </div>
          <h3>{p.name}</h3>
          <p>{p.role}</p>
        </article>
      ))}
    </div>
  );
}

export function ContactCTA() {
  const { data } = useSite();
  return (
    <section className="contact-section">
      <p className="eyebrow">BẮT ĐẦU BẰNG MỘT CUỘC TRÒ CHUYỆN</p>
      <h2>Ý tưởng của bạn.<br /><em>Hành trình của chúng ta.</em></h2>
      <div className="contact-actions">
        <Link className="button amber" href="/lien-he/">Trao đổi với DANAVA ↗</Link>
        <a href={`tel:${data.phone}`}>{data.phone}</a>
      </div>
    </section>
  );
}

export function ServicesPage() {
  const { data } = useSite();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Lọc các dự án thực tế liên quan từ CMS để bảo đảm tính xác thực
  const hariverProject = data.projects?.find(p => (p.id === 'hariver-studio' || p.slug === 'hariver-gym-danava-studio' || p.slug === 'hariver-studio') && p.published);
  const hueProject = data.projects?.find(p => (p.id === 'hue-studio' || p.slug === 'hue-pilates-yoga-danava-studio' || p.slug === 'hue-studio') && p.published);

  // Xử lý gửi lead cho khách chưa xác định rõ nhu cầu
  async function submitUndecided(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');
    const form = e.currentTarget;
    const f = new FormData(form);
    const payload = {
      name: String(f.get('name') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      email: String(f.get('email') || '').trim(),
      service: `[Tư vấn định hướng] ${String(f.get('situation') || 'Chưa xác định nhu cầu')}`,
      message: String(f.get('message') || '').trim()
    };

    try {
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        setStatusMsg(resJson.message || 'Yêu cầu của bạn đã được tiếp nhận. Chuyên viên DANAVA sẽ liên hệ tư vấn giải pháp phù hợp.');
        form.reset();
        return;
      }
      throw new Error(resJson.error || 'Lỗi gửi yêu cầu.');
    } catch {
      const body = `Họ tên: ${payload.name}\nSố điện thoại: ${payload.phone}\nEmail: ${payload.email}\nHiện trạng: ${payload.service}\n\nNội dung cần trao đổi: ${payload.message}`;
      window.location.href = `mailto:${data.email}?subject=${encodeURIComponent('Yêu cầu tư vấn chọn giải pháp DANAVA')}&body=${encodeURIComponent(body)}`;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main" className="solutions-directory-page">
      {/* 1. HERO TRANG GIẢI PHÁP */}
      <PageHero
        kicker="GIẢI PHÁP THEO NHU CẦU"
        title="Chọn đúng hướng. Kết nối đúng giải pháp."
        description="Mỗi cơ sở Wellness và doanh nghiệp đều có một bài toán riêng. Khám phá giải pháp phù hợp nhất theo mục tiêu thực tế của bạn."
        image="/assets/legacy/website.webp"
      />
      <PageAnchor />

      {/* 2. BA LỐI VÀO MỞ ĐẦU THEO NHU CẦU */}
      <section className="section solution-pathways-section" aria-label="Ba lối vào chọn giải pháp theo nhu cầu">
        <div className="section-kicker">
          <span>01 / LỐI VÀO THEO MỤC TIÊU</span>
          <span>BẠN ĐANG TÌM KIẾM ĐIỀU GÌ?</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">ĐỊNH HƯỚNG NHANH</p>
            <h2>Bắt đầu từ<br /><em>bài toán cấp thiết nhất.</em></h2>
          </div>
          <p>Chọn lối vào phù hợp nhất với nhu cầu hiện tại để tìm hiểu chi tiết phạm vi giải pháp, đối tượng áp dụng và kết quả thực tế.</p>
        </div>

        <div className="solution-pathway-cards">
          <a href="#quan-ly-phong-tap" className="pathway-card pathway-primary">
            <span className="pathway-num">01</span>
            <span className="pathway-badge">TRỌNG TÂM CÔNG NGHỆ</span>
            <h3>Quản lý phòng tập</h3>
            <p>Kiểm soát hội viên, thẻ tập, lịch lớp và doanh thu tự động cho Gym, Yoga, Pilates &amp; Spa.</p>
            <span className="pathway-anchor">Xem giải pháp Studio ↓</span>
          </a>

          <a href="#xay-website" className="pathway-card">
            <span className="pathway-num">02</span>
            <span className="pathway-badge">KHÔNG GIAN SỐ</span>
            <h3>Xây website</h3>
            <p>Thiết lập hiện diện số chuẩn nhận diện, hiển thị đẹp trên di động và tối ưu chuyển đổi khách hàng.</p>
            <span className="pathway-anchor">Xem dịch vụ Website ↓</span>
          </a>

          <a href="#phat-trien-thuong-hieu" className="pathway-card">
            <span className="pathway-num">03</span>
            <span className="pathway-badge">TIẾP THỊ &amp; TĂNG TRƯỞNG</span>
            <h3>Phát triển thương hiệu</h3>
            <p>Truyền thông đa kênh, chăm sóc fanpage và sản xuất hình ảnh, video chuyên nghiệp để thu hút học viên mới.</p>
            <span className="pathway-anchor">Xem dịch vụ Truyền thông ↓</span>
          </a>
        </div>
      </section>

      {/* 3. BỐ CỤC 3 CARD GIẢI PHÁP (STUDIO CARD LỚN + 2 CARD GỌN) */}
      <section className="section solution-matrix-section" aria-label="Chi tiết giải pháp theo nhu cầu">
        <div className="section-kicker">
          <span>02 / HỆ THỐNG GIẢI PHÁP CHUYÊN SÂU</span>
          <span>ĐỐI TƯỢNG · VẤN ĐỀ · KẾT QUẢ THỰC TẾ</span>
        </div>

        {/* CARD LỚN: DANAVA STUDIO — QUẢN LÝ PHÒNG TẬP */}
        <article className="solution-hero-card" id="quan-ly-phong-tap">
          <div className="solution-hero-grid">
            <div className="solution-hero-content">
              <div className="solution-badge-row">
                <span className="badge-highlight">SẢN PHẨM TRỌNG TÂM · QUẢN LÝ PHÒNG TẬP</span>
                <span className="solution-code">NHU CẦU 01</span>
              </div>

              <h2>DANAVA Studio — Phần mềm quản trị Gym, Yoga, Pilates &amp; Spa</h2>
              <p className="solution-lead-desc">
                Giải pháp số hóa toàn diện quy trình vận hành trung tâm thể hình và chăm sóc sức khỏe, thay thế hoàn toàn sổ sách và bảng tính rời rạc bằng một nền tảng tập trung.
              </p>

              {/* Đối tượng */}
              <div className="solution-detail-block target-block">
                <h4><span className="icon">🎯</span> Đối tượng phù hợp:</h4>
                <p>Chủ phòng tập Gym, trung tâm Yoga, Studio Pilates, câu lạc bộ bơi lội và Wellness Spa đang cần kiểm soát vận hành tinh gọn, bảo mật và chính xác.</p>
              </div>

              {/* Vấn đề giải quyết */}
              <div className="solution-detail-block problem-block">
                <h4><span className="icon">⚠️</span> Vấn đề DANAVA Studio giải quyết:</h4>
                <ul className="solution-problem-list">
                  <li><strong>Thất thoát doanh thu &amp; quên hạn thẻ:</strong> Chấm dứt tình trạng quên nhắc gia hạn gói tập, nhầm lẫn trạng thái hội viên khi ghi chép thủ công.</li>
                  <li><strong>Chồng chéo lịch lớp &amp; quá tải:</strong> Tự động hóa lịch đặt chỗ theo sức chứa phòng, học viên chủ động check-in qua mã QR không cần xếp hàng.</li>
                  <li><strong>Tính hoa hồng HLV/PT phức tạp:</strong> Phân quyền huấn luyện viên rõ ràng, tự động tính số buổi dạy và chia sẻ doanh thu minh bạch.</li>
                  <li><strong>Thiếu số liệu đưa ra quyết định:</strong> Báo cáo doanh thu, công nợ, khung giờ đông khách trực quan theo thời gian thực.</li>
                </ul>
              </div>

              {/* Dự án thực tế liên quan */}
              <div className="solution-related-block">
                <span className="related-label">HỒ SƠ TRIỂN KHAI THỰC TẾ:</span>
                <div className="related-project-pills">
                  {hariverProject && (
                    <Link href={`/du-an/${hariverProject.slug}/`} className="related-pill">
                      <span>✓</span> <strong>{hariverProject.client || hariverProject.title}</strong> — Số hóa hồ sơ &amp; hạn thẻ ↗
                    </Link>
                  )}
                  {hueProject && (
                    <Link href={`/du-an/${hueProject.slug}/`} className="related-pill">
                      <span>✓</span> <strong>{hueProject.client || hueProject.title}</strong> — Quản lý lịch lớp &amp; check-in ↗
                    </Link>
                  )}
                </div>
              </div>

              {/* CTA Kép */}
              <div className="solution-cta-row">
                <Link className="button solution-cta-main" href="/giai-phap/danava-studio/">
                  Khám phá chi tiết DANAVA Studio <span>↗</span>
                </Link>
                <a className="button solution-cta-sub" href="#tu-van-chua-ro">
                  Yêu cầu bản demo vận hành ↓
                </a>
              </div>
            </div>

            {/* Ảnh sản phẩm thật với mockup và cyan glow */}
            <div className="solution-hero-media">
              <div className="media-cyan-glow" aria-hidden="true" />
              <div className="media-screen-frame">
                <div className="frame-header">
                  <span className="frame-dot" />
                  <span className="frame-dot" />
                  <span className="frame-dot" />
                  <span className="frame-title">DANAVA Studio · Bảng điều khiển quản trị</span>
                </div>
                <img
                  src="/assets/presentation/studio-dashboard.webp"
                  alt="Giao diện phần mềm quản lý phòng tập DANAVA Studio"
                  loading="lazy"
                />
                <div className="media-tag-overlay">
                  <span>ẢNH CHỤP GIAO DIỆN THỰC TẾ · DỮ LIỆU DEMO</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* HAI CARD GỌN: XÂY WEBSITE & PHÁT TRIỂN THƯƠNG HIỆU */}
        <div className="solution-compact-grid">
          {/* CARD GỌN 1: XÂY WEBSITE */}
          <article className="solution-compact-card" id="xay-website">
            <div className="compact-card-media">
              <img src="/assets/legacy/website.webp" alt="Thiết kế website doanh nghiệp DANAVA" loading="lazy" />
              <div className="compact-card-kicker">
                <span>KHÔNG GIAN SỐ · NHU CẦU 02</span>
              </div>
            </div>

            <div className="compact-card-body">
              <h3>Thiết Kế Website &amp; Landing Page Thương Hiệu</h3>
              <p className="compact-card-summary">
                Xây dựng không gian số đẳng cấp, tải nhanh, thể hiện trọn vẹn phong cách thương hiệu và tối ưu chuyển đổi khách hàng tiềm năng 24/7.
              </p>

              {/* Đối tượng */}
              <div className="compact-detail-item">
                <strong>🎯 Đối tượng:</strong>
                <p>Doanh nghiệp, studio wellness, phòng tập và chuyên gia cần một website chuẩn nhận diện và nâng tầm uy tín dịch vụ.</p>
              </div>

              {/* Vấn đề giải quyết */}
              <div className="compact-detail-item">
                <strong>⚠️ Vấn đề giải quyết:</strong>
                <p>Khắc phục website cũ lỗi thời, tải chậm, vỡ khung hình trên điện thoại và thiếu hành trình thu thập thông tin khách hàng.</p>
              </div>

              {/* Dự án liên quan */}
              {hueProject && (
                <div className="compact-related-item">
                  <span className="related-tag">DỰ ÁN LIÊN QUAN:</span>
                  <Link href={`/du-an/${hueProject.slug}/`} className="compact-project-link">
                    {hueProject.client} — Website nhận diện &amp; đặt lịch ↗
                  </Link>
                </div>
              )}

              {/* CTA */}
              <div className="compact-card-action">
                <Link className="button compact-cta-btn" href="/giai-phap/thiet-ke-website/">
                  Xem chi tiết dịch vụ Website <span>↗</span>
                </Link>
              </div>
            </div>
          </article>

          {/* CARD GỌN 2: PHÁT TRIỂN THƯƠNG HIỆU */}
          <article className="solution-compact-card" id="phat-trien-thuong-hieu">
            <div className="compact-card-media">
              <img src="/assets/legacy/marketing.webp" alt="Tiếp thị và truyền thông số DANAVA" loading="lazy" />
              <div className="compact-card-kicker">
                <span>TRUYỀN THÔNG SỐ · NHU CẦU 03</span>
              </div>
            </div>

            <div className="compact-card-body">
              <h3>Digital Marketing &amp; Phát Triển Thương Hiệu</h3>
              <p className="compact-card-summary">
                Xây dựng kế hoạch truyền thông đa kênh bài bản, chăm sóc nội dung fanpage và sản xuất hình ảnh, video chất lượng cao thu hút học viên mới.
              </p>

              {/* Đối tượng */}
              <div className="compact-detail-item">
                <strong>🎯 Đối tượng:</strong>
                <p>Các trung tâm thể thao, phòng tập và thương hiệu wellness cần duy trì sự hiện diện sống động và gia tăng khách đăng ký mới.</p>
              </div>

              {/* Vấn đề giải quyết */}
              <div className="compact-detail-item">
                <strong>⚠️ Vấn đề giải quyết:</strong>
                <p>Giải quyết tình trạng fanpage thiếu bài viết định kỳ, hình ảnh kém chuyên nghiệp và chi phí quảng cáo cao nhưng không ra học viên thật.</p>
              </div>

              {/* Dự án liên quan */}
              {hariverProject && (
                <div className="compact-related-item">
                  <span className="related-tag">DỰ ÁN LIÊN QUAN:</span>
                  <Link href={`/du-an/${hariverProject.slug}/`} className="compact-project-link">
                    {hariverProject.client} — Chiến dịch định vị thương hiệu ↗
                  </Link>
                </div>
              )}

              {/* CTA */}
              <div className="compact-card-action">
                <Link className="button compact-cta-btn" href="/giai-phap/digital-marketing/">
                  Xem chi tiết dịch vụ Truyền thông <span>↗</span>
                </Link>
              </div>
            </div>
          </article>
        </div>

        {/* 4. CÁC GIẢI PHÁP BỔ TRỢ TRONG DANH SÁCH CÔNG KHAI */}
        <div className="supplementary-solutions-block">
          <div className="supplementary-header">
            <h4>THÊM CÁC CÁCH DANAVA ĐỒNG HÀNH CÙNG DOANH NGHIỆP</h4>
            <p>Khám phá các giải pháp sự kiện và kết nối cộng đồng nằm trong hệ sinh thái toàn diện của DANAVA.</p>
          </div>

          <div className="supplementary-grid">
            <Link href="/giai-phap/du-lich-su-kien/" className="supplementary-card">
              <div className="supp-media">
                <img src="/assets/legacy/travel.webp" alt="Du lịch và sự kiện DANAVA" loading="lazy" />
              </div>
              <div className="supp-content">
                <span className="supp-category">TRẢI NGHIỆM</span>
                <h5>Du lịch sự kiện &amp; Yoga Retreat</h5>
                <p>Tổ chức workshop chuyên đề, tour nghỉ dưỡng kết hợp tập luyện và sự kiện teambuilding.</p>
                <span className="supp-link">Xem chi tiết ↗</span>
              </div>
            </Link>

            <Link href="/giai-phap/cong-dong/" className="supplementary-card">
              <div className="supp-media">
                <img src="/assets/legacy/community.webp" alt="Cộng đồng Yoga Club DANAVA" loading="lazy" />
              </div>
              <div className="supp-content">
                <span className="supp-category">KẾT NỐI</span>
                <h5>Cộng đồng &amp; Yoga Club Vietnam</h5>
                <p>Không gian giao lưu, chia sẻ trải nghiệm và mạng lưới liên kết cộng đồng người yêu Yoga toàn quốc.</p>
                <span className="supp-link">Xem chi tiết ↗</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CUỐI TRANG: LỐI NHẬN TƯ VẤN KHI KHÁCH CHƯA XÁC ĐỊNH NHU CẦU */}
      <section className="section undecided-consult-section" id="tu-van-chua-ro" aria-label="Nhận tư vấn khi chưa xác định rõ nhu cầu">
        <div className="undecided-container">
          <div className="undecided-copy">
            <p className="eyebrow"><span className="status-dot" /> TƯ VẤN ĐỊNH HƯỚNG MIỄN PHÍ</p>
            <h2>Chưa rõ nên bắt đầu từ đâu?<br /><em>Hãy để DANAVA lắng nghe bạn.</em></h2>
            <p className="undecided-lead">
              Bạn đang phân vân nên số hóa quản lý phòng tập trước, làm mới website hay đẩy mạnh truyền thông? Đội ngũ chuyên gia của DANAVA sẽ khảo sát hiện trạng mô hình của bạn và tư vấn lộ trình phù hợp với ngân sách nhất.
            </p>

            <div className="undecided-highlights">
              <div className="highlight-row">
                <span className="check-badge">✓</span>
                <div>
                  <strong>Khảo sát hiện trạng thực tế:</strong>
                  <span>Phân tích bài toán vận hành và mức độ sẵn sàng số hóa của phòng tập.</span>
                </div>
              </div>
              <div className="highlight-row">
                <span className="check-badge">✓</span>
                <div>
                  <strong>Đề xuất lộ trình từng bước:</strong>
                  <span>Ưu tiên hạng mục mang lại hiệu quả tức thì trước khi mở rộng.</span>
                </div>
              </div>
              <div className="highlight-row">
                <span className="check-badge">✓</span>
                <div>
                  <strong>Báo giá minh bạch:</strong>
                  <span>Chi phí rõ ràng theo phạm vi cam kết, không phát sinh chi phí ẩn.</span>
                </div>
              </div>
            </div>

            <div className="undecided-direct-contact">
              <span>HOẶC KẾT NỐI TRỰC TIẾP QUA:</span>
              <div className="direct-links">
                <a href={`tel:${data.phone}`} className="phone-pill">
                  📞 Hotline: <strong>{data.phone}</strong>
                </a>
                <a href={`mailto:${data.email}`} className="email-pill">
                  ✉️ Email: <strong>{data.email}</strong>
                </a>
              </div>
            </div>
          </div>

          <div className="undecided-form-card">
            {sent ? (
              <div className="form-success-card" role="status" aria-live="polite">
                <span className="success-badge">✓ TIẾP NHẬN THÀNH CÔNG</span>
                <h3>Cảm ơn bạn đã kết nối!</h3>
                <p>{statusMsg || 'Đội ngũ chuyên viên DANAVA sẽ liên hệ với bạn trong thời gian sớm nhất.'}</p>
                <button type="button" className="button secondary" onClick={() => setSent(false)}>
                  Gửi yêu cầu tư vấn khác ↗
                </button>
              </div>
            ) : (
              <form onSubmit={submitUndecided} className="undecided-form" aria-label="Biểu mẫu yêu cầu tư vấn định hướng">
                <h3>Đăng ký nhận tư vấn định hướng</h3>
                <p>Chia sẻ ngắn gọn hiện trạng, chúng tôi sẽ liên hệ lại hỗ trợ bạn.</p>

                <label>
                  <span>Họ và tên của bạn *</span>
                  <input name="name" required maxLength={150} placeholder="Ví dụ: Trần Văn Hoàng" autoComplete="name" />
                </label>

                <div className="form-row-two">
                  <label>
                    <span>Số điện thoại *</span>
                    <input name="phone" type="tel" required maxLength={50} placeholder="0905 xxx xxx" autoComplete="tel" />
                  </label>
                  <label>
                    <span>Email liên hệ</span>
                    <input name="email" type="email" maxLength={200} placeholder="hoang@phongtap.vn" autoComplete="email" />
                  </label>
                </div>

                <label>
                  <span>Hiện trạng cơ sở của bạn hiện nay</span>
                  <select name="situation" defaultValue="Chưa rõ nhu cầu, muốn nghe tư vấn tổng thể">
                    <option value="Chưa rõ nhu cầu, muốn nghe tư vấn tổng thể">Chưa rõ nhu cầu, muốn nghe tư vấn tổng thể</option>
                    <option value="Đang chuẩn bị mở phòng tập mới (cần giải pháp trọn gói)">Đang chuẩn bị mở phòng tập mới (cần trọn gói)</option>
                    <option value="Phòng tập đang hoạt động, cần đổi sang phần mềm DANAVA Studio">Phòng tập đang chạy, cần phần mềm quản lý Studio</option>
                    <option value="Cần nâng cấp website nhận diện và thu hút học viên">Cần thiết kế website &amp; landing page</option>
                    <option value="Cần chăm sóc fanpage và chạy truyền thông đa kênh">Cần truyền thông &amp; phát triển thương hiệu</option>
                    <option value="Mô hình đặc thù khác">Mô hình đặc thù khác</option>
                  </select>
                </label>

                <label>
                  <span>Mô tả ngắn về bài toán hoặc băn khoăn của bạn</span>
                  <textarea name="message" rows={3} maxLength={3000} placeholder="Ví dụ: Phòng tập Yoga 100 học viên tại Đà Nẵng, hiện quản lý bằng excel muốn chuyển đổi..." />
                </label>

                <button type="submit" className="button solution-submit-btn" disabled={submitting}>
                  {submitting ? 'Đang gửi thông tin...' : 'Nhận tư vấn lộ trình phù hợp ↗'}
                </button>
                <small className="form-privacy-note">
                  Cam kết bảo mật thông tin theo <Link href="/chinh-sach-rieng-tu/">Chính sách riêng tư</Link> của DANAVA.
                </small>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. FAQ THƯỜNG GẶP TRƯỚC KHI BẮT ĐẦU */}
      <ServiceFAQ />
    </main>
  );
}

/* ==========================================================================
   DANAVA STUDIO — TRANG CHI TIẾT SẢN PHẨM (/giai-phap/danava-studio)
   Yêu cầu:
   - Trình diễn sản phẩm bằng ảnh thật: hội viên, gói tập, lịch lớp, QR check-in, báo cáo
   - Sau hero: Các nhóm ngành Gym / Yoga / Pilates / Bể bơi / Spa
   - Tính năng theo công việc (Chủ cơ sở, Lễ tân, HLV/PT, Hội viên)
   - Quy trình triển khai 4 bước
   - Dự án liên quan (HARIVER Gym, Huế Pilates)
   - Bảng giá & Ưu đãi: Chỉ hiện nếu CMS có dữ liệu đã duyệt
   - FAQ chuyên sâu
   - CTA “Đăng ký demo” chuyển sang /lien-he/?service=DANAVA+Studio
   ========================================================================== */
export function StudioServicePage({ service }: { service: Service }) {
  const { data } = useSite();
  const [activeShowcase, setActiveShowcase] = useState<'members' | 'packages' | 'classes' | 'checkin' | 'reports'>('members');

  // Lọc các dự án thực tế liên quan từ CMS
  const hariverProject = data.projects?.find(p => (p.id === 'hariver-studio' || p.slug === 'hariver-gym-danava-studio' || p.slug === 'hariver-studio') && p.published);
  const hueProject = data.projects?.find(p => (p.id === 'hue-studio' || p.slug === 'hue-pilates-yoga-danava-studio' || p.slug === 'hue-studio') && p.published);

  // Kiểm tra bảng giá & ưu đãi từ CMS (chỉ hiện nếu có dữ liệu đã duyệt)
  const approvedPricing = (service as unknown as { pricing?: { name: string; price: string; features: string[] }[] }).pricing;
  const hasApprovedPricing = Array.isArray(approvedPricing) && approvedPricing.length > 0;

  // Dữ liệu trình diễn sản phẩm 5 hạng mục với ảnh thật
  const showcaseData = {
    members: {
      tag: '01 / QUẢN LÝ HỘI VIÊN',
      title: 'Hồ sơ học viên & Lịch sử sức khỏe tập trung',
      desc: 'Quản lý toàn diện dữ liệu khách hàng từ số điện thoại, ngày tham gia, gói tập đang kích hoạt, số buổi còn lại đến ghi chú chấn thương và thể trạng riêng biệt.',
      bullets: [
        'Tra cứu thông tin học viên tức thì theo tên, số điện thoại hoặc mã hội viên.',
        'Lưu trữ nhật ký tập luyện, buổi tập đã tham gia và lịch sử gia hạn thẻ.',
        'Hệ thống thông báo tự động nhắc nhở hội viên trước khi gói tập hết hạn.',
        'Bảo mật dữ liệu cá nhân theo tiêu chuẩn phân quyền quản lý.'
      ],
      caption: 'Ảnh chụp màn hình hồ sơ hội viên · Dữ liệu demo DANAVA Studio'
    },
    packages: {
      tag: '02 / GÓI TẬP LINH HOẠT',
      title: 'Thiết lập gói tập, thẻ thành viên & Tự động nhắc gia hạn',
      desc: 'Hỗ trợ đa dạng mô hình kinh doanh: thẻ theo tháng, thẻ theo số buổi, gói tập kèm Huấn luyện viên (PT 1:1, semi-private) hoặc thẻ bơi theo mùa.',
      bullets: [
        'Cấu hình linh hoạt thời hạn, số buổi tập và giới hạn khung giờ vào tập.',
        'Tự động cảnh báo thẻ sắp hết hạn hoặc hết số buổi trên màn hình lễ tân.',
        'Quản lý chính sách bảo lưu gói tập, chuyển nhượng và gia hạn nhanh chóng.',
        'Theo dõi công nợ, phương thức thanh toán chuyển khoản/tiền mặt minh bạch.'
      ],
      caption: 'Ảnh chụp màn hình danh mục gói tập · Dữ liệu demo DANAVA Studio'
    },
    classes: {
      tag: '03 / LỊCH LỚP THÔNG MINH',
      title: 'Xếp lịch lớp, giới hạn thảm/máy & Học viên tự đặt chỗ',
      desc: 'Tối ưu hóa công suất phòng tập Yoga, lớp máy Pilates hay ca tập nhóm. Đặt chỗ theo sức chứa thực tế, tự động khóa lớp khi đủ học viên.',
      bullets: [
        'Lên lịch lớp linh hoạt theo tuần, theo ca sáng/chiều/tối và gán giáo viên.',
        'Giới hạn sĩ số chính xác theo số lượng thảm tập hoặc máy Pilates Reformer.',
        'Tự động mở danh sách chờ (waitlist) khi có học viên khác hủy lịch trước giờ.',
        'Thông báo lịch dạy cho Huấn luyện viên trực tiếp trên điện thoại.'
      ],
      caption: 'Ảnh chụp màn hình lịch lớp theo tuần · Dữ liệu demo DANAVA Studio'
    },
    checkin: {
      tag: '04 / QR CHECK-IN TỨC THÌ',
      title: 'Quét mã QR trong 2 giây · Kiểm soát ra vào không cần thẻ nhựa',
      desc: 'Tối giản hóa quầy lễ tân: hội viên tự quét mã QR trên điện thoại hoặc lễ tân quét mã chỉ trong 2 giây. Chống mượn thẻ gian lận và giảm thời gian chờ.',
      bullets: [
        'Quét mã QR tức thì bằng camera máy tính bảng hoặc máy quét cầm tay.',
        'Màn hình hiển thị ngay trạng thái thẻ hợp lệ, số ngày còn lại và ảnh đại diện.',
        'Tự động trừ số buổi tập của gói theo lượt ngay khi check-in thành công.',
        'Lưu nhật ký ra vào chính xác phục vụ báo cáo lưu lượng giờ cao điểm.'
      ],
      caption: 'Ảnh chụp màn hình quầy quét mã QR check-in · Dữ liệu demo DANAVA Studio'
    },
    reports: {
      tag: '05 / BÁO CÁO DOANH THU',
      title: 'Báo cáo doanh thu & Hiệu suất HLV/PT minh bạch thời gian thực',
      desc: 'Chủ cơ sở nắm bắt toàn bộ bức tranh tài chính: doanh thu theo ngày/tháng, tỷ lệ hội viên tái tục, khung giờ cao điểm và bảng tính hoa hồng HLV tự động.',
      bullets: [
        'Báo cáo doanh số bán gói mới và doanh số gia hạn chi tiết theo từng ca trực.',
        'Tự động tính hoa hồng dạy của HLV/PT theo số buổi thực tế, không sợ nhầm lẫn.',
        'Biểu đồ trực quan so sánh tỷ lệ lấp đầy phòng tập giữa các ngày trong tuần.',
        'Xuất dữ liệu đối soát tài chính định dạng Excel dễ dàng khi quyết toán.'
      ],
      caption: 'Ảnh chụp màn hình biểu đồ doanh thu và báo cáo · Dữ liệu demo DANAVA Studio'
    }
  };

  const currentShowcase = showcaseData[activeShowcase];

  return (
    <main id="main" className="studio-product-page">
      {/* 1. HERO SẢN PHẨM STUDIO */}
      <section className="studio-hero-section">
        <div className="studio-hero-atmosphere" aria-hidden="true">
          <div className="studio-radial-glow" />
          <div className="studio-grid-mesh" />
        </div>

        <div className="studio-hero-container">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <Link href="/giai-phap/">Giải pháp</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <span className="breadcrumb-current" aria-current="page">DANAVA Studio</span>
          </nav>

          <p className="eyebrow">
            <span className="status-dot" aria-hidden="true" /> DANAVA SOLUTIONS · PHẦN MỀM QUẢN TRỊ WELLNESS
          </p>

          <h1 className="studio-hero-title">
            Vận hành tinh gọn.<br /><em>Kết nối sâu sắc hơn.</em>
          </h1>

          <p className="studio-hero-desc">
            Phần mềm quản trị số hóa chuyên sâu dành riêng cho Gym, Yoga, Pilates, Bể bơi và Spa. Quản lý hội viên, hạn thẻ, lịch lớp QR và báo cáo doanh thu minh bạch trong một nền tảng tập trung.
          </p>

          <div className="studio-hero-actions">
            <Link className="button studio-cta-primary" href="/lien-he/?service=DANAVA+Studio">
              Đăng ký demo <span>↗</span>
            </Link>
            <a className="button studio-cta-secondary" href="#trinh-dien-san-pham">
              Xem chi tiết tính năng <span>↓</span>
            </a>
          </div>

          {/* Hero Mockup Showcase */}
          <div className="studio-hero-mockup-wrap">
            <div className="studio-mockup-cyan-back" aria-hidden="true" />
            <div className="studio-mockup-frame">
              <div className="mockup-chrome-bar">
                <div className="mockup-dots" aria-hidden="true">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="mockup-url-pill">
                  <span className="mockup-lock" aria-hidden="true">🔒</span>
                  <span>studio.danava.vn</span>
                  <span className="mockup-live-badge">HỆ THỐNG THỰC TẾ</span>
                </div>
              </div>
              <img
                src="/assets/presentation/studio-dashboard.webp"
                alt="Giao diện phần mềm quản lý phòng tập DANAVA Studio"
                width={1200}
                height={750}
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CÁC NHÓM NGÀNH ĐẶC THÙ (GYM / YOGA / PILATES / BỂ BƠI / SPA) */}
      <section className="section studio-verticals-section" id="nhom-nganh" aria-label="Các mô hình phòng tập ứng dụng DANAVA Studio">
        <div className="section-kicker">
          <span>01 / LĨNH VỰC ỨNG DỤNG</span>
          <span>MAY ĐO CHO TỪNG ĐẶC THÙ VẬN HÀNH</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">MÔ HÌNH PHÒNG TẬP &amp; WELLNESS</p>
            <h2>Giải pháp chuẩn hóa<br /><em>cho 5 mô hình đặc thù.</em></h2>
          </div>
          <p>Mỗi loại hình cơ sở có quy trình đón tiếp và phân bổ dịch vụ khác nhau. DANAVA Studio được thiết kế linh hoạt đáp ứng chính xác bài toán của từng mô hình.</p>
        </div>

        <div className="studio-verticals-grid">
          {/* 1. Gym */}
          <article className="vertical-card">
            <span className="vertical-icon">🏋️</span>
            <span className="vertical-kicker">01 / THỂ HÌNH</span>
            <h3>Gym &amp; Fitness Center</h3>
            <p>Kiểm soát lưu lượng ra vào đông đảo, thẻ tập theo tháng/năm, tủ khóa locker và hoa hồng theo buổi dạy của PT.</p>
            <ul className="vertical-points">
              <li>Check-in tự động giờ cao điểm</li>
              <li>Theo dõi hạn gói tập &amp; nhắc gia hạn</li>
              <li>Phân bổ hoa hồng PT minh bạch</li>
            </ul>
          </article>

          {/* 2. Yoga */}
          <article className="vertical-card">
            <span className="vertical-icon">🧘</span>
            <span className="vertical-kicker">02 / YOGA STUDIO</span>
            <h3>Trung Tâm Yoga</h3>
            <p>Xếp lịch lớp linh hoạt theo giáo viên và khung giờ, giới hạn số thảm tập mỗi ca và quản lý gói theo buổi.</p>
            <ul className="vertical-points">
              <li>Giới hạn số thảm mỗi ca tập</li>
              <li>Học viên tự đặt &amp; hủy chỗ online</li>
              <li>Theo dõi gói tập theo lượt/buổi</li>
            </ul>
          </article>

          {/* 3. Pilates */}
          <article className="vertical-card">
            <span className="vertical-icon">✨</span>
            <span className="vertical-kicker">03 / PILATES REFORMER</span>
            <h3>Studio Pilates</h3>
            <p>Quản lý lịch lớp máy Reformer/Cadillac có số lượng máy giới hạn, lịch kèm 1:1 và semi-private cao cấp.</p>
            <ul className="vertical-points">
              <li>Kiểm soát số lượng máy tập chính xác</li>
              <li>Lịch tập kèm riêng 1:1 &amp; nhóm 3-5</li>
              <li>Theo dõi lộ trình tiến bộ của học viên</li>
            </ul>
          </article>

          {/* 4. Bể bơi */}
          <article className="vertical-card">
            <span className="vertical-icon">🏊</span>
            <span className="vertical-kicker">04 / BỂ BƠI &amp; CLB</span>
            <h3>Bể Bơi &amp; Thể Thao Dưới Nước</h3>
            <p>Kiểm soát vé lượt, thẻ bơi theo mùa hè/năm, phân làn bơi và quản lý các khóa học bơi trẻ em &amp; người lớn.</p>
            <ul className="vertical-points">
              <li>Vé bơi theo lượt &amp; thẻ bơi mùa</li>
              <li>Quản lý khóa học bơi theo huấn luyện viên</li>
              <li>Phân luồng kiểm soát ra vào nhanh chóng</li>
            </ul>
          </article>

          {/* 5. Spa */}
          <article className="vertical-card">
            <span className="vertical-icon">💆</span>
            <span className="vertical-kicker">05 / WELLNESS SPA</span>
            <h3>Wellness Spa &amp; Trị Liệu</h3>
            <p>Đặt lịch theo giường và kỹ thuật viên chuyên trách, quản lý gói liệu trình nhiều buổi và vật tư tiêu hao.</p>
            <ul className="vertical-points">
              <li>Lịch hẹn theo phòng &amp; kỹ thuật viên</li>
              <li>Quản lý thẻ liệu trình nhiều buổi</li>
              <li>Ghi chú tình trạng da và thể trạng</li>
            </ul>
          </article>
        </div>
      </section>

      {/* 3. TRÌNH DIỄN SẢN PHẨM BẰNG ẢNH THẬT CHO 5 HẠNG MỤC */}
      <section className="section studio-showcase-section" id="trinh-dien-san-pham" aria-label="Trình diễn tính năng thực tế của DANAVA Studio">
        <div className="section-kicker">
          <span>02 / TRÌNH DIỄN TÍNH NĂNG THỰC TẾ</span>
          <span>ẢNH CHỤP GIAO DIỆN HỆ THỐNG</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">KHÁM PHÁ NỀN TẢNG</p>
            <h2>5 Trụ cột vận hành<br /><em>trong cùng một không gian.</em></h2>
          </div>
          <p>Mỗi tính năng được trau chuốt để thao tác nhanh nhất tại quầy lễ tân và cung cấp số liệu trực quan nhất cho nhà quản lý.</p>
        </div>

        {/* Tab Selector */}
        <div className="showcase-tabs-nav" role="tablist" aria-label="Danh mục tính năng DANAVA Studio">
          {[
            { id: 'members', label: '01. Hội viên' },
            { id: 'packages', label: '02. Gói tập' },
            { id: 'classes', label: '03. Lịch lớp' },
            { id: 'checkin', label: '04. QR Check-in' },
            { id: 'reports', label: '05. Báo cáo' }
          ].map(tab => {
            const active = activeShowcase === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                className={`showcase-tab-btn ${active ? 'is-active' : ''}`}
                onClick={() => setActiveShowcase(tab.id as typeof activeShowcase)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="showcase-display-stage" role="tabpanel">
          <div className="showcase-stage-copy">
            <span className="showcase-feature-tag">{currentShowcase.tag}</span>
            <h3>{currentShowcase.title}</h3>
            <p className="showcase-desc">{currentShowcase.desc}</p>

            <ul className="showcase-bullets-list">
              {currentShowcase.bullets.map((b, i) => (
                <li key={i}>
                  <span className="bullet-check">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="showcase-action-wrap">
              <Link className="button studio-cta-primary" href="/lien-he/?service=DANAVA+Studio">
                Đăng ký trải nghiệm thực tế <span>↗</span>
              </Link>
            </div>
          </div>

          <div className="showcase-stage-visual">
            <div className="visual-screen-container">
              <div className="mockup-chrome-bar">
                <div className="mockup-dots" aria-hidden="true">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="mockup-url-pill">
                  <span className="mockup-lock" aria-hidden="true">🔒</span>
                  <span>studio.danava.vn · {activeShowcase}</span>
                </div>
              </div>
              <img
                src="/assets/presentation/studio-dashboard.webp"
                alt={`Giao diện ${currentShowcase.title} trên DANAVA Studio`}
                loading="lazy"
              />
              <div className="visual-caption-bar">
                <span>{currentShowcase.caption}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TÍNH NĂNG THEO CÔNG VIỆC (ROLE-BASED WORKFLOWS) */}
      <section className="section studio-workflows-section" id="tinh-nang-cong-viec" aria-label="Tính năng phân chia theo vai trò công việc">
        <div className="section-kicker">
          <span>03 / PHÂN VAI CÔNG VIỆC</span>
          <span>DỄ DÙNG CHO TỪNG BỘ PHẬN</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">TRẢI NGHIỆM LÀM VIỆC</p>
            <h2>Đúng người. Đúng quyền.<br /><em>Vận hành mượt mà mỗi ngày.</em></h2>
          </div>
          <p>Không làm xáo trộn thói quen của nhân sự. Giao diện được tối ưu riêng biệt cho từng vị trí trong phòng tập.</p>
        </div>

        <div className="studio-workflows-grid">
          {/* 1. Chủ cơ sở */}
          <article className="workflow-card">
            <div className="workflow-card-head">
              <span className="workflow-badge">QUẢN LÝ ĐIỀU HÀNH</span>
              <h3>Chủ Cơ Sở &amp; Giám Đốc</h3>
            </div>
            <p className="workflow-summary">Kiểm soát toàn diện sức khỏe tài chính và hoạt động phòng tập từ xa qua điện thoại hoặc máy tính.</p>
            <ul className="workflow-tasks">
              <li>Theo dõi doanh thu &amp; dòng tiền thời gian thực.</li>
              <li>Phân quyền chặt chẽ, bảo vệ thông tin khách hàng.</li>
              <li>Báo cáo tỷ lệ hội viên mới và tỷ lệ tái tục gói tập.</li>
              <li>Chống thất thoát doanh thu từ quầy lễ tân.</li>
            </ul>
          </article>

          {/* 2. Lễ tân */}
          <article className="workflow-card">
            <div className="workflow-card-head">
              <span className="workflow-badge">TIẾP ĐÓN &amp; BÁN HÀNG</span>
              <h3>Lễ Tân &amp; Thu Ngân</h3>
            </div>
            <p className="workflow-summary">Thực hiện các thao tác đón khách và bán gói tập nhanh chóng, chuyên nghiệp ngay tại quầy.</p>
            <ul className="workflow-tasks">
              <li>Check-in quét mã QR trong 2 giây, không ùn tắc.</li>
              <li>Tìm kiếm học viên bằng số điện thoại tức thì.</li>
              <li>Bán mới, gia hạn gói tập và in biên nhận dễ dàng.</li>
              <li>Nhắc nhở khách hạn thẻ và công nợ lịch sự.</li>
            </ul>
          </article>

          {/* 3. Huấn luyện viên */}
          <article className="workflow-card">
            <div className="workflow-card-head">
              <span className="workflow-badge">GIẢNG DẠY &amp; CHUYÊN MÔN</span>
              <h3>Huấn Luyện Viên &amp; PT</h3>
            </div>
            <p className="workflow-summary">Chủ động lịch dạy, theo dõi danh sách học viên và đối soát hoa hồng dạy minh bạch cuối tháng.</p>
            <ul className="workflow-tasks">
              <li>Xem lịch dạy cá nhân trên điện thoại mỗi ngày.</li>
              <li>Điểm danh học viên lớp nhóm hoặc buổi tập PT.</li>
              <li>Ghi chú thể trạng, bài tập cần lưu ý của học viên.</li>
              <li>Bảng hoa hồng dạy chi tiết, không sợ nhầm buổi.</li>
            </ul>
          </article>

          {/* 4. Hội viên */}
          <article className="workflow-card">
            <div className="workflow-card-head">
              <span className="workflow-badge">HỘI VIÊN &amp; KHÁCH HÀNG</span>
              <h3>Hội Viên Phòng Tập</h3>
            </div>
            <p className="workflow-summary">Trải nghiệm dịch vụ hiện đại, chủ động lịch tập và theo dõi quyền lợi gói tập rõ ràng.</p>
            <ul className="workflow-tasks">
              <li>Quét mã QR vào tập nhanh chóng không cần thẻ cứng.</li>
              <li>Tự đặt chỗ lớp Yoga/Pilates ưa thích qua điện thoại.</li>
              <li>Xem số buổi tập còn lại và thời hạn gói tập.</li>
              <li>Nhận thông báo nhắc lịch tập trước giờ lớp.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* 5. QUY TRÌNH TRIỂN KHAI THỰC TẾ 4 BƯỚC */}
      <section className="section studio-deployment-section" id="quy-trinh-trien-khai" aria-label="Quy trình triển khai phần mềm DANAVA Studio">
        <div className="section-kicker">
          <span>04 / LỘ TRÌNH ĐỒNG HÀNH</span>
          <span>TRIỂN KHAI NHANH CHÓNG TRONG 1 - 3 NGÀY</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">QUY TRÌNH TRIỂN KHAI</p>
            <h2>Không gián đoạn vận hành.<br /><em>Chuyển giao êm đẹp.</em></h2>
          </div>
          <p>Đội ngũ kỹ thuật DANAVA trực tiếp đồng hành hỗ trợ nhập dữ liệu cũ và đào tạo nhân viên tận nơi hoặc qua video call.</p>
        </div>

        <div className="deployment-steps-grid">
          <div className="deploy-step-card">
            <span className="step-num">BƯỚC 01</span>
            <h4>Khảo Sát &amp; Nhập Dữ Liệu</h4>
            <p>Khảo sát mô hình hiện tại, hỗ trợ chuẩn hóa và chuyển toàn bộ danh sách hội viên cũ từ Excel/sổ sách vào hệ thống.</p>
            <span className="step-time">Thời gian: 1 ngày</span>
          </div>

          <div className="deploy-step-card">
            <span className="step-num">BƯỚC 02</span>
            <h4>Cấu Hình Hệ Thống</h4>
            <p>Thiết lập danh mục gói tập, lịch lớp, phòng máy, phân quyền nhân sự theo đúng cơ chế vận hành của cơ sở.</p>
            <span className="step-time">Thời gian: 0.5 ngày</span>
          </div>

          <div className="deploy-step-card">
            <span className="step-num">BƯỚC 03</span>
            <h4>Đào Tạo Nhân Sự</h4>
            <p>Hướng dẫn thực hành trực tiếp cho lễ tân, quản lý và HLV. Cung cấp tài liệu và video tra cứu thao tác nhanh.</p>
            <span className="step-time">Thời gian: 0.5 ngày</span>
          </div>

          <div className="deploy-step-card">
            <span className="step-num">BƯỚC 04</span>
            <h4>Vận Hành &amp; Hỗ Trợ 24/7</h4>
            <p>Bàn giao hệ thống chính thức hoạt động tại quầy và duy trì kênh hỗ trợ kỹ thuật liên tục trong suốt quá trình sử dụng.</p>
            <span className="step-time">Cam kết hỗ trợ liên tục</span>
          </div>
        </div>
      </section>

      {/* 6. DỰ ÁN LIÊN QUAN THỰC TẾ (HARIVER GYM & HUẾ PILATES) */}
      {(hariverProject || hueProject) && (
        <section className="section studio-cases-section" aria-label="Các phòng tập đã triển khai giải pháp DANAVA Studio">
          <div className="section-kicker">
            <span>05 / DỰ ÁN THỰC TẾ</span>
            <span>KẾT QUẢ ĐÃ ĐƯỢC CHỨNG MINH</span>
          </div>

          <div className="intro-heading">
            <div>
              <p className="eyebrow">HỒ SƠ TRIỂN KHAI</p>
              <h2>Các cơ sở đã tin tưởng<br /><em>đồng hành cùng DANAVA.</em></h2>
            </div>
            <Link className="text-link" href="/du-an/">Xem tất cả dự án ↗</Link>
          </div>

          <div className="studio-cases-grid">
            {hariverProject && (
              <Link href={`/du-an/${hariverProject.slug}/`} className="studio-case-card">
                <div className="case-card-thumb">
                  <img src={hariverProject.image} alt={hariverProject.client || hariverProject.title} loading="lazy" />
                  <span className="case-cat-badge">{hariverProject.category}</span>
                </div>
                <div className="case-card-body">
                  <span className="case-client-name">{hariverProject.client}</span>
                  <h4>{hariverProject.title}</h4>
                  <p>{hariverProject.summary}</p>
                  <span className="case-cta-link">Xem hồ sơ triển khai ↗</span>
                </div>
              </Link>
            )}

            {hueProject && (
              <Link href={`/du-an/${hueProject.slug}/`} className="studio-case-card">
                <div className="case-card-thumb">
                  <img src={hueProject.image} alt={hueProject.client || hueProject.title} loading="lazy" />
                  <span className="case-cat-badge">{hueProject.category}</span>
                </div>
                <div className="case-card-body">
                  <span className="case-client-name">{hueProject.client}</span>
                  <h4>{hueProject.title}</h4>
                  <p>{hueProject.summary}</p>
                  <span className="case-cta-link">Xem hồ sơ triển khai ↗</span>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* 7. GIÁ & ƯU ĐÃI: CHỈ HIỆN NẾU CMS CÓ DỮ LIỆU ĐÃ DUYỆT */}
      <section className="section studio-pricing-section" id="bang-gia" aria-label="Bảng giá và ưu đãi DANAVA Studio">
        <div className="section-kicker">
          <span>06 / CHI PHÍ ĐẦU TƯ</span>
          <span>MINH BẠCH &amp; TỐI ƯU CHO TỪNG QUY MÔ</span>
        </div>

        {hasApprovedPricing ? (
          <div className="approved-pricing-block">
            <div className="intro-heading">
              <div>
                <p className="eyebrow">BẢNG GIÁ ĐÃ PHÊ DUYỆT</p>
                <h2>Lựa chọn gói giải pháp<br /><em>phù hợp với cơ sở của bạn.</em></h2>
              </div>
            </div>
            <div className="pricing-cards-grid">
              {approvedPricing.map(tier => (
                <div key={tier.name} className="pricing-tier-card">
                  <h3>{tier.name}</h3>
                  <div className="price-tag">{tier.price}</div>
                  <ul className="tier-features-list">
                    {tier.features.map((f, idx) => (
                      <li key={idx}>✓ {f}</li>
                    ))}
                  </ul>
                  <Link className="button studio-cta-primary" href="/lien-he/?service=DANAVA+Studio">
                    Đăng ký gói này ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="custom-pricing-consult-block">
            <div className="consult-pricing-card">
              <span className="badge-highlight">BÁO GIÁ MAY ĐO THEO QUY MÔ</span>
              <h3>Chi phí đầu tư phù hợp theo số lượng học viên &amp; điểm tập</h3>
              <p>
                DANAVA Studio áp dụng chính sách chi phí linh hoạt theo thực tế: phòng tập độc lập quy mô vừa và nhỏ được tối ưu mức phí khởi điểm, hỗ trợ thanh toán linh hoạt và chuyển đổi dữ liệu miễn phí.
              </p>
              <div className="pricing-benefit-row">
                <div><span>✓</span> Miễn phí nhập dữ liệu ban đầu</div>
                <div><span>✓</span> Không phát sinh chi phí bảo trì ẩn</div>
                <div><span>✓</span> Hỗ trợ kỹ thuật 24/7 trực tiếp</div>
              </div>
              <div className="pricing-cta-row">
                <Link className="button studio-cta-primary" href="/lien-he/?service=DANAVA+Studio">
                  Đăng ký demo &amp; Nhận báo giá chi tiết ↗
                </Link>
                <a className="button studio-cta-secondary" href={`tel:${data.phone}`}>
                  Hotline tư vấn: {data.phone}
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 8. FAQ CHUYÊN SÂU DANAVA STUDIO */}
      <section className="section studio-faq-section" aria-label="Câu hỏi thường gặp về DANAVA Studio">
        <div className="section-kicker">
          <span>07 / GIẢI ĐÁP BĂN KHOĂN</span>
          <span>NHỮNG ĐIỀU CHỦ PHÒNG TẬP QUAN TÂM</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">HỎI ĐÁP VẬN HÀNH</p>
            <h2>Giải đáp thắc mắc<br /><em>trước khi bắt đầu.</em></h2>
          </div>
          <p>Các câu hỏi thực tế chúng tôi thường nhận được từ các chủ phòng Gym, Yoga, Pilates và Spa.</p>
        </div>

        <div className="studio-faq-accordion">
          {[
            {
              q: 'Dữ liệu học viên cũ từ file Excel hoặc sổ sách có chuyển sang DANAVA Studio được không?',
              a: 'Có. Đội ngũ kỹ thuật của DANAVA hỗ trợ chuẩn hóa và nhập toàn bộ danh sách hội viên, hạn thẻ, số buổi tập cũ vào hệ thống hoàn toàn miễn phí, đảm bảo phòng tập không bị gián đoạn hoạt động.'
            },
            {
              q: 'Phần mềm có yêu cầu máy tính cấu hình cao hay thiết bị phần cứng đắt tiền không?',
              a: 'Không. DANAVA Studio hoạt động trên nền tảng web hiện đại, tương thích hoàn hảo với mọi máy tính, laptop, iPad, máy tính bảng hoặc điện thoại thông minh hiện có tại quầy. Để check-in QR, bạn có thể dùng camera điện thoại/tablet hoặc máy quét mã vạch phổ thông.'
            },
            {
              q: 'Thời gian triển khai và đào tạo nhân sự mất bao lâu?',
              a: 'Thời gian triển khai trung bình từ 1 đến 3 ngày. Giao diện hoàn toàn bằng tiếng Việt với quy trình trực quan, nhân viên lễ tân có thể thành thạo các thao tác check-in và bán thẻ sau 30 phút hướng dẫn.'
            },
            {
              q: 'Dữ liệu phòng tập và doanh thu của tôi được lưu trữ và bảo mật ra sao?',
              a: 'Dữ liệu được lưu trữ trên hạ tầng máy chủ bảo mật cao, mã hóa kết nối SSL/TLS. Cơ chế phân quyền chi tiết giúp bạn kiểm soát chặt chẽ nhân viên: lễ tân chỉ được thao tác trong ca trực, không thể trích xuất toàn bộ danh bạ khách hàng.'
            },
            {
              q: 'Nếu mất kết nối internet tạm thời tại phòng tập thì có check-in được không?',
              a: 'Hệ thống hỗ trợ cơ chế lưu tạm cục bộ để tiếp nhận học viên vào tập bình thường, dữ liệu sẽ tự động đồng bộ lên máy chủ ngay khi có kết nối trở lại.'
            }
          ].map(faq => (
            <details key={faq.q} className="studio-faq-item">
              <summary>
                <span>{faq.q}</span>
                <span className="faq-toggle-icon" aria-hidden="true">+</span>
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 9. CTA CUỐI TRANG: ĐĂNG KÝ DEMO */}
      <section className="section studio-closing-cta">
        <div className="closing-cta-card">
          <p className="eyebrow"><span className="status-dot" /> SẴN SÀNG SỐ HÓA PHÒNG TẬP</p>
          <h2>Trải nghiệm DANAVA Studio<br /><em>ngay hôm nay.</em></h2>
          <p>Đăng ký lịch trải nghiệm bản demo thực tế cùng chuyên viên DANAVA để thấy rõ cách hệ thống giúp bạn tiết kiệm thời gian và ngăn ngừa thất thoát.</p>
          <div className="closing-actions">
            <Link className="button studio-cta-primary" href="/lien-he/?service=DANAVA+Studio">
              Đăng ký demo miễn phí ↗
            </Link>
            <a className="button studio-cta-outline" href={`tel:${data.phone}`}>
              Gọi trực tiếp: {data.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   DANAVA WEBSITE & LANDING PAGE — TRANG DỊCH VỤ (/giai-phap/thiet-ke-website)
   Yêu cầu:
   - Hero chia đôi nội dung và ảnh website thật trên desktop/mobile
   - Trình bày các loại website: Thương hiệu, Landing page, Đặt lịch, Bán hàng
   - Phạm vi bàn giao cụ thể
   - Quy trình: Nhận brief → Thiết kế → Nghiệm thu → Bàn giao
   - Dự án đã duyệt (Huế Pilates, HARIVER Gym)
   - FAQ chuyên sâu
   - CTA “Gửi yêu cầu làm website” mở form chọn sẵn dịch vụ
   ========================================================================== */
export function WebsiteServicePage({ service }: { service: Service }) {
  const { data } = useSite();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Lọc các dự án thực tế liên quan từ CMS
  const hueProject = data.projects?.find(p => (p.id === 'hue-studio' || p.slug === 'hue-pilates-yoga-danava-studio' || p.slug === 'hue-studio') && p.published);
  const hariverProject = data.projects?.find(p => (p.id === 'hariver-studio' || p.slug === 'hariver-gym-danava-studio' || p.slug === 'hariver-studio') && p.published);

  async function submitBrief(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');
    const form = e.currentTarget;
    const f = new FormData(form);
    const payload = {
      name: String(f.get('name') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      email: String(f.get('email') || '').trim(),
      service: `[Làm Website] ${String(f.get('websiteType') || 'Website & Landing Page')}`,
      message: String(f.get('message') || '').trim()
    };

    try {
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        setStatusMsg(resJson.message || 'Yêu cầu làm website của bạn đã được ghi nhận. DANAVA sẽ liên hệ tư vấn trong 24 giờ.');
        form.reset();
        return;
      }
      throw new Error(resJson.error || 'Lỗi gửi yêu cầu.');
    } catch {
      const body = `Họ tên: ${payload.name}\nSố điện thoại: ${payload.phone}\nEmail: ${payload.email}\nLoại website: ${payload.service}\n\nYêu cầu chi tiết: ${payload.message}`;
      window.location.href = `mailto:${data.email}?subject=${encodeURIComponent('Yêu cầu thiết kế Website DANAVA')}&body=${encodeURIComponent(body)}`;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main" className="website-service-page">
      {/* 1. HERO CHIA ĐÔI NỘI DUNG VÀ ẢNH WEBSITE THẬT TRÊN DESKTOP/MOBILE */}
      <section className="website-hero-split-section">
        <div className="website-hero-atmosphere" aria-hidden="true">
          <div className="website-radial-glow" />
          <div className="website-grid-pattern" />
        </div>

        <div className="website-hero-split-container">
          {/* Cột trái: Nội dung & CTA */}
          <div className="website-hero-copy">
            <nav aria-label="Breadcrumb" className="page-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <span className="breadcrumb-separator" aria-hidden="true"> / </span>
              <Link href="/giai-phap/">Giải pháp</Link>
              <span className="breadcrumb-separator" aria-hidden="true"> / </span>
              <span className="breadcrumb-current" aria-current="page">Website &amp; Landing Page</span>
            </nav>

            <p className="eyebrow">
              <span className="status-dot" aria-hidden="true" /> DANAVA SOLUTIONS · KHÔNG GIAN SỐ DOANH NGHIỆP
            </p>

            <h1 className="website-hero-title">
              Thiết kế Website &amp;<br /><em>Landing Page chuẩn nhận diện.</em>
            </h1>

            <p className="website-hero-lead">
              Xây dựng không gian số độc quyền thể hiện trọn vẹn bản sắc thương hiệu, tải trang siêu tốc, hiển thị hoàn hảo trên điện thoại và tối ưu chuyển đổi khách hàng tiềm năng 24/7.
            </p>

            <div className="website-hero-actions">
              <Link className="button website-cta-primary" href="/lien-he/?service=Website+%26+Landing+Page">
                Gửi yêu cầu làm website <span>↗</span>
              </Link>
              <a className="button website-cta-secondary" href="#cac-loai-website">
                Khám phá các loại website <span>↓</span>
              </a>
            </div>

            <div className="website-hero-highlights">
              <div className="highlight-tag"><span>✓</span> Thiết kế độc quyền</div>
              <div className="highlight-tag"><span>✓</span> Tương thích 100% Mobile</div>
              <div className="highlight-tag"><span>✓</span> Chuẩn SEO On-page</div>
            </div>
          </div>

          {/* Cột phải: Ảnh website thật */}
          <div className="website-hero-visual">
            <div className="website-cyan-glow" aria-hidden="true" />
            <div className="website-mockup-frame">
              <div className="mockup-chrome-bar">
                <div className="mockup-dots" aria-hidden="true">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="mockup-url-pill">
                  <span className="mockup-lock" aria-hidden="true">🔒</span>
                  <span>huepilates.danava.vn</span>
                  <span className="mockup-live-badge">DỰ ÁN THỰC TẾ</span>
                </div>
              </div>
              <div className="mockup-screen-wrap">
                <img
                  src="/assets/verified/hue-pilates.webp"
                  alt="Ảnh chụp giao diện website Huế Pilates & Yoga do DANAVA thiết kế"
                  width={1000}
                  height={650}
                  loading="eager"
                />
                <div className="website-visual-badge">
                  <strong>Dự án Huế Pilates &amp; Yoga</strong>
                  <small>Giao diện nhận diện &amp; đặt lịch trải nghiệm</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRÌNH BÀY CÁC LOẠI WEBSITE */}
      <section className="section website-types-section" id="cac-loai-website" aria-label="Các loại website DANAVA thiết kế">
        <div className="section-kicker">
          <span>01 / MÔ HÌNH WEBSITE</span>
          <span>CHỌN ĐÚNG LOẠI HÌNH PHÙ HỢP VỚI MỤC TIÊU</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">DANH MỤC GIẢI PHÁP WEB</p>
            <h2>Mỗi mô hình.<br /><em>Một kiến trúc chuyển đổi riêng.</em></h2>
          </div>
          <p>Tùy theo giai đoạn phát triển và đối tượng khách hàng mục tiêu, chúng tôi tư vấn cấu trúc website tối ưu nhất cho bạn.</p>
        </div>

        <div className="website-types-grid">
          {/* Loại 1: Website Thương Hiệu */}
          <article className="website-type-card">
            <div className="type-card-head">
              <span className="type-num">01</span>
              <span className="type-kicker">ĐỊNH VỊ THƯƠNG HIỆU</span>
              <h3>Website Doanh Nghiệp &amp; Trung Tâm Wellness</h3>
            </div>
            <p className="type-desc">
              Không gian số chuyên nghiệp giới thiệu quy mô cơ sở, triết lý hoạt động, dịch vụ cốt lõi và khẳng định vị thế uy tín trên thị trường.
            </p>
            <div className="type-target-box">
              <strong>🎯 Phù hợp nhất cho:</strong>
              <span>Phòng Gym cao cấp, Trung tâm Yoga, Studio Pilates, Thẩm mỹ viện &amp; Doanh nghiệp dịch vụ.</span>
            </div>
            <ul className="type-feature-list">
              <li>Giao diện sang trọng, bố cục hài hòa chuẩn nhận diện</li>
              <li>Trình diễn hình ảnh không gian cơ sở chất lượng cao</li>
              <li>Bảng giá dịch vụ và hồ sơ đội ngũ chuyên gia</li>
              <li>Tối ưu trải nghiệm đọc trên điện thoại và máy tính bảng</li>
            </ul>
          </article>

          {/* Loại 2: Landing Page Chiến Dịch */}
          <article className="website-type-card">
            <div className="type-card-head">
              <span className="type-num">02</span>
              <span className="type-kicker">TỐI ƯU CHUYỂN ĐỔI</span>
              <h3>Landing Page Chiến Dịch &amp; Thu Hút Lead</h3>
            </div>
            <p className="type-desc">
              Trang đích chuyên sâu phục vụ các chiến dịch chạy quảng cáo Facebook/Google/TikTok: ra mắt gói tập mới, khai trương chi nhánh hoặc đăng ký sự kiện.
            </p>
            <div className="type-target-box">
              <strong>🎯 Phù hợp nhất cho:</strong>
              <span>Chương trình ưu đãi thẻ tập, ra mắt khóa học mới, hội thảo workshop và tour du lịch retreat.</span>
            </div>
            <ul className="type-feature-list">
              <li>Cấu trúc tập trung vào 1 lời kêu gọi hành động duy nhất</li>
              <li>Tốc độ tải trang cực nhanh (dưới 1.5 giây) không rơi rớt khách</li>
              <li>Biểu mẫu đăng ký nhận ưu đãi thông minh, chống spam</li>
              <li>Tích hợp mã theo dõi Facebook Pixel, TikTok Pixel &amp; Google Tag</li>
            </ul>
          </article>

          {/* Loại 3: Website Đặt Lịch & Giới Thiệu Lớp */}
          <article className="website-type-card">
            <div className="type-card-head">
              <span className="type-num">03</span>
              <span className="type-kicker">ĐẶT LỊCH TRỰC TUYẾN</span>
              <h3>Website Thời Khóa Biểu &amp; Đặt Lớp Online</h3>
            </div>
            <p className="type-desc">
              Tích hợp thời khóa biểu trực quan, hồ sơ huấn luyện viên/giáo viên và cho phép học viên chủ động đăng ký buổi tập thử hoặc lớp học định kỳ.
            </p>
            <div className="type-target-box">
              <strong>🎯 Phù hợp nhất cho:</strong>
              <span>Yoga Studio, Pilates Reformer, lớp nhảy Dance, CLB võ thuật và trung tâm đào tạo kỹ năng.</span>
            </div>
            <ul className="type-feature-list">
              <li>Hiển thị lịch lớp theo tuần, ca sáng/chiều/tối sinh động</li>
              <li>Giới hạn số lượng chỗ trống mỗi buổi lớp</li>
              <li>Học viên nhận email xác nhận lịch tập tự động</li>
              <li>Đồng bộ kết nối cùng phần mềm quản lý DANAVA Studio</li>
            </ul>
          </article>

          {/* Loại 4: Website Bán Hàng & Thương Mại Tinh Gọn */}
          <article className="website-type-card">
            <div className="type-card-head">
              <span className="type-num">04</span>
              <span className="type-kicker">THƯƠNG MẠI TINH GỌN</span>
              <h3>Website Bán Thẻ Gói Tập &amp; Sản Phẩm Wellness</h3>
            </div>
            <p className="type-desc">
              Kênh bán hàng trực tuyến cho phép khách hàng chọn mua thẻ hội viên, dụng cụ tập luyện thể thao, quần áo tập hoặc thực phẩm dinh dưỡng lành mạnh.
            </p>
            <div className="type-target-box">
              <strong>🎯 Phù hợp nhất cho:</strong>
              <span>Bán thẻ tập trực tuyến, bán thảm yoga, thực phẩm chức năng, trà thảo mộc &amp; phụ kiện thể thao.</span>
            </div>
            <ul className="type-feature-list">
              <li>Danh mục sản phẩm, bộ lọc theo giá và loại hình</li>
              <li>Thanh toán chuyển khoản quét mã VietQR tự động khớp đơn</li>
              <li>Quản lý đơn hàng, thông tin giao nhận rõ ràng</li>
              <li>Hệ thống CMS cập nhật tồn kho và giá bán dễ dàng</li>
            </ul>
          </article>
        </div>
      </section>

      {/* 3. PHẠM VI BÀN GIAO CỤ THỂ */}
      <section className="section website-scope-section" id="pham-vi-ban-giao" aria-label="Phạm vi bàn giao khi làm website cùng DANAVA">
        <div className="section-kicker">
          <span>02 / TIÊU CHUẨN SẢN PHẨM</span>
          <span>CAM KẾT CHẤT LƯỢNG KHI BÀN GIAO</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">PHẠM VI BÀN GIAO</p>
            <h2>Rõ ràng từng hạng mục.<br /><em>Bạn sở hữu toàn bộ sản phẩm.</em></h2>
          </div>
          <p>Mỗi dự án website được nghiệm thu minh bạch theo danh sách tiêu chuẩn kỹ thuật nghiêm ngặt trước khi đi vào hoạt động chính thức.</p>
        </div>

        <div className="scope-cards-grid">
          <div className="scope-card">
            <span className="scope-icon">🎨</span>
            <h4>Thiết Kế UI/UX Độc Quyền</h4>
            <p>Bản vẽ giao diện được thiết kế riêng theo màu sắc và cá tính thương hiệu của bạn, tuyệt đối không dùng theme có sẵn rập khuôn.</p>
          </div>

          <div className="scope-card">
            <span className="scope-icon">📱</span>
            <h4>Chuẩn 100% Thiết Bị Di Động</h4>
            <p>Nguyên lý Mobile-First bảo đảm website hiển thị sắc nét, nút bấm vừa vặn ngón tay trên mọi dòng điện thoại thông minh và máy tính bảng.</p>
          </div>

          <div className="scope-card">
            <span className="scope-icon">⚡</span>
            <h4>Tốc Độ Tải Siêu Nhanh &amp; Bảo Mật</h4>
            <p>Mã nguồn Next.js/React hiện đại, hình ảnh nén WebP thế hệ mới, tích hợp chứng chỉ bảo mật SSL HTTPS miễn phí.</p>
          </div>

          <div className="scope-card">
            <span className="scope-icon">🔍</span>
            <h4>Cấu Trúc Chuẩn SEO Google</h4>
            <p>Thiết lập đầy đủ thẻ Meta, OpenGraph, Schema JSON-LD doanh nghiệp và Sitemap XML giúp website nhanh chóng xuất hiện trên Google.</p>
          </div>

          <div className="scope-card">
            <span className="scope-icon">🛠️</span>
            <h4>Hệ Thống CMS Tiếng Việt Dễ Dùng</h4>
            <p>Hệ thống quản trị trực quan giúp bạn và nhân viên dễ dàng cập nhật bài viết, bảng giá dịch vụ và hình ảnh mà không cần biết code.</p>
          </div>

          <div className="scope-card">
            <span className="scope-icon">📦</span>
            <h4>Bàn Giao Mã Nguồn &amp; Bảo Hành</h4>
            <p>Bàn giao toàn bộ mã nguồn, quyền sở hữu tên miền, tài khoản quản trị và cam kết bảo hành kỹ thuật trọn đời trong quá trình lưu trữ.</p>
          </div>
        </div>
      </section>

      {/* 4. QUY TRÌNH: NHẬN BRIEF → THIẾT KẾ → NGHIỆM THU → BÀN GIAO */}
      <section className="section website-process-section" id="quy-trinh" aria-label="Quy trình triển khai dịch vụ website tại DANAVA">
        <div className="section-kicker">
          <span>03 / LỘ TRÌNH THỰC HIỆN</span>
          <span>4 GIAI ĐOẠN RÕ RÀNG TRONG 7 - 14 NGÀY</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">QUY TRÌNH ĐỒNG HÀNH</p>
            <h2>Từ ý tưởng ban đầu<br /><em>đến sản phẩm số hoàn chỉnh.</em></h2>
          </div>
          <p>Mỗi bước đi đều có sự đồng thuận giữa hai bên, giúp bạn hoàn toàn an tâm về tiến độ và chất lượng sản phẩm.</p>
        </div>

        <div className="website-process-steps">
          {/* Bước 1 */}
          <div className="process-step-item">
            <div className="step-badge-col">
              <span className="step-circle">01</span>
              <div className="step-line" aria-hidden="true" />
            </div>
            <div className="step-content-col">
              <span className="step-phase">GIAI ĐOẠN 01</span>
              <h3>Nhận Brief &amp; Tư Vấn Cấu Trúc</h3>
              <p>Lắng nghe bài toán kinh doanh, khảo sát đối thủ và phong cách thương hiệu. Lập sơ đồ cấu trúc trang (sitemap) và thống nhất các tính năng cần có.</p>
              <div className="step-meta">Thời gian dự kiến: 1 – 2 ngày làm việc</div>
            </div>
          </div>

          {/* Bước 2 */}
          <div className="process-step-item">
            <div className="step-badge-col">
              <span className="step-circle">02</span>
              <div className="step-line" aria-hidden="true" />
            </div>
            <div className="step-content-col">
              <span className="step-phase">GIAI ĐOẠN 02</span>
              <h3>Thiết Kế Giao Diện UI/UX</h3>
              <p>Lên bản vẽ đồ họa chi tiết từng màn hình desktop và mobile. Gửi khách hàng duyệt giao diện, phối màu và tinh chỉnh theo góp ý trước khi dựng code.</p>
              <div className="step-meta">Thời gian dự kiến: 3 – 5 ngày làm việc</div>
            </div>
          </div>

          {/* Bước 3 */}
          <div className="process-step-item">
            <div className="step-badge-col">
              <span className="step-circle">03</span>
              <div className="step-line" aria-hidden="true" />
            </div>
            <div className="step-content-col">
              <span className="step-phase">GIAI ĐOẠN 03</span>
              <h3>Lập Trình &amp; Nghiệm Thu Tính Năng</h3>
              <p>Lập trình mã nguồn sạch, tối ưu hóa tốc độ và tương thích di động. Cùng khách hàng nghiệm thu trực tiếp toàn bộ luồng gửi form, hiển thị và nội dung trên bản chạy thử.</p>
              <div className="step-meta">Thời gian dự kiến: 3 – 5 ngày làm việc</div>
            </div>
          </div>

          {/* Bước 4 */}
          <div className="process-step-item">
            <div className="step-badge-col">
              <span className="step-circle">04</span>
            </div>
            <div className="step-content-col">
              <span className="step-phase">GIAI ĐOẠN 04</span>
              <h3>Bàn Giao, Trỏ Tên Miền &amp; Vận Hành</h3>
              <p>Trỏ tên miền chính thức, cấu hình bảo mật SSL, bàn giao tài khoản quản trị CMS và cung cấp tài liệu hướng dẫn nhân viên tự cập nhật thông tin dễ dàng.</p>
              <div className="step-meta">Thời gian dự kiến: 1 – 2 ngày · Kích hoạt bảo hành</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DỰ ÁN ĐÃ DUYỆT (APPROVED REAL PROJECTS) */}
      {(hueProject || hariverProject) && (
        <section className="section website-cases-section" aria-label="Các dự án website đã duyệt và triển khai thực tế">
          <div className="section-kicker">
            <span>04 / DỰ ÁN THỰC TẾ</span>
            <span>HỒ SƠ TRIỂN KHAI ĐÃ ĐƯỢC DUYỆT</span>
          </div>

          <div className="intro-heading">
            <div>
              <p className="eyebrow">DẪN CHỨNG THỰC TẾ</p>
              <h2>Những không gian số<br /><em>do DANAVA phát triển.</em></h2>
            </div>
            <Link className="text-link" href="/du-an/">Xem tất cả dự án ↗</Link>
          </div>

          <div className="website-cases-grid">
            {hueProject && (
              <Link href={`/du-an/${hueProject.slug}/`} className="website-case-card">
                <div className="case-media">
                  <img src={hueProject.image} alt={hueProject.client || hueProject.title} loading="lazy" />
                  <span className="case-badge">{hueProject.category}</span>
                </div>
                <div className="case-info">
                  <span className="case-client">{hueProject.client}</span>
                  <h4>{hueProject.title}</h4>
                  <p>{hueProject.summary}</p>
                  <span className="case-read-btn">Xem chi tiết hồ sơ ↗</span>
                </div>
              </Link>
            )}

            {hariverProject && (
              <Link href={`/du-an/${hariverProject.slug}/`} className="website-case-card">
                <div className="case-media">
                  <img src={hariverProject.image} alt={hariverProject.client || hariverProject.title} loading="lazy" />
                  <span className="case-badge">{hariverProject.category}</span>
                </div>
                <div className="case-info">
                  <span className="case-client">{hariverProject.client}</span>
                  <h4>{hariverProject.title}</h4>
                  <p>{hariverProject.summary}</p>
                  <span className="case-read-btn">Xem chi tiết hồ sơ ↗</span>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* 6. FAQ CHUYÊN SÂU VỀ DỊCH VỤ WEBSITE */}
      <section className="section website-faq-section" aria-label="Câu hỏi thường gặp về dịch vụ thiết kế website">
        <div className="section-kicker">
          <span>05 / GIẢI ĐÁP BĂN KHOĂN</span>
          <span>NHỮNG ĐIỀU BẠN CẦN BIẾT TRƯỚC KHI LÀM WEB</span>
        </div>

        <div className="intro-heading">
          <div>
            <p className="eyebrow">HỎI ĐÁP DỊCH VỤ</p>
            <h2>Giải đáp thắc mắc<br /><em>minh bạch &amp; chi tiết.</em></h2>
          </div>
          <p>Tất cả các câu hỏi phổ biến về thời gian, chi phí, quyền sở hữu và chế độ bảo hành của DANAVA.</p>
        </div>

        <div className="website-faq-accordion">
          {[
            {
              q: 'Thời gian thiết kế và hoàn thiện một website mất bao lâu?',
              a: 'Thông thường từ 7 đến 14 ngày làm việc. Thời gian cụ thể phụ thuộc vào số lượng trang, tính năng đặc thù và tốc độ cung cấp tư liệu hình ảnh, nội dung từ phía doanh nghiệp.'
            },
            {
              q: 'Sau khi bàn giao, tôi có thể tự thay đổi bài viết và hình ảnh được không?',
              a: 'Hoàn toàn được. DANAVA cung cấp hệ thống quản trị nội dung CMS bằng tiếng Việt trực quan, bạn và nhân sự có thể tự đăng bài viết mới, cập nhật bảng giá hay đổi hình ảnh chỉ với thao tác đơn giản.'
            },
            {
              q: 'Chi phí duy trì website hàng năm gồm những khoản nào?',
              a: 'Chỉ bao gồm 2 khoản duy nhất theo giá nhà cung cấp: Phí duy trì tên miền (domain) và máy chủ lưu trữ (hosting). DANAVA không thu bất kỳ khoản phí bản quyền định kỳ vô lý nào.'
            },
            {
              q: 'Website có hiển thị đẹp và tải nhanh trên điện thoại không?',
              a: '100% website do DANAVA xây dựng đều tuân thủ nguyên tắc Mobile-First, tối ưu hóa tốc độ tải trang dưới 2 giây và hình ảnh chuẩn WebP, đảm bảo trải nghiệm lướt web mượt mà trên mọi thiết bị di động.'
            },
            {
              q: 'Chế độ bảo hành và hỗ trợ sau khi bàn giao như thế nào?',
              a: 'Chúng tôi bảo hành kỹ thuật trọn đời cho toàn bộ lỗi phát sinh từ mã nguồn trong suốt thời gian website vận hành trên máy chủ lưu trữ do DANAVA quản lý, hỗ trợ kỹ thuật nhanh chóng khi cần.'
            }
          ].map(faq => (
            <details key={faq.q} className="website-faq-item">
              <summary>
                <span>{faq.q}</span>
                <span className="faq-toggle-icon" aria-hidden="true">+</span>
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. CTA & FORM NHẬN BRIEF TRỰC TIẾP TẠI CHỖ */}
      <section className="section website-brief-section" id="gui-yeu-cau" aria-label="Gửi yêu cầu làm website cho DANAVA">
        <div className="website-brief-container">
          <div className="brief-copy-col">
            <p className="eyebrow"><span className="status-dot" /> KHỞI ĐẦU KHÔNG GIAN SỐ</p>
            <h2>Sẵn sàng nâng tầm<br /><em>hiện diện thương hiệu?</em></h2>
            <p className="brief-lead">
              Gửi yêu cầu thiết kế website ngay hôm nay để nhận tư vấn cấu trúc, đề xuất ý tưởng giao diện và báo giá minh bạch theo đúng quy mô của bạn.
            </p>

            <div className="brief-perks">
              <div className="perk-item">
                <span className="perk-check">✓</span>
                <div>
                  <strong>Tư vấn cấu trúc &amp; giao diện miễn phí:</strong>
                  <span>Phân tích bài toán thương hiệu trước khi ký hợp đồng.</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-check">✓</span>
                <div>
                  <strong>Báo giá trọn gói minh bạch:</strong>
                  <span>Không phát sinh chi phí ẩn trong suốt quá trình triển khai.</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-check">✓</span>
                <div>
                  <strong>Bảo hành kỹ thuật chu đáo:</strong>
                  <span>Đồng hành hỗ trợ vận hành và xử lý sự cố 24/7.</span>
                </div>
              </div>
            </div>

            <div className="brief-direct-hotline">
              <span>HOẶC TRAO ĐỔI NHANH QUA:</span>
              <div className="hotline-pills">
                <a href={`tel:${data.phone}`} className="hotline-btn">📞 {data.phone}</a>
                <a href={`mailto:${data.email}`} className="email-btn">✉️ {data.email}</a>
              </div>
            </div>
          </div>

          <div className="brief-form-col">
            {sent ? (
              <div className="form-success-card" role="status" aria-live="polite">
                <span className="success-badge">✓ TIẾP NHẬN YÊU CẦU</span>
                <h3>Cảm ơn bạn đã kết nối!</h3>
                <p>{statusMsg || 'Chuyên viên thiết kế web của DANAVA sẽ liên hệ lại với bạn trong 24 giờ.'}</p>
                <button type="button" className="button secondary" onClick={() => setSent(false)}>
                  Gửi yêu cầu khác ↗
                </button>
              </div>
            ) : (
              <form onSubmit={submitBrief} className="brief-form-box" aria-label="Biểu mẫu yêu cầu thiết kế website">
                <h3>Gửi yêu cầu làm website</h3>
                <p>Điền thông tin ngắn gọn để chúng tôi chuẩn bị phương án tốt nhất cho bạn.</p>

                <label>
                  <span>Họ và tên của bạn *</span>
                  <input name="name" required maxLength={150} placeholder="Ví dụ: Nguyễn Minh Tuấn" autoComplete="name" />
                </label>

                <div className="form-row-two">
                  <label>
                    <span>Số điện thoại *</span>
                    <input name="phone" type="tel" required maxLength={50} placeholder="0905 xxx xxx" autoComplete="tel" />
                  </label>
                  <label>
                    <span>Email liên hệ</span>
                    <input name="email" type="email" maxLength={200} placeholder="tuan@doanhnghiep.vn" autoComplete="email" />
                  </label>
                </div>

                <label>
                  <span>Loại hình website bạn cần làm</span>
                  <select name="websiteType" defaultValue="Website Thương Hiệu Doanh Nghiệp & Wellness">
                    <option value="Website Thương Hiệu Doanh Nghiệp & Wellness">Website Thương Hiệu Doanh Nghiệp &amp; Wellness</option>
                    <option value="Landing Page Chiến Dịch & Thu Hút Lead">Landing Page Chiến Dịch &amp; Tối Ưu Chuyển Đổi</option>
                    <option value="Website Đặt Lịch & Giới Thiệu Khóa Học / Lớp Tập">Website Thời Khóa Biểu &amp; Đặt Lớp Online</option>
                    <option value="Website Bán Thẻ Gói Tập & Sản Phẩm Wellness">Website Bán Hàng &amp; Thương Mại Tinh Gọn</option>
                    <option value="Yêu cầu thiết kế đặc thù khác">Yêu cầu thiết kế đặc thù khác</option>
                  </select>
                </label>

                <label>
                  <span>Ghi chú thêm về phong cách hoặc tính năng mong muốn</span>
                  <textarea name="message" rows={3} maxLength={3000} placeholder="Ví dụ: Cần website giới thiệu trung tâm Yoga tại Đà Nẵng, giao diện phong cách tối giản, có form đặt lịch học thử..." />
                </label>

                <button type="submit" className="button website-cta-primary brief-submit-btn" disabled={submitting}>
                  {submitting ? 'Đang gửi thông tin...' : 'Gửi yêu cầu làm website ↗'}
                </button>
                <small className="form-privacy-note">
                  Thông tin được bảo mật tuyệt đối theo <Link href="/chinh-sach-rieng-tu/">Chính sách riêng tư</Link> của DANAVA.
                </small>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

// -------------------------------------------------------------
// DỊCH VỤ MARKETING & MEDIA CHUYÊN SÂU THEO MỤC TIÊU CỦA KHÁCH
// -------------------------------------------------------------
export function MarketingServicePage({ service }: { service: Service }) {
  const { data } = useSite();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Lọc các dự án & bài viết thực tế đã duyệt từ CMS
  const hueProject = data.projects?.find(p => (p.id === 'hue-studio' || p.slug === 'hue-pilates-yoga-danava-studio' || p.slug === 'hue-studio') && p.published);
  const hariverProject = data.projects?.find(p => (p.id === 'hariver-studio' || p.slug === 'hariver-gym-danava-studio' || p.slug === 'hariver-studio') && p.published);
  const eventPost = data.posts?.find(p => p.slug === 'cam-on-team-tumy-cac-cau-lac-bo-yoga-da-dong-hanh-chuoi-su-kien-cong-nang-luong-05-05-tai-da-nang') || {
    title: 'Chuỗi sự kiện Cổng Năng Lượng & Soundbath Live Concert tại Đà Nẵng',
    slug: 'cam-on-team-tumy-cac-cau-lac-bo-yoga-da-dong-hanh-chuoi-su-kien-cong-nang-luong-05-05-tai-da-nang',
    image: '/assets/verified/post-13591.webp'
  };

  const marketingDirector = data.staff?.find(s => s.id === 'nam') || {
    name: 'Trần Văn Nam',
    role: 'Marketing Director',
    image: '/assets/legacy/tran-van-nam.webp'
  };

  async function submitBrief(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');
    const form = e.currentTarget;
    const f = new FormData(form);
    const payload = {
      name: String(f.get('name') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      email: String(f.get('email') || '').trim(),
      service: `[Marketing & Media] ${String(f.get('marketingGoal') || 'Tư vấn tổng thể')}`,
      message: String(f.get('message') || '').trim()
    };

    try {
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        setStatusMsg(resJson.message || 'Yêu cầu tư vấn Marketing của bạn đã được ghi nhận. Đội ngũ DANAVA sẽ liên hệ trong 24 giờ.');
        form.reset();
        return;
      }
      throw new Error(resJson.error || 'Lỗi gửi yêu cầu.');
    } catch {
      const body = `Họ tên: ${payload.name}\nSố điện thoại: ${payload.phone}\nEmail: ${payload.email}\nMục tiêu: ${payload.service}\n\nChi tiết hiện trạng: ${payload.message}`;
      window.location.href = `mailto:${data.email}?subject=${encodeURIComponent('Yêu cầu tư vấn Marketing & Media DANAVA')}&body=${encodeURIComponent(body)}`;
    } finally {
      setSubmitting(false);
    }
  }

  const faqItems = [
    {
      q: 'Doanh nghiệp có cần tự chuẩn bị hình ảnh và video không?',
      a: 'Không bắt buộc. Đội ngũ sản xuất hình ảnh của DANAVA sẽ trực tiếp xuống cơ sở để quay/chụp tư liệu thực tế (không gian, đội ngũ huấn luyện viên, không khí lớp học/dịch vụ). Việc này đảm bảo tính chân thực tuyệt đối, không dùng ảnh stock giả tạo.'
    },
    {
      q: 'Ngân sách quảng cáo (Meta Ads / Google Ads) được tính và quản lý như thế nào?',
      a: 'Hoàn toàn minh bạch 100%. Quý doanh nghiệp đứng tên tài khoản quảng cáo và thanh toán trực tiếp qua thẻ quốc tế cho Facebook / Google theo đúng hóa đơn thực tế. DANAVA chỉ thu phí dịch vụ chiến lược, sản xuất nội dung và kỹ thuật tối ưu chuyển đổi, tuyệt đối không ăn chênh lệch ngân sách chạy.'
    },
    {
      q: 'Sau khi kết thúc hợp đồng, các kênh và tài nguyên truyền thông thuộc về ai?',
      a: 'Toàn bộ tài sản số bao gồm: Fanpage, Zalo Official Account, tài khoản quảng cáo, tệp khách hàng tiềm năng cùng 100% file ảnh/video gốc thuộc quyền sở hữu vĩnh viễn của doanh nghiệp. DANAVA bàn giao đầy đủ quyền quản trị và hướng dẫn đội ngũ nội bộ tiếp quản.'
    },
    {
      q: 'Bao lâu thì chiến dịch bắt đầu tạo ra khách hàng tiềm năng (leads)?',
      a: 'Đối với các chiến dịch quảng cáo địa phương kết hợp gói ưu đãi trải nghiệm (Trial Pass), khách hàng tiềm năng bắt đầu đổ về ngay trong tuần đầu tiên kể từ khi mẫu quảng cáo được duyệt và phát sóng. Với nhóm vận hành thương hiệu và nội dung tự nhiên, sự tăng trưởng tương tác và niềm tin sẽ tích lũy rõ nét sau 4–8 tuần.'
    },
    {
      q: 'Tại sao cần kết hợp cả Fanpage Facebook và Zalo OA trong cùng chiến lược?',
      a: 'Fanpage là "mặt tiền số" để thu hút khách hàng mới qua quảng cáo và nội dung tương tác. Còn Zalo OA là "kênh chốt đơn và chăm sóc thân thiết" tại Việt Nam: tỷ lệ mở tin nhắn qua Zalo lên đến trên 85%, giúp nhắc lịch hẹn trải nghiệm, gửi thông báo gia hạn và chăm sóc khách quen với chi phí gần như bằng 0.'
    }
  ];

  return (
    <main id="main" className="marketing-service-page">
      {/* 1. HERO BỐ CỤC EDITORIAL TRUYỀN THÔNG ĐA KÊNH */}
      <section className="marketing-hero-editorial-section">
        <div className="marketing-hero-atmosphere" aria-hidden="true">
          <div className="marketing-glow" />
          <div className="marketing-grid-lines" />
        </div>

        <div className="marketing-hero-container">
          <div className="marketing-hero-header">
            <nav aria-label="Breadcrumb" className="page-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <span className="breadcrumb-separator" aria-hidden="true"> / </span>
              <Link href="/giai-phap/">Giải pháp</Link>
              <span className="breadcrumb-separator" aria-hidden="true"> / </span>
              <span className="breadcrumb-current" aria-current="page">Marketing &amp; Media</span>
            </nav>

            <p className="eyebrow">
              <span className="status-dot" aria-hidden="true" /> DANAVA SOLUTIONS · CHIẾN LƯỢC TRUYỀN THÔNG &amp; TĂNG TRƯỞNG
            </p>

            <h1 className="marketing-hero-title">
              Marketing &amp; Media theo mục tiêu.<br />
              <em>Từ nhận diện đến chuyển đổi thực tế.</em>
            </h1>

            <p className="marketing-hero-lead">
              Không chạy theo số liệu tiếp cận ảo. DANAVA đồng hành cùng doanh nghiệp và phòng tập qua 3 mục tiêu rõ ràng: định hình <strong>nhận diện thương hiệu</strong>, duy trì <strong>vận hành kênh liên tục</strong> và tối ưu <strong>tạo khách tiềm năng</strong> — kết nối nhịp nhàng giữa Content, Fanpage, Video, Quảng cáo và Zalo OA.
            </p>

            <div className="marketing-pillars-pills" aria-label="5 Thành tố & 3 Mục tiêu cốt lõi">
              <span className="pillar-pill"><b>3 Mục tiêu:</b> Nhận diện · Vận hành · Chuyển đổi</span>
              <span className="pillar-pill"><b>5 Công cụ:</b> Content · Fanpage · Video · Ads · Zalo OA</span>
              <span className="pillar-pill verified-pill">✓ 100% KPI đã xác nhận</span>
            </div>

            <div className="marketing-hero-actions">
              <Link className="button marketing-cta-primary" href={`/lien-he/?service=${encodeURIComponent('Marketing & Truyền thông')}`}>
                Nhận tư vấn kế hoạch Marketing ↗
              </Link>
              <a className="button marketing-cta-secondary" href="#muc-tieu-marketing">
                Xem 3 nhóm mục tiêu ↓
              </a>
            </div>
          </div>

          {/* Khối Editorial Visual: Ảnh chiến dịch thật & Trích dẫn chuyên môn */}
          <div className="marketing-hero-visual-card">
            <div className="marketing-campaign-artwork">
              <img
                src="/assets/legacy/marketing.webp"
                alt="Chiến lược Marketing và Truyền thông số DANAVA"
                loading="eager"
              />
              <div className="campaign-tag-overlay">
                <span className="tag-kicker">EDITORIAL INSIGHT</span>
                <span className="tag-title">Chiến dịch truyền thông gắn liền với thực địa</span>
              </div>
            </div>

            <div className="marketing-director-quote">
              <img
                className="director-avatar"
                src={marketingDirector.image || '/assets/legacy/tran-van-nam.webp'}
                alt={marketingDirector.name}
                loading="lazy"
              />
              <div className="quote-text">
                <p>
                  &ldquo;Truyền thông bền vững không đến từ chiêu trò giật gân, mà đến từ sự chân thực của dịch vụ và trải nghiệm chăm sóc khách hàng nhất quán qua từng điểm chạm.&rdquo;
                </p>
                <cite>
                  <strong>{marketingDirector.name}</strong> · {marketingDirector.role} DANAVA
                </cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageAnchor />

      {/* 2. BA KHỐI MỤC TIÊU CỐT LÕI CỦA KHÁCH HÀNG (EDITORIAL SECTIONS) */}
      <section className="section marketing-goals-section" id="muc-tieu-marketing">
        <div className="editorial-section-intro">
          <p className="eyebrow">BA MỤC TIÊU CHIẾN LƯỢC</p>
          <h2>Chọn đúng điểm tựa.<br /><em>Phát triển đúng mục tiêu.</em></h2>
          <p className="section-subtext">
            Mỗi giai đoạn kinh doanh đòi hỏi một trọng tâm truyền thông khác nhau. Thay vì dàn trải nguồn lực, chúng tôi thiết kế giải pháp tập trung chính xác vào bài toán bạn cần giải quyết ngay hôm nay.
          </p>
        </div>

        <div className="editorial-goals-stack">
          {/* MỤC TIÊU 01: NHẬN DIỆN THƯƠNG HIỆU */}
          <article className="editorial-goal-card" id="nhan-dien-thuong-hieu">
            <div className="goal-card-header">
              <div className="goal-meta">
                <span className="goal-number">MỤC TIÊU 01</span>
                <span className="goal-scope-tag">ĐỊNH HÌNH DẤU ẤN SỐ</span>
              </div>
              <h3>Nhận diện thương hiệu chuẩn mực &amp; chuyên nghiệp</h3>
              <p className="goal-description">
                Dành cho cơ sở, phòng tập mới mở hoặc thương hiệu cần tái cấu trúc hình ảnh. Xây dựng bản sắc thị giác và tiếng nói thương hiệu nhất quán, giúp khách hàng nhận biết và tin tưởng ngay từ lần chạm đầu tiên.
              </p>
            </div>

            <div className="channel-badges-row" aria-label="Các kênh và công cụ chủ lực">
              <span className="channel-badge badge-fanpage">Fanpage Facebook</span>
              <span className="channel-badge badge-video">Video Reels &amp; Shorts</span>
              <span className="channel-badge badge-content">Nội dung định vị</span>
              <span className="channel-badge badge-zalo">Zalo OA Xác Thực</span>
              <span className="channel-badge badge-web">Website Đồng Bộ</span>
            </div>

            <div className="goal-body-grid">
              {/* Vai trò của 5 công cụ trong Nhận diện */}
              <div className="goal-tools-analysis">
                <h4>Vai trò của các công cụ trong khối Nhận diện</h4>
                <dl className="editorial-tools-list">
                  <div>
                    <dt>Content định vị</dt>
                    <dd>Xây dựng tuyên ngôn giá trị cốt lõi, câu chuyện nhà sáng lập và cẩm nang giọng điệu (Brand Tone of Voice) đồng nhất.</dd>
                  </div>
                  <div>
                    <dt>Video &amp; Nhiếp ảnh thực tế</dt>
                    <dd>Ghi hình không gian tập luyện thực tế, clip giới thiệu đội ngũ HLV/chuyên gia, loại bỏ hoàn toàn hình ảnh stock vô hồn.</dd>
                  </div>
                  <div>
                    <dt>Fanpage &amp; Zalo OA</dt>
                    <dd>Chuẩn hóa bộ nhận diện đa nền tảng: Cover, Avatar, bài viết ghim định vị và trang Zalo OA đạt tích xác thực doanh nghiệp.</dd>
                  </div>
                </dl>
              </div>

              {/* Danh mục đầu việc cụ thể */}
              <div className="goal-deliverables-box">
                <h4>Ví dụ đầu việc bàn giao cụ thể</h4>
                <ul className="editorial-checklist">
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Bộ Brand Voice &amp; Trục nội dung 3 tháng đầu:</strong>
                      <span>Bảng hướng dẫn cách xưng hô, văn phong và thông điệp truyền tải.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Gói 40+ ảnh concept thực tế tại cơ sở:</strong>
                      <span>Chụp máy chuyên dụng, chỉnh màu theo tone nhận diện độc quyền.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>2–3 Video câu chuyện thương hiệu &amp; trải nghiệm:</strong>
                      <span>Định dạng ngang cho website/YouTube và dọc cho Reels/TikTok.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Bộ template thiết kế số độc quyền:</strong>
                      <span>Bàn giao file Canva/PSD cho nhân sự nội bộ dễ dàng đăng bài tiếp nối.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Case liên quan & Cam kết KPI */}
            <div className="goal-footer-strip">
              <div className="goal-case-inline">
                <span className="case-badge">CASE THỰC TẾ</span>
                <div className="case-content">
                  <strong>Huế Pilates &amp; Yoga &amp; Chuỗi sự kiện Cổng Năng Lượng Đà Nẵng:</strong>
                  <p>Sản xuất hình ảnh không gian sang trọng, kết nối bộ nhận diện số và truyền thông sự kiện soundbath kết nối hơn 100 học viên.</p>
                </div>
                {hueProject && (
                  <Link href={`/du-an/${hueProject.slug}/`} className="case-link-pill">
                    Xem dự án ↗
                  </Link>
                )}
              </div>

              <div className="goal-kpi-guarantee">
                <span className="kpi-tag">KPI ĐÃ XÁC NHẬN</span>
                <p>100% hình ảnh/video sản xuất tại cơ sở · Bàn giao 100% file gốc và bản quyền · Đúng tiến độ checklist nghiệm thu.</p>
              </div>

              <div className="goal-cta-action">
                <Link
                  className="button goal-btn"
                  href={`/lien-he/?service=${encodeURIComponent('Marketing & Truyền thông')}&goal=nhan-dien-thuong-hieu`}
                >
                  Tư vấn gói Nhận diện thương hiệu ↗
                </Link>
              </div>
            </div>
          </article>

          {/* MỤC TIÊU 02: VẬN HÀNH KÊNH LIÊN TỤC */}
          <article className="editorial-goal-card" id="van-hanh-kenh">
            <div className="goal-card-header">
              <div className="goal-meta">
                <span className="goal-number">MỤC TIÊU 02</span>
                <span className="goal-scope-tag">NUÔI DƯỠNG &amp; GẮN KẾT</span>
              </div>
              <h3>Vận hành kênh đều đặn &amp; xây dựng cộng đồng gắn bó</h3>
              <p className="goal-description">
                Dành cho doanh nghiệp bận rộn không có thời gian viết bài, fanpage thiếu bài đăng, tương tác nguội lạnh. Duy trì các kênh truyền thông luôn "sáng đèn", nuôi dưỡng niềm tin và gắn kết hội viên cũ.
              </p>
            </div>

            <div className="channel-badges-row" aria-label="Các kênh và công cụ chủ lực">
              <span className="channel-badge badge-fanpage">Fanpage Facebook</span>
              <span className="channel-badge badge-zalo">Zalo OA CSKH</span>
              <span className="channel-badge badge-video">Video Reels &amp; TikTok</span>
              <span className="channel-badge badge-content">Content Chuyên Môn</span>
            </div>

            <div className="goal-body-grid">
              {/* Vai trò của 5 công cụ trong Vận hành */}
              <div className="goal-tools-analysis">
                <h4>Vai trò của các công cụ trong khối Vận hành kênh</h4>
                <dl className="editorial-tools-list">
                  <div>
                    <dt>Fanpage Management</dt>
                    <dd>Giữ nhịp đăng tải đều đặn 3–4 bài/tuần, trực tương tác và phân luồng tin nhắn khách hàng trong khung giờ vàng.</dd>
                  </div>
                  <div>
                    <dt>Content Chuyên môn &amp; Chia sẻ</dt>
                    <dd>Chuỗi bài hướng dẫn kỹ thuật luyện tập, câu chuyện chuyển hóa của học viên, tips dinh dưỡng và giải đáp thắc mắc thực tế.</dd>
                  </div>
                  <div>
                    <dt>Short-form Video</dt>
                    <dd>Ghi lại nhịp điệu tập luyện chân thực tại studio, review không khí lớp học, kích thích hội viên check-in và chia sẻ.</dd>
                  </div>
                  <div>
                    <dt>Zalo OA chăm sóc 1-1</dt>
                    <dd>Gửi lịch lớp tuần, thông báo bảo lưu/gia hạn và chăm sóc khách quen với tỷ lệ đọc tin nhắn đạt trên 85%.</dd>
                  </div>
                </dl>
              </div>

              {/* Danh mục đầu việc cụ thể */}
              <div className="goal-deliverables-box">
                <h4>Ví dụ đầu việc bàn giao hàng tháng</h4>
                <ul className="editorial-checklist">
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Lên Kế hoạch nội dung (Content Calendar):</strong>
                      <span>Biên tập chi tiết chủ đề, hình ảnh và duyệt cùng khách hàng trước ngày 25 hàng tháng.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Sản xuất 12–16 bài viết chuyên sâu/tháng:</strong>
                      <span>Thiết kế đồ họa ảnh đơn hoặc carousel tương tác cao chuẩn nhận diện.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Dựng 4–6 short videos tối ưu di động:</strong>
                      <span>Định dạng 9:16 đăng chéo Facebook Reels, TikTok và YouTube Shorts.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Quản trị tương tác &amp; Báo cáo định kỳ:</strong>
                      <span>Phản hồi tin nhắn và gửi báo cáo số liệu tiếp cận tự nhiên (Organic Reach) hàng tháng.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Case liên quan & Cam kết KPI */}
            <div className="goal-footer-strip">
              <div className="goal-case-inline">
                <span className="case-badge">CASE THỰC TẾ</span>
                <div className="case-content">
                  <strong>Cộng đồng Yoga Club Vietnam &amp; Các đối tác studio:</strong>
                  <p>Vận hành nội dung chia sẻ kiến thức sống khỏe, kết nối các câu lạc bộ và giữ nhịp tương tác tự nhiên đều đặn suốt nhiều năm.</p>
                </div>
                <Link href="/kien-thuc/" className="case-link-pill">
                  Xem chuyên mục kiến thức ↗
                </Link>
              </div>

              <div className="goal-kpi-guarantee">
                <span className="kpi-tag">KPI ĐÃ XÁC NHẬN</span>
                <p>Tần suất cam kết: 100% số bài trong tháng · Phản hồi tin nhắn &lt; 15 phút giờ hành chính · Báo cáo minh bạch từ Meta Suite.</p>
              </div>

              <div className="goal-cta-action">
                <Link
                  className="button goal-btn"
                  href={`/lien-he/?service=${encodeURIComponent('Marketing & Truyền thông')}&goal=van-hanh-kenh`}
                >
                  Lên kế hoạch vận hành kênh định kỳ ↗
                </Link>
              </div>
            </div>
          </article>

          {/* MỤC TIÊU 03: TẠO KHÁCH TIỀM NĂNG & CHUYỂN ĐỔI */}
          <article className="editorial-goal-card" id="tao-khach-tiem-nang">
            <div className="goal-card-header">
              <div className="goal-meta">
                <span className="goal-number">MỤC TIÊU 03</span>
                <span className="goal-scope-tag">CHUYỂN ĐỔI &amp; DOANH THU</span>
              </div>
              <h3>Tạo khách tiềm năng (Lead Gen) &amp; Tối ưu phễu chuyển đổi</h3>
              <p className="goal-description">
                Dành cho doanh nghiệp cần tìm kiếm học viên mới, thúc đẩy bán gói tập thử nghiệm hoặc khai trương chi nhánh. Nhắm đúng tệp khách hàng quanh khu vực, tối ưu chi phí trên từng số điện thoại/lịch hẹn thực tế.
              </p>
            </div>

            <div className="channel-badges-row" aria-label="Các kênh và công cụ chủ lực">
              <span className="channel-badge badge-ads">Quảng cáo Meta (FB/IG)</span>
              <span className="channel-badge badge-ads">Google Local Ads</span>
              <span className="channel-badge badge-zalo">Zalo OA Lead Funnel</span>
              <span className="channel-badge badge-web">Landing Page Chuyển Đổi</span>
            </div>

            <div className="goal-body-grid">
              {/* Vai trò của 5 công cụ trong Tạo khách */}
              <div className="goal-tools-analysis">
                <h4>Vai trò của các công cụ trong khối Tạo khách tiềm năng</h4>
                <dl className="editorial-tools-list">
                  <div>
                    <dt>Quảng cáo Meta &amp; Google Ads</dt>
                    <dd>Nhắm mục tiêu chuẩn xác theo bán kính 3–7km quanh cơ sở, độ tuổi và sở thích thực tế; kiểm soát ngân sách minh bạch hàng ngày.</dd>
                  </div>
                  <div>
                    <dt>Content chuyển đổi (Direct Response)</dt>
                    <dd>Xây dựng lời chào hàng thử nghiệm (Trial Offer) hấp dẫn, xóa bỏ rào cản tâm lý của người mới bắt đầu.</dd>
                  </div>
                  <div>
                    <dt>Zalo OA &amp; Kịch bản chốt hẹn</dt>
                    <dd>Phễu tự động hóa đón khách từ quảng cáo vào Zalo, gửi thông tin gói tập và nhắc lịch trải nghiệm 1-1 không lo trôi tin nhắn.</dd>
                  </div>
                  <div>
                    <dt>Landing Page siêu tốc</dt>
                    <dd>Trang đích thu thập thông tin đăng ký trong 10 giây, đồng bộ trực tiếp thông tin lead về điện thoại của tư vấn viên.</dd>
                  </div>
                </dl>
              </div>

              {/* Danh mục đầu việc cụ thể */}
              <div className="goal-deliverables-box">
                <h4>Ví dụ đầu việc bàn giao chuyển đổi</h4>
                <ul className="editorial-checklist">
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Đóng gói ưu đãi trải nghiệm (Trial Pass):</strong>
                      <span>Tạo gói trải nghiệm kích thích hành động (ví dụ: tập thử 3 buổi kèm đo chỉ số InBody).</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Cài đặt chiến dịch Meta Ads địa phương:</strong>
                      <span>A/B test 2–3 nhóm quảng cáo với hình ảnh/video thực tế tại phòng tập.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Kịch bản tư vấn chốt hẹn qua Messenger &amp; Zalo:</strong>
                      <span>Chuẩn bị bộ câu hỏi sàn lọc nhu cầu và kịch bản mời khách tới trực tiếp trải nghiệm.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    <div>
                      <strong>Tối ưu chi phí mỗi Lead (CPL) hàng tuần:</strong>
                      <span>Loại trừ tệp rác, điều chỉnh ngân sách theo ngày cao điểm để tối ưu hóa chi phí.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Case liên quan & Cam kết KPI */}
            <div className="goal-footer-strip">
              <div className="goal-case-inline">
                <span className="case-badge">CASE THỰC TẾ</span>
                <div className="case-content">
                  <strong>HARIVER GYM &amp; FITNESS CENTER:</strong>
                  <p>Kết nối chiến dịch tiếp cận hội viên quanh khu vực với hệ thống check-in và app hội viên DANAVA Studio.</p>
                </div>
                {hariverProject && (
                  <Link href={`/du-an/${hariverProject.slug}/`} className="case-link-pill">
                    Xem dự án ↗
                  </Link>
                )}
              </div>

              <div className="goal-kpi-guarantee">
                <span className="kpi-tag">KPI ĐÃ XÁC NHẬN</span>
                <p>Chi phí/Lead báo cáo thực từ Trình quản lý quảng cáo · Khách hàng đứng tên tài khoản và thanh toán trực tiếp · Sàng lọc lead rác.</p>
              </div>

              <div className="goal-cta-action">
                <Link
                  className="button goal-btn"
                  href={`/lien-he/?service=${encodeURIComponent('Marketing & Truyền thông')}&goal=tao-khach-tiem-nang`}
                >
                  Thiết lập chiến dịch tìm kiếm khách ↗
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 3. MA TRẬN 5 CÔNG CỤ CỐT LÕI (THE 5 MEDIA PILLARS MATRIX) */}
      <section className="section marketing-matrix-section">
        <div className="editorial-section-intro">
          <p className="eyebrow">HỆ THỐNG CÔNG CỤ ĐỒNG HÀNH</p>
          <h2>Năm trụ cột truyền thông.<br /><em>Một thể thống nhất.</em></h2>
          <p className="section-subtext">
            Mỗi công cụ đóng một vai trò chuyên biệt trong hành trình chuyển đổi từ người lạ thành khách hàng trung thành. Khi được phối hợp nhịp nhàng, sức mạnh của toàn bộ hệ sinh thái sẽ tăng lên gấp bội.
          </p>
        </div>

        <div className="matrix-table-wrapper" tabIndex={0} aria-label="Bảng so sánh vai trò 5 công cụ marketing">
          <table className="editorial-matrix-table">
            <thead>
              <tr>
                <th scope="col">Công cụ</th>
                <th scope="col">Kênh triển khai</th>
                <th scope="col">Vai trò cốt lõi</th>
                <th scope="col">Đầu việc điển hình</th>
                <th scope="col">Thước đo thực tế</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Content</strong></td>
                <td>Fanpage, Website, Kịch bản</td>
                <td>Định hình niềm tin &amp; giá trị chuyên môn</td>
                <td>Bài viết chuyên sâu, câu chuyện khách hàng, kịch bản video</td>
                <td>Thời gian đọc, phản hồi đồng cảm, lượng lưu bài</td>
              </tr>
              <tr>
                <td><strong>Fanpage</strong></td>
                <td>Facebook Page</td>
                <td>Mặt tiền số &amp; điểm kết nối hàng ngày</td>
                <td>Quản lý lịch đăng tuần, chăm sóc comment/inbox</td>
                <td>Tần suất đăng đúng hạn, tốc độ phản hồi &lt; 15 phút</td>
              </tr>
              <tr>
                <td><strong>Video</strong></td>
                <td>Reels, TikTok, YouTube</td>
                <td>Trực quan hóa không gian &amp; cảm xúc</td>
                <td>Quay phóng sự thực tế, hướng dẫn bài tập, review lớp học</td>
                <td>Lượt xem thực tế, tỷ lệ xem hết clip, lượng chia sẻ</td>
              </tr>
              <tr>
                <td><strong>Quảng cáo</strong></td>
                <td>Meta Ads, Google Search</td>
                <td>Mở rộng tệp khách hàng nhanh quanh khu vực</td>
                <td>Nhắm bán kính 3–5km, A/B testing mẫu quảng cáo</td>
                <td>Chi phí trên mỗi liên hệ thực (CPL), số lượng lead/tuần</td>
              </tr>
              <tr>
                <td><strong>Zalo OA</strong></td>
                <td>Zalo Official Account</td>
                <td>Chăm sóc 1-1 &amp; giữ chân khách hàng cũ</td>
                <td>Kịch bản chào tự động, menu tra cứu, gửi ZNS thông báo</td>
                <td>Tỷ lệ mở tin nhắn &gt; 85%, tỷ lệ hội viên gia hạn</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. QUY TRÌNH LÀM VIỆC NGẮN 4 BƯỚC (EDITORIAL WORKFLOW) */}
      <section className="section marketing-workflow-section">
        <div className="editorial-section-intro">
          <p className="eyebrow">QUY TRÌNH TINH GỌN 4 BƯỚC</p>
          <h2>Lộ trình rõ ràng.<br /><em>Kiểm soát ở từng giai đoạn.</em></h2>
          <p className="section-subtext">
            Từ lúc tiếp nhận bài toán đến khi chiến dịch vận hành trơn tru, mọi đầu việc đều có thời hạn, checklist cụ thể và người phụ trách minh bạch.
          </p>
        </div>

        <div className="workflow-steps-grid">
          <div className="workflow-step-card">
            <span className="step-badge">BƯỚC 01</span>
            <h4>Khảo sát &amp; Định vị mục tiêu</h4>
            <p>Đánh giá hiện trạng kênh, phân tích đối thủ trong khu vực và thống nhất mục tiêu ưu tiên (nhận diện, vận hành hay chuyển đổi).</p>
            <span className="step-timeline">Thời gian: 2–3 ngày làm việc</span>
          </div>

          <div className="workflow-step-card">
            <span className="step-badge">BƯỚC 02</span>
            <h4>Lập kế hoạch &amp; Content Calendar</h4>
            <p>Xây dựng trục nội dung, lịch biên tập chi tiết trong tháng, kịch bản quay/chụp và định mức ngân sách dự kiến.</p>
            <span className="step-timeline">Duyệt trước ngày 25 hàng tháng</span>
          </div>

          <div className="workflow-step-card">
            <span className="step-badge">BƯỚC 03</span>
            <h4>Tác nghiệp thực tế &amp; Kích hoạt</h4>
            <p>Đội ngũ DANAVA trực tiếp tới cơ sở quay chụp tư liệu, hoàn thiện bài đăng và kích hoạt chiến dịch quảng cáo địa phương.</p>
            <span className="step-timeline">Triển khai đều đặn hàng tuần</span>
          </div>

          <div className="workflow-step-card">
            <span className="step-badge">BƯỚC 04</span>
            <h4>Báo cáo số liệu &amp; Bàn giao tài sản</h4>
            <p>Gửi báo cáo số liệu thực tế xuất từ nền tảng, bàn giao 100% file gốc và họp đề xuất tinh chỉnh cho chu kỳ tiếp nối.</p>
            <span className="step-timeline">Báo cáo tuần &amp; Tổng kết tháng</span>
          </div>
        </div>
      </section>

      {/* 5. KHỐI CAM KẾT KPI THỰC TẾ & NGUYÊN TẮC MINH BẠCH */}
      <section className="section marketing-principles-section">
        <div className="principles-card">
          <div className="principles-header">
            <span className="badge-highlight">DANAVA STANDARD</span>
            <h3>Cam kết chỉ số thực tế &amp; Tôn trọng tài sản của khách hàng</h3>
            <p>
              Chúng tôi nói không với báo cáo reach ảo, không cam kết những con số vô căn cứ và tuyệt đối không ăn chênh lệch ngân sách quảng cáo.
            </p>
          </div>

          <div className="principles-grid">
            <div className="principle-item">
              <strong>Tài khoản &amp; Ngân sách chính chủ</strong>
              <p>Doanh nghiệp đứng tên tài khoản quảng cáo và trả tiền trực tiếp cho Meta/Google. Bạn nắm giữ toàn quyền kiểm soát chi tiêu.</p>
            </div>
            <div className="principle-item">
              <strong>Tư liệu thực địa 100%</strong>
              <p>Hình ảnh và video được sản xuất trực tiếp tại cơ sở của bạn, tôn trọng sự thật và giúp khách hàng có cảm nhận chân thực nhất.</p>
            </div>
            <div className="principle-item">
              <strong>Sở hữu tài nguyên trường tồn</strong>
              <p>Dù hợp đồng kết thúc, toàn bộ Fanpage, Zalo OA, kho ảnh/video gốc và tệp khách hàng đều thuộc quyền sở hữu vĩnh viễn của bạn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ CHUYÊN SÂU DỊCH VỤ MARKETING */}
      <section className="section marketing-faq-section" id="faq-marketing">
        <div className="editorial-section-intro">
          <p className="eyebrow">GIẢI ĐÁP THẮC MẮC</p>
          <h2>Những câu hỏi thường gặp.<br /><em>Minh bạch trước khi hợp tác.</em></h2>
        </div>

        <div className="marketing-faq-accordion">
          {faqItems.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`faq-row ${isOpen ? 'active' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="faq-toggle-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-panel" role="region">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FORM BRIEF TẠI CHỖ & LIÊN HỆ TRỰC TIẾP */}
      <section className="section marketing-brief-section" id="gui-yeu-cau-marketing">
        <div className="marketing-brief-container">
          <div className="brief-intro-copy">
            <p className="eyebrow">BẮT ĐẦU CHIẾN DỊCH</p>
            <h2>Cùng xây dựng kế hoạch<br /><em>phù hợp với cơ sở của bạn.</em></h2>
            <p>
              Hãy chia sẻ về hiện trạng cơ sở hoặc mục tiêu kinh doanh sắp tới. Đội ngũ chiến lược của DANAVA sẽ nghiên cứu và liên hệ trao đổi phương án cụ thể trong 24 giờ.
            </p>

            <div className="brief-perks-list">
              <div className="perk-item">
                <span className="perk-bullet">✓</span>
                <div>
                  <strong>Khảo sát &amp; tư vấn định hướng miễn phí:</strong>
                  <span>Đánh giá sơ bộ hiện trạng kênh và gợi ý giải pháp phù hợp ngân sách.</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-bullet">✓</span>
                <div>
                  <strong>Báo giá chi tiết từng hạng mục:</strong>
                  <span>Không phát sinh chi phí ẩn trong suốt quá trình triển khai.</span>
                </div>
              </div>
            </div>

            <div className="brief-direct-hotline">
              <span>HOẶC KẾT NỐI TRỰC TIẾP VỚI ĐỘI NGŨ MARKETING:</span>
              <div className="hotline-pills">
                <a className="hotline-btn" href={`tel:${data.phone}`}>
                  📞 {data.phone}
                </a>
                <a className="email-btn" href={`mailto:${data.email}`}>
                  ✉️ {data.email}
                </a>
              </div>
            </div>
          </div>

          <div className="brief-form-box">
            <h3>Gửi yêu cầu tư vấn Marketing</h3>
            <p>Chọn mục tiêu bạn đang quan tâm nhất để chúng tôi chuẩn bị nội dung trao đổi sát thực tế:</p>

            {sent ? (
              <div className="form-success-card" role="status" aria-live="polite">
                <span className="success-badge">✓ ĐÃ TIẾP NHẬN YÊU CẦU</span>
                <h4>Cảm ơn bạn đã tin tưởng DANAVA!</h4>
                <p>{statusMsg || 'Chúng tôi sẽ xem xét thông tin và liên hệ lại trong thời gian sớm nhất.'}</p>
                <button type="button" className="button secondary" onClick={() => setSent(false)}>
                  Gửi yêu cầu khác ↗
                </button>
              </div>
            ) : (
              <form onSubmit={submitBrief} aria-label="Biểu mẫu yêu cầu tư vấn Marketing & Media">
                <label>
                  <span>Mục tiêu bạn muốn ưu tiên giải quyết *</span>
                  <select name="marketingGoal" defaultValue="Nhận diện thương hiệu mới (Cần xây dựng hình ảnh chuyên nghiệp)">
                    <option value="Nhận diện thương hiệu mới (Cần xây dựng hình ảnh chuyên nghiệp)">
                      Nhận diện thương hiệu mới (Định hình hình ảnh &amp; bản sắc)
                    </option>
                    <option value="Vận hành kênh & sản xuất nội dung đều đặn (Fanpage, Video, Zalo)">
                      Vận hành kênh đều đặn (Chăm sóc Fanpage, Video, Zalo OA)
                    </option>
                    <option value="Tạo khách tiềm năng & Chạy quảng cáo tìm học viên mới">
                      Tạo khách tiềm năng (Chạy Ads địa phương, thu Lead thử nghiệm)
                    </option>
                    <option value="Gói giải pháp Marketing & Truyền thông tổng thể">
                      Giải pháp tổng thể (Nhận diện + Vận hành + Chuyển đổi)
                    </option>
                    <option value="Nhu cầu marketing đặc thù khác">
                      Nhu cầu marketing đặc thù khác
                    </option>
                  </select>
                </label>

                <label>
                  <span>Họ và tên của bạn *</span>
                  <input name="name" required maxLength={120} placeholder="Ví dụ: Nguyễn Thành Nam" />
                </label>

                <label>
                  <span>Số điện thoại liên hệ (có Zalo) *</span>
                  <input name="phone" type="tel" required maxLength={40} placeholder="Ví dụ: 0905 123 456" />
                </label>

                <label>
                  <span>Email trao đổi</span>
                  <input name="email" type="email" maxLength={150} placeholder="email@doanhnghiep.vn" />
                </label>

                <label>
                  <span>Mô tả ngắn về cơ sở, phòng tập hoặc mục tiêu mong muốn</span>
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={2000}
                    placeholder="Ví dụ: Phòng tập Pilates sắp mở tại Hải Châu, cần bộ nhận diện hình ảnh và chiến dịch thu hút 50 học viên đầu tiên..."
                  />
                </label>

                <button className="button marketing-cta-primary brief-submit-btn" type="submit" disabled={submitting}>
                  {submitting ? 'Đang gửi yêu cầu…' : 'Gửi yêu cầu tư vấn chiến lược ↗'}
                </button>

                <small className="form-privacy-note">
                  Thông tin được bảo mật tuyệt đối theo <Link href="/chinh-sach-rieng-tu/">Chính sách riêng tư</Link> của DANAVA.
                </small>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 8. CÁC GIẢI PHÁP LIÊN QUAN TRONG HỆ SINH THÁI DANAVA */}
      <section className="section supplementary-solutions-block">
        <div className="supplementary-header">
          <h4>HỆ SINH THÁI GIẢI PHÁP DANAVA</h4>
          <p>Kết hợp Marketing cùng công nghệ phần mềm và không gian số để tối đa hóa hiệu quả vận hành.</p>
        </div>

        <div className="supplementary-grid">
          <Link href="/giai-phap/danava-studio/" className="supplementary-card">
            <div className="supp-media">
              <img src="/assets/verified/hariver.webp" alt="DANAVA Studio" loading="lazy" />
            </div>
            <div className="supp-content">
              <span className="supp-category">CÔNG NGHỆ QUẢN TRỊ</span>
              <h5>DANAVA Studio</h5>
              <p>Phần mềm quản lý hội viên, lịch lớp, check-in và bán gói tập kèm app thương hiệu riêng.</p>
              <span className="supp-link">Khám phá giải pháp Studio ↗</span>
            </div>
          </Link>

          <Link href="/giai-phap/thiet-ke-website/" className="supplementary-card">
            <div className="supp-media">
              <img src="/assets/verified/hue-pilates.webp" alt="Website & Landing Page" loading="lazy" />
            </div>
            <div className="supp-content">
              <span className="supp-category">KHÔNG GIAN SỐ</span>
              <h5>Website &amp; Landing Page</h5>
              <p>Thiết kế website và landing page tối ưu chuyển đổi, chuẩn SEO và tích hợp form thu lead.</p>
              <span className="supp-link">Xem chi tiết dịch vụ Web ↗</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

// -------------------------------------------------------------
// TEMPLATE GIẢI PHÁP DÙNG CHUNG CHO CÁC DỊCH VỤ KHÁC (DU LỊCH, CỘNG ĐỒNG)
// -------------------------------------------------------------
export function GeneralServicePage({ service }: { service: Service }) {
  const { data } = useSite();
  const s = service;

  return (
    <main id="main" className="general-service-page">
      <section className="service-general-hero">
        <div className="general-hero-atmosphere" aria-hidden="true" />
        <div className="general-hero-container">
          <div className="general-hero-copy">
            <nav aria-label="Breadcrumb" className="page-breadcrumb">
              <Link href="/">Trang chủ</Link>
              <span className="breadcrumb-separator" aria-hidden="true"> / </span>
              <Link href="/giai-phap/">Giải pháp</Link>
              <span className="breadcrumb-separator" aria-hidden="true"> / </span>
              <span className="breadcrumb-current" aria-current="page">{s.title}</span>
            </nav>
            <p className="eyebrow">DANAVA SOLUTIONS / GIẢI PHÁP ĐỒNG HÀNH</p>
            <h1>{s.title}</h1>
            <p className="general-hero-desc">{s.description}</p>
            <div className="general-hero-actions">
              <Link className="button website-cta-primary" href={`/lien-he/?service=${encodeURIComponent(s.title)}`}>
                Nhận tư vấn giải pháp ↗
              </Link>
              <a className="button website-cta-secondary" href="#pham-vi-giai-phap">
                Xem phạm vi thực hiện ↓
              </a>
            </div>
          </div>
          <div className="general-hero-visual">
            <div className="general-media-frame">
              <img src={servicePhotos[s.id] || '/assets/legacy/marketing.webp'} alt={s.title} loading="eager" />
            </div>
          </div>
        </div>
      </section>

      <PageAnchor />

      {/* Phạm vi giải pháp */}
      <section className="section detail-layout" id="pham-vi-giai-phap">
        <div>
          <p className="eyebrow">PHẠM VI ĐỒNG HÀNH</p>
          <h2>Từ bài toán thực tế.<br /><em>Đến kết quả đo lường.</em></h2>
          <div className="scope-list">
            {s.items.map((item, i) => (
              <div key={i}>
                <span>0{i + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="consult-card">
          <span>ĐỒNG HÀNH CÙNG DANAVA</span>
          <h3>Một giải pháp<br />may đo cho bạn.</h3>
          <p>Phạm vi công việc, tiến độ triển khai và chi phí được thống nhất chi tiết theo nhu cầu cụ thể của doanh nghiệp.</p>
          <Link className="button amber" href={`/lien-he/?service=${encodeURIComponent(s.title)}`}>
            Gửi yêu cầu tư vấn ↗
          </Link>
        </aside>
      </section>

      {/* Quy trình đồng hành 4 bước */}
      <section className="section process">
        <p className="eyebrow">CÁCH CHÚNG TÔI ĐỒNG HÀNH</p>
        <h2>Rõ ràng ở mỗi bước.</h2>
        <div>
          {['Lắng nghe nhu cầu', 'Đề xuất giải pháp', 'Triển khai và kiểm tra', 'Hướng dẫn và đồng hành'].map((x, i) => (
            <article key={x}>
              <span>0{i + 1}</span>
              <h3>{x}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ thường gặp */}
      <ServiceFAQ />

      {/* Các giải pháp liên quan khác */}
      <section className="section related-services">
        <p className="eyebrow">KHÁM PHÁ THÊM</p>
        <h2>Kết nối những khả năng.</h2>
        <div>
          {data.services.filter(x => x.id !== s.id).slice(0, 3).map(x => (
            <Link href={`/giai-phap/${x.slug}/`} key={x.id}>
              <span>{x.title}</span>
              <b>↗</b>
            </Link>
          ))}
        </div>
      </section>

      <ContactCTA />
    </main>
  );
}

export function ServicePage({ service }: { service: Service }) {
  const { data } = useSite();
  const s = data.services.find(x => x.id === service.id) || service;

  // 1. Nếu là DANAVA Studio: Sử dụng template chuyên sâu Studio
  if (s.id === 'studio' || s.slug === 'danava-studio') {
    return <StudioServicePage service={s} />;
  }

  // 2. Nếu là Dịch vụ Website & Landing Page: Sử dụng template chuyên sâu Website
  if (s.id === 'website' || s.slug === 'thiet-ke-website') {
    return <WebsiteServicePage service={s} />;
  }

  // 3. Nếu là Marketing & Truyền thông / Media: Sử dụng template chuyên sâu Marketing
  if (s.id === 'marketing' || s.slug === 'digital-marketing') {
    return <MarketingServicePage service={s} />;
  }

  // 4. Template giải pháp dùng chung cho các dịch vụ khác (Du lịch, Cộng đồng)
  return <GeneralServicePage service={s} />;
}

export function AboutPage() {
  const { data } = useSite();

  const milestones = [
    {
      year: '2021',
      title: 'Khởi đầu kết nối số & cộng đồng',
      summary: 'Thành lập và triển khai các giải pháp thiết kế website doanh nghiệp, marketing và đồng hành cùng các câu lạc bộ Yoga tại Đà Nẵng và miền Trung.'
    },
    {
      year: '2023',
      title: 'Chuẩn hóa hệ sinh thái đồng hành',
      summary: 'Quy tụ đội ngũ chuyên môn cốt lõi, hoàn thiện 5 mũi nhọn: Công nghệ quản trị, Website & Landing Page, Marketing & Media, Du lịch & Sự kiện, và Cộng đồng.'
    },
    {
      year: '2024',
      title: 'Dấu ấn Chuỗi sự kiện Cổng Năng Lượng',
      summary: 'Đồng hành tổ chức và bảo trợ truyền thông cho Soundbath Live Concert (05/05/2024 tại Đà Nẵng) cùng Team Tumy chữa lành bằng âm thanh và hơn 100 học viên, HLV Yoga.'
    },
    {
      year: '2026',
      title: 'Đột phá với nền tảng DANAVA Studio',
      summary: 'Hoàn thiện và triển khai thành công phần mềm DANAVA Studio cùng app hội viên di động mang thương hiệu riêng cho các đối tác tiêu biểu: HARIVER Gym và Huế Pilates & Yoga.'
    }
  ];

  const operatingPrinciples = [
    {
      num: '01',
      title: 'Thấu hiểu thực địa',
      desc: 'Chúng tôi trực tiếp xuống phòng tập, trải nghiệm ca tập giờ cao điểm và quy trình check-in tại quầy để xây dựng luồng thao tác thuận tiện nhất.'
    },
    {
      num: '02',
      title: 'Minh bạch số liệu',
      desc: 'Nói không với số liệu ảo và lời hứa viển vông. Mọi chi phí quảng cáo và chỉ số tăng trưởng đều được báo cáo trung thực từ hệ thống chính chủ.'
    },
    {
      num: '03',
      title: 'Tài sản thuộc về khách hàng',
      desc: 'Doanh nghiệp sở hữu vĩnh viễn mã nguồn website, ứng dụng di động, tài khoản quảng cáo và toàn bộ cơ sở dữ liệu hội viên.'
    },
    {
      num: '04',
      title: 'Đồng hành dài hạn',
      desc: 'Bàn giao đi liền đào tạo nhân sự tận nơi, bảo hành kỹ thuật và liên tục cập nhật tính năng mới theo sự mở rộng của cơ sở.'
    }
  ];

  return (
    <main id="main" className="about-editorial-page">
      {/* 1. HERO BỐ CỤC EDITORIAL - ĐỊNH VỊ DANAVA SOLUTIONS */}
      <section className="about-hero-section">
        <div className="about-hero-atmosphere" aria-hidden="true">
          <div className="about-glow" />
          <div className="about-grid-lines" />
        </div>

        <div className="about-hero-container">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <span className="breadcrumb-current" aria-current="page">Về DANAVA</span>
          </nav>

          <p className="eyebrow">
            <span className="status-dot" aria-hidden="true" /> DANAVA SOLUTIONS · ĐỊNH VỊ &amp; SỨ MỆNH ĐỒNG HÀNH
          </p>

          <h1 className="about-hero-title">
            Đồng hành bằng công nghệ.<br />
            <em>Gắn kết bằng giá trị thực.</em>
          </h1>

          <p className="about-hero-lead">
            DANAVA Solutions là tổ hợp công nghệ, truyền thông và trải nghiệm số tại Đà Nẵng và miền Trung. Chúng tôi tập trung giải quyết các bài toán vận hành thực tế cho phòng tập, studio wellness và doanh nghiệp dịch vụ — chuyển hóa các quy trình thủ công thành nền tảng số tự động, tối ưu chi phí và tăng trưởng bền vững.
          </p>

          <div className="about-pillars-strip" aria-label="Trụ cột định vị thương hiệu">
            <span className="about-pill"><b>4 Trụ cột:</b> Phần mềm Studio · Không gian số · Truyền thông · Trải nghiệm</span>
            <span className="about-pill"><b>Triết lý:</b> Chân thực · Minh bạch · Lấy con người làm trung tâm</span>
            <span className="about-pill"><b>Trụ sở:</b> 08 Đặng Vũ Hỷ, An Hải, Đà Nẵng</span>
          </div>

          <div className="about-hero-actions">
            <a className="button amber about-cta-primary" href="#cau-chuyen-danava">
              Khám phá câu chuyện DANAVA ↓
            </a>
            <Link className="button about-cta-secondary" href="/giai-phap/">
              Khám phá Hệ sinh thái ↗
            </Link>
          </div>
        </div>

        {/* Khung ảnh hoạt động thực tế Hero (Zero CLS) */}
        <div className="about-cover-frame-wrapper">
          <div className="about-cover-frame">
            <img
              src="/assets/legacy/event-group.webp"
              alt="Hoạt động kết nối cộng đồng và đối tác DANAVA Solutions"
              loading="eager"
            />
            <div className="about-cover-caption">
              <span>HOẠT ĐỘNG THỰC ĐỊA · ĐỒNG HÀNH CÙNG CỘNG ĐỒNG &amp; DOANH NGHIỆP TẠI ĐÀ NẴNG</span>
            </div>
          </div>
        </div>
      </section>

      <PageAnchor />

      {/* 2. CÂU CHUYỆN PHÁT TRIỂN & NHÀ SÁNG LẬP */}
      <section className="section about-narrative-section" id="cau-chuyen-danava">
        <div className="about-narrative-container">
          <div className="founder-editorial-col">
            <div className="founder-card-frame">
              <img
                src="/assets/legacy/founder.webp"
                alt="Lê Tấn Thành — Founder & CEO DANAVA Solutions"
                loading="lazy"
                className="founder-photo-img"
              />
              <div className="founder-badge-overlay">
                <strong>LÊ TẤN THÀNH</strong>
                <span>Founder &amp; CEO DANAVA Solutions</span>
              </div>
            </div>
          </div>

          <div className="story-editorial-col">
            <p className="eyebrow">CÂU CHUYỆN KHỞI TẠO</p>
            <h2>Khởi đầu từ những trăn trở<br /><em>tại quầy lễ tân.</em></h2>
            <div className="story-prose">
              <p>
                Trong nhiều năm đồng hành cùng các đối tác thể hình, studio Yoga, Pilates và doanh nghiệp dịch vụ tại miền Trung, chúng tôi nhận thấy các chủ cơ sở luôn phải đối mặt với một nghịch lý: họ rất đam mê chuyên môn nhưng lại bị cuốn vào vòng xoáy vận hành thủ công — từ việc kiểm soát thẻ tập trên bảng tính Excel, rà soát sĩ số trên nhóm chat, đến việc khách hàng phàn nàn vì trùng phòng hay quên lịch hẹn.
              </p>
              <p>
                Nhiều phần mềm quản trị trên thị trường lại quá cồng kềnh, chi phí đắt đỏ và không phù hợp với văn hóa ứng xử của nhân sự tại Việt Nam. DANAVA Solutions ra đời với một lời hứa giản dị: tạo ra những công cụ phần mềm và giải pháp truyền thông tinh gọn nhất, để chủ phòng tập, huấn luyện viên và khách hàng đều có thể thao tác dễ dàng trên chiếc điện thoại của mình.
              </p>
            </div>

            <blockquote className="editorial-pull-quote">
              <p>
                &ldquo;Công nghệ chỉ thực sự có ý nghĩa khi nó giải phóng con người khỏi những thao tác vụn vặt, để người làm nghề có trọn vẹn thời gian chăm sóc hội viên của mình.&rdquo;
              </p>
              <cite>
                <strong>Lê Tấn Thành</strong> · Người đại diện pháp luật DANAVA Solutions
              </cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* 3. TIMELINE NGẮN TỪ DỮ LIỆU ĐÃ XÁC MINH (TỐI ƯU MÀN HÌNH NHỎ) */}
      <section className="section about-timeline-section" id="hanh-trinh">
        <div className="about-section-heading">
          <p className="eyebrow">DỮ LIỆU ĐỐI CHIẾU XÁC MINH</p>
          <h2>Những cột mốc trên hành trình phát triển.</h2>
          <p className="section-intro-text">
            Các dấu ấn quan trọng được ghi nhận từ hoạt động thực tế và hồ sơ đã xuất bản của DANAVA:
          </p>
        </div>

        <div className="editorial-timeline-wrapper">
          <div className="timeline-vertical-line" aria-hidden="true" />
          <div className="timeline-items-stack">
            {milestones.map((m, idx) => (
              <div key={m.year} className="timeline-item-card">
                <div className="timeline-marker-col">
                  <div className="timeline-dot" aria-hidden="true">{idx + 1}</div>
                  <span className="timeline-year-tag">{m.year}</span>
                </div>
                <div className="timeline-content-col">
                  <h3>{m.title}</h3>
                  <p>{m.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CÁCH DANAVA LÀM VIỆC (CORE OPERATING PRINCIPLES) */}
      <section className="section about-principles-section" id="cach-lam-viec">
        <div className="about-section-heading">
          <p className="eyebrow">NGUYÊN TẮC HÀNH ĐỘNG</p>
          <h2>Bốn nguyên tắc tạo nên sự khác biệt.</h2>
          <p className="section-intro-text">
            Chúng tôi định nghĩa chất lượng dịch vụ bằng sự thấu hiểu thực tế, minh bạch số liệu và tinh thần trách nhiệm tới cùng.
          </p>
        </div>

        <div className="principles-cards-grid">
          {operatingPrinciples.map(p => (
            <article key={p.num} className="principle-box-card">
              <span className="principle-seq">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 5. CÁC LỐI SANG: ĐỘI NGŨ, HỆ SINH THÁI & DỰ ÁN */}
      <section className="section about-gateways-section">
        <div className="about-section-heading">
          <p className="eyebrow">KHÁM PHÁ DANAVA</p>
          <h2>Kết nối những không gian giá trị.</h2>
        </div>

        <div className="gateways-grid">
          <div className="gateway-card">
            <span className="gateway-tag">CON NGƯỜI</span>
            <h3>Đội ngũ chuyên trách</h3>
            <p>Những gương mặt đồng hành trực tiếp từ khảo sát nghiệp vụ đến vận hành thực tế tại cơ sở.</p>
            <a href="#doi-ngu" className="gateway-link">
              Gặp gỡ đội ngũ ↓
            </a>
          </div>

          <Link href="/giai-phap/" className="gateway-card">
            <span className="gateway-tag">GIẢI PHÁP</span>
            <h3>Hệ sinh thái dịch vụ</h3>
            <p>5 phân hệ đồng hành: DANAVA Studio, Website &amp; Landing Page, Marketing &amp; Media, Du lịch, Cộng đồng.</p>
            <span className="gateway-link">
              Khám phá giải pháp ↗
            </span>
          </Link>

          <Link href="/du-an/" className="gateway-card">
            <span className="gateway-tag">HỒ SƠ NĂNG LỰC</span>
            <h3>Dự án đã kiểm chứng</h3>
            <p>Các câu chuyện triển khai thành công cùng HARIVER Gym và Huế Pilates &amp; Yoga.</p>
            <span className="gateway-link">
              Xem portfolio dự án ↗
            </span>
          </Link>
        </div>
      </section>

      {/* 6. ĐỘI NGŨ NHÂN SỰ CHUYÊN TRÁCH (#DOI-NGU) */}
      <section className="section about-team-section" id="doi-ngu">
        <div className="about-section-heading">
          <p className="eyebrow">ĐỘI NGŨ ĐỒNG HÀNH</p>
          <h2>Những con người cùng bạn phát triển.</h2>
          <p className="section-intro-text">
            Hồ sơ nhân sự công khai, cam kết gắn bó và chịu trách nhiệm trực tiếp với từng dự án:
          </p>
        </div>

        <div className="editorial-team-grid">
          {data.staff.filter(p => p.visible).map(p => (
            <article className="editorial-person-card" key={p.id}>
              <div className="person-photo-frame">
                {personPhoto(p) ? (
                  <img src={personPhoto(p)} alt={p.name} loading="lazy" />
                ) : (
                  <span className="person-initials">
                    {p.name.split(' ').slice(-2).map(x => x[0]).join('')}
                  </span>
                )}
              </div>
              <div className="person-info-block">
                <h3>{p.name}</h3>
                <p className="person-role-title">{p.role}</p>
                <span className="person-company-tag">DANAVA SOLUTIONS</span>
              </div>
            </article>
          ))}
        </div>

        <div className="about-team-footer-cta">
          <Link href="/doi-ngu/" className="button secondary">
            Xem hồ sơ chuyên môn &amp; portfolio đội ngũ đầy đủ ↗
          </Link>
        </div>
      </section>

      {/* 7. HOẠT ĐỘNG THỰC TẾ & KHO HÌNH ẢNH CÓ NGUỒN */}
      <Activities />

      {/* 8. THÔNG TIN LIÊN HỆ DÙNG CHUNG & CTA */}
      <section className="about-shared-contact-section">
        <div className="shared-contact-container">
          <div className="shared-contact-header">
            <p className="eyebrow">KẾT NỐI VỚI DANAVA</p>
            <h2>Sẵn sàng cùng bạn bắt đầu.</h2>
            <p>
              Dù bạn đang chuẩn bị khai trương phòng tập mới hay muốn tối ưu lại quy trình vận hành hiện tại, hãy để lại thông tin để chúng tôi liên hệ tư vấn giải pháp phù hợp nhất.
            </p>
          </div>

          <div className="shared-contact-grid">
            <div className="contact-info-card">
              <span className="info-kicker">ĐỊA CHỈ TRỤ SỞ</span>
              <strong>08 Đặng Vũ Hỷ, An Hải, Đà Nẵng</strong>
              <p>Văn phòng làm việc và tiếp đón đối tác tại trung tâm thành phố Đà Nẵng.</p>
            </div>

            <div className="contact-info-card">
              <span className="info-kicker">KÊNH LIÊN HỆ TRỰC TIẾP</span>
              <a className="contact-link-pill" href={`tel:${data.phone}`}>
                📞 Hotline: {data.phone}
              </a>
              <a className="contact-link-pill" href={`mailto:${data.email}`}>
                ✉️ Email: {data.email}
              </a>
              <p>Thời gian làm việc: Thứ Hai – Thứ Bảy (8:00 – 18:00)</p>
            </div>
          </div>

          <div className="shared-contact-actions">
            <Link className="button amber about-cta-primary" href="/lien-he/">
              Gửi yêu cầu tư vấn giải pháp ↗
            </Link>
            <a className="button about-cta-secondary" href={`tel:${data.phone}`}>
              Gọi trao đổi trực tiếp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProjectCards({ featured = false }: { featured?: boolean }) {
  const { data } = useSite();
  const [filter, setFilter] = useState('Tất cả');
  const all = (data.projects || []).filter(p => p.published && (!featured || p.featured));
  const list = all.filter(p => filter === 'Tất cả' || p.category === filter);

  if (!all.length) {
    return featured ? null : (
      <div className="project-empty">
        <p className="eyebrow">HỒ SƠ DỰ ÁN</p>
        <h2>Chờ những dấu ấn<br /><em>được chia sẻ.</em></h2>
        <p>Hồ sơ dự án đang được rà soát trước khi công bố. Liên hệ DANAVA để trao đổi trực tiếp về nhu cầu của bạn.</p>
        <Link className="button amber" href="/lien-he/">Trao đổi về dự án ↗</Link>
      </div>
    );
  }

  return (
    <>
      {!featured && (
        <div className="filter-tabs" role="tablist" aria-label="Bộ lọc lĩnh vực dự án">
          {['Tất cả', ...new Set(all.map(p => p.category))].map(c => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={filter === c}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="projects-grid">
        {list.map(p => (
          <Link href={`/du-an/${p.slug}/`} key={p.id} className="project-panel">
            <div className="project-art with-image">
              <img src={p.image || '/assets/legacy/website.webp'} alt={p.title} loading="lazy" />
              <b>{p.category}</b>
            </div>
            <p>{p.client || p.category}</p>
            <h2>{p.title}</h2>
            <p className="project-summary">{p.summary}</p>
            <span className="card-link">Xem câu chuyện dự án ↗</span>
          </Link>
        ))}
      </div>
    </>
  );
}

export function FeaturedProjects() {
  const { data } = useSite();
  if (!(data.projects || []).some(p => p.published && p.featured)) return null;
  return (
    <section className="section">
      <div className="intro-heading">
        <h2>Dấu ấn<br /><em>cùng doanh nghiệp.</em></h2>
        <Link href="/du-an/" className="text-link">Tất cả dự án ↗</Link>
      </div>
      <ProjectCards featured />
    </section>
  );
}

// -------------------------------------------------------------
// TIỆN ÍCH PHÂN LOẠI & LỌC DỰ ÁN PORTFOLIO
// -------------------------------------------------------------
export function getProjectIndustry(p: { client?: string; title?: string; summary?: string; category?: string }): string {
  const text = `${p.client || ''} ${p.title || ''} ${p.summary || ''} ${p.category || ''}`.toLowerCase();
  if (text.includes('pilates') || text.includes('yoga')) return 'Pilates & Yoga';
  if (text.includes('gym') || text.includes('fitness') || text.includes('thể hình')) return 'Gym & Fitness';
  if (text.includes('spa') || text.includes('trị liệu') || text.includes('soundbath') || text.includes('massage')) return 'Wellness & Trị liệu';
  if (text.includes('tour') || text.includes('du lịch') || text.includes('sự kiện') || text.includes('workshop')) return 'Du lịch & Sự kiện';
  return 'Dịch vụ & Doanh nghiệp';
}

function slugifyText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function matchPortfolioFilter(value: string, selected: string): boolean {
  if (!selected || selected === 'all' || selected === 'tat-ca') return true;
  const sNorm = slugifyText(selected);
  const vNorm = slugifyText(value);
  return sNorm === vNorm || vNorm.includes(sNorm) || sNorm.includes(vNorm);
}

// -------------------------------------------------------------
// PORTFOLIO DỰ ÁN DANAVA (SPOTLIGHT, BỘ LỌC KÉP, URL SYNC, ZERO CLS)
// -------------------------------------------------------------
export function ProjectsPage() {
  const { data } = useSite();
  const allProjects = useMemo(() => (data.projects || []).filter(p => p.published), [data.projects]);

  // Bộ lọc: Giải pháp & Ngành nghề
  const [selectedSolution, setSelectedSolution] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Dự án nổi bật (ưu tiên featured: true, nếu không lấy dự án đầu tiên)
  const spotlightProject = useMemo(() => {
    return allProjects.find(p => p.featured) || allProjects[0] || null;
  }, [allProjects]);

  // Danh mục bộ lọc động lấy từ dữ liệu thực tế
  const availableSolutions = useMemo(() => {
    const list = Array.from(new Set(allProjects.map(p => p.category))).filter(Boolean);
    return ['all', ...list];
  }, [allProjects]);

  const availableIndustries = useMemo(() => {
    const list = Array.from(new Set(allProjects.map(p => getProjectIndustry(p)))).filter(Boolean);
    return ['all', ...list];
  }, [allProjects]);

  // 1. Đồng bộ 2 chiều với URL Query Parameters (Hỗ trợ Back/Forward & Deep Linking)
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const sol = params.get('giai-phap') || params.get('solution') || 'all';
      const ind = params.get('nganh') || params.get('industry') || 'all';
      setSelectedSolution(sol);
      setSelectedIndustry(ind);
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // 2. Cập nhật URL khi chuyển đổi bộ lọc
  const handleFilterChange = (newSolution: string, newIndustry: string) => {
    setSelectedSolution(newSolution);
    setSelectedIndustry(newIndustry);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (newSolution && newSolution !== 'all') {
        params.set('giai-phap', slugifyText(newSolution));
      }
      if (newIndustry && newIndustry !== 'all') {
        params.set('nganh', slugifyText(newIndustry));
      }
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.pushState({ solution: newSolution, industry: newIndustry }, '', newUrl);
    }
  };

  const handleResetFilters = () => {
    handleFilterChange('all', 'all');
  };

  // 3. Lọc danh sách dự án theo tiêu chí kép
  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      const matchSol = matchPortfolioFilter(p.category, selectedSolution);
      const matchInd = matchPortfolioFilter(getProjectIndustry(p), selectedIndustry);
      return matchSol && matchInd;
    });
  }, [allProjects, selectedSolution, selectedIndustry]);

  const hasActiveFilters = selectedSolution !== 'all' || selectedIndustry !== 'all';

  if (!allProjects.length) {
    return (
      <main id="main" className="portfolio-page">
        <PageHero
          kicker="HỒ SƠ DỰ ÁN"
          title="Chờ những dấu ấn được chia sẻ."
          description="Hồ sơ dự án đang được rà soát trước khi công bố. Liên hệ DANAVA để trao đổi trực tiếp về nhu cầu của bạn."
          image="/assets/legacy/website.webp"
        />
        <PageAnchor />
        <section className="section">
          <div className="project-empty">
            <p className="eyebrow">HỒ SƠ DỰ ÁN</p>
            <h2>Chờ những dấu ấn<br /><em>được chia sẻ.</em></h2>
            <p>Hồ sơ dự án đang được rà soát trước khi công bố. Liên hệ DANAVA để trao đổi trực tiếp về nhu cầu của bạn.</p>
            <Link className="button amber" href="/lien-he/">Trao đổi về dự án ↗</Link>
          </div>
        </section>
        <ContactCTA />
      </main>
    );
  }

  return (
    <main id="main" className="portfolio-page">
      {/* 1. HERO PORTFOLIO SANG TRỌNG */}
      <section className="portfolio-hero-section">
        <div className="portfolio-hero-atmosphere" aria-hidden="true">
          <div className="portfolio-glow" />
          <div className="portfolio-grid-lines" />
        </div>

        <div className="portfolio-hero-container">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <span className="breadcrumb-current" aria-current="page">Dự án &amp; Portfolio</span>
          </nav>

          <p className="eyebrow">
            <span className="status-dot" aria-hidden="true" /> DANAVA SOLUTIONS · HỒ SƠ NĂNG LỰC &amp; DỰ ÁN THỰC TẾ
          </p>

          <h1 className="portfolio-hero-title">
            Dấu ấn cùng doanh nghiệp.<br />
            <em>Từ bài toán thực tế đến giải pháp vận hành.</em>
          </h1>

          <p className="portfolio-hero-lead">
            Mỗi dự án là một sự kết hợp chặt chẽ giữa công nghệ phần mềm, không gian số và chiến lược truyền thông — mang lại giá trị vận hành thực tế và tăng trưởng bền vững cho đối tác.
          </p>

          <div className="portfolio-stats-strip" aria-label="Cam kết chất lượng dự án">
            <span className="stat-pill"><b>100%</b> Dự án thực tế đã nghiệm thu</span>
            <span className="stat-pill"><b>Chính chủ</b> App thương hiệu &amp; Nền tảng số</span>
            <span className="stat-pill"><b>Đo lường</b> Kết quả vận hành cụ thể</span>
          </div>
        </div>
      </section>

      <PageAnchor />

      {/* 2. DỰ ÁN NỔI BẬT (SPOTLIGHT FEATURED PROJECT) */}
      {spotlightProject && (
        <section className="portfolio-spotlight-section" aria-label="Dự án tiêu biểu nổi bật">
          <div className="spotlight-container">
            <div className="spotlight-card">
              <div className="spotlight-media-col">
                <Link href={`/du-an/${spotlightProject.slug}/`} className="spotlight-media-link" aria-label={`Xem chi tiết ${spotlightProject.title}`}>
                  <div className="spotlight-image-frame">
                    <img
                      src={spotlightProject.image || '/assets/legacy/website.webp'}
                      alt={spotlightProject.title}
                      loading="eager"
                    />
                    <span className="spotlight-badge">★ DỰ ÁN TIÊU BIỂU</span>
                  </div>
                </Link>
              </div>

              <div className="spotlight-info-col">
                <div className="spotlight-meta-tags">
                  <span className="meta-tag meta-industry">{getProjectIndustry(spotlightProject)}</span>
                  <span className="meta-tag meta-solution">{spotlightProject.category}</span>
                </div>

                <p className="spotlight-client">{spotlightProject.client}</p>

                <h2 className="spotlight-title">
                  <Link href={`/du-an/${spotlightProject.slug}/`}>
                    {spotlightProject.title}
                  </Link>
                </h2>

                <p className="spotlight-summary">{spotlightProject.summary}</p>

                {spotlightProject.result && (
                  <div className="spotlight-result-box">
                    <span className="result-kicker">KẾT QUẢ ĐẠT ĐƯỢC</span>
                    <p>{spotlightProject.result}</p>
                  </div>
                )}

                <div className="spotlight-action">
                  <Link href={`/du-an/${spotlightProject.slug}/`} className="button amber spotlight-btn">
                    Khám phá câu chuyện dự án ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. BỘ LỌC ĐA TIÊU CHÍ (GIẢI PHÁP & NGÀNH NGHỀ) */}
      <section className="portfolio-filter-section" id="danh-sach-du-an">
        <div className="filter-panel-box">
          <div className="filter-header-bar">
            <div className="filter-heading">
              <span className="filter-kicker">DANH MỤC DỰ ÁN</span>
              <h2>Lọc theo nhu cầu &amp; lĩnh vực</h2>
            </div>
            <div className="filter-status-info">
              <span className="results-count">
                Đang hiển thị <strong>{filteredProjects.length}</strong> / {allProjects.length} dự án
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="reset-filter-btn"
                  onClick={handleResetFilters}
                  aria-label="Xóa tất cả bộ lọc"
                >
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <div className="filter-groups-stack">
            {/* Hàng 1: Lọc theo Giải pháp */}
            <div className="filter-group-line">
              <span className="filter-group-title">Giải pháp:</span>
              <div className="filter-pill-list" role="tablist" aria-label="Bộ lọc theo giải pháp">
                {availableSolutions.map(sol => {
                  const isAll = sol === 'all';
                  const isActive = isAll ? selectedSolution === 'all' : matchPortfolioFilter(sol, selectedSolution);
                  const label = isAll ? 'Tất cả giải pháp' : sol;
                  return (
                    <button
                      key={sol}
                      type="button"
                      className={`filter-pill ${isActive ? 'active' : ''}`}
                      onClick={() => handleFilterChange(sol, selectedIndustry)}
                      aria-pressed={isActive}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hàng 2: Lọc theo Ngành nghề */}
            <div className="filter-group-line">
              <span className="filter-group-title">Ngành nghề:</span>
              <div className="filter-pill-list" role="tablist" aria-label="Bộ lọc theo ngành nghề">
                {availableIndustries.map(ind => {
                  const isAll = ind === 'all';
                  const isActive = isAll ? selectedIndustry === 'all' : matchPortfolioFilter(ind, selectedIndustry);
                  const label = isAll ? 'Tất cả ngành nghề' : ind;
                  return (
                    <button
                      key={ind}
                      type="button"
                      className={`filter-pill ${isActive ? 'active' : ''}`}
                      onClick={() => handleFilterChange(selectedSolution, ind)}
                      aria-pressed={isActive}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LƯỚI DỰ ÁN CÓ ẢNH BÌA & TRẠNG THÁI RỖNG */}
      <section className="section portfolio-grid-section">
        {filteredProjects.length > 0 ? (
          <div className="portfolio-cards-grid">
            {filteredProjects.map(p => (
              <article key={p.id} className="portfolio-project-card">
                <Link href={`/du-an/${p.slug}/`} className="card-media-anchor" aria-label={`Xem dự án ${p.title}`}>
                  <div className="portfolio-card-media">
                    <img
                      src={p.image || '/assets/legacy/website.webp'}
                      alt={p.title}
                      loading="lazy"
                    />
                    <div className="card-badges-overlay">
                      <span className="media-badge industry-badge">{getProjectIndustry(p)}</span>
                      <span className="media-badge solution-badge">{p.category}</span>
                    </div>
                  </div>
                </Link>

                <div className="portfolio-card-content">
                  <span className="card-client-tag">{p.client || p.category}</span>
                  <h3 className="card-project-title">
                    <Link href={`/du-an/${p.slug}/`}>{p.title}</Link>
                  </h3>
                  <p className="card-project-scope">{p.summary}</p>
                  <div className="card-footer-action">
                    <Link href={`/du-an/${p.slug}/`} className="card-details-link">
                      Xem câu chuyện dự án ↗
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="portfolio-empty-state" role="status">
            <div className="empty-state-icon" aria-hidden="true">🔍</div>
            <h3>Không tìm thấy dự án phù hợp với bộ lọc</h3>
            <p>
              Hiện chưa có dự án nào thỏa mãn đồng thời giải pháp và ngành nghề bạn đã chọn trong kho dữ liệu đã xuất bản.
            </p>
            <div className="empty-actions">
              <button type="button" className="button secondary" onClick={handleResetFilters}>
                ✕ Xóa bộ lọc (Xem tất cả)
              </button>
              <Link href="/lien-he/" className="button amber">
                Gửi yêu cầu bài toán riêng ↗
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 5. LIÊN HỆ ĐỒNG HÀNH */}
      <ContactCTA />
    </main>
  );
}

// -------------------------------------------------------------
// QUAN HỆ DỰ ÁN - NHÂN VIÊN (ĐỒNG NHẤT PORTFOLIO CÁ NHÂN)
// -------------------------------------------------------------
export function getProjectTeam(projectId: string, staffList: Person[]): Array<Person & { projectRole: string }> {
  const projectStaffRoles: Record<string, Record<string, string>> = {
    'hariver-studio': {
      thanh: 'Chỉ đạo giải pháp & Kiến trúc hệ thống DANAVA Studio',
      trang: 'Triển khai vận hành quầy & Đào tạo nghiệp vụ lễ tân',
      avinash: 'Thiết kế nhận diện số & Giao diện app hội viên HARIVER',
      thong: 'Quản lý triển khai kỹ thuật & Tích hợp thiết bị check-in'
    },
    'hue-studio': {
      thanh: 'Chỉ đạo giải pháp & Tối ưu luồng đặt lịch Pilates/Yoga',
      trang: 'Đào tạo nhân sự & Hướng dẫn hội viên sử dụng app',
      avinash: 'Thiết kế giao diện thời khóa biểu & Trải nghiệm đặt chỗ',
      thong: 'Quản lý triển khai hệ thống & Kiểm thử sĩ số lớp học'
    }
  };

  const projectMap = projectStaffRoles[projectId] || {
    thanh: 'Chỉ đạo giải pháp & Kiến trúc hệ thống',
    avinash: 'Giám đốc sáng tạo & Thiết kế giao diện UI/UX',
    nam: 'Định hướng truyền thông & Phân luồng khách hàng',
    trang: 'Triển khai & Chăm sóc khách hàng đối tác'
  };

  return staffList
    .filter(s => s.visible && projectMap[s.id])
    .map(s => ({
      ...s,
      projectRole: projectMap[s.id]
    }));
}

// -------------------------------------------------------------
// GALLERY ẢNH TRIỂN KHAI CÓ NÚT ĐIỀU KHIỂN & BÀN PHÍM (ZERO CLS)
// -------------------------------------------------------------
export function CaseStudyGallery({ project }: { project: Project }) {
  const galleryItems = useMemo(() => {
    const list: Array<{ src: string; caption: string; alt: string }> = [];

    if (project.image) {
      list.push({
        src: project.image,
        caption: `Giao diện ứng dụng và nhận diện thương hiệu ${project.client}`,
        alt: `Ảnh triển khai thực tế dự án ${project.title}`
      });
    }

    if (project.id === 'hariver-studio' || project.category.includes('Studio')) {
      list.push({
        src: '/assets/presentation/studio-dashboard.webp',
        caption: 'Bảng điều khiển quản lý hội viên, check-in và bán gói tập tập trung',
        alt: 'Bảng điều khiển quản trị DANAVA Studio'
      });
      list.push({
        src: '/assets/verified/hariver.webp',
        caption: 'App hội viên trên di động mang thương hiệu riêng của cơ sở',
        alt: 'Ứng dụng hội viên di động mang thương hiệu riêng'
      });
    } else if (project.id === 'hue-studio') {
      list.push({
        src: '/assets/presentation/studio-dashboard.webp',
        caption: 'Quản lý lịch lớp, giới hạn sĩ số và danh sách chờ theo ca tập',
        alt: 'Phân hệ quản lý lịch lớp Studio'
      });
      list.push({
        src: '/assets/verified/hue-pilates.webp',
        caption: 'Giao diện đặt chỗ và kiểm tra số buổi tập trên ứng dụng hue.danava.vn',
        alt: 'Giao diện ứng dụng hội viên Huế Pilates & Yoga'
      });
    } else {
      list.push({
        src: '/assets/legacy/website.webp',
        caption: 'Thiết kế giao diện thích ứng đa thiết bị và tối ưu chuyển đổi',
        alt: 'Giao diện hiển thị website đa thiết bị'
      });
      list.push({
        src: '/assets/presentation/danava-ecosystem.webp',
        caption: 'Hệ sinh thái giải pháp đồng hành cùng doanh nghiệp',
        alt: 'Hệ sinh thái giải pháp DANAVA'
      });
    }

    return list;
  }, [project]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex(i => (i === 0 ? galleryItems.length - 1 : i - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(i => (i === galleryItems.length - 1 ? 0 : i + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  const current = galleryItems[currentIndex] || galleryItems[0];
  if (!current) return null;

  return (
    <div
      className="case-gallery-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Thư viện ảnh triển khai dự án. Dùng phím mũi tên trái/phải để chuyển ảnh."
    >
      <div className="case-gallery-viewport">
        <img
          src={current.src}
          alt={current.alt}
          loading="lazy"
          className="gallery-active-image"
        />
        <div className="gallery-nav-overlay">
          <button
            type="button"
            className="gallery-nav-btn prev-btn"
            onClick={prevSlide}
            aria-label="Xem ảnh trước"
          >
            ‹
          </button>
          <button
            type="button"
            className="gallery-nav-btn next-btn"
            onClick={nextSlide}
            aria-label="Xem ảnh tiếp theo"
          >
            ›
          </button>
        </div>
        <div className="gallery-counter-badge">
          {currentIndex + 1} / {galleryItems.length}
        </div>
      </div>

      <div className="gallery-caption-bar">
        <p className="gallery-caption-text">
          <span className="caption-bullet" aria-hidden="true">📷</span> {current.caption}
        </p>
        <div className="gallery-dots" role="tablist" aria-label="Chọn ảnh hiển thị">
          {galleryItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`gallery-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ảnh ${idx + 1}`}
              aria-selected={idx === currentIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TEMPLATE CASE STUDY DỰ ÁN CHI TIẾT THEO CHUẨN ĐỒNG BỘ
// (ẢNH BÌA → BỐI CẢNH → BÀI TOÁN → DANAVA THỰC HIỆN → ẢNH TRIỂN KHAI → KẾT QUẢ → ĐỘI NGŨ → LIÊN QUAN)
// -------------------------------------------------------------
export function ProjectPage({ slug }: { slug: string }) {
  const { data } = useSite();
  const p = data.projects?.find(x => x.slug === slug && x.published);

  const projectTeam = useMemo(() => {
    if (!p) return [];
    return getProjectTeam(p.id, data.staff || []);
  }, [p, data.staff]);

  const relatedProjects = useMemo(() => {
    if (!p) return [];
    return (data.projects || []).filter(x => x.slug !== p.slug && x.published).slice(0, 2);
  }, [p, data.projects]);

  if (!p) return null;

  // Xây dựng đoạn văn bối cảnh thực tế cho từng dự án đã kiểm chứng
  const contextText =
    p.id === 'hariver-studio'
      ? 'HARIVER GYM & FITNESS CENTER là trung tâm thể hình cao cấp phục vụ hàng trăm hội viên tập gym, cardio và yoga mỗi ngày. Trước khi triển khai giải pháp mới, cơ sở gặp nhiều khó khăn trong việc kiểm soát lượt khách ra vào giờ cao điểm và theo dõi thời hạn thẻ hội viên.'
      : p.id === 'hue-studio'
      ? 'Huế Pilates & Yoga là không gian luyện tập chuyên sâu với các ca tập Pilates Reformer và Yoga có sĩ số giới hạn (5–8 người/lớp). Yêu cầu cốt lõi là kiểm soát sĩ số nghiêm ngặt, cho phép hội viên chủ động giữ chỗ và quản lý danh sách chờ tự động khi lớp học đã đầy.'
      : `Dự án triển khai giải pháp chuyển đổi số và nâng tầm trải nghiệm hội viên cùng đối tác ${p.client}, giải quyết các điểm nghẽn trong vận hành và nâng cao năng lực phục vụ.`;

  return (
    <main id="main" className="case-study-page">
      {/* 1. ẢNH BÌA & HERO COVER HEADER */}
      <section className="case-hero-section">
        <div className="case-hero-atmosphere" aria-hidden="true">
          <div className="case-hero-glow" />
        </div>

        <div className="case-hero-container">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <Link href="/du-an/">Dự án</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <span className="breadcrumb-current" aria-current="page">{p.title}</span>
          </nav>

          <p className="eyebrow">
            <span className="status-dot" aria-hidden="true" /> HỒ SƠ DỰ ÁN THỰC TẾ · {p.category}
          </p>

          <h1 className="case-hero-title">{p.title}</h1>

          <p className="case-hero-lead">{p.summary}</p>

          <div className="case-meta-strip">
            <div className="case-meta-item">
              <span className="meta-label">KHÁCH HÀNG</span>
              <strong className="meta-value">{p.client}</strong>
            </div>
            <div className="case-meta-item">
              <span className="meta-label">LĨNH VỰC</span>
              <strong className="meta-value">{getProjectIndustry(p)}</strong>
            </div>
            <div className="case-meta-item">
              <span className="meta-label">GIẢI PHÁP</span>
              <strong className="meta-value">{p.category}</strong>
            </div>
            {p.source && (
              <div className="case-meta-item">
                <span className="meta-label">NGUỒN CÔNG BỐ</span>
                <a className="meta-link" href={p.source} target="_blank" rel="noopener noreferrer">
                  Hồ sơ chính chủ ↗
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Khung ảnh bìa Hero lớn (Zero CLS) */}
        <div className="case-cover-frame-wrapper">
          <div className="case-cover-frame">
            <img
              src={p.image || '/assets/legacy/website.webp'}
              alt={p.title}
              loading="eager"
            />
          </div>
        </div>
      </section>

      <PageAnchor />

      {/* 2. BỐI CẢNH (CONTEXT) & 3. BÀI TOÁN (CHALLENGE) */}
      <section className="section case-body-section" id="noi-dung-du-an">
        <div className="case-content-layout">
          {/* Cột trái: Bối cảnh & Thách thức */}
          <div className="case-main-narrative">
            {/* 2. BỐI CẢNH */}
            <article className="case-block context-block">
              <span className="block-number">01</span>
              <div className="block-body">
                <p className="eyebrow">BỐI CẢNH ĐƠN VỊ</p>
                <h2>Điểm xuất phát &amp; Không gian hoạt động.</h2>
                <p>{contextText}</p>
              </div>
            </article>

            {/* 3. BÀI TOÁN (CHALLENGE) */}
            <article className="case-block challenge-block">
              <span className="block-number">02</span>
              <div className="block-body">
                <p className="eyebrow">BÀI TOÁN THỰC TẾ</p>
                <h2>Thách thức trong quản lý &amp; trải nghiệm.</h2>
                <div className="challenge-quote-card">
                  <p>{p.challenge}</p>
                </div>
              </div>
            </article>

            {/* 4. DANAVA THỰC HIỆN (SOLUTION BREAKDOWN) */}
            <article className="case-block solution-block">
              <span className="block-number">03</span>
              <div className="block-body">
                <p className="eyebrow">DANAVA THỰC HIỆN</p>
                <h2>Giải pháp may đo &amp; Quy trình triển khai.</h2>
                <p className="solution-lead-text">{p.solution}</p>

                <div className="implementation-steps-grid">
                  <div className="impl-step-item">
                    <span className="impl-step-dot">1</span>
                    <div>
                      <strong>Khảo sát &amp; Chuẩn hóa luồng hội viên</strong>
                      <p>Rà soát toàn bộ danh sách gói tập, định giá thẻ tập và quy định giới hạn sĩ số theo từng khung giờ.</p>
                    </div>
                  </div>
                  <div className="impl-step-item">
                    <span className="impl-step-dot">2</span>
                    <div>
                      <strong>Cài đặt hệ thống &amp; Phát hành App thương hiệu</strong>
                      <p>Khởi tạo phân hệ quản lý Studio, đồng bộ lịch lớp và đưa app hội viên mang thương hiệu riêng vào vận hành.</p>
                    </div>
                  </div>
                  <div className="impl-step-item">
                    <span className="impl-step-dot">3</span>
                    <div>
                      <strong>Đào tạo nhân sự &amp; Nghiệm thu quầy lễ tân</strong>
                      <p>Hướng dẫn trực tiếp đội ngũ nhân viên quầy quy trình check-in, gia hạn và xử lý phát sinh giờ cao điểm.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 5. ẢNH TRIỂN KHAI / GALLERY TƯƠNG TÁC (CÓ NÚT ĐIỀU KHIỂN & BÀN PHÍM) */}
            <section className="case-block gallery-block" aria-label="Hình ảnh triển khai thực tế">
              <span className="block-number">04</span>
              <div className="block-body">
                <p className="eyebrow">HÌNH ẢNH THỰC TẾ</p>
                <h2>Giao diện &amp; Không gian triển khai.</h2>
                <CaseStudyGallery project={p} />
              </div>
            </section>

            {/* 6. KẾT QUẢ NẾU CÓ (VERIFIED RESULTS & OUTCOMES) */}
            {p.result && (
              <article className="case-block result-block">
                <span className="block-number">05</span>
                <div className="block-body">
                  <p className="eyebrow">KẾT QUẢ NGHIỆM THU</p>
                  <h2>Hiệu quả vận hành đã được xác nhận.</h2>
                  <div className="result-highlight-card">
                    <span className="result-badge">✓ KẾT QUẢ VẬN HÀNH THỰC TẾ</span>
                    <p className="result-text">{p.result}</p>
                    <div className="result-check-pills">
                      <span>✓ 100% Hội viên chủ động thao tác qua app</span>
                      <span>✓ Giảm thiểu nhầm lẫn sĩ số &amp; quá tải</span>
                      <span>✓ Dữ liệu tập trung minh bạch theo thời gian thực</span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* 7. ĐỘI NGŨ PHỤ TRÁCH (TEAM & PROJECT ROLES) */}
            {projectTeam.length > 0 && (
              <section className="case-block team-block">
                <span className="block-number">{p.result ? '06' : '05'}</span>
                <div className="block-body">
                  <p className="eyebrow">ĐỘI NGŨ THỰC HIỆN</p>
                  <h2>Chuyên gia đồng hành cùng dự án.</h2>
                  <p className="team-intro-text">
                    Đội ngũ nhân sự chuyên trách của DANAVA trực tiếp khảo sát nghiệp vụ, kiến trúc giải pháp và đồng hành vận hành cùng đơn vị.
                  </p>

                  <div className="case-team-grid">
                    {projectTeam.map(member => (
                      <Link key={member.id} href={`/doi-ngu/${member.id}/`} className="case-team-card" aria-label={`Xem portfolio cá nhân của ${member.name}`}>
                        <div className="team-avatar-frame">
                          {personPhoto(member) ? (
                            <img
                              src={personPhoto(member)}
                              alt={member.name}
                              loading="lazy"
                            />
                          ) : (
                            <span className="case-team-initials">
                              {getStaffInitials(member.name)}
                            </span>
                          )}
                        </div>
                        <div className="team-card-copy">
                          <h4>{member.name} <span className="profile-view-arrow">↗</span></h4>
                          <span className="team-title-general">{member.role}</span>
                          <div className="team-role-box">
                            <small>Vai trò trong dự án:</small>
                            <p>{member.projectRole}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 8. CTA "TƯ VẤN GIẢI PHÁP TƯƠNG TỰ" */}
            <section className="case-consult-cta-section">
              <div className="case-cta-box">
                <div className="cta-copy">
                  <span className="cta-kicker">ĐỒNG HÀNH CÙNG DANAVA</span>
                  <h3>Bạn muốn triển khai giải pháp tương tự cho {p.client || 'cơ sở của mình'}?</h3>
                  <p>
                    Chúng tôi sẵn sàng lắng nghe bài toán thực tế của bạn, tư vấn kiến trúc phần mềm và lộ trình triển khai may đo cho mô hình kinh doanh của bạn.
                  </p>
                </div>
                <div className="cta-actions">
                  <Link
                    className="button amber cta-primary-btn"
                    href={`/lien-he/?service=${encodeURIComponent(p.category)}&project=${encodeURIComponent(p.title)}`}
                  >
                    Tư vấn giải pháp tương tự ↗
                  </Link>
                  <a className="button cta-secondary-btn" href={`tel:${data.phone}`}>
                    📞 Gọi hotline {data.phone}
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* 9. DỰ ÁN LIÊN QUAN (RELATED PROJECTS) */}
      {relatedProjects.length > 0 && (
        <section className="section case-related-section">
          <div className="related-section-header">
            <div>
              <p className="eyebrow">DẤU ẤN LIÊN QUAN</p>
              <h2>Các dự án cùng hệ sinh thái.</h2>
            </div>
            <Link href="/du-an/" className="view-all-projects-link">
              Xem tất cả dự án ↗
            </Link>
          </div>

          <div className="related-cards-grid">
            {relatedProjects.map(rel => (
              <article key={rel.id} className="related-project-card">
                <Link href={`/du-an/${rel.slug}/`} className="related-media-anchor" aria-label={`Xem chi tiết ${rel.title}`}>
                  <div className="related-media-box">
                    <img
                      src={rel.image || '/assets/legacy/website.webp'}
                      alt={rel.title}
                      loading="lazy"
                    />
                    <div className="related-badges-strip">
                      <span className="rel-badge">{getProjectIndustry(rel)}</span>
                      <span className="rel-badge">{rel.category}</span>
                    </div>
                  </div>
                </Link>

                <div className="related-content-box">
                  <span className="related-client-name">{rel.client}</span>
                  <h3>
                    <Link href={`/du-an/${rel.slug}/`}>{rel.title}</Link>
                  </h3>
                  <p>{rel.summary}</p>
                  <div className="related-action-row">
                    <Link href={`/du-an/${rel.slug}/`} className="related-detail-link">
                      Xem câu chuyện dự án ↗
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* LIÊN HỆ TỔNG THỂ */}
      <ContactCTA />
    </main>
  );
}

export function BlogPage() {
  return <NewsletterPage />;
}

export function ArticlePage({ slug }: { slug: string }) {
  return <ArticleTemplate slug={slug} />;
}

export function ContactPage() {
  return <ContactTwoColumnPage />;
}

export function ContactBrief() {
  const { data } = useSite();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedService, setSelectedService] = useState<string>(data.services[0]?.title || '');

  // Pre-select dịch vụ theo query parameter ?service= trên URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const svcParam = params.get('service');
      if (svcParam && data.services.length > 0) {
        const needle = svcParam.trim().toLowerCase();
        const matched = data.services.find(s =>
          s.id.toLowerCase() === needle ||
          s.slug.toLowerCase() === needle ||
          s.title.toLowerCase().includes(needle) ||
          needle.includes(s.title.toLowerCase())
        );
        if (matched) {
          setSelectedService(matched.title);
        }
      }
    }
  }, [data.services]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');
    const form = e.currentTarget;
    const f = new FormData(form);
    const payload = {
      name: String(f.get('name') || ''),
      email: String(f.get('email') || ''),
      phone: String(f.get('phone') || ''),
      service: String(f.get('service') || selectedService),
      message: String(f.get('message') || '')
    };

    try {
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        setStatusMsg(resJson.message || 'Yêu cầu tư vấn của bạn đã được gửi thành công.');
        form.reset();
        return;
      }
      throw new Error(resJson.error || 'Lỗi gửi yêu cầu.');
    } catch {
      // Fallback: Mở mail client nếu API không kết nối được
      const body = `Họ tên: ${payload.name}\nEmail: ${payload.email}\nSố điện thoại: ${payload.phone}\nLĩnh vực: ${payload.service}\n\n${payload.message}`;
      window.location.href = `mailto:${data.email}?subject=${encodeURIComponent('Yêu cầu tư vấn DANAVA')}&body=${encodeURIComponent(body)}`;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section brief-section" id="form-tu-van">
      <div>
        <p className="eyebrow">CHIA SẺ Ý TƯỞNG CỦA BẠN</p>
        <h2>Hành trình mới.<br /><em>Bắt đầu tại đây.</em></h2>
        <p>Điền thông tin bên dưới để đội ngũ DANAVA liên hệ tư vấn trực tiếp, hoặc chuẩn bị email trao đổi.</p>
      </div>
      {sent ? (
        <div className="form-success-card" role="status" aria-live="polite">
          <span className="success-badge">✓ ĐÃ TIẾP NHẬN</span>
          <h3>Cảm ơn bạn đã kết nối!</h3>
          <p>{statusMsg || 'Đội ngũ DANAVA Solutions sẽ liên hệ lại trong thời gian sớm nhất.'}</p>
          <button type="button" className="button secondary" onClick={() => setSent(false)}>
            Gửi yêu cầu khác ↗
          </button>
        </div>
      ) : (
        <form onSubmit={submit} aria-label="Biểu mẫu yêu cầu tư vấn">
          <label>
            Họ và tên *
            <input name="name" autoComplete="name" required maxLength={150} placeholder="Nguyễn Văn A" />
          </label>
          <label>
            Email liên hệ *
            <input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="email@doanhnghiep.vn" />
          </label>
          <label>
            Số điện thoại liên hệ
            <input name="phone" type="tel" autoComplete="tel" maxLength={50} placeholder="0905 123 456" />
          </label>
          <label>
            Bạn quan tâm đến giải pháp
            <select
              name="service"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              {data.services.map(s => (
                <option key={s.id} value={s.title}>{s.title}</option>
              ))}
            </select>
          </label>
          <label>
            Nội dung trao đổi *
            <textarea
              name="message"
              required
              maxLength={5000}
              rows={4}
              placeholder="Mục tiêu, hiện trạng phòng tập/doanh nghiệp, tiến độ mong muốn…"
            />
          </label>
          <button className="button amber" type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi…' : 'Gửi yêu cầu tư vấn ↗'}
          </button>
          <p className="form-note">
            Thông tin chỉ dùng để liên hệ trao đổi, cam kết bảo mật theo <Link href="/chinh-sach-rieng-tu/">quyền riêng tư</Link>.
          </p>
        </form>
      )}
    </section>
  );
}

export function Activities() {
  return (
    <section className="section activities">
      <div className="section-kicker">
        <span>DẤU ẤN DANAVA</span>
        <span>CON NGƯỜI · SỰ KIỆN · CỘNG ĐỒNG</span>
      </div>
      <div className="intro-heading">
        <h2>Giá trị từ<br /><em>những kết nối thật.</em></h2>
        <p>Những khoảnh khắc trong hoạt động, workshop và chương trình cộng đồng từ kho hình ảnh DANAVA.</p>
      </div>
      <div className="activity-grid">
        {activityPhotos.map((photo, i) => (
          <Link key={photo.src} href={i === 0 ? '/kien-thuc/cong-nang-luong/' : '/kien-thuc/'} className="activity-card">
            <img src={photo.src} alt={photo.alt} loading="lazy" />
            <div>
              <span>{photo.label}</span>
              <h3>{photo.title}</h3>
              <b>↗</b>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   DANAVA TEAM PAGE — TRANG ĐỘI NGŨ CHUYÊN TRÁCH (/doi-ngu)
   Yêu cầu:
   - Danh sách đội ngũ có ảnh, chức danh, chuyên môn và liên kết portfolio
   - Bộ lọc theo phòng ban khi dữ liệu đủ: Kỹ thuật, Truyền thông, Kinh doanh, Vận hành
   - Chỉ lấy trường đã duyệt công khai (data.staff.filter(p => p.visible))
   - Card không có ảnh dùng avatar chữ (chữ viết tắt 2 chữ cái họ tên)
   - Kiểm tra hồ sơ ẩn, danh sách rỗng (Empty state)
   - Thao tác trên mobile mượt mà, touch target >= 44px
   ========================================================================== */

export function TeamPage() {
  const { data } = useSite();
  const [activeDept, setActiveDept] = useState<StaffDeptId>('all');

  // 1. Chỉ lấy hồ sơ đã duyệt công khai (loại trừ hồ sơ ẩn)
  const publicStaff = useMemo(() => {
    return (data.staff || []).filter(p => p.visible);
  }, [data.staff]);

  // 2. Thống kê số lượng nhân sự theo từng nhóm phòng ban
  const counts = useMemo(() => {
    const map: Record<StaffDeptId, number> = {
      'all': publicStaff.length,
      'ky-thuat': 0,
      'truyen-thong': 0,
      'kinh-doanh': 0,
      'van-hanh': 0
    };
    publicStaff.forEach(p => {
      const detail = getStaffDetail(p);
      if (map[detail.departmentId] !== undefined) {
        map[detail.departmentId] += 1;
      }
    });
    return map;
  }, [publicStaff]);

  // 3. Danh sách nhân sự theo bộ lọc đã chọn
  const displayedStaff = useMemo(() => {
    if (activeDept === 'all') return publicStaff;
    return publicStaff.filter(p => getStaffDetail(p).departmentId === activeDept);
  }, [publicStaff, activeDept]);

  // Cấu hình danh sách tab phòng ban
  const departments = STAFF_DEPARTMENTS;

  return (
    <main className="team-page" id="main-content">
      {/* 1. HERO SECTION: BỐ CỤC EDITORIAL HIỆN ĐẠI */}
      <section className="section team-hero-section" aria-label="Giới thiệu đội ngũ DANAVA Solutions">
        <div className="team-hero-container">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <Link href="/ve-danava/">Về DANAVA</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <span className="breadcrumb-current" aria-current="page">Đội ngũ chuyên trách</span>
          </nav>

          <p className="eyebrow">
            <span className="status-dot" /> CON NGƯỜI TẠO GIÁ TRỊ · DANAVA SOLUTIONS
          </p>

          <h1 className="team-hero-title">
            Đội ngũ chuyên môn.<br />
            <em>Chịu trách nhiệm đến cùng.</em>
          </h1>

          <p className="team-hero-lead">
            Tại DANAVA Solutions, chúng tôi tin rằng công nghệ chỉ thực sự phát huy giá trị khi được vận hành bởi những con người có tâm và chuyên môn vững vàng. Mọi dự án đều có chuyên sự phụ trách rõ ràng từ khảo sát, kiến trúc, kiểm thử thiết bị đến bàn giao tận nơi tại cơ sở của bạn.
          </p>

          <div className="team-highlights-bar">
            <div className="team-stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Hồ sơ công khai &amp; gắn liền dự án thật</span>
            </div>
            <div className="team-stat-item">
              <span className="stat-number">4</span>
              <span className="stat-label">Khối phòng ban chuyên trách khép kín</span>
            </div>
            <div className="team-stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Hỗ trợ kỹ thuật &amp; vận hành đối tác</span>
            </div>
            <div className="team-stat-item">
              <span className="stat-number">01</span>
              <span className="stat-label">Mục tiêu: Hiệu quả thực tế của khách hàng</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BỘ LỌC PHÒNG BAN & DANH SÁCH NHÂN SỰ */}
      <section className="section team-directory-section" aria-label="Danh sách đội ngũ theo phòng ban">
        <div className="team-directory-container">
          {/* Header bộ lọc */}
          <div className="team-filter-header">
            <div>
              <p className="filter-kicker">DANH MỤC CHUYÊN SỰ</p>
              <h2>Chọn khối chuyên môn bạn muốn tìm hiểu</h2>
            </div>
            <div className="team-filter-summary">
              <span>Đang hiển thị: <strong>{displayedStaff.length}</strong> / {publicStaff.length} nhân sự đã duyệt</span>
            </div>
          </div>

          {/* Thanh Filter Pills (tối ưu touch & scroll trên mobile) */}
          <div className="team-filter-toolbar" role="tablist" aria-label="Bộ lọc phòng ban">
            {departments.map(dept => {
              const count = counts[dept.id] || 0;
              const isActive = activeDept === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`team-filter-tab ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveDept(dept.id)}
                >
                  <span className="tab-name">{dept.label}</span>
                  <span className="tab-badge" aria-label={`${count} nhân sự`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Gợi ý mô tả phòng ban đang chọn */}
          <div className="team-active-dept-info" aria-live="polite">
            <span className="dept-info-icon">ℹ</span>
            <span>{departments.find(d => d.id === activeDept)?.shortDesc}</span>
          </div>

          {/* LƯỚI THẺ NHÂN SỰ HOẶC TRẠNG THÁI DANH SÁCH RỖNG */}
          {displayedStaff.length === 0 ? (
            <div className="team-empty-state" role="status" aria-live="polite">
              <div className="empty-icon-circle" aria-hidden="true">
                <span>👥</span>
              </div>
              <h3>Chưa có hồ sơ nhân sự công khai trong nhóm này</h3>
              <p>
                Các vị trí nhân sự thuộc phòng ban này hiện đang trong lộ trình kiện toàn hoặc đang bảo mật thông tin theo yêu cầu đối tác. Bạn có thể xem toàn bộ đội ngũ hoặc liên hệ để trao đổi trực tiếp.
              </p>
              <div className="empty-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setActiveDept('all')}
                >
                  Xem tất cả phòng ban ({publicStaff.length})
                </button>
                <Link href="/lien-he/?service=Ung+tuyen" className="button amber">
                  Gia nhập đội ngũ DANAVA ↗
                </Link>
              </div>
            </div>
          ) : (
            <div className="team-cards-grid">
              {displayedStaff.map(person => {
                const photo = personPhoto(person);
                const detail = getStaffDetail(person);
                const initials = getStaffInitials(person.name);

                return (
                  <article className="team-member-card" key={person.id}>
                    {/* Phần đầu thẻ: Ảnh thật hoặc Avatar chữ fallback */}
                    <div className="member-card-header">
                      <Link href={`/doi-ngu/${person.id}/`} className="member-media-link" aria-label={`Xem portfolio của ${person.name}`}>
                        <div className="member-media-wrapper">
                          {photo ? (
                            <img
                              src={photo}
                              alt={`Chân dung ${person.name}`}
                              className="member-photo"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="member-text-avatar"
                              role="img"
                              aria-label={`Ảnh đại diện chữ viết tắt của ${person.name}`}
                            >
                              <span className="initials-text">{initials}</span>
                              <span className="avatar-tag">DANAVA</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="member-title-block">
                        <span className="member-dept-badge">{detail.departmentName}</span>
                        <h3 className="member-name">
                          <Link href={`/doi-ngu/${person.id}/`} className="member-name-anchor">
                            {person.name} <span className="name-arrow" aria-hidden="true">↗</span>
                          </Link>
                        </h3>
                        <p className="member-role">{person.role}</p>
                      </div>
                    </div>

                    {/* Phần thân thẻ: Tiểu sử & Trách nhiệm */}
                    <div className="member-body-block">
                      <p className="member-bio">{detail.bio}</p>

                      {/* Chuyên môn cốt lõi */}
                      <div className="member-expertise-group">
                        <span className="group-label">CHUYÊN MÔN CỐT LÕI:</span>
                        <div className="expertise-tags-list">
                          {detail.expertise.map((skill, sIdx) => (
                            <span className="expertise-tag" key={sIdx}>{skill}</span>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio & Dự án liên quan */}
                      <div className="member-portfolio-group">
                        <span className="group-label">DỰ ÁN &amp; PORTFOLIO PHỤ TRÁCH:</span>
                        <div className="portfolio-items-list">
                          {detail.portfolio.map((item, pIdx) => (
                            <Link href={item.href} key={pIdx} className="portfolio-link-card">
                              <div className="portfolio-card-top">
                                <strong className="portfolio-title">{item.title}</strong>
                                <span className="portfolio-arrow" aria-hidden="true">↗</span>
                              </div>
                              <p className="portfolio-desc">{item.desc}</p>
                              {item.badge && (
                                <span className="portfolio-badge">{item.badge}</span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chân thẻ: Nút xem hồ sơ chi tiết và nút liên hệ */}
                    <div className="member-footer-block">
                      <Link
                        href={`/doi-ngu/${person.id}/`}
                        className="member-portfolio-btn"
                      >
                        Hồ sơ &amp; Dự án chi tiết ↗
                      </Link>
                      <Link
                        href={`/lien-he/?service=${encodeURIComponent(person.role || 'Tu van')}&ref=${person.id}`}
                        className="member-contact-link"
                      >
                        Kết nối trao đổi
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. VĂN HÓA LÀM VIỆC & NGUYÊN TẮC CHUYÊN SỰ TẠI DANAVA */}
      <section className="section team-culture-section" aria-label="Cam kết của đội ngũ DANAVA">
        <div className="team-culture-container">
          <div className="culture-header">
            <p className="eyebrow">CAM KẾT NGHỀ NGHIỆP</p>
            <h2>3 nguyên tắc làm việc tạo nên sự an tâm</h2>
            <p>
              Chúng tôi không coi công nghệ là lý thuyết trong phòng lab, mà là công cụ phải vận hành trơn tru mỗi ngày tại quầy thu ngân, phòng tập và trên tay hội viên của bạn.
            </p>
          </div>

          <div className="culture-cards-grid">
            <div className="culture-card">
              <div className="culture-card-num">01</div>
              <h3>Minh bạch hồ sơ &amp; Năng lực thật</h3>
              <p>
                Mọi dự án và kết quả hiển thị đều dựa trên việc triển khai thực tế. DANAVA không khai khống năng lực, cam kết tư vấn đúng bài toán với chi phí và lộ trình tối ưu nhất.
              </p>
            </div>

            <div className="culture-card">
              <div className="culture-card-num">02</div>
              <h3>Đầu mối trực tiếp, chịu trách nhiệm đến cùng</h3>
              <p>
                Khi dự án bắt đầu, bạn luôn có chuyên viên kỹ thuật và quản lý vận hành chịu trách nhiệm trực tiếp. Mọi thắc mắc được giải đáp tức thì, không qua tầng nấc trung gian phức tạp.
              </p>
            </div>

            <div className="culture-card">
              <div className="culture-card-num">03</div>
              <h3>Đồng hành sau bàn giao, không bỏ rơi đối tác</h3>
              <p>
                Khác biệt lớn nhất của DANAVA là sự hiện diện thực tế. Chúng tôi hỗ trợ đào tạo quầy lễ tân, bảo trì định kỳ và liên tục nâng cấp tính năng phần mềm theo đà tăng trưởng của cơ sở.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KHỐI LỐI SANG CÁC PHÂN HỆ KHÁC (GATEWAY) */}
      <section className="section team-gateways-section" aria-label="Khám phá thêm về DANAVA">
        <div className="team-gateways-container">
          <div className="gateways-grid">
            <Link href="/ve-danava/" className="gateway-card">
              <span className="gateway-badge">TỔNG QUAN DOANH NGHIỆP</span>
              <h3>Về DANAVA Solutions</h3>
              <p>Tìm hiểu hành trình phát triển, cột mốc đã xác minh và triết lý đồng hành cùng khách hàng.</p>
              <span className="gateway-arrow">Khám phá hành trình ↗</span>
            </Link>

            <Link href="/du-an/" className="gateway-card">
              <span className="gateway-badge">CHỨNG THỰC NĂNG LỰC</span>
              <h3>Hồ sơ triển khai thực tế</h3>
              <p>Xem chi tiết các case study phòng tập HARIVER Gym, Huế Pilates và các dự án thiết kế website.</p>
              <span className="gateway-arrow">Xem portfolio dự án ↗</span>
            </Link>

            <Link href="/giai-phap/" className="gateway-card">
              <span className="gateway-badge">HỆ THỐNG CÔNG NGHỆ</span>
              <h3>Hệ sinh thái giải pháp số</h3>
              <p>Từ phần mềm DANAVA Studio, thiết kế website đến dịch vụ truyền thông marketing trọn gói.</p>
              <span className="gateway-arrow">Xem toàn bộ giải pháp ↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CTA KẾT NỐI TƯ VẤN CUỐI TRANG */}
      <section className="section team-cta-section" aria-label="Liên hệ với đội ngũ">
        <div className="team-cta-container">
          <p className="eyebrow"><span className="status-dot" /> SẴN SÀNG ĐỒNG HÀNH</p>
          <h2>Bạn có bài toán cần giải quyết?<br /><em>Hãy để đội ngũ DANAVA lắng nghe bạn.</em></h2>
          <p className="cta-lead">
            Dù là số hóa quản lý phòng tập hay làm mới thương hiệu trên môi trường số, chúng tôi luôn sẵn sàng gặp gỡ trực tiếp hoặc trao đổi trực tuyến để đồng hành cùng bạn.
          </p>

          <div className="cta-actions">
            <Link href="/lien-he/" className="button amber">
              Đặt lịch trao đổi trực tiếp ↗
            </Link>
            <a href={`tel:${data.phone || '0935917677'}`} className="button secondary">
              📞 Hotline: {data.phone || '0935 917 677'}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   DANAVA STAFF PORTFOLIO TEMPLATE — HỒ SƠ NĂNG LỰC CÁ NHÂN (/doi-ngu/[slug])
   Yêu cầu:
   - Ảnh chân dung (hoặc avatar chữ nếu chưa có ảnh)
   - Giới thiệu bản thân, chức danh, kinh nghiệm
   - Kỹ năng chuyên sâu phân nhóm
   - Dự án đã tham gia: lấy từ cùng quan hệ ở /du-an/[slug]
   - Vai trò trong từng dự án & đóng góp cụ thể
   - Sản phẩm cá nhân / giải pháp chịu trách nhiệm
   - Link nghề nghiệp được duyệt (email, hotline, kênh tư vấn)
   - Link quay lại Đội ngũ DANAVA (/doi-ngu/)
   - Ưu tiên dự án thật thay cho hiệu ứng trang trí
   - Bảng màu chuẩn #0B132B, #1C2541, #3A506B, #5BC0DE, #F4D6B0, #D97706
   ========================================================================== */
export function StaffPortfolioPage({ profile }: { profile: StaffFullProfile }) {
  const photo = personPhoto({ id: profile.id, name: profile.name, role: profile.role, visible: true });
  const initials = getStaffInitials(profile.name);

  return (
    <main className="staff-portfolio-page" id="main-content">
      {/* 1. TOP NAV & BREADCRUMB */}
      <section className="portfolio-top-bar">
        <div className="portfolio-bar-container">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <Link href="/ve-danava/">Về DANAVA</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <Link href="/doi-ngu/">Đội ngũ</Link>
            <span className="breadcrumb-separator" aria-hidden="true"> / </span>
            <span className="breadcrumb-current" aria-current="page">{profile.name}</span>
          </nav>

          <Link href="/doi-ngu/" className="back-to-team-btn">
            <span aria-hidden="true">←</span> Quay lại danh sách Đội ngũ
          </Link>
        </div>
      </section>

      {/* 2. HERO HEADER: HỒ SƠ NĂNG LỰC CÁ NHÂN */}
      <section className="section profile-hero-section">
        <div className="profile-hero-container">
          {/* Cột trái: Ảnh đại diện & Huy hiệu xác nhận */}
          <div className="profile-hero-media">
            <div className="profile-avatar-frame">
              {photo ? (
                <img
                  src={photo}
                  alt={`Chân dung ${profile.name} — ${profile.role}`}
                  className="profile-portrait-photo"
                  loading="eager"
                />
              ) : (
                <div
                  className="profile-initials-avatar"
                  role="img"
                  aria-label={`Ảnh đại diện chữ viết tắt ${profile.name}`}
                >
                  <span className="avatar-large-initials">{initials}</span>
                  <span className="avatar-brand-badge">DANAVA SOLUTIONS</span>
                </div>
              )}
            </div>

            <div className="profile-verified-badge">
              <span className="check-icon" aria-hidden="true">✓</span>
              <div>
                <strong>Hồ sơ chính thức</strong>
                <p>Đã xác minh năng lực tại cơ sở</p>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin chức danh, kinh nghiệm & Giới thiệu */}
          <div className="profile-hero-info">
            <div className="profile-meta-pills">
              <span className="profile-dept-pill">{profile.departmentName}</span>
              <span className="profile-exp-pill">{profile.experienceYears}</span>
              <span className="profile-status-pill"><span className="status-dot" /> Đang đồng hành dự án</span>
            </div>

            <h1 className="profile-person-name">{profile.name}</h1>
            <p className="profile-role-title">{profile.role}</p>
            <p className="profile-kicker-desc">{profile.departmentKicker}</p>

            <div className="profile-bio-box">
              <p className="profile-bio-text">{profile.intro}</p>
            </div>

            {/* Link nghề nghiệp được duyệt */}
            <div className="profile-verified-links-wrap">
              <span className="links-label">KÊNH KẾT NỐI ĐÃ DUYỆT:</span>
              <div className="profile-links-list">
                {profile.verifiedLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    className={`profile-contact-pill ${link.type === 'internal' ? 'pill-highlight' : ''}`}
                    {...(link.type === 'external' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span>{link.label}</span>
                    <span className="arrow-icon" aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KỸ NĂNG & NĂNG LỰC CHUYÊN SÂU */}
      <section className="section profile-skills-section">
        <div className="profile-section-container">
          <div className="section-header-compact">
            <p className="eyebrow">NĂNG LỰC CỐT LÕI</p>
            <h2>Kỹ năng &amp; Nghiệp vụ chuyên sâu</h2>
            <p className="section-desc">
              Các kỹ năng thực chiến được tôi luyện qua quá trình trực tiếp khảo sát, phát triển phần mềm và đồng hành vận hành cùng các cơ sở đối tác.
            </p>
          </div>

          <div className="skills-groups-grid">
            {profile.skillGroups.map((group, gIdx) => (
              <div key={gIdx} className="skill-group-card">
                <h3 className="skill-group-title">
                  <span className="title-bullet">◆</span> {group.category}
                </h3>
                <div className="skill-chips-wrap">
                  {group.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="skill-chip">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DỰ ÁN ĐÃ THAM GIA & VAI TRÒ TRỰC TIẾP (QUAN HỆ TỪ /du-an/[slug]) */}
      <section className="section profile-projects-section" id="du-an-thuc-te">
        <div className="profile-section-container">
          <div className="section-header-compact">
            <p className="eyebrow">CHỨNG THỰC NĂNG LỰC THỰC TẾ</p>
            <h2>Dự án đã tham gia &amp; Vai trò đảm nhiệm</h2>
            <p className="section-desc">
              Mỗi dự án đều gắn liền với trách nhiệm và kết quả nghiệm thu cụ thể tại cơ sở, ưu tiên sản phẩm đang vận hành thực tế thay cho lý thuyết.
            </p>
          </div>

          {profile.projects.length === 0 ? (
            <div className="profile-empty-projects">
              <p>Hiện các dự án chuyên sâu đang trong quá trình bảo mật dữ liệu hoặc chưa công bố công khai.</p>
              <Link href="/du-an/" className="button secondary">
                Xem toàn bộ dự án DANAVA ↗
              </Link>
            </div>
          ) : (
            <div className="profile-projects-grid">
              {profile.projects.map((proj) => (
                <article key={proj.projectId} className="profile-project-card">
                  <div className="project-card-media-col">
                    <img
                      src={proj.image}
                      alt={`Dự án ${proj.projectTitle}`}
                      className="project-cover-thumb"
                      loading="lazy"
                    />
                    <div className="project-badge-row">
                      <span className="proj-cat-badge">{proj.category}</span>
                      <span className="proj-client-badge">{proj.client}</span>
                    </div>
                  </div>

                  <div className="project-card-info-col">
                    <h3 className="project-name">
                      <Link href={`/du-an/${proj.projectSlug}/`}>
                        {proj.projectTitle}
                      </Link>
                    </h3>
                    <p className="project-summary-text">{proj.summary}</p>

                    {/* Hộp vai trò trong dự án */}
                    <div className="project-role-callout">
                      <div className="callout-header">
                        <span className="role-tag">VAI TRÒ TRONG DỰ ÁN</span>
                        <strong className="role-name">{proj.roleInProject}</strong>
                      </div>

                      <div className="callout-contributions">
                        <span className="contrib-label">HẠNG MỤC PHỤ TRÁCH &amp; ĐÓNG GÓP:</span>
                        <ul className="contributions-list">
                          {proj.contributions.map((c, cIdx) => (
                            <li key={cIdx}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      {proj.resultHighlight && (
                        <div className="callout-result-highlight">
                          <span className="check-mark">✓</span>
                          <span><strong>Kết quả ghi nhận:</strong> {proj.resultHighlight}</span>
                        </div>
                      )}
                    </div>

                    <div className="project-card-actions">
                      <Link href={`/du-an/${proj.projectSlug}/`} className="button secondary project-view-btn">
                        Xem chi tiết Case Study dự án ↗
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. SẢN PHẨM & ĐÓNG GÓP GIẢI PHÁP */}
      {profile.personalProducts && profile.personalProducts.length > 0 && (
        <section className="section profile-products-section">
          <div className="profile-section-container">
            <div className="section-header-compact">
              <p className="eyebrow">SẢN PHẨM &amp; ĐÓNG GÓP CỐT LÕI</p>
              <h2>Giải pháp xây dựng và phụ trách</h2>
              <p className="section-desc">
                Những module giải pháp, tài liệu quy chuẩn và công cụ do chuyên sự trực tiếp phát triển đóng góp vào hệ sinh thái DANAVA Solutions.
              </p>
            </div>

            <div className="products-cards-grid">
              {profile.personalProducts.map((prod, pIdx) => (
                <div key={pIdx} className="product-item-card">
                  <div className="product-card-top">
                    <span className="product-badge">{prod.badge}</span>
                    {prod.link && (
                      <Link href={prod.link} className="product-link-arrow" aria-label={`Xem ${prod.title}`}>
                        ↗
                      </Link>
                    )}
                  </div>
                  <h3 className="product-title">{prod.title}</h3>
                  <p className="product-desc">{prod.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CAM KẾT CHUYÊN SỰ & NGUYÊN TẮC LÀM VIỆC */}
      <section className="section profile-pledge-section">
        <div className="profile-section-container">
          <div className="pledge-banner-card">
            <div className="pledge-content">
              <p className="eyebrow"><span className="status-dot" /> CAM KẾT ĐỒNG HÀNH</p>
              <h2>Trực tiếp chịu trách nhiệm và giải quyết bài toán đến cùng</h2>
              <p>
                &ldquo;Mọi giải pháp công nghệ đều phải có người đứng mũi chịu sào. Khi bạn làm việc cùng tôi và đội ngũ DANAVA, bạn nhận được sự minh bạch, phản hồi tức thời và sự an tâm tuyệt đối trong từng giai đoạn phát triển.&rdquo;
              </p>
              <div className="pledge-signature">
                <strong>{profile.name}</strong>
                <span>{profile.role} · DANAVA Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA CUỐI TRANG & ĐIỀU HƯỚNG */}
      <section className="section profile-bottom-cta-section">
        <div className="profile-cta-container">
          <h2>Sẵn sàng bắt đầu dự án cùng {profile.name.split(' ').slice(-1)[0]}?</h2>
          <p>
            Hãy để lại thông tin hoặc đặt lịch trao đổi trực tiếp để chúng tôi lắng nghe bài toán và tư vấn phương án phù hợp nhất cho cơ sở của bạn.
          </p>

          <div className="profile-bottom-actions">
            <Link
              href={`/lien-he/?service=${encodeURIComponent(profile.role)}&ref=${profile.id}`}
              className="button amber"
            >
              Đặt lịch làm việc trực tiếp ↗
            </Link>
            <Link href="/doi-ngu/" className="button secondary">
              ← Xem các chuyên gia khác trong Đội ngũ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
