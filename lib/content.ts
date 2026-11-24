import { legacyCatalog } from './legacy-catalog.ts';
import { verifiedProjects } from './verified-projects.ts';
import { defaultPresentation, type Presentation } from './presentation.ts';
import { validBlocks, validCareers, validExtras, type Blocks, type BlockDefaults, type Extras } from './blocks.ts';
import { okImage, okLink, validPageBlock, type PageBlock } from './page-blocks.ts';
import { HOME_HERO_LIMITS, type HomeHero } from './home-hero.ts';

/*
 * Mô hình nội dung website. Toàn bộ nội dung được lưu thành MỘT bản JSON trong bảng `content`
 * (MySQL trên production, SQLite khi chạy máy cá nhân).
 *
 * Quy tắc tương thích: mọi trường thêm sau phiên bản đầu đều TÙY CHỌN. Dữ liệu cũ đang lưu trên
 * production vẫn hợp lệ; giá trị thiếu được điền bằng normalizeContent() (lib/content-defaults.ts)
 * khi đọc, và chỉ được ghi xuống database khi quản trị viên bấm Lưu.
 */

export type Faq = { q: string; a: string };
export type Feature = { title: string; text: string };
export type GalleryImage = { src: string; caption: string };

export type Person = { id: string; name: string; role: string; visible: boolean; image?: string };

export type Project = {
  id: string; slug: string; title: string; category: string; client: string;
  summary: string;
  /** Bối cảnh và nhu cầu */
  challenge: string;
  solution: string;
  /** Kết quả: chỉ ghi điều đã bàn giao/đã xác nhận. */
  result: string;
  image: string; published: boolean; featured: boolean; source?: string;
  /** Ngành của khách hàng (nhập tay, không suy đoán theo từ khóa) */
  industry?: string;
  /** ID giải pháp liên quan (data.services[].id) */
  serviceIds?: string[];
  /** Phạm vi DANAVA thực hiện, mỗi mục một dòng */
  scope?: string[];
  gallery?: GalleryImage[];
  /** Ngày cập nhật nội dung (YYYY-MM-DD) */
  updated?: string;
  seoTitle?: string; seoDescription?: string;
};

export type Post = {
  id: string; slug: string; title: string; category: string; date: string; body: string; published: boolean;
  image?: string; excerpt?: string; seoTitle?: string; seoDescription?: string; source?: string;
  /** Danh mục kiến thức (data.topics[].id) */
  topicId?: string;
  /** Tác giả cá nhân (data.staff[].id). Bỏ trống = DANAVA Solutions là tác giả. */
  authorId?: string;
  /** Ngày cập nhật (YYYY-MM-DD) */
  updated?: string;
  /** Giải pháp liên quan (data.services[].id) */
  serviceIds?: string[];
  /** Không cho công cụ tìm kiếm lập chỉ mục bài này (vẫn truy cập được bằng đường dẫn). */
  noindex?: boolean;
  /** Thẻ (tự do, dùng để tìm và lọc trong admin) */
  tags?: string[];
  /** Lưu trữ: ẩn khỏi website và danh sách mặc định, không xóa */
  archived?: boolean;
};

/** Loại sản phẩm: quyết định các trường cần nhập (lib/product-types.ts). */
export type ProductType = 'phan-mem' | 'dich-vu' | 'trai-nghiem';
/** Nhóm sản phẩm: dùng để phân loại và lọc (khác với loại). */
export type ProductGroup = { id: string; name: string; description: string };
/** Một gói trong bảng giá của sản phẩm. price = chỉ chữ số; trống = "Liên hệ báo giá". */
export type ProductPackage = { id: string; name: string; price: string; unit: string; perks: string[]; highlight: boolean; note: string };

export type LandingStatus = 'draft' | 'published' | 'archived';
/**
 * Landing page:
 *  - internal: dựng trên website DANAVA tại /lp/{slug}/ bằng các khối (lib/page-blocks.ts);
 *  - external: chỉ lưu liên kết tới trang bên ngoài (không tạo trang nội bộ giả).
 * Landing đã làm cho khách hàng quản lý ở Dự án & Portfolio.
 */
export type Landing = {
  id: string; kind: 'internal' | 'external'; title: string; slug: string; url: string;
  image: string; purpose: string; serviceIds: string[]; status: LandingStatus;
  blocks: PageBlock[];
  seoTitle?: string; seoDescription?: string; noindex?: boolean;
  updated: string;
};
/** Chuyển hướng 301 từ đường dẫn cũ sang đường dẫn mới (tự tạo khi đổi URL bản ghi đã công khai, hoặc thêm tay). */
export type Redirect = { id: string; from: string; to: string; auto?: boolean; created: string };

