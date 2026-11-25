/**
 * /thiet-bi-gym/ — Thiết bị phòng gym: giá, kích thước theo nhóm (Quản trị → Giải pháp → Thiết bị phòng gym).
 * Nút "Đặt vào phòng 3D" mở phòng lab /bao-gia-setup-phong-gym/?add=<mã máy>.
 */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Box, Boxes, Ruler } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { EQUIPMENT_CATEGORIES, formatVND, type EquipmentCategory } from '@/lib/equipment';
import { CATALOG_SOURCE, publicEquipment } from '@/lib/equipment-seeds';
import { ct } from './cms';
import { Crumbs, CtaBand } from './ui';

export function EquipmentPage({ data }: { data: SiteData }) {
  const t = (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = ct(data, `equipment.${k}`, def, label, opts); return <span {...x.a}>{x.v}</span>; };
  const list = publicEquipment(data.equipment);
  const cats = (Object.keys(EQUIPMENT_CATEGORIES) as EquipmentCategory[]).filter(c => list.some(x => x.category === c));
  return (
    <main id="main" className="eqp">
      <section className="eqp-hero">
        <div className="s-container">
          <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/setup-van-hanh-phong-gym/', label: 'Setup phòng gym' }, { label: 'Thiết bị phòng gym' }]} />
          <p className="gy-kicker">{t('kicker', 'DANAVA Gym Solutions', 'Dòng chữ nhỏ')}</p>
          <h1 className="gy-h2">{t('title', 'Thiết bị phòng gym', 'Tiêu đề')}</h1>
          <p className="gy-lead">{t('lead', 'Máy chạy bộ, giàn tạ, ghế tạ và phụ kiện kèm kích thước thật. Đặt máy vào phòng lab 3D để xem bố cục và tổng chi phí cho phòng tập của bạn.', 'Câu dẫn', { multiline: true })}</p>
          <div className="eqp-actions">
            <Link className="s-btn s-btn--primary s-btn--lg" href="/bao-gia-setup-phong-gym/"><Boxes aria-hidden="true" /> {t('cta.lab', 'Mở phòng lab 3D', 'Nút')}</Link>
            <nav className="eqp-cats" aria-label="Nhóm thiết bị">{cats.map(c => <a key={c} href={`#nhom-${c}`}>{EQUIPMENT_CATEGORIES[c]}</a>)}</nav>
          </div>
          <p className="eqp-src">{list.length} thiết bị · Danh mục, giá và hình ảnh từ đối tác <a href={CATALOG_SOURCE.url} target="_blank" rel="noopener">{CATALOG_SOURCE.site}</a> (cập nhật {CATALOG_SOURCE.syncedAt.split('-').reverse().join('/')}).</p>
        </div>
      </section>

      {cats.map(c => (
        <section key={c} className="eqp-group" id={`nhom-${c}`} aria-labelledby={`eqp-${c}`}>
          <div className="s-container">
            <h2 className="eqp-group__title" id={`eqp-${c}`}>{EQUIPMENT_CATEGORIES[c]} <small>{list.filter(x => x.category === c).length} máy</small></h2>
            <ul className="eqp-grid">
              {list.filter(x => x.category === c).map(x => (
                <li key={x.id} className="eqp-card">
                  <span className="eqp-card__media" style={{ ['--c' as string]: x.color }}>
                    {x.image ? <img src={x.image} alt={x.name} loading="lazy" /> : <span className="eqp-card__box" aria-hidden="true"><Box /></span>}
                    {x.model && <span className="eqp-card__3d">3D</span>}
                  </span>
                  <div className="eqp-card__body">
                    <h3>{x.name}</h3>
                    {x.sku && <p className="eqp-card__est">Mã: {x.sku}</p>}
                    {x.description && <p>{x.description}</p>}
                    <p className="eqp-card__size"><Ruler aria-hidden="true" />{x.width} × {x.depth} × {x.height} cm{x.dimsEstimated && <span className="eqp-card__est"> (ước tính)</span>}</p>
                    <p className="eqp-card__price">{x.price ? formatVND(Number(x.price)) : <span className="eqp-card__contact">Liên hệ</span>}</p>
                    {x.category !== 'accessory' && <Link className="eqp-card__add" href={`/bao-gia-setup-phong-gym/?add=${encodeURIComponent(x.id)}`}>Đặt vào phòng 3D <ArrowRight aria-hidden="true" /></Link>}
                    {x.source && <a className="eqp-card__src" href={x.source} target="_blank" rel="noopener">Xem trên {CATALOG_SOURCE.site} <ArrowUpRight aria-hidden="true" /></a>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      {!list.length && <section className="eqp-group"><div className="s-container"><p className="gy-lead">Danh mục thiết bị đang được cập nhật.</p></div></section>}

      <CtaBand data={data} title="Cần tư vấn chọn máy cho phòng tập?" lead="DANAVA khảo sát mặt bằng, đề xuất bố cục và danh mục thiết bị phù hợp ngân sách."
        primary={{ href: '/lien-he/?service=danava-studio', label: 'Đặt lịch tư vấn setup phòng gym' }} secondary={{ href: '/giai-phap/setup-van-hanh-phong-gym/', label: 'Xem giải pháp setup' }} />
    </main>
  );
}
