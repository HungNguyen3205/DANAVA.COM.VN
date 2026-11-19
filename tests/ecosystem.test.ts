import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialEcosystemUnits,
  getEcosystemUnits,
  getEcosystemCategoryCounts,
  ECOSYSTEM_CATEGORIES,
  type EcosystemCategory,
  type EcosystemUnit
} from '../lib/ecosystem.ts';

test('ecosystem categories contain the 3 active core groups', () => {
  const catIds = ECOSYSTEM_CATEGORIES.map(c => c.id);
  assert.ok(catIds.includes('all'));
  assert.ok(catIds.includes('san-pham-so'));
  assert.ok(!catIds.includes('truyen-thong'), 'DANAVA không còn khối truyền thông số');
  assert.ok(catIds.includes('du-lich-su-kien'));
  assert.ok(catIds.includes('cong-dong'));
});

test('public ecosystem units only include visible items', () => {
  const units = getEcosystemUnits();
  assert.ok(units.length > 0);
  assert.ok(units.every(u => u.visible));
});

test('every ecosystem unit card has valid name, target audience, description, features and official link', () => {
  const units = getEcosystemUnits();

  for (const unit of units) {
    assert.ok(unit.name.trim().length > 0, `Unit ${unit.id} must have a name`);
    assert.ok(unit.targetAudience.trim().length > 10, `Unit ${unit.id} must define target audience`);
    assert.ok(unit.description.trim().length > 20, `Unit ${unit.id} must have a detailed description`);
    assert.ok(unit.features.length >= 2, `Unit ${unit.id} must have at least 2 features`);
    assert.ok(unit.officialLink.label.trim().length > 0, `Unit ${unit.id} must have link label`);
    assert.ok(
      unit.officialLink.href.startsWith('/') || unit.officialLink.href.startsWith('https://'),
      `Unit ${unit.id} link must be valid relative or https URL`
    );
    assert.ok(unit.image.startsWith('/assets/'), `Unit ${unit.id} must have valid local image`);
  }
});

test('DANAVA Studio card has explicit gateway link to its product page', () => {
  const studio = initialEcosystemUnits.find(u => u.id === 'studio');
  assert.ok(studio, 'DANAVA Studio must exist in ecosystem');
  assert.equal(studio.category, 'san-pham-so');
  assert.equal(studio.officialLink.href, '/giai-phap/danava-studio/');
  assert.ok(studio.targetAudience.includes('Gym') || studio.targetAudience.includes('Yoga') || studio.targetAudience.includes('Pilates'));
});

test('Yoga Club Vietnam card has verified channel link to approved community route', () => {
  const yogaClub = initialEcosystemUnits.find(u => u.id === 'yoga-club');
  assert.ok(yogaClub, 'Yoga Club Vietnam must exist in ecosystem');
  assert.equal(yogaClub.category, 'cong-dong');
  assert.equal(yogaClub.officialLink.href, '/giai-phap/cong-dong/');
  assert.ok(yogaClub.badge.includes('Kênh đã duyệt') || yogaClub.badge.includes('Cộng đồng'));
});

test('filtering by category returns correct subset and category counts are consistent', () => {
  const all = getEcosystemUnits('all');
  const software = getEcosystemUnits('san-pham-so');
  const media = getEcosystemUnits('truyen-thong'); // khối đã gỡ → rỗng
  const travel = getEcosystemUnits('du-lich-su-kien');
  const community = getEcosystemUnits('cong-dong');

  assert.ok(software.length >= 2, 'Software category should have at least 2 units');
  assert.equal(media.length, 0, 'Không còn đơn vị truyền thông số');
  assert.ok(travel.length >= 2, 'Travel category should have at least 2 units');
  assert.ok(community.length >= 2, 'Community category should have at least 2 units');

  assert.equal(software.length + media.length + travel.length + community.length, all.length);

  const counts = getEcosystemCategoryCounts();
  assert.equal(counts['all'], all.length);
  assert.equal(counts['san-pham-so'], software.length);
  assert.equal(counts['truyen-thong'], media.length);
  assert.equal(counts['du-lich-su-kien'], travel.length);
  assert.equal(counts['cong-dong'], community.length);
});

test('empty unit filtering returns empty array without throwing', () => {
  const mockUnits: EcosystemUnit[] = [
    {
      id: 'hidden-item',
      name: 'Ẩn',
      shortName: 'Ẩn',
      category: 'san-pham-so',
      categoryName: 'Sản phẩm số',
      categoryKicker: 'Ẩn',
      targetAudience: 'N/A',
      description: 'Hidden item',
      features: ['F1', 'F2'],
      officialLink: { label: 'Link', href: '/giai-phap/' },
      badge: 'B',
      image: '/assets/legacy/website.webp',
      visible: false
    }
  ];

  const visibleOnly = mockUnits.filter(u => u.visible);
  assert.equal(visibleOnly.length, 0);
});


test('hệ sinh thái: không có khẳng định chưa có căn cứ; mọi đơn vị có vị trí trên hành trình; link sản phẩm là https', async () => {
  const { JOURNEY_STAGES, LIVE_PRODUCTS } = await import('../lib/ecosystem.ts');
  const text = JSON.stringify(initialEcosystemUnits).toLowerCase();
  for (const bad of ['hàng ngàn', 'toàn quốc', 'dưới 1 giây', 'cam kết chi phí', 'thường niên', 'ios & android', 'định kỳ']) assert.ok(!text.includes(bad), bad);
  const stages = new Set(JOURNEY_STAGES.map(s => s.id));
  for (const u of getEcosystemUnits()) {
    assert.ok(u.stage && stages.has(u.stage), u.id + ' thiếu vị trí trên hành trình');
    for (const l of u.live || []) assert.ok(l.href.startsWith('https://'), l.href);
  }
  assert.ok(LIVE_PRODUCTS.flatMap(g => g.items).some(i => i.host === 'edu-yoga.danava.vn'));
});

test('không còn Digital Marketing trong hệ sinh thái', () => {
  assert.ok(!getEcosystemUnits().some(u => u.id === 'digital' || /digital marketing/i.test(u.name + u.description)));
});
