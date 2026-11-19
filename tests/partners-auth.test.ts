import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { initial, validateContent } from '../lib/content.ts';
import { normalizeContent, CLIENT_SEEDS } from '../lib/content-defaults.ts';
import { publicClients } from '../lib/site-queries.ts';

test('15 đối tác đồng hành từ danava.vn: đủ, không trùng, có logo cục bộ và nguồn', () => {
  const src = JSON.parse(fs.readFileSync('public/assets/partners/sources.json', 'utf8'));
  assert.equal(src.partners.length, 15);
  assert.equal(CLIENT_SEEDS.length, 15);
  assert.equal(new Set(CLIENT_SEEDS.map(c => c.name.toLowerCase())).size, 15);
  for (const c of CLIENT_SEEDS) {
    assert.ok(fs.existsSync('public' + c.logo), c.logo);
    assert.ok(c.url.startsWith('https://danava.vn/places/'), c.url);
    assert.ok(c.permission && c.published && c.note.includes('danava.vn'));
  }
  assert.equal(CLIENT_SEEDS.filter(c => c.relation === 'client').length, 2, 'HARIVER, Huế Pilates & Yoga là khách hàng có case study');
  const n = normalizeContent(structuredClone(initial));
  assert.equal(validateContent(n), true);
  assert.equal(publicClients(n).length, 15);
});

test('dữ liệu khách hàng đã lưu trên production không bị thay bằng danh sách mới', () => {
  const saved = structuredClone(initial);
  saved.clients = [CLIENT_SEEDS[0]];
  assert.equal(normalizeContent(saved).clients!.length, 1);
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
