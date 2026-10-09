import * as THREE from 'three';
import { raf } from '../core/RAF.js';
import { scroll } from '../core/Scroll.js';
import PostProcessing from './PostProcessing.js';
import MediaPlane from './MediaPlane.js';
import heroImage from '../assets/hero.png';

export default class WebGL {
  constructor() {
    this.mediaPlanes = [];
    this.setup();
    this.addEvents();
    
    raf.subscribe(this.render.bind(this));
  }

  setup() {
    // 1. Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'webgl-canvas';
    document.body.appendChild(this.canvas);

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Pixel-perfect Camera
    const distance = 600;
    const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 3000);
    this.camera.position.z = distance;

    // 4. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 5. Post-Processing
    this.postProcessing = new PostProcessing({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera
    });

    // 6. Textures & Media Planes
    const loader = new THREE.TextureLoader();
    const heroTexture = loader.load(heroImage);
    heroTexture.generateMipmaps = false;
    heroTexture.minFilter = THREE.LinearFilter;

    // Hero plane
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      this.mediaPlanes.push(
        new MediaPlane({ element: heroEl, scene: this.scene, texture: heroTexture })
      );
    }

    // Route cards
    const cardElements = document.querySelectorAll('.route-card');
    cardElements.forEach((cardEl) => {
      this.mediaPlanes.push(
        new MediaPlane({ element: cardEl, scene: this.scene })
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
    // Sync camera to Lenis scroll
    this.camera.position.y = -scroll.y;

    // Render pass pipeline
    this.postProcessing.render();
  }
}