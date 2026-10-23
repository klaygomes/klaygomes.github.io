import { oklch } from './color.mjs';
import { curdPath, frillyPath, round, seededRandom, spikyPath } from './geometry.mjs';
import { INK } from '../assets/js/cast/face.js';

export const FRAME = { x: -40, y: -40, size: 480 };

function grainFilter(id, seed, toColor) {
  return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="${seed}" result="noise"/>
<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.4 0 0 0 0" result="noiseAlpha"/>
<feComposite in="SourceGraphic" in2="noiseAlpha" operator="arithmetic" k1="0" k2="1.5" k3="0.9" k4="-0.95" result="dither"/>
<feComponentTransfer in="dither" result="mask"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
<feFlood flood-color="${toColor}"/>
<feComposite in2="mask" operator="in"/>
</filter>`;
}

function grainy(id, path, [from, to, glow], angle, seed) {
  const radians = (angle * Math.PI) / 180;
  const x2 = round(50 + Math.cos(radians) * 50);
  const y2 = round(50 + Math.sin(radians) * 50);
  return `<defs><linearGradient id="${id}-ramp" x1="${round(100 - x2)}%" y1="${round(100 - y2)}%" x2="${x2}%" y2="${y2}%">
<stop offset="0.25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
<radialGradient id="${id}-glow" cx="30%" cy="25%" r="45%">
<stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
${grainFilter(`${id}-to`, seed, to)}
${grainFilter(`${id}-hi`, seed + 7, glow)}</defs>
<path d="${path}" fill="${from}"/>
<path d="${path}" fill="url(#${id}-ramp)" filter="url(#${id}-to)"/>
<path d="${path}" fill="url(#${id}-glow)" filter="url(#${id}-hi)"/>`;
}

const stroke = (width, color = INK) => `fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;

const metal = oklch(0.86, 0.03, 300);
const metalDark = oklch(0.66, 0.05, 300);

export const props = {
  chip: (x, y) => {
    const pins = [-30, -10, 10, 30].flatMap((offset) => [
      `<rect x="${x + offset - 5}" y="${y - 62}" width="10" height="18" rx="3" fill="${metal}"/>`,
      `<rect x="${x + offset - 5}" y="${y + 44}" width="10" height="18" rx="3" fill="${metal}"/>`,
      `<rect x="${x - 62}" y="${y + offset - 5}" width="18" height="10" rx="3" fill="${metal}"/>`,
      `<rect x="${x + 44}" y="${y + offset - 5}" width="18" height="10" rx="3" fill="${metal}"/>`,
    ]).join('');
    return `${pins}<rect x="${x - 48}" y="${y - 48}" width="96" height="96" rx="14" fill="${INK}"/><rect x="${x - 16}" y="${y - 16}" width="32" height="32" rx="5" fill="${oklch(0.36, 0.1, 305)}"/><circle cx="${x - 30}" cy="${y - 30}" r="6" fill="${oklch(0.9, 0.17, 95)}"/>`;
  },
  atom: (x, y) => {
    const color = oklch(0.8, 0.13, 215);
    const orbits = [0, 60, 120].map((angle) => `<ellipse cx="${x}" cy="${y}" rx="64" ry="23" transform="rotate(${angle} ${x} ${y})" ${stroke(9, color)}/>`).join('');
    return `${orbits}<circle cx="${x}" cy="${y}" r="13" fill="${color}"/>`;
  },
  hardhat: (x, y) => {
    const shell = oklch(0.87, 0.18, 95);
    const brim = oklch(0.76, 0.17, 70);
    return `<path d="M${x - 78} ${y} Q${x - 74} ${y - 86} ${x} ${y - 88} Q${x + 74} ${y - 86} ${x + 78} ${y} Z" fill="${shell}"/><rect x="${x - 102}" y="${y - 8}" width="204" height="22" rx="11" fill="${brim}"/><rect x="${x - 11}" y="${y - 86}" width="22" height="80" rx="9" fill="${brim}"/>`;
  },
  wrench: (x, y) => `<g transform="rotate(-30 ${x} ${y})"><rect x="${x - 12}" y="${y - 10}" width="24" height="120" rx="12" fill="${metal}"/><path d="M${x - 34} ${y - 40} a36 36 0 1 0 68 0 l-16 0 l0 22 l-36 0 l0 -22 Z" fill="${metal}"/><rect x="${x - 6}" y="${y + 30}" width="12" height="60" rx="6" fill="${metalDark}" opacity="0.45"/></g>`,
};

const LEAF = 'M200 384 C128 384 46 330 40 214 C70 226 84 214 104 236 C124 230 146 250 168 262 C190 274 210 296 214 322 C214 344 208 364 200 384Z';
const LEAF_VEIN = 'M196 372 C170 330 120 280 70 236';

function leaves(c, { scale = 1, spread = 1 } = {}) {
  const leaf = (side) => {
    const mirror = side === 'right' ? 'translate(400 0) scale(-1 1) ' : '';
    return `<g transform="${mirror}translate(200 384) scale(${scale * spread} ${scale}) translate(-200 -384)">${grainy(`leaf-${side}`, LEAF, c.leaf, 300, c.seed + (side === 'right' ? 4 : 3))}<path d="${LEAF_VEIN}" ${stroke(6, c.leaf[2])} opacity="0.55"/></g>`;
  };
  return [
    { name: 'leaf-left', z: 4, svg: leaf('left'), pivot: [200, 384] },
    { name: 'leaf-right', z: 4, svg: leaf('right'), pivot: [200, 384] },
  ];
}

function stem(color, [x, y, width, height]) {
  return { name: 'stem', z: 0, svg: `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="${color}"/>`, pivot: [x + width / 2, y + height] };
}

const bodies = {
  cauliflower(c) {
    const head = curdPath({ center: [200, 178], radius: 138, bumps: 9, depth: 0.17, stretch: [1.04, 0.9] });
    const florets = [[128, 112, 34], [206, 84, 40], [280, 124, 32]].map(([x, y, r]) => `<path d="M${x - r} ${y + 6} Q${x} ${y - r * 0.9} ${x + r} ${y + 6}" ${stroke(7, c.head[1])} opacity="0.45"/>`).join('');
    return {
      parts: [
        stem(c.leaf[1], [179, 352, 42, 40]),
        { name: 'head', z: 2, svg: grainy('head', head, c.head, c.angle ?? 120, c.seed) + florets, pivot: [200, 300] },
        ...leaves(c),
      ],
      face: { x: 200, y: 160, gap: 38, cheekGap: 18 },
    };
  },
  romanesco(c) {
    const center = [200, 186];
    const random = seededRandom(c.seed);
    const cones = Array.from({ length: 22 }, (_, i) => {
      const angle = i * 2.39996 + 0.4;
      const distance = 96 + 18 * random();
      const x = center[0] + Math.cos(angle) * distance * 0.82;
      const y = center[1] + Math.sin(angle) * distance * 0.95;
      const size = 15 + 9 * random();
      const point = (angle * 180) / Math.PI + 90;
      return `<path transform="translate(${round(x)} ${round(y)}) rotate(${round(point)})" d="M0 ${-size} C${size * 0.7} ${-size * 0.2} ${size * 0.75} ${size * 0.6} 0 ${size * 0.72} C${-size * 0.75} ${size * 0.6} ${-size * 0.7} ${-size * 0.2} 0 ${-size}Z" fill="${i % 2 ? c.head[1] : c.head[2]}" opacity="${i % 2 ? 0.55 : 0.7}"/>`;
    }).join('');
    const head = spikyPath({ center, radius: 134, bumps: 14, depth: 0.11, taper: 0.32 });
    return {
      parts: [
        stem(c.leaf[1], [181, 352, 38, 38]),
        { name: 'head', z: 2, svg: grainy('head', head, c.head, c.angle ?? 120, c.seed) + cones, pivot: [200, 320] },
        ...leaves(c, { scale: 0.78, spread: 1.1 }),
      ],
      face: { x: 200, y: 196, gap: 38, cheekGap: 18 },
    };
  },
  broccoli(c) {
    const stalk = 'M146 214 C152 282 144 336 126 386 Q200 404 274 386 C256 336 248 282 254 214 Z';
    const head = curdPath({ center: [200, 132], radius: 124, bumps: 7, depth: 0.26, stretch: [1.12, 0.86] });
    const random = seededRandom(c.seed + 1);
    const buds = Array.from({ length: 16 }, () => {
      const angle = random() * Math.PI * 2;
      const distance = 30 + random() * 70;
      return `<circle cx="${round(200 + Math.cos(angle) * distance * 1.1)}" cy="${round(128 + Math.sin(angle) * distance * 0.7)}" r="${round(8 + random() * 9)}" fill="${c.head[1]}" opacity="0.35"/>`;
    }).join('');
    return {
      parts: [
        { name: 'stem', z: 0, svg: grainy('stalk', stalk, c.stalk, 90, c.seed + 5), pivot: [200, 392] },
        { name: 'head', z: 2, svg: grainy('head', head, c.head, c.angle ?? 120, c.seed) + buds, pivot: [200, 230] },
      ],
      face: { x: 200, y: 290, gap: 30, cheekGap: 12 },
    };
  },
  kale(c) {
    const leaf = frillyPath({ center: [200, 196], width: 268, height: 330, frills: 23, seed: c.seed });
    const vein = c.head[2];
    const veins = [[316, 1], [276, 1], [112, 0.62], [84, 0.42]].flatMap(([y, length]) => [-1, 1].map((side) => `<path d="M200 ${y} Q${200 + side * 50 * length} ${y - 10} ${200 + side * 96 * length} ${y - 44}" ${stroke(6, vein)} opacity="0.5"/>`)).join('');
    return {
      parts: [
        { name: 'stem', z: 0, svg: `<path d="M200 352 L200 394" ${stroke(26, c.stalk[1])}/>`, pivot: [200, 394] },
        { name: 'head', z: 2, svg: grainy('head', leaf, c.head, c.angle ?? 120, c.seed) + veins + `<path d="M200 382 L200 66" ${stroke(11, vein)} opacity="0.6"/>`, pivot: [200, 370] },
      ],
      face: { x: 200, y: 186, gap: 38, cheekGap: 18 },
    };
  },
};

export function characterParts(c) {
  const { parts, face } = bodies[c.kind](c);
  const limbColor = c.leaf?.[0] ?? c.stalk?.[0] ?? c.head[0];
  for (const arm of c.arms ?? []) {
    const [start, mid, end] = arm.points;
    parts.push({ name: 'arm', z: -1, svg: `<path d="M${start.join(' ')} Q${mid.join(' ')} ${end.join(' ')}" ${stroke(22, limbColor)}/>`, pivot: start });
    if (arm.hold) parts.push({ name: 'prop', z: 6, svg: props[arm.hold.name](arm.hold.x, arm.hold.y), pivot: start });
  }
  for (const item of c.wear ?? []) parts.push({ name: 'hat', z: 7, svg: props[item.name](item.x, item.y), pivot: [item.x, item.y + 10] });
  return {
    parts: parts.sort((a, b) => a.z - b.z),
    face: { ...face, ...c.face, eyes: c.eyes, mouth: c.mouth, glasses: Boolean(c.glasses), z: 5 },
  };
}

export function partDocument(svg, [x, y, width, height]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}">${svg}</svg>`;
}
