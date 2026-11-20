/**
 * Khối nội dung chỉnh sửa được trong CMS (Thông tin công ty, Chữ trên các trang, Về DANAVA,
 * Hệ sinh thái, Hồ sơ nhân sự, Chính sách riêng tư, Chính sách dịch vụ).
 *
 * - Giá trị mặc định lấy đúng nội dung đang có trong mã nguồn → website không đổi cho tới khi
 *   quản trị viên sửa và lưu.
 * - Dữ liệu lưu ở SiteData.blocks[key]; đọc bằng block(data, key): thiếu khóa nào thì lấy mặc định.
 * - validBlocks(): dữ liệu lưu phải cùng cấu trúc với mặc định (cùng kiểu, không thêm khóa lạ,
 *   giới hạn độ dài) để một lần sửa sai không làm hỏng trang công khai.
 */
import type { Person, SiteData } from './content';
import { CONTACT, SOCIAL, company } from './company.ts';
import { ECOSYSTEM_CATEGORIES, JOURNEY_STAGES, LIVE_PRODUCTS, initialEcosystemUnits } from './ecosystem.ts';
import { PROJECT_STAFF_ASSIGNMENTS, getStaffDetail, getStaffProfile } from './staff.ts';
import { APPROVED_SERVICE_POLICIES, DRAFT_POLICY_CLAUSES, SERVICE_POLICY_METADATA, SLA_MATRIX, SUPPORT_CHANNELS } from './service-policy.ts';
import { COLLAB_STEPS, GOALS, MILESTONES, MOMENTS, PRINCIPLES } from '../components/site/company-content.ts';

/* ------------------------------------------------------------ Mặc định */
const COMPANY = {
  companyName: SERVICE_POLICY_METADATA.companyName,
  representative: SERVICE_POLICY_METADATA.representative,
  address: CONTACT.address,
  legalAddress: SERVICE_POLICY_METADATA.address,
  street: CONTACT.street,
  city: CONTACT.city,
  hours: CONTACT.hours,
  mapUrl: CONTACT.mapUrl,
  supportEmail: SERVICE_POLICY_METADATA.supportEmail,
  facebook: SOCIAL.facebook,
  youtube: SOCIAL.youtube,
  mission: company.mission,
  overview: company.overview
};

