import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import axios from "axios";

import customPalneBuffer from "@/utils/BaseObjectPlugins/customPalneBuffer";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

import cover from "@mapbox/tile-cover";
import rgbTerrain from "@/utils/BaseObjectPlugins/rgbImageTerrain";

import ringTexture from "@/utils/BaseObjectPlugins/ringTextureEffect";
import polygonWall from "@/utils/BaseObjectPlugins/polygonWall";

import arcLine from "@/utils/BaseObjectPlugins/arcLine";
import { MeshLineMaterial } from "@/utils/BaseObjectPlugins/THREE.MeshLine";
import threeMarker from "@/utils/BaseObjectPlugins/threeMarker";

import { textureWallMaterial } from "@/utils/shaders/wall/material";
const mapboxToken = `pk.eyJ1IjoibHd5c2ltcGxlIiwiYSI6ImNrNDN2d2Y0bTA1djUzZG1tcmFwcTI3bXMifQ.ppzazP39jYrBKpdUi-S7mA`;
const center = [114.37179737981751, 30.51564073572777],
  zoom = 14,
  minzoom = 12,
  maxzoom = 17,
  pitch = 40;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
    this.colors = {
      ground: "#42586f",
      landuse: "#DAE0E4",
      road: "#acd0e1",
      road2: "#5C6E8A",
      // build: "#E8E1E8",
      build: "#e9e5e6",
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
        // cssFilter: "sepia(70%) invert(90%)",
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      }).hide()
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initThreeLayer(() => {
      // this.loadBaseMapDatas();
    });
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
      // //环境光
      // let light = new THREE.DirectionalLight(0xffffff, 2);
      // light.position.set(0, 0, 10);
      // scene.add(light);
      // //点光源
      // scene.fog = new THREE.FogExp2("#cecece", 500 / 10000);
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      // let v = this.threeLayer.coordinateToVector3(this.Map.getCenter(), 200);
      // pl.castShadow = true;
      // pl.shadow.mapSize.width = 512 * 4;
      // pl.shadow.mapSize.height = 512 * 4;
      // pl.shadow.camera.top = 128;
      // pl.shadow.camera.bottom = -86;
      // pl.shadow.camera.left = -68;
      // pl.shadow.camera.right = 74;
      pl.position.set(0, 100, 10);
      camera.add(pl);
      // scene.add(pl);

      let pointLightHelper = new THREE.PointLightHelper(pl, 1, "blue");
      scene.add(pointLightHelper);

      const position = this.threeLayer.coordinateToVector3(
        [114.04884764283543, 30.71386682375598],
        300
      );
      // pl.position.copy(position);

      const cube = this.getLightTarget();
      this.threeLayer.addMesh(cube);

      var light = new THREE.DirectionalLight(0xffffff);
      // light.position.set(0, 10, 10).normalize();
      light.position.copy(position);
      // light.position.multiplyScalar(0.3);
      light.castShadow = true;
      light.target = cube;
      light.shadow.mapSize.width = 512 * 10;
      light.shadow.mapSize.height = 512 * 10;
      light.shadow.camera.top = 64;
      light.shadow.camera.bottom = -86;
      light.shadow.camera.left = -68;
      light.shadow.camera.right = 74;
      scene.add(light);
      // let lightHelper = new THREE.DirectionalLightHelper(light, 1, "red");
      // scene.add(lightHelper);

      let amblight = new THREE.AmbientLight("#ffffff");
      // amblight.position.copy(p2);
      scene.add(amblight);
      this.threeLayer.getThreeRenderer().shadowMap.enabled = true;
      this.threeLayer.getThreeRenderer().shadowMap.needsUpdate = true;
      this.threeLayer.getThreeRenderer().setClearColor("#42586f");

      this.loadBaseMapDatas();
    };
    this.threeLayer.addTo(this.Map);
    call && call();
  }

  getLightTarget() {
    const size = 0.001;
    const cubeGeometry = new THREE.CubeGeometry(size, size, size);
    const cubeMaterial = new THREE.MeshLambertMaterial({
      color: "yellow"
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    const v1 = this.threeLayer.coordinateToVector3(this.Map.getCenter());
    cube.position.copy(v1);
    return cube;
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
    // this.loadGround();
    this.loadShadowGround();
    // this.addParticleLight();
    // this.addCircle();
    // return;
    this.loadLandUseData(result => {
      //水域
      this.loadWaterData(result, () => {
        //道路
        this.loadRoadData(result, () => {
          //建筑
          this.loadBuildData(result, () => {
            // this.loadTerrain();
            // this.addCircle();
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
  loadShadowGround() {
    let groundShadowMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    // let v = this.threeLayer.coordinateToVector3(this.Map.getCenter());
    let ground = new customPalneBuffer(
      this.Map.getCenter(),
      {
        width: 1000000,
        height: 1000000,
        interactive: false
      },
      groundShadowMaterial,
      this.threeLayer
    );
    // ground.getObject3d().position.z = 0.1;
    ground.getObject3d().renderOrder = this.renderOrder.shadowground;
    ground.getObject3d().receiveShadow = true;
    this.threeLayer.addMesh(ground);
  }
  //加载土地利用面pbf数据
  loadLandUseData(call) {
    axios
      .get(`./hangzhou/WuHan.geojson`, {
        responseType: "json"
      })
      .then(res => {
        let result = res.data;
        const data = result.features.filter(x =>
          x.properties.hasOwnProperty("landuse")
        );
        this.addLandUse(data);
        call && call(result);
      });
  }
  //加载土地利用面
  addLandUse(data) {
    let material = new THREE.MeshPhongMaterial({
      color: this.colors.landuse
    });
    let polygons = [];
    data.forEach(item => {
      let polygon = maptalks.GeoJSON.toGeometry(item);
      const properties = item.properties;
      properties.height = 3;
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
    // landuseMesh.getObject3d().position.z = this.toThreeZ(this.altitude.landuse);
    landuseMesh.getObject3d().renderOrder = this.renderOrder.landuse;
    this.threeLayer.addMesh(landuseMesh);

    let groundShadowMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    let landuseShadow = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: "#fff",
        interactive: false
      },
      groundShadowMaterial
    );
    landuseShadow.getObject3d().position.z = this.toThreeZ(
      this.altitude.landuse
    );
    landuseShadow.getObject3d().receiveShadow = true;
    this.threeLayer.addMesh(landuseShadow);
  }
  //读取pbf水域数据
  loadWaterData(result, call) {
    const data = result.features.filter(
      x =>
        x.properties.hasOwnProperty("waterway") ||
        x.properties.hasOwnProperty("water")
    );
    this.addWater(data);
    call && call();
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

  //读取道路pbf数据
  loadRoadData(result, call) {
    const data = result.features.filter(
      x =>
        x.properties.hasOwnProperty("highway") &&
        x.geometry.type == "LineString"
    );
    this.addRoad(data);
    call && call();
  }
  //加载道路
  addRoad(data) {
    let material = new LineMaterial({
      linewidth: 2,
      color: "#000"
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
    this.addRoad2(data);
  }
  //加载道路
  addRoad2(data) {
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
    const z = this.threeLayer.distanceToVector3(3, 3).x;
    roadMeshes.getObject3d().position.z = z;
    this.threeLayer.addMesh(roadMeshes);
  }
  loadBuildData(result, call) {
    const data = result.features.filter(
      x =>
        (x.properties.hasOwnProperty("building") &&
          x.geometry.type == "LineString") ||
        (x.properties.hasOwnProperty("building") &&
          x.geometry.type == "MultiPolygon")
    );
    let polygons = [];
    data.forEach(g => {
      let polygon = maptalks.GeoJSON.toGeometry(g);
      let height = 10;
      if (g.properties.hasOwnProperty("height")) height = g.properties.height;
      if (g.properties.hasOwnProperty("building:levels"))
        height = g.properties["building:levels"];
      const properties = g.properties;
      properties.height = height * 2;
      polygon.setProperties(properties);
      polygons.push(polygon);
    });
    this.addBuilding(polygons);
    call && call();
  }
  addBuilding(polygons) {
    //MeshLambertMaterial MeshBasicMaterial
    // var material = new THREE.MeshBasicMaterial({
    //   color: this.colors.build
    // });
    var material = new THREE.MeshPhongMaterial({
      color: this.colors.build
      // transparent: true
    });
    let mesh = this.threeLayer.toExtrudePolygons(
      polygons,
      {
        topColor: "#fff",
        bottomColor: "#c1bfbf",
        interactive: false
      },
      material
    );
    // this.topDeal(mesh, this.colors.build);
    mesh.getObject3d().castShadow = true;
    this.threeLayer.addMesh(mesh);
  }

  addCircle() {
    //旋转圆环
    const image = require(`@/utils/shaders/texture/circular_03.png`);
    const texture = new THREE.TextureLoader().load(image);
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    let coord = [114.38363241199852, 30.51067213587524];
    let circle = new ringTexture(
      coord,
      {
        radius: 200,
        speed: 1
      },
      material,
      this.threeLayer
    );
    this.threeLayer.addMesh(circle);
    //旋转圆柱贴图
    const texture2 = new THREE.TextureLoader().load(
      require("@/utils/shaders/texture/circular2.png")
    );
    texture2.wrapS = texture.wrapT = THREE.RepeatWrapping;
    let material2 = textureWallMaterial({
      texture: texture2,
      convert: 1
    });
    let polygon = new maptalks.Circle(coord, 100);
    let object = new polygonWall(
      polygon,
      {
        height: 350,
        speed: 0.0025
      },
      material2,
      this.threeLayer
    );
    this.threeLayer.addMesh(object);
    this.addArcLine(coord);
  }

  addArcLine(coord) {
    const coords = [
      { x: 114.3513645022067, y: 30.503107253769628 },
      { x: 114.37030303173435, y: 30.52852126914476 },
      { x: 114.40241333940253, y: 30.508149992503178 },
      { x: 114.37581134036714, y: 30.492452788538884 }
    ];
    coords.forEach(item => {
      let path = [coord, [item.x, item.y]];
      let linestring = new maptalks.LineString(path);
      const texture = new THREE.TextureLoader().load(
        require("@/utils/shaders/texture/lightray2.png")
      );
      texture.anisotropy = 16;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      const camera = this.threeLayer.getCamera();
      const material = new MeshLineMaterial({
        map: texture,
        useMap: true,
        lineWidth: 13,
        sizeAttenuation: false,
        transparent: true,
        near: camera.near,
        far: camera.far
      });
      let arcline = new arcLine(
        linestring,
        { altitude: 0, height: 700, speed: 1 / 5 },
        material,
        this.threeLayer
      );
      this.threeLayer.addMesh(arcline);
      //添加
      this.addParticleLight();
    });
  }

  addParticleLight() {
    const coords = [
      { x: 114.3513645022067, y: 30.503107253769628 },
      { x: 114.37030303173435, y: 30.52852126914476 },
      { x: 114.40241333940253, y: 30.508149992503178 },
      { x: 114.37581134036714, y: 30.492452788538884 }
    ];
    const image = require("@/utils/shaders/texture/lightray.png");
    const texture = new THREE.TextureLoader().load(image);
    // let material = new THREE.MeshBasicMaterial({
    //   map: texture,
    //   transparent: true,
    //   side: THREE.DoubleSide
    // });

    let material = textureWallMaterial({
      texture: texture
    });
    coords.forEach(coord => {
      let opts = {
        markerWidth: 32,
        markerHeight: 256,
        scale: true,
        scaleZ: 100
      };
      let marker1 = new threeMarker(coord, opts, material, this.threeLayer);
      let marker2 = new threeMarker(coord, opts, material, this.threeLayer);
      marker2.getObject3d().rotation.y = THREE.Math.degToRad(90);
      marker1.getObject3d().scale.set(10, 10, 10);
      marker2.getObject3d().scale.set(10, 10, 10);
      // marker.getObject3d().renderOrder = 100;
      this.threeLayer.addMesh(marker1);
      this.threeLayer.addMesh(marker2);
    });
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
        //   pxmax: 114.65422073774607,
        //   pxmin: 114.40119186811717,
        //   pymax: 30.684237374828427,
        //   pymin: 30.515795482306856,
        //   xmax: 114.65422073774607,
        //   xmin: 114.40119186811717,
        //   ymax: 30.684237374828427,
        //   ymin: 30.515795482306856
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
            terrain.getObject3d().renderOrder = 3;
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
