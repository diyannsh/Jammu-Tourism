uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // 1. Subtle optical zoom toward center on hover
  vec2 centeredUv = uv - 0.5;
  centeredUv *= 1.0 - (uHover * 0.05);
  uv = centeredUv + 0.5;

  // 2. Cursor ripple displacement wave
  vec2 mouseUV = vec2(uMouse.x * 0.5 + 0.5, uMouse.y * 0.5 + 0.5);
  float dist = distance(uv, mouseUV);
  float wave = sin(dist * 22.0 - uTime * 3.0) * 0.02 * smoothstep(0.4, 0.0, dist);
  vec2 displacedUv = uv + normalize(uv - mouseUV + 0.0001) * wave;

  // 3. Sample texture without chromatic splitting
  vec4 texColor = texture2D(uTexture, displacedUv);

  // 4. Calculate perceptual monochrome luminance (black / grey / white)
  float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

  // Fallback dark gradient if texture is absent
  if (texColor.a == 0.0) {
    luma = mix(0.06, 0.35, displacedUv.y);
  }

  // 5. Expand tonal range: obsidian blacks, slate greys, pure highlights
  luma = smoothstep(0.05, 0.95, luma);

  // 6. Hover state: pure white/silver illumination lift
  luma += uHover * 0.22;

  gl_FragColor = vec4(vec3(luma), 1.0);
}