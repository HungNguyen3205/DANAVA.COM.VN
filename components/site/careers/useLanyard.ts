'use client';
/*
 * Dây đeo mềm của thẻ: một sợi dây vật lý nhiều đốt, không phải một thanh thẳng.
 * - vào trang: cả cuộn lẫn dây được thả từ trên xuống, dây chùng và uốn, căng ra, giãn, rồi đung đưa chậm dần;
 * - kéo hướng nào dây theo hướng đó (càng xa càng nặng tay); dí lên thì dây võng xuống; thả ra thì búng về;
 * - chữ DANAVA SOLUTIONS in liền dọc dây, tính từ đầu kẹp: dây dài thêm thì lặp thêm.
 * Ghi thẳng vào style, đứng yên thì không vẽ lại khung hình nào.
 */
import { useEffect, type RefObject } from 'react';

const GRAVITY = 2600;
const TENSION = 95;                  // độ dai của dây khi đã căng
const AIR_SPEED = 1150;              // rơi nhanh nhất chừng này, có sức cản không khí
const STRETCH = 520;                 // giãn tối đa chừng này, càng gần càng nặng tay
const LINKS = 18;                    // số đốt: đủ mịn để dây cong
const WIDTH = 46, PRINT = 94;        // bề ngang dây, chiều dài một nhịp in
const ARM = 190;                     // từ kẹp tới trọng tâm thẻ

type Knot = { x: number; y: number; px: number; py: number };

/** Một nhịp in trên dây: viền xanh + cam, biểu tượng D, DANAVA SOLUTIONS. */
function drawPrint(mark: HTMLImageElement | null, font: string) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * 3; canvas.height = PRINT * 3;
  const c = canvas.getContext('2d');
  if (!c) return '';
  c.scale(3, 3);
  const band = (color: string, x: number, w: number) => { c.fillStyle = color; c.fillRect(x, 0, w, PRINT); };
  band('#2f6fce', 0, WIDTH);
  band('#f26b1d', 3, WIDTH - 6);
  band('#0a2b6b', 5, WIDTH - 10);
  if (mark) c.drawImage(mark, 13, 5, 20, 20);
  // chữ chạy dọc theo dây
  const write = (text: string, x: number, size: number, weight: number, color: string) => {
    c.save();
    c.translate(x, 59); c.rotate(Math.PI / 2);
    c.font = `${weight} ${size}px ${font}`; c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, 0, 0, 62);
    c.restore();
  };
  write('DANAVA', 28.5, 12, 800, '#f26b1d');
  write('SOLUTIONS', 16, 8, 700, '#f4f7fb');
  return canvas.toDataURL();
}