/** Chữ đầu trang (kicker, tiêu đề, câu dẫn) và dải kêu gọi liên hệ cuối trang. *chữ* = phần nhấn mạnh. */
const PAGES = {
  'mac-dinh': { ctaTitle: 'Bắt đầu cùng DANAVA', ctaLead: 'Chia sẻ bài toán của bạn. Chuyên viên DANAVA sẽ liên hệ lại để tư vấn giải pháp phù hợp, không ràng buộc.' },
  've-danava': { kicker: 'Về DANAVA', title: 'Đồng hành bằng công nghệ. *Gắn kết bằng giá trị thực.*', lead: 'DANAVA Solutions là đơn vị công nghệ, truyền thông và trải nghiệm tại Đà Nẵng. Chúng tôi giải quyết bài toán vận hành thực tế cho phòng tập, studio wellness và doanh nghiệp dịch vụ, biến quy trình thủ công thành nền tảng số gọn nhẹ.', ctaTitle: 'Sẵn sàng cùng bạn bắt đầu', ctaLead: '' },
  'giai-phap': { kicker: 'Giải pháp', title: 'Đúng giải pháp cho *từng bài toán*', lead: 'Từ phần mềm vận hành đến truyền thông và trải nghiệm khách hàng, chọn thứ doanh nghiệp bạn cần ngay hôm nay và mở rộng khi sẵn sàng.', ctaTitle: 'Cần tư vấn trực tiếp?', ctaLead: 'Chuyên viên DANAVA sẽ lắng nghe và đề xuất giải pháp phù hợp với quy mô, ngân sách của bạn.' },
  'du-an': { kicker: 'Dự án', title: 'Câu chuyện *triển khai thực tế*', lead: 'Những doanh nghiệp đang vận hành cùng DANAVA. Mỗi case study ghi rõ phạm vi đã thực hiện và nguồn đối chiếu.', ctaTitle: 'Dự án tiếp theo có thể là của bạn', ctaLead: 'Chia sẻ bài toán của doanh nghiệp, DANAVA sẽ đề xuất cách triển khai phù hợp.' },
  'kien-thuc': { kicker: 'Kiến thức', title: 'Kiến thức & tin hoạt động từ DANAVA', lead: 'Bài viết về vận hành phòng tập, website, yoga, du lịch và những hoạt động cộng đồng DANAVA đồng hành.', ctaTitle: 'Cần trao đổi cho trường hợp cụ thể?', ctaLead: 'Kể cho DANAVA về doanh nghiệp của bạn, chuyên viên sẽ liên hệ lại để tư vấn.' },
  'he-sinh-thai': { kicker: 'Hệ sinh thái DANAVA', title: 'Hệ sinh thái mở, *giá trị kết nối.*', lead: 'Phần mềm và website giúp vận hành, sự kiện và trải nghiệm tạo dấu ấn, nền tảng và cộng đồng giữ khách hàng ở lại. Doanh nghiệp bắt đầu từ một giải pháp và mở rộng khi cần, tất cả do DANAVA Solutions phát triển và vận hành.', ctaTitle: 'Bắt đầu từ một mảnh ghép', ctaLead: 'Chia sẻ nhu cầu hiện tại, DANAVA đề xuất giải pháp phù hợp và cách kết nối với các phần còn lại khi bạn sẵn sàng.' },
  'doi-tac': { kicker: 'Đối tác đồng hành', title: 'Những cơ sở *cùng phát triển* trong hệ sinh thái DANAVA', lead: 'Phòng tập, studio, trung tâm đào tạo và cộng đồng wellness đang có mặt trên nền tảng danava.vn.', ctaTitle: 'Trở thành đối tác trong hệ sinh thái DANAVA', ctaLead: 'Cơ sở của bạn vận hành bằng DANAVA Studio và có mặt trên nền tảng danava.vn. Trao đổi với DANAVA để bắt đầu.' },
  'doi-ngu': { kicker: 'Con người DANAVA', title: 'Đội ngũ chuyên môn', lead: 'Những người trực tiếp tư vấn, xây dựng và vận hành giải pháp cho khách hàng. Mỗi hồ sơ gắn với dự án thật mà họ đã tham gia.', ctaTitle: 'Làm việc cùng đội ngũ DANAVA', ctaLead: 'Gặp trực tiếp người phụ trách giải pháp phù hợp với bài toán của bạn.' },
  'lien-he': { kicker: 'Contact · DANAVA', title: 'Liên hệ *DANAVA Solutions*', lead: 'DANAVA luôn lắng nghe mọi ý kiến của khách hàng. Hãy liên hệ để nhận tư vấn miễn phí và báo giá chi tiết cho phần mềm quản lý phòng tập, website, truyền thông và sự kiện.' },
  studio: { ctaTitle: 'Xem DANAVA Studio chạy với dữ liệu của bạn', ctaLead: 'Đăng ký demo, chuyên viên DANAVA liên hệ để tìm hiểu mô hình và hướng dẫn trực tiếp trên phần mềm.' },
  website: { ctaTitle: 'Bắt đầu website của bạn', ctaLead: 'Gửi mục tiêu và vài website bạn thích, DANAVA đề xuất cấu trúc, phong cách và báo giá.' },
  'case-study': { ctaTitle: 'Bạn cần một website có bản sắc riêng?', ctaLead: 'Gửi mục tiêu và vài website bạn thích, DANAVA đề xuất cấu trúc, phong cách và báo giá.' }
};

const ABOUT = {
  goals: GOALS.map(g => ({ ...g })),
  milestones: MILESTONES.map(m => ({ ...m })),
  moments: MOMENTS.map(m => ({ ...m })),
  principles: PRINCIPLES.map(p => ({ ...p })),
  steps: COLLAB_STEPS.map(s => ({ ...s }))
};

