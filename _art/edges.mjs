import { round } from './geometry.mjs';

function bumps(lengths, along, bulge) {
  let at = 0;
  return lengths.map((length) => {
    const from = along(at);
    at += length;
    const to = along(at);
    const [c1, c2] = bulge(from, to, length);
    return `C${c1.map(round).join(' ')} ${c2.map(round).join(' ')} ${to.map(round).join(' ')}`;
  }).join(' ');
}

const svg = (viewBox, d) => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}' preserveAspectRatio='none'><path d='${d}'/></svg>`;

export function curdEdge() {
  const base = 44;
  const top = bumps([44, 30, 52, 36, 48, 30], (x) => [x, base], ([x1, y], [x2], w) => [[x1, y - w * 0.58], [x2, y - w * 0.58]]);
  return `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='64' viewBox='0 0 240 64'><path d='M0 64 L0 ${base} ${top} L240 64Z'/></svg>`;
}

export function curdMaskSide() {
  const left = bumps([13, 9, 15, 11, 14, 10, 16, 12], (y) => [9 + 2 * Math.sin(y / 9), y], ([x1, y1], [x2, y2], h) => [[x1 - h * 0.62, y1], [x2 - h * 0.62, y2]]);
  return svg('0 0 100 100', `M100 0 L${round(9)} 0 ${left} L100 100Z`);
}

export function curdMaskBand() {
  const top = bumps([17, 12, 20, 14, 19, 18], (x) => [x, 5 + Math.sin(x / 11)], ([x1, y1], [x2, y2], w) => [[x1, y1 - w * 0.3], [x2, y2 - w * 0.3]]);
  const bottom = bumps([15, 21, 13, 19, 16, 16], (x) => [100 - x, 95 - Math.sin(x / 13)], ([x1, y1], [x2, y2], w) => [[x1, y1 + w * 0.3], [x2, y2 + w * 0.3]]);
  return svg('0 0 100 100', `M0 ${round(5)} ${top} L100 ${round(95 - Math.sin(0))} ${bottom}Z`);
}

export function wavePath(wave, width, height, step = 20) {
  const points = [];
  for (let x = 0; x <= width; x += step) points.push(`${x} ${round(wave(x))}`);
  return `M${points.join('L')}L${width} ${height}L0 ${height}Z`;
}
