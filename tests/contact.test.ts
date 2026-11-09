import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VALID_CONTACT_SERVICES,
  VALID_BUSINESS_TYPES,
  resolveValidService,
  isValidPhoneNumber
} from '../lib/contact-services.ts';
import { saveLead, getLeads, checkRecentDuplicateLead } from '../lib/database.ts';

test('valid contact services and business types contain comprehensive standard catalogues', () => {
  assert.ok(VALID_CONTACT_SERVICES.length >= 5, 'Phải có ít nhất 5 dịch vụ hợp lệ');
  assert.ok(VALID_BUSINESS_TYPES.length >= 5, 'Phải có ít nhất 5 loại hình kinh doanh');

  for (const s of VALID_CONTACT_SERVICES) {
    assert.ok(s.id && s.id.length > 0);
    assert.ok(s.label && s.label.length > 0);
    assert.ok(s.slug && s.slug.length > 0);
    assert.ok(s.category && s.category.length > 0);
  }
});

test('resolveValidService gracefully maps URL parameters and handles unexpected values', () => {
  // Test các tham số URL phổ biến
  assert.equal(
    resolveValidService('studio'),
    'DANAVA Studio — Phần mềm quản lý Gym, Yoga, Pilates & Spa'
  );
  assert.equal(
    resolveValidService('danava-studio'),
    'DANAVA Studio — Phần mềm quản lý Gym, Yoga, Pilates & Spa'
  );
  assert.equal(
    resolveValidService('website'),
    'Thiết kế Website & Landing Page chuyển đổi cao'
  );
  assert.equal(
    resolveValidService('marketing'),
    'Digital Marketing & Vận hành truyền thông tổng thể'
  );
  assert.equal(
    resolveValidService('travel'),
    'Tổ chức Du lịch trải nghiệm, Retreat & Sự kiện Wellness'
  );
  assert.equal(
    resolveValidService('media'),
    'Sản xuất Video ngắn, TVC & Hình ảnh thương hiệu'
  );

  // Fallback an toàn khi tham số null, rỗng hoặc giá trị lạ
  assert.equal(resolveValidService(null), VALID_CONTACT_SERVICES[0].label);
  assert.equal(resolveValidService(''), VALID_CONTACT_SERVICES[0].label);
  assert.equal(resolveValidService('gia-tri-khong-ton-tai'), VALID_CONTACT_SERVICES[0].label);
});

test('isValidPhoneNumber validates Vietnamese mobile numbers strictly', () => {
  // Số điện thoại hợp lệ
  assert.equal(isValidPhoneNumber('0935917677'), true);
  assert.equal(isValidPhoneNumber('0905123456'), true);
  assert.equal(isValidPhoneNumber('+84935917677'), true);
  assert.equal(isValidPhoneNumber('0389123456'), true);
  assert.equal(isValidPhoneNumber('0771234567'), true);

  // Số điện thoại không hợp lệ
  assert.equal(isValidPhoneNumber('12345'), false);
  assert.equal(isValidPhoneNumber('abcdefghij'), false);
  assert.equal(isValidPhoneNumber(''), false);
  assert.equal(isValidPhoneNumber('01234567890123456'), false);
});

test('saveLead persists business_type and source, and anti-duplicate check works', () => {
  const uniquePhone = '0988' + Math.floor(100000 + Math.random() * 900000);
  const leadId = saveLead({
    name: 'Khách hàng Hai Cột',
    phone: uniquePhone,
    email: 'haicot@example.com',
    business_type: 'Phòng tập Gym & Fitness Center',
    service: 'DANAVA Studio — Phần mềm quản lý Gym, Yoga, Pilates & Spa',
    source: 'https://danava.com.vn/giai-phap/danava-studio/',
    message: 'Cần demo tính năng check-in QR và tính hoa hồng huấn luyện viên.'
  });

  assert.ok(leadId.startsWith('lead_'));

  // Kiểm tra anti-duplicate ngay sau khi lưu
  const isDuplicate = checkRecentDuplicateLead(uniquePhone, 30000);
  assert.equal(isDuplicate, true, 'Số điện thoại vừa lưu phải bị phát hiện nếu gửi lại ngay');

  // Số điện thoại chưa lưu phải trả về false
  const notDuplicate = checkRecentDuplicateLead('0909000000', 30000);
  assert.equal(notDuplicate, false);

  // Kiểm tra getLeads lấy ra đúng các trường đã lưu
  const leads = getLeads(10);
  const found = leads.find(l => l.id === leadId);
  assert.ok(found, 'Lead vừa tạo phải xuất hiện trong getLeads');
  assert.equal(found.name, 'Khách hàng Hai Cột');
  assert.equal(found.phone, uniquePhone);
  assert.equal(found.business_type, 'Phòng tập Gym & Fitness Center');
  assert.equal(found.source, 'https://danava.com.vn/giai-phap/danava-studio/');
});

