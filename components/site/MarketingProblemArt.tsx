'use client';

import { resetArtwork, tiltArtwork } from './marketing-art-motion';

export function MarketingProblemArt({ image }: { image: string }) {
  return (
    <div className="mk-problem__media" aria-hidden="true" onPointerMove={tiltArtwork} onPointerLeave={resetArtwork}>
      <div className="mk-problem__scene">
        <img src={image} alt="" loading="lazy" decoding="async" draggable={false} />
      </div>
    </div>
  );
}
