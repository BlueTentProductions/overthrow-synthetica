import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';


import Floor from './floor';
import Player from './Player';
import MapGenerator from './MapGenerator';
import { Pedestrian } from './Npc';
import Entity from './Entity';

let loader = new GLTFLoader();

let RENDER_DISTANCE = 100;

export default class Game {
    _scene: THREE.Scene;
    _camera: THREE.PerspectiveCamera
    _renderer: THREE.WebGLRenderer;
    _composer: EffectComposer | undefined;
    _prevTime: number = performance.now();
    pause = false;
    player: Player;
    obstacles = [];
    entities: Entity[] = [];
    active = false;

    constructor() {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.6, 600);
        this._camera.position.y = 1.6
        this._camera.position.z = 2
        this._renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, precision: "mediump", powerPreference: "high-performance", stencil: false });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setClearColor(0x16111e);
        this._scene = new THREE.Scene();
        this._scene.add(this._camera);
        this.player = new Player(this.obstacles, this._camera);
        this._init();
    }

    async _loadAssets() {
        await this.player.loadAssets(loader)
    }

    _init() {

        const manager = new THREE.LoadingManager();
        manager.onStart = function (url, itemsLoaded, itemsTotal) {

            console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

        };

        manager.onLoad = function () {
            console.log('Loading complete!');

        };

        document.getElementById("play-button")!.addEventListener("click", () => {
            this.active = true;
            document.getElementById("main-menu")!.style.display = "none";
            document.getElementById("game-container")!.style.display = "block";
            //request pointer lock
            document.body.requestPointerLock();
        })

        document.addEventListener('click', () => {
            if (this.active) {
                document.body.requestPointerLock();
            }
        });


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


    }

    _setUpScene() {
        let sun = new THREE.HemisphereLight(0x000d56, 0xf08bff, 1);
        this._scene.add(sun);

        let generator = new MapGenerator();
        generator.generate(this._scene, this.obstacles);


        this.obstacles.forEach(obstacle => {
            this._scene.add(obstacle['object']);
        });

        let roads: number[][] = generator.roads;
        //form adjacency matrix for roads
        let adjacencyList: Map<string, number[][]> = new Map();
        roads.forEach(road => {
            adjacencyList.set(road.toString(), []);
        });

        roads.forEach(road => {
            roads.forEach(otherRoad => {
                if (road !== otherRoad) {
                    if (road[0] === otherRoad[0] && Math.abs(road[1] - otherRoad[1]) === 13) {
                        adjacencyList.get(road.toString())!.push(otherRoad);
                    }
                    if (road[1] === otherRoad[1] && Math.abs(road[0] - otherRoad[0]) === 13) {
                        adjacencyList.get(road.toString())!.push(otherRoad);
                    }
                }
            });
        });

        console.log(adjacencyList);
        console.log(adjacencyList.get([0, 0].toString())!);

        let pos = [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]]

        //add pedestrian to entities
        for (let i = 0; i < 1000; i++) {
            // let pos 
            //make position a random road
            let pos = roads[Math.floor(Math.random() * roads.length)];
            let pedestrian = new Pedestrian(adjacencyList, pos)
            this.entities.push(pedestrian);
        }

        //add pedestrian to scene
        this.entities.forEach(entity => {
            this._scene.add(entity['object']);
        });





        // const cubeLoader = new THREE.CubeTextureLoader();
        // const texture = cubeLoader.load([
        //     'assets/skybox-0.jpg',
        //     'assets/skybox-0.jpg',
        //     'assets/skybox-0.jpg',
        //     'assets/skybox-0.jpg',
        //     'assets/skybox-0.jpg',
        //     'assets/skybox-0.jpg',

        // ]);

        // this._scene.background = texture;

        THREE.DefaultLoadingManager.onLoad = function () {

            document.getElementById("loading")?.remove();

        };
        // console.log("generation finished")
        let floor = new Floor(700)
        this._scene.add(floor.mesh)

        //add THREE.Fog
        this._scene.fog = new THREE.Fog(0x16111e, 0, RENDER_DISTANCE);

    }

    updateHUD() {

        let healthWheel = document.getElementById("health-wheel")!
        let percentage = this.player.health / this.player.maxHealth * 100;
        healthWheel.setAttribute("style", "--p:" + percentage + ";--b:15px;--c:rgb(255, 255, 255);");
        percentage = Math.round(percentage);
        document.getElementById("health-label")!.innerHTML = percentage + "%";


        let stealthWheel = document.getElementById("stealth-wheel")!
        let stealthPercentage = this.player.stealth / this.player.maxStealth * 100;
        stealthWheel.setAttribute("style", "--p:" + stealthPercentage + ";--b:15px;--c:rgb(255, 255, 255);");
        stealthPercentage = Math.round(stealthPercentage);
        document.getElementById("stealth-label")!.innerHTML = stealthPercentage + "%";

    }


    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.obstacles.forEach(obstacle => {
            let distance = Math.sqrt(Math.pow(this.player.getCamera().position.x - obstacle['position']['x'], 2) + Math.pow(this.player.getCamera().position.y - obstacle['position']['y'], 2) + Math.pow(this.player.getCamera().position.z - obstacle['position']['z'], 2));
            if (distance < RENDER_DISTANCE) {
                this._scene.add(obstacle['object']);
            } else {
                this._scene.remove(obstacle['object']);
            }
        });

        this.entities.forEach(entity => {
            let distance = Math.sqrt(Math.pow(this.player.getCamera().position.x - entity['position']['x'], 2) + Math.pow(this.player.getCamera().position.y - entity['position']['y'], 2) + Math.pow(this.player.getCamera().position.z - entity['position']['z'], 2));
            if (distance < RENDER_DISTANCE) {
                this._scene.add(entity['object']);
            } else {
                this._scene.remove(entity['object']);
            }
        });



        const time: number = performance.now()
        const delta: number = (time - this._prevTime) / 1000

        if (!this.pause) {
            if (this.active) {
                this.entities.forEach(entity => {
                    entity.update(this.player, delta, this.obstacles);
                });
            }

            this.player.move_update(this.active, delta, this.obstacles)
        }


        this._prevTime = time;
        this._composer?.render();
        this.updateHUD();
    }



}