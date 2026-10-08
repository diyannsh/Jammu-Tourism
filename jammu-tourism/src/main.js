import './style.css';
import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';

// 1. SAFE KINETIC TYPOGRAPHY (Preserves words and spaces)
function initTypography() {
  document.querySelectorAll('.kinetic-text').forEach(title => {
    const text = title.textContent.trim();
    title.innerHTML = '';
    
    text.split(' ').forEach(word => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.marginRight = '0.3em'; // Real CSS spacing between words
      
      word.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.style.display = 'inline-block';
        charSpan.style.opacity = '0';
        charSpan.style.transform = 'translateY(110%) rotateX(-40deg)';
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });
      title.appendChild(wordSpan);
    });
    
    gsap.to(title.querySelectorAll('.char'), {
      y: '0%', rotateX: 0, opacity: 1, duration: 1, stagger: 0.03, ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 85%' }
    });
  });

  // Smooth fade for the complex Hero title
  gsap.fromTo('#hero-title', 
    { y: 40, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out', delay: 0.2 }
  );
}

// 2. ORIGINAL TOPOGRAPHY WIREFRAME (Restored)
function initTopography() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, -6, 4.5);
  camera.lookAt(0, 0, 0);

  const geometry = new THREE.PlaneGeometry(16, 12, 48, 36);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i), v = pos.getY(i);
    pos.setZ(i, Math.sin(u * 0.7) * Math.cos(v * 0.8) * 1.1 + Math.sin(u * 1.5 + v * 0.9) * 0.45);
  }
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x9fa6ab, wireframe: true, transparent: true, opacity: 0.22 }));
  scene.add(mesh);

  const clock = new THREE.Clock();
  
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function animate() {
    mesh.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

// 3. THE DOM-TO-WEBGL PLANE ENGINE
class WebGLApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.images = [...document.querySelectorAll('.webgl-image')];
    this.planes = [];
    this.mouse = new THREE.Vector2(0, 0);
    this.clock = new THREE.Clock();
    
    this.initLenis();
    this.initThree();
    this.createPlanes();
    this.initEvents();
    this.render();
  }

  initLenis() {
    this.lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { this.lenis.raf(time * 1000); });
  }

  initThree() {
    this.scene = new THREE.Scene();
    const perspective = 800;
    const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
    
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.z = perspective;
    
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  createPlanes() {
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const textureLoader = new THREE.TextureLoader();

    this.images.forEach((imgDOM) => {
      const src = imgDOM.getAttribute('data-src');
      const texture = textureLoader.load(src);
      
      const material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uHover: { value: 0.0 },
          uTime: { value: 0.0 }
        }
      });

      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      this.planes.push({ mesh, element: imgDOM });

      imgDOM.parentElement.addEventListener('mouseenter', () => {
        gsap.to(material.uniforms.uHover, { value: 1, duration: 0.8, ease: 'power3.out' });
      });
      imgDOM.parentElement.addEventListener('mouseleave', () => {
        gsap.to(material.uniforms.uHover, { value: 0, duration: 0.8, ease: 'power3.out' });
      });
    });
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.fov = (180 * (2 * Math.atan(window.innerHeight / 2 / this.camera.position.z))) / Math.PI;
      this.camera.updateProjectionMatrix();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      gsap.to('#cursor-dot', { x: e.clientX, y: e.clientY, duration: 0 });
      gsap.to('#cursor-ring', { x: e.clientX, y: e.clientY, duration: 0.15 });
    });

    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 1, ease: "power3.out" });
        document.body.classList.add('cursor-active');
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        document.body.classList.remove('cursor-active');
      });
    });
  }

  render() {
    this.planes.forEach((plane) => {
      const rect = plane.element.getBoundingClientRect();
      plane.mesh.scale.set(rect.width, rect.height, 1);
      plane.mesh.position.x = rect.left - window.innerWidth / 2 + rect.width / 2;
      plane.mesh.position.y = -rect.top + window.innerHeight / 2 - rect.height / 2;
      plane.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();
    });

    this.scene.rotation.x += (this.mouse.y * 0.1 - this.scene.rotation.x) * 0.05;
    this.scene.rotation.y += (this.mouse.x * 0.1 - this.scene.rotation.y) * 0.05;
    
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTypography();
  initTopography();
  new WebGLApp();
  if (window.lucide) lucide.createIcons();
});