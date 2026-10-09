import * as THREE from 'three';
import gsap from 'gsap';
import CustomMaterial from './CustomMaterial.js';
import { scroll } from '../core/Scroll.js';

export default class MediaPlane {
  constructor({ element, scene, texture = null }) {
    this.element = element;
    this.scene = scene;
    this.observer = null;

    this.geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    // Expand bounding sphere so velocity vertex arching doesn't trigger false clipping
    this.geometry.computeBoundingSphere();
    if (this.geometry.boundingSphere) {
      this.geometry.boundingSphere.radius *= 2.5;
    }

    this.material = new CustomMaterial(texture);
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
    this.updateBounds();
    this.addInteractions();
    this.initObserver();
  }

  initObserver() {
    if (!this.element) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.mesh.visible = entry.isIntersecting;
        });
      },
      {
        rootMargin: '200px 0px 200px 0px'
      }
    );

    this.observer.observe(this.element);
  }

  addInteractions() {
    if (!this.element) return;

    this.element.addEventListener('mouseenter', () => {
      gsap.to(this.material.uniforms.uHover, {
        value: 1.0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });

    this.element.addEventListener('mouseleave', () => {
      gsap.to(this.material.uniforms.uHover, {
        value: 0.0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }

  updateBounds() {
    if (!this.element) return;
    const rect = this.element.getBoundingClientRect();

    this.mesh.scale.set(rect.width, rect.height, 1);

    const docTop = rect.top + scroll.y;
    const docLeft = rect.left;

    const x = docLeft - window.innerWidth / 2 + rect.width / 2;
    const y = window.innerHeight / 2 - docTop - rect.height / 2;

    this.mesh.position.set(x, y, 0);
  }

  resize() {
    this.updateBounds();
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}