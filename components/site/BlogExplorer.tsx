'use client';
/**
 * Lưới bài viết của trang Blogs có bộ lọc chủ đề lọc ngay tại chỗ.
 * HTML ban đầu đã có đủ mọi bài (server render), bộ lọc chỉ ẩn/hiện; hỗ trợ #chu-de-{slug} trên URL.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BlogCardItem, type BlogCard } from './BlogCardItem';
import { useSite } from '../SiteStore';
import { cmsText, ct } from './cms';

export type BlogTopic = { id: string; name: string; slug: string; tone: number; count: number; page?: string };

/** Tên chủ đề sửa được trên trang (hồ sơ chủ đề, dùng chung mọi nơi). */
const topicAttrs = (id: string) => cmsText(`rec.topics.${id}.name`, 'Tên chủ đề', { scope: 'record', scopeLabel: 'Hồ sơ chủ đề' });
// .bl-chip span là ô đếm số → chữ trong nút lọc dùng <b> giữ nguyên độ đậm của nút
const plain = { fontWeight: 'inherit' } as const;

export function BlogExplorer({ cards, topics, featuredId }: { cards: BlogCard[]; topics: BlogTopic[]; featuredId?: string }) {
  const { data } = useSite();
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
  const nameOf = (id: string) => topics.find(t => t.id === id)?.name || '';
  const all = ct(data, 'blog.explore.all', 'Tất cả', 'Nhãn lọc tất cả');
  const viewing = ct(data, 'blog.explore.viewing', 'Đang xem', 'Chữ trạng thái lọc');
  const unit = ct(data, 'blog.explore.unit', 'bài', 'Đơn vị số bài');
  const latest = ct(data, 'blog.explore.latest', 'bài viết mới nhất', 'Chữ trạng thái');
  const topicPage = ct(data, 'blog.explore.topic-page', 'Trang chủ đề', 'Chữ liên kết');

  return (
    <div className="bl-explore">
      {topics.map(t => <span key={t.id} id={`chu-de-${t.slug}`} className="bl-anchor" aria-hidden="true" />)}
      <div className="bl-chips" role="group" aria-label="Lọc bài viết theo chủ đề">
        <button type="button" className={`bl-chip${!current ? ' is-on' : ''}`} aria-pressed={!current} onClick={() => pick('')}>
          <b style={plain} {...all.a}>{all.v}</b><span>{cards.length}</span>
        </button>
        {topics.map(t => (
          <button key={t.id} type="button" className={`bl-chip bl-tone-${t.tone}${current === t.id ? ' is-on' : ''}`} aria-pressed={current === t.id} onClick={() => pick(t.id)}>
            <i aria-hidden="true" /><b style={plain} {...topicAttrs(t.id)}>{t.name}</b><span>{t.count}</span>
          </button>
        ))}
      </div>
      {/* Khung flex: giữ đúng các nhóm chữ như cũ ("Đang xem" | tên | "· n bài") */}
      <p className="bl-explore__status" aria-live="polite">
        {active
          ? <><span {...viewing.a}>{viewing.v}</span> <b {...topicAttrs(active.id)}>{active.name}</b><span> · {shown.length} <span {...unit.a}>{unit.v}</span></span></>
          : <span>{shown.length} <span {...latest.a}>{latest.v}</span></span>}
        {active?.page && <Link href={active.page}><span {...topicPage.a}>{topicPage.v}</span> <ArrowUpRight aria-hidden="true" /></Link>}
      </p>
      <ul className="bl-grid">
        {shown.map((c, i) => <BlogCardItem key={c.id} data={data} card={c} topicName={nameOf(c.topic)} tone={toneOf(c.topic)} wide={i % 7 === 0} />)}
      </ul>
    </div>
  );
}
