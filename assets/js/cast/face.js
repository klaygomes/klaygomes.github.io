export const INK = '#25063c';
export const CHEEK = '#f183a7';

const stroke = (width, color = INK) => `fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;

const eye = {
  sleepy: (cx, y) => `<path d="M${cx - 13} ${y - 3} Q${cx} ${y + 11} ${cx + 13} ${y - 3}" ${stroke(7)}/>`,
  happy: (cx, y) => `<path d="M${cx - 13} ${y + 4} Q${cx} ${y - 12} ${cx + 13} ${y + 4}" ${stroke(7)}/>`,
  dots: (cx, y) => `<circle cx="${cx}" cy="${y}" r="9" fill="${INK}"/><circle cx="${cx + 3}" cy="${y - 3}" r="2.6" fill="#fff"/>`,
  worried: (cx, y, side) => `<circle cx="${cx}" cy="${y + 2}" r="8.5" fill="${INK}"/><circle cx="${cx + 2.5}" cy="${y - 0.5}" r="2.4" fill="#fff"/><path d="M${cx - 14 * side} ${y - 15} L${cx + 10 * side} ${y - 24}" ${stroke(6)}/>`,
  squint: (cx, y, side) => `<path d="M${cx - 11 * side} ${y - 10} L${cx + 11 * side} ${y} L${cx - 11 * side} ${y + 10}" ${stroke(7)}/>`,
};

export const mouths = {
  cat: (x, y) => `<path d="M${x - 22} ${y - 2} Q${x - 11} ${y + 16} ${x} ${y} Q${x + 11} ${y + 16} ${x + 22} ${y - 2}" ${stroke(6.5)}/>`,
  smile: (x, y) => `<path d="M${x - 18} ${y} Q${x} ${y + 18} ${x + 18} ${y}" ${stroke(7)}/>`,
  open: (x, y) => `<path d="M${x - 20} ${y - 4} Q${x} ${y + 34} ${x + 20} ${y - 4} Z" fill="${INK}"/><path d="M${x - 10} ${y + 12} Q${x} ${y + 6} ${x + 10} ${y + 12} Q${x} ${y + 22} ${x - 10} ${y + 12}Z" fill="${CHEEK}"/>`,
  grin: (x, y) => `<path d="M${x - 24} ${y - 2} Q${x} ${y + 26} ${x + 24} ${y - 2} Z" fill="${INK}"/>`,
  wavy: (x, y) => `<path d="M${x - 22} ${y + 4} q5.5 -9 11 0 t11 0 t11 0 t11 0" ${stroke(6)}/>`,
  oh: (x, y) => `<ellipse cx="${x}" cy="${y + 6}" rx="9" ry="12" fill="${INK}"/>`,
};

function glasses(x, y, gap) {
  const lens = (cx) => `<rect x="${cx - 31}" y="${y - 24}" width="62" height="48" rx="13" fill="#fff" fill-opacity="0.22" stroke="${INK}" stroke-width="8"/><path d="M${cx - 18} ${y - 12} l12 -6" ${stroke(5, '#fff')} opacity="0.85"/>`;
  return `${lens(x - gap - 4)}${lens(x + gap + 4)}<path d="M${x - gap + 27} ${y - 4} Q${x} ${y - 16} ${x + gap - 27} ${y - 4}" ${stroke(8)}/>`;
}

export function mouthAt(face, type) {
  return mouths[type](face.x, face.y + 34);
}

export function eyesMarkup(face, type = face.eyes) {
  return [[face.x - face.gap, 1], [face.x + face.gap, -1]].map(([cx, side]) => `<g class="face__eye">${eye[type](cx, face.y, side)}</g>`).join('');
}

export function faceMarkup(face) {
  const { x, y, gap, cheekGap } = face;
  const cheeks = [x - gap - cheekGap, x + gap + cheekGap].map((cx) => `<ellipse cx="${cx}" cy="${y + 26}" rx="14" ry="8.5" fill="${CHEEK}" opacity="0.8"/>`).join('');
  return `<g class="face__cheeks">${cheeks}</g><g class="face__eyes">${eyesMarkup(face)}</g><g class="face__mouth">${mouthAt(face, face.mouth)}</g>${face.glasses ? `<g class="face__glasses">${glasses(x, y, gap)}</g>` : ''}`;
}
