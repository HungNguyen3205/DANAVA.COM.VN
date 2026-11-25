'use client';
/**
 * Nội dung → Bài viết: danh sách kiểu WP admin + cột SEO kiểu Rank Math.
 * - Hàng trạng thái (Tất cả / Công khai / Nháp / Lưu trữ / Thiếu SEO), hành động hàng loạt, lọc tháng / chuyên mục / điểm SEO, tìm kiếm, phân trang.
 * - Cột SEO Details (điểm, schema, liên kết), SEO Title, SEO Desc: bấm bút ở đầu cột để sửa hàng loạt ngay trong bảng.
 * Điểm SEO là gợi ý nội bộ (lib không gọi dịch vụ ngoài): độ dài tiêu đề/mô tả, ảnh bìa, độ dài bài, liên kết, đường dẫn.
 */
import { Archive, Copy, Eye, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Post, SiteData } from '@/lib/content';
import { Button, PageHeader, useConfirm } from './kit';
import { matches } from './ui';

type Status = 'nhap' | 'cong-khai' | 'luu-tru';
export const statusOf = (p: Post): Status => (p.archived ? 'luu-tru' : p.published ? 'cong-khai' : 'nhap');
const STATUS_LABEL: Record<Status, string> = { 'cong-khai': 'Đã xuất bản', nhap: 'Bản nháp', 'luu-tru': 'Lưu trữ' };
const PER_PAGE = 20;

/* ------------------------------------------------------------ Điểm SEO */
const plain = (s: string) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, ' ').replace(/[#*_>`]/g, ' ');
function linkCounts(body: string) {
  const urls = [...body.matchAll(/\]\(([^)\s]+)[^)]*\)|href=["']([^"']+)["']/g)].map(m => m[1] || m[2]).filter(u => !/\.(webp|png|jpe?g|gif|svg)$/i.test(u));
  const internal = urls.filter(u => u.startsWith('/') || /^https?:\/\/(www\.)?danava\.com\.vn/i.test(u)).length;
  return { internal, external: urls.length - internal };
}
export function seoInfo(p: Post) {
  const title = (p.seoTitle || '').trim() || p.title;
  const desc = (p.seoDescription || '').trim() || (p.excerpt || '').trim();
  const words = plain(p.body).split(/\s+/).filter(Boolean).length;
  const links = linkCounts(p.body);
  const checks: [boolean, number, string][] = [
    [title.length >= 30 && title.length <= 60, 20, `Tiêu đề SEO 30–60 ký tự (đang ${title.length})`],
    [desc.length >= 110 && desc.length <= 160, 20, desc ? `Mô tả 110–160 ký tự (đang ${desc.length})` : 'Chưa có mô tả SEO'],
    [!!p.image, 15, 'Có ảnh bìa (ảnh chia sẻ)'],
    [words >= 600, 20, `Bài ≥ 600 chữ (đang ${words})`],
    [links.internal > 0, 10, 'Có liên kết nội bộ'],
    [links.external > 0, 5, 'Có liên kết ra ngoài'],
    [p.slug.length <= 75 && !/^bai-viet-[0-9a-f]{8}$/.test(p.slug), 10, 'Đường dẫn ngắn, có nghĩa']
  ];
  // Điểm một phần cho tiêu đề/mô tả/độ dài gần đạt
  let score = 0;
  for (const [ok, w] of checks) if (ok) score += w;
  if (!checks[0][0] && title.length >= 15 && title.length <= 70) score += 10;
  if (!checks[1][0] && desc.length >= 50) score += 10;
  if (!checks[3][0] && words >= 300) score += 10;
  return { score, title, desc, words, links, missing: checks.filter(c => !c[0]).map(c => c[2]), titleDefault: !(p.seoTitle || '').trim(), descDefault: !(p.seoDescription || '').trim() };
}
const tone = (s: number) => (s >= 80 ? 'good' : s >= 50 ? 'ok' : 'bad');
const SEO_FILTER: Record<string, { label: string; test: (s: number) => boolean }> = {
  good: { label: 'Điểm tốt (≥ 80)', test: s => s >= 80 },
  ok: { label: 'Cần cải thiện (50–79)', test: s => s >= 50 && s < 80 },
  bad: { label: 'Kém (< 50)', test: s => s < 50 }
};

const fmtDate = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : d || '—');
const monthLabel = (m: string) => `Tháng ${Number(m.slice(5, 7))}/${m.slice(0, 4)}`;

type Bulk = '' | 'publish' | 'draft' | 'archive' | 'restore' | 'delete';

