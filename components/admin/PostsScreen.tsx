'use client';
/**
 * Nội dung → Bài viết (màn danh sách chuẩn của admin): FilterBar + DataTable + StatusBadge + menu thao tác,
 * trình sửa chia tab (Nội dung, Phân loại, SEO, Lịch sử), phần nâng cao thu gọn.
 * Trạng thái: Nháp → Công khai → Lưu trữ (ẩn khỏi website, không xóa).
 */
import { Archive, ArrowLeft, Copy, ExternalLink, Eye, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import MediaPicker from '../MediaPicker';
import { Lines, ServiceChecks, Text, Toggle } from '../AdminContentEditors';
import type { Post, SiteData } from '@/lib/content';
import { RecordHistory } from './RecordHistory';
import { slugify } from './ProductsScreen';
import { Button, DataTable, FormSection, PageHeader, StatusBadge, TabBar, useConfirm, type Tone } from './kit';
import { Empty, SearchBar, matches, useQueryParam, usePaged } from './ui';

type Status = 'nhap' | 'cong-khai' | 'luu-tru';
const statusOf = (p: Post): Status => (p.archived ? 'luu-tru' : p.published ? 'cong-khai' : 'nhap');
const STATUS: Record<Status, { label: string; tone: Tone }> = { nhap: { label: 'Nháp', tone: 'warning' }, 'cong-khai': { label: 'Công khai', tone: 'success' }, 'luu-tru': { label: 'Lưu trữ', tone: 'neutral' } };
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

function PostList({ draft, setDraft, open, create }: { draft: SiteData; setDraft: (d: SiteData) => void; open: (id: string) => void; create: () => void }) {
  const confirm = useConfirm();
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
  const counts: Record<Status, number> = { nhap: 0, 'cong-khai': 0, 'luu-tru': 0 };
  for (const p of draft.posts) counts[statusOf(p)]++;
  const patch = (id: string, change: Partial<Post>) => setDraft({ ...draft, posts: draft.posts.map(p => (p.id === id ? { ...p, ...change } : p)) });
  const duplicate = (p: Post) => {
    const nid = globalThis.crypto.randomUUID();
    setDraft({ ...draft, posts: [{ ...structuredClone(p), id: nid, slug: `${p.slug}-ban-sao`.slice(0, 140), title: `${p.title} (bản sao)`, published: false, archived: undefined }, ...draft.posts] });
    open(nid);
  };

  return (
    <>
      <PageHeader title="Bài viết" description={`${counts['cong-khai']} công khai · ${counts.nhap} nháp · ${counts['luu-tru']} lưu trữ`}
        actions={<Button variant="primary" onClick={create}><Plus size={16} /> Viết bài mới</Button>} />
      <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tiêu đề, đường dẫn, thẻ…">
        <select aria-label="Lọc theo trạng thái" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Nháp & công khai</option>
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
      <DataTable
        caption="Danh sách bài viết"
        rows={slice}
        rowKey={p => p.id}
        onRowClick={p => open(p.id)}
        empty={<Empty title={draft.posts.length ? 'Không có bài nào khớp bộ lọc' : 'Chưa có bài viết'} action={!draft.posts.length && <Button variant="primary" onClick={create}><Plus size={16} /> Viết bài đầu tiên</Button>}>Thử đổi từ khóa hoặc bộ lọc.</Empty>}
        columns={[
          { key: 'title', header: 'Tiêu đề', primary: true, cell: p => <span className="ax-cell-title"><b>{p.title || '(chưa có tiêu đề)'}</b><small>/blogs/{p.slug}/{p.tags?.length ? ` · #${p.tags.join(' #')}` : ''}</small></span> },
          { key: 'topic', header: 'Danh mục', hideOnMobile: true, cell: p => topicName(p.topicId) },
          { key: 'date', header: 'Ngày đăng', width: '120px', cell: p => <span className="ax-nowrap">{p.date || '—'}</span> },
          { key: 'status', header: 'Trạng thái', width: '130px', cell: p => <StatusBadge tone={STATUS[statusOf(p)].tone}>{STATUS[statusOf(p)].label}</StatusBadge> }
        ]}
        actions={p => [
          { label: 'Sửa', icon: <Pencil size={15} />, onSelect: () => open(p.id) },
          { label: 'Xem trên website', icon: <Eye size={15} />, onSelect: () => window.open(`/blogs/${p.slug}/`, '_blank', 'noopener'), hidden: statusOf(p) !== 'cong-khai' },
          { label: 'Nhân bản', icon: <Copy size={15} />, onSelect: () => duplicate(p) },
          { label: 'Lưu trữ', icon: <Archive size={15} />, onSelect: () => patch(p.id, { archived: true, published: false }), hidden: statusOf(p) === 'luu-tru' },
          { label: 'Khôi phục từ lưu trữ', icon: <Undo2 size={15} />, onSelect: () => patch(p.id, { archived: undefined }), hidden: statusOf(p) !== 'luu-tru' },
          { label: 'Xóa', icon: <Trash2 size={15} />, danger: true, onSelect: async () => {
            if (await confirm({ title: `Xóa bài “${p.title}”?`, body: 'Nên dùng Lưu trữ nếu chỉ muốn ẩn khỏi website. Thay đổi áp dụng khi Lưu nháp hoặc Xuất bản.', confirmLabel: 'Xóa bài', tone: 'danger' }))
              setDraft({ ...draft, posts: draft.posts.filter(x => x.id !== p.id) });
          } }
        ]}
      />
      {pager}
    </>
  );
}

function PostEditor({ draft, setDraft, saveBar, post, onBack }: Props & { post: Post; onBack: () => void }) {
  const confirm = useConfirm();
  const [tabId, setTab] = useQueryParam('tab', 'noi-dung');
  const tab = TABS.some(t => t.id === tabId) ? tabId : 'noi-dung';
  const edit = (patch: Partial<Post>) => setDraft({ ...draft, posts: draft.posts.map(p => (p.id === post.id ? { ...p, ...patch } : p)) });
  const status = statusOf(post);
  function setStatus(next: string) {
    if (next === 'luu-tru') edit({ archived: true, published: false });
    else edit({ archived: undefined, published: next === 'cong-khai' });
  }
  async function remove() {
    if (!(await confirm({ title: 'Xóa hẳn bài viết này?', body: 'Nên dùng “Lưu trữ” nếu chỉ muốn ẩn khỏi website. Thay đổi áp dụng khi lưu.', confirmLabel: 'Xóa bài', tone: 'danger' }))) return;
    setDraft({ ...draft, posts: draft.posts.filter(p => p.id !== post.id) });
    onBack();
  }
  return (
    <div className="blk-stack">
      <PageHeader
        back={<Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Bài viết</Button>}
        title={post.title || 'Bài viết chưa có tiêu đề'}
        description={<>/blogs/{post.slug}/ · <StatusBadge tone={STATUS[status].tone}>{STATUS[status].label}</StatusBadge></>}
        actions={<a className="ax-btn ax-btn--secondary" href={`/blogs/${post.slug}/`} target="_blank" rel="noopener"><ExternalLink size={15} /> Xem bài</a>}
      />
      <TabBar tabs={TABS} value={tab} onChange={setTab} label="Các phần của bài viết" />

      {tab === 'noi-dung' && (
        <div className="blk-stack">
          <FormSection title="Nội dung bài" description="Tiêu đề, ảnh bìa, tóm tắt và nội dung">
            <Text label="Tiêu đề" value={post.title} max={250} onChange={title => edit({ title })} />
            <MediaPicker label="Ảnh bìa" value={post.image || ''} onChange={image => edit({ image })} />
            <Text label="Tóm tắt (thẻ bài và đầu bài)" value={post.excerpt || ''} area max={1000} onChange={excerpt => edit({ excerpt })} />
            <label>Nội dung<textarea rows={16} maxLength={60000} value={post.body} onChange={e => edit({ body: e.target.value })} /></label>
          </FormSection>
          <FormSection title="Trạng thái" description="Công khai sau khi bấm Xuất bản">
            <TabBar size="sm" tabs={(Object.keys(STATUS) as Status[]).map(k => ({ id: k, label: STATUS[k].label }))} value={status} onChange={setStatus} label="Trạng thái bài viết" />
            <small className="field-note">Công khai: có đường dẫn riêng và vào sitemap (trừ bài noindex). Nháp và Lưu trữ trả 404 với khách; người có quyền xem nội dung vẫn xem trước được.</small>
          </FormSection>
        </div>
      )}

      {tab === 'phan-loai' && (
        <div className="blk-stack">
          <FormSection title="Phân loại" description="Danh mục, thẻ, tác giả và sản phẩm liên quan">
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
          </FormSection>
          <FormSection title="Ngày & chuyên mục" description="Hiển thị trên thẻ bài" advanced>
            <Text label="Chuyên mục (nhãn hiển thị)" value={post.category} max={100} onChange={category => edit({ category })} />
            <div className="admin-two adm-two-tight">
              <label>Ngày đăng<input type="date" value={post.date} onChange={e => edit({ date: e.target.value })} /></label>
              <label>Ngày cập nhật (khi sửa nội dung đáng kể)<input type="date" value={post.updated || ''} onChange={e => edit({ updated: e.target.value || undefined })} /></label>
            </div>
          </FormSection>
          <FormSection title="Vùng nguy hiểm" description="Xóa hẳn bài khỏi dữ liệu" advanced>
            <div><Button variant="danger" onClick={remove}><Trash2 size={15} /> Xóa hẳn bài viết</Button></div>
          </FormSection>
        </div>
      )}

      {tab === 'seo' && (
        <div className="blk-stack">
          <FormSection title="Đường dẫn & tiêu đề tìm kiếm">
            <label>Đường dẫn
              <input maxLength={150} value={post.slug} onChange={e => edit({ slug: slugify(e.target.value) || post.slug })} />
              <small className="field-note">/blogs/{post.slug}/ — đổi đường dẫn của bài đang công khai sẽ tự tạo chuyển hướng 301 từ đường dẫn cũ khi xuất bản.</small>
            </label>
            <Text label="Tiêu đề SEO (bỏ trống = tiêu đề bài)" value={post.seoTitle || ''} max={300} onChange={seoTitle => edit({ seoTitle })} />
            <Text label="Mô tả SEO" value={post.seoDescription || ''} max={300} area onChange={seoDescription => edit({ seoDescription })} />
            <small className="field-note">Ảnh chia sẻ mạng xã hội dùng ảnh bìa của bài.</small>
          </FormSection>
          <FormSection title="Nâng cao" advanced>
            <Toggle label="Không cho Google lập chỉ mục bài này (noindex)" checked={!!post.noindex} onChange={noindex => edit({ noindex: noindex || undefined })} />
          </FormSection>
        </div>
      )}

      {tab === 'lich-su' && <RecordHistory record="posts" id={post.id} label={`bài “${post.title}”`} />}
      {tab !== 'lich-su' && saveBar}
    </div>
  );
}
