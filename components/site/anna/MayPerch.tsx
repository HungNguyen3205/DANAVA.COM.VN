/*
 * Chỗ đậu của bé Mây trên đầu khối "Hỏi ANNA".
 * Máy tính có chuột: ô trống để bé ở nút nổi bay vào (chỉ có một bé trên màn hình).
 * Điện thoại, màn cảm ứng, giảm chuyển động: một bé đứng sẵn, không tự di chuyển.
 */
import { MayFigure } from './MayFigure';

export function MayPerch({ onPick }: { onPick: () => void }) {
  return (
    <div className="an-home__perch">
      <button type="button" className="an-home__may" onClick={onPick} aria-label="Chạm vào bé Mây để hỏi ANNA">
        <MayFigure />
      </button>
    </div>
  );
}