export type Service = {
  id: string; slug: string; title: string; description: string; items: string[];
  heroLead?: string;
  audience?: string[];
  /** Vấn đề khách hàng thường gặp */
  problems?: string[];
  process?: Feature[];
  faqs?: Faq[];
  /** Chi phí đã xác nhận hoặc cách xác định báo giá */
  pricing?: string;
  /** Trang sản phẩm chính thức (https) */
  productUrl?: string;
  productLabel?: string;
  image?: string;
  seoTitle?: string; seoDescription?: string;
  updated?: string;
  /** Loại (quyết định trường cần nhập). Trống = theo sản phẩm gốc, xem lib/product-types.ts */
  type?: ProductType;
  /** Nhóm (data.productGroups[].id) */
  groupId?: string;
  /** false = chưa xuất bản (ẩn khỏi website). Trống = đang hiển thị (dữ liệu cũ). */
  published?: boolean;
  /** Nổi bật: ưu tiên ở trang chủ, menu */
  featured?: boolean;
  /** Tính năng (phần mềm) */
  features?: Feature[];
  /** Gói & giá */
  packages?: ProductPackage[];
  /** Mẫu trang hiển thị */
  template?: 'chuan';
  /** Ảnh bìa trang (khác ảnh đại diện trên thẻ) */
  cover?: string;
  /** Liên kết dùng thử / demo và đăng ký */
  demoUrl?: string;
  signupUrl?: string;
  /** Ảnh khi chia sẻ lên mạng xã hội (trống = ảnh đại diện) */
  ogImage?: string;
  /** Thứ tự hiển thị do quản trị viên kéo sắp xếp (trống = thứ tự mặc định) */
  order?: number;
};

/** Trang dịch vụ con: /giai-phap/{dịch vụ cha}/{slug}/ */
export type SubService = {
  id: string; slug: string; parentId: string; title: string; description: string;
  heroLead: string; audience: string[]; problems: string[]; features: Feature[]; process: Feature[]; faqs: Faq[];
  pricing: string; image: string; published: boolean; updated: string;
  seoTitle?: string; seoDescription?: string;
  /** Ghi chú biên tập nội bộ, KHÔNG hiển thị công khai */
  editorNote?: string;
};

/** Danh mục kiến thức: /blogs/chu-de/{slug}/ */
export type Topic = {
  id: string; slug: string; name: string; description: string; serviceIds: string[]; published: boolean;
  seoTitle?: string; seoDescription?: string;
};

/**
 * Sản phẩm/chương trình trưng bày (portfolio website, chương trình sự kiện).
 * Thứ tự hiển thị = thứ tự trong mảng (admin sắp xếp được). `featured` = khối nổi bật cỡ lớn.
 * `caseStudy` = có trang chi tiết nội bộ /du-an/{slug}/.
 */
export type ShowcaseItem = {
  id: string; slug: string;
  /** Giải pháp chứa mục này: 'website' | 'events' | … (data.services[].id) */
  serviceId: string;
  name: string;
  /** Loại sản phẩm hiển thị trên thẻ (vd. Landing page bất động sản) */
  kind: string;
  /** Nhóm dùng cho bộ lọc */
  category: string;
  description: string;
  /** Ảnh chính (desktop) */
  image: string;
  /** Ảnh giao diện điện thoại (tùy chọn) */
  mobileImage: string;
  /** Ảnh động ghi lại chuyển động thật (WebP động, tùy chọn) và ảnh tĩnh thay thế */
  motion: string; motionPoster: string;
  gallery: GalleryImage[];
  /** Địa chỉ website đang chạy (https, tùy chọn) */
  url: string;
  /** Địa điểm (chương trình sự kiện) */
  place: string;
  tags: string[];
  /** Phạm vi DANAVA thực hiện — chỉ ghi điều đã xác nhận */
  scope: string[];
  featured: boolean; published: boolean;
  caseStudy: boolean;
  /** Nội dung trang case study */
  intro: string;
  highlights: Feature[];
  /** Ghi chú công khai về vai trò (vd. không đại diện chủ đầu tư) */
  disclaimer: string;
  updated: string;
  seoTitle?: string; seoDescription?: string;
};

