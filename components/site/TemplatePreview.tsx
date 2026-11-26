'use client';
/**
 * Xem trước trực tiếp một mẫu (/mau-website/<slug>/): demo thật (/demo/<slug>/) chạy trong khung,
 * đổi khổ Máy tính / Máy tính bảng / Điện thoại, mở toàn màn hình ở tab mới.
 */
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { WebTemplate } from '@/lib/web-templates';
import { useSite } from '../SiteStore';
import { ct } from './cms';
import { localePath } from '@/lib/i18n';

const DEVICES = [
  { id: 'desktop', label: 'Máy tính', icon: Monitor, w: '100%' },
  { id: 'tablet', label: 'Máy tính bảng', icon: Tablet, w: '820px' },
  { id: 'phone', label: 'Điện thoại', icon: Smartphone, w: '390px' }
] as const;

export function TemplatePreview({ t }: { t: WebTemplate }) {
  const { data } = useSite();
  const T = (k: string, def: string, label: string) => { const x = ct(data, `mau.${k}`, def, label, { scope: 'global' }); return <span {...x.a}>{x.v}</span>; };
  const [dev, setDev] = useState<(typeof DEVICES)[number]['id']>('desktop');
  const [loaded, setLoaded] = useState(false);
  // Đang xem /en/, /ja/ → demo cùng ngôn ngữ
  const src = localePath(`/demo/${t.id}/`, data.localeView?.loc ?? 'vi');
  const w = DEVICES.find(d => d.id === dev)!.w;
  return (
    <div className="mau-pv">
      <div className="mau-pv__bar">
        <Link className="mau-pv__back" href="/mau-website/"><ArrowLeft aria-hidden="true" />{T('pv.back', 'Kho mẫu', 'Xem trước: nút quay lại')}</Link>
        <div className="mau-pv__dev" role="group" aria-label="Khổ màn hình">
          {DEVICES.map(d => { const x = ct(data, `mau.pv.dev.${d.id}`, d.label, 'Xem trước: khổ màn hình', { scope: 'global' }); return (
            <button key={d.id} type="button" aria-pressed={dev === d.id} onClick={() => setDev(d.id)} title={x.v}><d.icon aria-hidden="true" /><span {...x.a}>{x.v}</span></button>
          ); })}
        </div>
        <div className="mau-pv__act">
          <a className="mau-pv__full" href={src} target="_blank" rel="noopener">{T('pv.full', 'Mở toàn màn hình', 'Xem trước: mở tab mới')} <ArrowUpRight aria-hidden="true" /></a>
          <Link className="s-btn s-btn--primary s-btn--sm" href={`/bao-gia-web/?mau=${t.id}`}>{T('pv.use', 'Dùng mẫu này', 'Xem trước: nút dùng mẫu')}</Link>
        </div>
      </div>
      <div className={`mau-pv__stage is-${dev}`}>
        <div className="mau-pv__frame" style={{ width: w }}>
          {!loaded && <div className="mau-pv__skel" aria-hidden="true"><span /><span /><span /></div>}
          <iframe src={src} title={`Demo ${t.name} — ${t.brand}`} onLoad={() => setLoaded(true)} />
        </div>
      </div>
    </div>
  );
}
