'use client';
/**
 * Trình sắp xếp kéo thả (dnd-kit) cho dữ liệu có thứ tự thật trên website:
 *  - Menu điều hướng: cột và mục trong cột (khối `menu`); menu chân trang (SiteData.footer)
 *  - Ảnh doanh nghiệp: thứ tự ảnh, ảnh đầu là ảnh lớn (khối `gallery`)
 *  - Đội ngũ: thứ tự nhân sự trên trang Đội ngũ (SiteData.staff)
 * Thứ tự được lưu qua Lưu nháp / Xuất bản như mọi thay đổi khác; lưu lỗi thì giữ thay đổi để thử lại hoặc Hoàn tác.
 */
import { ChevronDown, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Person, SiteData } from '@/lib/content';
import { block, footerError, withBlock, type FooterColumn, type FooterItem } from '@/lib/blocks';
import { txt } from '@/lib/site-text';
import { personPhoto } from '@/lib/media';
import { Button, Card, DUR, EASE, SortableList, StatusBadge, ask, useListIds } from './kit';

/* ================================================================ Menu điều hướng */
type MenuItem = { label: string; desc: string; href: string; badge: string; image: string };
type MenuColumn = { title: string; items: MenuItem[] };
type Menu = { columns: MenuColumn[]; footText: string; footLabel: string; footHref: string };

