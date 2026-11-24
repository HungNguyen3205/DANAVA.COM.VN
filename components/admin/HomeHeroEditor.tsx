'use client';
/**
 * Website → Trang → Trang chủ → Màn mở đầu: sửa chữ màn mở đầu đang hiển thị (lib/home-hero.ts)
 * và xem trước theo đúng bố cục hiện tại của trang chủ (nhãn nhỏ, tiêu đề 2 dòng navy/cam, câu dẫn, 2 nút, ảnh văn phòng).
 * Mô hình 3D văn phòng dùng chung component OfficeScene với trang chủ, kể cả nút Mã QR Zalo (lấy từ kênh liên hệ đang soạn).
 */
import { ArrowRight, ExternalLink, Monitor, RotateCcw, Smartphone, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { SiteData } from '@/lib/content';
import { DEFAULT_HOME_HERO, HOME_HERO_LIMITS, homeHero, type HomeHero } from '@/lib/home-hero';
import { okLink } from '@/lib/page-blocks';
import { OfficeScene } from '../site/OfficeScene';
import { contactChannels } from '@/lib/contact-channels';
import { Button, Card, FormSection, TabBar, ask } from './kit';

const FIELDS: { key: keyof HomeHero; label: string; hint?: string; long?: boolean }[] = [
  { key: 'kicker', label: 'Nhãn nhỏ phía trên tiêu đề' },
  { key: 'line1', label: 'Tiêu đề dòng 1 (màu navy)' },
  { key: 'line2', label: 'Tiêu đề dòng 2 (màu cam, nhấn mạnh)' },
  { key: 'lead', label: 'Câu dẫn', long: true }
];

export function HomeHeroEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const hero = homeHero(draft);
  const [device, setDevice] = useState('desktop');
  const saved = draft.homeHero || {};
  const set = (key: keyof HomeHero, value: string) => {
    const next = { ...saved, [key]: value };
    // Giống chữ mặc định thì không lưu riêng (website tự dùng mặc định)
    if (!value.trim() || value === DEFAULT_HOME_HERO[key]) delete next[key];
    setDraft({ ...draft, homeHero: Object.keys(next).length ? next : undefined });
  };
  const input = (key: keyof HomeHero, label: string, long?: boolean, placeholder?: string) => {
    const value = saved[key] ?? '';
    const bad = key.endsWith('Href') && value !== '' && !okLink(value);
    return (
      <label key={key}>{label}
        {long
          ? <textarea rows={3} maxLength={HOME_HERO_LIMITS[key]} value={value} placeholder={DEFAULT_HOME_HERO[key]} onChange={e => set(key, e.target.value)} />
          : <input maxLength={HOME_HERO_LIMITS[key]} value={value} placeholder={placeholder ?? DEFAULT_HOME_HERO[key]} aria-invalid={bad || undefined} onChange={e => set(key, e.target.value)} />}
        {bad && <small className="field-note is-error">Đường dẫn dạng /trang/ hoặc https://…</small>}
      </label>
    );
  };

  return (
    <div className="ax-hero-ed">
      <div className="blk-stack">
        <FormSection title="Chữ màn mở đầu" description="Để trống ô = dùng chữ đang hiển thị (chữ mờ trong ô).">
          {FIELDS.map(f => input(f.key, f.label, f.long))}
        </FormSection>
        <FormSection title="Nút kêu gọi" description="Nút chính màu cam và nút phụ viền trắng">
          <div className="ax-grid-form">
            {input('primaryLabel', 'Nút chính: chữ')}
            {input('primaryHref', 'Nút chính: đường dẫn')}
            {input('secondaryLabel', 'Nút phụ: chữ')}
            {input('secondaryHref', 'Nút phụ: đường dẫn')}
          </div>
        </FormSection>
        <FormSection title="Khẩu hiệu thương hiệu" description="Dùng ở trang Liên hệ, Tuyển dụng và dữ liệu cho Google" advanced>
          <label>Khẩu hiệu<input maxLength={150} value={draft.headline} onChange={e => setDraft({ ...draft, headline: e.target.value })} /></label>
        </FormSection>
        {draft.homeHero && (
          <div><Button variant="ghost" onClick={async () => { if (await ask('Dùng lại chữ mặc định cho màn mở đầu?', { body: 'Thay đổi áp dụng khi lưu.', confirmLabel: 'Khôi phục', tone: 'primary' })) setDraft({ ...draft, homeHero: undefined }); }}><RotateCcw size={15} /> Khôi phục chữ mặc định</Button></div>
        )}
      </div>

      <Card title="Xem trước" description="Theo bố cục trang chủ hiện tại. Mô hình 3D kéo xoay được, bấm Mã QR Zalo để xem bảng mã như trên website."
        actions={<a className="ax-btn ax-btn--secondary ax-btn--sm" href="/" target="_blank" rel="noopener"><ExternalLink size={14} /> Mở trang chủ</a>}>
        <TabBar size="sm" tabs={[{ id: 'desktop', label: 'Máy tính' }, { id: 'mobile', label: 'Điện thoại' }]} value={device} onChange={setDevice} label="Thiết bị xem trước" />
        <div className={`ax-hero-pv${device === 'mobile' ? ' is-mobile' : ''}`} aria-label="Xem trước màn mở đầu">
          <div className="ax-hero-pv__copy">
            <p className="ax-hero-pv__pill"><Sparkles size={13} aria-hidden="true" />{hero.kicker}</p>
            <h2 className="ax-hero-pv__title"><span>{hero.line1}</span><em>{hero.line2}</em></h2>
            <p className="ax-hero-pv__lead">{hero.lead}</p>
            <div className="ax-hero-pv__cta">
              <span className="ax-hero-pv__btn is-primary">{hero.primaryLabel} <ArrowRight size={14} aria-hidden="true" /></span>
              {hero.secondaryLabel && <span className="ax-hero-pv__btn">{hero.secondaryLabel}</span>}
            </div>
          </div>
          <div className="ax-hero-pv__media"><OfficeScene fallback="/assets/about/office-sm.webp" qrUrl={contactChannels(draft).zalo} /></div>
        </div>
        <p className="field-note" style={{ marginTop: 12 }}>
          <Monitor size={13} style={{ verticalAlign: -2 }} /> / <Smartphone size={13} style={{ verticalAlign: -2 }} /> Bấm “Chỉnh trực tiếp” để sửa ngay trên trang chủ thật (nhấn giữ phần cần sửa).
        </p>
      </Card>
    </div>
  );
}
