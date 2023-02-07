import Entity from "./Entity";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Obstacle from "./Obstacle";
import Player from "./Player";
import { dir } from "console";

class NPC extends Entity {
    _cityMap: Map<string, number[][]>;
    _currentRoad: number[];
    constructor(map: Map<string, number[][]>, startRoad: number[]) {
        super();
        this._cityMap = map;
        this._currentRoad = startRoad;

    }

}

class Officer extends NPC {
    constructor(map: Map<string, number[][]>, startRoad: number[]) {
        super(map, startRoad);
        this._init();
    }

    _init() {
    }
}

class Pedestrian extends NPC {
    _walkDirection: number[];
    _walkSpeed = Math.random() * 2 + 0.5;
    _directionChangeTime = 0;
    _mixer: any = undefined;
    _animations: THREE.AnimationClip[] = [];
    scared: boolean = false;
    constructor(map: Map<string, number[][]>, startRoad: number[]) {
        super(map, startRoad);
        let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        let randomIndex = Math.floor(Math.random() * dirs.length);
        this._walkDirection = dirs[randomIndex];
        this._init();
    }

    _getDirection(delta: number) {

        let options = this._cityMap.get(this._currentRoad.toString());
        if (options === undefined) {
            return false;
        }


        let cont = [this._currentRoad[0] + this._walkDirection[0] * 13, this._currentRoad[1] + this._walkDirection[1] * 13];

        if (options.some((option) => option[0] === cont[0] && option[1] === cont[1]) && Math.random() > this._directionChangeTime) {
            this._directionChangeTime += delta / 700;
            return true;
        }

        this._directionChangeTime = 0;
        let randomIndex = Math.floor(Math.random() * options.length);
        let randomOption = options[randomIndex];
        var direction = [randomOption[0] - this._currentRoad[0], randomOption[1] - this._currentRoad[1]];
        if (direction[0] > 0) direction[0] = 1;
        if (direction[0] < 0) direction[0] = -1;
        if (direction[1] > 0) direction[1] = 1;
        if (direction[1] < 0) direction[1] = -1;
        this._walkDirection = direction;
        return true;
    }

    _init() {

        this.position.set(this._currentRoad[0] + Math.random() * 6 - 3, 1, this._currentRoad[1] + Math.random() * 6 - 3);



        let loader = new GLTFLoader();
        let url = new URL('../../../assets/models/npc.glb', import.meta.url);

        loader.load(url.href, (gltf) => {
            gltf.scene.scale.set(0.12, 0.12, 0.12);
            this._mixer = new THREE.AnimationMixer(gltf.scene);

            this._animations = gltf.animations;

            //replace material
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshBasicMaterial({ color: 0x050008 });
                }
            });

            // this._mixer.clipAction(this._animations[0]).play();
            //play the first animation at walk speed
            this._mixer.clipAction(this._animations[0]).setDuration(1 / this._walkSpeed).play();


            this.object.add(gltf.scene);
        });


        this.object.position.copy(this.position);
    }


    update(player: Player, delta: number, obstacles: Obstacle[]): void {

        if (this._mixer !== undefined) {
            this._mixer.update(delta);
        }

        this._currentRoad = this.getCurrentRoad();
        while (!this._getDirection(delta)) {
            this._respawn(player);
        }
        let angle = Math.atan2(-this._walkDirection[1], this._walkDirection[0]) * 180 / Math.PI;
        this.object.rotation.y = angle * Math.PI / 180;

        this.position.x += this._walkDirection[0] * this._walkSpeed * delta;
        this.position.z += this._walkDirection[1] * this._walkSpeed * delta;

        this.object.position.copy(this.position);

        let distance = this.position.distanceTo(player.getCamera().position);
        if (distance < 10 && player.stealth <= 0) {
            console.log("distance:" + distance, "wah!");
            this.scared = true;
            // this._respawn(player);
        }
    }

    _respawn(player: Player) {
        let playerMapPosition = player.getCurrentRoad();
        let options = this._cityMap.get(playerMapPosition.toString())!;
        let randomIndex = Math.floor(Math.random() * options.length);
        let randomOption = options[randomIndex];
        let options2 = this._cityMap.get(randomOption.toString())!;
        let randomIndex2 = Math.floor(Math.random() * options2.length);
        let randomOption2 = options2[randomIndex2];
        this.position.set(randomOption2[0] + Math.random() * 6 - 3, 1, randomOption2[1] + Math.random() * 6 - 3);
        this.object.position.copy(this.position);
    }
}




export { Pedestrian, Officer };