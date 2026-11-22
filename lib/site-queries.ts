/*
 * Truy vấn quan hệ nội dung dùng chung cho trang công khai, sitemap và test.
 * Mọi quan hệ dịch vụ ↔ dự án ↔ bài viết đi qua ID lưu trong dữ liệu (serviceIds, topicId, projectId),
 * không suy đoán từ từ khóa trong tiêu đề.
 */
import type { Client, Post, Project, Service, ShowcaseItem, SiteData, SubService, Testimonial, Topic } from './content.ts';
import { ARCHIVE_TOPIC } from './content-defaults.ts';

/** Số bài tối thiểu để một danh mục có trang riêng (URL riêng, vào sitemap). */
export const TOPIC_PAGE_MIN_POSTS = 3;

/** Thứ tự ưu tiên hiển thị giải pháp: sản phẩm chủ lực trước. */
export const SERVICE_ORDER = ['studio', 'website', 'marketing', 'events', 'travel', 'community'];
export const sortServices = (list: Service[]) =>
  [...list].sort((a, b) => (SERVICE_ORDER.indexOf(a.id) + 99) % 99 - (SERVICE_ORDER.indexOf(b.id) + 99) % 99);

export const serviceHref = (s: Pick<Service, 'slug'>) => `/giai-phap/${s.slug}/`;
export const projectHref = (p: Pick<Project, 'slug'>) => `/du-an/${p.slug}/`;
export const postHref = (p: Pick<Post, 'slug'>) => `/kien-thuc/${p.slug}/`;
export const topicHref = (t: Pick<Topic, 'slug'>) => `/kien-thuc/chu-de/${t.slug}/`;

export function subServiceHref(data: SiteData, s: SubService) {
  const parent = data.services.find(x => x.id === s.parentId);
  return parent ? `/giai-phap/${parent.slug}/${s.slug}/` : '';
}

/* ---------------------------------------------------------------- Dịch vụ */
export const findService = (data: SiteData, slug: string) => data.services.find(s => s.slug === slug);

export function findSubService(data: SiteData, parentSlug: string, slug: string) {
  const parent = findService(data, parentSlug);
  if (!parent) return undefined;
  const sub = (data.subServices || []).find(s => s.parentId === parent.id && s.slug === slug);
  return sub ? { parent, sub } : undefined;
}

export const publishedSubServices = (data: SiteData, parentId?: string) =>
  (data.subServices || []).filter(s => s.published && (!parentId || s.parentId === parentId));

/* ---------------------------------------------------------------- Dự án */
export const publishedProjects = (data: SiteData) => (data.projects || []).filter(p => p.published);

export function projectsForService(data: SiteData, serviceId: string) {
  return publishedProjects(data).filter(p => (p.serviceIds || []).includes(serviceId));
}

export function servicesForProject(data: SiteData, p: Project) {
  return sortServices(data.services.filter(s => (p.serviceIds || []).includes(s.id)));
}

/* ---------------------------------------------------------------- Bài viết */
export const publishedPosts = (data: SiteData) =>
  data.posts.filter(p => p.published).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

export const topicOf = (data: SiteData, p: Post) => (data.topics || []).find(t => t.id === p.topicId);

/** Bài viết thuộc chủ đề dịch vụ hiện tại (loại bài lưu trữ ngoài chủ đề). */
export const knowledgePosts = (data: SiteData) => publishedPosts(data).filter(p => p.topicId !== ARCHIVE_TOPIC);

export const postsForTopic = (data: SiteData, topicId: string) => publishedPosts(data).filter(p => p.topicId === topicId);

/** Danh mục có trang riêng: đã xuất bản và đủ số bài. */
export function topicHasPage(data: SiteData, t: Topic) {
  return t.published && postsForTopic(data, t.id).length >= TOPIC_PAGE_MIN_POSTS;
}

export const findTopic = (data: SiteData, slug: string) => (data.topics || []).find(t => t.slug === slug);

export function postsForService(data: SiteData, serviceId: string, limit = 3) {
  return knowledgePosts(data).filter(p => (p.serviceIds || []).includes(serviceId)).slice(0, limit);
}

/** Bài liên quan: cùng danh mục trước, sau đó chung dịch vụ. Không gợi ý bài lưu trữ. */
export function relatedPosts(data: SiteData, post: Post, limit = 3) {
  const pool = knowledgePosts(data).filter(p => p.id !== post.id);
  const services = new Set(post.serviceIds || []);
  const sameTopic = post.topicId ? pool.filter(p => p.topicId === post.topicId) : [];
  const sameService = pool.filter(p => !sameTopic.includes(p) && (p.serviceIds || []).some(id => services.has(id)));
  return [...sameTopic, ...sameService].slice(0, limit);
}

