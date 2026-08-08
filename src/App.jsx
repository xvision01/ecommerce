import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

const COUNTRY_FACTS = {
  356: { name: 'India', capital: 'New Delhi', continent: 'Asia', population: '1.46 billion', area: '3.29 million km²', currency: 'Indian Rupee (INR)', languages: 'Hindi, English and many regional languages', flag: '🇮🇳', fact: 'India is the world’s most populous country and is home to one of the oldest continuous civilizations.' },
  840: { name: 'United States', capital: 'Washington, D.C.', continent: 'North America', population: '347 million', area: '9.83 million km²', currency: 'US Dollar (USD)', languages: 'English is the most widely spoken', flag: '🇺🇸', fact: 'The United States spans six time zones across its states and territories.' },
  826: { name: 'United Kingdom', capital: 'London', continent: 'Europe', population: '69 million', area: '243,610 km²', currency: 'Pound sterling (GBP)', languages: 'English and regional languages', flag: '🇬🇧', fact: 'The United Kingdom is made up of England, Scotland, Wales and Northern Ireland.' },
  250: { name: 'France', capital: 'Paris', continent: 'Europe', population: '68 million', area: '551,695 km²', currency: 'Euro (EUR)', languages: 'French', flag: '🇫🇷', fact: 'France is the largest country in the European Union by area.' },
  276: { name: 'Germany', capital: 'Berlin', continent: 'Europe', population: '84 million', area: '357,022 km²', currency: 'Euro (EUR)', languages: 'German', flag: '🇩🇪', fact: 'Germany is Europe’s largest economy and consists of 16 federal states.' },
  392: { name: 'Japan', capital: 'Tokyo', continent: 'Asia', population: '123 million', area: '377,975 km²', currency: 'Japanese Yen (JPY)', languages: 'Japanese', flag: '🇯🇵', fact: 'Japan is an island country made up of thousands of islands, with four main islands.' },
  156: { name: 'China', capital: 'Beijing', continent: 'Asia', population: '1.41 billion', area: '9.60 million km²', currency: 'Renminbi (CNY)', languages: 'Mandarin and other Chinese languages', flag: '🇨🇳', fact: 'China has the world’s largest high-speed rail network.' },
  076: { name: 'Brazil', capital: 'Brasília', continent: 'South America', population: '212 million', area: '8.52 million km²', currency: 'Brazilian Real (BRL)', languages: 'Portuguese', flag: '🇧🇷', fact: 'Brazil contains most of the Amazon rainforest and is the largest country in South America.' },
  036: { name: 'Australia', capital: 'Canberra', continent: 'Oceania', population: '27 million', area: '7.69 million km²', currency: 'Australian Dollar (AUD)', languages: 'English is the most widely spoken', flag: '🇦🇺', fact: 'Australia is the world’s smallest continent and one of the largest countries by area.' },
  124: { name: 'Canada', capital: 'Ottawa', continent: 'North America', population: '41 million', area: '9.98 million km²', currency: 'Canadian Dollar (CAD)', languages: 'English and French', flag: '🇨🇦', fact: 'Canada has the longest coastline of any country in the world.' },
  643: { name: 'Russia', capital: 'Moscow', continent: 'Europe / Asia', population: '144 million', area: '17.10 million km²', currency: 'Russian Ruble (RUB)', languages: 'Russian', flag: '🇷🇺', fact: 'Russia is the world’s largest country by land area and stretches across 11 time zones.' },
  710: { name: 'South Africa', capital: 'Pretoria', continent: 'Africa', population: '63 million', area: '1.22 million km²', currency: 'South African Rand (ZAR)', languages: '11 official languages', flag: '🇿🇦', fact: 'South Africa has three capital cities: Pretoria, Cape Town and Bloemfontein.' },
  818: { name: 'Egypt', capital: 'Cairo', continent: 'Africa', population: '118 million', area: '1.01 million km²', currency: 'Egyptian Pound (EGP)', languages: 'Arabic', flag: '🇪🇬', fact: 'Ancient Egypt developed along the Nile, one of the world’s great river civilizations.' },
  380: { name: 'Italy', capital: 'Rome', continent: 'Europe', population: '59 million', area: '301,340 km²', currency: 'Euro (EUR)', languages: 'Italian', flag: '🇮🇹', fact: 'Italy has more UNESCO World Heritage Sites than any other country.' },
  724: { name: 'Spain', capital: 'Madrid', continent: 'Europe', population: '49 million', area: '505,990 km²', currency: 'Euro (EUR)', languages: 'Spanish and regional languages', flag: '🇪🇸', fact: 'Spain occupies most of the Iberian Peninsula and includes many islands and autonomous territories.' },
};

