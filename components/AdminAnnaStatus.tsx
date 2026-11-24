'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Hệ thống → Tích hợp: ANNA đã nối được AI chưa và cần cấu hình gì trên máy chủ. Không bao giờ hiện giá trị khóa. */
export function AnnaStatus() {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/api/anna/', { cache: 'no-store' }).then(r => r.json()).then(v => setReady(!!v.ready)).catch(() => setReady(false));
  }, []);
  return (
    <section className="admin-panel" role="status">
      <h2>Trợ lý ANNA · kết nối AI</h2>
      <p><b>{ready === null ? 'Đang kiểm tra…' : ready ? 'Đã cấu hình khóa API' : 'Chưa hoạt động: thiếu khóa API hoặc ANNA đang tắt'}</b></p>
      <p className="field-note">
        Khóa không nhập ở đây. Trên cPanel → Setup Node.js App, đặt một trong hai biến rồi Restart:
        <code>GEMINI_API_KEY</code> (ưu tiên nếu có, model mặc định gemini-flash-latest) hoặc <code>ANTHROPIC_API_KEY</code>.
        Tùy chọn: <code>DANAVA_AI_MODEL</code> và <code>DANAVA_AI_DAILY_LIMIT</code> (mặc định 500 câu hỏi/ngày cho cả website).
        Có khóa chưa chắc khóa còn hạn mức: hãy hỏi thử một câu trên website sau khi cấu hình.
      </p>
      <p className="field-note">Lời chào, câu hỏi gợi ý và nguồn dữ liệu ANNA được chỉnh ở <Link className="text-link" href="/admin/chinh-sua/?panel=site">Chỉnh sửa website → Thiết lập website → Widget ANNA</Link>.</p>
    </section>
  );
}
