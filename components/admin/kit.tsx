'use client';
/**
 * Bộ component giao diện admin (theo cấu trúc shadcn/ui, dựng trên Radix primitives, tô bằng design token DANAVA
 * trong app/admin/admin-ui.css — không dùng Tailwind để không ảnh hưởng website công khai).
 * Chuyển động: Motion (motion/react) cho thay đổi trạng thái phối hợp; CSS cho hover/focus đơn giản.
 * Kéo thả: dnd-kit (chuột, cảm ứng, bàn phím).
 */
import {
  createContext, forwardRef, useCallback, useContext, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type ReactNode
} from 'react';
import { Dialog, DropdownMenu, Tooltip } from 'radix-ui';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { AlertTriangle, ChevronDown, GripVertical, Inbox, Loader2, MoreHorizontal, RefreshCw, X } from 'lucide-react';
import {
  DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
/** Thời lượng chuyển động chuẩn (giây). Motion tự tắt khi người dùng bật giảm chuyển động (MotionConfig ở AdminShell). */
export const EASE = [0.2, 0.8, 0.2, 1] as const;
export const DUR = { fast: 0.15, base: 0.2, slow: 0.25 } as const;

/* ================================================================ Button */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'navy';
  size?: 'sm' | 'md' | 'icon';
  loading?: boolean;
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = 'secondary', size = 'md', loading, className, children, disabled, type = 'button', ...rest }, ref) {
  return (
    <button ref={ref} type={type} className={cx('ax-btn', `ax-btn--${variant}`, `ax-btn--${size}`, loading && 'is-loading', className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="ax-spin" size={15} aria-hidden="true" />}
      {children}
    </button>
  );
});

