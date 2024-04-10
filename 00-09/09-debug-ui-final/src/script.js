import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import GUI from 'lil-gui';

const gui = new GUI({
  width: 300,
  title: 'Nice debug UI',
  closeFolders: false
});

window.addEventListener('keydown', (event) => {
  if (event.key == 'h')
    gui.show(gui._hidden);
});

const debugObject = {};

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

debugObject.color = '#a778d8';

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: '#a778d8' });
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cubeMesh);

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000' });
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.set(2, 0, 0);
scene.add(sphereMesh);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight('#ffffff', 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  'path/to/model.gltf',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    model.position.set(-2, 0, 0);
    scene.add(model);
  },
  (progress) => {
    console.log(`Loading ${(progress.loaded / progress.total) * 100}%`);
  },
  (error) => {
    console.error('Error loading model:', error);
  }
);

const cubeTweaks = gui.addFolder('Awesome cube');
cubeTweaks
  .add(cubeMesh.position, 'y')
  .min(-3)
  .max(3)
  .step(0.01)
  .name('elevation');
cubeTweaks.add(cubeMesh, 'visible');
cubeTweaks.addColor(debugObject, 'color').onChange(() => {
  cubeMaterial.color.set(debugObject.color);
});

const sphereTweaks = gui.addFolder('Sphere');
sphereTweaks.add(sphereMesh.position, 'x').min(-5).max(5).step(0.1);
sphereTweaks.add(sphereMesh.scale, 'x').min(0.1).max(2).step(0.1).name('scale');

debugObject.spin = () => {
  gsap.to(cubeMesh.rotation, { duration: 1, y: cubeMesh.rotation.y + Math.PI * 2 });
};
cubeTweaks.add(debugObject, 'spin');

debugObject.subdivision = 2;
cubeTweaks
    .add(debugObject, 'subdivision')
    .min(1)
    .max(20)
    .step(1)
    .onFinishChange(() =>
    {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(
            1, 1, 1,
            debugObject.subdivision, debugObject.subdivision, debugObject.subdivision
        );
    });

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
}

tick();
