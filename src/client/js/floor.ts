import * as THREE from 'three'

export default class Floor {
    geometry: THREE.PlaneGeometry;
    material: THREE.MeshBasicMaterial;
    mesh: THREE.Mesh;

    constructor(worldSize: number) {
        this.geometry = new THREE.PlaneGeometry(worldSize, worldSize, worldSize, worldSize);
        this.geometry.rotateX(- Math.PI / 2);
        this.material = new THREE.MeshLambertMaterial({
            color: 0x84817c,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.receiveShadow = true;
    }
}