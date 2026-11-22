'use client';
/**
 * Hiển thị chữ của ANNA: chỉ đoạn văn, danh sách, chữ đậm và liên kết — không bao giờ chèn HTML.
 * Liên kết chỉ được tới trang trong website, tên miền DANAVA hoặc đúng kênh liên hệ đã cấu hình.
 */
import { useSite } from '../../SiteStore';
import { contactChannels } from '@/lib/contact-channels';
import { dropUnsafeLinks } from '@/lib/anna-links';
import { inline } from '../rich';

export function AnswerText({ text }: { text: string }) {
  const { data } = useSite();
  const { zalo, messenger, tel } = contactChannels(data);
  const trusted = [zalo, messenger, tel].filter(Boolean);
  const safe = dropUnsafeLinks(text, trusted);

  const groups: { list: boolean; lines: string[] }[] = [];
  let gap = true;
  for (const raw of safe.split('\n')) {
    const line = raw.trim();
    if (!line) { gap = true; continue; }
    const list = /^[-•*]\s+/.test(line);
    const value = list ? line.replace(/^[-•*]\s+/, '') : line;
    const previous = groups[groups.length - 1];
    if (list && previous?.list) previous.lines.push(value);
    else if (!list && previous && !previous.list && !gap) previous.lines.push(value);
    else groups.push({ list, lines: [value] });
    gap = false;
  }

  return (
    <>
      {groups.map((group, i) => (group.list
        ? <ul key={i}>{group.lines.map((l, j) => <li key={j}>{inline(l)}</li>)}</ul>
        : <p key={i}>{group.lines.map((l, j) => <span key={j} className="an-line">{inline(l)}</span>)}</p>))}
    </>
  );
}
