import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { pane } from '../config.js';
import { scroll } from '../core/Scroll.js';

// Screen-space RGB shift shader
const RGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAmount: { value: 0.003 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      float r = texture2D(tDiffuse, uv + vec2(uAmount, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(uAmount, 0.0)).b;
      float a = texture2D(tDiffuse, uv).a;

      gl_FragColor = vec4(r, g, b, a);
    }
  `
};

export default class PostProcessing {
  constructor({ renderer, scene, camera }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.baseAmount = 0.002;

    this.setup();
    this.setupDebug();
  }

  setup() {
    // 1. Initialize composer with high-precision render target
    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        samples: 2, // Antialiasing inside post-processing
        type: THREE.HalfFloatType
      }
    );

    this.composer = new EffectComposer(this.renderer, renderTarget);

    // 2. Base render pass (draws our 3D scene)
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 3. Custom RGB shift pass
    this.shiftPass = new ShaderPass(RGBShiftShader);
    this.shiftPass.renderToScreen = true;
    this.composer.addPass(this.shiftPass);
  }

  setupDebug() {
    if (!pane) return;
    const folder = pane.addFolder({ title: 'Post-Processing' });
    folder.addBinding(this, 'baseAmount', {
      label: 'Base Shift',
      min: 0,
      max: 0.03,
      step: 0.001
    });
  }

  resize() {
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    // Dynamically increase chromatic aberration during rapid scroll
    const velocityDistortion = Math.min(Math.abs(scroll.velocity) * 0.0005, 0.02);
    this.shiftPass.uniforms.uAmount.value = this.baseAmount + velocityDistortion;

    this.composer.render();
  }
}