'use client';
/** Bảng so sánh module các gói DANAVA Studio (dữ liệu từ hello.danava.vn). Có nút "Chỉ xem điểm khác nhau". */
import { useState } from 'react';
import { Check, Minus, ShoppingBag } from 'lucide-react';

type Mod = { group: string; name: string; desc: string; v: ('y' | 'n' | 'buy')[] };

export function HelloCompare({ plans, modules }: { plans: string[]; modules: Mod[] }) {
  const [diff, setDiff] = useState(false);
  const rows = diff ? modules.filter(m => new Set(m.v).size > 1) : modules;
  const groups = Array.from(new Set(rows.map(r => r.group)));
  return (
    <div className="phl-cmp">
      <div className="phl-cmp__bar">
        <p>{rows.length} module{diff ? ' khác nhau giữa các gói' : ''}</p>
        <label className="phl-switch">
          <input type="checkbox" checked={diff} onChange={e => setDiff(e.target.checked)} />
          <span aria-hidden="true" />
          Chỉ xem điểm khác nhau
        </label>
      </div>
      <div className="phl-cmp__scroll" tabIndex={0} aria-label="Bảng so sánh tính năng, cuộn ngang trên điện thoại">
        <table>
          <thead>
            <tr><th scope="col">Module</th>{plans.map((p, i) => <th key={p} scope="col" className={i === 2 ? 'is-hl' : undefined}>{p}</th>)}</tr>
          </thead>
          <tbody>
            {groups.map(g => [
              <tr key={g} className="phl-cmp__group"><th colSpan={plans.length + 1} scope="colgroup">{g}</th></tr>,
              ...rows.filter(r => r.group === g).map(r => (
                <tr key={r.name}>
                  <th scope="row"><b>{r.name}</b><small>{r.desc}</small></th>
                  {r.v.map((x, i) => (
                    <td key={i} className={i === 2 ? 'is-hl' : undefined}>
                      {x === 'y' ? <span className="phl-yes"><Check aria-hidden="true" />Có sẵn</span>
                        : x === 'buy' ? <span className="phl-buy"><ShoppingBag aria-hidden="true" />Mua thêm</span>
                          : <span className="phl-no"><Minus aria-hidden="true" /><span className="s-sr">Không có</span></span>}
                    </td>
                  ))}
                </tr>
              ))
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}
