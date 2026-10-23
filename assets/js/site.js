import { isMotionAllowed, isReducedMotion, isUserDisabled, onMotionPreferenceChange, setUserDisabled } from './motion.js';
import './cast/kinds.js';
import { playOverflow } from './overflow.js';
import { springs } from './cast/character.js';

const FRAME = 33;

function announce(message) {
  const region = document.querySelector('.sr-status');
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

function wireMotionToggle() {
  const toggle = document.querySelector('.motion-toggle');
  if (!toggle) return;
  const label = toggle.querySelector('.motion-toggle__label');
  const render = () => {
    toggle.hidden = isReducedMotion();
    toggle.setAttribute('aria-pressed', String(isUserDisabled()));
    label.textContent = isUserDisabled() ? 'Play motion' : 'Pause motion';
  };
  toggle.addEventListener('click', () => {
    const disabled = !isUserDisabled();
    setUserDisabled(disabled);
    announce(disabled ? 'Motion paused.' : 'Motion playing.');
  });
  onMotionPreferenceChange(render);
  render();
}

function cheerInTurn(characters, gap = 7) {
  characters.forEach((character, index) => setTimeout(() => character.cheer?.(), index * gap * FRAME));
}

function popNearPageEnd() {
  const stage = document.querySelector('.stage--closing');
  const end = document.querySelector('.site-footer__legal');
  if (!stage || !end || !('IntersectionObserver' in window)) return;
  stage.classList.add('is-waiting');
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    stage.classList.replace('is-waiting', 'is-in');
    if (!isMotionAllowed()) return;
    const riders = [...stage.querySelectorAll('.character')].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    setTimeout(() => cheerInTurn(riders), 22 * FRAME);
  }, { threshold: 0.6 });
  observer.observe(end);
}

function greetWhenLanded() {
  document.querySelectorAll('[data-greet]').forEach((stage) => {
    const lead = stage.querySelector('[data-role="lead"] .character, [data-role="peek"] .character, .character[data-greet-self]');
    if (!lead) return;
    const greet = () => isMotionAllowed() && setTimeout(() => lead.cheer?.(), Number(stage.dataset.greet) * FRAME);
    if (document.readyState === 'complete') greet();
    else addEventListener('load', greet, { once: true });
  });
}

function sway(frames, direction, strength) {
  frames.forEach((frame, level) => {
    const angle = direction * strength * (1 + level * 0.9);
    frame.animate(
      [{ transform: `translateX(${angle * 0.6}%) rotate(${angle}deg)` }, { transform: 'none' }],
      { ...springs.wobbly, delay: level * FRAME, composite: 'add' },
    );
  });
}

function panic(characters, until) {
  characters.forEach((character, index) => {
    character.express?.({ mouth: 'wavy', eyes: 'worried' }, until);
    character.rig?.animate(
      [{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg) translateX(-1%)' }, { transform: 'rotate(3deg) translateX(1%)' }, { transform: 'rotate(0)' }],
      { duration: 7 * FRAME, iterations: Math.max(1, Math.floor(until / (7 * FRAME))), delay: index * FRAME, composite: 'add' },
    );
  });
}

function reactToLandings() {
  const stage = document.querySelector('.stage--hero');
  if (!stage) return;
  stage.addEventListener('animationstart', (event) => {
    if (event.animationName !== 'take-hit') return;
    event.target.querySelector('.character')?.express?.({ mouth: 'oh', eyes: 'squint' }, 16 * FRAME);
  });

  const overflow = stage.querySelector('[data-role="overflow"]');
  const show = playOverflow(overflow);
  if (!show) return;
  const frames = [...stage.querySelectorAll('[data-role="frame"]')];
  const stacked = frames.map((frame) => frame.querySelector('.character')).filter(Boolean);
  const romanesco = overflow.querySelector('.character');
  const origin = show.animation.startTime ?? document.timeline.currentTime;
  const after = (ms, action) => setTimeout(action, Math.max(0, origin + ms - document.timeline.currentTime));

  after(show.impactAt + 4 * FRAME, () => {
    sway(frames, 1, 2.2);
    panic(stacked, show.landAt - show.impactAt + 6 * FRAME);
    romanesco?.express?.({ mouth: 'oh', eyes: 'worried' }, show.knockAt - show.impactAt);
  });
  after(show.knockAt, () => sway(frames, -1, 3.2));
  after(show.landAt, () => romanesco?.express?.({ mouth: 'open', eyes: 'happy' }, 30 * FRAME));
  after(show.landAt + 10 * FRAME, () => stacked.forEach((character, index) => setTimeout(() => {
    character.express?.({ mouth: 'smile', eyes: 'happy' }, 18 * FRAME);
    character.blink?.();
  }, index * 3 * FRAME)));
}

wireMotionToggle();
reactToLandings();
popNearPageEnd();
greetWhenLanded();
