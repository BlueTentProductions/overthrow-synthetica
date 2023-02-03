import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import Obstacle from './Obstacle';

export default class MapGenerator {
    roads: number[][] = [];

    //obstacles is a hashmap of all the obstacles in the scene with their position as the key
    obstacles: any = {};


    generate(scene: THREE.Scene, obstacles: any[]) {

        this._generateRoadTree();

        for (let i = 0; i < this.roads.length; i++) {
            let road = this.roads[i];

            let directions = [[13, 0], [0, 13], [-13, 0], [0, -13]];
            let rotations = [-Math.PI / 2, Math.PI, Math.PI / 2, 0];

            for (let j = 0; j < directions.length; j++) {
                let direction = directions[j];
                let newPos = [road[0] + direction[0], road[1] + direction[1]];

                if (this.obstacles[String(newPos)]) {
                    continue;
                }
                this.obstacles[String(newPos)] = true;
                let height = Math.floor(Math.random() * 5) + 2;
                let b = new Building(new THREE.Vector3(newPos[0], 2, newPos[1]), height, rotations[j]);
                obstacles.push(b);

            }
        }
    }

    _generateRoadTree() {
        var explore = [];
        var roadsLeft = 150;
        this.roads.push([0, 0]);
        this.obstacles[String([0, 0])] = true;
        explore.push([0, 0]);

        while (explore.length > 0) {
            console.log(explore)

            let current = explore.shift();

            if (!current) {
                continue;
            }
            if (roadsLeft <= 0) {
                break;
            }

            let threshold = roadsLeft > 100 ? 0.2 : 0.8;
            if (Math.random() > threshold) {
                let length = 4;
                var newPos;
                for (let i = 1; i < length; i++) {
                    newPos = [current[0] + i * 13, current[1]];
                    if (!this.obstacles[String(newPos)]) {
                        this.roads.push(newPos);
                        this.obstacles[String(newPos)] = true;
                        roadsLeft--;
                    }
                }
                explore.push(newPos);

            }
            if (Math.random() > threshold) {
                let length = Math.floor(Math.random() * 6) + 2;
                var newPos;
                for (let i = 1; i < length; i++) {
                    newPos = [current[0] + i * -13, current[1]];
                    if (!this.obstacles[String(newPos)]) {
                        this.roads.push(newPos);
                        this.obstacles[String(newPos)] = true;
                        roadsLeft--;
                    }
                }
                explore.push(newPos);
            }
            if (Math.random() > threshold) {
                let length = 4;
                var newPos;
                for (let i = 1; i < length; i++) {
                    newPos = [current[0], current[1] + i * 13];
                    if (!this.obstacles[String(newPos)]) {
                        this.roads.push(newPos);
                        this.obstacles[String(newPos)] = true;
                        roadsLeft--;
                    }
                }
                explore.push(newPos);
            }
            if (Math.random() > threshold) {
                let length = 4;
                var newPos;
                for (let i = 1; i < length; i++) {
                    newPos = [current[0], current[1] + i * -13];
                    if (!this.obstacles[String(newPos)]) {
                        this.roads.push(newPos);
                        this.obstacles[String(newPos)] = true;
                        roadsLeft--;
                    }
                }
                explore.push(newPos);
            }
        }

    }
}


class Building extends Obstacle {
    object: THREE.Object3D;
    position: THREE.Vector3;
    levels: number;
    rotation: number;
    collisionBox = new THREE.Box3();
    constructor(position: THREE.Vector3, levels: number, rotation: number) {
        super();
        this.object = new THREE.Object3D();
        this.position = position;
        this.levels = levels;
        this.rotation = rotation;
        this._init();
        // this._loadLevel(1);

    }

    _init() {
        let pavement = new Pavement(new THREE.Vector3(this.position.x, 0, this.position.z)); // originally y was -0.5 not sure why

        this.object.add(pavement.object);

        for (let i = 0; i < this.levels; i++) {
            this._loadLevel(i + 1, i * 8);
        }

        this.collisionBox.setFromCenterAndSize(this.position, new THREE.Vector3(13, 10, 13));

        //helper to visualise collision box
        // let helper = new THREE.Box3Helper(this.collisionBox, new THREE.Color(0xff0000));
        // this.object.add(helper);
    }

    _loadLevel(id: number, offset: number) {

        let levelObject = this._getLevelObject(id);
        levelObject.position.set(this.position.x, offset, this.position.z);
        levelObject.rotation.y = this.rotation;

        this.object.add(levelObject);

    }

    _getLevelObject(id: number) {
        let loader = new GLTFLoader();
        let levelObject = new THREE.Object3D();
        var url;
        if (id === 1) {
            let variant = Math.floor(Math.random() * 4) + 1;
            switch (variant) {
                case 1:
                    url = new URL(`../../../assets/models/shop-1.glb`, import.meta.url);
                    break;
                case 2:
                    url = new URL(`../../../assets/models/love-hotel.glb`, import.meta.url);
                    break;
                case 3:
                    url = new URL(`../../../assets/models/7-11.glb`, import.meta.url);
                    break;
                case 4:
                    url = new URL(`../../../assets/models/ramen-shop.glb`, import.meta.url);
                    break;
            }
        } else {
            // let variant be random number between 1 and 3
            let variant = Math.floor(Math.random() * 7) + 1;
            switch (variant) {
                case 1:
                    url = new URL(`../../../assets/models/apartment-1.glb`, import.meta.url);
                    break;
                case 2:
                    url = new URL(`../../../assets/models/apartment-2.glb`, import.meta.url);
                    break;
                case 3:
                    url = new URL(`../../../assets/models/apartment-3.glb`, import.meta.url);
                    break;
                case 4:
                    //blue tek
                    let advert = Math.floor(Math.random() * 2) + 1;
                    switch (advert) {
                        case 1:
                            url = new URL(`../../../assets/models/apartment-4.glb`, import.meta.url);
                            break;
                        case 2:
                            url = new URL(`../../../assets/models/apartment-7.glb`, import.meta.url);
                            break;
                        default:
                            url = new URL(`../../../assets/models/apartment-4.glb`, import.meta.url);
                            break;
                    }
                    break;
                case 5:
                    url = new URL(`../../../assets/models/apartment-5.glb`, import.meta.url);
                    break;
                case 6:
                    url = new URL(`../../../assets/models/apartment-6.glb`, import.meta.url);
                    break;
                default:
                    url = new URL(`../../../assets/models/apartment-1.glb`, import.meta.url);
                    break;
            }
        }
        if (!url) return levelObject;
        loader.load(url.href, (gltf: GLTF) => {
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
        this.object.position.set(this.position.x, this.position.y, this.position.z);

    }


}