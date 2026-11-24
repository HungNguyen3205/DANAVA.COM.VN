import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { sentenceCase } from '@/lib/sentence-case';
import { cmsText, ct } from './cms';

export type BlogCard = { id: string; href: string; title: string; excerpt: string; cover: string; date: string; dateLabel: string; minutes: number; topic: string };

/** Một thẻ bài viết — dùng chung cho lưới Blogs và kết quả tìm kiếm. topicName rỗng = bài chưa có chủ đề. */
export function BlogCardItem({ data, card: c, topicName, tone, wide = false }: { data: Pick<SiteData, 'texts'> | null | undefined; card: BlogCard; topicName: string; tone: number; wide?: boolean }) {
  const noTopic = ct(data, 'blog.card.no-topic', 'Bài viết', 'Nhãn khi chưa có chủ đề');
  const minutes = ct(data, 'blog.card.minutes', 'phút đọc', 'Đơn vị thời gian đọc');
  const read = ct(data, 'blog.card.read', 'Đọc bài', 'Chữ liên kết');
  const pill = topicName
    ? <span className="bl-pill" {...cmsText(`rec.topics.${c.topic}.name`, 'Tên chủ đề', { scope: 'record', scopeLabel: 'Hồ sơ chủ đề' })}>{topicName}</span>
    : <span className="bl-pill" {...noTopic.a}>{noTopic.v}</span>;
  return (
    <li className={`bl-card bl-tone-${tone}${wide ? ' is-wide' : ''}`}>
      <div className="bl-card__media">
        {c.cover ? <img src={c.cover} alt="" loading="lazy" decoding="async" /> : <span className="bl-card__ph" aria-hidden="true">D</span>}
      </div>
      <div className="bl-card__body">
        <p className="bl-card__meta">{pill}{c.date && <time dateTime={c.date}>{c.dateLabel}</time>}</p>
        <h3 className="bl-card__title"><Link className="bl-card__link" href={c.href}>{sentenceCase(c.title)}</Link></h3>
        <p className="bl-card__text">{c.excerpt}</p>
        {/* .bl-card__foot span là inline-flex → các span chữ lồng trong đặt display:inline (như NewsPage) */}
        <p className="bl-card__foot"><span><Clock aria-hidden="true" /><span style={{ display: 'inline' }}>{c.minutes} <span style={{ display: 'inline' }} {...minutes.a}>{minutes.v}</span></span></span><span className="bl-card__go"><span {...read.a}>{read.v}</span> <ArrowRight aria-hidden="true" /></span></p>
      </div>
    </li>
  );
}
