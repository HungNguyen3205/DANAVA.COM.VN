'use client';
/**
 * Trình chỉnh sửa nội dung mở rộng cho CMS: trang dịch vụ, trang dịch vụ con, danh mục kiến thức,
 * khách hàng tiêu biểu & nhận xét, và các trường quan hệ/SEO dùng chung.
 * Mọi thay đổi chỉ nằm trong bản chỉnh sửa (draft) cho tới khi bấm "Lưu thay đổi" → lưu vào database.
 */
import { useState } from 'react';
import MediaPicker from './MediaPicker';
import { CLIENT_SEEDS } from '@/lib/content-defaults';
import type { Client, Faq, Feature, Service, ShowcaseItem, SiteData, SubService, Testimonial, Topic } from '@/lib/content';

const uid = () => globalThis.crypto.randomUUID();
const slugify = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

/* ------------------------------------------------------------ Trường cơ bản */
export function Lines({ label, value, onChange, rows = 4, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; rows?: number; hint?: string }) {
  return (
    <label>
      {label}
      <textarea rows={rows} value={value.join('\n')} onChange={e => onChange(e.target.value.split('\n'))} onBlur={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
      {hint && <small className="field-note">{hint}</small>}
    </label>
  );
}

export function Text({ label, value, onChange, max = 300, area = false, rows = 3, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; max?: number; area?: boolean; rows?: number; type?: string; placeholder?: string }) {
  return (
    <label>
      {label}
      {area
        ? <textarea rows={rows} maxLength={max} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        : <input type={type} maxLength={max} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
      {max <= 320 && !area && type === 'text' && <small className="field-note">{value.length}/{max}</small>}
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="toggle-label"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />{label}</label>;
}

/** Chọn nhiều giải pháp liên quan (lưu theo ID). */
export function ServiceChecks({ services, value, onChange, label = 'Giải pháp liên quan' }: { services: Service[]; value: string[]; onChange: (v: string[]) => void; label?: string }) {
  return (
    <fieldset className="adm-fieldset">
      <legend>{label}</legend>
      {services.map(s => (
        <label key={s.id} className="toggle-label">
          <input type="checkbox" checked={value.includes(s.id)} onChange={e => onChange(e.target.checked ? [...value, s.id] : value.filter(x => x !== s.id))} />
          {s.title}
        </label>
      ))}
    </fieldset>
  );
}

/** Danh sách cặp (tiêu đề–mô tả hoặc câu hỏi–trả lời). */
function PairList<T extends Feature | Faq>({ label, items, onChange, keys, labels, max = [200, 2000] }: {
  label: string; items: T[]; onChange: (v: T[]) => void; keys: [keyof T & string, keyof T & string]; labels: [string, string]; max?: [number, number];
}) {
  const [a, b] = keys;
  const set = (i: number, k: string, v: string) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <fieldset className="adm-fieldset">
      <legend>{label}</legend>
      {items.map((it, i) => (
        <div key={i} className="adm-pair">
          <input aria-label={`${labels[0]} ${i + 1}`} placeholder={labels[0]} maxLength={max[0]} value={String(it[a] ?? '')} onChange={e => set(i, a, e.target.value)} />
          <textarea aria-label={`${labels[1]} ${i + 1}`} placeholder={labels[1]} rows={2} maxLength={max[1]} value={String(it[b] ?? '')} onChange={e => set(i, b, e.target.value)} />
          <div className="row-actions">
            <button type="button" disabled={i === 0} aria-label="Đưa lên" onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>↑</button>
            <button type="button" className="danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>Xóa</button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-secondary" onClick={() => onChange([...items, { [a]: '', [b]: '' } as T])}>+ Thêm</button>
    </fieldset>
  );
}

export const FeatureList = (p: { label: string; items: Feature[]; onChange: (v: Feature[]) => void }) =>
  <PairList<Feature> {...p} keys={['title', 'text']} labels={['Tiêu đề', 'Mô tả']} />;
export const FaqList = (p: { label?: string; items: Faq[]; onChange: (v: Faq[]) => void }) =>
  <PairList<Faq> label={p.label || 'Câu hỏi thường gặp (FAQ)'} items={p.items} onChange={p.onChange} keys={['q', 'a']} labels={['Câu hỏi', 'Trả lời']} max={[300, 3000]} />;

/** Lọc dòng trống trước khi lưu (tránh lỗi kiểm tra cấu trúc). */
export function cleanFeatures<T extends Feature | Faq>(list: T[] | undefined): T[] {
  return (list || []).filter(x => Object.values(x).some(v => String(v).trim()));
}

/* ---------------------------------------------------------------- Dịch vụ */
export function ServicesEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const [open, setOpen] = useState<string>(draft.services[0]?.id || '');
  const editService = (id: string, patch: Partial<Service>) =>
    setDraft({ ...draft, services: draft.services.map(s => (s.id === id ? { ...s, ...patch } : s)) });
  const s = draft.services.find(x => x.id === open);

  return (
    <div className="admin-post-layout">
      <section className="admin-panel">
        <h2>Trang giải pháp</h2>
        <p className="field-note">Mỗi giải pháp có trang riêng /giai-phap/…/. Đường dẫn cố định để không mất thứ hạng tìm kiếm.</p>
        {draft.services.map(x => (
          <button key={x.id} type="button" className="project-admin-row" aria-pressed={x.id === open} onClick={() => setOpen(x.id)}>
            <span><b>{x.title}</b><small>/giai-phap/{x.slug}/ · {(draft.subServices || []).filter(t => t.parentId === x.id).length} trang con</small></span><b>→</b>
          </button>
        ))}
      </section>
      {s && (
        <section className="admin-panel post-editor">
          <div className="panel-heading">
            <h2>{s.title}</h2>
            <a className="text-link" href={`/giai-phap/${s.slug}/`} target="_blank" rel="noopener">Xem trang ↗</a>
          </div>
          <Text label="Tên giải pháp" value={s.title} max={200} onChange={title => editService(s.id, { title })} />
          <Text label="Mô tả ngắn (thẻ, menu)" value={s.description} area max={2000} onChange={description => editService(s.id, { description })} />
          <Text label="Đoạn mở đầu: dịch vụ là gì, dành cho ai" value={s.heroLead || ''} area max={1000} onChange={heroLead => editService(s.id, { heroLead })} />
          <Lines label="Phù hợp với (mỗi dòng một nhóm khách hàng)" value={s.audience || []} onChange={audience => editService(s.id, { audience })} rows={3} />
          <Lines label="Vấn đề khách hàng thường gặp (mỗi dòng một ý)" value={s.problems || []} onChange={problems => editService(s.id, { problems })} />
          <Lines label="Phạm vi công việc (mỗi dòng một mục)" value={s.items} onChange={items => editService(s.id, { items })} />
          <FeatureList label="Quy trình triển khai" items={s.process || []} onChange={process => editService(s.id, { process })} />
          <Text label="Chi phí / cách xác định báo giá" value={s.pricing || ''} area max={2000} placeholder="Chỉ ghi giá đã được xác nhận, hoặc mô tả cách tính báo giá." onChange={pricing => editService(s.id, { pricing })} />
          <Text label="Trang sản phẩm chính thức (https://…)" value={s.productUrl || ''} max={300} onChange={productUrl => editService(s.id, { productUrl })} />
          <Text label="Nhãn nút trang sản phẩm" value={s.productLabel || ''} max={120} onChange={productLabel => editService(s.id, { productLabel })} />
          <FaqList items={s.faqs || []} onChange={faqs => editService(s.id, { faqs })} />
          <MediaPicker label="Ảnh đại diện / ảnh chia sẻ" value={s.image || ''} onChange={image => editService(s.id, { image })} />
          <Text label="Tiêu đề SEO (bỏ trống = tên giải pháp)" value={s.seoTitle || ''} max={200} onChange={seoTitle => editService(s.id, { seoTitle })} />
          <Text label="Mô tả SEO" value={s.seoDescription || ''} max={300} onChange={seoDescription => editService(s.id, { seoDescription })} />
          <Text label="Ngày cập nhật nội dung" type="date" value={s.updated || ''} onChange={updated => editService(s.id, { updated })} />
          <button type="button" className="admin-secondary" onClick={() => editService(s.id, { updated: today() })}>Đặt ngày cập nhật = hôm nay</button>
          <SubServicesEditor draft={draft} setDraft={setDraft} parent={s} />
        </section>
      )}
    </div>
  );
}

function SubServicesEditor({ draft, setDraft, parent }: { draft: SiteData; setDraft: (d: SiteData) => void; parent: Service }) {
  const list = (draft.subServices || []).filter(x => x.parentId === parent.id);
  const [sel, setSel] = useState('');
  const sub = list.find(x => x.id === sel);
  const editSub = (patch: Partial<SubService>) =>
    setDraft({ ...draft, subServices: (draft.subServices || []).map(x => (x.id === sel ? { ...x, ...patch } : x)) });
  const add = () => {
    const id = uid();
    const item: SubService = {
      id, parentId: parent.id, slug: `trang-moi-${id.slice(0, 6)}`, title: 'Trang dịch vụ mới', description: '', heroLead: '',
      audience: [], problems: [], features: [], process: [], faqs: [], pricing: '', image: '', published: false, updated: today()
    };
    setDraft({ ...draft, subServices: [...(draft.subServices || []), item] });
    setSel(id);
  };
  const ready = (x: SubService) => x.title.trim() && x.heroLead.trim() && cleanFeatures(x.features).length > 0;

  return (
    <div className="adm-subsection">
      <div className="panel-heading">
        <h3>Trang dịch vụ con</h3>
        <button type="button" className="admin-secondary" onClick={add}>+ Thêm trang</button>
      </div>
      <p className="field-note">Chỉ xuất bản khi trang có nội dung riêng, hình ảnh/dự án thực tế. Bản nháp trả 404 với khách, không vào sitemap; quản trị viên đang đăng nhập vẫn xem trước được.</p>
      {list.map(x => (
        <button key={x.id} type="button" className="project-admin-row" aria-pressed={x.id === sel} onClick={() => setSel(x.id === sel ? '' : x.id)}>
          <span><b>{x.title}</b><small>{x.published ? 'Đã xuất bản' : 'Bản nháp'} · /giai-phap/{parent.slug}/{x.slug}/</small></span><b>{x.id === sel ? '×' : '→'}</b>
        </button>
      ))}
      {sub && (
        <div className="adm-subeditor">
          {sub.editorNote && <p className="adm-note"><b>Ghi chú biên tập:</b> {sub.editorNote}</p>}
          <Text label="Tiêu đề trang (H1)" value={sub.title} max={200} onChange={title => editSub({ title })} />
          <Text label="Đường dẫn (không dấu, nối bằng -)" value={sub.slug} max={150} onChange={v => editSub({ slug: slugify(v) })} />
          <Text label="Mô tả ngắn" value={sub.description} area max={1000} onChange={description => editSub({ description })} />
          <Text label="Đoạn mở đầu" value={sub.heroLead} area max={1000} onChange={heroLead => editSub({ heroLead })} />
          <Lines label="Phù hợp với" value={sub.audience} onChange={audience => editSub({ audience })} rows={3} />
          <Lines label="Vấn đề thường gặp" value={sub.problems} onChange={problems => editSub({ problems })} />
          <FeatureList label="Tính năng / phạm vi" items={sub.features} onChange={features => editSub({ features })} />
          <FeatureList label="Quy trình" items={sub.process} onChange={process => editSub({ process })} />
          <Text label="Chi phí / cách báo giá (bỏ trống = dùng của giải pháp chính)" value={sub.pricing} area max={2000} onChange={pricing => editSub({ pricing })} />
          <FaqList items={sub.faqs} onChange={faqs => editSub({ faqs })} />
          <MediaPicker label="Ảnh thực tế" value={sub.image} onChange={image => editSub({ image })} />
          <Text label="Tiêu đề SEO" value={sub.seoTitle || ''} max={200} onChange={seoTitle => editSub({ seoTitle })} />
          <Text label="Mô tả SEO" value={sub.seoDescription || ''} max={300} onChange={seoDescription => editSub({ seoDescription })} />
          <Text label="Ngày cập nhật" type="date" value={sub.updated} onChange={updated => editSub({ updated })} />
          <Text label="Ghi chú biên tập (không hiển thị công khai)" value={sub.editorNote || ''} area max={2000} onChange={editorNote => editSub({ editorNote })} />
          <Toggle label={ready(sub) ? 'Xuất bản công khai' : 'Xuất bản công khai (cần tiêu đề, đoạn mở đầu và ít nhất một tính năng)'} checked={sub.published} onChange={published => editSub({ published: published && !!ready(sub), features: cleanFeatures(sub.features), process: cleanFeatures(sub.process), faqs: cleanFeatures(sub.faqs) })} />
          <div className="panel-heading">
            <a className="text-link" href={`/giai-phap/${parent.slug}/${sub.slug}/`} target="_blank" rel="noopener">Xem trước (sau khi lưu) ↗</a>
            <button type="button" className="danger" onClick={() => { if (confirm('Xóa trang dịch vụ con này khỏi bản chỉnh sửa?')) { setDraft({ ...draft, subServices: (draft.subServices || []).filter(x => x.id !== sub.id) }); setSel(''); } }}>Xóa trang</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------- Danh mục kiến thức */
export function TopicsEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const topics = draft.topics || [];
  const set = (id: string, patch: Partial<Topic>) => setDraft({ ...draft, topics: topics.map(t => (t.id === id ? { ...t, ...patch } : t)) });
  const count = (id: string) => draft.posts.filter(p => p.published && p.topicId === id).length;
  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <h2>Danh mục kiến thức</h2>
        <button type="button" className="admin-secondary" onClick={() => setDraft({ ...draft, topics: [...topics, { id: uid(), slug: `danh-muc-${Date.now().toString(36)}`, name: 'Danh mục mới', description: '', serviceIds: [], published: false }] })}>+ Thêm danh mục</button>
      </div>
      <p className="field-note">Danh mục đã xuất bản và có từ 3 bài trở lên sẽ có trang riêng /kien-thuc/chu-de/…/ và được đưa vào sitemap. Danh mục ít bài hơn chỉ hiện thành nhóm trong trang Kiến thức.</p>
      {topics.map(t => (
        <details key={t.id} className="adm-card">
          <summary><b>{t.name}</b> · {count(t.id)} bài đã xuất bản · {t.published ? (count(t.id) >= 3 ? 'có trang riêng' : 'đang hiển thị') : 'ẩn'}</summary>
          <Text label="Tên danh mục" value={t.name} max={100} onChange={name => set(t.id, { name })} />
          <Text label="Đường dẫn" value={t.slug} max={100} onChange={v => set(t.id, { slug: slugify(v) })} />
          <Text label="Mô tả" value={t.description} area max={1000} onChange={description => set(t.id, { description })} />
          <ServiceChecks services={draft.services} value={t.serviceIds} onChange={serviceIds => set(t.id, { serviceIds })} label="Thuộc giải pháp" />
          <Text label="Tiêu đề SEO" value={t.seoTitle || ''} max={200} onChange={seoTitle => set(t.id, { seoTitle })} />
          <Text label="Mô tả SEO" value={t.seoDescription || ''} max={300} onChange={seoDescription => set(t.id, { seoDescription })} />
          <Toggle label="Hiển thị công khai" checked={t.published} onChange={published => set(t.id, { published })} />
          <button type="button" className="danger" disabled={count(t.id) > 0 || draft.posts.some(p => p.topicId === t.id)} title="Chỉ xóa được danh mục chưa có bài" onClick={() => setDraft({ ...draft, topics: topics.filter(x => x.id !== t.id) })}>Xóa danh mục</button>
        </details>
      ))}
    </section>
  );
}

/* ------------------------------------------------ Khách hàng & nhận xét */
export function ProofEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const clients = draft.clients || [];
  const tests = draft.testimonials || [];
  const projects = draft.projects || [];
  const setC = (id: string, patch: Partial<Client>) => setDraft({ ...draft, clients: clients.map(c => (c.id === id ? { ...c, ...patch } : c)) });
  const setT = (id: string, patch: Partial<Testimonial>) => setDraft({ ...draft, testimonials: tests.map(t => (t.id === id ? { ...t, ...patch } : t)) });
  // Danh sách dài (khách hàng + 15 đối tác + địa điểm danava.vn): tìm và lọc theo loại quan hệ
  const [q, setQ] = useState('');
  const [rel, setRel] = useState<'all' | 'client' | 'partner' | 'place' | 'hidden'>('all');
  const relOf = (c: Client) => c.relation || 'client';
  const REL_LABEL = { client: 'Khách hàng', partner: 'Đối tác đồng hành', place: 'Địa điểm danava.vn' } as const;
  const isShown = (c: Client) => c.published && c.permission;
  const tabs = [
    { id: 'all', label: 'Tất cả', n: clients.length },
    { id: 'client', label: 'Khách hàng', n: clients.filter(c => relOf(c) === 'client').length },
    { id: 'partner', label: 'Đối tác', n: clients.filter(c => relOf(c) === 'partner').length },
    { id: 'place', label: 'Địa điểm', n: clients.filter(c => relOf(c) === 'place').length },
    { id: 'hidden', label: 'Đang ẩn', n: clients.filter(c => !isShown(c)).length }
  ] as const;
  const needle = q.trim().toLowerCase();
  const shownClients = clients.filter(c => (rel === 'all' || (rel === 'hidden' ? !isShown(c) : relOf(c) === rel))
    && (!needle || [c.name, c.fullName, c.city, c.role].some(v => (v || '').toLowerCase().includes(needle))));
  const projectSelect = (value: string, onChange: (v: string) => void) => (
    <label>
      Dự án liên quan
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Không gắn dự án</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
    </label>
  );

  return (
    <div className="admin-two">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>Khách hàng & đối tác đồng hành</h2>
          <button type="button" className="admin-secondary" onClick={() => { setQ(''); setRel('all'); setDraft({ ...draft, clients: [{ id: uid(), name: '', logo: '', url: '', projectId: '', role: '', relation: 'client', permission: false, published: false, note: '' }, ...clients] }); }}>+ Thêm</button>
        </div>
        <p className="field-note">Chỉ hiển thị trên trang chủ khi đã bật <b>Có quyền hiển thị</b> và <b>Xuất bản</b>. Ghi nguồn xác nhận quyền vào ghi chú.</p>
        <button
          type="button"
          className="admin-secondary"
          onClick={() => {
            // Chỉ THÊM đối tác còn thiếu và điền logo/lĩnh vực còn trống; không xóa, không sửa nội dung đã có.
            const next = clients.map(c => {
              const seed = CLIENT_SEEDS.find(x => x.id === c.id);
              if (!seed) return c;
              const out = { ...c, logo: c.logo || seed.logo, role: c.role || seed.role, relation: c.relation || seed.relation, url: c.url || seed.url };
              for (const k of ['fullName', 'description', 'address', 'city', 'hours', 'types', 'amenities', 'cover', 'verified'] as const) if (out[k] === undefined || (Array.isArray(out[k]) ? !(out[k] as string[]).length : !out[k])) (out as Record<string, unknown>)[k] = seed[k];
              return out;
            });
            const added = CLIENT_SEEDS.filter(x => !clients.some(c => c.id === x.id || c.name.trim().toLowerCase() === x.name.toLowerCase())).map(x => structuredClone(x));
            setDraft({ ...draft, clients: [...next, ...added] });
          }}
        >
          Bổ sung đối tác từ danava.vn ({CLIENT_SEEDS.filter(x => !clients.some(c => c.id === x.id || c.name.trim().toLowerCase() === x.name.toLowerCase())).length} mục còn thiếu)
        </button>
        <div className="adm-listbar">
          <input type="search" className="adm-listbar__search" placeholder="Tìm theo tên, tỉnh/thành, lĩnh vực…" value={q} onChange={e => setQ(e.target.value)} aria-label="Tìm khách hàng, đối tác" />
          <div className="adm-tabs" role="tablist" aria-label="Lọc theo loại">
            {tabs.map(t => <button key={t.id} type="button" role="tab" aria-selected={rel === t.id} className={rel === t.id ? 'is-on' : ''} onClick={() => setRel(t.id)}>{t.label} <span>{t.n}</span></button>)}
          </div>
        </div>
        {shownClients.length === 0 && <p className="adm-empty">Không có mục nào khớp bộ lọc.</p>}
        {shownClients.map(c => (
          <details key={c.id} className="adm-card adm-entity">
            <summary>
              <span className="adm-entity__logo">{c.logo ? <img src={c.logo} alt="" width={40} height={40} loading="lazy" /> : (c.name || '?').slice(0, 1)}</span>
              <span className="adm-entity__main">
                <b>{c.name || 'Chưa đặt tên'}</b>
                <small>{[REL_LABEL[relOf(c)], c.role, c.city].filter(Boolean).join(' · ')}</small>
              </span>
              {c.verified && <span className="adm-pill adm-pill--blue">Verified</span>}
              <span className={`adm-pill ${isShown(c) ? 'adm-pill--green' : 'adm-pill--muted'}`}>{isShown(c) ? 'Đang hiển thị' : 'Đang ẩn'}</span>
            </summary>
            <Text label="Tên khách hàng" value={c.name} max={150} onChange={name => setC(c.id, { name })} />
            <MediaPicker label="Logo (để trống nếu chưa có quyền dùng logo)" value={c.logo} onChange={logo => setC(c.id, { logo })} />
            <Text label="Liên kết (website hoặc trang trên danava.vn, https://…)" value={c.url} max={300} onChange={url => setC(c.id, { url })} />
            <Text label="Lĩnh vực (hiện dưới logo)" value={c.role || ''} max={80} onChange={role => setC(c.id, { role })} />
            <Text label="Tên đầy đủ" value={c.fullName || ''} max={200} onChange={fullName => setC(c.id, { fullName })} />
            <Text label="Địa chỉ" value={c.address || ''} max={300} onChange={address => setC(c.id, { address })} />
            <Text label="Tỉnh/thành (dùng để nhóm trên trang Đối tác)" value={c.city || ''} max={100} onChange={city => setC(c.id, { city })} />
            <Text label="Giờ mở cửa" value={c.hours || ''} max={200} onChange={hours => setC(c.id, { hours })} />
            <Lines label="Dịch vụ & tiện ích (mỗi dòng một mục)" value={c.amenities || []} rows={3} onChange={amenities => setC(c.id, { amenities })} />
            <Text label="Giới thiệu" value={c.description || ''} area rows={4} max={2000} onChange={description => setC(c.id, { description })} />
            <MediaPicker label="Ảnh bìa" value={c.cover || ''} onChange={cover => setC(c.id, { cover })} />
            <label>
              Loại quan hệ
              <select value={c.relation || 'client'} onChange={e => setC(c.id, { relation: e.target.value as 'client' | 'partner' | 'place' })}>
                <option value="client">Khách hàng của DANAVA</option>
                <option value="partner">Đối tác đồng hành (danava.vn)</option>
                <option value="place">Địa điểm trên danava.vn/places</option>
              </select>
            </label>
            <Toggle label="Có huy hiệu DANAVA Verified" checked={!!c.verified} onChange={verified => setC(c.id, { verified })} />
            {projectSelect(c.projectId, projectId => setC(c.id, { projectId }))}
            <Text label="Ghi chú nguồn / quyền sử dụng (nội bộ)" value={c.note} area max={1000} onChange={note => setC(c.id, { note })} />
            <Toggle label="Có quyền hiển thị tên/logo công khai" checked={c.permission} onChange={permission => setC(c.id, { permission, published: permission && c.published })} />
            <Toggle label="Xuất bản" checked={c.published} onChange={published => setC(c.id, { published: published && c.permission && !!c.name.trim() })} />
            <button type="button" className="danger" onClick={() => setDraft({ ...draft, clients: clients.filter(x => x.id !== c.id) })}>Xóa</button>
          </details>
        ))}
      </section>
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>Nhận xét khách hàng</h2>
          <button type="button" className="admin-secondary" onClick={() => setDraft({ ...draft, testimonials: [...tests, { id: uid(), quote: '', name: '', role: '', company: '', projectId: '', image: '', source: '', permission: false, published: false }] })}>+ Thêm</button>
        </div>
        <p className="field-note">Chỉ nhập nhận xét thật, khách hàng đã đồng ý công bố. Nhận xét hiển thị trên trang chủ và trang dự án liên quan. Không đánh dấu sao/điểm đánh giá.</p>
        {tests.map(t => (
          <details key={t.id} className="adm-card">
            <summary><b>{t.name || 'Chưa có tên'}</b> · {t.published && t.permission ? 'Đang hiển thị' : 'Ẩn'}</summary>
            <Text label="Nội dung nhận xét" value={t.quote} area rows={4} max={1500} onChange={quote => setT(t.id, { quote })} />
            <Text label="Người nhận xét" value={t.name} max={150} onChange={name => setT(t.id, { name })} />
            <Text label="Chức danh" value={t.role} max={150} onChange={role => setT(t.id, { role })} />
            <Text label="Doanh nghiệp" value={t.company} max={150} onChange={company => setT(t.id, { company })} />
            {projectSelect(t.projectId, projectId => setT(t.id, { projectId }))}
            <MediaPicker label="Ảnh (tùy chọn, cần đồng ý của người trong ảnh)" value={t.image} onChange={image => setT(t.id, { image })} />
            <Text label="Nguồn / bằng chứng đồng ý (nội bộ)" value={t.source} area max={500} onChange={source => setT(t.id, { source })} />
            <Toggle label="Khách hàng đã đồng ý công bố" checked={t.permission} onChange={permission => setT(t.id, { permission, published: permission && t.published })} />
            <Toggle label="Xuất bản" checked={t.published} onChange={published => setT(t.id, { published: published && t.permission && !!t.quote.trim() && !!t.name.trim() })} />
            <button type="button" className="danger" onClick={() => setDraft({ ...draft, testimonials: tests.filter(x => x.id !== t.id) })}>Xóa</button>
          </details>
        ))}
      </section>
    </div>
  );
}

/* ------------------------------------------------ Portfolio & chương trình */
export function ShowcaseEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const all = draft.showcase || [];
  const services = draft.services.filter(s => ['website', 'events'].includes(s.id) || all.some(x => x.serviceId === s.id));
  const [svc, setSvc] = useState(services[0]?.id || 'website');
  const [sel, setSel] = useState('');
  const list = all.filter(x => x.serviceId === svc);
  const it = all.find(x => x.id === sel);
  const save = (next: ShowcaseItem[]) => setDraft({ ...draft, showcase: next });
  const edit = (patch: Partial<ShowcaseItem>) => save(all.map(x => (x.id === sel ? { ...x, ...patch } : x)));
  /** Đổi chỗ với mục liền trước/sau CÙNG giải pháp (thứ tự hiển thị = thứ tự trong mảng). */
  const move = (id: string, dir: -1 | 1) => {
    const idx = list.findIndex(x => x.id === id);
    const other = list[idx + dir];
    if (!other) return;
    const a = all.findIndex(x => x.id === id), b = all.findIndex(x => x.id === other.id);
    const next = [...all];
    [next[a], next[b]] = [next[b], next[a]];
    save(next);
  };
  const add = () => {
    const id = uid();
    save([...all, { id, slug: `san-pham-${id.slice(0, 6)}`, serviceId: svc, name: 'Mục mới', kind: '', category: '', description: '', image: '', mobileImage: '', motion: '', motionPoster: '', gallery: [], url: '', place: '', tags: [], scope: [], featured: false, published: false, caseStudy: false, intro: '', highlights: [], disclaimer: '', updated: today() }]);
    setSel(id);
  };

  return (
    <div className="admin-post-layout">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>Portfolio & chương trình</h2>
          <button type="button" className="admin-secondary" onClick={add}>+ Thêm</button>
        </div>
        <label>
          Giải pháp
          <select value={svc} onChange={e => { setSvc(e.target.value); setSel(''); }}>
            {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>
        <p className="field-note">Thứ tự trong danh sách = thứ tự hiển thị. Mục <b>Nổi bật</b> hiện thành khối lớn (website: ngay sau phần đầu trang và đứng đầu khu portfolio trang chủ) và không lặp lại trong thư viện bên dưới. Chương trình sự kiện chỉ hiện nhãn “DANAVA thực hiện” khi có phạm vi.</p>
        {list.map((x, i) => (
          <div key={x.id} className="adm-row">
            <button type="button" className="project-admin-row" aria-pressed={x.id === sel} onClick={() => setSel(x.id === sel ? '' : x.id)}>
              {x.image ? <img src={x.image} alt="" /> : <span className="adm-thumb" aria-hidden="true" />}
              <span><b>{x.featured ? '★ ' : ''}{x.name}</b><small>{x.published ? 'Hiển thị' : 'Ẩn'}{x.caseStudy ? ' · có case study' : ''}{!x.scope.length && svc === 'events' ? ' · chưa có phạm vi' : ''}</small></span>
            </button>
            <div className="row-actions">
              <button type="button" disabled={i === 0} aria-label={`Đưa ${x.name} lên`} onClick={() => move(x.id, -1)}>↑</button>
              <button type="button" disabled={i === list.length - 1} aria-label={`Đưa ${x.name} xuống`} onClick={() => move(x.id, 1)}>↓</button>
            </div>
          </div>
        ))}
      </section>
      {it && (
        <section className="admin-panel post-editor">
          <div className="panel-heading">
            <h2>{it.name}</h2>
            {it.caseStudy && <a className="text-link" href={`/du-an/${it.slug}/`} target="_blank" rel="noopener">Xem case study ↗</a>}
          </div>
          <Toggle label="Nổi bật (khối lớn)" checked={it.featured} onChange={featured => edit({ featured })} />
          <Toggle label={it.image ? 'Hiển thị công khai' : 'Hiển thị công khai (cần ảnh chính)'} checked={it.published} onChange={published => edit({ published: published && !!it.image })} />
          <Text label="Tên" value={it.name} max={150} onChange={name => edit({ name })} />
          <Text label="Đường dẫn case study (/du-an/…/)" value={it.slug} max={150} onChange={v => edit({ slug: slugify(v) })} />
          <Text label="Loại sản phẩm / chương trình" value={it.kind} max={120} onChange={kind => edit({ kind })} />
          <Text label="Nhóm (dùng cho bộ lọc)" value={it.category} max={80} onChange={category => edit({ category })} />
          <Text label="Mô tả ngắn" value={it.description} area max={1000} onChange={description => edit({ description })} />
          <Text label="Website đang chạy (https://…)" value={it.url} max={300} onChange={url => edit({ url })} />
          <Text label="Địa điểm (chương trình sự kiện)" value={it.place} max={150} onChange={place => edit({ place })} />
          <Lines label="Phạm vi DANAVA thực hiện (chỉ ghi điều đã xác nhận)" value={it.scope} onChange={scope => edit({ scope })} />
          <Lines label="Thẻ (mỗi dòng một thẻ, tối đa 8)" value={it.tags} rows={2} onChange={tags => edit({ tags: tags.slice(0, 8) })} />
          <MediaPicker label="Ảnh chính (desktop)" value={it.image} onChange={image => edit({ image })} />
          <MediaPicker label="Ảnh điện thoại" value={it.mobileImage} onChange={mobileImage => edit({ mobileImage })} />
          <Text label="Ảnh động ghi từ sản phẩm (đường dẫn /assets/….webp, tùy chọn)" value={it.motion} max={250} onChange={motion => edit({ motion })} />
          <Text label="Ảnh tĩnh thay thế cho ảnh động" value={it.motionPoster} max={250} onChange={motionPoster => edit({ motionPoster })} />
          <fieldset className="adm-fieldset">
            <legend>Thư viện ảnh</legend>
            {it.gallery.map((g, i) => (
              <div key={i} className="adm-pair">
                <MediaPicker label={`Ảnh ${i + 1}`} value={g.src} onChange={src => edit({ gallery: it.gallery.map((x, j) => (j === i ? { ...x, src } : x)).filter(x => x.src) })} />
                <input placeholder="Chú thích" maxLength={300} value={g.caption} onChange={e => edit({ gallery: it.gallery.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })} />
                <button type="button" className="danger" onClick={() => edit({ gallery: it.gallery.filter((_, j) => j !== i) })}>Xóa ảnh</button>
              </div>
            ))}
            <MediaPicker label="Thêm ảnh" value="" onChange={src => src && edit({ gallery: [...it.gallery, { src, caption: '' }] })} />
          </fieldset>
          <Toggle label={it.intro.trim() ? 'Có trang case study' : 'Có trang case study (cần đoạn giới thiệu)'} checked={it.caseStudy} onChange={caseStudy => edit({ caseStudy: caseStudy && !!it.intro.trim() })} />
          <Text label="Giới thiệu case study" value={it.intro} area rows={4} max={3000} onChange={intro => edit({ intro })} />
          <FeatureList label="Điểm nhấn thiết kế" items={it.highlights} onChange={highlights => edit({ highlights })} />
          <Text label="Ghi chú vai trò công khai (vd. không đại diện chủ đầu tư)" value={it.disclaimer} area max={500} onChange={disclaimer => edit({ disclaimer })} />
          <Text label="Tiêu đề SEO" value={it.seoTitle || ''} max={200} onChange={seoTitle => edit({ seoTitle })} />
          <Text label="Mô tả SEO" value={it.seoDescription || ''} max={300} onChange={seoDescription => edit({ seoDescription })} />
          <Text label="Ngày cập nhật" type="date" value={it.updated} onChange={updated => edit({ updated })} />
          <button type="button" className="danger" onClick={() => { if (confirm('Xóa mục này khỏi bản chỉnh sửa?')) { save(all.filter(x => x.id !== it.id)); setSel(''); } }}>Xóa</button>
        </section>
      )}
    </div>
  );
}
