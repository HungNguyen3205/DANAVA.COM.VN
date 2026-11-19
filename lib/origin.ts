/**
 * Chống CSRF: Origin của request phải là tên miền chính (SITE_URL) hoặc chính host đang phục vụ request.
 * Nhờ vậy bản staging/preview đặt SITE_URL=https://danava.com.vn (để canonical đúng) vẫn đăng nhập admin được
 * trên tên miền của chính nó, còn trang của bên thứ ba vẫn bị chặn.
 */
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const allowed = new Set([new URL(process.env.SITE_URL || req.url).origin, new URL(req.url).origin]);
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) {
    const proto = (req.headers.get('x-forwarded-proto') || new URL(req.url).protocol.replace(':', '')).split(',')[0].trim();
    allowed.add(`${proto}://${host.split(',')[0].trim()}`);
  }
  return allowed.has(origin);
}
