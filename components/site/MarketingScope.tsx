'use client';

import { ArrowRight, Check, FileCheck2, MessageSquare, ScanLine, UserRoundCheck } from 'lucide-react';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { resetArtwork, tiltArtwork } from './marketing-art-motion';
import { MARKETING_STAGES } from './marketing-scope';
import { useSite } from '../SiteStore';
import { ct } from './cms';
import { rich } from './rich';
import { txt } from '@/lib/site-text';

export function MarketingScope() {
  const [selected, setSelected] = useState(0);
  const { data } = useSite();
  // Chữ cố định (khóa marketing.scope.*); tên khâu dùng chung khóa marketing.stages.<id>.title với MarketingPage.tsx
  const m = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `marketing.${k}`, def, label, opts);
  const S = (k: string, def: string, label: string, inline = false) => { const x = m(k, def, label); return <span style={inline ? { display: 'inline' } : undefined} {...x.a}>{x.v}</span>; };
  const title = m('scope.title', 'Năm khâu, *một kế hoạch*', 'Tiêu đề', { rich: true });

  useEffect(() => {
    function selectFromHash() {
      const hash = window.location.hash.slice(1);
      const index = MARKETING_STAGES.findIndex(stage => stage.id === hash);
      if (index >= 0 || !hash) setSelected(Math.max(0, index));
    }

    selectFromHash();
    window.addEventListener('hashchange', selectFromHash);
    return () => window.removeEventListener('hashchange', selectFromHash);
  }, []);

  function selectStage(index: number) {
    const { id } = MARKETING_STAGES[index];
    setSelected(index);
    if (window.location.hash !== `#${id}`) window.history.replaceState(window.history.state, '', `#${id}`);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = MARKETING_STAGES.length;
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight': next = (index + 1) % count; break;
      case 'ArrowUp':
      case 'ArrowLeft': next = (index + count - 1) % count; break;
      case 'Home': next = 0; break;
      case 'End': next = count - 1; break;
      default: return;
    }
    event.preventDefault();
    selectStage(next);
    document.getElementById(`mk-stage-tab-${MARKETING_STAGES[next].id}`)?.focus({ preventScroll: true });
  }

  return (
    <section className="mk-scope" aria-labelledby="mk-pillars-title">
      <div className="s-container">
        <header className="mk-scope__heading">
          <div>
            <p className="s-eyebrow">{S('scope.kicker', 'Phạm vi dịch vụ', 'Dòng chữ nhỏ')}</p>
            <h2 className="mk-section-title" id="mk-pillars-title" {...title.a}>{rich(title.v)}</h2>
          </div>
        </header>

        <div className="mk-scope__shell">
          {MARKETING_STAGES.map(stage => <span className="mk-scope__anchor" id={stage.id} key={stage.id} aria-hidden="true" />)}
          <div className="mk-scope__tabs" role="tablist" aria-label={txt(data, 'marketing.scope.tabs-aria', 'Năm khâu marketing')}>
            {MARKETING_STAGES.map((stage, i) => (
              <button type="button" role="tab" id={`mk-stage-tab-${stage.id}`}
                key={stage.id} aria-controls={`mk-stage-panel-${stage.id}`} aria-selected={selected === i}
                tabIndex={selected === i ? 0 : -1} onClick={() => selectStage(i)} onKeyDown={event => handleTabKey(event, i)}>
                <span className="mk-scope__tab-icon"><stage.icon aria-hidden="true" /></span>
                {(() => { const t = m(`stages.${stage.id}.title`, stage.title, 'Tên hạng mục'), s = m(`scope.stages.${stage.id}.short`, stage.short, 'Dòng phụ của khâu'); return <span><strong {...t.a}>{t.v}</strong><small {...s.a}>{s.v}</small></span>; })()}
                <ArrowRight className="mk-scope__tab-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="mk-scope__panels">
            {MARKETING_STAGES.map((stage, i) => (
              <article className="mk-scope__panel" role="tabpanel" key={stage.id} id={`mk-stage-panel-${stage.id}`}
                aria-labelledby={`mk-stage-tab-${stage.id}`} hidden={selected !== i} tabIndex={0}>
                <div className="mk-scope__intro">
                  <div>
                    <h3>{S(`scope.stages.${stage.id}.headline`, stage.headline, 'Tiêu đề khâu')}</h3>
                    {(() => { const d = m(`scope.stages.${stage.id}.description`, stage.description, 'Mô tả khâu', { multiline: true }); return <p {...d.a}>{d.v}</p>; })()}
                  </div>
                  <div className="mk-scope__art" onPointerMove={tiltArtwork} onPointerLeave={resetArtwork} onPointerCancel={resetArtwork}>
                    <div className="mk-scope__artwork">
                      <div className="mk-scope__face">
                        {stage.image ? (
                          <img className={`mk-scope__image mk-scope__image--${stage.id}`} src={stage.image.src} alt={txt(data, `marketing.scope.stages.${stage.id}.image-alt`, stage.image.alt)} width={stage.image.width} height={stage.image.height} loading="lazy" decoding="async" />
                        ) : (
                          <ul className="mk-scope__metrics" aria-label={txt(data, 'marketing.scope.metrics-aria', 'Ví dụ điểm đo')}>
                            <li><ScanLine aria-hidden="true" /> {S('scope.metrics.reach', 'Tiếp cận', 'Điểm đo', true)}</li>
                            <li><MessageSquare aria-hidden="true" /> {S('scope.metrics.response', 'Phản hồi', 'Điểm đo', true)}</li>
                            <li><UserRoundCheck aria-hidden="true" /> {S('scope.metrics.signup', 'Đăng ký', 'Điểm đo', true)}</li>
                          </ul>
                        )}
                      </div>
                      <span className="mk-scope__art-icon" aria-hidden="true"><stage.icon /></span>
                    </div>
                  </div>
                </div>
                <ul className="mk-scope__tasks" aria-label={txt(data, 'marketing.scope.tasks-aria', 'Các việc triển khai')}>
                  {stage.tasks.map((task, ti) => (
                    <li key={task.title}>
                      <Check aria-hidden="true" />
                      <div><h4>{S(`scope.stages.${stage.id}.tasks.${ti}.title`, task.title, 'Tên việc triển khai')}</h4>{(() => { const x = m(`scope.stages.${stage.id}.tasks.${ti}.text`, task.text, 'Mô tả việc triển khai', { multiline: true }); return <p {...x.a}>{x.v}</p>; })()}</div>
                    </li>
                  ))}
                </ul>
                <div className="mk-scope__handover">
                  <FileCheck2 aria-hidden="true" />
                  <p><strong>{S('scope.handover', 'Bạn nhận được', 'Nhãn kết quả bàn giao')}</strong>{S(`scope.stages.${stage.id}.handover`, stage.handover, 'Kết quả bàn giao', true)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
