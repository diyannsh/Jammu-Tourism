import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { scroll } from '../core/Scroll.js';
import { pane } from '../config.js';

const MonochromeShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAmount: { value: 0.0 }
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
      // Sample clean diffuse frame without RGB color separation
      vec4 color = texture2D(tDiffuse, vUv);

      // Subtle monochrome luminance boost reacting to high velocity
      color.rgb += vec3(uAmount * 0.4);

      gl_FragColor = color;
    }
  `
};

export default class PostProcessing {
  constructor({ renderer, scene, camera }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.shiftPass = new ShaderPass(MonochromeShiftShader);
    this.shiftPass.renderToScreen = true;
    this.composer.addPass(this.shiftPass);

    this.setupDebug();
  }

  setupDebug() {
    if (!pane) return;
    const folder = pane.addFolder({ title: 'Post-Processing' });
    folder.addBinding(this.shiftPass.uniforms.uAmount, 'value', {
      min: 0,
      max: 0.05,
      step: 0.001,
      label: 'Velocity Boost'
    });
  }

  resize() {
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    const targetAmount = Math.min(Math.abs(scroll.velocity) * 0.0003, 0.03);
    this.shiftPass.uniforms.uAmount.value += 
      (targetAmount - this.shiftPass.uniforms.uAmount.value) * 0.15;

    this.composer.render();
  }
}
