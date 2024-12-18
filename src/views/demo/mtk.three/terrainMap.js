import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import axios from "axios";

import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";
import { waterIMaterial } from "@/utils/shaders/water/material";
import { randomPoint } from "@turf/random";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import cover from "@mapbox/tile-cover";

import rgbTerrain from "@/utils/BaseObjectPlugins/rgbImageTerrain";
import ocean from "@/utils/BaseObjectPlugins/ocean";

const center = [120.19158208535214, 30.239683129536814],
  zoom = 12,
  minzoom = 11,
  pitch = 40;
const mapboxToken = `pk.eyJ1IjoibHd5c2ltcGxlIiwiYSI6ImNrNDN2d2Y0bTA1djUzZG1tcmFwcTI3bXMifQ.ppzazP39jYrBKpdUi-S7mA`;
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
        this.loadRoadData(() => {
          //山体
          this.loadTerrain();
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
      {
        interactive: false
      },
      // { interactive: false, minZoom: 11, maxZoom: 19 },
      material
    );
    // roadMeshes.getObject3d().layers.enable(1);
    roadMeshes.getObject3d().renderOrder = this.renderOrder.road;
    this.threeLayer.addMesh(roadMeshes);
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
        debugger;
        const polygons = maptalks.GeoJSON.toGeometry(geojson);
        const polygon = polygons[0];
        let extent = polygon.getExtent();

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
      // const url = `http://t1.tianditu.com/DataServer?T=img_w&X=${x}&Y=${y}&L=${z}&tk=de0dc270a51aaca3dd4e64d4f8c81ff6`;
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
        value: new THREE.Color("#0F1E4A")
        // value: new THREE.Color("#0B5161")
      },
      opacity: {
        value: 0.8
      },
      colorBottom: {
        value: new THREE.Color("#7d8fc7")
      }
    };
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById("vertexShader").textContent,
      fragmentShader: document.getElementById("fragmentShader").textContent
    });
    return material;
  }

  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }
}
export default mapApi;
