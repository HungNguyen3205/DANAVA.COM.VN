'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Icon } from './AdminIcons';
import { initials } from './AdminShell';
import { csrfToken, leadStatus, timeAgo, useAdminLeads, type AdminLead } from './adminData';

export type { AdminLead };

const DANAVA_STAFF_MEMBERS = [
  'Phạm Trang — Trưởng phòng CSKH',
  'Lê Tấn Thành — Founder & CEO',
  'Trần Văn Nam — Marketing Director',
  'Avinash Saini — Creative Director',
  'Đặng Ngọc Thông — Manager',
];

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'new', label: 'Mới' },
  { key: 'assigned', label: 'Đã phân công' },
  { key: 'contacted', label: 'Đang trao đổi' },
  { key: 'completed', label: 'Hoàn tất' },
];

const fullDate = (ms: number) =>
  new Date(ms).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function LeadsManager() {
  const { leads, setLeads, loading, error, reload } = useAdminLeads(100);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState<AdminLead | null>(null);

  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('new');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!selected) return;
    setAssignee(selected.assigned_to || '');
    setStatus(selected.status || 'new');
    setNote(selected.assigned_note || '');
    setSaveMsg(null);
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  async function saveAssignment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/admin/leads/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': await csrfToken() },
        body: JSON.stringify({ id: selected.id, assigned_to: assignee, status, assigned_note: note }),
      });
      if (!res.ok) throw new Error('Không thể cập nhật. Thử tải lại trang rồi lưu lại.');
      const updated = { ...selected, assigned_to: assignee, status, assigned_note: note };
      setLeads(prev => prev.map(l => (l.id === selected.id ? updated : l)));
      setSelected(updated);
      setSaveMsg({ ok: true, text: 'Đã lưu phân công.' });
    } catch (err) {
      setSaveMsg({ ok: false, text: err instanceof Error ? err.message : 'Lỗi cập nhật.' });
    } finally {
      setSaving(false);
    }
  }

  const countBy = (k: string) => (k === 'all' ? leads.length : leads.filter(l => (l.status || 'new') === k).length);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return leads.filter(l => {
      if (tab !== 'all' && (l.status || 'new') !== tab) return false;
      if (!q) return true;
      return [l.name, l.phone, l.email, l.service, l.business_type, l.assigned_to].some(v => (v || '').toLowerCase().includes(q));
    });
  }, [leads, query, tab]);

  const week = Date.now() - 7 * 86400_000;

  return (
    <div className="adm-leads">
      <div className="adm-stats">
        <article className="adm-card adm-stat tone-amber">
          <span className="adm-stat-label">
            <Icon name="inbox" size={16} /> Tổng yêu cầu
          </span>
          <strong>{leads.length}</strong>
          <span className="adm-stat-foot">
            <em className="up">+{leads.filter(l => l.created_at >= week).length}</em> trong 7 ngày
          </span>
        </article>
        <article className="adm-card adm-stat tone-rose">
          <span className="adm-stat-label">
            <Icon name="bell" size={16} /> Chờ phân công
          </span>
          <strong>{countBy('new')}</strong>
          <span className="adm-stat-foot">Cần liên hệ lại sớm</span>
        </article>
        <article className="adm-card adm-stat tone-violet">
          <span className="adm-stat-label">
            <Icon name="phone" size={16} /> Đang trao đổi
          </span>
          <strong>{countBy('contacted') + countBy('assigned')}</strong>
          <span className="adm-stat-foot">Đã có người phụ trách</span>
        </article>
        <article className="adm-card adm-stat tone-green">
          <span className="adm-stat-label">
            <Icon name="check" size={16} /> Hoàn tất
          </span>
          <strong>{countBy('completed')}</strong>
          <span className="adm-stat-foot">
            {leads.length ? Math.round((countBy('completed') / leads.length) * 100) : 0}% tổng yêu cầu
          </span>
        </article>
      </div>

      <section className="adm-card adm-table-card">
        <div className="adm-toolbar">
          <div className="adm-tabs" role="tablist" aria-label="Lọc theo trạng thái">
            {tabs.map(t => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                {t.label}
                <span>{countBy(t.key)}</span>
              </button>
            ))}
          </div>
          <div className="adm-toolbar-right">
            <label className="adm-input-icon">
              <Icon name="search" size={16} />
              <input
                placeholder="Tìm tên, SĐT, dịch vụ…"
                aria-label="Tìm khách hàng"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </label>
            <button type="button" className="adm-btn adm-btn-ghost" onClick={reload} disabled={loading} aria-label="Tải lại danh sách">
              <Icon name="refresh" size={16} /> {loading ? 'Đang tải…' : 'Tải lại'}
            </button>
          </div>
        </div>

        {error && <p className="adm-inline-error">{error}</p>}

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Nhu cầu</th>
                <th>Trạng thái</th>
                <th>Phụ trách</th>
                <th>Gửi lúc</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const st = leadStatus[l.status || 'new'] || leadStatus.new;
                return (
                  <tr
                    key={l.id}
                    className={selected?.id === l.id ? 'is-selected' : ''}
                    tabIndex={0}
                    onClick={() => setSelected(l)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelected(l))}
                    aria-label={`Mở chi tiết ${l.name}`}
                  >
                    <td>
                      <div className="adm-person">
                        <span className="adm-avatar sm">{initials(l.name)}</span>
                        <span>
                          <b>{l.name}</b>
                          {l.business_type && <small>{l.business_type}</small>}
                        </span>
                      </div>
                    </td>
                    <td>
                      {l.phone && <span className="adm-cell-strong">{l.phone}</span>}
                      {l.email && <small>{l.email}</small>}
                    </td>
                    <td>
                      <span className="adm-cell-clip">{l.service || 'Tư vấn chung'}</span>
                    </td>
                    <td>
                      <span className={`adm-pill tone-${st.tone}`}>{st.label}</span>
                    </td>
                    <td>{l.assigned_to ? <span className="adm-cell-strong">{l.assigned_to.split('—')[0].trim()}</span> : <small className="adm-muted">Chưa có</small>}</td>
                    <td>
                      <small title={fullDate(l.created_at)}>{timeAgo(l.created_at)}</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && !loading && (
            <div className="adm-empty">
              <Icon name="inbox" size={28} />
              <p>{query || tab !== 'all' ? 'Không có khách hàng phù hợp bộ lọc.' : 'Chưa có yêu cầu tư vấn nào từ website.'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Ngăn chi tiết trượt từ phải */}
      <div className={`adm-drawer-wrap ${selected ? 'is-open' : ''}`} aria-hidden={!selected}>
        <button className="adm-drawer-scrim" aria-label="Đóng chi tiết" tabIndex={-1} onClick={() => setSelected(null)} />
        <aside className="adm-drawer" role="dialog" aria-modal="true" aria-label="Chi tiết khách hàng">
          {selected && (
            <>
              <div className="adm-drawer-head">
                <span className="adm-avatar lg">{initials(selected.name)}</span>
                <div>
                  <h2>{selected.name}</h2>
                  <p>
                    Gửi {timeAgo(selected.created_at)} · {fullDate(selected.created_at)}
                  </p>
                </div>
                <button className="adm-icon-btn" aria-label="Đóng" onClick={() => setSelected(null)}>
                  <Icon name="x" />
                </button>
              </div>

              <div className="adm-drawer-actions">
                {selected.phone && (
                  <a className="adm-btn adm-btn-primary" href={`tel:${selected.phone}`}>
                    <Icon name="phone" size={16} /> Gọi {selected.phone}
                  </a>
                )}
                {selected.email && (
                  <a className="adm-btn adm-btn-ghost" href={`mailto:${selected.email}`}>
                    <Icon name="mail" size={16} /> Gửi email
                  </a>
                )}
              </div>

              <dl className="adm-facts">
                <div>
                  <dt>Nhu cầu</dt>
                  <dd>{selected.service || 'Tư vấn chung'}</dd>
                </div>
                <div>
                  <dt>Mô hình</dt>
                  <dd>{selected.business_type || '—'}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selected.email || 'Chưa cung cấp'}</dd>
                </div>
                <div>
                  <dt>Trang gửi</dt>
                  <dd>{selected.source ? selected.source.replace(/^https?:\/\/[^/]+/, '') || '/' : '—'}</dd>
                </div>
              </dl>

              <div className="adm-message">
                <p className="adm-mini-title">Lời nhắn của khách</p>
                <blockquote>{selected.message || 'Khách không để lại lời nhắn.'}</blockquote>
              </div>

              <form onSubmit={saveAssignment} className="adm-assign">
                <p className="adm-mini-title">Phân công & tiến độ</p>
                <label className="adm-field">
                  <span>Người phụ trách</span>
                  <select value={assignee} onChange={e => setAssignee(e.target.value)}>
                    <option value="">— Chưa phân công —</option>
                    {DANAVA_STAFF_MEMBERS.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="adm-field">
                  <span>Trạng thái</span>
                  <div className="adm-segment" role="radiogroup" aria-label="Trạng thái xử lý">
                    {Object.entries(leadStatus).map(([k, v]) => (
                      <button type="button" key={k} role="radio" aria-checked={status === k} className={`tone-${v.tone}`} onClick={() => setStatus(k)}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="adm-field">
                  <span>Ghi chú nội bộ</span>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ví dụ: Đã hẹn gọi tư vấn DANAVA Studio lúc 14h ngày mai…"
                  />
                </label>
                <div className="adm-assign-foot">
                  {saveMsg && <span className={saveMsg.ok ? 'adm-ok' : 'adm-inline-error'}>{saveMsg.text}</span>}
                  <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                    <Icon name="save" size={16} /> {saving ? 'Đang lưu…' : 'Lưu phân công'}
                  </button>
                </div>
              </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
