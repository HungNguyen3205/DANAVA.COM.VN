/**
 * Đổi tiêu đề viết toàn chữ hoa thành dạng câu: chỉ chữ cái đầu viết hoa.
 * Tiêu đề đã viết thường/hỗn hợp giữ nguyên. Các từ thương hiệu và viết tắt giữ dạng chữ hoa.
 */
const KEEP_UPPER = ['DANAVA', 'DANAVA GO', 'DANAVA STUDIO', 'AI', 'SEO', 'QR', 'VN', 'UX', 'UI', 'PNJ', 'AEON', 'GYM', 'SPA', 'CRM'];

export function sentenceCase(title: string): string {
  const letters = title.replace(/[^\p{L}]/gu, '');
  if (!letters) return title;
  const upper = (letters.match(/\p{Lu}/gu) || []).length;
  if (upper / letters.length < 0.6) return title; // đã có chữ thường: giữ nguyên

  let out = title.toLowerCase();
  for (const word of KEEP_UPPER) {
    const re = new RegExp(`(^|[^\p{L}])${word.toLowerCase().replace(/ /g, '\s')}(?=$|[^\p{L}])`, 'giu');
    out = out.replace(re, (m, pre) => pre + word);
  }
  // chữ cái đầu tiên của tiêu đề viết hoa
  return out.replace(/\p{L}/u, ch => ch.toUpperCase());
}
