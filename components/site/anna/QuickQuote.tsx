'use client';
/** Báo giá nhanh: tính bằng bảng giá trong CMS, không dùng AI (vẫn chạy khi AI chưa cấu hình). */
import Link from 'next/link';
import { useState } from 'react';
import { useSite } from '../../SiteStore';
import { block } from '@/lib/blocks';
import { estimate, money, priceText, recommendPlan, type Need } from '@/lib/quote';
import { sortServices } from '../catalog';

const NEEDS: [keyof Need, string][] = [['members', 'Hội viên'], ['staff', 'Nhân sự'], ['branches', 'Chi nhánh']];

export function QuickQuote() {
  const { data } = useSite();
  const pricing = block(data, 'pricing');
  const services = sortServices(data.services);
  const [serviceId, setServiceId] = useState('studio');
  const [need, setNeed] = useState<Record<keyof Need, string>>({ members: '', staff: '', branches: '' });
  const [picked, setPicked] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const service = services.find(s => s.id === serviceId) || services[0];
  if (!service) return null;
  const calculable = service.id === 'studio' && pricing.enabled && pricing.plans.length > 0;

  const numbers: Need = { members: Number(need.members), staff: Number(need.staff), branches: Number(need.branches) };
  const described = Object.values(numbers).some(n => n > 0);
  const suggested = described ? recommendPlan(pricing, numbers) : null;
  const planId = picked || suggested?.id || '';
  const result = calculable && planId ? estimate(pricing, planId, quantities) : null;

  return (
    <div className="qq">
      <label className="qq-field">
        <span>Dịch vụ cần báo giá</span>
        <select value={service.id} onChange={e => setServiceId(e.target.value)}>
          {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </label>

      {!calculable ? (
        <div className="qq-result qq-result--staff" role="status">
          <p className="qq-kind qq-kind--staff">Cần nhân viên xác nhận</p>
          <p>{service.pricing || 'Dịch vụ này chưa có bảng giá công khai. DANAVA sẽ báo giá theo phạm vi công việc cụ thể.'}</p>
          <Link className="qq-send" href={`/lien-he/?service=${service.slug}`}>Gửi yêu cầu báo giá</Link>
        </div>
      ) : (
        <>
          <div className="qq-needs">
            {NEEDS.map(([key, label]) => (
              <label key={key} className="qq-field">
                <span>{label}</span>
                <input inputMode="numeric" autoComplete="off" value={need[key]} placeholder="Số lượng"
                  onChange={e => { setNeed({ ...need, [key]: e.target.value.replace(/\D/g, '').slice(0, 6) }); setPicked(''); }} />
              </label>
            ))}
          </div>

          <label className="qq-field">
            <span>Gói DANAVA Studio</span>
            <select value={planId} onChange={e => setPicked(e.target.value)}>
              <option value="">Chọn gói hoặc nhập quy mô ở trên</option>
              {pricing.plans.map(p => <option key={p.id} value={p.id}>{p.name} · {priceText(p.price)}</option>)}
            </select>
          </label>

          {described && (
            <p className="qq-hint" role="status">
              {suggested
                ? `Gói ${suggested.name} là mức thấp nhất đủ hạn mức bạn nhập. Gợi ý chưa xét tính năng cần dùng.`
                : 'Quy mô này vượt hạn mức các gói đang công bố. Cần nhân viên DANAVA tư vấn cấu hình và báo giá.'}
            </p>
          )}

          {pricing.addons.length > 0 && (
            <fieldset className="qq-addons">
              <legend>Tùy chọn mua thêm</legend>
              {pricing.addons.map(addon => (
                <div key={addon.id} className="qq-addon">
                  <label>
                    <input type="checkbox" checked={!!quantities[addon.id]} onChange={e => setQuantities({ ...quantities, [addon.id]: e.target.checked ? 1 : 0 })} />
                    <span>{addon.name}<small>{priceText(addon.price)} / {addon.monthly ? 'tháng' : 'lần'}</small></span>
                  </label>
                  {!addon.monthly && !!quantities[addon.id] && (
                    <select aria-label={`Số lượng ${addon.name}`} value={quantities[addon.id]} onChange={e => setQuantities({ ...quantities, [addon.id]: Number(e.target.value) })}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </fieldset>
          )}

          {result && (
            <div className="qq-result" role="status">
              {result.total === null
                ? <p className="qq-kind qq-kind--staff">Cần nhân viên xác nhận</p>
                : <p className="qq-kind">Báo giá tham khảo</p>}
              <dl>
                {result.lines.map(l => <div key={l.label}><dt>{l.label}</dt><dd>{l.amount === null ? 'Liên hệ' : money(l.amount)}</dd></div>)}
                {result.total !== null && <div className="qq-total"><dt>Tạm tính</dt><dd>{money(result.total)}</dd></div>}
              </dl>
              <p className="qq-note">{pricing.note}{pricing.checked && ` Bảng giá cập nhật ${pricing.checked}.`} Đây chưa phải báo giá chính thức: nhân viên DANAVA sẽ xác nhận.</p>
              <Link className="qq-send" href={`/lien-he/?service=${service.slug}`}>Nhờ nhân viên xác nhận</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
