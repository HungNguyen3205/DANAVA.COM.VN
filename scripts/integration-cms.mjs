// Kiểm thử hệ quản trị trên server thật (cần `npm run build` trước): node scripts/integration-cms.mjs
// Tài khoản & quyền, nháp/xuất bản, xung đột, lịch sử/khôi phục, đường dẫn trùng, sản phẩm mới, landing page.
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const directory = await mkdtemp(join(tmpdir(), 'danava-cms-it-'));
const salt = randomBytes(16).toString('hex'), password = randomBytes(18).toString('hex');
const hash = salt + ':' + scryptSync(password, salt, 64).toString('hex');
const PORT = 4186, base = `http://localhost:${PORT}`;
let server, logs = '';

async function start() {
  server = spawn(process.execPath, ['server.cjs'], { env: { ...process.env, DANAVA_DATA_DIR: directory, DANAVA_HOSTNAME: '127.0.0.1', PORT: String(PORT), DANAVA_ADMIN_PASSWORD_HASH: hash, SITE_URL: base }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', v => { logs += v; });
  server.stderr.on('data', v => { logs += v; });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(base + '/api/admin/session/', { signal: AbortSignal.timeout(1000) }); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw Error('Server not ready: ' + logs.slice(-2000));
}
async function stop() {
  if (server && server.exitCode === null) {
    const child = server;
    await new Promise(resolve => { const t = setTimeout(() => child.kill('SIGKILL'), 2500); child.once('exit', () => { clearTimeout(t); resolve(); }); child.kill('SIGTERM'); });
  }
}

/** Một phiên đăng nhập (cookie + CSRF riêng). */
async function login(credentials) {
  const r = await fetch(base + '/api/admin/session/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base, Connection: 'close' }, body: JSON.stringify(credentials) });
  const body = await r.json();
  if (r.status !== 200) return { status: r.status, body };
  const cookie = r.headers.get('set-cookie').split(';')[0];
  const req = (path, options = {}) => fetch(base + path, { signal: AbortSignal.timeout(15000), ...options, headers: { Connection: 'close', cookie, ...(options.method && options.method !== 'GET' ? { origin: base, 'x-csrf-token': body.csrf } : {}), ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  return { status: 200, body, req, json: async (path, options) => { const res = await req(path, options); return { status: res.status, body: await res.json().catch(() => ({})) }; } };
}
const page = path => fetch(base + path, { headers: { Connection: 'close' }, redirect: 'manual' });

try {
  await start();
  const owner = await login({ password });
  assert.equal(owner.status, 200);
  assert.equal(owner.body.user.role, 'owner');

  // ---------- Tài khoản & quyền
  for (const [username, role] of [['bientap', 'editor'], ['congtac', 'writer'], ['kinhdoanh', 'sales']]) {
    const r = await owner.json('/api/admin/users/', { method: 'POST', body: JSON.stringify({ username, name: `Người ${role}`, role, password: 'mat-khau-thu-nghiem' }) });
    assert.equal(r.status, 201, JSON.stringify(r.body));
  }
  assert.equal((await owner.json('/api/admin/users/', { method: 'POST', body: JSON.stringify({ username: 'bientap', name: 'Trùng', role: 'editor', password: 'mat-khau-thu-nghiem' }) })).status, 409);
  assert.equal((await login({ username: 'bientap', password: 'sai-mat-khau-roi' })).status, 401);
  const editor = await login({ username: 'bientap', password: 'mat-khau-thu-nghiem' });
  const writer = await login({ username: 'congtac', password: 'mat-khau-thu-nghiem' });
  const sales = await login({ username: 'kinhdoanh', password: 'mat-khau-thu-nghiem' });
  assert.equal(editor.body.user.role, 'editor');
  // Quyền được kiểm tra ở API
  assert.equal((await sales.req('/api/admin/content/')).status, 403, 'Kinh doanh không đọc nội dung/bản nháp');
  assert.equal((await sales.req('/api/admin/leads/')).status, 200);
  assert.equal((await editor.req('/api/admin/leads/')).status, 403, 'Biên tập không xem khách hàng');
  assert.equal((await editor.req('/api/admin/users/')).status, 403, 'Biên tập không quản lý tài khoản');
  assert.equal((await writer.req('/api/admin/audit/')).status, 403);
  assert.equal((await editor.req('/api/admin/revisions/')).status, 200);
  console.log('Accounts and API permissions passed.');

  // ---------- Nháp / xuất bản
  const base0 = await writer.json('/api/admin/content/');
  const data = base0.body.data;
  const post = data.posts.find(p => p.published);
  const original = post.title;
  post.title = 'TIEU_DE_NHAP_CHUA_CONG_KHAI';
  // Cộng tác viên không xuất bản được
  assert.equal((await writer.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data, revision: base0.body.revision, mode: 'publish' }) })).status, 403);
  const draftSave = await writer.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data, revision: base0.body.revision, mode: 'draft' }) });
  assert.equal(draftSave.status, 200, JSON.stringify(draftSave.body));
  // Tải lại: bản nháp vẫn còn; website chưa đổi
  const reloaded = await editor.json('/api/admin/content/');
  assert.equal(reloaded.body.hasDraft, true);
  assert.equal(reloaded.body.data.posts.find(p => p.id === post.id).title, 'TIEU_DE_NHAP_CHUA_CONG_KHAI');
  assert.equal(reloaded.body.draftAuthor, 'Người writer');
  const publicBefore = await (await page(`/blogs/${post.slug}/`)).text();
  assert.ok(!publicBefore.includes('TIEU_DE_NHAP_CHUA_CONG_KHAI'), 'bản nháp không được xuất hiện công khai');
  assert.ok((await (await page('/sitemap.xml')).text()).length > 0);
  // Mã cũ → 409 (xung đột khi nhiều người cùng sửa)
  assert.equal((await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data, revision: base0.body.revision, mode: 'publish' }) })).status, 409);
  // Biên tập xuất bản bản nháp
  const pub = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: reloaded.body.data, revision: reloaded.body.revision, mode: 'publish' }) });
  assert.equal(pub.status, 200);
  assert.ok((await (await page(`/blogs/${post.slug}/`)).text()).includes('TIEU_DE_NHAP_CHUA_CONG_KHAI'), 'xuất bản phải cập nhật website');
  console.log('Draft isolation, conflict and publish passed.');

  // ---------- Lịch sử & khôi phục
  const history = await editor.json('/api/admin/revisions/');
  assert.ok(history.body.revisions.length >= 1);
  assert.equal(history.body.revisions[0].authorName, 'Người editor');
  const baseline = history.body.revisions.find(r => r.kind === 'baseline') || history.body.revisions.at(-1);
  const now = await editor.json('/api/admin/content/');
  const restored = await editor.json('/api/admin/revisions/', { method: 'POST', body: JSON.stringify({ id: baseline.id, revision: now.body.revision }) });
  assert.equal(restored.status, 200, JSON.stringify(restored.body));
  assert.equal(restored.body.content.hasDraft, true, 'khôi phục mặc định đưa vào bản nháp');
  assert.ok((await (await page(`/blogs/${post.slug}/`)).text()).includes('TIEU_DE_NHAP_CHUA_CONG_KHAI'), 'khôi phục vào nháp chưa đổi website');
  const discard = await editor.json(`/api/admin/content/?revision=${restored.body.revision}`, { method: 'DELETE' });
  assert.equal(discard.status, 200);
  assert.equal((await editor.json('/api/admin/content/')).body.hasDraft, false);
  console.log('History, restore into draft and discard passed.');

  // ---------- Đường dẫn trùng
  let cur = (await editor.json('/api/admin/content/')).body;
  const dup = structuredClone(cur.data);
  dup.posts.push({ ...structuredClone(dup.posts[0]), id: 'trung-duong-dan', title: 'Bài trùng đường dẫn' });
  const dupRes = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: dup, revision: cur.revision, mode: 'draft' }) });
  assert.equal(dupRes.status, 400);
  assert.match(dupRes.body.error, /bị trùng/);
  console.log('Duplicate URL check passed.');

  // ---------- Sản phẩm mới: tạo trong admin, ẩn khi chưa xuất bản, hiện khi xuất bản
  cur = (await editor.json('/api/admin/content/')).body;
  const withProduct = structuredClone(cur.data);
  withProduct.services.push({ id: 'danava-booking', slug: 'danava-booking', title: 'DANAVA Booking IT', description: 'Phần mềm đặt lịch hẹn', items: [], type: 'phan-mem', published: false, heroLead: 'Đặt lịch hẹn trực tuyến.', features: [{ title: 'Lịch hẹn', text: 'Khách tự đặt lịch.' }], packages: [{ id: 'goi-1', name: 'Cơ bản', price: '990000', unit: '/tháng', perks: ['Lịch hẹn'], highlight: true, note: '' }] });
  let r = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: withProduct, revision: cur.revision, mode: 'publish' }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal((await page('/giai-phap/danava-booking/')).status, 404, 'sản phẩm chưa xuất bản phải ẩn');
  withProduct.services = withProduct.services.map(s => s.id === 'danava-booking' ? { ...s, published: true } : s);
  r = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: withProduct, revision: r.body.revision, mode: 'publish' }) });
  assert.equal(r.status, 200);
  const productHTML = await (await page('/giai-phap/danava-booking/')).text();
  assert.ok(productHTML.includes('DANAVA Booking IT'));
  console.log('New product create/publish passed.');

  // ---------- Landing page: nháp không công khai, xuất bản, đổi đường dẫn → 301, liên kết ngoài không có trang
  cur = (await editor.json('/api/admin/content/')).body;
  const withLanding = structuredClone(cur.data);
  const hero = { id: 'bherotest01', type: 'hero', data: { kicker: 'DANAVA', title: 'LANDING_IT_TITLE', lead: 'Lợi ích', image: '', primaryLabel: 'Đăng ký', primaryHref: '#dang-ky', secondaryLabel: '', secondaryHref: '' }, style: { align: 'center', padTop: 96 } };
  const form = { id: 'bformtest01', type: 'form', data: { title: 'Đăng ký', lead: '', service: 'DANAVA Studio', buttonLabel: 'Gửi' } };
  const pricing = { id: 'bpricetest1', type: 'pricing', data: { title: 'Bảng giá', productId: 'danava-booking' } };
  withLanding.landings = [
    { id: 'lp-it', kind: 'internal', title: 'Landing IT', slug: 'landing-it', url: '', image: '', purpose: 'Kiểm thử', serviceIds: ['danava-booking'], status: 'draft', blocks: [hero, pricing, form], updated: '2026-11-23' },
    { id: 'lp-ngoai', kind: 'external', title: 'Landing ngoài', slug: '', url: 'https://danava.vn/uu-dai', image: '', purpose: '', serviceIds: [], status: 'published', blocks: [], updated: '2026-11-23' }
  ];
  r = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: withLanding, revision: cur.revision, mode: 'publish' }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal((await page('/lp/landing-it/')).status, 404, 'landing nháp không công khai');
  withLanding.landings[0].status = 'published';
  r = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: withLanding, revision: r.body.revision, mode: 'publish' }) });
  const lpHTML = await (await page('/lp/landing-it/')).text();
  assert.ok(lpHTML.includes('LANDING_IT_TITLE') && lpHTML.includes('990.000'), 'landing hiển thị khối và bảng giá lấy từ hồ sơ sản phẩm');
  assert.ok((await (await page('/sitemap.xml')).text()).includes('/lp/landing-it/'));
  // Sửa giá ở hồ sơ sản phẩm → landing cập nhật theo (một nguồn dữ liệu)
  withLanding.services = withLanding.services.map(s => s.id === 'danava-booking' ? { ...s, packages: [{ ...s.packages[0], price: '1290000' }] } : s);
  withLanding.landings[0].slug = 'landing-it-moi';
  r = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: withLanding, revision: r.body.revision, mode: 'publish' }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.ok((await (await page('/lp/landing-it-moi/')).text()).includes('1.290.000'), 'giá mới hiển thị trên landing');
  const moved = await page('/lp/landing-it/');
  assert.equal(moved.status, 301, 'đường dẫn cũ chuyển hướng');
  assert.ok(moved.headers.get('location').endsWith('/lp/landing-it-moi/'));
  assert.equal((await editor.json('/api/admin/content/')).body.data.redirects.some(x => x.auto && x.from === '/lp/landing-it/'), true);
  // Liên kết ngoài: không có trang nội bộ giả
  assert.equal((await page('/lp/lp-ngoai/')).status, 404);
  // Form trên landing gửi yêu cầu với nguồn lp:{slug}
  const leadRes = await fetch(base + '/api/lead/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base }, body: JSON.stringify({ name: 'Khách landing', phone: '0905123123', service: 'DANAVA Studio', message: 'Đăng ký từ landing', source: 'lp:landing-it-moi' }) });
  assert.equal(leadRes.status, 201);
  assert.ok((await sales.json('/api/admin/leads/')).body.leads.some(l => l.source === 'lp:landing-it-moi'));
  console.log('Landing pages, product references, auto redirects and landing forms passed.');

  // ---------- Bài lưu trữ biến khỏi website
  cur = (await editor.json('/api/admin/content/')).body;
  const archived = structuredClone(cur.data);
  const target = archived.posts.find(p => p.id === post.id);
  target.archived = true;
  r = await editor.json('/api/admin/content/', { method: 'PUT', body: JSON.stringify({ data: archived, revision: cur.revision, mode: 'publish' }) });
  assert.equal(r.status, 200);
  assert.equal((await page(`/blogs/${post.slug}/`)).status, 404, 'bài lưu trữ không công khai');
  assert.ok(!(await (await page('/sitemap.xml')).text()).includes(`/blogs/${post.slug}/`));
  console.log('Archived posts hidden.');

  // ---------- Đăng xuất & khóa tài khoản có hiệu lực ngay
  const users = (await owner.json('/api/admin/users/')).body.users;
  const writerId = users.find(u => u.username === 'congtac').id;
  assert.equal((await owner.json('/api/admin/users/', { method: 'PATCH', body: JSON.stringify({ id: writerId, active: false }) })).status, 200);
  assert.equal((await writer.req('/api/admin/content/')).status, 401, 'tài khoản bị khóa mất phiên ngay');
  assert.equal((await owner.json('/api/admin/audit/')).body.entries.some(e => e.action === 'xuat-ban' && e.actorName === 'Người editor'), true);
  console.log('PASS: accounts, permissions, server drafts, conflicts, history/restore, duplicate URLs, new products, audit log.');
} catch (e) {
  console.error(e);
  console.error(logs.slice(-2000));
  process.exitCode = 1;
} finally {
  await stop();
  await rm(directory, { recursive: true, force: true });
}
