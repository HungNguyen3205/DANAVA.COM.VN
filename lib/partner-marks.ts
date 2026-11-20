/** Logo vuông đã cắt viền (public/assets/partners/marks/) cho các logo đối tác có sẵn; logo tải lên khác giữ nguyên. */
const MARKS = new Set(['bung-healing', 'dyf', 'fuji-swimming-club-danang', 'glg-yoga-school', 'hariver-gym-fitness', 'hoc-vien-quoc-te-yoga-ngoc-bich', 'hue-pilates-yoga', 'kien-gym', 'lien-minh-yoga-viet-nam', 'sadhana-pilates', 'sun-moon-yogashala', 'tam-tay-gym', 'tigi-yoga', 'vf-gym', 'yoga-club-vietnam']);
export const markOf = (logo: string) => {
  const m = /^\/assets\/partners\/([a-z0-9-]+)\.webp$/.exec(logo);
  return m && MARKS.has(m[1]) ? { src: `/assets/partners/marks/${m[1]}.webp`, fill: true } : { src: logo, fill: false };
};
