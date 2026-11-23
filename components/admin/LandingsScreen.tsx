'use client';
/**
 * Website → Landing page:
 *  - Trang nội bộ: dựng trên website DANAVA tại /lp/{slug}/ bằng khối, chỉnh trực quan ở tab Thiết kế.
 *  - Liên kết ngoài: chỉ lưu tên, URL, ảnh, mục đích, sản phẩm liên quan — không tạo trang nội bộ giả.
 * Landing đã làm cho khách hàng quản lý ở Nội dung → Dự án & Portfolio.
 * Website → Mẫu & khối: thư viện khối và mẫu trang.
 */
import Link from 'next/link';
import { Archive, ArrowLeft, ExternalLink, Pencil, Plus, Trash2, Wand2 } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import MediaPicker from '../MediaPicker';
import { ServiceChecks, Text, Toggle } from '../AdminContentEditors';
import type { Landing, LandingStatus, SiteData } from '@/lib/content';
import { BLOCKS, LANDING_TEMPLATES, blocksFromTemplate } from '@/lib/page-blocks';
import { LandingEditor } from './LandingEditor';
import { Button, DataTable, PageHeader, StatusBadge, TabBar, ask, type Tone } from './kit';
const STATUS_TONE: Record<string, Tone> = { draft: 'warning', published: 'success', archived: 'neutral' };
import { RecordHistory } from './RecordHistory';
import { slugify } from './ProductsScreen';
import { Empty, SearchBar, matches, useQueryParam, usePaged } from './ui';

const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const STATUS: Record<LandingStatus, { label: string; tone: string }> = { draft: { label: 'Nháp', tone: '' }, published: { label: 'Công khai', tone: 'green' }, archived: { label: 'Lưu trữ', tone: 'muted' } };
const KIND = { internal: 'Trang nội bộ', external: 'Liên kết ngoài' };

type Props = { draft: SiteData; setDraft: (d: SiteData) => void; saveBar: ReactNode };

export function LandingsScreen(props: Props) {
  const [id, setId] = useQueryParam('id');
  const landing = (props.draft.landings || []).find(l => l.id === id);
  return landing ? <LandingProfile {...props} landing={landing} onBack={() => setId('', true)} /> : <LandingList {...props} open={lid => setId(lid, true)} />;
}

