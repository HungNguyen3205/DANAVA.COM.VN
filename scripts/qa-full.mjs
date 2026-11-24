// Kiểm thử nghiệm thu toàn dự án qua HTTP trên server production thật (cần `npm run build` trước):
//   node scripts/qa-full.mjs [thư-mục-kết-quả]
// Database SQLite tạm riêng, tài khoản thử nghiệm riêng — không đụng .data/ hay MySQL production.
// Mỗi trường hợp ghi: module, kịch bản, mong đợi, thực tế, trạng thái (PASS/FAIL) → <thư mục>/api-results.json + .md
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'docs/qa/evidence');
const directory = await mkdtemp(join(tmpdir(), 'danava-qa-'));
const salt = randomBytes(16).toString('hex'), password = randomBytes(18).toString('hex');
const hash = salt + ':' + scryptSync(password, salt, 64).toString('hex');
const PORT = 4187, base = `http://localhost:${PORT}`;
const results = [];
let server, logs = '';

async function start() {
  server = spawn(process.execPath, ['server.cjs'], { env: { ...process.env, DANAVA_DB_HOST: '', ANTHROPIC_API_KEY: '', GEMINI_API_KEY: '', DANAVA_DATA_DIR: directory, DANAVA_HOSTNAME: '127.0.0.1', PORT: String(PORT), DANAVA_ADMIN_PASSWORD_HASH: hash, SITE_URL: base }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', v => { logs += v; });
  server.stderr.on('data', v => { logs += v; });
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(base + '/api/admin/session/', { signal: AbortSignal.timeout(1000) }); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw Error('Server not ready: ' + logs.slice(-2000));
}
async function stop() {
  if (server && server.exitCode === null) {
    const child = server;
    await new Promise(r => { const t = setTimeout(() => child.kill('SIGKILL'), 2500); child.once('exit', () => { clearTimeout(t); r(); }); child.kill('SIGTERM'); });
  }
}
const H = { Connection: 'close' };
const raw = (path, options = {}) => fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(30000), ...options, headers: { ...H, ...(options.headers || {}) } });
async function login(credentials, headers = { origin: base }) {
  const r = await raw('/api/admin/session/', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(credentials) });
  const body = await r.json().catch(() => ({}));
  if (r.status !== 200) return { status: r.status, body };
  const cookie = r.headers.get('set-cookie').split(';')[0];
  const req = (path, options = {}) => raw(path, { ...options, headers: { cookie, ...(options.method && options.method !== 'GET' ? { origin: base, 'x-csrf-token': body.csrf, 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
  const json = async (path, options) => { const res = await req(path, options); return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers }; };
  return { status: 200, body, cookie, csrf: body.csrf, req, json };
}

/** Ghi một trường hợp. fn trả { ok, actual }. Lỗi ném ra = FAIL. */
async function check(module, scenario, expected, fn) {
  let ok = false, actual = '';
  try { ({ ok, actual } = await fn()); } catch (e) { actual = 'Lỗi: ' + (e instanceof Error ? e.message : String(e)); }
  results.push({ module, scenario, expected, actual: String(actual).slice(0, 400), status: ok ? 'PASS' : 'FAIL' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${module}] ${scenario} — ${String(actual).slice(0, 160)}`);
}
const eq = (a, b) => ({ ok: a === b, actual: String(a) });

/* Ảnh mẫu hợp lệ (1×1) */
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const JPG = await (await import('sharp')).default({ create: { width: 40, height: 30, channels: 3, background: '#f26b1d' } }).jpeg().toBuffer();

try {
  await start();
  const owner = await login({ password });
  const { ROLES } = await import('../lib/permissions.ts');

  /* ================= 1. Đăng nhập & phiên ================= */
  await check('Hệ thống/Đăng nhập', 'Đăng nhập chủ website bằng mật khẩu máy chủ', '200 + vai trò owner', async () => ({ ok: owner.status === 200 && owner.body.user?.role === 'owner', actual: `${owner.status} ${owner.body.user?.role}` }));
  await check('Hệ thống/Đăng nhập', 'Sai mật khẩu', '401, không cấp cookie', async () => { const r = await raw('/api/admin/session/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base }, body: JSON.stringify({ password: 'sai' }) }); return { ok: r.status === 401 && !r.headers.get('set-cookie'), actual: `${r.status} cookie=${!!r.headers.get('set-cookie')}` }; });
  await check('Hệ thống/Đăng nhập', 'Đăng nhập từ nguồn khác (Origin lạ)', '403', async () => eq((await raw('/api/admin/session/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://evil.example' }, body: JSON.stringify({ password }) })).status, 403));
  for (const [path, method] of [['/api/admin/content/', 'GET'], ['/api/admin/leads/', 'GET'], ['/api/admin/media/', 'GET'], ['/api/admin/users/', 'GET'], ['/api/admin/audit/', 'GET'], ['/api/admin/analytics/', 'GET'], ['/api/admin/revisions/', 'GET']]) {
    await check('Phân quyền/Chưa đăng nhập', `${method} ${path} không có phiên`, '401', async () => eq((await raw(path)).status, 401));
  }
  await check('Phân quyền/CSRF', 'PUT nội dung thiếu mã CSRF', '403', async () => { const r = await raw('/api/admin/content/', { method: 'PUT', headers: { cookie: owner.cookie, origin: base, 'Content-Type': 'application/json' }, body: '{}' }); return eq(r.status, 403); });
  await check('Phân quyền/CSRF', 'PUT nội dung từ Origin lạ (có CSRF)', '403', async () => { const r = await raw('/api/admin/content/', { method: 'PUT', headers: { cookie: owner.cookie, origin: 'https://evil.example', 'x-csrf-token': owner.csrf, 'Content-Type': 'application/json' }, body: '{}' }); return eq(r.status, 403); });
  await check('Bảo mật/Phản hồi', 'Phiên đăng nhập không trả mật khẩu / hash / token', 'Không có trường nhạy cảm', async () => { const r = await owner.json('/api/admin/session/'); const s = JSON.stringify(r.body); return { ok: !/hash|password|token|scrypt/i.test(s) && !s.includes(hash.slice(0, 20)), actual: Object.keys(r.body).join(',') }; });

  /* ================= 2. Tài khoản & ma trận quyền ================= */
  const accounts = {};
  for (const role of ['admin', 'editor', 'writer', 'sales']) {
    const r = await owner.json('/api/admin/users/', { method: 'POST', body: JSON.stringify({ username: `qa.${role}`, name: `QA ${role} Nguyễn Thị Ánh`, role, password: 'mat-khau-qa-2026' }) });
    await check('Hệ thống/Tài khoản', `Tạo tài khoản vai trò ${role} (tên có dấu)`, '201', async () => eq(r.status, 201));
    accounts[role] = await login({ username: `qa.${role}`, password: 'mat-khau-qa-2026' });
  }
  await check('Hệ thống/Tài khoản', 'Tạo trùng tên đăng nhập', '409', async () => eq((await owner.json('/api/admin/users/', { method: 'POST', body: JSON.stringify({ username: 'qa.editor', name: 'x', role: 'editor', password: 'mat-khau-qa-2026' }) })).status, 409));
  await check('Hệ thống/Tài khoản', 'Mật khẩu quá ngắn', '400', async () => eq((await owner.json('/api/admin/users/', { method: 'POST', body: JSON.stringify({ username: 'qa.ngan', name: 'x', role: 'editor', password: '123' }) })).status, 400));
  await check('Bảo mật/Phản hồi', 'Danh sách tài khoản không lộ mật khẩu/hash', 'Không có trường password/hash', async () => { const r = await owner.json('/api/admin/users/'); const s = JSON.stringify(r.body); return { ok: r.status === 200 && !/"(password|hash|salt)"/i.test(s) && !s.includes('mat-khau-qa'), actual: `${r.status} ${s.slice(0, 120)}` }; });

  const matrix = [
    ['GET', '/api/admin/content/', 'content.read'],
    ['GET', '/api/admin/media/', 'media.read'],
    ['GET', '/api/admin/leads/', 'leads.read'],
    ['GET', '/api/admin/users/', 'users.manage'],
    ['GET', '/api/admin/audit/', 'system.manage'],
    ['GET', '/api/admin/analytics/', 'reports.read'],
    ['GET', '/api/admin/revisions/', 'content.read']
  ];
  for (const [role, s] of Object.entries(accounts)) {
    for (const [method, path, perm] of matrix) {
      const allowed = ROLES[role].perms.includes(perm);
      await check('Phân quyền/Ma trận', `${role} ${method} ${path}`, allowed ? '200' : '403', async () => eq((await s.req(path)).status, allowed ? 200 : 403));
    }
  }
  // Ghi nội dung theo vai trò
  const working = async (s = owner) => (await s.json('/api/admin/content/')).body;
  for (const [role, s] of Object.entries(accounts)) {
    const env = await working(owner);
    const draftOk = ROLES[role].perms.includes('content.draft'), pubOk = ROLES[role].perms.includes('content.publish');
    await check('Phân quyền/Ma trận', `${role} lưu nháp nội dung`, draftOk ? '200' : '403', async () => { const r = await s.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: env.data, revision: env.revision, mode: 'draft' }) }); return eq(r.status, draftOk ? 200 : 403); });
    const env2 = await working(owner);
    await check('Phân quyền/Ma trận', `${role} xuất bản nội dung`, pubOk ? '200' : '403', async () => { const r = await s.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: env2.data, revision: env2.revision, mode: 'publish' }) }); return eq(r.status, pubOk ? 200 : 403); });
  }
  await check('Phân quyền/Ma trận', 'writer tải ảnh (media.write)', '201', async () => eq((await accounts.writer.req('/api/admin/media/', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: PNG })).status, 201));
  await check('Phân quyền/Ma trận', 'sales tải ảnh (không có media.write)', '403', async () => eq((await accounts.sales.req('/api/admin/media/', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: PNG })).status, 403));
  await check('Phân quyền/Ma trận', 'editor tạo tài khoản (không có users.manage)', '403', async () => eq((await accounts.editor.json('/api/admin/users/', { method: 'POST', body: JSON.stringify({ username: 'qa.x', name: 'x', role: 'editor', password: 'mat-khau-qa-2026' }) })).status, 403));
  await check('Phân quyền/Ma trận', 'admin tự nâng vai trò owner cho tài khoản khác', '400/403 (không có vai trò owner gán được)', async () => { const list = (await owner.json('/api/admin/users/')).body.users; const id = list.find(u => u.username === 'qa.editor').id; const r = await accounts.admin.json('/api/admin/users/', { method: 'PATCH', body: JSON.stringify({ id, role: 'owner' }) }); return { ok: r.status === 400 || r.status === 403, actual: String(r.status) }; });

  /* ================= 3. Nội dung: nháp, xuất bản, xung đột, hợp lệ ================= */
  const MARK = 'QA_NHAP_Đồng_hành_' + randomBytes(3).toString('hex');
  let env = await working();
  const draftData = { ...env.data, homeHero: { ...(env.data.homeHero || {}), line1: MARK } };
  const saveDraft = await owner.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: draftData, revision: env.revision, mode: 'draft' }) });
  await check('Nội dung/Nháp', 'Lưu nháp chữ màn mở đầu (có dấu)', '200', async () => eq(saveDraft.status, 200));
  await check('Nội dung/Nháp', 'Đọc lại bản nháp qua API admin', 'Có chữ nháp', async () => { const e = await working(); return { ok: e.data.homeHero?.line1 === MARK, actual: e.data.homeHero?.line1 }; });
  const leakPaths = ['/', '/?cms=1', '/sitemap.xml', '/robots.txt', '/blogs/', '/ve-danava/', '/api/anna/', '/lien-he/'];
  for (const p of leakPaths) await check('Bảo mật/Lộ bản nháp', `Khách mở ${p}`, 'Không chứa chữ nháp', async () => { const r = await raw(p); const t = await r.text(); return { ok: !t.includes(MARK), actual: `${r.status} chứa nháp=${t.includes(MARK)}` }; });
  await check('Bảo mật/Lộ bản nháp', 'Khách giả header x-danava-cms: 1', 'Không chứa chữ nháp', async () => { const t = await (await raw('/?cms=1', { headers: { 'x-danava-cms': '1' } })).text(); return { ok: !t.includes(MARK), actual: `chứa nháp=${t.includes(MARK)}` }; });
  await check('Bảo mật/Lộ bản nháp', 'sales (không có content.read) mở /?cms=1', 'Không chứa chữ nháp', async () => { const t = await (await accounts.sales.req('/?cms=1')).text(); return { ok: !t.includes(MARK), actual: `chứa nháp=${t.includes(MARK)}` }; });
  await check('Nội dung/Nháp', 'Admin (content.read) mở /?cms=1 thấy bản nháp', 'Chứa chữ nháp', async () => { const t = await (await owner.req('/?cms=1')).text(); return { ok: t.includes(MARK), actual: `chứa nháp=${t.includes(MARK)}` }; });
  await check('Nội dung/Nháp', 'Admin mở / (không ?cms=1) vẫn thấy bản công khai', 'Không chứa chữ nháp', async () => { const t = await (await owner.req('/')).text(); return { ok: !t.includes(MARK), actual: `chứa nháp=${t.includes(MARK)}` }; });

  env = await working();
  const stale = env.revision;
  const pub = await owner.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: env.data, revision: env.revision, mode: 'publish' }) });
  await check('Nội dung/Xuất bản', 'Xuất bản bản nháp', '200', async () => eq(pub.status, 200));
  await check('Nội dung/Xuất bản', 'Website công khai cập nhật ngay sau xuất bản (không cache cũ)', 'Trang chủ chứa chữ mới', async () => { const t = await (await raw('/')).text(); return { ok: t.includes(MARK), actual: `chứa=${t.includes(MARK)}` }; });
  await check('Nội dung/Xung đột', 'Phiên khác lưu với mã chỉnh sửa cũ', '409, không ghi đè', async () => { const r = await accounts.editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: { ...env.data, homeHero: { line1: 'GHI ĐÈ' } }, revision: stale, mode: 'draft' }) }); const t = await (await raw('/')).text(); return { ok: r.status === 409 && !t.includes('GHI ĐÈ'), actual: `${r.status}` }; });
  await check('Nội dung/Xung đột', 'Bấm Xuất bản hai lần cùng mã (double submit)', 'Lần 2 → 409, không tạo phiên bản trùng', async () => { const e = await working(); const body = JSON.stringify({ data: e.data, revision: e.revision, mode: 'publish' }); const [a, b] = await Promise.all([owner.json('/api/admin/content/', { method: 'PUT', body }), owner.json('/api/admin/content/', { method: 'PUT', body })]); const st = [a.status, b.status].sort(); return { ok: st[0] === 200 && st[1] === 409, actual: st.join('/') }; });

  env = await working();
  const before = JSON.stringify({ posts: env.data.posts, services: env.data.services, staff: env.data.staff });
  await check('Nội dung/Toàn vẹn', 'Sửa một trường không làm mất dữ liệu mục khác', 'posts/services/staff giữ nguyên', async () => { const e = await working(); const r = await owner.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: { ...e.data, homeHero: { ...(e.data.homeHero || {}), kicker: 'DANAVA QA' } }, revision: e.revision, mode: 'publish' }) }); const after = await working(); return { ok: r.status === 200 && JSON.stringify({ posts: after.data.posts, services: after.data.services, staff: after.data.staff }) === before, actual: `${r.status}` }; });

  const bad = async (label, mutate, expectStatus = 400) => check('Nội dung/Kiểm tra BE', label, String(expectStatus), async () => { const e = await working(); const r = await owner.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: mutate(structuredClone(e.data)), revision: e.revision, mode: 'draft' }) }); return eq(r.status, expectStatus); });
  await bad('Đường dẫn nút javascript:', d => ({ ...d, homeHero: { primaryHref: 'javascript:alert(1)' } }));
  await bad('Chữ màn mở đầu quá dài (> 80)', d => ({ ...d, homeHero: { line1: 'x'.repeat(81) } }));
  await bad('Khóa lạ trong màn mở đầu', d => ({ ...d, homeHero: { hacked: '1' } }));
  await bad('Email liên hệ sai kiểu (số)', d => ({ ...d, email: 123 }));
  await bad('Ảnh doanh nghiệp trỏ ra ngoài', d => ({ ...d, extras: { ...(d.extras || {}), gallery: { visible: true, kicker: '', title: '', lead: '', photos: [{ image: 'https://evil.example/a.png', caption: '', alt: '', focus: '', visible: true }] } } }));
  await bad('Thân yêu cầu không phải JSON', () => undefined, 400);
  await check('Nội dung/Kiểm tra BE', 'Dữ liệu quá lớn (> 2 MB)', '413', async () => { const r = await owner.req('/api/admin/content/', { method: 'PUT', body: 'x'.repeat(2_200_000) }); return eq(r.status, 413); });
  await check('Bảo mật/XSS', 'Chữ có <script> lưu được nhưng hiển thị dạng chữ', 'HTML công khai không có thẻ script chèn vào', async () => { const e = await working(); const payload = '<script>window.__xss=1</script><img src=x onerror=alert(1)>'; const r = await owner.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: { ...e.data, homeHero: { ...(e.data.homeHero || {}), lead: payload } }, revision: e.revision, mode: 'publish' }) }); const t = await (await raw('/')).text(); return { ok: r.status === 200 && !t.includes('<script>window.__xss') && !t.includes('<img src=x onerror'), actual: `${r.status} escaped=${t.includes('&lt;script&gt;window.__xss')}` }; });
  // Đường dẫn trùng (slug bài viết)
  await check('Nội dung/Đường dẫn', 'Hai bài viết trùng slug', 'Bị từ chối (400/409) hoặc cảnh báo', async () => { const e = await working(); const p0 = e.data.posts[0]; const dup = { ...p0, id: 'qa-dup-' + randomBytes(3).toString('hex'), title: 'Bài trùng đường dẫn' }; const r = await owner.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: { ...e.data, posts: [...e.data.posts, dup] }, revision: e.revision, mode: 'draft' }) }); return { ok: r.status === 400 || r.status === 409, actual: `${r.status} ${JSON.stringify(r.body).slice(0, 120)}` }; });

  await check('Nội dung/Tham chiếu', 'Bài viết + landing page tham chiếu sản phẩm không tồn tại (gửi thẳng API)', 'Trang bài viết, Blogs và landing vẫn 200, không lỗi máy chủ', async () => {
    const e = await working();
    const post = e.data.posts.find(p => p.published !== false && p.status !== 'archived') || e.data.posts[0];
    const data = { ...e.data, posts: e.data.posts.map(p => p.id === post.id ? { ...p, serviceIds: ['san-pham-da-xoa-qa'] } : p) };
    const r = await owner.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data, revision: e.revision, mode: 'publish' }) });
    const s1 = (await raw(`/blogs/${post.slug}/`)).status, s2 = (await raw('/blogs/')).status, s3 = (await raw('/giai-phap/')).status;
    return { ok: r.status === 200 && s1 === 200 && s2 === 200 && s3 === 200, actual: `lưu ${r.status}; bài ${s1}, Blogs ${s2}, Giải pháp ${s3}` };
  });

  /* ================= 4. Lịch sử & khôi phục ================= */
  const revs = await owner.json('/api/admin/revisions/');
  await check('Hệ thống/Lịch sử', 'Danh sách phiên bản có các lần xuất bản', '≥ 2 phiên bản', async () => { const n = (revs.body.revisions || revs.body.items || []).length; return { ok: revs.status === 200 && n >= 2, actual: `${revs.status} n=${n}` }; });
  await check('Hệ thống/Lịch sử', 'Khôi phục phiên bản không tồn tại', '404', async () => { const e = await working(); return eq((await owner.json('/api/admin/revisions/', { method: 'POST', body: JSON.stringify({ id: 'rev_khong_co', revision: e.revision }) })).status, 404); });
  await check('Hệ thống/Lịch sử', 'writer khôi phục phiên bản (không có quyền xuất bản)', '403', async () => eq((await accounts.writer.json('/api/admin/revisions/', { method: 'POST', body: JSON.stringify({ id: 'x', revision: 1 }) })).status, 403));
  const audit = await owner.json('/api/admin/audit/');
  await check('Hệ thống/Nhật ký', 'Nhật ký thao tác ghi đăng nhập/xuất bản/tạo tài khoản', 'Có các loại thao tác', async () => { const s = JSON.stringify(audit.body); return { ok: audit.status === 200 && s.includes('dang-nhap') && s.includes('xuat-ban') && s.includes('tao-tai-khoan'), actual: `${audit.status} ${(audit.body.entries || []).length} mục` }; });

  /* ================= 5. Biểu mẫu khách hàng ================= */
  const lead = (body, headers = {}) => raw('/api/lead/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  const okLead = { name: 'Trần Thị Bích Ngọc', phone: '0905123456', email: 'qa@example.com', service: 'DANAVA Studio', message: 'Cần tư vấn cho chuỗi 3 chi nhánh Yoga & Spa', source: 'lien-he' };
  const r1 = await lead(okLead);
  await check('Khách hàng/Biểu mẫu', 'Gửi yêu cầu tư vấn hợp lệ (tiếng Việt)', '201', async () => eq(r1.status, 201));
  await check('Khách hàng/Biểu mẫu', 'Gửi lặp ngay (double submit) cùng SĐT', '429, không tạo trùng', async () => eq((await lead(okLead)).status, 429));
  for (const [label, body] of [['Thiếu họ tên', { ...okLead, name: '', phone: '0905000001' }], ['SĐT sai', { ...okLead, phone: '12ab', name: 'Lê Văn A' }], ['Email sai', { ...okLead, email: 'abc@', phone: '0905000002' }], ['Nội dung > 5.000 ký tự', { ...okLead, phone: '0905000003', message: 'x'.repeat(5001) }], ['JSON hỏng', '{"name":']]) {
    await check('Khách hàng/Biểu mẫu', label, '400', async () => eq((await lead(body)).status, 400));
  }
  await check('Khách hàng/Biểu mẫu', 'Bot điền trường bẫy (honeypot)', '201 giả, không lưu', async () => { const r = await lead({ ...okLead, phone: '0905000009', website_trap: 'http://spam' }); const list = (await owner.json('/api/admin/leads/')).body.leads; return { ok: r.status === 201 && !list.some(l => l.phone === '0905000009'), actual: `${r.status} lưu=${list.some(l => l.phone === '0905000009')}` }; });
  await check('Khách hàng/Biểu mẫu', 'Gửi từ website khác (Origin lạ)', '403 (chặn gửi hộ từ trang ngoài)', async () => eq((await lead({ ...okLead, phone: '0905000010' }, { origin: 'https://evil.example' })).status, 403));
  await check('Khách hàng/Biểu mẫu', 'Thân yêu cầu rất lớn (3 MB)', '413 hoặc máy chủ đóng kết nối sớm; không lưu', async () => {
    let status = 'đóng kết nối';
    try { status = (await lead(JSON.stringify({ ...okLead, phone: '0905000011', pad: 'x'.repeat(3_000_000) }))).status; } catch {}
    const saved = ((await owner.json('/api/admin/leads/')).body.leads || []).some(l => l.phone === '0905000011');
    return { ok: (status === 413 || status === 'đóng kết nối') && !saved, actual: `${status}, lưu=${saved}` };
  });
  const leads = (await owner.json('/api/admin/leads/')).body.leads || [];
  const mine = leads.find(l => l.phone === '0905123456');
  await check('Khách hàng/Yêu cầu', 'Yêu cầu hiển thị trong admin đúng dữ liệu, chỉ 1 bản', '1 bản, tên có dấu đúng', async () => ({ ok: leads.filter(l => l.phone === '0905123456').length === 1 && mine?.name === okLead.name, actual: `${leads.filter(l => l.phone === '0905123456').length} bản, ${mine?.name}` }));
  await check('Khách hàng/Yêu cầu', 'sales phân công + đổi trạng thái', '200, lưu lại được', async () => { const r = await accounts.sales.json('/api/admin/leads/', { method: 'PATCH', body: JSON.stringify({ id: mine.id, status: 'contacted', assigned_to: 'QA Nguyễn Kinh Doanh' }) }); const again = (await owner.json('/api/admin/leads/')).body.leads.find(l => l.id === mine.id); return { ok: r.status === 200 && again.status === 'contacted' && again.assigned_to === 'QA Nguyễn Kinh Doanh', actual: `${r.status} status=${again.status} assigned_to=${again.assigned_to}` }; });
  await check('Khách hàng/Yêu cầu', 'Cập nhật yêu cầu không tồn tại', '404', async () => eq((await owner.json('/api/admin/leads/', { method: 'PATCH', body: JSON.stringify({ id: 'lead_khong_co', status: 'contacted' }) })).status, 404));
  await check('Khách hàng/Yêu cầu', 'Trạng thái không hợp lệ', '400', async () => eq((await owner.json('/api/admin/leads/', { method: 'PATCH', body: JSON.stringify({ id: mine.id, status: 'hacked' }) })).status, 400));
  await check('Khách hàng/Yêu cầu', 'editor xem khách hàng (không có leads.read)', '403', async () => eq((await accounts.editor.req('/api/admin/leads/')).status, 403));

  /* ================= 6. Tuyển dụng ================= */
  await check('Website/Tuyển dụng', 'Ứng tuyển từ Origin lạ', '403', async () => eq((await raw('/api/recruit/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://evil.example' }, body: '{}' })).status, 403));
  await check('Website/Tuyển dụng', 'Ứng tuyển thiếu dữ liệu', '400', async () => eq((await raw('/api/recruit/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base }, body: '{}' })).status, 400));

  /* ================= 7. Tài nguyên (ảnh) ================= */
  const up = (body, s = owner) => s.req('/api/admin/media/', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body });
  const upPng = await up(PNG); const pngBody = await upPng.json().catch(() => ({}));
  await check('Tài nguyên/Tải ảnh', 'Tải PNG hợp lệ', '201 + đường dẫn /assets/uploads/*.webp', async () => ({ ok: upPng.status === 201 && /^\/assets\/uploads\/[\w-]+\.webp$/.test(pngBody.url || ''), actual: `${upPng.status} ${pngBody.url}` }));
  await check('Tài nguyên/Tải ảnh', 'Tải JPEG hợp lệ', '201', async () => eq((await up(JPG)).status, 201));
  await check('Tài nguyên/Tải ảnh', 'File chữ đổi đuôi thành ảnh', '400', async () => eq((await up(Buffer.from('xin chao, day khong phai anh'))).status, 400));
  await check('Tài nguyên/Tải ảnh', 'PNG hỏng (đúng chữ ký, dữ liệu rác)', '400', async () => eq((await up(Buffer.concat([PNG.subarray(0, 16), randomBytes(2000)]))).status, 400));
  await check('Tài nguyên/Tải ảnh', 'SVG chứa script', '400', async () => eq((await up(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'))).status, 400));
  await check('Tài nguyên/Tải ảnh', 'Ảnh > 6 MB', '413 hoặc máy chủ đóng kết nối sớm; không thêm ảnh', async () => {
    const before = ((await owner.json('/api/admin/media/')).body.items || []).length;
    let status = 'đóng kết nối';
    try { status = (await up(Buffer.concat([PNG.subarray(0, 8), randomBytes(7 * 1024 * 1024)]))).status; } catch {}
    const after = ((await owner.json('/api/admin/media/')).body.items || []).length;
    return { ok: (status === 413 || status === 'đóng kết nối') && after === before, actual: `${status}, ảnh ${before}→${after}` };
  });
  await check('Tài nguyên/Phục vụ ảnh', 'Ảnh tải lên được phục vụ đúng loại, chặn đoán MIME', '200 image/webp + nosniff', async () => { const r = await raw(pngBody.url); return { ok: r.status === 200 && /image\/webp/.test(r.headers.get('content-type') || '') && r.headers.get('x-content-type-options') === 'nosniff', actual: `${r.status} ${r.headers.get('content-type')} nosniff=${r.headers.get('x-content-type-options')}` }; });
  await check('Tài nguyên/Phục vụ ảnh', 'Đường dẫn vượt thư mục ../', '404/400', async () => { const r = await raw('/assets/uploads/..%2f..%2fpackage.json'); return { ok: r.status === 404 || r.status === 400, actual: String(r.status) }; });
  await check('Tài nguyên/Thư viện', 'Ảnh mới có trong danh sách thư viện', 'Có', async () => { const l = (await owner.json('/api/admin/media/')).body.items || []; return { ok: l.some(i => i.url === pngBody.url), actual: `${l.length} ảnh` }; });

  /* ================= 8. Báo cáo truy cập ================= */
  const visit = (body, headers = {}) => raw('/api/analytics/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base, ...headers }, body: JSON.stringify(body) });
  const a0 = (await owner.json('/api/admin/analytics/?days=30')).body;
    const { randomUUID } = await import('node:crypto');
  const v1 = await visit({ id: randomUUID(), visitor: randomUUID(), session: randomUUID(), path: '/ve-danava/', seconds: 5, referrer: 'https://www.google.com/' });
  await check('Báo cáo/Truy cập', 'Ghi một lượt xem từ khách', '2xx', async () => ({ ok: v1.status >= 200 && v1.status < 300, actual: String(v1.status) }));
  await check('Báo cáo/Truy cập', 'Lượt xem của admin đang đăng nhập không được tính', '204, không tăng số liệu', async () => { const r = await raw('/api/analytics/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base, cookie: owner.cookie }, body: JSON.stringify({ type: 'pageview', path: '/', visitor: 'admin', session: 'admin' }) }); return eq(r.status, 204); });
  await check('Báo cáo/Truy cập', 'Ghi lượt xem từ Origin lạ', '204 (bỏ qua)', async () => eq((await visit({ type: 'pageview', path: '/', visitor: 'x', session: 'y' }, { origin: 'https://evil.example' })).status, 204));
  const a1 = (await owner.json('/api/admin/analytics/?days=30')).body;
  await check('Báo cáo/Truy cập', 'Số lượt xem trong báo cáo tăng đúng 1', '+1 pageview', async () => ({ ok: (a1.totals?.pageviews ?? -1) - (a0.totals?.pageviews ?? 0) === 1, actual: `${a0.totals?.pageviews} → ${a1.totals?.pageviews}` }));

  /* ================= 9. ANNA (không có khóa AI — kiểm tra phương án dự phòng) ================= */
  await check('Tương tác/ANNA', 'Trạng thái khi chưa có khóa AI', 'ready=false', async () => { const r = await raw('/api/anna/'); const b = await r.json(); return { ok: r.status === 200 && b.ready === false, actual: `${r.status} ${JSON.stringify(b)}` }; });
  await check('Tương tác/ANNA', 'Hỏi ANNA khi dịch vụ AI chưa sẵn sàng', '503 unavailable (giao diện chuyển sang báo giá nhanh)', async () => { const r = await raw('/api/anna/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Xin chào' }] }) }); const b = await r.json().catch(() => ({})); return { ok: r.status === 503 && b.code === 'unavailable', actual: `${r.status} ${JSON.stringify(b)}` }; });
  await check('Tương tác/ANNA', 'Hỏi ANNA từ Origin lạ', '403', async () => eq((await raw('/api/anna/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://evil.example' }, body: '{}' })).status, 403));

  /* ================= 10. SEO & route công khai ================= */
  const sitemap = await (await raw('/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  await check('SEO/Sitemap', 'sitemap.xml có trang, không có admin/xem trước/bài lưu trữ', '> 20 URL, không /admin, /xem-truoc', async () => ({ ok: urls.length > 20 && !urls.some(u => /^\/(admin|api|xem-truoc|blogs\/doc)/.test(u)), actual: `${urls.length} URL` }));
  const robots = await (await raw('/robots.txt')).text();
  await check('SEO/Robots', 'robots.txt chặn /admin và /api, khai báo sitemap', 'Disallow /admin, /api; Sitemap', async () => ({ ok: /Disallow: \/admin/.test(robots) && /Disallow: \/api/.test(robots) && /Sitemap:/.test(robots), actual: robots.replace(/\s+/g, ' ').slice(0, 160) }));
  const seoIssues = [], longTitles = [];
  for (const u of [...new Set(['/', ...urls])]) {
    const r = await raw(u); const t = await r.text();
    const title = (t.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    const desc = /<meta name="description" content="[^"]{30,}/.test(t);
    const canon = (t.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
    const og = /<meta property="og:image" content="[^"]+"/.test(t);
    const h1 = (t.match(/<h1[\s>]/g) || []).length;
    const adminCss = /admin-ui|admin-studio/.test(t);
    const problems = [];
    if (r.status !== 200) problems.push('HTTP ' + r.status);
    if (!title) problems.push('title trống');
    if (title.length > 70) longTitles.push(`${u}: ${title.length} ký tự — "${title.replace(/&amp;/g, '&')}"`);
    if (!desc) problems.push('description');
    if (!canon || new URL(canon).pathname !== u) problems.push('canonical=' + canon);
    if (!og) problems.push('og:image');
    if (h1 !== 1) problems.push(`h1=${h1}`);
    if (adminCss) problems.push('CSS admin trên trang công khai');
    if (problems.length) seoIssues.push(`${u}: ${problems.join(', ')}`);
  }
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, 'seo-issues.txt'), [...seoIssues, '--- Tiêu đề > 70 ký tự (khuyến nghị nội dung, P3):', ...longTitles].join('\n') + '\n');
  await check('SEO/Tiêu đề', `Tiêu đề ≤ 70 ký tự trên ${urls.length} URL`, '0 tiêu đề quá dài', async () => ({ ok: longTitles.length === 0, actual: longTitles.length ? longTitles.join(' | ') : 'OK' }));
  await check('SEO/Trang công khai', `Mọi URL trong sitemap (${urls.length}) trả 200, có title, description, canonical đúng, og:image, đúng 1 H1, không CSS admin`, 'Không có vấn đề', async () => ({ ok: seoIssues.length === 0, actual: seoIssues.length ? seoIssues.slice(0, 12).join(' | ') + (seoIssues.length > 12 ? ` …(+${seoIssues.length - 12})` : '') : 'OK' }));
  await check('SEO/Trang lỗi', 'Đường dẫn không tồn tại', '404 + trang lỗi thân thiện, noindex', async () => { const r = await raw('/trang-khong-ton-tai-qa/'); const t = await r.text(); return { ok: r.status === 404 && /noindex/.test(t), actual: `${r.status} noindex=${/noindex/.test(t)}` }; });
  await check('SEO/Trang lỗi', 'Bài viết không tồn tại', '404', async () => eq((await raw('/blogs/khong-co-bai-nay-qa/')).status, 404));
  await check('SEO/Trang lỗi', 'Sản phẩm không tồn tại', '404', async () => eq((await raw('/giai-phap/khong-co-qa/')).status, 404));
  await check('SEO/Chuyển hướng', 'Đường dẫn cũ /kien-thuc → /blogs/', 'Chuyển hướng vĩnh viễn tới /blogs/, tối đa 2 bước', async () => {
    let u = '/kien-thuc'; const hops = [];
    for (let i = 0; i < 4; i++) { const r = await raw(u); if (![301, 308].includes(r.status)) break; u = new URL(r.headers.get('location'), base).pathname; hops.push(`${r.status}→${u}`); }
    return { ok: u === '/blogs/' && hops.length <= 2, actual: hops.join(' ') };
  });
  await check('SEO/Noindex', 'Trang admin có X-Robots-Tag noindex', 'noindex', async () => { const r = await raw('/admin/'); return { ok: /noindex/.test(r.headers.get('x-robots-tag') || ''), actual: r.headers.get('x-robots-tag') }; });

  /* ================= 11. Đăng xuất & phiên hết hạn ================= */
  const temp = await login({ username: 'qa.editor', password: 'mat-khau-qa-2026' });
  await check('Hệ thống/Phiên', 'Đăng xuất làm phiên mất hiệu lực', 'Sau đăng xuất GET nội dung → 401', async () => { const r = await temp.req('/api/admin/session/', { method: 'DELETE' }); const after = await temp.req('/api/admin/content/'); return { ok: r.status < 300 && after.status === 401, actual: `${r.status} → ${after.status}` }; });
  await check('Hệ thống/Phiên', 'Phiên hết hạn (sửa expires trong database thử nghiệm)', '401', async () => { const { DatabaseSync } = await import('node:sqlite'); const d = new DatabaseSync(join(directory, 'danava.sqlite')); d.prepare('UPDATE sessions SET expires=1').run(); d.close(); return eq((await accounts.admin.req('/api/admin/content/')).status, 401); });
  await check('Hệ thống/Đăng nhập', 'Đăng nhập sai liên tục bị giới hạn', 'Sau 10 lần sai → 429', async () => { let last = 0; for (let i = 0; i < 12; i++) last = (await raw('/api/admin/session/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base }, body: JSON.stringify({ password: 'sai-' + i }) })).status; return eq(last, 429); });
} catch (e) {
  results.push({ module: 'Khung kiểm thử', scenario: 'Chạy bộ kiểm thử', expected: 'Không lỗi', actual: String(e?.stack || e).slice(0, 400), status: 'FAIL' });
  console.error(e);
} finally {
  await stop();
  await rm(directory, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, 'api-results.json'), JSON.stringify(results, null, 1));
  const md = ['| # | Module | Kịch bản | Mong đợi | Thực tế | Trạng thái |', '|---|---|---|---|---|---|', ...results.map((r, i) => `| ${i + 1} | ${r.module} | ${r.scenario} | ${r.expected} | ${r.actual.replace(/\|/g, '\\|').replace(/\n/g, ' ')} | ${r.status} |`)].join('\n');
  await writeFile(join(OUT, 'api-results.md'), md + '\n');
  const fail = results.filter(r => r.status !== 'PASS').length;
  console.log(`\nTỔNG: ${results.length} trường hợp, PASS ${results.length - fail}, FAIL ${fail}`);
  process.exit(fail ? 1 : 0);
}
