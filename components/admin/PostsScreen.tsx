'use client';
/**
 * Nội dung → Bài viết: danh sách (tìm, lọc trạng thái/danh mục/sản phẩm/thẻ, phân trang) và trình sửa theo tab
 * (Nội dung, Phân loại, SEO, Lịch sử). Trạng thái: Nháp → Công khai → Lưu trữ (ẩn khỏi website, không xóa).
 */
import { ArrowLeft, ExternalLink, Plus } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import MediaPicker from '../MediaPicker';
import { Lines, ServiceChecks, Text, Toggle } from '../AdminContentEditors';
import type { Post, SiteData } from '@/lib/content';
import { RecordHistory } from './RecordHistory';
import { slugify } from './ProductsScreen';
import { Empty, SearchBar, matches, useQueryParam, usePaged } from './ui';

const statusOf = (p: Post) => (p.archived ? 'luu-tru' : p.published ? 'cong-khai' : 'nhap');
const STATUS: Record<string, { label: string; tone: string }> = { nhap: { label: 'Nháp', tone: '' }, 'cong-khai': { label: 'Công khai', tone: 'green' }, 'luu-tru': { label: 'Lưu trữ', tone: 'muted' } };
const TABS = [{ id: 'noi-dung', label: 'Nội dung' }, { id: 'phan-loai', label: 'Phân loại' }, { id: 'seo', label: 'SEO' }, { id: 'lich-su', label: 'Lịch sử' }];

type Props = { draft: SiteData; setDraft: (d: SiteData) => void; saveBar: ReactNode };

export function PostsScreen({ draft, setDraft, saveBar }: Props) {
  const [id, setId] = useQueryParam('id');
  const [fresh, setFresh] = useQueryParam('new');
  function create() {
    const pid = globalThis.crypto.randomUUID();
    setDraft({ ...draft, posts: [{ id: pid, slug: `bai-viet-${pid.slice(0, 8)}`, title: 'Bài viết mới', category: 'Kiến thức', date: new Date().toISOString().slice(0, 10), body: '', published: false }, ...draft.posts] });
    setId(pid, true);
  }
  // Nút Tạo mới / Viết bài mở /admin/bai-viet/?new=1
  useEffect(() => {
    if (!fresh) return;
    setFresh('');
    create();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh]);
  const post = draft.posts.find(p => p.id === id);
  return post
    ? <PostEditor draft={draft} setDraft={setDraft} saveBar={saveBar} post={post} onBack={() => setId('', true)} />
    : <PostList draft={draft} setDraft={setDraft} open={pid => setId(pid, true)} create={create} />;
}

