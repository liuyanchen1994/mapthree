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
  UnrealBloomPass
} from "../../../utils/BaseObjectPlugins/UnrealBloomPass";
import {
  LineMaterial
} from "three/examples/jsm/lines/LineMaterial";

import RingTextureEffect from "../../../utils/BaseObjectPlugins/ringTextureEffect";

import {
  breathWallMaterial,
} from "@/utils/shaders/wall/material";
import polygonWall from "@/utils/BaseObjectPlugins/polygonWall";

const areaUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYQH/MapServer/2`;
const streetUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYQH/MapServer/1`;
const communityUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYQH/MapServer/0`;
const roadUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYMAP2DN/MapServer/1`;
const houseUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYMAP2DN/MapServer/2`;
const greenLandUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYMAP2DN/MapServer/3`;
const waterUrl = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYMAP2DN/MapServer/4`;
const roadUrl2 = `http://36.134.75.141:6080/arcgis/rest/services/ZYCG/ZYMAP2DN/MapServer/5`;
const center = [112.7560884131066, 32.10980732439472],
  zoom = 13,
  minzoom = 11,
  pitch = 45;
class mapApi {
  constructor() {
    this.colors = {
      water: "#043B86",
      // water: "#7FBFDC",
      landuse: "#014f44",
      road: "#acd0e1",
      build: "#fff",
    };
    this.renderOrder = {
      landuse: 2,
      water: 3,
      road: 4,
      build: 20,
      track: 10,
      trackRing: 8
    };
    this.altitude = {
      landuse: 0.01,
      water: 1,
      road: 2,
      build: 0,
      track: 3,
      trackRing: 3
    };
    this.baseMapMeshes = [];
    this.buildMeshes = [];
    this.Map = null;
    this.threeLayer = null;
    proj4.defs("EPSG:4547", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
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
        cssFilter: "sepia(100%) invert(80%)",
        urlTemplate: "https://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
        subdomains: ["a", "b", "c", "d"]
      }).hide()
    });
    this.Map.on("click", e => {
      console.log(e.coordinate);
    });
    this.initBloomFun();
    this.initThreeLayer();
    setTimeout(() => {
      // this.deptCaseLine();
      // return;
      // this.loadAreaCase();
      this.areaAnalysis();
      // this.loadAroundCircle();
      // this.loadBaseMap();
    }, 500);
    callFun && callFun();
  }

  loadBaseMap() {
    this.loadWaterData();
    this.loadRoadData();
    this.loadLanduse();
    // this.loadBuild();
  }

  //首页部门案件连接线
  deptCaseLine() {
    let coord1 = [112.72092142066094, 32.11707375818739];
    let coord2 = [112.83155851860465, 32.11793912745858];
    let coordsCount = 100, sliceNum = 50;
    let coords1 = this.gethalveCoords(coord1, coord2, 100);
    let line = new maptalks.LineString([coord1, coord2]);
    let points = this.getArcPoints(line, 500, this.threeLayer, coordsCount + sliceNum);
    let heights = [];
    points.forEach(item=>{
      heights.push(item.z*10)
    })
    let layer = this.getLayer("asd");
    new maptalks.LineString(coords1, {
      symbol: {
        lineColor: '#FFCC00',
        lineWidth: 4,
        linePatternDx: 0,
        shadowBlur: 10,
        shadowColor: "#FFCC00",
      },
      properties: {
        altitude: heights.slice(sliceNum, heights.length-1)
      }
    }).addTo(layer);
  }

  //区划案件统计
  loadAreaCaseCount() {
    this.getDataByType("street", streetData => {
      
    })
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
      // let light = new THREE.DirectionalLight(0xffffff, 2);
      // light.position.set(0, -10, 10);
      // scene.add(light);
      // //点光源
      // let pl = new THREE.PointLight(0xffffff, 2, 0);
      // camera.add(pl);
      let ambientLight = new THREE.AmbientLight(0xbbbbbb);
      scene.add(ambientLight);

      let directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      scene.add(directionalLight);
      var r = "http://stemkoski.github.io/Three.js/images/dawnmountain-";
      var urls = [
          r + "xpos.png",
          r + "xneg.png",
          r + "ypos.png",
          r + "yneg.png",
          r + "zpos.png",
          r + "zneg.png"
      ];

      var textureCube = new THREE.CubeTextureLoader().load(urls);

      // scene.background = textureCube;
      //   scene.rotation.x = -Math.PI / 2;
      this.initBloom();
      this.setRendererRenderScene();
    };
    this.threeLayer.addTo(this.Map);
  }

  //旋转圆环效果
  loadAroundCircle(coord) {
    let radius = 7400;
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

  getCircleMaterial(type) {
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

  //案件分析
  areaAnalysis() {
    let layer = this.getLayer("areaLayer");
    layer.bringToBack();
    this.getDataByType("area", areaData => {
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
    const height = 550;
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
          altitude: height / 2,
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
    // let altitude = this.toThreeZ(550);
    let layer = this.getLayer("asda");
    this.getDataByType("street", streetData => {
      streetData.forEach(item => {
        let attr = item.attributes;
        attr.altitude = 300
        new maptalks.LineString(item.coordinates, {
          symbol: {
            lineColor: "#fff",
            linewidth: 4,
            shadowBlur: 8,
            shadowColor: "#fff"
          },
          properties: attr
        }).addTo(layer);
        let poly = new maptalks.Polygon(item.coordinates, {
          symbol: {
            polygonFill: "#FF9C00",
            polygonOpacity: 0.01,
            lineOpacity: 0,
          },
          properties: attr
        }).addTo(layer).on("click", e=>{
          this.areaClick(e.target)
        })
        let html = `
        <div class="amap_areaName">
          ${item.attributes.JDNAME}
        </div>`;
        let options = {
          single: false,
          custom: true,
          autoPan: true,
          content: html
        };
        new maptalks.ui.InfoWindow(options).addTo(poly).show()
      })
    })
  }

  areaClick(graphic) {
    let layer = this.getLayer("areasInfoLayer");
    layer.clear();
    new maptalks.Polygon(graphic.getCoordinates(), {
      symbol: {
        polygonFill: "#FF9C00",
        polygonOpacity: 0.3,
        lineColor: "#FF9C00",
        linewidth: 2,
        lineOpacity: 0
      },
      properties: {
        altitude: 500
      }
    }).addTo(layer)
    new maptalks.LineString(graphic.getCoordinates()[0], {
      symbol: {
        lineColor: "#FF9C00",
        linewidth: 2,
        lineOpacity: 1,
        shadowBlur: 10,
        shadowColor: "#955B00",
        shadowOffsetY: 10
      },
      properties: {
        altitude: 500
      }
    }).addTo(layer)
    new maptalks.Polygon(graphic.getCoordinates(), {
      symbol: {
        polygonFill: "#FF9C00",
        polygonOpacity: 0.6,
        lineColor: "#FF9C00",
        linewidth: 2
      },
      properties: {
        altitude: 700
      }
    }).addTo(layer)
  }

  
  /**
   * 读取水域数据
   * @param {*} call 
   */
   loadWaterData(call) {
     
    this.getDataByType("water", waterData => {
      this.addWater(waterData);
      call && call();
    })
  }
  /**
   * 加载水域
   * @param {*} data 
   */
  addWater(data) {
    let layer = this.getLayer("baseLayer");
    layer.bringToBack();
    let polygons = [];
    data.forEach(item => {
      let rings = item.coordinates;
      let polygon = new maptalks.Polygon(rings, {
        symbol: {
          polygonFill: this.colors.water,
          lineOpacity: 0
        }
      });
      polygon.setProperties(item.attributes);
      polygons.push(polygon);
    });
    layer.addGeometry(polygons)
  }
  /**
   * 读取道路面数据
   * @param {*} call 
   */
  loadRoadData(call) {
    this.getDataByType("road2", roadData => {
      this.addRoad(roadData);
      call && call();
    })
  }
  /**
   * 加载道路面
   * @param {*} data 
   */
  addRoad(data) {
    let layer = this.getLayer("baseLayer");
    let polygons = [];
    data.forEach(item => {
      let rings = item.coordinates;
      let polygon = new maptalks.Polygon(rings, {
        symbol: {
          polygonFill: this.colors.road,
          polygonOpacity: 0.3,
          lineOpacity: 0
        }
      });
      polygon.setProperties(item.attributes);
      polygons.push(polygon);
    });
    layer.addGeometry(polygons)
  }

  loadLanduse(call) {
    this.getDataByType("greenLand", roadData => {
      this.addLanduse(roadData);
      call && call();
    })
  }
  
  addLanduse(data) {
    let layer = this.getLayer("baseLayer");
    let polygons = [];
    data.forEach(item => {
      let rings = item.coordinates;
      let polygon = new maptalks.Polygon(rings, {
        symbol: {
          polygonFill: this.colors.landuse,
          polygonOpacity: 0.5,
          lineOpacity: 0
        }
      });
      polygon.setProperties(item.attributes);
      polygons.push(polygon);
    });
    layer.addGeometry(polygons)
  }

  loadBuild(call) {
    if (window.build2dMeshes && window.build2dMeshes.length) {
      window.build2dMeshes.forEach(mesh => {
        mesh.show();
        this.threeLayer.addMesh(mesh)
      })
    }
    if (window.buildMeshes && window.buildMeshes.length) {
      this.buildMeshes = window.buildMeshes;
      this.buildMeshes.forEach(mesh => {
        // mesh.hide();
        this.threeLayer.addMesh(mesh)
      })
      call && call()
      return;
    }
    window.buildMeshes = [];
    this.getDataByType("house", data => {
      let polygons = [];
      data.forEach((item, i) => {
        let rings = item.coordinates;
        let polygon = new maptalks.Polygon(rings);
        let prop = item.attributes;
        prop.height = prop["HEIGHT"]
        polygon.setProperties(prop);
        if(i % 3 == 0)
          polygons.push(polygon);
      });
      //原建筑加载
      let buildMesh = this.addBuilding(polygons);
      this.buildMeshes.push(buildMesh);
      window.buildMeshes.push(buildMesh)
    })
  }
  
  addBuilding(polygons) {
    const texture = new THREE.TextureLoader().load(
      require("./img/texture_09.png")
    );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(2, 4)
    let material2 = this.textureBuildMaterial({
      color: "#fff",
      texture: texture,
      opacity: 0.7
    });
    let mesh = this.threeLayer.toExtrudePolygons(
      polygons, {
        topColor: "#fff",
        interactive: false
      },
      material2
    );
    // mesh.hide();
    this.topDeal(mesh, "#fff")
    this.threeLayer.addMesh(mesh);
    return mesh;
  }

  
  topDeal(mesh, topColor) {
    topColor = new THREE.Color(topColor);
    const bufferGeometry = mesh.getObject3d().geometry;
    const geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);
    const {
      vertices,
      faces,
      faceVertexUvs
    } = geometry;
    for (let i = 0, len = faces.length; i < len; i++) {
      const {
        a,
        b,
        c
      } = faces[i];
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

  gethalveCoords(c1, c2, total) {
    let arr = [];
    for (var i = 0; i < total; i++) {
      let cc = [c1[0] + i * (c2[0] - c1[0]) / total, c1[1] + i * (c2[1] - c1[1]) / total]
      arr.push(cc)
    }
    // console.log(JSON.stringify(arr));
    return arr;
  }

  textureBuildMaterial(opts = {}) {
    let uniforms = {
      time: {
        type: "f",
        value: 0
      },
      convert: {
        type: "f",
        value: opts.convert || 0
      },
      color: {
        type: "c",
        value: new THREE.Color(opts.color || "#0099FF")
      },
      opacity: {
        type: "f",
        value: opts.opacity || 1
      },
      map: {
        type: "t",
        value: opts.texture
      }
    };
    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      defaultAttributeValues: {},
      vertexShader: `
      precision lowp float;
      precision lowp int;
      varying vec2 vUv;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `,
      fragmentShader: `
      precision lowp float;
      precision lowp int;
      uniform float time;
      uniform float convert;
      uniform sampler2D map;
      uniform float opacity;
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
          vec2 uv = vUv;
          if(time==0.0)
              gl_FragColor = texture2D(map, vec2(uv.x, uv.y));
          else {
              if(convert==1.0)
                  gl_FragColor = texture2D(map, vec2(fract(-uv.x - time), uv.y));
              else
                  gl_FragColor = texture2D(map, vec2(fract(uv.x - time), uv.y));
          }
          // gl_FragColor.rgb *= color;
          // gl_FragColor.a *= opacity;
      }
      `,
    });
    return material;
  }

  //获取线的每个点的高度值
  getArcPoints(lineString, height, layer, count) {
    const lnglats = [];
    if (Array.isArray(lineString)) {
      lnglats.push(lineString[0], lineString[lineString.length - 1]);
    } else if (lineString instanceof maptalks.LineString) {
      const coordinates = lineString.getCoordinates();
      lnglats.push(coordinates[0], coordinates[coordinates.length - 1]);
    }
    const [first, last] = lnglats;
    let center;
    if (Array.isArray(first)) {
      center = [first[0] / 2 + last[0] / 2, first[1] / 2 + last[1] / 2];
    } else if (first instanceof maptalks.Coordinate) {
      center = [first.x / 2 + last.x / 2, first.y / 2 + last.y / 2];
    }
    const centerPt = layer.coordinateToVector3(lineString.getCenter());
    const v = layer.coordinateToVector3(first).sub(centerPt);
    const v1 = layer.coordinateToVector3(last).sub(centerPt);
    const vh = layer.coordinateToVector3(center, height).sub(centerPt);
    const ellipse = new THREE.CatmullRomCurve3([v, vh, v1], false, "centripetal"); //原类型-catmullrom
    const points = ellipse.getPoints(count||100);//原值40
    return points;
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
        enableAltitude: true,
        enableSimplify: false
      }).addTo(this.Map)) //创建图层
    return layer;
  }
  getThreeLayer(layerid, callFun) {
    let layer = this.Map.getLayer(layerid);
    layer && layer.remove();
    layer = new ThreeLayer(layerid, {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true,
      enableSimplify: false
    });
    layer.prepareToDraw = function (gl, scene, camera) {
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
    layer.addTo(this.Map);
    setTimeout(() => {
      callFun && callFun(layer);
    });
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
    queryApi.getServiceData({
      where: "1=1"
    }, url, result => {
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
      house: houseUrl,
      road: roadUrl,
      road2: roadUrl2,
      greenLand: greenLandUrl,
      water: waterUrl
    };
    return urls[type];
  }

}
export default new mapApi();