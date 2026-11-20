'use client';
/**
 * Lưới bài viết của trang Blogs có bộ lọc chủ đề lọc ngay tại chỗ.
 * HTML ban đầu đã có đủ mọi bài (server render), bộ lọc chỉ ẩn/hiện; hỗ trợ #chu-de-{slug} trên URL.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';

export type BlogCard = { id: string; href: string; title: string; excerpt: string; cover: string; date: string; dateLabel: string; minutes: number; topic: string };
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
        {shown.map((c, i) => (
          <li key={c.id} className={`bl-card bl-tone-${toneOf(c.topic)}${i % 7 === 0 ? ' is-wide' : ''}`}>
            <div className="bl-card__media">
              {c.cover ? <img src={c.cover} alt="" loading="lazy" decoding="async" /> : <span className="bl-card__ph" aria-hidden="true">D</span>}
            </div>
            <div className="bl-card__body">
              <p className="bl-card__meta"><span className="bl-pill">{nameOf(c.topic)}</span><time dateTime={c.date}>{c.dateLabel}</time></p>
              <h3 className="bl-card__title"><Link className="bl-card__link" href={c.href}>{c.title}</Link></h3>
              <p className="bl-card__text">{c.excerpt}</p>
              <p className="bl-card__foot"><span><Clock aria-hidden="true" />{c.minutes} phút đọc</span><span className="bl-card__go">Đọc bài <ArrowRight aria-hidden="true" /></span></p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