/* ================================================================ Tooltip */
export function Tip({ label, side = 'right', children, disabled }: { label: string; side?: 'top' | 'right' | 'bottom' | 'left'; children: ReactNode; disabled?: boolean }) {
  if (disabled) return <>{children}</>;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="ax-tooltip" side={side} sideOffset={8}>{label}</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/* ================================================================ Dropdown menu */
export type MenuAction = { label: string; icon?: ReactNode; onSelect: () => void; danger?: boolean; disabled?: boolean; hidden?: boolean };
/**
 * Chạy thao tác của mục menu SAU KHI menu đóng và trả focus về nút kích hoạt.
 * Tránh menu đang đóng giành focus của hộp thoại vừa mở (Esc, autoFocus hoạt động đúng).
 */
export function useMenuAction() {
  const pending = useRef<(() => void) | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return {
    trigger,
    select: (fn: () => void) => () => { pending.current = fn; },
    onCloseAutoFocus: (e: Event) => {
      const run = pending.current;
      if (!run) return;
      e.preventDefault();
      pending.current = null;
      trigger.current?.focus();
      run();
    }
  };
}

export function ActionMenu({ actions, label = 'Thao tác khác', trigger, align = 'end' }: { actions: MenuAction[]; label?: string; trigger?: ReactNode; align?: 'start' | 'end' }) {
  const menu = useMenuAction();
  const shown = actions.filter(a => !a.hidden);
  if (!shown.length) return null;
  return (
    // modal={false}: menu không khóa trang, hộp thoại mở từ menu là lớp trên cùng (Esc, focus đúng)
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild ref={menu.trigger}>
        {trigger || <button type="button" className="ax-icon-btn" aria-label={label}><MoreHorizontal size={17} /></button>}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="ax-menu" align={align} sideOffset={6} collisionPadding={12} onCloseAutoFocus={menu.onCloseAutoFocus}>
          {shown.map(a => (
            <DropdownMenu.Item key={a.label} className={cx('ax-menu__item', a.danger && 'is-danger')} disabled={a.disabled} onSelect={menu.select(a.onSelect)}>
              {a.icon}<span className="ax-menu__text">{a.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Esc luôn đóng hộp thoại/ngăn kéo đang mở (dự phòng khi lớp dismissable của Radix bỏ lỡ phím; đóng lặp lại vô hại). */
function useEscape(open: boolean, onOpenChange: (o: boolean) => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);
}

/* ================================================================ Dialog / Sheet */
/**
 * Hộp thoại. Chuyển động bằng CSS theo data-state (như shadcn/ui): Radix tự chờ hiệu ứng đóng xong mới gỡ khỏi DOM,
 * quản lý focus (giữ focus bên trong, trả về nút đã mở) và Esc.
 */
export function Modal({ open, onOpenChange, title, description, children, footer, size = 'md' }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: ReactNode; children?: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  useEscape(open, onOpenChange);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ax-overlay" />
        <Dialog.Content className={cx('ax-dialog', 'ax-scope', `ax-dialog--${size}`)}>
          <div className="ax-dialog__head">
            <Dialog.Title className="ax-dialog__title">{title}</Dialog.Title>
            <Dialog.Close asChild><button type="button" className="ax-icon-btn" aria-label="Đóng"><X size={17} /></button></Dialog.Close>
          </div>
          {description ? <Dialog.Description className="ax-dialog__desc">{description}</Dialog.Description> : <Dialog.Description className="ax-sr">{title}</Dialog.Description>}
          {children && <div className="ax-dialog__body">{children}</div>}
          {footer && <div className="ax-dialog__foot">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Ngăn kéo (drawer) — dùng cho sidebar trên điện thoại. */
export function Sheet({ open, onOpenChange, title, side = 'left', children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; side?: 'left' | 'right'; children: ReactNode }) {
  useEscape(open, onOpenChange);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ax-overlay" />
        <Dialog.Content className={cx('ax-sheet', 'ax-scope', `ax-sheet--${side}`)}>
          <Dialog.Title className="ax-sr">{title}</Dialog.Title>
          <Dialog.Description className="ax-sr">{title}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ================================================================ ConfirmDialog (thay window.confirm) */
type ConfirmOptions = { title: string; body?: ReactNode; confirmLabel?: string; cancelLabel?: string; tone?: 'danger' | 'primary' };
const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(async o => window.confirm(o.title));

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});
  const ask = useCallback((o: ConfirmOptions) => new Promise<boolean>(resolve => { resolver.current = resolve; setState({ ...o, open: true }); }), []);
  const close = (v: boolean) => { resolver.current(v); setState(s => (s ? { ...s, open: false } : s)); };
  useEffect(() => { globalAsk = ask; return () => { globalAsk = null; }; }, [ask]);
  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      <Modal open={!!state?.open} onOpenChange={o => { if (!o) close(false); }} title={state?.title || ''} description={state?.body} size="sm"
        footer={<>
          {/* Thao tác nguy hiểm: focus mặc định vào Hủy, tránh Enter vội xác nhận xóa */}
          <Button variant="ghost" onClick={() => close(false)} autoFocus={state?.tone === 'danger'}>{state?.cancelLabel || 'Hủy'}</Button>
          <Button variant={state?.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus={state?.tone !== 'danger'}>{state?.confirmLabel || 'Đồng ý'}</Button>
        </>}
      />
    </ConfirmContext.Provider>
  );
}
/** const confirm = useConfirm(); if (await confirm({ title: 'Xóa?', tone: 'danger' })) … */
export const useConfirm = () => useContext(ConfirmContext);

let globalAsk: ((o: ConfirmOptions) => Promise<boolean>) | null = null;
/**
 * Hỏi xác nhận bằng ConfirmDialog từ bất kỳ đâu trong admin (thay window.confirm), không cần hook:
 * if (await ask('Xóa mục này?', { tone: 'danger', confirmLabel: 'Xóa' })) …
 */
export function ask(title: string, o: Omit<ConfirmOptions, 'title'> = {}) {
  return globalAsk ? globalAsk({ tone: 'danger', ...o, title }) : Promise.resolve(window.confirm(title));
}

/* ================================================================ Tabs có chỉ báo trượt */
export function TabBar({ tabs, value, onChange, label = 'Các phần', size = 'md' }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void; label?: string; size?: 'sm' | 'md' }) {
  const group = useId();
  return (
    <div className={cx('ax-tabs', size === 'sm' && 'ax-tabs--sm')} role="tablist" aria-label={label}
      onKeyDown={e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = tabs.findIndex(t => t.id === value), next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        onChange(next.id);
        (e.currentTarget.querySelector(`[data-tab="${next.id}"]`) as HTMLElement | null)?.focus();
      }}>
      {tabs.map(t => {
        const on = t.id === value;
        return (
          <button key={t.id} type="button" role="tab" data-tab={t.id} aria-selected={on} tabIndex={on ? 0 : -1} className={cx('ax-tab', on && 'is-on')} onClick={() => onChange(t.id)}>
            {on && <motion.span layoutId={`tab-${group}`} className="ax-tab__pill" transition={{ duration: DUR.base, ease: EASE }} />}
            <span className="ax-tab__label">{t.label}{t.count !== undefined && <i>{t.count}</i>}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================ Trang & bố cục */
export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="ax-pagehead">
      {back && <div className="ax-pagehead__back">{back}</div>}
      <div className="ax-pagehead__text"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      {actions && <div className="ax-pagehead__actions">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, actions, children, className, flush }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={cx('ax-card', flush && 'ax-card--flush', className)}>
      {(title || actions) && <div className="ax-card__head"><div>{title && <h3>{title}</h3>}{description && <p>{description}</p>}</div>{actions && <div className="ax-card__actions">{actions}</div>}</div>}
      {children}
    </section>
  );
}

/** Nhóm trường nhập có tiêu đề; `advanced` = thu gọn mặc định. */
export function FormSection({ title, description, children, advanced = false }: { title: string; description?: ReactNode; children: ReactNode; advanced?: boolean }) {
  const [open, setOpen] = useState(!advanced);
  const id = useId();
  return (
    <section className={cx('ax-formsec', advanced && 'is-advanced')}>
      <button type="button" className="ax-formsec__head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span><b>{title}</b>{description && <small>{description}</small>}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: DUR.fast }} className="ax-formsec__chev"><ChevronDown size={17} /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} className="ax-formsec__body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE }}>
            <div className="ax-formsec__inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ================================================================ Trạng thái */
export type Tone = 'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent';
export function StatusBadge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx('ax-badge', `ax-badge--${tone}`)}><i aria-hidden="true" />{children}</span>;
}

export function EmptyState({ title = 'Chưa có dữ liệu', children, action, icon }: { title?: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="ax-state ax-state--empty">
      <span className="ax-state__icon" aria-hidden="true">{icon || <Inbox size={22} />}</span>
      <b>{title}</b>{children && <p>{children}</p>}{action}
    </div>
  );
}
export function LoadingState({ label = 'Đang tải…', rows = 4 }: { label?: string; rows?: number }) {
  return (
    <div className="ax-state ax-state--loading" role="status" aria-live="polite">
      <span className="ax-sr">{label}</span>
      {Array.from({ length: rows }, (_, i) => <span key={i} className="ax-skeleton" style={{ width: `${92 - i * 9}%` }} />)}
    </div>
  );
}
export function ErrorState({ children, retry }: { children: ReactNode; retry?: () => void }) {
  return (
    <div className="ax-state ax-state--error" role="alert">
      <span className="ax-state__icon" aria-hidden="true"><AlertTriangle size={22} /></span>
      <b>Không tải được dữ liệu</b><p>{children}</p>
      {retry && <Button variant="secondary" size="sm" onClick={retry}><RefreshCw size={14} /> Thử lại</Button>}
    </div>
  );
}

/* ================================================================ Bộ lọc + bảng dữ liệu */
export function FilterBar({ search, onSearch, placeholder, children, actions }: { search: string; onSearch: (v: string) => void; placeholder: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="ax-filterbar">
      <label className="ax-search">
        <span className="ax-sr">{placeholder}</span>
        <input type="search" value={search} placeholder={placeholder} onChange={e => onSearch(e.target.value)} />
      </label>
      {children && <div className="ax-filterbar__filters">{children}</div>}
      {actions && <div className="ax-filterbar__actions">{actions}</div>}
    </div>
  );
}

export type Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; width?: string; align?: 'left' | 'right' | 'center'; hideOnMobile?: boolean; primary?: boolean };

/**
 * Bảng dữ liệu thống nhất. Trên màn hình hẹp (< 720px) mỗi dòng thành một thẻ; cột `primary` làm tiêu đề thẻ.
 * `actions(row)` → menu thao tác phụ ở cuối dòng.
 */
export function DataTable<T>({ rows, columns, rowKey, actions, onRowClick, empty, caption }: {
  rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string; actions?: (row: T) => MenuAction[]; onRowClick?: (row: T) => void; empty?: ReactNode; caption: string;
}) {
  if (!rows.length) return <>{empty || <EmptyState />}</>;
  return (
    <div className="ax-table-wrap">
      <table className="ax-table">
        <caption className="ax-sr">{caption}</caption>
        <thead><tr>{columns.map(c => <th key={c.key} scope="col" style={{ width: c.width, textAlign: c.align }} className={cx(c.hideOnMobile && 'ax-hide-m')}>{c.header}</th>)}{actions && <th className="ax-col-actions"><span className="ax-sr">Thao tác</span></th>}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={rowKey(r)} className={cx(onRowClick && 'is-clickable')} onClick={onRowClick ? e => { if (!(e.target as HTMLElement).closest('button, a, input, select, [role=menu]')) onRowClick(r); } : undefined}>
              {columns.map(c => <td key={c.key} data-label={c.header} style={{ textAlign: c.align }} className={cx(c.primary && 'is-primary', c.hideOnMobile && 'ax-hide-m')}>{c.cell(r)}</td>)}
              {actions && <td className="ax-col-actions"><ActionMenu actions={actions(r)} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================ Sắp xếp kéo thả (dnd-kit) */
type SortableItemRender<T> = (item: T, handle: ReactNode, state: { dragging: boolean }) => ReactNode;

function SortableRow<T>({ id, item, render, label }: { id: string; item: T; render: SortableItemRender<T>; label: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button type="button" ref={setActivatorNodeRef} className="ax-handle" aria-label={`Kéo để đổi vị trí: ${label}`} {...attributes} {...listeners}>
      <GripVertical size={16} />
    </button>
  );
  return (
    <li ref={setNodeRef} className={cx('ax-sortable__item', isDragging && 'is-dragging')} style={{ transform: CSS.Transform.toString(transform), transition }}>
      {render(item, handle, { dragging: isDragging })}
    </li>
  );
}

/**
 * Danh sách kéo sắp xếp: chuột, cảm ứng (giữ 180ms) và bàn phím (Space để nhấc, mũi tên để di chuyển, Space để thả).
 * Mỗi mục cần ID ổn định; onReorder nhận mảng mới theo thứ tự.
 */
export function SortableList<T>({ items, getId, getLabel, onReorder, render, layout = 'list', className }: {
  items: T[]; getId: (item: T) => string; getLabel: (item: T) => string; onReorder: (next: T[]) => void; render: SortableItemRender<T>; layout?: 'list' | 'grid'; className?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = items.map(getId);
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    onReorder(arrayMove(items, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: { draggable: 'Nhấn Space để nhấc mục, dùng phím mũi tên để di chuyển, Space để thả, Esc để hủy.' },
        announcements: {
          onDragStart: ({ active }) => `Đã nhấc ${labelOf(active.id)}.`,
          onDragOver: ({ active, over }) => (over ? `${labelOf(active.id)} ở vị trí ${ids.indexOf(String(over.id)) + 1}.` : ''),
          onDragEnd: ({ active, over }) => (over ? `Đã thả ${labelOf(active.id)} ở vị trí ${ids.indexOf(String(over.id)) + 1}.` : ''),
          onDragCancel: ({ active }) => `Đã hủy kéo ${labelOf(active.id)}.`
        }
      }}>
      <SortableContext items={ids} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        <ul className={cx('ax-sortable', layout === 'grid' && 'ax-sortable--grid', className)}>
          {items.map(item => <SortableRow key={getId(item)} id={getId(item)} item={item} render={render} label={getLabel(item)} />)}
        </ul>
      </SortableContext>
    </DndContext>
  );
  function labelOf(id: unknown) { const it = items.find(x => getId(x) === String(id)); return it ? getLabel(it) : 'mục'; }
}

/** Bọc toàn bộ admin: chuyển động (tôn trọng giảm chuyển động), tooltip, hộp xác nhận. */
export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DUR.base, ease: EASE }}>
      <Tooltip.Provider delayDuration={250} skipDelayDuration={100}>
        <ConfirmProvider>{children}</ConfirmProvider>
      </Tooltip.Provider>
    </MotionConfig>
  );
}

/**
 * ID ổn định phía giao diện cho danh sách không có trường id trong dữ liệu (vd. mục menu, ảnh của khối).
 * Không ghi id vào dữ liệu (giữ cấu trúc cũ để bản build trước vẫn đọc được). ID đi theo mục khi kéo, thêm, xóa.
 */
export function useListIds(length: number) {
  const ref = useRef<string[]>([]);
  const make = () => 'i' + Math.random().toString(36).slice(2, 10);
  if (ref.current.length !== length) {
    ref.current = ref.current.length < length
      ? [...ref.current, ...Array.from({ length: length - ref.current.length }, make)]
      : ref.current.slice(0, length);
  }
  return {
    ids: ref.current,
    /** Ghép giá trị với id để đưa vào SortableList */
    pair: <T,>(values: T[]) => values.map((value, i) => ({ id: ref.current[i], value })),
    /** Sau khi kéo: cập nhật thứ tự id theo danh sách mới */
    reorder: <T,>(pairs: { id: string; value: T }[]) => { ref.current = pairs.map(p => p.id); return pairs.map(p => p.value); },
    remove: (index: number) => { ref.current = ref.current.filter((_, i) => i !== index); },
    insert: (index: number) => { const n = [...ref.current]; n.splice(index, 0, make()); ref.current = n; }
  };
}
