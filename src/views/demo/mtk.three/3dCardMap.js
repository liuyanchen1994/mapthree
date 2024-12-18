import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import axios from "axios";

import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";
import { waterIMaterial } from "@/utils/shaders/water/material";
import { randomPoint } from "@turf/random";
import html2canvas from "html2canvas";
import ocean from "@/utils/BaseObjectPlugins/ocean";
import threeMarker from "@/utils/BaseObjectPlugins/threeMarker";
import { cgCaseInfoHtml } from "./infoHtml";
const center = [120.19158208535214, 30.239683129536814],
  zoom = 12,
  minzoom = 11,
  pitch = 40;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
    this.colors = {
      // ground: "#0F0D29",
      ground: "#031339",
      // landuse: "#1A3127",
      landuse: "#0C1F4C",
      // road: "#010001",
      road: "#2C3D5B",
      // build: "#B7BFC3",
      build: "#1F3F8A",
      water: "#090a12"
    };
    this.renderOrder = {
      ground: 1,
      landuse: 2,
      water: 3,
      road: 4,
      build: 5,
      moutain: 7
    };
    this.altitude = {
      landuse: 0.3,
      water: 0.5,
      road: 0.6,
      build: 0.7,
      moutain: 0.8
    };
    this.currentMesh = null;
    this.pointMeshes = [];
    this.wallMeshes = [];
    this.radarMeshes = [];
    this.shieldMeshes = [];
    this.buildMeshes = [];
  }

  getRandomPoint(count) {
    let extent = this.Map.getExtent();
    //随机坐标
    let coordFeature = randomPoint(count, {
      bbox: [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
    });
    let coords = [];
    coordFeature.features.forEach(g => {
      coords.push(g.geometry.coordinates);
    });
    return coords;
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
      baseLayer: new maptalks.TileLayer("base", {
        // cssFilter: "sepia(70%) invert(90%)",
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      }).hide()
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initThreeLayer();
    setTimeout(() => {
      this.loadBaseMapDatas();
    });
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

  loadBaseMapDatas() {
    // this.loadCardCanvas();
    this.loadGround();
    this.caseInfo();
    return;
    //用地
    this.loadLandUseData(() => {
      this.loadCard();
    });
  }

  //加载地面
  loadGround() {
    let material = new THREE.MeshBasicMaterial({
      color: this.colors.ground
    });
    // let v = this.threeLayer.coordinateToVector3(this.Map.getCenter());
    let ground = new customPalneBuffer(
      this.Map.getCenter(),
      {
        width: 1000000,
        height: 1000000,
        interactive: false
      },
      material,
      this.threeLayer
    );
    ground.getObject3d().position.z = -0.1;
    ground.getObject3d().renderOrder = this.renderOrder.ground;
    this.threeLayer.addMesh(ground);
  }
  //加载土地利用面pbf数据
  loadLandUseData(call) {
    const total = 88;
    for (let i = 1; i < total; i++) {
      axios
        .get(`./hangzhou/landuse/hangzhou-landuse${i}.json`, {
          responseType: "json"
        })
        .then(res => {
          let data = res.data;
          this.addLandUse(data);
          if (i == total - 1) {
            call && call();
          }
        });
    }
  }
  //加载土地利用面
  addLandUse(data) {
    let material = new THREE.MeshBasicMaterial({
      color: this.colors.landuse
    });
    let polygons = [];
    data.forEach(item => {
      let polygon = maptalks.GeoJSON.toGeometry(item);
      const properties = item.properties;
      properties.height = 0.1;
      polygon.setProperties(properties);
      polygons.push(polygon);
    });
    let landuseMesh = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: "#fff",
        interactive: false
      },
      material
    );
    landuseMesh.getObject3d().position.z = this.toThreeZ(this.altitude.landuse);
    landuseMesh.getObject3d().renderOrder = this.renderOrder.landuse;
    this.threeLayer.addMesh(landuseMesh);
  }
  //读取pbf水域数据
  loadWaterData(call) {
    const total = 55;
    for (let i = 1; i < total; i++) {
      axios
        .get(`./hangzhou/water/hangzhou-water${i}.json`, {
          responseType: "json"
        })
        .then(res => {
          let data = res.data;
          this.addWater(data);
          if (i == total - 1) {
            call && call();
          }
        });
    }
  }
  //加载水域
  addWater(data) {
    let material = new THREE.MeshBasicMaterial({
      color: this.colors.water
    });
    const t1 = new THREE.TextureLoader().load(
      require("@/utils/shaders/texture/noise.png")
    );
    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    const t2 = new THREE.TextureLoader().load(
      require("@/utils/shaders/texture/thumb_ocean.jpg")
    );
    t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
    const t3 = new THREE.TextureLoader().load(
      require("@/utils/shaders/texture/CoolWater-iChannel0.jpg")
    );
    t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
    let opts = {
      t1: t1,
      t2: t2,
      t3: t3,
      cloudCover: 0.38,
      md: 8
    };
    material = waterIMaterial(opts);
    let polygons = [];
    data.forEach(item => {
      if (item.properties.name == "钱塘江" || item.properties.name == "西湖") {
        let polygon = maptalks.GeoJSON.toGeometry(item);
        const properties = item.properties;
        properties.height = 0.1;
        polygon.setProperties(properties);
        polygons.push(polygon);
      }
    });
    if (!polygons.length) return;
    // let waterMesh = this.threeLayer.toExtrudePolygons(
    //   polygons,
    //   {
    //     topColor: "#fff",
    //     interactive: false
    //   },
    //   material
    // );
    polygons.forEach(ploygon => {
      var waterMesh = new ocean(
        ploygon,
        {
          speed: 1 / 100,
          // sunColor: "#f00",
          waterColor: "#33CCFF",
          alpha: 1,
          waterNormals: require("@/utils/shaders/texture/waternormals.jpg")
        },
        this.threeLayer
      );
      waterMesh.getObject3d().position.z = this.toThreeZ(this.altitude.water);
      waterMesh.getObject3d().renderOrder = this.renderOrder.water;
      this.threeLayer.addMesh(waterMesh);
    });
    // waterMesh.getObject3d().position.z = this.toThreeZ(this.altitude.water);
    // waterMesh.getObject3d().renderOrder = this.renderOrder.water;
    // this.threeLayer.addMesh(waterMesh);
  }

  loadCardCanvas() {
    const div = window.document.createElement("div");
    div.innerHTML = `
      <div id="video" class="videoInfo">
        <div class="dot topLeft"></div>
        <div class="dot topRight"></div>
        <div class="dot bottomLeft"></div>
        <div class="dot bottomRight"></div>
        <div class="main">
          <iframe src="https://www.baidu.com" width="100%" height="100%" />
        </div>
      </div>
    `;
    document.getElementById("Map").appendChild(div);
    setTimeout(() => {
      html2canvas(document.getElementById("video")).then(canvas => {
        // document.body.appendChild(canvas);
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true; //使用贴图时进行更新
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });
        let card = new customPalneBuffer(
          this.Map.getCenter(),
          {
            width: 320,
            height: 200,
            interactive: false
          },
          material,
          this.threeLayer
        );
        // card.getObject3d().position.z = -0.1;
        this.threeLayer.addMesh(card);
      });
    }, 2000);
  }

  caseInfo(data, type) {
    // let data = e.target.getProperties();
    data = {
      caseNo: "202103230004",
      areaname: "花园堡社区第三网格",
      casetype: "宣传广告",
      sbr: "jdy001",
      casetime: "2021-03-22 00:00:00",
      status: "待派遣",
      czsx: "3h"
    };
    let html = cgCaseInfoHtml(data);
    let _w = 910,
      _h = 823;
    document.body.insertAdjacentHTML("beforeend", html);
    const element = document.getElementById("info_Cgcontent");
    // element.style.zIndex = -1;
    html2canvas(element, {
      // backgroundColor: "#f00",
      backgroundColor: "transparent"
    }).then(canvas => {
      let w = this.threeLayer.distanceToVector3(_w, _w).x;
      let h = this.threeLayer.distanceToVector3(_h, _h).x;
      const geometry = new THREE.PlaneBufferGeometry(w, h, 20, 20);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true; //使用贴图时进行更新
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      material.needsUpdate = true;
      const mesh = new THREE.Mesh(geometry, material);
      const position = this.threeLayer.coordinateToVector3(
        this.Map.getCenter(),
        h / 2
      );
      mesh.position.copy(position);
      mesh.rotation.x = Math.PI / 2;
      mesh.renderOrder = 111111;
      this.threeLayer.addMesh(mesh);
      setTimeout(() => {
        document.body.removeChild(element);
      }, 2000);
    });
  }

  loadCard() {
    // const div = window.document.createElement("div");
    let html = `
      <div id="eventInfo" class="eventInfo">
      aaa
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
    const element = document.getElementById("eventInfo");
    // element.style.zIndex = -1;
    html2canvas(element, {
      backgroundColor: "transparent",
      // backgroundColor: "transparent",
      useCORS: true
    }).then(canvas => {
      let w = this.threeLayer.distanceToVector3(310, 310).x;
      let h = this.threeLayer.distanceToVector3(160, 160).x;
      const geometry = new THREE.PlaneBufferGeometry(w, h, 2);

      // const material = new THREE.SpriteMaterial({
      //   map: new THREE.CanvasTexture(canvas),
      //   blending: THREE.AdditiveBlending,
      //   transparent: true,
      //   sizeAttenuation: true
      // });
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true; //使用贴图时进行更新
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      const position = this.threeLayer.coordinateToVector3(
        this.Map.getCenter(),
        h / 2
      );
      mesh.position.copy(position);
      mesh.rotation.x = Math.PI / 2;
      mesh.renderOrder = 1111;
      this.threeLayer.addMesh(mesh);
      document.body.removeChild(element);
      // let sp = new THREE.Sprite(
      //   new THREE.SpriteMaterial({
      //     map: new THREE.CanvasTexture(canvas),
      //     blending: THREE.AdditiveBlending,
      //     transparent: true,
      //     sizeAttenuation: true
      //   })
      // );
      // const position = this.threeLayer.coordinateToVector3(
      //   this.Map.getCenter()
      // );
      // sp.position.copy(position);
      // sp.name = "canvas-sprite";
      // this.threeLayer.addMesh(sp);
    });
  }

  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }
}
export default mapApi;
