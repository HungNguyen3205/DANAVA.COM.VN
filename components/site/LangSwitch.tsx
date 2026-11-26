'use client';
/**
 * Chọn ngôn ngữ website (Tiếng Việt / English / 日本語) — lib/i18n.ts.
 *  - LangSwitch: nút trên thanh đầu trang (menu nhỏ) hoặc hàng nút trong menu điện thoại (variant="row").
 *  - LocaleLinks: khi đang xem /en/ hoặc /ja/, liên kết nội bộ giữ nguyên ngôn ngữ (bấm, mở tab mới, công cụ tìm kiếm).
 * Ngôn ngữ đang xem lấy từ dữ liệu trang (SiteData.localeView, máy chủ đặt theo đường dẫn).
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { Flag } from './Flag';
import { useSite } from '../SiteStore';
import { LOCALES, LOCALE_INFO, localePath, localizable, splitLocale, type Locale } from '@/lib/i18n';

export function useLocale(): Locale {
  return useSite().data.localeView?.loc ?? 'vi';
}

/** Đường dẫn trang hiện tại ở ngôn ngữ khác (giữ ?… và #…). */
function hrefFor(loc: Locale) {
  if (typeof window === 'undefined') return localePath('/', loc);
  const { path } = splitLocale(window.location.pathname);
  return localePath(path, loc) + window.location.search.replace(/([?&])cms=1(&|$)/, '$1').replace(/[?&]$/, '') + window.location.hash;
}

export function LangSwitch({ variant = 'menu', onPick }: { variant?: 'menu' | 'row' | 'flags'; onPick?: () => void }) {
  const current = useLocale();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);
  // Đổi ngôn ngữ = tải lại trang ở đường dẫn mới (máy chủ render đúng ngôn ngữ, kể cả SEO và <html lang>)
  const go = (loc: Locale) => { onPick?.(); setOpen(false); if (loc !== current) window.location.assign(hrefFor(loc)); };

  // Đầu trang điện thoại: 3 lá cờ bấm thẳng (không cần mở menu) — yêu cầu khách 26/11/2026
  if (variant === 'flags') {
    return (
      <div className="s-lang-flags" role="group" aria-label="Ngôn ngữ / Language / 言語">
        {LOCALES.map(l => (
          <button key={l} type="button" lang={LOCALE_INFO[l].html} aria-pressed={l === current} aria-label={LOCALE_INFO[l].label} title={LOCALE_INFO[l].label} onClick={() => go(l)}><Flag loc={l} /></button>
        ))}
      </div>
    );
  }
  if (variant === 'row') {
    return (
      <div className="s-lang-row" role="group" aria-label="Ngôn ngữ / Language / 言語">
        {LOCALES.map(l => (
          <button key={l} type="button" lang={LOCALE_INFO[l].html} aria-pressed={l === current} onClick={() => go(l)}><Flag loc={l} /><span>{LOCALE_INFO[l].label}</span></button>
        ))}
      </div>
    );
  }
  return (
    <div className="s-lang" ref={box}>
      <button type="button" className="s-lang__btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(v => !v)}
        aria-label={`Ngôn ngữ / Language / 言語: ${LOCALE_INFO[current].label}`}>
        <Flag loc={current} /><span>{LOCALE_INFO[current].short}</span><ChevronDown aria-hidden="true" className="s-lang__chev" />
      </button>
      {open && (
        <ul className="s-lang__menu" role="menu">
          {LOCALES.map(l => (
            <li key={l} role="none">
              <button type="button" role="menuitemradio" aria-checked={l === current} lang={LOCALE_INFO[l].html} onClick={() => go(l)}>
                <Flag loc={l} /><span>{LOCALE_INFO[l].label}</span><small>{LOCALE_INFO[l].short}</small>{l === current && <Check aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Đang xem /en/ hoặc /ja/: liên kết nội bộ giữ ngôn ngữ.
 * - Bấm: chặn điều hướng mặc định (kể cả next/link) và chuyển tới đường dẫn có tiền tố ngôn ngữ.
 * - Thuộc tính href được viết lại (rê chuột, mở tab mới, công cụ tìm kiếm đọc trang sau khi chạy JS).
 */
export function LocaleLinks() {
  const loc = useLocale();
  const router = useRouter();
  useEffect(() => {
    if (loc === 'vi') return;
    const fix = (a: HTMLAnchorElement) => {
      const raw = a.getAttribute('href') || '';
      if (!raw.startsWith('/') || raw.startsWith('//') || a.hasAttribute('data-lang-keep')) return;
      const next = localePath(raw, loc);
      if (next !== raw) a.setAttribute('href', next);
    };
    const all = () => document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach(fix);
    all();
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.target instanceof HTMLAnchorElement) fix(m.target);
        m.addedNodes.forEach(n => { if (n instanceof HTMLElement) { if (n instanceof HTMLAnchorElement) fix(n); n.querySelectorAll?.<HTMLAnchorElement>('a[href^="/"]').forEach(fix); } });
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      // Trong trình biên tập của admin (?cms=1): trình biên tập tự xử lý điều hướng (href đã có tiền tố ngôn ngữ)
      if (/[?&]cms=1(&|$)/.test(location.search)) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-lang-keep')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !localizable(url.pathname)) return;
      const want = localePath(url.pathname, loc) + url.search + url.hash;
      // Luôn tự điều hướng: next/link dùng đường dẫn gốc (tiếng Việt) trong props, không theo href đã viết lại
      e.preventDefault();
      if (url.pathname === location.pathname && url.search === location.search && url.hash) { location.hash = url.hash; return; }
      router.push(want);
    };
    document.addEventListener('click', onClick, true);
    return () => { mo.disconnect(); document.removeEventListener('click', onClick, true); };
  }, [loc, router]);
  return null;
}