function MenuColumnEditor({ col, onChange, onRemove, handle }: { col: MenuColumn; onChange: (c: MenuColumn) => void; onRemove: () => void; handle: React.ReactNode }) {
  const ids = useListIds(col.items.length);
  const [open, setOpen] = useState<string | null>(null);
  const setItem = (i: number, patch: Partial<MenuItem>) => onChange({ ...col, items: col.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  return (
    <div className="ax-menucol">
      <div className="ax-menucol__head">
        {handle}
        <input aria-label="Tên cột" value={col.title} maxLength={80} onChange={e => onChange({ ...col, title: e.target.value })} placeholder="Tên cột" />
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Xóa cột ${col.title}`}><Trash2 size={15} /></Button>
      </div>
      <SortableList items={ids.pair(col.items)} getId={p => p.id} getLabel={p => p.value.label || 'mục'}
        onReorder={pairs => onChange({ ...col, items: ids.reorder(pairs) })}
        render={({ id, value: it }, h) => {
          const i = ids.ids.indexOf(id);
          const isOpen = open === id;
          return (
            <div className="ax-row ax-row--stack">
              <div className="ax-row__line">
                {h}
                <span className="ax-row__main"><b>{it.label || '(chưa đặt tên)'}</b><small>{it.href || 'Chỉ hiển thị, không bấm được'}{it.badge ? ` · ${it.badge}` : ''}</small></span>
                <Button variant="ghost" size="sm" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : id)} aria-label={`Sửa ${it.label}`}><ChevronDown size={15} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} /></Button>
                <Button variant="ghost" size="sm" aria-label={`Xóa ${it.label}`} onClick={async () => {
                  if (!(await ask(`Xóa mục “${it.label}” khỏi menu?`, { confirmLabel: 'Xóa mục' }))) return;
                  ids.remove(i);
                  onChange({ ...col, items: col.items.filter((_, j) => j !== i) });
                }}><Trash2 size={15} /></Button>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div className="ax-row__more" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE }}>
                    <div className="ax-grid-form">
                      <label>Tên<input value={it.label} maxLength={80} onChange={e => setItem(i, { label: e.target.value })} /></label>
                      <label>Đường dẫn<input value={it.href} maxLength={300} placeholder="/trang/ hoặc https://… (trống = chỉ hiển thị)" onChange={e => setItem(i, { href: e.target.value.trim() })} /></label>
                      <label>Mô tả ngắn<input value={it.desc} maxLength={200} onChange={e => setItem(i, { desc: e.target.value })} /></label>
                      <label>Nhãn nhỏ<input value={it.badge} maxLength={30} placeholder="vd. Mới" onChange={e => setItem(i, { badge: e.target.value })} /></label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }} />
      <Button variant="secondary" size="sm" onClick={() => { ids.insert(col.items.length); onChange({ ...col, items: [...col.items, { label: 'Mục mới', desc: '', href: '', badge: '', image: '' }] }); }}><Plus size={15} /> Thêm mục</Button>
    </div>
  );
}

export function MenuEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const menu = block(draft, 'menu') as unknown as Menu;
  const cols = useListIds(menu.columns.length);
  const set = (next: Menu) => setDraft(withBlock(draft, 'menu', next));
  return (
    <div className="blk-stack">
      <Card title="Menu Giải pháp" description="Các cột trong menu “Giải pháp” trên đầu trang (máy tính) và menu điện thoại. Kéo tay nắm để đổi thứ tự cột và mục; bấm mũi tên để sửa chi tiết."
        actions={<>
          <Button variant="secondary" size="sm" onClick={() => { cols.insert(menu.columns.length); set({ ...menu, columns: [...menu.columns, { title: 'Cột mới', items: [] }] }); }}><Plus size={15} /> Thêm cột</Button>
          <Button variant="ghost" size="sm" onClick={async () => { if (await ask('Khôi phục menu mặc định?', { body: 'Thay đổi áp dụng khi lưu.', confirmLabel: 'Khôi phục' })) setDraft(withBlock(draft, 'menu', undefined)); }}>Khôi phục mặc định</Button>
        </>}>
        <SortableList layout="grid" className="ax-menucols" items={cols.pair(menu.columns)} getId={p => p.id} getLabel={p => p.value.title || 'cột'}
          onReorder={pairs => set({ ...menu, columns: cols.reorder(pairs) })}
          render={({ id, value: col }, handle) => {
            const i = cols.ids.indexOf(id);
            return <MenuColumnEditor col={col} handle={handle}
              onChange={c => set({ ...menu, columns: menu.columns.map((x, j) => (j === i ? c : x)) })}
              onRemove={async () => {
                if (!(await ask(`Xóa cột “${col.title}” và ${col.items.length} mục trong cột?`, { confirmLabel: 'Xóa cột' }))) return;
                cols.remove(i);
                set({ ...menu, columns: menu.columns.filter((_, j) => j !== i) });
              }} />;
          }} />
      </Card>
      <Card title="Dòng cuối menu">
        <div className="ax-grid-form">
          <label>Dòng chữ<input value={menu.footText} maxLength={150} onChange={e => set({ ...menu, footText: e.target.value })} /></label>
          <label>Chữ liên kết<input value={menu.footLabel} maxLength={80} onChange={e => set({ ...menu, footLabel: e.target.value })} /></label>
          <label>Đường dẫn<input value={menu.footHref} maxLength={300} onChange={e => set({ ...menu, footHref: e.target.value.trim() })} /></label>
        </div>
      </Card>
    </div>
  );
}

/* ================================================================ Menu chân trang */
function FooterColumnEditor({ draft, col, onChange, onRemove, handle }: { draft: SiteData; col: FooterColumn; onChange: (c: FooterColumn) => void; onRemove: () => void; handle: React.ReactNode }) {
  const ids = useListIds(col.items.length);
  // Mục mặc định đọc chữ đã sửa tại chỗ (txt.footer.*); sửa ở đây thì bỏ khóa cũ → dùng tên mới
  const label = (it: FooterItem) => (it.key ? txt(draft, it.key, it.label) : it.label);
  const setItem = (i: number, patch: Partial<FooterItem>) => onChange({ ...col, items: col.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  return (
    <div className="ax-menucol">
      <div className="ax-menucol__head">
        {handle}
        <input aria-label="Tên cột" value={col.titleKey ? txt(draft, col.titleKey, col.title) : col.title} maxLength={60} onChange={e => onChange({ ...col, title: e.target.value, titleKey: '' })} placeholder="Tên cột" />
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Xóa cột ${col.title}`}><Trash2 size={15} /></Button>
      </div>
      <label className="ax-check"><input type="checkbox" checked={col.auto === 'services'} onChange={e => onChange({ ...col, auto: e.target.checked ? 'services' : '' })} /> Tự liệt kê các giải pháp (theo danh sách Sản phẩm & Dịch vụ)</label>
      <SortableList items={ids.pair(col.items)} getId={p => p.id} getLabel={p => label(p.value) || 'mục'}
        onReorder={pairs => onChange({ ...col, items: ids.reorder(pairs) })}
        render={({ id, value: it }, h) => {
          const i = ids.ids.indexOf(id);
          return (
            <div className="ax-row ax-row--stack" style={{ opacity: it.visible ? 1 : 0.55 }}>
              <div className="ax-row__line">
                {h}
                <span className="ax-row__main ax-footrow">
                  <input aria-label="Tên liên kết" value={label(it)} maxLength={80} placeholder="Tên hiển thị" onChange={e => setItem(i, { label: e.target.value, key: '' })} />
                  <input aria-label="Đường dẫn" value={it.href} maxLength={300} placeholder="/trang/ hoặc https://…" onChange={e => setItem(i, { href: e.target.value.trim() })} />
                </span>
                <Button variant="ghost" size="sm" aria-label={it.visible ? `Ẩn ${label(it)}` : `Hiện ${label(it)}`} onClick={() => setItem(i, { visible: !it.visible })}>{it.visible ? <Eye size={15} /> : <EyeOff size={15} />}</Button>
                <Button variant="ghost" size="sm" aria-label={`Xóa ${label(it)}`} onClick={async () => {
                  if (!(await ask(`Xóa “${label(it)}” khỏi chân trang?`, { confirmLabel: 'Xóa mục' }))) return;
                  ids.remove(i);
                  onChange({ ...col, items: col.items.filter((_, j) => j !== i) });
                }}><Trash2 size={15} /></Button>
              </div>
            </div>
          );
        }} />
      <Button variant="secondary" size="sm" disabled={col.items.length >= 20} onClick={() => { ids.insert(col.items.length); onChange({ ...col, items: [...col.items, { label: 'Liên kết mới', href: '/', key: '', visible: true }] }); }}><Plus size={15} /> Thêm mục</Button>
    </div>
  );
}

export function FooterMenuEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const footer = block(draft, 'footer');
  const cols = useListIds(footer.columns.length);
  const set = (next: typeof footer) => setDraft(withBlock(draft, 'footer', next));
  const problem = footerError(footer);
  return (
    <div className="blk-stack">
      <Card title="Footer (chân trang)" description="Các cột liên kết ở chân trang mọi trang. Kéo tay nắm để đổi thứ tự cột và mục; bấm con mắt để ẩn/hiện; thêm hoặc xóa mục tùy ý. Đường dẫn: /trang-trong-website/, https://…, mailto: hoặc tel:. Thay đổi áp dụng khi Lưu nháp / Xuất bản."
        actions={<>
          <Button variant="secondary" size="sm" disabled={footer.columns.length >= 6} onClick={() => { cols.insert(footer.columns.length); set({ ...footer, columns: [...footer.columns, { title: 'Cột mới', titleKey: '', auto: '', items: [] }] }); }}><Plus size={15} /> Thêm cột</Button>
          <Button variant="ghost" size="sm" onClick={async () => { if (await ask('Khôi phục chân trang mặc định?', { body: 'Thay đổi áp dụng khi lưu.', confirmLabel: 'Khôi phục' })) setDraft(withBlock(draft, 'footer', undefined)); }}>Khôi phục mặc định</Button>
        </>}>
        {problem && <p className="ax-error" role="alert">{problem}</p>}
        <SortableList layout="grid" className="ax-menucols" items={cols.pair(footer.columns)} getId={p => p.id} getLabel={p => p.value.title || 'cột'}
          onReorder={pairs => set({ ...footer, columns: cols.reorder(pairs) })}
          render={({ id, value: col }, handle) => {
            const i = cols.ids.indexOf(id);
            return <FooterColumnEditor draft={draft} col={col} handle={handle}
              onChange={c => set({ ...footer, columns: footer.columns.map((x, j) => (j === i ? c : x)) })}
              onRemove={async () => {
                if (!(await ask(`Xóa cột “${col.title}” và ${col.items.length} mục trong cột?`, { confirmLabel: 'Xóa cột' }))) return;
                cols.remove(i);
                set({ ...footer, columns: footer.columns.filter((_, j) => j !== i) });
              }} />;
          }} />
      </Card>
    </div>
  );
}

