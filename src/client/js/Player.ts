import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Obstacle from './Obstacles/Obstacle';
import Entity from './Entity';
import Sickle from './Items/Sickle';
import EvilBane from './Items/EvilBane';
import Sword from './Items/Sword';
import Katana from './Items/Katana';
import Item from './Items/Item';
import Bow from './Items/Bow';
import Game from './Game';
import Interactable from './Obstacles/Interactable';

import Particle from './Particles/Particle';
import Arrow from './Projectiles/Arrow';
import Slash from './Projectiles/Slash';
import WideSlash from './Projectiles/WideSlash';

const BLADE_MODEL_URL: URL = new URL('../../../assets/models/new-blade.glb', import.meta.url)

export default class Player extends Entity {
    // look
    activated: boolean = false;
    getObstacles: Function;
    frontRay: THREE.Raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, 20);

    // movement
    moveForward: boolean = false;
    moveBackward: boolean = false;
    moveRight: boolean = false;
    moveLeft: boolean = false;
    isSprinting: boolean = false;

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    decceleration: THREE.Vector3 = new THREE.Vector3(-10, -16, -10);
    acceleration: THREE.Vector3 = new THREE.Vector3(500, 0, 500);
    accelSpeed: number = 0.12;
    sprintMod: number = 2.0;



    // variables for customisation
    sensitivity: number = 2.0;


    // health
    health: number = 100;
    maxHealth: number = 100;

    _mixer: any = undefined;
    _animations: THREE.AnimationClip[] = [];

    //create animation dict 
    _animationDict: { [key: string]: THREE.AnimationAction } = {};
    _itemBone: any = undefined;
    _animationState: string = "init";
    _currentAnimation: any;
    _loaded = 0;

    _useCooldown: number = 0.0;


    inventory = [new Katana()];
    selectedSlot: number = 0;

    projectile_ownership = 0;




    constructor(context: Game, obstacles: any) {
        super(context);

        this.getObstacles = () => {
            return obstacles;
        }
        this.init();
    }




    init() {
        let loader = new GLTFLoader();
        let url = new URL('../../../assets/models/elysia.glb', import.meta.url);

        loader.load(url.href, (gltf) => {
            gltf.scene.scale.set(0.4, 0.4, 0.4);
            //rotate the model 90 degrees on y
            // gltf.scene.rotation.y = -Math.PI / 2;

            //translate model upwards
            gltf.scene.position.y = 1;
            this._mixer = new THREE.AnimationMixer(gltf.scene);

            this._animations = gltf.animations;

            // console.log(this._animations)


            //create new entry for animation dict using findbyname method

            //print out all the animations by name
            // for (let i = 0; i < this._animations.length; i++) {
            //     console.log(this._animations[i].name);
            // }


            this._animationDict["attack_bow_0"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Attack_Bow_0")).setDuration(1);
            this._animationDict["attack_one_0"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Attack_One_0")).setDuration(2 / 3);
            this._animationDict["attack_one_1"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Attack_One_1")).setDuration(1 / 2);
            this._animationDict["attack_one_2"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Attack_One_2")).setDuration(1 / 2);
            this._animationDict["attack_two_0"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Attack_Two_0")).setDuration(1);
            this._animationDict["idle"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Idle")).setDuration(1 / 2);
            this._animationDict["run"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Run")).setDuration(1 / 2);
            this._animationDict["walk"] = this._mixer.clipAction(THREE.AnimationClip.findByName(this._animations, "Walk")).setDuration(3 / 4);


            // this._animationDict["attack_one_0"] = this._mixer.clipAction(this._animations[0]).setDuration(1);
            // this._animationDict["attack_one_1"] = this._mixer.clipAction(this._animations[1]).setDuration(1 / 2);
            // this._animationDict["attack_one_2"] = this._mixer.clipAction(this._animations[2]).setDuration(1 / 2);
            // this._animationDict["attack_two_0"] = this._mixer.clipAction(this._animations[3]).setDuration(1);
            // this._animationDict["idle"] = this._mixer.clipAction(this._animations[4]).setDuration(1 / 2);
            // this._animationDict["run"] = this._mixer.clipAction(this._animations[5]).setDuration(1 / 2);

            // this._animationDict["walk"] = this._mixer.clipAction(this._animations[6]).setDuration(3 / 4);



            // this._itemBone = gltf.scene.getBoneByName("Weapon");

            //console log all object names
            // gltf.scene.traverse((child) => {
            //     console.log(child.name);
            // });

            this._itemBone = gltf.scene.getObjectByName("Weapon");
            // console.log(this._itemBone)





            // //replace material
            // gltf.scene.traverse((child) => {
            //     if (child instanceof THREE.Mesh) {
            //         child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            //     }
            // });

            // this._mixer.clipAction(this._animations[0]).play();
            //play the first animation at walk speed

            //make object cast shadows
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            });

            this.animationStateDecider("idle");



            this.object.add(gltf.scene);
            this._loaded = 1;
        });

        //play idle animation




        this.object.position.copy(this.position);




        this.eventListeners();
    }

    loadedInit() {
        this.loadItemModel();
    }

    loadItemModel() {
        //remove old item model if it exists
        if (this.inventory[this.selectedSlot].object != undefined) {
            this._itemBone.remove(this.inventory[this.selectedSlot].object);
        }
        //add held item model to player object and bind to specific bone
        let object = this.inventory[this.selectedSlot].object;
        // //attach to item hand bone
        // console.log("bone" + this._itemBone);
        this._itemBone.add(object);

    }

    animationStateDecider(n: string) {

        if (this._animationState == "init") {
            this._animationState = "idle";
            this._animationDict[this._animationState].play();
            return;
        }

        if (n == this._animationState) {
            return;
        }

        if (this._useCooldown > 0.0) {
            return;
        }

        //copy current animation
        var oldAnim = this._animationDict[this._animationState];

        switch (n) {
            case "attack_bow_0":
                this._animationState = "attack_bow_0";
                break;
            case "attack_one_0":
                this._animationState = "attack_one_0";
                break;
            case "attack_one_1":
                this._animationState = "attack_one_1";
                break;
            case "attack_one_2":
                this._animationState = "attack_one_2";
                break;
            case "attack_two_0":
                this._animationState = "attack_two_0";
                break;

            case "idle":
                this._animationState = "idle";
                break;
            case "walk":
                this._animationState = "walk";

                break;
            case "run":
                this._animationState = "run";

                break;
            default:
                this._animationState = "idle";

        }

        //crossfade to new animation
        this._animationDict[this._animationState].reset();
        this._animationDict[this._animationState].play();
        this._animationDict[this._animationState].crossFadeFrom(oldAnim, 0.2, false);


        this._animationState = n;

    }



    eventListeners() {


        document.addEventListener('keydown', (event: KeyboardEvent) => {
            switch (event.code) {
                case "KeyW":
                    this.moveForward = true;
                    break;
                case "KeyS":
                    this.moveBackward = true;
                    break;
                case "KeyD":
                    this.moveRight = true;
                    break;
                case "KeyA":
                    this.moveLeft = true;
                    break;
                case "ShiftLeft":
                    this.isSprinting = true;
                    break;
                case "KeyE":
                    this.interact();
                    break;
            }
        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            switch (event.code) {
                case "KeyW":
                    this.moveForward = false;
                    break;
                case "KeyS":
                    this.moveBackward = false;
                    break;
                case "KeyD":
                    this.moveRight = false;
                    break;
                case "KeyA":
                    this.moveLeft = false;
                    break;
                case "ShiftLeft":
                    this.isSprinting = false;
                    break;
            }
        });

        document.addEventListener('click', (event: MouseEvent) => {
            switch (event.button) {
                case 0:
                    this.use_item();
                    break;
            }
        });
    }

    use_item() {
        if (this._useCooldown > 0.0) {
            return;
        }

        let slash_origin = this.object.position.clone().add(new THREE.Vector3(0, 1, 0));
        var s;
        switch (this.inventory[this.selectedSlot].item_type) {

            case "w_one_handed":
                this.animationStateDecider("attack_one_0");
                this._useCooldown = 0.36;




                try {
                    s = new Slash(this.projectile_ownership, 0.8, 10, slash_origin, this.object.getWorldDirection(new THREE.Vector3()), Math.sqrt(Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z)), 0xffffff);
                    this.context.addProjectile(s);
                    console.log("SHOULD HAVE CREATED PROJECTILE:")
                    console.log(this.context.projectiles)
                } catch {
                    console.log("for some reason, the projectile was not created?")
                }


                break;
            case "w_two_handed":
                this.animationStateDecider("attack_two_0");
                this._useCooldown = 1.0;

                s = new WideSlash(this.projectile_ownership, 0.8, 10, slash_origin, this.object.getWorldDirection(new THREE.Vector3()), Math.sqrt(Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z)), 0xffffff);
                this.context.addProjectile(s);
                break;
            case "w_bow":
                this.animationStateDecider("attack_bow_0");
                this._useCooldown = 1.0;

                //player position but higher
                let arrow_origin = this.object.position.clone().add(new THREE.Vector3(0, 1, 0));


                let p = new Arrow(this.projectile_ownership, 100000, 10, arrow_origin, this.object.getWorldDirection(new THREE.Vector3()), 20);
                this.context.addProjectile(p);
                break;

        }



    }

    activate() {
        this.activated = true;
    }

    deactivate() {
        this.activated = false;
    }


    update(player: Player, delta: number, obstacles: Obstacle[]) {
        if (this._loaded == 1) {
            this.loadedInit();
            this._loaded = 2;
        }
        //show collision box for debugging
        // this.collisionBox.setFromObject(this.object);
        // this.collisionBox.getCenter(this.object.position);
        // this.object.position.multiplyScalar(-1);

        if (this._mixer !== undefined) {
            this._mixer.update(delta);
        }

        if (this._useCooldown > 0.0) {
            this._useCooldown -= delta;
        }
        if (this._useCooldown < 0.0) {
            this._useCooldown = 0.0;
        }

        //trail
        // let p = new Particle(5, this.object.position.clone(), new THREE.Vector3(0, 1, 0), 1, 0xffffff, 1, true);
        // this.context.addParticle(p);

    }

    move_update(gameActive: boolean, delta: number, obstacles: Obstacle[], interactables: Interactable[]) {
        if (!this.activated && !gameActive) {
            return;
        }

        this.deccelerate(delta);
        this.accelerate(delta);
        this.collisionBox.setFromCenterAndSize(this.object.position, new THREE.Vector3(0.5, 1.5, 0.5));

        let o = obstacles.concat(interactables);
        this.movement(delta, o);


    }



    deccelerate(delta: number) {
        const decceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

        // decceleration must be a fading gradient of the previous values, also making sure player stops when velocity is 0
        decceleration.x = this.velocity.x * this.decceleration.x;
        decceleration.z = this.velocity.z * this.decceleration.z;

        decceleration.multiplyScalar(delta);

        this.velocity.add(decceleration);
    }

    accelerate(delta: number) {
        var acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

        // acceleration determined by direction chosen by player, which can only be one out of the two polar opposites
        acceleration.x = (Number(this.moveRight) - Number(this.moveLeft));
        acceleration.z = (Number(this.moveForward) - Number(this.moveBackward));

        // normalize acceleration so diagonal movement isn't faster
        acceleration.normalize();
        acceleration.multiply(this.acceleration);
        if (this.isSprinting) {
            acceleration = acceleration.multiplyScalar(this.sprintMod);

        }
        acceleration.multiplyScalar(this.accelSpeed * delta);

        if (this._useCooldown > 0.0) {
            acceleration.multiplyScalar(0.1);
        }

        //if movement sprinting, play sprint animation

        //if movement vector has magnitude of 0, play idle animation
        if (acceleration.length() < 0.5) {
            this.animationStateDecider("idle");
        } else if (this.isSprinting) {
            this.animationStateDecider("run");
            if (Math.random() < 0.7 && this._useCooldown <= 0.0) {
                let p = new Particle(0.5, this.object.position.clone(), acceleration.clone().multiplyScalar(-1), 0.2, 0xffffff, 1, true);
                this.context.addParticle(p);
            }
        } else {
            this.animationStateDecider("walk");
        }

        this.velocity.add(acceleration);
    }

    movement(delta: number, obstacles: Obstacle[]) {
        const forward: THREE.Vector3 = (new THREE.Vector3(0, 0, -1));
        forward.y = 0;
        forward.normalize();
        forward.multiplyScalar(this.velocity.z * delta);

        const right: THREE.Vector3 = (new THREE.Vector3(1, 0, 0));
        right.y = 0;
        right.normalize();
        right.multiplyScalar(this.velocity.x * delta);

        let moveVec = new THREE.Vector3();
        moveVec.add(forward);
        moveVec.add(right);


        let colBoxX = this.collisionBox.clone();
        colBoxX.translate(new THREE.Vector3(moveVec.x, 0, 0));

        for (let obstacle of obstacles) {
            if (colBoxX.intersectsBox(obstacle.collisionBox)) {
                moveVec.x = 0;
                break;
            }
        }

        let colBoxZ = this.collisionBox.clone();
        colBoxZ.translate(new THREE.Vector3(0, 0, moveVec.z));

        for (let obstacle of obstacles) {
            if (colBoxZ.intersectsBox(obstacle.collisionBox)) {
                moveVec.z = 0;
                break;
            }
        }

        //rotate player to face direction of movement
        // if (moveVec.x != 0 || moveVec.z != 0) {
        //     this.object.rotation.y = Math.atan2(moveVec.x, moveVec.z);
        // }

        //if player does not face direction of movement, rotate player to face direction of movement (smoothly)
        let rot_speed = 24;
        if ((moveVec.x != 0 || moveVec.z != 0) && this._useCooldown == 0.0) {
            let targetRotation = Math.atan2(moveVec.x, moveVec.z);
            let deltaRotation = targetRotation - this.object.rotation.y;

            if (deltaRotation > Math.PI) {
                deltaRotation -= Math.PI * 2;
            } else if (deltaRotation <= -Math.PI) {
                deltaRotation += Math.PI * 2;
            }

            if (deltaRotation > 0) {
                this.object.rotation.y += Math.min(deltaRotation, rot_speed * delta);
            } else if (deltaRotation <= 0) {
                this.object.rotation.y += Math.max(deltaRotation, -rot_speed * delta);
            }
        }



        this.object.position.add(moveVec);
    }


    interact() {
        // for (let i = 0; i < this.getObstacles().length; i++) {
        //     let object: any = this.getObstacles()[i];
        //     let intersection: THREE.Vector3 = new THREE.Vector3();
        //     if (object.name == 'building') {
        //         this.frontRay.ray.intersectBox(object.collisionBox, intersection);
        //         if (this.frontRay.ray.origin.distanceTo(intersection) <= 2) {
        //             console.log(this.frontRay.ray.origin.distanceTo(intersection), object, object.name);
        //             break;
        //         }
        //     }
        // }
    }
}