function LandingList({ draft, setDraft, open }: Props & { open: (id: string) => void }) {
  const landings = draft.landings || [];
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [fresh, setFresh] = useQueryParam('new');
  const [tpl, setTpl] = useQueryParam('mau');
  const [, setTabParam] = useQueryParam('tab');
  const [newKind, setNewKind] = useState<'internal' | 'external'>('internal');
  useEffect(() => { if (fresh) { setCreating(true); setFresh(''); } }, [fresh, setFresh]);
  const shown = landings.filter(l => matches(q, l.title, l.slug, l.url, l.purpose) && (!kind || l.kind === kind) && (status ? l.status === status : l.status !== 'archived'));
  const { slice, pager } = usePaged(shown, 20);

  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get('title') || '').trim();
    if (!title) return;
    const taken = new Set(landings.flatMap(l => [l.id, l.slug]));
    let base = slugify(title) || 'landing', sid = base, n = 2;
    while (taken.has(sid)) sid = `${base}-${n++}`;
    const url = String(f.get('url') || '').trim();
    const l: Landing = {
      id: sid, kind: newKind, title, slug: newKind === 'internal' ? sid : '', url: newKind === 'external' ? url : '',
      image: '', purpose: '', serviceIds: [], status: 'draft', blocks: newKind === 'internal' ? blocksFromTemplate(String(f.get('template') || 'trong')) : [], updated: today()
    };
    setDraft({ ...draft, landings: [...landings, l] });
    setCreating(false);
    setTpl('');
    open(sid);
  }

  return (
    <>
      <PageHeader title="Landing page" description={<>Trang nội bộ dựng trên website và liên kết landing page bên ngoài. Landing đã làm cho khách hàng nằm ở <Link className="text-link" href="/admin/du-an/?tab=portfolio">Dự án & Portfolio</Link>.</>}
        actions={<Button variant="primary" onClick={() => setCreating(v => !v)}><Plus size={16} /> Tạo landing page</Button>} />
      {creating && (
        <form className="adm-create-row adm-create-row--landing" onSubmit={create}>
          <label>Tên landing page<input name="title" required maxLength={200} autoFocus placeholder="vd. Ưu đãi DANAVA Studio tháng 12" /></label>
          <fieldset className="adm-kind" aria-label="Loại">
            {(['internal', 'external'] as const).map(k => (
              <label key={k} className="toggle-label"><input type="radio" name="kind" checked={newKind === k} onChange={() => setNewKind(k)} />{KIND[k]}</label>
            ))}
          </fieldset>
          {newKind === 'internal'
            ? <label>Mẫu
                <select name="template" defaultValue={tpl || 'san-pham'}>{LANDING_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
              </label>
            : <label>URL trang bên ngoài<input name="url" type="url" required pattern="https://.+" placeholder="https://…" /></label>}
          <Button variant="primary" type="submit">Tạo</Button>
          <p className="field-note">{newKind === 'internal' ? 'Trang nội bộ có địa chỉ /lp/{đường-dẫn}/, chỉnh trực quan ở tab Thiết kế. Trang mới ở trạng thái Nháp.' : 'Liên kết ngoài chỉ được lưu để quản lý, website không tạo trang nội bộ cho nó.'}</p>
        </form>
      )}
      <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tên, đường dẫn, mục đích…">
        <select aria-label="Lọc theo loại" value={kind} onChange={e => setKind(e.target.value)}><option value="">Mọi loại</option><option value="internal">Trang nội bộ</option><option value="external">Liên kết ngoài</option></select>
        <select aria-label="Lọc theo trạng thái" value={status} onChange={e => setStatus(e.target.value)}><option value="">Nháp & công khai</option><option value="published">Công khai</option><option value="draft">Nháp</option><option value="archived">Lưu trữ</option></select>
      </SearchBar>
      <DataTable caption="Danh sách landing page" rows={slice} rowKey={l => l.id} onRowClick={l => open(l.id)}
        empty={<Empty title={landings.length ? 'Không có landing page nào khớp bộ lọc' : 'Chưa có landing page'} action={!landings.length && <Button variant="primary" onClick={() => setCreating(true)}><Plus size={16} /> Tạo landing page đầu tiên</Button>}>{landings.length ? 'Thử đổi từ khóa hoặc bộ lọc.' : 'Tạo từ mẫu có sẵn rồi chỉnh trực quan ở tab Thiết kế.'}</Empty>}
        columns={[
          { key: 'title', header: 'Landing page', primary: true, cell: l => <span className="ax-cell-title"><b>{l.title}</b><small>{l.kind === 'internal' ? `/lp/${l.slug}/` : l.url}</small></span> },
          { key: 'kind', header: 'Loại', cell: l => KIND[l.kind] },
          { key: 'products', header: 'Sản phẩm', hideOnMobile: true, cell: l => <small>{l.serviceIds.map(id => draft.services.find(s => s.id === id)?.title).filter(Boolean).join(', ') || '—'}</small> },
          { key: 'status', header: 'Trạng thái', width: '130px', cell: l => <StatusBadge tone={STATUS_TONE[l.status]}>{STATUS[l.status].label}</StatusBadge> }
        ]}
        actions={l => [
          { label: 'Sửa', icon: <Pencil size={15} />, onSelect: () => open(l.id) },
          { label: 'Chỉnh thiết kế', icon: <Wand2 size={15} />, onSelect: () => { setTabParam('thiet-ke'); open(l.id); }, hidden: l.kind !== 'internal' },
          { label: l.kind === 'internal' ? 'Xem trên website' : 'Mở liên kết', icon: <ExternalLink size={15} />, onSelect: () => window.open(l.kind === 'internal' ? `/lp/${l.slug}/` : l.url, '_blank', 'noopener'), hidden: l.kind === 'internal' && l.status !== 'published' },
          { label: 'Lưu trữ', icon: <Archive size={15} />, onSelect: () => setDraft({ ...draft, landings: landings.map(x => (x.id === l.id ? { ...x, status: 'archived' as const } : x)) }), hidden: l.status === 'archived' },
          { label: 'Xóa', icon: <Trash2 size={15} />, danger: true, onSelect: async () => {
            if (await ask(`Xóa landing page “${l.title}”?`, { body: 'Nên dùng Lưu trữ nếu chỉ muốn ẩn. Thay đổi áp dụng khi lưu.', confirmLabel: 'Xóa' }))
              setDraft({ ...draft, landings: landings.filter(x => x.id !== l.id) });
          } }
        ]} />
      {pager}
    </>
  );
}

