'use client';
/*
 * Chỗ đậu của bé Mây trên đầu khối "Hỏi ANNA".
 * Máy tính có chuột: ô trống để bé ở nút nổi bay vào (chỉ có một bé trên màn hình).
 * Điện thoại, màn cảm ứng, giảm chuyển động: một bé đứng sẵn, không tự di chuyển.
 */
import { MayFigure } from './MayFigure';
import { useSite } from '../../SiteStore';
import { txt } from '@/lib/site-text';

export function MayPerch({ onPick }: { onPick: () => void }) {
  const { data } = useSite();
  return (
    <div className="an-home__perch">
      <button type="button" className="an-home__may" onClick={onPick} aria-label={txt(data, 'anna.ui.may-aria', 'Chạm vào bé Mây để hỏi ANNA')}>
        <MayFigure />
      </button>
    </div>
  );
}
