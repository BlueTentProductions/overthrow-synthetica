import Obstacle from "./Obstacle";
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Game from "../Game";




export default class Interactable extends Obstacle {
    context: Game;
    constructor(context: Game, position: THREE.Vector3, rotation: number) {
        super(position, rotation);
        this.object = new THREE.Object3D();
        this.position = position;
        this.rotation = rotation;
        this.context = context;
        // this._loadLevel(1);

    }

    update(delta: number) {
    }
}