/** Khách hàng tiêu biểu — chỉ hiển thị khi published && permission. */
export type Client = {
  id: string; name: string; logo: string; url: string; projectId: string;
  /** Lĩnh vực hiển thị dưới logo (vd. Gym & Fitness) */
  role?: string;
  /** client = khách hàng của DANAVA; partner = đối tác đồng hành (khối trên trang chủ danava.vn); place = địa điểm công khai trên danava.vn/places */
  relation?: 'client' | 'partner' | 'place';
  /** Có huy hiệu DANAVA Verified trên danava.vn */
  verified?: boolean;
  /** Thông tin công khai của đối tác (theo trang của họ trên danava.vn) */
  fullName?: string;
  description?: string;
  address?: string;
  city?: string;
  hours?: string;
  types?: string[];
  amenities?: string[];
  /** Ảnh bìa (đường dẫn nội bộ) */
  cover?: string;
  /** Đã có quyền/đồng ý hiển thị tên và logo công khai */
  permission: boolean; published: boolean; note: string;
};

/** Nhận xét khách hàng — chỉ hiển thị khi published && permission. */
export type Testimonial = {
  id: string; quote: string; name: string; role: string; company: string; projectId: string; image: string;
  /** Nguồn gốc nhận xét (link công khai hoặc ghi chú nội bộ) */
  source: string;
  permission: boolean; published: boolean;
};

export type SiteData = {
  version: 1;
  presentation?: Presentation;
  projects?: Project[];
  /** Thông điệp thương hiệu (vd. "Cùng bạn phát triển.") */
  headline: string;
  description: string;
  /** H1 định vị trên trang chủ */
  heroTitle?: string;
  email: string; phone: string;
  metrics: { id: string; label: string; value: string; visible: boolean }[];
  staff: Person[]; posts: Post[]; services: Service[];
  subServices?: SubService[];
  topics?: Topic[];
  clients?: Client[];
  /** Các đợt bổ sung dữ liệu mẫu đã chạy (để không thêm lại thứ quản trị viên đã xoá) */
  seeded?: string[];
  testimonials?: Testimonial[];
  showcase?: ShowcaseItem[];
  /** Khối nội dung chỉnh sửa được (lib/blocks.ts): công ty, chữ trên trang, Về DANAVA, hệ sinh thái, hồ sơ nhân sự, chính sách */
  blocks?: Blocks;
  /** Cấu hình bổ sung (lib/site-extras.ts): ảnh doanh nghiệp… Tách khỏi blocks để bản build cũ vẫn đọc được. */
  extras?: Extras;
  /** Trang Tuyển dụng (lib/careers.ts) */
  careers?: BlockDefaults['careers'];
  /** Nhóm sản phẩm (phân loại, lọc) */
  productGroups?: ProductGroup[];
  /** Landing page nội bộ và liên kết landing page bên ngoài */
  landings?: Landing[];
  /** Chuyển hướng đường dẫn cũ → mới */
  redirects?: Redirect[];
  /** Màn mở đầu trang chủ (lib/home-hero.ts). Trống = chữ mặc định đang hiển thị. */
  homeHero?: Partial<HomeHero>;
};

/**
 * Bản cho website công khai: bỏ hồ sơ đang ẩn. Bản ghi khác (bài viết, dự án…) vẫn tự kiểm tra `published` ở từng trang.
 * Không dùng để lưu lại (sẽ mất bản ghi bị ẩn).
 */
export function siteView(data: SiteData): SiteData {
  const hidden = new Set(data.services.filter(s => s.published === false).map(s => s.id));
  const archived = data.posts.some(p => p.archived);
  if (!hidden.size && !archived) return data;
  return {
    ...data,
    services: data.services.filter(s => !hidden.has(s.id)),
    subServices: (data.subServices || []).filter(s => !hidden.has(s.parentId)),
    // Bài lưu trữ: ẩn như bài chưa xuất bản (trang bài trả 404, không vào sitemap, danh sách, tìm kiếm)
    posts: archived ? data.posts.map(p => (p.archived ? { ...p, published: false } : p)) : data.posts
  };
}

/**
 * Giải pháp đã ngừng (hiện không có; Digital Marketing được khôi phục theo yêu cầu chủ sở hữu 20/11/2026).
 * Vẫn chấp nhận khi ĐỌC dữ liệu cũ đã lưu (để website không lỗi), nhưng bị lọc khỏi mọi nơi hiển thị
 * trong normalizeContent() và không còn trong dữ liệu mặc định.
 */
export const RETIRED_SERVICES: { id: string; slug: string }[] = [];
const knownService = (id: unknown, slug?: unknown) =>
  initial.services.some(x => x.id === id && (slug === undefined || x.slug === slug))
  || RETIRED_SERVICES.some(x => x.id === id && (slug === undefined || x.slug === slug));

