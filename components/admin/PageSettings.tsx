'use client';
/** Chỉnh sửa website → Thiết lập trang: các phần biểu mẫu của trang (khối nội dung, ảnh, chữ đầu/cuối trang) theo tab. */
import { useState, type ReactNode } from 'react';
import type { PageTab } from './websitePages';
import { TabBar } from './kit';

export function PageSettings({ tabs, initial, render, note }: { tabs: PageTab[]; initial?: string; render: (t: PageTab) => ReactNode; note?: string }) {
  const [id, setId] = useState(tabs.find(t => t.id === initial)?.id || tabs[0]?.id || '');
  const tab = tabs.find(t => t.id === id);
  if (!tabs.length) return <p className="field-note">{note || 'Trang này chưa có thiết lập riêng.'}</p>;
  return (
    <div className="blk-stack">
      {note && <p className="field-note">{note}</p>}
      {tabs.length > 1 && <TabBar size="sm" tabs={tabs.map(t => ({ id: t.id, label: t.label }))} value={id} onChange={setId} label="Các phần của trang" />}
      <div key={id}>{tab && render(tab)}</div>
    </div>
  );
}
