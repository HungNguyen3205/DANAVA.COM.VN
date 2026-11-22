/*
 * Bảng mã QR Zalo của sa bàn 3D: khung gỗ, nền navy, logo, và mã QR "mọc" thành chữ D của DANAVA.
 *
 * Vì sao vẫn quét được: chữ D KHÔNG đè lên dữ liệu mà chỉ đổi màu. Trong thân chữ, ô sáng là xanh/cam nhạt,
 * ô tối là xanh/cam đậm nên độ chênh sáng tối vẫn đủ cho máy quét. Chỉ lòng chữ D được làm thoáng (chấm nhỏ),
 * phần thiếu do mức sửa lỗi H bù. Ba ô định vị và các ô chức năng luôn nguyên vẹn.
 * Đổi màu, cỡ chấm hay vị trí chữ D thì phải quét thử lại bằng bộ giải mã (ở cỡ nhỏ và khi ảnh mờ).
 */
import qrcode from 'qrcode-generator';

type Ink = 'navy' | 'blue' | 'orange';
/** Một ô tối nổi lên; tọa độ theo đơn vị bảng (BOARD = cạnh bảng). */
export type Stud = { x: number; y: number; size: number; ink: Ink; d: number };

export const BOARD = 1000;
const PANEL = { x: 190, y: 182, size: 620 };
const QUIET = 3;
/** Khung chứa biểu tượng D, tính theo tỉ lệ cạnh mã. */
const MARK = { x: .165, y: .13, size: .75 };

export const INKS: Record<Ink, { base: string; hi: string }> = {
  navy: { base: '#13244f', hi: '#2c4278' },
  blue: { base: '#08226f', hi: '#17398f' },
  orange: { base: '#962d00', hi: '#b13c06' }
};
const TINT = { blue: [112, 164, 240], orange: [255, 160, 70] };

export function qrLayout(url: string, mark: CanvasImageSource) {
  // Tối thiểu bản 5 (37 ô): đủ mịn để vẽ chữ D. Địa chỉ dài hơn thì tự lên bản cao hơn
  let code = qrcode(0, 'H');
  code.addData(url); code.make();
  if (code.getModuleCount() < 37) { code = qrcode(5, 'H'); code.addData(url); code.make(); }
  const n = code.getModuleCount();
  const cell = PANEL.size / (n + QUIET * 2);
  const origin = { x: PANEL.x + QUIET * cell, y: PANEL.y + QUIET * cell };

  // Lấy đúng hình và màu của biểu tượng thật
  const res = 512;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = res;
  const c = canvas.getContext('2d', { willReadFrequently: true })!;
  c.drawImage(mark, 0, 0, res, res);
  const pixels = c.getImageData(0, 0, res, res);
  const at = (u: number, v: number) => (Math.min(res - 1, Math.floor(v * res)) * res + Math.min(res - 1, Math.floor(u * res))) * 4;

  const studs: Stud[] = [];
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      if (!code.isDark(r, col)) continue;
      if ((r < 7 && (col < 7 || col >= n - 7)) || (r >= n - 7 && col < 7)) continue; // ô định vị vẽ riêng
      const u = ((col + .5) / n - MARK.x) / MARK.size, v = ((r + .5) / n - MARK.y) / MARK.size;
      let ink: Ink = 'navy', size = .9;
      if (u >= 0 && u < 1 && v >= 0 && v < 1) {
        const i = at(u, v), d = pixels.data;
        if (d[i + 3] > 128) { ink = d[i] > d[i + 2] ? 'orange' : 'blue'; size = .95; }
        else if (inHole(u, v)) size = .5;
      }
      // Hàng định thời và ô căn chỉnh giữ cỡ đủ
      const functional = r === 6 || col === 6 || (Math.abs(r - (n - 7)) <= 2 && Math.abs(col - (n - 7)) <= 2);
      studs.push({ x: origin.x + (col + .5) * cell, y: origin.y + (r + .5) * cell, size: (functional ? .98 : size) * cell, ink, d: Math.hypot(r - (n - 1) / 2, col - (n - 1) / 2) / (n / 2) });
    }
  }

  // Thân chữ D nhạt màu, vẫn giữ chút chuyển sắc và nếp gấp của logo gốc
  const d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const orange = d[i] > d[i + 2];
    const light = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11 - (orange ? 135 : 100)) * .22;
    const tint = orange ? TINT.orange : TINT.blue;
    for (let k = 0; k < 3; k++) d[i + k] = tint[k] + light;
  }
  c.putImageData(pixels, 0, 0);

  return { n, cell, origin, studs, body: canvas };
}
export type QrLayout = ReturnType<typeof qrLayout>;

/** Khoảng trắng giữa chữ D (tọa độ 0–1 trong biểu tượng). */
function inHole(u: number, v: number) {
  return u > .3 && u < .77 && v > .31 && v < .73;
}

function round(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.roundRect(x, y, w, h, r);
}

