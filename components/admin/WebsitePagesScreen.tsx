'use client';
/** Website → Trang: danh sách trang; chọn một trang để sửa các phần của trang đó theo tab. */
import { ArrowLeft, ExternalLink, PenLine } from 'lucide-react';
import type { ReactNode } from 'react';
import { SITE_PAGES, findSitePage, type PageTab, type SitePage } from './websitePages';
import { useQueryParam } from './ui';
import { Button, PageHeader, TabBar } from './kit';

export function WebsitePagesScreen({ renderTab, edited }: { renderTab: (page: SitePage, tab: PageTab, exit: () => void) => ReactNode; edited: (page: SitePage) => boolean }) {
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

  // Mọi trang có tab Chỉnh trực tiếp (sửa ngay trên trang thật: components/admin/LiveEditor.tsx); "giao-dien" = đường dẫn cũ
  const tabs: PageTab[] = [...page.tabs, { id: 'truc-tiep', label: 'Chỉnh trực tiếp', kind: 'visual' }];
  const tab = tabs.find(t => t.id === (tabId === 'giao-dien' ? 'truc-tiep' : tabId)) || tabs[0];
  const exit = () => setTabId('');
  return (
    <div className="blk-stack">
      <PageHeader
        back={<Button variant="ghost" onClick={() => { setTabId(''); setPageId('', true); }}><ArrowLeft size={16} /> Tất cả trang</Button>}
        title={<>{page.label} <code className="ax-pagehead__path">{page.path}</code></>}
        actions={<>
          {tab.kind !== 'visual' && <Button variant="primary" onClick={() => setTabId('truc-tiep')}><PenLine size={15} /> Chỉnh trực tiếp</Button>}
          <a className="ax-btn ax-btn--secondary" href={page.path} target="_blank" rel="noopener"><ExternalLink size={15} /> Xem trang</a>
        </>}
      />
      {tabs.length > 1 && <TabBar tabs={tabs} value={tab.id} onChange={id => setTabId(id)} label={`Các phần của trang ${page.label}`} />}
      <div key={`${page.id}-${tab.id}`}>{renderTab(page, tab, exit)}</div>
    </div>
  );
}
