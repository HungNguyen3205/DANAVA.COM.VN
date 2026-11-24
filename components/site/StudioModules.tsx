'use client';
/**
 * Bảng điều khiển 16 phân hệ DANAVA Studio: nhóm theo công việc thực tế của phòng tập,
 * chọn một phân hệ → khung bên phải hiện đúng màn hình thật của phân hệ đó.
 * - Nút thật (aria-pressed), dùng được bằng bàn phím; mũi tên lên/xuống chuyển phân hệ.
 * - Tên và mô tả cả 16 phân hệ có sẵn trong HTML máy chủ.
 * - Giảm chuyển động: bỏ hiệu ứng chuyển cảnh và nghiêng khung.
 */
import { useRef, useState, type KeyboardEvent } from 'react';
import {
  ArrowLeft, ArrowRight, LayoutDashboard, Users, Package, Ticket, CalendarDays, ClipboardCheck, UserRound, QrCode, Lock,
  ShoppingCart, BadgeDollarSign, Boxes, IdCard, Percent, BarChart3, Wallet, type LucideIcon
} from 'lucide-react';
import { useSite } from '../SiteStore';
import { ct } from './cms';
import { shotKey } from './StudioTour';

export type ModuleShot = { src: string; title: string; text: string };

const ICONS: Record<string, LucideIcon> = {
  'Tổng quan': LayoutDashboard, 'Hội viên': Users, 'Gói tập': Package, 'Thẻ tập theo buổi': Ticket, 'Lịch lớp': CalendarDays,
  'Đặt chỗ hôm nay': ClipboardCheck, 'Lịch hẹn PT': UserRound, 'Check-in': QrCode, 'Tủ đồ': Lock, 'Bán hàng (POS)': ShoppingCart,
  'Bán gói cho hội viên': BadgeDollarSign, 'Kho hàng': Boxes, 'Nhân sự & HLV': IdCard, 'Hoa hồng nhân viên': Percent, 'Báo cáo': BarChart3, 'Ví câu lạc bộ': Wallet
};

/** Nhóm theo nơi công việc diễn ra trong một ngày ở phòng tập. */
const GROUPS: { label: string; hint: string; titles: string[] }[] = [
  { label: 'Tại quầy lễ tân', hint: 'Đón khách, bán gói, bán hàng', titles: ['Check-in', 'Bán gói cho hội viên', 'Bán hàng (POS)', 'Tủ đồ'] },
  { label: 'Hội viên & lịch tập', hint: 'Gói, lớp, đặt chỗ, PT 1-1', titles: ['Hội viên', 'Gói tập', 'Thẻ tập theo buổi', 'Lịch lớp', 'Đặt chỗ hôm nay', 'Lịch hẹn PT'] },
  { label: 'Kho & đội ngũ', hint: 'Hàng hóa, nhân sự, hoa hồng', titles: ['Kho hàng', 'Nhân sự & HLV', 'Hoa hồng nhân viên'] },
  { label: 'Tổng quan & tài chính', hint: 'Số liệu cho chủ cơ sở', titles: ['Tổng quan', 'Báo cáo', 'Ví câu lạc bộ'] }
];

export function StudioModules({ modules }: { modules: ModuleShot[] }) {
  const { data } = useSite();
  // Chữ sửa được (lib/site-text.ts). Nhóm và biểu tượng vẫn khớp theo tên gốc của phân hệ (m.title).
  const view = (m: ModuleShot) => ({ t: ct(data, `${shotKey(m.src)}.title`, m.title, 'Tên phân hệ'), x: ct(data, `${shotKey(m.src)}.text`, m.text, 'Mô tả phân hệ', { multiline: true }) });
  const note = ct(data, 'studio.modules.note', 'Ảnh chụp màn hình thật của phần mềm, dữ liệu mẫu.', 'Ghi chú dưới màn hình');
  // Thứ tự hiển thị theo nhóm; phân hệ không thuộc nhóm nào vẫn được giữ ở cuối.
  const grouped = GROUPS.map(g => ({ ...g, items: g.titles.map(t => modules.find(m => m.title === t)).filter((m): m is ModuleShot => !!m) }));
  const order = [...grouped.flatMap(g => g.items), ...modules.filter(m => !GROUPS.some(g => g.titles.includes(m.title)))];
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = order[active];
  const Icon = ICONS[cur.title] || LayoutDashboard;
  const cv = view(cur);

  const go = (i: number, focus = false) => {
    const n = (i + order.length) % order.length;
    setActive(n);
    if (focus) buttons.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(active + 1, true); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1, true); }
  };
  let k = -1;

  return (
    <div className="smx">
      <div className="smx__nav" aria-label="Chọn phân hệ">
        {grouped.map((g, gi) => {
          const gl = ct(data, `studio.modules.groups.${gi}.label`, g.label, 'Tên nhóm phân hệ'), gh = ct(data, `studio.modules.groups.${gi}.hint`, g.hint, 'Gợi ý nhóm phân hệ');
          return (
          <div key={g.label} className="smx__group">
            <p className="smx__glabel"><span {...gl.a}>{gl.v}</span><small {...gh.a}>{gh.v}</small></p>
            <ul>
              {g.items.map(m => {
                k += 1;
                const i = k;
                const MIcon = ICONS[m.title] || LayoutDashboard;
                const mv = view(m);
                return (
                  <li key={m.src}>
                    <button
                      ref={el => { buttons.current[i] = el; }}
                      type="button"
                      aria-pressed={i === active}
                      onClick={() => go(i)}
                      onMouseEnter={() => go(i)}
                      onKeyDown={onKey}
                    >
                      <span className="smx__icon"><MIcon aria-hidden="true" /></span>
                      <span className="smx__t">
                        <strong {...mv.t.a}>{mv.t.v}</strong>
                        <small {...mv.x.a}>{mv.x.v}</small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
      </div>

      <div className="smx__stage">
        <div className="smx__frame">
          <span className="smx__bar" aria-hidden="true"><i /><i /><i /><b>studio.danava.vn</b></span>
          <div className="smx__screen">
            {/* key đổi theo phân hệ → ảnh mới hiện dần; ảnh trước được trình duyệt giữ trong bộ nhớ đệm */}
            <img key={cur.src} src={cur.src} alt={`Màn hình ${cv.t.v} trong DANAVA Studio — ${cv.x.v}`} width={1280} height={800} decoding="async" />
          </div>
        </div>
        <div className="smx__caption" aria-live="polite">
          <span className="smx__cicon"><Icon aria-hidden="true" /></span>
          <div>
            <p className="smx__count">{String(active + 1).padStart(2, '0')} <span>/ {String(order.length).padStart(2, '0')}</span></p>
            <p className="smx__ctitle" {...cv.t.a}>{cv.t.v}</p>
            <p className="smx__ctext" {...cv.x.a}>{cv.x.v}</p>
          </div>
          <div className="smx__arrows">
            <button type="button" onClick={() => go(active - 1)} aria-label="Phân hệ trước"><ArrowLeft aria-hidden="true" /></button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Phân hệ tiếp theo"><ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
        <p className="smx__note" {...note.a}>{note.v}</p>
      </div>
    </div>
  );
}
