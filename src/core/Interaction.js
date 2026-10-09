import gsap from 'gsap';
import { scroll } from './Scroll.js';
import { sound } from './Audio.js';

export default class Interaction {
  constructor() {
    this.initMagneticButtons();
    this.initCardAudio();
    this.initNavigation();
  }

  initMagneticButtons() {
    // Only small interactive targets get physical magnetic movement
    const buttons = document.querySelectorAll('.hero-cta, .magnetic-btn, .quick-add');

    buttons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        sound.playHover();
      });

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1.1, 0.4)',
          overwrite: 'auto'
        });
      });
    });
  }

  initCardAudio() {
    // Large cards trigger sound without moving their layout position
    const cards = document.querySelectorAll('.route-card');
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        sound.playHover();
      });
    });
  }

  initNavigation() {
    const enterBtn = document.querySelector('.hero-cta');
    const routesSection = document.querySelector('.routes');

    if (!enterBtn || !routesSection) return;

    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();

      sound.playTransition();

      scroll.lenis.scrollTo(routesSection, {
        duration: 2.0,
        easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
      });
    });
  }
}

export const interaction = new Interaction();