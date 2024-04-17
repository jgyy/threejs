import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';

const gui = new GUI();

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const parameters = {};
parameters.count = 200000;
parameters.size = 0.005;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';
parameters.rotationSpeed = 0.1;
parameters.rotationDirection = 1;
parameters.spiralArmPitchAngle = 0.2;
parameters.spiralArmCount = 2;
parameters.particleDensity = 1;
parameters.particleClustering = 0.5;

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    if(points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const randomness = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count * 1);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for(let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * parameters.radius;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        const spiralAngle = radius * parameters.spiralArmPitchAngle;
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spiralAngle) * radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = Math.sin(branchAngle + spiralAngle) * radius;
    
        randomness[i3] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        scales[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 30 * renderer.getPixelRatio() }
        },    
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);
gui.add(parameters, 'rotationSpeed').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'rotationDirection').min(-1).max(1).step(2).onFinishChange(generateGalaxy);
gui.add(parameters, 'spiralArmPitchAngle').min(0).max(1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'spiralArmCount').min(1).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'particleDensity').min(0.1).max(10).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, 'particleClustering').min(0).max(1).step(0.01).onFinishChange(generateGalaxy);

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
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

generateGalaxy();

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    material.uniforms.uTime.value = elapsedTime;

    points.rotation.y = elapsedTime * parameters.rotationSpeed * parameters.rotationDirection;

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
