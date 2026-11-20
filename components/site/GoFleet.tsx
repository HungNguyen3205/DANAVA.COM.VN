'use client';
/**
 * "Chọn cách bạn tận hưởng": 3 nút chuyển dòng xe (Giường nằm · Limousine · Cabin VIP).
 * Dữ liệu, ảnh và câu chữ lấy từ trang chủ DANAVA GO (dự án DatVeXeONL, VehicleExperience).
 * Bấm nút hoặc dùng phím ←/→ để đổi xe; trên điện thoại có thể vuốt ảnh.
 */
import { useRef, useState } from 'react';
import { Armchair, Check, ChevronLeft, ChevronRight, Users } from 'lucide-react';

export type GoVehicle = { id: string; label: string; name: string; word: string; text: string; seats: number; floors: number; perks: string[]; image: string; width: number; height: number };

export function GoFleet({ fleet, note }: { fleet: GoVehicle[]; note: string }) {
  const [i, setI] = useState(fleet.length - 1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<number | null>(null);
  const go = (n: number, focus = false) => {
    const k = (n + fleet.length) % fleet.length;
    setI(k);
    if (focus) tabs.current[k]?.focus();
  };
  const v = fleet[i];
  return (
    <div className="pgo-fleet">
      <div className="pgo-vehicles" role="tablist" aria-label="Chọn dòng xe">
        {fleet.map((x, k) => (
          <button key={x.id} ref={el => { tabs.current[k] = el; }} type="button" role="tab" id={`pgo-tab-${x.id}`} aria-controls="pgo-fleet-panel"
            aria-selected={k === i} tabIndex={k === i ? 0 : -1} className={k === i ? 'is-on' : undefined}
            onClick={() => go(k)}
            onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(k + 1, true); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(k - 1, true); } }}>
            <Armchair aria-hidden="true" />{x.label}
          </button>
        ))}
      </div>
      <div className="pgo-seat__grid" id="pgo-fleet-panel" role="tabpanel" aria-labelledby={`pgo-tab-${v.id}`}>
        <div className="pgo-cabin" key={'t' + v.id}>
          <p className="pgo-cabin__tag">{v.label}</p>
          <h3>{v.name}</h3>
          <p>{v.text}</p>
          <p className="pgo-cabin__specs"><Users aria-hidden="true" />{v.seats} chỗ · {v.floors} tầng</p>
          <ul>{v.perks.map(p => <li key={p}><Check aria-hidden="true" />{p}</li>)}</ul>
          <small>{note}</small>
        </div>
        <figure className="pgo-seat__img"
          onTouchStart={e => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={e => { const s = touch.current; touch.current = null; if (s == null) return; const d = e.changedTouches[0].clientX - s; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); }}>
          <span aria-hidden="true">{v.word}</span>
          {fleet.map((x, k) => (
            <img key={x.id} src={x.image} alt={k === i ? `Xe ${x.name} của DANAVA GO` : ''} aria-hidden={k === i ? undefined : true}
              width={x.width} height={x.height} loading="lazy" decoding="async" className={k === i ? 'is-on' : undefined} />
          ))}
          <div className="pgo-fleet__nav">
            <button type="button" onClick={() => go(i - 1)} aria-label="Xe trước"><ChevronLeft aria-hidden="true" /></button>
            <span aria-live="polite"><b>{String(i + 1).padStart(2, '0')}</b> / {String(fleet.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => go(i + 1)} aria-label="Xe tiếp theo"><ChevronRight aria-hidden="true" /></button>
          </div>
        </figure>
      </div>
    </div>
  );
}
