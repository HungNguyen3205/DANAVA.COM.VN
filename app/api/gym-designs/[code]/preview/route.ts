import { getDesign, validCode } from '@/lib/gym-designs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Ảnh tổng thể của phương án (JPEG) — nhân viên DANAVA xem nhanh khi nhận yêu cầu tư vấn */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  if (!validCode(code)) return new Response(null, { status: 400 });
  const d = await getDesign(code);
  const m = d?.preview?.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!m) return new Response(null, { status: 404 });
  return new Response(Buffer.from(m[1], 'base64'), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=300', 'X-Robots-Tag': 'noindex' } });
}
