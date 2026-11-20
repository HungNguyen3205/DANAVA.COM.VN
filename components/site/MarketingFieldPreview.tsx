'use client';

import type { PointerEvent } from 'react';

function playPreview(event: PointerEvent<HTMLVideoElement>) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  void event.currentTarget.play().catch(() => {
    // Leaving the frame can interrupt a play request while the video loads.
  });
}

function stopPreview(event: PointerEvent<HTMLVideoElement>) {
  const video = event.currentTarget;
  video.pause();
  video.currentTime = 0;
}

export function MarketingFieldPreview() {
  return (
    <figure className="mk-content__img">
      <video
        src="/assets/marketing/field-preview-3s.mp4"
        poster="/assets/marketing/field-preview-3s-poster.webp"
        width={540}
        height={960}
        muted
        playsInline
        preload="none"
        aria-label="Video hậu trường sản xuất nội dung tại hiện trường"
        onPointerEnter={playPreview}
        onPointerLeave={stopPreview}
      />
    </figure>
  );
}
