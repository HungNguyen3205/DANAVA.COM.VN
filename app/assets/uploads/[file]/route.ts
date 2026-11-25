import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mediaDirectory, validMediaName, validModelName } from '@/lib/media-storage';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Ảnh (.webp) và mô hình 3D thiết bị (.glb) tải lên từ admin. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const model = validModelName(file);
  if (!validMediaName(file) && !model) return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(join(await mediaDirectory(), file));
    return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': model ? 'model/gltf-binary' : 'image/webp', 'Cache-Control': 'public,max-age=31536000,immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
