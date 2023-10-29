import * as THREE from "three";
import Entity from "../Entity";
import Player from "../Player";
import Obstacle from "../Obstacles/Obstacle";

export default class Item {
    object = new THREE.Object3D();
    item_type: string = "";
    constructor() {

    }
}