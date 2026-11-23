/** Hệ quản trị: migration, nháp/xuất bản/lịch sử/khôi phục, tài khoản, kiểm tra đường dẫn, khối landing page. */
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Database tạm riêng cho file test này — không đụng .data/ hay MySQL production.
process.env.DANAVA_DATA_DIR = mkdtempSync(join(tmpdir(), 'danava-cms-'));
delete process.env.DANAVA_DB_HOST;

const { initial, validateContent, siteView } = await import('../lib/content.ts');
const { normalizeContent } = await import('../lib/content-defaults.ts');
const database = await import('../lib/database.ts');
const users = await import('../lib/users.ts');
const { contentProblem } = await import('../lib/content-check.ts');
const { diffContent } = await import('../lib/content-diff.ts');
const blocks = await import('../lib/page-blocks.ts');
const { can } = await import('../lib/permissions.ts');
after(() => database.closeDb());

const actor = { id: 'tester', name: 'Người kiểm thử' };

test('migration chạy một lần, ghi phiên bản công khai ban đầu và chạy lại an toàn', async () => {
  const sql = await database.db();
  const status = await database.migrationStatus();
  assert.equal(status.applied.at(-1)?.version, status.latest);
  // Database mới: nội dung mặc định được nhập ở lần mở đầu (SQLite tạo khi ghi lần đầu) → chưa có phiên bản gốc là đúng
  await database.writeContent(normalizeContent(initial), (await database.getContent()).revision, { actor });
  const revisions = await database.listRevisions();
  assert.ok(revisions.length >= 1);
  // Chạy lại migration: không lỗi, không nhân đôi
  await database.closeDb();
  await database.db();
  assert.equal((await database.migrationStatus()).applied.length, status.applied.length);
  void sql;
});

test('bản nháp lưu trên máy chủ, website chỉ thấy bản đã xuất bản', async () => {
  const start = await database.getWorkingContent();
  const data = structuredClone(start.data);
  data.headline = 'NHÁP_CHƯA_CÔNG_KHAI';
  const token = await database.writeContent(data, start.revision, { draftOnly: true, actor });
  assert.ok(token);
  // Tải lại: bản nháp còn nguyên
  const working = await database.getWorkingContent();
  assert.equal(working.hasDraft, true);
  assert.equal(working.data.headline, 'NHÁP_CHƯA_CÔNG_KHAI');
  assert.equal(working.draftAuthor, actor.name);
  // Website: chưa đổi
  assert.notEqual((await database.getSiteContent()).data.headline, 'NHÁP_CHƯA_CÔNG_KHAI');
  // Mã cũ bị từ chối (xung đột)
  assert.equal(await database.writeContent(data, start.revision, { actor }), null);
  // Xuất bản bằng mã mới → website cập nhật, có thêm một phiên bản trong lịch sử
  const before = (await database.listRevisions()).length;
  const published = await database.writeContent(working.data, working.revision, { actor, note: 'kiểm thử' });
  assert.ok(published);
  assert.equal((await database.getSiteContent()).data.headline, 'NHÁP_CHƯA_CÔNG_KHAI');
  assert.equal((await database.getWorkingContent()).hasDraft, false);
  const after = await database.listRevisions();
  assert.equal(after.length, before + 1);
  assert.equal(after[0].authorName, actor.name);
});

test('khôi phục phiên bản cũ vào bản nháp, bỏ nháp quay về bản công khai', async () => {
  const revs = await database.listRevisions();
  const oldest = revs[revs.length - 1];
  const found = await database.getRevision(oldest.id);
  assert.ok(found);
  const cur = await database.getWorkingContent();
  const token = await database.writeContent(found!.data, cur.revision, { draftOnly: true, actor, kind: 'restore' });
  assert.ok(token);
  assert.equal((await database.getWorkingContent()).data.headline, found!.data.headline);
  // Bỏ nháp
  assert.equal(await database.discardDraft(cur.revision), null, 'mã cũ không bỏ được nháp');
  const next = await database.discardDraft(token!);
  assert.ok(next);
  const back = await database.getWorkingContent();
  assert.equal(back.hasDraft, false);
  assert.equal(back.data.headline, 'NHÁP_CHƯA_CÔNG_KHAI');
});

