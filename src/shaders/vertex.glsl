varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  // Intense 3D depth curve
  pos.z += sin(pos.y * 0.005) * 10.0; 
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}