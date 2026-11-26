/**
 * /giai-phap/setup-van-hanh-phong-gym/ — DANAVA Gym Solutions: setup và tự động hóa vận hành phòng gym.
 * Nội dung theo bản giới thiệu dịch vụ (danava-gym-solutions, 25/11/2026). Chữ sửa trực tiếp được (khóa gym.*).
 * Nút "Vào setup phòng tập của bạn" mở phòng lab 3D (/bao-gia-setup-phong-gym/).
 */
import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Boxes, CalendarCheck, ClipboardList, Dumbbell, LineChart, MapPinned, Megaphone, Phone, QrCode,
  Rocket, Ruler, Search, Smartphone, Sparkles, Store, UserPlus, Users
} from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { CONTACT } from '@/lib/company';
import { ct } from './cms';
import { rich } from './rich';
import { Crumbs, CtaBand } from './ui';
import { formatPhone } from './catalog';

const CONSULT = '/lien-he/?service=danava-studio';
/** Sàn 7×7 thu nhỏ: ô có máy (o = cardio cam, b = sức mạnh xanh, y = tạ vàng) */
const ISO_MACHINES: Record<number, string> = { 8: 'o', 9: 'o', 15: 'o', 16: 'o', 12: 'b', 19: 'b', 26: 'b', 31: 'y', 32: 'y', 38: 'y', 39: 'y', 44: 'o' };
const LAB = '/bao-gia-setup-phong-gym/';

