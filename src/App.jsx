import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function App() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x2d6cdf,
        roughness: 0.75,
        metalness: 0.05,
      })
    );
    scene.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.035, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4ca6ff,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      })
    );
    scene.add(atmosphere);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(4, 2, 5);
    scene.add(sun);

    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    const onPointerDown = (event) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!dragging) return;
      const dx = event.clientX - previousX;
      const dy = event.clientY - previousY;
      globe.rotation.y += dx * 0.005;
      globe.rotation.x += dy * 0.005;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x, -Math.PI / 2, Math.PI / 2);
      atmosphere.rotation.copy(globe.rotation);
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerUp = (event) => {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };

    const onWheel = (event) => {
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.0015, 1.7, 5);
    };

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('resize', onResize);

    let animationFrame;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      globe.geometry.dispose();
      globe.material.dispose();
      atmosphere.geometry.dispose();
      atmosphere.material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <main className="earth-app">
      <header className="earth-header">
        <div>
          <p className="eyebrow">EARTH EXPLORER</p>
          <h1>Explore our planet.</h1>
        </div>
        <p className="hint">Drag to rotate · Scroll to zoom</p>
      </header>
      <section ref={mountRef} className="globe" aria-label="Interactive 3D Earth globe" />
    </main>
  );
}