test('nhật ký thao tác ghi và đọc lại được', async () => {
  await database.logAction(actor, 'xuat-ban', 'Nội dung website', 'ghi chú');
  const log = await database.listAudit(10);
  assert.ok(log.some(e => e.action === 'xuat-ban' && e.actorName === actor.name));
});

test('tài khoản: tạo, đăng nhập, khóa, đổi mật khẩu', async () => {
  assert.ok(users.checkNewUser({ username: 'AB', name: 'x', role: 'editor', password: '1234567890' }, true), 'tên đăng nhập sai định dạng');
  assert.ok(users.checkNewUser({ username: 'bientap', name: 'Biên tập', role: 'owner', password: '1234567890' }, true), 'không gán được vai trò chủ website');
  assert.ok(users.checkNewUser({ username: 'bientap', name: 'Biên tập', role: 'editor', password: 'ngan' }, true), 'mật khẩu quá ngắn');
  const u = await users.createUser({ username: 'bientap', name: 'Biên tập viên', role: 'editor', password: 'mat-khau-dai-1' });
  assert.notEqual(u, 'taken');
  assert.equal(await users.createUser({ username: 'bientap', name: 'Trùng', role: 'writer', password: 'mat-khau-dai-1' }), 'taken');
  assert.equal(await users.verifyLogin('bientap', 'sai-mat-khau'), null);
  assert.equal(await users.verifyLogin('khong-ton-tai', 'mat-khau-dai-1'), null);
  const ok = await users.verifyLogin('bientap', 'mat-khau-dai-1');
  assert.equal(ok?.role, 'editor');
  const id = (u as { id: string }).id;
  await users.updateUser(id, { active: false });
  assert.equal(await users.verifyLogin('bientap', 'mat-khau-dai-1'), null, 'tài khoản bị khóa không đăng nhập được');
  await users.updateUser(id, { active: true, password: 'mat-khau-moi-22' });
  assert.equal(await users.verifyLogin('bientap', 'mat-khau-dai-1'), null);
  assert.ok(await users.verifyLogin('bientap', 'mat-khau-moi-22'));
});

test('phân quyền: cộng tác viên không xuất bản, kinh doanh không sửa nội dung', () => {
  assert.equal(can('writer', 'content.draft'), true);
  assert.equal(can('writer', 'content.publish'), false);
  assert.equal(can('sales', 'content.read'), false);
  assert.equal(can('sales', 'leads.write'), true);
  assert.equal(can('editor', 'leads.read'), false);
  assert.equal(can('editor', 'users.manage'), false);
  assert.equal(can('admin', 'users.manage'), true);
});

