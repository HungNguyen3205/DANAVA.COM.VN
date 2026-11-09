import { NextResponse } from 'next/server';
import { saveLead, checkRecentDuplicateLead } from '@/lib/database';
import { isValidPhoneNumber } from '@/lib/contact-services';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    // 1. Chống spam qua trường bẫy Honeypot
    const botTrap = typeof body.website_trap === 'string' ? body.website_trap.trim() : '';
    if (botTrap) {
      // Phản hồi thành công giả lập để đánh lừa bot tự động mà không lưu rác vào database
      return NextResponse.json({
        ok: true,
        id: 'lead_ok',
        message: 'Yêu cầu của bạn đã được tiếp nhận.'
      }, { status: 201 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const businessType = typeof body.businessType === 'string' ? body.businessType.trim() : '';
    const service = typeof body.service === 'string' ? body.service.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const source = typeof body.source === 'string' ? body.source.trim() : '';

    // 2. Validate phía Server
    if (!name || name.length < 2 || name.length > 150) {
      return NextResponse.json({ error: 'Vui lòng cung cấp họ và tên (từ 2 đến 150 ký tự).' }, { status: 400 });
    }

    if (!phone || (!isValidPhoneNumber(phone) && phone.length < 9) || phone.length > 25) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại liên hệ hợp lệ (từ 9 đến 12 chữ số).' }, { status: 400 });
    }

    if (email && (email.length > 200 || !EMAIL_REGEX.test(email))) {
      return NextResponse.json({ error: 'Địa chỉ email không đúng định dạng.' }, { status: 400 });
    }

    if (businessType.length > 150) {
      return NextResponse.json({ error: 'Loại hình kinh doanh không hợp lệ.' }, { status: 400 });
    }

    if (service.length > 200) {
      return NextResponse.json({ error: 'Dịch vụ quan tâm không hợp lệ.' }, { status: 400 });
    }

    if (!message || message.length < 3 || message.length > 5000) {
      return NextResponse.json({ error: 'Vui lòng nhập nội dung hoặc bài toán cần trao đổi (tối đa 5,000 ký tự).' }, { status: 400 });
    }

    // 3. Chống gửi lặp liên tục (Anti-duplicate trong 45 giây cùng số điện thoại)
    if (checkRecentDuplicateLead(phone, 45000)) {
      return NextResponse.json({
        error: 'Yêu cầu tư vấn của bạn vừa được gửi lên hệ thống. Đội ngũ chuyên viên DANAVA đang xử lý, vui lòng không gửi lặp lại liên tục.'
      }, { status: 429 });
    }

    // 4. Lưu dữ liệu lead vào hệ thống
    const leadId = saveLead({
      name,
      phone,
      email: email || '',
      business_type: businessType,
      service,
      source: source || (req.headers.get('referer') || ''),
      message
    });

    return NextResponse.json({
      ok: true,
      id: leadId,
      message: 'Cảm ơn bạn! Yêu cầu tư vấn đã được gửi thành công đến DANAVA Solutions. Chuyên viên của chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.'
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.' }, { status: 500 });
  }
}

export async function GET() {
  return new Response(null, { status: 405 });
}
