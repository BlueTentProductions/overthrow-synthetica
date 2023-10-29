import Item from "./Item";
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Weapon from "./Weapon";



export default class Bow extends Weapon {
    constructor() {
        super();
        this.weapon_type = 0;
        this.item_type = "w_bow";


        this.init();
    }

    init() {
        let loader = new GLTFLoader();
        let url = new URL('../../../../assets/models/bow.glb', import.meta.url);

        loader.load(url.href, (gltf) => {
            // gltf.scene.scale.set(0.4, 0.4, 0.4);
            //rotate 90 degrees
            // gltf.scene.rotateY(-Math.PI / 2);


            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                }
            });

            this.object.add(gltf.scene);
        });

        //play idle animation


    }

}