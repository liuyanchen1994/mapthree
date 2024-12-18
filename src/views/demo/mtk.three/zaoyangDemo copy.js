import * as THREE from "three";
import * as maptalks from "maptalks";
import centerOfMass from "@turf/center-of-mass"
import gcoord from "gcoord";
import proj4 from "proj4";
import queryApi from "./serviceUtil/queryService";
import {
  ThreeLayer
} from "maptalks.three";
import {
  randomPoint
} from "@turf/random";

import {
  EffectComposer
} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {
  RenderPass
} from "three/examples/jsm/postprocessing/RenderPass.js";
import {
  ShaderPass
} from "three/examples/jsm/postprocessing/ShaderPass";
import {
  FocusShader
} from "three/examples/jsm/shaders/FocusShader";
import {
  UnrealBloomPass
} from "../../../utils/BaseObjectPlugins/UnrealBloomPass";
import {
  LineMaterial
} from "three/examples/jsm/lines/LineMaterial";

import  RingTextureEffect from "../../../utils/BaseObjectPlugins/ringTextureEffect";
import serviceApi from "./serviceUtil/queryService"

import {
  breathWallMaterial,
} from "@/utils/shaders/wall/material";
import polygonWall from "@/utils/BaseObjectPlugins/polygonWall";

const houseUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYHOUSE/MapServer/0`;
const areaUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYQH/MapServer/2`;
const streetUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYQH/MapServer/1`;
const communityUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYQH/MapServer/0`;
const center = [112.7784299, 32.1348472],
  zoom = 14,
  minzoom = 11,
  pitch = 45;
class mapApi {
  constructor() {
    this.Map = null;
    this.threeLayer = null;
    proj4.defs("EPSG:4547","+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
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
        urlTemplate:
          "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      }).hide()
    });

