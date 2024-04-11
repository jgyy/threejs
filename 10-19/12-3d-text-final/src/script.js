import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/8.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Fonts
 */
const fontLoader = new FontLoader()
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        // Material
        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

        // Text
        const textGeometry = new TextGeometry(
            'Hello Three.js',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        textGeometry.center()

        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        // Add GUI controls for text properties
        const textFolder = gui.addFolder('Text')
        textFolder.add(text.position, 'x').min(-5).max(5).step(0.01).name('Position X')
        textFolder.add(text.position, 'y').min(-5).max(5).step(0.01).name('Position Y')
        textFolder.add(text.position, 'z').min(-5).max(5).step(0.01).name('Position Z')
        textFolder.add(text.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('Rotation X')
        textFolder.add(text.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Rotation Y')
        textFolder.add(text.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('Rotation Z')
        textFolder.add(text.scale, 'x').min(0.1).max(2).step(0.01).name('Scale X')
        textFolder.add(text.scale, 'y').min(0.1).max(2).step(0.01).name('Scale Y')
        textFolder.add(text.scale, 'z').min(0.1).max(2).step(0.01).name('Scale Z')

        // Donuts
        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64)
        const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

        for (let i = 0; i < 100; i++) {
            const donut = new THREE.Mesh(donutGeometry, donutMaterial)
            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10
            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI
            const scale = Math.random()
            donut.scale.set(scale, scale, scale)
            scene.add(donut)
        }

        // Add GUI control for donut count
        const donutFolder = gui.addFolder('Donuts')
        const donutCountObject = { count: 100 }
        donutFolder.add(donutCountObject, 'count').min(0).max(1000).step(1).onChange((value) => {
            scene.traverse((child) => {
                if (child.isMesh && child !== text) {
                    scene.remove(child)
                }
            })

            for (let i = 0; i < value; i++) {
                const donut = new THREE.Mesh(donutGeometry, donutMaterial)
                donut.position.x = (Math.random() - 0.5) * 10
                donut.position.y = (Math.random() - 0.5) * 10
                donut.position.z = (Math.random() - 0.5) * 10
                donut.rotation.x = Math.random() * Math.PI
                donut.rotation.y = Math.random() * Math.PI
                const scale = Math.random()
                donut.scale.set(scale, scale, scale)
                scene.add(donut)
            }
        });
    }
);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {;
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

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
}

tick();
