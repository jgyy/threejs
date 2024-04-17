import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import * as CANNON from 'cannon-es';

const gui = new GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const fbxLoader = new FBXLoader();
const objLoader = new OBJLoader();

let mixer = null;

gltfLoader.load(
  '/models/Fox/glTF/Fox.gltf',
  (gltf) => {
    gltf.scene.scale.set(0.025, 0.025, 0.025);
    scene.add(gltf.scene);

    mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[2]);
    action.play();
  }
);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0,
    roughness: 0.5
  })
);
floor.receiveShadow = true;
floor.rotation.x = - Math.PI * 0.5;
scene.add(floor);

const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = - 7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = - 7;
directionalLight.position.set(- 5, 5, 0);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(5, 5, 5);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.05;
spotLight.decay = 2;
spotLight.distance = 200;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 10;
spotLight.shadow.camera.far = 200;
spotLight.shadow.focus = 1;
scene.add(spotLight);

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
  composer.setSize(sizes.width, sizes.height);
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 2, 2);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new BloomPass(
  1, // strength
  25, // kernelSize
  4, // sigma
  256 // resolution
);
composer.addPass(bloomPass);

const fxaaPass = new ShaderPass(FXAAShader);
composer.addPass(fxaaPass);

const physicsWorld = new CANNON.World();
physicsWorld.gravity.set(0, -9.82, 0);

const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7
  }
);
physicsWorld.defaultContactMaterial = defaultContactMaterial;

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0, // make the floor static
  shape: floorShape,
  material: defaultMaterial
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // rotate the floor
physicsWorld.addBody(floorBody);

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (mixer) {
    mixer.update(deltaTime);
  }

  controls.update();

  physicsWorld.step(1 / 60, deltaTime, 3);

  composer.render();

  window.requestAnimationFrame(tick);
};

tick();