/** Đường dẫn bài viết không được trùng các trang tĩnh trong /blogs/. */
export const RESERVED_POST_SLUGS = ['chu-de', 'doc'];

export const initial: SiteData = {
  version: 1,
  presentation: defaultPresentation,
  projects: verifiedProjects,
  headline: 'Cùng bạn phát triển.',
  description: 'Công nghệ, truyền thông và những trải nghiệm ý nghĩa.',
  email: 'hello@danava.vn',
  phone: '0935917677',
  metrics: [
    { id: 'projects', label: 'Dự án', value: '', visible: false },
    { id: 'clients', label: 'Khách hàng đồng hành', value: '', visible: false },
    { id: 'experience', label: 'Năm kinh nghiệm', value: '', visible: false }
  ],
  staff: [
    { id: 'thanh', name: 'Lê Tấn Thành', role: 'Founder & CEO', visible: true },
    { id: 'trang', name: 'Phạm Trang', role: 'Trưởng phòng CSKH', visible: true },
    { id: 'nam', name: 'Trần Văn Nam', role: 'Marketing Director', visible: true },
    { id: 'avinash', name: 'Avinash Saini', role: 'Creative Director', visible: true },
    { id: 'thong', name: 'Đặng Ngọc Thông', role: 'Manager', visible: true }
  ],
  services: [
    { id: 'website', slug: 'thiet-ke-website', title: 'Website & Landing Page', description: 'Một không gian số thể hiện đúng bản sắc và mục tiêu của doanh nghiệp.', items: ['Website doanh nghiệp, cá nhân, bán hàng và cộng đồng', 'Landing page giới thiệu dịch vụ và chiến dịch', 'Giao diện thích ứng điện thoại', 'Tổ chức nội dung và hành trình liên hệ'] },
    { id: 'studio', slug: 'danava-studio', title: 'DANAVA Studio', description: 'Phần mềm quản trị dành cho Gym, Yoga, Pilates, bể bơi và Spa.', items: ['Quản lý hội viên và gói dịch vụ', 'Lịch lớp, đặt chỗ và check-in', 'Theo dõi hạn gói và gia hạn', 'Báo cáo và phân quyền theo phạm vi gói'] },
    { id: 'marketing', slug: 'digital-marketing', title: 'Marketing & Truyền thông', description: 'Chiến lược truyền thông, sản xuất nội dung và hình ảnh, vận hành kênh, quảng cáo và đo lường trong cùng một dịch vụ.', items: ['Chiến lược truyền thông', 'Sản xuất nội dung, hình ảnh và video recap', 'Vận hành Fanpage và Zalo OA', 'Quảng cáo và đo lường hiệu quả'] },
    { id: 'events', slug: 'su-kien-truyen-thong', title: 'Tổ chức sự kiện', description: 'Ý tưởng, không gian, sân khấu, thi công và điều phối cho sự kiện của doanh nghiệp.', items: ['Lễ ra mắt sản phẩm, họp báo, triển lãm, lễ kỷ niệm, gala dinner', 'Thiết kế, thi công booth, backdrop, đạo cụ và không gian sự kiện', 'Thiết bị âm thanh, ánh sáng, màn hình LED và nhân sự kỹ thuật', 'MC, DJ, ca sĩ, band nhạc, vũ đoàn và nhân sự biểu diễn', 'Kịch bản, tổng duyệt và điều phối tại hiện trường'] },
    { id: 'travel', slug: 'du-lich-su-kien', title: 'Du lịch trải nghiệm', description: 'Tour trải nghiệm, retreat yoga và hành trình thiết kế riêng cho từng nhóm.', items: ['Du lịch trải nghiệm và tour yoga', 'Retreat kết hợp tập luyện và nghỉ dưỡng', 'Workshop và team building cho nhóm', 'Đặt tour, phòng, xe và vé tham quan'] },
    { id: 'community', slug: 'cong-dong', title: 'Cộng đồng & Đồng hành', description: 'Kết nối cộng đồng yoga và đồng hành cùng doanh nghiệp.', items: ['Yoga Club Vietnam', 'Workshop và giao lưu cộng đồng', 'Review và chia sẻ trải nghiệm', 'Tư vấn thành lập doanh nghiệp theo thỏa thuận'] }
  ],
  posts: legacyCatalog.map(p => ({ ...p }))
};

