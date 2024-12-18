<template>
  <div ref="box" class="mapcontent"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { SceneUtils } from "three/examples/jsm/utils/SceneUtils";
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
      bgColor: 0x131a2c,
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
      }
    };
  },
  beforeDestroy() {
    renderer.forceContextLoss();
    renderer = null;
    scene = null;
    controls = null;
    clock = null;
    material = null;
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
      renderer.setClearColor(0x041336);
      this.$refs.box.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(0, 0, 60);

      controls = new OrbitControls(camera, renderer.domElement);
      clock = new THREE.Clock();

      scene = new THREE.Scene();

      ambientLight = new THREE.AmbientLight(0xbbbbbb);
      scene.add(ambientLight);

      directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      scene.add(directionalLight);
    },
    drawMap() {
      axios
        .get(`./data/china.json`, {
          responseType: "json"
        })
        .then(res => {
          let result = res.data;
          result.features.forEach((worldItem, worldItemIndex) => {
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
      let geometry1 = new THREE.Geometry();
      let geometry2 = new THREE.Geometry();
      posArr.forEach(item => {
        geometry1.vertices.push(
          new THREE.Vector3(
            item[0] - this.offsetX,
            item[1] - this.offsetY,
            1.01
          )
        );
        geometry2.vertices.push(
          new THREE.Vector3(
            item[0] - this.offsetX,
            item[1] - this.offsetY,
            -0.01
          )
        );
      });
      let lineMaterial = new THREE.LineBasicMaterial({ color: 0x008bfb });
      let line1 = new THREE.Line(geometry1, lineMaterial);
      let line2 = new THREE.Line(geometry2, lineMaterial);
      lineGroup.add(line1);
      lineGroup.add(line2);
    },
    drawExtrude(shapeObj) {
      var geometry = new THREE.ExtrudeGeometry(shapeObj, this.options);
      var material1 = new THREE.MeshPhongMaterial({
        color: this.bgColor,
        specular: this.bgColor
      });
      var material2 = new THREE.MeshBasicMaterial({
        color: 0x008bfb
      });
      let shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2]);
      shapeGeometryObj.name = "board";
      group.add(shapeGeometryObj);
    },
    handleMousemove(event) {
      event.preventDefault();
      let mouse = new THREE.Vector2(0, 0);
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(mouse, camera);
      let intersects = this.raycaster.intersectObjects(group.children);
      this.previousObj.material[0].color = new THREE.Color(this.bgColor);
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
