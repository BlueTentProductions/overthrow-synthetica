import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Obstacle from './Obstacle';
import Entity from './Entity';

const BLADE_MODEL_URL: URL = new URL('../../../assets/models/new-blade.glb', import.meta.url)

export default class Player extends Entity {
    // look
    activated: boolean = false;
    getObstacles: Function;
    getCamera: Function;
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
    sprintMod: number = 1.8;

    // blade
    blade: THREE.Group = new THREE.Group();
    bladeDefaultPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    bladeDefaultRotation: THREE.Euler = new THREE.Euler(0, 0, 0);
    bladeBounceTimer: number = 0;
    bladeAnimation: THREE.AnimationClip[] = [];
    bladeAngle = 0;
    _slashTimer = 0;
    isSlashing: boolean = false;
    slashFrame: number = 0;

    // variables for customisation
    sensitivity: number = 2.0;
    collisionBox: THREE.Box3 = new THREE.Box3();

    // health
    health: number = 100;
    maxHealth: number = 100;

    // stealth
    stealth: number = 100;
    maxStealth: number = 100;
    stealthCD: number = 100;
    maxStealthCD: number = 100;
    detectionRaised: boolean = false;
    detection: number = 1;
    maxDetection: number = 3;

    _bladeMixer: any = undefined;


    constructor(obstacles: any, camera: THREE.PerspectiveCamera) {
        super();

        this.getObstacles = () => {
            return obstacles;
        }
        this.getCamera = () => {
            return camera;
        }
        this.init();
    }

    init() {
        this.eventListeners();
    }

