'use client';
/**
 * Giải pháp: danh sách + hồ sơ từng sản phẩm (tab Thông tin chung, Nội dung, Gói & giá, Hiển thị, SEO, Lịch sử).
 * Một nguồn dữ liệu: SiteData.services. Trang chủ, hệ sinh thái, landing page, ANNA đọc bản đã xuất bản của hồ sơ này.
 */
import { ArrowLeft, ArrowUpDown, ExternalLink, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import MediaPicker from '../MediaPicker';
import { FaqList, FeatureList, Lines, SubServicesEditor, Text, Toggle } from '../AdminContentEditors';
import type { ProductGroup, ProductPackage, ProductType, Service, SiteData } from '@/lib/content';
import { PRODUCT_TYPES, isCoreProduct, missingForPublish, packagePrice, typeOf, type ProductSection } from '@/lib/product-types';
import { RecordHistory } from './RecordHistory';
import { Empty, SearchBar, matches, useQueryParam, usePaged } from './ui';
import { Button, Card, DataTable, PageHeader, SortableList, StatusBadge, TabBar, ask, useConfirm } from './kit';
import { sortServices } from '@/lib/site-queries';

export const slugify = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const uniqueSlug = (base: string, taken: Set<string>) => { let s = base || 'san-pham', n = 2; while (taken.has(s)) s = `${base}-${n++}`; return s; };

const TABS = [
  { id: 'chung', label: 'Thông tin chung' }, { id: 'noi-dung', label: 'Nội dung' }, { id: 'goi-gia', label: 'Gói & giá' },
  { id: 'hien-thi', label: 'Hiển thị' }, { id: 'seo', label: 'SEO' }, { id: 'lich-su', label: 'Lịch sử' }
];

type Props = {
  draft: SiteData;
  setDraft: (d: SiteData) => void;
  /** Bảng giá DANAVA Studio (khối pricing, dùng chung với Hello DANAVA, Báo giá nhanh, ANNA) */
  studioPricing: ReactNode;
  /** Chữ dải kêu gọi cuối trang sản phẩm (khối pages) */
  ctaText: (key: string) => ReactNode;
  saveBar: ReactNode;
};

export function ProductsScreen(props: Props) {
  const [id, setId] = useQueryParam('id');
  const product = props.draft.services.find(s => s.id === id);
  return product ? <ProductProfile {...props} product={product} onBack={() => setId('', true)} /> : <ProductList {...props} open={pid => setId(pid, true)} />;
}

/* ================================================================ Danh sách */
function ProductList({ draft, setDraft, open }: Props & { open: (id: string) => void }) {
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [group, setGroup] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [sorting, setSorting] = useState(false);
  // Nút Tạo mới trên thanh trên cùng mở /admin/san-pham/?new=1
  const [fresh, setFresh] = useQueryParam('new');
  useEffect(() => { if (fresh) { setCreating(true); setFresh(''); } }, [fresh, setFresh]);
  const groups = draft.productGroups || [];
  const groupName = (gid?: string) => groups.find(g => g.id === gid)?.name || '';
  // Hiển thị theo đúng thứ tự trên website
  const ordered = sortServices(draft.services);
  const list = ordered.filter(s =>
    matches(q, s.title, s.description, s.slug) && (!type || typeOf(s) === type) && (!group || (group === '-' ? !s.groupId : s.groupId === group))
    && (!status || (status === 'an' ? s.published === false : s.published !== false)));
  const { slice, pager } = usePaged(list, 20);
  const patch = (id: string, change: Partial<Service>) => setDraft({ ...draft, services: draft.services.map(s => (s.id === id ? { ...s, ...change } : s)) });

  /** Kéo sắp xếp: ghi thứ tự cho mọi sản phẩm → website hiển thị theo thứ tự này sau khi lưu. */
  const reorder = (next: Service[]) => setDraft({ ...draft, services: next.map((s, i) => ({ ...s, order: i })) });

  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get('title') || '').trim();
    if (!title) return;
    const taken = new Set(draft.services.flatMap(s => [s.id, s.slug]));
    const sid = uniqueSlug(slugify(title), taken);
    const t = String(f.get('type')) as ProductType;
    const hasOrder = draft.services.every(s => typeof s.order === 'number');
    const product: Service = {
      id: sid, slug: sid, title, description: '', items: [], type: t, groupId: String(f.get('group') || '') || undefined,
      published: false, heroLead: '', audience: [], problems: [], process: [], faqs: [], features: [], packages: [], pricing: '', updated: today(),
      ...(hasOrder ? { order: draft.services.length } : {})
    };
    setDraft({ ...draft, services: [...draft.services, product] });
    setCreating(false);
    open(sid);
  }

  return (
    <>
      <PageHeader title="Giải pháp" description={`${draft.services.filter(s => s.published !== false).length} đang hiển thị · ${draft.services.filter(s => s.published === false).length} đang ẩn`}
        actions={<>
          <Button variant="secondary" onClick={() => setSorting(v => !v)} aria-pressed={sorting}><ArrowUpDown size={16} /> {sorting ? 'Xong sắp xếp' : 'Sắp xếp thứ tự'}</Button>
          <Button variant="primary" onClick={() => setCreating(v => !v)}><Plus size={16} /> Thêm sản phẩm</Button>
        </>} />
      <AnimatePresence initial={false}>
        {creating && (
          <motion.form className="adm-create-row" onSubmit={create} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <label>Tên sản phẩm / dịch vụ<input name="title" required maxLength={200} autoFocus placeholder="vd. DANAVA Booking" /></label>
            <label>Loại
              <select name="type" defaultValue="phan-mem">{Object.entries(PRODUCT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            </label>
            <label>Nhóm
              <select name="group" defaultValue=""><option value="">(chưa phân nhóm)</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
            </label>
            <Button variant="primary" type="submit">Tạo hồ sơ</Button>
            <p className="field-note">Hồ sơ mới ở trạng thái ẩn. Điền đủ nội dung rồi bật “Hiển thị trên website” và Xuất bản. Đường dẫn: /giai-phap/{'{đường-dẫn}'}/</p>
          </motion.form>
        )}
      </AnimatePresence>

      {sorting ? (
        <Card title="Kéo để sắp xếp thứ tự hiển thị" description="Kéo tay nắm (hoặc chọn tay nắm, nhấn Space rồi dùng phím mũi tên). Thứ tự áp dụng cho website sau khi Lưu nháp → Xuất bản.">
          <SortableList items={ordered} getId={s => s.id} getLabel={s => s.title} onReorder={reorder}
            render={(s, handle) => (
              <div className="ax-row">
                {handle}
                {s.image ? <img className="ax-row__thumb" src={s.image} alt="" /> : <span className="ax-row__thumb" />}
                <span className="ax-row__main"><b>{s.title}</b><small>{PRODUCT_TYPES[typeOf(s)].label}{groupName(s.groupId) ? ` · ${groupName(s.groupId)}` : ''}</small></span>
                <StatusBadge tone={s.published === false ? 'neutral' : 'success'}>{s.published === false ? 'Đang ẩn' : 'Hiển thị'}</StatusBadge>
              </div>
            )} />
        </Card>
      ) : (
        <>
          <SearchBar value={q} onChange={setQ} placeholder="Tìm theo tên, mô tả, đường dẫn…">
            <select aria-label="Lọc theo loại" value={type} onChange={e => setType(e.target.value)}><option value="">Mọi loại</option>{Object.entries(PRODUCT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            <select aria-label="Lọc theo nhóm" value={group} onChange={e => setGroup(e.target.value)}><option value="">Mọi nhóm</option><option value="-">(chưa phân nhóm)</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
            <select aria-label="Lọc theo trạng thái" value={status} onChange={e => setStatus(e.target.value)}><option value="">Mọi trạng thái</option><option value="hien">Đang hiển thị</option><option value="an">Đang ẩn</option></select>
          </SearchBar>
          <DataTable caption="Danh sách sản phẩm & dịch vụ" rows={slice} rowKey={s => s.id} onRowClick={s => open(s.id)}
            empty={<Empty title="Không có sản phẩm nào khớp bộ lọc">Thử đổi từ khóa hoặc bộ lọc.</Empty>}
            columns={[
              { key: 'title', header: 'Sản phẩm', primary: true, cell: s => <span className="ax-cell-title"><b>{s.featured && <Star size={13} aria-label="Nổi bật" className="ax-star" />} {s.title}</b><small>/giai-phap/{s.slug}/</small></span> },
              { key: 'type', header: 'Loại', cell: s => PRODUCT_TYPES[typeOf(s)].label },
              { key: 'group', header: 'Nhóm', hideOnMobile: true, cell: s => groupName(s.groupId) || <span className="field-note">—</span> },
              { key: 'status', header: 'Trạng thái', width: '140px', cell: s => <StatusBadge tone={s.published === false ? 'neutral' : 'success'}>{s.published === false ? 'Đang ẩn' : 'Đang hiển thị'}</StatusBadge> }
            ]}
            actions={s => [
              { label: 'Sửa hồ sơ', icon: <Pencil size={15} />, onSelect: () => open(s.id) },
              { label: 'Xem trang', icon: <Eye size={15} />, onSelect: () => window.open(`/giai-phap/${s.slug}/`, '_blank', 'noopener'), hidden: s.published === false },
              { label: s.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật', icon: <Star size={15} />, onSelect: () => patch(s.id, { featured: s.featured ? undefined : true }) },
              { label: s.published === false ? 'Hiển thị trên website' : 'Ẩn khỏi website', icon: s.published === false ? <Eye size={15} /> : <EyeOff size={15} />, onSelect: async () => {
                if (s.published !== false && !(await confirm({ title: `Ẩn “${s.title}” khỏi website?`, body: 'Trang sản phẩm sẽ trả 404 sau khi Xuất bản.', confirmLabel: 'Ẩn sản phẩm' }))) return;
                patch(s.id, { published: s.published === false ? (isCoreProduct(s.id) ? undefined : true) : false });
              } }
            ]} />
          {pager}
        </>
      )}
    </>
  );
}

/* ================================================================ Hồ sơ */
function ProductProfile({ draft, setDraft, product: s, onBack, studioPricing, ctaText, saveBar }: Props & { product: Service; onBack: () => void }) {
  const [tabId, setTab] = useQueryParam('tab', 'chung');
  const tab = TABS.some(t => t.id === tabId) ? tabId : 'chung';
  const edit = (patch: Partial<Service>) => setDraft({ ...draft, services: draft.services.map(x => (x.id === s.id ? { ...x, ...patch } : x)) });
  const type = typeOf(s);
  const def = PRODUCT_TYPES[type];
  const has = (section: ProductSection) => def.sections.includes(section);
  const core = isCoreProduct(s.id);
  const missing = missingForPublish(s);
  const groups = draft.productGroups || [];

  async function remove() {
    const refs = [
      draft.posts.filter(p => p.serviceIds?.includes(s.id)).length && 'bài viết',
      (draft.projects || []).filter(p => p.serviceIds?.includes(s.id)).length && 'dự án',
      (draft.landings || []).filter(l => l.serviceIds.includes(s.id)).length && 'landing page',
      (draft.showcase || []).some(x => x.serviceId === s.id) && 'portfolio',
      (draft.subServices || []).some(x => x.parentId === s.id) && 'trang con'
    ].filter(Boolean);
    if ((draft.showcase || []).some(x => x.serviceId === s.id) || (draft.subServices || []).some(x => x.parentId === s.id)) {
      await ask('Chưa xóa được sản phẩm này', { body: 'Sản phẩm còn mục portfolio hoặc trang con gắn kèm. Chuyển hoặc xóa chúng trước.', confirmLabel: 'Đã hiểu', tone: 'primary' });
      return;
    }
    if (!(await ask(`Xóa hồ sơ “${s.title}”?`, { body: `${refs.length ? `Liên kết từ ${refs.join(', ')} sẽ được gỡ. ` : ''}Thay đổi chỉ áp dụng khi lưu.`, confirmLabel: 'Xóa hồ sơ' }))) return;
    const strip = (ids?: string[]) => ids?.filter(x => x !== s.id);
    setDraft({
      ...draft,
      services: draft.services.filter(x => x.id !== s.id),
      posts: draft.posts.map(p => ({ ...p, serviceIds: strip(p.serviceIds) })),
      projects: (draft.projects || []).map(p => ({ ...p, serviceIds: strip(p.serviceIds) })),
      landings: (draft.landings || []).map(l => ({ ...l, serviceIds: l.serviceIds.filter(x => x !== s.id) }))
    });
    onBack();
  }

  return (
    <div className="blk-stack">
      <PageHeader
        back={<Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Giải pháp</Button>}
        title={s.title || 'Sản phẩm chưa đặt tên'}
        description={<>{def.label} · <StatusBadge tone={s.published === false ? 'neutral' : 'success'}>{s.published === false ? 'Đang ẩn' : 'Đang hiển thị'}</StatusBadge></>}
        actions={<a className="ax-btn ax-btn--secondary" href={`/giai-phap/${s.slug}/`} target="_blank" rel="noopener"><ExternalLink size={15} /> Xem trang</a>}
      />
      {s.published !== false && !core && missing.length > 0 && <p className="adm-inline-msg">Còn thiếu để hiển thị công khai: {missing.join(', ')}.</p>}
      <TabBar tabs={TABS} value={tab} onChange={setTab} label="Các phần của hồ sơ" />

      {tab === 'chung' && (
        <section className="admin-panel">
          <Text label="Tên sản phẩm / dịch vụ" value={s.title} max={200} onChange={title => edit({ title })} />
          <div className="admin-two adm-two-tight">
            <label>Loại (quyết định các phần cần nhập)
              <select value={type} onChange={e => edit({ type: e.target.value as ProductType })}>{Object.entries(PRODUCT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
              <small className="field-note">{def.desc}</small>
            </label>
            <label>Nhóm (phân loại, lọc)
              <select value={s.groupId || ''} onChange={e => edit({ groupId: e.target.value || undefined })}><option value="">(chưa phân nhóm)</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
              <small className="field-note">Quản lý nhóm ở Giải pháp → Nhóm & loại.</small>
            </label>
          </div>
          <Text label="Mô tả ngắn (thẻ, menu, kết quả tìm kiếm)" value={s.description} area max={2000} onChange={description => edit({ description })} />
          <MediaPicker label="Ảnh đại diện (thẻ sản phẩm)" value={s.image || ''} onChange={image => edit({ image })} />
          <Toggle label="Hiển thị trên website" checked={s.published !== false} onChange={v => edit({ published: v ? (core ? undefined : true) : false })} />
          <Toggle label="Nổi bật (ưu tiên ở trang chủ, menu)" checked={!!s.featured} onChange={featured => edit({ featured: featured || undefined })} />
          {!core && <div className="adm-danger-zone"><button type="button" className="danger" onClick={remove}><Trash2 size={15} /> Xóa hồ sơ</button><small className="field-note">Sản phẩm gốc không xóa được; có thể tắt hiển thị.</small></div>}
        </section>
      )}

      {tab === 'noi-dung' && (
        <section className="admin-panel">
          <Text label="Giới thiệu: sản phẩm là gì, dành cho ai" value={s.heroLead || ''} area max={1000} onChange={heroLead => edit({ heroLead })} />
          {has('features') && <FeatureList label="Tính năng" items={s.features || []} onChange={features => edit({ features })} />}
          {has('items') && <Lines label="Phạm vi công việc / hạng mục (mỗi dòng một mục)" value={s.items} onChange={items => edit({ items })} />}
          {has('audience') && <Lines label="Đối tượng sử dụng (mỗi dòng một nhóm)" value={s.audience || []} onChange={audience => edit({ audience })} rows={3} />}
          {has('problems') && <Lines label="Vấn đề khách hàng thường gặp (mỗi dòng một ý)" value={s.problems || []} onChange={problems => edit({ problems })} />}
          {has('process') && <FeatureList label="Quy trình triển khai" items={s.process || []} onChange={process => edit({ process })} />}
          {has('faqs') && <FaqList items={s.faqs || []} onChange={faqs => edit({ faqs })} />}
          {!has('features') && (s.features || []).length > 0 && <FeatureList label="Tính năng (đang có dữ liệu)" items={s.features || []} onChange={features => edit({ features })} />}
        </section>
      )}

      {tab === 'goi-gia' && (
        <div className="blk-stack">
          <PackagesEditor packages={s.packages || []} onChange={packages => edit({ packages })} />
          <section className="admin-panel">
            <Text label="Cách xác định báo giá (hiện dưới bảng giá)" value={s.pricing || ''} area max={2000} placeholder="Chỉ ghi giá đã được xác nhận, hoặc mô tả cách tính báo giá." onChange={pricing => edit({ pricing })} />
          </section>
          {s.id === 'studio' && studioPricing}
        </div>
      )}

      {tab === 'hien-thi' && (
        <div className="blk-stack">
          <section className="admin-panel">
            <label>Mẫu trang
              <select value={s.template || 'chuan'} onChange={() => edit({ template: 'chuan' })}><option value="chuan">{core && ['studio', 'website', 'marketing', 'events'].includes(s.id) ? 'Trang thiết kế riêng (sản phẩm gốc)' : 'Trang sản phẩm chuẩn'}</option></select>
              <small className="field-note">{core && ['studio', 'website', 'marketing', 'events'].includes(s.id) ? 'Sản phẩm này có trang thiết kế riêng; các phần nhập ở hồ sơ vẫn được dùng ở trang chủ, menu, landing page và ANNA.' : 'Trang chuẩn tự hiển thị các phần đã nhập: giới thiệu, tính năng, phạm vi, quy trình, bảng giá, FAQ.'}</small>
            </label>
            <MediaPicker label="Ảnh bìa trang (trống = ảnh đại diện)" value={s.cover || ''} onChange={cover => edit({ cover: cover || undefined })} />
            {has('demo') && <Text label="Liên kết dùng thử / demo (/duong-dan/ hoặc https://…)" value={s.demoUrl || ''} max={300} onChange={demoUrl => edit({ demoUrl: demoUrl || undefined })} />}
            <Text label="Liên kết đăng ký (tùy chọn)" value={s.signupUrl || ''} max={300} onChange={signupUrl => edit({ signupUrl: signupUrl || undefined })} />
            <Text label="Trang sản phẩm chính thức (https://…)" value={s.productUrl || ''} max={300} onChange={productUrl => edit({ productUrl })} />
            <Text label="Nhãn nút trang sản phẩm" value={s.productLabel || ''} max={120} onChange={productLabel => edit({ productLabel })} />
          </section>
          {(s.id === 'studio' || s.id === 'website') && ctaText(s.id)}
          <SubServicesEditor draft={draft} setDraft={setDraft} parent={s} />
        </div>
      )}

      {tab === 'seo' && (
        <section className="admin-panel">
          <label>Đường dẫn
            <input value={s.slug} maxLength={100} disabled={core} onChange={e => edit({ slug: slugify(e.target.value) })} />
            <small className="field-note">{core ? 'Sản phẩm gốc giữ đường dẫn cố định để không mất thứ hạng tìm kiếm.' : `/giai-phap/${s.slug}/ — đổi đường dẫn của trang đang công khai sẽ tự tạo chuyển hướng 301 từ đường dẫn cũ khi xuất bản.`}</small>
          </label>
          <Text label="Tiêu đề SEO (bỏ trống = tên)" value={s.seoTitle || ''} max={200} onChange={seoTitle => edit({ seoTitle })} />
          <Text label="Mô tả SEO" value={s.seoDescription || ''} max={300} area onChange={seoDescription => edit({ seoDescription })} />
          <MediaPicker label="Ảnh chia sẻ mạng xã hội (trống = ảnh đại diện)" value={s.ogImage || ''} onChange={ogImage => edit({ ogImage: ogImage || undefined })} />
          <Text label="Ngày cập nhật nội dung" type="date" value={s.updated || ''} onChange={updated => edit({ updated })} />
          <button type="button" className="admin-secondary" onClick={() => edit({ updated: today() })}>Đặt ngày cập nhật = hôm nay</button>
        </section>
      )}

      {tab === 'lich-su' && <RecordHistory record="services" id={s.id} label={s.title} />}
      {tab !== 'lich-su' && saveBar}
    </div>
  );
}

/* ================================================================ Gói & giá */
function PackagesEditor({ packages, onChange }: { packages: ProductPackage[]; onChange: (v: ProductPackage[]) => void }) {
  const set = (i: number, patch: Partial<ProductPackage>) => onChange(packages.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const add = () => onChange([...packages, { id: 'goi-' + globalThis.crypto.randomUUID().slice(0, 8), name: `Gói ${packages.length + 1}`, price: '', unit: '/tháng', perks: [], highlight: false, note: '' }]);
  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <h2>Gói & giá</h2>
        <button type="button" className="admin-secondary" onClick={add} disabled={packages.length >= 8}><Plus size={15} /> Thêm gói</button>
      </div>
      <p className="field-note">Chỉ nhập giá đã được xác nhận. Để trống giá = hiển thị “Liên hệ báo giá”; 0 = Miễn phí. Bảng giá hiện trên trang sản phẩm và khối Bảng giá của landing page.</p>
      {!packages.length && <Empty>Chưa có gói nào. Sản phẩm không có gói thì trang chỉ hiện phần “Cách xác định báo giá”.</Empty>}
      {packages.map((p, i) => (
        <fieldset key={p.id} className="adm-fieldset adm-package">
          <legend>{p.name || `Gói ${i + 1}`} · {packagePrice(p.price)}</legend>
          <div className="admin-two adm-two-tight">
            <Text label="Tên gói" value={p.name} max={120} onChange={name => set(i, { name })} />
            <label>Giá (chỉ chữ số, đồng)
              <input inputMode="numeric" value={p.price} maxLength={15} onChange={e => set(i, { price: e.target.value.replace(/\D/g, '') })} placeholder="Trống = Liên hệ báo giá" />
            </label>
            <Text label="Đơn vị (vd. /tháng, /năm, /dự án)" value={p.unit} max={40} onChange={unit => set(i, { unit })} />
            <Toggle label="Gói nổi bật" checked={p.highlight} onChange={highlight => set(i, { highlight })} />
          </div>
          <Lines label="Quyền lợi (mỗi dòng một ý)" value={p.perks} onChange={perks => set(i, { perks })} rows={4} />
          <Text label="Ghi chú (vd. chưa gồm VAT)" value={p.note} max={300} onChange={note => set(i, { note })} />
          <div className="row-actions">
            <button type="button" disabled={i === 0} aria-label="Đưa gói lên" onClick={() => { const n = [...packages]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>↑</button>
            <button type="button" className="danger" onClick={() => onChange(packages.filter((_, j) => j !== i))}>Xóa gói</button>
          </div>
        </fieldset>
      ))}
    </section>
  );
}

/* ================================================================ Nhóm & loại */
export function GroupsScreen({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const groups = draft.productGroups || [];
  const count = (gid: string) => draft.services.filter(s => s.groupId === gid).length;
  const set = (next: ProductGroup[]) => setDraft({ ...draft, productGroups: next });
  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get('name') || '').trim();
    if (!name) return;
    const id = uniqueSlug(slugify(name), new Set(groups.map(g => g.id)));
    set([...groups, { id, name, description: '' }]);
    e.currentTarget.reset();
  }
  return (
    <div className="admin-two">
      <section className="admin-panel">
        <h2>Nhóm sản phẩm</h2>
        <p className="field-note">Nhóm dùng để phân loại và lọc (vd. Phần mềm vận hành, Dịch vụ sáng tạo). Một sản phẩm thuộc một nhóm. Xóa nhóm thì sản phẩm trong nhóm trở về “chưa phân nhóm”.</p>
        {!groups.length && <Empty>Chưa có nhóm nào.</Empty>}
        {groups.map((g, i) => (
          <div key={g.id} className="adm-group-row">
            <Text label={`Tên nhóm · ${count(g.id)} sản phẩm`} value={g.name} max={80} onChange={name => set(groups.map((x, j) => (j === i ? { ...x, name } : x)))} />
            <Text label="Mô tả" value={g.description} max={500} onChange={description => set(groups.map((x, j) => (j === i ? { ...x, description } : x)))} />
            <button type="button" className="danger" onClick={async () => {
              if (!(await ask(`Xóa nhóm “${g.name}”?`, { body: 'Sản phẩm trong nhóm trở về “chưa phân nhóm”.', confirmLabel: 'Xóa nhóm' }))) return;
              setDraft({ ...draft, productGroups: groups.filter(x => x.id !== g.id), services: draft.services.map(s => (s.groupId === g.id ? { ...s, groupId: undefined } : s)) });
            }}>Xóa</button>
          </div>
        ))}
        <form className="adm-create-row adm-create-row--2" onSubmit={add}>
          <label>Nhóm mới<input name="name" maxLength={80} placeholder="vd. Phần mềm vận hành" /></label>
          <button className="admin-secondary"><Plus size={15} /> Thêm nhóm</button>
        </form>
      </section>
      <section className="admin-panel">
        <h2>Loại sản phẩm</h2>
        <p className="field-note">Loại quyết định các phần cần nhập trong hồ sơ. Nghiệp vụ mới như đặt phòng, thanh toán, kho hàng cần module riêng (xem ghi chú trong lib/product-types.ts), không thêm ở đây.</p>
        <ul className="adm-roles">
          {Object.entries(PRODUCT_TYPES).map(([k, v]) => (
            <li key={k}><b>{v.label} · {draft.services.filter(s => typeOf(s) === k).length} sản phẩm</b><span>{v.desc}</span><span>Bắt buộc khi hiển thị: {v.required.map(r => r.label).join(', ')}.</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
