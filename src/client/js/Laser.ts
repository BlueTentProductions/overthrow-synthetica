import * as THREE from "three";
import Entity from "./Entity";
import Player from "./Player";
import Obstacle from "./Obstacle";

export default class Laser extends Entity {
    mesh: THREE.Mesh;
    collisionBox: THREE.Box3 = new THREE.Box3();
    direction: THREE.Quaternion;
    length: number;
    constructor(mesh: THREE.Mesh, direction: THREE.Quaternion, length: number) {
        super();
        this.mesh = mesh;
        this.direction = direction;
        this.length = length;
        this._init()
    }

    _init(): void {
        this.collisionBox = this.getLaserBox();
    }

    update(player: Player, delta: number, obstacles: Obstacle[]): void {
        this.moveLaser(delta, player);
    }

    moveLaser(delta: number, player: Player): void {
        if (this.collisionBox.intersectsBox(player.collisionBox)) {
            player.health -= Math.random() * 3;
        }

        if (this.collisionBox.min.y < 0) return;

        let forward = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.direction);
        forward.normalize();
        forward.multiplyScalar(10 * delta);
        this.mesh.position.add(forward);
        this.collisionBox.copy(this.getLaserBox());
    }
    

    getLaserBox(): THREE.Box3 {
        // get the position of the tip by moving the same direction as the bullet until reaching the tip of the bullet
        let bulletLength = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.direction);
        bulletLength.normalize();
        bulletLength.multiplyScalar(this.length / 20);
        
        // create bounding box from bullet tip, 
        let tip = this.mesh.position.clone();
        tip.add(bulletLength);
            
        const min = tip.clone().sub(new THREE.Vector3(0.2, 0.2, 0.2));
        const max = tip.clone().add(new THREE.Vector3(0.2, 0.2, 0.2));
        
        // bounding box
        return new THREE.Box3(min, max);
    }
}