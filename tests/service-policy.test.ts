import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { legacyRedirects } from '../lib/legacy-redirects.ts';
import {
  SERVICE_POLICY_METADATA,
  APPROVED_SERVICE_POLICIES,
  SLA_MATRIX,
  SUPPORT_CHANNELS,
  DRAFT_POLICY_CLAUSES
} from '../lib/service-policy.ts';

test('legacy redirects route policy, terms, warranty and support URLs to /chinh-sach-dich-vu/', () => {
  const policyAliases = [
    '/chinh-sach/',
    '/dieu-khoan-dich-vu/',
    '/dieu-khoan/',
    '/terms/',
    '/terms-of-service/',
    '/chinh-sach-bao-hanh/',
    '/bao-hanh/',
    '/ho-tro/'
  ];

  for (const alias of policyAliases) {
    const matched = legacyRedirects.find((r) => r.source === alias);
    assert.ok(matched, `Phải có redirect cho ${alias}`);
    assert.equal(matched.destination, '/chinh-sach-dich-vu/');
    assert.equal(matched.permanent, true);
  }
});

test('approved service policies cover software, website, and media with clear scopes', () => {
  assert.equal(APPROVED_SERVICE_POLICIES.length, 3, 'Phải có đúng 3 trụ cột dịch vụ');

  const categories = APPROVED_SERVICE_POLICIES.map((p) => p.category);
  assert.deepEqual(categories, ['software', 'website', 'media']);

  for (const group of APPROVED_SERVICE_POLICIES) {
    assert.ok(group.title.length > 0);
    assert.ok(group.tagline.length > 0);
    assert.ok(group.scopeOfSupport.length >= 3, `${group.title} phải có ít nhất 3 đầu mục hỗ trợ`);
    assert.ok(group.warrantyTerms.length >= 1, `${group.title} phải có điều khoản bảo hành`);
    assert.ok(group.ownershipAndHandover.length >= 2, `${group.title} phải có bàn giao và sở hữu`);
    assert.ok(group.exclusions.length >= 2, `${group.title} phải có trường hợp loại trừ`);
  }

  // Khối phần mềm
  const software = APPROVED_SERVICE_POLICIES.find((p) => p.category === 'software')!;
  assert.ok(software.scopeOfSupport.some((s) => s.includes('99.9%')), 'Phải có SLA uptime 99.9%');
  assert.ok(software.ownershipAndHandover.some((s) => s.includes('100%')), 'Hội viên phải thuộc 100% sở hữu khách');

  // Khối website
  const website = APPROVED_SERVICE_POLICIES.find((p) => p.category === 'website')!;
  assert.ok(website.warrantyTerms.some((w) => w.includes('12 tháng')), 'Website phải có bảo hành 12 tháng');
  assert.ok(website.ownershipAndHandover.some((o) => o.includes('Source Code')), 'Phải bàn giao source code sạch');

  // Khối media
  const media = APPROVED_SERVICE_POLICIES.find((p) => p.category === 'media')!;
  assert.ok(media.warrantyTerms.some((w) => w.includes('02 vòng chỉnh sửa')), 'Media phải có quy định 02 vòng sửa');
});

test('SLA matrix defines 4 distinct severity levels and response metrics', () => {
  assert.equal(SLA_MATRIX.length, 4, 'Ma trận SLA phải có đúng 4 cấp độ');

  const levels = SLA_MATRIX.map((s) => s.level);
  assert.deepEqual(levels, ['critical', 'major', 'minor', 'request']);

  const critical = SLA_MATRIX.find((s) => s.level === 'critical')!;
  assert.ok(critical.firstResponseTime.includes('30 – 60 phút') || critical.firstResponseTime.includes('60 phút'));
  assert.ok(critical.contactChannel.includes('0935 91 76 77'));
});

test('support channels provide multi-tiered direct contacts with hotline 0935 91 76 77', () => {
  assert.ok(SUPPORT_CHANNELS.length >= 4, 'Phải có ít nhất 4 kênh tiếp nhận hỗ trợ');

  const hotline = SUPPORT_CHANNELS.find((c) => c.id === 'hotline')!;
  assert.equal(hotline.value, '0935 91 76 77');
  assert.ok(hotline.workingHours.includes('24/7'));

  const email = SUPPORT_CHANNELS.find((c) => c.id === 'email-support')!;
  assert.equal(email.value, 'support@danava.vn');
});

test('draft policy clauses are clearly prepared in draft status awaiting executive approval', () => {
  assert.ok(DRAFT_POLICY_CLAUSES.length >= 3, 'Phải có ít nhất 3 điều khoản dự thảo');

  for (const clause of DRAFT_POLICY_CLAUSES) {
    assert.ok(clause.id.startsWith('draft-'));
    assert.ok(clause.code.startsWith('DỰ THẢO'));
    assert.ok(clause.title.length > 0);
    assert.ok(clause.proposedContent.length > 0);
    assert.equal(clause.status, 'DỰ THẢO — ĐANG CHỜ BAN GIÁM ĐỐC PHÊ DUYỆT');
    assert.ok(clause.impactAnalysis.length > 0);
  }
});

test('service policy component anchors match all TOC links', () => {
  const componentPath = path.join(process.cwd(), 'components', 'ServicePolicy.tsx');
  assert.ok(fs.existsSync(componentPath), 'File components/ServicePolicy.tsx phải tồn tại');

  const content = fs.readFileSync(componentPath, 'utf8');

  const requiredAnchors = [
    'nguyen-tac-chung',
    'phan-mem',
    'thiet-ke-website',
    'truyen-thong-media',
    'ma-tran-sla',
    'kenh-tiep-nhan',
    'mien-tru-trach-nhiem',
    'dieu-khoan-du-thao',
    'thong-tin-ban-hanh'
  ];

  for (const anchor of requiredAnchors) {
    assert.ok(
      content.includes(`href="#${anchor}"`),
      `Mục lục phải chứa href="#${anchor}"`
    );
    assert.ok(
      content.includes(`id="${anchor}"`),
      `Nội dung phải có id="${anchor}"`
    );
  }
});

test('service policy route page exports valid metadata and JSON-LD schema', () => {
  const pagePath = path.join(process.cwd(), 'app', '(site)', 'chinh-sach-dich-vu', 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'Route app/chinh-sach-dich-vu/page.tsx phải tồn tại');

  const content = fs.readFileSync(pagePath, 'utf8');
  assert.ok(content.includes("generateMetadata = seoPage('/chinh-sach-dich-vu/')"), 'Page phải dùng seoPage() (SEO chỉnh được trong quản trị)');
  assert.ok(content.includes('/chinh-sach-dich-vu/'), 'Canonical URL phải là /chinh-sach-dich-vu/');
  assert.ok(content.includes('ServicePolicy'), 'Page phải render ServicePolicy');
  assert.ok(content.includes('WebPage'), 'JSON-LD schema type phải là WebPage');
});

test('footer and sitemap include /chinh-sach-dich-vu/', () => {
  const shellPath = path.join(process.cwd(), 'components', 'Shell.tsx');
  const shellContent = fs.readFileSync(shellPath, 'utf8');
  assert.ok(
    shellContent.includes('/chinh-sach-dich-vu/'),
    'Footer trong Shell.tsx phải có link tới /chinh-sach-dich-vu/'
  );

  const sitemapPath = path.join(process.cwd(), 'app', 'sitemap.ts');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  assert.ok(
    sitemapContent.includes('chinh-sach-dich-vu'),
    'app/sitemap.ts phải bao gồm chinh-sach-dich-vu'
  );
});

