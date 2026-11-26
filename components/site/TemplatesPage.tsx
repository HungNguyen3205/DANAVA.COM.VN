/**
 * /mau-website/ — Kho mẫu website & landing page theo ngành (lấy cảm hứng kho mẫu dạng lưới, phong cách DANAVA).
 * Màn mở đầu: quạt ba ảnh mẫu xoè ra; lưới mẫu có bộ lọc (TemplateGallery); ba bước "từ mẫu tới website của bạn".
 */
import Link from 'next/link';
import { ArrowRight, Palette, PenTool, Rocket } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { publishedTemplates } from '@/lib/web-templates';
import { ct } from './cms';
import { Crumbs, CtaBand } from './ui';
import { TemplateGallery } from './TemplateGallery';

export function TemplatesPage({ data }: { data: SiteData }) {
  const T = (k: string, def: string, label: string, opts: { multiline?: boolean; rich?: boolean } = {}) => { const x = ct(data, `mau.${k}`, def, label, opts); return <span {...x.a}>{x.v}</span>; };
  const list = publishedTemplates(data);
  const demos = list.filter(t => t.kind === 'demo');
  const fan = (demos.length >= 3 ? demos : list).filter(t => t.thumb).slice(0, 3);
  const steps = [
    { icon: Palette, t: 'Chọn một mẫu', d: 'Xem demo chạy thật trên máy tính và điện thoại, chọn phong cách gần với thương hiệu của bạn.' },
    { icon: PenTool, t: 'DANAVA may đo', d: 'Thay màu, chữ, ảnh và nội dung theo ngành; thêm bớt khối theo mục tiêu bán hàng.' },
    { icon: Rocket, t: 'Lên sóng', d: 'Tên miền, SEO cơ bản, form về Zalo/email, đo lường quảng cáo. Bàn giao và hướng dẫn tự sửa.' }
  ];
  return (
    <main id="main" className="mau">
      <section className="mau-hero">
        <div className="s-container mau-hero__grid">
          <div>
            <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/thiet-ke-website/', label: 'Thiết kế website' }, { label: 'Kho mẫu' }]} />
            <p className="mau-kicker">{T('kicker', 'Kho mẫu DANAVA', 'Dòng chữ nhỏ')}</p>
            <h1 className="mau-h1">{T('title1', 'Mẫu website & landing page', 'Tiêu đề (dòng 1)')} <em>{T('title2', 'có hồn theo ngành', 'Tiêu đề (chữ nhấn)')}</em></h1>
            <p className="mau-lead">{T('lead', 'Mỗi mẫu là một hướng nghệ thuật riêng: bảng màu, cặp chữ, bố cục và chuyển động được thiết kế cho từng ngành. Xem demo chạy thật, rồi để DANAVA may đo theo thương hiệu của bạn.', 'Câu dẫn', { multiline: true })}</p>
            <div className="mau-hero__stats">
              <div><b>{demos.length}</b><span>{T('stat.art', 'mẫu nghệ thuật', 'Số liệu: mẫu')}</span></div>
              <div><b>{list.length - demos.length}</b><span>{T('stat.live', 'dự án thật đã bàn giao', 'Số liệu: dự án thật')}</span></div>
              <div><b>7</b><span>{T('stat.days', 'ngày lên sóng', 'Số liệu: ngày')}</span></div>
            </div>
          </div>
          <div className="mau-fan" aria-hidden="true">
            {fan.map((t, i) => <span key={t.id} className={`mau-fan__card mau-fan__card--${i + 1}`} style={{ backgroundImage: `url(${t.thumb})` }} />)}
            <span className="mau-fan__tag">{T('fan.tag', 'Demo chạy thật', 'Nhãn trên ảnh mẫu')}</span>
          </div>
        </div>
      </section>

      <section className="s-section mau-list" aria-labelledby="mau-list">
        <div className="s-container">
          <h2 className="s-sr" id="mau-list">{T('list.title', 'Danh sách mẫu', 'Tiêu đề ẩn danh sách mẫu')}</h2>
          <TemplateGallery />
        </div>
      </section>

      <section className="s-section mau-steps" aria-labelledby="mau-steps">
        <div className="s-container">
          <p className="mau-kicker">{T('steps.kicker', 'Từ mẫu tới website của bạn', 'Dòng chữ nhỏ (ba bước)')}</p>
          <h2 className="mau-h2" id="mau-steps">{T('steps.title', 'Ba bước, không cần biết code', 'Tiêu đề (ba bước)')}</h2>
          <ol className="mau-steps__list">
            {steps.map((s, i) => (
              <li key={s.t}>
                <span className="mau-steps__no">0{i + 1}</span>
                <s.icon aria-hidden="true" />
                <h3>{T(`steps.${i}.title`, s.t, 'Tên bước')}</h3>
                <p>{T(`steps.${i}.text`, s.d, 'Mô tả bước', { multiline: true })}</p>
              </li>
            ))}
          </ol>
          <p className="mau-steps__more"><Link href="/giai-phap/thiet-ke-website/">{T('steps.more', 'Xem dịch vụ thiết kế website', 'Liên kết dịch vụ')} <ArrowRight aria-hidden="true" /></Link></p>
        </div>
      </section>

      <CtaBand data={data}
        title={T('cta.title', 'Chưa thấy mẫu hợp ngành của bạn?', 'Dải cuối trang: tiêu đề')}
        lead={T('cta.lead', 'DANAVA thiết kế riêng từ đầu theo thương hiệu. Kể vài câu về doanh nghiệp, ANNA gửi khoảng giá tham khảo ngay.', 'Dải cuối trang: câu dẫn', { multiline: true })}
        primary={{ href: '/bao-gia-web/', label: 'Nhận báo giá landing page' }} secondary={{ href: '/du-an/', label: 'Xem dự án đã làm' }} />
    </main>
  );
}
