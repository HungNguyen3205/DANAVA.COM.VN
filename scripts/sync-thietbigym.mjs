#!/usr/bin/env node
/**
 * Đồng bộ danh mục thiết bị phòng gym từ đối tác thietbigym.vn (Sapo: /<sản-phẩm>.json theo sitemap).
 *
 *   node scripts/sync-thietbigym.mjs            # tải lại giá / thông tin / ảnh → lib/equipment-catalog.json + public/assets/equipment/tbg/
 *   node scripts/sync-thietbigym.mjs --no-images
 *
 * - Giá lấy đúng giá bán trên thietbigym.vn (0 = "Liên hệ").
 * - Kích thước: tách từ mô tả ("Kích thước … 2250*930*1650mm"); không có thì ước tính theo loại máy (dimsEstimated = true).
 * - Loại máy (kind) suy từ tên → dựng mô hình 3D tương ứng trong phòng lab (components/site/gym-planner-models.ts).
 * - Bỏ qua gói dịch vụ "SETUP…"; thảm gạch cao su 50×50 cm lưu riêng (flooring) để tính chi phí lát sàn.
 * - Gọi lần lượt, cách nhau 400ms để không làm nặng máy chủ đối tác.
 */
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');

const SITE = 'https://thietbigym.vn';
const UA = 'Mozilla/5.0 (compatible; DANAVA catalog sync)';
const OUT = 'lib/equipment-catalog.json';
const IMG_DIR = 'public/assets/equipment/tbg';
const withImages = !process.argv.includes('--no-images');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const get = async (url, type = 'text') => { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) throw Error(`${r.status} ${url}`); return type === 'json' ? r.json() : type === 'buf' ? Buffer.from(await r.arrayBuffer()) : r.text(); };

