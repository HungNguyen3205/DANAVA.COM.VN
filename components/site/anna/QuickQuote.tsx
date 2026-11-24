'use client';
/** Báo giá nhanh: tính bằng bảng giá trong CMS, không dùng AI (vẫn chạy khi AI chưa cấu hình). */
import Link from 'next/link';
import { useState } from 'react';
import { useSite } from '../../SiteStore';
import { block } from '@/lib/blocks';
import { estimate, money, priceText, recommendPlan, type Need } from '@/lib/quote';
import { sortServices } from '../catalog';
import { cmsText, ct } from '../cms';
import { txt } from '@/lib/site-text';

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
  // Chữ cố định (khóa anna.ui.quote.*, dùng chung toàn website): span sửa / dịch được, hoặc chữ thuần (option, thuộc tính)
  const q = (k: string, def: string, label: string) => ct(data, `anna.ui.quote.${k}`, def, label, { scope: 'global' });
  const t = (k: string, def: string) => txt(data, `anna.ui.quote.${k}`, def);
  const S = (k: string, def: string, label: string) => { const x = q(k, def, label); return <span style={{ display: 'inline' }} {...x.a}>{x.v}</span>; };
  const planName = (p: { id: string; name: string }) => t(`plans.${p.id}`, p.name);
  const price = (v: string) => { const out = priceText(v); return out === 'Miễn phí' ? t('free', out) : out === 'Liên hệ báo giá' ? t('ask-price', out) : out; };

  return (
    <div className="qq">
      <label className="qq-field">
        {(() => { const x = q('service', 'Dịch vụ cần báo giá', 'Nhãn ô dịch vụ (báo giá nhanh)'); return <span {...x.a}>{x.v}</span>; })()}
        <select value={service.id} onChange={e => setServiceId(e.target.value)}>
          {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </label>

      {!calculable ? (
        <div className="qq-result qq-result--staff" role="status">
          <p className="qq-kind qq-kind--staff">{S('staff', 'Cần nhân viên xác nhận', 'Nhãn kết quả (báo giá nhanh)')}</p>
          <p>{service.pricing || S('no-table', 'Dịch vụ này chưa có bảng giá công khai. DANAVA sẽ báo giá theo phạm vi công việc cụ thể.', 'Câu khi chưa có bảng giá')}</p>
          <Link className="qq-send" href={`/lien-he/?service=${service.slug}`}>{S('send', 'Gửi yêu cầu báo giá', 'Nút gửi yêu cầu báo giá')}</Link>
        </div>
      ) : (
        <>
          <div className="qq-needs">
            {NEEDS.map(([key, label]) => (
              <label key={key} className="qq-field">
                {(() => { const x = q(`needs.${key}`, label, 'Nhãn ô quy mô (báo giá nhanh)'); return <span {...x.a}>{x.v}</span>; })()}
                <input inputMode="numeric" autoComplete="off" value={need[key]} placeholder={t('qty', 'Số lượng')}
                  onChange={e => { setNeed({ ...need, [key]: e.target.value.replace(/\D/g, '').slice(0, 6) }); setPicked(''); }} />
              </label>
            ))}
          </div>

          <label className="qq-field">
            {(() => { const x = q('plan', 'Gói DANAVA Studio', 'Nhãn ô chọn gói (báo giá nhanh)'); return <span {...x.a}>{x.v}</span>; })()}
            <select value={planId} onChange={e => setPicked(e.target.value)}>
              <option value="">{t('plan-empty', 'Chọn gói hoặc nhập quy mô ở trên')}</option>
              {pricing.plans.map(p => <option key={p.id} value={p.id}>{planName(p)} · {price(p.price)}</option>)}
            </select>
          </label>

          {described && (
            <p className="qq-hint" role="status">
              {suggested
                ? t('hint', 'Gói {plan} là mức thấp nhất đủ hạn mức bạn nhập. Gợi ý chưa xét tính năng cần dùng.').replace('{plan}', planName(suggested))
                : S('over', 'Quy mô này vượt hạn mức các gói đang công bố. Cần nhân viên DANAVA tư vấn cấu hình và báo giá.', 'Câu khi vượt hạn mức (báo giá nhanh)')}
            </p>
          )}

          {pricing.addons.length > 0 && (
            <fieldset className="qq-addons">
              <legend>{S('addons', 'Tùy chọn mua thêm', 'Tiêu đề tùy chọn mua thêm')}</legend>
              {pricing.addons.map((addon, ai) => (
                <div key={addon.id} className="qq-addon">
                  <label>
                    <input type="checkbox" checked={!!quantities[addon.id]} onChange={e => setQuantities({ ...quantities, [addon.id]: e.target.checked ? 1 : 0 })} />
                    <span><span style={{ display: 'inline' }} {...cmsText(`block.pricing.addons.${ai}.name`, 'Tên tùy chọn mua thêm', { scope: 'global' })}>{addon.name}</span><small>{price(addon.price)} / {addon.monthly ? S('month', 'tháng', 'Đơn vị theo tháng') : S('once', 'lần', 'Đơn vị theo lần')}</small></span>
                  </label>
                  {!addon.monthly && !!quantities[addon.id] && (
                    <select aria-label={`${t('qty', 'Số lượng')} ${addon.name}`} value={quantities[addon.id]} onChange={e => setQuantities({ ...quantities, [addon.id]: Number(e.target.value) })}>
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
                ? <p className="qq-kind qq-kind--staff">{S('staff', 'Cần nhân viên xác nhận', 'Nhãn kết quả (báo giá nhanh)')}</p>
                : <p className="qq-kind">{S('reference', 'Báo giá tham khảo', 'Nhãn kết quả (báo giá nhanh)')}</p>}
              <dl>
                {result.lines.map(l => <div key={l.label}><dt>{l.label}</dt><dd>{l.amount === null ? S('contact', 'Liên hệ', 'Giá chưa công bố (báo giá nhanh)') : money(l.amount)}</dd></div>)}
                {result.total !== null && <div className="qq-total"><dt>{S('total', 'Tạm tính', 'Nhãn tổng (báo giá nhanh)')}</dt><dd>{money(result.total)}</dd></div>}
              </dl>
              <p className="qq-note"><span style={{ display: 'inline' }} {...cmsText('block.pricing.note', 'Ghi chú bảng giá', { multiline: true, scope: 'global' })}>{pricing.note}</span>{pricing.checked && <> {S('checked', 'Bảng giá cập nhật', 'Chữ trước ngày cập nhật bảng giá')} {pricing.checked}.</>} {S('disclaimer', 'Đây chưa phải báo giá chính thức: nhân viên DANAVA sẽ xác nhận.', 'Lưu ý báo giá tham khảo')}</p>
              <Link className="qq-send" href={`/lien-he/?service=${service.slug}`}>{S('confirm', 'Nhờ nhân viên xác nhận', 'Nút nhờ nhân viên xác nhận')}</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
