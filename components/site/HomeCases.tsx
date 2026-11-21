'use client';
/** Trang chủ — "Dự án tiêu biểu" có tab lọc theo mảng (ý tưởng bố cục kiểu trang agency: tab + lưới thẻ). */
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type HomeCase = {
  id: string;
  group: 'product' | 'marketing';
  client: string;
  title: string;
  text: string;
  image?: string;
  logo?: string;
  href: string;
  tag: string;
};

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'product', label: 'Phần mềm & Website' },
  { id: 'marketing', label: 'Marketing & Truyền thông' }
] as const;

export function HomeCases({ items, limit = 6 }: { items: HomeCase[]; limit?: number }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all');
  const list = items.filter(x => tab === 'all' || x.group === tab).slice(0, limit);
  return (
    <>
      <div className="hb-tabs" role="tablist" aria-label="Lọc dự án theo mảng">
        {TABS.filter(t => t.id === 'all' || items.some(x => x.group === t.id)).map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-on' : undefined} onClick={() => setTab(t.id)}>
            {t.label}<span>{t.id === 'all' ? items.length : items.filter(x => x.group === t.id).length}</span>
          </button>
        ))}
      </div>
      <ul className="hb-cases" role="tabpanel">
        {list.map(c => (
          <li key={c.id}>
            <Link href={c.href} className="hb-case">
              <span className="hb-case__media">
                {c.image ? <img src={c.image} alt="" loading="lazy" decoding="async" width={800} height={560} /> : <span className="hb-case__ph">{c.client}</span>}
                <span className="hb-case__tag">{c.tag}</span>
              </span>
              <span className="hb-case__body">
                <span className="hb-case__client">
                  {c.logo && <img src={c.logo} alt="" loading="lazy" decoding="async" width={40} height={40} />}
                  {c.client}
                </span>
                <strong>{c.title}</strong>
                <span className="hb-case__text">{c.text}</span>
                <span className="hb-case__go">Xem thêm <ArrowUpRight aria-hidden="true" /></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