const ECOSYSTEM = {
  categories: ECOSYSTEM_CATEGORIES.filter(c => c.id !== 'all').map(c => ({ ...c })),
  allLabel: ECOSYSTEM_CATEGORIES.find(c => c.id === 'all')!.shortDesc,
  journey: JOURNEY_STAGES.map(s => ({ ...s })),
  units: initialEcosystemUnits.map(u => ({ statusText: '', screenshot: '', stage: '', live: [], ...structuredClone(u) })),
  live: structuredClone(LIVE_PRODUCTS)
};

/** Hồ sơ nhân sự — một mục cho mỗi người trong danh sách nhân sự mặc định. */
export type StaffBlock = {
  id: string;
  departmentId: string; departmentName: string; departmentKicker: string; expertise: string[]; bio: string;
  portfolio: { title: string; href: string; desc: string; badge: string }[];
  profileDepartmentName: string; profileDepartmentKicker: string; intro: string; experienceYears: string;
  skillGroups: { category: string; skills: string[] }[];
  personalProducts: { title: string; description: string; badge: string; link: string }[];
  verifiedLinks: { label: string; url: string; type: string }[];
  projectRoles: { projectId: string; role: string; contributions: string[]; resultHighlight: string }[];
};
export function staffDefault(person: Person): StaffBlock {
  const d = getStaffDetail(person);
  const p = getStaffProfile(person, []);
  return {
    id: person.id,
    departmentId: d.departmentId, departmentName: d.departmentName, departmentKicker: d.departmentKicker, expertise: [...d.expertise], bio: d.bio,
    portfolio: d.portfolio.map(x => ({ title: x.title, href: x.href, desc: x.desc, badge: x.badge || '' })),
    profileDepartmentName: p.departmentName, profileDepartmentKicker: p.departmentKicker, intro: p.intro, experienceYears: p.experienceYears,
    skillGroups: p.skillGroups.map(g => ({ category: g.category, skills: [...g.skills] })),
    personalProducts: p.personalProducts.map(x => ({ title: x.title, description: x.description, badge: x.badge, link: x.link || '' })),
    verifiedLinks: p.verifiedLinks.map(x => ({ ...x })),
    projectRoles: Object.entries(PROJECT_STAFF_ASSIGNMENTS).flatMap(([projectId, m]) => m[person.id]
      ? [{ projectId, role: m[person.id].role, contributions: [...m[person.id].contributions], resultHighlight: m[person.id].resultHighlight || '' }] : [])
  };
}