    eventListeners() {


        //add scroll listener
        document.addEventListener('wheel', (event: WheelEvent) => {
            if (!this.activated) return;

            if (event.deltaY > 0) {
                this.bladeAngle += 0.1;
            } else {
                this.bladeAngle -= 0.1;
            }

            if (this.bladeAngle > 1) this.bladeAngle = 1;
            if (this.bladeAngle < -1) this.bladeAngle = -1;

            this.blade.position.setX(this.bladeDefaultPosition.x - this.bladeAngle * 0.3);
            this.blade.rotation.set(this.bladeDefaultRotation.x, this.bladeDefaultRotation.y, this.bladeDefaultRotation.z + this.bladeAngle);

            document.getElementById("crosshair")!.style.transform = `translate(-50%, -50%) rotate(${this.bladeAngle}rad) `;

        });

        document.body.addEventListener('mousemove', (event: MouseEvent) => {
            if (!this.activated) return;

            const euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ'); // ensure rotation is done on Y axis first

            euler.setFromQuaternion(this.getCamera().quaternion);

            euler.y -= event.movementX * 0.001 * this.sensitivity;
            euler.x -= event.movementY * 0.001 * this.sensitivity;

            // ensure that the player can only move the camera for max 180 degrees up and down
            euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 2, Math.PI / 2);

            this.getCamera().quaternion.setFromEuler(euler);
        });

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
                    console.log("left click")
                    if (!this.isSlashing) this.isSlashing = true;
                    break;
            }
        });
    }

    activate() {
        this.activated = true;
    }

    deactivate() {
        this.activated = false;
    }

    loadAssets(loader: GLTFLoader) {
        this.loadBlade(loader);
    }

    loadBlade(loade: GLTFLoader) {

        let loader = new GLTFLoader();

        loader.load(BLADE_MODEL_URL.href, (gltf) => {
            this.blade.add(gltf.scene);
            this._bladeMixer = new THREE.AnimationMixer(gltf.scene);
            this.bladeAnimation = gltf.animations;

            //make animation not loop
            this._bladeMixer.clipAction(this.bladeAnimation[0]).setLoop(THREE.LoopOnce, 1);



        });







        this.blade.scale.multiplyScalar(0.6);
        this.blade.position.set(this.blade.position.x + 0.1, this.blade.position.y - 0.3, this.blade.position.z - 0.1);
        this.bladeDefaultPosition = this.blade.position.clone();

        //add rotation to x
        // this.blade.rotateZ(-Math.PI / 2);
        // this.blade.rotateY(- Math.PI / 8);
        // this.blade.rotateX(Math.PI);
        this.blade.rotateY(Math.PI);
        this.bladeDefaultRotation = this.blade.rotation.clone();
        this.getCamera().add(this.blade);
    }

    update(player: Player, delta: number, obstacles: Obstacle[]) {
        // console.log(this.isSlashing);
        // if (this.isSlashing) {
        //     this._bladeMixer.clipAction(this.bladeAnimation[0]).play();
        //     this.isSlashing = false;
        // } else {
        //     this._bladeMixer.clipAction(this.bladeAnimation[0]).stop();
        // }

        //play slash animation once and then stop




        if (this.isSlashing) {
            this._bladeMixer.clipAction(this.bladeAnimation[0]).play();
            this._slashTimer += delta;
        } else {
            this._bladeMixer.clipAction(this.bladeAnimation[0]).stop();
        }


        if (this._slashTimer > 1) {
            this._slashTimer = 0;
            this.isSlashing = false;
        }


        if (this._bladeMixer) this._bladeMixer.update(delta);

        // console.log(this.isSlashing);

    }

    move_update(gameActive: boolean, delta: number, obstacles: Obstacle[]) {
        if (!this.activated && !gameActive) {
            this.getCamera().quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), delta / 8));
            return;
        }
        this.updateRay();
        this.deccelerate(delta);
        this.accelerate(delta);
        this.collisionBox.setFromCenterAndSize(this.getCamera().position, new THREE.Vector3(0.5, 1.5, 0.5));
        this.movement(delta, obstacles);

    }

    updateRay() {
        this.frontRay.ray.origin.copy(this.getCamera().position);
        this.frontRay.ray.direction.copy((new THREE.Vector3(0, 0, -1)).applyQuaternion(this.getCamera().quaternion));
    }

    getCurrentRoad() {
        return [Math.floor((this.getCamera().position.x + (13 / 2)) / 13) * 13, Math.floor((this.getCamera().position.z + (13 / 2)) / 13) * 13];
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
        const acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

        // acceleration determined by direction chosen by player, which can only be one out of the two polar opposites
        acceleration.x = (Number(this.moveRight) - Number(this.moveLeft));
        acceleration.z = (Number(this.moveForward) - Number(this.moveBackward));

        // normalize acceleration so diagonal movement isn't faster
        acceleration.normalize();
        acceleration.multiply(this.acceleration);
        if (this.isSprinting && this.moveForward) acceleration.z *= this.sprintMod;
        acceleration.multiplyScalar(this.accelSpeed * delta);

        this.velocity.add(acceleration);
    }

    movement(delta: number, obstacles: Obstacle[]) {
        const forward: THREE.Vector3 = (new THREE.Vector3(0, 0, -1)).applyQuaternion(this.getCamera().quaternion);
        forward.y = 0;
        forward.normalize();
        forward.multiplyScalar(this.velocity.z * delta);

        const right: THREE.Vector3 = (new THREE.Vector3(1, 0, 0)).applyQuaternion(this.getCamera().quaternion);
        right.y = 0;
        right.normalize();
        right.multiplyScalar(this.velocity.x * delta);

        let moveVec = new THREE.Vector3();
        moveVec.add(forward);
        moveVec.add(right);

        this.updateStealth(delta, moveVec);

        this.blade.position.setY(this.bladeDefaultPosition.y + Math.sin(this.bladeBounceTimer) * 0.03 - Math.abs(this.bladeAngle) * 0.2);

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

        this.getCamera().position.add(moveVec);
    }

    updateStealth(delta: number, moveVec: THREE.Vector3) {
        // stealth function so its more organised

        let reductionModifier = (1 + (this.detection - 1) * 0.5);

        // sprinting will cause stealth to be lowered, and need to wait for a bit before starting to regenerate
        // && moveforward to make sure its actually sprinting not just pressing shift
        if (this.isSprinting && this.moveForward) {
            this.stealthCD = 50;
            this.stealth -= delta * reductionModifier * 8;
        }

        // stealth regeneration & cooldown regeneration
        if (this.stealthCD >= this.maxStealthCD) this.stealth += delta * (moveVec.length() > 0.05 ? 0.3 : 3);
        else this.stealthCD += 1;

        // if stealth is broken, then detection meter will increase
        if (this.stealth < 0) {
            if (!this.detectionRaised) {
                this.detectionRaised = true;
                if (this.detection < this.maxDetection) this.detection += 1;
            }
        } else this.detectionRaised = false;

        // stealth recovers slower if goes under 0, and max -10
        if (this.stealth < -10) this.stealth = -10;

        // cannot go over max stealth
        if (this.stealth > this.maxStealth) this.stealth = this.maxStealth;
    }

    slash() {
        this.isSlashing = true;


    }

    interact() {
        for (let i = 0; i < this.getObstacles().length; i++) {
            let object: any = this.getObstacles()[i];
            let intersection: THREE.Vector3 = new THREE.Vector3();
            if (object.name == 'building') {
                this.frontRay.ray.intersectBox(object.collisionBox, intersection);
                if (this.frontRay.ray.origin.distanceTo(intersection) <= 2) {
                    console.log(this.frontRay.ray.origin.distanceTo(intersection), object, object.name);
                    break;
                }
            }
        }
    }
}