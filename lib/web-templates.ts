/**
 * Kho mẫu website / landing page — trang /mau-website/, demo chạy thật ở /demo/<id>/ (components/demo/*).
 * Dữ liệu sửa được trong Quản trị → Giải pháp → Kho mẫu website (SiteData.webTemplates); trống = TEMPLATE_SEEDS.
 *  - kind 'demo': mẫu nghệ thuật có sẵn trong mã (id cố định, phải có component trong components/demo/index.ts).
 *    Quản trị viên sửa chữ, ảnh thẻ, bảng màu, ngành, thứ tự, ẩn/hiện; không xoá được (chỉ ẩn).
 *  - kind 'live': dự án thật đã bàn giao — mở trang của khách (live) và/hoặc trang case study trên website (caseHref).
 * thumb: ảnh chụp toàn trang (public/assets/mau/<id>.webp — scripts/mau-thumbs.mjs), thẻ tự cuộn khi rê chuột.
 * Chữ trên website gắn khóa rec.webTemplates.<id>.<trường> → sửa tại chỗ và dịch EN/JA như các hồ sơ khác.
 */
export const DEMO_IDS = ['son-tra-residences', 'ember-gym', 'lotus-spa', 'aurora-gala', 'may-yoga', 'studio-saas'] as const;

export const TEMPLATE_INDUSTRIES = [
  { id: 'bds', label: 'Bất động sản' }, { id: 'gym', label: 'Gym & Fitness' }, { id: 'spa', label: 'Spa & Làm đẹp' },
  { id: 'event', label: 'Sự kiện' }, { id: 'yoga', label: 'Yoga & Pilates' }, { id: 'tech', label: 'Công nghệ' },
  { id: 'food', label: 'Ẩm thực' }, { id: 'retail', label: 'Bán lẻ' }, { id: 'edu', label: 'Giáo dục' }, { id: 'other', label: 'Khác' }
] as const;
export type TemplateIndustry = (typeof TEMPLATE_INDUSTRIES)[number]['id'];

export type WebTemplate = {
  id: string;
  kind: 'demo' | 'live';
  name: string;
  /** Tên thương hiệu minh hoạ (demo) hoặc khách hàng (dự án thật) */
  brand: string;
  industryId: TemplateIndustry;
  style: string;
  /** Nhãn góc ảnh (vd. Mới, Signature); trống = không có */
  badge: string;
  desc: string;
  sections: string[];
  /** 2–6 màu #rrggbb */
  palette: string[];
  fonts: string;
  fit: string;
  thumb: string;
  /** Dự án thật: trang của khách (https://…) */
  live: string;
  /** Dự án thật: trang case study trên website (/du-an/…/); trống = mở thẳng trang của khách */
  caseHref: string;
  published: boolean;
};

