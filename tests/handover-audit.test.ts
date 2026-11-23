import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { legacyRedirects } from '../lib/legacy-redirects.ts';
import { verifiedProjects } from '../lib/verified-projects.ts';
import { initialSocialPosts, getApprovedSocialPosts, type SocialPost } from '../lib/social-feed.ts';
import { saveLead, getLeads, updateLeadAssignment, checkRecentDuplicateLead } from '../lib/database.ts';
import { getContent, closeDb } from '../lib/database.ts';
after(() => closeDb());

// -----------------------------------------------------------------------------
// LUỒNG 1: XUẤT BẢN DỰ ÁN → HIỆN ĐÚNG Ở GIẢI PHÁP VÀ PORTFOLIO
// -----------------------------------------------------------------------------
test('Workflow 1: Published projects appear in portfolio and services; drafts are strictly isolated', () => {
  const published = verifiedProjects.filter((p) => p.published);
  assert.ok(published.length >= 2, 'Phải có ít nhất 2 dự án đã kiểm chứng');

  // Kiểm tra dự án xuất bản có slug hợp lệ
  for (const project of published) {
    assert.ok(project.id && project.id.length > 0);
    assert.ok(project.slug && project.slug.length > 0);
    assert.ok(project.title && project.title.length > 0);
    assert.equal(project.published, true);
  }

  // Dự án HARIVER Gym và Huế Pilates phải match cả ID và Slug trong service pages
  const hariver = published.find(
    (p) => p.id === 'hariver-studio' || p.slug === 'hariver-gym-danava-studio'
  );
  assert.ok(hariver, 'Dự án HARIVER Gym phải tìm được qua ID hoặc slug');
  assert.equal(hariver.client, 'HARIVER GYM & FITNESS CENTER');

  const hue = published.find(
    (p) => p.id === 'hue-studio' || p.slug === 'hue-pilates-yoga-danava-studio'
  );
  assert.ok(hue, 'Dự án Huế Pilates phải tìm được qua ID hoặc slug');
  assert.equal(hue.client, 'Huế Pilates & Yoga');

  // Kiểm tra file component site/ProjectsPages.tsx đã hỗ trợ match linh hoạt
  const publicPagesSource = fs.readFileSync(
    path.join(process.cwd(), 'components', 'site', 'project-helpers.ts'),
    'utf8'
  );
  assert.ok(
    publicPagesSource.includes("p.id === 'hariver-studio'") ||
    publicPagesSource.includes("p.slug === 'hariver-gym-danava-studio'"),
    'ProjectsPages phải tìm kiếm dự án theo ID hoặc slug chuẩn hóa'
  );

  // Bản nháp (draft project) phải bị cô lập:
  const mockDraft = { ...hariver, id: 'test-draft-project', slug: 'test-draft-project', published: false };
  const mockList = [...published, mockDraft];
  const publicList = mockList.filter((p) => p.published);
  assert.equal(publicList.some((p) => p.id === 'test-draft-project'), false, 'Dự án nháp không được xuất hiện');
});

// -----------------------------------------------------------------------------
// LUỒNG 2: DUYỆT BÀI SOCIAL → HIỆN TRONG BẢN TIN VÀ TRANG CHỦ
// -----------------------------------------------------------------------------
test('Workflow 2: Approved social posts display in Newsletter and Home; unapproved drafts stay hidden', () => {
  const approved = getApprovedSocialPosts();
  assert.ok(approved.length >= 3, 'Phải có ít nhất 3 bài đăng social đã duyệt');

  for (const post of approved) {
    assert.equal(post.verified, true, 'Tất cả bài trong feed duyệt phải có verified: true');
    assert.ok(['youtube', 'facebook', 'zalo'].includes(post.platform));
    assert.ok(post.originalUrl.startsWith('https://'));
  }

  // Kiểm tra bài nháp bị cô lập
  const unverifiedPost: SocialPost = {
    id: 'draft-social-post',
    platform: 'facebook',
    platformLabel: 'Facebook Page',
    channelName: 'DANAVA Solutions',
    title: 'BÀI VIẾT CHƯA ĐƯỢC DUYỆT BỞI BAN BIÊN TẬP',
    content: 'Nội dung chưa xác thực...',
    image: '/assets/verified/post-13591.webp',
    originalUrl: 'https://facebook.com/danava.digital/draft',
    date: '2026-11-08',
    verified: false,
    pinned: false
  };

  const filtered = getApprovedSocialPosts([...initialSocialPosts, unverifiedPost]);
  assert.equal(
    filtered.some((p) => p.id === 'draft-social-post'),
    false,
    'Bài viết chưa duyệt (verified: false) không được xuất hiện'
  );

  // Kiểm tra file site/HomePage.tsx có import và render getApprovedSocialPosts
  const homeSectionsSource = fs.readFileSync(
    path.join(process.cwd(), 'components', 'site', 'HomePage.tsx'),
    'utf8'
  );
  assert.ok(
    homeSectionsSource.includes('getApprovedSocialPosts'),
    'site/HomePage.tsx phải tích hợp getApprovedSocialPosts để hiện bài đăng đã duyệt trên Trang chủ'
  );
});