function LandingProfile({ draft, setDraft, saveBar, landing: l, onBack }: Props & { landing: Landing; onBack: () => void }) {
  const tabs = l.kind === 'internal'
    ? [{ id: 'thong-tin', label: 'Thông tin' }, { id: 'thiet-ke', label: 'Thiết kế' }, { id: 'seo', label: 'SEO' }, { id: 'lich-su', label: 'Lịch sử' }]
    : [{ id: 'thong-tin', label: 'Thông tin' }, { id: 'lich-su', label: 'Lịch sử' }];
  const [tabId, setTab] = useQueryParam('tab', 'thong-tin');
  const tab = tabs.some(t => t.id === tabId) ? tabId : 'thong-tin';
  const edit = (patch: Partial<Landing>) => setDraft({ ...draft, landings: (draft.landings || []).map(x => (x.id === l.id ? { ...x, ...patch, updated: today() } : x)) });
  const href = l.kind === 'internal' ? `/lp/${l.slug}/?ban-nhap=1` : l.url;

  async function remove() {
    if (!(await ask(`Xóa landing page “${l.title}”?`, { body: 'Nên dùng trạng thái Lưu trữ nếu chỉ muốn ẩn. Thay đổi chỉ áp dụng khi lưu.', confirmLabel: 'Xóa landing page' }))) return;
    setDraft({ ...draft, landings: (draft.landings || []).filter(x => x.id !== l.id) });
    onBack();
  }

  return (
    <div className={`blk-stack${tab === 'thiet-ke' ? ' is-wide' : ''}`}>
      <PageHeader
        back={<Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Landing page</Button>}
        title={l.title}
        description={<>{KIND[l.kind]}{l.kind === 'internal' ? ` · /lp/${l.slug}/` : ''} · <StatusBadge tone={STATUS_TONE[l.status]}>{STATUS[l.status].label}</StatusBadge></>}
        actions={href && <a className="ax-btn ax-btn--secondary" href={href} target="_blank" rel="noopener"><ExternalLink size={15} /> {l.kind === 'internal' ? 'Xem bản nháp đã lưu' : 'Mở trang'}</a>}
      />
      <TabBar tabs={tabs} value={tab} onChange={setTab} label="Các phần của landing page" />

      {tab === 'thong-tin' && (
        <section className="admin-panel">
          <Text label="Tên landing page" value={l.title} max={200} onChange={title => edit({ title })} />
          {l.kind === 'internal'
            ? <label>Đường dẫn<input value={l.slug} maxLength={100} onChange={e => edit({ slug: slugify(e.target.value) || l.slug })} /><small className="field-note">/lp/{l.slug}/ — đổi đường dẫn khi trang đang công khai sẽ tự tạo chuyển hướng 301 khi xuất bản.</small></label>
            : <Text label="URL trang bên ngoài (https://…)" value={l.url} max={300} onChange={url => edit({ url: url.trim() })} />}
          <Text label="Mục đích (vd. thu thập khách đăng ký demo tháng 12)" value={l.purpose} area max={500} onChange={purpose => edit({ purpose })} />
          <MediaPicker label="Ảnh đại diện" value={l.image} onChange={image => edit({ image })} />
          <ServiceChecks services={draft.services} value={l.serviceIds} onChange={serviceIds => edit({ serviceIds })} label="Sản phẩm, dịch vụ liên quan" />
          <fieldset className="adm-fieldset">
            <legend>Trạng thái</legend>
            <div className="adm-tabs" role="radiogroup" aria-label="Trạng thái">
              {(Object.keys(STATUS) as LandingStatus[]).map(k => <button key={k} type="button" role="radio" aria-checked={l.status === k} aria-selected={l.status === k} className={l.status === k ? 'is-on' : ''} onClick={() => edit({ status: k })}>{STATUS[k].label}</button>)}
            </div>
            <small className="field-note">{l.kind === 'internal' ? 'Công khai: khách truy cập được sau khi Xuất bản. Nháp/Lưu trữ: chỉ người có quyền xem nội dung xem trước được.' : 'Trạng thái giúp quản lý; liên kết ngoài không hiển thị trên website.'}</small>
          </fieldset>
          <div className="adm-danger-zone"><button type="button" className="danger" onClick={remove}>Xóa landing page</button></div>
        </section>
      )}

      {tab === 'thiet-ke' && l.kind === 'internal' && (
        <LandingEditor blocks={l.blocks} services={draft.services} slug={l.slug} onChange={blocks => edit({ blocks })} />
      )}

      {tab === 'seo' && l.kind === 'internal' && (
        <section className="admin-panel">
          <Text label="Tiêu đề SEO (bỏ trống = tên)" value={l.seoTitle || ''} max={200} onChange={seoTitle => edit({ seoTitle })} />
          <Text label="Mô tả SEO (bỏ trống = mục đích)" value={l.seoDescription || ''} max={300} area onChange={seoDescription => edit({ seoDescription })} />
          <p className="field-note">Ảnh chia sẻ mạng xã hội dùng ảnh đại diện.</p>
          <Toggle label="Không cho Google lập chỉ mục (noindex, vd. landing chạy quảng cáo)" checked={!!l.noindex} onChange={noindex => edit({ noindex: noindex || undefined })} />
        </section>
      )}

      {tab === 'lich-su' && <RecordHistory record="landings" id={l.id} label={`“${l.title}”`} />}
      {tab !== 'lich-su' && saveBar}
    </div>
  );
}

