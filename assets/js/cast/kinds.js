import { CharacterElement, FRAME, springs } from './character.js';

export class CauliflowerElement extends CharacterElement {
  flutter(angle = 10) {
    return Promise.all([
      this.impulse('leaf-left', `rotate(${-angle}deg)`, 'wobbly'),
      this.impulse('leaf-right', `rotate(${angle}deg)`, 'wobbly', 2 * FRAME),
    ]);
  }

  fidget() {
    return this.has('arm') && Math.random() < 0.5 ? this.wave() : this.flutter(8);
  }

  celebrate() {
    return Promise.all([this.flutter(22), this.wave()]);
  }
}

export class RomanescoElement extends CharacterElement {
  tilt(angle = 8) {
    return this.impulse(['head', 'face'], `rotate(${angle}deg)`, 'wobbly');
  }

  fidget() {
    return Math.random() < 0.5 ? this.tilt() : this.impulse(['arm', 'prop'], 'rotate(-14deg)', 'bouncy');
  }

  celebrate() {
    return Promise.all([this.tilt(16), this.wave()]);
  }
}

export class BroccoliElement extends CharacterElement {
  async tipHat() {
    const lifted = 'translateY(-24%) rotate(-18deg)';
    const release = await this.pose('hat', lifted, 7);
    await new Promise((resolve) => setTimeout(resolve, 10 * FRAME));
    const done = this.impulse('hat', lifted, 'bouncy');
    release();
    return done;
  }

  tap() {
    return this.impulse(['arm', 'prop'], 'rotate(-24deg)', 'wobbly');
  }

  fidget() {
    return Math.random() < 0.6 ? this.tap() : this.tipHat();
  }

  celebrate() {
    return Promise.all([this.tipHat(), this.wave()]);
  }
}

export class KaleElement extends CharacterElement {
  rustle(amount = 5) {
    return this.impulse(['head', 'face'], `skewX(${amount}deg)`, 'wobbly');
  }

  pushGlasses() {
    const glasses = this.querySelector('.face__glasses');
    if (!glasses) return Promise.resolve();
    return glasses.animate([{ transform: 'translateY(9px)' }, { transform: 'none' }], springs.bouncy).finished.catch(() => {});
  }

  fidget() {
    return Math.random() < 0.5 ? this.rustle() : this.pushGlasses();
  }

  celebrate() {
    return Promise.all([this.rustle(9), this.pushGlasses()]);
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
