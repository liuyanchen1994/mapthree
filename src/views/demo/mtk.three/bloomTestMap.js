import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import axios from "axios";

import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";
import { waterIMaterial } from "@/utils/shaders/water/material";
import { randomPoint } from "@turf/random";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { MeshLineMaterial } from "@/utils/BaseObjectPlugins/THREE.MeshLine";
import spriteLine from "@/utils/BaseObjectPlugins/spriteLine";
// import { GetTime } from "@/utils/assis";
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
        cssFilter: "sepia(70%) invert(90%)",
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      })
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
      this.getLayer("removeMeshLayer").clear();
    });
    this.initBloomFun();
    this.initThreeLayer();
    // this.drawGraphic("line", null)
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
      this.initBloom();
      this.setRendererRenderScene();
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
  initBloomFun() {
    /**
     * initBloom
     * */
    ThreeLayer.prototype.initBloom = function() {
      const params = {
        exposure: 1,
        bloomStrength: 4.5,
        bloomThreshold: 0,
        bloomRadius: 0,
        debug: false
      };
      const renderer = this.getThreeRenderer();
      const size = this.getMap().getSize();
      this.composer = new EffectComposer(renderer);
      this.composer.setSize(size.width, size.height);

      const scene = this.getScene(),
        camera = this.getCamera();
      this.renderPass = new RenderPass(scene, camera);

      this.composer.addPass(this.renderPass);

      const bloomPass = (this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height)
      ));
      bloomPass.renderToScreen = true;
      bloomPass.threshold = params.bloomThreshold;
      bloomPass.strength = params.bloomStrength;
      bloomPass.radius = params.bloomRadius;

      // composer.setSize(size.width, size.height);
      // composer.addPass(renderPass);
      this.composer.addPass(bloomPass);
      this.bloomEnable = true;
    };

    /*
    *@override  renderer.renderScene
    */
    ThreeLayer.prototype.setRendererRenderScene = function() {
      this.getRenderer().renderScene = function() {
        const layer = this.layer;
        layer._callbackBaseObjectAnimation();
        this._syncCamera();

        const renderer = this.context,
          camera = this.camera,
          scene = this.scene;
        if (
          layer.bloomEnable &&
          layer.composer &&
          layer.composer.passes.length > 1
        ) {
          if (renderer.autoClear) {
            renderer.autoClear = false;
          }
          if (layer.bloomPass) {
            camera.layers.set(1);
          }
          if (layer && layer.composer) {
            layer.composer.render(0);
          }
          renderer.clearDepth();
          camera.layers.set(0);
          renderer.render(scene, camera);
        } else {
          if (!renderer.autoClear) {
            renderer.autoClear = true;
          }
          renderer.render(scene, camera);
        }

        this.completeRender();
      };
    };
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
    this.loadGround();
    //用地
    this.loadLandUseData(() => {
      //水域
      this.loadWaterData(() => {
        //道路
        this.loadRoadData(() => {});
      });
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
      { topColor: "#fff", interactive: false },
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
    let opts = { t1: t1, t2: t2, t3: t3, cloudCover: 0.38, md: 8 };
    material = waterIMaterial(opts);
    let polygons = [];
    data.forEach(item => {
      if (item.properties.name == "钱塘江") {
        let polygon = maptalks.GeoJSON.toGeometry(item);
        const properties = item.properties;
        properties.height = 0.1;
        polygon.setProperties(properties);
        polygons.push(polygon);
      }
    });
    if (!polygons.length) return;
    let waterMesh = this.threeLayer.toExtrudePolygons(
      polygons,
      { topColor: "#fff", interactive: false },
      material
    );
    waterMesh.getObject3d().position.z = this.toThreeZ(this.altitude.water);
    waterMesh.getObject3d().renderOrder = this.renderOrder.water;
    this.threeLayer.addMesh(waterMesh);
  }
  //读取道路pbf数据
  loadRoadData(call) {
    const total = 98;
    for (let i = 1; i < total; i++) {
      axios
        .get(`./hangzhou/road/hangzhou-roads${i}.json`, {
          responseType: "json"
        })
        .then(res => {
          let data = res.data;
          this.addRoad(data);
          if (i == total - 1) {
            call && call();
          }
        });
    }
  }
  //加载道路
  addRoad(data) {
    // let material = new THREE.MeshBasicMaterial({
    //   color: this.colors.road,
    // });
    let material = new THREE.LineBasicMaterial({
      linewidth: 2,
      color: this.colors.road,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    let lineStrings = [];
    data.forEach(item => {
      let linestring = maptalks.GeoJSON.toGeometry(item);
      lineStrings.push(linestring);
    });
    let roadMeshes = this.threeLayer.toLines(
      lineStrings,
      { interactive: false },
      // { interactive: false, minZoom: 11, maxZoom: 19 },
      material
    );
    roadMeshes.getObject3d().layers.enable(1);
    roadMeshes.getObject3d().renderOrder = this.renderOrder.road;
    this.threeLayer.addMesh(roadMeshes);
    lineStrings.forEach(line => {
      if (line.getCoordinates().length > 100) this.loadTrail(line);
    });
  }
  loadTrail(linestring) {
    const img = require("@/utils/shaders/texture/nanshan-road2.png");
    const texture = new THREE.TextureLoader().load(img);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    let camera = this.threeLayer.getCamera();

    const material = new MeshLineMaterial({
      map: texture,
      // color: "#f00",
      useMap: true,
      lineWidth: 7,
      sizeAttenuation: false,
      transparent: true,
      near: camera.near,
      far: camera.far
    });
    // let linestring = new maptalks.LineString(coordinates);
    let trail = new spriteLine(
      linestring,
      { altitude: 0, speed: 0.3 },
      material,
      this.threeLayer
    );

    // var amaterial = new THREE.MeshBasicMaterial({
    //   color: "#FD914B",
    //   transparent: true,
    //   blending: THREE.AdditiveBlending
    // });
    // let trail = this.threeLayer.toExtrudeLine(
    //   linestring,
    //   { altitude: 1, width: 4, height: 1 },
    //   // { interactive: false, minZoom: 11, maxZoom: 19 },
    //   amaterial
    // );
    // const zindex = this.threeLayer.distanceToVector3(trailZ, trailZ).x;
    trail.getObject3d().position.z = 0.4;
    trail.getObject3d().renderOrder = 110;
    trail.getObject3d().layers.enable(1);
    this.threeLayer.addMesh(trail);
  }
  topDeal(mesh, topColor) {
    topColor = new THREE.Color(topColor);
    const bufferGeometry = mesh.getObject3d().geometry;
    const geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);
    const { vertices, faces, faceVertexUvs } = geometry;
    for (let i = 0, len = faces.length; i < len; i++) {
      const { a, b, c } = faces[i];
      const p1 = vertices[a],
        p2 = vertices[b],
        p3 = vertices[c];
      //top face
      if (p1.z > 0 && p2.z > 0 && p3.z > 0) {
        const vertexColors = faces[i].vertexColors;
        for (let j = 0, len1 = vertexColors.length; j < len1; j++) {
          vertexColors[j].r = topColor.r;
          vertexColors[j].g = topColor.g;
          vertexColors[j].b = topColor.b;
        }
        const uvs = faceVertexUvs[0][i];
        for (let j = 0, len1 = uvs.length; j < len1; j++) {
          uvs[j].x = 0;
          uvs[j].y = 0;
        }
      }
    }
    mesh.getObject3d().geometry = new THREE.BufferGeometry().fromGeometry(
      geometry
    );
    bufferGeometry.dispose();
    geometry.dispose();
    return mesh;
  }

  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }

  randomNum(Min, Max) {
    let Range = Max - Min;
    let Rand = Math.random();
    if (Math.round(Rand * Range) == 0) {
      return Min + 1;
    } else if (Math.round(Rand * Max) == Max) {
      return Max - 1;
    } else {
      let num = Min + Math.round(Rand * Range) - 1;
      return num;
    }
  }

  getThreeLayer(layerid, call) {
    let layer;
    if (!this.Map) return;
    if (this.Map.getLayer(layerid)) {
      //根据图层id获取图层
      layer = this.Map.getLayer(layerid); //获取图层
    } else {
      layer = new ThreeLayer(layerid, {
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
        forceRenderOnZooming: true,
        animation: true
      });
      layer.prepareToDraw = (gl, scene, camera) => {
        let plcolor = "#fff",
          drcolor = "#fff";
        //环境光
        let light = new THREE.DirectionalLight(drcolor, 2);
        light.position.set(-90, 10, 100);
        scene.add(light);
        //点光源
        let pl = new THREE.PointLight(plcolor, 1, 0);
        // camera.add(pl);
      };
      layer.addTo(this.Map);
    }
    setTimeout(() => {
      call && call(layer);
    }, 300);
  }
}
export default mapApi;
