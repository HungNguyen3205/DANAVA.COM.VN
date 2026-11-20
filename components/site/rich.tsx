/**
 * Hiển thị chữ soạn trong CMS mà không dùng HTML thô (không dangerouslySetInnerHTML).
 *  - rich('Liên hệ *DANAVA*', 'c-grad') → "Liên hệ " + <span class="c-grad">DANAVA</span> (không có class → <em>)
 *  - <Prose text={…} />: đoạn văn (cách nhau một dòng trống), dòng "- " là danh sách, dòng "> " là ghi chú,
 *    **đậm**, `mã`, [chữ](/duong-dan hoặc https://…)
 */
import Link from 'next/link';
import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

export function rich(text: string, className?: string): ReactNode {
  // Tên thương hiệu không bị ngắt dòng giữa "DANAVA" và "Solutions"
  const parts = text.replace(/DANAVA Solutions/g, 'DANAVA\u00a0Solutions').split(/\*([^*]+)\*/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) => (i % 2 ? (className ? <span key={i} className={className}>{p}</span> : <em key={i}>{p}</em>) : p));
}

const SAFE_HREF = /^(\/(?!\/)[^\s]*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d\s]+)$/;

/** **đậm**, `mã`, [chữ](link) trong một dòng. */
export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const rx = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0; let m: RegExpExecArray | null; let k = 0;
  while ((m = rx.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2] !== undefined) out.push(<code key={k++}>{m[2]}</code>);
    else if (SAFE_HREF.test(m[4])) out.push(m[4].startsWith('/') ? <Link key={k++} href={m[4]}>{m[3]}</Link> : <a key={k++} href={m[4]} target={m[4].startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{m[3]}</a>);
    else out.push(m[3]);
    last = rx.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Prose({ text }: { text: string }) {
  if (!text.trim()) return null;
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter(l => l.trim());
        if (lines.every(l => /^\s*-\s+/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*-\s+/, ''))}</li>)}</ul>;
        if (lines.every(l => /^\s*>\s?/.test(l))) {
          return <div key={i} className="s-policy-note"><Info aria-hidden="true" /><p>{inline(lines.map(l => l.replace(/^\s*>\s?/, '')).join(' '))}</p></div>;
        }
        return <p key={i}>{inline(lines.join(' '))}</p>;
      })}
    </>
  );
}
