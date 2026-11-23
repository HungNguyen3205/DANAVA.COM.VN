'use client';
/** Hệ thống → Tài khoản & quyền; Nhật ký & sao lưu → Phiên bản, Nhật ký thao tác. */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ASSIGNABLE_ROLES, ROLES, can, type Role } from '@/lib/permissions';
import { diffContent, type Change } from '@/lib/content-diff';
import type { SiteData } from '@/lib/content';
import { csrfToken, timeAgo } from '../adminData';
import { useSite } from '../SiteStore';
import { Empty, ErrorBox, Loading, SearchBar, matches, useAdminUser, usePaged } from './ui';
import { ask } from './kit';

const fmt = (ms: number) => new Date(ms).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });

async function call<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (init.method && init.method !== 'GET') { headers['x-csrf-token'] = await csrfToken(); if (init.body) headers['Content-Type'] = 'application/json'; }
  const r = await fetch(url, { cache: 'no-store', ...init, headers });
  const v = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(v.error || (r.status === 403 ? 'Bạn không có quyền thực hiện thao tác này.' : r.status === 401 ? 'Phiên đăng nhập đã hết hạn.' : 'Không kết nối được máy chủ.'));
  return v as T;
}

/* ================================================================ Tài khoản & quyền */
type User = { id: string; username: string; name: string; role: Role; active: boolean; createdAt: number; lastLogin: number | null };

