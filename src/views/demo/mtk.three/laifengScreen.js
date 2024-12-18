import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

import cover from "@mapbox/tile-cover";
import rgbTerrain from "@/utils/BaseObjectPlugins/rgbImageTerrain";

import ringTexture from "@/utils/BaseObjectPlugins/ringTextureEffect";
import polygonWall from "@/utils/BaseObjectPlugins/polygonWall";

import arcLine from "@/utils/BaseObjectPlugins/arcLine";
import { MeshLineMaterial } from "@/utils/BaseObjectPlugins/THREE.MeshLine";
import threeMarker from "@/utils/BaseObjectPlugins/threeMarker";

import { textureBuildMaterial } from "@/utils/shaders/wall/material";
const showBaseMap = false;
const center = [109.40461893450272, 29.508846274956404],
  zoom = 15,
  minzoom = 12,
  maxzoom = 17,
  pitch = 30;
const waterUrl =
  "http://122.189.98.165:8085/arcgis/rest/services/lf/map/MapServer/42";
const roadUrl =
  "http://122.189.98.165:8085/arcgis/rest/services/lf/map/MapServer/40";
const houseUrl =
  "http://122.189.98.165:8085/arcgis/rest/services/lf/map/MapServer/41";
var gui = null;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
    this.directionLight = null;
    this.colors = {
      ground: "#0E1017",
      landuse: "#DAE0E4",
      road: "#acd0e1",
      road2: "#5C6E8A",
      // build: "#E8E1E8",
      build: "#CDDAFF",
      water: "#7FBFDC"
    };
    this.renderOrder = {
      ground: 0,
      shadowground: 1,
      landuse: 2,
      water: 3,
      road: 4,
      build: 5,
      moutain: 7
    };
    this.altitude = {
      landuse: 0.01,
      water: 0.02,
      road: 0.03,
      build: 0.04,
      moutain: 0.05
    };
    this.currentMesh = null;
    this.pointMeshes = [];
    this.wallMeshes = [];
    this.radarMeshes = [];
    this.shieldMeshes = [];
    this.buildMeshes = [];
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
      // minZoom: minzoom,
      // maxZoom: maxzoom,
      pitch: pitch,
      attribution: false,
      baseLayer: new maptalks.TileLayer("base", {
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      }).hide()
    });
    let layer = this.Map.getLayer("base");
    showBaseMap ? layer.show() : layer.hide();
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initThreeLayer();
    callFun && callFun();
  }

  /**
   * 三维图层初始化
   */
  initThreeLayer(call) {
    this.threeLayer = new ThreeLayer("t", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      const dlposition = this.threeLayer.coordinateToVector3(
        [109.46995485396496, 29.526875814188287],
        10
      );
      const plposition = this.threeLayer.coordinateToVector3(
        // [109.37480844342463, 29.500091014062804],
        this.Map.getCenter(),
        50
      );
      this.pointLight = new THREE.PointLight("#fff");
      this.pointLight.position.copy(plposition);
      scene.add(this.pointLight);

      let pointLightHelper = new THREE.PointLightHelper(
        this.pointLight,
        1,
        "blue"
      );
      scene.add(pointLightHelper);

      this.directionLight = new THREE.DirectionalLight("#fff");
      this.directionLight.position.set(-70, -50, 0);
      // this.directionLight.position.copy(dlposition);
      // this.directionLight.castShadow = true;
      // const d = 100;
      // this.directionLight.shadow.camera.left = -d;
      // this.directionLight.shadow.camera.right = d;
      // this.directionLight.shadow.camera.top = d;
      // this.directionLight.shadow.camera.bottom = -d;
      // this.directionLight.shadow.mapSize.width = 512 * 3;
      // this.directionLight.shadow.mapSize.height = 512 * 3;
      scene.add(this.directionLight);
      let lightHelper = new THREE.DirectionalLightHelper(
        this.directionLight,
        5,
        "red"
      );
      scene.add(lightHelper);

      this.amblight = new THREE.AmbientLight("#fff");
      // scene.add(this.amblight);
      this.threeLayer.getThreeRenderer().shadowMap.enabled = true;
      this.threeLayer.getThreeRenderer().shadowMap.needsUpdate = true;
      // this.threeLayer.getThreeRenderer().setClearColor("#42586f");
      this.initGui();
      this.loadBaseMapDatas();
    };
    this.threeLayer.addTo(this.Map);
    call && call();
  }

  initGui() {
    var params = {
      directLight_x: this.directionLight.position.x,
      directLight_y: this.directionLight.position.y,
      directLight_z: this.directionLight.position.z,
      directLight2_x: this.directionLight.position.x,
      directLight2_y: this.directionLight.position.y,
      directLight2_z: this.directionLight.position.z
    };

    gui = new GUI();

    gui.add(params, "directLight_x", -360, 360).onChange(() => {
      this.directionLight.position.x = params.directLight_x;
    });
    gui.add(params, "directLight_y", -360, 360).onChange(() => {
      this.directionLight.position.y = params.directLight_y;
    });
    gui.add(params, "directLight_z", -200, 500).onChange(() => {
      this.directionLight.position.z = params.directLight_z;
    });
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
    this.loadWaterData(() => {
      //道路
      this.loadRoadData(() => {
        //建筑
        // return;
        this.loadBuildData(() => {
          // this.loadTerrain();
          // this.addCircle();
        });
      });
    });
  }

  loadGround() {
    let material = new THREE.MeshBasicMaterial({
      color: this.colors.ground
    });
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
  loadWaterData(call) {
    this.queryTask({ where: "1=1" }, waterUrl, result => {
      if (!result.features.length) return;
      let features = result.features;
      this.addWater(features);
      call && call();
    });
  }
  addWater(data) {
    let material = new THREE.MeshBasicMaterial({
      color: this.colors.water
    });

    let polygons = [];
    data.forEach(item => {
      let rings = item.geometry.rings;
      let polygon = new maptalks.Polygon(rings);
      const properties = {};
      properties.height = 0.1;
      polygon.setProperties(properties);
      polygons.push(polygon);
    });
    if (!polygons.length) return;
    let waterMesh = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: this.colors.water,
        bottomColor: "#fff",
        interactive: false
      },
      material
    );
    // waterMesh.getObject3d().position.z = this.toThreeZ(this.altitude.water);
    waterMesh.getObject3d().renderOrder = this.renderOrder.water;
    this.threeLayer.addMesh(waterMesh);
  }

  loadRoadData(call) {
    this.queryTask({ where: "1=1" }, roadUrl, result => {
      if (!result.features.length) return;
      let features = result.features;
      this.addRoad(features);
      call && call();
    });
  }
  //加载道路
  addRoad(data) {
    let material = new THREE.MeshBasicMaterial({
      color: this.colors.road
    });

    let polygons = [];
    data.forEach(item => {
      let rings = item.geometry.rings;
      let polygon = new maptalks.Polygon(rings);
      const properties = {};
      properties.height = 0.1;
      polygon.setProperties(properties);
      polygons.push(polygon);
    });
    if (!polygons.length) return;
    let waterMesh = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: this.colors.road,
        bottomColor: "#fff",
        interactive: false
      },
      material
    );
    // waterMesh.getObject3d().position.z = this.toThreeZ(this.altitude.water);
    waterMesh.getObject3d().renderOrder = this.renderOrder.water;
    this.threeLayer.addMesh(waterMesh);
  }
  random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  loadBuildData(call) {
    const height = [5, 5, 5, 30, 20, 20, 40, 40, 60, 2, 2, 2];
    for (let i = 0; i < 40; i++) {
      this.queryTask(
        { where: `FID > ${i * 1000} and FID < ${i * 1000 + 1000}` },
        houseUrl,
        result => {
          if (!result.features.length) return;
          let features = result.features;
          let polygons = [];
          features.forEach(item => {
            let polygon = new maptalks.Polygon(item.geometry.rings);
            // let prop = { height: height[this.random(4, 7)] };
            let prop = { height: 0.1 };
            polygon.setProperties(prop);
            polygons.push(polygon);
          });
          this.addBuilding(polygons);
          call && call();
        }
      );
    }
  }
  addBuilding(polygons) {
    //MeshLambertMaterial MeshBasicMaterial MeshPhongMaterial
    // var material = new THREE.MeshBasicMaterial({
    //   color: this.colors.build
    // });
    var material = new THREE.MeshPhongMaterial({
      color: this.colors.build
      // transparent: true
    });
    const t1 = new THREE.TextureLoader().load(
      require("@/utils/shaders/texture/t1.png")
    );
    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    const material1 = textureBuildMaterial({
      opacity: 1,
      color: "#EDD464",
      texture: t1
    });
    let mesh = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: "#fff",
        // bottomColor: "#c1bfbf",
        interactive: false
      },
      material
    );
    // this.topDeal(mesh, "#CDDAFF");
    // mesh.getObject3d().castShadow = true;
    this.threeLayer.addMesh(mesh);
  }
  generateTextureCanvas() {
    // build a small canvas 32x64 and paint it in white
    var canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 64;
    var context = canvas.getContext("2d");
    // plain it in white
    context.fillStyle = "#C9D1EB";
    context.fillRect(0, 0, 32, 64);
    // draw the window rows - with a small noise to simulate light variations in each room
    for (var y = 2; y < 64; y += 2) {
      for (var x = 0; x < 32; x += 2) {
        var value = Math.floor(Math.random() * 64);
        context.fillStyle = "rgb(" + [value, value, value].join(",") + ")";
        context.fillRect(x, y, 2, 1);
      }
    }

    // build a bigger canvas and copy the small one in it
    // This is a trick to upscale the texture without filtering
    var canvas2 = document.createElement("canvas");
    canvas2.width = 128;
    canvas2.height = 256;
    var context = canvas2.getContext("2d");
    // disable smoothing
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    // then draw the image
    context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
    // return the just built canvas2
    return canvas2;
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
  queryTask(option, url, callfun) {
    let _url = url + this.parseQueryString(option);
    maptalks.Ajax.getJSON(
      _url,
      {
        jsonp: true
      },
      (obj, data) => {
        callfun(data);
      }
    );
  }
  parseQueryString(option) {
    let queryString = "/query?";
    let geometry = option.geometry || "";
    let where = option.where || "1=1";
    let condition = {
      where: encodeURIComponent(where),
      geometry:
        geometry instanceof Object ? JSON.stringify(geometry) : geometry,
      geometryType: option.geometryType || "esriGeometryPoint",
      inSR: option.inSR || "",
      spatialRel: option.esriSpatialRelIntersects || "esriSpatialRelIntersects",
      relationParam: option.relationParam || "",
      objectIds: option.objectIds || "",
      time: option.time || "",
      returnCountOnly: option.returnCountOnly || false,
      returnGeometry: option.returnGeometry || true,
      maxAllowableOffset: option.maxAllowableOffset || "",
      outSR: option.outSR || "",
      text: option.text || "",
      outFields: option.outFields || "*"
    };
    for (let p in condition) {
      queryString += "&" + p + "=" + condition[p];
    }
    queryString += "&f=pjson";
    return queryString;
  }
}
export default mapApi;
