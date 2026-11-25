'use client';
/**
 * Giải pháp → Thiết bị phòng gym: giá, kích thước, ảnh và mô hình 3D của từng máy (lib/equipment.ts).
 * Dùng cho trang /thiet-bi-gym/ và phòng lab 3D /bao-gia-setup-phong-gym/ (giá trống = "Liên hệ", không cộng vào tổng).
 */
import { Box, Plus } from 'lucide-react';
import { useState } from 'react';
import type { SiteData } from '@/lib/content';
import { EQUIPMENT_CATEGORIES, KIND_LABEL, formatVND, type Equipment, type EquipmentCategory } from '@/lib/equipment';
import { CATALOG_SOURCE, EQUIPMENT_SEEDS } from '@/lib/equipment-seeds';
import { LibraryButton, uploadMedia } from '../MediaPicker';
import { PF, Switch } from '../AdminContentEditors';
import { matches } from './ui';

async function uploadModel(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw Error('Mô hình 3D tối đa 20 MB.');
  const auth = await fetch('/api/admin/session/').then(r => r.json());
  const r = await fetch('/api/admin/models/', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': auth.csrf }, body: file });
  const v = await r.json();
  if (!r.ok) throw Error(v.error || 'Không tải được mô hình 3D.');
  return v.url;
}

function Num({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <label className="pf-field">
      <span>{label}</span>
      <input type="number" min={1} max={max} step={1} value={value} onChange={e => onChange(Math.max(1, Math.min(max, Math.round(Number(e.target.value) || 1))))} />
    </label>
  );
}

function EquipmentCard({ x, set, remove }: { x: Equipment; set: (p: Partial<Equipment>) => void; remove: () => void }) {
  const [busy, setBusy] = useState(''), [err, setErr] = useState('');
  const up = (kind: 'image' | 'model') => async (file?: File) => {
    if (!file) return;
    setBusy(kind); setErr('');
    try { set(kind === 'image' ? { image: await uploadMedia(file) } : { model: await uploadModel(file) }); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Lỗi tải tệp'); }
    setBusy('');
  };
  return (
    <details className="adm-card adm-entity">
      <summary>
        <span className="adm-entity__logo" style={{ background: x.image ? undefined : x.color, color: '#fff' }}>{x.image ? <img src={x.image} alt="" width={40} height={40} loading="lazy" /> : <Box size={18} />}</span>
        <span className="adm-entity__main">
          <b>{x.name || 'Chưa đặt tên'}</b>
          <small>{x.kind ? KIND_LABEL[x.kind] : EQUIPMENT_CATEGORIES[x.category]}{x.sku ? ` · ${x.sku}` : ''} · {x.width}×{x.depth}×{x.height} cm{x.dimsEstimated ? ' (ước tính)' : ''}{x.model ? ' · có file 3D' : ''}</small>
        </span>
        <span className={`adm-pill ${x.price ? 'adm-pill--blue' : 'adm-pill--muted'}`}>{x.price ? formatVND(Number(x.price)) : 'Liên hệ'}</span>
        <span className={`adm-pill ${x.published ? 'adm-pill--green' : 'adm-pill--muted'}`}>{x.published ? 'Đang hiện' : 'Ẩn'}</span>
      </summary>
      <div className="pf">
        <div className="pf-grid">
          <PF label="Tên máy" value={x.name} max={120} placeholder="vd. Máy chạy bộ" onChange={name => set({ name })} />
          <label className="pf-field">
            <span>Nhóm</span>
            <select value={x.category} onChange={e => set({ category: e.target.value as EquipmentCategory })}>
              {Object.entries(EQUIPMENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="pf-field">
            <span>Giá (VNĐ) <small className="eq-hint">trống = Liên hệ</small></span>
            <input inputMode="numeric" value={x.price ? Number(x.price).toLocaleString('vi-VN') : ''} placeholder="vd. 35.000.000"
              onChange={e => set({ price: e.target.value.replace(/\D/g, '').slice(0, 12) })} />
          </label>
          <label className="pf-field">
            <span>Màu khối 3D (khi chưa có mô hình)</span>
            <span className="eq-color"><input type="color" value={x.color} onChange={e => set({ color: e.target.value })} /><code>{x.color}</code></span>
          </label>
          <div className="pf-field pf-field--wide eq-dims">
            <Num label="Rộng (cm)" value={x.width} max={2000} onChange={width => set({ width, dimsEstimated: false })} />
            <Num label="Sâu (cm)" value={x.depth} max={2000} onChange={depth => set({ depth, dimsEstimated: false })} />
            <Num label="Cao (cm)" value={x.height} max={500} onChange={height => set({ height, dimsEstimated: false })} />
            <small className="eq-hint">Chiếm khoảng {Math.ceil(x.width / 40)}×{Math.ceil(x.depth / 40)} ô gạch 40 cm trong phòng lab 3D.</small>
          </div>
          <div className="pf-field pf-field--wide eq-files">
            <div className="eq-file">
              <span>Ảnh sản phẩm</span>
              {x.image && <img src={x.image} alt="" />}
              <div className="eq-file__btns">
                <LibraryButton className="ps-libbtn" value={x.image} onPick={image => set({ image })}>▦ Chọn từ thư viện</LibraryButton>
                <label className="ps-libbtn">{busy === 'image' ? 'Đang tải…' : '↑ Tải ảnh'}<input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={e => { void up('image')(e.target.files?.[0]); e.target.value = ''; }} /></label>
                {x.image && <button type="button" className="pf-delete" onClick={() => set({ image: '' })}>Gỡ</button>}
              </div>
            </div>
            <div className="eq-file">
              <span>Mô hình 3D (.glb)</span>
              <code className="eq-model">{x.model || `Chưa có, phòng lab dùng mô hình dựng sẵn: ${x.kind ? KIND_LABEL[x.kind] : 'theo tên máy'}`}</code>
              <div className="eq-file__btns">
                <label className="ps-libbtn">{busy === 'model' ? 'Đang tải…' : '↑ Tải mô hình .glb'}<input type="file" hidden accept=".glb,model/gltf-binary" onChange={e => { void up('model')(e.target.files?.[0]); e.target.value = ''; }} /></label>
                {x.model && <button type="button" className="pf-delete" onClick={() => set({ model: '' })}>Gỡ</button>}
              </div>
              <small className="eq-hint">Xuất từ Blender / SketchUp dạng GLB, mặt đáy nằm trên mặt phẳng sàn. Kích thước thật lấy theo ô Rộng/Sâu/Cao.</small>
            </div>
          </div>
          <PF label="Mô tả ngắn" value={x.description} max={500} area wide onChange={description => set({ description })} />
          {x.source && <p className="pf-field pf-field--wide eq-hint">Nguồn: <a href={x.source} target="_blank" rel="noopener">{x.source}</a>{x.dimsEstimated ? ' · kích thước đang ước tính theo loại máy, sửa lại nếu có số đo thật' : ''}</p>}
        </div>
        {err && <p className="mb-err" role="alert">{err}</p>}
        <div className="pf-switches">
          <Switch on={x.published} title="Hiện trên website" sub="Trang thiết bị và phòng lab 3D" onChange={published => set({ published })} />
        </div>
        <div className="pf-foot"><button type="button" className="pf-delete" onClick={remove}>Xóa máy này</button></div>
      </div>
    </details>
  );
}

export function EquipmentScreen({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const list = draft.equipment ?? EQUIPMENT_SEEDS;
  const [q, setQ] = useState(''), [cat, setCat] = useState('');
  const setList = (next: Equipment[]) => setDraft({ ...draft, equipment: next });
  const shown = list.filter(x => (!cat || x.category === cat) && matches(q, x.name, x.description));
  const priced = list.filter(x => x.price).length;
  return (
    <div className="pf-page">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>Thiết bị phòng gym</h2>
          <button type="button" className="admin-secondary" onClick={() => setList([{ id: 'may-' + Math.random().toString(36).slice(2, 8), name: '', category: 'cardio', price: '', width: 100, depth: 60, height: 100, image: '', model: '', color: '#2b4294', description: '', published: false }, ...list])}><Plus size={15} /> Thêm máy</button>
        </div>
        <p className="adm-home-count" role="status"><b>{priced}</b>/{list.length} máy đã có giá</p>
        <p className="field-note">Danh mục mặc định đồng bộ từ đối tác <b>{CATALOG_SOURCE.site}</b> ngày {CATALOG_SOURCE.syncedAt.split('-').reverse().join('/')} (giá, tên, ảnh). Cập nhật lại giá: chạy <code>node scripts/sync-thietbigym.mjs</code> rồi triển khai.</p>
        <p className="field-note">Giá, kích thước và mô hình 3D dùng cho trang <a href="/thiet-bi-gym/" target="_blank" rel="noopener">/thiet-bi-gym/</a> và phòng lab 3D <a href="/bao-gia-setup-phong-gym/" target="_blank" rel="noopener">/bao-gia-setup-phong-gym/</a>. Máy chưa có giá hiện “Liên hệ” và không cộng vào tổng chi phí. Bấm <b>Xuất bản</b> để áp dụng.</p>
        <div className="adm-listbar">
          <input type="search" className="adm-listbar__search" placeholder="Tìm máy…" value={q} onChange={e => setQ(e.target.value)} aria-label="Tìm máy" />
          <div className="adm-tabs" role="tablist" aria-label="Lọc theo nhóm">
            {[['', 'Tất cả'], ...Object.entries(EQUIPMENT_CATEGORIES)].map(([k, v]) => (
              <button key={k} type="button" role="tab" aria-selected={cat === k} className={cat === k ? 'is-on' : ''} onClick={() => setCat(k)}>{v} <span>{k ? list.filter(x => x.category === k).length : list.length}</span></button>
            ))}
          </div>
        </div>
        {shown.map(x => (
          <EquipmentCard key={x.id} x={x} set={p => setList(list.map(y => (y.id === x.id ? { ...y, ...p } : y)))} remove={() => setList(list.filter(y => y.id !== x.id))} />
        ))}
        {shown.length === 0 && <p className="adm-empty">Không có máy nào khớp.</p>}
      </section>
    </div>
  );
}
