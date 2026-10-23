import { oklch } from './color.mjs';

const leafGreen = [oklch(0.72, 0.17, 133), oklch(0.5, 0.13, 133), oklch(0.9, 0.12, 125)];
const yellow = '#fad30b';
const pink = oklch(0.8, 0.11, 340);
const white = '#fdfdfd';

export const characters = {
  couveflor: {
    id: 'couveflor',
    kind: 'cauliflower',
    head: [oklch(0.96, 0.045, 92), oklch(0.85, 0.09, 72), oklch(0.995, 0.02, 95)],
    leaf: leafGreen,
    seed: 13,
    angle: 40,
    eyes: 'sleepy',
    mouth: 'cat',
  },
  romanesco: {
    id: 'romanesco',
    kind: 'romanesco',
    head: [oklch(0.86, 0.19, 124), oklch(0.84, 0.17, 95), oklch(0.96, 0.1, 112)],
    leaf: [oklch(0.66, 0.16, 138), oklch(0.46, 0.12, 140), oklch(0.86, 0.12, 128)],
    seed: 29,
    angle: 60,
    eyes: 'dots',
    mouth: 'smile',
    arms: [{ points: [[290, 236], [372, 236], [352, 176]], hold: { name: 'chip', x: 350, y: 120 } }],
  },
  roxa: {
    id: 'roxa',
    kind: 'cauliflower',
    head: [oklch(0.6, 0.2, 309), oklch(0.66, 0.2, 355), oklch(0.84, 0.1, 318)],
    leaf: leafGreen,
    seed: 37,
    angle: 30,
    eyes: 'happy',
    mouth: 'open',
    arms: [{ points: [[110, 222], [34, 214], [56, 160]], hold: { name: 'atom', x: 58, y: 104 } }],
  },
  brocolis: {
    id: 'brocolis',
    kind: 'broccoli',
    head: [oklch(0.66, 0.17, 145), oklch(0.6, 0.12, 185), oklch(0.86, 0.13, 135)],
    stalk: [oklch(0.88, 0.11, 125), oklch(0.74, 0.14, 140), oklch(0.96, 0.06, 112)],
    seed: 47,
    angle: 110,
    eyes: 'happy',
    mouth: 'grin',
    arms: [{ points: [[252, 318], [330, 320], [352, 268]], hold: { name: 'wrench', x: 362, y: 232 } }],
    wear: [{ name: 'hardhat', x: 200, y: 64 }],
  },
  couve: {
    id: 'couve',
    kind: 'kale',
    head: [oklch(0.64, 0.14, 172), oklch(0.56, 0.13, 236), oklch(0.88, 0.08, 165)],
    stalk: [oklch(0.8, 0.1, 160), oklch(0.52, 0.1, 170), oklch(0.92, 0.05, 150)],
    seed: 53,
    angle: 120,
    eyes: 'dots',
    mouth: 'smile',
    glasses: true,
  },
};

export const cast = Object.values(characters);

const place = (character, x, y, size, rotate = 0, extra = {}) => ({ kind: 'character', character, x, y, size, rotate, ...extra });

const hero = {
  id: 'hero',
  width: 1000,
  height: 1000,
  items: [
    { kind: 'sparkle', x: 130, y: 150, scale: 0.9, color: yellow },
    { kind: 'sparkle', x: 900, y: 96, scale: 0.55, color: white },
    { kind: 'ball', x: 104, y: 610, scale: 0.75, color: yellow },
    { kind: 'squiggle', x: 560, y: 560, rotate: -64, color: pink },
    { kind: 'tray', x: 330, y: 958, width: 470, color: yellow },
    place('couve', 330, 747, 300, -2, { bar: 330, role: 'frame' }),
    place('brocolis', 338, 466, 290, 3, { bar: 300, role: 'frame' }),
    place('roxa', 322, 164, 270, -4, { bar: 280, role: 'frame' }),
    place('romanesco', 640, 210, 230, 28, { bar: 210, role: 'overflow' }),
  ],
};

const CLOSING = { width: 1600, height: 560 };

export function closingWave(x) {
  return 472 + 26 * Math.sin((2 * Math.PI * x) / 920 + 0.6) + 12 * Math.sin((2 * Math.PI * x) / 410 + 2.1);
}

function slopeDegrees(x) {
  const step = 4;
  return (Math.atan2(closingWave(x + step) - closingWave(x - step), 2 * step) * 180) / Math.PI;
}

const rider = (character, x, size) => place(character, x, Math.round(closingWave(x) - size * 0.17), size, Math.round(slopeDegrees(x)), { role: 'rider' });

const closing = {
  id: 'closing',
  ...CLOSING,
  wave: closingWave,
  items: [
    { kind: 'sparkle', x: 660, y: 90, color: yellow },
    { kind: 'squiggle', x: 1190, y: 110, rotate: -20, color: pink },
    rider('couve', 280, 330),
    rider('romanesco', 540, 320),
    rider('couveflor', 800, 390),
    rider('roxa', 1060, 330),
    rider('brocolis', 1320, 340),
    { kind: 'ball', x: 1505, y: 200, scale: 0.9, color: yellow },
  ],
};

export const topics = {
  'low-level': { lead: 'romanesco', friends: ['couveflor', 'brocolis'] },
  frontend: { lead: 'roxa', friends: ['couveflor', 'romanesco'] },
  tooling: { lead: 'brocolis', friends: ['couve', 'roxa'] },
  dotnet: { lead: 'couve', friends: ['brocolis', 'couveflor'] },
};

const personaScene = (slug, { lead, friends: [left, right] }) => ({
  id: `persona-${slug}`,
  width: 1000,
  height: 760,
  items: [
    { kind: 'sparkle', x: 140, y: 110, scale: 0.8, color: yellow },
    { kind: 'squiggle', x: 870, y: 130, rotate: -25, scale: 0.8, color: pink },
    place(left, 190, 520, 330, -8, { role: 'friend' }),
    place(right, 820, 540, 300, 8, { role: 'friend' }),
    place(lead, 500, 380, 560, 0, { role: 'lead' }),
  ],
});

export const scenes = [hero, closing, ...Object.entries(topics).map(([slug, topic]) => personaScene(slug, topic))];
