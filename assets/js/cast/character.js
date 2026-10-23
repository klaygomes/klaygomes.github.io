import { isMotionAllowed, onMotionPreferenceChange } from '../motion.js';
import { presets, spring } from '../spring.js';
import { eyesMarkup, mouthAt } from './face.js';

export const FRAME = 33;
export const ease = {
  softLand: 'cubic-bezier(0.22, 0.75, 0.25, 1)',
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  accelExit: 'cubic-bezier(0.5, 0, 0.75, 0)',
};
export const springs = Object.fromEntries(Object.keys(presets).map((name) => [name, spring(name)]));

const LOOK_REACH = 7;
const onScreen = new Set();
let pointerFrame = 0;
let pointer = null;

const visibility = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) onScreen.add(entry.target);
      else onScreen.delete(entry.target);
      entry.target.visibilityChanged(entry.isIntersecting);
    });
  }, { rootMargin: '80px' })
  : null;

function followPointer() {
  pointerFrame = 0;
  onScreen.forEach((character) => character.lookAt(pointer));
}

addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  pointer = [event.clientX, event.clientY];
  if (!pointerFrame) pointerFrame = requestAnimationFrame(followPointer);
}, { passive: true });

const between = ([min, max]) => min + Math.random() * (max - min);
const settled = (animation) => animation.finished.catch(() => {});

export class CharacterElement extends HTMLElement {
  static idleEvery = [2600, 6400];

  connectedCallback() {
    if (this.rig) return;
    this.rig = this.querySelector('.character__rig');
    this.spec = JSON.parse(this.dataset.face ?? '{}');
    this.eyes = this.querySelector('.face__eyes');
    this.mouth = this.querySelector('.face__mouth');
    this.addEventListener('pointerdown', () => this.cheer());
    onMotionPreferenceChange(() => this.visibilityChanged(onScreen.has(this)));
    visibility?.observe(this);
  }

  disconnectedCallback() {
    visibility?.unobserve(this);
    onScreen.delete(this);
    this.stopIdle();
  }

  part(name) {
    return [...this.querySelectorAll(`[data-part="${name}"]`)];
  }

  has(name) {
    return this.part(name).length > 0;
  }

  targets(names) {
    return [names].flat().flatMap((name) => (name === 'rig' ? [this.rig] : this.part(name)));
  }

  move(names, keyframes, options) {
    if (!isMotionAllowed()) return Promise.resolve();
    return Promise.all(this.targets(names).map((element) => settled(element.animate(keyframes, { duration: 12 * FRAME, easing: ease.softLand, ...options }))));
  }

  impulse(names, from, preset = 'wobbly', delay = 0) {
    return this.move(names, [{ transform: from }, { transform: 'none' }], { ...springs[preset], delay });
  }

  async pose(names, to, frames = 5, easing = ease.softLand) {
    if (!isMotionAllowed()) return () => {};
    const animations = this.targets(names).map((element) => element.animate([{ transform: 'none' }, { transform: to }], { duration: frames * FRAME, easing, fill: 'forwards' }));
    await Promise.all(animations.map(settled));
    return () => animations.forEach((animation) => animation.cancel());
  }

  async swing(names, to, preset = 'wobbly', frames = 5) {
    const release = await this.pose(names, to, frames);
    const done = this.impulse(names, to, preset);
    release();
    return done;
  }

  visibilityChanged(visible) {
    if (visible && isMotionAllowed()) this.startIdle();
    else this.stopIdle();
  }

  startIdle() {
    if (this.idling) return;
    this.idling = true;
    this.breath = this.rig.animate(
      [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.015, 0.975)' }],
      { duration: 1800 + Math.random() * 900, iterations: Infinity, direction: 'alternate', easing: ease.inOut, composite: 'add' },
    );
    this.loop();
  }

  stopIdle() {
    this.idling = false;
    this.breath?.cancel();
    clearTimeout(this.idleTimer);
    if (this.eyes) this.eyes.style.transform = '';
  }

  loop() {
    this.idleTimer = setTimeout(async () => {
      if (!this.idling) return;
      if (!this.busy) await (Math.random() < 0.55 ? this.blink() : this.fidget());
      this.loop();
    }, between(this.constructor.idleEvery));
  }

  lookAt(point) {
    if (!point || !this.eyes || !isMotionAllowed()) return;
    const box = this.rig.getBoundingClientRect();
    const [ex, ey] = (this.dataset.eyes ?? '50 50').split(' ').map(Number);
    const dx = point[0] - (box.left + (box.width * ex) / 100);
    const dy = point[1] - (box.top + (box.height * ey) / 100);
    const distance = Math.hypot(dx, dy) || 1;
    const reach = Math.min(LOOK_REACH, distance / 40);
    this.eyes.style.transform = `translate(${((dx / distance) * reach).toFixed(1)}px, ${((dy / distance) * reach * 0.7).toFixed(1)}px)`;
  }

  blink() {
    if (!isMotionAllowed()) return Promise.resolve();
    const eyes = [...this.querySelectorAll('.face__eye')];
    return Promise.all(eyes.map((eye) => settled(eye.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.1)', offset: 0.4 }, { transform: 'scaleY(1)' }], { duration: 6 * FRAME, easing: ease.inOut }))));
  }

  express({ mouth, eyes }, hold = 900) {
    if (!this.restFace) this.restFace = { mouth: this.mouth?.innerHTML, eyes: this.eyes?.innerHTML };
    if (mouth && this.mouth) this.mouth.innerHTML = mouthAt(this.spec, mouth);
    if (eyes && this.eyes) this.eyes.innerHTML = eyesMarkup(this.spec, eyes);
    clearTimeout(this.expressionTimer);
    this.expressionTimer = setTimeout(() => {
      if (this.mouth) this.mouth.innerHTML = this.restFace.mouth;
      if (this.eyes) this.eyes.innerHTML = this.restFace.eyes;
    }, hold);
  }

  async hop(height = 10) {
    if (!isMotionAllowed()) return;
    const crouch = await this.pose('rig', 'scale(1.08, 0.9)', 4);
    const rise = this.rig.animate([{ transform: 'scale(1.08, 0.9)' }, { transform: `translateY(-${height}%) scale(0.95, 1.06)` }], { duration: 8 * FRAME, easing: 'cubic-bezier(0.2, 0.7, 0.35, 1)', fill: 'forwards' });
    crouch();
    await settled(rise);
    const fall = this.rig.animate([{ transform: `translateY(-${height}%) scale(0.95, 1.06)` }, { transform: 'scale(1.1, 0.88)' }], { duration: 7 * FRAME, easing: 'cubic-bezier(0.55, 0, 0.9, 0.6)', fill: 'forwards' });
    rise.cancel();
    await settled(fall);
    const land = this.impulse('rig', 'scale(1.1, 0.88)', 'bouncy');
    fall.cancel();
    await land;
  }

  wave() {
    if (!this.has('arm')) return Promise.resolve();
    return this.swing(['arm', 'prop'], 'rotate(-28deg)', 'wobbly');
  }

  fidget() {
    return this.wave();
  }

  async cheer() {
    if (this.busy || !isMotionAllowed()) return;
    this.busy = true;
    this.express({ mouth: 'open', eyes: 'happy' }, 1200);
    await Promise.all([this.hop(), this.celebrate()]);
    this.busy = false;
  }

  celebrate() {
    return this.wave();
  }
}
