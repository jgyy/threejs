import * as THREE from 'three'
import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import sources from './sources.js'

let instance = null

export default class Experience {
  constructor(_canvas) {
    // Singleton pattern to ensure only one instance of Experience is created
    if (instance) {
      return instance
    }
    instance = this

    // Make the Experience instance globally accessible
    window.experience = this

    // Store the canvas element
    this.canvas = _canvas

    // Setup the necessary components
    this.debug = new Debug() // Debugging utility
    this.sizes = new Sizes() // Handling window and canvas sizes
    this.time = new Time() // Managing time and animation
    this.scene = new THREE.Scene() // Creating a new Three.js scene
    this.resources = new Resources(sources) // Loading and managing resources
    this.camera = new Camera() // Setting up the camera
    this.renderer = new Renderer() // Initializing the renderer
    this.world = new World() // Creating the game world

    // Resize event listener
    this.sizes.on('resize', () => {
      this.resize()
    })

    // Time tick event listener for animation
    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    // Update camera and renderer when window is resized
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    // Update components on each frame
    this.camera.update()
    this.world.update()
    this.renderer.update()
  }

  destroy() {
    // Clean up and dispose of resources when the Experience is destroyed
    this.sizes.off('resize')
    this.time.off('tick')

    // Traverse the whole scene and dispose of geometries and materials
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        // Loop through the material properties and dispose of them
        for (const key in child.material) {
          const value = child.material[key]
          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })

    // Dispose of camera controls, renderer, and debug UI
    this.camera.controls.dispose()
    this.renderer.instance.dispose()
    if (this.debug.active) {
      this.debug.ui.destroy()
    }
  }
}
