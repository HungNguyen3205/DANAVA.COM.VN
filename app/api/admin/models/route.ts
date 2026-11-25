import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { requirePermission, actorOf } from '@/lib/auth';
import { logAction } from '@/lib/database';
import { mediaDirectory } from '@/lib/media-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limit = 20 * 1024 * 1024;

/** Tải mô hình 3D (.glb, glTF 2.0 nhị phân, ≤ 20 MB) cho thiết bị phòng gym. Trả { url }. */
export async function POST(req: Request) {
  const user = await requirePermission(req, 'media.write', true);
  if (user instanceof Response) return user.status === 401 ? new Response(null, { status: 403 }) : user;
  if (Number(req.headers.get('content-length') || 0) > limit) return NextResponse.json({ error: 'Mô hình 3D tối đa 20 MB.' }, { status: 413 });
  try {
    const reader = req.body?.getReader();
    if (!reader) return new Response(null, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); return NextResponse.json({ error: 'Mô hình 3D tối đa 20 MB.' }, { status: 413 }); }
      chunks.push(value);
    }
    const input = Buffer.concat(chunks);
    // glTF nhị phân: "glTF" + phiên bản 2 + độ dài khớp tệp
    if (input.length < 20 || input.toString('ascii', 0, 4) !== 'glTF' || input.readUInt32LE(4) !== 2 || input.readUInt32LE(8) !== input.length)
      return NextResponse.json({ error: 'Chỉ nhận mô hình .glb (glTF 2.0 nhị phân). Xuất từ Blender / SketchUp dạng GLB.' }, { status: 400 });
    const name = randomUUID() + '.glb';
    await writeFile(join(await mediaDirectory(), name), input, { flag: 'wx', mode: 0o600 });
    await logAction(actorOf(user), 'tai-mo-hinh-3d', name);
    return NextResponse.json({ url: `/assets/uploads/${name}`, bytes: input.length }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Không thể lưu mô hình 3D.' }, { status: 400 });
  }
}
