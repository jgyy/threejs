import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const group = new THREE.Group();
scene.add(group);

const geometry1 = new THREE.BoxGeometry(1, 1, 1);
const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh1 = new THREE.Mesh(geometry1, material1);
group.add(mesh1);

const geometry2 = new THREE.SphereGeometry(0.7, 32, 32);
const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh2 = new THREE.Mesh(geometry2, material2);
mesh2.position.set(2, 0, 0);
group.add(mesh2);

const geometry3 = new THREE.ConeGeometry(0.5, 1.5, 32);
const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const mesh3 = new THREE.Mesh(geometry3, material3);
mesh3.position.set(-2, 0, 0);
group.add(mesh3);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

gsap.to(group.rotation, { duration: 5, delay: 1, y: Math.PI * 2, repeat: -1, ease: 'power1.inOut' });

const tick = () => {
    controls.update();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
