'use client';
/**
 * Hệ thống → SEO & chuyển hướng: chuyển hướng 301 (tự tạo khi đổi đường dẫn + thêm tay), kiểm tra đường dẫn và SEO.
 * Báo cáo → Hiệu quả nội dung: lượt xem, người xem, thời gian đọc của bài viết, sản phẩm, landing page.
 */
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Redirect, SiteData } from '@/lib/content';
import { contentProblem, recordUrls } from '@/lib/content-check';
import { can } from '@/lib/permissions';
import { useAdminLeads } from '../adminData';
import { PageSeoEditor } from './PageSeoEditor';
import { Empty, ErrorBox, Loading, SearchBar, matches, useAdminUser, usePaged, useTabs } from './ui';

const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const PATH = /^\/[a-z0-9\-/._]*\/$/i;

export function SeoScreen({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const { tab, bar } = useTabs([{ id: 'trang', label: 'SEO từng trang' }, { id: 'chuyen-huong', label: 'Chuyển hướng' }, { id: 'kiem-tra', label: 'Kiểm tra đường dẫn & SEO' }]);
  return <div className="blk-stack">{bar}{tab === 'kiem-tra' ? <SeoCheck draft={draft} /> : tab === 'chuyen-huong' ? <Redirects draft={draft} setDraft={setDraft} /> : <PageSeoEditor draft={draft} setDraft={setDraft} />}</div>;
}

function Redirects({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const user = useAdminUser();
  const editable = can(user.role, 'content.draft');
  const list = draft.redirects || [];
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const shown = list.filter(r => matches(q, r.from, r.to)).slice().reverse();
  const { slice, pager } = usePaged(shown, 25);
  const live = useMemo(() => new Set(recordUrls(draft).map(r => r.url)), [draft]);

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    let from = String(f.get('from') || '').trim(), to = String(f.get('to') || '').trim();
    try { if (from.startsWith('http')) from = new URL(from).pathname; } catch {}
    if (!from.endsWith('/')) from += '/';
    if (to.startsWith('/') && !to.endsWith('/') && !to.includes('#') && !to.includes('?')) to += '/';
    if (!PATH.test(from) || from.startsWith('/admin') || from.startsWith('/api')) return setError('Đường dẫn cũ phải là đường dẫn trong website, dạng /duong-dan-cu/ (chữ thường không dấu, số, gạch ngang).');
    if (!PATH.test(to) && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i.test(to)) return setError('Đích chuyển hướng phải là /duong-dan-moi/ hoặc https://…');
    if (from === to) return setError('Đường dẫn cũ và đích trùng nhau.');
    if (list.some(r => r.from === from)) return setError(`Đã có chuyển hướng từ ${from}.`);
    if (live.has(from)) return setError(`${from} đang là trang của một bản ghi đang dùng. Đổi đường dẫn bản ghi đó trước, hệ thống sẽ tự tạo chuyển hướng.`);
    setError('');
    const r: Redirect = { id: 'r' + globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 10), from, to, created: today() };
    setDraft({ ...draft, redirects: [...list, r] });
    e.currentTarget.reset();
  }

  return (
    <section className="admin-panel">
      <h2>Chuyển hướng 301</h2>
      <p className="field-note">Khi đổi đường dẫn của bài viết, sản phẩm, dự án hoặc landing page đang công khai, hệ thống tự thêm chuyển hướng từ đường dẫn cũ khi Xuất bản. Có thể thêm tay cho đường dẫn cũ khác. Chuyển hướng có hiệu lực sau khi Xuất bản.</p>
      {editable && (
        <form className="adm-create-row adm-create-row--3" onSubmit={add}>
          <label>Đường dẫn cũ<input name="from" required maxLength={250} placeholder="/duong-dan-cu/" /></label>
          <label>Chuyển tới<input name="to" required maxLength={300} placeholder="/duong-dan-moi/ hoặc https://…" /></label>
          <button className="admin-secondary"><Plus size={15} /> Thêm</button>
          {error && <p className="field-note is-error" role="alert">{error}</p>}
        </form>
      )}
      <SearchBar value={q} onChange={setQ} placeholder="Tìm đường dẫn…" />
      {!list.length ? <Empty>Chưa có chuyển hướng nào.</Empty> : !shown.length ? <Empty>Không có chuyển hướng nào khớp “{q}”.</Empty> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Đường dẫn cũ</th><th>Chuyển tới</th><th>Nguồn</th><th /></tr></thead>
            <tbody>
              {slice.map(r => (
                <tr key={r.id}>
                  <td><code>{r.from}</code></td>
                  <td><a className="text-link" href={r.to} target="_blank" rel="noopener">{r.to}</a></td>
                  <td><small>{r.auto ? 'Tự tạo khi đổi đường dẫn' : 'Thêm tay'} · {r.created}</small></td>
                  <td>{editable && <button type="button" className="adm-icon-btn" aria-label={`Xóa chuyển hướng ${r.from}`} onClick={() => setDraft({ ...draft, redirects: list.filter(x => x.id !== r.id) })}><Trash2 size={15} /></button>}</td>
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

function SeoCheck({ draft }: { draft: SiteData }) {
  const problem = contentProblem(draft);
  const urls = recordUrls(draft);
  const counts = new Map<string, number>();
  for (const u of urls) counts.set(u.url, (counts.get(u.url) || 0) + 1);
  const dup = urls.filter(u => (counts.get(u.url) || 0) > 1);
  const missing = [
    ...draft.posts.filter(p => p.published && !p.archived && !p.seoDescription && !p.excerpt).map(p => ({ label: `Bài “${p.title}”`, href: `/admin/bai-viet/?id=${p.id}&tab=seo` })),
    ...draft.services.filter(s => s.published !== false && !s.seoDescription).map(s => ({ label: `Sản phẩm “${s.title}”`, href: `/admin/san-pham/?id=${s.id}&tab=seo` })),
    ...(draft.landings || []).filter(l => l.kind === 'internal' && l.status === 'published' && !l.seoDescription && !l.purpose).map(l => ({ label: `Landing “${l.title}”`, href: `/admin/chinh-sua/?panel=landings&id=${l.id}&tab=seo` }))
  ];
  const noindex = [...draft.posts.filter(p => p.noindex && p.published).map(p => `/blogs/${p.slug}/`), ...(draft.landings || []).filter(l => l.noindex).map(l => `/lp/${l.slug}/`)];
  return (
    <div className="blk-stack">
      <section className="admin-panel">
        <h2>Đường dẫn</h2>
        {problem ? <p className="adm-inline-msg" role="alert">{problem}</p> : <p className="adm-ok">Không có lỗi đường dẫn trong bản đang soạn ({urls.length} đường dẫn của bản ghi).</p>}
        {dup.length > 0 && <ul>{dup.map((d, i) => <li key={i}><code>{d.url}</code> — {d.label}</li>)}</ul>}
      </section>
      <section className="admin-panel">
        <h2>Thiếu mô tả SEO ({missing.length})</h2>
        <p className="field-note">Trang công khai chưa có mô tả SEO riêng (Google sẽ tự lấy đoạn chữ trên trang).</p>
        {!missing.length ? <Empty>Mọi trang công khai đều có mô tả.</Empty> : <ul className="adm-roles">{missing.slice(0, 50).map(m => <li key={m.href}><Link className="text-link" href={m.href}>{m.label}</Link></li>)}</ul>}
      </section>
      <section className="admin-panel">
        <h2>Không lập chỉ mục (noindex)</h2>
        {!noindex.length ? <Empty>Không có trang nào đang chặn lập chỉ mục.</Empty> : <ul>{noindex.map(u => <li key={u}><code>{u}</code></li>)}</ul>}
      </section>
    </div>
  );
}

/* ================================================================ Hiệu quả nội dung */
type PageRow = { path: string; pageviews: number; visitors: number; seconds: number };
const PERIODS = [7, 30, 90];

export function ContentPerformance({ draft }: { draft: SiteData }) {
  const user = useAdminUser();
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<PageRow[] | null>(null);
  const [error, setError] = useState('');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const { leads } = useAdminLeads(1000, can(user.role, 'leads.read'));
  useEffect(() => {
    let alive = true;
    setRows(null); setError('');
    fetch(`/api/admin/analytics/?days=${days}&pages=all`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(Error('Không tải được số liệu truy cập.'))))
      .then(v => alive && setRows(v.pages.map((p: PageRow) => ({ ...p, pageviews: Number(p.pageviews), visitors: Number(p.visitors || 0), seconds: Number(p.seconds || 0) }))))
      .catch(e => alive && setError(e.message));
    return () => { alive = false; };
  }, [days]);

  const label = useMemo(() => {
    const m = new Map<string, { type: string; title: string; href?: string }>();
    for (const p of draft.posts) m.set(`/blogs/${p.slug}/`, { type: 'Bài viết', title: p.title, href: `/admin/bai-viet/?id=${p.id}` });
    for (const s of draft.services) m.set(`/giai-phap/${s.slug}/`, { type: 'Sản phẩm', title: s.title, href: `/admin/san-pham/?id=${s.id}` });
    for (const l of draft.landings || []) if (l.kind === 'internal') m.set(`/lp/${l.slug}/`, { type: 'Landing page', title: l.title, href: `/admin/chinh-sua/?panel=landings&id=${l.id}` });
    return m;
  }, [draft]);
  const since = Date.now() - days * 86400_000;
  const leadsFor = (path: string) => leads.filter(l => l.created_at >= since && ((l.source || '').includes(path) || (path.startsWith('/lp/') && l.source === `lp:${path.slice(4, -1)}`))).length;

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!rows) return <Loading label="Đang tải số liệu…" />;
  const list = rows.filter(r => label.has(r.path)).map(r => ({ ...r, ...label.get(r.path)! }))
    .filter(r => (!kind || r.type === kind) && matches(q, r.title, r.path));
  const total = list.reduce((n, r) => n + r.pageviews, 0);
  return (
    <section className="admin-panel">
      <div className="adm-listbar">
        <div className="adm-tabs" role="tablist" aria-label="Khoảng thời gian">
          {PERIODS.map(d => <button key={d} type="button" role="tab" aria-selected={days === d} className={days === d ? 'is-on' : ''} onClick={() => setDays(d)}>{d} ngày</button>)}
        </div>
      </div>
      <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tên, đường dẫn…">
        <select aria-label="Loại nội dung" value={kind} onChange={e => setKind(e.target.value)}><option value="">Mọi loại</option><option>Bài viết</option><option>Sản phẩm</option><option>Landing page</option></select>
      </SearchBar>
      <p className="field-note">Chỉ tính lượt xem từ trình duyệt đồng ý đo lường. {can(user.role, 'leads.read') ? 'Cột Yêu cầu: số yêu cầu tư vấn gửi từ trang đó trong cùng khoảng thời gian.' : ''}</p>
      {!list.length ? <Empty>Chưa có lượt xem nào cho bài viết, sản phẩm hoặc landing page trong khoảng thời gian này.</Empty> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nội dung</th><th>Loại</th><th>Lượt xem</th><th>Người xem</th><th>Đọc trung bình</th>{can(user.role, 'leads.read') && <th>Yêu cầu</th>}</tr></thead>
            <tbody>
              {list.map(r => (
                <tr key={r.path}>
                  <td>{r.href && can(user.role, 'content.read') ? <Link className="text-link" href={r.href}><b>{r.title}</b></Link> : <b>{r.title}</b>}<small>{r.path}</small></td>
                  <td>{r.type}</td>
                  <td>{r.pageviews}<small>{total ? Math.round((r.pageviews / total) * 100) : 0}%</small></td>
                  <td>{r.visitors}</td>
                  <td>{r.seconds ? `${Math.floor(r.seconds / 60)}:${String(r.seconds % 60).padStart(2, '0')}` : '—'}</td>
                  {can(user.role, 'leads.read') && <td>{leadsFor(r.path) || '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
