import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { faceMarkup } from '../assets/js/cast/face.js';
import { cast, scenes } from './cast.mjs';
import { curdEdge, curdMaskBand, curdMaskSide, wavePath } from './edges.mjs';
import { presets, spring } from '../assets/js/spring.js';
import { round } from './geometry.mjs';
import { FRAME, characterParts, partDocument } from './parts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'assets', 'img', 'art');
const dataDir = join(root, '_data');
const scratch = mkdtempSync(join(tmpdir(), 'ecf-art-'));

const PIXELS_PER_UNIT = [0.75, 1.5, 2.5];
const FLAT_WIDTHS = [80, 160];
const PROBE_SCALE = 0.5;
const PADDING = 6;
const BAR = 34;

function alphaBox(pngPath) {
  const png = readFileSync(pngPath);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const chunks = [];
  for (let at = 8; at < png.length;) {
    const length = png.readUInt32BE(at);
    if (png.toString('ascii', at + 4, at + 8) === 'IDAT') chunks.push(png.subarray(at + 8, at + 8 + length));
    at += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x];
      const left = x >= 4 ? pixels[y * stride + x - 4] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const corner = x >= 4 && y > 0 ? pixels[(y - 1) * stride + x - 4] : 0;
      const paeth = () => {
        const p = left + up - corner;
        const [a, b, c] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - corner)];
        return a <= b && a <= c ? left : b <= c ? up : corner;
      };
      const predictor = [0, left, up, (left + up) >> 1, filter === 4 ? paeth() : 0][filter];
      pixels[y * stride + x] = (value + predictor) & 0xff;
    }
  }
  let [minX, minY, maxX, maxY] = [width, height, -1, -1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[y * stride + x * 4 + 3] < 6) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return [minX, minY, maxX + 1, maxY + 1];
}

function encode(svg, name, width) {
  const svgPath = join(scratch, `${name}.svg`);
  const pngPath = join(scratch, `${name}-${width}.png`);
  writeFileSync(svgPath, svg);
  execFileSync('rsvg-convert', ['-w', String(width), '-o', pngPath, svgPath]);
  execFileSync('cwebp', ['-quiet', '-q', '82', '-alpha_q', '90', pngPath, '-o', join(outputDir, `${name}-${width}.webp`)]);
  execFileSync('avifenc', ['-q', '60', pngPath, join(outputDir, `${name}-${width}.avif`)], { stdio: 'ignore' });
}

function trimmedBox(svg, name) {
  const probe = join(scratch, `${name}-probe.png`);
  writeFileSync(join(scratch, `${name}-probe.svg`), partDocument(svg, [FRAME.x, FRAME.y, FRAME.size, FRAME.size]));
  execFileSync('rsvg-convert', ['-w', String(FRAME.size * PROBE_SCALE), '-o', probe, join(scratch, `${name}-probe.svg`)]);
  const [x1, y1, x2, y2] = alphaBox(probe).map((value) => value / PROBE_SCALE);
  const left = Math.max(FRAME.x, FRAME.x + x1 - PADDING);
  const top = Math.max(FRAME.y, FRAME.y + y1 - PADDING);
  const right = Math.min(FRAME.x + FRAME.size, FRAME.x + x2 + PADDING);
  const bottom = Math.min(FRAME.y + FRAME.size, FRAME.y + y2 + PADDING);
  return [left, top, right - left, bottom - top].map(Math.round);
}

const share = (value, total) => Math.round((value / total) * 1000) / 10;

function buildCharacter(c) {
  const { parts, face } = characterParts(c);
  const manifestParts = parts.map((part, index) => {
    const name = `${c.id}-${part.name}${parts.filter((p) => p.name === part.name).length > 1 ? `-${index}` : ''}`;
    const box = trimmedBox(part.svg, name);
    const widths = PIXELS_PER_UNIT.map((k) => Math.round(box[2] * k));
    for (const width of widths) encode(partDocument(part.svg, box), name, width);
    return {
      name: part.name,
      file: name,
      widths,
      left: share(box[0] - FRAME.x, FRAME.size),
      top: share(box[1] - FRAME.y, FRAME.size),
      width: share(box[2], FRAME.size),
      height: share(box[3], FRAME.size),
      ratio: Math.round((box[2] / box[3]) * 1000) / 1000,
      origin: [share(part.pivot[0] - box[0], box[2]), share(part.pivot[1] - box[1], box[3])],
      pivot: [share(part.pivot[0] - FRAME.x, FRAME.size), share(part.pivot[1] - FRAME.y, FRAME.size)],
      z: part.z,
    };
  });
  const faceSvg = faceMarkup(face);
  const flat = [...parts.filter((p) => p.z < face.z).map((p) => p.svg), faceSvg, ...parts.filter((p) => p.z >= face.z).map((p) => p.svg)].join('');
  for (const width of FLAT_WIDTHS) encode(partDocument(flat, [FRAME.x, FRAME.y, FRAME.size, FRAME.size]), `${c.id}-flat`, width);
  return {
    kind: c.kind,
    parts: manifestParts,
    face: {
      svg: faceSvg,
      z: face.z,
      spec: { x: face.x, y: face.y, gap: face.gap, cheekGap: face.cheekGap, eyes: face.eyes, mouth: face.mouth },
      eyes: [share(face.x - FRAME.x, FRAME.size), share(face.y - FRAME.y, FRAME.size)],
    },
    flat: { file: `${c.id}-flat`, widths: FLAT_WIDTHS },
  };
}