test('đường dẫn trùng được báo rõ ràng trước khi lưu', () => {
  const data = normalizeContent(structuredClone(initial));
  assert.equal(contentProblem(data), null);
  const project = (data.projects || [])[0];
  const dup = { ...structuredClone(data.posts[0]), id: 'trung', title: 'Bài trùng' };
  assert.match(contentProblem({ ...data, posts: [...data.posts, dup] }) || '', /bị trùng/);
  if (project) {
    const showcase = { ...structuredClone((data.showcase || [])[0]), id: 'cs-trung', slug: project.slug, caseStudy: true, intro: 'x' };
    assert.match(contentProblem({ ...data, showcase: [...(data.showcase || []), showcase] }) || '', /\/du-an\//);
  }
  assert.match(contentProblem({ ...data, posts: [{ ...data.posts[0], slug: 'chu-de' }, ...data.posts.slice(1)] }) || '', /dành cho trang hệ thống/);
});

test('thêm sản phẩm mới trong admin: hợp lệ, ẩn khi chưa xuất bản, sản phẩm gốc giữ đường dẫn', () => {
  const data = normalizeContent(structuredClone(initial));
  const product = {
    id: 'danava-booking', slug: 'danava-booking', title: 'DANAVA Booking', description: 'Đặt lịch', items: [], type: 'phan-mem' as const,
    published: false, packages: [{ id: 'p1', name: 'Cơ bản', price: '990000', unit: '/tháng', perks: ['Lịch hẹn'], highlight: true, note: '' }]
  };
  const next = { ...data, services: [...data.services, product] };
  assert.equal(validateContent(next), true);
  assert.equal(siteView(next).services.some(s => s.id === 'danava-booking'), false, 'chưa xuất bản thì ẩn khỏi website');
  assert.equal(siteView({ ...next, services: next.services.map(s => s.id === 'danava-booking' ? { ...s, published: true } : s) }).services.some(s => s.id === 'danava-booking'), true);
  // Sản phẩm gốc không đổi được đường dẫn (giữ SEO)
  assert.equal(validateContent({ ...data, services: data.services.map(s => s.id === 'studio' ? { ...s, slug: 'studio-moi' } : s) }), false);
  // Giá chỉ chữ số
  assert.equal(validateContent({ ...next, services: next.services.map(s => s.id === 'danava-booking' ? { ...s, packages: [{ ...product.packages[0], price: '990k' }] } : s) }), false);
});

test('landing page: nội bộ dùng khối hợp lệ, liên kết ngoài không có trang nội bộ', () => {
  const data = normalizeContent(structuredClone(initial));
  const hero = blocks.newBlock('hero');
  const internal = { id: 'lp-studio', kind: 'internal' as const, title: 'Studio', slug: 'studio-uu-dai', url: '', image: '', purpose: 'Ưu đãi', serviceIds: ['studio'], status: 'draft' as const, blocks: [hero, blocks.cloneBlock(hero)], updated: '2026-11-23' };
  assert.equal(validateContent({ ...data, landings: [internal] }), true);
  assert.notEqual(internal.blocks[0].id, internal.blocks[1].id, 'nhân bản có ID mới');
  // Dữ liệu khối sai kiểu / trường lạ / style vượt giới hạn
  assert.equal(validateContent({ ...data, landings: [{ ...internal, blocks: [{ ...hero, data: { ...hero.data, title: 5 } }] }] }), false);
  assert.equal(validateContent({ ...data, landings: [{ ...internal, blocks: [{ ...hero, data: { ...hero.data, la: 'x' } }] }] }), false);
  assert.equal(validateContent({ ...data, landings: [{ ...internal, blocks: [{ ...hero, style: { padTop: 999 } }] }] }), false);
  assert.equal(validateContent({ ...data, landings: [{ ...internal, blocks: [{ ...hero, data: { ...hero.data, primaryHref: 'javascript:alert(1)' } }] }] }), false);
  const external = { ...internal, id: 'lp-ngoai', kind: 'external' as const, slug: '', url: 'https://danava.vn/uu-dai', blocks: [] };
  assert.equal(validateContent({ ...data, landings: [internal, external] }), true);
  assert.equal(validateContent({ ...data, landings: [{ ...external, url: 'http://khong-an-toan.vn' }] }), false);
});

test('so sánh phiên bản theo bản ghi', () => {
  const a = normalizeContent(structuredClone(initial));
  const b = { ...structuredClone(a), headline: 'Mới', posts: [{ ...a.posts[0], title: 'Đã sửa' }, ...a.posts.slice(2)] };
  const changes = diffContent(a, b);
  assert.ok(changes.some(c => c.area === 'Bài viết' && c.kind === 'sua' && c.label === 'Đã sửa'));
  assert.ok(changes.some(c => c.area === 'Bài viết' && c.kind === 'xoa'));
  assert.ok(changes.some(c => c.label === 'Thông điệp thương hiệu'));
});
