'use client';
/**
 * Danh bạ địa điểm trên danava.vn/places (trang /doi-tac/).
 * Toàn bộ thẻ được render sẵn từ máy chủ; JS chỉ thêm bộ lọc loại hình / tỉnh thành.
 */
import { useMemo, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Clock, MapPin } from 'lucide-react';

export type PlaceCard = {
  id: string; name: string; role: string; city: string; address: string; hours: string;
  logo: string; cover: string; url: string; verified: boolean; about: string; amenities: string[];
};

export function PlacesDirectory({ places }: { places: PlaceCard[] }) {
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const roles = useMemo(() => Array.from(new Set(places.map(p => p.role))).sort((a, b) => a.localeCompare(b, 'vi')), [places]);
  const cities = useMemo(() => Array.from(new Set(places.map(p => p.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi')), [places]);
  const shown = places.filter(p => (!role || p.role === role) && (!city || p.city === city));

  return (
    <>
      <div className="pd-filters" role="group" aria-label="Lọc địa điểm">
        <div className="pd-chips" role="radiogroup" aria-label="Loại hình">
          {['', ...roles].map(r => (
            <button key={r || 'all'} type="button" role="radio" aria-checked={role === r} className={role === r ? 'is-on' : ''} onClick={() => setRole(r)}>
              {r || 'Tất cả'} <span>{places.filter(p => !r || p.role === r).length}</span>
            </button>
          ))}
        </div>
        <label className="pd-city">
          <span className="s-sr">Tỉnh/thành</span>
          <select value={city} onChange={e => setCity(e.target.value)}>
            <option value="">Mọi tỉnh/thành</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <p className="pd-count" aria-live="polite">{shown.length} địa điểm</p>
      <ul className="pd-grid">
        {shown.map(p => (
          <li key={p.id} id={p.id} className="pd-card">
            <div className="pd-card__cover">
              {p.cover ? <img src={p.cover} alt="" width={800} height={500} loading="lazy" decoding="async" /> : <span aria-hidden="true" />}
              {p.verified && <span className="pd-card__verified"><BadgeCheck aria-hidden="true" /> DANAVA Verified</span>}
            </div>
            <div className="pd-card__body">
              <div className="pd-card__head">
                {p.logo && <img className="pd-card__logo" src={p.logo} alt="" width={56} height={56} loading="lazy" />}
                <div>
                  <p className="pd-card__role">{p.role}{p.city ? ` · ${p.city}` : ''}</p>
                  <h3 className="pd-card__name">{p.name}</h3>
                </div>
              </div>
              {p.about && <p className="pd-card__about">{p.about}</p>}
              <ul className="pd-card__meta">
                {p.address && <li><MapPin aria-hidden="true" /><span>{p.address}</span></li>}
                {p.hours && <li><Clock aria-hidden="true" /><span>{p.hours}</span></li>}
              </ul>
              {p.amenities.length > 0 && <ul className="pd-card__amen" aria-label="Dịch vụ & tiện ích">{p.amenities.map(a => <li key={a}>{a}</li>)}</ul>}
              <a className="pd-card__link" href={p.url} target="_blank" rel="noopener">Xem trên danava.vn <ArrowUpRight aria-hidden="true" /><span className="s-sr">(mở tab mới)</span></a>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
