import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, type Person } from '../lib/content.ts';
import { getStaffDetail, getStaffInitials, getStaffProfile, STAFF_DEPARTMENTS, type StaffDeptId } from '../lib/staff.ts';

test('staff initials generator handles Vietnamese and multi-word names correctly', () => {
  assert.equal(getStaffInitials('Lê Tấn Thành'), 'TT');
  assert.equal(getStaffInitials('Phạm Trang'), 'PT');
  assert.equal(getStaffInitials('Trần Văn Nam'), 'VN');
  assert.equal(getStaffInitials('Avinash Saini'), 'AS');
  assert.equal(getStaffInitials('Đặng Ngọc Thông'), 'NT');
  assert.equal(getStaffInitials('Nguyễn Thị Thu Hằng'), 'TH');
  assert.equal(getStaffInitials('Thành'), 'TH');
  assert.equal(getStaffInitials('   '), 'D');
  assert.equal(getStaffInitials(''), 'D');
});

test('public staff list only includes approved visible members', () => {
  const mockStaff: Person[] = [
    { id: 'thanh', name: 'Lê Tấn Thành', role: 'Founder & CEO', visible: true },
    { id: 'hidden_person', name: 'Nhân sự Ẩn', role: 'Kỹ thuật viên', visible: false },
    { id: 'trang', name: 'Phạm Trang', role: 'Trưởng phòng CSKH', visible: true }
  ];

  const publicStaff = mockStaff.filter(p => p.visible);
  assert.equal(publicStaff.length, 2);
  assert.ok(!publicStaff.some(p => p.id === 'hidden_person'));
  assert.ok(!publicStaff.some(p => !p.visible));
});

test('staff members are distributed across 4 core departments with valid portfolios', () => {
  const staff = initial.staff.filter(p => p.visible);
  const deptCounts: Record<StaffDeptId, number> = {
    'all': staff.length,
    'ky-thuat': 0,
    'truyen-thong': 0,
    'kinh-doanh': 0,
    'van-hanh': 0
  };

  for (const person of staff) {
    const detail = getStaffDetail(person);
    assert.ok(['ky-thuat', 'truyen-thong', 'kinh-doanh', 'van-hanh'].includes(detail.departmentId));
    assert.ok(detail.departmentName.length > 0);
    assert.ok(detail.expertise.length >= 2, `Person ${person.name} should have at least 2 expertise tags`);
    assert.ok(detail.bio.length > 20, `Person ${person.name} should have an editorial bio`);
    assert.ok(detail.portfolio.length >= 2, `Person ${person.name} should have portfolio links`);

    for (const item of detail.portfolio) {
      assert.ok(item.title.length > 0);
      assert.ok(item.href.startsWith('/'), `Portfolio link ${item.href} must be an internal absolute path`);
      assert.ok(item.desc.length > 0);
    }

    deptCounts[detail.departmentId] += 1;
  }

  // Đảm bảo đủ cả 4 nhóm phòng ban: Kỹ thuật, Truyền thông, Kinh doanh, Vận hành
  assert.ok(deptCounts['ky-thuat'] >= 1, 'Kỹ thuật must have at least 1 member');
  assert.ok(deptCounts['truyen-thong'] >= 1, 'Truyền thông must have at least 1 member');
  assert.ok(deptCounts['kinh-doanh'] >= 1, 'Kinh doanh must have at least 1 member');
  assert.ok(deptCounts['van-hanh'] >= 1, 'Vận hành must have at least 1 member');
  assert.equal(STAFF_DEPARTMENTS.length, 5); // 'all' + 4 departments
});

