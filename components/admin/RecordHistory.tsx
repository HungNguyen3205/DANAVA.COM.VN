'use client';
/** Tab "Lịch sử" của một hồ sơ: những lần xuất bản đã thay đổi bản ghi này, ai và khi nào. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Empty, ErrorBox, Loading } from './ui';

type Change = { revisionId: string; createdAt: number; authorName: string; kind: string; note: string; change: 'them' | 'sua' | 'xoa' };
const LABEL = { them: 'Tạo / xuất hiện', sua: 'Cập nhật', xoa: 'Xóa' };
const fmt = (ms: number) => new Date(ms).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });

export function RecordHistory({ record, id, label }: { record: 'services' | 'posts' | 'projects' | 'showcase' | 'landings'; id: string; label: string }) {
  const [list, setList] = useState<Change[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setError(''); setList(null);
    fetch(`/api/admin/revisions/?record=${record}&rid=${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async r => { if (!r.ok) throw Error(r.status === 403 ? 'Bạn không có quyền xem lịch sử.' : 'Không tải được lịch sử.'); return r.json(); })
      .then(v => alive && setList(v.changes))
      .catch(e => alive && setError(e.message));
    return () => { alive = false; };
  }, [record, id, attempt]);

  if (error) return <ErrorBox retry={() => setAttempt(n => n + 1)}>{error}</ErrorBox>;
  if (!list) return <Loading label="Đang tải lịch sử…" />;
  return (
    <section className="admin-panel">
      <h2>Lịch sử của {label}</h2>
      <p className="field-note">Những lần xuất bản đã thay đổi hồ sơ này (trong 20 lần xuất bản gần nhất). Bản nháp chưa xuất bản không có trong danh sách. Muốn quay lại bản cũ, dùng <Link className="text-link" href="/admin/nhat-ky/">Nhật ký & sao lưu → Phiên bản</Link>.</p>
      {!list.length ? <Empty>Chưa có lần xuất bản nào thay đổi hồ sơ này.</Empty> : (
        <ol className="adm-timeline">
          {list.map(c => (
            <li key={c.revisionId}>
              <div className="adm-timeline__row">
                <span className={`adm-change adm-change--${c.change}`}>{LABEL[c.change]}</span>
                <span className="adm-timeline__main"><b>{fmt(c.createdAt)}</b><small>{c.authorName || 'Không rõ'}{c.note ? ` · ${c.note}` : ''}</small></span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
