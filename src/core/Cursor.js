import { raf } from './RAF.js';

export default class Cursor {
  constructor() {
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');

    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Screen pixel positions
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Normalized coordinates (-1 to 1) for shaders
    this.normalized = { x: 0, y: 0 };
    this.targetNormalized = { x: 0, y: 0 };

    this.init();
    raf.subscribe(this.update.bind(this));
  }

  init() {
    if (this.isTouch) {
      // Hide desktop cursor elements on touch devices
      if (this.dot) this.dot.style.display = 'none';
      if (this.ring) this.ring.style.display = 'none';

      this.initTouchEvents();
      this.initOrientationEvents();
    } else {
      this.initMouseEvents();
    }
  }

  initMouseEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      this.targetNormalized.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.dot) {
        this.dot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
      }
    });

    const interactives = document.querySelectorAll('a, button, .interactive, .magnetic-btn');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  }

  initTouchEvents() {
    const handleTouch = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];

      this.mouse.x = touch.clientX;
      this.mouse.y = touch.clientY;

      this.targetNormalized.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.targetNormalized.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
  }

  initOrientationEvents() {
    if (!window.DeviceOrientationEvent) return;

    window.addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma === null || e.beta === null) return;

        // gamma: left-to-right tilt [-90, 90]
        // beta: front-to-back tilt [-180, 180]
        const tiltX = Math.max(-1, Math.min(1, e.gamma / 45));
        const tiltY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));

        // Blend gyroscope tilt into target coordinates
        this.targetNormalized.x = tiltX * 0.6;
        this.targetNormalized.y = -tiltY * 0.6;
      },
      { passive: true }
    );
  }

  update() {
    // Smooth interpolation for normalized shader coordinates
    this.normalized.x += (this.targetNormalized.x - this.normalized.x) * 0.1;
    this.normalized.y += (this.targetNormalized.y - this.normalized.y) * 0.1;

    // Desktop ring trailing interpolation
    if (!this.isTouch && this.ring) {
      this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.15;
      this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.15;

      this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0) translate(-50%, -50%)`;
    }
  }
}

export const cursor = new Cursor();