/* ---------------------------------------------------------------------------
   Kiểm tra cấu trúc (chạy ở cả trình duyệt admin và máy chủ trước khi lưu)
   --------------------------------------------------------------------------- */
const IMAGE_PATH = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g|svg)$/;
export const safeImage = (v: unknown) => typeof v === 'string' && (v === '' || (IMAGE_PATH.test(v) && !v.includes('..')));
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max = 20000) => typeof v === 'string' && v.length <= max;
const optStr = (v: unknown, max = 20000) => v === undefined || str(v, max);
const slug = (v: unknown, max = 150) => str(v, max) && /^[a-z0-9-]+$/.test(v as string);
const strList = (v: unknown, maxItems = 40, max = 1000) => Array.isArray(v) && v.length <= maxItems && v.every(i => str(i, max));
const optStrList = (v: unknown, maxItems = 40, max = 1000) => v === undefined || strList(v, maxItems, max);
const sourceURL = (v: unknown) => v === undefined || v === '' || (typeof v === 'string' && /^https:\/\/(www\.)?(danava\.vn|danava\.com\.vn)\//.test(v) && v.length <= 500);
/** Link công khai bất kỳ, chỉ https */
const httpsURL = (v: unknown) => v === '' || (typeof v === 'string' && v.length <= 300 && /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i.test(v));
const optHttpsURL = (v: unknown) => v === undefined || httpsURL(v);
const validDate = (v: unknown) => typeof v === 'string' && (v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v));
const optDate = (v: unknown) => v === undefined || validDate(v);
const faqList = (v: unknown) => Array.isArray(v) && v.length <= 30 && v.every(f => object(f) && str(f.q, 300) && str(f.a, 3000));
const featureList = (v: unknown) => Array.isArray(v) && v.length <= 30 && v.every(f => object(f) && str(f.title, 200) && str(f.text, 2000));
const uniqueBy = <T,>(list: T[], key: (x: T) => unknown) => new Set(list.map(key)).size === list.length;

function validPresentation(p: unknown) {
  return object(p) && safeImage(p.screenImage) && safeImage(p.ecosystemImage)
    && ['technologyTitle', 'technologyDescription', 'ecosystemTitle', 'ecosystemDescription'].every(k => str(p[k], 1000))
    && Array.isArray(p.ecosystem) && p.ecosystem.length <= 12
    && p.ecosystem.every(i => object(i) && str(i.id, 100) && str(i.name, 150) && str(i.description, 400) && str(i.features, 1500) && typeof i.visible === 'boolean')
    && uniqueBy(p.ecosystem as { id: string }[], i => i.id);
}

function validProject(p: unknown) {
  return object(p)
    && ['id', 'slug', 'title', 'category', 'client', 'summary', 'challenge', 'solution', 'result', 'image']
      .every(k => str(p[k], k === 'summary' ? 2000 : k === 'challenge' || k === 'solution' || k === 'result' ? 12000 : 250))
    && slug(p.slug) && safeImage(p.image) && typeof p.published === 'boolean' && typeof p.featured === 'boolean' && sourceURL(p.source)
    && optStr(p.industry, 100) && optStrList(p.serviceIds, 10, 100) && optStrList(p.scope, 30, 500)
    && (p.gallery === undefined || (Array.isArray(p.gallery) && p.gallery.length <= 24 && p.gallery.every(g => object(g) && safeImage(g.src) && g.src !== '' && str(g.caption, 300))))
    && optDate(p.updated) && optStr(p.seoTitle, 200) && optStr(p.seoDescription, 300);
}

function validPost(p: unknown) {
  return object(p) && str(p.id, 100) && slug(p.slug) && !RESERVED_POST_SLUGS.includes(p.slug as string)
    && str(p.title, 250) && str(p.category, 100) && validDate(p.date) && str(p.body, 60000) && typeof p.published === 'boolean'
    && (!p.published || ((p.title as string).trim().length > 0 && (p.body as string).trim().length > 0))
    && (p.image === undefined || safeImage(p.image)) && sourceURL(p.source)
    && ['excerpt', 'seoTitle', 'seoDescription'].every(k => p[k] === undefined || str(p[k], k === 'excerpt' ? 1000 : 300))
    && optStr(p.topicId, 100) && optStr(p.authorId, 100) && optDate(p.updated) && optStrList(p.serviceIds, 10, 100)
    && (p.noindex === undefined || typeof p.noindex === 'boolean')
    && optStrList(p.tags, 20, 60) && optBool(p.archived);
}

