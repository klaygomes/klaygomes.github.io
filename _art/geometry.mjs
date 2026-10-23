export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function round(value) {
  return Math.round(value * 10) / 10;
}

export function smoothClosedPath(points) {
  const n = points.length;
  const segments = points.map((point, i) => {
    const p0 = points[(i - 1 + n) % n];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = [point[0] + (p2[0] - p0[0]) / 6, point[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - point[0]) / 6, p2[1] - (p3[1] - point[1]) / 6];
    return `C${c1.map(round).join(' ')} ${c2.map(round).join(' ')} ${p2.map(round).join(' ')}`;
  });
  return `M${points[0].map(round).join(' ')} ${segments.join(' ')}Z`;
}

function ring(count, radiusAt, [cx, cy], stretch = [1, 1]) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const r = radiusAt(angle);
    return [cx + Math.cos(angle) * r * stretch[0], cy + Math.sin(angle) * r * stretch[1]];
  });
}

export function curdPath({ center, radius, bumps, depth, stretch }) {
  const radiusAt = (angle) => radius * (1 - depth / 2 + depth * Math.abs(Math.sin((angle * bumps) / 2)) ** 0.6);
  return smoothClosedPath(ring(bumps * 8, radiusAt, center, stretch));
}

export function spikyPath({ center, radius, bumps, depth, taper }) {
  const radiusAt = (angle) => radius * (1 - depth / 2 + depth * (1 - Math.abs(Math.sin((angle * bumps) / 2))) ** 2.5);
  const points = ring(bumps * 10, radiusAt, center, [1, 1.08]).map(([x, y]) => {
    const height = (y - (center[1] - radius)) / (radius * 2);
    return [center[0] + (x - center[0]) * (1 - taper + taper * Math.min(1, Math.max(0, height)) * 1.2), y];
  });
  return smoothClosedPath(points);
}

export function frillyPath({ center, width, height, frills, seed }) {
  const random = seededRandom(seed);
  const jitter = Array.from({ length: frills }, () => random());
  const points = ring(frills * 6, (angle) => 1 + 0.055 * Math.sin(angle * frills) + 0.025 * (jitter[Math.floor((angle / (Math.PI * 2)) * frills) % frills] - 0.5), [0, 0])
    .map(([x, y]) => [center[0] + (x * width) / 2, center[1] + (y * height) / 2 - Math.abs(x) * 14]);
  return smoothClosedPath(points);
}