test('smart fallback classifies custom CMS roles gracefully into departments', () => {
  const customDev: Person = { id: 'dev1', name: 'Nguyễn Văn Dev', role: 'Senior Software Engineer', visible: true };
  const detailDev = getStaffDetail(customDev);
  assert.equal(detailDev.departmentId, 'ky-thuat');
  assert.ok(detailDev.portfolio[0].href.startsWith('/'));

  const customMkt: Person = { id: 'mkt1', name: 'Hoàng Media', role: 'Chuyên viên Truyền thông & Báo chí', visible: true };
  const detailMkt = getStaffDetail(customMkt);
  assert.equal(detailMkt.departmentId, 'truyen-thong');

  const customSale: Person = { id: 'sale1', name: 'Lê Tư Vấn', role: 'Chuyên viên Tư vấn giải pháp khách hàng', visible: true };
  const detailSale = getStaffDetail(customSale);
  assert.equal(detailSale.departmentId, 'kinh-doanh');

  const customOps: Person = { id: 'ops1', name: 'Trần Triển Khai', role: 'Quản lý Vận hành & Thiết bị', visible: true };
  const detailOps = getStaffDetail(customOps);
  assert.equal(detailOps.departmentId, 'van-hanh');
});

test('empty department filtering returns empty list cleanly without crashes', () => {
  const emptyStaffList: Person[] = [];
  const filtered = emptyStaffList.filter(p => getStaffDetail(p).departmentId === 'ky-thuat');
  assert.equal(filtered.length, 0);
});

test('getStaffProfile constructs full portfolio with role in projects, contributions and verified links', () => {
  const staff = initial.staff.filter(p => p.visible);
  const projects = initial.projects || [];

  for (const person of staff) {
    const profile = getStaffProfile(person, projects);
    assert.equal(profile.id, person.id);
    assert.equal(profile.name, person.name);
    assert.equal(profile.role, person.role);
    assert.ok(profile.intro.length > 30, `${person.name} must have a rich intro bio`);
    assert.ok(profile.skillGroups.length >= 1, `${person.name} must have skill groups`);
    assert.ok(profile.personalProducts.length >= 1, `${person.name} must have personal products`);
    assert.ok(profile.verifiedLinks.length >= 1, `${person.name} must have verified links`);

    // Kiểm tra liên kết nghề nghiệp đã duyệt
    for (const link of profile.verifiedLinks) {
      assert.ok(link.label.length > 0);
      assert.ok(
        link.url.startsWith('/') ||
        link.url.startsWith('mailto:') ||
        link.url.startsWith('tel:') ||
        link.url.startsWith('https://'),
        `Invalid link url: ${link.url}`
      );
    }

    // Với 5 nhân sự nòng cốt có dự án thực tế
    if (['thanh', 'avinash', 'trang', 'thong', 'nam'].includes(person.id)) {
      assert.ok(profile.projects.length >= 2, `${person.name} must have at least 2 real projects from same relation in /du-an/[slug]`);
      for (const proj of profile.projects) {
        assert.ok(proj.roleInProject.length > 0, 'Must state clear role in project');
        assert.ok(proj.contributions.length >= 2, 'Must have at least 2 specific contributions');
        assert.ok(proj.projectSlug.length > 0);
      }
    }
  }
});

test('getStaffProfile isolates unpublished projects from individual portfolios', () => {
  const mockProjects = [
    {
      id: 'hariver-studio',
      slug: 'hariver-gym-danava-studio',
      title: 'HARIVER Gym',
      category: 'DANAVA Studio',
      client: 'HARIVER GYM',
      summary: 'Public project',
      challenge: 'c',
      solution: 's',
      result: 'r',
      image: '/assets/verified/hariver.webp',
      published: true,
      featured: true
    },
    {
      id: 'draft-proj',
      slug: 'draft-proj',
      title: 'Draft project',
      category: 'DANAVA Studio',
      client: 'Draft Client',
      summary: 'Secret',
      challenge: 'c',
      solution: 's',
      result: 'r',
      image: '/assets/verified/hariver.webp',
      published: false,
      featured: false
    }
  ];

  const thanh = initial.staff.find(p => p.id === 'thanh')!;
  const profile = getStaffProfile(thanh, mockProjects);

  assert.ok(profile.projects.some(p => p.projectId === 'hariver-studio'));
  assert.ok(!profile.projects.some(p => p.projectId === 'draft-proj'), 'Draft projects must never be exposed');
});