/* ================================================================ Mẫu & khối */
export function BlockLibraryScreen() {
  return (
    <div className="admin-two">
      <section className="admin-panel">
        <h2>Mẫu trang</h2>
        <p className="field-note">Bộ khối dựng sẵn để tạo landing page nội bộ nhanh. Sau khi tạo có thể thêm, bớt, sắp xếp khối tự do.</p>
        <ul className="adm-roles">
          {LANDING_TEMPLATES.map(t => (
            <li key={t.id}>
              <b>{t.label}</b><span>{t.desc}</span>
              <Link className="text-link" href={`/admin/landing-page/?new=1&mau=${t.id}`}>Tạo landing page từ mẫu này →</Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="admin-panel">
        <h2>Thư viện khối</h2>
        <p className="field-note">Mỗi khối có mã ổn định, loại khối, dữ liệu và cấu hình hiển thị (cỡ chữ, căn lề, màu, độ rộng, chiều cao, khoảng cách) được kiểm tra hợp lệ khi lưu.</p>
        <ul className="adm-roles">
          {BLOCKS.map(b => <li key={b.type}><b>{b.label}</b><span>{b.desc}</span><span>Trường: {b.fields.map(f => f.label).join(', ')}.</span></li>)}
        </ul>
      </section>
    </div>
  );
}
