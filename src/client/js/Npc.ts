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
    _aggro: boolean = true;
    _walkDirection: number[];
    // _walkSpeed = Math.random() * 1 + 1.5;
    _walkSpeed = Math.random() * 1 + 5.5;
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

    _init() {

        this.position.set(this._currentRoad[0] + Math.random() * 6 - 3, 1, this._currentRoad[1] + Math.random() * 6 - 3);



        let loader = new GLTFLoader();
        let url = new URL('../../../assets/models/npc-enemy.glb', import.meta.url);

        loader.load(url.href, (gltf) => {
            gltf.scene.scale.set(0.12, 0.12, 0.12);
            this._mixer = new THREE.AnimationMixer(gltf.scene);

            this._animations = gltf.animations;

            //replace material
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshBasicMaterial({ color: 0xff0048 });
                }
            });

            // this._mixer.clipAction(this._animations[0]).play();
            //play the first animation at walk speed
            this._mixer.clipAction(this._animations[0]).setDuration(1 / this._walkSpeed).play();


            this.object.add(gltf.scene);
        });


        this.object.position.copy(this.position);
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

    _move(delta: number, obstacles: Obstacle[]) {
        let angle = Math.atan2(-this._walkDirection[1], this._walkDirection[0]) * 180 / Math.PI;
        this.object.rotation.y = angle * Math.PI / 180;

        this.position.x += this._walkDirection[0] * this._walkSpeed * delta;
        this.position.z += this._walkDirection[1] * this._walkSpeed * delta;



    }

    _chase(player: Player, delta: number, obstacles: Obstacle[]) {
        let playerMapPosition = player.getCurrentRoad();
        if (playerMapPosition == this._currentRoad) {
            return;
        }

        let path = this._findPath(playerMapPosition, obstacles);

        //if path is empty, return
        if (path.length === 0) {
            return;
        }

        // let nextRoad be the last element of the path
        let nextRoad = path[path.length - 1];

        this._walkDirection = [nextRoad[0] - this._currentRoad[0], nextRoad[1] - this._currentRoad[1]];



        if (this._walkDirection[0] > 0) this._walkDirection[0] = 1;
        if (this._walkDirection[0] < 0) this._walkDirection[0] = -1;
        if (this._walkDirection[1] > 0) this._walkDirection[1] = 1;
        if (this._walkDirection[1] < 0) this._walkDirection[1] = -1;

        this._move(delta, obstacles);


    }

    _findPath(playerMapPosition: number[], obstacles: Obstacle[]) {
        let path: number[][] = [];
        let current = this._currentRoad;
        let visited: number[][] = [];
        let queue: number[][] = [];
        let parent: Map<string, number[]> = new Map();
        queue.push(current);
        while (queue.length > 0) {
            current = queue.shift()!;
            if (current[0] === playerMapPosition[0] && current[1] === playerMapPosition[1]) {
                break;
            }
            let options = this._cityMap.get(current.toString())!;
            for (let option of options) {
                if (!visited.some((visitedOption) => visitedOption[0] === option[0] && visitedOption[1] === option[1])) {
                    visited.push(option);
                    queue.push(option);
                    parent.set(option.toString(), current);
                }
            }
        }
        while (current[0] !== this._currentRoad[0] || current[1] !== this._currentRoad[1]) {
            path.push(current);
            current = parent.get(current.toString())!;
        }
        return path;
    }



    _patrol(player: Player, delta: number, obstacles: Obstacle[]) {
        while (!this._getDirection(delta)) {
            this._respawn(player);
        }
        this._move(delta, obstacles);
    }


    update(player: Player, delta: number, obstacles: Obstacle[]): void {
        this._currentRoad = this.getCurrentRoad();
        if (this._aggro) {
            // this._aggro = false;
            this._chase(player, delta, obstacles);
        } else {
            this._patrol(player, delta, obstacles);
        }

        this.object.position.copy(this.position);
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