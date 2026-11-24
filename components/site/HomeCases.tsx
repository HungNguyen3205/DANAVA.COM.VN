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
  /** Thuộc tính vùng chỉnh trực tiếp cho từng phần chữ (components/site/cms.ts) */
  cms?: Partial<Record<'client' | 'title' | 'text' | 'tag', Record<string, string>>>;
};
/** Chữ giao diện sửa được: { v: chữ, a: thuộc tính } theo khóa all / product / marketing / more */
export type CaseUi = Partial<Record<'all' | 'product' | 'marketing' | 'more', { v: string; a: Record<string, string> }>>;

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'product', label: 'Phần mềm & Website' },
  { id: 'marketing', label: 'Marketing & Truyền thông' }
] as const;

export function HomeCases({ items, limit = 6, ui }: { items: HomeCase[]; limit?: number; ui?: CaseUi }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all');
  const list = items.filter(x => tab === 'all' || x.group === tab).slice(0, limit);
  return (
    <>
      <div className="hb-tabs" role="tablist" aria-label="Lọc dự án theo mảng">
        {TABS.filter(t => t.id === 'all' || items.some(x => x.group === t.id)).map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-on' : undefined} onClick={() => setTab(t.id)}>
            <span {...ui?.[t.id]?.a}>{ui?.[t.id]?.v ?? t.label}</span><span>{t.id === 'all' ? items.length : items.filter(x => x.group === t.id).length}</span>
          </button>
        ))}
      </div>
      <ul className="hb-cases" role="tabpanel">
        {list.map(c => (
          <li key={c.id}>
            <Link href={c.href} className="hb-case">
              <span className="hb-case__media">
                {c.image ? <img src={c.image} alt="" loading="lazy" decoding="async" width={800} height={560} /> : <span className="hb-case__ph">{c.client}</span>}
                <span className="hb-case__tag" {...c.cms?.tag}>{c.tag}</span>
              </span>
              <span className="hb-case__body">
                <span className="hb-case__client">
                  {c.logo && <img src={c.logo} alt="" loading="lazy" decoding="async" width={40} height={40} />}
                  <span {...c.cms?.client}>{c.client}</span>
                </span>
                <strong {...c.cms?.title}>{c.title}</strong>
                <span className="hb-case__text" {...c.cms?.text}>{c.text}</span>
                <span className="hb-case__go"><span {...ui?.more?.a}>{ui?.more?.v ?? 'Xem thêm'}</span> <ArrowUpRight aria-hidden="true" /></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
