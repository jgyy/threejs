import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

const gui = new GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    colors: ['#ff6030', '#1b3984'],
    shape: 'spiral',
    rotationSpeed: 0.01,
    animate: true,
    randomize: () => {
        parameters.count = Math.floor(Math.random() * 1000000) + 100;
        parameters.size = Math.random() * 0.09 + 0.001;
        parameters.radius = Math.random() * 19.99 + 0.01;
        parameters.branches = Math.floor(Math.random() * 19) + 2;
        parameters.spin = Math.random() * 10 - 5;
        parameters.randomness = Math.random() * 2;
        parameters.randomnessPower = Math.random() * 9 + 1;
        parameters.insideColor = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
        parameters.outsideColor = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
        generateGalaxy();
    }
};

let geometry = null;
let material = null;
let points = null;

class Galaxy {
    constructor() {
        this.geometry = null;
        this.material = null;
        this.points = null;
    }

    generate() {
        if (this.points !== null) {
            this.geometry.dispose();
            this.material.dispose();
            scene.remove(this.points);
        }

        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);
        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * parameters.radius;
            const spinAngle = radius * parameters.spin;
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.radius);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.material = new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        this.points = new THREE.Points(this.geometry, this.material);
        scene.add(this.points);
    }

    animate() {
        gsap.to(this.points.rotation, {
            duration: 100 / parameters.rotationSpeed,
            y: Math.PI * 2,
            repeat: -1,
            ease: 'none'
        });
    }
}

const galaxy = new Galaxy();

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(() => galaxy.generate());
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(() => galaxy.generate());
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(() => galaxy.generate());
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(() => galaxy.generate());
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(() => galaxy.generate());
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(() => galaxy.generate());
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(() => galaxy.generate());
gui.addColor(parameters, 'insideColor').onFinishChange(() => galaxy.generate());
gui.addColor(parameters, 'outsideColor').onFinishChange(() => galaxy.generate());
gui.add(parameters, 'rotationSpeed').min(0.01).max(1).step(0.01).onFinishChange(() => {
    if (parameters.animate) {
        galaxy.animate();
    }
});
gui.add(parameters, 'animate').onFinishChange((value) => {
    if (value) {
        galaxy.animate();
    } else {
        gsap.killTweensOf(galaxy.points.rotation);
    }
});
gui.add(parameters, 'randomize');

galaxy.generate();

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
camera.position.set(3, 3, 3);
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
