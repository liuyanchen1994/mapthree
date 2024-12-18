import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";

// import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import axios from "axios";

import cover from "@mapbox/tile-cover";

import rgbTerrain from "@/utils/BaseObjectPlugins/rgbImageTerrain";
import {
  breathWallMaterial,
  fireWallMaterial,
  fireWallTwoMaterial,
  floaterWallMaterial,
  // meshPhoneMaterial,
  meteorWallMaterial,
  rippleWallMaterial,
  sparkWallMaterial,
  textureWallMaterial,
  textureBuildMaterial
} from "./shaders/wall/material";
// import { splitArrays } from "./BaseObjectPlugins/utils";

import customPalneBuffer from "./BaseObjectPlugins/customPalneBuffer";
import polygonWall from "./BaseObjectPlugins/polygonWall";
import lineWall from "./BaseObjectPlugins/lineWall";
import { waterIMaterial, waterIIMaterial } from "./shaders/water/material";
import RingEffect from "./BaseObjectPlugins/ringEffect";
import ElectricShield from "./BaseObjectPlugins/electricShield";
import threeMarker from "./BaseObjectPlugins/threeMarker";
import ocean from "./BaseObjectPlugins/ocean";
import cone from "./BaseObjectPlugins/cone";
import OutLine from "./BaseObjectPlugins/outLine";
import { randomPoint } from "@turf/random";
import {
  flabellumScanMaterial,
  radarOneMaterial,
  radarTwoMaterial,
  radarThreeMaterial,
  radarFourMaterial,
  radarFiveMaterial
} from "./shaders/radar/material";
import {
  ringSpreadMaterial,
  ringWheelMaterial,
  fogRingMaterial,
  gridPulseMaterial,
  emphasizePulseMaterial,
  alternateCurtainPulseMaterial,
  fogPulseMaterial,
  dropPulseMaterial,
  flowerPulseMaterial,
  tornadoPulseMaterial,
  vortexPulseMaterial,
  circleBreathPulseMaterial,
  dotPulseMaterial,
  breathPulseMaterial,
  rotatePulseMaterial,
  heartBeatPulseMaterial,
  dotGatherPulseMaterial,
  wavePulseMaterial,
  colorfulCircleMaterial,
  magicCircleMaterial,
  simpleFlowerMaterial
} from "./shaders/ring/material";
import {
  textureShieldMaterial,
  rippleShieldMaterial,
  composedShieldMaterial,
  electricShieldMaterial,
  alarmShieldMaterial,
  fbmShieldMaterial,
  electricRippleShieldMaterial,
  starSkyMaterial,
  SequenceShieldMaterial
} from "./shaders/shield/material";
// import UnBloomPass from "./BaseObjectPlugins/UnrealBloomPass";
// import { GetTime } from "@/utils/assis";
import html2canvas from "html2canvas";

import spriteLine from "./BaseObjectPlugins/spriteLine";
import { MeshLineMaterial } from "./BaseObjectPlugins/THREE.MeshLine";
const center = [120.19158208535214, 30.239683129536814],
  zoom = 12,
  minzoom = 11,
  pitch = 40;
