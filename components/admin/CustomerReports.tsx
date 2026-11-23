'use client';
/**
 * Khách hàng → Danh bạ, Biểu mẫu; Báo cáo → Nguồn khách.
 * Tính từ bảng yêu cầu tư vấn thật (không lưu thêm bản sao). Danh bạ gộp các lần gửi theo số điện thoại/email.
 */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { leadStatus, timeAgo, useAdminLeads, type AdminLead } from '../adminData';
import { Empty, ErrorBox, Loading, SearchBar, matches, usePaged } from './ui';

/** Biểu mẫu đã biết trên website: mã nguồn gửi kèm yêu cầu → tên và nơi đặt. */
export const FORMS: { id: string; label: string; where: string; test: (source: string) => boolean }[] = [
  { id: 'lien-he', label: 'Form Liên hệ', where: '/lien-he/', test: s => s === 'lien-he' || /\/lien-he\/?$/.test(s) },
  { id: 'phieu-landing', label: 'Chatbot báo giá landing page / website', where: '/bao-gia-web/', test: s => s === 'phieu-landing' },
  { id: 'phieu-su-kien', label: 'Chatbot báo giá tổ chức sự kiện', where: '/dich-vu/', test: s => s === 'phieu-su-kien' },
  { id: 'dich-vu-landing-page', label: 'Form trang Landing page', where: '/dich-vu/landing-page/', test: s => s === 'dich-vu-landing-page' },
  { id: 'tuyen-dung', label: 'Form ứng tuyển', where: '/tuyen-dung/', test: s => s === '/tuyen-dung/' },
  { id: 'landing', label: 'Form trên landing page', where: '', test: s => s.startsWith('lp:') },
];
const OTHER = { id: 'khac', label: 'Form trên các trang khác', where: '' };

export function formOf(source = '') {
  const s = source.trim();
  return FORMS.find(f => f.test(s)) || OTHER;
}

/** Đường dẫn trang gửi yêu cầu (bỏ tên miền, tham số). */
export function pageOf(source = '') {
  const s = source.trim();
  if (!s) return '(không rõ)';
  if (s.startsWith('/')) return s.split('?')[0];
  if (s.startsWith('lp:')) return `/lp/${s.slice(3)}/`;
  try { return new URL(s).pathname; } catch { return formOf(s).where || s; }
}

const keyOf = (l: AdminLead) => (l.phone || '').replace(/\D/g, '') || (l.email || '').trim().toLowerCase() || l.id;
const PERIODS = [{ id: 7, label: '7 ngày' }, { id: 30, label: '30 ngày' }, { id: 90, label: '90 ngày' }, { id: 0, label: 'Tất cả' }];

function useLeads() {
  return useAdminLeads(1000);
}

