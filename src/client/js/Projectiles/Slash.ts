import * as THREE from "three";
import Entity from "../Entity";
import Player from "../Player";
import Obstacle from "../Obstacles/Obstacle";
import Interactable from "../Obstacles/Interactable";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Game from "../Game";
import Particle from "../Particles/Particle";
import Projectile from "./Projectile";

export default class Slash {
    object = new THREE.Object3D();
    life = 100000;
    _maxLife = 0;
    position = new THREE.Vector3();
    _direction = new THREE.Vector3();
    _speed = 0;
    _scale = 1;
    _dynamic_scale = false;
    owner: number;
    _collisionBox = new THREE.Box3();
    damage: number = 0;
    _mixer: any = undefined;
    constructor(owner: number, life: number, damage: number, position: THREE.Vector3, direction: THREE.Vector3, speed: number, color: number = 0xffffff, scale: number = 1) {
        this.damage = damage;
        this.owner = owner;
        this.life = life;
        this._maxLife = life;
        let loader = new GLTFLoader();
        let url = new URL('../../../../assets/models/slash-0.glb', import.meta.url);

        loader.load(url.href, (gltf) => {



            //set scale for all axes
            gltf.scene.scale.set(0.5, 0.5, 0.5);
            this.object.add(gltf.scene);

            console.log("animations:" + gltf.animations);

            //set mesh color to color
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshBasicMaterial({ color: color });
                }
            });

            //play animation
            this._mixer = new THREE.AnimationMixer(gltf.scene);
            //play all animations
            for (let i = 0; i < gltf.animations.length; i++) {
                this._mixer.clipAction(gltf.animations[i]).setDuration(0.75).play();
            }


        });
        this.object.position.set(position.x, position.y, position.z);


        this.object.scale.set(scale, scale, scale);

        this._speed = speed;
        this._direction = direction;

        //rotate to face direction
        this.object.lookAt(this.object.position.clone().add(this._direction));
        this._scale = scale;

        this._collisionBox.setFromObject(this.object);


    }
    //delta, this.player, this.entities, this.obstacles, this.interactables
    update(delta: number, context: Game, player: Player, entities: Entity[], obstacles: Obstacle[], interactables: Interactable[]) {

        if (this._mixer !== undefined) {
            this._mixer.update(delta);
        }
        this.life -= delta;
        this.object.position.add(this._direction.clone().multiplyScalar(this._speed * delta));
        this._collisionBox.setFromObject(this.object);

        //check for collisions
        for (let i = 0; i < entities.length; i++) {
            if (entities[i].projectile_ownership != this.owner) {
                if (this._collisionBox.intersectsBox(entities[i].collisionBox)) {
                    //attack

                    // this.life = 0;
                }
            }
        }

        //check for collisions with player
        if (this._collisionBox.intersectsBox(player.collisionBox) && this.owner != player.projectile_ownership) {
            //attack
            // this.life = 0;
        }

        // //concat obstacles and interactables
        // let o = obstacles.concat(interactables);
        // for (let i = 0; i < o.length; i++) {
        //     if (this._collisionBox.intersectsBox(o[i].collisionBox)) {
        //         this.life = 0;
        //     }
        // }




    }
}