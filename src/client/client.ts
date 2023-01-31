import * as THREE from 'three'
import { Controls } from './fps-controls'

var scene: THREE.Scene
var camera: THREE.PerspectiveCamera
var renderer: THREE.WebGLRenderer

var controls: Controls

var floor: THREE.Mesh

var prevTime: number = performance.now()

function init() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.y = 20
    camera.position.z = 2

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    
    controls = new Controls(camera)
    
    const floorGeo: THREE.PlaneGeometry = new THREE.PlaneGeometry(1000, 1000, 64, 64)
    floorGeo.rotateX(- Math.PI / 2)
    const floorMat: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
    })

    floor = new THREE.Mesh(floorGeo, floorMat)
    scene.add(floor)
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    })
    
    document.body.addEventListener('click', () => {
        // only activate controls when game is unpaused
        controls.activate()
    })
}

function animate() {
    requestAnimationFrame(animate)

    const time: number = performance.now()
    const delta: number = (time - prevTime) / 1000

    prevTime = time

    if (!isPaused()) {
        controls.update(delta)
    }

    render()
}

function isPaused() {
    if (document.pointerLockElement === document.body) return false
    else return true
}

function render() {
    renderer.render(scene, camera)
}

init()
animate()
