'use client';
/*
 * Nối bé Mây (nút nổi ANNA) với trang. Luật của DANAVA: bé KHÔNG tự đi lung tung.
 * - đứng yên ở góc dưới phải; khách kéo nhẹ đi đâu thì nằm yên ở đó (nhớ trong phiên duyệt web);
 * - khách ném mạnh: nảy tưng tưng khắp màn hình rồi bay về góc dưới phải;
 * - chỉ tự bay một việc: khối "Hỏi ANNA" hiện ra thì bay nhanh vào chỗ đậu, lướt qua khối thì về chỗ cũ;
 * - chuột chỉ để ngó: mắt nhìn theo con trỏ, người không đi theo;
 * - chạm không kéo là mở ANNA.
 * Giảm chuyển động hoặc màn cảm ứng: không bay vào khối (khối có bé đứng sẵn), vẫn kéo được.
 * Đứng yên thì không vẽ lại khung hình nào.
 */
import { useEffect, useRef, type RefObject } from 'react';
import { usePathname } from 'next/navigation';

type Point = { x: number; y: number };

const SPOT_KEY = 'danava-may-spot';
const ENTER_WAIT = 120;        // lướt vút qua khối thì khỏi bay vào
const SPRING = 70;             // vào chỗ trong khoảng nửa giây, không vọt quá
// Thế nào là ném: có một nhịp vẩy đủ nhanh. Không đòi nhanh đúng lúc nhả tay,
// vì tay hay chậm lại ở cuối, touchpad nhả trễ, máy bận thì chỉ gửi vài điểm chuột.
const FLICK_MS = 450;          // cử chỉ ngắn hơn chừng này: lấy nhịp nhanh nhất cả cử chỉ
const FLICK = 450;             // ...chỉ cần chừng này px/giây
const SWING_MS = 260;          // kéo lâu hơn: chỉ xét nhịp vẩy cuối
const SWING = 750;             // ...và phải nhanh hơn, để kéo đổi chỗ không thành ném
const MOVING = 120;            // nhả tay khi vẫn còn đang lướt (trong chừng này ms) cũng là ném
const LATE = 380;              // dừng lâu hơn chừng này rồi mới nhả: là đặt xuống
const THROW_MIN = 1000;
const THROW_MAX = 2100;
const FALL = 2100;             // sức nặng lúc bị ném
const BOUNCY = .8;
const BOUNCE_TIME = 4.2;       // tưng tối đa chừng này giây rồi về góc

export function useMay(ref: RefObject<HTMLButtonElement | null>, active: boolean) {
  const path = usePathname();
  const may = useRef<ReturnType<typeof run> | null>(null);
  useEffect(() => { may.current?.check(); }, [path]);
  useEffect(() => {
    const button = ref.current;
    if (!button || !active) return;
    const desktop = window.matchMedia('(min-width: 861px)');
    const travels = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const sync = () => {
      may.current?.stop();
      may.current = desktop.matches ? run(button, travels.matches) : null;
    };
    sync();
    desktop.addEventListener('change', sync);
    travels.addEventListener('change', sync);
    return () => {
      desktop.removeEventListener('change', sync);
      travels.removeEventListener('change', sync);
      may.current?.stop();
      may.current = null;
    };
  }, [ref, active]);
}

/** Vận tốc của cú vẩy, hoặc null nếu khách chỉ kéo đổi chỗ. */
function flick(trail: (Point & { t: number })[], since: number, released: number): Point | null {
  const end = trail[trail.length - 1];
  if (!end || trail.length < 2 || released - end.t > LATE) return null;
  const short = end.t - since < FLICK_MS;
  let best: Point | null = null, fastest = short ? FLICK : SWING;
  for (let i = 1; i < trail.length; i++) {
    const b = trail[i];
    if (!short && end.t - b.t > SWING_MS) continue;
    const letGo = i === trail.length - 1 && released - end.t < MOVING;
    let j = i - 1;
    while (j > 0 && b.t - trail[j - 1].t <= 70) j--;       // đo trên nhịp ~70 ms cho đỡ giật
    const a = trail[j], seconds = Math.max(40, b.t - a.t) / 1000;
    const v = { x: (b.x - a.x) / seconds, y: (b.y - a.y) / seconds };
    const speed = Math.hypot(v.x, v.y);
    if (speed > fastest || (letGo && !best && speed > FLICK)) { fastest = speed; best = v; }
  }
  return best;
}

