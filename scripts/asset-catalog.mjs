#!/usr/bin/env node
/**
 * Danh mục ảnh có sẵn của website (public/assets) → lib/asset-catalog.json, để Thư viện ảnh trong admin
 * liệt kê đủ mọi ảnh (không chỉ ảnh tải lên) và nhóm theo thư mục (lib/media-groups.ts).
 *
 *   node scripts/asset-catalog.mjs          # tạo lại danh mục (chạy tự động trước `npm run build`)
 *
 * Thêm / xóa ảnh trong public/assets mà quên chạy lại → test tests/media-library.test.ts báo lỗi.
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import sharp from 'sharp';

const ROOT = 'public/assets';
const OUT = 'lib/asset-catalog.json';
const IMAGE = /\.(webp|png|jpe?g|svg)$/i;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'uploads') out.push(...await walk(full)); }
    else if (IMAGE.test(entry.name)) out.push(full);
  }
  return out;
}

const files = (await walk(ROOT)).sort();
const items = [];
for (const file of files) {
  const url = '/' + relative('public', file).split(sep).join('/');
  const { size } = await stat(file);
  let w = 0, h = 0;
  try { const m = await sharp(file).metadata(); w = m.width || 0; h = m.height || 0; } catch {}
  items.push({ url, bytes: size, w, h });
}
await writeFile(OUT, JSON.stringify(items, null, 0).replace(/\},\{/g, '},\n{') + '\n');
console.log(`asset-catalog: ${items.length} ảnh → ${OUT}`);
