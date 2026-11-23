'use client';
/**
 * Khung xem trước của trình chỉnh sửa landing page (mở trong iframe của admin).
 * Nhận khối từ cửa sổ cha CÙNG NGUỒN qua postMessage, hiển thị bằng đúng component trang thật,
 * báo lại khối/trường được bấm. Không đọc dữ liệu từ máy chủ → không lộ gì khi mở trực tiếp.
 */
import { useEffect, useState } from 'react';
import type { Service, SiteData } from '@/lib/content';
import type { PageBlock } from '@/lib/page-blocks';
import { LandingBlocks } from './LandingBlocks';

type Render = { type: 'danava-lp:render'; blocks: PageBlock[]; services: Service[]; slug: string; selected: string };

export function LandingPreview() {
  const [state, setState] = useState<Render | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== window.parent) return;
      if (e.data?.type === 'danava-lp:render') setState(e.data as Render);
      if (e.data?.type === 'danava-lp:scroll') document.querySelector(`[data-block-id="${CSS.escape(String(e.data.id))}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    addEventListener('message', onMessage);
    document.documentElement.dataset.lpPreview = '1';
    window.parent.postMessage({ type: 'danava-lp:ready' }, location.origin);

    // Bấm vào khối/trường → báo trình chỉnh sửa; không mở liên kết, không gửi form khi đang chỉnh
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const block = target.closest<HTMLElement>('[data-block-id]');
      // Ngoài khối (đầu trang, chân trang): không cho rời khung xem trước
      if (!block) { if (target.closest('a')) e.preventDefault(); return; }
      e.preventDefault();
      e.stopPropagation();
      const field = target.closest<HTMLElement>('[data-field]')?.dataset.field || '';
      window.parent.postMessage({ type: 'danava-lp:select', id: block.dataset.blockId, field }, location.origin);
    };
    const onSubmit = (e: Event) => e.preventDefault();
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    return () => {
      removeEventListener('message', onMessage);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
    };
  }, []);

  if (!state) return <main className="lp-page lp-preview"><p className="lp-preview__wait">Đang chờ trình chỉnh sửa…</p></main>;
  return (
    <main className="lp-page lp-preview" data-selected={state.selected}>
      <style>{state.selected ? `[data-block-id="${state.selected.replace(/[^a-z0-9_-]/gi, '')}"]{outline:3px solid #f26b1d;outline-offset:-3px}` : ''}</style>
      {state.blocks.length
        ? <LandingBlocks blocks={state.blocks} data={{ services: state.services } as SiteData} slug={state.slug} showHidden />
        : <p className="lp-preview__wait">Trang chưa có khối nào. Bấm “Thêm khối” để bắt đầu.</p>}
    </main>
  );
}
