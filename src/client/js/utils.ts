import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export async function loadModel(url: URL, loader: GLTFLoader): Promise<THREE.Group> {
    // var model: THREE.Group = new THREE.Group()

    // loading gltf models
    // loader.load(url.href, (gltf: GLTF) => {
    //     model = gltf.scene
    // })
    var model: THREE.Group = (await loader.loadAsync(url.href)).scene

    return model
}