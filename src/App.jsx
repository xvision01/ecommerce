import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

const EARTH_RADIUS = 1;

function project([longitude, latitude], radius = EARTH_RADIUS) {
  const phi = (90 - latitude) * Math.PI / 180;
  const theta = (longitude + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function addRing(lineGroup, coordinates, radius = 1.012) {
  if (coordinates.length < 2) return;
  const points = coordinates.map((coordinate) => project(coordinate, radius));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0x8dc5ff, transparent: true, opacity: 0.8 })
  );
  lineGroup.add(line);
}

function drawPolygonRings(group, geometry) {
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach((ring) => addRing(group, ring));
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon) => polygon.forEach((ring) => addRing(group, ring)));
  }
}

export default function App() {
  const mountRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

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

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0x1e5db8, roughness: 0.8, metalness: 0.05 })
    );
    globeGroup.add(globe);

    const countries = feature(world, world.objects.countries);
    const boundaries = new THREE.Group();
    countries.features.forEach((country) => drawPolygonRings(boundaries, country.geometry));
    globeGroup.add(boundaries);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.035, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x4ca6ff, transparent: true, opacity: 0.12, side: THREE.BackSide })
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
      globeGroup.rotation.y += dx * 0.005;
      globeGroup.rotation.x = THREE.MathUtils.clamp(globeGroup.rotation.x + dy * 0.005, -Math.PI / 2, Math.PI / 2);
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerUp = (event) => {
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
    };

    const onWheel = (event) => {
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.0015, 1.7, 5);
    };

    const onClick = (event) => {
      if (dragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObject(globe)[0];
      if (!hit) return;

      const point = hit.point.clone().applyMatrix4(globeGroup.matrixWorld.clone().invert());
      const latitude = 90 - Math.acos(point.y / EARTH_RADIUS) * 180 / Math.PI;
      const longitude = ((Math.atan2(point.z, -point.x) * 180 / Math.PI) + 540) % 360 - 180;
      const nearest = countries.features.reduce((best, country) => {
        const center = country.properties?.name ? country.properties.name : 'Unknown country';
        const coords = country.geometry.coordinates.flat(Infinity);
        const sample = coords[0];
        if (!Array.isArray(sample)) return best;
        const distance = Math.hypot(sample[0] - longitude, sample[1] - latitude);
        return distance < best.distance ? { name: center, distance } : best;
      }, { name: 'Selected location', distance: Infinity });

      setSelectedCountry({ name: nearest.name, latitude: latitude.toFixed(2), longitude: longitude.toFixed(2) });
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
    renderer.domElement.addEventListener('click', onClick);
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
      renderer.domElement.removeEventListener('click', onClick);
      globe.geometry.dispose();
      globe.material.dispose();
      atmosphere.geometry.dispose();
      atmosphere.material.dispose();
      boundaries.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
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
        <p className="hint">Drag to rotate · Scroll to zoom · Click the globe</p>
      </header>
      {selectedCountry && (
        <aside className="country-card">
          <p className="eyebrow">SELECTED LOCATION</p>
          <h2>{selectedCountry.name}</h2>
          <p>Latitude: {selectedCountry.latitude}°</p>
          <p>Longitude: {selectedCountry.longitude}°</p>
        </aside>
      )}
      <section ref={mountRef} className="globe" aria-label="Interactive 3D Earth globe" />
    </main>
  );
}
