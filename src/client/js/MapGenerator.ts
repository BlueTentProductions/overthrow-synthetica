import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export default class MapGenerator {

    generate(scene: THREE.Scene, obstacles: any[]) {

        for (let i = 0; i < 10; i++) {
            let b = new Building(new THREE.Vector3(20 * i, 0, 0), 3 + Math.floor(Math.random() * 5));
            obstacles.push(b);
        }

        console.log("generate")
    }

}


class Building {
    object: THREE.Object3D;
    position: THREE.Vector3;
    levels: number;
    constructor(position: THREE.Vector3, levels: number) {
        this.object = new THREE.Object3D();
        this.position = position;
        this.levels = levels;
        this._init();
        // this._loadLevel(1);
    }

    _init() {
        let pavement = new Pavement(new THREE.Vector3(this.position.x, 0, this.position.z)); // originally y was -0.5 not sure why
        this.object.add(pavement.object);

        for (let i = 0; i < this.levels; i++) {
            this._loadLevel(i + 1, i * 8);
        }
    }

    _loadLevel(id: number, offset: number) {

        let levelObject = this._getLevelObject(id);
        levelObject.position.set(this.position.x, offset, this.position.z);
        this.object.add(levelObject);

    }

    _getLevelObject(id: number) {
        let loader = new GLTFLoader();
        let levelObject = new THREE.Object3D();
        var url;
        if (id === 1) {
            url = new URL(`../../../assets/models/shop-1.glb`, import.meta.url);
        } else {
            // let variant be random number between 1 and 2
            let variant = Math.floor(Math.random() * 2) + 1;
            console.log(variant)

            switch (variant) {
                case 1:
                    url = new URL(`../../../assets/models/apartment-1.glb`, import.meta.url);
                    break;
                case 2:
                    url = new URL(`../../../assets/models/apartment-2.glb`, import.meta.url);
                    break;
                default:
                    url = new URL(`../../../assets/models/apartment-1.glb`, import.meta.url);
                    break;
            }
        }
        if (!url) return levelObject;
        loader.load(url.href, (gltf: GLTF) => {
            // this.object.add(gltf.scene);
            levelObject.add(gltf.scene);
        }
        );
        return levelObject;
    }
}

class Pavement {
    position: THREE.Vector3;
    object: THREE.Object3D;
    constructor(position: THREE.Vector3) {
        this.position = position;
        this.object = new THREE.Object3D();
        this._init();
    }

    _init() {
        let geometry = new THREE.BoxGeometry(20, 0.5, 20);
        let material = new THREE.MeshLambertMaterial({ color: 0x1d2430 });
        this.object = new THREE.Mesh(geometry, material);
        this.object.position.copy(this.position);
    }


}