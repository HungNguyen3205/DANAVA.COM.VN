'use client';
import { useEffect, useState } from 'react';

/** Cho quản trị viên biết ANNA đã nối được AI chưa và cần cấu hình gì trên máy chủ. */
export function AnnaStatus() {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/api/anna/', { cache: 'no-store' }).then(r => r.json()).then(v => setReady(!!v.ready)).catch(() => setReady(false));
  }, []);
  return (
    <section className="admin-panel" role="status">
      <h2>Trạng thái kết nối AI</h2>
      <p><b>{ready === null ? 'Đang kiểm tra…' : ready ? 'Đã cấu hình khóa API' : 'Chưa hoạt động: thiếu khóa API hoặc ANNA đang tắt'}</b></p>
      <p className="field-note">
        Khóa không nhập ở đây. Trên cPanel → Setup Node.js App, đặt biến <code>ANTHROPIC_API_KEY</code> rồi Restart.
        Tùy chọn: <code>DANAVA_AI_MODEL</code> (mặc định claude-opus-5-5) và <code>DANAVA_AI_DAILY_LIMIT</code> (mặc định 500 câu hỏi/ngày cho cả website).
        Có khóa chưa chắc khóa còn hạn mức: hãy hỏi thử một câu trên website sau khi cấu hình.
      </p>
    </section>
  );
}
