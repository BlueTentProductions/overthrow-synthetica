import * as THREE from "three";
import Entity from "../Entity";
import Player from "../Player";
import Obstacle from "../Obstacles/Obstacle";

export default class Particle {
    object = new THREE.Object3D();
    life = 0;
    _maxLife = 0;
    position = new THREE.Vector3();
    _direction = new THREE.Vector3();
    _speed = 0;
    _scale = 1;
    _dynamic_scale = false;
    constructor(life: number, position: THREE.Vector3, direction: THREE.Vector3, speed: number, color: number = 0xffffff, scale: number = 1, dynamic_scale: boolean = false) {
        this.life = life;
        this._maxLife = life;
        //make object a tetraheron
        let geometry = new THREE.TetrahedronGeometry(0.5);
        let material = new THREE.MeshLambertMaterial({
            color: color,
        });
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);
        this.object.position.set(position.x, position.y, position.z);
        //make rotation random
        this.object.rotation.x = Math.random() * 2 * Math.PI;
        this.object.rotation.y = Math.random() * 2 * Math.PI;
        this.object.rotation.z = Math.random() * 2 * Math.PI;

        this._scale = scale;
        this.object.scale.set(this._scale, this._scale, this._scale);

        this._speed = speed;
        this._direction = direction;

        this._dynamic_scale = dynamic_scale;



    }

    update(delta: number) {
        this.life -= delta;
        this.object.position.add(this._direction.clone().multiplyScalar(this._speed * delta));

        if (this._dynamic_scale) {
            let scale = this.life / this._maxLife * this._scale;
            this.object.scale.set(scale, scale, scale);
        }


    }
}