const optBool = (v: unknown) => v === undefined || typeof v === 'boolean';
const optLink = (v: unknown) => v === undefined || okLink(v);
const optImage = (v: unknown) => v === undefined || okImage(v);
const PRODUCT_TYPE_IDS = ['phan-mem', 'dich-vu', 'trai-nghiem'];
const ID = /^[a-z0-9-]{2,60}$/;

function validPackage(p: unknown) {
  return object(p) && str(p.id, 60) && str(p.name, 120) && (p.name as string).trim() !== '' && str(p.price, 15) && /^\d*$/.test(p.price as string)
    && str(p.unit, 40) && strList(p.perks, 20, 200) && typeof p.highlight === 'boolean' && str(p.note, 300);
}

function validService(s: unknown) {
  return object(s) && str(s.id, 100) && str(s.slug, 150)
    // 6 sản phẩm gốc giữ nguyên đường dẫn (SEO); sản phẩm thêm trong admin có mã và đường dẫn riêng
    && (knownService(s.id, s.slug) || (ID.test(s.id as string) && slug(s.slug, 100) && !RETIRED_SERVICES.some(r => r.id === s.id) && !initial.services.some(x => x.id === s.id)))
    && str(s.title, 200) && str(s.description, 2000) && strList(s.items, 50)
    && optStr(s.heroLead, 1000) && optStrList(s.audience, 12, 120) && optStrList(s.problems, 12, 500)
    && (s.process === undefined || featureList(s.process)) && (s.faqs === undefined || faqList(s.faqs))
    && optStr(s.pricing, 2000) && optHttpsURL(s.productUrl) && optStr(s.productLabel, 120)
    && (s.image === undefined || safeImage(s.image)) && optStr(s.seoTitle, 200) && optStr(s.seoDescription, 300) && optDate(s.updated)
    && (s.type === undefined || PRODUCT_TYPE_IDS.includes(s.type as string)) && optStr(s.groupId, 60)
    && optBool(s.published) && optBool(s.featured) && (s.features === undefined || featureList(s.features))
    && (s.packages === undefined || (Array.isArray(s.packages) && s.packages.length <= 8 && s.packages.every(validPackage)))
    && (s.order === undefined || (typeof s.order === 'number' && Number.isInteger(s.order) && s.order >= 0 && s.order < 1000))
    && (s.template === undefined || s.template === 'chuan') && optImage(s.cover) && optImage(s.ogImage) && optLink(s.demoUrl) && optLink(s.signupUrl);
}

function validGroup(g: unknown) {
  return object(g) && typeof g.id === 'string' && ID.test(g.id) && str(g.name, 80) && (g.name as string).trim() !== '' && str(g.description, 500);
}

function validLanding(l: unknown) {
  if (!object(l) || !str(l.id, 60) || !ID.test(l.id as string) || (l.kind !== 'internal' && l.kind !== 'external')) return false;
  if (!str(l.title, 200) || !(l.title as string).trim() || !str(l.purpose, 500) || !okImage(l.image) || !strList(l.serviceIds, 10, 100)) return false;
  if (!['draft', 'published', 'archived'].includes(l.status as string) || !validDate(l.updated)) return false;
  if (!optStr(l.seoTitle, 200) || !optStr(l.seoDescription, 300) || !optBool(l.noindex)) return false;
  if (!Array.isArray(l.blocks) || l.blocks.length > 40 || !l.blocks.every(validPageBlock) || !uniqueBy(l.blocks as { id: string }[], b => b.id)) return false;
  // Nội bộ: cần đường dẫn; liên kết ngoài: cần URL https và không có khối
  return l.kind === 'internal'
    ? slug(l.slug, 100) && (l.url === '' || l.url === undefined)
    : str(l.slug, 0) && httpsURL(l.url) && l.url !== '' && (l.blocks as unknown[]).length === 0;
}

const PATH = /^\/[a-z0-9\-/._]*\/$/i;
function validRedirect(r: unknown) {
  return object(r) && str(r.id, 60) && typeof r.from === 'string' && PATH.test(r.from) && r.from.length <= 250 && !r.from.startsWith('/admin') && !r.from.startsWith('/api')
    && typeof r.to === 'string' && r.to.length <= 300 && (PATH.test(r.to) || httpsURL(r.to)) && r.to !== r.from
    && optBool(r.auto) && validDate(r.created);
}