/* ---------------------------------------------------------------- Danh bạ */
export function ContactBook() {
  const { leads, loading, error, reload } = useLeads();
  const [q, setQ] = useState('');
  const people = useMemo(() => {
    const map = new Map<string, { key: string; name: string; phone: string; email: string; company: string; count: number; last: number; services: Set<string>; status: string }>();
    for (const l of [...leads].sort((a, b) => a.created_at - b.created_at)) {
      const k = keyOf(l);
      const p = map.get(k) || { key: k, name: '', phone: '', email: '', company: '', count: 0, last: 0, services: new Set<string>(), status: 'new' };
      p.name = l.name || p.name;
      p.phone = l.phone || p.phone;
      p.email = l.email || p.email;
      p.company = l.business_type || p.company;
      p.count += 1;
      p.last = Math.max(p.last, l.created_at);
      p.status = l.status || p.status;
      if (l.service) p.services.add(l.service);
      map.set(k, p);
    }
    return [...map.values()].sort((a, b) => b.last - a.last);
  }, [leads]);
  const shown = people.filter(p => matches(q, p.name, p.phone, p.email, p.company, [...p.services].join(' ')));
  const { slice, pager } = usePaged(shown);

  if (loading && !leads.length) return <Loading label="Đang tải danh bạ…" />;
  if (error) return <ErrorBox retry={reload}>{error}</ErrorBox>;
  return (
    <section className="admin-panel">
      <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tên, số điện thoại, email, dịch vụ…" />
      {!people.length ? <Empty>Chưa có khách hàng nào gửi yêu cầu từ website.</Empty> : !shown.length ? <Empty>Không có khách hàng nào khớp “{q}”.</Empty> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Quan tâm</th><th>Số lần gửi</th><th>Gần nhất</th></tr></thead>
            <tbody>
              {slice.map(p => (
                <tr key={p.key}>
                  <td><b>{p.name || '(chưa có tên)'}</b>{p.company && <small>{p.company}</small>}</td>
                  <td>{p.phone && <a className="text-link" href={`tel:${p.phone}`}>{p.phone}</a>}{p.email && <small><a href={`mailto:${p.email}`}>{p.email}</a></small>}</td>
                  <td><small>{[...p.services].slice(0, 3).join(' · ') || 'Tư vấn chung'}</small></td>
                  <td>{p.count}</td>
                  <td>{timeAgo(p.last)}<small>{leadStatus[p.status]?.label || p.status}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pager}
    </section>
  );
}

/* ---------------------------------------------------------------- Biểu mẫu */
export function FormsReport() {
  const { leads, loading, error, reload } = useLeads();
  if (loading && !leads.length) return <Loading label="Đang tải biểu mẫu…" />;
  if (error) return <ErrorBox retry={reload}>{error}</ErrorBox>;
  const since = Date.now() - 30 * 86400_000;
  const rows = [...FORMS, OTHER].map(f => {
    const list = leads.filter(l => formOf(l.source).id === f.id);
    return { ...f, total: list.length, recent: list.filter(l => l.created_at >= since).length, open: list.filter(l => (l.status || 'new') === 'new').length, last: Math.max(0, ...list.map(l => l.created_at)) };
  });
  return (
    <section className="admin-panel">
      <p className="field-note">Các biểu mẫu đang chạy trên website. Yêu cầu gửi về được lưu ở mục Yêu cầu tư vấn; số liệu dưới đây tính từ dữ liệu đó.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Biểu mẫu</th><th>Tổng</th><th>30 ngày</th><th>Chưa xử lý</th><th>Gần nhất</th></tr></thead>
          <tbody>
            {rows.map(f => (
              <tr key={f.id}>
                <td><b>{f.label}</b>{f.where && <small><a className="text-link" href={f.where} target="_blank" rel="noopener">{f.where} ↗</a></small>}</td>
                <td>{f.total}</td>
                <td>{f.recent}</td>
                <td>{f.open ? <span className="badge">{f.open}</span> : 0}</td>
                <td>{f.last ? timeAgo(f.last) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="field-note"><Link className="text-link" href="/admin/khach-hang/">Mở danh sách yêu cầu tư vấn →</Link></p>
    </section>
  );
}

/* ---------------------------------------------------------------- Nguồn khách */
function Breakdown({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      {!rows.length ? <Empty>Chưa có dữ liệu trong khoảng thời gian này.</Empty> : (
        <ul className="adm-bars">
          {rows.map(([label, n]) => (
            <li key={label}>
              <span className="adm-bars__label">{label}</span>
              <span className="adm-bars__track" aria-hidden="true"><i style={{ width: `${Math.max(3, (n / total) * 100)}%` }} /></span>
              <b>{n}</b>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SourcesReport() {
  const { leads, loading, error, reload } = useLeads();
  const [days, setDays] = useState(30);
  if (loading && !leads.length) return <Loading label="Đang tải nguồn khách…" />;
  if (error) return <ErrorBox retry={reload}>{error}</ErrorBox>;
  const since = days ? Date.now() - days * 86400_000 : 0;
  const list = leads.filter(l => l.created_at >= since);
  const count = (pick: (l: AdminLead) => string) => {
    const m = new Map<string, number>();
    for (const l of list) { const k = pick(l) || '(không rõ)'; m.set(k, (m.get(k) || 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  };
  const converted = list.filter(l => l.status === 'completed').length;
  return (
    <div className="blk-stack">
      <div className="adm-listbar">
        <div className="adm-tabs" role="tablist" aria-label="Khoảng thời gian">
          {PERIODS.map(p => <button key={p.id} type="button" role="tab" aria-selected={days === p.id} className={days === p.id ? 'is-on' : ''} onClick={() => setDays(p.id)}>{p.label}</button>)}
        </div>
        <p className="field-note"><b>{list.length}</b> yêu cầu · <b>{converted}</b> hoàn tất{list.length ? ` (${Math.round((converted / list.length) * 100)}%)` : ''}</p>
      </div>
      <div className="admin-two">
        <Breakdown title="Theo biểu mẫu" rows={count(l => formOf(l.source).label)} total={list.length} />
        <Breakdown title="Theo dịch vụ quan tâm" rows={count(l => (l.service || 'Tư vấn chung').split('—')[0].trim())} total={list.length} />
        <Breakdown title="Theo trang gửi yêu cầu" rows={count(l => pageOf(l.source))} total={list.length} />
        <Breakdown title="Theo lĩnh vực khách hàng" rows={count(l => l.business_type || '')} total={list.length} />
      </div>
    </div>
  );
}
