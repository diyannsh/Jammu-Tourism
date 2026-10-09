uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // 1. Subtle optical zoom on hover
  vec2 centeredUv = uv - 0.5;
  centeredUv *= 1.0 - (uHover * 0.04);
  uv = centeredUv + 0.5;

  // 2. Liquid cursor ripple
  vec2 mouseUV = vec2(uMouse.x * 0.5 + 0.5, uMouse.y * 0.5 + 0.5);
  float dist = distance(uv, mouseUV);
  float wave = sin(dist * 22.0 - uTime * 3.0) * 0.018 * smoothstep(0.4, 0.0, dist);
  vec2 displacedUv = uv + normalize(uv - mouseUV + 0.0001) * wave;

  // 3. Sample original photo texture
  vec4 texColor = texture2D(uTexture, displacedUv);

  // Fallback dark slate if image is missing
  if (texColor.a == 0.0) {
    texColor = vec4(0.12, 0.12, 0.14, 1.0);
  }

  // 4. Exposure lift + hover illumination
  vec3 color = texColor.rgb * 1.15; // 15% brightness boost
  color += vec3(uHover * 0.12);      // Subtle silver highlight on hover

  gl_FragColor = vec4(color, 1.0);
}