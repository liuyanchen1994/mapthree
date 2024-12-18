<template>
  <div ref="box" class="mapcontent"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import axios from "axios";

var scene,
  controls,
  clock,
  // material,
  stats,
  renderer,
  camera,
  ambientLight,
  directionalLight;
var group = new THREE.Group();
var lineGroup = new THREE.Group();
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
      lineColor: "#00D8FF"
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
    document.removeEventListener("mousemove", this.handleMousemove, false);
  },
  mounted() {
    this.raycaster = new THREE.Raycaster();
    this.previousObj = { material: [{ color: new THREE.Color(0x0000ff) }] };
    this.initThree();
    this.drawMap();
    window.onresize = function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    this.$nextTick(() => {
      document.addEventListener("mousemove", this.handleMousemove, false);
    });
  },
  methods: {
    initThree() {
      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      this.$refs.box.appendChild(stats.domElement);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(this.bgColor);
      renderer.shadowMap.enabled = true;

      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(0, -55, 60); // y pitch

      controls = new OrbitControls(camera, renderer.domElement);
      clock = new THREE.Clock();

      scene = new THREE.Scene();

      ambientLight = new THREE.AmbientLight(0xbbbbbb);
      scene.add(ambientLight);

      directionalLight = new THREE.DirectionalLight(0x666666);
      // directionalLight.position.set(0, -70, 50);
      directionalLight.position.set(10, -80, 100);

      const distance = 200;
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.left = -distance;
      directionalLight.shadow.camera.right = distance;
      directionalLight.shadow.camera.top = distance;
      directionalLight.shadow.camera.bottom = -distance;
      directionalLight.shadow.camera.near = 0;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048;

      let lightHelper = new THREE.DirectionalLightHelper(
        directionalLight,
        1,
        "red"
      );
      scene.add(lightHelper);
      scene.add(directionalLight);

      let groundGeom = new THREE.PlaneBufferGeometry(500, 500);
      let groundMate = new THREE.MeshPhongMaterial({
        color: 0xdddddd
      });
      let ground = new THREE.Mesh(groundGeom, groundMate);
      // ground.position.y = -0.1;
      ground.position.set(0, 0, -5);
      ground.rotateX = 90;
      ground.receiveShadow = true;
      scene.add(ground);
    },
    drawMap() {
      axios
        .get(`./data/china.json`, {
          responseType: "json"
        })
        .then(res => {
          let result = res.data;
          result.features.forEach(worldItem => {
            worldItem.geometry.coordinates.forEach(worldChildItem => {
              worldChildItem.forEach(countryItem => {
                this.drawExtrude(this.drawShape(countryItem));
                this.drawLine(countryItem);
              });
            });
          });
          group.scale.y = 1.2;
          scene.add(group);
          lineGroup.scale.y = 1.2;
          scene.add(lineGroup);
          this.render();
          document.getElementById("loading").style.display = "none";
        });
    },
    drawShape(posArr) {
      var shape = new THREE.Shape();
      shape.moveTo(posArr[0][0] - this.offsetX, posArr[0][1] - this.offsetY);
      posArr.forEach(item => {
        shape.lineTo(item[0] - this.offsetX, item[1] - this.offsetY);
      });
      return shape;
    },
    drawLine(posArr) {
      // let geometry1 = new THREE.Geometry();
      let pointArr = [];
      let geometry = new LineGeometry();
      posArr.forEach(item => {
        let vec = new THREE.Vector3(
          item[0] - this.offsetX,
          item[1] - this.offsetY,
          1.01
        );
        pointArr.push(vec.x, vec.y, vec.z);
      });
      geometry.setPositions(pointArr);
      let material = new LineMaterial({
        linewidth: 2,
        color: this.lineColor,
        linecap: "round"
      });
      material.resolution.set(
        window.innerWidth + 100,
        window.innerHeight + 100
      ); //这句如果不加宽度仍然无效
      let line1 = new Line2(geometry, material);
      lineGroup.add(line1);
      // lineGroup.add(line2);
    },
    drawExtrude(shapeObj) {
      var geometry = new THREE.ExtrudeGeometry(shapeObj, this.options);
      var material1 = new THREE.MeshPhongMaterial({
        color: this.topColor,
        specular: this.topColor
      });
      var material2 = new THREE.MeshBasicMaterial({
        color: this.sideColor
      });
      let shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2]);
      shapeGeometryObj.name = "board";
      shapeGeometryObj.castShadow = true;
      group.add(shapeGeometryObj);
    },
    handleMousemove(event) {
      event.preventDefault();
      let mouse = new THREE.Vector2(0, 0);
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(mouse, camera);
      let intersects = this.raycaster.intersectObjects(group.children);
      this.previousObj.material[0].color = new THREE.Color(this.topColor);
      if (intersects[0] && intersects[0].object) {
        intersects[0].object.material[0].color = new THREE.Color(0xffaa00);
        this.previousObj = intersects[0].object;
      }
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
