import Interactable from './Interactable';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Game from '../Game';
import Particle from '../Particles/Particle';




export default class Campfire extends Interactable {
    lit: boolean = false;
    constructor(context: Game, position: THREE.Vector3, rotation: number) {
        super(context, position, rotation);
        this.object = new THREE.Object3D();
        this.position = position;
        this.rotation = rotation;
        // this._loadLevel(1);
        this.init();

    }

    init() {
        let loader = new GLTFLoader();
        let url = new URL('../../../../assets/models/campfire.glb', import.meta.url);

        loader.load(url.href, (gltf) => {
            gltf.scene.scale.set(0.4, 0.4, 0.4);
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            });


            this.object.add(gltf.scene);

        });
        this.object.position.copy(this.position);

        this.collisionBox.setFromCenterAndSize(this.position, new THREE.Vector3(1.05, 10, 1.05));

        this.addLight();

    }

    addLight() {
        this.lit = true;
        // add an orange point light
        const light = new THREE.PointLight(0xffa21c, 2, 50);
        light.position.set(0, 2, 0);
        light.castShadow = true;
        this.object.add(light);

    }

    update(delta: number) {

        //create vector pointing upwards 

        if (this.lit) {
            let direction = new THREE.Vector3(Math.random() * 3, 6, Math.random() * 3);

            let colours = [0xffa21c, 0xffc71c, 0xfff0c2, 0xe53123, 0xe56723];

            if (Math.random() < 0.7) {
                let p = new Particle(1.5, this.object.position.clone(), direction, 0.2, colours[Math.floor(Math.random() * colours.length)], 1, true);
                this.context.addParticle(p);
            }
        }

    }


}