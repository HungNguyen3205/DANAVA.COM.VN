import { Anton, Bricolage_Grotesque, Cormorant_Garamond, Fraunces, Great_Vibes, Playfair_Display } from 'next/font/google';

/* Chữ riêng của các mẫu demo (/demo/*) — chỉ nạp trong app/demo/layout.tsx, không ảnh hưởng website chính. Tất cả có bộ chữ tiếng Việt. */
const anton = Anton({ subsets: ['vietnamese', 'latin'], weight: '400', display: 'swap', variable: '--f-anton' });
const cormorant = Cormorant_Garamond({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], display: 'swap', variable: '--f-cormorant' });
const vibes = Great_Vibes({ subsets: ['vietnamese', 'latin'], weight: '400', display: 'swap', variable: '--f-vibes' });
const playfair = Playfair_Display({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], display: 'swap', variable: '--f-playfair' });
const fraunces = Fraunces({ subsets: ['vietnamese', 'latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], display: 'swap', variable: '--f-fraunces' });
const bricolage = Bricolage_Grotesque({ subsets: ['vietnamese', 'latin'], weight: ['400', '600', '800'], display: 'swap', variable: '--f-bricolage' });

export const demoFontVars = [anton, cormorant, vibes, playfair, fraunces, bricolage].map(f => f.variable).join(' ');