const fallbackFacts = (id) => ({
  name: `Country ${id}`,
  capital: 'Select for details',
  continent: 'World',
  population: 'Fact database entry coming soon',
  area: 'Fact database entry coming soon',
  currency: 'Fact database entry coming soon',
  languages: 'Fact database entry coming soon',
  flag: '🌍',
  fact: 'This country is represented on the interactive globe. More country facts can be added to the data set.'
});

export default function App() {
  const mountRef = useRef(null);
  const globeRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const mount = mountRef.current;
    const countries = feature(world, world.objects.countries).features;
    const globe = new ThreeGlobe()
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#4ca6ff')
      .atmosphereAltitude(0.16)
      .polygonsData(countries)
      .polygonAltitude(0.006)
      .polygonCapColor(() => 'rgba(20, 100, 180, 0.05)')
      .polygonSideColor(() => 'rgba(50, 150, 255, 0.12)')
      .polygonStrokeColor(() => 'rgba(150, 210, 255, 0.65)')
      .polygonLabel((d) => `<b>${COUNTRY_FACTS[d.id]?.name || `Country ${d.id}`}</b>`)
      .onPolygonClick((country) => {
        const facts = COUNTRY_FACTS[country.id] || fallbackFacts(country.id);
        setSelected(facts);
      });

    globeRef.current = globe;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02050d);
    scene.add(globe);

    const camera = new THREE.PerspectiveCamera(35, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 120;
    controls.maxDistance = 420;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.7;
    controls.enablePan = false;

    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(100, 80, 150);
    scene.add(keyLight);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      globe.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    };
  }, []);

  const chooseSearchResult = (country) => {
    const facts = COUNTRY_FACTS[country.id] || fallbackFacts(country.id);
    setSelected(facts);
    const globe = globeRef.current;
    if (globe) globe.pointOfView({ lat: 20, lng: 0, altitude: 2.0 }, 900);
  };

  const results = Object.entries(COUNTRY_FACTS)
    .filter(([, facts]) => facts.name.toLowerCase().includes(search.toLowerCase()))
    .map(([id, facts]) => ({ id, ...facts }))
    .slice(0, 7);

  return (
    <main className="earth-app">
      <header className="earth-header">
        <div>
          <p className="eyebrow">EARTH EXPLORER</p>
          <h1>Explore our planet.</h1>
          <p className="subtitle">Rotate the globe. Discover a country. Learn something new.</p>
        </div>
        <div className="search-wrap">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a country..." aria-label="Search a country" />
          {search && results.length > 0 && (
            <div className="search-results">
              {results.map((country) => <button key={country.id} onClick={() => chooseSearchResult(country)}>{country.flag} {country.name}</button>)}
            </div>
          )}
        </div>
      </header>

      <section ref={mountRef} className="globe" aria-label="Interactive 3D Earth" />

      <div className="controls-hint">Drag to rotate · Scroll to zoom · Click a country</div>

      {selected && (
        <aside className="country-card">
          <button className="close" onClick={() => setSelected(null)} aria-label="Close country information">×</button>
          <div className="country-title"><span className="flag">{selected.flag}</span><div><p className="eyebrow">COUNTRY</p><h2>{selected.name}</h2></div></div>
          <div className="facts-grid">
            <div><span>Capital</span><strong>{selected.capital}</strong></div>
            <div><span>Continent</span><strong>{selected.continent}</strong></div>
            <div><span>Population</span><strong>{selected.population}</strong></div>
            <div><span>Area</span><strong>{selected.area}</strong></div>
            <div><span>Currency</span><strong>{selected.currency}</strong></div>
            <div><span>Languages</span><strong>{selected.languages}</strong></div>
          </div>
          <div className="fact"><span>Did you know?</span><p>{selected.fact}</p></div>
        </aside>
      )}
    </main>
  );
}
