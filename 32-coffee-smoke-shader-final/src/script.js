import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import coffeeSmokeVertexShader from './shaders/coffeeSmoke/vertex.glsl';
import coffeeSmokeFragmentShader from './shaders/coffeeSmoke/fragment.glsl';

// Setup
const gui = new GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.set(8, 10, 12);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3;
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Load GLTF model
const loadModel = () => {
  gltfLoader.load(
    './bakedModel.glb',
    (gltf) => {
      gltf.scene.getObjectByName('baked').material.map.anisotropy = 8;
      scene.add(gltf.scene);
    }
  );
};

// Create smoke
const createSmoke = () => {
  const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
  smokeGeometry.translate(0, 0.5, 0);
  smokeGeometry.scale(1.5, 6, 1.5);

  const perlinTexture = textureLoader.load('./perlin.png');
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: coffeeSmokeVertexShader,
    fragmentShader: coffeeSmokeFragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uPerlinTexture: new THREE.Uniform(perlinTexture)
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false
  });

  const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
  smoke.position.y = 1.83;
  scene.add(smoke);

  return smokeMaterial;
};

// Resize handler
const onResize = () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

// Animation loop
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  smokeMaterial.uniforms.uTime.value = elapsedTime;
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

// Event listeners
window.addEventListener('resize', onResize);

// Initialize
const smokeMaterial = createSmoke();
loadModel();
tick();