export function UsersScreen() {
  const me = useAdminUser();
  const [list, setList] = useState<User[] | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    setError('');
    call<{ users: User[] }>('/api/admin/users/').then(v => setList(v.users)).catch(e => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true); setMsg('');
    try {
      await call('/api/admin/users/', { method: 'POST', body: JSON.stringify({ username: String(f.get('username') || '').trim().toLowerCase(), name: f.get('name'), role: f.get('role'), password: f.get('password') }) });
      form.reset();
      setMsg('Đã tạo tài khoản. Gửi tên đăng nhập và mật khẩu cho người dùng qua kênh riêng.');
      load();
    } catch (err) { setMsg((err as Error).message); }
    setBusy(false);
  }
  async function patch(u: User, change: Partial<User> & { password?: string }, done: string) {
    setBusy(true); setMsg('');
    try { await call('/api/admin/users/', { method: 'PATCH', body: JSON.stringify({ id: u.id, ...change }) }); setMsg(done); load(); }
    catch (err) { setMsg((err as Error).message); }
    setBusy(false);
  }
  async function remove(u: User) {
    if (!(await ask(`Xóa tài khoản ${u.username}?`, { body: 'Người này sẽ bị đăng xuất ngay.', confirmLabel: 'Xóa tài khoản' }))) return;
    setBusy(true); setMsg('');
    try { await call(`/api/admin/users/?id=${encodeURIComponent(u.id)}`, { method: 'DELETE' }); setMsg('Đã xóa tài khoản.'); load(); }
    catch (err) { setMsg((err as Error).message); }
    setBusy(false);
  }

  return (
    <div className="blk-stack">
      <section className="admin-panel">
        <h2>Tài khoản đăng nhập admin</h2>
        <p className="field-note">
          Tài khoản admin tách biệt với hồ sơ nhân sự hiển thị trên website. Chủ website luôn đăng nhập được bằng mật khẩu đặt trên máy chủ.
          Đổi vai trò, khóa tài khoản hay đặt lại mật khẩu có hiệu lực ngay (người đó bị đăng xuất khi bị khóa hoặc đổi mật khẩu).
        </p>
        {msg && <p className="adm-inline-msg" role="status">{msg}</p>}
        {error ? <ErrorBox retry={load}>{error}</ErrorBox> : !list ? <Loading /> : !list.length ? <Empty>Chưa có tài khoản nào ngoài chủ website. Tạo tài khoản cho từng người bên dưới.</Empty> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Người dùng</th><th>Vai trò</th><th>Trạng thái</th><th>Đăng nhập gần nhất</th><th>Thao tác</th></tr></thead>
              <tbody>
                {list.map(u => (
                  <tr key={u.id}>
                    <td><b>{u.name}</b><small>{u.username}{u.id === me.id ? ' · bạn' : ''}</small></td>
                    <td>
                      <select aria-label={`Vai trò của ${u.name}`} value={u.role} disabled={busy || u.id === me.id} onChange={e => patch(u, { role: e.target.value as Role }, `Đã đổi vai trò của ${u.name}.`)}>
                        {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}
                      </select>
                    </td>
                    <td><span className={`badge ${u.active ? 'green' : ''}`}>{u.active ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                    <td>{u.lastLogin ? timeAgo(u.lastLogin) : 'Chưa đăng nhập'}</td>
                    <td>
                      <span className="adm-btn-row">
                        {u.id !== me.id && <button type="button" className="admin-secondary" disabled={busy} onClick={() => patch(u, { active: !u.active }, u.active ? `Đã khóa ${u.name}.` : `Đã mở khóa ${u.name}.`)}>{u.active ? 'Khóa' : 'Mở khóa'}</button>}
                        <button type="button" className="admin-secondary" disabled={busy} onClick={() => {
                          const password = prompt(`Mật khẩu mới cho ${u.name} (tối thiểu 10 ký tự):`);
                          if (password) patch(u, { password }, `Đã đặt lại mật khẩu cho ${u.name}.`);
                        }}>Đặt lại mật khẩu</button>
                        {u.id !== me.id && <button type="button" className="danger" disabled={busy} onClick={() => remove(u)}>Xóa</button>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-two">
        <section className="admin-panel">
          <h2>Tạo tài khoản</h2>
          <form className="adm-form" onSubmit={create}>
            <label>Họ tên<input name="name" required maxLength={150} autoComplete="off" /></label>
            <label>Tên đăng nhập<input name="username" required minLength={3} maxLength={32} pattern="[a-z0-9._\-]{3,32}" autoComplete="off" placeholder="vd. trang.cskh" />
              <small className="field-note">Chữ thường không dấu, số, dấu chấm, gạch ngang.</small></label>
            <label>Vai trò
              <select name="role" defaultValue="editor">{ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}</select>
            </label>
            <label>Mật khẩu ban đầu<input name="password" type="password" required minLength={10} maxLength={256} autoComplete="new-password" /></label>
            <button className="admin-primary" disabled={busy}>Tạo tài khoản</button>
          </form>
        </section>
        <section className="admin-panel">
          <h2>Vai trò và quyền</h2>
          <ul className="adm-roles">
            {(['owner', ...ASSIGNABLE_ROLES] as Role[]).map(r => (
              <li key={r}><b>{ROLES[r].label}</b><span>{ROLES[r].desc}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ================================================================ Phiên bản */
type Revision = { id: string; revision: number; kind: string; createdAt: number; authorName: string; note: string; size: number };
type Migrations = { latest: number; applied: { version: number; name: string; appliedAt: number }[] };
const KIND: Record<string, string> = { publish: 'Xuất bản', restore: 'Khôi phục', baseline: 'Bản gốc khi nâng cấp', import: 'Nhập dữ liệu' };
const CHANGE: Record<Change['kind'], string> = { them: 'Thêm', xoa: 'Xóa', sua: 'Sửa' };

export function RevisionsScreen({ onRestored }: { onRestored: (message: string) => void }) {
  const me = useAdminUser();
  const { data, revision, refresh } = useSite();
  const [list, setList] = useState<Revision[] | null>(null);
  const [migrations, setMigrations] = useState<Migrations | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<{ id: string; changes: Change[] } | null>(null);
  const [busy, setBusy] = useState('');
  const load = useCallback(() => {
    setError('');
    call<{ revisions: Revision[]; migrations: Migrations }>('/api/admin/revisions/').then(v => { setList(v.revisions); setMigrations(v.migrations); }).catch(e => setError(e.message));
  }, []);
  useEffect(load, [load]);
  const { slice, pager } = usePaged(list || [], 15);

  async function compare(r: Revision) {
    if (open?.id === r.id) return setOpen(null);
    setBusy(r.id);
    try {
      const v = await call<{ data: SiteData }>(`/api/admin/revisions/?id=${encodeURIComponent(r.id)}`);
      // Khôi phục bản này thì bản đang soạn sẽ đổi như sau
      setOpen({ id: r.id, changes: diffContent(data, v.data) });
    } catch (e) { setError((e as Error).message); }
    setBusy('');
  }
  async function restore(r: Revision, publish: boolean) {
    const when = fmt(r.createdAt);
    if (!(await ask(publish ? `Khôi phục phiên bản ${when} và xuất bản ngay?` : `Đưa phiên bản ${when} vào bản nháp?`, { body: publish ? 'Website sẽ hiển thị nội dung của phiên bản này ngay lập tức.' : 'Website chưa thay đổi cho tới khi bạn bấm Xuất bản.', confirmLabel: publish ? 'Khôi phục & xuất bản' : 'Khôi phục vào nháp', tone: publish ? 'danger' : 'primary' }))) return;
    setBusy(r.id);
    try {
      await call('/api/admin/revisions/', { method: 'POST', body: JSON.stringify({ id: r.id, revision, publish }) });
      await refresh();
      load();
      setOpen(null);
      onRestored(publish ? `Đã khôi phục và xuất bản phiên bản ${when}.` : `Đã đưa phiên bản ${when} vào bản nháp. Kiểm tra rồi bấm Xuất bản.`);
    } catch (e) { setError((e as Error).message); }
    setBusy('');
  }

  if (error) return <ErrorBox retry={load}>{error}</ErrorBox>;
  if (!list) return <Loading label="Đang tải lịch sử phiên bản…" />;
  const canRestore = can(me.role, 'content.publish');
  return (
    <div className="blk-stack">
      <section className="admin-panel">
        <h2>Lịch sử xuất bản</h2>
        <p className="field-note">Mỗi lần xuất bản lưu lại một phiên bản đầy đủ (giữ 40 lần gần nhất và bản gốc khi nâng cấp). “Xem thay đổi” cho biết bản đang soạn sẽ đổi gì nếu khôi phục phiên bản đó.</p>
        {!list.length ? <Empty>Chưa có lần xuất bản nào được ghi lại.</Empty> : (
          <ol className="adm-timeline">
            {slice.map((r, i) => (
              <li key={r.id} className={open?.id === r.id ? 'is-open' : ''}>
                <div className="adm-timeline__row">
                  <span className={`badge ${r.kind === 'publish' ? 'green' : ''}`}>{KIND[r.kind] || r.kind}</span>
                  <span className="adm-timeline__main"><b>{fmt(r.createdAt)}</b><small>{r.authorName || 'Không rõ'}{r.note ? ` · ${r.note}` : ''}{i === 0 && list[0].id === r.id ? ' · đang công khai' : ''}</small></span>
                  <span className="adm-btn-row">
                    <button type="button" className="admin-secondary" disabled={!!busy} onClick={() => compare(r)}>{open?.id === r.id ? 'Ẩn thay đổi' : 'Xem thay đổi'}</button>
                    {canRestore && <button type="button" className="admin-secondary" disabled={!!busy} onClick={() => restore(r, false)}>Khôi phục vào nháp</button>}
                    {canRestore && <button type="button" className="admin-primary" disabled={!!busy} onClick={() => restore(r, true)}>Khôi phục & xuất bản</button>}
                  </span>
                </div>
                {open?.id === r.id && (
                  open.changes.length ? (
                    <ul className="adm-changes">
                      {open.changes.slice(0, 60).map((c, n) => <li key={n}><span className={`adm-change adm-change--${c.kind}`}>{CHANGE[c.kind]}</span> {c.area}: <b>{c.label}</b></li>)}
                      {open.changes.length > 60 && <li>… và {open.changes.length - 60} thay đổi khác</li>}
                    </ul>
                  ) : <p className="field-note">Phiên bản này giống hệt bản đang soạn.</p>
                )}
              </li>
            ))}
          </ol>
        )}
        {pager}
      </section>
      {migrations && (
        <section className="admin-panel">
          <h2>Cấu trúc dữ liệu</h2>
          <p className="field-note">Phiên bản cấu trúc database: {migrations.applied.at(-1)?.version ?? 0}/{migrations.latest}.</p>
          <ul className="adm-roles">{migrations.applied.map(m => <li key={m.version}><b>#{m.version} {m.name}</b><span>Áp dụng {fmt(m.appliedAt)}</span></li>)}</ul>
        </section>
      )}
    </div>
  );
}

/* ================================================================ Nhật ký thao tác */
type Entry = { id: string; at: number; actorName: string; action: string; target: string; detail: string };
const ACTION: Record<string, string> = {
  'dang-nhap': 'Đăng nhập', 'dang-xuat': 'Đăng xuất', 'luu-nhap': 'Lưu nháp', 'xuat-ban': 'Xuất bản', 'bo-nhap': 'Bỏ bản nháp',
  'khoi-phuc-vao-nhap': 'Khôi phục vào nháp', 'khoi-phuc-xuat-ban': 'Khôi phục & xuất bản', 'tai-anh': 'Tải ảnh',
  'tao-tai-khoan': 'Tạo tài khoản', 'sua-tai-khoan': 'Sửa tài khoản', 'xoa-tai-khoan': 'Xóa tài khoản', 'cap-nhat-khach-hang': 'Cập nhật khách hàng'
};

export function AuditScreen() {
  const [list, setList] = useState<Entry[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const load = useCallback(() => { setError(''); call<{ entries: Entry[] }>('/api/admin/audit/').then(v => setList(v.entries)).catch(e => setError(e.message)); }, []);
  useEffect(load, [load]);
  const shown = (list || []).filter(e => matches(q, e.actorName, ACTION[e.action] || e.action, e.target, e.detail));
  const { slice, pager } = usePaged(shown, 30);
  if (error) return <ErrorBox retry={load}>{error}</ErrorBox>;
  if (!list) return <Loading label="Đang tải nhật ký…" />;
  return (
    <section className="admin-panel">
      <SearchBar value={q} onChange={setQ} placeholder="Tìm theo người thực hiện, thao tác, đối tượng…" />
      {!shown.length ? <Empty>{list.length ? `Không có mục nào khớp “${q}”.` : 'Chưa có thao tác nào được ghi lại.'}</Empty> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Thao tác</th><th>Đối tượng</th></tr></thead>
            <tbody>
              {slice.map(e => (
                <tr key={e.id}>
                  <td>{fmt(e.at)}</td>
                  <td>{e.actorName}</td>
                  <td>{ACTION[e.action] || e.action}</td>
                  <td>{e.target}{e.detail && <small>{e.detail}</small>}</td>
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
