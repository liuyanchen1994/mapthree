import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import * as turfhelp from "@turf/helpers";
import centerOfMass from "@turf/center-of-mass";

// import textSprite from "@/utils/BaseObjectPlugins/customText";

import areadata from "../jiangxi/jiangxiProvince";
import areaChilddata from "../jiangxi/jiangxiCity";
const center = [115.49867097979336, 26.483885322661123],
  zoom = 8,
  minzoom = 7,
  pitch = 61,
  bear = 10;
const bottomMeshHeight = 15000,
  colorMeshZ = 20000,
  topMeshZ = 25000,
  mirrorMeshZ = -20000;
const childPolygonZ = 32000; //子级区划边界高度
const cuboidZ = 32000; //立方体高度
class mapApi {
  constructor() {
    this.Map = null;
    this.initView = null;
    this.threeLayer = null;

    var polygon = turfhelp.polygon([
      [[-81, 41], [-88, 36], [-84, 31], [-80, 33], [-77, 39], [-81, 41]],
    ]);

    let centroid = centerOfMass(polygon);
    // debugger
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
      bearing: bear,
      attribution: false,
      baseLayer: new maptalks.TileLayer("base", {
        // cssFilter: "sepia(70%) invert(90%)",
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"],
      }).hide(),
    });
    this.initView = this.Map.getView();
    this.Map.on("click", (e) => {
      console.log(e.coordinate);
      console.log(this.Map.getPitch(), "pitch");
      console.log(this.Map.getBearing(), "bear");
    });
    this.initThreeLayer();
    setTimeout(() => {
      this.loadAreaObjects();
      this.loadChildPolygon();
      // this.loadText();
    });
  }

  /**
   * 三维图层初始化
   */
  initThreeLayer() {
    let layer = new ThreeLayer("threeLayer1", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true,
    });
    layer.prepareToDraw = (gl, scene, camera) => {
      //环境光
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      //点光源
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      camera.add(pl);
    };
    layer.addTo(this.Map);
    this.threeLayer = layer;
    // this.threeLayer.setZIndex(999);
  }

  //加载父级三维区划
  loadAreaObjects(parentData, childData) {
    parentData = areadata.features[0];
    let parentMeshes = [], //父级区划三维对象
      childMesh = []; //子级区划三维对象
    //底部三维立体区划
    // let polygon = new maptalks.Polygon();
    let polygon = maptalks.GeoJSON.toGeometry(parentData);
    const sideImage = require("../jiangxi/sideTexture.png");
    const topImage = require("../jiangxi/topTexture.jpg");
    const mirrorImage = require("../jiangxi/mirrorTexture.png");

    //侧面纹理
    const sideTexture = this.getTexture(sideImage);
    //顶部纹理
    const topTexture = this.getTexture(topImage);
    //镜像纹理
    const mirrorTexture = this.getTexture(mirrorImage);

    // mirrorTexture.repeat.set(1, 1);
    //侧面材质
    let sideMaterial = this.getTextureMaterial(sideTexture);
    //顶部材质
    let topMaterial = this.getTextureMaterial(topTexture);
    //镜像材质
    let mirrorMaterial = this.getTextureMaterial(mirrorTexture);
    //带填充色的父级区划材质
    let colorFillMaterial = this.getMaterial("#476994");
    colorFillMaterial.opacity = 0.5;

    //1 镜像
    let mirrorMesh = this.threeLayer.toExtrudePolygon(
      polygon,
      { height: bottomMeshHeight, topColor: "#fff", interactive: false },
      mirrorMaterial
    );
    //镜像顶部纯色
    this.topDeal(mirrorMesh, "#000927");
    const mirrorZ = this.threeLayer.distanceToVector3(mirrorMeshZ, mirrorMeshZ)
      .x;
    mirrorMesh.getObject3d().position.z = mirrorZ;

    //2 底部三维
    let bottomMesh = this.threeLayer.toExtrudePolygon(
      polygon,
      { height: bottomMeshHeight, topColor: "#fff", interactive: false },
      sideMaterial
    );
    //底部三维顶部纯色处理
    // this.topDeal(bottomMesh, "#476994");
    this.topDeal(bottomMesh, "#2F5084");

    //3 填充色-父级区划
    let colorMesh = this.threeLayer.toExtrudePolygon(
      polygon,
      { height: 1000, topColor: "#fff", interactive: false },
      colorFillMaterial
    );
    const colorFillZ = this.threeLayer.distanceToVector3(colorMeshZ, colorMeshZ)
      .x;
    colorMesh.getObject3d().position.z = colorFillZ;

    //4 最上层'沟壑'三维
    let topMesh = this.threeLayer.toExtrudePolygon(
      polygon,
      { height: 1, topColor: "#fff", interactive: false },
      topMaterial
    );
    const topZ = this.threeLayer.distanceToVector3(topMeshZ, topMeshZ).x;
    topMesh.getObject3d().position.z = topZ;

    this.threeLayer.addMesh(mirrorMesh);
    this.threeLayer.addMesh(bottomMesh);
    this.threeLayer.addMesh(colorMesh);
    this.threeLayer.addMesh(topMesh);
    parentMeshes.push(mirrorMesh);
    parentMeshes.push(bottomMesh);
    parentMeshes.push(colorMesh);
    parentMeshes.push(topMesh);
  }

  //加载子级区划边界
  loadChildPolygon(childData) {
    let layer = this.getLayer("childPloygonLayer");
    layer.clear();
    childData = areaChilddata.features;
    //5 子级区划边界
    childData.forEach((item) => {
      if (item.geometry.coordinates.length > 1) {
        item.geometry.coordinates = item.geometry.coordinates[0];
      }
      let childPolygon = maptalks.GeoJSON.toGeometry(item);
      childPolygon.updateSymbol({
        polygonFill: "#fff",
        polygonOpacity: 0,
        lineColor: "#a8cefa",
        lineWidth: 2,
      });
      let properties = childPolygon.getProperties();
      properties.altitude = childPolygonZ;
      childPolygon.setProperties(properties);
      childPolygon.config("smoothness", "0.02");
      childPolygon.addTo(layer);
      //计算质心
      let jsons = childPolygon.toGeoJSON();
      jsons.geometry.type = "Polygon";
      jsons.geometry.coordinates = jsons.geometry.coordinates[0];
      let centroid = centerOfMass(jsons);
      this.loadCuboid(centroid.geometry.coordinates);
    });
  }

  //加载长方体--统计信息
  loadCuboid(coordinate) {
    this.getThreeLayer("cuboidLayer", (layer) => {
      //获取extent
      let extent = this.Map.getExtent();
      //生成面数据 四个坐标点
      let coordinates = [
        [extent.xmin, extent.ymax],
        [extent.xmin, extent.ymin],
        [extent.xmax, extent.ymin],
        [extent.xmax, extent.ymax],
      ];
      let polygon = new maptalks.Polygon(coordinates);
      let material = this.getMaterial("#81ABED");
      let cube = layer.toExtrudePolygon(
        polygon,
        { height: 50000, topColor: "#fff", interactive: false },
        material
      );
      cube.getObject3d().scale.set(0.003, 0.004, 1);
      const position = layer.coordinateToVector3(coordinate, 180);
      cube.getObject3d().position.copy(position);
      layer.addMesh(cube);
    });
  }

  loadText() {
    let text = new textSprite(
      this.Map.getCenter(),
      {
        fontSize: 50,
        altitude: 0,
        color: "#0ff",
        text: "啊啊啊啊啊",
        weight: 0,
        zoomFilter: false,
      },
      this.threeLayer
    );
    this.threeLayer.addMesh(text);
  }

  randomColor() {
    return (
      "#" +
      Math.random()
        .toString(16)
        .substr(2, 6)
        .toUpperCase()
    );
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
        animation: true,
      });
      layer.prepareToDraw = (gl, scene, camera) => {
        //环境光
        let light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(0, -10, 10);
        scene.add(light);
        //点光源
        let pl = new THREE.PointLight(0xffffff, 2, 0);
        camera.add(pl);
      };
      layer.addTo(this.Map);
    }
    setTimeout(() => {
      call && call(layer);
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
        enableAltitude: true,
      }).addTo(this.Map); //创建图层
    }
    return layer;
  }

  getPhoneMaterial(color) {
    let material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    return material;
  }

  getMaterial(color) {
    let material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: !0,
    });
    material.vertexColors = THREE.VertexColors;
    return material;
  }
  getTextureMaterial(texture) {
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: !0,
      color: "#fff",
      side: THREE.DoubleSide,
    });
    material.vertexColors = THREE.VertexColors;
    return material;
  }
  getTexture(image) {
    const texture = new THREE.TextureLoader().load(image);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  //顶部换色处理
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
}
export default mapApi;
