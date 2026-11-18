'use client';
/**
 * /giai-phap/digital-marketing/ — trình bày dạng "một cú máy liền mạch".
 * Toàn bộ nội dung lấy từ DANAVA Company Profile 2026 (bản Canva) + nội dung dịch vụ đã có trên website.
 *
 * Cơ chế: một khối cuộn cao (.cine) chứa "sân khấu" sticky cao đúng một màn hình.
 * Mỗi cảnh (scene) chiếm một quãng cuộn; JS chỉ ghi các biến CSS:
 *   --g  tiến độ toàn phim (0→1) trên .cine
 *   --p  tiến độ cục bộ của cảnh (âm khi đang vào, >1 khi đang ra)
 *   --o  độ hiện của cảnh (giao thoa giữa hai cảnh)
 * Mọi chuyển động camera (đi xuống, đẩy qua, parallax) đều do CSS tính từ các biến này.
 * Không JS hoặc bật "giảm chuyển động" → các cảnh xếp dọc như trang bình thường.
 */
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Phone, Mail, AtSign, Globe, ArrowDown, Send, Mic2, Megaphone, Speaker, Music4,
  Camera, Users, Target, Lightbulb, Hammer, Cpu, Sparkles
} from 'lucide-react';

const P = '/assets/profile/';
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type Project = {
  id: string; title: string; place?: string; note?: string; caption?: { title: string; text: string };
  hero: string; shots: string[]; alt: string;
};

const PROJECTS: Project[] = [
  { id: 'ariyana', title: 'Booth sự kiện tại Ariyana', place: 'Ariyana', caption: { title: 'Thi công booth & không gian trưng bày', text: 'Hệ vách, nội dung sản phẩm và ánh sáng được kết hợp trong cùng không gian giới thiệu.' }, hero: 'ariyana-booth', shots: ['ariyana-build'], alt: 'Booth trưng bày tại Ariyana' },
  { id: 'phim-truong', title: 'Đạo cụ phim trường', place: 'Nhà hát Trưng Vương', hero: 'set-stage', shots: ['set-train', 'set-rocket'], alt: 'Sân khấu và đạo cụ phim trường tại Nhà hát Trưng Vương' },
  { id: 'pnj', title: 'Kick-off PNJ tại Aeon Mall', place: 'Aeon Mall Huế', hero: 'pnj-2', shots: ['pnj-1', 'pnj-3', 'pnj-4'], alt: 'Sự kiện kick-off PNJ tại Aeon Mall Huế' },
  { id: 'highlands', title: 'Sự kiện Đêm Trăng Rằm Highlands', place: 'Highlands đường Bạch Đằng', hero: 'highlands-1', shots: ['highlands-3', 'highlands-2', 'highlands-4'], alt: 'Trang trí Đêm Trăng Rằm tại Highlands Bạch Đằng' },
  { id: 'water-run', title: 'Hội thi Water Run – Revive', place: 'Công viên Biển Đông', hero: 'waterrun-3', shots: ['waterrun-1', 'waterrun-4', 'waterrun-2'], alt: 'Hội thi Water Run của Revive tại Công viên Biển Đông' },
  { id: 'lutech', title: 'LUTECH', note: 'Kỷ niệm 4 năm với chủ đề “Tap to TOP”.', hero: 'lutech-4', shots: ['lutech-1', 'lutech-2', 'lutech-3'], alt: 'Lễ kỷ niệm 4 năm LUTECH' },
  { id: 'cbd', title: 'CBD – Team Building', hero: 'cbd-2', shots: ['cbd-1'], alt: 'Chương trình team building của CBD' },
  { id: 'everlastify', title: 'EVERLASTIFY', note: 'Trang trí thương hiệu và không gian theo chủ đề.', hero: 'everlastify-1', shots: ['everlastify-2', 'everlastify-8', 'everlastify-6', 'everlastify-4'], alt: 'Trang trí không gian thương hiệu Everlastify' }
];

const SERVICES = [
  { icon: Mic2, title: 'Tổ chức sự kiện', text: 'Lễ ra mắt sản phẩm, họp báo, sự kiện triển lãm, tổ chức trưng bày sản phẩm, lễ kỷ niệm, gala dinner…', tone: 'blue' },
  { icon: Megaphone, title: 'Truyền thông', text: 'Roadshow, Activation, Sampling, tư vấn chiến lược truyền thông, truyền thông thương hiệu, truyền thông đa phương tiện…', tone: 'light' },
  { icon: Speaker, title: 'Thiết bị sự kiện', text: 'Thiết bị âm thanh ánh sáng, màn hình LED, thiết bị dịch đa ngôn ngữ, các ấn phẩm truyền thông như backdrop, standee…', tone: 'light' },
  { icon: Music4, title: 'Giải trí', text: 'MC, DJ, ca sĩ, band nhạc, PG-PB, vũ đoàn…', tone: 'orange' }
];

