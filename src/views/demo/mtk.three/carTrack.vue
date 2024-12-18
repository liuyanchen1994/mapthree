<template>
  <div class="map" id="Map"></div>
</template>
<script>
import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import GLTFLoader from "three-gltf-loader";
import RingTextureEffect from "@/utils/BaseObjectPlugins/ringTextureEffect";
import tripModel from "@/utils/BaseObjectPlugins/tripModel";

export default {
  data() {
    return {};
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.loadMap("Map", () => {});
    },
    loadMap() {
      let options = {
        center: [114.4056747, 30.5121048],
        zoom: 16,
        pitch: 0,
        view: {
          projection: "baidu"
        },
        attribution: false,
        baseLayer: new maptalks.TileLayer("amapTile", {
          // cssFilter: "sepia(100%) invert(80%)",
          urlTemplate: `http://online2.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20190704`,
          subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        })
      };
      this.Map = new maptalks.Map("Map", options);
      this.Map.on("click", e => {
        console.log(e.coordinate);
      });
      this.getLayer("caseRouteLayer");
      this.initThreeLayer();
      setTimeout(() => {
        this.carAnimate();
      }, 1500);
    },
    initThreeLayer() {
      this.threeLayer = new ThreeLayer("t", {
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
        forceRenderOnZooming: true,
        animation: true
      });
      this.threeLayer.prepareToDraw = function(gl, scene, camera) {
        //环境光
        let light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(0, -10, 10);
        scene.add(light);
        //点光源
        let pl = new THREE.PointLight(0xffffff, 2, 0);
        camera.add(pl);
      };
      this.threeLayer.addTo(this.Map);
    },
    carAnimate() {
      let start = [114.4060251, 30.5152782]; //起点
      let end = [114.4020186, 30.5236081]; //终点
      let layer = this.getLayer("caseRouteLayer");
      layer.clear();

      this.Map.animateTo(
        { center: start, zoom: 19, pitch: 60 },
        { duration: 1000 },
        frm => {
          if (frm.state.playState === "finished") {
            this.getRouPlanData(start, end, path => {
              //轨迹线
              let _line = new maptalks.LineString(path, {
                symbol: {
                  lineColor: "#409EFF",
                  lineWidth: 3,
                  shadowBlur: 7,
                  shadowColor: "#409EFF"
                }
              }).addTo(layer);
              let ring = this.addCarBaseRing(start);
              //车辆轨迹动画
              this.loadCarModel(_line, path, ring);
            });
          }
        }
      );
    },
    //车辆轨迹动画
    loadCarModel(_line, path, ring, type) {
      const loader = new GLTFLoader();
      loader.load(
        "car2.gltf",
        gltf => {
          var object = gltf.scene;
          object.scale.set(0.02, 0.02, 0.02); //car
          object.rotation.set(Math.PI / 2, 0, 0);
          var v = this.threeLayer.coordinateToVector3(path[0]);
          object.position.copy(v);
          object.renderOrder = 10;

          //添加运动模型
          let tripBox = new tripModel(
            _line,
            {
              trip: true,
              rotation: true,
              tempRing: ring,
              stype: type
            },
            object,
            this.threeLayer
          );
          this.threeLayer.addMesh(object);
          this.threeLayer.addMesh(tripBox);
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
    },
    addCarBaseRing(coord) {
      //添加旋转环状
      const texture = new THREE.TextureLoader().load(
        require("@/utils/shaders/texture/circle.png")
      );
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        color: "#fff",
        side: THREE.DoubleSide
      });
      let ring = new RingTextureEffect(
        coord,
        {
          radius: 30,
          speed: 2,
          altitude: 5
        },
        material,
        this.threeLayer
      );
      this.threeLayer.addMesh(ring);
      return ring;
    },
    //百度api查询轨迹
    getRouPlanData(startPoint, endPoint, callFun) {
      let url = `http://api.map.baidu.com/directionlite/v1/driving?origin=${startPoint[1]},${startPoint[0]}&destination=${endPoint[1]},${endPoint[0]}&ak=LHbvxjEMkESd4QsxuBG5eO8sWqrpLWf0`;
      maptalks.Ajax.getJSON(
        url,
        {
          jsonp: true
        },
        (err, data) => {
          let path = [];
          path.push(startPoint);
          let steps = data.result.routes[0].steps;
          steps.forEach(item => {
            let spath = item.path.split(";")
            spath.forEach(str=>{
              let c = str.split(",")
              path.push([Number(c[0]),Number(c[1])])
            })
          });
          path.push(endPoint);
          callFun(path);
        }
      );
    },
    getLayer(layerid) {
      if (!this.Map) return;
      let layer = this.Map.getLayer(layerid);
      !layer &&
        (layer = new maptalks.VectorLayer(layerid, {
          forceRenderOnMoving: true,
          forceRenderOnRotating: true,
          forceRenderOnZooming: true,
          enableAltitude: true,
          enableSimplify: false
        }).addTo(this.Map)); //创建图层
      return layer;
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
</style>
