import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.setInstance()
    this.setControls()
  }

  setInstance() {
    // Create a new perspective camera
    this.instance = new THREE.PerspectiveCamera(
      35, // Field of view
      this.sizes.width / this.sizes.height, // Aspect ratio
      0.1, // Near clipping plane
      100 // Far clipping plane
    )

    // Set the initial position of the camera
    this.instance.position.set(6, 4, 8)

    // Add the camera to the scene
    this.scene.add(this.instance)
  }

  setControls() {
    // Create orbit controls for the camera
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true

    // Set the target position for the camera to look at
    this.controls.target.set(0, 0, 0)

    // Set the maximum and minimum polar angle for the camera
    this.controls.minPolarAngle = Math.PI / 4 // 45 degrees
    this.controls.maxPolarAngle = Math.PI / 2 // 90 degrees

    // Set the maximum and minimum distance for the camera
    this.controls.minDistance = 5
    this.controls.maxDistance = 20

    // Enable panning of the camera
    this.controls.enablePan = true
  }

  resize() {
    // Update the camera's aspect ratio and projection matrix when the window is resized
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    // Update the orbit controls in each frame
    this.controls.update()
  }

  // Add a method to set the camera position
  setPosition(x, y, z) {
    this.instance.position.set(x, y, z)
  }

  // Add a method to set the camera target
  setTarget(x, y, z) {
    this.controls.target.set(x, y, z)
  }

  // Add a method to get the current camera position
  getPosition() {
    return this.instance.position
  }
}