const md = (s: string) => s;
const PRIVACY = {
  eyebrow: 'DANAVA SOLUTIONS · Minh bạch & trách nhiệm',
  title: 'Chính sách quyền riêng tư',
  lead: 'Cách DANAVA Solutions tiếp nhận dữ liệu qua form liên hệ, đo lường truy cập nội bộ và bảo vệ quyền riêng tư của khách truy cập.',
  badges: ['Phiên bản đối chiếu kỹ thuật: Tháng 11/2026', 'Đang áp dụng trên website DANAVA'],
  summary: [
    { title: 'Không bán dữ liệu', text: 'Dữ liệu liên hệ và yêu cầu tư vấn được lưu trữ nội bộ, không chia sẻ cho bên thứ ba vì mục đích thương mại.' },
    { title: 'Đo lường ẩn danh', text: 'Hệ thống đo lường tự phát triển mã hóa SHA-256 một chiều, không thu thập địa chỉ IP, không theo dõi liên trang.' },
    { title: 'Nội dung nhúng khi bạn chọn', text: 'Video YouTube hay bài đăng mạng xã hội chỉ kết nối khi bạn chủ động bấm xem, tránh cookie theo dõi ngầm.' },
    { title: 'Quyền kiểm soát của bạn', text: 'Bạn có thể yêu cầu kiểm tra, trích xuất hoặc xóa vĩnh viễn thông tin liên hệ đã gửi bất kỳ lúc nào.' }
  ],
  sections: [
    { id: 'pham-vi', title: 'Phạm vi áp dụng & nguyên tắc chung', body: md('Chính sách này áp dụng cho toàn bộ khách truy cập, đối tác và khách hàng sử dụng website chính thức của **DANAVA Solutions** tại tên miền `danava.com.vn` (và các chuyển hướng liên quan).\n\nChúng tôi tôn trọng quyền riêng tư của mọi cá nhân và tổ chức. Các hoạt động thu thập và xử lý dữ liệu được thiết kế bám sát thực tế vận hành kỹ thuật của website, tuân thủ quy định hiện hành của pháp luật Việt Nam (bao gồm Luật An toàn thông tin mạng và Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân).') },
    { id: 'form-lien-he', title: 'Dữ liệu tiếp nhận qua form liên hệ', body: md('Khi bạn chủ động gửi yêu cầu tư vấn qua trang [Liên hệ](/lien-he/) hoặc các nút nhận tư vấn trên website, hệ thống tiếp nhận các thông tin sau:\n\n- **Họ và tên:** để xưng hô trong quá trình trao đổi.\n- **Số điện thoại:** kênh liên lạc chính để chuyên viên khảo sát nhu cầu và phản hồi giải pháp.\n- **Email** (tùy chọn): để gửi hồ sơ năng lực, tài liệu demo và đề xuất báo giá.\n- **Loại hình kinh doanh** (Gym, Yoga, Pilates, Spa, Khách sạn…): giúp chuẩn bị đúng tài liệu nghiệp vụ.\n- **Dịch vụ quan tâm:** giải pháp bạn đang tìm hiểu (DANAVA Studio, Website, Sự kiện & Truyền thông, Du lịch).\n- **Nội dung trao đổi:** hiện trạng, quy mô hoặc bài toán bạn cần giải quyết.\n- **Trang nguồn (Referrer):** trang bạn đang xem trước khi bấm liên hệ, để hiểu ngữ cảnh yêu cầu.\n\n> **Chống spam & gửi lặp:** Biểu mẫu tích hợp trường bẫy Honeypot để lọc bot tự động và giới hạn tần suất gửi trong 45 giây để ngăn gửi lặp liên tục.') },
    { id: 'analytics', title: 'Đo lường truy cập nội bộ', body: md('Website sử dụng hệ thống đo lường truy cập tự phát triển, lưu trực tiếp trên máy chủ nội bộ với tiêu chí bảo vệ quyền riêng tư cao nhất:\n\n- **Mã hóa danh tính một chiều (SHA-256):** mã phiên và mã thiết bị được băm SHA-256 ngay khi tiếp nhận, không thể dịch ngược để truy vết người dùng.\n- **Không lưu địa chỉ IP:** hệ thống không lưu địa chỉ IP đầy đủ của bạn trong cơ sở dữ liệu.\n- **Rút gọn nguồn truy cập:** URL nguồn được lược bỏ tham số truy vấn, chỉ giữ tên miền (ví dụ `google.com`, `facebook.com`).\n- **Không dùng cookie bên thứ ba:** website không cài mã theo dõi Google Analytics, Meta Pixel hay mạng quảng cáo liên kết.\n- **Tôn trọng Do Not Track:** nếu trình duyệt bật tín hiệu DNT, hệ thống tự động ngừng ghi nhận phiên.') },
    { id: 'embeds', title: 'Nội dung nhúng bên thứ ba', body: md('Trên mục [Kiến thức DANAVA](/kien-thuc/), chúng tôi có thể dẫn nguồn hoặc cho phép xem trực tiếp video, bài đăng từ YouTube, Facebook hoặc Zalo OA:\n\n- **Tải khi tương tác (click-to-load):** mặc định website không tự tải iframe bên thứ ba, giúp trang nhanh hơn và tránh cookie theo dõi ngầm.\n- **Chế độ YouTube No-Cookie:** khi bạn chủ động bấm xem, video được kết nối qua tên miền `youtube-nocookie.com`.\n- **Luôn có liên kết gốc:** mỗi bài đăng mạng xã hội đều kèm đường dẫn chính thức để mở trên nền tảng nguồn.') },
    { id: 'luu-tru-bao-mat', title: 'Thời gian lưu trữ & biện pháp bảo mật', body: '' },
    { id: 'quyen-khach-hang', title: 'Quyền của khách hàng đối với dữ liệu cá nhân', body: 'Theo quy định pháp luật về bảo vệ dữ liệu cá nhân, bạn có các quyền sau:' },
    { id: 'xac-nhan-chu-website', title: 'Các điều khoản nội bộ chờ chủ doanh nghiệp xác nhận', body: 'Các điều khoản dưới đây được dự thảo dựa trên hoạt động kỹ thuật thực tế và **cần Ban Giám đốc phê duyệt chính thức**.' },
    { id: 'thong-tin-lien-he', title: 'Đơn vị chịu trách nhiệm & cách thức liên hệ', body: 'Nếu bạn có thắc mắc hoặc muốn yêu cầu xóa, chỉnh sửa thông tin cá nhân, vui lòng liên hệ:' }
  ],
  storage: [
    { type: 'Dữ liệu liên hệ (Leads)', mechanism: 'Cơ sở dữ liệu SQLite trên máy chủ, phân vùng độc lập', retention: 'Theo chu kỳ chăm sóc khách hàng (hoặc xóa theo yêu cầu)', access: 'Chỉ quản trị viên đã đăng nhập phiên xác thực' },
    { type: 'Nhật ký đo lường (Visits)', mechanism: 'Mã băm SHA-256 ẩn danh, không có địa chỉ IP', retention: '**Tối đa 90 ngày** (tự động dọn dẹp hằng ngày)', access: 'Báo cáo thống kê nội bộ tổng hợp' },
    { type: 'Phiên quản trị (Sessions)', mechanism: 'Session token & bảo vệ CSRF', retention: 'Hết hạn tự động sau mỗi phiên làm việc', access: 'Quản trị viên DANAVA' }
  ],
  rights: [
    { title: 'Quyền được biết', text: 'Biết rõ mục đích, phạm vi và cách thức dữ liệu của mình được xử lý.' },
    { title: 'Quyền truy cập & chỉnh sửa', text: 'Yêu cầu kiểm tra lại hoặc đính chính thông tin liên hệ đã cung cấp.' },
    { title: 'Quyền yêu cầu xóa', text: 'Yêu cầu xóa toàn bộ số điện thoại, email và nội dung liên hệ khỏi cơ sở dữ liệu.' },
    { title: 'Quyền rút lại đồng ý', text: 'Từ chối nhận các cuộc gọi tư vấn tiếp theo từ DANAVA bất kỳ lúc nào.' }
  ],
  pendingBadge: 'CẦN CHỦ WEBSITE XÁC NHẬN TRƯỚC KHI XUẤT BẢN CHÍNH THỨC',
  pending: [
    { tag: 'XÁC NHẬN 01 · Thời hạn lưu trữ leads', title: 'Thời gian lưu trữ dữ liệu liên hệ khách hàng', text: '**Đề xuất:** Dữ liệu từ form liên hệ (họ tên, điện thoại, email, bài toán) được lưu tối đa **24 tháng** kể từ lần tương tác cuối cùng để phục vụ chăm sóc và bảo hành, hoặc được xóa ngay khi khách hàng gửi email yêu cầu.', status: 'Trạng thái: đang chờ chủ website duyệt thời hạn' },
    { tag: 'XÁC NHẬN 02 · Đầu mối bảo vệ dữ liệu (DPO)', title: 'Nhân sự đầu mối tiếp nhận khiếu nại quyền riêng tư', text: '**Đề xuất:** Đại diện tiếp nhận và xử lý yêu cầu quyền riêng tư là **Ông Lê Tấn Thành (Founder & CEO)**. Thời gian phản hồi và hoàn tất xóa dữ liệu cá nhân theo yêu cầu là trong vòng **72 giờ làm việc**.', status: 'Trạng thái: đang chờ chủ website duyệt quy trình tiếp nhận' },
    { tag: 'XÁC NHẬN 03 · Mã theo dõi bên thứ ba', title: 'Cam kết không tích hợp công cụ theo dõi tiếp thị', text: '**Đề xuất:** Website duy trì mô hình đo lường nội bộ, không cài Google Tag Manager hay Meta Pixel khi chưa có biểu ngữ xin phép cookie đạt chuẩn.', status: 'Trạng thái: đang chờ chủ website xác nhận định hướng truyền thông' }
  ],
  issuerAddress: '08 Đặng Vũ Hỷ, Phường An Hải, Quận Sơn Trà, TP. Đà Nẵng',
  issuerEmailNote: '(hoặc danavadigital@gmail.com)'
};

