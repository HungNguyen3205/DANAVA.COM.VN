'use client';
/** Website → Trang: danh sách trang; chọn một trang để sửa các phần của trang đó theo tab. */
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { SITE_PAGES, findSitePage, type PageTab, type SitePage } from './websitePages';
import { useQueryParam } from './ui';

export function WebsitePagesScreen({ renderTab, edited }: { renderTab: (page: SitePage, tab: PageTab) => ReactNode; edited: (page: SitePage) => boolean }) {
  const [pageId, setPageId] = useQueryParam('page');
  const [tabId, setTabId] = useQueryParam('tab');
  const page = findSitePage(pageId);

  if (!page) {
    const groups = [...new Set(SITE_PAGES.map(p => p.group))];
    return (
      <div className="blk-stack">
        {groups.map(g => (
          <section key={g} className="admin-panel">
            <h2>{g}</h2>
            <div className="adm-page-list">
              {SITE_PAGES.filter(p => p.group === g).map(p => (
                <button key={p.id} type="button" className="project-admin-row" onClick={() => { setTabId(''); setPageId(p.id, true); }}>
                  <span><b>{p.label}</b><small>{p.path} · {p.tabs.map(t => t.label).join(', ')}</small></span>
                  {edited(p) ? <span className="badge green">Đã tùy chỉnh</span> : <span className="badge">Mặc định</span>}
                  <b aria-hidden="true">→</b>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  const tab = page.tabs.find(t => t.id === tabId) || page.tabs[0];
  return (
    <div className="blk-stack">
      <div className="adm-record-head">
        <button type="button" className="adm-btn adm-btn-ghost" onClick={() => { setTabId(''); setPageId('', true); }}><ArrowLeft size={16} /> Tất cả trang</button>
        <div className="adm-record-head__title"><h2>{page.label}</h2><small>{page.path}</small></div>
        <a className="adm-btn adm-btn-ghost" href={page.path} target="_blank" rel="noopener"><ExternalLink size={15} /> Xem trang</a>
      </div>
      {page.tabs.length > 1 && (
        <div className="adm-tabs adm-screen-tabs" role="tablist" aria-label={`Các phần của trang ${page.label}`}>
          {page.tabs.map(t => <button key={t.id} type="button" role="tab" aria-selected={t.id === tab.id} className={t.id === tab.id ? 'is-on' : ''} onClick={() => setTabId(t.id)}>{t.label}</button>)}
        </div>
      )}
      <div key={`${page.id}-${tab.id}`}>{renderTab(page, tab)}</div>
    </div>
  );
}