const sparkle = (color) => `<path d="M0 -34 Q6 -6 34 0 Q6 6 0 34 Q-6 6 -34 0 Q-6 -6 0 -34Z" fill="${color}"/>`;
const decorations = {
  sparkle: ({ color }) => [80, 80, sparkle(color)],
  ball: ({ color }) => [72, 72, `<circle r="30" fill="${color}"/><circle cx="-10" cy="-11" r="8" fill="#fff" opacity="0.7"/>`],
  squiggle: ({ color }) => [150, 60, `<path d="M-60 0 q15 -30 30 0 t30 0 t30 0 t30 0" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"/>`],
  tray: ({ color, width }) => [width + 40, 150, `<path d="M${-width / 2} -110 V0 H${width / 2} V-110" fill="none" stroke="${color}" stroke-width="38" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 55)"/>`],
};

function buildScene(scene) {
  const items = scene.items.map((item, order) => {
    if (item.kind === 'character') {
      const frame = (item.size * FRAME.size) / 400;
      return {
        type: 'character',
        character: item.character,
        role: item.role,
        order,
        left: share(item.x - frame / 2, scene.width),
        top: share(item.y - frame / 2, scene.height),
        width: share(frame, scene.width),
        rotate: item.rotate ?? 0,
        depth: round(item.size / 600),
        land: item.land ? { x: share(item.land.x - item.x, frame), y: share(item.land.y - item.y, frame), rotate: item.land.rotate ?? 0 } : null,
        bar: item.bar ? { width: share(item.bar, frame), top: Math.round((((410 + 40) / 480) * 100 - share(BAR, frame) / 2) * 10) / 10, ratio: Math.round((item.bar / BAR) * 100) / 100, left: share((frame - item.bar) / 2, frame) } : null,
      };
    }
    const [width, height, markup] = decorations[item.kind](item);
    const scale = item.scale ?? 1;
    return {
      type: 'deco',
      kind: item.kind,
      order,
      left: share(item.x - (width * scale) / 2, scene.width),
      top: share(item.y - (height * scale) / 2, scene.height),
      width: share(width * scale, scene.width),
      svg: `<svg viewBox="${-width / 2} ${-height / 2} ${width} ${height}" aria-hidden="true"><g transform="rotate(${item.rotate ?? 0})">${markup}</g></svg>`,
    };
  });
  return {
    width: scene.width,
    height: scene.height,
    wave: scene.wave ? wavePath(scene.wave, scene.width, scene.height) : null,
    items,
  };
}

const dataUri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}")`;

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const castManifest = Object.fromEntries(cast.map((c) => [c.id, buildCharacter(c)]));
const sceneManifest = Object.fromEntries(scenes.map((scene) => [scene.id, buildScene(scene)]));

writeFileSync(join(dataDir, 'cast.json'), `${JSON.stringify(castManifest, null, 2)}\n`);
writeFileSync(join(dataDir, 'scenes.json'), `${JSON.stringify(sceneManifest, null, 2)}\n`);
writeFileSync(join(root, 'assets', 'css', 'art.css'), `/* Generated by _art/build.mjs */
:root {
  --curd-edge: ${dataUri(curdEdge())};
  --curd-mask-side: ${dataUri(curdMaskSide())};
  --curd-mask-band: ${dataUri(curdMaskBand())};
${Object.keys(presets).map((name) => { const { easing, duration } = spring(name); return `  --spring-${name}: ${easing};\n  --spring-${name}-duration: ${duration}ms;`; }).join('\n')}
}
`);

rmSync(scratch, { recursive: true, force: true });
