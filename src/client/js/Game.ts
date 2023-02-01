import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

import Floor from './Floor';
import Controls from './Controls';
import MapGenerator from './MapGenerator';

let loader = new GLTFLoader();

export default class Game {
    _scene: THREE.Scene;
    _camera: THREE.PerspectiveCamera
    _renderer: THREE.WebGLRenderer;
    _composer: EffectComposer | undefined;
    _prevTime: number = performance.now();
    pause = false;
    player: Controls;
    obstacles = [];

    constructor() {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._camera.position.y = 1.6
        this._camera.position.z = 2
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setClearColor(0x16111e);
        this._scene = new THREE.Scene();
        this._scene.add(this._camera);
        this.player = new Controls(this._camera);
        this._init();
    }

    async _loadAssets() {
        await this.player.loadAssets(loader)
    }

    _init() {

        this._loadAssets();


        this._createComposer();
        this._setUpScene();


        document.body.appendChild(this._renderer.domElement);

    }

    _createComposer() {
        this._composer = new EffectComposer(this._renderer);
        console.log(this._scene, this._camera);
        let renderPass = new RenderPass(this._scene, this._camera);
        this._composer.addPass(renderPass);
        let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.1;
        bloomPass.strength = 0.8;
        bloomPass.radius = 0.5;
        this._composer.addPass(bloomPass);

        let smaaPass = new SMAAPass(window.innerWidth * this._renderer.getPixelRatio(), window.innerHeight * this._renderer.getPixelRatio());
        this._composer.addPass(smaaPass);
    }

    _setUpScene() {
        let sun = new THREE.HemisphereLight(0x000d56, 0xf08bff, 1);
        // let ambient = new THREE.AmbientLight(0xffffff);
        this._scene.add(sun);
        // this._scene.add(ambient);

        let generator = new MapGenerator();
        generator.generate(this._scene, this.obstacles);

        //add all obstacles objects to scene functionally
        this.obstacles.forEach(obstacle => {
            this._scene.add(obstacle['object']);
        });



        console.log("generation finished")
        let floor = new Floor(1000)
        this._scene.add(floor.mesh)


    }


    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time: number = performance.now()
        const delta: number = (time - this._prevTime) / 1000

        if (!this.pause) {
            this.player.update(delta)
        }


        this._prevTime = time;
        this._composer?.render();
    }



}