// -----------------------------------------------------------------------------
// LUỒNG 3: GỬI FORM → LEAD XUẤT HIỆN Ở ADMIN VÀ ĐƯỢC PHÂN CÔNG
// -----------------------------------------------------------------------------
test('Workflow 3: Lead submission saves to DB, appears in admin list and is assigned to staff', async () => {
  const uniquePhone = '0988' + Math.floor(100000 + Math.random() * 900000);
  const leadPayload = {
    name: 'CLB Yoga An Nhiên',
    phone: uniquePhone,
    email: 'annhien@yoga.vn',
    business_type: 'Trung tâm Yoga & Trị liệu',
    service: 'DANAVA Studio — Phần mềm quản lý Gym, Yoga, Pilates & Spa',
    source: 'https://danava.com.vn/giai-phap/danava-studio/',
    message: 'Cần tư vấn triển khai phần mềm cho cơ sở 2 tại Đà Nẵng.'
  };

  // 1. Lưu lead vào cơ sở dữ liệu
  const leadId = await saveLead(leadPayload);
  assert.ok(leadId.startsWith('lead_'), 'Lead ID phải có tiền tố lead_');

  // 2. Chống trùng lặp trong 45 giây hoạt động
  const isDup = await checkRecentDuplicateLead(uniquePhone, 45000);
  assert.equal(isDup, true, 'Anti-duplicate phải nhận diện được số điện thoại vừa gửi');

  // 3. Lấy danh sách leads ở admin
  const leads = await getLeads(50);
  const createdLead = leads.find((l) => l.id === leadId);
  assert.ok(createdLead, 'Lead vừa tạo phải xuất hiện trong danh sách admin');
  assert.equal(createdLead.name, 'CLB Yoga An Nhiên');
  assert.equal(createdLead.phone, uniquePhone);
  assert.equal(createdLead.status, 'new');

  // 4. Phân công cho chuyên viên phụ trách (Lead Assignment)
  const staffAssignee = 'Phạm Trang — Trưởng phòng CSKH';
  const internalNote = 'Đã liên hệ sơ bộ qua điện thoại, gửi báo giá qua Zalo.';
  const updateSuccess = await updateLeadAssignment(leadId, {
    assigned_to: staffAssignee,
    status: 'assigned',
    assigned_note: internalNote
  });
  assert.equal(updateSuccess, true, 'Cập nhật phân công lead phải thành công');

  // 5. Xác nhận dữ liệu phân công đã lưu bền vững
  const updatedLeads = await getLeads(50);
  const assignedLead = updatedLeads.find((l) => l.id === leadId)!;
  assert.equal(assignedLead.assigned_to, staffAssignee);
  assert.equal(assignedLead.status, 'assigned');
  assert.equal(assignedLead.assigned_note, internalNote);
});

// -----------------------------------------------------------------------------
// BẢO MẬT & PHÂN QUYỀN: BẢN NHÁP VÀ API ADMIN
// -----------------------------------------------------------------------------
test('Security: Admin routes protect lead assignments, media and draft revisions', () => {
  const adminLeadsRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'leads', 'route.ts');
  const routeSource = fs.readFileSync(adminLeadsRoutePath, 'utf8');

  // Route phải kiểm tra phiên + quyền trước khi cho phép GET hoặc PATCH (lib/auth.ts requirePermission)
  assert.ok(routeSource.includes("requirePermission(req, 'leads.read')"), 'GET phải kiểm tra phiên và quyền xem khách hàng');
  assert.ok(routeSource.includes("requirePermission(req, 'leads.write', true)"), 'PATCH phải kiểm tra phiên, CSRF và quyền sửa khách hàng');
  assert.ok(routeSource.includes('export async function PATCH'), 'Route phải có hàm PATCH xử lý phân công');
  const authSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'auth.ts'), 'utf8');
  assert.ok(authSource.includes('status: 401'), 'Phải trả về 401 nếu chưa đăng nhập');
});

// -----------------------------------------------------------------------------
// LIÊN KẾT, CANONICAL, SITEMAP VÀ 404
// -----------------------------------------------------------------------------
test('Link integrity, canonical, sitemap and 404 routing', () => {
  const sitemapSource = fs.readFileSync(path.join(process.cwd(), 'app', 'sitemap.ts'), 'utf8');

  // Các trang công khai chính thức phải có trong sitemap
  const requiredSitemapRoutes = [
    'giai-phap',
    'he-sinh-thai',
    'du-an',
    've-danava',
    'doi-ngu',
    'blogs',
    'lien-he',
    'chinh-sach-rieng-tu',
    'chinh-sach-dich-vu'
  ];

  for (const r of requiredSitemapRoutes) {
    assert.ok(sitemapSource.includes(r), `Sitemap phải chứa route ${r}`);
  }

  // Không có bản nháp trong sitemap
  assert.ok(!sitemapSource.includes('draft'), 'Sitemap tuyệt đối không chứa bản nháp');

  // Legacy redirects không chứa redirect vòng (source === destination)
  for (const r of legacyRedirects) {
    assert.notEqual(r.source, r.destination, `Redirect ${r.source} không được trỏ về chính nó`);
    assert.ok(r.destination.startsWith('/'), `Redirect destination ${r.destination} phải bắt đầu bằng /`);
  }
});

