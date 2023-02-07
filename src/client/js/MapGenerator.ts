import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import Obstacle from './Obstacle';
import { Vector3 } from 'three';
import Entity from './Entity';
import Player from './Player';
import Laser from './Laser';

export default class MapGenerator {
    roads: number[][] = [];

    //obstacles is a hashmap of all the obstacles in the scene with their position as the key
    obstacles: any = {};


    generate(scene: THREE.Scene, obstacles: any[], entities: any[]) {

        this._generateRoadTree();

        for (let i = 0; i < this.roads.length; i++) {
            let road = this.roads[i];

            // let directions = [[13, 0], [0, 13], [-13, 0], [0, -13]];
            let directions = [[13, 0], [0, 13], [-13, 0], [0, -13]];
            let rotations = [-Math.PI / 2, Math.PI, Math.PI / 2, 0];

            for (let j = 0; j < directions.length; j++) {
                let direction = directions[j];
                let newPos = [road[0] + direction[0], road[1] + direction[1]];

                if (this.obstacles[String(newPos)]) {
                    continue;
                }
                this.obstacles[String(newPos)] = true;
                let height = Math.floor(Math.random() * 8) + 2;
                let b = new Building(new THREE.Vector3(newPos[0], 2, newPos[1]), height, rotations[j]);

                // place snipers
                if (b.sniper != 0) {
                    let p = new Sniper(new Vector3(b.position.x, b.sniper * 8, b.position.z));
                    entities.push(p);
                }
                obstacles.push(b);

            }
        }
    }

    _generateRoadTree() {
        var explore = [];
        var roadsLeft = 200;
        this.roads.push([0, 0]);
        this.obstacles[String([0, 0])] = true;
        explore.push([0, 0]);

        while (explore.length > 0) {


            let current = explore.shift();

            if (!current) {
                continue;
            }
            if (roadsLeft <= 0) {
                break;
            }

            let threshold = roadsLeft > 180 ? 0.0 : roadsLeft > 100 ? 0.4 : 0.3;
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
    sniper: number = 0;
    name = 'building';
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
            let variant = Math.floor(Math.random() * 8) + 1;
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
                case 5:
                    url = new URL(`../../../assets/models/eatery.glb`, import.meta.url);
                    break;
                case 6:
                    url = new URL(`../../../assets/models/pharmacy.glb`, import.meta.url);
                    break;
                case 7:
                    url = new URL(`../../../assets/models/small-shops-1.glb`, import.meta.url);
                    break;
                case 8:
                    url = new URL(`../../../assets/models/bank.glb`, import.meta.url);
                    break;
            }
        } else if (id === 2) {
            let variant = Math.floor(Math.random() * 3) + 1;
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
                default:
                    url = new URL(`../../../assets/models/apartment-1.glb`, import.meta.url);
                    break;
            }
        } else {
            // let variant be random number between 1 and 3
            let variant = Math.floor(Math.random() * 11) + 1;
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
                    let advert = Math.floor(Math.random() * 4) + 1;
                    switch (advert) {
                        case 1:
                            url = new URL(`../../../assets/models/apartment-4.glb`, import.meta.url);
                            break;
                        case 2:
                            url = new URL(`../../../assets/models/apartment-7.glb`, import.meta.url);
                            break;
                        case 3:
                            url = new URL(`../../../assets/models/omega-day.glb`, import.meta.url);
                            break;
                        case 4:
                            url = new URL(`../../../assets/models/apartment-10.glb`, import.meta.url);
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
                case 7:
                    url = new URL(`../../../assets/models/apartment-8.glb`, import.meta.url);
                    break;
                case 8:
                    url = new URL(`../../../assets/models/apartment-9.glb`, import.meta.url);
                    break;
                case 9:
                    url = new URL(`../../../assets/models/synthetica.glb`, import.meta.url);
                    break;
                case 10:
                    if (id >= 8 && this.sniper == 0) {
                        url = new URL(`../../../assets/models/sniper-building.glb`, import.meta.url);
                        this.sniper = id;
                    }
                    else url = new URL(`../../../assets/models/apartment-1.glb`, import.meta.url);
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

class Sniper extends Entity {
    isSniping: boolean = false;
    laser: Laser = new Laser(new THREE.Mesh(), new THREE.Quaternion, 0);
    duration: number = 20;
    constructor(position: THREE.Vector3) {
        super();
        this.position = position;
        this._init();
    }

    _init(): void {
    }

    update(player: Player, delta: number, obstacles: Obstacle[]): void {
        this.snipe(player.stealth, player.getCamera().position);
        this.laser.update(player, delta, obstacles);
    }

    updateBullets(scene: THREE.Scene, entities: Entity[]): void {

        if (!this.isSniping) return;

        // // visualise bounding box
        // let boxh = new THREE.Box3Helper(this.laser.collisionBox);
        // boxh.updateMatrixWorld(true);
        // scene.add(boxh);

        scene.add(this.laser.mesh);
        
        if (this.duration < 0) {
            this.duration = 20;
            scene.remove(this.laser.mesh);
            this.isSniping = false;
        } else this.duration -= 1;
    }

    snipe(stealth: number, playerPos: THREE.Vector3): void {
        if (stealth > -10 || this.isSniping) return;
        
        let chance = Math.random();
        if (chance < 0.95) return;

        this.isSniping = true;
        console.log("pew");

        // generate laser mesh
        let laserLength = Math.sqrt(this.position.distanceToSquared(playerPos)) * 10;
        const geometry = new THREE.CapsuleGeometry(1, laserLength, 1, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0xEA3B52 });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.name = "laser";
        mesh.scale.set(mesh.scale.x * 0.1, mesh.scale.y * 0.1, mesh.scale.z * 0.1);
        mesh.position.copy(this.position);
        mesh.lookAt(playerPos);

        
        let forward = (new THREE.Vector3(0, 0, 1)).applyQuaternion(mesh.quaternion);
        forward.normalize();
        forward.multiplyScalar(laserLength / 20);
        mesh.position.add(forward);

        // spread
        let spreadX = 0.001 * (Math.random() - 0.5);
        let spreadY = 0.001 * (Math.random() - 0.5);
        let spreadZ = 0.001 * (Math.random() - 0.5);
        mesh.rotation.set(mesh.rotation.x + spreadX, mesh.rotation.y + spreadY, mesh.rotation.z + spreadZ);

        let quaternion = mesh.quaternion.clone();
        
        // visually face correctly
        mesh.rotateX(-Math.PI / 2);

        this.laser = new Laser(mesh, quaternion, laserLength);
    }
}