const SERVICE_POLICY = {
  version: SERVICE_POLICY_METADATA.version,
  lastUpdated: SERVICE_POLICY_METADATA.lastUpdated,
  effectiveDate: SERVICE_POLICY_METADATA.effectiveDate,
  groups: structuredClone(APPROVED_SERVICE_POLICIES),
  sla: structuredClone(SLA_MATRIX),
  channels: structuredClone(SUPPORT_CHANNELS),
  drafts: structuredClone(DRAFT_POLICY_CLAUSES)
};

/** Giá trị mặc định (staff tính khi gọi để tránh vòng import với lib/content). */
export function blockDefaults(staff: Person[] = []) {
  return {
    company: COMPANY,
    pages: PAGES,
    about: ABOUT,
    ecosystem: ECOSYSTEM,
    staff: staff.map(staffDefault),
    privacy: PRIVACY,
    servicePolicy: SERVICE_POLICY
  };
}
export type BlockDefaults = ReturnType<typeof blockDefaults>;
export type BlockKey = keyof BlockDefaults;
export type Blocks = { [K in BlockKey]?: BlockDefaults[K] };
export const BLOCK_KEYS: BlockKey[] = ['company', 'pages', 'about', 'ecosystem', 'staff', 'privacy', 'servicePolicy'];