export function servicesForPost(data: SiteData, post: Post) {
  return sortServices(data.services.filter(s => (post.serviceIds || []).includes(s.id)));
}

export function authorOf(data: SiteData, post: Post) {
  if (!post.authorId) return undefined;
  return data.staff.find(p => p.id === post.authorId && p.visible);
}

/* ---------------------------------------------------------- Showcase */
/** Mục trưng bày đã xuất bản của một giải pháp, theo thứ tự quản trị viên sắp xếp. */
export const showcaseFor = (data: SiteData, serviceId: string): ShowcaseItem[] =>
  (data.showcase || []).filter(x => x.published && x.serviceId === serviceId);

/** Mục nổi bật đầu tiên (khối featured) và phần còn lại (không lặp lại mục nổi bật). */
export function splitFeatured(items: ShowcaseItem[]) {
  const featured = items.filter(x => x.featured);
  return { featured, rest: items.filter(x => !x.featured) };
}

export const showcaseHref = (x: Pick<ShowcaseItem, 'slug'>) => `/du-an/${x.slug}/`;
export const showcaseCaseStudies = (data: SiteData) => (data.showcase || []).filter(x => x.published && x.caseStudy);
export const findShowcase = (data: SiteData, slug: string) => (data.showcase || []).find(x => x.slug === slug);

/* ---------------------------------------------------------- Bằng chứng */
export const publicClients = (data: SiteData): Client[] =>
  (data.clients || []).filter(c => c.published && c.permission && c.name.trim());
/** Khách hàng + đối tác đồng hành (không gồm địa điểm danh bạ danava.vn/places) — dùng cho khối logo. */
export const publicPartners = (data: SiteData): Client[] => publicClients(data).filter(c => c.relation !== 'place');
/** Địa điểm công khai trên danava.vn/places (ngoài khối đối tác đồng hành). */
export const publicPlaces = (data: SiteData): Client[] => publicClients(data).filter(c => c.relation === 'place');

export const publicTestimonials = (data: SiteData, projectId?: string): Testimonial[] =>
  (data.testimonials || []).filter(t => t.published && t.permission && t.quote.trim() && (!projectId || t.projectId === projectId));

export const visibleMetrics = (data: SiteData) => data.metrics.filter(m => m.visible && m.value.trim());

/* ------------------------------------------------- Dữ liệu gửi xuống trình duyệt */
/**
 * Dữ liệu công khai dùng chung cho mọi trang (header, footer, các khối client).
 * Loại bản nháp và cắt nội dung bài viết (chỉ trang bài viết cần toàn văn, trang đó nhận riêng từ máy chủ)
 * để HTML/JS mỗi trang không phải mang theo toàn bộ kho bài.
 */
export function publicContent(data: SiteData): SiteData {
  return {
    ...data,
    staff: data.staff.filter(p => p.visible),
    posts: data.posts.filter(p => p.published).map(p => ({ ...p, body: p.excerpt ? '' : p.body.slice(0, 400) })),
    projects: publishedProjects(data),
    subServices: publishedSubServices(data).map(s => ({ ...s, editorNote: undefined })),
    topics: (data.topics || []).filter(t => t.published || t.id === ARCHIVE_TOPIC),
    // Trình duyệt chỉ cần khối logo: bỏ địa điểm danh bạ và phần mô tả dài
    clients: publicPartners(data).map(c => ({ ...c, note: '', description: undefined, amenities: undefined, types: undefined })),
    testimonials: publicTestimonials(data),
    // Chỉ trang /du-an/ (client) cần showcase — chỉ gửi mục website đã xuất bản
    showcase: (data.showcase || []).filter(x => x.published && x.serviceId === 'website'),
    // Cấu hình bổ sung: chỉ gửi phần thành phần trình duyệt cần (ảnh doanh nghiệp render trên máy chủ)
    extras: data.extras?.contact && { contact: data.extras.contact },
    // Khối chỉ dùng ở trang máy chủ (hệ sinh thái, chính sách) không gửi xuống trình duyệt
    blocks: data.blocks && { company: data.blocks.company, menu: data.blocks.menu, pages: data.blocks.pages, about: data.blocks.about, staff: data.blocks.staff }
  };
}
