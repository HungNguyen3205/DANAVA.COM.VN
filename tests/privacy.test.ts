import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { legacyRedirects } from '../lib/legacy-redirects.ts';

test('legacy redirects include privacy aliases redirecting permanently to /chinh-sach-rieng-tu/', () => {
  const privacyAliases = ['/privacy/', '/privacy-policy/', '/chinh-sach-bao-mat/'];

  for (const alias of privacyAliases) {
    const matched = legacyRedirects.find((r) => r.source === alias);
    assert.ok(matched, `Phải có redirect cho ${alias}`);
    assert.equal(matched.destination, '/chinh-sach-rieng-tu/');
    assert.equal(matched.permanent, true);
  }
});

test('privacy component source code covers all required technical sections and anchors', async () => {
  // Nội dung nằm trong CMS (lib/blocks.ts → khối "privacy"); thành phần hiển thị dựng mục lục và id từ dữ liệu
  const { blockDefaults } = await import('../lib/blocks.ts');
  const ids = blockDefaults().privacy.sections.map(sec => sec.id);
  const requiredAnchors = ['pham-vi', 'form-lien-he', 'analytics', 'embeds', 'luu-tru-bao-mat', 'quyen-khach-hang', 'xac-nhan-chu-website', 'thong-tin-lien-he'];
  assert.deepEqual(ids, requiredAnchors, 'Đủ 8 mục, đúng thứ tự');
  const content = fs.readFileSync(path.join(process.cwd(), 'components', 'PrivacyPolicy.tsx'), 'utf8');
  assert.ok(content.includes('href={`#${sec.id}`}'), 'Mục lục liên kết tới từng mục');
  assert.ok(content.includes('id={sec.id}'), 'Mỗi mục có id để neo');
});

test('privacy policy addresses real technical operations and flagged owner confirmations', async () => {
  const { blockDefaults } = await import('../lib/blocks.ts');
  const content = JSON.stringify(blockDefaults().privacy);

  // Đối chiếu thực tế kỹ thuật:
  assert.ok(content.includes('SHA-256'), 'Chính sách phải nêu rõ mã hóa danh tính một chiều SHA-256');
  assert.ok(content.includes('Không lưu địa chỉ IP'), 'Chính sách phải cam kết không lưu IP đầy đủ');
  assert.ok(content.includes('youtube-nocookie.com'), 'Chính sách phải nêu chế độ nhúng YouTube No-Cookie');
  assert.ok(content.includes('Tối đa 90 ngày'), 'Phải nêu thời gian lưu trữ nhật ký đo lường tối đa 90 ngày');
  assert.ok(content.includes('Honeypot'), 'Phải đề cập cơ chế Honeypot chống spam form');
  assert.ok(content.includes('45 giây'), 'Phải đề cập giới hạn tần suất gửi form liên hệ');

  // Đánh dấu rõ ràng các phần cần chủ website xác nhận:
  assert.ok(
    content.includes('CẦN CHỦ WEBSITE XÁC NHẬN TRƯỚC KHI XUẤT BẢN CHÍNH THỨC'),
    'Phải có banner cảnh báo phần cần chủ website xác nhận'
  );
  assert.ok(
    content.includes('24 tháng'),
    'Phải có đề xuất thời hạn lưu trữ leads 24 tháng chờ duyệt'
  );
  assert.ok(
    content.includes('Lê Tấn Thành'),
    'Phải chỉ định đầu mối DPO Ông Lê Tấn Thành chờ duyệt'
  );
  assert.ok(
    content.includes('72 giờ làm việc'),
    'Phải cam kết thời hạn giải quyết khiếu nại dữ liệu trong 72 giờ làm việc'
  );

  // Quyền theo Nghị định 13/2023/NĐ-CP:
  assert.ok(
    content.includes('13/2023/NĐ-CP'),
    'Phải viện dẫn Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân'
  );
});

test('privacy route page exports SEO metadata and WebPage JSON-LD schema', () => {
  const pagePath = path.join(process.cwd(), 'app', '(site)', 'chinh-sach-rieng-tu', 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'Route app/chinh-sach-rieng-tu/page.tsx phải tồn tại');

  const content = fs.readFileSync(pagePath, 'utf8');
  assert.ok(content.includes('metadata = seo('), 'Page phải export metadata bằng hàm seo()');
  assert.ok(content.includes('/chinh-sach-rieng-tu/'), 'URL canonical phải là /chinh-sach-rieng-tu/');
  assert.ok(content.includes('PrivacyPolicy'), 'Page phải render PrivacyPolicy component');
  assert.ok(content.includes('application/ld+json'), 'Page phải có script JSON-LD schema');
  assert.ok(content.includes('WebPage'), 'JSON-LD phải có type WebPage');
});