/* ------------------------------------------------------------ Đọc */
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
/** Bổ sung khóa thiếu (đệ quy cho object); mảng giữ nguyên lựa chọn của quản trị viên. */
function fillMissing<T>(value: unknown, def: T): T {
  if (isObj(def) && isObj(value)) {
    const out: Record<string, unknown> = { ...value };
    for (const k of Object.keys(def)) out[k] = k in value ? fillMissing(value[k], (def as Record<string, unknown>)[k]) : (def as Record<string, unknown>)[k];
    return out as T;
  }
  return (value === undefined ? def : value) as T;
}

export function block<K extends BlockKey>(data: Pick<SiteData, 'blocks' | 'staff'>, key: K): BlockDefaults[K] {
  const def = (key === 'staff' ? blockDefaults(data.staff).staff : blockDefaults()[key]) as BlockDefaults[K];
  const saved = (data.blocks as Blocks | undefined)?.[key];
  return saved === undefined ? def : fillMissing(saved, def);
}

/** Chữ của một trang; ô để trống trong CMS → dùng chữ mặc định. */
export function pageCopy<P extends keyof typeof PAGES>(data: Pick<SiteData, 'blocks' | 'staff'>, page: P): (typeof PAGES)[P] {
  const saved = block(data, 'pages')[page] as Record<string, string>;
  const out: Record<string, string> = { ...(PAGES[page] as Record<string, string>) };
  for (const [k, v] of Object.entries(saved)) if (typeof v === 'string' && v.trim()) out[k] = v;
  return out as (typeof PAGES)[P];
}

/** Hồ sơ nhân sự đã sửa trong CMS (nếu có) cho một người. */
export function staffBlockFor(data: Pick<SiteData, 'blocks' | 'staff'>, person: Person): StaffBlock {
  return block(data, 'staff').find(x => x.id === person.id) || staffDefault(person);
}

