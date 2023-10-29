import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import RenderPixelatedPass from './PixelatedPass';


import Floor from './floor';
import Player from './Player';
import MapGenerator from './MapGenerator';
import { Pedestrian, Officer } from './Npc';
import Entity from './Entity';

// import Projectile from './Projectiles/Projectile';
import Particle from './Particles/Particle';
import Projectile from './Projectiles/Projectile';
import Interactable from './Obstacles/Interactable';
import Campfire from './Obstacles/Campfire';

let loader = new GLTFLoader();
let RENDER_DISTANCE = 300;
let RETRO_MODE = true;

export default class Game {
    _scene: THREE.Scene;
    _camera: THREE.PerspectiveCamera
    _renderer: THREE.WebGLRenderer;
    _composer: EffectComposer | undefined;
    _prevTime: number = performance.now();
    pause = false;
    player: Player;
    obstacles = [];
    interactables: Interactable[] = [];
    entities: Entity[] = [];
    particles: Particle[] = [];
    projectiles: Projectile[] = [];
    active = false;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    _reset: Function;

    constructor(reset: Function) {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 600);
        this._camera.position.y = 30
        this._camera.position.z = -5


        //make camera look downwards
        this._camera.rotation.x = -Math.PI / 5;


        this._renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, precision: "mediump", powerPreference: "high-performance", stencil: false, antialias: false });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setClearColor(0x000000);
        this._scene = new THREE.Scene();
        this._scene.add(this._camera);
        this.player = new Player(this, this.obstacles);
        this._init();
        this._reset = reset;
    }

    _loadAssets() {
        // this.player.loadAssets(loader)
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
            this.pause = false;
            this.active = true;
            document.getElementById("main-menu")!.style.display = "none";
            document.getElementById("play-button")!.style.display = "none";
            document.getElementById("game-container")!.style.display = "block";
            //request pointer lock

            this.player.activate();
        });

        // document.addEventListener('pointerlockchange', (event: Event) => {
        //     if (document.pointerLockElement === document.body) this.pause = false;
        //     else {
        //         this.pause = true;
        //         // theres a 1 second time window for the request, so after pausing, player must wait at least 1 second before being able to click resume
        //         document.getElementById("main-menu")!.style.display = "block";
        //         document.getElementById("play-button")!.style.display = "none";
        //         document.getElementById("game-container")!.style.display = "none";
        //         setTimeout(() => {
        //             document.getElementById("play-button")!.style.display = "block";
        //             document.getElementById("play-button")!.children[0].innerHTML = "(繼續)";
        //             document.getElementById("play-button")!.children[1].innerHTML = "RESUME";
        //         }, 1000);
        //     }
        // });

        this._loadAssets();


        this._createComposer();
        this._setUpScene();


        document.body.appendChild(this._renderer.domElement);

    }

    _createComposer() {
        this._composer = new EffectComposer(this._renderer);
        let renderPass = new RenderPass(this._scene, this._camera);
        this._composer.addPass(renderPass);

        // let pixelatedPass = new RenderPixelatedPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), this._scene, this._camera);
        // this._composer.addPass(pixelatedPass);

        if (RETRO_MODE) {
            let pixelatedPass = new RenderPixelatedPass(new THREE.Vector2(window.innerWidth / 3, window.innerHeight / 3), this._scene, this._camera);
            //set edge strength to 0.5
            this._composer.addPass(pixelatedPass);
        }

        let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.8, 0.95);
        this._composer.addPass(bloomPass);


    }

    _setUpScene() {


        let sun = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        this._scene.add(sun);

        let generator = new MapGenerator();
        generator.generate(this._scene, this.obstacles, this.entities);


        this.obstacles.forEach(obstacle => {
            this._scene.add(obstacle['object']);
        });

        this.interactables.push(new Campfire(this, new THREE.Vector3(10, 0, 10), 0))

        this.interactables.forEach(interactable => {
            this._scene.add(interactable['object']);
        });

        // let roads: number[][] = generator.roads;
        //form adjacency matrix for roads
        // let adjacencyList: Map<string, number[][]> = new Map();
        // roads.forEach(road => {
        //     adjacencyList.set(road.toString(), []);
        // });

        // roads.forEach(road => {
        //     roads.forEach(otherRoad => {
        //         if (road !== otherRoad) {
        //             if (road[0] === otherRoad[0] && Math.abs(road[1] - otherRoad[1]) === 13) {
        //                 adjacencyList.get(road.toString())!.push(otherRoad);
        //             }
        //             if (road[1] === otherRoad[1] && Math.abs(road[0] - otherRoad[0]) === 13) {
        //                 adjacencyList.get(road.toString())!.push(otherRoad);
        //             }
        //         }
        //     });
        // });

        // console.log(adjacencyList);
        // console.log(adjacencyList.get([0, 0].toString())!);

        // let pos = [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]]

        // //add pedestrian to entities

        // for (let i = 0; i < 100; i++) {

        //     // let pos 
        //     //make position a random road
        //     let pos = roads[Math.floor(Math.random() * roads.length)];
        //     let pedestrian = new Pedestrian(adjacencyList, pos)
        //     this.entities.push(pedestrian);
        // }

        // for (let i = 0; i < 10; i++) {

        //     // let pos 
        //     //make position a random road
        //     let pos = roads[Math.floor(Math.random() * roads.length)];
        //     let officer = new Officer(adjacencyList, pos)
        //     this.entities.push(officer);
        // }

        //add pedestrian to scene
        this.entities.forEach(entity => {
            this._scene.add(entity['object']);
        });

        console.log(this.player['object'])
        this._scene.add(this.player['object']);






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
        this._scene.fog = new THREE.Fog(0xa6b7bb, 0, RENDER_DISTANCE * 9 / 10);

        // for (let obstacle of this.obstacles) {
        //     console.log(obstacle['collisionBox']['min'], obstacle['collisionBox']['max'])
        // }
    }

    updatePause() {
        if (this.pause) {
            this.player.deactivate();
            this.active = false;
        }
    }

    updateHUD() {
        // health
        let healthWheel = document.getElementById("health-wheel")!
        let percentage = this.player.health / this.player.maxHealth * 100;
        let healthWheelColor = "rgb(255, 255, 255)";

        // health wheel color for indicating low health
        if (percentage < 40) healthWheelColor = "rgb(202, 11, 0)";
        else healthWheelColor = "rgb(255, 255, 255)";

        healthWheel.setAttribute("style", "--p:" + percentage + ";--b:15px;--c:" + healthWheelColor + ";");
        percentage = Math.round(percentage);
        document.getElementById("health-label")!.innerHTML = percentage + "%";



    }

    addProjectile(p: Projectile) {
        if (p.owner == 0) {
            console.log("player projectile probably created.")
        }

        console.log("PRE PUSH: " + this.projectiles.length)
        this.projectiles.push(p);
        console.log("POST PUSH: " + this.projectiles.length)
        this._scene.add(p.object);

    }

    addParticle(p: Particle) {
        this.particles.push(p);
        this._scene.add(p.object);

    }



    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.updatePause()


        //raycast for mouse intersect with floor
        this.mouse = new THREE.Vector2();



        this.obstacles.forEach(obstacle => {
            let distance = Math.sqrt(Math.pow(this.player.object.position.x - obstacle['position']['x'], 2) + Math.pow(this.player.object.position.y - obstacle['position']['y'], 2) + Math.pow(this.player.object.position.z - obstacle['position']['z'], 2));
            if (distance < RENDER_DISTANCE) {
                this._scene.add(obstacle['object']);
            } else {
                this._scene.remove(obstacle['object']);
            }
        });

        // this.entities.forEach(entity => {
        //     let distance = Math.sqrt(Math.pow(this.player.getCamera().position.x - entity['position']['x'], 2) + Math.pow(this.player.getCamera().position.y - entity['position']['y'], 2) + Math.pow(this.player.getCamera().position.z - entity['position']['z'], 2));
        //     if (distance < RENDER_DISTANCE / 2) {
        //         this._scene.add(entity['object']);
        //     } else {
        //         this._scene.remove(entity['object']);
        //     }
        // });



        const time: number = performance.now()
        const delta: number = (time - this._prevTime) / 1000


        //for each particle, update. if life is less than 0, remove from scene
        this.particles.forEach(particle => {
            particle.update(delta);
            if (particle.life <= 0) {
                this._scene.remove(particle.object);

                this.particles.splice(this.particles.indexOf(particle), 1);
            }
        });

        this.projectiles.forEach(projectile => {
            projectile.update(delta, this, this.player, this.entities, this.obstacles, this.interactables);
            if (projectile.life <= 0) {
                this._scene.remove(projectile.object);
                this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
            }
        });


        this.interactables.forEach(interactable => {
            interactable.update(delta);
        });


        if (!this.pause) {
            if (this.active) {
                this.entities.forEach(entity => {
                    entity.update(this.player, delta, this.obstacles);
                    entity.updateBullets(this._scene, this.entities);
                });
            }

            this.player.move_update(this.active, delta, this.obstacles, this.interactables)
            this.player.update(this.player, delta, this.obstacles);
        }

        // console.log(this.player.object.position)

        //set camera position to player position
        this._camera.position.set(this.player.object.position.x, this.player.object.position.y + 8, this.player.object.position.z + 10);

        this._prevTime = time;
        this._composer?.render();
        this.updateHUD();
    }



}