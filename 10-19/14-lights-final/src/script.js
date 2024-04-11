import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

const gui = new GUI();

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
directionalLight.position.set(1, 0.25, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 3);
scene.add(hemisphereLight);

const pointLight = new THREE.PointLight(0xff9000, 1.5);
pointLight.position.set(1, - 0.5, 1);
pointLight.castShadow = true;
scene.add(pointLight);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
rectAreaLight.position.set(- 1.5, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
spotLight.target.position.x = - 0.75;
spotLight.castShadow = true;
scene.add(spotLight);

spotLight.target.position.x = - 0.75;
scene.add(spotLight.target);

const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
);
sphere.position.x = - 1.5;
sphere.castShadow = true;

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
);
cube.castShadow = true;

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
);
torus.position.x = 1.5;
torus.castShadow = true;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
);
plane.rotation.x = - Math.PI * 0.5;
plane.position.y = - 0.65;
plane.receiveShadow = true;

const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1, 32),
    material
);
cylinder.position.x = -2.5;
cylinder.position.y = 0.5;
cylinder.castShadow = true;

scene.add(sphere, cube, torus, plane, cylinder);

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
renderer.shadowMap.enabled = true;

const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    sphere.rotation.y = 0.1 * elapsedTime;
    cube.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    cube.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;
    
    cylinder.rotation.x = 0.1 * elapsedTime;
    cylinder.rotation.y = 0.15 * elapsedTime;

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
