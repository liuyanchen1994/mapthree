<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { Clock } from "three";
var renderer,
  camera,
  scene,
  controls,
  stats,
  clock,
  ambientLight,
  directionalLight,
  globalID,
  gui,
  params;
export default {
  name: "gui",
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
      renderer.setClearColor(0x000000);
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

      this.initGui();
    },
    initGui() {
      gui = new GUI();

      var objGeometry, geometry, pointsMaterial, points;

      var params = new function() {
        this.color = 0x00ff00;
        this.length = 10;
        this.size = 0.3;
        this.state = "sphere";
        this.states = ["sphere", "cube"];
        this.visible = true;
      }();

      gui.addColor(params, "color").onChange(e => {
        pointsMaterial.color.set(e);
      });
      gui.add(params, "length", 8, 30).onChange(e => {
        if (params.state == "sphere") {
          objGeometry = new THREE.SphereGeometry(e, 30, 18);
        } else {
          objGeometry = new THREE.BoxGeometry(
            params.length * 1.5,
            params.length * 1.5,
            params.length * 1.5,
            10,
            10,
            10
          );
        }
        points.geometry.vertices = objGeometry.vertices;
        points.geometry.verticesNeedUpdate = true;
      });
      gui.add(params, "size", 0.1, 1).onChange(e => {
        pointsMaterial.size = e;
      });
      gui
        .add(params, "state")
        .options(params.states)
        .onChange(e => {
          scene.remove(scene.getObjectByName("points"));
          if (e == "sphere") {
            objGeometry = new THREE.SphereGeometry(params.length, 30, 18);
          } else {
            objGeometry = new THREE.BoxGeometry(
              params.length * 1.5,
              params.length * 1.5,
              params.length * 1.5,
              10,
              10,
              10
            );
          }
          geometry = new THREE.Geometry();
          geometry.vertices = objGeometry.vertices;
          points = new THREE.Points(geometry, pointsMaterial);
          points.name = "points";
          scene.add(points);
        });
      gui.add(params, "visible").onChange(e => {
        points.visible = e;
      });
      console.log(gui);
      objGeometry = new THREE.SphereGeometry(params.length, 30, 18);
      geometry = new THREE.Geometry();
      geometry.vertices = objGeometry.vertices;
      pointsMaterial = new THREE.PointsMaterial({
        color: params.color,
        size: 0.2
      });
      points = new THREE.Points(geometry, pointsMaterial);
      points.name = "points";
      scene.add(points);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    render() {
      stats.update();
      controls.update(clock.getDelta());
      renderer.render(scene, camera);
      this.globalID = requestAnimationFrame(this.render);
    }
  },
  mounted() {
    this.initThree();
    window.onresize = () => {
      camera.aspect = this.$refs.box.clientWidth / this.$refs.box.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(this.$refs.box.clientWidth, this.$refs.box.clientHeight);
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
    document
      .getElementsByClassName("ac")[0]
      .removeChild(document.getElementsByClassName("main")[0]);
    cancelAnimationFrame(this.globalID);
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
