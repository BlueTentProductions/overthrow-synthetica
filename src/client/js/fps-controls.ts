import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { loadModel } from './utils'

const BLADE_MODEL_URL: URL = new URL('../../../assets/models/Blade.glb', import.meta.url)

export default class Controls {
    // look
    activated: boolean = false
    getCamera: Function

    // movement
    moveForward: boolean = false
    moveBackward: boolean = false
    moveRight: boolean = false
    moveLeft: boolean = false

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

    decceleration: THREE.Vector3 = new THREE.Vector3(-10, -16, -10)
    acceleration: THREE.Vector3 = new THREE.Vector3(500, 0, 500)

    // blade
    blade: THREE.Group = new THREE.Group()

    // variables for customisation
    sensitivity: number = 2.0

    constructor(camera: THREE.PerspectiveCamera) {

        document.addEventListener('click', () => {
            document.body.requestPointerLock()
        })

        this.getCamera = () => {
            return camera
        }

        document.body.addEventListener('mousemove', (event: MouseEvent) => {
            if (!this.activated) return

            const euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ') // ensure rotation is done on Y axis first

            euler.setFromQuaternion(camera.quaternion)

            euler.y -= event.movementX * 0.001 * this.sensitivity
            euler.x -= event.movementY * 0.001 * this.sensitivity

            // ensure that the player can only move the camera for max 180 degrees up and down
            euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 2, Math.PI / 2)

            camera.quaternion.setFromEuler(euler)
        })

        document.addEventListener('pointerlockchange', (event: Event) => {
            // checks if pointerLockElement is the document.body or null, then change the activation correspondingly
            if (document.pointerLockElement === document.body) this.activated = true
            else this.activated = false
        })

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
            }
        })
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
            }
        })
    }

    activate() {
        // lock cursor to allow look and movement
        document.body.requestPointerLock()
    }

    async loadAssets(loader: GLTFLoader) {
        await this.loadBlade(loader)
    }

    async loadBlade(loader: GLTFLoader) {
        this.blade = await loadModel(BLADE_MODEL_URL, loader)
        this.blade.scale.multiplyScalar(15)
        this.blade.position.set(this.blade.position.x + 15, this.blade.position.y - 2.5, this.blade.position.z - 25)
        this.blade.rotateZ(-Math.PI / 2)
        this.blade.rotateY(- Math.PI / 3)
        this.blade.rotateX(Math.PI)
        this.getCamera().add(this.blade)
    }

    update(delta: number) {
        this.deccelerate(delta)
        this.accelerate(delta)
        this.movement(delta)
    }

    deccelerate(delta: number) {
        const decceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

        // decceleration must be a fading gradient of the previous values, also making sure player stops when velocity is 0
        decceleration.x = this.velocity.x * this.decceleration.x
        decceleration.z = this.velocity.z * this.decceleration.z

        decceleration.multiplyScalar(delta)

        this.velocity.add(decceleration)
    }

    accelerate(delta: number) {
        const acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

        // acceleration determined by direction chosen by player, which can only be one out of the two polar opposites
        acceleration.x = (Number(this.moveRight) - Number(this.moveLeft)) * this.acceleration.x
        acceleration.z = (Number(this.moveForward) - Number(this.moveBackward)) * this.acceleration.z

        acceleration.multiplyScalar(delta)

        this.velocity.add(acceleration)
    }

    movement(delta: number) {
        const forward: THREE.Vector3 = (new THREE.Vector3(0, 0, -1)).applyQuaternion(this.getCamera().quaternion)
        forward.y = 0
        forward.normalize()
        forward.multiplyScalar(this.velocity.z * delta)

        const right: THREE.Vector3 = (new THREE.Vector3(1, 0, 0)).applyQuaternion(this.getCamera().quaternion)
        right.y = 0
        right.normalize()
        right.multiplyScalar(this.velocity.x * delta)

        this.getCamera().position.add(forward).add(right);
    }
}