import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import GUI from 'lil-gui';

const gui = new GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load('textures/matcaps/8.png');
matcapTexture.colorSpace = THREE.SRGBColorSpace;

const fontLoader = new FontLoader();
fontLoader.load(
  '/fonts/helvetiker_regular.typeface.json',
  (font) => {
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });

    const textGeometry = new TextGeometry(
      'Bruno Simon',
      {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      }
    );
    textGeometry.center();
    const text = new THREE.Mesh(textGeometry, material);
    scene.add(text);

    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64);
    for (let i = 0; i < 100; i++) {
      const donut = new THREE.Mesh(donutGeometry, material);
      donut.position.x = (Math.random() - 0.5) * 10;
      donut.position.y = (Math.random() - 0.5) * 10;
      donut.position.z = (Math.random() - 0.5) * 10;
      donut.rotation.x = Math.random() * Math.PI;
      donut.rotation.y = Math.random() * Math.PI;
      const scale = Math.random();
      donut.scale.set(scale, scale, scale);
      scene.add(donut);
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    window.addEventListener('click', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        intersectedObject.material.color.set(0xff0000);
      }
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide
    });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    gui.add(directionalLight, 'intensity').min(0).max(1).step(0.1);
    gui.addColor(floor.material, 'color');
    gui.add(text.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.1);
    gui.add(text.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.1);
    gui.add(text.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.1);
  }
);

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
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
