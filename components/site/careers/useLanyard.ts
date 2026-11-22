'use client';
/*
 * Dây rút của thẻ đeo: kéo hướng nào dây giãn ra hướng đó (càng xa càng nặng tay), thả ra búng về như lò xo.
 * Ghi thẳng vào style: mỗi khung hình không phải vẽ lại React.
 */
import { useEffect, type RefObject } from 'react';

const STRETCH = 520;            // giãn tối đa chừng này, càng gần càng nặng tay
const SPRING = 150, DAMP = 7;   // độ cứng và độ tắt: nảy vài nhịp rồi yên

export function useLanyard(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const rig = ref.current;
    if (!rig) return;
    const strap = rig.querySelector<HTMLElement>('.td-live__strap')!;
    const hanger = rig.querySelector<HTMLElement>('.td-live__hanger')!;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const options = { signal: controller.signal };

    let x = 0, y = 0, vx = 0, vy = 0, turn = 0, vt = 0;
    let grip: { id: number; x: number; y: number; fromX: number; fromY: number } | null = null;
    let frame = 0, last = 0, length = 0;

    const draw = () => {
      const across = x, down = Math.max(12, length + y);
      strap.style.height = `${Math.hypot(across, down).toFixed(1)}px`;
      strap.style.transform = `rotate(${(-Math.atan2(across, down)).toFixed(4)}rad)`;
      hanger.style.transform = `translate(${x.toFixed(1)}px, ${(down - length).toFixed(1)}px) rotate(${turn.toFixed(4)}rad)`;
    };

    const step = (now: number) => {
      frame = 0;
      const elapsed = Math.min(.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const steps = Math.ceil(elapsed * 180);
      const dt = elapsed / steps;
      for (let i = 0; i < steps; i++) {
        if (!grip) {
          vx += (-x * SPRING - vx * DAMP) * dt;
          vy += (-y * SPRING - vy * DAMP) * dt;
          x += vx * dt;
          y += vy * dt;
          // dây đã co sát cuộn rút thì dội lại
          if (length + y < 24) { y = 24 - length; vy = Math.abs(vy) * .5; }
        }
        // thẻ nghiêng theo dây, trễ một nhịp nên lắc lư
        const lean = -Math.atan2(x, Math.max(60, length + y)) * .7;
        vt += ((lean - turn) * 120 - vt * 8) * dt;
        turn += vt * dt;
      }
      const calm = !grip && Math.abs(x) + Math.abs(y) < .3 && Math.abs(vx) + Math.abs(vy) < 4 && Math.abs(turn) < .002 && Math.abs(vt) < .02;
      if (calm) {
        x = y = vx = vy = turn = vt = last = 0;
        strap.style.height = strap.style.transform = hanger.style.transform = '';
        rig.classList.remove('is-pulled');
        return;
      }
      draw();
      frame = requestAnimationFrame(step);
    };
    const wake = () => { if (!frame) { last = 0; frame = requestAnimationFrame(step); } };

    rig.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();               // đừng bôi đen chữ hay kéo ảnh logo
      length = hanger.offsetTop;
      grip = { id: event.pointerId, x: event.clientX, y: event.clientY, fromX: x, fromY: y };
      vx = vy = 0;
      rig.setPointerCapture(event.pointerId);
      rig.classList.add('is-held', 'is-pulled');
      wake();
    }, options);

    rig.addEventListener('pointermove', event => {
      if (!grip || event.pointerId !== grip.id) return;
      const dx = grip.fromX + event.clientX - grip.x, dy = grip.fromY + event.clientY - grip.y;
      const far = Math.hypot(dx, dy);
      const give = far ? STRETCH * (1 - Math.exp(-far / STRETCH)) / far : 1;
      x = dx * give;
      y = Math.max(24 - length, dy * give);
    }, options);

    const release = (event: PointerEvent) => {
      if (!grip || event.pointerId !== grip.id) return;
      grip = null;
      rig.classList.remove('is-held');
      if (still.matches) x = y = vx = vy = turn = vt = 0;   // giảm chuyển động: về chỗ ngay, không nảy
      wake();
    };
    rig.addEventListener('pointerup', release, options);
    rig.addEventListener('pointercancel', release, options);
    rig.addEventListener('lostpointercapture', release, options);

    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      strap.style.height = strap.style.transform = hanger.style.transform = '';
      rig.classList.remove('is-held', 'is-pulled');
    };
  }, [ref]);
}