export const TEMPLATE_SEEDS: WebTemplate[] = [
  {id: "son-tra-residences",kind: "demo",name: "Mẫu bất động sản nghỉ dưỡng",brand: "Sơn Trà Residences",industryId: "bds",style: "Rêu & vàng ánh kim",badge: "Signature",desc: "Màn mở đầu điện ảnh với tên dự án viết tay, dải số liệu chạy chậm, câu chuyện “một ngày ở Sơn Trà”, mặt bằng ba phân khu, chính sách bán hàng và form giữ chỗ phong thư.",sections: ["Màn mở đầu điện ảnh","Số liệu dự án","Câu chuyện một ngày","Ba phân khu","Tiện ích","Chính sách","Form giữ chỗ"],palette: ["#0f2a24","#163d34","#c9a45c","#f3ead7"],fonts: "Playfair Display · Great Vibes",fit: "Dự án nghỉ dưỡng, căn hộ cao cấp, khách sạn boutique",thumb: "/assets/mau/son-tra-residences.webp",live: "",caseHref: "",published: true},
  {id: "ember-gym",kind: "demo",name: "Mẫu phòng gym & fitness",brand: "Ember Athletic Club",industryId: "gym",style: "Than hồng",badge: "Mới",desc: "Nền than tối, chữ khổng lồ đổ bóng cam, dải chữ chạy, lịch lớp theo giờ, ba gói tập dạng vé, huấn luyện viên và form đăng ký tập thử 7 ngày.",sections: ["Màn mở đầu chữ khổng lồ","Dải chữ chạy","Bốn khu tập","Lịch lớp hôm nay","Gói tập dạng vé","Huấn luyện viên","Đăng ký tập thử"],palette: ["#0e0e10","#1b1b1f","#ff5a1f","#f5f1ea"],fonts: "Anton · Be Vietnam Pro",fit: "Phòng gym, CrossFit, HYROX, boxing, câu lạc bộ thể thao",thumb: "/assets/mau/ember-gym.webp",live: "",caseHref: "",published: true},
  {id: "lotus-spa",kind: "demo",name: "Mẫu spa & chăm sóc sắc đẹp",brand: "Hoa Sen Spa",industryId: "spa",style: "Sen ngà",badge: "",desc: "Khung vòm mềm, chữ serif nghiêng, cánh sen vẽ tay, liệu trình như thực đơn trà, nghi thức bốn bước, cảm nhận khách và đặt lịch theo khung giờ.",sections: ["Màn mở đầu khung vòm","Triết lý","Thực đơn liệu trình","Nghi thức bốn bước","Cảm nhận khách","Đặt lịch"],palette: ["#f6efe6","#ead9c6","#b5643c","#3b2a22"],fonts: "Cormorant Garamond · Great Vibes",fit: "Spa, thẩm mỹ, nail, wellness, retreat",thumb: "/assets/mau/lotus-spa.webp",live: "",caseHref: "",published: true},
  {id: "aurora-gala",kind: "demo",name: "Mẫu sự kiện & gala",brand: "Aurora Gala Night",industryId: "event",style: "Cực quang",badge: "",desc: "Nền đen ánh cực quang, đồng hồ đếm ngược, lịch trình đêm gala theo dòng thời gian, khách mời, hình ảnh sự kiện thật do DANAVA dàn dựng và form nhận thư mời.",sections: ["Màn mở đầu cực quang","Đếm ngược","Lịch trình đêm","Khách mời","Thư viện ảnh","Hạng vé","Nhận thư mời"],palette: ["#07060d","#1a1033","#8b5cf6","#22d3ee"],fonts: "Bricolage Grotesque · Playfair Display",fit: "Gala, year end party, ra mắt sản phẩm, hội nghị khách hàng",thumb: "/assets/mau/aurora-gala.webp",live: "",caseHref: "",published: true},
  {id: "may-yoga",kind: "demo",name: "Mẫu yoga & pilates",brand: "Mây Yoga Studio",industryId: "yoga",style: "Mây sớm",badge: "",desc: "Bảng màu cát và lá xô thơm, hình khối hữu cơ “thở” chậm, lớp học theo cấp độ, giáo viên, gói thẻ tập và lời mời buổi học đầu miễn phí.",sections: ["Màn mở đầu nhịp thở","Ba giá trị","Lớp theo cấp độ","Giáo viên","Thẻ tập","Câu hỏi thường gặp","Buổi học đầu"],palette: ["#efe6d8","#dfe5d6","#7d8f74","#2f3a2c"],fonts: "Fraunces · Be Vietnam Pro",fit: "Yoga, pilates, thiền, studio vận động nhẹ",thumb: "/assets/mau/may-yoga.webp",live: "",caseHref: "",published: true},
  {id: "studio-saas",kind: "demo",name: "Mẫu phần mềm SaaS",brand: "DANAVA Studio",industryId: "tech",style: "Lưới chàm",badge: "",desc: "Giao diện sản phẩm thật nghiêng 3D trên lưới chàm, dải logo, tính năng dạng bento, so sánh trước – sau, bảng giá theo tháng/năm và câu hỏi thường gặp.",sections: ["Màn mở đầu sản phẩm 3D","Số liệu","Tính năng bento","Trước & sau","Bảng giá","Câu hỏi","Dùng thử"],palette: ["#ffffff","#eef0ff","#4338ca","#0f172a"],fonts: "Bricolage Grotesque · Be Vietnam Pro",fit: "Phần mềm, ứng dụng, startup, dịch vụ số",thumb: "/assets/mau/studio-saas.webp",live: "",caseHref: "",published: true},
  {id: "vinhomes-hai-van-bay",kind: "live",name: "Landing page dự án Vinhomes Hải Vân Bay",brand: "MICC Group & NEXME",industryId: "bds",style: "Dự án thật đã bàn giao",badge: "Dự án thật",desc: "Landing page DANAVA thiết kế cho đại lý phân phối dự án Vinhomes Hải Vân Bay: chữ thư pháp, ảnh tràn viền, quỹ căn ba phân khu và popup ưu đãi cuối năm.",sections: ["Màn mở đầu thư pháp","Vị trí","Một ngày ở Hải Vân","Quỹ căn","Thư viện","Đăng ký tư vấn"],palette: ["#0d2b26","#1f4a3f","#c8a25a","#f4ecdc"],fonts: "Playfair Display · chữ viết tay",fit: "Dự án bất động sản, đại lý phân phối",thumb: "/assets/portfolio/vinhomes/desktop-hero.webp",live: "https://landingpage-micc.vercel.app/",caseHref: "/du-an/vinhomes-hai-van-bay-website/",published: true}
];

