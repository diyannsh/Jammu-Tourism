import * as THREE from 'three';
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';
import { raf } from '../core/RAF.js';
import { cursor } from '../core/Cursor.js';
import { scroll } from '../core/Scroll.js';

export default class CustomMaterial extends THREE.ShaderMaterial {
  constructor(texture = null) {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTexture: { value: texture },
        uHover: { value: 0.0 },
        uVelocity: { value: 0.0 } // Normalized scroll velocity
      },
      transparent: true,
      wireframe: false
    });

    raf.subscribe(this.update.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
  }

  update({ time }) {
    this.uniforms.uTime.value = time * 0.001;

    // Smooth cursor interpolation
    this.uniforms.uMouse.value.x += (cursor.normalized.x - this.uniforms.uMouse.value.x) * 0.1;
    this.uniforms.uMouse.value.y += (cursor.normalized.y - this.uniforms.uMouse.value.y) * 0.1;

    // Smooth scroll velocity interpolation
    const targetVelocity = scroll.velocity * 0.0015;
    this.uniforms.uVelocity.value += (targetVelocity - this.uniforms.uVelocity.value) * 0.15;
  }

  resize() {
    this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }
}