export function useLanyard(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const rig = ref.current;
    if (!rig) return;
    const strap = rig.querySelector<HTMLElement>('.td-live__strap')!;
    const reel = rig.querySelector<HTMLElement>('.td-live__reel')!;
    const hanger = rig.querySelector<HTMLElement>('.td-live__hanger')!;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const options = { signal: controller.signal };
    let gone = false;

    const links = Array.from({ length: LINKS }, () => {
      const el = document.createElement('i');
      el.className = 'td-live__link';
      strap.appendChild(el);
      return el;
    });
    strap.classList.add('is-rope');

    let rest = hanger.offsetTop;                  // chiều dài dây lúc treo yên
    let anchor = 0, anchorV = 0;                  // đầu trên (cuộn rút), chỉ chạy lúc thả xuống
    let x = 0, y = rest, vx = 0, vy = 0;          // đầu dưới (móc thẻ), gốc tọa độ là cuộn rút
    let turn = 0, spin = 0;                       // thẻ lắc quanh móc
    let knots: Knot[] = [];
    let grip: { id: number; x: number; y: number; fromX: number; fromY: number; toX: number; toY: number } | null = null;
    let frame = 0, last = 0, loose = 0, dropping = false;

    // dây chưa giãn: khi treo thẻ đứng yên thì vừa đúng bằng `rest`
    const slack = () => Math.max(20, rest - GRAVITY / TENSION);

    const straighten = (bow = 0) => {
      knots = Array.from({ length: LINKS + 1 }, (_, i) => {
        const f = i / LINKS;
        const kx = x * f + Math.sin(f * Math.PI * 2) * bow, ky = anchor + (y - anchor) * f;
        return { x: kx, y: ky, px: kx, py: ky };
      });
    };

    function physics(dt: number) {
      if (dropping) {
        anchorV = Math.min(AIR_SPEED, anchorV + GRAVITY * dt);
        anchor += anchorV * dt;
        if (anchor >= 0) { anchor = anchorV = 0; dropping = false; loose = 0; }
      }

      const oldVx = vx, oldVy = vy;
      if (grip) {
        // tay cầm: thẻ bám theo tay, trễ một chút xíu cho mềm
        const follow = 1 - Math.exp(-38 * dt);
        const nx = x + (grip.toX - x) * follow, ny = y + (grip.toY - y) * follow;
        vx = (nx - x) / dt; vy = (ny - y) / dt;
        x = nx; y = ny;
      } else {
        loose += dt;
        const dy = y - anchor, d = Math.max(1, Math.hypot(x, dy));
        const ux = x / d, uy = dy / d;
        let fx = 0, fy = GRAVITY;
        if (d > slack()) {
          const along = vx * ux + vy * uy;
          const pull = Math.max(0, TENSION * (d - slack()) + 5 * along);
          fx -= ux * pull; fy -= uy * pull;
        }
        // lúc đầu đung đưa thoải mái, vài giây sau lắng dần
        const air = dropping ? 0 : .8 + Math.max(0, Math.min(3, loose - 2.5)) * 1.2;
        vx += (fx - vx * air) * dt;
        vy += (fy - vy * air) * dt;
        if (dropping) vy = Math.min(AIR_SPEED, vy);
        x += vx * dt; y += vy * dt;
      }

      // thẻ là con lắc treo ở móc: móc giật thì thẻ trễ lại rồi lắc theo
      const limit = (v: number) => Math.max(-7000, Math.min(7000, v));
      const ax = limit((vx - oldVx) / dt), ay = limit((vy - oldVy) / dt);
      const weight = Math.max(500, GRAVITY - ay);
      spin += ((-weight * Math.sin(turn) + ax * Math.cos(turn) * .45) / ARM - spin * (grip ? 3 : 1.5 + Math.min(2, loose * .3))) * dt;
      turn += spin * dt;
      if (Math.abs(turn) > .85) { turn = Math.sign(turn) * .85; spin *= -.2; }

      // các đốt ở giữa: quán tính + trọng lượng, rồi giữ độ dài từng đốt → dây cong và võng
      // dây căng thì sức căng át trọng lượng của chính nó; để trọng lượng lại là đốt cuối bị dồn thành gợn
      const sag = dropping || Math.hypot(x, y - anchor) <= slack() ? GRAVITY * dt * dt : 0;
      for (let i = 1; i < LINKS; i++) {
        const k = knots[i], kx = k.x, ky = k.y;
        k.x += (k.x - k.px) * .996;
        k.y += (k.y - k.py) * .996 + sag;
        k.px = kx; k.py = ky;
      }
      const top = knots[0], end = knots[LINKS];
      top.x = 0; top.y = anchor;
      end.x = x; end.y = y;
      const each = Math.max(slack(), Math.hypot(x, y - anchor)) / LINKS;
      for (let n = 0; n < 14; n++) {
        for (let i = 0; i < LINKS; i++) {
          const a = knots[i], b = knots[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.max(.001, Math.hypot(dx, dy));
          const fixedA = i === 0, fixedB = i + 1 === LINKS;
          const off = (d - each) / d / (fixedA || fixedB ? 1 : 2);
          if (!fixedA) { a.x += dx * off; a.y += dy * off; }
          if (!fixedB) { b.x -= dx * off; b.y -= dy * off; }
        }
      }
    }

    /** Dây đã căng và thẻ lắng dần: các gợn nhỏ giữa dây tan về đường thẳng (không để dây rung mãi). */
    function iron(dt: number) {
      if (grip || dropping || loose < 2) return;
      const pull = Math.min(1, dt * Math.min(9, (loose - 2) * 3));
      for (let i = 1; i < LINKS; i++) {
        const k = knots[i], f = i / LINKS;
        const dx = (x * f - k.x) * pull, dy = (anchor + (y - anchor) * f - k.y) * pull;
        k.x += dx; k.y += dy; k.px += dx; k.py += dy;
      }
    }

    function draw() {
      const lengths = links.map((_, i) => Math.hypot(knots[i + 1].x - knots[i].x, knots[i + 1].y - knots[i].y));
      const total = lengths.reduce((sum, n) => sum + n, 0);
      let along = 0;
      links.forEach((el, i) => {
        const a = knots[i], b = knots[i + 1];
        const angle = -Math.atan2(b.x - a.x, b.y - a.y);
        // mỗi đốt gối lên nhau một chút để chỗ cong không hở
        const lap = i ? 4 : 0;
        el.style.height = `${(lengths[i] + lap + (i + 1 < LINKS ? 4 : 0)).toFixed(1)}px`;
        el.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) rotate(${angle.toFixed(4)}rad) translateY(${-lap}px)`;
        el.style.backgroundPositionY = `${((total - along + lap) % PRINT).toFixed(1)}px`;
        along += lengths[i];
      });
      strap.dataset.len = total.toFixed(1);
      reel.style.transform = anchor ? `translateY(${anchor.toFixed(1)}px)` : '';
      hanger.style.transform = `translate(${x.toFixed(1)}px, ${(y - rest).toFixed(1)}px) rotate(${turn.toFixed(4)}rad)`;
    }

    function hang() {
      anchor = anchorV = x = vx = vy = turn = spin = 0;
      y = rest;
      dropping = false;
      straighten();
      draw();
      hanger.style.transform = '';
      rig!.classList.remove('is-pulled');
    }

    function step(now: number) {
      frame = 0;
      const elapsed = Math.min(.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const steps = Math.ceil(elapsed * 240);
      for (let i = 0; i < steps; i++) { physics(elapsed / steps); iron(elapsed / steps); }
      const calm = !grip && !dropping
        && Math.abs(x) < .7 && Math.abs(y - rest) < .7 && Math.hypot(vx, vy) < 6
        && Math.abs(turn) < .006 && Math.abs(spin) < .04
        && knots.every(k => Math.abs(k.x) < 1.5);
      if (calm) return hang();
      draw();
      frame = requestAnimationFrame(step);
    }
    const wake = () => { if (!frame) { last = 0; frame = requestAnimationFrame(step); } };

    hang();

    // in chữ lên dây khi đã có phông tiếng Việt và biểu tượng
    const font = getComputedStyle(rig).fontFamily;
    const mark = new Image();
    const loaded = new Promise<HTMLImageElement | null>(resolve => { mark.onload = () => resolve(mark); mark.onerror = () => resolve(null); });
    mark.src = '/assets/danava-mark.png';
    Promise.all([loaded, document.fonts.load(`800 12px ${font}`).catch(() => []), document.fonts.load(`700 8px ${font}`).catch(() => [])]).then(([image]) => {
      if (gone) return;
      const url = drawPrint(image, font);
      if (url) strap.style.setProperty('--print', `url("${url}")`);
    });

    // chỉ thẻ ở bìa: đợi lọt vào màn hình rồi thả từ ngoài mép trên xuống
    let entrance: IntersectionObserver | null = null;
    if (!still.matches && !rig.closest('.td-live--compact')) {
      rig.classList.add('is-waiting');
      entrance = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        entrance?.disconnect();
        rest = hanger.offsetTop;
        anchor = -(Math.max(0, rig.getBoundingClientRect().top) + rest + hanger.offsetHeight);
        anchorV = vy = 260;
        x = Math.min(85, rig.clientWidth * .3); y = anchor + rest * .3; vx = -60;
        turn = -.3; spin = 0;
        dropping = true; loose = 0;
        straighten(26);
        rig.classList.add('is-pulled', 'is-in');
        rig.classList.remove('is-waiting');
        draw();
        wake();
      }, { threshold: .3 });
      entrance.observe(rig);
    } else {
      rig.classList.add('is-in');
    }

    // đổi cỡ màn hình: dây có độ dài nghỉ khác
    const size = new ResizeObserver(() => {
      const next = hanger.offsetTop;
      if (next === rest) return;
      rest = next;
      if (frame || grip) wake(); else hang();
    });
    size.observe(strap);

    rig.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();                     // đừng bôi đen chữ hay kéo ảnh logo
      if (dropping) { dropping = false; anchor = anchorV = 0; }
      grip = { id: event.pointerId, x: event.clientX, y: event.clientY, fromX: x, fromY: y - rest, toX: x, toY: y };
      rig.setPointerCapture(event.pointerId);
      rig.classList.add('is-held', 'is-pulled');
      wake();
    }, options);

    rig.addEventListener('pointermove', event => {
      if (!grip || event.pointerId !== grip.id) return;
      const dx = grip.fromX + event.clientX - grip.x, dy = grip.fromY + event.clientY - grip.y;
      const far = Math.hypot(dx, dy);
      const give = far ? STRETCH * (1 - Math.exp(-far / STRETCH)) / far : 1;
      grip.toX = dx * give;
      grip.toY = Math.max(8, rest + dy * give);
    }, options);

    const release = (event: PointerEvent) => {
      if (!grip || event.pointerId !== grip.id) return;
      grip = null;
      rig.classList.remove('is-held');
      loose = 0;
      if (still.matches) {                        // giảm chuyển động: về chỗ ngay, không nảy
        cancelAnimationFrame(frame); frame = 0;
        return hang();
      }
      const speed = Math.hypot(vx, vy);
      if (speed > 1800) { vx *= 1800 / speed; vy *= 1800 / speed; }
      wake();
    };
    rig.addEventListener('pointerup', release, options);
    rig.addEventListener('pointercancel', release, options);
    rig.addEventListener('lostpointercapture', release, options);

    return () => {
      gone = true;
      controller.abort();
      entrance?.disconnect();
      size.disconnect();
      cancelAnimationFrame(frame);
      links.forEach(el => el.remove());
      strap.classList.remove('is-rope');
      strap.style.removeProperty('--print');
      reel.style.transform = hanger.style.transform = '';
      rig.classList.remove('is-held', 'is-pulled', 'is-waiting');
    };
  }, [ref]);
}