function validSubService(s: unknown, services: Set<string>) {
  return object(s) && str(s.id, 100) && slug(s.slug) && services.has(s.parentId as string)
    && str(s.title, 200) && str(s.description, 1000) && str(s.heroLead, 1000)
    && strList(s.audience, 12, 120) && strList(s.problems, 12, 500) && featureList(s.features) && featureList(s.process) && faqList(s.faqs)
    && str(s.pricing, 2000) && safeImage(s.image) && typeof s.published === 'boolean' && validDate(s.updated)
    && optStr(s.seoTitle, 200) && optStr(s.seoDescription, 300) && optStr(s.editorNote, 2000)
    // Không xuất bản trang rỗng
    && (!s.published || ((s.title as string).trim() !== '' && (s.heroLead as string).trim() !== '' && (s.features as unknown[]).length > 0));
}

function validTopic(t: unknown) {
  return object(t) && str(t.id, 100) && slug(t.slug, 100) && str(t.name, 100) && (t.name as string).trim() !== '' && str(t.description, 1000)
    && strList(t.serviceIds, 10, 100) && typeof t.published === 'boolean' && optStr(t.seoTitle, 200) && optStr(t.seoDescription, 300);
}

function validShowcase(x: unknown, services: Set<string>) {
  return object(x) && str(x.id, 100) && slug(x.slug) && services.has(x.serviceId as string)
    && str(x.name, 150) && (x.name as string).trim() !== '' && str(x.kind, 120) && str(x.category, 80) && str(x.description, 1000)
    && safeImage(x.image) && safeImage(x.mobileImage) && safeImage(x.motion) && safeImage(x.motionPoster)
    && Array.isArray(x.gallery) && x.gallery.length <= 24 && x.gallery.every(g => object(g) && safeImage(g.src) && g.src !== '' && str(g.caption, 300))
    && httpsURL(x.url) && str(x.place, 150) && strList(x.tags, 8, 60) && strList(x.scope, 20, 300)
    && typeof x.featured === 'boolean' && typeof x.published === 'boolean' && typeof x.caseStudy === 'boolean'
    && str(x.intro, 3000) && featureList(x.highlights) && str(x.disclaimer, 500) && validDate(x.updated)
    && optStr(x.seoTitle, 200) && optStr(x.seoDescription, 300)
    // Không xuất bản mục không có ảnh thật (tránh khung giữ chỗ trên trang công khai)
    && (!x.published || x.image !== '')
    // Case study cần nội dung riêng
    && (!x.caseStudy || (x.intro as string).trim() !== '');
}

function validClient(c: unknown) {
  return object(c) && str(c.id, 100) && str(c.name, 150) && safeImage(c.logo) && httpsURL(c.url) && str(c.projectId, 100)
    && optStr(c.role, 80) && (c.relation === undefined || c.relation === 'client' || c.relation === 'partner' || c.relation === 'place')
    && (c.verified === undefined || typeof c.verified === 'boolean')
    && optStr(c.fullName, 200) && optStr(c.description, 2000) && optStr(c.address, 300) && optStr(c.city, 100) && optStr(c.hours, 200)
    && optStrList(c.types, 12, 120) && optStrList(c.amenities, 20, 150) && (c.cover === undefined || safeImage(c.cover))
    && typeof c.permission === 'boolean' && typeof c.published === 'boolean' && str(c.note, 1000)
    // Chỉ xuất bản khi đã có quyền hiển thị
    && (!c.published || (c.permission && (c.name as string).trim() !== ''));
}

function validTestimonial(t: unknown) {
  return object(t) && str(t.id, 100) && str(t.quote, 1500) && str(t.name, 150) && str(t.role, 150) && str(t.company, 150)
    && str(t.projectId, 100) && safeImage(t.image) && str(t.source, 500)
    && typeof t.permission === 'boolean' && typeof t.published === 'boolean'
    && (!t.published || (t.permission && (t.quote as string).trim() !== '' && (t.name as string).trim() !== ''));
}

function validHomeHero(h: unknown) {
  return object(h) && Object.entries(h).every(([k, x]) => k in HOME_HERO_LIMITS && str(x, HOME_HERO_LIMITS[k as keyof HomeHero]) && (!k.endsWith('Href') || okLink(x)));
}

