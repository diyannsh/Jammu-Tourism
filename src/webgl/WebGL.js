import * as THREE from 'three';
import { raf } from '../core/RAF.js';
import { scroll } from '../core/Scroll.js';
import PostProcessing from './PostProcessing.js';
import MediaPlane from './MediaPlane.js';

// 1. Import your images from src/assets/
import heroImage from '../assets/hero.jpg';
import katraImage from '../assets/katra.jpg';
import patnitopImage from '../assets/patnitop.jpg';
import jammuImage from '../assets/jammu.jpg';
import bhaderwahImage from '../assets/bhaderwah.jpg';

export default class WebGL {
  constructor() {
    this.mediaPlanes = [];
    this.textures = {};
    this.setup();
    this.addEvents();

    raf.subscribe(this.render.bind(this));
  }

  setup() {
    // Canvas Injection
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'webgl-canvas';
    document.body.appendChild(this.canvas);

    // Scene
    this.scene = new THREE.Scene();

    // Pixel-perfect Perspective Camera
    const distance = 600;
    const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 3000);
    this.camera.position.z = distance;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-Processing Pipeline
    this.postProcessing = new PostProcessing({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera
    });

    // Helper to configure textures cleanly
    const loader = new THREE.TextureLoader();
    const loadTex = (src) => {
      const tex = loader.load(src);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      return tex;
    };

    // 2. Map imported images to texture keys
    this.textures = {
      hero: loadTex(heroImage),
      katra: loadTex(katraImage),
      patnitop: loadTex(patnitopImage),
      jammu: loadTex(jammuImage),
      bhaderwah: loadTex(bhaderwahImage)
    };

    // 3. Attach Hero Plane
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

    // 4. Attach Route Cards by reading data-texture
    const cardElements = document.querySelectorAll('.route-card');
    cardElements.forEach((cardEl) => {
      const key = cardEl.dataset.texture;
      const assignedTexture = this.textures[key] || null;

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
    this.camera.position.y = -scroll.y;
    this.postProcessing.render();
  }
}