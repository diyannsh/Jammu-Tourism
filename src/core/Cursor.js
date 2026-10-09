import { raf } from './RAF.js';

export default class Cursor {
  constructor() {
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');

    // Screen pixel positions
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Normalized coordinates (-1 to 1) for shaders
    this.normalized = { x: 0, y: 0 };

    this.initEvents();
    raf.subscribe(this.update.bind(this));
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Update normalized coords: (-1 at left/bottom to +1 at right/top)
      this.normalized.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.normalized.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Snap the sharp center dot instantly
      if (this.dot) {
        this.dot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
      }
    });

    // Expand cursor ring when hovering interactive elements
    const interactives = document.querySelectorAll('a, button, .interactive');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  }

  update() {
    if (!this.ring) return;

    // Linear interpolation (lerp) for smooth lag/trailing effect
    this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.15;
    this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.15;

    this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0) translate(-50%, -50%)`;
  }
}

export const cursor = new Cursor();