export function validateContent(v: unknown): v is SiteData {
  if (!object(v) || v.version !== 1 || !str(v.headline, 150) || !str(v.description, 1000) || !str(v.email, 200) || !str(v.phone, 50)) return false;
  if (!optStr(v.heroTitle, 150)) return false;
  if (v.homeHero !== undefined && !validHomeHero(v.homeHero)) return false;
  if (v.presentation !== undefined && !validPresentation(v.presentation)) return false;
  if (!validBlocks(v.blocks) || !validExtras(v.extras) || !validCareers(v.careers)) return false;
  if (!Array.isArray(v.staff) || v.staff.length > 100 || !v.staff.every(p => object(p) && str(p.id, 100) && str(p.name, 150) && str(p.role, 200) && typeof p.visible === 'boolean' && (p.image === undefined || p.image === '' || (str(p.image, 250) && safeImage(p.image))))) return false;
  if (v.projects !== undefined && (!Array.isArray(v.projects) || v.projects.length > 500 || !v.projects.every(validProject) || !uniqueBy(v.projects as Project[], p => p.slug) || !uniqueBy(v.projects as Project[], p => p.id))) return false;
  if (!Array.isArray(v.posts) || v.posts.length > 500 || !v.posts.every(validPost)) return false;
  if (!Array.isArray(v.metrics) || v.metrics.length > 20 || !v.metrics.every(m => object(m) && str(m.id, 100) && str(m.label, 150) && str(m.value, 50) && typeof m.visible === 'boolean')) return false;
  if (!Array.isArray(v.services) || v.services.length > 50 || !v.services.every(validService) || !uniqueBy(v.services as Service[], s => s.slug)) return false;
  // Trang con và mục portfolio gắn với sản phẩm còn tồn tại (kể cả sản phẩm gốc đã ngừng khi đọc dữ liệu cũ)
  const serviceIds = new Set([...(v.services as Service[]).map(s => s.id), ...initial.services.map(s => s.id), ...RETIRED_SERVICES.map(s => s.id)]);
  if (v.productGroups !== undefined && (!Array.isArray(v.productGroups) || v.productGroups.length > 30 || !v.productGroups.every(validGroup) || !uniqueBy(v.productGroups as ProductGroup[], g => g.id))) return false;
  if (v.landings !== undefined && (!Array.isArray(v.landings) || v.landings.length > 100 || !v.landings.every(validLanding)
    || !uniqueBy(v.landings as Landing[], l => l.id) || !uniqueBy((v.landings as Landing[]).filter(l => l.kind === 'internal'), l => l.slug))) return false;
  if (v.redirects !== undefined && (!Array.isArray(v.redirects) || v.redirects.length > 500 || !v.redirects.every(validRedirect) || !uniqueBy(v.redirects as Redirect[], r => r.from))) return false;
  if (v.subServices !== undefined && (!Array.isArray(v.subServices) || v.subServices.length > 100 || !v.subServices.every(s => validSubService(s, serviceIds))
    || !uniqueBy(v.subServices as SubService[], s => s.id) || !uniqueBy(v.subServices as SubService[], s => s.parentId + '/' + s.slug))) return false;
  if (v.topics !== undefined && (!Array.isArray(v.topics) || v.topics.length > 50 || !v.topics.every(validTopic)
    || !uniqueBy(v.topics as Topic[], t => t.id) || !uniqueBy(v.topics as Topic[], t => t.slug))) return false;
  if (v.seeded !== undefined && (!Array.isArray(v.seeded) || v.seeded.length > 50 || !v.seeded.every(x => str(x, 60)))) return false;
  if (v.clients !== undefined && (!Array.isArray(v.clients) || v.clients.length > 100 || !v.clients.every(validClient) || !uniqueBy(v.clients as Client[], c => c.id))) return false;
  if (v.showcase !== undefined && (!Array.isArray(v.showcase) || v.showcase.length > 200 || !v.showcase.every(x => validShowcase(x, serviceIds))
    || !uniqueBy(v.showcase as ShowcaseItem[], x => x.id) || !uniqueBy(v.showcase as ShowcaseItem[], x => x.slug)
    // Slug case study không trùng slug dự án (cùng dùng /du-an/{slug}/)
    || (v.showcase as ShowcaseItem[]).some(x => (v.projects as Project[] | undefined)?.some(p => p.slug === x.slug)))) return false;
  if (v.testimonials !== undefined && (!Array.isArray(v.testimonials) || v.testimonials.length > 100 || !v.testimonials.every(validTestimonial) || !uniqueBy(v.testimonials as Testimonial[], t => t.id))) return false;
  return ['staff', 'posts', 'metrics', 'services'].every(key => uniqueBy(v[key] as { id: string }[], x => x.id))
    && uniqueBy(v.posts as Post[], p => p.slug);
}

export function readSaved(raw: string | null): SiteData {
  if (!raw) return initial;
  try {
    const data: unknown = JSON.parse(raw);
    return validateContent(data) ? data : initial;
  } catch {
    return initial;
  }
}
