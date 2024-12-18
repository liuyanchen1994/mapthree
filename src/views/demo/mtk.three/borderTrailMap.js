import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";

import { MeshLineMaterial } from "@/utils/BaseObjectPlugins/THREE.MeshLine";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import spriteLine from "@/utils/BaseObjectPlugins/spriteLine";

import areadata from "../jiangxi/jiangxiProvince";
import areaChilddata from "../jiangxi/jiangxiCity";
const center = [115.49867097979336, 26.483885322661123],
  zoom = 8,
  minzoom = 7,
  pitch = 61;
const bottomMeshHeight = 15000,
  dotMeshZ = 15100,
  mirrorMeshZ = -20000,
  childPolygonZ = 16300, //子级区划边界高度
  trailZ = 16500;
class mapApi {
  constructor() {
    this.Map = null;
    this.initView = null;
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
      baseLayer: new maptalks.TileLayer("base", {
        cssFilter: "sepia(70%) invert(90%)",
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      })
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initBloomFun();
    this.initThreeLayer();
    // this.drawGraphic("line", null)
    setTimeout(() => {
      this.loadAreaObjects();
      this.loadChildPolygon();
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
      scene.add(pl);
    };
    this.threeLayer.addTo(this.Map);
  }

  //加载父级三维区划
  loadAreaObjects(parentData) {
    parentData = areadata.features[0];

    //底部三维立体区划
    // let polygon = new maptalks.Polygon();
    let polygon = maptalks.GeoJSON.toGeometry(parentData);
    const sideImage = require("../jiangxi/sideTexture2.png");
    // const topImage = require("../jiangxi/topTexture.jpg");
    const mirrorImage = require("../jiangxi/mirrorTexture.png");
    const dotImage = require("../jiangxi/dotTexture.png");

    //侧面纹理
    const sideTexture = this.getTexture(sideImage);
    //顶部纹理
    // const topTexture = this.getTexture(topImage);
    //镜像纹理
    const mirrorTexture = this.getTexture(mirrorImage);

    const dotTexture = this.getTexture(dotImage);

    // mirrorTexture.repeat.set(1, 1);
    //侧面材质
    let sideMaterial = this.getTextureMaterial(sideTexture);
    //顶部材质
    // let topMaterial = this.getTextureMaterial(topTexture);
    //镜像材质
    let mirrorMaterial = this.getTextureMaterial(mirrorTexture);
    //带填充色的父级区划材质
    let colorFillMaterial = this.getTextureMaterial(dotTexture);
    // colorFillMaterial.opacity = 0.5;

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
    // #3B487C

    let dotMesh = this.threeLayer.toExtrudePolygon(
      polygon,
      { height: 1000, topColor: "#fff", interactive: false },
      colorFillMaterial
    );
    const colorFillZ = this.threeLayer.distanceToVector3(dotMeshZ, dotMeshZ).x;
    dotMesh.getObject3d().position.z = colorFillZ;

    this.threeLayer.addMesh(mirrorMesh);
    this.threeLayer.addMesh(bottomMesh);
    this.threeLayer.addMesh(dotMesh);

    let coordinates = parentData.geometry.coordinates[0];
    // coordinates = coordinates[0].slice(0, coordinates[0].length - 1);
    this.loadTrail(coordinates);
  }

  loadTrail(coordinates) {
    const img = require("@/utils/shaders/texture/lightray2.png");
    let texture = this.getTexture(img);
    texture.anisotropy = 16;
    let camera = this.threeLayer.getCamera();

    const material = new MeshLineMaterial({
      map: texture,
      // color: "#f00",
      useMap: true,
      lineWidth: 15,
      sizeAttenuation: false,
      transparent: true,
      near: camera.near,
      far: camera.far
    });
    let linestring = new maptalks.LineString(coordinates);
    let trail = new spriteLine(
      linestring,
      { altitude: 0, speed: 0.3 },
      material,
      this.threeLayer
    );
    const zindex = this.threeLayer.distanceToVector3(trailZ, trailZ).x;
    trail.getObject3d().position.z = zindex;
    trail.getObject3d().renderOrder = 100;
    trail.getObject3d().layers.enable(1);
    this.threeLayer.addMesh(trail);
  }

  loadChildPolygon(childData) {
    childData = areaChilddata.features;
    let material = new THREE.LineBasicMaterial({
      linewidth: 10,
      color: "#f00",
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    // var material2 = new THREE.MeshBasicMaterial({
    //   color: "#0ff",
    //   transparent: true,
    //   blending: THREE.AdditiveBlending
    // });
    let lineStrings = [];
    childData.forEach(item => {
      let coordinates = item.geometry.coordinates[0];
      coordinates = coordinates[0].slice(0, coordinates[0].length - 1);
      let linestring = new maptalks.LineString(coordinates);
      lineStrings.push(linestring);
    });

    let roadMeshes = this.threeLayer.toLines(
      lineStrings,
      { interactive: false },
      material
    );
    const zindex = this.threeLayer.distanceToVector3(
      childPolygonZ,
      childPolygonZ
    ).x;
    roadMeshes.getObject3d().position.z = zindex;
    roadMeshes.getObject3d().layers.enable(1);
    // roadMeshes.getObject3d().renderOrder = 10;
    this.threeLayer.addMesh(roadMeshes);
  }
  getPhoneMaterial(color) {
    let material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    return material;
  }

  getMaterial(color) {
    let material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: !0
    });
    material.vertexColors = THREE.VertexColors;
    return material;
  }
  getTextureMaterial(texture) {
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: !0,
      color: "#fff",
      side: THREE.DoubleSide
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

  initBloomFun() {
    /**
     * initBloom
     * */
    ThreeLayer.prototype.initBloom = function() {
      const params = {
        exposure: 1,
        bloomStrength: 4.5,
        bloomThreshold: 0,
        bloomRadius: 2,
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
}
export default mapApi;
