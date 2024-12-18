<template>
    <div id="container">
        <div ref="box1" id="box1">
            <p>EllipseCurve曲线</p>
        </div>
        <div ref="box2" id="box2">
            <p>LineCurve3曲线</p>
        </div>
        <div ref="box3" id="box3">
             <p>CubicBezierCurve3曲线</p>
        </div>
        <div ref="box4" id="box4">
             <p>CatmullRomCurve3曲线</p>
        </div>
    </div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
var rendererArray = [],
  cameraArray = [],
  lineArray = [],
  boxArray = [],
  sceneArray = [],
  controls = [],
  material,
  stats,
  clock;
export default {
  name: "curve曲线",
  methods: {
    initThree() {
      boxArray[0] = this.$refs.box1;
      boxArray[1] = this.$refs.box2;
      boxArray[2] = this.$refs.box3;
      boxArray[3] = this.$refs.box4;

      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      boxArray[0].appendChild(stats.domElement);

      boxArray.forEach((d, i) => {
        rendererArray[i] = new THREE.WebGLRenderer({ antialias: true });
        rendererArray[i].setPixelRatio(window.devicePixelRatio);
        rendererArray[i].setSize(d.clientWidth, d.clientHeight);
        rendererArray[i].setClearColor(0x041336);
        d.appendChild(rendererArray[i].domElement);

        cameraArray[i] = new THREE.PerspectiveCamera(
          60,
          d.clientWidth / d.clientHeight,
          0.1,
          10000
        );
        cameraArray[i].position.set(40, 40, 40);
        cameraArray[i].lookAt(0, 0, 0);

        sceneArray[i] = new THREE.Scene();
        let helper = new THREE.AxesHelper(20);
        sceneArray[i].add(helper);

        controls[i] = new OrbitControls(
          cameraArray[i],
          rendererArray[i].domElement
        );
      });
      clock = new THREE.Clock();

      this.drawLine();
    },
    drawLine() {
      var geometry = new THREE.Geometry();
      var curve = new THREE.EllipseCurve(0, 0, 10, 20);
      var points = curve.getPoints(100);
      geometry.setFromPoints(points);
      var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      lineArray[0] = new THREE.Line(geometry, material);
      sceneArray[0].add(lineArray[0]);

      var geometry = new THREE.Geometry();
      var curve = new THREE.LineCurve3(
        new THREE.Vector3(10, 20, 10),
        new THREE.Vector3(-10, -20, -10)
      );
      var points = curve.getPoints(100);
      geometry.setFromPoints(points);
      var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      lineArray[1] = new THREE.Line(geometry, material);
      sceneArray[1].add(lineArray[1]);

      var geometry = new THREE.Geometry();
      var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-10, -20, -10),
        new THREE.Vector3(-10, 40, -10),
        new THREE.Vector3(10, 40, 10),
        new THREE.Vector3(10, -20, 10)
      );
      var points = curve.getPoints(100);
      geometry.setFromPoints(points);
      var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      lineArray[2] = new THREE.Line(geometry, material);
      sceneArray[2].add(lineArray[2]);

      var geometry = new THREE.Geometry();
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, -20, -10),
        new THREE.Vector3(-5, 20, -5),
        new THREE.Vector3(0, -20, 0),
        new THREE.Vector3(5, 20, 5),
        new THREE.Vector3(10, -20, 10)
      ]);
      var points = curve.getPoints(100);
      geometry.setFromPoints(points);
      var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      lineArray[3] = new THREE.Line(geometry, material);
      sceneArray[3].add(lineArray[3]);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    render() {
      stats.update();
      boxArray.forEach((d, i) => {
        controls[i].update(clock.getDelta());
        lineArray[i].rotation.y += 0.01;
        rendererArray[i].render(sceneArray[i], cameraArray[i]);
      });
      requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initThree();
    window.onresize = function() {
      boxArray.forEach((d, i) => {
        cameraArray[i].aspect =
          boxArray[i].clientWidth / boxArray[i].clientHeight;
        cameraArray[i].updateProjectionMatrix();
        rendererArray[i].setSize(
          boxArray[i].clientWidth,
          boxArray[i].clientHeight
        );
      });
    };
  }
};
</script>

<style lang="less" scope>
#container {
  width: 100%;
  height: 100%;
  background-color: #000000;
  overflow: hidden;
  position: relative;
  > div {
    display: inline-block;
    width: 50%;
    height: 50%;
    position: relative;
    p {
      position: absolute;
      color: #ffffff;
      top: 10px;
      left: 50%;
      transform: translate(-50%, 0);
    }
  }
}
</style>
