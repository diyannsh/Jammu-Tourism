uniform float uVelocity;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 newPosition = position;

  // Parabolic horizontal curvature: edges stay pinned, center arches backwards/forwards
  float arch = sin(uv.x * 3.14159265);
  
  // Arch out into 3D depth based on velocity
  newPosition.z += arch * uVelocity * 180.0;

  // Trailing drag along the Y axis
  newPosition.y += sin(uv.y * 3.14159265) * uVelocity * 30.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}