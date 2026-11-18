import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tone } from './catalog';

type Crumb = { href?: string; label: string };

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Đường dẫn" className="s-crumbs">
      {items.map((c, i) => (
        <span key={c.label + i} style={{ display: 'contents' }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
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
  primary = { href: '/lien-he/', label: 'Nhận tư vấn miễn phí' },
  secondary
}: {
  title?: ReactNode; lead?: ReactNode; primary?: { href: string; label: string }; secondary?: { href: string; label: string };
}) {
  return (
    <section className="s-section s-section--tight" aria-label="Liên hệ tư vấn">
      <div className="s-container">
        <div className="s-cta">
          <div>
            <h2 className="s-h2">{title}</h2>
            {lead && <p className="s-lead">{lead}</p>}
          </div>
          <div className="s-row">
            <Link className="s-btn s-btn--light s-btn--lg" href={primary.href}>{primary.label}</Link>
            {secondary && <Link className="s-btn s-btn--outline-light s-btn--lg" href={secondary.href}>{secondary.label}</Link>}
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

