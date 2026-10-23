export const presets = {
  gentle: { stiffness: 120, damping: 15 },
  bouncy: { stiffness: 210, damping: 13 },
  wobbly: { stiffness: 190, damping: 8 },
  snappy: { stiffness: 420, damping: 30 },
};

const SAMPLES = 48;
const REST = 0.0015;

export function progressAt(t, { stiffness, damping, mass = 1 }) {
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta >= 1) return 1 - Math.exp(-omega * t) * (1 + omega * t);
  const damped = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * t) * (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
}

export function settleTime(config) {
  const step = 1 / 120;
  let quiet = 0;
  for (let t = 0; t < 4; t += step) {
    quiet = Math.abs(1 - progressAt(t, config)) < REST ? quiet + step : 0;
    if (quiet > 0.08) return t - quiet;
  }
  return 4;
}

export function spring(name) {
  const config = presets[name] ?? name;
  const seconds = settleTime(config);
  const points = Array.from({ length: SAMPLES + 1 }, (_, i) => (i === SAMPLES ? 1 : Math.round(progressAt((seconds * i) / SAMPLES, config) * 1000) / 1000));
  return { easing: `linear(${points.join(', ')})`, duration: Math.round(seconds * 1000) };
}
