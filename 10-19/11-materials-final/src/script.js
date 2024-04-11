import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const gui = new GUI();

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load('./textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('./textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('./textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('./textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('./textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('./textures/matcaps/8.png');
const gradientTexture = textureLoader.load('./textures/gradients/5.jpg');

doorColorTexture.colorSpace = THREE.SRGBColorSpace;
matcapTexture.colorSpace = THREE.SRGBColorSpace;

const rgbeLoader = new RGBELoader();
rgbeLoader.load('./textures/environmentMap/2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
    scene.environment = environmentMap;
});

const material = new THREE.MeshPhysicalMaterial();
material.metalness = 0;
material.roughness = 0.15;

gui.add(material, 'metalness').min(0).max(1).step(0.0001);
gui.add(material, 'roughness').min(0).max(1).step(0.0001);

material.transmission = 1;
material.ior = 1.5;
material.thickness = 0.5;

gui.add(material, 'transmission').min(0).max(1).step(0.0001);
gui.add(material, 'ior').min(1).max(10).step(0.0001);
gui.add(material, 'thickness').min(0).max(1).step(0.0001);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    material
);
sphere.position.x = - 1.5;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100),
    material
);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128),
    material
);
torus.position.x = 1.5;

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
cube.position.x = -3;

const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
cone.position.x = 3;

scene.add(sphere, plane, torus, cube, cone);

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

    sphere.rotation.y = 0.1 * elapsedTime;
    plane.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;
    cube.rotation.y = 0.1 * elapsedTime;
    cone.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = - 0.15 * elapsedTime;
    plane.rotation.x = - 0.15 * elapsedTime;
    torus.rotation.x = - 0.15 * elapsedTime;
    cube.rotation.x = - 0.15 * elapsedTime;
    cone.rotation.x = - 0.15 * elapsedTime;

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
