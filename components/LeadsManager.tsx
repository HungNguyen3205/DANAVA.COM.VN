'use client';

import { useState, useEffect, type FormEvent } from 'react';

export interface AdminLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_type?: string;
  service?: string;
  source?: string;
  message: string;
  created_at: number;
  status: string;
  assigned_to?: string;
  assigned_note?: string;
}

const DANAVA_STAFF_MEMBERS = [
  'Phạm Trang — Trưởng phòng CSKH',
  'Lê Tấn Thành — Founder & CEO',
  'Trần Văn Nam — Marketing Director',
  'Avinash Saini — Creative Director',
  'Đặng Ngọc Thông — Manager'
];

export default function LeadsManager() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);

  // State phân công chuyên viên
  const [assignee, setAssignee] = useState('');
  const [leadStatus, setLeadStatus] = useState('new');
  const [note, setNote] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  async function fetchLeads() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/leads/?limit=100');
      if (!res.ok) {
        throw new Error('Không thể tải danh sách khách hàng liên hệ.');
      }
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  // Đồng bộ form phân công khi chọn lead
  useEffect(() => {
    if (selectedLead) {
      setAssignee(selectedLead.assigned_to || '');
      setLeadStatus(selectedLead.status || 'new');
      setNote(selectedLead.assigned_note || '');
      setSaveMsg('');
    }
  }, [selectedLead]);

  async function handleSaveAssignment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedLead) return;
    setSavingAssignment(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/admin/leads/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          assigned_to: assignee,
          status: leadStatus,
          assigned_note: note
        })
      });
      if (!res.ok) throw new Error('Không thể cập nhật phân công.');
      setSaveMsg('✓ Phân công chuyên viên tiếp nhận thành công!');
      // Cập nhật state nội bộ
      const updatedLead = {
        ...selectedLead,
        assigned_to: assignee,
        status: leadStatus,
        assigned_note: note
      };
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
      setSelectedLead(updatedLead);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Lỗi cập nhật.');
    } finally {
      setSavingAssignment(false);
    }
  }

  const filtered = leads.filter(l => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.service && l.service.toLowerCase().includes(q)) ||
      (l.business_type && l.business_type.toLowerCase().includes(q)) ||
      (l.assigned_to && l.assigned_to.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-leads-container">
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Khách hàng tiềm năng &amp; Phân công phụ trách</h2>
            <p className="field-note">
              Danh sách tiếp nhận trực tiếp từ form Liên hệ trên website DANAVA Solutions. Hỗ trợ phân công nhân sự và theo dõi tiến độ tư vấn.
            </p>
          </div>
          <button
            type="button"
            className="admin-secondary"
            onClick={fetchLeads}
            disabled={loading}
          >
            {loading ? 'Đang tải…' : 'Làm mới danh sách ⟳'}
          </button>
        </div>

        {error && (
          <div role="status" className="notice error">
            {error}
          </div>
        )}

        <div className="admin-kpis" style={{ marginBottom: 20 }}>
          <article>
            <span>Tổng yêu cầu</span>
            <strong>{leads.length}</strong>
            <small>Đã ghi nhận trong cơ sở dữ liệu</small>
          </article>
          <article>
            <span>Đã phân công</span>
            <strong style={{ color: 'var(--blue)' }}>
              {leads.filter(l => Boolean(l.assigned_to)).length}
            </strong>
            <small>Có nhân sự phụ trách tiếp nhận</small>
          </article>
          <article>
            <span>Dịch vụ Studio &amp; Gym</span>
            <strong>
              {leads.filter(l => (l.service || '').toLowerCase().includes('studio') || (l.service || '').toLowerCase().includes('gym')).length}
            </strong>
            <small>Nhu cầu phần mềm phòng tập</small>
          </article>
          <article>
            <span>Website &amp; Marketing</span>
            <strong>
              {leads.filter(l => (l.service || '').toLowerCase().includes('web') || (l.service || '').toLowerCase().includes('marketing')).length}
            </strong>
            <small>Hiện diện số &amp; truyền thông</small>
          </article>
        </div>

        <input
          className="search-input"
          placeholder="Tìm theo tên, số điện thoại, email, dịch vụ, nhân sự phân công…"
          aria-label="Tìm kiếm khách hàng liên hệ"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Dịch vụ &amp; Mô hình</th>
                <th>Trạng thái</th>
                <th>Phân công phụ trách</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const dateStr = new Date(item.created_at).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={item.id}>
                    <td>
                      <small style={{ whiteSpace: 'nowrap' }}>{dateStr}</small>
                    </td>
                    <td>
                      <b>{item.name}</b>
                      {item.source && (
                        <small title={item.source} style={{ color: '#7a8ca8' }}>
                          Nguồn: {item.source.replace(/^https?:\/\/[^/]+/, '') || '/'}
                        </small>
                      )}
                    </td>
                    <td>
                      {item.phone && (
                        <a href={`tel:${item.phone}`} style={{ color: 'var(--blue)', fontWeight: 600, display: 'block' }}>
                          📞 {item.phone}
                        </a>
                      )}
                      {item.email && (
                        <a href={`mailto:${item.email}`} style={{ color: '#687898', fontSize: 11, display: 'block' }}>
                          ✉️ {item.email}
                        </a>
                      )}
                    </td>
                    <td>
                      <span className="badge green" style={{ whiteSpace: 'normal', maxWidth: 220, display: 'inline-block' }}>
                        {item.service || 'Tư vấn chung'}
                      </span>
                      {item.business_type && (
                        <small style={{ display: 'block', color: '#64748b', marginTop: 4 }}>
                          {item.business_type}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'completed' ? 'green' : item.status === 'contacted' ? 'amber' : item.status === 'assigned' ? 'blue' : ''}`}>
                        {item.status === 'completed' ? '✓ Đã xong' : item.status === 'contacted' ? 'Đang trao đổi' : item.status === 'assigned' ? 'Đã phân công' : 'Mới'}
                      </span>
                    </td>
                    <td>
                      {item.assigned_to ? (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a8a' }}>
                          👤 {item.assigned_to.split('—')[0].trim()}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                          Chưa phân công
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => setSelectedLead(item)}
                      >
                        {item.assigned_to ? 'Xem & Sửa ↗' : 'Phân công ↗'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#8898b0' }}>
                    Chưa có yêu cầu liên hệ nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL / CHI TIẾT & PHÂN CÔNG LEAD */}
      {selectedLead && (
        <section className="admin-panel" style={{ marginTop: 24, borderLeft: '4px solid var(--amber)' }}>
          <div className="panel-heading">
            <h2>Chi tiết &amp; Phân công khách hàng: {selectedLead.name}</h2>
            <button type="button" onClick={() => setSelectedLead(null)} aria-label="Đóng chi tiết">
              ✕ Đóng
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <span className="cell-label" style={{ fontSize: 10, color: '#8898b0' }}>HỌ VÀ TÊN</span>
              <p style={{ fontSize: 15, fontWeight: 700, margin: '4px 0 0' }}>{selectedLead.name}</p>
            </div>
            <div>
              <span className="cell-label" style={{ fontSize: 10, color: '#8898b0' }}>SỐ ĐIỆN THOẠI</span>
              <p style={{ fontSize: 15, fontWeight: 700, margin: '4px 0 0' }}>
                <a href={`tel:${selectedLead.phone}`} style={{ color: 'var(--blue)' }}>{selectedLead.phone}</a>
              </p>
            </div>
            <div>
              <span className="cell-label" style={{ fontSize: 10, color: '#8898b0' }}>EMAIL</span>
              <p style={{ fontSize: 14, margin: '4px 0 0' }}>{selectedLead.email || 'Chưa cung cấp'}</p>
            </div>
            <div>
              <span className="cell-label" style={{ fontSize: 10, color: '#8898b0' }}>DỊCH VỤ QUAN TÂM</span>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#2b509e', margin: '4px 0 0' }}>{selectedLead.service || 'Chung'}</p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <span className="cell-label" style={{ fontSize: 10, color: '#8898b0' }}>NỘI DUNG TRAO ĐỔI CỦA KHÁCH HÀNG</span>
            <div style={{ background: '#f5f8fc', padding: 16, borderRadius: 8, marginTop: 6, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#1a2b48' }}>
              {selectedLead.message}
            </div>
          </div>

          {/* FORM PHÂN CÔNG CHUYÊN VIÊN TIẾP NHẬN */}
          <form onSubmit={handleSaveAssignment} style={{ background: '#eef3fa', padding: 20, borderRadius: 10, border: '1px solid #d0ddec' }}>
            <h3 style={{ fontSize: 14, margin: '0 0 14px', color: '#1e3a8a', fontWeight: 700 }}>
              Phân công nhân sự phụ trách &amp; Cập nhật trạng thái
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Chuyên viên phụ trách:
                </label>
                <select
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #c2d2e9', background: '#ffffff', fontSize: 13 }}
                >
                  <option value="">-- Chưa phân công --</option>
                  {DANAVA_STAFF_MEMBERS.map(member => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Trạng thái xử lý:
                </label>
                <select
                  value={leadStatus}
                  onChange={e => setLeadStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #c2d2e9', background: '#ffffff', fontSize: 13 }}
                >
                  <option value="new">Mới tiếp nhận</option>
                  <option value="assigned">Đã phân công</option>
                  <option value="contacted">Đang trao đổi tư vấn</option>
                  <option value="completed">Đã chốt hợp đồng / Hoàn tất</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Ghi chú nội bộ cho chuyên viên:
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="VD: Đã hẹn gọi điện tư vấn giải pháp Studio lúc 14h chiều mai..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #c2d2e9', background: '#ffffff', fontSize: 13, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="submit"
                className="admin-primary"
                disabled={savingAssignment}
                style={{ padding: '8px 20px', minHeight: 38 }}
              >
                {savingAssignment ? 'Đang lưu…' : 'Lưu phân công 💾'}
              </button>
              {saveMsg && (
                <span style={{ fontSize: 13, color: saveMsg.startsWith('✓') ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                  {saveMsg}
                </span>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