const VALUES = [
  { n: '01', title: 'Giá trị cốt lõi', text: 'Con người là nền tảng. Sáng tạo và cải tiến định hướng cách làm. Danava đề cao sự tận tâm, tinh thần hợp tác và trách nhiệm trong từng chương trình.' },
  { n: '02', title: 'Sứ mệnh', text: 'Kết nối ý tưởng với nguồn lực thực hiện, đồng hành cùng doanh nghiệp tạo nên những sự kiện chỉn chu, giàu trải nghiệm và mang giá trị cho khách hàng, đối tác, cộng đồng.' },
  { n: '03', title: 'Tầm nhìn', text: 'Phát triển thành đối tác sự kiện và truyền thông đáng tin cậy, không ngừng ứng dụng công nghệ, nâng cao năng lực sáng tạo và chất lượng triển khai.' }
];

const WHO = [
  { icon: Lightbulb, text: 'Lên ý tưởng và kế hoạch tổ chức.' },
  { icon: Hammer, text: 'Thiết kế, thi công booth, backdrop, đạo cụ và không gian sự kiện.' },
  { icon: Cpu, text: 'Phối hợp thiết bị, nhân sự kỹ thuật và nhân sự biểu diễn.' },
  { icon: Sparkles, text: 'Kết nối truyền thông với trải nghiệm thương hiệu.' }
];

const DIGITAL = [
  { icon: Camera, title: 'Nhận diện & sản xuất nội dung', text: 'Quay phim, chụp ảnh trực tiếp tại cơ sở, thiết kế ấn phẩm và hình ảnh thương hiệu nhất quán.' },
  { icon: Users, title: 'Vận hành kênh & cộng đồng', text: 'Chăm sóc Fanpage, Zalo OA theo lịch biên tập, giữ nhịp tương tác đều đặn.' },
  { icon: Target, title: 'Quảng cáo & khách hàng tiềm năng', text: 'Chiến dịch Meta/Google cho khu vực của bạn, kết nối với form để không bỏ sót khách hàng.' }
];

/* ------------------------------------------------------------------ */

type SceneDef = { id: string; label: string; len: number };

function Scene({ def, children, className = '' }: { def: SceneDef; children: ReactNode; className?: string }) {
  return (
    <section className={`cine-scene ${className}`} data-scene={def.id} data-len={def.len} aria-label={def.label}>
      {children}
    </section>
  );
}

const step = (s: number): CSSProperties => ({ ['--s' as string]: s });
const depth = (z: number): CSSProperties => ({ ['--z' as string]: z });
const img = (name: string) => `${P}${name}.webp`;

