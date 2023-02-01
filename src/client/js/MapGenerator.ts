import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export default class MapGenerator {

    generate(scene: THREE.Scene, obstacles: any[]) {

        let b = new Building(new THREE.Vector3(20, 0, 0));
        obstacles.push(b);

        console.log("generate")
    }

}


class Building {
    object: THREE.Object3D;
    position: THREE.Vector3;
    constructor(position: THREE.Vector3) {
        this.object = new THREE.Object3D();
        this.position = position;
        this._loadLevel(1);
    }

    _loadLevel(id: number) {
        let loader = new GLTFLoader();
        // let url = new URL(`./assets/models/levels/${id}.glb`, import.meta.url);
        let url = new URL(`../../../assets/models/building.glb`, import.meta.url);
        loader.load(url.href, (gltf: GLTF) => {
            this.object.add(gltf.scene);
        }
        );
        this.object.position.copy(this.position);

    }
}