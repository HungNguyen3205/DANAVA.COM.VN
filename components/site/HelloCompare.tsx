'use client';
/**
 * Bảng so sánh module các gói DANAVA Studio (dữ liệu từ hello.danava.vn). Có nút "Chỉ xem điểm khác nhau".
 * Chữ sửa trực tiếp được: khóa hcompare.* (nhóm, tên / mô tả module theo vị trí trong lib/products.ts → HELLO.modules);
 * tên gói ở đầu cột là trường của bảng giá (block.pricing.plans.<vị trí>.name).
 */
import { Fragment, useState } from 'react';
import { Check, Minus, ShoppingBag } from 'lucide-react';
import { useSite } from '../SiteStore';
import { cmsText, ct } from './cms';

type Mod = { group: string; name: string; desc: string; v: ('y' | 'n' | 'buy')[] };

export function HelloCompare({ plans, modules, highlight }: { plans: { name: string; index: number }[]; modules: Mod[]; highlight: number }) {
  const { data } = useSite();
  const P = (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = ct(data, `hcompare.${k}`, def, label, opts); return { ...x.a, children: x.v }; };
  const [diff, setDiff] = useState(false);
  // Khóa cố định theo vị trí trong danh sách đầy đủ (không đổi khi lọc "chỉ xem điểm khác nhau")
  const allGroups = Array.from(new Set(modules.map(m => m.group)));
  const rows = (diff ? modules.filter(m => new Set(m.v).size > 1) : modules).map(m => ({ ...m, k: modules.indexOf(m) }));
  const groups = Array.from(new Set(rows.map(r => r.group)));
  return (
    <div className="phl-cmp">
      <div className="phl-cmp__bar">
        <p>{rows.length} <span {...P('unit', 'module', 'Đơn vị đếm module')} />{diff && <> <span {...P('diff-count', 'khác nhau giữa các gói', 'Chữ sau số module khi lọc')} /></>}</p>
        <label className="phl-switch">
          <input type="checkbox" checked={diff} onChange={e => setDiff(e.target.checked)} />
          <span aria-hidden="true" />
          {/* Không dùng <span>: .phl-switch span là nút gạt */}
          <em style={{ fontStyle: 'normal' }} {...P('diff', 'Chỉ xem điểm khác nhau', 'Nút lọc điểm khác nhau')} />
        </label>
      </div>
      <div className="phl-cmp__scroll" tabIndex={0} aria-label="Bảng so sánh tính năng, cuộn ngang trên điện thoại">
        <table>
          <thead>
            <tr><th scope="col" {...P('head', 'Module', 'Tiêu đề cột module')} />{plans.map((p, i) => <th key={`${p.name}-${i}`} scope="col" className={i === highlight ? 'is-hl' : undefined} {...(p.index >= 0 ? cmsText(`block.pricing.plans.${p.index}.name`, 'Tên gói', { scope: 'global' }) : {})}>{p.name}</th>)}</tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <Fragment key={`grp-${g}`}>
                <tr className="phl-cmp__group"><th colSpan={plans.length + 1} scope="colgroup" {...P(`groups.${allGroups.indexOf(g)}`, g, 'Nhóm module')} /></tr>
                {rows.filter(r => r.group === g).map(r => (
                  <tr key={`${g}-${r.name}`}>
                    <th scope="row"><b {...P(`modules.${r.k}.name`, r.name, 'Tên module')} /><small {...P(`modules.${r.k}.desc`, r.desc, 'Mô tả module', { multiline: true })} /></th>
                    {r.v.map((x, i) => (
                      <td key={i} className={i === highlight ? 'is-hl' : undefined}>
                        {x === 'y' ? <span className="phl-yes"><Check aria-hidden="true" /><span {...P('yes', 'Có sẵn', 'Nhãn: có sẵn')} /></span>
                          : x === 'buy' ? <span className="phl-buy"><ShoppingBag aria-hidden="true" /><span {...P('buy', 'Mua thêm', 'Nhãn: mua thêm')} /></span>
                            : <span className="phl-no"><Minus aria-hidden="true" /><span className="s-sr" {...P('no', 'Không có', 'Nhãn: không có (cho trình đọc màn hình)')} /></span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
