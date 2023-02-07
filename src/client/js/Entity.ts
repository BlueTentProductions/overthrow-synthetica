import Obstacle from "./Obstacle";
import Player from "./Player";
import * as THREE from "three";


export default class Entity {
    object = new THREE.Object3D();
    position = new THREE.Vector3();
    constructor() {

    }
    getCurrentRoad() {
        return [Math.floor((this.position.x + (13 / 2)) / 13) * 13, Math.floor((this.position.z + (13 / 2)) / 13) * 13];
    }

    updateBullets(scene: THREE.Scene, entities: Entity[]) {}

    update(player: Player, delta: number, obstacles: Obstacle[]) {
    }
}