/* ---------- Phân loại theo tên ---------- */
const KINDS = [
  ['skip', /^setup /i],
  ['flooring', /thảm gạch|thảm cao su/i],
  ['accessory', /\(ốp\)|\bốp\)|\bopt\b|option|thanh nối|tạ tay|tạ miếng|bumper plate|jack bar/i],
  ['stack', /\brobot\b/i],
  ['treadmill', /chạy bộ|treadmill|\bA400\b|\bA200\b|JB-?\s?\d|K800|PT300|RT500|X5 NEW|SH-T\d/i],
  ['elliptical', /elip|elliptical|trượt tuyết|\bRE500\b/i],
  ['rower', /chèo thuyền|ski\s*&\s*row|\brower\b/i],
  ['recumbent', /recumbent|\bRR500\b/i],
  ['bike', /bike|xe đạp|cycle|\bPS300|\bRU500\b|\bHB005\b|R2T/i],
  ['multi', /stack multi|multi-station|multi-functional|functional trainer|ES2100|ES3000/i],
  ['cable', /pulley|crossover|cable/i],
  ['dumbbell-rack', /dumbbell rack|kệ tạ/i],
  ['plate-tree', /plate tree|plate rack|weight plate|barbell rack|bar rack/i],
  ['smith', /smith|half cage|magic rack/i],
  ['rack', /power rack|squat rack|\brack\b/i],
  ['bench', /bench|ghế|roman chair|web board|scott/i],
  ['plate', /^IFP|^SL\s?7|^SL0|leverage|t-bar|hack squat|45 leg press|angled leg press|belt squat|jammer|squat lunge|hip thrust|^M-022/i],
  ['stack', /.*/]
];
const kindOf = name => KINDS.find(([, re]) => re.test(name))[0];
const CATEGORY = { treadmill: 'cardio', bike: 'cardio', recumbent: 'cardio', elliptical: 'cardio', rower: 'cardio', stack: 'strength', plate: 'strength', multi: 'strength', cable: 'strength', smith: 'strength', rack: 'strength', bench: 'free-weight', 'dumbbell-rack': 'free-weight', 'plate-tree': 'free-weight', accessory: 'accessory' };
const COLOR = { cardio: '#2b4294', strength: '#f26b1d', 'free-weight': '#13244f', accessory: '#5b6478' };
/** Kích thước ước tính (cm) theo loại, khi mô tả không ghi */
function guessDims(kind, name) {
  if (kind === 'multi') return /4 stack/i.test(name) ? [420, 230, 230] : /3 stack/i.test(name) ? [320, 220, 230] : [170, 120, 230];
  if (kind === 'cable') return /dual|crossover/i.test(name) ? [360, 90, 230] : [110, 80, 230];
  if (kind === 'bench') return /incline|decline|shoulder press bench|olympic|bench press/i.test(name) ? [180, 140, 125] : /roman|hyper|knee raise/i.test(name) ? [120, 80, 110] : [130, 60, 50];
  return { treadmill: [210, 90, 150], bike: [120, 60, 135], recumbent: [165, 70, 125], elliptical: [205, 75, 165], rower: [240, 60, 100],
    stack: [150, 120, 160], plate: [180, 140, 130], smith: [220, 150, 230], rack: [160, 150, 230], 'dumbbell-rack': [200, 60, 80], 'plate-tree': [70, 70, 130], accessory: [40, 40, 30] }[kind];
}
const clean = html => (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
function parseDims(text) {
  const m = text.match(/(kích thước|kích thươc)[^0-9]{0,40}(\d{2,4}(?:[.,]\d+)?)\s*[x×*]\s*(\d{2,4}(?:[.,]\d+)?)\s*[x×*]\s*(\d{2,4}(?:[.,]\d+)?)\s*(mm|cm|m\b)?/i);
  if (!m) return null;
  const unit = (m[5] || 'mm').toLowerCase();
  const f = unit === 'cm' ? 1 : unit === 'm' ? 100 : .1;
  const d = [m[2], m[3], m[4]].map(v => Math.round(Number(v.replace(',', '.')) * f));
  return d.every(v => v >= 20 && v <= 600) ? d : null;
}
/** Câu giới thiệu ngắn: câu đầu có nội dung của mô tả (≤ 220 ký tự) */
function shortDesc(text, name) {
  const t = text.replace(new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').trim();
  const s = t.split(/(?<=[.!?])\s+/).find(x => x.length > 30) || t;
  return s.length > 220 ? s.slice(0, 217).replace(/\s+\S*$/, '') + '…' : s;
}
const slugId = alias => 'tbg-' + alias.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 54);

/* ---------- Chạy ---------- */
const sitemap = await get(`${SITE}/sitemap_products_1.xml`);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()).filter(u => u !== `${SITE}/`);
console.log(`sitemap: ${urls.length} sản phẩm`);
if (withImages) await fs.mkdir(IMG_DIR, { recursive: true });
const items = [];
let flooring = null;
for (const [i, url] of urls.entries()) {
  try {
    const p = await get(url + '.json', 'json');
    const kind = kindOf(p.name);
    if (kind === 'skip') continue;
    const text = clean(p.content || p.summary);
    const price = p.price > 0 ? String(Math.round(p.price)) : '';
    if (kind === 'flooring') { flooring = { name: p.name.trim(), price, sizeCm: 50, source: url }; continue; }
    const parsed = parseDims(text);
    const [width, depth, height] = parsed || guessDims(kind, p.name);
    const id = slugId(p.alias || url.split('/').pop());
    let image = '';
    const src = p.featured_image || p.images?.[0];
    if (withImages && src) {
      const file = `${IMG_DIR}/${id.slice(4)}.webp`;
      try {
        if (!existsSync(file)) await sharp(await get(src.startsWith('//') ? 'https:' + src : src, 'buf')).rotate().resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
        image = '/' + file.replace(/^public\//, '');
      } catch (e) { console.log('  ảnh lỗi', p.name, e.message); }
    }
    const category = CATEGORY[kind];
    items.push({
      id, name: p.name.replace(/\s+/g, ' ').trim().slice(0, 120), category, price, width, depth, height, image, model: '', color: COLOR[category],
      description: shortDesc(text, p.name).slice(0, 500), published: true,
      kind, sku: (p.variants?.[0]?.sku || '').slice(0, 60), source: url, dimsEstimated: !parsed
    });
  } catch (e) { console.log('  lỗi', url, e.message); }
  if (i % 50 === 0) console.log(`${i}/${urls.length}`);
  await sleep(400);
}
await fs.writeFile(OUT, JSON.stringify({ syncedAt: new Date().toISOString().slice(0, 10), source: SITE, flooring, items }, null, 1) + '\n');
console.log(`xong: ${items.length} thiết bị${flooring ? ' + thảm sàn' : ''} → ${OUT}`);