export function GymSolutionsPage({ data }: { data: SiteData }) {
  const t = (k: string, def: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}) => ct(data, `gym.${k}`, def, label, opts);
  const T = (k: string, def: string, label: string, opts: { multiline?: boolean } = {}) => { const x = t(k, def, label, opts); return <span {...x.a}>{x.v}</span>; };
  const phone = data.phone || CONTACT.phone;
  const tel = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const h1 = t('hero.title', 'Giải pháp setup và *tự động hóa vận hành* phòng gym', 'Tiêu đề chính', { rich: true });

  const pillars = [
    { icon: Store, k: 'setup', title: 'Setup phòng gym', lead: 'Chuẩn bị mô hình, không gian và đội ngũ trước ngày mở cửa.',
      items: ['Khảo sát mặt bằng, khách hàng mục tiêu và ngân sách', 'Đề xuất layout, thiết bị và phương án triển khai cùng đối tác', 'Bảng giá hội viên, gói PT và kế hoạch khai trương'] },
    { icon: Smartphone, k: 'ops', title: 'Vận hành & tự động hóa', lead: 'Chuẩn hóa công việc lễ tân, kinh doanh và huấn luyện viên trên DANAVA Studio.',
      items: ['Quản lý hội viên, gói tập, lớp và lịch PT', 'App hội viên mang thương hiệu phòng tập: đặt lịch, check-in QR', 'Nhắc gia hạn, theo dõi doanh thu và lượt tập'] },
    { icon: Megaphone, k: 'growth', title: 'Truyền thông & bán hàng', lead: 'Đưa khách từ lần đầu biết đến phòng tập tới buổi tập thử.',
      items: ['Landing page, Google Maps, hình ảnh và video thật', 'Nội dung Facebook, TikTok, Zalo và quảng cáo khu vực', 'Quản lý khách tiềm năng (CRM) từ lịch hẹn đến chốt gói'] }
  ];
  const journey = [
    { icon: UserPlus, k: 'j1', title: 'Tiếp nhận khách đăng ký', text: 'Kinh doanh nhận khách trên CRM và hẹn buổi tập thử.' },
    { icon: BadgeCheck, k: 'j2', title: 'Kích hoạt gói tập', text: 'Lễ tân ghi nhận giao dịch và hướng dẫn hội viên dùng app.' },
    { icon: QrCode, k: 'j3', title: 'Đặt lịch và check-in', text: 'Hội viên chọn khung giờ và check-in bằng mã QR.' },
    { icon: CalendarCheck, k: 'j4', title: 'Nhắc gia hạn', text: 'App nhắc hội viên; nhân viên theo dõi gói sắp hết hạn.' }
  ];
  const process = [
    { icon: Search, k: 'p1', title: 'Khảo sát', text: 'Hiện trạng, mục tiêu và ngân sách của phòng tập.' },
    { icon: ClipboardList, k: 'p2', title: 'Chốt phương án', text: 'Phạm vi, chi phí và các mốc bàn giao.' },
    { icon: Rocket, k: 'p3', title: 'Triển khai', text: 'Setup, cấu hình DANAVA Studio, đào tạo và truyền thông.' },
    { icon: LineChart, k: 'p4', title: 'Theo dõi', text: 'Lượt tập thử, gói đã bán, lượt tập và tỉ lệ gia hạn.' }
  ];
  const labSteps = [
    { icon: Ruler, k: 'l1', text: 'Nhập diện tích phòng' },
    { icon: Boxes, k: 'l2', text: 'Chỉnh ô gạch sàn' },
    { icon: Dumbbell, k: 'l3', text: 'Kéo thả máy móc' },
    { icon: Sparkles, k: 'l4', text: 'Xem tổng chi phí' }
  ];

  return (
    <main id="main" className="gy">
      {/* ===== Hero ===== */}
      <section className="gy-hero" aria-labelledby="gy-title">
        <div className="s-container">
          <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/giai-phap/', label: 'Giải pháp' }, { label: 'Setup & vận hành phòng gym' }]} />
          <div className="gy-hero__grid">
            <div className="gy-hero__text">
              <p className="gy-chip"><Dumbbell aria-hidden="true" />{T('hero.brand', 'DANAVA Gym Solutions', 'Tên thương hiệu')}</p>
              <h1 className="gy-hero__title" id="gy-title" {...h1.a}>{rich(h1.v)}</h1>
              <p className="gy-hero__sub">{T('hero.sub', 'Setup phòng gym. Tự động hóa vận hành.', 'Dòng phụ')}</p>
              <p className="gy-hero__lead">{T('hero.lead', 'DANAVA đồng hành từ khảo sát mặt bằng, chuẩn bị khai trương đến quản lý hội viên, truyền thông và gia hạn, để chủ phòng tập tập trung vào khách hàng.', 'Câu dẫn', { multiline: true })}</p>
              <div className="gy-hero__actions">
                <Link className="s-btn s-btn--primary s-btn--lg" href={CONSULT}>{T('cta.primary', 'Đặt lịch tư vấn setup phòng gym', 'Nút chính')} <ArrowRight aria-hidden="true" /></Link>
                <Link className="gy-btn-3d" href={LAB}><Boxes aria-hidden="true" />{T('cta.lab', 'Vào setup phòng tập của bạn', 'Nút phòng lab 3D')}</Link>
              </div>
              <a className="gy-hero__call" href={tel}><Phone aria-hidden="true" />{T('hero.call', 'Gọi tư vấn', 'Nhãn gọi')} <b>{formatPhone(phone)}</b></a>
            </div>

            {/* Sàn phòng tập isometric thu nhỏ: gợi ý phòng lab 3D */}
            <Link className="gy-iso" href={LAB} aria-label="Mở phòng lab 3D để tự setup phòng tập">
              <span className="gy-iso__floor" aria-hidden="true">
                {Array.from({ length: 49 }, (_, i) => <i key={i} className={ISO_MACHINES[i] ? `gy-iso__m gy-iso__m--${ISO_MACHINES[i]}` : undefined} />)}
              </span>
              <span className="gy-iso__tag"><Sparkles aria-hidden="true" />{T('hero.iso-tag', 'Thử setup phòng tập 3D', 'Nhãn mô hình')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Ba trụ cột ===== */}
      <section className="gy-sec" aria-labelledby="gy-pillars">
        <div className="s-container">
          <p className="gy-kicker">{T('pillars.kicker', 'Trọn gói', 'Dòng chữ nhỏ')}</p>
          <h2 className="gy-h2" id="gy-pillars">{T('pillars.title', 'Từ mặt bằng đến hội viên đầu tiên', 'Tiêu đề')}</h2>
          <p className="gy-lead">{T('pillars.lead', 'Dành cho chủ đầu tư chuẩn bị mở phòng tập, phòng gym đang vận hành và đơn vị muốn nhân rộng mô hình.', 'Câu dẫn', { multiline: true })}</p>
          <div className="gy-pillars">
            {pillars.map((p, i) => (
              <article key={p.k} className="gy-pillar" style={{ ['--i' as string]: i }}>
                <span className="gy-pillar__icon"><p.icon aria-hidden="true" /></span>
                <span className="gy-pillar__no">0{i + 1}</span>
                <h3>{T(`pillars.${p.k}.title`, p.title, 'Tên trụ cột')}</h3>
                <p>{T(`pillars.${p.k}.lead`, p.lead, 'Mô tả trụ cột', { multiline: true })}</p>
                <ul>{p.items.map((it, j) => <li key={j}><BadgeCheck aria-hidden="true" />{T(`pillars.${p.k}.${j}`, it, 'Hạng mục')}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Phòng lab 3D ===== */}
      <section className="gy-lab" aria-labelledby="gy-lab-title">
        <div className="s-container">
          <div className="gy-lab__card">
            <div>
              <p className="gy-kicker gy-kicker--light"><Sparkles aria-hidden="true" />{T('lab.kicker', 'Phòng lab 3D', 'Dòng chữ nhỏ')}</p>
              <h2 className="gy-h2 gy-h2--light" id="gy-lab-title">{T('lab.title', 'Tự setup phòng tập của bạn trong 3D', 'Tiêu đề')}</h2>
              <p className="gy-lab__lead">{T('lab.lead', 'Nhập diện tích, chọn kích thước ô gạch, kéo thả máy móc vào phòng và xem tổng chi phí thiết bị ngay bên dưới. Gửi bản thiết kế cho DANAVA để nhận báo giá chính thức.', 'Câu dẫn', { multiline: true })}</p>
              <ol className="gy-lab__steps">
                {labSteps.map((s, i) => <li key={s.k}><span className="gy-lab__ico"><s.icon aria-hidden="true" /></span><b>{i + 1}</b><span className="gy-lab__txt">{T(`lab.${s.k}`, s.text, 'Bước')}</span></li>)}
              </ol>
              <Link className="s-btn s-btn--primary s-btn--lg" href={LAB}>{T('lab.cta', 'Vào setup phòng tập của bạn', 'Nút')} <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="gy-lab__visual" aria-hidden="true">
              <span className="gy-lab__room">{Array.from({ length: 64 }, (_, i) => <i key={i} />)}</span>
              <span className="gy-lab__price"><small>Tổng chi phí thiết bị</small><b>Tính theo máy bạn chọn</b></span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Hành trình hội viên trên DANAVA Studio ===== */}
      <section className="gy-sec gy-sec--soft" aria-labelledby="gy-journey">
        <div className="s-container gy-journey">
          <div>
            <p className="gy-kicker">{T('journey.kicker', 'DANAVA Studio', 'Dòng chữ nhỏ')}</p>
            <h2 className="gy-h2" id="gy-journey">{T('journey.title', 'Một hệ thống cho cả hành trình hội viên', 'Tiêu đề')}</h2>
            <p className="gy-lead">{T('journey.lead', 'Chủ phòng tập theo dõi khách từ lúc đăng ký tập thử đến khi gia hạn. Hội viên đặt lịch và xem gói tập ngay trên app của phòng tập.', 'Câu dẫn', { multiline: true })}</p>
            <Link className="gy-link" href="/giai-phap/danava-studio/">{T('journey.link', 'Xem DANAVA Studio', 'Liên kết')} <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ol className="gy-timeline">
            {journey.map((j, i) => (
              <li key={j.k}>
                <span className="gy-timeline__dot"><j.icon aria-hidden="true" /></span>
                <div><b>{i + 1}. {T(`journey.${j.k}.title`, j.title, 'Bước')}</b><p>{T(`journey.${j.k}.text`, j.text, 'Mô tả bước', { multiline: true })}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Quy trình triển khai ===== */}
      <section className="gy-sec" aria-labelledby="gy-process">
        <div className="s-container">
          <p className="gy-kicker">{T('process.kicker', 'Quy trình', 'Dòng chữ nhỏ')}</p>
          <h2 className="gy-h2" id="gy-process">{T('process.title', 'Quy trình triển khai cùng DANAVA', 'Tiêu đề')}</h2>
          <ol className="gy-process">
            {process.map((p, i) => (
              <li key={p.k} style={{ ['--i' as string]: i }}>
                <span className="gy-process__no" aria-hidden="true">0{i + 1}</span>
                <div className="gy-process__card">
                  <span className="gy-process__icon"><p.icon aria-hidden="true" /></span>
                  <small className="gy-process__step">{T('process.step', 'Bước', 'Chữ trước số bước')} {i + 1}</small>
                  <b>{T(`process.${p.k}.title`, p.title, 'Bước')}</b>
                  <p>{T(`process.${p.k}.text`, p.text, 'Mô tả bước', { multiline: true })}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="gy-note"><MapPinned aria-hidden="true" /><Users aria-hidden="true" />{T('process.note', 'Đội ngũ DANAVA tại Đà Nẵng, hỗ trợ trực tiếp và từ xa.', 'Ghi chú')}</p>
        </div>
      </section>

      <CtaBand data={data} title={T('cta.title', 'Cùng bạn phát triển', 'Dải cuối trang: tiêu đề')} lead={T('cta.lead', 'Trao đổi với DANAVA về kế hoạch mở mới hoặc nâng cấp phòng tập của bạn.', 'Dải cuối trang: câu dẫn', { multiline: true })}
        primary={{ href: CONSULT, label: 'Đặt lịch tư vấn setup phòng gym' }} secondary={{ href: LAB, label: 'Setup phòng tập 3D' }} />
    </main>
  );
}