export function PostTable({ draft, setDraft, open, create, duplicate }: {
  draft: SiteData; setDraft: (d: SiteData) => void; open: (id: string) => void; create: () => void; duplicate: (p: Post) => void;
}) {
  const confirm = useConfirm();
  const [view, setView] = useState<'all' | Status | 'thieu-seo'>('all');
  const [q, setQ] = useState(''), [query, setQuery] = useState('');
  const [month, setMonth] = useState(''), [topic, setTopic] = useState(''), [seo, setSeo] = useState('');
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<Bulk>('');
  const [editCol, setEditCol] = useState<'' | 'title' | 'desc'>('');

  const posts = draft.posts;
  const info = useMemo(() => new Map(posts.map(p => [p.id, seoInfo(p)])), [posts]);
  const topicName = (tid?: string) => (draft.topics || []).find(t => t.id === tid)?.name || '';
  const author = (aid?: string) => draft.staff.find(s => s.id === aid)?.name || 'DANAVA Solutions';
  const months = useMemo(() => [...new Set(posts.map(p => (p.date || '').slice(0, 7)).filter(m => /^\d{4}-\d{2}$/.test(m)))].sort().reverse(), [posts]);

  const counts = { all: 0, 'cong-khai': 0, nhap: 0, 'luu-tru': 0, 'thieu-seo': 0 };
  for (const p of posts) {
    const s = statusOf(p);
    counts[s]++;
    if (s !== 'luu-tru') { counts.all++; if (!(p.seoDescription || p.excerpt || '').trim()) counts['thieu-seo']++; }
  }

  const shown = posts
    .filter(p => view === 'all' ? statusOf(p) !== 'luu-tru' : view === 'thieu-seo' ? statusOf(p) !== 'luu-tru' && !(p.seoDescription || p.excerpt || '').trim() : statusOf(p) === view)
    .filter(p => matches(query, p.title, p.slug, p.category, topicName(p.topicId), (p.tags || []).join(' ')))
    .filter(p => !month || (p.date || '').startsWith(month))
    .filter(p => !topic || (topic === '-' ? !p.topicId : p.topicId === topic))
    .filter(p => !seo || SEO_FILTER[seo].test(info.get(p.id)!.score))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const rows = shown.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const allPicked = rows.length > 0 && rows.every(p => picked.has(p.id));

  const patch = (id: string, change: Partial<Post>) => setDraft({ ...draft, posts: posts.map(p => (p.id === id ? { ...p, ...change } : p)) });
  const reset = () => { setPage(1); setPicked(new Set()); };
  const togglePick = (id: string) => setPicked(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  async function applyBulk() {
    if (!bulk || !picked.size) return;
    const ids = picked;
    if (bulk === 'delete') {
      if (!(await confirm({ title: `Xóa hẳn ${ids.size} bài viết?`, body: 'Nên dùng “Lưu trữ” nếu chỉ muốn ẩn khỏi website. Thay đổi áp dụng khi Lưu nháp hoặc Xuất bản.', confirmLabel: 'Xóa', tone: 'danger' }))) return;
      setDraft({ ...draft, posts: posts.filter(p => !ids.has(p.id)) });
    } else {
      const change: Record<Exclude<Bulk, '' | 'delete'>, Partial<Post>> = {
        publish: { published: true, archived: undefined }, draft: { published: false, archived: undefined },
        archive: { archived: true, published: false }, restore: { archived: undefined }
      };
      setDraft({ ...draft, posts: posts.map(p => (ids.has(p.id) ? { ...p, ...change[bulk] } : p)) });
    }
    setPicked(new Set()); setBulk('');
  }

  async function remove(p: Post) {
    if (await confirm({ title: `Xóa bài “${p.title}”?`, body: 'Nên dùng Lưu trữ nếu chỉ muốn ẩn khỏi website. Thay đổi áp dụng khi Lưu nháp hoặc Xuất bản.', confirmLabel: 'Xóa bài', tone: 'danger' }))
      setDraft({ ...draft, posts: posts.filter(x => x.id !== p.id) });
  }

  const pager = (
    <div className="wp-pager">
      <span>{shown.length} mục</span>
      <button type="button" disabled={cur <= 1} onClick={() => setPage(1)} aria-label="Trang đầu">«</button>
      <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="Trang trước">‹</button>
      <input type="number" min={1} max={pages} value={cur} aria-label="Trang hiện tại" onChange={e => setPage(Math.min(pages, Math.max(1, Number(e.target.value) || 1)))} />
      <span>trên {pages}</span>
      <button type="button" disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="Trang sau">›</button>
      <button type="button" disabled={cur >= pages} onClick={() => setPage(pages)} aria-label="Trang cuối">»</button>
    </div>
  );

  const VIEWS: [typeof view, string][] = [['all', 'Tất cả'], ['cong-khai', 'Đã xuất bản'], ['nhap', 'Bản nháp'], ['luu-tru', 'Lưu trữ'], ['thieu-seo', 'Thiếu mô tả SEO']];

  return (
    <>
      <PageHeader title="Bài viết" actions={<Button variant="primary" onClick={create}><Plus size={16} /> Viết bài mới</Button>} />

      <div className="wp-top">
        <ul className="wp-views">
          {VIEWS.filter(([k]) => k === 'all' || counts[k] > 0).map(([k, label]) => (
            <li key={k}><button type="button" className={view === k ? 'is-on' : ''} onClick={() => { setView(k); reset(); }}>{label} <span>({counts[k]})</span></button></li>
          ))}
        </ul>
        <form className="wp-search" role="search" onSubmit={e => { e.preventDefault(); setQuery(q); reset(); }}>
          <input type="search" value={q} onChange={e => { setQ(e.target.value); if (!e.target.value) { setQuery(''); reset(); } }} aria-label="Tìm bài viết" placeholder="Tiêu đề, đường dẫn, thẻ…" />
          <button type="submit">Tìm các bài viết</button>
        </form>
      </div>

      <div className="wp-bar">
        <div className="wp-bar__group">
          <select aria-label="Hành động hàng loạt" value={bulk} onChange={e => setBulk(e.target.value as Bulk)}>
            <option value="">Hành động hàng loạt</option>
            <option value="publish">Đăng (công khai)</option>
            <option value="draft">Chuyển về bản nháp</option>
            <option value="archive">Lưu trữ</option>
            <option value="restore">Khôi phục từ lưu trữ</option>
            <option value="delete">Xóa hẳn</option>
          </select>
          <button type="button" className="wp-btn" disabled={!bulk || !picked.size} onClick={() => void applyBulk()}>Áp dụng{picked.size ? ` (${picked.size})` : ''}</button>
        </div>
        <div className="wp-bar__group">
          <select aria-label="Lọc theo tháng" value={month} onChange={e => { setMonth(e.target.value); reset(); }}>
            <option value="">Tất cả các ngày</option>
            {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <select aria-label="Lọc theo chuyên mục" value={topic} onChange={e => { setTopic(e.target.value); reset(); }}>
            <option value="">Tất cả chuyên mục</option><option value="-">Chưa phân loại</option>
            {(draft.topics || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select aria-label="Lọc theo điểm SEO" value={seo} onChange={e => { setSeo(e.target.value); reset(); }}>
            <option value="">Mọi điểm SEO</option>
            {Object.entries(SEO_FILTER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {(month || topic || seo || query) && <button type="button" className="wp-btn wp-btn--link" onClick={() => { setMonth(''); setTopic(''); setSeo(''); setQ(''); setQuery(''); reset(); }}>Bỏ lọc</button>}
        </div>
        {pager}
      </div>

      <div className="wp-table-wrap">
        <table className="wp-table">
          <thead>
            <tr>
              <th className="wp-cb"><input type="checkbox" aria-label="Chọn tất cả trên trang" checked={allPicked} onChange={() => setPicked(s => { const n = new Set(s); rows.forEach(p => (allPicked ? n.delete(p.id) : n.add(p.id))); return n; })} /></th>
              <th className="wp-c-title">Tiêu đề</th>
              <th className="wp-c-author">Tác giả</th>
              <th className="wp-c-cat">Chuyên mục</th>
              <th className="wp-c-tags">Thẻ</th>
              <th className="wp-c-date">Thời gian</th>
              <th className="wp-c-seo">SEO Details</th>
              <th className="wp-c-st">SEO Title <button type="button" className={`wp-pen${editCol === 'title' ? ' is-on' : ''}`} onClick={() => setEditCol(editCol === 'title' ? '' : 'title')} aria-label="Sửa hàng loạt tiêu đề SEO" title="Sửa hàng loạt"><Pencil size={14} /></button></th>
              <th className="wp-c-sd">SEO Desc <button type="button" className={`wp-pen${editCol === 'desc' ? ' is-on' : ''}`} onClick={() => setEditCol(editCol === 'desc' ? '' : 'desc')} aria-label="Sửa hàng loạt mô tả SEO" title="Sửa hàng loạt"><Pencil size={14} /></button></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={9} className="wp-empty">{posts.length ? 'Không tìm thấy bài viết nào khớp bộ lọc.' : 'Chưa có bài viết.'}</td></tr>}
            {rows.map(p => {
              const s = statusOf(p), i = info.get(p.id)!;
              return (
                <tr key={p.id} className={picked.has(p.id) ? 'is-picked' : ''}>
                  <td className="wp-cb"><input type="checkbox" aria-label={`Chọn “${p.title}”`} checked={picked.has(p.id)} onChange={() => togglePick(p.id)} /></td>
                  <td className="wp-c-title">
                    <button type="button" className="wp-title" onClick={() => open(p.id)}>{p.title || '(chưa có tiêu đề)'}</button>
                    {s !== 'cong-khai' && <span className="wp-state"> — {STATUS_LABEL[s]}</span>}
                    {p.noindex && <span className="wp-state"> — noindex</span>}
                    <div className="wp-row-actions">
                      <button type="button" onClick={() => open(p.id)}>Chỉnh sửa</button>
                      {s === 'cong-khai' && <a href={`/blogs/${p.slug}/`} target="_blank" rel="noopener noreferrer"><Eye size={12} /> Xem</a>}
                      <button type="button" onClick={() => duplicate(p)}><Copy size={12} /> Nhân bản</button>
                      {s !== 'luu-tru'
                        ? <button type="button" onClick={() => patch(p.id, { archived: true, published: false })}><Archive size={12} /> Lưu trữ</button>
                        : <button type="button" onClick={() => patch(p.id, { archived: undefined })}><Undo2 size={12} /> Khôi phục</button>}
                      <button type="button" className="is-danger" onClick={() => void remove(p)}><Trash2 size={12} /> Xóa</button>
                    </div>
                  </td>
                  <td className="wp-c-author">{author(p.authorId)}</td>
                  <td className="wp-c-cat">{p.topicId ? <button type="button" className="wp-link" onClick={() => { setTopic(p.topicId!); reset(); }}>{topicName(p.topicId)}</button> : <span className="wp-muted">Chưa phân loại</span>}</td>
                  <td className="wp-c-tags">{p.tags?.length ? p.tags.map((t, k) => <span key={t}>{k ? ', ' : ''}<button type="button" className="wp-link" onClick={() => { setQ(t); setQuery(t); reset(); }}>{t}</button></span>) : <span className="wp-muted">—</span>}</td>
                  <td className="wp-c-date">{STATUS_LABEL[s]}<br /><span className="wp-muted">{fmtDate(p.date)}</span>{p.updated && <><br /><span className="wp-muted">Sửa {fmtDate(p.updated)}</span></>}</td>
                  <td className="wp-c-seo">
                    <span className={`wp-score is-${tone(i.score)}`} title={i.missing.length ? 'Cần cải thiện:\n• ' + i.missing.join('\n• ') : 'Đạt mọi tiêu chí'}>{i.score}<small>/100</small></span>
                    <dl>
                      <dt>Schema:</dt><dd>Article (BlogPosting)</dd>
                      <dt>Liên kết:</dt><dd title="Nội bộ · Ra ngoài">{i.links.internal} nội bộ · {i.links.external} ngoài</dd>
                      <dt>Độ dài:</dt><dd>{i.words.toLocaleString('vi-VN')} chữ</dd>
                    </dl>
                  </td>
                  <td className="wp-c-st">
                    {editCol === 'title'
                      ? <div className="wp-edit"><input value={p.seoTitle || ''} maxLength={300} placeholder={p.title} onChange={e => patch(p.id, { seoTitle: e.target.value || undefined })} /><small className={(p.seoTitle || p.title).length > 60 ? 'is-over' : ''}>{(p.seoTitle || p.title).length}/60</small></div>
                      : <span className={i.titleDefault ? 'wp-muted' : ''}>{i.title}</span>}
                  </td>
                  <td className="wp-c-sd">
                    {editCol === 'desc'
                      ? <div className="wp-edit"><textarea rows={3} value={p.seoDescription || ''} maxLength={300} placeholder={p.excerpt || 'Mô tả hiện trên Google…'} onChange={e => patch(p.id, { seoDescription: e.target.value || undefined })} /><small className={i.desc.length > 160 ? 'is-over' : ''}>{i.desc.length}/160</small></div>
                      : i.desc ? <span className={i.descDefault ? 'wp-muted' : ''}>{i.desc.length > 140 ? i.desc.slice(0, 140) + '…' : i.desc}</span> : <span className="wp-warn">Chưa có mô tả</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="wp-bar wp-bar--bottom">{editCol && <span className="wp-muted">Đang sửa hàng loạt cột {editCol === 'title' ? 'SEO Title' : 'SEO Desc'}. Chữ mờ = đang dùng mặc định (tiêu đề / tóm tắt bài). Bấm Lưu nháp hoặc Xuất bản để áp dụng.</span>}{pager}</div>
    </>
  );
}
