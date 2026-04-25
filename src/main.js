import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/renderers/CSS2DRenderer.js';

const app = document.querySelector('#app');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 130, 260);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
app.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 40;
controls.maxDistance = 700;

scene.add(new THREE.AmbientLight(0xffffff, 0.16));

const pointLight = new THREE.PointLight(0xfff1b8, 2.4, 2000, 1.4);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const textureLoader = new THREE.TextureLoader();

const textureUrls = {
  sun: 'https://threejs.org/examples/textures/planets/sun.jpg',
  mercury: 'https://threejs.org/examples/textures/planets/mercury.jpg',
  venus: 'https://threejs.org/examples/textures/planets/venus.jpg',
  earth: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  mars: 'https://threejs.org/examples/textures/planets/mars_1k_color.jpg',
  jupiter: 'https://threejs.org/examples/textures/planets/jupiter.jpg',
  saturn: 'https://threejs.org/examples/textures/planets/saturn.jpg',
  uranus: 'https://threejs.org/examples/textures/planets/uranus.jpg',
  neptune: 'https://threejs.org/examples/textures/planets/neptune.jpg',
  starfield: 'https://threejs.org/examples/textures/planets/starfield.jpg',
};

const textures = Object.fromEntries(
  Object.entries(textureUrls).map(([name, url]) => [name, textureLoader.load(url)])
);

const starSphere = new THREE.Mesh(
  new THREE.SphereGeometry(1000, 64, 64),
  new THREE.MeshBasicMaterial({ map: textures.starfield, side: THREE.BackSide })
);
scene.add(starSphere);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(14, 64, 64),
  new THREE.MeshStandardMaterial({
    map: textures.sun,
    emissive: new THREE.Color('#ffb347'),
    emissiveIntensity: 1.2,
  })
);
scene.add(sun);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(18, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0xffc56b,
    transparent: true,
    opacity: 0.18,
  })
);
scene.add(sunGlow);

const planetConfigs = [
  { name: '수성', key: 'mercury', radius: 2, distance: 26, orbitPeriod: 88, rotationPeriod: 58.6, color: '#bbb0a3' },
  { name: '금성', key: 'venus', radius: 3.3, distance: 34, orbitPeriod: 225, rotationPeriod: -243, color: '#d4b684' },
  { name: '지구', key: 'earth', radius: 3.8, distance: 44, orbitPeriod: 365, rotationPeriod: 1, color: '#5ca9ff', emphasize: true },
  { name: '화성', key: 'mars', radius: 2.8, distance: 56, orbitPeriod: 687, rotationPeriod: 1.03, color: '#c15a34' },
  { name: '목성', key: 'jupiter', radius: 8.8, distance: 74, orbitPeriod: 4333, rotationPeriod: 0.41, color: '#d8b59a' },
  { name: '토성', key: 'saturn', radius: 7.6, distance: 96, orbitPeriod: 10759, rotationPeriod: 0.45, color: '#d7c49b' },
  { name: '천왕성', key: 'uranus', radius: 5.4, distance: 118, orbitPeriod: 30687, rotationPeriod: -0.72, color: '#9ccad8' },
  { name: '해왕성', key: 'neptune', radius: 5.2, distance: 140, orbitPeriod: 60190, rotationPeriod: 0.67, color: '#446dcb' },
];

const DAYS_PER_SECOND = 26;
const planetSystems = [];

function createOrbitLine(distance, color) {
  const points = [];
  const segments = 192;
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 });
  return new THREE.LineLoop(geometry, material);
}

for (const config of planetConfigs) {
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(config.radius, 48, 48),
    new THREE.MeshStandardMaterial({ map: textures[config.key], color: new THREE.Color(config.color) })
  );

  mesh.position.x = config.distance;

  if (config.key === 'saturn') {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(config.radius * 1.3, config.radius * 2.1, 64),
      new THREE.MeshStandardMaterial({ color: 0xcab88f, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);
  }

  if (config.emphasize) {
    mesh.scale.setScalar(1.17);
    mesh.material.emissive = new THREE.Color('#1b4d99');
    mesh.material.emissiveIntensity = 0.45;
  }

  orbitGroup.add(mesh);

  const orbitLine = createOrbitLine(config.distance, config.emphasize ? '#5ca9ff' : '#7380a8');
  scene.add(orbitLine);

  const labelDiv = document.createElement('div');
  labelDiv.className = `planet-label${config.emphasize ? ' earth' : ''}`;
  labelDiv.textContent = config.name;
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, config.radius * 1.8, 0);
  mesh.add(label);

  planetSystems.push({ ...config, orbitGroup, mesh });
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const simulatedDays = delta * DAYS_PER_SECOND;

  sun.rotation.y += delta * 0.2;

  for (const planet of planetSystems) {
    const orbitDelta = (simulatedDays / planet.orbitPeriod) * Math.PI * 2;
    const spinDelta = (simulatedDays / planet.rotationPeriod) * Math.PI * 2;

    planet.orbitGroup.rotation.y += orbitDelta;
    planet.mesh.rotation.y += spinDelta;
  }

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}

window.addEventListener('resize', onResize);
