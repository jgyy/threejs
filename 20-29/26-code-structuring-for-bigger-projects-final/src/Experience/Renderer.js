import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import Experience from './Experience.js'

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.setInstance()
    this.setPostProcessing()
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    })

    // Set tone mapping
    this.instance.toneMapping = THREE.CineonToneMapping
    this.instance.toneMappingExposure = 1.75

    // Enable shadow mapping
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap

    // Set clear color
    this.instance.setClearColor('#211d20')

    // Set initial size and pixel ratio
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  setPostProcessing() {
    // Create a render target for post-processing
    this.renderTarget = new THREE.WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
      }
    )

    // Create a render pass
    const renderPass = new RenderPass(this.scene, this.camera.instance)

    // Create a post-processing composer
    this.composer = new EffectComposer(this.instance, this.renderTarget)
    this.composer.addPass(renderPass)

    // Add any desired post-processing passes
    // For example, you can add a bloom pass:
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      1.5,
      0.4,
      0.85
    )
    this.composer.addPass(bloomPass)
  }

  resize() {
    // Update the renderer and post-processing size on window resize
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)

    this.composer.setSize(this.sizes.width, this.sizes.height)
    this.composer.setPixelRatio(this.sizes.pixelRatio)
  }

  update() {
    // Render the scene with post-processing
    this.composer.render(this.scene, this.camera.instance)
  }
}
