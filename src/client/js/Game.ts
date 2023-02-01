import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default class Game {
    _scene: THREE.Scene;
    _camera: THREE.PerspectiveCamera
    _renderer: THREE.WebGLRenderer;
    _composer: EffectComposer | undefined;

    constructor() {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._scene = new THREE.Scene();
        this._init();
    }

    _init() {


        this._createComposer();

        document.body.appendChild(this._renderer.domElement);

    }

    _createComposer() {
        this._composer = new EffectComposer(this._renderer);
        let renderPass = new RenderPass(this._scene, this._camera);
        this._composer.addPass(renderPass);
        let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this._composer.addPass(bloomPass);

    }


    animate() {
        requestAnimationFrame(this.animate.bind(this));


        this._composer?.render();
    }



}