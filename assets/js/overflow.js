import { isMotionAllowed } from './motion.js';
import { presets, progressAt, settleTime } from './spring.js';

const FPS = 60;
const FRAME = 33;

function sample(seconds, at) {
  const count = Math.max(2, Math.round(seconds * FPS));
  return Array.from({ length: count + 1 }, (_, i) => at((seconds * i) / count, i / count));
}

function springPhase(config, at) {
  return sample(settleTime(config), (t) => at(progressAt(t, config)));
}

const IMPACT = { stiffness: 700, damping: 30 };

export function playOverflow(frame, { delay = 33 * FRAME } = {}) {
  if (!frame || !isMotionAllowed()) return null;
  const style = getComputedStyle(frame);
  const rotate = parseFloat(style.getPropertyValue('--rotate')) || 0;
  const landX = parseFloat(style.getPropertyValue('--land-x')) || 0;
  const landY = parseFloat(style.getPropertyValue('--land-y')) || 0;
  const landTilt = parseFloat(style.getPropertyValue('--land-rotate')) || 0;
  const window = frame.closest('.hero-window') ?? document.documentElement;
  const drop = (window.clientHeight / frame.clientWidth) * 100 + 110;

  const pose = (x, y, angle, sx = 1, sy = 1) => `rotate(${-rotate}deg) translate(${x.toFixed(2)}%, ${y.toFixed(2)}%) rotate(${angle.toFixed(2)}deg) translate(0, ${((1 - sy) * 42).toFixed(2)}%) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;

  const fallTime = 0.4;
  const fall = sample(fallTime, (_, p) => pose(landX, landY - drop * (1 - p * p), landTilt - 8 * (1 - p)));

  const impact = springPhase(IMPACT, (p) => pose(landX, landY, landTilt, 1.12 - 0.12 * p, 0.84 + 0.16 * p));

  const nudgeTime = 0.14;
  const nudge = sample(nudgeTime, (_, p) => pose(landX, landY, landTilt + 12 * p * p, 1 + 0.03 * p, 1 - 0.04 * p));

  const flight = 0.72;
  const startAngle = landTilt + 12;
  const endAngle = rotate;
  const apex = 38;
  const gravity = (2 * (apex + Math.max(0, landY))) / ((flight / 2) ** 2);
  const lift = (0 - landY - 0.5 * gravity * flight * flight) / flight;
  const arc = sample(flight, (t, p) => {
    const x = landX * (1 - p);
    const y = landY + lift * t + 0.5 * gravity * t * t;
    const angle = startAngle + (endAngle + 14 - startAngle) * (1 - (1 - p) ** 2);
    return pose(x, y, angle, 1 - 0.04 * Math.sin(Math.PI * p), 1 + 0.05 * Math.sin(Math.PI * p));
  });

  const landing = springPhase(presets.bouncy, (p) => pose(0, 0, endAngle + 14 * (1 - p), 1.14 - 0.14 * p, 0.82 + 0.18 * p));

  const frames = [...fall, ...impact, ...nudge, ...arc, ...landing].map((transform) => ({ transform }));
  frames[frames.length - 1] = { transform: pose(0, 0, endAngle) };
  frame.classList.add('is-scripted');
  const animation = frame.animate(frames, { duration: ((frames.length - 1) / FPS) * 1000, delay, easing: 'linear', fill: 'backwards' });
  const cue = document.getAnimations().find((running) => running.animationName === 'frame-fall');
  if (cue?.startTime != null) animation.startTime = cue.startTime;
  const at = (seconds) => delay + seconds * 1000;
  const impactAt = at(fallTime);
  const knockAt = at((fall.length + impact.length + nudge.length - 2) / FPS);
  const landAt = at((fall.length + impact.length + nudge.length + arc.length - 3) / FPS);
  return { animation, impactAt, knockAt, landAt };
}
