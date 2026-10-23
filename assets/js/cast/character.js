import { isMotionAllowed, onMotionPreferenceChange } from '../motion.js';
import { eyesMarkup, mouthAt } from './face.js';

export const FRAME = 33;
export const ease = {
  softLand: 'cubic-bezier(0.22, 0.75, 0.25, 1)',
  snapSettle: 'cubic-bezier(0.04, 0.92, 0.12, 1)',
  glide: 'cubic-bezier(0.3, 0.6, 0.45, 1)',
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  accelExit: 'cubic-bezier(0.5, 0, 0.75, 0)',
  popOver: 'cubic-bezier(0.3, 1.32, 0.55, 1)',
};

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

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const between = ([min, max]) => min + Math.random() * (max - min);

export class CharacterElement extends HTMLElement {
  static idleEvery = [2600, 6400];

  connectedCallback() {
    if (this.rig) return;
    this.rig = this.querySelector('.character__rig');
    this.spec = JSON.parse(this.dataset.face ?? '{}');
    this.eyes = this.querySelector('.face__eyes');
    this.mouth = this.querySelector('.face__mouth');
    this.running = new Set();
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

  move(names, keyframes, options) {
    if (!isMotionAllowed()) return Promise.resolve();
    const elements = [names].flat().flatMap((name) => (name === 'rig' ? [this.rig] : this.part(name)));
    const animations = elements.map((element) => element.animate(keyframes, { duration: 12 * FRAME, easing: ease.softLand, ...options }));
    animations.forEach((animation) => this.running.add(animation));
    return Promise.all(animations.map((animation) => animation.finished.catch(() => {}).finally(() => this.running.delete(animation))));
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
      { duration: 1800 + Math.random() * 900, iterations: Infinity, direction: 'alternate', easing: ease.inOut },
    );
    this.loop();
  }

  stopIdle() {
    this.idling = false;
    this.breath?.cancel();
    clearTimeout(this.idleTimer);
    if (this.eyes) this.eyes.removeAttribute('transform');
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
    this.eyes.setAttribute('transform', `translate(${((dx / distance) * reach).toFixed(1)} ${((dy / distance) * reach * 0.7).toFixed(1)})`);
  }

  blink() {
    if (!isMotionAllowed()) return Promise.resolve();
    const eyes = [...this.querySelectorAll('.face__eye')];
    return Promise.all(eyes.map((eye) => eye.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.1)' }, { transform: 'scaleY(1)' }], { duration: 5 * FRAME, easing: ease.inOut }).finished.catch(() => {})));
  }

  express({ mouth, eyes }, hold = 900) {
    const before = { mouth: this.mouth?.innerHTML, eyes: this.eyes?.innerHTML };
    if (mouth && this.mouth) this.mouth.innerHTML = mouthAt(this.spec, mouth);
    if (eyes && this.eyes) this.eyes.innerHTML = eyesMarkup(this.spec, eyes);
    clearTimeout(this.expressionTimer);
    this.expressionTimer = setTimeout(() => {
      if (this.mouth) this.mouth.innerHTML = before.mouth;
      if (this.eyes) this.eyes.innerHTML = before.eyes;
    }, hold);
  }

  hop(height = 9) {
    return this.move('rig', [
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: 'translateY(0) scale(1.06, 0.92)', offset: 0.18 },
      { transform: `translateY(-${height}%) scale(0.96, 1.05)`, offset: 0.5, easing: ease.accelExit },
      { transform: 'translateY(0) scale(1.04, 0.95)', offset: 0.82 },
      { transform: 'translateY(0) scale(1, 1)' },
    ], { duration: 18 * FRAME, easing: ease.softLand });
  }

  wave(times = 2) {
    if (!this.has('arm')) return Promise.resolve();
    const swing = Array.from({ length: times * 2 + 1 }, (_, i) => ({ transform: `rotate(${i % 2 ? -16 : i === 0 || i === times * 2 ? 0 : 10}deg)` }));
    return this.move(['arm', 'prop'], swing, { duration: (times * 10 + 6) * FRAME, easing: ease.inOut });
  }

  fidget() {
    return this.wave(1);
  }

  async cheer() {
    if (this.busy || !isMotionAllowed()) return;
    this.busy = true;
    this.express({ mouth: 'open', eyes: 'happy' }, 1100);
    await Promise.all([this.hop(), this.celebrate()]);
    this.busy = false;
  }

  celebrate() {
    return this.wave();
  }

  async land({ from = 'translateY(-60%) scale(1.3)', delay = 0, duration = 12 * FRAME, easing = ease.softLand } = {}) {
    if (!isMotionAllowed()) return;
    await this.rig.animate([{ transform: from, filter: 'blur(6px)', opacity: 0.25, offset: 0 }, { opacity: 1, filter: 'blur(0)', offset: 0.35 }, { transform: 'none', filter: 'none', opacity: 1 }], { duration, delay, easing, fill: 'backwards' }).finished.catch(() => {});
    await pause(2 * FRAME);
  }
}
