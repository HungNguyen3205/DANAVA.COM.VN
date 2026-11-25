import type { SiteData } from '@/lib/content';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Phone, type LucideIcon } from 'lucide-react';
import { CONTACT } from '@/lib/company';
import { requestTexts } from '@/lib/request-texts';
import type { ReactNode } from 'react';
import type { Tone } from './catalog';
import { ct } from './cms';

type Crumb = { href?: string; label: string };

/** Khóa chữ ổn định từ một đường dẫn + chữ mặc định (vd. /lien-he/ + "Nhận tư vấn" → lien-he.k3f9a). */
function keyOf(href: string, label: string): string {
  const slug = href.replace(/[?#].*$/, '').split('/').filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60) || 'home';
  let h = 0; for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `${slug}.k${h.toString(36)}`;
}
/** Chữ nút/liên kết dùng chung sửa được (khóa shared.<nhóm>.<đường dẫn>.<mã chữ>). */
/** Dữ liệu trang cho chữ dùng chung khi render trong component trình duyệt (bản sửa + bản dịch); trống = kho của yêu cầu (máy chủ). */
type TextData = (Pick<SiteData, 'texts' | 'localeView'> & { phone?: string }) | null;
function SharedLabel({ group, href, label, what, data = null }: { group: string; href: string; label: string; what: string; data?: TextData }) {
  const x = ct(data, `shared.${group}.${keyOf(href, label)}`, label, what, { scope: 'global' });
  return <span {...x.a}>{x.v}</span>;
}

export function Crumbs({ items, data = null }: { items: Crumb[]; data?: TextData }) {
  return (
    <nav aria-label="Đường dẫn" className="s-crumbs">
      {items.map((c, i) => (
        <span key={c.label + i} style={{ display: 'contents' }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.href ? <Link href={c.href}>{c.href === '/' ? (() => { const x = ct(data, 'shared.crumbs.home', c.label, 'Breadcrumb: trang chủ', { scope: 'global' }); return <span {...x.a}>{x.v}</span>; })() : <SharedLabel data={data} group="crumbs" href={c.href} label={c.label} what="Breadcrumb" />}</Link> : <span aria-current="page"><SharedLabel data={data} group="crumbs-here" href="here" label={c.label} what="Breadcrumb: trang hiện tại" /></span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHead({
  eyebrow, title, lead, crumbs, children, soft = false, center = false
}: {
  eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; crumbs?: Crumb[]; children?: ReactNode; soft?: boolean; center?: boolean;
}) {
  return (
    <header className={`s-pagehead${soft ? ' s-pagehead--soft' : ''}${center ? ' s-center' : ''}`}>
      <div className="s-container">
        <div className="s-pagehead__inner">
          {crumbs && <Crumbs items={crumbs} />}
          {eyebrow && <p className="s-eyebrow">{eyebrow}</p>}
          <h1 className="s-h1">{title}</h1>
          {lead && <p className="s-lead">{lead}</p>}
        </div>
        {children && <div className="s-row">{children}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow, title, lead, center = false, action, id
}: {
  eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; center?: boolean; action?: ReactNode; id?: string;
}) {
  const heading = (
    <div className={`s-heading${center ? ' s-center' : ''}`}>
      {eyebrow && <p className="s-eyebrow">{eyebrow}</p>}
      <h2 className="s-h2" id={id}>{title}</h2>
      {lead && <p className="s-lead">{lead}</p>}
    </div>
  );
  if (action) return <div className="s-heading-row">{heading}{action}</div>;
  return <div className="s-mb">{heading}</div>;
}

export function ArrowLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  if (external) {
    return (
      <a className="s-link" href={href} target="_blank" rel="noopener noreferrer">
        {children}<ArrowUpRight aria-hidden="true" />
      </a>
    );
  }
  return <Link className="s-link" href={href}>{children}<ArrowRight aria-hidden="true" /></Link>;
}

export function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="s-checklist">
      {items.map((item, i) => <li key={i}><Check aria-hidden="true" /><span>{item}</span></li>)}
    </ul>
  );
}

export function IconTile({ icon: Icon, tone = 'blue' }: { icon: LucideIcon; tone?: Tone }) {
  return <span className={`s-icon s-icon--${tone}`} aria-hidden="true"><Icon /></span>;
}

/**
 * Minh họa sản phẩm vẽ bằng CSS — dùng khi chưa có ảnh thật phù hợp,
 * tránh ảnh stock lệch thương hiệu.
 */
export function Visual({ icon: Icon, tone = 'blue', label, chips = [] }: { icon: LucideIcon; tone?: Tone; label?: string; chips?: string[] }) {
  return (
    <div className={`s-visual s-visual--${tone}`} aria-hidden="true">
      <div className="s-visual__panel">
        <span className="s-visual__icon"><Icon /></span>
        {label && <span className="s-visual__label">{label}</span>}
        <span className="s-visual__bars"><i /><i /><i /></span>
      </div>
      {chips.slice(0, 3).map((c, i) => <span key={c} className={`s-visual__chip s-visual__chip--${i + 1}`}>{c}</span>)}
    </div>
  );
}

export function CtaBand({
  title = 'Bắt đầu cùng DANAVA',
  lead = 'Chia sẻ bài toán của bạn. Chuyên viên DANAVA sẽ liên hệ lại để tư vấn giải pháp phù hợp, không ràng buộc.',
  primary = { href: '/lien-he/', label: 'Nhận tư vấn' },
  secondary,
  cms,
  data = null
}: {
  title?: ReactNode; lead?: ReactNode; primary?: { href: string; label: string }; secondary?: { href: string; label: string };
  /** Khóa chỉnh trực tiếp của tiêu đề / câu dẫn (lib/cms-paths.ts) */
  cms?: { title?: string; lead?: string; titleDefault?: string; leadDefault?: string };
  /** Dữ liệu trang khi dùng trong component trình duyệt (bản sửa + bản dịch chữ trên nút) */
  data?: TextData;
}) {
  return (
    <section className="s-section s-section--tight" aria-label="Liên hệ tư vấn" data-cms-block="Dải cuối trang">
      <div className="s-container">
        {/* ANNA đứng cạnh dải, nổi lên khỏi mép trên (ảnh tách nền: public/assets/anna/anna-present.webp) */}
        <div className="s-cta-wrap">
        <figure className="s-cta__anna" aria-hidden="true">
          <span className="s-cta__halo" />
          <span className="s-cta__spark s-cta__spark--1" /><span className="s-cta__spark s-cta__spark--2" /><span className="s-cta__spark s-cta__spark--3" />
          <img src="/assets/anna/anna-present.webp" alt="" width={820} height={857} loading="lazy" decoding="async" />
        </figure>
        {(() => { const b = ct(data, 'shared.cta.anna-bubble', 'Mình là ANNA, sẵn sàng tư vấn cho bạn!', 'Dải cuối trang: lời chào ANNA', { scope: 'global' }); return <p className="s-cta__bubble"><span {...b.a}>{b.v}</span></p>; })()}
        <div className="s-cta s-cta--anna">
          <div>
            <h2 className="s-h2" {...(cms?.title ? { 'data-cms': cms.title, 'data-cms-label': 'Dải cuối trang: tiêu đề', 'data-cms-rich': '', ...(cms.titleDefault ? { 'data-cms-default': cms.titleDefault } : {}) } : {})}>{title}</h2>
            {lead && <p className="s-lead" {...(cms?.lead ? { 'data-cms': cms.lead, 'data-cms-label': cms.lead.startsWith('pages.mac-dinh.') ? 'Dải cuối trang: câu dẫn (dùng chung)' : 'Dải cuối trang: câu dẫn', 'data-cms-multiline': '', ...(cms.leadDefault ? { 'data-cms-default': cms.leadDefault } : {}) } : {})}>{lead}</p>}
          </div>
          <div className="s-row">
            <Link className="s-btn s-btn--light s-btn--lg" href={primary.href}><SharedLabel data={data} group="cta" href={primary.href} label={primary.label} what="Dải cuối trang: nút chính" /></Link>
            {secondary && <Link className="s-btn s-btn--outline-light s-btn--lg" href={secondary.href}><SharedLabel data={data} group="cta" href={secondary.href} label={secondary.label} what="Dải cuối trang: nút phụ" /></Link>}
            {(() => {
              // Hotline: số trong Cài đặt website → Liên hệ (trình duyệt: data.phone; máy chủ: kho của yêu cầu), mặc định số công ty
              let phone = data?.phone || '';
              if (!phone) { try { phone = requestTexts().phone || ''; } catch {} }
              phone = phone || CONTACT.phone;
              // Hiển thị dễ đọc: 0935917677 → 0935 91 76 77 (số đã có khoảng trắng thì giữ nguyên)
              const shown = /^0\d{9}$/.test(phone.trim()) ? phone.trim().replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4') : phone;
              const digits = phone.replace(/[^\d+]/g, '');
              const label = ct(data, 'shared.cta.hotline', 'Hotline', 'Dải cuối trang: nút hotline', { scope: 'global' });
              return <a className="s-btn s-btn--outline-light s-btn--lg s-cta__hotline" href={`tel:${digits}`}><Phone aria-hidden="true" /><span {...label.a}>{label.v}</span> <b>{shown}</b></a>;
            })()}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const text = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2);
  return <span aria-hidden="true">{text.toUpperCase()}</span>;
}

/** Tô màu 2 từ cuối của tiêu đề CMS (vd. "Cùng bạn [phát triển.]"). */
export function Highlight({ text, words = 2 }: { text: string; words?: number }) {
  const parts = text.trim().split(/\s+/);
  if (parts.length <= words) return <span className="s-mark">{text}</span>;
  return <>{parts.slice(0, -words).join(' ')} <span className="s-mark">{parts.slice(-words).join(' ')}</span></>;
}

export function SwipeHint() {
  return <p className="s-swipe-hint" aria-hidden="true">Vuốt để xem thêm <ArrowRight /></p>;
}