function run(button: HTMLButtonElement, travels: boolean) {
  const pose = button.querySelector<HTMLElement>('.an-launch__pose')!;
  const face = button.querySelector<SVGGElement>('.may__face')!;
  const armL = button.querySelector<SVGGElement>('.may__arm--l')!;
  const armR = button.querySelector<SVGGElement>('.may__arm--r')!;
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true } as const;

  let size = 62, height = 66, vw = 0, vh = 0;
  let corner: Point = { x: 0, y: 0 };
  let spot: Point | null = null;               // chỗ khách đã kéo tới, theo tỉ lệ màn hình
  let x = 0, y = 0, scale = 1, vx = 0, vy = 0, vs = 0;
  let perched = false, docked = false, declined = false;
  let pointer: Point | null = null, look: Point | null = null, gaze: Point = { x: 0, y: 0 };
  let press: { id: number; from: Point; grip: Point; dragged: boolean; since: number; trail: (Point & { t: number })[] } | null = null;
  let thrown = -1;                             // đã tưng được mấy giây; -1 là không bị ném
  let squash = 0, spin = 0, roll = 0;
  const canBounce = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let swallowClick = false;
  let frame = 0, last = 0, enterTimer = 0;

  try {
    const saved = JSON.parse(sessionStorage.getItem(SPOT_KEY) || 'null');
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) spot = { x: saved.x, y: saved.y };
  } catch { /* trình duyệt chặn bộ nhớ: dùng góc mặc định */ }

  const ceiling = () => {
    const header = document.querySelector('.s-header')?.getBoundingClientRect();
    return header && header.top < 10 ? Math.max(0, header.bottom) : 0;
  };
  const onScreen = (p: Point): Point => ({
    x: Math.min(vw - size / 2 - 6, Math.max(size / 2 + 6, p.x)),
    y: Math.min(vh - height / 2 - 10, Math.max(ceiling() + height / 2 + 4, p.y))
  });
  const home = () => (spot ? onScreen({ x: spot.x * vw, y: spot.y * vh }) : corner);

  function measure() {
    size = button.offsetWidth || 62;
    height = button.offsetHeight || 66;
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    // offset* không tính transform → luôn là góc dưới phải
    corner = { x: button.offsetLeft + size / 2, y: button.offsetTop + height / 2 };
  }

  function perch() {
    const r = document.querySelector('.an-home__perch')?.getBoundingClientRect();
    if (!r || r.height < 60) return null;
    const at = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const top = ceiling();
    return {
      at,
      scale: Math.min(2, (r.height - 16) / height),
      whole: r.top >= top - 4 && r.bottom <= vh + 4,
      gone: at.y < top + 20 || at.y > vh - 20
    };
  }

  function check() {
    const p = travels ? perch() : null;
    if (!p || p.gone) {
      window.clearTimeout(enterTimer);
      enterTimer = 0;
      declined = false;
      if (perched) {
        perched = docked = false;
        wake();
      }
      return;
    }
    if (perched) return wake();
    if (!p.whole || declined || press || enterTimer) return;
    enterTimer = window.setTimeout(() => {
      enterTimer = 0;
      const now = perch();
      if (!now?.whole || declined || press) return;
      perched = true;
      wake();
    }, ENTER_WAIT);
  }

  function step(now: number) {
    frame = 0;
    const elapsed = Math.min(.25, last ? (now - last) / 1000 : 1 / 60);   // máy tụt khung hình vẫn bay đúng giờ
    last = now;

    const held = !!press?.dragged;
    const nest = perched ? perch() : null;
    const goal = nest?.at ?? home();
    const goalScale = nest?.scale ?? 1;
    if (held) {
      vx = vy = vs = 0;
      scale = 1;
    } else if (thrown >= 0) {
      tumble(elapsed);
    } else if (!travels || docked) {
      // đã đậu: dính theo khối, không trễ theo tay cuộn
      x = goal.x; y = goal.y; scale = goalScale; vx = vy = vs = 0;
    } else {
      const steps = Math.ceil(elapsed * 120), dt = elapsed / steps, damp = 2 * Math.sqrt(SPRING);
      for (let i = 0; i < steps; i++) {
        vx += ((goal.x - x) * SPRING - vx * damp) * dt;
        vy += ((goal.y - y) * SPRING - vy * damp) * dt;
        vs += ((goalScale - scale) * SPRING - vs * damp) * dt;
        x += vx * dt; y += vy * dt; scale += vs * dt;
      }
    }
    const tossed = thrown >= 0;
    const gap = held || tossed ? 0 : Math.hypot(goal.x - x, goal.y - y);
    const settled = !held && !tossed && gap < 1 && Math.hypot(vx, vy) < 12 && Math.abs(goalScale - scale) < .006;
    if (settled) {
      x = goal.x; y = goal.y; scale = goalScale; vx = vy = vs = 0;
      docked = perched;
    }

    const eye = look ?? pointer;
    const gx = eye ? Math.max(-1, Math.min(1, (eye.x - x) / 260)) * 24 : 0;
    const gy = eye ? Math.max(-1, Math.min(1, (eye.y - y) / 260)) * 18 : 0;
    gaze = { x: gaze.x + (gx - gaze.x) * .16, y: gaze.y + (gy - gaze.y) * .16 };
    const looking = Math.abs(gx - gaze.x) + Math.abs(gy - gaze.y) > .25;

    const flying = !held && gap > 6;
    const flap = held || tossed || flying ? Math.sin(now * .018) * 10 + 8 : 0;
    const lean = settled ? 0 : tossed ? roll : Math.max(-14, Math.min(14, vx / 90));
    squash = settled || held ? 0 : squash * Math.exp(-9 * elapsed);

    button.style.transform = `translate3d(${(x - corner.x).toFixed(1)}px, ${(y - corner.y).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    button.style.setProperty('--unscale', (1 / scale).toFixed(3));
    pose.style.transform = `rotate(${lean.toFixed(1)}deg) scale(${(1 + squash * .24).toFixed(3)}, ${(1 - squash * .24).toFixed(3)})`;
    face.setAttribute('transform', `translate(${gaze.x.toFixed(1)} ${gaze.y.toFixed(1)})`);
    armL.setAttribute('transform', `rotate(${(-flap).toFixed(1)} 70 202)`);
    armR.setAttribute('transform', `rotate(${flap.toFixed(1)} 330 202)`);
    button.classList.toggle('is-flying', flying && gap > 60);      // gần tới chỗ là nắm được ngay
    button.classList.toggle('is-held', held);
    button.classList.toggle('is-thrown', tossed);
    button.classList.toggle('is-rest', settled);
    button.classList.toggle('tip-right', x < vw / 2);

    if (held || !settled || looking) frame = requestAnimationFrame(step);
    else last = 0;
  }
  /** Bị ném: rơi, đập bốn mép, bẹp xuống rồi bật lên; hết đà thì về góc. */
  function tumble(elapsed: number) {
    const steps = Math.ceil(elapsed * 120), dt = elapsed / steps;
    const left = size / 2 + 4, right = vw - size / 2 - 4, top = ceiling() + height / 2 + 2, floor = vh - height / 2 - 4;
    const hit = (speed: number) => {
      squash = Math.max(squash, Math.min(1, Math.abs(speed) / 1100));
      spin = vx * .22;
    };
    for (let i = 0; i < steps; i++) {
      thrown += dt;
      vy += FALL * dt;
      vx *= Math.exp(-.12 * dt);
      x += vx * dt; y += vy * dt;
      if (x < left) { x = left; hit(vx); vx = Math.abs(vx) * BOUNCY; }
      if (x > right) { x = right; hit(vx); vx = -Math.abs(vx) * BOUNCY; }
      if (y < top) { y = top; hit(vy); vy = Math.abs(vy) * BOUNCY; }
      if (y > floor) { y = floor; hit(vy); vy = -Math.abs(vy) * BOUNCY; vx *= .94; }
      spin += (-roll * 14 - spin * 2) * dt;
      roll = Math.max(-40, Math.min(40, roll + spin * dt));
      const spent = y > floor - 3 && Math.abs(vy) < 230;
      if (thrown > BOUNCE_TIME || spent) {
        thrown = -1;                           // về góc dưới phải
        vx *= .2; vy *= .2;
        return;
      }
    }
  }

  function wake() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(step);
  }

  /* ---------- khách làm gì ---------- */
  window.addEventListener('pointermove', event => {
    const now = { x: event.clientX, y: event.clientY };
    if (press && event.pointerId === press.id) {
      if (!press.dragged && Math.hypot(now.x - press.from.x, now.y - press.from.y) > 7) {
        press.dragged = true;
        if (perched) declined = true;          // khách kéo ra khỏi khối: đừng hút về lại
        perched = docked = false;
      }
      if (press.dragged) {
        ({ x, y } = onScreen({ x: now.x - press.grip.x, y: now.y - press.grip.y }));
        const t = event.timeStamp;             // giờ của thao tác, không phải giờ trình duyệt rảnh để xử lý
        press.trail = [...press.trail.filter(p => t - p.t < 900), { ...now, t }];
      }
    } else if (event.pointerType !== 'mouse') {
      return;
    }
    pointer = now;
    look = null;
    wake();
  }, options);

  document.addEventListener('focusin', event => {
    const el = event.target as HTMLElement;
    if (!el.matches('input, textarea')) return;
    const r = el.getBoundingClientRect();
    look = { x: r.left + r.width * .25, y: r.top + r.height / 2 };   // ngó xem khách gõ gì
    wake();
  }, options);
  document.addEventListener('focusout', () => { look = null; }, options);

  button.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const from = { x: event.clientX, y: event.clientY };
    press = { id: event.pointerId, from, grip: { x: from.x - x, y: from.y - y }, dragged: false, trail: [{ ...from, t: event.timeStamp }], since: event.timeStamp };
    if (thrown >= 0) { thrown = -1; vx = vy = 0; }   // bắt được giữa chừng
    swallowClick = false;
    button.setPointerCapture(event.pointerId);
  }, options);

  const release = (event: PointerEvent) => {
    if (!press || event.pointerId !== press.id) return;
    const { dragged, trail, since } = press;
    press = null;
    if (!dragged) return;
    swallowClick = true;                       // kéo xong không phải là bấm mở ANNA
    window.setTimeout(() => { swallowClick = false; }, 0);
    const push = flick(trail, since, event.timeStamp);
    const toss = canBounce && event.type !== 'pointercancel' && !!push;
    if (toss && push) {
      const speed = Math.hypot(push.x, push.y);
      const power = Math.min(THROW_MAX, Math.max(THROW_MIN, speed)) / speed;
      vx = push.x * power; vy = push.y * power;
      if (Math.abs(vy) < 500) vy -= 700;       // ném ngang cũng phải tưng lên
      thrown = 0; roll = 0; spin = vx * .15;
      declined = true;                         // ném xong là về góc, không chui vào khối
      spot = null;
    } else {
      spot = { x: x / vw, y: y / vh };         // thả đâu nằm yên đó
    }
    try {
      if (spot) sessionStorage.setItem(SPOT_KEY, JSON.stringify(spot));
      else sessionStorage.removeItem(SPOT_KEY);
    } catch { /* chỉ là không nhớ được */ }
    wake();
  };
  button.addEventListener('pointerup', release, options);
  button.addEventListener('pointercancel', release, options);
  button.addEventListener('lostpointercapture', release, options);
  button.addEventListener('click', event => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, { signal: controller.signal, capture: true });

  window.addEventListener('scroll', check, options);
  window.addEventListener('resize', () => {
    measure();
    if (!perched) ({ x, y } = home());
    check();
    wake();
  }, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; } else wake();
  }, options);
  // ảnh tải xong hoặc đổi trang làm khối xê dịch mà không có sự kiện cuộn
  const layout = new ResizeObserver(check);
  layout.observe(document.body);

  measure();
  ({ x, y } = home());
  button.classList.add('is-live');
  wake();
  check();

  return {
    check,
    stop() {
      controller.abort();
      layout.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(enterTimer);
      button.classList.remove('is-live', 'is-flying', 'is-held', 'is-thrown', 'is-rest', 'tip-right');
      button.style.transform = '';
      button.style.removeProperty('--unscale');
      pose.style.transform = '';
      [face, armL, armR].forEach(el => el.removeAttribute('transform'));
    }
  };
}
