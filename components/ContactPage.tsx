'use client';

import Link from 'next/link';
import { useState, useEffect, type FormEvent } from 'react';
import { useSite } from './SiteStore';
import {
  VALID_CONTACT_SERVICES,
  VALID_BUSINESS_TYPES,
  resolveValidService,
  isValidPhoneNumber
} from '@/lib/contact-services';

export function ContactTwoColumnPage() {
  const { data } = useSite();

  // State các trường của Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState(VALID_BUSINESS_TYPES[0]);
  const [service, setService] = useState(VALID_CONTACT_SERVICES[0].label);
  const [message, setMessage] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // State trạng thái gửi
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{ id: string; message: string } | null>(null);

  // Đọc tham số URL ?service=... và lưu trang nguồn
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const svcParam = params.get('service');
      if (svcParam) {
        setService(resolveValidService(svcParam));
      }

      // Lưu URL trang người dùng đứng trước hoặc referrer
      const referrer = document.referrer || window.location.href;
      setSourceUrl(referrer);
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validation cơ bản
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại để chuyên viên DANAVA liên hệ.');
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setErrorMsg('Số điện thoại không đúng định dạng (Ví dụ: 0905123456 hoặc +84905123456).');
      return;
    }

    if (!message.trim()) {
      setErrorMsg('Vui lòng chia sẻ sơ lược nhu cầu hoặc bài toán bạn đang cần giải quyết.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        businessType,
        service,
        message: message.trim(),
        source: sourceUrl,
        website_trap: (e.currentTarget.elements.namedItem('website_trap') as HTMLInputElement)?.value || ''
      };

      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resJson.error || 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại.');
      }

      // Ghi nhận thành công
      setSuccessData({
        id: resJson.id || 'lead_success',
        message: resJson.message || 'Yêu cầu của bạn đã được gửi thành công đến DANAVA Solutions.'
      });

      // Reset form fields
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Đã có lỗi xảy ra trong quá trình gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSuccessData(null);
    setErrorMsg('');
  }

  return (
    <main id="main" className="contact-two-col-page">
      {/* SECTION BỐ CỤC HAI CỘT CHÍNH */}
      <section className="contact-main-section">
        <div className="contact-container">
          {/* CỘT 1 (BÊN TRÁI): THÔNG TIN DANAVA */}
          <div className="contact-info-col">
            <div className="contact-info-header">
              <span className="info-kicker">KẾT NỐI TRỰC TIẾP · DANAVA SOLUTIONS</span>
              <h1 className="info-title">
                Bắt đầu bằng một <em>cuộc trò chuyện.</em>
              </h1>
              <p className="info-desc">
                Kể cho DANAVA về bài toán bạn đang ấp ủ. Đội ngũ chuyên gia công nghệ và truyền thông của chúng tôi sẽ cùng bạn phân tích và tìm ra hướng triển khai tối ưu nhất.
              </p>
            </div>

            {/* DANH SÁCH THẺ THÔNG TIN LIÊN HỆ */}
            <div className="contact-cards-stack">
              {/* Thẻ Hotline */}
              <div className="contact-info-card">
                <span className="card-icon" aria-hidden="true">📞</span>
                <div className="card-detail">
                  <span className="card-label">HOTLINE TƯ VẤN TRỰC TIẾP</span>
                  <a href={`tel:${data.phone || '0935917677'}`} className="card-value highlight-link">
                    {data.phone || '0935 91 76 77'}
                  </a>
                  <span className="card-subtext">Hỗ trợ 24/7 cho các tình huống vận hành khẩn cấp</span>
                </div>
              </div>

              {/* Thẻ Email */}
              <div className="contact-info-card">
                <span className="card-icon" aria-hidden="true">✉️</span>
                <div className="card-detail">
                  <span className="card-label">EMAIL DỰ ÁN &amp; HỢP TÁC</span>
                  <a href={`mailto:${data.email || 'hello@danava.vn'}`} className="card-value highlight-link">
                    {data.email || 'hello@danava.vn'}
                  </a>
                  <span className="card-subtext">Tiếp nhận đề xuất hợp tác và yêu cầu báo giá</span>
                </div>
              </div>

              {/* Thẻ Văn phòng */}
              <div className="contact-info-card">
                <span className="card-icon" aria-hidden="true">📍</span>
                <div className="card-detail">
                  <span className="card-label">VĂN PHÒNG LÀM VIỆC</span>
                  <p className="card-value">08 Đặng Vũ Hỷ, An Hải, Sơn Trà, Đà Nẵng</p>
                  <span className="card-subtext">Giờ mở cửa: Thứ Hai – Thứ Bảy (08:00 – 18:00)</span>
                </div>
              </div>
            </div>

            {/* KÊNH HỖ TRỢ TRỰC TUYẾN & CAM KẾT */}
            <div className="contact-guarantees-box">
              <span className="guarantee-title">CAM KẾT TỪ DANAVA:</span>
              <ul className="guarantee-list">
                <li><span className="check-icon" aria-hidden="true">✓</span> Phản hồi trong vòng 2 – 4 giờ làm việc.</li>
                <li><span className="check-icon" aria-hidden="true">✓</span> Khảo sát bài toán và tư vấn phương án ban đầu miễn phí.</li>
                <li><span className="check-icon" aria-hidden="true">✓</span> Bảo mật tuyệt đối mọi thông tin và dữ liệu kinh doanh của khách hàng.</li>
              </ul>
              <div className="social-quick-pills">
                <a
                  href="https://zalo.me/0935917677"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quick-pill zalo-pill"
                >
                  <span>Nhắn tin qua Zalo OA</span> ↗
                </a>
                <Link href="/giai-phap/danava-studio/" className="quick-pill studio-pill">
                  <span>Trải nghiệm DANAVA Studio</span> ↗
                </Link>
              </div>
            </div>
          </div>

          {/* CỘT 2 (BÊN PHẢI): FORM TIẾP NHẬN LEAD */}
          <div className="contact-form-col">
            <div className="form-card-wrapper">
              <div className="form-card-header">
                <span className="form-badge">TIẾP NHẬN YÊU CẦU</span>
                <h2 className="form-title">Gửi yêu cầu giải pháp &amp; Báo giá</h2>
                <p className="form-subtitle">
                  Điền thông tin bên dưới để chuyên viên phụ trách giải pháp liên hệ hỗ trợ bạn sớm nhất.
                </p>
              </div>

              {/* THÔNG BÁO THÀNH CÔNG SAU KHI GHI DỮ LIỆU */}
              {successData ? (
                <div className="contact-success-state" role="status" aria-live="polite">
                  <div className="success-icon" aria-hidden="true">🎉</div>
                  <h3>Yêu cầu đã được tiếp nhận thành công!</h3>
                  <p className="success-desc">{successData.message}</p>
                  <div className="success-meta-box">
                    <span>Mã yêu cầu:</span> <strong>{successData.id}</strong>
                  </div>
                  <p className="success-hint">
                    Chuyên viên của DANAVA Solutions sẽ xem xét và liên hệ qua số điện thoại bạn đã cung cấp trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    className="button amber success-reset-btn"
                    onClick={handleReset}
                  >
                    Gửi thêm yêu cầu khác ↗
                  </button>
                </div>
              ) : (
                /* FORM NHẬP THÔNG TIN */
                <form onSubmit={handleSubmit} className="contact-lead-form" noValidate>
                  {/* Bẫy Honeypot ẩn chống bot spam */}
                  <input
                    type="text"
                    name="website_trap"
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Thông báo lỗi nếu có */}
                  {errorMsg && (
                    <div className="form-alert-error" role="alert">
                      <span className="error-symbol" aria-hidden="true">⚠️</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* 1. Họ và tên */}
                  <div className="form-field-group">
                    <label htmlFor="contact-name" className="field-label">
                      Họ và tên của bạn <span className="req">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ví dụ: Lê Anh Tuấn"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {/* 2. Số điện thoại & Email (Grid 2 cột) */}
                  <div className="form-grid-two">
                    <div className="form-field-group">
                      <label htmlFor="contact-phone" className="field-label">
                        Số điện thoại liên hệ <span className="req">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="Ví dụ: 0935 917 677"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="contact-email" className="field-label">
                        Địa chỉ Email <span className="opt">(Khuyến nghị)</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* 3. Loại hình kinh doanh & Dịch vụ quan tâm */}
                  <div className="form-grid-two">
                    <div className="form-field-group">
                      <label htmlFor="contact-business-type" className="field-label">
                        Loại hình kinh doanh <span className="req">*</span>
                      </label>
                      <select
                        id="contact-business-type"
                        name="businessType"
                        value={businessType}
                        onChange={e => setBusinessType(e.target.value)}
                        className="form-select"
                      >
                        {VALID_BUSINESS_TYPES.map(bt => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="contact-service" className="field-label">
                        Dịch vụ quan tâm <span className="req">*</span>
                      </label>
                      <select
                        id="contact-service"
                        name="service"
                        value={service}
                        onChange={e => setService(e.target.value)}
                        className="form-select"
                      >
                        {VALID_CONTACT_SERVICES.map(s => (
                          <option key={s.id} value={s.label}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4. Nhu cầu trao đổi chi tiết */}
                  <div className="form-field-group">
                    <label htmlFor="contact-message" className="field-label">
                      Nhu cầu hoặc bài toán cần trao đổi <span className="req">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Mô tả hiện trạng của bạn: Quy mô học viên, số cơ sở hiện tại, tính năng cần thiết hoặc thời gian dự kiến triển khai..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="form-textarea"
                    />
                  </div>

                  {/* 5. Nút gửi Form */}
                  <div className="form-action-group">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="button amber form-submit-btn"
                    >
                      {submitting ? (
                        <>
                          <span className="btn-spinner" aria-hidden="true" />
                          <span>Đang gửi yêu cầu…</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi yêu cầu trao đổi với DANAVA</span>
                          <span aria-hidden="true">↗</span>
                        </>
                      )}
                    </button>
                    <p className="form-privacy-note">
                      🔒 Thông tin của bạn được bảo mật tuyệt đối theo chính sách bảo vệ dữ liệu của DANAVA Solutions.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactTwoColumnPage;

