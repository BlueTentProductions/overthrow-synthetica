import Obstacle from "./Obstacles/Obstacle";
import Player from "./Player";
import * as THREE from "three";
import Game from "./Game";


export default class Entity {
    object = new THREE.Object3D();
    position = new THREE.Vector3();
    projectile_ownership = 1;
    context: Game;
    collisionBox: THREE.Box3 = new THREE.Box3();
    health: number = 100;
    maxHealth: number = 100;
    constructor(context: Game) {
        this.context = context;

    }
    getCurrentRoad() {
        return [Math.floor((this.position.x + (13 / 2)) / 13) * 13, Math.floor((this.position.z + (13 / 2)) / 13) * 13];
    }

    updateBullets(scene: THREE.Scene, entities: Entity[]) { }

    update(player: Player, delta: number, obstacles: Obstacle[]) {
    }

    damage(amount: number) {
        this.health -= amount;
        //flash red
        // this.object.children[0].material.color.setHex(0xff0000);
        // setTimeout(() => {
        //     this.object.children[0].material.color.setHex(0xffffff);
        // }
        //     , 100);


    }
}