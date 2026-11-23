/*
 * Hình bé Mây, giữ nguyên đường nét và màu của gói "DANAVA May Embed 1.0.0" do DANAVA cung cấp.
 * Các nhóm có class để useMay điều khiển: mặt, mắt, hai tay, miệng, má.
 */
import { useId } from 'react';

const BODY = 'M200 34C119 30 66 79 59 157C55 195 56 235 62 274C70 342 103 375 151 382C176 386 185 376 200 376C216 376 225 386 249 382C299 375 332 338 339 273C345 226 346 184 336 142C321 72 274 34 200 34Z';

export function MayFigure({ className = '' }: { className?: string }) {
  // mỗi bé một bộ id riêng, nhiều bé trên một trang không dùng lẫn màu của nhau
  const id = `may${useId().replace(/\W/g, '')}`;
  const paint = (name: string) => `url(#${id}-${name})`;

  return (
    <svg className={`may ${className}`} viewBox="0 0 400 420" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-body`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(142 94) rotate(55) scale(350 319)">
          <stop stopColor="#d3f3ff" /><stop offset=".37" stopColor="#badeee" /><stop offset=".76" stopColor="#a8cbdc" /><stop offset="1" stopColor="#8eafc1" />
        </radialGradient>
        <radialGradient id={`${id}-light`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(146 58) rotate(80) scale(300 264)">
          <stop stopColor="#e8fbff" stopOpacity=".66" /><stop offset=".48" stopColor="#d0f1ff" stopOpacity=".07" /><stop offset="1" stopColor="#d2f2ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-arm`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(54 199) rotate(74) scale(110 80)">
          <stop stopColor="#c9ebfa" /><stop offset=".6" stopColor="#b4d7e7" /><stop offset="1" stopColor="#99b9cc" />
        </radialGradient>
        <radialGradient id={`${id}-eye`} cx="32%" cy="24%" r="85%">
          <stop stopColor="#45505e" /><stop offset=".5" stopColor="#2d3645" /><stop offset="1" stopColor="#1d2534" />
        </radialGradient>
        <linearGradient id={`${id}-shade`} x1="190" y1="240" x2="190" y2="386" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7da4bd" stopOpacity="0" /><stop offset="1" stopColor="#7da4bd" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id={`${id}-blush`}>
          <stop stopColor="#eaa8ae" stopOpacity=".5" /><stop offset="1" stopColor="#eaa8ae" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-rim`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <g transform="translate(200 210) scale(1.1 .95) translate(-200 -210)">
        <g className="may__arm may__arm--l">
          <path d="M72 188C50 183 27 209 25 242C23 262 32 275 46 269C64 261 73 237 78 217C82 201 82 192 72 188Z" fill={paint('arm')} />
        </g>
        <g className="may__arm may__arm--r">
          <path d="M328 188C350 183 373 209 375 242C377 262 368 275 354 269C336 261 327 237 322 217C318 201 318 192 328 188Z" fill={paint('arm')} />
        </g>
        <path d={BODY} fill={paint('body')} />
        <path d={BODY} fill={paint('light')} />
        <path d={BODY} fill={paint('shade')} />
        <path d="M81 113C103 58 148 34 202 36C255 36 297 58 318 100" stroke="#dcf8ff" strokeOpacity=".65" strokeWidth="5" strokeLinecap="round" filter={paint('rim')} />
        <g className="may__face">
          <g className="may__eyes">
            <ellipse cx="145" cy="170" rx="15" ry="23" fill={paint('eye')} />
            <ellipse cx="257" cy="172" rx="14" ry="22" fill={paint('eye')} />
            <ellipse cx="141" cy="161" rx="3.2" ry="6" fill="#a2b3c2" opacity=".4" />
            <ellipse cx="253" cy="163" rx="3" ry="5.7" fill="#a2b3c2" opacity=".4" />
          </g>
          <g className="may__cheeks">
            <ellipse cx="120" cy="213" rx="24" ry="14" fill={paint('blush')} />
            <ellipse cx="280" cy="213" rx="24" ry="14" fill={paint('blush')} />
          </g>
          <path className="may__smile" d="M187 223Q200 236 213 223" stroke="#475b6e" strokeWidth="5" strokeLinecap="round" />
          <ellipse className="may__wow" cx="200" cy="229" rx="7" ry="8.5" fill="#354355" />
        </g>
      </g>
    </svg>
  );
}
