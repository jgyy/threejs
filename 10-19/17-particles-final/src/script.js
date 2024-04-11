import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

const gui = new GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const particleTextures = [
  textureLoader.load('/textures/particles/1.png'),
  textureLoader.load('/textures/particles/2.png'),
  textureLoader.load('/textures/particles/3.png')
];

const particleTextureIndex = 0;

const particlesGeometry = new THREE.BufferGeometry();
const count = 50000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for(let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
  colors[i] = Math.random();
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial();
particlesMaterial.size = 0.1;
particlesMaterial.sizeAttenuation = true;
particlesMaterial.color = new THREE.Color('#ff88cc');
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTextures[particleTextureIndex];
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;
particlesMaterial.vertexColors = true;

gui.add({ texture: particleTextureIndex }, 'texture', { Texture1: 0, Texture2: 1, Texture3: 2 })
   .onChange(() => {
     particlesMaterial.alphaMap = particleTextures[particleTextureIndex];
   });

gui.add(particlesMaterial, 'size').min(0.01).max(1).step(0.01);
gui.addColor(particlesMaterial, 'color');

const blendingModes = {
  NoBlending: THREE.NoBlending,
  NormalBlending: THREE.NormalBlending,
  AdditiveBlending: THREE.AdditiveBlending,
  SubtractiveBlending: THREE.SubtractiveBlending,
  MultiplyBlending: THREE.MultiplyBlending
};

gui.add(particlesMaterial, 'blending', blendingModes);

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

const updateParticleColors = () => {
  const colorAttribute = particlesGeometry.getAttribute('color');
  const positions = particlesGeometry.getAttribute('position');

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = positions.array[i3];
    const y = positions.array[i3 + 1];
    const z = positions.array[i3 + 2];

    const color = new THREE.Color(
      Math.sin(x * 0.3),
      Math.cos(y * 0.2),
      Math.sin(z * 0.1)
    );

    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }

  colorAttribute.needsUpdate = true;
};

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  for(let i = 0; i < count; i++) {
    let i3 = i * 3;
    const x = particlesGeometry.attributes.position.array[i3];
    const y = particlesGeometry.attributes.position.array[i3 + 1];
    const z = particlesGeometry.attributes.position.array[i3 + 2];

    particlesGeometry.attributes.position.array[i3] = x * Math.sin(elapsedTime * 0.1);
    particlesGeometry.attributes.position.array[i3 + 1] = y * Math.cos(elapsedTime * 0.2);
    particlesGeometry.attributes.position.array[i3 + 2] = z * Math.sin(elapsedTime * 0.3);
  }

  particlesGeometry.attributes.position.needsUpdate = true;

  updateParticleColors();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
