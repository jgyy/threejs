import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

const canvas = document.querySelector('canvas.webgl');

if (!canvas) {
  console.error('Could not find canvas element');
  exit(1);
}

const sceneConfig = {
  sizes: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 100,
  },
};

const scene = new THREE.Scene();

const createCube = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.5,
    metalness: 0.5,
  });
  return new THREE.Mesh(geometry, material);
};

const cube = createCube();
scene.add(cube);

const camera = new THREE.PerspectiveCamera(
  sceneConfig.camera.fov,
  sceneConfig.sizes.width / sceneConfig.sizes.height,
  sceneConfig.camera.near,
  sceneConfig.camera.far
);
camera.position.z = 3;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sceneConfig.sizes.width, sceneConfig.sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const setLights = () => {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
};

setLights();

window.addEventListener('resize', () => {
  sceneConfig.sizes.width = window.innerWidth;
  sceneConfig.sizes.height = window.innerHeight;
  camera.aspect = sceneConfig.sizes.width / sceneConfig.sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sceneConfig.sizes.width, sceneConfig.sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let rotationEnabled = true;
let rotationSpeed = 1;

const gui = new dat.GUI();
const cubeFolder = gui.addFolder('Cube');
cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2);
cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2);
cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2);
cubeFolder.open();
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'z', 1, 10);
cameraFolder.open();

const clock = new THREE.Clock();

const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  controls.update();

  if (rotationEnabled) {
    cube.rotation.y += rotationSpeed * 0.01;
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'Space':
      rotationEnabled = !rotationEnabled;
      break;
    case 'ArrowUp':
      rotationSpeed += 0.1;
      break;
    case 'ArrowDown':
      rotationSpeed -= 0.1;
      break;
    case 'KeyW':
      cube.material.wireframe = !cube.material.wireframe;
      break;
    case 'KeyC':
      const randomColor = Math.random() * 0xffffff;
      cube.material.color.setHex(randomColor);
      break;
  }
});
