'use client';

import { ArrowRight, Check, FileCheck2, MessageSquare, ScanLine, UserRoundCheck } from 'lucide-react';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { resetArtwork, tiltArtwork } from './marketing-art-motion';
import { MARKETING_STAGES } from './marketing-scope';

export function MarketingScope() {
  const [selected, setSelected] = useState(0);

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
            <p className="s-eyebrow">Phạm vi dịch vụ</p>
            <h2 className="mk-section-title" id="mk-pillars-title">Năm khâu, <em>một kế hoạch</em></h2>
          </div>
        </header>

        <div className="mk-scope__shell">
          {MARKETING_STAGES.map(stage => <span className="mk-scope__anchor" id={stage.id} key={stage.id} aria-hidden="true" />)}
          <div className="mk-scope__tabs" role="tablist" aria-label="Năm khâu marketing">
            {MARKETING_STAGES.map((stage, i) => (
              <button type="button" role="tab" id={`mk-stage-tab-${stage.id}`}
                key={stage.id} aria-controls={`mk-stage-panel-${stage.id}`} aria-selected={selected === i}
                tabIndex={selected === i ? 0 : -1} onClick={() => selectStage(i)} onKeyDown={event => handleTabKey(event, i)}>
                <span className="mk-scope__tab-icon"><stage.icon aria-hidden="true" /></span>
                <span><strong>{stage.title}</strong><small>{stage.short}</small></span>
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
                    <h3>{stage.headline}</h3>
                    <p>{stage.description}</p>
                  </div>
                  <div className="mk-scope__art" onPointerMove={tiltArtwork} onPointerLeave={resetArtwork} onPointerCancel={resetArtwork}>
                    <div className="mk-scope__artwork">
                      <div className="mk-scope__face">
                        {stage.image ? (
                          <img className={`mk-scope__image mk-scope__image--${stage.id}`} src={stage.image.src} alt={stage.image.alt} width={stage.image.width} height={stage.image.height} loading="lazy" decoding="async" />
                        ) : (
                          <ul className="mk-scope__metrics" aria-label="Ví dụ điểm đo">
                            <li><ScanLine aria-hidden="true" /> Tiếp cận</li>
                            <li><MessageSquare aria-hidden="true" /> Phản hồi</li>
                            <li><UserRoundCheck aria-hidden="true" /> Đăng ký</li>
                          </ul>
                        )}
                      </div>
                      <span className="mk-scope__art-icon" aria-hidden="true"><stage.icon /></span>
                    </div>
                  </div>
                </div>
                <ul className="mk-scope__tasks" aria-label="Các việc triển khai">
                  {stage.tasks.map(task => (
                    <li key={task.title}>
                      <Check aria-hidden="true" />
                      <div><h4>{task.title}</h4><p>{task.text}</p></div>
                    </li>
                  ))}
                </ul>
                <div className="mk-scope__handover">
                  <FileCheck2 aria-hidden="true" />
                  <p><strong>Bạn nhận được</strong>{stage.handover}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
