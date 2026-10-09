export default class RAF {
  constructor() {
    this.callbacks = [];
    this.time = performance.now();
    this.frame = 0;
    this.rafId = null;

    // Bind tick to preserve context
    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.rafId) return;
    this.time = performance.now();
    this.tick();
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  subscribe(callback) {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
  }

  unsubscribe(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  tick() {
    const currentTime = performance.now();
    // Cap delta at 64ms (approx 15fps) to prevent massive physics jumps when switching browser tabs
    const delta = Math.min(currentTime - this.time, 64); 
    this.time = currentTime;
    this.frame++;

    // Distribute time and delta to all subscribers
    for (let i = 0; i < this.callbacks.length; i++) {
      this.callbacks[i]({ time: this.time, delta, frame: this.frame });
    }

    this.rafId = requestAnimationFrame(this.tick);
  }
}

// Export a singleton instance so the entire app shares the exact same timeline
export const raf = new RAF();