export function MarketingFilm({ title, contactHref, cta, phone, phoneLabel, email }: {
  title: string; contactHref: string; cta: string; phone: string; phoneLabel: string; email: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [hud, setHud] = useState({ i: 0, tc: '00:00:00:00' });

  const scenes: SceneDef[] = [
    { id: 'mo-dau', label: 'Mở đầu', len: 1.4 },
    { id: 've-danava', label: 'Về Danava', len: 1.5 },
    { id: 'dinh-huong', label: 'Định hướng', len: 1.5 },
    { id: 'dich-vu', label: 'Dịch vụ', len: 1.5 },
    { id: 'truyen-thong-so', label: 'Truyền thông số', len: 1.3 },
    { id: 'noi-bat', label: 'Chương trình nổi bật', len: 1.1 },
    ...PROJECTS.map(p => ({ id: p.id, label: p.title, len: 1.25 })),
    { id: 'lien-he', label: 'Liên hệ', len: 1.3 }
  ];
  const total = scenes.reduce((a, s) => a + s.len, 0);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setLive(true);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!live || !el) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('.cine-scene'));
    const starts: number[] = [];
    let acc = 0;
    for (const s of scenes) { starts.push(acc); acc += s.len; }
    const F = 0.38; // độ dài vùng giao thoa (đơn vị: chiều cao màn hình)
    let raf = 0, lastI = -1, lastTc = '';

    const frame = () => {
      raf = 0;
      const stage = el.querySelector<HTMLElement>('.cine-stage')!;
      const vh = stage.clientHeight || window.innerHeight;
      // offsetTop của phần tử sticky = quãng đã cuộn bên trong khối phim
      const t = Math.min(total, Math.max(0, stage.offsetTop / vh));
      el.style.setProperty('--g', (t / total).toFixed(4));
      // Đang trong phim → ẩn thanh hành động nổi trên mobile để khung hình sạch
      document.documentElement.classList.toggle('is-cine', el.getBoundingClientRect().bottom > window.innerHeight * 0.6);
      let best = 0, bestO = -1;
      nodes.forEach((n, i) => {
        const s = starts[i], L = scenes[i].len;
        const p = (t - s) / L;
        const fin = i === 0 ? 1 : clamp((t - (s - F / 2)) / F);
        const fout = i === nodes.length - 1 ? 1 : clamp((s + L + F / 2 - t) / F);
        const o = Math.min(fin, fout);
        n.style.setProperty('--p', p.toFixed(4));
        n.style.setProperty('--o', o.toFixed(3));
        const on = o > 0.002;
        n.classList.toggle('is-on', on);
        if (o >= 0.5) { n.removeAttribute('inert'); n.removeAttribute('aria-hidden'); }
        else { n.setAttribute('inert', ''); n.setAttribute('aria-hidden', 'true'); }
        if (o > bestO) { bestO = o; best = i; }
      });
      // Chỉ dựng cảnh hiện tại và hai cảnh kề bên — ảnh tải dần theo tiến độ phim
      nodes.forEach((n, i) => n.classList.toggle('is-near', Math.abs(i - best) <= 1));
      // Timecode 24 khung/giây — mỗi màn hình cuộn ≈ 4 giây phim
      const secs = t * 4, f = Math.floor((secs % 1) * 24);
      const tc = `00:${pad(Math.floor(secs / 60))}:${pad(Math.floor(secs % 60))}:${pad(f)}`;
      if (best !== lastI || tc !== lastTc) { lastI = best; lastTc = tc; setHud({ i: best, tc }); }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    return () => { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); cancelAnimationFrame(raf); document.documentElement.classList.remove('is-cine'); };
    // scenes/total cố định theo dữ liệu tĩnh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const jump = (i: number) => {
    const el = root.current; if (!el) return;
    const stage = el.querySelector<HTMLElement>('.cine-stage')!;
    const vh = stage.clientHeight, top = parseFloat(getComputedStyle(stage).top) || 0;
    const s = scenes.slice(0, i).reduce((a, x) => a + x.len, 0) + scenes[i].len * 0.35;
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - top + s * vh, behavior: 'smooth' });
  };

  const sc = (id: string) => scenes.find(s => s.id === id)!;
  let shotNo = 0;

  return (
    <div ref={root} className={`cine${live ? ' is-live' : ''}`} style={{ ['--total' as string]: total }}>
      <div className="cine-stage">
        {/* ---- Thế giới nền: trời đêm, thành phố, dải lụa cam ---- */}
        <div className="cine-world" aria-hidden="true">
          <div className="cine-sky" />
          <div className="cine-city" style={{ backgroundImage: `url(${img('city')})` }} />
          <div className="cine-dust" />
          <svg className="cine-ribbon" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="cine-rb-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffd9a8" /><stop offset=".55" stopColor="#f5a20a" /><stop offset="1" stopColor="#f08a1c" />
              </linearGradient>
            </defs>
            <path className="cine-ribbon__a" pathLength={1} d="M-80 120 C 260 -40, 520 360, 380 560 S 520 980, 1080 860" />
            <path className="cine-ribbon__b" pathLength={1} d="M1080 80 C 760 160, 900 460, 640 600 S 140 760, -80 1040" />
          </svg>
        </div>

        <div className="cine-scenes">
          {/* 01 — Mở đầu */}
          <Scene def={sc('mo-dau')} className="cine-open">
            <div className="cine-pad cine-open__inner">
              <p className="cine-kicker" style={step(-0.3)}>Company Profile 2026 · {title}</p>
              <h1 className="cine-title" style={step(-0.3)}>
                <span className="cine-line"><span>DANAVA</span></span>
                <span className="cine-line"><span>Solutions</span></span>
              </h1>
              <p className="cine-sub" style={step(-0.3)}>Hồ sơ năng lực tổ chức sự kiện & truyền thông</p>
              <p className="cine-motto" style={step(-0.3)}><span>Cùng bạn phát triển</span></p>
              <span className="cine-cue" aria-hidden="true"><ArrowDown />Cuộn để bắt đầu</span>
            </div>
          </Scene>

          {/* 02 — Về Danava */}
          <Scene def={sc('ve-danava')} className="cine-who">
            <div className="cine-pad cine-split">
              <div className="cine-copy">
                <p className="cine-eyebrow" style={step(0)}>Who we are?</p>
                <h2 className="cine-h2" style={step(0.05)}>Danava kết nối <em>ý tưởng</em>, <em>nguồn lực</em> và <em>triển khai</em> để tạo nên những sự kiện mang dấu ấn riêng của doanh nghiệp.</h2>
                <p className="cine-text" style={step(0.18)}>Chúng tôi đồng hành cùng khách hàng trong từng hạng mục:</p>
                <ul className="cine-ticks">
                  {WHO.map((w, i) => <li key={w.text} style={step(0.24 + i * 0.07)}><w.icon aria-hidden="true" />{w.text}</li>)}
                </ul>
              </div>
              <div className="cine-reel" aria-hidden="true">
                <div className="cine-reel__track">
                  {['who-stage', 'who-gala', 'who-team', 'who-stage', 'who-gala'].map((n, i) => (
                    <figure key={i} className="cine-reel__frame"><img src={img(n)} alt="" loading="lazy" /></figure>
                  ))}
                </div>
              </div>
            </div>
          </Scene>

          {/* 03 — Định hướng phát triển */}
          <Scene def={sc('dinh-huong')} className="cine-values">
            <div className="cine-pad">
              <p className="cine-eyebrow" style={step(0)}>Định hướng phát triển</p>
              <h2 className="cine-h2 cine-h2--xl" style={step(0.04)}>Ba điều <em>dẫn đường</em> cho mỗi chương trình</h2>
              <ol className="cine-values__list">
                {VALUES.map((v, i) => (
                  <li key={v.n} style={{ ...step(0.14 + i * 0.13), ...depth(i * 4) }}>
                    <span className="cine-values__n">{v.n}</span>
                    <div>
                      <h3>{v.title}</h3>
                      <p>{v.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Scene>

          {/* 04 — Dịch vụ */}
          <Scene def={sc('dich-vu')} className="cine-services">
            <div className="cine-pad">
              <p className="cine-eyebrow" style={step(0)}>Dịch vụ của chúng tôi</p>
              <h2 className="cine-h2 cine-h2--xl" style={step(0.04)}>Từ ý tưởng đến <em>khoảnh khắc</em> trên sân khấu</h2>
              <div className="cine-services__grid">
                {SERVICES.map((s, i) => (
                  <article key={s.title} className={`cine-svc cine-svc--${s.tone}`} style={{ ...step(0.12 + i * 0.08), ...depth((i % 2 ? 6 : -4)) }}>
                    <span className="cine-svc__icon"><s.icon aria-hidden="true" /></span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </Scene>

          {/* 05 — Truyền thông số */}
          <Scene def={sc('truyen-thong-so')} className="cine-digital">
            <div className="cine-pad">
              <p className="cine-eyebrow" style={step(0)}>Marketing</p>
              <h2 className="cine-h2 cine-h2--xl" style={step(0.04)}>Sự kiện kết thúc, <em>câu chuyện</em> vẫn tiếp tục trên mạng</h2>
              <p className="cine-text cine-text--center" style={step(0.1)}>Hình ảnh, video từ chương trình trở thành nội dung; kênh số giữ nhịp với khách hàng; quảng cáo đưa thương hiệu đến đúng người.</p>
              <div className="cine-digital__grid">
                {DIGITAL.map((d, i) => (
                  <article key={d.title} className="cine-dg" style={{ ...step(0.18 + i * 0.09), ...depth(i * 3) }}>
                    <span className="cine-dg__icon"><d.icon aria-hidden="true" /></span>
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </Scene>

          {/* 06 — Màn mở: Những chương trình nổi bật */}
          <Scene def={sc('noi-bat')} className="cine-iris">
            <div className="cine-iris__disc" aria-hidden="true" />
            <span className="cine-iris__dot cine-iris__dot--a" aria-hidden="true" />
            <span className="cine-iris__dot cine-iris__dot--b" aria-hidden="true" />
            <h2 className="cine-iris__title">Những chương trình<br />nổi bật</h2>
          </Scene>

          {/* 07…14 — Từng chương trình */}
          {PROJECTS.map((p, idx) => {
            shotNo++;
            return (
              <Scene key={p.id} def={sc(p.id)} className={`cine-proj cine-proj--${idx % 2 ? 'r' : 'l'}`}>
                <div className="cine-proj__hero" aria-hidden="true">
                  <img src={img(p.hero)} alt="" loading="lazy" />
                </div>
                <div className="cine-pad cine-proj__inner">
                  <div className="cine-proj__copy">
                    <p className="cine-proj__no" style={step(0)}>Chương trình {pad(shotNo)} / {pad(PROJECTS.length)}</p>
                    <h3 className="cine-proj__title" style={step(0.04)}>{p.title}</h3>
                    {p.place && <p className="cine-proj__meta" style={step(0.1)}>Địa điểm: {p.place}</p>}
                    {p.note && <p className="cine-proj__meta" style={step(0.1)}>{p.note}</p>}
                    {p.caption && (
                      <div className="cine-proj__cap" style={step(0.16)}>
                        <b>{p.caption.title}</b>
                        <span>{p.caption.text}</span>
                      </div>
                    )}
                  </div>
                  <div className="cine-proj__shots">
                    {p.shots.slice(0, 3).map((s, i) => (
                      <figure key={s} className={`cine-shot cine-shot--${i}`} style={{ ...step(0.1 + i * 0.08), ...depth(8 + i * 7) }}>
                        <img src={img(s)} alt={`${p.alt} — ảnh ${i + 2}`} loading="lazy" />
                      </figure>
                    ))}
                  </div>
                </div>
                <span className="cine-sr">{p.alt}</span>
              </Scene>
            );
          })}

          {/* 15 — Liên hệ / credits */}
          <Scene def={sc('lien-he')} className="cine-end">
            <div className="cine-pad cine-end__inner">
              <p className="cine-kicker" style={step(0)}>Company Profile 2026</p>
              <h2 className="cine-title cine-title--end" style={step(0.04)}>
                <span className="cine-line"><span>Cùng bạn</span></span>
                <span className="cine-line"><span><em>phát triển.</em></span></span>
              </h2>
              <p className="cine-text cine-text--center" style={step(0.12)}>Kể cho chúng tôi nghe về chương trình hay thương hiệu của bạn. DANAVA sẽ cùng bạn viết phần tiếp theo.</p>
              <div className="cine-end__cta" style={step(0.18)}>
                <Link className="s-btn s-btn--primary s-btn--lg" href={contactHref}>{cta}<Send aria-hidden="true" /></Link>
                <a className="s-btn s-btn--lg cine-btn-ghost" href={`tel:${phone}`}><Phone aria-hidden="true" />{phoneLabel}</a>
              </div>
              <ul className="cine-credits" style={step(0.24)}>
                <li><Mail aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></li>
                <li><AtSign aria-hidden="true" />danavasolutions</li>
                <li><Globe aria-hidden="true" /><a href="https://danava.vn" target="_blank" rel="noopener noreferrer">www.danava.vn</a></li>
              </ul>
            </div>
          </Scene>
        </div>

        {/* ---- Lớp "ống kính": letterbox, hạt phim, viền tối, HUD ---- */}
        <div className="cine-lens" aria-hidden="true">
          <span className="cine-bar cine-bar--t" />
          <span className="cine-bar cine-bar--b" />
          <span className="cine-grain" />
          <span className="cine-vignette" />
          <div className="cine-hud">
            <span className="cine-hud__rec"><i />REC</span>
            <span className="cine-hud__scene">SC.{pad(hud.i + 1)} — {scenes[hud.i]?.label}</span>
            <span className="cine-hud__tc">{hud.tc}</span>
          </div>
          <span className="cine-frame cine-frame--tl" /><span className="cine-frame cine-frame--tr" />
          <span className="cine-frame cine-frame--bl" /><span className="cine-frame cine-frame--br" />
        </div>
        {live && (
          <nav className="cine-rail" aria-label="Các cảnh">
            <span className="cine-rail__fill" aria-hidden="true" />
            {scenes.map((s, i) => (
              <button key={s.id} type="button" className={i === hud.i ? 'is-current' : ''} onClick={() => jump(i)} aria-label={`Cảnh ${i + 1}: ${s.label}`} aria-current={i === hud.i ? 'step' : undefined}>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

function clamp(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function pad(n: number) { return String(n).padStart(2, '0'); }
