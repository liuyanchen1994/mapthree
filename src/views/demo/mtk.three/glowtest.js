import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";

import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";
import { SubdivisionModifier } from "three/examples/jsm/modifiers/SubdivisionModifier";
import { textureShieldMaterial } from "@/utils/shaders/shield/material";

const center = [120.19158208535214, 30.239683129536814],
  zoom = 12,
  minzoom = 11,
  pitch = 40;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
  }

  /**
   * 加载地图
   * @param {string} domId 地图容器DIV
   * @param {function} callFun 加载完回调
   */
  loadMap(domId, callFun) {
    this.Map = new maptalks.Map(domId, {
      center: center,
      zoom: zoom,
      minZoom: minzoom,
      pitch: pitch,
      attribution: false,
      view: {
        projection: "baidu"
      },
      baseLayer: new maptalks.TileLayer(domId + "tilelayer", {
        urlTemplate: `http://online2.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20190704`,
        subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      })
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initThreeLayer();
    callFun && callFun();
  }

  /**
   * 三维图层初始化
   */
  initThreeLayer() {
    this.threeLayer = new ThreeLayer("t", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      //环境光
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, 0, 10);
      scene.add(light);
      //点光源
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      camera.add(pl);
      this.threeLayer.getThreeRenderer().setClearColor("#010A2B");
      this.loadGround();
    };
    this.threeLayer.addTo(this.Map);
    let layer = this.getLayer("aa");
    new maptalks.Marker(this.Map.getCenter()).addTo(layer);
  }
  getLayer(layerid) {
    let layer;
    if (!this.Map) return;
    if (this.Map.getLayer(layerid)) {
      //根据图层id获取图层
      layer = this.Map.getLayer(layerid); //获取图层
    } else {
      layer = new maptalks.VectorLayer(layerid, {
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
        forceRenderOnZooming: true,
        enableAltitude: true
      }).addTo(this.Map); //创建图层
    }
    return layer;
  }

  //加载地面
  loadGround() {
    var material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: require("@/utils/shaders/test/glow.vert").default,
      fragmentShader: require("@/utils/shaders/test/glow.frag").default,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    let mat = new THREE.MeshPhongMaterial({
      color: "#ff0",
      transparent: true,
      side: THREE.FrontSide
    });

    const image = require(`@/utils/shaders/texture/shield.png`);
    const texture = new THREE.TextureLoader().load(image);
    let v = this.threeLayer.coordinateToVector3(this.Map.getCenter(), 0);
    let geom = new THREE.PlaneBufferGeometry(10, 10, 10);
    let mesh = new THREE.Mesh(geom, material);
    mesh.position.copy(v);

    this.threeLayer.addMesh(mesh);
  }
  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }
}
export default mapApi;
