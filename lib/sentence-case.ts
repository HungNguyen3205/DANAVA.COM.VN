/**
 * Đổi tiêu đề viết toàn chữ hoa thành dạng câu: chỉ chữ cái đầu viết hoa.
 * Tiêu đề đã có chữ thường giữ nguyên. Các từ thương hiệu/viết tắt (cả từ đứng riêng) giữ chữ hoa.
 */
const PHRASES = ['DANAVA GO', 'DANAVA STUDIO'];
const WORDS = new Set(['DANAVA', 'AI', 'SEO', 'QR', 'VN', 'UX', 'UI', 'PNJ', 'AEON', 'GYM', 'SPA', 'CRM']);

export function sentenceCase(title: string): string {
  const letters = title.replace(/[^\p{L}]/gu, '');
  if (!letters) return title;
  const upper = (letters.match(/\p{Lu}/gu) || []).length;
  if (upper / letters.length < 0.6) return title; // đã có chữ thường: giữ nguyên

  let out = title.toLowerCase();
  // cụm từ thương hiệu trước
  for (const phrase of PHRASES) {
    const lower = phrase.toLowerCase();
    out = out.replace(new RegExp(`(^|[^\\p{L}])${lower.replace(/ /g, '\\s')}(?=$|[^\\p{L}])`, 'gu'), (_m, pre: string) => pre + phrase);
  }
  // từng từ đứng riêng: chỉ đổi khi cả từ là một từ thương hiệu (không đổi "vai" thành "vAI")
  out = out.replace(/\p{L}+/gu, w => {
    const up = w.toUpperCase();
    return WORDS.has(up) ? up : w;
  });
  // chữ cái đầu tiên của tiêu đề viết hoa
  return out.replace(/\p{L}/u, ch => ch.toUpperCase());
}
