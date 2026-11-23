import { sameOrigin } from '@/lib/origin';
import { checkRecentDuplicateLead, getSiteContent, saveLead } from '@/lib/database';
import { block } from '@/lib/blocks';
import { applicationLead, openJobs, parseApplication, positionsFor } from '@/lib/careers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 16_000;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return Response.json({ error: 'Nội dung quá dài.' }, { status: 413 });
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return Response.json({ error: 'Nội dung quá dài.' }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
    // Bẫy bot: người thật không thấy ô này
    if (typeof body?.website_trap === 'string' && body.website_trap.trim()) return Response.json({ ok: true }, { status: 201 });

    const careers = block((await getSiteContent()).data, 'careers');
    const { application, error, field } = parseApplication(body, positionsFor(openJobs(careers)));
    if (!application) return Response.json({ error, field }, { status: 400 });
    if (await checkRecentDuplicateLead(application.phone, 45_000)) {
      return Response.json({ error: 'Số điện thoại này vừa gửi một yêu cầu. Bạn thử lại sau một phút nhé.' }, { status: 429 });
    }
    await saveLead(applicationLead(application));
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('[recruit] failed', (error as Error)?.name);
    return Response.json({ error: 'Chưa gửi được hồ sơ. Bạn thử lại hoặc gửi qua email giúp DANAVA.' }, { status: 500 });
  }
}
