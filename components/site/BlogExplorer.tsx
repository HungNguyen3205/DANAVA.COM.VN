'use client';
/**
 * Lưới bài viết của trang Blogs có bộ lọc chủ đề lọc ngay tại chỗ.
 * HTML ban đầu đã có đủ mọi bài (server render), bộ lọc chỉ ẩn/hiện; hỗ trợ #chu-de-{slug} trên URL.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BlogCardItem, type BlogCard } from './BlogCardItem';

export type BlogTopic = { id: string; name: string; slug: string; tone: number; count: number; page?: string };

export function BlogExplorer({ cards, topics, featuredId }: { cards: BlogCard[]; topics: BlogTopic[]; featuredId?: string }) {
  const [current, setCurrent] = useState('');
  useEffect(() => {
    const read = () => {
      const m = /^#chu-de-(.+)$/.exec(decodeURIComponent(window.location.hash));
      const t = m && topics.find(x => x.slug === m[1]);
      if (t) setCurrent(t.id);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [topics]);
  const pick = (id: string) => {
    setCurrent(id);
    const t = topics.find(x => x.id === id);
    history.replaceState(null, '', t ? `#chu-de-${t.slug}` : window.location.pathname);
  };
  // Ở chế độ "Tất cả" bỏ bài tiêu điểm (đã hiện to phía trên); khi lọc chủ đề thì hiện đủ
  const shown = current ? cards.filter(c => c.topic === current) : cards.filter(c => c.id !== featuredId);
  const active = topics.find(t => t.id === current);
  const toneOf = (id: string) => topics.find(t => t.id === id)?.tone ?? 0;
  const nameOf = (id: string) => topics.find(t => t.id === id)?.name || 'Bài viết';

  return (
    <div className="bl-explore">
      {topics.map(t => <span key={t.id} id={`chu-de-${t.slug}`} className="bl-anchor" aria-hidden="true" />)}
      <div className="bl-chips" role="group" aria-label="Lọc bài viết theo chủ đề">
        <button type="button" className={`bl-chip${!current ? ' is-on' : ''}`} aria-pressed={!current} onClick={() => pick('')}>
          Tất cả<span>{cards.length}</span>
        </button>
        {topics.map(t => (
          <button key={t.id} type="button" className={`bl-chip bl-tone-${t.tone}${current === t.id ? ' is-on' : ''}`} aria-pressed={current === t.id} onClick={() => pick(t.id)}>
            <i aria-hidden="true" />{t.name}<span>{t.count}</span>
          </button>
        ))}
      </div>
      <p className="bl-explore__status" aria-live="polite">
        {active ? <>Đang xem <b>{active.name}</b> · {shown.length} bài</> : <>{shown.length} bài viết mới nhất</>}
        {active?.page && <Link href={active.page}>Trang chủ đề <ArrowUpRight aria-hidden="true" /></Link>}
      </p>
      <ul className="bl-grid">
        {shown.map((c, i) => <BlogCardItem key={c.id} card={c} topicName={nameOf(c.topic)} tone={toneOf(c.topic)} wide={i % 7 === 0} />)}
      </ul>
    </div>
  );
}
