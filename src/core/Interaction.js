import gsap from 'gsap';
import { scroll } from './Scroll.js';

export default class Interaction {
  constructor() {
    this.initMagneticButtons();
    this.initNavigation();
  }

  initMagneticButtons() {
    // Select all interactive buttons across the hero and route cards
    const buttons = document.querySelectorAll('.hero-cta, .magnetic-btn, .quick-add');

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        // Calculate offset from button center
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Elastic magnetic pull
        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      btn.addEventListener('mouseleave', () => {
        // Elastic snap back to origin
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

  initNavigation() {
    const enterBtn = document.querySelector('.hero-cta');
    const routesSection = document.querySelector('.routes');

    if (!enterBtn || !routesSection) return;

    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Smoothly travel to the routes section with inertia
      scroll.lenis.scrollTo(routesSection, {
        duration: 2.0,
        easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
      });
    });
  }
}

export const interaction = new Interaction();