function PostList({ draft, open, create }: { draft: SiteData; setDraft: (d: SiteData) => void; open: (id: string) => void; create: () => void }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState('');
  const [product, setProduct] = useState('');
  const shown = draft.posts
    .filter(p => matches(q, p.title, p.slug, p.category, (p.tags || []).join(' ')))
    .filter(p => (status ? statusOf(p) === status : statusOf(p) !== 'luu-tru'))
    .filter(p => !topic || (topic === '-' ? !p.topicId : p.topicId === topic))
    .filter(p => !product || p.serviceIds?.includes(product))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const { slice, pager } = usePaged(shown, 20);
  const topicName = (tid?: string) => (draft.topics || []).find(t => t.id === tid)?.name || 'Chưa phân loại';
  const counts = { nhap: 0, 'cong-khai': 0, 'luu-tru': 0 } as Record<string, number>;
  for (const p of draft.posts) counts[statusOf(p)]++;

  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <h2>Bài viết</h2>
        <button type="button" className="admin-secondary" onClick={create}><Plus size={15} /> Viết bài mới</button>
      </div>
      <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tiêu đề, đường dẫn, thẻ…">
        <select aria-label="Lọc theo trạng thái" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Nháp & công khai ({counts.nhap + counts['cong-khai']})</option>
          <option value="cong-khai">Công khai ({counts['cong-khai']})</option>
          <option value="nhap">Nháp ({counts.nhap})</option>
          <option value="luu-tru">Lưu trữ ({counts['luu-tru']})</option>
        </select>
        <select aria-label="Lọc theo danh mục" value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">Mọi danh mục</option><option value="-">Chưa phân loại</option>
          {(draft.topics || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select aria-label="Lọc theo sản phẩm liên quan" value={product} onChange={e => setProduct(e.target.value)}>
          <option value="">Mọi sản phẩm</option>{draft.services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </SearchBar>
      {!shown.length ? <Empty>Không có bài viết nào khớp bộ lọc.</Empty> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tiêu đề</th><th>Danh mục</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {slice.map(p => (
                <tr key={p.id}>
                  <td><button type="button" className="adm-link-cell" onClick={() => open(p.id)}><b>{p.title || '(chưa có tiêu đề)'}</b><small>/blogs/{p.slug}/{p.tags?.length ? ` · #${p.tags.join(' #')}` : ''}</small></button></td>
                  <td>{topicName(p.topicId)}</td>
                  <td>{p.date || '—'}</td>
                  <td><span className={`badge ${STATUS[statusOf(p)].tone}`}>{STATUS[statusOf(p)].label}</span></td>
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

function PostEditor({ draft, setDraft, saveBar, post, onBack }: Props & { post: Post; onBack: () => void }) {
  const [tabId, setTab] = useQueryParam('tab', 'noi-dung');
  const tab = TABS.some(t => t.id === tabId) ? tabId : 'noi-dung';
  const edit = (patch: Partial<Post>) => setDraft({ ...draft, posts: draft.posts.map(p => (p.id === post.id ? { ...p, ...patch } : p)) });
  const status = statusOf(post);
  function setStatus(next: string) {
    if (next === 'luu-tru') edit({ archived: true, published: false });
    else edit({ archived: undefined, published: next === 'cong-khai' });
  }
  function remove() {
    if (!confirm('Xóa hẳn bài viết này? Nên dùng “Lưu trữ” nếu chỉ muốn ẩn khỏi website. Thay đổi chỉ áp dụng khi lưu.')) return;
    setDraft({ ...draft, posts: draft.posts.filter(p => p.id !== post.id) });
    onBack();
  }
  return (
    <div className="blk-stack">
      <div className="adm-record-head">
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onBack}><ArrowLeft size={16} /> Danh sách</button>
        <div className="adm-record-head__title"><h2>{post.title || 'Bài viết chưa có tiêu đề'}</h2><small>/blogs/{post.slug}/ · {STATUS[status].label}</small></div>
        <a className="adm-btn adm-btn-ghost" href={`/blogs/${post.slug}/`} target="_blank" rel="noopener"><ExternalLink size={15} /> Xem bài</a>
      </div>
      <div className="adm-tabs adm-screen-tabs" role="tablist" aria-label="Các phần của bài viết">
        {TABS.map(t => <button key={t.id} type="button" role="tab" aria-selected={t.id === tab} className={t.id === tab ? 'is-on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {tab === 'noi-dung' && (
        <section className="admin-panel">
          <Text label="Tiêu đề" value={post.title} max={250} onChange={title => edit({ title })} />
          <MediaPicker label="Ảnh bìa" value={post.image || ''} onChange={image => edit({ image })} />
          <Text label="Tóm tắt (thẻ bài và đầu bài)" value={post.excerpt || ''} area max={1000} onChange={excerpt => edit({ excerpt })} />
          <label>Nội dung<textarea rows={16} maxLength={60000} value={post.body} onChange={e => edit({ body: e.target.value })} /></label>
          <fieldset className="adm-fieldset">
            <legend>Trạng thái</legend>
            <div className="adm-tabs" role="radiogroup" aria-label="Trạng thái bài viết">
              {Object.entries(STATUS).map(([k, v]) => <button key={k} type="button" role="radio" aria-checked={status === k} aria-selected={status === k} className={status === k ? 'is-on' : ''} onClick={() => setStatus(k)}>{v.label}</button>)}
            </div>
            <small className="field-note">Công khai: có đường dẫn riêng và vào sitemap (trừ bài noindex) sau khi Xuất bản. Nháp và Lưu trữ trả 404 với khách; người có quyền xem nội dung vẫn xem trước được.</small>
          </fieldset>
        </section>
      )}

      {tab === 'phan-loai' && (
        <section className="admin-panel">
          <label>Danh mục
            <select value={post.topicId || ''} onChange={e => edit({ topicId: e.target.value })}>
              <option value="">Chưa phân loại</option>
              {(draft.topics || []).map(t => <option key={t.id} value={t.id}>{t.name}{t.published ? '' : ' (ẩn)'}</option>)}
            </select>
            <small className="field-note">Quản lý danh mục ở tab Danh mục của mục Bài viết.</small>
          </label>
          <Lines label="Thẻ (mỗi dòng một thẻ, dùng để tìm và lọc)" value={post.tags || []} rows={3} onChange={tags => edit({ tags: tags.map(t => t.slice(0, 60)).slice(0, 20) })} />
          <label>Tác giả
            <select value={post.authorId || ''} onChange={e => edit({ authorId: e.target.value || undefined })}>
              <option value="">DANAVA Solutions (tổ chức)</option>
              {draft.staff.filter(p => p.visible).map(p => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
            </select>
            <small className="field-note">Chỉ chọn người thật sự viết bài. Tác giả lấy từ Hồ sơ thương hiệu → Đội ngũ.</small>
          </label>
          <ServiceChecks services={draft.services} value={post.serviceIds || []} onChange={serviceIds => edit({ serviceIds })} label="Sản phẩm, dịch vụ liên quan" />
          <Text label="Chuyên mục (nhãn hiển thị)" value={post.category} max={100} onChange={category => edit({ category })} />
          <div className="admin-two adm-two-tight">
            <label>Ngày đăng<input type="date" value={post.date} onChange={e => edit({ date: e.target.value })} /></label>
            <label>Ngày cập nhật (khi sửa nội dung đáng kể)<input type="date" value={post.updated || ''} onChange={e => edit({ updated: e.target.value || undefined })} /></label>
          </div>
          <div className="adm-danger-zone"><button type="button" className="danger" onClick={remove}>Xóa hẳn bài viết</button></div>
        </section>
      )}

      {tab === 'seo' && (
        <section className="admin-panel">
          <label>Đường dẫn
            <input maxLength={150} value={post.slug} onChange={e => edit({ slug: slugify(e.target.value) || post.slug })} />
            <small className="field-note">/blogs/{post.slug}/ — đổi đường dẫn của bài đang công khai sẽ tự tạo chuyển hướng 301 từ đường dẫn cũ khi xuất bản.</small>
          </label>
          <Text label="Tiêu đề SEO (bỏ trống = tiêu đề bài)" value={post.seoTitle || ''} max={300} onChange={seoTitle => edit({ seoTitle })} />
          <Text label="Mô tả SEO" value={post.seoDescription || ''} max={300} area onChange={seoDescription => edit({ seoDescription })} />
          <p className="field-note">Ảnh chia sẻ mạng xã hội dùng ảnh bìa của bài.</p>
          <Toggle label="Không cho Google lập chỉ mục bài này (noindex)" checked={!!post.noindex} onChange={noindex => edit({ noindex: noindex || undefined })} />
        </section>
      )}

      {tab === 'lich-su' && <RecordHistory record="posts" id={post.id} label={`bài “${post.title}”`} />}
      {tab !== 'lich-su' && saveBar}
    </div>
  );
}
