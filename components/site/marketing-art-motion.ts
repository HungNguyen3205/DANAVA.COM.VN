import type { PointerEvent } from 'react';

export function tiltArtwork(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const artwork = event.currentTarget;
  const bounds = artwork.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  artwork.style.setProperty('--mk-art-pitch', `${-y * 20}deg`);
  artwork.style.setProperty('--mk-art-yaw', `${x * 24}deg`);
}

export function resetArtwork(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.removeProperty('--mk-art-pitch');
  event.currentTarget.style.removeProperty('--mk-art-yaw');
}
