/**
 * Nén mô hình 3D (.glb) khi quản trị viên tải lên (app/api/admin/models): bỏ phần thừa, gộp đỉnh trùng,
 * giảm lưới khi quá nhiều tam giác, thu ảnh texture về tối đa 1024 px dạng WebP, nén hình học meshopt.
 * Phòng lab 3D giải nén bằng MeshoptDecoder (components/site/gym-planner-engine.ts).
 * Chỉ chạy phía máy chủ.
 */
import { Logger, NodeIO, type Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

/** Ngưỡng cho một máy trong phòng lab: vượt thì giảm lưới / cảnh báo */
export const GLB_LIMITS = { triangles: 60_000, warnBytes: 1024 * 1024, maxBytes: 4 * 1024 * 1024, texture: 1024 };

export type GlbStats = { before: number; after: number; triangles: number; trianglesBefore: number; textures: number; textureWebp: boolean; warnings: string[] };

function countTriangles(doc: Document) {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) {
    const idx = p.getIndices(), pos = p.getAttribute('POSITION');
    const mode = p.getMode();
    if (mode !== 4) continue; // chỉ đếm TRIANGLES
    n += Math.floor((idx ? idx.getCount() : pos ? pos.getCount() : 0) / 3);
  }
  return n;
}

export async function optimizeGlb(input: Uint8Array): Promise<{ glb: Uint8Array; stats: GlbStats }> {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
  const io = new NodeIO().setLogger(new Logger(Logger.Verbosity.WARN)).registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
  const doc = await io.readBinary(input);
  doc.setLogger(new Logger(Logger.Verbosity.WARN));
  const warnings: string[] = [];
  const trianglesBefore = countTriangles(doc);

  await doc.transform(dedup(), prune(), weld());
  if (trianglesBefore > GLB_LIMITS.triangles) {
    const ratio = Math.max(.05, GLB_LIMITS.triangles / trianglesBefore);
    await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error: .002 }));
  }
  // Texture: thu nhỏ + WebP (cần sharp; máy chủ không chạy được sharp thì giữ nguyên ảnh)
  let textureWebp = false;
  const textures = doc.getRoot().listTextures().length;
  if (textures) {
    try {
      const sharp = (await import('sharp')).default;
      await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [GLB_LIMITS.texture, GLB_LIMITS.texture], quality: 80 }));
      textureWebp = true;
    } catch { warnings.push('Không nén được ảnh texture trên máy chủ; ảnh giữ nguyên.'); }
  }
  await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const glb = await io.writeBinary(doc);
  const triangles = countTriangles(doc);
  if (trianglesBefore > GLB_LIMITS.triangles) warnings.push(`Mô hình có ${trianglesBefore.toLocaleString('vi-VN')} tam giác, đã giảm còn khoảng ${triangles.toLocaleString('vi-VN')}. Kiểm tra lại hình dạng trong phòng lab.`);
  if (glb.byteLength > GLB_LIMITS.warnBytes) warnings.push(`Sau khi nén vẫn còn ${(glb.byteLength / 1048576).toFixed(1)} MB — nên giảm chi tiết hoặc ảnh trong Blender để điện thoại tải nhanh (khuyên dùng dưới 1 MB).`);
  return { glb, stats: { before: input.byteLength, after: glb.byteLength, triangles, trianglesBefore, textures, textureWebp, warnings } };
}