    // let options = {
    //   center: center,
    //   zoom: zoom,
    //   minZoom: minzoom,
    //   pitch: pitch,
    //   view: {
    //     projection: 'baidu'
    //   },
    //   attribution: false,
    //   baseLayer: new maptalks.TileLayer("amapTile", {
    //     // cssFilter: "sepia(100%) invert(80%)",
    //     urlTemplate: `http://online2.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20190704`,
    //     // urlTemplate: "http://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20210506&scale=1&ak=RBmlwIwK43GtIGfe9eQCdaWO2A5Ix0Hv&styles=t%3Aland%7Ce%3Ag%7Cv%3Aon%7Cc%3A%23243853ff%2Ct%3Awater%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%23243853ff%2Ct%3Abuilding%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%23192c44ff%2Ct%3Abuilding%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%230a1a2bff%2Ct%3Awater%7Ce%3Ag%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Avillage%7Ce%3Al%7Cv%3Aoff%2Ct%3Atown%7Ce%3Al%7Cv%3Aoff%2Ct%3Adistrict%7Ce%3Al%7Cv%3Aoff%2Ct%3Acountry%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Acity%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Acontinent%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Apoi%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Ascenicspotslabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Ascenicspotslabel%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Atransportationlabel%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Atransportationlabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aairportlabel%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aairportlabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Agreen%7Ce%3Ag%7Cv%3Aon%7Cc%3A%234d5d74ff%2Ct%3Ascenicspots%7Ce%3Ag%7Cv%3Aon%7Cc%3A%23243853ff%2Ct%3Ascenicspots%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Ascenicspots%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acontinent%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acountry%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acity%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acity%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Ascenicspotslabel%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Arailway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Asubway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighwaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Anationalwaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Anationalwaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aprovincialwaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Aprovincialwaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Atertiarywaysign%7Ce%3Al%7Cv%3Aoff%2Ct%3Atertiarywaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Asubwaylabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Asubwaylabel%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%7Cw%3A90%2Ct%3Aroad%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Ashopping%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ascenicspots%7Ce%3Al%7Cv%3Aon%2Ct%3Ascenicspotslabel%7Ce%3Al%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Ag%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Al%7Cv%3Aoff%2Ct%3Ahighwaysign%7Ce%3Al.i%7Cv%3Aoff%2Ct%3Awater%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%234d5d7400%2Ct%3Aroad%7Ce%3Ag%7Cv%3Aon%2Ct%3Aroad%7Ce%3Al%7Cv%3Aon%2Ct%3Aarterial%7Ce%3Al%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Al%7Cv%3Aon%2Ct%3Aroad%7Ce%3Aundefined%7Cv%3Aon%2Ct%3Ahighway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Ahighway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Ahighway%7Ce%3Ag.s%7Cc%3A%231c4f7eff%2Ct%3Ahighway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aon%7Cw%3A3%2Ct%3Anationalway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Anationalway%7Ce%3Ag.s%7Cc%3A%231c4f7eff%2Ct%3Anationalway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Anationalway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Anationalway%7Ce%3Ag%7Cw%3A3%2Ct%3Aprovincialway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Acityhighway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Aarterial%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Atertiaryway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Afourlevelway%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Alocal%7Ce%3Ag.f%7Cv%3Aon%7Cc%3A%234c5e79ff%2Ct%3Aprovincialway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Acityhighway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Aarterial%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Atertiaryway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Afourlevelway%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Alocal%7Ce%3Ag.s%7Cv%3Aon%7Cc%3A%232e3b51ff%2Ct%3Alocal%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Alocal%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Afourlevelway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Atertiaryway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aarterial%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Acityhighway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aprovincialway%7Ce%3Al.t.f%7Cv%3Aon%7Cc%3A%233e506cff%2Ct%3Aprovincialway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Acityhighway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Aarterial%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Atertiaryway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Afourlevelway%7Ce%3Al.t.s%7Cv%3Aon%7Cc%3A%23202833ff%7Cw%3A1%2Ct%3Afourlevelway%7Ce%3Ag%7Cw%3A1%2Ct%3Atertiaryway%7Ce%3Ag%7Cw%3A1%2Ct%3Alocal%7Ce%3Ag%7Cw%3A1%2Ct%3Aprovincialway%7Ce%3Ag%7Cw%3A3%2Ct%3Acityhighway%7Ce%3Ag%7Cw%3A3%2Ct%3Aarterial%7Ce%3Ag%7Cw%3A1%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Al%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Al%7Cv%3Aoff%2Ct%3Apoi%7Ce%3Al.t.s%7Cc%3A%234a4a4a94%2Ct%3Apoi%7Ce%3Al.t.f%7Cc%3A%237697c2ff%2Ct%3Aroad%7Ce%3Aall%7Cc%3A%234C5E79",
    //     subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    //   }).hide()
    // }
    // this.Map = new maptalks.Map(domId, options);
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initBloomFun();
    this.initThreeLayer();
    setTimeout(() => {
      // this.loadAreaCase();
      this.loadAreaCase2();
      // this.loadAroundCircle();
    }, 500);
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
      animation: true,
      enableSimplify: false
    });
    let that = this;
    this.threeLayer.prepareToDraw = function (gl, scene, camera) {
      //环境光
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      //点光源
      let pl = new THREE.PointLight(0xffffff, 2, 0);
      camera.add(pl);
      this.initBloom();
      this.setRendererRenderScene();
    };
    this.threeLayer.addTo(this.Map);
  }

  loadAroundCircle(coord){
    let radius = 7000;
    // let coord = {x:112.78174231620793, y: 32.1151962878748};
    //1 3同方向 24同方向
    let material1 = this.getCircleMaterial(1);
    let material3 = this.getCircleMaterial(3);
    let material2 = this.getCircleMaterial(2);
    let material4 = this.getCircleMaterial(4);
    let ring1 = new RingTextureEffect(
      coord, {
        radius: radius,
        speed: 0.2,
        altitude: 0
      },
      material1,
      this.threeLayer
    );
    let ring3 = new RingTextureEffect(
      coord, {
        radius: radius,
        speed: 0.2,
        altitude: 0.1
      },
      material3,
      this.threeLayer
    );
    let ring2 = new RingTextureEffect(
      coord, {
        radius: radius,
        speed: 0.1,
        altitude: 0.2,
        isReverse: true
      },
      material2,
      this.threeLayer
    );
    let ring4 = new RingTextureEffect(
      coord, {
        radius: radius,
        speed: 0.1,
        altitude: 0.25,
        isReverse: true
      },
      material4,
      this.threeLayer
    );
    this.threeLayer.addMesh(ring1);
    this.threeLayer.addMesh(ring3);
    this.threeLayer.addMesh(ring2);
    this.threeLayer.addMesh(ring4);
  }

  getCircleMaterial(type){
    const texture = new THREE.TextureLoader().load(
      require(`./img/${type}.png`)
    );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      color: "#fff",
      side: THREE.DoubleSide,
    });
    return material;
  }

  loadAreaCase2() {
    let layer = this.getLayer("areaLayer");
    layer.bringToBack();
    this.getDataByType("area", areaData=>{
      this.stetp1(areaData, layer);
      this.stetp2(areaData);
      this.step3();
    })
  }

  stetp1(areaData, layer) {
    areaData.forEach(item => {
      let polygon = new maptalks.Polygon(item.coordinates, {
        symbol: {
          polygonFill: "#00d8ff",
          polygonOpacity: 0.5,
          lineWidth: 1,
          lineOpacity: 0,
          shadowBlur: 25,
          shadowColor: "#00d8ff",
          // shadowOffsetX: 10,
          shadowOffsetY: 17
        }
      }).addTo(layer);
      let polygon2 = polygon.copy().addTo(layer);
      polygon2.updateSymbol({
        polygonOpacity: 0.9,
        shadowBlur: 7,
        shadowColor: "#000",
        shadowOffsetY: 7
      })
      let jsons = polygon.toGeoJSON();
      let centroid = centerOfMass(jsons);
      this.loadAroundCircle(centroid.geometry.coordinates)
    })
  }

  stetp2(areaData) {
    let areaMeshes = [];
    const height= 550;
    let baseOptions = {
      height: height,
      speed: 0.25,
      isAnimate: false
    };
    let botmaterial = breathWallMaterial({
      color: "#A4F1FF",
      opacity: 0.8
    });
    const texture = new THREE.TextureLoader().load(
      require(`./img/mbg.jpg`)
    );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.2, 1.2);
    const topmaterial = new THREE.MeshBasicMaterial({
      color: "#fff",
      map: texture,
    });
    areaData.forEach(item => {
      let attr = item.attributes;
      let polygon = new maptalks.Polygon(item.coordinates);
      attr.height = height
      polygon.setProperties(attr);
      let wall = new polygonWall(polygon, baseOptions, botmaterial, this.threeLayer)
      // this.threeLayer.addMesh(obj);
      let p2 = polygon.copy();
      attr.height = 1;
      p2.setProperties(attr);
      let topmesh = this.threeLayer.toExtrudePolygon(
        p2, {
          altitude: 0,
          interactive: false,
          topColor: "#fff"
        },
        topmaterial
      );
      
      let topmesh2 = this.threeLayer.toExtrudePolygon(
        p2, {
          altitude: height/2,
          interactive: false,
          topColor: "#fff"
        },
        topmaterial
      );
      areaMeshes.push(wall);
      areaMeshes.push(topmesh);
      areaMeshes.push(topmesh2);
    })
    this.threeLayer.addMesh(areaMeshes);
  }
  step3() {
    let areaMeshes = [];
    const height= 550;
    var toplinematerial2 = new LineMaterial({
      color: "#B7F0FB",
      transparent: true,
      // vertexColors: THREE.VertexColors,
      // side: THREE.BackSide,
      linewidth: 2 // in pixels
      // dashed: false
    });
    this.getDataByType("street", streetData=> {
      let lineStrings = [];
      streetData.forEach(item => {
        let lineString = new maptalks.LineString(item.coordinates);
        lineStrings.push(lineString);
      })
      lineStrings.map(d => {
        var line = this.threeLayer.toFatLine(d, {
          altitude: height/2+5
        }, toplinematerial2);
        line.getObject3d().layers.enable(1);
        areaMeshes.push(line);
      });

      this.threeLayer.addMesh(areaMeshes);
    })
  }

  getRandomPoint() {
    let extent = this.Map.getExtent();
    //随机坐标
    let coordFeature = randomPoint(20, {
      bbox: [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
    });
    let coords = [];
    coordFeature.features.forEach(g => {
      coords.push(g.geometry.coordinates);
    });
    return coords;
  }
  initBloomFun() {
    /**
     * initBloom
     * */
    ThreeLayer.prototype.initBloom = function () {
      const params = {
        exposure: 1,
        bloomStrength: 3.5,
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
    ThreeLayer.prototype.setRendererRenderScene = function () {
      this.getRenderer().renderScene = function () {
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
    if (!this.Map) return;
    let layer = this.Map.getLayer(layerid);
    !layer && (
      layer = new maptalks.VectorLayer(layerid, {
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
        forceRenderOnZooming: true,
        enableAltitude: true
      }).addTo(this.Map)) //创建图层
    return layer;
  }
  getThreeLayer(){

  }
  toThreeZ(altitude) {
    const z = this.threeLayer.distanceToVector3(altitude, altitude).x;
    return z;
  }

  getDataByType(type, callFun) {
    let data = JSON.parse(sessionStorage.getItem(type));
    if (data) {
      callFun && callFun(data);
      return;
    }
    let url = this.getUrlByType(type);
    queryApi.getServiceData({ where: "1=1" }, url, result => {
      data = this.dealData(result);
      callFun && callFun(data);
      sessionStorage.setItem(type, JSON.stringify(data));
    });
  }
  dealData(data) {
    let result = [];
    data.forEach(item => {
      let attr = item.attributes;
      let geo = item.geometry;
      let coords = [];
      if (geo.rings || geo.paths) {
        let p = geo.rings ? geo.rings[0] : geo.paths[0];
        if (p && p.length)
          p.forEach(c => {
            let wgsCoord = this.coordinateTransform(c[0], c[1]);
            coords.push(wgsCoord);
          });
      } else {
        let wgsCoord = this.coordinateTransform(geo.x, geo.y);
        coords = wgsCoord;
      }
      if (coords.length)
        result.push({
          attributes: attr,
          coordinates: coords
        });
    });
    return result;
  }
  coordinateTransform(lon, lat) {
    let wgsCoord = proj4(proj4("EPSG:4547"), proj4("EPSG:4326"), [lon, lat]);
    return wgsCoord;
  }
  getUrlByType(type) {
    let urls = {
      area: areaUrl,
      street: streetUrl,
      community: communityUrl,
      house: houseUrl
    };
    return urls[type];
  }

}
export default new mapApi();