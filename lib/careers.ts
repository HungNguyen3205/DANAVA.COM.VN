/*
 * Tuyển dụng (/tuyen-dung/): nội dung sửa trong Quản trị → Tuyển dụng, lưu ở SiteData.careers.
 * Không có vị trí, lương hay phúc lợi mặc định: chỉ hiện những gì DANAVA tự nhập và bật "Đang tuyển".
 */
import { ABOUT_DANAVA } from './about-danava.ts';
import { STAFF_DEPARTMENTS } from './staff.ts';
import { isValidPhoneNumber } from './contact-services.ts';

/** Các mảng lấy theo phòng ban đã có ở trang Đội ngũ. */
export const TEAMS = STAFF_DEPARTMENTS.filter(d => d.id !== 'all').map(d => ({ id: String(d.id), label: d.label, text: d.shortDesc }));
export const teamLabel = (id: string) => TEAMS.find(t => t.id === id)?.label || '';

export const JOB_TYPES = ['', 'Toàn thời gian', 'Bán thời gian', 'Thực tập', 'Cộng tác viên'];

export type Job = {
  id: string; title: string; team: string; type: string; location: string; salary: string;
  /** YYYY-MM-DD; qua ngày này vị trí tự ẩn. Trống = không hạn */
  deadline: string;
  summary: string; tasks: string[]; requirements: string[]; benefits: string[];
  open: boolean;
};

export const CAREERS = {
  kicker: 'Tuyển dụng DANAVA',
  title: 'Tấm thẻ tiếp theo *mang tên bạn.*',
  lead: 'Người làm công nghệ, người kể chuyện, người kết nối, người giữ cho mọi thứ vận hành. Nếu bạn muốn cùng DANAVA phát triển, hãy bắt đầu bằng việc viết tên mình.',
  emptyTitle: 'Hiện chưa có vị trí đang công bố.',
  emptyText: 'Bạn vẫn có thể chọn một mảng bên dưới và gửi hồ sơ, để DANAVA có thông tin khi có nhu cầu phù hợp.',
  /** Mặc định là lời nhà sáng lập đã công bố trên trang chủ; không tự viết thêm thay người thật */
  letter: ABOUT_DANAVA.founder.quote,
  jobs: [] as Job[]
};

