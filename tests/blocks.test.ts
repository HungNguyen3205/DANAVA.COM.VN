import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, validateContent } from '../lib/content.ts';
import { block, blockDefaults, pageCopy, staffBlockFor, validBlocks, BLOCK_KEYS } from '../lib/blocks.ts';
import { CONTACT, SOCIAL } from '../lib/company.ts';

test('khối nội dung: mặc định đúng bằng nội dung đang hiển thị', () => {
  const d = structuredClone(initial);
  assert.equal(block(d, 'company').address, CONTACT.address);
  assert.equal(block(d, 'company').facebook, SOCIAL.facebook);
  assert.equal(pageCopy(d, 'du-an').title, 'Câu chuyện *triển khai thực tế*');
  assert.equal(block(d, 'about').milestones.length, 4);
  assert.equal(block(d, 'ecosystem').units.length > 5, true);
  assert.equal(block(d, 'staff').length, d.staff.length);
  assert.ok(block(d, 'staff').some(s => s.projectRoles.length > 0), 'có vai trò trong dự án');
  assert.equal(block(d, 'servicePolicy').groups.length, 3);
});

test('khối nội dung: lưu toàn bộ mặc định vẫn hợp lệ', () => {
  const d = structuredClone(initial);
  const def = blockDefaults(d.staff);
  d.blocks = Object.fromEntries(BLOCK_KEYS.map(k => [k, structuredClone(def[k])]));
  assert.equal(validateContent(d), true);
});

test('khối nội dung: sửa một phần → phần còn lại lấy mặc định; ô trống trong "Chữ trên trang" dùng chữ gốc', () => {
  const d = structuredClone(initial);
  d.blocks = { company: { ...blockDefaults().company, hours: 'Thứ Hai – Chủ Nhật' }, pages: { ...blockDefaults().pages, 'du-an': { kicker: '', title: 'Dự án *mới*', lead: '', ctaTitle: '', ctaLead: '' } } };
  assert.equal(validateContent(d), true);
  assert.equal(block(d, 'company').hours, 'Thứ Hai – Chủ Nhật');
  assert.equal(block(d, 'company').mapUrl, CONTACT.mapUrl);
  assert.equal(pageCopy(d, 'du-an').title, 'Dự án *mới*');
  assert.equal(pageCopy(d, 'du-an').kicker, 'Dự án', 'ô trống → chữ mặc định');
});

test('khối nội dung: chặn dữ liệu sai cấu trúc', () => {
  assert.equal(validBlocks(undefined), true);
  assert.equal(validBlocks({ unknown: {} }), false, 'khối lạ');
  assert.equal(validBlocks({ company: { ...blockDefaults().company, hours: 5 } }), false, 'sai kiểu');
  assert.equal(validBlocks({ company: { ...blockDefaults().company, script: '<x>' } }), false, 'khóa lạ');
  const about = structuredClone(blockDefaults().about);
  (about.milestones as unknown[]).push({ year: '2027' });
  assert.equal(validBlocks({ about }), false, 'thiếu trường bắt buộc trong danh sách');
  assert.equal(validBlocks({ about: { ...blockDefaults().about, milestones: 'x' } }), false);
  assert.equal(validBlocks({ company: { ...blockDefaults().company, overview: 'a'.repeat(7000) } }), false, 'quá dài');
});

test('hồ sơ nhân sự: sửa trong CMS được dùng, người mới lấy hồ sơ mặc định', () => {
  const d = structuredClone(initial);
  const staff = structuredClone(blockDefaults(d.staff).staff);
  staff[0].intro = 'Giới thiệu mới';
  d.blocks = { staff };
  assert.equal(validateContent(d), true);
  assert.equal(staffBlockFor(d, d.staff[0]).intro, 'Giới thiệu mới');
  assert.ok(staffBlockFor(d, { id: 'moi', name: 'Người Mới', role: 'Thiết kế', visible: true }).bio.includes('Người Mới'));
});

test('hồ sơ nhân sự: dựng từ dữ liệu khối cho kết quả giống hệt bản cũ (website không đổi)', async () => {
  const { getStaffDetail, getStaffProfile } = await import('../lib/staff.ts');
  const { staffDetailFor, staffProfileFor } = await import('../lib/blocks.ts');
  const d = structuredClone(initial);
  for (const p of d.staff) {
    assert.deepEqual(staffDetailFor(d, p), getStaffDetail(p), 'thẻ ' + p.id);
    assert.deepEqual(staffProfileFor(d, p), getStaffProfile(p, d.projects || []), 'hồ sơ ' + p.id);
  }
});

test('hồ sơ nhân sự: thêm người mới sau khi đã lưu hồ sơ → vẫn có hồ sơ; người đã xóa không còn', () => {
  const d = structuredClone(initial);
  d.blocks = { staff: structuredClone(blockDefaults(d.staff).staff) };
  d.staff = [...d.staff.slice(1), { id: 'moi', name: 'Người Mới', role: 'Thiết kế', visible: true }];
  const list = block(d, 'staff');
  assert.deepEqual(list.map(s => s.id), d.staff.map(p => p.id));
});

test('menu Giải pháp: 3 cột mặc định; chặn đường dẫn không an toàn', () => {
  const d = structuredClone(initial);
  const m = block(d, 'menu');
  assert.deepEqual(m.columns.map(c => c.title), ['Vận hành DANAVA', 'Marketing', 'Cộng đồng']);
  assert.deepEqual(m.columns[1].items.map(i => i.label), ['Sự kiện', 'Truyền thông', 'Marketing', 'Landing page']);
  assert.deepEqual(m.columns[2].items.map(i => i.label), ['Dự án', 'Đối tác', 'Đội ngũ']);
  const work = m.columns[0].items.find(i => i.label === 'DANAVA Work')!;
  assert.equal(work.href, '/giai-phap/danava-work/', 'DANAVA Work dẫn tới trang giới thiệu (nút trên trang mở workspace)');
  assert.ok(m.columns.every(c => c.items.every(i => i.image === '')), 'menu chỉ chữ, không ảnh');
  const bad = structuredClone(blockDefaults().menu);
  bad.columns[0].items[0].href = 'javascript:alert(1)';
  assert.equal(validBlocks({ menu: bad }), false);
  const ok = structuredClone(blockDefaults().menu);
  ok.columns[2].items.push({ label: 'Hệ sinh thái', desc: '', href: '/he-sinh-thai/', badge: 'Mới', image: '' });
  assert.equal(validBlocks({ menu: ok }), true);
});