/* ================================================================ Ảnh doanh nghiệp */
type Photo = { image: string; caption: string; alt: string; focus: string; visible: boolean };

export function GalleryOrder({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const gallery = block(draft, 'gallery') as unknown as { photos: Photo[] } & Record<string, unknown>;
  const ids = useListIds(gallery.photos.length);
  const set = (photos: Photo[]) => setDraft(withBlock(draft, 'gallery', { ...gallery, photos }));
  if (!gallery.photos.length) return null;
  return (
    <Card title="Thứ tự ảnh" description="Kéo ảnh để đổi thứ tự. Ảnh đầu tiên đang hiển thị là ảnh lớn trên trang chủ. Bấm con mắt để ẩn/hiện ảnh.">
      <SortableList layout="grid" items={ids.pair(gallery.photos)} getId={p => p.id} getLabel={p => p.value.caption || 'ảnh'}
        onReorder={pairs => set(ids.reorder(pairs))}
        render={({ id, value: p }, handle) => {
          const i = ids.ids.indexOf(id);
          const first = gallery.photos.findIndex(x => x.visible) === i;
          return (
            <figure className="ax-tile">
              {first && <span className="ax-tile__first"><StatusBadge tone="accent">Ảnh lớn</StatusBadge></span>}
              {p.image ? <img src={p.image} alt={p.alt} style={{ opacity: p.visible ? 1 : 0.4 }} /> : <span className="ax-row__thumb" style={{ width: '100%', aspectRatio: '3 / 2' }} />}
              <figcaption className="ax-tile__bar">
                {handle}
                <small>{p.caption || `Ảnh ${i + 1}`}</small>
                <Button variant="ghost" size="sm" aria-label={p.visible ? `Ẩn ảnh ${p.caption}` : `Hiện ảnh ${p.caption}`} onClick={() => set(gallery.photos.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x)))}>
                  {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </Button>
              </figcaption>
            </figure>
          );
        }} />
    </Card>
  );
}

/* ================================================================ Đội ngũ */
export function StaffOrder({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  if (draft.staff.length < 2) return null;
  return (
    <Card title="Thứ tự đội ngũ" description="Kéo để đổi thứ tự hiển thị trên trang Đội ngũ và trang chủ.">
      <SortableList items={draft.staff} getId={p => p.id} getLabel={p => p.name} onReorder={(staff: Person[]) => setDraft({ ...draft, staff })}
        render={(p, handle) => (
          <div className="ax-row">
            {handle}
            {personPhoto(p) ? <img className="ax-row__thumb ax-row__thumb--round" src={personPhoto(p)} alt="" /> : <span className="ax-row__thumb ax-row__thumb--round" />}
            <span className="ax-row__main"><b>{p.name}</b><small>{p.role}</small></span>
            <StatusBadge tone={p.visible ? 'success' : 'neutral'}>{p.visible ? 'Hiển thị' : 'Đang ẩn'}</StatusBadge>
          </div>
        )} />
    </Card>
  );
}

