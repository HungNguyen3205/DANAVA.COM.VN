import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

export type BlogCard = { id: string; href: string; title: string; excerpt: string; cover: string; date: string; dateLabel: string; minutes: number; topic: string };

/** Một thẻ bài viết — dùng chung cho lưới Blogs và kết quả tìm kiếm. */
export function BlogCardItem({ card: c, topicName, tone, wide = false }: { card: BlogCard; topicName: string; tone: number; wide?: boolean }) {
  return (
    <li className={`bl-card bl-tone-${tone}${wide ? ' is-wide' : ''}`}>
      <div className="bl-card__media">
        {c.cover ? <img src={c.cover} alt="" loading="lazy" decoding="async" /> : <span className="bl-card__ph" aria-hidden="true">D</span>}
      </div>
      <div className="bl-card__body">
        <p className="bl-card__meta"><span className="bl-pill">{topicName}</span>{c.date && <time dateTime={c.date}>{c.dateLabel}</time>}</p>
        <h3 className="bl-card__title"><Link className="bl-card__link" href={c.href}>{c.title}</Link></h3>
        <p className="bl-card__text">{c.excerpt}</p>
        <p className="bl-card__foot"><span><Clock aria-hidden="true" />{c.minutes} phút đọc</span><span className="bl-card__go">Đọc bài <ArrowRight aria-hidden="true" /></span></p>
      </div>
    </li>
  );
}
