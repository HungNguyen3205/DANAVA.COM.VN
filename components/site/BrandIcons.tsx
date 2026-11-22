/** Biểu tượng kênh liên hệ / mạng xã hội (bộ lucide không có logo thương hiệu). */
export type BrandKey = 'facebook' | 'messenger' | 'tiktok' | 'youtube' | 'zalo' | 'linkedin' | 'x';

const PATHS: Record<Exclude<BrandKey, 'zalo'>, string> = {
  facebook: 'M13.6 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.4v3.2h2.8V22z',
  messenger: 'M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.43 3.14 7.18.17.15.27.36.27.58l.05 1.78c.02.57.6.94 1.12.71l1.99-.88c.17-.07.36-.09.53-.04.91.25 1.88.39 2.9.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm6 7.46-2.93 4.65c-.47.74-1.47.93-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.65c.46-.74 1.46-.93 2.17-.4l2.33 1.75c.21.16.51.16.72 0l3.16-2.4c.42-.32.97.18.69.63z',
  tiktok: 'M16.6 2c.3 2.6 1.8 4.3 4.4 4.5v3.2a7.6 7.6 0 0 1-4.3-1.3v6.8A6.8 6.8 0 1 1 9.8 8.4c.4 0 .7 0 1 .1v3.4a3.4 3.4 0 1 0 2.4 3.3V2z',
  youtube: 'M23 7.2a2.9 2.9 0 0 0-2-2C19.2 4.7 12 4.7 12 4.7s-7.2 0-9 .5a2.9 2.9 0 0 0-2 2C.5 9 .5 12 .5 12s0 3 .5 4.8a2.9 2.9 0 0 0 2 2c1.8.5 9 .5 9 .5s7.2 0 9-.5a2.9 2.9 0 0 0 2-2c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.7 15.1V8.9l5.4 3.1z',
  linkedin: 'M4.9 3a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zM3.1 9h3.6v12H3.1zM9 9h3.5v1.6c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6V21h-3.7v-5.9c0-1.4 0-3.2-2-3.2s-2.2 1.5-2.2 3.1v6H9z',
  x: 'M18.9 2h3.4l-7.4 8.5L23.6 22h-6.8l-5.3-7-6.1 7H2l7.9-9L1.5 2h7l4.8 6.4zm-1.2 18h1.9L7.5 3.9h-2z'
};

export function BrandIcon({ name }: { name: BrandKey }) {
  if (name === 'zalo') {
    return (
      <svg className="br-icon br-icon--zalo" viewBox="0 0 32 32" aria-hidden="true">
        <path fill="currentColor" d="M16 3C7.7 3 1 8.3 1 15c0 3.3 1.7 6.3 4.4 8.5.2 1.9-.5 3.7-1.8 5.2 2.8 0 5.1-.9 6.9-2.4 1.7.5 3.6.7 5.5.7 8.3 0 15-5.3 15-12S24.3 3 16 3z" />
        <text x="16" y="18.6" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10.5" fontWeight="700">Zalo</text>
      </svg>
    );
  }
  return <svg className="br-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" d={PATHS[name]} /></svg>;
}
