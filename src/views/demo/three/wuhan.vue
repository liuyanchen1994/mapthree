<template>
  <div ref="box" class="mapcontent"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import axios from "axios";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

import { mergeBufferGeometries } from "maptalks.three/dist/util/MergeGeometryUtil";

import { getProjection, createPolygonShape } from "./js/geo";

var scene,
  controls,
  clock,
  gui,
  stats,
  renderer,
  camera,
  ambientLight,
  directionalLight2,
  directionalLight,
  spotLight;
var mapData;
export default {
  name: "china-map",
  data() {
    return {
      offsetX: 104,
      offsetY: 29,
      bgColor: "#010A2B",
      worldGeometry: {},
      globalID: null,
      options: {
        depth: 1, // 定义图形拉伸的深度，默认100
        steps: 0, // 拉伸面方向分为多少级，默认为1
        bevelEnabled: true, // 表示是否有斜角，默认为true
        bevelThickness: 0, // 斜角的深度，默认为6
        bevelSize: 0, // 表示斜角的高度，高度会叠加到正常高度
        bebelSegments: 0, // 斜角的分段数，分段数越高越平滑，默认为1
        curveSegments: 0 // 拉伸体沿深度方向分为多少段，默认为1
      },
      topColor: "#00216A",
      sideColor: "#011245",
      lineColor: "#00D8FF",
      colors: {
        ground: "#42586f",
        landuse: "#DAE0E4",
        road: "#acd0e1",
        road2: "#5C6E8A",
        // build: "#E8E1E8",
        build: "#e9e5e6",
        water: "#7FBFDC"
      },
      rendererOrder: {
        ground: 0,
        landuse: 1,
        water: 2,
        road: 3,
        build: 4
      },
      meshZ: {
        landuse: 0.0001,
        water: 0.0002
      },
      shadows: {
        landuse: {
          showShadow: false,
          receiveShadow: true
        },
        water: {
          showShadow: false,
          receiveShadow: false
        },
        road: {
          showShadow: true,
          receiveShadow: true
        },
        build: {
          showShadow: true,
          receiveShadow: false
        }
      }
    };
  },
  beforeDestroy() {
    renderer.forceContextLoss();
    renderer = null;
    scene = null;
    controls = null;
    clock = null;
    stats = null;
    renderer = null;
    camera = null;
    ambientLight = null;
    directionalLight = null;
    cancelAnimationFrame(this.globalID);
  },
  mounted() {
    // 初始化3D环境
    this.initEnvironment();
    // 构建光照系统
    this.buildLightSystem();
    //
    this.initGui();

    // 构建辅助系统
    // this.buildAuxSystem();
    //初始化地面
    this.initGround();
    //加载用地
    this.loadLanduse(() => {
      // return;
      //加载水域
      this.loadWater();
      //加载道路
      //加载建筑
      this.loadBuild();
    });

    window.addEventListener("resize", this.onWindowResize, false);
  },
  methods: {
    loadLanduse(call) {
      axios
        .get(`./hangzhou/WuHan.geojson`, {
          responseType: "json"
        })
        .then(res => {
          mapData = res.data;
          const data = res.data.features.filter(
            x =>
              x.properties.hasOwnProperty("landuse") &&
              x.geometry.type == "MultiPolygon"
          );
          let json = {
            type: "FeatureCollection",
            features: data
          };
          let type = "landuse";
          this.drawGeometry(json, type);
          call && call();
        });
    },
    loadWater() {
      const data = mapData.features.filter(
        x =>
          x.properties.hasOwnProperty("waterway") ||
          x.properties.hasOwnProperty("water")
      );
      let json = {
        type: "FeatureCollection",
        features: data
      };
      let type = "water";
      this.drawGeometry(json, type);
    },
    loadBuild() {
      const data = mapData.features.filter(
        x =>
          x.properties.hasOwnProperty("building") &&
          x.geometry.type == "MultiPolygon"
      );
      let json = {
        type: "FeatureCollection",
        features: data
      };
      let type = "build";
      this.drawGeometry(json, type);
    },
    drawGeometry(json, type) {
      var width = window.innerWidth;
      var height = window.innerHeight;
      if (json.type === "FeatureCollection") {
        var projection = getProjection(json, width, height);

        var ExtrudeGeometrys = [];
        json.features.forEach(feature => {
          var geometrys = this.addFeature(feature, projection, type);
          // feature._group = group;
          // groups.push(group);
          geometrys.forEach(geo => {
            ExtrudeGeometrys.push(geo);
          });
        });
        let geometry = new THREE.Geometry();
        ExtrudeGeometrys.forEach(geo => {
          THREE.GeometryUtils.merge(geometry, geo);
          // if (geometry) {
          //   geometry = geometry.merge(ExtrudeGeometrys[index]);
          // } else {
          //   geometry = ExtrudeGeometrys[index].merge(
          //     ExtrudeGeometrys[index + 1]
          //   );
          // }
        });
        let materialFun = this.getMaterials();
        var mesh = new THREE.Mesh(
          geometry,
          materialFun["phong"](this.colors[type])
        );
        mesh.scale.set(50, 50, 50);
        mesh.rotation.x = Math.PI;
        mesh.position.z = this.meshZ[type] || 0;
        mesh.renderOrder = this.rendererOrder[type];
        mesh.castShadow = this.shadows[type].showShadow;
        mesh.receiveShadow = this.shadows[type].receiveShadow;
        scene.add(mesh);
      } else if (json.type === "Topology") {
        // var geojson = topojson.merge(
        //   json,
        //   json.objects[Object.keys(json.objects)[0]].geometries
        // );
        // var projectionT = getProjection(geojson, width, height);
        // Object.keys(json.objects).forEach(key => {
        //   json.objects[key].geometries.forEach(object => {
        //     var feature = topojson.feature(json, object);
        //     var group = this.addFeature(feature, projectionT, type);
        //     object._group = group;
        //   });
        // });
      } else {
        console.log(
          "This tutorial only renders TopoJSON and GeoJSON FeatureCollections"
        );
      }
      this.render();
    },
    addFeature(feature, projection, type) {
      var geometrys = [];
      var amount;

      try {
        amount = -0.0001;
        if (type == "build") {
          if (feature.properties.hasOwnProperty("height"))
            amount = -feature.properties.height / 20000;
          if (feature.properties.hasOwnProperty("building:levels"))
            amount = -feature.properties["building:levels"] / 20000;
        }
      } catch (err) {
        console.log(err);
      }

      var extrudeSettings = {
        depth: amount,
        bevelEnabled: false
      };
      if (feature.geometry.type === "Polygon") {
        var shape = createPolygonShape(
          feature.geometry.coordinates,
          projection
        );

        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometrys.push(geometry);
      } else if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach(polygon => {
          var shape = createPolygonShape(polygon, projection);
          var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          geometrys.push(geometry);
        });
      } else {
        console.log("This tutorial only renders Polygons and MultiPolygons");
      }

      return geometrys;
    },
    addShape(
      group,
      shape,
      extrudeSettings,
      material,
      color,
      x,
      y,
      z,
      rx,
      ry,
      rz,
      s,
      showShadow,
      receiveShadow
    ) {
      var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      let materialFun = this.getMaterials();
      var mesh = new THREE.Mesh(geometry, materialFun[material](color));

      // Add shadows
      mesh.castShadow = showShadow;
      mesh.receiveShadow = receiveShadow;

      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.scale.set(s, s, s);
      group.add(mesh);
    },
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      controls.handleResize();
      this.render();
    },
    // 初始化3D环境
    initEnvironment() {
      // this.raycaster = new THREE.Raycaster();

      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);

      // Renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(this.bgColor);
      // Shadows
      renderer.shadowMap.enabled = true;
      this.$refs.box.appendChild(renderer.domElement);

      this.setCamera();

      clock = new THREE.Clock();

      // World
      scene = new THREE.Scene();
    },
    initGui() {
      var params = {
        directLight_x: directionalLight.position.x,
        directLight_y: directionalLight.position.y,
        directLight_z: directionalLight.position.z,
        directLight2_x: directionalLight2.position.x,
        directLight2_y: directionalLight2.position.y,
        directLight2_z: directionalLight2.position.z
      };

      gui = new GUI();

      gui.add(params, "directLight_x", -360, 360).onChange(function() {
        directionalLight.position.x = params.directLight_x;
      });
      gui.add(params, "directLight_y", -360, 360).onChange(function() {
        directionalLight.position.y = params.directLight_y;
      });
      gui.add(params, "directLight_z", -200, 500).onChange(function() {
        directionalLight.position.z = params.directLight_z;
      });
      gui.add(params, "directLight2_x", -360, 360).onChange(function() {
        directionalLight2.position.x = params.directLight2_x;
      });
      gui.add(params, "directLight2_y", -360, 360).onChange(function() {
        directionalLight2.position.y = params.directLight2_y;
      });
      gui.add(params, "directLight2_z", -200, 500).onChange(function() {
        directionalLight2.position.z = params.directLight2_z;
      });
    },
    // 初始化相机
    setCamera() {
      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      // camera.position.set(0, -55, 60); // y pitch
      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxPolarAngle = Math.PI * 2;
      controls.minPolarAngle = Math.PI / 2;
      // controls.minDistance = 7;
      // controls.maxDistance = 5000;
    },
    // 初始化光照系统
    buildLightSystem() {
      // Lights
      directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(-57, -65, 152);
      directionalLight.position.multiplyScalar(1.3);
      const d = 100;
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.left = -d;
      directionalLight.shadow.camera.right = d;
      directionalLight.shadow.camera.top = d;
      directionalLight.shadow.camera.bottom = -d;
      // directionalLight.shadow.camera.near = 0;
      directionalLight.shadow.camera.far = 4000;
      directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height =
        512 * 10;
      scene.add(directionalLight);

      ambientLight = new THREE.AmbientLight(0x333333);
      scene.add(ambientLight);

      directionalLight2 = new THREE.DirectionalLight(0x666666);
      directionalLight2.position.set(-73, -88, 50);
      scene.add(directionalLight2);
    },
    buildAuxSystem() {
      let lightHelper = new THREE.DirectionalLightHelper(
        directionalLight,
        1,
        "red"
      );
      scene.add(lightHelper);

      let axisHelper = new THREE.AxesHelper(2000);
      scene.add(axisHelper);

      let gridHelper = new THREE.GridHelper(600, 60);
      scene.add(gridHelper);
    },
    initGround() {
      let groundGeom = new THREE.PlaneBufferGeometry(1000, 1000);
      let groundMate = new THREE.MeshPhongMaterial({
        color: this.colors.ground,
        side: THREE.DoubleSide
      });
      let ground = new THREE.Mesh(groundGeom, groundMate);
      // ground.position.set(0, 0, 0.0002);
      ground.receiveShadow = true;
      ground.renderOrder = this.rendererOrder.ground;
      scene.add(ground);
    },
    getMaterials() {
      return {
        phong: function(color) {
          return new THREE.MeshPhongMaterial({
            color: color,
            side: THREE.DoubleSide
            //	phong : new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x000000, shininess: 60, shading: THREE.SmoothShading, transparent:true  }),
          });
        },
        meshLambert: function(color) {
          return new THREE.MeshLambertMaterial({
            color: color,
            specular: 0x009900,
            shininess: 30,
            shading: THREE.SmoothShading,
            transparent: true
          });
        },
        meshWireFrame: function(color) {
          return new THREE.MeshBasicMaterial({
            color: color,
            specular: 0x009900,
            shininess: 30,
            shading: THREE.SmoothShading,
            wireframe: true,
            transparent: true
          });
        },
        meshBasic: function(color) {
          return new THREE.MeshBasicMaterial({
            color: color,
            specular: 0x009900,
            shininess: 30,
            shading: THREE.SmoothShading,
            transparent: true
          });
        }
      };
    },
    render() {
      stats.update();
      controls.update(clock.getDelta());
      renderer.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  }
};
</script>

<style lang="less">
.mapcontent {
  height: 100%;
  width: 100%;
}
</style>