const mapboxToken = `pk.eyJ1IjoibHd5c2ltcGxlIiwiYSI6ImNrNDN2d2Y0bTA1djUzZG1tcmFwcTI3bXMifQ.ppzazP39jYrBKpdUi-S7mA`;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
    // new UnBloomPass();
    this.colors = {
      // ground: "#0F0D29",
      ground: "#031339",
      // landuse: "#1A3127",
      landuse: "#0C1F4C",
      // road: "#010001",
      road: "#2C3D5B",
      // build: "#B7BFC3",
      build: "#1F3F8A",
      water: "#090a12",
      terrainTop: "#87B973",
      terrainBottom: "#0C1F4C"
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
      landuse: 0.1,
      water: 0.3,
      road: 0.4,
      build: 0.5,
      moutain: 0.6
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
      }).hide()
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
      this.getLayer("removeMeshLayer").clear();
    });
    this.Map.on("pitchend", () => {
      if (this.Map.getPitch() < 30) {
        this.Map.setPitch(30);
      }
    });
    this.initBloomFun();
    this.initThreeLayer();
    // this.drawGraphic("polygon", null);
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
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
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
    this.loadGround();
    // this.loadTerrain();
    // let object = this.loadShield("Sequence", null, {
    //   radius: 500
    // });
    // this.loadCylinder();
    // this.loadLandUseData(() => {
    //   this.loadRandomMarker();
    //   this.addThreeMarker();
    // });
    // return;
    // this.loadObjModelJson();
    // this.loadTreeMarker();
    // this.loadRandomMarker();
    //用地
    this.loadLandUseData(() => {
      //水域
      this.loadWaterData(() => {
        //道路
        this.loadRoadData(() => {
          //建筑
          this.loadBuildData(() => {
            this.loadTerrain();
            //随机标注
            this.loadRandomMarker();
          });
        });
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
    ground.getObject3d().position.z = this.toThreeZ(-0.1);
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
          // this.addWaterNew(data);
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
      require("./shaders/texture/noise.png")
    );
    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    const t2 = new THREE.TextureLoader().load(
      require("./shaders/texture/thumb_ocean.jpg")
    );
    t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
    const t3 = new THREE.TextureLoader().load(
      require("./shaders/texture/CoolWater-iChannel0.jpg")
    );
    t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
    let opts = {
      t1: t1,
      t2: t2,
      t3: t3,
      cloudCover: 0.5,
      md: 3
    };
    material = waterIMaterial(opts);
    let polygons = [];
    data.forEach(item => {
      if (item.properties.name == "钱塘江") {
        let polygon = maptalks.GeoJSON.toGeometry(item);
        const properties = item.properties;
        properties.height = 0.1;
        polygon.setProperties(properties);
        var waterMesh = new ocean(
          polygon,
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
      }
      if (item.properties.name == "西湖") {
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
      {
        topColor: "#fff",
        interactive: false
      },
      material
    );
    waterMesh.getObject3d().position.z = this.toThreeZ(this.altitude.water);
    waterMesh.getObject3d().renderOrder = this.renderOrder.water;
    this.threeLayer.addMesh(waterMesh);
  }
  addWaterNew(data) {
    const t1 = new THREE.TextureLoader().load(
      require("./shaders/texture/thumb_chromatic-noise.png")
    );
    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    const t2 = new THREE.TextureLoader().load(
      require("./shaders/texture/thumb_ocean.jpg")
    );
    t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
    const t3 = new THREE.TextureLoader().load(
      require("./shaders/texture/Slag_stone_pxr128_bmp.jpg")
    );
    t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
    let opts = {
      noise: t1,
      t2: t2,
      t3: t3
    };
    let material = waterIIMaterial(opts);
    let polygons = [];
    data.forEach(item => {
      if (item.properties.name == "钱塘江") {
        let polygon = maptalks.GeoJSON.toGeometry(item);
        const properties = item.properties;
        properties.height = 0.1;
        polygon.setProperties(properties);
        var waterMesh = new ocean(
          polygon,
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
      }
      if (item.properties.name == "西湖") {
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
      {
        topColor: "#fff",
        interactive: false
      },
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
          this.addRoad(data, i);
          if (i == total - 1) {
            call && call();
          }
        });
    }
  }
  //加载道路
  addRoad(data) {
    let material = new THREE.MeshBasicMaterial({
      color: this.colors.road
    });
    let color = this.colors.road;
    // let lineWidth = 2,
    //   isBloom = false,
    //   color = this.colors.road;
    // if (index % 5 == 0) {
    //   isBloom = true;
    //   lineWidth = 4;
    //   color: "#FE9351";
    // }
    //fatline 材质
    // material = new LineMaterial({
    //   linewidth: lineWidth,
    //   color: this.colors.road,
    //   transparent: true,
    //   // opacity: 0.7,
    //   blending: THREE.AdditiveBlending,
    // });
    //toLine 材质
    material = new THREE.LineBasicMaterial({
      linewidth: 2,
      color: color,
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
      {
        interactive: false
      },
      // { interactive: false, minZoom: 11, maxZoom: 19 },
      material
    );
    // let roadMeshes = this.threeLayer.toFatLines(
    //   lineStrings,
    //   { interactive: false },
    //   material
    // );
    roadMeshes.getObject3d().layers.enable(1);
    roadMeshes.getObject3d().renderOrder = this.renderOrder.road;
    this.threeLayer.addMesh(roadMeshes);
    lineStrings.forEach(line => {
      if (line.getCoordinates().length > 100) this.loadTrail(line);
    });
  }

  loadTrail(linestring) {
    const img = require("./shaders/texture/nanshan-road3.png");
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
    trail.getObject3d().position.z = 0.4;
    trail.getObject3d().renderOrder = 110;
    trail.getObject3d().layers.enable(1);
    this.threeLayer.addMesh(trail);
  }
  loadBuildData(call) {
    const total = 293;
    for (let i = 1; i < total; i++) {
      axios
        .get(`./hangzhou/build/hz_build${i}.json`, {
          responseType: "json"
        })
        .then(res => {
          let data = res.data;
          let polygons = [];
          data.forEach(g => {
            if (
              g &&
              g.geometry &&
              g.geometry.type == "Polygon" &&
              g.geometry.coordinates &&
              g.geometry.coordinates.length > 0
            ) {
              let polygon = maptalks.GeoJSON.toGeometry(g);
              let height = g.properties.Floor * 4;
              const properties = g.properties;
              properties.height = height;
              polygon.setProperties(properties);
              polygons.push(polygon);
            }
          });
          this.addBuilding(polygons);
          if (i == total - 1) {
            call && call();
          }
        });
    }
  }
  addBuilding(polygons) {
    const texture = new THREE.TextureLoader().load(
      require("./shaders/texture/texture_02.png")
    );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    let material = textureBuildMaterial({
      opacity: 1,
      color: "#EDD464",
      texture: texture
    });
    let mesh = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: "#fff",
        interactive: false
      }, // meshPhoneMaterial({ color: "#001138" }),
      material
    );
    this.topDeal(mesh, this.colors.build);

    ///////////////////////////////////添加外框线
    // const lineMaterial = new THREE.LineBasicMaterial({
    //   // 线的颜色
    //   color: "rgb(15,159,190)",
    //   transparent: true,
    //   linewidth: 1,
    //   opacity: 0.7
    //   //depthTest: true,
    // });
    // //解决z-flighting
    // lineMaterial.polygonOffset = true;
    // lineMaterial.depthTest = true;
    // lineMaterial.polygonOffsetFactor = 1;
    // lineMaterial.polygonOffsetUnits = 1.0;
    // var outLine = new OutLine(
    //   mesh,
    //   { interactive: false },
    //   lineMaterial,
    //   this.threeLayer
    // );
    // this.threeLayer.addMesh(outLine);

    this.threeLayer.addMesh(mesh);
  }

  loadTerrain() {
    let baseLayer = this.Map.getBaseLayer();
    baseLayer._getTileExtent = function(x, y, z) {
      const map = this.getMap(),
        res = map._getResolution(z),
        tileConfig = this._getTileConfig(),
        tileExtent = tileConfig.getTilePrjExtent(x, y, res);
      return tileExtent;
    };

    /**
     *
     * @param {} x
     * @param {*} y
     * @param {*} z
     */
    baseLayer._getTileLngLatExtent = function(x, y, z) {
      const tileExtent = this._getTileExtent(x, y, z);
      let max = tileExtent.getMax(),
        min = tileExtent.getMin();
      const map = this.getMap();
      const projection = map.getProjection();
      min = projection.unproject(min);
      max = projection.unproject(max);
      return new maptalks.Extent(min, max);
    };
    fetch("./hangzhou/west-lake-area.geojson")
      .then(res => res.json())
      .then(geojson => {
        const polygons = maptalks.GeoJSON.toGeometry(geojson);
        const polygon = polygons[0];
        // let extent = this.Map.getExtent();
        let extent = polygon.getExtent();
        // extent = {
        //   pxmax: 120.1793639103621,
        //   pxmin: 119.57947870757073,
        //   pymax: 30.274914877283294,
        //   pymin: 29.897337410322024,
        //   xmax: 120.1793639103621,
        //   xmin: 119.57947870757073,
        //   ymax: 30.274914877283294,
        //   ymin: 29.861270340202196
        // };

        const { xmin, ymin, xmax, ymax } = extent;
        let coords = [[xmin, ymin], [xmin, ymax], [xmax, ymax], [xmax, ymin]];
        let rectangle = new maptalks.Polygon([coords]);
        const tiles = cover.tiles(rectangle.toGeoJSON().geometry, {
          min_zoom: 12,
          max_zoom: 12
        });
        console.log(tiles);
        //buffer
        let minx = Infinity,
          miny = Infinity,
          maxx = -Infinity,
          maxy = -Infinity;
        tiles.forEach(tile => {
          const [x, y, z] = tile;
          const { xmin, ymin, xmax, ymax } = baseLayer._getTileLngLatExtent(
            x,
            y,
            z
          );
          minx = Math.min(minx, xmin);
          maxx = Math.max(maxx, xmax);
          miny = Math.min(miny, ymin);
          maxy = Math.max(maxy, ymax);
        });
        extent = new maptalks.Extent(minx, miny, maxx, maxy);
        coords = [[minx, miny], [minx, maxy], [maxx, maxy], [maxx, miny]];
        rectangle = new maptalks.Polygon([coords]);
        // layer.addGeometry(rectangle);
        const material = new THREE.MeshBasicMaterial({
          wireframe: false,
          color: "#FFF"
        });
        this.generateCanvas(tiles, ({ image, width, height, texture }) => {
          const terrain = new rgbTerrain(
            extent,
            {
              texture,
              imageWidth: Math.ceil(width / 1),
              imageHeight: Math.ceil(height / 1),
              image,
              factor: 2.5,
              filterIndex: true,
              altitude: -50
            },
            material,
            this.threeLayer
          );
          // lines.push(terrain);
          this.threeLayer.addMesh(terrain);
          terrain.on("load", () => {
            terrain.getObject3d();
            terrain.getObject3d().material = this.getTerrainMaterial(
              terrain.getOptions().maxZ
            );
          });
        });
      });
  }

  generateCanvas(tiles, callback) {
    let minx = Infinity,
      miny = Infinity,
      maxx = -Infinity,
      maxy = -Infinity;
    tiles.forEach(tile => {
      const [x, y, z] = tile;
      minx = Math.min(minx, x);
      maxx = Math.max(maxx, x);
      miny = Math.min(miny, y);
      maxy = Math.max(maxy, y);
    });
    // console.log(maxx, minx, maxy, miny);
    const width = (maxx - minx + 1) * 256,
      height = (maxy - miny + 1) * 256;
    console.log(width, height);
    const images = [];
    tiles.forEach(tile => {
      const [x, y, z] = tile;
      const dx = (x - minx) * 256,
        dy = (y - miny) * 256;
      images.push({
        dx,
        dy,
        tile
      });
    });
    this.generateRGBImage(width, height, images, opt => {
      this.generateTexture(width, height, images, function(opt1) {
        callback && callback(Object.assign(opt, opt1));
      });
    });
  }

  generateRGBImage(width, height, images, callback) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let idx = 0;

    function loadImage() {
      const { tile, dx, dy } = images[idx];
      const [x, y, z] = tile;
      const url = `https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${mapboxToken}`;
      // console.log(url);
      const image = new Image();
      image.src = url;
      image.crossOrigin = "Anonymous";
      image.onload = function() {
        ctx.drawImage(image, dx, dy, 256, 256);
        // console.log(canvas.toDataURL());
        idx++;
        if (idx < images.length) {
          loadImage();
        } else {
          // console.log(canvas.toDataURL());
          callback &&
            callback({
              image: canvas.toDataURL(),
              width,
              height
            });
        }
      };
    }
    loadImage();
  }

  generateTexture(width, height, images, callback) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let idx = 0;

    function loadImage() {
      const { tile, dx, dy } = images[idx];
      const [x, y, z] = tile;
      const url = `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.webp?sku=101XzrMiclXn4&access_token=${mapboxToken}`;
      // console.log(url);
      const image = new Image();
      image.src = url;
      image.crossOrigin = "Anonymous";
      image.onload = function() {
        ctx.drawImage(image, dx, dy, 256, 256);
        // console.log(canvas.toDataURL());
        idx++;
        if (idx < images.length) {
          loadImage();
        } else {
          // console.log(canvas.toDataURL());
          callback &&
            callback({
              texture: canvas.toDataURL(),
              width,
              height
            });
        }
      };
    }
    loadImage();
  }

  getTerrainMaterial(maxZ) {
    const uniforms = {
      maxHeight: {
        value: maxZ
      },
      colorTop: {
        // value: new THREE.Color("#0F1E4A")
        value: new THREE.Color(this.colors.terrainTop || "#87B973")
      },
      opacity: {
        value: 0.8
      },
      colorBottom: {
        // value: new THREE.Color("#7d8fc7")
        value: new THREE.Color(this.colors.terrainBottom || "#0C1F4C")
      }
    };
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById("vertexShader").textContent,
      fragmentShader: document.getElementById("fragmentShader").textContent
    });
    return material;
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

  loadRandomMarker() {
    let coords = this.getRandomPoint(200);
    let images = [
      "AJ1",
      "AJ2",
      "movie",
      "store",
      "youhuiquan",
      "gift",
      "badge",
      "camera",
      "AIR JORDAN 14 RETRO",
      "Lebron Soldier Xill ByYou",
      "耐克logo",
      "耐克logo2"
    ];
    let bools = [true, false];
    coords.forEach(item => {
      this.loadRunMarker(item, {
        imageName: images[this.randomNum(0, 11)],
        // isRotate: bools[this.randomNum(0, 1)],
        // isUpDown: bools[this.randomNum(0, 1)],
        isRotate: bools[this.randomNum(0, 1)],
        isUpDown: true
      });
    });
  }

  /**
   * 加载"围墙"
   * @param {String} type "围墙"类型
   * @param {Array} coordinates 坐标
   * @param {Object} options uniform配置项
   */
  loadWall(type, geometryType = "polygon", coordinates, options) {
    let material = null;
    switch (type) {
      case "breathWall":
        material = breathWallMaterial(options);
        break;
      case "rippleWall":
        material = rippleWallMaterial(options);
        break;
      case "meteorWall":
        material = meteorWallMaterial(options);
        break;
      case "floaterWall":
        material = floaterWallMaterial(options);
        break;
      case "textureWall": {
        const texture = new THREE.TextureLoader().load(
          require("./shaders/texture/texture_02.png")
        );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        options.texture = texture;
        //material = textureWallMaterial(options);
        material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          color: "#fff",
          side: THREE.DoubleSide
        });
        break;
      }
      case "sparkWall":
        material = sparkWallMaterial(options);
        break;
      case "fireWall":
        material = fireWallMaterial(options);
        break;
      case "fireWallTwo":
        material = fireWallTwoMaterial(options);
        break;
    }
    if (!material) {
      console.warn("type is invalid");
      return;
    }
    let polygon = new maptalks.Polygon(coordinates);
    //"圆柱"围墙
    if (options.isCylinder)
      polygon = new maptalks.Circle(coordinates, options.radius || 500);
    if (!polygon) return;
    let baseOptions = {
      height: 300,
      speed: 0.005
    };
    Object.assign(baseOptions, options);
    let object = null;
    if (geometryType == "line" || geometryType == "freeline") {
      // let linestring = new maptalks.LineString(coordinates);
      object = new lineWall(polygon, baseOptions, material, this.threeLayer);
    } else {
      object = new polygonWall(polygon, baseOptions, material, this.threeLayer);
    }
    if (options.renderOrder)
      object.getObject3d().renderOrder = options.renderOrder;
    this.threeLayer.addMesh(object);
    object.on("contextmenu", e => {
      this.addRemoveInfowindow(e);
    });
    this.currentMesh = object;
    this.wallMeshes.push(object);
    return object;
  }
  /**
   * 加载"雷达"
   * @param {String} type "雷达"类型
   * @param {Array} coordinates 坐标
   * @param {Object} options uniform配置项
   */
  loadRadar(type, coordinate, options = {}) {
    let material = null;
    switch (type) {
      case "radar1":
        material = radarOneMaterial(options);
        break;
      case "radar2":
        options.type = 0;
        material = radarTwoMaterial(options);
        break;
      case "radar3":
        material = radarThreeMaterial(options);
        break;
      case "radar4":
        options.image = require("./shaders/texture/noise2.png");
        material = radarFourMaterial(options);
        break;
      case "radar5":
        options.image = require("./shaders/texture/noise2.png");
        material = radarFiveMaterial(options);
        break;
      case "radar6":
        options.type = 1;
        material = radarTwoMaterial(options);
        break;
      case "radar7":
        options.type = 2;
        material = radarTwoMaterial(options);
        break;
      case "flabellumScan":
        material = flabellumScanMaterial(options);
        break;
    }
    if (!material) {
      console.warn("type is invalid");
      return;
    }
    let ringMesh = new RingEffect(
      coordinate || this.Map.getCenter(),
      {
        radius: options.radius || 500,
        speed: options.speed || 1 / 60,
        altitude: options.altitude || 0
      },
      material,
      this.threeLayer
    );
    if (options.renderOrder)
      ringMesh.getObject3d().renderOrder = options.renderOrder;
    this.threeLayer.addMesh(ringMesh);
    this.currentMesh = ringMesh;
    this.radarMeshes.push(ringMesh);
    return ringMesh;
  }
  /**
   * 加载"点动画"
   * @param {String} type "点动画"类型
   * @param {Array} coordinates 坐标
   * @param {Object} options uniform配置项
   */
  loadRingEffect(type, coordinate, options = {}) {
    let material = this.getRingEffectMaterial(type, options);
    let object = new RingEffect(
      coordinate || this.Map.getCenter(),
      {
        radius: options.radius || 50,
        speed: options.speed || 0.0025,
        altitude: options.altitude || 0
      },
      material,
      this.threeLayer
    );
    if (options.renderOrder)
      object.getObject3d().renderOrder = options.renderOrder;
    this.threeLayer.addMesh(object);
    object.on("contextmenu", e => {
      this.addRemoveInfowindow(e);
    });
    this.currentMesh = object;
    this.pointMeshes.push(object);
    return object;
  }
  getRingEffectMaterial(type, options) {
    let material = null;
    switch (type) {
      case "ringSpread":
        material = ringSpreadMaterial(options);
        break;
      case "ringSpread2":
        options.type = 1;
        material = ringSpreadMaterial(options);
        break;
      case "ringWheel":
        material = ringWheelMaterial(options);
        break;
      case "fogRing":
        material = fogRingMaterial(options);
        break;
      case "gridPulse":
        material = gridPulseMaterial(options);
        break;
      case "emphasizePulse":
        material = emphasizePulseMaterial(options);
        break;
      case "alternateCurtainPulse":
        material = alternateCurtainPulseMaterial(options);
        break;
      case "fogPulse":
        material = fogPulseMaterial(options);
        break;
      case "dropPulse":
        material = dropPulseMaterial(options);
        break;
      case "flowerPulse":
        material = flowerPulseMaterial(options);
        break;
      case "tornadoPulse":
        material = tornadoPulseMaterial(options);
        break;
      case "vortexPulse":
        material = vortexPulseMaterial(options);
        break;
      case "circleBreathPulse":
        material = circleBreathPulseMaterial(options);
        break;
      case "dotPulse":
        material = dotPulseMaterial(options);
        break;
      case "breathPulse":
        material = breathPulseMaterial(options);
        break;
      case "rotatePulse":
        material = rotatePulseMaterial(options);
        break;
      case "heartBeatPulse":
        material = heartBeatPulseMaterial(options);
        break;
      case "dotGatherPulse":
        material = dotGatherPulseMaterial(options);
        break;
      case "wavePulse":
        material = wavePulseMaterial(options);
        break;
      case "colorfulCircle":
        material = colorfulCircleMaterial(options);
        break;
      case "magicCircle":
        material = magicCircleMaterial(options);
        break;
      case "simpleFlower":
        material = simpleFlowerMaterial(options);
        break;
    }
    return material;
  }

  addRemoveInfowindow(e) {
    const layer = this.getLayer("removeMeshLayer");
    layer.clear();
    let marker = new maptalks.Marker(e.coordinate, {
      symbol: {
        width: 0.1,
        height: 0.1,
        opacity: 0
      }
    }).addTo(layer);

    let html = `
      <div id="removeMesh" style="width:102px;height:28px;text-align:center;background:rgba(0,44,134,0.2);border:1px solid #12E6FF;line-height:25px;cursor:pointer;">
        清除本次效果
      </div>
    `;
    this.addTempInfoWindow(marker, html);
    setTimeout(() => {
      $("#removeMesh").on("click", () => {
        layer.clear();
        e.target.remove();
      });
    });
  }

  addTempInfoWindow(marker, htmlTemplate, dx, dy) {
    let options = {
      custom: true,
      autoPan: true,
      single: true,
      dx: dx || 0,
      dy: dy || 0,
      content: htmlTemplate
    };
    let info = new maptalks.ui.InfoWindow(options);
    info.addTo(marker);
    marker.openInfoWindow();
  }

  /**
   * 加载"防护罩"
   * @param {String} type "防护罩"类型
   * @param {Array} coordinates 坐标
   * @param {Object} options uniform配置项
   */
  loadShield(type, coordinate, options = {}) {
    let material = null;
    switch (type) {
      case "rippleShield":
        material = rippleShieldMaterial(options);
        break;
      case "textureShield": {
        const texture = new THREE.TextureLoader().load(
          require("./shaders/texture/六角形2.jpg")
        );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        options.texture = texture;
        material = textureShieldMaterial(options);
        break;
      }
      case "composedShield":
        material = composedShieldMaterial(options);
        break;
      case "electricShield":
        material = electricShieldMaterial(options);
        break;
      case "alarmShield":
        material = alarmShieldMaterial(options);
        break;
      case "fbmShield": {
        const fbmtexture = new THREE.TextureLoader().load(
          require("./shaders/texture/noise.png")
        );
        fbmtexture.wrapS = fbmtexture.wrapT = THREE.RepeatWrapping;
        options.texture = fbmtexture;
        material = fbmShieldMaterial(options);
        break;
      }
      case "electricRippleShield":
        options.type = 2;
        material = electricRippleShieldMaterial(options);
        break;
      case "starSky":
        material = starSkyMaterial(options);
        break;
      case "Sequence": {
        const seqtexture = new THREE.TextureLoader().load(
          require("./shaders/texture/channel001.jpg")
        );
        seqtexture.wrapS = seqtexture.wrapT = THREE.RepeatWrapping;
        options.texture = seqtexture;
        material = SequenceShieldMaterial(options);
        break;
      }
      default:
        material = rippleShieldMaterial(options);
        break;
    }
    if (!material) {
      console.warn("type is invalid");
      return;
    }
    let object = new ElectricShield(
      coordinate || this.Map.getCenter(),
      {
        radius: options.radius || 100,
        speed: options.speed || 0.025,
        altitude: options.altitude || 0
      },
      material,
      this.threeLayer
    );
    if (options.renderOrder)
      object.getObject3d().renderOrder = options.renderOrder;
    this.threeLayer.addMesh(object);
    object.on("contextmenu", e => {
      this.addRemoveInfowindow(e);
    });
    this.currentMesh = object;
    this.shieldMeshes.push(object);
    if (type == "Sequence") {
      object.getObject3d().rotation.y += 0.5 * Math.PI; //Math.PI-180°
      object.getObject3d().rotation.x += -0.5 * Math.PI; //Math.PI-180°
    }
    return object;
  }

  loadBuild(type, coordinate, options = {}) {
    console.log(coordinate);
    let polygon = new maptalks.Polygon(coordinate);
    let material = null,
      textureImage = null;
    switch (type) {
      case "fillColor":
        //MeshPhongMaterial MeshBasicMaterial
        material = new THREE.MeshBasicMaterial({
          color: options.color || "#001138"
        });
        material.vertexColors = THREE.VertexColors;
        break;
      case "texture01":
        textureImage = require("./shaders/texture/texture_01.png");
        break;
      case "texture02":
        textureImage = require("./shaders/texture/texture_02.png");
        break;
      case "texture03":
        textureImage = require("./shaders/texture/texture_03.png");
        break;
    }
    if (type == "texture01" || type == "texture02" || type == "texture03") {
      const texture = new THREE.TextureLoader().load(textureImage);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      options.texture = texture;
      // material = textureBuildMaterial(options);
      material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        color: "#fff",
        side: THREE.DoubleSide
      });
      material.vertexColors = THREE.VertexColors;
    }
    if (type.includes("canvas")) {
      material = this.getCanvasTexture(type);
    }
    if (options.opacity) material.opacity = options.opacity;
    let mesh = this.threeLayer.toExtrudePolygon(
      polygon,
      {
        height: options.height || 20,
        topColor: "#fff"
      },
      material
    );
    if (type != "fillColor") {
      this.topDeal(mesh, options.color);
    }
    if (options.renderOrder)
      mesh.getObject3d().renderOrder = options.renderOrder;
    this.threeLayer.addMesh(mesh);
    mesh.on("contextmenu", e => {
      this.addRemoveInfowindow(e);
    });
    this.currentMesh = mesh;
    this.buildMeshes.push(mesh);
    return mesh;
  }

  loadObjModelJson() {
    this.getThreeLayer("modelLayer", layer => {
      this.addModel(layer);
    });
  }

  addModel(layer) {
    var objLoader = new OBJLoader();
    var mtlLoader = new MTLLoader();
    objLoader.setPath("./model/");
    mtlLoader.setPath("./model/");

    mtlLoader.load("CasteliaCity/Castelia City.mtl", materials => {
      materials.preload();
      objLoader.setMaterials(materials);

      objLoader.load("CasteliaCity/Castelia City.obj", object => {
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.scale.set(0.01, 0.01, 0.01);
            child.rotation.set((Math.PI * 1) / 2, (-Math.PI * 1) / 2, 0);
          }
        });
        let model = layer.toModel(object, {
          coordinate: this.Map.getCenter(),
          altitude: 10,
          interactive: false
        });
        layer.addMesh(model);
      });
    });
  }

  loadRunMarker(coordinate, options = {}) {
    const image = require(`./shaders/texture/marker/${options.imageName}.png`);
    const texture = new THREE.TextureLoader().load(image);
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
      // blending: THREE.AdditiveBlending
    });
    // material = textureWallMaterial({ texture: texture });
    // material.blending = THREE.NormalBlending;
    let marker = new threeMarker(
      coordinate,
      {
        markerWidth: options.width || 68,
        markerHeight: options.height || 68,
        speed: options.speed || 1,
        isRotate: options.isRotate || false,
        isUpDown: options.isUpDown || false,
        altitude: options.altitude || 0
      },
      material,
      this.threeLayer
    );
    marker.getObject3d().renderOrder = 100;
    this.threeLayer.addMesh(marker);
    return marker;
  }

  //三维视图标注
  loadTreeMarker() {
    let options = {};
    const texture = new THREE.TextureLoader().load(
      require(`./shaders/texture/marker/lightray2.png`)
    );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    options.texture = texture;
    let material = textureWallMaterial(options);
    let marker = new threeMarker(
      this.Map.getCenter(),
      {
        markerWidth: 148,
        markerHeight: 500
      },
      material,
      this.threeLayer
    );
    this.threeLayer.addMesh(marker);
    let marker2 = new threeMarker(
      this.Map.getCenter(),
      {
        markerWidth: 148,
        markerHeight: 500
      },
      material,
      this.threeLayer
    );
    this.threeLayer.addMesh(marker2);
    marker2.getObject3d().rotation.y = THREE.Math.degToRad(90);
  }

  //粒子圆柱
  loadCylinder() {
    //圆环体
    // var geometry = new THREE.TorusBufferGeometry(30, 3, 16, 100);
    // let material = rippleShieldMaterial({
    //   color: "#FFFF00",
    //   opacity: 1
    // });
    let material = new THREE.MeshBasicMaterial({
      color: "#ff0",
      blending: THREE.AdditiveBlending
    });
    let obj = new cone(
      this.Map.getCenter(),
      {
        radius: 5,
        speed: 0.005,
        height: 100
      },
      material,
      this.threeLayer
    );
    // obj.getObject3d().layers.enable(1);
    this.threeLayer.addMesh(obj);
  }

  //清除所有点效果
  clearEffect() {
    this.pointMeshes.length && this.pointMeshes.forEach(p => p.remove());
    this.pointMeshes.length && (this.pointMeshes = []);
    this.currentMesh = null;
  }
  //清除所有围栏效果
  clearWallEffect() {
    this.wallMeshes.length && this.wallMeshes.forEach(p => p.remove());
    this.wallMeshes.length && (this.wallMeshes = []);
    this.currentMesh = null;
  }
  //清除所有雷达效果
  clearRadarEffect() {
    this.radarMeshes.length && this.radarMeshes.forEach(p => p.remove());
    this.radarMeshes.length && (this.radarMeshes = []);
    this.currentMesh = null;
  }
  //清除所有防护罩效果
  clearShieldEffect() {
    this.shieldMeshes.length && this.shieldMeshes.forEach(p => p.remove());
    this.shieldMeshes.length && (this.shieldMeshes = []);
    this.currentMesh = null;
  }
  //清除所有建筑
  clearBuild() {
    this.buildMeshes.length && this.buildMeshes.forEach(p => p.remove());
    this.buildMeshes.length && (this.buildMeshes = []);
    this.currentMesh = null;
  }
  //更新半径(计算缩放比)
  updateRadius(val) {
    let oldval = this.currentMesh.options.radius;
    let scale = val / oldval;
    this.currentMesh &&
      this.currentMesh.getObject3d().scale.set(scale, scale, scale);
  }
  //更新颜色
  updateColor(val) {
    if (!this.currentMesh) return;
    this.currentMesh.getSymbol().uniforms.color.value.setStyle(val);
  }
  //更新垂直高度
  updateAltitude(val) {
    if (!this.currentMesh) return;
    this.currentMesh.setAltitude(val);
  }
  //更新动画速度
  updateSpeed(val) {
    if (!this.currentMesh) return;
    this.currentMesh.options.speed = val;
  }
  //更新透明度
  updateOpacity(val) {
    if (!this.currentMesh) return;
    let material = this.currentMesh.getSymbol();
    if (material.uniforms.opacity)
      material.uniforms.opacity.value.setStyle(val);
  }
  //更新建筑颜色
  // updateBuildColor(val) {
  //   this.currentMesh &&
  //     this.$parent.$mapApi.updateBuildColor(
  //       this.currentMesh,
  //       this.buildType,
  //       val
  //     );
  // }

  getCanvasTexture(type) {
    if (type == "canvasTexture01") return this.canvasOne();
    if (type == "canvasTexture02") return this.canvasTwo();
  }

  //模拟窗口
  canvasOne() {
    const width = 512,
      height = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext("2d");

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#16366f";
    context.fillRect(0, 0, 1024, 1024);
    let colors2 = ["#00CCFF", "#66FF66", "#fff"];
    let added = [true, false, false];
    for (let x = 10; x < width; x += 50) {
      for (let y = 10; y < height; y += 50) {
        let isLight = added[this.randomNum(0, 2)];
        // let hsl = `hsl(183,${this.randomNum(10, 90)}%,${this.randomNum(
        //   10,
        //   90
        // )}%)`;
        let _color = colors2[this.randomNum(0, 3)];
        if (isLight) {
          context.fillStyle = _color;
          context.fillRect(x, y, 15, 15);
          context.globalAlpha = 1;
          // context.globalCompositeOperation = "lighter";
          context.shadowColor = _color;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.shadowBlur = 0;
        } else {
          context.fillStyle = "#373839";
          context.fillRect(x, y, 15, 15);
          context.globalAlpha = 1;
          context.shadowColor = "#16366f";
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.shadowBlur = 0;
        }
      }
    }
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true; //使用贴图时进行更新
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(0.002, 0.002);
    // texture.repeat.set(1, 1);
    // const material = new THREE.MeshLambertMaterial({
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    return material;
  }

  //黑白条纹
  canvasTwo() {
    var canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 64;
    var context = canvas.getContext("2d");
    // plain it in white
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 32, 64);
    // let colors2 = ["#00CCFF", "#66FF66", "#fff"];
    // draw the window rows - with a small noise to simulate light variations in each room
    for (var y = 2; y < 64; y += 2) {
      for (var x = 0; x < 32; x += 2) {
        var value = Math.floor(Math.random() * 64);

        context.fillStyle = `rgb(${[value, value, value].join(",")})`;
        // let _color = colors2[this.randomNum(0, 3)];
        // context.fillStyle = _color;
        context.fillRect(x, y, 2, 1);
        context.shadowColor = "#fff";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 10;
      }
    }

    // build a bigger canvas and copy the small one in it
    // This is a trick to upscale the texture without filtering
    var canvas2 = document.createElement("canvas");
    canvas2.width = 512;
    canvas2.height = 1024;
    var context2 = canvas2.getContext("2d");
    // disable smoothing
    context2.imageSmoothingEnabled = false;
    context2.webkitImageSmoothingEnabled = false;
    context2.mozImageSmoothingEnabled = false;

    context2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
    const texture = new THREE.Texture(canvas2);
    texture.needsUpdate = true; //使用贴图时进行更新
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(0.002, 0.002);
    texture.repeat.set(1, 1);
    // const material = new THREE.MeshLambertMaterial({
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    return material;
  }

  //更新建筑颜色
  updateBuildColor(mesh, type, color) {
    //fillColor 纯色建筑
    if (type != "fillColor") this.topDeal(mesh, color);
    else
      mesh.setSymbol(
        new THREE.MeshBasicMaterial({
          color: color
        })
      );
  }

  //添加绘制提示
  addDrawTips(type, layer) {
    let str = "点击地图添加效果",
      width = 120,
      height = 28,
      dx = 65,
      dy = -8;
    if (type == "line" || type == "polygon") {
      str = "点击开始绘制,双击结束绘制";
      width = 165;
      dx = 95;
    }
    if (type == "freeline") {
      str = "按住鼠标左键/右键不放开始绘制\r\n松开结束绘制";
      width = 190;
      height = 56;
      dx = 110;
    }
    let html = `
      <div style="width:${width}px;height:${height}px;font-size:12px;line-height:25px;text-align:center;background:rgba(0,44,134,0.2);border:1px solid #12E6FF;cursor:pointer;">${str}</div>
    `;
    //添加绘制提示
    let marker = new maptalks.Marker(this.Map.getCenter(), {
      symbol: {
        width: 0.1,
        height: 0.1,
        opacity: 0
      }
    }).addTo(layer);
    this.addTempInfoWindow(marker, html, dx, dy);
    marker.hide();
    this.Map.on("mousemove", e => {
      if (!marker.getInfoWindow()) return;
      marker.show();
      marker.setCoordinates(e.coordinate);
      if (!marker.getInfoWindow().isVisible()) marker.openInfoWindow();
    });
  }

  //案件数据示例
  loadCaseObject() {
    if (this.caseMeshes.length) {
      this.caseMeshes.forEach(m => {
        m.remove();
        m.getObject3d().geometry.dispose();
      });
      this.caseMeshes = [];
      return;
    }
    const data = [
      { x: 120.17674956973588, y: 30.235766282228923 },
      { x: 120.18039738868788, y: 30.233031186661577 },
      { x: 120.17681614672301, y: 30.23050756447273 },
      { x: 120.17387588699512, y: 30.228759956679227 },
      { x: 120.1791593236295, y: 30.225690219675386 }
    ];
    const wallData = [
      { x: 120.17586860547556, y: 30.240106988080157 },
      { x: 120.17227299314936, y: 30.236752873092627 },
      { x: 120.17369025703624, y: 30.22685091738012 },
      { x: 120.17420465977261, y: 30.2257651465724 },
      { x: 120.17760313548763, y: 30.22289595026936 },
      { x: 120.18436611523816, y: 30.230175694856456 },
      { x: 120.18048793097262, y: 30.234181855225273 },
      { x: 120.17684913929679, y: 30.237063153129128 },
      { x: 120.17705383013072, y: 30.239040879982866 },
      { x: 120.17589883064602, y: 30.240275547098946 }
    ];
    // 1
    let wall = this.loadWall("rippleWall", "polygon", wallData, {
      tempObj: true,
      height: 100
    });
    this.caseMeshes.push(wall);
    // 2
    const caseColors = ["#FF3212", "#12E6FF", "#C0FF12", "#05D24D", "#F20909"];
    data.forEach((c, i) => {
      let ring = this.loadRingEffect("breathPulse", c, {
        tempObj: true,
        color: caseColors[i],
        radius: 50,
        speed: 0.009
      });
      let marker = this.loadRunMarker(
        c,
        {
          imageName: "001",
          width: 50,
          height: 66,
          speed: i % 2 == 0 ? 2 : 1,
          isRotate: true,
          isUpDown: false,
          interactive: true
        },
        e => {
          this.showEventCard(e);
        }
      );
      this.caseMeshes.push(ring);
      this.caseMeshes.push(marker);
    });
    //缩放层级
    let polygon = new maptalks.Polygon(wallData);
    let extent = polygon.getExtent();
    let coord = extent.getCenter();
    let zoom = this.Map.getFitZoom(extent);
    this.Map.animateTo(
      {
        zoom: zoom,
        center: coord
      },
      {
        duration: 1000
      }
    );
  }

  showEventCard(e) {
    if (this.eventCard) {
      this.eventCard.remove();
      this.eventCard.geometry.dispose();
      this.eventCard = null;
    }
    // let options = e.target.getOptions();
    // let coord = e.target.getCenter();
    // let height = options.markerHeight;
    // let markerh = this.threeLayer.distanceToVector3(height, height).x;
    let coord = this.Map.getCenter();
    let height = 66;
    let markerh = this.threeLayer.distanceToVector3(height, height).x;
    let html = `
      <div id="eventInfo" style="width: 310px;height: 160px;color: wheat;background: #f00;">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAegAAADSCAYAAACBxlNzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjhBQzM0RTA5NzcxMDExRTRCRTRFQTI5QkI2QTdENjMzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjhBQzM0RTBBNzcxMDExRTRCRTRFQTI5QkI2QTdENjMzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OEFDMzRFMDc3NzEwMTFFNEJFNEVBMjlCQjZBN0Q2MzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OEFDMzRFMDg3NzEwMTFFNEJFNEVBMjlCQjZBN0Q2MzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6wMmE1AAAwCklEQVR42u2dB3xU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" />
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
    const element = document.getElementById("eventInfo");
    html2canvas(element, { backgroundColor: "transparent" }).then(canvas => {
      let w = this.threeLayer.distanceToVector3(310, 310).x;
      let h = this.threeLayer.distanceToVector3(160, 160).x;
      const geometry = new THREE.PlaneBufferGeometry(w, h, 2);
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
        coord,
        h / 2 + markerh
      );
      mesh.position.copy(position);
      mesh.rotation.x = Math.PI / 2;
      mesh.renderOrder = 1111;
      this.threeLayer.addMesh(mesh);
      document.body.removeChild(element);
      // this.eventCard = mesh;
    });
  }

  addThreeMarker() {
    let coords = this.getRandomPoint(20);
    coords.forEach(coord => {
      const markertexture = new THREE.TextureLoader().load(
        require("./shaders/texture/lightray22.png")
      );
      let markermaterial = textureWallMaterial({
        texture: markertexture
      });
      this.loadRingEffect("gridPulse", coord, {
        renderOrder: 4,
        speed: 0.025,
        altitude: 5
      });
      for (var i = 0; i < 12; i++) {
        let marker = new threeMarker(
          coord || this.Map.getCenter(),
          {
            markerWidth: 74,
            markerHeight: 250,
            altitude: 0,
            speed: i % 2 == 0 ? -5.5 : 5.5,
            isRotate: true
          },
          markermaterial,
          this.threeLayer
        );
        marker.getObject3d().rotation.y = THREE.Math.degToRad(i * 30);
        marker.getObject3d().renderOrder = 1111;
        this.threeLayer.addMesh(marker);
      }
    });
  }

  drawGraphic(type, call) {
    let layer = this.getLayer("drawLayer");
    layer.clear();
    this.addDrawTips(type, layer);
    let symbolData = this.getDrawSymbol(type); //line polygon
    this.drawTool = new maptalks.DrawTool({
      mode: symbolData.mode,
      symbol: symbolData.symbol,
      once: true
    }).addTo(this.Map);
    this.drawTool.on("drawend", param => {
      layer.clear();
      let coordinates = param.geometry.getCoordinates();
      // console.log(param.geometry.getExtent(), "extent");
      call && call(coordinates);
    });
  }
  getDrawSymbol(type) {
    let symbol = {}, //样式
      mode = ""; //绘制模式
    switch (type) {
      case "point":
        mode = "Point";
        symbol = {
          // markerFile: require("./shaders/texture/tfaj.png"),
          // markerWidth: 62,
          // markerHeight: 77,
        };
        break;
      case "line":
        mode = "LineString";
        symbol = {
          lineColor: "#0066FF",
          lineWidth: 3,
          lineDasharray: [8, 8]
        };
        break;
      case "freeline":
        mode = "FreeHandLineString";
        symbol = {
          lineColor: "#0066FF",
          lineWidth: 3,
          lineDasharray: [8, 8]
        };
        break;
      case "polygon":
        mode = "Polygon";
        symbol = {
          lineColor: "#5298f8",
          lineWidth: 3,
          polygonFill: "#5298f8",
          polygonOpacity: 0.5,
          polygonPatternFile: drawFillStyle("#5298f8", 1, 10)
        };
        break;
    }

    function drawFillStyle(lineColor, lineWidth, spacing) {
      var color = lineColor || "#ccc";
      var width = lineWidth || 1.0;
      var canvas = document.createElement("canvas");
      canvas.width = spacing * 3 + lineWidth;
      canvas.height = spacing * 3 + lineWidth;
      return drawGrid(canvas, color, width, spacing, spacing);
    }

    function drawGrid(canvas, color, lineWidth, stepx, stepy) {
      var context = canvas.getContext("2d");
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, context.canvas.height);
        context.stroke();
      }

      for (var j = stepy + 0.5; j < context.canvas.height; j += stepy) {
        context.beginPath();
        context.moveTo(0, j);
        context.lineTo(context.canvas.width, i);
        context.stroke();
      }
      const data = canvas.toDataURL("image/png", 1);
      return data;
    }
    return {
      mode: mode,
      symbol: symbol
    };
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
        camera.add(pl);
      };
      layer.addTo(this.Map);
    }
    setTimeout(() => {
      call && call(layer);
    }, 300);
  }
}
export default mapApi;
