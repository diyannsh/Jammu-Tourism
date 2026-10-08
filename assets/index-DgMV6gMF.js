(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`varying vec2 vUv;\r
void main() {\r
  vUv = uv;\r
  vec3 pos = position;\r
  // Intense 3D depth curve\r
  pos.z += sin(pos.y * 0.005) * 10.0; \r
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\r
}`,t=`uniform sampler2D uTexture;\r
uniform float uHover;\r
uniform float uTime;\r
varying vec2 vUv;\r
\r
float rand(vec2 co){\r
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\r
}\r
\r
void main() {\r
  vec2 uv = vUv;\r
  \r
  // Liquid Ripple Distortion\r
  uv.x += sin(uv.y * 15.0 + uTime * 2.0) * 0.015 * uHover;\r
  uv.y += cos(uv.x * 15.0 + uTime * 2.0) * 0.015 * uHover;\r
\r
  // Chromatic Aberration (RGB Shift)\r
  float shift = 0.04 * uHover;\r
  float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;\r
  float g = texture2D(uTexture, uv).g;\r
  float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;\r
  \r
  vec4 texColor = vec4(r, g, b, 1.0);\r
  \r
  // Film Grain\r
  float grain = rand(uv * uTime) * 0.08;\r
  texColor.rgb -= grain;\r
\r
  gl_FragColor = texColor;\r
}`;function n(){document.querySelectorAll(`.kinetic-text`).forEach(e=>{let t=e.textContent.trim();e.innerHTML=``,t.split(` `).forEach(t=>{let n=document.createElement(`span`);n.style.display=`inline-block`,n.style.marginRight=`0.3em`,t.split(``).forEach(e=>{let t=document.createElement(`span`);t.className=`char`,t.style.display=`inline-block`,t.style.opacity=`0`,t.style.transform=`translateY(110%) rotateX(-40deg)`,t.textContent=e,n.appendChild(t)}),e.appendChild(n)}),gsap.to(e.querySelectorAll(`.char`),{y:`0%`,rotateX:0,opacity:1,duration:1,stagger:.03,ease:`power4.out`,scrollTrigger:{trigger:e,start:`top 85%`}})}),gsap.fromTo(`#hero-title`,{y:40,opacity:0},{y:0,opacity:1,duration:1.5,ease:`power3.out`,delay:.2})}function r(){let e=document.getElementById(`hero-canvas`);if(!e)return;let t=new THREE.WebGLRenderer({canvas:e,antialias:!0,alpha:!0});t.setPixelRatio(Math.min(window.devicePixelRatio,1.5));let n=new THREE.Scene,r=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,.1,100);r.position.set(0,-6,4.5),r.lookAt(0,0,0);let i=new THREE.PlaneGeometry(16,12,48,36),a=i.attributes.position;for(let e=0;e<a.count;e++){let t=a.getX(e),n=a.getY(e);a.setZ(e,Math.sin(t*.7)*Math.cos(n*.8)*1.1+Math.sin(t*1.5+n*.9)*.45)}i.computeVertexNormals();let o=new THREE.Mesh(i,new THREE.MeshBasicMaterial({color:10462891,wireframe:!0,transparent:!0,opacity:.22}));n.add(o);let s=new THREE.Clock;function c(){t.setSize(window.innerWidth,window.innerHeight),r.aspect=window.innerWidth/window.innerHeight,r.updateProjectionMatrix()}window.addEventListener(`resize`,c),c();function l(){o.rotation.z=Math.sin(s.getElapsedTime()*.1)*.05,t.render(n,r),requestAnimationFrame(l)}l()}var i=class{constructor(){this.canvas=document.getElementById(`webgl-canvas`),this.images=[...document.querySelectorAll(`.webgl-image`)],this.planes=[],this.mouse=new THREE.Vector2(0,0),this.clock=new THREE.Clock,this.initLenis(),this.initThree(),this.createPlanes(),this.initEvents(),this.render()}initLenis(){this.lenis=new Lenis({duration:1.2,smoothWheel:!0}),this.lenis.on(`scroll`,ScrollTrigger.update),gsap.ticker.add(e=>{this.lenis.raf(e*1e3)})}initThree(){this.scene=new THREE.Scene;let e=180*(2*Math.atan(window.innerHeight/2/800))/Math.PI;this.camera=new THREE.PerspectiveCamera(e,window.innerWidth/window.innerHeight,.1,1e4),this.camera.position.z=800,this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:!0,alpha:!0}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))}createPlanes(){let n=new THREE.PlaneGeometry(1,1,32,32),r=new THREE.TextureLoader;this.images.forEach(i=>{let a=i.getAttribute(`data-src`),o=r.load(a),s=new THREE.ShaderMaterial({vertexShader:e,fragmentShader:t,uniforms:{uTexture:{value:o},uHover:{value:0},uTime:{value:0}}}),c=new THREE.Mesh(n,s);this.scene.add(c),this.planes.push({mesh:c,element:i}),i.parentElement.addEventListener(`mouseenter`,()=>{gsap.to(s.uniforms.uHover,{value:1,duration:.8,ease:`power3.out`})}),i.parentElement.addEventListener(`mouseleave`,()=>{gsap.to(s.uniforms.uHover,{value:0,duration:.8,ease:`power3.out`})})})}initEvents(){window.addEventListener(`resize`,()=>{this.renderer.setSize(window.innerWidth,window.innerHeight),this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.fov=180*(2*Math.atan(window.innerHeight/2/this.camera.position.z))/Math.PI,this.camera.updateProjectionMatrix()}),window.addEventListener(`mousemove`,e=>{this.mouse.x=e.clientX/window.innerWidth*2-1,this.mouse.y=-(e.clientY/window.innerHeight)*2+1,gsap.to(`#cursor-dot`,{x:e.clientX,y:e.clientY,duration:0}),gsap.to(`#cursor-ring`,{x:e.clientX,y:e.clientY,duration:.15})}),document.querySelectorAll(`.magnetic-btn`).forEach(e=>{e.addEventListener(`mousemove`,t=>{let n=e.getBoundingClientRect(),r=t.clientX-n.left-n.width/2,i=t.clientY-n.top-n.height/2;gsap.to(e,{x:r*.4,y:i*.4,duration:1,ease:`power3.out`}),document.body.classList.add(`cursor-active`)}),e.addEventListener(`mouseleave`,()=>{gsap.to(e,{x:0,y:0,duration:1,ease:`elastic.out(1, 0.3)`}),document.body.classList.remove(`cursor-active`)})})}render(){this.planes.forEach(e=>{let t=e.element.getBoundingClientRect();e.mesh.scale.set(t.width,t.height,1),e.mesh.position.x=t.left-window.innerWidth/2+t.width/2,e.mesh.position.y=-t.top+window.innerHeight/2-t.height/2,e.mesh.material.uniforms.uTime.value=this.clock.getElapsedTime()}),this.scene.rotation.x+=(this.mouse.y*.1-this.scene.rotation.x)*.05,this.scene.rotation.y+=(this.mouse.x*.1-this.scene.rotation.y)*.05,this.renderer.render(this.scene,this.camera),requestAnimationFrame(this.render.bind(this))}};document.addEventListener(`DOMContentLoaded`,()=>{n(),r(),new i,window.lucide&&lucide.createIcons()});