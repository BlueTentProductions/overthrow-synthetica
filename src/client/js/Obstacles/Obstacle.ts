import * as THREE from 'three';

export default class Obstacle {
    collisionBox = new THREE.Box3();
    object = new THREE.Object3D();
    position = new THREE.Vector3();
    name = 'obstacle';
    rotation = 0;


    constructor(position: THREE.Vector3, rotation: number) {
        this.object = new THREE.Object3D();
        this.position = position;
        this.rotation = rotation;
        // this._loadLevel(1);

    }

}