/* ------------------------------------------------------------ Kiểm tra cấu trúc */
type Tpl = { kind: 'str' } | { kind: 'num' } | { kind: 'bool' } | { kind: 'arr'; item: Tpl | null } | { kind: 'obj'; keys: Record<string, Tpl>; required: Set<string> };
function tplOf(v: unknown): Tpl | null {
  if (typeof v === 'string') return { kind: 'str' };
  if (typeof v === 'number') return { kind: 'num' };
  if (typeof v === 'boolean') return { kind: 'bool' };
  if (Array.isArray(v)) return { kind: 'arr', item: v.map(tplOf).reduce<Tpl | null>((a, b) => merge(a, b), null) };
  if (isObj(v)) {
    const keys: Record<string, Tpl> = {};
    for (const [k, x] of Object.entries(v)) { const t = tplOf(x); if (t) keys[k] = t; }
    return { kind: 'obj', keys, required: new Set(Object.keys(keys)) };
  }
  return null;
}
function merge(a: Tpl | null, b: Tpl | null): Tpl | null {
  if (!a) return b; if (!b) return a;
  if (a.kind === 'obj' && b.kind === 'obj') {
    const keys: Record<string, Tpl> = { ...a.keys };
    for (const [k, t] of Object.entries(b.keys)) keys[k] = merge(keys[k] || null, t)!;
    return { kind: 'obj', keys, required: new Set([...a.required].filter(k => b.required.has(k))) };
  }
  if (a.kind === 'arr' && b.kind === 'arr') return { kind: 'arr', item: merge(a.item, b.item) };
  return a;
}
function fits(v: unknown, t: Tpl, depth = 0): boolean {
  if (depth > 8) return false;
  switch (t.kind) {
    case 'str': return typeof v === 'string' && v.length <= 6000;
    case 'num': return typeof v === 'number' && Number.isFinite(v);
    case 'bool': return typeof v === 'boolean';
    case 'arr': return Array.isArray(v) && v.length <= 200 && (t.item ? v.every(x => fits(x, t.item!, depth + 1)) : v.every(x => typeof x === 'string' && x.length <= 6000));
    case 'obj': return isObj(v) && Object.keys(v).every(k => k in t.keys && fits(v[k], t.keys[k], depth + 1)) && [...t.required].every(k => k in v);
  }
}
/** Mẫu cấu trúc đầy đủ của một hồ sơ nhân sự (mọi danh sách có một phần tử) để kiểm tra dữ liệu lưu. */
const STAFF_SAMPLE: StaffBlock = {
  id: '', departmentId: '', departmentName: '', departmentKicker: '', expertise: [''], bio: '',
  portfolio: [{ title: '', href: '', desc: '', badge: '' }],
  profileDepartmentName: '', profileDepartmentKicker: '', intro: '', experienceYears: '',
  skillGroups: [{ category: '', skills: [''] }],
  personalProducts: [{ title: '', description: '', badge: '', link: '' }],
  verifiedLinks: [{ label: '', url: '', type: '' }],
  projectRoles: [{ projectId: '', role: '', contributions: [''], resultHighlight: '' }]
};
let TPL: Partial<Record<BlockKey, Tpl>> | null = null;
function templates(): Partial<Record<BlockKey, Tpl>> {
  if (TPL) return TPL;
  const d = blockDefaults() as Record<BlockKey, unknown>;
  TPL = {};
  for (const k of BLOCK_KEYS) TPL[k] = tplOf(k === 'staff' ? [STAFF_SAMPLE] : d[k])!;
  return TPL;
}
/** Hợp lệ khi: object, chỉ gồm khóa đã biết, mỗi khối đúng cấu trúc mặc định, tổng dung lượng ≤ 600 KB. */
export function validBlocks(v: unknown): boolean {
  if (v === undefined) return true;
  if (!isObj(v)) return false;
  if (JSON.stringify(v).length > 600_000) return false;
  const tpl = templates();
  // Khối "pages": các trang có thể được để trống từng trường → không bắt buộc đủ khóa
  return Object.entries(v).every(([k, x]) => {
    const t = tpl[k as BlockKey];
    if (!t) return false;
    return fits(x, k === 'pages' || k === 'company' ? relax(t) : t);
  });
}
function relax(t: Tpl): Tpl {
  if (t.kind === 'obj') return { kind: 'obj', keys: Object.fromEntries(Object.entries(t.keys).map(([k, x]) => [k, relax(x)])), required: new Set() };
  return t;
}