/** Mọi thứ trừ các ô dữ liệu nổi. ctx là canvas vuông, cạnh `size` điểm ảnh. */
export function drawBoard(c: CanvasRenderingContext2D, size: number, layout: QrLayout, logo: CanvasImageSource, mark: CanvasImageSource, font: string) {
  const { n, cell, origin, body } = layout;
  c.save();
  c.scale(size / BOARD, size / BOARD);

  // khung gỗ
  const wood = c.createLinearGradient(0, 0, BOARD, BOARD);
  ([[0, '#e6bd8b'], [.3, '#c99460'], [.55, '#d9ab76'], [.8, '#b98350'], [1, '#d3a26c']] as const).forEach(([at, color]) => wood.addColorStop(at, color));
  round(c, 0, 0, BOARD, BOARD, 70); c.fillStyle = wood; c.fill();
  c.save(); c.clip();
  c.strokeStyle = 'rgba(92, 52, 22, .16)'; c.lineWidth = 1.2;
  for (let i = -20; i < 90; i++) {
    c.beginPath();
    for (let y = 0; y <= BOARD; y += 25) c.lineTo(i * 13 + Math.sin(y * .011 + i) * 5 + y * .03, y);
    c.stroke();
  }
  c.restore();
  round(c, 1.5, 1.5, BOARD - 3, BOARD - 3, 69); c.strokeStyle = 'rgba(255, 240, 215, .6)'; c.lineWidth = 3; c.stroke();

  // mặt bảng navy + chữ D chìm
  const navy = c.createLinearGradient(0, 26, BOARD, BOARD);
  navy.addColorStop(0, '#1d3466'); navy.addColorStop(.55, '#13244f'); navy.addColorStop(1, '#0d1938');
  round(c, 26, 26, BOARD - 52, BOARD - 52, 50); c.fillStyle = navy; c.fill();
  c.save(); c.clip();
  c.globalAlpha = .07; c.drawImage(mark, 40, 70, 1040, 1040);
  c.restore();
  round(c, 27.5, 27.5, BOARD - 55, BOARD - 55, 49); c.strokeStyle = 'rgba(0, 0, 0, .35)'; c.lineWidth = 3; c.stroke();

  const logoW = 400, logoH = logoW * 135 / 554;
  c.drawImage(logo, (BOARD - logoW) / 2, 58, logoW, logoH);

  // thẻ trắng + quầng cam
  c.save();
  c.shadowColor = 'rgba(255, 170, 70, .55)'; c.shadowBlur = 46 * size / BOARD;
  round(c, PANEL.x, PANEL.y, PANEL.size, PANEL.size, 44); c.fillStyle = '#fff'; c.fill();
  c.restore();

  const span = n * cell;
  c.drawImage(body, origin.x + MARK.x * span, origin.y + MARK.y * span, MARK.size * span, MARK.size * span);

  // ba ô định vị: nền trắng để thân chữ D không lẫn vào
  for (const [col, row, color] of [[0, 0, '#13244f'], [n - 7, 0, '#13244f'], [0, n - 7, '#b03a04']] as const) {
    const x = origin.x + col * cell, y = origin.y + row * cell;
    round(c, x - cell, y - cell, cell * 9, cell * 9, cell * 1.6); c.fillStyle = '#fff'; c.fill();
    c.beginPath(); c.roundRect(x, y, cell * 7, cell * 7, cell * 1.5); c.roundRect(x + cell, y + cell, cell * 5, cell * 5, cell * .8);
    c.fillStyle = color; c.fill('evenodd');
    round(c, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell * .7); c.fill();
  }

  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#fff'; c.font = `700 38px ${font}`;
  c.fillText('Quét Zalo · Tư vấn 1:1 cùng DANAVA', BOARD / 2, 858);
  c.fillStyle = '#aebbd8'; c.font = `500 27px ${font}`;
  c.fillText('danava.vn · Đà Nẵng', BOARD / 2, 913);
  c.restore();
}

/** Mặt một ô nổi: đỉnh hơi sáng, viền dưới sậm. */
export function drawStud(c: CanvasRenderingContext2D, size: number, ink: Ink) {
  const { base, hi } = INKS[ink], radius = size * (ink === 'navy' ? .4 : .34);
  c.clearRect(0, 0, size, size);
  const face = c.createLinearGradient(0, 0, size * .4, size);
  face.addColorStop(0, hi); face.addColorStop(.6, base); face.addColorStop(1, base);
  round(c, 0, 0, size, size, radius); c.fillStyle = face; c.fill();
  c.save(); c.clip();
  round(c, size * .03, size * .03, size * .94, size * .94, radius);
  c.strokeStyle = 'rgba(0, 0, 0, .3)'; c.lineWidth = size * .07; c.stroke();
  c.beginPath(); c.ellipse(size * .38, size * .25, size * .17, size * .07, -.35, 0, Math.PI * 2);
  c.fillStyle = 'rgba(255, 255, 255, .22)'; c.fill();
  c.restore();
}
