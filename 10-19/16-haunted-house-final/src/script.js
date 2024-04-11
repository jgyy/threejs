import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

const gui = new GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()

const loadTexture = (path, repeat = 1, colorSpace = THREE.LinearEncoding, wrap = THREE.RepeatWrapping) => {
  const texture = textureLoader.load(path)
  texture.repeat.set(repeat, repeat)
  texture.colorSpace = colorSpace
  texture.wrapS = wrap
  texture.wrapT = wrap
  return texture
}

const doorTextures = {
  color: loadTexture('/textures/door/color.jpg', 1, THREE.SRGBColorSpace),
  alpha: loadTexture('/textures/door/alpha.jpg'),
  ambientOcclusion: loadTexture('/textures/door/ambientOcclusion.jpg'),
  height: loadTexture('/textures/door/height.jpg'),
  normal: loadTexture('/textures/door/normal.jpg'),
  metalness: loadTexture('/textures/door/metalness.jpg'),
  roughness: loadTexture('/textures/door/roughness.jpg')
}

const bricksTextures = {
  color: loadTexture('/textures/bricks/color.jpg', 1, THREE.SRGBColorSpace),
  ambientOcclusion: loadTexture('/textures/bricks/ambientOcclusion.jpg'),
  normal: loadTexture('/textures/bricks/normal.jpg'),
  roughness: loadTexture('/textures/bricks/roughness.jpg')
}

const grassTextures = {
  color: loadTexture('/textures/grass/color.jpg', 8, THREE.SRGBColorSpace, THREE.RepeatWrapping),
  ambientOcclusion: loadTexture('/textures/grass/ambientOcclusion.jpg', 8, THREE.LinearEncoding, THREE.RepeatWrapping),
  normal: loadTexture('/textures/grass/normal.jpg', 8, THREE.LinearEncoding, THREE.RepeatWrapping),
  roughness: loadTexture('/textures/grass/roughness.jpg', 8, THREE.LinearEncoding, THREE.RepeatWrapping)
}

const house = new THREE.Group()
scene.add(house)

const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({ ...bricksTextures })
)
walls.position.y = 1.25
house.add(walls)

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({ color: '#b35f45' })
)
roof.rotation.y = Math.PI * 0.25
roof.position.y = 2.5 + 0.5
house.add(roof)

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({ ...doorTextures, transparent: true, displacementScale: 0.1 })
)
door.position.set(0, 1, 2.01)
house.add(door)

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bushes = [
  { scale: [0.5, 0.5, 0.5], position: [0.8, 0.2, 2.2] },
  { scale: [0.25, 0.25, 0.25], position: [1.4, 0.1, 2.1] },
  { scale: [0.4, 0.4, 0.4], position: [-0.8, 0.1, 2.2] },
  { scale: [0.15, 0.15, 0.15], position: [-1, 0.05, 2.6] }
]

bushes.forEach(({ scale, position }) => {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial)
  bush.scale.set(...scale)
  bush.position.set(...position)
  house.add(bush)
})

const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2
  const radius = 3 + Math.random() * 6
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  const grave = new THREE.Mesh(graveGeometry, graveMaterial)
  grave.castShadow = true
  grave.position.set(x, 0.3, z)
  grave.rotation.z = (Math.random() - 0.5) * 0.4
  grave.rotation.y = (Math.random() - 0.5) * 0.4

  graves.add(grave)
}

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ ...grassTextures })
)
floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.26)
moonLight.position.set(4, 5, -2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001)
scene.add(moonLight)

const doorLight = new THREE.PointLight('#ff7d46', 3, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog

const ghost1 = new THREE.PointLight('#ff00ff', 6, 3)
const ghost2 = new THREE.PointLight('#00ffff', 6, 3)
const ghost3 = new THREE.PointLight('#ffff00', 6, 3)
scene.add(ghost1, ghost2, ghost3)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 2, 5)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setClearColor('#262837')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const shadowSettings = [
  { object: moonLight, width: 256, height: 256, far: 15 },
  { object: doorLight, width: 256, height: 256, far: 7 },
  { object: ghost1, width: 256, height: 256, far: 7 },
  { object: ghost2, width: 256, height: 256, far: 7 },
  { object: ghost3, width: 256, height: 256, far: 7 }
]

shadowSettings.forEach(({ object, width, height, far }) => {
  object.castShadow = true
  object.shadow.mapSize.width = width
  object.shadow.mapSize.height = height
  object.shadow.camera.far = far
})

walls.castShadow = true
bushes.forEach(bush => bush.castShadow = true)
floor.receiveShadow = true

const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  const ghost1Angle = elapsedTime * 0.5
  ghost1.position.x = Math.cos(ghost1Angle) * 4
  ghost1.position.z = Math.sin(ghost1Angle) * 4
  ghost1.position.y = Math.sin(elapsedTime * 3)

  const ghost2Angle = -elapsedTime * 0.32
  ghost2.position.x = Math.cos(ghost2Angle) * 5
  ghost2.position.z = Math.sin(ghost2Angle) * 5
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

  const ghost3Angle = -elapsedTime * 0.18
  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
  ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick();
