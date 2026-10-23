import { CharacterElement, FRAME, ease } from './character.js';

export class CauliflowerElement extends CharacterElement {
  flutter(angle = 9, times = 1) {
    const beat = (sign) => Array.from({ length: times * 2 + 1 }, (_, i) => ({ transform: `rotate(${i % 2 ? sign * angle : 0}deg)` }));
    const duration = (times * 9 + 4) * FRAME;
    return Promise.all([
      this.move('leaf-left', beat(-1), { duration, easing: ease.inOut }),
      this.move('leaf-right', beat(1), { duration, easing: ease.inOut, delay: 2 * FRAME }),
    ]);
  }

  fidget() {
    return this.has('arm') && Math.random() < 0.5 ? this.wave(1) : this.flutter(6);
  }

  celebrate() {
    return Promise.all([this.flutter(18, 2), this.wave()]);
  }
}

export class RomanescoElement extends CharacterElement {
  tilt(angle = 6) {
    return this.move(['head', 'face'], [{ transform: 'rotate(0)' }, { transform: `rotate(${angle}deg)` }, { transform: `rotate(${-angle / 2}deg)` }, { transform: 'rotate(0)' }], { duration: 24 * FRAME, easing: ease.inOut });
  }

  fidget() {
    return Math.random() < 0.5 ? this.tilt() : this.move(['arm', 'prop'], [{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(0)' }], { duration: 16 * FRAME, easing: ease.inOut });
  }

  celebrate() {
    return Promise.all([this.tilt(14), this.wave(3)]);
  }
}

export class BroccoliElement extends CharacterElement {
  tipHat() {
    return this.move('hat', [
      { transform: 'translateY(0) rotate(0)' },
      { transform: 'translateY(-22%) rotate(-16deg)', offset: 0.35 },
      { transform: 'translateY(-22%) rotate(-16deg)', offset: 0.65 },
      { transform: 'translateY(0) rotate(0)' },
    ], { duration: 26 * FRAME, easing: ease.inOut });
  }

  tap() {
    return this.move(['arm', 'prop'], [{ transform: 'rotate(0)' }, { transform: 'rotate(-20deg)' }, { transform: 'rotate(0)' }, { transform: 'rotate(-20deg)' }, { transform: 'rotate(0)' }], { duration: 20 * FRAME, easing: ease.inOut });
  }

  fidget() {
    return Math.random() < 0.6 ? this.tap() : this.tipHat();
  }

  celebrate() {
    return Promise.all([this.tipHat(), this.wave()]);
  }
}

export class KaleElement extends CharacterElement {
  rustle(amount = 3) {
    return this.move(['head', 'face'], [{ transform: 'skewX(0)' }, { transform: `skewX(${amount}deg)` }, { transform: `skewX(${-amount}deg)` }, { transform: 'skewX(0)' }], { duration: 20 * FRAME, easing: ease.inOut });
  }

  pushGlasses() {
    const glasses = this.querySelector('.face__glasses');
    if (!glasses) return Promise.resolve();
    glasses.style.transformBox = 'fill-box';
    return glasses.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(8px)', offset: 0.3 }, { transform: 'translateY(-3px)', offset: 0.7 }, { transform: 'translateY(0)' }], { duration: 18 * FRAME, easing: ease.softLand }).finished.catch(() => {});
  }

  fidget() {
    return Math.random() < 0.5 ? this.rustle() : this.pushGlasses();
  }

  celebrate() {
    return Promise.all([this.rustle(6), this.pushGlasses()]);
  }
}

export const kinds = {
  'ecf-cauliflower': CauliflowerElement,
  'ecf-romanesco': RomanescoElement,
  'ecf-broccoli': BroccoliElement,
  'ecf-kale': KaleElement,
};

for (const [tag, element] of Object.entries(kinds)) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}
