import Lenis from 'lenis';
import { raf } from './RAF.js';

export default class Scroll {
  constructor() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
      smoothWheel: true,
      touchMultiplier: 2
    });

    this.y = 0;
    this.velocity = 0;
    this.progress = 0;

    // Listen to scroll changes
    this.lenis.on('scroll', (e) => {
      this.y = e.scroll;
      this.velocity = e.velocity;
      this.progress = e.progress;
    });

    // Master RAF ticks Lenis
    raf.subscribe(this.update.bind(this));
  }

  update({ time }) {
    this.lenis.raf(time);
  }
}

export const scroll = new Scroll();