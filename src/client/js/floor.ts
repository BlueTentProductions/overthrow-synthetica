import * as THREE from 'three'

export default class Floor {
    geometry: THREE.PlaneGeometry
    material: THREE.MeshBasicMaterial
    mesh: THREE.Mesh

    constructor(worldSize: number) {
        this.geometry = new THREE.PlaneGeometry(worldSize, worldSize, worldSize, worldSize)
        this.geometry.rotateX(- Math.PI / 2)
        this.material = new THREE.MeshBasicMaterial({
            color: 0x1AD1FF,
            wireframe: true,
        })
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    }
}