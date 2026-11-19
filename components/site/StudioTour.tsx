'use client';
/**
 * "Một ngày vận hành" — tham quan DANAVA Studio theo vai trò (chủ cơ sở, lễ tân, HLV, hội viên).
 * Mỗi vai trò có 4 màn hình thật; chọn bước để đổi ảnh. Tablist theo chuẩn WAI-ARIA:
 * mũi tên trái/phải đổi vai trò, Home/End về đầu/cuối. Nội dung mọi vai trò đều có trong HTML máy chủ.
 */
import { useRef, useState, type KeyboardEvent } from 'react';
import { Check } from 'lucide-react';

export type TourShot = { src: string; title: string; text: string };
export type TourRole = { id: string; label: string; lead: string; device: 'desktop' | 'phone'; shots: TourShot[] };

export function StudioTour({ roles }: { roles: TourRole[] }) {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (i: number) => { setActive(i); setStep(0); tabs.current[i]?.focus(); };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = roles.length;
    if (e.key === 'ArrowRight') { e.preventDefault(); choose((active + 1) % n); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); choose((active - 1 + n) % n); }
    else if (e.key === 'Home') { e.preventDefault(); choose(0); }
    else if (e.key === 'End') { e.preventDefault(); choose(n - 1); }
  };

  return (
    <div className="st-tour">
      <div className="st-tour__tabs" role="tablist" aria-label="Chọn vai trò">
        {roles.map((r, i) => (
          <button
            key={r.id}
            ref={el => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`st-tab-${r.id}`}
            aria-controls={`st-panel-${r.id}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => { setActive(i); setStep(0); }}
            onKeyDown={onKey}
          >
            <span className="st-tour__n">{String(i + 1).padStart(2, '0')}</span>{r.label}
          </button>
        ))}
      </div>
      {roles.map((r, i) => (
        <div
          key={r.id}
          id={`st-panel-${r.id}`}
          role="tabpanel"
          aria-labelledby={`st-tab-${r.id}`}
          hidden={i !== active}
          className={`st-tour__panel st-tour__panel--${r.device}`}
        >
          <div className="st-tour__copy">
            <p className="st-tour__lead">{r.lead}</p>
            <ol className="st-tour__steps">
              {r.shots.map((s, k) => (
                <li key={s.src}>
                  <button type="button" aria-pressed={i === active && k === step} onClick={() => setStep(k)}>
                    <span className="st-tour__dot" aria-hidden="true">{k === step && i === active ? <Check /> : k + 1}</span>
                    <span><strong>{s.title}</strong><small>{s.text}</small></span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="st-tour__stage">
            {r.shots.map((s, k) => (
              <img
                key={s.src}
                src={s.src}
                alt={`${r.label}: ${s.title} — ${s.text}`}
                className={k === (i === active ? step : 0) ? 'is-on' : ''}
                loading="lazy"
                decoding="async"
                width={r.device === 'phone' ? 430 : 1280}
                height={r.device === 'phone' ? 925 : 800}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
