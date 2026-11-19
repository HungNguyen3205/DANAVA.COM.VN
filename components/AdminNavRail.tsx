'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

/* Thanh bên thu gọn (> 1024px): dải icon. Nhóm một mục là nút đi thẳng; nhóm nhiều mục mở
   danh sách nổi bên cạnh khi rê chuột (đóng trễ ngắn để kịp di chuột sang) hoặc khi bấm
   (ghim tới khi bấm ra ngoài hoặc Esc). Ngăn kéo điện thoại luôn hiện menu đầy đủ. */

export type RailSection = {
  group: string;
  icon: LucideIcon;
  items: { slug: string; label: string; icon: LucideIcon; count?: number }[];
};

export function AdminNavRail({
  sections,
  active,
  onNavigate,
}: {
  sections: RailSection[];
  active: string;
  onNavigate: (slug: string) => void;
}) {
  const [pinned, setPinned] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pos, setPos] = useState({ top: 80, left: 100 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const railRef = useRef<HTMLElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const open = pinned ?? hover;

  useEffect(() => {
    if (!pinned) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || railRef.current?.contains(t)) return;
      setPinned(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPinned(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pinned]);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const keep = () => timer.current && clearTimeout(timer.current);
  const anchor = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const side = el.closest('.ds-sidebar')?.getBoundingClientRect().right ?? r.right;
    setPos({ top: Math.max(8, Math.min(r.top - 6, window.innerHeight - 280)), left: side + 10 });
  };
  const enter = (key: string, el: HTMLElement) => {
    keep();
    anchor(el);
    setHover(key);
  };
  const leave = () => {
    keep();
    timer.current = setTimeout(() => setHover(null), 180);
  };
  const toggle = (key: string, el: HTMLElement) => {
    anchor(el);
    setPinned(cur => (cur === key ? null : key));
  };
  const go = (slug: string) => {
    setPinned(null);
    setHover(null);
    onNavigate(slug);
  };

  const popSection = sections.find(s => s.group === open);

  return (
    <>
      <nav ref={railRef} className="ds-rail" aria-label="Menu thu gọn">
        {sections.map(s => {
          const isActive = s.items.some(it => it.slug === active);
          const count = s.items.reduce((n, it) => n + (it.count || 0), 0);
          if (s.items.length === 1) {
            const item = s.items[0];
            const Icon = item.icon;
            return (
              <button
                key={s.group}
                type="button"
                className={'ds-rail-btn' + (isActive ? ' is-active' : '')}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => go(item.slug)}
              >
                <Icon size={19} />
              </button>
            );
          }
          const Icon = s.icon;
          const isOpen = open === s.group;
          return (
            <button
              key={s.group}
              type="button"
              className={'ds-rail-btn' + (isActive ? ' is-active' : '') + (isOpen ? ' is-open' : '')}
              title={s.group}
              aria-label={s.group}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onMouseEnter={e => enter(s.group, e.currentTarget)}
              onMouseLeave={leave}
              onClick={e => toggle(s.group, e.currentTarget)}
            >
              <Icon size={19} />
              {count > 0 && <span className="ds-rail-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </nav>

      {open && popSection && (
        <div
          ref={popRef}
          className="ds-rail-pop"
          role="menu"
          aria-label={popSection.group}
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={keep}
          onMouseLeave={leave}
        >
          <div className="ds-rail-pop-head">
            <popSection.icon size={15} />
            <span>{popSection.group}</span>
          </div>
          <div className="ds-rail-pop-list">
            {popSection.items.map(item => {
              const Icon = item.icon;
              const on = item.slug === active;
              return (
                <button
                  key={item.slug}
                  type="button"
                  role="menuitem"
                  className={on ? 'is-active' : undefined}
                  aria-current={on ? 'page' : undefined}
                  onClick={() => go(item.slug)}
                >
                  <span className="ds-rail-pop-icon">
                    <Icon size={14} />
                  </span>
                  <span>{item.label}</span>
                  {!!item.count && <span className="ds-count">{item.count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
