'use client';
/** Cài đặt website → Theo dõi: mã Google Analytics 4, Google Tag Manager, Meta Pixel (components/TrackingTags.tsx nạp vào website). */
import type { SiteData, Tracking } from '@/lib/content';
import { TRACKING_RULES } from '@/lib/content';

const FIELDS: { key: keyof Tracking; label: string; placeholder: string; hint: string }[] = [
  { key: 'ga4', label: 'Google Analytics 4', placeholder: 'G-XXXXXXXXXX', hint: 'Mã đo lường (Measurement ID) trong Google Analytics → Quản trị → Luồng dữ liệu.' },
  { key: 'gtm', label: 'Google Tag Manager', placeholder: 'GTM-XXXXXXX', hint: 'Mã vùng chứa (Container ID) trong Tag Manager.' },
  { key: 'metaPixel', label: 'Meta Pixel ID', placeholder: '123456789012345', hint: 'Dãy số Pixel trong Meta Events Manager (Facebook Ads).' }
];

export function TrackingEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const t = draft.tracking || {};
  const set = (key: keyof Tracking, raw: string) => {
    const v = key === 'metaPixel' ? raw.replace(/\D/g, '') : raw.trim().toUpperCase();
    const next: Tracking = { ...t, [key]: v || undefined };
    if (!v) delete next[key];
    setDraft({ ...draft, tracking: Object.keys(next).length ? next : undefined });
  };
  return (
    <section className="admin-panel ps-page">
      <h2>Mã theo dõi</h2>
      <p className="field-note">
        Dán mã, hệ thống tự chèn script vào website. Script <b>chỉ chạy khi khách bấm “Đồng ý”</b> ở bảng cookie và không chạy trong trang quản trị.
        Để trống = không dùng. Bấm <b>Xuất bản</b> để áp dụng.
      </p>
      <div className="tk-grid">
        {FIELDS.map(f => {
          const v = t[f.key] || '';
          const bad = !!v && !TRACKING_RULES[f.key].test(v);
          return (
            <label key={f.key} className="pf-field">
              <span className="ps-label">{f.label}{v && <small className={`ps-count ${bad ? 'is-over' : 'is-good'}`}>{bad ? 'Sai định dạng' : 'Hợp lệ'}</small>}</span>
              <input value={v} placeholder={f.placeholder} maxLength={30} spellCheck={false} aria-invalid={bad} onChange={e => set(f.key, e.target.value)} />
              <small className="ps-hint">{f.hint}</small>
            </label>
          );
        })}
      </div>
      <p className="field-note">Website vẫn giữ bộ đếm truy cập nội bộ (Báo cáo → Truy cập). Khi dùng thêm Google/Meta, nên bổ sung tên các dịch vụ này vào Chính sách riêng tư.</p>
    </section>
  );
}
