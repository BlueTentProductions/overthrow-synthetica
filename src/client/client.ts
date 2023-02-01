import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Controls } from './fps-controls'
import { Floor } from './floor'
import { Scene } from 'three';
// import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import Game from './js/Game';

// var scene: THREE.Scene
// var camera: THREE.PerspectiveCamera
// var renderer: THREE.WebGLRenderer

// var loader: GLTFLoader

// var controls: Controls

// var floor: Floor

// var prevTime: number = performance.now()

// // init all basic scene stuff
// function init() {
//     scene = new THREE.Scene()
//     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
//     camera.position.y = 20
//     camera.position.z = 2





//     renderer = new THREE.WebGLRenderer()
//     renderer.setSize(window.innerWidth, window.innerHeight)
//     document.body.appendChild(renderer.domElement)

//     let composer = new EffectComposer(renderer);
//     let renderPass = new RenderPass(scene, camera);
//     composer.addPass(renderPass);
//     let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
//     composer.addPass(bloomPass);


//     loader = new GLTFLoader()

//     let sun = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
//     let ambient = new THREE.AmbientLight(0xffffff);
//     scene.add(sun);
//     scene.add(ambient);
//     scene.background = new THREE.Color(0x16111e);

//     floor = new Floor(1000)
//     scene.add(floor.mesh)

//     controls = new Controls(camera)

//     window.addEventListener('resize', () => {
//         camera.aspect = window.innerWidth / window.innerHeight
//         camera.updateProjectionMatrix()
//         renderer.setSize(window.innerWidth, window.innerHeight)
//         render()
//     })

//     document.body.addEventListener('click', () => {
//         // only activate controls when game is unpaused
//         controls.activate()
//     })

//     scene.add(camera)
// }

// // load assets async
// async function loadAssets() {
//     await controls.loadAssets(loader)
// }

// // game loop
// function animate() {
//     requestAnimationFrame(animate)

//     const time: number = performance.now()
//     const delta: number = (time - prevTime) / 1000

//     prevTime = time

//     if (!isPaused()) {
//         controls.update(delta)
//     }

//     render()
// }

// function isPaused() {
//     if (document.pointerLockElement === document.body) return false
//     else return true
// }

// function render() {
//     renderer.render(scene, camera)
// }

// init()
// loadAssets()
// animate()

class App {
    _game: Game | null;
    constructor() {
        this._game = null;
        this._init();
    }

    _init() {

        this._newGame();
    }

    _newGame() {
        this._game = new Game();
        this._game.animate();

    }




}


let APP = null;
window.addEventListener('DOMContentLoaded', () => {
    APP = new App();
});
