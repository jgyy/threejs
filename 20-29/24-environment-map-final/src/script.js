import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const exrLoader = new EXRLoader();
const textureLoader = new THREE.TextureLoader();

const gui = new GUI();
const global = {};

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = global.envMapIntensity;
        }
    });
};

scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;

gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001);
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001);

global.envMapIntensity = 1;
gui.add(global, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials);

const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg');
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;

scene.background = environmentMap;

const holyDonut = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
);
holyDonut.layers.enable(1);
holyDonut.position.y = 3.5;
scene.add(holyDonut);

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.FloatType });

scene.environment = cubeRenderTarget.texture;

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, color: 0xaaaaaa })
);
torusKnot.position.x = -4;
torusKnot.position.y = 4;
scene.add(torusKnot);

gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        scene.add(gltf.scene);
        updateAllMaterials();
    }
);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.7, color: 0xff0000 })
);
sphere.position.x = 4;
sphere.position.y = 2;
scene.add(sphere);

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

    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 5, 4);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.5;
bloomPass.radius = 1;
bloomPass.threshold = 0.5;
effectComposer.addPass(bloomPass);

const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    if (holyDonut) {
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2;
        cubeCamera.update(renderer, scene);
    }

    controls.update();

    effectComposer.render();

    window.requestAnimationFrame(tick);
};

tick();
