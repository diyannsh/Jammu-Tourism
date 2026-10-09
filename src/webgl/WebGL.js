import * as THREE from 'three';
import { raf } from '../core/RAF.js';
import { scroll } from '../core/Scroll.js';
import PostProcessing from './PostProcessing.js';
import MediaPlane from './MediaPlane.js';
import heroImage from '../assets/hero.png';

export default class WebGL {
  constructor() {
    this.mediaPlanes = [];
    this.textures = {};
    this.setup();
    this.addEvents();

    raf.subscribe(this.render.bind(this));
  }

  setup() {
    // 1. Canvas Injection
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'webgl-canvas';
    document.body.appendChild(this.canvas);

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Pixel-perfect Perspective Camera (1 unit = 1 CSS pixel)
    const distance = 600;
    const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 3000);
    this.camera.position.z = distance;

    // 4. High-Performance Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 5. Post-Processing Pipeline
    this.postProcessing = new PostProcessing({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera
    });

    // 6. Asset Dictionary Setup
    const loader = new THREE.TextureLoader();
    const heroTexture = loader.load(heroImage);
    heroTexture.generateMipmaps = false;
    heroTexture.minFilter = THREE.LinearFilter;

    this.textures = {
      hero: heroTexture
    };

    // 7. Hero Section Media Plane
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      this.mediaPlanes.push(
        new MediaPlane({
          element: heroEl,
          scene: this.scene,
          texture: this.textures.hero
        })
      );
    }

    // 8. Route Cards Media Planes (resolving data-texture keys)
    const cardElements = document.querySelectorAll('.route-card');
    cardElements.forEach((cardEl) => {
      const textureKey = cardEl.dataset.texture;
      const assignedTexture = this.textures[textureKey] || null;

      this.mediaPlanes.push(
        new MediaPlane({
          element: cardEl,
          scene: this.scene,
          texture: assignedTexture
        })
      );
    });
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    const distance = 600;
    this.camera.fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.mediaPlanes) {
      this.mediaPlanes.forEach((plane) => plane.resize());
    }

    if (this.postProcessing) {
      this.postProcessing.resize();
    }
  }

  render() {
    // Synchronize camera to Lenis smooth scroll
    this.camera.position.y = -scroll.y;

    // Delegate render to post-processing
    this.postProcessing.render();
  }
}