/** Danh sách đang dùng (đã lưu, hoặc mặc định) */
export const webTemplatesOf = (data: { webTemplates?: WebTemplate[] } | null | undefined): WebTemplate[] => data?.webTemplates ?? TEMPLATE_SEEDS;
export const publishedTemplates = (data: { webTemplates?: WebTemplate[] } | null | undefined) => webTemplatesOf(data).filter(t => t.published);
export const templateById = (data: { webTemplates?: WebTemplate[] } | null | undefined, id: string) => webTemplatesOf(data).find(t => t.id === id);
/** Đường dẫn khi bấm thẻ: demo → trang xem trước; dự án thật → case study (nếu có) hoặc trang của khách */
export const templateHref = (t: WebTemplate) => (t.kind === 'live' ? t.caseHref || t.live : `/mau-website/${t.id}/`);

/** Dữ liệu đã lưu → đủ mẫu demo (mẫu demo mới thêm vào mã tự xuất hiện ở cuối danh sách). */
export function normalizeTemplates(saved: WebTemplate[] | undefined): WebTemplate[] {
  if (!saved) return structuredClone(TEMPLATE_SEEDS);
  const have = new Set(saved.map(t => t.id));
  return [...saved, ...structuredClone(TEMPLATE_SEEDS.filter(t => t.kind === 'demo' && !have.has(t.id)))];
}

const IMG = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g)$/;
const s = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;

/** Câu báo lỗi cụ thể (Quản trị → Kho mẫu website) hoặc '' khi hợp lệ. */
export function webTemplatesError(list: unknown): string {
  if (!Array.isArray(list)) return 'Kho mẫu website: dữ liệu không phải danh sách.';
  if (list.length > 60) return `Kho mẫu website: có ${list.length} mẫu, tối đa 60.`;
  const ids = new Set<string>();
  for (let i = 0; i < list.length; i++) {
    const x = list[i] as Record<string, unknown>;
    const where = `Giải pháp → Kho mẫu website → «${typeof x?.name === 'string' && x.name ? x.name : `mục thứ ${i + 1}`}»`;
    if (!x || typeof x !== 'object') return `${where}: dữ liệu không hợp lệ.`;
    if (!s(x.id, 60) || !/^[a-z0-9-]+$/.test(x.id as string)) return `${where}: mã không hợp lệ.`;
    if (ids.has(x.id as string)) return `${where}: mã "${x.id}" bị trùng.`;
    ids.add(x.id as string);
    if (x.kind !== 'demo' && x.kind !== 'live') return `${where}: loại mẫu không hợp lệ.`;
    if (x.kind === 'demo' && !(DEMO_IDS as readonly string[]).includes(x.id as string)) return `${where}: mẫu demo "${x.id}" không có trong mã nguồn.`;
    if (!s(x.name, 120) || !(x.name as string).trim()) return `${where}: chưa có tên (tối đa 120 ký tự).`;
    if (!s(x.brand, 80)) return `${where}: tên thương hiệu tối đa 80 ký tự.`;
    if (!TEMPLATE_INDUSTRIES.some(t => t.id === x.industryId)) return `${where}: ngành không hợp lệ.`;
    if (!s(x.style, 60)) return `${where}: phong cách tối đa 60 ký tự.`;
    if (!s(x.badge, 24)) return `${where}: nhãn tối đa 24 ký tự.`;
    if (!s(x.desc, 600)) return `${where}: mô tả tối đa 600 ký tự.`;
    if (!Array.isArray(x.sections) || x.sections.length > 16 || !x.sections.every(v => s(v, 80))) return `${where}: tối đa 16 khối, mỗi khối tối đa 80 ký tự.`;
    if (!Array.isArray(x.palette) || x.palette.length < 2 || x.palette.length > 6 || !x.palette.every(v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v))) return `${where}: bảng màu cần 2–6 màu dạng #rrggbb.`;
    if (!s(x.fonts, 80)) return `${where}: cặp chữ tối đa 80 ký tự.`;
    if (!s(x.fit, 200)) return `${where}: "Phù hợp" tối đa 200 ký tự.`;
    if (!s(x.thumb, 250) || (x.thumb !== '' && !IMG.test(x.thumb as string))) return `${where}: ảnh thẻ phải là ảnh trong Thư viện ảnh (/assets/…).`;
    if (!s(x.live, 300) || (x.live !== '' && !/^https:\/\/[^\s"'<>]+$/.test(x.live as string))) return `${where}: link trang thật phải là https://…`;
    if (!s(x.caseHref, 200) || (x.caseHref !== '' && !/^\/[a-z0-9/-]*$/.test(x.caseHref as string))) return `${where}: trang dự án trên website phải dạng /du-an/ten-du-an/.`;
    if (x.kind === 'live' && !x.live && !x.caseHref) return `${where}: dự án thật cần link trang thật hoặc trang dự án trên website.`;
    if (typeof x.published !== 'boolean') return `${where}: trạng thái hiển thị không hợp lệ.`;
  }
  return '';
}
