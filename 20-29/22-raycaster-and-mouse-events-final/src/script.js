import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

const gui = new GUI();

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);
object1.position.x = - 2;

const object2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: '#00ff00' })
);

const object3 = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.MeshLambertMaterial({ color: '#0000ff' })
);
object3.position.x = 2;

scene.add(object1, object2, object3);

const raycaster = new THREE.Raycaster();
let currentIntersect = null;
const rayOrigin = new THREE.Vector3(- 3, 0, 0);
const rayDirection = new THREE.Vector3(10, 0, 0);
rayDirection.normalize();

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

const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener('click', () => {
    if (currentIntersect) {
        switch (currentIntersect.object) {
            case object1:
                object1.material.color.set('#ffffff');
                break;
            case object2:
                object2.scale.set(1.5, 1.5, 1.5);
                break;
            case object3:
                object3.rotation.y += Math.PI / 4;
                break;
        }
    }
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

const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 2.1);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();

let model = null;
gltfLoader.load(
    './models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        model = gltf.scene;
        model.position.y = - 1.2;
        scene.add(model);
    }
);

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [object1, object2, object3];
    const intersects = raycaster.intersectObjects(objectsToTest);

    if (intersects.length) {
        if (!currentIntersect) {
            console.log('mouse enter');
        }

        currentIntersect = intersects[0];
    } else {
        if (currentIntersect) {
            console.log('mouse leave');
        }

        currentIntersect = null;
    }

    if (model) {
        const modelIntersects = raycaster.intersectObject(model);

        if (modelIntersects.length) {
            model.scale.set(1.2, 1.2, 1.2);
        } else {
            model.scale.set(1, 1, 1);
        }
    }

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
