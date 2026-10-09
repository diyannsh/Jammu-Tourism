uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // 1. Subtle zoom toward card center on hover
  vec2 centeredUv = uv - 0.5;
  centeredUv *= 1.0 - (uHover * 0.06);
  uv = centeredUv + 0.5;

  // 2. Cursor ripple displacement
  vec2 mouseUV = vec2(uMouse.x * 0.5 + 0.5, uMouse.y * 0.5 + 0.5);
  float dist = distance(uv, mouseUV);
  float wave = sin(dist * 24.0 - uTime * 3.5) * 0.025 * smoothstep(0.45, 0.0, dist);
  vec2 displacedUv = uv + normalize(uv - mouseUV + 0.0001) * wave;

  // 3. Sample texture with per-card hover split
  float r = texture2D(uTexture, displacedUv + vec2(uHover * 0.012, 0.0)).r;
  float g = texture2D(uTexture, displacedUv).g;
  float b = texture2D(uTexture, displacedUv - vec2(uHover * 0.012, 0.0)).b;
  float a = texture2D(uTexture, displacedUv).a;

  vec4 textureColor = vec4(r, g, b, a);

  // Fallback shader artwork when no static image is assigned
  if (textureColor.a == 0.0) {
    vec3 baseGradient = vec3(displacedUv.x * 0.25, displacedUv.y * 0.35, 0.4);
    vec3 hoverGlow = vec3(0.83, 0.69, 0.22) * uHover * 0.45; // Amber accent (#d4af37)
    textureColor = vec4(baseGradient + hoverGlow, 0.85);
  }

  gl_FragColor = textureColor;
}
