import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { initial, validateContent } from '../lib/content.ts';
import { normalizeContent, CLIENT_SEEDS } from '../lib/content-defaults.ts';
import { publicPartners, publicPlaces, publicContent } from '../lib/site-queries.ts';

test('15 đối tác đồng hành từ danava.vn: đủ, không trùng, có logo cục bộ và nguồn', () => {
  const src = JSON.parse(fs.readFileSync('public/assets/partners/sources.json', 'utf8'));
  assert.equal(src.partners.length, 15);
  const partners = CLIENT_SEEDS.filter(c => c.relation !== 'place');
  assert.equal(partners.length, 15);
  assert.equal(new Set(CLIENT_SEEDS.map(c => c.name.toLowerCase())).size, CLIENT_SEEDS.length);
  for (const c of CLIENT_SEEDS) {
    assert.ok(fs.existsSync('public' + c.logo), c.logo);
    // Trang đối tác trên danava.vn bị 404 thì không gắn link, nhưng phải ghi rõ lý do
    assert.ok(c.url.startsWith('https://danava.vn/places/') || (c.url === '' && c.note.includes('404')), c.name + ': ' + c.url);
    assert.ok(c.permission && c.published && c.note.includes('danava.vn'));
  }
  assert.equal(CLIENT_SEEDS.filter(c => c.relation === 'client').length, 2, 'HARIVER, Huế Pilates & Yoga là khách hàng có case study');
  const n = normalizeContent(structuredClone(initial));
  assert.equal(validateContent(n), true);
  assert.equal(publicPartners(n).length, 15);
});

test('32 địa điểm còn lại trên danava.vn/places: đủ thông tin, có nguồn, không vào khối logo', () => {
  const src = JSON.parse(fs.readFileSync('public/assets/partners/sources.json', 'utf8'));
  const places = CLIENT_SEEDS.filter(c => c.relation === 'place');
  assert.equal(places.length, 32);
  assert.equal(src.places.length, 32);
  // 47 địa điểm công khai = 15 đối tác + 32 địa điểm
  assert.equal(CLIENT_SEEDS.filter(c => c.url.startsWith('https://danava.vn/places/')).length, 47);
  assert.equal(CLIENT_SEEDS.filter(c => c.verified).length, 10, '10 địa điểm DANAVA Verified');
  for (const c of places) {
    assert.ok(fs.existsSync('public' + c.logo) && c.cover && fs.existsSync('public' + c.cover), c.name);
    assert.ok(c.city, c.name + ' thiếu tỉnh/thành');
  }
  const fuji = CLIENT_SEEDS.find(c => c.id === 'danava-partner-12')!;
  assert.equal(fuji.url, 'https://danava.vn/places/fuji-swimming-club-da-nang');
  const n = normalizeContent(structuredClone(initial));
  assert.equal(publicPlaces(n).length, 32);
  assert.ok(!publicContent(n).clients!.some(c => c.relation === 'place'), 'không gửi danh bạ xuống trình duyệt');
});

test('dữ liệu khách hàng đã lưu trên production không bị thay bằng danh sách mới', () => {
  const saved = structuredClone(initial);
  saved.clients = [CLIENT_SEEDS[0]];
  const n = normalizeContent(saved).clients!;
  assert.equal(n.filter(c => c.relation !== 'place').length, 1, 'không thêm lại đối tác đã xoá');
  assert.equal(n.filter(c => c.relation === 'place').length, 32, 'dữ liệu cũ được bổ sung địa điểm một lần');
  saved.clients = [CLIENT_SEEDS[0], { ...CLIENT_SEEDS.find(c => c.relation === 'place')! }];
  assert.equal(normalizeContent(saved).clients!.length, 2, 'đã có địa điểm thì giữ nguyên lựa chọn');
});

test('chống CSRF: chấp nhận tên miền chính hoặc host đang phục vụ, chặn trang ngoài', async () => {
  process.env.SITE_URL = 'https://danava.com.vn';
  const { sameOrigin } = await import('../lib/origin.ts');
  const req = (origin: string | null, host: string, url = 'http://localhost:3000/api/admin/session/') =>
    new Request(url, { method: 'POST', headers: { ...(origin ? { origin } : {}), host } });
  assert.equal(sameOrigin(req('https://danava.com.vn', 'danava.com.vn')), true);
  assert.equal(sameOrigin(req('http://staging.local:3300', 'staging.local:3300')), true, 'staging dùng SITE_URL production vẫn đăng nhập được');
  assert.equal(sameOrigin(req('http://localhost:3000', 'localhost:3000')), true);
  assert.equal(sameOrigin(req('https://evil.example', 'danava.com.vn')), false);
  assert.equal(sameOrigin(req(null, 'danava.com.vn')), false);
});

test('thông tin chi tiết đối tác lấy từ danava.vn: địa chỉ, giờ mở cửa, tiện ích, ảnh bìa cục bộ', () => {
  const withDetail = CLIENT_SEEDS.filter(c => c.address || c.description);
  assert.ok(withDetail.length >= 13, `có ${withDetail.length} đối tác có thông tin chi tiết`);
  for (const c of CLIENT_SEEDS) if (c.cover) assert.ok(fs.existsSync('public' + c.cover), c.cover);
  const ycv = CLIENT_SEEDS.find(c => c.name === 'Yoga Club Vietnam')!;
  assert.ok(ycv.address?.includes('1081 Ngô Quyền') && ycv.hours && (ycv.amenities || []).length > 0);
  const src = JSON.parse(fs.readFileSync('public/assets/partners/sources.json', 'utf8'));
  assert.ok(src.partners.every((p: { pageStatus: number }) => typeof p.pageStatus === 'number'));
});
