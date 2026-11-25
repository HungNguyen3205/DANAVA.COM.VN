/** Nén mô hình .glb khi tải lên (lib/glb-optimize.ts): giảm lưới quá dày, file nhỏ hơn, đọc lại được bằng bộ giải nén meshopt. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { GLB_LIMITS, optimizeGlb } from '../lib/glb-optimize.ts';

/** Mặt lưới n × n ô (2n² tam giác), nhấp nhô nhẹ để giảm lưới có việc làm */
async function gridGlb(n: number) {
  const doc = new Document();
  const buf = doc.createBuffer();
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) pos.push(i / n, Math.sin(i / 7) * Math.cos(j / 9) * .05, j / n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const a = i * (n + 1) + j, b = a + n + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buf))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buf))
    .setMaterial(doc.createMaterial('khung').setBaseColorFactor([.1, .1, .1, 1]));
  doc.createScene().addChild(doc.createNode('may').setMesh(doc.createMesh().addPrimitive(prim)));
  return new NodeIO().writeBinary(doc);
}

test('mô hình quá dày (~180.000 tam giác) được giảm lưới, nhỏ hơn và đọc lại được', async () => {
  const input = await gridGlb(300);
  const { glb, stats } = await optimizeGlb(input);
  assert.equal(stats.trianglesBefore, 180_000);
  assert.ok(stats.triangles <= GLB_LIMITS.triangles * 1.1, String(stats.triangles));
  assert.ok(glb.byteLength < input.byteLength / 3, `${input.byteLength} → ${glb.byteLength}`);
  assert.ok(stats.warnings.some(w => w.includes('tam giác')));
  await MeshoptDecoder.ready;
  const back = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).readBinary(glb);
  assert.equal(back.getRoot().listMeshes().length, 1);
});

test('mô hình nhẹ: không giảm lưới, không cảnh báo', async () => {
  const { stats } = await optimizeGlb(await gridGlb(40));
  assert.equal(stats.triangles, stats.trianglesBefore);
  assert.deepEqual(stats.warnings, []);
});

test('file không phải glTF bị từ chối', async () => {
  await assert.rejects(() => optimizeGlb(new TextEncoder().encode('khong phai glb')));
});
