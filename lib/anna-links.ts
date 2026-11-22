/** Liên kết ANNA được phép đưa cho khách. */
export function linkAllowed(href: string, trusted: string[]) {
  if (trusted.includes(href)) return true;
  if (/^\/(?![/\\])[^\s\\]*$/.test(href)) return !/^\/(api|admin)(\/|$)/i.test(href);
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    return /^(.+\.)?(danava\.vn|danava\.com\.vn|danavago\.com)$/.test(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Bỏ liên kết không được phép, giữ lại chữ. Lặp tới khi ổn định:
 * "[[x](xấu)](xấu hơn)" sau một lượt lại tạo thành một liên kết mới.
 */
export function dropUnsafeLinks(text: string, trusted: string[]) {
  let current = text;
  for (;;) {
    const next = current.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label: string, href: string) => (linkAllowed(href, trusted) ? whole : label));
    if (next === current) return next;
    current = next;
  }
}
