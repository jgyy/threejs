import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();

const gui = new GUI();
const global = {};

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh && child.material.isMeshStandardMaterial)
        {
            child.material.envMapIntensity = global.envMapIntensity;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
};

global.envMapIntensity = 1;
gui
    .add(global, 'envMapIntensity')
    .min(0)
    .max(10)
    .step(0.001)
    .onChange(updateAllMaterials);

rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
    scene.environment = environmentMap;
});

const directionalLight = new THREE.DirectionalLight('#ffffff', 6);
directionalLight.position.set(- 4, 6.5, 2.5);
scene.add(directionalLight);

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity');
gui.add(directionalLight.position, 'x').min(- 10).max(10).step(0.001).name('lightX');
gui.add(directionalLight.position, 'y').min(- 10).max(10).step(0.001).name('lightY');
gui.add(directionalLight.position, 'z').min(- 10).max(10).step(0.001).name('lightZ');

directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.027;
directionalLight.shadow.bias = - 0.004;
directionalLight.shadow.mapSize.set(512, 512);

gui.add(directionalLight, 'castShadow');
gui.add(directionalLight.shadow, 'normalBias').min(- 0.05).max(0.05).step(0.001);
gui.add(directionalLight.shadow, 'bias').min(- 0.05).max(0.05).step(0.001);

directionalLight.target.position.set(0, 4, 0);
directionalLight.target.updateWorldMatrix();

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);

gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(10, 10, 10);
        scene.add(gltf.scene);
        updateAllMaterials();
    }
);

gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.4, 0.4, 0.4);
        gltf.scene.position.set(0, 2.5, 0);
        scene.add(gltf.scene);
        updateAllMaterials();
    }
);

const floorColorTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg');
const floorNormalTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png');
const floorAORoughnessMetalnessTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg');
floorColorTexture.colorSpace = THREE.SRGBColorSpace;

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        aoMap: floorAORoughnessMetalnessTexture,
        roughnessMap: floorAORoughnessMetalnessTexture,
        metalnessMap: floorAORoughnessMetalnessTexture,
    })
);
floor.rotation.x = - Math.PI * 0.5;
scene.add(floor);

const wallColorTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg');
const wallNormalTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png');
const wallAORoughnessMetalnessTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg');
wallColorTexture.colorSpace = THREE.SRGBColorSpace;

const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        aoMap: wallAORoughnessMetalnessTexture,
        roughnessMap: wallAORoughnessMetalnessTexture,
        metalnessMap: wallAORoughnessMetalnessTexture,
    })
);
wall.position.y = 4;
wall.position.z = - 4;
scene.add(wall);

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
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 5, 4);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
});
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.2;
bloomPass.radius = 1;
bloomPass.threshold = 0.6;
composer.addPass(bloomPass);

const tick = () =>
{
    controls.update();
    composer.render();
    window.requestAnimationFrame(tick);
};

tick();
