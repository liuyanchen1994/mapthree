import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import axios from "axios";

import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";
import { MeshLineMaterial } from "@/utils/BaseObjectPlugins/THREE.MeshLine";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

import { textureBuildMaterial } from "@/utils/shaders/wall/material";
const mapboxToken = `pk.eyJ1IjoibHd5c2ltcGxlIiwiYSI6ImNrNDN2d2Y0bTA1djUzZG1tcmFwcTI3bXMifQ.ppzazP39jYrBKpdUi-S7mA`;
const center = [120.19158208535214, 30.239683129536814],
  zoom = 12,
  minzoom = 11,
  pitch = 40;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
    this.colors = {
      ground: "#42586f",
      landuse: "#E8E1E8",
      road: "#acd0e1",
      road2: "#5C6E8A",
      build: "#e9e5e6",
      water: "#9ecee5"
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
      light.position.set(0, 0, 10);
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
    this.loadLandUseData(() => {
      //水域
      this.loadWaterData(() => {
        //道路
        this.loadRoadData(() => {
          //建筑
          this.loadBuildData(() => {
            // this.loadTerrain();
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
      properties.height = 5;
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

    let polygons = [];
    data.forEach(item => {
      let polygon = maptalks.GeoJSON.toGeometry(item);
      const properties = item.properties;
      properties.height = 0.1;
      polygon.setProperties(properties);
      polygons.push(polygon);
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
    let material = new LineMaterial({
      linewidth: 2,
      color: this.colors.road
      // transparent: true
      // opacity: 0.7,
      // blending: THREE.AdditiveBlending
    });
    let lineStrings = [];
    data.forEach(item => {
      let linestring = maptalks.GeoJSON.toGeometry(item);
      lineStrings.push(linestring);
    });
    let roadMeshes = this.threeLayer.toFatLines(
      lineStrings,
      { interactive: false },
      material
    );
    // roadMeshes.getObject3d().layers.enable(1);
    roadMeshes.getObject3d().renderOrder = this.renderOrder.road;
    this.threeLayer.addMesh(roadMeshes);
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
              let height = g.properties.Floor * 2;
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
    //MeshLambertMaterial MeshBasicMaterial
    var material = new THREE.MeshPhongMaterial({
      color: this.colors.build
    });
    let mesh = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: this.colors.build || "#fff",
        interactive: false
      },
      material
    );
    // this.topDeal(mesh, this.colors.build);
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
  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }
}
export default mapApi;
