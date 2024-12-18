<template>
  <div class="map" id="Map"></div>
</template>
<script>
import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { rippleWallMaterial } from "@/utils/shaders/wall/material";
export default {
  data() {
    return {
      map: null,
      threeLayer: null
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const map = new maptalks.Map("Map", {
        center: [121.52790925937662, 31.2306552809], //武汉
        zoom: 13,
        // minZoom: 15,
        // pitch: 60,
        view: {
          projection: "baidu"
        },
        attribution: false,
        baseLayer: new maptalks.TileLayer("base", {
          urlTemplate: `http://online2.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1`,
          subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }).hide()
      });
      map.on("click", e => {
        console.log(e.coordinate);
      });
      let threeLayer = new ThreeLayer("t", {
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
        forceRenderOnZooming: true,
        animation: true
      });
      threeLayer.prepareToDraw = (gl, scene, camera) => {
        let light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(0, -10, 0);
        light.intensity = 0.6;
        scene.add(light);
        let pl = new THREE.PointLight(0xffffff);
        pl.position.set(0, 15, 10);
        pl.intensity = 0.5;
        // camera.add(pl);
        let am = new THREE.AmbientLight("#ffffff");
        am.intensity = 0.5;
        scene.add(am);

        const loader = new GLTFLoader();
        loader.load(
          // "http://172.16.1.25:1013/3DModel/obj/bengzhan/bz.gltf",
          "./model/scene.gltf",
          gltf => {
            // called when the resource is loaded
            var object = gltf.scene;
            object.scale.set(0.0001, 0.0001, 0.0001);
            // object.scale.set(0.005, 0.005, 0.005);
            object.rotation.set((Math.PI * 5) / 2, 0, 0);
            var v = threeLayer.coordinateToVector3(map.getCenter(), 0);
            object.position.copy(v);
            gltf.scene.traverse(object => {
              // let material = rippleWallMaterial();
              // object.material = material;
            });
            // object.renderOrder = 5;
            threeLayer.addMesh(object);
            // threeLayer.renderScene();
          },
          xhr => {
            // called while loading is progressing
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          error => {
            // called when loading has errors
            console.error("An error happened", error);
          }
        );
      };
      threeLayer.addTo(map);
    }
  }
};
</script>

<style lang="less">
.map {
  width: 100%;
  height: 100vh;
  // background: #000a31;
}
.eventInfo {
  width: 310px;
  height: 160px;
  background: url(../texture/eventInfo.png);
}
.videoInfo {
  width: 310px;
  height: 200px;
  background: rgba(20, 14, 3, 0.8);
  border: 1px solid rgba(154, 155, 157, 1);
  //   position: absolute;
  //   left: 500px;
  //   top: 300px;
  //   z-index: 111;
  .main {
    width: 290px;
    height: 180px;
    margin: 10px;
  }
  .dot {
    width: 5px;
    height: 5px;
    background: #f7c95c;
    position: absolute;
    z-index: 3;
  }
  .topLeft {
    top: -2px;
    left: -2px;
  }
  .topRight {
    top: -2px;
    right: -2px;
  }
  .bottomLeft {
    bottom: -2px;
    left: -2px;
  }
  .bottomRight {
    bottom: -2px;
    right: -2px;
  }
}
</style>