/** Một vị trí mẫu chỉ để biết cấu trúc (kiểm tra dữ liệu + dựng biểu mẫu quản trị), không hiển thị. */
export const CAREERS_SAMPLE: typeof CAREERS = {
  ...CAREERS,
  jobs: [{ id: '', title: '', team: '', type: '', location: '', salary: '', deadline: '', summary: '', tasks: [''], requirements: [''], benefits: [''], open: false }]
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const realDate = (v: string) => DATE.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

/** '' = hợp lệ; ngược lại là câu báo lỗi cho quản trị viên. */
export function careersError(careers: typeof CAREERS | undefined): string {
  if (!careers) return '';
  if (!Array.isArray(careers.jobs)) return 'Tuyển dụng: danh sách vị trí không hợp lệ.';
  if (careers.jobs.length > 30) return 'Tuyển dụng: tối đa 30 vị trí.';
  for (const [i, job] of careers.jobs.entries()) {
    const name = job.title?.trim() ? `"${job.title.trim()}"` : `vị trí ${i + 1}`;
    if (!job.id || !Array.isArray(job.tasks)) return `Tuyển dụng, ${name}: dữ liệu không hợp lệ.`;
    if (job.team && !teamLabel(job.team)) return `Tuyển dụng, ${name}: mảng không hợp lệ.`;
    if (!JOB_TYPES.includes(job.type)) return `Tuyển dụng, ${name}: hình thức không hợp lệ.`;
    if (job.deadline && !realDate(job.deadline)) return `Tuyển dụng, ${name}: hạn nộp phải có dạng năm-tháng-ngày, ví dụ 2026-12-31.`;
    if (job.open && (!job.title.trim() || !job.team || !job.tasks.some(t => t.trim()))) {
      return `Tuyển dụng, ${name}: cần tên vị trí, mảng và ít nhất một công việc trước khi bật "Đang tuyển".`;
    }
  }
  if (new Set(careers.jobs.map(j => j.id)).size !== careers.jobs.length) return 'Tuyển dụng: mã vị trí bị trùng.';
  return '';
}

export const todayVN = (now = Date.now()) => new Date(now + 7 * 3600_000).toISOString().slice(0, 10);

/** Vị trí khách được thấy: đã bật và chưa quá hạn. */
export const openJobs = (careers: typeof CAREERS, today = todayVN()) => careers.jobs.filter(j => j.open && (!j.deadline || j.deadline >= today));

/* ------------------------------------------------------------ Hồ sơ ứng tuyển */
export type Position = { value: string; label: string; badge: string };

export function positionsFor(jobs: Job[]): Position[] {
  return [
    ...jobs.map(j => ({ value: `job:${j.id}`, label: j.title, badge: j.title })),
    ...TEAMS.map(t => ({ value: `team:${t.id}`, label: `Hồ sơ mở: ${t.label}`, badge: t.label })),
    { value: 'other', label: 'Hồ sơ mở: mảng khác', badge: 'Đồng đội tương lai' }
  ];
}

export type Application = { name: string; phone: string; email: string; position: Position; link: string; intro: string };
export const APPLY_LIMITS = { name: 100, phone: 20, email: 200, link: 500, intro: 2000 };

export function parseApplication(value: unknown, positions: Position[]): { application?: Application; error?: string; field?: string } {
  if (!value || typeof value !== 'object') return { error: 'Dữ liệu không hợp lệ.' };
  const body = value as Record<string, unknown>;
  const text = (key: string) => (typeof body[key] === 'string' ? (body[key] as string).trim() : '');
  const name = text('name').replace(/\s+/g, ' ');
  const phone = text('phone');
  const email = text('email');
  const link = text('link');
  const intro = text('intro');
  const position = positions.find(p => p.value === text('position'));

  if (name.length < 2 || name.length > APPLY_LIMITS.name) return { field: 'name', error: 'Bạn nhập họ và tên giúp DANAVA nhé.' };
  if (phone.length > APPLY_LIMITS.phone || !isValidPhoneNumber(phone)) return { field: 'phone', error: 'Số điện thoại chưa đúng.' };
  if (email.length > APPLY_LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { field: 'email', error: 'Email chưa đúng định dạng.' };
  if (!position) return { field: 'position', error: 'Bạn chọn vị trí hoặc mảng quan tâm nhé. Vị trí đã đóng thì không còn trong danh sách.' };
  if (link && (link.length > APPLY_LIMITS.link || !/^https:\/\/[^\s"'<>]+\.[^\s"'<>]+$/.test(link))) return { field: 'link', error: 'Link CV cần bắt đầu bằng https://' };
  if (intro.length > APPLY_LIMITS.intro) return { field: 'intro', error: 'Phần giới thiệu tối đa 2.000 ký tự.' };
  if (!link && intro.length < 20) return { field: 'link', error: 'Bạn gửi link CV, hoặc giới thiệu bản thân ít nhất 20 ký tự.' };
  if (body.consent !== true) return { field: 'consent', error: 'Bạn cần đồng ý để DANAVA được dùng thông tin xét tuyển.' };
  return { application: { name, phone, email, position, link, intro } };
}

/** Hồ sơ được lưu chung bảng khách hàng liên hệ, nhận ra bằng tiền tố "Ứng tuyển". */
export function applicationLead({ name, phone, email, position, link, intro }: Application) {
  return {
    name, phone, email,
    business_type: 'Ứng viên',
    service: `Ứng tuyển · ${position.label}`.slice(0, 200),
    source: '/tuyen-dung/',
    message: [`Vị trí: ${position.label}`, link && `CV / portfolio: ${link}`, intro && `Giới thiệu: ${intro}`, 'Đã đồng ý cho sử dụng thông tin để xét tuyển.'].filter(Boolean).join('\n')
  };
}
