import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Controls } from './fps-controls'
import { Floor } from './floor'
import { Scene } from 'three';

var scene: THREE.Scene
var camera: THREE.PerspectiveCamera
var renderer: THREE.WebGLRenderer

var loader: GLTFLoader

var controls: Controls

var floor: Floor

var prevTime: number = performance.now()

// init all basic scene stuff
function init() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.y = 20
    camera.position.z = 2

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    loader = new GLTFLoader()

    let sun = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    let ambient = new THREE.AmbientLight(0xffffff);
    scene.add(sun);
    scene.add(ambient);
    scene.background = new THREE.Color(0xffffff);

    floor = new Floor(1000)
    scene.add(floor.mesh)
    
    controls = new Controls(camera)
    
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

    scene.add(camera)
}

// load assets async
async function loadAssets() {
    await controls.loadAssets(loader)
}

// game loop
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
loadAssets()
animate()
