import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { loadModel } from './utils';
import Obstacle from './Obstacle';
import Entity from './Entity';

const BLADE_MODEL_URL: URL = new URL('../../../assets/models/Blade.glb', import.meta.url)

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
    isSlashing: boolean = false;
    slashFrame: number = 0;

    // variables for customisation
    sensitivity: number = 2.0;
    collisionBox: THREE.Box3 = new THREE.Box3();

    health: number = 100;
    maxHealth: number = 100;
    stealth: number = 100;
    maxStealth: number = 100;


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

        document.addEventListener('pointerlockchange', (event: Event) => {
            // checks if pointerLockElement is the document.body or null, then change the activation correspondingly
            if (document.pointerLockElement === document.body) this.activated = true;
            else this.activated = false;
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
                    if (!this.isSlashing) this.isSlashing = true;
                    break;
            }
        });
    }

    activate() {
        // lock cursor to allow look and movement
        document.body.requestPointerLock();
    }

    async loadAssets(loader: GLTFLoader) {
        await this.loadBlade(loader);
    }

    async loadBlade(loader: GLTFLoader) {
        this.blade = await loadModel(BLADE_MODEL_URL, loader);
        this.blade.scale.multiplyScalar(0.7);
        this.blade.position.set(this.blade.position.x + 0.9, this.blade.position.y, this.blade.position.z - 1.2);
        this.blade.rotateZ(-Math.PI / 2);
        this.blade.rotateY(- Math.PI / 6);
        this.blade.rotateX(Math.PI);
        this.getCamera().add(this.blade);
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
        this.slash();
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

        if (moveVec.length() > 0.05) {
            this.stealth -= delta * (this.isSprinting ? 8 : -0.3);
            if (this.stealth < 0) this.stealth = 0;
            if (this.stealth > this.maxStealth) this.stealth = this.maxStealth;
        } else if (moveVec.length() <= 0.05) {
            this.stealth += delta * 3;
            if (this.stealth > this.maxStealth) this.stealth = this.maxStealth;
        }

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

    slash() {
        if (this.isSlashing) {
            if (this.slashFrame < 5) {
                // ...
                this.slashFrame += 1
            }
            else {
                this.isSlashing = false;
                this.slashFrame = 0;
            }
        }
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