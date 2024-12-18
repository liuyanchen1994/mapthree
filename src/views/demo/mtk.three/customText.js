import * as THREE from "three";
import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import { BaseObject } from "maptalks.three";
import RBush from "rbush";

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

  addText() {
    let names = [];
    const pointData = [
      { x: "", y: "", name: "" },
      { x: "", y: "", name: "" },
      { x: "", y: "", name: "" },
      { x: "", y: "", name: "" }
    ];
    pointData.forEach(item => {
      let sprite = this.threeLayer.toText(item.coord, {
        text: item.name,
        color: "#fff",
        fontSize: 25,
        weight: 2,
        interactive: false
      });
      // sprite.getObject3d().position.z = this.toThreeZ(
      //   this.altitude.cgGrid + 50
      // );
      // sprite.getObject3d().renderOrder = 99999;
      names.push(sprite);
    });
    // gridMesh.getObject3d().renderOrder = this.renderOrder.water;
    this.threeLayer.addMesh(names);
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
  //文本精灵--碰撞检测 初始化相关
  initThreeLayerOverRide() {
    ThreeLayer.prototype.texts = [];
    ThreeLayer.prototype.rbush = new RBush();

    ThreeLayer.prototype.collides = function() {
      this.rbush.clear();
      for (let i = 0, len = this.texts.length; i < len; i++) {
        const text = this.texts[i];
        const textRect = text.getTextRect();
        if (this.rbush.collides(textRect)) {
          text.hide();
        } else {
          if (cgGridShow || sgGridShow) {
            if (cgGridShow == "1") text.show();
            if (sgGridShow == "1") text.show();
          } else text.show();
          this.rbush.insert(textRect);
        }
      }
    };
    ThreeLayer.prototype.toText = function(coordinate, options) {
      return new TextSprite(coordinate, options, this);
    };

    // @Override
    ThreeLayer.prototype._zoomend = function() {
      const scene = this.getScene();
      if (!scene) {
        return;
      }
      const zoom = this.getMap().getZoom();
      scene.children.forEach(mesh => {
        const parent = mesh.__parent;
        if (parent && parent.getOptions) {
          if (!parent.getOptions().zoomFilter) {
            return;
          }
          const minZoom = parent.getMinZoom(),
            maxZoom = parent.getMaxZoom();
          if ((zoom < minZoom || zoom > maxZoom) && parent.isVisible()) {
            parent.hide();
          } else if (
            minZoom <= zoom &&
            zoom <= maxZoom &&
            !parent.isVisible()
          ) {
            parent.show();
          }
        }
      });
    };
    let that = this;
    // @Override
    ThreeLayer.prototype.addMesh = function(meshes, render = true) {
      if (!meshes) return this;
      if (!Array.isArray(meshes)) {
        meshes = [meshes];
      }
      const scene = this.getScene();
      meshes.forEach(mesh => {
        if (mesh instanceof BaseObject) {
          scene.add(mesh.getObject3d());
          if (!mesh.isAdd) {
            mesh.isAdd = true;
            mesh._fire("add", {
              target: mesh
            });
            if (mesh instanceof TextSprite) {
              this.texts.push(mesh);
              const textRect = mesh.getTextRect();
              if (that.threeLayer.rbush.collides(textRect)) {
                mesh.hide();
              } else {
                mesh.show();
                that.threeLayer.rbush.insert(textRect);
              }
            }
          }
          if (mesh._animation && maptalks.Util.isFunction(mesh._animation)) {
            this._animationBaseObjectMap[mesh.getObject3d().uuid] = mesh;
          }
        } else if (mesh instanceof THREE.Object3D) {
          scene.add(mesh);
        }
      });
      this._zoomend();
      // sort by weight
      this.texts.sort(function(text1, text2) {
        return text2.getOptions().weight - text1.getOptions().weight;
      });
      this.collides();
      if (render) {
        this.renderScene();
      }
      return this;
    };

    /**
     * remove object3ds
     * @param {BaseObject} meshes
     */
    // @Override
    ThreeLayer.prototype.removeMesh = function(meshes, render = true) {
      if (!meshes) return this;
      if (!Array.isArray(meshes)) {
        meshes = [meshes];
      }
      const scene = this.getScene();
      meshes.forEach(mesh => {
        if (mesh instanceof BaseObject) {
          scene.remove(mesh.getObject3d());
          if (mesh.isAdd) {
            mesh.isAdd = false;
            mesh._fire("remove", {
              target: mesh
            });
            if (mesh instanceof TextSprite) {
              for (let i = 0, len = this.texts.length; i < len; i++) {
                if (mesh === this.texts[i]) {
                  this.texts.splice(i, 1);
                  break;
                }
              }
            }
          }
          if (mesh._animation && maptalks.Util.isFunction(mesh._animation)) {
            delete this._animationBaseObjectMap[mesh.getObject3d().uuid];
          }
        } else if (mesh instanceof THREE.Object3D) {
          scene.remove(mesh);
        }
      });
      // sort by weight
      this.texts.sort(function(text1, text2) {
        return text2.getOptions().weight - text1.getOptions().weight;
      });
      this.collides();
      if (render) {
        this.renderScene();
      }
      return this;
    };
  }
  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }
}
export default mapApi;
