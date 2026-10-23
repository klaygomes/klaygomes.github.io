import { isMotionAllowed, isReducedMotion, isUserDisabled, onMotionPreferenceChange, setUserDisabled } from './motion.js';
import './cast/kinds.js';

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

function reactToLandings() {
  const stage = document.querySelector('.stage--hero');
  if (!stage) return;
  stage.addEventListener('animationstart', (event) => {
    if (event.animationName !== 'take-hit') return;
    event.target.querySelector('.character')?.express?.({ mouth: 'oh', eyes: 'squint' }, 16 * FRAME);
  });
  stage.addEventListener('animationend', (event) => {
    if (event.animationName !== 'overflow') return;
    event.target.querySelector('.character')?.express?.({ mouth: 'open', eyes: 'happy' }, 30 * FRAME);
  });
}

wireMotionToggle();
reactToLandings();
popNearPageEnd();
greetWhenLanded();
