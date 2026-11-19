'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

export type Shot = { src: string; title: string; text?: string };
export type ShotGroup = { id: string; label: string; device: 'desktop' | 'phone'; lead?: string; shots: Shot[] };

/**
 * Thư viện ảnh giao diện sản phẩm: tab theo nhóm màn hình, bấm ảnh để phóng to,
 * xem ảnh trước/sau bằng nút, phím mũi tên hoặc vuốt ngang (điện thoại), Esc để đóng.
 */
export function ProductGallery({ groups, idPrefix }: { groups: ShotGroup[]; idPrefix: string }) {
  const [tab, setTab] = useState(groups[0]?.id);
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const group = groups.find(g => g.id === tab) || groups[0];
  const count = group.shots.length;

  const step = useCallback((d: number) => setOpen(i => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, step]);

  const current = open === null ? null : group.shots[open];

  return (
    <div className="s-gallery">
      {groups.length > 1 && (
        <div className="s-tabs s-gallery__tabs" role="tablist" aria-label="Nhóm màn hình">
          {groups.map(g => (
            <button
              key={g.id}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${g.id}`}
              aria-controls={`${idPrefix}-panel`}
              aria-selected={g.id === group.id}
              className="s-tab"
              onClick={() => { setTab(g.id); setOpen(null); }}
            >
              {g.label}<span className="s-tab__count">{g.shots.length}</span>
            </button>
          ))}
        </div>
      )}
      {group.lead && <p className="s-gallery__lead">{group.lead}</p>}

      <ul
        id={`${idPrefix}-panel`}
        role={groups.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={groups.length > 1 ? `${idPrefix}-tab-${group.id}` : undefined}
        className={`s-gallery__grid s-gallery__grid--${group.device}`}
      >
        {group.shots.map((s, i) => (
          <li key={s.src}>
            <button type="button" className="s-shot" onClick={() => setOpen(i)} aria-label={`Phóng to: ${s.title}`}>
              <span className={`s-shot__frame s-shot__frame--${group.device}`}>
                {group.device === 'desktop' && <span className="s-shot__bar" aria-hidden="true"><i /><i /><i /></span>}
                <img src={s.src} alt={s.title} loading="lazy" decoding="async" />
                <span className="s-shot__zoom" aria-hidden="true"><Maximize2 /></span>
              </span>
              <span className="s-shot__title">{s.title}</span>
              {s.text && <span className="s-shot__text">{s.text}</span>}
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          className="s-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}
          onTouchStart={e => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; }}
          onTouchEnd={e => {
            const start = touch.current; touch.current = null;
            if (!start || count < 2) return;
            const t = e.changedTouches[0], dx = t.clientX - start.x, dy = t.clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
          }}
        >
          <button ref={closeRef} type="button" className="s-lightbox__close" onClick={() => setOpen(null)} aria-label="Đóng"><X /></button>
          {count > 1 && <button type="button" className="s-lightbox__nav s-lightbox__nav--prev" onClick={() => step(-1)} aria-label="Ảnh trước"><ChevronLeft /></button>}
          <figure className={`s-lightbox__fig s-lightbox__fig--${group.device}`}>
            <img src={current.src} alt={current.title} />
            <figcaption>
              <strong>{current.title}</strong>
              {current.text && <span>{current.text}</span>}
              <small>{(open ?? 0) + 1} / {count}</small>
            </figcaption>
          </figure>
          {count > 1 && <button type="button" className="s-lightbox__nav s-lightbox__nav--next" onClick={() => step(1)} aria-label="Ảnh sau"><ChevronRight /></button>}
        </div>
      )}
    </div>
  );
}
