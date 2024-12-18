<template>
    <div ref="box" id="box"></div>
</template>

<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SceneUtils } from "three/examples/jsm/utils/SceneUtils";
import { Clock, Vector3 } from "three";
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
  params,
  box,
  sphere,
  time = 0,
  box3,
  sphereBox3;
export default {
  name: "box3",
  methods: {
    initThree() {
      stats = new Stats();
      stats.setMode(0);
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
      camera.position.set(20, 30, 60);

      controls = new OrbitControls(camera, renderer.domElement);
      clock = new THREE.Clock();

      scene = new THREE.Scene();

      var helper = new THREE.AxesHelper(20);
      scene.add(helper);

      ambientLight = new THREE.AmbientLight(0xbbbbbb);
      scene.add(ambientLight);

      directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      scene.add(directionalLight);

      this.setBox3();
    },
    setBox3() {
      var boxGeometry = new THREE.BoxGeometry(30, 30, 30);
      var sphereGoemetry = new THREE.SphereGeometry(6, 30, 20);
      var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      box = this.setMaterial(boxGeometry, 0x0000ff);
      box3 = new THREE.Box3().setFromObject(box);
      sphere = new THREE.Mesh(sphereGoemetry, sphereMaterial);
      scene.add(box);
      scene.add(sphere);

      this.render();
      document.getElementById("loading").style.display = "none";
    },
    setMaterial(goemetry, color) {
      color = color ? color : 0x00ff00;
      var material1 = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2
      });
      var material2 = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true
      });
      return SceneUtils.createMultiMaterialObject(goemetry, [
        material1,
        material2
      ]);
    },
    render() {
      stats.update();
      sphere.position.y = Math.sin(time) * 16 + 10;
      sphere.position.x = Math.cos(time) * 16 + 10;
      time = time + 0.02;
      sphereBox3 = new THREE.Box3().setFromObject(sphere);
      if (box3.containsBox(sphereBox3)) {
        sphere.material.color = new THREE.Color(0x00ff00);
      } else if (box3.intersectsBox(sphereBox3)) {
        sphere.material.color = new THREE.Color(0xff00ff);
      } else {
        sphere.material.color = new THREE.Color(0xffaa00);
      }
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
