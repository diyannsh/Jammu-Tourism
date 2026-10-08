uniform sampler2D uTexture;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  
  // Liquid Ripple Distortion
  uv.x += sin(uv.y * 15.0 + uTime * 2.0) * 0.015 * uHover;
  uv.y += cos(uv.x * 15.0 + uTime * 2.0) * 0.015 * uHover;

  // Chromatic Aberration (RGB Shift)
  float shift = 0.04 * uHover;
  float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
  
  vec4 texColor = vec4(r, g, b, 1.0);
  
  // Film Grain
  float grain = rand(uv * uTime) * 0.08;
  texColor.rgb -= grain;

  gl_FragColor = texColor;
}