'use client';

import { useEffect, useState } from 'react';

type Chapter = { id: string; label: string };

/**
 * Mục lục cố định cho các chương sau phần mở đầu 5 cảnh,
 * cùng ngôn ngữ với thanh chọn cảnh của Hero. Chỉ hiện khi đã cuộn qua phần mở đầu.
 */
export default function HomeChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
    setChapters(sections.map(s => ({ id: s.id, label: s.dataset.chapter || '' })));

    const update = () => {
      const focusLine = innerHeight * 0.45;
      let current = -1;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= focusLine) current = i;
      });
      const heroBottom = document.getElementById('journey')?.getBoundingClientRect().bottom ?? 0;
      const closingTop = document.querySelector('.home-closing')?.getBoundingClientRect().top ?? Infinity;
      setActive(current);
      setVisible(heroBottom < innerHeight * 0.5 && closingTop > innerHeight * 0.55);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!chapters.length) return null;

  return (
    <aside className={`home-chapters ${visible ? 'is-visible' : ''}`} aria-label="Mục lục trang chủ">
      {chapters.map((c, i) => (
        <a key={c.id} href={`#${c.id}`} aria-current={i === active ? 'true' : undefined} tabIndex={visible ? 0 : -1}>
          <span>{String(i + 1).padStart(2, '0')}</span>
          <b>{c.label}</b>
        </a>
      ))}
    </aside>
  );
}
