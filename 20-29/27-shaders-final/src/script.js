import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import GUI from 'lil-gui';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';

const gui = new GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load('/textures/flag-french.jpg');

const geometry = new THREE.SphereGeometry(1, 32, 32);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);
for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('orange') },
    uTexture: { value: flagTexture }
  }
});

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX');
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY');
gui.addColor(material.uniforms.uColor, 'value').name('color');
gui.add(material, 'wireframe');

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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
camera.position.set(0.25, -0.25, 1);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const glitchPass = new GlitchPass();
composer.addPass(glitchPass);

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;
  mesh.rotation.y = elapsedTime * 0.1;
  controls.update();
  composer.render();
  window.requestAnimationFrame(tick);
};

tick();
